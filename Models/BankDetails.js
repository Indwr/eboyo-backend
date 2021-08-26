const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const BankDetails = new Schema({
  userId   : {type: String,trim: true,index:true,unique: true},
  userType: {
    type: String, enum: [
      APP_CONSTANTS.USER_ROLES.RESTAURANT,
      APP_CONSTANTS.USER_ROLES.DRIVER,
      APP_CONSTANTS.USER_ROLES.CUSTOMER,
    ],default: APP_CONSTANTS.USER_ROLES.CUSTOMER
  },
  bankName     : {type:String,trim:true},
  branch       : {type:String,trim:true},
  ifscCode     : {type:String,trim:true},
  accountNumber: {type:String,trim:true},
  isEnabled    : {type: Boolean, default: true},
  isDeleted    : {type: Boolean, default: false},
  createdAt    : {type: Date, default: Date.now,required: true},
  updatedAt    : {type: Date, default: Date.now,required: true},
});
BankDetails.plugin(AutoIncrement, {inc_field: 'bankDetailsAuoIncrement'});
module.exports = Mongoose.model('bankDetails', BankDetails);