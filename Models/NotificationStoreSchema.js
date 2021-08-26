/**
 * Created by Indersein on 12/04/21.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const NotificationStore = new Schema({
  userType         :  {
    type: String, enum: [
      APP_CONSTANTS.USER_ROLES.CUSTOMER, 
      APP_CONSTANTS.USER_ROLES.DRIVER,
      APP_CONSTANTS.USER_ROLES.RESTAURANT        
    ],default:  APP_CONSTANTS.USER_ROLES.CUSTOMER,
  },
  //userId: {type: String,trim: true,index:true},
  userId: {type: Schema.ObjectId, ref: 'restaurants',index:true},
  orderId: {type: Schema.ObjectId, ref: 'orderTables',index:true},
  message: {type: String,trim: true},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
NotificationStore.plugin(AutoIncrement, {inc_field: 'notificationStoreAutoIncrementId'});
module.exports = Mongoose.model('notificationStore', NotificationStore);