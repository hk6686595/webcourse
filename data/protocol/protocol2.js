// MQTT 协议详解 1–10：入门、机制、会话与实战
module.exports = [
  {
    id: 'mqtt-intro',
    title: '1. MQTT 是什么：物联网的轻量级消息协议',
    category: 'MQTT 入门',
    version: '3.1.1',
    level: '入门',
    lang: 'py',
    summary: '理解 MQTT 的定位、设计目标、工作模型，以及它为什么成为 IoT 消息协议的事实标准。',
    detail: [
      'MQTT（Message Queuing Telemetry Transport，消息队列遥测传输）是 1999 年为卫星链路设计的轻量级发布/订阅消息协议。',
      '设计目标：极小网络开销（报文头仅 2 字节起）、省电省带宽、在弱网/高延迟/不稳定环境中也能可靠工作。',
      '采用发布/订阅（Publish/Subscribe）模型，由中央代理 Broker 转发消息，发布者与订阅者完全解耦。',
      '适合场景：传感器数据上报、智能家居设备控制、车联网、可穿戴设备、边缘计算，以及任何需要低功耗长连接推送的软件。',
      '当前版本：MQTT 3.1.1 是最广泛部署的标准（OASIS）、MQTT 5.0 是新增大量特性的最新版。',
      '本质是基于 TCP 的二进制协议，端口默认 1883（明文）与 8883（TLS）。',
    ],
    notes: [
      'MQTT 不保证消息持久存储，Broker 默认是内存队列；需要落库能力要引入 EMQX 等商用扩展或自己实现。',
      '它面向"消息通知/命令下发"，不适合海量大数据体量文件传输（那种场景选 HTTP/COAP 更合适）。',
    ],
    example: `# 一个典型的物联网链路：
#   传感器(发布者) --> MQTT Broker --> 手机App/后台(订阅者)

# 发布者每秒上报一次温度到主题 device/room1/temp
mosquitto_pub -h broker.example.com -t device/room1/temp \\
              -m '{"temp":23.5,"unit":"C"}'

# 订阅者接收该主题的所有消息
mosquitto_sub -h broker.example.com -t 'device/+/temp'
# 输出: {"temp":23.5,"unit":"C"}`,
  },
  {
    id: 'mqtt-pubsub',
    title: '2. 发布 / 订阅模型与主题（Topic）',
    category: 'MQTT 入门',
    version: '3.1.1',
    level: '入门',
    lang: 'py',
    summary: '吃透 MQTT 的发布订阅模型、"主题 + 通配符"订阅规则，是设计消息流的基础。',
    detail: [
      '发布者把消息发布到某个主题，订阅者向 Broker 订阅自己关心的主题，两者互不感知对方存在。',
      '主题（Topic）是带层级的分隔符字符串，如 sensors/home/temp；层级用 / 分隔，不能包含通配符。',
      '单层通配符 +：匹配某一层，例如 sensors/+/temp 匹配 sensors/a/temp 但不匹配 sensors/a/b/temp。',
      '多层通配符 #：匹配剩余所有层级，只能放主题末尾，如 sensors/# 订阅所有 sensors 下的子主题。',
      '同一主题可被多个订阅者订阅，Broker 会向每个订阅者复制转发；同一设备也可订阅多个主题。',
      '$ 前缀的主题（如 $SYS）为系统保留主题，普通通配符 # 不会匹配到 $ 开头的主题。',
    ],
    notes: [
      '主题本身不定义消息格式（内容是 JSON、protobuf 还是文本由业务约定），建议项目里统一规定并写文档。',
      '通配订阅会导致消息被大量复制，注意订阅树组织以避免消息风暴。',
    ],
    example: `# 主题设计建议：按 设备/类型/动作 分层
#   device/<设备ID>/status
#   device/<设备ID>/telemetry
#   device/<设备ID>/command

# 订阅某一层所有设备的遥测
mosquitto_sub -t 'device/+/telemetry'

# 订阅某设备的全部消息
mosquitto_sub -t 'device/a1/#'   # 匹配 status、telemetry、command

# + 只占一层，不匹配多层嵌套`,
  },
  {
    id: 'mqtt-broker',
    title: '3. Broker 选型与搭建：EMQX / Mosquitto',
    category: 'MQTT 入门',
    version: '3.1.1',
    level: '入门',
    lang: 'py',
    summary: '认识 MQTT 的核心角色 Broker，并分别用 Mosquitto 与 EMQX 快速搭建本地/生产级消息中心。',
    detail: [
      'Broker 是所有消息的中转站：接收发布、匹配订阅、转发消息、维护会话与遗嘱，是整个系统的中枢。',
      'Mosquitto：Eclipse 出品，轻量、极省资源，适合嵌入式/开发/测试，也支持集群、ACL 与 TLS。',
      'EMQX：国产开源、生产级高可用 Broker，支持百万级并发、消息持久化、规则引擎与 MQTT 5.0。',
      'VerneMQ、HiveMQ、AWS IoT Core、Azure IoT Hub 也是常见选择，按规模与运维成本取舍。',
      '生产级选型关注点：并发连接数、QoS 2 支持、持久化、集群容错、认证鉴权（用户名/密码、JWT、ACL）。',
      '本地快速上手优先 Mosquitto（一条命令跑起来）；需要规则转发、可视化监控再上 EMQX。',
    ],
    notes: [
      '切勿在生产直接使用默认无鉴权配置，至少加用户名密码 + TLS + ACL。',
      'Broker 的可用性是单点，生产务必部署集群 + 持久化，否则设备全部失去通信。',
    ],
    example: `# ---- Mosquitto 快速搭建 ----
# Ubuntu
apt install -y mosquitto mosquitto-clients
# 默认监听 1883，配置文件 /etc/mosquitto/mosquitto.conf
systemctl start mosquitto

# 测试
mosquitto_pub -t test -m hi

# ---- EMQX（Docker 一条命令，Web 控制台 :18083）----
docker run -d --name emqx -p 1883:1883 -p 8883:8883 \\
           -p 18083:18083 emqx/emqx:5.8

# 打开 http://localhost:18083 管理台（admin/public）`,
  },
  {
    id: 'mqtt-connect',
    title: '4. 连接建立：CONNECT / CONNACK 与 Keep-Alive',
    category: 'MQTT 入门',
    version: '3.1.1',
    level: '进阶',
    lang: 'py',
    summary: '从报文层面理解客户端上线的第一步——CONNECT/CONNACK 握手，以及保活心跳机制。',
    detail: [
      '客户端上线必须发 CONNECT 报文，携带协议版本、ClientID、用户名/密码、Clean Session、KeepAlive 等参数。',
      '协议级规定：固定头第一个字节固定为 0x10（MQTT 3.1.1），随后是剩余长度与可变头。',
      'Broker 收到 CONNECT 后返回 CONNACK，其中的返回码（Return Code）0 表示连接成功，其他是拒绝原因。',
      'ClientID 用于标识会话：同一 ClientID 的新连接会顶掉旧连接（可被 Brocker 配置为禁止抢占）。',
      'KeepAlive 是保活心跳：要求客户端在指定秒数内至少发一个报文，超时 Broker 判定断线并清理。',
      'MQTT 5.0 中 Server Keep Alive 可以向下调整客户端的请求值，还支持 Reason Code 给出更细粒度的结果。',
    ],
    notes: [
      'TCP 层已断开但应用层还没感知时，KeepAlive + 遗嘱是兜底手段，是可靠性的第一道防线。',
      '客户端 ID 不要随机每次变：会丢失服务端会话，收不到离线期间的保留消息。',
    ],
    example: `# 用 mosquitto_pub -d 打印 DEBUG 能看到完整握手：
# CONNECT 报文（十六进制截取）
# 0x10 0x12 00 04 4D 51 54 54 04 02 ... 
#    |    |       \--- "MQTT"(协议名) ---- 版本 04(3.1.1)
#    报文类型   剩余长度         协议版本  标志

mosquitto_pub -d -h broker.example.com -p 1883 \\
              -i client-001 -t tmp -m hi
# CONNECT: proto=4(MQTT 3.1.1) keepalive=60
# CONNACK: return code=0 (成功)`,
  },
  {
    id: 'mqtt-qos',
    title: '5. 消息质量：QoS 0 / 1 / 2',
    category: 'MQTT 机制',
    version: '3.1.1',
    level: '进阶',
    lang: 'py',
    summary: '理解 MQTT 三种 QoS 级别的投递语义，以及 QoS 升级（如离线补发）和 Broker 桥接的注意事项。',
    detail: [
      'QoS 0：最多一次——只发不管达不达，效率最高，可能丢消息；适合高频环境监测等可容忍丢失的数据。',
      'QoS 1：至少一次——发送后等待 PUBACK 确认，没收到就重发；可能重复，但保证到达（一次或多次）。',
      'QoS 2：恰好一次——通过 PUBREC/PUBREL/PUBCOMP 四步两阶段确认（接收方去重 token），不丢不重但开销最大。',
      '投递语义作用于"发布者→Broker"与"Broker→订阅者"每一跳，两端可以分别指定不同 QoS（结果取两者中较弱）。',
      '离线补发：QoS 1/2 的持久会话订阅者离线期间，Broker 会缓存消息并在其重新上线后按订阅 QoS 补发。',
      '实际工程：命令/告警/交易类数据用 QoS 2 或轮询兜底，遥测类用 QoS 0/1 结合本地缓存。',
    ],
    notes: [
      'QoS 提高会放大 Broker 负载与带宽（尤其 QoS 2），非必要别全局用 QoS 2。',
      'Broker 桥接（如两个 EMQX 互联）时 QoS 处理复杂，同一条消息可能跨机房重复投递，接收端要去重。',
    ],
    example: `# 发布时用 -q 指定 QoS，订阅时也可指定
mosquitto_pub -t alarm/outage -q 2 -m 'grid down'   # 恰好一次
mosquitto_pub -t temp/room1   -q 1 -m '23.5c'      # 至少一次
mosquitto_pub -t temp/room2   -q 0 -m '24.1c'      # 最多一次

# QoS 1 时序：PUBLISH --> PUBACK（确认后发送方停止重试）
# QoS 2 时序：
#   PUBLISH --> PUBREC --> PUBREL --> PUBCOMP  (4 个报文)`,
  },
  {
    id: 'mqtt-retain',
    title: '6. 保留消息（Retained Message）',
    category: 'MQTT 机制',
    version: '3.1.1',
    level: '进阶',
    lang: 'py',
    summary: '利用保留消息让新订阅者一订阅就能立刻拿到主题的"最新状态"，并理解其清空与限制。',
    detail: [
      '发布时把 RETAIN 标志置 1，Broker 会为"该主题"保存这条消息作为最新状态（每个主题只保留一条）。',
      '新订阅者在订阅成功后，会立即收到该主题的保留消息——即使发布发生在它订阅之前。',
      '典型用途：设备掉线时最后上报的状态、房间温度最新值、传感器配置，让订阅方上线即得当前状态。',
      '清空保留消息：向该主题发布一条空负载（payload 长度为 0）且 RETAIN=1 的消息。',
      '保留消息与遗嘱、会话缓存组合使用是物联网"状态恢复"三件套。',
      '注意：保留消息会增大 Broker 存储负担，主题数量巨大时的保留需要做容量管理。',
    ],
    notes: [
      '保留消息只对"主题"级生效，通配符订阅会收到每个匹配主题各自的保留消息。',
      '保留消息的 QoS 由其发布时的 QoS 决定，Broker 配置里可限制每主题的保留大小。',
    ],
    example: `# 发布带保留标志的状态消息
mosquitto_pub -t device/a1/status -r -m 'online'

# 任何客户端此时订阅都能立刻收到 'online'（即使发布早已结束）
mosquitto_sub -t 'device/a1/status'
# online

# 清空保留消息：发空消息 + -r
mosquitto_pub -t device/a1/status -r -n

# 配合遗嘱：设备异常离线后订阅方收到遗嘱，再结合保留状态恢复现场`,
  },
  {
    id: 'mqtt-will',
    title: '7. 遗嘱消息（Last Will and Testament）',
    category: 'MQTT 机制',
    version: '3.1.1',
    level: '进阶',
    lang: 'py',
    summary: '用遗嘱消息让系统在设备异常离线时自动广播"下线"通知，是物联网告警的关键机制。',
    detail: [
      '遗嘱消息在客户端 CONNECT 时一并设置：遗嘱主题、遗嘱内容、遗嘱 QoS 与 Retain 标志。',
      '当客户端异常断开（网络中断、心跳超时、被 Broker 判定死亡）时，Broker 代为发布这条遗嘱。',
      '正常关闭（收到 DISCONNECT，或在 MQTT5 中正常解绑会话）不会触发遗嘱发布。',
      '遗嘱可带 Retain——让新订阅者一订阅就收到"这台设备已离线"的最后状态。',
      '与 KeepAlive 配合：Broker 超时未收到心跳 → 判定离线 → 发遗嘱，完成"无感知掉线"的兜底通知。',
      '常见应用：设备掉线告警、节点状态仲裁（配合 retained 覆盖在线/离线）、看门狗服务。',
    ],
    notes: [
      '遗嘱在"连接会话结束"时触发，不区分是网络抖动还是断电，触发条件不能代表业务原因。',
      '遗嘱发布完成后该遗嘱即失效；重连前需重新 CONNECT 携带新的遗嘱。',
    ],
    example: `# 客户端 a1 上线时声明遗嘱：异常离线后向 status 发 offline
mosquitto_pub -h broker --id a1 \\
              -t device/a1/status -r -m online \\
              -L ws ...  # 等价做法见下方 Python 示例

# ---- Python paho：设置遗嘱 ----
import paho.mqtt.client as mqtt

def on_offline():
    print("a1 异常下线，Broker 自动广播遗嘱")

client = mqtt.Client("a1")
client.will_set("device/a1/status", "offline", qos=1, retain=True)
client.connect("broker.example.com", 1883)
client.loop_forever()`,
  },
  {
    id: 'mqtt-session',
    title: '8. 会话、Clean Session 与离线消息',
    category: 'MQTT 机制',
    version: '3.1.1',
    level: '进阶',
    lang: 'py',
    summary: '理解"会话"与 Clean Session 语义，决定掉了线还能不能收到离线期间的消息。',
    detail: [
      '会话（Session）是 Broker 为每个 ClientID 维护的状态：订阅关系 + 待投递的 QoS 1/2 消息。',
      'Clean Session=1（MQTT5 中 Clean Start：会话起始）：每次连接都是全新会话，不留任何历史订阅与离线消息。',
      'Clean Session=0（持久会话）：会话跨连接存活，客户端离线期间 Broker 保留订阅和 QoS1/2 消息，上线后补发。',
      '重新上线恢复会话的前提：ClientID 与之前一致，且在同一 Broker。换个 ClientID 就视为新会话。',
      '会话有效期不是永久——Broker 会按配置清理长期不活跃的过期会话与积压消息。',
      '选择原则：状态变化需要确认的设备用持久会话；一次性任务、临时客户端直接用 Clean Session。',
    ],
    notes: [
      '离线积压消息是 QoS 1（PUBACK 制）所以可能重复，接收方要按消息 ID 或业务幂等键去重。',
      'web 端浏览器订阅建议 Clean Session=1，避免过期粘滞的订阅拖垮 Broker。',
    ],
    example: `# Python paho：持久会话 + 离线补发
import paho.mqtt.client as mqtt

client = mqtt.Client("door-lock-01")     # ClientID 固定
client.connect("broker.example.com", 1883)

# session 保持（默认 clean_session=False 即持久会话）
def on_connect(c, u, flags, rc):
    c.subscribe("device/door-lock-01/cmd", qos=1)

client.on_connect = on_connect
client.loop_forever()

# 设备离线期间，door/cmd 主题上 QoS1 的新消息会被积压，
# 重新上线后自动补发，保证"开锁指令"不丢失。`,
  },
  {
    id: 'mqtt-python',
    title: '9. 实战：paho-mqtt 端到端示例',
    category: 'MQTT 实战',
    version: '3.1.1',
    level: '实战',
    lang: 'py',
    summary: '用 paho-mqtt 完成一个可运行的发布/订阅闭环，涵盖回调、QoS、遗嘱与重连。',
    detail: [
      'paho-mqtt 是 Python 最流行的 MQTT 客户端，同步调用简单、回调节点清晰，也支持 asyncio 版本。',
      '核心点：连接（connect/connect_async）、回调（on_connect/on_message/on_disconnect/on_publish）。',
      '重连策略：on_disconnect 里调用 reconnect()（注意节流退避），或用连接 keepalive + 断线重连循环。',
      '订阅要放在 on_connect 回调里，避免连接建立前的空窗期漏订阅。',
      '发布 QoS=0 时 return mid 立即返回即可；QoS1/2 用 on_publish 回调确认完成。',
      '生产建议：进程内跑 loop_loop_start() 或放单独线程，别把业务阻塞进回调。',
    ],
    notes: [
      '回调抛异常会终止 loop，务必 try/except 包住业务逻辑。',
      '同一个 Broker 下重复连接同一 ClientID 会互相踢下线，分布式部署时 ClientID 要全局唯一。',
    ],
    example: `# pip install paho-mqtt
import time
import paho.mqtt.client as mqtt

BROKER = "broker.example.com"

def on_connect(client, userdata, flags, rc):
    print("connected", rc)
    client.subscribe("sensor/+/temp", qos=1)
    # 上线后发布一条存活状态（注册遗嘱见 will_set）

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")   # 收到温度

client = mqtt.Client(client_id="py-demo-01")
client.will_set("device/py-demo-01/status", "offline",
                qos=1, retain=True)
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, 1883, keepalive=60)
client.loop_start()

for i in range(5):
    client.publish("sensor/r1/temp", f"23.{i}", qos=1)  # 模拟上报
    time.sleep(1)

time.sleep(2)   # 等回调查接收
client.disconnect()`,
  },
  {
    id: 'mqtt-v5',
    title: '10. MQTT 5.0 新特性：比 3.1.1 强在哪',
    category: 'MQTT 实战',
    version: '5.0',
    level: '实战',
    lang: 'py',
    summary: '盘点 MQTT 5.0 的关键增强（会话过期、通配订阅、原因码、共享订阅等），指导升级决策。',
    detail: [
      '会话过期（Session Expiry）：会话过期时间可在 CONNECT/DISCONNECT 中单独指定，取代 Clean Session 一刀切。',
      '消息过期（Message Expiry）：消息可带过期时间，过期后 Broker 自动丢弃，解决积压消息"过期命令仍执行"的问题。',
      'Will Delay Interval：遗嘱延迟触发，给网络抖动留出重连窗口，避免误报离线。',
      '共享订阅 $share/{group}/topic：同一订阅组内的订阅轮询分发，天然支持消费者组水平扩展。',
      '订阅标识与主题别名（Topic Alias）：用短数字别名代替长主题字符串，大幅减小弱网带宽。',
      '更细的 Reason Code 与用户属性（User Properties）：错误原因清晰、元信息随消息传输，运维可观测性大增。',
    ],
    notes: [
      'MQTT 5.0 与 3.1.1 不兼容（报文结构有差异），Broker/客户端需同版本，升级要全链路一起考虑。',
      'EMQX 5.x、HiveMQ 4+、Mosquitto 2.x 都已支持 5.0；paho 需 v2 版本客户端。',
    ],
    example: `# paho 2.x 使用 MQTT5：会话过期 + 共享订阅（EMQX 等支持）
import paho.mqtt.client as mqtt

c = mqtt.Client(client_id="proc-01", protocol=mqtt.MQTTv5)
# 会话过期 24h：掉线后会话与订阅继续保留一天
c.connect("broker.example.com", 1883, keepalive=60,
          clean_start=True, properties=None)

# 订阅共享组：多个消费者轮询处理海量消息，天然负载均衡
# topic 写作 $share/jobs/device/+/telemetry
c.subscribe("$share/jobs/device/+/telemetry", qos=1)

# 更强的 Reason Code：on_connect 回调里的 reason_code 会给出
# 比如 'Not authorized' 等明确原因，便于排查鉴权问题。`,
  },
];