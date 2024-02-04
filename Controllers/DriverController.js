/**
 * Created by Indersein on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
const Mongoose = require("mongoose");
const readFilePromise = require("fs-readfile-promise");

const Service = require("../Services");
const Models = require("../Models");
const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunctions");
const RazorpayPaymentsController = require("./RazorpayPaymentsController");
const RazorpayXPaymentsController = require("./RazorpayXPaymentsController");
const { exit } = require("process");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const FRIEND_REQUEST_TYPE = APP_CONSTANTS.FRIEND_REQUEST_TYPE;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;
//const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
//const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const ORDER_STATUS = APP_CONSTANTS.ORDER_STATUS;
const TRANSACTION_TYPES = APP_CONSTANTS.TRANSACTION_TYPES;

const login = async (payloadData) => {
  //console.log("login====init");
  let userData;
  payloadData.location = {
    type: "Point",
    coordinates: [payloadData.longitude, payloadData.latitude],
  };
  let deviceData = {
    deviceType: payloadData.deviceType,
    deviceToken: payloadData.deviceToken,
  };
  delete payloadData.deviceType;
  delete payloadData.deviceToken;
  try {
    let criteria = { email: payloadData.email };
    let getData = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    );
    if (getData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }
    if (
      getData[0].password !=
      UniversalFunctions.encryptedPassword(payloadData.password)
    ) {
      throw STATUS_MSG.ERROR.INVALID_EMAIL_PASSWORD;
    }
    let userData = getData[0];
    let checkDevice = await UniversalFunctions.checkDeviceTokenAndDelete(
      deviceData,
      APP_CONSTANTS.USER_ROLES.DRIVER
    );
    let accessToken = await UniversalFunctions.generateAuthToken({
      _id: userData._id,
      email: userData.email,
      name: userData.email,
      role: APP_CONSTANTS.USER_ROLES.DRIVER,
    });

    let updateCriteria = { _id: userData._id };
    let dataToSet = {
      accessToken: accessToken,
      deviceType: deviceData.deviceType,
      deviceToken: deviceData.deviceToken,
      Islogin: true,
      lastLoginAt: new Date(),
    };
    let finalData = await Service.DriverService.updateData(
      updateCriteria,
      dataToSet,
      { new: true, lean: true }
    );
    finalData = JSON.parse(JSON.stringify(finalData));
    delete finalData.password;
    delete finalData.__v;
    delete finalData.__v;
    delete finalData.emailVerified;
    delete finalData.phoneVerified;
    delete finalData.isDeleted;
    delete finalData.isBlocked;
    delete finalData.drivingLicense;
    delete finalData.adharcardDoc;
    delete finalData.otherDocuments;
    return { driverData: finalData };
  } catch (err) {
    throw err;
  }
};

let getProfileData = async (payload, UserData) => {
  //console.log("UserData",UserData);
  try {
    delete UserData.password;
    delete UserData.__v;
    delete UserData.__v;
    delete UserData.emailVerified;
    delete UserData.mobileVerified;
    delete UserData.isDeleted;
    delete UserData.isBlocked;
    delete UserData.passwordResetToken;
    if (UserData.adharcardDoc == undefined) {
      UserData.adharcardDoc = {};
    }
    if (UserData.drivingLicense == undefined) {
      UserData.drivingLicense = {};
    }

    return { customerData: UserData };
  } catch (err) {
    throw err;
  }
};

let logout = async (UserData) => {
  //console.log("UserData",UserData);
  try {
    let criteria = { _id: UserData._id };
    let dataToSet = {
      $unset: {
        accessToken: 1,
        deviceToken: 1,
      },
    };
    let options = {};
    let updatePassWord = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      options
    );
    return {};
  } catch (err) {
    throw err;
  }
};

let changePassword = async (payloadData, UserData) => {
  try {
    let criteria = { _id: UserData._id };
    let encryptedPassword = UniversalFunctions.encryptedPassword(
      payloadData.oldPassword
    );
    let driverData = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    );
    console.log(driverData);
    if (driverData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    if (driverData[0].password != encryptedPassword) {
      throw STATUS_MSG.ERROR.INCORRECT_OLD_PASS;
    }
    let dataToSet = {
      password: UniversalFunctions.encryptedPassword(payloadData.newPassword),
    };
    let updatePassWord = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      { new: true, lean: true }
    ); //console.log("servingLocation",servingLocation);
    delete updatePassWord.password;
    delete updatePassWord.__v;
    return { customerData: updatePassWord };
  } catch (err) {
    throw err;
  }
};

let updateLatOrLong = async (payloadData, UserData) => {
  console.log("===Update Latitude or longitude===");
  try {
    let criteria = { _id: UserData._id };
    let userData = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    ); //console.log("restaurantData",restaurantData);
    if (userData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    let uniqueCode = Math.floor(1000 + Math.random() * 9000);
    let dataToSet = {
      currentLocation: {
        type: "Point",
        coordinates: [payloadData.longitude, payloadData.latitude],
      },
      updatedAt: new Date(),
    };
    let updateLatitudeOrLongitude = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      { new: true }
    );

    return {
      updateLatitudeOrLongitude: updateLatitudeOrLongitude,
    };
  } catch (err) {
    throw err;
  }
};
let forgotPassword = async (payloadData, UserData) => {
  console.log("===forgotPassword===");
  try {
    let criteria = { phoneNo: payloadData.mobileNumber };
    let userData = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    ); //console.log("restaurantData",restaurantData);
    if (userData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    let uniqueCode = APP_CONSTANTS.MOBILE_SMS;
    let dataToSet = {
      otpCode: uniqueCode,
      updatedAt: new Date().toISOString(),
    };
    let updatePassWord = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      { new: true }
    );
    UniversalFunctions.sendSMS(
      payloadData.mobileNumber,
      uniqueCode,
      LANGUAGE_SPECIFIC_MESSAGE.verificationCodeMsg.EN + uniqueCode
    );
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
    let criteria = { phoneNo: payloadData.mobileNumber };
    let userData = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    );
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
    let updatePassWord = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      optionsU
    );
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
    let getRestaurantDetail = await Service.DriverService.getData(
      criteria,
      {},
      { lean: true }
    );
    if (getRestaurantDetail.length == 0) throw STATUS_MSG.ERROR.NOT_FOUND;
    restaurantData = getRestaurantDetail[0];

    if (restaurantData.passwordResetToken != payloadData.passwordResetToken)
      throw STATUS_MSG.ERROR.INVALID_OTP;
    let encryptedPassword = UniversalFunctions.encryptedPassword(
      payloadData.newPassword
    );
    let dataToSet = {
      $set: { password: encryptedPassword },
      $unset: { passwordResetToken: 1, otpCode: 1 },
    };
    let updatePassWord = await Service.DriverService.updateData(
      criteria,
      dataToSet,
      { new: true }
    );
    return {};
  } catch (err) {
    throw err;
  }
};

let uploadProfilePic = async (payloadData, UserData) => {
  console.log("uploadProfilePic==init");
  try {
    let criteria = { _id: UserData._id };
    if (typeof payloadData.document == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    let folderName = APP_CONSTANTS.FOLDER_NAME.images;
    let contentType = payloadData.document.hapi.headers["content-type"];
    // let imageFile = await UniversalFunctions.uploadFiles(payloadData.document,
    //   "driverPic_",UserData._id,folderName,contentType);
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(
      payloadData.document,
      "driverPic_",
      UserData._id,
      folderName,
      contentType
    );
    let driverProfilePic;
    let dataToSet = {
      profilePicURL: imageFile[0],
    }; //console.log("imageFile247",imageFile);
    driverProfilePic = await Service.DriverService.updateMultipleDocuments(
      criteria,
      dataToSet,
      { lean: true }
    );
    return {};
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let uploadDocument = async (payloadData, UserData) => {
  console.log("uploadDocument==init");
  let docPreFix =
    payloadData.documentType == 1
      ? "doc_adharcard_"
      : payloadData.documentType == 2
      ? "doc_drivingLicense_"
      : "doc_other_";
  try {
    let criteria = { _id: UserData._id };
    if (typeof payloadData.document == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }
    let folderName = APP_CONSTANTS.FOLDER_NAME.Driver_KYC;
    let contentType = payloadData.document.hapi.headers["content-type"];
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(
      payloadData.document,
      docPreFix,
      UserData._id,
      folderName,
      contentType
    );
    console.log("imageFile358", imageFile);
    let driverProfilePic,
      dataToSet = {};
    let imageSaveData = {
      docTitle: payloadData.docTitle,
      docFileUrl: imageFile[0].original,
      createdAt: Date(),
      Isverified: false,
    };
    if (payloadData.documentType == 1) {
      dataToSet.adharcardDoc = imageSaveData;
    }
    if (payloadData.documentType == 2) {
      dataToSet.drivingLicense = imageSaveData;
    }
    if (payloadData.documentType == 3) {
      //dataToSet.otherDocuments =[imageSaveData];
      dataToSet.$addToSet = { otherDocuments: imageSaveData };
    }
    driverProfilePic = await Service.DriverService.updateMultipleDocuments(
      criteria,
      dataToSet,
      { lean: true }
    );
    return {};
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let getDashboardData = async (payloadData, UserData) => {
  try {
    let tOrderCriteria = {
      driverId: UserData._id,
      status: APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER,
    };
    let nOrderCriteria = {
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
    let cOrderCriteria = {
      driverId: UserData._id,
      status: { $in: [ORDER_STATUS.CANCELLED_BY_RIDER] },
    };
    let queryResult = await Promise.all([
      Service.OrderService.countData(tOrderCriteria),
      Service.OrderService.countData(nOrderCriteria),
      Service.OrderService.countData(cOrderCriteria),
    ]);
    let total_orders = queryResult[0];
    let totalCount = [];
    return {
      totalCount: totalCount.length,
      total_earning: UserData.walletBalance,
      total_orders: total_orders,
      rating: UserData.rating.averageRating || 0,
      total_km: UserData.totalDistanceTraveled,
      new_orders: queryResult[1],
      cancelled_orders: queryResult[2],
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let driverOrderUpdateStatus = async (payload, UserData) => {
  let collectionOptions = [
    {
      path: "restaurantId",
      model: "restaurant",
      select: "_id restaurantName logo deviceToken deviceType",
      options: { lean: true },
    },
    {
      path: "customerId",
      model: "customer",
      select:
        "_id firstName rating lastName countryCode mobileNumber deviceType deviceToken",
      options: { lean: true },
    },
  ];
  let criteriaOrder = { _id: payload.orderId };
  let messageNotification = "";
  let criteriaForNotificationText = {};
  try {
    let queryResult = await Promise.all([
      Service.DAOService.getDataWithReferenceFixed(
        Models.OrderTable,
        criteriaOrder,
        {},
        { lean: true },
        collectionOptions
      ),
      Service.NotificationTextService.getData(
        criteriaForNotificationText,
        {},
        { lean: true }
      ),
    ]);
    let orderData = queryResult[0] || [];
    let notificationData = queryResult[1] || [];

    if (orderData.length == 0) throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    if (orderData[0].driverId != UserData._id)
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;

    let criteria = { _id: payload.orderId, driverId: UserData._id };
    let options = { lean: true };
    let dataToSet = { status: payload.status, updatedAt: new Date() };
    if (payload.status == APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER) {
      let getMessage = "";
      notificationData.forEach((element) => {
        if (element.event == APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER) {
          getMessage = element.event_message;
        }
      });
      dataToSet.pickedByRiderDate = new Date();

      messageNotification = UserData.fullName` ${getMessage}`;
      if (orderData[0].status == APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER) {
        throw STATUS_MSG.ERROR.YOU_ALREADY_PICKED_THE_ORDER;
      }
      if (
        orderData[0].status ==
          APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION ||
        orderData[0].status == APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER
      ) {
        throw STATUS_MSG.ERROR.YOU_CAN_NOT_PERFORM_THIS_ACTION;
      }
    } else if (
      payload.status == APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION
    ) {
      let getMessage = "";
      notificationData.forEach((element) => {
        if (
          element.event == APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION
        ) {
          getMessage = element.event_message;
        }
      });

      dataToSet.orderPickedAt = new Date();
      messageNotification = UserData.fullName` ${getMessage}`;
      if (
        orderData[0].status == APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION
      ) {
        throw STATUS_MSG.ERROR.YOU_ALREADY_REACHED_CUSTOMER_LOCATION;
      }
    } else if (
      payload.status == APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER
    ) {
      let getMessage = "";
      notificationData.forEach((element) => {
        if (element.event == APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER) {
          getMessage = element.event_message;
        }
      });
      dataToSet.orderDeliverdAt = new Date();
      messageNotification = UserData.fullName` ${getMessage}`;
      if (
        orderData[0].status == APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER
      ) {
        throw STATUS_MSG.ERROR.YOU_ALREADY_DELIVERED_THE_RIDER;
      }
    }
    let transctionData = {
      adminCommission: orderData[0].adminCommission,
      driverCommission: orderData[0].driverCommission,
      restaurantCommission: orderData[0].restaurantCommission,
      orderId: payload.orderId,
      restaurantId: orderData[0].restaurantId,
      customerId: orderData[0].customerId,
      totalAmount: orderData[0].totalPrice,
      transactionType: TRANSACTION_TYPES.ORDER_TRANSACTION,
      driverId: UserData._id,
    }; //console.log("transctionData",orderData,transctionData);
    let restaurantBalanceUpdate = {
      $inc: { walletBalance: orderData[0].restaurantCommission },
    };
    let driverBalanceUpdate = {
      IsBusy: false, //$set:{IsBusy:false},
      $inc: {
        walletBalance: orderData[0].driverCommission,
        totalDistanceTraveled: orderData[0].finalDistance,
      },
    };
    if (payload.status == APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER) {
      dataToSet.isTransactionSave = true;
      let orderResult = await Promise.all([
        //Service.OrderService.updateMultipleDocuments(criteriaOrder,{isTransactionSave:true},{lean:true}),
        Service.OrderService.updateMultipleDocuments(criteriaOrder, dataToSet, {
          lean: true,
        }),
        Service.TransactionService.InsertData(transctionData),
        Service.RestaurantService.updateMultipleDocuments(
          { _id: orderData[0].restaurantId },
          restaurantBalanceUpdate,
          { lean: true }
        ),
        Service.DriverService.updateMultipleDocuments(
          { _id: UserData._id },
          driverBalanceUpdate,
          { lean: true }
        ),
      ]);
    } else {
      await Service.OrderService.updateMultipleDocuments(
        criteria,
        dataToSet,
        options
      );
    }
    if (orderData[0].restaurantId && orderData[0].restaurantId.deviceToken) {
      let restaurantNotification = {
        deviceToken: orderData[0].restaurantId.deviceToken,
        title: messageNotification,
        message: messageNotification,
        notificationType: payload.status,
        OrderId: payload.orderId,
      };
      UniversalFunctions.sendNotificationUsingFCM(restaurantNotification);

      let storePushNotification = {
        userType: APP_CONSTANTS.USER_ROLES.RESTAURANT,
        userId: orderData[0].restaurantId._id,
        orderId: payload.orderId,
        message: restaurantNotification.message,
      };
      UniversalFunctions.storePushNotification(storePushNotification);
    }

    if (orderData[0].customerId && orderData[0].customerId.deviceToken) {
      let restaurantNotification = {
        deviceToken: orderData[0].customerId.deviceToken,
        title: messageNotification,
        message: messageNotification,
        notificationType: payload.status,
        OrderId: payload.orderId,
      };
      UniversalFunctions.sendNotificationUsingFCM(restaurantNotification);
      let storePushNotification2 = {
        userType: APP_CONSTANTS.USER_ROLES.CUSTOMER,
        userId: orderData[0].customerId._id,
        orderId: payload.orderId,
        message: restaurantNotification.message,
      };
      UniversalFunctions.storePushNotification(storePushNotification2);
    }
    return {};
  } catch (err) {
    throw err;
  }
};

let addWalletbalance = async (payloadData, UserData) => {
  try {
    let criteria = { _id: UserData._id };
    let dataToSet = {
      $inc: { walletBalance: payloadData.capital },
    };
    let captureRazorpayPayment =
      await RazorpayPaymentsController.capturePayment({
        transaction_id: payloadData.transactionId,
        amount: payloadData.capital,
        currency: payloadData.currency || "",
      }); //console.log("captureRazorpayPayment",captureRazorpayPayment.transactionRespons);
    captureRazorpayPayment.driverId = UserData._id;
    captureRazorpayPayment.totalAmount = payloadData.capital;
    if (captureRazorpayPayment.status == "success") {
      await Service.TransactionService.InsertData(captureRazorpayPayment);
      let updateWalletbalance = await Service.DriverService.updateData(
        criteria,
        dataToSet,
        { new: true }
      );
      return {};
    } else {
      throw STATUS_MSG.ERROR.APP_ERROR;
    }
  } catch (err) {
    throw err;
  }
};

let orderRequestAcceptedAndRejected = async (payload, UserData) => {
  try {
    let criteria = { orderId: payload.orderId, driverId: UserData._id };
    let criteria2 = {
      orderId: payload.orderId,
      status: APP_CONSTANTS.ORDER_STATUS.ACCEPTED_BY_DRIVER,
    };
    let options = { lean: true };
    let dataToSet;
    if (
      payload.orderRequestStatus ==
      APP_CONSTANTS.ORDER_STATUS.ACCEPTED_BY_DRIVER
    ) {
      let checkOrderRequest = await Service.DriverOrderRequestService.getData(
        criteria2,
        {},
        options
      );
      if (checkOrderRequest.length > 0) {
        throw STATUS_MSG.ERROR.ORDER_ALREADY_ACCEPTED;
      }
      dataToSet = {
        status: payload.orderRequestStatus,
        acceptedDate: Date.now(),
      };
    } else if (APP_CONSTANTS.ORDER_STATUS.REJECTED_BY_DRIVER) {
      dataToSet = {
        status: payload.orderRequestStatus,
        rejectedDate: Date.now(),
      };
    }
    let queryResult = await Promise.all([
      Service.DriverOrderRequestService.updateMultipleDocuments(
        criteria,
        dataToSet,
        options
      ),
    ]);
    if (
      payload.orderRequestStatus ==
      APP_CONSTANTS.ORDER_STATUS.ACCEPTED_BY_DRIVER
    ) {
      await Service.OrderService.updateMultipleDocuments(
        { _id: payload.orderId },
        { isdriverAssigned: true, driverId: UserData._id },
        {}
      );
    }
    return {};
  } catch (err) {
    throw err;
  }
};

let getOrderRequest = async (payload, UserData) => {
  try {
    let options = {
      lean: true,
      skip: payload.skip,
      limit: payload.limit,
      sort: { orderAuoIncrement: -1 },
    };
    let criteria = { driverId: UserData._id };
    let collectionOptions = [
      {
        path: "orderId",
        model: "orderTables",
        select:
          "_id totalPrice address paymentType restaurantId orderAuoIncrement",
        options: { lean: true },
      },
    ];
    let nestedModel = [
      {
        path: "orderId.restaurantId",
        model: "restaurant",
        select:
          "_id restaurantName logo rating vendorFullAddress restaurantAutoIncrementId",
        options: { lean: true },
      },
    ];
    let queryResult = await Promise.all([
      Service.DriverOrderRequestService.getData(criteria, {}, options),
      Service.DAOService.getDataDeepPopulateFixed(
        Models.DriverOrderRequestTable,
        criteria,
        { __v: 0 },
        options,
        collectionOptions,
        nestedModel
      ),
    ]);
    let totalCount = queryResult[0];
    let allRequest = queryResult[1];
    return {
      totalCount: totalCount.length,
      allRequest: allRequest,
    };
  } catch (err) {
    throw err;
  }
};

let getTransactionData = async (payloadData, UserData) => {
  console.log("getFaq==init");
  try {
    let criteria = { driverId: UserData._id };
    let projection = { transactionRespons: 0, __v: 0 };
    let options = {
      skip: payloadData.skip,
      limit: payloadData.limit,
      lean: true,
    };
    let collectionOptions = [
      {
        path: "orderId",
        model: "orderTables",
        select: "_id orderAuoIncrement address",
        options: { lean: true },
      },
      {
        path: "restaurantId",
        model: "restaurant",
        select: "_id restaurantName restaurantAutoIncrementId logo",
        options: { lean: true },
      },
    ];
    let queryResult = await Promise.all([
      Service.TransactionService.countData(criteria),
      //Service.TransactionService.getData(criteria, projection,options),
      Service.DAOService.getDataWithReferenceFixed(
        Models.TransactionTable,
        criteria,
        projection,
        options,
        collectionOptions
      ),
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount: totalCount,
      transactionList: queryResult[1] || [],
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let getBonusData = async (payloadData, UserData) => {
  console.log("getBonusData==init");
  try {
    let criteria = { isDeleted: false },
      options = { lean: true };
    let queryResult = await Promise.all([
      Service.DriverBonusService.countData(criteria),
      Service.DriverBonusService.getData(criteria, { __v: 0 }, options),
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount: totalCount,
      bonusList: queryResult[1] || [],
    };
  } catch (err) {
    //console.log("err",err);
    throw err;
  }
};

let submitWithdraw = async (payloadData, UserData) => {
  try {
    if (UserData.walletBalance < payloadData.amount) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.AMOUNT_NOT_SUFFICIENT;
    }
    let criteria = { _id: UserData._id };
    let dataToSet = {
      $inc: { walletBalance: -payloadData.amount },
    };
    let withdrawTransaction = {
      driverId: UserData._id,
      transactionType:
        APP_CONSTANTS.TRANSACTION_TYPES.SUBMIT_WITHDRAW_FROM_DRIVER,
      totalAmount: payloadData.amount,
    };
    let queryResult = await Promise.all([
      Service.TransactionService.InsertData(withdrawTransaction),
      Service.DriverService.updateData(criteria, dataToSet, { new: true }),
    ]);

    let apiData = {
      fund_account_id: UserData.fund_account_id,
      amount: payloadData.amount,
    };
    let apiResponse = await RazorpayXPaymentsController.createPayout(apiData);
    let criteria1 = { _id: queryResult[0]._id };
    let dataToSet2 = { transactionRespons: apiResponse };
    Service.TransactionService.updateData(criteria1, dataToSet2, { new: true });
    return {};
  } catch (err) {
    throw err;
  }
};

let getNotificationList = async (payload, UserData) => {
  //console.log("UserData",UserData);
  try {
    let criteria = {
      userId: UserData._id,
      userType: APP_CONSTANTS.USER_ROLES.DRIVER,
    };
    let options = { skip: payload.skip, limit: payload.limit };
    let queryResult = await Promise.all([
      Service.NotificationStoreService.getData(criteria, {}, {}),
      Service.NotificationStoreService.getData(criteria, { __v: 0 }, options),
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount: totalCount.length || 0,
      allData: allData,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  login: login,
  logout: logout,
  changePassword: changePassword,
  verifyOtp: verifyOtp,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  getProfileData: getProfileData,
  uploadProfilePic: uploadProfilePic,
  uploadDocument: uploadDocument,
  updateLatOrLong: updateLatOrLong,
  getDashboardData: getDashboardData,
  driverOrderUpdateStatus: driverOrderUpdateStatus,
  addWalletbalance: addWalletbalance,
  orderRequestAcceptedAndRejected: orderRequestAcceptedAndRejected,
  getOrderRequest: getOrderRequest,
  getTransactionData: getTransactionData,
  getBonusData: getBonusData,
  submitWithdraw: submitWithdraw,
  getNotificationList: getNotificationList,
};
