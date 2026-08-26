// C# 设计模式详解 —— 第二组：行为型（共 11 种）
module.exports = [
  {
    id: 'chain-of-responsibility',
    title: '职责链模式 Chain of Responsibility',
    category: '行为型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '把请求沿着处理者链传递，直到有人处理为止。',
    detail: [
      '每个处理者持有下一个处理者的引用，能处理就处理，否则转发给下一个，解耦"发送者"与"接收者"。',
      '典型场景：中间件管道、审批流、日志级别过滤。',
      '可用委托/链表实现，.NET 的 ASP.NET Core 中间件就是职责链的现代表达。'
    ],
    example:
      'public abstract class Handler\n' +
      '{\n' +
      '    protected Handler Next;\n' +
      '    public Handler SetNext(Handler h) { Next = h; return h; }\n' +
      '    public abstract void Handle(int level);\n' +
      '}\n\n' +
      'public class Low : Handler { public override void Handle(int l) { if (l < 10) Console.WriteLine("Low处理"); else Next?.Handle(l); } }\n' +
      'public class High : Handler { public override void Handle(int l) { if (l >= 10) Console.WriteLine("High处理"); else Next?.Handle(l); } }\n\n' +
      'var chain = new Low(); chain.SetNext(new High());\n' +
      'chain.Handle(20);'
  },
  {
    id: 'command',
    title: '命令模式 Command',
    category: '行为型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '把请求封装成对象，使其可参数化、排队、撤销。',
    detail: [
      '命令模式让"做什么"变成一个对象（含执行方法），调用方与执行方解耦。',
      '支持撤销/重做（保存命令历史 + Execute/Undo）、事务型操作、宏命令。',
      'WPF/WinForms 的 ICommand（如 RelayCommand）就是命令模式，把 UI 操作封装为可绑定对象。'
    ],
    notes: [
      '需要撤销时，命令对象应保存足够的"逆向信息"（如修改前的旧值）。'
    ],
    example:
      'public interface ICommand { void Execute(); void Undo(); }\n' +
      'public class Light { public void On() => Console.WriteLine("开灯"); public void Off() => Console.WriteLine("关灯"); }\n\n' +
      'public class TurnOn : ICommand\n' +
      '{\n' +
      '    private Light _l;\n' +
      '    public TurnOn(Light l) { _l = l; }\n' +
      '    public void Execute() => _l.On();\n' +
      '    public void Undo() => _l.Off();\n' +
      '}\n\n' +
      'var history = new Stack<ICommand>();\n' +
      'ICommand cmd = new TurnOn(new Light());\n' +
      'cmd.Execute(); history.Push(cmd);\n' +
      'history.Pop().Undo();'
  },
  {
    id: 'interpreter',
    title: '解释器模式 Interpreter',
    category: '行为型模式',
    version: 'GoF 23',
    level: '高级',
    summary: '为语言定义文法并构造解释器，解释句子。',
    detail: [
      '解释器把每条文法规则表示为一个类，组合成抽象语法树后递归求值。',
      '适合简单、频繁变化的小语言（如规则表达式、配置 DSL）；复杂语言请用现成的解析器生成器。',
      'C# 中常配合 Expression 表达式树或 Roslyn 实现更强大的"解释"。'
    ],
    example:
      'public interface IExpr { int Eval(); }\n' +
      'public class Num : IExpr { private int _v; public Num(int v) { _v = v; } public int Eval() => _v; }\n' +
      'public class Add : IExpr { private IExpr _a, _b; public Add(IExpr a, IExpr b) { _a=a; _b=b; } public int Eval() => _a.Eval() + _b.Eval(); }\n\n' +
      '// 抽象语法树：(1 + 2) + 3\n' +
      'var tree = new Add(new Add(new Num(1), new Num(2)), new Num(3));\n' +
      'Console.WriteLine(tree.Eval());   // 6'
  },
  {
    id: 'iterator',
    title: '迭代器模式 Iterator',
    category: '行为型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '提供一种顺序访问聚合对象元素的方式，又不暴露内部结构。',
    detail: [
      '迭代器把"遍历逻辑"从聚合对象中抽离，客户端用统一方式（foreach）遍历而不关心底层是数组还是树。',
      'C# 中 IEnumerable<T>/IEnumerator<T> 与 yield return 让实现迭代器极其简单（编译器生成状态机）。',
      '自定义集合只要实现 IEnumerable 即可用 foreach、LINQ、解构。'
    ],
    example:
      'public class MyList : IEnumerable<int>\n' +
      '{\n' +
      '    private int[] _items = { 1, 2, 3 };\n' +
      '    public IEnumerator<int> GetEnumerator()\n' +
      '    {\n' +
      '        foreach (var x in _items) yield return x;   // 编译器生成迭代器\n' +
      '    }\n' +
      '    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();\n' +
      '}\n\n' +
      'foreach (var x in new MyList()) Console.WriteLine(x);'
  },
  {
    id: 'mediator',
    title: '中介者模式 Mediator',
    category: '行为型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '用中介对象封装一组对象的交互，避免对象间相互引用。',
    detail: [
      '各同事对象只与中介者通信，由中介者负责协调，从而降低对象间耦合（网状依赖→星型依赖）。',
      '典型例子：聊天室（用户不直接互发，经服务器转发）、UI 控件联动。',
      'ASP.NET Core 的 IMediator（MediatR 库）用中介者实现"请求-处理器"解耦与 CQRS。'
    ],
    example:
      'public interface IMediator { void Send(string msg, Colleague c); }\n' +
      'public class Colleague { public string Name; public IMediator M; public void Send(string s) => M.Send(s, this); }\n\n' +
      'public class ChatRoom : IMediator\n' +
      '{\n' +
      '    private List<Colleague> _users = new();\n' +
      '    public void Join(Colleague c) { c.M = this; _users.Add(c); }\n' +
      '    public void Send(string msg, Colleague from) => _users.ForEach(u => Console.WriteLine($"{from.Name}: {msg}"));\n' +
      '}\n\n' +
      'var room = new ChatRoom();\n' +
      'var a = new Colleague { Name = "A" }; room.Join(a); room.Join(new Colleague { Name = "B" });\n' +
      'a.Send("大家好");'
  },
  {
    id: 'memento',
    title: '备忘录模式 Memento',
    category: '行为型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '在不破坏封装的前提下，捕获并恢复对象内部状态。',
    detail: [
      '原发器创建备忘录保存状态；管理者持有备忘录但不关心其内部结构，只负责存储以便回滚。',
      'C# 中常用 private 嵌套类作备忘录，保证只有原发器能访问其内部字段（封装）。',
      '典型场景：编辑器撤销、游戏存档、向导步骤回退。'
    ],
    example:
      'public class Editor\n' +
      '{\n' +
      '    public string Text { get; set; }\n' +
      '    public IMemento Save() => new Snapshot(Text);\n' +
      '    public void Restore(IMemento m) => Text = ((Snapshot)m).State;\n' +
      '    private interface IMemento { }\n' +
      '    private class Snapshot : IMemento { public string State; public Snapshot(string t) { State = t; } }\n' +
      '}\n\n' +
      'var e = new Editor(); e.Text = "v1";\n' +
      'var m = e.Save();\n' +
      'e.Text = "v2"; e.Restore(m);\n' +
      'Console.WriteLine(e.Text);   // v1'
  },
  {
    id: 'observer',
    title: '观察者模式 Observer',
    category: '行为型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '一对多依赖：主题状态变化时，所有订阅者自动收到通知。',
    detail: [
      '主题维护观察者列表，状态变更时逐个通知；观察者实现统一更新接口。',
      'C# 自带 event + EventHandler 就是观察者模式的原生实现（委托即"多播通知"）。',
      '典型应用：UI 数据绑定、消息订阅、发布-订阅系统。'
    ],
    notes: [
      '长生命周期的主题持有观察者引用会造成内存泄漏，不用时记得退订（event -=）。'
    ],
    example:
      'public class Subject\n' +
      '{\n' +
      '    public event Action<string> Changed;\n' +
      '    private string _state;\n' +
      '    public string State { get => _state; set { _state = value; Changed?.Invoke(value); } }\n' +
      '}\n\n' +
      'var s = new Subject();\n' +
      's.Changed += msg => Console.WriteLine("收到:" + msg);\n' +
      's.State = "新值";   // 自动通知'
  },
  {
    id: 'state',
    title: '状态模式 State',
    category: '行为型模式',
    version: 'GoF 23',
    level: '进阶',
    summary: '让对象在内部状态改变时改变行为，替代庞大的 if/switch。',
    detail: [
      '把每种状态封装成独立类，实现统一状态接口；上下文把请求委托给当前状态对象。',
      '适合"对象行为依赖状态且状态很多"的场景，如订单状态机、播放器状态。',
      '与策略模式相似，但状态常自行切换到下一状态，而策略由客户端选择。'
    ],
    example:
      'public interface IState { void Handle(Context c); }\n' +
      'public class Context { public IState State { get; set; } public void Request() => State.Handle(this); }\n\n' +
      'public class Idle : IState { public void Handle(Context c) { Console.WriteLine("空闲→运行"); c.State = new Running(); } }\n' +
      'public class Running : IState { public void Handle(Context c) { Console.WriteLine("运行→停止"); c.State = new Stopped(); } }\n' +
      'public class Stopped : IState { public void Handle(Context c) { Console.WriteLine("已停止"); } }\n\n' +
      'var ctx = new Context { State = new Idle() };\n' +
      'ctx.Request(); ctx.Request(); ctx.Request();'
  },
  {
    id: 'strategy',
    title: '策略模式 Strategy',
    category: '行为型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '把可互换的算法封装起来，运行时选择，消除条件分支。',
    detail: [
      '策略模式定义一组算法接口，各算法各自实现，客户端通过组合选择其一。',
      'C# 里配合委托/lambda 极其简洁：Func<T> 作策略，比定义一堆类更轻量。',
      '典型场景：排序比较器、压缩方式、促销折扣计算、支付方式选择。'
    ],
    example:
      'public interface IDiscount { decimal Apply(decimal p); }\n' +
      'public class NoDiscount : IDiscount { public decimal Apply(decimal p) => p; }\n' +
      'public class HalfOff : IDiscount { public decimal Apply(decimal p) => p / 2; }\n\n' +
      'public class Cart\n' +
      '{\n' +
      '    private IDiscount _strategy;\n' +
      '    public Cart(IDiscount s) { _strategy = s; }\n' +
      '    public decimal Checkout(decimal price) => _strategy.Apply(price);\n' +
      '}\n\n' +
      '// 用委托更轻量\n' +
      'decimal Calc(decimal p, Func<decimal, decimal> strategy) => strategy(p);\n' +
      'Calc(100, x => x * 0.9m);'
  },
  {
    id: 'template-method',
    title: '模板方法模式 Template Method',
    category: '行为型模式',
    version: 'GoF 23',
    level: '入门',
    summary: '在基类定义算法骨架，把某些步骤留给子类实现。',
    detail: [
      '模板方法把不变的整体流程固定在基类，可变步骤用 abstract/virtual 钩子让子类填充。',
      '用 sealed 保护关键步骤不被子类覆写，保证骨架不被破坏。',
      '典型场景：框架的"生命周期钩子"（如 ASP.NET 的页面生命周期、单元测试的 SetUp/TearDown）。'
    ],
    example:
      'public abstract class DataProcessor\n' +
      '{\n' +
      '    public sealed void Run()   // 算法骨架，固定\n' +
      '    {\n' +
      '        Load(); Transform(); Save();\n' +
      '    }\n' +
      '    protected abstract void Load();\n' +
      '    protected virtual void Transform() { }   // 钩子，可选\n' +
      '    protected abstract void Save();\n' +
      '}\n\n' +
      'public class CsvProcessor : DataProcessor\n' +
      '{\n' +
      '    protected override void Load() => Console.WriteLine("加载CSV");\n' +
      '    protected override void Save() => Console.WriteLine("保存结果");\n' +
      '}\n\n' +
      'new CsvProcessor().Run();'
  },
  {
    id: 'visitor',
    title: '访问者模式 Visitor',
    category: '行为型模式',
    version: 'GoF 23',
    level: '高级',
    summary: '把对元素的新操作封装成访问者，避免修改元素类。',
    detail: [
      '访问者模式把"对一组类的新操作"集中到一个 Visitor 中，元素类只提供一个 Accept(visitor) 入口。',
      '适合"结构稳定但操作频繁变化"的场景（如 AST 上的多种分析、导出多种格式）。',
      '代价是新增元素类型要改动所有访问者接口，违反开闭原则——结构稳定时才用。'
    ],
    notes: [
      'C# 用 double dispatch（元素.Accept + 访问者.Visit(具体类型)）实现静态分派的多态。'
    ],
    example:
      'public interface IVisitor { void Visit(ElementA a); void Visit(ElementB b); }\n' +
      'public interface IElement { void Accept(IVisitor v); }\n' +
      'public class ElementA : IElement { public void Accept(IVisitor v) => v.Visit(this); }\n' +
      'public class ElementB : IElement { public void Accept(IVisitor v) => v.Visit(this); }\n\n' +
      'public class ExportVisitor : IVisitor   // 新操作：导出，不改动元素类\n' +
      '{\n' +
      '    public void Visit(ElementA a) => Console.WriteLine("导出A");\n' +
      '    public void Visit(ElementB b) => Console.WriteLine("导出B");\n' +
      '}\n\n' +
      'IElement[] items = { new ElementA(), new ElementB() };\n' +
      'var v = new ExportVisitor();\n' +
      'foreach (var e in items) e.Accept(v);'
  }
];
