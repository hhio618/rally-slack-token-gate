const path = require('path')

// Loading the .env file if exists.
require('dotenv').config();
const { spawn } = require('child-process-promise')
const { parseURL } = require('whatwg-url')
const env = process.env.NODE_ENV || 'development';

require('../../src/app');

const spawnOptions = { cwd: path.join(__dirname, '../..'), stdio: 'inherit' };

(async () => {
  let url;
  if (env == "test"){
    // We're using in-memory sqlite in our tests!
    process.exit(0);
  }else{
    const parts = parseURL(process.env.DATABASE_URL);
    // Strip our search params
    url = `${parts.scheme}://${parts.username}:${parts.password}@${parts.host}:${parts.port || 5432}/${parts.path[0]}`;

  }


  try {
    await spawn('./node_modules/.bin/sequelize', ['db:migrate', `--url=${url}`], spawnOptions);
    console.log('*************************');
    console.log('Migration successful');
  } catch (err) {
    console.log('*************************');
    console.log('Migration failed. Error:', err.message);
  }

  process.exit(0);
})();
