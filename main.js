const express = require('express')
const app = express()
const port = 3000

const authRoutes = require('./routes/auth-routes')
const profileRoutes = require('./routes/profile-routes')
const passportSetup= require('./config/passport-setup')
const keys = require('./config/keys')
const cookieSession = require('cookie-session')
const passport = require('passport')

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/body_info');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

//initialize passport
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');
//setup routes
app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}))


var body_infoSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  bmi: {type: Number, required: false},
});

var body_info = mongoose.model('body_info', body_infoSchema);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


db.once('open', function(){

  app.get('/', (req, res) =>{
    body_info.find({}, function(err, review){
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        res.render('index', {reviews: review})
      }
    });
  })

  app.get('/Result', (req, res) =>{
    body_info.find({}, function(err, review){
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        res.render('Result', {reviews: review})
      }
    });
  })

  app.get('/person-health-situation/new', (req, res) => {
    res.render('health-review-form', { title: "New Body Information", review: {} })
  });

  app.get('/person-health-situation/:id/update', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    body_info.findById(id, function(err, review) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (review === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('health-review-form', { title: "Update Review", review: review })
        }
      }
    });
  });

  app.post('/person-health-situation/new', function(req, res, next) {
    let newReview = new body_info(req.body);

    var w = newReview.weight;
    var h = newReview.height;
    newReview.bmi = (703 * w) / (h * h);

    newReview.save(function(err, savedReview){
      if (err) {
        console.log(err)
        res.render('health-review-form', {review: newReview, error: err})
      } else {
        res.redirect('/person-health-situation/' + savedReview.id);
      }
    });
  });

  app.get('/person-health-situation/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    body_info.findById({"_id": id}, function(err, review){
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        if (review === null) {
          res.render('error', { message: "Not found" })
        } else {
          res.render('health_review_detail', {review : review})
        }
      }
    });
  });

  app.post('/person-health-situation/:id/update', function(req, res, next) {
    let id = ObjectID.createFromHexString(req.params.id)

    body_info.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
      if (err) {
        console.log(err)
        res.render('error', {})
      } else {
        res.redirect('/person-health-situation/' + id);
      }
    });
  });

  app.post('/person-health-situation/:id/delete', function (req, res) {
    let id = ObjectID.createFromHexString(req.params.id)
    body_info.deleteOne({_id: id}, function(err, product) {
      res.redirect("/Result");
    });
  });



  app.post('/api/person-health-situation', (req, res) => {
    let newReview = new body_info(req.body)

    newReview.save(function(err, savedReview){
      if (err) {
        console.log(err)
        res.status(500).send("There was an internal error")
      } else {
        res.send(savedReview)
      }
    });
  });

  app.get('/api/person-health-situation', (req, res) => {

    body_info.find({}, function(err, reviews){
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        res.send(reviews)
      }
    });
  });

  app.get('/api/person-health-situation/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    body_info.find({"_id": id}, function(err, review){
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
        console.log(review)
        if (review === null) {
          res.status(404).send("Not found")
        } else {
          res.send(review)
        }
      }
    });
  });

  app.put('/api/person-health-situation/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)
    let newvalues = new body_info(req.body)

    body_info.updateOne({"_id": id}, newvalues, function(err, res) {
      if (err) {
        console.log(err)
        res.status(404).send("Can not Update")
      } else {
          res.status(204).send()
        }
    });
  });

  app.delete('/api/person-health-situation/:id', (req, res) => {
    let id = ObjectID.createFromHexString(req.params.id)

    body_info.deleteOne({"_id": id}, function(err) {
      if (err) {
        console.log(err)
        res.status(500).send("Internal server error")
      } else {
          res.status(204).send()
        }
    });
  });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
