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
 
 const APP_CONSTANTS = Config.APP_CONSTANTS;
 const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
 const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
 const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
 const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
 const DEFAULT_RESTAURANT_WORKING_TIME=APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;

 
 
 let getCuisine = async (payloadData,UserData)=> { console.log("getFaq==init");
    try {
      let criteria = {"isDeleted" : false }
      let projection = {createdAt:0,updatedAt:0,__v:0}
      let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
      let queryResult= await Promise.all([
         Service.CuisineService.getData(criteria, projection, options),
      ]);
      let totalCount = queryResult[0] || [];
      return {
        totalCount:totalCount.length,
        cuisineData:queryResult[0] || []
      };
    }catch(err){ //console.log("err",err);
       throw err;
    }
}

let create = async (payloadData,UserData) => {
  try {
    let folderName=APP_CONSTANTS.FOLDER_NAME.BANNER_IMAGES;
    if (typeof payloadData.image=='undefined'){
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.image["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    let contentType   = payloadData.image.hapi.headers['content-type'];
    // let imageFile = await UniversalFunctions.uploadFiles(payloadData.image,"bannerImage_",Date.now(),folderName,contentType);
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.image,"cuisineImage_",Date.now(),folderName,contentType);
    payloadData.image = imageFile[0]
    let createCuisine = await Service.CuisineService.InsertData(payloadData);
    return { cuisine: createCuisine };
  } catch (err) {
    throw err;
  }
}

let editCuisine = async (payloadData,userData) => {
    let criteria = {
    _id: payloadData.cuisineId,
    };
    let projection = {
    __v: 0,
    };
    try {
      let cuisineData = await Service.CuisineService.getData(criteria,projection,{lean: true});
      if (cuisineData.length == 0) {
         throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CUISINE_ID;
      }
      let updateCriteria = { _id: cuisineData[0]._id };
      let dataToSet = {
        cuisineName:payloadData.cuisineName,
        isEnabled: payloadData.isEnabled,
        updatedAt: new Date(),
      };

      let finalData = await Service.CuisineService.updateData(updateCriteria,dataToSet,{new:true});
      return { cuisineData: finalData };
    } catch (err) {
       throw err;
    }
}
 
 

 
 
 
 module.exports = {
  create: create,
  getCuisine: getCuisine,
  editCuisine:editCuisine,
 };
 