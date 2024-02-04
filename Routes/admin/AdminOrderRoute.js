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

let basePath="/api/v1/admin/Order";

let getAllOrders = {
  method: "POST",
  path: basePath+"/get",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminOrderController.get(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "All Orders",
    tags: ["api", "Admin Orders"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
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
let getOrderRequestList = {
  method: "GET",
  path: basePath+"/getOrderRequestList",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    console.log(request);
    return Controller.AdminOrderController.getOrderRequestList(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Get Order Request List",
    tags: ["api", "Admin Orders"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        orderId : Joi.string().required(),
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

let getOrderList = {
  method: 'GET',
  path: basePath+'/getOrderList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminOrderController.getRestaurantOrderList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
      tags: ['api', 'Admin Orders'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          type:Joi.string().valid(
            APP_CONSTANTS.USER_ROLES.CUSTOMER,APP_CONSTANTS.USER_ROLES.DRIVER,APP_CONSTANTS.USER_ROLES.RESTAURANT),
          _id: Joi.string().trim(),
          status:Joi.string().valid(APP_CONSTANTS.ORDER_STATUS.PENDING,
            APP_CONSTANTS.ORDER_STATUS.ACCEPTED,
            APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RESTAURANT,
            APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_CUSTOMER,
            APP_CONSTANTS.ORDER_STATUS.COMPLETED,
            APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER,
            APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER
          ).optional(),
          startDate:Joi.string().optional(),
          endDate:Joi.string().optional(),
          isScheduleOrder:Joi.boolean().default(false).required(),
          skip: Joi.number().integer().required(),
          limit: Joi.number().integer().required(),
        }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getDriverList = {
  method: 'GET',
  path: basePath+'/getDriverList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminOrderController.getDriverList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Admin get Driver List for Unassigned order',
      tags: ['api', 'Admin Orders'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          skip: Joi.number().integer().required(),
          limit: Joi.number().integer().required(),
          orderId: Joi.string().trim().length(24).required(),
          restaurantId: Joi.string().trim().length(24).required(),
        }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let manualAssignedOrder={
  method: 'POST',
  path: basePath+'/manualAssignedOrder',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminOrderController.manualAssignedOrder(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
      tags: ['api', 'Admin Orders'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          driverId: Joi.string().trim().length(24).required(),
          orderId: Joi.string().trim().length(24).required(),
          restaurantId: Joi.string().trim().length(24).required(),
        }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getOrderListWithPromoCode = {
  method: 'GET',
  path: basePath+'/getOrderListWithPromoCode',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.AdminOrderController.getOrderListWithPromoCode(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Order List With Promo Code',
      tags: ['api', 'Admin Orders'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          promoCodeId: Joi.string().trim().required(),
          skip: Joi.number().integer().required(),
          limit: Joi.number().integer().required(),
        }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

module.exports = [
  getAllOrders,
  getOrderRequestList,
  getOrderList,
  getDriverList,
  manualAssignedOrder,
  getOrderListWithPromoCode,
];
