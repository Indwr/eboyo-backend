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

const basePath="/api/v1/admin/paymentGeteway";

let addPaymentGeteway = {
  method: "POST",
  path: basePath+"/add",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPaymentGetewayController.addPaymentGeteway(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Add PaymentGeteway",
    tags: ["api", "Admin PaymentGeteway"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        gateWay:Joi.string().valid(APP_CONSTANTS.PAYMENT_GETEWAYS.PHONE_PAY, 
          APP_CONSTANTS.PAYMENT_GETEWAYS.GOOGLE_PAY,
          APP_CONSTANTS.PAYMENT_GETEWAYS.PAYTM).required(),
          secretKey:Joi.string().trim(),
          publicKey:Joi.string().trim(),
          accountNumber: Joi.string().trim(),
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

let editPaymentGeteway = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPaymentGetewayController.editPaymentGeteway(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit PaymentGeteway",
    tags: ["api", "Admin PaymentGeteway"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id:Joi.string().required().trim(),
        secretKey:Joi.string().trim().required(),
        publicKey:Joi.string().trim().required(),
        accountNumber:Joi.string().trim().required(),
        isEnabled:Joi.boolean().required(),
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

let allPaymentGeteway = {
  method: "GET",
  path: basePath+"/get",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPaymentGetewayController.allPaymentGeteway(request.query, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"All PaymentGeteway",
    tags: ["api", "Admin PaymentGeteway"],
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
  addPaymentGeteway,
  editPaymentGeteway,
  allPaymentGeteway,
];
