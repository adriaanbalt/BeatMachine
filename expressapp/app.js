
/**
 * Module dependencies.
 */

var express = require('express');
var exphbs = require('express3-handlebars');
var sass = require("node-sass");
var routes = require('./routes');
var http = require('http');
var path = require('path');
var db = require('./db');
var rateLimiter = require('rate-limiter');

var rules = [

  ['/card/create', 'post', 5, 100, true],

  ['/card/:code/name', 'post', 5, 100, true]

];

db.getConnection(function(err, connection) {
  connection.query('CREATE DATABASE IF NOT EXISTS accounts', function (err) {
    if (err) throw err;
    connection.query('USE accounts', function (err) {
      if (err) throw err;
      connection.query('CREATE TABLE IF NOT EXISTS accounts('
        + 'id INT NOT NULL AUTO_INCREMENT,'
        + 'PRIMARY KEY(id),'
        + 'from_name VARCHAR(100),'
        + 'url_code VARCHAR(100) NOT NULL,'
        + 'message VARCHAR(2000) NOT NULL,'
        + 'UNIQUE(url_code)'
        +  ')', function (err) {
        if (err) throw err;
      });
      connection.release();
    });
  });
});

var app = express();
app.use(sass.middleware({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public/css'),
    prefix:  '/css',
    debug: true
}),express.static('/css',path.join(__dirname, '/public')) );

if ('production' == app.get('env')) {
  app.use(rateLimiter.expressMiddleware(rules));
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/create', routes.create);
app.get('/howto', routes.howto);
app.get('/account', routes.account);
// app.get('/preview', routes.preview);
// app.post('/:code/name', routes.name);
// app.get('/:code', routes.view);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
