import * as fs from 'fs';
import * as path from 'path';

const dist = 'C:/Data/projects/mf-plugin/ng17demo/dist/ng17demo/browser';
const indexPath = 'C:/Data/projects/mf-plugin/ng17demo/src/index.html';

const bundles = loadRemoteEntry();

console.log(bundles, bundles);

export default {

  '/': {
    "bypass": function (req, res, proxyOptions) {

      console.log('url', req.url);
      if (req.url === '/remoteEntry.json' || bundles.includes(req.url)) {
        console.log('load from dist');
        const reqPath = path.join(dist, req.url);
        const data = fs.readFileSync(reqPath, 'utf-8');
        const contentType = req.url === '/remoteEntry.json' ? 'application/json' : 'text/javascript';
        res.setHeader('Content-Type', contentType);
        res.end(data);
        return true;
      }
      else if (['/', '/index.html'].includes(req.url)) {
        console.log('load index');
        const index = fs.readFileSync(indexPath, 'utf-8');
        const updated = updateScriptTags(index);

        res.end(updated);
        return true;
      }
      else {
        console.log('forward');
        return req.url;
      }


    }
  }
};

function loadRemoteEntry() {
  const remoteEntryPath = path.join(dist, '/remoteEntry.json');
  const remoteEntryContent = fs.readFileSync(remoteEntryPath, 'utf-8');
  const remoteEntry = JSON.parse(remoteEntryContent);

  const bundles = [
    ...remoteEntry.shared.map(e => '/' + e.outFileName),
    ...remoteEntry.exposes.map(e => '/' + e.outFileName),

  ];
  return bundles;
}

export function updateScriptTags(
  indexContent,
  mainName = 'main.js',
  polyfillsName = 'polyfills.js'
) {
  const htmlFragment = `
  
<script type="esms-options">
{
  "shimMode": true
}
</script>

<script type="module" src="/@vite/client"></script>

<script type="module" src="${polyfillsName}"></script>
<script type="module-shim" src="${mainName}"></script>
`;

  indexContent = indexContent.replace(/<script src="polyfills.*?>/, '');
  indexContent = indexContent.replace(/<script src="main.*?>/, '');
  indexContent = indexContent.replace('</body>', `${htmlFragment}</body>`);
  return indexContent;
}

