// Node.js 教程 16–20：实战与进阶
const nodejs16 = {
  id: 'nodejs-streams',
  title: '16. 流（Streams）：大文件与高性能处理',
  category: '进阶',
  version: '18+',
  level: '高级',
  summary: '四种流类型、管道传输、读写大文件的正确姿势与背压。',
  detail: [
    '流是可分块的异步数据序列，用于大文件/网络传输出，避免一次性载入内存。',
    '四种类型：Readable（可读）、Writable（可写）、Duplex（可读可写）、Transform（转换）。',
    '管道：readable.pipe(writable) 自动管理流速（背压），如把文件流回给响应。',
    '处理大 CSV：fs.createReadStream("big.csv", { highWaterMark: 1<<20 }).pipe(...)。',
    'Transform 流可边读边转换（如 gzip、行转 JSON）。',
    '内置：zlib.createGzip、csv-parse、pipeline()（推荐，自动处理错误）。',
  ],
  notes: [
    '流实验用 stream/promises 的 pipeline 更简洁，且正确处理错误与清理。',
    'API 响应大 JSON 时 streaming 避免占用内存；对客户端需处理分块响应。',
  ],
  example: `const fs = require('node:fs');
const zlib = require('node:zlib');
const { pipeline } = require('node:stream/promises');
const http = require('node:http');

// 1. 文件 → 响应（流式，不占内存）
http.createServer((req, res) => {
  const stream = fs.createReadStream('big-file.txt');
  stream.pipe(res);
}).listen(4000);

// 2. 管道 + gzip 转换
async function compress() {
  await pipeline(
    fs.createReadStream('data.log'),
    zlib.createGzip(),
    fs.createWriteStream('data.log.gz')
  );
  console.log('压缩完成');
}
compress();

// 3. 逐行读取大文件
const readline = require('node:readline');
async function processLines() {
  const rl = readline.createInterface({
    input: fs.createReadStream('big.log'),
  });
  for await (const line of rl) {
    // 处理每一行
  }
}`,
};

const nodejs17 = {
  id: 'nodejs-worker-threads',
  title: '17. 多线程与 Worker：处理 CPU 密集任务',
  category: '进阶',
  version: '18+',
  level: '高级',
  summary: '用 worker_threads 把耗时计算放到独立线程，避免阻塞事件循环。',
  detail: [
    'Node 单线程跑 JS，CPU 密集会阻塞事件循环，队列中的 I/O 回调全部延后。',
    'worker_threads：每个 Worker 独立线程（有独立 V8 实例），互不阻塞。',
    '通信通过 postMessage 传递消息（结构化克隆，不共享内存）。',
    'cluster 模块：多进程共享端口，适合多核扩 CPU；与 worker 用途不同。',
    'child_process：调用外部程序（ffmpeg 等）也常用。',
    '实践上先确认 CPU 密集业务是否真的需要多线程，能异步化先异步化。',
  ],
  notes: [
    'worker 之间数据用 Buffer/ArrayBuffer 可转移所有权避免拷贝。',
    'ImageMagick/图像缩放可交给子进程，比纯 JS 更快也更省主线程。',
  ],
  example: `// worker.js
const { parentPort } = require('node:worker_threads');

parentPort.on('message', (n) => {
  let sum = 0;
  for (let i = 0; i < n; i++) sum += i;
  parentPort.postMessage(sum);   // 结果回主线程
});`,
  example2: `// main.js
const { Worker } = require('node:worker_threads');

function computeInWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js');
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.postMessage(n);
  });
}

(async () => {
  console.time('worker');
  const result = await computeInWorker(1_000_000_000);
  console.timeEnd('worker');
  console.log('结果:', result);   // 主线程不被阻塞
})();`,
};

