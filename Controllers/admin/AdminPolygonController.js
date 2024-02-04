/**
 * Created by Indersein on 15/04/19.
 */
const Path = require("path");
const _ = require("underscore");
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
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

let addDeliveryServiceArea = async (payloadData, UserData) => {
  let servingLocation;
  let criteria = {
    location: {
      $geoIntersects: {
        $geometry: { type: "Polygon", coordinates: [payloadData.coordinates] },
      },
    },
  };
  try {
    let dataToSet = {
      locationName: payloadData.locationName,
      cityId: payloadData.cityId,
      deliveryServiceArea: {
        type: "Polygon", //LineString //Polygon
        coordinates: [payloadData.coordinates],
      },
    };
    //servingLocation  = await Service.RestaurantAreaService.updateMultipleDocuments({_id:UserData._id},dataToSet,{new:true,lean:true});
    servingLocation = await Service.RestaurantAreaService.InsertData(dataToSet);
    return { servingLocation };
  } catch (err) {
    throw err;
  }
};

let editDeliveryServiceArea = async (payloadData, UserData) => {
  let servingLocation;
  try {
    let isValid = Mongoose.Types.ObjectId.isValid(payloadData._id); //true
    if (isValid === false) {
      throw STATUS_MSG.ERROR.INVALID_RESTAURANT_SERVICE_AREA_ID;
    }
    let criteria = { _id: payloadData._id };
    let restaurantServiceAreaData = await Service.RestaurantAreaService.getData(
      criteria,
      {},
      { lean: true }
    );
    if (restaurantServiceAreaData.length == 0) {
      throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_RESTAURANT_SERVICE_AREA_ID;
    }
    let dataToSet = {
      locationName: payloadData.locationName,
      cityId: payloadData.cityId,
      deliveryServiceArea: {
        type: "Polygon", //LineString //Polygon
        coordinates: [payloadData.coordinates],
      },
    };
    servingLocation = await Service.RestaurantAreaService.updateData(
      criteria,
      dataToSet,
      { lean: true }
    );
    return { servingLocation };
  } catch (err) {
    throw err;
  }
};

let mapRestaurant = async (payloadData, UserData) => {
  try {
    let result = await Promise.all([
      Service.RestaurantAreaService.getData(
        { restaurant: { $in: [payloadData.restaurantId] } },
        {},
        {}
      ),
      Service.RestaurantAreaService.getData(
        { _id: payloadData.locationId },
        {},
        {}
      ),
    ]);
    let locationData = result[1];
    let existInPolygun = result[0];

    if (locationData.length == 0) {
      throw STATUS_MSG.ERROR.INVALID_LOCATION_ID;
    }
    if (
      existInPolygun.length > 0 &&
      payloadData.locationId != existInPolygun[0]._id
    ) {
      throw STATUS_MSG.ERROR.RESTAURANT_ALREADY_MAPED_OTHER_POLYGON;
    }
    let dataToSet = {
      $addToSet: { restaurant: payloadData.restaurantId },
    };
    servingLocation =
      await Service.RestaurantAreaService.updateMultipleDocuments(
        { _id: payloadData.locationId },
        dataToSet,
        { new: true, lean: true }
      );
    return {};
  } catch (err) {
    throw err;
  }
};

const getLocationlist = async (payloadData, UserData) => {
  try {
    let criteria;
    if (payloadData.search) {
      //criteria = { $text: { $search: payloadData.search } }
      //  criteria = {locationName:payloadData.search};
      criteria = { locationName: { $regex: payloadData.search } };
    } else {
      criteria = {};
    }
    let lookup = {
      $lookup: {
        from: "restaurants",
        localField: "restaurant",
        foreignField: "_id",
        as: "result",
      },
    };
    let project = { restaurant: 0, __v: 0 };
    let options = { skip: payloadData.skip, limit: payloadData.limit };

    let queryResult = await Promise.all([
      Service.RestaurantAreaService.countData(criteria),
      Service.RestaurantAreaService.getData(criteria, project, options),
    ]);
    let totalCount = queryResult[0]; //(queryResult[0].length>0) ? queryResult[0][0].totalDocument:0;
    let locationlist = queryResult[1];
    return { totalCount, locationlist };
  } catch (err) {
    throw err;
  }
};

