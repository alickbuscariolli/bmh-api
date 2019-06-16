const express = require('express');
const router = express.Router();
const app = express();
const pg = require('pg');
const path = require('path');
const connectionString = 'postgres://postgres:Aligao123@localhost:5432/bmhc9';
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

const MIME_TYPE_MAP = { 
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "../backend/images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

// Random secret key
app.set('secret', 'dq89"#wud_981h3-du2h3d37a3A_SD_!#E_"#dsd');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BMH API' });
});

// //CORS to avoid ports conflict
// router.use(cors({
//   origin: 'http://192.168.0.17:8100',
//   credentials: true
// }));

// //CORS to avoid ports conflict
// router.use(cors({
//   origin: 'http://122.106.20.157:8100',
//   credentials: true
// }));

// //CORS to avoid ports conflict
// router.use(cors({
//   origin: 'http://localhost:8100',
//   credentials: true
// }));

//CORS to avoid ports conflict
router.use(cors({
  origin: '*',
  credentials: true
}));

//**** ITEM ****

//Post Item
router.post('/items', multer(storage).single("image"), (req, res, next) => {
      const results = [];
      // Grab data from http request
      const data = {name: req.body.name,
                    description: req.body.description,
                    condition: req.body.condition,
                    pickuplocation: req.body.pickuplocation,
                    itemdeletedate: req.body.itemdeletedate,
                    picturepath: req.body.picturepath,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    itemdonator: req.body.itemdonator,
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
        client.query('INSERT INTO items(name, description, condition, pickuplocation, itemcreatedate, itemdeletedate, picturepath, latitude, longitude, itemdonator, user_id_fkey) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [data.name, data.description, data.condition, data.pickuplocation, new Date(), data.itemdeletedate, data.picturepath, data.latitude, data.longitude, data.itemdonator, data.user_id_fkey]);
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM items ORDER BY id ASC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.json({message: 'The item was added!', results});
        });
      });

});

//Get Items
router.get('/items', verifyToken, (req, res, next) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus({"code":403, "message": "Forbidden"});
    } else {
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
        const query = client.query('SELECT * FROM items WHERE itemdeletedate > $1 ORDER BY id ASC;', [new Date()]);
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.json({ Message: 'List of Items', results, authData });
        });
      });
    }
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
    client.query('UPDATE items SET name=($1), description=($2), condition=($3), pickuplocation=($4), picturepath=($5), latitude=($6), longitude=($7) WHERE id=($8)',
    [data.name, data.description, data.condition, data.pickuplocation, data.picturepath, data.latitude, data.longitude, id]);
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

//Report item

