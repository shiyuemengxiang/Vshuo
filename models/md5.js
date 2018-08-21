var crypto=require("crypto");
module.exports=function(yuanma){
    var hash = crypto.createHash('md5');
    //加密后转大写
    var password=hash.update(yuanma).digest('hex').toUpperCase();
    return password;

}