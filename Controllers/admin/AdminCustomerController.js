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

 
 
 let getlist= async (payloadData, UserData) => {
  let customerData,
  totalCustomer = 0;
  let criteria = {};
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
  };
  if (payloadData.isVerified) {
    criteria.isVerified = payloadData.isVerified;
  }

  let projection = {
    accessToken: 0,
    passwordResetToken: 0,
    password: 0,
    __v: 0,
    isDeleted: 0,
    Isdefault: 0,
    password: 0,
  };
  try {
    let totalCustomerQ = await Service.CustomerService.getData(
      criteria,
      projection,
      {}
    );
    if (totalCustomerQ.length > 0) {
      totalCustomer = totalCustomerQ.length;
    }
    let customerData = await Service.CustomerService.getData(
      criteria,
      projection,
      options
    ); //console.log("categoryData",categoryData);

    return {
      totalCustomer: totalCustomer,
      customerData: customerData,
    };
  } catch (err) {
    throw err;
  }
}; 
 

let getOrderlist= async (payloadData, UserData) => {
  let isValid = Mongoose.Types.ObjectId.isValid(payloadData.customerId); //true
   if(isValid === false){
    throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CUSTOMER_ID;
   }
  let criteria = {customerId:payloadData.customerId};
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
  };

  try {
    let queryResult = await Promise.all([
       Service.OrderService.getData(criteria,{},options),
       Service.OrderService.countData(criteria,{},{})
    ]);
    return {
      totalCustomerOrder: queryResult[1],
      customerOrderData: queryResult[0],
    };
  } catch (err) {
    throw err;
  }
}; 
 
 
 
 module.exports = {
  getlist:getlist,
  getOrderlist:getOrderlist,
 };
 