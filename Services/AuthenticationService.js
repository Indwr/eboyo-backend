/**
 * Created by Indersein on 24/04/2021.
 */

'use strict';

const Models = require('../Models');
const Config = require('../Config');
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG
const tableName        = Models.AuthenticationTable

const async = require("async");
//Get Users from DB
var getData = function (criteria, projection, options) { //console.log("==========CustomerService========getData======init======",criteria);
    return new Promise((resolve, reject) => {
        tableName.find(criteria, projection, options).then(data=>{   
             return resolve(data);
        }).catch(err => { //console.log("err",err);
             return reject(err);
        });
    })
    
};

var InsertData = function (objToSave) {  //console.log("===========InsertData========objToSave========",objToSave);
    return new Promise((resolve, reject) => {
        new tableName(objToSave).save().then(data => {
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

//Update User in DB
var updateData = function (criteria, dataToSet, options) {
    return new Promise((resolve, reject) => {
        tableName.findOneAndUpdate(criteria, dataToSet, options).then(data => {
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

var deleteRow = function(query){
    return new Promise((resolve, reject) => {
        tableName.remove(query).then(data => {
            return resolve(JSON.parse(JSON.stringify(data)));
        }).catch(err => {
                return reject(err);
        })
    })
}

module.exports = {
    getData    : getData,
    InsertData : InsertData,
    updateData : updateData,
    deleteRow:deleteRow,
};
