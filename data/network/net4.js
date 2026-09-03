// 网络编程 16–20：代理/安全/架构与速查
const net16 = {
  id: 'net-proxy-tunnel',
  title: '16. 代理与隧道',
  category: '进阶',
  version: '通用',
  level: '进阶',
  summary: '正向/反向代理、HTTP/HTTPS/SOCKS 代理、SSH 隧道原理与用途。',
  detail: [
    '代理(Proxy)是转发代理：客户端经代理访问目标，代理可缓存、过滤、匿名化、监管。',
    '正向代理：客户端指定代理去访问外部站(如公司网关、家庭翻墙)；反向代理：挡在服务端前(如 Nginx 均衡/缓存)。',
    'HTTP 代理：客户端发绝对 URL 请求给代理，代理取回再回传；可支持 CONNECT 方法建立 HTTPS 隧道。',
    'SOCKS 代理：更低层(传输层)，不解析内容，任何 TCP 流量都能代理(SOCKS5 还支持 UDP/认证)。',
    'SSH 隧道：加密信道——本地转发(-L)、远程转发(-R)、动态 SOCKS(-D) 三种，把明文流量安全地经 SSH 封装。',
    '典型用途：防火墙穿透、加密传输、构建加密代理、开发联调访问内网服务。',
  ],
  notes: [
    'SSH 隧道在你自己/授权的主机间使用，走私流量或未经授权访问他人资源违反规则。',
    '理解隧道=数据装在另一协议的连接里传输(封装)。',
  ],
  example:
    '# SOCKS5 动态隧道(-D 本地开 SOCKS 代理端口)\n' +
    'ssh -D 1080 user@你的服务器\n' +
    '# 之后让程序走代理:\n' +
    '#   curl --socks5 127.0.0.1:1080 https://example.com\n\n' +
    '# 本地端口转发: 把本地端口映射到远端某机\n' +
    'ssh -L 9000:internal-host:80 user@跳板机\n' +
    '# 访问 localhost:9000 = internal-host:80\n' +
    '# (授权/自己环境示例)',
  example2:
    '# 正向 HTTP 代理测试\n' +
    'curl -x http://127.0.0.1:3128 http://example.com/ -v\n' +
    'curl -x http://127.0.0.1:3128 https://example.com/ -v\n' +
    '# 第一个是普通 HTTP 代理转发\n' +
    '# 第二个经 CONNECT 建立 HTTPS 隧道\n\n' +
    '# 查看 connect 过程\n' +
    'curl -x http://127.0.0.1:3128 https://example.com/ -v 2>&1 \\\n' +
    '  | grep -iE "CONNECT|200 Connection"',
  example3:
    '# 反向代理(Nginx 骨架, 挡在应用前)\n' +
    '# server {\n' +
    '#     listen 443 ssl;\n' +
    '#     location / {\n' +
    '#         proxy_pass http://127.0.0.1:8080;\n' +
    '#         proxy_set_header Host $host;\n' +
    '#         proxy_set_header X-Real-IP $remote_addr;\n' +
    '#     }\n' +
    '# }\n\n' +
    '# 验证反向代理生效\n' +
    'curl -sI -H "Host: myapp.example.com" http://127.0.0.1:80/ 2>&1 | head',
};

