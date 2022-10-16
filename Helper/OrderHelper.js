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

const APP_CONSTANTS = Config.APP_CONSTANTS;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;
const PAYMENT_TYPES = APP_CONSTANTS.PAYMENT_TYPES;
const TRANSACTION_TYPES = APP_CONSTANTS.TRANSACTION_TYPES;

const ORDER_STATUS = APP_CONSTANTS.ORDER_STATUS;
const CalcDistanceBetweenCoordinates = require("../Utils/CalcDistanceBetweenCoordinates");

let calculateAllCharge = async (
  restaurantData,
  addrDetails,
  totalPrice,
  restaurantTotalTax,
  customerId,
  promoCode = null
) => {
  try {
    let driverCommission = 0,
      finalDistance = 0,
      calculateAdminCommission = 0,
      calculateAdminGstPercentage = 0;
    let customerDeliveryCharge = 0,
      riderDeliveryCharge = 0;
    //let finalData= await calculateDistance(restaurantData,addrDetails);
    let restaurantLocation = restaurantData.location;
    let customerLatLong = addrDetails[0].location.coordinates;
    let cityId = restaurantData.cityId;

    let finalData = await calculateDeliveryCharge(
      cityId,
      restaurantLocation,
      customerLatLong[1],
      customerLatLong[0]
    );

    console.log("======finalData======", finalData);

    //driverCommission = parseFloat((finalData.driverCommission.toFixed(2))) ;
    customerDeliveryCharge = finalData.customerDeliveryCharge;
    riderDeliveryCharge = finalData.riderDeliveryCharge;
    finalDistance = parseFloat(finalData.finalDistance);
    let superAdminCharges = restaurantData.adminCommssion || 0;

    //including Tax
    console.log(
      "totalPrice",
      totalPrice,
      restaurantTotalTax,
      customerDeliveryCharge
    );
    let itemTotalPrice =
      totalPrice - restaurantTotalTax - customerDeliveryCharge;
    console.log(
      "itemTotalPrice",
      itemTotalPrice,
      restaurantTotalTax,
      customerDeliveryCharge
    );
    if (restaurantData.adminCommssionType == ADMIN_COMMISSION_TYPES.FIXED) {
      restaurantCommission = itemTotalPrice - superAdminCharges;
      calculateAdminCommission = itemTotalPrice - restaurantCommission;
    } else {
      calculateAdminCommission = (itemTotalPrice * superAdminCharges) / 100;
      restaurantCommission = itemTotalPrice - calculateAdminCommission;
    }

    if (calculateAdminCommission > 0) {
      calculateAdminGstPercentage =
        (calculateAdminCommission * restaurantData.adminGstPercentage) / 100;
      calculateAdminGstPercentage = parseFloat(
        calculateAdminGstPercentage.toFixed(2)
      );
    }
    let promoCodeId = null;
    if (promoCode !== null) {
      let promoCodeData = await checkPromoCode(
        promoCode,
        restaurantData._id,
        customerId,
        totalPrice
      );
      if (promoCodeData.length == 0) {
        throw STATUS_MSG.ERROR.INVALID_PROMO_CODE;
      }
      promoCodeId = promoCodeData.promoCodeId;
    }

    let tempConsole = {
      itemTotalPrice,
      customerDeliveryCharge,
      riderDeliveryCharge,
      driverCommission: riderDeliveryCharge,
      finalDistance,
      calculateAdminCommission,
      restaurantCommission,
      calculateAdminGstPercentage,
      promoCodeId,
    }; //console.log("tempConsole",tempConsole);
    return {
      itemTotalPrice,
      customerDeliveryCharge,
      riderDeliveryCharge,
      driverCommission: riderDeliveryCharge,
      finalDistance,
      calculateAdminCommission,
      restaurantCommission,
      calculateAdminGstPercentage,
      promoCodeId,
    };
  } catch (error) {
    throw error;
  }
};

