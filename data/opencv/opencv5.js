// OpenCV 教程 —— 第五部分：轮廓与特征检测
module.exports = [
  {
    id: 'opencv-contour',
    title: '19. 轮廓查找：findContours 与层级关系',
    category: '轮廓与特征',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'findContours 从二值图提取所有轮廓；理解 RETR_TREE、CHAIN_APPROX_* 选项是后续形状分析的前提。',
    detail: [
      'cv2.findContours(image, mode, method, offset) 返回 (contours, hierarchy)。image 必须是 uint8 二值图（0/255）。',
      'retrieval mode 决定层级：RETR_EXTERNAL 只找最外层；RETR_LIST 不管层级全部列出；RETR_CCOMP 分两层（外+内洞）；RETR_TREE 完整层级树（父子关系）。',
      'contour approximation method：CHAIN_APPROX_NONE 记录每个边界像素（内存大）；CHAIN_APPROX_SIMPLE 只存端点（矩形 4 点即可），默认且推荐。',
      'contours 是一个 list，每个元素是 shape=(N, 1, 2) 的 numpy 数组 → N 个 (x, y) 像素点。',
      'hierarchy 是 shape=(1, N, 4) 的数组，每个轮廓对应 [next, prev, first_child, parent] 的索引，-1 表示不存在。',
      'OpenCV 4.x 起的 API：findContours 不再单独返回 img，返回值变成两个（contours, hierarchy），原图不会再被改写（4.x 之前的 drawContours 之前会改 image 参数）。',
      '常用后处理：cv2.contourArea(c) 算面积；cv2.arcLength(c, True) 算周长；cv2.boundingRect(c) 外接矩形；cv2.minEnclosingCircle(c) 最小外接圆；cv2.convexHull(c) 凸包；cv2.approxPolyDP(c, eps, closed) 多边形逼近。'
    ],
    notes: [
      'findContours 要求输入 uint8；如果是 float 或 0/1 mask，调用前先 (mask * 255).astype(np.uint8)。',
      'RETR_TREE + CHAIN_APPROX_SIMPLE 是最常用组合：拿到完整层级，内存又省。',
      'OpenCV 4.5 之前 findContours 是 [contours, hierarchy] = cv2.findContours(...)；4.5 之后签名没变，但 image 不再被修改。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("shapes.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      '_, mask = cv2.threshold(gray, 0, 255,\n' +
      '                       cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n\n' +
      '# ========== 1) 查找所有外轮廓（简单）==========\n' +
      'contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      'print(f"外部轮廓数: {len(contours)}")\n\n' +
      '# ========== 2) 画轮廓 ==========\n' +
      'canvas = img.copy()\n' +
      'cv2.drawContours(canvas, contours, -1, (0, 255, 0), 2)\n\n' +
      '# ========== 3) 计算每个轮廓的属性 ==========\n' +
      'for i, c in enumerate(contours):\n' +
      '    area = cv2.contourArea(c)\n' +
      '    if area < 100: continue                # 过滤噪声\n' +
      '    peri = cv2.arcLength(c, True)\n' +
      '    x, y, w, h = cv2.boundingRect(c)\n' +
      '    cv2.rectangle(canvas, (x, y), (x + w, y + h), (255, 0, 0), 2)\n' +
      '    cv2.putText(canvas, f"{i}", (x, y - 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)\n\n' +
      '# ========== 4) 形状分类（圆/方/三角）==========\n' +
      'def classify(c):\n' +
      '    peri = cv2.arcLength(c, True)\n' +
      '    approx = cv2.approxPolyDP(c, 0.04 * peri, True)\n' +
      '    v = len(approx)\n' +
      '    if v == 3: return "triangle"\n' +
      '    if v == 4:\n' +
      '        x, y, w, h = cv2.boundingRect(approx)\n' +
      '        return "square" if abs(w - h) < 5 else "rect"\n' +
      '    if v == 6 or v == 7 or v == 8: return "circle_or_hex"\n' +
      '    return f"poly({v})"\n\n' +
      'for c in contours:\n' +
      '    if cv2.contourArea(c) < 100: continue\n' +
      '    kind = classify(c)\n' +
      '    print("形状:", kind, "面积:", cv2.contourArea(c))\n\n' +
      '# ========== 5) 凸包与凸性检测 ==========\n' +
      'for c in contours:\n' +
      '    if cv2.contourArea(c) < 100: continue\n' +
      '    hull = cv2.convexHull(c)\n' +
      '    hull_area = cv2.contourArea(hull)\n' +
      '    if hull_area > 0:\n' +
      '        solidity = cv2.contourArea(c) / hull_area\n' +
      '        # solidity 接近 1 表示形状凸；越小越凹陷\n' +
      '        print("solidity =", solidity)\n\n' +
      'cv2.imshow("contours", canvas)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("shapes.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      '_, mask = cv2.threshold(gray, 0, 255,\n' +
      '                       cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n\n' +
      '# ========== 用 RETR_TREE 获取完整层级关系 ==========\n' +
      'contours, hierarchy = cv2.findContours(mask, cv2.RETR_TREE,\n' +
      '                                       cv2.CHAIN_APPROX_SIMPLE)\n' +
      'canvas = img.copy()\n\n' +
      '# hierarchy: [next, prev, first_child, parent]\n' +
      'if hierarchy is not None:\n' +
      '    h = hierarchy[0]\n' +
      '    for i in range(len(contours)):\n' +
      '        parent_idx = h[i][3]\n' +
      '        child_idx = h[i][2]\n' +
      '        color = (0, 255, 0) if parent_idx == -1 else (255, 0, 0)\n' +
      '        cv2.drawContours(canvas, contours, i, color, 2)\n' +
      '        x, y, _, _ = cv2.boundingRect(contours[i])\n' +
      '        label = f"i={i} p={parent_idx} c={child_idx}"\n' +
      '        cv2.putText(canvas, label, (x, y - 5),\n' +
      '                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)\n\n' +
      '# ========== 过滤：只保留有子轮廓的外层 ==========\n' +
      'print("--- 有子轮廓的外层 ---")\n' +
      'for i in range(len(contours)):\n' +
      '    if h[i][3] == -1 and h[i][2] != -1:\n' +
      '        print(f"  轮廓 {i}, 子={h[i][2]}, 面积={cv2.contourArea(contours[i]):.0f}")\n\n' +
      'cv2.imshow("hierarchy", canvas)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 根据轮廓面积 + 圆形度 + 长宽比做目标筛选 ==========\n' +
      'img = cv2.imread("coins.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'blurred = cv2.GaussianBlur(gray, (5, 5), 0)\n' +
      '_, thresh = cv2.threshold(blurred, 0, 255,\n' +
      '                          cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)\n\n' +
      'contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      'canvas = img.copy()\n' +
      'import math\n\n' +
      'results = []\n' +
      'for c in contours:\n' +
      '    area = cv2.contourArea(c)\n' +
      '    if area < 200: continue\n' +
      '    peri = cv2.arcLength(c, True)\n' +
      '    circularity = 4 * math.pi * area / (peri * peri + 1e-6)\n' +
      '    x, y, w, h = cv2.boundingRect(c)\n' +
      '    aspect = max(w, h) / (min(w, h) + 1e-6)\n' +
      '    results.append((c, area, circularity, aspect))\n\n' +
      '# 按面积排序并标注\n' +
      'results.sort(key=lambda r: r[1], reverse=True)\n' +
      'for rank, (c, area, circ, asp) in enumerate(results[:10]):\n' +
      '    x, y, w, h = cv2.boundingRect(c)\n' +
      '    cv2.rectangle(canvas, (x, y), (x + w, y + h), (0, 255, 0), 1)\n' +
      '    label = f"#{rank} a={area:.0f} c={circ:.2f} ar={asp:.1f}"\n' +
      '    cv2.putText(canvas, label, (x, y - 3),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)\n' +
      '    # circularity > 0.8 且 aspect < 1.5 通常可判断为圆形\n' +
      '    shape = "circle" if (circ > 0.8 and asp < 1.5) else "other"\n' +
      '    print(f"{label} -> {shape}")\n\n' +
      'cv2.imshow("filtered", canvas)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-contour-props',
    title: '20. 轮廓属性：面积 / 周长 / 矩 / 圆形度 / Hu 不变矩',
    category: '轮廓与特征',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '从轮廓能算出几十个几何属性，足以覆盖大多数"形状分类 / 目标筛选"需求。',
    detail: [
      '面积：cv2.contourArea(c)。等于像素总数；可用于过滤太小的区域。',
      '周长（弧长）：cv2.arcLength(c, closed=True/False)。闭合是 True。',
      '外接矩形：x, y, w, h = cv2.boundingRect(c) → 轴对齐矩形；cv2.minAreaRect(c) → 旋转矩形（返回 RotatedRect）。',
      '最小外接圆：(center, radius) = cv2.minEnclosingCircle(c)。',
      '凸包：cv2.convexHull(c, clockwise=True)；凸包面积 / 轮廓面积 = 凸性（solidity），越接近 1 越凸。',
      '圆形度：circularity = 4π · area / perimeter²；= 1 表示完美圆，越小越扁。',
      '中心：cv2.moments(c) 返回各阶矩；由 m00 / m10 / m01 计算质心 cx = m10/m00, cy = m01/m00。',
      'Hu 不变矩：cv2.HuMoments(m) 输出 7 个对平移/旋转/缩放不变的特征量。用来做形状相似度比较或简单 logo 识别。',
      '轮廓匹配：cv2.matchShapes(contourA, contourB, method, parameter) → 距离，越小越相似。'
    ],
    notes: [
      'cv2.moments 返回字典；m00 是零阶矩（=面积）。',
      'Hu 不变矩对噪声敏感，匹配前最好用 approxPolyDP 简化轮廓。',
      '圆形度公式 4πA/P²；面积越大同样 P 得到的圆度越接近 1，小区域波动大。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import math\n\n' +
      'img = cv2.imread("shapes.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      '_, mask = cv2.threshold(gray, 0, 255,\n' +
      '                       cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      'contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n\n' +
      'canvas = img.copy()\n\n' +
      'for i, c in enumerate(contours):\n' +
      '    area = cv2.contourArea(c)\n' +
      '    if area < 50: continue\n' +
      '    peri = cv2.arcLength(c, True)\n\n' +
      '    # 1) 圆形度\n' +
      '    circularity = 4 * math.pi * area / (peri * peri + 1e-6)\n' +
      '\n' +
      '    # 2) 质心\n' +
      '    m = cv2.moments(c)\n' +
      '    if m["m00"] > 0:\n' +
      '        cx, cy = int(m["m10"] / m["m00"]), int(m["m01"] / m["m00"])\n' +
      '        cv2.circle(canvas, (cx, cy), 3, (0, 0, 255), -1)\n' +
      '        cv2.putText(canvas, f"({cx},{cy})", (cx + 5, cy),\n' +
      '                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)\n' +
      '\n' +
      '    # 3) 旋转外接矩形\n' +
      '    rect = cv2.minAreaRect(c)\n' +
      '    box = cv2.boxPoints(rect).astype(int)\n' +
      '    cv2.drawContours(canvas, [box], 0, (0, 255, 255), 1)\n' +
      '\n' +
      '    # 4) 凸性\n' +
      '    hull = cv2.convexHull(c)\n' +
      '    hull_area = cv2.contourArea(hull)\n' +
      '    solidity = area / hull_area if hull_area > 0 else 0\n' +
      '\n' +
      '    # 5) Hu 不变矩\n' +
      '    hu = cv2.HuMoments(m).flatten()\n' +
      '    # 取 -sign(h) * log10(|h|) 让数值更稳定\n' +
      '    hu_log = -np.sign(hu) * np.log10(np.abs(hu) + 1e-30)\n' +
      '\n' +
      '    x, y, w, h = cv2.boundingRect(c)\n' +
      '    cv2.rectangle(canvas, (x, y), (x + w, y + h), (255, 0, 0), 1)\n' +
      '    cv2.putText(canvas,\n' +
      '                f"circ={circularity:.2f} sol={solidity:.2f}",\n' +
      '                (x, y - 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 200, 0), 1)\n' +
      '    print(f"#{i} area={area:.0f} circ={circularity:.2f} "\n' +
      '          f"solidity={solidity:.2f} hu_log={hu_log.round(2).tolist()}")\n\n' +
      '# ========== 6) 两个轮廓的形状相似度 ==========\n' +
      'if len(contours) >= 2:\n' +
      '    a, b = sorted(contours, key=cv2.contourArea, reverse=True)[:2]\n' +
      '    dist = cv2.matchShapes(a, b, cv2.CONTOURS_MATCH_I1, 0)\n' +
      '    print(f"两轮廓 matchShapes 距离 = {dist:.4f}")\n\n' +
      'cv2.imshow("props", canvas)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("parts.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      '_, mask = cv2.threshold(gray, 0, 255,\n' +
      '                       cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      'contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n\n' +
      '# ========== 用 moments 质心做排序 ==========\n' +
      'centers = []\n' +
      'for c in contours:\n' +
      '    m = cv2.moments(c)\n' +
      '    if m["m00"] < 50: continue\n' +
      '    cx = m["m10"] / m["m00"]\n' +
      '    cy = m["m01"] / m["m00"]\n' +
      '    centers.append((c, cx, cy))\n\n' +
      '# 按从上到下、从左到右排序\n' +
      'centers.sort(key=lambda r: (round(r[2] / 30), r[1]))\n' +
      'canvas = img.copy()\n' +
      'for rank, (c, cx, cy) in enumerate(centers):\n' +
      '    cv2.drawContours(canvas, [c], 0, (0, 255, 0), 2)\n' +
      '    cv2.putText(canvas, str(rank), (int(cx) - 5, int(cy) + 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)\n' +
      '    print(f"#{rank} center=({cx:.1f}, {cy:.1f})")\n\n' +
      'cv2.imshow("sorted by centroid", canvas)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n' +
      'import math\n\n' +
      '# ========== 用 Hu 不变矩做模板形状匹配 ==========\n' +
      'template_img = cv2.imread("template_shape.png")\n' +
      'query_img = cv2.imread("query_scene.png")\n' +
      't_gray = cv2.cvtColor(template_img, cv2.COLOR_BGR2GRAY)\n' +
      'q_gray = cv2.cvtColor(query_img, cv2.COLOR_BGR2GRAY)\n\n' +
      '_, t_mask = cv2.threshold(t_gray, 0, 255,\n' +
      '                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      '_, q_mask = cv2.threshold(q_gray, 0, 255,\n' +
      '                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n\n' +
      't_contours, _ = cv2.findContours(t_mask, cv2.RETR_EXTERNAL,\n' +
      '                                  cv2.CHAIN_APPROX_SIMPLE)\n' +
      'q_contours, _ = cv2.findContours(q_mask, cv2.RETR_EXTERNAL,\n' +
      '                                  cv2.CHAIN_APPROX_SIMPLE)\n\n' +
      '# 取模板最大轮廓\n' +
      't_c = max(t_contours, key=cv2.contourArea)\n' +
      't_hu = cv2.HuMoments(cv2.moments(t_c)).flatten()\n' +
      't_hu_log = -np.sign(t_hu) * np.log10(np.abs(t_hu) + 1e-30)\n\n' +
      '# 与场景中每个轮廓匹配\n' +
      'canvas = query_img.copy()\n' +
      'for qc in q_contours:\n' +
      '    if cv2.contourArea(qc) < 100: continue\n' +
      '    dist = cv2.matchShapes(t_c, qc, cv2.CONTOURS_MATCH_I2, 0)\n' +
      '    x, y, w, h = cv2.boundingRect(qc)\n' +
      '    color = (0, 255, 0) if dist < 0.3 else (0, 0, 255)\n' +
      '    cv2.rectangle(canvas, (x, y), (x + w, y + h), color, 2)\n' +
      '    cv2.putText(canvas, f"d={dist:.3f}", (x, y - 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)\n' +
      '    tag = "match" if dist < 0.3 else "no"\n' +
      '    print(f"轮廓 dist={dist:.4f} -> {tag}")\n\n' +
      'cv2.imshow("hu match", canvas)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-template-match',
    title: '21. 模板匹配：在一张大图里找小图',
    category: '轮廓与特征',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'cv2.matchTemplate 用滑动窗口比较相似度，最快也最容易上手，但只能找"大小一致、方向相同"的目标。',
    detail: [
      'cv2.matchTemplate(image, templ, method[, mask]) 在 image 上按 templ 滑窗比较，结果是 (W-w+1, H-h+1) 的单通道匹配图。',
      'method 决定相似度度量：TM_SQDIFF（平方差，越小越好）、TM_CCORR_NORMED（归一化相关性，越大越好）、TM_CCOEFF_NORMED（归一化相关系数，越大越好，推荐）。',
      '最匹配位置用 cv2.minMaxLoc(result) 拿：minVal / maxVal 是最差/最佳值；minLoc / maxLoc 是 (x, y) 坐标。',
      '拿到 (x, y) 后在 image 上画 (x, y, x+w, y+h) 即定位。',
      '多目标匹配：对 result 做阈值分割（method 是 TM_CCOEFF_NORMED 时 >0.8 即可），找连通区域，每个区域的 (x, y) 都是一个目标。',
      '局限：模板必须与目标同尺度同方向，旋转 1° 或缩放 0.9 都会失配。需要尺度/旋转不变用特征匹配（SIFT/ORB）。'
    ],
    notes: [
      'matchTemplate 只支持灰度图；彩色图先 cvtColor 转灰。',
      '模板尺寸比目标大时会失效；不要用比原图大的模板。',
      'mask 参数是 OpenCV 4.x 加的，可用掩膜排除模板里的某些像素（仅 TM_SQDIFF / TM_CCORR_NORMED 支持）。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img   = cv2.imread("puzzle.png")              # 大图\n' +
      'templ = cv2.imread("piece.png", cv2.IMREAD_GRAYSCALE)\n' +
      'gray  = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'h, w  = templ.shape[:2]\n\n' +
      '# ========== 1) 单目标匹配（找最相似的位置）==========\n' +
      'result = cv2.matchTemplate(gray, templ, cv2.TM_CCOEFF_NORMED)\n' +
      'min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)\n' +
      'print(f"最佳匹配 score = {max_val:.3f}")\n' +
      'x, y = max_loc\n' +
      'cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)\n' +
      'cv2.putText(img, f"{max_val:.2f}", (x, y - 5),\n' +
      '            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)\n\n' +
      '# ========== 2) 多目标匹配：阈值法 ==========\n' +
      'result = cv2.matchTemplate(gray, templ, cv2.TM_CCOEFF_NORMED)\n' +
      'threshold = 0.85\n' +
      'ys, xs = np.where(result >= threshold)              # 所有高分位置\n' +
      'rects = []\n' +
      'for x, y in zip(xs, ys):\n' +
      '    rects.append([x, y, x + w, y + h])\n\n' +
      '# 用 NMS（极大值抑制）去掉重叠\n' +
      'rects = np.array(rects)\n' +
      'scores = result[ys, xs]\n' +
      'indices = cv2.dnn.NMSBoxes(\n' +
      '    bboxes=rects.tolist(),\n' +
      '    scores=scores.tolist(),\n' +
      '    score_threshold=threshold,\n' +
      '    nms_threshold=0.3)\n\n' +
      'for i in indices.flatten() if len(indices) else []:\n' +
      '    x0, y0, x1, y1 = rects[i]\n' +
      '    cv2.rectangle(img, (x0, y0), (x1, y1), (0, 0, 255), 2)\n\n' +
      '# ========== 3) 多种 method 对比 ==========\n' +
      'for m in [cv2.TM_SQDIFF_NORMED, cv2.TM_CCORR_NORMED,\n' +
      '          cv2.TM_CCOEFF_NORMED]:\n' +
      '    r = cv2.matchTemplate(gray, templ, m)\n' +
      '    _, v, _, loc = cv2.minMaxLoc(r)\n' +
      '    print(f"{m} -> val={v:.3f} loc={loc}")\n\n' +
      'cv2.imshow("matched", img)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 多尺度模板匹配 ==========\n' +
      'img = cv2.imread("scene.png")\n' +
      'templ = cv2.imread("object.png", cv2.IMREAD_GRAYSCALE)\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'th, tw = templ.shape[:2]\n\n' +
      'best_val = -1\n' +
      'best_loc = None\n' +
      'best_scale = 1.0\n\n' +
      'for scale in np.linspace(0.5, 1.5, 15):\n' +
      '    resized = cv2.resize(templ, None, fx=scale, fy=scale)\n' +
      '    rh, rw = resized.shape[:2]\n' +
      '    if rw > gray.shape[1] or rh > gray.shape[0]:\n' +
      '        continue\n' +
      '    result = cv2.matchTemplate(gray, resized, cv2.TM_CCOEFF_NORMED)\n' +
      '    _, max_val, _, max_loc = cv2.minMaxLoc(result)\n' +
      '    if max_val > best_val:\n' +
      '        best_val = max_val\n' +
      '        best_loc = max_loc\n' +
      '        best_scale = scale\n' +
      '        best_w, best_h = rw, rh\n\n' +
      'print(f"best_scale={best_scale:.2f} score={best_val:.3f}")\n' +
      'x, y = best_loc\n' +
      'cv2.rectangle(img, (x, y), (x + best_w, y + best_h), (0, 255, 0), 2)\n' +
      'cv2.putText(img, f"scale={best_scale:.2f}", (x, y - 5),\n' +
      '            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)\n\n' +
      'cv2.imshow("multi-scale", img)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 用 mask 排除模板边框做鲁棒匹配 ==========\n' +
      'img = cv2.imread("scene2.png")\n' +
      'templ = cv2.imread("logo.png", cv2.IMREAD_GRAYSCALE)\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'h, w = templ.shape[:2]\n\n' +
      '# 创建圆形掩膜：只关注 logo 中心部分\n' +
      'mask = np.zeros_like(templ)\n' +
      'center = (w // 2, h // 2)\n' +
      'radius = min(w, h) // 3\n' +
      'cv2.circle(mask, center, radius, 255, -1)\n\n' +
      '# TM_SQDIFF 支持 mask\n' +
      'result = cv2.matchTemplate(gray, templ, cv2.TM_SQDIFF, mask=mask)\n' +
      'min_val, _, min_loc, _ = cv2.minMaxLoc(result)\n' +
      'x, y = min_loc\n' +
      'print(f"TM_SQDIFF best = {min_val:.3f} at ({x}, {y})")\n' +
      'cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)\n\n' +
      '# ========== 多阈值检测多个位置 ==========\n' +
      'result2 = cv2.matchTemplate(gray, templ, cv2.TM_CCOEFF_NORMED)\n' +
      'for thresh in [0.9, 0.8, 0.7]:\n' +
      '    ys, xs = np.where(result2 >= thresh)\n' +
      '    if len(xs) == 0: continue\n' +
      '    # 简单聚类：合并距离 < w/2 的点\n' +
      '    pts = list(zip(xs.tolist(), ys.tolist()))\n' +
      '    merged = []\n' +
      '    used = [False] * len(pts)\n' +
      '    for i in range(len(pts)):\n' +
      '        if used[i]: continue\n' +
      '        group = [pts[i]]\n' +
      '        used[i] = True\n' +
      '        for j in range(i + 1, len(pts)):\n' +
      '            if used[j]: continue\n' +
      '            if abs(pts[j][0] - pts[i][0]) < w // 2:\n' +
      '                group.append(pts[j])\n' +
      '                used[j] = True\n' +
      '        mx = int(np.mean([p[0] for p in group]))\n' +
      '        my = int(np.mean([p[1] for p in group]))\n' +
      '        merged.append((mx, my))\n' +
      '    for px, py in merged:\n' +
      '        cv2.rectangle(img, (px, py), (px + w, py + h), (0, 0, 255), 2)\n' +
      '    print(f"thresh={thresh}: {len(merged)} matches")\n\n' +
      'cv2.imshow("masked match", img)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-features',
    title: '22. 特征检测：Harris / ORB（替代 SIFT 的轻量选择）',
    category: '轮廓与特征',
    version: 'OpenCV 4.x',
    level: '进阶',
    summary: '特征点 + 描述子能在尺度变化、旋转、光照变化下仍能匹配，是图像拼接、目标定位、AR 的基石。',
    detail: [
      'Harris 角点（cv2.cornerHarris）：检测灰度图上的"角点"，对旋转/平移不变，不耐尺度变化。score 是 2x2 矩阵的特征值乘积减 trace 的平方。',
      'Shi-Tomasi 角点（cv2.goodFeaturesToTrack）：Harris 的改进版，给定 N 个最强角点。常用于 KLT 光流跟踪。',
      'ORB（Oriented FAST + Rotated BRIEF）：OpenCV 自带的免费（无专利）特征，速度极快，对旋转尺度有一定不变性。opencv-python 默认包含。',
      'ORB 用法：orb = cv2.ORB_create(nfeatures)；kp, des = orb.detectAndCompute(gray, mask)；des 是 (N, 32) 的 uint8 描述子。',
      '匹配器：BFMatcher（暴力枚举）或 FlannBasedMatcher（KD-Tree，近似最近邻）。cv2.BFMatcher_create(cv2.NORM_HAMMING) 用于 ORB。',
      'knnMatch + ratio test：matches = bf.knnMatch(des1, des2, k=2)；保留 matches[i][0].distance < 0.75 * matches[i][1].distance 的（去除外点）。',
      'cv2.drawMatches / drawMatchesKnn 把两幅图的特征匹配连线画出来，便于调试。',
      'SIFT 和 SURF 因为专利原因在 opencv-contrib-python 中提供，需要商业授权才能商用 ORB 是无专利。'
    ],
    notes: [
      'ORB 描述子是 32 字节二进制（256 bit）；用汉明距离比较（不同位的数量）。',
      '角点检测前用 cv2.cornerHarris 前需要灰度图 + float32；输出是与原图同尺寸的 float score 图。',
      'drawKeypoints 画关键点时 flag=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS 会显示方向与尺度圆。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img1 = cv2.imread("box1.png")\n' +
      'img2 = cv2.imread("box2.png")\n' +
      'g1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)\n' +
      'g2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)\n\n' +
      '# ========== 1) Harris 角点 ==========\n' +
      'gray = np.float32(cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY))\n' +
      'harris = cv2.cornerHarris(gray, blockSize=2, ksize=3, k=0.04)\n' +
      'harris = cv2.dilate(harris, None)\n' +
      'canvas = img1.copy()\n' +
      'canvas[harris > 0.01 * harris.max()] = (0, 0, 255)\n' +
      'cv2.imshow("harris", canvas)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 2) ORB 关键点 + 描述子 ==========\n' +
      'orb = cv2.ORB_create(nfeatures=1000)\n' +
      'kp1, des1 = orb.detectAndCompute(g1, None)\n' +
      'kp2, des2 = orb.detectAndCompute(g2, None)\n\n' +
      '# ========== 3) 暴力匹配 + KNN + Ratio Test ==========\n' +
      'bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)\n' +
      'pairs = bf.knnMatch(des1, des2, k=2)\n' +
      'good = []\n' +
      'for m, n in pairs:\n' +
      '    if m.distance < 0.75 * n.distance:\n' +
      '        good.append(m)\n' +
      'print(f"匹配数: {len(good)} / {len(pairs)}")\n\n' +
      '# ========== 4) 画前 50 个好匹配 ==========\n' +
      'matched = cv2.drawMatches(img1, kp1, img2, kp2, good[:50], None,\n' +
      '                         flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\n' +
      'cv2.imshow("matches", matched)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 5) 用 good 匹配求单应矩阵（图像对齐）==========\n' +
      'if len(good) >= 4:\n' +
      '    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)\n' +
      '    print("单应矩阵:\\n", H)\n\n' +
      '    h, w = g1.shape\n' +
      '    warped = cv2.warpPerspective(img1, H, (w, h))\n' +
      '    cv2.imshow("warped", warped)\n' +
      '    cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== ORB 特征做目标定位（在场景中找目标）==========\n' +
      'target = cv2.imread("target.png")\n' +
      'scene = cv2.imread("scene.png")\n' +
      't_gray = cv2.cvtColor(target, cv2.COLOR_BGR2GRAY)\n' +
      's_gray = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY)\n\n' +
      'orb = cv2.ORB_create(nfeatures=500)\n' +
      'kp1, des1 = orb.detectAndCompute(t_gray, None)\n' +
      'kp2, des2 = orb.detectAndCompute(s_gray, None)\n\n' +
      'bf = cv2.BFMatcher(cv2.NORM_HAMMING)\n' +
      'matches = bf.knnMatch(des1, des2, k=2)\n' +
      'good = [m for m, n in matches if m.distance < 0.75 * n.distance]\n' +
      'print(f"good matches: {len(good)}")\n\n' +
      'canvas = scene.copy()\n' +
      'if len(good) >= 10:\n' +
      '    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)\n' +
      '    if H is not None:\n' +
      '        h, w = t_gray.shape\n' +
      '        corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)\n' +
      '        transformed = cv2.perspectiveTransform(corners, H)\n' +
      '        cv2.polylines(canvas, [np.int32(transformed)], True, (0, 255, 0), 3)\n' +
      '        inliers = mask.ravel().sum()\n' +
      '        print(f"inliers: {inliers}, homography found")\n' +
      '    else:\n' +
      '        print("homography failed")\n' +
      'else:\n' +
      '    print("not enough matches")\n\n' +
      'cv2.imshow("target location", canvas)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== SIFT + FLANN 做高精度特征匹配 ==========\n' +
      'img1 = cv2.imread("book1.jpg")\n' +
      'img2 = cv2.imread("book2.jpg")\n' +
      'g1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)\n' +
      'g2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)\n\n' +
      'sift = cv2.SIFT_create(nfeatures=2000)\n' +
      'kp1, des1 = sift.detectAndCompute(g1, None)\n' +
      'kp2, des2 = sift.detectAndCompute(g2, None)\n\n' +
      '# FLANN 参数\n' +
      'FLANN_INDEX_KDTREE = 1\n' +
      'index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)\n' +
      'search_params = dict(checks=50)\n' +
      'flann = cv2.FlannBasedMatcher(index_params, search_params)\n' +
      'matches = flann.knnMatch(des1, des2, k=2)\n\n' +
      'good = []\n' +
      'for pair in matches:\n' +
      '    if len(pair) == 2:\n' +
      '        m, n = pair\n' +
      '        if m.distance < 0.7 * n.distance:\n' +
      '            good.append(m)\n' +
      'print(f"FLANN good matches: {len(good)}")\n\n' +
      'canvas = cv2.drawMatches(img1, kp1, img2, kp2, good[:80], None,\n' +
      '                         flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS)\n\n' +
      'if len(good) >= 4:\n' +
      '    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)\n' +
      '    H, inlier_mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 3.0)\n' +
      '    inliers = inlier_mask.ravel().sum()\n' +
      '    print(f"inliers: {inliers}/{len(good)}")\n' +
      '    if H is not None:\n' +
      '        h, w = g1.shape\n' +
      '        warped = cv2.warpPerspective(img1, H, (w, h))\n' +
      '        cv2.imshow("sift warped", warped)\n\n' +
      'cv2.imshow("sift matches", canvas)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-straight-rect',
    title: '23. 直线与矩形检测：HoughLinesP / minAreaRect',
    category: '轮廓与特征',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '从边缘图检测直线用 HoughLinesP；找任意方向的矩形用 minAreaRect + 4 顶点排序。',
    detail: [
      'HoughLines：标准霍夫变换，输出每条线的 (ρ, θ)；HoughLinesP：概率霍夫变换，直接输出线段端点 (x1, y1, x2, y2)，更实用。',
      'cv2.HoughLinesP(image, rho, theta, threshold, minLineLength, maxLineGap)：threshold 是投票累加器阈值，minLineLength 忽略短于此的线段，maxLineGap 容忍的同线段最大间距。',
      'minAreaRect 输出 RotatedRect：((cx, cy), (w, h), angle)。angle 是 -90~0 度（水平为 -90 或 0）。',
      '把 minAreaRect 转 4 顶点：cv2.boxPoints(rect)（4 个顶点的 float32 数组）。',
      '顶点排序：① 用 np.argsort 根据 (x+y) 拿左上右下；② 把剩余按 x 排序拿右上 vs 右下。',
      'LineSegmentDetector（cv2.createLineSegmentDetector）：OpenCV 提供的 LSD 直线段检测器，比 HoughLinesP 更准，但 API 复杂。'
    ],
    notes: [
      'HoughLinesP 必须输入单通道 uint8；通常是 Canny 边缘图。',
      'minAreaRect 的 angle 与 OpenCV 版本有微妙差异，旧版是 0~90，新版是 -90~0。',
      'rect 排序后画的 4 边形不是任意顺序都能得到"顺时针"；自己设计时先验证 4 个点的对应关系。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("receipt.jpg")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'edges = cv2.Canny(gray, 80, 200)\n\n' +
      '# ========== 1) HoughLinesP 找线段 ==========\n' +
      'lines = cv2.HoughLinesP(edges, rho=1, theta=np.pi / 180,\n' +
      '                         threshold=80, minLineLength=60, maxLineGap=10)\n' +
      'canvas = img.copy()\n' +
      'if lines is not None:\n' +
      '    for l in lines:\n' +
      '        x1, y1, x2, y2 = l[0]\n' +
      '        cv2.line(canvas, (x1, y1), (x2, y2), (0, 255, 0), 1)\n\n' +
      '# ========== 2) 找最大旋转矩形 ==========\n' +
      'contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      'big = max(contours, key=cv2.contourArea)\n' +
      'rect = cv2.minAreaRect(big)\n' +
      'box  = cv2.boxPoints(rect).astype(np.int32)        # 4 顶点\n' +
      'cv2.drawContours(canvas, [box], 0, (0, 0, 255), 2)\n\n' +
      '# ========== 3) 顶点排序：左上、右上、右下、左下 ==========\n' +
      'def order_points(pts):\n' +
      '    rect = np.zeros((4, 2), dtype=np.float32)\n' +
      '    s = pts.sum(axis=1)\n' +
      '    rect[0] = pts[np.argmin(s)]           # 左上 = 和最小\n' +
      '    rect[2] = pts[np.argmax(s)]           # 右下 = 和最大\n' +
      '    diff = np.diff(pts, axis=1).ravel()\n' +
      '    rect[1] = pts[np.argmin(diff)]        # 右上 = 差最小\n' +
      '    rect[3] = pts[np.argmax(diff)]        # 左下 = 差最大\n' +
      '    return rect\n\n' +
      'ordered = order_points(box.astype(np.float32))\n' +
      'for i, p in enumerate(ordered.astype(int)):\n' +
      '    cv2.circle(canvas, tuple(p), 8, (255, 0, 0), -1)\n' +
      '    cv2.putText(canvas, str(i), tuple(p + 5),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 2)\n\n' +
      'cv2.imshow("lines + rect", canvas)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 透视变换：把倾斜的文档矫正 ==========\n' +
      'img = cv2.imread("doc_photo.jpg")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      'edges = cv2.Canny(gray, 50, 150)\n' +
      'contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      'contours = sorted(contours, key=cv2.contourArea, reverse=True)\n\n' +
      'doc_rect = None\n' +
      'for c in contours[:5]:\n' +
      '    peri = cv2.arcLength(c, True)\n' +
      '    approx = cv2.approxPolyDP(c, 0.02 * peri, True)\n' +
      '    if len(approx) == 4:\n' +
      '        doc_rect = approx.reshape(4, 2).astype(np.float32)\n' +
      '        break\n\n' +
      'if doc_rect is not None:\n' +
      '    def order_points(pts):\n' +
      '        rect = np.zeros((4, 2), dtype=np.float32)\n' +
      '        s = pts.sum(axis=1)\n' +
      '        rect[0] = pts[np.argmin(s)]\n' +
      '        rect[2] = pts[np.argmax(s)]\n' +
      '        diff = np.diff(pts, axis=1).ravel()\n' +
      '        rect[1] = pts[np.argmin(diff)]\n' +
      '        rect[3] = pts[np.argmax(diff)]\n' +
      '        return rect\n\n' +
      '    ordered = order_points(doc_rect)\n' +
      '    w1 = np.linalg.norm(ordered[2] - ordered[3])\n' +
      '    w2 = np.linalg.norm(ordered[1] - ordered[0])\n' +
      '    h1 = np.linalg.norm(ordered[1] - ordered[2])\n' +
      '    h2 = np.linalg.norm(ordered[0] - ordered[3])\n' +
      '    maxW = int(max(w1, w2))\n' +
      '    maxH = int(max(h1, h2))\n' +
      '    dst = np.float32([[0, 0], [maxW, 0],\n' +
      '                       [maxW, maxH], [0, maxH]])\n' +
      '    M = cv2.getPerspectiveTransform(ordered, dst)\n' +
      '    warped = cv2.warpPerspective(img, M, (maxW, maxH))\n' +
      '    cv2.imshow("straightened", warped)\n' +
      '    cv2.waitKey(0)\n' +
      'else:\n' +
      '    print("未找到四边形文档区域")',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 检测并统计图像中所有旋转矩形 ==========\n' +
      'img = cv2.imread("squares.png")\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n' +
      '_, thresh = cv2.threshold(gray, 0, 255,\n' +
      '                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n' +
      'contours, _ = cv2.findContours(thresh, cv2.RETR_LIST,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n\n' +
      'canvas = img.copy()\n' +
      'rect_count = 0\n\n' +
      'for c in contours:\n' +
      '    area = cv2.contourArea(c)\n' +
      '    if area < 500: continue\n' +
      '    peri = cv2.arcLength(c, True)\n' +
      '    approx = cv2.approxPolyDP(c, 0.02 * peri, True)\n' +
      '    if len(approx) != 4: continue\n' +
      '    if not cv2.isContourConvex(approx): continue\n\n' +
      '    rect = cv2.minAreaRect(c)\n' +
      '    box = cv2.boxPoints(rect).astype(np.int32)\n' +
      '    rw, rh = rect[1]\n' +
      '    if min(rw, rh) < 10: continue\n' +
      '    aspect = max(rw, rh) / (min(rw, rh) + 1e-6)\n' +
      '    if aspect > 3.0: continue\n\n' +
      '    cv2.drawContours(canvas, [box], 0, (0, 255, 0), 2)\n' +
      '    cx, cy = int(rect[0][0]), int(rect[0][1])\n' +
      '    angle = rect[2]\n' +
      '    cv2.putText(canvas, f"{rw:.0f}x{rh:.0f} {angle:.1f}deg",\n' +
      '                (cx - 30, cy), cv2.FONT_HERSHEY_SIMPLEX,\n' +
      '                0.4, (0, 0, 255), 1)\n' +
      '    rect_count += 1\n\n' +
      'print(f"检测到 {rect_count} 个矩形")\n' +
      'cv2.imshow("rectangles", canvas)\n' +
      'cv2.waitKey(0)'
  }
];