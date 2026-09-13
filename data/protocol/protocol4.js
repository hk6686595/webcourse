// WebRTC 通信详解 31–40：入门、原理与实战
module.exports = [
  {
    id: 'webrtc-intro',
    title: '31. WebRTC 是什么：浏览器的实时音视频通信',
    category: 'WebRTC 入门',
    version: 'WebRTC 1.0',
    level: '入门',
    lang: 'js',
    summary: '理解 WebRTC 的定位：浏览器原生支持的点对点实时通信标准，无需插件即可音视频通话。',
    detail: [
      'WebRTC（Web Real-Time Communication）是 W3C + IETF 联合制定的开放标准，让浏览器之间无需安装插件即可实时音视频通话与点对点数据交换。',
      '三大核心 API：getUserMedia（采集音视频）、RTCPeerConnection（建立并维护点对点媒体链路）、RTCDataChannel（任意二进制数据通道）。',
      '媒体数据走 UDP 之上的 SRTP（加密实时传输），并带自适应codec、抗丢包、抖动缓冲等为实时音视频优化的机制。',
      '与 WebSocket 定位不同：WebSocket 是 TCP 上的消息通道，适合推送；WebRTC 是 UDP 上为低延迟媒体优化的全栈方案。',
      '天然端到端：媒体流多数时候直接经 P2P 或选择性转发节点，服务器不落盘，隐私与带宽都更可控。',
      '典型场景：视频会议、直播连麦、游戏语音、远程桌面、在线白板与点对点文件传输。',
    ],
    notes: [
      'WebRTC 不直接提供信令协议：交换 SDP/ICE 候选仍需 WebSocket/HTTP 之类的信令通道配合。',
      '打洞失败时会退化为 TURN 服务器中继，需要准备 TURN 服务兜底。',
    ],
    example: `// 最简链路一瞥（完整见后续篇目）
// 1) 采集本地音视频
const localStream = await navigator.mediaDevices
    .getUserMedia({ video: true, audio: true });
localVideo.srcObject = localStream;

// 2) 创建对等连接
const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

// 3) 通过信令交换 offer/answer 后即可通话`,
  },
  {
    id: 'webrtc-api',
    title: '32. 架构拆解：三大核心 API 与生命周期',
    category: 'WebRTC 入门',
    version: 'WebRTC 1.0',
    level: '入门',
    lang: 'js',
    summary: '系统认识 getUserMedia、RTCPeerConnection、RTCDataChannel 的分工与完整生命周期。',
    detail: [
      'getUserMedia：从摄像头/麦克风采集 MediaStream，内含视频轨道（VideoTrack）与音频轨道（AudioTrack）。',
      'RTCPeerConnection：P2P 连接对象，负责 ICE 穿透、DTLS 握手、媒体协商与媒体传输，内部封装了大量协议。',
      'RTCDataChannel：在已建立的 P2P 链路上提供双向任意数据通道，API 与 WebSocket 几乎一致。',
      '生命周期：采集 → 协商（offer/answer）→ 建立（ICE/DTLS）→ 传输 → 关闭（close()/releaseStream）。',
      'negotiationneeded 事件会在需要重协商（比如新增轨道）时触发，是现代 API 的推荐协商入口。',
      '状态机用 onconnectionstatechange 观察：new → connecting → connected / failed / disconnected / closed。',
    ],
    notes: [
      '浏览器对接口有限制：getUserMedia 必须在安全上下文（https/localhost）才能调用。',
      '旧 API addStream 已废弃，推荐 addTrack + 统一用 track 对象管理。',
    ],
    example: `const pc = new RTCPeerConnection(iceConfig);

// 采集并加入连接
const stream = await navigator.mediaDevices.getUserMedia(mediaConsts);
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 监听远端媒体流
pc.addEventListener('track', (ev) => {
    remoteVideo.srcObject = ev.streams[0];   // 显示远端画面
});

// 监听连接状态
pc.addEventListener('connectionstatechange', () => {
    console.log('连接状态:', pc.connectionState);
    if (pc.connectionState === 'connected')
        console.log('P2P 已建立');
});

// 用数据通道传任意数据
const dc = pc.createDataChannel('chat');
dc.onmessage = (e) => console.log('收到:', e.data);`,
  },
  {
    id: 'webrtc-vs-ws',
    title: '33. WebRTC vs WebSocket：怎么选',
    category: 'WebRTC 入门',
    version: 'WebRTC 1.0',
    level: '入门',
    lang: 'js',
    summary: '从传输层、延迟、媒体能力三条主线对比 WebRTC 与 WebSocket，做出合理选型。',
    detail: [
      '传输层：WebSocket 基于 TCP、有序可靠，遇拥塞会排队重传；WebRTC 基于 UDP，容忍丢包、重视实时性。',
      '延迟：WebSocket 一轮握手后每消息走 TCP 可靠传输，延迟相对高且波动大；WebRTC 端到端毫秒级。',
      '媒体管线：WebRTC 自带编码解码、回声消除、抖动缓冲、自适应码率、丢包重传；WebSocket 只给你一条裸消息通道。',
      '音视频能力：WebSocket 不提供采集、编码、同步；要在浏览器里通话/直播就得自建媒体管线，基本等于重造 WebRTC。',
      '选型：需要实时音频/视频、或对延迟高度敏感的交互 → WebRTC；只需要文本/JSON/二进制消息推送 → WebSocket。',
      '互补使用：很多产品同时用两者——WebSocket 跑信令与业务消息、WebRTC 跑媒体与低频大数据包。',
    ],
    notes: [
      '准入门槛不同：WebRTC 信令、穿透、TURN 都要自己搭，比拉起一个 WebSocket 复杂得多。',
      '只有两端都在公网或能打洞时才真正 P2P；真实公网环境常常需要 TURN 中继。',
    ],
    example: `// WebSocket：业务消息
const ws = new WebSocket('wss://api.example.com/msg');
ws.send(JSON.stringify({ type: 'ping', at: Date.now() }));

// WebRTC：音视频 + 大数据包
const pc = new RTCPeerConnection();
const dc  = pc.createDataChannel('file');
const gum = await navigator.mediaDevices.getUserMedia({ video: true });

// 建议组合：
//   消息/信令   -> WebSocket
//   音视频媒体  -> WebRTC (SRTP)
//   大数据包   -> RTCDataChannel (SCTP/DTLS)`,
  },
  {
    id: 'webrtc-signaling',
    title: '34. 信令与 SDP 协商：offer / answer',
    category: 'WebRTC 原理',
    version: 'WebRTC 1.0',
    level: '进阶',
    lang: 'js',
    summary: '理解 WebRTC 不负责的信令环节：双方如何交换 SDP 与 ICE 候选，完成媒体协商。',
    detail: [
      '信令是连接前的"自我介绍"过程：让双方互相知道对方支持的媒体类型、编解码器与网络候选，WebRTC 协议本身不定义信令。',
      '流程：A createOffer() → setLocalDescription → 把 SDP 用 WebSocket 发给 B → B setRemoteDescription → createAnswer() 回传。',
      'SDP 是一条文本描述：含 m= 媒体行（音/视/数据）、codec 列表（H264/VP8/VP9/Opus）、格式参数与地址候选。',
      'ICE 候选（candidate）也是信令内容：每发现一个地址就 onicecandidate 抛一次，用 trickle ICE 边发边建链。',
      '协商失败要多看 SDP：最常见的是编解码器不匹配、m= 行为被拒绝、ICE ufrag/pwd 不一致。',
      '工程上可直接用现成库：PeerJS 封装信令、LiveKit/声网/腾讯 TRTC 提供托管服务。',
    ],
    notes: [
      '信令通道的可靠性直接影响建链成败，生产环境务必用带 ACK/重发的通道（WebSocket 天然满足）。',
      'SDP 里 private IP 候选（host 类型）也照发，局域网内建链就靠它。',
    ],
    example: `// 假设已有信令通道 ws，双方通过它交换消息
const ws = new WebSocket('wss://signal.example.com');

wake = msg => JSON.parse(msg.data);
let pendingCandidates = [];

// 发起方
async function call() {
    const pc = new RTCPeerConnection(iceConfig);
    // 本地媒体入轨 ...

    pc.onicecandidate = (e) => e.candidate &&
        ws.send(JSON.stringify({ type: 'candidate', data: e.candidate }));

    ws.onmessage = (ev) => {
        const m = wake(ev);
        if (m.type === 'answer') {
            pc.setRemoteDescription(m.data);
            // 补充之前已收集完但早到的候选
            pendingCandidates.forEach(c => pc.addIceCandidate(c));
            pendingCandidates = [];
        } else if (m.type === 'candidate') {
            pc.addIceCandidate(m.data).catch(console.error);
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', data: offer }));
}
// 对端收到 offer 后 createAnswer 回传即可`,
  },
  {
    id: 'webrtc-ice',
    title: '35. NAT 穿透：ICE / STUN / TURN',
    category: 'WebRTC 原理',
    version: 'STUN rfc5389',
    level: '进阶',
    lang: 'js',
    summary: '拆解建链最难的一环：ICE 框架如何用 STUN 打洞、用 TURN 兜底，让公网两边的浏览器连起来。',
    detail: [
      '大多数设备在 NAT 后面，没有公网 IP；WebRTC 要用 ICE 框架在这些受限网络间找到可达路径。',
      'STUN（Session Traversal Utilities for NAT）：问外网"我的公网地址是什么"，拿到端口映射做 UDP 打洞。',
      'TURN（Traversal Using Relays around NAT）：打洞不成功时作为中继转发媒体，保底但不省服务器带宽。',
      '候选类型三档：host（内网直连）、srflx（经 STUN 反射的公网地址）、relay（经 TURN 中继）。',
      'P2P 并不只有一条链路：ICE 会把可用的候选"user 对"按优先级排列，逐一尝试直到连通。',
      '线上现象分析：仅 host 在跨网时必然失败；只有 srflx 且对端也 NAT 时往往可通；对称 NAT 场景常退化为 relay。',
    ],
    notes: [
      '公共 STUN（如 stun.l.google.com）只适合开发调试，生产要自建 TURN 并开启长期凭证鉴权。',
      '对称 NAT（运营商级大 NAT 常见）无法靠 STUN 打洞，只能走 TURN；建立前就要为此预留带宽。',
    ],
    example: `// iceServers：同时配置 STUN 与 TURN
const iceConfig = {
    iceServers: [
        { urls: 'stun:stun.example.com:3478' },
        {
            urls: 'turn:turn.example.com:3478?transport=udp',
            // 生产建议长期凭证（TURN REST API）
            username: 'user',
            credential: 'pass'
        }
    ]
};

const pc = new RTCPeerConnection(iceConfig);
pc.addEventListener('icegatheringstatechange', () => {
    // 收集完成可看全套候选
    if (pc.iceGatheringState === 'complete')
        console.log(pc.localDescription.sdp);
});

// 候选类型忠告：
//  host   -> 局域网内可直接连
//  srflx -> NAT 后的公网地址（多数场景可连）
//  relay -> TURN 中继（唯一保底出路）`,
  },
  {
    id: 'webrtc-gum',
    title: '36. 媒体采集：getUserMedia 与控制',
    category: 'WebRTC 原理',
    version: 'WebRTC 1.0',
    level: '进阶',
    lang: 'js',
    summary: '掌握摄像头/麦克风采集、约束设置、设备枚举与轨道的启停控制。',
    detail: [
      'navigator.mediaDevices.getUserMedia(constraints) 返回 Promise<MediaStream>，请求浏览器授权硬件。',
      '约束可指定分辨率、帧率与摄像头方向：{ video: { width: 1280, height: 720, frameRate: 30 } }。',
      'enumerateDevices() 可枚举麦克风/摄像头，配合 deviceId 切换到指定设备。',
      '运行中动态改参数：applyConstraints() 可改分辨率/码率；音频用 audio: { echoCancellation: true } 消回声。',
      '把流上屏：video.srcObject = stream；stream.play()。',
      '启停轨道：track.enabled = false 静音/暂停画面；track.stop() 真正释放硬件。',
    ],
    notes: [
      '必须在安全上下文（HTTPS 或 localhost）下调用，否则 getUserMedia 直接 rejected。',
      '同一硬件被多个页面占用时后到的一方可能拿不到轨道，先用 enumerateDevices 做友好降级。',
    ],
    example: `// 采集 720p 视频 + 麦克风
const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, frameRate: 30, facingMode: 'user' },
    audio: { echoCancellation: true, noiseSuppression: true }
});
localVideo.srcObject = stream;

// 枚举设备并按需切换
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
console.log(cameras.map(c => c.label));

// 动态切换摄像头
await localVideo.srcObject.getVideoTracks()[0]
    .applyConstraints({ advanced: [{ deviceId: { exact: cameras[1].deviceId } }] });

// 静音 / 真正释放
stream.getAudioTracks()[0].enabled = false;   // 静音
stream.getTracks().forEach(t => t.stop());    // 释放硬件`,
  },
  {
    id: 'webrtc-peerconn',
    title: '37. RTCPeerConnection：建立 P2P 媒体链路',
    category: 'WebRTC 原理',
    version: 'WebRTC 1.0',
    level: '进阶',
    lang: 'js',
    summary: '用 RTCPeerConnection 完成一次完整的点对点媒体连接：协商、候选、状态机与远端展示。',
    detail: [
      'RTCPeerConnection 是媒体通信的枢纽：内部自动完成 ICE、DTLS、SRTP，应用层只需管好协商与轨道。',
      '协商入口有两条路：手动 createOffer/setLocalDescription 流程，或监听 negotiationneeded 再统一处理。',
      'icecandidate 事件逐个吐出候选；候选必须在远端 setRemoteDescription 后 addIceCandidate 才能消化。',
      'track 事件携带远端 MediaStream，把 srcObject 赋给 <video> 即出画；不含音轨时只显示 video 元素。',
      '连接状态连接状态机：new → checking → connected/failed/disconnected/closed，据此做 UI 与重连策略。',
      '安全收尾：连接结束后要 close()，并 stop 所有本地轨道释放摄像头麦克风。',
    ],
    notes: [
      '等了很久还停在 checking，绝大多数是 ICE 没通（候选不全 / 缺 TURN），先查候选类型再查媒体。',
      '重协商（加轨道/改码率）要再跑一轮 offer/answer，别改本地后再现旧答。',
    ],
    example: `const pc = new RTCPeerConnection(iceConfig);

// 本地音视频入轨
localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

// 收到远端媒体
pc.ontrack = (ev) => {
    remoteVideo.srcObject = ev.streams[0];
};

// 候选出口 → 交给信令发给对端
pc.onicecandidate = (e) => {
    if (e.candidate) sendToPeer({ type: 'candidate', data: e.candidate });
};

// 状态可视化
pc.onconnectionstatechange = () => {
    console.log(pc.connectionState);   // connected / failed ...
};

// 发起协商
async function start() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendToPeer({ type: 'offer', data: pc.localDescription });
}

// 对端回来 answer / candidate 后：
await pc.setRemoteDescription(answer);
await pc.addIceCandidate(candidate);`,
  },
  {
    id: 'webrtc-datachannel',
    title: '38. RTCDataChannel：任意数据的 P2P 通道',
    category: 'WebRTC 原理',
    version: 'SCTP rfc4960',
    level: '进阶',
    lang: 'js',
    summary: '用 RTCDataChannel 在端到端链路上传输任意二进制数据：可靠/无序配置与典型应用。',
    detail: [
      'RTCDataChannel 复用已建好的 P2P 连接（DTLS 加密的 SCTP），不经过应用服务器，数据端到端直传。',
      '一个 connection 可建多条通道，分别带不同属性；API 与 WebSocket 高度相似：onopen/onmessage/send/close。',
      '可靠性与顺序可配：{ ordered: false, maxRetransmits: 0 } 适合可丢帧的游戏操作；默认可靠有序适合文件传输。',
      'type 区分 str/byte：send() 的字符串走 UTF-8，ArrayBuffer/Blob 走原始字节，onmessage 自动还原。',
      '典型应用：P2P 文件分享、实时协同白板、低延迟游戏状态同步、点对点聊天的补充通道。',
      '常用安全模型：data channel 必须在 DTLS 完成后来回数据，天然加密，无需额外处理。',
    ],
    notes: [
      'channel 消息不是即时达：UDP 底层 + 重传策略意味着延迟波动，任务关键型数据要做应用层确认。',
      '通道在连接 failed 后失去意义，重连需重新建 channel 并重协商。',
    ],
    example: `const pc = new RTCPeerConnection(iceConfig);
const dc = pc.createDataChannel('file-share');
    // 对端: pc.ondatachannel = (e) => dc = e.channel;

dc.binaryType = 'arraybuffer';

dc.onopen = () => {
    console.log('通道就绪');
    dc.send('你好');                       // 文本
    dc.send(new Uint8Array([1, 2, 3]).buffer); // 二进制
};

dc.onmessage = (e) => {
    if (typeof e.data === 'string')
        console.log('文本:', e.data);
    else
        console.log('二进制:', new Uint8Array(e.data));
};

// 可配置低延迟模式：无序、最多重发 0 次
const fast = pc.createDataChannel('input', {
    ordered: false, maxRetransmits: 0
});`,
  },
  {
    id: 'webrtc-call',
    title: '39. 实战：一分钟搭建可跑的视频通话',
    category: 'WebRTC 实战',
    version: 'WebRTC 1.0',
    level: '实战',
    lang: 'js',
    summary: '把前面所有零件拼成最小可用视频通话：采集、信令、协商、建链、挂断一应俱全。',
    detail: [
      '骨架：本地 getUserMedia + 一条 WebSocket 信令 + RTCPeerConnection 协商 + 两路 <video> 显示。',
      '信令消息约定四种：offer、answer、candidate、hangup，全部 JSON，服务端只做转发（角色无关）。',
      '要点：先 setRemoteDescription 再 addIceCandidate；候选后可缓冲在 pending 里等待阶段就绪。',
      '挂断流程：关闭 data channel → pc.close() → 停本地轨道；对端靠 connectionstatechange 感知。',
      '容器环境本地测试：直接 localhost 打开即可；跨设备需 https + 同一信令服务器。',
      '上线前必查：摄像头权限、TURN 兜底、状态机 UI、断线自动重连。',
    ],
    notes: [
      '信令服务器可用现成的 Socket.IO / ws 转发，甚至浏览器 BroadcastChannel（同页）演示。',
      '本例未包含 echo 消除与带宽控制细节，生产要多议程调节与监控指标。',
    ],
    example: `// 假设已有 ws 信令与页面 video 元素
let pc = new RTCPeerConnection(iceConfig);
let localStream;

// 1) 采集
async function startLocal() {
    localStream = await navigator.mediaDevices
        .getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
}

// 2) 发起通话
async function call() {
    await startLocal();
    pc.ontrack = (e) => remoteVideo.srcObject = e.streams[0];
    pc.onicecandidate = (e) => e.candidate &&
        ws.send(JSON.stringify({ t: 'candidate', d: e.candidate }));
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ t: 'offer', d: pc.localDescription }));
}

// 3) 收到远端消息
ws.onmessage = async (ev) => {
    const m = JSON.parse(ev.data);
    if (m.t === 'offer') {
        await startLocal();
        pc.ontrack = (e) => remoteVideo.srcObject = e.streams[0];
        pc.onicecandidate = (e) => e.candidate &&
            ws.send(JSON.stringify({ t: 'candidate', d: e.candidate }));
        await pc.setRemoteDescription(m.d);
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        ws.send(JSON.stringify({ t: 'answer', d: pc.localDescription }));
    } else if (m.t === 'answer') {
        await pc.setRemoteDescription(m.d);
    } else if (m.t === 'candidate') {
        await pc.addIceCandidate(m.d).catch(() => {});
    } else if (m.t === 'hangup') {
        hangup();
    }
};

// 4) 挂断
function hangup() {
    pc.close();
    localStream?.getTracks().forEach(t => t.stop());
    remoteVideo.srcObject = null;
}`,
  },
  {
    id: 'webrtc-scale',
    title: '40. 多人会议与性能优化：SFU / MCU',
    category: 'WebRTC 实战',
    version: 'WebRTC 1.0',
    level: '实战',
    lang: 'js',
    summary: '从 P2P 一对一到多人会议：全互联(Mesh)的瓶颈、SFU 转发架构与端侧性能优化清单。',
    detail: [
      '一对一用纯 P2P 没问题；N 人全互联（Mesh）需要 N(N-1)/2 条链路，5 人以上上行带宽与 CPU 直接爆表。',
      'MCU（合成）：所有端都发到中心，中心合流成一路再分发；带宽省、延迟高、服务端重，适合小规模。',
      'SFU（选择性转发）：每个端只发一路上行，中心选择性转发给其他人；是 Mediasoup、LiveKit、Janus、声网的主流架构。',
      '端侧优化：Simulcast 分层编码（高/中/低三路）让弱网自动降级、SVC 让服务端按需裁剪码率。',
      '可靠性的三件套：NACK 丢包重传、PLI 请求关键帧、拥塞控制（GCC）动态调速。',
      '监控指标：丢包率、RTT、Jitter、发送/接收码率，结合 onstats 的 RTCStatsReport 精细调优。',
    ],
    notes: [
      'CPU 密集转码在 SFU 中尽量不做（转不了就转发原包），需要合流/录屏再上 MCU。',
      '服务端要管理每路带宽预算，防止一个弱网成员拖住全局质量。',
    ],
    example: `// 统计监控：用 getStats 拉取实时指标
setInterval(async () => {
    const stats = await pc.getStats();
    stats.forEach((r) => {
        if (r.type === 'inbound-rtp' && r.kind === 'video') {
            console.log({
                codec: r.codecId,
                packetsLost: r.packetsLost,     // 丢包
                jitter: r.jitter,               // 抖动
                bitrate: r.bitrate,             // 实际码率
            });
        }
        if (r.type === 'candidate-pair' && r.state === 'succeeded')
            console.log('当前路径:', r.nominated && r.localCandidate?.type,
                        r.remoteCandidate?.type);   // host/srflx/relay
    });
}, 5000);

// 弱网降级策略（示意）：
//   Simulcast 三路编码 + 对端按接收情况选层，
//   packetsLost 高时切低层、恢复后升层。`,
  },
];