#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');
const readline = require('readline');
const fs = require('fs');
const stream = require('stream');
const child_process = require('child_process');
const path = require('path');
const win1255 = require('./win1255');

program
  .version('0.1.0')
  .option('-i, --input-font <font.ttf>', 'Font file')
  .option('-s, --point-size [pointSize]', 'Point size', '14')
  .option('-o, --out-file [out.fon]', 'Output file name', 'out.fon')
  .option('--single-thread', 'Run everything in single thread')
  .parse(process.argv);

if (!fs.existsSync(program.inputFont)) {
  console.error('TTF font file does not exist: ', program.inputFont);
  program.help();
}

if (!program.inputFont.toLowerCase().endsWith('.ttf')) {
  console.error('Font argument has wrong file extension:', program.inputFont);
}

function generateSingleGlyph(charCode, unicodeCharCode) {
  const outFile = `/tmp/${charCode}.txt`;

  const args = [
    '-compress', 'None',
    '-dither', 'FloydSteinberg',
    '-depth', '1',
    '-colors', '2',
    '-background', 'white',
    '-fill', 'black',
    '-colorspace', 'Gray',
    '-font', program.inputFont,
    '-pointsize', program.pointSize,
    `label:${String.fromCharCode(unicodeCharCode)}`,
    'txt:-'
  ];

  const handle = child_process.spawn('convert', args, {});
  const reader = readline.createInterface({ input: handle.stdout });
  let glyph;

  reader.on('line', (line) => {
    if (!glyph) {
      const [width, height] = _.last(line.split(' ')).split(',');
      glyph = { width: +width, height: +height, data: new Array(+width * +height) };
    } else {
      const [left, right] = line.split(':'); 
      const [color] = right.match(/[0-9A-F]{8}/) || [''];
      const [x, y] = left.split(',').map(n => parseInt(n, 10));
      glyph.data[glyph.width * y + x] = color === 'FFFFFFFF' ? 0 : 1;
    }
  });

  return new Promise((resolve, reject) => {
    handle.on('close', (code) => {
      console.log('generated glyph with charCode =', charCode, 'unicode pos =', unicodeCharCode);
      resolve(code ? null : glyph);
    });
  });
}

function generateBlankGlyph() {
  return {
    width: 1,
    height: 1,
    data: [0],
  };
}

function *generateGlyphs() {
  for (let charIndex = 0; charIndex < win1255.length; charIndex++) {
    const code = win1255[charIndex][0];

    if (code != null) {
      const decCode = parseInt(code, 16);
      yield generateSingleGlyph(charIndex, decCode);
    } else {
      yield Promise.resolve(null);
    }
  }
}

function bitify8(chunk, index) {
  return (
    (chunk[index + 0] >> 0) |
    (chunk[index + 1] >> 1) |
    (chunk[index + 2] >> 2) |
    (chunk[index + 3] >> 3) |
    (chunk[index + 4] >> 4) |
    (chunk[index + 5] >> 5) |
    (chunk[index + 6] >> 6) |
    (chunk[index + 7] >> 7)
  );
}

function bitify(buf, chunk) {
  const n = chunk.length >> 3;
  for (let i = 0; i < n; i += 8) {
    buf.push(bitify8(chunk, i));
  }
}

function add_word(buf, n) {
  buf.push(n & 0xFF);
  buf.push((n & 0xFF00) >> 8);
}

function isGlyphBroken(g) {
  return g == null || g.width > 60 || g.height > 100;
}

function fixGlyph(g) {
  return isGlyphBroken(g) ? generateBlankGlyph() : g;
}

async function produceGlyphsArray() {
  const iterable = generateGlyphs();

  if (program.singleThread) {
    const glyphs = [];

    for (const op of iterable) {
      glyphs.push(fixGlyph(await op));
    }

    return glyphs;
  }

  const glyphs = await Promise.all([...iterable]);
  return glyphs.map(fixGlyph);
}

async function main() {
  const glyphs = await produceGlyphsArray();
  const lineHeight = _.max(glyphs.map(g => g.height));

  debugger;
  const buf = [];

  add_word(buf, 0x87);
  add_word(buf, 0);
  add_word(buf, glyphs.length);
  add_word(buf, lineHeight);

  let bitmasksOffset = 8 + glyphs.length * 2;

  for (const glyph of glyphs) {
    add_word(buf, bitmasksOffset);
    const frameSize = 4 + Math.ceil(glyph.width / 8) * glyph.height;
    bitmasksOffset += frameSize;
  }

  for (const glyph of glyphs) {
    buf.push(glyph.height & 0xFF);
    buf.push(glyph.width & 0xFF);

    for (const chunk of _.chunk(glyph.data, glyph.width)) {
      while (chunk.length % 8 !== 0) {
        chunk.push(0);
      }
      bitify(buf, chunk);
    }
  }

  fs.writeFileSync(program.outFile, new Buffer(buf));
}

main();

