// 游戏开发技术 1–5：核心概念
const gd1 = {
  id: 'gd-overview',
  title: '1. 游戏开发概览与引擎选择',
  category: '入门',
  version: '综合',
  level: '入门',
  summary: '游戏开发全流程、主流引擎对比、编程语言与如何选型入门。',
  detail: [
    '游戏开发=用程序实时渲染画面并响应用户交互。核心三要素：游戏循环、状态(数据)、渲染/音频/物理等子系统。',
    '主流引擎：Unity(C#)、虚幻 Unreal(C++)、Godot(GDScript/C#)、自研(图形/引擎团队)；2D 常用 Godot/Löve。',
    '语言选择：Unity/C#、Unreal/C++、Godot/GDScript、Web 游戏/JS、独立小游戏可 Python(pygame)。',
    '游戏类型影响选型：2D 平台游戏 Godot 易上手；3A 3D 用 Unreal；移动/休闲用 Unity；独立像素风可用任意轻引擎。',
    '学习路径：选一个引擎 -> 做 3-5 个小原型(连连看/跳一跳/贪吃蛇/打砖块) -> 学数学/物理/渲染 -> 做大 project。',
    '工程化意识：版本管理(Git)、资源管理、设计模式(状态机/组件)、性能分析从第一天就要有。',
  ],
  notes: [
    '不要贪多引擎；先用一个把"做完一个游戏"的完整流程跑通。',
    '引擎只是工具，核心是游戏循环、数据结构、数学与调试能力。',
  ],
  example:
    '# 用最小代码体验"游戏循环"(Python 伪代码)\n' +
    'import time\n' +
    'def update(dt):   # 每帧更新逻辑\n' +
    '    pass\n' +
    'def render():     # 每帧画一屏\n' +
    '    pass\n\n' +
    'while True:\n' +
    '    start = time.time()\n' +
    '    update(1/60)\n' +
    '    render()\n' +
    '    time.sleep(max(0, 1/60 - (time.time()-start)))\n' +
    '# 帧率控制: 每帧约 1/60 秒',
  example2:
    '# 安装 Godot(命令行/下载)后快速跑通\n' +
    'godot --version\n' +
    '# 新建项目 main.tscn + main.gd\n' +
    '# 或 Unity Hub -> 新建 3D 项目 -> 放个 Cube\n\n' +
    '# 引擎目录结构(Godot 示例)\n' +
    'project.godot\n' +
    'scenes/main.tscn\n' +
    'scripts/player.gd\n' +
    'assets/sprites/player.png\n' +
    'assets/audio/jump.wav',
  example3:
    '# 常用引擎命令/安装提示\n' +
    '# Unity: 命令行为 unity-editor -batchmode -quit -projectPath .\n' +
    '# Godot 导出命令行:\n' +
    'godot --headless --export-release "Linux" build/game.x86_64\n\n' +
    '# 自研用 SDL 起点(C++)\n' +
    '# apt install libsdl2-dev\n' +
    '# g++ main.cpp -lSDL2 -o game\n' +
    '# 之后 20 篇会逐步覆盖: 循环/渲染/物理/寻路/网络等',
};

