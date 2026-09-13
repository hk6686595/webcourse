// WebSocket 通信详解 1–10：握手、帧格式、服务端与实战
module.exports = [
  {
    id: 'ws-intro',
    title: '1. WebSocket 是什么：浏览器的全双工长连接',
    category: 'WebSocket 入门',
    version: 'RFC 6455',
    level: '入门',
    lang: 'js',
    summary: '理解 WebSocket 相对 HTTP 的差异、全双工通信模型与适用场景，搞懂为什么需要它。',
    detail: [
      'WebSocket 是运行在 TCP 之上、被浏览器原生支持的全双工（双向同时收发）通信协议，2011 年标准化为 RFC 6455。',
      '与 HTTP 最大区别：HTTP 是"请求-响应"式单向联动，服务端想主动推送只能靠轮询/长轮询；WebSocket 允许服务端随时主动发消息。',
      '一次 HTTP 握手升级后，连接保持为长连接，双方通过数据帧直接收发，无需每次重建 TCP。',
      '相比轮询，省去了大量无意义请求头与响应开销，带宽、延迟、服务器压力都显著下降。',
      '典型场景：实时聊天、在线协作编辑、行情推送、游戏同步、实时日志、消息推送、物联网监控面板。',
      '标准端口：ws=80、wss=443（TLS），与 HTTP 共用端口，天然过防火墙与代理。',
    ],
    notes: [
      'WebSocket 是面向消息的（类似 TCP 之上的消息通道），不承载 REST 的请求-响应语义。',
      '它解决的是"实时双向推送"，不解决可靠性：数据仍在内存、不持久化，断线需自带重连与补偿。',
    ],
    example: `// 浏览器三行代码全双工通信
const ws = new WebSocket('ws://example.com/socket');

ws.onopen    = () => ws.send('hello');      // 连接建立后发送
ws.onmessage = (e) => console.log('收到:', e.data);
ws.onclose   = () => console.log('连接已关闭');

// 服务端此时也可以推送任意多条消息给浏览器`,
  },
  {
    id: 'ws-handshake',
    title: '2. 握手过程：HTTP Upgrade 升级',
    category: 'WebSocket 入门',
    version: 'RFC 6455',
    level: '入门',
    lang: 'js',
    summary: '看懂 WebSocket 从 HTTP 升级为 WebSocket 的握手报文：原理、头部字段与安全校验。',
    detail: [
      'WebSocket 握手就是一次特殊的 HTTP GET：客户端发送 Upgrade: websocket 头，服务端返回 101 Switching Protocols。',
      '关键请求头：Sec-WebSocket-Key（客户端随机 Base64，16 字节随机值）、Sec-WebSocket-Version: 13。',
      '服务端把 Sec-WebSocket-Key + 固定 GUID "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" 做 SHA-1，结果 Base64 成 Sec-WebSocket-Accept 返回。',
      '这个密钥校验证明对端真的看懂了握手并执行过加密运算，也可防止缓存/代理把握手当普通 HTTP 缓存。',
      '握手完成后，后续流量全部切换为 WebSocket 数据帧格式（0x81 打头的二进制帧），不再是 HTTP 报文。',
      '浏览器自动完成握手；Node/Java 等客户端需要自己构造或用现成库（ws、socket.io）。',
    ],
    notes: [
      '握手必须通过 HTTP/1.1；HTTP/2 上有 RFC 8441 定义的扩展方式，但主流仍是 HTTP/1.1 升级。',
      '握手失败会返回 4xx（如 400 缺字段）或直接断开，浏览器触发 onerror。',
    ],
    example: `// 客户端请求
GET /socket HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: https://app.example.com

// 服务端响应（成功即完成升级）
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

// 之后双方便通过二进制帧直接通信`,
  },
  {
    id: 'ws-frame',
    title: '3. 数据帧格式：FIN / opcode / 掩码',
    category: 'WebSocket 协议',
    version: 'RFC 6455',
    level: '进阶',
    lang: 'js',
    summary: '逐字节拆解 WebSocket 帧：FIN、opcode、MASK、长度与负载，理解二进制数据流。',
    detail: [
      '帧首字节高 4 位保留，FIN 位表是否最后一帧（分片），低 4 位加第二字节前 4 位组成 opcode（0x1 文本 / 0x2 二进制 / 0x8 关闭 / 0x9 Ping / 0xA Pong）。',
      'MASK 位：浏览器→服务端必须置 1 并带 4 字节随机掩码；服务端→浏览器不允许掩码，这是协议强制。',
      '长度字段：7 位（≤125）、126 加 2 字节（≤65535）、127 加 8 字节（更大），动态可变长。',
      '负载需按掩码逐字节异或还原：第 i 字节与掩码第 i%4 字节做 XOR。',
      '分片机制：FIN=0 的数据帧 + FIN=1 的最后帧拼成完整消息；控制帧不能分片，也不能夹在数据分片中间。',
      '编码注意：文本帧负载必须是 UTF-8 合法字符串，二进制帧放原始字节。',
    ],
    notes: [
      '掩码存在是为防止对网关切片的缓存投毒（当年浏览器实现的攻击来源）。',
      '实现层建议交给库处理；手写解析器时注意长度扩展字段与非法 opcode 的拒绝。',
    ],
    example: `# 服务端向客户端发送文本 "hi" 的帧：
# 0x81       FIN=1, opcode=0x1 (text)
# 0x02       负载长度 = 2（无掩码）
# 0x68 0x69  ASCII 'h' 'i'
=> 十六进制: 81 02 68 69

# 客户端回 "hi" 必须带掩码：
# 0x81 0x82 <4字节掩码> <掩码后的2字节>
# 掩码还原: 负载 = 原文 ^ mask[i % 4]

# 解析器必须校验：非法 opcode / 超长 / 掩码规则 -> 关闭`,
  },
  {
    id: 'ws-close',
    title: '4. 关闭握手与状态码',
    category: 'WebSocket 协议',
    version: 'RFC 6455',
    level: '进阶',
    lang: 'js',
    summary: '掌握优雅关闭流程（Close 帧）+ 标准状态码语义，实现可靠断线清理。',
    detail: [
      '任何一方想关闭连接，发 Close 控制帧（opcode 0x8），格式：2 字节状态码 + 可选原因文本。',
      '对端收到 Close 后需回一个 Close 帧，随后双方关闭 TCP；流程要完整，任意一方欠帧都算异常。',
      '标准状态码：1000 正常关闭；1001 主动离开；1006 异常断开（不实际发帧）；1011 服务端异常。',
      '1000~4999 范围外或未定义的码（如 1005 无状态）不能由应用直接发送，只具保留语义。',
      '浏览器 onclose 里的 code 反映真实结束原因：收到 1006 基本就是网络中断或 devtools 主动断开。',
      '服务端关闭前应先把缓冲消息发完（Flush）再发 Close，避免客户端丢失最后一条数据。',
    ],
    notes: [
      '关闭后连接无法复用，重连是唯一出路；服务端要在 close 中清理定时器与连接内存。',
      '业务自定义终止原因可用 4000-4999 私有区间（不影响协议互通）。',
    ],
    example: `// 浏览器优雅关闭
ws.close(1000, 'bye');
// 对端收到 Close -> 回 Close -> 两边断开
// ws.onclose: code=1000, reason='bye', wasClean=true

// 服务端（Node ws 库）主动关闭并带原因
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (socket) => {
  socket.on('message', (d) => {
    if (String(d) === 'quit') socket.close(1000, 'bye');
  });
});

// 状态码参考：
// 1000 正常  1001 离开  1006 异常(不发帧)  1008 协议违规`,
  },
  {
    id: 'ws-wss',
    title: '5. wss 加密连接与 Nginx 反向代理',
    category: 'WebSocket 进阶',
    version: 'TLS 1.2+',
    level: '进阶',
    lang: 'py',
    summary: '给 WebSocket 加上 TLS（wss）、通过 Nginx 反向代理与负载均衡，处理真实部署环境。',
    detail: [
      'wss = WebSocket over TLS（443），与 https 同一套证书体系；生产环境不允许裸 ws 传敏感数据。',
      '浏览器同源策略：wss 连接不受 CORS 管控，但服务端要校验 Origin 头白名单，防止跨站劫持。',
      'Nginx 反向代理：用 map 探测 Upgrade 头，命中则转发给后端；每个 WebSocket 长连接会 1:1 占用一个 Nginx worker 连接。',
      '负载均衡：轮询会导致长连接绑定到单节点，会话粘滞（ip_hash 或后端共享 session）是常见解法。',
      '代理层必须关闭缓冲（proxy_buffering off）并加长 proxy_read_timeout 与 keepalive 参数，否则连接会频繁断开。',
      '多层代理（CDN/网关）都要同时放行 HTTP Upgrade 与 Connection 头，任一层拦截就升级失败。',
    ],
    notes: [
      'Nginx 默认 60s 超时是 ws 频繁掉线的最常见元凶，务必显式调大并配心跳保活。',
      'TLS 证书续期后老连接不受影响；客户端证书校验失败会直接 TLS 握手失败。',
    ],
    example: `# Nginx 反代 wss 配置要点
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name ws.example.com;
    ssl_certificate     /etc/ssl/fullchain.pem;
    ssl_certificate_key /etc/ssl/privkey.pem;

    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;

        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}

# 浏览器: const ws = new WebSocket('wss://ws.example.com/ws')`,
  },
  {
    id: 'ws-browser-api',
    title: '6. 浏览器端 WebSocket API 全解',
    category: 'WebSocket 进阶',
    version: 'RFC 6455',
    level: '进阶',
    lang: 'js',
    summary: '系统掌握浏览器 WebSocket 对象：事件、状态机、send 的二进制与异常处理。',
    detail: [
      '状态机：CONNECTING(0) → OPEN(1) → CLOSING(2)/CLOSED(3)，用 readyState 查询当前阶段。',
      '事件：onopen（握手成功）、onmessage（收到数据，event.data）、onerror（出错）、onclose（连接关闭）。',
      '传输格式：send() 可发 string、ArrayBuffer、Blob、TypedArray；binaryType 决定收到的二进制呈现为 blob 还是 arraybuffer。',
      '接收时 event.data 依据服务端 opcode 自动是字符串或二进制对象，无需自己判断协议层。',
      '关闭：close(code, reason)；传 1000 与结束原因，其他情况 onclose 不保证能收到。',
      '浏览器对并发连接数与单帧大小有限制（如每个域约 6 个 ws），大量推送建议连接池复用。',
    ],
    notes: [
      'onmessage 里别做重型同步计算，会阻塞渲染线程；高频推送考虑节流与走 worker。',
      '页面不可见（后台 tab）时浏览器会节流定时器，心跳实现要加 visibilitychange 兜底。',
    ],
    example: `const ws = new WebSocket('wss://api.example.com/live');
ws.binaryType = 'arraybuffer';   // 收二进制为 ArrayBuffer

ws.onopen = () => {
  // 发文本
  ws.send(JSON.stringify({ type: 'join', room: 'r1' }));
  // 发二进制
  const buf = new Uint8Array([1, 2, 3]).buffer;
  ws.send(buf);
};

ws.onmessage = (e) => {
  if (typeof e.data === 'string') {
    console.log('文本:', e.data);
  } else {
    console.log('二进制:', new Uint8Array(e.data));
  }
};

ws.onclose = (e) => console.log('关闭:', e.code, e.reason);

// 连接前检查状态机
if (ws.readyState === WebSocket.OPEN) ws.send('ok');`,
  },
  {
    id: 'ws-node',
    title: '7. Node.js 服务端：用 ws 库实现 WebSocket 服务',
    category: 'WebSocket 实战',
    version: 'ws 8+',
    level: '实战',
    lang: 'js',
    summary: '用 ws 库搭建 WebSocket 服务端并与 Express 同端口共存，覆盖广播、心跳与二进制收发。',
    detail: [
      'ws 是 Node.js 最流行的 WebSocket 实现，API 简洁、性能好，广泛用于实时服务。',
      'new WebSocketServer({ port }) 直接起独立服务；与 Express 共用端口用 { server } 挂到 http.Server。',
      'connection 回调拿到每个 socket；socket.on message/close/error、socket.send() 发送，send 支持回调确认。',
      '广播：维护 Set<socket>，遍历发送；注意对已关闭连接做清理，防止发送到死连。',
      '心跳保活：服务端定时 ping（socket.ping()），客户端 pong 回调重置看门狗，超时即 terminate()。',
      '收到二进制默认是 Buffer，用 isBinary 参数区分文本/二进制，或约定统一走 JSON 文本。',
    ],
    notes: [
      '消息进入要用 try/catch 包 JSON.parse，恶意/损坏负载不能让服务崩溃。',
      '生产建议开启 maxPayload 与 perMessageDeflate，限制单帧大小与压缩风控。',
    ],
    example: `npm install ws

// server.js：与 Express 同端口
import http from 'node:http';
import { WebSocketServer } from 'ws';
import express from 'express';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (socket) => {
  clients.add(socket);
  for (const c of clients) c.send('新用户上线');

  socket.on('message', (data, isBinary) => {
    const msg = isBinary ? data : data.toString();
    for (const c of clients)
      if (c !== socket && c.readyState === 1) c.send(msg);
  });

  socket.on('close', () => clients.delete(socket));
});

server.listen(8080);`,
  },
  {
    id: 'ws-heartbeat',
    title: '8. 心跳保活与断线重连',
    category: 'WebSocket 实战',
    version: 'RFC 6455',
    level: '实战',
    lang: 'js',
    summary: '用 Ping/Pong 与控制帧判断存活，配指数退避重连，构建抗抖动的前后端实时通道。',
    detail: [
      'TCP keepalive 与 HTTP keep-alive 都不是应用层心跳；WebSocket 推荐用协议级 Ping/Pong（opcode 0x9/0xA）。',
      '服务端定时 ping，客户端收到即自动回 pong；服务端看 pong 超时即判死并关闭（terminate）。',
      '浏览器端不能主动发 Ping，但可发业务级心跳（如 {"type":"ping"}），服务端回 pong 即可。',
      '断线重连：onclose/onerror 触发后按指数退避（1s→2s→4s…封顶）重连，避免重连风暴。',
      '重连成功后的补偿：拉取离线期间的状态快照、重发未确认的业务消息，避免消息丢失。',
      '页面可见性：visibilitychange 时检测连接状态并立即重连，后台 tab 回来秒级恢复。',
    ],
    notes: [
      '重连必须携带同样的会话标识，否则服务端会创建全新会话、丢失状态。',
      '心跳间隔通常设为代理超时的 1/3（如 Nginx 60s 则每 20s 一次）；别靠服务端单边探测。',
    ],
    example: `// 服务端：wss 基础上的心跳看门狗
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => (ws.isAlive = true));
});
const iv = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30 * 1000);

// 浏览器：指数退避重连 + 定时探活
let delay = 1000;
function connect() {
  const ws = new WebSocket('wss://...');
  ws.onopen  = () => { delay = 1000; sendPing(); };
  ws.onclose = () => setTimeout(connect, delay = Math.min(delay * 2, 15000));
  ws.onmessage = (e) => { if (e.data === 'pong') schedulePing(); };
}
function sendPing(){ ws.send('ping'); setTimeout(sendPing, 20000); }`,
  },
  {
    id: 'ws-compare',
    title: '9. 轮询 / 长轮询 / SSE / WebSocket 怎么选',
    category: 'WebSocket 实战',
    version: 'RFC 6455',
    level: '实战',
    lang: 'js',
    summary: '横向对比四种实时推送方案，从延迟、方向性、成本给出选型清单。',
    detail: [
      '短轮询：客户端定时发请求，简单但无效请求多、延迟不可控，适合低频查询与兼容极老环境。',
      '长轮询（Long Polling）：请求挂起直到有新数据才返回，比短轮询省流量，但仍是半双工、网络差时毛刺多。',
      'SSE（Server-Sent Events）：HTTP 长连接 + 服务端单向推送，原生支持自动重连与事件 ID；浏览器只需 EventSource。',
      'WebSocket：双向、低延迟，但实现复杂度高、无自动重连、浏览器端需自带状态机。',
      '选型口诀：要"服务端持续推送、单向、要自动重连"→ SSE；要"双向交互、低延迟、二进制"→ WebSocket。',
      '基础设施兼容性很重要：涉及 CDN/网关时，SSE 通常比 ws 过墙成功率更高。',
    ],
    notes: [
      'SSE 也有相同的 TLS 需求，但自动重连 + EventSource 让浏览器端代码极简。',
      '实时聊天/游戏下单多用 WebSocket；行情/新闻推送用 SSE 的实现常见且省钱。',
    ],
    example: `// ---------- SSE（浏览器原生，自动重连）----------
const sse = new EventSource('/api/events');
sse.onmessage = (e) => { /* 每次服务端推送 */ };

// ---------- WebSocket（需要自己处理状态与重连）----------
const ws = new WebSocket('wss://...');
ws.onmessage = (e) => { /* 双向收发 */ };

// 成本对比：
//   短轮询: 每 5s 一个完整 HTTP 往返，服务端压力最大
//   长轮询: 挂起请求，省一半流量，仍有抖动
//   SSE:    单连接单工，服务端推送即达，延迟 <100ms
//   WS:     单连接全双工，延迟最低，可发二进制`,
  },
  {
    id: 'ws-chat',
    title: '10. 实战：在线聊天室端到端',
    category: 'WebSocket 实战',
    version: 'RFC 6455',
    level: '实战',
    lang: 'js',
    summary: '把握手、广播、心跳、重连拼成一个最小可用的在线聊天室：协议设计 + 服务端 + 浏览器端。',
    detail: [
      '协议设计：用 JSON 文本帧区分类型——{type: join|chat|ping, room, msg}，收端按 type 分发。',
      '房间模型：服务端维护 Map<room, Set<socket>>，join 时加入、离开时移除，广播只发同房间。',
      '服务端要点：join 校验、消息先落库再广播（保证历史）、心跳看门狗清理死连接。',
      '浏览器端要点：onopen 发 join、输入框 send、onmessage 渲染、onclose 指数退避重连。',
      '二进制 vs 文本：聊天走文本即可；涉及图片/文件上传可混用 ArrayBuffer，按 opcode 分支处理。',
      '上线前必查：房间人数上限、消息长度上限、XSS 转义（渲染用 textContent 而非 innerHTML）。',
    ],
    notes: [
      '生产聊天室还需要鉴权（token 校验）、消息持久化（Redis/MongoDB）、限流与敏感词，本例只给骨架。',
      '多实例部署时房间状态放 Redis Pub/Sub 或消息中间件，单一内存 Map 只适合单机。',
    ],
    example: `// ---------- server.js ----------
import { WebSocketServer } from 'ws';
const rooms = new Map();                 // room -> Set<socket>

function join(room, ws) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
  broadcast(room, { type: 'sys', msg: '已加入房间' });
}
function broadcast(room, data) {
  const json = JSON.stringify(data);
  for (const ws of rooms.get(room) || [])
    if (ws.readyState === 1) ws.send(json);
}
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'sys', msg: '连接成功，请 join' }));
  ws.on('message', (raw) => {
    const p = JSON.parse(raw);
    if (p.type === 'join') return join(p.room, ws);
    if (p.type === 'chat') return broadcast(p.room, { type: 'chat', msg: p.msg });
  });
});

// ---------- client.html ----------
const ws = new WebSocket('ws://localhost:8080');
ws.onopen  = () => ws.send(JSON.stringify({ type: 'join', room: 'lobby' }));
ws.onmessage = (e) => {
  const p = JSON.parse(e.data);
  const line = document.createElement('div');
  line.textContent = (p.type === 'sys' ? '【系统】' : '') + p.msg;
  log.appendChild(line);                 // textContent 防 XSS
};
sendBtn.onclick = () =>
  ws.send(JSON.stringify({ type: 'chat', room: 'lobby', msg: input.value }));`,
  },
];