"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED
};

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
const MLAB_URI =
  "mongodb://freecodecamp:Testing123@mycluster-shard-00-00-wx9sp.mongodb.net:27017,mycluster-shard-00-01-wx9sp.mongodb.net:27017,mycluster-shard-00-02-wx9sp.mongodb.net:27017/test?ssl=true&replicaSet=MyCluster-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(MLAB_URI, { useNewUrlParser: true });

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/public", express.static(process.cwd() + "/public"));

let UrlCollection = mongoose.model("UrlCollection", {
  url: String,
  id: Number
});

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", function(req, res) {
  let url = req.body.url;

  if (url === undefined) {
    res.json({ error: "URL must be provided." });
    return;
  }

  try {
    url = new URL({ toString: () => url });
  } catch (e) {
    return res.json({ error: "invalid URL" });
  }

  console.log(url.hostname);

  UrlCollection.count({}, function(err, count) {
    if (err) return res.json(err);

    const newUrl = new UrlCollection({ url: url, id: ++count });

    newUrl.save(function(err, model) {
      if (err) return res.json(err);

      res.json(model);
    });
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  let id = req.params.id;
  UrlCollection.findOne({ id: parseInt(id) }, function(err, model) {
    if (err) {
      res.json({ error: "No short url found for given input" });
    } else {
      res.redirect(model.url);
    }
  });
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
