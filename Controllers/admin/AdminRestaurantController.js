/**
 * Created by Anurag on 15/04/19.
 */
 const Path = require("path");
 const _ = require("underscore");
 //const fs = require('fs').promises;
 const readFilePromise = require('fs-readfile-promise');
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

 
 
 let create = async (payloadData, UserData) => {
  let folderName=APP_CONSTANTS.FOLDER_NAME.images;
  try {
    if (typeof payloadData.logo == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.logo["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    payloadData.document = payloadData.logo;
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let queryResult = await Promise.all([
      UniversalFunctions.uploadFiles(payloadData.document,"restaurantImage_",Date.now(),folderName,contentType),
      Service.CityService.getData({_id:payloadData.cityId},{},{}),
      Service.CategoryService.getData({_id:{$in:payloadData.category}},{_id:1},{}),      
    ]);    
    let imageFile = queryResult[0];
    let cityData= queryResult[1] || [];
    let categoryData = queryResult[2] || [];
    if(cityData.length==0){
      throw STATUS_MSG.ERROR.INVALID_CITY_ID;
    }
    console.log("categoryData.length",categoryData.length,payloadData.category.length);
    if(categoryData.length!=payloadData.category.length){
      throw STATUS_MSG.ERROR.INVALID_CATEGORY_ID;
    }
    
    let generatePassword = await UniversalFunctions.generatePassword(10,true);
    payloadData.encryptedPassword = UniversalFunctions.encryptedPassword(generatePassword);
     
    let data = {
      restaurantName: payloadData.restaurantName,
      email: payloadData.email,
      contactNumber: payloadData.contactNumber,
      city: cityData[0].cityName,
      cityId: cityData[0]._id,
      state: payloadData.state,
      country: payloadData.country,
      vendorFullAddress: payloadData.vendorFullAddress,
      averageProcessingTime: payloadData.averageProcessingTime,
      restaurantFoodType: payloadData.restaurantFoodType,
      minimumOrderAmount: payloadData.minimumOrderAmount,
      businessLicenceNumber: payloadData.businessLicenceNumber,
      costForTwoPerson: payloadData.costForTwoPerson,
      vendorFullAddress: payloadData.vendorFullAddress,
      password: payloadData.encryptedPassword,
      location: {
        type: "Point",
        coordinates: [payloadData.longitude, payloadData.latitude],
      },
      logo: imageFile[0],
      category:payloadData.category,
      adminCommssion: payloadData.adminCommssion,
      adminCommssionType: payloadData.adminCommssionType,
      adminGstPercentage:payloadData.adminGstPercentage,

      restaurantGstPercentage:payloadData.restaurantGstPercentage,
      restaurantGstActivated:payloadData.restaurantGstActivated
      
    };
    //console.log("data",data);
    restaurantData = await Service.RestaurantService.InsertData(data);
    for (let element of DEFAULT_RESTAURANT_WORKING_TIME){
      element.restaurant = restaurantData._id
      let saveW = await Service.RestaurantWorkingTimeService.InsertData(element);
    }
    let templatepath      = Path.join(__dirname, '../../emailTemplates/');
    let fileReadStream    =  templatepath + 'welcomeUser.html';  
    let emailTemplate     = await readFilePromise(fileReadStream);
    emailTemplate         = emailTemplate.toString(); 
    let sendStr = emailTemplate.replace('{{userPassword}}',generatePassword).replace('{{path}}',"resetPasswordLink");    
    let  sendToDriver = {to:payloadData.email,subject:'Welcome To Eboyo',html:sendStr};
    UniversalFunctions.sendMail(sendToDriver);
    let saveBankDetail = {
      userId:restaurantData._id,
      userType:APP_CONSTANTS.USER_ROLES.RESTAURANT,
      bankName     : '',
      branch       : '',
      ifscCode     : '',
      accountNumber: '',
   }
     Service.BankDetailService.InsertData(saveBankDetail);
    return { restaurantData };
  } catch (err) { console.log("err",err);
    throw err;
  }
};



let getAll = async (payloadData, UserData) => {
  if(payloadData.cityId){
    let isValid = Mongoose.Types.ObjectId.isValid(payloadData.cityId); //true
     if(isValid === false){
      throw STATUS_MSG.ERROR.INVALID_CITY_ID;
     }
  }

  console.log("AdminRestaurantController");
  let search  = payloadData.search;
  let restaurantData,
    totalRestaurant = 0;
  let criteria = {};
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
    sort: { createdAt: -1 },
  };
  if (payloadData.isVerified) {
    criteria.isVerified = payloadData.isVerified;
  }
  if(payloadData.search){
    criteria =  { restaurantName: { $regex: payloadData.search  } }
  }
  if(payloadData.cityId){
    criteria.cityId =  payloadData.cityId;
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
    let totalRestaurantQ = await Service.RestaurantService.getData(
      criteria,
      projection,
      {}
    );
    if (totalRestaurantQ.length > 0) {
      totalRestaurant = totalRestaurantQ.length;
    }
    let restaurantData = await Service.RestaurantService.getData(
      criteria,
      projection,
      options
    ); //console.log("categoryData",categoryData);

    return {
      totalRestaurant: totalRestaurant,
      restaurantData: restaurantData,
    };
  } catch (err) {
    throw err;
  }
}; 

let restaurantDetail = async (payloadData, UserData) => {
  let restaurantData = [];
  let criteria = { _id: payloadData.restaurantId };
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
    let locationC= {restaurant:{$in:[payloadData.restaurantId]}}
    let result = await Promise.all([
      Service.RestaurantService.getData(criteria,projection,{lean:true}),
      Service.RestaurantAreaService.getData(locationC,{deliveryServiceArea:0,restaurant:0},{}),
      Service.BankDetailService.getData({userId:payloadData.restaurantId , "userType" : "Restaurant"},{},{lean:true}),
    ])
    let locationData= result[1]
    restaurantData = result[0]
    bankDetails = result[2]
    return {
      locationData,
      restaurantData: restaurantData[0] || {},
      bankDetails: bankDetails[0] || {},
    };
  } catch (err) {
    throw err;
  }
};
 
 
let editRestaurant = async (payloadData, UserData) => {
  try {
    let criteria = {_id:payloadData.restaurantId}
    let queryResult = await Promise.all([
      Service.CityService.getData({_id:payloadData.cityId},{},{}),
      Service.CategoryService.getData({_id:{$in:payloadData.category}},{_id:1},{}),      
    ]);    
    
    let cityData= queryResult[0] || [];
    let categoryData = queryResult[1] || [];
    if(cityData.length==0){
      throw STATUS_MSG.ERROR.INVALID_CITY_ID;
    } ; //console.log("categoryData.length",categoryData.length,payloadData.category.length);
    if(categoryData.length!=payloadData.category.length){
      throw STATUS_MSG.ERROR.INVALID_CATEGORY_ID;
    }
    
    let dataToSet = {
      restaurantName: payloadData.restaurantName,
      contactNumber: payloadData.contactNumber,
      city: cityData[0].cityName,
      cityId: cityData[0]._id,
      state: payloadData.state,
      country: payloadData.country,
      vendorFullAddress: payloadData.vendorFullAddress,
      averageProcessingTime: payloadData.averageProcessingTime,
      restaurantFoodType: payloadData.restaurantFoodType,
      
      minimumOrderAmount: payloadData.minimumOrderAmount,
      businessLicenceNumber: payloadData.businessLicenceNumber,
      costForTwoPerson: payloadData.costForTwoPerson,
      vendorFullAddress: payloadData.vendorFullAddress,
      category:payloadData.category,

      adminCommssion: payloadData.adminCommssion,
      adminCommssionType: payloadData.adminCommssionType,
      adminGstPercentage:payloadData.adminGstPercentage,
      
      
      restaurantGstPercentage:payloadData.restaurantGstPercentage,
      restaurantGstActivated:payloadData.restaurantGstActivated
      
    };
    //console.log("data",data);
    restaurantData = await Service.RestaurantService.updateData(criteria, dataToSet, {new:true,lean:true});
    return {restaurantData };
  } catch (err) { console.log("err",err);
    throw err;
  }
};

let updatelogo = async (payloadData, UserData) => {
  let criteria = {_id:payloadData.restaurantId}
  let folderName=APP_CONSTANTS.FOLDER_NAME.images;
  try {
    if (typeof payloadData.logo == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.logo["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    payloadData.document = payloadData.logo;
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let queryResult = await Promise.all([
      UniversalFunctions.uploadFiles(payloadData.document,"restaurantImage_",Date.now(),folderName,contentType),
    ]);    
    let imageFile = queryResult[0];
    
    let dataToSet = {logo: imageFile[0]}; //console.log("dataToset",dataToset);
    restaurantData = await Service.RestaurantService.updateData(criteria, dataToSet, {new:true,lean:true});
    return { restaurantData };
  } catch (err) { console.log("err",err);
    throw err;
  }
};
 
 
 
 module.exports = {
  create: create,
  getAll: getAll,
  editRestaurant:editRestaurant,
  restaurantDetail:restaurantDetail,
  updatelogo:updatelogo
 };
 