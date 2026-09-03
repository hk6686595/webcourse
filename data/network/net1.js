// 网络编程 1–5：协议基础
const net1 = {
  id: 'net-layers',
  title: '1. 网络分层与通信模型',
  category: '基础',
  version: '通用',
  level: '入门',
  summary: '理解 OSI 七层与 TCP/IP 四层模型，掌握封装/解封装、端口与套接字基本概念。',
  detail: [
    '网络把复杂通信拆成多层，每层只关心自己的职责并由相邻层协作。两大模型：OSI 七层（理论上）与 TCP/IP 四层（实际使用）。',
    'TCP/IP 四层：应用层(HTTP/DNS/SMTP) -> 传输层(TCP/UDP, 端口) -> 网络层(IP, 寻址路由) -> 网络接口层(以太网/ARP)。',
    '封装：发送方逐层加头(header)，如应用数据 -> 加 TCP 头(源/目的端口) -> 加 IP 头(源/目的 IP) -> 加帧头(MAC)。',
    '解封装：接收方逐层去头还原数据；每层的"地址"不同（端口/IP/MAC）。',
    '端口：16 位，标识主机上的进程。常见默认端口 HTTP 80、HTTPS 443、DNS 53、SSH 22、MySQL 3306。',
    'Socket 是"IP + 端口"的组合，是应用程序面向网络通信的编程接口。',
  ],
  notes: [
    '四层模型更贴近现实；OSI 七层用于学习分层思想（物理/数据链路/网络/传输/会话/表示/应用）。',
    '抓包看封装：Wireshark 里一个数据帧内含以太网头 -> IP 头 -> TCP 头 -> 应用数据。',
  ],
  example:
    '# 查看本机网络接口与 IP\n' +
    'ip addr                       # Linux\n' +
    'ifconfig                      # 传统命令\n' +
    'ipconfig /all                 # Windows\n\n' +
    '# 查看监听/建立的端口\n' +
    'ss -tulnp                     # Linux 查看监听与进程\n' +
    'netstat -an                   # 各平台通用\n\n' +
    '# 常见端口(可查 /etc/services)\n' +
    'grep -E "https|ssh|mysql" /etc/services | head',
  example2:
    '# 查看路由表(网络层寻路)\n' +
    'ip route                       # Linux\n' +
    'route -n\n' +
    'netstat -rn                  # Windows\n\n' +
    '# 路由跟踪: 数据包经过的每一跳\n' +
    'traceroute baidu.com          # Linux\n' +
    'tracert baidu.com            # Windows\n' +
    '# 输出每跳 IP 与延时(第2/3列是RTT)',
  example3:
    '# 抓包观察封装(MITM 在自建/授权环境演示用)\n' +
    'sudo tcpdump -i any -c 5 icmp\n' +
    'ping -c 1 baidu.com &\n' +
    '# tcpdump -i any port 53 -n    # DNS 查询包\n' +
    '# tcpdump -i any tcp port 80 -n # HTTP TCP 三次握手\n\n' +
    '# Wireshark 图形化: 选接口 -> 开始\n' +
    '# 输入过滤器:  tcp.port == 443\n' +
    '#              ip.addr == 1.2.3.4\n' +
    '# 双击某帧可展开每一层头(封装结构一目了然)',
};

