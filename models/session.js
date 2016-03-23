var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
    text: String,
    x: Number,
    y: Number,
    type: String
});

var CardsSessionSchema = new Schema({
    id: Number,
    name: String,
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    participants: [{
		user_id: {type:Schema.Types.ObjectId,ref: 'User'},
	    status: {type:String, default: 'P'}
	}],
    cards: [CardSchema]
});


/*
 * Add user_id as a pending participant on session_id
 */
CardsSessionSchema.methods.requestParticipation = function(user_id) {

	// Add the participant
	this.participants.push({user_id: user_id});
	return this.save();
}



var CardsSession = mongoose.model('CardsSession', CardsSessionSchema);
module.exports = CardsSession;
