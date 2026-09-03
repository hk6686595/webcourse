// 游戏开发技术 6–10：引擎与物理
const gd6 = {
  id: 'gd-unity-intro',
  title: '6. Unity 引擎入门',
  category: '引擎',
  version: 'Unity 6',
  level: '进阶',
  summary: 'GameObject/组件/资源/场景，MonoBehaviour 生命周期，搭第一个小场景。',
  detail: [
    'Unity 核心抽象：场景(Scene)=关卡，GameObject=场景中的对象(容器)，Component=挂在其上的行为/能力(渲染/物理/脚本)。',
    '一个 GameObject 就是"一盒组件"：放 Sprite/ MeshRenderer 渲染, Rigidbody 物理, Collider 碰撞, 自定义 MonoBehaviour 逻辑。',
    'MonoBehaviour 生命周期：Awake(创建时)->OnEnable->Start(可访问其他)->Update(每帧)->FixedUpdate(定步)->OnDisable/OnDestroy。',
    '资源(Asset)：Prefab 预制体=可复用模板(拖入场景生成实例), Material/Material, 场景/脚本都是资产。',
    '父子层级(Transform)：子对象位置相对父对象, 用于组装(枪挂手上、血条贴头顶)。',
    '工作流：搭场景 -> 挂组件 -> 编写 C# 脚本 -> Play 预览调试(Inspector 改参数实时看)。',
  ],
  notes: [
    '每个脚本类名须与文件名一致且唯一, 否则挂不上。',
    '获取组件: GetComponent<Name>()；查找: Find/FindObjectOfType(慎用, 慢)。',
  ],
  example:
    '# 最小 Unity C# 脚本(旋转立方体)\n' +
    'using UnityEngine;\n' +
    'public class Spinner : MonoBehaviour\n' +
    '{\n' +
    '    public float speed = 30f;   // Inspector 可调\n' +
    '    void Update()\n' +
    '    {\n' +
    '        transform.Rotate(0f, speed * Time.deltaTime, 0f);\n' +
    '    }\n' +
    '}\n' +
    '# 操作: 建 Cube -> 新建 C# 脚本挂上 -> Play',
  example2:
    '# 生命周期演示\n' +
    'public class Life : MonoBehaviour\n' +
    '{\n' +
    '    void Awake()   => Debug.Log("Awake");\n' +
    '    void Start()   => Debug.Log("Start");\n' +
    '    void Update()  { }               // 每帧\n' +
    '    void FixedUpdate() { }           // 每固定步\n' +
    '    void OnDisable() => Debug.Log("off");\n' +
    '    void OnDestroy() => Debug.Log("bye");\n' +
    '}\n\n' +
    '# 组件增查改\n' +
    'void Test()\n' +
    '{\n' +
    '    var rb = GetComponent<Rigidbody>();\n' +
    '    if (rb != null) rb.useGravity = true;\n' +
    '}',
  example3:
    '# 预制体实例化\n' +
    'using UnityEngine;\n' +
    'public class Spawner : MonoBehaviour\n' +
    '{\n' +
    '    public GameObject bulletPrefab;\n' +
    '    public void Shoot()\n' +
    '    {\n' +
    '        var b = Instantiate(bulletPrefab, transform.position,\n' +
    '                           transform.rotation);\n' +
    '        var rb = b.GetComponent<Rigidbody>();\n' +
    '        rb.linearVelocity = transform.forward * 20f;\n' +
    '    }\n' +
    '}\n' +
    '# 场景→Inspector 把子弹预制体拖到字段\n' +
    '# (批量生成时用对象池更省,见优化篇)',
};