const net2 = {
  id: 'net-ethernet',
  title: '2. 数据链路层：以太网与 ARP',
  category: '基础',
  version: '电气/以太网',
  level: '入门',
  summary: 'MAC 地址、以太网帧结构、交换机工作方式与 ARP 地址解析协议。',
  detail: [
    '数据链路层在局域网内负责相邻设备之间传帧，核心是 MAC(物理)地址与帧格式。',
    '以太网帧结构：目的 MAC(6B) + 源 MAC(6B) + 类型(2B) + 数据(46-1500B) + 校验(4B)。',
    'MAC 地址 48 位，出厂烧录，形如 aa:bb:cc:dd:ee:ff；是局域网内直接通信的寻址依据。',
    '交换机：学习 MAC 地址表（源 MAC 与端口的映射），按目的 MAC 转发；广播帧(FF:FF:FF:FF:FF:FF)发往所有端口。',
    'ARP 协议解决"知道 IP 找 MAC"：广播"谁是 192.168.1.1 请回答"，目标单播回复自己的 MAC，主机再建立 ARP 缓存。',
    '在网络层之上用 IP 寻址跨网段靠路由，链路层只在下一跳之间用 MAC 传。',
  ],
  notes: [
    'ARP 缓存查看: ip neigh 或 arp -a。',
    '以太网 MTU 默认 1500，决定 IP 分片边界。',
  ],
  example:
    '# 查看本机 MAC 与 ARP 表\n' +
    'ip link                       # 各接口 MAC(link/ether)\n' +
    'ip neigh                      # 邻居 MAC 缓存\n' +
    'arp -a\n\n' +
    '# 查看交换机 MAC 地址表(Cisco 简例)\n' +
    '# Switch# show mac address-table\n' +
    '# 端口 MAC 地址\n' +
    '# Fa0/1  aa:bb:cc:dd:ee:01',
  example2:
    '# 模拟 ARP 流程(抓包验证)\n' +
    'sudo tcpdump -i any arp -n\n' +
    'ping -c 1 192.168.1.1 &\n' +
    '# 输出:\n' +
    '# ARP, Request who-has 192.168.1.1 tell 192.168.1.100\n' +
    '# ARP, Reply 192.168.1.1 is-at aa:bb:cc:dd:ee:ff\n\n' +
    '# 手工请求某邻居\n' +
    'ip neigh  # 查看; 无则 ping 一下触发 ARP',
  example3:
    '# 网卡 MAC 与速率\n' +
    'ethtool eth0                  # 查看链路速率/双工\n' +
    'cat /proc/net/dev             # 收发字节/错误统计\n' +
    '# 查看网卡当前工作速率\n' +
    'ip -s link\n\n' +
    '# 交换机基础管理(Wireshark/模拟器演示)\n' +
    '# 学习: 收到帧记下 源MAC->进口 方向\n' +
    '# 转发: 查目的MAC表决定出口;未知道则泛洪\n' +
    '# 广播: 目的为 FF:FF:FF:FF:FF:FF 则泛洪',
};

