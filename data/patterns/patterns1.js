// C# 设计模式详解 —— 第一组：创建型 + 结构型（共 12 种）
module.exports = [
  // ==================== 创建型 ====================
  {
    id: 'singleton',
    title: '单例模式 Singleton',
    category: '创建型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '保证一个类只有一个实例，并提供全局访问点。',
    detail: [
      '单例把实例化和访问入口集中到一处，常用于日志器、配置、连接池等"全局唯一"的资源。',
      '最推荐的 C# 实现是 Lazy<T>，由 CLR 保证线程安全与延迟初始化，比双重检查锁更简洁。',
      '注意单例的"全局状态"会增大测试难度，能用依赖注入传入单例服务就不要到处引用静态实例。'
    ],
    notes: [
      '不要把单例和静态类混为一谈：单例可实现接口、可被替换为子类、支持延迟初始化。',
      '多例（如按 key 的多例）可用 ConcurrentDictionary 实现，本质是小对象池。'
    ],
    example:
      'using System;\n' +
      'using System.Threading;\n\n' +
      '// ========== 1. 推荐写法：Lazy<T> 线程安全惰性单例 ==========\n' +
      'public sealed class AppConfig\n' +
      '{\n' +
      '    private static readonly Lazy<AppConfig> _instance =\n' +
      '        new(() => new AppConfig());\n\n' +
      '    public static AppConfig Instance => _instance.Value;\n\n' +
      '    public string ApiBase { get; }\n' +
      '    public int TimeoutMs { get; }\n\n' +
      '    private AppConfig()\n' +
      '    {\n' +
      '        // 模拟从文件 / 环境变量加载，只执行一次\n' +
      '        ApiBase = Environment.GetEnvironmentVariable("API_BASE")\n' +
      '                  ?? "https://api.example.com";\n' +
      '        TimeoutMs = 5000;\n' +
      '        Console.WriteLine("[AppConfig] 初始化完成");\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 2. 日志器：单例实现接口，便于测试替换 ==========\n' +
      'public interface ILogger\n' +
      '{\n' +
      '    void Info(string msg);\n' +
      '}\n\n' +
      'public sealed class FileLogger : ILogger\n' +
      '{\n' +
      '    private static readonly Lazy<FileLogger> _inst = new(() => new FileLogger());\n' +
      '    public static FileLogger Instance => _inst.Value;\n' +
      '    private readonly object _lock = new();\n\n' +
      '    private FileLogger() { }\n\n' +
      '    public void Info(string msg)\n' +
      '    {\n' +
      '        lock (_lock)\n' +
      '            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {msg}");\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 3. 使用演示 ==========\n' +
      'var a = AppConfig.Instance;\n' +
      'var b = AppConfig.Instance;\n' +
      'Console.WriteLine(ReferenceEquals(a, b));   // True，同一实例\n' +
      'Console.WriteLine($"{a.ApiBase} timeout={a.TimeoutMs}");\n\n' +
      'FileLogger.Instance.Info("服务启动");\n' +
      'FileLogger.Instance.Info("读取配置完成");'
    ,
    example2Title: '双重检查锁、静态构造与 DI 友好写法',
    example2:
      'using System;\n' +
      'using System.Collections.Concurrent;\n\n' +
      '// ========== 1. 双重检查锁（了解即可，优先用 Lazy<T>） ==========\n' +
      'public sealed class DclSingleton\n' +
      '{\n' +
      '    private static DclSingleton _instance;\n' +
      '    private static readonly object _lock = new();\n' +
      '    public static DclSingleton Instance\n' +
      '    {\n' +
      '        get\n' +
      '        {\n' +
      '            if (_instance is null)\n' +
      '            {\n' +
      '                lock (_lock)\n' +
      '                {\n' +
      '                    _instance ??= new DclSingleton();\n' +
      '                }\n' +
      '            }\n' +
      '            return _instance;\n' +
      '        }\n' +
      '    }\n' +
      '    private DclSingleton() { }\n' +
      '}\n\n' +
      '// ========== 2. 静态构造：CLR 保证类型初始化线程安全 ==========\n' +
      'public sealed class StaticCtorSingleton\n' +
      '{\n' +
      '    public static StaticCtorSingleton Instance { get; } = new();\n' +
      '    private StaticCtorSingleton() { }\n' +
      '}\n\n' +
      '// ========== 3. 按 key 的多例（小对象池，不是严格单例） ==========\n' +
      'public sealed class DbConnectionPool\n' +
      '{\n' +
      '    private static readonly ConcurrentDictionary<string, DbConnectionPool> _pool = new();\n' +
      '    public string Name { get; }\n' +
      '    private DbConnectionPool(string name) => Name = name;\n\n' +
      '    public static DbConnectionPool Get(string name) =>\n' +
      '        _pool.GetOrAdd(name, n => new DbConnectionPool(n));\n' +
      '}\n\n' +
      '// ========== 4. 依赖注入里注册为单例（更易测试） ==========\n' +
      '// services.AddSingleton<ILogger, FileLogger>();\n' +
      'public interface ILogger { void Info(string msg); }\n' +
      'public class OrderService\n' +
      '{\n' +
      '    private readonly ILogger _log;\n' +
      '    public OrderService(ILogger log) => _log = log;\n' +
      '    public void Place(string id) => _log.Info($"下单 {id}");\n' +
      '}\n\n' +
      'var east = DbConnectionPool.Get("east");\n' +
      'var east2 = DbConnectionPool.Get("east");\n' +
      'var west = DbConnectionPool.Get("west");\n' +
      'Console.WriteLine(ReferenceEquals(east, east2)); // True\n' +
      'Console.WriteLine(ReferenceEquals(east, west));  // False'
  },
  {
    id: 'factory-method',
    title: '工厂方法模式 Factory Method',
    category: '创建型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '把"创建哪个具体产品"的决定推迟到子类，父类只定义创建接口。',
    detail: [
      '工厂方法在基类中声明一个创建产品的抽象方法，由具体子类决定实例化哪一种产品。',
      '与直接用 new 相比，调用方依赖的是"产品抽象"而非具体类型，符合依赖倒置原则。',
      '典型场景：框架提供扩展点，用户通过重写工厂方法注入自己的产品类型。',
      '注意：静态 switch 创建（Simple Factory）不是 GoF 工厂方法；工厂方法强调"创建推迟到子类"。'
    ],
    example:
      'using System;\n\n' +
      '// ========== 产品层次 ==========\n' +
      'public abstract class Transport\n' +
      '{\n' +
      '    public abstract string Name { get; }\n' +
      '    public abstract void Deliver(string cargo);\n' +
      '}\n\n' +
      'public class Truck : Transport\n' +
      '{\n' +
      '    public override string Name => "卡车";\n' +
      '    public override void Deliver(string cargo) =>\n' +
      '        Console.WriteLine($"[公路] {Name} 运送 {cargo}");\n' +
      '}\n\n' +
      'public class Ship : Transport\n' +
      '{\n' +
      '    public override string Name => "货轮";\n' +
      '    public override void Deliver(string cargo) =>\n' +
      '        Console.WriteLine($"[海运] {Name} 运送 {cargo}");\n' +
      '}\n\n' +
      'public class Plane : Transport\n' +
      '{\n' +
      '    public override string Name => "货机";\n' +
      '    public override void Deliver(string cargo) =>\n' +
      '        Console.WriteLine($"[空运] {Name} 运送 {cargo}（加急）");\n' +
      '}\n\n' +
      '// ========== 创建者：骨架固定，产品由子类决定 ==========\n' +
      'public abstract class Logistics\n' +
      '{\n' +
      '    // 工厂方法：子类重写，决定 new 哪一种 Transport\n' +
      '    protected abstract Transport CreateTransport();\n\n' +
      '    public void PlanDelivery(string cargo)\n' +
      '    {\n' +
      '        var t = CreateTransport();          // 不写 new Truck()\n' +
      '        Console.WriteLine($"调度 {t.Name}");\n' +
      '        t.Deliver(cargo);\n' +
      '    }\n' +
      '}\n\n' +
      'public class RoadLogistics : Logistics\n' +
      '{\n' +
      '    protected override Transport CreateTransport() => new Truck();\n' +
      '}\n' +
      'public class SeaLogistics : Logistics\n' +
      '{\n' +
      '    protected override Transport CreateTransport() => new Ship();\n' +
      '}\n' +
      'public class AirLogistics : Logistics\n' +
      '{\n' +
      '    protected override Transport CreateTransport() => new Plane();\n' +
      '}\n\n' +
      '// ========== 客户端只依赖 Logistics 抽象 ==========\n' +
      'void Run(Logistics logistics, string cargo) => logistics.PlanDelivery(cargo);\n\n' +
      'Run(new RoadLogistics(), "零件箱");   // 公路\n' +
      'Run(new SeaLogistics(), "集装箱");    // 海运\n' +
      'Run(new AirLogistics(), "疫苗");      // 空运'
    ,
    example2Title: '对照：简单工厂 + 通知渠道扩展点',
    example2:
      'using System;\n\n' +
      '// 产品类 Transport / Truck / Ship / Plane 见上方「示例代码」\n' +
      '// ---------- 简单工厂：一处 switch，新增类型要改工厂 ----------\n' +
      'public static class TransportSimpleFactory\n' +
      '{\n' +
      '    public static Transport Create(string kind) => kind switch\n' +
      '    {\n' +
      '        "truck" => new Truck(),\n' +
      '        "ship"  => new Ship(),\n' +
      '        "plane" => new Plane(),\n' +
      '        _ => throw new ArgumentException($"未知运输: {kind}")\n' +
      '    };\n' +
      '}\n\n' +
      '// ---------- 真正的工厂方法：框架提供扩展点 ----------\n' +
      'public abstract class Notifier\n' +
      '{\n' +
      '    public abstract void Send(string to, string body);\n' +
      '}\n' +
      'public class EmailNotifier : Notifier\n' +
      '{\n' +
      '    public override void Send(string to, string body) =>\n' +
      '        Console.WriteLine($"邮件 -> {to}: {body}");\n' +
      '}\n' +
      'public class SmsNotifier : Notifier\n' +
      '{\n' +
      '    public override void Send(string to, string body) =>\n' +
      '        Console.WriteLine($"短信 -> {to}: {body}");\n' +
      '}\n\n' +
      'public abstract class AlertService\n' +
      '{\n' +
      '    protected abstract Notifier CreateNotifier();\n\n' +
      '    public void Alert(string to, string body)\n' +
      '    {\n' +
      '        var n = CreateNotifier();\n' +
      '        n.Send(to, $"[告警] {body}");\n' +
      '    }\n' +
      '}\n\n' +
      'public class EmailAlertService : AlertService\n' +
      '{\n' +
      '    protected override Notifier CreateNotifier() => new EmailNotifier();\n' +
      '}\n' +
      'public class SmsAlertService : AlertService\n' +
      '{\n' +
      '    protected override Notifier CreateNotifier() => new SmsNotifier();\n' +
      '}\n\n' +
      'new EmailAlertService().Alert("ops@corp.com", "磁盘 90%");\n' +
      'new SmsAlertService().Alert("13800000000", "服务宕机");\n\n' +
      '// 简单工厂仍适合"种类少、集中配置"的场景\n' +
      'var t = TransportSimpleFactory.Create("truck");\n' +
      't.Deliver("样品");'
  },
  {
    id: 'abstract-factory',
    title: '抽象工厂模式 Abstract Factory',
    category: '创建型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '提供创建"一组相关或相互依赖产品"的接口，而无需指定具体类。',
    detail: [
      '抽象工厂生产的是一个产品族（如 Windows 风格按钮+文本框、Mac 风格按钮+文本框），保证族内产品风格一致。',
      '客户端只依赖抽象工厂与抽象产品，切换整套风格只需替换工厂实例。',
      '缺点是新增一种产品要改动所有工厂接口，违反开闭原则——适合"产品族稳定、风格多变"的场景。'
    ],
    example:
      'using System;\n\n' +
      '// ========== 抽象产品（产品族：按钮 + 复选框） ==========\n' +
      'public interface IButton { void Paint(); void Click(); }\n' +
      'public interface ICheckbox { void Paint(); void Toggle(); }\n\n' +
      '// Windows 族\n' +
      'public class WinButton : IButton\n' +
      '{\n' +
      '    public void Paint() => Console.WriteLine("绘制 Win 扁平按钮");\n' +
      '    public void Click() => Console.WriteLine("Win 按钮被点击");\n' +
      '}\n' +
      'public class WinCheckbox : ICheckbox\n' +
      '{\n' +
      '    public void Paint() => Console.WriteLine("绘制 Win 方框复选框");\n' +
      '    public void Toggle() => Console.WriteLine("Win 复选框切换");\n' +
      '}\n\n' +
      '// Mac 族\n' +
      'public class MacButton : IButton\n' +
      '{\n' +
      '    public void Paint() => Console.WriteLine("绘制 Mac 圆角按钮");\n' +
      '    public void Click() => Console.WriteLine("Mac 按钮被点击");\n' +
      '}\n' +
      'public class MacCheckbox : ICheckbox\n' +
      '{\n' +
      '    public void Paint() => Console.WriteLine("绘制 Mac 圆形复选框");\n' +
      '    public void Toggle() => Console.WriteLine("Mac 复选框切换");\n' +
      '}\n\n' +
      '// ========== 抽象工厂：一次创建整族产品 ==========\n' +
      'public interface IGuiFactory\n' +
      '{\n' +
      '    IButton CreateButton();\n' +
      '    ICheckbox CreateCheckbox();\n' +
      '}\n\n' +
      'public class WinFactory : IGuiFactory\n' +
      '{\n' +
      '    public IButton CreateButton() => new WinButton();\n' +
      '    public ICheckbox CreateCheckbox() => new WinCheckbox();\n' +
      '}\n' +
      'public class MacFactory : IGuiFactory\n' +
      '{\n' +
      '    public IButton CreateButton() => new MacButton();\n' +
      '    public ICheckbox CreateCheckbox() => new MacCheckbox();\n' +
      '}\n\n' +
      '// 客户端：只依赖抽象，风格由工厂注入\n' +
      'public class Dialog\n' +
      '{\n' +
      '    private readonly IButton _ok;\n' +
      '    private readonly ICheckbox _agree;\n' +
      '    public Dialog(IGuiFactory factory)\n' +
      '    {\n' +
      '        _ok = factory.CreateButton();\n' +
      '        _agree = factory.CreateCheckbox();\n' +
      '    }\n' +
      '    public void Render()\n' +
      '    {\n' +
      '        _ok.Paint();\n' +
      '        _agree.Paint();   // 同一族，风格一致\n' +
      '    }\n' +
      '    public void Submit() { _agree.Toggle(); _ok.Click(); }\n' +
      '}\n\n' +
      'IGuiFactory factory = OperatingSystem.IsWindows()\n' +
      '    ? new WinFactory() : new MacFactory();\n' +
      'var dlg = new Dialog(factory);\n' +
      'dlg.Render();\n' +
      'dlg.Submit();'
    ,
    example2Title: '实战：数据库产品族（连接 + 命令 + 事务）',
    example2:
      'using System;\n\n' +
      'public interface IAppDbConnection\n' +
      '{\n' +
      '    void Open();\n' +
      '    IAppDbCommand CreateCommand(string sql);\n' +
      '}\n' +
      'public interface IAppDbCommand\n' +
      '{\n' +
      '    int Execute();\n' +
      '}\n' +
      'public interface IAppDbTransaction\n' +
      '{\n' +
      '    void Commit();\n' +
      '    void Rollback();\n' +
      '}\n' +
      'public interface IAppDbFactory\n' +
      '{\n' +
      '    IAppDbConnection CreateConnection();\n' +
      '    IAppDbTransaction Begin();\n' +
      '}\n\n' +
      'public class SqlServerConnection : IAppDbConnection\n' +
      '{\n' +
      '    public void Open() => Console.WriteLine("打开 SQL Server");\n' +
      '    public IAppDbCommand CreateCommand(string sql) => new SqlServerCommand(sql);\n' +
      '}\n' +
      'public class SqlServerCommand : IAppDbCommand\n' +
      '{\n' +
      '    private readonly string _sql;\n' +
      '    public SqlServerCommand(string sql) => _sql = sql;\n' +
      '    public int Execute() { Console.WriteLine($"T-SQL: {_sql}"); return 1; }\n' +
      '}\n' +
      'public class SqlServerTx : IAppDbTransaction\n' +
      '{\n' +
      '    public void Commit() => Console.WriteLine("SQL Server COMMIT");\n' +
      '    public void Rollback() => Console.WriteLine("SQL Server ROLLBACK");\n' +
      '}\n' +
      'public class SqlServerFactory : IAppDbFactory\n' +
      '{\n' +
      '    public IAppDbConnection CreateConnection() => new SqlServerConnection();\n' +
      '    public IAppDbTransaction Begin() => new SqlServerTx();\n' +
      '}\n\n' +
      'public class PostgresConnection : IAppDbConnection\n' +
      '{\n' +
      '    public void Open() => Console.WriteLine("打开 PostgreSQL");\n' +
      '    public IAppDbCommand CreateCommand(string sql) => new PostgresCommand(sql);\n' +
      '}\n' +
      'public class PostgresCommand : IAppDbCommand\n' +
      '{\n' +
      '    private readonly string _sql;\n' +
      '    public PostgresCommand(string sql) => _sql = sql;\n' +
      '    public int Execute() { Console.WriteLine($"PG: {_sql}"); return 1; }\n' +
      '}\n' +
      'public class PostgresTx : IAppDbTransaction\n' +
      '{\n' +
      '    public void Commit() => Console.WriteLine("PG COMMIT");\n' +
      '    public void Rollback() => Console.WriteLine("PG ROLLBACK");\n' +
      '}\n' +
      'public class PostgresFactory : IAppDbFactory\n' +
      '{\n' +
      '    public IAppDbConnection CreateConnection() => new PostgresConnection();\n' +
      '    public IAppDbTransaction Begin() => new PostgresTx();\n' +
      '}\n\n' +
      'void Migrate(IAppDbFactory f)\n' +
      '{\n' +
      '    var conn = f.CreateConnection();\n' +
      '    conn.Open();\n' +
      '    var tx = f.Begin();\n' +
      '    conn.CreateCommand("UPDATE users SET active=1").Execute();\n' +
      '    tx.Commit();          // 连接、命令、事务来自同一产品族\n' +
      '}\n\n' +
      'Migrate(new SqlServerFactory());\n' +
      'Migrate(new PostgresFactory());'
  },
  {
    id: 'builder',
    title: '建造者模式 Builder',
    category: '创建型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '分步构建复杂对象，把"构造过程"与"最终表示"分离。',
    detail: [
      '当对象有很多可选参数、构造器重载爆炸时，Builder 用链式调用一步步设置，可读性远好于 telescoping constructor。',
      'C# 中常见两种形态：独立 Builder 类，或被构建类型上返回自身（this）的 fluent 方法（如 StringBuilder）。',
      '配合 record/不可变对象，Builder 负责收集字段，最后 Build() 返回只读实例。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      '// 不可变产品：构造后不能改\n' +
      'public sealed class Pizza\n' +
      '{\n' +
      '    public string Dough { get; }\n' +
      '    public string Sauce { get; }\n' +
      '    public string Size { get; }\n' +
      '    public IReadOnlyList<string> Toppings { get; }\n' +
      '    public bool ExtraCheese { get; }\n\n' +
      '    internal Pizza(string dough, string sauce, string size,\n' +
      '                   List<string> toppings, bool extraCheese)\n' +
      '    {\n' +
      '        Dough = dough; Sauce = sauce; Size = size;\n' +
      '        Toppings = toppings.AsReadOnly();\n' +
      '        ExtraCheese = extraCheese;\n' +
      '    }\n\n' +
      '    public override string ToString() =>\n' +
      '        $"{Size} {Dough}饼 / {Sauce}酱 / " +\n' +
      '        $"配料[{string.Join(",", Toppings)}]" +\n' +
      '        (ExtraCheese ? " + Extra芝士" : "");\n' +
      '}\n\n' +
      'public class PizzaBuilder\n' +
      '{\n' +
      '    private string _dough = "薄底", _sauce = "番茄", _size = "12寸";\n' +
      '    private readonly List<string> _toppings = new();\n' +
      '    private bool _extra;\n\n' +
      '    public PizzaBuilder Dough(string d) { _dough = d; return this; }\n' +
      '    public PizzaBuilder Sauce(string s) { _sauce = s; return this; }\n' +
      '    public PizzaBuilder Size(string s) { _size = s; return this; }\n' +
      '    public PizzaBuilder AddTopping(string t) { _toppings.Add(t); return this; }\n' +
      '    public PizzaBuilder ExtraCheese(bool v = true) { _extra = v; return this; }\n\n' +
      '    public Pizza Build()\n' +
      '    {\n' +
      '        if (_toppings.Count == 0)\n' +
      '            throw new InvalidOperationException("至少一种配料");\n' +
      '        return new Pizza(_dough, _sauce, _size, new List<string>(_toppings), _extra);\n' +
      '    }\n' +
      '}\n\n' +
      'var hawaiian = new PizzaBuilder()\n' +
      '    .Size("9寸").Dough("厚底").Sauce("番茄")\n' +
      '    .AddTopping("火腿").AddTopping("菠萝")\n' +
      '    .ExtraCheese()\n' +
      '    .Build();\n' +
      'Console.WriteLine(hawaiian);\n\n' +
      'var veggie = new PizzaBuilder()\n' +
      '    .AddTopping("蘑菇").AddTopping("青椒").Build();\n' +
      'Console.WriteLine(veggie);'
    ,
    example2Title: 'Director 导向构建 + HTTP 请求建造者',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Text;\n\n' +
      '// Pizza / PizzaBuilder 见上方「示例代码」\n' +
      '// Director：封装若干固定配方，调用方不必记步骤顺序\n' +
      'public static class PizzaDirector\n' +
      '{\n' +
      '    public static Pizza Margherita() => new PizzaBuilder()\n' +
      '        .Dough("薄底").Sauce("番茄")\n' +
      '        .AddTopping("芝士").AddTopping("罗勒").Build();\n\n' +
      '    public static Pizza MeatLovers() => new PizzaBuilder()\n' +
      '        .Dough("厚底").Size("14寸")\n' +
      '        .AddTopping("香肠").AddTopping("培根").AddTopping("牛肉")\n' +
      '        .ExtraCheese().Build();\n' +
      '}\n\n' +
      'public sealed class HttpRequest\n' +
      '{\n' +
      '    public string Method { get; init; }\n' +
      '    public string Url { get; init; }\n' +
      '    public Dictionary<string, string> Headers { get; init; }\n' +
      '    public string Body { get; init; }\n' +
      '    public int TimeoutMs { get; init; }\n' +
      '    public override string ToString() =>\n' +
      '        $"{Method} {Url} timeout={TimeoutMs} headers={Headers.Count} bodyLen={Body?.Length ?? 0}";\n' +
      '}\n\n' +
      'public class HttpRequestBuilder\n' +
      '{\n' +
      '    private string _method = "GET", _url, _body = "";\n' +
      '    private int _timeout = 10_000;\n' +
      '    private readonly Dictionary<string, string> _headers = new();\n\n' +
      '    public HttpRequestBuilder Get(string url) { _method = "GET"; _url = url; return this; }\n' +
      '    public HttpRequestBuilder Post(string url) { _method = "POST"; _url = url; return this; }\n' +
      '    public HttpRequestBuilder Header(string k, string v) { _headers[k] = v; return this; }\n' +
      '    public HttpRequestBuilder Json(string json)\n' +
      '    {\n' +
      '        _body = json;\n' +
      '        _headers["Content-Type"] = "application/json";\n' +
      '        return this;\n' +
      '    }\n' +
      '    public HttpRequestBuilder Timeout(int ms) { _timeout = ms; return this; }\n' +
      '    public HttpRequest Build()\n' +
      '    {\n' +
      '        if (string.IsNullOrEmpty(_url)) throw new InvalidOperationException("缺少 Url");\n' +
      '        return new HttpRequest {\n' +
      '            Method = _method, Url = _url, Body = _body,\n' +
      '            TimeoutMs = _timeout, Headers = new(_headers)\n' +
      '        };\n' +
      '    }\n' +
      '}\n\n' +
      'Console.WriteLine(PizzaDirector.Margherita());\n' +
      'Console.WriteLine(PizzaDirector.MeatLovers());\n\n' +
      'var req = new HttpRequestBuilder()\n' +
      '    .Post("https://api.example.com/orders")\n' +
      '    .Header("Authorization", "Bearer xxx")\n' +
      '    .Json("{\\"sku\\":\\"A1\\",\\"qty\\":2}")\n' +
      '    .Timeout(3000)\n' +
      '    .Build();\n' +
      'Console.WriteLine(req);\n\n' +
      '// .NET 自带的建造者：StringBuilder\n' +
      'var sb = new StringBuilder().Append("Hello").Append(\' \').Append("Builder");\n' +
      'Console.WriteLine(sb);'
  },
  {
    id: 'prototype',
    title: '原型模式 Prototype',
    category: '创建型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '通过克隆已有实例来创建新对象，避免昂贵的初始化。',
    detail: [
      '原型模式让对象自身负责"复制自己"（Clone），适合创建成本高的对象（如复杂配置、文档树）。',
      'C# 中实现 ICloneable 或用 record 的 with 表达式做浅拷贝；深拷贝要手动递归复制引用成员。',
      '注意浅拷贝与深拷贝的区别：浅拷贝共享引用成员，修改会互相影响。'
    ],
    notes: [
      'record 的 with 只做浅拷贝，嵌套可变对象仍共享，需要深拷贝时别误用。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IPrototype<out T>\n' +
      '{\n' +
      '    T Clone();\n' +
      '}\n\n' +
      'public class WorkExp\n' +
      '{\n' +
      '    public string Company { get; set; }\n' +
      '    public int Years { get; set; }\n' +
      '    public WorkExp Clone() => new() { Company = Company, Years = Years };\n' +
      '}\n\n' +
      'public class Resume : IPrototype<Resume>\n' +
      '{\n' +
      '    public string Name { get; set; }\n' +
      '    public List<string> Skills { get; set; } = new();\n' +
      '    public WorkExp Experience { get; set; }\n\n' +
      '    public Resume Clone() => new Resume\n' +
      '    {\n' +
      '        Name = Name,\n' +
      '        Skills = new List<string>(Skills),     // 深拷贝列表\n' +
      '        Experience = Experience?.Clone()       // 深拷贝嵌套对象\n' +
      '    };\n\n' +
      '    public Resume ShallowClone() => (Resume)MemberwiseClone();\n' +
      '}\n\n' +
      'var proto = new Resume\n' +
      '{\n' +
      '    Name = "张三",\n' +
      '    Skills = new List<string> { "C#", "SQL" },\n' +
      '    Experience = new WorkExp { Company = "Acme", Years = 3 }\n' +
      '};\n\n' +
      '// 深拷贝：互不影响\n' +
      'var deep = proto.Clone();\n' +
      'deep.Name = "李四";\n' +
      'deep.Skills.Add("Redis");\n' +
      'deep.Experience.Company = "Beta";\n' +
      'Console.WriteLine($"{proto.Name} {string.Join(",", proto.Skills)} {proto.Experience.Company}");\n' +
      'Console.WriteLine($"{deep.Name} {string.Join(",", deep.Skills)} {deep.Experience.Company}");\n\n' +
      '// 浅拷贝：引用成员共享\n' +
      'var shallow = proto.ShallowClone();\n' +
      'shallow.Skills.Add("误伤原型");\n' +
      'Console.WriteLine("原型技能: " + string.Join(",", proto.Skills));'
    ,
    example2Title: '原型注册表 + record with 浅拷贝陷阱',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IPrototype<out T> { T Clone(); }\n\n' +
      '// 原型注册表：预置几种模板，按名克隆\n' +
      'public class Document : IPrototype<Document>\n' +
      '{\n' +
      '    public string Title { get; set; }\n' +
      '    public string Theme { get; set; }\n' +
      '    public List<string> Pages { get; set; } = new();\n' +
      '    public Document Clone() => new Document\n' +
      '    {\n' +
      '        Title = Title, Theme = Theme,\n' +
      '        Pages = new List<string>(Pages)\n' +
      '    };\n' +
      '}\n\n' +
      'public class PrototypeRegistry\n' +
      '{\n' +
      '    private readonly Dictionary<string, Document> _map = new();\n' +
      '    public void Register(string key, Document proto) => _map[key] = proto;\n' +
      '    public Document Create(string key) =>\n' +
      '        _map.TryGetValue(key, out var p)\n' +
      '            ? p.Clone()\n' +
      '            : throw new KeyNotFoundException(key);\n' +
      '}\n\n' +
      'var registry = new PrototypeRegistry();\n' +
      'registry.Register("report", new Document\n' +
      '{\n' +
      '    Title = "月报模板", Theme = "公司蓝",\n' +
      '    Pages = new List<string> { "封面", "目录" }\n' +
      '});\n' +
      'registry.Register("slide", new Document\n' +
      '{\n' +
      '    Title = "路演模板", Theme = "深色",\n' +
      '    Pages = new List<string> { "开场" }\n' +
      '});\n\n' +
      'var jan = registry.Create("report");\n' +
      'jan.Title = "2026年1月月报";\n' +
      'jan.Pages.Add("销售数据");\n' +
      'Console.WriteLine($"{jan.Title} / {string.Join("-", jan.Pages)}");\n\n' +
      '// record with 是浅拷贝\n' +
      'public record SkillSet(List<string> Items);\n' +
      'public record Candidate(string Name, SkillSet Skills);\n\n' +
      'var c1 = new Candidate("王五", new SkillSet(new List<string> { "C#" }));\n' +
      'var c2 = c1 with { Name = "赵六" };  // Skills 仍指向同一 List\n' +
      'c2.Skills.Items.Add("Go");\n' +
      'Console.WriteLine(string.Join(",", c1.Skills.Items)); // C#,Go 被连带改掉'
  },

  // ==================== 结构型 ====================
  {
    id: 'adapter',
    title: '适配器模式 Adapter',
    category: '结构型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '把一个不兼容的接口转换成客户端期望的接口。',
    detail: [
      '适配器让原本因接口不匹配而无法协作的类能一起工作，常被称为"转接头"。',
      'C# 实现：类适配器用继承（多重继承不存在，所以常用对象适配器——持有被适配者引用）。',
      '典型应用：第三方库接口与自有接口不一致时包一层，或让遗留类适配新接口。'
    ],
    example:
      'using System;\n\n' +
      '// 客户端只认识这个接口\n' +
      'public interface IPaymentGateway\n' +
      '{\n' +
      '    bool Charge(decimal amountCny, string orderId);\n' +
      '}\n\n' +
      '// 第三方 SDK：美元、方法名不同，无法直接用\n' +
      'public class StripeSdk\n' +
      '{\n' +
      '    public string CreateCharge(long amountCents, string currency, string idempotencyKey)\n' +
      '    {\n' +
      '        Console.WriteLine($"Stripe {amountCents} {currency} key={idempotencyKey}");\n' +
      '        return "ch_123";\n' +
      '    }\n' +
      '}\n\n' +
      '// 遗留支付宝：签名、分单位\n' +
      'public class LegacyAlipay\n' +
      '{\n' +
      '    public int Pay(int fen, string tradeNo)\n' +
      '    {\n' +
      '        Console.WriteLine($"Alipay {fen} 分, trade={tradeNo}");\n' +
      '        return 0; // 0 表示成功\n' +
      '    }\n' +
      '}\n\n' +
      'public class StripeAdapter : IPaymentGateway\n' +
      '{\n' +
      '    private readonly StripeSdk _sdk = new();\n' +
      '    public bool Charge(decimal amountCny, string orderId)\n' +
      '    {\n' +
      '        var usdCents = (long)(amountCny / 7.2m * 100);\n' +
      '        var id = _sdk.CreateCharge(usdCents, "usd", orderId);\n' +
      '        return id.StartsWith("ch_");\n' +
      '    }\n' +
      '}\n\n' +
      'public class AlipayAdapter : IPaymentGateway\n' +
      '{\n' +
      '    private readonly LegacyAlipay _pay = new();\n' +
      '    public bool Charge(decimal amountCny, string orderId) =>\n' +
      '        _pay.Pay((int)(amountCny * 100), orderId) == 0;\n' +
      '}\n\n' +
      'void Checkout(IPaymentGateway gw, decimal price, string orderId)\n' +
      '{\n' +
      '    Console.WriteLine(gw.Charge(price, orderId) ? "支付成功" : "失败");\n' +
      '}\n\n' +
      'Checkout(new StripeAdapter(), 72m, "ORD-001");\n' +
      'Checkout(new AlipayAdapter(), 72m, "ORD-002");'
    ,
    example2Title: '对象适配器 vs 类适配器：日志格式转换',
    example2:
      'using System;\n' +
      'using System.Xml.Linq;\n\n' +
      'public interface IJsonLogger\n' +
      '{\n' +
      '    void Log(string json);\n' +
      '}\n\n' +
      '// 遗留组件只吃 XML\n' +
      'public class XmlAuditWriter\n' +
      '{\n' +
      '    public void WriteXml(string xml) => Console.WriteLine("AUDIT XML: " + xml);\n' +
      '}\n\n' +
      '// 对象适配器：组合遗留对象（C# 首选）\n' +
      'public class XmlToJsonLoggerAdapter : IJsonLogger\n' +
      '{\n' +
      '    private readonly XmlAuditWriter _inner;\n' +
      '    public XmlToJsonLoggerAdapter(XmlAuditWriter inner) => _inner = inner;\n\n' +
      '    public void Log(string json)\n' +
      '    {\n' +
      '        // 极简：把 json 包进 XML 节点，真实项目用序列化\n' +
      '        var xml = new XElement("log", new XAttribute("payload", json)).ToString();\n' +
      '        _inner.WriteXml(xml);\n' +
      '    }\n' +
      '}\n\n' +
      '// 业务代码只依赖 IJsonLogger\n' +
      'public class OrderApp\n' +
      '{\n' +
      '    private readonly IJsonLogger _log;\n' +
      '    public OrderApp(IJsonLogger log) => _log = log;\n' +
      '    public void Place(string id) =>\n' +
      '        _log.Log($"{{\\"event\\":\\"place\\",\\"id\\":\\"{id}\\"}}");\n' +
      '}\n\n' +
      'var app = new OrderApp(new XmlToJsonLoggerAdapter(new XmlAuditWriter()));\n' +
      'app.Place("A-100");\n\n' +
      '// 数组适配为 IEnumerable：.NET 里数组已实现该接口，思想相同\n' +
      'int[] nums = { 1, 2, 3 };\n' +
      'foreach (var n in nums) Console.Write(n + " ");'
  },
  {
    id: 'bridge',
    title: '桥接模式 Bridge',
    category: '结构型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '把抽象与实现分离，使两者可独立变化，避免类爆炸。',
    detail: [
      '桥接用组合代替继承：抽象层持有"实现者"接口的引用，二者各自扩展、互不影响。',
      '对比"适配器"（事后补救不兼容）与"桥接"（事前设计解耦），桥接是主动的结构性解耦。',
      '例子：图形 Shape（圆/方）与渲染器 Renderer（矢量/光栅）是两个维度，各自由桥接组合，避免 2x2=4 个类。'
    ],
    example:
      'using System;\n\n' +
      '// 实现者层次：怎么画\n' +
      'public interface IRenderer\n' +
      '{\n' +
      '    void RenderCircle(double x, double y, double r);\n' +
      '    void RenderRect(double x, double y, double w, double h);\n' +
      '}\n\n' +
      'public class VectorRenderer : IRenderer\n' +
      '{\n' +
      '    public void RenderCircle(double x, double y, double r) =>\n' +
      '        Console.WriteLine($"SVG circle cx={x} cy={y} r={r}");\n' +
      '    public void RenderRect(double x, double y, double w, double h) =>\n' +
      '        Console.WriteLine($"SVG rect x={x} y={y} {w}x{h}");\n' +
      '}\n\n' +
      'public class RasterRenderer : IRenderer\n' +
      '{\n' +
      '    public void RenderCircle(double x, double y, double r) =>\n' +
      '        Console.WriteLine($"像素圆 ({x},{y}) r={r}");\n' +
      '    public void RenderRect(double x, double y, double w, double h) =>\n' +
      '        Console.WriteLine($"像素矩形 ({x},{y}) {w}x{h}");\n' +
      '}\n\n' +
      '// 抽象层次：画什么，持有渲染器（桥）\n' +
      'public abstract class Shape\n' +
      '{\n' +
      '    protected readonly IRenderer Renderer;\n' +
      '    protected Shape(IRenderer renderer) => Renderer = renderer;\n' +
      '    public abstract void Draw();\n' +
      '    public abstract void Resize(double factor);\n' +
      '}\n\n' +
      'public class Circle : Shape\n' +
      '{\n' +
      '    private double _x, _y, _r;\n' +
      '    public Circle(IRenderer r, double x, double y, double radius) : base(r)\n' +
      '    { _x = x; _y = y; _r = radius; }\n' +
      '    public override void Draw() => Renderer.RenderCircle(_x, _y, _r);\n' +
      '    public override void Resize(double f) => _r *= f;\n' +
      '}\n\n' +
      'public class Rectangle : Shape\n' +
      '{\n' +
      '    private double _x, _y, _w, _h;\n' +
      '    public Rectangle(IRenderer r, double x, double y, double w, double h) : base(r)\n' +
      '    { _x = x; _y = y; _w = w; _h = h; }\n' +
      '    public override void Draw() => Renderer.RenderRect(_x, _y, _w, _h);\n' +
      '    public override void Resize(double f) { _w *= f; _h *= f; }\n' +
      '}\n\n' +
      '// 2 种形状 × 2 种渲染 = 4 种组合，只需 4 个类而不是 4 个继承叶子\n' +
      'Shape[] shapes =\n' +
      '{\n' +
      '    new Circle(new VectorRenderer(), 10, 10, 5),\n' +
      '    new Circle(new RasterRenderer(), 0, 0, 3),\n' +
      '    new Rectangle(new VectorRenderer(), 1, 1, 8, 4)\n' +
      '};\n' +
      'foreach (var s in shapes) { s.Resize(2); s.Draw(); }'
    ,
    example2Title: '消息 × 发送通道：两个维度独立扩展',
    example2:
      'using System;\n\n' +
      'public interface IMessageSender\n' +
      '{\n' +
      '    void Send(string to, string title, string body);\n' +
      '}\n' +
      'public class EmailSender : IMessageSender\n' +
      '{\n' +
      '    public void Send(string to, string title, string body) =>\n' +
      '        Console.WriteLine($"邮件 {to}\\n  {title}\\n  {body}");\n' +
      '}\n' +
      'public class SmsSender : IMessageSender\n' +
      '{\n' +
      '    public void Send(string to, string title, string body) =>\n' +
      '        Console.WriteLine($"短信 {to}: [{title}] {body}");\n' +
      '}\n' +
      'public class SlackSender : IMessageSender\n' +
      '{\n' +
      '    public void Send(string to, string title, string body) =>\n' +
      '        Console.WriteLine($"#{to} *{title}* {body}");\n' +
      '}\n\n' +
      'public abstract class Message\n' +
      '{\n' +
      '    protected readonly IMessageSender Sender;\n' +
      '    protected Message(IMessageSender sender) => Sender = sender;\n' +
      '    public abstract void Dispatch(string to);\n' +
      '}\n\n' +
      'public class NormalMessage : Message\n' +
      '{\n' +
      '    private readonly string _text;\n' +
      '    public NormalMessage(IMessageSender s, string text) : base(s) => _text = text;\n' +
      '    public override void Dispatch(string to) =>\n' +
      '        Sender.Send(to, "通知", _text);\n' +
      '}\n' +
      'public class UrgentMessage : Message\n' +
      '{\n' +
      '    private readonly string _text;\n' +
      '    public UrgentMessage(IMessageSender s, string text) : base(s) => _text = text;\n' +
      '    public override void Dispatch(string to) =>\n' +
      '        Sender.Send(to, "【紧急】", _text.ToUpperInvariant());\n' +
      '}\n\n' +
      'new NormalMessage(new EmailSender(), "会议改到 3 点").Dispatch("a@corp.com");\n' +
      'new UrgentMessage(new SmsSender(), "机房掉电").Dispatch("13800000000");\n' +
      'new UrgentMessage(new SlackSender(), "支付超时").Dispatch("oncall");'
  },
  {
    id: 'composite',
    title: '组合模式 Composite',
    category: '结构型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '用统一的方式处理"单个对象"与"对象组合（树）"。',
    detail: [
      '组合模式让叶子节点与容器节点实现同一接口，客户端可一致地递归处理整棵树。',
      '典型例子：文件系统（文件 vs 文件夹）、UI 控件树、组织架构。',
      '代价：叶子也可能被迫实现"增删子节点"等无意义方法，可用安全式（接口拆分）或透明式（统一接口）取舍。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Linq;\n\n' +
      'public abstract class FileSystemNode\n' +
      '{\n' +
      '    public string Name { get; }\n' +
      '    protected FileSystemNode(string name) => Name = name;\n' +
      '    public abstract long Size();\n' +
      '    public abstract void Print(int depth = 0);\n' +
      '    protected string Indent(int d) => new string(\' \', d * 2);\n' +
      '}\n\n' +
      'public class FileNode : FileSystemNode\n' +
      '{\n' +
      '    private readonly long _bytes;\n' +
      '    public FileNode(string name, long bytes) : base(name) => _bytes = bytes;\n' +
      '    public override long Size() => _bytes;\n' +
      '    public override void Print(int depth = 0) =>\n' +
      '        Console.WriteLine($"{Indent(depth)}- {Name} ({_bytes}B)");\n' +
      '}\n\n' +
      'public class FolderNode : FileSystemNode\n' +
      '{\n' +
      '    private readonly List<FileSystemNode> _children = new();\n' +
      '    public FolderNode(string name) : base(name) { }\n' +
      '    public FolderNode Add(FileSystemNode child)\n' +
      '    {\n' +
      '        _children.Add(child);\n' +
      '        return this;\n' +
      '    }\n' +
      '    public override long Size() => _children.Sum(c => c.Size());\n' +
      '    public override void Print(int depth = 0)\n' +
      '    {\n' +
      '        Console.WriteLine($"{Indent(depth)}+ {Name}/  ({Size()}B)");\n' +
      '        foreach (var c in _children) c.Print(depth + 1);\n' +
      '    }\n' +
      '}\n\n' +
      'var src = new FolderNode("src")\n' +
      '    .Add(new FileNode("Program.cs", 1200))\n' +
      '    .Add(new FileNode("App.cs", 800));\n' +
      'var root = new FolderNode("project")\n' +
      '    .Add(src)\n' +
      '    .Add(new FileNode("README.md", 400))\n' +
      '    .Add(new FolderNode("docs").Add(new FileNode("guide.md", 2000)));\n\n' +
      'root.Print();\n' +
      'Console.WriteLine("总大小: " + root.Size());'
    ,
    example2Title: '组织架构：统一计算编制与打印树',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Linq;\n\n' +
      'public interface IOrgUnit\n' +
      '{\n' +
      '    string Title { get; }\n' +
      '    int HeadCount();\n' +
      '    decimal SalaryBudget();\n' +
      '}\n\n' +
      'public class Employee : IOrgUnit\n' +
      '{\n' +
      '    public string Title { get; }\n' +
      '    public decimal Salary { get; }\n' +
      '    public Employee(string title, decimal salary) { Title = title; Salary = salary; }\n' +
      '    public int HeadCount() => 1;\n' +
      '    public decimal SalaryBudget() => Salary;\n' +
      '}\n\n' +
      'public class Department : IOrgUnit\n' +
      '{\n' +
      '    public string Title { get; }\n' +
      '    private readonly List<IOrgUnit> _members = new();\n' +
      '    public Department(string title) => Title = title;\n' +
      '    public Department Add(IOrgUnit u) { _members.Add(u); return this; }\n' +
      '    public int HeadCount() => _members.Sum(m => m.HeadCount());\n' +
      '    public decimal SalaryBudget() => _members.Sum(m => m.SalaryBudget());\n' +
      '}\n\n' +
      'var eng = new Department("研发")\n' +
      '    .Add(new Employee("后端", 30000))\n' +
      '    .Add(new Employee("前端", 28000))\n' +
      '    .Add(new Department("QA").Add(new Employee("测试", 22000)));\n' +
      'var company = new Department("公司").Add(eng).Add(new Employee("CEO", 80000));\n\n' +
      'void Report(IOrgUnit u) =>\n' +
      '    Console.WriteLine($"{u.Title}: {u.HeadCount()} 人, 预算 {u.SalaryBudget():N0}");\n\n' +
      'Report(eng);\n' +
      'Report(company);'
  },
  {
    id: 'decorator',
    title: '装饰器模式 Decorator',
    category: '结构型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '动态地给对象添加职责，比继承更灵活。',
    detail: [
      '装饰器持有一个被装饰组件的引用，并实现相同接口，在调用前后附加行为。',
      '可以多层嵌套装饰：如 Stream 上套 GZipStream 再套 CryptoStream，正是 .NET 装饰器的经典用法。',
      '对比继承（编译期固定）与装饰（运行期组合），装饰避免了子类数量爆炸。'
    ],
    notes: [
      '装饰器应保持透明：不改变接口语义，只增加职责，客户端仍按原接口使用。'
    ],
    example:
      'using System;\n\n' +
      'public interface INotifier\n' +
      '{\n' +
      '    void Send(string msg);\n' +
      '}\n\n' +
      'public class EmailNotifier : INotifier\n' +
      '{\n' +
      '    public void Send(string msg) => Console.WriteLine("邮件: " + msg);\n' +
      '}\n\n' +
      'public abstract class NotifierDecorator : INotifier\n' +
      '{\n' +
      '    protected readonly INotifier Inner;\n' +
      '    protected NotifierDecorator(INotifier inner) => Inner = inner;\n' +
      '    public abstract void Send(string msg);\n' +
      '}\n\n' +
      'public class SmsDecorator : NotifierDecorator\n' +
      '{\n' +
      '    public SmsDecorator(INotifier inner) : base(inner) { }\n' +
      '    public override void Send(string msg)\n' +
      '    {\n' +
      '        Inner.Send(msg);\n' +
      '        Console.WriteLine("短信: " + msg);\n' +
      '    }\n' +
      '}\n\n' +
      'public class SlackDecorator : NotifierDecorator\n' +
      '{\n' +
      '    public SlackDecorator(INotifier inner) : base(inner) { }\n' +
      '    public override void Send(string msg)\n' +
      '    {\n' +
      '        Inner.Send(msg);\n' +
      '        Console.WriteLine("Slack: " + msg);\n' +
      '    }\n' +
      '}\n\n' +
      'public class SignatureDecorator : NotifierDecorator\n' +
      '{\n' +
      '    private readonly string _sign;\n' +
      '    public SignatureDecorator(INotifier inner, string sign) : base(inner) => _sign = sign;\n' +
      '    public override void Send(string msg) => Inner.Send(msg + "\\n-- " + _sign);\n' +
      '}\n\n' +
      '// 运行时自由组合：邮件 + 签名 + 短信 + Slack\n' +
      'INotifier n = new EmailNotifier();\n' +
      'n = new SignatureDecorator(n, "运维机器人");\n' +
      'n = new SmsDecorator(n);\n' +
      'n = new SlackDecorator(n);\n' +
      'n.Send("磁盘使用率 95%");'
    ,
    example2Title: '.NET Stream 装饰链 + 咖啡加料',
    example2:
      'using System;\n' +
      'using System.IO;\n' +
      'using System.IO.Compression;\n' +
      'using System.Text;\n\n' +
      '// Stream 本身就是装饰器：套一层就多一种能力\n' +
      'byte[] Compress(string text)\n' +
      '{\n' +
      '    using var ms = new MemoryStream();\n' +
      '    using (var gzip = new GZipStream(ms, CompressionLevel.Fastest, leaveOpen: true))\n' +
      '    using (var writer = new StreamWriter(gzip, Encoding.UTF8))\n' +
      '        writer.Write(text);\n' +
      '    return ms.ToArray();\n' +
      '}\n' +
      'var packed = Compress("hello decorator");\n' +
      'Console.WriteLine("压缩后字节: " + packed.Length);\n\n' +
      'public abstract class Beverage\n' +
      '{\n' +
      '    public abstract string Desc { get; }\n' +
      '    public abstract decimal Cost();\n' +
      '}\n' +
      'public class Espresso : Beverage\n' +
      '{\n' +
      '    public override string Desc => "浓缩咖啡";\n' +
      '    public override decimal Cost() => 12m;\n' +
      '}\n' +
      'public abstract class Condiment : Beverage\n' +
      '{\n' +
      '    protected readonly Beverage Inner;\n' +
      '    protected Condiment(Beverage inner) => Inner = inner;\n' +
      '}\n' +
      'public class Milk : Condiment\n' +
      '{\n' +
      '    public Milk(Beverage b) : base(b) { }\n' +
      '    public override string Desc => Inner.Desc + "+牛奶";\n' +
      '    public override decimal Cost() => Inner.Cost() + 2m;\n' +
      '}\n' +
      'public class Mocha : Condiment\n' +
      '{\n' +
      '    public Mocha(Beverage b) : base(b) { }\n' +
      '    public override string Desc => Inner.Desc + "+摩卡";\n' +
      '    public override decimal Cost() => Inner.Cost() + 3m;\n' +
      '}\n\n' +
      'Beverage cup = new Espresso();\n' +
      'cup = new Milk(cup);\n' +
      'cup = new Mocha(cup);\n' +
      'cup = new Mocha(cup);   // 双份摩卡\n' +
      'Console.WriteLine($"{cup.Desc} = ¥{cup.Cost()}");'
  },
  {
    id: 'facade',
    title: '外观模式 Facade',
    category: '结构型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '为复杂子系统提供一个简单统一的入口。',
    detail: [
      '外观模式用一个高层接口封装一群子系统的调用，降低客户端与子系统的耦合。',
      '.NET 里 Console、HttpClient 都可看作某种外观，把底层细节藏起来。',
      '外观不阻止客户端直接使用子系统，只是提供一个更友好的默认路径。'
    ],
    example:
      'using System;\n\n' +
      '// ----- 复杂子系统（客户端本不该直接拼这些调用） -----\n' +
      'public class Inventory\n' +
      '{\n' +
      '    public bool Reserve(string sku, int qty)\n' +
      '    {\n' +
      '        Console.WriteLine($"库存预留 {sku} x{qty}");\n' +
      '        return qty <= 10;\n' +
      '    }\n' +
      '    public void Release(string sku, int qty) => Console.WriteLine($"释放 {sku} x{qty}");\n' +
      '}\n' +
      'public class Payment\n' +
      '{\n' +
      '    public bool Charge(string user, decimal amount)\n' +
      '    {\n' +
      '        Console.WriteLine($"扣款 {user} ¥{amount}");\n' +
      '        return amount > 0;\n' +
      '    }\n' +
      '    public void Refund(string user, decimal amount) =>\n' +
      '        Console.WriteLine($"退款 {user} ¥{amount}");\n' +
      '}\n' +
      'public class Shipping\n' +
      '{\n' +
      '    public string CreateWaybill(string addr)\n' +
      '    {\n' +
      '        var no = "SF" + DateTime.Now.Ticks;\n' +
      '        Console.WriteLine($"运单 {no} -> {addr}");\n' +
      '        return no;\n' +
      '    }\n' +
      '}\n' +
      'public class Notify\n' +
      '{\n' +
      '    public void Mail(string user, string body) => Console.WriteLine($"通知 {user}: {body}");\n' +
      '}\n\n' +
      '// ----- 外观：一键下单 -----\n' +
      'public class OrderFacade\n' +
      '{\n' +
      '    private readonly Inventory _inv = new();\n' +
      '    private readonly Payment _pay = new();\n' +
      '    private readonly Shipping _ship = new();\n' +
      '    private readonly Notify _n = new();\n\n' +
      '    public string Place(string user, string sku, int qty, decimal price, string addr)\n' +
      '    {\n' +
      '        if (!_inv.Reserve(sku, qty)) throw new InvalidOperationException("缺货");\n' +
      '        var amount = price * qty;\n' +
      '        if (!_pay.Charge(user, amount))\n' +
      '        {\n' +
      '            _inv.Release(sku, qty);\n' +
      '            throw new InvalidOperationException("支付失败");\n' +
      '        }\n' +
      '        var wb = _ship.CreateWaybill(addr);\n' +
      '        _n.Mail(user, $"下单成功，运单 {wb}");\n' +
      '        return wb;\n' +
      '    }\n' +
      '}\n\n' +
      'var store = new OrderFacade();\n' +
      'var waybill = store.Place("alice", "SKU-9", 2, 99m, "上海浦东");\n' +
      'Console.WriteLine("运单号: " + waybill);'
    ,
    example2Title: '家庭影院一键观影（经典外观场景）',
    example2:
      'using System;\n\n' +
      'public class Amplifier { public void On() => Console.WriteLine("功放开"); public void Volume(int v) => Console.WriteLine("音量 " + v); }\n' +
      'public class Projector { public void On() => Console.WriteLine("投影开"); public void Wide() => Console.WriteLine("宽屏模式"); }\n' +
      'public class StreamingPlayer { public void On() => Console.WriteLine("播放器开"); public void Play(string m) => Console.WriteLine("播放 " + m); public void Stop() => Console.WriteLine("停止"); }\n' +
      'public class Lights { public void Dim(int p) => Console.WriteLine("灯光 " + p + "%"); }\n' +
      'public class Screen { public void Down() => Console.WriteLine("幕布降下"); public void Up() => Console.WriteLine("幕布升起"); }\n\n' +
      'public class HomeTheaterFacade\n' +
      '{\n' +
      '    private readonly Amplifier _amp = new();\n' +
      '    private readonly Projector _pj = new();\n' +
      '    private readonly StreamingPlayer _player = new();\n' +
      '    private readonly Lights _lights = new();\n' +
      '    private readonly Screen _screen = new();\n\n' +
      '    public void Watch(string movie)\n' +
      '    {\n' +
      '        Console.WriteLine("=== 开始观影 ===");\n' +
      '        _lights.Dim(10);\n' +
      '        _screen.Down();\n' +
      '        _pj.On(); _pj.Wide();\n' +
      '        _amp.On(); _amp.Volume(8);\n' +
      '        _player.On(); _player.Play(movie);\n' +
      '    }\n' +
      '    public void End()\n' +
      '    {\n' +
      '        Console.WriteLine("=== 散场 ===");\n' +
      '        _player.Stop();\n' +
      '        _lights.Dim(100);\n' +
      '        _screen.Up();\n' +
      '    }\n' +
      '}\n\n' +
      'var theater = new HomeTheaterFacade();\n' +
      'theater.Watch("盗梦空间");\n' +
      'theater.End();\n' +
      '// 需要时仍可直接操作 Amplifier，外观不禁止穿透'
  },
  {
    id: 'flyweight',
    title: '享元模式 Flyweight',
    category: '结构型模式',
    version: 'GoF 23',
    level: '高级',
    summary: '共享大量细粒度对象，用空间换性能，减少内存开销。',
    detail: [
      '享元把对象状态拆分为"内部状态"（可共享，与上下文无关）与"外部状态"（由调用方传入）。',
      '用工厂维护一个池，已存在的享元直接复用，避免重复创建成千上万个相似对象。',
      '.NET 的字符串驻留（string.Intern）就是享元思想；字符样式、棋子、树节点等是典型场景。'
    ],
    notes: [
      '享元适合"对象极多且内部状态可共享"的场景；若对象各不相同则没有收益。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      '// 内部状态：字体/字号/颜色，可被成千上万字符共享\n' +
      'public sealed class GlyphStyle\n' +
      '{\n' +
      '    public string Font { get; }\n' +
      '    public int Size { get; }\n' +
      '    public string Color { get; }\n' +
      '    public GlyphStyle(string font, int size, string color)\n' +
      '    { Font = font; Size = size; Color = color; }\n' +
      '    public override string ToString() => $"{Font} {Size}px {Color}";\n' +
      '}\n\n' +
      'public class StyleFactory\n' +
      '{\n' +
      '    private readonly Dictionary<string, GlyphStyle> _pool = new();\n' +
      '    public int PoolSize => _pool.Count;\n\n' +
      '    public GlyphStyle Get(string font, int size, string color)\n' +
      '    {\n' +
      '        var key = $"{font}|{size}|{color}";\n' +
      '        if (!_pool.TryGetValue(key, out var style))\n' +
      '            _pool[key] = style = new GlyphStyle(font, size, color);\n' +
      '        return style;\n' +
      '    }\n' +
      '}\n\n' +
      '// 外部状态：字符本身、坐标，每个字符不同，不放进享元\n' +
      'public readonly struct Glyph\n' +
      '{\n' +
      '    public char Char { get; }\n' +
      '    public int X { get; }\n' +
      '    public int Y { get; }\n' +
      '    public GlyphStyle Style { get; }\n' +
      '    public Glyph(char c, int x, int y, GlyphStyle s)\n' +
      '    { Char = c; X = x; Y = y; Style = s; }\n' +
      '    public void Draw() => Console.WriteLine($"\'{Char}\' @({X},{Y}) {Style}");\n' +
      '}\n\n' +
      'var factory = new StyleFactory();\n' +
      'var body = factory.Get("宋体", 14, "黑");\n' +
      'var title = factory.Get("黑体", 22, "蓝");\n\n' +
      'var doc = new List<Glyph>\n' +
      '{\n' +
      '    new(\'设\', 0, 0, title), new(\'计\', 22, 0, title),\n' +
      '    new(\'模\', 0, 30, body), new(\'式\', 14, 30, body),\n' +
      '    new(\'享\', 28, 30, factory.Get("宋体", 14, "黑")) // 复用 body\n' +
      '};\n' +
      'foreach (var g in doc) g.Draw();\n' +
      'Console.WriteLine("样式对象数: " + factory.PoolSize); // 2，不是 5\n' +
      'Console.WriteLine(ReferenceEquals(body, factory.Get("宋体", 14, "黑")));'
    ,
    example2Title: '树林渲染：树种共享，坐标外置',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public sealed class TreeType\n' +
      '{\n' +
      '    public string Name { get; }\n' +
      '    public string Texture { get; }\n' +
      '    public TreeType(string name, string texture) { Name = name; Texture = texture; }\n' +
      '    public void Draw(int x, int y, int age) =>\n' +
      '        Console.WriteLine($"画 {Name}({Texture}) 于 ({x},{y}) 树龄{age}");\n' +
      '}\n\n' +
      'public class TreeFactory\n' +
      '{\n' +
      '    private readonly Dictionary<string, TreeType> _types = new();\n' +
      '    public TreeType Get(string name, string texture) =>\n' +
      '        _types.TryGetValue(name, out var t) ? t : _types[name] = new TreeType(name, texture);\n' +
      '    public int TypeCount => _types.Count;\n' +
      '}\n\n' +
      'public class Tree\n' +
      '{\n' +
      '    public int X { get; }\n' +
      '    public int Y { get; }\n' +
      '    public int Age { get; }\n' +
      '    public TreeType Type { get; }\n' +
      '    public Tree(int x, int y, int age, TreeType type)\n' +
      '    { X = x; Y = y; Age = age; Type = type; }\n' +
      '    public void Draw() => Type.Draw(X, Y, Age);\n' +
      '}\n\n' +
      'var f = new TreeFactory();\n' +
      'var forest = new List<Tree>();\n' +
      'var rng = new Random(1);\n' +
      'string[] names = { "橡树", "松树", "桦树" };\n' +
      'for (int i = 0; i < 9; i++)\n' +
      '{\n' +
      '    var n = names[i % 3];\n' +
      '    forest.Add(new Tree(rng.Next(100), rng.Next(100), rng.Next(50),\n' +
      '        f.Get(n, n + ".png")));\n' +
      '}\n' +
      'forest.ForEach(t => t.Draw());\n' +
      'Console.WriteLine($"9 棵树只创建了 {f.TypeCount} 种 TreeType");\n\n' +
      '// 字符串驻留也是享元\n' +
      'var s1 = string.Intern("shared");\n' +
      'var s2 = string.Intern(new string("shared".ToCharArray()));\n' +
      'Console.WriteLine(ReferenceEquals(s1, s2)); // True'
  },
  {
    id: 'proxy',
    title: '代理模式 Proxy',
    category: '结构型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '为对象提供替身，以控制对它的访问（延迟加载、权限、缓存等）。',
    detail: [
      '代理与真实对象实现同一接口，客户端无感知；代理在转发前/后插入控制逻辑。',
      '常见变体：虚拟代理（延迟创建重对象）、保护代理（权限校验）、缓存代理（结果复用）。',
      'C# 里 DispatchProxy / Castle DynamicProxy 用代理实现 AOP、日志、重试。'
    ],
    example:
      'using System;\n' +
      'using System.Threading;\n\n' +
      'public interface IImage\n' +
      '{\n' +
      '    void Display();\n' +
      '    int ByteSize { get; }\n' +
      '}\n\n' +
      'public class RealImage : IImage\n' +
      '{\n' +
      '    public int ByteSize { get; }\n' +
      '    public RealImage(string file)\n' +
      '    {\n' +
      '        Console.WriteLine("从磁盘加载 " + file + " ...");\n' +
      '        Thread.Sleep(50);               // 模拟昂贵 I/O\n' +
      '        ByteSize = 2_048_000;\n' +
      '    }\n' +
      '    public void Display() => Console.WriteLine($"显示图片 ({ByteSize} bytes)");\n' +
      '}\n\n' +
      '// 虚拟代理：构造时代价为 0，第一次 Display 才真正加载\n' +
      'public class ImageProxy : IImage\n' +
      '{\n' +
      '    private readonly string _file;\n' +
      '    private RealImage _real;\n' +
      '    public ImageProxy(string file) => _file = file;\n' +
      '    public int ByteSize => _real?.ByteSize ?? 0;\n' +
      '    public void Display()\n' +
      '    {\n' +
      '        _real ??= new RealImage(_file);\n' +
      '        _real.Display();\n' +
      '    }\n' +
      '}\n\n' +
      'IImage[] gallery =\n' +
      '{\n' +
      '    new ImageProxy("hero.jpg"),\n' +
      '    new ImageProxy("thumb.jpg")\n' +
      '};\n' +
      'Console.WriteLine("画廊已创建，尚未读盘");\n' +
      'gallery[0].Display();   // 此时才加载 hero.jpg\n' +
      'gallery[0].Display();   // 第二次直接显示，不再加载'
    ,
    example2Title: '保护代理 + 缓存代理',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IBankAccount\n' +
      '{\n' +
      '    void Withdraw(decimal amount);\n' +
      '    decimal Balance { get; }\n' +
      '}\n\n' +
      'public class BankAccount : IBankAccount\n' +
      '{\n' +
      '    public decimal Balance { get; private set; } = 1000;\n' +
      '    public void Withdraw(decimal amount)\n' +
      '    {\n' +
      '        if (amount > Balance) throw new InvalidOperationException("余额不足");\n' +
      '        Balance -= amount;\n' +
      '        Console.WriteLine($"取出 {amount}，剩余 {Balance}");\n' +
      '    }\n' +
      '}\n\n' +
      '// 保护代理：校验角色\n' +
      'public class ProtectedAccount : IBankAccount\n' +
      '{\n' +
      '    private readonly IBankAccount _real;\n' +
      '    private readonly string _role;\n' +
      '    public ProtectedAccount(IBankAccount real, string role) { _real = real; _role = role; }\n' +
      '    public decimal Balance => _real.Balance;\n' +
      '    public void Withdraw(decimal amount)\n' +
      '    {\n' +
      '        if (_role != "owner") throw new UnauthorizedAccessException("无权取款");\n' +
      '        _real.Withdraw(amount);\n' +
      '    }\n' +
      '}\n\n' +
      'public interface IWeatherService { string Get(string city); }\n' +
      'public class SlowWeather : IWeatherService\n' +
      '{\n' +
      '    public string Get(string city)\n' +
      '    {\n' +
      '        Console.WriteLine("请求气象 API: " + city);\n' +
      '        return city + " 24°C";\n' +
      '    }\n' +
      '}\n\n' +
      '// 缓存代理\n' +
      'public class CachedWeather : IWeatherService\n' +
      '{\n' +
      '    private readonly IWeatherService _inner;\n' +
      '    private readonly Dictionary<string, string> _cache = new();\n' +
      '    public CachedWeather(IWeatherService inner) => _inner = inner;\n' +
      '    public string Get(string city)\n' +
      '    {\n' +
      '        if (_cache.TryGetValue(city, out var hit))\n' +
      '        {\n' +
      '            Console.WriteLine("缓存命中 " + city);\n' +
      '            return hit;\n' +
      '        }\n' +
      '        return _cache[city] = _inner.Get(city);\n' +
      '    }\n' +
      '}\n\n' +
      'IBankAccount acc = new ProtectedAccount(new BankAccount(), "guest");\n' +
      'try { acc.Withdraw(10); } catch (Exception ex) { Console.WriteLine(ex.Message); }\n' +
      'acc = new ProtectedAccount(new BankAccount(), "owner");\n' +
      'acc.Withdraw(50);\n\n' +
      'IWeatherService w = new CachedWeather(new SlowWeather());\n' +
      'Console.WriteLine(w.Get("上海"));\n' +
      'Console.WriteLine(w.Get("上海"));  // 第二次走缓存'
  }
];
