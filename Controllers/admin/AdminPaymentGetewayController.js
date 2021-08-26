/**
 * Created by Anurag on 18/06/21.
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

 

 let allPaymentGeteway = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {}
     let projection = {__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.PaymentGetewayService.getData(criteria, projection, options),
      Service.PaymentGetewayService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount:totalCount,
      allPaymentGetewayData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let addPaymentGeteway = async (payloadData,UserData) => {
  try {
    criteria = {gateWay:payloadData.gateWay}
    let checkData = await Service.PaymentGetewayService.countData(criteria);
    if(checkData > 0){
      throw APP_CONSTANTS.STATUS_MSG.ERROR.PAYMENT_GETEWAY_ALREADY_EXIST;
    }
    let data ={
      gateWay:payloadData.gateWay,
      secretKey:payloadData.secretKey,
      publicKey:payloadData.publicKey,
      accountNumber:payloadData.accountNumber
    };
    let createPaymentGeteway = await Service.PaymentGetewayService.InsertData(data);
    return { paymentGeteway: createPaymentGeteway };
  } catch (err) {
    throw err;
  }
}


let editPaymentGeteway = async (payloadData,userData) => {
  let isValid = Mongoose.Types.ObjectId.isValid(payloadData._id); //true
  if(isValid === false){
   throw STATUS_MSG.ERROR.INVALID_PAYMENT_GETEWAY_ID;
  }
  let criteria = {_id: payloadData._id};
  let projection = {__v: 0};
  try {
    let paymentGetewayData = await Service.PaymentGetewayService.getData(criteria, projection, {
      lean: true,
    });
    if (paymentGetewayData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PAYMENT_GETEWAY_ID;
    }
    let updateCriteria = { _id: paymentGetewayData[0]._id };
    let dataToSet ={
      secretKey:payloadData.secretKey,
      publicKey:payloadData.publicKey,
      accountNumber:payloadData.accountNumber,
      isEnabled:payloadData.isEnabled,
      updatedAt: new Date(),
    };
    let finalData = await Service.PaymentGetewayService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { updatedPaymentGeteway: finalData };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  addPaymentGeteway:addPaymentGeteway,
  editPaymentGeteway: editPaymentGeteway,
  allPaymentGeteway,allPaymentGeteway,
 };
 