var TransifexService = class TransifexService {
    constructor(token) {
        this.token = TransifexService.validateToken(token);
        this.authorizationHeader = TransifexService.generateBasicAuthorizationHeader('api', this.token);
    }

    fetchResources(organizationName, projectName) {
        if (!organizationName) {
            throw new Error('no organization name is given');
        }

        if (!projectName) {
            throw new Error('no project name is given');
        }

        return this._fetchFromApi(`https://api.transifex.com/organizations/${organizationName}/projects/${projectName}/resources/`);
    }

    fetchStrings(projectName, resourceName, lang) {
        if (!projectName) {
            throw new Error('no project name is given');
        }

        if (!resourceName) {
            throw new Error('no resource name is given');
        }

        if (!lang) {
            throw new Error('translation language is not specified');
        }

        return this._fetchFromApi(`https://www.transifex.com/api/2/project/${projectName}/resource/${resourceName}/translation/${lang}/strings/`);
    }

    _fetchFromApi(url) {
        return fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Authorization: this.authorizationHeader
            },
        }).then(r => r.json());
    }
};

TransifexService.validateToken = (token) => {
    if (!token) {
        throw new Error('The given Transifex token is empty.');
    }

    if (token.length !== 42) {
        throw new Error(`The given Transifex token has invalid length: ${token.length} chars vs 42 expected.`);
    }

    return token;
};

TransifexService.generateBasicAuthorizationHeader = (username, password) => {
    return 'Basic ' + btoa(username + ':' + password);
};
