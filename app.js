const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
const date = require(__dirname + "/date.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to To-Do List!"
})
const item2 = new Item({
    name: "Click + to add new items"
})
const item3 = new Item({
    name: "<-- Hit this to delete items"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);





app.set('view engine', 'ejs');

var items = [];
var workItems = [];
//var item = "";
app.get("/", async function (req, res) {



    //var curDay = today.getDay();
    //var day = "";

    //    if (today.getDay() === 0 || today.getDay() === 6) {
    //     //res.sendFile(__dirname+"/weekend.html")
    //     day = "Weekend";

    //    } else {
    //     //res.sendFile(__dirname + "/weekdays.html")
    //     day = "Weekdays";
    //    }

    // if (curDay === 0) {
    //     day = "Sunday";

    // }
    // if (curDay === 1) {
    //     day = "Monday";

    // }
    // if (curDay === 2) {
    //     day = "Tuesday";

    // } if (curDay === 3) {
    //     day = "Wednesday";

    // }
    // if (curDay === 4) {
    //     day = "Thursday";

    // } if (curDay === 5) {
    //     day = "Friday";

    // } if (curDay === 6) {
    //     day = "Staurday";

    // }

    // Item.find({},function(err,foundItems){
    // let day = date.getDate();
    // res.render("list", { kindOfDay: day , newListItem : foundItems});    
    // })
    let day = date.getDate();

    await Item.find().then(foundItems => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved all item to the database");
            }).catch(function (err) {
                console.log(err);
            });


            res.redirect("/");
        }
        else {

            res.render("list", { kindOfDay: day, newListItem: foundItems })
        }

    });

});
//    let day = date.getDate();
//     res.render("list", { kindOfDay: day , newListItem : items});
//});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    //List.findOne({name:customListName}).exec();
    List.findOne({ name: customListName}).then(foundList=>{
        if(!foundList){
            //console.log("Does not exist");
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/");
        }
        else{
            //console.log("Exists!");
            res.render("list",{ kindOfDay: foundList.name, newListItem: foundList.items });
        }
    });
        
   
    
});

app.post("/", function (req, res) {
    //console.log(req.body);
    const itemName = req.body.newText;
    const listName = req.body.list;
    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{

    //     items.push(item);

    //     res.redirect("/");
    // }
    const item = new Item({
        name: itemName
    });
    let day = date.getDate();
    if(listName===day){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({ name: listName}).then(foundList=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
            
        });

    }
    
});

app.post("/delete", function (req, res) {
    checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === date.getDate()){
        Item.findByIdAndRemove(checkedItemId).then(function () {
            console.log("Successfully deleted the checked item");
        }).catch(function (err) {
            console.log(err);
        });
    
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(foundList=>{
            res.redirect("/" + listName);
        })
    }
    //console.log(checkedItemId);
    
});
app.get("/about", function (req, res) {
    res.render("about");
})

app.get("/work", function (req, res) {
    res.render("list", {
        kindOfDay: "Work List",
        newListItem: workItems
    });
});
app.post("/work", function (req, res) {
    let item = req.body.newText;
    workItems.push(item);
    res.redirect("/work");
})
app.listen(3000, function () {
    console.log("server started at port 3000");
})

