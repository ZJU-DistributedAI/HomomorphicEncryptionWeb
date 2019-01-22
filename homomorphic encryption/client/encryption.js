var nj = require('numjs')
var assert = require('assert')
var mh = require('./math_helper')
var ec = require('./encryption_core')

exports.Encryption = class {


    constructor(w, scale, t_bound, input_range) {
        this.w = w
        this.scale = scale
        this.t_bound = t_bound
        this.input_range = input_range
        this.t = this.get_t(32)
        this.s = this.get_s(this.t)
        this.m = this.get_m(this.s,this.t)
    }

    get_t(size) {
        if (size >= this.input_range) {
            console.error("size %d exceeded input range %d", size, this.input_range)
        } else {
            return mh.generate_random_matrix(size, 1, this.t_bound)
        }
    }

    get_s(t) {
        return ec.key_switching_get_secret(t)
    }

    get_m(s,t){
        var m = ec.key_switching_get_switching_matrix(s,t)
        return m
    }

    encrypt_vector(vector) {
        vector = mh.round(nj.multiply(nj.array(vector), this.scale))
        var s0 = ec.naive_encrypt_secret(this.w, vector.size)
        var c0 = vector
        var t1 = this.t
        var c1 = ec.key_switching_get_cipher(c0, s0, t1)
        return c1
    }

    decrypt_vector(cipher) {
        var secret = this.get_s(this.t)
        var result = ec.decrypt(secret, cipher, this.w)
        console.log(result)
        return nj.array(result).divide(parseFloat(this.scale))
    }

    encrypt_number(number) {
        x = nj.array(number)
        cipher = this.encrypt_vector(x)
        return cipher
    }

    decrypt_number(cipher) {
        result = ec.decrypt(this.get_s(1), cipher, this.w)
        return result / parseFloat(this.scale)
    }

    encrypt_matrix(matrix) {
        matrix = mh.round(nj.multiply(nj.array(matrix), this.scale))
        column_size = matrix.shape[1]
        s0 = ec.naive_encrypt_secret(this.w, column_size)
        t1 = this.get_t(column_size)
        encrypted_matrix = []
        for (var i = 0; i < matrix.length; i++) {
            encrypted_matrix.push(ec.key_switching_get_cipher(nj.array(matrix[i].reshape(-1), s0, t1)))
        }
        return encrypted_matrix
    }

    decrypt_matrix(cipher) {
        result = ec.decrypt(this.get_s(cipher.shape[1] - 1), cipher, this.w)
        return nj.array(result).divide(parseFloat(this.scale))
    }
}

// var en = new Encryption(ec,2**10,100,10,100)
// // var json = en.get_s_and_m(5)
// var vec = nj.array([1,2,3,4])
// var c = en.encrypt_vector(vec)
// console.log(c)
// console.log(en.decrypt_vector(c))