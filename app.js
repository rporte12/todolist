//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://porter662:v0DYVlxRG3QDjPy1@cluster0.lp2krm2.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function(req, res) {



  const items = Item.find({})
    .then((items) => {
      console.log(items);

      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(function() {
            console.log('Saved all items to todolistDB');
          })
          .catch(function(err) {
            console.log(err);
          });
        res.redirect("/");

      } else {

        res.render("list", {
          listTitle: "Today",
          newListItems: items
        });
      }
    });


});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
      name: customListName
    })
    .then(function(foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save().then(function() {
          console.log("Saved");
          res.redirect("/" + customListName);
        });

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })
    .catch(function(err) {});


})






app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  let listName = req.body.list;
  if (listName) {
    listName = listName.trim();
  }

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

  }



});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox.trim();
  let checkedList = req.body.listName.trim();


  if (checkedList === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function(items) {
      Item.deleteOne({
        _id: checkedItemId
      })
    })
    res.redirect("/");


  } else {

    List.findOneAndUpdate({
      name: checkedList
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }).then(function(foundList) {
      res.redirect("/" + checkedList);
    });


  }



});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
