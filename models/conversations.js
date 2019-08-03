const mongoose = require('mongoose');
const CONFIG = require('../config')

var Schema = mongoose.Schema;


var ConversationSchema = new Schema( {
    messages: { type: Array},
    participants: {type: Array}
})

var Conversation = mongoose.model( "conversations", ConversationSchema )

module.exports =  Conversation;