const net3 = {
  id: 'net-ip',
  title: '3. 网络层：IP 地址与寻址',
  category: '基础',
  version: 'IPv4/IPv6',
  level: '入门',
  summary: 'IPv4/IPv6 地址结构、子网掩码与 CIDR、公网/私网、NAT 与路由表。',
  detail: [
    'IP 地址是网络层的逻辑地址，跨网段寻址靠它。IPv4 32 位(4 组十进制)，IPv6 128 位(8 组十六进制)。',
    'IPv4 私有地址：10.0.0.0/8、172.16.0.0/12、192.168.0.0/16；回环 127.0.0.1；保留 0.0.0.0。',
    '子网掩码/前缀：192.168.1.0/24 表示前 24 位网络号，后 8 位主机号；可容纳 254 台主机（减网络与广播）。',
    'CIDR 记法是"IP/前缀长度"，路由器用它匹配路由表决定下一跳。',
    'NAT 让私网主机通过一个公网地址上网：路由器在出口改写源地址并在返回时还原(映射表)。',
    'IPv6：全球单播(2000::/3)、回环 ::1、链路本地 fe80::/10；解决了地址耗尽，无 NAT 也可直接公网访问。',
  ],
  notes: [
    '子网计算：主机数 = 2^(32-前缀) - 2；广播地址 = 主机位全1。',
    '查询本机公网 IP: curl ifconfig.me；IPv6 用 ip -6 addr。',
  ],
  example:
    '# 查看本机地址与掩码\n' +
    'ip addr\n' +
    'ip -4 addr show eth0\n' +
    'ip -6 addr show\n\n' +
    '# 计算子网(用 ipcalc 工具)\n' +
    '# 安装: apt install ipcalc\n' +
    'ipcalc 192.168.1.10/24\n' +
    '# 输出: Network 192.168.1.0, HostMin .1, HostMax .254, Broadcast .255',
  example2:
    '# CIDR 到子网的一些例子\n' +
    '#  /24 -> 掩码 255.255.255.0  -> 254 主机\n' +
    '#  /25 -> 255.255.255.128  -> 126 主机\n' +
    '#  /26 -> 255.255.255.192  -> 62 主机\n' +
    '#  /30 -> 255.255.255.252  -> 2 主机(点对点)\n' +
    'ipcalc 10.10.0.0/16\n' +
    '#  地址空间: 10.10.0.0 - 10.10.255.255',
  example3:
    '# 查看路由表\n' +
    'ip route\n' +
    '#   default via 192.168.1.1 dev eth0   (默认网关)\n' +
    '#   192.168.1.0/24 dev eth0 proto kernel\n\n' +
    '# 本机公网地址\n' +
    'curl ifconfig.me\n' +
    'curl -6 ifconfig.me            # 若有 IPv6\n\n' +
    '# IPv6 连通性\n' +
    'ping6 -c 3 google.com\n' +
    'curl -g -6 http://[::1]:8080   # 访问 IPv6 回环',
};

const net4 = {
  id: 'net-tcp',
  title: '4. TCP 传输控制协议详解',
  category: '基础',
  version: 'RFC 9293',
  level: '入门',
  summary: '面向连接、可靠传输：三次握手、四次挥手、状态机、确认与重传、流量与拥塞控制。',
  detail: [
    'TCP 提供可靠的字节流服务：面向连接、有确认、可重传、保证有序不丢失(尽力而为的可靠性)。',
    '三次握手：SYN -> SYN+ACK -> ACK，建立双方收发能力与初始序号，是双向确认。',
    '可靠机制：每个字节有序号，接收方回 ACK 确认；超时未 ACK 则重传；用校验和检测损坏。',
    '流量控制：接收方通告"窗口"(可以收多少字节)，发送方据此限速避免淹没接收方。',
    '拥塞控制：发送方自己感知网络拥塞(cwnd)，用慢启动/拥塞避免/快重传快恢复等算法调节发送速率。',
    '四次挥手：FIN -> ACK -> FIN -> ACK（因为双向独立关闭）；TIME_WAIT 状态保留足够时长让迟到的包过期。',
    '状态机：LISTEN -> SYN_SENT/ESTABLISHED ... CLOSE_WAIT/TIME_WAIT 等，用 netstat/ss 可观察。',
  ],
  notes: [
    '握手之所以"三次"是因为要双方都能发收并协商序号，两次不够确认对端的能力。',
    'TIME_WAIT 约 2*MSL(默认 60s 量级)，大量短连接会堆积，可用 ss -s 观察。',
  ],
  example:
    '# 观察 TCP 状态\n' +
    'ss -tunap\n' +
    '#   LISTEN   (服务端等待连接)\n' +
    '#   ESTAB    (已建立)\n' +
    '#   TIME_WAIT(主动关闭方等待)\n\n' +
    '# 查看连接统计\n' +
    'ss -s\n' +
    '# 端口连接数排名\n' +
    'ss -tan | awk "{print \$4}" | sort | uniq -c | sort -rn | head',
  example2:
    '# 抓包看三次握手与四挥手\n' +
    'sudo tcpdump -i any tcp port 80 -nn -c 20 &\n' +
    'curl -so /dev/null http://example.com\n' +
    'sleep 1\n' +
    '# 输出可见:\n' +
    '#  1 SYN           客户端 -> 服务端\n' +
    '#  2 SYN,ACK       服务端 -> 客户端\n' +
    '#  3 ACK           客户端 -> 服务端  (建立)\n' +
    '#  ... 数据交换 ...\n' +
    '#  最后 FIN/ACK    两次往返(4挥手)',
  example3:
    '# 用 Python 端到端验证连接状态\n' +
    'python3 - <<"PY"\n' +
    'import socket\n' +
    's = socket.socket()\n' +
    's.settimeout(3)\n' +
    'try:\n' +
    '    s.connect(("example.com", 80))\n' +
    '    print("已建立连接:", s.getpeername())\n' +
    '    s.send(b"HEAD / HTTP/1.0\\r\\n\\r\\n")\n' +
    '    print(s.recv(128).decode())\n' +
    'except Exception as e:\n' +
    '    print("失败:", e)\n' +
    'finally:\n' +
    '    s.close()\n' +
    'PY',
};

