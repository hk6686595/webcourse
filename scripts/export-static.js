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
console.log('static api written:', meta);
console.log('copied public -> docs (Gitee Pages /docs)');
