// Redis 教程 1–5：入门与基础数据类型
const redis1 = {
  id: 'redis-intro',
  title: '1. Redis 是什么：高性能内存数据库',
  category: '入门',
  version: '7.x',
  level: '入门',
  summary: '理解 Redis 的定位：内存键值存储、单线程模型、丰富数据结构与常见用途。',
  detail: [
    'Redis（Remote Dictionary Server）是开源的内存键值数据库，读写都在内存，性能极高（十万级 QPS）。',
    '单线程执行命令（Redis 6+ 仅某些模块多线程）：无锁、无竞态、命令天然原子。',
    '丰富的数据类型：String、Hash、List、Set、ZSet、Stream、Bitmap、HyperLogLog、Geo。',
    '内置持久化（RDB/AOF）、过期策略、发布订阅、事务与 Lua 脚本。',
    '典型用途：缓存、分布式锁、限流、计数器、会话、排行榜、消息队列、实时统计。',
    'Redis 适用“热数据”；全量数据仍要落在磁盘数据库（MySQL 等）。',
  ],
  notes: [
    '内存是瓶颈：合理设置过期时间与 maxmemory 淘汰策略，防止内存被打满。',
    '官方正名：Redis 不是 simple cache，而是数据存储（Database）；但最常用场景是缓存。',
  ],
  example: `# 启动与连接
redis-server                     # 默认端口 6379
redis-cli                        # 交互终端
redis-cli -h 127.0.0.1 -p 6379

# 基础命令
PING            # -> PONG
SELECT 0        # 切数据库（默认有 16 个）
DBSIZE          # 当前库键数量
SET name "leo"  # 存键
GET name        # 取值
FLUSHALL        # 清空所有库（慎用）`,
};

const redis2 = {
  id: 'redis-install',
  title: '2. 安装与 redis-cli 使用',
  category: '入门',
  version: '7.x',
  level: '入门',
  summary: '本地安装（源码/Docker）、配置文件、连接与 redis-cli 常用参数。',
  detail: [
    '包管理器：apt install redis-server / brew install redis / 官方源码编译。',
    'Docker：docker run -d -p 6379:6379 redis:7（加 --requirepass 设密码）。',
    '配置文件 redis.conf：daemonize、bind、port、requirepass、maxmemory 等。',
    '连接认证：AUTH password，或 redis-cli -a password（命令行 -a 会被 ps 看到，谨慎）。',
    'redis-cli 常用参数：-n 数据库、-r 重复次数、-i 间隔、--stat 实时监控、--scan 遍历键。',
    'INFO 命令查看内存/客户端/持久化等运行状态。',
  ],
  notes: [
    '生产环境务必设置 requirepass、bind 内网地址，开启 redis.conf 的安全项。',
    'docker 里想自启配置：redis-server /usr/local/etc/redis/redis.conf 走 CMD。',
  ],
  example: `# Docker 一键启动
docker run -d --name myredis -p 6379:6379 redis:7-alpine

# 带密码与持久化
docker run -d --name myredis -v $PWD/data:/data \\
  -p 6379:6379 redis:7 --requirepass secret --appendonly yes

# redis-cli 常用
redis-cli -n 1 SET a 1
redis-cli -r 3 -i 1 INFO         # 每秒看一次，共三次
redis-cli --stat                 # 实时监控(按 Ctrl+C 退出)
redis-cli -a secret PING

# 服务器信息
INFO memory
CONFIG GET maxmemory`,
};

