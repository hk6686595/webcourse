// OpenCV 教程 —— 第三部分：颜色空间转换与图像阈值
module.exports = [
  {
    id: 'opencv-color-space',
    title: '11. 颜色空间：RGB / HSV / Lab / GRAY 的取舍',
    category: '颜色与阈值',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '不同颜色空间适合不同任务：RGB 用于显示、HSV 用于按颜色找目标、Lab 用于色彩一致性、GRAY 用于边缘和形状。',
    detail: [
      'OpenCV 读取彩色图默认 BGR（蓝-绿-红），与显示器的 RGB 不一致。需要 cv2.cvtColor(img, cv2.COLOR_BGR2RGB) 才能给 matplotlib、Pillow 等用。',
      'GRAY（灰度）：cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)。灰度图 channel=1，用于边缘检测、轮廓提取、特征匹配；多数视觉算法的输入。',
      'HSV（Hue 色相 0~179、Saturation 饱和度 0~255、Value 明度 0~255）：把颜色和亮度解耦，色相与饱和度的组合决定颜色，亮度单独独立，是"按颜色过滤"的首选空间。',
      '注意：OpenCV 的 HSV 中 H 取值范围是 0~179（不是 0~360），因为 uint8 只够装 256 个值。如果你的算法需要 0~360，可以直接用 numpy.float32 或除以 2。',
      'Lab（CIE L*a*b*）：亮度通道 L 与色度 a/b 分离，色差是 Euclidean 距离（人眼感知均匀）。做色彩一致性、白平衡、图像风格迁移都喜欢用它。',
      'YCrCb：亮度 Y 与色度 Cr/Cb 分离。JPEG 压缩、视频编解码内部都用它。',
      '应用直觉：① 目标颜色识别用 HSV；② 光照不均、阴影下的边缘提取用 Lab 或 HSV 的 V 通道；③ OCR 用 GRAY 或单色通道。',
      'cvtColor 是 in-place 不友好：dst = cv2.cvtColor(src, code) 返回新数组，原图不变。'
    ],
    notes: [
      'HSV 的 H 通道容易受光照影响：暗色区域 H 值不稳；做颜色阈值前最好先均衡化亮度（CLAHE 等）。',
      'Lab 转回 BGR 一定要 cv2.COLOR_Lab2BGR 而不是 COLOR_BGR2Lab；前者反向，后者把图搞坏。',
      'cvtColor 输入 dtype 必须是 uint8 或 float32；float 范围 [0, 1] 时表现略有不同。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import matplotlib.pyplot as plt\n\n' +
      'img = cv2.imread("colorful.jpg")             # BGR\n' +
      'rgb   = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)\n' +
      'gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'hsv   = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)\n' +
      'lab   = cv2.cvtColor(img, cv2.COLOR_BGR2Lab)\n' +
      'ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)\n\n' +
      '# 用 matplotlib 一次性展示所有空间\n' +
      'fig, axes = plt.subplots(1, 5, figsize=(20, 4))\n' +
      'titles = ["BGR->RGB", "Gray", "HSV", "Lab", "YCrCb"]\n' +
      'images = [rgb, gray, hsv, lab, ycrcb]\n' +
      'cmaps  = [None, "gray", None, None, None]\n' +
      'for ax, t, im, cm in zip(axes, titles, images, cmaps):\n' +
      '    if t == "BGR->RGB" or t in ("HSV", "Lab", "YCrCb"):\n' +
      '        # 转换回 RGB 给 matplotlib\n' +
      '        if t == "HSV":\n' +
      '            im_show = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)\n' +
      '        elif t == "Lab":\n' +
      '            im_show = cv2.cvtColor(lab, cv2.COLOR_Lab2RGB)\n' +
      '        elif t == "YCrCb":\n' +
      '            im_show = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB)\n' +
      '        else:\n' +
      '            im_show = im\n' +
      '        ax.imshow(im_show)\n' +
      '    else:\n' +
      '        ax.imshow(im, cmap=cm)\n' +
      '    ax.set_title(t); ax.axis("off")\n' +
      'plt.show()\n\n' +
      '# ========== 提取单通道 ==========\n' +
      'H, S, V = cv2.split(hsv)\n' +
      'L, a, b  = cv2.split(lab)\n' +
      'Y, Cr, Cb = cv2.split(ycrcb)\n' +
      'print("HSV 三通道均值:", H.mean(), S.mean(), V.mean())'
  },
  {
    id: 'opencv-hsv-threshold',
    title: '12. HSV 颜色阈值：按颜色过滤目标',
    category: '颜色与阈值',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '把图转 HSV 后用 inRange 取颜色区间，是"找红绿灯"、"识别彩色目标"最稳的入门招式。',
    detail: [
      '流程：BGR → HSV → cv2.inRange(hsv, lower, upper) → mask（白色为目标，黑色为背景）。',
      'lower 和 upper 都是 (H, S, V) 三元组，OpenCV 的 H 取值 0~179。红色跨越 0 和 180，所以要做两次 mask 再合并。',
      '颜色速查（HSV，BGR 转 HSV 后）：红色 H≈0~10 与 170~179；绿色 H≈35~85；蓝色 H≈100~130；黄色 H≈20~35；白色 S 低 V 高；黑色 S 不定 V 低。',
      '拿到 mask 后用 cv2.bitwise_and(img, img, mask=mask) 提取彩色目标；cv2.findContours 找连通域 → boundingRect / minEnclosingCircle。',
      'mask 上的"洞"用闭运算（morphology MORPH_CLOSE）填充；"毛刺"用开运算（MORPH_OPEN）去掉。',
      '亮度 V 太低时 H 通道不稳定，因此筛选 H 前最好先确保 S > 30 且 V > 30。'
    ],
    notes: [
      'OpenCV HSV 的 H 范围是 0~179（不是 0~360）；红色 H = 0 或 180 附近，需要分段。',
      'HSV 受光照影响大；阴影下 H 偏移几度到十几度，区间要"宽松一点"。',
      'inRange 返回的 mask 是 uint8 类型（0/255），不是 bool，与后续位运算匹配。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("traffic.jpg")\n' +
      'hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)\n\n' +
      '# ========== 1) 绿色 ==========\n' +
      'lower_green = np.array([35,  80,  80])\n' +
      'upper_green = np.array([85, 255, 255])\n' +
      'mask_green = cv2.inRange(hsv, lower_green, upper_green)\n\n' +
      '# ========== 2) 红色：跨越 HSV 两端，需合并 ==========\n' +
      'lower_red1 = np.array([  0, 100, 100])\n' +
      'upper_red1 = np.array([ 10, 255, 255])\n' +
      'lower_red2 = np.array([170, 100, 100])\n' +
      'upper_red2 = np.array([180, 255, 255])\n' +
      'mask_red = cv2.inRange(hsv, lower_red1, upper_red1) | \\\n' +
      '           cv2.inRange(hsv, lower_red2, upper_red2)\n\n' +
      '# ========== 3) 后处理：开运算去噪 ==========\n' +
      'kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))\n' +
      'mask_green_clean = cv2.morphologyEx(mask_green, cv2.MORPH_OPEN, kernel)\n' +
      'mask_red_clean   = cv2.morphologyEx(mask_red,   cv2.MORPH_OPEN, kernel)\n\n' +
      '# ========== 4) 显示原图 + mask + 提取目标 ==========\n' +
      'only_red = cv2.bitwise_and(img, img, mask=mask_red_clean)\n' +
      'only_grn = cv2.bitwise_and(img, img, mask=mask_green_clean)\n' +
      'combined = cv2.addWeighted(only_red, 0.5, only_grn, 0.5, 0)\n\n' +
      'cv2.imshow("red mask",  mask_red_clean)\n' +
      'cv2.imshow("green mask", mask_green_clean)\n' +
      'cv2.imshow("extracted", combined)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 5) 在彩色目标上画外接圆 ==========\n' +
      'cnts, _ = cv2.findContours(mask_red_clean, cv2.RETR_EXTERNAL,\n' +
      '                           cv2.CHAIN_APPROX_SIMPLE)\n' +
      'for c in cnts:\n' +
      '    if cv2.contourArea(c) < 200: continue\n' +
      '    (x, y), r = cv2.minEnclosingCircle(c)\n' +
      '    cv2.circle(img, (int(x), int(y)), int(r), (0, 255, 255), 2)\n' +
      'cv2.imshow("circles", img)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 6) 用滑动条交互调阈值 ==========\n' +
      'def nothing(x): pass\n' +
      'cv2.namedWindow("track", cv2.WINDOW_NORMAL)\n' +
      'for name in ("H1", "S1", "V1", "H2", "S2", "V2"):\n' +
      '    cv2.createTrackbar(name, "track", 0, 179 if "H" in name else 255, nothing)\n' +
      'cv2.createTrackbar("S2", "track", 255, 255, nothing)\n' +
      'while True:\n' +
      '    h1 = cv2.getTrackbarPos("H1", "track")\n' +
      '    s1 = cv2.getTrackbarPos("S1", "track")\n' +
      '    v1 = cv2.getTrackbarPos("V1", "track")\n' +
      '    h2 = cv2.getTrackbarPos("H2", "track")\n' +
      '    s2 = cv2.getTrackbarPos("S2", "track")\n' +
      '    v2 = cv2.getTrackbarPos("V2", "track")\n' +
      '    if h2 < h1: h2 = h1\n' +
      '    if s2 < s1: s2 = s1\n' +
      '    if v2 < v1: v2 = v1\n' +
      '    mask = cv2.inRange(hsv, (h1, s1, v1), (h2, s2, v2))\n' +
      '    cv2.imshow("track", mask)\n' +
      '    if cv2.waitKey(30) & 0xFF == 27: break\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-threshold',
    title: '13. 灰度阈值：threshold / adaptiveThreshold / Otsu',
    category: '颜色与阈值',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '把灰度图变成黑白 mask 是几乎所有"提取前景"算法的第一步；阈值选错一切免谈。',
    detail: [
      'cv2.threshold(src, thresh, maxval, type) 输入灰度图，返回 (ret, dst)。type 取值：THRESH_BINARY（>thresh → maxval，否则 0）、THRESH_BINARY_INV（反）、THRESH_TRUNC（>thresh → thresh）、THRESH_TOZERO（>thresh 不变，否则 0）、THRESH_TOZERO_INV（反）。',
      'ret 是当 type 加了 THRESH_OTSU 标志时返回的"自动求得的阈值"，常用于光照不均但目标灰度与背景明显分离的场景。',
      'cv2.adaptiveThreshold(src, maxValue, adaptiveMethod, thresholdType, blockSize, C) 让阈值随局部邻域变化：ADAPTIVE_THRESH_GAUSSIAN 或 MEAN_C，blockSize 是邻域（奇数），C 是从均值里减去的常数（让阈值更严格）。',
      'Otsu 算法：当图像直方图呈双峰（前景/背景）时，Otsu 自动找使类间方差最大的阈值。调用：ret, mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)，ret 就是自动阈值。',
      'Triangle 算法：对单峰直方图（暗或亮的背景）更好：cv2.THRESH_TRIANGLE。',
      '光照不均的应对：① 灰度 + 自适应阈值；② 先做背景减除（cv2.subtract 或形态学 opening）；③ 转 HSV/Lab 用 V/L 通道再阈值。',
      '评估阈值质量：plt.hist(gray.ravel(), 256) 看分布；如果有明显的双峰，Otsu 效果好；否则改用自适应阈值。'
    ],
    notes: [
      'threshold 必须输入灰度图（单通道），否则抛异常。',
      'adaptiveThreshold 的 blockSize 必须是奇数（3、5、7、…），太小噪声大，太大边界模糊。',
      '二值图用 0/255 表示前景/背景，方便做形态学运算；用 0/1 也可以，但要自己 *255 或 .astype(np.uint8)。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import matplotlib.pyplot as plt\n\n' +
      'gray = cv2.imread("doc.jpg", cv2.IMREAD_GRAYSCALE)\n\n' +
      '# ========== 1) 全局阈值 ==========\n' +
      '_, mask_bin = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)\n' +
      '_, mask_inv = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)\n\n' +
      '# ========== 2) Otsu 自动阈值（双峰场景）==========\n' +
      'ret_otsu, mask_otsu = cv2.threshold(\n' +
      '    gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      'print(f"Otsu 自动阈值 = {ret_otsu:.1f}")\n\n' +
      '# ========== 3) 自适应阈值（光照不均场景）==========\n' +
      'mask_adapt = cv2.adaptiveThreshold(\n' +
      '    gray, 255,\n' +
      '    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,\n' +
      '    cv2.THRESH_BINARY,\n' +
      '    blockSize=15, C=8)\n\n' +
      '# ========== 4) 直方图可视化 ==========\n' +
      'plt.figure(figsize=(8, 4))\n' +
      'plt.hist(gray.ravel(), bins=256, range=(0, 256), color="black")\n' +
      'plt.axvline(ret_otsu, color="red", label=f"Otsu={ret_otsu:.0f}")\n' +
      'plt.legend(); plt.title("Histogram")\n' +
      'plt.show()\n\n' +
      '# ========== 5) 比较展示 ==========\n' +
      'cv2.imshow("gray",         gray)\n' +
      'cv2.imshow("binary 127",  mask_bin)\n' +
      'cv2.imshow("otsu",        mask_otsu)\n' +
      'cv2.imshow("adaptive 15/8", mask_adapt)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 6) 进阶：先做背景减除再 Otsu（处理不均匀光照）==========\n' +
      'blur = cv2.GaussianBlur(gray, (51, 51), 0)\n' +
      'background = cv2.medianBlur(blur, 51)\n' +
      'sub = cv2.subtract(background, gray)         # 减背景相当于"扁平化"光照\n' +
      '_, mask_sub = cv2.threshold(sub, 0, 255,\n' +
      '                            cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      'cv2.imshow("subtracted then otsu", mask_sub)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-mask-ops',
    title: '14. 位运算与 mask 操作：bitwise_and / setTo',
    category: '颜色与阈值',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '位运算把 mask 应用到彩色图上做"提取前景"、"替换背景"、"画在背景上"等操作。',
    detail: [
      'cv2.bitwise_and(img1, img2, mask=m)：m=255 处保留 img1 & img2 的像素；m=0 处全黑。',
      'cv2.bitwise_or / xor / not：按位操作，图像上用途较少（主要是位级 mask 合成时偶尔用到）。',
      '提取前景：only_fg = cv2.bitwise_and(img, img, mask=mask)。',
      '替换背景：bg = np.full_like(img, 255); combined = np.where(mask[..., None].astype(bool), img, bg)。',
      '画到画布上：canvas[roi_y1:roi_y2, roi_x1:roi_x2] = img[roi_y1:roi_y2, roi_x1:roi_x2]（mask 控制是否覆盖）。',
      '掩膜合并：combined_mask = cv2.bitwise_or(maskA, maskB)。',
      'cv2.copyTo(src, mask, dst) 把 src 按 mask 复制到 dst；mask=0 的像素保留 dst 原值，mask=255 的像素被 src 覆盖。'
    ],
    notes: [
      'bitwise_and 在彩色图上逐通道独立计算；用 mask 时 mask 必须是单通道。',
      'mask 必须 uint8（0/255），不是 bool；numpy 的 bool mask 不能直接喂给 OpenCV。',
      '要"替换透明背景"：用 BGRA 4 通道，alpha = mask/255，cv2.imwrite(".png", bgra) 保存即可。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("selfie.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# 1) 自己造一个圆形 mask\n' +
      'mask = np.zeros((h, w), dtype=np.uint8)\n' +
      'cv2.circle(mask, (w // 2, h // 2), min(h, w) // 3, 255, -1)\n\n' +
      '# 2) 提取圆形前景\n' +
      'only_fg = cv2.bitwise_and(img, img, mask=mask)\n\n' +
      '# 3) 把圆形区域换成纯蓝背景\n' +
      'bg_blue = np.full_like(img, (255, 0, 0))\n' +
      'm3 = mask[..., None].astype(bool)              # (H, W, 1) bool\n' +
      'composed = np.where(m3, img, bg_blue)\n\n' +
      '# 4) mask 叠加：把两个 mask 取并集\n' +
      'mask2 = np.zeros_like(mask)\n' +
      'cv2.rectangle(mask2, (50, 50), (w - 50, h - 50), 255, -1)\n' +
      'union = cv2.bitwise_or(mask, mask2)\n' +
      'union_view = cv2.bitwise_and(img, img, mask=union)\n\n' +
      '# 5) 把人像放到画布的左上角（透明 PNG）\n' +
      'canvas = np.zeros((h, w, 4), dtype=np.uint8)\n' +
      'bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)\n' +
      'bgra[:, :, 3] = mask                            # alpha = mask\n' +
      'cv2.imwrite("selfie_alpha.png", bgra)\n\n' +
      'cv2.imshow("mask",        mask)\n' +
      'cv2.imshow("only fg",     only_fg)\n' +
      'cv2.imshow("composed",    composed)\n' +
      'cv2.imshow("union view",  union_view)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-morphology',
    title: '15. 形态学操作：腐蚀 / 膨胀 / 开闭运算',
    category: '颜色与阈值',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '形态学是基于形状的图像操作，腐蚀/膨胀是基础，开闭运算负责去噪和补洞，几乎所有 mask 都要过它。',
    detail: [
      '形态学操作的输入通常是二值 mask（0/255）。它用结构元素（kernel）在图像上滑动，根据"邻域内的 0/255 关系"决定输出。',
      'cv2.getStructuringElement(shape, ksize)：shape 取 MORPH_RECT（矩形）、MORPH_ELLIPSE（椭圆）、MORPH_CROSS（十字）；ksize 是 (宽, 高) 的元组。',
      'cv2.erode(src, kernel, iterations)：腐蚀，输出像素保留需要 kernel 范围内"全部是前景"的位置 → 白色区域缩小、黑色区域扩大。',
      'cv2.dilate(src, kernel, iterations)：膨胀，输出像素只要 kernel 范围内"有任一前景"就保留 → 白色区域扩大。',
      'cv2.morphologyEx(src, op, kernel)：组合操作：MORPH_OPEN = 先 erode 再 dilate（去掉小亮点/毛刺）；MORPH_CLOSE = 先 dilate 再 erode（填补小黑点/连接裂缝）；MORPH_GRADIENT = 膨胀 - 腐蚀（边缘提取）。',
      'iterations 控制强度；1 次通常够，2~3 次用于严重噪声或大块连通域融合。',
      '典型用法：① threshold → open（去白点）；② close（补黑洞）；③ findContours 找目标。'
    ],
    notes: [
      '形态学操作假设前景是白色（255），背景是黑色（0）；如果反过来，腐蚀膨胀的效果会颠倒。',
      'kernel 越大效果越强，但也会损失细节。3×3 / 5×5 是常用尺寸。',
      'iterations 越大越慢；做实时视频流时谨慎。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'gray = cv2.imread("text.png", cv2.IMREAD_GRAYSCALE)\n' +
      '_, mask = cv2.threshold(gray, 0, 255,\n' +
      '                       cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)\n' +
      'kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))\n\n' +
      '# ========== 1) 基本形态学 ==========\n' +
      'eroded  = cv2.erode(mask, kernel, iterations=1)\n' +
      'dilated = cv2.dilate(mask, kernel, iterations=1)\n\n' +
      '# ========== 2) 开运算：去小白点 ==========\n' +
      'opened = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)\n\n' +
      '# ========== 3) 闭运算：补小黑洞 ==========\n' +
      'closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)\n\n' +
      '# ========== 4) 形态学梯度：边缘（膨胀 - 腐蚀）==========\n' +
      'gradient = cv2.morphologyEx(mask, cv2.MORPH_GRADIENT, kernel)\n\n' +
      '# ========== 5) 顶帽：原图 - 开运算（提取亮斑）==========\n' +
      'tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)\n' +
      '# 黑帽：闭运算 - 原图（提取暗斑）\n' +
      'blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)\n\n' +
      'cv2.imshow("mask",     mask)\n' +
      'cv2.imshow("erode",    eroded)\n' +
      'cv2.imshow("dilate",   dilated)\n' +
      'cv2.imshow("open",     opened)\n' +
      'cv2.imshow("close",    closed)\n' +
      'cv2.imshow("gradient", gradient)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 6) 实战：把带噪点的 mask 修干净 ==========\n' +
      'def clean_mask(mask, ksize=3):\n' +
      '    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ksize, ksize))\n' +
      '    m = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)   # 去白点\n' +
      '    m = cv2.morphologyEx(m,    cv2.MORPH_CLOSE, kernel)  # 补黑点\n' +
      '    return m\n\n' +
      'clean = clean_mask(mask)\n' +
      'cv2.imshow("clean", clean)\n' +
      'cv2.waitKey(0)'
  }
];