const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const RestaurantServiceArea = new Schema({
    cityId      : {type: Schema.ObjectId, ref: 'cityTable', required: true},
    locationName: {type: String,index:true},
    deliveryServiceArea: {
        'type': {type: String, enum: "Polygon", default: "Polygon"},//LineString //Polygon
        coordinates: {type:Array}
    },
    restaurant: [{type: Schema.ObjectId, ref: 'restaurant'}],
    createdAt      : {type: Date, default: Date.now,required: true},
    updatedAt      : {type: Date, default: Date.now,required: true},
})
RestaurantServiceArea.plugin(AutoIncrement, {inc_field: 'adminServiceAreaAutoIncrementId'});
//RestaurantServiceArea.index({locationName: "text"});
RestaurantServiceArea.index({'deliveryServiceArea': "2dsphere"});  
module.exports = Mongoose.model('restaurantServiceArea', RestaurantServiceArea);