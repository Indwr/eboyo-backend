const BaseJoi                  =  require('joi');
const Joi                      =  BaseJoi
const Boom                     =  require('boom');
const MD5                      =  require('md5');
const jwt                      =  require('jsonwebtoken');
const HapiJWT                  =  require('hapi-jsonwebtoken');
const fsExtra                  =  require('fs-extra');
const timezoner                =  require('timezoner');

const Path = require('path');
const fs   =  require('fs');
const UniversalFunctions = require('./UniversalFunctions');

const CONFIG                =  require('../Config');
const Service               =  require('../Services');
const APP_CONSTANTS         =  CONFIG.APP_CONSTANTS;
const STATUS_MSG            =  APP_CONSTANTS.STATUS_MSG;
const SUCCESS               =  STATUS_MSG.SUCCESS;
const ERROR                 =  STATUS_MSG.ERROR;

let getTokenFromDBForDriver = async (request,res, next) => { 
    var token = (request.payload != null && (request.payload.authorization)) ? request.payload.authorization : ((request.params && request.params.authorization) ? request.params.authorization : request.headers['authorization']);
    var userData = null;
    var usertype, userId, criteria; //console.log("token==1",token);
    try{
        if (typeof(token)== 'undefined' || token=='null' || token == null)
        {   
           throw ERROR.ACCESS_TOKEN_NULL
        }
        let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);
        console.log("Driver====decoded",decoded);
        if(decoded.data.role==APP_CONSTANTS.USER_ROLES.DRIVER){
            let userData = decoded.data;
            userData.accessToken = token;
            let checkToken = await checkDriverToken(userData); 
            return checkToken;
        }else {
           throw ERROR.INVALID_ACCESS_TOKEN;
        }
    }catch(err){
        if(typeof(err)=='object' && err.hasOwnProperty('statusCode')){
           return UniversalFunctions.sendError(err);
        }else{
          return UniversalFunctions.sendError(ERROR.INVALID_ACCESS_TOKEN);
        }
    }
};


let  checkDriverToken= async (payloadData)=> { //console.log("checkRestaurantToken");
    let criteria  ={
       email:payloadData.email,
       _id:payloadData._id,
       accessToken:payloadData.accessToken
    };//console.log("criteria",criteria);
    let projection= {password:0,__v:0};
    try {
        let userData  = await Service.DriverService.getData(criteria,projection,{lean:true}); // console.log("userData",userData);
        if(userData.length==0){
         throw ERROR.INVALID_ACCESS_TOKEN;
        }
        return userData[0];
    }catch(err){ console.log("err",err);
     throw err;
    }
};

module.exports = {
    getTokenFromDBForDriver:getTokenFromDBForDriver, 
}