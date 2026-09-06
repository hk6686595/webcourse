// Pandas 教程 —— 第一部分：环境、数据结构、读写、索引、缺失值、类型与 apply（7 篇）
module.exports = [
  {
    id: 'pd-intro',
    title: '1. Pandas 是什么与安装',
    category: '入门与安装',
    version: 'Pandas 2.x',
    level: '入门',
    summary: 'Pandas 是 Python 表格与时间序列分析的"事实标准"库：Series（一维）+ DataFrame（二维）覆盖绝大多数数据分析场景。',
    detail: [
      'Pandas 由 Wes McKinney 2008 年在 AQR 资本发起，名字来自 Panel Data（计量经济学术语），现在由 NumFOCUS 托管，是 Python 数据科学生态最常用的库。',
      'Pandas 2.x（2023+）引入 Apache Arrow 后端、Copy-on-Write 改进、可空 dtype（pd.ArrowDtype / pd.StringDtype），并改进 Nullable 整型与字符串类型。教程使用 Pandas 2.2+ 语法。',
      '三大数据结构：Series（一维带标签）、DataFrame（二维带行列标签）、Index（轴标签管理器）。Panel 已被弃用。',
      '安装：pip install pandas；科学计算栈一键到位：pip install numpy pandas matplotlib scikit-learn jupyter。conda 用户用 conda install pandas。',
      '导包约定：import pandas as pd。',
      'Pandas 不是 NumPy 的替代品：底层大量调用 NumPy，但提供了 SQL 风格的高层 API（groupby、join、pivot、resample 等）。'
    ],
    notes: [
      'pd.options.display.max_rows / max_columns 控制打印行/列数。',
      'Pandas 2.x 引入 Copy-on-Write 后，链式赋值（df["a"]["i"] = ...）警告会变成更严格的错误，写法上多用 .loc。',
      '教程里的代码使用最新版 API，但兼容 1.5+。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'print("pandas 版本:", pd.__version__)\n' +
      'print("numpy 版本 :", np.__version__)\n' +
      '\n' +
      '# 全局显示选项\n' +
      'pd.options.display.max_rows = 10\n' +
      'pd.options.display.precision = 2\n' +
      'pd.options.display.width = 80\n' +
      '\n' +
      '# 一个最小 DataFrame\n' +
      'df = pd.DataFrame({\n' +
      '    "name": ["Tom", "Alice", "Bob"],\n' +
      '    "age":  [28,    24,      31],\n' +
      '    "city": ["BJ",  "SH",    "SZ"],\n' +
      '})\n' +
      'print(df)\n' +
      '\n' +
      '# 常用速查\n' +
      'print("\\ndf.shape  :", df.shape)\n' +
      'print("df.dtypes :\\n", df.dtypes)\n' +
      'print("df.index  :", df.index.tolist())\n' +
      'print("df.columns:", df.columns.tolist())',
    example2:
      '# ========== 与 NumPy 衔接 ==========\n' +
      'import numpy as np\n' +
      'import pandas as pd\n' +
      '\n' +
      '# ndarray -> DataFrame\n' +
      'arr = np.arange(12).reshape(3, 4)\n' +
      'df = pd.DataFrame(arr, columns=list("ABCD"), index=["x", "y", "z"])\n' +
      'print(df)\n' +
      '\n' +
      '# DataFrame -> ndarray\n' +
      'back = df.values                # 旧 API（仍可用，但建议 .to_numpy()）\n' +
      'back2 = df.to_numpy()\n' +
      'print("ndarray:\\n", back2)\n' +
      '\n' +
      '# 字典 -> DataFrame（最常见）\n' +
      'data = [\n' +
      '    {"name": "Tom",   "age": 28, "score": 88.5},\n' +
      '    {"name": "Alice", "age": 24, "score": 92.0},\n' +
      '    {"name": "Bob",   "age": 31, "score": 75.5},\n' +
      ']\n' +
      'df = pd.DataFrame(data).set_index("name")\n' +
      'print(df)\n' +
      'print("Tom 的 score:", df.loc["Tom", "score"])',
    example3:
      '# ========== 查看数据的基本方法 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "A": np.random.randn(100),\n' +
      '    "B": np.random.randint(0, 100, 100),\n' +
      '    "C": pd.date_range("2024-01-01", periods=100),\n' +
      '    "D": np.where(np.random.rand(100) > 0.7, np.nan, np.random.rand(100)),\n' +
      '})\n' +
      '\n' +
      'print("head(3):\\n", df.head(3))\n' +
      'print("\\ntail(2):\\n", df.tail(2))\n' +
      'print("\\ninfo() :\\n")\n' +
      'df.info()\n' +
      'print("\\ndescribe():\\n", df.describe())\n' +
      '\n' +
      '# 各列 dtype 概览\n' +
      'print("\\n每列缺失值数:\\n", df.isna().sum())\n' +
      '\n' +
      '# 一行风格的快速诊断\n' +
      'print("\\nA 列分位数:\\n", df["A"].quantile([0.25, 0.5, 0.75, 0.95]))'
  },
  {
    id: 'pd-structures',
    title: '2. 核心数据结构：Series 与 DataFrame',
    category: '入门与安装',
    version: 'Pandas 2.x',
    level: '入门',
    summary: 'Series 是带索引的一维数组，DataFrame 是带行列索引的二维表；二者共享 Index 体系，理解 Index 是掌握 Pandas 的关键。',
    detail: [
      'Series：data + index + dtype + name。data 可以是 list / ndarray / dict / scalar。',
      'DataFrame：列有序的 Series 集合；每列 dtype 可以不同（Python list 异构、NumPy 数组同构的折中）。',
      'Index：行/列标签的容器；常见子类：RangeIndex（默认）、Int64Index、DatetimeIndex、PeriodIndex、MultiIndex、Float64Index。Index 不可变、支持集合运算（交、并、差、对称差）。',
      '创建方式：pd.DataFrame(dict)、pd.DataFrame(list_of_dict)、pd.DataFrame(ndarray, columns=..., index=...)、pd.read_csv/read_parquet 等。',
      'dtype 大变样：Pandas 2.x 推荐用 pd.StringDtype()、pd.BooleanDtype()、Int64（大写 I，可空）来支持真正的"可空"语义。'
    ],
    notes: [
      'Series 既有 index 又有 name；DataFrame 的列也有 name。',
      'df.values / df.to_numpy() 默认统一成一种 dtype（object），列类型信息丢失；用 df.dtypes 才能看到列级类型。',
      'Index 不可变（immutable）但可以整体替换：df.index = new_idx。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      '# ====== Series ======\n' +
      's = pd.Series([10, 20, 30], index=["a", "b", "c"], name="score")\n' +
      'print(s)\n' +
      'print("values:", s.values, "index:", s.index.tolist(), "dtype:", s.dtype)\n' +
      '\n' +
      '# 从 dict 构造\n' +
      's2 = pd.Series({"Tom": 28, "Alice": 24, "Bob": 31}, name="age")\n' +
      'print(s2)\n' +
      '\n' +
      '# ====== DataFrame ======\n' +
      'df = pd.DataFrame({\n' +
      '    "age":   [28, 24, 31],\n' +
      '    "score": [88, 92, 75],\n' +
      '}, index=["Tom", "Alice", "Bob"])\n' +
      'print(df)\n' +
      'print("index :", df.index.tolist())\n' +
      'print("columns:", df.columns.tolist())\n' +
      'print("dtypes:\\n", df.dtypes)',
    example2:
      '# ========== 从不同数据源构造 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      '# 从 list of dict\n' +
      'df1 = pd.DataFrame([\n' +
      '    {"name": "Tom",   "age": 28},\n' +
      '    {"name": "Alice", "age": 24},\n' +
      '    {"name": "Bob",   "age": 31},\n' +
      '])\n' +
      '\n' +
      '# 从 ndarray + 列名 + 索引\n' +
      'df2 = pd.DataFrame(\n' +
      '    np.random.rand(4, 3),\n' +
      '    columns=["A", "B", "C"],\n' +
      '    index=pd.date_range("2024-01-01", periods=4),\n' +
      ')\n' +
      '\n' +
      '# 从 dict of Series（自动对齐）\n' +
      's1 = pd.Series([1, 2, 3], index=["a", "b", "c"])\n' +
      's2 = pd.Series([10, 20, 30], index=["b", "c", "d"])\n' +
      'df3 = pd.DataFrame({"x": s1, "y": s2})\n' +
      'print("自动对齐（缺失为 NaN）:\\n", df3)\n' +
      '\n' +
      '# 从 zip\n' +
      'rows = list(zip(["Tom", "Alice", "Bob"], [28, 24, 31]))\n' +
      'df4 = pd.DataFrame(rows, columns=["name", "age"])\n' +
      'print(df4)',
    example3:
      '# ========== Index 体系与不可变性 ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      'idx = pd.Index(["a", "b", "c", "b"])\n' +
      'print("Index:", idx)\n' +
      'print("类型  :", type(idx).__name__)\n' +
      'print("重复  :", idx.duplicated().tolist())\n' +
      'print("唯一  :", idx.unique().tolist())\n' +
      '\n' +
      '# 集合运算\n' +
      'i1 = pd.Index([1, 2, 3, 4])\n' +
      'i2 = pd.Index([3, 4, 5, 6])\n' +
      'print("intersection:", i1.intersection(i2).tolist())\n' +
      'print("union       :", i1.union(i2).tolist())\n' +
      'print("difference  :", i1.difference(i2).tolist())\n' +
      '\n' +
      '# 不可变\n' +
      'try:\n' +
      '    idx[0] = "z"\n' +
      'except TypeError as e:\n' +
      '    print("Index 不可写:", e)\n' +
      '\n' +
      '# 但可以整体替换\n' +
      'df = pd.DataFrame({"a": [1, 2, 3]})\n' +
      'df.index = ["x", "y", "z"]\n' +
      'print(df)\n' +
      '\n' +
      '# MultiIndex 预览\n' +
      'midx = pd.MultiIndex.from_product([["A", "B"], [1, 2]], names=["letter", "n"])\n' +
      's = pd.Series([10, 20, 30, 40], index=midx)\n' +
      'print("\\nMultiIndex:\\n", s)\n' +
      'print("选 A 全部:", s.loc["A"].tolist())'
  },
  {
    id: 'pd-readwrite',
    title: '3. 读写数据：CSV / Excel / JSON / Parquet / SQL',
    category: '数据读写',
    version: 'Pandas 2.x',
    level: '入门',
    summary: 'Pandas 提供统一的 IO 工具集：read_csv / read_excel / read_json / read_parquet / read_sql，能覆盖绝大多数数据源读取。',
    detail: [
      'CSV：pd.read_csv(path, sep=",", header=0, index_col=None, usecols=[...], dtype={...}, parse_dates=[...], nrows=...)。',
      '常用参数：sep/delimiter、encoding（utf-8 / gbk / latin1）、na_values、parse_dates、dtype、usecols、nrows、chunksize（迭代读大文件）。',
      '写出：df.to_csv(path, index=False, encoding="utf-8")。',
      'Excel：pd.read_excel(path, sheet_name=...) / df.to_excel(path, sheet_name=..., index=False)，需要 openpyxl。',
      'JSON：pd.read_json / df.to_json(orient="records")；复杂 JSON 树用 pd.json_normalize。',
      'Parquet：列式二进制格式，比 CSV 小很多且带 schema；pip install pyarrow 或 fastparquet。df.to_parquet / pd.read_parquet。',
      'SQL：pd.read_sql(sql, con) / df.to_sql(name, con, if_exists="replace")，需要 sqlalchemy 或 sqlite3。',
      'Pickle：df.to_pickle / pd.read_pickle，Pandas 自有格式，速度快、保留类型，但只在 Python 内可读。'
    ],
    notes: [
      'pd.read_csv 默认 utf-8 编码；中文 CSV 多见 gbk，加 encoding="gbk"。',
      '大文件用 chunksize 迭代：for chunk in pd.read_csv(path, chunksize=10000): ...。',
      'read_csv 与 to_csv 默认带 index；为了清洁通常 index=False。',
      'parquet 比 CSV 节省 5~10 倍空间、保留 dtype，是数据中转和归档的优选。'
    ],
    example:
      'import pandas as pd\n' +
      'import io\n' +
      '\n' +
      'csv = """\\\n' +
      'id,name,age,score\n' +
      '1,Tom,28,88.5\n' +
      '2,Alice,24,92.0\n' +
      '3,Bob,31,75.0\n' +
      '"""\n' +
      '\n' +
      '# 读 CSV\n' +
      'df = pd.read_csv(io.StringIO(csv))\n' +
      'print(df)\n' +
      'print("dtypes:\\n", df.dtypes)\n' +
      '\n' +
      '# 显式控制：指定列、类型、解析日期\n' +
      'csv2 = """\\\n' +
      'id,date,price\n' +
      '1,2024-01-01,9.95\n' +
      '2,2024-01-02,10.10\n' +
      '"""\n' +
      'df2 = pd.read_csv(\n' +
      '    io.StringIO(csv2),\n' +
      '    parse_dates=["date"],\n' +
      '    dtype={"id": "int32", "price": "float32"},\n' +
      ')\n' +
      'print("\\ndf2:\\n", df2)\n' +
      'print(df2.dtypes)',
    example2:
      '# ========== JSON 与 Excel ==========\n' +
      'import pandas as pd\n' +
      'import json\n' +
      '\n' +
      '# 嵌套 JSON：订单 + 商品\n' +
      'raw = {\n' +
      '    "order_id": 1001,\n' +
      '    "customer": "Tom",\n' +
      '    "items": [\n' +
      '        {"sku": "A", "qty": 2, "price": 9.5},\n' +
      '        {"sku": "B", "qty": 1, "price": 19.9},\n' +
      '    ],\n' +
      '}\n' +
      'df_items = pd.json_normalize(raw, record_path="items", meta=["order_id", "customer"])\n' +
      'print("展开后:\\n", df_items)\n' +
      '\n' +
      '# JSON 写出：orient="records"\n' +
      'records = df_items.to_dict(orient="records")\n' +
      'print("\\nto_json:", json.dumps(records, ensure_ascii=False))\n' +
      '\n' +
      '# Excel 需要 openpyxl；这里只演示 to_excel 的参数形态\n' +
      '# df_items.to_excel("items.xlsx", index=False, sheet_name="items")\n' +
      '# pd.read_excel("items.xlsx", sheet_name="items")\n' +
      '\n' +
      '# Parquet（需 pyarrow）\n' +
      'try:\n' +
      '    import pyarrow as pa  # noqa: F401\n' +
      '    df_items.to_parquet("items.parquet", index=False)\n' +
      '    back = pd.read_parquet("items.parquet")\n' +
      '    print("parquet 读回:\\n", back)\n' +
      '    import os; os.remove("items.parquet")\n' +
      'except ImportError:\n' +
      '    print("未安装 pyarrow，跳过 parquet（pip install pyarrow 即可）")',
    example3:
      '# ========== SQL 与大文件 chunk 读取 ==========\n' +
      'import pandas as pd\n' +
      'import sqlite3\n' +
      'import io\n' +
      '\n' +
      '# 内存 SQLite 演示\n' +
      'con = sqlite3.connect(":memory:")\n' +
      'df = pd.DataFrame({\n' +
      '    "id": [1, 2, 3, 4],\n' +
      '    "name": ["Tom", "Alice", "Bob", "Eve"],\n' +
      '    "age": [28, 24, 31, 29],\n' +
      '})\n' +
      'df.to_sql("users", con, if_exists="replace", index=False)\n' +
      '\n' +
      'back = pd.read_sql("SELECT * FROM users WHERE age > 25 ORDER BY age", con)\n' +
      'print(back)\n' +
      '\n' +
      '# 大文件分块\n' +
      'big_csv = "x,y\\n" + "\\n".join(f"{i},{i*i}" for i in range(1, 1001))\n' +
      'sizes = []\n' +
      'total = 0\n' +
      'for chunk in pd.read_csv(io.StringIO(big_csv), chunksize=200):\n' +
      '    sizes.append(len(chunk))\n' +
      '    total += (chunk["y"] > 500_000).sum()\n' +
      'print(f"分 {len(sizes)} 块，每块大小: {sizes[:3]} ... {sizes[-1]}")\n' +
      'print("y > 500000 的行数:", total)\n' +
      '\n' +
      'con.close()\n' +
      '\n' +
      '# Pickle 保留全部 dtype\n' +
      'import tempfile, os\n' +
      'with tempfile.NamedTemporaryFile(suffix=".pkl", delete=False) as f:\n' +
      '    path = f.name\n' +
      'df.to_pickle(path)\n' +
      'print("pickle 读回:\\n", pd.read_pickle(path).dtypes)\n' +
      'os.remove(path)'
  },
  {
    id: 'pd-index-select',
    title: '4. 索引与选择：loc / iloc / [] / 条件筛选',
    category: '数据读取与索引',
    version: 'Pandas 2.x',
    level: '入门',
    summary: 'Pandas 的核心选择器是 .loc（标签）和 .iloc（位置），加上 [] 简写和布尔掩码。理解它们各自语义、视图还是拷贝，是写出可读、无 bug 代码的关键。',
    detail: [
      '[]：最简选列或切片行：df["col"] 取列，df[["c1", "c2"]] 取多列，df[2:5] 按位置切片行。',
      '.loc[行标签, 列标签]：基于标签的访问；支持标签切片（闭区间）、布尔数组、函数式 callable。',
      '.iloc[行位置, 列位置]：纯整数位置；支持位置切片（左闭右开）、布尔、函数。',
      'at / iat：单标量版本，比 .loc / .iloc 快。',
      '链式赋值警告：df["a"][df["b"] > 0] = ... 在 Copy-on-Write 下会出问题；统一用 df.loc[mask, "a"] = ...。',
      '多级索引：df.loc[("A", 1), :] / df.xs(("A", 1)) 切 MultiIndex。'
    ],
    notes: [
      'df["a"] 返回的是 Series（视图或拷贝，取决于上下文），df[["a"]] 返回 DataFrame。',
      '.loc 标签切片两端都包含（如 df.loc["2020":"2021"] 包含 2021 年）；.iloc 左闭右开。',
      'Pandas 2.x 默认 Copy-on-Write 开启，链式索引会返回独立对象，避免 SettingWithCopyWarning。'
    ],
    example:
      'import pandas as pd\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "age":   [28, 24, 31, 29, 35],\n' +
      '    "score": [88, 92, 75, 80, 95],\n' +
      '    "city":  ["BJ", "SH", "SZ", "BJ", "SH"],\n' +
      '}, index=["Tom", "Alice", "Bob", "Eve", "Carl"])\n' +
      '\n' +
      '# [] 选列\n' +
      'print(df["age"])                 # Series\n' +
      'print(df[["age", "score"]])      # DataFrame\n' +
      '\n' +
      '# [] 切行\n' +
      'print(df[1:3])                   # 行切片（左闭右开）\n' +
      '\n' +
      '# .loc 标签\n' +
      'print(df.loc["Tom"])\n' +
      'print(df.loc[["Tom", "Bob"], ["age", "score"]])\n' +
      'print(df.loc["Tom":"Bob"])       # 闭区间\n' +
      '\n' +
      '# .iloc 位置\n' +
      'print(df.iloc[0, 1])             # 88\n' +
      'print(df.iloc[0:2, 0:2])\n' +
      '\n' +
      '# at / iat 单标量\n' +
      'print(df.at["Tom", "score"])\n' +
      'print(df.iat[0, 1])',
    example2:
      '# ========== 布尔掩码 + query ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "age":   [28, 24, 31, 29, 35],\n' +
      '    "score": [88, 92, 75, 80, 95],\n' +
      '    "city":  ["BJ", "SH", "SZ", "BJ", "SH"],\n' +
      '}, index=["Tom", "Alice", "Bob", "Eve", "Carl"])\n' +
      '\n' +
      '# 单条件\n' +
      'mask = df["score"] >= 90\n' +
      'print(df[mask])\n' +
      '\n' +
      '# 多条件\n' +
      'mask = (df["score"] >= 80) & (df["city"] == "BJ")\n' +
      'print(df[mask])\n' +
      '\n' +
      '# isin\n' +
      'print(df[df["city"].isin(["BJ", "SH"])])\n' +
      '\n' +
      '# query（表达式字符串）\n' +
      'print(df.query("score >= 80 and city == \\"BJ\\""))\n' +
      '\n' +
      '# between\n' +
      'print(df[df["age"].between(25, 30, inclusive="both")])\n' +
      '\n' +
      '# 用 .loc 改值\n' +
      'df.loc[df["city"] == "BJ", "score"] = df["score"] + 1\n' +
      'print("\\nBJ 的人 score +1:\\n", df)',
    example3:
      '# ========== 多级索引（MultiIndex）实战 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'idx = pd.MultiIndex.from_product(\n' +
      '    [["2023", "2024"], ["Q1", "Q2", "Q3", "Q4"]],\n' +
      '    names=["year", "quarter"],\n' +
      ')\n' +
      'df = pd.DataFrame({\n' +
      '    "sales": np.random.randint(100, 1000, 8),\n' +
      '    "cost":  np.random.randint(50,  500,  8),\n' +
      '}, index=idx)\n' +
      'df["profit"] = df["sales"] - df["cost"]\n' +
      'print(df)\n' +
      '\n' +
      '# 选 2024 全部季度\n' +
      'print("\\n2024:\\n", df.loc["2024"])\n' +
      '\n' +
      '# 选 2024 Q2\n' +
      'print("\\n2024 Q2:\\n", df.loc[("2024", "Q2")])\n' +
      '\n' +
      '# 用 xs 在某一层切\n' +
      'print("\\n所有 Q1:\\n", df.xs("Q1", level="quarter"))\n' +
      '\n' +
      '# stack / unstack：列-行互换\n' +
      'wide = df["sales"].unstack(level="quarter")\n' +
      'print("\\nunstack 后:\\n", wide)\n' +
      'print("\\n再 stack 回去:\\n", wide.stack(future_stack=True))\n' +
      '\n' +
      '# swaplevel 调换层\n' +
      'print("\\nswaplevel 后索引:", df.swaplevel().index.names)'
  },
  {
    id: 'pd-missing',
    title: '5. 缺失值：NaN / NaT 检测、填充、删除',
    category: '数据读取与索引',
    version: 'Pandas 2.x',
    level: '入门',
    summary: 'Pandas 用 NaN 表示数值缺失、NaT 表示时间缺失、None 表示对象缺失；掌握检测、填充、删除与插值是数据清洗的基本功。',
    detail: [
      '检测：df.isna() / df.notna() 返回同形状 bool；df.isna().sum() 看每列缺失数；df.isna().any(axis=1) 找含缺失的行。',
      '删除：df.dropna(axis=0, how="any", thresh=N) 按行/列删缺失。how="any" 有一个缺失就删；how="all" 全缺失才删；thresh= 至少 N 个非空才保留。',
      '填充：df.fillna(value) / df.fillna({col: value})；method="ffill" 向前、method="bfill" 向后、method="interpolate" 插值。',
      '数值插值：df.interpolate(method="linear"/"polynomial"/"time") 对时间序列尤其有用。',
      '可空类型：pd.Int64Dtype()、pd.BooleanDtype()、pd.StringDtype() 让缺失在整型/布尔/字符串列也有"原生 NaN"语义。',
      '显式哨兵值：很多数据用 0、-1、999 当缺失，pd.replace([-1, 999], np.nan) 转成 NaN 后再处理。'
    ],
    notes: [
      'np.nan 是 float；带 NaN 的整数列会升级成 float。Pandas 2.x 用 pd.Int64Dtype() 可以保留 int + NaN。',
      'fillna({col: value}) 给不同列填不同值非常方便。',
      '时间序列插值 interpolate(method="time") 自动按时间间隔加权。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "A": [1, 2, np.nan, 4, 5],\n' +
      '    "B": [np.nan, 2, 3, np.nan, 5],\n' +
      '    "C": [1, 2, 3, 4, np.nan],\n' +
      '})\n' +
      '\n' +
      'print("isna:\\n", df.isna())\n' +
      'print("\\nisna.sum:\\n", df.isna().sum())\n' +
      'print("\\nany axis=1:\\n", df.isna().any(axis=1))\n' +
      '\n' +
      '# 填充\n' +
      'print("\\nfillna(0):\\n", df.fillna(0))\n' +
      'print("\\n列分别填:\\n", df.fillna({"A": df["A"].mean(), "B": 0, "C": -1}))\n' +
      'print("\\nffill:\\n", df.ffill())\n' +
      'print("\\nbfill:\\n", df.bfill())\n' +
      '\n' +
      '# 插值\n' +
      'print("\\ninterpolate:\\n", df.interpolate())\n' +
      '\n' +
      '# 删除\n' +
      'print("\\ndropna any:\\n", df.dropna())\n' +
      'print("\\ndropna how=all（无变化，本行非全空）:\\n", df.dropna(how="all"))\n' +
      'print("\\nthresh=3（保留至少 3 个非空）:\\n", df.dropna(thresh=3))',
    example2:
      '# ========== 哨兵值与可空类型 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      '# 真实数据常把 0、-1 当缺失\n' +
      'df = pd.DataFrame({\n' +
      '    "id":    [1, 2, 3, 4],\n' +
      '    "age":   [28, -1, 31, 29],     # -1 表示缺失\n' +
      '    "score": [88, 92, 999, 80],    # 999 表示缺失\n' +
      '})\n' +
      '\n' +
      '# 把哨兵换成 NaN\n' +
      'df = df.replace({"age": {-1: np.nan}, "score": {999: np.nan}})\n' +
      'print("替换后:\\n", df)\n' +
      '\n' +
      '# 用可空 Int64 dtype 保留整数 + NaN\n' +
      'df["age_i"] = df["age"].astype("Int64")\n' +
      'print("\\nInt64 dtype:\\n", df["age_i"])\n' +
      'print("isna:", df["age_i"].isna().tolist())\n' +
      '\n' +
      '# 字符串可空\n' +
      's = pd.Series(["a", None, "b"], dtype="string")\n' +
      'print("\\nStringDtype:", s.dtype, s.tolist())\n' +
      '\n' +
      '# 布尔可空\n' +
      'b = pd.Series([True, None, False], dtype="boolean")\n' +
      'print("BooleanDtype:", b.dtype, b.tolist())',
    example3:
      '# ========== 时间序列缺失值处理 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'idx = pd.date_range("2024-01-01", periods=10, freq="D")\n' +
      's = pd.Series([1.0, 2.0, np.nan, 4.0, np.nan, np.nan, 7.0, 8.0, np.nan, 10.0], index=idx)\n' +
      'print("原数据:\\n", s)\n' +
      '\n' +
      '# 时间加权插值\n' +
      'print("\\ntime 插值:\\n", s.interpolate(method="time"))\n' +
      '\n' +
      '# 限制向前/向后填充的次数\n' +
      'print("\\nffill limit=1:\\n", s.ffill(limit=1))\n' +
      '\n' +
      '# 用相邻值做平滑\n' +
      'print("\\nrolling(3).mean() + 插值:\\n",\n' +
      '      s.fillna(s.rolling(3, min_periods=1).mean()))\n' +
      '\n' +
      '# 缺失段分组：哪些是连续缺失\n' +
      'isna = s.isna().astype(int)\n' +
      'groups = (isna.diff() != 0).cumsum()\n' +
      'print("\\n缺失段分组:\\n", s.groupby(groups).apply(lambda x: (x.isna().all(), x.index.min(), x.index.max())))\n' +
      '\n' +
      '# 删除缺失比例过高的列\n' +
      'df = pd.DataFrame({\n' +
      '    "a": [1, np.nan, 3, np.nan, 5],\n' +
      '    "b": [np.nan, np.nan, np.nan, np.nan, np.nan],\n' +
      '    "c": [10, 20, 30, 40, 50],\n' +
      '})\n' +
      'miss_ratio = df.isna().mean()\n' +
      'keep = miss_ratio[miss_ratio < 0.5].index\n' +
      'print("\\n保留缺失率 < 50% 的列:\\n", df[keep])'
  },
  {
    id: 'pd-dtypes',
    title: '6. 类型与转换：astype / category / to_numeric / to_datetime',
    category: '数据清洗',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'Pandas 2.x 推荐用 astype + Nullable dtype；category 用于低基数列节省内存并加速 groupby；to_datetime 解析时间戳。',
    detail: [
      'astype(dtype)：通用类型转换；nullable dtype：pd.Int64Dtype() / "Int64"、pd.BooleanDtype() / "boolean"、pd.StringDtype() / "string"。',
      '分类类型：pd.Categorical / astype("category") 适合低基数（unique 数远小于 length）；节省内存并加速 groupby/merge。',
      'to_numeric(s, errors="coerce") 把不能解析的转 NaN；errors="raise" 报错。',
      'to_datetime(s, format=..., errors="coerce") 解析时间；支持 ISO 8601 自动识别。',
      'infer_objects() 自动推断 object 列到合适类型；convert_dtypes() 智能转 nullable dtype。',
      '内存优化：downcast 选项 pd.to_numeric(s, downcast="integer"/"float") 选最小够用的位数。'
    ],
    notes: [
      'astype("category") 后 .cat.categories 可以看字典；.cat.codes 是整数编码。',
      '字符串类型推荐 pd.StringDtype()，而不是 object，能区分 None / np.nan。',
      'to_datetime 解析大量字符串时用 format= 显式格式比依赖推断快 5~10 倍。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "id":     ["1", "2", "3", "4"],\n' +
      '    "score":  ["88.5", "92.0", "75.0", "81.0"],\n' +
      '    "level":  ["A", "B", "A", "C"],\n' +
      '    "date":   ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04"],\n' +
      '})\n' +
      'print("原 dtypes:\\n", df.dtypes)\n' +
      '\n' +
      '# to_numeric\n' +
      'df["score_f"] = pd.to_numeric(df["score"], errors="coerce")\n' +
      'df["id_i"] = pd.to_numeric(df["id"], downcast="integer")\n' +
      'print("\\n转换后:\\n", df.dtypes)\n' +
      '\n' +
      '# to_datetime\n' +
      'df["date_dt"] = pd.to_datetime(df["date"], format="%Y-%m-%d")\n' +
      'print("\\n日期类型:", df["date_dt"].dtype)\n' +
      '\n' +
      '# category\n' +
      'df["level_cat"] = df["level"].astype("category")\n' +
      'print("\\n分类字典:", df["level_cat"].cat.categories.tolist())\n' +
      'print("整数编码:", df["level_cat"].cat.codes.tolist())',
    example2:
      '# ========== 内存对比：object vs category vs Int64 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'N = 1_000_000\n' +
      'colors = np.random.choice(["red", "green", "blue", "yellow"], size=N)\n' +
      '\n' +
      's_obj = pd.Series(colors)\n' +
      's_cat = pd.Series(colors).astype("category")\n' +
      '\n' +
      'print("object 内存:", f"{s_obj.memory_usage(deep=True) / 1024 / 1024:.1f} MB")\n' +
      'print("category 内存:", f"{s_cat.memory_usage(deep=True) / 1024 / 1024:.1f} MB")\n' +
      '\n' +
      '# 数字列：选对 dtype\n' +
      'nums = np.random.randint(0, 100, N)\n' +
      'for d in ["int64", "int32", "int16", "int8"]:\n' +
      '    s = pd.Series(nums, dtype=d)\n' +
      '    print(f"{d:>6s}: {s.memory_usage(deep=True) / 1024 / 1024:.1f} MB")\n' +
      '\n' +
      '# Nullable 与可空\n' +
      'df = pd.DataFrame({\n' +
      '    "i":  pd.array([1, 2, None], dtype="Int64"),\n' +
      '    "f":  pd.array([1.0, 2.0, None], dtype="Float64"),\n' +
      '    "b":  pd.array([True, False, None], dtype="boolean"),\n' +
      '    "s":  pd.array(["a", None, "b"], dtype="string"),\n' +
      '})\n' +
      'print("\\n可空类型:\\n", df)\n' +
      'print(df.dtypes)\n' +
      'print("\\nisna:\\n", df.isna())\n' +
      '\n' +
      '# convert_dtypes 一键智能推断\n' +
      'df_raw = pd.DataFrame({\n' +
      '    "a": [1, 2, None],\n' +
      '    "b": ["x", None, "y"],\n' +
      '    "c": [1.0, 2.5, None],\n' +
      '})\n' +
      'print("\\nconvert_dtypes:\\n", df_raw.convert_dtypes().dtypes)',
    example3:
      '# ========== to_datetime 进阶：解析各种时间格式 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      '# 多种时间字符串\n' +
      's = pd.Series(["2024-01-15", "15/01/2024", "Jan 15, 2024", "20240115"])\n' +
      'print("ISO 自动推断:\\n", pd.to_datetime(s, errors="coerce"))\n' +
      '\n' +
      '# 显式 format（更快、更稳）\n' +
      'print("\\nformat=%d/%m/%Y:\\n", pd.to_datetime(s, format="%d/%m/%Y", errors="coerce"))\n' +
      '\n' +
      '# 混合日期时间\n' +
      'mixed = pd.Series(["2024-01-15 09:30:00", "2024-01-15T10:15", "2024-01-15 14:45:30.123"])\n' +
      'print("\\n混合时间:\\n", pd.to_datetime(mixed))\n' +
      '\n' +
      '# Unix 时间戳（秒）\n' +
      'ts = pd.Series([1705276800, 1705363200, 1705449600])\n' +
      'print("\\nUnix -> datetime:\\n", pd.to_datetime(ts, unit="s"))\n' +
      '\n' +
      '# 时区\n' +
      'dt = pd.to_datetime(ts, unit="s", utc=True)\n' +
      'print("\\n带时区:\\n", dt)\n' +
      'print("转北京时间:", dt.dt.tz_convert("Asia/Shanghai"))\n' +
      '\n' +
      '# dt 访问器\n' +
      's = pd.Series(pd.date_range("2024-01-01", periods=5, freq="D"))\n' +
      'print("\\ndt.year :", s.dt.year.tolist())\n' +
      'print("dt.month:", s.dt.month.tolist())\n' +
      'print("dt.day_name:", s.dt.day_name().tolist())\n' +
      'print("dt.weekday:", s.dt.weekday.tolist())'
  },
  {
    id: 'pd-apply',
    title: '7. Apply 与函数式：apply / applymap / map / transform / pipe',
    category: '数据清洗',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: '把 Python 函数施加到 Series/ DataFrame 是数据清洗的常见操作；理解 apply / map / transform / pipe 的差异能避免性能陷阱。',
    detail: [
      'Series.map(func_or_dict)：元素级映射；可传 dict 做键值替换。',
      'Series.apply(func)：元素级函数应用，与 map 类似但支持复杂函数；返回值可以是 Series。',
      'DataFrame.apply(func, axis=0/1)：按列/行施加函数；func 接收 Series，返回标量/Series。',
      'DataFrame.applymap(func) / DataFrame.map(func)：逐元素函数（Pandas 2.x 把 applymap 重命名为 map）。',
      'transform(func)：与 apply 类似但必须返回与原 group/Series 同长度；常用于"组内标准化"。',
      'pipe(func, *args)：链式风格的函数应用，把 df 作为第一个参数传给 func。',
      '向量化优先：能用 NumPy 广播的不要用 apply；能用内置 str/regex 访问器的不要用 Python lambda。'
    ],
    notes: [
      'df.apply(lambda x: x.sum()) 在每列上求和（axis=0）；df.apply(lambda x: x.sum(), axis=1) 按行求和。',
      'apply 比 map 慢，因为 apply 把行/列作为 Series 反复拆装；能用 NumPy ufunc 就用 ufunc。',
      'Pandas 2.x 把 applymap 改名 map，旧的 applymap 已 deprecated。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "name":  ["Tom", "Alice", "Bob", "Eve"],\n' +
      '    "score": [88, 92, 75, 80],\n' +
      '    "city":  ["BJ", "SH", "SZ", "BJ"],\n' +
      '})\n' +
      '\n' +
      '# Series.map：用 dict 做替换\n' +
      'city_full = df["city"].map({"BJ": "Beijing", "SH": "Shanghai", "SZ": "Shenzhen"})\n' +
      'print(city_full)\n' +
      '\n' +
      '# Series.map：用函数做转换\n' +
      'print(df["name"].map(lambda s: s.upper()))\n' +
      '\n' +
      '# Series.apply\n' +
      'print(df["score"].apply(lambda x: "A" if x >= 90 else ("B" if x >= 80 else "C")))\n' +
      '\n' +
      '# DataFrame.apply：每列聚合\n' +
      'print("\\n每列数值范围:\\n", df[["score"]].apply(lambda s: s.max() - s.min()))\n' +
      '\n' +
      '# DataFrame.apply：每行加总（混合列不行）\n' +
      'df["total"] = df[["score"]].apply(np.sum, axis=1)\n' +
      'print(df)',
    example2:
      '# ========== transform 与组内标准化 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "group": ["A", "A", "A", "B", "B", "B"],\n' +
      '    "value": [10, 20, 30, 100, 200, 300],\n' +
      '})\n' +
      '\n' +
      '# apply 返回长度等于分组数；transform 返回与原 df 同长度\n' +
      'g = df.groupby("group")["value"]\n' +
      '\n' +
      'print("apply 返回每组均值:\\n", g.apply(lambda s: s.mean()))\n' +
      'print("\\ntransform 组内均值（与 df 等长）:\\n", g.transform(lambda s: s.mean()))\n' +
      'print("\\ntransform z-score:\\n", g.transform(lambda s: (s - s.mean()) / s.std()))\n' +
      '\n' +
      '# 用 transform 直接给 df 加列\n' +
      'df["zscore"] = g.transform(lambda s: (s - s.mean()) / s.std())\n' +
      'print("\\n合并后:\\n", df)',
    example3:
      '# ========== pipe 链式 + 性能对比：apply vs 向量化 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      '# pipe：把函数串成管道\n' +
      'def add_columns(df, cols):\n' +
      '    for c in cols:\n' +
      '        df[c] = np.random.randn(len(df))\n' +
      '    return df\n' +
      '\n' +
      'def normalize(df, cols):\n' +
      '    for c in cols:\n' +
      '        df[c] = (df[c] - df[c].mean()) / df[c].std()\n' +
      '    return df\n' +
      '\n' +
      'df = (\n' +
      '    pd.DataFrame(index=range(1000))\n' +
      '    .pipe(add_columns, ["a", "b", "c"])\n' +
      '    .pipe(normalize, ["a", "b", "c"])\n' +
      ')\n' +
      'print(df.head(3))\n' +
      '\n' +
      '# 性能对比：apply vs 向量化\n' +
      'N = 1_000_000\n' +
      's = pd.Series(np.random.randn(N))\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'r1 = s.apply(lambda x: x ** 2 + 1)\n' +
      'apply_t = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'r2 = s ** 2 + 1\n' +
      'vec_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"apply  : {apply_t*1000:.1f} ms")\n' +
      'print(f"向量化: {vec_t*1000:.1f} ms")\n' +
      'print(f"加速比: {apply_t/vec_t:.0f}x")\n' +
      'print("结果一致?", np.allclose(r1, r2))\n' +
      '\n' +
      '# 字符串访问器：.str.upper() 比 apply(lambda x: x.upper()) 快\n' +
      's = pd.Series(["tom", "alice", "bob"] * 100_000)\n' +
      't0 = time.perf_counter()\n' +
      'r1 = s.apply(lambda x: x.upper())\n' +
      'print(f"\\napply lambda: {(time.perf_counter()-t0)*1000:.1f} ms")\n' +
      't0 = time.perf_counter()\n' +
      'r2 = s.str.upper()\n' +
      'print(f"str 访问器 : {(time.perf_counter()-t0)*1000:.1f} ms")'
  }
];
