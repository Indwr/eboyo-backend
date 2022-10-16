/**
 * Created by Indersein on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
const Mongoose = require("mongoose");
const readFilePromise = require("fs-readfile-promise");
const Moment = require("moment");

const Service = require("../Services");
const Models = require("../Models");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunctions");
const RazorpayPaymentsController = require("./RazorpayPaymentsController");
const CommonController = require("./CommonController");
const { exit } = require("process");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;
const PAYMENT_TYPES = APP_CONSTANTS.PAYMENT_TYPES;
const TRANSACTION_TYPES = APP_CONSTANTS.TRANSACTION_TYPES;

const ORDER_STATUS = APP_CONSTANTS.ORDER_STATUS;
const CalcDistanceBetweenCoordinates = require("../Utils/CalcDistanceBetweenCoordinates");
const Helper = require("../Helper");

let createOrder = async (payloadData, UserData) => {
  console.log(
    "payloadData.pricePaidByCustomer",
    payloadData.pricePaidByCustomer
  );
  let dishesId = [],
    menuId = [],
    toppingIdAarry = [];
  let orderDeliveryTime,
    promoCodeIsValidOrNot = false,
    promoCodeData = {},
    promoCodeDetails = {};

  if (
    payloadData.paymentType == PAYMENT_TYPES.RAZORPAY &&
    payloadData.razorpayId == ""
  ) {
    throw STATUS_MSG.ERROR.RAZORPAY_ID_IS_REQUIRED;
  }
  if (payloadData.isScheduleOrder) {
    if (
      !payloadData.scheduleOrderDate ||
      typeof payloadData.scheduleOrderDate == undefined
    ) {
      throw STATUS_MSG.ERROR.SCHEDULE_ORDER_DATE_IS_REQUIRED;
    }
    let scheduleOrderFutureDate = Moment()
      .add(2, "day")
      .format("YYYY-MM-DD HH:mm");
    orderDeliveryTime = payloadData.scheduleOrderDate;
    if (
      new Date(scheduleOrderFutureDate).getTime() >
      new Date(orderDeliveryTime).getTime()
    ) {
      throw STATUS_MSG.ERROR.PLEASE_FUTURE_DATE;
    }
  } else {
    orderDeliveryTime = Moment().add(40, "minutes").format("YYYY-MM-DD HH:mm");
  }

  payloadData.orderDeliveryTime = orderDeliveryTime;
  payloadData.isScheduleOrder = payloadData.isScheduleOrder;

  let captureRazorpayPayment = {};
  try {
    if (
      payloadData.paymentType == PAYMENT_TYPES.RAZORPAY &&
      payloadData.razorpayId != ""
    ) {
      let captureRazorpayPayment =
        await RazorpayPaymentsController.capturePayment(
          payloadData.razorpayId,
          payloadData.price,
          payloadData.currency || ""
        ); //console.log("captureRazorpayPayment",captureRazorpayPayment.transactionRespons);
      captureRazorpayPayment.driverId = UserData._id;
      captureRazorpayPayment.totalAmount = payloadData.capital;
      if (captureRazorpayPayment.status != "success") {
        throw STATUS_MSG.ERROR.INVALID_RAZORPAY_ID;
      }
    }

    let orderData = {
      customerId: UserData._id,
      restaurantId: payloadData.restaurantId,
      orderType: payloadData.orderType,
      paymentType: payloadData.paymentType,
      scheduleOrderDate: payloadData.orderDeliveryTime,

      itemTotalPrice: payloadData.itemTotalPrice,
      //dicountApplied:payloadData.dicountApplied,
      totalPrice: payloadData.totalPrice,
      totalTax: payloadData.totalTax,
      pricePaidByCustomer: payloadData.pricePaidByCustomer,
    };

    if (payloadData.isScheduleOrder) {
      orderData.scheduleOrderStartDate = payloadData.scheduleOrderStartDate;
      orderData.scheduleOrderEndDate = payloadData.scheduleOrderEndDate;
    }

    if (
      payloadData.paymentType == PAYMENT_TYPES.RAZORPAY &&
      payloadData.razorpayId != ""
    ) {
      orderData.transactionData = captureRazorpayPayment;
      orderData.razorpayId = payloadData.razorpayId;
    }
    let addrCriteria = { _id: payloadData.addressId };
    let projection = { __v: 0, addressAutoIncrementId: 0 };
    let addrCriteriaForRestaurant = { _id: payloadData.restaurantId };
    let projectionForRestaurant = { __v: 0, addressAutoIncrementId: 0 };
    let queryGetResult = await Promise.all([
      Service.CustomerAddressService.getData(addrCriteria, projection, {
        lean: true,
      }),
      Service.RestaurantService.getData(
        addrCriteriaForRestaurant,
        projectionForRestaurant,
        { lean: true }
      ),
      //Service.ToppingItemService.getData(tCriteria,{__v:0},{lean:true}),
    ]); //console.log(" queryGetResult[1]", queryGetResult[1].length);
    if (queryGetResult[1].length == 0) {
      throw STATUS_MSG.ERROR.INVALID_RESTAURANT_ID;
    }
    let restaurantData = queryGetResult[1][0]; //console.log("restaurantData368",restaurantData);
    let addrDetails = queryGetResult[0];
    if (addrDetails.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ADDRESS_ID;
    }
    let addressLocation = addrDetails[0].location;
    let polygonCriteria = {
      //"_id" : ObjectId("5ffadb2020323b8aeacff428"),
      //"isDeleted" : false,
      deliveryServiceArea: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: addressLocation.coordinates, //[76.3762860641881,27.739843018855876 ]
          },
        },
      },
      restaurant: { $in: [payloadData.restaurantId] },
    };
    let pointExistsInPolygonOrNot = await Service.RestaurantAreaService.getData(
      polygonCriteria,
      {},
      { lean: true }
    );
    if (pointExistsInPolygonOrNot.length == 0) {
      //throw STATUS_MSG.ERROR.RESTAURANT_NOT_AVAILABLE_ON_THIS_LOCATION;
    }

    delete addrDetails[0].customerId;
    orderData.address = addrDetails[0];
    let insertOrder = await Service.OrderService.InsertData(orderData);
    let disheDetails = JSON.parse(JSON.stringify(payloadData.disheDetails));
    let dishelength = disheDetails.length;

    for (let i = 0; i < dishelength; i++) {
      dishesId.push(disheDetails[i].dishId);
      menuId.push(disheDetails[i].menuId);
      //console.log("disheDetails",payloadData.restaurantId,disheDetails[i]);
      let toppingDetail = disheDetails[i].toppingDetail || [];
      let toppingLength = toppingDetail.length;
      if (toppingLength > 0) {
        for (let j = 0; j < toppingLength; j++) {
          toppingIdAarry.push(toppingDetail[j].toppingId);
        }
      }
    } //console.log("heree==91");
    let disheCriteria = {
      _id: { $in: dishesId },
    };
    let tCriteria = {
      _id: { $in: toppingIdAarry },
      dishId: { $in: dishesId },
    }; //console.log("addrDetails==77",addrDetails);
    let queryResult = [];
    if (
      payloadData.paymentType == PAYMENT_TYPES.RAZORPAY &&
      payloadData.razorpayId != ""
    ) {
      //console.log("heree==106");
      captureRazorpayPayment.transactionType =
        TRANSACTION_TYPES.ORDER_CREATE_RAZORPAY;
      captureRazorpayPayment.orderId = insertOrder._id;
      queryResult = await Promise.all([
        Service.DishesService.getData(
          disheCriteria,
          { __v: 0 },
          { lean: true }
        ),
        Service.ToppingItemService.getData(
          tCriteria,
          { __v: 0 },
          { lean: true }
        ),
        Service.TransactionService.InsertData(captureRazorpayPayment),
      ]);
    } else {
      //console.log("heree==115",tCriteria);
      queryResult = await Promise.all([
        Service.DishesService.getData(
          disheCriteria,
          { __v: 0 },
          { lean: true }
        ),
        Service.ToppingItemService.getData(
          tCriteria,
          { __v: 0 },
          { lean: true }
        ),
      ]);
    } //console.log("heree==121");
    let dishesData = JSON.parse(JSON.stringify(queryResult[0]));
    let toppingData = queryResult[1];
    let tempDataArray = [],
      totalPrice = 0;
    let emailDataHtml = [];
    disheDetails.forEach((element) => {
      let tempData = {},
        itemTotalPrice = 0;
      tempData.restaurantId = payloadData.restaurantId;
      tempData.orderId = insertOrder._id;
      dishesData.forEach((innerElement) => {
        if (element.dishId == innerElement._id) {
          tempData.dishId = element.dishId;
          tempData.menuId = element.menuId;
          //tempData.itemName = innerElement.price;
          tempData.itemPrice = innerElement.price;
          tempData.quantity = element.quantity;
          tempData.toppingTitleId = innerElement.toppingTitleId;
          tempData.itemTotalPrice = innerElement.price * element.quantity;
          itemTotalPrice = innerElement.price * element.quantity;
          emailDataHtml.push({
            dishName: innerElement.itemName,
            quantity: element.quantity,
            itemPrice: innerElement.price,
            itemTotalPrice: itemTotalPrice,
          });

          //tempData.toppingDetail =element.toppingDetail;
        }
      }); //console.log("emailDataHtml",emailDataHtml);
      let toppingDetailArray = [];
      if (element.toppingDetail && element.toppingDetail.length > 0) {
        element.toppingDetail.forEach((elementTopping) => {
          toppingData.forEach((innerTopping) => {
            if (elementTopping.toppingId == innerTopping._id) {
              toppingDetailArray.push({
                toppingId: innerTopping._id,
                toppingPrice: innerTopping.price,
                toppingTitleId: innerTopping.toppingTitleId,
              });
              itemTotalPrice = itemTotalPrice + innerTopping.price;
            }
          });
        });
      }
      tempData.itemTotalPrice = itemTotalPrice;
      tempData.ToppingData = toppingDetailArray;
      totalPrice = totalPrice + itemTotalPrice;
      tempDataArray.push(tempData);
    });

    console.log(tempDataArray);
    let options = {};
    let insertOrderDetail = await Service.OrderDetailService.InsertMany(
      tempDataArray
    );

    let OrderDetail = [];
    insertOrderDetail.forEach((element) => {
      OrderDetail.push(element._id);
    });
    let dataToSet = {
      pricePaidByCustomer: payloadData.pricePaidByCustomer,
      orderDetail: OrderDetail,
    };

    let calculateAllCharge = await Helper.OrderHelper.calculateAllCharge(
      restaurantData,
      addrDetails,
      payloadData.totalPrice,
      payloadData.totalTax,
      UserData._id,
      payloadData.promoCode || null
    );

    let customerDeliveryCharge = calculateAllCharge.customerDeliveryCharge || 0;
    let riderDeliveryCharge = calculateAllCharge.riderDeliveryCharge || 0;
    let finalDistance = calculateAllCharge.finalDistance || 0;
    let adminCommission = calculateAllCharge.calculateAdminCommission || 0;
    let restaurantCommission = calculateAllCharge.restaurantCommission || 0;
    let promoCodeId = calculateAllCharge.promoCodeId || null;

    dataToSet.customerDeliveryCharge = customerDeliveryCharge;
    dataToSet.riderDeliveryCharge = riderDeliveryCharge;

    dataToSet.restaurantCommission = restaurantCommission;
    dataToSet.adminCommission = adminCommission;
    dataToSet.restaurantCommission = restaurantCommission;
    dataToSet.finalDistance = finalDistance;
    dataToSet.adminGstOnCommission =
      calculateAllCharge.calculateAdminGstPercentage || 0;

    // if(payloadData.promoCode && dataToSet.promoCodeId!=null){
    //   dataToSet.promoCodeId=promoCodeId;
    // }
    console.log("\n\n\n promoCode==266", payloadData.promoCode);
    if (
      payloadData.promoCode &&
      typeof payloadData.promoCode != undefined &&
      payloadData.promoCode != null
    ) {
      promoCodeData = await Helper.OrderHelper.checkPromoCode(
        payloadData.promoCode,
        payloadData.restaurantId,
        UserData._id,
        payloadData.totalPrice,
        payloadData.itemTotalPrice,
        customerDeliveryCharge,
        payloadData.totalTax
      );

      console.log("promoCodeData", promoCodeData);
      promoCodeDetails = {
        discountApplied: promoCodeData.dicountApplied,
        restaurantPartAmt: promoCodeData.finalRestaurantPartAmt,
        adminPartAmt: promoCodeData.finalAdminPartAmt,
        promoCodeId: promoCodeData.promoCodeId,
      };
      dataToSet.promoCodeDetails = promoCodeDetails;
    }
    console.log("\n\n\npromoCodeData==266", promoCodeData);
    console.log("dataToSet======267", dataToSet, "\n\n\n");
    await Promise.all([
      Service.OrderService.updateMultipleDocuments(
        { _id: insertOrder._id },
        dataToSet,
        options
      ),
      Service.RestaurantService.updateMultipleDocuments(
        { _id: payloadData.restaurantId },
        { $inc: { totalOrder: 1 } },
        { lean: true }
      ),
    ]);
    if (queryGetResult[1][0].deviceToken) {
      let createObjectForNotification = {
        deviceToken: queryGetResult[1][0].deviceToken,
        title: "Order Created",
        message: "Order has been comming",
      };
      UniversalFunctions.sendNotificationUsingFCM(createObjectForNotification);
      let storePushNotification = {
        userType: APP_CONSTANTS.USER_ROLES.RESTAURANT,
        userId: queryGetResult[1][0]._id,
        orderId: insertOrder._id,
        message: createObjectForNotification.message,
      };
      UniversalFunctions.storePushNotification(storePushNotification);
    }

    let tableDataHtml = await UniversalFunctions.generateOrderHtmlAndSendEmail({
      orderId: insertOrder._id,
      orderAuoIncrement: insertOrder.orderAuoIncrement,
      restaurantName: restaurantData.restaurantName,
      vendorFullAddress: restaurantData.vendorFullAddress,
      emailDataHtml: emailDataHtml,
      deliveryAddress: insertOrder.address.address,
      flatNumber: insertOrder.address.flatNumber,
      landmark: insertOrder.address.landmark,
      buildingAddress: insertOrder.address.buildingAddress,
      customerData: UserData,
      createdAt: insertOrder.createdAt,
    });
    return {
      orderId: insertOrder._id,
      orderAuoIncrement: insertOrder.orderAuoIncrement,
      OrderDetail,
    };
  } catch (err) {
    throw err;
  }
};

let getCustomerOrderList = async (payload, UserData) => {
  try {
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo",
        options: { lean: true },
      },
    ];
    let criteria = { customerId: UserData._id };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      lean: true,
      sort: { orderAuoIncrement: -1 },
    };
    let queryResult = await Promise.all([
      Service.OrderService.getData(criteria, {}, {}),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
      //Service.OrderService.getData(criteria,{__v:0}, options)
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount: totalCount.length || 0,
      orderList: allData,
    };
  } catch (err) {
    throw err;
  }
};

let OrderDetail = async (payload, UserData) => {
  try {
    let criteria = { orderId: payload.orderId };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      lean: true,
      //sort:{orderAuoIncrement:-1}
    };
    let criteriaOrder = { _id: payload.orderId };
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo restaurantAutoIncrementId",
        options: { lean: true },
      },
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName rating currentLocation driverNumber",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName rating lastName countryCode mobileNumber",
        options: { lean: true },
      },
    ];
    let collectionOption2 = [
      {
        path: "dishId",
        model: "dishes",
        select: "_id itemName image ",
        options: { lean: true },
      },
      {
        path: "menuId",
        model: "menu",
        select: "_id menuName menuImage menuAutoIncrementId",
        options: { lean: true },
      },
    ];
    let nestedModel = [
      {
        path: "ToppingData.toppingId",
        model: "topping",
        select:
          "_id toppingTitleId toppingName price isVegetarian toppingAutoIncrementId subToppingId isChildExists",
        options: { lean: true },
      },
    ];
    //let projection={restaurantId:1,address:1,totalPrice:1,orderAuoIncrement:1,pricePaidByCustomer:1, orderAuoIncrement:1,paymentType:1,orderType:1,driverId:1,status:1,createdAt:1,isdriverAssigned:1,createdAt:1,updatedAt:1}
    let projection = {};
    let queryResult = await Promise.all([
      Service.DAOService.getDataDeepPopulateFixed(
        Models.OrderDetailTable,
        criteria,
        { __v: 0 },
        options,
        collectionOption2,
        nestedModel
      ),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteriaOrder,
        projection,
        options,
        collectionOptions
      ),
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[0];
    let orderData = queryResult[1] || [];
    if (orderData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    }
    return {
      //totalCount:totalCount.length || 0,
      orderData: orderData[0],
      orderDetail: allData,
    };
  } catch (err) {
    throw err;
  }
};

let customerOrderDetail = async (payload, UserData) => {
  try {
    let criteria = { orderId: payload.orderId };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      lean: true,
      //sort:{orderAuoIncrement:-1}
    };
    let criteriaOrder = { _id: payload.orderId };
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo restaurantAutoIncrementId",
        options: { lean: true },
      },
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName rating currentLocation driverNumber",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName rating lastName countryCode mobileNumber",
        options: { lean: true },
      },
    ];
    let collectionOption2 = [
      {
        path: "dishId",
        model: "dishes",
        select: "_id itemName image ",
        options: { lean: true },
      },
      {
        path: "menuId",
        model: "menu",
        select: "_id menuName menuImage menuAutoIncrementId",
        options: { lean: true },
      },
    ];
    let nestedModel = [
      {
        path: "ToppingData.toppingId",
        model: "topping",
        select:
          "_id toppingTitleId toppingName price isVegetarian toppingAutoIncrementId subToppingId isChildExists",
        options: { lean: true },
      },
    ];
    let projection = {
      restaurantId: 1,
      address: 1,
      totalPrice: 1,
      orderAuoIncrement: 1,
      pricePaidByCustomer: 1,
      orderAuoIncrement: 1,
      paymentType: 1,
      orderType: 1,
      driverId: 1,
      status: 1,
      createdAt: 1,
      isdriverAssigned: 1,
      driverCommission: 1,
      itemTotalPrice: 1,
      totalTax: 1,
      pricePaidByCustomer: 1,
      dicountApplied: 1,
    };
    let queryResult = await Promise.all([
      Service.DAOService.getDataDeepPopulateFixed(
        Models.OrderDetailTable,
        criteria,
        { __v: 0 },
        options,
        collectionOption2,
        nestedModel
      ),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteriaOrder,
        projection,
        options,
        collectionOptions
      ),
    ]);

    let orderData = queryResult[1] || [];
    if (orderData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    }
    let allData = queryResult[0];
    for (let element of queryResult[0]) {
      for (let innerElement of element.ToppingData) {
        let gettitle = [];
        if (innerElement.toppingId && innerElement.toppingId.toppingTitleId) {
          gettitle = await Service.ToppingTitleService.getData(
            { _id: innerElement.toppingId.toppingTitleId },
            { title: 1 },
            { lean: true }
          );
          innerElement.toppingId.toppingTitleId = {
            _id: innerElement.toppingId.toppingTitleId,
            title: gettitle[0].title,
          };
        }
      }
    }
    return {
      orderData: orderData[0],
      orderDetail: allData,
    };
  } catch (err) {
    throw err;
  }
};

let getRestaurantOrderList = async (payload, UserData) => {
  try {
    let criteria = {
      restaurantId: UserData._id,
      //isScheduleOrder:payload.isScheduleOrder
    };
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
        select: "_id firstName lastName profilePicURL",
        options: { lean: true },
      },
    ];
    if (payload.status) {
      criteria.status = payload.status;
    }
    let scheduleOrder = {
      restaurantId: UserData._id,
      isScheduleOrder: true,
      status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED] },
    };
    let queryResult = await Promise.all([
      Service.OrderService.countData(criteria),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.PENDING,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.ACCEPTED,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.COOKED,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.PICKED_BY_RIDER,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.DELIVERED_BY_RIDER,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.CANCELLED_BY_CUSTOMER,
      }),
      Service.OrderService.countData({
        restaurantId: UserData._id,
        status: ORDER_STATUS.CANCELLED_BY_RESTAURANT,
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

let getAvailableDriver = async (Data) => {
  try {
    let geoNear = {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: Data.locationLongLat, //[ 76.83091565966606, 30.733033957112543 ]
        },
        distanceField: "dist.calculated",
        maxDistance: 1000,
        query: {
          IsBusy: false,
          Islogin: true, //,Isverified:true,IsBlock:false
        },
        distanceMultiplier: 0.001,
        includeLocs: "dist.location",
        $limit: 50,
        uniqueDocs: true,
        spherical: true,
      },
    };
    let options = { lean: true };
    let driverList = await Service.DriverService.aggregateQuery([geoNear]);
    //console.log("driverList",driverList);
    return driverList;
  } catch (error) {
    throw error;
  }
};
//getAvailableDriver({});

let getDriverOrderList = async (payload, UserData) => {
  try {
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo rating",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "restaurant",
        select: "_id firstName lastName mobileNumber",
        options: { lean: true },
      },
    ];
    let criteria = { driverId: UserData._id };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      lean: true,
      sort: { orderAuoIncrement: -1 },
    };
    let queryResult = await Promise.all([
      Service.OrderService.getData(criteria, {}, {}),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
      //Service.OrderService.getData(criteria,{__v:0}, options)
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount: totalCount.length || 0,
      orderList: allData,
    };
  } catch (err) {
    throw err;
  }
};

let driverNewOrderList = async (payload, UserData) => {
  try {
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName logo rating",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "restaurant",
        select: "_id firstName lastName mobileNumber",
        options: { lean: true },
      },
    ];
    let criteria = {
      driverId: UserData._id,
      status: {
        $nin: [
          ORDER_STATUS.CANCELLED_BY_RESTAURANT,
          ORDER_STATUS.CANCELLED_BY_CUSTOMER,
          ORDER_STATUS.CANCELLED_BY_RIDER,
          ORDER_STATUS.DELIVERED_BY_RIDER,
        ],
      },
    };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      lean: true,
      sort: { orderAuoIncrement: -1 },
    };
    let queryResult = await Promise.all([
      Service.OrderService.getData(criteria, {}, {}),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions
      ),
      //Service.OrderService.getData(criteria,{__v:0}, options)
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount: totalCount.length || 0,
      orderList: allData,
    };
  } catch (err) {
    throw err;
  }
};

let getOrderInvoice = async (payload, UserData) => {
  try {
    let criteria = { orderId: payload.orderId };
    let options = { lean: true };
    let criteriaOrder = { _id: payload.orderId };
    let collectionOptions = [
      {
        path: "restaurantId",
        model: "restaurant",
        select:
          "_id restaurantName logo restaurantAutoIncrementId vendorFullAddress state city country",
        options: { lean: true },
      },
      {
        path: "driverId",
        model: "driver",
        select: "_id fullName rating currentLocation driverNumber",
        options: { lean: true },
      },
      {
        path: "customerId",
        model: "customer",
        select: "_id firstName rating lastName countryCode mobileNumber email",
        options: { lean: true },
      },
    ];
    let collectionOption2 = [
      {
        path: "dishId",
        model: "dishes",
        select: "_id itemName image ",
        options: { lean: true },
      },
      {
        path: "menuId",
        model: "menu",
        select: "_id menuName menuImage menuAutoIncrementId",
        options: { lean: true },
      },
    ];
    let nestedModel = [
      {
        path: "ToppingData.toppingId",
        model: "topping",
        select:
          "_id toppingTitleId toppingName price isVegetarian toppingAutoIncrementId subToppingId isChildExists",
        options: { lean: true },
      },
    ];
    //let projection={restaurantId:1,address:1,totalPrice:1,orderAuoIncrement:1,pricePaidByCustomer:1, orderAuoIncrement:1,paymentType:1,orderType:1,driverId:1,status:1,createdAt:1,isdriverAssigned:1,createdAt:1,updatedAt:1}
    let projection = {};
    let queryResult = await Promise.all([
      Service.DAOService.getDataDeepPopulateFixed(
        Models.OrderDetailTable,
        criteria,
        { __v: 0 },
        options,
        collectionOption2,
        nestedModel
      ),
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteriaOrder,
        projection,
        options,
        collectionOptions
      ),
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[0];
    let orderData = queryResult[1] || [];
    if (orderData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    }
    orderData[0].hsnCode = "dummy";
    orderData[0].serviceDescription = "dummy";
    //Restaurant Dummy variables
    orderData[0].restaurantId.pan = "";
    orderData[0].restaurantId.invoiceDate = new Date();
    orderData[0].restaurantId.cin = "";
    orderData[0].restaurantId.gstin = "";

    //Customer Dummy variables
    orderData[0].customerId.pan = "";
    orderData[0].customerId.address = "";
    orderData[0].customerId.state = "";
    orderData[0].customerId.stateCode = "";
    orderData[0].customerId.gstin = "";

    return {
      //totalCount:totalCount.length || 0,
      orderData: orderData[0],
      orderDetail: allData,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createOrder: createOrder,
  getCustomerOrderList: getCustomerOrderList,
  getDriverOrderList: getDriverOrderList,
  getRestaurantOrderList: getRestaurantOrderList,
  OrderDetail: OrderDetail,
  customerOrderDetail: customerOrderDetail,
  driverNewOrderList: driverNewOrderList,
  getOrderInvoice: getOrderInvoice,
};
