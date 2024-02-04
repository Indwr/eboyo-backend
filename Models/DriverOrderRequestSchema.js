const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;


const DrvierOrderRequestSchema = new Schema({
  orderId              :  {type: Schema.ObjectId, ref: 'orderTables',index:true},
  driverId             :  {type: Schema.ObjectId, ref: 'driver',index:true},
  status   :  {
    type: String, enum: [
      ORDER_STATUS.REJECTED_BY_DRIVER,
      ORDER_STATUS.ACCEPTED_BY_DRIVER,
      ORDER_STATUS.DRIVER_REQUEST_SEND,
    ],default: ORDER_STATUS.DRIVER_REQUEST_SEND
  },
  createdAt      : {type: Date, default: Date.now,required: true},
  updatedAt      : {type: Date, default: Date.now,required: true},
  acceptedDate   : {type: Date},
  rejectedDate   : {type: Date}, 
});
DrvierOrderRequestSchema.plugin(AutoIncrement, {inc_field: 'orderRequestAuoIncrement'});
DrvierOrderRequestSchema.plugin(mongooseAutopopulate);
DrvierOrderRequestSchema.index({orderId: 1,driverId:1}, {unique: true});
module.exports = Mongoose.model('driverOrderRequest', DrvierOrderRequestSchema);