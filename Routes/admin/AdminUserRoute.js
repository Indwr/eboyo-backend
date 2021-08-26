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
const USER_ROLES = APP_CONSTANTS.USER_ROLES;


const checkAccessToken = TokenManagerAdmin.getTokenFromDBForAdmin;
const basePath="/api/v1/admin/user";


let login = {
  method: "POST",
  path: basePath+"/login",
  handler: function (request, reply) {
    var payloadData = request.payload;
    let ip = request.info.remoteAddress
    payloadData.ip = ip;
    return Controller.AdminUserController.login(payloadData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Login Via Email & Password For  Admin",
    tags: ["api", "Admin User"],
    validate: {
      payload: Joi.object({
        email: Joi.string().required().trim(),
        password: Joi.string().required().min(5).trim(),
        userAgent:  Joi.object({
          platform   : Joi.string().required().trim(),
          browser   : Joi.string().required().trim(),
          location : Joi.string().required().trim(),
        }).required(),
      }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let logout = {
  method: "POST",
  path: basePath+"/logout",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    var payloadData = request.payload
    let ip = request.info.remoteAddress
    payloadData.ip = ip;
    return Controller.AdminUserController.logout(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Logout Admin",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        userAgent:  Joi.object({
          platform   : Joi.string().required().trim(),
          browser   : Joi.string().required().trim(),
        }).required(),
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

let dashboard = {
  method: "GET",
  path: basePath+"/dashboard",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.dashboard(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Dashboard APi",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
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

let getDashboardData = {
  method: "GET",
  path: basePath+"/getDashboardData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.getDashboardData(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Admin Home API",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({}),
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
  method: "GET",
  path: basePath+"/driverDetail",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.driverDetail(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "get All Driver",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        driverId: Joi.string().required().trim(),
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

let getInvoiceData = {
  method: "GET",
  path: basePath+"/getInvoiceData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.getInvoiceData(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "get All Driver",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        type:Joi.string().valid(USER_ROLES.CUSTOMER,USER_ROLES.DRIVER,USER_ROLES.RESTAURANT),
        _id: Joi.string().trim(),
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

let getOrderDataPdfLink = {
  method: "GET",
  path: basePath+"/getOrderDataPdfLink",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.getOrderDataPdfLink(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "get Order data Pdf Link",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        startDate : Joi.date().required(),
        endDate : Joi.date().required(),
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

let sendPushNotification = {
  method: "POST",
  path: basePath+"/sendPushNotification",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminUserController.sendPushNotification(payloadData, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Send Push notification",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        // sendTo: Joi.string().required().trim(),
        title: Joi.string().required().trim(),
        fileUrl:Joi.string().trim(),
        //type: Joi.string().required(),
        type:Joi.string().valid(USER_ROLES.CUSTOMER,USER_ROLES.DRIVER,USER_ROLES.RESTAURANT),
        message:Joi.string().required(),
      }),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({allowUnknown:true}),
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

let getOrderDetail = {
  method: 'GET',
  path:  basePath+'/getOrderDetail',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.OrderDetail(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'paymentType=>("Online","Cash"),orderType=>("Pick Up Service","Delivery Service")',
      tags: ['api', 'Admin User'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          orderId: Joi.string().length(24).required(),
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
let addCity = {
  method: "POST",
  path:  basePath+"/addCity",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.addCity(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Create City",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        cityName: Joi.string().required().trim(),
        stateName:Joi.string().required().trim(),
        countryName:Joi.string().required().trim(),
        customerDeliveryCharge:Joi.object({
          minimumDistance: Joi.number().required(),
          minimumPrice: Joi.number().required(),
          pricePerkm: Joi.number().required(),
        }),
        riderDeliveryCharge:Joi.object({
          minimumDistance: Joi.number().required(),
          minimumPrice: Joi.number().required(),
          pricePerkm: Joi.number().required(),
        }),        
        cityId: Joi.string().length(24).optional().trim(),
      }),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let createCategory = {
  method: "POST",
  path: basePath+"/createCategory",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.AdminUserController.createCategory(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Create Catgory",
    tags: ["api", "Admin User"],
    payload: {
      maxBytes: 1000 * 1000 * 20, // 20 Mb
      output: "stream",
      parse: true,
      multipart: true,
      //allow: 'multipart/form-data'
    },
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        categoryName: Joi.string().required().min(2).trim(),
        document: Joi.any()
          .meta({ swaggerType: "file" })
          .required()
          .description("document file"),
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

let updateStatus = {
  method: "POST",
  path: basePath+"/updateStatus",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminUserController.updateStatus(request.payload,UserData
    ).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Update Driver and restaurant and customer Status",
    tags: ["api", "Admin User"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        userType:Joi.string().valid(USER_ROLES.CUSTOMER,USER_ROLES.DRIVER,USER_ROLES.RESTAURANT).required(),
        _id: Joi.string().trim().required(),
        status: Joi.boolean().required(),
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

/*

let changePassword = {
  method: 'POST',
  path: '/api/v1/customer/changePassword',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.changePassword(request.payload,UserData).then(response =>{
        return  UniversalFunctions.sendSucces(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Customer',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: {
          oldPassword: Joi.string().required().min(5).trim(),
          newPassword: Joi.string().required().min(5).trim()
        },
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



let verifyOtp = {
  method: 'PUT',
  path: '/api/customer/verifyOtp',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};  
    return Controller.CustomerController.verifyOtp(request.payload).then(response =>{
        return  UniversalFunctions.sendSucces(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'verifyOtp',
    tags: ['api', 'Customer'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: {
        countryCode:Joi.string().required().trim(),
        mobileNumber: Joi.string().required().min(5).trim(),
        otp: Joi.string().required().min(3).trim(),
        isForgotPassword:Joi.boolean().required(),
      },     
      //headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};
*/
let forgotPassword ={
  method: 'PUT',
  path: basePath+'/forgotPassword',
  handler: function (request, reply) { 
    let payloadData ={}
    payloadData = request.payload 
    payloadData.host = request.info.host; 
      return Controller.AdminUserController.forgotPassword(payloadData,{}).then(response =>{
          return  UniversalFunctions.successResponse(null, response);   
      }).catch(error => {   console.log("====errr=====",error);
          return UniversalFunctions.sendError(error) ;  
      });
  },
  config: {
    description: 'Sends Otp on email',
    tags: ['api', 'Admin User'],
    validate: {
      payload: Joi.object({
        email:Joi.string().required().trim(),
      }),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      }
    }
  }
}

let resetPassword =  {
  method: 'PUT',
  path: basePath+'/resetPassword',
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.AdminUserController.resetPassword(queryData).then(response=>{
        return  UniversalFunctions.successResponse(null, response); 
    }).catch(error => {   //console.log("====errr===resetPassword====",error);
       return UniversalFunctions.sendError(error) ;     
    });
  },
  config: {
    description: 'Reset Password For Customer',
    tags: ['api', 'Admin User'],
    validate: {
      payload: Joi.object({
        passwordResetToken: Joi.string().required(),
        newPassword : Joi.string().min(5).required()
      }),
      failAction: UniversalFunctions.failActionFunction
    },
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

module.exports = [
  login,
  logout,
  getDashboardData,
  dashboard,
  driverDetail,
  sendPushNotification,
  getOrderDetail,
  addCity,
  createCategory,
  getInvoiceData,
  updateStatus,
  getOrderDataPdfLink,
  // verifyOtp,
  forgotPassword,
  resetPassword
];
 