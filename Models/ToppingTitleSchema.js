const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const ToppingTitle = new Schema({
  title     :  {type: String, lowercase: true,trim: true},
  restaurant   :  {type: Schema.ObjectId, ref: 'restaurants'},
  menuId   :  {type: Schema.ObjectId, ref: 'restaurantMenu'},
  dishId   :  {type: Schema.ObjectId, ref: 'dishes'},
  maxItemSelection:{type: Number,default:0},
  necessaryItemSelection:{type: Number,default:0},
  toppingId: [{type: Schema.ObjectId, ref: 'toppingtitle'}],
  isVegetarian :  {type: Boolean, default: false},
  isDeleted    :  {type: Boolean, default: false},
  isChildExists: {type: Boolean, default: false},  
  createdAt    :  {type: Date, default: Date.now,required: true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});
ToppingTitle.plugin(AutoIncrement,{inc_field: 'toppingTitleAutoIncrementId'});
ToppingTitle.index({restaurant:1,menuId: 1,dishId:1,title: 1}, {unique: true});
module.exports = Mongoose.model('toppingtitle', ToppingTitle);