const gd2 = {
  id: 'gd-game-loop',
  title: '2. 游戏循环与帧率',
  category: '基础',
  version: '通用',
  level: '入门',
  summary: '游戏循环(update/render)、deltaTime、固定时间步与帧率无关的运动。',
  detail: [
    '游戏循环是心脏：不断"更新逻辑 + 渲染画面"。每秒运行次数即帧率(FPS)。',
    '两个阶段：Update(改状态, 处理输入/物理/逻辑)、Render(把当前状态画出来)。',
    'deltaTime(Δt): 上一帧到本帧的时间。运动"每帧移动 speed*dt"才能与帧率无关、不同机器表现一致。',
    '固定时间步(FixedUpdate)：物理最好用固定步长(如 1/60s)保证确定性，避免不同帧率物理崩溃。',
    '可变帧率陷阱：若直接"每帧移动 speed"高帧率会更快，必须乘 dt。',
    '帧率上限 vs 垂直同步：vsync(60Hz 显示器)、定义 frame cap 省电；负载用 profiler 看瓶颈。',
  ],
  notes: [
    '引擎里 Update 每帧调, FixedUpdate 每固定间隔调, 两者别混用同一物理操作。',
    '显示 FPS: Unity 需自定义, Godot 可 Engine.get_frames_per_second()。',
  ],
  example:
    '# Godot 简单角色移动(帧率无关)\n' +
    'extends CharacterBody2D\n' +
    'const SPEED = 300.0\n\n' +
    'func _physics_process(delta):\n' +
    '    var dir = Input.get_vector("left", "right", "up", "down")\n' +
    '    velocity = dir * SPEED\n' +
    '    move_and_slide()\n\n' +
    'func _process(delta):\n' +
    '    pass   # 每帧逻辑(如动画)',
  example2:
    '# Unity C#: 移动随 deltaTime\n' +
    'using UnityEngine;\n' +
    'public class Player : MonoBehaviour\n' +
    '{\n' +
    '    public float speed = 5f;\n' +
    '    void Update()\n' +
    '    {\n' +
    '        float h = Input.GetAxis("Horizontal");\n' +
    '        transform.Translate(h * speed * Time.deltaTime, 0, 0);\n' +
    '    }\n' +
    '    void FixedUpdate()\n' +
    '    {\n' +
    '        // 固定步长: 物理专用, 别放依赖帧率逻辑\n' +
    '    }\n' +
    '}',
  example3:
    '# 手写极小游戏循环(网页 Canvas 思路)\n' +
    '// requestAnimationFrame 浏览器已含循环\n' +
    'let last = 0;\n' +
    'function loop(t) {\n' +
    '    const dt = (t - last) / 1000;   // 秒\n' +
    '    last = t;\n' +
    '    update(dt);\n' +
    '    render();\n' +
    '    requestAnimationFrame(loop);\n' +
    '}\n' +
    'requestAnimationFrame(loop);\n' +
    '# 显示帧率\n' +
    '// console.log(Math.round(1 / dt));',
};

const gd3 = {
  id: 'gd-math-render',
  title: '3. 数学基础与渲染管线',
  category: '基础',
  version: '综合',
  level: '进阶',
  summary: '向量/矩阵/变换、坐标系、GPU 渲染管线与 shader 的基本概念。',
  detail: [
    '游戏数学围绕坐标与变换：点(位置)、向量(方向/位移)、矩阵(旋转/缩放/平移)、四元数(避免万向锁的旋转)。',
    '常用运算：向量加减、点积(投影/夹角/光照)、叉积(法线/朝向)、归一化、矩阵乘法组合变换。',
    '渲染管线(简化)：顶点 -> 顶点着色器(位置/变换到屏幕) -> 光栅化 -> 片元着色器(算每个像素颜色) -> 输出帧。',
    'MVP 矩阵：模型(Model 本地->世界) * 视图(View 世界->相机) * 投影(Projection 3D->2D 屏幕)。',
    'Shader 是可编程处理单元的小程序：顶点着色器改几何，片元(像素)着色器改颜色/光照/纹理。',
    '理解向量与矩阵是 AI 寻路、物理、相机控制的共同基础，值得投入。',
  ],
  notes: [
    '右手系/左手系各引擎不同(Unity 左手, OpenGL 右手), 建 3D 先确认。',
    '引擎隔离了 shader 细节，但调颜色/法线/光照仍受益于理解坐标系。',
  ],
  example:
    '# Godot 实用向量运算\n' +
    'extends Node\n' +
    'var a = Vector2(3, 4)\n' +
    'var b = Vector2(1, 0)\n\n' +
    'func _ready():\n' +
    '    print(a.length())          # 5.0  模长\n' +
    '    print(a.normalized())      # 单位向量\n' +
    '    print(a.dot(b))            # 点积 3\n' +
    '    print(a.distance_to(b))    # 距离\n' +
    '    print(a.move_toward(b, 1)) # 向b移动1单位',
  example2:
    '# Unity 常用变换\n' +
    'using UnityEngine;\n' +
    'public class Move : MonoBehaviour\n' +
    '{\n' +
    '    void Update()\n' +
    '    {\n' +
    '        // 向量\n' +
    '        Vector3 dir = (transform.position - target).normalized;\n' +
    '        // 朝某方向移动\n' +
    '        transform.Translate(dir * 5f * Time.deltaTime);\n' +
    '        // 绕 Y 轴旋转\n' +
    '        transform.Rotate(0f, 30f * Time.deltaTime, 0f);\n' +
    '        // 看向目标\n' +
    '        transform.LookAt(target);\n' +
    '    }\n' +
    '}',
  example3:
    '# Godot Shader 最小示例(着色脚本资源)\n' +
    '# shader_type canvas_item;        // 2D 画布shader\n' +
    '# void fragment() {\n' +
    '#     // 根据坐标给红绿渐变\n' +
    '#     COLOR = vec4(UV.x, UV.y, 0.0, 1.0);\n' +
    '# }\n\n' +
    '# 应用: 把该 shader 挂到 Sprite2D 的 material 上\n' +
    '# 效果: 左上红 -> 右下绿 的渐变\n' +
    '# (理解 UV=0..1 纹理坐标, fragment每像素运行)',
};

