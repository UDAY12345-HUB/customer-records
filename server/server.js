import express from "express";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import path from 'path';
import bodyParser from "body-parser";
import { exec } from 'child_process';
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const app = express();

const PORT = 9002

const MODE = "development"

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views')); 


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Bhavani1201',
  port: 5432,
});
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Error connecting to PostgreSQL database:', err));

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS customers (
    Sno SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    Age INT,
    Phone VARCHAR(20),
    Location VARCHAR(255),
    Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;


async function createTable() {
  try {
    await client.connect();
    await client.query(createTableQuery);

    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  } 
}

// createTable();

function generateRandomData() {
  const names = ['John', 'Emma', 'Michael', 'Sophia', 'William'];
  const locations = ['San Francisco', 'Miami', 'Seattle', 'Boston', 'Denver'];
  const phones = ['111-222-3333', '444-555-6666', '777-888-9999', '123-456-7890', '987-654-3210'];
  
  const randomDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const randomTime = new Date(randomDate.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000); // Adding random hours

  return {
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 50) + 18,
    phone: phones[Math.floor(Math.random() * phones.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    created_at: randomTime.toISOString() 
  };
}
async function insertData() {
  try {

    for (let i = 0; i < 10; i++) {
      const data = generateRandomData();
      
      const searchQuery = `
        SELECT COUNT(*) AS count FROM customers
        WHERE Name = $1 AND Age = $2 AND Phone = $3 AND Location = $4
      `;
      
      const searchResult = await client.query(searchQuery, [data.name, data.age, data.phone, data.location]);
      
      if (searchResult.rows[0].count === 0) {
        const insertQuery = `
          INSERT INTO customers (Name, Age, Phone, Location, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `;
        await client.query(insertQuery, [data.name, data.age, data.phone, data.location, data.created_at]);
        console.log('Data inserted successfully:', data);
      } else {
        console.log('Data already exists, skipping insertion:', data);
      }
    }
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

insertData();


app.get('/getdata', async (req, res) => {
  try {

    const query = `
      SELECT * FROM customers;
    `;

    const result = await client.query(query);
    const data = result.rows;
    console.log(data);
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching data"
    });
  }
});

  app.get('/getdata/search', async (req, res) => {
    try {
      const search = req.query.search; // Retrieve the search criteria from the query parameter

  
      // Adjust the SQL query to include the search criteria
      const query = `
        SELECT * FROM customers
        WHERE Name LIKE '%${search}%';  -- Adjust this based on your specific search criteria
      `;
  
      const result = await client.query(query);
      const data = result.rows;
  
      res.status(200).json({
        success: true,
        data: data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching data"
      });
    } 
  });


app.listen(9002, () => {
  console.log(`Server running on the Port 9002`.bgBlue);
})


// // Database connection configuration

// // Connect to the PostgreSQL database
// client.connect()
//   .then(() => console.log('Connected to PostgreSQL database'))
//   .catch(err => console.error('Connection error', err.stack));

// // Create operation
// async function createRecord() {
//   try {
//     await client.query('INSERT INTO table_name(column1, column2, ...) VALUES($1, $2, ...)', [value1, value2, ...]);
//     console.log('Record created successfully');
//   } catch (error) {
//     console.error('Error creating record', error.stack);
//   }
// }

// // Read operation
// async function readRecords() {
//   try {
//     const res = await client.query('SELECT * FROM table_name');
//     console.log('Records:');
//     res.rows.forEach(row => {
//       console.log(row);
//     });
//   } catch (error) {
//     console.error('Error reading records', error.stack);
//   }
// }

// // Update operation
// async function updateRecord() {
//   try {
//     await client.query('UPDATE table_name SET column1 = $1 WHERE condition', [new_value]);
//     console.log('Record updated successfully');
//   } catch (error) {
//     console.error('Error updating record', error.stack);
//   }
// }

// // Delete operation
// async function deleteRecord() {
//   try {
//     await client.query('DELETE FROM table_name WHERE condition');
//     console.log('Record deleted successfully');
//   } catch (error) {
//     console.error('Error deleting record', error.stack);
//   }
// }
