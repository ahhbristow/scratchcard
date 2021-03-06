var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
	text: String,
	x: Number,
	y: Number,
	z: Number,
	type: String
});

var ParticipantSchema = new Schema({
	user_id: {type:mongoose.Schema.Types.ObjectId,ref: 'User'},
	status: {type:String, default: 'P'}
});


var CardsSessionSchema = new Schema({
	id: Number,
	name: String,
	creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	participants: [ParticipantSchema],
	cards: [CardSchema],
	max_z: {type: Number, default: 0}
},{
	usePushEach: true
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

CardsSessionSchema.methods.findCard = function(id) {
	for (var i = 0; i < this.cards.length; i++) {             
		var card = this.cards[i];
		if (card._id == id) {                                       
			return card;
		}               
	}                                                                   
}
CardsSessionSchema.methods.getIndexOf = function(id) {
	for (var i = 0; i < this.cards.length; i++) {             
		var card = this.cards[i];
		if (card._id == id) {                                       
			return i;
		}
	}
	return -1;
}

CardsSessionSchema.methods.migrate = function() {
	this.max_z = 0;
	for (var i = 0; i < this.cards.length; i++) {
		this.cards[i].z = i;
	}
}

// =============================================
// Static methods

// Wrapper function to hide Mongoose specific call
// from caller
CardsSessionSchema.statics.getSession = function(session_id) {
	return CardsSession.findById(session_id)
		.populate('participants.user_id creator')
		.exec()
		.then(function(session) {
			// Check if it needs migrating
			if (typeof session.max_z == 'undefined') {
				session.migrate();
			}
			
			return session;
		});
}


var CardsSession = mongoose.model('CardsSession', CardsSessionSchema);
module.exports = CardsSession;
