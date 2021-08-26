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

const basePath="/api/v1/admin/Setting";

let addSetting = {
  method: "POST",
  path: basePath+"/add",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminSettingController.addSetting(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Add new Setting",
    tags: ["api", "Admin Setting"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        type:Joi.string().valid(
          APP_CONSTANTS.SETTINGS_TYPE.BUSSINESS_AVAILABILITY,
          APP_CONSTANTS.SETTINGS_TYPE.BUSSINESS_HOURS,
          APP_CONSTANTS.SETTINGS_TYPE.SERVER_KEYS,
          APP_CONSTANTS.SETTINGS_TYPE.DELIVERY_PERSONS,
          APP_CONSTANTS.SETTINGS_TYPE.APP_VERSIONS,
          APP_CONSTANTS.SETTINGS_TYPE.SMS_KEYS,
          APP_CONSTANTS.SETTINGS_TYPE.PANEL_THEMES,
          ).required(),
        value:Joi.string().required(),
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

let editSetting = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminSettingController.editSetting(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit Setting",
    tags: ["api", "Admin Setting"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id:Joi.string().required().trim(),
        value: Joi.string().required(),
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


let deleteSetting = {
  method: "POST",
  path: basePath+"/delete",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminSettingController.deleteSetting(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Delete Setting",
    tags: ["api", "Admin Setting"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id:Joi.string().required(),
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
let getSetting = {
  method: "GET",
  path: basePath+"/get",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminSettingController.getSetting(request.query, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"All Setting",
    tags: ["api", "Admin Setting"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      // query: Joi.object({
      //   skip : Joi.number().integer().required(),
      //   limit : Joi.number().integer().required(),
      // }), 
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
  addSetting,
  getSetting,
  editSetting,
  deleteSetting
];
