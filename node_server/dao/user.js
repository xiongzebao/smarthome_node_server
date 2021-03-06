var express = require('express');
var router = express.Router();
var path = require("path");
const rootPath = path.dirname(require.main.filename);

var commenModelPath = rootPath + "/model/CommenModel.js";
var utilsPath = rootPath + "/public/javascripts/utils"
let {
	RespBaseData,
	Resolve
} = require(commenModelPath)
let db = require(rootPath + "/db/dbUtils.js")
let utils = require(utilsPath)
let dayjs = require("dayjs")

class UserDao {

	  queryDHTInfo(object){
	  	return new Promise((resolve, reject) => {
	  		let sql = `select * from dht `
			db.query(sql)
				.then((data) => {
					console.log(JSON.stringify(data))
					if(data.length>0){
						resolve(Resolve.success(data))
					}else{
						resolve(Resolve.fail("没有此用户"))	
					}
					
				}).catch((e) => {
					reject(e);
				})
		})
	  }

	isUserExsit(object) {
		return new Promise((resolve, reject) => {
			let sql = `select *from user where nickName = '${object.nickName}' or userId = ${object.userId}`
			console.log(sql)
			db.query(sql)
				.then((data) => {
					let result = data && data.length > 0 ? Resolve.fail("用户已存在") : Resolve.success("用户不存在");
					//console.log("用户是否存在")
					//console.log(JSON.stringify(result))
					resolve(result)
				}).catch((e) => {
					reject(e);
				})
		})
	}

	async completeInfo(object) {
		console.log("completeInfo")
		console.log(object)
		if (utils.isEmpty(object) || !utils.contains(object, "nickName,birthDate,userId")) {
			return 	  Promise.reject("参数异常");
		}
		try {
			let userData = await this.isUserExsit(object);
			if (!userData.success) {
				return Promise.resolve(Resolve.fail("用户已存在"));
			}
			object.dateTime = dayjs().format("YYYY-MM-DD hh:mm:ss");
			var reg = new RegExp("'","g");  
    		object.userId = object.userId.replace(reg, "");  
		  await	 db.insert("user", object)
		  return Promise.resolve(Resolve.success({fullUserIfo:object})) 
		}catch (e){
			return Promise.reject(e);
		}
	}

	async getAllUserInfo(){
		let sql = `select * from user`
		 let data = await db.query(sql);
		 
		if(data.length>0){
			return Promise.resolve(Resolve.success({list:data}))
		}else{
			return Promise.resolve(Resolve.fail("没有用户数据"))	
		}
	}

}

module.exports = new UserDao();