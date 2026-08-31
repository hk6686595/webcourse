// SQLite 教程 11–15：高级特性与应用
const sqlite11 = {
  id: 'sqlite-view-trigger',
  title: '11. 视图与触发器：虚拟表与自动反应',
  category: '高级特性',
  version: '3.46+',
  level: '进阶',
  summary: '视图（CREATE VIEW）用于简化复杂查询；触发器（CREATE TRIGGER）在插入/更新/删除时自动执行。',
  detail: [
    '视图是虚拟表：其内容来自 SELECT，不存储数据，每次查询时动态生成。',
    'CREATE VIEW user_post_count AS SELECT u.id, u.name, COUNT(p.id) AS cnt FROM users u LEFT JOIN posts p ON u.id=p.user_id GROUP BY u.id;',
    '触发器在 INSERT / UPDATE / DELETE 之前或之后自动执行，可访问 OLD 和 NEW 行。',
    '触发器常用于：自动更新时间戳、记录修改日志、级联操作、数据验证。',
    'CREATE TRIGGER IF NOT EXISTS <name> BEFORE/AFTER INSERT/UPDATE/DELETE ON <table> BEGIN ... END;',
    'DROP VIEW / DROP TRIGGER 删除。',
  ],
  notes: [
    '触发器过多会影响写入性能——每个 DML 都需要检查所有触发器。',
    'SQLite 触发器不支持 FOR EACH STATEMENT（只支持 FOR EACH ROW）。',
  ],
  example: `-- 创建视图
CREATE VIEW user_post_count AS
SELECT u.id, u.name, COUNT(p.id) AS cnt
FROM users u LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;

-- 使用视图
SELECT * FROM user_post_count ORDER BY cnt DESC;

-- 触发器：记录删除操作
CREATE TABLE delete_log (
  table_name TEXT,
  old_id     INTEGER,
  deleted_at TEXT DEFAULT (datetime('now'))
);

CREATE TRIGGER log_user_delete AFTER DELETE ON users
BEGIN
  INSERT INTO delete_log (table_name, old_id) VALUES ('users', OLD.id);
END;`,
};

const sqlite12 = {
  id: 'sqlite-transaction',
  title: '12. 事务与并发控制：ACID / WAL / 隔离级别',
  category: '高级特性',
  version: '3.46+',
  level: '进阶',
  summary: 'SQLite 的 ACID 事务机制、WAL 模式、读写并发与死锁避免。',
  detail: [
    'ACID：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）。',
    '默认模式（DELETE）：写操作排他锁整个数据库，读操作可共享锁。',
    'WAL 模式（PRAGMA journal_mode=WAL）：写操作不阻塞读操作（写追加到 WAL 文件，读从 DB + WAL 联合读）。',
    '事务隔离级别：SQLite 支持 SERIALIZABLE（最高隔离级别）。',
    '死锁：A 写 T1 → B 写 T2 → A 写 T2 → B 写 T1（WAL 模式下可能发生）。',
    '忙等待超时：PRAGMA busy_timeout=5000 让 SQLite 等待 5 秒而非立即返回 SQLITE_BUSY。',
  ],
  notes: [
    'WAL 模式下检查点（checkpoint）将 WAL 内容合并回主 .db 文件。',
    'WAL 模式下读操作从不阻塞——适合读多写少的场景。',
  ],
  example: `-- 开启 WAL 模式（每次连接设置一次）
PRAGMA journal_mode=WAL;

-- 设置忙等待超时（毫秒）
PRAGMA busy_timeout=5000;

-- 显式事务
BEGIN IMMEDIATE;  -- 立即获取写锁
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

-- 查看日志模式
PRAGMA journal_mode;`,
};

const sqlite13 = {
  id: 'sqlite-pragma',
  title: '13. PRAGMA 配置大全：优化与调试',
  category: '高级特性',
  version: '3.46+',
  level: '进阶',
  summary: '关键 PRAGMA 命令——优化性能、调试模式、内存控制。',
  detail: [
    'PRAGMA journal_mode=WAL：WAL 模式，提高并发性能。',
    'PRAGMA synchronous=NORMAL / OFF：控制 fsync 频率，OFF 最快但可能丢数据。',
    'PRAGMA cache_size=-8000：设置缓存为 8MB（负数=KB，正数=页数）。',
    'PRAGMA page_size=4096：页大小，在创建数据库后不可更改。',
    'PRAGMA foreign_keys=ON：启用外键约束（默认关闭！）。',
    'PRAGMA temp_store=MEMORY：临时表/索引存在内存中，加速排序。',
  ],
  notes: [
    'synchronous=OFF 在断电/崩溃时可能损坏数据库——仅适用于数据可重建场景。',
    'PRAGMA 命令也可以用 sqlite3_exec 或库 API 调用。',
  ],
  example: `-- 常用优化配置
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=-16000;   -- 16MB 缓存
PRAGMA temp_store=MEMORY;
PRAGMA foreign_keys=ON;
PRAGMA busy_timeout=3000;

-- 查看当前配置
PRAGMA database_list;
PRAGMA page_count;
PRAGMA page_size;

-- 数据库完整性检查
PRAGMA integrity_check;`,
};

