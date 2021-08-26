const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const USER_ROLES      = APP_CONSTANTS.USER_ROLES;

const Logs = new Schema({
  userId : {type:String,trim:true},
  userType         :  {
    type: String, enum: [
      USER_ROLES.CUSTOMER, 
      USER_ROLES.DRIVER,
      USER_ROLES.RESTAURANT,
      USER_ROLES.ADMIN,      
    ],default:  USER_ROLES.ADMIN,
  },
  eventType    :  {
    type: String, enum: [
      APP_CONSTANTS.EVENT_TYPE.LOGIN, 
      APP_CONSTANTS.EVENT_TYPE.LOGOUT, 
    ]
  },
  platform     :   {type: String,trim: true},
  browser         :  {type: String,trim: true},
  ip_address    :  {type: String, trim: false},
  raw           : {type:Object,trim:true},
  createdAt    :  {type: Date, default: Date.now,required: true,index:true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});

Logs.plugin(AutoIncrement,{inc_field: 'logAutoIncrementId'});
Logs.index({userType: 1});
Logs.index({userId: 1});
module.exports = Mongoose.model('logs', Logs);