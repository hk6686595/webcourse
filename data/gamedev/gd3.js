// 游戏开发技术 11–15：控制/关卡/3D/音频/特效
const gd11 = {
  id: 'gd-controls-camera',
  title: '11. 角色控制与相机',
  category: '玩法',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '键盘/手柄输入映射、角色移动、跳跃与重力、第三人称与跟随相机。',
  detail: [
    '角色控制=把输入转换成运动。先映射"意图"(移动/跳跃/奔跑)，再驱动角色，便于切手柄/触屏。',
    '平台类：水平速度直接设; 跳跃给一次向上初速然后重力回来;落地检测 is_on_floor。',
    '惯性/加速度：用 lerp 把当前速度平滑过渡到目标，手感更顺(脚本做加速与刹车)。',
    '相机策略：跟随主角(带平滑/死区)、第三人称(围绕角色旋转)、第一人称(旋转控制朝向)。',
    '相机抖动与边界：限制在关卡内、跟随时差/平滑、命中物体前移防遮挡。',
    '手感调试是精髓：跳跃高度、重力、摩擦都需反复试；参数 @export 方便在 Inspector 调。',
  ],
  notes: [
    '物理在 _physics_process/ FixedUpdate 做, 用 Input 读取每帧。',
    '相机=眼睛, 玩《没光/卡视角》最难做也最影响体验。',
  ],
  example:
    '# Godot 带摩擦与平滑的移动\n' +
    'extends CharacterBody2D\n' +
    '@export var speed = 200.0\n' +
    '@export var accel = 8.0       # 越高越跟手\n\n' +
    'func _physics_process(delta):\n' +
    '    var dir = Input.get_axis("left", "right")\n' +
    '    velocity.x = lerp(velocity.x, dir * speed, accel * delta)\n' +
    '    velocity.y += 1200 * delta\n' +
    '    move_and_slide()',
  example2:
    '# Unity 第三人称平滑跟随相机\n' +
    'public class CameraFollow : MonoBehaviour\n' +
    '{\n' +
    '    public Transform target;\n' +
    '    public Vector3 offset = new Vector3(0, 2, -4);\n' +
    '    public float smooth = 5f;\n' +
    '    void LateUpdate()   // Update之后, 锁最后\n' +
    '    {\n' +
    '        Vector3 goal = target.position + offset;\n' +
    '        transform.position = Vector3.Lerp(transform.position,\n' +
    '                                          goal, smooth * Time.deltaTime);\n' +
    '        transform.LookAt(target);\n' +
    '    }\n' +
    '}',
  example3:
    '# 手柄/键盘统一映射(Godot Input Map)\n' +
    '# Project -> Input Map: 加动作 "move_left"\n' +
    '#   绑定 A(手柄) 与 ←/A(键盘)\n\n' +
    'func _unhandled_input(event):\n' +
    '    if event.is_action_pressed("jump"):\n' +
    '        try_jump()\n\n' +
    '# 读取轴(可同时用手柄摇杆)\n' +
    'var axis = Input.get_axis("move_left", "move_right")\n' +
    '# axis 范围 -1..1 键盘离散/手柄连续, 统一处理',
};

const gd12 = {
  id: 'gd-level-design',
  title: '12. 关卡设计与程序生成',
  category: '玩法',
  version: '综合',
  level: '进阶',
  summary: 'Tilemap 关卡搭建、预制体组装、难度曲线与程序化随机生成。',
  detail: [
    '关卡搭建两种：手摆(编辑器拖拽)与程序生成(代码根据规则生成地图)。',
    'Tilemap(瓦片地图)：用瓦片集铺地面/墙体，省资源且便于手工编辑——Godot TileMapLayer、Unity Tilemap。',
    '手摆要点：落实体块时用 TileMap + CollisionShape 自动合并碰撞，少放单独刚体。',
    '难度曲线：递增节奏——紧张/放松交替，用"漏斗+开阔"、检查点、按进度解锁机制。',
    '程序生成(PCG)：随机地牢/平台——基于随机+规则(确保可达)、噪声地形、模板拼接。',
    '生成后校验：起点可达终点、跳跃间隙可跨过、资源不重叠，避免生成死关。',
  ],
  notes: [
    '每关给 1-2 个新机制并反复用, 别一次全塞。',
    'PCG 关键在"约束"而非纯随机, 随机种子可复现(Seed)。',
  ],
  example:
    '# Godot 用 TileMapLayer 铺地面\n' +
    '# 1) 建 TileSet 资源并切出瓦片\n' +
    '# 2) TileMapLayer 节点 用笔刷刷地面\n' +
    '# 3) 刷碰撞(在 TileSet 里给瓦片加 Collision)\n\n' +
    '# 运行时动态加瓦片\n' +
    'extends TileMapLayer\n' +
    'func _ready():\n' +
    '    set_cell(Vector2i(5, 5), 0, Vector2i(1, 0))  # 放1块',
  example2:
    '# 程序化随机平台(GDScript 思路)\n' +
    'extends Node2D\n' +
    'var rng = RandomNumberGenerator.new()\n\n' +
    'func _ready():\n' +
    '    rng.seed = 12345        # 固定种子可复现\n' +
    '    var x = 0\n' +
    '    while x < 100:\n' +
    '        var w = rng.randi_range(2, 5)      # 平台宽\n' +
    '        var y = rng.randi_range(0, 3)\n' +
    '        make_platform(x, y, w)\n' +
    '        x += w + rng.randi_range(1, 3)     # 间隔\n' +
    '# 每次都不同但同一个 seed 结果相同',
  example3:
    '# 简易地牢(用 ASCII 看生成结果)\n' +
    'import random\n' +
    'random.seed(7)\n' +
    'w, h = 20, 8\n' +
    'g = [["#" for _ in range(w)] for _ in range(h)]\n' +
    '# 开几条随机房间+走廊\n' +
    'for _ in range(6):\n' +
    '    x, y = random.randint(1, w-3), random.randint(1, h-3)\n' +
    '    rw, rh = random.randint(2,4), random.randint(2,3)\n' +
    '    for yy in range(y, min(y+rh, h-1)):\n' +
    '        for xx in range(x, min(x+rw, w-1)):\n' +
    '            g[yy][xx] = "."\n' +
    'for row in g: print("".join(row))',
};