const net17 = {
  id: 'net-security',
  title: '17. 网络安全基础',
  category: '安全',
  version: '通用',
  level: '进阶',
  summary: '防火墙、加密与数字证书、TLS 密码学、常见攻击面(仅防御视角)与加固手段。',
  detail: [
    '网络安全的三个目标(CIA)：机密性(加密)、完整性(校验)、可用性(拒绝服务防御)。',
    '防火墙：按规则放行/丢弃流量——包过滤、状态防火墙、应用层 WAF；iptables/nftables/云安全组。',
    '加密分类：对称(AES, 快, 传数据)、非对称(RSA/ECC, 管密钥)、哈希(SHA-256, 验完整性)、MAC。',
    'TLS 用在 HTTPS/SSH/邮件：握手协商密钥 + 数字证书验身份(CA 签发) + 记录层加密收发。',
    '常见攻击(仅用于防御理解与测试自己系统)：DDoS 拒绝服务、中间人(需 TLS 防)、端口扫描、弱口令、钓鱼注入。',
    '加固：最小暴露(只开必要端口)、强密码/MFA、及时打补丁、HTTPS 全站、日志监控、最小权限。',
  ],
  notes: [
    '网络安全内容请严格用于保护自己/组织的系统；对他人系统做未授权测试违法。',
    '扫描与安全测试只在你自己搭的环境或拿到书面授权的目标上进行。',
  ],
  example:
    '# 查看本机开放端口(最小暴露审计)\n' +
    'ss -tlnp\n' +
    '# 只保留必要端口, 减少攻击面\n\n' +
    '# iptables 基本规则(示例, 需 root, 慎用)\n' +
    'sudo iptables -L -n          # 查看规则\n' +
    '# 阻止某 IP 入站\n' +
    '# sudo iptables -A INPUT -s 1.2.3.4 -j DROP\n' +
    '# (在隔离的测试机演示)',
  example2:
    '# 对称/哈希示例 + 校验文件\n' +
    'echo "hello" | sha256sum        # 内容指纹\n' +
    'sha256sum file.bin             # 文件校验\n\n' +
    '# OpenSSL 查看证书信息\n' +
    'echo | openssl s_client -connect example.com:443 \\\n' +
    '  -servername example.com 2>/dev/null \\\n' +
    '  | openssl x509 -noout -subject -dates -fingerprint -sha256\n' +
    '# 校验对方证书(防冒充, 学习示例)',
  example3:
    '# 生成自签名证书(学习/内网测试用)\n' +
    'openssl req -x509 -newkey rsa:2048 -nodes \\\n' +
    '  -keyout key.pem -out cert.pem -days 365 \\\n' +
    '  -subj "/CN=localhost"\n' +
    'openssl x509 -text -noout -in cert.pem | head -20\n' +
    '# 用该证书起个 HTTPS 测试服务\n' +
    'openssl s_server -accept 9443 -cert cert.pem -key key.pem -www &\n' +
    'curl -k https://localhost:9443/\n' +
    '# (仅在本地自建环境做协议学习)',
};

