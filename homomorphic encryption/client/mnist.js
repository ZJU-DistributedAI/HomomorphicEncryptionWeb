var mnist = require('mnist'); 
var nj = require('numjs')
var simple_layer = require('./simple_layer')
var mh = require('./math_helper.js')

var n_in = 784,n_h = 32

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
var trainingSet = set.test
var testSet = set.training
var _w,_b

var input = trainingSet[0].input

function init_data(){
    _w = mh.generate_random_matrix_float(n_in,n_h,1)
    _b = mh.generate_random_vector(n_h,1)
}   

init_data()
var LinearLayer =  new simple_layer.LinearLayer(_w,_b)
var ReluLayer =  new simple_layer.ReluLayer()
var model = [
    LinearLayer,
    ReluLayer
]


// function perform_simple_training(layers, batch_xs, settings){
//     var learning_rate = settings['simple_training_params']['learning_rate']
//     var activations = forward_step(batch_xs, layers)
//     backward_stepf(activations, batch_ys, layers, learning_rate)
// }

// # The normal forward step that might use homomorphic encryption
function forward_step(input_samples, layers){
    var i,activations = new Array()
    activations.push(nj.array(input_samples))
    for(i = 0;i < layers.length;i ++){
        activations.push(layers[i].forward(activations[activations.length - 1]))
    }
    return activations
}   

var test_input = nj.array(input)
var res = forward_step(test_input,model)
console.log(res)

// var out = LinearLayer.forward(test_input)
// var res = forward_step(test_input,model)
// console.log(res)

//todo
// function backward_step(activations, targets, layers, learning_rate){
//     parameter = targets
//     for(index, layer in enumerate(reversed(layers))){

//     }
//     y = activations.pop()
//     x = activations[-1]
//     parameter = layer.backward(learning_rate, y, x, parameter)
// }