router.post('/item/reports/:item_id', (req, res, next) => {
  const results = [];
  const id = req.params.item_id;

  const data = {reports: req.body.reports};

  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('INSERT INTO itemreports(reports, item_id_fkey, created_at) VALUES ($1,$2, $3)', [data.reports, id, new Date()]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM itemreports ORDER BY id ASC');
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

//Post Item Reports Number
router.post('/item/reports/count/:item_id', (req, res, next) => {
  const results = [];
  const id = req.params.item_id;
  const reportNumber = [];
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    //const query = client.query('SELECT items.*, count(reportitem.id) as reports FROM items inner join reporitems on items.id = reportsitens.itemid  group by items.id ORDER BY id ASC');

    const query1 = client.query('SELECT COUNT(reports) FROM itemreports WHERE item_id_fkey=($1)', [id]);
    query1.on('row', (row) => {
      reportNumber.push(Number(row.count));
      console.log(reportNumber[0]);
      const query2 = client.query('UPDATE items SET reports=($1) WHERE id=($2)', [reportNumber[0], id]);
    query2.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query2.on('end', () => {
      done();
      return res.json(results);
    });
    });
    // After all data is returned, close connection and return results
    query1.on('end', () => {
      done();
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
    query.on('row', (row) => {
      if (validPassword(data.password, row.password)) {
        const user = {
          id: row.id,
          email: row.email
        }
        console.log("User id: ", user.id, " User Email: ", user.email);
        jwt.sign({row}, 'secretkey', (err, token) => {
          results.push({
            "code": 200,
            "message": "Success logged in!",
            token: "Bearer " + token
          });
            console.log(results);
        });
      } else if (row.password != data.password) {
        results.push({
            "code":204,
            "message":"Wrong password!"
          });
          //res.status(401).json({code: 204, error: 'Invalid email or password'});
      }
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      console.log(results[0]);
      if (results[0] == undefined) {
        console.log('entrou');
        results.push({
          "code": 205,
          "message": "Wrong email!"
        });
      }
      return res.json(results);
    });
  });
});

//User Session
router.get('/session', (req, res) => {
  let auth =  req.headers.authorization;

  if(!auth || !auth.startsWith('Bearer')) {
    return res.status(401).json({ error: 'JWT session is missing'});
  } else {
    auth = auth.split('Bearer').pop().trim();
  }

  jwt.verify(auth, 'secretkey', (err, data) => {
    if (err) {
      return res.status(401).json({code: 207, error: "Invalid session"});
    }
    res.send(data);
  });

  console.log(auth);
});

//Token Format
//Authorization: Bearer <access_token>

//Verify token function
function verifyToken(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers['authorization'];
  //Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    //Split at the space
    const bearer = bearerHeader.split(' ');
    //Get token from array
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //Next middleware
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

//Register User
router.post('/register', (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = {email: req.body.email,
                password: generateHash(req.body.password),
                fullname: req.body.fullname,
                gender: req.body.gender,
                rating: -1,
                premium: false,
                created_at: new Date()
  };
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users WHERE email=($1)', [data.email]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      if (results.length > 0) {
        console.log(results.length);
        results.splice(0, results.length);
        results.push({
          "code": 205,
          "message": "Email already exists!"
        });
      } else {
        results.push({
          "code": 200,
          "message": "User created!"
        });
        client.query('INSERT INTO users(email, password, fullname, gender, rating, premium, created_at) values($1, $2, $3, $4, $5, $6, $7)',
    [data.email, data.password, data.fullname, data.gender, data.rating, data.premium, data.created_at]);
      }
      return res.json(results);
    });
  });
});

//Get all users
router.get('/usrss', (req, res, next) => {
  const results = [];
  
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM users');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json({ Message: 'List of Users', results });
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
    const query = client.query('SELECT * FROM items i WHERE i.user_id_fkey=($1) AND itemdeletedate > $2 ', [id, new Date()]);
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

//Add Dibs
router.post('/dibs', verifyToken, (req, res, next) => {
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus({"code":403, "message": "Forbidden"});
    } else {
      const results = [];
      const user_id = authData.row.id;
      const item_id = req.body[0].item_id;
      const created_at = new Date();
      console.log(req.body[0].user_id);
      
      // Get a Postgres client from the connection pool
      pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        // SQL Query > Select Data
        const query = client.query('INSERT INTO dibs (user_id, item_id, created_at) VALUES ($1, $2, $3)', [user_id, item_id, created_at]);
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          results.push({
            "code": 200,
            "message": "Dibs created!"
          });
          return res.json(results);
        });
      });
    }
  });
});

//Get user Dibs
router.get('/dibs', verifyToken, (req,res,next) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      if (err) {
        res.sendStatus({"code":403, "message": "Forbidden"});
      } else {
        const results = [];
        const user_id = authData.row.id;
        
        pg.connect(connectionString, (err, client, done) => {
          // Handle connection errors
          if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
          }
          // SQL Query > Select Data
          const query = client.query('SELECT name, description, pickuplocation, picturepath FROM items INNER JOIN dibs ON items.id = dibs.item_id WHERE dibs.user_id = $1 AND itemdeletedate > $2 ORDER BY created_at DESC', [user_id, new Date()]);
          
          // Stream results back one row at a time
          query.on('row', (row) => {
            results.push(row);
          });
          // After all data is returned, close connection and return results
          query.on('end', () => {
            done();
            return res.json({"code": 200, "results": results});
          });
        });
      }
    });
});

//
function generateHash (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

function validPassword (password, password2) {
  return bcrypt.compareSync(password, password2);
};

module.exports = router;
