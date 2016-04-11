const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
	term: String,
	when: String
});

mongoose.model('History', HistorySchema);