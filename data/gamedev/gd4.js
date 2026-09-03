// 游戏开发技术 16–20：动画/存档/联机/优化/速查
const gd16 = {
  id: 'gd-animation',
  title: '16. 动画系统与状态切换',
  category: '动画',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '动画状态机、混合、参数驱动，让角色过渡自然、奔跑/跳跃衔接顺畅。',
  detail: [
    '动画系统把"播放哪段动画"从代码解耦：用动画状态机(Animator/AnimationTree)定义状态与迁移。',
    '状态机节点：待机/奔跑/跳跃/攻击等状态，带 Enter/Exit 条件(布尔/触发器/参数)。',
    '混合(Blend)：如"走路->跑步"按 speed 参数在两个动画间插值过渡(2D Blend Tree)。',
    '迁移条件实例：idle->run 当 speed>0.1；run->jump 当 isGrounded=false 上升；land 当落地。',
    '动画事件(Animation Event)：在动画某帧触发脚本回调(接触地面脚步声、攻击帧判伤害)。',
    '腿部 IK/根运动(Root Motion)：高级但让走路带位移更自然, 需美术配合。',
  ],
  notes: [
    '别用 if/else 直接切动画, 状态机会乱; 用状态机统一管理。',
    '动画与物理时间基准不同, 过渡长度(T)调成手感。',
  ],
  example:
    '# Godot AnimationTree 状态机(概念)\n' +
    '# 1) 建 AnimationTree: anim.conditions.* = 自定义属性\n' +
    'extends CharacterBody2D\n' +
    'var tree: AnimationTree\n\n' +
    'func _ready():\n' +
    '    tree = $AnimationTree\n' +
    '    tree.active = true\n\n' +
    'func _physics_process(delta):\n' +
    '    tree["parameters/conditions/is_running"] = is_on_floor()\n' +
    '    tree["parameters/conditions/is_jumping"] = not is_on_floor()',
  example2:
    '# Unity Animator 参数切换(代码侧)\n' +
    'using UnityEngine;\n' +
    'public class AnimCtl : MonoBehaviour\n' +
    '{\n' +
    '    Animator anim;\n' +
    '    void Awake() => anim = GetComponent<Animator>();\n' +
    '    void Update()\n' +
    '    {\n' +
    '        anim.SetFloat("Speed", Mathf.Abs(Input.GetAxis("Horizontal")));\n' +
    '        if (Input.GetKeyDown(KeyCode.Space))\n' +
    '            anim.SetTrigger("Jump");\n' +
    '    }\n' +
    '}\n' +
    '# Animator 里配好参数名与迁移条件即可',
  example3:
    '# 动画事件(打击帧触发伤害判定)\n' +
    '# Godot: 动画编辑器中右键某帧 -> Insert Key -> 事件\n' +
    'func _on_hit_frame():\n' +
    '    # 该帧才检测近战命中\n' +
    '    var area = $AttackArea\n' +
    '    for b in area.get_overlapping_bodies():\n' +
    '        if b.has_method("take_damage"):\n' +
    '            b.take_damage(10)\n' +
    '# 优点: 判定与动画节奏精确对齐, 不被帧率影响',
};