const gd13 = {
  id: 'gd-3d-lighting',
  title: '13. 3D 渲染与光照',
  category: '渲染',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '网格/材质/纹理、光照类型、阴影与如何做出好看的场景。',
  detail: [
    '3D 对象=网格(顶点组成的面)+材质(决定表面如何着色)。材质引用纹理(贴图)、颜色与 shader。',
    '网格来源：建模软件(Blender)导出/引擎基本体(Box/Capsule)；复杂地形用高度图。',
    '光照类型：平行光(太阳)、点光(灯泡)、聚光(手电)、区域光；位置/颜色/强度影响明暗。',
    '阴影：实时阴影开销大; 烘焙光照贴图(静态物体先算好)省运行时开销, 常用混合方案。',
    '材质属性：Base Color(漫反射色)、Metallic(金属)、Roughness(粗糙度)、Normal(法线贴图加细节)。',
    '性能与视觉平衡：LOD(远距低模)、遮挡剔除(看不看得到)、合理tess、限制动态光数量。',
  ],
  notes: [
    '先搭好光照再看材质, 否则看不出效果。',
    '法线贴图/凹凸贴图能低成本提升细节质感。',
  ],
  example:
    '# Godot 创建 3D 物体与材质\n' +
    'extends Node3D\n' +
    'func _ready():\n' +
    '    var box := MeshInstance3D.new()\n' +
    '    box.mesh = BoxMesh.new()\n' +
    '    add_child(box)\n\n' +
    '    var mat := StandardMaterial3D.new()\n' +
    '    mat.albedo_color = Color(1, 0.3, 0.3)   # 红\n' +
    '    mat.roughness = 0.5\n' +
    '    box.material_override = mat',
  example2:
    '# Unity 脚本控制材质颜色\n' +
    'using UnityEngine;\n' +
    'public class Mat : MonoBehaviour\n' +
    '{\n' +
    '    public Material m;\n' +
    '    void Start()\n' +
    '    {\n' +
    '        m.color = Color.red;\n' +
    '        m.SetFloat("_Metallic", 0.8f);\n' +
    '        m.SetFloat("_Glossiness", 0.6f);\n' +
    '    }\n' +
    '}\n' +
    '# 场景加 Directional Light 调整阴影\n' +
    '# 平行光 Shadows -> Hard/Soft',
  example3:
    '# 点光源 + 光远离变暗\n' +
    'extends Node3D\n' +
    'func _ready():\n' +
    '    var l := OmniLight3D.new()\n' +
    '    l.position = Vector3(0, 2, 0)\n' +
    '    l.light_color = Color(1, 0.9, 0.6)  # 暖光\n' +
    '    l.light_energy = 2.0\n' +
    '    add_child(l)\n\n' +
    '# 阴影控制: light.shadow_enabled = true\n' +
    '# (小场景: 一盏 Directional + 一盏 Omni 足够)',
};

