// Node.js 教程 11–15：进阶主题
const nodejs11 = {
  id: 'nodejs-error-handling',
  title: '11. 错误处理最佳实践',
  category: '进阶',
  version: '18+',
  level: '进阶',
  summary: '统一错误处理、async 包装器、业务与系统错误区分、日志记录。',
  detail: [
    '异步错误：async 中间件抛错需流转到错误处理中间件，手动 try/catch 或包装。',
    '统一错误处理中间件 (err, req, res, next) 集中发响应，避免每个路由重复。',
    '区分错误类型：4xx 是客户端问题，5xx 是服务器问题；用状态码表达。',
    '自定义错误对象：带 statusCode/errors 字段，便于中间件按状态码响应。',
    '开启 NODE_ENV=production 时不要向客户端回传堆栈/内部细节。',
    '日志：用 morgan 记请求，用 pino/winston 记应用日志，方便排查。',
  ],
  notes: [
    'Async handler 包装器：const wrap = fn => (req,res,next) => fn(req,res,next).catch(next);',
    '未被捕获的异步拒绝用 process.on("unhandledRejection") 兜底。',
  ],
  example: `const express = require('express');
const app = express();
app.use(express.json());

// 包装 async 处理函数，把错误交给错误中间件
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// 自定义错误类
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

app.get('/data/:id', wrap(async (req, res) => {
  const data = await Promise.resolve(null);
  if (!data) throw new HttpError(404, '数据不存在');
  res.json(data);
}));

// 统一错误处理
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('服务器错误:', err);
  res.status(status).json({
    error: status >= 500 ? '服务器内部错误' : err.message,
  });
});

app.listen(3000);`,
};

const nodejs12 = {
  id: 'nodejs-database',
  title: '12. 数据库集成：SQLite 与 PostgreSQL',
  category: '数据库',
  version: '18+',
  level: '进阶',
  summary: '在 Node 中集成 SQLite（better-sqlite3）与 PostgreSQL（pg），异步与参数化查询。',
  detail: [
    'SQLite：轻量嵌入式数据库，适合原型与本地；better-sqlite3 是同步 API、简单高效。',
    'PostgreSQL：生产级关系型数据库，用 pg 模块，支持连接池。',
    '参数化查询（$1, ? 占位符）防止 SQL 注入——绝不用字符串拼接 SQL。',
    '异步查询 await query(...)；事务用 BEGIN/COMMIT/ROLLBACK 或 ORM。',
    '连接管理：pg.Pool 维护连接池；SQLite 单文件无需服务器。',
    'ORM 可选：Prisma / Sequelize / TypeORM，提升可维护性但增加抽象。',
  ],
  notes: [
    '用生态成熟的库（pg、mysql2、better-sqlite3）而非手写驱动。',
    '连接字符串/密码通过环境变量注入，绝不写死在代码或提交到 git。',
  ],
  example: `// ---------- SQLite (better-sqlite3) ----------
const Database = require('better-sqlite3');
const db = new Database('app.db');

db.exec(\`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE
)\`);

// 参数化插入
const ins = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
ins.run('Alice', 'a@example.com');
ins.run('Bob', 'b@example.com');

// 查询
const users = db.prepare('SELECT * FROM users').all();
console.log(users);`,
  example2: `// ---------- PostgreSQL (pg) ----------
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // 从环境变量读取
});

async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [1]);
  return rows;
}

// 事务
async function transfer(from, to, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, from]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, to]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}`,
};

const nodejs13 = {
  id: 'nodejs-env-config',
  title: '13. 环境变量与配置管理',
  category: '进阶',
  version: '18+',
  level: '进阶',
  summary: '用 dotenv 加载 .env、读取 process.env、配置校验与多环境管理。',
  detail: [
    '进程环境变量通过 process.env 读取，如 process.env.PORT。',
    'dotenv 库：将 .env 文件内容加载进 process.env（开发环境方便）。',
    '.env 文件不应提交 git（加入 .gitignore），只提交 .env.example 模板。',
    '配置集中：可建 config.js 统一导出校验后的配置对象。',
    '必填校验：缺少关键配置时启动即报错，避免运行时才暴露。',
    '多环境：.env.development / .env.production，按 NODE_ENV 选择加载。',
  ],
  notes: [
    '敏感信息（数据库密码、API key）只从环境变量读取，绝不硬编码。',
    'Node 18+ 原生支持 --env-file=.env 加载，可少用 dotenv。',
  ],
  example: `// 安装: npm install dotenv
// 入口第一行加载
require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    url: process.env.DATABASE_URL,
    name: process.env.DB_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
};

// 必填校验
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(\`缺少环境变量: \${key}\`);
    process.exit(1);
  }
}

console.log('端口:', config.port);

// .env 示例
// PORT=3000
// DATABASE_URL=postgres://user:pass@localhost:5432/app
// JWT_SECRET=please-change-me`,
};

