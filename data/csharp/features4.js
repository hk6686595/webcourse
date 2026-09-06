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
      '// 无限序列：永不真正存内存，Take 决定取多少\n' +
      'static IEnumerable<int> Naturals()\n' +
      '{\n' +
      '    for (int i = 0; ; i++) yield return i;\n' +
      '}\n' +
      'foreach (var n in Naturals().Take(10))\n' +
      '    Console.Write(n + " ");   // 0 1 2 3 4 5 6 7 8 9\n\n' +
      '// 逐行读取超大文件：内存占用恒定\n' +
      'static IEnumerable<string> ReadLines(string path)\n' +
      '{\n' +
      '    using var reader = new StreamReader(path);\n' +
      '    while (reader.ReadLine() is { } line)\n' +
      '        yield return line;\n' +
      '}\n\n' +
      '// 斐波那契序列（惰性无限）\n' +
      'static IEnumerable<long> Fibonacci()\n' +
      '{\n' +
      '    long a = 0, b = 1;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        yield return a;\n' +
      '        (a, b) = (b, a + b);\n' +
      '    }\n' +
      '}\n' +
      'Console.WriteLine(string.Join(",", Fibonacci().Take(10)));  // 0,1,1,2,3,5,8,13,21,34'
    ,
    example2Title: 'yield break 与 foreach 中途 break 的清理',
    example2:
      '// yield break 提前结束；foreach 的 break 会触发 finally/Dispose\n' +
      'static IEnumerable<int> Countdown(int from)\n' +
      '{\n' +
      '    try\n' +
      '    {\n' +
      '        for (int i = from; i > 0; i--)\n' +
      '        {\n' +
      '            if (i == 3) yield break;   // 到 3 直接结束\n' +
      '            yield return i;\n' +
      '        }\n' +
      '    }\n' +
      '    finally\n' +
      '    {\n' +
      '        Console.WriteLine("枚举结束，执行清理");\n' +
      '    }\n' +
      '}\n\n' +
      'foreach (var n in Countdown(5))\n' +
      '{\n' +
      '    Console.WriteLine(n);             // 5 4\n' +
      '    if (n == 4) break;               // 触发 finally\n' +
      '}\n\n' +
      '// 惰性参数校验陷阱：必须拆两段\n' +
      'static IEnumerable<int> Positive(IEnumerable<int> src)\n' +
      '{\n' +
      '    if (src == null) throw new ArgumentNullException(nameof(src)); // 调用即校验\n' +
      '    return Impl();\n' +
      '    IEnumerable<int> Impl()\n' +
      '    {\n' +
      '        foreach (var n in src) if (n > 0) yield return n;\n' +
      '    }\n' +
      '}\n' +
      '// Positive(null) 立即抛异常，而不是等到遍历时才抛'
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
      'var set = new HashSet<int> { 1, 1, 2 };   // 自动去重 -> {1,2}\n' +
      'Console.WriteLine(set.Contains(1));        // True\n\n' +
      '// .NET 8 冻结集合：读多写少的最佳选择\n' +
      'private static readonly FrozenDictionary<string, int> Codes =\n' +
      '    new Dictionary<string, int> { ["OK"] = 200, ["NF"] = 404 }.ToFrozenDictionary();\n' +
      'Console.WriteLine(Codes["OK"]);            // 200（构建后不可变、查询更快）\n\n' +
      '// 对外只读暴露（防御性）\n' +
      'private static readonly List<Order> _orders = new();\n' +
      'public IReadOnlyList<Order> Orders => _orders.AsReadOnly();\n\n' +
      'record Order(int Id);'
    ,
    example2Title: 'Queue / Stack / SortedSet 等结构的选择',
    example2:
      '// 队列：先进先出（如任务调度）\n' +
      'var queue = new Queue<string>();\n' +
      'queue.Enqueue("A"); queue.Enqueue("B");\n' +
      'Console.WriteLine(queue.Dequeue());        // A\n\n' +
      '// 栈：后进先出（如表达式求值）\n' +
      'var stack = new Stack<int>();\n' +
      'stack.Push(1); stack.Push(2);\n' +
      'Console.WriteLine(stack.Pop());            // 2\n\n' +
      '// SortedSet：自动去重 + 排序\n' +
      'var sorted = new SortedSet<int> { 3, 1, 2, 1 };\n' +
      'Console.WriteLine(string.Join(",", sorted)); // 1,2,3\n\n' +
      '// 集合运算：交/并/差\n' +
      'var a = new HashSet<int> { 1, 2, 3 };\n' +
      'var b = new HashSet<int> { 2, 3, 4 };\n' +
      'a.IntersectWith(b);\n' +
      'Console.WriteLine(string.Join(",", a));    // 2,3'
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
      '    conn.Open();\n' +
      '    // ... 使用连接\n' +
      '}   // 自动 Dispose，连接归还池\n\n' +
      '// C# 8 using 声明：作用域结束即释放，少一层缩进\n' +
      'public string ReadConfig(string path)\n' +
      '{\n' +
      '    using var reader = new StreamReader(path);\n' +
      '    return reader.ReadToEnd();\n' +
      '}   // 这里自动释放\n\n' +
      '// 多资源一次声明\n' +
      'using var input = File.OpenRead("src.txt");\n' +
      'using var output = File.Create("dst.txt");\n' +
      'input.CopyTo(output);\n\n' +
      '// 标准 Dispose 模式骨架\n' +
      'public class Resource : IDisposable\n' +
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
      '        if (disposing) { /* 释放托管资源 */ }\n' +
      '        /* 释放非托管资源 */\n' +
      '        _disposed = true;\n' +
      '    }\n' +
      '}\n\n' +
      '// 异步释放\n' +
      'await using var stream = await OpenAsync();'
    ,
    example2Title: '实战：完整自定义资源类的 Dispose 实现',
    example2:
      '// 同时支持同步与异步释放的资源类\n' +
      'public sealed class TempFile : IDisposable, IAsyncDisposable\n' +
      '{\n' +
      '    private readonly string _path;\n' +
      '    private FileStream? _stream;\n' +
      '    private bool _disposed;\n\n' +
      '    public TempFile(string prefix)\n' +
      '    {\n' +
      '        _path = Path.GetTempFileName();\n' +
      '        _stream = File.Create(_path);\n' +
      '        Console.WriteLine($"已创建临时文件：{_path}");\n' +
      '    }\n\n' +
      '    public void Write(string text)\n' +
      '    {\n' +
      '        ObjectDisposedException.ThrowIf(_disposed, this);\n' +
      '        using var w = new StreamWriter(_stream, leaveOpen: true);\n' +
      '        w.Write(text);\n' +
      '    }\n\n' +
      '    public void Dispose()\n' +
      '    {\n' +
      '        if (_disposed) return;\n' +
      '        _stream?.Dispose();\n' +
      '        File.Delete(_path);\n' +
      '        _disposed = true;\n' +
      '        Console.WriteLine("同步释放完成");\n' +
      '        GC.SuppressFinalize(this);\n' +
      '    }\n\n' +
      '    public async ValueTask DisposeAsync()\n' +
      '    {\n' +
      '        if (_disposed) return;\n' +
      '        if (_stream != null) await _stream.DisposeAsync();\n' +
      '        File.Delete(_path);\n' +
      '        _disposed = true;\n' +
      '        Console.WriteLine("异步释放完成");\n' +
      '        GC.SuppressFinalize(this);\n' +
      '    }\n' +
      '}\n\n' +
      '// 传统 using 块：块结束自动释放\n' +
      'using (var f = new TempFile("log"))\n' +
      '{\n' +
      '    f.Write("hello");\n' +
      '}   // 同步释放完成\n\n' +
      '// 异步释放\n' +
      'await using (var f = new TempFile("log"))\n' +
      '{\n' +
      '    f.Write("world");\n' +
      '}   // 异步释放完成\n\n' +
      '// 释放后禁止使用\n' +
      'using var f2 = new TempFile("x");\n' +
      'f2.Write("a");\n' +
      '// f2.Write("b");  // ✘ ObjectDisposedException'
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
      'static void Process(int orderId)\n' +
      '{\n' +
      '    try\n' +
      '    {\n' +
      '        Validate(orderId);\n' +
      '    }\n' +
      '    catch (HttpRequestException ex) when (ex.StatusCode >= System.Net.HttpStatusCode.InternalServerError)\n' +
      '    {\n' +
      '        Console.WriteLine($"服务端错误：{ex.Message}");\n' +
      '        throw;                       // ✔ 裸抛出，保留完整堆栈\n' +
      '    }\n' +
      '    catch (OperationCanceledException)\n' +
      '    {\n' +
      '        Console.WriteLine("请求被取消");   // 取消不是错误，静默即可\n' +
      '    }\n' +
      '}\n\n' +
      '// 自定义异常（标准三构造函数）\n' +
      'public class InsufficientBalanceException(decimal shortfall)\n' +
      '    : Exception($"余额不足，还差 {shortfall:C}")\n' +
      '{\n' +
      '    public decimal Shortfall { get; } = shortfall;\n' +
      '}\n\n' +
      '// 避免用异常做流程控制：优先 TryParse\n' +
      'if (int.TryParse("123", out var n)) Console.WriteLine($"解析成功：{n}");\n' +
      '// 反例：try { n = int.Parse(input); } catch { }\n\n' +
      'static void Validate(int id) => throw new InsufficientBalanceException(50);'
    ,
    example2Title: '实战：重试策略 + 异常筛选的健壮调用',
    example2:
      '// 稳定的重试封装：区分“可重试”与“致命”错误\n' +
      'static async Task<T> RetryAsync<T>(Func<Task<T>> action, int maxAttempts = 3)\n' +
      '{\n' +
      '    int attempt = 0;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        attempt++;\n' +
      '        try\n' +
      '        {\n' +
      '            return await action();\n' +
      '        }\n' +
      '        catch (Exception ex) when (IsRetryable(ex) && attempt < maxAttempts)\n' +
      '        {\n' +
      '            Console.WriteLine($"第 {attempt} 次失败（{ex.Message}），重试中…");\n' +
      '            await Task.Delay(attempt * 500);\n' +
      '        }\n' +
      '        // 不可重试或次数用尽：原样上抛（保留堆栈）\n' +
      '    }\n\n' +
      '    static bool IsRetryable(Exception ex) => ex switch\n' +
      '    {\n' +
      '        HttpRequestException { StatusCode: >= HttpStatusCode.InternalServerError } => true,\n' +
      '        TimeoutException => true,\n' +
      '        IOException => true,\n' +
      '        _ => false\n' +
      '    };\n' +
      '}\n\n' +
      '// 聚合异常：包一层再抛，调用方统一处理\n' +
      'try\n' +
      '{\n' +
      '    try { throw new InvalidOperationException("内部错误"); }\n' +
      '    catch (Exception ex) when (ex.Message.Contains("内部"))\n' +
      '    {\n' +
      '        throw new AggregateException("外层包装", ex);\n' +
      '    }\n' +
      '}\n' +
      'catch (AggregateException agg)\n' +
      '{\n' +
      '    Console.WriteLine($"聚合异常，内部 {agg.InnerExceptions.Count} 个");\n' +
      '}\n\n' +
      '// 自定义异常携带结构化数据\n' +
      'public class InsufficientBalanceException(decimal shortfall)\n' +
      '    : Exception($"余额不足，还差 {shortfall:C}")\n' +
      '{\n' +
      '    public decimal Shortfall { get; } = shortfall;\n' +
      '}\n\n' +
      'try { throw new InsufficientBalanceException(120); }\n' +
      'catch (InsufficientBalanceException ex)\n' +
      '{\n' +
      '    Console.WriteLine($"余额不足，还差 {ex.Shortfall:C}");   // 还差 ¥120.00\n' +
      '}'
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
      '// readonly struct：不可变 + 消除防御性拷贝\n' +
      'public readonly struct Rgb(byte r, byte g, byte b)\n' +
      '{\n' +
      '    public byte R { get; } = r;\n' +
      '    public byte G { get; } = g;\n' +
      '    public byte B { get; } = b;\n' +
      '}\n\n' +
      '// Span：连续内存的安全视图，切片零分配\n' +
      'static int CountDigits(ReadOnlySpan<char> text)\n' +
      '{\n' +
      '    int n = 0;\n' +
      '    foreach (char c in text)\n' +
      '        if (char.IsAsciiDigit(c)) n++;\n' +
      '    return n;\n' +
      '}\n\n' +
      '// stackalloc：栈上缓冲区，配合 Span 使用\n' +
      'Span<char> buf = stackalloc char[16];\n' +
      'buf[0] = \'A\'; buf[1] = \'B\';\n' +
      'Console.WriteLine(CountDigits("abc123"));   // 3，全程无堆分配\n' +
      'Console.WriteLine(buf[0]);                   // A\n\n' +
      '// 切片零拷贝\n' +
      'ReadOnlySpan<char> hello = "Hello World".AsSpan(0, 5);\n' +
      'Console.WriteLine(hello.ToString());         // Hello'
    ,
    example2Title: '实战：Span 高性能解析 CSV 行',
    example2:
      '// 零分配解析 CSV 行：直接用 Span 切片\n' +
      'static int CountCsvFields(ReadOnlySpan<char> line)\n' +
      '{\n' +
      '    int fields = 1;\n' +
      '    bool inQuotes = false;\n' +
      '    foreach (char c in line)\n' +
      '    {\n' +
      '        if (c == \'\"\') inQuotes = !inQuotes;\n' +
      '        else if (c == \',\' && !inQuotes) fields++;\n' +
      '    }\n' +
      '    return fields;\n' +
      '}\n\n' +
      '// 逐字段提取（避免 string.Split 分配数组）\n' +
      'static void SplitCsvLine(ReadOnlySpan<char> line)\n' +
      '{\n' +
      '    int start = 0;\n' +
      '    for (int i = 0; i <= line.Length; i++)\n' +
      '    {\n' +
      '        if (i == line.Length || line[i] == \',\')\n' +
      '        {\n' +
      '            var field = line[start..i].Trim();\n' +
      '            Console.WriteLine($"字段: {field.ToString()}");\n' +
      '            start = i + 1;\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      '// 大文件逐行流式处理（每行都是 Span 切片）\n' +
      'using var reader = File.OpenText("data.csv");\n' +
      'string? line;\n' +
      'int total = 0;\n' +
      'while ((line = reader.ReadLine()) != null)\n' +
      '    total += CountCsvFields(line.AsSpan());\n' +
      'Console.WriteLine($"共 {total} 个字段");\n\n' +
      '// 演示\n' +
      'SplitCsvLine("张三,25,北京".AsSpan());\n' +
      '// 字段: 张三 / 字段: 25 / 字段: 北京\n' +
      'Console.WriteLine(CountCsvFields("\"a,b\",c,d".AsSpan()));   // 3'
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
      '// out：必须赋值才能返回\n' +
      'static bool TryParse(string s, out int result) => int.TryParse(s, out result);\n' +
      'if (TryParse("42", out var n)) Console.WriteLine(n);  // 42\n\n' +
      '// in：只读引用传递，避免大结构体拷贝\n' +
      'readonly struct Vector3 { public double X { get; } public double Y { get; } public double Z { get; } public Vector3(double x, double y, double z) : this() { X = x; Y = y; Z = z; } }\n' +
      'static double Norm(in Vector3 v) =>\n' +
      '    Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);\n' +
      'var v = new Vector3(3, 4, 0);\n' +
      'Console.WriteLine(Norm(v));       // 5（无拷贝）\n\n' +
      '// ref 返回 + ref 局部变量：原地修改数组元素\n' +
      'static ref int Max(ref int a, ref int b) => ref (a > b ? ref a : ref b);\n' +
      'int[] xs = { 1, 99, 3 };\n' +
      'ref int slot = ref xs[1];\n' +
      'slot = 42;                          // xs[1] 变成 42\n' +
      'ref int biggest = ref Max(ref xs[0], ref xs[1]);\n' +
      'biggest = 100;                      // 通过别名直接改原数组\n' +
      'Console.WriteLine(string.Join(",", xs)); // 1,100,3'
    ,
    example2Title: '实战：矩阵运算中的 in / ref / readonly struct 组合',
    example2:
      '// 8 字节小结构体：in 传参避免拷贝\n' +
      'readonly struct Point2D\n' +
      '{\n' +
      '    public double X { get; }\n' +
      '    public double Y { get; }\n' +
      '    public Point2D(double x, double y) { X = x; Y = y; }\n' +
      '}\n\n' +
      'static double Distance(in Point2D a, in Point2D b)\n' +
      '{\n' +
      '    double dx = a.X - b.X, dy = a.Y - b.Y;\n' +
      '    return Math.Sqrt(dx * dx + dy * dy);\n' +
      '}\n\n' +
      '// 大结构体（64 字节）：in 传参收益明显\n' +
      'readonly struct Matrix4x4\n' +
      '{\n' +
      '    public double M11, M12, M13, M14;\n' +
      '    public double M21, M22, M23, M24;\n' +
      '    public double M31, M32, M33, M34;\n' +
      '    public double M41, M42, M43, M44;\n\n' +
      '    public Matrix4x4(double v) : this() { M11 = M22 = M33 = M44 = v; }\n\n' +
      '    // in 参数：只读引用，避免整块拷贝\n' +
      '    public static Matrix4x4 Multiply(in Matrix4x4 a, in Matrix4x4 b)\n' +
      '    {\n' +
      '        var r = new Matrix4x4();\n' +
      '        r.M11 = a.M11 * b.M11 + a.M12 * b.M21 + a.M13 * b.M31 + a.M14 * b.M41;\n' +
      '        r.M22 = a.M21 * b.M12 + a.M22 * b.M22 + a.M23 * b.M32 + a.M24 * b.M42;\n' +
      '        // ...（实际 16 项，此处省略）\n' +
      '        return r;\n' +
      '    }\n' +
      '}\n\n' +
      '// ref 返回 + ref 局部：直接操作矩阵对角线元素\n' +
      'static ref double Diag(ref Matrix4x4 m, int i) => ref (i switch\n' +
      '{\n' +
      '    0 => ref m.M11, 1 => ref m.M22, 2 => ref m.M33, _ => ref m.M44\n' +
      '});\n\n' +
      'var m = new Matrix4x4(1);\n' +
      'ref double d = ref Diag(ref m, 1);\n' +
      'd = 99;                               // 直接改 m.M22\n' +
      'Console.WriteLine(m.M22);             // 99\n\n' +
      '// out：多返回值惯用法\n' +
      'static bool TryDivide(double a, double b, out double result)\n' +
      '{\n' +
      '    if (Math.Abs(b) < 1e-12) { result = 0; return false; }\n' +
      '    result = a / b;\n' +
      '    return true;\n' +
      '}\n' +
      'if (TryDivide(10, 3, out var q)) Console.WriteLine(q);   // 3.333...'
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
      'Span<byte> header = [0xEF, 0xBB, 0xBF];\n' +
      'Console.WriteLine(string.Join(",", b));  // 0,1,2,3,4\n' +
      'Console.WriteLine(string.Join(",", names)); // Tom,Jerry\n\n' +
      '// 锯齿数组（嵌套集合表达式）\n' +
      'int[][] grid = [[1, 2], [3, 4], [5, 6]];\n' +
      'Console.WriteLine(grid[1][1]);          // 4\n\n' +
      '// spread 与 span 配合：零堆分配的内联初始化\n' +
      'static int Sum(ReadOnlySpan<int> s)\n' +
      '{\n' +
      '    int t = 0;\n' +
      '    foreach (var x in s) t += x;\n' +
      '    return t;\n' +
      '}\n' +
      'Console.WriteLine(Sum([1, 2, 3, 4]));    // 10\n\n' +
      '// C# 13：params Span（调用点直接栈分配，无数组分配）\n' +
      'static int Max(params ReadOnlySpan<int> values)\n' +
      '{\n' +
      '    int m = values[0];\n' +
      '    foreach (var x in values) if (x > m) m = x;\n' +
      '    return m;\n' +
      '}\n' +
      'Console.WriteLine(Max(3, 1, 4, 1, 5));   // 5'
    ,
    example2Title: '实战：集合表达式在字典与条件展开中的妙用',
    example2:
      '// ?? 右侧直接用集合表达式\n' +
      'static int Count(IEnumerable<int>? src = null)\n' +
      '    => (src ?? [1, 2, 3]).Count();\n' +
      'Console.WriteLine(Count());              // 3\n\n' +
      '// 构造并合并字典\n' +
      'var cfg = new Dictionary<string, int>\n' +
      '{\n' +
      '    ["retries"] = 3,\n' +
      '    ["timeout"] = 30,\n' +
      '};\n' +
      'var merged = new Dictionary<string, int>(cfg)\n' +
      '{\n' +
      '    ["timeout"] = 60,                    // 覆盖\n' +
      '    ["verbose"] = 1,                     // 新增\n' +
      '};\n' +
      'Console.WriteLine(merged["timeout"]);    // 60\n\n' +
      '// 返回集合表达式\n' +
      'static int[] FirstN(int n) => [.. Enumerable.Range(1, n)];\n' +
      'Console.WriteLine(string.Join(",", FirstN(5)));   // 1,2,3,4,5\n\n' +
      '// 条件展开：按开关注入参数\n' +
      'bool debug = true;\n' +
      'List<string> args = ["--prod", .. (debug ? ["--debug", "--trace"] : [])];\n' +
      'Console.WriteLine(string.Join(" ", args));   // --prod --debug --trace\n\n' +
      '// 与 Span 结合：零堆分配区间判断\n' +
      'static bool InRange(ReadOnlySpan<int> s, int lo, int hi)\n' +
      '{\n' +
      '    foreach (var v in s) if (v < lo || v > hi) return false;\n' +
      '    return true;\n' +
      '}\n' +
      'Console.WriteLine(InRange([5, 6, 7], 1, 10));   // True'
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
      '    byte[] buffer = pool.Rent(size);       // 租借 ≥ size 的数组（长度可能更大）\n' +
      '    try\n' +
      '    {\n' +
      '        // 内容是脏的，先清零再使用\n' +
      '        Array.Clear(buffer, 0, size);\n' +
      '        Span<byte> slice = buffer.AsSpan(0, size);\n' +
      '        for (int i = 0; i < size; i++) slice[i] = (byte)(i & 0xFF);\n' +
      '        // 只复制实际长度，避免把借来的多余容量带出去\n' +
      '        return slice.ToArray();\n' +
      '    }\n' +
      '    finally\n' +
      '    {\n' +
      '        pool.Return(buffer);               // 必须归还（放 finally，防止异常泄漏）\n' +
      '    }\n' +
      '}\n\n' +
      'var result = Process(100);\n' +
      'Console.WriteLine($"长度 {result.Length}，首字节 {result[0]}");'
    ,
    example2Title: '实战：流复制与池化复用的完整演示',
    example2:
      '// 把流复制到目标（池化缓冲，避免每请求分配 8KB）\n' +
      'public static void CopyStream(Stream src, Stream dst)\n' +
      '{\n' +
      '    byte[] buffer = ArrayPool<byte>.Shared.Rent(8192);\n' +
      '    try\n' +
      '    {\n' +
      '        int read;\n' +
      '        while ((read = src.Read(buffer, 0, buffer.Length)) > 0)\n' +
      '            dst.Write(buffer, 0, read);\n' +
      '    }\n' +
      '    finally\n' +
      '    {\n' +
      '        ArrayPool<byte>.Shared.Return(buffer);\n' +
      '    }\n' +
      '}\n\n' +
      '// 统计池命中：Rent 返回的数组可能复用\n' +
      'var pool = ArrayPool<int>.Shared;\n' +
      'int[] a = pool.Rent(100);\n' +
      'int[] b = pool.Rent(100);\n' +
      'Console.WriteLine($"数组 a 容量 {a.Length}，b 容量 {b.Length}");  // 都 ≥100\n' +
      'pool.Return(a);\n' +
      'int[] c = pool.Rent(100);       // 很可能复用刚归还的 a\n' +
      'Console.WriteLine(ReferenceEquals(a, c));   // 可能 True（池内复用）\n\n' +
      '// 敏感数据归还前清零\n' +
      'byte[] secret = pool.Rent(16);\n' +
      'try { secret.AsSpan(0, 16).Fill(0xAB); }\n' +
      'finally { pool.Return(secret, clearArray: true); }\n' +
      'Console.WriteLine("已安全归还");'
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
      '    public void FastPath() { var s = "abc".Length; _ = s; }\n' +
      '\n' +
      '    [Obsolete("请改用 FastPathV2", false)]   // false=仅警告\n' +
      '    public void Legacy() { }\n' +
      '}\n\n' +
      '// 反射扫描并执行所有标注了 [Benchmark] 的方法\n' +
      'var methods = typeof(Runner).GetMethods()\n' +
      '    .Where(m => m.GetCustomAttribute<BenchmarkAttribute>() != null)\n' +
      '    .ToList();\n' +
      'foreach (var m in methods)\n' +
      '{\n' +
      '    var attr = m.GetCustomAttribute<BenchmarkAttribute>()!;\n' +
      '    Console.WriteLine($"执行 {m.Name} x{attr.Iterations}");\n' +
      '    var instance = new Runner();\n' +
      '    for (int i = 0; i < attr.Iterations; i++)\n' +
      '        m.Invoke(instance, null);\n' +
      '}\n\n' +
      '// 强制弃用：编译期直接报错\n' +
      '// [Obsolete("已移除", true)] void Removed() { }'
    ,
    example2Title: '实战：自建迷你验证框架（属性驱动）',
    example2:
      '// 自定义验证特性\n' +
      '[AttributeUsage(AttributeTargets.Property)]\n' +
      'class NotEmptyAttribute : Attribute\n' +
      '{\n' +
      '    public string Message { get; set; } = "不能为空";\n' +
      '}\n\n' +
      '[AttributeUsage(AttributeTargets.Property)]\n' +
      'class RangeAttribute : Attribute\n' +
      '{\n' +
      '    public double Min { get; }\n' +
      '    public double Max { get; }\n' +
      '    public RangeAttribute(double min, double max) { Min = min; Max = max; }\n' +
      '}\n\n' +
      '// 应用特性\n' +
      'class OrderForm\n' +
      '{\n' +
      '    [NotEmpty]\n' +
      '    public string? ProductName { get; set; }\n\n' +
      '    [Range(1, 999)]\n' +
      '    public int Qty { get; set; }\n\n' +
      '    [Range(0.01, 100000)]\n' +
      '    public decimal Price { get; set; }\n' +
      '}\n\n' +
      '// 验证引擎：反射读取特性并校验\n' +
      'static List<string> Validate(object obj)\n' +
      '{\n' +
      '    var errors = new List<string>();\n' +
      '    foreach (var prop in obj.GetType().GetProperties())\n' +
      '    {\n' +
      '        var value = prop.GetValue(obj);\n\n' +
      '        if (prop.GetCustomAttribute<NotEmptyAttribute>() is { } ne\n' +
      '            && (value == null || string.IsNullOrWhiteSpace(value.ToString())))\n' +
      '            errors.Add($"{prop.Name}: {ne.Message}");\n\n' +
      '        if (prop.GetCustomAttribute<RangeAttribute>() is { } ra && value is not null)\n' +
      '        {\n' +
      '            double d = Convert.ToDouble(value);\n' +
      '            if (d < ra.Min || d > ra.Max)\n' +
      '                errors.Add($"{prop.Name}: 必须在 {ra.Min}~{ra.Max} 之间");\n' +
      '        }\n' +
      '    }\n' +
      '    return errors;\n' +
      '}\n\n' +
      '// 演示\n' +
      'var bad = new OrderForm { Qty = 0, Price = 999999m };\n' +
      'foreach (var e in Validate(bad))\n' +
      '    Console.WriteLine(e);\n' +
      '// ProductName: 不能为空\n' +
      '// Qty: 必须在 1~999 之间\n' +
      '// Price: 必须在 0.01~100000 之间\n\n' +
      'var ok = new OrderForm { ProductName = "键盘", Qty = 2, Price = 399m };\n' +
      'Console.WriteLine(Validate(ok).Count);   // 0'
  }
];
