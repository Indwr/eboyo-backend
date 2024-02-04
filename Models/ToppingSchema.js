const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const ToppingItem = new Schema({
  toppingName       :  {type: String, lowercase: true,trim: true,index:true},
  price          :  {type: Number},
  restaurant     :  {type: Schema.ObjectId, ref: 'restaurants',index:true},
  menuId         :  {type: Schema.ObjectId, ref: 'restaurantMenu'},
  dishId         :  {type: Schema.ObjectId, ref: 'dishes',index:true},

  //titleId        :  {type: Schema.ObjectId, ref: 'toppingtitle'},
  toppingTitleId :  {type: Schema.ObjectId, ref: 'toppingtitle'}, //Dupilicted

  subToppingId   : [{type: Schema.ObjectId, ref: 'subtopping'}],
  isVegetarian :  {type: Boolean, default: false},
  isDefault :  {type: Boolean, default: false},
  isDeleted    :  {type: Boolean, default: false},
  isEnabled    :  {type: Boolean, default: true},
  isChildExists: {type: Boolean, default: false}, 
  createdAt    :  {type: Date, default: Date.now,required: true,index:true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});

ToppingItem.plugin(AutoIncrement,{inc_field: 'toppingAutoIncrementId'});
ToppingItem.index({restaurant:1,menuId:1,dishId:1,toppingTitleId:1,toppingName: 1}, {unique: true});
module.exports = Mongoose.model('topping', ToppingItem);
