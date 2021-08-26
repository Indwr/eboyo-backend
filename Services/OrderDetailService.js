'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const OrderDetailTable        = Models.OrderDetailTable

const async = require("async");
//Get Users from DB
var getData = function (criteria, projection, options) { //console.log("==========CustomerService========getData======init======",criteria);
    return new Promise((resolve, reject) => {
        OrderDetailTable.find(criteria, projection, options).then(data=>{   
            //return resolve(data);
            return resolve(data.length ? JSON.parse(JSON.stringify(data)) :data);
        }).catch(err => { //console.log("err",err);
            return reject(err);
        });
    })
    
};

let InsertData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new OrderDetailTable(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || 11001 === err.code) { 
                if (err.errmsg.indexOf('email_1') > -1) return reject(STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('mobileNumber_1') > -1) return reject(STATUS_MSG.ERROR.MOBILE_NUMBER_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('deviceToken_1') > -1) return reject(STATUS_MSG.ERROR.DEVICE_TOKEN_ALREADY_EXISTS); 
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};
let InsertMany=  (insertArray)=> {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        OrderDetailTable.insertMany(insertArray).then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || 11001 === err.code) { 
                if (err.errmsg.indexOf('email_1') > -1) return reject(STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('mobileNumber_1') > -1) return reject(STATUS_MSG.ERROR.MOBILE_NUMBER_ALREADY_EXISTS); 
                if (err.errmsg.indexOf('deviceToken_1') > -1) return reject(STATUS_MSG.ERROR.DEVICE_TOKEN_ALREADY_EXISTS); 
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};
//Update User in DB
var updateData = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        OrderDetailTable.findOneAndUpdate(criteria, dataToSet, options).then(data => {
            return resolve(JSON.parse(JSON.stringify(data)));
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
               // if (err.errmsg.indexOf('categoryName_1_restaurant_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let updateMultipleDocuments = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        OrderDetailTable.updateMany(criteria, dataToSet, options).then(data => {
            return resolve(data);
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
                if (err.errmsg.indexOf('categoryName_1_restaurant_1') > -1) return reject(STATUS_MSG.ERROR.CATEGORY_NAME_EXISTS);
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let aggregateQuery = async(groupData)=>{
    try{
      let data = await OrderDetailTable.aggregate(groupData);
      return  data
    }catch(error){
        throw error;
    }
};

let countData = async (condition)=>{    
    try{
        let count=  await OrderDetailTable.countDocuments(condition);
        return count
    }catch(error){
        throw error;
    }
};

let dropIndex =  (IndexName)=>{
    return new Promise((resolve, reject) => {
        OrderDetailTable.collection.dropIndex(IndexName).then(() => {
            return resolve();
        }).catch(err => {
            return reject(err);             
        })
    })
};
//dropIndex('deviceToken_1');
module.exports = {
    aggregateQuery:aggregateQuery,
    countData:countData,
    getData    : getData,
    InsertData : InsertData,
    InsertMany:InsertMany,
    updateData : updateData,
    updateMultipleDocuments:updateMultipleDocuments,
};
