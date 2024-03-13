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

app.use(cors({ origin: CLIENT_URL }));

app.use("/warehouses", warehouseRoute);
app.use("/inventory", inventoryRoute);


app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
