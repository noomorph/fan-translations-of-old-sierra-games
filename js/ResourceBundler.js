var ResourceBundler = class ResourceBundler {
    constructor(JSZip, baseFilename = 'archive') {
        this.archive = new JSZip();
        this.baseFilename = baseFilename;
    }

    put(filename, contents) {
        this.archive.file(filename, contents);
    }

    async save() {
        const blob = await this.archive.generateAsync({ type: 'blob' });
        const timestamp = Date.now().toString(16);
        const filename = this.baseFilename + '_' + timestamp + '.zip';
        saveAs(blob, filename);
    }
};
