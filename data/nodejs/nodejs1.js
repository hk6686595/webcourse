// Node.js 教程 1–5：入门与核心概念
const nodejs1 = {
  id: 'nodejs-intro',
  title: '1. Node.js 是什么：JavaScript 服务端运行时',
  category: '入门',
  version: '18+',
  level: '入门',
  summary: '理解 Node.js 的事件驱动、非阻塞 I/O 模型，与浏览器的区别，以及安装与首次运行。',
  detail: [
    'Node.js 基于 V8 引擎（Chrome 的 JS 引擎），让 JavaScript 能在服务端运行，2009 年由 Ryan Dahl 创建。',
    '核心特点：单线程 + 事件循环 + 非阻塞 I/O，适合高并发 I/O 密集场景（Web 服务、API）。',
    '与浏览器区别：没有 DOM/BOM，但有 fs、http、path 等系统模块，可直接操作文件、网络、进程。',
    'npm（Node Package Manager）是内置包管理器，拥有世界上最大的开源软件注册表。',
    '版本管理：Node 偶数版本为 LTS（长期支持），生产环境推荐 LTS。',
    '适合场景：REST API、实时应用、微服务、CLI 工具、前端构建工具；不适合 CPU 密集（图像处理）任务。',
  ],
  notes: [
    '单线程 + 异步意味着不要在请求处理中做同步阻塞操作（如 JSON.parse 大对象、复杂计算）。',
    '也可用 worker_threads 处理 CPU 密集任务，或用其他语言分担。',
  ],
  example: `// 最简单的 HTTP 服务器
const http = require('node:http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Hello, Node.js!');
});

server.listen(3000, () => {
  console.log('服务已启动: http://localhost:3000');
});
// 运行: node server.js`,
  example2: `# 安装与版本
node -v          # v20.x
npm -v

# 初始化项目
npm init -y

# 安装依赖
npm install express

# 运行脚本
node app.js

# 推荐用 nvm 管理多个 Node 版本
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`,
};

const nodejs2 = {
  id: 'nodejs-modules',
  title: '2. 模块系统：CommonJS 与 ES Module',
  category: '入门',
  version: '18+',
  level: '入门',
  summary: '理解 require/exports（CommonJS）与 import/export（ESM）两套模块系统及其差异。',
  detail: [
    'CommonJS（CJS）：默认模块系统，用 require() 导入、module.exports 导出，模块同步加载。',
    'ES Module（ESM）：现代标准，用 import/export 语法，支持静态分析和树摇。',
    '启用 ESM：package.json 加 "type": "module" 或用 .mjs 扩展名。',
    '内置模块：node:前缀（如 node:fs、node:path）显式标识，清晰且可升级。',
    '导出方式：module.exports = 单个值，或 exports.a = 1 多个；ESM 用 export { a, b }。',
    '导入默认导出与命名导出：import def, { a } from "pkg"。',
  ],
  notes: [
    '老项目多 CommonJS；新项目推荐 ESM（尤其前端生态）。',
    '两种混用时用 dynamic import() 或 require() 兼容。',
  ],
  example: `// -------- CommonJS (math.js) --------
function add(a, b) { return a + b; }
module.exports = { add };
// 或 module.exports.add = add;

// 使用
const { add } = require('./math');
console.log(add(2, 3));   // 5`,
  example2: `// -------- ES Module (math.mjs 或 type:module) --------
export function add(a, b) { return a + b; }
export default function sub(a, b) { return a - b; }

// 使用
import sub, { add } from './math.mjs';
console.log(add(2, 3), sub(5, 2));

// 动态导入
const mod = await import('./math.mjs');`,
};

