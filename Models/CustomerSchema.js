/**
 * Created by Anurag on 15/04/19.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;

const Customer = new Schema({
  firstName: {type: String, lowercase: true,trim: true},
  lastName: {type: String, lowercase: true,trim: true},
  countryCode: {type: String, required: true, trim: true, min:2, max:5},
  mobileNumber: {type: String, required: true, trim: true, index: true, unique: true, min: 5, max: 15},    
  email: {type: String,unique : true,trim: true,index: true,sparse: true, lowercase: true},
  password: {type: String,trim: true},
  otpCode: {type: String, trim: true,sparse: true, index: true},
  profilePicURL: {
    original: {type: String, default: null},
    thumbnail: {type: String, default: null}
  },
  rating:{
    totalRating: {type: Number, default: 0},
    averageRating: {type: Number, default: 0},
    noOfTimesRated: {type: Number, default: 0},
  },
  // averageRating: {type: Number, default: 0},
  // totalRating: {type: Number, default: 0},
  // ratingPersonNo: {type: Number, default: 0},
  nationality:{type: String,default:null},
  emailVerified: {type: Boolean, default: false},
  mobileVerified: {type: Boolean, default: false},
  googleId: {type: String,unique : true,trim: true,index:true,sparse:true},
  facebookId: {type: String,unique:true,trim: true,index:true,sparse:true},  
  deviceType: {
    type: String, enum: [
      APP_CONSTANTS.DEVICE_TYPES.IOS,
      APP_CONSTANTS.DEVICE_TYPES.ANDROID,       
    ]
  },
  deviceToken: {type:String,trim: true,index:true,sparse: true},
  accessToken: {type:String,trim: true,index:true,unique:true,sparse:true},
  isDeleted: {type:Boolean,default:false},
  isBlocked: {type: Boolean,default:false},
  createdAt: {type:Date,default:Date.now},
  updatedAt: {type:Date,default:Date.now},
  passwordResetToken: {type: String, trim: true,index: true, sparse: true},
});
Customer.plugin(AutoIncrement, {inc_field: 'custermerAutoIncrementId'});
module.exports = Mongoose.model('customer', Customer);