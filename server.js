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
const MONGOLAB_URI =
  "mongodb://freecodecamp:Testing123@mycluster-wx9sp.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(MONGOLAB_URI, { useNewUrlParser: true }, function(error) {
  if (error) console.log(error);

  console.log("connection successful");
});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(process.cwd() + "/public"));

var Schema = mongoose.Schema;

let UrlCollectionSchema = new Schema({
  url: String,
  id: Number
});
let UrlCollection = mongoose.model("UrlCollection", UrlCollectionSchema);

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", function(req, res) {
  let url = req.body.url;

  console.log(url);
  
  const newUrl = new UrlCollection({ url: url, id: 1 });
  newUrl.save(function(err, model) {
    //if (err) return err;
    // saved!
    //res.json(model);
  });

  res.json(newUrl);
});

app.get("api/shorturl/:id", function(req, res) {
  let id = req.params.id;
  UrlCollectionSchema.find({ id: id }, function(err, model) {
    if (err) {
      res.json({ error: "ID Not found" });
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
