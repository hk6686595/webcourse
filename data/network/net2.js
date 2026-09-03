// 网络编程 6–10：应用层与 Socket 基础
const net6 = {
  id: 'net-dns',
  title: '6. DNS 域名系统',
  category: '应用层',
  version: 'RFC 1035',
  level: '入门',
  summary: '域名解析原理、记录类型、递归/迭代查询、dig 与 nslookup 实战。',
  detail: [
    'DNS 把人类易记的域名解析成 IP。分布在互联网上的域名服务器构成层级数据库。',
    '层级：根服务器(.) -> 顶级域(.com) -> 权威服务器(每域名)。查询层层向下获取权威答案。',
    '两种查询：递归(你的解析器代你逐级查完返回最终 IP) vs 迭代(依次返回下一级让你自己再问)。',
    '记录类型：A(IPv4)、AAAA(IPv6)、CNAME(别名)、MX(邮件)、NS(域名服务器)、TXT(文本/验证)、SRV、PTR(反向)。',
    '本地流程：浏览器 -> 操作系统 -> 本地缓存/hosts -> 配置的 DNS 服务器(如 8.8.8.8) -> 解析链。',
    'TTL 决定缓存时长；改解析需等 TTL 过期生效，可用 dig 查看剩余 TTL。',
  ],
  notes: [
    '先查 hosts 文件再查 DNS：/etc/hosts(Linux/macOS)、C:\\Windows\\System32\\drivers\\etc\\hosts。',
    '排障域名：先 ping/dig，再看服务器配置。',
  ],
  example:
    '# 基础查询\n' +
    'dig baidu.com\n' +
    'dig +short baidu.com          # 只给 A 记录 IP\n' +
    'dig A baidu.com\n' +
    'dig AAAA baidu.com            # IPv6\n\n' +
    '# 老式命令\n' +
    'nslookup baidu.com\n' +
    '# 指定 DNS 服务器\n' +
    'dig @8.8.8.8 baidu.com',
  example2:
    '# 查各种记录类型\n' +
    'dig MX gmail.com              # 邮件服务器\n' +
    'dig NS example.com            # 权威域名服务器\n' +
    'dig CNAME www.github.com\n' +
    'dig TXT google.com\n' +
    'dig +trace example.com        # 展示逐级解析(根->权威)\n\n' +
    '# 反向解析(IP->域名)\n' +
    'dig -x 8.8.8.8\n' +
    'nslookup 8.8.8.8',
  example3:
    '# 用 Python 解析域名\n' +
    'python3 - <<"PY"\n' +
    'import socket\n' +
    'host = "example.com"\n' +
    'print("A:", socket.getaddrinfo(host, 80, socket.AF_INET))\n' +
    'print("域名:", socket.gethostbyaddr("93.184.216.34"))\n' +
    'PY\n\n' +
    '# 测试域名连通(先用解析的 IP 连)\n' +
    'curl -v --resolve example.com:80:93.184.216.34 http://example.com/\n' +
    '# 观察 CONNECTED 到哪个 IP、SNI 等',
};

