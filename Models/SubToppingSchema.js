const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;

const ToppingItem = new Schema({
  toppingName     :  {type: String, lowercase: true,trim: true,index:true},
  price        :  {type: Number},
  
  restaurant     :  {type: Schema.ObjectId, ref: 'restaurants',index:true},
  menuId         :  {type: Schema.ObjectId, ref: 'restaurantMenu',index:true},
  dishId         :  {type: Schema.ObjectId, ref: 'dishes',index:true},
  //titleId        :  {type: Schema.ObjectId, ref: 'dishes'},
  toppingTitleId :  {type: Schema.ObjectId, ref: 'toppingtitle',index:true},
  toppingId      :  {type: Schema.ObjectId, ref: 'topping',index:true},
  isDefault :  {type: Boolean, default: false}, 
  isVegetarian :  {type: Boolean, default: false},
  isDeleted    :  {type: Boolean, default: false},
  isEnabled    :  {type: Boolean, default: true},
  createdAt    :  {type: Date, default: Date.now,required: true},
  updatedAt    :  {type: Date, default: Date.now,required: true},
});
ToppingItem.plugin(AutoIncrement,{inc_field: 'toppingItemId'});
ToppingItem.index({menucardId: 1,dishId:1,toppingTitleId:1,toppingId:1,toppingName:1}, {unique: true});  


Mongoose.set('debug', false);
module.exports = Mongoose.model('subtopping', ToppingItem);

ToppingItem.on('index', function(err) {
  if (err) {
      console.error('User index error: %s', err);
  } else {
      console.info('User indexing complete');
  }
});