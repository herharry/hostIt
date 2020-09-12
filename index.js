var express = require('express')
const path = require("path");
var app = express()

app.use(express.static(__dirname + '/public'));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/views/index.html'));
})


app.get('/getalong', function (req, res) {
    res.sendFile(path.join(__dirname+'/views/register.html'));
})

app.listen(3000,()=>{console.log("servre running")});
