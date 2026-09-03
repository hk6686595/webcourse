// Redis 教程 6–10：集合与机制
const redis6 = {
  id: 'redis-set',
  title: '6. Set：无序去重集合',
  category: '数据类型',
  version: '7.x',
  level: '入门',
  summary: 'Set 的去重与集合运算：SADD/SREM、交集并集差集、随机取、抽奖与标签。',
  detail: [
    'Set 是无序、去重的字符串集合，基于哈希表，判断/增删 O(1)。',
    'SADD 添加（重复会自动忽略）、SREM 移除、SMEMBERS 全部元素、SCARD 数量。',
    '集合运算：SINTER 交集、SUNION 并集、SDIFF 差集——可存结果 SINTERSTORE 等。',
    'SISMEMBER 判断是否存在，适合“是否已点赞/已关注”。',
    '随机：SPOP 随机弹出并删除、SRANDMEMBER 随机取不删——抽奖/随机推荐。',
    '滑动去重同类：用户唯一设备、参与活动名单天然用 Set。',
  ],
  notes: [
    '判断 member 存在优先用 SISMEMBER 而非 SMEMBERS 后再 includes。',
    '大集合的 SMEMBERS 会拉全量，判断用 SISMEMBER、遍历用 SSCAN。',
  ],
  example: `# 标签系统
SADD article:1 tags csharp redis web
SADD article:2 tags redis python
SMEMBERS article:1
SCARD article:1

# 交集：同时打了 redis 和 web 的文章（模拟“有 redis 且有 web 标签”）
SINTER article:1 article:2

# 差集：article:1 有而 article:2 没有的
SDIFF article:1 article:2

# 点赞去重
SADD like:post_5 u_1001 u_1002
SISMEMBER like:post_5 u_1001    # 1
SCARD like:post_5               # 2

# 抽奖：随机取 3 个不重复参与者
SPOP lottery 3
SRANDMEMBER lottery 1`,
};

const redis7 = {
  id: 'redis-zset',
  title: '7. ZSet：有序集合（排行榜最佳实践）',
  category: '数据类型',
  version: '7.x',
  level: '进阶',
  summary: 'ZADD/ZRANGE/ZRANK、分值排序、范围查询——实时排行榜的标准解法。',
  detail: [
    'ZSet 每个成员带一个 score 分值，按分值有序，Hash+跳表的组合。',
    'ZADD key score member；ZINCRBY 给成员加分（更新排行榜）。',
    '按名次查：ZRANGE key 0 -1 升序、ZREVRANGE 降序、带 WITHSCORES 显示分值。',
    '名次：ZRANK 升序名次、ZREVRANK 倒序名次（从 0 开始）。',
    '分值范围：ZRANGEBYSCORE 取某分数区间（如 90-100 分的用户）。',
    '删除：ZREM、ZREMRANGEBYRANK/ZSCORE 移除指定名次/分值区间成员。',
  ],
  notes: [
    '排行榜“改分”用 ZINCRBY 而非重写，天然原子。',
    '同分时按字典序排；想“先到先得”可把时间合并进分值技巧编码。',
  ],
  example: `# 游戏排行榜：玩家得分
ZADD leaderboard 100 {Alice} 90 {Bob} 80 {Carol}
ZADD leaderboard 120 {Alice}        # 更新得分

# 降序前十名（含分数）
ZREVRANGE leaderboard 0 9 WITHSCORES

# 我的名次（从 0 开始，第 2 名则返回 1）
ZREVRANK leaderboard {Alice}

# 分数区间（80-100 的玩家）
ZRANGEBYSCORE leaderboard 80 100 WITHSCORES

# 加分
ZINCRBY leaderboard 10 {Bob}

# 删除
ZREM leaderboard {Carol}
ZREMRANGEBYRANK leaderboard 10 -1   # 只留前十`,
};

