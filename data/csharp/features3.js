// C# 特性详解 —— 第三部分：模式匹配、语法糖
module.exports = [
  // ==================== 模式匹配 ====================
  {
    id: 'pattern-matching-basics',
    title: 'is 类型模式与声明模式',
    version: 'C# 7.0',
    category: '模式匹配',
    level: '入门',
    summary: 'if (obj is Type t) 一步完成类型判断与转换。',
    detail: [
      '取代 as + null 判断的双重检查，声明的新变量作用域延伸到外围语句块且经过确定性赋值分析。',
      'not 模式（C# 9）支持否定：is not null 是判空的首选写法，比 != null 更能配合编译器流分析。',
      'or 模式可一次匹配多种类型；模式可以组合出非常紧凑的条件表达式。'
    ],
    example:
      'object value = "hello";\n\n' +
      '// 旧写法：as + null 判断\n' +
      'var s0 = value as string;\n' +
      'if (s0 != null) Console.WriteLine(s0.Length);\n\n' +
      '// 新写法：一步到位，声明变量 str 并直接可用\n' +
      'if (value is string str)\n' +
      '    Console.WriteLine(str.Length);\n\n' +
      '// C# 9 否定模式：判空首选\n' +
      'if (value is not null)\n' +
      '    Console.WriteLine("非空");\n\n' +
      '// or 模式：一次匹配多种类型\n' +
      'if (value is int or long)\n' +
      '    Console.WriteLine("整数族");\n\n' +
      '// 演示：按类型分派\n' +
      'void Describe(object o)\n' +
      '{\n' +
      '    if (o is int n)        Console.WriteLine($"int={n}");\n' +
      '    else if (o is string t) Console.WriteLine($"string={t}");\n' +
      '    else if (o is null)     Console.WriteLine("null");\n' +
      '    else                    Console.WriteLine("其他");\n' +
      '}\n' +
      'Describe(42); Describe("hi"); Describe(null);'
    ,
    example2Title: '实战：类型分派 + 模式匹配解析',
    example2:
      '// 实战：按运行时类型分派处理\n' +
      'record Shape(string Kind, double Area);\n\n' +
      'object[] items = { 42, "hello", 3.14, null, new Shape("圆", 12.5) };\n\n' +
      'foreach (var item in items)\n' +
      '{\n' +
      '    string desc = item switch\n' +
      '    {\n' +
      '        int n when n > 100 => $"大整数 {n}",\n' +
      '        int n              => $"整数 {n}",\n' +
      '        string s           => $"字符串「{s}」长度 {s.Length}",\n' +
      '        double d           => $"浮点数 {d:F2}",\n' +
      '        Shape { Kind: "圆" } s => $"圆形面积 {s.Area}",\n' +
      '        null               => "空值",\n' +
      '        _                  => "其他"\n' +
      '    };\n' +
      '    Console.WriteLine(desc);\n' +
      '}\n\n' +
      '// is not null 判空 + 声明模式一步完成\n' +
      'void TryProcess(object? data)\n' +
      '{\n' +
      '    if (data is not string text) return;   // 非 string 或 null 直接返回\n' +
      '    Console.WriteLine($"处理文本：{text.ToUpper()}");\n' +
      '}\n' +
      'TryProcess("abc");     // 处理文本：ABC\n' +
      'TryProcess(123);       // 无输出\n' +
      'TryProcess(null);      // 无输出'
  },
  {
    id: 'switch-expressions',
    title: 'switch 表达式',
    version: 'C# 8.0',
    category: '模式匹配',
    level: '入门',
    summary: '表达式形式的 switch：箭头分支 + when 子句 + 弃元 _ 默认分支。',
    detail: [
      'switch 从语句升级为表达式，可直接作为返回值；分支按顺序匹配，_ 为兜底。',
      '结合关系模式、逻辑模式（and/or/not）可写出近乎声明式的业务规则。',
      '对枚举等有限域能做穷尽性检查：漏掉分支时编译器警告（配合 IEnumeralble 无关的 exhaustiveness 分析）。'
    ],
    example:
      '// 成绩评级：关系模式 + 兜底\n' +
      'static string Grade(int score) => score switch\n' +
      '{\n' +
      '    >= 90 => "优秀",\n' +
      '    >= 80 => "良好",\n' +
      '    >= 60 => "及格",\n' +
      '    >= 0  => "不及格",\n' +
      '    _     => throw new ArgumentOutOfRangeException(nameof(score))\n' +
      '};\n\n' +
      '// 属性模式 + when 子句：根据车型收费\n' +
      'record Car(int Passengers, bool Electric);\n' +
      'static decimal Toll(Car c) => c switch\n' +
      '{\n' +
      '    { Electric: true }              => 0.00m,                  // 新能源车免费\n' +
      '    { Passengers: 0 }               => 2.50m,                  // 空车\n' +
      '    { Passengers: > 2 }             => 1.00m,                  // 多人优惠\n' +
      '    var normal when normal.Passengers == 1 => 3.00m,           // when 子句\n' +
      '    _                               => 2.00m\n' +
      '};\n\n' +
      '// 演示\n' +
      'Console.WriteLine(Grade(95));     // 优秀\n' +
      'Console.WriteLine(Grade(55));     // 不及格\n' +
      'Console.WriteLine(Toll(new Car(0, false)));  // 2.50\n' +
      'Console.WriteLine(Toll(new Car(3, false)));  // 1.00'
    ,
    example2Title: '实战：订单状态机的 switch 表达式',
    example2:
      'public enum OrderStatus { Pending, Paid, Shipped, Completed, Cancelled, Refunded }\n\n' +
      '// 状态机：根据当前状态 + 动作计算下一个状态\n' +
      'static OrderStatus Next(OrderStatus s, string action) => (s, action) switch\n' +
      '{\n' +
      '    (OrderStatus.Pending, "pay")      => OrderStatus.Paid,\n' +
      '    (OrderStatus.Paid, "ship")        => OrderStatus.Shipped,\n' +
      '    (OrderStatus.Shipped, "deliver")  => OrderStatus.Completed,\n' +
      '    (OrderStatus.Pending, "cancel")   => OrderStatus.Cancelled,\n' +
      '    (OrderStatus.Paid, "refund")      => OrderStatus.Refunded,\n' +
      '    (OrderStatus.Cancelled, "reopen") => OrderStatus.Pending,\n' +
      '    _ => throw new InvalidOperationException($"非法迁移：{s} -> {action}")\n' +
      '};\n\n' +
      '// 元组模式 + when 子句：运费计算\n' +
      'static decimal ShippingFee(decimal amount, bool vip, bool rush) => (vip, rush) switch\n' +
      '{\n' +
      '    (true, _)            => 0m,               // VIP 免邮\n' +
      '    (false, true)        => amount * 0.2m,    // 加急 20%\n' +
      '    (false, false) when amount >= 99 => 0m,   // 满 99 包邮\n' +
      '    _                    => 8m\n' +
      '};\n\n' +
      '// 演示\n' +
      'var st = OrderStatus.Pending;\n' +
      'st = Next(st, "pay");\n' +
      'st = Next(st, "ship");\n' +
      'Console.WriteLine(st);                       // Shipped\n' +
      'Console.WriteLine(ShippingFee(50, false, false));  // 8\n' +
      'Console.WriteLine(ShippingFee(150, false, false)); // 0（满 99 包邮）\n' +
      'Console.WriteLine(ShippingFee(30, true, true));    // 0（VIP）'
  },
  {
    id: 'relational-patterns',
    title: '关系与逻辑组合模式',
    version: 'C# 9.0',
    category: '模式匹配',
    level: '进阶',
    summary: '< > <= >= 配合 and / or / not 组合成可读的条件表达式树。',
    detail: [
      '模式可以任意嵌套与组合，优先级：not > and > or，必要时用括号分组。',
      '对 enum/bool 等有限域编译器能做穷尽性检查——新增枚举值而未处理时会得到编译警告。',
      '关系模式只能用于可比较类型；与声明模式组合（is { Count: > 0 }）可以同时判空、判类型、判范围。'
    ],
    example:
      '// 闰年判断（逻辑组合模式）\n' +
      'static bool IsLeap(int y) => y is { } && (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0));\n\n' +
      'static string Check(int n) => n switch\n' +
      '{\n' +
      '    < 0             => "负数",\n' +
      '    0               => "零",\n' +
      '    > 0 and < 10    => "个位数",\n' +
      '    >= 10 and < 100 => "两位数",\n' +
      '    _               => "大数"\n' +
      '};\n\n' +
      '// 区间判断一目了然\n' +
      'bool pass = 75 is >= 60 and < 100;\n' +
      'Console.WriteLine(pass);     // True\n\n' +
      '// 演示\n' +
      'Console.WriteLine(Check(-3)); // 负数\n' +
      'Console.WriteLine(Check(7));  // 个位数\n' +
      'Console.WriteLine(Check(42)); // 两位数\n' +
      'Console.WriteLine(IsLeap(2024)); // True\n' +
      'Console.WriteLine(IsLeap(1900)); // False'
    ,
    example2Title: '实战：综合业务规则判断',
    example2:
      '// 体温分级\n' +
      'static string FeverLevel(double t) => t switch\n' +
      '{\n' +
      '    < 36.0                => "体温偏低",\n' +
      '    >= 36.0 and < 37.3    => "正常",\n' +
      '    >= 37.3 and < 38.0    => "低烧",\n' +
      '    >= 38.0 and < 39.0    => "高烧",\n' +
      '    >= 39.0               => "危险高热",\n' +
      '    _                     => "无效数据"\n' +
      '};\n\n' +
      '// 优惠券判断：金额 + 会员等级组合\n' +
      'record User(string Name, int Level);   // Level: 1普通 2银 3金\n' +
      'static string Discount(User u, decimal amount) => (u.Level, amount) switch\n' +
      '{\n' +
      '    (3, _)                    => $"金卡 8 折，实付 {amount * 0.8m:C}",\n' +
      '    (2, >= 200)               => $"银卡满200减50，实付 {amount - 50:C}",\n' +
      '    (_, >= 300)               => $"普通满300减30，实付 {amount - 30:C}",\n' +
      '    _                         => $"无优惠，实付 {amount:C}"\n' +
      '};\n\n' +
      'Console.WriteLine(FeverLevel(36.5));    // 正常\n' +
      'Console.WriteLine(FeverLevel(38.5));    // 高烧\n' +
      'Console.WriteLine(Discount(new("张三", 3), 100));     // 金卡 8 折，实付 ¥80.00\n' +
      'Console.WriteLine(Discount(new("李四", 2), 250));     // 银卡满200减50，实付 ¥200.00\n' +
      'Console.WriteLine(Discount(new("王五", 1), 100));     // 无优惠，实付 ¥100.00'
  },
  {
    id: 'list-patterns',
    title: '列表模式',
    version: 'C# 11.0',
    category: '模式匹配',
    level: '高级',
    summary: '[1, 2, .., var last] 直接对数组/列表做结构化形状匹配。',
    detail: [
      '.. 是切片模式（零个或多个元素），可与位置模式组合，用于解析命令行、校验序列首尾等。',
      '列表模式逐元素调用索引器比较，适合中小集合；性能敏感的超长列表请用显式循环。',
      '匹配的元素可以用 var 声明捕获（[var first, .., var last]），也可以直接写常量做精确匹配。'
    ],
    example:
      'int[] numbers = { 1, 2, 3, 4, 5 };\n\n' +
      'static string Describe(int[] arr) => arr switch\n' +
      '{\n' +
      '    []                              => "空数组",\n' +
      '    [var single]                    => $"单元素 {single}",\n' +
      '    [var first, .., var last]       => $"首 {first} 尾 {last}",\n' +
      '    [0, ..]                         => "以 0 开头",\n' +
      '    _                               => "其他"\n' +
      '};\n\n' +
      '// 演示：解析简易命令行参数\n' +
      'static string ParseArgs(string[] args) => args switch\n' +
      '{\n' +
      '    ["--help"]                  => "显示帮助",\n' +
      '    ["build", .. var rest]      => $"构建，参数：{string.Join(",", rest)}",\n' +
      '    ["run", var target, ..]     => $"运行目标：{target}",\n' +
      '    _                           => "未知命令"\n' +
      '};\n\n' +
      'Console.WriteLine(Describe(numbers));       // 首 1 尾 5\n' +
      'Console.WriteLine(ParseArgs(new[] { "build", "-c", "Release" })); // 构建，参数：-c,Release\n' +
      'Console.WriteLine(ParseArgs(new[] { "run", "app.dll" }));        // 运行目标：app.dll'
    ,
    example2Title: '实战：矩阵形状判断与序列校验',
    example2:
      '// 判断二维数组形状\n' +
      'static string Shape(int[][] m) => m switch\n' +
      '{\n' +
      '    []                          => "空矩阵",\n' +
      '    [var row]                   => $"1×{row.Length} 向量",\n' +
      '    [var r1, .. var rest] when rest.All(r => r.Length == r1.Length) =>\n' +
      '        $"{m.Length}×{r1.Length} 矩阵",\n' +
      '    _                           => "锯齿数组"\n' +
      '};\n\n' +
      '// 校验序列：必须 [a, b, c] 且严格递增\n' +
      'static string Validate(int[] seq) => seq switch\n' +
      '{\n' +
      '    [int a, int b, int c] when a < b && b < c => "严格递增三元组",\n' +
      '    [int a, int b, int c] => "非递增三元组",\n' +
      '    [var f, ..] when f < 0 => "负数开头",\n' +
      '    _ => "其他"\n' +
      '};\n\n' +
      '// 子序列匹配\n' +
      'static int CountPattern(int[] data) => data switch\n' +
      '{\n' +
      '    [.., 1, 2, 3, ..] => 1,     // 包含子序列 1,2,3\n' +
      '    _ => 0\n' +
      '};\n\n' +
      'Console.WriteLine(Shape([[1, 2], [3, 4]]));       // 2×2 矩阵\n' +
      'Console.WriteLine(Shape([[1], [2, 3]]));          // 锯齿数组\n' +
      'Console.WriteLine(Validate(new[] { 1, 2, 3 }));   // 严格递增三元组\n' +
      'Console.WriteLine(Validate(new[] { 3, 2, 1 }));   // 非递增三元组\n' +
      'Console.WriteLine(CountPattern(new[] { 0, 1, 2, 3, 9 }));  // 1'
  },
  {
    id: 'property-patterns',
    title: '嵌套/递归属性模式',
    version: 'C# 8.0',
    category: '模式匹配',
    level: '进阶',
    summary: 'obj is { Address.City: "北京", Age: > 18 } 深层解构对象图。',
    detail: [
      '属性模式可以无限嵌套，一层层深入对象属性进行判断，避免长串 && 非空检查。',
      '位置模式（positional pattern）配合 Deconstruct 可直接拆解对象：Person(var name, > 18)。',
      '{ } 空属性模式只判非空不取值：if (e.Addr is { }) 比 e.Addr != null 语义更明确。'
    ],
    example:
      'record Address(string City, string Street);\n' +
      'record Employee(string Name, int Age, Address? Addr);\n\n' +
      'static string Region(Employee e) => e switch\n' +
      '{\n' +
      '    { Addr: { City: "北京" } }                 => "华北",\n' +
      '    { Addr.City: "上海" or "杭州" }            => "华东",\n' +
      '    { Addr: null, Age: >= 18 }                 => "未知城市（成年）",\n' +
      '    { Age: < 18 }                              => "未成年",\n' +
      '    _                                          => "其他"\n' +
      '};\n\n' +
      '// 位置模式：解构后逐项匹配\n' +
      'static string Describe(Employee e) => e switch\n' +
      '{\n' +
      '    (_, < 18, _)                                   => "未成年员工",\n' +
      '    var (name, _, addr) when addr?.City == "北京"   => $"{name}（北京员工）",\n' +
      '    _                                              => "普通员工"\n' +
      '};\n\n' +
      '// 演示\n' +
      'var e1 = new Employee("张三", 30, new Address("北京", "长安街"));\n' +
      'var e2 = new Employee("李四", 16, null);\n' +
      'Console.WriteLine(Region(e1));   // 华北\n' +
      'Console.WriteLine(Region(e2));   // 未成年\n' +
      'Console.WriteLine(Describe(e1)); // 张三（北京员工）'
    ,
    example2Title: '实战：深嵌套配置校验',
    example2:
      'record ServerConfig(string Name, Network Network, Security Security);\n' +
      'record Network(string Host, int Port, bool Tls);\n' +
      'record Security(string? ApiKey, int MaxRetries);\n\n' +
      '// 深嵌套模式：逐层匹配\n' +
      'static string Audit(ServerConfig? cfg) => cfg switch\n' +
      '{\n' +
      '    // 三层嵌套 + 逻辑组合\n' +
      '    { Network: { Host: "localhost", Port: > 0 and < 65536, Tls: true },\n' +
      '      Security: { ApiKey: { Length: >= 16 }, MaxRetries: <= 5 } }\n' +
      '        => "配置安全且合规",\n\n' +
      '    { Network: { Host: "localhost" } } => "仅本机允许，但 TLS 或密钥不合规",\n' +
      '    { Network: { Tls: false } }        => "未启用 TLS，存在风险",\n' +
      '    { Security: { ApiKey: null } }     => "缺少 API Key",\n' +
      '    null                               => "配置为空",\n' +
      '    _                                  => "其他"\n' +
      '};\n\n' +
      '// 演示\n' +
      'var good = new ServerConfig("prod",\n' +
      '    new Network("localhost", 443, true),\n' +
      '    new Security("k".PadRight(16, \'x\'), 3));\n' +
      'Console.WriteLine(Audit(good));   // 配置安全且合规\n\n' +
      'var bad1 = new ServerConfig("dev", new Network("localhost", 80, false), null!);\n' +
      'Console.WriteLine(Audit(bad1));   // 未启用 TLS，存在风险\n\n' +
      'Console.WriteLine(Audit(null));   // 配置为空'
  },

  // ==================== 语法糖 ====================
  {
    id: 'string-interpolation',
    title: '字符串插值 $"" 与原始字符串',
    version: 'C# 6.0 / 11.0',
    category: '语法糖',
    level: '入门',
    summary: '$"Hello {name}" 取代占位符；"""原始字符串""" 彻底告别转义地狱。',
    detail: [
      '插值字符串内可直接写表达式与格式说明符 {value:F2}。@"" 逐字字符串可与 $ 组合为 @$""。',
      'C# 11 的原始字符串字面量 """…""" 不需要转义引号、反斜杠，非常适合 JSON/正则/XML；引号数量决定边界（""" 内可出现单个 "）。',
      'C# 10 起编译器把插值字符串优化为 Append 链减少分配；const 插值字符串也可声明为 const。',
      'u8 后缀（C# 11）把字符串字面量直接编码为 ReadOnlySpan<byte> 的 UTF-8 字节。'
    ],
    example:
      'var name = "世界";\n' +
      'double pi = 3.14159;\n' +
      'var now = DateTime.Now;\n\n' +
      'Console.WriteLine($"你好 {name}，π ≈ {pi:F2}，现在是 {now:yyyy-MM-dd HH:mm}");\n' +
      'Console.WriteLine(@$"C:\\temp\\{name}.txt");   // @ 逐字 + $ 插值，反斜杠原样\n' +
      'Console.WriteLine($"{pi,-10:F3}|右对齐{pi,12:C}"); // 左/右对齐与货币格式\n\n' +
      '// C# 11 原始字符串：无需转义引号与反斜杠\n' +
      'var json = """\n' +
      '    {\n' +
      '      "name": "张三",\n' +
      '      "tags": ["c#", ".net"]\n' +
      '    }\n' +
      '    """;\n' +
      'Console.WriteLine(json);\n\n' +
      '// 正则对比：旧 vs 新\n' +
      'var re1 = "\\\\d{3}-\\\\d{4}";        // 转义地狱：要写四个反斜杠\n' +
      'var re2 = """\\d{3}-\\d{4}""";      // 一目了然\n' +
      'Console.WriteLine(re1 == re2);       // True（两者表示同样的字符串）'
    ,
    example2Title: '实战：对齐、格式与文化的综合用法',
    example2:
      '// 表格化输出：对齐字段\n' +
      'var rows = new[]\n' +
      '{\n' +
      '    new { Name = "苹果", Price = 5.5m, Qty = 12 },\n' +
      '    new { Name = "香蕉", Price = 3.2m, Qty = 30 },\n' +
      '    new { Name = "榴莲", Price = 199.9m, Qty = 1 },\n' +
      '};\n' +
      'Console.WriteLine($"{"商品",-8}{"单价",8}{"数量",6}{"小计",10}");\n' +
      'foreach (var r in rows)\n' +
      '    Console.WriteLine($"{r.Name,-8}{r.Price,8:C}{r.Qty,6}{r.Price * r.Qty,10:C}");\n\n' +
      '// 不同文化的数字格式\n' +
      'var n = 1234567.89;\n' +
      'Console.WriteLine(n.ToString("N2", new System.Globalization.CultureInfo("zh-CN")));  // 1,234,567.89\n' +
      'Console.WriteLine(n.ToString("N2", new System.Globalization.CultureInfo("de-DE")));  // 1.234.567,89\n\n' +
      '// 插值内写表达式与三元\n' +
      'var score = 78;\n' +
      'Console.WriteLine($"{nameof(score)} = {score}，结果：{(score >= 60 ? "及格" : "不及格")}");\n\n' +
      '// 日期复合格式\n' +
      'var now = DateTime.Now;\n' +
      'Console.WriteLine($"{now:yyyy年MM月dd日 dddd HH:mm:ss}");'
  },
  {
    id: 'null-operators',
    title: '?. ?? 和 ??= 空值处理全家桶',
    version: 'C# 6.0 / 8.0',
    category: '语法糖',
    level: '入门',
    summary: '空条件 ?. 、空合并 ?? 与 ??= 让判空代码缩成一行。',
    detail: [
      '?. 短路：左侧为 null 则整体为 null，右侧不再求值（包括副作用）；链式调用 user?.Address?.City 安全穿透多层。',
      '?? 提供回退值；??= 仅在为 null 时赋值，常用于惰性初始化字段。',
      '与可空引用类型（NRT）配合构成现代 C# 防 NRE 完整工具箱。'
    ],
    notes: [
      'a?.B.M() 在 a 为 null 时整条短路，但 a.B 为 null 时 .M() 仍会抛 NRE——?. 只保护紧邻的一环。',
      '?[] 空条件索引用于安全访问可能为 null 的集合：list?[0]。'
    ],
    example:
      'record Address(string City);\n' +
      'record User(Address? Address);\n\n' +
      'User? user = null;\n' +
      'List<int>? list = null;\n\n' +
      '// ?. 链式短路\n' +
      'string? city = user?.Address?.City;\n' +
      'Console.WriteLine(city ?? "（无城市）");   // （无城市）\n\n' +
      '// ?? 回退值\n' +
      'int count = list?.Count ?? 0;\n' +
      'Console.WriteLine(count);                  // 0\n\n' +
      '// ??= 惰性初始化\n' +
      'list ??= new List<int> { 1, 2, 3 };\n' +
      'Console.WriteLine(list.Count);             // 3\n\n' +
      '// ?[] 空条件索引\n' +
      'int first = list?[0] ?? -1;\n' +
      'Console.WriteLine(first);                  // 1\n\n' +
      '// 触发事件的经典姿势\n' +
      'Action<string>? onMsg = null;\n' +
      'onMsg?.Invoke("hello");    // 无订阅者也不抛 NRE'
    ,
    example2Title: '实战：深层对象图的空安全访问',
    example2:
      '// 订单 -> 客户 -> 地址 三级对象图\n' +
      'record Address(string City, string? Street);\n' +
      'record Customer(string Name, Address? Address);\n' +
      'record Order(int Id, Customer? Customer, string? Remark);\n\n' +
      'Order?[] orders =\n' +
      '{\n' +
      '    new(1, new Customer("张三", new Address("北京", "长安街")), "加急"),\n' +
      '    new(2, new Customer("李四", null), null),\n' +
      '    new(3, null, null),\n' +
      '    null,\n' +
      '};\n\n' +
      '// 逐个安全取城市\n' +
      'foreach (var o in orders)\n' +
      '{\n' +
      '    string city = o?.Customer?.Address?.City ?? "（未知）";\n' +
      '    string remark = o?.Remark ?? "无备注";\n' +
      '    Console.WriteLine($"订单 {o?.Id ?? -1}: {city}, {remark}");\n' +
      '}\n\n' +
      '// 字典 + 空条件索引\n' +
      'Dictionary<string, List<int>?> scores = new() { ["a"] = [1, 2] };\n' +
      'int? first = scores.TryGetValue("a", out var list) ? list?[0] : null;\n' +
      'Console.WriteLine(first ?? -1);      // 1\n\n' +
      '// ??= 惰性缓存\n' +
      'List<string>? cache = null;\n' +
      'List<string> GetCache() => cache ??= Load();\n' +
      'static List<string> Load() => new() { "x", "y" };\n' +
      'Console.WriteLine(GetCache().Count);  // 2'
  },
  {
    id: 'ranges-indexes',
    title: '索引与范围 ^ 和 ..',
    version: 'C# 8.0',
    category: '语法糖',
    level: '入门',
    summary: 'arr[^1] 取倒数第一，str[2..^3] 切片，告别手写 Length-1。',
    detail: [
      '^n 表示从末尾数第 n 个（System.Index 类型）；a..b 表示 [a, b) 区间切片（System.Range 类型），两端都可省略。',
      '编译器转换为 Substring/Slice 等调用；在 Span<T>/ReadOnlySpan<T> 上同样适用且零拷贝。',
      '自定义类型只要支持 Length/Count 与索引器，即可通过添加 Slice 方法获得范围支持。'
    ],
    example:
      'int[] arr = { 0, 1, 2, 3, 4, 5 };\n\n' +
      'Console.WriteLine(arr[^1]);        // 5   最后一个\n' +
      'Console.WriteLine(string.Join(",", arr[^2..]));   // 4,5\n' +
      'Console.WriteLine(string.Join(",", arr[1..4]));   // 1,2,3\n' +
      'Console.WriteLine(string.Join(",", arr[..]));     // 0,1,2,3,4,5（副本）\n' +
      'Console.WriteLine(string.Join(",", arr[..^2]));   // 0,1,2,3 除最后两个外\n\n' +
      'string url = "https://example.com/api";\n' +
      'Console.WriteLine(url[..5]);        // "https"\n' +
      'Console.WriteLine(url[^3..]);       // "api"\n\n' +
      '// Span 上零拷贝切片\n' +
      'ReadOnlySpan<char> span = url.AsSpan();\n' +
      'Console.WriteLine(span[8..].ToString());   // "example.com/api"，无中间分配'
    ,
    example2Title: '实战：URL 解析与分页切片',
    example2:
      '// 解析 URL 的各部分\n' +
      'string url = "https://user:pass@example.com:8080/api/v1/users?page=2";\n' +
      'int schemeEnd = url.IndexOf("://") + 3;\n' +
      'string scheme = url[..url.IndexOf("://")];              // "https"\n' +
      'string host = url[schemeEnd..url.IndexOf('/', schemeEnd)];  // "example.com:8080"\n' +
      'string path = url[url.IndexOf('/', schemeEnd)..];      // "/api/v1/users?page=2"\n' +
      'Console.WriteLine($"{scheme} | {host} | {path}");\n\n' +
      '// 分页切片：用 .. 代替 Length 计算\n' +
      'static IEnumerable<T> Page<T>(IEnumerable<T> src, int page, int size)\n' +
      '{\n' +
      '    var arr = src.ToArray();\n' +
      '    int start = (page - 1) * size;\n' +
      '    if (start >= arr.Length) return Array.Empty<T>();\n' +
      '    return arr[start..Math.Min(start + size, arr.Length)];\n' +
      '}\n\n' +
      'var items = Enumerable.Range(0, 10);\n' +
      'Console.WriteLine(string.Join(",", Page(items, 1, 3)));   // 0,1,2\n' +
      'Console.WriteLine(string.Join(",", Page(items, 4, 3)));   // 9\n\n' +
      '// 末元素与尾部切片\n' +
      'int[] nums = [10, 20, 30];\n' +
      'Console.WriteLine(nums[^1]);        // 30\n' +
      'string s = "abcdef";\n' +
      'Console.WriteLine(s[^2..]);          // ef'
  },
  {
    id: 'top-level-statements',
    title: '顶级语句与全局 using',
    version: 'C# 9.0 / 10.0',
    category: '语法糖',
    level: '入门',
    summary: 'Program.cs 里直接写逻辑；global using 全项目统一导入命名空间。',
    detail: [
      '顶级语句省略 Main 与 class 包装，最适合小工具、脚本与教学示例；文件范围命名空间 namespace X; 再减一层缩进。',
      'global using / global using static 在 csproj 或 GlobalUsings.cs 中集中管理，csproj 还支持 <Using Include="..." /> 批量添加。',
      '顶级语句文件中仍可用局部函数、类声明；args 参数隐式存在。'
    ],
    example:
      '// ===== Program.cs（顶级语句，可直接跑）=====\n' +
      'var builder = WebApplication.CreateBuilder(args);\n' +
      'var app = builder.Build();\n\n' +
      'app.MapGet("/", () => "Hello Minimal API!");\n' +
      'app.Run();\n\n' +
      '// ===== GlobalUsings.cs =====\n' +
      'global using System.Collections.Generic;\n' +
      'global using System.Linq;\n' +
      'global using Xunit;\n\n' +
      '// ===== 文件范围命名空间（少一层缩进）=====\n' +
      'namespace MyApp.Utils;\n' +
      'static class MathEx\n' +
      '{\n' +
      '    public static int Square(int x) => x * x;\n' +
      '}\n\n' +
      '// ===== csproj 批量全局导入 =====\n' +
      '// <ItemGroup>\n' +
      '//   <Using Include="System.Diagnostics.CodeAnalysis" />\n' +
      '// </ItemGroup>'
    ,
    example2Title: '实战：完整命令行小工具（统计目录文件）',
    example2:
      '// ===== Program.cs —— 顶级语句完整工具 =====\n' +
      '// 用法：dotnet run -- <目录> [扩展名过滤]\n' +
      'string dir = args.Length > 0 ? args[0] : ".";\n' +
      'string filter = args.Length > 1 ? args[1] : "*.*";\n\n' +
      'if (!Directory.Exists(dir))\n' +
      '{\n' +
      '    Console.Error.WriteLine($"目录不存在：{dir}");\n' +
      '    return 1;\n' +
      '}\n\n' +
      'var files = Directory.EnumerateFiles(dir, filter, SearchOption.AllDirectories)\n' +
      '    .Select(f => new FileInfo(f))\n' +
      '    .OrderByDescending(f => f.Length);\n\n' +
      'int count = 0;\n' +
      'long total = 0;\n' +
      'foreach (var f in files.Take(10))\n' +
      '{\n' +
      '    Console.WriteLine($"{f.Name,-40} {f.Length,12:N0} B");\n' +
      '    count++; total += f.Length;\n' +
      '}\n' +
      'Console.WriteLine($"\n共匹配 {count} 个文件，合计 {total:N0} 字节");\n\n' +
      '// 局部函数 + 顶级语句混用\n' +
      'string Humanize(long bytes) =>\n' +
      '    bytes >= 1 << 30 ? $"{bytes / (double)(1 << 30):F2} GB"\n' +
      '    : bytes >= 1 << 20 ? $"{bytes / (double)(1 << 20):F1} MB"\n' +
      '    : $"{bytes / (double)(1 << 10):F0} KB";\n' +
      'Console.WriteLine(Humanize(total));\n\n' +
      'return 0;\n\n' +
      '// ===== GlobalUsings.cs =====\n' +
      '// global using System;\n' +
      '// global using System.IO;\n' +
      '// global using System.Linq;'
  },
  {
    id: 'target-typed-new',
    title: '目标类型 new 与类型推断',
    version: 'C# 9.0',
    category: '语法糖',
    level: '入门',
    summary: 'List<int> xs = new(); 左边已声明类型，右边不必重复。',
    detail: [
      'new() 依据赋值目标推断类型，字段初始化、传参处同样适用，让泛型类型的声明清爽许多。',
      '与 var 相反：var 由右边推断左边类型，target-typed new 由左边推断右边类型，两者互补。',
      '派生类赋给基类引用时 new() 推断为基类类型，需要写完整类型名 new Derived()。'
    ],
    example:
      'Dictionary<string, List<int>> map = new();\n' +
      'map["odd"] = new() { 1, 3, 5 };\n\n' +
      'StringBuilder sb = new();\n' +
      'sb.Append("hi");\n\n' +
      '// 传参同样适用\n' +
      'Task.Run(() => Process(new()));\n\n' +
      '// C# 12 集合表达式更进一步\n' +
      'int[] nums = [1, 2, 3];\n' +
      'List<int> more = [..nums, 4, 5];\n' +
      'Console.WriteLine(string.Join(",", more));   // 1,2,3,4,5\n\n' +
      'static void Process(List<int> xs) => Console.WriteLine(xs.Count);\n' +
      '// 注：上面 Task.Run 仅为展示语法；运行时请保证 new() 有明确目标类型'
    ,
    example2Title: '实战：泛型工厂与集合表达式组合',
    example2:
      '// 泛型工厂：new() 推断目标类型\n' +
      'static T Make<T>() where T : new() => new();\n\n' +
      'var point = Make<Point>();                    // new() 推断为 Point\n' +
      'Console.WriteLine(point);                     // Point { X = 0, Y = 0 }\n\n' +
      '// 字段与属性初始化\n' +
      'class Store\n' +
      '{\n' +
      '    public List<int> Items { get; } = new();  // 属性初始化器里同样适用\n' +
      '    private Dictionary<string, Action> Handlers = new();\n' +
      '}\n' +
      'record Point(int X, int Y);\n\n' +
      '// 与集合表达式组合\n' +
      'List<int[]> batches = new()\n' +
      '{\n' +
      '    [1, 2, 3],\n' +
      '    [4, 5],\n' +
      '};\n' +
      'Console.WriteLine(batches.Count);             // 2\n\n' +
      '// 派生类场景：new() 推断为基类\n' +
      'Animal a = new();                             // 推断 Animal，不是 Dog\n' +
      '// Animal a2 = new Dog();                     // 想用派生类必须写全名\n\n' +
      'class Animal { }\n' +
      'class Dog : Animal { }\n\n' +
      '// 三元目标类型（C# 9）：两侧统一推断\n' +
      'int? maybe = true ? null : 0;\n' +
      'Console.WriteLine(maybe is null);             // True'
  },
  {
    id: 'default-named-args',
    title: '可选参数与命名实参',
    version: 'C# 4.0',
    category: '语法糖',
    level: '入门',
    summary: '方法参数给默认值；调用时用 名字: 值 指定，跳过不需要的参数。',
    detail: [
      '可选参数必须位于必选参数之后，默认值必须是编译期常量（或 default/new 表达式）。',
      '命名实参让布尔参数调用点自文档化：Retry(count: 3, throwOnFail: true) 远比 Retry(3, true) 清晰。',
      '注意版本兼容陷阱：修改已发布方法的默认值需要重编译所有调用方（默认值被烧录进调用点）。'
    ],
    example:
      'static void Send(\n' +
      '    string to,\n' +
      '    string subject,\n' +
      '    string body = "",\n' +
      '    bool ccAdmin = false,\n' +
      '    int retries = 3)\n' +
      '{\n' +
      '    Console.WriteLine($"to={to}, subject={subject}, body={body}, ccAdmin={ccAdmin}, retries={retries}");\n' +
      '}\n\n' +
      '// 其余全用默认\n' +
      'Send("bob@x.com", "Hi");\n' +
      '// 命名实参：只覆盖需要的，顺序无所谓\n' +
      'Send(to: "bob@x.com", subject: "Hi", ccAdmin: true);\n' +
      'Send("bob@x.com", "Hi", retries: 5);\n\n' +
      '// 命名实参还能"跳过中间参数"\n' +
      'Send("bob@x.com", "Hi", retries: 5, ccAdmin: true);'
    ,
    example2Title: '实战：可读性极佳的配置 API 设计',
    example2:
      '// 参数较多的方法：可选参数 + 命名实参保持调用点清晰\n' +
      'static async Task<string> HttpGetAsync(\n' +
      '    string url,\n' +
      '    int timeoutSeconds = 30,\n' +
      '    bool followRedirects = true,\n' +
      '    string? userAgent = null,\n' +
      '    IDictionary<string, string>? headers = null)\n' +
      '{\n' +
      '    Console.WriteLine($"GET {url} timeout={timeoutSeconds}s redirect={followRedirects} ua={userAgent ?? "默认"}");\n' +
      '    await Task.Delay(1);\n' +
      '    return url;\n' +
      '}\n\n' +
      '// 只指定需要的参数，顺序随意\n' +
      'await HttpGetAsync("https://api.x.com/v1");\n' +
      'await HttpGetAsync("https://api.x.com/v1", timeoutSeconds: 5, userAgent: "my-app/1.0");\n' +
      'await HttpGetAsync("https://api.x.com/v1", followRedirects: false, timeoutSeconds: 10);\n\n' +
      '// 注意：命名实参可以跳过中间参数，但不能打乱位置实参顺序\n' +
      '// HttpGetAsync("https://x.com", , true);   // ✘ 语法错误\n' +
      '// 应写作：HttpGetAsync("https://x.com", followRedirects: true);\n\n' +
      '// 与 params 结合\n' +
      'static void Log(string level, string message, params object?[] args)\n' +
      '{\n' +
      '    Console.WriteLine($"[{level}] " + string.Format(message, args));\n' +
      '}\n' +
      'Log("INFO", "用户 {0} 登录成功", "张三");\n' +
      'Log("ERROR", "请求失败：{0}", "超时");'
  },
  {
    id: 'alias-any-type',
    title: 'using 别名任意类型',
    version: 'C# 12.0',
    category: '语法糖',
    level: '进阶',
    summary: 'using Handlers = Dictionary<int, Func<...>>——别名不再限于命名空间。',
    detail: [
      'C# 12 起 using 别名可用于任意类型（含元组、泛型、指针、数组），大幅简化冗长泛型的书写。',
      '别名可以是元组类型甚至字面量：using Point = (int X, int Y); 之后 Point p = (3, 4);',
      '别名只在当前文件有效（除非 global using alias），不会污染程序集 API。'
    ],
    example:
      'using Handlers = System.Collections.Generic.Dictionary<\n' +
      '    string, System.Collections.Generic.List<System.Action>>;\n' +
      'using Point = (int X, int Y);\n' +
      'using Matrix = double[][];\n\n' +
      'Handlers handlers = new();\n' +
      'handlers["click"] = new() { () => Console.WriteLine("clicked") };\n' +
      'handlers["click"][0]();           // clicked\n\n' +
      'Point p = (3, 4);\n' +
      'Console.WriteLine(p.X);           // 3 —— 元组元素名保留\n\n' +
      'Matrix m = [[1, 2], [3, 4]];\n' +
      'Console.WriteLine(m[0][1]);        // 2'
    ,
    example2Title: '实战：别名简化复杂泛型与回调签名',
    example2:
      '// 别名的组合使用\n' +
      'using EventBus = System.Collections.Generic.Dictionary<\n' +
      '    string, System.Collections.Generic.List<System.Func<object?, System.Threading.Tasks.Task>>>;\n' +
      'using HttpResult = (int Status, string Body, bool Ok);\n\n' +
      '// 事件总线：类型别名让签名可读\n' +
      'EventBus bus = new();\n' +
      'bus["user.created"] = new()\n' +
      '{\n' +
      '    async _ => { Console.WriteLine("发通知"); await Task.CompletedTask; },\n' +
      '    async _ => { Console.WriteLine("写日志"); await Task.CompletedTask; },\n' +
      '};\n\n' +
      'await bus["user.created"][0](null);\n\n' +
      '// 元组别名 + 解构\n' +
      'HttpResult Get() => (200, """{"id":1}""", true);\n' +
      'var (status, body, ok) = Get();\n' +
      'Console.WriteLine($"{status} {ok} 长度 {body.Length}");  // 200 True 8\n\n' +
      '// 泛型嵌套别名\n' +
      'using StringMap = System.Collections.Generic.Dictionary<string, string>;\n' +
      'StringMap env = new() { ["HOME"] = "/root" };\n' +
      'Console.WriteLine(env["HOME"]);'
  }
];
