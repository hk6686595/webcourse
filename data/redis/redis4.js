// Redis 教程 16–20：语言集成与高可用
const redis16 = {
  id: 'redis-nodejs',
  title: '16. Node.js 集成：ioredis',
  category: '集成',
  version: '7.x',
  level: '进阶',
  summary: '用 ioredis 在 Node 中连接 Redis：缓存、JSON、过期、管道与连接池。',
  detail: [
    '安装：npm i ioredis；new Redis({ host, port, password }) 建立连接。',
    'API 与 Redis 命令一一对应：await redis.set(key, value)、get、del。',
    'JSON 存取：存入前 JSON.stringify，读出后 JSON.parse。',
    '过期：SET key val EX 60，或 redis.expire()。',
    '管道 pipeline() 批量发送命令减少往返；multi() 事务。',
    'ioredis 自带连接池/重连/集群支持，且监听 error 事件避免崩溃。',
  ],
  notes: [
    'require("ioredis") 的实例是单连接，多个应用实例各自建连接，Redis 侧连接数会累加。',
    'redis.get 返回 null（键不存在）与空字符串字符串要区分处理。',
  ],
  example: `const Redis = require('ioredis');
const redis = new Redis({ host: '127.0.0.1', port: 6379, password: 'secret' });
redis.on('error', (e) => console.error('redis error', e));

async function main() {
  // 基本
  await redis.set('name', 'leo');
  console.log(await redis.get('name'));

  // JSON 缓存 + 过期
  const user = { id: 1, name: 'leo' };
  await redis.set('user:1', JSON.stringify(user), 'EX', 3600);
  const cached = await redis.get('user:1');
  console.log(cached ? JSON.parse(cached) : null);

  // 原子计数
  await redis.incr('pv:today');

  // 管道批量
  const pipe = redis.pipeline();
  pipe.set('a', '1');
  pipe.set('b', '2');
  await pipe.exec();

  // 事务
  await redis.multi().set('k', 'v').incr('count').exec();

  await redis.quit();
}
main();`,
};

const redis17 = {
  id: 'redis-python',
  title: '17. Python 集成：redis-py',
  category: '集成',
  version: '7.x',
  level: '进阶',
  summary: '用 redis-py 在 Python 中操作 Redis：连接池、结构化缓存、TTL、管道与事务。',
  detail: [
    '安装：pip install redis；redis.Redis(host, port, password, decode_responses=True)。',
    'decode_responses=True 让返回值直接是 str 而非 bytes，开发更顺手。',
    '连接池：redis.ConnectionPool + Redis(connection_pool=pool)。',
    '结构化缓存：pickle/JSON 序列化后存取，定义好过期时间。',
    '管道：pipe = r.pipeline(transaction=True)；pipe.execute() 批量执行。',
    'redis-py 命令名与 Redis 命令一致：r.set、r.get、r.hset、r.zadd 等。',
  ],
  notes: [
    '经常踩坑：不解码 bytes 导致比较失败，设置 decode_responses=True 可统一解决。',
    '大对象（图片字节流）仍可存 bytes，设 decode_responses=True 不影响。',
  ],
  example: `import redis, json

r = redis.Redis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

# 基本
r.set("name", "leo")
print(r.get("name"))

# 缓存对象 + 过期
user = {"id": 1, "name": "leo"}
r.setex("user:1", 3600, json.dumps(user, ensure_ascii=False))
cached = r.get("user:1")
print(json.loads(cached) if cached else None)

# Hash 存对象
r.hset("user:2", mapping={"name": "amy", "age": 20})
print(r.hgetall("user:2"))

# 管道批量
with r.pipeline(transaction=True) as pipe:
    pipe.set("a", "1")
    pipe.incr("count")
    pipe.execute()

# 过期时间
r.expire("user:1", 600)
print(r.ttl("user:1"))`,
};

const redis18 = {
  id: 'redis-stream',
  title: '18. Stream：可靠消息队列',
  category: '应用',
  version: '7.x',
  level: '高级',
  summary: 'Stream 是 Redis 5+ 的原生消息队列：持久化、消费者组、ack 确认机制。',
  detail: [
    'Stream 是追加式日志结构，消息带自增 ID，可存储大量消息并支持消费组。',
    '生产：XADD stream * field value；读取：XRANGE/XREVRANGE 按 ID 范围。',
    '消费组：XGROUP CREATE，消费者 XREADGROUP，实现“一个消息只被一个消费者处理”。',
    '确认：XACK 显式确认消息；XREADGROUP 后用 XAUTOCLAIM 处理挂起消息。',
    '对比 Pub/Sub：Stream 持久化 + 断点续读 + 群体分配，是可靠队列的更优解。',
    '延迟/定时任务可用 XADD 存到期时间 + 定时 XRANGE 扫描。',
  ],
  notes: [
    '消息处理失败不要无限 ack；配合 XAUTOCLAIM/死信处理。',
    '超长 Stream 用 XTRIM 裁剪或 XDEL 清理，避免无限膨胀。',
  ],
  example: `# 生产消息
XADD tasks * user 1001 job "send_email"

# 读取（从最新开始，阻塞等待）
XREAD COUNT 10 BLOCK 5000 STREAMS tasks 0

# 消费组
XGROUP CREATE tasks group1 0 MKSTREAM
XREADGROUP GROUP group1 consumer1 COUNT 5 STREAMS tasks >

# 确认
XACK tasks group1 <message-id>

# 查看挂起与声明重新处理
XPENDING tasks group1
XAUTOCLAIM tasks group1 consumer1 0 0

# 清理
XTRIM tasks MAXLEN 1000`,
};

