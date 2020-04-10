let express=require("express");
let mongodb=require("mongodb");
let sanitizeHTML= require("sanitize-html")

let App = express();
let db;

let port = process.env.PORT;
if(port=="" || port== null){
  port=3000;
}

App.use(express.static('public'))

let connectionString='mongodb+srv://todoAppUser:9089832282@cluster0-cea2d.mongodb.net/todoApp?retryWrites=true&w=majority';
mongodb.connect(connectionString, {useUnifiedTopology: true}, function(err, client){
    db=client.db();
    App.listen(port);
});


App.use(express.json())
App.use(express.urlencoded({extended: false}));

//Security
function passwordProtected(req,res,next){
    res.set('WWW-Authenticate', 'Basic realm="Dude I need to see some ID"')
    console.log(req.headers.authorization)
    if(req.headers.authorization=="Basic amF2YXNjcmlwdDpjcnVk"){
      next()
    } else {
      res.status(401).send("Authentication Required");
    }
}

// Add security to all requests
App.use(passwordProtected)


App.get('/', function(req,res){
    db.collection('items').find().toArray(function(err, items){

    res.send(`
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App!!!</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id='create-form' method="POST" action='/create-item'>
        <div class="d-flex align-items-center">
          <input id='create-field' name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id='item-list' class="list-group pb-5">
    
      
    </ul>
    
  </div>
  <script>
      let items = ${JSON.stringify(items)}
  </script>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src='/browser.js'></script>
</body>
</html>
`)
    })
})

App.post('/create-item',function(req,res){
  let safeText= sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: []
  })  
  db.collection('items').insertOne({text: safeText}, function(err, info){
      res.json(info.ops[0]);
    })
})

App.post('/update-item',function(req,res){
  let safeText= sanitizeHTML(req.body.text, {
    allowedTags: [],
    allowedAttributes: []
  })  
    db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)} , {$set: {text: safeText}} , function(){
        res.send("Success")
    })
})

App.post('/delete-item',function(req,res){
    db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)},function(){
      res.send("Success")
    })
})