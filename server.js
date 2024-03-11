const express = require("express");
const app = express();
require("dotenv").config(); 

const { PORT, CLIENT_URL } = process.env;

app.get("/", (req, res) => {
    res.send("<h1>Hello, World </h1>");
  });

  app.listen(PORT, () => {
    console.log(`app running at ${CLIENT_URL}:${PORT}`);
  });
  