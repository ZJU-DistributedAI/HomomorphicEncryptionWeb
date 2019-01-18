const _number_of_bits = 2

var nj = require('numjs')
var type_check = require('./type_check_js.js')

setting = {
    'number_of_bits': 40,
    'a_bound': 5,
    'e_bound': 5,
    't_bound': 10,
    'scale': 100,
    'w': 2 ** 10,
    'input_range': 1000
}

exports.log2 = function(x){
    return Math.log(x) / Math.log(2);
}

exports.sign = function(x){
    return x > 0? 1 : -1;
}

exports.horizontal_cat = function(matrix_a,matrix_b){
    if(matrix_a.shape[0] != matrix_b.shape[0]){
        throw new Error("horizontal_cat error:matrix_a.shape[0] != matrix_b.shape[0]")
    }
    return nj.concatenate(matrix_a,matrix_b)
}

exports.vertical_cat = function(matrix_a,matrix_b){
    if(!type_check.check_is_matrix(matrix_a)){
        throw new Error("matrix_a must be nj.array")
    }
    if(!type_check.check_is_matrix(matrix_b)){
        throw new Error("matrix_b must be nj.array")
    }
    if(matrix_a.shape[1] != matrix_b.shape[1]){
        throw new Error("vertical_cat error:matrix_a.shape[1] != matrix_b.shape[1]")
    }
    return nj.concatenate(matrix_a.T,matrix_b.T).T
}

exports.generate_random_matrix = function(row,col,bound){
    return this.asIntType(nj.random([row,col]).add(-0.5).multiply(2 * bound))
}

exports.generate_random_matrix_float=function(row,col,bound){
    return nj.random([row,col]).add(-0.5).multiply(2 * bound)
}

exports.generate_random_vector = function(len,bound){
    return this.asIntType(nj.random(len).add(-0.5).multiply(2 * bound))
}

exports.get_eye = function(len){
    var i,j
    var res = []
    for(i = 0;i < len;i ++){
        res.push([])
        for(j = 0;j < len;j ++){
            if(i == j){
                res[i].push(1)
            }else{
                res[i].push(0)
            }
           
        }
    }
    return nj.array(res)
}

exports.asIntType = function(m){
    var res = []
    //m is a vector
    if(m.shape.length == 1){
        var l = m.shape,i
        for(i = 0; i < l; i ++){
            res.push(m.get(i))
        }
    }//m is a matrix
    else{
        var x = m.shape[0],y = m.shape[1],i,j
        for(i = 0;i < x;i ++){
            res.push([])
            for(j = 0;j < y;j ++){
                res[i].push(m.get(i,j))
            }
        }
    }
    return nj.int32(res)
}

exports.round = function(m){
    var res = []
    //m is a vector 
    if(m.shape.length == 1){
        var l = m.shape,i
        for(i = 0; i < l; i ++){
            res.push(Math.round(m.get(i)))
        }
    }//m is a matrix
    else{
        var x = m.shape[0],y = m.shape[1],i,j
        for(i = 0;i < x;i ++){
            res.push([])
            for(j = 0;j < y;j ++){
                res[i].push(Math.round(m.get(i,j)))
            }
        }
    }
    return nj.int32(res)
}

//test success
exports.matrix_to_vector = function(matrix){
    if(!type_check.check_is_matrix(matrix)){
        throw new Error("the parameter is not a matrix")
    }
    return matrix.flatten()
}
//test success
exports.vector_to_matrix = function(vector,row,col){
    if(!type_check.check_is_vector(vector)){
        throw new Error("the parameter is not a vector")
    }
    return vector.reshape(row,col)
}

var a = nj.array([[1,2,3],[2,3,-4.6]])
var b = nj.array([[2,3],[1,2],[0,1]])
var c = nj.array([1,5,4,2])

// console.log(this.matrix_to_vector(a))
