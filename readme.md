## Vshuo(微说):基于nodejs的班级说说系统

#### 目录介绍

1.models(M):模块处理业务逻辑
2.view(V):视图层,存放页面ejs模板
3.roter(C):处理路由
4.node_modules:npm[模块](http://117.50.46.24:3000/)
5.public:存放静态资源文件
6.avatar:存放头像(用户头像)

#### 使用说明

​	1.自行去安装MongoDB(版本需要大于3.0)

​	2.使用案例前请先安装依赖

```
 npm install
```

​	3.启动项目

```
node app.js
```

#### 其他说明

1.本案例提供在线访问[V说项目在线预览](http://117.50.46.24:3000/)

2.本项目基于nodejs已经express.js以及数据库mongoDB完成

3.项目支持多用户,用户注册登录发布说说,头像设置等!

导航介绍:

​		全部说说:已发布的全部说说

​		我的说说:当前登录用户已发表的说说

​		全部成员:本系统中成功注册的用户展示

##### 不同状态展示

1.当访问的url连接中包含未注册的用户主页时会反馈404,

![](C:\Users\Administrator\Documents\GitHub\Vshuo\-1.png)

2.表面访问主页不存在,访问用户个人主页,但是该用户并未发布说说,呈现用户尚未发布说说,

![](C:\Users\Administrator\Documents\GitHub\Vshuo\0.png)

3.如果该用户存在数据库且由发布说说记录则显示用户发布的说说列表且按照发布时间正序排列!		

![](C:\Users\Administrator\Documents\GitHub\Vshuo\1.png)

#### 关于作者

 十月梦想博客:[http://cncat.cn](https://github.com/shiyuemengxiang/liuyanban/blob/master)

​	十月梦想的Github [https://github.com/shiyuemengxiang](https://github.com/shiyuemengxiang/liuyanban/blob/master)