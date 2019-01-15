var mnist = require('mnist'); 
var nj = require('numjs')

settings = {
    // # Training method is either 'simple' or 'genetic_algorithm'
    'training_method': 'genetic_algorithm',
    'num_of_batches': 1000,
    'batch_size': 10,
    // # Parameters used for normal training process
    'simple_training_params': {
        'learning_rate': 0.01
    },
    // # Parameters used for genetic algorithm
    'genetic_algorithm_params': {
        'population': 5,
        'parents': 1,
        'sigma': 0.02,
        'mutation_probability': 0.00001
    },
    // # Homomorphic encryption related settings
    'homomorphic_encryption_params': {
        'number_of_bits': 40,
        'a_bound': 5,
        'e_bound': 5,
        't_bound': 10,
        'scale': 100,
        'w': 2 ** 10,
        'input_range': 1000
    }
}

var set = mnist.set(30000)
var trainingSet = set.test;
var testSet = set.training;

function aa(){
    return 1,2
}

var a,b = aa()
console.log(aa())