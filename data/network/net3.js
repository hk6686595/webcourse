// 网络编程 11–15：UDP/异步/HTTP/WebSocket/抓包
const net11 = {
  id: 'net-udp-socket',
  title: '11. UDP Socket 编程',
  category: '编程',
  version: 'Python',
  level: '进阶',
  summary: 'UDP 无连接收发、广播/多播、消息边界与可靠性补偿策略。',
  detail: [
    'UDP 编程比 TCP 简单：无需 connect/accept，直接 sendto/recvfrom；每个数据报有天然边界(不会粘包)。',
    '数据报边界：一次 recvfrom 收到恰好一个 sendto 发送的报文(前提缓冲区够大)。',
    '广播：SO_BROADCAST 后发往 255.255.255.255 或 192.168.1.255；只对子网内有效。',
    '多播：加入组播组(如 224.0.0.1)收发组播，适合全体成员收同一数据(VoIP/组播视频)。',
    '可靠性缺失：丢包/乱序/重复都可能发生，需要时应用层自己补：序号+确认+重传+去重。',
    '性能：无握手无状态，做高吞吐/低延迟很合适；配合 epoll/asyncio 可支撑海量会话。',
  ],
  notes: [
    'recvfrom 缓冲区设大(如 65507)以免截断大报文。',
    '生产可靠 UDP 直接用现成框架：QUIC(aioquic)、KCP、RUDP。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    'import socket\n' +
    '# 服务端(接收任意来源)\n' +
    's = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    's.bind(("0.0.0.0", 9300))\n' +
    'while True:\n' +
    '    data, addr = s.recvfrom(65507)\n' +
    '    print("来自", addr, ":", data)\n' +
    '    s.sendto(b"ack:" + data, addr)\n' +
    '# 一个数据报=一次 recvfrom, 天然边界\n' +
    '# 测试: echo hi | nc -u 127.0.0.1 9300',
  example2:
    '#!/usr/bin/env python3\n' +
    'import socket\n' +
    '# 广播发送\n' +
    's = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    's.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)\n' +
    's.sendto(b"announce", ("255.255.255.255", 9400))\n' +
    '# 子网广播\n' +
    '# s.sendto(b"x", ("192.168.1.255", 9400))\n\n' +
    '# 接收端\n' +
    'r = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    'r.bind(("0.0.0.0", 9400))\n' +
    'print("收到广播:", r.recvfrom(1024))\n' +
    '# (在自我搭建的局域网环境演示)',
  example3:
    '#!/usr/bin/env python3\n' +
    'import socket, struct\n' +
    '# 加入多播组\n' +
    'GROUP = "224.0.0.251"          # mDNS 组(学习示例)\n' +
    's = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    's.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\n' +
    's.bind(("", 5353))\n' +
    'mreq = struct.pack("4sl", socket.inet_aton(GROUP), socket.INADDR_ANY)\n' +
    's.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)\n' +
    '# 之后 recvfrom 可收到发给该组的多播包\n' +
    '# (自建/授权环境做网络协议学习实验)',
};

