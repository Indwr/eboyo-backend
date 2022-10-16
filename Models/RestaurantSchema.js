/**
 * Created by Indersein on 15/04/19.
 */

const { boolean } = require("joi");
const Mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);
const Config = require("../Config");
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES = APP_CONSTANTS.GENDER_TYPES;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const RESTAURANT_FOOD_TYPE = APP_CONSTANTS.RESTAURANT_FOOD_TYPE;

const Restaurant = new Schema({
  restaurantName: { type: String, lowercase: true, trim: true },
  parentId: { type: Schema.ObjectId, ref: "restaurants", index: true },
  email: {
    type: String,
    unique: true,
    trim: true,
    index: true,
    required: true,
    sparse: true,
    lowercase: true,
  },
  password: { type: String, trim: true },
  contactNumber: {
    type: String,
    trim: true,
    index: true,
    required: true,
    sparse: true,
  },
  cityId: { type: Schema.ObjectId, ref: "citytables", index: true },
  city: { type: String, trim: true, sparse: true },
  state: { type: String, trim: true, sparse: true },
  country: { type: String, trim: true, sparse: true },
  logo: {
    original: { type: String, default: null },
    thumbnail: { type: String, default: null },
  },
  location: {
    type: { type: String, enum: "Point", default: "Point" },
    coordinates: { type: [Number] },
  },
  fund_account_id: { type: String, trim: true },
  vendorFullAddress: { type: String, default: null },
  razorpayXData: { type: Object },
  minimumOrderAmount: { type: Number, default: null },
  costForTwoPerson: { type: Number, default: null },
  businessLicenceNumber: { type: String, default: null },

  restaurantFoodType: {
    type: String,
    enum: [
      RESTAURANT_FOOD_TYPE.All,
      RESTAURANT_FOOD_TYPE.PURE_VEG,
      RESTAURANT_FOOD_TYPE.NON_VEG,
      RESTAURANT_FOOD_TYPE.NOT_APPLICABLE,
    ],
    default: RESTAURANT_FOOD_TYPE.FIXED,
  },
  isOnline: { type: Boolean, default: false },
  isPickup: { type: Boolean, default: false },
  isDelivery: { type: Boolean, default: false },
  isSponsored: { type: Boolean, default: false },
  averageProcessingTime: { type: Number, default: 0 },

  deviceType: {
    type: String,
    enum: [APP_CONSTANTS.DEVICE_TYPES.IOS, APP_CONSTANTS.DEVICE_TYPES.ANDROID],
  },
  deviceToken: { type: String, trim: true, index: true, sparse: true },
  accessToken: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
  },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  passwordResetToken: { type: String, trim: true, index: true, sparse: true },
  otp: { type: String, trim: true },
  rating: {
    totalRating: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    noOfTimesRated: { type: Number, default: 0 },
  },
  totalOrder: { type: Number, default: 0 },
  locationName: { type: String },
  otpCode: { type: String, trim: true },

  category: { type: Array, ref: "category" },

  /********************/
  walletBalance: { type: Number, defalut: 0 },

  restaurantGstActivated: { type: Boolean, defalut: false }, // gst on item on/off
  restaurantGstPercentage: { type: Number, default: 0 }, // how much gst(%) on items
  adminCommssionType: {
    type: String,
    enum: [ADMIN_COMMISSION_TYPES.FIXED, ADMIN_COMMISSION_TYPES.PERCENTAGE],
    default: ADMIN_COMMISSION_TYPES.FIXED,
  },
  adminCommssion: { tyep: Number }, //Admin Commssion Earn by admin(including Gst)
  adminGstPercentage: { type: Number, default: 0 }, // Gst on admin commssion
});
Restaurant.plugin(AutoIncrement, { inc_field: "restaurantAutoIncrementId" });
Restaurant.index({ deliveryServiceArea: "2dsphere" });
module.exports = Mongoose.model("restaurant", Restaurant);
