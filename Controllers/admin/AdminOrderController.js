/**
 * Created by Indersein on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require("mongoose");
const Moment = require("moment");
const Service = require("../../Services");
const Models = require("../../Models");
const Config = require("../../Config");
const UniversalFunctions = require("../../Utils/UniversalFunctions");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const ORDER_STATUS = APP_CONSTANTS.ORDER_STATUS;

let get = async (payloadData, UserData) => {
  let criteria = {};
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
    sort: { orderAuoIncrement: -1 },
  };
  let projection = {};
  try {
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo",
        options: { lean: true },
      },
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName rating currentLocation",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName lastName profilePicURL",
        options: { lean: true },
      },
    ];
    let OrderPromise = await Promise.all([
      Service.OrderService.getData(criteria, projection, {}),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
    ]);
    let totalOrderQ = OrderPromise[0];
    let orderData = OrderPromise[1];
    return {
      totalOrder: totalOrderQ.length,
      orderData: orderData,
    };
  } catch (err) {
    throw err;
  }
};

let getOrderRequestList = async (payloadData, UserData) => {
  let criteria = { orderId: payloadData.orderId };
  let options = {
    lean: true,
    limit: payloadData.limit || 0,
    skip: payloadData.skip || 0,
    sort: { orderAuoIncrement: -1 },
  };
  let projection = {};
  try {
    let collectionOptions = [
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName email phoneNo",
        options: { lean: true },
      },
    ];
    let OrderPromise = await Promise.all([
      Service.DriverOrderRequestService.getData(criteria, projection, {}),
      Service.DAOService.getDataWithReferenceFixed(
        Models.DriverOrderRequestTable,
        criteria,
        { __v: 0 },
        {},
        collectionOptions
      ),
    ]);
    let totalOrderQ = OrderPromise[0];
    let orderData = OrderPromise[1];
    return {
      totalOrder: totalOrderQ.length,
      orderData: orderData,
    };
  } catch (err) {
    throw err;
  }
};

let getRestaurantOrderList = async (payload, UserData) => {
  try {
    let criteria = {};

    let checkCustomer = APP_CONSTANTS.USER_ROLES.CUSTOMER == payload.type;
    let checkDriver = APP_CONSTANTS.USER_ROLES.DRIVER == payload.type;
    let checkRestaurant = APP_CONSTANTS.USER_ROLES.RESTAURANT == payload.type;
    if (checkCustomer) {
      criteria = { customerId: payload._id };
    }
    if (checkDriver) {
      criteria = { driverId: payload._id };
    }
    if (checkRestaurant) {
      criteria = { restaurantId: payload._id };
    }

    if (payload.isScheduleOrder) {
      criteria.isScheduleOrder = payload.isScheduleOrder;
    } else {
      criteria.$or = [
        { isScheduleOrder: false },
        { isScheduleOrder: { $exists: false } },
      ];
    }
    if (payload.startDate) {
      payload.startDate = Moment(payload.startDate).format("YYYY-MM-DD");
      payload.startDate = payload.startDate.toString();
      payload.endDate = Moment(payload.endDate).add(1, "days");
      payload.endDate = new Date(payload.endDate);
      criteria.createdAt = { $gte: payload.startDate, $lte: payload.endDate };
    }
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      sort: { orderAuoIncrement: -1 },
      lean: true,
    };
    let collectionOptions = [
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName lastName profilePicURL mobileNumber",
        options: { lean: true },
      },
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName location vendorFullAddress",
        options: { lean: true },
      },
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName currentLocation profilePicURL",
        options: { lean: true },
      },
    ];
    if (payload.status) {
      criteria.status = payload.status;
    }
    let scheduleOrder = {
      restaurantId: UserData._id,
      isScheduleOrder: true,
      status: {
        $in: [
          APP_CONSTANTS.ORDER_STATUS.PENDING,
          APP_CONSTANTS.ORDER_STATUS.ACCEPTED,
        ],
      },
    };
    let queryResult = await Promise.all([
      Service.OrderService.countData(criteria),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.PENDING,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.ACCEPTED,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.COOKED,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_CUSTOMER,
      }),
      Service.OrderService.countData({
        status: APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RESTAURANT,
      }),
      Service.OrderService.countData(scheduleOrder),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
    ]);
    let allData = queryResult[9];
    return {
      totalCount: queryResult[0] || 0,
      totalNewOrder: queryResult[1] || 0,
      totalConfirmedOrder: queryResult[2] || 0,
      totalCookedOrder: queryResult[3] || 0,
      totalPickedOrder: queryResult[4] || 0,
      totalDeliveredOrder: queryResult[5] || 0,
      CancelledByCustomer: queryResult[6] || 0,
      CancelledByRestaurant: queryResult[7] || 0,
      scheduleOrder: queryResult[8] || 0,
      orderList: allData,
    };
  } catch (err) {
    throw err;
  }
};

let getDriverList = async (payload, UserData) => {
  try {
    let orderC = { _id: payload.orderId };
    let restaurantC = { _id: payload.restaurantId };
    let result = await Promise.all([
      Service.OrderService.getData(orderC, {}, { lean: true }),
      Service.RestaurantService.getData(restaurantC, {}, { lean: true }),
    ]);
    if (result[0].length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    }
    if (result[1].length == 0) {
      throw STATUS_MSG.ERROR.INVALID_RESTAURANT_ID;
    }
    let orderData = result[0].length > 0 ? result[0][0] : {};
    let restaurant = result[1].length > 0 ? result[1][0] : {};

    if (orderData.restaurantId != payload.restaurantId) {
      throw STATUS_MSG.ERROR.INVALID_RESTAURANT_ID;
    }

    let locationLongLat = orderData.address.location.coordinates;
    let geoNear = {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: locationLongLat, //[ 76.83091565966606, 30.733033957112543 ]
        },
        distanceField: "dist.calculated",
        maxDistance: 40000, //meter =40km
        query: {
          Isverified: true,
          Islogin: true,
          IsBusy: false,
          IsBlocked: false,
        },
        distanceMultiplier: 0.001,
        includeLocs: "dist.location",
        $limit: 50,
        uniqueDocs: true,
        spherical: true,
      },
    };
    let aggregateQuery = [
      geoNear,
      {
        $project: {
          _id: 1,
          driverNumber: 1,
          currentLocation: 1,
          profilePicURL: 1,
          rating: 1,
          fullName: 1,
          email: 1,
          phoneNo: 1,
        },
      },
      { $skip: payload.skip },
      { $limit: payload.limit },
    ];
    let coutAggregateQuer = [
      geoNear,
      {
        $count: "totalRecord",
      },
    ];
    let newResult = await Promise.all([
      Service.DriverService.aggregateQuery(coutAggregateQuer),
      Service.DriverService.aggregateQuery(aggregateQuery),
    ]);
    let totalRecord = newResult[0].length > 0 ? newResult[0][0].totalRecord : 0;
    let driverList = newResult[1];
    return { totalRecord, driverList };
  } catch (error) {
    throw error;
  }
};

let manualAssignedOrder = async (payloadData, UserData) => {
  try {
    let insertData = {
      status: ORDER_STATUS.DRIVER_REQUEST_SEND,
      orderId: payloadData.orderId,
      driverId: payloadData.driverId,
    };
    await Service.DriverOrderRequestService.InsertData(insertData);
    return {};
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

let getOrderListWithPromoCode = async (payload, UserData) => {
  try {
    let promoCodeId = payload.promoCodeId;
    let isValid = Mongoose.Types.ObjectId.isValid(promoCodeId); //true
    if (isValid === false) {
      throw STATUS_MSG.ERROR.INVALID_PROMO_CODE_ID;
    }
    let criteria = { "promoCodeDetails.promoCodeId": promoCodeId };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      sort: { orderAuoIncrement: -1 },
      lean: true,
    };
    let collectionOptions = [
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName lastName profilePicURL",
        options: { lean: true },
      },
    ];

    let queryResult = await Promise.all([
      Service.OrderService.countData(criteria),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
    ]);
    return {
      totalCount: queryResult[0] || 0,
      totalOrder: queryResult[1] || 0,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  //create: create,
  get: get,
  getOrderRequestList: getOrderRequestList,
  getRestaurantOrderList: getRestaurantOrderList,
  getDriverList: getDriverList,
  manualAssignedOrder: manualAssignedOrder,
  getOrderListWithPromoCode: getOrderListWithPromoCode,
};
