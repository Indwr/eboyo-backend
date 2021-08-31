const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const favourite = new Schema({
  userId : {type: Schema.ObjectId, ref: 'customers', required: true,index:true},
  type: {
    type: String, enum: [
      APP_CONSTANTS.USER_FAVOURITE_TYPES.RESTAURANT,
    ],default: APP_CONSTANTS.USER_FAVOURITE_TYPES.RESTAURANT
  },
  restaurantId: {type: Schema.ObjectId, ref: 'restaurant',required: true,index:true},
  isFavourite    :  {type: Boolean, default: true},
  isDeleted    : {type: Boolean, default: false},
  createdAt   : {type: Date, default: Date.now,required: true},
  updatedAt   : {type: Date, default: Date.now,required: true},
});
favourite.plugin(AutoIncrement, {inc_field: 'favouriteAuoIncrement'});
module.exports = Mongoose.model('favourite', favourite);