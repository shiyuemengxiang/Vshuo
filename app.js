var express=require("express");
var app=express();
var session = require('express-session')
var router=require("./router/router.js");
var user_key=user_key;//session登录标记
//静态页面
app.use(express.static("./public"))
app.use("/avatar",express.static("./avatar"))
app.set("view engine","ejs")
//session中间件
app.use(session({
    name:user_key,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
//路由列表
app.get("/",router.showIndex)
app.get("/register",router.showReg)
app.post("/doreg",router.doreg)
app.get("/login",router.showLogin)
app.post("/dologin",router.dologin)
app.get("/setavatar",router.showSetavatar)
app.post("/doavatar",router.doAvatar)
app.get("/cut",router.showCut)
app.get("/docut",router.doCut)
app.get("/logout",router.doLogout)                     //退出登录
app.post("/post",router.doPost)                        //发布说说
app.get("/api",router.doFind)                        //查询接口(全部说说)
app.get("/info",router.doInfo)                       //用户信息
app.get("/allCount",router.allCount)                       //说说总数接口
app.get("/user",router.allUser)                         //所有用户
app.get("/i/:user",router.showI)                         //用户主页
app.listen(3000);