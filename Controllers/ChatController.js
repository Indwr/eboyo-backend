/**
 * Created by Indersein on 13/04/2020.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require("mongoose");

const FCM = require("fcm-node");

const Service = require("../Services");
const Models = require("../Models");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunctions");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const RIDE_INVITATION_STATUS = APP_CONSTANTS.RIDE_INVITATION_STATUS;

var FCM_KEY = APP_CONSTANTS.FCM_KEY;

const sendMessage = async (payloadData, UserData) => {
  try {
    payloadData.senderId = UserData._id;
    let chatData = await Service.ChatService.InsertData(payloadData);
    return { chatData: chatData };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

const getChatMessage = async (payloadData, UserData) => {
  let criteria = {
    $or: [
      {
        $and: [
          { senderId: UserData._id },
          { receiverId: payloadData.receiverId },
        ],
      },
      {
        $and: [
          { senderId: payloadData.receiverId },
          { receiverId: UserData._id },
        ],
      },
    ],
  };
  try {
    let projection = { __v: 0 };
    let option = {
      skip: payloadData.skip,
      limit: payloadData.limit,
      lean: true,
      sort: { messageAutoIncrementId: 1 },
    };
    let collectionOptions = [
      {
        path: "receiverId",
        model: "customer",
        select: "_id firstName lastName email countryCode mobileNumber",
        options: { lean: true },
      },
      {
        path: "senderId",
        model: "customer",
        select: "_id firstName lastName email countryCode mobileNumber",
        options: { lean: true },
      },
    ];
    let queryResult = await Promise.all([
      await Service.ChatService.getData(criteria, projection, {}),
      await Service.DAOService.getDataWithReferenceFixed(
        Models.Chat,
        criteria,
        projection,
        option,
        collectionOptions
      ),
    ]); //console.log("queryResult",queryResult);
    let chatData = queryResult[1] || [];
    let totalRecord = queryResult[0].length || 0;
    return {
      totalCount: totalRecord,
      chatData: chatData,
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

const chatMedia = async (payloadData, UserData) => {
  console.log("====chatMedia=======init");

  let document = payloadData.mediaFile;
  let imagePrefix = "chatFile_";

  try {
    let dataImageArray = [];

    if (typeof payloadData.mediaFile == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (Array.isArray(document) == true) {
      for (var i = 0; i < document.length; i++) {
        let imageList =
          await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(
            document[i],
            { _id: 1 },
            imagePrefix + i + "_"
          );
        dataImageArray.push(imageList);
      }
    } else {
      if (payloadData.isMediaTypeVideo) {
        if (document["_data"].length > DOCUMENT_FILE_SIZE.VIDEO_SIZE) {
          throw STATUS_MSG.ERROR.VIDEO_SIZE_LIMIT;
        }
      } else {
        if (document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
      }

      let imageList =
        await UniversalFunctions.uploadDocumentOnLocalMachineUsingFile(
          document,
          { _id: 1 },
          imagePrefix
        );
      dataImageArray.push(imageList);
    }
    console.log("dataImageArray===", dataImageArray);

    let dataToSet = {
      textMessage: null,
      senderId: UserData._id,
      receiverId: payloadData.receiverId,
    };
    if (payloadData.isMediaTypeVideo) {
      dataToSet.videoURL = dataImageArray[0];
    } else {
      dataToSet.imageURL = {
        original: dataImageArray[0],
        thumbnail: dataImageArray[0],
      };
    }
    let insertIntoDb = await Service.ChatService.InsertData(dataToSet);
    return insertIntoDb;
  } catch (err) {
    throw err;
  }
};

const sendNotificationTest = async (payloadData) => {
  try {
    console.log("payloadData", payloadData);
    await UniversalFunctions.sendNotificationUsingFCM(payloadData);
    return {};
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

module.exports = {
  sendMessage: sendMessage,
  getChatMessage: getChatMessage,
  chatMedia: chatMedia,
  sendNotificationTest: sendNotificationTest,
};
