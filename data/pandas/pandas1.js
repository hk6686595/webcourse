// Pandas 教程 1–5：入门与核心数据结构
const pandas1 = {
  id: 'pandas-intro',
  title: '1. Pandas 是什么：数据分析的瑞士军刀',
  category: '入门',
  version: '2.0+',
  level: '入门',
  summary: '理解 Pandas 在 Python 数据科学生态中的位置、DataFrame/Series 核心概念，以及安装与启用。',
  detail: [
    'Pandas 是 Python 最流行的数据处理库，提供了类似 Excel 和 SQL 的二维表格操作能力，构建在 NumPy 之上。',
    '两大核心数据结构：Series（一维带标签数组）和 DataFrame（二维表格，类似电子表格或数据库表）。',
    '常见用途：数据清洗、数据转换、聚合分组、合并连接、时间序列分析、数据可视化配合。',
    '安装：pip install pandas。在数据分析/机器学习生态中几乎都会用到。',
    '导入约定：import pandas as pd，其后所有代码都用 pd 前缀。',
    '关注的核心：强一致的数据结构、缺失数据处理、按标签/位置索引、向量化运算性能。',
  ],
  notes: [
    '与 Excel 对比：Pandas 更擅长自动化、可重复、大规模数据操作；Excel 更直观。',
    '与 SQL 对比：Pandas 操作在内存中，适合探索性分析；SQL 适合海量数据的存储查询。',
  ],
  example: `import pandas as pd

# 版本
print(pd.__version__)

# 用字典创建 Series
s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])
print(s)
# a    1
# b    2
# c    3

# 用字典创建 DataFrame
df = pd.DataFrame({
    '姓名': ['Alice', 'Bob', 'Carol'],
    '年龄': [25, 30, 22],
    '城市': ['北京', '上海', '深圳'],
})
print(df)
print(df.shape)      # (3, 3)
print(df.dtypes)`
};

const pandas2 = {
  id: 'pandas-series',
  title: '2. Series：一维带标签数据',
  category: '数据结构',
  version: '2.0+',
  level: '入门',
  summary: 'Series 的创建、索引（标签/位置）、常用属性、向量化运算与缺失值。',
  detail: [
    'Series 由一维数据 + 显式索引（index）组成，索引默认为 0..n-1 整数，也可自定义。',
    '创建：pd.Series(数据, index=列表, name=列名)。数据可为列表、数组、字典、标量。',
    '访问：s["a"] 按标签、s[0] 按位置、s.loc["a"] 标签定位、s.iloc[0] 位置定位。',
    '常用属性：s.values（NumPy 数组）、s.index、s.name、s.size、s.dtype。',
    '向量化运算：加减乘除、比较、数学函数作用于整个 Series，无需循环（得益于 NumPy）。',
    '缺失值用 NaN 表示（float），可 isna()/notna() 判断，dropna()/fillna() 处理。',
  ],
  notes: [
    '布尔索引非常常用：s[s > 2] 返回满足条件的子集。',
    'Series 的算术运算会自动按索引对齐（对齐缺失为 NaN），这是 Pandas 的特性。',
  ],
  example: `import pandas as pd

# 创建一个 Series
s = pd.Series([10, 20, 30, 40], index=['一', '二', '三', '四'], name='分数')
print(s)
print("标签访问:", s['二'])         # 20
print("位置访问:", s.iloc[2])      # 30
print("前两个:", s.head(2))
print("索引:", list(s.index))

# 向量化
print(s + 1)               # 每个元素 +1
print(s[s > 25])           # 布尔索引，筛选
print((s * 2).sum())       # 200

# 缺失值
import numpy as np
s2 = pd.Series([1.0, np.nan, 3.0])
print(s2.isna())           # False True False
print(s2.fillna(0))        # 填充 0`,
};

const pandas3 = {
  id: 'pandas-dataframe',
  title: '3. DataFrame：二维表格核心',
  category: '数据结构',
  version: '2.0+',
  level: '入门',
  summary: 'DataFrame 的创建、行列访问、属性概览、以及修改结构的基础操作。',
  detail: [
    'DataFrame 是带行列标签的二维数据结构，由多个 Series 组成（每列是一个 Series）。',
    '创建方式：从字典（键为列名）、从列表的列表、从 NumPy 数组、从 CSV/Excel 文件。',
    '查看概览：head()/tail()、shape、columns、index、dtypes、info()、describe()。',
    '列访问 df["col"] 返回 Series；多列 df[["a","b"]] 返回 DataFrame；取行用 loc/iloc。',
    '新增列：df["新列"] = 表达式 或 df.assign()；删除列 df.drop(columns=["x"])。',
    'df.columns.tolist() 获取列名列表，df.rename(columns={"旧": "新"}) 重命名。',
  ],
  notes: [
    '用 loc（标签）和 iloc（位置）取行列是核心技能，比直接 [:] 更可控。',
    'df["col"] = ... 会原地修改；assign 返回新对象，适合链式调用。',
  ],
  example: `import pandas as pd

# 创建 DataFrame
df = pd.DataFrame({
    '商品': ['苹果', '香蕉', '橙子', '葡萄'],
    '价格': [5, 4, 6, 8],
    '销量': [100, 150, 90, 70],
})
print(df)

# 概览
print(df.shape)          # (4, 3)
print(df.columns.tolist())
print(df.describe())     # 数值列统计

# 获取数据
print(df['价格'])                  # 单列 Series
print(df[['商品', '价格']])        # 多列
print(df.loc[1])                   # 第 1 行（标签）
print(df.iloc[1, 1])               # 第1行第1列 → 4

# 新增列：销售额
df['销售额'] = df['价格'] * df['销量']
print(df)

# 条件筛选
print(df[df['销量'] > 80])`,
};

