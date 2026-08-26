// Python 语法详解 —— 进阶与现代特性（共 16 种）
module.exports = [
  {
    id: 'py-modules',
    title: '模块与包',
    category: '进阶特性',
    version: '进阶',
    level: '入门',
    summary: '用 import 组织代码，模块是单文件，包是带 __init__.py 的目录。',
    detail: [
      '每个 .py 文件是一个模块，import 会执行模块顶层代码并创建模块对象。',
      'from x import y 只导入名字；import x as alias 可重命名避免冲突。',
      '相对导入（from . import sibling）只在包内部生效；__name__ == "__main__" 用于区分被导入与直接运行。'
    ],
    example:
      '# math_demo.py\n' +
      'import math\n' +
      'from datetime import date as d\n\n' +
      'print(math.sqrt(16))     # 4.0\n' +
      'print(d.today())\n\n' +
      'if __name__ == "__main__":\n' +
      '    print("直接运行")'
  },
  {
    id: 'py-args-kwargs',
    title: '*args 与 **kwargs',
    category: '进阶特性',
    version: '进阶',
    level: '进阶',
    summary: '用 * 收集位置参数为元组，** 收集关键字参数为字典，实现灵活签名。',
    detail: [
      '*args 把多余的位置参数打包成元组；**kwargs 把关键字参数打包成字典。',
      '定义时顺序必须是：位置参数、*args、仅关键字参数、**kwargs。',
      '调用时 *iter 与 **dict 可反向把序列/字典展开传入，常用于包装与转发。'
    ],
    example:
      'def show(name, *args, suffix="!", **kwargs):\n' +
      '    print(name, args, suffix, kwargs)\n\n' +
      'show("x", 1, 2, 3, suffix="?", age=20)\n' +
      '# x (1, 2, 3) ? {"age": 20}\n\n' +
      'def add(a, b):\n' +
      '    return a + b\n' +
      'data = {"a": 2, "b": 3}\n' +
      'print(add(**data))       # 5'
  },
  {
    id: 'py-asyncio',
    title: '异步 asyncio',
    category: '进阶特性',
    version: '3.5+',
    level: '高级',
    summary: '用 async/await 编写协程，在单线程内并发处理大量 IO 任务。',
    detail: [
      'async def 定义协程，await 挂起等待可等待对象（协程、Task、Future）。',
      'asyncio.run 启动事件循环；asyncio.gather 并发运行多个协程。',
      '异步适合 IO 密集型（网络、文件），CPU 密集任务仍应用进程池。'
    ],
    notes: [
      'await 只能在 async 函数内使用；混用阻塞调用会卡住整个事件循环。'
    ],
    example:
      'import asyncio\n\n' +
      'async def fetch(n):\n' +
      '    await asyncio.sleep(0.1)\n' +
      '    return f"任务{n}完成"\n\n' +
      'async def main():\n' +
      '    results = await asyncio.gather(fetch(1), fetch(2), fetch(3))\n' +
      '    print(results)\n\n' +
      'asyncio.run(main())'
  },
  {
    id: 'py-concurrency',
    title: '并发编程',
    category: '进阶特性',
    version: '进阶',
    level: '高级',
    summary: 'threading 适合 IO 并发，multiprocessing 绕过 GIL 做 CPU 并行。',
    detail: [
      '由于 GIL，多线程在 CPU 密集任务上无法真正并行；IO 等待时仍可并发。',
      'multiprocessing 用多进程绕过 GIL，适合计算密集；concurrent.futures 提供简洁的线程/进程池。',
      '进程间通信可用 Queue、Pipe 或共享内存；注意序列化开销。'
    ],
    example:
      'from concurrent.futures import ThreadPoolExecutor\n\n' +
      'def task(n):\n' +
      '    return n * n\n\n' +
      'with ThreadPoolExecutor(max_workers=3) as ex:\n' +
      '    results = list(ex.map(task, [1, 2, 3, 4]))\n' +
      'print(results)          # [1, 4, 9, 16]'
  },
  {
    id: 'py-stdlib',
    title: '常用标准库',
    category: '进阶特性',
    version: '基础',
    level: '入门',
    summary: 'pathlib、datetime、json、os、collections 等标准库覆盖日常需求。',
    detail: [
      'pathlib.Path 提供面向对象的文件路径操作，比 os.path 更直观。',
      'json 模块做 JSON 序列化/反序列化；datetime 处理日期时间与时区。',
      'collections 提供 defaultdict、Counter、deque 等实用容器。'
    ],
    example:
      'from pathlib import Path\n' +
      'from collections import Counter\n' +
      'import json\n\n' +
      'p = Path("data") / "a.txt"\n' +
      'print(p.suffix)\n\n' +
      'c = Counter("abracadabra")\n' +
      'print(c.most_common(2))     # [("a", 5), ("b", 2)]\n\n' +
      'print(json.dumps({"x": 1})) # {"x": 1}'
  },
  {
    id: 'py-re',
    title: '正则表达式',
    category: '进阶特性',
    version: '基础',
    level: '进阶',
    summary: 're 模块用模式匹配文本，支持查找、替换与分组捕获。',
    detail: [
      '用 r"..." 原始字符串写正则，避免反斜杠被转义；\\d 匹配数字、\\w 匹配单词字符。',
      're.search 返回首个匹配、re.findall 返回所有匹配、re.sub 做替换。',
      '用括号 () 分组，match.group(n) 可提取子串；编译复用用 re.compile。'
    ],
    example:
      'import re\n' +
      'text = "订单号 12345 金额 678"\n' +
      'nums = re.findall(r"\\d+", text)\n' +
      'print(nums)                  # ["12345", "678"]\n\n' +
      'm = re.search(r"金额 (\\d+)", text)\n' +
      'print(m.group(1))            # 678\n\n' +
      'print(re.sub(r"\\d+", "#", text))'
  },
  {
    id: 'py-functional',
    title: '函数式工具',
    category: '进阶特性',
    version: '基础',
    level: '进阶',
    summary: 'map / filter / reduce 与 functools 提供声明式数据处理。',
    detail: [
      'map 把函数映射到每个元素，filter 按条件筛选，二者返回惰性迭代器。',
      'functools.reduce 对序列做累积；functools.partial 固定部分参数生成新函数。',
      'itertools 提供 chain、groupby、permutations 等高效迭代器。'
    ],
    notes: [
      '简单的 map/filter 往往能被列表推导式取代，可读性更好。'
    ],
    example:
      'from functools import reduce, partial\n\n' +
      'nums = [1, 2, 3, 4]\n' +
      's = reduce(lambda a, b: a + b, nums)\n' +
      'print(s)                       # 10\n\n' +
      'add = lambda a, b: a + b\n' +
      'add5 = partial(add, 5)\n' +
      'print(add5(3))                 # 8'
  },
  {
    id: 'py-fileio',
    title: '文件读写',
    category: '进阶特性',
    version: '基础',
    level: '入门',
    summary: '用 open 配合 with 读写文本/二进制，注意编码与逐行处理。',
    detail: [
      'open(path, mode, encoding) 打开文件；模式 "r"/"w"/"a"，加 "b" 表示二进制。',
      '始终用 with 管理文件，确保异常时也关闭；逐行迭代内存友好。',
      '文本文件建议显式指定 encoding="utf-8"，避免平台默认编码差异。'
    ],
    example:
      'with open("out.txt", "w", encoding="utf-8") as f:\n' +
      '    f.write("第一行\\n")\n' +
      '    f.write("第二行\\n")\n\n' +
      'with open("out.txt", "r", encoding="utf-8") as f:\n' +
      '    for line in f:\n' +
      '        print(line.rstrip())'
  },
  {
    id: 'py-slicing',
    title: '切片与序列操作',
    category: '进阶特性',
    version: '基础',
    level: '入门',
    summary: '用 [start:stop:step] 截取序列，负索引与步长非常灵活。',
    detail: [
      '切片语法 [start:stop:step]，省略 start/stop 表示从头/到尾；负数表示从末尾计数。',
      'step 为负可实现反转；切片返回新对象，不修改原序列。',
      '字符串、列表、元组都支持切片；还可用 slice 对象复用同一切片逻辑。'
    ],
    example:
      's = "hello world"\n' +
      'print(s[0:5])          # hello\n' +
      'print(s[::-1])         # dlrow olleh\n' +
      'print(s[-5:])          # world\n' +
      'nums = [0, 1, 2, 3, 4, 5]\n' +
      'print(nums[::2])       # [0, 2, 4]'
  },
  {
    id: 'py-enum',
    title: '枚举 Enum',
    category: '进阶特性',
    version: '3.4+',
    level: '入门',
    summary: '用 enum 定义有名字的常量集合，提升可读性并防止非法值。',
    detail: [
      'Enum 子类把一组相关常量组织成可迭代、可比较的枚举。',
      '可用 auto() 自动赋值；成员通过 Color.RED 访问，比较用 is / ==。',
      '适合替代散落的字符串或整数魔法值。'
    ],
    example:
      'from enum import Enum, auto\n\n' +
      'class Color(Enum):\n' +
      '    RED = auto()\n' +
      '    GREEN = auto()\n' +
      '    BLUE = auto()\n\n' +
      'c = Color.RED\n' +
      'print(c.name, c.value)     # RED 1\n' +
      'print(c is Color.RED)      # True'
  },
  {
    id: 'py-descriptors',
    title: '描述符',
    category: '进阶特性',
    version: '进阶',
    level: '高级',
    summary: '通过 __get__/__set__ 控制属性访问，是 property 的底层机制。',
    detail: [
      '描述符是实现了 __get__/__set__/__delete__ 中至少一个的对象，用于托管另一个类的属性。',
      '@property 本质上就是用描述符实现的 getter；描述符适合做校验、懒加载、类型约束。',
      '数据描述符（有 __set__）优先于实例字典；非数据描述符次之。'
    ],
    example:
      'class Validated:\n' +
      '    def __init__(self, minv):\n' +
      '        self.minv = minv\n' +
      '    def __set_name__(self, owner, name):\n' +
      '        self.name = name\n' +
      '    def __get__(self, obj, owner):\n' +
      '        return obj.__dict__.get(self.name)\n' +
      '    def __set__(self, obj, value):\n' +
      '        if value < self.minv:\n' +
      '            raise ValueError("太小")\n' +
      '        obj.__dict__[self.name] = value\n\n' +
      'class Account:\n' +
      '    balance = Validated(0)\n\n' +
      'a = Account()\n' +
      'a.balance = 100'
  },
  {
    id: 'py-metaclass',
    title: '元类 metaclass',
    category: '进阶特性',
    version: '进阶',
    level: '高级',
    summary: '元类是"创建类的类"，可在类定义时定制类的生成过程。',
    detail: [
      '类也是对象，由元类（默认 type）创建；自定义元类通过 __new__/__init__ 拦截类构造。',
      '典型用途：自动注册子类、校验接口、ORM 模型定义。',
      '绝大多数项目不需要元类；能用装饰器/基类解决的问题优先用它们。'
    ],
    example:
      'class Registry(type):\n' +
      '    _items = {}\n' +
      '    def __new__(mcs, name, bases, ns):\n' +
      '        cls = super().__new__(mcs, name, bases, ns)\n' +
      '        Registry._items[name] = cls\n' +
      '        return cls\n\n' +
      'class Plugin(metaclass=Registry):\n' +
      '    pass\n\n' +
      'class A(Plugin):\n' +
      '    pass\n\n' +
      'print(list(Registry._items))   # ["Plugin", "A"]'
  },
  {
    id: 'py-match',
    title: '结构化模式匹配',
    category: '现代特性',
    version: '3.10+',
    level: '进阶',
    summary: 'match / case 提供强大的模式匹配，可解构序列、映射与对象。',
    detail: [
      'match 依次尝试 case 模式，第一个匹配的分支被执行；_ 是通配符。',
      '可匹配字面量、类型（case int(x)）、序列（case [a, b]）、字典、并用 if 守卫加条件。',
      '模式匹配让处理多种数据结构（如 AST、消息协议）的代码更清晰。'
    ],
    example:
      'def handle(msg):\n' +
      '    match msg:\n' +
      '        case {"type": "join", "user": u}:\n' +
      '            return f"{u} 加入"\n' +
      '        case {"type": "msg", "text": t}:\n' +
      '            return f"消息: {t}"\n' +
      '        case [x, y]:\n' +
      '            return f"坐标 {x},{y}"\n' +
      '        case _:\n' +
      '            return "未知"\n\n' +
      'print(handle({"type": "join", "user": "Tom"}))'
  },
  {
    id: 'py-walrus',
    title: '海象运算符 :=',
    category: '现代特性',
    version: '3.8+',
    level: '进阶',
    summary: '在表达式内部赋值（命名表达式），避免重复计算或冗余代码。',
    detail: [
      ':= 把赋值嵌入表达式，并把结果绑定到变量，常用于 while、if、推导式。',
      '典型场景：读取流时既判断又保存长度，或推导式中避免重复调用。',
      '不要过度使用，以免降低可读性。'
    ],
    example:
      'import re\n' +
      'data = ["abc123", "xyz", "hello99"]\n' +
      'results = [m.group(0) for s in data if (m := re.search(r"\\d+", s))]\n' +
      'print(results)              # ["123", "99"]\n\n' +
      'while (line := input("> ")) != "q":\n' +
      '    print("你输入了", line)'
  },
  {
    id: 'py-pep604',
    title: '类型联合 X | Y',
    category: '现代特性',
    version: '3.10+',
    level: '进阶',
    summary: '用 X | Y 表达"或"类型，取代冗长的 Union[...]。',
    detail: [
      '3.10 起可写 int | str 代替 typing.Union[int, str]，更简洁。',
      'None 联合写成 X | None，等价于 Optional[X]。',
      '还可用于 isinstance(x, int | str) 一次判断多个类型。'
    ],
    example:
      'def f(x: int | str) -> int | None:\n' +
      '    if isinstance(x, int):\n' +
      '        return x * 2\n' +
      '    if isinstance(x, str):\n' +
      '        return len(x)\n' +
      '    return None\n\n' +
      'print(f(3))        # 6\n' +
      'print(f("ab"))     # 2\n' +
      'print(isinstance(5, int | str))   # True'
  },
  {
    id: 'py-fstring-debug',
    title: 'f-string 调试',
    category: '现代特性',
    version: '3.8+',
    level: '入门',
    summary: 'f"{expr=}" 自动输出"表达式=值"，极大方便调试。',
    detail: [
      '在 f-string 的占位符后加 =，会同时打印表达式文本与其求值结果。',
      '可配合格式说明符，如 f"{x=:.2f}" 控制小数位数。',
      '是快速打印调试信息的利器，无需手写 "x=" + str(x)。'
    ],
    example:
      'x = 10\n' +
      'y = 3.14159\n' +
      'print(f"{x=}")            # x=10\n' +
      'print(f"{x + 1=}")        # x + 1=11\n' +
      'print(f"{y=:.2f}")        # y=3.14'
  }
];
