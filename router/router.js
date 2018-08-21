var db=require("../models/db.js");
var formidable=require("formidable");
var fs=require("fs");
var path=require("path");
var gm=require("gm");
var sd=require("silly-datetime");
var md5=require("../models/md5.js")
//退出登录引用变量
var app=require("../app.js");
exports.showIndex=function(req,res,next) {
    //检索数据库，查找此人的头像
   if(req.session.login==1){
       //登录状态
       var username=req.session.username;
       var login=true
   }else{
       //没有登录
       var username="";
       var login=false;
   }
   //已经登录检索数据库头像
    db.find("user",{username:username},function(err,doc){
        if(doc.length==0){
            //表示数据库不存在
        }else{
            //查找到了,如果有取数据库拿头像,不存在就设置默认头像1.jpg
            var avatar=doc[0].avatar || "1.png" ;
        }
        console.log("头像路径:"+avatar)
        //呈递页面(查询数据库内)
        db.find("post",{},{sort:{"wtime":-1}},function(err,result){

            res.render("index",{
                "login":login,
                "username":username,
                "avatar":avatar,
                "active":"首页",
                "shuoshuo":result
            })
        })

    })
}
//注册
exports.showReg=function(req,res){
    res.render("register",{
        "login":req.session.login==1?true:false,
        "username":req.session.login==1? req.session.username: "",
        "active":"注册"
    })
}
//注册处理
exports.doreg=function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
       var username=fields.username;
       var password=fields.password;
       //加密密码
        password=md5(md5(password).substr(8,6)+224+md5(password)+md5('symx'))
        console.log(password);
       if(err){
           res.json(-1);//服务器错误-1
           return;
       }else{
           //开始查找数据
           db.find("user",{"username":username},function(err,doc){
               if(doc.length!=0){
                   //数据存在
                   console.log("用户名存在");
                   res.json(-2);
                   return;
               }else{
                   db.insertMany("user",[{"username":username,"password":password}],function(err,result){
                       if(err){
                           console.log("数据插入失败");
                           return;
                       }else{
                           //注册成功,写入session;
                           req.session.login=1;
                           req.session.username=username;
                           res.json(1);//数据插入成功;
                           console.log("数据插入成功");

                       }
                   })
               }
           })
       }
     // console.log(fields)
    });
}
//登录
exports.showLogin=function(req,res){
    res.render("login",{
        "login":req.session.login==1?true:false,
        "username":req.session.login==1? req.session.username: "",
        "active":"登录"
    })
}

//登录业务
exports.dologin=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        var username=fields.username;
        var password=fields.password;
        //加密密码
        password=md5(md5(password).substr(8,6)+224+md5(password)+md5('symx'))
        console.log(username+"----密码:"+password);
        //查找数据
        db.find("user",{"username":username},function(err,doc){
            if(doc.length==0){
                res.json(-1);//用户名不存在
                return;
            }else{
                //用户名存在分为密码是否错误
                if(doc[0].password==password){
                    req.session.login="1";
                    req.session.username=username;
                    req.session.avatar=doc[0].avatar || "1.png";
                    res.json(1);//登陆成功
                    return;
                }else{
                    res.json(0);//密码不匹配
                }
            }
        })
    })
}

