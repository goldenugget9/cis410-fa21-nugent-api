const sql = require("mssql");
const jnuggetConfig = require("./config.js");

const config = {
  user: jnuggetConfig.DB.user,
  password: jnuggetConfig.DB.password,
  server: jnuggetConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
  database: jnuggetConfig.DB.database,
};

async function executeQuery(aQuery) {
  let connection = await sql.connect(config);
  let result = await connection.query(aQuery);

  //   console.log(result);

  return result.recordset;
}

// executeQuery(`SELECT *
// FROM Episode
// LEFT JOIN Podcast
// On Podcast.PodcastPK = Episode.PodcastPK`);

module.exports = { executeQuery: executeQuery };
