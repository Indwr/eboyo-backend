'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const tableName        = Models.LogsTable

const async = require("async");
//Get Users from DB
var getData = function (criteria, projection, options) { 
    return new Promise((resolve, reject) => {
        tableName.find(criteria, projection, options).then(data=>{   
            return resolve(data);
        }).catch(err => { 
            return reject(err);
        });
    })
    
};

var InsertData = function (objToSave) { 
    return new Promise((resolve, reject) => {
        new tableName(objToSave).save().then(data => {
            return resolve(data);
        }).catch(err => { 
            if (err.code == 11000 || 11001 === err.code) { 
                if (err.errmsg.indexOf('deviceToken_1') > -1) return reject(STATUS_MSG.ERROR.DEVICE_TOKEN_ALREADY_EXISTS); 
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

var updateData = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        tableName.findOneAndUpdate(criteria, dataToSet, options).then(data => {
            return resolve(JSON.parse(JSON.stringify(data)));
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let updateMultipleDocuments = (criteria, dataToSet, options)=>{
    return new Promise((resolve, reject) => {
        tableName.updateMany(criteria, dataToSet, options).then(data => {
            return resolve(data);
        }).catch(err => {
            if (err.code == 11000 || 11001 === err.code) {
                return reject(err);
            } else {
                return reject(err);
            }
        })
    })
};

let dropIndex =  (IndexName)=>{
    return new Promise((resolve, reject) => {
        tableName.collection.dropIndex(IndexName).then(() => {
            return resolve();
        }).catch(err => {
            return reject(err);             
        })
    })
};

let countData = async (condition)=>{    
    try{
        let count=  await tableName.countDocuments(condition);
        return count
    }catch(error){
        throw error;
    }
};


module.exports = {
    getData    : getData,
    InsertData : InsertData,
    updateData : updateData,
    updateMultipleDocuments:updateMultipleDocuments,
    countData:countData,
};
