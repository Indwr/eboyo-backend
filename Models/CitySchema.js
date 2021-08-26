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


const CitySchema = new Schema({
  cityName: {type: String, lowercase: true,trim: true,unique : true},
  stateName: {type: String, lowercase: true,trim: true},
  countryName: {type: String, lowercase: true,trim: true},
  customerDeliveryCharge: { // dispaly to Customer
    minimumDistance: {type: Number, default: 0},
		minimumPrice: {type: Number, default: 0},
    pricePerkm: {type: Number, default: 0},
  },
  riderDeliveryCharge: { //Dispaly to rider or driver
		minimumDistance: {type: Number, default: 0},
		minimumPrice: {type: Number, default: 0},
    pricePerkm: {type: Number, default: 0},
  },  
  adminId: {type: Schema.ObjectId, ref: 'admin',required: true},
  isDeleted: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
CitySchema.plugin(AutoIncrement, {inc_field: 'cityAutoIncrementId'});
module.exports = Mongoose.model('cityTable', CitySchema);