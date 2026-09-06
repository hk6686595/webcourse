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
      'print(type(x))      # <class "str">\n' +
      'x = [1, 2, 3]       # 再次改绑到列表\n' +
      'print(type(x))      # <class "list">\n\n' +
      'a = [1, 2]; b = a\n' +
      'print(a is b)       # True，指向同一对象\n' +
      'print(a == [1, 2])  # True，值相等但不同对象\n' +
      'print(a is [1, 2])  # False\n\n' +
      '# 标识 id()：每个对象有唯一编号\n' +
      'print(id(a) == id(b))   # True',
    example2:
      '# 变量只是一个指向对象的"标签"，可同时指向同一对象\n' +
      'lst = [0, 1, 2]\n' +
      'alias = lst            # 两个名字指向同一个列表\n' +
      'alias.append(3)\n' +
      'print(lst)             # [0, 1, 2, 3] 原变量也变了\n\n' +
      '# 重新赋值是"换绑"，不是修改对象本身\n' +
      'x = 5\n' +
      'y = x\n' +
      'x = 99\n' +
      'print(y)               # 5，y 仍指向原整数 5',
    example3:
      '# isinstance 更适合运行时判型\n' +
      'def describe(v):\n' +
      '    if isinstance(v, int):\n' +
      '        return f"整数 {v:,}"\n' +
      '    elif isinstance(v, float):\n' +
      '        return f"浮点 {v:.2f}"\n' +
      '    elif isinstance(v, str):\n' +
      '        return f"字符串({len(v)}字) {v}"\n' +
      '    return type(v).__name__\n\n' +
      'print(describe(1234567))     # 整数 1,234,567\n' +
      'print(describe(3.14159))     # 浮点 3.14\n' +
      'print(describe("Python"))    # 字符串(6字) Python'
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
      '# 对齐、补零、千分位\n' +
      'price = 1234.5\n' +
      'print(f"{price:,.2f}")     # 1,234.50\n' +
      'print(f"{name:>10}|")      #       Alice|\n' +
      'print(f"{name:<10}|")      # Alice      |\n' +
      'print(f"{age:03d}")        # 030\n\n' +
      'items = ["a", "b", "c"]\n' +
      'print(", ".join(items))    # a, b, c\n' +
      'print("  hi  ".strip())    # hi',
    example2:
      '# 三引号多行文本\n' +
      'poem = """山高路远\n' +
      '水长流\n' +
      '风轻云淡\n' +
      '月如钩"""\n' +
      'print(poem)\n\n' +
      '# 多行 f-string（3.12+ 可跨行，之前用括号拼接）\n' +
      'user = {"name": "Bob", "age": 25}\n' +
      'info = (\n' +
      '    f"姓名: {user[\'name\']}  "   # 注意内部引号加转义\n' +
      '    f"年龄: {user[\'age\']}"\n' +
      ')\n' +
      'print(info)',
    example3:
      '# 常用字符串方法\n' +
      'raw = "  Hello, World!  "\n' +
      'print(raw.strip())        # Hello, World!\n' +
      'print(raw.lower())        #   hello, world!  \n' +
      'print(raw.upper())\n' +
      'print(raw.replace("World", "Python"))\n' +
      'print(raw.startswith("  H"))\n' +
      'parts = "a,b,c".split(",")\n' +
      'print(parts)              # [\'a\', \'b\', \'c\']\n' +
      'print("-".join(parts))    # a-b-c'
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
      'lst.insert(0, 0)\n' +
      'lst.extend([5, 6])\n' +
      'print(lst)                 # [0, 1, 2, 3, 4, 5, 6]\n' +
      'popped = lst.pop()\n' +
      'print(popped, lst)         # 6 [0, 1, 2, 3, 4, 5]\n\n' +
      't = (10, 20)\n' +
      'd = {"name": "Bob", "age": 25}\n' +
      'd["city"] = "Beijing"      # 新增键\n' +
      'print(d.get("missing", "默认值"))\n' +
      'print(d.setdefault("score", 0))  # 无则设默认\n\n' +
      's = {1, 2, 2, 3}\n' +
      'print(s)                   # {1, 2, 3}',
    example2:
      '# 容器常用操作\n' +
      'lst = [3, 1, 4, 1, 5]\n' +
      'print(sorted(lst))         # [1, 1, 3, 4, 5]\n' +
      'lst.sort(reverse=True)\n' +
      'print(lst)                 # [5, 4, 3, 1, 1]\n\n' +
      '# 元组解包\n' +
      'x, y = (10, 20)\n' +
      'print(x + y)\n' +
      'first, *rest = [1, 2, 3, 4]\n' +
      'print(first, rest)         # 1 [2, 3, 4]\n\n' +
      '# 集合运算\n' +
      'a = {1, 2, 3}\n' +
      'b = {2, 3, 4}\n' +
      'print(a & b)               # 交集 {2, 3}\n' +
      'print(a | b)               # 并集\n' +
      'print(a - b)               # 差集 {1}\n' +
      'print(2 in a)              # True',
    example3:
      '# 字典推导 + 过滤\n' +
      'prices = {"apple": 3, "banana": 2, "cherry": 5}\n' +
      'cheap = {k: v for k, v in prices.items() if v < 4}\n' +
      'print(cheap)               # {\'apple\': 3, \'banana\': 2}\n\n' +
      '# Counter 快速统计（collections）\n' +
      'from collections import Counter\n' +
      'words = ["a", "b", "a", "c", "a", "b"]\n' +
      'print(Counter(words))      # Counter({\'a\': 3, \'b\': 2, \'c\': 1})\n' +
      'print(Counter(words).most_common(1))  # [(\'a\', 3)]'
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
    notes: [
      '匹配多个值时用 in 而不是长串 if：if x in (1, 2, 3) 更清晰。'
    ],
    example:
      'for i in range(3):\n' +
      '    print(i)            # 0 1 2\n\n' +
      'n = 7\n' +
      'if n % 2 == 0:\n' +
      '    print("偶数")\n' +
      'elif n % 3 == 0:\n' +
      '    print("3 的倍数")\n' +
      'else:\n' +
      '    print("奇数")\n\n' +
      '# 遍历字典\n' +
      'd = {"a": 1, "b": 2}\n' +
      'for k, v in d.items():\n' +
      '    print(k, "=", v)\n\n' +
      '# enumerate 同时取下标\n' +
      'for idx, ch in enumerate("abc"):\n' +
      '    print(idx, ch)',
    example2:
      '# 循环 else：查找未命中\n' +
      'users = ["Tom", "Jerry", "Alice"]\n' +
      'for u in users:\n' +
      '    if u == "Bob":\n' +
      '        print("找到了 Bob")\n' +
      '        break\n' +
      'else:\n' +
      '    print("没有 Bob")\n\n' +
      '# while 配合 break/continue\n' +
      'i = 0\n' +
      'while i < 10:\n' +
      '    i += 1\n' +
      '    if i == 3:\n' +
      '        continue          # 跳过 3\n' +
      '    if i == 8:\n' +
      '        break             # 到 8 停止\n' +
      '    print(i, end=" ")     # 1 2 4 5 6 7\n' +
      'print()',
    example3:
      '# 多分支判断(10 分制评等级)\n' +
      'def grade(score):\n' +
      '    if score >= 90:\n' +
      '        return "A"\n' +
      '    elif score >= 80:\n' +
      '        return "B"\n' +
      '    elif score >= 70:\n' +
      '        return "C"\n' +
      '    elif score >= 60:\n' +
      '        return "D"\n' +
      '    else:\n' +
      '        return "F"\n\n' +
      '# 三元表达式\n' +
      'status = "及格" if grade(75) in "ABCD" else "不及格"\n' +
      'print(status)\n\n' +
      '# zip 并行遍历\n' +
      'names = ["a", "b"]\n' +
      'scores = [85, 92]\n' +
      'for name, score in zip(names, scores):\n' +
      '    print(f"{name}: {score}")'
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
      'print(squares)                     # [0, 1, 4, 9, 16]\n\n' +
      'evens = [x for x in range(10) if x % 2 == 0]\n' +
      'print(evens)                       # [0, 2, 4, 6, 8]\n\n' +
      '# 集合推导去重\n' +
      'words = ["a", "b", "a", "c", "b"]\n' +
      'unique = {w.upper() for w in words}\n' +
      'print(unique)                      # {\'A\', \'B\', \'C\'}\n\n' +
      '# 字典推导\n' +
      'd = {x: x * x for x in range(3)}\n' +
      'print(d)                           # {0: 0, 1: 1, 2: 4}',
    example2:
      '# 嵌套循环推导：九九乘法表\n' +
      'table = [f"{i}x{j}={i*j}" for i in range(1, 4) for j in range(1, 4)]\n' +
      'print(table)\n\n' +
      '# 双层推导展开矩阵\n' +
      'matrix = [[1, 2], [3, 4]]\n' +
      'flat = [n for row in matrix for n in row]\n' +
      'print(flat)                        # [1, 2, 3, 4]\n\n' +
      '# 条件在表达式里\n' +
      'nums = [x if x > 2 else 0 for x in range(5)]\n' +
      'print(nums)                        # [0, 0, 0, 3, 4]',
    example3:
      '# 生成器表达式：惰性、省内存\n' +
      'gen = (x * x for x in range(1_000_000))\n' +
      'print(sum(gen))                    # 只求和，不建大列表\n\n' +
      '# 用推导处理字符串列表\n' +
      'lines = ["  hello ", "world ", "  "]\n' +
      'clean = [l.strip() for l in lines if l.strip()]\n' +
      'print(clean)                       # [\'hello\', \'world\']\n\n' +
      '# dict.items 推导出键值转换\n' +
      'inventory = {"apple": 3, "banana": 5}\n' +
      'styled = {k.title(): v * 2 for k, v in inventory.items()}\n' +
      'print(styled)                      # {\'Apple\': 6, \'Banana\': 10}'
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
      'print(greet("Tom", "Hi"))     # Hi, Tom\n' +
      'print(greet(greeting="Yo", name="Tom"))  # 关键字参数\n\n' +
      '# 默认参数的陷阱\n' +
      'def bad(x=[]):\n' +
      '    x.append(1)\n' +
      '    return x\n' +
      'print(bad())                   # [1]\n' +
      'print(bad())                   # [1, 1]  累积了！\n\n' +
      'def good(x=None):\n' +
      '    x = [] if x is None else x\n' +
      '    x.append(1)\n' +
      '    return x\n' +
      'print(good(), good())          # [1] [1]',
    example2:
      '# * 解包调用\n' +
      'def add(a, b, c):\n' +
      '    return a + b + c\n\n' +
      'nums = [1, 2, 3]\n' +
      'print(add(*nums))              # 6\n' +
      'print(add(*range(3)))          # 3\n\n' +
      '# ** 解包字典为关键字\n' +
      'def info(name, age, city="?"):\n' +
      '    return f"{name}({age}) in {city}"\n\n' +
      'data = {"name": "Amy", "age": 20}\n' +
      'print(info(**data))            # Amy(20) in ?\n\n' +
      '# 仅关键字参数（* 之后必须用关键字传入）\n' +
      'def conf(host, *, port=80, debug=False):\n' +
      '    return host, port, debug\n' +
      'print(conf("localhost"))\n' +
      'print(conf("localhost", port=8080, debug=True))',
    example3:
      '# docstring 与类型提示\n' +
      'def area(w: float, h: float) -> float:\n' +
      '    """计算矩形面积。\n' +
      '    Args:\n' +
      '        w: 宽\n' +
      '        h: 高\n' +
      '    Returns:\n' +
      '        面积\n' +
      '    """\n' +
      '    return w * h\n\n' +
      '# 函数是一等公民：可赋值、可传递\n' +
      'double = lambda x: x * 2\n' +
      'ops = {"double": double, "area": area}\n' +
      'print(ops["double"](4))       # 8\n' +
      'print(ops["area"](2, 3))      # 6'
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
      'print(increment(), increment())   # 1 2\n\n' +
      '# nonlocal 修改外层函数变量\n' +
      'def outer():\n' +
      '    msg = "hi"\n' +
      '    def inner():\n' +
      '        nonlocal msg\n' +
      '        msg = "bye"\n' +
      '        return msg\n' +
      '    return inner(), msg\n' +
      'print(outer())                    # (\'bye\', \'bye\')',
    example2:
      '# 全局变量读取不需要声明，赋值才需要\n' +
      'x = 10\n' +
      'def read():\n' +
      '    return x             # 只读，直接可用\n\n' +
      'def write():\n' +
      '    x = 20               # 未声明 global，其实是新建局部变量！\n' +
      '    return x\n\n' +
      'print(read(), write(), "全局仍为", x)\n' +
      '# 10 20 全局仍为 10',
    example3:
      '# 闭包：捕获外层变量并记住\n' +
      'def make_counter():\n' +
      '    n = 0\n' +
      '    def counter():\n' +
      '        nonlocal n\n' +
      '        n += 1\n' +
      '        return n\n' +
      '    return counter\n\n' +
      'c = make_counter()\n' +
      'print(c(), c(), c())      # 1 2 3\n\n' +
      '# 工厂函数：参数作为闭包变量\n' +
      'def make_power(exp):\n' +
      '    def power(base):\n' +
      '        return base ** exp\n' +
      '    return power\n\n' +
      'square = make_power(2)\n' +
      'cube = make_power(3)\n' +
      'print(square(4), cube(3))   # 16 27'
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
      '# 按第二个元素（字符串）排序\n' +
      'pairs.sort(key=lambda p: p[1])\n' +
      'print(pairs)                     # [(3, "a"), (1, "b"), (2, "c")]\n\n' +
      'square = lambda x: x * x\n' +
      'print(square(5))                 # 25',
    example2:
      '# 按字典的某字段排序\n' +
      'users = [\n' +
      '    {"name": "Tom", "age": 30},\n' +
      '    {"name": "Amy", "age": 20},\n' +
      '    {"name": "Bob", "age": 25},\n' +
      ']\n' +
      'users.sort(key=lambda u: u["age"])\n' +
      'print([u["name"] for u in users])  # [\'Amy\', \'Bob\', \'Tom\']\n\n' +
      '# max/min 配合 key\n' +
      'words = ["a", "bbb", "cc"]\n' +
      'print(max(words, key=len))      # bbb\n' +
      'print(min(words, key=len))      # a',
    example3:
      '# 与 map/filter 组合\n' +
      'nums = [1, 2, 3, 4, 5]\n' +
      'doubled = list(map(lambda x: x * 2, nums))\n' +
      'print(doubled)                  # [2, 4, 6, 8, 10]\n\n' +
      'evens = list(filter(lambda x: x % 2 == 0, nums))\n' +
      'print(evens)                    # [2, 4]\n\n' +
      '# 但推导式往往更可读\n' +
      'print([x * 2 for x in nums])\n' +
      'print([x for x in nums if x % 2 == 0])'
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
      '        print(f"{func.__name__} 用时 {time.perf_counter() - t:.6f}s")\n' +
      '        return result\n' +
      '    return wrapper\n\n' +
      '@timer\n' +
      'def slow_sum(n):\n' +
      '    return sum(range(n))\n\n' +
      'r = slow_sum(1_000_000)\n' +
      'print("结果:", r)\n' +
      'print("函数名保留:", slow_sum.__name__)',
    example2:
      '# 带参数的装饰器 + 缓存\n' +
      'from functools import lru_cache\n\n' +
      'def repeat(times):\n' +
      '    def decorator(func):\n' +
      '        @functools.wraps(func)\n' +
      '        def wrapper(*args, **kwargs):\n' +
      '            for _ in range(times):\n' +
      '                func(*args, **kwargs)\n' +
      '        return wrapper\n' +
      '    return decorator\n\n' +
      'def announce(func):\n' +
      '    @functools.wraps(func)\n' +
      '    def wrapper(*args, **kwargs):\n' +
      '        print("开始执行", func.__name__)\n' +
      '        r = func(*args, **kwargs)\n' +
      '        print("结束执行")\n' +
      '        return r\n' +
      '    return wrapper\n\n' +
      '@announce\n' +
      '@repeat(2)\n' +
      'def greet(name):\n' +
      '    print(f"Hello {name}")\n\n' +
      'greet("Tom")',
    example3:
      '# 装饰器缓存：lru_cache 当作记忆化\n' +
      'from functools import lru_cache\n\n' +
      '@lru_cache(maxsize=None)\n' +
      'def fib(n):\n' +
      '    if n < 2:\n' +
      '        return n\n' +
      '    return fib(n - 1) + fib(n - 2)\n\n' +
      'print(fib(50))    # 12586269025，没有缓存会非常慢\n' +
      'print(fib.cache_info())\n\n' +
      '# 类方法装饰器\n' +
      'class MathUtils:\n' +
      '    @staticmethod\n' +
      '    def add(a, b):\n' +
      '        return a + b\n' +
      '    @classmethod\n' +
      '    def from_str(cls, s):\n' +
      '        return cls()\n\n' +
      'print(MathUtils.add(1, 2))   # 3'
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
      'print(list(chain([1, 2], [3, 4])))   # [1, 2, 3, 4]',
    example2:
      '# 无限序列：斐波那契生成器\n' +
      'def fibonacci():\n' +
      '    a, b = 0, 1\n' +
      '    while True:\n' +
      '        yield a\n' +
      '        a, b = b, a + b\n\n' +
      'fib = fibonacci()\n' +
      'print([next(fib) for _ in range(8)])\n' +
      '# [0, 1, 1, 2, 3, 5, 8, 13]\n\n' +
      '# 用 islice 取前 N 个\n' +
      'from itertools import islice\n' +
      'fib2 = fibonacci()\n' +
      'print(list(islice(fib2, 10)))',
    example3:
      '# 逐行处理大文件（内存友好）\n' +
      'def read_lines(path):\n' +
      '    with open(path, "r", encoding="utf-8") as f:\n' +
      '        for line in f:\n' +
      '            line = line.strip()\n' +
      '            if line:\n' +
      '                yield line\n\n' +
      '# 生成器管道：筛选 + 转换\n' +
      'def to_upper(lines):\n' +
      '    for line in lines:\n' +
      '        yield line.upper()\n\n' +
      'lines = ["  hello ", "world", ""]\n' +
      'pipe = to_upper(read_lines_opened(lines))\n\n' +
      'def read_lines_opened(lines):\n' +
      '    for line in lines:\n' +
      '        if line.strip():\n' +
      '            yield line.strip()\n\n' +
      'print(list(to_upper(read_lines_opened(lines))))\n' +
      '# [\'HELLO\', \'WORLD\']'
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
      'from contextlib import contextmanager\n\n' +
      '@contextmanager\n' +
      'def tag(name):\n' +
      '    print(f"<{name}>")\n' +
      '    yield\n' +
      '    print(f"</{name}>")\n\n' +
      'with tag("div"):\n' +
      '    print("内容")',
    example2:
      '# 同时管理多个资源\n' +
      'with open("a.txt", "r") as fa, open("b.txt", "w") as fb:\n' +
      '    fb.write(fa.read())\n\n' +
      '# 一个上下文对象管理串行资源\n' +
      'class Managed:\n' +
      '    def __enter__(self):\n' +
      '        print("进入上下文")\n' +
      '        return self\n' +
      '    def __exit__(self, exc_type, exc, tb):\n' +
      '        print("退出上下文")\n' +
      '        return False      # False 表示不吞异常\n\n' +
      'with Managed() as m:\n' +
      '    print("做事情")\n' +
      '# 打印：进入上下文 / 做事情 / 退出上下文',
    example3:
      '# 异常也保证退出\n' +
      'from contextlib import contextmanager\n\n' +
      '@contextmanager\n' +
      'def db_session():\n' +
      '    conn = connect()          # 伪代码\n' +
      '    try:\n' +
      '        yield conn\n' +
      '    finally:\n' +
      '        conn.close()          # 无论是否出错都关闭\n\n' +
      '# suppress 忽略指定异常\n' +
      'from contextlib import suppress\n' +
      'with suppress(FileNotFoundError):\n' +
      '    open("不存在的文件.txt", "r")\n' +
      'print("被忽略，程序继续")'
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
      '    print("清理完成")',
    example2:
      '# 捕获多种异常 + 主动抛出\n' +
      'def safe_divide(a, b):\n' +
      '    try:\n' +
      '        result = a / b\n' +
      '    except (ZeroDivisionError, TypeError) as e:\n' +
      '        print(f"出错了: {e}")\n' +
      '        return None\n' +
      '    else:\n' +
      '        return result\n\n' +
      'print(safe_divide(10, 2))    # 5.0\n' +
      'print(safe_divide(10, 0))    # 出错了: division by zero\n' +
      'print(safe_divide("a", 2))   # 出错了',
    example3:
      '# 自定义异常 + 异常链\n' +
      'class BalanceError(Exception):\n' +
      '    pass\n\n' +
      'class Account:\n' +
      '    def __init__(self, balance):\n' +
      '        self.balance = balance\n' +
      '    def withdraw(self, amount):\n' +
      '        if amount > self.balance:\n' +
      '            raise BalanceError(f"余额不足: {self.balance}")\n' +
      '        self.balance -= amount\n\n' +
      'acc = Account(100)\n' +
      'try:\n' +
      '    acc.withdraw(200)\n' +
      'except BalanceError as e:\n' +
      '    print("业务异常:", e)\n\n' +
      '# try / except 包裹各种异常类型\n' +
      'import json\n' +
      'try:\n' +
      '    json.loads("not json")\n' +
      'except json.JSONDecodeError:\n' +
      '    print("JSON 解析失败")'
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
      '    def __init__(self, name):\n' +
      '        self.name = name\n' +
      '    def speak(self):\n' +
      '        raise NotImplementedError\n\n' +
      'class Dog(Animal):\n' +
      '    def speak(self):\n' +
      '        return "汪汪"\n\n' +
      'class Cat(Animal):\n' +
      '    def speak(self):\n' +
      '        return "喵喵"\n\n' +
      'for a in [Dog("旺财"), Cat("咪咪")]:\n' +
      '    print(a.name, a.speak())',
    example2:
      '# 类属性与实例属性\n' +
      'class Counter:\n' +
      '    total = 0               # 类属性（所有实例共享）\n\n' +
      '    def __init__(self):\n' +
      '        Counter.total += 1\n' +
      '        self.id = Counter.total   # 实例属性\n\n' +
      'a = Counter(); b = Counter(); c = Counter()\n' +
      'print(Counter.total, c.id)   # 3 3\n\n' +
      '# property 控制属性\n' +
      'class Circle:\n' +
      '    def __init__(self, r):\n' +
      '        self._r = r\n' +
      '    @property\n' +
      '    def area(self):\n' +
      '        return 3.14159 * self._r ** 2\n' +
      '    @property\n' +
      '    def r(self):\n' +
      '        return self._r\n' +
      '    @r.setter\n' +
      '    def r(self, v):\n' +
      '        if v < 0:\n' +
      '            raise ValueError("半径不能为负")\n' +
      '        self._r = v\n\n' +
      'c = Circle(2)\n' +
      'print(c.area)\n' +
      'c.r = 5\n' +
      'print(c.area)',
    example3:
      '# 多态与鸭子类型\n' +
      'def play_sound(any_thing):\n' +
      '    # 只要对象有 speak 方法即可\n' +
      '    print(any_thing.speak())\n\n' +
      'class Duck:\n' +
      '    def speak(self):\n' +
      '        return "嘎嘎"\n\n' +
      'class Robot:\n' +
      '    def speak(self):\n' +
      '        return "哔哔"\n\n' +
      'play_sound(Duck())\n' +
      'play_sound(Robot())\n\n' +
      '# 继承 + super()\n' +
      'class Base:\n' +
      '    def greet(self):\n' +
      '        return "你好"\n\n' +
      'class Child(Base):\n' +
      '    def greet(self):\n' +
      '        return super().greet() + "，欢迎!"\n\n' +
      'print(Child().greet())   # 你好，欢迎!'
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
      '    def __mul__(self, k):\n' +
      '        return Vec(self.x * k, self.y * k)\n' +
      '    def __repr__(self):\n' +
      '        return f"Vec({self.x}, {self.y})"\n' +
      '    def __eq__(self, other):\n' +
      '        return (self.x, self.y) == (other.x, other.y)\n\n' +
      'a = Vec(1, 2); b = Vec(3, 4)\n' +
      'print(a + b)              # Vec(4, 6)\n' +
      'print(a * 3)              # Vec(3, 6)\n' +
      'print(a == Vec(1, 2))     # True',
    example2:
      '# __getitem__ / __len__ 让对象像序列\n' +
      'class Fib:\n' +
      '    def __init__(self, n):\n' +
      '        self.n = n\n' +
      '    def __len__(self):\n' +
      '        return self.n\n' +
      '    def __getitem__(self, i):\n' +
      '        a, b = 0, 1\n' +
      '        for _ in range(i):\n' +
      '            a, b = b, a + b\n' +
      '        return a\n\n' +
      'fib = Fib(7)\n' +
      'print(len(fib))           # 7\n' +
      'for x in fib:             # 可迭代（因实现 __getitem__）\n' +
      '    print(x, end=" ")\n' +
      'print()',
    example3:
      '# __call__ 与 __str__/__repr__ 区别\n' +
      'class Multiply:\n' +
      '    def __init__(self, factor):\n' +
      '        self.factor = factor\n' +
      '    def __call__(self, value):\n' +
      '        return value * self.factor\n' +
      '    def __str__(self):\n' +
      '        return f"乘以{self.factor}"\n' +
      '    def __repr__(self):\n' +
      '        return f"Multiply({self.factor})"\n\n' +
      'mul3 = Multiply(3)\n' +
      'print(mul3(10))           # 30：实例被调用\n' +
      'print(str(mul3))          # 乘以3\n' +
      'print(repr(mul3))         # Multiply(3)\n\n' +
      '# 与 filter 结合使用\n' +
      'nums = [1, 2, 3, 4, 5]\n' +
      'print(list(filter(lambda x: x > 2, nums)))'
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
      'p.tags.append("origin")\n' +
      'print(p)                 # Point(x=1, y=2, tags=[\'origin\'])\n' +
      'print(Point(1, 2) == Point(1, 2))   # True\n' +
      'print(Point(1, 2) < Point(2, 0))    # True (order=True)',
    example2:
      '# 可变默认值用 field(default_factory)\n' +
      'from dataclasses import dataclass, field\n\n' +
      '@dataclass\n' +
      'class User:\n' +
      '    name: str\n' +
      '    roles: list = field(default_factory=list)\n' +
      '    created: str = "now"\n\n' +
      'u1 = User("Tom")\n' +
      'u2 = User("Jerry")\n' +
      'u1.roles.append("admin")   # 互不影响\n' +
      'print(u1.roles)           # [\'admin\']\n' +
      'print(u2.roles)           # []\n' +
      'print(u1.created)',
    example3:
      '# dataclass 其他特性\n' +
      'from dataclasses import dataclass, asdict, fields\n\n' +
      '@dataclass(frozen=True)   # 不可变\n' +
      'class Config:\n' +
      '    host: str\n' +
      '    port: int = 8080\n\n' +
      'cfg = Config("localhost")\n' +
      'print(cfg.port)               # 8080\n' +
      'print(asdict(cfg))            # {\'host\': \'localhost\', \'port\': 8080}\n\n' +
      'print([f.name for f in fields(Config)])\n' +
      '# [\'host\', \'port\']\n\n' +
      '# 不可变数据类无法修改\n' +
      'try:\n' +
      '    cfg.host = "x"\n' +
      'except Exception as e:\n' +
      '    print("不可变:", e)'
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
      'print(divide(10, 0))      # None',
    example2:
      '# 复杂类型注解\n' +
      'from typing import Callable, Dict, List, Optional\n\n' +
      '# 函数类型：接收 int 返回 str\n' +
      'def apply(fn: Callable[[int], str], val: int) -> str:\n' +
      '    return fn(val)\n\n' +
      'result = apply(str, 42)\n' +
      'print(result)\n\n' +
      '# 字典/列表嵌套\n' +
      'users: Dict[str, List[str]] = {\n' +
      '    "Tom": ["admin", "editor"],\n' +
      '}\n' +
      'print(users["Tom"])',
    example3:
      '# TypeAlias 让复杂类型更可读\n' +
      'from typing import TypeAlias, Optional\n\n' +
      'UserId: TypeAlias = int\n' +
      'def find_user(uid: UserId) -> Optional[str]:\n' +
      '    return "Alice" if uid == 1 else None\n\n' +
      'print(find_user(1))\n' +
      '# 用 Union 表达多类型\n' +
      'def parse(v: int | float | str) -> str:\n' +
      '    return str(v).upper()\n\n' +
      'print(parse(12.5))\n' +
      'print(parse("hi"))\n\n' +
      '# 泛型\n' +
      'from typing import TypeVar, List\n' +
      'T = TypeVar("T")\n' +
      'def first(items: List[T]) -> T:\n' +
      '    return items[0]\n\n' +
      'print(first([1, 2, 3]))\n' +
      'print(first(["a", "b"]))'
  }
];