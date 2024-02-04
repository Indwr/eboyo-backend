const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const Driver = new Schema({
  fullName: {type: String, lowercase: true, trim: true},
  email: {type: String,unique : true,index: true,lowercase: true,trim: true,required: true},
  password: {type: String, trim: true},
  phoneNo: {type: String, required: true, trim: true, index: true,min: 5, max: 15},
  phoneVerified:{type: Boolean, default: false},
  currentLocation: {
    'type': {type: String, enum: "Point", default: "Point"},
    coordinates: {type: [Number]}
  },
  cityId :  {type: Schema.ObjectId, ref: 'citytables',index:true}, 
  otpCode: {type: String, trim: true,sparse: true},
  walletBalance: {type: Number, trim: true,defalut:0},
  profilePicURL: {
    original: {type: String, default: null},
    thumbnail: {type: String, default: null}
  },
  drivingLicense:{
    docFileUrl: {type: String,},
    createdAt: {type: Date},
    Isverified: {type: Boolean},
  },
  adharcardDoc:{
    docFileUrl: {type: String},
    createdAt: {type: Date,},
    Isverified: {type: Boolean},
  },
  otherDocuments:[{
    docTitle:{type: String},
    docFileUrl: {type: String},
    createdAt: {type: Date,},
    Isverified: {type: Boolean},
  }],
  rating:{
    totalRating: {type: Number, default: 0},
    averageRating: {type: Number, default: 0},
    noOfTimesRated: {type: Number, default: 0},
  },
  deviceType: {
    type: String, enum: [
      Config.APP_CONSTANTS.DEVICE_TYPES.IOS,
      Config.APP_CONSTANTS.DEVICE_TYPES.ANDROID,
    ]
  },
  razorpayXData: {type:Object},
  fund_account_id: {type:String,trim:true},
  deviceToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  passwordResetToken: {type: String, trim: true,index: true, sparse: true},
  Isverified: {type: Boolean, default: false},
  verifiedAt: {type: Date},

  IsBlocked: {type: Boolean, default: false},
  lastLoginAt: {type: Date},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},  
  IsBusy: {type: Boolean, default: false},
  Islogin: {type: Boolean, default: false},
  blockDate: {type: Date, default: Date.now,required: true},
  
  totalDistanceTraveled: {type: Number, default: 0},
});
Driver.index( { currentLocation : "2dsphere" } )
Driver.plugin(AutoIncrement, {inc_field: 'driverNumber'});
module.exports = Mongoose.model('driver', Driver);