const Config = require("../Config");
const UniversalFunctions = require("../Utils/UniversalFunctions");
const Service = require("../Services");
const axios    =  require('axios').default;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const RAZORPAY_CREDENTAILS = APP_CONSTANTS.RAZORPAY_KEYS_DETAILS;
const RUPAY_TO_PAISE = APP_CONSTANTS.RUPAY_TO_PAISE;
const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;


let createContact = async (payloadData) => {
  let name  = payloadData.name;
  let email = payloadData.email;
  let contact = payloadData.contact;
  let type = payloadData.type;
  try{
    var data = JSON.stringify({
      "name": name,
      "email": email,
      "contact": contact,
      "type": type,
    });
    
    var config = {
      method: 'post',
      url: APP_CONSTANTS.RAZORPAY_X_BASE_URL.URL+'contacts',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic cnpwX3Rlc3RfNjVYY2lqd1pzdXhJR3I6Vnhhd0kyZVdTbzlIMGtyakNqMWp4WVFU'
      },
      data : data
    };
    
   let finalResponse = await axios(config).then(function (response) {
     return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
    let dataToSet;
    // console.log(finalResponse);
    // console.log(payloadData.userType)
    if(payloadData.userType == APP_CONSTANTS.USER_ROLES.RESTAURANT){
      let criteria = {_id:payloadData.name};
      dataToSet = {
        razorpayXData:{
          contact_id:finalResponse.id,
          account_type:'bank_account',
          bank_account: {
            name: payloadData.userName,
            ifsc: payloadData.ifscCode,
            account_number: payloadData.accountNumber
          }
        }
      };
      Service.RestaurantService.updateData(criteria,dataToSet,{ lean: true})
    }
    if(payloadData.userType == APP_CONSTANTS.USER_ROLES.DRIVER){
      let criteria = {_id:payloadData.name};
      dataToSet = {
        razorpayXData:{
          contact_id:finalResponse.id,
          account_type:'bank_account',
          bank_account: {
            name: payloadData.userName,
            ifsc: payloadData.ifscCode,
            account_number: payloadData.accountNumber
          }
        }
      };
      Service.DriverService.updateData(criteria,dataToSet,{ lean: true})
    }
  
    let createFundResponse = await createFundAccountBankAccount(dataToSet);
    // console.log(createFundResponse)
    if(payloadData.userType == APP_CONSTANTS.USER_ROLES.RESTAURANT){
      let criteria22 = {_id:payloadData.name};
      let dataToSet22 = {fund_account_id:createFundResponse.id};
      Service.RestaurantService.updateData(criteria22,dataToSet22,{ lean: true})
    }
    if(payloadData.userType == APP_CONSTANTS.USER_ROLES.DRIVER){
      let criteria22 = {_id:payloadData.name};
      let dataToSet22 = {fund_account_id:createFundResponse.id};
      Service.DriverService.updateData(criteria22,dataToSet22,{ lean: true})
    }
  return finalResponse;
  }catch(err){
   return err; //throw err;
  } 
};

let fetchAllContacts = async (payloadData) => {
  try{
    var data = '';
    var config = {
      method: 'get',
      url: APP_CONSTANTS.RAZORPAY_X_BASE_URL.URL+'contacts',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic cnpwX3Rlc3RfNjVYY2lqd1pzdXhJR3I6Vnhhd0kyZVdTbzlIMGtyakNqMWp4WVFU'
      },
      data : data
    };
    
    let finalResponse = axios(config).then(function (response) {
      return response.data;
    }).catch(function (error) {
      console.log(error);
    });
    
  return finalResponse;
  }catch(err){
   return err; //throw err;
  } 
};

let createFundAccountBankAccount = async (payloadData) => {
    try{
      
      // let contact_id = payloadData.contact_id;
      // let account_type = payloadData.account_type;
      // let name = payloadData.name;
      // let ifsc = payloadData.ifsc;
      // let account_number = payloadData.account_number;

      // var data = JSON.stringify({
      //   "contact_id": contact_id,
      //   "account_type": account_type,
      //   "bank_account": {
      //     "name": name,
      //     "ifsc": ifsc,
      //     "account_number": account_number
      //   }
      // });
   

      // let data2 = JSON.stringify(payloadData.razorpayXData);
      // console.log(payloadData.razorpayXData);
      let data = JSON.stringify(payloadData.razorpayXData);

  var config = {
    method: 'post',
    url: APP_CONSTANTS.RAZORPAY_X_BASE_URL.URL+'fund_accounts',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Basic cnpwX3Rlc3RfNjVYY2lqd1pzdXhJR3I6Vnhhd0kyZVdTbzlIMGtyakNqMWp4WVFU'
    },
    data : data
  };

    let finalResponse = await axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return error;
    });
    console.log(finalResponse)
    return finalResponse;
    }catch(err){
      return err; //throw err;
    } 
};

let createPayout = async (payloadData) => {
  try{
    var data = JSON.stringify({
      "account_number": APP_CONSTANTS.RAZORPAY_X_KEYS_DETAILS.ACCOUNT_NUMBER,
      "fund_account_id": payloadData.fund_account_id,
      "amount": payloadData.amount,
      "currency": APP_CONSTANTS.CURRENCY.INR,
      "mode": APP_CONSTANTS.PAYMENT_MODE.IMPS,
      "purpose": 'payout',
      // "queue_if_low_balance": payloadData.queue_if_low_balance,
      // "reference_id": payloadData.reference_id,
      // "narration": payloadData.narration,
    });
    var config = {
      method: 'post',
      url: APP_CONSTANTS.RAZORPAY_X_BASE_URL.URL+'payouts',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic cnpwX3Rlc3RfNjVYY2lqd1pzdXhJR3I6Vnhhd0kyZVdTbzlIMGtyakNqMWp4WVFU'
      },
      data : data
    };
   
    let finalResponse = await axios(config).then(function (response) {
      return response.data;
    }).catch(function (error) {
      console.log(error);
    });
    
  return finalResponse;
  }catch(err){
   return err; //throw err;
  } 
};

module.exports = {
  fetchAllContacts:fetchAllContacts,
  createContact:createContact,
  createFundAccountBankAccount:createFundAccountBankAccount,
  createPayout:createPayout,
};
