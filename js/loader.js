const load = function load(scriptsData) {
    return new Promise((resolve, reject) => {
        const loading = new Set();

        for (const data of scriptsData) {
            loading.add(data.src);
        }

        for (const data of scriptsData) {
            const {src, async, defer} = data;

            const script = document.createElement('script');

            script.onload = function onload(e) {
                loading.delete(e.target.getAttribute('src'));

                if (loading.size === 0) {
                    resolve();
                }
            };

            script.onerror = reject;
            script.defer = !!defer;
            script.async = !!async;
            script.src = src;
            document.head.appendChild(script);
        }
    });
};

window.onAppLoaded = load([
    { src: 'js/vendor/jszip.min.js', async: true },
    { src: 'js/vendor/FileSaver.js', async: true },
    { src: 'js/ResourceBundler.js', async: true },
    { src: 'js/ResourceFetcher.js', async: true },
    { src: 'js/TransifexService.js', async: true },
    { src: 'js/strings2msg.js', async: true },
    { src: 'js/app.js', defer: true },
]);
