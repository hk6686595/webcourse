// NumPy 教程 —— 第一部分：环境、ndarray、创建与索引（8 篇）
module.exports = [
  {
    id: 'numpy-intro',
    title: '1. NumPy 是什么与安装',
    category: '入门与安装',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'NumPy 是 Python 科学计算的基础库，提供高性能多维数组对象 ndarray 与丰富的向量化运算函数。',
    detail: [
      'NumPy（Numerical Python）由 Travis Oliphant 在 2005 年合并 Numeric 与 Numarray 起步，现在是 Python 数据科学生态的"基座"：Pandas、Scikit-learn、PyTorch、TensorFlow 几乎所有库的核心数据结构都直接或间接依赖 ndarray。',
      'NumPy 2.x（2024 年发布）清理了大量遗留 API（如 np.float_、np.int_ 等类型别名被移除、np.product 改为 np.prod 警告等），并对 dtypes 系统做了较大重写。教程使用 NumPy 2.0+ 语法，并会在兼容性上提示 1.x 用户的差异。',
      '安装推荐用 pip 或 conda：pip install numpy；conda install numpy。版本查看用 np.__version__。',
      '为什么"用 NumPy 而不是 Python list"：ndarray 在内存中是连续同构的，C 级别实现向量化运算，比纯 Python list 循环快 10~100 倍；并且向量化代码更易读，能让算法描述更接近数学公式。'
    ],
    notes: [
      'import numpy as np 是社区事实标准，几乎所有教程都用 np 简写。',
      'NumPy 2.x 移除了 np.float_、np.complex_、np.bool8 等 Python 类型别名，统一使用 np.float64、np.bool_ 等。',
      '用 conda 安装会自动带 MKL/OpenBLAS 加速库，比 pip 默认的 OpenBLAS 在某些线性代数场景下更稳定。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'print(np.__version__)            # 2.0.x 或 1.26.x\n' +
      'print(np.show_config())         # 查看底层 BLAS / LAPACK 链接信息\n' +
      '\n' +
      '# ====== 性能对比：列表 vs ndarray ======\n' +
      'import time\n' +
      '\n' +
      'n = 1_000_000\n' +
      'py_list = list(range(n))\n' +
      'np_arr = np.arange(n)\n' +
      '\n' +
      '# 纯 Python 求平方和\n' +
      't0 = time.perf_counter()\n' +
      's = sum(x * x for x in py_list)\n' +
      'py_t = time.perf_counter() - t0\n' +
      '\n' +
      '# NumPy 向量化\n' +
      't0 = time.perf_counter()\n' +
      's2 = int((np_arr * np_arr).sum())\n' +
      'np_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"Python 循环: {py_t*1000:.1f} ms")\n' +
      'print(f"NumPy 向量化: {np_t*1000:.1f} ms")\n' +
      'print(f"加速比: {py_t / np_t:.1f}x")\n' +
      '\n' +
      '# 结果一致\n' +
      'assert s == s2',
    example2:
      '# ========== ndarray 是几乎所有数据科学库的"通用货币" ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 1) 直接喂给 matplotlib 画图\n' +
      'import matplotlib.pyplot as plt\n' +
      'x = np.linspace(0, 2 * np.pi, 100)\n' +
      'y = np.sin(x)\n' +
      '# plt.plot(x, y); plt.show()  # 不在这里画，仅演示 ndarray 接口\n' +
      '\n' +
      '# 2) 喂给 PIL 读图\n' +
      'from PIL import Image\n' +
      '# img = np.array(Image.open("cat.png"))   # 形状 (H, W, 3)\n' +
      '\n' +
      '# 3) 喂给 scikit-learn 训练\n' +
      '# from sklearn.linear_model import LinearRegression\n' +
      '# X = np.random.randn(100, 3)             # 100 个样本，3 个特征\n' +
      '# y = X @ np.array([1, 2, 3]) + 0.1 * np.random.randn(100)\n' +
      '# model = LinearRegression().fit(X, y)\n' +
      '\n' +
      'print(type(x), x.shape, x.dtype)\n' +
      'print("NumPy 是数据科学生态的底层通用语言")',
    example3:
      '# ========== NumPy 2.x 兼容小抄 ==========\n' +
      'import numpy as np\n' +
      'print("NumPy 版本:", np.__version__)\n' +
      '\n' +
      '# NumPy 1.x  ->  NumPy 2.x 推荐写法\n' +
      '# np.float_          ->  np.float64        # 移除 Python 别名\n' +
      '# np.complex_        ->  np.complex128\n' +
      '# np.bool8           ->  np.bool_\n' +
      '# np.product(a, 0)   ->  np.prod(a, axis=0)\n' +
      '# np.cumproduct(a)   ->  np.cumprod(a)\n' +
      '# np.alltrue(a)      ->  np.all(a)\n' +
      '# np.sometrue(a)     ->  np.any(a)\n' +
      '# np.in1d(a, b)      ->  np.isin(a, b)\n' +
      '# np.row_stack       ->  np.vstack\n' +
      '# np.trapz(y, x)     ->  np.trapezoid(y, x)\n' +
      '\n' +
      'a = np.array([1.0, 2.0, 3.0])\n' +
      'print(a.dtype, a.prod(), a.cumsum())\n' +
      'print(np.trapezoid(a, dx=0.5))   # 数值积分'
  },
  {
    id: 'numpy-ndarray',
    title: '2. 核心数据结构：ndarray',
    category: '入门与安装',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'ndarray 是同构多维数组：固定 dtype、连续内存、shape 与 axis 描述维度，是 NumPy 一切运算的承载体。',
    detail: [
      'ndarray 的核心属性：ndim（维数）、shape（每维大小）、size（元素总数）、dtype（元素类型）、itemsize（单元素字节数）、nbytes（总字节数 = size * itemsize）、strides（每维步长字节数）。',
      '所有元素 dtype 相同，存放在一块连续内存中，ndarray 只是带"视图元数据"的句柄：data 指针 + dtype + shape + strides 就能定位任意元素。这意味着切片、reshape 几乎不复制数据，只是换了视图。',
      'ndarray 与 Python list 最大的差别：list 是异构、指针数组；ndarray 是同构、值数组。ndarray 支持向量化运算（a + 1），list 不行。',
      'memory layout：默认 C-order（行优先，最后一维连续变化），可用 np.ascontiguousarray 强制 C 序，np.asfortranarray 转 F-order（列优先）。深度学习框架（PyTorch 默认 NCHW）一般使用 C-order。'
    ],
    notes: [
      'shape 是元组 (D0, D1, ..., Dn-1)，len(shape) == ndim。',
      'ndim=0 是标量（0 维数组），np.array(5) 的 ndim=0；常见 1 维 / 2 维 / 3 维。',
      'ndarray 不是线程安全的，多线程操作同一数组需要加锁。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.array([[1, 2, 3],\n' +
      '              [4, 5, 6]])\n' +
      '\n' +
      'print("ndim  :", a.ndim)        # 2\n' +
      'print("shape :", a.shape)       # (2, 3)\n' +
      'print("size  :", a.size)        # 6\n' +
      'print("dtype :", a.dtype)       # int64 (Linux 64-bit 默认)\n' +
      'print("itemsize:", a.itemsize)  # 8 字节\n' +
      'print("nbytes :", a.nbytes)     # 48\n' +
      'print("strides:", a.strides)    # (24, 8) — 行间跳 24 字节，列间跳 8 字节\n' +
      '\n' +
      '# 一维 / 三维 演示\n' +
      'v = np.array([1, 2, 3])\n' +
      'print(v.shape, v.ndim)          # (3,) 1\n' +
      '\n' +
      't = np.zeros((2, 3, 4))\n' +
      'print(t.shape, t.ndim, t.size)  # (2, 3, 4) 3 24',
    example2:
      '# ========== 内存连续性 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(12).reshape(3, 4)\n' +
      'print("C 序连续:", a.flags["C_CONTIGUOUS"])   # True\n' +
      'print("F 序连续:", a.flags["F_CONTIGUOUS"])   # False\n' +
      '\n' +
      '# 转置只是改了 strides，没有复制数据\n' +
      'b = a.T\n' +
      'print("b.shape  :", b.shape)             # (4, 3)\n' +
      'print("b.strides:", b.strides)           # (8, 16)，正好反过来\n' +
      'print("共享内存 ?:", np.shares_memory(a, b))  # True\n' +
      '\n' +
      'b[0, 0] = 999\n' +
      'print(a[0, 0])                           # 999 —— 同一块内存\n' +
      '\n' +
      '# 想真正"独立"就 .copy()\n' +
      'c = a.T.copy()\n' +
      'print("独立 ?:", not np.shares_memory(a, c))  # True',
    example3:
      '# ========== dtype 与字节布局 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 不同 dtype 的内存占用与精度差异\n' +
      'for dtype in [np.int8, np.int16, np.int32, np.int64,\n' +
      '              np.float16, np.float32, np.float64]:\n' +
      '    a = np.zeros(1000, dtype=dtype)\n' +
      '    print(f"{str(dtype):10s}  itemsize={a.itemsize}B  nbytes={a.nbytes}B")\n' +
      '\n' +
      '# 结构化 dtype：模拟一张表\n' +
      'dt = np.dtype([("name", "U10"), ("age", "i4"), ("score", "f4")])\n' +
      'data = np.array([("Tom", 28, 88.5),\n' +
      '                 ("Alice", 24, 92.0)], dtype=dt)\n' +
      'print(data["name"], data["age"], data["score"])\n' +
      '\n' +
      '# 字段排序/筛选\n' +
      'print(data[data["score"] > 90])\n' +
      '\n' +
      '# dtype 决定 ndarray 性能与可表达范围——选错 dtype 是常见性能 bug。'
  },
  {
    id: 'numpy-create',
    title: '3. 数组创建：array / zeros / ones / arange / linspace / full / empty',
    category: '创建与形状',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'NumPy 提供从 Python 序列直接构造、以及用 zeros/ones/empty/arange/linspace 等"工厂函数"批量创建数组的多种方式。',
    detail: [
      '从 Python 序列构造：np.array([...]) / np.array([[...]])，dtype 可省略让 NumPy 自动推断。嵌套层数决定 ndim。',
      '占位创建：np.zeros(shape) 全 0、np.ones(shape) 全 1、np.full(shape, value) 任意填充值、np.empty(shape) 不初始化（速度最快，元素值是内存里的垃圾）。',
      '序列生成：np.arange(start, stop, step) 仿 Python range 但支持浮点步长；np.linspace(start, stop, n) 把区间等分成 n 个点（含端点）；np.logspace 生成对数等距。',
      '特殊矩阵：np.eye(n) 单位矩阵、np.identity(n) 同义、np.diag(v) 构造对角阵或提取对角。',
      '随机数组：np.random 模块（将在 np-random 篇详细讲）。'
    ],
    notes: [
      'np.empty 没有初始化，比 np.zeros 快，但值不可预测；只有在你确定马上要全部覆写时才用。',
      'np.arange(0, 1, 0.1) 在浮点世界有累积误差，需要等距点首选 np.linspace。',
      'dtype 默认 int64/float64；显式声明 dtype=... 常常是性能/内存优化的第一步。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      '# 从 Python 列表构造\n' +
      'a = np.array([1, 2, 3])\n' +
      'b = np.array([[1, 2], [3, 4]], dtype=np.float32)\n' +
      'print(a, a.dtype)\n' +
      'print(b, b.dtype)\n' +
      '\n' +
      '# 占位创建\n' +
      'z = np.zeros((2, 3))         # 2x3 全 0\n' +
      'o = np.ones((3,))            # 长度 3 全 1\n' +
      'f = np.full((2, 2), 7)       # 2x2 全 7\n' +
      'e = np.empty((2, 2))         # 2x2 未初始化\n' +
      'print(z, o, f, e, sep="\\n")\n' +
      '\n' +
      '# 序列生成\n' +
      'print(np.arange(0, 10, 2))     # [0 2 4 6 8]\n' +
      'print(np.arange(5))            # [0 1 2 3 4]\n' +
      'print(np.linspace(0, 1, 5))    # [0.   0.25 0.5  0.75 1.  ]\n' +
      '\n' +
      '# 特殊矩阵\n' +
      'print(np.eye(3))               # 3x3 单位矩阵\n' +
      'print(np.diag([1, 2, 3]))      # 对角阵',
    example2:
      '# ========== 用 _like 创建与已有数组形状一致的数组 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.array([[1, 2, 3], [4, 5, 6]])\n' +
      'print(np.zeros_like(a))      # 与 a 同 shape / dtype 的全 0\n' +
      'print(np.ones_like(a, dtype=np.float32))  # 指定 dtype\n' +
      'print(np.full_like(a, -1))   # 全 -1\n' +
      '\n' +
      '# ========== 网格点 ==========\n' +
      'x = np.linspace(-1, 1, 5)\n' +
      'y = np.linspace(-1, 1, 5)\n' +
      'X, Y = np.meshgrid(x, y)     # (5, 5) 的二维网格\n' +
      'Z = np.sqrt(X**2 + Y**2)\n' +
      'print(Z)\n' +
      '\n' +
      '# ========== 数值范围 ==========\n' +
      'print(np.logspace(0, 3, 4))   # 10**0, 10**1, 10**2, 10**3 -> [1, 10, 100, 1000]\n' +
      'print(np.geomspace(1, 1000, 4))  # 等比 [1, 10, 100, 1000]',
    example3:
      '# ========== 从可迭代对象 / 生成器构造 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 直接吃生成器\n' +
      'gen = (i * i for i in range(5))\n' +
      'a = np.fromiter(gen, dtype=np.int64, count=5)\n' +
      'print(a)                       # [ 0  1  4  9 16]\n' +
      '\n' +
      '# 从文本字符串构造\n' +
      'print(np.fromstring("1 2 3 4", sep=" "))  # [1. 2. 3. 4.]\n' +
      'print(np.fromstring("1,2,3,4", sep=","))\n' +
      '\n' +
      '# 从函数构造\n' +
      'def f(i): return i * 2 + 1\n' +
      'print(np.fromfunction(lambda i, j: i + j, (3, 4), dtype=int))\n' +
      '\n' +
      '# 字节缓冲区\n' +
      'buf = bytes([1, 2, 3, 4])\n' +
      'print(np.frombuffer(buf, dtype=np.uint8))   # [1 2 3 4]\n' +
      '\n' +
      '# 性能小贴士：list -> array 一次性比循环 append 快得多\n' +
      'import time\n' +
      't0 = time.perf_counter()\n' +
      'x = np.array(list(range(1_000_000)))\n' +
      'print(f"array 构造: {(time.perf_counter()-t0)*1000:.1f} ms")'
  },
  {
    id: 'numpy-dtype',
    title: '4. dtype：精确控制数组的存储与精度',
    category: '创建与形状',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'dtype 决定元素的二进制布局、可表达范围与精度。dtype 选择直接决定内存占用、计算精度和向量化速度。',
    detail: [
      '基础 dtype：整数 int8/16/32/64、无符号 uint8/16/32/64、浮点 float16/32/64、复数 complex64/128、布尔 bool_、字符串 <U10、固定字节串 |S10。',
      '类型构造：np.dtype("float32")、np.dtype("i4")、np.int32、np.float64 都可以。Python 内置 int/float 会被自动推断为 np.int64 / np.float64。',
      '类型转换：a.astype(np.int32) 返回新数组（拷贝数据）。astype 默认会做截断（float -> int 截断小数），truncate_cast=False 在 NumPy 2.x 提示。',
      '复数 / 字符串：np.complex64 用两个 float32 表达；字符串 dtype <U10 是 Unicode 固定长度，|S10 是字节串；Pandas 时代更推荐用 object dtype 存 Python 字符串。',
      '结构化 dtype：np.dtype([("name", "U10"), ("age", "i4")]) 类似 C struct，可按字段名访问 data["age"]。'
    ],
    notes: [
      'NumPy 默认 int 推断成 int64（64 位系统），但在 Windows / 32 位 Python 上可能推断成 int32。跨平台代码要显式写 dtype。',
      'float16 (半精度) 内存省一半，深度学习常用；但精度只有 ~3 位十进制，做累加误差很大。',
      'astype() 默认是安全转换（截断 + 溢出报错），但 NaN 转 int 时 np.float64("nan").astype(int) 在不同 NumPy 版本上行为不一，建议先 np.nan_to_num。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      '# 不同 dtype 的范围与精度\n' +
      'print("int8  范围:", np.iinfo(np.int8).min, "~", np.iinfo(np.int8).max)\n' +
      'print("int16 范围:", np.iinfo(np.int16).min, "~", np.iinfo(np.int16).max)\n' +
      'print("int32 范围:", np.iinfo(np.int32).min, "~", np.iinfo(np.int32).max)\n' +
      'print("int64 范围:", np.iinfo(np.int64).min, "~", np.iinfo(np.int64).max)\n' +
      '\n' +
      'print("float16 eps:", np.finfo(np.float16).eps)\n' +
      'print("float32 eps:", np.finfo(np.float32).eps)\n' +
      'print("float64 eps:", np.finfo(np.float64).eps)\n' +
      '\n' +
      '# 显式 dtype\n' +
      'a = np.array([1, 2, 3], dtype=np.int8)        # 节省内存\n' +
      'b = np.array([1.0, 2.0, 3.0], dtype=np.float32)\n' +
      'print(a.dtype, b.dtype)\n' +
      '\n' +
      '# astype 转换\n' +
      'f = np.array([1.7, 2.3, 3.9])\n' +
      'print(f.astype(np.int32))   # 截断: [1 2 3]\n' +
      'print(f.astype(np.int32).dtype)',
    example2:
      '# ========== 字符串与字节串 dtype ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'names = np.array(["Tom", "Alice", "Bob"])\n' +
      'print(names.dtype)               # <U5，自动取最长长度\n' +
      '\n' +
      '# 字节串（节省内存）\n' +
      'b = np.array([b"hello", b"world"])\n' +
      'print(b.dtype)                   # |S5\n' +
      '\n' +
      '# object dtype：可装 Python 对象，但失去向量化\n' +
      'o = np.array([1, "a", 3.14, None], dtype=object)\n' +
      'print(o, o.dtype)\n' +
      '\n' +
      '# ========== datetime 与 timedelta ==========\n' +
      'dates = np.array(["2025-01-01", "2025-01-15", "2025-02-01"], dtype="M8[D]")\n' +
      'print(dates, dates.dtype)        # datetime64[D]\n' +
      'delta = dates[2] - dates[0]\n' +
      'print("相差天数:", delta)        # 31 天',
    example3:
      '# ========== 结构化 dtype 与 record array ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'dt = np.dtype([\n' +
      '    ("id",    np.int32),\n' +
      '    ("name",  "U10"),\n' +
      '    ("score", np.float32),\n' +
      '])\n' +
      '\n' +
      'students = np.array([\n' +
      '    (1, "Tom",     88.5),\n' +
      '    (2, "Alice",   92.0),\n' +
      '    (3, "Bob",     75.5),\n' +
      '], dtype=dt)\n' +
      '\n' +
      'print(students["name"])\n' +
      'print(students["score"].mean())\n' +
      'print(students[students["score"] > 80])\n' +
      '\n' +
      '# view as 不同 dtype：神奇但很危险\n' +
      'raw = np.array([1, 2, 3], dtype=np.int32)\n' +
      'print(raw.view(np.float32))   # 把同一段二进制重新解释成 float，几乎一定是垃圾值\n' +
      '\n' +
      '# 真实场景：神经网络量化、跨语言二进制通信\n' +
      '# numpy_struct_demo_end'
  },
  {
    id: 'numpy-shape',
    title: '5. 形状与重塑：shape / reshape / ravel / transpose / T',
    category: '创建与形状',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'ndarray 的形状决定如何解释内存；reshape / ravel / transpose / T 都是通过调整元数据（shape/strides）来"换视图"，多数情况下不复制数据。',
    detail: [
      'a.shape 返回元组，可以赋值改形状：a.shape = (3, 4) 直接重塑（要求元素总数一致）。',
      'a.reshape(new_shape) 返回新数组视图；某个维度写 -1 自动推断；reshape 在内存不连续时会隐式 copy。',
      'a.ravel() / a.flatten() 拍平成 1 维：ravel 默认返回视图（可能 copy），flatten 总返回拷贝。',
      '转置：a.T 是 axes 反转；np.transpose(a, axes) 可以任意调换维度（如图像 NHWC -> NCHW）。',
      '增加 / 删除维度：a[np.newaxis, :] 加一维；np.squeeze(a) 删长度为 1 的维度；np.expand_dims(a, axis=k) 在 k 位置插 1 维。'
    ],
    notes: [
      'reshape 与 T / transpose 经常"共享内存"，修改一个会污染另一个，要真正独立用 .copy()。',
      'np.reshape 与 a.reshape 等价；前者是函数，后者是方法。',
      '图像数据常用 (H, W, C) 或 (N, H, W, C) (NHWC) 表示，深度学习框架默认 NCHW：np.transpose(x, (0, 3, 1, 2))。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(12)               # [0 1 ... 11]\n' +
      'print(a.shape)                  # (12,)\n' +
      '\n' +
      'b = a.reshape(3, 4)\n' +
      'print(b)\n' +
      'print(b.shape)                  # (3, 4)\n' +
      'print("共享内存?", np.shares_memory(a, b))  # True\n' +
      '\n' +
      'c = a.reshape(3, -1)            # -1 自动推断\n' +
      'print(c.shape)                  # (3, 4)\n' +
      '\n' +
      '# 1D -> 2D -> 1D\n' +
      'd = a.reshape(2, 6).ravel()\n' +
      'print(d)                        # 拍平回 1D\n' +
      'print("共享内存?", np.shares_memory(a, d))   # True\n' +
      '\n' +
      '# 转置\n' +
      'e = np.arange(6).reshape(2, 3)\n' +
      'print(e.T)                      # shape (3, 2)',
    example2:
      '# ========== 维度增删：newaxis / squeeze / expand_dims ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(5)\n' +
      'print(a.shape)                      # (5,)\n' +
      '\n' +
      'row = a[np.newaxis, :]              # (1, 5)\n' +
      'col = a[:, np.newaxis]              # (5, 1)\n' +
      'print(row.shape, col.shape)\n' +
      '\n' +
      'b = np.zeros((1, 5, 1, 3))\n' +
      'print("压缩前:", b.shape)           # (1, 5, 1, 3)\n' +
      'print("压缩后:", np.squeeze(b).shape)  # (5, 3)\n' +
      '\n' +
      'c = np.expand_dims(a, axis=0)       # (1, 5)\n' +
      'd = np.expand_dims(a, axis=1)       # (5, 1)\n' +
      'print(c.shape, d.shape)\n' +
      '\n' +
      '# ========== 转置调维度 ==========\n' +
      'img = np.random.rand(2, 4, 5, 3)    # N, H, W, C\n' +
      'chw = np.transpose(img, (0, 3, 1, 2))   # N, C, H, W\n' +
      'print(img.shape, "->", chw.shape)',
    example3:
      '# ========== reshape vs resize vs copy ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(6)\n' +
      '\n' +
      'b = a.reshape(2, 3)\n' +
      'b[0, 0] = 999\n' +
      'print(a[0])              # 999，共享内存\n' +
      '\n' +
      'c = a.reshape(2, 3).copy()\n' +
      'c[0, 0] = 0\n' +
      'print(a[0])              # 999，a 不变\n' +
      '\n' +
      '# np.resize 行为不同：填不满就循环填充，会复制\n' +
      'd = np.resize(a, (4, 4))\n' +
      'print(d)\n' +
      '\n' +
      '# a.resize((4, 4)) 原地修改，超出部分用 0 填充\n' +
      'a2 = np.arange(6)\n' +
      'a2.resize((4, 4), refcheck=False)\n' +
      'print(a2)\n' +
      '\n' +
      '# flat 与 iterator\n' +
      'arr = np.arange(6).reshape(2, 3)\n' +
      'for x in arr.flat:\n' +
      '    pass  # 按 C 序逐元素迭代'
  },
  {
    id: 'numpy-index',
    title: '6. 基础索引与切片：单元素 / 切片 / ... / 多维',
    category: '索引与切片',
    version: 'NumPy 2.x',
    level: '入门',
    summary: 'ndarray 的多维索引语法：a[i, j] / a[i][j] / a[slice] / 省略号 ... / 一维 vs 多维语义。',
    detail: [
      '多维索引：a[i, j] 等价 a[i][j]（前者更快，返回视图，后者先 a[i] 切一层再切第二层）。',
      '切片语法与 Python 一致：start:stop:step；多维可同时切片 a[1:3, ::-1, 2:5:2]。',
      '省略号 ... 展开为 "把所有未指定的轴都取 :"：3D 中 a[..., 0] 等价 a[:, :, 0]。',
      '整数索引 vs 切片混合：切片是视图，整数索引是拷贝（a[0] 返回新数组，a[0:1] 返回视图）。',
      'NumPy 1.x 与 2.x 行为一致，没有破坏性变更。'
    ],
    notes: [
      '多维数组用 a[i, j] 比 a[i][j] 快且更地道，少一层中间数组。',
      'a[0] 返回 1 维数组（行），a[0, :] 显式表达；a[:, 0] 返回 1 维数组（列）。',
      'np.newaxis / None 是给维度占位的标准方法。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(24).reshape(2, 3, 4)\n' +
      'print(a)\n' +
      '\n' +
      'print("a[0, 1, 2] :", a[0, 1, 2])\n' +
      'print("a[0][1][2]:", a[0][1][2])\n' +
      'print("a[1, -1]  :", a[1, -1])         # 最后一行\n' +
      '\n' +
      '# 切片\n' +
      'print("a[0, :, 1:3]:")\n' +
      'print(a[0, :, 1:3])\n' +
      '\n' +
      'print("a[..., 0]:")                    # 等价 a[:, :, 0]\n' +
      'print(a[..., 0])\n' +
      '\n' +
      '# 步长\n' +
      'print("a[::2, ::-1, 1::2]:")\n' +
      'print(a[::2, ::-1, 1::2])',
    example2:
      '# ========== 视图 vs 拷贝 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(12).reshape(3, 4)\n' +
      '\n' +
      'row = a[1]                 # 1 维整数索引：拷贝\n' +
      'row[0] = 999\n' +
      'print(a[1, 0])             # 0，a 没变\n' +
      '\n' +
      'row_view = a[1, :]         # 切片：视图\n' +
      'row_view[0] = 999\n' +
      'print(a[1, 0])             # 999，a 被改\n' +
      '\n' +
      'col_view = a[:, 0]\n' +
      'col_view[1] = 888\n' +
      'print(a[1, 0])             # 888\n' +
      '\n' +
      'b = a[[0, 2]]              # 花式索引：拷贝\n' +
      'b[0, 0] = -1\n' +
      'print(a[0, 0])             # 原值没变',
    example3:
      '# ========== 省略号 ... 与 newaxis 配合 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'img = np.random.rand(3, 32, 32)   # C, H, W\n' +
      'flat = img.reshape(-1)            # 全部像素拍平\n' +
      'print(flat.shape)                 # (3072,)\n' +
      '\n' +
      '# 取第一个通道所有像素\n' +
      'ch0 = img[0]\n' +
      'print(ch0.shape)                  # (32, 32)\n' +
      '\n' +
      '# 加 batch 维\n' +
      'batched = img[np.newaxis, ...]\n' +
      'print(batched.shape)              # (1, 3, 32, 32)\n' +
      '\n' +
      '# 通道移到末尾：CHW -> HWC（matplotlib 期望）\n' +
      'hwc = np.transpose(img, (1, 2, 0))\n' +
      'print(hwc.shape)                  # (32, 32, 3)\n' +
      '\n' +
      '# 实战：用一个三维数组做"按通道归一化"\n' +
      'mean = img.mean(axis=(1, 2), keepdims=True)   # (3, 1, 1)\n' +
      'std  = img.std(axis=(1, 2), keepdims=True)\n' +
      'norm = (img - mean) / (std + 1e-8)\n' +
      'print(norm.shape, norm.mean(axis=(1,2)))'
  },
  {
    id: 'numpy-bool-index',
    title: '7. 布尔索引与花式索引：用条件筛数据',
    category: '索引与切片',
    version: 'NumPy 2.x',
    level: '入门',
    summary: '布尔掩码 (mask) 和整数数组 (fancy index) 是 NumPy 最强大的两种"取子集"方式，分别对应"按条件筛"和"按位置挑"。',
    detail: [
      '布尔索引：a[mask]，mask 是与 a 形状相同的 bool 数组。常用比较运算 (a > 0)、逻辑运算 (a > 0) & (a < 10)、np.isnan 等。',
      '返回的是新数组（拷贝），不是视图。',
      'np.where(cond, x, y) 是 if-else 向量化版本：cond 为真取 x，否则取 y。np.where(cond) 只给 cond 时返回 True 的下标元组。',
      'np.nonzero 等价 np.where(cond)；np.argwhere 返回形状 (n, ndim) 的下标数组。',
      '花式索引：a[[0, 2, 4]]、a[[0, 1], [2, 3]] 选 (0,2) 和 (1,3)。返回拷贝。多维花式索引对应位置配对。',
      'np.take / np.compress 是花式索引的函数形式。'
    ],
    notes: [
      '逻辑运算必须用 &、|、~，不要用 and / or / not（它们对整个数组的真值会触发 ValueError）。',
      '多条件注意加括号：((a > 0) & (a < 10))。',
      '花式索引和切片同时使用：a[[0, 2], 1:4] 选第 0、2 行的列 1-3。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.array([3, 1, 4, 1, 5, 9, 2, 6, 5, 3])\n' +
      '\n' +
      'mask = a > 3\n' +
      'print(mask)                        # [False False  True False  True  True False  True  True False]\n' +
      'print(a[mask])                     # [4 5 9 6 5]\n' +
      '\n' +
      '# 一次筛选\n' +
      'print(a[(a > 2) & (a < 7)])        # [3 4 5 6 5 3]\n' +
      '\n' +
      '# np.where\n' +
      'print(np.where(a > 5))             # (array([5, 7]),)\n' +
      'print(np.where(a > 5, 1, 0))       # 把 a>5 的位置换 1，其余换 0\n' +
      '\n' +
      '# 花式索引\n' +
      'print(a[[0, 4, 8]])                # [3 5 5]\n' +
      'print(a[np.array([9, 0, 1])])      # [3 3 1]\n' +
      '\n' +
      '# 二维花式索引\n' +
      'm = np.arange(12).reshape(3, 4)\n' +
      'print(m[[0, 2], [1, 3]])           # 取 (0,1) 和 (2,3) -> [1, 11]',
    example2:
      '# ========== 多条件、NaN、Inf 处理 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'data = np.array([1.0, np.nan, 3.0, np.inf, -np.inf, 5.0])\n' +
      '\n' +
      '# 找 NaN\n' +
      'print("NaN 位置:", np.where(np.isnan(data)))\n' +
      '\n' +
      '# 替换 NaN 为 0\n' +
      'clean = np.where(np.isnan(data), 0, data)\n' +
      'print(clean)\n' +
      '\n' +
      '# 找异常：超出 mean ± 3*std\n' +
      'arr = np.random.randn(1000)\n' +
      'outliers = arr[np.abs(arr - arr.mean()) > 3 * arr.std()]\n' +
      'print("异常值数:", len(outliers))\n' +
      '\n' +
      '# 同时多条件\n' +
      'x = np.linspace(-3, 3, 7)\n' +
      'print(x[(x > -1) & (x < 1)])       # (-1, 1) 区间\n' +
      '\n' +
      '# 按列分别取阈值\n' +
      'M = np.random.randn(4, 3)\n' +
      'col_thresh = np.array([0.1, 0.0, -0.1])\n' +
      'M2 = M[(M > col_thresh).all(axis=1)]\n' +
      'print(M2.shape)',
    example3:
      '# ========== 花式索引进阶：用它做"查表" ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 0/1 编码的标签数组，转 one-hot\n' +
      'labels = np.array([0, 2, 1, 3, 2, 0])\n' +
      'n_class = 4\n' +
      'onehot = np.eye(n_class)[labels]\n' +
      'print(onehot)\n' +
      '\n' +
      '# 用查表做数据离散化（bin）\n' +
      'values = np.array([3, 15, 27, 8, 41, 22])\n' +
      'bins = np.array([0, 10, 20, 30, 40, 50])\n' +
      'bucket = np.digitize(values, bins) - 1\n' +
      'print("每个值落入的桶:", bucket)   # [0 1 2 0 4 2]\n' +
      '\n' +
      '# 用 np.put / np.take 做高性能查表\n' +
      'table = np.array([0, 1, 1, 2, 2, 2, 3, 3, 3, 3])  # 频率桶\n' +
      'idx = np.array([2, 5, 8, 1, 0])\n' +
      'print(np.take(table, idx))         # [1 2 3 1 0]\n' +
      '\n' +
      '# 选数据集中前 10% 大的数\n' +
      'big = np.random.randn(1000)\n' +
      'thr = np.percentile(big, 90)\n' +
      'print(big[big >= thr].size)        # 100\n' +
      '\n' +
      '# 用 np.argwhere 找非零坐标\n' +
      'M = np.eye(3, dtype=bool)\n' +
      'print(np.argwhere(M))              # [[0 0] [1 1] [2 2]]'
  },
  {
    id: 'numpy-ufunc',
    title: '8. 通用函数 ufunc：逐元素向量化',
    category: '运算',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: 'ufunc（universal function）是 NumPy 的灵魂：对 ndarray 逐元素运算的 C 级别向量化函数。算术、比较、数学函数全部向量化。',
    detail: [
      'ufunc 的关键属性：element-wise、broadcasting、reduce、accumulate、outer。',
      '算术：+、-、*、/、//、%、** 都已重载；a + 1 等价 np.add(a, 1)。',
      '数学函数：np.sin/cos/tan/exp/log/sqrt/abs/power/floor/ceil/round。',
      '比较：a > 0、a == b 返回 bool 数组；np.equal / np.greater 等函数等价。',
      'reduce：np.add.reduce(a) 等价 a.sum()；np.multiply.reduce(a) 等价 a.prod()。accumulate 是前缀和/积。',
      'outer：np.multiply.outer(a, b) 生成 (len(a), len(b)) 的乘法表，是构造 Gram 矩阵等场景的利器。',
      '自定义 ufunc：用 np.frompyfunc 包装普通函数（但慢），用 numba/numpy.vectorize 加速。'
    ],
    notes: [
      'ufunc 永远返回新数组（除了 reduce/accumulate 显式 out=）。',
      'a + b 比 np.add(a, b) 略快（操作符直接走 C 路径）。',
      '遇到 NaN 时大多数 ufunc 会传染（NaN + 1 = NaN）；用 np.nanmean、np.nansum 等变体会忽略 NaN。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.array([0.0, np.pi/2, np.pi, 3*np.pi/2])\n' +
      'print("sin :", np.sin(a))             # [0. 1. 0. -1.]\n' +
      'print("cos :", np.cos(a))             # [1. 0. -1. 0.]\n' +
      'print("exp :", np.exp([0, 1, 2]))     # [1.  2.718  7.389]\n' +
      'print("log :", np.log([1, np.e, np.e**2]))\n' +
      'print("sqrt:", np.sqrt([1, 4, 9, 16]))\n' +
      '\n' +
      '# 算术\n' +
      'x = np.array([1, 2, 3, 4])\n' +
      'print(x + 10, x * x, x ** 2, 1 / x)\n' +
      '\n' +
      '# 三角函数族\n' +
      'angles = np.linspace(0, 2*np.pi, 9)\n' +
      'print(np.sin(angles), np.cos(angles), np.tan(angles), sep="\\n")\n' +
      '\n' +
      '# 比较返回 bool\n' +
      'print(x > 2)                          # [False False  True  True]',
    example2:
      '# ========== reduce / accumulate / outer ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.array([1, 2, 3, 4])\n' +
      'print("add.reduce :", np.add.reduce(a))         # 10（求和）\n' +
      'print("mult.reduce :", np.multiply.reduce(a))   # 24（求积）\n' +
      'print("add.accumulate:", np.add.accumulate(a))   # [ 1  3  6 10] 前缀和\n' +
      '\n' +
      'b = np.arange(1, 7).reshape(2, 3)\n' +
      'print("按行累加:", np.add.reduce(b, axis=1))     # [3 12]\n' +
      'print("按列累乘:", np.multiply.reduce(b, axis=0))# [4 10 18]\n' +
      '\n' +
      '# outer：乘法表 / Gram 矩阵\n' +
      'u = np.array([1, 2, 3])\n' +
      'v = np.array([10, 20])\n' +
      'print(np.multiply.outer(u, v))      # [[10 20] [20 40] [30 60]]\n' +
      '\n' +
      '# 距离矩阵\n' +
      'pts = np.array([[0, 0], [1, 0], [0, 1]])\n' +
      'diff = pts[:, np.newaxis, :] - pts[np.newaxis, :, :]\n' +
      'dist = np.sqrt((diff ** 2).sum(axis=-1))\n' +
      'print(dist)',
    example3:
      '# ========== 自定义 ufunc 与 out= 复用内存 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 普通函数用 np.vectorize 装饰（慢，但接口友好）\n' +
      '@np.vectorize\n' +
      'def myfunc(x, y):\n' +
      '    return x * 2 + y\n' +
      '\n' +
      'print(myfunc(np.array([1, 2, 3]), np.array([10, 20, 30])))\n' +
      '\n' +
      '# out= 复用内存：避免大数组的额外分配\n' +
      'big = np.random.randn(10_000_000)\n' +
      'result = np.empty_like(big)\n' +
      'np.sin(big, out=result)            # 复用 result 的内存\n' +
      'print(result.shape)\n' +
      '\n' +
      '# 性能对比：with/without out\n' +
      'import time\n' +
      't0 = time.perf_counter()\n' +
      'for _ in range(10):\n' +
      '    np.sin(big)\n' +
      'print(f"无 out: {(time.perf_counter()-t0)*1000:.1f} ms")\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'for _ in range(10):\n' +
      '    np.sin(big, out=result)\n' +
      'print(f"有 out: {(time.perf_counter()-t0)*1000:.1f} ms")'
  }
];
