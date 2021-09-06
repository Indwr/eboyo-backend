/**
 * Created by Anurag on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Moment = require('moment');
const Mongoose = require("mongoose");

const Service = require("../../Services");
const Models = require("../../Models");
const Config = require("../../Config");
const UniversalFunctions = require("../../Utils/UniversalFunctions");
const CommonController = require("../CommonController");
const findRemoveSync = require('find-remove');
const { v4: uuidv4 } = require('uuid');
const readFilePromise = require('fs-readfile-promise');

const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const DEFAULT_RESTAURANT_WORKING_TIME=APP_CONSTANTS.DEFAULT_RESTAURANT_WORKING_TIME;




const login = async (payloadData) => {
  payloadData.password = UniversalFunctions.encryptedPassword(
    payloadData.password
  );
  let criteria = {
    password: payloadData.password,
    email: payloadData.email,
  };
  let projection = {
    password: 0,
    __v: 0,
  };
  try {
    let userData = await Service.AdminService.getData(criteria, projection, {
      lean: true,
    }); //console.log("userData",userData);
    if (userData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }
    let accessToken = await UniversalFunctions.generateAuthToken({
      _id: userData[0]._id,
      email: userData[0].email,
      name: userData[0].email,
      role: APP_CONSTANTS.USER_ROLES.ADMIN,
    }); //console.log("accessToken",accessToken);
    let updateCriteria = { _id: userData[0]._id };
    let dataToSet = {
      accessToken: accessToken,
      updatedAt: new Date(),
    };
    let finalData = await Service.AdminService.updateData(
      updateCriteria,
      dataToSet,
      { new: true }
    );
    let insertLog = {
      userId     : finalData._id,
      userType   : APP_CONSTANTS.USER_ROLES.ADMIN,
      platform   : payloadData.userAgent.platform,
      browser    : payloadData.userAgent.browser,
      ip_address : payloadData.ip,
      eventType  : APP_CONSTANTS.EVENT_TYPE.LOGIN,
      raw        : payloadData.userAgent
    }
    insertLog.raw.token = accessToken
    Service.LogService.InsertData(insertLog);
    // Send Email For Login Time
    let templatepath      = Path.join(__dirname, '../../emailTemplates/');
    let fileReadStream    =  templatepath + 'last-login.html';  
    let emailTemplate     = await readFilePromise(fileReadStream);
    emailTemplate         = emailTemplate.toString(); 
    let currentTime = new Date();
    let name = finalData.name ?? 'Dummy';
    let device = payloadData.userAgent.browser +' '+ payloadData.userAgent.platform;
    let location = payloadData.userAgent.location ?? '';
    let sendStr = emailTemplate.replace('{{name}}',name).replace('{{device}}',device).replace('{{location}}',location).replace('{{time}}',currentTime);    
    let  sendToDriver = {to:payloadData.email,subject:'Welcome To Eboyo',html:sendStr};
    UniversalFunctions.sendMail(sendToDriver);
    // End Code For sending mail for login
    return { adminData: finalData };
  } catch (err) {
    throw err;
  }
};

let logout = async (payloadData,UserData) => {
  console.log("UserData",UserData);
  try {
    let criteria = { _id: UserData._id };
    let dataToSet = {
      $unset: {
        accessToken: 1,
        deviceToken: 1,
      },
    };
    let options = {};
    let updatePassWord = await Service.AdminService.updateData(
      criteria,
      dataToSet,
      options
    );
    let insertLog = {
      userId     : UserData._id,
      userType   : APP_CONSTANTS.USER_ROLES.ADMIN,
      platform   : payloadData.userAgent.platform,
      browser    : payloadData.userAgent.browser,
      ip_address : payloadData.ip,
      eventType  : APP_CONSTANTS.EVENT_TYPE.LOGOUT,
      raw        : payloadData.userAgent
    }
    insertLog.raw.token = UserData.accessToken
    Service.LogService.InsertData(insertLog);

    return {};
  } catch (err) {
    throw err;
  }
};

let getDashboardData = async(payloadData, UserData) => {
  try {
    let criteria = {};
    payloadData.startDate = Moment(payloadData.startDate).format("YYYY-MM-DD"); 
    payloadData.startDate =  payloadData.startDate.toString();
    payloadData.endDate =   Moment(payloadData.endDate).add(1, 'days'); 
    payloadData.endDate = new Date(payloadData.endDate); 
    // criteria = { $gte : payloadData.startDate, $lt : payloadData.endDate, }
console.log(criteria);
    
    // let match ={
    //   $match: {$gte:'2021-09-05',$lt:'2021-09-07'}
    // }
    let match = { "$match": {
      createdAt: {$gte: new Date(payloadData.startDate), $lt: new Date(payloadData.endDate)}
  }};
  let match2 = { "$match": {}};
    console.log(match)
    let groupBy ={
      $group:  {
        _id :  null,
        totalAmount: { $sum: "$totalPrice" },
      }
    }
    let queryResult = await Promise.all([
      Service.CustomerService.countData({}),
      Service.DriverService.countData({}),
      Service.RestaurantService.countData({}),
      Service.OrderService.countData({}),
      Service.OrderService.aggregateQuery([match,groupBy,{$sort:{"_id":1}}]),
      Service.OrderService.aggregateQuery([match2,groupBy,{$sort:{"_id":1}}]),
      Service.CustomerService.countData({createdAt: {$gte: new Date(payloadData.startDate), $lt: new Date(payloadData.endDate)}}),
      Service.OrderService.countData({status:APP_CONSTANTS.ORDER_STATUS.COMPLETED}),
      Service.OrderService.countData({status:APP_CONSTANTS.ORDER_STATUS.PENDING}),
      Service.OrderService.countData({status:APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER}),
      Service.OrderService.countData({status: { $in: [APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RESTAURANT, APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_CUSTOMER,APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RIDER ]}}),
    ])
    
    let totalCustomer = queryResult[0];
    let totalDriver = queryResult[1];
    let totalRestaurant = queryResult[2];
    let totalOrder = queryResult[3];
    let todaySales = (queryResult[4].length > 0) ? queryResult[4][0].totalAmount : 0;
    let totalSales = (queryResult[5].length > 0) ? queryResult[5][0].totalAmount : 0;
    let todayCustomers = queryResult[6];
    let totalCompletedOrders = queryResult[7];
    let totalPendingOrders = queryResult[8];
    let totalCanceledOrders = queryResult[9];
    return {
      todayCustomers,totalCustomer,totalDriver,totalRestaurant,totalOrder,todaySales,totalSales,totalCompletedOrders,totalPendingOrders,totalCanceledOrders,
      top5Restaurant:[],
      top5Customer:[],
      top5Driver:[],
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

let dashboard = async (payloadData, UserData) => {
  try {
    let condition = {};
    let queryResult = await Promise.all([
      Service.DriverService.countData(condition),
      Service.CustomerService.countData(condition),
      Service.RestaurantService.countData(condition),
      Service.OrderService.countData(condition),
    ]);
    let driverCount = queryResult[0] || 0;
    let customerCount = queryResult[1] || 0;
    let restaurantCount = queryResult[2] || 0;
    let orderCount = queryResult[3] || 0;
    return {
      driverCount: driverCount,customerCount:customerCount,restaurantCount:restaurantCount,orderCount:orderCount
    };
  } catch (err) {
    throw err;
  }
};

let driverDetail = async (payloadData, UserData) => {
  let criteria = { _id: payloadData.driverId };
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
    let driverData = await Service.DriverService.getData(criteria, projection, {
      lean: true,
    });
    if (driverData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_DRIVER_ID;
    }

    return {
      driverData: driverData[0],
    };
  } catch (err) {
    throw err;
  }
};

let getInvoiceData = async (payloadData, UserData) => {
  let criteria = { };
   let checkCustomer = payloadData.type == APP_CONSTANTS.USER_ROLES.CUSTOMER;
   let checkDriver = payloadData.type == APP_CONSTANTS.USER_ROLES.DRIVER;
   let checkRestaurant = payloadData.type == APP_CONSTANTS.USER_ROLES.RESTAURANT;
  if(checkCustomer){
    criteria.customerId = payloadData._id;
  }
  if(checkDriver){
    criteria.driverId = payloadData._id;
  }
  if(checkRestaurant){
    criteria.restaurantId = payloadData._id;
  }
  let projection = {status:1,paymentType:1,adminCommission:1,orderAuoIncrement:1,driverCommission:1,finalDistance:1,restaurantCommission:1,totalPrice:1,pricePaidByCustomer:1,paymentStatus:1,itemTotalPrice:1,address:1,restaurantId:1,customerId:1,promoCodeDetails:1,customerDeliveryCharge:1,adminGstOnCommission:1,riderDeliveryCharge:1};
  let collectionOptions =[
    {
      path: 'restaurantId',
      model: 'restaurant',
      select: '_id logo rating restaurantName restaurantAutoIncrementId ',
      options: {lean: true}
    },  
    {
      path: 'customerId',
      model: 'customer',
      select: '_id logo rating firstName lastName custermerAutoIncrementId ',
      options: {lean: true}
    },   
  ];
  let options= {lean: true,skip:payloadData.skip,limit:payloadData.limit,sort:{orderAuoIncrement:-1}}
  try {
    let result = await Promise.all([
      Service.OrderService.countData(criteria),
      Service.DAOService.getDataWithReferenceFixed(Models.OrderTable,criteria,projection,options,collectionOptions)
    ])
    let totalCount= result[0];
    let InvoiceData= result[1];

    return { totalCount,InvoiceData };
  } catch (err) {
    throw err;
  }
};

let getOrderDataPdfLink = async (payloadData, UserData) => {
  let criteria = { };
  let pdfParms = {};
  let extractPdfData = [];
  if(payloadData.startDate){
    payloadData.startDate = Moment(payloadData.startDate).format("YYYY-MM-DD"); 
    payloadData.startDate =  payloadData.startDate.toString();
    payloadData.endDate =   Moment(payloadData.endDate).add(1, 'days'); 
    payloadData.endDate = new Date(payloadData.endDate); 
    criteria.createdAt ={ "$gte" : payloadData.startDate, "$lte" : payloadData.endDate, }
  }
  let projection = {status:1,paymentType:1,adminCommission:1,orderAuoIncrement:1,driverCommission:1,finalDistance:1,restaurantCommission:1,totalPrice:1,pricePaidByCustomer:1,paymentStatus:1,itemTotalPrice:1,address:1,restaurantId:1,customerId:1,promoCodeDetails:1,customerDeliveryCharge:1,adminGstOnCommission:1,riderDeliveryCharge:1};
  let collectionOptions =[
    {
      path: 'restaurantId',
      model: 'restaurant',
      select: '_id logo rating restaurantName restaurantAutoIncrementId ',
      options: {lean: true}
    },  
    {
      path: 'customerId',
      model: 'customer',
      select: '_id logo rating firstName lastName custermerAutoIncrementId ',
      options: {lean: true}
    },   
  ];
  let options= {lean: true,skip:payloadData.skip,limit:payloadData.limit,sort:{orderAuoIncrement:-1}}
  try {
    let result = await Promise.all([
      Service.OrderService.countData(criteria),
      Service.DAOService.getDataWithReferenceFixed(Models.OrderTable,criteria,projection,options,collectionOptions)
    ])
    let totalCount= result[0];
    let InvoiceData= result[1];

    let ii = 0;
    let finalObject = {};
    InvoiceData.forEach(element => {
      finalObject.serialNo = ii++;
      finalObject.OrderId = element._id;
      finalObject.Restaurant = element.restaurantId.restaurantName;
      finalObject.totalPrice = (element.totalPrice == undefined) ? 0 : element.totalPrice;
      finalObject.pricePaidByCustomer = (element.pricePaidByCustomer == undefined) ? 0 : element.pricePaidByCustomer;
      finalObject.itemTotalPrice = (element.itemTotalPrice == undefined) ? 0 : element.itemTotalPrice;
      finalObject.restaurantCommission = (element.restaurantCommission == undefined) ? 0 : element.restaurantCommission;
      finalObject.adminCommission = (element.adminCommission == undefined) ? 0 : element.adminCommission;
      finalObject.driverCommission = (element.driverCommission == undefined) ? 0 : element.driverCommission;
      finalObject.promoCode = (element.promoCodeDetails.discountApplied == undefined) ? 0 : element.promoCodeDetails.discountApplied;
      extractPdfData.push(finalObject);
    });
    let pdfData = extractPdfData;
    let headers = [
      {
        headerName: "#",
      },
      {
        headerName: "OrderId",
      },
      {
        headerName: "Restaurant",
      },
      {
        headerName: "Total Price",
      },
      {
        headerName: "Paid by Customer",
      },
      {
        headerName: "Items Price",
      },
      {
        headerName: "Restaurant Earning",
      },
      {
        headerName: "Admin Earning",
      },
      {
        headerName: "Driver Earning",
      },
      {
        headerName: "promo Code",
      },
    ];
    pdfParms.pdfData = pdfData;
    pdfParms.headers = headers;
    pdfParms.pdfTemplate = 'order-data.html';
    // console.log(pdfParms)
    let PdfLink = await CommonController.generatePdf(pdfParms);
    findRemoveSync('./pdfFile', {age: {seconds: 60}, extensions: '.pdf', limit: 100})
    return { totalCount,PdfLink};
  } catch (err) {
    throw err;
  }
};

let createCategory = async (payloadData,UserData)=> { console.log("createCategory==init");
  try {
    let folderName=APP_CONSTANTS.FOLDER_NAME.images;
    if (typeof payloadData.document=='undefined'){
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(payloadData.document,"catImage_",Date.now(),folderName,contentType);
    let categoryData;
    let data ={
      categoryName:payloadData.categoryName,
      imageURL : imageFile[0]
    };
    categoryData = await Service.CategoryService.InsertData(data); 
    return {categoryData};
  }catch(err){ //console.log("err",err);
    throw err;
  }
};

let addCity = async (payloadData, UserData) => {
  try {
    let createCity;
    // payloadData.deliveryCharge={
    //   minimumDistance: payloadData.minimumDistance,
		//   minimumPrice: payloadData.minimumPrice
    // }     
    payloadData.adminId= UserData._id;
    if(payloadData.cityId){
      createCity = await Service.CityService.updateMultipleDocuments({_id:payloadData.cityId}, dataToSet, {lean:true});
    }else{
      createCity = await Service.CityService.InsertData(payloadData);
    }
    return { cityData: createCity };
  } catch (err) {
    throw err;
  }
};

const sendPushNotification  = async(payloadData)=> {
  try{
    let criteria;
    let getNotificationData;
    
   let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    if(payloadData.type == APP_CONSTANTS.USER_ROLES.CUSTOMER){
      criteria = {"isDeleted" : false ,'isBlocked' : false}
      let projection = {deviceToken:1,firstName:1}
      getNotificationData = await Service.CustomerService.getData(criteria, projection, options);
    }else if(payloadData.type == APP_CONSTANTS.USER_ROLES.DRIVER){
      criteria = {'IsBlocked' : false}
      let projection = {deviceToken:1,fullName:1}
      getNotificationData = await Service.DriverService.getData(criteria, projection, options);
    }else if(payloadData.type == APP_CONSTANTS.USER_ROLES.RESTAURANT){
      criteria = {"isDeleted" : false ,'isBlocked' : false}
      let projection = {deviceToken:1,restaurantName:1}
      getNotificationData = await Service.RestaurantService.getData(criteria, projection, options);
    }else{
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_USER_TYPE;
    }
    Service.NotificationService.InsertData(payloadData);
    payloadData.getNotificationData = getNotificationData;
    let response = await UniversalFunctions.sendNotificationMultipleDeviceUsingFCM2(payloadData);
    return {response}
  }catch(err){  console.log("err",err);
    throw err;
  }
}

let updateStatus = async (payloadData, UserData) => {
  try {
    let criteria = { _id: payloadData._id };
    let checkDriver = payloadData.userType == APP_CONSTANTS.USER_ROLES.DRIVER
    let checkCustomer = payloadData.userType == APP_CONSTANTS.USER_ROLES.CUSTOMER
    let checkRestaurant = payloadData.userType == APP_CONSTANTS.USER_ROLES.RESTAURANT
    let queryData;
    let dataToSet = {};
    if(checkDriver){
      queryData = await Service.DriverService.getData(criteria,{},{ lean: true });
      dataToSet = {
        IsBlocked: payloadData.status,
        blockDate: new Date(),
        updatedAt: new Date(),
      };
      
    }
    if(checkCustomer){
      queryData = await Service.CustomerService.getData(criteria,{},{ lean: true });
      dataToSet = {
        isBlocked: payloadData.status,
        updatedAt: new Date(),
      };
    }
    if(checkRestaurant){
      queryData = await Service.RestaurantService.getData(criteria,{},{ lean: true });
      dataToSet = {
        isBlocked: payloadData.status,
        updatedAt: new Date(),
      };
    }

    if (queryData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
   
    if(checkDriver){
       await Service.DriverService.updateData(criteria,dataToSet,{ new: true });
    }
    if(checkCustomer){
       await Service.CustomerService.updateData(criteria,dataToSet,{ new: true });
    }
    if(checkRestaurant){
       await Service.RestaurantService.updateData(criteria,dataToSet,{ new: true });
    }
  
    return { };
  } catch (err) {
    throw err;
  }
}
let forgotPassword = async (payloadData, UserData)=>{   //console.log("===forgotPassword===");
  try{
    let  criteria = {email: payloadData.email }; 
    let queryResult = await Promise.all([
      Service.AdminService.getData(criteria,{},{lean:true}),
      Service.AuthenticationService.getData(criteria,{},{lean:true}),
    ]);
    if(queryResult[0].length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    let passwordResetToken = await UniversalFunctions.generateAuthToken({
      _id: uuidv4(),
      email: payloadData.email,
      role: APP_CONSTANTS.USER_ROLES.ADMIN,
    });

    let  uniqueCode = passwordResetToken;
  let baseUrl = `${APP_CONSTANTS.APP_DETAILS.FRONT_END_BASE_URL_FOR_RESET_PASSWORD}${uniqueCode}`;
    let dataToSet = {
      token: uniqueCode,
      expireAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()     
    };
   let saveData = {
     email: payloadData.email,
     token: uniqueCode,
     userType: APP_CONSTANTS.USER_ROLES.ADMIN,
   }
   if(queryResult[1].length == 0){
     await Service.AuthenticationService.InsertData(saveData)
   }else{
    Service.AuthenticationService.updateData(criteria,dataToSet,{lean:true})
   }
   dataToSet2 = {passwordResetToken:uniqueCode}
   Service.AdminService.updateData(criteria,dataToSet2,{lean:true})
   let templatepath      = Path.join(__dirname, '../../emailTemplates/');
   let fileReadStream    =  templatepath + 'reset-password.html';  
   let emailTemplate     = await readFilePromise(fileReadStream);
   emailTemplate         = emailTemplate.toString(); 
   let resetPasswordLink = baseUrl
   let sendStr = emailTemplate.replace('{{path}}',resetPasswordLink);    
   let  sendToDriver = {to:payloadData.email,subject:'Welcome To Eboyo',html:sendStr};
   UniversalFunctions.sendMail(sendToDriver);
    return {};
  }catch(err){
     throw err;
  }
}

let resetPassword = async (payloadData)=>{
  let  criteria = {token:payloadData.passwordResetToken }; 
  let  criteria2 = {passwordResetToken:payloadData.passwordResetToken }; 
  let adminData = null;
  try{
    let tokenDetails = await Promise.all([
      Service.AuthenticationService.getData(criteria,{},{lean:true}),
      Service.AdminService.getData(criteria2,{},{lean:true})
    ]);
    if(tokenDetails[0].length==0) throw STATUS_MSG.ERROR.TOKEN_EXPIRED;
   if(tokenDetails[1] == 0) throw STATUS_MSG.ERROR.TOKEN_EXPIRED;
    adminData = tokenDetails[0];
    let dataToSet = {
        $set:{ password: UniversalFunctions.encryptedPassword(payloadData.newPassword),},
        $unset: {passwordResetToken: 1}
    }; 
    await Service.AdminService.updateData(criteria2,dataToSet,{new:true});
    return {};
  }catch(err){
     throw err;
  }    
};

module.exports = {
  login: login,
  logout: logout,
  dashboard:dashboard,
  getDashboardData:getDashboardData,
  driverDetail:driverDetail,
  createCategory:createCategory,
  addCity:addCity,
  sendPushNotification:sendPushNotification,
  getInvoiceData:getInvoiceData,
  updateStatus:updateStatus,
  getOrderDataPdfLink:getOrderDataPdfLink,
  forgotPassword:forgotPassword,
  resetPassword:resetPassword,
};
