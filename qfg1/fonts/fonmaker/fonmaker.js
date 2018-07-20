#!/usr/bin/env node

const program = require('commander');

program
  .arguments('<process>')
  .command('rasterize', 'convert TTF font file into a folder of rasterized *.png glyphs')
  .command('compile', 'convert a folder of *.png glyphs into a SCI .fon file')
  .parse(process.argv);

