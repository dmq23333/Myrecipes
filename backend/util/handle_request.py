from flask import request, abort


def get_request_json():
    j = request.json
    if not j:
        abort(400, "Not in Json format")
    return j


def get_request_arg(arg, type=str, required=False, default=None):
    # print('request.args')
    # print(request.args)
    # print(arg)
    if arg not in request.args:
        if required:
            abort(400, f"Expected {arg} query parameter but not offered")
        else:
            return default
    else:
        try:
            return type(request.args[arg])
        except:
            abort(400, f" request parameter '{arg}' not in form {type}")
