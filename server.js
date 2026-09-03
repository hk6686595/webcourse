const express = require('express');
const path = require('path');

// 文档站数据
const csharpFeatures = require('./data/csharpFeatures');
const cpp20Features = require('./data/cpp20Features');
// C++ 历史标准（11/14/17）
const cppHistory = require('./data/cppHistoryFeatures');
// JavaScript 语法详解
const jsFeatures = require('./data/jsFeatures');
// C# 设计模式（GoF 23）
const patterns = require('./data/patternsFeatures');
// Python 语法详解
const python = require('./data/pythonFeatures');
// TypeScript 语法详解
const tsFeatures = require('./data/tsFeatures');
// AI Agent 开发教程
const agentFeatures = require('./data/agentFeatures');
// Unity3D 游戏引擎教程
const unityFeatures = require('./data/unityFeatures');
// OpenCV 图像处理教程
const opencvFeatures = require('./data/opencvFeatures');
// Docker 容器教程
const dockerFeatures = require('./data/dockerFeatures');
// SQLite 数据库教程
const sqliteFeatures = require('./data/sqliteFeatures');
// Linux 命令教程
const linuxFeatures = require('./data/linuxFeatures');
// Linux 平台软件开发教程
const linuxdevFeatures = require('./data/linuxdevFeatures');
// Rust 语言教程
const rustFeatures = require('./data/rustFeatures');
// Python 数据分析（Pandas）教程
const pandasFeatures = require('./data/pandasFeatures');
// Node.js 后端教程
const nodejsFeatures = require('./data/nodejsFeatures');
// Git 版本控制教程
const gitFeatures = require('./data/gitFeatures');
// Redis 教程
const redisFeatures = require('./data/redisFeatures');
// 逆向工程基础教程
const reverseFeatures = require('./data/reverseFeatures');
// ASP.NET Core 开发教程
const aspnetFeatures = require('./data/aspnetFeatures');
// 网络编程教程
const networkFeatures = require('./data/networkFeatures');
// 游戏开发技术详解教程
const gamedevFeatures = require('./data/gamedevFeatures');
// 桌面 UI 开发教程
const desktopuiFeatures = require('./data/desktopuiFeatures');

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- C# 特性 ----------
app.get('/api/csharp', (req, res) => {
  const { category, level, q } = req.query;
  let list = csharpFeatures;
  if (category) list = list.filter(f => f.category === category);
  if (level) list = list.filter(f => f.level === level);
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
    // 搜索时只返回摘要，避免大 payload
    return res.json(list.map(({ id, title, version, category: c, level: l, summary }) =>
      ({ id, title, version, category: c, level: l, summary })));
  }
  res.json(list.map(({ id, title, version, category, level, summary }) =>
    ({ id, title, version, category, level, summary })));
});

app.get('/api/csharp/categories', (req, res) => {
  const counts = {};
  csharpFeatures.forEach(f => { counts[f.category] = (counts[f.category] || 0) + 1; });
  res.json(counts);
});

app.get('/api/csharp/:id', (req, res) => {
  const f = csharpFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- C++20 特性 ----------
app.get('/api/cpp20', (req, res) => {
  const { q } = req.query;
  let list = cpp20Features;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, status, level, summary }) =>
    ({ id, title, category, status, level, summary })));
});

