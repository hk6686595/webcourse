const fs = require('fs');
const path = require('path');

const dumps = {
  csharp: require('../data/csharpFeatures'),
  cpp20: require('../data/cpp20Features'),
  cpp11: require('../data/cppHistoryFeatures'),
  js: require('../data/jsFeatures'),
  ts: require('../data/tsFeatures'),
  agent: require('../data/agentFeatures'),
  patterns: require('../data/patternsFeatures'),
  python: require('../data/pythonFeatures')
};

const outDir = path.join(__dirname, '..', 'public', 'api');
fs.mkdirSync(outDir, { recursive: true });

const meta = {};
for (const [name, list] of Object.entries(dumps)) {
  fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify(list));
  meta[name] = list.length;
}

fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta));

const publicDir = path.join(__dirname, '..', 'public');
const docsDir = path.join(__dirname, '..', 'docs');
fs.rmSync(docsDir, { recursive: true, force: true });
fs.cpSync(publicDir, docsDir, { recursive: true });

const rootFiles = ['index.html', 'app.js', 'style.css', '.nojekyll'];
for (const name of rootFiles) {
  fs.copyFileSync(path.join(publicDir, name), path.join(__dirname, '..', name));
}
const rootApi = path.join(__dirname, '..', 'api');
fs.rmSync(rootApi, { recursive: true, force: true });
fs.cpSync(path.join(publicDir, 'api'), rootApi, { recursive: true });
console.log('copied public -> docs (Gitee Pages /docs)');
console.log('copied public -> repo root (Gitee Pages /)');
