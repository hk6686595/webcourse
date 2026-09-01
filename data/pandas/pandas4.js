// Pandas 教程 16–20：实战与进阶
const pandas16 = {
  id: 'pandas-window',
  title: '16. 窗口函数与滚动计算：rolling / expanding',
  category: '时间序列',
  version: '2.0+',
  level: '高级',
  summary: '滚动窗口均/和、扩展窗口、shift 差分与前序对齐，金融和时序分析常用。',
  detail: [
    'df["列"].rolling(3).mean()：对当前行及其前 2 行的滑动窗口求均值（前两个为 NaN）。',
    'rolling 支持 sum/mean/std/max/min/median/apply(自定义)。',
    'expanding 累进窗口：从第一行到当前行，适合累计统计。',
    'shift(1)/diff() 用于构造滞后特征或计算相邻变化。',
    'pct_change() 计算环比百分比变化。',
    '时间戳索引下 rolling("7D") 按时间窗口而非行数滑动。',
  ],
  notes: [
    'rolling 默认 min_periods=1 会出现样本不足的窗口；设 min_periods=窗口大小避免。',
    'shift 常用于机器学习中构造时间特征（上一期值）。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({'销量': [100, 120, 110, 130, 160, 170, 145]})

# 3 日移动平均
df['3日均'] = df['销量'].rolling(3).mean()

# 累计和
df['累计'] = df['销量'].cumsum()

# 相邻变化
df['环比增量'] = df['销量'].diff()
df['环比率'] = df['销量'].pct_change() * 100

# 前一日（滞后特征）
df['昨日销量'] = df['销量'].shift(1)

print(df.round(2))`,
  example2: `import pandas as pd

# 按时间窗口（7 天），需要 DatetimeIndex
idx = pd.date_range('2024-01-01', periods=14, freq='D')
s = pd.Series(range(14), index=idx)
print(s.rolling('7D').mean())

# expanding 累进
print(s.expanding().mean().head(5))`,
};

const pandas17 = {
  id: 'pandas-performance',
  title: '17. 性能优化：向量化与内存管理',
  category: '性能优化',
  version: '2.0+',
  level: '高级',
  summary: '用向量化替代循环、正确类型、分块读取大文件，显著提升大数据处理速度。',
  detail: [
    '第一原则：避免逐行循环，用向量化表达式（NumPy 底层 C 实现）。',
    '必要时用 numba 的 jit 编译自定义函数，或 pandas 2.x 的 backend。',
    '内存优化：astype("category") 处理低基数分类列、astype("int32") 缩小整数。',
    'df.info(memory_usage="deep") 查看内存；chunk 分批：pd.read_csv(chunksize=10000)。',
    '按列抽样/避免不必要的复制；尽量用 inplace=False 返回新对象链式。',
    'dtype 检测：float64→float32、object 字符串列转 category，可省 30-70% 内存。',
  ],
  notes: [
    '大数据量场景：先过滤再聚合 vs 聚合后过滤，通常先过滤更省。',
    'append 已废弃，用 pd.concat 收集结果。',
  ],
  example: `import pandas as pd
import numpy as np

n = 1_000_000
df = pd.DataFrame({
    'a': np.random.randn(n),
    'b': np.random.randn(n),
})

# 慢：逐行循环
def slow():
    out = []
    for i in range(len(df)):
        out.append(df['a'].iloc[i] * 2 + df['b'].iloc[i])
    return pd.Series(out)

# 快：向量化
def fast():
    return df['a'] * 2 + df['b']

# 内存优化示例
df2 = pd.DataFrame({'类别': np.random.choice(['A','B','C'], 10000)})
df2['类别'] = df2['类别'].astype('category')   # 分类类型节省内存
print(df2.memory_usage())

# 分块读取大文件
# chunks = pd.read_csv('large.csv', chunksize=50000)
# for chunk in chunks:
#     处理 chunk`,
};

const pandas18 = {
  id: 'pandas-ecommerce',
  title: '18. 实战：电商订单数据分析',
  category: '实战',
  version: '2.0+',
  level: '进阶',
  summary: '综合运用读写、清洗、分组、透视与可视化，完整分析一份订单数据。',
  detail: [
    '目标：读入订单表，找出最畅销商品、各区域销售趋势、客户复购行为。',
    '步骤：加载 → 清洗（去重、缺失、类型）→ 特征工程（月份、金额、城市）→ 分组聚合 → 可视化。',
    '关键指标：总销售额、客单价、月度趋势、品类占比、TOP 商品。',
    '常用分析命令：groupby、pivot_table、value_counts、sort_values、plot。',
    '实操中发现脏数据（异常负数金额、空城市）要在清洗阶段处理。',
    '最后产出：一个汇总 DataFrame + 几张关键图，形成结论。',
  ],
  notes: [
    '先确认数据质量再分析，任何统计假设（如金额为正）都要先验证。',
    '分析流程不唯一，重点是形成"提问 → 取数 → 验证 → 结论"的闭环。',
  ],
  example: `import pandas as pd
import numpy as np

# 构造模拟订单数据 30 条
np.random.seed(0)
df = pd.DataFrame({
    '订单号': [f'O{i:04d}' for i in range(30)],
    '城市': np.random.choice(['北京', '上海', '广州', '深圳'], 30),
    '品类': np.random.choice(['数码', '服饰', '食品'], 30),
    '金额': np.round(np.random.uniform(10, 500, 30), 1),
})

# 1. 清理：金额为负或 0 检查
print("异常金额:", (df['金额'] <= 0).sum())

# 2. 总销售额
print("总销售额:", df['金额'].sum())
print("客单价:", df['金额'].mean())

# 3. 城市维度
print(df.groupby('城市')['金额'].agg(['sum', 'mean', 'count']))

# 4. 品类占比
print(df.groupby('品类')['金额'].sum().sort_values(ascending=False))

# 5. TOP 订单
print(df.sort_values('金额', ascending=False).head(5))

# 6. 透视：城市 × 品类 销售额
print(pd.pivot_table(df, index='城市', columns='品类', values='金额', aggfunc='sum', fill_value=0))`,
};

const pandas19 = {
  id: 'pandas-clean-ml',
  title: '19. 实战：为机器学习准备数据',
  category: '实战',
  version: '2.0+',
  level: '高级',
  summary: '从原始数据到模型输入特征：清洗、编码、标准化、划分训练/测试集。',
  detail: [
    '典型流程：加载 → 缺失/异常处理 → 特征编码（数值化）→ 标准化/归一化 → 切分。',
    '分类变量编码：One-Hot（pd.get_dummies 或 OneHotEncoder）、LabelEncoder、目标编码。',
    '数值标准化：StandardScaler（z-score）、MinMaxScaler。',
    '特征工程：数值聚合、时间分解、交叉特征、独热列构造。',
    '切分：train_test_split(X, y, test_size=0.2, random_state=42)。',
    '管道：sklearn.pipeline.Pipeline 串联编码+模型，保证训练/预测一致。',
  ],
  notes: [
    '务必只在训练集上 fit 编码器/缩放器，再用同一参数 transform 测试集（防止泄漏）。',
    'pandas 与 sklearn 结合：先用 pandas 清洗，再用 sklearn 做变换。',
  ],
  example: `import pandas as pd
import numpy as np

df = pd.DataFrame({
    '年龄': [25, 30, 35, 40, 45, 50],
    '城市': ['北京', '上海', '广州', '北京', '上海', np.nan],
    '收入': [10000, 15000, 20000, 18000, 25000, 30000],
    '购买': [0, 1, 1, 0, 1, 1],   # 目标
})

# 1. 缺失处理
df['城市'] = df['城市'].fillna('未知')

# 2. 独热编码分类变量
df = pd.get_dummies(df, columns=['城市'])

# 3. 特征、目标
X = df.drop('购买', axis=1)
y = df['购买']

# 4. 标准化 + 切分
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)   # 只在训练集 fit
X_test_s = scaler.transform(X_test)         # 测试集只用 transform

print("训练集形状:", X_train_s.shape, "测试集形状:", X_test_s.shape)`,
};

const pandas20 = {
  id: 'pandas-roadmap',
  title: '20. Pandas 学习路线与扩展生态',
  category: '实战',
  version: '2.0+',
  level: '高级',
  summary: '系统总结 Pandas 进阶方向：可视化、大数据、SQL 集成与现代替代工具。',
  detail: [
    '阶段一（已覆盖）：Series/DataFrame、索引、读写、清洗、分组、合并、透视、绘图。',
    '阶段二：时间序列（resample/rolling）、性能优化、apply 复杂逻辑、管道整理（Pipe）。',
    '阶段三：与 sklearn 结合做特征工程、与数据库直接交互（pd.read_sql）。',
    '大数据替代：Dask / Polars（并行、分布式）；cuDF（GPU 加速）。',
    '可视化进阶：seaborn、plotly（交互）、pandas-bokeh；配合 Streamlit 做数据应用。',
    '最佳实践：用 pd.pipe 串联函数、用 assert 校验数据、给数据加 dtype 与 docstring。',
  ],
  notes: [
    '官方文档 + 10-minute tutorial 是最佳入门；Kaggle 练习也是巩固好方式。',
    '新项目（超大表）可关注 Polars，兼容大部分 Pandas 心智。',
  ],
  example: `# 常用命令速查
import pandas as pd

df = pd.read_csv('data.csv')
df.head(); df.info(); df.describe()
df.isna().sum(); df.fillna(df.mean())
df.drop_duplicates(subset=['用户'])
df.groupby('城市')['金额'].agg(['sum', 'mean'])
df.pivot_table(index='城市', columns='品类', values='金额', aggfunc='sum')
pd.merge(a, b, on='键', how='left')
df['日期'] = pd.to_datetime(df['日期'])
df.set_index('日期').resample('ME').sum()
df.rolling(3).mean(); df.diff(); df.pct_change()
df.plot(kind='bar')

# 推荐学习资源
# - pandas 官方 10 minutes to pandas
# - "Python for Data Analysis"（作者即 pandas 作者）
# - Kaggle 的 Pandas 微课程`,
};

if (typeof module !=="undefined") module.exports = { pandas16, pandas17, pandas18, pandas19, pandas20 };