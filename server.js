const express = require("express");
const app = express();
const stockRoute = require("./routes/stock");
require("dotenv").config();

const { PORT, CLIENT_URL } = process.env;

app.use(express.json());

app.use(cors({ origin: CLIENT_URL }));

app.use("/", stockRoute);

app.listen(PORT, () => {
  console.log(`app running at "http://localhost:${PORT}"`);
});