const nodejs3 = {
  id: 'nodejs-async-basics',
  title: '3. 异步编程基础：回调、Promise、async/await',
  category: '异步',
  version: '18+',
  level: '入门',
  summary: '掌握事件循环下的三种异步写法：回调、Promise 链、async/await，及错误处理。',
  detail: [
    'Node 是异步的：fs.readFile、http 请求、数据库操作等都返回 Promise 或使用回调。',
    '回调（Callback）：旧式 API，容易导致"回调地狱"（嵌套过深）。',
    'Promise：表示未来完成的值，支持链式 .then/.catch，解决回调地狱。',
    'async/await：基于 Promise 的语法糖，让异步代码像同步那样可读。',
    '所有 async 函数返回 Promise；await 只能在 async 函数内使用。',
    '错误处理：try/catch 捕获 await 的错误；Promise 用 .catch 传递。',
  ],
  notes: [
    'fs.promises 提供了 Promise 版本的 fs API，推荐使用。',
    '空 async 函数返回 undefined 的 Promise；await 一个非 Promise 值则直接返回该值。',
  ],
  example: `const fs = require('node:fs/promises');

// Promise 链
fs.readFile('a.txt', 'utf8')
  .then(data => { console.log(data); return fs.readFile('b.txt', 'utf8'); })
  .then(data => console.log(data))
  .catch(err => console.error('出错:', err));

// async/await（更清晰）
async function readAll() {
  try {
    const a = await fs.readFile('a.txt', 'utf8');
    const b = await fs.readFile('b.txt', 'utf8');
    console.log(a, b);
  } catch (err) {
    console.error('出错:', err);
  }
}
readAll();

// 并发（同时读取）
Promise.all([
  fs.readFile('a.txt', 'utf8'),
  fs.readFile('b.txt', 'utf8'),
]).then(([a, b]) => console.log(a, b));`,
};

const nodejs4 = {
  id: 'nodejs-eventemitter',
  title: '4. EventEmitter：事件机制',
  category: '异步',
  version: '18+',
  level: '入门',
  summary: '认识 Node 的事件驱动核心 EventEmitter，自定义事件、监听与一次触发。',
  detail: [
    'events 模块的 EventEmitter 是实现事件驱动的基础，很多内置对象（http.Server、stream）继承自它。',
    '关键方法：on() 监听、once() 只触发一次、emit() 触发、off()/removeListener() 移除。',
    '参数传递：emit 除事件名外的参数会传给监听回调。',
    'error 事件特殊：若触发 error 且无人监听，进程会抛异常崩溃。',
    'listenerCount() 查看监听数量；事件可自定义任意名称。',
    '同步触发：emit 是同步的（同一 tick 顺序执行），但如果监听了 async 回调需自行 await 编排。',
  ],
  notes: [
    '自定义类继承 EventEmitter，即可在实例上使用事件能力。',
    '内存管理：不需要的监听要 off，否则对象无法被 GC，造成内存泄漏。',
  ],
  example: `const EventEmitter = require('node:events');

class Timer extends EventEmitter {
  start(seconds) {
    this.emit('start', seconds);
    setTimeout(() => this.emit('tick', seconds), 500);
    setTimeout(() => this.emit('done', seconds), 1500);
  }
}

const t = new Timer();
t.on('start', (s) => console.log('开始，共', s, '秒'));
t.once('tick', () => console.log('触发一次 tick'));
t.on('done', () => console.log('结束'));

t.start(3);`,
};

const nodejs5 = {
  id: 'nodejs-fs-path',
  title: '5. 文件系统与路径：fs / path',
  category: '核心模块',
  version: '18+',
  level: '入门',
  summary: '读写文件、目录操作、路径处理等常用 fs 与 path 用法。',
  detail: [
    'fs 模块：fs.promises（Promise 版）读写文件、目录、监视变化。',
    '读文件：readFile；写文件：writeFile/appendFile；删除：unlink/rm。',
    '目录：mkdir、readdir（列目录）、rmdir、stat 获取信息。',
    'path 模块：join、resolve（绝对路径）、dirname、basename、extname。',
    '__dirname 当前模块目录（CJS）；ESM 用 import.meta.url + fileURLToPath。',
    '大文件用流（fs.createReadStream）逐块处理，避免一次性读入内存。',
  ],
  notes: [
    '推荐 all-in-Promise 风格：const fs = require("node:fs/promises")。',
    '路径拼接用 path.join，避免手工拼 "/" 的跨平台问题。',
  ],
  example: `const fs = require('node:fs/promises');
const path = require('node:path');

async function demo() {
  const dir = path.join(__dirname, 'data');
  await fs.mkdir(dir, { recursive: true });

  // 写文件
  await fs.writeFile(path.join(dir, 'hello.txt'), '你好 Node\n');

  // 读文件
  const content = await fs.readFile(path.join(dir, 'hello.txt'), 'utf8');
  console.log('内容:', content.trim());

  // 列目录
  const files = await fs.readdir(dir);
  console.log('文件:', files);

  // 文件信息
  const stat = await fs.stat(path.join(dir, 'hello.txt'));
  console.log('大小:', stat.size, '字节');

  // 删除
  await fs.unlink(path.join(dir, 'hello.txt'));
}
demo();`,
};

if (typeof module !=="undefined") module.exports = { nodejs1, nodejs2, nodejs3, nodejs4, nodejs5 };