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

let basePath="/api/v1/admin/faq";

let create = {
  method: "POST",
  path: basePath+"/create",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminFaqController.create(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Enter user types \n userType (Customer,Driver,Restaurant)",
    tags: ["api", "Admin Faq"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        userType:Joi.string().required().trim(),
        question: Joi.string().required().trim(),
        answer: Joi.string().required().trim(),
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

let edit = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminFaqController.edit(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit Faq",
    tags: ["api", "Admin Faq"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        faqId:Joi.string().required(),
        userType:Joi.string().required().trim(),
        question: Joi.string().required().trim(),
        answer: Joi.string().required().trim(),
        isEnabled: Joi.boolean().required(),
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

let deletefaq = {
  method: "DELETE",
  path: basePath+"/delete",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminFaqController.deleteFaq(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Delete Faq",
    tags: ["api", "Admin Faq"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        faqId:Joi.string().required(),
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
  create,
  edit,
  deletefaq,
];
