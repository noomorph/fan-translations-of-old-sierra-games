function writeUint8(buf, offset, value) {
  buf[offset] = value & 0xFF;
}

function writeUint16(buf, offset, value) {
  writeUint8(buf, offset, value);
  writeUint8(buf, offset + 1, (value & 0xFF00) >> 8);
}

module.exports = {
  writeUint8,
  writeUint16,
};
