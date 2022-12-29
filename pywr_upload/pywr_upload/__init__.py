from flask import Blueprint

pywr_upload = Blueprint("pywr_upload", __name__,
                        template_folder="templates",
                        static_folder="static",
                        static_url_path="/pywr_upload_static")

from .routes import *
