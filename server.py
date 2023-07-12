from flask import Flask
from flask import request
from flask_cors import CORS

import numpy as np

app = Flask(__name__)
CORS(app)
cors = CORS(app, resource={r"/*": {"origins": "*"}})


def ReLU(Z):
    return np.maximum(Z, 0)


def softmax(Z):
    A = np.exp(Z) / sum(np.exp(Z))
    return A


def forward_prop(W1, b1, W2, b2, X):
    Z1 = W1.dot(X) + b1
    A1 = ReLU(Z1)
    Z2 = W2.dot(A1) + b2
    A2 = softmax(Z2)
    return Z1, A1, Z2, A2


def get_predictions(A2):
    return np.argmax(A2, 0)


def make_predictions(X, W1, b1, W2, b2):
    _, _, _, A2 = forward_prop(W1, b1, W2, b2, X)
    predictions = get_predictions(A2)
    return predictions


params = np.load("params.npz")
W1 = params["W1"]
b1 = params["b1"]
W2 = params["W2"]
b2 = params["b2"]


@app.route("/", methods=["POST"])
def nn():
    data = request.data.decode("utf-8")
    data = list(map(float, data[1:-1].split(",")))
    data = np.array(data)[:, np.newaxis]

    prediction = make_predictions(data, W1, b1, W2, b2)[0]
    print(prediction)
    return f"{prediction}"


if __name__ == "__main__":
    app.run()
