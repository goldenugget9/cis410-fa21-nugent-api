const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const jnuggetConfig = require("./config.js");
const auth = require("./middleware/authenticate");

const app = express();
app.use(express.json());

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

app.post("/subscriptions", auth, async (req, res) => {
  try {
    let podcastFK = req.body.podcastFK;
    // let date = req.body.date;
    let date = new Date().toLocaleDateString();

    if (!podcastFK || !date || Number.isNaN(Date.parse(date))) {
      return res.status(400).send("bad request");
    }
    console.log("date", date);
    // console.log("here is the listener", req.listener);

    let insertQuery = `INSERT INTO Subscription(date, ListenerFK, PodcastFK)
    OUTPUT Inserted.SubscriptionPK, inserted.date, inserted.PodcastFK
    VALUES ('${date}', '${req.listener.ListenerPK}','${podcastFK}' )`;

    let insertedSubscription = await db.executeQuery(insertQuery);
    console.log("Inserted subscription:", insertedSubscription);

    // res.send("here is the response");

    res.status(201).send(insertedSubscription[0]);
  } catch (err) {
    console.log("error in POST /subscriptions", err);
    res.status(500).send("error");
  }
});

app.get("/listeners/me", auth, (req, res) => {
  res.send(req.listener);
});

app.post("/listeners/login", async (req, res) => {
  // console.log("/listeners/login called", req.body);

  // 1 data validation

  let email = req.body.email;

  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad request");
  }

  // 2 check that user exists in database

  let query = `SELECT *
  FROM Listener
  WHERE Email = '${email}'`;

  let result;
  try {
    result = await db.executeQuery(query);
  } catch (myError) {
    console.log("Error in listeners/login", myError);
    return res.status(500).send();
  }
  // console.log("results", result);

  if (!result[0]) {
    return res.status(401).send("invalid user credentials");
  }
  // 3 check Password

  let user = result[0];

  if (!bcrypt.compareSync(password, user.Password)) {
    console.log("invalid password");
    return res.status(401).send("invalid user credentials");
  }

  // 4 generate token

  let token = jwt.sign({ pk: user.ListenerPK }, jnuggetConfig.JWT, {
    expiresIn: "60 minutes",
  });

  // console.log("token:", token);

  // 5 save token in DB and send response
  let setTokenQuery = `UPDATE Listener
  SET token = '${token}'
  WHERE ListenerPK = ${user.ListenerPK}`;

  try {
    await db.executeQuery(setTokenQuery);

    res.status(200).send({
      token: token,
      user: {
        NameFirst: user.NameFirst,
        NameLast: user.NameLast,
        email: user.Email,
        ListenerPK: user.ListenerPK,
      },
    });
  } catch (myError) {
    console.log("Error is setting user token", myError);
    res.status(500).send();
  }
});

app.post("/Listeners", async (req, res) => {
  // res.send("/Listeners called");

  // console.log("Request body", req.body);

  let nameFirst = req.body.nameFirst;
  let nameLast = req.body.nameLast;
  let email = req.body.email;
  let password = req.body.password;

  if (!nameFirst || !nameLast || !email || !password) {
    return res.status(400).send("bad request");
  }

  nameFirst = nameFirst.replace("'", "''");
  nameLast = nameLast.replace("'", "''");

  let emailCheckQuery = `SELECT email
  FROM Listener
  WHERE email = '${email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  // console.log("existing user", existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }

  let hashedPassword = bcrypt.hashSync(password);

  let insertQuery = `INSERT INTO Listener(NameFirst, NameLast, Email, Password)
  VALUES ('${nameFirst}','${nameLast}','${email}','${hashedPassword}')`;

  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.log("error in POST /Listeners", err);
      res.status(500).send();
    });
});

app.get("/podcasts", (req, res) => {
  // get data from the database
  db.executeQuery(
    `SELECT *
  FROM Episode
  LEFT JOIN Podcast
  On Podcast.PodcastPK = Episode.PodcastFK`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});

app.get("/podcasts/:pk", (req, res) => {
  let pk = req.params.pk;

  //   console.log(pk);

  let myQuery = `SELECT *
FROM Episode
LEFT JOIN Podcast
On Podcast.PodcastPK = Episode.PodcastFK
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