const gd4 = {
  id: 'gd-statefsm',
  title: '4. 游戏状态与有限状态机',
  category: '基础',
  version: '通用',
  level: '进阶',
  summary: '用状态机管理角色/关卡状态，输入系统与事件驱动，让逻辑清晰可维护。',
  detail: [
    '有限状态机(FSM)：实体任何时刻属于有限几个状态之一(待机/移动/跳跃/攻击)，由事件触发状态迁移。',
    '优势：把复杂行为拆成独立状态，边界清晰、易调试、易扩展新状态。',
    '实现：switch/enum 简单版，或用状态类+状态机管理器(每个状态是对象, 有 Enter/Update/Exit)。',
    '输入系统：引擎提供(Unity Input System / Godot Input 单例)，把物理按键映射成逻辑动作("跳跃""跑步")，解耦。',
    '事件/边界：玩家脚本监听输入事件切换状态；状态转换可不命中就"忽略"。',
    '其他状态变体：层级状态机(嵌套)、行为树(BT, AI)、HP 机结合协程复杂逻辑。',
  ],
  notes: [
    '状态机别过度设计；状态少于 5 个用 enum+switch 即可。',
    '输入直接操作逻辑是反模式，先映射到"意图"再进状态机。',
  ],
  example:
    '# 简单状态机(伪代码)\n' +
    'enum State { IDLE, RUN, JUMP, ATTACK }\n' +
    'State s = IDLE\n' +
    'def update(dt):\n' +
    '    if s == IDLE and input.jump:  s = JUMP\n' +
    '    if s == JUMP  and on_ground:  s = IDLE\n' +
    '    if s == RUN   and not input.run: s = IDLE\n' +
    '    render(s)   # 播放对应动画',
  example2:
    '# Godot 用节点/标志做状态\n' +
    'extends CharacterBody2D\n' +
    'enum { IDLE, RUN, JUMP }\n' +
    'var state = IDLE\n\n' +
    'func _physics_process(delta):\n' +
    '    match state:\n' +
    '        IDLE:\n' +
    '            if Input.is_action_pressed("move"): state = RUN\n' +
    '            if Input.is_action_just_pressed("jump"): state = JUMP\n' +
    '        RUN:\n' +
    '            # 移动...\n' +
    '            if not Input.is_action_pressed("move"): state = IDLE\n' +
    '        JUMP:\n' +
    '            if is_on_floor(): state = IDLE\n' +
    '    update_anim(state)',
  example3:
    '# Unity 状态对象模式(每个状态一个类)\n' +
    '# interface IState { void Enter(); void Update(); void Exit(); }\n' +
    '# class IdleState : IState { /* ... */ }\n' +
    '# class StateMachine {\n' +
    '#   IState cur;\n' +
    '#   public void Change(IState s){ cur?.Exit(); cur=s; cur.Enter(); }\n' +
    '#   public void Update(){ cur?.Update(); }\n' +
    '# }\n\n' +
    '# 用法:\n' +
    '# _sm = new StateMachine();\n' +
    '# _sm.Change(new IdleState(player));\n' +
    '# 脚本 Update 里调用 _sm.Update();\n' +
    '# (状态对象便于挂更多数据与退出逻辑)',
};

