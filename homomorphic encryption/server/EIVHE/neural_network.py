import numpy as np


def calculate_accuracy(layers, images, labels):
    y_true = labels
    activations = simple_forward_step(images, layers)
    output = np.argmax(activations[-1], axis=1)
    y_prediction = np.zeros((len(y_true), 10))
    y_prediction[np.arange(len(y_true)), output] = 1
    accuracy = np.sum(np.all(np.equal(y_true, y_prediction), axis=1)) / float(len(y_prediction))
    return np.round(accuracy, 2)


# Forward step that never use homomorphic encryption
def simple_forward_step(input_samples, layers):
    activations = [input_samples]
    for layer in layers:
        activations.append(layer.simple_forward(activations[-1]))
    return activations


# The normal forward step that might use homomorphic encryption
def forward_step(input_samples, layers):
    activations = [input_samples]
    for layer in layers:
        activations.append(layer.forward(activations[-1]))
    return activations


def backward_step(activations, targets, layers, learning_rate):
    parameter = targets
    for index, layer in enumerate(reversed(layers)):
        y = activations.pop()
        x = activations[-1]
        parameter = layer.backward(learning_rate, y, x, parameter)


def perform_simple_training(layers, batch_xs, batch_ys, settings):
    learning_rate = settings['simple_training_params']['learning_rate']
    activations = forward_step(batch_xs, layers)
    backward_step(activations, batch_ys, layers, learning_rate)

