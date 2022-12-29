from datetime import datetime
from flask import (
    jsonify,
    render_template,
    render_template_string,
    request
)
import io
import json
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

    env = {"PYTHONPATH": "/home/paul/work/UoM/wrg/code/pywrparser"}
    python = "python"
    args = ("/home/paul/work/UoM/wrg/code/pywrparser/pywrparser/parse.py", "--json-output", "--stdin")
    proc = subprocess.Popen([python, *args], env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    so, se = proc.communicate(input=bio.read())
    if so and not se:
        return so.decode()
    return se.decode()
