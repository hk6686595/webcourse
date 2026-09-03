// OpenCV 教程 —— 第四部分：图像平滑、边缘检测与梯度
module.exports = [
  {
    id: 'opencv-blur',
    title: '16. 图像平滑：均值 / 高斯 / 中值 / 双边滤波',
    category: '滤波与边缘',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '滤波是去噪、模糊、预处理的基础；选对滤波器能让后续边缘、阈值、特征提取更稳。',
    detail: [
      'cv2.blur(src, ksize)：均值滤波，每个像素 = 邻域均值。最简单，但模糊边缘。',
      'cv2.GaussianBlur(src, ksize, sigmaX, sigmaY)：高斯滤波，加权平均（中心权重大），平滑自然；sigma 是高斯核标准差；ksize 必须是奇数。',
      'cv2.medianBlur(src, ksize)：中值滤波，每个像素 = 邻域中值。对椒盐噪声特别有效，ksize 通常 3 或 5。',
      'cv2.bilateralFilter(src, d, sigmaColor, sigmaSpace)：双边滤波，同时考虑空间距离和颜色相似度 → 去噪同时保留边缘。慢，但效果好。',
      'cv2.boxFilter(src, ddepth, ksize, normalize)：box 滤波，可归一化（等价 blur）或非归一化。',
      'cv2.filter2D(src, ddepth, kernel)：通用卷积接口，给定卷积核做卷积（如锐化、Sobel 自定义核）。',
      '何时用哪个：① 椒盐噪声 → 中值滤波；③ 普通去噪 → 高斯；③ 想保留边缘 → 双边；④ 实时视频流 → 高斯或 box（速度快）。',
      'dst = cv2.GaussianBlur(img, (5, 5), 0)：第三个参数 0 表示 sigma 由 ksize 自动推导。'
    ],
    notes: [
      '高斯核的 ksize 通常是奇数（3、5、7、9），越大越模糊。',
      '双边滤波是 O(W*H*k*k) 的慢操作，不适合实时视频。',
      '滤波会引入"边界效应"，因此 OpenCV 默认边界用 BORDER_REFLECT_101 镜像补全。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import matplotlib.pyplot as plt\n\n' +
      'img = cv2.imread("noisy.jpg")\n\n' +
      '# 1) 加人工噪声便于对比\n' +
      'def add_salt_pepper(image, amount=0.05):\n' +
      '    out = image.copy()\n' +
      '    h, w = out.shape[:2]\n' +
      '    n = int(amount * h * w)\n' +
      '    for ch in range(out.shape[2]):\n' +
      '        ys = np.random.randint(0, h, n)\n' +
      '        xs = np.random.randint(0, w, n)\n' +
      '        out[ys, xs, ch] = np.random.choice([0, 255], n)\n' +
      '    return out\n\n' +
      'noisy = add_salt_pepper(img)\n' +
      'mean   = cv2.blur(noisy,            (5, 5))\n' +
      'gauss  = cv2.GaussianBlur(noisy,    (5, 5), 0)\n' +
      'median = cv2.medianBlur(noisy,      5)\n' +
      'bilateral = cv2.bilateralFilter(noisy, 9, 75, 75)\n\n' +
      'fig, axes = plt.subplots(1, 5, figsize=(20, 4))\n' +
      'for ax, im, t in zip(axes, [noisy, mean, gauss, median, bilateral],\n' +
      '                     ["noisy", "mean 5x5", "gaussian 5x5",\n' +
      '                      "median 5", "bilateral"]):\n' +
      '    ax.imshow(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)); ax.axis("off")\n' +
      '    ax.set_title(t)\n' +
      'plt.show()\n\n' +
      '# 2) 自定义卷积核（锐化）\n' +
      'sharp_kernel = np.array([[ 0, -1,  0],\n' +
      '                         [-1,  5, -1],\n' +
      '                         [ 0, -1,  0]], dtype=np.float32)\n' +
      'sharp = cv2.filter2D(img, -1, sharp_kernel)\n' +
      'cv2.imshow("sharpen", sharp)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 实用技巧：用 PSNR 客观对比不同滤波器的去噪效果 ----\n' +
      'clean = cv2.imread("photo_clean.jpg")\n' +
      'noisy = cv2.imread("photo_noisy.jpg")\n\n' +
      'def psnr(original, processed):\n' +
      '    mse = np.mean((original.astype(float) - processed.astype(float)) ** 2)\n' +
      '    if mse == 0: return float("inf")\n' +
      '    return 10 * np.log10(255.0 ** 2 / mse)\n\n' +
      'filters = {\n' +
      '    "mean":       cv2.blur(noisy, (5, 5)),\n' +
      '    "gaussian":   cv2.GaussianBlur(noisy, (5, 5), 0),\n' +
      '    "median":     cv2.medianBlur(noisy, 5),\n' +
      '    "bilateral":  cv2.bilateralFilter(noisy, 9, 75, 75),\n' +
      '}\n\n' +
      'for name, result in filters.items():\n' +
      '    print(f"{name:12s}  PSNR = {psnr(clean, result):.2f} dB")\n\n' +
      '# 选出最佳滤波器后，可链式叠加：先高斯降噪，再双边保边\n' +
      'stage1 = cv2.GaussianBlur(noisy, (3, 3), 0)\n' +
      'final  = cv2.bilateralFilter(stage1, 9, 75, 75)\n' +
      'print(f"链式组合      PSNR = {psnr(clean, final):.2f} dB")',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 实用技巧：双边滤波磨皮 + 锐化还原细节 ----\n' +
      'portrait = cv2.imread("portrait.jpg")\n\n' +
      '# Step 1: 双边滤波平滑皮肤（保留边缘）\n' +
      'smooth = cv2.bilateralFilter(portrait, 15, 80, 80)\n\n' +
      '# Step 2: 高斯差分提取细节层\n' +
      'blur_large = cv2.GaussianBlur(portrait, (21, 21), 0)\n' +
      'blur_small = cv2.GaussianBlur(portrait, (3, 3), 0)\n' +
      'detail = cv2.subtract(blur_small, blur_large)\n\n' +
      '# Step 3: 将细节层按比例加回磨皮结果\n' +
      'alpha = 0.6\n' +
      'result = cv2.addWeighted(smooth, 1.0, detail.astype(np.float32), alpha, 0)\n' +
      'result = np.clip(result, 0, 255).astype(np.uint8)\n\n' +
      'cv2.imshow("original", portrait)\n' +
      'cv2.imshow("smoothed", smooth)\n' +
      'cv2.imshow("detail",   detail)\n' +
      'cv2.imshow("result",   result)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-canny',
    title: '17. Canny 边缘检测：最经典的边缘算子',
    category: '滤波与边缘',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'Canny 是多阶段算法（高斯 → Sobel → 非极大抑制 → 双阈值 + 滞后跟踪），输出干净的二值边缘图。',
    detail: [
      'cv2.Canny(image, threshold1, threshold2, apertureSize, L2gradient)：输入灰度图，输出二值边缘图（255 表示边缘，0 表示非边缘）。',
      'threshold1 是低阈值（弱边缘被剔除前必须与强边缘相连），threshold2 是高阈值（强边缘直接保留）。常见经验：threshold1:threshold2 = 1:2 或 1:3。',
      'apertureSize 是 Sobel 核大小（默认 3）；L2gradient=False 用 L1（更宽松），L2gradient=True 用 L2（更准确）。',
      '自动 Canny 阈值：sigma = 0.33（中位数标准差），threshold1 = max(0, (1-sigma)*median)，threshold2 = min(255, (1+sigma)*median)。',
      'Canny 输入必须是 uint8 灰度图，单通道。',
      'Canny 输出可以直接 findContours 找边缘轮廓（特别适合目标轮廓清晰的物体）。',
      '改进做法：① 高斯模糊先降噪 → Canny 噪声少；② morphological 闭运算连接断裂边缘 → Canny → 轮廓。'
    ],
    notes: [
      'Canny 是边缘检测（edge），不是轮廓检测（contour）。边缘是 1 像素宽的"线"，轮廓是闭合的"区域边界"。',
      '高阈值给得太小：噪声也会变成"强边缘"；太低则漏掉真实边缘。',
      '自动 Canny 适合批量处理；针对性场景最好手动调。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("building.jpg")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'blurred = cv2.GaussianBlur(gray, (5, 5), 0)\n\n' +
      '# ========== 1) 手动阈值 ==========\n' +
      'edges = cv2.Canny(blurred, threshold1=50, threshold2=150)\n\n' +
      '# ========== 2) 自动阈值（中位数法）==========\n' +
      'med = float(np.median(blurred))\n' +
      'sigma = 0.33\n' +
      'low  = int(max(0,  (1 - sigma) * med))\n' +
      'high = int(min(255, (1 + sigma) * med))\n' +
      'edges_auto = cv2.Canny(blurred, low, high)\n' +
      'print(f"自动阈值: low={low}, high={high}")\n\n' +
      '# ========== 3) L2 gradient（更精确但慢）==========\n' +
      'edges_l2 = cv2.Canny(blurred, 50, 150, L2gradient=True)\n\n' +
      'cv2.imshow("canny manual",  edges)\n' +
      'cv2.imshow("canny auto",    edges_auto)\n' +
      'cv2.imshow("canny L2",      edges_l2)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 4) Canny 边缘提取在原图上叠加 ==========\n' +
      'overlay = img.copy()\n' +
      'overlay[edges != 0] = (0, 0, 255)\n' +
      'cv2.imshow("edges on image", overlay)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 5) 滑动条交互调阈值 ==========\n' +
      'def nothing(x): pass\n' +
      'cv2.namedWindow("canny track", cv2.WINDOW_NORMAL)\n' +
      'cv2.createTrackbar("low",  "canny track",  50, 255, nothing)\n' +
      'cv2.createTrackbar("high", "canny track", 150, 255, nothing)\n' +
      'while True:\n' +
      '    lo = cv2.getTrackbarPos("low",  "canny track")\n' +
      '    hi = cv2.getTrackbarPos("high", "canny track")\n' +
      '    if hi <= lo: hi = lo + 1\n' +
      '    e = cv2.Canny(blurred, lo, hi)\n' +
      '    cv2.imshow("canny track", e)\n' +
      '    if cv2.waitKey(30) & 0xFF == 27: break\n' +
      'cv2.destroyAllWindows()',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 实用技巧：Canny + findContours 提取目标轮廓 ----\n' +
      'img = cv2.imread("coins.jpg")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'blurred = cv2.GaussianBlur(gray, (5, 5), 0)\n\n' +
      '# 自动阈值\n' +
      'med = float(np.median(blurred))\n' +
      'edges = cv2.Canny(blurred, int(max(0, 0.67 * med)), int(min(255, 1.33 * med)))\n\n' +
      '# 形态学闭运算连接断裂边缘\n' +
      'kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))\n' +
      'closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)\n\n' +
      '# 提取轮廓并过滤面积太小的\n' +
      'contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)\n' +
      'for cnt in contours:\n' +
      '    area = cv2.contourArea(cnt)\n' +
      '    if area < 500: continue\n' +
      '    x, y, w, h = cv2.boundingRect(cnt)\n' +
      '    cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)\n' +
      '    cv2.putText(img, str(area), (x, y - 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)\n\n' +
      'cv2.imshow("contours", img)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 进阶：Canny 多尺度融合检测不同尺度边缘 ----\n' +
      'img = cv2.imread("street.jpg")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n\n' +
      'edges_coarse = cv2.Canny(cv2.GaussianBlur(gray, (7, 7), 0), 30, 100)\n' +
      'edges_fine   = cv2.Canny(cv2.GaussianBlur(gray, (3, 3), 0), 80, 200)\n\n' +
      '# 位或融合：任一尺度检测到的边缘都保留\n' +
      'edges_fused = cv2.bitwise_or(edges_coarse, edges_fine)\n\n' +
      '# 在原图上叠加\n' +
      'overlay = img.copy()\n' +
      'overlay[edges_fused != 0] = (0, 0, 255)\n' +
      'blended = cv2.addWeighted(img, 0.7, overlay, 0.3, 0)\n\n' +
      'cv2.imshow("coarse", edges_coarse)\n' +
      'cv2.imshow("fine",   edges_fine)\n' +
      'cv2.imshow("fused",  edges_fused)\n' +
      'cv2.imshow("overlay", blended)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-gradient',
    title: '18. 图像梯度：Sobel / Scharr / Laplacian',
    category: '滤波与边缘',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '梯度是图像的"导数"，能给出每个像素在 x/y 方向的强度；Sobel 是入门首选。',
    detail: [
      '梯度反映像素灰度的空间变化率。灰度不变区域梯度=0，边缘、纹理区域梯度大。',
      'cv2.Sobel(src, ddepth, dx, dy, ksize)：x/y 方向分别求导，dx/dy 是 0 或 1（如 dx=1, dy=0 表示水平方向梯度）。',
      'ddepth 通常用 cv2.CV_64F（64 位浮点）防止负值截断；最后用 cv2.convertScaleAbs 转回 uint8 便于显示。',
      'cv2.Scharr(src, ddepth, dx, dy)：比 Sobel 更精确的 3×3 核，OpenCV 推荐精度场景优先用它。',
      'cv2.Laplacian(src, ddepth, ksize)：二阶导数，对噪声敏感但能检测孤立点、细线，常用于锐化（dst = img - Laplacian）。',
      '梯度幅度：mag = cv2.magnitude(grad_x, grad_y)；相位：angle = cv2.phase(grad_x, grad_y, angleInDegrees=True)。',
      '梯度方向：Sobel_x 与 Sobel_y 比值 atan2(grad_y, grad_x) → 该像素边缘的法向。Canny 内部用了这种角度做非极大抑制。',
      '实战：① 工业检测：Sobel 找金属裂纹；② 阴影去除：高梯度阴影边缘用梯度幅度图去除；③ 图像锐化：src - alpha * Laplacian。'
    ],
    notes: [
      'Sobel 输出有正有负；用 uint8 容器会截断（-100 → 0），所以计算时用 float64，显示前 convertScaleAbs。',
      'Sobel 在 dx=1, dy=1 同时为 1 等价于 Laplacian 近似；高阶导数噪声敏感。',
      'Scharr 是 Sobel 的高精度替代版（同样 3×3 核，但系数更"对称"）。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import matplotlib.pyplot as plt\n\n' +
      'gray = cv2.imread("text.jpg", cv2.IMREAD_GRAYSCALE)\n\n' +
      '# ========== 1) Sobel ==========\n' +
      'sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)\n' +
      'sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)\n' +
      'sobelx_u8 = cv2.convertScaleAbs(sobelx)\n' +
      'sobely_u8 = cv2.convertScaleAbs(sobely)\n' +
      'mag = cv2.magnitude(sobelx, sobely)\n' +
      'mag_u8 = cv2.convertScaleAbs(mag)\n\n' +
      '# ========== 2) Scharr（精度更高的 Sobel）==========\n' +
      'schx = cv2.Scharr(gray, cv2.CV_64F, 1, 0)\n' +
      'schy = cv2.Scharr(gray, cv2.CV_64F, 0, 1)\n' +
      'scharr_mag = cv2.convertScaleAbs(cv2.magnitude(schx, schy))\n\n' +
      '# ========== 3) Laplacian ==========\n' +
      'lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)\n' +
      'lap_u8 = cv2.convertScaleAbs(lap)\n\n' +
      '# ========== 4) 锐化：原图 - Laplacian * alpha ==========\n' +
      'alpha = 0.5\n' +
      'sharp = cv2.addWeighted(gray.astype(np.float32), 1,\n' +
      '                        lap.astype(np.float32), -alpha, 0)\n' +
      'sharp = np.clip(sharp, 0, 255).astype(np.uint8)\n\n' +
      'fig, axes = plt.subplots(2, 3, figsize=(14, 8))\n' +
      'imgs = [\n' +
      '    ("Original",   gray,      "gray"),\n' +
      '    ("Sobel X",    sobelx_u8, "gray"),\n' +
      '    ("Sobel Y",    sobely_u8, "gray"),\n' +
      '    ("Sobel mag",  mag_u8,    "gray"),\n' +
      '    ("Scharr mag", scharr_mag,"gray"),\n' +
      '    ("Laplacian",  lap_u8,    "gray"),\n' +
      ']\n' +
      'for ax, (t, i, c) in zip(axes.ravel(), imgs):\n' +
      '    ax.imshow(i, cmap=c); ax.axis("off"); ax.set_title(t)\n' +
      'plt.tight_layout(); plt.show()',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 实用技巧：Sobel 梯度 + 阈值化快速检测水平/垂直线条 ----\n' +
      'gray = cv2.imread("document.jpg", cv2.IMREAD_GRAYSCALE)\n\n' +
      '# 水平方向梯度（检测垂直边缘）\n' +
      'sobel_x = cv2.convertScaleAbs(cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3))\n' +
      '_, vert_lines = cv2.threshold(sobel_x, 100, 255, cv2.THRESH_BINARY)\n\n' +
      '# 垂直方向梯度（检测水平边缘）\n' +
      'sobel_y = cv2.convertScaleAbs(cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3))\n' +
      '_, horiz_lines = cv2.threshold(sobel_y, 100, 255, cv2.THRESH_BINARY)\n\n' +
      '# 形态学膨胀加粗线条后去噪\n' +
      'k_v = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 15))\n' +
      'k_h = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 1))\n' +
      'vert_clean  = cv2.morphologyEx(vert_lines, cv2.MORPH_OPEN, k_v)\n' +
      'horiz_clean = cv2.morphologyEx(horiz_lines, cv2.MORPH_OPEN, k_h)\n\n' +
      'cv2.imshow("vertical edges",  vert_clean)\n' +
      'cv2.imshow("horizontal edges", horiz_clean)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ---- 进阶：梯度幅值 + 方向的全貌可视化（HOG 思路原型）----\n' +
      'gray = cv2.imread("texture.jpg", cv2.IMREAD_GRAYSCALE)\n' +
      'gray = cv2.resize(gray, (256, 256))\n\n' +
      'sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)\n' +
      'sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)\n\n' +
      '# 梯度幅值\n' +
      'mag = cv2.magnitude(sobelx, sobely)\n' +
      'mag_u8 = cv2.convertScaleAbs(mag)\n\n' +
      '# 梯度方向（角度）\n' +
      'angle = cv2.phase(sobelx, sobely, angleInDegrees=True)\n\n' +
      '# 伪彩色映射便于观察\n' +
      'mag_color  = cv2.applyColorMap(mag_u8, cv2.COLORMAP_JET)\n' +
      'angle_u8   = np.uint8(angle / 360.0 * 255)\n' +
      'angle_color = cv2.applyColorMap(angle_u8, cv2.COLORMAP_HSV)\n\n' +
      'cv2.imshow("magnitude",  mag_color)\n' +
      'cv2.imshow("direction",  angle_color)\n\n' +
      '# 利用方向做边缘着色（Canny 非极大抑制的前置步骤）\n' +
      'vis = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)\n' +
      'mask = mag > 50\n' +
      'vis[mask] = (0, 0, 255)\n' +
      'cv2.imshow("edge overlay", vis)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()'
  }
];