const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunctions");
const Razorpay = require("razorpay");

const APP_CONSTANTS = Config.APP_CONSTANTS;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const RAZORPAY_CREDENTAILS = APP_CONSTANTS.RAZORPAY_KEYS_DETAILS;
const RUPAY_TO_PAISE = APP_CONSTANTS.RUPAY_TO_PAISE;
const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_CREDENTAILS.KEY_ID,
  key_secret: RAZORPAY_CREDENTAILS.KEY_SECRET,
});

let createCustomer = async (payloadData) => {
  let name  = payloadData.name;
  let email = payloadData.email;
  let contact = payloadData.contact;
  let notes = payloadData.notes;
  try{
  let customerData=await razorpayInstance.customers.create({name, email, contact, notes})
  return customerData;
  }catch(err){
   throw STATUS_MSG.ERROR.CUSTOMER_ALREADY_EXISTS; //throw err;
  } 
};

let editCustomer = async (payloadData) => {
  let customer_id = payloadData.customer_id;
  let name  = payloadData.name;
  let email = payloadData.email;
  let contact = payloadData.contact;
  try{
    let customerData= await razorpayInstance.customers.edit(customer_id, {name, email, contact})
    return customerData;
  }catch(err){
    throw STATUS_MSG.ERROR.INVALID_CUSTOMER_ID; //throw err;
  } 
};

let fetchCustomerById = async (payloadData) => {
 let customer_id = payloadData.customer_id;
  try{
    let fetchCustomerById = await razorpayInstance.customers.fetch(customer_id);
    return fetchCustomerById;
  }catch(err){
    throw STATUS_MSG.ERROR.CUSTOMER_NOT_FOUND;
  } 
};




let capturePayment = async (payloadData) => {
  // The currency of the payment (defaults to INR)
  // The amount to be captured (should be equal to the authorized amount, in paise)
  try{
    let finalData={};
    let capturedResponse = await razorpayInstance.payments.capture(payloadData.transaction_id,RUPAY_TO_PAISE * payloadData.amount,payloadData.currency ? payloadData.currency : "");
    if(capturedResponse.id){
      finalData.transactionId=capturedResponse.id;
      finalData.status="success";
    }
    finalData.transactionStatus = capturedResponse.status;
    finalData.paymentType = PAYMENT_TYPES.RAZORPAY;
    if(capturedResponse.method=="upi"){
      finalData.transactionMethod = capturedResponse.method;
      if(capturedResponse.acquirer_data && capturedResponse.acquirer_data.upi_transaction_id){
        finalData.upiTransactionId=capturedResponse.acquirer_data.upi_transaction_id
      }
    }else if(capturedResponse.method=="card"){
      finalData.transactionMethod = capturedResponse.method;
      if(capturedResponse.card && capturedResponse.card.id){
        //finalData.upiTransactionId=capturedResponse.acquirer_data.upi_transaction_id
        finalData.cardId=capturedResponse.card.id
      }   
    }else if(capturedResponse.method=="wallet"){
      finalData.transactionMethod = capturedResponse.method;
      if(capturedResponse.wallet){
        //finalData.upiTransactionId=capturedResponse.acquirer_data.upi_transaction_id
        finalData.wallet=capturedResponse.wallet;
      }   
    }
    //finalData.razorpayRespons = JSON.stringify(capturedResponse);
    finalData.transactionRespons = JSON.stringify(capturedResponse);
    return finalData;
  }catch(error){ //console.log("capturePayment========error",error.error);
    let setError = error;
    setError.customMessage= error.error.description;
    console.log("capturePayment========error",setError);
    throw setError;
  } 
};




let fetchAllPayments = async (payloadData) => {
 let from = payloadData.from;
 let to = payloadData.to;
 let count = payloadData.count;
 let skip = payloadData.skip;
  try{
    let capturedResponse = await razorpayInstance.payments.all({from, to, count, skip});
    return capturedResponse;
  }catch(err){
    throw STATUS_MSG.ERROR.PAYMENTS_NOT_FOUND;
  } 
};

let fetchPaymentById = async (payloadData) => {
 let payment_id = payloadData.payment_id;
  try{
    let fetchPaymentById = await razorpayInstance.payments.fetch(payment_id);
    return fetchPaymentById;
  }catch(err){
    throw STATUS_MSG.ERROR.PAYMENT_ID_NOT_FOUND;
  } 
};




module.exports = {
  capturePayment: capturePayment,
  createCustomer:createCustomer,
  editCustomer:editCustomer,
  fetchAllPayments:fetchAllPayments,
  fetchCustomerById:fetchCustomerById,
  fetchPaymentById:fetchPaymentById,
};
