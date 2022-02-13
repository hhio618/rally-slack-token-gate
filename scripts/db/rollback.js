const path = require('path')

// Loading the .env file if exists.
require('dotenv').config();
const { spawn } = require('child-process-promise')
const { parseURL } = require('whatwg-url')

require('../../src/app');

const spawnOptions = { cwd: path.join(__dirname, '../..'), stdio: 'inherit' };

(async () => {
  const parts = parseURL(process.env.POSTGRES_SERVICE_URL);

  // Strip our search params
  const url = `${parts.scheme}://${parts.username}@${parts.host}:${parts.port || 5432}/${parts.path[0]}`;

  try {
    await spawn('./node_modules/.bin/sequelize', ['db:migrate:undo', `--url=${url}`], spawnOptions);
    console.log('*************************');
    console.log('Migration successful');
  } catch (err) {
    console.log('*************************');
    console.log('Migration failed. Error:', err.message);
  }

  process.exit(0);
})();
