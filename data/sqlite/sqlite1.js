// SQLite 教程 1–5：入门与基础 CRUD
const sqlite1 = {
  id: 'sqlite-intro',
  title: '1. SQLite 是什么：零配置嵌入式数据库',
  category: '入门',
  version: '3.46+',
  level: '入门',
  summary: 'SQLite 是一个自包含、零配置、事务性的嵌入式关系数据库引擎，世界上部署最广泛的数据库。',
  detail: [
    'SQLite 不是 C/S 架构，而是一个库——直接读写普通磁盘文件，无需独立服务进程。',
    '数据库是一个单一 .db 文件，便于备份、迁移和版本控制。',
    '支持大部分 SQL92 标准：表、索引、视图、触发器、事务（ACID）。',
    '轻量：编译后 < 1MB，无需安装、配置或管理。',
    '广泛存在：每个 Android / iOS 设备、Chrome / Firefox / Safari 都在用。',
    'SQLite 适合：嵌入式/移动应用、桌面软件、中小型网站原型、测试/开发环境。',
  ],
  notes: [
    'SQLite 不适合高并发写入场景（多个 Writer 会阻塞），不适合超大数据集（TB 级）。',
    'SQLite 没有用户管理、权限系统——由文件系统权限控制。',
  ],
  example: `-- 查看版本
sqlite3 --version

# 创建/打开数据库（文件不存在则自动创建）
sqlite3 test.db

-- 在 sqlite3 提示符中的基本操作
sqlite> .help        -- 查看帮助
sqlite> .tables      -- 列出所有表
sqlite> .schema      -- 查看表结构
sqlite> .quit        -- 退出`,
};

const sqlite2 = {
  id: 'sqlite-create',
  title: '2. 创建数据库与表：数据类型与约束',
  category: '入门',
  version: '3.46+',
  level: '入门',
  summary: '学习 CREATE DATABASE / CREATE TABLE，SQLite 的列类型（INTEGER / TEXT / REAL / BLOB / NULL）和常用约束。',
  detail: [
    'SQLite 使用动态类型（Type Affinity）：列类型只是一个"建议"，实际按值类型存储。',
    '五种存储类：NULL（空）、INTEGER（整型 1-8 字节）、REAL（浮点 8 字节）、TEXT（字符串 UTF-8/16）、BLOB（二进制）。',
    'BOOLEAN 用 INTEGER 0/1 表示；DATETIME 用 TEXT（ISO8601 字符串）或 INTEGER（Unix 时间戳）。',
    'PRIMARY KEY：若为 INTEGER PRIMARY KEY，它自动成为 AUTOINCREMENT 的自增列。',
    'NOT NULL / DEFAULT / UNIQUE / CHECK 约束与标准 SQL 一致。',
    'CREATE TABLE IF NOT EXISTS 避免重复创建错误。',
  ],
  notes: [
    'SQLite 的 ALTER TABLE 功能有限——仅支持 RENAME TABLE 和 ADD COLUMN。',
    '若需要复杂 schema 迁移，通常需要重建表（CREATE NEW → INSERT INTO SELECT → DROP OLD → RENAME）。',
  ],
  example: `CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL,
  email TEXT    NOT NULL UNIQUE,
  age   INTEGER DEFAULT 18,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id  INTEGER NOT NULL,
  title    TEXT    NOT NULL,
  body     TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`,
};

const sqlite3 = {
  id: 'sqlite-insert',
  title: '3. 插入数据：INSERT 语法与事务',
  category: 'CRUD',
  version: '3.46+',
  level: '入门',
  summary: '单行插入、批量插入、INSERT OR REPLACE / INSERT OR IGNORE 以及事务控制。',
  detail: [
    'INSERT INTO <table> (cols) VALUES (vals)：插入一行；不指定列名则要用所有列的相同顺序。',
    '多行插入：INSERT INTO <table> VALUES (v1), (v2), (v3) —— 避免逐行 INSERT 的性能问题。',
    'INSERT OR REPLACE：若违反 UNIQUE 约束则删除旧行插入新行。',
    'INSERT OR IGNORE：若违反约束则静默跳过。',
    '事务：BEGIN / COMMIT / ROLLBACK。默认每条 DML 自动触发隐式事务。',
    '事务批量插入速度远胜逐行插入——减少磁盘 fsync。',
  ],
  notes: [
    'SQLite 是嵌入式库，默认串行化——一个长事务会阻塞其他读操作。',
    'WAL 模式（PRAGMA journal_mode=WAL）允许并发读取和写入。',
  ],
  example: `-- 单行插入
INSERT INTO users (name, email, age) VALUES ('Alice', 'alice@ex.com', 25);

-- 多行插入
INSERT INTO posts (user_id, title, body) VALUES
  (1, 'Hello', 'First post'),
  (1, 'Second', 'Another post');

-- 事务批量插入（速度提升百倍）
BEGIN;
INSERT INTO users (name, email) VALUES ('Bob', 'bob@ex.com');
INSERT INTO users (name, email) VALUES ('Carol', 'carol@ex.com');
COMMIT;

-- INSERT OR REPLACE（若 email UNIQUE 冲突则替换）
INSERT OR REPLACE INTO users (name, email, age) VALUES ('Alice', 'alice@ex.com', 26);`,
};