const redis19 = {
  id: 'redis-cluster',
  title: '19. 高可用与集群：Sentinel 与 Cluster',
  category: '高可用',
  version: '7.x',
  level: '高级',
  summary: '单机宕机怎么办：主从复制、Sentinel 哨兵高可用、Cluster 集群分片。',
  detail: [
    '主从复制：replicaof master_ip port 让从库持续同步主库，可做读写分离与容灾。',
    'Sentinel（哨兵）：监控主库，主库挂掉自动把从库提升为主库（failover），对应用透明。',
    '官方建议至少 3 个 Sentinel 形成 quorum，避免脑裂。',
    'Cluster：槽位分片（16384 个 slot），各节点分管一部分，客户端可路由到对应节点。',
    'Cluster 需要至少 3 主 3 从；单命令限定在单一 slot（多键操作用 hash tag {}）。',
    '规模选择：单机 < 几 GB 且允许简单 + 挂一个从 —— Sentinel；要容量/多写 —— Cluster。',
  ],
  notes: [
    'Cluster 模式下 MGET/SET nx 等多键命令必须落在同一 slot，用 {user1} 之类 hash tag 命中同节点。',
    'Sentinel 不解决容量上限，只解决高可用；量大要分片就 Cluster。',
  ],
  example: `# 配置从库（redis.conf）
replicaof 192.168.1.10 6379
# ACL / 只读
replica-read-only yes

# 手动提升（临时用）
SLAVEOF NO ONE

# Sentinel（sentinel.conf）
sentinel monitor mymaster 192.168.1.10 6379 2
sentinel auth-pass mymaster secret
# 启动
redis-sentinel /etc/sentinel.conf

# 启动 6 节点 Cluster（脚本/配置）
redis-cli --cluster create \\
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \\
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \\
  --cluster-replicas 1

# 查看槽位分布
redis-cli -c -p 7000 CLUSTER INFO`,
};

const redis20 = {
  id: 'redis-roadmap',
  title: '20. 学习路线与实战清单',
  category: '实战',
  version: '7.x',
  level: '高级',
  summary: '把全篇串成学习路径：概念 → 数据结构 → 机制 → 应用 → 高可用，并给出自查清单。',
  detail: [
    '阶段一（数据）：String/Hash/List/Set/ZSet 逐一手写命令并理解适用场景。',
    '阶段二（机制）：过期淘汰、持久化、事务/Lua、Pub/Sub、Stream。',
    '阶段三（应用）：缓存三兄弟、分布式锁、限流、会话、幂等——每个都实现一遍。',
    '阶段四（工程）：ioredis/redis-py 集成、命令监控（SLOWLOG/INFO）、性能压测（redis-benchmark）。',
    '阶段五（架构）：主从、Sentinel、Cluster 各起一套本地环境实操。',
    '常见面试自查：为什么快（内存+单线程 I/O 多路复用）、缓存一致、锁失效、多键事务。',
  ],
  notes: [
    '学习最有效的方式是本地起一个 redis，把本文每章节命令都敲一遍。',
    '官方文档 redis.io/docs 与《Redis 设计与实现》值得精读。',
  ],
  example: `# 性能与监控
redis-benchmark -q -n 100000 -c 50
redis-cli --latency -h 127.0.0.1    # 延迟抖动
redis-cli SLOWLOG GET 10            # 慢命令
redis-cli INFO memory               # 内存
redis-cli MONITOR                   # 实时命令流（别在生产乱开）

# 自查命令清单：自测能默写多少？
# SET/GET/DEL/EXPIRE/TTL
# HSET/HGET/HGETALL/HINCRBY
# LPUSH/RPUSH/LPOP/BRPOP/LRANGE/LTRIM
# SADD/SISMEMBER/SINTER/SPOP
# ZADD/ZINCRBY/ZREVRANGE/ZRANK
# MULTI/WATCH/EVAL
# XADD/XREADGROUP/XACK
# SLAVEOF/CONFIG GET`,
};

if (typeof module !== 'undefined') module.exports = { redis16, redis17, redis18, redis19, redis20 };