const gd14 = {
  id: 'gd-audio',
  title: '14. 音频系统',
  category: '音效',
  version: 'Godot/Unity',
  level: '入门',
  summary: '音效与背景音乐播放、位置音效、音量总线与混音。',
  detail: [
    '音频分两类：音效(SFX, 一击/脚步, 常循环小片段)与音乐(BGM, 长循环)。',
    '播放方式：AudioStreamPlayer(无条件播放)、AudioStreamPlayer2D/3D(按位置算左右/距离音量)、多播放器并发。',
    '音频总线(Bus)：混音排布——主总线 -> 子总线(Music/Sfx/UI), 各自可调音量/加效果(回声/混响)。',
    '音量控制：调 Bus 的 volume_db(-80..0dB)；玩家设置存本地。',
    '性能与体验：并发音效用对象池+计数限制；避免刺耳/突聋音, 提供静音设置。',
    '资源格式：Ogg/MP3 音乐, WAV 音效；循环音频导入时勾 Loop。',
  ],
  notes: [
    '音频资源版权注意: 用免费库/自制, 商用需授权。',
    '位置音效: Player 别放远处还爆音, 调衰减曲线。',
  ],
  example:
    '# Godot 播放音效\n' +
    'extends CharacterBody2D\n' +
    '@export var jump_sfx: AudioStream\n\n' +
    'func _ready():\n' +
    '    $Player  # 略\n\n' +
    'func try_jump():\n' +
    '    # 用一个播放器播放(可重叠)\n' +
    '    var p = get_node("JumpPlayer")\n' +
    '    p.stream = jump_sfx\n' +
    '    p.play()',
  example2:
    '# 音量总线控制\n' +
    '# 在 Audio 面板建 Bus: Master -> Music, Sfx\n' +
    'extends Node\n' +
    'func set_music_vol(db: float):\n' +
    '    var idx = AudioServer.get_bus_index("Music")\n' +
    '    AudioServer.set_bus_volume_db(idx, db)\n\n' +
    '# 静音\n' +
    'func mute_all(m: bool):\n' +
    '    AudioServer.set_bus_mute(0, m)   # 0=Master',
  example3:
    '# Unity 播放与 3D 位置音效\n' +
    'using UnityEngine;\n' +
    'public class AudioPlay : MonoBehaviour\n' +
    '{\n' +
    '    public AudioSource sfx;     // 挂在小兵上=位置音\n' +
    '    void OnTriggerEnter(Collider c)\n' +
    '    {\n' +
    '        if (c.CompareTag("Player"))\n' +
    '            sfx.Play();\n' +
    '    }\n' +
    '}\n' +
    '# AudioSource: Spatial Blend=3D(距离衰减)\n' +
    '# BGM: 场景挂 AudioSource + AudioListener 场景唯一',
};

const gd15 = {
  id: 'gd-particles',
  title: '15. 粒子系统与特效',
  category: '渲染',
  version: 'Godot/Unity',
  level: '进阶',
  summary: '粒子系统控制爆炸/火焰/喷血/雨雪，参数化做出各种实时特效。',
  detail: [
    '粒子系统：从发射器产生大量小图元(粒子)并赋予位置/速度/颜色/寿命/大小演化, 形成特效。',
    '典型表现：火焰(向上+波动+颜色渐变)、爆炸(放射+衰减)、下雨、火花、施法轨迹。',
    '关键参数：发射速率/数量、初速度与随机、寿命、重力、颜色随时间、大小缩放、淡出。',
    '引擎内置粒子节点(Godot GPUParticles2D/CPUParticles2D、Unity ParticleSystem)无需手写。',
    '性能：粒子数量要与效果平衡, 别堆几万粒子; 用图集、限制同时特效数。',
    '好特效=分层：爆炸=冲击波(扩散圆)+核心光+碎片+烟, 三五层叠加更立体。',
  ],
  notes: [
    '粒子是"观感"利器, 但也最吃性能; 手机上尤其节制。',
    '颜色曲线/随机化比单纯一种色高级很多。',
  ],
  example:
    '# Godot 粒子节点(火焰示例)\n' +
    '# 场景: GPUParticles2D\n' +
    '#   Emitting 勾选, Amount=50\n' +
    '#   Lifetime=0.5\n' +
    '#   方向=上, Spread=25度\n' +
    '#   Color 渐变: 黄->橙->透明\n' +
    '#   材质: ParticleProcessMaterial\n\n' +
    '# 程序控制喷射\n' +
    'func burst():\n' +
    '    $Particles2D.restart()      # 重新喷射',
  example2:
    '# 脚本配置粒子(爆炸一次性)\n' +
    'extends GPUParticles2D\n' +
    'func _ready():\n' +
    '    one_shot = true\n' +
    '    amount = 80\n' +
    '    lifetime = 0.6\n' +
    '    var m = ParticleProcessMaterial.new()\n' +
    '    m.direction = Vector2(0, 0)\n' +
    '    m.spread = 180            # 全方向\n' +
    '    m.initial_velocity_min = 100\n' +
    '    m.initial_velocity_max = 300\n' +
    '    m.gravity = Vector2(0, 300)   # 落体\n' +
    '    process_material = m\n' +
    '    emitting = true',
  example3:
    '# Unity 程序发射粒子(简化)\n' +
    'using UnityEngine;\n' +
    'public class Fire : MonoBehaviour\n' +
    '{\n' +
    '    public ParticleSystem ps;\n' +
    '    void Start()\n' +
    '    {\n' +
    '        var m = ps.main;\n' +
    '        m.startLifetime = 0.8f;\n' +
    '        m.startSpeed = new ParticleSystem.MinMaxCurve(2f, 5f);\n' +
    '        ps.Play();\n' +
    '    }\n' +
    '}\n' +
    '# 命中/受伤时触发\n' +
    '// if (hit) ps.Emit(20);',
};

if (typeof module !== 'undefined') module.exports = { gd11, gd12, gd13, gd14, gd15 };