const gd17 = {
  id: 'gd-save-data',
  title: '17. 存档与数据持久化',
  category: '数据',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '设置保存、游戏进度存档、JSON/二进制序列化、跨场景传递数据。',
  detail: [
    '持久化方案分：简单设置(键值)、结构化进度(JSON/二进制/数据库)。',
    'Godot: ConfigFile / 2D/3D 存档用 FileAccess + JSON/二进制; 也支持 SQLite(需插件)。',
    'Unity: PlayerPrefs(键值, 适合设置)、JSON(JsonUtility/Newtonsoft)、ScriptableObject 作配置。',
    'JSON 适合人类可读、跨引擎交换；二进制更快更小但要管理字节布局；数据库适合海量数据(背包/技能树)。',
    '跨场景传数据：用全局单例(Autoload/Singleton)或场景持久化对象，避免传递参数丢失。',
    '存档健壮性：写入临时文件再 rename 原子替换、校验和、损坏时回退，避免断电报毁档。',
  ],
  notes: [
    '含用户进度务必"写临时+校验+原子替换", 防闪退毁档。',
    '跨平台路径: Godot user:// 目录, Unity Application.persistentDataPath。',
  ],
  example:
    '# Godot AJ 存 JSON 进度\n' +
    'extends Node\n' +
    'const PATH = "user://save.json"\n' +
    'var data = { "level": 1, "coins": 0 }\n\n' +
    'func save():\n' +
    '    var f = FileAccess.open(PATH, FileAccess.WRITE)\n' +
    '    f.store_string(JSON.stringify(data))\n\n' +
    'func load():\n' +
    '    if FileAccess.file_exists(PATH):\n' +
    '        var f = FileAccess.open(PATH, FileAccess.READ)\n' +
    '        data = JSON.parse_string(f.get_as_text())\n',
  example2:
    '# Unity PlayerPrefs 存档\n' +
    'public static class Save\n' +
    '{\n' +
    '    public static int Level\n' +
    '    {\n' +
    '        get => PlayerPrefs.GetInt("Level", 1);\n' +
    '        set { PlayerPrefs.SetInt("Level", value); }\n' +
    '    }\n' +
    '    // 调用后常 PlayerPrefs.Save();\n' +
    '}\n\n' +
    '# JSON 复杂对象\n' +
    'var json = JsonUtility.ToJson(state);      // 存\n' +
    'var st = JsonUtility.FromJson<GameState>(json); // 读',
  example3:
    '# 全局单例跨场景(Godot Autoload)\n' +
    '# ProjectSettings -> Autoload -> 加 GameState\n' +
    'extends Node    # autoload 单例\n' +
    'var hp = 100\n' +
    'var coins = 0\n\n' +
    '# 任意场景直接访问\n' +
    'func _ready():\n' +
    '    print(GameState.hp)        # 全局数据\n' +
    '    GameState.coins += 5\n' +
    '# 换场景数据不丢(单例常驻)',
};

const gd18 = {
  id: 'gd-multiplayer',
  title: '18. 网络对战与多人游戏',
  category: '网络',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '联机架构(客户端-服务器/点对点)、权威服务器、同步与延迟补偿。',
  detail: [
    '联机架构两类：客户端-服务器(C/S, 权威防作弊, 主流)与点对点(P2P, 简单但易作弊/NAT难)。',
    '权威服务器：服务器运行核心逻辑，客户端只发输入; 得分/伤害以服务器为准, 防修改器。',
    '连接方式：房间匹配(创建/加入)、直接传 IP:port、或云端中继(STUN/TURN穿透)。',
    '同步：周期性的把状态(位置)发给客户端; 客户端插值平滑(位置在两帧间补算)减少卡顿。',
    '延迟补偿：客户端预测自己、服务器回放校验(回滚)、拉近对手位置——快节奏射击必做。',
    '引擎方案：Godot High-level multiplayer/ENet; Unity 的 Netcode for GameObjects; 或第三方(Photon/Mirror)。',
  ],
  notes: [
    '先做单机做完再联机; 联机 Debug 复杂, 起两台实例/双端测试。',
    '只在自己/授权测试网络里联, 尊重游戏服务条款。',
  ],
  example:
    '# Godot 多人基础(ENet/high-level)\n' +
    'extends Node\n' +
    'var peer = ENetMultiplayerPeer.new()\n\n' +
    'func host():\n' +
    '    peer.create_server(9999, 4)      # 端口/最大人数\n' +
    '    multiplayer.multiplayer_peer = peer\n\n' +
    'func join(ip):\n' +
    '    peer.create_client(ip, 9999)\n' +
    '    multiplayer.multiplayer_peer = peer\n\n' +
    'func _ready():\n' +
    '    multiplayer.peer_connected.connect(\n' +
    '        func(id): print("玩家加入", id))',
  example2:
    '# 权威移动同步(GDScript 思路)\n' +
    '# 服务器权威: 只有服务器改位置\n' +
    'func _physics_process(delta):\n' +
    '    if multiplayer.is_server():\n' +
    '        handle_input(delta)       # 服务器处理\n\n' +
    'func send_pos(id, pos):\n' +
    '    # 服务器广播给对方(仅自己客户端显示)\n' +
    '    rpc("sync_pos", id, pos)\n' +
    '@rpc("any_peer", "call_remote")\n' +
    'func sync_pos(who, pos):\n' +
    '    players[who].position = pos\n' +
    '# 客户端按输入请求移动, 服务器裁决',
  example3:
    '# Unity Netcode 简介\n' +
    '# 脚本: 把移动逻辑包在 if (IsOwner) 里\n' +
    '// if (IsOwner && IsServer)\n' +
    '// {\n' +
    '//     transform.position += new Vector3(Input.GetAxis("Horizontal"), 0, 0) * speed * Time.deltaTime;\n' +
    '// }\n' +
    '# 场景要加 NetworkManager\n' +
    '# 玩家对象挂 NetworkObject + NetworkTransform\n' +
    '# (服务器托管可简化联机, 自己部署需明确授权)',
};

