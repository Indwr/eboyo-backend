const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;

const CuisineItem = new Schema({
  cuisineName     :   {type: String,trim: true,required: true},
  isDeleted    :  {type: Boolean, default: false},
  isEnabled    :  {type: Boolean, default: true},
  createdAt    :  {type: Date, default: Date.now,required: true,index:true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});

CuisineItem.plugin(AutoIncrement,{inc_field: 'cuisineAutoIncrementId'});
CuisineItem.index({userType: 1});
module.exports = Mongoose.model('cuisine', CuisineItem);