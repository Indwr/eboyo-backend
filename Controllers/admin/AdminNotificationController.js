/**
 * Created by Indersein on 18/06/21.
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
const DEFAULT_RESTAURANT_WORKING_TIME =
  APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;

let allNotification = async (payloadData, UserData) => {
  console.log("getFaq==init");
  try {
    let criteria = {};
    let projection = { __v: 0 };
    let options = {
      skip: payloadData.skip,
      limit: payloadData.limit,
      lean: true,
    };
    let queryResult = await Promise.all([
      Service.NotificationTextService.getData(criteria, projection, options),
      Service.NotificationTextService.countData(criteria),
    ]);
    let totalCount = queryResult[1];
    return {
      totalCount: totalCount,
      notificationTextData: queryResult[0] || [],
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let addNotification = async (payloadData, UserData) => {
  try {
    criteria = { event: payloadData.event };
    let checkData = await Service.NotificationTextService.countData(criteria);
    if (checkData > 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.EVENT_NAME_ALREADY_EXIST;
    }
    let data = {
      event: payloadData.event,
      event_message: payloadData.event_message,
      event_secondary_message: payloadData.event_secondary_message,
    };
    let createNotificationText =
      await Service.NotificationTextService.InsertData(data);
    return { notificationText: createNotificationText };
  } catch (err) {
    throw err;
  }
};

let editNotification = async (payloadData, userData) => {
  let isValid = Mongoose.Types.ObjectId.isValid(payloadData._id); //true
  if (isValid === false) {
    throw STATUS_MSG.ERROR.INVALID_NOTIFICATION_ID;
  }
  let criteria = { _id: payloadData._id };
  let projection = { __v: 0 };
  try {
    let notificationTextData = await Service.NotificationTextService.getData(
      criteria,
      projection,
      {
        lean: true,
      }
    );
    if (notificationTextData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_NOTIFICATION_ID;
    }
    let updateCriteria = { _id: notificationTextData[0]._id };
    let dataToSet = {
      event_message: payloadData.event_message,
      event_secondary_message: payloadData.event_secondary_message,
      updatedAt: new Date(),
    };
    let finalData = await Service.NotificationTextService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { notificationTextData: finalData };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  addNotification: addNotification,
  editNotification: editNotification,
  allNotification,
  allNotification,
};