const sqlite14 = {
  id: 'sqlite-trigger-fts',
  title: '14. 全文搜索 FTS5：快速文本搜索',
  category: '高级特性',
  version: '3.46+',
  level: '高阶',
  summary: 'SQLite 的 FTS5 扩展提供全文索引和检索，性能远超 LIKE %.%。',
  detail: [
    'FTS5 是 SQLite 的全文搜索引擎扩展（编译时包含），支持中文分词（需 tokenizer）。',
    'CREATE VIRTUAL TABLE posts_fts USING fts5(title, body, content=posts, content_rowid=id);',
    "FTS5 查询语法：SELECT * FROM posts_fts WHERE posts_fts MATCH 'search_term';",
    "支持布尔查询：'apple AND banana'、'apple NOT banana'、'apple*'（前缀匹配）。",
    '支持排名：ORDER BY rank 按相关性排序。',
    '可配合 content= 实现外部内容表，避免数据冗余。',
  ],
  notes: [
    'FTS5 在 SQLite 默认编译中已开启，但部分嵌入式版本可能未包含。',
    '中文搜索需安装 ICU tokenizer 或使用 jieba 分词等外部方案。',
  ],
  example: `-- 创建 FTS5 虚拟表
CREATE VIRTUAL TABLE posts_fts USING fts5(title, body);

-- 插入数据（同时插入到原表和 FTS 表）
INSERT INTO posts_fts SELECT title, body FROM posts;

-- 搜索
SELECT * FROM posts_fts WHERE posts_fts MATCH 'hello world';

-- 带排名
SELECT *, rank FROM posts_fts
WHERE posts_fts MATCH 'hello'
ORDER BY rank;

-- 布尔搜索
SELECT * FROM posts_fts
WHERE posts_fts MATCH '"image processing" OR "computer vision"';`,
};

const sqlite15 = {
  id: 'sqlite-backup-export',
  title: '15. 备份、导入与导出：.dump / .backup / CSV',
  category: '运维',
  version: '3.46+',
  level: '进阶',
  summary: '数据库备份与迁移的多种方法：文本导出、二进制备份、CSV 导入导出。',
  detail: [
    '.dump 将数据库导出为 SQL 文本（含 schema + 数据），适合跨版本迁移。',
    '.backup <file> 二进制热备份（在线安全，无需停止写入）。',
    '.mode csv; .import <file> <table> 导入 CSV；.output <file> .mode csv .select * FROM <table> 导出 CSV。',
    '.clone <file> 克隆数据库（包括所有内容和设置）。',
    'VACUUM 重建数据库文件，回收空间并重新排序（VACUUM INTO <file> 可在线压缩）。',
    'attach database 命令可同时操作多个数据库文件。',
  ],
  notes: [
    '.dump 导出的是事务性快照——即使在导出过程中有写入也能获得一致数据。',
    '.backup 适合日常备份；.dump 适合跨平台迁移或版本控制。',
  ],
  example: `# 在 shell 中
sqlite3 mydb.db .dump > backup.sql
sqlite3 newdb.db < backup.sql

# .backup（不退出 sqlite3）
sqlite3 mydb.db
sqlite> .backup mydb_backup.db

# CSV 导入
sqlite3 mydb.db
sqlite> .mode csv
sqlite> .import data.csv mytable

# CSV 导出
sqlite> .headers on
sqlite> .mode csv
sqlite> .output data.csv
sqlite> SELECT * FROM mytable;
sqlite> .output stdout

# 在线压缩
sqlite3 mydb.db VACUUM INTO mydb_compacted.db`,
};

if (typeof module !== 'undefined') module.exports = { sqlite11, sqlite12, sqlite13, sqlite14, sqlite15 };