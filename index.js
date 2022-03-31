require("dotenv").config();

const express = require("express");
const res = require("express/lib/response");
const fetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5001;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

//make request to github for data

async function getRepos(req, res, next) {
  try {
    console.log("fetching data");
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}

app.get("/repos/:username", getRepos);

app.get("/test", (req, res) => {
  res.send("hi");
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT || 5001}`);
});