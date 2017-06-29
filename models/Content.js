// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ContentSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: false
  },
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "Note"
  }]
});

// Create the Article model with the ArticleSchema
var Content = mongoose.model("Content", ContentSchema);

// Export the model
module.exports = Content;