const net5 = {
  id: 'net-udp',
  title: '5. UDP 用户数据报协议',
  category: '基础',
  version: 'RFC 768',
  level: '入门',
  summary: '无连接、不可靠但低延迟：报文结构、与 TCP 对比、典型场景与广播多播。',
  detail: [
    'UDP 是无连接、无面向无状态的数据报协议：不发确认、不重传、不保证顺序，但开销小、延迟低。',
    '报文头只有 4 个字段（源端口/目的端口/长度/校验和）共 8 字节，对比 TCP 头至少 20 字节。',
    '适用：实时性优先的场景——DNS、DHCP、NTP、RTP/视频通话、在线游戏、日志转发(Syslog)。',
    '无需三次握手就地发：适合"一问一答"的查询与实时流，代价是丢包由应用层自行处理。',
    '广播(255.255.255.255 或子网广播)与多播(224.0.0.0/4)通常用 UDP 实现，如 DHCP/组播视频。',
    '选型：要求可靠有序交互用 TCP；追求低延迟、可容忍少量丢包用 UDP（如游戏每帧状态、语音）。',
  ],
  notes: [
    'UDP "不可靠"是传输层语义，应用层可自建可靠性(QUIC 就是基于 UDP 加了可靠+加密的现代协议)。',
    '接收 UDP 注意：单个数据报最大约 65507 字节(受 IP 限制)，应用需自行拼接大块数据。',
  ],
  example:
    '# UDP 服务器(行内命令快速验证)\n' +
    'nc -u -l 127.0.0.1 9999\n' +
    '# 另开终端\n' +
    'echo "hello udp" | nc -u 127.0.0.1 9999\n' +
    '# 服务器窗口会打印 hello udp(无连接的)',
  example2:
    '# DNS 查询本质是 UDP(端口53)\n' +
    'dig +short baidu.com\n' +
    '# 抓包观察\n' +
    'sudo tcpdump -i any port 53 -nn -x &\n' +
    'dig +short baidu.com\n' +
    'sleep 1\n' +
    '# 可见 UDP 请求/应答, 无三次握手, 一问一答\n\n' +
    '# 若响应太大 >512B 会改用 TCP(偶尔看到)\n' +
    'dig +tcp +short baidu.com',
  example3:
    '#!/usr/bin/env python3\n' +
    '# 极简 UDP 收发\n' +
    'import socket\n' +
    '# 接收端\n' +
    's = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    's.bind(("0.0.0.0", 9999))\n' +
    'data, addr = s.recvfrom(1024)\n' +
    'print("收到:", data, "来自", addr)\n' +
    's.sendto(b"pong", addr)\n' +
    '# 发送端\n' +
    'c = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n' +
    'c.sendto(b"ping", ("127.0.0.1", 9999))\n' +
    'print(c.recvfrom(1024))\n' +
    '# 无连接: 直接 sendto 无需 connect/accept',
};

if (typeof module !== 'undefined') module.exports = { net1, net2, net3, net4, net5 };