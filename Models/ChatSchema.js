/**
 * Created by Anurag on 13/04/2020.
 */

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(Mongoose);
const Config = require('../Config');
const Schema = Mongoose.Schema;
const APP_CONSTANTS = Config.APP_CONSTANTS;
const RIDE_STATUS   = APP_CONSTANTS.RIDE_STATUS

const ChatSchema  = new Schema({
	textMessage        : {type: String, lowercase: true,trim: true},
    senderId           : {type: Schema.ObjectId, ref: 'customers', required: true},
    receiverId         : {type: Schema.ObjectId, ref: 'customers', required: true},
    imageURL: {
        original: {type: String, default: null},
        thumbnail: {type: String, default: null}
    },
    videoURL: {type: String, default: null},
    isDeleted: {type: Boolean, default: false},
    isRead: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now,required: true},
    updatedAt: {type: Date, default: Date.now,required: true},
})

ChatSchema.plugin(AutoIncrement, {inc_field: 'messageAutoIncrementId'});
module.exports = Mongoose.model('chat', ChatSchema);