const gd7 = {
  id: 'gd-godot-intro',
  title: '7. Godot 引擎入门',
  category: '引擎',
  version: 'Godot 4',
  level: '进阶',
  summary: '节点/场景树，GDScript 语法与信号，2D 平台跳跃小样。',
  detail: [
    'Godot 一切皆节点(Node)，节点组成场景树(Scene)；场景(Scene)是可复用的节点组(类似 Unity Prefab)。',
    'GDScript 是 Godot 的 Python 风格脚本，一等公民，与节点深度集成；也支持 C# 与 GDExtension。',
    '节点类型：Node2D(2D 基类)、Sprite2D、CharacterBody2D(可移动对象)、Area2D(触发区)、StaticBody2D(静态碰撞体)。',
    '信号(Signal)：节点发出的事件, 可连接函数回调, 是解耦的核心(_on_body_entered 等)。',
    '方法：_ready()(进入场景)、_process(delta)(每帧)、_physics_process(delta)(定步, 物理)。',
    '装饰器：@onready、@export(Inspector 可调)、@signal 定义信号。',
  ],
  notes: [
    'F5 运行; 场景里主场景在 ProjectSettings -> Main Scene 设置。',
    '方法名以下划线开头的是引擎回调；自定义函数自定义命名。',
  ],
  example:
    '# GDScript 基础(2D 平台角色)\n' +
    'extends CharacterBody2D\n' +
    '@export var speed = 300.0\n' +
    '@export var jump_force = 600.0\n\n' +
    'func _physics_process(delta):\n' +
    '    var dir = Input.get_axis("left", "right")  # -1..1\n' +
    '    velocity.x = dir * speed\n' +
    '    if is_on_floor() and Input.is_action_just_pressed("jump"):\n' +
    '        velocity.y = -jump_force\n' +
    '    velocity.y += 1500 * delta     # 重力\n' +
    '    move_and_slide()',
  example2:
    '# 信号连接(面积触发)\n' +
    '# Area2D 子节点 设 body_entered 连接\n' +
    'extends Area2D\n' +
    'signal coin_taken\n\n' +
    'func _on_body_entered(body):\n' +
    '    if body.name == "Player":\n' +
    '        coin_taken.emit()          # 发信号\n' +
    '        queue_free()               # 消失\n' +
    '# 玩家侧连接:  coin_area.coin_taken.connect(_on_coin)\n\n' +
    '# 或手动连接\n' +
    '# $CoinArea.body_entered.connect(_on_body_entered)',
  example3:
    '# 用内置装饰器与场景树操作\n' +
    'extends Node2D\n' +
    '@onready var label: Label = $HUD/Label\n' +
    '@onready var player: CharacterBody2D = $Player\n\n' +
    'func _ready():\n' +
    '    # 动态创建节点\n' +
    '    var n := Node2D.new()\n' +
    '    n.name = "Extra"\n' +
    '    add_child(n)                 # 加入场景树\n\n' +
    'func _process(_d):\n' +
    '    label.text = str(player.global_position)\n' +
    '# $ 访问子节点; get_node("/root") 访问根',
};

