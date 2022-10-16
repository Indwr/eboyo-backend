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
const { exit } = require("process");
const CalcDistanceBetweenCoordinates = require("../Utils/CalcDistanceBetweenCoordinates");
const Helper = require("../Helper");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
console.log("LANGUAGE_SPECIFIC_MESSAGE", LANGUAGE_SPECIFIC_MESSAGE);

const registration = async (payloadData) => {
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
  let otp = APP_CONSTANTS.MOBILE_SMS;
  try {
    if (payloadData.countryCode.lastIndexOf("+") != 0) {
      throw STATUS_MSG.ERROR.INVALID_COUNTRY_CODE;
    }
    let criteria = { mobileNumber: payloadData.mobileNumber };
    let checkUserExistOrNot = await Service.CustomerService.getData(
      criteria,
      {},
      { lean: true }
    );
    if (checkUserExistOrNot.length > 0) {
      userData = checkUserExistOrNot[0];
    } else {
      userData = await Service.CustomerService.InsertData(payloadData);
    }
    let checkDevice = await UniversalFunctions.checkDeviceTokenAndDelete(
      deviceData,
      APP_CONSTANTS.USER_ROLES.CUSTOMER
    );
    let accessToken = await UniversalFunctions.generateAuthToken({
      _id: userData._id,
      email: userData.email,
      name: userData.email,
      role: APP_CONSTANTS.USER_ROLES.CUSTOMER,
    });
    let updateCriteria = { _id: userData._id };
    let dataToSet = {
      accessToken: accessToken,
      deviceType: deviceData.deviceType,
      deviceToken: deviceData.deviceToken,
      otpCode: otp,
    };
    let finalData = await Service.CustomerService.updateData(
      updateCriteria,
      dataToSet,
      { new: true, lean: true }
    );

    UniversalFunctions.sendSMS(
      payloadData.mobileNumber,
      otp,
      LANGUAGE_SPECIFIC_MESSAGE.verificationCodeMsg.EN + otp
    );
    delete finalData.password;
    delete finalData.__v;
    delete finalData.passwordResetToken;
    delete finalData.emailVerified;
    delete finalData.mobileVerified;
    delete finalData.isDeleted;
    delete finalData.isBlocked;
    return { customerData: finalData };
  } catch (err) {
    throw err;
  }
};

let updateProfile = async (payload, UserData) => {
  //console.log("UserData",UserData);
  try {
    let criteria = { _id: UserData._id };
    let dataToSet = {
      $set: payload,
    };
    let options = {};
    let updatePassWord = await Service.CustomerService.updateData(
      criteria,
      dataToSet,
      options
    );
    return {};
  } catch (err) {
    throw err;
  }
};

