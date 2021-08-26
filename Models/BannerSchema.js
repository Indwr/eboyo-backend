const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const Banner = new Schema({
  bannerName   : {type: String,trim: true,},
  type: {
    type: String, enum: [
      APP_CONSTANTS.USER_ROLES.RESTAURANT,
      APP_CONSTANTS.USER_ROLES.DRIVER,
      APP_CONSTANTS.USER_ROLES.CUSTOMER,
    ],default: APP_CONSTANTS.USER_ROLES.CUSTOMER
  },
  vendorId:{type:Array},
  image: {
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
	},
  isEnabled    :  {type: Boolean, default: true},
  isDeleted    : {type: Boolean, default: false},
  createdAt   : {type: Date, default: Date.now,required: true},
  updatedAt   : {type: Date, default: Date.now,required: true},
});
Banner.plugin(AutoIncrement, {inc_field: 'bannerAuoIncrement'});
Banner.index({bannerName: 1,type:1}, {unique: true});
module.exports = Mongoose.model('banner', Banner);