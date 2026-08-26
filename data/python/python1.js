// Python 语法详解 —— 基础（共 16 种）
module.exports = [
  {
    id: 'py-variables',
    title: '变量与动态类型',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '变量无需声明类型，赋值即创建，类型在运行时决定且可随时改变。',
    detail: [
      'Python 是强类型但动态类型的语言：每个变量都指向一个对象，变量本身没有固定类型。',
      '赋值语句把名字绑定到对象；对同一名字重新赋值可以改变其指向的对象类型。',
      '可用 type() 查看对象类型，用 id() 查看对象标识；is 比较标识，== 比较值。'
    ],
    notes: [
      '动态类型不等于弱类型：Python 不会自动把字符串和数字相加，类型错误会直接抛异常。'
    ],
    example:
      'x = 10\n' +
      'print(type(x))      # <class "int">\n' +
      'x = "hello"         # 名字 x 重新绑定到字符串对象\n' +
      'print(type(x))      # <class "str">\n\n' +
      'a = [1, 2]; b = a\n' +
      'print(a is b)       # True，指向同一对象'
  },
  {
    id: 'py-strings',
    title: '字符串与 f-string',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '字符串是不可变序列，f-string 提供简洁安全的插值格式化。',
    detail: [
      'Python 字符串用单引号、双引号或三引号定义，三引号适合多行文本与文档字符串。',
      'f-string（f"..."）在运行时求值，{expr} 会被替换为对应值，可读性远胜 % 和 str.format。',
      '字符串不可变：所有"修改"其实都生成了新对象；常用方法 join、split、strip、upper 等。'
    ],
    notes: [
      'Python 3.8+ 支持 f"{value=}" 自动打印"value=..."调试信息。'
    ],
    example:
      'name = "Alice"\n' +
      'age = 30\n' +
      'msg = f"{name} 今年 {age} 岁"\n' +
      'print(msg)                 # Alice 今年 30 岁\n\n' +
      'items = ["a", "b", "c"]\n' +
      'print(", ".join(items))    # a, b, c\n' +
      'print("  hi  ".strip())    # hi'
  },
  {
    id: 'py-collections',
    title: '列表 / 元组 / 字典 / 集合',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '四种核心内置容器：可变列表、不可变元组、键值字典、去重集合。',
    detail: [
      'list 是有序可变序列，支持索引、切片、append、insert、pop、推导式。',
      'tuple 是不可变序列，适合作为字典键或表示固定结构（如坐标、记录）。',
      'dict 是键值映射，3.7+ 保证插入顺序；set 是无序去重集合，支持交集/并集/差集运算。'
    ],
    notes: [
      '需要高频去重或成员判断时用 set（O(1)），不要反复用 list 的 in（O(n)）。'
    ],
    example:
      'lst = [1, 2, 3]\n' +
      'lst.append(4)\n' +
      't = (10, 20)\n' +
      'd = {"name": "Bob", "age": 25}\n' +
      's = {1, 2, 2, 3}\n' +
      'print(s)                 # {1, 2, 3}\n' +
      'print(d.get("name"))     # Bob\n' +
      'print(lst[1:3])          # [2, 3]'
  },
  {
    id: 'py-control-flow',
    title: '条件与循环',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用 if/elif/else 分支，for/while 循环，并可用 else 子句处理"未 break"。',
    detail: [
      'Python 用缩进（通常 4 空格）表示代码块，没有花括号。',
      'for 循环直接迭代可迭代对象（列表、字符串、字典、range 等），不是 C 风格的下标循环。',
      '循环可以带 else：当循环正常结束（未被 break）时执行，常用于"查找未命中"场景。'
    ],
    example:
      'for i in range(3):\n' +
      '    print(i)            # 0 1 2\n\n' +
      'n = 7\n' +
      'if n % 2 == 0:\n' +
      '    print("偶数")\n' +
      'else:\n' +
      '    print("奇数")\n\n' +
      'for x in [1, 2, 3]:\n' +
      '    if x == 5:\n' +
      '        break\n' +
      'else:\n' +
      '    print("没有找到 5")'
  },
  {
    id: 'py-comprehensions',
    title: '推导式',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用一行表达式生成列表、集合、字典，并可加条件过滤。',
    detail: [
      '列表推导式 [expr for x in iter if cond] 比手写 for+append 更简洁高效。',
      '同样支持集合推导 {x for x in ...} 与字典推导 {k: v for ...}。',
      '嵌套推导和生成器表达式（用圆括号）也常见，但过深会降低可读性。'
    ],
    notes: [
      '生成器表达式 (x for x in data) 惰性求值，适合处理大文件或无限序列。'
    ],
    example:
      'squares = [x * x for x in range(5)]\n' +
      'print(squares)                     # [0, 1, 4, 9, 16]\n' +
      'evens = [x for x in range(10) if x % 2 == 0]\n' +
      'd = {x: x * x for x in range(3)}\n' +
      'print(d)                          # {0: 0, 1: 1, 2: 4}'
  },
  {
    id: 'py-functions',
    title: '函数与参数',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用 def 定义函数，支持默认参数、关键字参数与解包调用。',
    detail: [
      '函数用 def 定义，参数可设默认值；调用时位置参数在前，关键字参数在后。',
      '默认参数值在函数定义时求值一次，可变对象（如 list）作默认值会共享，应改为 None 再初始化。',
      '调用时可用 *iter 解包位置参数、**dict 解包关键字参数。'
    ],
    notes: [
      '把可变对象作为默认参数（def f(x=[])）是常见陷阱，多次调用会累积数据。'
    ],
    example:
      'def greet(name, greeting="你好"):\n' +
      '    return f"{greeting}, {name}"\n\n' +
      'print(greet("Tom"))            # 你好, Tom\n' +
      'print(greet("Tom", "Hi"))     # Hi, Tom\n\n' +
      'def f(x=None):\n' +
      '    x = x or []\n' +
      '    x.append(1)\n' +
      '    return x\n' +
      'print(f())                     # [1]'
  },
  {
    id: 'py-scope-legb',
    title: '作用域与 LEGB',
    category: '基础语法',
    version: '基础',
    level: '进阶',
    summary: '名字查找遵循 L-E-G-B：局部、嵌套、全局、内置。',
    detail: [
      'Python 有四种作用域：Local（局部）、Enclosing（外层函数）、Global（全局）、Builtin（内置）。',
      '在函数内给全局变量赋值需用 global 声明；修改外层函数的变量用 nonlocal。',
      '闭包正是利用 Enclosing 作用域捕获外层变量。'
    ],
    example:
      'count = 0\n' +
      'def increment():\n' +
      '    global count\n' +
      '    count += 1\n' +
      '    return count\n\n' +
      'def outer():\n' +
      '    msg = "hi"\n' +
      '    def inner():\n' +
      '        nonlocal msg\n' +
      '        msg = "bye"\n' +
      '        return msg\n' +
      '    return inner()\n\n' +
      'print(increment(), outer())'
  },
  {
    id: 'py-lambda',
    title: 'lambda 表达式',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '匿名一次性小函数，常用于排序 key、map/filter 等高阶函数参数。',
    detail: [
      'lambda 参数: 表达式 定义一个匿名函数，只能包含单个表达式（即返回值）。',
      '适合作为回调或排序键；复杂逻辑仍应写成普通 def 以提高可读性。',
      '常配合 sorted、max、min 的 key= 参数使用。'
    ],
    example:
      'pairs = [(1, "b"), (3, "a"), (2, "c")]\n' +
      'pairs.sort(key=lambda p: p[0])\n' +
      'print(pairs)                     # [(1, "b"), (2, "c"), (3, "a")]\n\n' +
      'square = lambda x: x * x\n' +
      'print(square(5))                 # 25'
  },
  {
    id: 'py-decorators',
    title: '装饰器',
    category: '基础语法',
    version: '基础',
    level: '进阶',
    summary: '用 @ 语法在不修改原函数代码的前提下增强函数行为。',
    detail: [
      '装饰器本质是一个接收函数、返回新函数的高阶函数；@decor 等价于 f = decor(f)。',
      '常见用途：日志、计时、权限校验、缓存（functools.lru_cache）。',
      '用 functools.wraps 保留被装饰函数的元信息（名称、文档）。'
    ],
    notes: [
      '带参数的装饰器需要再包一层：最外层接收参数，返回真正的装饰器。'
    ],
    example:
      'import time, functools\n\n' +
      'def timer(func):\n' +
      '    @functools.wraps(func)\n' +
      '    def wrapper(*args, **kwargs):\n' +
      '        t = time.perf_counter()\n' +
      '        result = func(*args, **kwargs)\n' +
      '        print(f"{func.__name__} 用时 {time.perf_counter() - t:.4f}s")\n' +
      '        return result\n' +
      '    return wrapper\n\n' +
      '@timer\n' +
      'def work():\n' +
      '    sum(i for i in range(100000))\n\n' +
      'work()'
  },
  {
    id: 'py-generators',
    title: '迭代器与生成器',
    category: '基础语法',
    version: '基础',
    level: '进阶',
    summary: '用 yield 编写惰性生成器，节省内存并支持无限序列。',
    detail: [
      '包含 yield 的函数是生成器函数，调用时返回一个生成器对象，每次 next 执行到下一个 yield。',
      '生成器是惰性求值的迭代器，适合处理大文件、流式数据和管道式处理。',
      '可用 yield from 把迭代委托给另一个可迭代对象，扁平化嵌套循环。'
    ],
    example:
      'def count_up(n):\n' +
      '    i = 0\n' +
      '    while i < n:\n' +
      '        yield i\n' +
      '        i += 1\n\n' +
      'for x in count_up(3):\n' +
      '    print(x)              # 0 1 2\n\n' +
      'def chain(a, b):\n' +
      '    yield from a\n' +
      '    yield from b\n\n' +
      'print(list(chain([1, 2], [3, 4])))   # [1, 2, 3, 4]'
  },
  {
    id: 'py-context-manager',
    title: '上下文管理器 with',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用 with 自动管理资源（文件、锁、连接）的获取与释放。',
    detail: [
      'with 语句确保退出块时自动调用 __exit__，即使发生异常也会清理资源。',
      '最常见的用法是文件操作：离开 with 块时文件自动关闭。',
      '可用 contextlib.contextmanager 装饰生成器快速定义自己的上下文管理器。'
    ],
    example:
      'with open("data.txt", "w", encoding="utf-8") as f:\n' +
      '    f.write("hello")\n' +
      '# 此处文件已自动关闭\n\n' +
      'from contextlib import contextmanager\n' +
      '@contextmanager\n' +
      'def tag(name):\n' +
      '    print(f"<{name}>")\n' +
      '    yield\n' +
      '    print(f"</{name}>")\n\n' +
      'with tag("div"):\n' +
      '    print("内容")'
  },
  {
    id: 'py-exceptions',
    title: '异常处理',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用 try/except/finally/else 捕获并处理异常，保证程序健壮。',
    detail: [
      'try 块中抛出的异常会被匹配的 except 捕获；else 在无异常时执行；finally 总是执行（常用于清理）。',
      '应尽量捕获具体异常（如 ValueError），避免裸 except: 吞掉所有错误。',
      '用 raise 主动抛异常，raise ... from 可保留异常链便于排查。'
    ],
    notes: [
      '可用 except (TypeError, ValueError) as e 一次捕获多种异常。'
    ],
    example:
      'try:\n' +
      '    n = int("abc")\n' +
      'except ValueError as e:\n' +
      '    print("转换失败:", e)\n' +
      'else:\n' +
      '    print("转换成功")\n' +
      'finally:\n' +
      '    print("清理完成")'
  },
  {
    id: 'py-oop',
    title: '类与面向对象',
    category: '基础语法',
    version: '基础',
    level: '入门',
    summary: '用 class 定义类型，支持继承、多态与鸭子类型。',
    detail: [
      '类用 class 定义，__init__ 是构造方法，self 指代实例（必须显式写出）。',
      'Python 支持多继承，方法解析顺序（MRO）由 C3 算法决定，可用 Class.__mro__ 查看。',
      'Python 推崇"鸭子类型"：只要对象有需要的方法就能用，不强制继承接口。'
    ],
    example:
      'class Animal:\n' +
      '    def speak(self):\n' +
      '        raise NotImplementedError\n\n' +
      'class Dog(Animal):\n' +
      '    def speak(self):\n' +
      '        return "汪汪"\n\n' +
      'class Cat(Animal):\n' +
      '    def speak(self):\n' +
      '        return "喵喵"\n\n' +
      'for a in [Dog(), Cat()]:\n' +
      '    print(a.speak())'
  },
  {
    id: 'py-dunder',
    title: '魔术方法',
    category: '基础语法',
    version: '基础',
    level: '进阶',
    summary: '以双下划线包裹的 __xx__ 方法让自定义对象支持运算符与内置函数。',
    detail: [
      '__init__ 构造、__str__/__repr__ 字符串表示、__len__ 支持 len()、__getitem__ 支持索引。',
      '运算符重载通过 __add__、__eq__、__lt__ 等方法实现，让对象像内建类型一样运算。',
      '__call__ 让实例可像函数调用；__enter__/__exit__ 实现上下文管理器。'
    ],
    example:
      'class Vec:\n' +
      '    def __init__(self, x, y):\n' +
      '        self.x, self.y = x, y\n' +
      '    def __add__(self, other):\n' +
      '        return Vec(self.x + other.x, self.y + other.y)\n' +
      '    def __repr__(self):\n' +
      '        return f"Vec({self.x}, {self.y})"\n\n' +
      'print(Vec(1, 2) + Vec(3, 4))    # Vec(4, 6)'
  },
  {
    id: 'py-dataclass',
    title: '数据类 dataclass',
    category: '基础语法',
    version: '3.7+',
    level: '进阶',
    summary: '用 @dataclass 自动生成 __init__、__repr__、比较方法，减少样板代码。',
    detail: [
      'dataclass 根据类属性自动生成构造、字符串表示、相等比较等方法。',
      '默认生成 __eq__；加 order=True 还会生成大小比较，fields 顺序决定比较优先级。',
      '适合表示纯数据载体；可用 field(default_factory=list) 提供可变默认值。'
    ],
    notes: [
      'dataclass 默认是不可变的吗？不是，除非设置 frozen=True。'
    ],
    example:
      'from dataclasses import dataclass, field\n\n' +
      '@dataclass(order=True)\n' +
      'class Point:\n' +
      '    x: int\n' +
      '    y: int\n' +
      '    tags: list = field(default_factory=list)\n\n' +
      'p = Point(1, 2)\n' +
      'print(p)                 # Point(x=1, y=2, tags=[])\n' +
      'print(Point(1, 2) == Point(1, 2))   # True'
  },
  {
    id: 'py-typing',
    title: '类型注解 typing',
    category: '基础语法',
    version: '3.5+',
    level: '进阶',
    summary: '用类型注解标注变量与函数签名，配合 mypy 做静态检查。',
    detail: [
      'Python 运行时忽略类型注解，它主要用于静态检查（mypy/pyright）和提升可读性。',
      'typing 模块提供 List、Dict、Optional、Union、Callable 等；3.9+ 可直接用内置 list[int]。',
      'Optional[X] 等价于 Union[X, None]；用 -> 标注返回值类型。'
    ],
    notes: [
      '类型注解不影响运行，但 pyright/mypy 能提前发现大量潜在 bug。'
    ],
    example:
      'from typing import Optional\n\n' +
      'def divide(a: float, b: float) -> Optional[float]:\n' +
      '    if b == 0:\n' +
      '        return None\n' +
      '    return a / b\n\n' +
      'names: list[str] = ["a", "b"]\n' +
      'print(divide(10, 2))      # 5.0\n' +
      'print(divide(10, 0))      # None'
  }
];