const net7 = {
  id: 'net-http',
  title: '7. HTTP 与 HTTPS 详解',
  category: '应用层',
  version: 'HTTP/1.1, HTTP/2, HTTP/3',
  level: '入门',
  summary: '请求/响应报文结构、方法、状态码、首部、无状态与会话、HTTPS/TLS 握手与版本演进。',
  detail: [
    'HTTP 是 Web 的基础协议：客户端(浏览器/程序)发请求，服务端回响应，基于 TCP(HTTP/3 用 QUIC)。',
    '请求行：方法 + 路径 + 版本；常用方法 GET/HEAD/POST/PUT/PATCH/DELETE/OPTIONS。',
    '状态码 3 位分 5 类：1xx 信息、2xx 成功(200,201,204)、3xx 重定向(301,302,304)、4xx 客户端错误(400,401,403,404,405)、5xx 服务器错误(500,502,503)。',
    '首部(Header)：通用(Content-Type/Length)、请求(Accept/Cookie/Authorization)、响应(Set-Cookie/Server/Location)。',
    '无状态：HTTP 每次请求独立，用 Cookie+Session 或 Token 维持用户会话。',
    'HTTPS = HTTP + TLS：握手协商密钥后加密传输，防窃听/篡改/冒充；证书由 CA 签发。',
    '版本演进：HTTP/1.1 一个连接串行请求 -> HTTP/2 多路复用+压缩头 -> HTTP/3 基于 QUIC(UDP) 更低延迟。',
  ],
  notes: [
    '304 Not Modified：配合 ETag/If-Modified-Since 做缓存校验，资源没变就不回全文。',
    '用 curl -v 或浏览器 DevTools(Network) 看完整报文。',
  ],
  example:
    '# 用 curl 观察完整请求/响应\n' +
    'curl -v http://example.com/\n' +
    '# 可见:\n' +
    '#  > GET / HTTP/1.1            (请求行)\n' +
    '#  > Host: example.com\n' +
    '#  < HTTP/1.1 200 OK          (状态行)\n' +
    '#  < Content-Type: text/html\n\n' +
    '# 只看响应头\n' +
    'curl -sI http://example.com/',
  example2:
    '# 方法与状态码实验\n' +
    'curl -s -o /dev/null -w "%{http_code}\\n" http://example.com/   # 200\n' +
    'curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://httpbin.org/status/201\n' +
    '# 跟随重定向查看 Location\n' +
    'curl -v http://httpbin.org/redirect/1 2>&1 | grep -iE "^(< )?(HTTP|Location)"\n' +
    '# 发送/查看请求头\n' +
    'curl -H "X-Custom: hello" -v http://httpbin.org/headers 2>&1 | grep -i x-custom',
  example3:
    '# HTTPS/TLS 握手观察\n' +
    'curl -v https://example.com/ 2>&1 | grep -iE "SSL|TLS|subject|issuer"\n' +
    '# 查看证书链\n' +
    'openssl s_client -connect example.com:443 -servername example.com \\\n' +
    '  </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates\n' +
    '# (在受控的研究/学习环境测试,不涉及入侵)',
};

const net8 = {
  id: 'net-tools',
  title: '8. 网络排障工具实战',
  category: '应用层',
  version: '通用',
  level: '入门',
  summary: 'ping/traceroute/ss/netstat/curl/nc/ip/arp 等常用命令的排障思路与用法。',
  detail: [
    '网络排障从低到高逐层验证：先通不通(icmp)、再从端口/协议到应用。',
    'ping：用 ICMP 测主机可达性与 RTT；不通不一定是应用问题(可能防火墙禁 ICMP 但 TCP 通)。',
    '端口连通：curl 或 nc/nc -zv 测 TCP 某端口是否开放；nmap 做端口扫描(仅对自己/授权的设备)。',
    '路由：traceroute 看路径与故障点；mtr 持续跟踪更直观。',
    'DNS 与 HTTP：dig 排域名解析，curl -v 排 Web 服务与证书。',
    '性能与连接：ss 看连接/监听、带宽用 iperf、拥塞丢包用 ping -f/长时间 -c 统计。',
  ],
  notes: [
    '排障顺序建议：ping -> 端口(nc/telnet) -> 应用(curl -> HTTP 状态) -> 抓包(tcpdump)。',
    '端口扫描请严格限定在本人/授权机器，防止误操作触犯规则。',
  ],
  example:
    '# 连通性\n' +
    'ping -c 4 baidu.com\n' +
    'ping -c 4 -s 1400 baidu.com   # 指定包大小测 MTU\n\n' +
    '# 路由\n' +
    'traceroute -n baidu.com\n' +
    'mtr -n baidu.com              # 持续显示丢包/延迟\n\n' +
    '# TCP 端口通断\n' +
    'nc -zv baidu.com 80           # 成功/失败提示\n' +
    'timeout 3 bash -c "echo > /dev/tcp/baidu.com/80" && echo open || echo closed',
  example2:
    '# Web 服务排障\n' +
    'curl -sI http://example.com/   # 状态与响应头\n' +
    'curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" -L http://example.com/\n' +
    '# DNS 解析\n' +
    'dig +short example.com\n' +
    '# 本机监听的端口\n' +
    'ss -tlnp\n' +
    '# 某端口谁在监听\n' +
    'ss -tlnp | grep :8080',
  example3:
    '# 抓包定位问题(tcpdump)\n' +
    'sudo tcpdump -i any tcp port 8080 -nn -c 30 &\n' +
    '# 触发一次请求后查看 SYN/ACK/RST\n' +
    'curl -so /dev/null http://127.0.0.1:8080/\n' +
    'sleep 1\n' +
    '# RST 常表示端口关闭/拒绝; 一直 SYN 无人 ACK=被防火墙丢包\n\n' +
    '# 带宽测试(iperf3)\n' +
    '# 服务器: iperf3 -s\n' +
    '# 客户端: iperf3 -c <服务器IP> -t 10\n' +
    '# (自建/授权环境进行)',
};

