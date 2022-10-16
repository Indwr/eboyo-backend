/**
 * Created by Indersein on 15/04/19.
 */

const Mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(Mongoose);
const Config = require("../Config");
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;

const Notification = new Schema({
  sendTo: { type: String, index: true },
  title: { type: String, trim: true },
  message: { type: String, trim: true },
  type: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});
Notification.plugin(AutoIncrement, {
  inc_field: "notificationAutoIncrementId",
});
module.exports = Mongoose.model("notification", Notification);
