var request=require('request');

var options = {
	headers: {"Connection": "close"},
    url: 'http://127.0.0.1:5000/json',
    method: 'POST',
    json:true,
    body: {data:{channel : "aaa",appkey : "bbb"},sign : "ccc",token : "ddd"}
};

function callback(error, response, data) {
    if (!error && response.statusCode == 200) {
        console.log('----info------',data);
    }
    else{
        console.log(response)
    }
}

request(options, callback);