/**
 * Created by Indersein on 12/07/21.
 */
const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const FrontEndSettings = new Schema({
  route: {type:String,index:true,trim:true},
  value:{type:Object},
  image:{type:String,default:null},
  isDeleted    : {type: Boolean, default: false},
  createdAt   : {type: Date, default: Date.now,required: true},
  updatedAt   : {type: Date, default: Date.now,required: true},
});
FrontEndSettings.plugin(AutoIncrement, {inc_field: 'frontEndSettingsAuoIncrement'});
module.exports = Mongoose.model('frontEndSettings', FrontEndSettings);