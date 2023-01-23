from flask import (
    Flask
)

from pywr_upload import pywr_upload

app = Flask(__name__)
app.config.from_object("config")
app.register_blueprint(pywr_upload)


if __name__ == "__main__":
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.run(host="0", debug=True)
