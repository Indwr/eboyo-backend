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

let getTokenFromDBForAdmin = async (request,res, next) => { 
    var token = (request.payload != null && (request.payload.authorization)) ? request.payload.authorization : ((request.params && request.params.authorization) ? request.params.authorization : request.headers['authorization']);
    var userData = null;
    var usertype, userId, criteria;  
    try{
        if (typeof(token)== 'undefined' || token=='null' || token == null)
        {   
           throw ERROR.ACCESS_TOKEN_NULL
        }
        let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);
        if(decoded.data.role==APP_CONSTANTS.USER_ROLES.ADMIN){
            let userData = decoded.data;
            userData.accessToken = token;
            let checkToken = await checkAdminToken(userData); //console.log("checkToken11",checkToken);
            return checkToken;
        }else if(decoded.data.role==APP_CONSTANTS.USER_ROLES.SUB_ADMIN){
            let userData = decoded.data;
            userData.accessToken = token;
            let checkToken = await checkAdminToken(userData); //console.log("checkToken11",checkToken);
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


let  checkAdminToken= async (payloadData)=> {  
    let criteria  ={
       email:payloadData.email,
       _id:payloadData._id,
       accessToken:payloadData.accessToken
    }; 
    let projection= {password:0,__v:0};
    try {
        let userData    =   await Service.AdminService.getData(criteria,projection,{lean:true}); 
        if(userData.length==0){
         throw ERROR.INVALID_ACCESS_TOKEN;
        }
        return userData[0];
    }catch(err){ console.log("err",err);
     throw err;
    }
};

module.exports = {
    getTokenFromDBForAdmin:getTokenFromDBForAdmin, 
}