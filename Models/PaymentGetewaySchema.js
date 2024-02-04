/**
 * Created by Indersein on 12/04/21.
 */
const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const PaymenetGateways = new Schema({
  gateWay: {type: String,trim: true,index:true},
  secretKey: {type: String,trim: true},
  publicKey: {type:String,trim:true},
  accountNumber: {type:String,trim:true},
  isEnabled    :  {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
PaymenetGateways.plugin(AutoIncrement, {inc_field: 'paymenetGatewayAutoIncrementId'});
module.exports = Mongoose.model('paymentGateway', PaymenetGateways);