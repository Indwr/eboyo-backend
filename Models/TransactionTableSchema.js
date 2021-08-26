/**
 * Created by Anurag on 25/02/2021.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const RESTAURANT_FOOD_TYPE  = APP_CONSTANTS.RESTAURANT_FOOD_TYPE
const TRANSACTION_TYPES  = APP_CONSTANTS.TRANSACTION_TYPES
const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;


const TransactionTableSchema = new Schema({
  customerId: {type: Schema.ObjectId, ref: 'driver'},
  driverId: {type: Schema.ObjectId, ref: 'driver'},
  orderId      :  {type: Schema.ObjectId, ref: 'orderTables'},
  restaurantId :  {type: Schema.ObjectId, ref: 'orderTables'},
  transactionMethod: {type: String,trim: true},
  status: {type: String, default: false},
  transactionType         :  {
    type: String, enum: [
      TRANSACTION_TYPES.DRIVER_ADD_MONEY_TO_RAZORPAY,    
      TRANSACTION_TYPES.ORDER_CREATE_RAZORPAY,   
      TRANSACTION_TYPES.ORDER_TRANSACTION,
      TRANSACTION_TYPES.SUBMIT_WITHDRAW_FROM_DRIVER,
      TRANSACTION_TYPES.SUBMIT_WITHDRAW_FROM_RESTAURANTS,
    ],default: TRANSACTION_TYPES.DRIVER_ADD_MONEY_TO_RAZORPAY
  },
  paymentType    :  {
    type: String, enum: [
      PAYMENT_TYPES.RAZORPAY,
      PAYMENT_TYPES.CASH,      
    ]
  },  
  transactionRespons:{type: Object},
  cardId:{type: String},
  upiTransactionId:{type: String},
  wallet:{type: String},
  totalAmount:{type:Number,default:0},
  adminCommission:{type:Number,default:0},
  driverCommission:{type:Number,default:0},
  restaurantCommission:{type:Number,default:0},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},

});
TransactionTableSchema.plugin(AutoIncrement, {inc_field: 'transactionIncrementId'});
module.exports = Mongoose.model('transactionTable', TransactionTableSchema);