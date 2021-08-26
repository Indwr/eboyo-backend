const BaseJoi = require('joi');
//const Extension = require('joi-date-extensions');
const Joi = BaseJoi;
const UniversalFunctions = require('../Utils/UniversalFunctions');
const Controller        =  require('../Controllers');
const CONFIG            =  require('../Config');
const APP_CONSTANTS     =  CONFIG.APP_CONSTANTS;
const DEVICE_TYPES      =  APP_CONSTANTS.DEVICE_TYPES;


const checkAccessToken = UniversalFunctions.getTokenFromDBForCustomer;

const createCustomer = {
  method: 'POST',
  path: '/api/v1/razorpay/createCustomer',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.RazorpayPaymentsController.createCustomer(payloadData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   
      // console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Create New Customer',
    tags: ['api', 'Razorpay'],
    validate: {
      payload: Joi.object({
        name: Joi.string().trim().required(),
        email: Joi.string().trim().required(),
        contact: Joi.number().integer().required(),
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


const fetchCustomerById = {
  method: 'GET',
  path: '/api/v1/razorpay/fetchCustomerById',
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.RazorpayPaymentsController.fetchCustomerById(request.query,UserData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Fetch Customer by ID',
    tags: ['api', 'Razorpay'],
    validate: {
      query: Joi.object({
        customer_id:Joi.string().trim().required(),
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

const editCustomer = {
  method: 'PUT',
  path: '/api/v1/razorpay/editCustomer',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.RazorpayPaymentsController.editCustomer(payloadData).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Edit a Customer',
    tags: ['api', 'Razorpay'],
    validate: {
      payload: Joi.object({
        customer_id:Joi.string().trim().required(),
        name: Joi.string().trim().required(),
        email: Joi.string().trim().required(),
        contact: Joi.number().integer().required(),
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

const capturePayment = {
  method: 'POST',
  path: '/api/v1/razorpay/capturePayment',
  handler: function (request, reply) {
    var payloadData = request.payload;
    return Controller.RazorpayPaymentsController.capturePayment(payloadData).then(response =>{
      return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
      return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Capture a Payment',
    tags: ['api', 'Razorpay'],
    validate: {
      payload: Joi.object({
        transaction_id: Joi.string().trim().required(),
        amount: Joi.number().required(),
        currency: Joi.string().trim().required(),
      }), 
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
        payloadType : 'form',
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const fetchAllPayments = {
  method: 'GET',
  path: '/api/v1/razorpay/fetchAllPayments',
  handler: function (request, reply) {
    return Controller.RazorpayPaymentsController.fetchAllPayments(request.query).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Fetch all Payments',
    tags: ['api', 'Razorpay'],
    validate: {
      query: Joi.object({
        from: Joi.date().timestamp().raw(),
        to: Joi.date().timestamp().raw(),
        count: Joi.number().required(),
        skip: Joi.number().required(),
      }), 
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          payloadType : 'form',
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}

const fetchPaymentById = {
  method: 'GET',
  path: '/api/v1/razorpay/fetchPaymentById',
  handler: function (request, reply) {
    return Controller.RazorpayPaymentsController.fetchPaymentById(request.query).then(response =>{
        return  UniversalFunctions.successResponse(null, response)  ;   
    }).catch(error => {   //console.log("errr=====",error);
        return UniversalFunctions.sendError(error) ;  
    });
  },
  config: {
    description: 'Fetch Payment by ID',
    tags: ['api', 'Razorpay'],
    validate: {
      query: Joi.object({
        payment_id: Joi.string().trim().required(),
      }), 
      failAction: UniversalFunctions.failActionFunction,  
    },      
    plugins: {
      'hapi-swagger': {
          payloadType : 'form',
          responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages
      }
    }
  }
}


/*

[74.179020,30.389841],
[78.573552,30.805929],
[86.000310,25.063608],
[73.080388,22.611881],
[71.586247,26.606112],
[74.179020,30.389841],  



76.3762860641881,27.739843018855876 */



module.exports = [
  createCustomer,
  fetchCustomerById,
  editCustomer,
  capturePayment,
  fetchAllPayments,
  fetchPaymentById,
]