const getLocationDetails = async (payloadData, UserData) => {
  try {
    let match = {
      $match: { _id: Mongoose.Types.ObjectId(payloadData.locationId) },
    };
    let criteria = { _id: payloadData.locationId };
    let lookup = {
      $lookup: {
        from: "restaurants",
        localField: "restaurant",
        foreignField: "_id",
        as: "result",
      },
    };
    let projection = {
        $project: {
          //restaurant:1,
          //adminServiceAreaAutoIncrementId:1,
          "result._id": 1,
          "result.logo": 1,
          "result.email": 1,
          "result.restaurantName": 1,
          "result.restaurantName": 1,
          "result.vendorFullAddress": 1,
          "result.restaurantAutoIncrementId": 1,
        },
      },
      unwind = { $unwind: "$result" };
    let skip = { $skip: payloadData.skip || 0 };
    let limit = { $limit: payloadData.limit || 10 };
    let count = { $count: "totalDocument" };
    let options = {};

    let queryResult = await Promise.all([
      Service.RestaurantAreaService.aggregateQuery([
        match,
        lookup,
        projection,
        unwind,
        count,
      ]),
      Service.RestaurantAreaService.aggregateQuery([
        match,
        lookup,
        projection,
        unwind,
        { $sort: { "esult.restaurantName": 1 } },
        skip,
        limit,
      ]),
      Service.RestaurantAreaService.getData(
        criteria,
        { restaurant: 0, __v: 0 },
        options
      ),
    ]);

    let totalCount =
      queryResult[0].length > 0 ? queryResult[0][0].totalDocument : 0;
    let locationRestaurantlist = queryResult[1];
    let locationDetails = queryResult[2].length > 0 ? queryResult[2][0] : {};
    return {
      totalCount,
      locationDetails,
      restaurantlist: locationRestaurantlist,
    };
  } catch (err) {
    throw err;
  }
};

let removedRestaurant = async (payloadData, UserData) => {
  try {
    let dataToSet = {
      $pull: { restaurant: payloadData.restaurantId },
    };
    servingLocation =
      await Service.RestaurantAreaService.updateMultipleDocuments(
        { _id: payloadData.locationId },
        dataToSet,
        { new: true, lean: true }
      );
    return {};
  } catch (err) {
    throw err;
  }
};

const getLocationRestaurant = async (payloadData, UserData) => {
  try {
    let lookup = {
      $lookup: {
        from: "restaurants",
        localField: "restaurant",
        foreignField: "_id",
        as: "result",
      },
    };
    let project = {
        $project: {
          restaurant: 1,
          adminServiceAreaAutoIncrementId: 1,
          "result._id": 1,
          "result.logo": 1,
          "result.restaurantName": 1,
        },
      },
      unwind = { $unwind: "$result" };
    let skip = { $skip: payloadData.skip };
    let limit = { $limit: payloadData.limit };
    let count = { $count: "totalDocument" };
    let queryResult = await Promise.all([
      Service.RestaurantAreaService.aggregateQuery([
        lookup,
        project,
        unwind,
        count,
      ]),
      Service.RestaurantAreaService.aggregateQuery([
        lookup,
        project,
        unwind,
        { $sort: { "esult.restaurantName": 1 } },
        skip,
        limit,
      ]),
    ]);
    let totalCount =
      queryResult[0].length > 0 ? queryResult[0][0].totalDocument : 0;
    let locationRestaurantlist = queryResult[1];
    return { totalCount, locationRestaurantlist };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  addDeliveryServiceArea: addDeliveryServiceArea,
  mapRestaurant: mapRestaurant,
  getLocationlist: getLocationlist,
  removedRestaurant: removedRestaurant,
  getLocationRestaurant: getLocationRestaurant,
  getLocationDetails: getLocationDetails,
  editDeliveryServiceArea: editDeliveryServiceArea,
};
