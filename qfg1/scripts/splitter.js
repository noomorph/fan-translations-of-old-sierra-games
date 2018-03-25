const fs = require('fs');
const path = require('path');

const basedir = '../data';

const result = {};

for (const file of fs.readdirSync(basedir)) {
  const filename = path.join(basedir, file);
  const contents = fs.readFileSync(filename, 'utf8');
  const frags = contents.split('\u0000');
  const hash1 = path.extname(filename).slice(1);

  for (let i = 1; i < frags.length - 1; i++) {
    const hash = 'part_' + hash1 + '_line_' + i;
    result[hash] = frags[i];
  }
}

console.log(JSON.stringify(result, null, 4));
