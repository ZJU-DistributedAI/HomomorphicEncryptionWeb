var nj=require('numjs')



exports.check_is_vector=function(vector){
    if((vector instanceof nj.NdArray) && vector.shape.length==1){
        return true
    }else{
        return false
    }

}

exports.check_is_matrix=function(array){

    if(array instanceof nj.NdArray && array.shape.length==2){
        return true
    }else{
        return false
    }


}

exports.check_is_int32=function(inetegr){

    if(integer instanceof nj.int32){
        return
    }else{
        throw new Error("must be nj.int32 integer")
    }


}

exports.check_is_int=function(integer){

    if(integer instanceof nj.int){
        return
    }else{
        throw new Error("must be nj.int integer")
    }

}