const pandas4 = {
  id: 'pandas-read-write',
  title: '4. 数据读写：CSV / Excel / JSON',
  category: '数据加载',
  version: '2.0+',
  level: '入门',
  summary: '从文件加载数据到 DataFrame，以及把 DataFrame 导出到各类文件。',
  detail: [
    '读 CSV：pd.read_csv("路径.csv")；可选参数 encoding、sep、header、usecols、dtype、skiprows。',
    '保存 CSV：df.to_csv("out.csv", index=False)；index=False 避免写出索引列。',
    '读 Excel：pd.read_excel("x.xlsx", sheet_name="Sheet1")；需 openpyxl。',
    '保存 Excel：df.to_excel("out.xlsx", index=False, sheet_name="数据")。',
    '读 JSON：pd.read_json("data.json")；写入：df.to_json("out.json", orient="records")。',
    '还可读 MySQL（sqlalchemy）、parquet、HDF5 等格式；pickle 保存任意对象。',
  ],
  notes: [
    'CSV 文件中文乱码时指定 encoding="utf-8" 或 "gbk"。',
    'parse_dates=["日期列"] 可以自动把字符串解析为日期。',
  ],
  example: `import pandas as pd

# 假设已有 CSV：读入
df = pd.read_csv('data.csv', encoding='utf-8')
print(df.head())

# 常用参数
df2 = pd.read_csv('data.csv',
                  sep=',',
                  usecols=['商品', '价格'],   # 只读两列
                  parse_dates=None)

# 保存
df.to_csv('out.csv', index=False, encoding='utf-8-sig')   # utf-8-sig 兼容 Excel

# Excel（需 pip install openpyxl）
# df.to_excel('out.xlsx', index=False, sheet_name='销售')
# 读取多个 sheet
# sheets = pd.read_excel('book.xlsx', sheet_name=None)

# JSON
df.to_json('out.json', orient='records', force_ascii=False)
data = pd.read_json('out.json')
print(data.head())`,
};

const pandas5 = {
  id: 'pandas-indexing',
  title: '5. 索引与选择：loc / iloc / 布尔筛选',
  category: '数据处理',
  version: '2.0+',
  level: '入门',
  summary: '掌握 loc 标签定位、iloc 位置定位、布尔索引与链式筛选的最佳实践。',
  detail: [
    'loc[行, 列] 按标签选择；行/列可为单个、列表、切片（含端点）、布尔数组。',
    'iloc[行, 列] 按整数位置选择；切片不含右端点，类似 Python 列表。',
    '布尔筛选：df[df["列"] > 阈值] 返回满足条件的行；可组合 & | ~。',
    '多重条件：df[(df["a"]>1) & (df["b"]<5)]，括号不能少。',
    'isin 筛选：df[df["城市"].isin(["北京","上海"])]。',
    'at/iat 按标签/位置取单个标量（更快）；query() 用字符串表达式筛选。',
  ],
  notes: [
    '优先用 loc/iloc，避免链式赋值（df[df.a>1]["b"] = x）的 SettingWithCopyWarning。',
    'isin 与集合应用非常频繁，记得掌握。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '城市': ['北京', '上海', '深圳', '广州', '成都'],
    '人口(万)': [2189, 2487, 1768, 1874, 2119],
    'GDP(万亿)': [4.4, 4.7, 3.5, 3.1, 2.3],
})

# loc 按标签（行标签默认整数）
print(df.loc[0])              # 第一行
print(df.loc[:, '城市'])      # 城市列
print(df.loc[1:3, ['城市', 'GDP(万亿)']])

# iloc 按位置
print(df.iloc[0, 1])          # 2189
print(df.iloc[:2, :2])        # 前两行前两列

# 布尔筛选
big = df[df['GDP(万亿)'] > 3]
print(big)
print(df[(df['GDP(万亿)'] > 3) & (df['人口(万)'] > 2000)])

# isin
print(df[df['城市'].isin(['北京', '深圳'])])`,
};

if (typeof module !=="undefined") module.exports = { pandas1, pandas2, pandas3, pandas4, pandas5 };