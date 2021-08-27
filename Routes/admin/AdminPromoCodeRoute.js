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

let basePath="/api/v1/admin/PromoCode";

let create = {
  method: "POST",
  path: basePath+"/create",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    var payloadData = request.payload;
    return Controller.AdminPromoCodeController.create(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Create New Promo Code",
    tags: ["api", "Admin PromoCode"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: "stream",
      parse: true,
      multipart: true,
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        promoCode: Joi.string().required().trim(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        description: Joi.string().optional(),
        discountInPercentage: Joi.number().min(0).max(100).optional(),
        discountInAmount: Joi.number().optional(),
        maxOrderAmt: Joi.number().required(),
        perCustomerUsage: Joi.number().min(1).optional(),
        maxRedeemedCount: Joi.number().min(1).optional(),
        includeDeliveryCharges: Joi.boolean().required(),
        restaurant:Joi.array().items(Joi.string().optional().length(24)),
        customer:Joi.array().items(Joi.string().optional().length(24)),
        adminPercentage      : Joi.number().required(),
        restaurantPercentage : Joi.number().required(),
        document: Joi.any().meta({ swaggerType: "file" }).required().description("document file"),
      }),
      headers: Joi.object({ authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
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

let getlist = {
  method: "GET",
  path: basePath+"/getlist",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    console.log(request);
    return Controller.AdminPromoCodeController.getList(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Get All Promo Code List",
    tags: ["api", "Admin PromoCode"],
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
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};


const updateStatus = {
  method: 'PUT',
  path: basePath+"/status",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPromoCodeController.updateStatus(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Activate Deactivate  PromoCode',
    tags: ['api', 'Admin PromoCode'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        promoCodeId   : Joi.string().required(),
        isActive:Joi.boolean().required(),
      }),     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let edit = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPromoCodeController.edit(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Create New Promo Code",
    tags: ["api", "Admin PromoCode"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        promoCodeId   : Joi.string().required(),
        promoCode: Joi.string().required().trim(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        description: Joi.string().optional(),
        discountInPercentage: Joi.number().min(0).max(100).optional(),
        discountInAmount: Joi.number().optional(),
        maxOrderAmt: Joi.number().required(),
        perCustomerUsage: Joi.number().min(1).optional(),
        maxRedeemedCount: Joi.number().min(1).optional(),
        includeDeliveryCharges: Joi.boolean().required(),
        adminPercentage      : Joi.number().required(),
        restaurantPercentage : Joi.number().required(),
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

let updateImage = {
  method: "PUT",
  path: basePath+"/updateImage",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPromoCodeController.updateImage(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Create New Promo Code",
    tags: ["api", "Admin PromoCode"],
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
  create,
  getlist,
  updateStatus,
  edit,
  updateImage,
];