const gd19 = {
  id: 'gd-optimization',
  title: '19. 性能优化与发布',
  category: '优化',
  version: 'Godot/Unity',
  level: '实战',
  summary: 'Profiler 找瓶颈、对象池、渲染与脚本优化、打包发布到各平台。',
  detail: [
    '法则：先测后优——用 Profiler 找到真正瓶颈, 别凭感觉优化(常浪费时间在不卡的部位)。',
    '常见瓶颈：绘制调用(Draw Call/渲染批次)、大量 Unity 对象(GC/内存)、物理过密、资源重复加载。',
    '对象池：重复生成/销毁(子弹/粒子)先池化复用, 减少 GC 与对象创建开销。',
    '渲染优化：合批/图集、遮挡剔除、LOD、限制动态灯光、降低分辨率纹理。',
    '脚本优化：避免每帧 Find/GetComponent、缓存引用、减少字符串拼接与 LINQ 热路径、用对象池。',
    '发布：选目标平台导出(Build)，配置图标/分辨率，出 Release；用版本控制打 tag, 出包签证书。',
  ],
  notes: [
    '移动端最优先省电量: 减粒子/光影、降分辨率、限制质。',
    '每次优化后回归测试数值(帧率/内存)证明有效。',
  ],
  example:
    '# Godot Profiler 使用\n' +
    '# 运行 -> 调试器(Debugger) -> 分析器(Profiler)\n' +
    '#   CPU Profiler  看每帧谁最耗\n' +
    '#   Networking   网络耗时\n' +
    '#   Visual(渲染) 绘制开销\n\n' +
    '# 看帧率\n' +
    'func _process(delta):\n' +
    '    if Engine.is_editor_hint(): return\n' +
    '    print(Engine.get_frames_per_second())   # 帧率',
  example2:
    '# 对象池最小实现(GDScript)\n' +
    'extends Node\n' +
    'var pool: Array[PackedScene] = []\n' +
    'func spawn(scene: PackedScene, pos):\n' +
    '    var o = pool.pop_back() if pool.size() else scene.instantiate()\n' +
    '    o.position = pos\n' +
    '    add_child(o)\n' +
    '    return o\n\n' +
    'func despawn(o):\n' +
    '    o.queue_free()       # 或回收到池\n' +
    '# 子弹/碎片多时显著减少创建开销',
  example3:
    '# 命令行导出发布包\n' +
    'godot --headless --export-release "Linux" build/game.x86_64\n' +
    'godot --headless --export-release "Windows Desktop" build/game.exe\n' +
    '# Unity 导出命令行批处理(CI用)\n' +
    '# unity-editor -batchmode -quit -projectPath . \\\n' +
    '#   -buildTarget Linux64 -executeMethod BuildScript.DoBuild\n\n' +
    '# 检查待发布体积\n' +
    'du -sh build/\n' +
    '# (发布前务必做性能回归, 再推到各平台商店)',
};

