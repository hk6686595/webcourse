// C# 特性详解 —— 第二部分：委托与 LINQ、异步与并发
module.exports = [
  // ==================== 委托与 LINQ ====================
  {
    id: 'delegates-events',
    title: '委托与事件',
    version: 'C# 1.0',
    category: '委托与 LINQ',
    level: '入门',
    summary: '类型安全的函数指针 delegate，event 是对委托的封装广播机制。',
    detail: [
      'delegate 定义方法签名类型；event 把委托限制为只能在所属类内部触发，外部只能 +=/-= 订阅退订。',
      '.NET 内置 Action<T>/Func<T,TResult>/Predicate<T> 泛型委托覆盖绝大多数场景，一般无需自定义委托类型。',
      '多播委托：一个委托变量可串联多个方法（+=），按顺序调用；返回值只保留最后一个。Invoke 前判空 ?.Invoke() 是标准写法。',
      '事件订阅若不退订会造成对象泄漏（发布者持有订阅者引用），UI 生命周期短于发布者时务必 -='
    ],
    example:
      'public class Thermometer\n' +
      '{\n' +
      '    public event Action<int>? TemperatureChanged;   // 事件\n\n' +
      '    private int _temp;\n' +
      '    public int Temp\n' +
      '    {\n' +
      '        get => _temp;\n' +
      '        set { _temp = value; TemperatureChanged?.Invoke(value); }\n' +
      '    }\n' +
      '}\n\n' +
      'var t = new Thermometer();\n' +
      'Action<int> handler = deg => Console.WriteLine($"当前 {deg}°C");\n' +
      't.TemperatureChanged += handler;\n' +
      't.TemperatureChanged -= handler;   // 长生命周期场景记得退订\n' +
      't.Temp = 26;'
  },
  {
    id: 'lambda-expressions',
    title: 'Lambda 表达式',
    version: 'C# 3.0',
    category: '委托与 LINQ',
    level: '入门',
    summary: 'x => x * 2 内联匿名函数，是 LINQ 与现代 C# 的基石。',
    detail: [
      'Lambda 可隐式转换为委托类型或表达式树 Expression<Func<>>（后者供 EF 等翻译成 SQL）。',
      '捕获变量形成闭包：lambda 捕获的是变量本身而非值——循环变量陷阱在 for 循环中尤为经典。',
      'C# 10 起 lambda 自然类型推断、可指定返回类型；static lambda 禁止捕获以避免意外分配。',
      '_ 弃元参数可省略参数名：(_, _) => 0。'
    ],
    notes: [
      'foreach 变量自 C# 5 起每次迭代都是新变量，闭包安全；for 循环的计数器仍是共享的。'
    ],
    example:
      'Func<int, int> square = x => x * x;\n' +
      'Func<int, int, int> add = (a, b) => a + b;\n' +
      'Action<string> log = msg => Console.WriteLine(msg);\n\n' +
      'var list = new List<int> { 1, 2, 3, 4 };\n' +
      'list.RemoveAll(x => x % 2 == 0);\n' +
      'list.ForEach(log);                      // 1 3\n\n' +
      '// 闭包：捕获的是变量本身\n' +
      'int counter = 0;\n' +
      'Func<int> next = () => ++counter;\n' +
      'next(); next();\n' +
      'Console.WriteLine(counter);             // 2 —— 外部变量被修改了\n\n' +
      '// 经典陷阱：for 循环共享计数器\n' +
      'var actions = new List<Func<int>>();\n' +
      'for (int i = 0; i < 3; i++)\n' +
      '{\n' +
      '    int copy = i;                       // 正确做法：拷贝一份\n' +
      '    actions.Add(() => copy);\n' +
      '}'
  },
  {
    id: 'linq',
    title: 'LINQ 语言集成查询',
    version: 'C# 3.0',
    category: '委托与 LINQ',
    level: '进阶',
    summary: 'Where / Select / GroupBy / Join……用统一语法查询集合、XML、数据库。',
    detail: [
      'LINQ 提供查询语法（from…select）与方法语法（链式扩展方法），两者编译结果一致，方法语法功能更全。',
      '延迟执行：多数操作符返回视图，枚举时才真正计算；ToArray/ToList/Count/First 等立即执行操作符会触发求值。',
      'EF Core 中 LINQ 被翻译成 SQL 在数据库端执行；在 IEnumerable 与 IQueryable 边界上调用不支持的方法会导致客户端评估或运行时异常。',
      '常用操作符速记：过滤 Where、投影 Select、排序 OrderBy(Descending)/ThenBy、分组 GroupBy、连接 Join、聚合 Aggregate/Average/Sum、集合 Distinct/Union/Intersect/Except。'
    ],
    notes: [
      '多次枚举同一个延迟查询会重复执行（数据库查询会重复发送），需要复用结果时先 ToList()。',
      'SelectMany 用于"一对多展平"，等价于双层 foreach。'
    ],
    example:
      'var students = new[]\n' +
      '{\n' +
      '    new { Name = "张三", Score = 88, City = "北京" },\n' +
      '    new { Name = "李四", Score = 95, City = "上海" },\n' +
      '    new { Name = "王五", Score = 76, City = "北京" },\n' +
      '};\n\n' +
      '// 方法语法：按城市分组，取平均分\n' +
      'var result = students\n' +
      '    .GroupBy(s => s.City)\n' +
      '    .Select(g => new { City = g.Key, Avg = g.Average(s => s.Score) })\n' +
      '    .OrderByDescending(x => x.Avg);\n\n' +
      '// 查询语法\n' +
      'var names = from s in students where s.Score > 80 select s.Name;',
    example2Title: 'Join 连接与 SelectMany 展平',
    example2:
      'var courses = new[]\n' +
      '{\n' +
      '    new { Student = "张三", Course = "数学" },\n' +
      '    new { Student = "张三", Course = "物理" },\n' +
      '    new { Student = "李四", Course = "化学" },\n' +
      '};\n\n' +
      '// 内连接：学生 × 选课\n' +
      'var joined = students.Join(courses,\n' +
      '    s => s.Name, c => c.Student,\n' +
      '    (s, c) => $"{s.Name} 选了 {c.Course}");\n\n' +
      '// SelectMany：每人展开成多行\n' +
      'var flat = students.SelectMany(\n' +
      '    s => courses.Where(c => c.Student == s.Name),\n' +
      '    (s, c) => $"{s.Name}-{c.Course}");'
  },
  {
    id: 'linq-pitfalls',
    title: 'LINQ 延迟执行与枚举陷阱',
    version: 'C# 3.0',
    category: '委托与 LINQ',
    level: '进阶',
    summary: '查询不是结果而是"配方"——理解何时真正执行，避开三大经典坑。',
    detail: [
      '坑一：重复枚举。query 定义后每 foreach 一次都重新执行一遍完整管线；数据库场景等于重复发 SQL。解决：立即物化 ToList()/ToArray()。',
      '坑二：闭包捕获可变变量。lambda 里引用的局部变量在执行时才取值，定义查询后修改变量会影响结果。',
      '坑三：在 LINQ to Entities 中使用本地方法/属性。EF 无法翻译自定义 C# 方法到 SQL，抛 NotSupportedException；应改用 EF.Functions 或先 AsEnumerable()。',
      'First vs Single vs FirstOrDefault：First 取第一个（无则异常）、Single 要求恰好一个、*OrDefault 无匹配返回默认值。按语义选择能提前暴露数据问题。'
    ],
    example:
      'var nums = new List<int> { 1, 2, 3 };\n' +
      'var query = nums.Where(n => n > filter);   // 只是配方\n\n' +
      'int filter = 1;\n' +
      'Console.WriteLine(query.Count());          // 2\n' +
      'filter = 2;\n' +
      'Console.WriteLine(query.Count());          // 1 ← 同一查询结果变了！\n\n' +
      'nums.Add(10);\n' +
      'Console.WriteLine(query.Count());          // 2 ← 数据源变了也影响\n\n' +
      '// 物化后不再受影响\n' +
      'var materialized = query.ToList();\n' +
      'nums.Clear();\n' +
      'Console.WriteLine(materialized.Count);     // 保持不变'
  },
  {
    id: 'local-functions',
    title: '本地函数与静态 Lambda',
    version: 'C# 7.0 / 8.0',
    category: '委托与 LINQ',
    level: '入门',
    summary: '方法内定义辅助函数；static 修饰禁止闭包捕获以避免意外分配。',
    detail: [
      '本地函数可访问所在方法的局部变量，也可被定义为迭代器/递归，比 lambda 更适合复杂局部逻辑。',
      '与 lambda 的区别：本地函数不产生委托分配（直接方法调用），可在 return 之后定义且作用域仍覆盖全方法。',
      'static 本地函数/static lambda 明确禁止捕获，编译器帮助避免隐藏的堆分配。'
    ],
    example:
      'public static long Fib(int n)\n' +
      '{\n' +
      '    return fib(n);\n\n' +
      '    long fib(int k) => k <= 1 ? k : fib(k - 1) + fib(k - 2);  // 本地递归\n' +
      '}\n\n' +
      '// 本地迭代器函数：参数校验立即执行，惰性部分延后\n' +
      'public static IEnumerable<int> Positive(IEnumerable<int> src)\n' +
      '{\n' +
      '    if (src == null) throw new ArgumentNullException(nameof(src)); // 立即抛出\n' +
      '    return Iterator();\n\n' +
      '    IEnumerable<int> Iterator()\n' +
      '    {\n' +
      '        foreach (var n in src) if (n > 0) yield return n;\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'expression-trees',
    title: 'Expression 表达式树',
    version: 'C# 3.0',
    category: '委托与 LINQ',
    level: '高级',
    summary: 'Expression<Func<>> 把代码表示为数据结构，让框架能"读懂并改写"你的逻辑。',
    detail: [
      '赋给 Func<> 是编译后的 IL；赋给 Expression<Func<>> 则生成树状 AST，可以遍历分析、翻译（LINQ Provider 的原理）。',
      'EF Core 把表达式树翻译成 SQL；AutoMapper 按表达式树构建映射委托；规则引擎用它做动态规则。',
      '可以手工拼装表达式树实现动态查询（如根据用户输入动态组合 Where 条件），比反射拼接字符串安全得多。'
    ],
    example:
      'using System.Linq.Expressions;\n\n' +
      'Expression<Func<Person, bool>> isAdult = p => p.Age >= 18;\n\n' +
      '// 遍历这棵树\n' +
      'var bin = (BinaryExpression)isAdult.Body;\n' +
      'Console.WriteLine(bin.NodeType);            // GreaterThanOrEqual\n' +
      'Console.WriteLine(((MemberExpression)bin.Left).Member.Name); // Age\n\n' +
      '// 动态构造：p => p.Age >= minAge\n' +
      'static Expression<Func<T, bool>> GreaterThan<T>(string prop, object value)\n' +
      '{\n' +
      '    var p = Expression.Parameter(typeof(T), "x");\n' +
      '    var body = Expression.GreaterThanOrEqual(\n' +
      '        Expression.Property(p, prop),\n' +
      '        Expression.Constant(value));\n' +
      '    return Expression.Lambda<Func<T, bool>>(body, p);\n' +
      '}\n\n' +
      'var compiled = GreaterThan<Person>("Age", 18).Compile();\n' +
      'compiled(new Person { Age = 20 });           // true'
  },

  // ==================== 异步与并发 ====================
  {
    id: 'async-await',
    title: 'async / await 异步编程',
    version: 'C# 5.0',
    category: '异步与并发',
    level: '进阶',
    summary: '同步风格的代码编写异步逻辑，编译器自动生成状态机。',
    detail: [
      'await 挂起方法而不阻塞线程，完成后由状态机恢复继续执行。async 方法的返回值通常是 Task / Task<T> / ValueTask。',
      '"async 一路到底"原则：从入口开始整条调用链都应异步化。混用阻塞调用（.Result/.Wait()）容易造成线程池饥饿甚至死锁（有同步上下文的环境如旧 ASP.NET/WinForms）。',
      'async void 只用于事件处理器；其他场景一律 async Task——否则调用方无法等待、异常无法捕获。',
      'ConfigureAwait(false) 用于库代码，告诉 await 不必回到原同步上下文；应用层代码一般不需要。'
    ],
    notes: [
      '多个 await 顺序编写是串行的；需要并发请用 Task.WhenAll 或先启动任务再分别 await。',
      'HttpClient 应复用实例（IHttpClientFactory），每个请求 new HttpClient 会耗尽套接字。'
    ],
    example:
      'public async Task<string> FetchUserAsync(int id)\n' +
      '{\n' +
      '    using var http = new HttpClient();\n' +
      '    var user = await http.GetFromJsonAsync<User>($"/users/{id}");\n' +
      '    var orders = await LoadOrdersAsync(id);\n' +
      '    return $"{user.Name}: {orders.Count} 个订单";\n' +
      '}\n\n' +
      '// ❌ 错误示范：async void + 阻塞混用\n' +
      '// async void Bad() { var r = FetchUserAsync(1).Result; }   // 可能死锁\n\n' +
      '// ✔ 并发版：同时发起两个请求\n' +
      'public async Task<(User, List<Order>)> LoadBothAsync(int id)\n' +
      '{\n' +
      '    var userTask = GetUserAsync(id);       // 已开始执行\n' +
      '    var ordersTask = LoadOrdersAsync(id);  // 与上面并发\n' +
      '    return (await userTask, await ordersTask);\n' +
      '}'
  },
  {
    id: 'async-streams',
    title: '异步流 await foreach',
    version: 'C# 8.0',
    category: '异步与并发',
    level: '高级',
    summary: 'IAsyncEnumerable<T> 让逐条到达的数据也能优雅地 foreach。',
    detail: [
      'async 修饰的方法 yield return 即产生异步流；消费端用 await foreach 逐项异步等待，每次 MoveNextAsync 都可能涉及 IO。',
      '[EnumeratorCancellation] 让外部 CancellationToken 能穿透到生产端，取消时优雅停止。',
      '适合分页拉取 API、消息订阅、大文件流式读取、SSE 流式响应等"边生产边消费"的场景。',
      '.NET 9 的 System.Linq.AsyncEnumerable 把 Where/Select 等 LINQ 操作符带进了异步流。'
    ],
    example:
      '// 生产端：分页拉取全部用户\n' +
      'public async IAsyncEnumerable<User> GetAllUsersAsync(\n' +
      '    [EnumeratorCancellation] CancellationToken ct = default)\n' +
      '{\n' +
      '    int page = 1;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        var users = await _api.GetPageAsync(page++, 100, ct);\n' +
      '        if (users.Count == 0) yield break;\n' +
      '        foreach (var u in users)\n' +
      '            yield return u;              // 逐条产出，内存占用恒定\n' +
      '    }\n' +
      '}\n\n' +
      '// 消费端\n' +
      'await foreach (var user in GetAllUsersAsync().WithCancellation(ct))\n' +
      '    Console.WriteLine(user.Name);'
  },
  {
    id: 'valuetask-cancellation',
    title: 'ValueTask 与取消令牌',
    version: 'C# 7.0+',
    category: '异步与并发',
    level: '高级',
    summary: 'ValueTask 减少热路径分配；CancellationToken 是异步协作取消的标准。',
    detail: [
      'ValueTask 避免高频命中缓存时的 Task 对象分配，但只能 await 一次、不能并发等待、不能缓存后再等。拿不准就用 Task。',
      'CancellationToken 应贯穿整个异步链条：从 Web 请求的 RequestAborted 一路传到底层数据库命令，客户端断开时立刻停止无谓工作。',
      'ct.ThrowIfCancellationRequested() 在长循环中主动检查；Task.Delay(n, ct) 等内置 API 自动响应取消。',
      'CancellationTokenSource.CreateLinkedTokenSource 可以组合多个令牌（如"请求取消 OR 全局停机"）。'
    ],
    example:
      'private readonly Dictionary<int, User> _cache = new();\n\n' +
      'public ValueTask<User?> GetAsync(int id)\n' +
      '{\n' +
      '    if (_cache.TryGetValue(id, out var u))\n' +
      '        return new ValueTask<User?>(u);     // 无分配的已完成任务\n' +
      '    return new ValueTask<User?>(LoadFromDbAsync(id));\n' +
      '}\n\n' +
      'public async Task WorkAsync(CancellationToken ct)\n' +
      '{\n' +
      '    while (!ct.IsCancellationRequested)\n' +
      '    {\n' +
      '        await DoStepAsync(ct);\n' +
      '        ct.ThrowIfCancellationRequested();\n' +
      '    }\n' +
      '}\n\n' +
      '// 组合令牌：用户取消 或 应用停机 都能终止\n' +
      'using var linked = CancellationTokenSource.CreateLinkedTokenSource(\n' +
      '    requestAborted, appStopping);'
  },
  {
    id: 'task-combinators',
    title: 'Task 组合器：WhenAll / WhenAny / 超时控制',
    version: 'TPL (.NET 4.5+)',
    category: '异步与并发',
    level: '进阶',
    summary: '并行等待、竞速、超时与重试的标准工具箱。',
    detail: [
      'WhenAll 等待全部完成并收集所有异常（AggregateException）；手动顺序 await 多个任务是串行的。',
      'WhenAny 返回最先完成的任务，可实现"竞速"（同时请求多个镜像取最快）或超时控制。',
      '.NET 6+ 推荐用 Task.WaitAsync(TimeSpan/CancellationToken) 实现带超时的等待，比 WhenAny + Task.Delay 更干净。',
      '注意 WhenAll 中某个任务失败不会取消其余任务，只是不再等待它们的完成通知之外的结果。'
    ],
    example:
      '// 并发获取三个服务的数据\n' +
      'var (users, orders, stats) = (\n' +
      '    await GetUsersAsync(),\n' +
      '    await GetOrdersAsync(),\n' +
      '    await GetStatsAsync());   // ❌ 这是串行！\n\n' +
      'var usersTask  = GetUsersAsync();\n' +
      'var ordersTask = GetOrdersAsync();\n' +
      'var statsTask  = GetStatsAsync();\n' +
      'await Task.WhenAll(usersTask, ordersTask, statsTask);   // ✔ 真并发\n' +
      'var all = (usersTask.Result, ordersTask.Result, statsTask.Result);\n\n' +
      '// 带超时的等待（.NET 6+）\n' +
      'try\n' +
      '{\n' +
      '    var data = await SlowApiAsync().WaitAsync(TimeSpan.FromSeconds(3));\n' +
      '}\n' +
      'catch (TimeoutException) { /* 降级处理 */ }\n\n' +
      '// 竞速：任一镜像返回即用\n' +
      'var fastest = await Task.WhenAny(mirrorA(), mirrorB());\n' +
      'var result = await fastest;'
  },
  {
    id: 'thread-safe-collections',
    title: '并发集合与 Channel',
    version: '.NET 4.0+/Core',
    category: '异步与并发',
    level: '高级',
    summary: 'ConcurrentDictionary、Channel<T> 替代粗糙的 lock + List 组合。',
    detail: [
      'System.Collections.Concurrent 提供 ConcurrentDictionary/ConcurrentQueue/ConcurrentBag 等线程安全集合，内部用细粒度锁或无锁算法。',
      'Channel<T> 是生产者-消费者队列的现代首选：天然支持背压（BoundedCapacity）、异步等待、完成传播，替代 BlockingCollection。',
      'ConcurrentDictionary 的 GetOrAdd/AddOrUpdate 保证原子性，但 valueFactory 可能被调用多次（对同一 key），工厂内不要有副作用。'
    ],
    example:
      'var dict = new ConcurrentDictionary<string, int>();\n' +
      'dict.AddOrUpdate("hits", 1, (_, old) => old + 1);\n' +
      'dict.GetOrAdd("config", k => LoadExpensive(k));\n\n' +
      'var channel = Channel.CreateBounded<int>(new BoundedChannelOptions(100)\n' +
      '{\n' +
      '    FullMode = BoundedChannelFullMode.Wait   // 满了就等：背压\n' +
      '});\n\n' +
      '// 生产者\n' +
      '_ = Task.Run(async () =>\n' +
      '{\n' +
      '    for (int i = 0; i < 10; i++)\n' +
      '        await channel.Writer.WriteAsync(i);\n' +
      '    channel.Writer.Complete();\n' +
      '});\n\n' +
      '// 消费者\n' +
      'await foreach (var item in channel.Reader.ReadAllAsync())\n' +
      '    Console.WriteLine(item);'
  },
  {
    id: 'sync-primitives',
    title: 'lock / SemaphoreSlim / Interlocked 同步原语',
    version: '.NET 各版本',
    category: '异步与并发',
    level: '进阶',
    summary: '从 lock 到无锁原子操作，按竞争强度选择正确的同步工具。',
    detail: [
      'lock(obj) 是 Monitor.Enter/Exit 的语法糖，保护临界区；锁对象必须是私有 readonly 引用类型，绝不能锁 string/Type/this。',
      'SemaphoreSlim 是唯一支持异步等待的信号量（await semaphore.WaitAsync()），常用于限流并发请求数。',
      'Interlocked 提供增减、交换、CompareExchange 等单变量无锁原子操作，性能远高于 lock。',
      'volatile 关键字只保证可见性与顺序性，不保证原子性；long/double 的读写仍需 Interlocked。'
    ],
    notes: [
      '死锁三要素：互斥、持有并等待、循环等待。固定加锁顺序即可避免绝大多数死锁。',
      '异步代码里不要用 lock 包裹 await（编译错误），应使用 SemaphoreSlim。'
    ],
    example:
      'private readonly object _gate = new();\n' +
      'private int _counter;\n\n' +
      'public void IncrementSafe()\n' +
      '{\n' +
      '    lock (_gate)                    // 临界区\n' +
      '    {\n' +
      '        _counter++;\n' +
      '    }\n' +
      '}\n\n' +
      '// 无锁版本（更快）\n' +
      'public void IncrementAtomic() => Interlocked.Increment(ref _counter);\n\n' +
      '// 异步限流：最多 5 个并发请求\n' +
      'private readonly SemaphoreSlim _throttle = new(5);\n\n' +
      'public async Task<string> CallAsync(string url)\n' +
      '{\n' +
      '    await _throttle.WaitAsync();\n' +
      '    try   { return await _http.GetStringAsync(url); }\n' +
      '    finally { _throttle.Release(); }\n' +
      '}'
  }
];
