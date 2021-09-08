import sys

try:
    from app import app
    import namespaces.auth
    import namespaces.user
    import namespaces.recipe
    import namespaces.categories

    app.run(debug=True)
except ImportError as e:
    print('ERROR:', e, file=sys.stderr)
