// Node.js 教程 6–10：HTTP 与 Express
const nodejs6 = {
  id: 'nodejs-http',
  title: '6. 原生 http 模块：构建 HTTP 服务器',
  category: 'http',
  version: '18+',
  level: '入门',
  summary: '用 node:http 创建服务器、解析请求、返回响应、路由分发。',
  detail: [
    'http.createServer(handler) 创建服务器，handler 接收 (req, res)。',
    'req 常用：req.method（GET/POST）、req.url（路径+查询串）、req.headers。',
    '读取请求体：监听 req 的 data/end 事件，或收集 chunk 后 JSON.parse。',
    'res 常用：res.writeHead(状态码, 头)、res.end()、res.write()。',
    '设置 CORS / Content-Type 等响应头。',
    '生产环境通常用 Express 等框架封装，但理解原生 http 有助夯实基础。',
  ],
  notes: [
    'req.url 含查询参数，用 new URL(req.url, "http://x") 或 url 模块解析 pathname 和 query。',
    '请求体是流，需异步收集，稍不注意就会丢失或挂起。',
  ],
  example: `const http = require('node:http');

const server = http.createServer((req, res) => {
  const { method, url } = req;
  const path = new URL(url, 'http://localhost:3000').pathname;

  if (method === 'GET' && path === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: '首页' }));
  } else if (method === 'GET' && path === '/users') {
    res.end('用户列表');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => console.log('http://localhost:3000'));`,
  example2: `// 读取 JSON 请求体
http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      console.log('收到:', data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, echo: data }));
    });
  } else {
    res.writeHead(405); res.end('Method Not Allowed');
  }
}).listen(3000);`,
};

const nodejs7 = {
  id: 'nodejs-express',
  title: '7. Express 基础：搭建 Web 框架',
  category: 'express',
  version: '4.18+',
  level: '入门',
  summary: 'Express 的安装、路由、请求参数、响应方法与 JSON 支持。',
  detail: [
    'Express 是最流行的 Node Web 框架，安装：npm install express。',
    '基础结构：const app = express(); app.listen(port)。',
    '路由：app.get("/path", handler)、app.post、app.put、app.delete。',
    '路径参数：app.get("/users/:id", (req,res)=>{ req.params.id })。',
    '查询参数：req.query；请求体：使用 express.json() 中间件后 req.body。',
    '响应：res.json()、res.send()、res.status()、res.sendFile()。',
  ],
  notes: [
    '要读 JSON 请求体必须 app.use(express.json())。',
    '新版 Express 5 已正式发布，API 大体一致。',
  ],
  example: `const express = require('express');
const app = express();
app.use(express.json());   // 解析 JSON 请求体

// GET
app.get('/', (req, res) => {
  res.json({ message: '首页' });
});

// 路径参数
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id, q: req.query });
});

// POST
app.post('/users', (req, res) => {
  res.status(201).json({ created: req.body });
});

app.listen(3000, () => console.log('http://localhost:3000'));`,
};

const nodejs8 = {
  id: 'nodejs-middleware',
  title: '8. 中间件：Express 的核心机制',
  category: 'express',
  version: '4.18+',
  level: '进阶',
  summary: '理解中间件如何按序处理请求，编写自定义中间件与错误处理中间件。',
  detail: [
    '中间件是处理请求的函数 (req, res, next)，可修改 req/res、终止或调 next() 传给下一个。',
    '内置：express.json()、express.urlencoded()、express.static()。',
    '第三方：cors、morgan（日志）、helmet（安全头）。',
    '应用级：app.use(mw) 对所有请求；路由级：app.get("/x", mw, handler)。',
    'next() 传递控制权；不调用 next 也不 res 结束则请求挂起。',
    '错误处理中间件签名 (err, req, res, next)，放在所有路由之后。',
  ],
  notes: [
    '中间件顺序很重要：先记录日志、再解析体、最后路由。',
    '错误处理中间件必须有 4 个参数，Express 才会识别。',
  ],
  example: `const express = require('express');
const app = express();
app.use(express.json());

// 自定义日志中间件
app.use((req, res, next) => {
  console.log(req.method, req.url, Date.now());
  next();
});

// 鉴权中间件
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (token === 'secret') return next();
  res.status(401).json({ error: '未授权' });
}

app.get('/data', auth, (req, res) => {
  res.json({ data: '受保护的资源' });
});

// 错误处理中间件（必须 4 个参数）
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '服务器错误' });
});

app.listen(3000);`,
};