const net12 = {
  id: 'net-async',
  title: '12. 非阻塞与异步网络编程',
  category: '编程',
  version: 'Python asyncio',
  level: '进阶',
  summary: '事件循环、asyncio 编写高并发 TCP/UDP 服务、协程与并发模型对比。',
  detail: [
    '异步解决"C10K"：单线程事件循环用 I/O 多路复用监听海量连接，事件到来时执行回调/协程，内存与线程开销小。',
    'asyncio 是 Python 的异步框架：async def 定义协程，await 挂起等待，事件循环调度。',
    '协程在 await 处让出控制权，不阻塞其他任务；适合 I/O 密集型(大量网络等待)。',
    'asyncio.start_server / open_connection 高层 API 建立TCP服务端/客户端；streams 提供读写缓冲。',
    '并发用 asyncio.gather/create_task；加锁用 asyncio.Lock 防止共享状态竞态。',
    '对比：多线程适合有阻塞库；asyncio 适合纯异步 I/O；高吞吐网络服务多选 asyncio + uvloop 加速。',
  ],
  notes: [
    '在协程里跑阻塞调用(如 requests)会卡住事件循环，用 asyncio.to_thread 或选异步库(aiohttp)。',
    '一次事件循环只跑一个线程，CPU 密集任务需换多进程。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    'import asyncio\n\n' +
    'async def handle(reader, writer):\n' +
    '    data = await reader.read(1024)\n' +
    '    writer.write(data)                 # 回声\n' +
    '    await writer.drain()\n' +
    '    writer.close()\n' +
    '    await writer.wait_closed()\n\n' +
    'async def main():\n' +
    '    srv = await asyncio.start_server(handle, "127.0.0.1", 9500)\n' +
    '    async with srv:\n' +
    '        await srv.serve_forever()\n\n' +
    'asyncio.run(main())',
  example2:
    '#!/usr/bin/env python3\n' +
    'import asyncio\n\n' +
    'async def fetch(host, port, path):\n' +
    '    r, w = await asyncio.open_connection(host, port)\n' +
    '    w.write((f"GET {path} HTTP/1.0\\r\\nHost: {host}\\r\\n\\r\\n").encode())\n' +
    '    await w.drain()\n' +
    '    data = await r.read()\n' +
    '    w.close()\n' +
    '    return len(data)\n\n' +
    'async def main():\n' +
    '    # 并发请求多个\n' +
    '    results = await asyncio.gather(\n' +
    '        fetch("example.com", 80, "/"),\n' +
    '        fetch("example.org", 80, "/"),\n' +
    '    )\n' +
    '    print("下载字节:", results)\n\n' +
    'asyncio.run(main())',
  example3:
    '#!/usr/bin/env python3\n' +
    'import asyncio\n\n' +
    '# 高并发限速 + 优雅并发控制\n' +
    'sem = asyncio.Semaphore(10)     # 最多10并发\n\n' +
    'async def worker(i):\n' +
    '    async with sem:\n' +
    '        await asyncio.sleep(0.1)   # 模拟网络\n' +
    '        return i\n\n' +
    'async def main():\n' +
    '    res = await asyncio.gather(*(worker(i) for i in range(100)))\n' +
    '    print("完成:", len(res))\n\n' +
    'asyncio.run(main())\n' +
    '# C10K: asyncio 单进程可轻松支撑上万连接',
};

const net13 = {
  id: 'net-http-dev',
  title: '13. HTTP 客户端与服务端编程',
  category: '编程',
  version: 'Python',
  level: '进阶',
  summary: '用 requests/urllib 发起请求、用 http.server/Flask 搭接口，处理 JSON、会话与重试。',
  detail: [
    'HTTP 客户端核心：请求构造(方法/URL/头/body)、响应处理(状态/头/JSON)、错误与重试、超时、会话(Cookie)。',
    'requests 是最流行客户端：Requests.get(url, params=, headers=, timeout=)、resp.json()、resp.status_code。',
    '会话(Session)：复用连接、自动管理 Cookie，适合需要登录态的多次请求。',
    '重试与超时：requests 默认无重试，用 HTTPAdapter 配 Retry；务必设 timeout 防挂死。',
    '服务端：Python 内置 http.server 适合原型；生产用 Flask/FastAPI/uvicorn。',
    'JSON 是主流交换格式；上传用 files=，表单用 data=，带认证用 auth=(user,pwd) 或 header。',
  ],
  notes: [
    '始终设 timeout；不要对不可信 URL 直接拼用户输入进 URL 造成注入。',
    '只访问你有权访问的公开接口做学习；涉及接口安全要谨慎。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    '# 用 requests 发起请求\n' +
    'import requests\n' +
    '# 实例: 镜像仓库的公开 API(学习用)\n' +
    'r = requests.get("https://api.github.com", timeout=10)\n' +
    'print("状态:", r.status_code)\n' +
    'print("JSON:", list(r.json().keys()))\n\n' +
    '# 带查询参数\n' +
    'r2 = requests.get("https://api.github.com/search/repositories",\n' +
    '                 params={"q": "python", "per_page": 3},\n' +
    '                 timeout=10)\n' +
    'print(r2.json()["total_count"], "个仓库")',
  example2:
    '#!/usr/bin/env python3\n' +
    '# 会话 + 头 + JSON 提交\n' +
    'import requests\n' +
    's = requests.Session()\n' +
    's.headers.update({"User-Agent": "study-client/1.0"})\n\n' +
    '# POST JSON\n' +
    'r = s.post("https://httpbin.org/post",\n' +
    '           json={"name": "alice", "age": 30},\n' +
    '           timeout=10)\n' +
    'print("回显:", r.json().get("json"))\n\n' +
    '# 上传文件\n' +
    'files = {"file": ("a.txt", b"hello", "text/plain")}\n' +
    'r2 = s.post("https://httpbin.org/post", files=files, timeout=10)\n' +
    'print("文件名:", r2.json()["files"])',
  example3:
    '#!/usr/bin/env python3\n' +
    '# 带重试的健壮客户端\n' +
    'import requests\n' +
    'from requests.adapters import HTTPAdapter\n' +
    'from urllib3.util.retry import Retry\n\n' +
    's = requests.Session()\n' +
    'retry = Retry(total=3, backoff_factor=0.5,\n' +
    '             status_forcelist=[500, 502, 503, 504])\n' +
    'adapter = HTTPAdapter(max_retries=retry)\n' +
    's.mount("https://", adapter); s.mount("http://", adapter)\n\n' +
    'try:\n' +
    '    r = s.get("https://httpbin.org/status/503", timeout=10)\n' +
    '    print("最终状态:", r.status_code)\n' +
    'except requests.RequestException as e:\n' +
    '    print("重试后仍失败:", e)',
};

const net14 = {
  id: 'net-websocket',
  title: '14. WebSocket 实时通信',
  category: '编程',
  version: 'RFC 6455',
  level: '进阶',
  summary: 'WebSocket 握手升级、双向全双工通信、Python(websockets)与浏览器端使用。',
  detail: [
    'WebSocket 在单个 TCP 连接上提供全双工、低延迟双向消息，适合聊天、行情、协作(对比 HTTP 轮询)。',
    '握手：客户端发 Upgrade: websocket + Sec-WebSocket-Key，服务端回 101 并算 Sec-WebSocket-Accept 完成升级。',
    '连接建立后，两端可随时互发文本/二进制帧，无请求-响应约束，消息有明确边界。',
    'Python 服务端：websockets 库 asyncio 风格，server.connected -> receive/send。',
    '浏览器端：原生 WebSocket API(new WebSocket(url), onmessage/send/close)，无需额外库。',
    '注意：连接是长连接，需心跳/超时管理；Nginx 反向代理需配置 Upgrade 头。',
  ],
  notes: [
    '浏览器端 WebSocket 地址 ws:// 或加密 wss://。',
    '需要保序可靠文本互发用它；只做"推送"也可以用 SSE(Server-Sent Events)。',
  ],
  example:
    '#!/usr/bin/env python3\n' +
    '# 用 websockets 搭推送服务\n' +
    'import asyncio, websockets\n\n' +
    'async def handler(ws):\n' +
    '    await ws.send("welcome")\n' +
    '    async for msg in ws:\n' +
    '        print("收到:", msg)\n' +
    '        await ws.send("echo: " + msg)\n\n' +
    'async def main():\n' +
    '    async with websockets.serve(handler, "127.0.0.1", 9700):\n' +
    '        await asyncio.Future()      # 常驻\n\n' +
    'asyncio.run(main())',
  example2:
    '#!/usr/bin/env python3\n' +
    '# 客户端\n' +
    'import asyncio, websockets\n\n' +
    'async def main():\n' +
    '    async with websockets.connect("ws://127.0.0.1:9700") as ws:\n' +
    '        print("欢迎:", await ws.recv())\n' +
    '        await ws.send("hello ws")\n' +
    '        print("回显:", await ws.recv())\n\n' +
    'asyncio.run(main())\n' +
    '# 输出: 欢迎 welcome / 回显 echo: hello ws',
  example3:
    '<!-- 浏览器端 -->\n' +
    '<script>\n' +
    '  const ws = new WebSocket("ws://127.0.0.1:9700");\n' +
    '  ws.onopen = () => ws.send("hi");\n' +
    '  ws.onmessage = (e) => console.log("收到:", e.data);\n' +
    '  ws.onclose = () => console.log("已关闭");\n' +
    '</script>\n' +
    '# 服务端用前面那个 handler, 浏览器即可收发\n' +
    '# (FlashPolicy 无关, 现代浏览器原生支持)',
};

const net15 = {
  id: 'net-packet-analysis',
  title: '15. 抓包与协议分析',
  category: '进阶',
  version: 'Wireshark/tcpdump',
  level: '进阶',
  summary: 'tcpdump/Wireshark 过滤语法、常见协议报文解读，用分析定位网络问题。',
  detail: [
    '抓包即在网卡层面捕获原始帧，用于理解协议细节、定位丢包/延迟/篡改问题。合法范围：本机、自己搭建的环境、已获授权的网络。',
    'tcpdump：命令行抓包，-nn 不解析、-c 数量、-w 存文件、-r 读文件、-i 接口。',
    '过滤器(BPF)：host/port/tcp/src/dst/and/or/not，如 tcp port 443、src host 1.2.3.4。',
    'Wireshark：图形化 + 强交互(跟随 TCP 流、按协议解、图表)；可分析保存的 pcap 文件。',
    '解析要点：看 TCP 握手(SEQ/ACK)、重传(TCP Retransmission，常=丢包)、RST(异常关闭)、延迟(时间戳列)。',
    '只做学习分析时务必限于自己/授权环境，避免截获他人通信触碰隐私与合规红线。',
  ],
  notes: [
    '抓自己本机流量: 接口 often lo 或 eth0; 可 sudo 提权。',
    'HTTPS 头是密文，但可看 SNI(域名)与 IP；全解密需在本地配 TLS keylog(学习场景)。',
  ],
  example:
    '# 抓包基础\n' +
    'sudo tcpdump -i any -c 10 -nn        # 抓10个包不解析端口名\n' +
    'sudo tcpdump -i any -c 100 -w cap.pcap -nn  # 存文件\n' +
    'sudo tcpdump -r cap.pcap -nn         # 离线读取\n\n' +
    '# 过滤器示例\n' +
    'sudo tcpdump -i any tcp port 443 -nn\n' +
    'sudo tcpdump -i any host 8.8.8.8 -nn\n' +
    'sudo tcpdump -i any src 192.168.1.100 and dst tcp -nn',
  example2:
    '# 抓 HTTP 并跟随交互\n' +
    'sudo tcpdump -i any port 80 -nn -A &\n' +
    'curl -so /dev/null http://example.com/\n' +
    'sleep 1\n' +
    '# -A 显示 ASCII 内容, 可见 HTTP 头\n\n' +
    '# 只抓三次握手\n' +
    'sudo tcpdump -i any "tcp[tcpflags] & tcp-syn != 0" -c 3 -nn',
  example3:
    '# Wireshark 常用过滤器输入框(自建环境先抓本机演示)\n' +
    '#   ip.addr == 你的IP\n' +
    '#   tcp.port == 8080\n' +
    '#   dns                  # 只看 DNS\n' +
    '#   http.request.method == "GET"\n' +
    '#   tcp.analysis.retransmission   # 重传=网络不稳\n\n' +
    '# 查看慢请求: 统计 -> 服务响应时间\n' +
    '# 追踪完整流: 右键 -> Follow -> TCP Stream\n' +
    '# (仅在你自己的或明确授权环境进行抓包学习)',
};

if (typeof module !== 'undefined') module.exports = { net11, net12, net13, net14, net15 };