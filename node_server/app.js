




var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cors = require('cors');
var session = require('express-session')
var config = require("./config.js")
 
var errorLogger = require("./dao/error.js")
var utils = require("./public/javascripts/utils.js")
var app = express();

app.use(logger('dev')); // 使用 morgan 将请求日志输出到控制台
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var whitelist = config.originList;
var corsOptions = {
  origin: function (origin, callback) {
    //console.log(whitelist);
    //console.log(origin);
    /* let ret= whitelist.indexOf(origin)
     if (ret !== -1) {
       callback(null, true)
     } else {
       callback(new Error('Not   allowed  by CORS'))
     }*/
    callback(null, true)
  }
}
app.use(cors(corsOptions));

app.set('trust proxy', 1) // trust first proxy
 app.use(session({
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: true,  
    cookie: {
    secure: true
   }
 }))

//图片上传
var multer = require('multer')

var storage = multer.diskStorage({
  //设置上传后文件路径，uploads文件夹会自动创建。
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
    console.log("storage")
    var fileFormat = (file.originalname).split(".");
    var filename = file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]
    req.filename = filename
    cb(null, filename);
  }
});
var upload = multer({
  storage: storage
});



app.get('/', function (req, res) {
  let str = {
    "originalUrl": req.originalUrl,
    "baseUrl": req.baseUrl,
    "protocol": req.protocol
  }
  res.send(JSON.stringify(str));
});
//业务相关




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  /*  console.log("catch 404 and forward to error handler")
    //req.body.userId = req.get("userId");
    var err = new Error('Not Found');
    err.status = 404;
    res.status(err.status || 500);
    res.json({
      "error": err
    })
    next(err);*/
  next()
});

// error handler
app.use(function (err, req, res, next) {
  if (err instanceof Resolve) {
    console.log("---system error----")
    resUtils.sendData(res, err);
    return;
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  console.log(err || err.stack);
  let errmsg = err.stack || err;
  errorLogger.insert(errmsg, err.status, 2)
  resUtils.sendError(res, errmsg);
});


//wxjs根路由
var wxjsRootRouter = require('./routes/wxjs/index');
let resUtils = require("./public/javascripts/ResUtils");
var path = require("path");
const rootPath = path.dirname(require.main.filename);
let { RespBaseData, Resolve } = require(rootPath + "/model/CommenModel.js")

app.use("/wxjs", wxjsRootRouter)

var db = require("./db/dbUtils.js")

// 单图上传
app.post('/upload', upload.single('logo'), function (req, res, next) {
   
  let filepath =  utils.getHostURL() + "/uploads/" + req.filename
  if(req.body.type=="logo"){
    let userId = req.body.userId
    console.log(userId)
    let sql = `UPDATE user SET avatarUrl = '${filepath}' WHERE userId='${userId}'`
    db.query(sql, (data) => {
      resUtils.sendData(res,Resolve.success("更改图像成功"));
    })
    let sql1 = `UPDATE msg SET avatarUrl = '${filepath}' WHERE userId='${userId}'`
    db.query(sql1, (data) => {
    })
    return
  }

  console.log(req.body)
  if(req.body.type=="homePic"){
    let sql = `UPDATE extra SET homePicUrl = '${filepath}'`
    db.query(sql, (data) => {
      resUtils.sendData(res,Resolve.success("更改成功"));
    })
     return
  }



});

module.exports = app;