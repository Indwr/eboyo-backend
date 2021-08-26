/**
 * Created by Anurag on 15/04/19.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const RESTAURANT_FOOD_TYPE  = APP_CONSTANTS.RESTAURANT_FOOD_TYPE


const RestaurantMenu = new Schema({
  menuName: {type: String, lowercase: true,trim: true,index:true},
  //menuNameSecondaryLangauge: {type: String, lowercase: true,trim: true},
  menuImage: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
  },
  adminMenuId: {type: Schema.ObjectId, ref: 'restaurant',required: true,index:true,sparse:true},
  restaurant: {type: Schema.ObjectId, ref: 'restaurant',required: true,index:true},
  availabilityStatus:{type:Boolean,default:false},
  isDeleted: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
RestaurantMenu.plugin(AutoIncrement, {inc_field: 'menuAutoIncrementId'});
RestaurantMenu.index({menuName: 1,adminMenuId:1, restaurant: 1}, {unique: true});
module.exports = Mongoose.model('menu', RestaurantMenu);