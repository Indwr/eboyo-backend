const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const mongooseAutopopulate = require('mongoose-autopopulate');
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DRIVER_BONUS_TYPES    = APP_CONSTANTS.DRIVER_BONUS_TYPES;


const DrvierBonusSchema = new Schema({
  adminId               :  {type: Schema.ObjectId, ref: 'orderTables',index:true},
  decryption            :  {type:String},
  bonusAmount           :  {type:Number,default:0},
  minimumOrderCompleted :  {type:Number,default:0},
  bonusType             :  {
    type: String, enum: [
        DRIVER_BONUS_TYPES.DAILY,
        DRIVER_BONUS_TYPES.WEEKLY,
        DRIVER_BONUS_TYPES.MONTHLY,
        DRIVER_BONUS_TYPES.YEARLY,
    ],default: DRIVER_BONUS_TYPES.DAILY
  },
  isDeleted: {type: Boolean, default: false},
  createdAt      : {type: Date, default: Date.now,required: true},
  updatedAt      : {type: Date, default: Date.now,required: true},
 
});
DrvierBonusSchema.plugin(AutoIncrement, {inc_field: 'driverbonusAuoIncrement'});
DrvierBonusSchema.plugin(mongooseAutopopulate);
//DrvierBonusSchema.index({orderId: 1,driverId:1}, {unique: true});
module.exports = Mongoose.model('driverbonus', DrvierBonusSchema);