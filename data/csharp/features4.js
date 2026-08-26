// C# 特性详解 —— 第四部分：集合与迭代、异常与资源管理、性能与底层、特性与反射
module.exports = [
  // ==================== 集合与迭代 ====================
  {
    id: 'yield-iterators',
    title: '迭代器 yield return',
    version: 'C# 2.0',
    category: '集合与迭代',
    level: '进阶',
    summary: '惰性逐个产出元素：无限序列、按需读取大文件的标准写法。',
    detail: [
      '包含 yield return 的方法被编译器改写成状态机，调用它不会立即执行任何代码，foreach 时才逐段推进。',
      'yield break 提前结束序列；finally 块在枚举器 Dispose 时执行（即使中途 break）。',
      '参数校验陷阱：迭代器方法是惰性的，null 参数要抛异常必须拆成"立即校验 + 返回内部迭代器"两段（见本地函数条目）。',
      'yield return 只能出现在返回 IEnumerable<T>/IEnumerator<T>（或其非泛型版本）的方法中，不能用于 async 方法（异步用 IAsyncEnumerable）。'
    ],
    example:
      '// 无限序列\n' +
      'static IEnumerable<int> Naturals()\n' +
      '{\n' +
      '    for (int i = 0; ; i++) yield return i;\n' +
      '}\n\n' +
      'var first10 = Naturals().Take(10);   // 惰性 + Take 截断\n\n' +
      '// 逐行读取超大文件：内存占用恒定\n' +
      'static IEnumerable<string> ReadLines(string path)\n' +
      '{\n' +
      '    using var reader = new StreamReader(path);\n' +
      '    while (reader.ReadLine() is { } line)\n' +
      '        yield return line;\n' +
      '}\n\n' +
      '// 斐波那契序列\n' +
      'static IEnumerable<long> Fibonacci()\n' +
      '{\n' +
      '    long a = 0, b = 1;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        yield return a;\n' +
      '        (a, b) = (b, a + b);\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'collection-initializers',
    title: '集合类型选择与初始化器',
    version: 'C# 3.0 / 12.0',
    category: '集合与迭代',
    level: '入门',
    summary: '{ 1, 2, 3 } 初始化语法之外，更要选对数据结构：List/Dictionary/HashSet/Queue。',
    detail: [
      '对象初始化器 { Name = "x" } 与集合初始化器 { 1, 2 } 编译为一系列 Add 调用；字典可用索引初始化 [key] = value。',
      '选择依据：List 有序可重复随机访问；Dictionary<K,V> O(1) 键查找；HashSet 去重 + O(1) 包含判断；Queue/Stack 先进先出/后进先出。',
      '只读暴露用 IReadOnlyList<T>/IReadOnlyCollection<T> 接口，防止外部强转修改（防御性编程可用 AsReadOnly()）。',
      'FrozenDictionary/FrozenSet（.NET 8）针对只读场景优化查询速度，构建后不可变。'
    ],
    example:
      'var list = new List<int> { 1, 2, 3 };\n' +
      'var dict = new Dictionary<string, int>\n' +
      '{\n' +
      '    ["apple"] = 5,\n' +
      '    ["banana"] = 3,\n' +
      '};\n' +
      'var set = new HashSet<int> { 1, 1, 2 };   // 自动去重 → {1,2}\n\n' +
      '// .NET 8 冻结集合：读多写少的最佳选择\n' +
      'private static readonly FrozenDictionary<string, int> Codes =\n' +
      '    new Dictionary<string, int>\n' +
      '    {\n' +
      '        ["OK"] = 200, ["NF"] = 404\n' +
      '    }.ToFrozenDictionary();\n\n' +
      '// 对外只读暴露\n' +
      'public IReadOnlyList<Order> Orders => _orders;'
  },

  // ==================== 异常与资源管理 ====================
  {
    id: 'using-idisposable',
    title: 'IDisposable 与 using 声明',
    version: 'C# 8.0',
    category: '异常与资源管理',
    level: '入门',
    summary: '文件、连接、句柄等非托管资源的确定性释放——using 是唯一正解。',
    detail: [
      'GC 不负责及时释放非托管资源（文件句柄、数据库连接），实现 IDisposable 的类型必须显式释放。',
      'using 声明（C# 8）：using var f = ...; 在所在作用域结束时自动 Dispose，比传统 using 块少一层缩进。',
      '标准 Dispose 模式：protected virtual Dispose(bool)、GC.SuppressFinalize 防止重复清理。',
      'IAsyncDisposable 与 await using 配套处理异步释放（如网络流）。'
    ],
    notes: [
      'Dispose 后再使用对象通常抛 ObjectDisposedException；不要在并发场景下依赖此行为。',
      'HttpClient、IServiceProvider 等长生命周期对象不要包在 using 里。'
    ],
    example:
      '// 传统 using 块\n' +
      'using (var conn = new SqlConnection(cs))\n' +
      '{\n' +
      '    // ...\n' +
      '}   // 自动 Dispose\n\n' +
      '// C# 8 using 声明：作用域结束时释放\n' +
      'public string ReadConfig(string path)\n' +
      '{\n' +
      '    using var reader = new StreamReader(path);\n' +
      '    return reader.ReadToEnd();\n' +
      '}   // 这里自动释放\n\n' +
      '// 多资源一次声明\n' +
      'using var input = File.OpenRead(src);\n' +
      'using var output = File.Create(dst);\n' +
      'await input.CopyToAsync(output);\n\n' +
      '// 标准 Dispose 模式骨架\n' +
      'public class Res : IDisposable\n' +
      '{\n' +
      '    private bool _disposed;\n' +
      '    public void Dispose()\n' +
      '    {\n' +
      '        Dispose(true);\n' +
      '        GC.SuppressFinalize(this);\n' +
      '    }\n' +
      '    protected virtual void Dispose(bool disposing)\n' +
      '    {\n' +
      '        if (_disposed) return;\n' +
      '        if (disposing) { /* 托管资源 */ }\n' +
      '        /* 非托管资源 */\n' +
      '        _disposed = true;\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'exception-handling',
    title: '异常处理最佳实践',
    version: 'C# 各版本',
    category: '异常与资源管理',
    level: '进阶',
    summary: 'throw; 与 throw ex; 的区别、异常过滤器 when、以及什么时候不该 catch。',
    detail: [
      '重新抛出必须用裸 throw;（保留原始堆栈）；throw ex; 会重置堆栈丢失现场。',
      'catch (Exception ex) when (过滤器) 只在条件成立时捕获，否则继续向上传播——堆栈完整保留，比 catch 后 if 再 throw 更高效。',
      '"允许失败"原则（EAFP）：不要用 try/catch 做流程控制；能用 TryParse/TryGetValue 就不用异常。',
      '捕获具体异常类型而非 Exception 大网；吞掉异常至少要记日志。自定义异常继承 Exception 并提供三个标准构造函数。'
    ],
    example:
      'try\n' +
      '{\n' +
      '    ProcessOrder(order);\n' +
      '}\n' +
      'catch (HttpRequestException ex) when (ex.StatusCode >= HttpStatusCode.InternalServerError)\n' +
      '{\n' +
      '    _logger.LogError(ex, "服务端错误");\n' +
      '    throw;                       // ✔ 裸抛出保留堆栈\n' +
      '}\n' +
      'catch (OperationCanceledException)\n' +
      '{\n' +
      '    // 取消不是错误，静默或记录即可\n' +
      '}\n\n' +
      '// 自定义异常\n' +
      'public class InsufficientBalanceException(decimal shortfall)\n' +
      '    : Exception($"余额不足，还差 {shortfall:C}")\n' +
      '{\n' +
      '    public decimal Shortfall { get; } = shortfall;\n' +
      '}\n\n' +
      '// 避免 catch 做流程控制\n' +
      'if (int.TryParse(input, out var n)) Use(n);   // ✔\n' +
      '// 反例：try { n = int.Parse(input); } catch {}'
  },

  // ==================== 性能与底层 ====================
  {
    id: 'struct-ref-struct',
    title: 'struct / ref struct / Span&lt;T&gt;',
    version: 'C# 7.2+',
    category: '性能与底层',
    level: '高级',
    summary: '栈分配、免 GC 的连续内存视图，高性能 .NET 的根基。',
    detail: [
      'struct 是值类型，赋值即拷贝；readonly struct 保证不可变并消除防御性拷贝；record struct 兼具值语义与记录便利。',
      'ref struct 只能活在栈上（如 Span<T>），不能装箱、不能作为类字段、不能跨 await/yield——这是编译器强制的安全保证。',
      'Span<T>/ReadOnlySpan<T> 表示一段连续内存（数组/字符串/本机内存）的安全视图，切片零分配零拷贝。',
      'stackalloc 在栈上分配小块缓冲区，配合 Span 安全使用；过大会触发 StackOverflow，一般限制几百元素以内。'
    ],
    notes: [
      '结构体越大拷贝成本越高；超过 16-32 字节且频繁传参时考虑 in 参数或改用 class。',
      'string.Split 会分配数组；只需遍历时用 text.SpanSplit(separator)（.NET 8）更省内存。'
    ],
    example:
      'public readonly struct Rgb(byte r, byte g, byte b)\n' +
      '{\n' +
      '    public byte R { get; } = r;\n' +
      '    public byte G { get; } = g;\n' +
      '    public byte B { get; } = b;\n' +
      '}\n\n' +
      'static int CountDigits(ReadOnlySpan<char> text)\n' +
      '{\n' +
      '    int n = 0;\n' +
      '    foreach (char c in text) if (char.IsAsciiDigit(c)) n++;\n' +
      '    return n;\n' +
      '}\n\n' +
      'CountDigits("abc123");               // 3，全程无堆分配\n' +
      'Span<char> buf = stackalloc char[16]; // 栈上缓冲区\n' +
      'buf[0] = \'A\';'
  },
  {
    id: 'in-params',
    title: 'in 参数 / ref 返回 / out',
    version: 'C# 7.0+',
    category: '性能与底层',
    level: '高级',
    summary: '三种引用传递语义：out 必须赋值、ref 双向、in 只读传入避免大结构体拷贝。',
    detail: [
      '对大 struct（如 Matrix4x4，64 字节）按 in 传递可避免每次调用的字节级复制；编译器对 in 参数做只读保护。',
      'ref 返回值与 ref 局部变量允许直接"别名"数组元素或内存位置，实现原地修改，无需下标来回寻址。',
      'readonly struct 的成员经 in 传递无额外开销；可变 struct 经 in 传递时编译器会插入防御性拷贝，反而更慢。'
    ],
    example:
      'static bool TryParse(string s, out int result)\n' +
      '{\n' +
      '    return int.TryParse(s, out result);   // out：必须先赋值才能返回\n' +
      '}\n\n' +
      'static double Norm(in Vector3 v) =>     // in：只读引用，免拷贝\n' +
      '    Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);\n\n' +
      '// ref 返回与 ref 局部变量\n' +
      'static ref int Max(ref int a, ref int b) => ref (a > b ? ref a : ref b);\n\n' +
      'int[] xs = { 1, 99, 3 };\n' +
      'ref int slot = ref xs[1];\n' +
      'slot = 42;                              // xs[1] 变成 42\n' +
      'ref int biggest = ref Max(ref xs[0], ref xs[1]);'
  },
  {
    id: 'collection-expressions',
    title: '集合表达式 [...] 与 spread',
    version: 'C# 12.0',
    category: '性能与底层',
    level: '进阶',
    summary: '[1, 2, 3]、[..other, tail] 统一初始化数组/List/Span 的一切。',
    detail: [
      '集合表达式依据目标类型生成最优代码：数组长度已知时精确分配一次，List 则走 AddRange 快路径。',
      '.. 展开（spread）拼接集合；嵌套 [][] 构造锯齿数组也支持。',
      'params 集合（C# 13）让 params 参数可以声明为 Span 类型，调用点直接栈分配，进一步消除数组分配。'
    ],
    example:
      'int[] a = [1, 2, 3];\n' +
      'int[] b = [0, ..a, 4];                  // 0 1 2 3 4\n' +
      'List<string> names = ["Tom", "Jerry"];\n' +
      'Span<byte> header = [0xEF, 0xBB, 0xBF];\n\n' +
      'int[][] grid = [[1, 2], [3, 4], [5, 6]];\n\n' +
      'static int Sum(ReadOnlySpan<int> s) { int t = 0; foreach (var x in s) t += x; return t; }\n' +
      'Sum([1, 2, 3, 4]);                      // 直接内联，无堆分配\n\n' +
      '// C# 13：params Span\n' +
      'static int Max(params ReadOnlySpan<int> values) { /* ... */ return 0; }\n' +
      'Max(3, 1, 4, 1, 5);                     // 无数组分配'
  },
  {
    id: 'arraypool',
    title: 'ArrayPool 对象池复用',
    version: '.NET Core 2.1+',
    category: '性能与底层',
    level: '高级',
    summary: '高频临时数组从池里租借归还，消除 GC 压力的标准手法。',
    detail: [
      'ArrayPool<T>.Shared.Rent(minLength) 租借数组（长度可能大于请求值），Return 归还前如含敏感数据需 clearArray: true 清零。',
      '租借的数组内容是脏数据，使用前务必自行初始化。',
      '类似思路还有 ObjectPool<T>（Microsoft.Extensions.ObjectPool）、MemoryPool<T>、RecyclableMemoryStream。',
      '典型场景：每请求缓冲区、编解码中间 buffer、Socket 收发包。低频路径不必池化，反而增加复杂度。'
    ],
    example:
      'public byte[] Process(int size)\n' +
      '{\n' +
      '    var pool = ArrayPool<byte>.Shared;\n' +
      '    byte[] buffer = pool.Rent(size);       // 租借 ≥ size 的数组\n' +
      '    try\n' +
      '    {\n' +
      '        Array.Clear(buffer, 0, size);      // 内容是脏的，先清零\n' +
      '        // ... 使用 buffer.AsSpan(0, size) ...\n' +
      '        return buffer[..size].ToArray();   // 只复制实际长度\n' +
      '    }\n' +
      '    finally\n' +
      '    {\n' +
      '        pool.Return(buffer);               // 必须归还（放 finally）\n' +
      '    }\n' +
      '}'
  },

  // ==================== 特性与反射 ====================
  {
    id: 'attributes-reflection',
    title: 'Attribute 特性标注与反射读取',
    version: 'C# 1.0',
    category: '特性与反射',
    level: '进阶',
    summary: '[Obsolete]、自定义特性 + GetCustomAttributes：把元数据贴到代码上。',
    detail: [
      'Attribute 是编译进程序集的元数据；运行时通过反射读取，驱动框架行为（路由、验证、序列化、DI 注册都靠它）。',
      '自定义特性继承 Attribute 类，用 [AttributeUsage] 限定可应用目标与是否允许多次叠加。',
      '反射有性能成本，热路径应缓存 GetCustomAttribute 结果；源码生成器是反射的高性能替代方案。',
      '[Obsolete("说明", true)] 第二参数为 true 时变成编译错误，可用于 API 弃用的强制迁移。'
    ],
    example:
      '[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]\n' +
      'class BenchmarkAttribute : Attribute\n' +
      '{\n' +
      '    public int Iterations { get; set; } = 1000;\n' +
      '}\n\n' +
      'class Runner\n' +
      '{\n' +
      '    [Benchmark(Iterations = 5000)]\n' +
      '    public void FastPath() { /* ... */ }\n' +
      '\n' +
      '    [Obsolete("请改用 FastPathV2", false)]\n' +
      '    public void Legacy() { }\n' +
      '}\n\n' +
      '// 反射扫描并执行所有标注了 [Benchmark] 的方法\n' +
      'foreach (var m in typeof(Runner).GetMethods())\n' +
      '{\n' +
      '    var attr = m.GetCustomAttribute<BenchmarkAttribute>();\n' +
      '    if (attr == null) continue;\n' +
      '    Console.WriteLine($"{m.Name} x{attr.Iterations}");\n' +
      '    for (int i = 0; i < attr.Iterations; i++) m.Invoke(new Runner(), null);\n' +
      '}'
  }
];