const redis3 = {
  id: 'redis-string',
  title: '3. String：最基础的键值',
  category: '数据类型',
  version: '7.x',
  level: '入门',
  summary: 'String 的存取、数值操作、原子自增自减、批量与过期设置。',
  detail: [
    'String 是 Redis 中最简单的类型，值可以是字符串、数字或二进制（最大 512MB）。',
    'SET/GET 基本存取；SET key value NX/XX 实现“仅当不存在/存在时设置”。',
    '原子数值：INCR/DECR、INCRBY/DECRBY、INCRBYFLOAT——O(1) 且并发安全，适合计数器。',
    '过期：SET key value EX 60、单独 EXPIRE/PEXPIRE；TTL 查看剩余秒数。',
    '批量：MSET/MGET 一次读写多个键；GETSET 取旧值写新值。',
    '位操作：SETBIT/GETBIT/BITCOUNT 可用整型状态位图（如用户签到）。',
  ],
  notes: [
    'INCR 天然原子：多进程并发 +1 不会丢，是秒杀库存/点赞数的标准做法。',
    'N 个独立 SET 是 N 次网络往返；MSET 只需 1 次，批量场景明显更快。',
  ],
  example: `SET name "leo"
GET name
SET count 0
INCR count            # 1
INCRBY count 10       # 11
DECR count            # 10

# 不存在才设置（实现“只抢一次”）
SET order:1001 locked 1 NX EX 30

# 过期与剩余时间
SET code "8888" EX 300
TTL code              # 300
EXPIRE name 60
PERSIST name          # 取消过期

# 批量
MSET a 1 b 2 c 3
MGET a b c

# 位图：记录用户 7 天签到
SETBIT sign:u_1001 0 1    # 第 1 天签到
SETBIT sign:u_1001 2 1    # 第 3 天
BITCOUNT sign:u_1001      # 共签到 2 天`,
};

const redis4 = {
  id: 'redis-hash',
  title: '4. Hash：对象字段的完美容器',
  category: '数据类型',
  version: '7.x',
  level: '入门',
  summary: 'Hash 存对象属性，HGET/HSET/HGETALL/HLEN 及原子自增，天然支持局部更新。',
  detail: [
    'Hash 是 field-value 映射，适合存用户/商品等“对象”数据。',
    'HSET 设字段、HGET 取单字段、HMGET 取多字段、HGETALL 取全部、HLEN 字段数。',
    'HINCRBY：对 hash 中某个数字字段原子自增（如用户积分）。',
    '局部更新友好：只改一个字段不需要读改写整个 JSON 字符串。',
    '删除字段 HDEL；是否存在 HEXISTS；全部字段 HKEYS/HVALS。',
    '遍历注意：HGETALL 对超大 hash 慎用，可用 HSCAN 分片。',
  ],
  notes: [
    '相比把整个对象序列化成 String，Hash 可单独更新某字段，更省带宽。',
    '字段很多（万级）时 HGETALL 一次性拉全量会阻塞客户端，改用 HSCAN。',
  ],
  example: `# 存用户对象
HSET user:1001 name "leo" age 18 city "beijing"
HGET user:1001 name          # "leo"
HMGET user:1001 name age

HGETALL user:1001
HLEN user:1001               # 3

# 积分自增
HINCRBY user:1001 score 10

# 删除与判断
HEXISTS user:1001 city       # 1
HDEL user:1001 city

# 遍历
HSCAN user:1001 0 COUNT 10`,
};

const redis5 = {
  id: 'redis-list',
  title: '5. List：双向链表',
  category: '数据类型',
  version: '7.x',
  level: '入门',
  summary: 'List 的左右入出、范围的阻塞与弹出，模拟队列/栈/最新列表。',
  detail: [
    'List 是字符串双向链表：头尾 O(1) 操作，用作队列、栈、最新消息流。',
    '入出：LPUSH/RPUSH 左右推、LPOP/RPOP 左右弹。',
    '队列：LPUSH + BRPOP（阻塞式，安全消费者）；栈：LPUSH + LPOP。',
    '范围查看：LRANGE key 0 -1 全部；LINDEX 按下标读取。',
    '阻塞弹出：BLPOP/BRPOP key timeout，超时返回 nil，适合做“可靠消息”。',
    '裁剪：LTRIM key 0 99 保留前 100 条，天然实现“最近 100 条”。',
  ],
  notes: [
    '做任务队列优先考虑 List + BRPOP；需要“延迟/确认”语义再用 Stream。',
    '列表很长时 LRANGE 用有限下标，别 0 -1 全拉，避免阻塞。',
  ],
  example: `# 队列：右侧推入，左侧消费
RPUSH queue task1 task2 task3
LPOP queue             # task1

# 阻塞消费（等待新任务，10 秒超时）
BLPOP queue 10

# 栈
LPUSH stack a b c
LPOP stack             # c

# 最新消息（只留最近 50 条）
LPUSH feed:1001 msg1 msg2
LTRIM feed:1001 0 49

# 查看
LRANGE queue 0 -1
LLEN queue
LINDEX queue 0`,
};

if (typeof module !== 'undefined') module.exports = { redis1, redis2, redis3, redis4, redis5 };