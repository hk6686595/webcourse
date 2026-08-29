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
      'using System;\n\n' +
      'public class SupportTicket\n' +
      '{\n' +
      '    public string Title { get; init; }\n' +
      '    public int Severity { get; init; }   // 1 低 ~ 3 紧急\n' +
      '    public bool Handled { get; set; }\n' +
      '}\n\n' +
      'public abstract class SupportHandler\n' +
      '{\n' +
      '    private SupportHandler _next;\n' +
      '    public SupportHandler SetNext(SupportHandler next)\n' +
      '    {\n' +
      '        _next = next;\n' +
      '        return next;              // 便于链式拼接\n' +
      '    }\n' +
      '    public void Handle(SupportTicket t)\n' +
      '    {\n' +
      '        if (CanHandle(t))\n' +
      '        {\n' +
      '            Process(t);\n' +
      '            t.Handled = true;\n' +
      '            return;\n' +
      '        }\n' +
      '        Console.WriteLine($"{GetType().Name} 无法处理，转交下级");\n' +
      '        _next?.Handle(t);\n' +
      '        if (!t.Handled && _next is null)\n' +
      '            Console.WriteLine("整条链都无法处理: " + t.Title);\n' +
      '    }\n' +
      '    protected abstract bool CanHandle(SupportTicket t);\n' +
      '    protected abstract void Process(SupportTicket t);\n' +
      '}\n\n' +
      'public class L1Helpdesk : SupportHandler\n' +
      '{\n' +
      '    protected override bool CanHandle(SupportTicket t) => t.Severity <= 1;\n' +
      '    protected override void Process(SupportTicket t) =>\n' +
      '        Console.WriteLine($"L1 重置密码/答疑: {t.Title}");\n' +
      '}\n' +
      'public class L2Engineer : SupportHandler\n' +
      '{\n' +
      '    protected override bool CanHandle(SupportTicket t) => t.Severity == 2;\n' +
      '    protected override void Process(SupportTicket t) =>\n' +
      '        Console.WriteLine($"L2 排查缺陷: {t.Title}");\n' +
      '}\n' +
      'public class L3Architect : SupportHandler\n' +
      '{\n' +
      '    protected override bool CanHandle(SupportTicket t) => t.Severity >= 3;\n' +
      '    protected override void Process(SupportTicket t) =>\n' +
      '        Console.WriteLine($"L3 紧急响应: {t.Title}");\n' +
      '}\n\n' +
      'var chain = new L1Helpdesk();\n' +
      'chain.SetNext(new L2Engineer()).SetNext(new L3Architect());\n\n' +
      'chain.Handle(new SupportTicket { Title = "无法登录", Severity = 1 });\n' +
      'chain.Handle(new SupportTicket { Title = "支付失败", Severity = 2 });\n' +
      'chain.Handle(new SupportTicket { Title = "全站宕机", Severity = 3 });'
    ,
    example2Title: '审批流 + 中间件管道（委托链）',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public class Expense\n' +
      '{\n' +
      '    public string Applicant { get; init; }\n' +
      '    public decimal Amount { get; init; }\n' +
      '    public string Status { get; set; } = "待审";\n' +
      '}\n\n' +
      'public abstract class Approver\n' +
      '{\n' +
      '    protected Approver Next;\n' +
      '    public Approver Then(Approver n) { Next = n; return n; }\n' +
      '    public abstract void Approve(Expense e);\n' +
      '}\n' +
      'public class Manager : Approver\n' +
      '{\n' +
      '    public override void Approve(Expense e)\n' +
      '    {\n' +
      '        if (e.Amount <= 1000) { e.Status = "经理通过"; Console.WriteLine(e.Status); }\n' +
      '        else Next?.Approve(e);\n' +
      '    }\n' +
      '}\n' +
      'public class Director : Approver\n' +
      '{\n' +
      '    public override void Approve(Expense e)\n' +
      '    {\n' +
      '        if (e.Amount <= 10000) { e.Status = "总监通过"; Console.WriteLine(e.Status); }\n' +
      '        else Next?.Approve(e);\n' +
      '    }\n' +
      '}\n' +
      'public class Ceo : Approver\n' +
      '{\n' +
      '    public override void Approve(Expense e)\n' +
      '    {\n' +
      '        e.Status = "CEO 通过";\n' +
      '        Console.WriteLine(e.Status);\n' +
      '    }\n' +
      '}\n\n' +
      'var flow = new Manager();\n' +
      'flow.Then(new Director()).Then(new Ceo());\n' +
      'flow.Approve(new Expense { Applicant = "张三", Amount = 800 });\n' +
      'flow.Approve(new Expense { Applicant = "李四", Amount = 5000 });\n' +
      'flow.Approve(new Expense { Applicant = "王五", Amount = 50000 });\n\n' +
      '// ASP.NET 风格中间件：委托组成管道\n' +
      'public delegate void HttpMiddleware(string ctx, Action next);\n\n' +
      'void RunPipeline(string ctx, IReadOnlyList<HttpMiddleware> mws)\n' +
      '{\n' +
      '    void Invoke(int i)\n' +
      '    {\n' +
      '        if (i >= mws.Count) { Console.WriteLine("  终点: " + ctx); return; }\n' +
      '        mws[i](ctx, () => Invoke(i + 1));\n' +
      '    }\n' +
      '    Invoke(0);\n' +
      '}\n\n' +
      'HttpMiddleware[] pipe =\n' +
      '{\n' +
      '    (ctx, next) => { Console.WriteLine("Auth"); next(); },\n' +
      '    (ctx, next) => { Console.WriteLine("Log"); next(); },\n' +
      '    (ctx, next) => { Console.WriteLine("Handler"); next(); }\n' +
      '};\n' +
      'RunPipeline("GET /orders", pipe);'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface ICommand\n' +
      '{\n' +
      '    void Execute();\n' +
      '    void Undo();\n' +
      '}\n\n' +
      'public class Light\n' +
      '{\n' +
      '    public bool On { get; private set; }\n' +
      '    public void TurnOn() { On = true; Console.WriteLine("灯开"); }\n' +
      '    public void TurnOff() { On = false; Console.WriteLine("灯关"); }\n' +
      '}\n' +
      'public class Stereo\n' +
      '{\n' +
      '    public int Volume { get; private set; } = 5;\n' +
      '    public void SetVolume(int v) { Volume = v; Console.WriteLine("音量 " + v); }\n' +
      '}\n\n' +
      'public class LightOnCommand : ICommand\n' +
      '{\n' +
      '    private readonly Light _light;\n' +
      '    public LightOnCommand(Light light) => _light = light;\n' +
      '    public void Execute() => _light.TurnOn();\n' +
      '    public void Undo() => _light.TurnOff();\n' +
      '}\n' +
      'public class VolumeCommand : ICommand\n' +
      '{\n' +
      '    private readonly Stereo _stereo;\n' +
      '    private readonly int _target;\n' +
      '    private int _prev;\n' +
      '    public VolumeCommand(Stereo s, int target) { _stereo = s; _target = target; }\n' +
      '    public void Execute() { _prev = _stereo.Volume; _stereo.SetVolume(_target); }\n' +
      '    public void Undo() => _stereo.SetVolume(_prev);\n' +
      '}\n\n' +
      '// 宏命令：一次执行多条\n' +
      'public class MacroCommand : ICommand\n' +
      '{\n' +
      '    private readonly ICommand[] _cmds;\n' +
      '    public MacroCommand(params ICommand[] cmds) => _cmds = cmds;\n' +
      '    public void Execute() { foreach (var c in _cmds) c.Execute(); }\n' +
      '    public void Undo() { for (int i = _cmds.Length - 1; i >= 0; i--) _cmds[i].Undo(); }\n' +
      '}\n\n' +
      'public class Remote\n' +
      '{\n' +
      '    private readonly Stack<ICommand> _undo = new();\n' +
      '    private readonly Stack<ICommand> _redo = new();\n' +
      '    public void Press(ICommand cmd)\n' +
      '    {\n' +
      '        cmd.Execute();\n' +
      '        _undo.Push(cmd);\n' +
      '        _redo.Clear();\n' +
      '    }\n' +
      '    public void Undo() { if (_undo.Count == 0) return; var c = _undo.Pop(); c.Undo(); _redo.Push(c); }\n' +
      '    public void Redo() { if (_redo.Count == 0) return; var c = _redo.Pop(); c.Execute(); _undo.Push(c); }\n' +
      '}\n\n' +
      'var light = new Light();\n' +
      'var stereo = new Stereo();\n' +
      'var remote = new Remote();\n' +
      'var movieNight = new MacroCommand(new LightOnCommand(light), new VolumeCommand(stereo, 12));\n' +
      'remote.Press(movieNight);\n' +
      'remote.Undo();    // 音量还原，再关灯\n' +
      'remote.Redo();'
    ,
    example2Title: '文本编辑器：可撤销的插入/删除',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Text;\n\n' +
      'public interface ICommand { void Execute(); void Undo(); }\n\n' +
      'public class Document\n' +
      '{\n' +
      '    private readonly StringBuilder _buf = new();\n' +
      '    public string Text => _buf.ToString();\n' +
      '    public void Insert(int index, string s) => _buf.Insert(index, s);\n' +
      '    public string Delete(int index, int len)\n' +
      '    {\n' +
      '        var cut = _buf.ToString(index, len);\n' +
      '        _buf.Remove(index, len);\n' +
      '        return cut;\n' +
      '    }\n' +
      '}\n\n' +
      'public class InsertCommand : ICommand\n' +
      '{\n' +
      '    private readonly Document _doc;\n' +
      '    private readonly int _index;\n' +
      '    private readonly string _text;\n' +
      '    public InsertCommand(Document d, int i, string t) { _doc = d; _index = i; _text = t; }\n' +
      '    public void Execute() => _doc.Insert(_index, _text);\n' +
      '    public void Undo() => _doc.Delete(_index, _text.Length);\n' +
      '}\n' +
      'public class DeleteCommand : ICommand\n' +
      '{\n' +
      '    private readonly Document _doc;\n' +
      '    private readonly int _index, _len;\n' +
      '    private string _deleted;\n' +
      '    public DeleteCommand(Document d, int i, int len) { _doc = d; _index = i; _len = len; }\n' +
      '    public void Execute() => _deleted = _doc.Delete(_index, _len);\n' +
      '    public void Undo() => _doc.Insert(_index, _deleted);\n' +
      '}\n\n' +
      'var doc = new Document();\n' +
      'var hist = new Stack<ICommand>();\n' +
      'void Do(ICommand c) { c.Execute(); hist.Push(c); Console.WriteLine("=> " + doc.Text); }\n\n' +
      'Do(new InsertCommand(doc, 0, "Hello"));\n' +
      'Do(new InsertCommand(doc, 5, " World"));\n' +
      'Do(new DeleteCommand(doc, 5, 6));     // 删掉 " World"\n' +
      'hist.Pop().Undo(); Console.WriteLine("撤销 => " + doc.Text);\n' +
      'hist.Pop().Undo(); Console.WriteLine("撤销 => " + doc.Text);'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IExpr\n' +
      '{\n' +
      '    int Eval(Dictionary<string, int> ctx);\n' +
      '}\n\n' +
      'public class Number : IExpr\n' +
      '{\n' +
      '    private readonly int _value;\n' +
      '    public Number(int value) => _value = value;\n' +
      '    public int Eval(Dictionary<string, int> ctx) => _value;\n' +
      '}\n' +
      'public class Variable : IExpr\n' +
      '{\n' +
      '    private readonly string _name;\n' +
      '    public Variable(string name) => _name = name;\n' +
      '    public int Eval(Dictionary<string, int> ctx) => ctx[_name];\n' +
      '}\n' +
      'public class Add : IExpr\n' +
      '{\n' +
      '    private readonly IExpr _l, _r;\n' +
      '    public Add(IExpr l, IExpr r) { _l = l; _r = r; }\n' +
      '    public int Eval(Dictionary<string, int> ctx) => _l.Eval(ctx) + _r.Eval(ctx);\n' +
      '}\n' +
      'public class Mul : IExpr\n' +
      '{\n' +
      '    private readonly IExpr _l, _r;\n' +
      '    public Mul(IExpr l, IExpr r) { _l = l; _r = r; }\n' +
      '    public int Eval(Dictionary<string, int> ctx) => _l.Eval(ctx) * _r.Eval(ctx);\n' +
      '}\n' +
      'public class Sub : IExpr\n' +
      '{\n' +
      '    private readonly IExpr _l, _r;\n' +
      '    public Sub(IExpr l, IExpr r) { _l = l; _r = r; }\n' +
      '    public int Eval(Dictionary<string, int> ctx) => _l.Eval(ctx) - _r.Eval(ctx);\n' +
      '}\n\n' +
      '// AST: (x + 2) * (y - 1)\n' +
      'IExpr expr = new Mul(\n' +
      '    new Add(new Variable("x"), new Number(2)),\n' +
      '    new Sub(new Variable("y"), new Number(1)));\n\n' +
      'var ctx = new Dictionary<string, int> { ["x"] = 3, ["y"] = 5 };\n' +
      'Console.WriteLine(expr.Eval(ctx));   // (3+2)*(5-1) = 20\n\n' +
      'ctx["x"] = 10;\n' +
      'Console.WriteLine(expr.Eval(ctx));   // (10+2)*(5-1) = 48'
    ,
    example2Title: '布尔规则引擎：VIP 且金额达标才打折',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IBoolExpr\n' +
      '{\n' +
      '    bool Eval(Dictionary<string, object> ctx);\n' +
      '}\n\n' +
      'public class Const : IBoolExpr\n' +
      '{\n' +
      '    private readonly bool _v;\n' +
      '    public Const(bool v) => _v = v;\n' +
      '    public bool Eval(Dictionary<string, object> ctx) => _v;\n' +
      '}\n' +
      'public class HasFlag : IBoolExpr\n' +
      '{\n' +
      '    private readonly string _key;\n' +
      '    public HasFlag(string key) => _key = key;\n' +
      '    public bool Eval(Dictionary<string, object> ctx) =>\n' +
      '        ctx.TryGetValue(_key, out var v) && v is true;\n' +
      '}\n' +
      'public class GreaterThan : IBoolExpr\n' +
      '{\n' +
      '    private readonly string _key;\n' +
      '    private readonly decimal _n;\n' +
      '    public GreaterThan(string key, decimal n) { _key = key; _n = n; }\n' +
      '    public bool Eval(Dictionary<string, object> ctx) =>\n' +
      '        Convert.ToDecimal(ctx[_key]) > _n;\n' +
      '}\n' +
      'public class And : IBoolExpr\n' +
      '{\n' +
      '    private readonly IBoolExpr _l, _r;\n' +
      '    public And(IBoolExpr l, IBoolExpr r) { _l = l; _r = r; }\n' +
      '    public bool Eval(Dictionary<string, object> ctx) => _l.Eval(ctx) && _r.Eval(ctx);\n' +
      '}\n' +
      'public class Or : IBoolExpr\n' +
      '{\n' +
      '    private readonly IBoolExpr _l, _r;\n' +
      '    public Or(IBoolExpr l, IBoolExpr r) { _l = l; _r = r; }\n' +
      '    public bool Eval(Dictionary<string, object> ctx) => _l.Eval(ctx) || _r.Eval(ctx);\n' +
      '}\n\n' +
      '// VIP 且金额>100，或者是员工\n' +
      'IBoolExpr rule = new Or(\n' +
      '    new And(new HasFlag("vip"), new GreaterThan("amount", 100)),\n' +
      '    new HasFlag("staff"));\n\n' +
      'bool Check(bool vip, decimal amount, bool staff)\n' +
      '{\n' +
      '    var ctx = new Dictionary<string, object>\n' +
      '    {\n' +
      '        ["vip"] = vip, ["amount"] = amount, ["staff"] = staff\n' +
      '    };\n' +
      '    return rule.Eval(ctx);\n' +
      '}\n\n' +
      'Console.WriteLine(Check(true, 150, false));  // True\n' +
      'Console.WriteLine(Check(true, 50, false));   // False\n' +
      'Console.WriteLine(Check(false, 10, true));   // True，员工通道'
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
      'using System;\n' +
      'using System.Collections;\n' +
      'using System.Collections.Generic;\n\n' +
      'public class NumberRange : IEnumerable<int>\n' +
      '{\n' +
      '    private readonly int _from, _to, _step;\n' +
      '    public NumberRange(int from, int to, int step = 1)\n' +
      '    { _from = from; _to = to; _step = step; }\n\n' +
      '    public IEnumerator<int> GetEnumerator()\n' +
      '    {\n' +
      '        for (int i = _from; i <= _to; i += _step)\n' +
      '            yield return i;          // 编译器生成状态机\n' +
      '    }\n' +
      '    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\n' +
      '}\n\n' +
      'Console.WriteLine(string.Join(",", new NumberRange(1, 5)));       // 1,2,3,4,5\n' +
      'Console.WriteLine(string.Join(",", new NumberRange(0, 10, 2)));   // 0,2,4,6,8,10\n\n' +
      '// 手写 IEnumerator（理解 foreach 底层）\n' +
      'public class Words : IEnumerable<string>\n' +
      '{\n' +
      '    private readonly string[] _items;\n' +
      '    public Words(params string[] items) => _items = items;\n' +
      '    public IEnumerator<string> GetEnumerator() => new WordEnumerator(_items);\n' +
      '    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();\n\n' +
      '    private class WordEnumerator : IEnumerator<string>\n' +
      '    {\n' +
      '        private readonly string[] _items;\n' +
      '        private int _i = -1;\n' +
      '        public WordEnumerator(string[] items) => _items = items;\n' +
      '        public string Current => _items[_i];\n' +
      '        object IEnumerator.Current => Current;\n' +
      '        public bool MoveNext() => ++_i < _items.Length;\n' +
      '        public void Reset() => _i = -1;\n' +
      '        public void Dispose() { }\n' +
      '    }\n' +
      '}\n\n' +
      'foreach (var w in new Words("设计", "模式", "迭代器"))\n' +
      '    Console.WriteLine(w);'
    ,
    example2Title: '二叉树中序遍历：同一棵树多种遍历',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Linq;\n\n' +
      'public class Node\n' +
      '{\n' +
      '    public int Value;\n' +
      '    public Node Left, Right;\n' +
      '    public Node(int v) => Value = v;\n' +
      '}\n\n' +
      'public class BinaryTree\n' +
      '{\n' +
      '    public Node Root { get; set; }\n\n' +
      '    public IEnumerable<int> InOrder()\n' +
      '    {\n' +
      '        IEnumerable<int> Walk(Node n)\n' +
      '        {\n' +
      '            if (n is null) yield break;\n' +
      '            foreach (var x in Walk(n.Left)) yield return x;\n' +
      '            yield return n.Value;\n' +
      '            foreach (var x in Walk(n.Right)) yield return x;\n' +
      '        }\n' +
      '        return Walk(Root);\n' +
      '    }\n\n' +
      '    public IEnumerable<int> PreOrder()\n' +
      '    {\n' +
      '        IEnumerable<int> Walk(Node n)\n' +
      '        {\n' +
      '            if (n is null) yield break;\n' +
      '            yield return n.Value;\n' +
      '            foreach (var x in Walk(n.Left)) yield return x;\n' +
      '            foreach (var x in Walk(n.Right)) yield return x;\n' +
      '        }\n' +
      '        return Walk(Root);\n' +
      '    }\n' +
      '}\n\n' +
      '//       4\n' +
      '//      / \\\n' +
      '//     2   6\n' +
      '//    / \\\n' +
      '//   1   3\n' +
      'var tree = new BinaryTree\n' +
      '{\n' +
      '    Root = new Node(4)\n' +
      '    {\n' +
      '        Left = new Node(2) { Left = new Node(1), Right = new Node(3) },\n' +
      '        Right = new Node(6)\n' +
      '    }\n' +
      '};\n' +
      'Console.WriteLine("中序: " + string.Join(",", tree.InOrder()));   // 1,2,3,4,6\n' +
      'Console.WriteLine("先序: " + string.Join(",", tree.PreOrder()));  // 4,2,1,3,6\n' +
      'Console.WriteLine("偶数: " + string.Join(",", tree.InOrder().Where(x => x % 2 == 0)));'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IChatMediator\n' +
      '{\n' +
      '    void Register(User user);\n' +
      '    void Broadcast(User from, string msg);\n' +
      '    void Whisper(User from, string toName, string msg);\n' +
      '}\n\n' +
      'public class User\n' +
      '{\n' +
      '    public string Name { get; }\n' +
      '    private IChatMediator _room;\n' +
      '    public User(string name) => Name = name;\n' +
      '    internal void Join(IChatMediator room) => _room = room;\n' +
      '    public void Say(string msg) => _room.Broadcast(this, msg);\n' +
      '    public void Whisper(string to, string msg) => _room.Whisper(this, to, msg);\n' +
      '    public void Receive(string from, string msg, bool priv) =>\n' +
      '        Console.WriteLine($"{Name} 收到{(priv ? "私信" : "")} [{from}]: {msg}");\n' +
      '}\n\n' +
      'public class ChatRoom : IChatMediator\n' +
      '{\n' +
      '    private readonly List<User> _users = new();\n' +
      '    public void Register(User u)\n' +
      '    {\n' +
      '        u.Join(this);\n' +
      '        _users.Add(u);\n' +
      '        Console.WriteLine(u.Name + " 加入房间");\n' +
      '    }\n' +
      '    public void Broadcast(User from, string msg)\n' +
      '    {\n' +
      '        foreach (var u in _users)\n' +
      '            if (u != from) u.Receive(from.Name, msg, false);\n' +
      '    }\n' +
      '    public void Whisper(User from, string toName, string msg)\n' +
      '    {\n' +
      '        var to = _users.Find(u => u.Name == toName);\n' +
      '        to?.Receive(from.Name, msg, true);\n' +
      '    }\n' +
      '}\n\n' +
      'var room = new ChatRoom();\n' +
      'var a = new User("Alice");\n' +
      'var b = new User("Bob");\n' +
      'var c = new User("Carol");\n' +
      'room.Register(a); room.Register(b); room.Register(c);\n' +
      'a.Say("大家好");\n' +
      'b.Whisper("Alice", "稍后私下聊");'
    ,
    example2Title: 'UI 控件联动：改一个国家就刷新城市/邮编',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IFormMediator\n' +
      '{\n' +
      '    void Notify(object sender, string eventName);\n' +
      '}\n\n' +
      'public class CountryBox\n' +
      '{\n' +
      '    public string Value { get; private set; } = "CN";\n' +
      '    public IFormMediator Mediator { get; set; }\n' +
      '    public void Select(string code)\n' +
      '    {\n' +
      '        Value = code;\n' +
      '        Console.WriteLine("国家 = " + code);\n' +
      '        Mediator?.Notify(this, "country-changed");\n' +
      '    }\n' +
      '}\n' +
      'public class CityBox\n' +
      '{\n' +
      '    public List<string> Options { get; private set; } = new();\n' +
      '    public void Load(IEnumerable<string> cities)\n' +
      '    {\n' +
      '        Options = new List<string>(cities);\n' +
      '        Console.WriteLine("城市列表: " + string.Join(",", Options));\n' +
      '    }\n' +
      '}\n' +
      'public class ZipLabel\n' +
      '{\n' +
      '    public void ShowHint(string hint) => Console.WriteLine("邮编提示: " + hint);\n' +
      '}\n\n' +
      'public class AddressFormMediator : IFormMediator\n' +
      '{\n' +
      '    public CountryBox Country { get; init; }\n' +
      '    public CityBox City { get; init; }\n' +
      '    public ZipLabel Zip { get; init; }\n\n' +
      '    public void Notify(object sender, string eventName)\n' +
      '    {\n' +
      '        if (eventName != "country-changed") return;\n' +
      '        if (Country.Value == "CN")\n' +
      '        {\n' +
      '            City.Load(new[] { "北京", "上海", "深圳" });\n' +
      '            Zip.ShowHint("6 位数字");\n' +
      '        }\n' +
      '        else\n' +
      '        {\n' +
      '            City.Load(new[] { "New York", "Seattle" });\n' +
      '            Zip.ShowHint("ZIP+4");\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      'var country = new CountryBox();\n' +
      'var city = new CityBox();\n' +
      'var zip = new ZipLabel();\n' +
      'var m = new AddressFormMediator { Country = country, City = city, Zip = zip };\n' +
      'country.Mediator = m;\n' +
      'country.Select("CN");\n' +
      'country.Select("US");'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public class Editor\n' +
      '{\n' +
      '    public string Text { get; set; } = "";\n' +
      '    public int Cursor { get; set; }\n\n' +
      '    public IMemento Save() => new Snapshot(Text, Cursor);\n\n' +
      '    public void Restore(IMemento m)\n' +
      '    {\n' +
      '        var s = (Snapshot)m;\n' +
      '        Text = s.Text;\n' +
      '        Cursor = s.Cursor;\n' +
      '    }\n\n' +
      '    public interface IMemento { DateTime TakenAt { get; } }\n\n' +
      '    // 私有嵌套类：外部拿不到字段，只能当不透明句柄传递\n' +
      '    private class Snapshot : IMemento\n' +
      '    {\n' +
      '        public string Text { get; }\n' +
      '        public int Cursor { get; }\n' +
      '        public DateTime TakenAt { get; } = DateTime.Now;\n' +
      '        public Snapshot(string text, int cursor) { Text = text; Cursor = cursor; }\n' +
      '    }\n' +
      '}\n\n' +
      'public class History\n' +
      '{\n' +
      '    private readonly Stack<Editor.IMemento> _undo = new();\n' +
      '    private readonly Stack<Editor.IMemento> _redo = new();\n' +
      '    public void Backup(Editor e) { _undo.Push(e.Save()); _redo.Clear(); }\n' +
      '    public void Undo(Editor e)\n' +
      '    {\n' +
      '        if (_undo.Count == 0) return;\n' +
      '        _redo.Push(e.Save());\n' +
      '        e.Restore(_undo.Pop());\n' +
      '    }\n' +
      '    public void Redo(Editor e)\n' +
      '    {\n' +
      '        if (_redo.Count == 0) return;\n' +
      '        _undo.Push(e.Save());\n' +
      '        e.Restore(_redo.Pop());\n' +
      '    }\n' +
      '}\n\n' +
      'var editor = new Editor();\n' +
      'var hist = new History();\n' +
      'editor.Text = "Hello"; editor.Cursor = 5; hist.Backup(editor);\n' +
      'editor.Text = "Hello World"; editor.Cursor = 11; hist.Backup(editor);\n' +
      'editor.Text = "Hello World!!!";\n' +
      'hist.Undo(editor);\n' +
      'Console.WriteLine(editor.Text);   // Hello World\n' +
      'hist.Undo(editor);\n' +
      'Console.WriteLine(editor.Text);   // Hello\n' +
      'hist.Redo(editor);\n' +
      'Console.WriteLine(editor.Text);   // Hello World'
    ,
    example2Title: '游戏存档：位置、血量、背包一起回滚',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public class Player\n' +
      '{\n' +
      '    public string Map { get; set; } = "新手村";\n' +
      '    public int Hp { get; set; } = 100;\n' +
      '    public List<string> Bag { get; } = new() { "木剑" };\n\n' +
      '    public record SaveData(string Map, int Hp, List<string> Bag);\n\n' +
      '    public SaveData Save() => new(Map, Hp, new List<string>(Bag)); // 深拷贝背包\n\n' +
      '    public void Load(SaveData s)\n' +
      '    {\n' +
      '        Map = s.Map;\n' +
      '        Hp = s.Hp;\n' +
      '        Bag.Clear();\n' +
      '        Bag.AddRange(s.Bag);\n' +
      '    }\n\n' +
      '    public override string ToString() =>\n' +
      '        $"{Map} HP={Hp} 背包[{string.Join(",", Bag)}]";\n' +
      '}\n\n' +
      'var p = new Player();\n' +
      'var slot = p.Save();                 // 存档点\n' +
      'p.Map = "Boss 房"; p.Hp = 12; p.Bag.Add("红药");\n' +
      'Console.WriteLine("战后: " + p);\n' +
      'p.Load(slot);\n' +
      'Console.WriteLine("读档: " + p);     // 回到新手村，背包无红药'
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
      'using System;\n\n' +
      'public class PriceChangedEventArgs : EventArgs\n' +
      '{\n' +
      '    public string Symbol { get; init; }\n' +
      '    public decimal Price { get; init; }\n' +
      '}\n\n' +
      'public class StockTicker\n' +
      '{\n' +
      '    public event EventHandler<PriceChangedEventArgs> PriceChanged;\n' +
      '    private decimal _price;\n' +
      '    public string Symbol { get; }\n' +
      '    public StockTicker(string symbol) => Symbol = symbol;\n\n' +
      '    public decimal Price\n' +
      '    {\n' +
      '        get => _price;\n' +
      '        set\n' +
      '        {\n' +
      '            _price = value;\n' +
      '            PriceChanged?.Invoke(this, new PriceChangedEventArgs\n' +
      '            {\n' +
      '                Symbol = Symbol, Price = value\n' +
      '            });\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      'public class Dashboard\n' +
      '{\n' +
      '    public void OnPrice(object sender, PriceChangedEventArgs e) =>\n' +
      '        Console.WriteLine($"看板 {e.Symbol} = {e.Price}");\n' +
      '}\n' +
      'public class RiskAlert\n' +
      '{\n' +
      '    public void OnPrice(object sender, PriceChangedEventArgs e)\n' +
      '    {\n' +
      '        if (e.Price > 200) Console.WriteLine("风控: 价格过高 " + e.Price);\n' +
      '    }\n' +
      '}\n\n' +
      'var ticker = new StockTicker("MSFT");\n' +
      'var board = new Dashboard();\n' +
      'var risk = new RiskAlert();\n' +
      'ticker.PriceChanged += board.OnPrice;\n' +
      'ticker.PriceChanged += risk.OnPrice;\n\n' +
      'ticker.Price = 150;\n' +
      'ticker.Price = 210;\n\n' +
      'ticker.PriceChanged -= risk.OnPrice;   // 退订，避免泄漏\n' +
      'ticker.Price = 220;                    // 只有看板还在收'
    ,
    example2Title: '手写 Observer 接口 + 气象站多订阅者',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IWeatherObserver\n' +
      '{\n' +
      '    void Update(Weather data);\n' +
      '}\n' +
      'public interface IWeatherSubject\n' +
      '{\n' +
      '    void Attach(IWeatherObserver o);\n' +
      '    void Detach(IWeatherObserver o);\n' +
      '    void Notify();\n' +
      '}\n\n' +
      'public readonly record struct Weather(float Temp, float Humidity);\n\n' +
      'public class WeatherStation : IWeatherSubject\n' +
      '{\n' +
      '    private readonly List<IWeatherObserver> _obs = new();\n' +
      '    public Weather Current { get; private set; }\n' +
      '    public void Attach(IWeatherObserver o) => _obs.Add(o);\n' +
      '    public void Detach(IWeatherObserver o) => _obs.Remove(o);\n' +
      '    public void Notify() { foreach (var o in _obs.ToArray()) o.Update(Current); }\n' +
      '    public void Set(float t, float h) { Current = new Weather(t, h); Notify(); }\n' +
      '}\n\n' +
      'public class PhoneApp : IWeatherObserver\n' +
      '{\n' +
      '    public void Update(Weather w) => Console.WriteLine($"App {w.Temp}°C {w.Humidity}%");\n' +
      '}\n' +
      'public class Billboard : IWeatherObserver\n' +
      '{\n' +
      '    public void Update(Weather w) => Console.WriteLine($"大屏 温度 {w.Temp:0.0}");\n' +
      '}\n\n' +
      'var station = new WeatherStation();\n' +
      'var app = new PhoneApp();\n' +
      'station.Attach(app);\n' +
      'station.Attach(new Billboard());\n' +
      'station.Set(26.5f, 60);\n' +
      'station.Detach(app);\n' +
      'station.Set(30f, 40);    // App 不再收到'
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
      'using System;\n\n' +
      'public interface IPlayerState\n' +
      '{\n' +
      '    void Play(Player p);\n' +
      '    void Pause(Player p);\n' +
      '    void Stop(Player p);\n' +
      '}\n\n' +
      'public class Player\n' +
      '{\n' +
      '    public IPlayerState State { get; set; }\n' +
      '    public Player() => State = new Stopped();\n' +
      '    public void Play() => State.Play(this);\n' +
      '    public void Pause() => State.Pause(this);\n' +
      '    public void Stop() => State.Stop(this);\n' +
      '}\n\n' +
      'public class Stopped : IPlayerState\n' +
      '{\n' +
      '    public void Play(Player p) { Console.WriteLine("开始播放"); p.State = new Playing(); }\n' +
      '    public void Pause(Player p) => Console.WriteLine("已停止，无法暂停");\n' +
      '    public void Stop(Player p) => Console.WriteLine("已经是停止");\n' +
      '}\n' +
      'public class Playing : IPlayerState\n' +
      '{\n' +
      '    public void Play(Player p) => Console.WriteLine("已在播放");\n' +
      '    public void Pause(Player p) { Console.WriteLine("暂停"); p.State = new Paused(); }\n' +
      '    public void Stop(Player p) { Console.WriteLine("停止"); p.State = new Stopped(); }\n' +
      '}\n' +
      'public class Paused : IPlayerState\n' +
      '{\n' +
      '    public void Play(Player p) { Console.WriteLine("继续播放"); p.State = new Playing(); }\n' +
      '    public void Pause(Player p) => Console.WriteLine("已经暂停");\n' +
      '    public void Stop(Player p) { Console.WriteLine("停止"); p.State = new Stopped(); }\n' +
      '}\n\n' +
      'var player = new Player();\n' +
      'player.Play();\n' +
      'player.Play();\n' +
      'player.Pause();\n' +
      'player.Pause();\n' +
      'player.Play();\n' +
      'player.Stop();'
    ,
    example2Title: '订单状态机：创建 → 支付 → 发货 / 取消',
    example2:
      'using System;\n\n' +
      'public class Order\n' +
      '{\n' +
      '    public string Id { get; }\n' +
      '    public IOrderState State { get; set; }\n' +
      '    public Order(string id) { Id = id; State = new Created(); }\n' +
      '    public void Pay() => State.Pay(this);\n' +
      '    public void Ship() => State.Ship(this);\n' +
      '    public void Cancel() => State.Cancel(this);\n' +
      '}\n\n' +
      'public interface IOrderState\n' +
      '{\n' +
      '    void Pay(Order o); void Ship(Order o); void Cancel(Order o);\n' +
      '}\n\n' +
      'public class Created : IOrderState\n' +
      '{\n' +
      '    public void Pay(Order o) { Console.WriteLine($"{o.Id} 已支付"); o.State = new Paid(); }\n' +
      '    public void Ship(Order o) => Console.WriteLine("未支付不能发货");\n' +
      '    public void Cancel(Order o) { Console.WriteLine($"{o.Id} 已取消"); o.State = new Cancelled(); }\n' +
      '}\n' +
      'public class Paid : IOrderState\n' +
      '{\n' +
      '    public void Pay(Order o) => Console.WriteLine("重复支付忽略");\n' +
      '    public void Ship(Order o) { Console.WriteLine($"{o.Id} 已发货"); o.State = new Shipped(); }\n' +
      '    public void Cancel(Order o) { Console.WriteLine($"{o.Id} 退款并取消"); o.State = new Cancelled(); }\n' +
      '}\n' +
      'public class Shipped : IOrderState\n' +
      '{\n' +
      '    public void Pay(Order o) { }\n' +
      '    public void Ship(Order o) => Console.WriteLine("已在途");\n' +
      '    public void Cancel(Order o) => Console.WriteLine("已发货不可取消");\n' +
      '}\n' +
      'public class Cancelled : IOrderState\n' +
      '{\n' +
      '    public void Pay(Order o) => Console.WriteLine("已取消");\n' +
      '    public void Ship(Order o) => Console.WriteLine("已取消");\n' +
      '    public void Cancel(Order o) => Console.WriteLine("已取消");\n' +
      '}\n\n' +
      'var a = new Order("A-1"); a.Ship(); a.Pay(); a.Ship(); a.Cancel();\n' +
      'var b = new Order("B-2"); b.Cancel(); b.Pay();'
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
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Linq;\n\n' +
      'public sealed record CartItem(string Sku, decimal Price, int Qty);\n\n' +
      'public interface IPricingStrategy\n' +
      '{\n' +
      '    string Name { get; }\n' +
      '    decimal Quote(IReadOnlyList<CartItem> items);\n' +
      '}\n\n' +
      'public class NoDiscount : IPricingStrategy\n' +
      '{\n' +
      '    public string Name => "原价";\n' +
      '    public decimal Quote(IReadOnlyList<CartItem> items) => items.Sum(i => i.Price * i.Qty);\n' +
      '}\n' +
      'public class PercentOff : IPricingStrategy\n' +
      '{\n' +
      '    private readonly decimal _off;\n' +
      '    public PercentOff(decimal off) => _off = off;\n' +
      '    public string Name => $"{_off:P0} 折扣";\n' +
      '    public decimal Quote(IReadOnlyList<CartItem> items) =>\n' +
      '        items.Sum(i => i.Price * i.Qty) * (1 - _off);\n' +
      '}\n' +
      'public class BuyTwoGetOne : IPricingStrategy\n' +
      '{\n' +
      '    public string Name => "满三免一";\n' +
      '    public decimal Quote(IReadOnlyList<CartItem> items)\n' +
      '    {\n' +
      '        decimal total = 0;\n' +
      '        foreach (var i in items)\n' +
      '        {\n' +
      '            var free = i.Qty / 3;\n' +
      '            total += i.Price * (i.Qty - free);\n' +
      '        }\n' +
      '        return total;\n' +
      '    }\n' +
      '}\n\n' +
      'public class Checkout\n' +
      '{\n' +
      '    public IPricingStrategy Strategy { get; set; }\n' +
      '    public Checkout(IPricingStrategy s) => Strategy = s;\n' +
      '    public void Print(IReadOnlyList<CartItem> items)\n' +
      '    {\n' +
      '        var pay = Strategy.Quote(items);\n' +
      '        Console.WriteLine($"{Strategy.Name}: ¥{pay:0.00}");\n' +
      '    }\n' +
      '}\n\n' +
      'var items = new List<CartItem>\n' +
      '{\n' +
      '    new("书", 40, 3),\n' +
      '    new("笔", 10, 1)\n' +
      '};\n' +
      'var co = new Checkout(new NoDiscount());\n' +
      'co.Print(items);\n' +
      'co.Strategy = new PercentOff(0.1m);\n' +
      'co.Print(items);\n' +
      'co.Strategy = new BuyTwoGetOne();\n' +
      'co.Print(items);'
    ,
    example2Title: '委托当策略：支付通道与排序比较器',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public delegate bool PayFunc(decimal amount);\n\n' +
      'bool PayByAlipay(decimal n) { Console.WriteLine($"支付宝 {n}"); return true; }\n' +
      'bool PayByWechat(decimal n) { Console.WriteLine($"微信 {n}"); return true; }\n' +
      'bool PayByCard(decimal n)\n' +
      '{\n' +
      '    if (n > 5000) { Console.WriteLine("银行卡限额"); return false; }\n' +
      '    Console.WriteLine($"银行卡 {n}");\n' +
      '    return true;\n' +
      '}\n\n' +
      'void Checkout(decimal amount, PayFunc strategy)\n' +
      '{\n' +
      '    Console.WriteLine(strategy(amount) ? "成功" : "失败");\n' +
      '}\n\n' +
      'Checkout(99, PayByAlipay);\n' +
      'Checkout(99, PayByWechat);\n' +
      'Checkout(9000, PayByCard);\n' +
      'Checkout(99, n => { Console.WriteLine("模拟支付"); return n > 0; });\n\n' +
      '// IComparer / Comparison 也是策略\n' +
      'var names = new List<string> { "zeta", "Alpha", "beta" };\n' +
      'names.Sort((a, b) => string.Compare(a, b, StringComparison.OrdinalIgnoreCase));\n' +
      'Console.WriteLine(string.Join(",", names));\n\n' +
      'names.Sort((a, b) => b.Length.CompareTo(a.Length)); // 按长度降序\n' +
      'Console.WriteLine(string.Join(",", names));'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public abstract class DataMiner\n' +
      '{\n' +
      '    // 算法骨架：子类不能改流程\n' +
      '    public sealed void Mine(string path)\n' +
      '    {\n' +
      '        var raw = Open(path);\n' +
      '        var rows = Extract(raw);\n' +
      '        if (ShouldTransform()) rows = Transform(rows);\n' +
      '        Analyze(rows);\n' +
      '        HookAfter();\n' +
      '    }\n\n' +
      '    protected abstract string Open(string path);\n' +
      '    protected abstract List<string> Extract(string raw);\n' +
      '    protected virtual bool ShouldTransform() => true;          // 钩子\n' +
      '    protected virtual List<string> Transform(List<string> rows) => rows;\n' +
      '    protected abstract void Analyze(List<string> rows);\n' +
      '    protected virtual void HookAfter() { }                     // 可选收尾\n' +
      '}\n\n' +
      'public class CsvMiner : DataMiner\n' +
      '{\n' +
      '    protected override string Open(string path)\n' +
      '    {\n' +
      '        Console.WriteLine("打开 CSV " + path);\n' +
      '        return "name,age\\nAda,36\\nBob,22";\n' +
      '    }\n' +
      '    protected override List<string> Extract(string raw) =>\n' +
      '        new List<string>(raw.Split(\'\\n\'));\n' +
      '    protected override List<string> Transform(List<string> rows)\n' +
      '    {\n' +
      '        rows.RemoveAt(0); // 去掉表头\n' +
      '        return rows;\n' +
      '    }\n' +
      '    protected override void Analyze(List<string> rows) =>\n' +
      '        Console.WriteLine($"CSV 共 {rows.Count} 行");\n' +
      '}\n\n' +
      'public class JsonMiner : DataMiner\n' +
      '{\n' +
      '    protected override string Open(string path)\n' +
      '    {\n' +
      '        Console.WriteLine("打开 JSON " + path);\n' +
      '        return "[1,2,3]";\n' +
      '    }\n' +
      '    protected override List<string> Extract(string raw) =>\n' +
      '        new List<string> { "1", "2", "3" };\n' +
      '    protected override bool ShouldTransform() => false; // 跳过转换\n' +
      '    protected override void Analyze(List<string> rows) =>\n' +
      '        Console.WriteLine("JSON 元素: " + string.Join(",", rows));\n' +
      '    protected override void HookAfter() => Console.WriteLine("写审计日志");\n' +
      '}\n\n' +
      'new CsvMiner().Mine("users.csv");\n' +
      'new JsonMiner().Mine("data.json");'
    ,
    example2Title: '饮料冲泡流程：烧水固定，浸泡由子类决定',
    example2:
      'using System;\n\n' +
      'public abstract class CaffeineBeverage\n' +
      '{\n' +
      '    public sealed void Prepare()\n' +
      '    {\n' +
      '        Boil();\n' +
      '        Brew();\n' +
      '        Pour();\n' +
      '        if (CustomerWantsCondiments()) AddCondiments();\n' +
      '    }\n' +
      '    private void Boil() => Console.WriteLine("烧开水");\n' +
      '    private void Pour() => Console.WriteLine("倒入杯中");\n' +
      '    protected abstract void Brew();\n' +
      '    protected abstract void AddCondiments();\n' +
      '    protected virtual bool CustomerWantsCondiments() => true;\n' +
      '}\n\n' +
      'public class Tea : CaffeineBeverage\n' +
      '{\n' +
      '    protected override void Brew() => Console.WriteLine("浸泡茶叶");\n' +
      '    protected override void AddCondiments() => Console.WriteLine("加柠檬");\n' +
      '}\n' +
      'public class Coffee : CaffeineBeverage\n' +
      '{\n' +
      '    private readonly bool _sugar;\n' +
      '    public Coffee(bool sugar) => _sugar = sugar;\n' +
      '    protected override void Brew() => Console.WriteLine("冲泡咖啡粉");\n' +
      '    protected override void AddCondiments() => Console.WriteLine("加糖加奶");\n' +
      '    protected override bool CustomerWantsCondiments() => _sugar;\n' +
      '}\n\n' +
      'new Tea().Prepare();\n' +
      'Console.WriteLine("---");\n' +
      'new Coffee(sugar: false).Prepare();  // 不加调料'
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
      'using System;\n' +
      'using System.Collections.Generic;\n\n' +
      'public interface IShapeVisitor\n' +
      '{\n' +
      '    void Visit(Circle c);\n' +
      '    void Visit(Rectangle r);\n' +
      '    void Visit(Group g);\n' +
      '}\n\n' +
      'public interface IShape\n' +
      '{\n' +
      '    void Accept(IShapeVisitor v);\n' +
      '}\n\n' +
      'public class Circle : IShape\n' +
      '{\n' +
      '    public double R { get; }\n' +
      '    public Circle(double r) => R = r;\n' +
      '    public void Accept(IShapeVisitor v) => v.Visit(this);\n' +
      '}\n' +
      'public class Rectangle : IShape\n' +
      '{\n' +
      '    public double W { get; }\n' +
      '    public double H { get; }\n' +
      '    public Rectangle(double w, double h) { W = w; H = h; }\n' +
      '    public void Accept(IShapeVisitor v) => v.Visit(this);\n' +
      '}\n' +
      'public class Group : IShape\n' +
      '{\n' +
      '    public List<IShape> Children { get; } = new();\n' +
      '    public void Accept(IShapeVisitor v) => v.Visit(this);\n' +
      '}\n\n' +
      'public class AreaVisitor : IShapeVisitor\n' +
      '{\n' +
      '    public double Total { get; private set; }\n' +
      '    public void Visit(Circle c) => Total += Math.PI * c.R * c.R;\n' +
      '    public void Visit(Rectangle r) => Total += r.W * r.H;\n' +
      '    public void Visit(Group g) { foreach (var c in g.Children) c.Accept(this); }\n' +
      '}\n\n' +
      'public class XmlExportVisitor : IShapeVisitor\n' +
      '{\n' +
      '    public void Visit(Circle c) => Console.WriteLine($"<circle r=\\"{c.R}\\"/>");\n' +
      '    public void Visit(Rectangle r) => Console.WriteLine($"<rect w=\\"{r.W}\\" h=\\"{r.H}\\"/>");\n' +
      '    public void Visit(Group g)\n' +
      '    {\n' +
      '        Console.WriteLine("<g>");\n' +
      '        foreach (var c in g.Children) c.Accept(this);\n' +
      '        Console.WriteLine("</g>");\n' +
      '    }\n' +
      '}\n\n' +
      'var root = new Group();\n' +
      'root.Children.Add(new Circle(2));\n' +
      'root.Children.Add(new Rectangle(3, 4));\n' +
      'root.Children.Add(new Circle(1));\n\n' +
      'var area = new AreaVisitor();\n' +
      'root.Accept(area);\n' +
      'Console.WriteLine($"面积 ≈ {area.Total:0.00}");\n' +
      'root.Accept(new XmlExportVisitor());'
    ,
    example2Title: '文档节点：同一棵树做字数统计与 Markdown 导出',
    example2:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using System.Text;\n\n' +
      'public interface IDocVisitor\n' +
      '{\n' +
      '    void Visit(Paragraph p);\n' +
      '    void Visit(Heading h);\n' +
      '    void Visit(Doc d);\n' +
      '}\n' +
      'public interface IDocNode { void Accept(IDocVisitor v); }\n\n' +
      'public class Paragraph : IDocNode\n' +
      '{\n' +
      '    public string Text { get; }\n' +
      '    public Paragraph(string t) => Text = t;\n' +
      '    public void Accept(IDocVisitor v) => v.Visit(this);\n' +
      '}\n' +
      'public class Heading : IDocNode\n' +
      '{\n' +
      '    public int Level { get; }\n' +
      '    public string Text { get; }\n' +
      '    public Heading(int level, string t) { Level = level; Text = t; }\n' +
      '    public void Accept(IDocVisitor v) => v.Visit(this);\n' +
      '}\n' +
      'public class Doc : IDocNode\n' +
      '{\n' +
      '    public List<IDocNode> Children { get; } = new();\n' +
      '    public void Accept(IDocVisitor v) => v.Visit(this);\n' +
      '}\n\n' +
      'public class WordCountVisitor : IDocVisitor\n' +
      '{\n' +
      '    public int Words { get; private set; }\n' +
      '    public void Visit(Paragraph p) => Words += p.Text.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n' +
      '    public void Visit(Heading h) => Words += h.Text.Split(\' \', StringSplitOptions.RemoveEmptyEntries).Length;\n' +
      '    public void Visit(Doc d) { foreach (var c in d.Children) c.Accept(this); }\n' +
      '}\n' +
      'public class MarkdownVisitor : IDocVisitor\n' +
      '{\n' +
      '    private readonly StringBuilder _sb = new();\n' +
      '    public override string ToString() => _sb.ToString();\n' +
      '    public void Visit(Paragraph p) => _sb.AppendLine(p.Text).AppendLine();\n' +
      '    public void Visit(Heading h) => _sb.AppendLine(new string(\'#\', h.Level) + " " + h.Text);\n' +
      '    public void Visit(Doc d) { foreach (var c in d.Children) c.Accept(this); }\n' +
      '}\n\n' +
      'var doc = new Doc();\n' +
      'doc.Children.Add(new Heading(1, "设计模式"));\n' +
      'doc.Children.Add(new Paragraph("Visitor 把操作从结构中分离"));\n' +
      'doc.Children.Add(new Heading(2, "优点"));\n' +
      'doc.Children.Add(new Paragraph("新增操作不必改元素类"));\n\n' +
      'var wc = new WordCountVisitor();\n' +
      'doc.Accept(wc);\n' +
      'Console.WriteLine("词数: " + wc.Words);\n' +
      'var md = new MarkdownVisitor();\n' +
      'doc.Accept(md);\n' +
      'Console.WriteLine(md);'
  }
];
