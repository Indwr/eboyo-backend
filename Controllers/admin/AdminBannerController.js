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

 let allBanner = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false }
     let projection = {createdAt:0,updatedAt:0,__v:0,bannerAuoIncrement:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.BannerService.getData(criteria, projection, options),
      Service.BannerService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount:totalCount,
      bannerData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let addBanner = async (payloadData,UserData) => {
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
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.image,"bannerImage_",Date.now(),folderName,contentType);

    let ImageData = payloadData.image;
    let data ={
      bannerName:payloadData.bannerName,
      vendorId:payloadData.vendorId,
      isEnabled:payloadData.isEnabled,
      image : imageFile[0],
      type  : payloadData.type, 
    };
    let createBanner = await Service.BannerService.InsertData(data);
    return { banner: createBanner ?? null };

  } catch (err) {
    throw err;
  }
}

let getBanner = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {"isDeleted" : false }
     let projection = {createdAt:0,updatedAt:0,__v:0,bannerAuoIncrement:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.BannerService.getData(criteria, projection, options),
      Service.BannerService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount:totalCount,
      bannerData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let editBanner = async (payloadData,userData) => {
  let criteria = {_id: payloadData.bannerId};
  let projection = {__v: 0};
  try {
    let bannerData = await Service.BannerService.getData(criteria, projection, {
      lean: true,
    });
    if (bannerData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_BANNER_ID;
    }
    let updateCriteria = { _id: bannerData[0]._id };
    let dataToSet ={
      bannerName:payloadData.bannerName,
      vendorId:payloadData.vendorId,
      isEnabled:payloadData.isEnabled,
      updatedAt: new Date(),
    };
    let finalData = await Service.BannerService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { bannerData: finalData };
  } catch (err) {
    throw err;
  }
}

let deleteBanner = async (payloadData,userData) => {
  let criteria = {_id: payloadData.bannerId};
  let projection = {__v: 0};
  try {
    let bannerData = await Service.BannerService.getData(criteria, projection, {
      lean: true,
    });
    if (bannerData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_BANNER_ID;
    }
    let updateCriteria = { _id: bannerData[0]._id };
     let dataToSet = {
        isDeleted: true,
        updatedAt: new Date(),
      };

    let finalData = await Service.BannerService.updateData(updateCriteria,
      dataToSet,{ new: true });
    return { bannerData: finalData };
  } catch (err) {
    throw err;
  }
}
 

 
 

 
 
 
 module.exports = {
  addBanner:addBanner,
  getBanner:getBanner,
  editBanner: editBanner,
  deleteBanner: deleteBanner,
 };
 