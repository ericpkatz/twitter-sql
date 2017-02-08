const express = require('express');
const db = require('./db');
const swig = require('swig');
const bodyParser = require('body-parser');
const path = require('path');
swig.setDefaults({cache: false });

if(process.env.SYNC){
  db.sync((err)=> {
    if(err){
      console.log(err);
    }
  });
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'html');
app.engine('html', swig.renderFile);


app.get('/', (req, res, next)=> {
  db.getTweets(null, (err, tweets)=> {
    if(err)
      return next(err);
    res.render('index', { tweets: tweets });
  });
});

app.get('/:username', (req, res, next)=> {
  db.getTweets(req.params.username, (err, tweets)=> {
    if(err)
      return next(err);
    res.render('index', { tweets: tweets, name: tweets.length ? tweets[0].name : '' });
  });
});

app.post('/', (req, res, next)=> {
  db.createTweet(req.body.name, req.body.content, (err)=> {
    if(err)
      return next(err);
    res.redirect(`/${req.body.name}`);
  });
});

const port = process.env.PORT || 3000;

app.listen(port, ()=> console.log(`listening on port ${port}`));
