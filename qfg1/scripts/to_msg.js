const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const { writeUint8, writeUint16 } = require('./utils/binary');

const CACHE_LOCATION = '.cache/resources.tsv';
const GSHEETS_URL =
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vSrKlVjKAPwNaZ7xutOPWFlzOLpb7j3bUe8UxLWqCeeAtt_vAKki_28W9PJ3j5yVaUhax8oRk7kFW_P/pub?output=tsv`;

function buildParserFunction(header) {
  const columns = header.split('\t');

  return (line) => {
    const record = {};
    const cells = line.split('\t');
    const n = cells.length;

    for (let i = 0; i < n; i++) {
      const value = cells[i];
      record[columns[i]] = Number.isNaN(+value) ? value : +value;
    }

    return record;
  };
}

async function fetchTranslations({ useCache } = {}) {
  await fs.mkdirp('.cache');

  if (!useCache || !(await fs.exists(CACHE_LOCATION))) {
    const response = await fetch(GSHEETS_URL);
    await fs.writeFile(CACHE_LOCATION, await response.text())
  }

  const contents = await fs.readFile(CACHE_LOCATION, 'utf8');
  let parseLine;

  return _.chain(contents)
    .trimEnd()
    .split('\r\n')
    .thru(([header, ...lines]) => {
      parseLine = buildParserFunction(header);
      return lines;
    })
    .map((line) => parseLine(line))
    .value();
}

function create_resource(lines) {
  const output = [
    0x8F, 0x00, 0x0C, 0x0D, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ];

  const totalSize = lines.reduce((size, line) => {
    return size + (line.content.length + 10 + 1);
  }, 0);

  writeUint16(output, 6, totalSize + 2);
  writeUint16(output, 8, lines.length);

  for (let index = 0, s_offset = 10 + (lines.length) * 10; index < lines.length; index++) {
    const offset = 10 + index * 10;
    const line = lines[index];
    console.log(line.noun.toString(16), line.verb.toString(16), line.condition.toString(16), line.sequence.toString(16), line.talker.toString(16));
    writeUint8(output,  offset + 0, line.noun);
    writeUint8(output,  offset + 1, line.verb);
    writeUint8(output,  offset + 2, line.condition);
    writeUint8(output,  offset + 3, line.sequence);
    writeUint8(output,  offset + 4, line.talker);
    writeUint16(output, offset + 5, s_offset - 2);
    writeUint8(output,  offset + 7, line.unknown1);
    writeUint8(output,  offset + 8, line.unknown2);
    writeUint8(output,  offset + 9, line.unknown3);

    const L = line.content.length;
    for (let j = 0; j < L; j++) {
      const code = line.content.charCodeAt(j);
      if (code >= 1488) {
        output[s_offset + j] = (code & 0xFF) + 16;
      } else {
        output[s_offset + j] = code & 0xFF;
      }
    }
    output[s_offset + L] = 0;

    s_offset += L + 1;
  }

  return Buffer.from(output);
}

async function main(argv) {
  const translations = await fetchTranslations({ useCache: true });
  const resources = {};

  for (const item of translations) {
    const {
      resource,
      index,
      noun,
      verb,
      condition,
      sequence,
      talker,
      unknown1,
      unknown2,
      unknown3,
      ...strings
    } = item;

    resources[resource] = resources[resource] || [];
    resources[resource][index] = {
      noun,
      verb,
      condition,
      sequence,
      talker,
      unknown1,
      unknown2,
      unknown3,
      content: strings.he || strings.en,
    };
  }

  await fs.mkdirp('./msg');
  for (const resource of Object.keys(resources)) {
    const data = resources[resource];
    const binary = create_resource(data);

    await fs.writeFile(`./msg/${resource}.msg`, binary);
  }
}

main(process.argv);
