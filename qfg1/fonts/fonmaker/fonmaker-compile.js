const _ = require('lodash');
const program = require('commander');
const readline = require('readline');
const fs = require('fs');
const stream = require('stream');
const child_process = require('child_process');
const path = require('path');
const win1255 = require('./win1255');

program
  .name('fonmaker compile')
  .description("Convert *.png font glyphs folder into *.fon file supported by SCI engine")
  .usage('-i <path-to-png-folder> -o <path-to-fon-file>')
  .option(
    '-i, --input <path-to-png-folder>',
    'Path to the input folder of *.png glyphs'
  )
  .option(
    '-o, --output <path-to-fon-file>',
    'Path to the output .fon file (supported by SCI)'
  )
  .parse(process.argv);

if (program.input && program.output) {
  if (!fs.existsSync(program.input)) {
    console.error('The folder of *.png font glyphs does not exist at given path: ', program.input);
    program.help();
  }

  try {
    fs.ensureFileSync(program.output);
  } catch (e) {
    console.error('Failed to create output fon file at path: ' + program.output);
    console.error(e);
    process.exit(2);
  }

  main(program);
} else {
  program.help();
}

function main({ input, output }) {
  // TODO: actually implement this
}
