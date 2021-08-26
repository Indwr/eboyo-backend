/**
 * Created by Indersein on 24/04/2021.
 */

 const Mongoose = require('mongoose');
 const AutoIncrement = require('mongoose-sequence')(Mongoose);
 const Config = require('../Config');
 const Schema = Mongoose.Schema;
 const APP_CONSTANTS = Config.APP_CONSTANTS;
 
 const Authentication = new Schema({
   email: {type: String, lowercase: true,trim: true,index:true},
   expireAt: { type: Date, expires: 600, default: Date.now },
   token: {type:String,index:true},
   userType: {
     type: String, enum: [
       APP_CONSTANTS.USER_ROLES.ADMIN,
       APP_CONSTANTS.USER_ROLES.SUB_ADMIN,
       APP_CONSTANTS.USER_ROLES.CUSTOMER,
       APP_CONSTANTS.USER_ROLES.DRIVER,
     ],default: APP_CONSTANTS.USER_ROLES.DRIVER,index: true, required: true
   },
   createdAt: {type: Date, default: Date.now,required: true},
   updatedAt: {type: Date, default: Date.now,required: true},
 });

 Authentication.plugin(AutoIncrement, {inc_field: 'authenticationAutoIncrementId'});
 module.exports = Mongoose.model('authentication', Authentication);