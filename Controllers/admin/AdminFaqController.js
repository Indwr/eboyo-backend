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

 
 
 let create = async (payloadData,UserData) => {
  try {
    let createFaq = await Service.FaqService.InsertData(payloadData);
    return { faq: createFaq };
  } catch (err) {
    throw err;
  }
}

let edit = async (payloadData,userData) => {
  let criteria = {
    _id: payloadData.faqId,
  };
  let projection = {
    __v: 0,
  };
  try {
    let faqData = await Service.FaqService.getData(criteria, projection, {
      lean: true,
    });
    if (faqData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_FAQ_ID;
    }
    let updateCriteria = { _id: faqData[0]._id };
     let dataToSet = {
        userType:payloadData.userType,
        isEnabled: payloadData.isEnabled,
        question: payloadData.question,
        answer: payloadData.answer,
        updatedAt: new Date(),
      };

    let finalData = await Service.FaqService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { faqData: finalData };
  } catch (err) {
    throw err;
  }
}

let deleteFaq = async (payloadData,userData) => {
  let criteria = {
    _id: payloadData.faqId,
  };
  let projection = {
    __v: 0,
  };
  try {
    let faqData = await Service.FaqService.getData(criteria, projection, {
      lean: true,
    });
    if (faqData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_FAQ_ID;
    }
    let updateCriteria = { _id: faqData[0]._id };
     let dataToSet = {
        isDeleted: true,
        updatedAt: new Date(),
      };

    let finalData = await Service.FaqService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    return { faqData: finalData };
  } catch (err) {
    throw err;
  }
}
 
 

 
 
 
 module.exports = {
  create: create,
  edit: edit,
  deleteFaq:deleteFaq
 };
 