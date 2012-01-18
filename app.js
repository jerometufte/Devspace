
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
	app.set("view engine", "hbs");
	app.set("view options", {layout: false});
  // app.use(express.bodyParser());
  // app.use(express.methodOverride());
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
	res.render('index', { title: 'Express' })
});
app.get('/test', function(req, res){
	res.render('test', { title: 'test' })
});
app.get('/pageable', function(req, res){
	res.render('pageable', { title: 'pageable' })
});
app.get('/peelable', function(req, res){
	res.render('peelable', { title: 'peelable' })
});
app.get('/bubbles', function(req, res){
	res.render('bubbles', { title: 'bubbles' })
});
// Start server

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
