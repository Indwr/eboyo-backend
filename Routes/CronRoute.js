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

//console.log("DEVICE_TYPES",APP_CONSTANTS.swaggerDefaultResponseMessages);


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

const getAllOrderAndUpdate = {
  method: 'GET',
  path: '/api/cron/getAllOrderAndUpdate',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.CronController.getAllOrderAndUpdate(request.query,UserData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'get All Peending Orders',
    tags: ['api', 'Cron'],
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


module.exports = [
  getAllOrderAndUpdate,
]