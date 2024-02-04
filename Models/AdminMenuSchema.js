/**
 * Created by Indersein on 15/04/19.
 */

const Mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);
const Config = require("../Config");
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES = APP_CONSTANTS.GENDER_TYPES;
const ADMIN_COMMISSION_TYPES = APP_CONSTANTS.ADMIN_COMMISSION_TYPES;
const RESTAURANT_FOOD_TYPE = APP_CONSTANTS.RESTAURANT_FOOD_TYPE;

const RestaurantMenu = new Schema({
  menuName: { type: String, lowercase: true, trim: true },
  menuImage: {
    original: { type: String, default: null },
    thumbnail: { type: String, default: null },
  },
  adminId: { type: Schema.ObjectId, ref: "restaurant", required: true },
  availabilityStatus: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});
RestaurantMenu.plugin(AutoIncrement, { inc_field: "adminMenuAutoIncrementId" });
module.exports = Mongoose.model("adminMenu", RestaurantMenu);
