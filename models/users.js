const mongoose = require('mongoose');
const CONFIG = require('../config')
//Make the connection with db throw mongoose
mongoose
	.connect(
		CONFIG.DB_ADDRESS, { useNewUrlParser: true, useCreateIndex: true },
	)
	.then(data => {
		console.log("Connected to DB")
	})
	.catch(err => {
		console.log(err);
	})
//Extract the constructor schema
var Schema = mongoose.Schema;

//Create the user with constrains
var UserSchema = new Schema( {
	username: { type: String, required: true, unique: true,  minlength: 3, maxlength: 50},
	email: { type: String, required: true, unique: true,  minlength: 3, maxlength: 50 },
	firstname: { type: String ,  minlength: 3, maxlength: 50},
	lastname: { type: String ,  minlength: 3, maxlength: 50},
	mail_confirm: { type: Boolean },
	password: { type: String, required: true , select: false,  minlength: 1, maxlength: 30},
	tel: { type: Number,  minlength: 6, maxlength: 15},
	photo: { type: String ,  minlength: 4, maxlength: 300},
	friends: { type: Array  },
	friends_requests: { type: Array  },
	requests_sent: { type: Array },
	last_activity: { type: Number},
	color: { type: String}
} )

//Add schema of collection in db
var User = mongoose.model("users", UserSchema);


//Export the user model
module.exports = User;