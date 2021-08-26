const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions = require('../Utils/UniversalFunctions');

const APP_CONSTANTS          =  Config.APP_CONSTANTS;
const DEVICE_TYPES           =  APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG             =  APP_CONSTANTS.STATUS_MSG
const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;
const ORDER_STATUS           =  APP_CONSTANTS.ORDER_STATUS;  
const USER_ROLES            =  APP_CONSTANTS.USER_ROLES;
const NOTIFICATION_MESSAGE   =  APP_CONSTANTS.NOTIFICATION_MESSAGE;
//const WORKING_HOURS_OF_RESTAURANT    = APP_CONSTANTS.WORKING_HOURS_OF_RESTAURANT;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;

const async = require("async");
const Mongoose = require('mongoose');

const _ = require('underscore');
const fs = require('fs').promises;

//const fs = promiseBluebird.promisifyAll(require('fs'));
const Path = require('path');
const setRestaurantResponse = async(result)=>{
  try{
    if(Array.isArray(result)){
     //delete result.adminCommssionType;
      //delete result.accessToken; 
      delete result[0].password; 
      delete result[0].__v; 
      
      delete result[0].deviceToken; 
      delete result[0].deviceType; 
       
      delete result[0].createdAt; 
      delete result[0].updatedAt; 
      delete result[0].emailVerified; 
      delete result[0].mobileVerified;
      delete result[0].isDeleted;
      delete result[0].isBlocked;
      delete result[0].passwordResetToken;
      delete result[0].deliveryServiceArea;

    }else{
      //delete result.adminCommssionType;
      //delete result.accessToken; 
      delete result.password; 
      delete result.__v;      
      delete result.deviceToken; 
      delete result.deviceType;       
      delete result.createdAt; 
      delete result.updatedAt; 
      delete result.emailVerified; 
      delete result.mobileVerified;
      delete result.isDeleted;
      delete result.isBlocked;
      delete result.passwordResetToken;
      delete result.deliveryServiceArea;
    }
    return result;
  }catch(err){
    throw err;
  }
}
const  login = async (payloadData)=> {  
  payloadData.password= UniversalFunctions.encryptedPassword(payloadData.password);
  let criteria  ={
    email:payloadData.email,
    password:payloadData.password
  }; 
  let projection= {
    password:0,__v:0
  };
  let collectionOptions =[
    /*{
        path: 'category',
        model: 'category',
        select: 'id categoryName  category',
        options: {lean: true}
    },*/
    
    {
        path: 'subCategory',
        model: 'subcategory',
        select: '_id categoryName  subCategoryNumber ',
        match: { isDeleted: false},
        options: {lean: true}
    },
  ];   
   
  let options ={
    lean:true,
    sort:{ createdAt:-1}
  }
  try {
      let userData    =   await Service.RestaurantService.getData(criteria,projection,{lean:true}); //console.log("userData",userData);
      if(userData.length==0){
        throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
      }
      let accessToken =  await  UniversalFunctions.generateAuthToken({_id:userData[0]._id,email:userData[0].email,name:userData[0].email,role :APP_CONSTANTS.USER_ROLES.RESTAURANT}); //console.log("accessToken",accessToken);
      let updateCriteria = {_id:userData[0]._id}
      let dataToSet ={
        accessToken:accessToken,
        updatedAt: new Date(),
      }
      if(payloadData.deviceToken){
        dataToSet.deviceToken  = payloadData.deviceToken;
        dataToSet.deviceType   = payloadData.deviceType;
      }
      dataToSet.updatedAt = new Date();
      dataToSet.lastLoginAt = new Date();
      let finalData = await Service.RestaurantService.updateData(updateCriteria,dataToSet,{new:true});  //console.log("==finalData==",finalData);
      let  restaurantDataInDetail  =  await Service.DAOService.getDataWithReferenceFixed(Models.Restaurant,criteria,projection,options,collectionOptions);
      let finalresult = await setRestaurantResponse(JSON.parse(JSON.stringify(restaurantDataInDetail[0])));
      return { restaurantData : finalresult}
  }catch(err){
    throw err;
  }
}

