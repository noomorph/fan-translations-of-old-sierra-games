const fetch = require('node-fetch');

function generateBasicAuthorizationHeader(username, password) {
  return 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
}

const TRANSIFEX_TOKEN = process.env.TRANSIFEX_TOKEN;
const Authorization = generateBasicAuthorizationHeader('api', TRANSIFEX_TOKEN);

function fetchApi(url) {
  return fetch(url, {
    method: 'GET',
    headers: { Authorization },
  });
}

const ORGANIZATION_NAME = 'old-quests-fan-translations';
const PROJECT_NAME = 'quest-for-glory-i';

function fetchResources() {
  const url = `https://api.transifex.com/organizations/${ORGANIZATION_NAME}/projects/${PROJECT_NAME}/resources/`;
  return fetchApi(url).then(r => r.json());
}

function fetchStrings(resourceName, lang) {
  const url = `https://www.transifex.com/api/2/project/${PROJECT_NAME}/resource/${resourceName}/translation/${lang}/strings/`;
  return fetchApi(url).then(r => r.json());
}
  
async function main() {
  const resources = await fetchResources();
  const slugs = resources.map(r => r.slug);

  console.log(resources);
}

main();

