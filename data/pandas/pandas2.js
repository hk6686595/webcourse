// Pandas 教程 6–10：数据清洗与处理
const pandas6 = {
  id: 'pandas-missing',
  title: '6. 缺失值处理：NaN 的检测与填充',
  category: '数据清洗',
  version: '2.0+',
  level: '入门',
  summary: '识别缺失值、删除、用固定值/前向/均值填充，以及缺失值插值。',
  detail: [
    '缺失值通常以 NaN（np.nan）表示；字符串缺失可能是空串或 None。',
    '检测：df.isna()（或 isnull）返回布尔矩阵；df.isna().sum() 按列统计缺失数。',
    '删除：df.dropna() 删除含缺失的行；参数 how="any"/"all"、subset=列、axis=1 删列。',
    '填充：df.fillna(value) 用固定值填充；method="ffill"/"bfill" 前向/后向填充。',
    '按列均值填充：df.fillna(df.mean())；分组填充：df.groupby("组").transform(填充函数)。',
    '插值：df.interpolate() 线性插值，适合时间序列。',
  ],
  notes: [
    '处理缺失前先想清楚业务含义：是删除、填充均值、还是代表某个特殊值（如 0）。',
    '填充均值会低估波动，时间序列最好用前后值插值。',
  ],
  example: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    'A': [1, np.nan, 3, 4],
    'B': [np.nan, 2, np.nan, 8],
    'C': [5, 6, 7, 8],
})

print("缺失统计:")
print(df.isna().sum())

# 删除含缺失行
print(df.dropna())

# 按列填充固定值
print(df.fillna(0))

# 前向填充（用上一行补）
print(df.fillna(method='ffill'))

# 按列均值填充
print(df.fillna(df.mean()))

# 插值
print(df.interpolate())

# 实践：对数值列使用均值填充
df2 = df.copy()
for col in ['A', 'B']:
    df2[col] = df2[col].fillna(df2[col].mean())
print(df2)`,
};

const pandas7 = {
  id: 'pandas-dup-duplicate',
  title: '7. 重复数据与类型转换',
  category: '数据清洗',
  version: '2.0+',
  level: '入门',
  summary: '去重、处理重复索引、数据类型的检查与转换、字符串与日期转换。',
  detail: [
    '去重：df.drop_duplicates()；subset 指定列、keep="first"/"last"/False 决定保留哪个。',
    '查看重复：df.duplicated() 返回布尔 Series 标记是否重复。',
    '类型检查：df.dtypes；转换为 str/数值：astype()。',
    '处理脏数据：pd.to_numeric(errors="coerce") 把无法解析的转 NaN，pd.to_datetime() 解析日期。',
    '字符串列类型为 object，可用于文本处理（.str 访问器）。',
    'astype 与 to_numeric/to_datetime 区别：后者更智能（容错 parse）。',
  ],
  notes: [
    '复合去重：df.drop_duplicates(subset=["用户','日期"]) 按关键列去重，避免整行误删。',
    '转换错误用 coerce 得到 NaN 后可按上一节方法处理，形成管道。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '用户': ['A', 'B', 'A', 'C', 'A'],
    '日期': ['2024-01-01', '2024-01-02', '2024-01-01', '2024-01-03', '2024-01-05'],
    '金额': ['10', '20', '10', '30', '10'],
})

# 整行重复去重
print(df.drop_duplicates())

# 按用户+日期关键列去重，保留第一条
print(df.drop_duplicates(subset=['用户', '日期'], keep='first'))

# 类型转换
df['金额'] = pd.to_numeric(df['金额'])           # str → int
df['日期'] = pd.to_datetime(df['日期'])          # str → datetime
print(df.dtypes)

# 错误容忍
s = pd.Series(['100', 'abc', '200'])
print(pd.to_numeric(s, errors='coerce'))          # abc → NaN`,
};

const pandas8 = {
  id: 'pandas-string',
  title: '8. 文本与字符串处理：.str 访问器',
  category: '数据清洗',
  version: '2.0+',
  level: '入门',
  summary: '用 .str 访问器对字符串列做大小写、拆分、替换、包含判断、提取等操作。',
  detail: [
    '对 object 类型的列，df["col"].str.lower() 等即可向量化处理字符串。',
    '常用：upper()/lower()/strip() 大小写与空白、len() 长度。',
    'contains() 判断包含（支持 regex）、startswith()/endswith()。',
    '拆分：str.split(','，expand=True) 拆成多列；提取：str.extract(正则)。',
    '替换：str.replace(旧, 新)；去除指定字符：str.strip("x")。',
    '连接：两列合并 df["a"].str.cat(df["b"], sep="-")。',
  ],
  notes: [
    '.str 方法几乎映射 Python 字符串方法，但作用于整列，无需循环。',
    '包含正则时记得 pattern 为 r"..." 原始字符串避免转义陷阱。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '姓名': ['Alice Smith', 'Bob li', 'CaroLN'],
    '邮箱': ['a@example.com', 'b@gmail.com', 'c@163.com'],
})

