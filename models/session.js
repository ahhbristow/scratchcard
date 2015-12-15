var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new mongoose.Schema({
    text: String,
    x: Number,
    y: Number,
    type: String
});

var CardsSessionSchema = new mongoose.Schema({
    id: Number,
    name: String,
    creator: Schema.Types.ObjectId,
    participants: [Schema.Types.ObjectId],
    cards: [CardSchema]
});

module.exports = mongoose.model('CardsSession', CardsSessionSchema);
