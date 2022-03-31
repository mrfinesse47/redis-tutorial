require("dotenv").config();

const express = require("express");
// const res = require("express/lib/response");
const fetch = require("node-fetch");
const redis = require("redis");
const client = redis.createClient();

const PORT = process.env.PORT || 5001;

const app = express();

function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github`;
}

//make request to github for data

async function getRepos(req, res, next) {
  try {
    console.log("fetching data");
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    const repos = data.public_repos;

    //set to data t0 Redis
    client.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (err) {
    console.log(err);
    res.status(500);
  }
}

//cache middleware

function cache(req, res, next) {
  const { username } = req.params;

  client.get(username, (err, data) => {
    console.log("reply cachec");
    if (err) {
      throw err;
    }
    if (data !== null) {
      //if there is already cached data dont continue to next and just send this response
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get("/repos/:username", cache, getRepos); //in order to use caching middleware pass in as second param

app.get("/test", (req, res) => {
  res.send("hi");
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT || 5001}`);
});
