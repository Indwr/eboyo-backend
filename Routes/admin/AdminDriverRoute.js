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

let basePath="/api/v1/admin/Driver";

let createDriver = {
  method: "POST",
  path: basePath+"/create",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminDriverController.create(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: " ",
    tags: ["api", "Admin Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        fullName: Joi.string().required().trim(),
        email: Joi.string().required().trim(),
        phoneNo: Joi.string().required().trim(),
        cityId:Joi.string().length(24).required().trim(),
      }),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let getAllDriver = {
  method: "POST",
  path: basePath+"/getAll",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    console.log('payload ' ,request.payload)
    return Controller.AdminDriverController.getAll(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "get All Driver",
    tags: ["api", "Admin Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
        IsBusy: Joi.boolean().optional(),
        Islogin: Joi.boolean().optional(),
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

let driverDetail = {
  method: "POST",
  path: basePath+"/driverDetail",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminDriverController.driverDetail(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "get All Driver",
    tags: ["api", "Admin Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        driverId: Joi.string().length(24).required(),
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
}

let createBonus = {
  method: "POST",
  path: basePath+"/createBonus",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminDriverController.createBonus(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: " ",
    tags: ["api", "Admin Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        bonusAmount: Joi.number().required(),
        minimumOrderCompleted: Joi.number().required(),
        decryption: Joi.string().optional().trim(),
        bonusType:Joi.string().valid(DRIVER_BONUS_TYPES.DAILY,
          DRIVER_BONUS_TYPES.WEEKLY,
          DRIVER_BONUS_TYPES.MONTHLY,
          DRIVER_BONUS_TYPES.YEARLY
        ),
      }),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let verifyDocument = {
  method: "PUT",
  path: basePath+"/verifyDocument",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminDriverController.verifyDocument(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null,response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:" ",
    tags: ["api", "Admin Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        driverId: Joi.string().required().trim(),
        //documentType: Joi.number().required(),
        status: Joi.boolean().required(),
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

module.exports = [
  createDriver,
  getAllDriver,
  driverDetail,
  createBonus,
  verifyDocument,
];
