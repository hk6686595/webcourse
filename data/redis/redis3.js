// Redis 教程 11–15：应用实战
const redis11 = {
  id: 'redis-pubsub',
  title: '11. 发布订阅：Pub/Sub',
  category: '应用',
  version: '7.x',
  level: '进阶',
  summary: '发布订阅解耦实时通知，单通道/模式匹配订阅，以及它的可靠性与局限。',
  detail: [
    'Pub/Sub 是消息广播：发布者 SUBSCRIBE 通道，发布者 PUBLISH 消息，订阅者实时收到。',
    '发布：PUBLISH channel message；订阅：SUBSCRIBE channel；多通道：SUBSCRIBE c1 c2。',
    '模式订阅：PSUBSCRIBE news.* 订阅匹配前缀/通配符的通道。',
    '客户端侧事件：message 回调、subscribe/unsubscribe 回调。',
    '不持久化：订阅者离线会错过消息；没有确认机制；Redis 只是广播中转。',
    '适合在线状态通知、聊天室实时消息；需要可靠消息用 Stream 或消息中间件。',
  ],
  notes: [
    'Pub/Sub 消息不会持久化，重启/断线期间发的内容直接丢失。',
    '要“延迟队列/确认/多消费者组”就用 Redis Stream。',
  ],
  example: `# 终端 1：订阅
redis-cli SUBSCRIBE news
# 终端 2：发布
redis-cli PUBLISH news "hello"

# 订阅多个
SUBSCRIBE news sports
# 模式订阅
PSUBSCRIBE news.*

# 查看活跃订阅
PUBSUB CHANNELS
PUBSUB NUMSUB news`,
};

const redis12 = {
  id: 'redis-cache',
  title: '12. 缓存最佳实践：穿透/击穿/雪崩',
  category: '应用',
  version: '7.x',
  level: '进阶',
  summary: '缓存三兄弟的成因与对策：缓存穿透、缓存击穿、缓存雪崩；Cache Aside 模式。',
  detail: [
    'Cache Aside：先查缓存，未命中查 DB 并回填缓存，写操作先写 DB 再删缓存。',
    '缓存穿透：查不存在的 key 每次都打 DB → 对策：空值缓存 + 布隆过滤器。',
    '缓存击穿：热点 key 过期瞬间大量请求直达 DB → 对策：互斥锁重建 + 逻辑过期延长。',
    '缓存雪崩：大量 key 同时过期或 Redis 宕机 → 对策：过期时间加随机值、多级缓存。',
    '一致性问题：删缓存与写 DB 顺序不当会造成短暂脏数据；可用双删/延迟双删缓解。',
    '监控：命中率、淘汰量、慢命令都要盯，防止缓存退化成防穿透的“摆设”。',
  ],
  notes: [
    '空值缓存的 TTL 要短（如 30-60 秒），否则数据进来后缓存仍返回空。',
    '布隆过滤器误判是“可能不存在也会放行”，它只负责快速排除肯定不存在的 key。',
  ],
  example: `# 读路径（Cache Aside 伪代码）
def get(key, loader):
    v = redis.get(key)
    if v is not None:
        return v
    # 击穿防护：互斥锁
    if redis.set("lock:" + key, 1, NX=True, EX=3):
        try:
            v = loader()                    # 查库
            if v is None:
                return None
            redis.set(key, v, EX=3600)
            redis.del("lock:" + key)
            return v
        except Exception:
            redis.del("lock:" + key)
            raise

# 雪崩防护：过期时间加随机
redis.set(key, v, EX=3600 + random(0, 300))`,
};

const redis13 = {
  id: 'redis-session',
  title: '13. 分布式会话与登录态',
  category: '应用',
  version: '7.x',
  level: '进阶',
  summary: '多实例部署共用登录态：用 Redis 存 Session/JWT 黑名单，TTL 天然登出。',
  detail: [
    '问题：多个应用实例各自内存 Session 无法共享，用户被轮询到别的实例就“掉登录”。',
    '方案一：Session 放 Redis，各实例查拿到同一份会话，天然共享。',
    '方案二：无状态 JWT，但撤销/踢人困难，可把“已撤销”token 放 Redis 黑名单。',
    'Redis Session 键设计：session:<token> 存用户数据 + EXPIRE 过期即登出。',
    '刷新逻辑：滑动过期（每次访问续期）给活跃用户延长会话。',
    '安全：token 用随机字节 + 存哈希；登出即 DEL，防止重放。',
  ],
  notes: [
    '会话数据别塞太多，Redis 是共享的珍贵内存。',
    '滑动续期要与“固定过期”权衡，避免无限期保持登录。',
  ],
  example: `# 登录时写入会话
SET session:abc123 user:1001 EX 86400

# 校验中间件逻辑（伪代码）
token = get_cookie("sid")
sid = "session:" + token
if redis.get(sid) is None:
    return 401
redis.expire(sid, 86400)      # 滑动续期
# 放行…

# 登出
DEL session:abc123

# JWT 黑名单
# 登出/改密时把当前 token 加入黑名单并设其原过期时间
SET jti:<token_jti> 1 EX <remain_ttl>`,
};

