/**
 * Created by Indersein on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
const readFilePromise = require("fs-readfile-promise");
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
const DEFAULT_RESTAURANT_WORKING_TIME =
  APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;

let create = async (payloadData, UserData) => {
  console.log("create=========init");
  try {
    let generatePassword = await UniversalFunctions.generatePassword(10, true);
    let data = {
      fullName: payloadData.fullName,
      email: payloadData.email,
      phoneNo: payloadData.phoneNo,
      cityId: payloadData.cityId,
      currentLocation: { type: "Point", coordinates: [0, 0] },
      password: UniversalFunctions.encryptedPassword(generatePassword),
    };
    let driverData = await Service.DriverService.InsertData(data);
    let templatepath = Path.join(__dirname, "../../emailTemplates/");
    let fileReadStream = templatepath + "welcomeUser.html";
    let emailTemplate = await readFilePromise(fileReadStream);
    emailTemplate = emailTemplate.toString();
    let sendStr = emailTemplate
      .replace("{{userPassword}}", generatePassword)
      .replace("{{path}}", "resetPasswordLink");
    let sendToDriver = {
      to: payloadData.email,
      subject: "Welcome To bytebots",
      html: sendStr,
    };
    UniversalFunctions.sendMail(sendToDriver);
    return { driverData };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let createBonus = async (payloadData, UserData) => {
  try {
    payloadData.adminId = UserData._id;
    let driverData = await Service.DriverBonusService.InsertData(payloadData);
    return { driverData };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let getAll = async (payloadData, UserData) => {
  let driverData;
  let criteria = {};
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
    sort: { restaurantName: 1 },
  };
  if (payloadData.isVerified) {
    criteria.isVerified = payloadData.isVerified;
  }

  if (payloadData.IsBusy !== undefined) {
    criteria.IsBusy = payloadData.IsBusy;
  }

  if (payloadData.Islogin !== undefined) {
    criteria.Islogin = payloadData.Islogin;
  }

  let criteria1 = { IsBusy: true };
  let criteria2 = { Islogin: true, IsBusy: false };
  let criteria3 = { Islogin: false };
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
    let queryResult = await Promise.all([
      Service.DriverService.countData(criteria),
      Service.DriverService.getData(criteria, projection, options),
      Service.DriverService.countData(criteria1),
      Service.DriverService.countData(criteria2),
      Service.DriverService.countData(criteria3),
    ]);
    let totalCount = queryResult[0] || 0;
    driverData = queryResult[1] || [];
    let totalBusyDriverCount = queryResult[2] || 0;
    let totalactiveDriversCount = queryResult[3] || 0;
    let totalInactiveDriverCount = queryResult[4] || 0;
    return {
      totalCount: totalCount,
      totalBusyDriverCount: totalBusyDriverCount,
      totalfreeDriversCount: totalactiveDriversCount,
      totalInactiveDriverCount: totalInactiveDriverCount,
      driverData: driverData,
    };
  } catch (err) {
    throw err;
  }
};

let driverDetail = async (payloadData, UserData) => {
  let driverData;
  let criteria = { _id: payloadData.driverId };
  let options = { lean: true };

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
    let queryResult = await Promise.all([
      Service.DriverService.getData(criteria, projection, options),
    ]);
    driverData = queryResult[0].length > 0 ? queryResult[0][0] : {};
    return {
      driverData: driverData,
    };
  } catch (err) {
    throw err;
  }
};

let verifyDocument = async (payloadData, UserData) => {
  let criteria = { _id: payloadData.driverId };
  let projection = { __v: 0 };
  try {
    let driverData = await Service.DriverService.getData(criteria, projection, {
      lean: true,
    });
    console.log("criteria", criteria);
    if (driverData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_DRIVER_ID;
    }

    let dataToSet = {
      Isverified: payloadData.status,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };
    // if (payloadData.documentType == 1) {
    //   dataToSet = {
    //     "adharcardDoc.Isverified": payloadData.status,
    //     updatedAt: new Date(),
    //   };
    // } else {
    //   dataToSet = {
    //     "drivingLicense.Isverified": payloadData.status,
    //     updatedAt: new Date(),
    //   };
    // }
    let finalData = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      { new: true }
    );
    delete finalData.password;
    delete finalData.accessToken;
    return { driverData: finalData };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  create: create,
  getAll: getAll,
  createBonus: createBonus,
  verifyDocument: verifyDocument,
  driverDetail: driverDetail,
};
