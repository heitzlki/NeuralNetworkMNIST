from flask import Flask
from flask import request
from flask_cors import CORS

import numpy as np

app = Flask(__name__)
CORS(app)
cors = CORS(app, resource={r"/*": {"origins": "*"}})


def init_params():
    W1 = np.random.rand(10, 784) - 0.5
    b1 = np.random.rand(10, 1) - 0.5
    W2 = np.random.rand(10, 10) - 0.5
    b2 = np.random.rand(10, 1) - 0.5
    return W1, b1, W2, b2


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


def test_prediction(index, W1, b1, W2, b2):
    current_image = X_train[:, index, None]
    prediction = make_predictions(current_image, W1, b1, W2, b2)[0]
    label = Y_train[index]


# W1, b1, W2, b2 = init_params()


@app.route("/", methods=["POST"])
def nn():
    data = np.array(request.data.decode("utf-8"))
    print(data)
    print(type(data))
    print(data.shape)
    # W1, b1, W2, b2 = init_params()
    # prediction = make_predictions(data, W1, b1, W2, b2)[0]
    return "Hello World!"


if __name__ == "__main__":
    app.run()
