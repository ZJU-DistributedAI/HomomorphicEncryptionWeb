var nj=require('numjs')

exports.LinearLayer = class{
    constructor(w,b){
        this.w = w
        this.b = b
    }

    forward(x){
        console.log("w:",nj.sum(this.w))
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
        if(!check.check_is_matrix(m)){
            throw new Error("m is not a matrix")
        }
        var row = m.shape[0], col = m.shape[1],tmp
        for(var i = 0;i < row; i ++){
            for(var j = 0;j < col;j ++){
                tmp = Math.max(m.get(i,j),0)
                m.set(i,j,tmp)
            }
        }
        return m
    }
    
}        

 