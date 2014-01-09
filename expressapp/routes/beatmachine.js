var log = require('../log');
var db = require('../db');

var env = (process.env.NODE_ENV || "development").toLowerCase();

exports.createForm = function(req, res){
  log.debug('Displaying create form.');
  res.render('createForm');
  log.debug('Done displaying create form.');
};

exports.preview = function(req, res){
  log.debug('Displaying preview.');
  res.send({
    beat_name: null,
    url_code: "00000",
    beat_track: null,
    production : env=="production"
  });
  log.debug('Done displaying preview.');
};

function makeCode()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.create = function(req, res){
  log.debug('Creating beat. beat_track=['+req.body.beat_track+']');
  var sql = "INSERT INTO beats.beats (url_code, beat_track) VALUES (?,?)"; 
  db.getConnection(function(err, connection) {
    var newCode = makeCode();
    log.debug('Url code = '+newCode);
    connection.query(sql,[
        newCode,
        req.body.beat_track
      ], function(err, result) {
        connection.release();
        if (err) {
          throw err;
           log.error("err: " + err);
        } 
        res.send({ newCode : newCode, status : true });
        log.debug('Done creating beat.');
      }
    );
  });
};

exports.name = function(req, res){
  log.debug('Updating beat with name. beat_name=['+req.body.beat_name+'] url_code=['+req.body.url_code+']');
  var sql = "UPDATE beats.beats SET beat_name = ? WHERE url_code = ?";
  db.getConnection(function(err, connection) {
    connection.query(sql,[
        req.body.beat_name,
        req.body.url_code
      ], function(err, result) {
        connection.release();
        if (err) {
          throw err;
           log.error("err: " + err);
        } 
        res.send({ status : true });
        log.debug('Done naming beat.');
      }
    );
  });
};

exports.view = function(req, res){
  var sql = "SELECT beat_name, url_code, beat_track FROM beats.beats WHERE url_code = ?";
  db.getConnection(function(err, connection) {
    connection.query(sql,[req.params.code],function(err,rows) {
        if(rows && rows[0]) {
          context = {
            'beat_name' : rows[0].beat_name,
            'url_code' : rows[0].url_code,
            'beat_track' : rows[0].beat_track,
            'env' : process.env.NODE_ENV
          };
        } else {
          context = {};
        }
        res.render('home', context);
      }
    );
    connection.release();
  });
};
