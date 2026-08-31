// SQLite 教程 6–10：聚合 / JOIN / 索引 / 子查询
const sqlite6 = {
  id: 'sqlite-aggregate',
  title: '6. 聚合函数：COUNT / SUM / AVG / MIN / MAX / GROUP BY',
  category: '查询进阶',
  version: '3.46+',
  level: '入门',
  summary: '使用聚合函数汇总数据，结合 GROUP BY 和 HAVING 进行分组统计。',
  detail: [
    'COUNT(*) 统计行数；COUNT(col) 统计该列非 NULL 的行数。',
    'SUM(col)、AVG(col)、MIN(col)、MAX(col) 用于数值列。',
    'GROUP BY col 将按列值分组，每个组返回一行聚合结果。',
    'HAVING 在分组后过滤（类似 WHERE，但 WHERE 在分组前过滤）。',
    'GROUP_CONCAT(col, sep) 是 SQLite 特有：将分组后的列值用分隔符拼接。',
    '聚合中可使用 DISTINCT：COUNT(DISTINCT col)。',
  ],
  notes: [
    'SELECT 中有非聚合列时，该列必须在 GROUP BY 中——SQLite 对此比其他 DB 宽松（会取第一个值），但仍应遵循标准。',
    'HAVING 可以使用聚合函数别名，但 WHERE 不行。',
  ],
  example: `-- 统计
SELECT COUNT(*) AS total_users FROM users;
SELECT AVG(age) AS avg_age FROM users;
SELECT MIN(age), MAX(age) FROM users;

-- 分组统计
SELECT age, COUNT(*) AS count FROM users GROUP BY age HAVING count > 1;

-- 每个用户的文章数
SELECT u.name, COUNT(p.id) AS post_count
FROM users u LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id;

-- GROUP_CONCAT
SELECT age, GROUP_CONCAT(name, ', ') AS names
FROM users GROUP BY age;`,
};

const sqlite7 = {
  id: 'sqlite-join',
  title: '7. 多表查询：INNER / LEFT / RIGHT / CROSS JOIN',
  category: '查询进阶',
  version: '3.46+',
  level: '进阶',
  summary: '掌握 JOIN 所有类型：内外连接、自连接、多表关联查询。',
  detail: [
    'INNER JOIN：仅返回两表匹配的行（交集）。',
    'LEFT JOIN：返回左表全部行，右表无匹配则为 NULL。',
    'CROSS JOIN：笛卡尔积，两表每行组合（通常需 WHERE 过滤）。',
    'SQLite 不支持 RIGHT JOIN 和 FULL OUTER JOIN，但可通过交换表顺序、UNION 实现等同效果。',
    '自连接：同一张表起不同别名进行关联（如查"谁和谁同岁"）。',
    '多表 JOIN：可连续 INNER JOIN / LEFT JOIN 多张表。',
  ],
  notes: [
    'JOIN 条件建议使用 ON 而非 WHERE WHERE 更容易混淆过滤与连接条件。',
    '多表 JOIN 时注意性能——尽量让较小的表作为驱动表。',
  ],
  example: `-- INNER JOIN：用户及其文章
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- LEFT JOIN：所有用户及其文章（含无文章的用户）
SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;

-- 自连接：同龄用户配对
SELECT a.name AS user1, b.name AS user2, a.age
FROM users a, users b
WHERE a.id < b.id AND a.age = b.age;

-- UNION 模拟 FULL OUTER JOIN
SELECT u.name, p.title FROM users u LEFT JOIN posts p ON u.id = p.user_id
UNION
SELECT u.name, p.title FROM posts p LEFT JOIN users u ON u.id = p.user_id;`,
};

const sqlite8 = {
  id: 'sqlite-index',
  title: '8. 索引：加速查询与性能调优',
  category: '性能',
  version: '3.46+',
  level: '进阶',
  summary: '创建索引加速查询，理解复合索引、EXPLAIN QUERY PLAN、索引命中规则。',
  detail: [
    'CREATE INDEX idx_name ON table(col)：对单列建索引，加速 WHERE / JOIN / ORDER BY。',
    'CREATE UNIQUE INDEX idx_email ON users(email)：唯一索引，兼具约束与加速。',
    '复合索引：查询条件用到索引最左前缀时才生效（leftmost prefix rule）。',
    'EXPLAIN QUERY PLAN SELECT ...：查看查询是否使用索引（SEARCH TABLE ... USING INDEX）。',
    '索引越多写入越慢（INSERT / UPDATE / DELETE 需同步维护索引）。',
    '覆盖索引（包含所有 SELECT 需要的列）可消除回表查询。',
  ],
  notes: [
    '小表（< 1000 行）全表扫描比走索引更快——索引有额外查找开销。',
    '不要在高度重复的列（如布尔列）上建索引——选择性高才有效。',
  ],
  example: `-- 创建索引
CREATE INDEX idx_posts_user ON posts(user_id);

-- 复合索引（最左前缀）
CREATE INDEX idx_users_name_age ON users(name, age);
-- 有效：WHERE name='Alice'
-- 有效：WHERE name='Alice' AND age>20
-- 无效（未用左前缀）：WHERE age>20

-- 查看查询计划
EXPLAIN QUERY PLAN SELECT * FROM users WHERE name LIKE 'A%';
EXPLAIN QUERY PLAN SELECT * FROM posts WHERE user_id = 1;

-- 列出所有索引
SELECT * FROM sqlite_master WHERE type = 'index';`,
};

