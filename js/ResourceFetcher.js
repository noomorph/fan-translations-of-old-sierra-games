var ResourceFetcher = class ResourceFetcher {
    constructor(transifexService, getBundler, config = ResourceFetcher.getDefaultConfig()) {
        if (!transifexService) {
            throw new Error('no TransifexService instance is given');
        }

        if (!getBundler) {
            throw new Error('no bundler factory is given');
        }

        if (!config.organizationName) {
            throw new Error('no organization name is given');
        }

        if (!config.projectName) {
            throw new Error('no project name is given');
        }

        if (!config.language) {
            throw new Error('no target language is given');
        }

        if (!config.filemask) {
            throw new Error('no file mask is given');
        }

        this.transifexService = transifexService;
        this.getBundler = getBundler;
        this.config = config;
    }

    async downloadAsZIP() {
        const resources = await this.transifexService.fetchResources(
            this.config.organizationName,
            this.config.projectName
        );

        const bundler = this.getBundler();

        const tasks = resources
            .filter(r => {
                return r.name === this.config.filemask;
            })
            .map(async (r) => {
                const [basename] = r.name.split('.');
                const strings = await this.transifexService.fetchStrings(this.config.projectName, r.slug, this.config.language);
                const msgContents = strings2msg(strings);
                bundler.put(basename + '.msg', msgContents);
            });

        await Promise.all(tasks);
        await bundler.save();
    }
};

ResourceFetcher.getDefaultConfig = () => ({
    organizationName: '',
    projectName: '',
    language: '',
    filemask: '',
});