const redis8 = {
  id: 'redis-expire',
  title: '8. 过期与淘汰：TTL 与内存策略',
  category: '机制',
  version: '7.x',
  level: '进阶',
  summary: '键过期机制、主动/惰性删除、maxmemory 的六种淘汰策略。',
  detail: [
    '给键设过期时间：EXPIRE/PEXPIRE 秒/毫秒，SET EX/ PX 快捷设置；TTL 查看剩余。',
    '过期删除策略：惰性（访问时发现过期才删）+ 定期（周期采样删除）。',
    '记忆技巧：Redis 不会主动“准点”删过期键，而是访问/采样时删。',
    'maxmemory 设置上限，配合淘汰策略 maxmemory-policy。',
    '常见策略：allkeys-lru（全体最近最少使用）、volatile-lru（只对有过期时间的）、noeviction（拒绝写）。',
    '缓存场景通用：maxmemory-policy allkeys-lru 或 allkeys-lfu。',
  ],
  notes: [
    '给热点缓存设合理 TTL，避免堆积成内存压力；长时热点用 LRU/LFU 兜底。',
    '把过期键删了会立即释放内存？惰性删除需要访问触发，配合内存统计关注 used_memory。',
  ],
  example: `# 设置与查看过期
SET token "abc" EX 3600
EXPIRE user:1001 600
PEXPIRE job:1 5000
TTL token                # 剩余秒数
PTTL token               # 毫秒
SET code "1234" EX 300 NX   # 结合不存在判断

# 取消过期
PERSIST token
TTL token                # -1 表示永不过期

# 淘汰策略（redis.conf 或 CONFIG SET）
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
CONFIG SET maxmemory-policy allkeys-lru
CONFIG SET maxmemory 512mb`,
};

const redis9 = {
  id: 'redis-persistence',
  title: '9. 持久化：RDB 与 AOF',
  category: '机制',
  version: '7.x',
  level: '进阶',
  summary: '两种持久化方式各自原理与取舍：RDB 快照（省空间快）、AOF 追加日志（不易丢数据）。',
  detail: [
    'RDB：定期把内存数据生成二进制快照到 dump.rdb，恢复快、文件紧凑。',
    'RDB 触发：save/ bgsave 手动、配置文件 save 规则条件。默认会 fork 子进程写盘，不阻塞主线程。',
    'AOF：把每次写命令追加到 appendonly.aof，刷盘策略 appendfsync everysec（每秒）/always/ no。',
    'AOF 重写：文件膨胀后 BGREWRITEAOF 压缩，7.x 支持 RDB+AOF 混合持久化。',
    '取舍：AOF 更不易丢数据但文件大；RDB 恢复快但有窗口期丢数据。',
    '生产建议：开启 AOF（everysec）+ 定期 RDB，或两者混合模式。',
  ],
  notes: [
    '数据可容忍丢失缓存无需持久化；重要数据必须开 AOF。',
    '恢复优先级：同时有 RDB 与 AOF 时，默认优先用 AOF 恢复。',
  ],
  example: `# 手动触发
redis-cli SAVE          # 同步阻塞式
redis-cli BGSAVE        # 后台快照

# redis.conf 关键配置
save 900 1              # 900 秒内有 1 次写则快照
save 300 10
appendonly yes          # 开启 AOF
appendfsync everysec    # 每秒刷盘（折中）
appendfilename "appendonly.aof"

# 重写 AOF（压缩）
redis-cli BGREWRITEAOF

# 查看状态
INFO persistence

# 混合持久化（7.x 默认 RDB+AOF）
aof-use-rdb-preamble yes`,
};

const redis10 = {
  id: 'redis-transaction',
  title: '10. 事务与 Lua 脚本',
  category: '机制',
  version: '7.x',
  level: '进阶',
  summary: 'MULTI/EXEC 的事务队列、WATCH 乐观锁，以及更强大的 Lua 脚本原子执行。',
  detail: [
    '事务语法：MULTI 开始入队 → 若干命令 → EXEC 一次执行；DISCARD 放弃。',
    '事务内的命令会顺序原子执行，但不会“回滚”：中途出错不影响其它命令。',
    'WATCH 乐观锁：先 WATCH key，若在 EXEC 前该 key 被改动，EXEC 放弃并返回 nil。',
    'Lua 脚本（EVAL）：一段脚本整体原子执行，可读写多个键，替代复杂事务。',
    'EVALSHA 缓存脚本 SHA 减少带宽；7.x 支持 --load 加载。',
    '典型：秒杀扣库存、余额转账，用 Lua 一步完成“查-判-改”。',
  ],
  notes: [
    '需要“所有命令要么都不做”时用 Lua 脚本而不是 MULTI（MULTI 不保证回滚）。',
    '脚本时长克制在毫秒级，长脚本会阻塞整个 Redis。',
  ],
  example: `# MULTI/EXEC
MULTI
SET a 10
INCR a
EXEC             # 一起执行

# WATCH 乐观锁
WATCH stock
GET stock        # 5
MULTI
DECR stock
EXEC             # 若 stock 在 WATCH 后被改，EXEC 返回 nil

# Lua：原子“余额>=金额才扣款”
EVAL "local b = tonumber(redis.call('GET', KEYS[1]) or 0)
  if b >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1
  end
  return 0" 1 account:1001 50`,
};

if (typeof module !== 'undefined') module.exports = { redis6, redis7, redis8, redis9, redis10 };