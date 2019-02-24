from flask import render_template, request, redirect, url_for, send_from_directory
from app import app, mongo
from .helper import render_form_data, get_action, get_doc

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
    projection = {"name": 1, "short": 1, "category": 1}
    sort_by = [("ranking", 1), ("name", 1)]
    entities = mongo.db.entities.find({}, projection).sort(sort_by)
    tags = mongo.db.entities.distinct("category")
    return render_template("find.html", entities=entities, query=q, tags=tags)


# ENTITY
@app.route("/entity/<short>")
def entity(short):
    doc = get_doc(short)
    return render_template("entity.html", entity=doc)


# FORM
@app.route("/entity/<short>/<action>/")
def form(short, action):
    # print(f"LOG: {action} form requested for {short}")
    doc = get_doc(short)
    act = get_action(doc, action)
    data = render_form_data(doc, act)
    return render_template("form.html", entity=data)


################################################################################
# STATIC PAGES and BLOG (later served by NGINX)
# TODO: generate pages and put in NGINX
################################################################################

# FAVICON
@app.route("/favicon.ico")
def favicon():
    return send_from_directory("static/FAVICON/", "favicon.png", mimetype="image/png")


# FOOTER
@app.route("/about")
def about():
    return redirect(url_for("blog", topic="GuideLight"))


# FOOTER
@app.route("/api")
def api():
    doc = mongo.db.website.find_one_or_404({"name": "api"}, {"_id": 0})
    cnt = doc["content"]
    return render_template("blog.html", content=cnt)


# FOOTER
@app.route("/privacy")
def privacy():
    doc = mongo.db.website.find_one_or_404({"name": "privacy"}, {"_id": 0})
    cnt = doc["content"]
    return render_template("blog.html", content=cnt)


# FOOTER
@app.route("/impressum")
def impressum():
    doc = mongo.db.website.find_one_or_404({"name": "impressum"}, {"_id": 0})
    cnt = doc["content"]
    return render_template("blog.html", content=cnt)


# BLOG
@app.route("/blog/<topic>")
def blog(topic):
    doc = mongo.db.website.find_one_or_404({"name": topic}, {"_id": 0})
    cnt = doc["content"]
    return render_template("blog.html", content=cnt)


################################################################################
# Special Functions/Pages
################################################################################
# listet alle Entities aus DB auf
@app.route("/listall")
def listall():
    # TODO: refactore mongoDB stuff!!!
    e = mongo.db.entities.distinct("name")
    return f'{"<br>".join(e)}'
