// C# 特性详解 —— 第一部分：类型与属性、面向对象
module.exports = [
  // ==================== 类型与属性 ====================
  {
    id: 'auto-properties',
    title: '自动实现的属性',
    version: 'C# 3.0',
    category: '类型与属性',
    level: '入门',
    summary: '编译器自动生成隐藏的 backing field，用一行语法定义属性。',
    detail: [
      '在 C# 1.0/2.0 中，每个属性都要手写私有字段（backing field）与 get/set 访问器。自动属性让编译器代劳，字段由编译器自动生成（如 <Name>k__BackingField）。',
      '自动属性可以设置不同访问级别：通常是公开 get、私有 set，实现"对外只读、对内可变"的封装。',
      'C# 6.0 起支持属性初始化器，在声明处直接给默认值，省去构造函数赋值。',
      '如果访问器需要额外逻辑（校验、触发事件），可以只把其中一个访问器写成完整版本，另一个保持自动。'
    ],
    notes: [
      '序列化框架（System.Text.Json、EF Core）默认按公共属性映射，自动属性完全兼容。',
      '结构体中的自动属性在显式构造函数里必须全部赋值。'
    ],
    example:
      '// ========== 1. 旧写法：手动字段 + 访问器 ==========\n' +
      'public class LegacyUser\n' +
      '{\n' +
      '    private string _name;            // 手写 backing field\n' +
      '    public string Name\n' +
      '    {\n' +
      '        get { return _name; }\n' +
      '        set { _name = value; }\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 2. 新写法：自动属性 + 初始化器 ==========\n' +
      'public class User\n' +
      '{\n' +
      '    public string Name { get; set; } = "匿名";   // 带默认值\n' +
      '    public int Age { get; private set; }         // 外部只读、内部可改\n' +
      '    public DateTime CreatedAt { get; } = DateTime.Now; // 只有 get，构造后不可变\n' +
      '\n' +
      '    public User(string name, int age)\n' +
      '    {\n' +
      '        Name = name;\n' +
      '        Age = age;                  // private set 允许在类内部赋值\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 3. 混合写法：set 加校验，get 保持自动 ==========\n' +
      'public class Score\n' +
      '{\n' +
      '    private int _value;\n' +
      '    public int Value\n' +
      '    {\n' +
      '        get => _value;             // 自动 get 的逻辑由编译器生成\n' +
      '        set => _value = value switch\n' +
      '        {\n' +
      '            >= 0 and <= 100 => value,\n' +
      '            _ => throw new ArgumentOutOfRangeException(nameof(value), "分数必须在 0~100")\n' +
      '        };\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 4. 完整演示 ==========\n' +
      'var u = new User("张三", 20);\n' +
      'u.Name = "李四";          // 外部可改 Name\n' +
      '// u.Age = 21;           // ✘ 编译错误：Age 的 set 是 private\n' +
      'Console.WriteLine($"{u.Name} / {u.Age} / {u.CreatedAt:HH:mm}");\n' +
      '\n' +
      'var s = new Score();\n' +
      's.Value = 95;             // ✔\n' +
      '// s.Value = 150;        // ✘ 抛 ArgumentOutOfRangeException\n' +
      'Console.WriteLine(s.Value);'
  },
  {
    id: 'expression-bodied-members',
    title: '表达式主体成员',
    version: 'C# 6.0 / 7.0',
    category: '类型与属性',
    level: '入门',
    summary: '方法、属性、构造函数等成员可用 => 直接写成表达式。',
    detail: [
      '当方法体或访问器只有一条语句时，可以用 lambda 箭头 => 的形式书写，减少样板代码。',
      'C# 6.0 支持方法和只读属性；C# 7.0 扩展到构造函数、析构函数、set 访问器等几乎所有成员类型。',
      '表达式主体成员本质仍是方法体，只是语法糖；性能没有任何差别，纯粹是可读性取舍。'
    ],
    example:
      'public class Point\n' +
      '{\n' +
      '    public int X { get; }\n' +
      '    public int Y { get; }\n\n' +
      '    // 构造函数（C# 7.0）\n' +
      '    public Point(int x, int y) => (X, Y) = (x, y);\n\n' +
      '    // 只读属性：=> 右侧即返回值\n' +
      '    public double Length => Math.Sqrt(X * X + Y * Y);\n\n' +
      '    // 方法\n' +
      '    public override string ToString() => $"({X}, {Y})";\n\n' +
      '    // 带语句体的方法也能用 =>（两行仍算一个表达式）\n' +
      '    public double DistanceTo(Point other) =>\n' +
      '        Math.Sqrt(Math.Pow(X - other.X, 2) + Math.Pow(Y - other.Y, 2));\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'var a = new Point(3, 4);\n' +
      'var b = new Point(0, 0);\n' +
      'Console.WriteLine(a);                 // (3, 4)\n' +
      'Console.WriteLine(a.Length);          // 5\n' +
      'Console.WriteLine(a.DistanceTo(b));   // 5'
  },
  {
    id: 'nullable-reference-types',
    title: '可空引用类型（NRT）',
    version: 'C# 8.0',
    category: '类型与属性',
    level: '进阶',
    summary: 'string? 表示可能为 null，编译期即可发现 NullReferenceException 隐患。',
    detail: [
      '开启 <Nullable>enable</Nullable> 后，引用类型默认不可为 null；可空引用必须加 ? 后缀显式声明。编译器会进行流分析（flow analysis），跟踪变量在每个使用点是否已判空。',
      '常用操作符：?. 空条件（左侧为 null 则短路返回 null）、?? 空合并（提供回退值）、! 抑制警告（null-forgiving，表示"我保证非空"，出事自己负责）。',
      'NRT 是纯编译期检查，运行时 string 和 string? 是同一个类型，不带来任何运行时开销。',
      '大型项目迁移建议：先在 csproj 中开启 <Nullable>annotations</Nullable> 只启用注解检查，逐步修复后再切到 enable。'
    ],
    notes: [
      '! 操作符只是压制警告，不做任何运行时保护——滥用等于关掉安全网。',
      'DTO 反序列化场景注意：JSON 缺少字段时非空属性仍可能被填入 null，需配合 required 或构造函数约束。'
    ],
    example:
      '#nullable enable\n' +
      'using System.Collections.Generic;\n\n' +
      'public class UserService\n' +
      '{\n' +
      '    private readonly Dictionary<int, string> _users = new()\n' +
      '    {\n' +
      '        [1] = "张三",\n' +
      '        [2] = "李四",\n' +
      '    };\n\n' +
      '    // 返回可空：用户可能不存在\n' +
      '    public string? GetName(int id)\n' +
      '    {\n' +
      '        // 字典里没有时 GetValueOrDefault 返回 null\n' +
      '        return _users.TryGetValue(id, out var name) ? name : null;\n' +
      '    }\n\n' +
      '    public int GetNameLength(int id)\n' +
      '    {\n' +
      '        string? name = GetName(id);\n' +
      '        // return name.Length;          // ✘ CS8602：可能为 null\n' +
      '        if (name != null)\n' +
      '            return name.Length;         // ✔ 流分析确认此分支已判空\n' +
      '        return 0;                        // ✔ 兜底\n' +
      '    }\n\n' +
      '    public string NameOrDefault(int id) =>\n' +
      '        GetName(id) ?? "未知用户";        // ?? 提供回退值\n' +
      '}\n\n' +
      '// 完整演示：编译器全程帮你盯住 null\n' +
      'var svc = new UserService();\n' +
      'Console.WriteLine(svc.GetNameLength(1));      // 2\n' +
      'Console.WriteLine(svc.GetNameLength(99));     // 0（不存在）\n' +
      'Console.WriteLine(svc.NameOrDefault(2));      // 李四\n' +
      'Console.WriteLine(svc.NameOrDefault(99));     // 未知用户'
  },
  {
    id: 'record-types',
    title: 'record 记录类型',
    version: 'C# 9.0',
    category: '类型与属性',
    level: '进阶',
    summary: '一行定义不可变数据载体，自动获得值相等性、with 表达式与 ToString。',
    detail: [
      'record 是为"数据"设计的引用类型：编译器自动生成所有属性的 Equals/GetHashCode、基于全部字段的 ToString 以及 protected 拷贝构造函数。',
      '相等性按值比较：两个 record 实例只要属性全部相同即视为相等，这与普通 class 的引用相等截然不同。',
      'with 表达式创建修改了部分属性的副本（非破坏性变异）：底层调用拷贝构造函数再修改指定属性，原对象不受影响。',
      '主构造函数参数默认生成公有 init 属性；若想自定义某属性行为，可在类体内重新声明同名属性。C# 10 还提供 record struct 用于值类型场景。'
    ],
    notes: [
      'record 内含集合属性时，值相等只比较集合引用本身；深比较需自行重写或改用不可变集合。',
      '继承链上的 record 相等包含运行时类型判断：基类实例与派生类实例即使字段相同也不相等。'
    ],
    example:
      '// ========== 基础：值相等 + 解构 ==========\n' +
      'public record Person(string Name, int Age);\n\n' +
      'var p1 = new Person("张三", 20);\n' +
      'var p2 = new Person("张三", 20);\n\n' +
      'Console.WriteLine(p1 == p2);                 // True  —— 值相等\n' +
      'Console.WriteLine(ReferenceEquals(p1, p2));  // False —— 仍是不同对象\n' +
      'Console.WriteLine(p1);                       // Person { Name = 张三, Age = 20 }\n' +
      'var (name, age) = p1;                        // 自动解构\n' +
      'Console.WriteLine($"{name} / {age}");\n\n' +
      '// ========== with：非破坏性复制修改 ==========\n' +
      'var p3 = p1 with { Age = 21 };               // p1 不受影响\n' +
      'Console.WriteLine(p1);                       // Person { Name = 张三, Age = 20 }\n' +
      'Console.WriteLine(p3);                       // Person { Name = 张三, Age = 21 }'
    ,
    example2Title: 'record 继承、方法重写与 record struct',
    example2:
      '// ========== 继承 ==========\n' +
      'public record Person(string Name, int Age)\n' +
      '{\n' +
      '    public virtual string Greet() => $"我是 {Name}";\n' +
      '}\n\n' +
      'public record Employee(string Name, int Age, string Dept)\n' +
      '    : Person(Name, Age)\n' +
      '{\n' +
      '    public decimal Salary { get; init; }\n' +
      '    public override string Greet() => $"{Name}（{Dept}部门）";\n\n' +
      '    // 自定义打印字段\n' +
      '    protected override bool PrintMembers(StringBuilder sb)\n' +
      '    {\n' +
      '        base.PrintMembers(sb);\n' +
      '        sb.Append(", Dept = ").Append(Dept);\n' +
      '        return true;\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== record struct（值类型记录）==========\n' +
      'public readonly record struct Money(decimal Amount, string Currency);\n\n' +
      'var e = new Employee("王五", 30, "研发") { Salary = 20000 };\n' +
      'Console.WriteLine(e);        // Employee { Name = 王五, Age = 30, Dept = 研发 }\n' +
      'Console.WriteLine(e.Greet());\n\n' +
      'Money m = new(99.9m, "CNY");\n' +
      'Console.WriteLine(m);        // Money { Amount = 99.9, Currency = CNY }'
  },
  {
    id: 'init-setters',
    title: 'init 只读初始化器',
    version: 'C# 9.0',
    category: '类型与属性',
    level: '进阶',
    summary: '对象只能在初始化时赋值，之后不可更改——比 set 更安全的不变性。',
    detail: [
      'init 访问器只在对象初始化期间有效，编译器通过给属性打 modreq(IsExternalInit) 标记、由运行时强制执行 initonly 语义。初始化结束后再赋值直接编译失败。',
      '它让普通 class 也能像 record 一样安全地使用对象初始化器构建不可变对象，是"不可变数据模型"的标准做法。',
      '与 readonly 字段相比，init 属性支持对象初始化器语法，且可以被反序列化框架正常赋值。'
    ],
    notes: [
      '库作者导出含 init 属性的类型时，下游用旧编译器会报错（modreq 影响二进制兼容），目标框架 .NET 5+ 无此问题。'
    ],
    example:
      'public class Config\n' +
      '{\n' +
      '    public string Host { get; init; }\n' +
      '    public int Port { get; init; } = 8080;\n' +
      '    public string Env { get; init; } = "dev";\n' +
      '}\n\n' +
      'var c = new Config { Host = "localhost", Port = 5432 };\n' +
      '// c.Port = 80;   // ✘ CS8852：init 属性只能在对象初始化时赋值\n' +
      'Console.WriteLine($"{c.Host}:{c.Port}/{c.Env}");   // localhost:5432/dev\n\n' +
      '// ========== 与 record 配合构成完整不可变模型 ==========\n' +
      'public record OrderItem(string Sku, int Qty, decimal Price)\n' +
      '{\n' +
      '    public decimal Subtotal => Qty * Price;   // 计算属性天然只读\n' +
      '}\n\n' +
      'var item = new OrderItem("BOOK", 2, 59.9m);\n' +
      'Console.WriteLine(item.Subtotal);             // 119.8\n' +
      '// item.Qty = 3;   // ✘ init 不可变'
  },
  {
    id: 'required-members',
    title: 'required 成员',
    version: 'C# 11.0',
    category: '类型与属性',
    level: '进阶',
    summary: '强制调用者必须在初始化器中显式赋值的属性，漏写即编译错误。',
    detail: [
      'required 修饰的属性必须出现在对象初始化器中，漏写的错误在编译期就能发现，而不是等到运行时 NRE。',
      '常与 [SetsRequiredMembers] 构造函数配合：标注了该特性的构造函数被视为已设置所有必需成员，允许不经过初始化器创建对象。',
      '[RequiredMember] 元数据会被写入程序集，供反射与序列化框架识别。System.Text.Json 从 .NET 8 起支持 required 属性的反序列化校验。'
    ],
    notes: [
      'new() 泛型约束无法设置 required 成员，此时应改用工厂方法或带参构造函数。'
    ],
    example:
      'public class Order\n' +
      '{\n' +
      '    public required string ProductName { get; init; }\n' +
      '    public required decimal Amount { get; init; }\n' +
      '    public string? Remark { get; init; }           // 可选，可留空\n' +
      '\n' +
      '    [SetsRequiredMembers]                           // 视为已赋全部必需成员\n' +
      '    public Order(string name, decimal amount)\n' +
      '    {\n' +
      '        ProductName = name;\n' +
      '        Amount = amount;\n' +
      '    }\n' +
      '}\n\n' +
      '// ✔ 初始化器写法：必须包含 ProductName 与 Amount\n' +
      'var ok1 = new Order { ProductName = "书", Amount = 59.9m };\n' +
      '// ✔ 构造函数写法：同样合法\n' +
      'var ok2 = new Order("书", 59.9m);\n' +
      '// ✘ 编译错误 CS9035：缺少 required 属性 ProductName\n' +
      '// var bad = new Order { Amount = 10 };\n' +
      'Console.WriteLine($"{ok1.ProductName} / {ok1.Amount}");'
  },
  {
    id: 'primary-constructors',
    title: '主构造函数',
    version: 'C# 12.0',
    category: '类型与属性',
    level: '进阶',
    summary: '把参数直接写在类型名后，自动捕获为字段或在全类可见。',
    detail: [
      'class/struct/interface 名后可直接跟参数列表，参数在整个类型体中可见；若参数被成员引用，编译器隐式生成为私有字段（捕获语义）。',
      '主构造函数参数不是属性！它只是构造函数形参，被捕获后才成为字段，因此不会出现在序列化结果里。',
      '声明了主构造函数后仍可添加更多构造函数，但它们必须用 this(...) 链式调用主构造函数。',
      '极大简化依赖注入服务类的样板代码：传统写法要把同一个名字重复三遍（参数、字段、赋值）。'
    ],
    notes: [
      '捕获的字段名就是参数名（如 baseUrl/http），调试窗口看到的私有字段属于编译器生成行为。'
    ],
    example:
      '// ========== 1. 简化服务类（依赖注入）==========\n' +
      'public class Service(string baseUrl, HttpClient http)\n' +
      '{\n' +
      '    public async Task<string> GetAsync(string path)\n' +
      '    {\n' +
      '        // baseUrl / http 在整个类体可见，无需手动声明字段\n' +
      '        return await http.GetStringAsync(baseUrl + path);\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 2. 添加额外构造函数须链式调用 ==========\n' +
      'public class Logger(string prefix)\n' +
      '{\n' +
      '    public Logger() : this("[LOG]") { }   // 委托给主构造函数\n' +
      '    public void Write(string msg) => Console.WriteLine($"{prefix} {msg}");\n' +
      '}\n\n' +
      '// ========== 3. 对比传统写法（重复三遍）==========\n' +
      'public class OldService\n' +
      '{\n' +
      '    private readonly string _baseUrl;\n' +
      '    private readonly HttpClient _http;\n' +
      '    public OldService(string baseUrl, HttpClient http)\n' +
      '        => (_baseUrl, _http) = (baseUrl, http);\n' +
      '}\n\n' +
      '// 演示\n' +
      'var logger = new Logger();\n' +
      'logger.Write("启动完成");     // [LOG] 启动完成'
  },
  {
    id: 'tuples',
    title: '元组 ValueTuple 与解构',
    version: 'C# 7.0',
    category: '类型与属性',
    level: '入门',
    summary: '(int, string) 轻量多返回值，支持命名元素与解构赋值。',
    detail: [
      'ValueTuple 是栈上的轻量结构体，适合方法返回多个值而无需定义专门类型；元素名只存在于编译期，运行时不保留。',
      '解构（deconstruction）不仅适用于元组：自定义类型实现 Deconstruct 方法后也能用 var (a, b) = obj 语法拆解。',
      '弃元 _ 可以忽略不需要的返回值：(int lo, _) = FindRange(nums)。',
      '元组相等按元素逐一比较（== 自 C# 7.3 支持）。'
    ],
    notes: [
      '公开 API 建议返回具名元组或专用 record，避免调用方拿到 Item1/Item2 这种无意义名字。'
    ],
    example:
      '(int min, int max) FindRange(int[] nums)\n' +
      '{\n' +
      '    return (nums.Min(), nums.Max());\n' +
      '}\n\n' +
      'int[] data = { 3, 1, 4, 1, 5, 9, 2, 6 };\n' +
      'var (lo, hi) = FindRange(data);          // 解构接收\n' +
      'Console.WriteLine($"范围 {lo}~{hi}");     // 范围 1~9\n\n' +
      'int a = 1, b = 2;\n' +
      '(a, b) = (b, a);                          // 一行交换变量\n' +
      'Console.WriteLine($"a={a}, b={b}");       // a=2, b=1\n\n' +
      '// 弃元：只关心最小值\n' +
      '(int minimum, _) = FindRange(data);\n' +
      'Console.WriteLine(minimum);\n\n' +
      '// 元组相等（C# 7.3+）\n' +
      'var t1 = (1, "x");\n' +
      'var t2 = (1, "x");\n' +
      'Console.WriteLine(t1 == t2);              // True'
    ,
    example2Title: '自定义类型的解构支持',
    example2:
      'public readonly record struct Point(int X, int Y)\n' +
      '{\n' +
      '    // 提供第三个 out 参数即可用 var (x, y, len) 解构\n' +
      '    public void Deconstruct(out int x, out int y, out double len)\n' +
      '    {\n' +
      '        x = X;\n' +
      '        y = Y;\n' +
      '        len = Math.Sqrt(X * X + Y * Y);\n' +
      '    }\n' +
      '}\n\n' +
      'var p = new Point(3, 4);\n' +
      'var (x, y, length) = p;                   // length == 5\n' +
      'Console.WriteLine($"({x},{y}) 长度 {length}");'
  },
  {
    id: 'nullable-value-types',
    title: '可空值类型 Nullable<T>',
    version: 'C# 2.0',
    category: '类型与属性',
    level: '入门',
    summary: 'int? 让值类型也能表达"没有值"，数据库字段、可选配置的标准建模方式。',
    detail: [
      '值类型不能为 null，但大量场景需要"缺省"语义：数据库 NULL 列、可选参数、尚未赋值的日期等。Nullable<T> 包装结构解决了这个问题，int? 是 Nullable<int> 的语法糖。',
      '核心成员：HasValue 判断是否有值、Value 取值（无值时抛 InvalidOperationException）、GetValueOrDefault() 安全取默认值。',
      '提升运算符：可空值类型参与算术运算时，任一操作数为 null 结果即为 null（SQL 三值逻辑风格）。',
      'bool? 有独特的三态用法：true/false/null 常用于"同意/拒绝/未表态"。'
    ],
    notes: [
      'int? 与 int 比较：null 参与的 == 返回 false，!= 返回 true；但 < > <= >= 一律返回 false。',
      'foreach 遍历 List<int?> 到 int 时会自动过滤 null（Where + Value 的语法糖）。'
    ],
    example:
      'int? qty = null;\n' +
      'DateTime? shippedAt = null;             // 可能还没发货\n\n' +
      'if (qty.HasValue)\n' +
      '    Console.WriteLine(qty.Value * 2);  // 仅在有值时取值\n' +
      'else\n' +
      '    Console.WriteLine("数量未知");\n\n' +
      'int actual   = qty ?? 0;              // ?? 回退值\n' +
      'int fallback = qty.GetValueOrDefault(5); // 方法形式回退\n' +
      'Console.WriteLine($"actual={actual}, fallback={fallback}");\n\n' +
      '// 提升运算符：任一为 null 结果为 null\n' +
      'int? a = 3, b = null;\n' +
      'Console.WriteLine(a + b == null);      // True\n\n' +
      '// 三态 bool：同意/拒绝/未表态\n' +
      'bool? agreed = null;\n' +
      'Console.WriteLine(agreed is true);     // False\n\n' +
      '// 属性模式安全解包（C# 9）\n' +
      'int? maybe = 10;\n' +
      'if (maybe is { } v) Console.WriteLine(v);  // 10'
  },

  // ==================== 面向对象 ====================
  {
    id: 'extension-methods',
    title: '扩展方法',
    version: 'C# 3.0',
    category: '面向对象',
    level: '入门',
    summary: '给既有类型"外挂"实例方法，不修改原类型、无需继承。',
    detail: [
      '静态类中的静态方法，第一个参数加 this 即成为扩展方法。调用方式与实例方法完全一致，编译器实际改写为静态调用。',
      '解析优先级：类型自身实例方法 > 扩展方法。若原类型后来新增同名方法，会静默"遮蔽"你的扩展方法。',
      'LINQ 的全部 Where/Select 等操作符都是 IEnumerable<T> 上的扩展方法，这是扩展方法最重要的应用。',
      '扩展方法的命名空间必须被 using 导入才可见；工具库通常放在独立的 *.Extensions 命名空间。'
    ],
    notes: [
      '对 null 接收者调用扩展方法不会抛 NRE（this 参数为 null），方法内部需自行判空。',
      '扩展属性目前不支持，但 C# 14 的 extension 成员提案正在路上。'
    ],
    example:
      'using System.Linq;\n' +
      'using System.Collections.Generic;\n\n' +
      'public static class StringExtensions\n' +
      '{\n' +
      '    // 回文判断\n' +
      '    public static bool IsPalindrome(this string s)\n' +
      '    {\n' +
      '        if (string.IsNullOrEmpty(s)) return true;\n' +
      '        var r = new string(s.Reverse().ToArray());\n' +
      '        return s.Equals(r, System.StringComparison.OrdinalIgnoreCase);\n' +
      '    }\n\n' +
      '    // 泛型约束版 Clamp\n' +
      '    public static T Clamp<T>(this T v, T min, T max) where T : IComparable<T>\n' +
      '        => v.CompareTo(min) < 0 ? min : v.CompareTo(max) > 0 ? max : v;\n\n' +
      '    // 过滤掉序列中的 null\n' +
      '    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source)\n' +
      '        where T : class\n' +
      '        => source.Where(x => x != null)!;\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'Console.WriteLine("level".IsPalindrome());     // true\n' +
      'Console.WriteLine("abc".IsPalindrome());      // false\n' +
      'Console.WriteLine(15.Clamp(0, 10));           // 10\n' +
      'Console.WriteLine((-3).Clamp(0, 10));         // 0\n\n' +
      'string?[] names = { "a", null, "b" };\n' +
      'Console.WriteLine(string.Join(",", names.WhereNotNull()));  // a,b'
  },
  {
    id: 'default-interface-methods',
    title: '接口默认实现（DIM）',
    version: 'C# 8.0',
    category: '面向对象',
    level: '进阶',
    summary: '接口可以有方法体，新增接口成员不再破坏已有实现类。',
    detail: [
      '类似 Java 的 default method。实现类未重写时使用接口里的默认逻辑，同时可在实现类中显式调用 base 接口实现。',
      '这让接口接近 trait，可用于混入通用行为；也允许接口包含静态成员、静态虚成员（static abstract，泛型数学的基础）。',
      '注意：通过接口引用才能调用默认实现，直接用实现类实例调用不到。'
    ],
    example:
      'public interface ILogger\n' +
      '{\n' +
      '    void Log(string message);\n\n' +
      '    // 默认实现：基于 Log 组合出 Warn\n' +
      '    void Warn(string message) => Log("[WARN] " + message);\n' +
      '    void Error(string message) => Log("[ERROR] " + message);\n' +
      '}\n\n' +
      'public class ConsoleLogger : ILogger\n' +
      '{\n' +
      '    public void Log(string message) => Console.WriteLine(message);\n' +
      '    // 无需实现 Warn/Error，自动继承默认版本\n' +
      '}\n\n' +
      '// 完整演示：必须通过接口引用才能调用默认实现\n' +
      'ILogger log = new ConsoleLogger();\n' +
      'log.Log("启动");                 // 启动\n' +
      'log.Warn("内存偏高");            // [WARN] 内存偏高\n' +
      'log.Error("连接失败");           // [ERROR] 连接失败\n\n' +
      '// 静态虚成员：泛型算法的接口约束（.NET 7 泛型数学）\n' +
      'public interface IAddable<T> where T : IAddable<T>\n' +
      '{\n' +
      '    static abstract T operator +(T left, T right);\n' +
      '}'
  },
  {
    id: 'operator-overloading-modern',
    title: '运算符重载与隐式转换',
    version: 'C# 1.0+',
    category: '面向对象',
    level: '进阶',
    summary: '为自定义类型定义 + - == 等，让领域模型表达自然数学语义。',
    detail: [
      '运算符必须声明为 public static。重载 == 时应同时重写 Equals 与 GetHashCode，否则字典/集合行为异常。',
      'implicit/explicit 关键字定义类型转换：implicit 用于无损转换，explicit 需要强制转换语法并可能丢失信息。',
      'checked 用户自定义运算符（C# 11）允许区分溢出检查版本。'
    ],
    example:
      'public readonly record struct Money(decimal Amount, string Currency)\n' +
      '{\n' +
      '    public static Money operator +(Money a, Money b) =>\n' +
      '        a.Currency == b.Currency\n' +
      '            ? new(a.Amount + b.Amount, a.Currency)\n' +
      '            : throw new InvalidOperationException("币种不同，无法相加");\n\n' +
      '    public static Money operator *(Money m, int times) =>\n' +
      '        new(m.Amount * times, m.Currency);\n\n' +
      '    public static Money operator -(Money a, Money b) =>\n' +
      '        a.Currency == b.Currency\n' +
      '            ? new(a.Amount - b.Amount, a.Currency)\n' +
      '            : throw new InvalidOperationException("币种不同");\n\n' +
      '    // 隐式转换：Money -> decimal 金额\n' +
      '    public static implicit operator decimal(Money m) => m.Amount;\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'var total = new Money(10m, "CNY") * 3 + new Money(5m, "CNY");  // 35 CNY\n' +
      'Console.WriteLine($"{total.Amount} {total.Currency}");         // 35 CNY\n' +
      'decimal d = total;                                            // 隐式转换 -> 35\n' +
      'Console.WriteLine(d);'
  },
  {
    id: 'generics-constraints',
    title: '泛型与约束',
    version: 'C# 2.0+',
    category: '面向对象',
    level: '入门',
    summary: 'where T : class/new()/IComparable<T> 等约束让泛型既通用又安全。',
    detail: [
      '.NET 泛型在 IL 层面是真泛型（不同于 Java 类型擦除），值类型无装箱开销。',
      '常见约束：where T : struct / class / new() / BaseClass / Interface / notnull / unmanaged / default。',
      '多个约束可用逗号叠加：where T : class, IEntity, new()。',
      'C# 8 起 typeof(T).Name 等反射之外还可配合静态抽象接口成员（泛型数学）做零开销抽象。'
    ],
    example:
      '// 比较约束\n' +
      'public static T Max<T>(T a, T b) where T : IComparable<T>\n' +
      '    => a.CompareTo(b) >= 0 ? a : b;\n\n' +
      '// 无参构造约束\n' +
      'public static T Create<T>() where T : new() => new T();\n\n' +
      '// 接口 + 基类 + new 多约束组合\n' +
      'public interface IEntity { Guid Id { get; set; } }\n' +
      'public class Repo<T> where T : class, IEntity, new()\n' +
      '{\n' +
      '    private readonly List<T> _items = new();\n' +
      '    public T New() { var e = new T(); e.Id = Guid.NewGuid(); _items.Add(e); return e; }\n' +
      '    public IReadOnlyList<T> All => _items;\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'Console.WriteLine(Max(3, 7));              // 7\n' +
      'Console.WriteLine(Max("apple", "banana")); // banana\n' +
      'var repo = new Repo<MyEntity>();\n' +
      'var e1 = repo.New();\n' +
      'Console.WriteLine(e1.Id != Guid.Empty);   // True\n\n' +
      'public class MyEntity : IEntity { public Guid Id { get; set; } }'
  },
  {
    id: 'partial-types',
    title: '分部类与分部方法',
    version: 'C# 2.0 / 3.0',
    category: '面向对象',
    level: '入门',
    summary: 'partial 关键字把一个类型拆到多个文件，人机分工、源码生成的基石。',
    detail: [
      'partial 让同一个 class/struct/interface/method 的定义分散在多个文件，编译时合并为一个类型。',
      '典型用途：WinForm/WPF 设计器代码与手写代码分离；EF 实体脚手架与业务逻辑分离。',
      '分部方法（C# 3）：声明与实现分离，未实现时调用整体被移除，零开销。C# 9 扩展支持分部属性。',
      'Source Generator（源码生成器）大量依赖 partial：生成器补全另一半实现。'
    ],
    example:
      '// ===== File1.cs —— 手写的业务部分 =====\n' +
      'public partial class Customer\n' +
      '{\n' +
      '    public string Name { get; set; } = "";\n' +
      '    private string _last;\n\n' +
      '    public void Rename(string newName)\n' +
      '    {\n' +
      '        _last = Name;\n' +
      '        Name = newName;\n' +
      '        OnNameChanged(_last, newName);   // 分部方法调用\n' +
      '    }\n' +
      '}\n\n' +
      '// ===== File2.cs —— 工具/生成器产生的部分 =====\n' +
      'public partial class Customer\n' +
      '{\n' +
      '    public int Id { get; set; }\n\n' +
      '    // 分部方法声明（在 File1 中调用，这里提供实现）\n' +
      '    partial void OnNameChanged(string oldName, string newName)\n' +
      '    {\n' +
      '        Console.WriteLine($"改名: {oldName} -> {newName}");\n' +
      '    }\n' +
      '}\n\n' +
      '// 完整演示\n' +
      'var c = new Customer { Id = 1, Name = "旧名" };\n' +
      'c.Rename("新名");     // 输出：改名: 旧名 -> 新名'
  },
  {
    id: 'enum-flags',
    title: '枚举与 [Flags] 位标志',
    version: 'C# 1.0',
    category: '面向对象',
    level: '入门',
    summary: '枚举是具名整型常量集合；[Flags] 让一个值能同时表示多个选项。',
    detail: [
      '枚举底层是整型（默认 int），可指定底层数据类型 enum FileAccess : byte。',
      '[Flags] 特性配合 2 的幂次取值，支持 | 合并、& 检查、^ 取反等位运算，ToString 会输出组合名称。',
      'HasFlag 方法可读但存在装箱开销，高频路径建议用位运算判断。'
    ],
    example:
      'public enum OrderStatus { Pending, Paid, Shipped, Completed, Cancelled }\n\n' +
      '[Flags]\n' +
      'public enum Permissions\n' +
      '{\n' +
      '    None  = 0,\n' +
      '    Read  = 1,\n' +
      '    Write = 2,\n' +
      '    Delete = 4,\n' +
      '    Admin = Read | Write | Delete      // = 7\n' +
      '}\n\n' +
      '// 合并权限\n' +
      'var p = Permissions.Read | Permissions.Write;\n' +
      'Console.WriteLine(p);                          // Read, Write\n\n' +
      '// 检查是否拥有某项\n' +
      'bool canDelete = (p & Permissions.Delete) != 0;   // false\n' +
      'bool canRead   = p.HasFlag(Permissions.Read);     // true\n' +
      'Console.WriteLine($"canDelete={canDelete}, canRead={canRead}");\n\n' +
      '// 增加 / 移除权限\n' +
      'p |= Permissions.Delete;                         // 加 Delete\n' +
      'p &= ~Permissions.Write;                        // 去掉 Write\n' +
      'Console.WriteLine(p);                           // Read, Delete\n' +
      'Console.WriteLine((Permissions)7 == Permissions.Admin); // True'
  },
  {
    id: 'generic-variance',
    title: '泛型协变与逆变 out/in',
    version: 'C# 4.0',
    category: '面向对象',
    level: '高级',
    summary: 'IEnumerable<Derived> 可以当作 IEnumerable<Base> 使用——理解 out 与 in。',
    detail: [
      '协变（out）：T 只出现在输出位置（返回值），IEnumerable<out T> 允许派生集合赋给基类集合接口。',
      '逆变（in）：T 只出现在输入位置（参数），Action<in T> / IComparer<in T> 允许基类委托接收派生参数。',
      'class 与 interface 才支持变体标注，struct 参与的类型不变（List<Dog> 不是 IEnumerable<Animal> 的例外情况不存在——Dog 为 class 时可以，struct 不行）。'
    ],
    notes: [
      '不变类型如 IList<T> 既读又写 T，无法安全协变/逆变，这是类型安全的必然结果。'
    ],
    example:
      'class Animal { public int Age; }\n' +
      'class Dog : Animal { public void Bark() { } }\n\n' +
      'var dogs = new List<Dog>();\n' +
      '// List<T> 是不变的：List<Animal> a = dogs;            // ✘ 编译错误\n' +
      'IEnumerable<Animal> animals = dogs;                  // ✔ 协变 out：派生集合可赋基类接口\n' +
      'foreach (var a in animals) Console.WriteLine(a.Age);\n\n' +
      '// 逆变 in：基类委托可接收派生参数\n' +
      'Action<Animal> feed = a => Console.WriteLine($"喂食 {a.Age} 岁");\n' +
      'Action<Dog> feedDog = feed;                          // ✔\n' +
      'feedDog(new Dog { Age = 3 });\n\n' +
      '// IComparer<in T> 逆变：用基类比较器排派生集合\n' +
      'Comparer<Animal> byAge = Comparer<Animal>.Create(\n' +
      '    (x, y) => x.Age.CompareTo(y.Age));\n' +
      'dogs.Sort(byAge);                                    // ✔\n' +
      'Console.WriteLine(dogs.Count);'
  }
];
