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
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);

const checkAccessToken = TokenManagerAdmin.getTokenFromDBForAdmin;

let basePath="/api/v1/admin/Polygon";

let addDeliveryServiceArea = {
  method: 'POST',
  path: basePath+'/addDeliveryServiceArea',
  config: {
    description: "addDelivery ServiceArea || geofencing",
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    handler: function (request, reply) {
      var UserData = request.pre.verify || {};  
      return Controller.AdminPolygonController.addDeliveryServiceArea(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
      });
    },
    validate: {
      headers: UniversalFunctions.authorizationHeaderObj,
      payload: Joi.object({
        locationName: Joi.string().lowercase().required(),
        coordinates: Joi.array().items(Joi.array().items(Joi.number().required()).required()).min(4).required(),
        cityId : Joi.string().required(),
      }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let editDeliveryServiceArea = {
  method: "PUT",
  path: basePath+"/edit",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminPolygonController.editDeliveryServiceArea(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Edit Delivery ServiceArea || geofencing",
    tags: ["api", "Admin Polygon"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id : Joi.string().required(),
        locationName: Joi.string().lowercase().required(),
        coordinates: Joi.array().items(Joi.array().items(Joi.number().required()).required()).min(4).required(),
        cityId : Joi.string().required(),
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

let mapRestaurant= {
  method: 'POST',
  path: basePath+'/mapRestaurant',
  config: {
    description: "addDelivery ServiceArea || geofencing",
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    handler: function (request, reply) {
      var UserData = request.pre.verify || {};  
      return Controller.AdminPolygonController.mapRestaurant(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
      });
    },
    validate: {
      headers: UniversalFunctions.authorizationHeaderObj,
      payload: Joi.object({
        restaurantId : Joi.string().required(),
        locationId: Joi.string().required(),
      }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getLocationlist = {
  method: 'GET',
  path: basePath+'/getlist',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.AdminPolygonController.getLocationlist(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'menuList',
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
        search: Joi.string().trim(),
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

let getLocationRestaurant = {
  method: 'GET',
  path: basePath+'/getRestaurant',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.AdminPolygonController.getLocationRestaurant(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'menuList',
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
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

let removedRestaurant= {
  method: 'PUT',
  path: basePath+'/removedRestaurant',
  config: {
    description: "addDelivery ServiceArea || geofencing",
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    handler: function (request, reply) {
      var UserData = request.pre.verify || {};  
      return Controller.AdminPolygonController.removedRestaurant(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
      });
    },
    validate: {
      headers: UniversalFunctions.authorizationHeaderObj,
      payload: Joi.object({
        restaurantId : Joi.string().required(),
        locationId: Joi.string().required(),
      }),
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let getLocationDetails = {
  method: 'GET',
  path: basePath+'/getLocationDetails',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.AdminPolygonController.getLocationDetails(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'menuList',
    tags: ['api', 'Admin Polygon'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        locationId: Joi.string().required(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
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

module.exports = [
  addDeliveryServiceArea,
  mapRestaurant,
  getLocationlist,
  getLocationRestaurant,
  removedRestaurant,
  getLocationDetails,
  editDeliveryServiceArea,
]