let calculateDistance = async (restaurantData, addrDetails) => {
  try {
    let driverCommission = 0,
      finalDistance = 0;
    let cityCriteria = { _id: restaurantData.cityId };

    let cityData = await Service.CityService.getData(
      cityCriteria,
      { __v: 0, password: 0, accessToken: 0, deliveryServiceArea: 0 },
      { lean: true }
    );

    if (cityData.length > 0) {
      let restaurantLocation = restaurantData.location.coordinates;
      let addressLocation = addrDetails[0].location.coordinates;
      finalDistance = await CalcDistanceBetweenCoordinates.calculateDistance(
        restaurantLocation[1],
        restaurantLocation[0],
        addressLocation[1],
        addressLocation[0]
      );
    }

    if (cityData.length > 0 && finalDistance > 0) {
      let minimumPrice = cityData[0].deliveryCharge.minimumPrice;
      let pricePerkm = cityData[0].pricePerkm;
      let minimumDistance = cityData[0].deliveryCharge.minimumDistance;

      if (cityData[0].deliveryCharge.minimumDistance > finalDistance) {
        driverCommission = cityData[0].deliveryCharge.minimumPrice;
      } else {
        driverCommission =
          minimumPrice + (finalDistance - minimumDistance) * pricePerkm;
      }
    }
    return {
      driverCommission: driverCommission,
      finalDistance: finalDistance,
    };
  } catch (error) {
    throw error;
  }
};

let checkPromoCode = async (
  promoCode,
  restaurantId,
  customerId,
  totalPrice,
  itemTotalPrice,
  customerDeliveryCharge = 0,
  totalTax = 0
) => {
  let finalDiscountAmount = 0;
  let itemPrice = itemTotalPrice;
  console.log(
    "\n\ntotalPrice:",
    totalPrice,
    "\nitemPrice:",
    itemPrice,
    "\ncustomerDeliveryCharge:",
    customerDeliveryCharge,
    "\ntotalTax:",
    totalTax,
    "\nitemPrice:",
    itemPrice,
    "\n\n\n"
  );

  let adminPartPercentage = 0,
    restaurantPartPercentage = 0;
  let finalAdminPartAmt = 0,
    finalRestaurantPartAmt = 0;
  let promoCodeIsValidOrNot = false;
  try {
    let promoCodeRestaurantList = [],
      promoCodeCustomerList = [];
    let options = { lean: true };
    let criteria = { promoCode: promoCode };
    let promoCodeData = await Service.PromoCodeService.getData(
      criteria,
      {},
      options
    );

    promoCodeIsValidOrNot = promoCodeData.length > 0 ? true : false;

    if (promoCodeData.length > 0 && promoCodeData[0].restaurant.length > 0) {
      promoCodeData[0].restaurant.forEach((element) => {
        promoCodeRestaurantList.push(element.toString());
      });
      if (promoCodeRestaurantList.indexOf(restaurantId.toString()) < 0) {
        promoCodeIsValidOrNot = false;
      }
    }
    if (promoCodeData.length > 0 && promoCodeData[0].customer.length > 0) {
      promoCodeData[0].customer.forEach((element) => {
        promoCodeCustomerList.push(element.toString());
      });
      if (promoCodeCustomerList.indexOf(customerId.toString()) < 0) {
        promoCodeIsValidOrNot = false;
      }
    } //console.log("promoCodeData",promoCodeData);

    if (promoCodeIsValidOrNot) {
      itemPrice =
        promoCodeData[0].includeDeliveryCharges == true
          ? itemPrice + customerDeliveryCharge
          : itemPrice;
      let maxDiscountAmt = promoCodeData[0].maxDiscountAmt;
      if (promoCodeData[0].discountInPercentage != 0) {
        finalDiscountAmount =
          (itemPrice * promoCodeData[0].discountInPercentage) / 100;
        console.log("finalDiscountAmount===161", finalDiscountAmount);
        finalDiscountAmount = parseFloat(finalDiscountAmount.toFixed(2));
        finalDiscountAmount =
          finalDiscountAmount > maxDiscountAmt
            ? maxDiscountAmt
            : finalDiscountAmount;
      } else {
        finalDiscountAmount = promoCodeData[0].discountInAmount;
        finalDiscountAmount = parseFloat(finalDiscountAmount.toFixed(2));
      }
      adminPartPercentage = promoCodeData[0].adminPercentage;
      restaurantPartPercentage = promoCodeData[0].restaurantPercentage;

      //Promocode Amount Part of Admin
      finalAdminPartAmt = (finalDiscountAmount * adminPartPercentage) / 100;
      finalAdminPartAmt = parseFloat(finalAdminPartAmt.toFixed(2));

      //Promocode Amount Part of Restaurant
      finalRestaurantPartAmt =
        (finalDiscountAmount * restaurantPartPercentage) / 100;
      finalRestaurantPartAmt = parseFloat(finalRestaurantPartAmt.toFixed(2));
    } //console.log("finalRestaurantPartAmt",finalRestaurantPartAmt,finalAdminPartAmt);
    //finalData.dicountApplied = finalDiscountAmount;
    return {
      promoCodeIsValidOrNot,
      itemTotalPrice: itemTotalPrice,
      dicountApplied: finalDiscountAmount,
      finalRestaurantPartAmt,
      finalAdminPartAmt,
      promoCodeId: promoCodeData.length > 0 ? promoCodeData[0]._id : null,
    };
  } catch (error) {
    throw error;
  }
};