app.get('/api/cpp20/:id', (req, res) => {
  const f = cpp20Features.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- C++11/14/17 特性 ----------
app.get('/api/cpp11', (req, res) => {
  const { q } = req.query;
  let list = cppHistory;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/cpp11/:id', (req, res) => {
  const f = cppHistory.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- JavaScript 语法 ----------
app.get('/api/js', (req, res) => {
  const { q } = req.query;
  let list = jsFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/js/:id', (req, res) => {
  const f = jsFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- C# 设计模式 ----------
app.get('/api/patterns', (req, res) => {
  const { q } = req.query;
  let list = patterns;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/patterns/:id', (req, res) => {
  const f = patterns.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Python 语法 ----------
app.get('/api/python', (req, res) => {
  const { q } = req.query;
  let list = python;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/python/:id', (req, res) => {
  const f = python.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- TypeScript 语法 ----------
app.get('/api/ts', (req, res) => {
  const { q } = req.query;
  let list = tsFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/ts/:id', (req, res) => {
  const f = tsFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- AI Agent 开发 ----------
app.get('/api/agent', (req, res) => {
  const { q } = req.query;
  let list = agentFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/agent/:id', (req, res) => {
  const f = agentFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Unity3D 教程 ----------
app.get('/api/unity', (req, res) => {
  const { q } = req.query;
  let list = unityFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/unity/:id', (req, res) => {
  const f = unityFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- OpenCV 教程 ----------
app.get('/api/opencv', (req, res) => {
  const { q } = req.query;
  let list = opencvFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/opencv/:id', (req, res) => {
  const f = opencvFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Docker 教程 ----------
app.get('/api/docker', (req, res) => {
  const { q } = req.query;
  let list = dockerFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/docker/:id', (req, res) => {
  const f = dockerFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- SQLite 教程 ----------
app.get('/api/sqlite', (req, res) => {
  const { q } = req.query;
  let list = sqliteFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/sqlite/:id', (req, res) => {
  const f = sqliteFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Linux 教程 ----------
app.get('/api/linux', (req, res) => {
  const { q } = req.query;
  let list = linuxFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/linux/:id', (req, res) => {
  const f = linuxFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Linux 平台软件开发教程 ----------
app.get('/api/linuxdev', (req, res) => {
  const { q } = req.query;
  let list = linuxdevFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/linuxdev/:id', (req, res) => {
  const f = linuxdevFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Rust 教程 ----------
app.get('/api/rust', (req, res) => {
  const { q } = req.query;
  let list = rustFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/rust/:id', (req, res) => {
  const f = rustFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Pandas 教程 ----------
app.get('/api/pandas', (req, res) => {
  const { q } = req.query;
  let list = pandasFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/pandas/:id', (req, res) => {
  const f = pandasFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Node.js 教程 ----------
app.get('/api/nodejs', (req, res) => {
  const { q } = req.query;
  let list = nodejsFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/nodejs/:id', (req, res) => {
  const f = nodejsFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Git 版本控制教程 ----------
app.get('/api/git', (req, res) => {
  const { q } = req.query;
  let list = gitFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/git/:id', (req, res) => {
  const f = gitFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- Redis 教程 ----------
app.get('/api/redis', (req, res) => {
  const { q } = req.query;
  let list = redisFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/redis/:id', (req, res) => {
  const f = redisFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- 逆向工程基础教程 ----------
app.get('/api/reverse', (req, res) => {
  const { q } = req.query;
  let list = reverseFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/reverse/:id', (req, res) => {
  const f = reverseFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- ASP.NET Core 开发教程 ----------
app.get('/api/aspnet', (req, res) => {
  const { q } = req.query;
  let list = aspnetFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/aspnet/:id', (req, res) => {
  const f = aspnetFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- 网络编程教程 ----------
app.get('/api/network', (req, res) => {
  const { q } = req.query;
  let list = networkFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/network/:id', (req, res) => {
  const f = networkFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- 游戏开发技术详解教程 ----------
app.get('/api/gamedev', (req, res) => {
  const { q } = req.query;
  let list = gamedevFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/gamedev/:id', (req, res) => {
  const f = gamedevFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

// ---------- 桌面 UI 开发教程 ----------
app.get('/api/desktopui', (req, res) => {
  const { q } = req.query;
  let list = desktopuiFeatures;
  if (q) {
    const kw = String(q).toLowerCase();
    list = list.filter(f =>
      (f.title + f.summary + f.detail.join(' ') + f.example + (f.example3 || '')).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});
app.get('/api/desktopui/:id', (req, res) => {
  const f = desktopuiFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

const PORT = process.env.PORT || 3000;
require('./scripts/export-static');
app.listen(PORT, () => {
  console.log(`文档站已启动: http://localhost:${PORT}`);
});