const gd8 = {
  id: 'gd-physics',
  title: '8. 物理引擎基础',
  category: '物理',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '刚体、重力、碰撞响应、关节与触发器，让物体受物理影响。',
  detail: [
    '物理引擎(Box2D/Chipmunk/Bullet)自动计算刚体间碰撞与运动：给物体"刚体"组件即可受重力/碰撞。',
    '刚体类型：静态(StaticBody, 不动的地板)、动态(RigidBody, 受力运动)、运动学(Kinematic, 程序控制但参与碰撞)。',
    '撞无碰撞(触发): Area2D/ Trigger, 只探测"进入了"不产生物理阻挡, 用于拾取/机关/警戒区。',
    '关节/约束(Constraint)：把两体连起来——旋转关节(铰链)、滑动关节、距离关节, 做门/绳索/橡皮筋。',
    '物理材质/参数：摩擦(friction)、弹性(bounce)、群体(mask/layer)控制谁与谁碰撞。',
    '调参要点：物体别太小太薄, 用近似形状(盒子/圆)提高稳定与性能, 固定时间步保证确定性。',
  ],
  notes: [
    '不要每帧给刚体 set velocity 强写, 那会对抗物理引擎; 用 AddForce/Impulse 或设速度注意时机。',
    '碰撞分层: Unity Layer/Godot collision_layer|collision_mask 决定交互对象。',
  ],
  example:
    '# Godot 让方块掉下来并落在地板上\n' +
    '# 方块: 加 RigidBody2D 组件 + CollisionShape2D\n' +
    '# 地板: StaticBody2D + CollisionShape2D\n' +
    '# 什么都不用写, 运行即见掉落与反弹\n\n' +
    '# 程序施加力\n' +
    'extends RigidBody2D\n' +
    'func _physics_process(_d):\n' +
    '    if Input.is_action_just_pressed("kick"):\n' +
    '        apply_impulse(Vector2(100, -200))   # 冲量',
  example2:
    '# 触发器实现拾取\n' +
    'extends Area2D\n' +
    'func _on_body_entered(body):\n' +
    '    if body.has_method("add_points"):\n' +
    '        body.add_points(1)      # 触发计数\n' +
    '        queue_free()\n\n' +
    '# 场景: 金币 加 Area2D\n' +
    '# 子节点 CollisionShape2D\n' +
    '# Inspector 连接 body_entered -> 上面函数\n' +
    '# (Trigger=只检测不挡路)',
  example3:
    '# Unity 简单刚体与力\n' +
    'using UnityEngine;\n' +
    'public class Cannon : MonoBehaviour\n' +
    '{\n' +
    '    public Rigidbody ball;\n' +
    '    void Update()\n' +
    '    {\n' +
    '        if (Input.GetKeyDown(KeyCode.Space))\n' +
    '        {\n' +
    '            var rb = Instantiate(ball, transform.position, transform.rotation);\n' +
    '            rb.useGravity = true;\n' +
    '            rb.AddForce(transform.forward * 500f);  // 力\n' +
    '        }\n' +
    '    }\n' +
    '}\n' +
    '# Rigidbody: 勾 Is Kinematic=不受重力, Is Trigger=不碰撞',
};

const gd9 = {
  id: 'gd-collision',
  title: '9. 碰撞检测算法',
  category: '物理',
  version: '综合',
  level: '进阶',
  summary: 'AABB/圆/OBB 等基本碰撞判定与如何 DIY 简易物理。',
  detail: [
    '即使不用物理引擎，理解碰撞算法也是基础：判断两个形状是否相交、相交多深(用于推开)。',
    'AABB(轴对齐包围盒)：两矩形"边不重叠即不撞"。判定快, 常用于粗检测/2D 方块。',
    '圆与圆：两圆心距离 < 半径和 即碰撞；适合圆润物体/子弹。',
    'AABB vs 圆：找圆到矩形最近点比较距离。',
    'OBB(有向包围盒) / 多边形：用分离轴定理(SAT)判断任意凸多边形是否碰撞。',
    '宽相(粗检测)用网格/空间划分(Broadphase)减少检测对数；引擎都内置，自研需实现。',
  ],
  notes: [
    '物理引擎已封装这些, 自写用于理解或像素风简单游戏。',
    '大量物体用空间划分(网格/四叉树)把 O(n^2) 降下来。',
  ],
  example:
    '# Godot 用节点碰撞(无需手写)\n' +
    'extends Area2D\n' +
    'func _on_body_entered(body):\n' +
    '    print("撞到: ", body.name)\n\n' +
    '# 或 CharacterBody2D 自带 move_and_collide()\n' +
    'var collide = move_and_collide(velocity * delta)\n' +
    'if collide:\n' +
    '    print("撞上墙:", collide.get_collider().name)',
  example2:
    '# 手写 AABB vs AABB(Python 思路)\n' +
    'def aabb(a, b):\n' +
    '    # a,b 为 (x, y, w, h)\n' +
    '    ax, ay, aw, ah = a\n' +
    '    bx, by, bw, bh = b\n' +
    '    return (ax < bx + bw and bx < ax + aw and\n' +
    '            ay < by + bh and by < ay + ah)\n\n' +
    '# 圆 vs 圆\n' +
    'def circle(c1, r1, c2, r2):\n' +
    '    return ((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2\n' +
    '            <= (r1+r2)**2)   # 用平方避免开方',
  example3:
    '# GDScript 手写圆撞(子弹打圆靶)\n' +
    'func circle_hit(pos1: Vector2, r1: float,\n' +
    '               pos2: Vector2, r2: float) -> bool:\n' +
    '    return pos1.distance_squared_to(pos2) <= (r1 + r2)**2\n\n' +
    'func _physics_process(delta):\n' +
    '    for b in bullets:\n' +
    '        if circle_hit(ball.position, ball.r, b.position, b.r):\n' +
    '            ball.queue_free()\n' +
    '            break\n' +
    '# 性能: 用 distance_squared 省 sqrt',
};

