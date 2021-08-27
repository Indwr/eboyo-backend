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

 let create = async (payloadData, UserData) => {
  try {
    if (typeof payloadData.document == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    if (payloadData.discountInPercentage && payloadData.discountInAmount) {
      throw STATUS_MSG.ERROR.SELECT_EITHER_DISCOUNT_IN_PERCENTAGE_OR_AMOUNT;
    }
    if(payloadData.adminPercentage==0 && payloadData.restaurantPercentage==0){
      throw STATUS_MSG.ERROR.ADMIN_RESTAURANT_PERCENTAGE_CAN_NOT_ZERO
    }
    let totalPercentage =payloadData.adminPercentage+payloadData.restaurantPercentage;
    if(totalPercentage>100){
     throw STATUS_MSG.ERROR.PERCENTAGE_NOT_GREATER_THEN_100;
    }
    var ObjectId = Mongoose.Types.ObjectId;
    let restaurantId = [];
    let checkRestaurantArr = payloadData.restaurant != undefined;
    let checkCustomerArr = payloadData.customer != undefined;
    if(checkRestaurantArr){
      payloadData.restaurant.forEach(element => {
         restaurantId.push(ObjectId(element));
      });
    }
    let customerId = [];
    if(checkCustomerArr){
      payloadData.customer.forEach(element2 => {
        customerId.push(ObjectId(element2));
      });
    }
    let folderName=APP_CONSTANTS.FOLDER_NAME.document;
    console.log(payloadData.document);
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.document,"promoImg_",UserData._id,folderName,contentType);
    payloadData.restaurant = restaurantId;
    payloadData.customer = customerId;
    payloadData.image = imageFile[0];
    let createPromo = await Service.PromoCodeService.InsertData(payloadData);
    return { promoCode: createPromo };
  } catch (err) {
    throw err;
  }
};
 
let getList = async (payloadData,UserData)=> { console.log("getFaq==init");
  try {
    let criteria = {"isDeleted" : false}
    let projection = {__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.PromoCodeService.getData(criteria, projection, options),
      Service.PromoCodeService.countData(criteria),
    ]);
    let totalCount = queryResult[1] || 0;
    return {
      totalCount:totalCount,
      getPromoCodeList:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}
 
let updateStatus = async (payloadData, UserData) => {
  try {
    let projection = {__v:0}
    let criteria = {"isDeleted" : false,_id:payloadData.promoCodeId}
    let promoCodeData= await Service.PromoCodeService.getData(criteria, projection, {lean:true});
    
    if (payloadData.discountInPercentage && payloadData.discountInAmount) {
      throw STATUS_MSG.ERROR.SELECT_EITHER_DISCOUNT_IN_PERCENTAGE_OR_AMOUNT;
    }
    let createPromo = await Service.PromoCodeService.updateData({_id:payloadData.promoCodeId},{isActive:payloadData.isActive},{lean:true,new:true});
    delete createPromo.restaurant;
    delete createPromo.customer;
    delete createPromo.__v;
    return { promoCode: createPromo };
  } catch (err) {
    throw err;
  }
};

let edit = async (payloadData, UserData) => {
  try {
    if (payloadData.discountInPercentage && payloadData.discountInAmount) {
      throw STATUS_MSG.ERROR.SELECT_EITHER_DISCOUNT_IN_PERCENTAGE_OR_AMOUNT;
    }
    let criteria = {_id:payloadData.promoCodeId}
    let promoCodeData= await Service.PromoCodeService.getData(criteria, {}, {lean:true});
    if(payloadData.adminPercentage==0 && payloadData.restaurantPercentage==0){
       throw STATUS_MSG.ERROR.ADMIN_RESTAURANT_PERCENTAGE_CAN_NOT_ZERO
    }
    let totalPercentage =payloadData.adminPercentage+payloadData.restaurantPercentage;
    if(totalPercentage>100){
      throw STATUS_MSG.ERROR.PERCENTAGE_NOT_GREATER_THEN_100
    }
    let createPromo = await Service.PromoCodeService.updateData(criteria,payloadData,{lean:true,new:true});
    delete createPromo.__v;
    return { promoCode: createPromo };
  } catch (err) {
    throw err;
  }
}; 

let updateImage = async (payloadData, UserData) => {
  try {
    let updatePromoCodeImage = {};
    let isValid = Mongoose.Types.ObjectId.isValid(payloadData._id); //true
  if(isValid === false){
   throw STATUS_MSG.ERROR.INVALID_PROMOCODE_ID;
  }
    if (typeof payloadData.document == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    let criteria = {_id:payloadData._id}
    let promoCodeData = await Service.PromoCodeService.getData(criteria, {}, {lean:true});
   if(promoCodeData){
    let folderName=APP_CONSTANTS.FOLDER_NAME.document;
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.document,"promoImg_",UserData._id,folderName,contentType);
    payloadData.image = imageFile[0];
     updatePromoCodeImage = await Service.PromoCodeService.updateData(criteria,payloadData,{lean:true,new:true});
   }else{
    throw STATUS_MSG.ERROR.INVALID_PROMO_CODE_ID; 
   }
  
    delete updatePromoCodeImage.__v;
    return { promoCode: updatePromoCodeImage };
  } catch (err) {
    throw err;
  }
}; 
 
 module.exports = {
  getList : getList,
  create  : create,
  updateStatus:updateStatus,
  edit:edit,
  updateImage:updateImage,
 };
 