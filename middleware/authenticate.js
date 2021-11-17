const jwt = require("jsonwebtoken");

const db = require("../dbConnectExec.js");
const jnuggetConfig = require("../config.js");

const auth = async (req, res, next) => {
  //   console.log("in the middleware", req.header("Authorization"));
  //   next();
  try {
    // decode token

    let myToken = req.header("Authorization").replace("Bearer ", "");
    console.log("token", myToken);

    let decoded = jwt.verify(myToken, jnuggetConfig.JWT);
    console.log(decoded);

    let ListenerPK = decoded.pk;

    // compare token with database

    let query = `SELECT ListenerPK, NameFirst, NameLast, Email
    FROM listener
    WHERE ListenerPK = ${ListenerPK} and Token = '${myToken}'`;

    let returnedUser = await db.executeQuery(query);
    console.log("Returned user", returnedUser);

    // save user info in request

    if (returnedUser[0]) {
      req.listener = returnedUser[0];
      next();
    } else {
      return res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    console.log(err);
    return res.status(401).send("invalid user credentials");
  }
};

module.exports = auth;