const sqlite9 = {
  id: 'sqlite-subquery',
  title: '9. 子查询与 EXISTS：嵌套查询进阶',
  category: '查询进阶',
  version: '3.46+',
  level: '进阶',
  summary: '标量子查询、行子查询、EXISTS / NOT EXISTS、IN / NOT IN 子查询。',
  detail: [
    '标量子查询：SELECT (SELECT COUNT(*) FROM posts) AS total 嵌套在 SELECT 子句中，返回单值。',
    'IN 子查询：WHERE col IN (SELECT ...) —— 相当于 = ANY。',
    'EXISTS：WHERE EXISTS (SELECT 1 FROM ... WHERE condition) —— 只检查是否有行存在，效率优于 IN。',
    'NOT EXISTS 常用于"不存在"逻辑（如从无订单的客户）。',
    '子查询可出现在 SELECT / FROM / WHERE 三个位置。',
    'FROM 子查询需要别名：SELECT * FROM (SELECT ...) AS t。',
  ],
  notes: [
    'NOT IN 当子查询返回 NULL 时整个条件为 NULL（空结果）——建议用 NOT EXISTS 代替。',
    'EXISTS 是半连接（semi-join），找到一条就停止——一般比 IN 快。',
  ],
  example: `-- 标量子查询
SELECT name,
  (SELECT COUNT(*) FROM posts WHERE posts.user_id = users.id) AS post_count
FROM users;

-- IN 子查询：有文章的用户
SELECT * FROM users WHERE id IN (SELECT DISTINCT user_id FROM posts);

-- EXISTS：等价写法（通常更快）
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id);

-- NOT EXISTS：没有文章的用户
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id);

-- FROM 子查询：取前 5 个用户的最新文章
SELECT u.*, latest.title
FROM users u
LEFT JOIN (
  SELECT user_id, title, MAX(id) AS max_id
  FROM posts GROUP BY user_id
) latest ON u.id = latest.user_id
ORDER BY u.id LIMIT 5;`,
};

const sqlite10 = {
  id: 'sqlite-window',
  title: '10. 窗口函数：ROW_NUMBER / RANK / LAG / LEAD',
  category: '查询进阶',
  version: '3.25+（2018）',
  level: '高阶',
  summary: 'SQLite 3.25+ 支持窗口函数，在不合并行的情况下对每行进行分组排序计算。',
  detail: [
    'ROW_NUMBER() OVER (PARTITION BY col ORDER BY col)：分组内排序编号。',
    'RANK() 和 DENSE_RANK()：排名（跳跃 vs 连续）。',
    'LAG(col, offset, default) OVER ...：取前 N 行值；LEAD() 取后 N 行值。',
    'FIRST_VALUE() / LAST_VALUE()：窗口内首行/末行值。',
    'SUM() OVER (PARTITION BY col)：分组累加（运行总和）。',
    '窗口函数在计算排名、同比环比、滚动累计等场景非常强大。',
  ],
  notes: [
    'SQLite 3.25+ 才支持窗口函数；更早版本可通过子查询 + 自连接模拟。', 
    'PARTITION BY 相当于 GROUP BY，但不会折叠行。',
  ],
  example: `-- 每个用户文章按时间排名
SELECT user_id, title,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) AS post_num
FROM posts;

-- 按年龄排名
SELECT name, age,
  RANK() OVER (ORDER BY age DESC) AS age_rank
FROM users;

-- 与上一条记录的年龄差（LAG）
SELECT name, age,
  age - LAG(age, 1, 0) OVER (ORDER BY age) AS diff_from_prev
FROM users;

-- 运行总和
SELECT id, user_id,
  COUNT(*) OVER (PARTITION BY user_id ORDER BY id) AS running_count
FROM posts;`,
};

if (typeof module !== 'undefined') module.exports = { sqlite6, sqlite7, sqlite8, sqlite9, sqlite10 };