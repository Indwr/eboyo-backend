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

//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;

const checkAccessToken = TokenManagerRestaurant.getTokenFromDBForRestaurant;


let addMenu = {
  method: 'POST',
  path: '/api/restaurant/addMenu',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addMenu(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addMenu',
    tags: ['api', 'Restaurant Menu'],
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

let menuList = {
  method: 'GET',
  path: '/api/restaurant/menuList',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getMenuList(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'menuList',
    tags: ['api', 'Restaurant Menu'],
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

const adminMenuList = {
  method: 'GET',
  path: '/api/restaurant/adminMenuList',
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
    tags: ['api', 'Restaurant Menu'],
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

let addAdminMenu = {
  method: 'POST',
  path: '/api/v2/restaurant/addMenu',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addAdminMenu(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addMenu',
    tags: ['api', 'Restaurant Menu'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        adminMenuId            : Joi.string().length(24).required(),
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

let editMenuOnlieStatus = {
  method: 'PUT',
  path: '/api/restaurant/editMenuOnlieStatus',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.editMenuOnlieStatus(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addMenu',
    tags: ['api', 'Restaurant Menu'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        menuId   : Joi.string().required(),
        availabilityStatus : Joi.boolean().required(),
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
  path: '/api/restaurant/deleteMenu',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteMenu(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant Menu'],
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

let addDishes = {
  method: 'POST',
  path: '/api/restaurant/addDishes',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addDishes(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addDishes',
    tags: ['api', 'Restaurant Dishes'],
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
        menuId             : Joi.string().required(),
        itemName           : Joi.string().required(),
        description        : Joi.string(),
        price              : Joi.number().required(),
        maxQuantity        : Joi.number().required(),
        isVegetarian       : Joi.boolean().required(), 
        availabilityStatus : Joi.boolean().required(), 
        dishId             : Joi.string().optional(),
        itemImage          : Joi.any().meta({swaggerType: 'file'}).optional().description('picture of item'),            
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

let addDisheImages = {
  method: 'POST',
  path: '/api/restaurant/addDisheImages',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addDisheImages(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addDishes',
    tags: ['api', 'Restaurant Dishes'],
    payload: {
      maxBytes: 1000 * 1000 * 40, // 40 Mb
      output: 'stream',
      parse: true,
      multipart:true,
      //allow: 'multipart/form-data'
    },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        dishId             : Joi.string().required(),
        itemImage          : Joi.any().meta({swaggerType: 'file'}).optional().description('picture of item'),            
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

const deleteDisheImages = {
  method: 'DELETE',
  path: '/api/restaurant/deleteDisheImages',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteDisheImages(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant Dishes'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        dishId   : Joi.string().required(),
        imageId   : Joi.string().required(),
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

let DishesList = {
  method: 'GET',
  path: '/api/restaurant/DishesList',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getDishesList(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'DishesList',
    tags: ['api', 'Restaurant Dishes'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        menuId   : Joi.string().required(),
        dishName : Joi.string().optional(),
        skip     : Joi.number().integer().required(),
        limit    : Joi.number().integer().required(),
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

let editDishesOnlieStatus = {
  method: 'PUT',
  path: '/api/restaurant/editDishesOnlieStatus',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.editDisheOnlieStatus(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'edit Dishes Onlie Status',
    tags: ['api', 'Restaurant Dishes'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        dishId   : Joi.string().required(),
        availabilityStatus : Joi.boolean().required(),
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

const deleteDishes = {
  method: 'DELETE',
  path: '/api/restaurant/deleteDishes',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteDishes(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant Dishes'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        dishId       : Joi.string().required(),
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

let addToppingTitle = {
  method: 'POST',
  path: '/api/restaurant/addToppingTitle',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addToppingTitle(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addToppingTitle',
    tags: ['api', 'Restaurant'],
    // payload: {
    //   maxBytes: 1000 * 1000 * 20, // 20 Mb
    //   output: 'stream',
    //   parse: true,
    //   multipart:true,
    //   //allow: 'multipart/form-data'
    // },
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        menuId             : Joi.string().required(),
        dishId             : Joi.string().required(),
        title              : Joi.string().required(),
        isVegetarian       : Joi.boolean().required(),
        maxItemSelection   : Joi.number().required(),
        necessaryItemSelection:Joi.number().required(),
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

let addToppinItem = {
  method: 'POST',
  path: '/api/restaurant/addToppinItem',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addToppinItem(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'add Toppin Item',
    tags: ['api', 'Restaurant'],    
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        menuId             : Joi.string().required(),
        dishId             : Joi.string().required(),
        titleId            : Joi.string().required(),
        toppingName        : Joi.string().required(),
        price              : Joi.number().required(),
        isDefault          : Joi.boolean().required(),
        toppingId            : Joi.string().optional(),
        //isVegetarian       : Joi.boolean().required(),
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

let addSubToppinItem = {
  method: 'POST',
  path: '/api/restaurant/addSubToppinItem',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.addSubToppinItem(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {  
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'addSubToppinItem',
    tags: ['api', 'Restaurant'],    
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      payload: Joi.object({
        menuId         : Joi.string().required(),
        dishId         : Joi.string().required(),
        titleId        : Joi.string().required(),
        toppingId      : Joi.string().required(),
        toppingName    : Joi.string().required(),
        price          : Joi.number().required(),
        isDefault      : Joi.boolean().required(),
        subToppinId    : Joi.string().optional(),
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

let setDefaultToppinItem= {
  method: 'PUT',
  path: '/api/restaurant/setDefaultToppinItem',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.setDefaultToppinItem(payloadData,UserData).then(response =>{
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
        dishId        : Joi.string().required(),
        titleId       : Joi.string().required(),
        toppingId     : Joi.string().required(),
        toppingName   : Joi.string().optional(),
        price         : Joi.number().optional(),
        isDefault     : Joi.boolean().required(),
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


const getTopping = {
  method: 'GET',
  path: '/api/restaurant/getTopping',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.getTopping(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        dishId : Joi.string().required(),
        titleId       : Joi.string().required(),
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

const deleteToppingTitle = {
  method: 'DELETE',
  path: '/api/restaurant/deleteToppingTitle',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteToppingTitle(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        titleId       : Joi.string().required(),
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

const deleteTopping = {
  method: 'DELETE',
  path: '/api/restaurant/deleteTopping',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteTopping(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        toppingId       : Joi.string().required(),
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

let setDefaultSubToppinItem= {
  method: 'PUT',
  path: '/api/restaurant/setDefaultSubToppinItem',
  handler: function (request, reply) {
    var payloadData = request.payload;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.setDefaultSubToppinItem(payloadData,UserData).then(response =>{
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
        dishId        : Joi.string().required(),
        titleId       : Joi.string().required(),
        toppingId     : Joi.string().required(),
        subToppingId  : Joi.string().required(),
        toppingName   : Joi.string().optional(),
        price         : Joi.number().optional(),
        isDefault     : Joi.boolean().required(),
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

const deleteSubTopping = {
  method: 'DELETE',
  path: '/api/restaurant/deleteSubTopping',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.deleteSubTopping(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get Restaurant',
    tags: ['api', 'Restaurant'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        subToppingId    : Joi.string().required(),
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


let importMenuUsingCSV = {
  method: "POST",
  path: "/api/v1/restaurantMenu/importMenuUsingCSV",
  handler: function (request, reply) {
    var payloadData = request.payload;
    var UserData = request.pre.verify || {};
    return Controller.RestaurantMenuController.importMenuUsingCSV(payloadData,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    //description: " ",
    tags: ["api", "Restaurant  Menu"],
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

let getReviewList = {
  method: 'GET',
  path: '/api/restaurant/getReviewList',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getReviewList(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'getReviewList',
    tags: ['api', 'Restaurant Dishes'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip     : Joi.number().integer().required(),
        limit    : Joi.number().integer().required(),
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


let getTopDeliveryBoy  = {
  method: 'GET',
  path: '/api/restaurant/getTopDeliveryBoy',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getTopDeliveryBoy(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'getTopDeliveryBoy',
    tags: ['api', 'Restaurant Dashboard'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip     : Joi.number().integer().required(),
        limit    : Joi.number().integer().required(),
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

let getTopCustomer  = {
  method: 'GET',
  path: '/api/restaurant/getTopCustomer',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getTopCustomer(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'getTopDeliveryBoy',
    tags: ['api', 'Restaurant Dashboard'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip     : Joi.number().integer().required(),
        limit    : Joi.number().integer().required(),
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

let getTopSellingDish  = {
  method: 'GET',
  path: '/api/restaurant/getTopSellingDish',
  handler: function (request, reply) {
    var payloadData = request.query;
    let UserData = request.pre.verify || {}; 
    return Controller.RestaurantMenuController.getTopSellingDish(payloadData,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response);   
    }).catch(error => {  
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'getTopDeliveryBoy',
    tags: ['api', 'Restaurant Dashboard'],
    pre: [{ method: checkAccessToken, assign: 'verify' }],
    validate: {
      query: Joi.object({
        skip     : Joi.number().integer().required(),
        limit    : Joi.number().integer().required(),
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
  addMenu,
  menuList,
  adminMenuList,
  addAdminMenu,
  editMenuOnlieStatus,
  deleteMenu,
  importMenuUsingCSV,

  addDishes,
  addDisheImages,
  deleteDisheImages,
  DishesList,
  deleteDishes,
  addToppingTitle,
  addToppinItem,
  addSubToppinItem, 
  editDishesOnlieStatus,
  setDefaultToppinItem,
  getTopping,
  deleteTopping,
  deleteToppingTitle,
  setDefaultSubToppinItem,
  deleteSubTopping,
  getReviewList,
  getTopDeliveryBoy,
  getTopCustomer,
  getTopSellingDish,
  
  
]