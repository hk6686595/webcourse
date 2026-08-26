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
      'public sealed class AppConfig\n' +
      '{\n' +
      '    private static readonly Lazy<AppConfig> _instance\n' +
      '        = new(() => new AppConfig());\n\n' +
      '    public static AppConfig Instance => _instance.Value;   // 线程安全惰性单例\n\n' +
      '    public string ApiBase { get; } = "https://api.example.com";\n\n' +
      '    private AppConfig() { }   // 私有构造，禁止外部 new\n' +
      '}\n\n' +
      '// 使用\n' +
      'var cfg = AppConfig.Instance;\n' +
      'Console.WriteLine(cfg.ApiBase);'
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
      '典型场景：框架提供扩展点，用户通过重写工厂方法注入自己的产品类型。'
    ],
    example:
      'public abstract class Transport\n' +
      '{\n' +
      '    public abstract void Deliver();\n' +
      '    public static Transport Create(string kind) =>\n' +
      '        kind switch { "truck" => new Truck(), "ship" => new Ship(), _ => throw new ArgumentException() };\n' +
      '}\n\n' +
      'public class Truck : Transport { public override void Deliver() => Console.WriteLine("公路运输"); }\n' +
      'public class Ship  : Transport { public override void Deliver() => Console.WriteLine("海运"); }\n\n' +
      'var t = Transport.Create("truck");\n' +
      't.Deliver();'
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
      'public interface IButton { void Paint(); }\n' +
      'public interface ICheckbox { void Paint(); }\n' +
      'public interface IGuiFactory { IButton CreateButton(); ICheckbox CreateCheckbox(); }\n\n' +
      'public class WinFactory : IGuiFactory {\n' +
      '    public IButton CreateButton() => new WinButton();\n' +
      '    public ICheckbox CreateCheckbox() => new WinCheckbox();\n' +
      '}\n' +
      'public class MacFactory : IGuiFactory {\n' +
      '    public IButton CreateButton() => new MacButton();\n' +
      '    public ICheckbox CreateCheckbox() => new MacCheckbox();\n' +
      '}\n\n' +
      'void Render(IGuiFactory f) {\n' +
      '    f.CreateButton().Paint();\n' +
      '    f.CreateCheckbox().Paint();   // 同一族，风格一致\n' +
      '}'
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
      'public class Pizza\n' +
      '{\n' +
      '    public string Dough { get; }\n' +
      '    public string Sauce { get; }\n' +
      '    public System.Collections.Generic.List<string> Toppings { get; }\n' +
      '    public Pizza(string dough, string sauce, System.Collections.Generic.List<string> t) { Dough=dough; Sauce=sauce; Toppings=t; }\n' +
      '}\n\n' +
      'public class PizzaBuilder\n' +
      '{\n' +
      '    private string _dough, _sauce;\n' +
      '    private System.Collections.Generic.List<string> _t = new();\n' +
      '    public PizzaBuilder Dough(string d) { _dough = d; return this; }\n' +
      '    public PizzaBuilder Sauce(string s) { _sauce = s; return this; }\n' +
      '    public PizzaBuilder AddTopping(string t) { _t.Add(t); return this; }\n' +
      '    public Pizza Build() => new Pizza(_dough, _sauce, _t);\n' +
      '}\n\n' +
      'var p = new PizzaBuilder().Dough("厚").Sauce("番茄").AddTopping("芝士").Build();'
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
      'public interface IPrototype<out T> { T Clone(); }\n\n' +
      'public class Resume : IPrototype<Resume>\n' +
      '{\n' +
      '    public string Name { get; set; }\n' +
      '    public List<string> Skills { get; set; }\n' +
      '    public Resume Clone() => new Resume { Name = Name, Skills = new List<string>(Skills) };  // 深拷贝列表\n' +
      '}\n\n' +
      'var a = new Resume { Name = "张三", Skills = new List<string> { "C#" } };\n' +
      'var b = a.Clone();\n' +
      'b.Skills.Add("SQL");   // 不影响 a'
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
      'public interface ITarget { void Request(); }\n' +
      'public class Adaptee { public void SpecificRequest() => Console.WriteLine("原有实现"); }\n\n' +
      'public class Adapter : ITarget\n' +
      '{\n' +
      '    private readonly Adaptee _adaptee = new();\n' +
      '    public void Request() => _adaptee.SpecificRequest();   // 转接\n' +
      '}\n\n' +
      'ITarget t = new Adapter();\n' +
      't.Request();'
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
      'public interface IRenderer { void RenderCircle(double r); }\n' +
      'public class VectorRenderer : IRenderer { public void RenderCircle(double r) => Console.WriteLine("矢量圆"); }\n' +
      'public class RasterRenderer : IRenderer { public void RenderCircle(double r) => Console.WriteLine("光栅圆"); }\n\n' +
      'public abstract class Shape\n' +
      '{\n' +
      '    protected IRenderer Renderer;\n' +
      '    protected Shape(IRenderer r) { Renderer = r; }\n' +
      '    public abstract void Draw();\n' +
      '}\n' +
      'public class Circle : Shape { public Circle(IRenderer r) : base(r) { } public override void Draw() => Renderer.RenderCircle(1); }\n\n' +
      'var c = new Circle(new VectorRenderer());\n' +
      'c.Draw();'
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
      'public interface IComponent { void Show(int depth = 0); }\n\n' +
      'public class Leaf : IComponent\n' +
      '{\n' +
      '    private string _name;\n' +
      '    public Leaf(string n) { _name = n; }\n' +
      '    public void Show(int depth = 0) => Console.WriteLine(new string(\' \', depth * 2) + _name);\n' +
      '}\n\n' +
      'public class Composite : IComponent\n' +
      '{\n' +
      '    private string _name;\n' +
      '    private List<IComponent> _children = new();\n' +
      '    public Composite(string n) { _name = n; }\n' +
      '    public void Add(IComponent c) => _children.Add(c);\n' +
      '    public void Show(int depth = 0)\n' +
      '    {\n' +
      '        Console.WriteLine(new string(\' \', depth * 2) + _name);\n' +
      '        foreach (var c in _children) c.Show(depth + 1);\n' +
      '    }\n' +
      '}\n\n' +
      'var root = new Composite("根");\n' +
      'root.Add(new Leaf("文件A"));\n' +
      'root.Show();'
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
      'public interface INotifier { void Send(string msg); }\n' +
      'public class EmailNotifier : INotifier { public void Send(string m) => Console.WriteLine("邮件:" + m); }\n\n' +
      'public class SmsDecorator : INotifier\n' +
      '{\n' +
      '    private readonly INotifier _inner;\n' +
      '    public SmsDecorator(INotifier inner) { _inner = inner; }\n' +
      '    public void Send(string m) { _inner.Send(m); Console.WriteLine("短信:" + m); }\n' +
      '}\n\n' +
      'INotifier n = new SmsDecorator(new EmailNotifier());\n' +
      'n.Send("你好");   // 邮件 + 短信'
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
      'public class SubSystemA { public void A() => Console.WriteLine("子系统A"); }\n' +
      'public class SubSystemB { public void B() => Console.WriteLine("子系统B"); }\n\n' +
      'public class Facade\n' +
      '{\n' +
      '    private readonly SubSystemA _a = new();\n' +
      '    private readonly SubSystemB _b = new();\n' +
      '    public void Operation() { _a.A(); _b.B(); }   // 统一入口\n' +
      '}\n\n' +
      'new Facade().Operation();'
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
      'public class CharStyle { public string Font { get; } public CharStyle(string f) { Font = f; } }\n\n' +
      'public class StyleFactory\n' +
      '{\n' +
      '    private Dictionary<string, CharStyle> _pool = new();\n' +
      '    public CharStyle Get(string font) =>\n' +
      '        _pool.TryGetValue(font, out var s) ? s : _pool[font] = new CharStyle(font);  // 共享\n' +
      '}\n\n' +
      'var f = new StyleFactory();\n' +
      'var a = f.Get("宋体"); var b = f.Get("宋体");\n' +
      'Console.WriteLine(ReferenceEquals(a, b));  // True，复用同一实例'
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
      'public interface IImage { void Display(); }\n' +
      'public class RealImage : IImage\n' +
      '{\n' +
      '    public RealImage(string file) { Console.WriteLine("加载 " + file); }  // 昂贵\n' +
      '    public void Display() => Console.WriteLine("显示");\n' +
      '}\n\n' +
      'public class ImageProxy : IImage   // 虚拟代理：延迟加载\n' +
      '{\n' +
      '    private RealImage _real;\n' +
      '    private string _file;\n' +
      '    public ImageProxy(string file) { _file = file; }\n' +
      '    public void Display()\n' +
      '    {\n' +
      '        _real ??= new RealImage(_file);   // 第一次才真正创建\n' +
      '        _real.Display();\n' +
      '    }\n' +
      '}\n\n' +
      'IImage img = new ImageProxy("a.jpg");\n' +
      'img.Display();   // 此时才加载'
  }
];
