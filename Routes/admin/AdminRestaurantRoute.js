const BaseJoi = require("joi");
const Joi = BaseJoi;
const UniversalFunctions = require("../../Utils/UniversalFunctions");
const TokenManagerAdmin = require("../../Utils/TokenManagerAdmin");
const Controller = require("../../Controllers");
const CONFIG = require("../../Config");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;
const DRIVER_BONUS_TYPES = APP_CONSTANTS.DRIVER_BONUS_TYPES
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const RESTAURANT_FOOD_TYPE = APP_CONSTANTS.RESTAURANT_FOOD_TYPE
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);

const checkAccessToken = TokenManagerAdmin.getTokenFromDBForAdmin;

let basePath="/api/v1/admin/Restaurant";

let createRestaurant = {
  method: "POST",
  path: basePath+"/create",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminRestaurantController.create(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"create Restaurant ",
    tags: ["api", "Admin Restaurant"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: "stream",
      parse: true,
      multipart: true,
      //allow: 'multipart/form-data'
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: { //.valid
      payload: Joi.object({
        restaurantName: Joi.string().required().trim(),
        parentId: Joi.string().trim(),
        email: Joi.string().required().trim(),
        contactNumber: Joi.string().required().trim(),
        //city: Joi.string().required().trim(),
        cityId: Joi.string().length(24).required().trim(),
        state: Joi.string().required().trim(),
        country: Joi.string().required().trim(),
        vendorFullAddress: Joi.string().required().trim(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        
        averageProcessingTime: Joi.string().required(),
        restaurantFoodType: Joi.string().valid(RESTAURANT_FOOD_TYPE.All,RESTAURANT_FOOD_TYPE.PURE_VEG,
          RESTAURANT_FOOD_TYPE.NON_VEG,RESTAURANT_FOOD_TYPE.NOT_APPLICABLE).required(),
        
        costForTwoPerson: Joi.number().required(),
        minimumOrderAmount: Joi.number().required(),
        businessLicenceNumber: Joi.string().required(),
        //password: Joi.string().required(),
        category:  Joi.array().items().min(1).required(),
        logo: Joi.any()
          .meta({ swaggerType: "file" })
          .required()
          .description("document file"),
        //gstPercentage: Joi.number().required(),
        restaurantGstPercentage:Joi.number().required(),
        restaurantGstActivated: Joi.boolean().required(),

        adminCommssionType: Joi.string().valid(ADMIN_COMMISSION_TYPES.FIXED,
          ADMIN_COMMISSION_TYPES.PERCENTAGE).required(),
        adminCommssion: Joi.number().required(),
        adminGstPercentage: Joi.number().required(),
      }),

      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let editRestaurant = {
  method: "PUT",
  path: basePath+"/editRestaurant",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminRestaurantController.editRestaurant(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"create Restaurant ",
    tags: ["api", "Admin Restaurant"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: { //.valid
      payload: Joi.object({
        restaurantId: Joi.string().length(24).required().trim(),
        restaurantName: Joi.string().required().trim(),
        parentId: Joi.string().trim(),
        email: Joi.string().required().trim(),
        contactNumber: Joi.string().required().trim(),
        cityId: Joi.string().length(24).required().trim(),
        state: Joi.string().required().trim(),
        country: Joi.string().required().trim(),
        vendorFullAddress: Joi.string().required().trim(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        averageProcessingTime: Joi.string().required(),
        restaurantFoodType: Joi.string().valid(RESTAURANT_FOOD_TYPE.All,RESTAURANT_FOOD_TYPE.PURE_VEG,
          RESTAURANT_FOOD_TYPE.NON_VEG,RESTAURANT_FOOD_TYPE.NOT_APPLICABLE).required(),
        
        costForTwoPerson: Joi.number().required(),
        minimumOrderAmount: Joi.number().required(),
        businessLicenceNumber: Joi.string().required(),
        //password: Joi.string().required(),
        category:  Joi.array().items().min(1).required(),
        
        //gstPercentage: Joi.number().required(),
        restaurantGstPercentage:Joi.number().required(),
        restaurantGstActivated: Joi.boolean().required(),
        adminCommssionType: Joi.string().valid(ADMIN_COMMISSION_TYPES.FIXED,
          ADMIN_COMMISSION_TYPES.PERCENTAGE).required(),
        adminCommssion: Joi.number().required(),
        adminGstPercentage: Joi.number().required(),
      }),
      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let getAllRestaurant = {
  method: "POST",
  path: basePath+"/getAll",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminRestaurantController.getAll(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: " ",
    tags: ["api", "Admin Restaurant"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
        search: Joi.string().trim(),
        cityId: Joi.string().trim(),
      }),
      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let restaurantDetail = {
  method: "POST",
  path: basePath+"/restaurantDetail",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminRestaurantController.restaurantDetail(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "getRestaurant",
    tags: ["api", "Admin Restaurant"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        restaurantId: Joi.string().required(),
      }),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let updatelogo = {
  method: "PUT",
  path: basePath+"/updatelogo",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminRestaurantController.updatelogo(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"create Restaurant ",
    tags: ["api", "Admin Restaurant"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: "stream",
      parse: true,
      multipart: true,
      //allow: 'multipart/form-data'
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: { //.valid
      payload: Joi.object({
        restaurantId: Joi.string().length(24).required().trim(),
        logo: Joi.any().meta({ swaggerType: "file" }).required().description("document file"),
      }),
      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

module.exports = [
  createRestaurant,
  getAllRestaurant,
  restaurantDetail,
  editRestaurant,
  updatelogo,
];
