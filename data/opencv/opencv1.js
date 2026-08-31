// OpenCV 教程 —— 第一部分：环境搭建与图像读取
module.exports = [
  {
    id: 'opencv-intro',
    title: '1. OpenCV 是什么与版本选择',
    category: '入门与安装',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'OpenCV 是开源的计算机视觉与图像处理库，提供 2500+ 算法，从图像读取到深度学习推理都有官方实现。',
    detail: [
      'OpenCV（Open Source Computer Vision Library）由 Intel 于 1999 年发起，现在是跨平台的开源计算机视觉库，提供 C++、Python、Java 三种主流语言绑定，社区还有 Go、Rust、JS 等非官方绑定。',
      '版本脉络：OpenCV 2.x 是经典的 C 接口与旧 Python API；3.x 重写了 Python binding（约 2015 年），改用 cv2 这一命名空间；4.x（2018 年起）持续主推，加入 DNN 模块对 ONNX/TensorFlow 模型推理的官方支持，并移除大量陈年遗留 API。',
      '面向刚入门：学 OpenCV 4.x 即可，绝大多数教程、博客、StackOverflow 答案默认 cv2。OpenCV 5.x 已发布，但生态仍在过渡，部分教学资源未及时跟进，建议以 4.10.x LTS 作为首选。',
      '本教程面向 Python 用户，使用官方包 opencv-python（或含 contrib 模块的 opencv-contrib-python）。示例代码以 4.8+ 为基准，几乎所有写法都向下兼容到 4.0。',
      'OpenCV 的"模块"组织：core（Mat、基础结构）、imgproc（图像处理）、imgcodecs（读写）、highgui（窗口）、videoio（摄像头）、features2d（特征）、calib3d（相机标定）、dnn（深度学习）、ml（机器学习）等。本教程覆盖前六个最常用的模块。'
    ],
    notes: [
      'OpenCV 仓库名是 opencv/，Python 包名是 opencv-python 与 opencv-contrib-python（后者含 SIFT、Surf、ORB 等专利算法）。',
      '别混淆 cv（老的 C 接口，已废弃）和 cv2（Python 唯一推荐命名空间）。即使包名是 cv2，所有函数都从 cv2 调用。',
      'OpenCV 默认 numpy 数组作为图像容器，几乎所有图像运算都基于 numpy，速度快、API 简洁。'
    ],
    example:
      '# 查看版本与构建信息\n' +
      'import cv2\n' +
      'print(cv2.__version__)            # 4.10.0\n' +
      'print(cv2.getbuildinformation())   # 完整构建信息（含 CUDA、OpenCL、IPP 等）\n\n' +
      '# 一个最小可运行：读图、显示、保存\n' +
      'import cv2\n' +
      'img = cv2.imread("lena.jpg")           # BGR 彩色图\n' +
      'cv2.imshow("window", img)              # 弹窗显示\n' +
      'cv2.waitKey(0)                         # 等待按键\n' +
      'cv2.imwrite("out.png", img)            # 保存为 PNG\n\n' +
      '# 一切像素都可以用 numpy 操作：翻转图像只要一行\n' +
      'import numpy as np\n' +
      'flipped = np.flip(img, axis=1)         # 水平翻转\n' +
      'cv2.imshow("flipped", flipped)\n' +
      'cv2.waitKey(0)'
  },
  {
    id: 'opencv-install',
    title: '2. Python 环境与安装（pip / conda）',
    category: '入门与安装',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '用 pip 或 conda 一行安装 OpenCV，注意区分 opencv-python 与 opencv-contrib-python 两个包。',
    detail: [
      'pip 安装（最常用）：pip install opencv-python 装的是主模块（不含 SIFT/SURF/ORB 等专利算法）；pip install opencv-contrib-python 加上 SIFT、xfeatures2d、bioinspired 等 contrib 模块。两者互斥安装，不要都装。',
      '清华源加速：pip install -i https://pypi.tuna.tsinghua.edu.cn/simple opencv-python。conda 用户用 conda install -c conda-forge opencv，会自动解决 numpy 等依赖。',
      'Conda 用户的注意：conda 装的是更稳定的二进制发行版，OpenCV 默认不启用 CUDA（非商用）。要做 GPU 推理需要 conda install -c conda-forge opencv 配合手动编译，或用 conda install -c conda-forge cudatoolkit 配合 PyTorch。',
      '版本兼容：opencv-python 4.8+ 要求 numpy>=1.21、python>=3.8；如果你的项目用 numpy 1.19 / python 3.7，请装老版本 pip install "opencv-python<4.6"。',
      '验证安装：python -c "import cv2; print(cv2.__version__)"。如果报错 DLL load failed，多半是 numpy 版本不匹配；重新 pip install numpy opencv-python 即可。',
      '虚拟环境建议：每个项目独立 venv（python -m venv .venv），避免全局 numpy/cv2 与项目依赖冲突。VSCode / PyCharm 都能直接选择 venv 解释器。'
    ],
    notes: [
      'opencv-python 与 opencv-python-headless：headless 版本不依赖 GUI 库（libgtk 等），Docker、远程服务器、CI 用它更省事。本地开发两个都行。',
      'Apple Silicon（M1/M2/M3）：pip 直接装的 wheel 已支持 arm64，不需要手动编译。',
      'Windows 上若出现 "ImportError: DLL load failed"：安装 Microsoft Visual C++ Redistributable，或直接用 conda-forge 的 opencv。'
    ],
    example:
      '# ========== 标准 pip 安装（本地开发）==========\n' +
      'python -m venv .venv\n' +
      'source .venv/bin/activate      # Windows: .venv\\Scripts\\activate\n' +
      'pip install --upgrade pip\n' +
      'pip install opencv-python numpy matplotlib\n\n' +
      '# ========== pip 安装（服务器 / Docker）==========\n' +
      'pip install opencv-python-headless numpy\n\n' +
      '# ========== 需要 SIFT/SURF 等专利算法 ==========\n' +
      'pip install opencv-contrib-python\n\n' +
      '# ========== conda 安装 ==========\n' +
      'conda create -n cv python=3.11 -y\n' +
      'conda activate cv\n' +
      'conda install -c conda-forge opencv numpy matplotlib jupyter\n\n' +
      '# ========== 验证安装 ==========\n' +
      'python << "EOF"\n' +
      'import cv2, numpy as np, sys\n' +
      'print("Python:", sys.version)\n' +
      'print("OpenCV:", cv2.__version__)\n' +
      'print("NumPy:  ", np.__version__)\n' +
      'img = cv2.imread(cv2.samples.findFile("lena.jpg"))\n' +
      'if img is None:\n' +
      '    # 官方样例不存在就自己造一张测试图\n' +
      '    img = np.zeros((240, 320, 3), dtype=np.uint8)\n' +
      '    img[:] = (255, 100, 50)\n' +
      '    cv2.putText(img, "OpenCV OK", (40, 140),\n' +
      '                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)\n' +
      'cv2.namedWindow("test", cv2.WINDOW_NORMAL)\n' +
      'cv2.imshow("test", img)\n' +
      'cv2.waitKey(1000)\n' +
      'cv2.destroyAllWindows()\n' +
      'EOF'
  },
  {
    id: 'opencv-image-basic',
    title: '3. 图像的表示：Mat、numpy 与通道顺序',
    category: '入门与安装',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'OpenCV 用 numpy.ndarray 表示图像，通道顺序 BGR 而非 RGB——这是初学者最容易踩的第一个坑。',
    detail: [
      '图像在 OpenCV 中就是一个三维 numpy 数组，shape 为 (H, W, C)：H 是行数（高）、W 是列数（宽）、C 是通道数（彩色 3，灰度 1，RGBA 4）。dtype 通常是 uint8（0~255）。',
      '通道顺序是 BGR（蓝-绿-红），与 matplotlib 的 RGB、PNG 文件的 RGBA 顺序都不同。直接用 matplotlib 显示 OpenCV 读出的彩色图，颜色会"诡异"——因为红蓝对调了。',
      'BGR 是历史包袱：早期 OpenCV 内部用 BGR（字节序与某种硬件格式匹配），生态已经定型。掌握这一点后，所有 imread、imwrite、cvtColor 的颜色顺序都要心里有数。',
      '基本属性：img.shape 看尺寸；img.dtype 看类型；img.size 是总像素数；img.ndim 是维数（2=灰度图，3=彩色图）。',
      '用 numpy 访问像素：img[y, x] 取单个像素（BGR 三个值）；img[y, x, 0] 取 B 通道某个值；img[:, :, ::-1] 把通道反过来（BGR→RGB）。',
      '灰度图 shape 是 (H, W)，可以 img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) 或读取时直接 grayscale=cv2.IMREAD_GRAYSCALE。',
      'ROI（感兴趣区域）就是 numpy 切片：cat = img[10:210, 50:280]。所有 numpy 操作（翻转、阈值、运算）都直接作用于 ROI。'
    ],
    notes: [
      '彩色图像的"宽"在第二维 shape[1]，不是第三维。img.shape 是 (高, 宽, 通道)，跟坐标 (y, x) 一致。',
      'matplotlib 显示彩色 OpenCV 图必须先 cv2.cvtColor(img, cv2.COLOR_BGR2RGB)，否则红蓝颠倒。',
      'cv2.imwrite 保存路径必须有写入权限；返回 True/False 表示成功与否，常见错误是没扩展名（默认按 .png 处理）。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n' +
      'import matplotlib.pyplot as plt\n\n' +
      'img = cv2.imread("lena.jpg")            # BGR 彩色\n' +
      'print("形状:", img.shape)                # (512, 512, 3)\n' +
      'print("类型:", img.dtype)                # uint8\n' +
      'print("像素[0,0] =", img[0, 0])          # [B, G, R]\n' +
      'print("蓝色通道[0,0] =", img[0, 0, 0])   # B\n\n' +
      '# ========== 显示：cv2 自己的窗口 vs matplotlib ==========\n' +
      '# 方式 1：OpenCV 窗口（注意颜色正常，BGR 直接显示）\n' +
      'cv2.namedWindow("img", cv2.WINDOW_NORMAL)\n' +
      'cv2.imshow("img", img)\n' +
      'cv2.waitKey(0)\n\n' +
      '# 方式 2：matplotlib 窗口（必须 BGR → RGB）\n' +
      'rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)\n' +
      'plt.imshow(rgb)\n' +
      'plt.title("Lena (BGR -> RGB)")\n' +
      'plt.axis("off")\n' +
      'plt.show()\n\n' +
      '# ========== 单像素 / 区域访问 ==========\n' +
      'px = img[100, 200]                      # 一个像素（BGR）\n' +
      'img[100, 200] = (0, 0, 255)             # 把这个像素改成纯红（BGR）\n' +
      'roi = img[10:210, 50:280]               # 切一块 ROI\n' +
      'cv2.rectangle(img, (50, 10), (280, 210), (0, 255, 0), 2)\n\n' +
      '# ========== 通道分离与合并 ==========\n' +
      'b, g, r = cv2.split(img)                # 拆成 3 个 (H, W) 数组\n' +
      'merged = cv2.merge([b, g, r])           # 合并回来\n' +
      '# 单独显示红色通道（matplotlib 期望 2D 单通道）\n' +
      'plt.imshow(r, cmap="gray")\n' +
      'plt.title("R channel")\n' +
      'plt.show()'
  },
  {
    id: 'opencv-imread',
    title: '4. 图像读取与保存：imread / imwrite / 常用 flag',
    category: '入门与安装',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: 'imread 的 flag 决定输出是灰度还是彩色，imwrite 控制压缩质量；理解 flag 能省掉大半不必要的转灰度运算。',
    detail: [
      'cv2.imread(path, flag) 返回 numpy 数组；path 不存在或解码失败返回 None（不会抛异常），所以读图后必须 assert img is not None。',
      'flag 取值：cv2.IMREAD_COLOR（默认，1）：BGR 彩色；cv2.IMREAD_GRAYSCALE（0）：单通道灰度图；cv2.IMREAD_UNCHANGED（-1）：保留原始通道（PNG 含 alpha 时是 BGRA 4 通道）。',
      '编码支持的常见格式：JPEG / JPG（有损）、PNG（无损 + alpha）、BMP、WebP、TIFF。OpenCV 不直接支持 GIF 动画，只能读第一帧。',
      'cv2.imwrite(path, img, params) 第二个参数是 numpy 数组，可选第三个是编码参数列表，例如 [cv2.IMWRITE_JPEG_QUALITY, 95] 控制 JPEG 质量（0~100），[cv2.IMWRITE_PNG_COMPRESSION, 3] 控制 PNG 压缩等级（0~9）。',
      '中文路径问题：OpenCV 内部用 C++ 的 imread，路径里有中文或特殊字符会失败。规避办法是用 numpy.fromfile + cv2.imdecode（先读字节再用 OpenCV 解码）：img = cv2.imdecode(np.fromfile("图片.jpg", dtype=np.uint8), cv2.IMREAD_COLOR)。',
      '字节流读写：cv2.imencode(".jpg", img, params) 返回 (ret, buf)，buf 是 numpy 数组，配合 numpy.tofile / cv2.imdecode 可在内存里做图像编码（HTTP 接口、消息队列、缓存）。',
      'HTTP 场景示例：requests 拿到图片二进制 → numpy.frombuffer → cv2.imdecode 直接进 OpenCV 流程，无需写临时文件。'
    ],
    notes: [
      'cv2.imread 不会抛异常读不到的文件，永远先 assert img is not None。',
      'cv2.imwrite 返回 False 通常是路径无写入权限、目录不存在、或 imencode 参数错。',
      'JPEG 是有损的，反复保存会损失质量；中间过程用 PNG 或 BMP。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      '# ========== 三种读取 flag ==========\n' +
      'color   = cv2.imread("photo.jpg", cv2.IMREAD_COLOR)     # (H, W, 3) BGR\n' +
      'gray    = cv2.imread("photo.jpg", cv2.IMREAD_GRAYSCALE) # (H, W)\n' +
      'raw     = cv2.imread("photo.png", cv2.IMREAD_UNCHANGED) # (H, W, 4) BGRA\n\n' +
      'assert color is not None, "读取失败，请检查路径"\n' +
      'print("彩色:", color.shape, color.dtype)\n' +
      'print("灰度:", gray.shape, gray.dtype)\n' +
      'print("含透明:", raw.shape, raw.dtype)\n\n' +
      '# ========== 控制保存质量 ==========\n' +
      'cv2.imwrite("out95.jpg", color, [cv2.IMWRITE_JPEG_QUALITY, 95])   # 高质量\n' +
      'cv2.imwrite("out30.jpg", color, [cv2.IMWRITE_JPEG_QUALITY, 30])   # 压缩率大\n' +
      'cv2.imwrite("out.png", color, [cv2.IMWRITE_PNG_COMPRESSION, 3])   # PNG 压缩\n\n' +
      '# ========== 中文路径 ==========\n' +
      'def imread_unicode(path, flag=cv2.IMREAD_COLOR):\n' +
      '    data = np.fromfile(path, dtype=np.uint8)\n' +
      '    return cv2.imdecode(data, flag)\n\n' +
      'def imwrite_unicode(path, img, ext=".png"):\n' +
      '    ok, buf = cv2.imencode(ext, img)\n' +
      '    if not ok: return False\n' +
      '    buf.tofile(path)\n' +
      '    return True\n\n' +
      'img = imread_unicode("图片/lena.jpg")\n' +
      'imwrite_unicode("图片/out.png", img)\n\n' +
      '# ========== HTTP 下载后直接处理 ==========\n' +
      'import urllib.request, cv2, numpy as np\n' +
      'resp = urllib.request.urlopen("https://example.com/cat.jpg")\n' +
      'buf  = np.frombuffer(resp.read(), dtype=np.uint8)\n' +
      'net_img = cv2.imdecode(buf, cv2.IMREAD_COLOR)'
  },
  {
    id: 'opencv-draw',
    title: '5. 几何绘制：line / rectangle / circle / putText',
    category: '入门与安装',
    version: 'OpenCV 4.x',
    level: '入门',
    summary: '在图像上画线、矩形、圆和文字是标注与调试的基本功，所有绘制函数都直接修改原图（in-place）。',
    detail: [
      '所有 cv2 绘制函数签名大致一致：cv2.<形状>(img, pt1, pt2, color, thickness, lineType, shift)。color 是 BGR 元组，如 (0, 255, 0) 是纯绿；thickness=-1 表示填充；lineType=cv2.LINE_AA 是抗锯齿。',
      'cv2.line(img, (x0, y0), (x1, y1), (B, G, R), 2)：画直线。坐标 (x, y) 对应 numpy 的 [y, x]。',
      'cv2.rectangle(img, (x0, y0), (x1, y1), color, thickness)：矩形，前两个点是对角顶点（可以是左上+右下，也可以是任意对角）。thickness=-1 填充。',
      'cv2.circle(img, (cx, cy), radius, color, thickness)：圆，radius 是整数半径。',
      'cv2.ellipse(img, (cx, cy), (a, b), angle, 0, 360, color, t)：椭圆，angle 是旋转角，0~360 是完整闭合。',
      'cv2.putText(img, text, (x, y), font, fontScale, color, thickness, lineType)：在 (x, y) 左下角画文字。font 取 FONT_HERSHEY_SIMPLEX / PLAIN / DUPLEX 等；fontScale 是放大倍数。',
      '中文字符：OpenCV 自带的 Hershey 字体不含中文。要画中文需用 PIL（Pillow）画好再转回 OpenCV（BGR），或用 cv2 + FreeType 的扩展库。',
      '绘制都是 in-place：函数直接改传入的数组，不返回值。如果想保留原图，先 img.copy()。'
    ],
    notes: [
      '坐标 (x, y) 与 numpy 索引 [y, x] 顺序相反，写代码时容易混。',
      '画半透明：cv2.addWeighted 把图形层与原图按权重混合，模拟 alpha。',
      '画中文：常用方法是用 PIL.ImageDraw 绘制，再 cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR) 转回。'
    ],
    example:
      'import cv2\n' +
      'import numpy as np\n\n' +
      'canvas = np.zeros((400, 600, 3), dtype=np.uint8)   # 黑底\n' +
      'canvas[:] = (40, 30, 20)                            # 深灰蓝\n\n' +
      '# 1) 直线\n' +
      'cv2.line(canvas, (50, 50), (550, 50), (0, 255, 0), 2, cv2.LINE_AA)\n\n' +
      '# 2) 矩形（空心 + 填充各一个）\n' +
      'cv2.rectangle(canvas, (50, 100), (300, 250), (255, 0, 0), 2)\n' +
      'cv2.rectangle(canvas, (320, 100), (550, 250), (0, 200, 255), -1)  # 填充\n\n' +
      '# 3) 圆 + 椭圆\n' +
      'cv2.circle(canvas, (150, 330), 50, (0, 255, 255), 3)\n' +
      'cv2.ellipse(canvas, (450, 330), (80, 40), 30, 0, 360, (200, 100, 255), 2)\n\n' +
      '# 4) 文字（英文 OK，中文需 Pillow）\n' +
      'cv2.putText(canvas, "OpenCV Drawing", (50, 380),\n' +
      '            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2, cv2.LINE_AA)\n\n' +
      'cv2.imshow("canvas", canvas)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 进阶：半透明矩形 ==========\n' +
      'overlay = canvas.copy()\n' +
      'cv2.rectangle(overlay, (100, 80), (500, 320), (0, 165, 255), -1)\n' +
      'alpha = 0.4\n' +
      'cv2.addWeighted(overlay, alpha, canvas, 1 - alpha, 0, dst=canvas)\n' +
      'cv2.imshow("overlay", canvas)\n' +
      'cv2.waitKey(0)\n\n' +
      '# ========== 进阶：用 PIL 画中文 ==========\n' +
      'from PIL import Image, ImageDraw, ImageFont\n' +
      'pil_img = Image.fromarray(cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB))\n' +
      'draw = ImageDraw.Draw(pil_img)\n' +
      'font = ImageFont.truetype("msyh.ttc", 28)   # 微软雅黑，需文件存在\n' +
      'draw.text((50, 30), "中文标注 OpenCV 教程", fill=(255, 255, 0), font=font)\n' +
      'canvas = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)\n' +
      'cv2.imshow("chinese", canvas)\n' +
      'cv2.waitKey(0)'
  }
];