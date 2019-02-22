from flask import abort
import re
from app import mongo

################################################################################
# DB Helper Methods
################################################################################

# minimize and sort the data given to template and js in client
def render_form_data(entity, action):
    # remove or requre identification options based on entity 'ident' settings
    # 0=not possible, 1=possible, 2=required
    for k, v in entity["ident"].items():
        # TODO: find safer way of doing this
        # mode in content db: account number, identity card, billing number
        mode = action["content"]["ident"]["content"]
        if v == 0:
            del mode[k]
            # pass
        elif v == 1:
            pass
        elif v == 2:
            for i in mode[k]:
                i.update({"validation": "required"})
        else:
            pass
    # remove 'actions' from entity, beacuse it's not needed for form template
    data = remove_key(entity, "actions")
    data["action"] = action
    return data


def remove_key(d, key):
    r = dict(d)
    del r[key]
    return r


def get_doc(short=None, resolve=False):
    # get document from DB
    query = {"short": check_parameter(short, key="entity_short")}
    projection = {"_id": 0}
    doc = mongo.db.entities.find_one_or_404(query, projection)
    if resolve:
        doc = resolve_refs(doc, {})
    return doc


def get_action(doc={}, short=None):
    if check_parameter(short, key="action_short") in doc["actions"]:
        temp = doc["actions"][short]
        action = resolve_refs(temp)
        return action
    else:
        raise ValueError("Action not in Entitys 'actions'.")


# walks through every key value pair in dict and looks for "references"
# TODO: test if get_all_values() in resolver.py function is faster
def resolve_refs(doc, result={}):
    if not doc:  # fix for empty list items
        return doc
    for k, v in doc.items():
        if isinstance(v, dict) and "ref" in v:
            result[k] = get_ref_val(v["ref"])
        elif isinstance(v, dict):
            result[k] = resolve_refs(v, result.get(k, {}))
        elif isinstance(v, list):
            result[k] = [resolve_refs(d, result.get(k, {})) for d in v]
        else:
            result[k] = v
    return result


# recives "reference", queries mongodb with projection and returns dict
def get_ref_val(ref):
    ref_def = ["ref_id", "ref_coll", "include", "exclude"]
    if all(k in ref for k in ref_def):
        include = {key: 1 for key in ref["include"]}
        exclude = {key: 0 for key in ref["exclude"]}
        projection = {**include, **exclude, "_id": 0}
        query = {"_id": ref["ref_id"]}
        result = mongo.db[ref["ref_coll"]].find_one_or_404(query, projection)
        # check if key "overwrite" and overwirte values from original doc
        if "overwrite" in ref:
            for k, v in ref["overwrite"].items():
                result.update({k: v})
        return result
    else:
        raise ValueError("Wrong 'refs' Syntax: missing key.")


################################################################################
# Filter and query check up to prevent database leaks
################################################################################


def check_parameter(query=None, key="entity_short"):
    if key == "entity_short":
        return filter_short(query)
    elif key == "action_short":
        return filter_action(query)
    else:
        raise ValueError("No knowen key was given to check.")


def filter_short(short):
    # only allow 6 to 8 characters of: a-z, A-Z, 0-9, _ or -
    if re.match(r"^[\w-]{6,11}$", short):
        return short
    else:
        print("SANITIZER: {}".format(short))
        return abort(418)


def filter_action(short):
    # only allow these 9 actions currently used in database
    knowen_actions = [
        "inquiry",
        "correction",
        "restriction",
        "deletion",
        "transfer",
        "objection",
        "revocation",
        "objection_marketing",
        "automatic_profiling",
        "reminder",
    ]
    if any(short.lower() == action for action in knowen_actions):
        return short
    else:
        print("SANITIZER: {}".format(short))
        return abort(418)
