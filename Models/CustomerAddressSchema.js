/**
 * Created by Indersein on 23/01/2021.
 */

const Mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);
const Config = require("../Config");
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const GENDER_TYPES = APP_CONSTANTS.GENDER_TYPES;

const CustomerAddress = new Schema({
  customerId: { type: Schema.ObjectId, ref: "customer", required: true },
  address: { type: String, lowercase: true, trim: true },
  buildingAddress: { type: String, lowercase: true, trim: true },
  flatNumber: { type: String, lowercase: true, trim: true },
  landmark: { type: String, lowercase: true, trim: true },
  isDefault: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: "Point", default: "Point" },
    coordinates: { type: [Number] },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

CustomerAddress.plugin(AutoIncrement, { inc_field: "addressAutoIncrementId" });
module.exports = Mongoose.model("customerAdress", CustomerAddress);
