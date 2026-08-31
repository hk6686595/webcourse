const { sqlite1, sqlite2, sqlite3, sqlite4, sqlite5 } = require('./sqlite/sqlite1');
const { sqlite6, sqlite7, sqlite8, sqlite9, sqlite10 } = require('./sqlite/sqlite2');
const { sqlite11, sqlite12, sqlite13, sqlite14, sqlite15 } = require('./sqlite/sqlite3');
const { sqlite16, sqlite17, sqlite18 } = require('./sqlite/sqlite4');

const sqliteFeatures = [
  sqlite1, sqlite2, sqlite3, sqlite4, sqlite5,
  sqlite6, sqlite7, sqlite8, sqlite9, sqlite10,
  sqlite11, sqlite12, sqlite13, sqlite14, sqlite15,
  sqlite16, sqlite17, sqlite18,
];

module.exports = sqliteFeatures;