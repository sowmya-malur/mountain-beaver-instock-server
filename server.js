require("dotenv").config();
const express = require("express");
const app = express();
const warehouseRoute = require("./routes/warehouses");
const inventoryRoute = require("./routes/inventory");
const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig);
const PORT = process.env.PORT || 8080; // Fallback to 8080 if PORT is not defined in .env
const cors = require('cors');
const CLIENT_URL = process.env.CLIENT_URL;
app.use(express.json());

// app.use(cors({ origin: CLIENT_URL }));
app.use(cors());

app.use("/api/warehouses", warehouseRoute);
app.use("/api/inventories", inventoryRoute);
// Serve static files from a specified directory
app.use(express.static('public'));

// Specific route for the font with an explicit MIME type
app.get('/static/media/TitilliumWeb-Regular.woff2', function(req, res) {
  res.type('font/woff2');
  res.sendFile(path.join(__dirname, './public/fonts/TitilliumWeb-Regular.61720ae697f065b141ff.woff2'));
});

app.get('/static/media/TitilliumWeb-SemiBold.woff2', function(req, res) {
  res.type('font/woff2');
  res.sendFile(path.join(__dirname, './public/fonts/TitilliumWeb-TitilliumWeb-SemiBold.woff2'));
});
app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
