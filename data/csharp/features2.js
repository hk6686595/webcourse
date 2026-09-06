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
      'using System;\n\n' +
      'public class Thermometer\n' +
      '{\n' +
      '    // event 限制外部只能订阅/退订，不能随便触发\n' +
      '    public event Action<int>? TemperatureChanged;\n\n' +
      '    private int _temp;\n' +
      '    public int Temp\n' +
      '    {\n' +
      '        get => _temp;\n' +
      '        set\n' +
      '        {\n' +
      '            _temp = value;\n' +
      '            // ?. 判空后触发，所有订阅者依次收到通知\n' +
      '            TemperatureChanged?.Invoke(value);\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'var t = new Thermometer();\n' +
      'Action<int> onChanged = deg => Console.WriteLine($"当前 {deg}°C");\n' +
      't.TemperatureChanged += onChanged;     // 订阅\n\n' +
      't.Temp = 25;   // 触发 -> 当前 25°C\n' +
      't.Temp = 26;   // 触发 -> 当前 26°C\n\n' +
      't.TemperatureChanged -= onChanged;     // 退订（避免内存泄漏）\n' +
      't.Temp = 30;   // 不再有输出'
    ,
    example2Title: '多播委托与内置泛型委托',
    example2:
      '// 多播委托：一次调用触发多个方法\n' +
      'Action<string> pipeline = s => Console.WriteLine($"1) {s}");\n' +
      'pipeline += s => Console.WriteLine($"2) {s.ToUpper()}");\n' +
      'pipeline += s => Console.WriteLine($"3) 长度={s.Length}");\n' +
      'pipeline("hello");\n' +
      '// 输出顺序：1) hello / 2) HELLO / 3) 长度=5\n\n' +
      '// 内置泛型委托\n' +
      'Func<int, int, int> add = (a, b) => a + b;          // 有返回值\n' +
      'Predicate<int> isEven = x => x % 2 == 0;            // 返回 bool\n' +
      'Console.WriteLine(add(3, 4));      // 7\n' +
      'Console.WriteLine(isEven(8));      // True'
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
      'list.RemoveAll(x => x % 2 == 0);   // 移除偶数\n' +
      'list.ForEach(log);                  // 1 3\n\n' +
      '// 闭包：捕获的是变量本身（引用）\n' +
      'int counter = 0;\n' +
      'Func<int> next = () => ++counter;\n' +
      'next(); next();\n' +
      'Console.WriteLine(counter);         // 2 —— 外部变量被修改\n\n' +
      '// 经典陷阱：for 循环共享计数器\n' +
      'var actions = new List<Func<int>>();\n' +
      'for (int i = 0; i < 3; i++)\n' +
      '{\n' +
      '    int copy = i;                   // ✔ 正确：每次迭代拷贝一份\n' +
      '    actions.Add(() => copy);\n' +
      '}\n' +
      'Console.WriteLine(string.Join(",", actions.Select(f => f()))); // 0,1,2'
    ,
    example2Title: '实战：lambda 在排序、分组与聚合中的综合应用',
    example2:
      'var people = new[]\n' +
      '{\n' +
      '    new { Name = "张三", Score = 88, Age = 22 },\n' +
      '    new { Name = "李四", Score = 95, Age = 30 },\n' +
      '    new { Name = "王五", Score = 76, Age = 18 },\n' +
      '};\n\n' +
      '// 多级排序：分数降序，同分按年龄升序\n' +
      'var sorted = people\n' +
      '    .OrderByDescending(p => p.Score)\n' +
      '    .ThenBy(p => p.Age);\n' +
      'sorted.ToList().ForEach(p => Console.WriteLine($"{p.Name} {p.Score} {p.Age}"));\n' +
      '// 李四 95 30 / 张三 88 22 / 王五 76 18\n\n' +
      '// 分组 + 聚合\n' +
      'var stats = people.GroupBy(p => p.Score >= 80 ? "优秀" : "普通")\n' +
      '    .Select(g => new { Group = g.Key, Count = g.Count(), AvgAge = g.Average(p => p.Age) });\n' +
      'foreach (var s in stats)\n' +
      '    Console.WriteLine($"{s.Group}: {s.Count}人, 平均年龄 {s.AvgAge:F0}");\n\n' +
      '// lambda 捕获并修改外部状态（谨慎使用）\n' +
      'int total = 0;\n' +
      'people.ToList().ForEach(p => total += p.Score);\n' +
      'Console.WriteLine($"总分 {total}");      // 259\n\n' +
      '// 作为参数传递：自定义比较器\n' +
      'var byName = people.OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase);\n' +
      'Console.WriteLine(string.Join(",", byName.Select(p => p.Name)));  // 张三,李四,王五'
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
      '    new { Name = "赵六", Score = 62, City = "上海" },\n' +
      '};\n\n' +
      '// 方法语法：及格同学按分数降序，只取姓名\n' +
      'var top = students\n' +
      '    .Where(s => s.Score >= 60)\n' +
      '    .OrderByDescending(s => s.Score)\n' +
      '    .Select(s => s.Name);\n' +
      'Console.WriteLine(string.Join(", ", top));    // 李四, 张三, 王五, 赵六\n\n' +
      '// 按城市分组，取平均分\n' +
      'var byCity = students\n' +
      '    .GroupBy(s => s.City)\n' +
      '    .Select(g => new { City = g.Key, Avg = g.Average(s => s.Score), Count = g.Count() });\n' +
      'foreach (var x in byCity)\n' +
      '    Console.WriteLine($"{x.City}: 平均 {x.Avg:F1}（{x.Count}人）");\n\n' +
      '// 查询语法（等价）\n' +
      'var names = from s in students where s.Score > 80 select s.Name;\n' +
      'Console.WriteLine(string.Join(",", names));    // 张三, 李四'
    ,
    example2Title: 'Join 连接与 SelectMany 展平',
    example2:
      'var students = new[]\n' +
      '{\n' +
      '    new { Id = 1, Name = "张三" },\n' +
      '    new { Id = 2, Name = "李四" },\n' +
      '};\n' +
      'var courses = new[]\n' +
      '{\n' +
      '    new { StudentId = 1, Course = "数学" },\n' +
      '    new { StudentId = 1, Course = "物理" },\n' +
      '    new { StudentId = 2, Course = "化学" },\n' +
      '};\n\n' +
      '// 内连接：学生 × 选课\n' +
      'var joined = students.Join(courses,\n' +
      '    s => s.Id, c => c.StudentId,\n' +
      '    (s, c) => $"{s.Name} 选了 {c.Course}");\n' +
      'joined.ToList().ForEach(Console.WriteLine);\n\n' +
      '// SelectMany：每人展开成多行（类似 JOIN 但保留完整对象）\n' +
      'var flat = students.SelectMany(\n' +
      '    s => courses.Where(c => c.StudentId == s.Id),\n' +
      '    (s, c) => $"{s.Name}-{c.Course}");\n' +
      'flat.ToList().ForEach(Console.WriteLine);   // 张三-数学, 张三-物理, 李四-化学'
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
      'int filter = 1;\n' +
      'var query = nums.Where(n => n > filter);   // 只是"配方"，此刻没执行\n\n' +
      'Console.WriteLine(query.Count());          // 2（过滤 >1）\n' +
      'filter = 2;\n' +
      'Console.WriteLine(query.Count());          // 1 ← 同一查询因变量变化而不同！\n\n' +
      'nums.Add(10);\n' +
      'Console.WriteLine(query.Count());          // 2 ← 数据源变了也影响\n\n' +
      '// 物化后不再受影响：先把结果"固定"下来\n' +
      'var materialized = query.ToList();\n' +
      'nums.Clear();\n' +
      'Console.WriteLine(materialized.Count);     // 仍保持为 2'
    ,
    example2Title: '实战：延迟执行在真实业务中的坑与对策',
    example2:
      '// 场景：统计数据报表\n' +
      'var orders = new List<Order>\n' +
      '{\n' +
      '    new(1, "张三", 100), new(2, "李四", 200), new(3, "张三", 50),\n' +
      '};\n' +
      'record Order(int Id, string Customer, decimal Amount);\n\n' +
      '// 坑：同一查询多次枚举 = 多次执行\n' +
      'var big = orders.Where(o => o.Amount > 60);       // 惰性\n' +
      'Console.WriteLine(big.Count());                    // 执行 1 次\n' +
      'orders.Add(new(4, "王五", 300));                   // 中途数据变化\n' +
      'Console.WriteLine(big.Count());                    // 执行 2 次，结果不同\n\n' +
      '// 对策一：立即物化，与数据源解耦\n' +
      'var snapshot = orders.Where(o => o.Amount > 60).ToList();\n' +
      'orders.Clear();\n' +
      'Console.WriteLine(snapshot.Count);                 // 仍是 2\n\n' +
      '// 对策二：先物化再算多个统计（避免重复执行）\n' +
      'var seq = orders.Where(o => o.Amount > 60);\n' +
      'var summary = (Count: seq.Count(), Total: seq.Sum(o => o.Amount));\n' +
      '// ↑ 这样其实枚举了两次！正确做法：\n' +
      'var materialized = orders.Where(o => o.Amount > 60).ToList();\n' +
      'var once = (Count: materialized.Count, Total: materialized.Sum(o => o.Amount));\n' +
      'Console.WriteLine($"{once.Count} 笔，共 {once.Total:C}");'
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
      '    // 本地递归函数：可访问 n，且不分配委托\n' +
      '    long fib(int k) => k <= 1 ? k : fib(k - 1) + fib(k - 2);\n' +
      '}\n\n' +
      '// 本地迭代器：参数校验立即执行，惰性部分延后（避免"延迟校验陷阱"）\n' +
      'public static IEnumerable<int> Positive(IEnumerable<int> src)\n' +
      '{\n' +
      '    if (src == null) throw new ArgumentNullException(nameof(src)); // 调用即校验\n' +
      '    return Iterator();\n\n' +
      '    IEnumerable<int> Iterator()\n' +
      '    {\n' +
      '        foreach (var n in src)\n' +
      '            if (n > 0) yield return n;\n' +
      '    }\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'Console.WriteLine(Fib(10));                       // 55\n' +
      'Console.WriteLine(string.Join(",", Positive(new[] { -1, 2, -3, 4 }))); // 2,4'
    ,
    example2Title: '实战：本地函数实现快速排序与词频统计',
    example2:
      '// 本地递归：原地快速排序（无需额外类型）\n' +
      'static void QuickSort<T>(T[] arr) where T : IComparable<T>\n' +
      '{\n' +
      '    void Sort(int lo, int hi)\n' +
      '    {\n' +
      '        if (lo >= hi) return;\n' +
      '        int i = lo, j = hi;\n' +
      '        var pivot = arr[(lo + hi) / 2];\n' +
      '        while (i <= j)\n' +
      '        {\n' +
      '            while (arr[i].CompareTo(pivot) < 0) i++;\n' +
      '            while (arr[j].CompareTo(pivot) > 0) j--;\n' +
      '            if (i <= j) (arr[i], arr[j]) = (arr[j], arr[i]);  // 交换\n' +
      '            i++; j--;\n' +
      '        }\n' +
      '        Sort(lo, j); Sort(i, hi);\n' +
      '    }\n' +
      '    Sort(0, arr.Length - 1);\n' +
      '}\n\n' +
      'var nums = new[] { 5, 2, 8, 1, 9, 3 };\n' +
      'QuickSort(nums);\n' +
      'Console.WriteLine(string.Join(",", nums));   // 1,2,3,5,8,9\n\n' +
      '// 本地函数 + 闭包：统计字符频率\n' +
      'static Dictionary<char, int> CountChars(string s)\n' +
      '{\n' +
      '    var dict = new Dictionary<char, int>();\n' +
      '    void Add(char c) => dict[c] = dict.TryGetValue(c, out var n) ? n + 1 : 1;\n' +
      '    foreach (var c in s) Add(char.ToLower(c));\n' +
      '    return dict;\n' +
      '}\n' +
      'var freq = CountChars("Hello World");\n' +
      'Console.WriteLine(string.Join(",", freq.OrderByDescending(kv => kv.Value)\n' +
      '    .Select(kv => $"{kv.Key}:{kv.Value}")));   // l:3, o:2, h:1, e:1, w:1, r:1, d:1'
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
      'public record Person(string Name, int Age);\n\n' +
      'Expression<Func<Person, bool>> isAdult = p => p.Age >= 18;\n\n' +
      '// 遍历这棵树，看清它的结构\n' +
      'var body = (BinaryExpression)isAdult.Body;\n' +
      'Console.WriteLine($"节点类型: {body.NodeType}");       // GreaterThanOrEqual\n' +
      'var left = (MemberExpression)body.Left;\n' +
      'Console.WriteLine($"左操作数属性: {left.Member.Name}"); // Age\n\n' +
      '// 动态构造表达式：p => p.Age >= value\n' +
      'static Expression<Func<T, bool>> GreaterThan<T>(string prop, object value)\n' +
      '{\n' +
      '    var p = Expression.Parameter(typeof(T), "x");\n' +
      '    var propAccess = Expression.Property(p, prop);\n' +
      '    var constant = Expression.Constant(value, value.GetType());\n' +
      '    var compare = Expression.GreaterThanOrEqual(propAccess, constant);\n' +
      '    return Expression.Lambda<Func<T, bool>>(compare, p);\n' +
      '}\n\n' +
      '// 完整演示：把表达式编译回委托并执行\n' +
      'var rule = GreaterThan<Person>("Age", 18);\n' +
      'var compiled = rule.Compile();\n' +
      'Console.WriteLine(compiled(new Person("小明", 20)));  // True\n' +
      'Console.WriteLine(compiled(new Person("小红", 15)));  // False'
    ,
    example2Title: '实战：动态组合多条件查询（迷你规则引擎）',
    example2:
      'using System.Linq.Expressions;\n\n' +
      'public record Product(int Id, string Name, decimal Price, bool InStock);\n\n' +
      '// 动态拼接：p => p.Price >= min && p.Price <= max\n' +
      'static Expression<Func<T, bool>> InRange<T>(string prop, double min, double max)\n' +
      '{\n' +
      '    var p = Expression.Parameter(typeof(T), "x");\n' +
      '    var member = Expression.Property(p, prop);\n' +
      '    var lo = Expression.Constant(Convert.ChangeType(min, member.Type), member.Type);\n' +
      '    var hi = Expression.Constant(Convert.ChangeType(max, member.Type), member.Type);\n' +
      '    var body = Expression.AndAlso(\n' +
      '        Expression.GreaterThanOrEqual(member, lo),\n' +
      '        Expression.LessThanOrEqual(member, hi));\n' +
      '    return Expression.Lambda<Func<T, bool>>(body, p);\n' +
      '}\n\n' +
      '// 动态拼接：p => p.Name.Contains(keyword)\n' +
      'static Expression<Func<T, bool>> NameContains<T>(string keyword)\n' +
      '{\n' +
      '    var p = Expression.Parameter(typeof(T), "x");\n' +
      '    var name = Expression.Property(p, "Name");\n' +
      '    var contains = Expression.Call(name,\n' +
      '        typeof(string).GetMethod("Contains", new[] { typeof(string) })!,\n' +
      '        Expression.Constant(keyword));\n' +
      '    return Expression.Lambda<Func<T, bool>>(contains, p);\n' +
      '}\n\n' +
      '// 演示：把表达式当数据传递，编译后执行\n' +
      'var products = new[]\n' +
      '{\n' +
      '    new Product(1, "机械键盘", 399m, true),\n' +
      '    new Product(2, "鼠标", 99m, true),\n' +
      '    new Product(3, "显示器", 1299m, false),\n' +
      '};\n\n' +
      'var priceRule = InRange<Product>("Price", 100, 500);\n' +
      'foreach (var p in products.Where(priceRule.Compile()))\n' +
      '    Console.WriteLine(p.Name);   // 机械键盘\n\n' +
      'var nameRule = NameContains<Product>("键");\n' +
      'Console.WriteLine(products.Count(nameRule.Compile()));   // 1'
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
      'public class UserService\n' +
      '{\n' +
      '    private static readonly HttpClient Http = new();\n\n' +
      '    public async Task<string> FetchUserAsync(int id)\n' +
      '    {\n' +
      '        // 每个 await 都不阻塞线程\n' +
      '        var user = await Http.GetFromJsonAsync<User>($"https://api.x.com/users/{id}");\n' +
      '        var orders = await LoadOrdersAsync(id);\n' +
      '        return $"{user?.Name}: {orders.Count} 个订单";\n' +
      '    }\n\n' +
      '    private async Task<List<Order>> LoadOrdersAsync(int id) =>\n' +
      '        await Http.GetFromJsonAsync<List<Order>>($"https://api.x.com/users/{id}/orders")\n' +
      '            ?? new();\n' +
      '}\n\n' +
      '// ❌ 错误示范：async void + 阻塞混用（可能死锁）\n' +
      '// async void Bad() { var r = FetchUserAsync(1).Result; }\n\n' +
      '// ✔ 并发版：先把两个任务都启动，再一起 await\n' +
      'public async Task<(User?, List<Order>)> LoadBothAsync(int id)\n' +
      '{\n' +
      '    var userTask = GetUserAsync(id);        // 已开始执行\n' +
      '    var ordersTask = LoadOrdersAsync(id);   // 与上面并发\n' +
      '    return (await userTask, await ordersTask);\n' +
      '}\n\n' +
      'public record User(string Name);\n' +
      'public record Order(int Id);'
    ,
    example2Title: '实战：指数退避重试 + 并发下载',
    example2:
      'using System.Net.Http;\n\n' +
      '// 指数退避重试：最多尝试 4 次，间隔 1s/2s/4s\n' +
      'static async Task<string> FetchWithRetryAsync(HttpClient http, string url, int maxRetries = 4)\n' +
      '{\n' +
      '    for (int attempt = 1; ; attempt++)\n' +
      '    {\n' +
      '        try\n' +
      '        {\n' +
      '            return await http.GetStringAsync(url);\n' +
      '        }\n' +
      '        catch (HttpRequestException) when (attempt < maxRetries)\n' +
      '        {\n' +
      '            int delayMs = (int)Math.Pow(2, attempt - 1) * 1000;   // 1s, 2s, 4s\n' +
      '            Console.WriteLine($"第 {attempt} 次失败，{delayMs / 1000}s 后重试");\n' +
      '            await Task.Delay(delayMs);\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      '// 并发下载多个资源（WhenAll）：总耗时≈最慢的那个\n' +
      'static async Task DownloadAllAsync(HttpClient http, params string[] urls)\n' +
      '{\n' +
      '    var tasks = urls.Select(url => http.GetStringAsync(url)).ToArray();\n' +
      '    var results = await Task.WhenAll(tasks);      // 全部完成才继续\n' +
      '    foreach (var r in results) Console.WriteLine($"收到 {r.Length} 字符");\n' +
      '}\n\n' +
      'var http = new HttpClient();\n' +
      'var html = await FetchWithRetryAsync(http, "https://example.com");\n' +
      'Console.WriteLine(html.Length);\n\n' +
      'await DownloadAllAsync(http, "https://a.com", "https://b.com", "https://c.com");'
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
      '// 生产端：分页拉取全部用户，逐条产出（内存占用恒定）\n' +
      'public static async IAsyncEnumerable<User> GetAllUsersAsync(\n' +
      '    [EnumeratorCancellation] CancellationToken ct = default)\n' +
      '{\n' +
      '    int page = 1;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        var users = await FetchPageAsync(page++, 100, ct);\n' +
      '        if (users.Count == 0) yield break;\n' +
      '        foreach (var u in users)\n' +
      '            yield return u;\n' +
      '    }\n' +
      '}\n\n' +
      '// 消费端：一边拉取一边处理\n' +
      'await foreach (var user in GetAllUsersAsync().WithCancellation(ct))\n' +
      '    Console.WriteLine(user.Name);\n\n' +
      'static Task<List<User>> FetchPageAsync(int page, int size, CancellationToken ct)\n' +
      '    => Task.FromResult(new List<User> { new("p" + page) });\n' +
      'public record User(string Name);'
    ,
    example2Title: '实战：流式统计大文件的行与单词',
    example2:
      '// 生产端：逐行读取，不整文件进内存\n' +
      'static async IAsyncEnumerable<string> ReadLinesAsync(string path,\n' +
      '    [EnumeratorCancellation] CancellationToken ct = default)\n' +
      '{\n' +
      '    using var reader = File.OpenText(path);\n' +
      '    while (await reader.ReadLineAsync(ct) is { } line)\n' +
      '        yield return line;\n' +
      '}\n\n' +
      '// 消费端：边读边统计，内存占用恒定\n' +
      'static async Task AnalyzeAsync(string path, CancellationToken ct)\n' +
      '{\n' +
      '    long lines = 0, words = 0;\n' +
      '    await foreach (var line in ReadLinesAsync(path, ct))\n' +
      '    {\n' +
      '        if (string.IsNullOrWhiteSpace(line)) continue;\n' +
      '        lines++;\n' +
      '        words += line.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n' +
      '    }\n' +
      '    Console.WriteLine($"行数 {lines}，单词数 {words}");\n' +
      '}\n\n' +
      '// 流式管道：过滤 + 转换（.NET 9 起可用 System.Linq.AsyncEnumerable）\n' +
      'await foreach (var line in ReadLinesAsync("log.txt"))\n' +
      '{\n' +
      '    if (!line.Contains("ERROR")) continue;\n' +
      '    Console.WriteLine(line.ToUpperInvariant());\n' +
      '}'
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
      'using System.Collections.Concurrent;\n\n' +
      'public class Cache\n' +
      '{\n' +
      '    private readonly Dictionary<int, User> _cache = new();\n\n' +
      '    // 命中缓存：无分配直接返回已完成任务\n' +
      '    public ValueTask<User?> GetAsync(int id)\n' +
      '        => _cache.TryGetValue(id, out var u)\n' +
      '            ? new ValueTask<User?>(u)\n' +
      '            : new ValueTask<User?>(LoadFromDbAsync(id));\n\n' +
      '    private static Task<User?> LoadFromDbAsync(int id) => Task.FromResult<User?>(new User(id));\n' +
      '}\n\n' +
      '// 取消令牌贯穿链路\n' +
      'public async Task WorkAsync(CancellationToken ct)\n' +
      '{\n' +
      '    while (!ct.IsCancellationRequested)\n' +
      '    {\n' +
      '        await DoStepAsync(ct);\n' +
      '        ct.ThrowIfCancellationRequested();   // 主动抛 OperationCanceledException\n' +
      '    }\n' +
      '}\n\n' +
      '// 组合令牌：用户取消 或 应用停机 都能终止\n' +
      'using var linked = CancellationTokenSource.CreateLinkedTokenSource(reqAborted, appStopping);\n' +
      'await WorkAsync(linked.Token);\n' +
      'public record User(int Id);'
    ,
    example2Title: '实战：带进度报告的下载 + 取消传播',
    example2:
      '// 下载并报告进度；取消时优雅退出\n' +
      'static async Task DownloadWithProgressAsync(HttpClient http, string url, string dest,\n' +
      '    IProgress<double>? progress, CancellationToken ct)\n' +
      '{\n' +
      '    using var resp = await http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);\n' +
      '    resp.EnsureSuccessStatusCode();\n' +
      '    var total = resp.Content.Headers.ContentLength ?? 0;\n\n' +
      '    await using var src = await resp.Content.ReadAsStreamAsync(ct);\n' +
      '    await using var dst = File.Create(dest);\n\n' +
      '    var buffer = new byte[81920];\n' +
      '    long read = 0;\n' +
      '    while (true)\n' +
      '    {\n' +
      '        int n = await src.ReadAsync(buffer, ct);\n' +
      '        if (n == 0) break;\n' +
      '        await dst.WriteAsync(buffer.AsMemory(0, n), ct);\n' +
      '        read += n;\n' +
      '        progress?.Report(total > 0 ? (double)read / total * 100 : 0);\n' +
      '    }\n' +
      '}\n\n' +
      '// 组合令牌：用户取消 或 全局停机 都能终止\n' +
      'using var cts = CancellationTokenSource.CreateLinkedTokenSource(userToken, appToken);\n\n' +
      'var progress = new Progress<double>(p => Console.WriteLine($"进度 {p:F1}%"));\n' +
      'await DownloadWithProgressAsync(new HttpClient(), "https://x.com/big.iso",\n' +
      '    "big.iso", progress, cts.Token);'
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
      '// ❌ 串行：总耗时 = 三次之和\n' +
      'var a1 = await GetUsersAsync();\n' +
      'var b1 = await GetOrdersAsync();\n' +
      'var c1 = await GetStatsAsync();\n\n' +
      '// ✔ 真并发：先全部启动，再一次性等待\n' +
      'var usersTask  = GetUsersAsync();\n' +
      'var ordersTask = GetOrdersAsync();\n' +
      'var statsTask  = GetStatsAsync();\n' +
      'await Task.WhenAll(usersTask, ordersTask, statsTask);\n' +
      'var all = (usersTask.Result, ordersTask.Result, statsTask.Result);\n\n' +
      '// 带超时的等待（.NET 6+）\n' +
      'try\n' +
      '{\n' +
      '    var data = await SlowApiAsync().WaitAsync(TimeSpan.FromSeconds(3));\n' +
      '    Console.WriteLine(data);\n' +
      '}\n' +
      'catch (TimeoutException)\n' +
      '{\n' +
      '    Console.WriteLine("降级：调用超时");\n' +
      '}\n\n' +
      '// 竞速：哪个镜像先返回就用哪个\n' +
      'var fastest = await Task.WhenAny(MirrorAAsync(), MirrorBAsync());\n' +
      'var result = await fastest;   // 取最先完成的任务结果\n\n' +
      'static Task<string> GetUsersAsync() => Task.FromResult("users");\n' +
      'static Task<string> GetOrdersAsync() => Task.FromResult("orders");\n' +
      'static Task<string> GetStatsAsync() => Task.FromResult("stats");\n' +
      'static Task<string> SlowApiAsync() => Task.Delay(5000).ContinueWith(_ => "ok");\n' +
      'static Task<string> MirrorAAsync() => Task.FromResult("A");\n' +
      'static Task<string> MirrorBAsync() => Task.FromResult("B");'
    ,
    example2Title: '实战：分批并发、信号量限流与首败即停',
    example2:
      '// 分批执行：一次最多并发 3 个，批次间串行\n' +
      'static async Task RunInBatchesAsync(IEnumerable<string> urls, int batchSize)\n' +
      '{\n' +
      '    var list = urls.ToList();\n' +
      '    for (int i = 0; i < list.Count; i += batchSize)\n' +
      '    {\n' +
      '        var batch = list.Skip(i).Take(batchSize);\n' +
      '        var tasks = batch.Select(u => FetchAsync(u));\n' +
      '        await Task.WhenAll(tasks);      // 等本批全部完成再开下一批\n' +
      '        Console.WriteLine($"批次 {i / batchSize + 1} 完成");\n' +
      '    }\n' +
      '}\n\n' +
      '// 信号量限流：全局最多 N 个并发（更平滑，无批次边界）\n' +
      'static async Task RunThrottledAsync(IEnumerable<string> urls, int maxConcurrent)\n' +
      '{\n' +
      '    using var sem = new SemaphoreSlim(maxConcurrent);\n' +
      '    var tasks = urls.Select(async u =>\n' +
      '    {\n' +
      '        await sem.WaitAsync();\n' +
      '        try { return await FetchAsync(u); }\n' +
      '        finally { sem.Release(); }\n' +
      '    });\n' +
      '    var results = await Task.WhenAll(tasks);\n' +
      '    Console.WriteLine($"全部完成，共 {results.Length} 个结果");\n' +
      '}\n\n' +
      '// 首败即停：任何任务失败就取消其余\n' +
      'static async Task RunFailFastAsync(IEnumerable<string> urls, CancellationToken ct)\n' +
      '{\n' +
      '    using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);\n' +
      '    var tasks = urls.Select(u => FetchAsync(u, cts.Token)).ToArray();\n' +
      '    var first = await Task.WhenAny(tasks);        // 谁先完成/失败\n' +
      '    if (first.IsFaulted) cts.Cancel();            // 失败则取消所有\n' +
      '    await Task.WhenAll(tasks);                    // 等全部收尾\n' +
      '}\n\n' +
      'static async Task<string> FetchAsync(string url, CancellationToken ct = default)\n' +
      '{\n' +
      '    await Task.Delay(Random.Shared.Next(50, 300), ct);\n' +
      '    return url;\n' +
      '}'
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
      'using System.Collections.Concurrent;\n\n' +
      'var dict = new ConcurrentDictionary<string, int>();\n' +
      'dict.AddOrUpdate("hits", 1, (_, old) => old + 1);\n' +
      'dict.GetOrAdd("config", _ => LoadExpensive("config"));\n' +
      'Console.WriteLine(dict["hits"]);             // 1\n\n' +
      '// Channel<T>：生产者-消费者 + 背压\n' +
      'var channel = Channel.CreateBounded<int>(new BoundedChannelOptions(100)\n' +
      '{\n' +
      '    FullMode = BoundedChannelFullMode.Wait    // 满了就等待：自带背压\n' +
      '});\n\n' +
      '// 生产者\n' +
      '_ = Task.Run(async () =>\n' +
      '{\n' +
      '    for (int i = 0; i < 10; i++)\n' +
      '        await channel.Writer.WriteAsync(i);\n' +
      '    channel.Writer.Complete();               // 通知消费端结束\n' +
      '});\n\n' +
      '// 消费者\n' +
      'await foreach (var item in channel.Reader.ReadAllAsync())\n' +
      '    Console.WriteLine(item);                 // 0..9\n\n' +
      'static int LoadExpensive(string k) => k.Length;'
    ,
    example2Title: '实战：并行词频统计与惰性缓存',
    example2:
      'using System.Collections.Concurrent;\n\n' +
      'var text = "the quick brown fox jumps over the lazy dog the fox";\n' +
      'var words = text.Split(\' \');\n\n' +
      'var freq = new ConcurrentDictionary<string, int>();\n\n' +
      '// 并行分词计数：AddOrUpdate 原子更新\n' +
      'Parallel.ForEach(words, w =>\n' +
      '{\n' +
      '    freq.AddOrUpdate(w, 1, (_, old) => old + 1);\n' +
      '});\n\n' +
      'foreach (var kv in freq.OrderByDescending(kv => kv.Value))\n' +
      '    Console.WriteLine($"{kv.Key}: {kv.Value}");\n' +
      '// the: 3, fox: 2, quick: 1, ...\n\n' +
      '// GetOrAdd：惰性初始化 + 原子（工厂可能被调用多次，无副作用）\n' +
      'var cache = new ConcurrentDictionary<string, int>();\n' +
      'int GetLen(string key) => cache.GetOrAdd(key, k => ExpensiveCompute(k));\n' +
      'Console.WriteLine(GetLen("hello"));     // 5\n\n' +
      '// ConcurrentQueue：无锁 FIFO\n' +
      'var q = new ConcurrentQueue<int>();\n' +
      'q.Enqueue(1); q.Enqueue(2);\n' +
      'q.TryDequeue(out var first);\n' +
      'Console.WriteLine(first);               // 1\n\n' +
      'static int ExpensiveCompute(string s) { Thread.Sleep(10); return s.Length; }'
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
      '// 无锁版本（更快，适合简单计数）\n' +
      'public void IncrementAtomic() => Interlocked.Increment(ref _counter);\n\n' +
      '// 异步限流：最多 5 个并发请求\n' +
      'private static readonly HttpClient Http = new();\n' +
      'private readonly SemaphoreSlim _throttle = new(5);\n\n' +
      'public async Task<string> CallAsync(string url)\n' +
      '{\n' +
      '    await _throttle.WaitAsync();    // 超过 5 个就在这里排队\n' +
      '    try   { return await Http.GetStringAsync(url); }\n' +
      '    finally { _throttle.Release(); } // 务必释放\n' +
      '}\n\n' +
      '// 演示\n' +
      'var demo = new CounterDemo();\n' +
      'Parallel.For(0, 1000, _ => demo.IncrementAtomic());\n' +
      'Console.WriteLine(demo._counter);   // 1000（线程安全）\n\n' +
      'class CounterDemo { public int _counter; }\n' +
      '// 注：上面 Parallel 仅为演示，实际类见方法体'
    ,
    example2Title: '实战：读写锁缓存 + 原子计数器的完整示例',
    example2:
      '// 读写锁：读多写少的缓存（读者可并行，写者独占）\n' +
      'public class SafeCache<TKey, TValue> where TKey : notnull\n' +
      '{\n' +
      '    private readonly Dictionary<TKey, TValue> _map = new();\n' +
      '    private readonly ReaderWriterLockSlim _lock = new();\n\n' +
      '    public TValue? Get(TKey key)\n' +
      '    {\n' +
      '        _lock.EnterReadLock();      // 多个读者可并行\n' +
      '        try { return _map.TryGetValue(key, out var v) ? v : default; }\n' +
      '        finally { _lock.ExitReadLock(); }\n' +
      '    }\n\n' +
      '    public void Set(TKey key, TValue value)\n' +
      '    {\n' +
      '        _lock.EnterWriteLock();     // 写者独占\n' +
      '        try { _map[key] = value; }\n' +
      '        finally { _lock.ExitWriteLock(); }\n' +
      '    }\n' +
      '}\n\n' +
      '// 演示：多线程读写\n' +
      'var cache = new SafeCache<string, int>();\n' +
      'Parallel.For(0, 100, i =>\n' +
      '{\n' +
      '    cache.Set($"k{i}", i);\n' +
      '    _ = cache.Get($"k{Random.Shared.Next(100)}");\n' +
      '});\n' +
      'Console.WriteLine(cache.Get("k42"));   // 42\n\n' +
      '// Interlocked：无锁计数器（性能最高）\n' +
      'int counter = 0;\n' +
      'Parallel.For(0, 10000, _ => Interlocked.Increment(ref counter));\n' +
      'Console.WriteLine(counter);            // 10000\n\n' +
      '// CompareExchange：CAS，仅在旧值匹配时更新\n' +
      'int current = 5;\n' +
      'int old = Interlocked.CompareExchange(ref current, 10, 5);  // 期望旧值 5\n' +
      'Console.WriteLine($"{old} -> {current}");   // 5 -> 10'
  }
];
