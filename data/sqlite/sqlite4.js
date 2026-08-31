// SQLite 教程 16–18：实战与语言绑定
const sqlite16 = {
  id: 'sqlite-python',
  title: '16. Python 中操作 SQLite：sqlite3 模块',
  category: '实战',
  version: '3.46+',
  level: '进阶',
  summary: '使用 Python 标准库 sqlite3 连接、查询和操作 SQLite 数据库。',
  detail: [
    'Python 标准库自带 sqlite3 模块——无需 pip install。',
    "sqlite3.connect('file.db') 连接数据库（不存在则创建）。",
    "cursor.execute('SQL') 执行语句；fetchone() / fetchall() / fetchmany(N) 获取结果。",
    'execute 的 ? 占位符防止 SQL 注入——绝不使用 f-string 拼接 SQL。',
    'connection.commit() 提交事务；connection.rollback() 回滚。',
    "WAL 模式：connection.execute('PRAGMA journal_mode=WAL')。",
  ],
  notes: [
    '使用 with 语句可自动提交/回滚：with con: con.execute(...)。',
    'SQLite 是单 Writer——多线程使用同一个 connection 需加锁或使用 queue 模式。',
  ],
  example: `import sqlite3

# 连接
conn = sqlite3.connect('app.db')
conn.execute('PRAGMA journal_mode=WAL')
conn.execute('PRAGMA foreign_keys=ON')

# 创建表
conn.execute('''CREATE TABLE IF NOT EXISTS tasks (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done  INTEGER DEFAULT 0
)''')

# 插入（安全占位符）
conn.execute('INSERT INTO tasks (title) VALUES (?)', ('Buy milk',))
conn.commit()

# 查询
cur = conn.execute('SELECT * FROM tasks WHERE done=0')
rows = cur.fetchall()
print(rows)

# with 自动提交
with conn:
    conn.execute('UPDATE tasks SET done=1 WHERE id=?', (1,))`,
};

const sqlite17 = {
  id: 'sqlite-nodejs',
  title: '17. Node.js 中操作 SQLite：better-sqlite3',
  category: '实战',
  version: '3.46+',
  level: '进阶',
  summary: '在 Node.js 中使用 better-sqlite3 同步 API 操作 SQLite。',
  detail: [
    'better-sqlite3 是目前最流行的 Node.js SQLite 库——同步 API，性能优于异步的 sqlite3。',
    'npm install better-sqlite3 安装。',
    "const Database = require('better-sqlite3'); const db = new Database('app.db');",
    "db.prepare('SQL').run([params]) 执行 INSERT/UPDATE/DELETE；.all() / .get() 查询。",
    '支持事务：const tx = db.transaction(() => {...}); tx();',
    "WAL 模式：db.pragma('journal_mode = WAL');",
  ],
  notes: [
    'better-sqlite3 使用原生扩展——编译需 C++ 工具链。',
    '同步 API 在 Node.js 事件循环中不会阻塞（SQLite 本身很快），但大量 I/O 场景需注意。',
  ],
  example: `const Database = require('better-sqlite3');
const db = new Database('app.db');
db.pragma('journal_mode = WAL');

db.exec(\`CREATE TABLE IF NOT EXISTS tasks (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  done  INTEGER DEFAULT 0
)\`);

// 插入
const stmt = db.prepare('INSERT INTO tasks (title) VALUES (?)');
stmt.run('Buy milk');
stmt.run('Write code');

// 查询
const rows = db.prepare('SELECT * FROM tasks WHERE done=0').all();
console.log(rows);

// 事务批量插入
const insert = db.prepare('INSERT INTO tasks (title) VALUES (?)');
const tx = db.transaction((titles) => {
  for (const t of titles) insert.run(t);
});
tx(['Task1', 'Task2', 'Task3']);`,
};

const sqlite18 = {
  id: 'sqlite-project-lite',
  title: '18. 实战：用 SQLite 搭建轻量级知识库',
  category: '实战',
  version: '3.46+',
  level: '高阶',
  summary: '综合运用所学，实现一个标签系统、全文搜索、导出/备份的知识库应用。',
  detail: [
    '需求：管理笔记，可打标签、全文搜索、导出 Markdown。',
    '表设计：notes(id, title, body, created_at, updated_at)、tags(id, name)、note_tags(note_id, tag_id)。',
    'FTS5 全文搜索实现快速笔记搜索。',
    '触发器自动更新 updated_at 时间戳。',
    '使用 .dump 或 python 脚本导出为 Markdown 文件。',
    '备份策略：cron 定期执行 .backup 到另一块磁盘。',
  ],
  notes: [
    '多对多关系（标签）需要中间表——这是关系数据库的核心设计模式。',
    'FTS5 虽然快，但索引文件体积约为原数据的 1.5–2 倍。',
  ],
  example: `-- 知识库完整 Schema
CREATE TABLE notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  body       TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- 全文搜索
CREATE VIRTUAL TABLE notes_fts USING fts5(title, body, content=notes, content_rowid=id);

-- 触发器：更新后自动同步 FTS
CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
END;

-- 查询：带标签过滤的搜索
SELECT n.id, n.title, GROUP_CONCAT(t.name) AS tags
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.id IN (
  SELECT rowid FROM notes_fts WHERE notes_fts MATCH 'sqlite database'
)
GROUP BY n.id;`,
};

if (typeof module !== 'undefined') module.exports = { sqlite16, sqlite17, sqlite18 };