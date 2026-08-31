// Unity3D 教程 —— 第一部分：工程结构、脚本系统、序列化与运行时基础
module.exports = [
  {
    id: 'unity-overview',
    title: '1. Unity 工程结构与编辑器核心概念',
    category: '编辑器与工程',
    version: 'Unity 2022 LTS+',
    level: '进阶',
    summary: '理解 Assets/Settings/ProjectSettings、Package Manager、Asset Database、序列化机制，才能写出"在 Unity 里正确"的代码。',
    detail: [
      'Unity 工程是"资源 + 设置 + 包"的集合：Assets/ 目录里的所有文件都会进入 AssetDatabase 并被序列化；ProjectSettings/ 保存工程级配置（Graphics Settings、Physics、Input Manager、Tag/Layer 等）；Packages/manifest.json 声明依赖包及其版本（UPM），PackageManager UI 与之双向同步。',
      'Editor 目录约定：在任何 Editor/ 子目录下的脚本只在 Editor 平台编译；它们的程序集默认是 UnityEditor.dll，不会被打包到 Player。这让你可以安全使用 UnityEditor.* API 而不必用 #if UNITY_EDITOR 包裹。',
      'AssetDatabase 是 Editor 端的资源中枢：AssetDatabase.LoadAssetAtPath / CreateAsset / AddObjectToAsset / SaveAssets / Refresh。任何"运行时加载 Resources/ 或 Addressables"的代码都基于它在编辑器阶段生成 GUID、构建依赖图。',
      '理解 Import Settings：每个资源的 Inspector 实际是一个 ScriptedImporter 的可视化面板。纹理导入器会按平台覆盖格式（ASTC/BC/DXT）、Mipmap、最大尺寸；模型导入器控制动画类型（Generic/Humanoid）、Avatar、骨骼映射。生产中不要手动拖 Inspector，要写 .meta 友好的自动化或 AssetPostprocessor 钩子。',
      'URP/HDRP 选择：URP（Universal Render Pipeline）面向移动/中端 PC/Switch；HDRP 面向高端 PC/主机；Built-in 已不推荐新项目。模板工程会写入 GraphicsSettings 的 RenderPipelineAsset 引用，决定 Project Settings → Graphics 的默认管线。',
      'Unity Hub 管理 Editor 多版本，工程要锁 Editor 版本（ProjectVersion.txt）。CI 容器里 Editor 通常用 Unity Hub CLI 或 docker 镜像（如 unityci/editor）。',
      '场景（.unity）、预制体（.prefab）、ScriptableObject（.asset）都是 YAML 文本，可以进 Git、可以 diff。多人协作务必用 Git LFS 或 Plastic SCM。Unity 6 起官方推荐 Unity Version Control（曾经的 Plastic）。'
    ],
    notes: [
      '不要把 Library/、Temp/、obj/ 进 Git，工程根目录的 .gitignore 模板官方已经提供。',
      'Packages/manifest.json 必须进版本控制；Packages/packages-lock.json 可选（锁包版本强烈建议提交）。',
      '修改脚本命名空间或类名要连带改 .meta 文件里的 GUID，否则丢失对资源的引用。'
    ],
    example:
      '# 一个最小可运行的 Unity 工程目录（URP 模板）\n' +
      'MyProject/\n' +
      '├── Assets/\n' +
      '│   ├── Scenes/\n' +
      '│   ├── Scripts/                # 运行时脚本（Assembly-CSharp.dll）\n' +
      '│   ├── Editor/                 # 仅 Editor 平台编译（UnityEditor.dll）\n' +
      '│   ├── Settings/               # URP/HDRP Asset、InputActionAsset 等\n' +
      '│   └── AddressableAssetsData/  # Addressables 设置目录\n' +
      '├── Packages/\n' +
      '│   ├── manifest.json           # 依赖声明\n' +
      '│   └── packages-lock.json      # 锁版本（推荐提交）\n' +
      '├── ProjectSettings/            # Graphics/Physics/Tag/Input 等\n' +
      '├── ProjectVersion.txt          # 当前 Editor 版本\n' +
      '└── UserSettings/\n\n' +
      '# Packages/manifest.json（关键依赖示例）\n' +
      '{\n' +
      '  "dependencies": {\n' +
      '    "com.unity.render-pipelines.universal": "17.0.3",\n' +
      '    "com.unity.inputsystem": "1.11.2",\n' +
      '    "com.unity.addressables": "2.2.2",\n' +
      '    "com.unity.entities": "1.3.14",   // DOTS Entities\n' +
      '    "com.unity.netcode": "2.4.4",     // Netcode for GameObjects\n' +
      '    "com.unity.cinemachine": "3.1.3"\n' +
      '  }\n' +
      '}\n\n' +
      '// 一个会同时在 Editor 与 Player 编译的运行时脚本\n' +
      'using UnityEngine;\n' +
      'public class GameBootstrap : MonoBehaviour\n' +
      '{\n' +
      '    [RuntimeInitializeOnLoadMethod]\n' +
      '    static void OnGameStart()\n' +
      '    {\n' +
      '        Debug.Log($"[Bootstrap] Application.version = {Application.version}");\n' +
      '        Application.targetFrameRate = 60;\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-lifecycle',
    title: '2. MonoBehaviour 生命周期与 Script Execution Order',
    category: '编辑器与工程',
    version: 'Unity 2019.3+',
    level: '进阶',
    summary: '弄清 Awake/OnEnable/Start/Update/FixedUpdate/OnDestroy 的调用时机与执行顺序，才能避免"先于玩家初始化"、"Update 太晚"等玄学 bug。',
    detail: [
      'MonoBehaviour 的生命周期事件按固定顺序触发：Awake → OnEnable → Start → FixedUpdate（每物理步）→ Update（每帧）→ LateUpdate → OnDisable → OnDestroy。Editor 端还有 Reset（仅首次添加组件或手动 Reset 时调用）。',
      'Awake 在脚本实例被加载时调用一次，先于任何 Start，无论脚本是否 enabled。它适合做"自身的初始化"——拿依赖、缓存组件引用、建立事件订阅。注意：Awake 触发时同场景里其他对象的 Awake 可能尚未调用，因此不要在这里访问"别的对象的状态"。',
      'OnEnable 在每次 enable 时调用，包括从 disable 切回 enable。OnDisable 在每次 disable 时调用。订阅/反订阅事件（特别是 C# event / UnityEvent）通常成对放在 OnEnable / OnDisable，而不是 Start / OnDestroy，避免热重载或池化复用时漏掉反订阅造成内存泄漏。',
      'Start 在脚本第一次 Update 之前调用一次，且只在脚本 enabled 时触发。它能保证所有 Awake 都已跑完，所以适合做"依赖其他对象的初始化"。',
      '物理与渲染分离：FixedUpdate 步长由 Time.fixedDeltaTime 控制（默认 0.02s = 50Hz），独立于帧率。所有 Rigidbody 操作（AddForce、移动）必须放在 FixedUpdate，否则受力计算与帧率耦合。Update 做输入读取、相机跟随；LateUpdate 做相机（避免抖动）、跟随逻辑（确保被跟随对象已 Update 完）。',
      'Script Execution Order：在 Project Settings → Script Execution Order 里设置数值（负数先于默认，正数后于默认）。或者用 [DefaultExecutionOrder(int)] 特性标注类级别。典型场景：游戏管理器设为 -100，玩家输入控制器设为 0，UI 响应设为 100。',
      '场景加载：SceneManager.LoadScene 后会按顺序触发新场景对象的 Awake → OnEnable → Start；旧场景对象触发 OnDisable → OnDestroy（若未用 additive 加载）。DontDestroyOnLoad 标记的对象跨场景保留。',
      'Application.quitting 在退出时触发；OnApplicationQuit / OnApplicationPause / OnApplicationFocus 在移动端后台切换时频繁触发，注意区分平台。'
    ],
    notes: [
      '不要在 Update 里反复 GetComponent：用 [SerializeField] 在 Inspector 拖引用，或 Awake 缓存。',
      'Time.deltaTime 在 FixedUpdate 里返回 fixedDeltaTime 而不是上一帧时间。',
      '协程（IEnumerator）会随宿主 MonoBehaviour 被 Destroy / SetActive(false) 而停止；DontDestroyOnLoad 的协程不受场景切换影响。'
    ],
    example:
      'using UnityEngine;\n\n' +
      '// ScriptExecutionOrder 决定类在 Update 链中的相对顺序\n' +
      '[DefaultExecutionOrder(-100)]\n' +
      'public class GameManager : MonoBehaviour\n' +
      '{\n' +
      '    public static GameManager Instance { get; private set; }\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        // 单例：先于玩家控制器执行\n' +
      '        if (Instance != null && Instance != this)\n' +
      '        {\n' +
      '            Destroy(gameObject);\n' +
      '            return;\n' +
      '        }\n' +
      '        Instance = this;\n' +
      '        DontDestroyOnLoad(gameObject);\n' +
      '    }\n\n' +
      '    void OnEnable()  { Debug.Log("[GM] OnEnable"); }\n' +
      '    void Start()     { Debug.Log("[GM] Start —— 此时所有 Awake 都已跑完"); }\n' +
      '    void OnDisable() { Debug.Log("[GM] OnDisable"); }\n' +
      '    void OnDestroy() { Debug.Log("[GM] OnDestroy"); }\n' +
      '}\n\n' +
      'public class Player : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] float moveSpeed = 5f;\n' +
      '    Rigidbody _rb;\n' +
      '    Vector3 _input;\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        _rb = GetComponent<Rigidbody>();\n' +
      '        // 在 Inspector 里拖引用，或用 [RequireComponent] 强制存在\n' +
      '    }\n\n' +
      '    void OnEnable()\n' +
      '    {\n' +
      '        // 成对订阅，避免泄漏\n' +
      '        GameManager.Instance.SomeEvent += HandleEvent;\n' +
      '    }\n\n' +
      '    void OnDisable()\n' +
      '    {\n' +
      '        if (GameManager.Instance != null)\n' +
      '            GameManager.Instance.SomeEvent -= HandleEvent;\n' +
      '    }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        // 每帧读取输入\n' +
      '        _input = new Vector3(Input.GetAxisRaw("Horizontal"), 0, Input.GetAxisRaw("Vertical"));\n' +
      '    }\n\n' +
      '    void FixedUpdate()\n' +
      '    {\n' +
      '        // 物理操作必须放在 FixedUpdate\n' +
      '        _rb.MovePosition(_rb.position + _input.normalized * moveSpeed * Time.fixedDeltaTime);\n' +
      '    }\n\n' +
      '    void LateUpdate()\n' +
      '    {\n' +
      '        // 相机跟随写在 LateUpdate，保证被跟随对象的 Update 已完成\n' +
      '        // Camera.main.transform.position = transform.position + new Vector3(0, 5, -10);\n' +
      '    }\n\n' +
      '    void HandleEvent() { /* ... */ }\n' +
      '}'
  },
  {
    id: 'unity-serialization',
    title: '3. 序列化系统：SerializeField、FormerlySerializedAs、Serializable',
    category: '编辑器与工程',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'Unity 自定义二进制序列化器决定了 Inspector 显示什么、Prefab Override 怎么工作、什么是"可序列化"。',
    detail: [
      'Unity 的"字段序列化器"是独立于 .NET 二进制序列化的专有系统：它只对带 [SerializeField] 的非 public 字段，或 public 字段生效；类型必须是 Unity 可识别的可序列化类型（primitive、string、UnityEngine.Object 引用、数组/列表、struct/class 上 [System.Serializable]）。',
      '私有字段不会被自动序列化，但加 [SerializeField] 后会出现在 Inspector 并被序列化进场景/Prefab。public 字段默认会被序列化——不要图省事把状态全声明为 public，这会让别人能直接修改状态，破坏封装。',
      '[System.Serializable] 让自定义 struct / class 成为可序列化容器；只要它的所有字段也可序列化，Unity 就会在 Inspector 里递归展开。',
      '字段改名会丢失 Inspector 数据：用 [FormerlySerializedAs("oldName")] 标注新字段，告诉序列化器"读旧名字"。改 prefab 改名后用这个特性 + PrefabUtility 迁移工具可避免历史数据丢失。',
      'Dictionary<TKey,TValue> 不被 Unity 序列化（与 .NET BinaryFormatter 不同）；想 Inspector 可视就改用两个并行 List，或者用 Odin Inspector 等第三方序列化器。',
      '序列化与"运行时构造"是两回事：字段是序列化的，但运行时构造顺序（Awake 调用顺序）不保证。避免在字段初始化器里做"假设其他对象已经存在"的操作。',
      '[SerializeReference]（Unity 2019.3+）允许序列化接口/抽象类引用：在 Inspector 里选具体子类实例。常用于依赖注入、ScriptableObject 容器存储多种配置。',
      '[NonSerialized] 显式标记 public 字段不被序列化（节省内存、避免污染 Prefab）。[HideInInspector] 仅在 Inspector 隐藏，仍会被序列化。'
    ],
    notes: [
      '不要把 MonoBehaviour 引用放在静态字段上——静态字段不参与序列化，且场景加载顺序不可预测。',
      'Prefab Override 的本质就是序列化差异：当你修改 Prefab 实例的字段，Unity 存的是"覆盖值"而非重新生成。',
      'Unity 在 Build 时把所有序列化字段写入 Player 数据，反射找不到的字段不参与构建。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using UnityEngine;\n\n' +
      '// 1) Serializable 容器：嵌套结构在 Inspector 中展开\n' +
      '[Serializable]\n' +
      'public class StatBlock\n' +
      '{\n' +
      '    public int hp = 100;\n' +
      '    public int mp = 50;\n' +
      '    public float moveSpeed = 3.5f;\n' +
      '}\n\n' +
      '[Serializable]\n' +
      'public struct LootEntry\n' +
      '{\n' +
      '    public string id;\n' +
      '    public int min, max;\n' +
      '    public float weight;\n' +
      '}\n\n' +
      'public class Enemy : MonoBehaviour\n' +
      '{\n' +
      '    // 2) private + SerializeField：Inspector 可见，外部不能改\n' +
      '    [SerializeField] int _level = 1;\n' +
      '    [SerializeField] StatBlock _stats = new();\n' +
      '    [SerializeField] LootEntry[] _lootTable;\n\n' +
      '    // 3) FormerlySerializedAs：字段改名后保留历史数据\n' +
      '    [SerializeField, FormerlySerializedAs("damage")]\n' +
      '    int _attackDamage;\n\n' +
      '    // 4) SerializeReference：序列化接口/抽象类型\n' +
      '    [Serializable]\n' +
      '    public abstract class AttackBehavior { public abstract void Execute(Enemy self); }\n\n' +
      '    [Serializable]\n' +
      '    public class MeleeAttack : AttackBehavior\n' +
      '    {\n' +
      '        public float range = 1.5f;\n' +
      '        public override void Execute(Enemy self) { /* 近战逻辑 */ }\n' +
      '    }\n\n' +
      '    [Serializable]\n' +
      '    public class RangedAttack : AttackBehavior\n' +
      '    {\n' +
      '        public GameObject projectile;\n' +
      '        public override void Execute(Enemy self) { /* 远程逻辑 */ }\n' +
      '    }\n\n' +
      '    // SerializeReference 让 _attack 可以指向 MeleeAttack 或 RangedAttack 实例\n' +
      '    [SerializeReference] AttackBehavior _attack = new MeleeAttack();\n\n' +
      '    // 5) NonSerialized：public 字段不参与序列化（运行时临时值）\n' +
      '    [NonSerialized] public int RuntimeHp;\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        // _stats.hp 来自 Inspector，运行时再拷一份避免污染 Prefab\n' +
      '        RuntimeHp = _stats.hp;\n' +
      '        _attack?.Execute(this);\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-scriptableobject',
    title: '4. ScriptableObject：数据驱动与配置中心',
    category: '编辑器与工程',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'SO 是脱离场景的数据容器，可作为配置、关卡数据、运行时缓存，让设计师改数据不需要改代码。',
    detail: [
      'ScriptableObject（SO）是 Unity 自带的、可序列化的"非 MonoBehaviour 数据类"：实例作为 .asset 资源存在，工程里可复用、Inspector 可编辑、引用计数可避免实例化浪费内存。',
      '用 [CreateAssetMenu(menuName, fileName)] 特性暴露"Assets/Create"菜单项，让设计师能直接右键创建新配置。SO 的字段定义规则与 MonoBehaviour 完全一致：public + [SerializeField] + [Serializable] 嵌套容器。',
      '运行时缓存：把昂贵数据（怪物图鉴、技能表、关卡参数）放进 SO，运行时一次加载、永远读取。不要在 ScriptableObject 里写"运行时可变状态"，否则所有引用者都会受影响；要可变就再开一个普通类。',
      'SO 之间可以用 [SerializeReference] 组合出"行为策略表"：比如 ItemDatabase 里存一组 EffectStrategy（用 SerializeReference 序列化接口实现），不同 ItemData 引用不同策略，运行时多态派发。',
      '编辑时事件：[OnValidate] 在 Inspector 数值改变、Reload、Undo/Redo 时调用，适合做数据校验、自动 clamp、自动重新生成派生字段。注意它是 Editor 钩子，运行时不会触发。',
      'SO 与 MonoBehaviour 的协作：MonoBehaviour 拖 SO 引用（直接资产拖到字段）；运行时 OnEnable 拿依赖；SO 改变时通过 UnityEvent / 自定义事件通知订阅者重读配置。',
      'Addressables 与 SO：在 Build 时 SO 会被打入 Addressable Group，便于远端更新配置而无需重发整包。'
    ],
    notes: [
      '不要在 ScriptableObject 里持有场景对象引用（如 Transform），SO 不属于场景。',
      'SO 在 Editor 下调用 ScriptableObject.CreateInstance 是允许的，运行时不要用 New（应 LoadAssetAtPath 或 Addressables 加载）。',
      'OnValidate 改字段不会再触发 OnValidate，避免回调循环用 Mathf.Approximately 比较。'
    ],
    example:
      'using UnityEngine;\n' +
      'using System.Collections.Generic;\n\n' +
      '// 1) 可创建的 SO：菜单 → Assets → Create → Game/Skill Data\n' +
      '[CreateAssetMenu(menuName = "Game/Skill Data", fileName = "Skill")]\n' +
      'public class SkillData : ScriptableObject\n' +
      '{\n' +
      '    public string id;\n' +
      '    public string displayName;\n' +
      '    public float cooldown = 1.5f;\n' +
      '    public int damage = 30;\n' +
      '    public Sprite icon;\n' +
      '    public AudioClip castSfx;\n\n' +
      '    [System.Serializable] public class EffectEntry\n' +
      '    {\n' +
      '        public EffectKind kind;\n' +
      '        public float value;\n' +
      '        public float duration;\n' +
      '    }\n' +
      '    public List<EffectEntry> effects = new();\n\n' +
      '    public enum EffectKind { Burn, Freeze, Stun, Heal }\n\n' +
      '    [Header("策划编辑时实时校验")]\n' +
      '    void OnValidate()\n' +
      '    {\n' +
      '        cooldown = Mathf.Max(0.01f, cooldown);\n' +
      '        damage   = Mathf.Max(0, damage);\n' +
      '        if (string.IsNullOrEmpty(id))\n' +
      '            id = name;\n' +
      '    }\n' +
      '}\n\n' +
      '// 2) 数据库：聚合所有技能，提供运行时查询\n' +
      '[CreateAssetMenu(menuName = "Game/Skill Database", fileName = "SkillDatabase")]\n' +
      'public class SkillDatabase : ScriptableObject\n' +
      '{\n' +
      '    public List<SkillData> all = new();\n' +
      '    Dictionary<string, SkillData> _index;\n\n' +
      '    void OnEnable()\n' +
      '    {\n' +
      '        // 运行时构建索引，避免每帧 List.Find\n' +
      '        _index = new Dictionary<string, SkillData>(all.Count);\n' +
      '        foreach (var s in all)\n' +
      '            if (s != null && !_index.ContainsKey(s.id))\n' +
      '                _index[s.id] = s;\n' +
      '    }\n\n' +
      '    public SkillData Get(string id) =>\n' +
      '        _index != null && _index.TryGetValue(id, out var s) ? s : null;\n' +
      '}\n\n' +
      '// 3) 运行时使用：技能系统只读 SO，不改 SO 本身\n' +
      'public class SkillCaster : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] SkillData _skill;          // Inspector 拖\n' +
      '    [SerializeField] SkillDatabase _db;          // 全局库\n' +
      '    float _cooldownLeft;\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        if (_cooldownLeft > 0) _cooldownLeft -= Time.deltaTime;\n' +
      '        if (Input.GetKeyDown(KeyCode.Q) && _cooldownLeft <= 0)\n' +
      '        {\n' +
      '            Cast(_skill);\n' +
      '            _cooldownLeft = _skill.cooldown;\n' +
      '        }\n' +
      '    }\n\n' +
      '    void Cast(SkillData s)\n' +
      '    {\n' +
      '        // 查表替换\n' +
      '        var real = _db.Get(s.id) ?? s;\n' +
      '        Debug.Log($"释放技能 {real.displayName}，伤害 {real.damage}");\n' +
      '        // 触发特效、SFX、网络 RPC 等\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-events',
    title: '5. 事件系统：UnityEvent、C# event、EventBus',
    category: '编辑器与工程',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: '在 Unity 里选对"事件"实现：Inspector 拖线的 UnityEvent、类型安全的 C# event、可全局广播的 EventBus，各有适用场景。',
    detail: [
      'UnityEvent<T> 是可序列化的事件，字段在 Inspector 里可视化拖线，适合策划配置（A 死亡 → 触发 B、C 回调），但有装箱开销和反射调用开销，热路径不要用。',
      'C# event / delegate 是 .NET 原生事件，零开销、强类型：常用于代码内部模块解耦（InputManager → PlayerController、AudioService → UI），订阅/取消订阅成对放在 OnEnable/OnDisable。',
      'EventBus / 消息中心提供全局发布订阅：例如 GameEvents.Publish("OnLevelUp", payload)，任何订阅者都能收到。便于多模块松耦合，缺点是调试栈较深，IDE 重构支持差。可自己手写一个轻量版（基于 Dictionary<Type, List<Action>>），或用第三方库。',
      '避免内存泄漏：所有事件订阅都要在 OnDisable / OnDestroy 里 -=/Clear，否则 GameObject 销毁后回调仍持有引用、目标已被回收，下次事件触发就 NRE 或内存泄漏。',
      'UnityEvent 注意点：泛型参数最多 4 个；运行时 AddListener 不会显示在 Inspector 里；序列化时会序列化订阅目标（场景对象/MonoBehaviour 引用），跨场景时引用会失效。',
      '替代方案：UniRx / R3（响应式扩展）+ Subject；它把事件流变成可组合的 IObservable（过滤、合并、节流）。但响应式范式有学习成本，团队要权衡。'
    ],
    notes: [
      'C# event 是字段，类似 += 和 -= 不能在类外部调用 Invoke。',
      'UnityEvent 序列化在 Build 时反射调用；若想关闭反射开销，用 UnityEventBase 的 Invoke 仍是反射，需要自己写代码绕过。',
      'EventBus 不要把 payload 设成 object，必须用泛型 + Type 索引，避免 cast。'
    ],
    example:
      'using System;\n' +
      'using System.Collections.Generic;\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.Events;\n\n' +
      '// ========== 1) UnityEvent：Inspector 可拖线 ==========\n' +
      '[Serializable]\n' +
      'public class IntUnityEvent : UnityEvent<int> {}\n\n' +
      'public class Health : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] IntUnityEvent onDamaged = new();   // Inspector 拖 PlayerAudio.OnDamage\n' +
      '    public UnityEvent<int> OnDamaged => onDamaged;\n' +
      '    int _hp = 100;\n\n' +
      '    public void TakeDamage(int dmg)\n' +
      '    {\n' +
      '        _hp -= dmg;\n' +
      '        onDamaged.Invoke(dmg);    // 策划拖的回调被触发\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 2) C# event：强类型、零开销 ==========\n' +
      'public class DamageService : MonoBehaviour\n' +
      '{\n' +
      '    public event Action<int> Damaged;     // 类型安全\n' +
      '    public void Deal(int dmg) => Damaged?.Invoke(dmg);\n' +
      '}\n\n' +
      'public class DamageLogger : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] DamageService _src;\n' +
      '    void OnEnable()  { _src.Damaged += Log; }\n' +
      '    void OnDisable() { _src.Damaged -= Log; }\n' +
      '    void Log(int dmg) => Debug.Log($"[Logger] 受到 {dmg} 点伤害");\n' +
      '}\n\n' +
      '// ========== 3) EventBus：全局发布订阅 ==========\n' +
      'public static class EventBus\n' +
      '{\n' +
      '    static readonly Dictionary<Type, List<object>> _subs = new();\n\n' +
      '    public static void Subscribe<T>(Action<T> handler)\n' +
      '    {\n' +
      '        if (!_subs.TryGetValue(typeof(T), out var list))\n' +
      '            _subs[typeof(T)] = list = new List<object>();\n' +
      '        list.Add(handler);\n' +
      '    }\n' +
      '    public static void Unsubscribe<T>(Action<T> handler)\n' +
      '    {\n' +
      '        if (_subs.TryGetValue(typeof(T), out var list))\n' +
      '            list.Remove(handler);\n' +
      '    }\n' +
      '    public static void Publish<T>(T payload)\n' +
      '    {\n' +
      '        if (!_subs.TryGetValue(typeof(T), out var list)) return;\n' +
      '        // 拷贝一份：避免回调内订阅/反订阅破坏遍历\n' +
      '        var copy = list.ToArray();\n' +
      '        foreach (var obj in copy)\n' +
      '            ((Action<T>)obj).Invoke(payload);\n' +
      '    }\n' +
      '}\n\n' +
      '// 用法：领域事件\n' +
      'public readonly struct PlayerLevelUp { public readonly int Level; public PlayerLevelUp(int l) => Level = l; }\n\n' +
      'public class LevelSystem : MonoBehaviour\n' +
      '{\n' +
      '    int _lv = 1;\n' +
      '    public void GainXp(int xp) { if (xp > 100) EventBus.Publish(new PlayerLevelUp(++_lv)); }\n' +
      '}\n\n' +
      'public class AchievementSystem : MonoBehaviour\n' +
      '{\n' +
      '    void OnEnable()  { EventBus.Subscribe<PlayerLevelUp>(OnLevelUp); }\n' +
      '    void OnDisable() { EventBus.Unsubscribe<PlayerLevelUp>(OnLevelUp); }\n' +
      '    void OnLevelUp(PlayerLevelUp e) => Debug.Log($"[成就] 玩家升到 {e.Level} 级");\n' +
      '}'
  },
  {
    id: 'unity-addressables',
    title: '6. Addressables：异步加载、远端分发与依赖管理',
    category: '资源与构建',
    version: 'Addressables 1.21+',
    level: '进阶',
    summary: 'Addressables 是 Unity 推荐的资源管理方案：异步加载、按 Key 引用、ContentUpdate 远端下发，解决 Resources 加载方式的全部痛点。',
    detail: [
      'Resources/ 路径加载的三大问题：① 同步加载（Load 阻塞主线程）；② 无法卸载（Resources.UnloadUnusedAssets 才能清理）；③ 无法分包/远端更新。Addressables 用异步句柄 + Address 自动管理引用计数，彻底解决。',
      '核心概念：Address 是字符串 Key（如 "Characters/Hero"），可指向本地或远端 Group；AssetReference 强类型包装（编译期类型校验）；AsyncOperationHandle<T> 是加载句柄。',
      '三种加载方式：① Addressables.LoadAssetAsync<T>(key)；② Addressables.InstantiateAsync(key, parent) 实例化 GameObject；③ 通过 AssetReferenceT<T> 字段在 Inspector 拖入。',
      '引用计数：每次 LoadAssetAsync 让 ref++，Release 让 ref--；当 ref==0 时 Addressables 卸载底层资源。GameObject 用 InstantiateAsync 时必须显式 Release(instance) 才能销毁。',
      'Group 配置：每个 Group 决定打包方式（Bundle Packing、Asset/Scene）、加载策略（Local/Remote）、构建目标（Standalone、Android、iOS）。Build → New Build → Default Build Script 生成 catalog 和 .bundle。',
      'ContentUpdate：首次构建产生完整 catalog，后续增量构建产生 patch catalog，可放到 CDN，玩家端自动下载增量而不必重装整包。常用于热更新美术资源、关卡、配置。',
      'Profiler：Window → Asset Management → Addressables Event Viewer 看每次加载/释放；AddressableAssetSettings → Inspectors → Event Collect 开启埋点。'
    ],
    notes: [
      '异步加载不等于不卡顿：第一次加载仍可能触发 Shader.Parse、Texture upload，要预热。',
      '同一 Address 不能同时在 Local 和 Remote Group，否则 Build 会冲突。',
      'Resource Locator 在启动时加载，地址名改动必须在 Build 时同步所有引用方，否则旧 Player 找不到资源。'
    ],
    example:
      'using UnityEngine;\n' +
      'using UnityEngine.AddressableAssets;\n' +
      'using UnityEngine.ResourceManagement.AsyncOperations;\n\n' +
      'public class HeroLoader : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] AssetReferenceGameObject _heroRef;   // Inspector 拖\n' +
      '    AsyncOperationHandle<GameObject> _preloadHandle;\n' +
      '    GameObject _spawned;\n\n' +
      '    async void Start()\n' +
      '    {\n' +
      '        // 1) 预加载（不实例化）：常用于切换场景前预热\n' +
      '        _preloadHandle = _heroRef.LoadAssetAsync<GameObject>();\n' +
      '        await _preloadHandle.Task;\n' +
      '        if (_preloadHandle.Status != AsyncOperationStatus.Succeeded)\n' +
      '        {\n' +
      '            Debug.LogError($"加载失败：{_preloadHandle.OperationException}");\n' +
      '            return;\n' +
      '        }\n' +
      '        Spawn();\n' +
      '    }\n\n' +
      '    void Spawn()\n' +
      '    {\n' +
      '        // 2) 实例化（Addressables.InstantiateAsync 内部 ref++）\n' +
      '        _spawned = Instantiate(_preloadHandle.Result, transform);\n' +
      '    }\n\n' +
      '    void OnDestroy()\n' +
      '    {\n' +
      '        // 3) 释放顺序：先销毁实例，再释放 Asset\n' +
      '        if (_spawned != null) Destroy(_spawned);\n' +
      '        if (_preloadHandle.IsValid()) Addressables.Release(_preloadHandle);\n' +
      '    }\n\n' +
      '    // ========== 进阶：按字符串 Key 加载 + 进度回调 ==========\n' +
      '    public void LoadWithProgress(string address)\n' +
      '    {\n' +
      '        var handle = Addressables.LoadAssetAsync<Sprite>(address);\n' +
      '        handle.Completed += op => Debug.Log($"完成：{op.Result?.name}");\n' +
      '        // 轮询进度（Coroutine 或 async/await 都行）\n' +
      '        StartCoroutine(Watch(handle));\n' +
      '    }\n' +
      '    System.Collections.IEnumerator Watch(AsyncOperationHandle<Sprite> h)\n' +
      '    {\n' +
      '        while (!h.IsDone)\n' +
      '        {\n' +
      '            // PercentComplete 在内部是 0~1 浮点\n' +
      '            Debug.Log($"进度 {h.PercentComplete:P0}");\n' +
      '            yield return null;\n' +
      '        }\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-coroutines-vs-async',
    title: '7. 协程 vs async/await vs UniTask',
    category: '编辑器与工程',
    version: 'Unity 2021+ / UniTask',
    level: '进阶',
    summary: 'Unity 协程历史悠久但能力有限；async/await 是官方主推；UniTask 是社区高替，三者用于不同场景。',
    detail: [
      '协程（IEnumerator + StartCoroutine）：基于 yield return 的协程，本质是 Unity 主线程的语法糖。优点：写法直观、自动跟随 Time.timeScale；缺点：不能跨线程、不能返回值（要用回调）、依赖 MonoBehaviour（GameObject 销毁就停止）、不支持异常堆栈完整捕获。',
      'async/await：Unity 2017 起官方支持 TaskAwaiter，async void 仅用于事件处理，其他都返回 Task / ValueTask。可与 await Task.Yield()、await Awaitable.NextFrameAsync()（2023+）、await Awaitable.WaitForSecondsAsync() 配合。注意：Unity 的 await 默认在 UnitySynchronizationContext（主线程）继续，跨线程操作要 Task.Run。',
      'UniTask（社区库）：零分配的 async/await，针对 Unity 优化。提供 UniTask.Yield()、UniTask.Delay()、UniTask.WaitUntil()、WhenAny/WhenAll 等。优势是 GC 压力极小（UnityEngine.Pool 池化），适合移动端性能敏感场景。',
      '协程的典型用法：UI 渐变、动画等待、动作序列（move → wait → fade）。协程无法返回结果给调用方，但内部用类字段"传出"或包装成 IEnumerator 让外部遍历。',
      'async/await 适用：复杂的异步链（加载 → 实例化 → 初始化 → 完成回调），可以用 try/catch 捕获异常，可以 await Task.WhenAll 并发加载多个资源。',
      '取消支持：async/await 用 CancellationToken，UniTask 提供 GetCancellationTokenOnDestroy()（随 GameObject 销毁自动取消），避免悬挂任务。UniTask 的 cancellation 比纯 Task 更"游戏友好"。'
    ],
    notes: [
      'UniTask 要从 GitHub 引入 package（github.com/Cysharp/UniTask）或 openupm。',
      '不要在协程里 yield return new WaitForSeconds(0) —— 会死循环；用 null 或 yield break。',
      'async void 在异常时会直接抛到 Unity 主循环挂掉；非事件请返回 Task。'
    ],
    example:
      'using UnityEngine;\n' +
      'using System.Threading;\n' +
      'using System.Threading.Tasks;\n' +
      '// using Cysharp.Threading.Tasks;  // UniTask\n\n' +
      'public class AsyncPatterns : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] float duration = 1.5f;\n' +
      '    CancellationTokenSource _cts;\n\n' +
      '    void OnEnable() { _cts = new CancellationTokenSource(); }\n' +
      '    void OnDisable() { _cts?.Cancel(); _cts?.Dispose(); _cts = null; }\n\n' +
      '    // ========== 1) 协程 ==========\n' +
      '    System.Collections.IEnumerator FadeCo()\n' +
      '    {\n' +
      '        var img = GetComponent<SpriteRenderer>();\n' +
      '        for (float t = 0; t < duration; t += Time.deltaTime)\n' +
      '        {\n' +
      '            var c = img.color;\n' +
      '            c.a = Mathf.Lerp(1, 0, t / duration);\n' +
      '            img.color = c;\n' +
      '            yield return null;\n' +
      '        }\n' +
      '    }\n\n' +
      '    // ========== 2) async/await（Unity 2023+ Awaitable） ==========\n' +
      '    async Task FadeAsync(CancellationToken ct)\n' +
      '    {\n' +
      '        var img = GetComponent<SpriteRenderer>();\n' +
      '        var start = Time.unscaledTime;\n' +
      '        while (Time.unscaledTime - start < duration)\n' +
      '        {\n' +
      '            ct.ThrowIfCancellationRequested();\n' +
      '            var c = img.color;\n' +
      '            c.a = Mathf.Lerp(1, 0, (Time.unscaledTime - start) / duration);\n' +
      '            img.color = c;\n' +
      '            await Awaitable.NextFrameAsync(ct);\n' +
      '        }\n' +
      '    }\n\n' +
      '    async void Start()\n' +
      '    {\n' +
      '        try\n' +
      '        {\n' +
      '            await FadeAsync(_cts.Token);\n' +
      '            Debug.Log("淡出完成");\n' +
      '        }\n' +
      '        catch (System.OperationCanceledException) { /* 正常取消 */ }\n' +
      '        catch (System.Exception e) { Debug.LogException(e); }\n' +
      '    }\n\n' +
      '    // ========== 3) UniTask 版（仅展示写法，需安装 UniTask） ==========\n' +
      '    /*\n' +
      '    async UniTaskVoid FadeUniTask()\n' +
      '    {\n' +
      '        var ct = this.GetCancellationTokenOnDestroy();\n' +
      '        var img = GetComponent<SpriteRenderer>();\n' +
      '        var t = 0f;\n' +
      '        while (t < duration)\n' +
      '        {\n' +
      '            t += Time.deltaTime;\n' +
      '            var c = img.color; c.a = 1 - t / duration; img.color = c;\n' +
      '            await UniTask.Yield(ct);\n' +
      '        }\n' +
      '    }\n' +
      '    */\n' +
      '}'
  }
];