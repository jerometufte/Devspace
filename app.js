
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
	app.set("view engine", "hbs");
	app.set("view options", {layout: false});
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
 res.render('index', { title: 'index' })
});
app.get('/:page', function(req, res){
 var path = req.param('page')
 fs.stat('./views/' + path + '.hbs', function(err, stat){
		if (err) {
			res.render('404', { title: 'Page Not Found'})
		} else {
			res.render(req.param('page'), { title: req.param('page') })
		}
	});
});
app.get('/bubbles', function(req, res){
	res.render('bubbles', { title: 'bubbles' })
});
// Start server

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
