const pg = require('pg');
const connectionDBString = process.env.DATABSE_URL || 'postgres://alick:0A0D000B00@localhost:5432/bringmehome'

const client = new pg.Client(connectionDBString);
client.connect();
const query = client.query(
    'CREATE TABLE items(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, description TEXT, condition VARCHAR(40), pickupLocation VARCHAR(40), daysListed INTEGER, picturePath TEXT'
);
query.on('end', () => { client.end(); });