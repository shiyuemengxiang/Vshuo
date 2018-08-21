//这个模块里面封装了所有对数据库的常用操作
var mongoClient=require("mongodb").MongoClient;
var dbSet=require("../dbset.js");
//数据库如何操作都要先连接数据库
//封装内部方法,数据库连接
function _connectDB(callback){
    var url=dbSet.dbUrl;//读取数据库配置文件地址
    mongoClient.connect(url,function(err,client){
        if(err){
            console.log("连接失败,检查数据库信息是否正确");
            return;
        }
        console.log("数据库连接成功");
        callback(err,client);
    });

}
//初始化一个索引
//ES6箭头函数初始化一个创建索引
let init=()=>{
    _connectDB((err,client)=>{
        if(err){
            console.log(err)
            return;
        }
        let db=client.db(client.s.options.dbName);
        db.collection('user').createIndex({"username":1},{unique:true},(err,result)=>{
            if(err){
                console.log(err);
                return;
            }
            console.log("索引创建完毕!")
        })
    })
}
init()



//插入数据
exports.insertMany=function(collectionName,json,callback){
    //连接数据库
    _connectDB(function(err,client){
        var db=client.db(client.s.options.dbName)
        db.collection(collectionName).insertMany(json,function(err,result){
           callback(err,result);
           client.close();
        })
    })
}
//查找数据
exports.find=function(collectionName,json,C,D){
    //参数个数判断
    if(arguments.length==3){
        var limit=0;
        var skipnum=0;
        var callback=C;
        console.log("查询参数个数:3")
    }else if (arguments.length==4){
        var callback=D;
        //变量args继承第三个参数
        var args=C;
        //显示条目
        var limit=args.pagescount||0;
        //省略tiaomu
        var skipnum=args.pagescount*args.skipnum||0;
        //排序方式
        var sort=args.sort || {};
        console.log("查询参数个数:4")

    }else{
        console.log("find 函数参数不合法参数必须三个或者四个");
        return;
    }
//    连接数据库
    _connectDB(function(err,client){
        var db=client.db(client.s.options.dbName)
        db.collection(collectionName).find(json).limit(limit).skip(skipnum).sort(sort).toArray(function(err,doc){
            callback(err,doc)
        });
        client.close();
    })
}
//数据库删除
exports.deleteMany=function(collectionName,json,callback){
    //连接数据库
    _connectDB(function(err,client){
        //设置指定的数据库
        var db=client.db(client.s.options.dbName);
        db.collection(collectionName).deleteMany(json,function(err,result){
            callback(err,result);
            client.close();
        })
    })
}
//数据修改
exports.updateMany=function(collectionName,where,set,callback){
    _connectDB(function(err,client){
        var db=client.db(client.s.options.dbName);
        db.collection(collectionName).updateMany(where,set,function(err,result){
            callback(err,result);
            client.close();
        })
    })
}
//查询数据数量
exports.getCount=function(collectionName,callback){
    _connectDB(function(err,client){
        var db=client.db(client.s.options.dbName);
        db.collection(collectionName).count({}).then(function(count){
            callback(count);
            client.close();
        });

    })
}