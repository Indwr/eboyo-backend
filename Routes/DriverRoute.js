const BaseJoi = require("joi");
//const Extension = require('joi-date-extensions');
const Joi = BaseJoi;
const UniversalFunctions = require("../Utils/UniversalFunctions");
const TokenManagerDriver = require("../Utils/TokenManagerDriver");
const Controller = require("../Controllers");
const CONFIG = require("../Config");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;
const DEVICE_TYPES = APP_CONSTANTS.DEVICE_TYPES;
const GENDER_TYPES = APP_CONSTANTS.GENDER_TYPES;
const SOCIAL_MODE_TYPE = APP_CONSTANTS.SOCIAL_MODE_TYPE;

//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);

const checkAccessToken = TokenManagerDriver.getTokenFromDBForDriver;
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;

const driverLogin = {
  method: "POST",
  path: "/api/v1/driver/login",
  handler: function (request, reply) {
    return Controller.DriverController.login(request.payload).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: " ",
    tags: ["api", "Driver"],
    validate: {
      payload: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        //deviceType: Joi.string().required(),
        deviceType:Joi.string().valid(DEVICE_TYPES.ANDROID,
          DEVICE_TYPES.IOS,
        ),
        deviceToken: Joi.string().required(),
      }),
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

let logout = {
  method: "POST",
  path: "/api/v1/driver/logout",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.logout(UserData).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Logout Admin",
    tags: ["api", "Driver"],
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

let getProfileData = {
  method: "GET",
  path: "/api/v1/driver/getProfileData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.getProfileData(request.payload, UserData) .then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "updateProfile",
    tags: ["api", "Driver"],
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

let updateCoordinates = {
  method: "POST",
  path: "/api/v1/driver/updateCoordinates",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.updateLatOrLong(request.payload,UserData
    ).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Update Latitude or longitude",
    tags: ["api", "Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
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

let changePassword = {
  method: "POST",
  path: "/api/v1/driver/changePassword",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.changePassword(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null,response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Change Password user",
    tags: ["api", "Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        oldPassword: Joi.string().required().min(5).trim(),
        newPassword: Joi.string().required().min(5).trim(),
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

const forgotPassword = {
  method: "POST",
  path: "/api/v1/driver/forgotPassword",
  handler: function (request, reply) {
    return Controller.DriverController.forgotPassword(request.payload, {})
      .then((response) => {
        return UniversalFunctions.successResponse(null, response);
      })
      .catch((error) => {
        console.log("====errr=====", error);
        return UniversalFunctions.sendError(error);
      });
  },
  config: {
    description: "Sends Otp on email",
    tags: ["api", "Driver"],
    validate: {
      payload: Joi.object({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
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

let uploadDocument = {
  method: "POST",
  path: "/api/v1/driver/uploadDocument",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.DriverController.uploadDocument(payloadData, UserData)
      .then((response) => {
        return UniversalFunctions.successResponse(null, response);
      })
      .catch((error) => {
        return UniversalFunctions.sendError(error);
      });
  },
  config: {
    description:
      "upload Profile Pic \n documentType (1=>adharcard,2=>drivingLicense,3=>Other)",
    tags: ["api", "Driver"],
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
        docTitle: Joi.string().required().trim(),
        document: Joi.any()
          .meta({ swaggerType: "file" })
          .required()
          .description("document file"),
        documentType: Joi.number().required(),
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

let uploadProfilePic = {
  method: "POST",
  path: "/api/v1/driver/uploadProfilePic",
  handler: function (request, reply) {
    console.log("====route====");
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.DriverController.uploadProfilePic(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null,response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:
      "upload Profile Pic \n documentType (1=>adharcard,2=>drivingLicense,3=>Other)",
    tags: ["api", "Driver"],
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

const verifyOtp = {
  method: "POST",
  path: "/api/v1/driver/verifyOtp",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.verifyOtp(request.payload).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "verifyOtp",
    tags: ["api", "Driver"],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        otpCode: Joi.string().required().min(3).trim(),
        isForgotPassword: Joi.boolean().required(),
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

let resetPassword = {
  method: "POST",
  path: "/api/v1/driver/resetPassword",
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.DriverController.resetPassword(queryData)
      .then((response) => {
        return UniversalFunctions.successResponse(null, response);
      })
      .catch((error) => {
        return UniversalFunctions.sendError(error);
      });
  },
  config: {
    description: "Reset Password For Customer",
    tags: ["api", "Driver"],
    validate: {
      payload: Joi.object({
        passwordResetToken: Joi.string().required(),
        newPassword: Joi.string().min(5).required(),
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

let getNewOrderList = {
  method: 'GET',
  path: '/api/v1/driver/getNewOrderList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.driverNewOrderList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'paymentType=>("Online","Cash"),orderType=>("Pick Up Service","Delivery Service")',
      tags: ['api', 'Driver'],
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
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

let getOrderList = {
  method: 'GET',
  path: '/api/v1/driver/getOrderList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.getDriverOrderList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'paymentType=>("Online","Cash"),orderType=>("Pick Up Service","Delivery Service")',
      tags: ['api', 'Driver'],
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
        //payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}
let getDashboardData = {
  method: "GET",
  path: "/api/v1/driver/getDashboardData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.getDashboardData(request.payload, UserData) .then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Home APi",
    tags: ["api", "Driver"],
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

let updateOrderStatus = {
  method: 'PUT',
  path: '/api/driver/updateOrderStatus',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.DriverController.driverOrderUpdateStatus(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'status(Picked_By_Driver,Driver_Reached_Location,Delivered_By_Driver)',
    tags: ['api', 'Driver'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        orderId: Joi.string().required(),
        status:Joi.string().valid(ORDER_STATUS.DELIVERED_BY_RIDER,
          ORDER_STATUS.RIDER_REACHED_LOCATION,
          ORDER_STATUS.PICKED_BY_RIDER,
          //ORDER_STATUS.ACCEPTED_BY_DRIVER,
          //ORDER_STATUS.REJECTED_BY_DRIVER
        ),
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

let addWalletbalance = {
  method: "POST",
  path: "/api/v1/driver/addWalletbalance",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.addWalletbalance(request.payload,UserData
    ).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "add Wallet balance",
    tags: ["api", "Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        capital: Joi.number().required(),
        transactionId: Joi.string().required(),
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


let orderRequestAcceptedAndRejected = {
  method: 'PUT',
  path: '/api/driver/orderRequestAcceptedAndRejected',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.DriverController.orderRequestAcceptedAndRejected(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Order Request Status By driver(accepted,rejected)',
    tags: ['api', 'Driver'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        orderId: Joi.string().required(),
        orderRequestStatus:Joi.string().valid(ORDER_STATUS.ACCEPTED_BY_DRIVER,
          ORDER_STATUS.REJECTED_BY_DRIVER,
        ).required(),
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

let getOrderRequest = {
  method: 'GET',
  path: '/api/driver/getOrderRequest',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.DriverController.getOrderRequest(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
    tags: ['api', 'Driver'],
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

let getOrderDetail = {
  method: 'GET',
  path: '/api/v1/driver/getOrderDetail',
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
      tags: ['api', 'Driver'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          orderId: Joi.string().required(),
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

let getTransactionData = {
  method: "GET",
  path: "/api/v1/driver/getTransactionData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.getTransactionData(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"TransactionData",
    tags: ["api", "Driver"],
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

let getBonusData = {
  method: "GET",
  path: "/api/v1/driver/getBonusData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.getBonusData(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Home APi",
    tags: ["api", "Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({}),
      headers: Joi.object({authorization: Joi.string().trim().required()}).options({ allowUnknown: true }),
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

let submitWithdraw = {
  method: "POST",
  path: "/api/v1/driver/submitWithdraw",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.DriverController.submitWithdraw(request.payload,UserData
    ).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Submit WIthdraw",
    tags: ["api", "Driver"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        amount: Joi.number().required(),
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

let getNotificationList = {
  method: 'GET',
  path: '/api/v1/driver/getNotificationList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.DriverController.getNotificationList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Driver Notification List',
      tags: ['api', 'Driver'],
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

module.exports = [
  driverLogin,
  logout,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfileData,
  uploadProfilePic,
  uploadDocument,
  updateCoordinates,
  getNewOrderList,
  getOrderList,
  getDashboardData,
  addWalletbalance,
  updateOrderStatus,
  orderRequestAcceptedAndRejected,
  getOrderRequest,
  getOrderDetail,
  getTransactionData,
  getBonusData,
  submitWithdraw,
  getNotificationList,
];
