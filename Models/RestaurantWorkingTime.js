const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES      =  APP_CONSTANTS.GENDER_TYPES;
const WORKING_DAYS      =  APP_CONSTANTS.WORKING_DAYS;

const RestaurantWorkingTime = new Schema({
    restaurant     :  {type: Schema.ObjectId, ref: 'restaurants',index:true},
    dayName: {
        type: String, enum: [
            WORKING_DAYS.MONDAY,
            WORKING_DAYS.TUESDAY, 
            WORKING_DAYS.WEDNESDAY,
            WORKING_DAYS.THURSDAY,
            WORKING_DAYS.FRIDAY, 
            WORKING_DAYS.SATURDAY,
            WORKING_DAYS.SUNDAY,       
        ]
    },
    isRestaurantOpenOrNot:{type:Boolean,default:true},
    startHour:{type:Number,default:0},
    startMinutes:{type:Number,default:0},
    endHour:{type:Number,default:23},
    endMinutes:{type:Number,default:59},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})
RestaurantWorkingTime.plugin(AutoIncrement, {inc_field: 'restaurantWTAutoIncrementId'});
RestaurantWorkingTime.index({dayName: 1,restaurant: 1}, {unique: true}); 
module.exports = Mongoose.model('restaurantWorkingTime', RestaurantWorkingTime);