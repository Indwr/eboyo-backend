const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const Settings = new Schema({
  type: {
    type: String, enum: [
      APP_CONSTANTS.SETTINGS_TYPE.BUSSINESS_AVAILABILITY,
      APP_CONSTANTS.SETTINGS_TYPE.BUSSINESS_HOURS, 
      APP_CONSTANTS.SETTINGS_TYPE.SERVER_KEYS,
      APP_CONSTANTS.SETTINGS_TYPE.DELIVERY_PERSONS,
      APP_CONSTANTS.SETTINGS_TYPE.APP_VERSIONS,
      APP_CONSTANTS.SETTINGS_TYPE.SMS_KEYS,
      APP_CONSTANTS.SETTINGS_TYPE.PANEL_THEMES,
    ],default: APP_CONSTANTS.SETTINGS_TYPE.BUSSINESS_AVAILABILITY
  },
  value:{type:Object},
  isDeleted    : {type: Boolean, default: false},
  createdAt   : {type: Date, default: Date.now,required: true},
  updatedAt   : {type: Date, default: Date.now,required: true},
});
Settings.plugin(AutoIncrement, {inc_field: 'settingsAuoIncrement'});
module.exports = Mongoose.model('settings', Settings);