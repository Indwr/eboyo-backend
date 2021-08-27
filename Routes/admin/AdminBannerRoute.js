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

const basePath="/api/v1/admin/Banner";

let addBanner = {
  method: "POST",
  path: basePath+"/add",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminBannerController.addBanner(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Add new banner type = Driver,Restaurant",
    tags: ["api", "Admin Banner"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: 'stream',
      parse: true,
      multipart:true,
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        bannerName:Joi.string().required().trim(),
        //type:Joi.string().trim(),
        type:Joi.string().valid(USER_ROLES.CUSTOMER,USER_ROLES.DRIVER,USER_ROLES.RESTAURANT),
        vendorId:Joi.array().items(Joi.number()),
        image: Joi.any().meta({swaggerType: 'file'}).required().description('banner image'),
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

let editBanner = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminBannerController.editBanner(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit Banner",
    tags: ["api", "Admin Banner"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        bannerId:Joi.string().required().trim(),
        bannerName:Joi.string().required().trim(),
        vendorId: Joi.array().items(Joi.number().required()).min(1).required(),
        isEnabled: Joi.boolean().required(),
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


let deleteBanner = {
  method: "POST",
  path: basePath+"/delete",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminBannerController.deleteBanner(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Delete Banner",
    tags: ["api", "Admin Banner"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        bannerId:Joi.string().required(),
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
let getBanner = {
  method: "GET",
  path: basePath+"/get",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminBannerController.getBanner(request.query, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"All Banner",
    tags: ["api", "Admin Banner"],
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

let updateImage = {
  method: "PUT",
  path: basePath+"/updateImage",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminBannerController.updateImage(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Update Banner Image",
    tags: ["api", "Admin Banner"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: "stream",
      parse: true,
      multipart: true,
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id   : Joi.string().required(),
        document: Joi.any().meta({ swaggerType: "file" }).required().description("document file"),
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
  addBanner,
  getBanner,
  editBanner,
  deleteBanner,
  updateImage
];
