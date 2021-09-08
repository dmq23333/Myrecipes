import secrets
from app import db
from flask import request, abort


def unpack(j, *args, **kargs):
    if kargs.get("required", True):
        not_found = [arg for arg in args if arg not in j]
        if not_found:
            expected = ", ".join(map(str, not_found))
            abort(400, "Expected request object to contain in body: " + expected)
    return [j.get(arg, None) for arg in args]


def gen_token():
    curr_tk = secrets.token_hex(32)
    while db.exists("USER").where(curr_token=curr_tk):
        curr_tk = secrets.token_hex(32)
    return curr_tk


def authorize(req):
    token = req.headers.get('Authorization', None)
    if not token:
        abort(403, 'No Authorization Token Supplied')
    try:
        token = token.split(" ")[1]
    except:
        abort(400, "Authorization Token must start with 'Token '")
    if not db.exists("USER").where(curr_token=token):
        abort(403, 'Your Token is not valid')
    return db.select("USER").where(curr_token=token).execute()


def text_to_set(result_str, process_f=lambda x: x):
    if result_str is None:
        return set()
    return set([process_f(x) for x in result_str.split(",") if x != ''])


def lstSet_to_text(lst):
    return ",".join([str(x) for x in lst])


def if_num(n):
    if n:
        return n
    else:
        return 0


# format recipe from raw result by db query
# RECIPE is what db.execute returned
def format_recipe(recipe):
    comments = []
    for c_id in text_to_set(recipe[10], process_f=lambda x: int(x)):
        comment = db.select("COMMENT").where(id=c_id).execute()
        comments.append({
            "author": comment[1],
            "published": comment[2],
            "comment": comment[3]
        })
    return {
        "id": recipe[0],
        "author": recipe[1],
        "name": recipe[2],
        "ingredients": list(text_to_set(recipe[3])),
        "proportion": list(text_to_set(recipe[4])),
        "method": list(text_to_set(recipe[5])),
        "published": recipe[6],
        "likes": list(text_to_set(recipe[7], process_f=lambda x: int(x))),
        "src": recipe[8],
        "thumbnail": recipe[9],
        "comments": comments,
        "meal_type": recipe[11],
        "liked_num": recipe[12]
    }


# format user from raw result from db query
# raw_user is what db.execute returned
def format_user(raw_user):
    recipe_num = len(text_to_set(raw_user[5], process_f=lambda x: int(x)))

    return {
        "username": raw_user[1],
        "email": raw_user[2],
        "followed_num": raw_user[4],
        "recipe_num": recipe_num
    }
