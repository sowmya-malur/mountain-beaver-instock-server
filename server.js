require("dotenv").config();
const express = require("express");
const app = express();
const stockRoute = require("./routes/stock");
const knexConfig = require('./knexfile.js')[process.env.NODE_ENV || 'development'];
const knex = require('knex')(knexConfig);
const PORT = process.env.PORT || 8080; // Fallback to 8080 if PORT is not defined in .env
const cors = require('cors');
const CLIENT_URL = process.env.CLIENT_URL;
app.use(express.json());

app.use(cors({ origin: CLIENT_URL }));

app.use("/", stockRoute);

app.get('/api/data', async (req, res) => {
  try {
    const data = await knex('warehouses').select('*');
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
