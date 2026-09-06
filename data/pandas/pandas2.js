// Pandas 教程 —— 第二部分：groupby / merge / 时间序列 / 透视 / 可视化 / 性能 / 管道（7 篇）
module.exports = [
  {
    id: 'pd-groupby',
    title: '8. 分组聚合：groupby / agg / transform / filter',
    category: '数据操作',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'groupby 是 Pandas 的"灵魂三步"——分割、应用、合并：df.groupby(key).agg(func) 能用一行代码完成 SQL 风格的多维聚合。',
    detail: [
      '三步：split（按 key 拆组）→ apply（组内计算）→ combine（拼回结果）。',
      '基础：df.groupby("col")["target"].mean() 等价 SQL 的 SELECT AVG(target) FROM t GROUP BY col。',
      '多键：df.groupby(["a", "b"]).sum()，结果是 MultiIndex。',
      '聚合：.agg({col: func} / [func1, func2])、named aggregation、agg(func, axis=0)。',
      'transform：组内变换，返回与原 df 等长；用于组内 z-score、填充缺失。',
      'filter：组级过滤，保留整组；用于剔除小样本组。',
      'apply：通用方法，能完成复杂逻辑但慢；优先用 agg/transform。',
      'as_index=False 让分组键不成为索引。'
    ],
    notes: [
      'groupby 默认会把分组键设为 index；想保留列加 as_index=False。',
      'groupby 默认 sort=True 排序分组键，慢但可读；明确 sort=False 提速。',
      'transform 必须返回与组等长；agg 每个组返回一个聚合值。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "dept":  ["A", "A", "A", "B", "B", "B"],\n' +
      '    "sex":   ["M", "F", "M", "F", "F", "M"],\n' +
      '    "salary": [10, 12, 11, 20, 22, 21],\n' +
      '})\n' +
      '\n' +
      '# 单键聚合\n' +
      'print("dept 均薪:\\n", df.groupby("dept")["salary"].mean())\n' +
      '\n' +
      '# 多键聚合\n' +
      'print("\\ndept x sex 均薪:\\n", df.groupby(["dept", "sex"])["salary"].mean())\n' +
      '\n' +
      '# agg：多种聚合\n' +
      'print("\\ndept 多个统计量:\\n",\n' +
      '      df.groupby("dept")["salary"].agg(["count", "mean", "min", "max"]))\n' +
      '\n' +
      '# 不同列不同聚合\n' +
      'print("\\n不同列不同聚合:\\n",\n' +
      '      df.groupby("dept").agg(\n' +
      '          n=("salary", "count"),\n' +
      '          avg=("salary", "mean"),\n' +
      '          mx=("salary", "max"),\n' +
      '      ))\n' +
      '\n' +
      '# as_index=False\n' +
      'print("\\nas_index=False:\\n",\n' +
      '      df.groupby("dept", as_index=False)["salary"].mean())',
    example2:
      '# ========== transform 与 filter ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "dept":   ["A", "A", "A", "B", "B", "B"],\n' +
      '    "salary": [10, 12, 11, 20, 22, 21],\n' +
      '})\n' +
      '\n' +
      '# 组内 z-score\n' +
      'df["z"] = df.groupby("dept")["salary"].transform(\n' +
      '    lambda s: (s - s.mean()) / s.std()\n' +
      ')\n' +
      'print("z-score:\\n", df)\n' +
      '\n' +
      '# 组内排名\n' +
      'df["rk"] = df.groupby("dept")["salary"].transform("rank", ascending=False)\n' +
      'print("\\n组内排名:\\n", df)\n' +
      '\n' +
      '# filter：保留样本数 >= 3 的组\n' +
      'small = pd.DataFrame({\n' +
      '    "dept":   ["A", "A", "A", "B", "B"],\n' +
      '    "salary": [10, 12, 11, 20, 22],\n' +
      '})\n' +
      'big = small.groupby("dept").filter(lambda g: len(g) >= 3)\n' +
      'print("\\nfilter 后只留 A:\\n", big)\n' +
      '\n' +
      '# apply：复杂逻辑\n' +
      'def top2(g):\n' +
      '    return g.nlargest(2, "salary")\n' +
      '\n' +
      'print("\\n每组 top-2:\\n", df.groupby("dept").apply(top2, include_groups=False))',
    example3:
      '# ========== 真实场景：销售数据分析 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'np.random.seed(0)\n' +
      'df = pd.DataFrame({\n' +
      '    "order_id": range(1, 11),\n' +
      '    "city":     ["BJ", "BJ", "SH", "SH", "SH", "SZ", "SZ", "BJ", "BJ", "SH"],\n' +
      '    "category": ["A", "B", "A", "B", "A", "A", "B", "B", "A", "A"],\n' +
      '    "amount":   [120, 80, 200, 150, 90, 300, 50, 75, 220, 130],\n' +
      '})\n' +
      '\n' +
      '# 1) 每个城市的总销售额和订单数\n' +
      'city_stats = df.groupby("city", as_index=False).agg(\n' +
      '    orders=("order_id", "count"),\n' +
      '    total=("amount", "sum"),\n' +
      '    avg=("amount", "mean"),\n' +
      ')\n' +
      'print(city_stats)\n' +
      '\n' +
      '# 2) 每个城市每个类别的金额（透视）\n' +
      'pivot = df.pivot_table(\n' +
      '    index="city", columns="category",\n' +
      '    values="amount", aggfunc="sum", fill_value=0,\n' +
      ')\n' +
      'print("\\n透视:\\n", pivot)\n' +
      '\n' +
      '# 3) 城市平均金额的城市排名\n' +
      'df["city_avg"] = df.groupby("city")["amount"].transform("mean")\n' +
      'df["city_rank"] = df.groupby("city")["amount"].transform("rank", ascending=False)\n' +
      'print("\\n带组内平均与排名:\\n", df)\n' +
      '\n' +
      '# 4) 每个城市的 top-1 订单\n' +
      'top1 = df.loc[df.groupby("city")["amount"].idxmax()]\n' +
      'print("\\n每城最高订单:\\n", top1)\n' +
      '\n' +
      '# 5) 自定义聚合：金额 / 订单数\n' +
      'def ratio(s):\n' +
      '    return s.max() / s.min() if s.min() > 0 else np.nan\n' +
      '\n' +
      'print("\\n城市金额 max/min 比:\\n",\n' +
      '      df.groupby("city")["amount"].agg(ratio))'
  },
  {
    id: 'pd-merge',
    title: '9. 合并与连接：merge / join / concat',
    category: '数据操作',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'pd.merge、pd.concat、DataFrame.join 覆盖 SQL JOIN、UNION、表拼接三大场景。',
    detail: [
      'pd.merge(left, right, how="inner", on="key") 等价 SQL 的 JOIN；how 可选 inner / left / right / outer / cross。',
      'join 键：on / left_on / right_on（左右列名不同）、left_index / right_index（用索引对齐）。',
      'validate：校验关系 "one_to_one" / "one_to_many" / "many_to_one" / "many_to_many"，防错。',
      'indicator=True 加 _merge 列显示每行来源。',
      'suffixes：左右同名列重命名后缀。',
      'pd.concat([df1, df2], axis=0) 纵向拼（UNION）；axis=1 横向拼（拼接列）。',
      'df1.join(df2) 默认按索引 join，与 merge 类似但更简洁。',
      '性能：merge 默认 hash join；大数据 + 排序后用 merge_sorted。'
    ],
    notes: [
      'merge 默认 inner 交集；left join 保留左表全部行，右表缺失填 NaN。',
      '列名重复容易踩坑：用 suffixes=("_x", "_y") 或显式重命名。',
      'concat 适合纵向堆叠结构相同的 df；merge 适合按 key 对齐。'
    ],
    example:
      'import pandas as pd\n' +
      '\n' +
      'users = pd.DataFrame({\n' +
      '    "user_id": [1, 2, 3, 4],\n' +
      '    "name":    ["Tom", "Alice", "Bob", "Eve"],\n' +
      '})\n' +
      'orders = pd.DataFrame({\n' +
      '    "order_id": [101, 102, 103, 104, 105],\n' +
      '    "user_id":  [1, 2, 2, 5, 3],\n' +
      '    "amount":   [120, 80, 150, 90, 200],\n' +
      '})\n' +
      '\n' +
      '# 内连接\n' +
      'print("inner:\\n", pd.merge(users, orders, on="user_id", how="inner"))\n' +
      '\n' +
      '# 左连接（保留没下单的 user）\n' +
      'print("\\nleft:\\n", pd.merge(users, orders, on="user_id", how="left"))\n' +
      '\n' +
      '# 全连接\n' +
      'print("\\nouter:\\n", pd.merge(users, orders, on="user_id", how="outer", indicator=True))\n' +
      '\n' +
      '# 用 left_index / right_index 按索引合并\n' +
      'a = pd.DataFrame({"a": [1, 2]}, index=["x", "y"])\n' +
      'b = pd.DataFrame({"b": [10, 20]}, index=["x", "y"])\n' +
      'print("\\n按索引:\\n", a.merge(b, left_index=True, right_index=True))',
    example2:
      '# ========== concat 纵横向拼接 ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      '# 纵向：堆叠相同结构\n' +
      'q1 = pd.DataFrame({"id": [1, 2], "val": [10, 20]})\n' +
      'q2 = pd.DataFrame({"id": [3, 4], "val": [30, 40]})\n' +
      'print("纵向 concat:\\n", pd.concat([q1, q2], ignore_index=True))\n' +
      '\n' +
      '# 横向：拼列（按行索引对齐）\n' +
      'left = pd.DataFrame({"a": [1, 2, 3]}, index=[0, 1, 2])\n' +
      'right = pd.DataFrame({"b": ["x", "y", "z"]}, index=[0, 1, 2])\n' +
      'print("\\n横向 concat:\\n", pd.concat([left, right], axis=1))\n' +
      '\n' +
      '# 不同列拼接（缺失 NaN）\n' +
      'a = pd.DataFrame({"a": [1, 2], "b": [3, 4]})\n' +
      'b = pd.DataFrame({"b": [5, 6], "c": [7, 8]})\n' +
      'print("\\n列不同:\\n", pd.concat([a, b], axis=1))\n' +
      '\n' +
      '# join 简化版\n' +
      'a = pd.DataFrame({"a": [1, 2]}, index=["x", "y"])\n' +
      'b = pd.DataFrame({"b": [10, 20]}, index=["x", "y"])\n' +
      'print("\\njoin:\\n", a.join(b))\n' +
      '\n' +
      '# 一对多 / 多对一校验\n' +
      'left = pd.DataFrame({"k": [1, 1, 2], "v": [10, 20, 30]})\n' +
      'right = pd.DataFrame({"k": [1, 2], "label": ["A", "B"]})\n' +
      'print("\\nvalidate=many_to_one:\\n",\n' +
      '      left.merge(right, on="k", validate="many_to_one"))',
    example3:
      '# ========== 实战：宽表 → 长表（melt） / 长表 → 宽表（pivot） ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      'wide = pd.DataFrame({\n' +
      '    "id":    [1, 2, 3],\n' +
      '    "Q1":    [10, 20, 30],\n' +
      '    "Q2":    [15, 25, 35],\n' +
      '    "Q3":    [12, 22, 32],\n' +
      '    "Q4":    [18, 28, 38],\n' +
      '})\n' +
      'print("宽表:\\n", wide)\n' +
      '\n' +
      '# melt：宽 → 长\n' +
      'long = wide.melt(id_vars="id", var_name="quarter", value_name="sales")\n' +
      'print("\\n长表:\\n", long)\n' +
      '\n' +
      '# pivot：长 → 宽\n' +
      'back = long.pivot(index="id", columns="quarter", values="sales").reset_index()\n' +
      'print("\\n再 pivot 回宽表:\\n", back)\n' +
      '\n' +
      '# pivot_table：支持 aggfunc\n' +
      'df = pd.DataFrame({\n' +
      '    "city":     ["BJ", "BJ", "SH", "SH"],\n' +
      '    "category": ["A",  "B",  "A",  "B"],\n' +
      '    "amount":   [100,  80,  200, 150],\n' +
      '})\n' +
      'print("\\npivot_table:\\n",\n' +
      '      df.pivot_table(index="city", columns="category", values="amount", aggfunc="sum", fill_value=0))\n' +
      '\n' +
      '# crosstab：交叉表\n' +
      'print("\\ncrosstab:\\n",\n' +
      '      pd.crosstab(df["city"], df["category"], values=df["amount"], aggfunc="sum", margins=True))'
  },
  {
    id: 'pd-timeseries',
    title: '10. 时间序列：date_range / resample / shift / rolling / diff',
    category: '数据操作',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'Pandas 是时间序列分析的事实标准：date_range 生成索引、resample 改频率、shift/diff 做差分、rolling 做移动统计。',
    detail: [
      'pd.date_range(start, end, freq) 生成 DatetimeIndex；freq="D"/"H"/"T"/"W"/"M"/"Q"/"Y"，自定义 freq="2H30T"。',
      '索引化：df.set_index("date", inplace=True) 或 df.index = pd.to_datetime(df["date"])。',
      '切片：df["2024-01"]、df["2024-01-15":"2024-02-10"] 用日期字符串做标签切片。',
      'resample：高频 → 低频（"D" → "M"）用 .resample("M").mean()；.resample("H").ffill() 升采样。',
      'shift：.shift(1) 上一期、.shift(-1) 下一期；常用于做 lag 特征。',
      'diff：.diff(1) 差分；.pct_change() 同比变化。',
      'rolling：.rolling(7).mean() 7 期移动平均；.rolling(7, min_periods=1) 容忍前期 NaN。',
      'expanding：.expanding().mean() 累计平均。'
    ],
    notes: [
      'resample 与 groupby 类似，但 groupby 键必须是时间；resample 支持时间偏移别名。',
      'shift 出来的列默认 float；要保留 int 先 astype。',
      'rolling 默认 min_periods=window（前期会有 NaN）；用 min_periods=1 让初期即可计算。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'idx = pd.date_range("2024-01-01", periods=14, freq="D")\n' +
      'df = pd.DataFrame({\n' +
      '    "sales": np.random.randint(50, 200, 14),\n' +
      '}, index=idx)\n' +
      'print("日数据:\\n", df)\n' +
      '\n' +
      '# 月度聚合（resample）\n' +
      'monthly = df.resample("M").sum()\n' +
      'print("\\n月度合计:\\n", monthly)\n' +
      '\n' +
      '# 7 天移动平均\n' +
      'df["ma7"] = df["sales"].rolling(7, min_periods=1).mean()\n' +
      'print("\\n7 日 MA:\\n", df)\n' +
      '\n' +
      '# 差分与同比\n' +
      'df["diff"]  = df["sales"].diff()\n' +
      'df["pct"]   = df["sales"].pct_change()\n' +
      'print("\\n差分与同比:\\n", df)\n' +
      '\n' +
      '# shift：昨日 / 明日\n' +
      'df["lag1"]  = df["sales"].shift(1)\n' +
      'df["lead1"] = df["sales"].shift(-1)\n' +
      'print("\\nshift:\\n", df.head(3))',
    example2:
      '# ========== 时区与重采样 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      '# 带时区的时间索引\n' +
      'idx = pd.date_range("2024-01-01 00:00", periods=48, freq="H", tz="UTC")\n' +
      's = pd.Series(np.random.randn(48), index=idx)\n' +
      'print("UTC 索引:\", s.index.tz)\n' +
      '\n' +
      '# 转到北京时间\n' +
      's_bj = s.tz_convert("Asia/Shanghai")\n' +
      'print("北京时间示例:", s_bj.head(2).index.tolist())\n' +
      '\n' +
      '# 重采样到 6H\n' +
      'six_h = s.resample("6H").mean()\n' +
      'print("\\n6H 均值:\\n", six_h)\n' +
      '\n' +
      '# 重采样到 15min：升采样 + 插值\n' +
      'fine = s.resample("15min").interpolate("linear")\n' +
      'print("\\n15min 插值后长度:", len(fine))\n' +
      '\n' +
      '# 自定义 freq：每周第一个工作日\n' +
      'weekly = s.resample("B").first()\n' +
      'print("\\n工作日 freq:\\n", weekly.head(3))',
    example3:
      '# ========== 实战：股票 K 线（OHLCV）分析 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'idx = pd.date_range("2024-01-01 09:30", periods=240, freq="min")\n' +
      'price = 100 + np.cumsum(np.random.randn(240) * 0.1)\n' +
      'df = pd.DataFrame({\n' +
      '    "open":  price,\n' +
      '    "high":  price + np.abs(np.random.randn(240) * 0.2),\n' +
      '    "low":   price - np.abs(np.random.randn(240) * 0.2),\n' +
      '    "close": price + np.random.randn(240) * 0.05,\n' +
      '    "vol":   np.random.randint(1000, 5000, 240),\n' +
      '}, index=idx)\n' +
      '\n' +
      '# 30 分钟 K 线\n' +
      'bars = df.resample("30min").agg({\n' +
      '    "open":  "first",\n' +
      '    "high":  "max",\n' +
      '    "low":   "min",\n' +
      '    "close": "last",\n' +
      '    "vol":   "sum",\n' +
      '})\n' +
      'print("30 分钟 K 线:\\n", bars.head())\n' +
      '\n' +
      '# 技术指标\n' +
      'bars["ma20"] = bars["close"].rolling(20, min_periods=1).mean()\n' +
      'bars["ret"]  = bars["close"].pct_change()\n' +
      'bars["vol_20"] = bars["ret"].rolling(20, min_periods=1).std()\n' +
      'print("\\n带 MA 与波动率:\\n", bars.head())\n' +
      '\n' +
      '# 寻找日内的最高 / 最低点\n' +
      'daily = df.resample("D").agg({"high": "max", "low": "min"})\n' +
      'print("\\n日内高/低:\\n", daily.head())\n' +
      '\n' +
      '# 联动：close 滞后一期作为"昨日收盘"\n' +
      'bars["prev_close"] = bars["close"].shift(1)\n' +
      'bars["gap"]        = (bars["open"] - bars["prev_close"]) / bars["prev_close"]\n' +
      'print("\\n跳空缺口:\\n", bars[["open", "prev_close", "gap"]].head())'
  },
  {
    id: 'pd-pivot',
    title: '11. 透视与交叉表：pivot / pivot_table / crosstab / stack / unstack',
    category: '分析可视化',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'pivot 把长表转宽表；pivot_table 加上聚合函数；crosstab 专做列联表；stack/unstack 是重塑行列的工具。',
    detail: [
      'pivot(index, columns, values)：长表 → 宽表；要求 (index, columns) 唯一，否则报错。',
      'pivot_table(index, columns, values, aggfunc, fill_value)：与 pivot 类似但支持聚合，可处理重复键。',
      'crosstab(index, columns, values, aggfunc, margins)：专用列联表，支持行/列合计（margins=True）。',
      'stack / unstack：把列转成行（stack）或反之（unstack）；用于多级索引的形状切换。',
      'melt：宽表 → 长表，逆操作。',
      'explode：把列表/元组列拆成多行。'
    ],
    notes: [
      'pivot 不聚合，遇到重复键会 ValueError；不确定时优先 pivot_table。',
      'crosstab 默认 aggfunc="count"（计数）；传 values 改成求和等。',
      'Pandas 2.x 起 stack 默认 future_stack=True 行为更直观。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "city":     ["BJ", "BJ", "SH", "SH", "SH", "SZ"],\n' +
      '    "category": ["A",  "B",  "A",  "B",  "A",  "A"],\n' +
      '    "amount":   [100,  80,  200, 150, 90,  300],\n' +
      '})\n' +
      '\n' +
      '# pivot：要求唯一\n' +
      'p = df.pivot(index="city", columns="category", values="amount")\n' +
      'print("pivot:\\n", p)\n' +
      '\n' +
      '# pivot_table：聚合\n' +
      'pt = df.pivot_table(\n' +
      '    index="city", columns="category",\n' +
      '    values="amount", aggfunc="sum", fill_value=0,\n' +
      ')\n' +
      'print("\\npivot_table:\\n", pt)\n' +
      '\n' +
      '# 多聚合\n' +
      'multi = df.pivot_table(\n' +
      '    index="city", columns="category",\n' +
      '    values="amount", aggfunc=["sum", "mean"],\n' +
      ')\n' +
      'print("\\n多聚合:\\n", multi)',
    example2:
      '# ========== crosstab + margins ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      'df = pd.DataFrame({\n' +
      '    "sex":   ["M", "F", "M", "F", "M", "F", "M"],\n' +
      '    "hand":  ["L", "R", "R", "R", "L", "L", "R"],\n' +
      '    "score": [88, 92, 75, 80, 95, 70, 82],\n' +
      '})\n' +
      '\n' +
      '# 默认计数\n' +
      'print("列联表（计数）:\\n", pd.crosstab(df["sex"], df["hand"]))\n' +
      '\n' +
      '# margins\n' +
      'print("\\nmargins=True:\\n",\n' +
      '      pd.crosstab(df["sex"], df["hand"], margins=True, margins_name="Total"))\n' +
      '\n' +
      '# 加 values\n' +
      'print("\\n带 values（求和）:\\n",\n' +
      '      pd.crosstab(df["sex"], df["hand"], values=df["score"], aggfunc="sum", margins=True, fill_value=0))\n' +
      '\n' +
      '# 归一化（normalize）\n' +
      'print("\\n归一化（行百分比）:\\n",\n' +
      '      pd.crosstab(df["sex"], df["hand"], normalize="index").round(3))',
    example3:
      '# ========== melt / stack / unstack / explode ==========\n' +
      'import pandas as pd\n' +
      '\n' +
      'wide = pd.DataFrame({\n' +
      '    "id":  [1, 2],\n' +
      '    "Q1":  [10, 20],\n' +
      '    "Q2":  [15, 25],\n' +
      '})\n' +
      'print("宽表:\\n", wide)\n' +
      '\n' +
      '# melt：宽 → 长\n' +
      'long = wide.melt(id_vars="id", var_name="quarter", value_name="val")\n' +
      'print("\\n长表:\\n", long)\n' +
      '\n' +
      '# MultiIndex 的 stack / unstack\n' +
      'idx = pd.MultiIndex.from_product([["BJ", "SH"], [2023, 2024]], names=["city", "year"])\n' +
      's = pd.Series([10, 20, 30, 40, 50, 60, 70, 80], index=idx[:4])\n' +
      'print("\\nMultiIndex Series:\\n", s)\n' +
      'print("\\nunstack (year -> 列):\\n", s.unstack(level="year"))\n' +
      'print("\\nstack 回去:\\n", s.unstack(level="year").stack(future_stack=True))\n' +
      '\n' +
      '# explode：把列表列拆成多行\n' +
      'df = pd.DataFrame({\n' +
      '    "id":   [1, 2],\n' +
      '    "tags": [["A", "B"], ["C"]],\n' +
      '})\n' +
      'print("\\nexplode 后:\\n", df.explode("tags"))'
  },
  {
    id: 'pd-plot',
    title: '12. 可视化：plot / matplotlib / seaborn 集成',
    category: '分析可视化',
    version: 'Pandas 2.x',
    level: '进阶',
    summary: 'df.plot() 直接用 matplotlib 画图；Plotly + cufflinks 是交互式备选；Pandas 与 seaborn 无缝集成画统计图。',
    detail: [
      'df.plot() 默认线图；kind="bar"/"barh"/"hist"/"box"/"kde"/"scatter"/"pie"/"area"/"hexbin" 等。',
      'plot 子参数：title、xlabel、ylabel、figsize、subplots、layout、logx/logy。',
      'plot.scatter(x, y, c=, s=) 直接画散点。',
      '多图：subplots=True / layout=(rows, cols)；与 ax= 配合手动画布。',
      'Matplotlib 深度集成：fig, ax = plt.subplots(); df.plot(ax=ax) 把图画到指定 axes。',
      'Seaborn：sns.barplot(data=df, x=, y=, hue=) 几乎直接吃 DataFrame。',
      'Plotly（可选）：import plotly.express as px; px.line(df, x=, y=) 出交互图。'
    ],
    notes: [
      'df.plot.hist() 调每列画一张；df.plot.hist(subplots=True, layout=(2,2)) 多图。',
      'pandas 默认后端是 matplotlib；用 pandas_bokeh / plotly 替换要装对应库。',
      '画图前先 df.info() / df.describe() 看分布，再决定图类型。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import matplotlib\n' +
      'matplotlib.use("Agg")            # 不弹窗\n' +
      'import matplotlib.pyplot as plt\n' +
      '\n' +
      'idx = pd.date_range("2024-01-01", periods=60, freq="D")\n' +
      'df = pd.DataFrame({\n' +
      '    "A": np.cumsum(np.random.randn(60)) + 100,\n' +
      '    "B": np.cumsum(np.random.randn(60)) + 100,\n' +
      '    "C": np.cumsum(np.random.randn(60)) + 100,\n' +
      '}, index=idx)\n' +
      '\n' +
      '# 线图\n' +
      'ax = df.plot(title="Three Series", figsize=(8, 4))\n' +
      'ax.set_xlabel("date"); ax.set_ylabel("value")\n' +
      'fig = ax.get_figure()\n' +
      'fig.savefig("/tmp/pandas_plot_line.png", dpi=100, bbox_inches="tight")\n' +
      'print("线图保存到 /tmp/pandas_plot_line.png")\n' +
      '\n' +
      '# 柱图\n' +
      'ax = df.iloc[-10:].plot.bar(figsize=(8, 4), title="Last 10 days")\n' +
      'ax.get_figure().savefig("/tmp/pandas_plot_bar.png", dpi=100, bbox_inches="tight")\n' +
      'print("柱图保存")\n' +
      '\n' +
      '# 直方图 / 密度\n' +
      'ax = df.plot.hist(bins=30, alpha=0.5, figsize=(8, 4))\n' +
      'ax.get_figure().savefig("/tmp/pandas_plot_hist.png", dpi=100, bbox_inches="tight")\n' +
      'print("直方图保存")\n' +
      '\n' +
      '# 散点\n' +
      'ax = df.plot.scatter(x="A", y="B", c="C", colormap="viridis", figsize=(6, 6))\n' +
      'ax.get_figure().savefig("/tmp/pandas_plot_scatter.png", dpi=100, bbox_inches="tight")\n' +
      'print("散点图保存")',
    example2:
      '# ========== 子图与 matplotlib 深度协作 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import matplotlib\n' +
      'matplotlib.use("Agg")\n' +
      'import matplotlib.pyplot as plt\n' +
      '\n' +
      'idx = pd.date_range("2024-01-01", periods=120, freq="D")\n' +
      'df = pd.DataFrame({\n' +
      '    "sales":  np.cumsum(np.random.randn(120)) + 200,\n' +
      '    "profit": np.cumsum(np.random.randn(120)) + 50,\n' +
      '    "visits": np.cumsum(np.random.randn(120)) + 1000,\n' +
      '}, index=idx)\n' +
      '\n' +
      'fig, axes = plt.subplots(2, 2, figsize=(12, 8))\n' +
      'df["sales"].plot(ax=axes[0, 0], title="sales line")\n' +
      'df["sales"].plot.hist(ax=axes[0, 1], bins=20, title="sales hist")\n' +
      'df["sales"].plot.box(ax=axes[1, 0], title="sales box")\n' +
      'df["sales"].rolling(7).mean().plot(ax=axes[1, 1], title="sales 7d MA")\n' +
      '\n' +
      'fig.tight_layout()\n' +
      'fig.savefig("/tmp/pandas_subplots.png", dpi=100)\n' +
      'print("子图保存")\n' +
      '\n' +
      '# 同一张图叠加多 Series\n' +
      'ax = df[["sales", "profit"]].plot(figsize=(8, 4), title="sales & profit")\n' +
      'df["sales"].rolling(7).mean().plot(ax=ax, label="7d MA", ls="--")\n' +
      'ax.legend()\n' +
      'ax.get_figure().savefig("/tmp/pandas_overlay.png", dpi=100, bbox_inches="tight")\n' +
      'print("叠加图保存")',
    example3:
      '# ========== Seaborn 一键统计图 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import matplotlib\n' +
      'matplotlib.use("Agg")\n' +
      'import matplotlib.pyplot as plt\n' +
      '\n' +
      'try:\n' +
      '    import seaborn as sns\n' +
      '    have_sns = True\n' +
      'except ImportError:\n' +
      '    have_sns = False\n' +
      '    print("未安装 seaborn：pip install seaborn 即可")\n' +
      '\n' +
      'if have_sns:\n' +
      '    np.random.seed(0)\n' +
      '    df = pd.DataFrame({\n' +
      '        "city":   np.random.choice(["BJ", "SH", "SZ"], 300),\n' +
      '        "sex":    np.random.choice(["M", "F"], 300),\n' +
      '        "age":    np.random.randint(18, 60, 300),\n' +
      '        "salary": np.random.randint(50, 200, 300) * 100,\n' +
      '    })\n' +
      '\n' +
      '    fig, axes = plt.subplots(2, 2, figsize=(12, 8))\n' +
      '    sns.boxplot(data=df, x="city", y="salary", ax=axes[0, 0])\n' +
      '    sns.violinplot(data=df, x="city", y="salary", hue="sex", split=True, ax=axes[0, 1])\n' +
      '    sns.scatterplot(data=df, x="age", y="salary", hue="city", ax=axes[1, 0])\n' +
      '    sns.heatmap(df.pivot_table(index="age", columns="city", values="salary", aggfunc="mean"),\n' +
      '                cmap="viridis", ax=axes[1, 1])\n' +
      '    fig.tight_layout()\n' +
      '    fig.savefig("/tmp/seaborn_demo.png", dpi=100)\n' +
      '    print("seaborn 4 子图保存")\n' +
      '\n' +
      '    # 配对图：sns.pairplot 一次性看所有数值列\n' +
      '    sns.pairplot(df[["age", "salary", "city"]], hue="city")\n' +
      '    plt.savefig("/tmp/seaborn_pairplot.png", dpi=100)\n' +
      '    print("pairplot 保存")\n' +
      'else:\n' +
      '    print("演示用 df 的字段与聚合:\\n",\n' +
      '          df.pivot_table(index="city", values="salary", aggfunc=["mean", "std"]).round(1))'
  },
  {
    id: 'pd-perf',
    title: '13. 性能优化：向量化、eval / query、避免遍历、Cython/numba',
    category: '进阶',
    version: 'Pandas 2.x',
    level: '高阶',
    summary: 'Pandas 性能的核心：尽量向量化、用 query/eval 加速布尔与算术、避免 iterrows、选择合适 dtype、用 Numba/Cython 加速瓶颈。',
    detail: [
      '向量化优先：能用 .str / .dt 访问器就别用 apply；能用 NumPy ufunc 就不用 .apply(lambda)。',
      'iterrows / itertuples：逐行遍历极慢，只在原型阶段使用；正式代码用矢量化。',
      'df.eval() / df.query()：把表达式编译为更高效的 Python 字节码或 numexpr 后端。',
      'Categorical / Nullable dtype：低基数列用 category，可空列用 Int64 / StringDtype()。',
      '避免链式索引：df["a"][mask] = ... 会触发 SettingWithCopyWarning；统一用 df.loc[mask, "a"] = ...。',
      'chunksize / dask：超大数据用分块读或 Dask 替代。',
      'Cython / numba：自定义热路径函数用 @njit 加速；Pandas 2.x 引入 pd.api.extensions.register_dataframe_accessor 让自定义访问器类型化。'
    ],
    notes: [
      'iterrows 比 itertuples 慢一个数量级；后者是命名元组。',
      'query / eval 内部用 numexpr（可选安装），无 numexpr 时仍是纯 Python 表达式，收益有限。',
      'astype("category") 后再做 groupby 比 object 字符串列快很多。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'N = 1_000_000\n' +
      'df = pd.DataFrame({\n' +
      '    "a": np.random.randn(N),\n' +
      '    "b": np.random.randn(N),\n' +
      '    "c": np.random.choice(["x", "y", "z"], N),\n' +
      '})\n' +
      '\n' +
      '# 1) apply vs 矢量化\n' +
      't0 = time.perf_counter()\n' +
      'r1 = df.apply(lambda row: row["a"] * 2 + row["b"] ** 2, axis=1)\n' +
      'apply_t = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'r2 = df["a"] * 2 + df["b"] ** 2\n' +
      'vec_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"apply axis=1: {apply_t*1000:.0f} ms")\n' +
      'print(f"矢量化      : {vec_t*1000:.0f} ms")\n' +
      'print(f"加速        : {apply_t/vec_t:.0f}x")\n' +
      '\n' +
      '# 2) iterrows vs 矢量化\n' +
      't0 = time.perf_counter()\n' +
      'total = 0\n' +
      'for _, row in df.iterrows():\n' +
      '    total += row["a"] + row["b"]\n' +
      'iter_t = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'total2 = (df["a"] + df["b"]).sum()\n' +
      'vec2_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"\\niterrows : {iter_t*1000:.0f} ms")\n' +
      'print(f"矢量化   : {vec2_t*1000:.0f} ms")\n' +
      'print(f"加速     : {iter_t/vec2_t:.0f}x")',
    example2:
      '# ========== query / eval 与 category 加速 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'N = 1_000_000\n' +
      'df = pd.DataFrame({\n' +
      '    "a": np.random.randn(N),\n' +
      '    "b": np.random.randn(N),\n' +
      '    "c": np.random.choice(["x", "y", "z"], N),\n' +
      '})\n' +
      '\n' +
      '# query 表达式\n' +
      't0 = time.perf_counter()\n' +
      'sub = df.query("(a > 0) & (b < 1) & (c == \\"x\\")")\n' +
      'qt = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'mask = (df["a"] > 0) & (df["b"] < 1) & (df["c"] == "x")\n' +
      'sub2 = df[mask]\n' +
      'mt = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"query  : {qt*1000:.0f} ms (n={len(sub)})")\n' +
      'print(f"mask   : {mt*1000:.0f} ms")\n' +
      'print("结果一致?", sub.equals(sub2))\n' +
      '\n' +
      '# eval：复杂算术\n' +
      'df.eval("d = a * 2 + b ** 2 - 1", inplace=True)\n' +
      'print("\\n新增 d 列:\\n", df.head(3))\n' +
      '\n' +
      '# category 加速 groupby\n' +
      'df_obj = df.copy()\n' +
      'df_cat = df.copy()\n' +
      'df_cat["c"] = df_cat["c"].astype("category")\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'df_obj.groupby("c")["a"].mean()\n' +
      'obj_t = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'df_cat.groupby("c")["a"].mean()\n' +
      'cat_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"\\nobject groupby: {obj_t*1000:.1f} ms")\n' +
      'print(f"category groupby: {cat_t*1000:.1f} ms")',
    example3:
      '# ========== numba 自定义 rolling / 加速瓶颈 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'try:\n' +
      '    from numba import njit\n' +
      '    have_nb = True\n' +
      'except ImportError:\n' +
      '    have_nb = False\n' +
      '    print("未安装 numba：pip install numba 即可")\n' +
      '\n' +
      'N = 1_000_000\n' +
      's = pd.Series(np.random.randn(N))\n' +
      'window = 20\n' +
      '\n' +
      '# Pandas 自带 rolling\n' +
      't0 = time.perf_counter()\n' +
      'r1 = s.rolling(window).mean()\n' +
      'pd_t = time.perf_counter() - t0\n' +
      'print(f"pandas rolling: {pd_t*1000:.0f} ms")\n' +
      '\n' +
      'if have_nb:\n' +
      '    @njit\n' +
      '    def rolling_mean_nb(arr, w):\n' +
      '        n = arr.size\n' +
      '        out = np.empty(n)\n' +
      '        s_ = 0.0\n' +
      '        for i in range(n):\n' +
      '            s_ += arr[i]\n' +
      '            if i >= w:\n' +
      '                s_ -= arr[i - w]\n' +
      '            out[i] = s_ / min(i + 1, w)\n' +
      '        return out\n' +
      '\n' +
      '    # 第一次含编译\n' +
      '    t0 = time.perf_counter()\n' +
      '    r2 = rolling_mean_nb(s.to_numpy(), window)\n' +
      '    print(f"numba（含编译）: {(time.perf_counter()-t0)*1000:.0f} ms")\n' +
      '\n' +
      '    t0 = time.perf_counter()\n' +
      '    r2 = rolling_mean_nb(s.to_numpy(), window)\n' +
      '    nb_t = time.perf_counter() - t0\n' +
      '    print(f"numba（仅运行）: {nb_t*1000:.0f} ms")\n' +
      '    print(f"加速: {pd_t/nb_t:.0f}x")\n' +
      '\n' +
      '    print("结果接近?", np.allclose(r1.values[window-1:], r2[window-1:], atol=1e-6))\n' +
      '\n' +
      '# 内存 profile\n' +
      'big = pd.DataFrame(np.random.randn(1_000_000, 10), columns=list("ABCDEFGHIJ"))\n' +
      'print(f"\\n1Mx10 float64: {big.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB")\n' +
      'small = big.astype("float32")\n' +
      'print(f"   转为 float32: {small.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB")'
  },
  {
    id: 'pd-pipe',
    title: '14. 方法链与管道：pipe / assign / query / style',
    category: '进阶',
    version: 'Pandas 2.x',
    level: '高阶',
    summary: '方法链（method chaining）让数据处理流程像流水线一样可读；pipe 把外部函数嵌入；assign 加列；style 做格式化输出。',
    detail: [
      '方法链：df.method1().method2().method3()… 让流程线性可读；用回车 + 反斜杠断行。',
      'pipe：df.pipe(func, *args, **kwargs) 把外部函数融入链；func 第一个参数是 df。',
      'assign：df.assign(new_col=expr) 在不修改原 df 的前提下加列；可串联多个 assign。',
      'query：链中做条件过滤。',
      'rename：df.rename(columns=str.lower) 统一列名风格。',
      'Styler：df.style 高亮 / 渐变 / 格式化（df.style.background_gradient / .format / .bar）。',
      'Jupyter / 输出报表：.to_html / .to_markdown / .to_latex 一键出格式。'
    ],
    notes: [
      'Pandas 2.x 默认 Copy-on-Write 开启，链中不再轻易触发 SettingWithCopyWarning。',
      '用 .pipe 替代难看的函数调用 f(g(h(df), x), y)，更接近自然语言。',
      'Styler 在 Jupyter / Streamlit / Web 渲染里都很有用。'
    ],
    example:
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'raw = pd.DataFrame({\n' +
      '    "User_ID":   [1, 2, 3, 4, 5],\n' +
      '    "age":       [28, np.nan, 31, 24, 35],\n' +
      '    "City":      ["BJ", "sh", "SZ", "bj", "SH"],\n' +
      '    "Spend_USD": [120, 80, 200, 150, 90],\n' +
      '})\n' +
      '\n' +
      '# 一些独立处理函数（用 pipe 串起来）\n' +
      'def norm_cols(df):\n' +
      '    df = df.copy()\n' +
      '    df.columns = [c.strip().lower() for c in df.columns]\n' +
      '    return df\n' +
      '\n' +
      'def fill_age(df, default=30):\n' +
      '    df = df.copy()\n' +
      '    df["age"] = df["age"].fillna(default).astype(int)\n' +
      '    return df\n' +
      '\n' +
      'def city_upper(df):\n' +
      '    df = df.copy()\n' +
      '    df["city"] = df["city"].str.upper()\n' +
      '    return df\n' +
      '\n' +
      'def add_spend_cny(df, rate=7.0):\n' +
      '    return df.assign(spend_cny=df["spend_usd"] * rate)\n' +
      '\n' +
      '# 方法链：完整 ETL\n' +
      'clean = (\n' +
      '    raw\n' +
      '    .pipe(norm_cols)\n' +
      '    .pipe(fill_age)\n' +
      '    .pipe(city_upper)\n' +
      '    .pipe(add_spend_cny, rate=7.2)\n' +
      '    .query("spend_cny > 600")\n' +
      '    .sort_values("spend_cny", ascending=False)\n' +
      '    .reset_index(drop=True)\n' +
      ')\n' +
      'print(clean)',
    example2:
      '# ========== assign + query + groupby 链 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'np.random.seed(0)\n' +
      'df = pd.DataFrame({\n' +
      '    "dept":   np.random.choice(["A", "B", "C"], 12),\n' +
      '    "salary": np.random.randint(50, 200, 12) * 10,\n' +
      '    "year":   np.random.choice([2023, 2024], 12),\n' +
      '})\n' +
      '\n' +
      'result = (\n' +
      '    df\n' +
      '    .assign(\n' +
      '        bonus = lambda d: d["salary"] * 0.1,\n' +
      '        total = lambda d: d["salary"] + d["salary"] * 0.1,\n' +
      '    )\n' +
      '    .query("total > 1000")\n' +
      '    .groupby(["dept", "year"], as_index=False)\n' +
      '    .agg(avg_total=("total", "mean"), n=("total", "size"))\n' +
      '    .sort_values("avg_total", ascending=False)\n' +
      '    .reset_index(drop=True)\n' +
      ')\n' +
      'print(result)\n' +
      '\n' +
      '# rename 列名风格\n' +
      'df2 = df.rename(columns=str.upper).head(3)\n' +
      'print("\\nrename 后列名:", df2.columns.tolist())',
    example3:
      '# ========== Styler：可视化报表输出 ==========\n' +
      'import pandas as pd\n' +
      'import numpy as np\n' +
      '\n' +
      'np.random.seed(0)\n' +
      'df = pd.DataFrame({\n' +
      '    "name":   ["Tom", "Alice", "Bob", "Eve", "Carl"],\n' +
      '    "score":  [88, 92, 75, 80, 95],\n' +
      '    "income": [4500, 8200, 3100, 5500, 9800],\n' +
      '})\n' +
      '\n' +
      'styled = (\n' +
      '    df.style\n' +
      '      .format({"score": "{:.0f}", "income": "{:,} 元"})\n' +
      '      .background_gradient(subset="score", cmap="RdYlGn", vmin=0, vmax=100)\n' +
      '      .bar(subset="income", color="#7ee2a8", vmin=0)\n' +
      '      .set_caption("员工 KPI 报表")\n' +
      '      .set_properties(**{"text-align": "center"})\n' +
      ')\n' +
      '\n' +
      'html = styled.to_html()\n' +
      'print("HTML 长度:", len(html), "字符；前 200 字符:")\n' +
      'print(html[:200])\n' +
      '\n' +
      '# to_markdown / to_latex\n' +
      'try:\n' +
      '    print("\\nMarkdown:\\n", df.to_markdown(index=False))\n' +
      'except ImportError:\n' +
      '    print("安装 tabulate 后可输出 Markdown：pip install tabulate")\n' +
      '\n' +
      '# 在 Jupyter 里直接 styled（不弹窗）\n' +
      '# 在文件场景：styled.to_html("report.html") 即可生成可分享的网页\n' +
      '\n' +
      '# Pipe + 自定义分析函数\n' +
      'def summary(df):\n' +
      '    return pd.Series({\n' +
      '        "n"    : len(df),\n' +
      '        "score_avg": df["score"].mean(),\n' +
      '        "score_max": df["score"].max(),\n' +
      '        "income_total": df["income"].sum(),\n' +
      '    })\n' +
      '\n' +
      'print("\\nSummary:\\n", df.pipe(summary))'
  }
];
