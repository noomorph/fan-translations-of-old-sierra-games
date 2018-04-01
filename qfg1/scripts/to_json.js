const fs = require('fs');
const path = require('path');

function readUint8(buf, offset) {
  return buf[offset];
}

function readUint16(buf, offset) {
  return (readUint8(buf, offset + 1) << 8) | readUint8(buf, offset);
}

function read_metaData(buffer) {
  return {
    // word1: readUint16(buffer, 0),
    // word2: readUint16(buffer, 2),
    // word3: readUint16(buffer, 4),
    size: readUint16(buffer, 6),
    count: readUint16(buffer, 8), // === total_file_size - 8
  };
}

function read_entry(buffer, index) {
  const offset = (1 + index) * 10;

  const noun       = readUint8(buffer, offset + 0);
  const verb       = readUint8(buffer, offset + 1);
  const condition  = readUint8(buffer, offset + 2);
  const sequence   = readUint8(buffer, offset + 3);
  const talker     = readUint8(buffer, offset + 4);
  const msg_offset = 2 + readUint16(buffer, offset + 5);
  const unknown1   = readUint8(buffer, offset + 7);
  const unknown2   = readUint8(buffer, offset + 8);
  const unknown3   = readUint8(buffer, offset + 9);

  const end = buffer.indexOf(0, msg_offset, 'raw');
  const content = buffer.slice(msg_offset, end).toString('ascii');

  return {
    noun,
    verb,
    condition,
    sequence,
    talker,
    unknown1,
    unknown2,
    unknown3,
    content,
  };
}

function ff(n) {
  if (n < 16) {
    return '0' + n.toString(16);
  }

  if (n > 255) {
    throw new Error('n > 255');
  }

  return n.toString(16);
}

function gen_key(entry, index) {
  return (index + '_' +
    ff(entry.noun) +
    ff(entry.verb) +
    ff(entry.condition) +
    ff(entry.sequence) +
    ff(entry.talker) +
    ff(entry.unknown1) +
    ff(entry.unknown2) +
    ff(entry.unknown3)
  );
}

function main(argv) {
  const acc = {};
  for (const arg of [].slice.call(argv, 2)) {
    const filename = './' + arg;
    const res = path.basename(filename, '.msg');
    const contents = fs.readFileSync(filename);
    const { count } = read_metaData(contents);

    for (let i = 0; i < count; i++) {
      const entry = read_entry(contents, i);
      const key = res + '_' + gen_key(entry, i);
      acc[key] = entry.content;
    }

    console.log(JSON.stringify(acc, null, 2));
  }
}

main(process.argv);
