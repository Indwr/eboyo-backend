const BaseJoi = require('joi');
//const Extension = require('joi-date-extensions');
const Joi = BaseJoi;
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

const createContact = {
  method: 'POST',
  path: '/api/v1/razorpayx/createContact',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.RazorpayXPaymentsController.createContact(payloadData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   
      // console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Create New Contact',
    tags: ['api', 'RazorpayX'],
    validate: {
      payload: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string().trim(),
        contact: Joi.number().integer(),
        type: Joi.string().trim(),
        reference_id: Joi.string().trim(),
        notes: Joi.object().keys({
                notes_key_1     : Joi.string().optional(),
                  notes_key_2  : Joi.string().optional(),
              })
              .optional({})
      }),     
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          // payloadType : 'form',
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


const fetchAllContacts = {
  method: 'GET',
  path: '/api/v1/razorpayx/fetchAllContacts',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RazorpayXPaymentsController.fetchAllContacts(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Fetch all Contacts',
    tags: ['api', 'RazorpayX'],
    validate: {
      query: Joi.object({
        // customer_id:Joi.string().trim().required(),
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

const createFundAccountBankAccount = {
  method: 'POST',
  path: '/api/v1/razorpayx/createFundAccountBankAccount',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RazorpayXPaymentsController.createFundAccountBankAccount(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Create Fund Account - Bank Account',
    tags: ['api', 'RazorpayX'],
    validate: {
      query: Joi.object({
         contact_id     : Joi.string().trim().required(),
         account_type   : Joi.string().trim().required(),
         name           : Joi.string().trim().required(),
         ifsc           : Joi.string().trim().required(),
         account_number : Joi.string().trim().required(),
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

const createPayout =  {
  method: 'POST',
  path: '/api/v1/razorpayx/createPayout',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RazorpayXPaymentsController.createPayout(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Create Payout',
    tags: ['api', 'RazorpayX'],
    validate: {
      query: Joi.object({
        account_number : Joi.string().trim().required(),
        fund_account_id : Joi.string().trim().required(),
        amount : Joi.number().required(),
        currency : Joi.string().trim().required(),
        mode : Joi.string().trim().required(),
        purpose : Joi.string().trim().required(),
        queue_if_low_balance : Joi.string().trim(),
        reference_id : Joi.string().trim(),
        narration : Joi.string().trim(),
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
  // createContact,
  fetchAllContacts,
  // createFundAccountBankAccount,
  // createPayout,
]