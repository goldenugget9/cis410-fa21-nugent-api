const jwt = require("jsonwebtoken");

let myToken = jwt.sign({ pk: 4 }, "secretPassword", {
  expiresIn: "60 minutes",
});

console.log(myToken);

let verifacationTest = jwt.verify(myToken, "secretPassword");
console.log("verficationtest", verifacationTest);