const sqlite4 = {
  id: 'sqlite-select',
  title: '4. 查询基础：SELECT / WHERE / ORDER BY / LIMIT',
  category: 'CRUD',
  version: '3.46+',
  level: '入门',
  summary: '掌握 SELECT 查询的常用子句：过滤、排序、分页、列别名。',
  detail: [
    'SELECT col1, col2 FROM table：选择特定列；SELECT * 选择全部（仅限临时查询）。',
    'WHERE col = \'val\' / col > 10 / col LIKE \'%pattern%\' / col IN (1,2,3) 等过滤条件。',
    'ORDER BY col ASC/DESC：排序；可组合多列 ORDER BY a ASC, b DESC。',
    'LIMIT N OFFSET M：分页（LIMIT 10 OFFSET 0 第一页，OFFSET 10 第二页）。',
    '列别名：SELECT col AS alias FROM；表别名：FROM table AS t。',
    'DISTINCT 去重；WHERE 后面可用 AND / OR / () 组合条件。',
  ],
  notes: [
    'OFFSET + LIMIT 在大表中越往后越慢——分页大量数据时推荐用 WHERE id > last_id LIMIT N（键集分页）。',
    'LIKE 默认大小写不敏感（除非列使用 BINARY 排序）。',
  ],
  example: `-- 基本查询
SELECT name, email FROM users WHERE age > 20 ORDER BY age DESC;

-- 分页
SELECT * FROM posts ORDER BY id DESC LIMIT 10 OFFSET 20;

-- 搜索（注意 % 性能）
SELECT * FROM users WHERE name LIKE '%li%';

-- 列别名与表达式
SELECT name, age * 2 AS double_age FROM users;

-- 去重
SELECT DISTINCT age FROM users ORDER BY age;`,
};

const sqlite5 = {
  id: 'sqlite-update-delete',
  title: '5. 更新与删除：UPDATE / DELETE / 外键级联',
  category: 'CRUD',
  version: '3.46+',
  level: '入门',
  summary: 'UPDATE 和 DELETE 的语法、WHERE 条件的重要性、外键约束与级联删除。',
  detail: [
    'UPDATE table SET col=val WHERE condition；务必写 WHERE，否则更新全部行。',
    'UPDATE 支持 SET col=col+1 等表达式。',
    'DELETE FROM table WHERE condition；同样务必备份或先用 SELECT 验证条件。',
    'PRAGMA foreign_keys = ON；开启外键约束（默认关闭！）。',
    'ON DELETE CASCADE：删除主表时自动删除关联子表行。',
    'ON DELETE SET NULL：删除主表时子表的外键列置 NULL。',
  ],
  notes: [
    'SQLite 默认不检查外键约束——必须每次连接时执行 PRAGMA foreign_keys = ON。',
    '批量 UPDATE/DELETE 前先在事务中进行，方便回滚。',
  ],
  example: `-- 启用外键
PRAGMA foreign_keys = ON;

-- 带级联删除的外键
CREATE TABLE comments (
  id      INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  content TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 更新（仅 Alice 的年龄）
UPDATE users SET age = 26 WHERE name = 'Alice';

-- 删除前验证
SELECT * FROM posts WHERE user_id = 1;
DELETE FROM users WHERE id = 1;
-- 若外键 CASCADE，则 posts(id为1) 和 comments 也被删除`,
};

if (typeof module !== 'undefined') module.exports = { sqlite1, sqlite2, sqlite3, sqlite4, sqlite5 };