let forgotPassword = async (payloadData, UserData) => {
  console.log("===forgotPassword===");
  try {
    let criteria = { contactNumber: payloadData.mobileNumber };
    let userData = await Service.RestaurantService.getData(criteria,{},{lean:true}); //console.log("restaurantData",restaurantData);
    if (userData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    let uniqueCode = APP_CONSTANTS.MOBILE_SMS;
    let dataToSet = {
      otpCode: uniqueCode,
      updatedAt: new Date().toISOString(),
    };
    let updatePassWord = await Service.RestaurantService.updateData(criteria,dataToSet,{new: true});
    UniversalFunctions.sendSMS(payloadData.mobileNumber,uniqueCode,LANGUAGE_SPECIFIC_MESSAGE.verificationCodeMsg.EN + uniqueCode);
    return {
      //updatePassWord:updatePassWord,
      otp: uniqueCode,
    };
  } catch (err) {
    throw err;
  }
};

let verifyOtp = async (payloadData) => {
  //
  try {
    let criteria = { contactNumber: payloadData.mobileNumber};
    let userData = await Service.RestaurantService.getData(criteria,{},{lean:true});
    if (userData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }

    if (userData[0].otpCode != payloadData.otpCode) {
      throw STATUS_MSG.ERROR.INCORRECT_PASSWORD_OTP;
    }
    let accessToken = await UniversalFunctions.generateAuthToken({
      _id: userData[0]._id,
      mobileNumber: userData[0].phoneNo,
      role: APP_CONSTANTS.USER_ROLES.CUSTOMER,
    });
    let dataToSet = {};
    if (payloadData.isForgotPassword) {
      dataToSet.passwordResetToken = accessToken;
    } else {
      dataToSet.mobileVerified = true;
    }
    let optionsU = { new: true, lean: true };
    let updatePassWord = await Service.RestaurantService.updateData(criteria,dataToSet,optionsU);
    delete updatePassWord.password;
    delete updatePassWord.__v;
    if (payloadData.isForgotPassword) {
      return { passwordResetToken: accessToken };
    } else {
      return {};
    }
  } catch (err) {
    throw err;
  }
};

let resetPassword = async (payloadData) => {
  let criteria = { passwordResetToken: payloadData.passwordResetToken };
  let restaurantData = null;
  try {
    let getRestaurantDetail = await Service.RestaurantService.getData(criteria,{},{lean:true});
    if (getRestaurantDetail.length == 0) throw STATUS_MSG.ERROR.NOT_FOUND;
    restaurantData = getRestaurantDetail[0];

    if (restaurantData.passwordResetToken != payloadData.passwordResetToken)
      throw STATUS_MSG.ERROR.INVALID_OTP;
    let encryptedPassword =UniversalFunctions.encryptedPassword(payloadData.newPassword);
    let dataToSet = {$set: {password: encryptedPassword},
      $unset: { passwordResetToken:1,otpCode:1},
    };
    let updatePassWord = await Service.RestaurantService.updateData(criteria,dataToSet,{new:true});
    return {};
  } catch (err) {
    throw err;
  }
};

let changePassword = async (payloadData,UserData)=> { 
  try{
   let  criteria = {_id: UserData._id }; 
   let encryptedPassword = UniversalFunctions.encryptedPassword(payloadData.oldPassword);
   let restaurantData = await Service.RestaurantService.getData(criteria,{},{lean:true}); 
    if(restaurantData.length==0){
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    if(restaurantData[0].password!=encryptedPassword){
      throw STATUS_MSG.ERROR.INCORRECT_OLD_PASS;
    }
    let  dataToSet = {
      password: UniversalFunctions.encryptedPassword(payloadData.newPassword)
    };
    let updatePassWord = await Service.RestaurantService.updateData(criteria,dataToSet,{new:true,lean:true}); 
    delete updatePassWord.isDeleted;
    delete updatePassWord.isDelivery;
    delete updatePassWord.isPickup;
    delete updatePassWord.isBlocked;
    delete updatePassWord.deviceToken;
    delete updatePassWord.accessToken;
    delete updatePassWord.password;
    delete updatePassWord.deliveryServiceArea
    delete updatePassWord.__v;
    return {restaurantData: updatePassWord};
  }catch(err){
    throw err;
  }
};

const editRestaurantOnlieStatus = async (payloadData,UserData)=> {
  try{
    let dataToSet = {isOnline:payloadData.isOnline}
    let data  = await Service.RestaurantService.updateMultipleDocuments({_id:UserData._id},dataToSet, {new:true});
    return {};
  }catch(err){
    throw err;
  }
}

let addDeliveryServiceArea = async (payloadData, UserData)=>{ 
  let servingLocation;
  let criteria = {
    location: {
      $geoIntersects: {
        $geometry: {type: "Polygon",coordinates: [payloadData.coordinates]}
      }
    }
  };
  try{
    let dataToSet = {
      locationName: payloadData.locationName,
      restaurant:UserData._id,
      deliveryServiceArea: {
        type: "Polygon",//LineString //Polygon
        coordinates: [payloadData.coordinates]
      }
    }; //console.log("payload#####",criteria,dataToSet);
    // let checkPolygonIntersectOrNot = await Service.RestaurantAreaService.getData(criteria,{}, {lean: true});
    // if(checkPolygonIntersectOrNot.length==0){
    //   throw APP_CONSTANTS.STATUS_MSG.ERROR.POLYGON_INTERSECTS;
    // }
    //servingLocation  = await Service.RestaurantAreaService.InsertData(dataToSet);
    servingLocation  = await Service.RestaurantService.updateMultipleDocuments({_id:UserData._id},dataToSet,{new:true,lean:true});
    return {};
  }catch(err){
    throw err;
  }
};


let orderRejected = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.orderId }; 
    let options = {lean: true}
    let dataToSet={status:ORDER_STATUS.CANCELLED_BY_RESTAURANT}
    if(payload.reasonForRejection){
      dataToSet.reasonForRejection = payload.reasonForRejection
    }
    
    let queryResult= await Promise.all([
      Service.OrderService.updateMultipleDocuments(criteria,dataToSet,{}),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let orderAccepted = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.orderId }; 
    let options = {lean: true}
    let dataToSet={status:ORDER_STATUS.ACCEPTED,
      orderPreparationTime:payload.orderPreparationTime
    }
    let orderData= await Service.OrderService.getData(criteria,{address:0,__v:0},{});
    if(orderData.length==0){
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID
    }
    if(orderData[0].status!=ORDER_STATUS.PENDING){
      throw STATUS_MSG.ERROR.YOU_ALREADY_ACCEPT_ORDER
    }
    let notificationData= {
      userId:orderData[0].customerId,
      orderId:orderData[0]._id,
      userType:USER_ROLES.CUSTOMER,
      message:NOTIFICATION_MESSAGE.ORDER_ACCEPTED+"(#"+orderData[0].orderAuoIncrement+")",
    }
    let queryResult= await Promise.all([
      Service.NotificationStoreService.InsertData(notificationData),
      Service.OrderService.updateMultipleDocuments(criteria,dataToSet,{}),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let updateOrderStatus = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.orderId }; 
    // console.log(criteria)
    let options = {lean: true}
    let criteriaForNotificationText = {};
    let dataToSet={status:payload.status}
    let firstName = '';
    let lastName = '';
    let extraInformation = [];
    let queryResult= await Promise.all([
      Service.OrderService.updateMultipleDocuments(criteria,dataToSet,{}),
      Service.OrderService.getData(criteria,{},{lean:true}),
      Service.NotificationTextService.getData(criteriaForNotificationText,{},{lean:true})
    ]);
    let notificationData= queryResult[2] || [];
    let customerId = queryResult[1][0].customerId;
    let orderId = queryResult[1][0]._id;
    criteriaForCustomer = {_id:customerId};
    let customerData =  await Service.CustomerService.getData(criteriaForCustomer,{},{lean:true});
     let title = '';
     let messageBody = '';
     notificationData.forEach(element => {
      if(payload.status == APP_CONSTANTS.ORDER_STATUS.PREPARING){
        title = element.event_message;
        messageBody = element.event_secondary_message;
        
      }
      if(payload.status == APP_CONSTANTS.ORDER_STATUS.COOKED){
        title = element.event_message;
        messageBody = element.event_secondary_message;
     }
     });
     
    if(customerData[0].firstName != undefined && customerData[0].firstName != ''){
      firstName = customerData[0].firstName;
    }
    if(customerData[0].lastName != undefined && customerData[0].lastName != ''){
      lastName = customerData[0].lastName;
    }

     notificationTitle = firstName+' '+ lastName +' ' +title;
     notificationMessageBody = messageBody;
     extraInformation = {'OrderId':orderId};
     let customerNotification = {
      deviceToken:customerData[0].deviceToken,
      title: notificationTitle,
      message:notificationMessageBody,
      otherInformation:extraInformation,
    }
    UniversalFunctions.sendNotificationUsingFCM(customerNotification); 

    return {};
  }catch(err){
    throw err;
  }
};

let getDashboardData = async(payloadData, UserData) => {
  try {
    let queryResult = await Promise.all([
      Service.OrderService.countData({restaurantId:UserData._id,status:ORDER_STATUS.PENDING}),
      Service.OrderService.countData({restaurantId:UserData._id,status:ORDER_STATUS.CANCELLED_BY_RESTAURANT}),
      Service.OrderService.countData({restaurantId:UserData._id,status:ORDER_STATUS.PREPARING}),
      Service.OrderService.countData({restaurantId:UserData._id,status:ORDER_STATUS.COOKED}),
      Service.OrderService.countData({restaurantId:UserData._id,status:ORDER_STATUS.DELIVERED_BY_RIDER}),
    ]) 

      let new_orders = queryResult[0];
      let upcomming_request = 0 || 0;    
      let order_processing = queryResult[2];
      let ready_for_delivery_pickup = queryResult[3];
      let delivered_order = queryResult[4];
      let cancelled_order = queryResult[1];

    return {
      new_orders,
      upcomming_request,
      order_processing,
      ready_for_delivery_pickup,
      delivered_order,
      cancelled_order
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
  
   
}

let getProfileData = async (payload,UserData)=>{ //console.log("UserData",UserData); 
  try{
    // delete UserData.password; 
    // delete UserData.__v; 
    // delete UserData.accessToken; 
    // delete UserData.deviceToken; 
    // delete UserData.deviceType; 
    // //delete UserData.adminCommssionType; 
    // delete UserData.createdAt; 
    // delete UserData.updatedAt; 
    // delete UserData.emailVerified; 
    // delete UserData.mobileVerified;
    // delete UserData.isDeleted;
    // delete UserData.isBlocked;
    // delete UserData.passwordResetToken;
    // delete UserData.deliveryServiceArea
    let result = await setRestaurantResponse(UserData)
    return {restaurantData:result};
  }catch(err){
    throw err;
  }
};

let updateProfile = async (payloadData, UserData) => {
  let folderName=APP_CONSTANTS.FOLDER_NAME.images;
  let criteria = {_id:UserData._id}
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
      UniversalFunctions.uploadFilesWithCloudinary(payloadData.document,"restaurantImage_",Date.now(),folderName,contentType),
    ]);    
    let imageFile = queryResult[0];     
    let dataToSet = {
      restaurantName: payloadData.restaurantName,      
      logo: imageFile[0],
    }; console.log("data",dataToSet);
    restaurantData = await Service.RestaurantService.updateMultipleDocuments(criteria, dataToSet, {lean:true});
    let lastProjection= {
      password:0,__v:0, 
      accessToken:0, 
      deviceToken:0, 
      deviceType:0, 
      adminCommssionType:0, 
      createdAt:0, 
      updatedAt:0,emailVerified:0, 
      mobileVerified:0, 
      isDeleted:0, 
      isBlocked:0, 
      passwordResetToken:0, 
      deliveryServiceArea:0,
    };
    let finalRestaurantData = await Service.RestaurantService.getData(criteria,lastProjection,{lean:true} );
    return {restaurantData:finalRestaurantData[0]};
  } catch (err) { console.log("err",err);
    throw err;
  }
};

