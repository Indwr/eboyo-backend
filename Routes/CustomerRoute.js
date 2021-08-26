const BaseJoi = require('joi');
 const JoiDate = require('@hapi/joi-date');
const Joi = BaseJoi.extend(JoiDate);//BaseJoi;
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const SOCIAL_MODE_TYPE  =  APP_CONSTANTS.SOCIAL_MODE_TYPE;

//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;
const registerJoi = Joi.object({
  fullName: Joi.string().required()
});

const customerRegister = {
  method: 'POST',
  path: '/api/v1/customer/registration',
  handler: function (request, reply) {
    return Controller.CustomerController.registration(request.payload).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: { 
    description: 'Login With Mobile Number',
    tags: ['api', 'Customer'],
    validate: {
      payload: Joi.object({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        deviceType:Joi.string().valid(DEVICE_TYPES.ANDROID,DEVICE_TYPES.IOS),
        deviceToken:Joi.string().required(),
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

let logout = {
  method: 'POST',
  path: '/api/v1/customer/logout',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};  
    return Controller.CustomerController.logout(UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Logout Admin',
    tags: ['api', 'Customer'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {     
      headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};

let changePassword = {
  method: 'POST',
  path: '/api/v1/customer/changePassword',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.changePassword(request.payload,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password user',
      tags: ['api', 'Customer'],
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

let resetPassword =  {
  method: 'POST',
  path: '/api/customer/resetPassword',
  handler: function (request, reply) {
    let queryData = request.payload;
    //let queryData = request.query;
    return Controller.CustomerController.resetPassword(queryData).then(response=>{
      return  UniversalFunctions.successResponse(null, response); 
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;     
    });
  },
  config: {
    description: 'Reset Password For Customer',
    tags: ['api', 'Customer'],
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

let updateProfile = {
  method: 'PUT',
  path: '/api/v1/customer/updateProfile',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.updateProfile(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'updateProfile',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          firstName: Joi.string().required().min(5).trim(),
          lastName: Joi.string().required().min(5).trim(),
          email: Joi.string().required().min(5).trim()
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

let uploadProfilePic = {
  method: "POST",
  path: "/api/v1/customer/uploadProfilePic",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.CustomerController.uploadProfilePic(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    //description: " ",
    tags: ["api", "Customer"],
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

let getProfileData = {
  method: 'GET',
  path: '/api/v1/customer/getProfileData',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.getProfileData(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'updateProfile',
      tags: ['api', 'Customer'],
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

const verifyOtp = {
  method: 'POST',
  path: '/api/customer/verifyOtp',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};  
    return Controller.CustomerController.verifyOtp(request.payload).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'verifyOtp',
    tags: ['api', 'Customer'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        otpCode: Joi.string().required().min(3).trim(),
        isForgotPassword:Joi.boolean().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
};


let forgotPassword ={
  method: 'POST',
  path: '/api/v1/customer/forgotPassword',
  handler: function (request, reply) {  
      return Controller.CustomerController.forgotPassword(request.payload,{}).then(response =>{
          return  UniversalFunctions.successResponse(null, response);   
      }).catch(error => {   console.log("====errr=====",error);
          return UniversalFunctions.sendError(error) ;  
      });
  },
  config: {
    description: 'Sends Otp on email',
    tags: ['api', 'Customer'],
    validate: {
      payload: Joi.object({
        countryCode: Joi.string().required(),
        mobileNumber: Joi.string().required(),
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

let addAdress = {
  method: 'POST',
  path: '/api/v1/customer/addAdress',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.addAdress(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addAdress',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          address   : Joi.string().required().min(2).trim(),
          buildingAddress  : Joi.string().required().trim(),
          flatNumber: Joi.string().required().trim(),
          landmark: Joi.string().required().min(2).trim(),
          latitude  : Joi.number().required(),
          longitude : Joi.number().required(),
          addressId: Joi.string().optional().trim(),
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

let setDefaultAdress = {
  method: 'PUT',
  path: '/api/v1/customer/setDefaultAddress',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.setDefaultAddress(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Set default address',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          addressId:Joi.string().required().trim(),
          isDefault : Joi.boolean().required(),
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

let getDefaultAddress = {
  method: 'GET',
  path: '/api/v1/customer/getDefaultAddress',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.getDefaultAddress(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Default Address',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
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

let getAddress = {
  method: 'GET',
  path: '/api/v1/customer/getAddress',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.getAddress(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'updateProfile',
      tags: ['api', 'Customer'],
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

let deleteAddress = {
  method: 'PUT',
  path: '/api/v1/customer/deleteAddress',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.deleteAddress(request.payload,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Set default address',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          addressId:Joi.string().required().trim(),
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


let createOrder = {
  method: 'POST',
  path: '/api/v1/customer/createOrder',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.createOrder(request.payload,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'paymentType=>("Online","Cash"),orderType=>("Pick Up Service","Delivery Service")',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          itemTotalPrice:Joi.number().required(),
          dicountApplied:Joi.number().required(),
          totalPrice:Joi.number().required(),
          pricePaidByCustomer:Joi.number().required(),
          totalTax:Joi.number().required(),
          restaurantId   : Joi.string().length(24).required().trim(),
          addressId  : Joi.string().length(24).required().trim(),
          disheDetails:  Joi.array().items(Joi.object({
            dishId   : Joi.string().length(24).required().trim(),
            menuId   : Joi.string().length(24).optional().trim(),
            quantity : Joi.number().required(),
            price : Joi.number().required(),
            toppingDetail: Joi.array().items(Joi.object({
              toppingId     : Joi.string().length(24).optional(),
              subTopping  : Joi.array().items().optional(),
            })).optional(),
          })).required(),
          isScheduleOrder: Joi.boolean().required().default(false),
          scheduleOrderDate:Joi.date().format('YYYY-MM-DD HH:mm').utc().optional(),
          scheduleOrderStartDate:Joi.date().format('YYYY-MM-DD HH:mm').utc().optional(),
          scheduleOrderEndDate:Joi.date().format('YYYY-MM-DD HH:mm').utc().optional(),
          razorpayId  : Joi.string().optional().trim(),
          orderType:Joi.string().required(),
          promoCode: Joi.string().optional(),
          paymentType:Joi.string().required(),
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
  path: '/api/v1/customer/getOrderList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.getCustomerOrderList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'paymentType=>("Online","Cash"),orderType=>("Pick Up Service","Delivery Service")',
      tags: ['api', 'Customer'],
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

let getOrderDetail = {
  method: 'GET',
  path: '/api/v1/customer/getOrderDetail',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.OrderController.customerOrderDetail(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: ' ',
      tags: ['api', 'Customer'],
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

const calculateCartCharges = {
  method: 'POST',
  path: '/api/v1/customer/calculateCartCharges',
  handler: async (request, reply)=>{
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.calculateCartCharges(request.payload,UserData).then(response =>{ 
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => { //console.log("error",error); 
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: { 
    description: 'calculate Cart Charges',
    tags: ['api', 'Customer'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        promoCode: Joi.string().optional(),
        restaurantId : Joi.string().required(),
        customerLat : Joi.number().required(),
        customerLong : Joi.number().required(),
        totalPrice : Joi.number().required(),
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

const calculateCartChargesWithOutLogin = {
  method: 'POST',
  path: '/api/v1/customer/calculateCartChargesWithOutLogin',
  handler: async (request, reply)=>{
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.calculateCartCharges(request.payload,UserData).then(response =>{ 
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => { //console.log("error",error); 
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: { 
    description: 'calculate Cart Charges',
    tags: ['api', 'Customer'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        promoCode: Joi.string().optional(),
        restaurantId : Joi.string().required(),
        customerLat : Joi.number().required(),
        customerLong : Joi.number().required(),
        totalPrice : Joi.number().required(),
      }),
      //headers: Joi.object({'authorization': Joi.string().trim().required()}).options({allowUnknown: true}),
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

let submitRating = {
  method: 'POST',
  path: '/api/v1/customer/submitRating',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.submitRating(request.payload,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Submit Rating  type=Driver,Restaurant and rating in numbers 1 to 5',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        payload: Joi.object({
          type   : Joi.string().required().min(2).trim(),
          rating  : Joi.number().required(),
          comment: Joi.string().trim(),
          orderId: Joi.string().required().trim(),
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

let getNotificationList = {
  method: 'GET',
  path: '/api/v1/customer/getNotificationList',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.getNotificationList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Get Customer Notification List',
      tags: ['api', 'Customer'],
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


let getPromoCode = {
  method: 'GET',
  path: '/api/v1/customer/getPromoCode',
  handler: function (request, reply) {  
    let UserData = request.pre.verify || {}; 
    return Controller.CustomerController.getPromoCode(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {    
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Change Password Restaurant',
      tags: ['api', 'Customer'],
      pre: [{ method: checkAccessToken, assign: 'verify' }],
      validate: {
        query: Joi.object({
          restaurantId : Joi.string().optional(),
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
  customerRegister,
  changePassword,
  updateProfile,
  uploadProfilePic,
  logout,
  getProfileData,  
  verifyOtp,
  addAdress,
  getAddress,
  deleteAddress,
  createOrder,
  getOrderList,
  getOrderDetail,
  setDefaultAdress,
  getDefaultAddress,
  calculateCartCharges,
  calculateCartChargesWithOutLogin,
  submitRating,
  getNotificationList,
  getPromoCode,
  //forgotPassword,
  //resetPassword,
]