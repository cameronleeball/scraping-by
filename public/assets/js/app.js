

// Whenever someone clicks a p tag
$(document).on("click",".article",function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/contents/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {

      function notesPane() {
      $("#notes").append("<h2>" + data.title + "</h2>",);
      $("#notes").append("<input id='titleinput' name='title' placeholder='Note Title'>",);
      $("#notes").append("<input id='authorinput' name='author' placeholder='Your Name'>",);
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Bacon ipsum dolor amet prosciutto leberkas kevin, beef ribs ball tip turkey turducken andouille strip steak pig. Beef ribs andouille landjaeger, pig cupim bresaola porchetta rump tenderloin jowl meatball brisket. Bacon kielbasa kevin, meatball pork chop ball tip sausage. Ribeye pancetta ham hock pastrami kielbasa. Pancetta beef ribs bacon, fatback pork loin turducken frankfurter brisket picanha.'></textarea>",);
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      };
      console.log(data);
      // The title of the article
     
      // If there's a note in the article
      if (data.notes) {
        var ranNote = _.sample(data.notes);
        // Place the title of the note in the title input
        $("#titleinput").val(ranNote.title);
        // Place the body of the note in the body textarea
        $("#authorinput").val(ranNote.author);
        $("#bodyinput").val(ranNote.body);         
      });
      };
    });
});
// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/contents/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      author: $("#authorinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#authorinput").val("");
  $("#bodyinput").val("");
});