const redis14 = {
  id: 'redis-ratelimit',
  title: '14. 限流与幂等：固定窗口、滑动窗口、令牌桶',
  category: '应用',
  version: '7.x',
  level: '进阶',
  summary: '用 INCR+EXPIRE、ZSet、Lua 实现三种限流，以及接口幂等判断。',
  detail: [
    '固定窗口：INCR 计数 + 首次设 EXPIRE 秒级窗口，简单但窗口边界瞬时可双倍放行。',
    '滑动窗口：用 ZSet 记录时间戳，ZCARD 统计窗口内的请求数，精度更高。',
    '令牌桶：Lua 维护剩余令牌与上次补充时间，允许突发又限制均值。',
    '防刷接口：手机验证码、登录接口 > n 次/分钟直接拒绝。',
    '幂等：请求带唯一幂等键，处理前 SET key 1 NX EX 60，已存在则“已处理”。',
    '分布式中限流状态都在 Redis，多实例共享同一套计数。',
  ],
  notes: [
    '固定窗口实现最简单，多数场景够用；精确限流用滑动窗口或令牌桶。',
    'Lua 保证“判断+计数”原子，避免并发超发。',
  ],
  example: `# 固定窗口：每分钟最多 5 次
INCR rate:1001
EXPIRE rate:1001 60 NX     # 仅第一次设置过期
# 若计数 > 5 则拒绝

# 滑动窗口：用 ZSET 记录时间戳
ZADD rw:1001 <now_ms> <now_ms>
ZREMRANGEBYSCORE rw:1001 0 <now_ms-60000>
ZCARD rw:1001             # 最近 1 分钟次数

# 幂等键（Lua 一步完成）
EVAL "local r = redis.call('SET', KEYS[1], 1, 'NX', 'EX', ARGV[1])
  return r == 'OK' and 1 or 0" 1 idem:order_2001 60`,
};

const redis15 = {
  id: 'redis-lock',
  title: '15. 分布式锁：SET NX EX 与 Redlock',
  category: '应用',
  version: '7.x',
  level: '高级',
  summary: '基于 Redis 的分布式锁实现与坑位：原子加锁、自动过期、解锁校验、续期。',
  detail: [
    '加锁：SET lock:key uuid NX EX 10——NX 保证唯一抢占，EX 防死锁。',
    '解锁：必须校验持有者（值对比 uuid）再 DEL，且要用 Lua 保证“比较+删除”原子。',
    '别用 SETNX 后单独 EXPIRE（两条命令非原子，进程宕了会死锁）。',
    '业界标准实现：Redisson 的 RLock（自带 watchdog 自动续期）。',
    'Redlock 算法：对多个独立 Redis 实例加锁过半才算成功，工程上慎用。',
    '失效时间预估：锁续期 <= 业务最坏执行时间，超时自动失效兜底。',
  ],
  notes: [
    '曾踩坑：解锁时不校验 uuid 而直接 DEL，会误删别人刚拿到的锁。',
    '锁的意义是“临界区的使用边界”，宁可超时释放也别长时死锁。',
  ],
  example: `# 加锁（原子）
SET lock:coupon uuid-1001 NX EX 10

# 解锁（Lua 保证原子！）
EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end" 1 lock:coupon uuid-1001

# 代码侧套路
if redis.set("lock:coupon", my_uuid, nx=True, ex=10):
    try:
        do_biz()
    finally:
        redis.eval(unlock_lua, 1, "lock:coupon", my_uuid)`,
};

if (typeof module !== 'undefined') module.exports = { redis11, redis12, redis13, redis14, redis15 };