let calculateDeliveryCharge = async (
  cityId,
  restaurantLocation,
  customerLat,
  customerLong
) => {
  try {
    let finalDistance;
    let cityCriteria = { _id: cityId };
    let cityData = await Service.CityService.getData(
      cityCriteria,
      { __v: 0, password: 0, accessToken: 0, deliveryServiceArea: 0 },
      { lean: true }
    );
    //console.log("cityData",cityData);
    let restaurantCoordinates = restaurantLocation.coordinates;
    if (cityData.length > 0) {
      finalDistance = await CalcDistanceBetweenCoordinates.calculateDistance(
        restaurantCoordinates[1],
        restaurantCoordinates[0],
        customerLat,
        customerLong
      );
    } //console.log("finalDistance",finalDistance);
    let deliveryCharge = 0;
    let customerDeliveryCharge = 0,
      riderDeliveryCharge = 0;
    finalDistance = parseFloat(finalDistance);
    if (cityData.length > 0) {
      let customerMinimumDistance =
        cityData[0].customerDeliveryCharge.minimumDistance;
      let customerPricePerkm = cityData[0].customerDeliveryCharge.pricePerkm;
      let customerMinimumPrice =
        cityData[0].customerDeliveryCharge.minimumPrice;

      if (finalDistance > customerMinimumDistance) {
        customerDeliveryCharge =
          customerMinimumPrice +
          (finalDistance - customerMinimumDistance) * customerPricePerkm;
      } else {
        customerDeliveryCharge = customerMinimumPrice;
      }
      customerDeliveryCharge = parseFloat(customerDeliveryCharge.toFixed(2));

      let riderMinimumDistance =
        cityData[0].riderDeliveryCharge.minimumDistance;
      let riderPricePerkm = cityData[0].riderDeliveryCharge.pricePerkm;
      let riderMinimumPrice = cityData[0].riderDeliveryCharge.minimumPrice;

      if (finalDistance > riderMinimumDistance) {
        riderDeliveryCharge =
          riderMinimumPrice +
          (finalDistance - riderMinimumDistance) * riderPricePerkm;
      } else {
        riderDeliveryCharge = riderMinimumPrice;
      }
      riderDeliveryCharge = parseFloat(riderDeliveryCharge.toFixed(2));
    }

    return {
      finalDistance,
      cityData,
      riderDeliveryCharge,
      customerDeliveryCharge,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  calculateAllCharge: calculateAllCharge,
  calculateDeliveryCharge: calculateDeliveryCharge,
  checkPromoCode: checkPromoCode,
};
