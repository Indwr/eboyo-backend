const Mongoose = require('mongoose');
const mongooseAutopopulate = require('mongoose-autopopulate');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;
const ORDER_TYPE      = APP_CONSTANTS.ORDER_TYPE;

const SubTopping = new Schema({
  subToppingId:  {type: Schema.ObjectId, ref: 'topping',index:true},
  subToppingPrice:{type: Number,index:true},
})

const ToppingSchema = new Schema({
  toppingId:  {type: Schema.ObjectId, ref: 'topping',index:true,autopopulate: { select: 'toppingName _id'}},
  toppingPrice:{type: Number,index:true},
  toppingTitleId :  {type: Schema.ObjectId, ref: 'toppingtitle',index:true,required: true},
  SubTopping:[SubTopping],
})

const OrderSchema = new Schema({
  orderId     :  {type: Schema.ObjectId, ref: 'orderTables',index:true},
  customerId     :  {type: Schema.ObjectId, ref: 'customer',index:true},
  restaurantId   :  {type: Schema.ObjectId, ref: 'restaurants',index:true},
  itemPrice      : {type: Number,index:true},
  itemTotalPrice : {type: Number,index:true},
  menuId: {type: Schema.ObjectId, ref: 'menu',required: true,index:true,autopopulate: { select: 'menuName _id'}},
  dishId         :  {type: Schema.ObjectId, ref: 'dishes',index:true,autopopulate: { select: 'itemName _id image' }},
  ToppingData    : [ToppingSchema],//
  quantity            : {type: Number},  // Added By Indersein / 05/07/2021
  //SubTopping    : [{type: Schema.ObjectId, ref: 'toppingitems'}],
  

});
OrderSchema.plugin(AutoIncrement, {inc_field: 'orderDetailAuoIncrement'});
OrderSchema.plugin(mongooseAutopopulate);
module.exports = Mongoose.model('orderDetailTables', OrderSchema);