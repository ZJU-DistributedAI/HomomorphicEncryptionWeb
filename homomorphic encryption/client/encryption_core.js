
const  _number_of_bits = 4
var mh = require('./math_helper.js')
var nj = require('numjs')
var check = require('./type_check_js.js')


setting = {
    'number_of_bits': 40,
    'a_bound': 5,
    'e_bound': 5,
    't_bound': 10,
    'scale': 100,
    'w': 2 ** 10,
    'input_range': 1000
}

var _largest_integer_after_encryption = 0

// init data
exports.load_t_cache=function(){
    var i
    var t_cache = new Array()
    for(i = 0;i < setting['w'];i ++){
        t_cache[i] = mh.generate_random_matrix(i,1,setting['t_bound'])
    }
    return t_cache
}



// # key switching:
// # we would like to find s'c' = sc
// # there are two steps:

// # step 1:
// # converting c and s into an intermediate bit representation c* and s*
// # here we introduce l, which is the length of the bit vector
exports.get_binary = function(integer){
    var abs_integer = Math.abs(integer);

    var sign = mh.sign(integer)
    var decStack = [];
    var res = new Array()
    var index = 0
    var rem
    for(var i = 0; i < _number_of_bits;i ++){
        rem = abs_integer % 2;
        decStack.push(rem);
        abs_integer = Math.floor(abs_integer / 2);
    }
    while (decStack.length != 0) {
        res[index ++] = decStack.pop() * sign
    }
    return res
}

exports.compute_c_star = function(c){
    c=nj.array(c)
    if(!check.check_is_vector(c)){
        throw new Error("c is not a vector")
    }
    var index = 0,i = 0
    var res = new Array()
    for(i = 0;i < c.shape;i ++){
        var bi_arr = this.get_binary(c.get(i))
        var j
        for(j = 0;j < bi_arr.length;j ++){
            res[index ++] = bi_arr[j]
        }
    }
    return nj.array(res)
}

exports.compute_s_star=function(S){

    S=nj.array(S)
    if(!check.check_is_matrix(S)){
        throw new Error("S is not a matrix")
    }
    var times_by = nj.zeros(_number_of_bits)
    var i,j,k
    for(i = 0;i < _number_of_bits;i ++){
        times_by.set(i,2 ** (_number_of_bits - i - 1))
    }
    
    var x = S.shape[0]
    var y = S.shape[1]
    var res = nj.ones(x * y * _number_of_bits)
    for(i = 0;i < x;i ++){
        for(j = 0;j < y;j ++){
            for(k = 0;k < _number_of_bits;k ++){
                res.set(i * y * _number_of_bits + j * _number_of_bits + k,times_by.get(k) * S.get(i,j))
            }
        }
    }
    return res.reshape(x,-1)
}

// # step 2:
// # switching the bit representation into the desired secret key

// # m: key-switching matrix   [Z^(n' x nl)]
// # which satisfies S'M = S* + E   [Z^(m x nl)]
exports.compute_switching_matrix_m = function(s_star,t){

    if(t.shape[0] != s_star.shape[0]){
        throw new Error("Dimension does not match")
    }
    var a = mh.generate_random_matrix(t.shape[1],s_star.shape[1],setting['a_bound'])
    var e = mh.generate_random_matrix(s_star.shape[0],s_star.shape[1],setting['e_bound'])
    var k = s_star.subtract(nj.dot(t,a)).add(e)

    //s_star.subtract(nj.dot(t,a)).add(e) === s_star - t.dot(a) + e
    var result = mh.vertical_cat(s_star.subtract(nj.dot(t,a)).add(e),a)
    return result
}

// # This method is used in operations
exports.compute_new_s = function(t){
    if(!check.check_is_matrix(t)){
        throw new Error("t is not matrix")
    }
    return mh.horizontal_cat(mh.get_eye(t.shape[0]),t)
}

exports.compute_new_c = function(m,c_star){
    if(!check.check_is_matrix(m)){
        throw new Error("m is not a matrix")
    }
    if(!check.check_is_vector(c_star)){
        throw new Error("m is not a vector")
    }

    if(m.shape[1] != c_star.shape){
        throw new Error("m.shape[1] != c_star.shape")
    }

    var new_c = nj.dot(m,c_star)
    return mh.asIntType(new_c)
}

// # Encryption & Decryption

//     # sc = wx + e
//     # (wI)x = wx
exports.naive_encrypt_secret = function(w,plain_text_size){
    return mh.get_eye(plain_text_size).multiply(w)
}

// # This method is used in operations
exports.key_switching_get_switching_matrix = function(s, t){
    var s_star = this.compute_s_star(s)
    var switching_matrix = this.compute_switching_matrix_m(s_star,t)
    return switching_matrix
}

// # This method is used in operations
exports.key_switching_get_cipher_from_switching_matrix = function(c,m){
    var c_star = this.compute_c_star(c)
    var result = this.compute_new_c(m,c_star)
    var largest_element = nj.abs(result).max()
    if (largest_element > self.largest_integer_after_encryption){
        _largest_integer_after_encryption = largest_element
    }
    return result
}

exports.key_switching_get_secret = function(t){
    return this.compute_new_s(t)
}

exports.key_switching_get_cipher = function(c, s, t){
    m = this.key_switching_get_switching_matrix(s, t)
    return this.key_switching_get_cipher_from_switching_matrix(c, m)
}

//haven't test
exports.decrypt = function(s, c, w){
    if(check.check_is_matrix(s)){
        throw new Error("s is not a matrix")
    }
    return mh.round(nj.dot(s,c).reshape(-1,s.shape[0]) / w )

}

// var a = nj.array([[1,2,3],[2,3,-4.6]])
// var b = nj.array([[2,3],[1,2],[0,1]])
// var c = nj.array([1,5,4.5])

// var s_star = this.compute_s_star(a)
// var c_star = this.compute_c_star(c)
// var M = this.compute_switching_matrix_m(s_star,t_cache[s_star.shape[0]])
// console.log(mh.round(a))
// console.log(mh.asIntType(c))
// console.log(this.key_switching_get_switching_matrix(b,t_cache[3]))