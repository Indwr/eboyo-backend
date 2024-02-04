/**
 * Created by Indersein on 12/04/21.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const NotificationText = new Schema({
  event :  {
    type: String, enum: [
      APP_CONSTANTS.ORDER_STATUS.ACCEPTED, 
      APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RESTAURANT,
      APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_CUSTOMER,    
      APP_CONSTANTS.ORDER_STATUS.CANCELLED_BY_RIDER,
      APP_CONSTANTS.ORDER_STATUS.COOKED,
      APP_CONSTANTS.ORDER_STATUS.COMPLETED,
      APP_CONSTANTS.ORDER_STATUS.DELIVERED_BY_RIDER,
      APP_CONSTANTS.ORDER_STATUS.PENDING,
      APP_CONSTANTS.ORDER_STATUS.PREPARING,
      APP_CONSTANTS.ORDER_STATUS.PICKED_BY_RIDER,
      APP_CONSTANTS.ORDER_STATUS.RIDER_REACHED_LOCATION,
      APP_CONSTANTS.ORDER_STATUS.REJECTED_BY_DRIVER,
      APP_CONSTANTS.ORDER_STATUS.ACCEPTED_BY_DRIVER,
      APP_CONSTANTS.ORDER_STATUS.DRIVER_REQUEST_SEND,
    ],default:  APP_CONSTANTS.ORDER_STATUS.ACCEPTED,
  },
  event_message: {type: String,trim: true},
  event_secondary_message: {type:String,trim:true},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
NotificationText.plugin(AutoIncrement, {inc_field: 'notificationTextAutoIncrementId'});
module.exports = Mongoose.model('notificationText', NotificationText);