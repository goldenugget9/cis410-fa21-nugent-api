const express = require("express");
const db = require("./dbConnectExec.js");
const app = express();

app.listen(5000, () => {
  console.log("App is running on port 5000");
});

app.get("/hi", (req, res) => {
  res.send("hello world");
});

app.get("/", (req, res) => {
  res.send("api is running");
});

// app.post();
// app.put();

app.get("/podcast", (req, res) => {
  // get data from the database
  db.executeQuery(
    `SELECT *
  FROM Episode
  LEFT JOIN Podcast
  On Podcast.PodcastPK = Episode.PodcastPK`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});

app.get("/podcast/:pk", (req, res) => {
  let pk = req.params.pk;

  //   console.log(pk);

  let myQuery = `SELECT *
FROM Episode
LEFT JOIN Podcast
On Podcast.PodcastPK = Episode.PodcastPK
WHERE EpisodePK = ${pk}`;

  db.executeQuery(myQuery)
    .then((result) => {
      // console.log("result", result);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(404).send(`bad request`);
      }
    })
    .catch((err) => {
      console.log("Error in /Podcast/:pk", err);
      res.status(500).send();
    });
});
