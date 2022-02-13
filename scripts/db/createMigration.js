const path = require('path')

// Loading the .env file if exists.
require('dotenv').config();
const { spawn } = require('child-process-promise')
const { parseURL } = require('whatwg-url')

require('../../src/app');

const spawnOptions = { cwd: path.join(__dirname, '../..'), stdio: 'inherit' };

(async () => {
  const parts = parseURL(process.env.DATABASE_URL);

  // Strip our search params
  const url = `${parts.scheme}://${parts.username}@${parts.host}:${parts.port || 5432}/${parts.path[0]}`;

  try {
    await spawn('./node_modules/.bin/sequelize', ['migration:create', '--name', process.argv[2], `--url=${url}`], spawnOptions);
    console.log('*************************');
    console.log('Migration creation successful');
  } catch (err) {
    console.log('*************************');
    console.log('Migration creation failed. Error:', err.message);
  }

  process.exit(0);
})();
