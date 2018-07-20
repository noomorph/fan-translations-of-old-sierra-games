const _ = require('lodash');
const program = require('commander');
const readline = require('readline');
const fs = require('fs');
const stream = require('stream');
const child_process = require('child_process');
const path = require('path');
const win1255 = require('./win1255');

program
  .name('fonmaker rasterize')
  .description('Convert TTF font file into a folder of rasterized *.png glyphs')
  .usage('-i <path-to-ttf-font> -o <path-to-png-folder>')
  .option(
    '-i, --input <path-to-ttf-font>',
    'TTF font file to be rasterized into PNG glyphs'
  )
  .option(
    '-o, --output <path-to-png-folder>',
    'Path to the output folder of *.png glyphs'
  )
  .option(
    '-s, --point-size [pointSize]',
    'Point size',
    '14'
  )
  .option(
    '--single-thread',
    'Run everything in single thread',
    false
  )
  .parse(process.argv);

if (program.input && program.output) {
  if (!fs.existsSync(program.input)) {
    console.error('TTF font file does not exist: ', program.input);
    program.help();
  }

  if (!program.inputFont.toLowerCase().endsWith('.ttf')) {
    console.error('Font argument has wrong file extension:', program.input);
    program.help();
  }

  try {
    fs.ensureDirSync(program.output);
  } catch (e) {
    console.error('Failed to create directory at path: ' + program.output);
    console.error(e);
    process.exit(2);
  }

  main(program);
} else {
  program.help();
}

function main({ input, output, pointSize, singleThread }) {
  // TODO: actually implement this
}
