import os

from flask import Flask, Request

app = Flask(__name__)


@app.route("/", methods=["POST"])
def index(request: Request):
    return ("", 204)


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "8080"))

    # This is used when running locally. Gunicorn is used to run the
    # application on Cloud Run. See entrypoint in Dockerfile.
    app.run(host="127.0.0.1", port=PORT, debug=True)
