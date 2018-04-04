TRANSIFEX_TOKEN.value = localStorage.getItem('LAST_TRANSIFEX_TOKEN');
TRANSIFEX_TOKEN.oninput = (e) => localStorage.setItem('LAST_TRANSIFEX_TOKEN', e.target.value);
FILE_MASK.value = localStorage.getItem('LAST_FILE_MASK');
FILE_MASK.oninput = (e) => localStorage.setItem('LAST_FILE_MASK', e.target.value);

async function download() {
    try {
        DOWNLOAD.disabled = true;
        const transifexService = new TransifexService(TRANSIFEX_TOKEN.value.trim());
        const config = {
            organizationName: ORGANIZATION_NAME.value,
            projectName: PROJECT_NAME.value,
            language: TARGET_LANG.value,
            filemask: FILE_MASK.value,
        };

        const getBundler = () => new ResourceBundler(JSZip, 'qfg1_he');
        const fetcher = new ResourceFetcher(transifexService, getBundler, config);

        await fetcher.downloadAsZIP();
    }
    catch (e) {
        debugger;
        alert(e.message);
    }
    finally {
        DOWNLOAD.disabled = false;
    }
}

onAppLoaded.then(() => {
    DOWNLOAD.disabled = false;
});

