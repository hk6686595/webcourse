// Protobuf 协议详解 1–10：入门、语法、编码与集成
module.exports = [
  {
    id: 'protobuf-intro',
    title: '1. Protobuf 是什么：Google 的跨语言序列化协议',
    category: 'Protobuf 入门',
    version: 'proto3',
    level: '入门',
    lang: 'cpp',
    summary: '了解 Protocol Buffers 的定位、工作原理、与 JSON/XML 的本质区别及其适用场景。',
    detail: [
      'Protocol Buffers（简称 protobuf）是 Google 开源的、与语言无关、平台无关的二进制序列化协议，用于结构化数据的定义、编码与解码。',
      '核心思想：先用 .proto 文件（IDL）定义数据结构，再用 protoc 编译器生成 Go / Java / Python / C++ 等语言的读写代码，实现跨语言高效交换数据。',
      '相比 JSON/XML：编码后体积小 3~10 倍、序列化/反序列化快数倍，字段以编号指代而非字段名称，无需反复解析文本。',
      '典型场景：RPC（gRPC 默认基于 protobuf）、微服务内部通信、跨语言数据管道、IoT 设备上报、游戏同步协议。',
      '二进制格式天然向后兼容：新增/废弃字段不会破坏线上通信，适合长期演进的接口。',
    ],
    notes: [
      'protobuf 不保证字段顺序，编码结果不可直接读，调试时多用 protojson 工具转成 JSON 查看。',
      '同类方案还有 Avro、Thrift、FlatBuffers，各有权衡；protobuf 的生态（gRPC、云厂商、代码生成器）最成熟。',
    ],
    example: `syntax = "proto3";

// 定义一条订单消息
message Order {
  int64  id       = 1;
  string customer = 2;
  double amount   = 3;
  bool   paid     = 4;
}

// 字段编号 1~4 就是线上传输的"名字"`,
  },
  {
    id: 'protobuf-vs-json',
    title: '2. Protobuf vs JSON / XML：为什么要选二进制',
    category: 'Protobuf 入门',
    version: 'proto3',
    level: '入门',
    lang: 'cpp',
    summary: '从体积、性能、可读性、生态四条维度对比 JSON、XML 与 Protobuf，理解各自边界。',
    detail: [
      'JSON：文本格式，人类可读、调试方便、生态最广，是 REST API 与前后端数据交换的事实标准。',
      'XML：冗长的文本标记，配合 XSD 校验能力强，常用于配置文件与文档交换，但体积最大、解析最慢。',
      'Protobuf：二进制紧凑编码，传输时不用携带字段名（一个编号即可），同一条数据体积通常只有 JSON 的 1/4~1/10。',
      '性能：二进制解码按偏移直接取数，无需 JSON.parse 那样的文本扫描，CPU 开销显著更低。',
      '代价：二进制不可读、schema 变更要重编译、需要引入工具链；对人和工具不够友好。',
      '选型建议：对外公开 API 优先 JSON；内部高速链路、高频设备上报、移动端弱网场景选 Protobuf。',
    ],
    notes: [
      'JSON 也有 OpenAPI / JSON Schema 加持 schema，但体积与性能劣势是结构性的。',
      '浏览器端一般通过 gRPC-Web 网关访问 protobuf 服务，不直接发二进制。',
    ],
    example: `// JSON 一条用户记录（含字段名，约 100+ 字节）
{"id":42,"name":"zhang","email":"z@ex.com","vip":true}

// 同样的 protobuf message（.proto 定义）……
syntax = "proto3";
message User {
  int64  id    = 1;
  string name  = 2;
  string email = 3;
  bool   vip   = 4;
}

// 编码后约 20 字节：只传编号 + 值，不传字段名`,
  },
  {
    id: 'protobuf-install',
    title: '3. 环境搭建：安装 protoc 与生成各语言代码',
    category: 'Protobuf 入门',
    version: 'proto3',
    level: '入门',
    lang: 'py',
    summary: '安装 protoc 编译器与 protoc-gen-go / grpc_tools 插件，一张图看懂 .proto 到目标语言代码的流水线。',
    detail: [
      'protoc 是官方的 Protocol Buffer 编译器，负责解析 .proto 文件并调用针对各语言的代码生成插件。',
      'Go 插件：protoc-gen-go（生成 Go 结构体与编解码），以及 protoc-gen-go-grpc（生成 gRPC 服务桩）。',
      'Python 插件：grpcio-tools 自带的 grpc_tools.protoc，可同时生成 message 类与 gRPC client/server。',
      'Java / C++ 等自带于 protobuf 官方发行版（protoc 内置插件），无需单独安装。',
      '生成后的 Go 代码依赖 google.golang.org/protobuf 运行库，Python 依赖 protobuf 包。',
      '现代 Go 项目中建议开启 buf 或 protocompile 等新工具链，替代手工 protoc 命令。',
    ],
    notes: [
      'protoc 版本必须与运行库版本相互兼容，升级时注意 protoc-gen-go 与运行库一起升级。',
      '生成的文件不要手工修改：任何改动都会在下次生成时被覆盖，字段变更改 .proto 重新生成。',
    ],
    example: `# macOS（Homebrew）
brew install protobuf

# Ubuntu / Debian
apt install -y protobuf-compiler

protoc --version                # libprotoc 25.x

# ---- Go ----
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
protoc --go_out=. --go_opt=paths=source_relative user.proto
protoc --go-grpc_out=. --go-grpc_opt=paths=source_relative user.proto

# ---- Python ----
pip install protobuf grpcio grpcio-tools
python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. user.proto`,
  },
  {
    id: 'protobuf-syntax',
    title: '4. message 与标量类型：proto3 语法速览',
    category: 'Protobuf 语法',
    version: 'proto3',
    level: '入门',
    lang: 'cpp',
    summary: '掌握 .proto 文件的骨架：syntax 声明、message、标量类型、版本与注释。',
    detail: [
      '文件必须以 syntax = "proto3"（或 proto2）声明开启，proto3 是当前默认、推荐使用的版本。',
      'message 是最小编码单元，字段 = 类型 + 名字 + 编号，例如 int32 age = 1;。',
      '标量类型：int32/int64、uint32/uint64、sint32/sint64（负数友好）、bool、string、bytes、float/double、fixed32/64。',
      'string 必须是 UTF-8 编码；bytes 用于任意二进制；sint 相比 int 在负数上编码更紧凑（ZigZag）。',
      'proto3 中所有字段都有默认值：数值 0、字符串 ""、bool false，且消息字段默认不显式存在（有没设过需用 proto3 optional 或包装类型区分）。',
      '使用 protoc-gen-js / 各种开源插件时，字段名会转换为对应语言的驼峰命名。',
    ],
    notes: [
      'proto3 移除了 proto2 的 required 字段，所有字段都是任选的，不建议用它表达必填业务校验。',
      '不要用 int32 表示没必要负数的 ID，较小的整型不会节省编码体积，编码是按值的实际长度走的。',
    ],
    example: `syntax = "proto3";

message Person {
  int32   id     = 1;
  string  name   = 2;
  string  email  = 3;
  bytes   avatar = 4;      // 二进制头像
  float   score  = 5;      // 浮点
  bool    active = 6;
  uint64  ts     = 7;      // 时间戳（秒）
}

// 默认值：id=0 name="" active=false`,
  },
  {
    id: 'protobuf-rules',
    title: '5. 字段规则：optional / repeated / oneof / map / enum',
    category: 'Protobuf 语法',
    version: 'proto3',
    level: '进阶',
    lang: 'cpp',
    summary: '理解 proto3 的字段修饰与复合类型，搭建真实业务的 .proto 模型。',
    detail: [
      'repeated 定义列表/数组字段，等价于数组、切片或集合，兼有 List 语义。',
      'optional 恢复"字段是否显式设置"的判断能力（区分未设置与默认值），常用于布尔与数字的可选语义。',
      'oneof 用来表达"多选一"，同时只存在一个值（类似 tagged union），常用于消息类型或状态互斥的场景。',
      'map<key_type, value_type> 定义字典：key 只能是整型或 string，元素无序。',
      'enum 定义枚举，proto3 的枚举第一个成员必须是 0（用作默认值），只允许 int32 语义。',
      'proto2 的 required 已移除；proto3 里这些字段全部参与二进制编码，未设置的字段不占字节。',
    ],
    notes: [
      'oneof 内部不允许使用 repeated 或 map；设置 oneof 中任一字段会清空其它成员。',
      'map 的 key 与 value 都不可用 repeated，也不能是一方是另一方的 message 等复杂情况。',
    ],
    example: `syntax = "proto3";

message SearchRequest {
  string query = 1;
  int32  page  = 2;
  repeated string tags = 3;            // 列表

  enum Sort { SORT_UNSPECIFIED = 0; DATE = 1; SCORE = 2; }
  Sort sort = 4;

  map<string, string> params = 5;      // 字典

  oneof condition {
    bool include_deleted = 6;          // 三选一
    string owner = 7;
    int64  before_ts  = 8;
  }

  optional int32 limit = 9;            // 可显式区分空值
}`,
  },
  {
    id: 'protobuf-tagnum',
    title: '6. 字段编号与 Wire Format：底层到底怎么编',
    category: 'Protobuf 语法',
    version: 'proto3',
    level: '进阶',
    lang: 'cpp',
    summary: '理解 tag（字段编号 + wire type）、varint 与 ZigZag 编码，看懂 protobuf 二进制结构。',
    detail: [
      '每个字段的基础单位是 tag = 字段编号左移 3 位 | wire_type(0/1/2/5)，即每个字段至少占 1 个 varint 字节。',
      'wire_type 决定值的编码方式：0=varint，1=64bit，2=长度前缀（string/bytes/嵌套 message），5=32bit，3/4=旧版分组（已废弃）。',
      'varint：每个字节借最高位作"还有后续"标记，低 7 位存数据，小整数只需 1 字节。',
      'sint 类型在编码前先用 ZigZag 把 -1→1、-2→3 映射成非负整数，再 varint 编码，负数也能压缩到极小体积。',
      '字段编号 1~15 只占 1 个 tag 字节，16~2047 占 2 字节；高频字段尽量分配小编号。',
      '未设置的字段不编码、不占字节；这也是 protobuf 体积小的主要原因之一。',
    ],
    notes: [
      '字段编号 19000~19999 是保留区间，不要使用；编号一旦发布上线就不要再改语义。',
      'repeated 的消息元素在 proto3 默认用"长度前缀打包"方式编码（packed），比逐个拆开更快更小。',
    ],
    example: `// message Person { int32 id = 1; string name = 2; }
// id = 1500, name = "alice" 的二进制约长这样：

field 1 (id)   : tag=0x08  varint=0xAC 0x0E
                 → {id:1500}
field 2 (name) : tag=0x12  len=0x05  "alice"
                 → {name}

// 十六进制字节流：
08 AC 0E 12 05 61 6C 69 63 65

// 可以配合 protoc --decode 反解查看二进制`,
  },
  {
    id: 'protobuf-import',
    title: '7. 嵌套类型、import 与包管理',
    category: 'Protobuf 语法',
    version: 'proto3',
    level: '进阶',
    lang: 'cpp',
    summary: '用嵌套 message、import、package 组织大型 .proto 工程，避免命名冲突与巨型单文件。',
    detail: [
      'message 内可以嵌套 message/enum，引用时用外层.内层（如 Person.Address）表达层级关系。',
      'import "other.proto"; 引入其它文件里定义的类型，跨文件复用基础结构。',
      'package 设置命名空间：在 C++ 生成对应的 namespace，在 Go/Python 影响包名与引用路径，避免同名冲突。',
      'option go_package = "example.com/proj/foo" 指定 Go 语言的生成路径；其它语言有 java_package、csharp_namespace 等。',
      'import public 会把被引文件"转导出"，供使用者透传；一般不建议多用，保持依赖关系清晰。',
      '工程实践：一个 .proto 文件聚焦一个业务领域（如 user.proto、order.proto），共享基础类型放 common.proto。',
    ],
    notes: [
      'import 路径默认基于 -I(proto_path) 指定的根，注意 -I 参数与 import 路径要配套。',
      '避免循环 import，protoc 会直接报错；保持依赖从底层到上层单向聚集。',
    ],
    example: `// ---------- common.proto ----------
syntax = "proto3";
package common;

enum Status { STATUS_UNSPECIFIED = 0; OK = 1; ERROR = 2; }

// ---------- user.proto ----------
syntax = "proto3";
package api;

import "common.proto";

message User {
  int64 id = 1;
  string name = 2;
  common.Status status = 3;   // 引用外部包

  message Address {           // 嵌套类型
    string city = 1;
    string street = 2;
  }
  Address addr = 4;           // 引用嵌套类型 User.Address
}`,
  },
  {
    id: 'protobuf-compat',
    title: '8. 向后兼容：新增、废弃与字段演进',
    category: 'Protobuf 进阶',
    version: 'proto3',
    level: '进阶',
    lang: 'cpp',
    summary: '掌握 protobuf 的向后兼容规则，让接口在不破坏线上的前提下安全演进。',
    detail: [
      '新增字段：分配一个全新的编号即可，老客户端读到新编号会跳过，双方都能平滑工作。',
      '删除字段：不要复用其编号，用 reserved 1, 2; 和 reserved "old_name"; 声明保留，防止误用。',
      '类型放宽：int32→int64 安全；int64→int32 有截断风险；float→double 可以，反之精度丢。',
      '不要改变字段语义：同一编号在不同版本表达不同含义会造成线上灾难，宁可新增编号。',
      'oneof 转普通字段或反之是兼容的；map 与 repeated message 不建议互换。',
      '枚举新增值：add 安全，删除/改名值编号时要 reserved，未知枚举值会被当作未知字段处理。',
    ],
    notes: [
      '大版本破坏性变更（重命名 package、改消息语义）建议直接换新 service/新方法，保留旧版本过渡。',
      'gRPC 下可用 google.protobuf.FieldMask 做字段级别更新的部分合并，减少整包替换的数据。',
    ],
    example: `// 版本 2 相对版本 1 的合法演进示例：
message User {
  reserved 7;                          // 旧字段编号废弃，绝不复用
  reserved "legacy_field";             // 旧字段名保留

  int64  id    = 1;                    // 编号不变
  string name  = 2;                    // 类型不变
  int64  age   = 3;                    // 曾为 int32，放宽为 int64（安全）
  bool   vip   = 8;                    // 新增字段：分配新编号
  string phone = 9;                    // 继续新增
}`,
  },
  {
    id: 'protobuf-wellknown',
    title: '9. 标准类型：Any / Timestamp / Duration',
    category: 'Protobuf 进阶',
    version: 'proto3',
    level: '进阶',
    lang: 'cpp',
    summary: '认识 google.protobuf 的 well-known types，规范化时间、任意结构化数据与包装类型。',
    detail: [
      'google.protobuf.Timestamp：表示绝对时间点（秒 + 纳秒，epoch 纪年），代替 int64 裸时间戳，天然携带单位与语义。',
      'google.protobuf.Duration：带符号的时间间隔（秒 + 纳秒），用于表示超时、TTL 等区间量。',
      'google.protobuf.Any：包装任意 message 的变长容器（type_url + value），用于动态分发、未知类型透传。',
      '包装类型（google.protobuf.StringValue / Int32Value / BoolValue …）：把标量包成 message，用于表达"可空/可区分未设置"。',
      'google.protobuf.Empty：无字段的占位 message，常用作不需要返回值的 RPC 方法签名。',
      '引入无需下载：只要引用 google/protobuf/timestamp.proto 等即可，protoc 自带。',
    ],
    notes: [
      'Any 在使用时需要借助任意类型注册表（AnyResolver/type_registry）还原真正的类型。',
      '跨语言边界时 Timestamp 的时区语义要统一按 UTC 解释，避免踩时间坑。',
    ],
    example: `syntax = "proto3";

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";
import "google/protobuf/wrappers.proto";
import "google/protobuf/any.proto";

message Event {
  google.protobuf.Timestamp created_at = 1;   // 绝对时间
  google.protobuf.Duration ttl           = 2; // 存活时长
  google.protobuf.StringValue nick       = 3; // 可空昵称
  google.protobuf.Any      payload       = 4; // 动态数据
}

// 序列化后 timestamp 使用标准 RFC3339/
// 秒.nanos 形式，跨语言可安全交换。`,
  },
  {
    id: 'protobuf-golang',
    title: '10. 实战集成：Go / Python 使用生成的代码',
    category: 'Protobuf 集成',
    version: 'proto3',
    level: '实战',
    lang: 'js',
    summary: '在 Go 与 Python 中直接使用 protoc 生成的代码，完成序列化、反序列化与 gRPC 接入。',
    detail: [
      'Go：protoc-gen-go 生成 structural 类型，通过 proto.Marshal / proto.Unmarshal 完成编解码，字段不可变导出。',
      'Go 中获取序列化后的 []byte 用 proto.Marshal(m)，解码用 proto.Unmarshal(data, m)；判断是否存在可用 m.ProtoReflect()。',
      'Python：grpc_tools 生成 message 类，直接构造对象后调用 SerializeToString() / ParseFromString()。',
      '跨语言一致性：同一份 .proto 在 Go / Python 中生成的结构体字段布局完全对应，可直接互发二进制流。',
      'gRPC 接入：request/response 都是 message，服务方法声明于 service 块中，生成可调用的 client stub。',
      '生产实践：把 .proto 单独放在 proto 版本目录，生成的代码打入各自语言的产物仓库，避免工具链差异。',
    ],
    notes: [
      'Go 生成的 message 结构体字段注意指针字段（可区分未设置，如 optional 和包装类型）。',
      'Debug 时可把 protojson.Marshal(m) 输出 JSON 对照查看，比盯二进制字节直观得多。',
    ],
    example: `// ---------- 定义 service（同一份 .proto）----------
syntax = "proto3";
package rpc;

message HelloReq { string name = 1; }
message HelloResp { string msg = 1; }

service Greeter {
  rpc SayHello(HelloReq) returns (HelloResp);
}

// ---------- Go 端服务实现 ----------
type svc struct { rpc.UnimplementedGreeterServer }
func (s *svc) SayHello(ctx context.Context, req *rpc.HelloReq) (*rpc.HelloResp, error) {
  return &rpc.HelloResp{Msg: "hello " + req.Name}, nil
}

// g := grpc.NewServer()
// rpc.RegisterGreeterServer(g, &svc{})

// ---------- Python 端消息使用 ----------
import grpc
import hello_pb2 as pb
import hello_pb2_grpc as pbg

req = pb.HelloReq(name="zhang")
data = req.SerializeToString()      # 二进制
back = pb.HelloReq(); back.ParseFromString(data)

with grpc.insecure_channel("localhost:50051") as ch:
    stub = pbg.GreeterStub(ch)
    print(stub.SayHello(req).msg)`,
  },
];