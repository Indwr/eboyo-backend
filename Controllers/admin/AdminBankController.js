/**
 * Created by Indersein on 15/04/19.
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
const RazorpayXPaymentsController = require("../RazorpayXPaymentsController");
//  const Controller = require("../../Controllers");
const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const DEFAULT_RESTAURANT_WORKING_TIME =
  APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;

let allBank = async (payloadData, UserData) => {
  console.log("getFaq==init");
  try {
    let criteria = { isDeleted: false };
    let projection = { createdAt: 0, updatedAt: 0, __v: 0 };
    let options = {
      skip: payloadData.skip,
      limit: payloadData.limit,
      lean: true,
    };
    let queryResult = await Promise.all([
      Service.BankDetailService.getData(criteria, projection, options),
      Service.BankDetailService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount: totalCount,
      bannerData: queryResult[0] || [],
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

// let addBank = async (payloadData,UserData) => {
//   try {
//       let criteriaCount = {"isDeleted" : false,userId:payloadData.userId, userType: payloadData.userType}

//       let getCount = await Service.BankDetailService.countData(criteriaCount);
//       console.log(getCount)

//     let data = {
//       userId:payloadData.userId,
//       userType:payloadData.userType,
//       bankName:payloadData.bankName,
//       branch: payloadData.branch,
//       ifscCode: payloadData.ifscCode,
//       accountNumber : payloadData.accountNumber,
//     }
//     let createBankDetail = await Service.BankDetailService.InsertData(data);
//     return { bank: createBankDetail };
//   } catch (err) {
//     throw err;
//   }
// }

let getBank = async (payloadData, UserData) => {
  console.log("getFaq==init");
  try {
    let returnData;
    let criteria = {
      isDeleted: false,
      userId: payloadData.userId,
      userType: payloadData.userType,
    };
    let projection = { __v: 0, bannerAuoIncrement: 0 };
    let options = { lean: true };
    let queryResult = await Service.BankDetailService.getData(
      criteria,
      projection,
      options
    );
    if (queryResult.length > 0) {
      returnData = queryResult[0];
    } else {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.BANK_DETAIL_NOT_FOUND;
    }
    return {
      bankData: returnData,
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let editBank = async (payloadData, userData) => {
  console.log("bankedit criteria2 ", payloadData);
  let criteria = {
    userId: payloadData.userId,
    isDeleted: false,
    userType: payloadData.userType,
  };
  let criteria2 = { _id: payloadData.userId, isDeleted: false };

  let projection = { __v: 0 };
  try {
    let bankData = await Promise.all([
      Service.BankDetailService.getData(criteria, projection, { lean: true }),
      Service.RestaurantService.getData(criteria2, projection, { lean: true }),
    ]);
    if (bankData[0].length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_BANK_ID;
    }
    let updateCriteria = {
      userId: bankData[0][0].userId,
      userType: payloadData.userType,
    };
    console.log("bankdata 0 ", updateCriteria);
    let dataToSet = {
      bankName: payloadData.bankName,
      branch: payloadData.branch,
      ifscCode: payloadData.ifscCode,
      accountNumber: payloadData.accountNumber,
      updatedAt: new Date(),
    };
    console.log("data to set ", dataToSet);
    let name;
    if (payloadData.userType == APP_CONSTANTS.USER_ROLES.RESTAURANT) {
      name = bankData[1][0].restaurantName;
    }
    if (payloadData.userType == APP_CONSTANTS.USER_ROLES.DRIVER) {
      name = bankData[1][0].fullName;
    }
    if (payloadData.userType == APP_CONSTANTS.USER_ROLES.CUSTOMER) {
      name = bankData[1][0].firstName;
    }
    let sendData = {
      name: bankData[1][0]._id,
      email: bankData[1][0].email,
      contact: bankData[1][0].contactNumber,
      type: "employee",
      userType: payloadData.userType,
      ifscCode: payloadData.ifscCode,
      accountNumber: payloadData.accountNumber,
      userName: name,
    };
    await RazorpayXPaymentsController.createContact(sendData);

    let finalData = await Service.BankDetailService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { bankData: finalData };
  } catch (err) {
    throw err;
  }
};

let deleteBank = async (payloadData, userData) => {
  let criteria = { _id: payloadData._id };
  let projection = { __v: 0 };
  try {
    let bankData = await Service.BankDetailService.getData(
      criteria,
      projection,
      {
        lean: true,
      }
    );
    if (bankData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_BANK_ID;
    }
    let updateCriteria = { _id: bankData[0]._id };
    let dataToSet = {
      isDeleted: true,
      updatedAt: new Date(),
    };

    let finalData = await Service.BankDetailService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { bankData: finalData };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  // addBank:addBank,
  getBank: getBank,
  editBank: editBank,
  deleteBank: deleteBank,
};
