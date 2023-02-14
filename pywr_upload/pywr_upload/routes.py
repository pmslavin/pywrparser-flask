from datetime import datetime
from flask import (
    current_app,
    jsonify,
    render_template,
    render_template_string,
    request
)
import io
import json
import os
import subprocess

from . import pywr_upload


@pywr_upload.route("/")
def index():
    return render_template("index.html")

@pywr_upload.route("/parse", methods=['POST'])
def parse():
    data_info = request.json
    compression = data_info.get("compression")
    bio = io.BytesIO(json.dumps(data_info["data"]).encode())

    config = current_app.config["PYWRPARSER"]
    env = config["env"]
    parser_bin = os.path.join(config["path"], config["bin"])
    python = config["python"]
    args = (parser_bin, *config["flags"])
    proc = subprocess.Popen([python, *args], env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    so, se = proc.communicate(input=bio.read())
    if so and not se:
        return so.decode()
    return se.decode()
