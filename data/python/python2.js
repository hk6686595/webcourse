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
      '    print("直接运行")',
    example2:
      '# 常用内置模块速览\n' +
      'import os\n' +
      'import sys\n' +
      'import random\n' +
      'import math\n\n' +
      'print(os.getcwd())            # 当前工作目录\n' +
      'print(sys.version_info.major) # 主版本号\n' +
      'print(random.randint(1, 6))  # 1-6 随机\n' +
      'print(math.floor(3.7))       # 3\n' +
      'print(math.ceil(3.2))        # 4\n' +
      'print(math.pi)               # 3.14...',
    example3:
      '# 一个简单模块 mymath.py\n' +
      '# ----------------------------\n' +
      '"一个加减法模块"\n\n' +
      'def add(a, b):\n' +
      '    return a + b\n\n' +
      'def sub(a, b):\n' +
      '    return a - b\n\n' +
      'if __name__ == "__main__":\n' +
      '    print(add(10, 5))\n' +
      '# ----------------------------\n' +
      '# 使用:\n' +
      '# import mymath\n' +
      '# print(mymath.add(1, 2))   # 3\n' +
      '# 或: from mymath import add'
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
      'print(add(**data))       # 5',
    example2:
      '# 求和函数\n' +
      'def total(*nums):\n' +
      '    return sum(nums)\n\n' +
      'print(total(1, 2, 3, 4))      # 10\n' +
      'print(total(*range(5)))       # 10\n\n' +
      '# 转发/包装\n' +
      'def logger(func, *args, **kwargs):\n' +
      '    print(f"调用 {func.__name__} args={args} kwargs={kwargs}")\n' +
      '    return func(*args, **kwargs)\n\n' +
      'print(logger(add, 3, 4))      # 调用 add ... -> 7',
    example3:
      '# 仅关键字参数的收集\n' +
      'def connect(url, *, timeout=30, retry=3):\n' +
      '    return f"{url} timeout={timeout} retry={retry}"\n\n' +
      '# timeout/retry 只能用关键字传入\n' +
      'print(connect("http://x.com"))\n' +
      'print(connect("http://x.com", timeout=10, retry=5))\n\n' +
      '# **kwargs 捕获任意额外配置\n' +
      'def config(**opts):\n' +
      '    for k, v in opts.items():\n' +
      '        print(f"{k} = {v}")\n\n' +
      'config(host="localhost", port=8080, debug=True)'
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
      'asyncio.run(main())',
    example2:
      '# asyncio.create_task 调度\n' +
      'import asyncio\n\n' +
      'async def worker(name, delay):\n' +
      '    await asyncio.sleep(delay)\n' +
      '    print(f"{name} 完成")\n\n' +
      'async def main():\n' +
      '    tasks = [\n' +
      '        asyncio.create_task(worker("A", 0.2)),\n' +
      '        asyncio.create_task(worker("B", 0.1)),\n' +
      '        asyncio.create_task(worker("C", 0.3)),\n' +
      '    ]\n' +
      '    await asyncio.gather(*tasks)\n\n' +
      'asyncio.run(main())\n' +
      '# 打印顺序: B 完成 / A 完成 / C 完成',
    example3:
      '# 超时与等待\n' +
      'import asyncio\n\n' +
      'async def slow():\n' +
      '    await asyncio.sleep(2)\n' +
      '    return "慢任务结果"\n\n' +
      'async def main():\n' +
      '    try:\n' +
      '        result = await asyncio.wait_for(slow(), timeout=1)\n' +
      '    except asyncio.TimeoutError:\n' +
      '        print("超时了")\n\n' +
      'asyncio.run(main())\n\n' +
      '# asyncio.sleep(0) 让出控制权；用资源锁:\n' +
      'lock = asyncio.Lock()\n' +
      'async def critical():\n' +
      '    async with lock:\n' +
      '        print("互斥区")\n'
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
      'print(results)          # [1, 4, 9, 16]',
    example2:
      '# IO 并发：同时下载多个 URL（用请求替代模拟）\n' +
      'from concurrent.futures import ThreadPoolExecutor\n' +
      'import time\n\n' +
      'def fetch(url):\n' +
      '    time.sleep(0.5)              # 模拟 IO 等待\n' +
      '    return f"{url} 内容"\n\n' +
      'urls = [f"http://site/{i}" for i in range(4)]\n\n' +
      'start = time.perf_counter()\n' +
      'with ThreadPoolExecutor(max_workers=4) as ex:\n' +
      '    results = list(ex.map(fetch, urls))\n' +
      'print("耗时约", round(time.perf_counter() - start, 2), "s")\n' +
      'print(results)',
    example3:
      '# 进程池做 CPU 密集（多核并行）\n' +
      'from concurrent.futures import ProcessPoolExecutor\n' +
      'import math\n\n' +
      'def is_prime(n):\n' +
      '    if n < 2:\n' +
      '        return False\n' +
      '    for i in range(2, int(math.sqrt(n)) + 1):\n' +
      '        if n % i == 0:\n' +
      '            return False\n' +
      '    return True\n\n' +
      'nums = range(1_000_000, 1_000_100)\n' +
      'with ProcessPoolExecutor() as ex:\n' +
      '    primes = list(ex.map(is_prime, nums))\n' +
      'print(f"区间内素数个数: {sum(primes)}")\n\n' +
      '# 共享状态/锁（线程安全）\n' +
      'import threading\n' +
      'lock = threading.Lock()\n' +
      'counter = 0\n' +
      'def inc():\n' +
      '    global counter\n' +
      '    with lock:\n' +
      '        counter += 1\n'
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
      'from collections import Counter, defaultdict, deque\n' +
      'import json\n\n' +
      'p = Path(".")\n' +
      'print(list(p.iterdir())[:3])   # 目录下内容\n' +
      'c = Counter("abracadabra")\n' +
      'print(c.most_common(2))     # [("a", 5), ("b", 2)]\n\n' +
      'print(json.dumps({"x": 1}, ensure_ascii=False))',
    example2:
      '# defaultdict 与 deque\n' +
      'from collections import defaultdict, deque\n\n' +
      '# defaultdict: 键不存在时自动给默认值\n' +
      'groups = defaultdict(list)\n' +
      'for name, team in [("Tom", "A"), ("Amy", "B"), ("Bob", "A")]:\n' +
      '    groups[team].append(name)\n' +
      'print(dict(groups))\n' +
      '# {\'A\': [\'Tom\', \'Bob\'], \'B\': [\'Amy\']}\n\n' +
      '# deque: 双端队列，左右都可 O(1) 操作\n' +
      'dq = deque([1, 2, 3])\n' +
      'dq.appendleft(0)\n' +
      'dq.append(4)\n' +
      'dq.rotate(1)\n' +
      'print(list(dq))',
    example3:
      '# datetime 处理日期时间\n' +
      'from datetime import datetime, timedelta\n\n' +
      'now = datetime.now()\n' +
      'print(now.strftime("%Y-%m-%d %H:%M:%S"))\n\n' +
      'future = now + timedelta(days=10, hours=2)\n' +
      'print(future.date())\n\n' +
      '# 解析字符串\n' +
      'dt = datetime.strptime("2024-01-15", "%Y-%m-%d")\n' +
      'print(dt.weekday())          # 周一=0\n\n' +
      'import os\n' +
      'print(os.path.exists("."))   # True\n' +
      'print(os.getenv("HOME"))'
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
      'print(re.sub(r"\\d+", "#", text))   # 订单号 # 金额 #',
    example2:
      '# 常用正则模式\n' +
      'import re\n\n' +
      '# 邮箱\n' +
      'emails = ["a@b.com", "not-an-email", "x@y.org.cn"]\n' +
      'pat = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.]+")\n' +
      'valid = [e for e in emails if pat.fullmatch(e)]\n' +
      'print(valid)\n\n' +
      '# 手机号/日期提取\n' +
      'text = "电话 138-1234-5678，生日 1990/08/15"\n' +
      'print(re.findall(r"\\d{3}-\\d{4}-\\d{4}", text))\n' +
      'print(re.search(r"\\d{4}/\\d{2}/\\d{2}", text).group())',
    example3:
      '# 命名分组与替换引用\n' +
      'import re\n' +
      'text = "2024-01-15"\n' +
      '# 命名分组\n' +
      'm = re.match(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})", text)\n' +
      'print(m.groupdict())   # {\'year\': \'2024\', ...}\n\n' +
      '# 替换时引用分组：改成 15/01/2024\n' +
      'new = re.sub(r"(\\d{4})-(\\d{2})-(\\d{2})", r"\\3/\\2/\\1", text)\n' +
      'print(new)\n\n' +
      '# 忽略大小写标志\n' +
      'print(re.search(r"python", "I love Python", re.IGNORECASE).group())'
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
      'print(add5(3))                 # 8',
    example2:
      '# map/filter 惰性迭代器\n' +
      'nums = [1, 2, 3, 4, 5, 6]\n\n' +
      'squares = map(lambda x: x * x, nums)\n' +
      'print(squares)                 # <map object>\n' +
      'print(list(squares))           # [1, 4, 9, 16, 25, 36]\n\n' +
      'evens = filter(lambda x: x % 2 == 0, nums)\n' +
      'print(list(evens))             # [2, 4, 6]\n\n' +
      '# 多序列映射\n' +
      'a = [1, 2, 3]\n' +
      'b = [10, 20, 30]\n' +
      'print(list(map(lambda x, y: x + y, a, b)))  # [11, 22, 33]',
    example3:
      '# itertools 常用组合\n' +
      'from itertools import chain, groupby, permutations\n\n' +
      '# chain 拼接多个迭代器\n' +
      'print(list(chain([1, 2], [3, 4], [5])))\n' +
      '# [1, 2, 3, 4, 5]\n\n' +
      '# groupby 分组（需先排序）\n' +
      'from collections import Counter\n' +
      'words = sorted(["cat", "dog", "car", "door"])\n' +
      'for key, group in groupby(words, key=lambda w: w[0]):\n' +
      '    print(key, list(group))\n\n' +
      '# permutations 排列\n' +
      'print(list(permutations("AB", 2)))   # [(\'A\', \'B\'), (\'B\', \'A\')]'
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
      '        print(line.rstrip())',
    example2:
      '# 写入多行与追加\n' +
      'lines = ["line1", "line2", "line3"]\n\n' +
      '# 一次性写多行\n' +
      'with open("out.txt", "w", encoding="utf-8") as f:\n' +
      '    f.writelines(line + "\\n" for line in lines)\n\n' +
      '# 追加模式\n' +
      'with open("out.txt", "a", encoding="utf-8") as f:\n' +
      '    f.write("line4\\n")\n\n' +
      '# 读取全部/逐行\n' +
      'with open("out.txt", "r", encoding="utf-8") as f:\n' +
      '    print(f.readlines())',
    example3:
      '# 二进制文件与读取技巧\n' +
      '# 写二进制\n' +
      'data = bytearray([0, 1, 2, 255])\n' +
      'with open("bin.dat", "wb") as f:\n' +
      '    f.write(data)\n\n' +
      '# 读二进制\n' +
      'with open("bin.dat", "rb") as f:\n' +
      '    content = f.read()\n' +
      'print(list(content))        # [0, 1, 2, 255]\n\n' +
      '# seek 跳转\n' +
      'with open("out.txt", "r", encoding="utf-8") as f:\n' +
      '    f.seek(0)\n' +
      '    first = f.readline()\n' +
      '    print("第一行:", first.rstrip())'
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
      'print(nums[::2])       # [0, 2, 4]',
    example2:
      '# 负数索引\n' +
      'nums = [10, 20, 30, 40, 50]\n' +
      'print(nums[-1])        # 50 最后一个\n' +
      'print(nums[-2:])       # [40, 50] 最后两个\n' +
      'print(nums[:-1])       # [10, 20, 30, 40] 去掉最后\n\n' +
      '# 反转\n' +
      'print(nums[::-1])      # [50, 40, 30, 20, 10]\n\n' +
      '# 步长\n' +
      'print(nums[1::2])      # [20, 40]\n' +
      'print(nums[::3])       # [10, 40]',
    example3:
      '# 切片赋值（就地修改）\n' +
      'nums = [1, 2, 3, 4, 5]\n' +
      'nums[1:3] = [20, 30]\n' +
      'print(nums)            # [1, 20, 30, 4, 5]\n\n' +
      'nums[2:4] = []         # 删除一块\n' +
      'print(nums)            # [1, 20, 5]\n\n' +
      '# 用切片做浅拷贝\n' +
      'a = [1, 2, 3]\n' +
      'copy = a[:]\n' +
      'copy.append(4)\n' +
      'print(a, copy)         # [1, 2, 3] [1, 2, 3, 4]\n\n' +
      '# slice 对象复用\n' +
      'sli = slice(0, 3)\n' +
      'print([1, 2, 3, 4][sli])   # [1, 2, 3]\n' +
      'print("abcdef"[sli])       # abc'
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
      'print(c is Color.RED)      # True',
    example2:
      '# 显式值与遍历\n' +
      'from enum import Enum\n\n' +
      'class Status(Enum):\n' +
      '    PENDING = 1\n' +
      '    PROCESSING = 2\n' +
      '    DONE = 3\n\n' +
      '# 遍历\n' +
      'for s in Status:\n' +
      '    print(s.name, s.value)\n\n' +
      '# 由值获取成员\n' +
      's = Status(2)\n' +
      'print(s.name)              # PROCESSING\n\n' +
      '# 比较与哈希\n' +
      'print(Status.PENDING == Status.PENDING)\n' +
      'print(Status.PENDING == 1)   # False! 不等同于整数',
    example3:
      '# 带属性的枚举\n' +
      'from enum import Enum\n\n' +
      'class HttpStatus(Enum):\n' +
      '    OK = (200, "成功")\n' +
      '    NOT_FOUND = (404, "未找到")\n' +
      '    SERVER_ERROR = (500, "服务器错误")\n\n' +
      '    def __init__(self, code, msg):\n' +
      '        self.code = code\n' +
      '        self.msg = msg\n' +
      '    def __str__(self):\n' +
      '        return f"{self.code} {self.msg}"\n\n' +
      'r = HttpStatus.NOT_FOUND\n' +
      'print(r.code, r.msg)       # 404 未找到\n' +
      'print(str(r))\n\n' +
      '# 用枚举做分支，避免魔法字符串\n' +
      'def handle(s: HttpStatus):\n' +
      '    if s is HttpStatus.NOT_FOUND:\n' +
      '        return "404 页面"\n' +
      '    return "ok"\n' +
      'print(handle(HttpStatus.NOT_FOUND))'
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
      'a.balance = 100\n' +
      'print(a.balance)      # 100\n' +
      'try:\n' +
      '    a.balance = -5\n' +
      'except ValueError as e:\n' +
      '    print("拒绝:", e)',
    example2:
      '# property 本质是描述符\n' +
      'class Temperature:\n' +
      '    def __init__(self, celsius):\n' +
      '        self._celsius = celsius\n' +
      '    @property\n' +
      '    def fahrenheit(self):\n' +
      '        return self._celsius * 9 / 5 + 32\n' +
      '    @fahrenheit.setter\n' +
      '    def fahrenheit(self, v):\n' +
      '        self._celsius = (v - 32) * 5 / 9\n\n' +
      't = Temperature(100)\n' +
      'print(t.fahrenheit)         # 212.0\n' +
      't.fahrenheit = 32\n' +
      'print(t._celsius)           # 0.0',
    example3:
      '# 懒加载描述符\n' +
      'class Lazy:\n' +
      '    def __init__(self, func):\n' +
      '        self.func = func\n' +
      '        self.name = func.__name__\n' +
      '    def __get__(self, obj, owner):\n' +
      '        if obj is None:\n' +
      '            return self\n' +
      '        value = self.func(obj)\n' +
      '        setattr(obj, self.name, value)  # 缓存\n' +
      '        return value\n\n' +
      'class Data:\n' +
      '    @Lazy\n' +
      '    def expensive(self):\n' +
      '        print("只计算一次...")\n' +
      '        return sum(range(100))\n\n' +
      'd = Data()\n' +
      'print(d.expensive)   # 计算\n' +
      'print(d.expensive)   # 用缓存，不再计算'
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
      'print(list(Registry._items))   # ["Plugin", "A"]',
    example2:
      '# 用元类在类定义时校验/改写\n' +
      'class EnforceNamespace(type):\n' +
      '    def __new__(mcs, name, bases, ns):\n' +
      '        # 要求类提供 name 属性\n' +
      '        if name != "Base" and "name" not in ns:\n' +
      '            raise TypeError(f"{name} 缺少 name 属性")\n' +
      '        return super().__new__(mcs, name, bases, ns)\n\n' +
      'class Base(metaclass=EnforceNamespace):\n' +
      '    pass\n\n' +
      'class Good(Base):\n' +
      '    name = "ok"\n\n' +
      'try:\n' +
      '    class Bad(Base):\n' +
      '        pass\n' +
      'except TypeError as e:\n' +
      '    print("被拦截:", e)',
    example3:
      '# 自动给方法添加前缀（类似骨架）\n' +
      'class AutoPrefix(type):\n' +
      '    def __new__(mcs, name, bases, ns):\n' +
      '        for k in list(ns):\n' +
      '            if k.startswith("do_"):\n' +
      '                ns["api_" + k[3:]] = ns[k]\n' +
      '        return super().__new__(mcs, name, bases, ns)\n\n' +
      'class Service(metaclass=AutoPrefix):\n' +
      '    def do_save(self):\n' +
      '        return "saved"\n\n' +
      's = Service()\n' +
      'print(s.do_save())          # saved\n' +
      'print(s.api_save())         # saved（自动生成的别名）'
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
      'print(handle({"type": "join", "user": "Tom"}))\n' +
      'print(handle([3, 4]))\n' +
      'print(handle("其他"))',
    example2:
      '# 匹配类型与守卫\n' +
      'import math\n\n' +
      'def show(v):\n' +
      '    match v:\n' +
      '        case int(x) if x > 0:\n' +
      '            return f"正整数 {x}"\n' +
      '        case int(x):\n' +
      '            return f"其他整数 {x}"\n' +
      '        case float(x):\n' +
      '            return f"浮点 {x}"\n' +
      '        case str(s):\n' +
      '            return f"字符串: {s}"\n' +
      '        case _:\n' +
      '            return "未知类型"\n\n' +
      'print(show(5))\n' +
      'print(show(-2))\n' +
      'print(show(3.14))\n' +
      'print(show("hi"))',
    example3:
      '# 处理计算结果：根据数学表达式结构分发\n' +
      'def eval_expr(expr):\n' +
      '    match expr:\n' +
      '        case ("add", a, b):\n' +
      '            return eval_expr(a) + eval_expr(b)\n' +
      '        case ("mul", a, b):\n' +
      '            return eval_expr(a) * eval_expr(b)\n' +
      '        case int(n):\n' +
      '            return n\n' +
      '        case _:\n' +
      '            raise ValueError("无法求值")\n\n' +
      '# 表达式: (1 + 2) * 3\n' +
      'expr = ("mul", ("add", 1, 2), 3)\n' +
      'print(eval_expr(expr))   # 9\n\n' +
      '# 匹配多个候选（或模式）\n' +
      'color = "red"\n' +
      'match color:\n' +
      '    case "red" | "green" | "blue":\n' +
      '        print("RGB 颜色")\n' +
      '    case _:\n' +
      '        print("其他")'
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
      '    print("你输入了", line)',
    example2:
      '# 避免重复计算\n' +
      'def expensive_calc():\n' +
      '    print("计算中...")\n' +
      '    return 42\n\n' +
      '# 传统写法（计算两次）\n' +
      '# value = expensive_calc()\n' +
      '# if value > 0: use(value)\n\n' +
      '# 海象写法（只算一次，但保留可用性）\n' +
      'if (value := expensive_calc()) > 0:\n' +
      '    print("得到正数", value)\n\n' +
      '# 在循环条件里使用\n' +
      'chunk_size = 3\n' +
      'items = iter("abcdefgh")\n' +
      'cur = items\n' +
      'import itertools\n' +
      'for chunk in itertools.islice(iter(["abc", "def", "gh"]), 3):\n' +
      '    print(chunk)',
    example3:
      '# while 读取文件片段：既是条件又保留结果\n' +
      'def read(chunk):\n' +
      '    # 模拟返回片段，空串表示结束\n' +
      '    return chunk and chunk[::-1] or ""\n\n' +
      'stream = ["hello ", "world", ""]\n' +
      'idx = 0\n' +
      'while (piece := read(stream[idx] if idx < len(stream) else "")):\n' +
      '    print(piece)\n' +
      '    idx += 1\n\n' +
      '# 在推导式中同时使用多个海象\n' +
      'nums = [1, 4, 9, 16]\n' +
      'roots = [(r := x ** 0.5) for x in nums if r > 2]\n' +
      'print(roots)   # [3.0, 4.0]\n\n' +
      '# 注意海象的优先级：需括号\n' +
      'print((n := 10) + 5)   # 15\n' +
      'print(n)               # 10'
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
      'print(isinstance(5, int | str))   # True',
    example2:
      '# None 联合（等价 Optional）\n' +
      'from typing import Optional\n\n' +
      'def find(key: str) -> str | None:\n' +
      '    table = {"a": "Alpha"}\n' +
      '    return table.get(key)\n\n' +
      'print(find("a"))    # Alpha\n' +
      'print(find("zz"))   # None\n\n' +
      '# 与旧式 Optional 等价\n' +
      'def old(k: str) -> Optional[str]:\n' +
      '    return None\n\n' +
      '# 更丰富的联合\n' +
      'def accept(v: int | float | str) -> str:\n' +
      '    return "数字" if isinstance(v, (int, float)) else "字符串"\n\n' +
      'print(accept(1), accept(2.5), accept("x"))',
    example3:
      '# 联合类型用于容器\n' +
      'from typing import list as _unused   # 示意\n' +
      'def total(values: list[int] | tuple[int, ...]) -> int:\n' +
      '    return sum(values)\n\n' +
      'print(total([1, 2, 3]))\n' +
      'print(total((4, 5)))\n\n' +
      '# isinstance 多类型联合\n' +
      'def normalize(v: int | str):\n' +
      '    if isinstance(v, (int, float)):\n' +
      '        return v\n' +
      '    if isinstance(v, str):\n' +
      '        return v.strip().lower()\n\n' +
      'print(normalize("  Hello "))    # hello\n' +
      'print(normalize(42))            # 42'
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
      'print(f"{y=:.2f}")        # y=3.14',
    example2:
      '# 多个表达式同时调试\n' +
      'a, b, c = 5, 10, 20\n' +
      'print(f"{a=} {b=} {c=}")\n' +
      '# a=5 b=10 c=20\n\n' +
      'total = a + b + c\n' +
      'avg = total / 3\n' +
      'print(f"{total=} {avg=:.2f}")\n\n' +
      '# 列表/字典也能用\n' +
      'items = [1, 2, 3]\n' +
      'd = {"k": "v"}\n' +
      'print(f"{items=} {d=}")',
    example3:
      '# 调试时的格式控制\n' +
      'price = 1234.567\n' +
      'rate = 0.085\n' +
      'tax = price * rate\n' +
      'print(f"{price=:.2f}")\n' +
      'print(f"{rate=:.1%}")     # 百分数格式\n' +
      'print(f"{tax=:.2f}")\n\n' +
      '# 结合字符串宽度对齐调试\n' +
      'name = "Tom"\n' +
      'print(f"{name=:>10}")\n' +
      'print(f"{name=:<10}|")'
  }
];