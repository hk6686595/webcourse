// OpenCV 教程 —— 第六部分：视频读写与综合实战
module.exports = [
  {
    id: 'opencv-videoio',
    title: '24. 视频读写：VideoCapture / VideoWriter / 摄像头',
    category: '视频与实战',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '把图像扩展到时间维度：用 VideoCapture 打开摄像头/视频文件，按帧处理，VideoWriter 写出。',
    detail: [
      'cv2.VideoCapture(index_or_filename)：index 是摄像头编号（0 是默认笔记本摄像头）或视频文件路径。打开失败 cap.isOpened() 返回 False。',
      'cap.read() 返回 (ret, frame)：ret 是 bool 是否成功读帧，frame 是 BGR numpy 数组。读完一帧后 ret=False 退出循环。',
      'cap.get(propId) / cap.set(propId, value)：读取/设置摄像头参数。常用属性：cv2.CAP_PROP_FRAME_WIDTH/HEIGHT、FPS、POS_FRAMES（当前帧号）、POS_MSEC（当前毫秒）。',
      'cv2.VideoWriter(filename, fourcc, fps, frameSize)：写出视频。fourcc 是 4 字节编解码码：MJPG（.avi）、XVID（.avi）、mp4v（.mp4，需四字符 ffdshow 等）、H264（部分平台可用）。',
      'VideoWriter 不指定大小写，size 要与 frame.shape[:2][::-1] 一致，否则写出来是空文件。',
      'FPS 来自视频源或摄像头（25/30/60）；写错 FPS 会让视频看起来"加速"或"卡顿"。',
      '实时视频循环结构：while True: ret, frame = cap.read(); if not ret: break; 处理 frame; cv2.imshow(...); if cv2.waitKey(delay) == 27: break',
      'waitKey 的 delay：1ms 是"尽可能快地刷新"；按 1000/fps 让显示与原视频同步。',
      '释放资源：cap.release()、out.release()、cv2.destroyAllWindows()。'
    ],
    notes: [
      'VideoCapture(0) 在 Linux/Win 都是默认摄像头；macOS 上系统授权后才可用。',
      'VideoWriter 的 fourcc 要用 cv2.VideoWriter_fourcc(\"M\", \"J\", \"P\", \"G\") 或整数 0x00000021。',
      'IP 摄像头：cap = cv2.VideoCapture("rtsp://...")，很多家用摄像机支持 RTSP，但解码稳定性差。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 1) 读摄像头 ==========\n' +
      'cap = cv2.VideoCapture(0)\n' +
      'cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)\n' +
      'cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)\n' +
      'if not cap.isOpened():\n' +
      '    raise RuntimeError("无法打开摄像头")\n\n' +
      'fps = cap.get(cv2.CAP_PROP_FPS) or 30.0\n' +
      'delay = int(1000 / fps)\n' +
      'while True:\n' +
      '    ret, frame = cap.read()\n' +
      '    if not ret: break\n' +
      '    # 在这里加你想要的处理\n' +
      '    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n' +
      '    cv2.imshow("cam gray", gray)\n' +
      '    if cv2.waitKey(delay) & 0xFF == 27: break   # ESC 退出\n' +
      'cap.release()\n' +
      'cv2.destroyAllWindows()\n\n' +
      '# ========== 2) 读视频文件并显示 FPS ==========\n' +
      'cap = cv2.VideoCapture("movie.mp4")\n' +
      'fps = cap.get(cv2.CAP_PROP_FPS)\n' +
      'total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))\n' +
      'print(f"视频 FPS={fps:.1f}, 总帧数={total}, 时长={total / fps:.1f}s")\n\n' +
      'cv2.namedWindow("video", cv2.WINDOW_NORMAL)\n' +
      'i = 0\n' +
      'while True:\n' +
      '    ret, frame = cap.read()\n' +
      '    if not ret: break\n' +
      '    cv2.putText(frame, f"frame {i}", (30, 40),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)\n' +
      '    cv2.imshow("video", frame)\n' +
      '    if cv2.waitKey(int(1000 / fps)) & 0xFF == 27: break\n' +
      '    i += 1\n' +
      'cap.release()\n' +
      'cv2.destroyAllWindows()\n\n' +
      '# ========== 3) 写视频：摄像头 + 写盘 ==========\n' +
      'cap = cv2.VideoCapture(0)\n' +
      'W   = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))\n' +
      'H   = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))\n' +
      'fps = cap.get(cv2.CAP_PROP_FPS) or 30.0\n\n' +
      'fourcc = cv2.VideoWriter_fourcc(*"MJPG")    # avi 兼容\n' +
      'out = cv2.VideoWriter("record.avi", fourcc, fps, (W, H))\n\n' +
      'while True:\n' +
      '    ret, frame = cap.read()\n' +
      '    if not ret: break\n' +
      '    out.write(frame)\n' +
      '    cv2.imshow("recording", frame)\n' +
      '    if cv2.waitKey(1) & 0xFF == 27: break\n' +
      'cap.release()\n' +
      'out.release()\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-practical-edge',
    title: '25. 实战：找一张纸的四个角（综合）',
    category: '视频与实战',
    version: 'OpenCV 4.x',
    level: '进阶',
    summary: '用 imread → 灰度 → 高斯 → Canny → 形态学 → findContours → approxPolyDP → 单应变换 走一遍经典流程。',
    detail: [
      '本节把前面学到的所有基础拼起来：读图 → 预处理 → 边缘 → 轮廓 → 多边形逼近 → 透视变换。这是 90% 视觉项目的"主脉络"。',
      '步骤拆解：① 灰度 + 高斯去噪；② Canny 边缘；③ 形态学闭运算连接边缘；④ findContours 找外轮廓；⑤ 选面积最大的，按面积/周长比例过滤；⑥ approxPolyDP 多边形逼近到 4 个点；⑦ order_points 排序 4 顶点（左上→右上→右下→左下）；⑧ getPerspectiveTransform + warpPerspective 输出正视图。',
      '常见坑：① 没去噪导致 Canny 满屏杂边；② 没有形态学闭运算，纸张边断裂；③ approxPolyDP eps 太大/太小都不收敛到 4 个点；④ 4 个顶点顺序错导致结果图扭曲。',
      '鲁棒性增强：① 多尺度检测（resize 后再找）；② 投票机制（多帧投票提高稳定性）；③ minAreaRect + 多边形逼近兜底。'
    ],
    notes: [
      '每张图片最好的参数都不一样：先调通一张，再用同样的流程处理批；表现不稳定的图片单独处理。',
      '生产环境可以用 ORB 特征 + matchShapes + 单应矩阵做"任意方向"识别；本节是入门版的"轴对齐 4 边形"识别。',
      '做实时视频流时：每 N 帧跑一次检测（降本），中间帧只做跟踪（KCF/CSRT/MOSSE）。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'def order_points(pts):\n' +
      '    rect = np.zeros((4, 2), dtype=np.float32)\n' +
      '    s = pts.sum(axis=1)\n' +
      '    rect[0] = pts[np.argmin(s)]\n' +
      '    rect[2] = pts[np.argmax(s)]\n' +
      '    d = np.diff(pts, axis=1).ravel()\n' +
      '    rect[1] = pts[np.argmin(d)]\n' +
      '    rect[3] = pts[np.argmax(d)]\n' +
      '    return rect\n\n' +
      'def find_doc_quad(image, min_area_ratio=0.2):\n' +
      '    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)\n' +
      '    gray = cv2.GaussianBlur(gray, (5, 5), 0)\n' +
      '    edges = cv2.Canny(gray, 75, 200)\n' +
      '    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8))\n' +
      '    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))\n' +
      '    cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL,\n' +
      '                                cv2.CHAIN_APPROX_SIMPLE)\n' +
      '    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)\n' +
      '    total = image.shape[0] * image.shape[1]\n' +
      '    for c in cnts:\n' +
      '        if cv2.contourArea(c) < total * min_area_ratio:\n' +
      '            continue\n' +
      '        peri = cv2.arcLength(c, True)\n' +
      '        approx = cv2.approxPolyDP(c, 0.02 * peri, True)\n' +
      '        if len(approx) == 4:\n' +
      '            return approx.reshape(4, 2).astype(np.float32)\n' +
      '    return None\n\n' +
      'def straighten(image, W=800, H=1000):\n' +
      '    quad = find_doc_quad(image)\n' +
      '    if quad is None:\n' +
      '        return None, None\n' +
      '    ordered = order_points(quad)\n' +
      '    dst = np.float32([[0, 0], [W, 0], [W, H], [0, H]])\n' +
      '    M = cv2.getPerspectiveTransform(ordered, dst)\n' +
      '    return cv2.warpPerspective(image, M, (W, H)), ordered\n\n' +
      '# ========== 用法 ==========\n' +
      'img = cv2.imread("tilted_doc.jpg")\n' +
      'result, quad = straighten(img, W=900, H=1200)\n' +
      'if result is None:\n' +
      '    print("未找到 4 边形")\n' +
      'else:\n' +
      '    # 把 4 个角画在原图上\n' +
      '    for i, (x, y) in enumerate(quad.astype(int)):\n' +
      '        cv2.circle(img, (x, y), 12, (0, 0, 255), -1)\n' +
      '        cv2.putText(img, str(i), (x + 15, y),\n' +
      '                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)\n' +
      '    cv2.imshow("detected quad", img)\n' +
      '    cv2.imshow("straightened", result)\n' +
      '    cv2.waitKey(0)'
  },
  {
    id: 'opencv-trackbar',
    title: '26. 交互调试：Trackbar 实时调参',
    category: '视频与实战',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'getTrackbarPos + createTrackbar 是 OpenCV 自带的 GUI 调参面板，调阈值/参数时特别方便。',
    detail: [
      'cv2.createTrackbar(name, winname, value, count, onChange)：value 是滑块初始值，count 是最大值，onChange 是回调函数（通常 noop）。',
      'cv2.getTrackbarPos(name, winname) 读取当前滑块值。',
      '常见模式：① 创建窗口；② 加多个滑块；③ while 循环里 getTrackbarPos + 处理 + imshow；④ ESC 退出。',
      '高频用法：① HSV 颜色阈值；② Canny 低高阈值；③ resize 缩放比例；④ 形态学 kernel size。',
      '复合显示：把原图 / 灰度 / mask / 边缘 / 形态学结果拼成大图，一个窗口看全部。',
      '没有 cv2 的 GUI 时（headless 服务器）：用 matplotlib 的 widgets（Slider）或 ipywidgets；本地脚本 + 远程机器调试可用。'
    ],
    notes: [
      'createTrackbar 必须存在一个同名 winname 的窗口，否则回调不触发。',
      '回调 onChange 里不要做重活；放主循环里做处理。',
      'Trackbar 数量不要太多（>10 个滚动起来很乱），可考虑分组。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'img = cv2.imread("params.jpg")\n' +
      'hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)\n' +
      'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n\n' +
      'def nothing(x): pass\n\n' +
      'cv2.namedWindow("track", cv2.WINDOW_NORMAL)\n' +
      '# HSV inRange 阈值\n' +
      'for n, v, mx in [\n' +
      '    ("H1", 0, 179), ("S1", 0, 255), ("V1", 0, 255),\n' +
      '    ("H2", 179, 179), ("S2", 255, 255), ("V2", 255, 255),\n' +
      ']:\n' +
      '    cv2.createTrackbar(n, "track", v, mx, nothing)\n' +
      '# Canny\n' +
      'cv2.createTrackbar("CannyL", "track", 50,  255, nothing)\n' +
      'cv2.createTrackbar("CannyH", "track", 150, 255, nothing)\n' +
      '# 形态学\n' +
      'cv2.createTrackbar("Kernel", "track", 3, 15, nothing)\n\n' +
      'while True:\n' +
      '    h1 = cv2.getTrackbarPos("H1", "track")\n' +
      '    s1 = cv2.getTrackbarPos("S1", "track")\n' +
      '    v1 = cv2.getTrackbarPos("V1", "track")\n' +
      '    h2 = max(h1 + 1, cv2.getTrackbarPos("H2", "track"))\n' +
      '    s2 = max(s1 + 1, cv2.getTrackbarPos("S2", "track"))\n' +
      '    v2 = max(v1 + 1, cv2.getTrackbarPos("V2", "track"))\n' +
      '\n' +
      '    cl = cv2.getTrackbarPos("CannyL", "track")\n' +
      '    ch = max(cl + 1, cv2.getTrackbarPos("CannyH", "track"))\n' +
      '    ks = max(1, cv2.getTrackbarPos("Kernel", "track") | 1)   # 奇数\n\n' +
      '    # HSV mask\n' +
      '    mask = cv2.inRange(hsv, (h1, s1, v1), (h2, s2, v2))\n' +
      '    # Canny\n' +
      '    edges = cv2.Canny(gray, cl, ch)\n' +
      '    # 形态学\n' +
      '    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ks, ks))\n' +
      '    mask_clean = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)\n\n' +
      '    # 拼图\n' +
      '    top = np.hstack([img, cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)])\n' +
      '    bot = np.hstack([cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR),\n' +
      '                     cv2.cvtColor(mask_clean, cv2.COLOR_GRAY2BGR)])\n' +
      '    canvas = np.vstack([top, bot])\n' +
      '    canvas = cv2.resize(canvas, (canvas.shape[1] // 2, canvas.shape[0] // 2))\n' +
      '    cv2.imshow("track", canvas)\n' +
      '    if cv2.waitKey(30) & 0xFF == 27: break\n\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-faq',
    title: '27. 常见报错与排查清单',
    category: '视频与实战',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '列出初学者最常踩的几个坑与对应的"5 分钟排查思路"。',
    detail: [
      'cv2.error: OpenCV(4.x.x) ... assert failed：函数内部断言失败，最常见是输入图像尺寸/通道/dtype 不对。先 print(img.shape, img.dtype) 确认输入。',
      '返回的图片颜色不对：matplotlib 显示彩色图记得 cv2.cvtColor(BGR2RGB)；cv2.imwrite 写入路径一定要有扩展名。',
      'imread 返回 None：路径错（中文、相对路径）、文件不存在、不支持的格式。用 os.path.exists + print 检查。',
      '摄像头打不开：① 系统授权（macOS）；② index 错（试试 1/2）；③ 设备被占用（关掉其他调用摄像头的程序，如 Zoom、浏览器视频会议）。',
      'VideoWriter 写出来是空文件 / 几 KB：① fourcc 不支持（换个 MJPG）；② size 与 frame shape 不一致；③ 没调用 release()；④ 目录无写权限。',
      'ORB / SIFT 找不到函数：SIFT/SURF 在 opencv-contrib-python 包，不在 opencv-python。pip install opencv-contrib-python。',
      'VideoCapture 卡住 / read() 返回 False：① 网络摄像头 RTSP 解码慢；② 编码 H264/H265 在 OpenCV 里不稳定，换 MJPG；③ URL 用了特殊认证。',
      '内存溢出（OOM）：高分辨率图（4K）+ 大卷积核；分块处理 cv2.resize 小一些。',
      'Jupyter 中 cv2.imshow 报错：Jupyter 没有桌面 GUI；用 matplotlib 显示，或在 Jupyter 里用 ipywidget + 图片流。',
      'headless 服务器：装 opencv-python-headless；显示图片保存成文件或返回 base64 给前端。'
    ],
    notes: [
      'OpenCV 的错误信息很详细，定位到文件 + 行号；阅读报错信息比"猜原因"高效得多。',
      '版本问题：opencv-python 4.8 要求 numpy>=1.21。如果 numpy 太老，装包时加 pip install "opencv-python<4.6"。',
      '官方文档：https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html 是入门的最佳伴侣；函数签名、参数解释、示例齐全。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import os\n' +
      'import traceback\n\n' +
      '# ========== 1) 安全的 imread 包装 ==========\n' +
      'def safe_imread(path, flag=cv2.IMREAD_COLOR):\n' +
      '    if not os.path.exists(path):\n' +
      '        raise FileNotFoundError(f"图片不存在：{path}")\n' +
      '    img = cv2.imdecode(np.fromfile(path, dtype=np.uint8), flag)\n' +
      '    if img is None:\n' +
      '        raise ValueError(f"无法解码（格式不支持）：{path}")\n' +
      '    return img\n\n' +
      'try:\n' +
      '    img = safe_imread("photo.jpg")\n' +
      'except Exception as e:\n' +
      '    print("读图失败:", e)\n\n' +
      '# ========== 2) 安全的 VideoCapture 包装 ==========\n' +
      'def open_video(source, retries=3):\n' +
      '    for i in range(retries):\n' +
      '        cap = cv2.VideoCapture(source)\n' +
      '        if cap.isOpened():\n' +
      '            ret, frame = cap.read()\n' +
      '            if ret:\n' +
      '                return cap\n' +
      '        cap.release()\n' +
      '        print(f"重试 {i+1}/{retries}...")\n' +
      '    raise RuntimeError(f"无法打开视频源：{source}")\n\n' +
      '# ========== 3) 摄像头多 index 试 ==========\n' +
      'def open_camera():\n' +
      '    for idx in [0, 1, 2, -1]:\n' +
      '        cap = cv2.VideoCapture(idx)\n' +
      '        if cap.isOpened():\n' +
      '            print(f"使用摄像头 index={idx}")\n' +
      '            return cap\n' +
      '        cap.release()\n' +
      '    raise RuntimeError("找不到可用摄像头")\n\n' +
      '# ========== 4) 调试 hook：把每一帧保存以便复盘 ==========\n' +
      'def debug_hook(frame, idx, out_dir="debug"):\n' +
      '    os.makedirs(out_dir, exist_ok=True)\n' +
      '    cv2.imwrite(f"{out_dir}/{idx:04d}.png", frame)\n\n' +
      '# ========== 5) 错误兜底：遇到异常继续运行 ==========\n' +
      'def process_one(frame):\n' +
      '    try:\n' +
      '        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n' +
      '        edges = cv2.Canny(gray, 50, 150)\n' +
      '        return edges\n' +
      '    except Exception:\n' +
      '        traceback.print_exc()\n' +
      '        return None\n\n' +
      'cap = open_video(0)\n' +
      'i = 0\n' +
      'while True:\n' +
      '    ret, frame = cap.read()\n' +
      '    if not ret: break\n' +
      '    out = process_one(frame)\n' +
      '    if out is not None:\n' +
      '        cv2.imshow("debug", out)\n' +
      '    if cv2.waitKey(1) & 0xFF == 27: break\n' +
      '    i += 1\n' +
      'cap.release()\n' +
      'cv2.destroyAllWindows()'
  },
  {
    id: 'opencv-next-step',
    title: '28. 学习路线与下一步',
    category: '视频与实战',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '学完基础后该往哪走：图像拼接、人脸识别、目标检测、深度学习、CUDA 加速。',
    detail: [
      '入门后最值得做的小项目：① 二维码/条形码检测（cv2.QRCodeDetector）；② 拼图游戏自动求解（matchTemplate + 拼接）；③ 简单车牌识别（颜色定位 + Tesseract OCR）。',
      '进阶方向：① 图像拼接（Stitcher / ORB + 单应）；② 视频稳像（cv2.estimateRigidTransform）；③ 行人检测（HOG + SVM 或深度学习 YOLO）。；④ 人脸检测（Haar cascade 或 DNN + 预训练 resnet-ssd）。',
      '深度学习模块 cv2.dnn：支持 ONNX、TensorFlow、Caffe 模型推理。常见用法：cv2.dnn.readNetFromONNX("model.onnx")、blobFromImage、net.forward() 拿到检测结果。',
      '性能优化：① 多线程读帧 + 处理（queue.Queue）；② GStreamer 后端：cv2.CAP_PROP_GSTREAMER；③ CUDA 后端：编译 opencv2gpu，调用 cv2.cuda 模块，把图像搬到 GPU。',
      '与第三方库的协作：① 与 numpy：原生兼容；② 与 PIL.Image：pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))；③ 与 matplotlib：plt.imshow 之前 BGR2RGB；④ 与 torch：torch.from_numpy(img.transpose(2,0,1)).float() / 255.0。',
      '学习资源：① 官方 Python 教程（docs.opencv.org）；② Adrian Rosebrock 的 PyImageSearch 博客（实战项目超多）；③ 《Learning OpenCV 4》by Kaehler & Bradski；④ 各种 Kaggle 入门 notebook。',
      '常见"我下一步应该学什么"清单：① C++ 接口（部署到嵌入式）；② GStreamer / FFmpeg 后端（视频流）；③ OpenCV.js（浏览器内运行）；④ opencv-contrib-python（SIFT/SURF/ArUco/Tracking）。'
    ],
    notes: [
      'OpenCV 不是"机器学习库"：它内置的 ML 模块（KNN、SVM、RTrees）只够教学用；生产环境直接用 sklearn / pytorch。',
      '做目标检测：先学 YOLOv8 的官方 Python 包（ultralytics），OpenCV 仅作数据预处理和可视化。',
      '调 CUDA 模块需要编译带 CUDA 的 OpenCV，二进制 wheel 一般不带；初次接触先用 OpenCV.js / Python CPU 版本。'
    ],
    example:
      '# ========== 1) QR / 条码检测（自带模块）==========\n' +
      'import cv2\n' +
      'img = cv2.imread("qr.png")\n' +
      'detector = cv2.QRCodeDetector()\n' +
      'data, bbox, _ = detector.detectAndDecode(img)\n' +
      'if data:\n' +
      '    print("QR 内容:", data)\n' +
      '    n = len(bbox[0])\n' +
      '    for i in range(n):\n' +
      '        p1 = tuple(bbox[0][i].astype(int))\n' +
      '        p2 = tuple(bbox[0][(i + 1) % n].astype(int))\n' +
      '        cv2.line(img, p1, p2, (0, 255, 0), 2)\n\n' +
      '# ========== 2) OpenCV DNN 跑 ONNX 模型 ==========\n' +
      '# net = cv2.dnn.readNetFromONNX("model.onnx")\n' +
      '# blob = cv2.dnn.blobFromImage(img, scalefactor=1/255.0,\n' +
      '#                                size=(224, 224), mean=(0.485, 0.456, 0.406),\n' +
      '#                                swapRB=True, crop=False)\n' +
      '# net.setInput(blob)\n' +
      '# out = net.forward()        # 形状按模型输出\n' +
      '# print("推理结果 shape:", out.shape)\n\n' +
      '# ========== 3) OpenCV 与 PyTorch 互转 ==========\n' +
      '# import torch\n' +
      '# tensor = torch.from_numpy(img.transpose(2, 0, 1)).float() / 255.0\n' +
      '# tensor = tensor.unsqueeze(0)        # (1, 3, H, W)\n' +
      '# with torch.no_grad():\n' +
      '#     y = model(tensor)               # 推理\n' +
      '# img_out = (y.squeeze(0).permute(1, 2, 0).numpy() * 255).astype(np.uint8)\n' +
      '# img_out = cv2.cvtColor(img_out, cv2.COLOR_RGB2BGR)\n\n' +
      '# ========== 4) 用 OpenCV Stitcher 做全景拼接 ==========\n' +
      'def stitch(images):\n' +
      '    stitcher = cv2.Stitcher_create()\n' +
      '    status, pano = stitcher.stitch(images)\n' +
      '    if status != cv2.Stitcher_OK:\n' +
      '        return None\n' +
      '    return pano\n\n' +
      '# pano = stitch([cv2.imread(f"view{i}.jpg") for i in range(1, 4)])\n' +
      '# if pano is not None:\n' +
      '#     cv2.imwrite("panorama.jpg", pano)\n\n' +
      'cv2.imshow("qr", img)\n' +
      'cv2.waitKey(0)'
  }
];