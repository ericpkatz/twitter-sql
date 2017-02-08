const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

let _client;
const connect = (cb)=> {
  if(_client)
    return cb(null, _client);
  client.connect((err, c)=> {
    if(!err){
      _client = client;
      return cb(null, _client);
    }
    cb(err);
  });
};

const createTweet = (name, content, cb)=> {
  connect( (err, client) => {
    if(err)
      return cb(err);
    findOrCreateUser(name, (err, id)=> {
      if(err)
        return cb(err);
      connect( (err, client)=> {
        client.query('insert into tweets (content, user_id) values ($1, $2) returning id', [ content, id ], (err, result) => {
          if(err)
            return cb(err);
          cb(null, result.rows[0].id);
        });
      });
    });
  });
};

const findOrCreateUser = (name, cb)=> {
  connect( (err, client) => {
    if(err)
      return cb(err);
    client.query('select * from users where name = $1', [name], (err, result)=> {
      if(err)
        return cb(err);
      if(result.rows.length)
        return cb(err, result.rows[0].id);

      client.query('insert into users (name) values ($1) returning id', [name], (err, result) => {
        if(err)
          return cb(err);
        if(!result.rows)
          return cb(new Error('user could not be created'));
        return cb(null, result.rows[0].id);
      });
    });
  });
};

const getTweets = (username, cb)=> {
  const params = [];
  let sql = 'select tweets.user_id, users.name, tweets.id, tweets.content from tweets join users on users.id = tweets.user_id';
  if(username){
    sql = `${sql} where users.name = $1`;
    params.push(username); 
  }
  connect( (err, client) => {
    if(err)
      return cb(err);
    client.query(sql, params, (err, result)=> {
      if(err)
        return cb(err);
      cb(null, result.rows);
    });
  });
};

const sync = (cb)=> {
  connect((err, client)=> {
    if(err){
      return cb(err);
    }
    const sql = `
      DROP TABLE IF EXISTS tweets;
      CREATE TABLE tweets (
          id serial primary key,
          content text,
          user_id integer
      );
      DROP TABLE IF EXISTS users;
      CREATE TABLE users (
          id serial primary key,
          name text
      );
    `;
    client.query(sql, (err, result)=> {
      if(err)
        return cb(err);
      return cb(null, result.rows);
    });
  });
};

module.exports = {
  sync,
  getTweets,
  createTweet
};