const net9 = {
  id: 'net-socket-io',
  title: '9. 套接字与 I/O 模型',
  category: '编程',
  version: 'Python/通用',
  level: '进阶',
  summary: 'Socket 创建与选项、阻塞/非阻塞、I/O 多路复用 select/poll/epoll 的取舍。',
  detail: [
    'Socket 是传输层(TCP/UDP)的编程抽象：一个"文件描述符"代表一个通信端点。',
    '创建：socket(AF_INET, SOCK_STREAM) 是 TCP；SOCK_DGRAM 是 UDP；AF_INET6 是 IPv6。',
    '阻塞 I/O：read/accept 没数据就挂起线程等待，简单但一连接一线程开销大。',
    '非阻塞：设 SO_NONBLOCK 后调用立即返回错误(EAGAIN)，需自己轮询"可读/可写"。',
    'I/O 多路复用：select/poll/epoll 让单线程同时监听多个 fd 的就绪状态，成为高并发基础。',
    'epoll 是 Linux 高性能方案(事件驱动、O(1))；Python 里 asyncio/selectors 封装了这些；Node.js 也基于 epoll。',
    '常见 socket 选项：SO_REUSEADDR(快速重启)、SO_KEEPALIVE(探活)、TCP_NODELAY(禁 Nagle)。',
  ],
  notes: [
    '高并发不要"一客户端一线程"做无限扩展；用 epoll/异步/协程。',
    'SO_REUSEADDR 解决的问题: TIME_WAIT 期间端口仍可被重新绑定监听。',
  ],
  example:
    '# 查看 socket 相关系统限制\n' +
    'ulimit -n                        # 可打开最大文件数\n' +
    'cat /proc/sys/net/ipv4/ip_local_port_range\n' +
    '# 查看当前打开的 fd\n' +
    'ls -l /proc/$$/fd | head',
  example2:
    '#!/usr/bin/env python3\n' +
    '# 阻塞式回声服务器(单连接演示)\n' +
    'import socket\n' +
    'srv = socket.socket()\n' +
    'srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\n' +
    'srv.bind(("127.0.0.1", 9000))\n' +
    'srv.listen(5)\n' +
    'conn, addr = srv.accept()       # 阻塞等待\n' +
    'with conn:\n' +
    '    data = conn.recv(1024)      # 阻塞读\n' +
    '    conn.sendall(data)          # 原样返回\n' +
    '    print("收到并返回:", addr)\n' +
    'srv.close()\n' +
    '# 测试: echo "hi" | nc 127.0.0.1 9000',
  example3:
    '# 用 select 实现单线程多连接(核心思路)\n' +
    'import select, socket\n' +
    'srv = socket.socket()\n' +
    'srv.bind(("127.0.0.1", 9001)); srv.listen(5)\n' +
    'srv.setblocking(False)\n' +
    'readers = [srv]\n' +
    'while readers:\n' +
    '    r, _, _ = select.select(readers, [], [], 1)\n' +
    '    for s in r:\n' +
    '        if s is srv:\n' +
    '            c, _ = s.accept(); c.setblocking(False)\n' +
    '            readers.append(c)\n' +
    '        else:\n' +
    '            data = s.recv(1024)\n' +
    '            if data: s.sendall(data)\n' +
    '            else: readers.remove(s); s.close()\n' +
    '# 单线程可同时服务于多个连接(状态驱动)',
};

