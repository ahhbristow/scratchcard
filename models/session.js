var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
    text: String,
    x: Number,
    y: Number,
    type: String
});

var ParticipantSchema = new Schema({
	user_id: {type:Schema.Types.ObjectId,ref: 'User'},
    status: {type:String, default: 'P'}
});


var CardsSessionSchema = new Schema({
    id: Number,
    name: String,
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    participants: [ParticipantSchema],
    cards: [CardSchema]
});

/*
 * Add user_id as a pending participant on session_id
 */
CardsSessionSchema.methods.requestParticipation = function(user_id) {

	// TODO: Can this be done in Mongoose?
	// Seems daft to need it here
	if (this.getParticipant(user_id) == null) {
		// Add the participant
		console.log("User has not already requested participation, requesting");
		this.participants.push({user_id: user_id});
	}

	// TODO: Saving even if we did nothing is inefficient
	return this.save();
}

/*
 * Add user_id as a pending participant on session_id
 */
CardsSessionSchema.methods.approveParticipant = function(user_id) {

	// Find the participant and set their status to A
	for (var i = 0; i < this.participants.length; i++) {
		var participant = this.participants[i];

		console.log("Checking " + participant.user_id._id + " against " + user_id);

		if (participant.user_id._id == user_id) {
			console.log("User " + user_id + " approved for session " + this._id);
			participant.status = 'A';
			break;
		}
	}

	// TODO: Don't do this if nothing was changed
	return this.save();
}

/*
 *
 */
CardsSessionSchema.methods.getParticipant = function(user_id) {
	for (var i = 0; i < this.participants.length; i++) {
		var participant = this.participants[i];

		console.log("Checking " + participant.user_id._id + " against " + user_id);
		if (participant.user_id._id.equals(user_id)) {
			console.log("Match found");
			// We have a match
			return participant;
		}
	}
	return null;
}

/*
 *
 */
CardsSessionSchema.methods.accessibleBy = function(user) {

	if (this.creator.equals(user._id)) {
		return 1;
	}

	var participant = this.getParticipant(user._id);
	if (participant != null && participant.status == 'A') {
		return 1;
	} else {
		return 0;
	}
}

/*
 * Check if the user supplied has already requested
 * permission to view this session
 *
 */
CardsSessionSchema.methods.hasPending = function(user) {
	var participant = this.getParticipant(user._id);
	console.log(participant);
	if (participant == null) {
		console.log("Permission has not already been requested");
		return 0;
	}

	console.log("User status: " + participant.status);
	if (participant.status == 'P') {
		return 1;
	} else {
		return 0;
	}
}


var CardsSession = mongoose.model('CardsSession', CardsSessionSchema);
module.exports = CardsSession;
