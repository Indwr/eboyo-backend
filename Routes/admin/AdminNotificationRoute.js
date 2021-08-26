const BaseJoi = require("joi");
const Joi = BaseJoi;
const UniversalFunctions = require("../../Utils/UniversalFunctions");
const TokenManagerAdmin = require("../../Utils/TokenManagerAdmin");
const Controller = require("../../Controllers");
const CONFIG = require("../../Config");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;
const USER_ROLES = APP_CONSTANTS.USER_ROLES;

const DRIVER_BONUS_TYPES = APP_CONSTANTS.DRIVER_BONUS_TYPES
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);

const checkAccessToken = TokenManagerAdmin.getTokenFromDBForAdmin;

const basePath="/api/v1/admin/Notification";

let addNotification = {
  method: "POST",
  path: basePath+"/add",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminNotificationController.addNotification(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Add Notification text",
    tags: ["api", "Admin Notification"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        event:Joi.string().valid(APP_CONSTANTS.ORDER_STATUS.ACCEPTED, 
          APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RESTAURANT,
          APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_CUSTOMER,    
          APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RIDER,
          APP_CONSTANTS.ORDER_STATUS.COOKED,
          APP_CONSTANTS.ORDER_STATUS.COMPLETED,
          APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER,
          APP_CONSTANTS.ORDER_STATUS.PENDING,
          APP_CONSTANTS.ORDER_STATUS.PREPARING,
          APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER,
          APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION,
          APP_CONSTANTS.ORDER_STATUS.REJECTED_BY_DRIVER,
          APP_CONSTANTS.ORDER_STATUS.ACCEPTED_BY_DRIVER,
          APP_CONSTANTS.ORDER_STATUS.DRIVER_REQUEST_SEND),
          event_message:Joi.string().trim().required(),
          event_secondary_message:Joi.string().trim().required(),
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

let editNotification = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminNotificationController.editNotification(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit Notification Text",
    tags: ["api", "Admin Notification"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id:Joi.string().required().trim(),
        event_message:Joi.string().trim().required(),
        event_secondary_message:Joi.string().trim().required(),
      }),
      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let getNotification = {
  method: "GET",
  path: basePath+"/get",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminNotificationController.allNotification(request.query, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"All Notification",
    tags: ["api", "Admin Notification"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
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
  addNotification,
  editNotification,
  getNotification,
];
