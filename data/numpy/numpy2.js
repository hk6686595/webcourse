// NumPy 教程 —— 第二部分：广播、聚合、线性代数、随机、文件 IO、性能（7 篇）
module.exports = [
  {
    id: 'numpy-broadcast',
    title: '9. 广播机制：不同形状数组的逐元素运算',
    category: '运算',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: '广播 (broadcasting) 让不同 shape 的数组在算术运算时按规则自动"扩展"，是 NumPy 向量化编程的核心机制。',
    detail: [
      '广播的规则（从右往左对齐两 shape）：维度相等、或其中一边为 1 时可以广播；否则报错。',
      '例：shape (3, 4) + (4,) -> (3, 4) + (1, 4) -> (3, 4)；shape (3, 1) + (1, 4) -> (3, 4)。',
      '广播本质不分配大块内存：通过 strides 巧妙步进，使每个位置的"虚拟元素"恰好对齐。这种零拷贝扩展就是向量化代码简洁高效的根因。',
      '常用场景：图像减去均值、矩阵按行归一化、计算 pair-wise 距离等。',
      '显式广播：np.broadcast_to(arr, shape) 强制广播到目标 shape（返回只读视图）；np.broadcast_arrays(a, b) 把多个数组广播到共同 shape。',
      'np.newaxis / None 是给维度占位的标准方法，用于构造广播对齐。'
    ],
    notes: [
      '广播不会真的复制大数组，只有在需要时（迭代输出）才物化，理解这一点对性能调优很关键。',
      '形状 (3,) 和 (4,) 不能直接相加，因为对齐后是 (3,) 和 (4,) 不兼容，会触发 ValueError。',
      '在 reduce 时保留维度用 keepdims=True，使结果能继续广播。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'A = np.ones((3, 4))                 # (3, 4)\n' +
      'b = np.array([10, 20, 30, 40])      # (4,)\n' +
      'C = A + b                            # 每行加 b\n' +
      'print(C)                             # 每行 = [11,21,31,41]\n' +
      '\n' +
      '# 列方向\n' +
      'col = np.array([[100], [200], [300]])   # (3, 1)\n' +
      'D = A + col                              # 每列加 col\n' +
      'print(D)\n' +
      '\n' +
      '# 不兼容的形状\n' +
      'try:\n' +
      '    np.ones((3, 4)) + np.ones((3,))\n' +
      'except ValueError as e:\n' +
      '    print("错误:", e)\n' +
      '\n' +
      '# keepdims 让归约结果能广播\n' +
      'row_mean = A.mean(axis=1, keepdims=True)   # (3, 1)\n' +
      'print(A - row_mean)                          # 每行中心化',
    example2:
      '# ========== 经典：图像批量归一化 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 100 张 32x32 RGB 图像\n' +
      'batch = np.random.rand(100, 32, 32, 3) * 255\n' +
      '\n' +
      '# 按 batch + H + W 维求每通道均值/标准差 -> 形状 (3,)\n' +
      'mean = batch.mean(axis=(0, 1, 2))          # (3,)\n' +
      'std  = batch.std(axis=(0, 1, 2))           # (3,)\n' +
      '\n' +
      '# 减去每通道均值：自动广播 (3,) -> (1,1,1,3) -> 整个 batch\n' +
      'norm = (batch - mean) / (std + 1e-7)\n' +
      'print(norm.shape)                           # (100, 32, 32, 3)\n' +
      'print("每通道均值≈0?", np.allclose(norm.mean(axis=(0,1,2)), 0))\n' +
      '\n' +
      '# ========== Pairwise 距离矩阵（零复制） ==========\n' +
      'pts = np.random.rand(50, 2)\n' +
      'diff = pts[:, np.newaxis, :] - pts[np.newaxis, :, :]   # (50,50,2)\n' +
      'dist = np.sqrt((diff ** 2).sum(-1))                    # (50, 50)\n' +
      'print(dist.shape, "对角线≈0?", np.allclose(np.diag(dist), 0))',
    example3:
      '# ========== 显式 broadcast_to / broadcast_arrays ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'a = np.array([1, 2, 3])\n' +
      'b = np.broadcast_to(a, (4, 3))   # 逻辑扩展为 (4,3)，但只读视图\n' +
      'print(b)\n' +
      '\n' +
      '# 不允许写\n' +
      'try:\n' +
      '    b[0, 0] = 99\n' +
      'except ValueError as e:\n' +
      '    print("错误:", e)\n' +
      '\n' +
      '# 想修改就 .copy()\n' +
      'b2 = np.broadcast_to(a, (4, 3)).copy()\n' +
      'b2[0, 0] = 99\n' +
      'print(b2[0])\n' +
      '\n' +
      '# 把多组不同 shape 数组对齐到共同 shape\n' +
      'a = np.array([1, 2, 3])              # (3,)\n' +
      'b = np.array([[10], [20]])           # (2, 1)\n' +
      'A, B = np.broadcast_arrays(a, b)     # 都变 (2, 3)\n' +
      'print(A.shape, B.shape)\n' +
      'print(A + B)'
  },
  {
    id: 'numpy-aggregate',
    title: '10. 聚合与轴：sum / mean / std / min / max / argmin / cumsum',
    category: '运算',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: '聚合（reduction）把数组沿一个或多个 axis 浓缩为更少维度：sum / mean / std / min / max 等。正确理解 axis 是数据处理的关键。',
    detail: [
      'axis 是被"压扁"的那一维：axis=0 表示沿第一个维度聚合，方向是"垂直"；axis=1 表示沿第二个维度聚合，方向是"水平"。',
      '常见聚合：np.sum / np.mean / np.std / np.var / np.min / np.max / np.argmin / np.argmax / np.prod / np.median / np.percentile / np.any / np.all。',
      'a.sum(axis=k) 等价 np.sum(a, axis=k)，方法版本稍快。',
      'keepdims=True 保留被压维度为 1，便于广播。',
      '累积（不改变形状）：np.cumsum、np.cumprod 沿指定轴返回前缀和/积。',
      '安全版本：np.nanmean / np.nansum / nanstd 在计算时忽略 NaN。'
    ],
    notes: [
      'axis 的方向最容易记错：a.shape=(2,3)，a.sum(axis=0) 形状变 (3,)，a.sum(axis=1) 形状变 (2,)。',
      'argmin / argmax 返回扁平下标；要拿多维下标用 np.unravel_index(idx, a.shape)。',
      '默认 dtype 是 float64，累加大整数数组可能溢出：明确 dtype=np.float64 或用 np.add.at 避免中间类型提升。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'a = np.arange(12).reshape(3, 4)\n' +
      'print(a)\n' +
      'print("全和      :", a.sum())\n' +
      'print("按行求和   :", a.sum(axis=1))    # 沿 axis=1(列)压扁 -> 行向量\n' +
      'print("按列求和   :", a.sum(axis=0))    # 沿 axis=0(行)压扁 -> 列向量\n' +
      'print("按行均值   :", a.mean(axis=1))\n' +
      'print("按列最大值 :", a.max(axis=0))\n' +
      'print("argmax 扁平:", a.argmax())\n' +
      'print("argmax 行 :", a.argmax(axis=1))\n' +
      '\n' +
      '# keepdims\n' +
      'm = a.mean(axis=1, keepdims=True)\n' +
      'print(m.shape, a - m)             # 每行中心化',
    example2:
      '# ========== 累积与统计量 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'x = np.array([1, 2, 3, 4, 5])\n' +
      'print("cumsum :", np.cumsum(x))      # [ 1  3  6 10 15]\n' +
      'print("cumprod:", np.cumprod(x))     # [  1   2   6  24 120]\n' +
      'print("diff   :", np.diff(x))        # 后 - 前 -> [1 1 1 1]\n' +
      '\n' +
      '# 百分位数\n' +
      'data = np.random.randn(1000)\n' +
      'print("p50 :", np.percentile(data, 50))\n' +
      'print("p95 :", np.percentile(data, 95))\n' +
      'print("p99 :", np.percentile(data, 99))\n' +
      '\n' +
      '# 直方图（手写 + np 版）\n' +
      'hist, edges = np.histogram(data, bins=10)\n' +
      'print("hist:", hist)\n' +
      'print("edges:", edges)\n' +
      '\n' +
      '# 安全聚合\n' +
      'dirty = np.array([1.0, np.nan, 2.0, 3.0])\n' +
      'print("sum    :", np.sum(dirty))         # nan\n' +
      'print("nansum :", np.nansum(dirty))      # 6.0\n' +
      'print("nanmean:", np.nanmean(dirty))     # 2.0',
    example3:
      '# ========== 多维聚合：图像通道统计 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 100 张 32x32 RGB 图 -> (100, 32, 32, 3)\n' +
      'imgs = np.random.rand(100, 32, 32, 3)\n' +
      '\n' +
      '# 整体像素均值\n' +
      'print("all mean:", imgs.mean())\n' +
      '\n' +
      '# 每张图的平均像素值 -> (100,)\n' +
      'per_img = imgs.mean(axis=(1, 2, 3))\n' +
      '\n' +
      '# 每通道全局均值 -> (3,)\n' +
      'ch_mean = imgs.mean(axis=(0, 1, 2))\n' +
      '\n' +
      '# 沿 batch 求最亮像素的 (H, W) 位置\n' +
      'flat_idx = imgs.sum(axis=(0, 3)).argmax()\n' +
      'h, w = np.unravel_index(flat_idx, (32, 32))\n' +
      'print("最亮像素 (H, W):", h, w)\n' +
      '\n' +
      '# 同时聚合多个 axis\n' +
      'print("高 50% 分位 :", np.percentile(imgs, [50, 75, 95]))\n' +
      '\n' +
      '# 实战：标准化 z-score（保持原 shape）\n' +
      'mean = imgs.mean(axis=(0, 1, 2), keepdims=True)   # (1,1,1,3)\n' +
      'std  = imgs.std(axis=(0, 1, 2),  keepdims=True)\n' +
      'z = (imgs - mean) / (std + 1e-8)\n' +
      'print(z.shape, np.allclose(z.mean(), 0, atol=1e-3))'
  },
  {
    id: 'numpy-linalg',
    title: '11. 矩阵乘法：点积 / 内积 / @ / matmul',
    category: '线性代数',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: '线性代数是 NumPy 的核心场景：矩阵乘法、点积、转置、逆、特征值、SVD 都在 np.linalg 与 np.matmul 之下。',
    detail: [
      '一维点积：np.dot(a, b) 或 a @ b，返回标量。',
      '二维矩阵乘：a @ b 等价 np.matmul(a, b) 等价 np.dot(a, b)；要求 a.shape=(m, n)、b.shape=(n, p)，结果 (m, p)。',
      '高维：np.matmul 把最后两维当矩阵做乘法，前面的 batch 维按广播规则处理；a @ b 对 1D 会按 dot 行为，对 2D+ 同 matmul。',
      '逐元素乘 vs 矩阵乘：a * b 是元素乘（Hadamard），a @ b 是矩阵乘。',
      'np.einsum 用爱因斯坦求和约定写矩阵乘、点积、batch 矩阵乘等，可读性高、灵活。',
      '常用运算：np.transpose / np.linalg.inv / np.linalg.matrix_power / np.linalg.solve / np.linalg.eig / np.linalg.svd / np.linalg.norm / np.linalg.det / np.linalg.qr。'
    ],
    notes: [
      'A @ A.T 计算 Gram 矩阵（向量内积矩阵），等价 A.dot(A.T)。',
      '高维 matmul 与 einsum：np.einsum("bij,bjk->bik", A, B) 是 batch 矩阵乘。',
      '不要用 a * b 当矩阵乘；不要用 np.dot 处理高维 batch，会触发意外行为。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'A = np.array([[1, 2], [3, 4]])            # (2,2)\n' +
      'B = np.array([[5, 6], [7, 8]])\n' +
      'print("A @ B =\\n", A @ B)                 # 矩阵乘\n' +
      'print("A * B =\\n", A * B)                 # 元素乘\n' +
      '\n' +
      '# 一维点积\n' +
      'v = np.array([1, 2, 3])\n' +
      'w = np.array([4, 5, 6])\n' +
      'print("v·w:", np.dot(v, w))               # 32\n' +
      '\n' +
      '# 矩阵乘向量\n' +
      'print(A @ v)                              # [ 5 11]\n' +
      '\n' +
      '# 外积：v[:,None] @ w[None,:]\n' +
      'print(np.outer(v, w))                     # (3,3)\n' +
      '\n' +
      '# 矩阵转置\n' +
      'print(A.T @ A)                            # Gram 矩阵',
    example2:
      '# ========== 求解线性方程组 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 解 A x = b\n' +
      'A = np.array([[3, 1], [1, 2]], dtype=float)\n' +
      'b = np.array([9, 8], dtype=float)\n' +
      'x = np.linalg.solve(A, b)\n' +
      'print("解 x:", x)              # [2. 3.]\n' +
      'print("A x ≈ b?", np.allclose(A @ x, b))\n' +
      '\n' +
      '# 用 inv 显式求（不推荐，比 solve 慢且不稳定）\n' +
      'x2 = np.linalg.inv(A) @ b\n' +
      'print(x2)\n' +
      '\n' +
      '# 最小二乘（超定方程）\n' +
      'A = np.random.randn(5, 2)\n' +
      'b = np.random.randn(5)\n' +
      'x, res, rank, sv = np.linalg.lstsq(A, b, rcond=None)\n' +
      'print("最小二乘解:", x)\n' +
      '\n' +
      '# 求特征值 / 特征向量\n' +
      'A = np.array([[2, -1], [-1, 2]], dtype=float)\n' +
      'vals, vecs = np.linalg.eig(A)\n' +
      'print("特征值:", vals)\n' +
      'print("特征向量:\\n", vecs)',
    example3:
      '# ========== einsum 与 batch 矩阵乘 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 用 einsum 写各种乘法\n' +
      'A = np.random.rand(3, 4)\n' +
      'B = np.random.rand(4, 5)\n' +
      '\n' +
      'print("矩阵乘:", np.einsum("ij,jk->ik", A, B).shape)         # (3,5)\n' +
      'print("点积  :", np.einsum("i,i->", A[0], A[1]))             # 标量\n' +
      'print("外积  :", np.einsum("i,j->ij", A[0], A[1]).shape)     # (4,4)\n' +
      'print("Gram  :", np.einsum("ij,ik->jk", A, A).shape)         # (4,4)\n' +
      '\n' +
      '# Batch 矩阵乘：64 个 10x16 矩阵 乘 16x20 矩阵\n' +
      'batch = 64\n' +
      'X = np.random.rand(batch, 10, 16)\n' +
      'Y = np.random.rand(batch, 16, 20)\n' +
      'Z = np.einsum("bij,bjk->bik", X, Y)            # (64,10,20)\n' +
      'Z2 = X @ Y                                      # 同结果\n' +
      'print(np.allclose(Z, Z2))\n' +
      '\n' +
      '# SVD 分解\n' +
      'M = np.random.rand(5, 3)\n' +
      'U, S, Vt = np.linalg.svd(M, full_matrices=False)\n' +
      'print("U:", U.shape, "S:", S.shape, "Vt:", Vt.shape)\n' +
      'print("还原 M:", np.allclose(U @ np.diag(S) @ Vt, M))'
  },
  {
    id: 'numpy-decompose',
    title: '12. 分解与求解：inv / det / eig / svd / lstsq / qr',
    category: '线性代数',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: 'np.linalg 提供矩阵求逆、行列式、特征分解、奇异值分解、最小二乘、QR 分解等，是 Scikit-learn、PyTorch 的底层数学工具。',
    detail: [
      'np.linalg.inv(A) 求逆矩阵；A 必须是方阵且非奇异（det≠0），否则 LinAlgError。',
      'np.linalg.det(A) 求行列式；零行列式 = 不可逆。',
      'np.linalg.matrix_power(A, n) 求 A 的 n 次幂；n=0 返回单位阵，n<0 返回 inv(A) 的幂。',
      '特征分解：np.linalg.eig(A) 返回特征值、特征向量（方阵一般复数）；np.linalg.eigh(A) 专门给 Hermitian 对称阵，特征值实数且更稳定更快。',
      '奇异值分解：np.linalg.svd(M, full_matrices=True/False) 返回 U, S, Vt；用于降维（PCA）、伪逆、压缩等。',
      '最小二乘：np.linalg.lstsq(A, b, rcond=None) 解决超定方程 A x ≈ b，返回 (x, residuals, rank, singular values)。',
      'QR 分解：np.linalg.qr(M) 把 M 拆成正交 Q 和上三角 R。',
      '范数：np.linalg.norm(M, ord="fro") / ord=None 默认 2 范数；ord=1 / 2 / np.inf 等。'
    ],
    notes: [
      '优先用 solve / lstsq / svd 等分解类函数，不要先 inv 再点乘。inv 计算慢、数值稳定性差、对病态矩阵结果会爆炸。',
      'eig 给一般方阵，特征值可能含虚部；对称阵请用 eigh。',
      'NumPy 2.x：np.linalg.matrix_rank 默认 rcond=None 用机器精度。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      'A = np.array([[2, -1], [-1, 2]], dtype=float)\n' +
      'print("inv:\\n", np.linalg.inv(A))\n' +
      'print("det:", np.linalg.det(A))            # 3.0\n' +
      'print("A^2:\\n", np.linalg.matrix_power(A, 2))\n' +
      '\n' +
      '# 不可逆的奇异矩阵\n' +
      'S = np.array([[1, 2], [2, 4]], dtype=float)\n' +
      'print("det:", np.linalg.det(S))            # 0\n' +
      'try:\n' +
      '    np.linalg.inv(S)\n' +
      'except np.linalg.LinAlgError as e:\n' +
      '    print("Singular:", e)\n' +
      '\n' +
      '# 范数\n' +
      'v = np.array([3.0, 4.0])\n' +
      'print("L2:", np.linalg.norm(v))            # 5.0\n' +
      'print("L1:", np.linalg.norm(v, ord=1))     # 7.0\n' +
      'print("L∞:", np.linalg.norm(v, ord=np.inf))# 4.0',
    example2:
      '# ========== 特征分解与对称矩阵加速 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 一般方阵\n' +
      'A = np.array([[1, 2], [0, 3]], dtype=float)\n' +
      'vals, vecs = np.linalg.eig(A)\n' +
      'print("特征值（可能复数）:", vals)\n' +
      'print("特征向量:\\n", vecs)\n' +
      '\n' +
      '# 对称阵\n' +
      'S = np.array([[2, 1], [1, 2]], dtype=float)\n' +
      'vals, vecs = np.linalg.eigh(S)\n' +
      'print("对称特征值（实数、升序）:", vals)\n' +
      '\n' +
      '# 验证 A v = λ v\n' +
      'v1 = vecs[:, -1]\n' +
      'print("A v - λ v ≈ 0:", np.allclose(S @ v1 - vals[-1] * v1, 0))\n' +
      '\n' +
      '# ========== SVD 实战：图像低秩近似 ==========\n' +
      '# 构造一张"近似低秩"的灰度图\n' +
      'H, W = 32, 32\n' +
      'U = np.random.rand(H, 5)\n' +
      'V = np.random.rand(5, W)\n' +
      'M = U @ V + 0.01 * np.random.rand(H, W)\n' +
      '\n' +
      'U_svd, S, Vt = np.linalg.svd(M, full_matrices=False)\n' +
      'print("前 5 个奇异值:", S[:5])\n' +
      'print("截断到 rank=3 重构：", np.linalg.norm(M - U_svd[:, :3] @ np.diag(S[:3]) @ Vt[:3, :]))',
    example3:
      '# ========== PCA：用 SVD 实现主成分分析 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      '# 中心化数据\n' +
      'np.random.seed(0)\n' +
      'X = np.random.randn(100, 5)\n' +
      'X[:, 0] += X[:, 1] * 2          # 引入相关性\n' +
      'Xc = X - X.mean(axis=0)\n' +
      '\n' +
      '# 协方差矩阵 = Xc.T @ Xc / (n-1)\n' +
      'cov = Xc.T @ Xc / (Xc.shape[0] - 1)\n' +
      'print("协方差矩阵:\\n", cov)\n' +
      '\n' +
      '# 特征分解 -> 主成分方向\n' +
      'vals, vecs = np.linalg.eigh(cov)\n' +
      'order = np.argsort(vals)[::-1]\n' +
      'vals = vals[order]\n' +
      'vecs = vecs[:, order]\n' +
      '\n' +
      'print("解释方差比例:", vals / vals.sum())\n' +
      'print("前两主成分方向:\\n", vecs[:, :2])\n' +
      '\n' +
      '# 投影到 2 维\n' +
      'Z = Xc @ vecs[:, :2]\n' +
      'print("降维后形状:", Z.shape)        # (100, 2)\n' +
      '\n' +
      '# 完整 SVD 版（更常用，避免显式构造协方差）\n' +
      'U, S, Vt = np.linalg.svd(Xc, full_matrices=False)\n' +
      'print("SVD 给的奇异值:", S)\n' +
      'print("特征值 ≈ S^2 / (n-1):", S**2 / (Xc.shape[0] - 1))'
  },
  {
    id: 'numpy-random',
    title: '13. 随机数：np.random.default_rng 与分布',
    category: '进阶',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: 'NumPy 2.x 推荐用 Generator API（np.random.default_rng()）替代旧的全局 np.random 函数，能更好地控制 seed 与并行。',
    detail: [
      '推荐写法：rng = np.random.default_rng(seed=42)，所有随机调用走 rng.*：rng.random、rng.normal、rng.integers、rng.choice 等。',
      '旧 API（np.random.rand、np.random.randn、np.random.seed）仍然存在，但官方建议逐步迁移；用 LegacyGenerator 兼容旧代码。',
      '分布函数：rng.random(size) 均匀 [0,1)、rng.uniform(low, high, size)、rng.normal(mean, std, size) 高斯、rng.binomial、rng.poisson、rng.exponential、rng.beta、rng.gamma 等。',
      '整数与随机抽样：rng.integers(0, 10, size=5)、rng.choice(a, size, replace=True/False) 有/无放回抽样、rng.shuffle(x) 原地打乱、rng.permutation(x) 不原地。',
      '可重现实验：固定 seed = 常数。',
      '并行：np.random.SeedSequence 与 Spawn 体系支持生成多个独立子生成器，适合多进程/多线程实验。'
    ],
    notes: [
      'NumPy 2.x 仍然兼容 np.random.* 旧 API，但新代码推荐 Generator。',
      'rng.shuffle 只能打乱一维；多维只打乱第一维；想打乱多维配合 np.random.permutation 取下标。',
      '高维蒙特卡洛模拟：rng.normal(size=(10000, 100)) 一次生成 10000 条 100 维样本，比 for 循环快得多。'
    ],
    example:
      'import numpy as np\n' +
      '\n' +
      '# 推荐写法：Generator API\n' +
      'rng = np.random.default_rng(seed=42)\n' +
      '\n' +
      'print("均匀 [0,1):", rng.random(5))\n' +
      'print("标准正态 :", rng.standard_normal(5))\n' +
      'print("高斯(0,2):", rng.normal(0, 2, size=5))\n' +
      'print("整数 [0,10):", rng.integers(0, 10, 5))\n' +
      'print("choice    :", rng.choice([10, 20, 30, 40], size=5, replace=True))\n' +
      '\n' +
      '# 旧 API 仍可用（不推荐）\n' +
      'np.random.seed(0)\n' +
      'print("旧 randn:", np.random.randn(3))\n' +
      '\n' +
      '# 独立子生成器：并行实验\n' +
      'ss = np.random.SeedSequence(2025)\n' +
      'child_seeds = ss.spawn(3)\n' +
      'r0 = np.random.default_rng(child_seeds[0])\n' +
      'r1 = np.random.default_rng(child_seeds[1])\n' +
      'r2 = np.random.default_rng(child_seeds[2])\n' +
      'print("3 个独立子流:", r0.random(2), r1.random(2), r2.random(2))',
    example2:
      '# ========== 各种分布与采样 ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'rng = np.random.default_rng(0)\n' +
      '\n' +
      '# 伯努利（抛硬币）\n' +
      'coins = rng.binomial(1, 0.5, size=10)\n' +
      'print("硬币序列:", coins)\n' +
      '\n' +
      '# 二项分布（n 次伯努利）\n' +
      'print("二项 n=10 p=0.3:", rng.binomial(10, 0.3, 5))\n' +
      '\n' +
      '# 泊松分布（事件计数）\n' +
      'print("泊松 λ=4:", rng.poisson(4, 5))\n' +
      '\n' +
      '# 指数分布（时间间隔）\n' +
      'print("指数 τ=2:", rng.exponential(2.0, 5))\n' +
      '\n' +
      '# 多维高斯\n' +
      'mean = np.array([0.0, 0.0])\n' +
      'cov = np.array([[1.0, 0.5], [0.5, 1.0]])\n' +
      'samples = rng.multivariate_normal(mean, cov, size=5)\n' +
      'print("多维高斯样本:\\n", samples)\n' +
      '\n' +
      '# 打乱与下标\n' +
      'arr = np.arange(10)\n' +
      'rng.shuffle(arr)               # 原地打乱\n' +
      'print("打乱后:", arr)\n' +
      '\n' +
      'idx = rng.permutation(10)\n' +
      'print("下标序列:", idx)',
    example3:
      '# ========== 蒙特卡洛：估算 π ==========\n' +
      'import numpy as np\n' +
      '\n' +
      'rng = np.random.default_rng(0)\n' +
      'n = 1_000_000\n' +
      'x = rng.random(n)\n' +
      'y = rng.random(n)\n' +
      'inside = (x**2 + y**2) <= 1\n' +
      'pi_est = 4 * inside.mean()\n' +
      'print(f"蒙特卡洛估计 π ≈ {pi_est:.6f}（理论 3.141593）")\n' +
      '\n' +
      '# 大数定律：增加 n 提升精度\n' +
      'for k in [10**3, 10**4, 10**5, 10**6]:\n' +
      '    x = rng.random(k)\n' +
      '    y = rng.random(k)\n' +
      '    inside = (x**2 + y**2) <= 1\n' +
      '    print(f"n={k:>7d}  π ≈ {4 * inside.mean():.5f}")'
  },
  {
    id: 'numpy-io',
    title: '14. 文件 IO：loadtxt / genfromtxt / fromfile / savez / tofile / npy',
    category: '进阶',
    version: 'NumPy 2.x',
    level: '进阶',
    summary: 'NumPy 提供多种文件读写方式：文本（loadtxt/genfromtxt）、二进制（tofile/fromfile）、NPY/NPZ 自有格式（save/load/savez）。',
    detail: [
      '文本：np.loadtxt(fname, delimiter=",", dtype=float, skiprows=1) 读 CSV / TSV。',
      '缺失值：np.genfromtxt(fname, delimiter=",", missing_values="NA", filling_values=0) 适合含 NaN 的数据；返回结构化数组。',
      'NPY：NumPy 自有二进制格式，保留 dtype + shape。np.save("a.npy", arr) / np.load("a.npy")。',
      'NPZ：压缩打包多个数组。np.savez("a.npz", x=x, y=y) / np.load("a.npz")["x"]。',
      '二进制原始：a.tofile(f) / np.fromfile(f, dtype=...) 是无元数据的字节流，速度最快但不携带 shape / dtype。',
      '大文件策略：内存映射 np.memmap 可以不读全文件就按需访问大数组。'
    ],
    notes: [
      'loadtxt 处理简单结构化文本够用；遇到复杂表（混合类型、缺失值、日期）建议直接用 Pandas read_csv。',
      'npy 是 NumPy 的"标准数据格式"，训练模型、缓存中间结果首选；npz 适合一次存多个。',
      '二进制 raw IO 跨平台有字节序问题，务必指定 dtype 与 endianness。'
    ],
    example:
      'import numpy as np\n' +
      'import io\n' +
      '\n' +
      '# ====== 文本 CSV ======\n' +
      'csv = """\\\n' +
      'id,height,weight\n' +
      '1,1.70,65.0\n' +
      '2,1.80,80.5\n' +
      '3,1.65,55.0\n' +
      '"""\n' +
      'arr = np.loadtxt(io.StringIO(csv), delimiter=",", skiprows=1)\n' +
      'print(arr, arr.dtype)\n' +
      '\n' +
      '# ====== 缺失值 ======\n' +
      'csv2 = """1,1.70,65.0\n' +
      '2,NA,80.5\n' +
      '3,1.65,55.0\n' +
      '"""\n' +
      'arr2 = np.genfromtxt(io.StringIO(csv2), delimiter=",", missing_values="NA", filling_values=0)\n' +
      'print(arr2)\n' +
      '\n' +
      '# ====== npy / npz ======\n' +
      'x = np.arange(6).reshape(2, 3)\n' +
      'y = np.linspace(0, 1, 5)\n' +
      'np.save("x.npy", x)\n' +
      'np.savez("xy.npz", x=x, y=y)\n' +
      '\n' +
      'print("npy:", np.load("x.npy"))\n' +
      'data = np.load("xy.npz")\n' +
      'print("npz x:", data["x"], "y:", data["y"])\n' +
      '\n' +
      'import os\n' +
      'os.remove("x.npy"); os.remove("xy.npz")',
    example2:
      '# ========== 内存映射：处理大文件 ==========\n' +
      'import numpy as np\n' +
      'import os\n' +
      '\n' +
      '# 1) 准备一个 1GB 的 npy\n' +
      'big = np.arange(50_000_000, dtype=np.int32)   # 200MB\n' +
      'np.save("big.npy", big)\n' +
      'print("文件大小 MB:", os.path.getsize("big.npy") / 1024 / 1024)\n' +
      '\n' +
      '# 2) memmap 打开（不会一次性把 200MB 全部读入）\n' +
      'mm = np.load("big.npy", mmap_mode="r")\n' +
      'print("mmap 数组形状:", mm.shape, "dtype:", mm.dtype)\n' +
      'print("前 5 个:", mm[:5])\n' +
      'print("中间位置:", mm[25_000_000:25_000_005])\n' +
      'print("总和（懒加载计算）:", mm.sum())\n' +
      '\n' +
      '# 3) r+ 模式可写\n' +
      'mm_w = np.load("big.npy", mmap_mode="r+")\n' +
      'mm_w[0:3] = -1\n' +
      'print("修改后:", mm_w[:5])\n' +
      '\n' +
      'os.remove("big.npy")\n' +
      '\n' +
      '# ========== tofile / fromfile ==========\n' +
      'a = np.arange(5, dtype=np.float32)\n' +
      'a.tofile("raw.bin")\n' +
      'b = np.fromfile("raw.bin", dtype=np.float32)\n' +
      'print("二进制读取:", b)\n' +
      'os.remove("raw.bin")',
    example3:
      '# ========== 结构化数组存取 + 与 Pandas 衔接 ==========\n' +
      'import numpy as np\n' +
      'import os\n' +
      '\n' +
      'dt = np.dtype([("id", "i4"), ("name", "U8"), ("score", "f4")])\n' +
      'data = np.array([(1, "Tom", 88.5), (2, "Alice", 92.0)], dtype=dt)\n' +
      'np.save("struct.npy", data)\n' +
      'loaded = np.load("struct.npy")\n' +
      'print(loaded, loaded.dtype)\n' +
      '\n' +
      '# 字段筛选\n' +
      'print(loaded["name"][loaded["score"] > 90])\n' +
      '\n' +
      'os.remove("struct.npy")\n' +
      '\n' +
      '# ========== 实战：把 ndarray 缓存成 npy，下次直接 load ==========\n' +
      'cache = "/tmp/cache_demo.npy"\n' +
      'arr = np.random.randn(1000, 64)\n' +
      'np.save(cache, arr)\n' +
      '\n' +
      '# 下次启动只需 ms 级\n' +
      'arr2 = np.load(cache)\n' +
      'print("cache 一致?", np.allclose(arr, arr2))\n' +
      'os.remove(cache)\n' +
      '\n' +
      '# NumPy 与 Pandas 衔接：直接喂给 DataFrame\n' +
      'import pandas as pd\n' +
      'df = pd.DataFrame(arr[:5], columns=[f"f{i}" for i in range(64)])\n' +
      'print(df.head())'
  },
  {
    id: 'numpy-perf',
    title: '15. 性能优化：矢量化、避免循环、内存布局、numba',
    category: '进阶',
    version: 'NumPy 2.x',
    level: '高阶',
    summary: 'NumPy 性能的核心：用 C 级别的矢量化运算替代 Python 循环；理解内存连续性；按需使用 numba/cython 做 JIT 加速。',
    detail: [
      '矢量化：用 a + 1、a * b、a[mask]、np.where 等代替 Python for；ufunc 在 C 层面逐元素，比 Python 循环快 10~100 倍。',
      '内存连续：reshape、T 视图要谨慎；尽量让数组是 C 连续（行优先）以利于 cache 命中。',
      'dtypes 选小：能用 int8 就不用 int64；能用 float32 就不用 float64（前提是精度够）。',
      '预分配：a = np.empty(...) 比 np.append 反复扩容快得多。',
      'reduce/outer/einsum：ufunc 的进阶用法往往比手写循环快。',
      'JIT 加速：numba 的 @njit 把 Python 函数编译到机器码，对纯数值循环可达 C 速度；np.vectorize 实际上不加速，只是个语法糖。',
      'Cython / C 扩展：极端场景下用 Cython 或 ctypes 写底层；多数需求 numba 已够。',
      'profile 工具：timeit（命令行）、%timeit（IPython/Jupyter）、cProfile、line_profiler。'
    ],
    notes: [
      'np.vectorize 看起来"向量化"，实质是 Python for 循环封装，速度没有提升。',
      '大循环中频繁调用 Python 层的 attribute lookup（arr.shape、np.sqrt）会拖慢；可把 arr.shape 这种一次性取出来。',
      '用 numba 加速时优先看是不是可以重写为矢量化 NumPy，矢量化更易维护。'
    ],
    example:
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'n = 1_000_000\n' +
      'a = np.random.randn(n)\n' +
      'b = np.random.randn(n)\n' +
      '\n' +
      '# ====== 矢量化 vs Python 循环 ======\n' +
      't0 = time.perf_counter()\n' +
      's = sum(x * y for x, y in zip(a, b))\n' +
      'py_t = time.perf_counter() - t0\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      's2 = (a * b).sum()\n' +
      'np_t = time.perf_counter() - t0\n' +
      '\n' +
      'print(f"Python 循环: {py_t*1000:.1f} ms")\n' +
      'print(f"NumPy 矢量化: {np_t*1000:.1f} ms")\n' +
      'print(f"加速比: {py_t/np_t:.0f}x")\n' +
      '\n' +
      '# ====== 预分配 vs append ======\n' +
      't0 = time.perf_counter()\n' +
      'lst = np.array([])\n' +
      'for i in range(10000):\n' +
      '    lst = np.append(lst, i)\n' +
      'print(f"反复 append: {(time.perf_counter()-t0)*1000:.1f} ms")\n' +
      '\n' +
      't0 = time.perf_counter()\n' +
      'lst2 = np.empty(10000, dtype=np.int64)\n' +
      'for i in range(10000):\n' +
      '    lst2[i] = i\n' +
      'print(f"预分配: {(time.perf_counter()-t0)*1000:.1f} ms")',
    example2:
      '# ========== 矢量化实战：欧氏距离、距离矩阵 ==========\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'N = 5000\n' +
      'X = np.random.rand(N, 3)\n' +
      '\n' +
      '# 1) Python 双循环（不要写）\n' +
      't0 = time.perf_counter()\n' +
      'D = np.zeros((N, N))\n' +
      'for i in range(N):\n' +
      '    for j in range(N):\n' +
      '        D[i, j] = np.sqrt(((X[i] - X[j]) ** 2).sum())\n' +
      'print(f"双循环: {time.perf_counter()-t0:.2f} s")\n' +
      '\n' +
      '# 2) 矢量化（建议）\n' +
      't0 = time.perf_counter()\n' +
      'diff = X[:, None, :] - X[None, :, :]\n' +
      'D2 = np.sqrt((diff ** 2).sum(-1))\n' +
      'print(f"矢量化: {time.perf_counter()-t0:.2f} s")\n' +
      '\n' +
      '# 3) 借助 cdist 思路（避免显式构造 3D diff）\n' +
      't0 = time.perf_counter()\n' +
      'sq = (X ** 2).sum(axis=1)[:, None] + (X ** 2).sum(axis=1)[None, :] - 2 * X @ X.T\n' +
      'D3 = np.sqrt(np.maximum(sq, 0))\n' +
      'print(f"内积技巧: {time.perf_counter()-t0:.2f} s")\n' +
      '\n' +
      '# 一致性\n' +
      'print("D2 == D3?", np.allclose(D2, D3))',
    example3:
      '# ========== numba JIT vs 矢量化 vs 循环 ==========\n' +
      'import numpy as np\n' +
      'import time\n' +
      '\n' +
      'try:\n' +
      '    from numba import njit\n' +
      '    have_numba = True\n' +
      'except ImportError:\n' +
      '    have_numba = False\n' +
      '    print("未安装 numba，跳过 JIT 部分（pip install numba 即可）")\n' +
      '\n' +
      'n = 5_000_000\n' +
      'a = np.random.randn(n)\n' +
      'b = np.random.randn(n)\n' +
      '\n' +
      '# 矢量化版本：sum(exp(-a*x^2 + b*x))\n' +
      't0 = time.perf_counter()\n' +
      'v1 = (np.exp(-a * a * a + b * a)).sum()\n' +
      'print(f"矢量化: {(time.perf_counter()-t0)*1000:.1f} ms  -> {v1:.2f}")\n' +
      '\n' +
      'if have_numba:\n' +
      '    @njit\n' +
      '    def jit_sum(a, b):\n' +
      '        s = 0.0\n' +
      '        for i in range(a.size):\n' +
      '            s += np.exp(-a[i] * a[i] * a[i] + b[i] * a[i])\n' +
      '        return s\n' +
      '\n' +
      '    # 第一次调用包含编译时间\n' +
      '    t0 = time.perf_counter()\n' +
      '    v2 = jit_sum(a, b)\n' +
      '    print(f"numba（含编译）: {(time.perf_counter()-t0)*1000:.1f} ms  -> {v2:.2f}")\n' +
      '\n' +
      '    t0 = time.perf_counter()\n' +
      '    for _ in range(10):\n' +
      '        jit_sum(a, b)\n' +
      '    print(f"numba（10 次）: {(time.perf_counter()-t0)*1000:.1f} ms")\n' +
      '\n' +
      '    print("结果一致?", np.isclose(v1, v2))\n' +
      'else:\n' +
      '    print("矢量化在很多场景已够快；遇到复杂逐元素逻辑再上 numba。")\n' +
      '\n' +
      '# 内存布局对 cache 的影响（C 序 vs F 序）\n' +
      'N = 4096\n' +
      'A = np.random.rand(N, N)\n' +
      'Ac = np.ascontiguousarray(A)\n' +
      'Af = np.asfortranarray(A)\n' +
      'print("C 序 flags:", Ac.flags["C_CONTIGUOUS"], "  F 序 flags:", Af.flags["F_CONTIGUOUS"])'
  }
];
