// Unity3D 教程 —— 第四部分：DOTS / Job System / Netcode / 性能优化 / 构建 / 自动化测试
module.exports = [
  {
    id: 'unity-jobs-burst',
    title: '21. Job System 与 Burst：高性能多线程与 SIMD 加速',
    category: '性能与 DOTS',
    version: 'Unity 2022 LTS+ / Burst 1.8+',
    level: '进阶',
    summary: 'Job System 让你把可并行的工作卸载到 Worker Thread；Burst 把 IL 编译成高度优化原生代码，二者结合能让数学密集循环快几十倍。',
    detail: [
      'Job System：Unity 自带的多线程调度器，把数据并行拆成多个 IJob / IJobParallelFor / IJobParallelForTransform。Job 通过 Schedule/ScheduleParallel 提交到 Worker Thread，主线程通过 Handle.Complete() 同步。',
      'NativeContainer：Job 不能用 C# 引用类型，必须用 NativeArray<T> / NativeList<T> / NativeHashMap<T,V>。它们是 unmanaged 内存块，带 [NativeContainer] 特性，自动做依赖追踪与安全检查（未 Complete 访问会抛 InvalidOperationException）。',
      '[NativeDisableParallelForRestriction]：在 IJobParallelFor 里禁用 parallel safety 检查，因为某些操作本身安全（如只读取邻居单元）。',
      'Burst Compiler：[BurstCompile] 标注 IJob 或方法，Unity 把 IL 编译成 LLVM 中间码再转 x64/ARM64 SIMD 指令。数学循环通常能 5x~30x 加速，但不能用引用类型、虚函数、托管堆分配。',
      'IJobParallelForFilter / IJobChunk：处理 ECS Entity Chunk 数据；用于 Unity Physics、DOTS Netcode 的批量计算。',
      'TransformJob：IJobParallelForTransform 并行修改 Transform；新版 DOTS 用 LocalTransform 代替 Transform 数据，避免主线程同步。',
      'Allocator：Allocator.Temp（1 帧）、Allocator.TempJob（4 帧）、Allocator.Persistent（手动 Dispose）。NativeArray 必须对应 Dispose()，否则泄漏。',
      'JobHandle 依赖图：Unity 自动构建 Job 依赖链（A 写完后才能 B 读），无需手写锁。'
    ],
    notes: [
      'Job 内不能访问 managed 对象、不能 Debug.Log（除非用 Unity.Logging，Unity 6 起），不能访问 ThreadStatic 静态变量。',
      'NativeArray<int> 用 struct 时不能含引用类型；用 [BurstCompile] 的 struct 不能继承或装箱。',
      'Burst Debug 用 [BurstCompile(OptimizeFor = OptimizeFor.Debug)] + Burst Inspector 看反汇编。'
    ],
    example:
      'using Unity.Burst;\n' +
      'using Unity.Collections;\n' +
      'using Unity.Jobs;\n' +
      'using Unity.Mathematics;\n' +
      'using UnityEngine;\n\n' +
      '// 1) IJob：单任务并行（比如把一批点的颜色按亮度排序）\n' +
      '[BurstCompile]\n' +
      'public struct SaturateColorsJob : IJob\n' +
      '{\n' +
      '    public NativeArray<float4> colors;\n' +
      '    public float amount;\n\n' +
      '    public void Execute()\n' +
      '    {\n' +
      '        for (int i = 0; i < colors.Length; i++)\n' +
      '        {\n' +
      '            var c = colors[i];\n' +
      '            float3 rgb = c.xyz;\n' +
      '            float lum = math.dot(rgb, new float3(0.2126f, 0.7152f, 0.0722f));\n' +
      '            rgb = math.lerp(rgb, lum.xxx, amount);\n' +
      '            colors[i] = new float4(rgb, c.w);\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      '// 2) IJobParallelFor：批量并行（比如大批量粒子位置更新）\n' +
      '[BurstCompile]\n' +
      'public struct UpdateParticlesJob : IJobParallelFor\n' +
      '{\n' +
      '    public NativeArray<float3> positions;\n' +
      '    public NativeArray<float3> velocities;\n' +
      '    public float dt;\n' +
      '    public float3 gravity;\n\n' +
      '    public void Execute(int i)\n' +
      '    {\n' +
      '        velocities[i] += gravity * dt;\n' +
      '        positions[i]  += velocities[i] * dt;\n' +
      '    }\n' +
      '}\n\n' +
      '// 3) 在主线程提交\n' +
      'public class JobDispatcher : MonoBehaviour\n' +
      '{\n' +
      '    NativeArray<float3> _pos, _vel;\n' +
      '    const int N = 10_000;\n\n' +
      '    void Start()\n' +
      '    {\n' +
      '        _pos = new NativeArray<float3>(N, Allocator.Persistent);\n' +
      '        _vel = new NativeArray<float3>(N, Allocator.Persistent);\n' +
      '        for (int i = 0; i < N; i++) { _pos[i] = i; _vel[i] = 0; }\n' +
      '    }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        var job = new UpdateParticlesJob\n' +
      '        {\n' +
      '            positions = _pos,\n' +
      '            velocities = _vel,\n' +
      '            dt = Time.deltaTime,\n' +
      '            gravity = new float3(0, -9.8f, 0)\n' +
      '        };\n' +
      '        // 64 批次，调度到多核\n' +
      '        JobHandle handle = job.Schedule(N, 64);\n' +
      '        handle.Complete(); // 主线程同步\n' +
      '    }\n\n' +
      '    void OnDestroy()\n' +
      '    {\n' +
      '        if (_pos.IsCreated) _pos.Dispose();\n' +
      '        if (_vel.IsCreated) _vel.Dispose();\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-dots-entities',
    title: '22. DOTS / Entities 1.x：面向数据的 ECS 框架',
    category: '性能与 DOTS',
    version: 'Entities 1.3+',
    level: '进阶',
    summary: 'DOTS Entities 是 Unity 官方的高密度数据栈：Entity + ComponentData + SystemBase，适合上万同质对象（RTS 单位、子弹、群演、粒子）。',
    detail: [
      'ECS 三件套：Entity（轻量 ID）、ComponentData（struct 数据）、System（行为）。数据与逻辑分离，与传统 GameObject/MonoBehaviour 模式彻底不同。',
      'Authoring → Baking：先用 GameObject/MonoBehaviour 在 Editor 写 Authoring 组件（带 Baker 特性），Entities 在 SubScene Build 时把 Authoring 转成 Entity + ComponentData。运行时不再有 GameObject。',
      'ISystem vs SystemBase：ISystem 是 unmanaged System（struct，可 Burst 编译），首选；SystemBase 是 managed 类（保留 MonoBehaviour 风格，但性能差）。',
      'Query：System 里用 SystemAPI.Query<RefRW<Position>, RefRO<Velocity>>().WithAll<Player>() 等获得实体集合。Burst 自动向量化数据访问。',
      'IJobEntity / IJobChunk：在 ECS 里写 Job 系统，把 N 个实体批量处理。IJobEntity 自动展开为 IJobParallelFor。',
      'Structural Changes：增删组件 / 创建销毁 Entity 会引起 Chunk 移动，是 ECS 最贵的操作。用 EntityCommandBuffer（EntityCommandBufferSystem）延迟到 Sync Point 提交，避免中途打断 Job。',
      'Unity Physics（DOTS 物理）：与 PhysX 不同，全 ECS 数据；性能极好但功能在迭代中，多数项目混用 ECS 战斗 + MonoBehaviour 角色控制器。',
      'Netcode for Entities：DOTS 的网络库，与 Entities 深度集成，支持客户端预测 + 服务器权威。'
    ],
    notes: [
      'Entities API 在 1.0 后还有较大变动，旧 API 文档要确认版本。',
      'MonoBehaviour 与 ECS 混用没问题：UI、Cinemachine、传统逻辑放 MonoBehaviour，性能瓶颈部分（粒子、AI 群组、战斗实体）放 ECS。',
      'SubScene 是 Entities 数据容器，打开 SubScene 编辑，关闭时只有 Authoring 数据。'
    ],
    example:
      'using Unity.Burst;\n' +
      'using Unity.Entities;\n' +
      'using Unity.Mathematics;\n' +
      'using Unity.Transforms;\n\n' +
      '// 1) ComponentData：纯数据\n' +
      'public struct Velocity : IComponentData\n' +
      '{\n' +
      '    public float3 value;\n' +
      '}\n\n' +
      'public struct Lifetime : IComponentData\n' +
      '{\n' +
      '    public float remaining;\n' +
      '}\n\n' +
      '// 2) ISystem：每帧移动 + 寿命衰减\n' +
      '[BurstCompile]\n' +
      'public partial struct MoveSystem : ISystem\n' +
      '{\n' +
      '    [BurstCompile]\n' +
      '    public void OnCreate(ref SystemState s) { }\n' +
      '    [BurstCompile]\n' +
      '    public void OnDestroy(ref SystemState s) { }\n\n' +
      '    [BurstCompile]\n' +
      '    public void OnUpdate(ref SystemState s)\n' +
      '    {\n' +
      '        float dt = SystemAPI.Time.DeltaTime;\n' +
      '        // ISystem 自动迭代所有含 LocalTransform + Velocity 的 Entity\n' +
      '        foreach (var (transform, vel) in\n' +
      '                 SystemAPI.Query<RefRW<LocalTransform>, RefRO<Velocity>>())\n' +
      '        {\n' +
      '            transform.ValueRW.Position += vel.ValueRO.value * dt;\n' +
      '        }\n' +
      '        // 寿命衰减（IJobEntity 写法）\n' +
      '        new DecayLifeJob { dt = dt }.ScheduleParallel();\n' +
      '    }\n' +
      '}\n\n' +
      '[BurstCompile]\n' +
      'public partial struct DecayLifeJob : IJobEntity\n' +
      '{\n' +
      '    public float dt;\n' +
      '    public void Execute(Entity e, ref Lifetime l, EnabledRefRW<Lifetime> enabled)\n' +
      '    {\n' +
      '        l.remaining -= dt;\n' +
      '        if (l.remaining <= 0) enabled.ValueRW = false; // 启用组件 = false\n' +
      '    }\n' +
      '}\n\n' +
      '// 3) Authoring 组件（编辑器里挂 GameObject）\n' +
      'public class VelocityAuthoring : UnityEngine.MonoBehaviour\n' +
      '{\n' +
      '    public float3 initial = new(0, 0, 5f);\n' +
      '    public class Baker : Baker<VelocityAuthoring>\n' +
      '    {\n' +
      '        public override void Bake(VelocityAuthoring a)\n' +
      '        {\n' +
      '            var e = GetEntity(TransformUsageFlags.Dynamic);\n' +
      '            AddComponent(e, new Velocity { value = a.initial });\n' +
      '            AddComponent(e, new Lifetime { remaining = 3f });\n' +
      '        }\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-netcode',
    title: '23. Netcode for GameObjects：联机服务器、RPC 与 NetworkVariable',
    category: '联机与网络',
    version: 'Netcode 2.x',
    level: '进阶',
    summary: 'NGO 是 Unity 官方的 MonoBehaviour 风格网络方案，提供 NetworkObject、RPC、NetworkVariable 与 NetworkBehaviour，本地多人/小规模联机常用。',
    detail: [
      'NetworkManager：联机核心，配置 Transport（Unity Transport、UTP）、连接管理、服务器/客户端/主机模式（Host = Server + Client）。',
      'NetworkObject：每个联网 GameObject 必须挂；它有 NetworkObjectId（全局唯一），通过 Spawn/Despawn 控制出生与销毁。',
      'NetworkBehaviour：与 NetworkObject 配对，提供 IsOwner / IsServer / IsClient / IsHost 等判定；同步逻辑写在这里。',
      'NetworkVariable<T>：服务器权威的同步变量。服务器写入、自动同步到所有观察者；客户端只读。INetworkSerializable + INetworkSerializeByMemcpy 支持自定义结构。',
      'RPC：[Rpc(SendTo.Server)] / [Rpc(SendTo.NotOwner)] 等特性，替代旧版的 [ServerRpc] / [ClientRpc]。SendTo.Owner、SendTo.NotServer、SendTo.NotMe、SendTo.Everyone 等精细控制。',
      'NetworkTransform：组件式同步 Transform；可设 Interpolation（线性 / Hermite）、Threshold（低于阈值不发送）、SyncScale、SyncPosition、SyncRotation。',
      'NetworkAnimator：同步 Animator 状态到所有客户端（注意：它发的是参数与触发器，不是动画本身）。',
      '预测与回滚（Lag Compensation）：NGO 提供 ClientNetworkTransform 的预测模式（客户端先动再确认），适合 FPS / TPS。高级场景用 Netcode for Entities（专门的 ECS 网络库）。'
    ],
    notes: [
      'NetworkVariable 在 OnValueChanged 回调里要小心，频繁写入会触发频繁同步（默认 30Hz，可调 TickRate）。',
      'RPC 只能传 [Serializable] 数据或 INetworkSerializable；不能传 GameObject 直接引用，要传 NetworkObjectReference。',
      'Host 是 Server + Client 同进程，本地双人合作最简单方案。'
    ],
    example:
      'using Unity.Netcode;\n' +
      'using UnityEngine;\n\n' +
      'public class NetGameBootstrap : MonoBehaviour\n' +
      '{\n' +
      '    void OnGUI()\n' +
      '    {\n' +
      '        var nm = NetworkManager.Singleton;\n' +
      '        if (nm == null) return;\n' +
      '        if (!nm.IsClient && !nm.IsServer)\n' +
      '        {\n' +
      '            if (GUI.Button(new Rect(10, 10, 120, 30), "Host"))   nm.StartHost();\n' +
      '            if (GUI.Button(new Rect(10, 50, 120, 30), "Server")) nm.StartServer();\n' +
      '            if (GUI.Button(new Rect(10, 90, 120, 30), "Client")) nm.StartClient();\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      'public class PlayerHealth : NetworkBehaviour\n' +
      '{\n' +
      '    // 服务器权威：客户端写入会被忽略\n' +
      '    public NetworkVariable<int> Hp = new(\n' +
      '        value: 100,\n' +
      '        readPerm: NetworkVariableReadPermission.Everyone,\n' +
      '        writePerm: NetworkVariableWritePermission.Server);\n\n' +
      '    public override void OnNetworkSpawn()\n' +
      '    {\n' +
      '        Hp.OnValueChanged += (oldV, newV) => Debug.Log($"HP {oldV} -> {newV}");\n' +
      '    }\n\n' +
      '    // 客户端调 → 发到服务器 → 服务器改 Hp\n' +
      '    [Rpc(SendTo.Server, RequireOwnership = false)]\n' +
      '    public void ApplyDamageRpc(int dmg)\n' +
      '    {\n' +
      '        Hp.Value = Mathf.Max(0, Hp.Value - dmg);\n' +
      '        if (Hp.Value == 0)\n' +
      '            NetworkObject.Despawn(true);\n' +
      '    }\n\n' +
      '    // 服务端广播给所有人\n' +
      '    [Rpc(SendTo.Everyone)]\n' +
      '    public void BroadcastHitRpc(string playerName, int dmg)\n' +
      '    {\n' +
      '        Debug.Log($"{playerName} 受到 {dmg} 点伤害");\n' +
      '    }\n' +
      '}\n\n' +
      '// 客户端触发受击\n' +
      'public class AttackTrigger : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] PlayerHealth _target;\n' +
      '    void OnMouseDown()\n' +
      '    {\n' +
      '        _target.ApplyDamageRpc(10);   // 不需要 IsOwner 检查\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-profiling',
    title: '24. 性能与 Profiling：Profiler、Memory Profiler、Frame Debugger',
    category: '性能与 DOTS',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: '优化前先测量：CPU Profiler 看每帧函数耗时，Memory Profiler 看 GC 分配与内存碎片，Frame Debugger 看 GPU 渲染状态。',
    detail: [
      'Profiler 三大模块：① CPU Usage（最常用，主线程/Render Thread/Job 各看占用时间）；② GPU Usage（GPU 渲染耗时）；③ Memory（托管堆与 native 内存）。',
      'CPU Profiler：选一帧放大，能看到 MonoBehaviour.Update、Awake、Job、JobHandle.Complete 等。Hierarchy 视图按耗时排序，深嵌套（Nested）能定位"哪段调用谁"。',
      'Deep Profile：开启后所有方法都被记录，开销很大；只在找具体函数时用。',
      'GC.Alloc：Profiler 显示红条代表产生托管堆分配。常见来源：string + 拼接、闭包、Linq、new List<> / new Dictionary<>、装箱（valueType 当 object）。',
      'Memory Profiler：Window → Analysis → Memory Profiler 拍快照。能看到托管堆 Native 内存对象（Texture、Mesh、AudioClip），查找泄漏。Diff 两帧看新增对象。',
      'Frame Debugger：Window → Analysis → Frame Debugger 看每个 Draw Call、SetPass、绑定什么 Material、什么 Shader Pass、Mesh、Batcher 路径。',
      '常见指标：① 帧时间（16.67ms @60fps、33.33ms @30fps）；② GC 次数（每帧 0 次才合格）；③ DrawCall 数量（千级别以上要合批）；④ Batches（SRP Batcher / GPU Instancing 占比）。',
      'Stats 窗口（Game View 右上角）实时显示 Batches / SetPass / Tris / Vert，看大体趋势。'
    ],
    notes: [
      'Profiler 在 IL2CPP / Development Build 才有意义；Release Build 默认不带 Profiler。',
      'iOS / Android 用 Profiler.BeginSample/EndSample 给自定义代码块打点，在 Profiler 中显示自定义名字。',
      'ScriptableObject 不能释放（Lifetime = 永久），占用内存会一直涨，要及时清理持有引用。'
    ],
    example:
      'using UnityEngine;\n' +
      'using Unity.Profiling;\n\n' +
      'public class ProfiledHotPath : MonoBehaviour\n' +
      '    {\n' +
      '        // ProfilerMarker 静态字段，避免每帧分配\n' +
      '        static readonly ProfilerMarker _markerUpdate =\n' +
      '            new("MyGame.Combat.UpdateAll");\n' +
      '        static readonly ProfilerMarker _markerAi =\n' +
      '            new("MyGame.Combat.AI");\n\n' +
      '        void Update()\n' +
      '        {\n' +
      '            using (_markerUpdate.Auto())\n' +
      '            {\n' +
      '                CombatIteration();\n' +
      '            }\n' +
      '        }\n' +
      '        void CombatIteration()\n' +
      '        {\n' +
      '            using (_markerAi.Auto()) { /* AI 决策 */ }\n' +
      '        }\n' +
      '    }\n\n' +
      '// ProfilerCounter：自定义指标（统计到 Profiler 窗口）\n' +
      'public class DamageProfiler : MonoBehaviour\n' +
      '{\n' +
      '    static readonly ProfilerCounterValue<int> _damageCounter = new(\n' +
      '        ProfilerCategory.Scripts,\n' +
      '        "Damage Events",\n' +
      '        ProfilerMarkerDataUnit.Count,\n' +
      '        ProfilerCounterOptions.FlushOnEndOfFrame | ProfilerCounterOptions.ResetToZeroOnFlush);\n\n' +
      '    public static void RecordDamage(int dmg)\n' +
      '        => _damageCounter.Value += dmg;\n' +
      '}'
  },
  {
    id: 'unity-memory-management',
    title: '25. 内存管理：GC、对象池、NativeContainer 与 GPU 内存',
    category: '性能与 DOTS',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: '托管堆 GC 是手游卡顿头号元凶；用对象池、NativeArray、struct、按值传参压住分配。',
    detail: [
      'GC 触发条件：Mono 堆达到阈值（不同平台约 2~16MB）后触发；会 STW（Stop-The-World），所有主线程代码暂停几百微秒到几十毫秒。手游一帧 16.6ms，GC 几次就掉帧。',
      '避免分配：① 字符串用 StringBuilder 复用；② List<T> 用 Clear() + 复 capacity；③ Dictionary 同样；④ 循环里别 new；⑤ 用 struct + ref/传递；⑥ LINQ 是分配 + 装箱重灾区，热路径禁用。',
      '对象池：GameObjectPool、UnityEngine.Pool.ObjectPool<T>（Unity 2021+）。实例化代价高的对象（子弹、特效、敌人）必须池化。',
      'NativeArray / NativeList / NativeHashMap：用 Unity.Collections 命名空间，分配 unmanaged 内存，零 GC。前提是遵守 Dispose 规则。',
      'Texture / Mesh 上传：Texture2D.Apply()、Mesh.SetVertices + SetIndices 触发 GPU 上传，频繁上传会引起卡顿。Texture Streaming（Project Settings → Graphics）让大纹理按需加载。',
      'Resources.UnloadUnusedAssets：异步回收未引用资源，但开销大；Addressables.Release 才是更细粒度的做法。',
      'Profiler Allocator：Profiler.GetTotalAllocatedMemoryLong() 看当前分配量；Memory Profiler → 找 1MB+ 对象。'
    ],
    notes: [
      '不要每帧 GameObject.Find 或 GameObject.FindGameObjectsWithTag——这是 N×N 的 GC + 性能灾难。',
      'TextMeshPro 的 TMP_Text.SetText(stringBuilder) 比 TMP_Text.text = s 好得多。',
      'Awaitable / async 在 Unity 2023+ 避免装箱；UniTask 零分配。'
    ],
    example:
      'using System.Collections.Generic;\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.Pool;\n\n' +
      '// 1) 通用对象池（Unity 2021+ ObjectPool<T>）\n' +
      'public class BulletPool\n' +
      '{\n' +
      '    GameObject _prefab;\n' +
      '    ObjectPool<GameObject> _pool;\n\n' +
      '    public BulletPool(GameObject prefab, int defaultCapacity = 16, int max = 64)\n' +
      '    {\n' +
      '        _prefab = prefab;\n' +
      '        _pool = new ObjectPool<GameObject>(\n' +
      '            createFunc:  () => Object.Instantiate(_prefab),\n' +
      '            onGet:       go => go.SetActive(true),\n' +
      '            onRelease:   go => go.SetActive(false),\n' +
      '            onDestroy:   go => Object.Destroy(go),\n' +
      '            collectionCheck: false,\n' +
      '            defaultCapacity: defaultCapacity,\n' +
      '            maxSize:         max);\n' +
      '    }\n' +
      '    public GameObject Get(Vector3 pos) { var b = _pool.Get(); b.transform.position = pos; return b; }\n' +
      '    public void Release(GameObject b) => _pool.Release(b);\n' +
      '}\n\n' +
      '// 2) 高频结构体（避免堆分配）\n' +
      'public struct HitInfo { public Entity Victim; public int Damage; }\n\n' +
      'public class Combat : MonoBehaviour\n' +
      '{\n' +
      '    // 复用 List / StringBuilder\n' +
      '    readonly List<HitInfo> _hits = new(64);\n' +
      '    readonly System.Text.StringBuilder _sb = new(64);\n\n' +
      '    void LogHits()\n' +
      '    {\n' +
      '        _sb.Clear();\n' +
      '        _sb.Append("hits=").Append(_hits.Count);\n' +
      '        for (int i = 0; i < _hits.Count; i++)\n' +
      '            _sb.Append(\" \").Append(_hits[i].Damage);\n' +
      '        Debug.Log(_sb.ToString());\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-build-pipeline',
    title: '26. 构建管线：Player Build、Addressables Build、AssetBundle 与 CI',
    category: '构建与发布',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: '把工程变成可在各平台运行的 Player：Build Settings、Addressables Build、Scripting Define、CI（GitHub Actions / Jenkins）。',
    detail: [
      'Build Settings：File → Build Settings 选择平台（PC/Android/iOS/WebGL/Console）、Switch Platform 会触发资源导入（第一次耗时很长）。Player Settings 控制 Icon、Resolution、Scripting Define、API Compatibility Level、Target Architecture（ARM64、x86_64）。',
      'Scripting Backend：Mono（开发快、反射可用、JIT）；IL2CPP（AOT、性能更好、Release 推荐，iOS 强制）；WebGL 只能用 IL2CPP。',
      'Api Compatibility Level：.NET Framework（最大兼容）/ .NET Standard 2.1（更小、更安全）。多数库支持 .NET Standard。',
      'Addressables Build：Window → Asset Management → Addressables → Groups → Build → New Build → Default Build Script。ContentUpdate Workflow：第一次 Build 产生 catalog + bundle；之后只 Build → Update Previous Build 生成增量补丁。',
      'Player Build API（命令行）：BuildPipeline.BuildPlayer + BuildPlayerOptions；CI 里写脚本触发自动化构建。',
      'Cloud Build / Unity Build Automation：Unity 官方 CI 服务，按 commit 触发云端构建（需要订阅）。也可以用 GitHub Actions / GitLab CI + Unity docker 镜像（unityci/editor）自己搭。',
      'BuildReport：BuildReport API 读取上一次 Build 报告，看哪个资源占用空间最大（Texture、Mesh）。',
      'AssetBundle 与 Addressables：AssetBundle 已不推荐新项目，所有都迁移到 Addressables。'
    ],
    notes: [
      'Android 64-bit（ARM64）：Google Play 强制；2022 起 32 位不再支持。',
      'iOS 上传需要 Xcode 打包 + signing profile；CI 用 xcodebuild + altool。',
      'Shader Stripping / Managed Stripping：Release 默认会裁剪未用代码，反射用到的代码需要 link.xml 保留。'
    ],
    example:
      '// 自动化构建脚本（编辑器脚本，BuildPipeline 调用）\n' +
      'using UnityEditor;\n' +
      'using UnityEditor.Build.Reporting;\n' +
      'using UnityEngine;\n' +
      'using System.IO;\n' +
      'using UnityEditor.AddressableAssets;\n' +
      'using UnityEditor.AddressableAssets.Settings;\n' +
      'using UnityEditor.AddressableAssets.Build;\n\n' +
      'public static class BuildAutomation\n' +
      '{\n' +
      '    // 命令行：Unity -batchmode -nographics -quit -projectPath . -executeMethod BuildAutomation.BuildAndroid\n' +
      '    public static void BuildAndroid()\n' +
      '    {\n' +
      '        // 1) Build Addressables\n' +
      '        AddressableAssetSettings.CleanPlayerContent();\n' +
      '        AddressableAssetSettings.BuildPlayerContent(out var result);\n' +
      '        if (!string.IsNullOrEmpty(result.Error))\n' +
      '        {\n' +
      '            Debug.LogError("Addressables 构建失败：" + result.Error);\n' +
      '            EditorApplication.Exit(1);\n' +
      '            return;\n' +
      '        }\n\n' +
      '        // 2) Build Player\n' +
      '        EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android);\n' +
      '        var opts = new BuildPlayerOptions\n' +
      '        {\n' +
      '            scenes = GetEnabledScenes(),\n' +
      '            locationPathName = "Build/Android/Game.aab",\n' +
      '            target = BuildTarget.Android,\n' +
      '            options = BuildOptions.None,\n' +
      '            targetGroup = BuildTargetGroup.Android\n' +
      '        };\n' +
      '        EditorUserBuildSettings.buildAppBundle = true;\n' +
      '        var report = BuildPipeline.BuildPlayer(opts);\n' +
      '        Debug.Log($"Build 结果 {report.summary.result}，大小 {report.summary.totalSize / 1024 / 1024} MB");\n' +
      '        EditorApplication.Exit(report.summary.result == BuildResult.Succeeded ? 0 : 1);\n' +
      '    }\n\n' +
      '    static string[] GetEnabledScenes()\n' +
      '    {\n' +
      '        var list = new System.Collections.Generic.List<string>();\n' +
      '        foreach (var s in EditorBuildSettings.scenes)\n' +
      '            if (s.enabled) list.Add(s.path);\n' +
      '        return list.ToArray();\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-test-framework',
    title: '27. 测试与自动化：Test Framework、Play Mode、性能测试',
    category: '测试与质量',
    version: 'Test Framework 1.4+',
    level: '进阶',
    summary: 'Unity Test Framework 基于 NUnit，区分 Edit Mode（编辑器快速单测）与 Play Mode（带运行时环境的集成测试）。',
    detail: [
      'Edit Mode Tests：放在 Editor/ 目录，运行快（毫秒级），测纯逻辑、ScriptableObject 数据、Editor 工具。不需要进入 Play Mode。',
      'Play Mode Tests：跑在 Player 一样环境，测 MonoBehaviour 生命周期、协程、Job、Addressables 异步加载。可以在真机或模拟器跑。',
      'NUnit 语法：[Test] / [TestCase] / [SetUp] / [TearDown] / [UnityTest]（返回 IEnumerator 让 PlayMode 测试能 yield）。',
      'Performance Test：[Performance] 特性 + Unity.PerformanceTesting 包，循环运行 N 次测耗时；可设 Warmup、Iterations、Constraints（如 ≤16ms）。',
      'Window → General → Test Runner：Run All / Run Selected；CI 里跑 Unity -runTests -testPlatform editmode/playmode。',
      'Mocking：用 NSubstitute / Moq 替身接口（数据访问、网络）。Unity 自己的 UnityEngine.TestTools 工具集也提供 LogAssert.Expect（断言某 Debug.Log 一定发生）。',
      '测试用例设计：边界（空、null、超大值）、状态机转换、玩家输入组合、网络边界（断线、超时、丢包）、异步回调（用 IEnumerator 写协程测试或 async/await + UniTask.ToCoroutine）。'
    ],
    notes: [
      'Test Framework 是 Package，要先装 com.unity.test-framework。',
      'Play Mode 测试运行速度比 Edit Mode 慢 100x，不要把纯算法逻辑放到 PlayMode 测。',
      'Performance Test 在不同机器差异大，用相对值（对比上次结果）而不是绝对值。'
    ],
    example:
      'using NUnit.Framework;\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.TestTools;\n' +
      'using System.Collections;\n\n' +
      '// ========== 1) Edit Mode 测试：纯算法 ==========\n' +
      'public class DamageCalcTests\n' +
      '{\n' +
      '    [Test]\n' +
      '    public void Crit_MultiplierApplied()\n' +
      '    {\n' +
      '        var dmg = new DamageCalculator().Calculate(baseDmg: 100, critChance: 1f, critMult: 2f);\n' +
      '        Assert.AreEqual(200, dmg);\n' +
      '    }\n' +
      '    [TestCase(100, 0.5f, 2f, ExpectedResult = 150)]\n' +
      '    [TestCase(100, 0f,   2f, ExpectedResult = 100)]\n' +
      '    public int Random_Cases(float baseDmg, float chance, float mult)\n' +
      '    {\n' +
      '        // 用 Random 注入使结果可重现\n' +
      '        return new DamageCalculator(seed: 1).Calculate(baseDmg, chance, mult);\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 2) Play Mode 测试：MonoBehaviour 生命周期 ==========\n' +
      'public class LifetimeTests\n' +
      '{\n' +
      '    [UnityTest]\n' +
      '    public IEnumerator GameObject_Destroyed_StopsCoroutine()\n' +
      '    {\n' +
      '        var go = new GameObject("test");\n' +
      '        var runner = go.AddComponent<TestRunner>();\n' +
      '        yield return new WaitForSeconds(0.2f);\n' +
      '        Object.Destroy(go);\n' +
      '        yield return new WaitForSeconds(0.2f);\n' +
      '        Assert.IsFalse(runner.IsRunning);\n' +
      '    }\n' +
      '}\n\n' +
      '// ========== 3) Performance 测试 ==========\n' +
      'using Unity.PerformanceTesting;\n' +
      'public class CombatPerfTests\n' +
      '{\n' +
      '    [Test, Performance]\n' +
      '    public void DamageCalc_100kPerFrame()\n' +
      '    {\n' +
      '        Measure.Frames().WarmupCount(10).MeasurementCount(50).Run(() =>\n' +
      '        {\n' +
      '            var c = new DamageCalculator();\n' +
      '            for (int i = 0; i < 100_000; i++)\n' +
      '                c.Calculate(100, 0.1f, 1.5f);\n' +
      '        });\n' +
      '    }\n' +
      '}\n\n' +
      'public class DamageCalculator\n' +
      '{\n' +
      '    System.Random _rng;\n' +
      '    public DamageCalculator(int seed = 0) { _rng = new System.Random(seed); }\n' +
      '    public int Calculate(float baseDmg, float critChance, float critMult)\n' +
      '    {\n' +
      '        return _rng.NextDouble() < critChance\n' +
      '            ? Mathf.RoundToInt(baseDmg * critMult)\n' +
      '            : Mathf.RoundToInt(baseDmg);\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-advanced-scripting',
    title: '28. 高级脚本技巧：Assembly Definition、Attribute 与自定义 Inspector',
    category: '编辑器与工程',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'Assembly Definition 是 Unity 工程分层的关键，Editor 与运行时隔离、模块化编译、IL2CPP 友好都靠它。',
    detail: [
      'Assembly Definition (.asmdef)：让指定目录下的脚本编译为独立 DLL。Unity 默认所有运行时脚本都进 Assembly-CSharp.dll，代码量大了编译慢，且 Editor API 也能"混入"。',
      '分模块：UI / Combat / AI / Network 各自一个 asmdef，互相 References。Editor 文件夹里放 Editor-only asmdef 才能引用 UnityEditor.dll。',
      'asmdef + Plugins/iOS、Android 平台代码：Plugins 目录下用 .meta + PluginImporter 选择运行时平台。asmdef 不能跨平台编译时引用对方，要写 #if UNITY_IOS / UNITY_ANDROID 区分。',
      'Attribute：[SerializeField]、[Header]、[Tooltip]、[Range]、[ContextMenu]（右键菜单）、[CustomEditor]（自定义 Inspector）、[CreateAssetMenu]、[DefaultExecutionOrder] 等 Unity 常用特性。',
      'CustomEditor / PropertyDrawer：自定义 Inspector 显示，比如把 Vector3 改成颜色选择、把 [MinMaxSlider] 抽屉画到 Inspector。',
      'EditorWindow 与 Tool：Editor 工具栏里的自定义工具（Tools 菜单）。',
      'AssetPostprocessor：导入新资源时自动触发，比如把 .fbx 自动设置 Import Settings、把所有 .png 自动压缩成 ASTC。',
      'BuildPipeline / IPreprocessBuildWithReport：构建前后注入自定义逻辑（拷贝资源、生成代码、注入版本号）。'
    ],
    notes: [
      'asmdef 改名后所有 .meta 的 GUID 会变，引用它的资源/asmdef 需要重新绑定。',
      'asmdef 引用第三方 DLL：把 DLL 放进 Plugins/ 并标记平台，在 asmdef References 里加 "Plugins" 或具体名字。',
      'Editor 平台代码用 Editor.asmdef + includePlatforms: Editor。'
    ],
    example:
      '// MyModule.Runtime.asmdef\n' +
      '// 放在 Assets/Modules/Combat/，所有脚本编译进 MyModule.Runtime.dll\n' +
      '{\n' +
      '  "name": "MyModule.Combat",\n' +
      '  "rootNamespace": "Game.Combat",\n' +
      '  "references": [\n' +
      '    "Unity.InputSystem",\n' +
      '    "Unity.Addressables",\n' +
      '    "Unity.Collections",\n' +
      '    "Unity.Mathematics"\n' +
      '  ],\n' +
      '  "autoReferenced": false,\n' +
      '  "defineConstraints": [],\n' +
      '  "versionDefines": [],\n' +
      '  "noEngineReferences": false\n' +
      '}\n\n' +
      '// MyModule.Editor.asmdef（Editor 文件夹下）\n' +
      '{\n' +
      '  "name": "MyModule.Combat.Editor",\n' +
      '  "references": [\n' +
      '    "MyModule.Combat"\n' +
      '  ],\n' +
      '  "includePlatforms": ["Editor"],\n' +
      '  "autoReferenced": false\n' +
      '}\n\n' +
      '// 自定义 PropertyDrawer：[MinMaxSlider]\n' +
      'using UnityEditor;\n' +
      'using UnityEngine;\n\n' +
      'public class MinMaxSliderAttribute : PropertyAttribute\n' +
      '{\n' +
      '    public float min, max;\n' +
      '    public MinMaxSliderAttribute(float min, float max) { this.min = min; this.max = max; }\n' +
      '}\n\n' +
      '[CustomPropertyDrawer(typeof(MinMaxSliderAttribute))]\n' +
      'public class MinMaxSliderDrawer : PropertyDrawer\n' +
      '{\n' +
      '    public override void OnGUI(Rect pos, SerializedProperty prop, GUIContent label)\n' +
      '    {\n' +
      '        var attr = (MinMaxSliderAttribute)attribute;\n' +
      '        EditorGUI.Slider(\n' +
      '            new Rect(pos.x, pos.y, pos.width, EditorGUIUtility.singleLineHeight),\n' +
      '            prop, attr.min, attr.max, label);\n' +
      '    }\n' +
      '}\n\n' +
      '// 用法\n' +
      'public class EnemySpawner : MonoBehaviour\n' +
      '{\n' +
      '    [MinMaxSlider(0f, 60f)]\n' +
      '    public float spawnInterval;\n' +
      '}'
  }
];