var strings2msg = (function () {
    function writeUint8(buf, offset, value) {
        buf[offset] = value & 0xFF;
    }

    function writeUint16(buf, offset, value) {
        writeUint8(buf, offset + 0, (value));
        writeUint8(buf, offset + 1, (value & 0xFF00) >> 8);
    }

    function parse_ff(str, index) {
        const ff = str.slice(index, index + 2);
        return parseInt(ff, 16);
    }

    function parseKey(key) {
        const [resource, index, data] = key.split('_');
        const [
            noun, verb, condition, sequence, talker,
            unknown1, unknown2, unknown3
        ] = [0, 2, 4, 6, 8, 10, 12, 14].map(offset => parse_ff(data, offset));

        return {
            resource,
            index: +index,
            noun,
            verb,
            condition,
            sequence,
            talker,
            unknown1,
            unknown2,
            unknown3,
        };
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
                const code = line.content.charCodeAt(j) & 0xFF;
                output[s_offset + j] = code;
            }
            output[s_offset + L] = 0;

            s_offset += L + 1;
        }

        return output;
    }

    function strings2msg(strings) {
        const lines = [];

        for (const str of strings) {
            const content = str.translation || str.source_string;
            const entry = parseKey(str.key);

            lines[entry.index] = {
                noun: entry.noun,
                verb: entry.verb,
                condition: entry.condition,
                sequence: entry.sequence,
                talker: entry.talker,
                unknown1: entry.unknown1,
                unknown2: entry.unknown2,
                unknown3: entry.unknown3,
                content,
            };
        }

        return create_resource(lines);
    }

    return strings2msg;
}());