const nodejs9 = {
  id: 'nodejs-rest-api',
  title: '9. REST API 设计：完整 CRUD 服务',
  category: 'express',
  version: '4.18+',
  level: '进阶',
  summary: '结合路由、中间件、内存数据，构建一个完整的 RESTful CRUD 接口。',
  detail: [
    'REST 语义：GET 读、POST 创建、PUT/PATCH 更新、DELETE 删除。',
    '资源路径：POST /users 创建、GET /users/:id 获取单个。',
    '状态码：201 创建成功、204 删除成功、400 参数错误、404 不存在、409 冲突。',
    '统一响应结构与错误处理，客户端易于解析。',
    '用数组/内存模拟数据库，后续可替换为真实数据库。',
    '密码等敏感字段不要返回给客户端。',
  ],
  notes: [
    'id 生成可用 crypto.randomUUID()，避免自增撞车。',
    'PUT 全量更新、PATCH 部分更新，初学者常混淆。',
  ],
  example: `const express = require('express');
const crypto = require('node:crypto');
const app = express();
app.use(express.json());

let users = [];
const find = (id) => users.find(u => u.id === id);

// 列表
app.get('/users', (req, res) => res.json(users));

// 详情
app.get('/users/:id', (req, res) => {
  const u = find(req.params.id);
  if (!u) return res.status(404).json({ error: '用户不存在' });
  res.json(u);
});

// 创建
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: '缺少字段' });
  const user = { id: crypto.randomUUID(), name, email };
  users.push(user);
  res.status(201).json(user);
});

// 更新
app.put('/users/:id', (req, res) => {
  const u = find(req.params.id);
  if (!u) return res.status(404).json({ error: '用户不存在' });
  Object.assign(u, req.body);
  res.json(u);
});

// 删除
app.delete('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '用户不存在' });
  users.splice(idx, 1);
  res.status(204).end();
});

app.listen(3000, () => console.log('REST API http://localhost:3000'));`,
};

const nodejs10 = {
  id: 'nodejs-static-server',
  title: '10. 静态文件与部署：express.static 与前端托管',
  category: 'express',
  version: '4.18+',
  level: '入门',
  summary: '用 express.static 托管前端静态资源，配置 SPA 回退与缓存。',
  detail: [
    'app.use(express.static("public")) 托管 public 目录下的静态文件。',
    '可同时托管多个目录：app.use("/static", express.static("assets"))。',
    '浏览器缓存：Express 自动给静态文件设置 ETag/Last-Modified。',
    'SPA 回退：任何未匹配到静态文件的路由都返回 index.html（注意顺序在静态之后）。',
    '安全：不要托管含源码/配置的目录；用 helmet 设置安全响应头。',
    '常见部署：Vercel、Render、Railway、Docker；也常配合 Nginx 反向代理。',
  ],
  notes: [
    '静态文件路径与 API 路由冲突时，先挂载静态再定义 API 或反之按需求。',
    '生产上可用 Nginx 直接服务静态文件，Node 只处理 API，性能更好。',
  ],
  example: `const path = require('node:path');
const express = require('express');
const app = express();
app.use(express.json());

// 托管静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// SPA 回退：非 /api 的路径返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000);
// 目录结构:
// project/
//   public/index.html, style.css, app.js
//   server.js`,
};

if (typeof module !=="undefined") module.exports = { nodejs6, nodejs7, nodejs8, nodejs9, nodejs10 };