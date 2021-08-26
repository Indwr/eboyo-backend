/**
 * Created by Anurag on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require("mongoose");

const Service = require("../../Services");
const Models = require("../../Models");
const Config = require("../../Config");
const UniversalFunctions = require("../../Utils/UniversalFunctions");

const APP_CONSTANTS       =   Config.APP_CONSTANTS;
const DEVICE_TYPES        =   APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG          =   APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE    =   APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DOCUMENT_FILE_SIZE  =   APP_CONSTANTS.DOCUMENT_FILE_SIZE;


let createSubAdmin = async (payloadData, UserData) => {
  try {
    let data = {
      fullName: payloadData.fullName,
      email: payloadData.email,
      role: APP_CONSTANTS.USER_ROLES.SUB_ADMIN,
      rights: {
        coordinates: [APP_CONSTANTS.USER_PERMISSIONS_OPTIONS.ORDER,APP_CONSTANTS.USER_PERMISSIONS.READ],
      },
      password: UniversalFunctions.encryptedPassword(payloadData.password),
    };
    let subAdminData = await Service.AdminService.InsertData(data);
    return { subAdminData };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let allSubAdmin = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false ,'role' : APP_CONSTANTS.USER_ROLES.SUB_ADMIN}
     let projection = {createdAt:0,updatedAt:0,__v:0,bannerAuoIncrement:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.AdminService.getData(criteria, projection, options),
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount.length,
      subAdminData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}



module.exports = {
  createSubAdmin:createSubAdmin,
  allSubAdmin:allSubAdmin,
}