const gd10 = {
  id: 'gd-pathfinding',
  title: '10. 寻路算法 A*',
  category: '逻辑',
  version: '综合',
  level: '进阶',
  summary: '图/网格上的寻路、A* 原理与启发式、Godot 内置寻路组件。',
  detail: [
    '寻路解决"从格子 A 到 B 的最短路径"。常见图：方格网格、导航网格(NavMesh)、路点图。',
    'A* 是 Dijkstra 的加速版：每个节点评分 f = g + h，g=起点已走代价, h=到目标的启发式估计(欧氏/曼哈顿距离)。',
    '用优先队列(open set)每次取 f 最小的扩展；closed set 记录已算；直到找到目标。',
    'h 必须"可采纳"(不高估)才保证最优；h=0 退化成 Dijkstra。',
    '引擎提供现成：Godot 的 NavigationAgent2D + NavigationRegion2D(烘焙 NavMesh)，AstarGrid2D；Unity NavMesh。',
    '实战优先用引擎寻路；手写 A* 用于理解与特殊需求(自定义代价)。',
  ],
  notes: [
    '密集动态障碍下 NavMesh 需重烘焙; 静态地图网格最省。',
    '启发式差则扩展节点多, 慢；曼哈顿适合四方向, 欧氏适合任意方向。',
  ],
  example:
    '# A* 核心伪代码\n' +
    'open = [start]\n' +
    'came_from = {}\n' +
    'g = {start: 0}\n' +
    'while open:\n' +
    '    cur = min(open, key=lambda n: g[n] + h(n, goal))\n' +
    '    if cur == goal: return reconstruct(came_from, cur)\n' +
    '    open.remove(cur)\n' +
    '    for nb in neighbors(cur):\n' +
    '        ng = g[cur] + cost(cur, nb)\n' +
    '        if nb not in g or ng < g[nb]:\n' +
    '            g[nb] = ng; came_from[nb] = cur\n' +
    '            if nb not in open: open.append(nb)',
  example2:
    '# Godot 用 AstarGrid2D 寻路\n' +
    'extends Node2D\n' +
    'var grid\n\n' +
    'func _ready():\n' +
    '    grid = AStarGrid2D.new()\n' +
    '    grid.region = Rect2i(0, 0, 10, 10)   # 10x10\n' +
    '    grid.update()\n' +
    '    grid.set_point_solid(Vector2i(3, 3))  # 障碍\n' +
    '    var path = grid.get_id_path(Vector2i(0, 0), Vector2i(9, 9))\n' +
    '    print("路径:", path)',
  example3:
    '# 跟随鼠标的 NavigationAgent2D(简化)\n' +
    'extends CharacterBody2D\n' +
    'var agent: NavigationAgent2D\n\n' +
    'func _ready():\n' +
    '    agent = get_node("NavigationAgent2D")\n\n' +
    'func _input(event):\n' +
    '    if event is InputEventMouseButton and event.pressed:\n' +
    '        agent.target_position = get_global_mouse_position()\n\n' +
    'func _physics_process(delta):\n' +
    '    if agent.is_navigation_finished(): return\n' +
    '    var dir = (agent.get_next_path_position() - global_position)\n' +
    '    velocity = dir.normalized() * 200\n' +
    '    move_and_slide()\n' +
    '# 需在场景加 NavigationRegion2D 并用工具烘焙 NavMesh',
};

if (typeof module !== 'undefined') module.exports = { gd6, gd7, gd8, gd9, gd10 };