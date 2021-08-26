const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const PAYMENT_TYPES   = APP_CONSTANTS.PAYMENT_TYPES;
const ORDER_STATUS    = APP_CONSTANTS.ORDER_STATUS;
const ORDER_TYPE      = APP_CONSTANTS.ORDER_TYPE;

const OrderSchema = new Schema({
  customerId     :  {type: Schema.ObjectId, ref: 'customer',index:true},
  restaurantId   :  {type: Schema.ObjectId, ref: 'restaurants',index:true},
  driverId       :  {type: Schema.ObjectId, ref: 'driver',index:true},
  
  address        :  {},
  itemTotalPrice     : {type: Number,index:true}, //Total Bill Any Distcount
  //dicountApplied     : {type: Number,default:0,index:true},
  //promoCodeId    :  {type: Schema.ObjectId, ref: 'promoCode'},
  
  orderType    :  {
    type: String, enum: [
      ORDER_TYPE.DELIVERY_SERVICE,
      ORDER_TYPE.PICK_UP_SERVICE,      
    ],default: ORDER_TYPE.DELIVERY_SERVICE
  },
  status         :  {
    type: String, enum: [
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.CANCELLED_BY_CUSTOMER, 
      ORDER_STATUS.CANCELLED_BY_RESTAURANT,
      ORDER_STATUS.CANCELLED_BY_RIDER,
      ORDER_STATUS.COOKED,  
      ORDER_STATUS.COMPLETED,  
      ORDER_STATUS.DELIVERED_BY_RIDER,
      ORDER_STATUS.PREPARING,  
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PICKED_BY_RIDER, 
      ORDER_STATUS.RIDER_REACHED_LOCATION,            
    ],default: ORDER_STATUS.PENDING
  },
  razorpayId: {type: String,unique : true,trim: true,index: true,  sparse: true},
  transactionData: {type: String},
  orderDetail    : [{type: Schema.ObjectId, ref: 'orderDetailTables'}],//orderDetail orderDeatil
  createdAt      : {type: Date, default: Date.now,required: true},
  updatedAt      : {type: Date, default: Date.now,required: true},
  reasonForRejection :{type: String},
  //restauranRating : {type: Boolean, default: false},
  // restauranRatingByCustomer: {
  //   rating: {type: Number},
  //   comment: {type: String},
  //   ratingGivenAt      : {type: Date},
  // },
  restaurantRating : {type: Boolean, default: false},
  restaurantRatingByCustomer: {
    rating: {type: Number},
    comment: {type: String},
    ratingGivenAt      : {type: Date},
  },
  carrierRatingByCustomer: {
    rating: {type: Number},
    comment: {type: String},
    ratingGivenAt      : {type: Date},
  },
  isTransactionSave          :  {type: Boolean, default: false},
  isdriverAssigned           :  {type: Boolean, default: false},
  driverRequestSendCount     :  {type: Number,default: 0},
  paymentStatus              :  {type: Boolean, default: false},
  carrierRating              :  {type: Boolean, default: false},
  acceptedDate               :  {type: Date},
  cancelledbyRestaurantDate  :  {type: Date}, 
  preparingDate              :  {type: Date},
  cookedDate                 :  {type: Date},
  completedDate              :  {type: Date},
  pickedByRiderDate          :  {type: Date},
  riderAssigneDate           :  {type: Date},
  orderDeliverdAt            :  {type: Date},
  orderPickedAt              :  {type: Date},
  isScheduleOrder            :  {type: Boolean, default: false},
  scheduleOrderDate          :  {type: Date,required: true},
  orderPreparationTime: {type: Number,default:0},
  paymentType    :  {
    type: String, enum: [
      PAYMENT_TYPES.ONLINE,
      PAYMENT_TYPES.CASH,      
    ]
  },
  

  totalPrice     : {type: Number,index:true},
  pricePaidByCustomer     : {type: Number,index:true},// Price Which Customer pay
  restaurantCommission     : {type: Number,index:true},
  
  adminCommission     : {type: Number,index:true},
  finalDistance     : {type: Number},
  totalTax     : {type: Number,index:true}, //restaurantTotalTax
  adminGstOnCommission  : {type: Number,index:true},


  /**********Delivery Charge************* */
  //driverCommission     : {type: Number,index:true},
  customerDeliveryCharge  : {type: Number,index:true},
  riderDeliveryCharge     : {type: Number,index:true},
  promoCodeDetails : {
    discountApplied    :  {type: Number,index:true},
    restaurantPartAmt  :  {type: Number,index:true},
    adminPartAmt       :  {type: Number,index:true},
    promoCodeId        :  {type: Schema.ObjectId, ref: 'promoCode',index:true},
  }
  

});
OrderSchema.plugin(AutoIncrement, {inc_field: 'orderAuoIncrement'});
OrderSchema.plugin(mongooseAutopopulate);
module.exports = Mongoose.model('orderTables', OrderSchema);