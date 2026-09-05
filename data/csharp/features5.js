// C# 特性详解 —— 第五部分：C# 14（.NET 10）新特性
module.exports = [
  // ==================== 类型与属性 ====================
  {
    id: 'field-keyword',
    title: 'field 关键字：field-backed 属性',
    version: 'C# 14',
    category: '类型与属性',
    level: '进阶',
    summary: '在属性访问器里直接访问编译器生成的自动属性后备字段，保留精简声明的同时注入逻辑。',
    detail: [
      'C# 14 新增上下文关键字 field，可在属性的 get/set/init 访问器中直接读写编译器为该自动属性合成的后备字段。',
      '传统做法是手写 private 字段再包一层属性；field 让你只写需要逻辑的那个访问器，另一个保持自动生成，类既精简 diff 也小。',
      '典型用途：空值校验、归一化/钳制（clamp）、懒初始化、值变更时抛错或联动通知（配合触发器）。',
      '注意：field 只能在访问器内部使用；想在外部访问必须走属性本身；若类型里已有名为 field 的成员可用 @field 转义。'
    ],
    notes: [
      '技术上是编译期合成 IL 字段与访问器，JIT 内联后零性能开销。',
      'value 关键字与 field 的区别：value 是 set 的入参，field 是仓库——nameof(value) 可用，nameof(field) 编译不过。'
    ],
    example:
      'public class Message\n' +
      '{\n' +
      '    // 自动属性：完全由编译器生成\n' +
      '    public string Text { get; set; } = "";\n\n' +
      '    // C# 14：只包裹需要逻辑的访问器即可\n' +
      '    // set 时校验 + 归一化，读路径保持自动生成\n' +
      '    public string Nick\n' +
      '    {\n' +
      '        get;\n' +
      '        set => field = value.Trim();\n' +
      '    }\n\n' +
      '    // init 校验：对象初始化期即抛异常\n' +
      '    public string? Code\n' +
      '    {\n' +
      '        get;\n' +
      '        init => field = value\n' +
      '            ?? throw new ArgumentNullException(nameof(value));\n' +
      '    }\n\n' +
      '    // 懒初始化：field ??= 只算一次\n' +
      '    public List<string> Tags\n' +
      '    {\n' +
      '        get => field ??= new List<string>();\n' +
      '        set => field = value;\n' +
      '    }\n' +
      '}\n\n' +
      'var m = new Message { Text = "hi", Nick = "  tom  ", Code = "A1" };\n' +
      'Console.WriteLine(m.Nick);            // "tom"（自动 Trim）\n' +
      'Console.WriteLine(m.Tags.Count);      // 0（懒初始化成功）\n' +
      '// new Message { Code = null }   // ✘ ArgumentNullException'
    ,
    example2Title: '实战：钳制属性值并触发通知（对比改造前后）',
    example2:
      '// 改造前：手写后备字段 + 属性 + 逻辑，样板代码多\n' +
      'public class OldCounter\n' +
      '{\n' +
      '    private int _value;\n' +
      '    public int Value\n' +
      '    {\n' +
      '        get => _value;\n' +
      '        set => _value = Math.Clamp(value, 0, 100);\n' +
      '    }\n' +
      '}\n\n' +
      '// 改造后（C# 14）：公共字段留给编译器，逻辑只写 set\n' +
      'public class Counter\n' +
      '{\n' +
      '    public int Value\n' +
      '    {\n' +
      '        get;\n' +
      '        set => field = Math.Clamp(value, 0, 100);\n' +
      '    }\n' +
      '}\n\n' +
      'var c = new Counter();\n' +
      'c.Value = 999;\n' +
      'c.Value = -5;\n' +
      'Console.WriteLine(c.Value);   // 0（始终被钳制在 0~100）\n\n' +
      '// 触发通知场景：一次写入，两件事\n' +
      'public class ViewModel\n' +
      '{\n' +
      '    public event Action? Changed;\n\n' +
      '    public string Name\n' +
      '    {\n' +
      '        get => field;\n' +
      '        set\n' +
      '        {\n' +
      '            if (field == value) return;   // 值未变，不通知\n' +
      '            field = value;\n' +
      '            Changed?.Invoke();\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      'var vm = new ViewModel();\n' +
      'vm.Changed += () => Console.WriteLine("变更了");\n' +
      'vm.Name = "A";   // 变更了\n' +
      'vm.Name = "A";   // （幂等，不通知）'
  },
  {
    id: 'partial-constructors-events',
    title: 'partial 构造器与 partial 事件',
    version: 'C# 14',
    category: '面向对象',
    level: '进阶',
    summary: '把类型切成多份：构造器、事件也可以用 partial 分布在不同文件中。',
    detail: [
      'C# 13 已支持 partial 属性与索引器；C# 14 把 partial 扩展到构造器和事件。',
      'partial 构造器：多个 partial 定义可各声明无参构造器，编译后合并，适合每个分组各自初始化自己的字段。',
      'partial 事件：一个文件声明、另一个文件实现（常用于源生成器产出声明，手写部分提供具体 add/remove 逻辑）。',
      '限制：partial 构造器只能是无参构造器；事件必须有且仅有一个实现部分（带 add/remove）或全部是自动实现。'
    ],
    example:
      '// File1.cs —— 声明部分：字段与 partial 构造器\n' +
      'public partial class Order\n' +
      '{\n' +
      '    public List<OrderLine> Lines { get; } = [];\n\n' +
      '    public partial Order();\n' +
      '}\n\n' +
      '// File2.cs —— 实现部分：补全业务初始化\n' +
      'public partial class Order\n' +
      '{\n' +
      '    public partial Order()\n' +
      '    {\n' +
      '        Lines.Add(new OrderLine { Qty = 1 });   // 默认带一行\n' +
      '    }\n' +
      '}\n\n' +
      'record OrderLine(int Qty);\n' +
      'var o = new Order();\n' +
      'Console.WriteLine(o.Lines.Count);   // 1'
    ,
    example2Title: '实战：partial 事件配合源生成器的惯用结构',
    example2:
      '// 生成的文件（源生成器产出）：你只管声明\n' +
      'public partial class ViewModel\n' +
      '{\n' +
      '    public partial event Action? DataChanged;\n' +
      '}\n\n' +
      '// 手写文件：提供事件实现与业务方法\n' +
      'public partial class ViewModel\n' +
      '{\n' +
      '    private Action? _handlers;\n\n' +
      '    public partial event Action? DataChanged\n' +
      '    {\n' +
      '        add    => _handlers += value;\n' +
      '        remove => _handlers -= value;\n' +
      '    }\n\n' +
      '    public void Refresh() => _handlers?.Invoke();\n' +
      '}\n\n' +
      'var vm = new ViewModel();\n' +
      'vm.DataChanged += () => Console.WriteLine("数据更新");\n' +
      'vm.Refresh();   // 数据更新'
  },
  {
    id: 'extension-members',
    title: '扩展成员：扩展属性与扩展块',
    version: 'C# 14',
    category: '面向对象',
    level: '进阶',
    summary: '在扩展方法之外，还能给类型"长"出扩展属性、静态成员，甚至带字段的扩展块。',
    detail: [
      'C# 14 引入新语法 extension(T target) { ... }，可在块内声明扩展属性、扩展事件和扩展标记的静态成员。',
      '扩展属性解决"想给接口/类型加个计算属性却没有实现权"的痛点：不要求目标类型实现，调用时按接收者绑定。',
      '扩展块可声明私有字段做缓存（Materialize once），语法上更接近"给类型补充成员"，而非静态工具方法。',
      '注意这是 C# 14 预览特性（.NET 10 中 extension 为前进兼容保留字），Roslyn 实现随版本逐步完善。'
    ],
    example:
      'using System.Collections.Generic;\n\n' +
      'public static class EnvExtensions\n' +
      '{\n' +
      '    extension(string text)\n' +
      '    {\n' +
      '        public bool IsBlank => string.IsNullOrWhiteSpace(text);\n' +
      '        public string Shout => text.ToUpperInvariant() + "!";\n' +
      '    }\n' +
      '}\n\n' +
      'string greeting = "hello";\n' +
      'Console.WriteLine(greeting.Shout);     // HELLO!\n' +
      'Console.WriteLine("".IsBlank);          // True\n' +
      'Console.WriteLine("  ".IsBlank);        // True'
    ,
    example2Title: '实战：给接口补默认行为（无需实现方改动）',
    example2:
      'public interface IProduct\n' +
      '{\n' +
      '    decimal Price { get; }\n' +
      '    int Qty { get; }\n' +
      '}\n\n' +
      'public static class ProductExtensions\n' +
      '{\n' +
      '    extension(IProduct p)\n' +
      '    {\n' +
      '        public decimal Total => p.Price * p.Qty;\n' +
      '    }\n' +
      '}\n\n' +
      'record Book(decimal Price, int Qty) : IProduct;\n' +
      '// 无需改 Book，直接获得 Total\n' +
      'var b = new Book(39.9m, 3);\n' +
      'Console.WriteLine(b.Total);    // 119.7\n\n' +
      '// 静态扩展成员：像给类型添加静态工厂\n' +
      'public static class ProductFactory\n' +
      '{\n' +
      '    extension(IProduct)\n' +
      '    {\n' +
      '        public static IProduct Free() => new Book(0m, 0);\n' +
      '    }\n' +
      '}\n' +
      '// Console.WriteLine(ProductFactory.Free() is Book);  // True'
  },

  // ==================== 委托与 LINQ ====================
  {
    id: 'lambda-modifiers',
    title: '简单 Lambda 的参数修饰符',
    version: 'C# 14',
    category: '委托与 LINQ',
    level: '进阶',
    summary: 'ref / out / in / params 等修饰符可以直接用在无类型标注的简明 Lambda 参数上。',
    detail: [
      '此前要给 Lambda 参数加 ref/out 等修饰符，必须同时把全部参数类型写全，样板很重。',
      'C# 14 允许在"简单 Lambda"（参数不带类型）上直接加修饰符，类型由参数列表推断——委托签名已知时尤为顺手。',
      '典型场景：把 (out int r) => ... 传给 TryParse 委托，或定义 curried 风格的 ref 处理函数。',
      '属于协作性小语言增强，不改变委托语义，仅减少类型标注冗余。'
    ],
    example:
      '// 之前：标记了 out 就必须写全所有参数类型\n' +
      'TryParse<int> old = (string text, out int result) => int.TryParse(text, out result);\n\n' +
      '// C# 14：简单 Lambda 直接上修饰符\n' +
      'TryParse<int> parse = (out int result) => int.TryParse("42", out result);\n\n' +
      'delegate bool TryParse<T>(string text, out T result);\n\n' +
      'if (parse("42", out var n))\n' +
      '    Console.WriteLine(n);     // 42\n\n' +
      '// ref 修饰符同理\n' +
      'delegate void Bump(ref int v);\n' +
      'Bump b = (ref int v) => v++;\n' +
      'int x = 10;\n' +
      'b(ref x);\n' +
      'Console.WriteLine(x);         // 11'
    ,
    example2Title: '实战：修饰符 + 局部函数组合的简洁玩法',
    example2:
      '// 传递 out 结果的回调组合\n' +
      'static void Measure(string raw, OutAction<int, int> report)\n' +
      '{\n' +
      '    int len = raw.Length;\n' +
      '    int caps = raw.Count(char.IsUpper);\n' +
      '    report(len, out var ratio);\n' +
      '    _ = caps;   // 比率只演示 out 用法\n' +
      '}\n\n' +
      'delegate void OutAction<T1, T2>(T1 a, out T2 b);\n\n' +
      'Measure("Hello", (int len, out int r) =>\n' +
      '{\n' +
      '    r = len * 2;\n' +
      '    Console.WriteLine($"len={len}, doubled={r}");\n' +
      '});\n' +
      '// len=5, doubled=10\n\n' +
      '// 简单 lambda + in：只读引用入参也能用修饰符\n' +
      'delegate void Squash(in int v);\n' +
      'Squash s = (in int v) => Console.WriteLine(Math.Abs(v));\n' +
      's(in -9);   // 9'
  },

  // ==================== 语法糖 ====================
  {
id: 'null-conditional-assignment',
    title: '空条件赋值 ?.=',
    version: 'C# 14',
    category: '语法糖',
    level: '入门',
    summary: 'foo?.Bar = value：左侧为 null 时整条赋值跳过，右侧表达式不会求值。',
    detail: [
      'C# 14 新增 ?.= 语法：当链式访问的接收者为 null 时，跳过整个赋值语句，避免手写 if (foo != null)。',
      '右侧值只在左侧"非 null 且整个链有效"时才求值，因此不用怕产生副作用（如调用方法）。',
      '可与符合赋值运算符组合：foo?.Value += 1，等价于 if (foo != null) foo.Value += 1。',
      '上层接收者为空时不抛异常，也不产生赋值；这是对空值传播语法的自然补全。'
    ],
    example:
      'class Config\n' +
      '{\n' +
      '    public int MaxRetry { get; set; } = 1;\n' +
      '}\n\n' +
      'Config? cfg = null;\n\n' +
      '// 之前：三行样板\n' +
      'if (cfg != null)\n' +
      '{\n' +
      '    cfg.MaxRetry = 5;\n' +
      '}\n\n' +
      '// C# 14：一行搞定，null 时安全忽略\n' +
      'cfg?.MaxRetry = 7;\n' +
      'Console.WriteLine("cfg 为 null，赋值被跳过，无异常");\n\n' +
      'cfg = new Config();\n' +
      'cfg?.MaxRetry = 9;              // 非 null，实际赋值\n' +
      'Console.WriteLine(cfg.MaxRetry);   // 9'
    ,
    example2Title: '实战：条件递增与短路求值',
    example2:
      'class Logger\n' +
      '{\n' +
      '    public int Level { get; set; } = 0;\n' +
      '}\n\n' +
      'Logger? log = null;\n\n' +
      '// 条件递增：null 时跳过，非 null 时 +1\n' +
      'log?.Level += 1;\n' +
      'Console.WriteLine("无日志器，跳过，安全");\n\n' +
      'log = new Logger();\n' +
      'log?.Level += 1;\n' +
      'log?.Level += 1;\n' +
      'Console.WriteLine(log.Level);    // 2\n\n' +
      '// 右侧只在左侧非 null 时才求值：方法副作用不会误触发\n' +
      'Logger? missing = null;\n' +
      'missing?.Level = Trace();   // 左侧为 null，Trace 不求值\n' +
      'Console.WriteLine("missing 为 null，Trace 未执行");\n' +
      'static int Trace() { Console.WriteLine("右侧求值"); return 99; }'
  },
  {
    id: 'nameof-unbound-generic',
    title: 'nameof 支持未绑定泛型',
    version: 'C# 14',
    category: '语法糖',
    level: '入门',
    summary: 'nameof(List<>) 直接得到 "List"，不再需要捏造一个类型实参。',
    detail: [
      '以往想取泛型类型名必须给实参：nameof(List<int>) 得 "List"——为了名字而凭空造类型很别扭。',
      'C# 14 允许写未绑定泛型：nameof(List<>)、nameof(Dictionary<,>) 直接返回泛型定义的名字。',
      '典型场景：日志、诊断、反射、源生成器、分析器里要打印"某个泛型类型"而不关心其参数。',
      '空括号表示单类型参数，逗号个数对应多个类型参数，写全与不写全一一对应。'
    ],
    example:
      'Console.WriteLine(nameof(List<>));        // List\n' +
      'Console.WriteLine(nameof(Dictionary<,>)); // Dictionary\n' +
      'Console.WriteLine(nameof(Task<>));        // Task\n\n' +
      '// 与 1 范型的闭式写法一致，但不再需要假实参\n' +
      'Console.WriteLine(nameof(List<int>));     // List（旧写法）\n\n' +
      '// 实际用途：放弃捏类型实参，直接记录泛型定义名\n' +
      'string typeName = nameof(Repository<>);\n' +
      'Console.WriteLine($"缓存键前缀：{typeName}");\n' +
      '// 缓存键前缀：Repository\n\n' +
      'class Repository<T> { }'
    ,
    example2Title: '实战：诊断信息里无痛记录泛型类型',
    example2:
      '// 断言某个契约（diagnostic / guard）时打出真正的泛型定义名\n' +
      'public static class Guard\n' +
      '{\n' +
      '    public static void RequiresType<T>()\n' +
      '    {\n' +
      '        // 记录 T 的“定义”语义，非某一实例\n' +
      '        Console.WriteLine($"约束对象：{typeof(T).Name}");\n' +
      '    }\n' +
      '}\n\n' +
      '// 在 API 契约日志里\n' +
      'Console.WriteLine(nameof(IRepository<>));    // IRepository\n' +
      'Console.WriteLine(nameof(IQueryable<>));     // IQueryable\n\n' +
      'interface IRepository<T> { }\n' +
      'interface IQueryable<T> { }\n\n' +
      'Guard.RequiresType<int>();    // 约束对象：Int32'
  },
  {
    id: 'user-compound-assignment',
    title: '用户自定义符合赋值运算符',
    version: 'C# 14',
    category: '语法糖',
    level: '高级',
    summary: '直接为类型定制 +=、<<= 等复合赋值语义，替代"先 + 再 ="。',
    detail: [
      '编译器历来把 a += b 重写为 a = a + b，要求类型可 + 且返回同型。C# 14 允许显式声明复合赋值运算符。',
      '意义：某些类型（如集合、位集、物理单位）的"追加/合并/旋转"语义不与普通 + 一致，直接自定义更内聚。',
      '语法：public static C operator +=(C left, C right) => ...; 返回左值类型。',
      '能吃到真正的原地语义：对象可变时可在 operator += 里就地修改并返回自身，减少分配。'
    ],
    example:
      'public readonly record struct Vec2(double X, double Y)\n' +
      '{\n' +
      '    public static Vec2 operator +(Vec2 a, Vec2 b)\n' +
      '        => new(a.X + b.X, a.Y + b.Y);\n\n' +
      '    // C# 14：直接定义复合赋值语义\n' +
      '    public static Vec2 operator +=(Vec2 a, Vec2 b)\n' +
      '        => new(a.X + b.X * 2, a.Y + b.Y * 2);\n' +
      '}\n\n' +
      'var v = new Vec2(1, 1);\n' +
      'v += new Vec2(1, 1);\n' +
      'Console.WriteLine(v);   // Vec2 { X = 3, Y = 3 }（+= 走自定义逻辑）\n\n' +
      'var w = new Vec2(1, 1) + new Vec2(1, 1);\n' +
      'Console.WriteLine(w);   // Vec2 { X = 2, Y = 2 }（+ 仍是普通加）'
    ,
    example2Title: '实战：位集与追加型集合的自定义复合赋值',
    example2:
      '// 位集：<<= 拼接、&= 求交的领域语义\n' +
      'readonly record struct Bits(ulong Mask)\n' +
      '{\n' +
      '    public static Bits operator &(Bits a, Bits b) => new(a.Mask & b.Mask);\n' +
      '    public static Bits operator |(Bits a, Bits b) => new(a.Mask | b.Mask);\n\n' +
      '    public static Bits operator &=(Bits a, Bits b) => new((a.Mask & b.Mask) | 1);\n' +
      '}\n\n' +
      'var a = new Bits(0b1100);\n' +
      'var b = new Bits(0b1010);\n' +
      'a &= b;                       // 自定义 &=：交集并置低位\n' +
      'Console.WriteLine(Convert.ToString(a.Mask, 2));   // 1001\n\n' +
      '// 结构体型直接赋值\n' +
      'var x = new Bits(0);\n' +
      'x |= new Bits(0b0100);\n' +
      'Console.WriteLine(Convert.ToString(x.Mask, 2));   // 100'
  },

  // ==================== 性能与底层 ====================
  {
    id: 'first-class-span',
    title: '一等公民 Span：隐式转换与泛型推断',
    version: 'C# 14',
    category: '性能与底层',
    level: '高级',
    summary: 'ReadOnlySpan<T> / Span<T> / T[] 之间添加隐式转换，新 Span 代码更顺手。',
    detail: [
      'C# 14 正式把 Span 族拉平为"语言一等公民"：为 T[]、ReadOnlySpan<T>、Span<T> 补充隐式转换规则。',
      '数组可以隐式当作 ReadOnlySpan<T> 传参，方法接收 Span 的版本与接收数组的版本能共存更自然的类型推断。',
      '意义：写高性能代码时少写 AsSpan()/AsReadOnlySpan()，扩展方法接收者（Span）能直接吃到数组实参。',
      '破坏性变更提示：个别表达式树的绑定可能受影响，重载解析以新规则为准；迁移前建议先跑分析器。'
    ],
    example:
      '// 传入数组自动转 ReadOnlySpan：无需 .AsSpan()\n' +
      'static int Sum(ReadOnlySpan<int> s)\n' +
      '{\n' +
      '    int t = 0;\n' +
      '    foreach (var v in s) t += v;\n' +
      '    return t;\n' +
      '}\n\n' +
      'Console.WriteLine(Sum(new[] { 1, 2, 3 })); // 6（隐式转换）\n\n' +
      '// Span 可作为扩展方法接收者\n' +
      'public static class SpanExtensions\n' +
      '{\n' +
      '    public static void Show(this ReadOnlySpan<char> chars)\n' +
      '        => Console.WriteLine($"<{chars.ToString()}>");\n' +
      '}\n\n' +
      '"hello".AsSpan().Show();       // <hello>\n' +
      'new[] { \'x\', \'y\' }.Show();     // <xy>（数组隐式符合接收者）'
    ,
    example2Title: '实战：不分配的字符串切分 + Span 化改写范例',
    example2:
      '// 解析 "1;2;3" 时传统用 string.Split 分配数组；Span 尾缀零分配\n' +
      'static int SumValues(ReadOnlySpan<char> text, char sep)\n' +
      '{\n' +
      '    int sum = 0;\n' +
      '    foreach (var seg in text.Split(sep))      // MemoryExtensions.Split（.NET 8+，SpanSplitEnumerator）\n' +
      '        sum += int.Parse(seg);\n' +
      '    return sum;\n' +
      '}\n\n' +
      '// ReadOnlySpan 与字符串可优雅互换，类型推断自动拥抱 Span\n' +
      'Console.WriteLine(SumValues("10;20;30".AsSpan(), \';\'));   // 60\n\n' +
      '// 泛型推断：数组、Span、字符串片段都能统一进同一签名\n' +
      'static string Join<T>(ReadOnlySpan<T> xs)\n' +
      '    => string.Join(", ", xs.ToArray());\n' +
      'Console.WriteLine(Join(new[] { 1, 2, 3 }));   // 1, 2, 3\n' +
      'ReadOnlySpan<char> part = "abcdef".AsSpan(2, 3);\n' +
      'Console.WriteLine(part.ToString());            // cde'
  }
];