// Generate process-env.json

const fs = require('fs');
fs.writeFileSync('./process-env.json', JSON.stringify(process.env, null, 2));