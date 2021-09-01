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

let basePath="/api/v1/admin/Menu";

let create = {
    method: 'POST',
    path: basePath+'/create',
    handler: function (request, reply) {
      var payloadData = request.payload;
      let UserData = request.pre.verify || {}; 
      return Controller.AdminMenuController.addMenu(payloadData,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
          return UniversalFunctions.sendError(error) ;  
      });
    },
    config: {
      description: 'addMenu',
      tags: ['api', 'Admin Menu'],
      payload: {
        maxBytes: 1000 * 1000 * 20, // 20 Mb
        output: 'stream',
        parse: true,
        multipart:true,
        //allow: 'multipart/form-data'
      },
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          menuName            : Joi.string().required(),
          availabilityStatus  : Joi.boolean().required(),
          menuId              : Joi.string().optional(), 
          menuImage           : Joi.any().meta({swaggerType: 'file'}).optional().description('picture of item'),            
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

const menuList = {
    method: 'GET',
    path: basePath+'/get',
    handler: function (request, reply) {
      var payloadData = request.query;
      let UserData = request.pre.verify || {}; 
      return Controller.AdminMenuController.getMenuList(payloadData,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
          return UniversalFunctions.sendError(error) ;  
      });
    },
    config: {
      description: 'menuList',
      tags: ['api', 'Admin Menu'],
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


const deleteMenu = {
    method: 'DELETE',
    path: basePath+'/delete',
    handler: function (request, reply) {
      let UserData = request.pre.verify || {};
      return Controller.AdminMenuController.deleteMenu(request.query,UserData).then(response =>{
          return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {    
          return UniversalFunctions.sendError(error) ;  
      });
    },
    config: {
      description: 'get Restaurant',
      tags: ['api', 'Admin Menu'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          menuId       : Joi.string().required(),
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

  let updateImage = {
    method: "PUT",
    path: basePath+"/updateImage",
    handler: function (request, reply) {
      let UserData = request.pre.verify || {};
      return Controller.AdminMenuController.updateImage(request.payload,UserData).then((response) => {
        return UniversalFunctions.successResponse(null, response);
      }).catch((error) => {
        return UniversalFunctions.sendError(error);
      });
    },
    config: {
      description: "Update Menu Image",
      tags: ["api", "Admin Menu"],
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
    menuList,
    deleteMenu,
    updateImage
]