const net18 = {
  id: 'net-rest-app',
  title: '18. REST 与网络应用集成',
  category: '进阶',
  version: 'Python',
  level: '进阶',
  summary: '设计消费第三方 API、鉴权(API Key/OAuth/Bearer)、幂等与错误处理，构建调用其他服务的应用。',
  detail: [
    'REST API 集成 = 理解端点、构造请求、处理响应错误、管理调用频率与凭据。',
    '常见用法：GitHub/GitLab 开放 API、地图/天气/支付服务；多数用 Bearer token 或 OAuth2 授权。',
    '鉴权方式：API Key(请求头 X-Key)、Bearer Token(Authorization: Bearer xxx)、OAuth2(授权码/客户端凭据换 token)。',
    '凭据安全：放环境变量/密钥管理，绝不写进代码或提交仓库；用 requests 的 auth 传，别拼 URL。',
    '错误处理：区分 4xx(请求错)与 5xx(服务端错)、做有限重试(指数退避)、设置超时。',
    '限流与幂等：尊重服务的 Rate Limit；写操作尽量用幂等键(idempotency)避免重复扣款/创建。',
  ],
  notes: [
    '你的 API 凭据 = 你的责任；泄密要立即撤销。',
    '只调用你有权访问的服务并遵守其使用条款。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    '# 用 Bearer token 调用受保护 API\n' +
    'import os, requests\n' +
    'token = os.environ["MY_TOKEN"]   # 放环境变量,不放代码\n' +
    'h = {"Authorization": "Bearer " + token,\n' +
    '     "Accept": "application/vnd.github+json"}\n' +
    'r = requests.get("https://api.github.com/user", headers=h, timeout=10)\n' +
    'r.raise_for_status()\n' +
    'print("登录用户:", r.json()["login"])',
  example2:
    '#!/usr/bin/env python3\n' +
    '# 健壮调用: 超时 + 重试 + 限流尊重\n' +
    'import time, requests\n' +
    'from requests.adapters import HTTPAdapter\n' +
    'from urllib3.util.retry import Retry\n' +
    '# 略... (与13节一致)\n\n' +
    '# 检查剩余配额(常见响应头)\n' +
    'r = requests.get("https://api.github.com/rate_limit", timeout=10)\n' +
    'core = r.json()["resources"]["core"]\n' +
    'print("剩余:", core["remaining"], "/", core["limit"])',
  example3:
    '#!/usr/bin/env python3\n' +
    '# 幂等: 用 Idempotency-Key 防重复提交\n' +
    'import requests, uuid\n' +
    '# 很多支付类 API 支持\n' +
    'idem = str(uuid.uuid4())\n' +
    'h = {"Idempotency-Key": idem}\n' +
    'payload = {"amount": 100, "currency": "usd"}\n' +
    '# 反复提交同一 key 只生效一次\n' +
    'r1 = requests.post("https://httpbin.org/post", json=payload, headers=h, timeout=10)\n' +
    'print("状态:", r1.status_code)',
};

const net19 = {
  id: 'net-highconcurrency',
  title: '19. 高并发网络编程',
  category: '进阶',
  version: '通用',
  level: '实战',
  summary: '对比进程/线程/协程/事件驱动模型、连接池与限流，写出可支撑大规模并发的服务。',
  detail: [
    '并发模型四种：多进程(隔离强,开销大)、多线程(共享内存,需锁,GIL)、协程/异步(单线程I/O密集最优)、事件驱动(epoll)。',
    '高并发的本质瓶颈是 I/O 等待而非 CPU：网络大多时间在等对端，异步用事件循环把等待时间复用给其他请求。',
    '连接池：复用已建立的连接(HTTP keep-alive/数据库连接池)，避免每请求都三次握手重建。',
    '限流：保护后端防被打爆——令牌桶/漏桶、Nginx 限速、Redis 计数、应用层 RateLimiter。',
    '水平扩展：无状态服务可起多实例，前面负载均衡(Nginx/LB) 分发；有状态(会话/锁)需外置 Redis。',
    '压测与监控：wrk/ab/vegeta 压测找出瓶颈，量 QPS/延迟分位数(p99) 判断达标。',
  ],
  notes: [
    '不做连接池 vs 做: 高并发下差数量级; keep-alive 也能大幅减三次握手开销。',
    '限流在入口做(网关)比每个服务各自做更统一。',
  ],
  example:
    '# 压测工具观察并发能力\n' +
    '# 安装并压测本地小服务\n' +
    'ab -n 10000 -c 100 http://127.0.0.1:8080/\n' +
    '#   -n 总请求, -c 并发; 看 Requests per second\n\n' +
    '# 更现代的压测: wrk\n' +
    '# wrk -t4 -c100 -d10s http://127.0.0.1:8080/\n' +
    '# (对自建服务做负载测试)',
  example2:
    '# 连接复用(请求头实践)\n' +
    '# curl 默认已复用连接\n' +
    'curl -s -o /dev/null -w "连接复用: %{num_connects} 次 \\\\n" \\\n' +
    '  --next http://127.0.0.1:8080/ --next http://127.0.0.1:8080/\n\n' +
    '# Python 连接池: requests 内置\n' +
    's = requests.Session()\n' +
    'adapter = HTTPAdapter(pool_connections=50, pool_maxsize=100)\n' +
    's.mount("http://", adapter)',
  example3:
    '# Nginx 限速骨架\n' +
    '# limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n' +
    '# server {\n' +
    '#     location /api/ {\n' +
    '#         limit_req zone=api burst=20 nodelay;\n' +
    '#         proxy_pass http://127.0.0.1:8080;\n' +
    '#     }\n' +
    '# }\n\n' +
    '# Python 应用内简单令牌桶(思路)\n' +
    '# (伪代码)\n' +
    '# 每当请求:  tokens -= 1\n' +
    '#  若 tokens>=0 放行, 否则 429\n' +
    '#  每秒补充 rate 个令牌到上限容量\n' +
    '# (限流保护自建服务,防被外部突发打垮)',
};

const net20 = {
  id: 'net-architecture-cheatsheet',
  title: '20. 网络架构与速查手册',
  category: '实战',
  version: '综合',
  level: '实战',
  summary: '经典端口/命令速查、微服务与消息队列的网络视角、全书工具矩阵。',
  detail: [
    '把全书工具按"层级"归档：接口层(ip/ifconfig)、链路(arp/ethtool)、网络层(route/traceroute)、传输(ss/nc)、应用(dig/curl)、捕获(tcpdump/Wireshark)。',
    '排障黄金路径：ping(通?) -> ss/端口(开?) -> dig(解析?) -> curl(应用?) -> tcpdump(细节?)。',
    '分布式/微服务网络：服务间用 RPC(gRPC/HTTP)，解耦用消息队列(RabbitMQ/Kafka)，服务发现(Consul/K8s DNS)，网关统一入口。',
    '消息队列价值：削峰、异步解耦、可靠投递、多消费者广播；网络上有连接管理与 ACK 语义。',
    '现代传输趋势：HTTP/3/QUIC、gRPC(HTTP/2+protobuf 多路复用)、Service Mesh 的 mTLS 链路加密。',
    '性能三量：带宽(每秒字节)、延迟(RTT)、吞吐(每秒请求)；三者共同决定体验，优化要分清楚瓶颈。',
  ],
  notes: [
    '记不住端口就多查 /etc/services；记不住命令就 man/--help。',
    '本表集成本课程所有命令, 建议打印当速查。',
  ],
  example:
    '# 端口速查\n' +
    'grep -E "^http|^https|^ssh|^mysql|^dns|^ntp|^redis|^postgresql" /etc/services\n' +
    '#  http 80 / https 443 / ssh 22\n' +
    '#  dns 53 / ntp 123 / mysql 3306\n' +
    '#  redis 6379 / postgresql 5432\n\n' +
    '# 全端口\n' +
    'grep -E "^[a-z]+\s+[0-9]+/tcp" /etc/services | head -40',
  example2:
    '# 命令矩阵(本课程工具)\n' +
    '#  层        命令\n' +
    '#  接口      ip addr / ifconfig / ethtool\n' +
    '#  链路      arp -a / ip neigh\n' +
    '#  网络层    ip route / traceroute / ping\n' +
    '#  传输层    ss / netstat / nc\n' +
    '#  应用层    dig / nslookup / curl\n' +
    '#  捕获      tcpdump / Wireshark\n' +
    '#  压测      ab / wrk / vegeta\n' +
    '#  加密      openssl\n\n' +
    '# 快速查看本机都监听了谁\n' +
    'ss -tlnp | sort -t: -k2,2n',
  example3:
    '# 微服务间通信用 gRPC 的端口/探活\n' +
    '# K8s 里健康检查与探针:\n' +
    '#   livenessProbe: 服务是否活着\n' +
    '#   readinessProbe: 是否可接流量\n' +
    '#   startupProbe:   启动慢的应用\n\n' +
    '# 验证消息队列可用(示例: Redis 简单 Pub/Sub)\n' +
    'redis-cli subscribe news &\n' +
    'redis-cli publish news "hello订阅者" &\n' +
    'sleep 1\n' +
    '# 订阅端打印收到消息(自建 Redis 演示)\n\n' +
    '# 性能指标速查\n' +
    '#   curl -o /dev/null -w "total=%{time_total} connect=%{time_connect}\\n" URL\n' +
    '#   time_connect~握手耗时, time_total~整体耗时',
};

if (typeof module !== 'undefined') module.exports = { net16, net17, net18, net19, net20 };