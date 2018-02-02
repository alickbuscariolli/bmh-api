const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const connectionString = process.env.DATABASE_URL || 'postgres://alick:0A0D000B00@localhost:5432/bringmehome';
const cors = require('cors');
const jwt = require('jwt-simple');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//CORS to avoid ports conflict
router.use(cors({
  origin: 'http://localhost:8100',
  credentials: true
}));

//**** ITEM ****

//Post Item
router.post('/items', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {name: req.body.name, 
                description: req.body.description, 
                condition: req.body.condition, 
                pickuplocation: req.body.pickuplocation, 
                dayslisted: req.body.dayslisted, 
                picturepath: req.body.picturepath, 
                latitude: req.body.latitude, 
                longitude: req.body.longitude,
                user_id_fkey: req.body.user_id_fkey};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO items(name, description, condition, pickuplocation, dayslisted, picturepath, latitude, longitude, user_id_fkey) values($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [data.name, data.description, data.condition, data.pickuplocation, data.dayslisted, data.picturepath, data.latitude, data.longitude, data.user_id_fkey]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//Get Item
router.get('/items', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//Update Item
router.put('/items/:item_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.item_id;
  // Grab data from http request
  const data = {name: req.body.name, 
                description: req.body.description, 
                condition: req.body.condition, 
                pickuplocation: req.body.pickuplocation, 
                dayslisted: req.body.dayslisted, 
                picturepath: req.body.picturepath, 
                latitude: req.body.latitude, 
                longitude: req.body.longitude};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Update Data
    client.query('UPDATE items SET name=($1), description=($2), condition=($3), pickuplocation=($4), dayslisted=($5), picturepath=($6), latitude=($7), longitude=($8) WHERE id=($9)',
    [data.name, data.description, data.condition, data.pickuplocation, data.dayslisted, data.picturepath, data.latitude, data.longitude, id]);
    // SQL Query > Select Data
    const query = client.query("SELECT * FROM items ORDER BY id ASC");
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function() {
      done();
      return res.json(results);
    });
  });
});

//Delete Item
router.delete('/items/:item_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.item_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

//**** USER ****

//Login User
router.post('/login', (req, res, next) => {
  const results = [];
  const data = {email: req.body.email, 
                password: req.body.password};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query('SELECT * FROM users WHERE email=($1)',[data.email]);
    // Stream results back one row at a time
    // if (data.email !== query.user.email) {
    //   console.log(query);
    //   results.push({
    //     "code:": 204,
    //     "message": "Email not found"
    //   });
    // }

    query.on('row', (row) => {
      if (row.password == data.password) {
        results.push({
          "code": 200,
          "message": "Success logged in!",
          row});
          console.log(results);
      } else {
        results.push({
            "code":204,
            "message":"Wrong password!"
          }); 
      }
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      if (results.code == undefined) {
        results.push({
          "code": 205,
          "message": "Wrong email!"
        });
      }
      return res.json(results);
    });
  });
});

//Register User
router.post('/register', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {email: req.body.email, 
                password: req.body.password};
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO users(email, password) values($1, $2)',
    [data.email, data.password]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

// User Logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

//Get User Items
router.get('/user/items/:user_id', (req, res, next) => {
  const results = [];

  const id = req.params.user_id;
  
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    //const query =client.query('SELECT i.items, u.users FROM items i, users u WHERE i.user_id_fkey=($1)', [id]);
    const query = client.query('SELECT * FROM items i WHERE i.user_id_fkey=($1)', [id]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

module.exports = router;