//设置头像
exports.showSetavatar=function(req,res){
    if(req.session.login !=1){
        res.send("用户未登录!");
        return;
    }else{
        res.render("setavatar",{
            "login":true,
            "username":req.session.username || "非法用户!",
            "active":"修改头像"
        })
    }
}
//上传头像页面
exports.doAvatar=function(req,res,next){
    if(req.session.login !="1"){
        res.send("非法访问!请先尝试登录!");
        return;
    }else{
        var form=new formidable.IncomingForm();
        form.uploadDir = __dirname+"/../avatar";//上传路径从根路径出发,dirname从当前文件出发
        form.parse(req,function(err,fiedls,files){
            console.log(files);
            var oldpath=files.touxiang.path;
            var newpath=path.normalize(__dirname+"/../avatar/"+req.session.username.substr(0,6)+".png");
            fs.rename(oldpath,newpath,function(err){
                if(err){
                    console.log("失败!");
                    return;
                }else{
                    console.log("改名成功");
                    req.session.avatar=req.session.username.substr(0,6)+".png";
                    console.log(req.session.avatar)
                    res.redirect("/cut");//跳转切图页面
                }

            })
        })
    }
}
//头像裁剪
exports.showCut=function(req,res,next){
    if(req.session.login !="1"){
        res.send("非法操作!请重新登录");
        return;
    }else{
        res.render("cut",{
            "avatar":req.session.avatar
        })
    }
}
//切图操作
exports.doCut=function(req,res,next){
    if(req.session.login !="1"){
        res.send("非法操作!请重新登录");
        return;
    }else{
        //接收四个w,h,x,y参数
        var filename = req.session.avatar;
        var w = req.query.w;
        var h = req.query.h;
        var x = req.query.x;
        var y = req.query.y;
        gm("./avatar/"+filename)

            .crop(w,h,x,y)
            .resize(100,100,"!")
            .write("./avatar/"+filename,function(err){
                if (err){
                    console.log("没有成功切图,失败");
                    return;
                    res.send(-1);

                } else{
                    //写入数据库
                    db.updateMany("user",{"username":req.session.username},{$set:{"avatar":req.session.avatar}},function(err,result){
                        if(err){
                            console.log("数据更新失败!");
                            return;
                        }else{
                            console.log("头像设置成功!");
                            res.redirect("/")
                        }
                    })
                }
            })
    }
}
//退出登录
exports.doLogout=function(req,res,next){
        req.session.destroy(function(err){
            if(err){
                console.log("退出失败!");
                return;
            }
            //清除登录cookie
            res.clearCookie(app.user_key)
            res.redirect("/")
        })
}
//发布说说
exports.doPost=function(req,res,next){
    //发布必须保证登录状态,否则一切都是扯淡!
    if(req.session.login !=1){
        res.end("非法请求,请尝试登录");
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //等到需要传输的数据
        var title=fields.title;
        var avatar=req.session.avatar;
        var content=fields.content;
        var username=req.session.username;
        //达到此阶段肯定是登录状态,数据库插入数据
            db.insertMany("post",[{username:username,avatar:avatar,title:title,content:content,wtime:sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}],function(err,result){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");

            })
    });
}
//说说信息接口
exports.doFind=function(req,res,next){
    var page=parseInt(req.query.page);
    var count=parseInt(req.query.count);
    //skip:跳过(省略数据,页码),limIt:显示条目(单页数据数),对象中key是字符串
    db.find("post",{},{"pagescount":12,"skipnum":page,"sort":{"wtime":-1}},function(err,doc){
        res.send(doc)
    })
}
//用户信息接口
exports.doInfo=function(req,res,next){
    var user=req.query.user;
    db.find("user",{"username":user},function(err,doc){
        if(err){
            console.log(err);
            return;
        }
        var username=doc[0].username
        var avatar=doc[0].avatar;
        var _id=doc[0]._id;
        res.send({
            "_id":_id,
            "username":username,
            "avatar":avatar
        });
    })
}
//说说总数接口
exports.allCount=function(req,res,next){
    db.getCount("post",function(result){
        console.log("说说总数:"+result)
        res.send(result.toString())
    })
}
//显示所有用户
exports.allUser=function(req,res,next){
        db.find("user",{},function(err,doc){
            var newUser=[]
                for (var i=0;i<doc.length;i++){
                    var user=doc[i].username;
                    var avatar=doc[i].avatar;
                    newUser.push({user,avatar})
                }
                res.render("user",{
                    "login": req.session.login == "1" ? true : false,
                    "username": req.session.login == "1" ? req.session.username : "",
                    "active" : "全部成员",
                    "suoyouchengyuan" : newUser
                })
        })
}
//用户个人主页
exports.showI=function(req,res){
    var user=req.params["user"];
    if (req.session.login!=1){
        res.send("非法操作,请登录!");
        return;
    }
    db.find("post",{"username":user},function(err,doc){
        db.find("user",{"username":user},function(err,result){
            if(result.length==0){
                res.render("404",{
                    "login": req.session.login == "1" ? true : false,
                    "username": req.session.login == "1" ? req.session.username : "",
                    "user":user,
                    "active" : "我的说说",
                    "avatar": "1.png"
                })
                return;
            }
            res.render("i",{
                "login": req.session.login == "1" ? true : false,
                "username": req.session.login == "1" ? req.session.username : "",
                "user":user,
                "active" : "我的说说",
                "allShuoshuo" :doc,
                "avatar":result[0].avatar || "1.png"
            })
        })

    })
}
