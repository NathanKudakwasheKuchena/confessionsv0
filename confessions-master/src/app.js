const express = require('express');
const bodyParser= require('body-parser')
const path = require('path')
const hbs = require('hbs')
const consolidate = require('consolidate')
const moment = require('moment')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId


const app = express();
const port = process.env.PORT


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.engine('ejs', consolidate.ejs);
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)


// Setup static directory to serve
app.use(express.static(publicDirectoryPath))


let connectionURL = process.env.MONGODB_URL
let databaseName = 'confessionsdatabase'


MongoClient.connect(connectionURL, { useUnifiedTopology: true }, (err, client) => {
  if (err) return console.log(err)
  const db = client.db(databaseName)


  app.post('/created-posts', (req, res) => {
    const timestamp = moment().format('LLL')
    req.body.created = timestamp
    db.collection('posts').insertOne(req.body, (err, result) => {
      if (err) return console.log(err)
      res.redirect('/')
    })
  })


  app.get('/', (req, res) => {
    db.collection('posts').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('index.ejs', {posts:result})
    })
  })


  app.get('/created-posts/:id', (req, res) => {
    db.collection('posts').findOne({ "_id": ObjectId(req.params.id)}, function (err, post){
      if (err) return console.log(err)
      res.render('single-post.ejs', {post:post})
    })
  })


  app.post('/do-comment', function(req, res){
    db.collection('posts').updateOne({ "_id": ObjectId(req.body.post_id)}, {
      $push: {
        "comments": {name: req.body.name, comment: req.body.comment}
      }
    }, function(err, post){
      res.redirect('back')
    })
  })

  app.listen(port, () => {
    console.log('listening on ' + port)
  })
})


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())


app.get('/create-post', (req, res) => {
    res.render("create-post")
})




