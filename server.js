

var bodyParser = require("body-parser");
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
// Requiring our Note and Content models
var Note = require("./models/Note.js");
var Content = require("./models/Content.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
var logger = require("morgan");
var port = process.env.PORT || 8080;

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();


// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_2hhfs4d3:rivio64jbr9nkmhnkt83afsdgk@ds143132.mlab.com:43132/heroku_2hhfs4d3");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function (error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function () {
  console.log("Mongoose connection successful.");
});


// Routes
// ======
app.get("/", function (req, res) {
  res.redirect("/scrape");
});


// A GET request to scrape the echojs website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  request("http://www.medicalnewstoday.com/categories/dentistry", function (error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    console.log(html);
    // Now, we grab every h2 within an Content tag, and do the following:
    $(".writtens_bottom li").each(function (i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").children(".headline").text();
      result.link = "http://www.medicalnewstoday.com" + $(this).children("a").attr("href");
      result.date = $(this).children("a").children(".story_metadata").children(".story_date").text();

      console.log(result);
      // Using our Content model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Content(result);

      // Now, save that entry to the db
      entry.save(function (err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });
    });
  });
  res.redirect("/Contents")
});

// This will get the Contents we scraped from the mongoDB
app.get("/Contents", function (req, res) {
  // Grab every doc in the Contents array
  Content.find({}, function (error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var hbsObject = {
        content: doc
      };
      return res.render("index", hbsObject);
    }
  });
});

app.get("/Contents/Raw", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Content.find({}, function (error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an Content by it's ObjectId
app.get("/Contents/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Content.findOne({ "_id": req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    // now, execute our query
    .exec(function (error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
});


// Create a new note or replace an existing note
app.post("/Contents/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function (error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the Content id to find and update it's note
      Content.findOneAndUpdate({ "_id": req.params.id }, { "notes": doc._id })
        // Execute the above query
        .exec(function (err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            // Or send the document to the browser
            res.send(doc);
          }
        });
    }
  });
});

app.listen(port, function () {
  console.log("App running on port 5500!");
});