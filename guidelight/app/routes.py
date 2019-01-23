from flask import (
    render_template,
    request,
    redirect,
    url_for,
    send_from_directory,
    abort,
)
from app import app, mongo
import re

################################################################################
# PAPGES
################################################################################
# HOME
@app.route("/")
@app.route("/index")
def home():
    q = request.args.get("query")
    if q is not None:
        return redirect(url_for("search", query=q))
    else:
        return render_template("home.html")


# SEARCH
@app.route("/search")
def search():
    q = request.args.get("query")
    # TODO: refactore mongoDB stuff!!!
    entities = mongo.db.entities.find({}, {"name": 1, "short": 1})
    return render_template("find.html", entities=entities, query=q)


# ENTITY
@app.route("/entity/<short>")
def entity(short):
    return render_template("entity.html", entity=get_doc(short))


# FORM
@app.route("/entity/<short>/<action>/")
def form(short, action):
    # TODO: resolve only for action
    e = get_doc(short, resolve=True)
    # get the action in docs "actions" list by comparing short name for action
    c = next((a for a in e["actions"] if a["short"] == action), None)
    # f = [
    #     {
    #         "title": "Auskunftsanfrage",
    #         "info": "1 kurze Info zu Step 1",
    #         "type": "text",
    #         "key": "description",
    #     },
    #     {
    #         "title": "sensible Daten",
    #         "info": "2 kurze Info zu Step 2",
    #         "type": "selection",
    #         "key": "selection1",
    #     },
    #     {
    #         "title": "Identifikation",
    #         "info": "3 kurze Info zu Step 3",
    #         "type": "inputfield",
    #         "key": "inputfield1",
    #     },
    #     {
    #         "title": "Unterschrift",
    #         "info": "4 kurze Info zu Step 4",
    #         "type": "inputfield",
    #         "key": "description",
    #     },
    #     {
    #         "title": "Versandt",
    #         "info": "5 kurze Info zu Step 5",
    #         "type": "text",
    #         "key": "description",
    #     },
    # ]
    return render_template("form.html", entity=e, content=c, form=f)
    # return f'<h2> GuideLight </h2> {c} Formulargenerator für {short} <br> <br> <a href="/index">back</a>'


################################################################################
# DB Helper Methods
################################################################################
def get_doc(query=None, resolve=False):
    # get document from DB
    d = mongo.db.entities.find_one_or_404({"short": sanitize(query)})
    # looks for key:"ref" in document and adds the referenced documents
    if resolve:
        d = recursive_resolve_refs(d, {})
    return d


# walks through every key value pair in dict and looks for "references"
# TODO: test if get_all_values() in resolver.py function is faster
def recursive_resolve_refs(doc, result={}):
    for k, v in doc.items():
        if isinstance(v, dict) and "ref" in v:
            result[k] = get_ref_val(v["ref"])
        elif isinstance(v, dict):
            result[k] = recursive_resolve_refs(v, result.get(k, {}))
        elif isinstance(v, list):
            result[k] = [recursive_resolve_refs(d, result.get(k, {})) for d in v]
        else:
            result[k] = v
    return result


# recives "reference", queries mongodb with projection and returns dict
def get_ref_val(ref):
    # print(f"INSIDE GET REF VAL with: \n {ref}")
    # TODO: ref_def not necassery if JSON SCHEMA validation in mongodb online
    ref_def = ["ref_id", "ref_coll", "include", "exclude"]
    if all(k in ref for k in ref_def):
        include = {key: 1 for key in ref["include"]}
        exclude = {key: 0 for key in ref["exclude"]}
        projection = {**include, **exclude, "_id": 0}
        query = {"_id": ref["ref_id"]}
        return mongo.db[ref["ref_coll"]].find_one_or_404(query, projection)
    else:
        # TODO: Raise Exception: Wrong reference syntax; missing keys
        return {}


# cleanup short (search query)
def sanitize(short):
    # only allow 6 to 8 characters of: a-z, A-Z, 0-9, _ or -
    if re.match(r"^[\w-]{6,8}$", short):
        return short
    else:
        print("SANITIZER: {}".format(short))
        return abort(418)


################################################################################
# STATIC PAGES and BLOG (later served by NGINX)
# TODO: generate pages and put in NGINX
################################################################################
# FAVICON
@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
        "static", "favicon.ico", mimetype="image/vnd.microsoft.icon"
    )


# FOOTER
@app.route("/about")
def about():
    return f'<h2> GuideLight </h2> Footer zum Thema <i>about <br> <br> <a href="/index">back</a>'
    # return send_from_directory("temp", "about.html")


# FOOTER
@app.route("/api")
def api():
    return f'<h2> GuideLight </h2> Footer zum Thema <i>api <br> <br> <a href="/index">back</a>'
    # return send_from_directory("temp", "api.html")


# FOOTER
@app.route("/privacy")
def privacy():
    return f'<h2> GuideLight </h2> Footer zum Thema <i>privacy <br> <br> <a href="/index">back</a>'
    # return send_from_directory("temp", "privacy.html")


# FOOTER
@app.route("/impressum")
def impressum():
    return f'<h2> GuideLight </h2> Footer zum Thema <i>impressum <br> <br> <a href="/index">back</a>'
    # return send_from_directory("temp", "impressum.html")


# BLOG
@app.route("/blog/<topic>")
def blog(topic):
    return f'<h2> GuideLight </h2> Blogeintrag zum Thema <i>{topic} <br> <br> <a href="/index">back</a>'


################################################################################
# Special Functions/Pages
################################################################################
# listet alle Entities aus DB auf
@app.route("/listall")
def listall():
    # TODO: refactore mongoDB stuff!!!
    e = mongo.db.entities.distinct("name")
    return f'{"<br>".join(e)}'
