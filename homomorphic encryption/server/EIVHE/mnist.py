# Import useful libraries.
import os
from EIVHE.encryption import Encryption
from EIVHE.encryption_core import EncryptionCore
from EIVHE.safe_nn.layer import *
from EIVHE.safe_nn.safe_layer import *
from EIVHE.simple_layer import *
from EIVHE.neural_network import *
from tensorflow.examples.tutorials.mnist import input_data
import json
from flask import Flask
from flask import request
import numpy as np
import random

app = Flask(__name__)


@app.route('/json', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.get_data()
        dict = json.loads(data)
        train((dict["output"]))
        print("M:", dict["M"])
        return json.dumps(dict)
    else:
        return '<h1>只接受post请求！</h1>'


def train(input):
    settings = {
        # Training method is either 'simple' or 'genetic_algorithm'
        'training_method': 'genetic_algorithm',
        'num_of_batches': 1000,
        'batch_size': 10,
        # Parameters used for normal training process
        'simple_training_params': {
            'learning_rate': 0.01
        },
        # Parameters used for genetic algorithm
        'genetic_algorithm_params': {
            'population': 5,
            'parents': 1,
            'sigma': 0.02,
            'mutation_probability': 0.00001
        },
        # Homomorphic encryption related settings
        'homomorphic_encryption_params': {
            'number_of_bits': 40,
            'a_bound': np.int64(5),
            'e_bound': np.int64(5),
            't_bound': np.int64(10),
            'scale': 100,
            'w': np.int64(2 ** 10),
            'input_range': 1000
        }
    }

    # # Prepare data
    # data_set = input_data.read_data_sets(os.getcwd() + "/MNIST_data/", one_hot=True)  # use for training.
    # global_sorted_indices = random.sample(range(55000), 11000)
    # eval_train_images = data_set.train.images[global_sorted_indices]
    # eval_train_labels = data_set.train.labels[global_sorted_indices]
    # eval_test_images = data_set.test.images
    # eval_test_labels = data_set.test.labels
    print('Starts training secure mnist')

    # Init encryption instance
    enc_settings = settings['homomorphic_encryption_params']
    encryption_core = EncryptionCore(enc_settings['number_of_bits'], enc_settings['a_bound'], enc_settings['e_bound'])
    encryption = Encryption(encryption_core, enc_settings['w'], enc_settings['scale'], enc_settings['t_bound'],
                            enc_settings['input_range'])
    # Finished configuring encryption instance

    # Train.
    i, train_accuracy, test_accuracy = 0, [], []

    model = [
        # LinearLayer(32, 10),
        # SoftmaxOutputLayer()
        HomomorphicEncryptionLayer(encryption),
        SafeLinearLayer(encryption, 32, 10),
        SafeSoftmaxOutputLayer(encryption),
        HomomorphicDecryptionLayer(encryption)
    ]

    print(np.array(input))

    # while i < settings['num_of_batches']:
    #     # Update.
    #     i += 1
    #     # Training steps
    #     batch_xs, batch_ys = data_set.train.next_batch(settings['batch_size'])
    #     if settings['training_method'] == 'simple':
    #         perform_simple_training(model, batch_xs, batch_ys, settings)
    #
    #     # Evaluate
    #     train_accuracy_value = calculate_accuracy(model, eval_train_images, eval_train_labels)
    #     train_accuracy.append(train_accuracy_value)
    #     test_accuracy_value = calculate_accuracy(model, eval_test_images, eval_test_labels)
    #     test_accuracy.append(test_accuracy_value)

    # print(i, train_accuracy_value, test_accuracy_value)


if __name__ == '__main__':
    app.run(debug=True)
