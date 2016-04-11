'use strict';

const mongoose = require('mongoose');
const express = require('express');
const Search = require('bing.search');
const db = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/imageSearch';
mongoose.connect(db);
require('./models/history.js');
const History = mongoose.model('History');

const app = express();

let port = (process.env.PORT || 5000);

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.set('port', port);

app.use(express.static(process.cwd() + '/public'));

app.get('/search', function(req, res){
	res.redirect('localhost:5000');
});

app.get('/search/:search', function(req, res){
	var query = req.params.search;
	var total = req.query.offset || 10;
	var time = new Date();
	const search = new Search(process.env.API_KEY);
	search.images(req.params.search, {top: total}, function(err, results){
		if(err){throw err};
		let newSearch = new History();
		newSearch.term = query;
		newSearch.when = time;
		newSearch.save(function(err, newSearch){
			if(err){return next(err);}
		});
		res.send(results.map(list))
	});
	var list = function(image){
		return {
			"url": image.url,
			"title": image.title,
			"thumbnail": image.thumbnail.url,
			"source": image.sourceUrl
		}
	}
})

app.get('/history', function(req, res){
	History.find(function(err, histories){
		if(err){return err};
		var recentHistory = [];
		var length = function(){
			if(histories.length <= 10){
				return 0
			}else{
				return histories.length - 10;
			}
		};
		for(var i = histories.length - 1; i>=length(); i--){
			recentHistory.push(histories[i])
		}
		res.send(recentHistory.map(listHistory));
	});
	var listHistory = function(db){
		return {
			'term': db.term,
			'when': db.when
		}
	};
});

app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + port);
});