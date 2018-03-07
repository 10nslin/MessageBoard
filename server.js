const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//Mongo connection
mongoose.connect('mongodb://localhost/messageDash_db');
mongoose.Promise = global.Promise;

//Schema and Models
const Schema = mongoose.Schema;
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2},
    message:{ type: String, required: true, minlength: 4},
    comments:[{type: Schema.Types.ObjectId, ref: 'Comment'}]
   },{timestamps: true});

const CommentSchema = new mongoose.Schema({
    _message: [{type: Schema.Types.ObjectId, ref: 'Message'}],
    name: { type: String, required: true, minlength: 2},
    comment:[{type: String}]
   },{timestamps: true});

    mongoose.model('Message', MessageSchema); 
    mongoose.model('Comment', CommentSchema);

    const Message = mongoose.model('Message');
    const Comment = mongoose.model('Comment');

// Routes
app.get('/',function(req,res){
    Message.find({}).populate('comments').exec(function(err,results){
        if(err){res.send(err);}
        else{res.render('index',{data:results});}
    });
})
app.post('/add', function(req, res) {
    var message = new Message({
        name: req.body.name, 
        message: req.body.message
    });
    message.save(function(err,results){
        if(err){console.log("Something went wrong...", err)}
        else{
            console.log(results);
            res.redirect('/');
        }
    })
    
});

app.post('/comment/:id',function(req,res){
    Message.findOne({_id:req.params.id},function(err,post){   
        var newComment = new Comment({      
            name: req.body.commentName, 
            comment: req.body.comment,
            _message: post._id
        });
        newComment.save(function(err){
            post.comments.push(newComment);
            post.save(function(err){
            if(err){
            console.log("error adding comment", error)
            }else{    
            console.log("comment added", post)
                res.redirect('/')
            }
        })
    })
    })
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})