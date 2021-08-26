/**
 * Created by Anurag on 15/04/19.
 */
const Path = require('path');
const _ = require('underscore');
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require('mongoose');
const Moment = require('moment');

const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');


const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE       =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;

const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;
const ORDER_TYPE      = APP_CONSTANTS.ORDER_TYPE;

const CronJob = require('cron').CronJob;

//* 1 * * * *
//*/20 * * * * *
// const cronJob = new CronJob("*/90 * * * * *",async () => {
//     console.log("You will see this message every one minute \n\n\n\n");
//     cronJob.stop();
//     await getAllOrderAndUpdate({},{});
//     cronJob.start();
//   },null, true, "America/Los_Angeles");
//cronJob.start();


let getAllOrderAndUpdate = async (payloadData,UserData)=> {
  console.log("getAllOrderAndUpdate==init",new Date());
  try{
    let allPendingOrder = await getAllPendingOrders();
    // return {
    //   count:allPendingOrder.length,
    //   allPendingOrder:allPendingOrder,
    // }
    if(allPendingOrder.allOrderList.length>0){ 
      for (let element of allPendingOrder.allOrderList){ 
        if(element.restaurantId){
          let locationLongLat  = element.restaurantId.location.coordinates;
          let driverRequestSendCount= element.driverRequestSendCount || 0;
          let availableDriverData ={
            orderId:element._id,
            locationLongLat:locationLongLat,
            driverRequestSendCount:driverRequestSendCount,
            orderAuoIncrement:element.orderAuoIncrement
          }
          console.log("availableDriverData=====Data");
          console.table(availableDriverData);
          console.log("\n\n\n")
          let driverList = await getAvailableDriver(availableDriverData);
          if(driverList.length>0){
            let requestData = {orderId:element._id,driverId:driverList[0]._id,status:APP_CONSTANTS.ORDER_STATUS.DRIVER_REQUEST_SEND}
            if(driverList[0].deviceToken){
              let createObjectForNotification = {
                deviceToken:driverList[0].deviceToken,
                title:'Order has been comming',
                message:'Order has been comming '
              }
              UniversalFunctions.sendNotificationUsingFCM(createObjectForNotification);  
            }
            await Service.DriverOrderRequestService.InsertData(requestData);
            let dataToSet = {$inc:{driverRequestSendCount:1}}
            await Service.OrderService.updateMultipleDocuments({_id:element._id},dataToSet,{});

            let storePushNotification = {
              userType:APP_CONSTANTS.USER_ROLES.DRIVER,
              userId : driverList[0]._id,
              orderId: element._id,
              message: 'Order has been comming'
            }
            UniversalFunctions.storePushNotification(storePushNotification); 
          }else{
            console.table({"orderId":element._id,"mesage":"No Driver Found"})
          }    
        }    
      } 
    }
    return {
      countOfPendingOrder:allPendingOrder.totalCount,
      allOrderList:allPendingOrder.allOrderList
    }
  }catch(error){
    throw error;
  }

}

let getAllPendingOrders = async ()=> { 
   try {
    let orderDeliveryTime=Moment().add(40, 'minutes').format('YYYY-MM-DD HH:mm');
     let criteriaOrder = {
       //restaurantId:"60681561fc6c240e08b57e8c",
       "isdriverAssigned":false,
       scheduleOrderDate:{$lte:orderDeliveryTime}
     } //status:ORDER_STATUS.PENDING,
     console.log("criteriaOrder",criteriaOrder);
     let projection = {__v:0}
    let options = {lean:true,sort:{categoryName:1}}
    let collectionOptions =[
      {
        path: 'customerId',
        model: 'customer',
        select: '_id firstName deviceType deviceToken',
        options: {lean: true}
      }, 
      {
        path: 'restaurantId',
        model: 'restaurant',
        select: '_id restaurantName deviceType deviceToken location',
        options: {lean: true}
      },
          
    ];
    let queryResult= await Promise.all([
      Service.OrderService.getData(criteriaOrder, projection, {}),
      Service.DAOService.getDataWithReferenceFixed(Models.OrderTable,criteriaOrder,projection,options,collectionOptions)
    ]);
    let totalCount = queryResult[0] || [];
    let allOrderList= queryResult[1] || [];
    return {
      totalCount:totalCount.length,
      allOrderList:allOrderList.length>0 ? JSON.parse(JSON.stringify(allOrderList)) :allOrderList,
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getAvailableDriver= async(Data)=>{ console.log("getAvailableDriver==init");
    console.table(Data);
  try{
    let sendRequestList = [],sendRequestResult=[];
    if(Data.driverRequestSendCount>0){
      let criteriaD ={orderId:Data.orderId}
      sendRequestList = await Service.DriverOrderRequestService.getData(criteriaD,{driverId:1},{lean:true}); 
      sendRequestList.forEach((elementD) =>{ //sendRequestResult.push(elementD.driverId.toString());
        sendRequestResult.push(elementD.driverId);
      })
    }; 
    let geoNearQuery = {};
    if(Data.driverRequestSendCount>0 && sendRequestResult.length>0){
      geoNearQuery ={
        "_id" : {$nin:sendRequestResult},
        //"IsBusy":false,Islogin:true //Isverified:true,IsBlock:false
      } 
    }else{ 
      geoNearQuery = {
        //"IsBusy":false,Islogin:true //Isverified:true,IsBlock:false
      }
    } console.log("geoNearQuery",geoNearQuery);
    let geoNear = {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: Data.locationLongLat //[ 76.83091565966606, 30.733033957112543 ]
        },
        distanceField: "dist.calculated",
        maxDistance: 10000, //meter =10km 
        query: geoNearQuery,
        distanceMultiplier: 0.001,
        includeLocs: "dist.location",
        $limit: 50,
        uniqueDocs:true,
        spherical: true
      }
    }
    let aggregateQuery=[geoNear]
    // if(Data.driverRequestSendCount>0 && sendRequestResult.length>0){
    //   console.log("sendRequestResult",sendRequestResult,geoNear);
    //   aggregateQuery = [geoNear,
    //     {$match:{"_id" : {$nin:sendRequestResult}} }
    //   ]
    // }else{
    //   aggregateQuery = [geoNear]
    // }
    let driverList= await Service.DriverService.aggregateQuery(aggregateQuery);
    //console.log("driverList",Data.locationLongLat,driverList,"\n\n\n\n");
    return driverList;
  }catch(error){
    //throw error;
  }
}


module.exports ={
  getAllOrderAndUpdate : getAllOrderAndUpdate,
}