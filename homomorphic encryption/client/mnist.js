var mnist = require('mnist');
var nj = require('numjs')
var simple_layer = require('./simple_layer')
var mh = require('./math_helper.js')
var en = require('./encryption.js')
var request=require('request');

var n_in = 784, n_h = 32
settings = {
    // # Training method is either 'simple' or 'genetic_algorithm'
    'training_method': 'genetic_algorithm',
    'num_of_batches': 1000,
    'batch_size': 10,
    // # Parameters used for normal training process
    'simple_training_params': {
        'learning_rate': 0.01
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
var input = trainingSet[1].input
console.log("label:",trainingSet[1].output)


// function perform_simple_training(layers, batch_xs, settings){
//     var learning_rate = settings['simple_training_params']['learning_rate']
//     var activations = forward_step(batch_xs, layers)
//     backward_stepf(activations, batch_ys, layers, learning_rate)
// }

// # The normal forward step that might use homomorphic encryption
function forward_step(input_samples, layers) {
    var i, activations = new Array()
    activations.push(nj.array(input_samples))
    for (i = 0; i < layers.length; i++) {
        activations.push(layers[i].forward(activations[activations.length - 1]))
    }
    return activations
}

var options_askData = {
	headers: {"Connection": "close"},
    url: 'http://127.0.0.1:5000/askData',
    method: 'POST',
    body: {empty:""},
    json:true
};

function callback_askData(error, response, data) {
    if (!error && response.statusCode == 200) {
        // console.log('----info------',data);
    
        var w1 = data["W1"],b1 = data["b1"]
        w1 = nj.array(w1)
        b1 = nj.array(b1).reshape(32)
        var LinearLayer = new simple_layer.LinearLayer(w1, b1)
        var ReluLayer = new simple_layer.ReluLayer()
        var model = [
            LinearLayer,
            ReluLayer
        ]
        
        //train the model and encrypt the result
        var enc_settings = settings['homomorphic_encryption_params']
        var encryption = new en.Encryption(enc_settings['w'], enc_settings['scale'], enc_settings['t_bound'],
            enc_settings['input_range'])
        var test_input = nj.array(input)
        console.log("input",test_input,test_input.shape)
        console.log("w1",nj.array(w1).shape)
        console.log("b1",nj.array(b1).shape)
        var activations = forward_step(test_input, model)//res is the output of front layers
        // var res = encryption.encrypt_vector(activations[2]).tolist()
        send_res(activations[2],encryption)
    }
    else{
        console.log(response)
    }
    return
}
request(options_askData, callback_askData)

// send result to server
function send_res(res,encryption){
    var options_sendRes = {
        headers: {"Connection": "close"},
        url: 'http://127.0.0.1:5000/inference',
        method: 'POST',
        json:true,
        body: {output:res.tolist(),M:encryption.m.tolist()}
    };

    function callback_sendRes(error, response, data) {
        if (!error && response.statusCode == 200) {
            // console.log('----info------',data);
        }
        else{
            console.log(response)
        }
    }
    request(options_sendRes, callback_sendRes);
}