let uploadProfilePic = async (payloadData, UserData) => {
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
    // let imageFile = await UniversalFunctions.uploadFiles(payloadData.document,"customerPic_",UserData._id,folderName,contentType);
    let imageFile = await UniversalFunctions.uploadFilesWithCloudinary(
      payloadData.document,
      "customerPic_",
      UserData._id,
      folderName,
      contentType
    );
    let driverProfilePic;
    let dataToSet = {
      profilePicURL: imageFile[0],
    }; //console.log("imageFile247",imageFile);
    let project = {
      accessToken: 0,
      __v: 0,
      deviceType: 0,
      password: 0,
      otpCode: 0,
      isDeleted: 0,
      isBlocked: 0,
      passwordResetToken: 0,
      emailVerified: 0,
      mobileVerified: 0,
    };
    driverProfilePic = await Service.CustomerService.updateMultipleDocuments(
      criteria,
      dataToSet,
      { lean: true }
    );
    let customerData = await Service.CustomerService.getData(
      criteria,
      project,
      { lean: true }
    );
    return { customerData: customerData[0] };
  } catch (err) {
    //console.log("err",err);
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
    let updatePassWord = await Service.CustomerService.updateData(
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
    let restaurantData = await Service.CustomerService.getData(
      criteria,
      {},
      { lean: true }
    ); //console.log("restaurantData",restaurantData);
    if (restaurantData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }
    if (restaurantData[0].password != encryptedPassword) {
      throw STATUS_MSG.ERROR.INCORRECT_OLD_PASS;
    }
    let dataToSet = {
      password: UniversalFunctions.encryptedPassword(payloadData.newPassword),
    };
    let updatePassWord = await Service.CustomerService.updateData(
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

let forgotPassword = async (payloadData, UserData) => {
  //console.log("===forgotPassword===");
  try {
    let criteria = { mobileNumber: payloadData.mobileNumber };
    let userData = await Service.CustomerService.getData(
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
    let updatePassWord = await Service.CustomerService.updateData(
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
    let criteria = { mobileNumber: payloadData.mobileNumber };

    let userData = await Service.CustomerService.getData(
      criteria,
      {},
      { lean: true }
    );
    console.log("userData", userData, userData[0].otpCode, payloadData.otpCode);
    if (userData.length == 0) {
      throw STATUS_MSG.ERROR.NOT_FOUND;
    }

    if (userData[0].otpCode != payloadData.otpCode) {
      throw STATUS_MSG.ERROR.INCORRECT_PASSWORD_OTP;
    }
    let accessToken = await UniversalFunctions.generateAuthToken({
      _id: userData[0]._id,
      mobileNumber: userData[0].mobileNumber,
      role: APP_CONSTANTS.USER_ROLES.CUSTOMER,
    });
    let dataToSet = {};
    if (payloadData.isForgotPassword) {
      dataToSet.passwordResetToken = accessToken;
    } else {
      dataToSet.mobileVerified = true;
    }

    let optionsU = { new: true, lean: true };
    let updatePassWord = await Service.CustomerService.updateData(
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
    let getRestaurantDetail = await Service.CustomerService.getData(
      criteria,
      {},
      { lean: true }
    );
    if (getRestaurantDetail.length == 0) throw STATUS_MSG.ERROR.NOT_FOUND;
    restaurantData = getRestaurantDetail[0];

    if (restaurantData.passwordResetToken != payloadData.passwordResetToken)
      throw STATUS_MSG.ERROR.INVALID_OTP;
    let dataToSet = {
      $set: {
        password: UniversalFunctions.encryptedPassword(payloadData.newPassword),
      },
      $unset: { passwordResetToken: 1, otpCode: 1 },
    };
    let updatePassWord = await Service.CustomerService.updateData(
      criteria,
      dataToSet,
      { new: true }
    );
    return {};
  } catch (err) {
    throw err;
  }
};

let addAdress = async (payloadData, UserData) => {
  //console.log("UserData",UserData);
  try {
    let dataToSet = payloadData;
    dataToSet.customerId = UserData._id;
    dataToSet.location = {
      coordinates: [payloadData.longitude, payloadData.latitude],
    };
    dataToSet.updatedAt = new Date();
    if (payloadData.addressId && payloadData.addressId != "") {
      let criteria = { _id: payloadData.addressId };
      let addressData = await Service.CustomerAddressService.updateData(
        criteria,
        dataToSet,
        { new: true }
      );
      return { addressData };
    } else {
      let addressData = await Service.CustomerAddressService.InsertData(
        dataToSet
      );
      return { addressData };
    }
  } catch (err) {
    throw err;
  }
};

let getAddress = async (payload, UserData) => {
  //console.log("UserData",UserData);
  try {
    let criteria = { customerId: UserData._id, isDeleted: false };
    let options = { skip: payload.skip, limit: payload.limit };
    let queryResult = await Promise.all([
      Service.CustomerAddressService.getData(criteria, {}, {}),
      Service.CustomerAddressService.getData(criteria, { __v: 0 }, options),
    ]);
    let totalCount = queryResult[0];
    let allData = queryResult[1];
    return {
      totalCount: totalCount.length || 0,
      addressList: allData,
    };
  } catch (err) {
    throw err;
  }
};

let getDefaultAddress = async (payload, UserData) => {
  //console.log("UserData",UserData);
  try {
    let criteria = { customerId: UserData._id, isDefault: true };
    let projection = { __v: 0 };
    let defautlAddress = await Service.CustomerAddressService.getData(
      criteria,
      projection,
      {}
    );
    return {
      defautlAddress: defautlAddress,
    };
  } catch (err) {
    throw err;
  }
};

let setDefaultAddress = async (payloadData, UserData) => {
  let criteria = { _id: payloadData.addressId };
  let criteria1 = { customerId: UserData._id, isDefault: true };
  let projection = { __v: 0 };
  try {
    let addressData = await Promise.all([
      Service.CustomerAddressService.getData(criteria, projection, {
        lean: true,
      }),
      Service.CustomerAddressService.getData(criteria1, projection, {
        lean: true,
      }),
    ]);
    let checkAddressvalid = addressData[0].length == 0;
    let updateLastDefaultAddress = addressData[1].length > 0;
    if (checkAddressvalid) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ADDRESS_ID;
    }
    let updateCriteria = { _id: addressData[0][0]._id };
    let dataToSet = {
      isDefault: payloadData.isDefault,
      updatedAt: new Date(),
    };
    let finalData;
    if (updateLastDefaultAddress) {
      let updateCriteria1 = { customerId: UserData._id };
      let dataToSet1 = { isDefault: false, updatedAt: new Date() };
      finalData = await Promise.all([
        Service.CustomerAddressService.updateMultipleDocuments(
          updateCriteria1,
          dataToSet1,
          { multi: true }
        ),
        Service.CustomerAddressService.updateData(updateCriteria, dataToSet, {
          new: true,
        }),
      ]);
      finalData = finalData[1];
    } else {
      finalData = await Service.CustomerAddressService.updateData(
        updateCriteria,
        dataToSet,
        { new: true }
      );
    }
    return { addressData: finalData };
  } catch (err) {
    throw err;
  }
};

let deleteAddress = async (payloadData, UserData) => {
  let criteria = { _id: payloadData.addressId };
  let projection = { __v: 0 };
  try {
    let addressData = await Service.CustomerAddressService.getData(
      criteria,
      projection,
      { lean: true }
    );
    let checkAddressvalid = addressData.length == 0;
    if (checkAddressvalid) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ADDRESS_ID;
    }
    if (addressData[0].isDefault == true) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.YOU_CAN_NOT_ADDRESS_DEFAULT;
    }
    let dataToSet = { isDeleted: true, updatedAt: new Date() };
    await Service.CustomerAddressService.updateData(criteria, dataToSet, {
      new: true,
    });
    return {};
  } catch (err) {
    throw err;
  }
};

let calculateCartCharges = async (payloadData, UserData) => {
  let promoCodeIsValidOrNot = true,
    finalDistance = 0,
    deliveryCharge = 0;
  let promoCodeDiscount = 0,
    totalPriceAfterDiscount = 0;
  let discountAmount = 0;
  try {
    let options = { lean: true };
    let RestaurantCriteria = { _id: payloadData.restaurantId };
    let PromoCodeData = [];

    let restaurantData = await Service.RestaurantService.getData(
      RestaurantCriteria,
      { __v: 0, password: 0, accessToken: 0, deliveryServiceArea: 0 },
      options
    );
    restaurantData = JSON.parse(JSON.stringify(restaurantData));

    let distanceResult = await Helper.OrderHelper.calculateDeliveryCharge(
      restaurantData[0].cityId,
      restaurantData[0].location,
      payloadData.customerLat,
      payloadData.customerLong
    );

    //PromoCodeData

    let restaurantGstPercentage =
      restaurantData.length > 0 &&
      "restaurantGstPercentage" in restaurantData[0]
        ? restaurantData[0].restaurantGstPercentage
        : 0;

    //Calculate Restaurnt Gst
    let restaurantCalculateGst = 0,
      totalPriceWithGst = 0;
    if (
      restaurantData.length > 0 &&
      "restaurantGstPercentage" in restaurantData[0] &&
      restaurantData[0].restaurantGstActivated
    ) {
      restaurantCalculateGst =
        (payloadData.totalPrice * restaurantData[0].restaurantGstPercentage) /
        100;
      restaurantCalculateGst = parseFloat(restaurantCalculateGst.toFixed(2));
      totalPriceWithGst = payloadData.totalPrice + restaurantCalculateGst;
    }

    if (payloadData.promoCode) {
      PromoCodeData = await Helper.OrderHelper.checkPromoCode(
        payloadData.promoCode,
        payloadData.restaurantId,
        UserData._id,
        0,
        payloadData.totalPrice,
        distanceResult.customerDeliveryCharge,
        restaurantCalculateGst
      );
      if (PromoCodeData.promoCodeIsValidOrNot) {
        promoCodeIsValidOrNot = PromoCodeData.promoCodeIsValidOrNot;
        discountAmount = PromoCodeData.dicountApplied;
      }
    }
    let finalBillAmount =
      payloadData.totalPrice +
      distanceResult.customerDeliveryCharge +
      restaurantCalculateGst -
      discountAmount;
    finalDistance = distanceResult.finalDistance;
    console.log(
      "finalBillAmount",
      finalBillAmount,
      payloadData.totalPrice,
      "\ncustomerDeliveryCharge:",
      distanceResult.customerDeliveryCharge,
      "\nrestaurantCalculateGst",
      restaurantCalculateGst,
      "\ndiscountAmount:",
      discountAmount
    );
    return {
      restaurantGstPercentage: restaurantGstPercentage,
      restaurantGstActivated: restaurantData[0].restaurantGstActivated,
      restaurantCalculateGst: restaurantCalculateGst,
      calculateGst: restaurantCalculateGst,
      finalDistance,
      finalDeliveryCharge: distanceResult.customerDeliveryCharge,
      itemPrice: payloadData.totalPrice,
      dicountApplied: discountAmount, //totalPriceAfterDiscount
      promoCodeStatus: promoCodeIsValidOrNot,
      finalBillAmount: finalBillAmount,
      customerDeliveryCharge: distanceResult.customerDeliveryCharge,
      riderDeliveryCharge: distanceResult.riderDeliveryCharge,
    };
  } catch (error) {
    throw error;
  }
};

let submitDriverRating = async (payloadData, customerData, orderData) => {
  try {
    let options = { lean: true };
    if (orderData[0].carrierRating === true) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.DRIVER_RATING_ALREADY_SUBMITED;
    }
    let dataToSet = {
      "carrierRatingByCustomer.ratingGivenAt": new Date(),
      "carrierRatingByCustomer.rating": payloadData.rating,
      "carrierRatingByCustomer.comment": payloadData.comment,
      carrierRating: true,
    };
    let criteria = { _id: payloadData.orderId };
    let getDriverCriteria = { _id: orderData[0].driverId };
    let queryResult = await Promise.all([
      Service.OrderService.updateData(criteria, dataToSet, { new: true }),
      Service.DriverService.getData(getDriverCriteria, { rating: 1 }, options),
    ]);
    let updateOrderRating = queryResult[0];
    let driverDetails = queryResult[1];
    let calculateAvarageRating =
      driverDetails[0].rating.averageRating != 0
        ? (driverDetails[0].rating.totalRating + payloadData.rating) /
          (driverDetails[0].rating.noOfTimesRated + 1)
        : payloadData.rating;
    let ratingDataToSet = {
      $inc: {
        "rating.totalRating": payloadData.rating,
        "rating.noOfTimesRated": 1,
      },
      "rating.averageRating": calculateAvarageRating.toFixed(1),
    };
    await Service.DriverService.updateData(getDriverCriteria, ratingDataToSet, {
      new: true,
    });
    return { updateOrderRating };
  } catch (err) {
    throw err;
  }
};

let submitRestaurantRating = async (payloadData, customerData, orderData) => {
  try {
    let options = { lean: true };
    if (orderData[0].restaurantRating === true) {
      throw STATUS_MSG.ERROR.RESTAURANT_RATING_ALREADY_SUBMITED;
    }
    let dataToSet = {
      "restaurantRatingByCustomer.ratingGivenAt": new Date(),
      "restaurantRatingByCustomer.rating": payloadData.rating,
      "restaurantRatingByCustomer.comment": payloadData.comment,
      restaurantRating: true,
    };
    let criteria = { _id: payloadData.orderId };
    let getRestaurantCriteria = { _id: orderData[0].restaurantId };
    let queryResult = await Promise.all([
      Service.OrderService.updateData(criteria, dataToSet, { new: true }),
      Service.RestaurantService.getData(
        getRestaurantCriteria,
        { rating: 1 },
        options
      ),
    ]);
    let updateOrderRating = queryResult[0];
    let restaurantDetails = queryResult[1];
    let calculateAvarageRating =
      restaurantDetails[0].rating.averageRating != 0
        ? (restaurantDetails[0].rating.totalRating + payloadData.rating) /
          (restaurantDetails[0].rating.noOfTimesRated + 1)
        : payloadData.rating;
    let ratingDataToSet = {
      $inc: {
        "rating.totalRating": payloadData.rating,
        "rating.noOfTimesRated": 1,
      },
      "rating.averageRating": calculateAvarageRating.toFixed(1),
    };
    await Service.RestaurantService.updateData(
      getRestaurantCriteria,
      ratingDataToSet,
      { new: true }
    );
    return { updateOrderRating };
  } catch (err) {
    throw err;
  }
};

let submitRating = async (payloadData, UserData) => {
  let options = { lean: true };
  let criteria = { _id: payloadData.orderId };
  try {
    let orderData = await Service.OrderService.getData(criteria, {}, options);
    if (orderData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
    }
    if (APP_CONSTANTS.USER_ROLES.DRIVER == payloadData.type) {
      if (orderData[0].carrierRating === true) {
        throw STATUS_MSG.ERROR.DRIVER_RATING_ALREADY_SUBMITED;
      }
      if (orderData[0].hasOwnProperty("driverId") == false) {
        throw STATUS_MSG.ERROR.INVALID_ORDER_ID;
      }
      return await submitDriverRating(payloadData, UserData, orderData);
    } else {
      //console.log("else");
      if (orderData[0].restaurantRating === true) {
        throw STATUS_MSG.ERROR.RESTAURANT_RATING_ALREADY_SUBMITED;
      }
      return await submitRestaurantRating(payloadData, UserData, orderData);
    }
  } catch (err) {
    throw err;
  }
};

let getNotificationList = async (payload, UserData) => {
  try {
    let criteria = {
      userId: UserData._id,
      userType: APP_CONSTANTS.USER_ROLES.CUSTOMER,
    };
    let options = {
      skip: payload.skip,
      limit: payload.limit,
      sort: { notificationStoreAutoIncrementId: -1 },
    };
    let queryResult = await Promise.all([
      Service.NotificationStoreService.countData(criteria),
      Service.NotificationStoreService.getData(criteria, { __v: 0 }, options),
    ]);
    let totalCount = queryResult[0] || 0;
    let allData = queryResult[1];
    return {
      totalCount: totalCount,
      allData: allData,
    };
  } catch (err) {
    throw err;
  }
};

let getPromoCode = async (payloadData, UserData) => {
  let promoCodeIds = [];
  try {
    let criteria = { customer: { $in: [UserData._id] }, isDeleted: 0 };
    if (payloadData.restaurantId) {
      criteria.restaurant = { $in: [payloadData.restaurantId] };
    }
    let project = { restaurant: 0, customer: 0, __v: 0, isDeleted: 0 };
    let options = {
      skip: payloadData.skip,
      limit: payloadData.limit,
      lean: true,
    };
    let aggProjection = { $project: { count: { $size: "$customer" } } };

    let queryResult1 = await Promise.all([
      Service.PromoCodeService.aggregateQuery([
        aggProjection,
        { $match: { count: 0 } },
      ]),
      Service.PromoCodeService.getData(criteria, project, options),
    ]);
    for (let element of queryResult1[0]) {
      promoCodeIds.push(element._id);
    }
    for (let element of queryResult1[1]) {
      promoCodeIds.push(element._id);
    }
    let criteria2 = { _id: { $in: promoCodeIds } };
    let queryResult = await Promise.all([
      Service.PromoCodeService.countData(criteria2),
      Service.PromoCodeService.getData(criteria2, project, options),
    ]);

    let totalCount = queryResult[0];
    let promoCodeList = queryResult[1];
    return {
      //customerId:  UserData._id,
      totalCount: totalCount,
      promoCodeList: promoCodeList,
    };
  } catch (err) {
    throw err;
  }
};

let addToFavourite = async (payloadData, UserData) => {
  //console.log("UserData",UserData);
  try {
    let dataToSet = {};
    let getFavouriteData;
    let userId = UserData._id;
    let criteria = {
      restaurantId: payloadData.restaurantId,
      userId: userId,
      type: payloadData.type,
    };
    let getFavData = await Service.FavouriteService.getData(
      criteria,
      {},
      { new: true }
    );
    if (getFavData.length > 0) {
      dataToSet.isFavourite = payloadData.isFavourite;
      getFavouriteData = await Service.FavouriteService.updateData(
        criteria,
        dataToSet,
        { new: true }
      );
    } else {
      dataToSet.isFavourite = payloadData.isFavourite;
      dataToSet.userId = userId;
      dataToSet.type = payloadData.type;
      dataToSet.restaurantId = payloadData.restaurantId;
      getFavouriteData = await Service.FavouriteService.InsertData(dataToSet);
    }
    return getFavouriteData;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  registration: registration,
  logout: logout,
  changePassword: changePassword,
  verifyOtp: verifyOtp,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
  updateProfile: updateProfile,
  getProfileData: getProfileData,
  addAdress: addAdress,
  getAddress: getAddress,
  setDefaultAddress: setDefaultAddress,
  getDefaultAddress: getDefaultAddress,
  calculateCartCharges: calculateCartCharges,
  uploadProfilePic: uploadProfilePic,
  deleteAddress: deleteAddress,
  submitRating: submitRating,
  getNotificationList: getNotificationList,
  getPromoCode: getPromoCode,
  addToFavourite: addToFavourite,
};
