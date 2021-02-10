var express = require('express');
var router = express.Router();
var path = require("path");
const rootPath = path.dirname(require.main.filename);;
let {
	RespBaseData,
	Resolve
} = require(rootPath + "/model/CommenModel.js")
let userDao = require(rootPath + "/dao/user.js")
let utils = require(rootPath + "/public/javascripts/utils")
let resUtils = require(rootPath + "/public/javascripts/ResUtils")
let db = require(rootPath + "/db/dbUtils.js")
let CONSTANT = require(rootPath + "/public/javascripts/constant")

router.route('/index').post(function (req, res, next) {
	let t = !utils.isEmpty(req.body) ? req.body : req.query;
});

router.route('/getDhtInfo').get(function (req, res, next) {
	userDao.queryDHTInfo().then((data) => {
		console.log(data);
		resUtils.sendData(res, data);
	}).catch(next);

});

router.route('/insertDht').post(function(req, res, next) {
	let currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
	/* if(!utils.contains(req.body,"errorInfo,errorCode,errorType")){
	 	resUtils.sendError(res,"参数错误"+req.body)
	 	return;
	 }*/
	 req.body.createTime = currentTime;
	 db.insert("dht",req.body);
	 resUtils.sendData(res,Resolve.success("操作成功"));
});

 


module.exports = router;