const net10 = {
  id: 'net-tcp-socket',
  title: '10. TCP Socket 编程实战',
  category: '编程',
  version: 'Python',
  level: '进阶',
  summary: '实现完整的 TCP 客户端与服务端、协议设计(粘包/拆包)、超时与优雅关闭。',
  detail: [
    'TCP 是字节流，无消息边界：应用层需自己定义"消息格式"，常见做法是定长头(Len-prefixed)或分隔符。',
    '粘包：多次 send 可能合并；拆包：一次 recv 可能只收到半个消息。不能假设一次 recv 正好一个消息。',
    '解决方案：消息 = 4 字节长度头 + 数据；接收端先读满长度头，再读满对应字节数。',
    '超时管理：settimeout 防止永久阻塞；心跳(heartbeat)检测对端存活。',
    '优雅关闭：数据传输完用 shutdown(SHUT_WR) 半关闭再 close，避免立即 RST 丢数据。',
    '并发：服务端每连接一个线程(threading)或异步 asyncio；注意共享状态加锁。',
  ],
  notes: [
    'recv(n) 返回 0 表示对端已关闭(EOF)，这是检测断开的可信方式。',
    '生产级直接选现成协议/框架(HTTP/WebSocket/消息队列)，自定义协议要谨慎设计边界。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    'import socket\n' +
    '# 服务端: 固定长度头(4字节小端)+消息\n' +
    'def recv_exact(sock, n):\n' +
    '    buf = b""\n' +
    '    while len(buf) < n:\n' +
    '        chunk = sock.recv(n - len(buf))\n' +
    '        if not chunk: raise ConnectionError("closed")\n' +
    '        buf += chunk\n' +
    '    return buf\n\n' +
    'def recv_msg(sock):\n' +
    '    (ln,) = __import__("struct").unpack(">I", recv_exact(sock, 4))\n' +
    '    return recv_exact(sock, ln)\n' +
    '# 类似地 send_msg 先发长度再发数据',
  example2:
    '#!/usr/bin/env python3\n' +
    'import socket, struct\n' +
    '# 客户端完整示例\n' +
    's = socket.create_connection(("127.0.0.1", 9100), timeout=5)\n' +
    'msg = b"hello tcp"\n' +
    's.sendall(struct.pack(">I", len(msg)) + msg)   # 长度头+数据\n\n' +
    '# 读长度头,再读正文\n' +
    'ln = struct.unpack(">I", recv_exact(s, 4))[0]\n' +
    'reply = recv_exact(s, ln)\n' +
    'print("回复:", reply)\n' +
    's.shutdown(socket.SHUT_WR)   # 半关闭\n' +
    's.close()',
  example3:
    '# 多线程服务端骨架\n' +
    'import socket, threading\n' +
    'def handle(c):\n' +
    '    with c:\n' +
    '        c.settimeout(30)\n' +
    '        try:\n' +
    '            while True:\n' +
    '                data = c.recv(1024)\n' +
    '                if not data: break\n' +
    '                c.sendall(data)\n' +
    '        except socket.timeout:\n' +
    '            pass\n\n' +
    'srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\n' +
    'srv.bind(("0.0.0.0", 9101)); srv.listen(128)\n' +
    'while True:\n' +
    '    c, a = srv.accept()\n' +
    '    threading.Thread(target=handle, args=(c,), daemon=True).start()',
};

if (typeof module !== 'undefined') module.exports = { net6, net7, net8, net9, net10 };