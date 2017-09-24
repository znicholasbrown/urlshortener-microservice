(()=>{



'use strict';

var express = require('express');
var url = require('url');
var app = express();
var uri = "mongodb://znicholasbrown:Yn93Z1m8PhEQrLvf@ds159507.mlab.com:59507/urlshortener-microservice-db";
var MongoClient = require('mongodb').MongoClient;
app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
})

app.get("/new/*", (req, res) => {

  let urltest =/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

  if (!urltest.test(req.params[0])) {
    res.send("Please enter a valid URL");
  } else {
    MongoClient.connect(uri, (err, db) => {
    if (err) throw err;
    let query;
    let collection = db.collection("url-collection");

    let object = {};
    query = { original: req.params[0] };

    collection.findOne(query, (err, result)=> {
      if (err) throw err;

      if (result === null) {
        collection.count((err, count) => {
          object =  { original: req.params[0], shortened: req.headers.host + "/" + (count + 1000) }
          res.send(object);
          collection.insertOne(object, (err, succ) => {
            if (err) throw err;
            db.close();
          });

        });


      } else {
          object =  { original: result.original, shortened: result.shortened }
          res.send(object);
          db.close();
      }
    });
  })
  }



});

app.get(/\d+/, (req, res) => {
  MongoClient.connect(uri, (err, db) => {
  let collection = db.collection("url-collection");
  let query = { shortened: req.headers.host + req.url };
      collection.findOne(query, (err, result)=> {
        if (err) throw err;
        if (result === null) {
          db.close();
          res.redirect(req.headers.host);
        }
        else {
          db.close();
          res.redirect(result.original);
        }
      });
})
});

var listener = app.listen(process.env.PORT);


})();
