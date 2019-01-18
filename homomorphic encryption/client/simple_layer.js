var nj=require('numjs')
var check = require('./type_check_js.js')

exports.LinearLayer = class{
    constructor(w,b){
        this.w = w
        this.b = b
    }

    forward(x){
        return x.dot(this.w).add(this.b) 
    }
    
    backward(learning_rate, y, x, bp_error){
        var output_grad = bp_error
        var input_grad = output_grad.dot(this.w.T)
        var dw = x.T.dot(output_grad)
        var db = np.sum(output_grad, axis=0)
        this.w = this.w - learning_rate * dw
        this.b = this.b - learning_rate * db
        return input_grad
    }
}

exports.ReluLayer = class{
    forward(m){
        var len = m.shape[0],tmp,res = []
        for(var i = 0;i < len; i ++){
            res.push(Math.max(m.get(i),0))
        }
        return nj.array(res)
    }
    
}        

 