# 大小写
print(df['姓名'].str.upper())
print(df['姓名'].str.title())

# 拆分姓名
parts = df['姓名'].str.split(' ', expand=True)
df['姓'] = parts[0]
df['名'] = parts[1]

# 判断邮箱域名
df['是Gmail'] = df['邮箱'].str.contains('gmail')
df['邮箱服务商'] = df['邮箱'].str.split('@').str[1]

# 替换
df['姓名'] = df['姓名'].str.replace('li', 'Li')

print(df)

# 提取数字（正则）
codes = pd.Series(['订单-1001', '订单-2002'])
print(codes.str.extract(r'-(\\d+)'))  # 提取数字`,
};

const pandas9 = {
  id: 'pandas-datetime',
  title: '9. 日期与时间处理：时间序列基础',
  category: '时间序列',
  version: '2.0+',
  level: '进阶',
  summary: '日期解析、提取年月日、时间差计算、重采样（resample）与时间筛选。',
  detail: [
    'pd.to_datetime() 解析日期列；可指定 format 提升性能。',
    '提取时间成分：df["日期"].dt.year/month/day/weekday/hour。',
    '日期差：两日期列相减得到 Timedelta，可用 .dt.days 取天数。',
    '作为索引：df.set_index("日期")，然后可方便地按时间切片 df["2024-01"]。',
    '重采样：df.resample("M").sum() 按月度聚合（需要 DatetimeIndex），支持 D/W/M/Y 等频率。',
    '生成日期范围：pd.date_range(start, periods, freq)。',
  ],
  notes: [
    '先把日期列设为索引，才能用 resample 与时间切片。',
    'freq 参数：D=天，W=周，ME=月末，QE=季末，YE=年末。',
  ],
  example: `import pandas as pd

# 生成一个简单的时间序列
idx = pd.date_range('2024-01-01', periods=60, freq='D')
df = pd.DataFrame({'销售额': range(60)}, index=idx)
print(df.head())

# 按月聚合
monthly = df.resample('ME').sum()
print(monthly.head())

# 提取成分
df['月份'] = df.index.month
df['星期'] = df.index.dayofweek   # 0=Monday

# 筛选某月
print(df.loc['2024-01'])

# 日期差
df['天'] = (df.index - idx[0]).days
print(df.head())`,
};

const pandas10 = {
  id: 'pandas-apply-map',
  title: '10. 向量化运算与 apply / map：告别循环',
  category: '数据处理',
  version: '2.0+',
  level: '进阶',
  summary: '掌握 apply、applymap、map、以及 NumPy 向量化运算，让数据处理高效且优雅。',
  detail: [
    '列运算直接向量化：df["c"] = df["a"] * 2 + df["b"]，无需循环。',
    'map（Series.map(dict 或函数)）：按列做映射/变换，返回新 Series。',
    'apply（DataFrame.apply(func, axis)）：对每行(axis=1)或每列(axis=0)应用函数。',
    'applymap（DataFrame 每个元素）：对所有值应用函数；新版本用 df.map()。',
    '自定义函数配合 lambda：df["新列"] = df["金额"].apply(lambda x: x * 0.9)。',
    '性能对比：向量化 > apply > 逐行循环；大数据量时注意。',
  ],
  notes: [
    '能用向量化就用向量化；apply 在复杂业务逻辑时才需要。',
    'apply(axis=1) 传入的是整行 Series，列名做键访问。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '单价': [10, 20, 30],
    '数量': [2, 3, 4],
})

# 向量化
df['小计'] = df['单价'] * df['数量']

# map 映射
df['等级'] = df['数量'].map({2: '少', 3: '中', 4: '多'})

# apply 行列应用
df['折扣价'] = df['单价'].apply(lambda x: round(x * 0.9, 1))

def 分类(行):
    if 行['数量'] >= 3:
        return '大单'
    return '小单'

df['订单类型'] = df.apply(分类, axis=1)
print(df)

# 多个数值列综合
df['总额'] = df[['单价', '数量']].apply(lambda r: r['单价'] * r['数量'], axis=1)
print(df)`,
};

if (typeof module !=="undefined") module.exports = { pandas6, pandas7, pandas8, pandas9, pandas10 };