const BaseJoi = require('joi');
//const Extension = require('joi-date-extensions');
const Joi = BaseJoi;
const UniversalFunctions = require('../Utils/UniversalFunctions');
const TokenManagerRestaurant = require('../Utils/TokenManagerRestaurant');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const SOCIAL_MODE_TYPE  =  APP_CONSTANTS.SOCIAL_MODE_TYPE; 
const WORKING_DAYS      =  APP_CONSTANTS.WORKING_DAYS; 

//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;

const checkAccessToken = TokenManagerRestaurant.getTokenFromDBForRestaurant;


let login = {
  method: 'POST',
  path: '/api/v1/restaurant/login',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.RestaurantController.login(payloadData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Login Via Email & Password For  Restaurant',
    tags: ['api', 'Restaurant'],
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(5).trim(),
        //deviceType: Joi.string().required(),
        deviceType:Joi.string().valid(DEVICE_TYPES.ANDROID,
          DEVICE_TYPES.IOS,
          DEVICE_TYPES.WEB
        ),
        deviceToken: Joi.string().trim(),
        //flushPreviousSessions: Joi.boolean().required(),
        //appVersion: Joi.string().required().trim()
      }),
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

let changePassword = {
  method: 'PUT',
  path: '/api/v1/restaurant/changePassword',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.changePassword(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Restaurant',
      tags: ['api', 'Restaurant'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          oldPassword: Joi.string().required().min(5).trim(),
          newPassword: Joi.string().required().min(5).trim()
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

let getProfileData = {
  method: 'GET',
  path: '/api/v1/restaurant/getProfileData',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getProfileData(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'updateProfile',
      tags: ['api', 'Restaurant'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
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

let updateProfile = {
  method: "POST",
  path: "/api/v1/restaurant/updateProfile",
  handler: function (request, reply) {
    console.log("====route====");
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.RestaurantController.updateProfile(payloadData, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:" ",
    tags: ["api", "Restaurant"],
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
        restaurantName: Joi.string().required().trim(),
        logo: Joi.any().meta({ swaggerType: "file" }).required().description("document file"),
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

let getOrderList = {
  method: 'GET',
  path: '/api/v1/restaurant/getOrderList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.getRestaurantOrderList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
      tags: ['api', 'Restaurant'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          status:Joi.string().valid(ORDER_STATUS.PENDING,
            ORDER_STATUS.ACCEPTED,
            ORDER_STATUS.CANCELLED_BY_RESTAURANT,
            ORDER_STATUS.CANCELLED_BY_CUSTOMER,
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.PICKED_BY_RIDER,
            ORDER_STATUS.DELIVERED_BY_RIDER
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

let getOrderDetail = {
  method: 'GET',
  path: '/api/v1/restaurant/getOrderDetail',
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
      tags: ['api', 'Restaurant'],
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

let editRestaurantOnlieStatus = {
  method: 'PUT',
  path: '/api/restaurant/editRestaurantOnlieStatus',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.editRestaurantOnlieStatus(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addMenu',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        isOnline : Joi.boolean().required(),
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

let addDeliveryServiceArea = {
  method: 'POST',
  path: '/api/v1/restaurant/addDeliveryServiceArea',
  config: {
    description: "addDelivery ServiceArea || geofencing",
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    handler: function (request, reply) {
      var UserData = request.pre.verify || {};  
      return Controller.RestaurantController.addDeliveryServiceArea(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
      }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
      });
    },
    validate: {
      headers: UniversalFunctions.authorizationHeaderObj,
      payload: Joi.object({
        locationName: Joi.string().required(),
        coordinates: Joi.array().items(Joi.array().items(Joi.number().required()).required()).min(4).required()
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

let orderRejected = {
  method: 'PUT',
  path: '/api/restaurant/orderRejected',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.orderRejected(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'orderRejected',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        orderId: Joi.string().required(),
        reasonForRejection:Joi.string().optional(),
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

let orderAccepted = {
  method: 'PUT',
  path: '/api/restaurant/orderAccepted',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.orderAccepted(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'orderAccepted',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        orderId: Joi.string().required(),
        orderPreparationTime: Joi.number().required()
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

let getDashboardData = {
  method: "GET",
  path: "/api/v1/restaurant/getDashboardData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.getDashboardData(request.payload, UserData) .then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Home APi",
    tags: ["api", "Restaurant"],
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
  path: '/api/restaurant/updateOrderStatus',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.updateOrderStatus(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'status(Preparing,Cooked)',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        orderId: Joi.string().required(),
        status:Joi.string().required(),
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




const forgotPassword = {
  method: "POST",
  path: "/api/v1/restaurant/forgotPassword",
  handler: function (request, reply) {
    return Controller.RestaurantController.forgotPassword(request.payload,{}).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Sends Otp on email",
    tags: ["api", "Restaurant"],
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

const verifyOtp = {
  method: "POST",
  path: "/api/v1/restaurant/verifyOtp",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.verifyOtp(request.payload).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "verifyOtp",
    tags: ["api", "Restaurant"],
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
  path: "/api/v1/restaurant/resetPassword",
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.RestaurantController.resetPassword(queryData).then((response)=> {
        return UniversalFunctions.successResponse(null, response);
      }).catch((error) => {
        return UniversalFunctions.sendError(error);
      });
  },
  config: {
    description: "Reset Password For Customer",
    tags: ["api", "Restaurant"],
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


let getTransactionData = {
  method: "GET",
  path: "/api/v1/restaurant/getTransactionData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.getTransactionData(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"TransactionData",
    tags: ["api", "Restaurant"],
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

let getTransactionGroupByDate = {
  method: "GET",
  path: "/api/v1/restaurant/getTransactionGroupByDate",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.getTransactionGroupByDate(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"TransactionData",
    tags: ["api", "Restaurant"],
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

let submitWithdraw = {
  method: "POST",
  path: "/api/v1/restaurant/submitWithdraw",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.submitWithdraw(request.payload,UserData
    ).then((response) => {
        return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
        return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Submit WIthdraw",
    tags: ["api", "Restaurant"],
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
  path: '/api/v1/restaurant/getNotificationList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getNotificationList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Restaurant Notification List',
      tags: ['api', 'Restaurant'],
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

let workingJoiObject = Joi.object({
  dayName: Joi.string().valid(WORKING_DAYS.MONDAY,
    WORKING_DAYS.TUESDAY, 
    WORKING_DAYS.WEDNESDAY,
    WORKING_DAYS.THURSDAY,
    WORKING_DAYS.FRIDAY, 
    WORKING_DAYS.SATURDAY,
    WORKING_DAYS.SUNDAY, 
  ),
  startHour    : Joi.number().required(),
  startMinutes : Joi.number().required(),
  endHour      : Joi.number().required(),
  endMinutes   : Joi.number().required(),
  isRestaurantOpenOrNot:Joi.boolean().required(),
          

})

let insertAndUpdateWorkingTime = {
  method: 'POST',
  path: '/api/v1/restaurant/insertAndUpdateWorkingTime',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.insertAndUpdateWorkingTime(request.payload,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Restaurant',
      tags: ['api', 'Restaurant Working Time'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          workingDays: Joi.array().items(workingJoiObject).min(1).max(7).required(),
          isUpdate: Joi.boolean().required(),
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

let getWorkingTime = {
  method: 'GET',
  path: '/api/v1/restaurant/getWorkingTime',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getWorkingTime(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Restaurant',
      tags: ['api', 'Restaurant Working Time'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({}),
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

let updateWorkingStatusOfDay = {
  method: 'PUT',
  path: '/api/v1/restaurant/updateWorkingStatusOfDay',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.updateWorkingStatusOfDay(request.payload,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'update Working Status Of Day',
      tags: ['api', 'Restaurant Working Time'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          dayId: Joi.string().required(),
          isRestaurantOpenOrNot:Joi.boolean().required(),
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


let getPromoCode = {
  method: 'GET',
  path: '/api/v1/restaurant/getPromoCode',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getPromoCode(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Restaurant',
      tags: ['api', 'Restaurant Working Time'],
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



let getWalletAmount = {
  method: 'GET',
  path: '/api/v1/restaurant/getWalletAmount',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getWalletAmount(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Wallet Amount',
      tags: ['api', 'Restaurant Dashboard'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
      // query: {},
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

/**For Invoice By At 28-5-21 */

let getOrderInvoice = {
  method: 'GET',
  path: '/api/v1/restaurant/getOrderInvoice',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.getOrderInvoice(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'To Detail Invoice Order',
      tags: ['api', 'Restaurant Dashboard'],
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

let getOrderListWithPromoCode = {
  method: 'GET',
  path: '/api/v1/restaurant/getOrderListWithPromoCode',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantController.getOrderListWithPromoCode(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Order List With Promo Code',
      tags: ['api', 'Restaurant'],
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

let getInvoiceData = {
  method: "GET",
  path: "/api/v1/restaurant/getInvoiceData",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantController.getInvoiceData(request.query,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Get Invoice Data",
    tags: ["api", "Restaurant"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      query: Joi.object({
        _id: Joi.string().trim(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
        paymentType : Joi.string().valid(APP_CONSTANTS.PAYMENT_TYPES.ONLINE,APP_CONSTANTS.PAYMENT_TYPES.CASH,APP_CONSTANTS.PAYMENT_TYPES.RAZORPAY),
        startDate : Joi.string().trim(),
        endDate : Joi.string().trim(),
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

// // [
//     [76.122351,27.563420],
//     [76.386023,24.283632],
//     [79.550086,24.243569],
//     [80.736609,27.055809],
//     [79.725867,28.956830],
//     [77.616492,28.146219],
//     [76.429969,27.719139],
//     [76.122351,27.563420]
// // ]



module.exports = [
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
  getProfileData,
  updateProfile,
  addDeliveryServiceArea,  
  orderRejected,
  orderAccepted,
  updateOrderStatus,
  getDashboardData,
  getOrderList,
  getOrderDetail,
  editRestaurantOnlieStatus,
  getTransactionData,
  submitWithdraw,
  getNotificationList,
  insertAndUpdateWorkingTime,
  getWorkingTime,
  updateWorkingStatusOfDay,
  getPromoCode,
  getWalletAmount,
  getOrderInvoice,
  getOrderListWithPromoCode,
  getInvoiceData,
  getTransactionGroupByDate,
]