const gd5 = {
  id: 'gd-sprites',
  title: '5. 2D 精灵与动画',
  category: '基础',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '精灵图、精灵表(Sprite Sheet)、纹理图集、帧动画与切换。',
  detail: [
    '2D 游戏画面主要由精灵(Sprite/贴图)组成；同一图内排列多个帧叫精灵表/纹理图集(省绘制调用)。',
    '帧动画：按顺序切换精灵表的子区域(如每 0.1s 切一格)形成运动。',
    '引擎做法：Godot AnimatedSprite2D + SpriteFrames 资源；Unity 用 SpriteRenderer + Animator/Animation。',
    'Sprite Sheet 由美术导出；程序里"格子数=宽/每格宽"，用索引换算 UV 或帧矩形。',
    '性能要点：尽可能合并纹理到图集、限制透明、按需加载、对象池(见优化篇)。',
    '排序与层级：z 值/绘制顺序保证遮挡正确；场景里 Sprite 的 ZIndex/Order in Layer。',
  ],
  notes: [
    '逐帧换图是基础；更复杂的是骨骼动画(Sprite 变形),见动画系统篇。',
    '用引擎内置动画编辑器可视化做状态切换,比纯代码省力。',
  ],
  example:
    '# Godot 帧动画(用 AnimatedSprite2D)\n' +
    'extends AnimatedSprite2D\n' +
    'func _ready():\n' +
    '    # 假设 SpriteFrames 资源含 idle/run 动画\n' +
    '    play("idle")\n\n' +
    'func _physics_process(_d):\n' +
    '    var m = Input.get_vector("left","right","up","down")\n' +
    '    if m.length() > 0:\n' +
    '        play("run")\n' +
    '        flip_h = m.x < 0      # 左右翻转\n' +
    '    else:\n' +
    '        play("idle")',
  example2:
    '# 手动切 Sprite Sheet(Godot 程序式)\n' +
    'extends Sprite2D\n' +
    'var cols = 4            # 每行几格\n' +
    'var row = 0\n' +
    'var frame = 0\n' +
    'var tex: Texture2D   # sheet\n\n' +
    'func _process(delta):\n' +
    '    // texture 换区域\n' +
    '    region_enabled = true\n' +
    '    region_rect = Rect2(frame*size_w, row*size_h, size_w, size_h)\n' +
    '    # 定时 frame = (frame + 1) % cols',
  example3:
    '# 常见 2D 命令/组织\n' +
    '#  美工交付: player.png (多格Sprite Sheet)\n' +
    '#  用 Godot 导入后改 import 设置(滤噪/逐像素)\n\n' +
    '# 程序化判断帧格数\n' +
    '// 格数 = 纹理总宽 / 单格宽\n' +
    '# 图集(Atlas)把多个精灵合一张图,减少绘制批次\n' +
    '# Godot: AtlasTexture 引用同一图集的不同区域\n' +
    '# Unity: 图集(Texture Atlas)提高性能',
};

if (typeof module !== 'undefined') module.exports = { gd1, gd2, gd3, gd4, gd5 };