/**
 * Created by Indersein on 12/07/21.
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
      Service.FrontEndSettingService.getData(criteria, projection, options),
      Service.FrontEndSettingService.countData(criteria),
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
   let image;
    let criteria = {
      route:payloadData.route
    }
    let queryResult = await Service.FrontEndSettingService.getData(criteria, {}, {lean:true});
      if(queryResult.length > 0){
        throw APP_CONSTANTS.STATUS_MSG.ERROR.ROUTE_ALREADY_EXIST
      }

      // Uploading Image if exist
      if (typeof payloadData.image != "undefined") {
        if (payloadData.image["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        let folderName=APP_CONSTANTS.FOLDER_NAME.images;
        let contentType   = payloadData.image.hapi.headers['content-type'];
        let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.image,"frontEndImages_",UserData._id,folderName,contentType);
        image  = imageFile[0].original
      }
      console.log(image)
      let data ={
        route  : payloadData.route, 
        value : payloadData.value, 
        image : image
      };
     // end Image Upload
    let createBanner = await Service.FrontEndSettingService.InsertData(data);
    return { settingData: createBanner };

  } catch (err) {
    throw err;
  }
}

let getSetting = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false}
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {lean:true,skip:payloadData.skip,limit:payloadData.limit}
    let queryResult= await Promise.all([
      Service.FrontEndSettingService.getData(criteria, projection, options),
      Service.FrontEndSettingService.countData(criteria),
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

let getSingleSetting = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false,route:payloadData.route}
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {lean:true}
      let queryResult= await Service.FrontEndSettingService.getData(criteria, projection, options);
    return {
      frontEndSettingData:queryResult[0] || {}
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let editSetting = async (payloadData,UserData) => {
  let image;
  let criteria = {_id: payloadData._id};
  let projection = {__v: 0};
  try {
    let settingData = await Service.FrontEndSettingService.getData(criteria, projection, {
      lean: true,
    });
    if (settingData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_SETTING_ID;
    }

     // Uploading Image if exist
     if (typeof payloadData.image != "undefined") {
      if (payloadData.image["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
        throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
      }
      let folderName=APP_CONSTANTS.FOLDER_NAME.images;
      let contentType   = payloadData.image.hapi.headers['content-type'];
      let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.image,"frontEndImages_",UserData._id,folderName,contentType);
      image  = imageFile[0].original
    }

   // end Image Upload



    let updateCriteria = { _id: settingData[0]._id };
    let dataToSet ={
      value:payloadData.value,
      image:image,
      updatedAt: new Date(),
    };
    let finalData = await Service.FrontEndSettingService.updateData(
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
    let settingData = await Service.FrontEndSettingService.getData(criteria, projection, {
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

    let finalData = await Service.FrontEndSettingService.updateData(updateCriteria,
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
  getSingleSetting:getSingleSetting,
 };
 