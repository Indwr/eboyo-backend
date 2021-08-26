const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const PromoCode = new Schema({
  promoCode   : {type: String, lowercase: true,trim: true,unique : true},
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true},
  description: {type: String},
  discountInPercentage: {type: Number,default:0},
  discountInAmount: {type: Number,default:0},
  cityId :  {type: Schema.ObjectId, ref: 'citytables',index:true},
  image: {
    original: {type: String, default: null},
    thumbnail: {type: String, default: null}
  },
  //maxUserCount: {type: Number,default:0},
  maxDiscountAmt: {type: Number},
  perCustomerUsage:{type: Number,default:1}, 
  maxRedeemedCount :{type: Number,default:1}, 
  minOrderAmt: {type: Number,default:0},
  maxOrderAmt: {type: Number},
  includeDeliveryCharges: {type: Boolean, default: false},
  restaurant:{type:Array, ref: 'restaurants'},
  customer:{type:Array, ref: 'customer'},
  isActive    : {type: Boolean, default: false},
  isDeleted   : {type: Boolean, default: false},
  createdAt   : {type: Date, default: Date.now,required: true},
  updatedAt   : {type: Date, default: Date.now,required: true},
  adminPercentage: {type: Number,required: true},
  restaurantPercentage: {type: Number,required: true},
});
PromoCode.plugin(AutoIncrement, {inc_field: 'promoCodeAuoIncrement'});
module.exports = Mongoose.model('promoCode', PromoCode);