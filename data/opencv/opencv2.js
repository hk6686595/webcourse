// OpenCV 教程 —— 第二部分：图像基本变换（缩放、旋转、平移、仿射与透视）
module.exports = [
  {
    id: 'opencv-resize',
    title: '6. 缩放（resize）',
    category: '几何变换',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'cv2.resize 是最常用的图像变换函数，三个核心要素：目标尺寸、插值方法、缩放比例。',
    detail: [
      'cv2.resize(src, dsize, fx, fy, interpolation) 返回新尺寸的图像。原图不会被修改。',
      'dsize 是 (宽, 高) 元组，fx/fy 是相对原图的比例（与 dsize 互斥，两者给一即可）。',
      '插值方法 interpolation 决定缩放后的质量：① cv2.INTER_NEAREST（最近邻，最快最差）；② cv2.INTER_LINEAR（双线性，默认，适合放大）；③ cv2.INTER_CUBIC（双三次，更平滑，慢一些）；④ cv2.INTER_AREA（区域法，适合缩小）；⑤ cv2.INTER_LANCZOS4（Lanczos，质量最高，最慢）。',
      '经验法则：放大用 INTER_CUBIC 或 INTER_LINEAR；缩小用 INTER_AREA。INTER_LINEAR 是默认。',
      '保持宽高比的写法：把 dsize 设成 (目标宽, 自动高)：h, w = img.shape[:2]; new_w = 800; new_h = int(h * new_w / w); dst = cv2.resize(img, (new_w, new_h))。',
      '与深度学习配合：很多模型要求 224x224 或 256x256 输入，统一缩放即可。',
      '性能：缩放对大图开销不小，移动端可用 INTER_LINEAR + 缓存到本地磁盘。'
    ],
    notes: [
      'dsize 是 (宽, 高)，与 img.shape (高, 宽) 顺序相反。',
      '坐标变换之后图片大小变了，所有原本基于像素 (x, y) 的位置信息都要相应换算。',
      '插值会引入边界值；图像标注（mask、分割图）必须用 INTER_NEAREST，避免新像素值破坏标签。'
    ],
    example:
      'import cv2\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n' +
      'print("原图:", w, "x", h)\n\n' +
      '# ========== 1) 指定目标尺寸 ==========\n' +
      'dst1 = cv2.resize(img, (640, 480), interpolation=cv2.INTER_LINEAR)\n\n' +
      '# ========== 2) 按比例缩放 ==========\n' +
      'dst2 = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)\n' +
      'print("缩小 0.5x:", dst2.shape)\n\n' +
      '# ========== 3) 保持宽高比放大到宽 1024 ==========\n' +
      'target_w = 1024\n' +
      'scale = target_w / w\n' +
      'dst3 = cv2.resize(img, (target_w, int(h * scale)),\n' +
      '                 interpolation=cv2.INTER_CUBIC)\n\n' +
      '# ========== 4) 把图像缩成方形（如 224x224，深度学习输入）==========\n' +
      'dst4 = cv2.resize(img, (224, 224))\n\n' +
      '# ========== 5) 等比缩放到最长边 800（短边补黑边）==========\n' +
      'def resize_keep_ratio(img, max_side=800):\n' +
      '    h, w = img.shape[:2]\n' +
      '    scale = max_side / max(h, w)\n' +
      '    new = cv2.resize(img, (int(w * scale), int(h * scale)))\n' +
      '    canvas = np.zeros((max_side, max_side, 3), dtype=img.dtype)\n' +
      '    y0 = (max_side - new.shape[0]) // 2\n' +
      '    x0 = (max_side - new.shape[1]) // 2\n' +
      '    canvas[y0:y0 + new.shape[0], x0:x0 + new.shape[1]] = new\n' +
      '    return canvas\n\n' +
      'import numpy as np\n' +
      'square = resize_keep_ratio(img, 800)\n' +
      'cv2.imshow("square", square)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 用不同插值方法缩放到同一尺寸，对比质量 ==========\n' +
      'methods = [\n' +
      '    ("INTER_NEAREST", cv2.INTER_NEAREST),\n' +
      '    ("INTER_LINEAR",  cv2.INTER_LINEAR),\n' +
      '    ("INTER_CUBIC",   cv2.INTER_CUBIC),\n' +
      '    ("INTER_AREA",    cv2.INTER_AREA),\n' +
      ']\n\n' +
      'for name, flag in methods:\n' +
      '    small = cv2.resize(img, (w // 4, h // 4), interpolation=flag)\n' +
      '    restored = cv2.resize(small, (w, h), interpolation=flag)\n' +
      '    cv2.imshow(name, restored)\n' +
      'cv2.waitKey(0)\n' +
      'cv2.destroyAllWindows()',
    example3:
      'import cv2\n' +
      'import numpy as np\n' +
      'import glob\n\n' +
      '# ========== 批量缩放：把文件夹里所有图片统一成 640x480 ==========\n' +
      'TARGET_SIZE = (640, 480)\n' +
      'for path in glob.glob("images/*.jpg"):\n' +
      '    img = cv2.imread(path)\n' +
      '    resized = cv2.resize(img, TARGET_SIZE, interpolation=cv2.INTER_AREA)\n' +
      '    out_path = path.replace("images/", "resized/")\n' +
      '    cv2.imwrite(out_path, resized)\n\n' +
      '# ========== 等比缩放：短边缩到 256，长边自适应 ==========\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n' +
      'new_h, new_w = 256, int(256 * w / h) if h < w else (int(256 * h / w), 256)\n' +
      'new_h, new_w = (256, int(256 * w / h)) if h < w else (int(256 * h / w), 256)\n' +
      'result = cv2.resize(img, (new_w, new_h))\n' +
      'cv2.imshow("ratio 256", result)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-rotate',
    title: '7. 旋转（rotate / warpAffine）',
    category: '几何变换',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '90° 倍数旋转用 cv2.rotate 一行完成；任意角度旋转需要用 cv2.warpAffine + 旋转矩阵。',
    detail: [
      'cv2.rotate(img, code) 用于 90° 倍数旋转：cv2.ROTATE_90_CLOCKWISE（顺时针 90°）、ROTATE_180、ROTATE_90_COUNTERCLOCKWISE（逆时针 90°）。',
      '任意角度旋转：cv2.getRotationMatrix2D(center, angle, scale) → 旋转矩阵 M（2x3）；cv2.warpAffine(img, M, (W, H)) 输出。center 是旋转中心，angle 逆时针为正，scale 是缩放系数。',
      '旋转后图像四角会出现黑边，因为 warpAffine 默认 borderValue=0（黑色）。可以用 BORDER_CONSTANT + borderValue=(255,255,255) 改白边，或 BORDER_REFLECT 镜像补全。',
      '旋转矩阵的本质：M 把源图像的每个像素 (x, y) 映射到目标图像的 (x\', y\')；warpAffine 内插后得到结果图。',
      '例：逆时针 30°、中心 (W/2, H/2)、缩放 0.8。',
      '90° 倍数旋转是单纯坐标变换，无插值（速度极快）；任意角度必须用 warpAffine 双线性插值，质量略低。'
    ],
    notes: [
      'getRotationMatrix2D 的 angle 是"逆时针为正"，与数学坐标系一致，但和图像坐标系（y 朝下）直觉相反，调试时建议先画中心点验证。',
      'warpAffine 的 dsize 是 (宽, 高)，不是 (高, 宽)。',
      '旋转中心点要写"图像中心"而不是 (0,0)，否则结果会"飘"到画布外面。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n' +
      'cy, cx = h // 2, w // 2\n\n' +
      '# ========== 90° 倍数旋转 ==========\n' +
      'img_90_cw  = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)\n' +
      'img_90_ccw = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)\n' +
      'img_180    = cv2.rotate(img, cv2.ROTATE_180)\n\n' +
      '# ========== 任意角度旋转 ==========\n' +
      'M = cv2.getRotationMatrix2D(center=(cx, cy), angle=30, scale=1.0)\n' +
      'img_rot = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))\n\n' +
      '# ========== 旋转 + 缩放 ==========\n' +
      'M2 = cv2.getRotationMatrix2D((cx, cy), -15, 0.8)        # 顺时针 15°, 缩 0.8\n' +
      'img_rot2 = cv2.warpAffine(img, M2, (w, h))\n\n' +
      '# ========== 验证：把中心点画出来看是否真的绕中心转 ==========\n' +
      'cv2.circle(img, (cx, cy), 5, (0, 0, 255), -1)\n' +
      'cv2.imshow("original with center", img)\n' +
      'cv2.imshow("rotated 30 deg", img_rot)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 进阶：旋转但不裁掉（用大画布）==========\n' +
      'import math\n' +
      'angle = math.radians(30)\n' +
      'new_w = int(abs(w * math.cos(angle)) + abs(h * math.sin(angle)))\n' +
      'new_h = int(abs(w * math.sin(angle)) + abs(h * math.cos(angle)))\n' +
      'M3 = cv2.getRotationMatrix2D((cx, cy), 30, 1.0)\n' +
      'M3[0, 2] += (new_w - w) / 2\n' +
      'M3[1, 2] += (new_h - h) / 2\n' +
      'img_rot_full = cv2.warpAffine(img, M3, (new_w, new_h))',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 绕任意非中心点旋转 ==========\n' +
      '# 绕左上角 (100, 100) 逆时针 45°\n' +
      'M = cv2.getRotationMatrix2D((100, 100), 45, 1.0)\n' +
      'dst1 = cv2.warpAffine(img, M, (w * 2, h * 2),\n' +
      '                      borderValue=(200, 200, 200))\n' +
      'cv2.imshow("rotate around (100,100)", dst1)\n\n' +
      '# ========== 旋转后自动裁剪到有效区域 ==========\n' +
      'def rotate_and_crop(img, angle):\n' +
      '    h, w = img.shape[:2]\n' +
      '    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)\n' +
      '    cos = abs(M[0, 0]); sin = abs(M[0, 1])\n' +
      '    nw = int(h * sin + w * cos)\n' +
      '    nh = int(h * cos + w * sin)\n' +
      '    M[0, 2] += (nw - w) / 2\n' +
      '    M[1, 2] += (nh - h) / 2\n' +
      '    rotated = cv2.warpAffine(img, M, (nw, nh))\n' +
      '    # 裁回原图大小\n' +
      '    cx, cy = nw // 2, nh // 2\n' +
      '    return rotated[cy - h // 2:cy + h // 2,\n' +
      '                   cx - w // 2:cx + w // 2]\n\n' +
      'result = rotate_and_crop(img, 30)\n' +
      'cv2.imshow("rotated cropped", result)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 多角度旋转拼接：生成旋转九宫格预览 ==========\n' +
      'angles = range(0, 360, 45)          # 0, 45, 90, ... 315\n' +
      'thumb_h, thumb_w = h // 3, w // 3\n' +
      'canvas = np.zeros((thumb_h * 3, thumb_w * 3, 3), dtype=np.uint8)\n\n' +
      'for i, angle in enumerate(angles[:9]):\n' +
      '    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 0.3)\n' +
      '    thumb = cv2.warpAffine(img, M, (thumb_w, thumb_h),\n' +
      '                           borderValue=(50, 50, 50))\n' +
      '    r, c = divmod(i, 3)\n' +
      '    canvas[r * thumb_h:(r + 1) * thumb_h,\n' +
      '           c * thumb_w:(c + 1) * thumb_w] = thumb\n' +
      '    cv2.putText(thumb, str(angle), (10, 30),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)\n\n' +
      'cv2.imshow("rotation grid", canvas)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-translate',
    title: '8. 平移与镜像翻转（flip）',
    category: '几何变换',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '平移用 warpAffine + 2x3 矩阵，水平/垂直翻转用 cv2.flip 一行搞定。',
    detail: [
      'cv2.flip(img, flipCode)：flipCode=0 上下翻转；1 水平翻转；-1 同时上下+水平翻转（即 180°）。',
      '水平翻转常用于数据增强（左右对称目标，比如猫脸、车辆）；上下翻转适合卫星图、显微镜图。',
      '平移：构造 2x3 矩阵 [[1, 0, dx], [0, 1, dy]]，调用 warpAffine。dx>0 把图往右移，dy>0 往下移。',
      'warpAffine 默认 borderValue=0，超出原图区域填充黑色；如果想白底，加 borderValue=(255,255,255)；如果想复制边缘像素，用 BORDER_REPLICATE。',
      '平移会让原图"漂"出画布；解决办法是：① 把 dsize 加大；② 用 ROI 切到合适位置。'
    ],
    notes: [
      'flip 是真的镜像，不是 180° 旋转（虽然结果对单个对称图一样）。',
      'flip 是 in-place 友好版本：dst = cv2.flip(src, 1) 不会改 src，dst 是新数组。',
      '平移只能整型像素化（dx, dy 是 int）；如果要做亚像素平移，得用 warpAffine 配 float 矩阵 + LINEAR 插值。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 翻转 ==========\n' +
      'fliplr = cv2.flip(img, 1)         # 水平\n' +
      'flipud = cv2.flip(img, 0)         # 上下\n' +
      'flipboth = cv2.flip(img, -1)      # 上下+水平（=180°）\n\n' +
      '# ========== 平移 ==========\n' +
      'dx, dy = 50, 30                   # 右移 50，下移 30\n' +
      'M = np.float32([[1, 0, dx],\n' +
      '                [0, 1, dy]])\n' +
      'shifted = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))\n\n' +
      '# ========== 拼接展示 ==========\n' +
      'row = np.hstack([img, fliplr, shifted])\n' +
      'cv2.namedWindow("row", cv2.WINDOW_NORMAL)\n' +
      'cv2.imshow("row", row)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 随机平移 + 翻转（数据增强常用）==========\n' +
      'def random_translate_flip(img, max_shift=50):\n' +
      '    h, w = img.shape[:2]\n' +
      '    dx = np.random.randint(-max_shift, max_shift + 1)\n' +
      '    dy = np.random.randint(-max_shift, max_shift + 1)\n' +
      '    M = np.float32([[1, 0, dx], [0, 1, dy]])\n' +
      '    shifted = cv2.warpAffine(img, M, (w, h),\n' +
      '                             borderMode=cv2.BORDER_REFLECT)\n' +
      '    if np.random.rand() > 0.5:\n' +
      '        shifted = cv2.flip(shifted, 1)\n' +
      '    return shifted\n\n' +
      '# 生成 4 张增强样本\n' +
      'samples = [random_translate_flip(img) for _ in range(4)]\n' +
      'row = np.hstack(samples)\n' +
      'cv2.imshow("augmented", row)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 镜像铺贴：用平移+翻转生成无缝纹理 ==========\n' +
      '# 右翻再拼接，消除边缘接缝\n' +
      'right_half = cv2.flip(img[:, w // 2:], 1)    # 右半边水平翻转\n' +
      'left_half = cv2.flip(img[:, :w // 2], 1)     # 左半边水平翻转\n' +
      'tile_h = np.hstack([right_half, left_half])   # 水平镜像铺贴\n' +
      'tile_v = np.vstack([tile_h, cv2.flip(tile_h, 0)])  # 再垂直翻转\n' +
      'cv2.imshow("seamless tile", tile_v)\n\n' +
      '# ========== 环形平移：wrap-around 无黑边 ==========\n' +
      'M_right = np.float32([[1, 0, 100], [0, 1, 0]])\n' +
      'shifted = cv2.warpAffine(img, M_right, (w, h),\n' +
      '                         borderMode=cv2.BORDER_WRAP)\n' +
      'cv2.imshow("wrap shift", shifted)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-affine',
    title: '9. 仿射变换（warpAffine）：平移/旋转/缩放/剪切的统一',
    category: '几何变换',
    version: 'OpenCV 4.x',
    level: '进阶',
    summary: '仿射变换保持"平行线仍平行"，用 3 组对应点求矩阵 M，再 warpAffine 应用；图像配准与数据增强都用它。',
    detail: [
      '仿射变换是 2D 平面的一种线性变换：可以用 2x3 矩阵 M 表示，把源图的 (x, y) 映射到目标图 (x\', y\') = M · (x, y, 1)。',
      'cv2.getAffineTransform(src_pts, dst_pts) 通过 3 组对应点求 M（每组是 (x, y)）。',
      '典型用法：原图 3 个特征点（已知位置）→ 目标位置（希望的坐标）→ 求 M → warpAffine。常见场景：① 矫正倾斜文本；② 把任意四边形"压"成长方形；③ 数据增强里对图像做轻微拉伸。',
      '仿射变换保持：① 直线仍是直线；② 平行线仍平行；③ 比例关系不变）。不保持：长度、角度、面积（除非是等距变换）。',
      '与透视变换的区别：仿射变换保平行；透视变换允许透视形变（远的变小、产生灭点），适合"倾斜拍摄→正视图"。'
    ],
    notes: [
      'cv2.getAffineTransform 必须刚好 3 组对应点；点数错了会报错。',
      'src 和 dst 点的对应关系错了结果就是错的；调试时把对应点用 cv2.circle 标出来对照。',
      'warpAffine 接收 M 是 2x3 numpy 数组 (float32)，dtype 写错会抛异常或得到错误结果。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("doc.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# 源图 3 个点：左上、右上、左下\n' +
      'src = np.float32([[60, 80],\n' +
      '                  [w - 60, 100],                            [0, h - 30]])\n\n' +
      '# 目标位置：希望摆成正方形\n' +
      'dst = np.float32([[0, 0],\n' +
      '                  [w, 0],                                   [0, h]])\n\n' +
      'M = cv2.getAffineTransform(src, dst)\n' +
      'warped = cv2.warpAffine(img, M, (w, h))\n\n' +
      '# ========== 可视化：把对应点画出来 ==========\n' +
      'canvas = img.copy()\n' +
      'for p in src.astype(int):\n' +
      '    cv2.circle(canvas, tuple(p), 10, (0, 0, 255), -1)\n' +
      'cv2.imshow("src with points", canvas)\n' +
      'cv2.imshow("warped", warped)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 进阶：绕任意点旋转 + 平移（用 affine）==========\n' +
      '# 旋转中心 (cx, cy)，顺时针 20°，再整体右移 100\n' +
      'cx, cy = w // 2, h // 2\n' +
      'theta = np.deg2rad(20)\n' +
      'c, s = np.cos(theta), np.sin(theta)\n' +
      'M2 = np.float32([[c, -s, (1 - c) * cx + s * cy + 100],\n' +
      '                 [s,  c, (1 - c) * cy - s * cx]])\n' +
      'result = cv2.warpAffine(img, M2, (w + 100, h + 100))\n' +
      'cv2.imshow("rotated around center", result)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("text_skew.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 矫正倾斜文本（手动指定 3 点）==========\n' +
      '# 原图中倾斜文本的 3 个角点\n' +
      'src_pts = np.float32([[50, 100],\n' +
      '                      [w - 80, 120],\n' +
      '                      [60, h - 50]])\n' +
      '# 矫正后希望变成水平矩形的 3 个角点\n' +
      'dst_pts = np.float32([[0, 0],\n' +
      '                      [w - 130, 0],\n' +
      '                      [0, h - 50]])\n\n' +
      'M = cv2.getAffineTransform(src_pts, dst_pts)\n' +
      'corrected = cv2.warpAffine(img, M, (w, h))\n' +
      'cv2.imshow("original skew", img)\n' +
      'cv2.imshow("corrected", corrected)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("doc.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 仿射：剪切 + 透视模拟效果 ==========\n' +
      '# 水平剪切（shear）：保持高度不变，列偏移随行线性增长\n' +
      'shear_x = 0.3\n' +
      'M_shear = np.float32([[1, shear_x, 0],\n' +
      '                      [0, 1,       0]])\n' +
      'sheared = cv2.warpAffine(img, M_shear,\n' +
      '                         (int(w + abs(shear_x) * h), h))\n\n' +
      '# 对比：缩放 + 平移的组合\n' +
      'M_scale = np.float32([[0.8, 0, 50],\n' +
      '                      [0,   0.8, 30]])\n' +
      'scaled = cv2.warpAffine(img, M_scale, (w, h))\n\n' +
      'cv2.imshow("shear", sheared)\n' +
      'cv2.imshow("scale+translate", scaled)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-perspective',
    title: '10. 透视变换（warpPerspective）：把倾斜拍的照片变成正视图',
    category: '几何变换',
    version: 'OpenCV 4.x',
    level: '进阶',
    summary: '透视变换能用 4 组对应点求 3x3 单应矩阵，把倾斜拍摄的文档/标定板矫正成"正视"。',
    detail: [
      '透视变换（Perspective / Homography）允许把任意四边形映射到任意四边形，是 2D 平面里最一般的"保持共线性"变换。',
      'cv2.getPerspectiveTransform(src_quad, dst_quad) 通过 4 组对应点求 3x3 单应矩阵 H；cv2.warpPerspective(img, H, (W, H)) 应用变换。',
      '典型场景：① 手机拍的倾斜文档 → 正视矩形；② 棋盘格/标定板拍摄图 → 矫正图；③ 车道线、俯视视角变换（鸟瞰 BEV）。',
      '透视变换不保持平行线（远的变小），与仿射变换的区别就在这里。',
      '求 H 需要 4 组点（8 个方程），少于 4 组欠定，多了用 findHomography + RANSAC 自动剔除外点。',
      '矫正文本/文档的典型流程：① 读图；② 转灰度；③ 边缘检测（Canny）或阈值分割；④ findContours 找最大四边形；⑤ approxPolyDP 多边形逼近；⑥ 排序四个顶点（左上、右上、右下、左下）；⑦ getPerspectiveTransform 求 H；⑧ warpPerspective 输出正矩形。'
    ],
    notes: [
      'src 和 dst 的 4 个点顺序要对应，错位会让图像"扭曲"到无法识别。',
      '透视变换结果图常常比原图大或形状不同，要根据目标尺寸决定 dsize。',
      '棋盘格标定（calibrateCamera）背后就是大量 warpPerspective + 最小二乘优化。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("tilted_doc.jpg")\n' +
      'h, w = img.shape[:2]\n' +
      'print("原图:", w, "x", h)\n\n' +
      '# 假设我们已经通过轮廓检测得到原图 4 个顶点：\n' +
      '# 左上、右上、右下、左下（这里手动模拟）\n' +
      'src = np.float32([[120, 80],\n' +
      '                  [w - 90, 140],\n' +
      '                  [w - 60, h - 60],\n' +
      '                  [90,        h - 30]])\n\n' +
      '# 目标：把它矫正成 W x H 的"正视"图\n' +
      'W, H = 800, 1000\n' +
      'dst = np.float32([[0, 0],\n' +
      '                  [W, 0],\n' +
      '                  [W, H],\n' +
      '                  [0, H]])\n\n' +
      'H_mat = cv2.getPerspectiveTransform(src, dst)\n' +
      'doc = cv2.warpPerspective(img, H_mat, (W, H))\n\n' +
      '# ========== 自动找 4 个角点（findContours 进阶用法）==========\n' +
      'def find_document_quad(image):\n' +
      '    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)\n' +
      '    gray = cv2.GaussianBlur(gray, (5, 5), 0)\n' +
      '    edges = cv2.Canny(gray, 75, 200)\n' +
      '    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8))\n' +
      '    cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      '    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)\n' +
      '    for c in cnts:\n' +
      '        peri = cv2.arcLength(c, True)\n' +
      '        approx = cv2.approxPolyDP(c, 0.02 * peri, True)\n' +
      '        if len(approx) == 4:\n' +
      '            return approx.reshape(4, 2).astype(np.float32)\n' +
      '    return None\n\n' +
      'quad = find_document_quad(img)\n' +
      'if quad is not None:\n' +
      '    H2 = cv2.getPerspectiveTransform(quad, dst)\n' +
      '    doc2 = cv2.warpPerspective(img, H2, (W, H))\n' +
      '    cv2.imshow("auto doc", doc2)\n' +
      'else:\n' +
      '    print("未找到文档四边形，保留手动结果")\n' +
      '    cv2.imshow("manual doc", doc)\n' +
      'cv2.waitKey(0)',
    example2:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("road.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 鸟瞰视角变换（BEV）：车道线检测常用 ==========\n' +
      '# 原图中车道的 4 个点（近处宽、远处窄）\n' +
      'src = np.float32([[200, h],\n' +
      '                  [w - 200, h],\n' +
      '                  [w - 50, h // 2],\n' +
      '                  [50, h // 2]])\n\n' +
      '# 鸟瞰图目标：平行矩形\n' +
      'W, H = 400, 600\n' +
      'dst = np.float32([[0, H],\n' +
      '                  [W, H],\n' +
      '                  [W, 0],\n' +
      '                  [0, 0]])\n\n' +
      'M = cv2.getPerspectiveTransform(src, dst)\n' +
      'bev = cv2.warpPerspective(img, M, (W, H))\n' +
      'cv2.imshow("bird eye view", bev)\n' +
      'cv2.waitKey(0)',
    example3:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("photo.jpg")\n' +
      'h, w = img.shape[:2]\n\n' +
      '# ========== 透视变换 + 逆变换：验证单应矩阵 ==========\n' +
      'src = np.float32([[50, 50],\n' +
      '                  [w - 50, 80],\n' +
      '                  [w - 30, h - 30],\n' +
      '                  [40, h - 50]])\n' +
      'dst = np.float32([[0, 0],\n' +
      '                  [w, 0],\n' +
      '                  [w, h],\n' +
      '                  [0, h]])\n\n' +
      'H = cv2.getPerspectiveTransform(src, dst)\n' +
      'H_inv = cv2.getPerspectiveTransform(dst, src)  # 逆变换\n\n' +
      'warped = cv2.warpPerspective(img, H, (w, h))\n' +
      'restored = cv2.warpPerspective(warped, H_inv, (w, h))\n\n' +
      '# 对比原图和还原图的差异\n' +
      'diff = cv2.absdiff(img, restored)\n' +
      'print("reconstruction MSE:", np.mean(diff ** 2))\n' +
      'cv2.imshow("original", img)\n' +
      'cv2.imshow("warped", warped)\n' +
      'cv2.imshow("restored", restored)\n' +
      'cv2.imshow("diff", diff * 5)\n' +
      'cv2.waitKey(0)'
  }
];