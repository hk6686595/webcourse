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
      '// 旧写法\n' +
      'var s = value as string;\n' +
      'if (s != null) Console.WriteLine(s.Length);\n\n' +
      '// 新写法：一步到位\n' +
      'if (value is string str) Console.WriteLine(str.Length);\n' +
      'if (value is not null) Console.WriteLine("非空");   // C# 9 否定模式\n' +
      'if (value is int n or long) { /* 整数族 */ }'
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
      'public static string Grade(int score) => score switch\n' +
      '{\n' +
      '    >= 90 => "优秀",\n' +
      '    >= 80 => "良好",\n' +
      '    >= 60 => "及格",\n' +
      '    >= 0  => "不及格",\n' +
      '    _     => throw new ArgumentOutOfRangeException(nameof(score))\n' +
      '};\n\n' +
      'public static decimal Toll(object vehicle) => vehicle switch\n' +
      '{\n' +
      '    Car { Passengers: 0 }        => 2.00m + 0.50m,   // 属性模式\n' +
      '    Car c when c.Passengers > 2  => 1.00m,            // when 子句\n' +
      '    Car                          => 2.00m,\n' +
      '    null                         => throw new ArgumentNullException(),\n' +
      '    _                            => 1.50m\n' +
      '};'
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
      '// 闰年判断\n' +
      'static bool IsLeap(int y) => y is { % 4: 0 } && (y % 100 != 0 || y % 400 == 0);\n\n' +
      'static string Check(int n) => n switch\n' +
      '{\n' +
      '    < 0             => "负数",\n' +
      '    0               => "零",\n' +
      '    > 0 and < 10    => "个位数",\n' +
      '    >= 10 and < 100 => "两位数",\n' +
      '    _               => "大数"\n' +
      '};\n\n' +
      '// 区间判断一目了然\n' +
      'bool pass = score is >= 60 and < 100;'
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
      'string Describe(int[] arr) => arr switch\n' +
      '{\n' +
      '    []                        => "空数组",\n' +
      '    [var single]              => $"单元素 {single}",\n' +
      '    [var first, .., var last] => $"首 {first} 尾 {last}",\n' +
      '    [0, ..]                   => "以 0 开头",\n' +
      '    _                         => "其他"\n' +
      '};\n\n' +
      'Describe(numbers);            // 首 1 尾 5'
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
      'string Region(Employee e) => e switch\n' +
      '{\n' +
      '    { Addr: { City: "北京" } }     => "华北",\n' +
      '    { Addr.City: "上海" or "杭州" } => "华东",\n' +
      '    { Addr: null, Age: >= 18 }      => "未知（成年）",\n' +
      '    _                               => "其他"\n' +
      '};\n\n' +
      '// 位置模式：解构后逐项匹配\n' +
      'string Describe(Employee e) => e switch\n' +
      '{\n' +
      '    (_, < 18, _)           => "未成年员工",\n' +
      '    var (_, _, addr) when addr?.City == "北京" => "北京员工",\n' +
      '    _                      => "普通员工"\n' +
      '};'
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
      'Console.WriteLine(@$"C:\\temp\\{name}.txt");   // @ 逐字 + $ 插值\n' +
      'Console.WriteLine($"{pi,-10:F3}|右对齐{pi,12:C}"); // 对齐与货币格式\n\n' +
      '// C# 11 原始字符串：无需转义引号与反斜杠\n' +
      'var json = """\n' +
      '    {\n' +
      '      "name": "张三",\n' +
      '      "tags": ["c#", ".net"],\n' +
      '      "path": "C:\\\\data"     ← 原样保留单反斜杠也行：C:\\data\n' +
      '    }\n' +
      '    """;\n\n' +
      '// 正则对比：旧 vs 新\n' +
      'var re1 = "\\\\d{3}-\\\\d{4}";        // 转义地狱\n' +
      'var re2 = """\\d{3}-\\d{4}""";      // 一目了然'
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
      'List<int>? list = null;\n\n' +
      'int count = list?.Count ?? 0;          // null 安全取值\n' +
      'list ??= new List<int>();              // 惰性初始化\n' +
      'list.Add(1);\n\n' +
      'string? city = user?.Address?.City;    // 链式短路\n' +
      'city ??= "未知城市";\n\n' +
      'int first = list?[0] ?? -1;            // 空条件索引\n' +
      'OnMessage?.Invoke(msg);                // 触发事件的经典姿势'
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
      'arr[^1];        // 5  最后一个\n' +
      'arr[^2..];      // 4 5\n' +
      'arr[1..4];      // 1 2 3\n' +
      'arr[..];        // 全部（副本）\n' +
      'arr[..^2];      // 除最后两个外\n\n' +
      'string url = "https://example.com/api";\n' +
      'url[..5];       // "https"\n' +
      'url[^3..];      // "api"\n\n' +
      '// Span 上零拷贝切片\n' +
      'ReadOnlySpan<char> span = url.AsSpan();\n' +
      'span[8..].ToString();   // "example.com/api"，无中间分配'
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
      '// Program.cs —— 就这么多，能直接跑\n' +
      'var builder = WebApplication.CreateBuilder(args);\n' +
      'var app = builder.Build();\n\n' +
      'app.MapGet("/", () => "Hello Minimal API!");\n' +
      'app.Run();\n\n' +
      '// GlobalUsings.cs\n' +
      'global using System.Collections.Generic;\n' +
      'global using System.Linq;\n' +
      'global using Xunit;\n\n' +
      '// csproj 方式批量全局导入\n' +
      '// <ItemGroup>\n' +
      '//   <Using Include="System.Diagnostics.CodeAnalysis" />\n' +
      '// </ItemGroup>'
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
      'StringBuilder sb = new();\n\n' +
      '// 传参同样适用\n' +
      'Task.Run(() => Process(new()));\n\n' +
      '// C# 12 集合表达式更进一步\n' +
      'int[] nums = [1, 2, 3];\n' +
      'List<int> more = [..nums, 4, 5];'
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
      'public static void Send(\n' +
      '    string to,\n' +
      '    string subject,\n' +
      '    string body = "",\n' +
      '    bool ccAdmin = false,\n' +
      '    int retries = 3)\n' +
      '{ /* ... */ }\n\n' +
      'Send("bob@x.com", "Hi");                        // 其余全用默认\n' +
      'Send(to: "bob@x.com", subject: "Hi", ccAdmin: true);\n' +
      'Send("bob@x.com", "Hi", retries: 5);            // 只覆盖一个'
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
      'Handlers h = new();\n' +
      'Point p = (3, 4);\n' +
      'Matrix m = [[1, 2], [3, 4]];\n\n' +
      'Console.WriteLine(p.X);   // 3 —— 元组元素名也保留了'
  }
];
