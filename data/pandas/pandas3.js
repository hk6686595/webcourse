// Pandas 教程 11–15：分组、合并与重塑
const pandas11 = {
  id: 'pandas-groupby',
  title: '11. 分组聚合：groupby 的核心用法',
  category: '分组聚合',
  version: '2.0+',
  level: '进阶',
  summary: 'groupby 分组、常见聚合函数、多列分组、自定义聚合与 transform。',
  detail: [
    'df.groupby("城市")["销售额"].sum()：按城市分组、对销售额求和。',
    '多列分组：df.groupby(["城市','月份"]); 多列聚合：.sum(). 返回 DataFrame。',
    '常见聚合：mean() sum() count() min() max() std() median() nunique()。',
    '多个聚合一起：.agg({"销售额":"sum","单价":"mean"}) 或 .agg(["sum","mean"])。',
    'transform 保持原行数，填充分组统计值（如组内均值）。',
    '分组后用于分析：groupby().size() 计数、.groups 查看分组、get_group() 取一组。',
  ],
  notes: [
    '聚合结果默认把分组列作为索引；用 as_index=False 保留为普通列。',
    'agg 可同时指定不同列的多种聚合，是性能与表达力的最佳结合。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '城市': ['北京', '上海', '北京', '上海', '广州', '广州'],
    '商品': ['A', 'A', 'B', 'B', 'A', 'B'],
    '销售额': [100, 150, 80, 120, 60, 90],
})

# 单列分组
print(df.groupby('城市')['销售额'].sum())
print(df.groupby('城市')['销售额'].mean())

# 多列分组
print(df.groupby(['城市', '商品'])['销售额'].sum())

# 多聚合
print(df.groupby('城市')['销售额'].agg(['sum', 'mean', 'max']))

# agg 指定不同列不同聚合
print(df.groupby('城市').agg({'销售额': 'sum', '商品': 'count'}))

# transform：组内百分比
df['组占比'] = df.groupby('城市')['销售额'].transform(
    lambda x: x / x.sum() * 100)
print(df)`,
};

const pandas12 = {
  id: 'pandas-merge-join',
  title: '12. 数据合并：merge 与 join',
  category: '合并连接',
  version: '2.0+',
  level: '进阶',
  summary: '类似 SQL 合并两个表：inner/left/right/outer 连接、多键合并、后缀处理。',
  detail: [
    'pd.merge(df1, df2, on="键") 按共同列做 inner 连接（类似 SQL JOIN）。',
    'how 参数：inner 交集、left 保左全、right 保右全、outer 全集拼接。',
    '多键：on=["a","b"] 或 left_on/right_on 指定不同列名。',
    '重复列名自动加 _x/_y 后缀；可传 suffixes=["_左","_右"]。',
    'join 方法基于索引合并：df1.join(df2, on="键") 或按 index。',
    'concat 用于纵向/横向拼接不同数据集（stack 行/列）。',
  ],
  notes: [
    '先确定连接键的取值语义（一对多/多对多）再选 how 类型，避免数据膨胀。',
    '连完记得检查行数是否符合预期，防止重复行。',
  ],
  example: `import pandas as pd

销售 = pd.DataFrame({
    '商品': ['A', 'B', 'C'],
    '销售额': [100, 200, 150],
})
商品 = pd.DataFrame({
    '商品': ['A', 'B', 'D'],
    '类别': ['食品', '饮料', '电器'],
})

# inner 连接（只显示两边都有的 A、B）
print(pd.merge(销售, 商品, on='商品'))

# left 连接（保住销售所有行，缺失类别为 NaN）
print(pd.merge(销售, 商品, on='商品', how='left'))

# outer 连接（并集）
print(pd.merge(销售, 商品, on='商品', how='outer'))

# 不同键名
a = 销售.rename(columns={'商品': '商品名'})
print(pd.merge(a, 商品, left_on='商品名', right_on='商品'))

# concat 纵向拼接
import pandas as pd
s1 = pd.DataFrame({'x': [1, 2]})
s2 = pd.DataFrame({'x': [3, 4]})
print(pd.concat([s1, s2], ignore_index=True))`,
};

const pandas13 = {
  id: 'pandas-pivot',
  title: '13. 数据塑形：pivot / pivot_table / melt',
  category: '合并连接',
  version: '2.0+',
  level: '进阶',
  summary: '把长表变宽表（pivot），或宽表变长表（melt），以及聚合透视表 pivot_table。',
  detail: [
    'pivot：df.pivot(index="行", columns="列", values="值") 把重复键转成矩阵。',
    'pivot_table：类似 pivot 但支持聚合（有重复键时），aggfunc="mean"。',
    'melt：宽表变长表，df.melt(id_vars=["ID"], value_vars=["A','B"])。',
    'stack/unstack：按 index 层级切换宽长。',
    'set_index + unstack 也可以实现透视。',
    'pivot_table 支持 margins 总计行、多值列、多聚合函数。',
  ],
  notes: [
    'pivot 要求(index, columns)键唯一；有重复时用 pivot_table 指定 aggfunc。',
    'melt 是数据科学中"整洁数据"（tidy data）的关键操作。',
  ],
  example: `import pandas as pd

