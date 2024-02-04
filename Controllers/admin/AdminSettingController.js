/**
 * Created by Indersein on 30/06/21.
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
 
 const APP_CONSTANTS = Config.APP_CONSTANTS;
 const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
 const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
 const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
 const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
 const DEFAULT_RESTAURANT_WORKING_TIME=APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;

 

 let allSetting = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false }
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.SettingsService.getData(criteria, projection, options),
      Service.SettingsService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount:totalCount,
      settingData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let addSetting = async (payloadData,UserData) => {
  try {
    let data ={
      type  : payloadData.type, 
      value : payloadData.value, 
    };
    let createBanner = await Service.SettingsService.InsertData(data);
    return { settingData: createBanner };

  } catch (err) {
    throw err;
  }
}

let getSetting = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false}
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {lean:true}
    let queryResult= await Promise.all([
      Service.SettingsService.getData(criteria, projection, options),
      Service.SettingsService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount:totalCount,
      settingData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let editSetting = async (payloadData,userData) => {
  let criteria = {_id: payloadData._id};
  let projection = {__v: 0};
  try {
    let settingData = await Service.SettingsService.getData(criteria, projection, {
      lean: true,
    });
    if (settingData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_SETTING_ID;
    }
    let updateCriteria = { _id: settingData[0]._id };
    let dataToSet ={
      value:payloadData.value,
      updatedAt: new Date(),
    };
    let finalData = await Service.SettingsService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { settingData: finalData };
  } catch (err) {
    throw err;
  }
}

let deleteSetting = async (payloadData,userData) => {
  let criteria = {_id: payloadData._id};
  let projection = {__v: 0};
  try {
    let settingData = await Service.SettingsService.getData(criteria, projection, {
      lean: true,
    });
    if (settingData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_SETTING_ID;
    }
    let updateCriteria = { _id: settingData[0]._id };
     let dataToSet = {
        isDeleted: true,
        updatedAt: new Date(),
      };

    let finalData = await Service.SettingsService.updateData(updateCriteria,
      dataToSet,{ new: true });
    return { settingData: finalData };
  } catch (err) {
    throw err;
  }
}
 

 
 

 
 
 
 module.exports = {
  allSetting:allSetting,
  getSetting:getSetting,
  addSetting:addSetting,
  editSetting: editSetting,
  deleteSetting: deleteSetting,
 };
 