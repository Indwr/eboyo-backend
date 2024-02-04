/**
 * Created by Indersein on 06/09/21.
 */
 const Path = require("path");
 const _ = require("underscore");
 const Mongoose = require("mongoose");
 
 const Service = require("../../Services");
 const Models = require("../../Models");
 const Config = require("../../Config");
 const UniversalFunctions = require("../../Utils/UniversalFunctions");
 const APP_CONSTANTS = Config.APP_CONSTANTS;

 
 let create = async (payloadData,UserData) => {
  try {
    let data = {};
    let services;
    let checkCustomer = payloadData.userType == APP_CONSTANTS.USER_ROLES.CUSTOMER
    let checkRestaurant = payloadData.userType == APP_CONSTANTS.USER_ROLES.RESTAURANT
    let checkDrvier = payloadData.userType == APP_CONSTANTS.USER_ROLES.DRIVER

    if(checkCustomer){
      data.customerId = payloadData._id;
      data.transactionType = APP_CONSTANTS.TRANSACTION_TYPES.ADMIN_ADD_MONEY_TO_CUSTOMER;
    }
    if(checkRestaurant){
      data.restaurantId = payloadData._id;
      data.transactionType = APP_CONSTANTS.TRANSACTION_TYPES.ADMIN_ADD_MONEY_TO_RESTAURANT;
    }
    if(checkDrvier){
      data.driverId = payloadData._id;
      data.transactionType = APP_CONSTANTS.TRANSACTION_TYPES.ADMIN_ADD_MONEY_TO_DRIVER;
    }
    let dataToSet = {
      $inc:{walletBalance:payloadData.amount}
    } 
    let criteria = {_id:payloadData._id}
    data.totalAmount = payloadData.amount;
    data.description = payloadData.description;
    let queryResult= await Promise.all([
      Service.TransactionService.InsertData(data),
    ])
    if(checkCustomer){
      await Service.CustomerService.updateData(criteria,dataToSet,{new:true});
    }
    if(checkRestaurant){
      await Service.RestaurantService.updateData(criteria,dataToSet,{new:true});
    }
    if(checkDrvier){
      await Service.DriverService.updateData(criteria,dataToSet,{new:true});
    }
    return { createWallet: queryResult[0] };
  } catch (err) {
    throw err;
  }
}
 
 module.exports = {
  create: create,
 };
 