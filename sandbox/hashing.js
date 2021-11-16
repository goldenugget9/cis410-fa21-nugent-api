const bcrypt = require("bcryptjs");

let hashedPassword = bcrypt.hashSync(`csu123`);

console.log(hashedPassword);

let hashedTest = bcrypt.compareSync("csu123", hashedPassword);

console.log(hashedTest);