const nodejs14 = {
  id: 'nodejs-auth-jwt',
  title: '14. 认证与授权：JWT 实战',
  category: '安全',
  version: '18+',
  level: '进阶',
  summary: '用 jsonwebtoken 签发/校验 JWT，实现注册登录与受保护路由。',
  detail: [
    'JWT：三段式 token（header.payload.signature），可自包含用户身份，无状态。',
    '登录流程：校验用户密码 → 签发 token → 前端保存（httpOnly cookie 或内存）→ 请求带 token。',
    '签发：jwt.sign({ uid }, secret, { expiresIn: "1d" })。',
    '校验：jwt.verify(token, secret) 得到 payload；过期会抛 TokenExpiredError。',
    '密码存储：绝不明文，用 bcrypt 的 hash/compare。',
    '中间件统一校验 Authorization: Bearer <token>，把用户注入 req.user。',
  ],
  notes: [
    'secret 必须足够长且来自环境变量；token 放 httpOnly cookie 比 localStorage 更防 XSS。',
    '需要撤销/登出所有会话时，考虑短时效 token + 刷新令牌，或维护黑名单。',
  ],
  example: `const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const users = [{ id: 1, name: 'a', pwdHash: '$2b$10$...' }];

// 注册（用 bcrypt 存哈希）
app.post('/register', async (req, res) => {
  const { name, password } = req.body;
  const pwdHash = await bcrypt.hash(password, 10);
  // 存库...
  res.status(201).json({ ok: true });
});

// 登录
app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  const u = users.find(x => x.name === name);
  if (!u || !(await bcrypt.compare(password, u.pwdHash)))
    return res.status(401).json({ error: '用户名或密码错误' });
  const token = jwt.sign({ uid: u.id }, SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// 鉴权中间件
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: '未登录' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token 无效或过期' });
  }
}

app.get('/profile', auth, (req, res) => res.json({ user: req.user }));
app.listen(3000);`,
};

const nodejs15 = {
  id: 'nodejs-file-upload',
  title: '15. 文件上传与处理：multer',
  category: '安全',
  version: '18+',
  level: '进阶',
  summary: '用 multer 处理 multipart 文件上传、大小/类型限制、静态回显与安全。',
  detail: [
    'multer 处理 multipart/form-data 文件上传，配合前端 <input type="file">。',
    '存储方式：磁盘（diskStorage）或内存（memoryStorage，用于二次处理）。',
    '限制：limits.fileSize 控制大小、fileFilter 校验 MIME/扩展名。',
    '保存后把文件路径/URL 存库，便于访问与回显。',
    '安全：校验真实类型（不只看扩展名）、限制大小、文件重命名（uuid 防覆盖）。',
    '更稳妥的文件上传可对接对象存储（S3/OSS），并加病毒扫描。',
  ],
  notes: [
    'multer 错误（如超大文件）要在错误中间件捕获并返回 413。',
    '不要信任客户端给的文件名，用服务端生成的唯一名保存。',
  ],
  example: `const express = require('express');
const multer = require('multer');
const crypto = require('node:crypto');
const path = require('node:path');
const app = express();

// 磁盘存储：自定义文件名
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext);   // 唯一文件名防止覆盖
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },        // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
    cb(ok ? null : new Error('仅支持图片'), ok);
  },
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ ok: true, path: req.file.filename });
});

// 回显静态文件
app.use('/uploads', express.static('uploads'));

// 处理 multer 错误
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

app.listen(3000);`,
};

if (typeof module !=="undefined") module.exports = { nodejs11, nodejs12, nodejs13, nodejs14, nodejs15 };