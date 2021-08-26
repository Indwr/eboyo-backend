const BaseJoi = require('joi');
//const Extension = require('joi-date-extensions');
const Joi = BaseJoi;
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const SOCIAL_MODE_TYPE  =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
const WORKING_DAYS      =  APP_CONSTANTS.WORKING_DAYS;
//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

const getCatgory = {
  method: 'GET',
  path: '/api/common/getCatgory',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getCatgory(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Catgory',
    tags: ['api', 'Common'],
    //pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getRestaurant = {
  method: 'GET',
  path: '/api/common/getRestaurant',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurant(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        latitude  : Joi.number().required(),
        longitude : Joi.number().required(),
        searchText:Joi.string().optional(),
        dayName:Joi.string().valid(WORKING_DAYS.MONDAY,WORKING_DAYS.TUESDAY,
          WORKING_DAYS.WEDNESDAY,WORKING_DAYS.THURSDAY,WORKING_DAYS.FRIDAY,WORKING_DAYS.SATURDAY,WORKING_DAYS.SUNDAY
        ),
        currentHour: Joi.number().optional(),
        currentMinutes: Joi.number().optional(),
        //endHour: Joi.number().optional(),
        //endMinutes: Joi.number().optional(),
        skip: Joi.number().integer().required(),
        limit: Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          payloadType: "form",
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getRestaurantMenu = {
  method: 'GET',
  path: '/api/common/getRestaurantMenu',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantMenu(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getRestaurantDishes = {
  method: 'GET',
  path: '/api/common/getRestaurantDishes',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantDishes(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        menuId : Joi.string().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


const getRestaurantSubToppings = {
  method: 'GET',
  path: '/api/common/getRestaurantSubToppings',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantSubToppings(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        menuId : Joi.string().required(),
        toppingId:  Joi.string().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getCityList = {
  method: 'GET',
  path: '/api/common/getCityList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getCityList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get City List',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        countryId: Joi.string().trim().required(),
        stateId: Joi.string().trim().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getRestaurantTiming = {
  method: 'GET',
  path: '/api/common/getRestaurantTiming',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantTiming(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Rastaurant Timming List',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId: Joi.string().trim().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getAllCityList = {
  method: 'GET',
  path: '/api/common/getAllCityList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getAllCityList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get All City List',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getStateList = {
  method: 'GET',
  path: '/api/common/getStateList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getStateList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Stage List',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        countryId: Joi.string().trim().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


const getCountryList = {
  method: 'GET',
  path: '/api/common/getCountryList',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getCountryList(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Country List',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const testNotification = {
  method: 'POST',
  path: '/v1/test/testFCM',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.CommonController.sendNotificationTest(request.payload).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'test'],
    validate: {
      payload: Joi.object({
        message     : Joi.string().required(),
        deviceToken : Joi.string().required()
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

let getBonusData = {
  method: "GET",
  path: "/api/v1/common/getBonusData",
  handler: function (request, reply) {
    let UserData = {};
    return Controller.DriverController.getBonusData(request.payload, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Get Bonus APi",
    tags: ["api", "Common"],
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

let generatePdf = {
  method: "GET",
  path: "/api/v1/common/generatePdf",
  handler: function (request, reply) {
    let UserData = {};
    return Controller.CommonController.generatePdf(request.payload).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description: "Generate Pdf",
    tags: ["api", "Common"],
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

const testEmail = {
  method: 'POST',
  path: '/v1/test/testEmail',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {}; 
    return Controller.CommonController.sendEmail(request.payload).then(response =>{ //console.log("response",response);
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => { //console.log("error",error); 
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Message',
    tags: ['api', 'test'],
    validate: {
      payload: Joi.object({
        to      : Joi.string().required(),
        subject : Joi.string().required(),
        html : Joi.string().required(),
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

let allFaq = {
  method: "GET",
  path: "/api/v1/admin/allFaq",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.allFaq(request.query, UserData)
      .then((response) => {
        return UniversalFunctions.successResponse(null, response);
      })
      .catch((error) => {
        return UniversalFunctions.sendError(error);
      });
  },
  config: {
    description:
    "Send user types \n userTyoe (Customer,Driver,Restaurant)",
    tags: ["api", "Common"],
    validate: {
      query: Joi.object({
        userType:Joi.string().trim().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }), 
      headers: Joi.object({}).options({ allowUnknown: true }),
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

const getRestaurantMenuDetail = {
  method: 'GET',
  path: '/api/common/getRestaurantMenuDetail',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantMenuDetail(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        menuId : Joi.string().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const getRestaurantDisheDetail = {
  method: 'GET',
  path: '/api/common/getRestaurantDisheDetail',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantDisheDetail(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        dishId : Joi.string().required()
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


let allBanner = {
  method: "GET",
  path: "/api/v1/common/allBanner",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.allBanner(request.query, UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"All Banner ",
    tags: ["api", "Common"],
    validate: {
      query: Joi.object({
        type:Joi.string().valid(APP_CONSTANTS.USER_ROLES.CUSTOMER,
          APP_CONSTANTS.USER_ROLES.DRIVER,
          APP_CONSTANTS.USER_ROLES.RESTAURANT,
        ),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }), 
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};

const getRestaurantMenuAndDishes = {
  method: 'GET',
  path: '/api/v1/common/getRestaurantMenuAndDishes',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.getRestaurantMenuAndDishes(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant Menu And Dishes',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        restaurantId : Joi.string().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const dishesTitelAndTopping = {
  method: 'GET',
  path: '/api/v1/common/dishesTitelAndTopping',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CommonController.dishesTitelAndTopping(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'dishesTitelAndTopping',
    tags: ['api', 'Common'],
    validate: {
      query: Joi.object({
        dishId : Joi.string().required(),
        skip : Joi.number().integer().required(),
        limit : Joi.number().integer().required(),
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

module.exports = [
  getCatgory,
  getRestaurant,
  getRestaurantMenu,
  getRestaurantMenuAndDishes,
  dishesTitelAndTopping,
  getRestaurantDishes,
  getRestaurantSubToppings,
  testNotification,
  getCityList,
  getStateList,
  getCountryList,
  allFaq,
  getRestaurantMenuDetail,
  getRestaurantDisheDetail,
  testEmail,
  allBanner,
  getAllCityList,
  getRestaurantTiming,
  getBonusData,
  generatePdf,
]