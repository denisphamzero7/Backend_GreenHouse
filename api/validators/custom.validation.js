const objectId = (value,helpers)=>{
    if(!value.match(/^[0-9a-fA-F]{24}$/)){
        return helpers.message(`"{{#label}}" must be a valid mongo id`);
    }
    return value
}
const password = (value,helpers)=>{
    if(value.length <8){
        return helpers.message('mật khẩu phải lớn hơn 8 kí tự')
    }
    return value
}

const  phone = (value,helpers)=>{
    if(!/^(0\d{9,10})$/.test(value)){
        return helpers.message('"{{#label}}"phải là số điện thoại hợp lệ (bắt đầu bằng số 0,có 10-11 chữ số')
    }
    return value;
}
 module.exports ={
    objectId,password,phone
 }