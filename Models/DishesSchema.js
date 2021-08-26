const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const MenuItem = new Schema({
  itemName: {type: String, lowercase: true,trim: true},
  price   : {type: Number},
  description : {type: String, lowercase: true, trim: true},
  maxQuantity : {type: Number,default: 0},
  restaurant: {type: Schema.ObjectId, ref: 'restaurant',required: true,index:true},
  menuId: {type: Schema.ObjectId, ref: 'restaurantMenu',required: true,index:true},
  image:[{
		original: {type: String, default: null},
		thumbnail: {type: String, default: null}
  }],
  toppingTitleId: [{type: Schema.ObjectId, ref: 'topping'}],
  toppingIsAdded: {type: Boolean, default: false},
  isVegetarian: {type: Boolean, default: true},
  availabilityStatus:{type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false}, 
  isChildExists: {type: Boolean, default: false},  
  
  createdAt: {type: Date, default: Date.now,required: true},
  updatedAt: {type: Date, default: Date.now,required: true},
});
MenuItem.plugin(AutoIncrement,{inc_field: 'dishesAutoIncrementId'});
MenuItem.index({itemName: 1,menuId:1, restaurant: 1}, {unique: true});
module.exports = Mongoose.model('dishes', MenuItem);