const nodejs18 = {
  id: 'nodejs-todo-rest',
  title: '18. 实战：Todo REST API 完整项目',
  category: '实战',
  version: '18+',
  level: '进阶',
  summary: '把前面所学整合成一个带持久化存储、校验与错误处理的完整 API 项目。',
  detail: [
    '项目结构：server.js + src/routes、src/db；用 better-sqlite3 持久化。',
    '功能：Todo 增删改查（CRUD）、标记完成、搜索过滤、分页。',
    '数据校验：参数必填、类型、长度；返回 400 和清晰错误信息。',
    '持久化：SQLite 文件数据库，比内存数组可重启保留。',
    '用错误中间件统一处理，友好返回 JSON。',
    '提供 curl/示例测试每一接口。',
  ],
  notes: [
    '先定义好数据模型与接口契约，再写实现，测试更顺畅。',
    '可扩展：加 JWT 用户、国际化错误信息、单元测试。',
  ],
  example: `const express = require('express');
const Database = require('better-sqlite3');
const app = express();
app.use(express.json());

// 初始化数据库
const db = new Database('todos.db');
db.exec(\`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)\`);

// 列表（支持 ?done=1 过滤）
app.get('/todos', (req, res) => {
  const { done } = req.query;
  let rows;
  if (done === '0' || done === '1') {
    rows = db.prepare('SELECT * FROM todos WHERE done = ?').all(Number(done));
  } else {
    rows = db.prepare('SELECT * FROM todos ORDER BY id DESC').all();
  }
  res.json(rows);
});

// 创建
app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title 必填且为字符串' });
  }
  const info = db.prepare('INSERT INTO todos (title) VALUES (?)').run(title);
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// 切换完成状态
app.patch('/todos/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: '不存在' });
  db.prepare('UPDATE todos SET done = ? WHERE id = ?').run(t.done ? 0 : 1, t.id);
  res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(t.id));
});

app.listen(3000, () => console.log('Todo API 已启动'));`,
};

const nodejs19 = {
  id: 'nodejs-deploy',
  title: '19. 部署与上线：Docker、PM2、反向代理',
  category: '实战',
  version: '18+',
  level: '高级',
  summary: '把 Node 应用部署到生产：PM2 守护、Docker 容器、Nginx 反向代理与环境配置。',
  detail: [
    'PM2：进程守护、自动重启、日志与负载均衡（cluster 模式）。',
    'pm2 start server.js --name app；pm2 save && pm2 startup 开机自启。',
    'Dockerfile：多阶段构建 + node:20-alpine 基础镜像 + 非 root 用户。',
    'Nginx：80 端口转发到 Node 端口，静态资源由 Nginx 直接服务。',
    '健康检查与优雅退出：SIGTERM 时关闭 keep-alive、等待请求完成。',
    '日志集中与管理、监控告警（如 PM2 + Sentry）。',
  ],
  notes: [
    '环境变量与密钥绝不打进镜像，用运行时注入。',
    '云平台（Vercel/Railway/Fly）能大幅简化部署，适合小团队。',
  ],
  example: `# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
RUN addgroup -S app && adduser -S app -G app && chown -R app /app
USER app
EXPOSE 3000
CMD ["node", "server.js"]`,
  example2: `# Nginx 反向代理配置示例
server {
  listen 80;
  server_name example.com;

  # 静态资源交给 Nginx
  location /static/ { alias /var/www/app/public/; }

  # API 转发给 Node
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

# PM2
# pm2 start server.js --name webcourse -i max
# pm2 save
# pm2 startup`,
};

const nodejs20 = {
  id: 'nodejs-roadmap',
  title: '20. Node.js 学习路线与生态速览',
  category: '实战',
  version: '18+',
  level: '高级',
  summary: '系统总结 Node 后端学习路径：核心 → 框架 → 工程化 → 拓展方向。',
  detail: [
    '阶段一（已覆盖）：模块、异步、核心模块（fs/http/path）、事件、流。',
    '阶段二：Express 框架、中间件、错误处理、REST 设计、数据库集成。',
    '阶段三：认证（JWT）、文件/上传、测试（jest/vitest）、Docker 部署。',
    '进阶方向 A：TypeScript 化（tsx/ts-node）、NestJS 企业级框架。',
    '进阶方向 B：实时通信（Socket.IO）、消息队列（BullMQ）、GraphQL。',
    '工程化：ESLint/Prettier、CI/CD、观测（OpenTelemetry）、性能分析（clinic）。',
  ],
  notes: [
    '动手写 2-3 个完整小项目（博客 API、实时聊天、图片站）是巩固关键。',
    '官方文档 + 《Node.js 设计模式》是不错的进阶参考。',
  ],
  example: `# 常用命令速查
npm init -y
npm install express cors dotenv better-sqlite3
npm install --save-dev jest supertest

# 项目骨架
src/
  server.js       # 入口
  app.js          # express 应用
  routes/         # 路由
  controllers/
  services/
  models/         # 数据访问
  middleware/     # 中间件（auth、errors、validate）
tests/
.env
Dockerfile

# 推荐进阶资源
# - Node.js 官方文档（模块 API）
# - Express 官方文档
# - Node.js Design Patterns（书籍）
# - roadmap.sh/nodejs（路线图）`,
};

if (typeof module !=="undefined") module.exports = { nodejs16, nodejs17, nodejs18, nodejs19, nodejs20 };