const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const USER_ROLES      = APP_CONSTANTS.USER_ROLES;

const FaqItem = new Schema({
  userType         :  {
    type: String, enum: [
      USER_ROLES.CUSTOMER, 
      USER_ROLES.DRIVER,
      USER_ROLES.RESTAURANT        
    ],default:  USER_ROLES.CUSTOMER,
  },
  question     :   {type: String,trim: true},
  answer         :  {type: String,trim: true},
  isDeleted    :  {type: Boolean, default: false},
  isEnabled    :  {type: Boolean, default: true},
  createdAt    :  {type: Date, default: Date.now,required: true,index:true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});

FaqItem.plugin(AutoIncrement,{inc_field: 'faqAutoIncrementId'});
FaqItem.index({userType: 1});
module.exports = Mongoose.model('faq', FaqItem);