# 长表（堆积）→ 宽表
df = pd.DataFrame({
    '城市': ['北京', '北京', '上海', '上海'],
    '季度': ['Q1', 'Q2', 'Q1', 'Q2'],
    '销售额': [100, 120, 90, 110],
})
print(df)

# pivot：行=城市，列=季度
wide = df.pivot(index='城市', columns='季度', values='销售额')
print(wide)

# 有重复键时用 pivot_table 聚合
df2 = pd.DataFrame({
    '城市': ['北京', '北京', '北京', '上海', '上海'],
    '季度': ['Q1', 'Q1', 'Q2', 'Q1', 'Q2'],
    '销售额': [100, 105, 120, 90, 110],
})
print(df2.pivot_table(index='城市', columns='季度', values='销售额', aggfunc='mean'))

# 宽表 → 长表 melt
long_df = wide.reset_index().melt(id_vars='城市', value_vars=['Q1', 'Q2'],
                                   var_name='季度', value_name='销售额')
print(long_df)`,
};

const pandas14 = {
  id: 'pandas-plot',
  title: '14. 数据可视化：matplotlib 快速绘图',
  category: '可视化',
  version: '2.0+',
  level: '进阶',
  summary: '用 matplotlib 绘制折线、柱状、饼图、直方图与散点图，中文字体设置。',
  detail: [
    'Pandas 内置绘图接口：df.plot(kind="line") 基于 matplotlib。',
    '常见 kind：line 折线、bar 柱状、pie 饼图、hist 直方图、scatter 散点。',
    '绘图前设置中文字体：plt.rcParams["font.sans-serif"]=["SimHei"]，否则中文显示方块。',
    '子图布局与样式：figsize、title、xlabel、ylabel、color、legend。',
    '分组聚合后绘图很有用：df.groupby("城市").sum().plot(kind="bar")。',
    '更炫的可视化用 seaborn（基于 matplotlib，美观默认主题）。',
  ],
  notes: [
    'Jupyter 中可直接嵌入；脚本中要 plt.show()。',
    '厚数据（几十列）不建议一次性全画，先聚焦 1-3 个维度的趋势。',
  ],
  example: `import pandas as pd
import matplotlib.pyplot as plt

# 中文字体（Windows 用 SimHei，macOS 用 PingFang SC / Arial Unicode MS）
plt.rcParams['font.sans-serif'] = ['SimHei', 'PingFang SC', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False

df = pd.DataFrame({
    '月份': [f'{i}月' for i in range(1, 7)],
    '销量': [120, 150, 135, 170, 190, 210],
})

# 折线图
df.plot(x='月份', y='销量', kind='line', marker='o', title='半年销量趋势')
plt.savefig('line.png', dpi=100)

# 柱状图
df.plot(x='月份', y='销量', kind='bar', title='月度销量')
plt.show()`,
  example2: `# 分组聚合 + 柱状图
import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    '城市': ['北京', '上海', '北京', '上海', '广州'],
    '销售额': [100, 120, 110, 90, 80],
})
agg = df.groupby('城市')['销售额'].sum()
agg.plot(kind='bar', title='各城市销售总额（柱状图）')
plt.show()

# 直方图分布
s = pd.Series([1,2,2,3,3,3,4,5,5,7,8])
s.plot(kind='hist', bins=5, title='数值分布')
plt.show()`,
};

const pandas15 = {
  id: 'pandas-correlation',
  title: '15. 统计分析：describe / corr / 分组对比',
  category: '数据分析',
  version: '2.0+',
  level: '进阶',
  summary: '数值列描述统计、相关系数与相关性矩阵、按组做差异分析。',
  detail: [
    'df.describe() 输出数值列 count/mean/std/min/分位数/max；include="all" 含非数值。',
    'df.corr() 计算列间皮尔逊相关系数矩阵；范围 [-1,1]。',
    'df.value_counts() 统计分类列频次；normalize=True 得到比例。',
    'df.cov() 协方差矩阵。',
    '分组对比：df.groupby("组").agg([...]) 观察不同组分布差异。',
    'nunique() 唯一值个数、duplicated().sum() 重复数，辅助数据质量评估。',
  ],
  notes: [
    '相关 ≠ 因果，corr 只能提示线性关联强度。',
    '分类变量的相关可用 cramers_v 等指标，不适用 corr。',
  ],
  example: `import pandas as pd

df = pd.DataFrame({
    '学习时长': [2, 3, 4, 5, 6],
    '成绩': [60, 68, 78, 88, 95],
    '游戏时长': [5, 6, 4, 2, 1],
})

print(df.describe())

print("相关系数矩阵:")
print(df.corr())   # 学习时长与成绩强正相关

print("频次统计:")
s = pd.Series(['A', 'B', 'A', 'C', 'A', 'B'])
print(s.value_counts(normalize=True))

# 分组对比
df2 = pd.DataFrame({
    '组': ['实验'] * 5 + ['对照'] * 5,
    '得分': [85, 90, 88, 92, 86, 70, 72, 68, 75, 71],
})
print(df2.groupby('组')['得分'].agg(['mean', 'std', 'min', 'max']))`,
};

if (typeof module !=="undefined") module.exports = { pandas11, pandas12, pandas13, pandas14, pandas15 };