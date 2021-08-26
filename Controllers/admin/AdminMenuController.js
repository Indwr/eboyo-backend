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

const APP_CONSTANTS       =   Config.APP_CONSTANTS;
const DEVICE_TYPES        =   APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG          =   APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE    =   APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DOCUMENT_FILE_SIZE  =   APP_CONSTANTS.DOCUMENT_FILE_SIZE;


const addMenu = async (payloadData,UserData)=> {
  try{
    let folderName=APP_CONSTANTS.FOLDER_NAME.images;
    payloadData.adminId = UserData._id;
    if(payloadData.menuId){
      if(typeof payloadData.menuImage!='undefined'){
        if(payloadData.menuImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        let contentType   = payloadData.menuImage.hapi.headers['content-type'];
        let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.menuImage,"menuImage_",UserData._id,folderName,contentType);
        payloadData.menuImage = imageFile[0];
      }
      let criteria = {_id:payloadData.menuId}
      let menuData = await Service.AdminMenuService.updateData(criteria,payloadData,{new:true,lean:true});
      return {menuData}
    }else{ 
      if(typeof payloadData.menuImage=='undefined'){
        throw STATUS_MSG.ERROR.INVALID_FILE;
      }
      if(payloadData.menuImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
        throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
      }
      let contentType   = payloadData.menuImage.hapi.headers['content-type'];
      let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.menuImage,"menuImage_",UserData._id,folderName,contentType);
      payloadData.menuImage = imageFile[0];
      let menuData  = await Service.AdminMenuService.InsertData(payloadData);
      return {menuData}
    }
    
  }catch(err){
    throw err;
  }
}

const getMenuList = async (payloadData,UserData)=> {
  try{
    let criteria = {isDeleted:false};
    let options =  {lean:true,skip:payloadData.skip,limit:payloadData.limit}
    let match =  {$match:{"restaurant" : UserData._id}};
    let lookup = {
      $lookup:
        {
          from: "dishes",
          localField: "_id",
          foreignField: "menuId",
          as: "result"
        }
    }
    let projection = {__v:0,adminId:0 }
    let result = await Promise.all([
      Service.AdminMenuService.countData(criteria),
      Service.AdminMenuService.getData(criteria,projection,options)
    ])
    let totalCount = result[0];
    let menuData  = result[1]; 
    return {totalCount,menuData}
  }catch(err){
    throw err;
  }
}
let deleteMenu = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.menuId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    await Service.AdminMenuService.updateMultipleDocuments(criteria,dataToSet,options);
    return {};
  }catch(err){
    throw err;
  }
};

module.exports = {
  addMenu:addMenu,
  getMenuList:getMenuList,
  deleteMenu:deleteMenu
}