let getTransactionData = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let criteria = {restaurantId:UserData._id}
    let projection = {transactionRespons:0,__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let collectionOptions =[
      {
        path: 'orderId',
        model: 'orderTables',
        select: '_id orderAuoIncrement address ',
        options: {lean: true}
      },  
      {
        path: 'customerId',
        model: 'customer',
        select: '_id restaurantName firstName lastName',
        options: {lean: true}
      },  
    ];
    let queryResult= await Promise.all([
      Service.TransactionService.countData(criteria),
      //Service.TransactionService.getData(criteria, projection,options),
      Service.DAOService.getDataWithReferenceFixed(Models.TransactionTable,criteria,projection,options,collectionOptions)
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount,
      transactionList:queryResult[1] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getTransactionGroupByDate = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
    let match ={
      $match: {
        restaurantId:UserData._id,
      }
    }

    let groupBy ={
      $group:  {
        _id :  { $dayOfYear: "$createdAt"},
        totalAmount: { $sum: "$totalAmount" },
        adminCommission: { $sum: "$adminCommission" },
        orderCount: { $sum: 1 },
        itemsSold: {
            $push: {
              createdAt: "$createdAt",
          }
       }
      }
    }
    let skip ={$skip:payloadData.skip}
    let limit ={$limit:payloadData.limit}
   
    let queryResult= await Promise.all([
      Service.TransactionService.aggregateQuery([match,groupBy,{$sort:{"_id":1}},skip,limit])
    ]);
 
    let finalArray = [];
    let _id;
    let totalAmount;
    let adminCommission;
    let orderCount;
    let createdAt;
    queryResult[0].forEach(element => {
      console.log(element)
      let finalObject = {
        _id : element._id,
        totalAmount: element.totalAmount,
        adminCommission: element.adminCommission,
        orderCount: element.orderCount,
        createdAt: element.itemsSold[0].createdAt,
      }
      finalArray.push(finalObject);
    });
    return {
      transactionList:finalArray,
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let submitWithdraw = async (payloadData, UserData) => {
  try { 
    if(UserData.walletBalance < payloadData.amount){
      throw APP_CONSTANTS.STATUS_MSG.ERROR.AMOUNT_NOT_SUFFICIENT
    }
    let criteria ={_id:UserData._id}  
    let dataToSet = {
      $inc:{walletBalance:-payloadData.amount}
    }  
     let withdrawTransaction = {
       restaurantId : UserData._id,
       transactionType: APP_CONSTANTS.TRANSACTION_TYPES.SUBMIT_WITHDRAW_FROM_RESTAURANTS,
       totalAmount: payloadData.amount
     }
     let queryResult= await Promise.all([
      Service.TransactionService.InsertData(withdrawTransaction),
      Service.RestaurantService.updateData(criteria,dataToSet,{new:true})
     ]);
      return {};
  } catch (err) {
    throw err;
  }
};

let getNotificationList = async (payload,UserData)=>{ //console.log("UserData",UserData); 
  let collectionOption =[
    {
      path: 'orderId',
      model: 'orderTables',
      select: '_id orderAuoIncrement ',
      options: {lean: true}
    },
  ]
  try{
    let  criteria = {}; 
    let options = {skip:payload.skip,limit:payload.limit}
    let queryResult= await Promise.all([
      Service.NotificationStoreService.getData(criteria,{},{}),
      //Service.NotificationStoreService.getData(criteria,{__v:0}, options),
      Service.DAOService.getDataWithReferenceFixed(Models.NotificationStoreTable,criteria,{__v:0}, options,collectionOption),
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount:totalCount.length || 0,
      allData:allData
    };
  }catch(err){
    throw err;
  }
};

let insertAndUpdateWorkingTime = async (payloadData,UserData)=> { 
  try{
    console.log("getWorkingTime====payloadData",payloadData);
    for(let element of payloadData.workingDays){
      let saveData=element
      saveData.restaurant =UserData._id;
      saveData.updatedAt = new Date();
      if(payloadData.isUpdate){
        let  criteria = {restaurant: UserData._id,dayName:element.dayName }; 
        let updateData = await Service.RestaurantWorkingTimeService.updateData(criteria,saveData,{new:true});
      }else{
        await Service.RestaurantWorkingTimeService.InsertData(saveData);       
      }//console.log("element",element);
    }
   return {};
  }catch(err){
    throw err;
  }
};

let getWorkingTime = async (payloadData,UserData)=> { 
  try{
    let  criteria = {restaurant: UserData._id }; 
    let finalData = await Service.RestaurantWorkingTimeService.getData(criteria,{__v:0},{lean:true});      
    return {workingTimes:finalData};
  }catch(err){
    throw err;
  }
};

let updateWorkingStatusOfDay = async (payloadData,UserData)=> { 
  try{
    let  criteria = {restaurant: UserData._id,_id:payloadData.dayId };
    let dataToSet = {isRestaurantOpenOrNot:payloadData.isRestaurantOpenOrNot} 
    let updateData = await Service.RestaurantWorkingTimeService.updateData(criteria,dataToSet,{new:true});
      
   return {};
  }catch(err){
    throw err;
  }
};


let getPromoCode = async (payloadData,UserData)=> { 
  try{
    let criteria = {restaurant: {$in:[UserData._id] }}; 
    let project={restaurant:0,customer:0}
    let options  = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.PromoCodeService.countData(criteria),
      Service.PromoCodeService.getData(criteria,project,options)
    ]);

    let totalCount= queryResult[0]
    let promoCodeList = queryResult[1]      
    return {
      restaurant:  UserData._id,
      totalCount:totalCount,
      promoCodeList:promoCodeList
    };
  }catch(err){
    throw err;
  }
};


let getWalletAmount = async (payloadData,UserData)=> { 
  try{
    let d = new Date();
    d.setDate(d.getDate()-2);
    let criteria = {restaurantId:UserData._id ,createdAt: { $lt: d }};
     let walletAmount    =   await Service.TransactionService.getData(criteria,{},{lean:true}); 
    let withdrawalAmount = 0;     
    walletAmount.forEach(element => {
      withdrawalAmount += element.restaurantCommission;
     }); 
   
    return {
      walletAmount: UserData.walletBalance,
      withdrawalAmount:withdrawalAmount,
      bankDetails:(UserData.razorpayXData != undefined) ? UserData.razorpayXData.bank_account : '',
    };
  }catch(err){
    throw err;
  }
};

let getOrderListWithPromoCode = async (payload,UserData)=>{ 
  try{
    let promoCodeId = payload.promoCodeId;
    let isValid = Mongoose.Types.ObjectId.isValid(promoCodeId); //true
    if(isValid === false){
     throw STATUS_MSG.ERROR.INVALID_PROMO_CODE_ID;
    }
    let  criteria = {"promoCodeDetails.promoCodeId":promoCodeId,restaurantId:UserData._id}; 
    let options = {skip:payload.skip,limit:payload.limit,sort:{orderAuoIncrement:-1},lean: true}
    let collectionOptions =[
      {
        path: 'customerId',
        model: 'customer',
        select: '_id firstName lastName profilePicURL',
        options: {lean: true}
      },    
    ];
  
    let queryResult= await Promise.all([
      Service.OrderService.countData(criteria),
      Service.DAOService.getDataWithReferenceFixed(Models.OrderTable,criteria,{__v:0},options,collectionOptions),
    ]);
    return {
      totalCount: queryResult[0] || 0,
      totalOrder: queryResult[1] || 0,
    };
  }catch(err){
    throw err;
  }
};


let getInvoiceData = async (payloadData, UserData) => {
  let criteria = {};
  if(payloadData.paymentType){
    criteria.paymentType = payloadData.paymentType;
  }

  if(payloadData.startDate && payloadData.endDate){
  criteria.createdAt = { $gte : payload.startDate, $lt : payload.endDate}
  }
   criteria.restaurantId = UserData._id;
  
console.log(criteria)
  let projection = {status:1,paymentType:1,adminCommission:1,orderAuoIncrement:1,driverCommission:1,finalDistance:1,restaurantCommission:1,totalPrice:1,pricePaidByCustomer:1,paymentStatus:1,itemTotalPrice:1,address:1,restaurantId:1,customerId:1,promoCodeDetails:1,customerDeliveryCharge:1,adminGstOnCommission:1,riderDeliveryCharge:1,createdAt:1};
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




module.exports ={ 
  login    : login,
  changePassword:changePassword,
  forgotPassword:forgotPassword,
  verifyOtp:verifyOtp,
  resetPassword:resetPassword,
  getProfileData:getProfileData,
  updateProfile:updateProfile,
  
  editRestaurantOnlieStatus:editRestaurantOnlieStatus,
  
  addDeliveryServiceArea:addDeliveryServiceArea,
  
  orderRejected:orderRejected,
  orderAccepted:orderAccepted,
  updateOrderStatus:updateOrderStatus,
  getDashboardData:getDashboardData,
  getTransactionData:getTransactionData,
  submitWithdraw:submitWithdraw,
  getNotificationList:getNotificationList,
  insertAndUpdateWorkingTime:insertAndUpdateWorkingTime,
  getWorkingTime:getWorkingTime,
  updateWorkingStatusOfDay:updateWorkingStatusOfDay,
  getPromoCode:getPromoCode,
  getWalletAmount:getWalletAmount,
  getOrderListWithPromoCode:getOrderListWithPromoCode,
  getInvoiceData:getInvoiceData,
  getTransactionGroupByDate:getTransactionGroupByDate,
}