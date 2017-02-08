const expect = require('chai').expect;
const db = require('../db');

describe('creating tweets', ()=> {
  beforeEach((done)=> {
    db.sync((err)=> {
      if(err)
        return done(err);
      done()
    });
  });

  describe('an empty database', ()=> {
    it('there are no tweets', (done)=> {
      let tweets = [];
      db.getTweets((err, _tweets)=> {
        if(err)
          return done(err);
        tweets = _tweets;
        expect(tweets.length).to.equal(0);
        done();
      });
    });
    it('there are no users', (done)=> {
      let users = [];
      db.getUsers((err, _users)=> {
        if(err)
          return done(err);
        users = _users;
        expect(users.length).to.equal(0);
        done();
      });
    });
  });

  describe('a new user tweets', ()=> {
    let tweetId;
    beforeEach((done)=> {
      db.createTweet('prof', 'hi', (err, id)=> {
        if(err){
          done(err);
        }
        else {
          tweetId = id;
          done();
        }
      });
    });
    it('tweet can be created', ()=> {
      expect(tweetId).to.be.ok
    });
  });
});