const gd20 = {
  id: 'gd-project-cheatsheet',
  title: '20. 综合实战与速查手册',
  category: '实战',
  version: '综合',
  level: '实战',
  summary: '用全部章节拼一个小游戏(打砖块/平台跳跃), 全书速查与提升路线。',
  detail: [
    '用一个完整小项目串起全书：目标(如平台跳跃) -> 场景搭建 -> 角色控制 -> 物理/碰撞 -> 动画 -> 音频 -> 粒子 -> 存档 -> 打包。',
    '推荐里程碑项目：打砖块(物理+碰撞+计分)、跳一跳(控制+相机+分数)、横版跑酷(程序生成+对象池)、小地牢探索(寻路+存档)。',
    '工程组织：scenes/ scripts/ assets/ 层次清晰; 用信号/组件解耦; 留 TODO; 版本管理每次稳定提交。',
    '最佳实践清单：帧率无关(dt)、状态机管理动画、对象池高频率对象、先测后优化、存档原子写入、资源统一管理。',
    '进阶方向：ECS+Dots(Unity)、GDExtension(Godot 用 C++ 写性能热点)、自定义渲染/Shader、主机平台手柄适配、联机架构。',
    '学习心态：做完比做完美重要；每次迭代留记录；参考现成开源 GameJam 项目学习。',
  ],
  notes: [
    '所有教程示例限于学习/自研, 涉及他人内容与版权务必尊重。',
    '把每一章的方法实际敲进你的项目, 才算真正掌握。',
  ],
  example:
    '# 项目骨架(打砖块思路)\n' +
    'extends Node2D\n' +
    'var score = 0\n' +
    'var ball: CharacterBody2D\n\n' +
    'func _ready():\n' +
    '    # 球: 速度 + PhysicsMaterial(弹性)\n' +
    '    # 板: CharacterBody2D + 左右 Input\n' +
    '    # 砖: StaticBody2D + Area2D 触发器\n' +
    '    # HUD: Label 显示分数\n' +
    '    pass\n\n' +
    'func add_score(n):\n' +
    '    score += n\n' +
    '    $HUD/Score.text = str(score)',
  example2:
    '# 完整小游戏计数器+碰撞(平台跳跃片段)\n' +
    'extends CharacterBody2D\n' +
    '@export var speed = 220.0\n' +
    '@export var jump = 520.0\n\n' +
    'func _physics_process(delta):\n' +
    '    var dir = Input.get_axis("left", "right")\n' +
    '    velocity.x = dir * speed\n' +
    '    if is_on_floor() and Input.is_action_just_pressed("jump"):\n' +
    '        velocity.y = -jump\n' +
    '    velocity.y += 1400 * delta\n' +
    '    move_and_slide()\n\n' +
    'func _process(delta):\n' +
    '    direction_facing(delta)   # 翻转精灵\n' +
    '    handle_anim()             # 状态机切动画',
  example3:
    '# 整体速查\n' +
    '#  循环    GameLoop/Update(dt)/FixedUpdate\n' +
    '#  数学    向量/矩阵/四元数/点积/AABB\n' +
    '#  引擎    Unity(C#)/Godot(GDScript)/Unreal(C++)\n' +
    '#  物理    RigidBody/Area/碰撞分层/触发\n' +
    '#  逻辑    FSM状态机/寻路A*/行为树\n' +
    '#  动画    状态机/混合/事件\n' +
    '#  存档    JSON/PlayerPrefs/原子写\n' +
    '#  联机    客户端-服务器/权威/同步/延迟补偿\n' +
    '#  优化    Profiler/对象池/遮挡剔除/合批\n' +
    '#  发布    Export/Build/版本控制/商店\n' +
    '# 建议: 看一章做一节, 串联成完整可玩的项目。',
};

if (typeof module !== 'undefined') module.exports = { gd16, gd17, gd18, gd19, gd20 };