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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
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
      (f.title + f.summary + f.detail.join(' ') + f.example).toLowerCase().includes(kw));
  }
  res.json(list.map(({ id, title, category, version, level, summary }) =>
    ({ id, title, category, version, level, summary })));
});

app.get('/api/agent/:id', (req, res) => {
  const f = agentFeatures.find(x => x.id === req.params.id);
  if (!f) return res.status(404).json({ error: '特性不存在' });
  res.json(f);
});

const PORT = process.env.PORT || 3000;
require('./scripts/export-static');
app.listen(PORT, () => {
  console.log(`文档站已启动: http://localhost:${PORT}`);
});
