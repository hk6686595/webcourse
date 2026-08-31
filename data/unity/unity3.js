// Unity3D 教程 —— 第三部分：物理、动画、UI Toolkit、Input System、Cinemachine
module.exports = [
  {
    id: 'unity-physics',
    title: '14. 物理系统：Rigidbody、Collider、PhysicMaterial 与 Physics Layers',
    category: '物理系统',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'Unity 物理（PhysX 5+）是确定性友好的仿真器，但只有"在 FixedUpdate 推力、用 Layer 过滤碰撞"才能避免帧率耦合与误判。',
    detail: [
      'Rigidbody 与 Collider：刚体控制运动学（Dynamic/Kinematic/Static），Collider 决定形状。Dynamic 受重力 + 受力；Kinematic 只用 MovePosition/MoveRotation 移动，但能触发 Trigger 事件；Static 不参与物理模拟但能被射线击中。',
      '不要用 Transform 直接移动 Dynamic 刚体（绕过物理）：会与物理状态脱节，碰撞会"穿透"。必须改用 Rigidbody.MovePosition / AddForce / velocity。Transform 仅适合 Kinematic 物体。',
      'FixedUpdate vs Update：所有 AddForce、MovePosition、velocity 修改都应该在 FixedUpdate（默认 50Hz）。Update 里只读 physics 状态。Time.fixedDeltaTime 决定物理步长，全局修改影响所有刚体。',
      'PhysicMaterial（PBR）/ Physics Material：决定摩擦 (Dynamic Friction / Static Friction) 与弹性 (Bounciness)。Combine 模式决定两个碰撞体的材质如何合并（Average、Multiply、Minimum、Maximum）。',
      'Layer 与 LayerCollisionMatrix：每个 GameObject 有 Layer（0~31），Project Settings → Physics → Layer Collision Matrix 决定哪些 Layer 之间能碰撞。把"敌人子弹"和"玩家子弹"放到不同 Layer 关掉它们的相互碰撞，是性能与逻辑的关键优化。',
      'Trigger 与 Collision：Trigger 是 isTrigger=true 的 Collider，不阻挡物理但产生 OnTriggerEnter/Stay/Exit；Collision 是物理阻挡，产生 OnCollisionEnter/Stay/Exit。IsTrigger 与非 IsTrigger 不能混用，否则行为奇怪。',
      '射线检测：Physics.Raycast / SphereCast / CapsuleCast 返回 RaycastHit[]；常用 LayerMask 过滤目标；QueryTriggerInteraction.Collide 可决定是否命中 Trigger。',
      '性能：MeshCollider 的 convex=true 才能参与动态碰撞；TerrainCollider 适合大规模地形；物理步长与 Graphics 帧率独立，过高 fixedDeltaTime 会让 CPU 飙升。',
      'Unity 6 / PhysX 5：默认 PhysX 升级到 5.0，单位、确定性、SIMD 都有提升；Multi-Scene Physics 用 Unity Physics（ECS 物理）取代。'
    ],
    notes: [
      'Rigidbody.velocity 字段在 PhysX 5 起被弃用，请用 linearVelocity（Unity 6 改名）。',
      'OnCollisionStay 每帧会调很多次，性能敏感场景别在里面做重活。',
      'Box Collider 比 Mesh Collider 快得多，复杂模型用 Mesh Collider 做环境静态碰撞。'
    ],
    example:
      'using UnityEngine;\n\n' +
      'public class PhysicsBestPractice : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] float _jumpForce = 7f;\n' +
      '    [SerializeField] LayerMask _groundMask = 1;   // Ground 在 Layer 1\n' +
      '    Rigidbody _rb;\n' +
      '    bool _grounded;\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        _rb = GetComponent<Rigidbody>();\n' +
      '        // 性能：让刚体不睡，连续运动更平滑\n' +
      '        _rb.sleepThreshold = 0.05f;\n' +
      '        _rb.interpolation = RigidbodyInterpolation.Interpolate;\n' +
      '        _rb.collisionDetectionMode = CollisionDetectionMode.Continuous;\n' +
      '    }\n\n' +
      '    void FixedUpdate()\n' +
      '    {\n' +
      '        // 1) 物理检测：球形射线查地面\n' +
      '        _grounded = Physics.SphereCast(transform.position, 0.3f, Vector3.down,\n' +
      '            out _, 1.1f, _groundMask, QueryTriggerInteraction.Ignore);\n\n' +
      '        // 2) 移动：在 FixedUpdate 修改 linearVelocity\n' +
      '        var v = _rb.linearVelocity;\n' +
      '        v.x = Input.GetAxisRaw("Horizontal") * 5f;\n' +
      '        v.z = Input.GetAxisRaw("Vertical")   * 5f;\n' +
      '        _rb.linearVelocity = v;\n\n' +
      '        // 3) 跳跃：AddForce 在 FixedUpdate\n' +
      '        if (_grounded && Input.GetButtonDown("Jump"))\n' +
      '            _rb.AddForce(Vector3.up * _jumpForce, ForceMode.Impulse);\n' +
      '    }\n\n' +
      '    // 4) Trigger 事件：OnTrigger 仅在 Trigger Collider 上产生\n' +
      '    void OnTriggerEnter(Collider other)\n' +
      '    {\n' +
      '        if (other.TryGetComponent<ICollectible>(out var c))\n' +
      '            c.Collect(gameObject);\n' +
      '    }\n' +
      '}\n\n' +
      'public interface ICollectible { void Collect(GameObject by); }\n\n' +
      'public class Coin : MonoBehaviour, ICollectible\n' +
      '{\n' +
      '    public void Collect(GameObject by)\n' +
      '    {\n' +
      '        // 加金币、SFX、销毁\n' +
      '        Destroy(gameObject);\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-character-controller',
    title: '15. CharacterController：物理角色控制与移动控制器',
    category: '物理系统',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'CharacterController 是"自己决定怎么走，引擎只告诉你碰墙"的移动控制器，适合第三人称、FPS 等需要精确控制移动的角色。',
    detail: [
      'CharacterController 不是 Rigidbody：它不参与 PhysX 仿真（重力靠内置），碰撞用 capsule sweep 由 CharacterController.Move / SimpleMove 自行处理。优点：不会被外力推动、不会被挤歪、与地形斜坡/台阶表现稳定；缺点：不能 AddForce、不会自动产生反作用力。',
      'Move vs SimpleMove：SimpleMove 自带重力、乘以 Time.deltaTime；Move 不带重力、输入是"本帧位移"，需要自己写重力下降。复杂角色通常用 Move + 自己写重力、跳跃。',
      '斜坡 / 台阶：slopeLimit（最大可爬坡度）、stepOffset（台阶高度）、radius（capsule 半径）。配合 Move 函数可以让角色上斜坡、迈台阶。',
      'isGrounded：基于上一次 Move 调用的 collisionFlags；要做跳跃前必须查 isGrounded。注意：下坡时即使贴地也可能瞬时返回 false（斜面问题），用 SphereCast 自己验证更可靠。',
      'CollisionFlags：Move 返回值告诉你哪边被挡住。CollisionFlags.Sides 表示碰到侧墙，可以根据碰撞法线做"墙跳"或调整速度。',
      'FPS 控制器模板：Update 里取 input → 计算期望速度 → Move(velocity * dt)。Update 里查 isGrounded 用 Raw 的 SphereCast 兜底。',
      '与 Rigidbody 互斥：一个 GameObject 上不要同时挂 Rigidbody 和 CharacterController，会冲突。'
    ],
    notes: [
      'CharacterController.Move 是相对当前位置的偏移，不是世界坐标；写入 Vector3.zero 也表示"不动"（仍然处理重力）。',
      'SimpleMove 已过时，新代码用 Move + 自写重力。',
      'CharacterController 不能用 PhysX 的外力推动（爆炸、击退）——必须自己处理速度。'
    ],
    example:
      'using UnityEngine;\n\n' +
      '[RequireComponent(typeof(CharacterController))]\n' +
      'public class FpsLikeController : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] float _walkSpeed = 4.5f;\n' +
      '    [SerializeField] float _sprintSpeed = 7f;\n' +
      '    [SerializeField] float _jumpHeight = 1.4f;\n' +
      '    [SerializeField] float _gravity = -20f;\n' +
      '    [SerializeField] Transform _camera;\n\n' +
      '    CharacterController _cc;\n' +
      '    Vector3 _velocity;\n' +
      '    bool _grounded;\n\n' +
      '    void Awake() { _cc = GetComponent<CharacterController>(); }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        // 1) 自检地面：用 SphereCast 兜底\n' +
      '        _grounded = Physics.SphereCast(transform.position + Vector3.up * 0.1f, 0.25f,\n' +
      '            Vector3.down, out _, 0.25f, ~LayerMask.GetMask("Player"), QueryTriggerInteraction.Ignore);\n\n' +
      '        // 2) 输入\n' +
      '        float h = Input.GetAxisRaw("Horizontal");\n' +
      '        float v = Input.GetAxisRaw("Vertical");\n' +
      '        bool sprint = Input.GetKey(KeyCode.LeftShift);\n' +
      '        float speed = sprint ? _sprintSpeed : _walkSpeed;\n' +
      '        Vector3 wish = (transform.right * h + transform.forward * v).normalized * speed;\n\n' +
      '        // 3) 平滑水平速度（模拟加减速）\n' +
      '        Vector3 horiz = new Vector3(_velocity.x, 0, _velocity.z);\n' +
      '        horiz = Vector3.Lerp(horiz, wish, 12f * Time.deltaTime);\n' +
      '        _velocity.x = horiz.x;\n' +
      '        _velocity.z = horiz.z;\n\n' +
      '        // 4) 重力 + 跳跃\n' +
      '        if (_grounded && _velocity.y < 0) _velocity.y = -2f;\n' +
      '        if (_grounded && Input.GetButtonDown("Jump"))\n' +
      '            _velocity.y = Mathf.Sqrt(-2f * _gravity * _jumpHeight);\n' +
      '        _velocity.y += _gravity * Time.deltaTime;\n\n' +
      '        // 5) 应用位移（注意：Move 输入是本帧位移）\n' +
      '        CollisionFlags flags = _cc.Move(_velocity * Time.deltaTime);\n' +
      '        if ((flags & CollisionFlags.Above) != 0 && _velocity.y > 0)\n' +
      '            _velocity.y = 0;\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-animation',
    title: '16. 动画系统：Animator / State Machine / Animation Rigging',
    category: '动画与角色',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'Animator 是 Unity 动画的"中枢调度器"，理解 State、Transition、Layer、Blend Tree 就能控制大多数角色动画需求。',
    detail: [
      'Animator Controller（.controller）：资产文件，存储 State Machine、State、Transition、Blend Tree、Layer。可以在 Animator 窗口编辑。运行时由 Animator 组件驱动 Animation。',
      'State：一个动画片段（AnimationClip），可设置 Speed、Cycle Offset、Mirror。State 上挂行为脚本（StateMachineBehaviour），类似"动画事件钩子"。',
      'Transition：从一个 State 到另一个。Has Exit Time（动画播放完再切）、Transition Duration（淡入淡出时长）、Interruption Source（允许被打断）。Avoid过度过渡：Transition Duration 太长导致动画"软"。',
      'Parameter：Trigger / Bool / Int / Float；用 Animator.SetTrigger/SetBool/SetFloat/SetInteger 改变，Condition 触发 Transition。Trigger 在 Transition 中"消费一次"。',
      'Layer：多层 Animator，每层有独立 State Machine 和权重。第一层 Base Layer 通常放基础动画（Idle/Run），第二层 Upper Body Layer 可以只对上半身播放射击动画。Avatar Mask 控制哪些骨骼参与。',
      'Blend Tree：把多个动画按参数混合。比如 Speed Blend Tree：0~2 走 Idle、2~5 走 Walk、5+ 走 Run。比手写过渡灵活。',
      'Animation Rigging（com.unity.animation.rigging）：在已有动画基础上叠加 IK、约束、多骨骼链。比如让脚踩在斜坡上、手拿武器指向目标。常见 Rig：TwoBoneIK、MultiAimConstraint、ChainIKConstraint、DampedTransform。',
      'Root Motion：动画自带位移和旋转，启用 Apply Root Motion 后 Animator 会移动 GameObject。FPS 通常关掉、TPS 启用以匹配脚步。',
      'Humanoid vs Generic：Humanoid 用 Mecanim 重定向（Avatar）、共享骨骼；Generic 直接吃骨骼数据。Generic 性能好、Humanoid 灵活。'
    ],
    notes: [
      'Transition 用 "Interruption Source = Current State" + "Ordered Interruption" 可以做"动画打断动画"。',
      'Animator 在 TimeScale=0 下仍会跑（除非 Animator.updateMode = UnscaledTime 反过来）。',
      'AnimationClip 必须与骨骼路径匹配，不然骨骼不动。Generic 动画靠路径匹配，Humanoid 靠 Avatar 映射。'
    ],
    example:
      'using UnityEngine;\n\n' +
      'public class AnimatorDriver : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] Animator _anim;\n' +
      '    static readonly int _Speed = Animator.StringToHash("Speed");\n' +
      '    static readonly int _Jump  = Animator.StringToHash("Jump");\n' +
      '    static readonly int _Attack = Animator.StringToHash("Attack");\n\n' +
      '    [SerializeField] float _acceleration = 8f;\n' +
      '    float _currentSpeed;\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        float wish = Input.GetAxisRaw("Vertical") * 5f;\n' +
      '        _currentSpeed = Mathf.MoveTowards(_currentSpeed, wish, _acceleration * Time.deltaTime);\n' +
      '        _anim.SetFloat(_Speed, _currentSpeed);\n\n' +
      '        if (Input.GetButtonDown("Jump"))    _anim.SetTrigger(_Jump);\n' +
      '        if (Input.GetMouseButtonDown(0))    _anim.SetTrigger(_Attack);\n' +
      '    }\n' +
      '}\n\n' +
      '// StateMachineBehaviour：进入/离开 State 时回调（动画事件钩子）\n' +
      'public class FootstepAudio : StateMachineBehaviour\n' +
      '{\n' +
      '    public AudioClip[] clips;\n' +
      '    public float volume = 0.6f;\n' +
      '    int _lastStep;\n' +
      '    public override void OnStateEnter(Animator a, AnimatorStateInfo s, int layerIndex)\n' +
      '    {\n' +
      '        // 每帧重置触地帧\n' +
      '        _lastStep = -1;\n' +
      '    }\n' +
      '    public override void OnStateUpdate(Animator a, AnimatorStateInfo s, int layerIndex)\n' +
      '    {\n' +
      '        // 走 Run 动画时，规范化时间到整数变化播放脚步声\n' +
      '        int step = Mathf.FloorToInt(s.normalizedTime);\n' +
      '        if (step != _lastStep && a.isHuman)\n' +
      '        {\n' +
      '            _lastStep = step;\n' +
      '            var c = clips[step % clips.Length];\n' +
      '            AudioSource.PlayClipAtPoint(c, a.transform.position, volume);\n' +
      '        }\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-playable-graph',
    title: '17. Playable API 与 Timeline：自定义动画混合',
    category: '动画与角色',
    version: 'Unity 长期支持',
    level: '进阶',
    summary: 'PlayableGraph 是"动画图"基础，Timeline 是基于它的高级资产；自定义混合、临时混合、片段排序都可以在 Playable 里手写。',
    detail: [
      'PlayableGraph 是底层动画图：节点（Playable）+ 输入/输出端口（InputPort/OutputPort）+ 混合（mixer）+ 时间。可以构建比 Animator 更灵活的临时混合（例如受击时叠加 hit anim）。',
      'AnimationMixerPlayable 接收多个 AnimationClipPlayable 输入，按 weight 混合。运行时通过 SetInputWeight 修改混合比例。',
      'AnimationScriptPlayable：让自定义 ScriptPlayable<T> 注入数据处理（自定义骨骼控制、Additive）。',
      'Timeline（UnityEngine.Timeline）：基于 PlayableGraph 的时间轴资产，支持 Animation Track、Activation Track、Audio Track、Signal Track、Cinemachine Track。Timeline Asset (PlayableDirector) 可以在游戏内播放（如过场动画）。',
      'Timeline 与 Cinemachine 联动：Timeline 上挂 Cinemachine Track 切换虚拟相机、做 cutscene；Signal Track 触发游戏内事件（开门、UI 出现）。',
      'Playable Director 控制 Play/Pause/SetTime、SetDuration。混合多个 Timeline（用 TimelineAsset 的 timelinePlayable 嵌到外层 PlayableGraph）可实现"片段之间过渡"。',
      '常用技巧：角色被击中时用一个 PlayableGraph 子图叠加 hit anim，等混合结束后销毁子图，比 Animator Layer 更灵活。'
    ],
    notes: [
      'PlayableGraph 必须手动 Destroy 否则会泄漏。推荐用 using var graph = PlayableGraph.Create() 或 try/finally。',
      'Timeline Asset 不能在运行时修改轨道，要修改必须重新绑定。',
      'Playable Director 的 Wrap Mode 与 Time Mode（Game Time / Unscaled Time）决定是否受 TimeScale 影响。'
    ],
    example:
      'using UnityEngine;\n' +
      'using UnityEngine.Animations;\n' +
      'using UnityEngine.Playables;\n\n' +
      '// 用 PlayableGraph 做一次性受击叠加动画\n' +
      'public class HitAnimBlender : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] Animator _animator;\n' +
      '    [SerializeField] AnimationClip _hitClip;\n' +
      '    PlayableGraph _graph;\n' +
      '    AnimationMixerPlayable _mixer;\n' +
      '    AnimationClipPlayable _hit;\n' +
      '    AnimationPlayableOutput _output;\n' +
      '    float _t;\n' +
      '    const float HIT_DURATION = 0.4f;\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        _graph = PlayableGraph.Create("HitBlendGraph");\n' +
      '        _graph.SetTimeUpdateMode(DirectorUpdateMode.GameTime);\n\n' +
      '        _mixer = AnimationMixerPlayable.Create(_graph, 2);\n' +
      '        _hit   = AnimationClipPlayable.Create(_graph, _hitClip);\n' +
      '        _graph.Connect(_hit, 0, _mixer, 1);\n' +
      '        _mixer.SetInputWeight(0, 1f);    // 通道 0 留给 Animator 输出\n' +
      '        _mixer.SetInputWeight(1, 0f);\n\n' +
      '        // 把 Animator 的输出接到我们的 mixer 通道 0\n' +
      '        var animSource = AnimatorControllerPlayable.Create(_graph, _animator.runtimeAnimatorController);\n' +
      '        _graph.Connect(animSource, 0, _mixer, 0);\n' +
      '        _output = AnimationPlayableOutput.Create(_graph, "Anim", _animator);\n' +
      '        _output.SetSourcePlayable(_mixer);\n' +
      '        _graph.Play();\n' +
      '    }\n\n' +
      '    public void PlayHit()\n' +
      '    {\n' +
      '        _t = HIT_DURATION;\n' +
      '        _mixer.SetInputWeight(1, 1f);\n' +
      '    }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        if (_t <= 0) return;\n' +
      '        _t -= Time.deltaTime;\n' +
      '        float w = Mathf.Clamp01(_t / HIT_DURATION);\n' +
      '        _mixer.SetInputWeight(1, w);\n' +
      '        _mixer.SetInputWeight(0, 1f - w * 0.5f);\n' +
      '        if (_t <= 0) { _mixer.SetInputWeight(1, 0f); _mixer.SetInputWeight(0, 1f); }\n' +
      '    }\n\n' +
      '    void OnDestroy()\n' +
      '    {\n' +
      '        if (_graph.IsValid()) _graph.Destroy();\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-input-system',
    title: '18. Input System：Action、Bindings、Player Input 与多平台输入',
    category: '输入系统',
    version: 'Input System 1.11+',
    level: '进阶',
    summary: '新 Input System 用 Action（行为）替代 KeyCode（按键），让"跳跃"、"攻击"在不同设备（手柄 / 键鼠 / 触屏）自动重映射。',
    detail: [
      'InputActionAsset (.inputactions)：Inspector 编辑的资产，包含 Action Map（按场景分组，如 Player/UI）、Action（Move/Jump/Attack）、Binding（按键组合）。',
      'Action 类型：Button（按下/抬起）、Value（Vector2 / float，比如 Move 用 Vector2）、Pass Through（透传所有事件）。',
      '代码调用：InputAction action = playerMap.FindAction("Jump"); action.performed += ctx => Jump();。或 PlayerInput 组件自动路由到 SendMessage / UnityEvent / 自定义接口。',
      'PlayerInput 组件：拖 InputActionAsset 后自动暴露 ActionMap 切换（PlayerInput.SwitchCurrentActionMap("UI")），并按行为模式（SendMessages、InvokeUnityEvents、InvokeCSharpEvents、C# 接口）派发回调。',
      '设备管理：InputUser 类管理"输入设备 ↔ 玩家"映射，本地分屏时 PlayerInput.user 关联不同设备。',
      'Input System vs Old InputManager：项目可以同时启用（Active Input Handling = Both），但 New 用 new Input System。',
      'Rebinding：运行时 InputActionRebindingExtensions.PerformInteractiveRebinding 让玩家重设按键，常用于"自定义按键"界面。'
    ],
    notes: [
      'InputActionAsset 编辑器修改后必须 Apply 才生效。',
      'Input System 与旧 Input.GetKey 互不冲突，但推荐统一到 Input System。',
      '触屏：Touchscreen.current.primaryTouch.position / delta 用于触屏拖动、点击。'
    ],
    example:
      'using UnityEngine;\n' +
      'using UnityEngine.InputSystem;\n\n' +
      'public class PlayerInputActions : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] InputActionAsset _actions;\n' +
      '    InputAction _move, _jump, _attack;\n' +
      '    Vector2 _moveValue;\n\n' +
      '    void Awake()\n' +
      '    {\n' +
      '        var map = _actions.FindActionMap("Player");\n' +
      '        _move   = map.FindAction("Move");\n' +
      '        _jump   = map.FindAction("Jump");\n' +
      '        _attack = map.FindAction("Attack");\n\n' +
      '        _move.performed   += ctx => _moveValue = ctx.ReadValue<Vector2>();\n' +
      '        _move.canceled    += ctx => _moveValue = Vector2.zero;\n' +
      '        _jump.performed   += ctx => Jump();\n' +
      '        _attack.performed += ctx => Attack();\n' +
      '    }\n\n' +
      '    void OnEnable()  { _actions.Enable(); }\n' +
      '    void OnDisable() { _actions.Disable(); }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        Vector3 dir = new Vector3(_moveValue.x, 0, _moveValue.y);\n' +
      '        transform.Translate(dir * 5f * Time.deltaTime, Space.World);\n' +
      '    }\n\n' +
      '    void Jump()    { Debug.Log("跳跃"); }\n' +
      '    void Attack()  { Debug.Log("攻击"); }\n' +
      '}\n\n' +
      '// 运行时让玩家重绑 Jump 键（基于 C# 代码）\n' +
      'public class RebindExample : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] InputAction _jump;\n' +
      '    public void StartRebind()\n' +
      '    {\n' +
      '        _jump.Disable();\n' +
      '        _jump.PerformInteractiveRebinding()\n' +
      '            .WithControlsExcluding("<Mouse>/position")\n' +
      '            .OnComplete(op => { op.Dispose(); _jump.Enable(); })\n' +
      '            .Start();\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-ui-toolkit',
    title: '19. UI Toolkit 与 uGUI：何时选哪个',
    category: 'UI 系统',
    version: 'UI Toolkit 长期支持',
    level: '进阶',
    summary: 'UI Toolkit 是新一代 UI 系统（Web 风 USS / UXML），运行时性能优于 uGUI；复杂 HUD 与商业项目优先 UI Toolkit。',
    detail: [
      'UI Toolkit 三件套：UXML（类似 HTML 结构）、USS（类似 CSS 样式）、C#（逻辑与查询）。运行时也能用 VisualElement API 全代码构建。',
      'PanelSettings 是 UI Toolkit 的 Canvas 替代品：决定缩放策略、Sort Order、Target Texture（可以渲染到 RT 做小地图）。',
      'UI Document 组件挂 GameObject 上，引用 UIDocumentSource（UXML） + PanelSettings；运行时通过 rootVisualElement.Query<>() 拿到元素。',
      'Query 与事件：root.Q<Button>("btn-jump").RegisterCallback<ClickEvent>(OnClick)。用 USS class 选择器（.my-class），C# 端用 Q<Button>(className: "my-class") 或 type 选择器。',
      '数据绑定（Unity 6）：UIToolkit + IDataSource 接口，dataSourcePath 绑定数据，运行时更新自动同步 UI。',
      'uGUI 的遗留优势：Canvas Group + Mask + RectMask2D 的成熟度；复杂 3D 模型嵌 UI（Render Mode = World Space）；短项目、调试 HUD 仍可用。',
      'UI Toolkit 仍在补全：Mask、World Space UI、嵌套滚动等部分能力还在迭代；商业项目要么全栈 UI Toolkit，要么 uGUI 暂时保留。',
      '主题切换：UI Toolkit 用 Theme Style Sheet（TS 资源）切换整套配色（深色 / 浅色模式）。',
      'ListView / TreeView：UI Toolkit 提供虚拟化列表，处理上千行不卡（uGUI 替代需要 ScrollRect + 复杂池化）。'
    ],
    notes: [
      'UI Toolkit 元素只能在主线程修改；用 Dispatcher 推回主线程。',
      '启用 UI Toolkit 在 Project Settings → Player → Other → UI Toolkit 选项，Unity 6 默认开。',
      '运行时创建 VisualElement 不会显示，必须 Add 到 Root 或其他 parent。'
    ],
    example:
      '// ========== UI Toolkit 运行时代码构建 ==========\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.UIElements;\n\n' +
      '[RequireComponent(typeof(UIDocument))]\n' +
      'public class RuntimeUI : MonoBehaviour\n' +
      '{\n' +
      '    Label _hpLabel;\n' +
      '    int _hp = 100;\n\n' +
      '    void OnEnable()\n' +
      '    {\n' +
      '        var root = GetComponent<UIDocument>().rootVisualElement;\n' +
      '        var box = new VisualElement();\n' +
      '        box.style.flexDirection = FlexDirection.Row;\n' +
      '        box.style.paddingTop = 8; box.style.paddingLeft = 8;\n' +
      '        root.Add(box);\n\n' +
      '        _hpLabel = new Label("HP: 100");\n' +
      '        _hpLabel.style.color = Color.white;\n' +
      '        _hpLabel.style.fontSize = 24;\n' +
      '        box.Add(_hpLabel);\n\n' +
      '        var btn = new Button(() => _hp = Mathf.Max(0, _hp - 10));\n' +
      '        btn.text = "扣血 -10";\n' +
      '        box.Add(btn);\n' +
      '    }\n\n' +
      '    void Update()\n' +
      '    {\n' +
      '        if (_hpLabel != null)\n' +
      '            _hpLabel.text = $"HP: {_hp}";\n' +
      '    }\n' +
      '}\n\n' +
      '/*\n' +
      '<!-- UXML：Assets/UI/HUD.uxml -->\n' +
      '<ui:UXML xmlns:ui="UnityEngine.UIElements">\n' +
      '  <ui:VisualElement class="root">\n' +
      '    <ui:Label name="hp" class="hp-label" text="HP: 100" />\n' +
      '    <ui:ProgressBar name="hp-bar" low-value="0" high-value="100" value="100" />\n' +
      '  </ui:VisualElement>\n' +
      '</ui:UXML>\n' +
      '*/\n\n' +
      '/*\n' +
      '/* USS：Assets/UI/HUD.uss */\n' +
      '.root { padding: 8px; flex-direction: column; }\n' +
      '.hp-label { color: white; -unity-font-style: bold; font-size: 24px; }\n' +
      '*/\n' +
      '\n' +
      '// 通过 UIDocument 组件加载 UXML + USS\n' +
      'public class LoadFromUxml : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] VisualTreeAsset _uxml;\n' +
      '    [SerializeField] StyleSheet _uss;\n' +
      '    [SerializeField] PanelSettings _panel;\n' +
      '    void Start()\n' +
      '    {\n' +
      '        var doc = GetComponent<UIDocument>();\n' +
      '        doc.panelSettings = _panel;\n' +
      '        doc.visualTreeAsset = _uxml;\n' +
      '        doc.rootVisualElement.styleSheets.Add(_uss);\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-cinemachine',
    title: '20. Cinemachine 3：虚拟相机、CinemachineBrain 与 Timeline 集成',
    category: '相机与运镜',
    version: 'Cinemachine 3.1+',
    level: '进阶',
    summary: 'Cinemachine 用虚拟相机（VirtualCamera）解耦"逻辑相机选择"与"实际渲染相机"，让运镜、跟随、过场变得声明式。',
    detail: [
      '核心组件：CinemachineBrain（挂在主相机）、CinemachineCamera（虚拟相机，相当于一个"镜头"）、CinemachineFollow / LookAt / ThirdPersonFollow 等扩展（Component）。',
      'Cinemachine 3（Cm 3）：重写为组件化（Composer、Follow、Body 等都是 Component，可堆叠到 CinemachineCamera 上），相比 2.x 更灵活。',
      '优先级（Priority）：Brain 按 Priority 数值最大者激活；切换过场时用 Timeline 的 Cinemachine Track 自动改 Priority，实现镜头切换。',
      'Blend：Default Blend 用 CinemachineBlenderSettings 定义（Custom Blend：在自定义时机 / 持续时间做混合）。常见的 BlendStyle：Cut（瞬切）、EaseInOut（缓入缓出）。',
      'Impulse：CameraShake / 击退时用 CinemachineImpulseSource 发射 Impulse，Brain 上挂 Impulse Listener 响应。',
      'Extensions（旧的 2.x API 改叫 Extensions；3.x 改叫 CinemachineComponent）：Noise（手持抖动）、Body（Transposer / Framing Transposer / Third Person Follow）、Aim（Composer / Group Composer / Hard Look At / Same As Follow Target）。',
      'Cinemachine 与 Timeline：Cinemachine Track 上拖 CinemachineCamera，用 Activation Track 控制 active，Cinemachine Shot 切换镜头、Blend、Duration。'
    ],
    notes: [
      'CM 3 与 CM 2 项目升级用 "Convert to CM 3" 工具批量迁移。',
      'CinemachineCamera 没有 GameObject 上的 Camera 组件，靠 CinemachineBrain 输出到主相机。',
      'Clear Shot：在多相机中自动选择"看到目标"的相机，避免穿墙。'
    ],
    example:
      'using UnityEngine;\n' +
      'using Unity.Cinemachine;\n\n' +
      '// 跟拍 + 击退冲击：动态切换第三人称/过肩镜头\n' +
      'public class Cm3Setup : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] CinemachineCamera _followCam;\n' +
      '    [SerializeField] CinemachineCamera _overShoulderCam;\n' +
      '    [SerializeField] CinemachineImpulseSource _impulse;\n' +
      '    Transform _aimTarget;\n\n' +
      '    public void SetTarget(Transform t)\n' +
      '    {\n' +
      '        _aimTarget = t;\n' +
      '        _followCam.LookAt      = t;\n' +
      '        _followCam.Follow      = t;\n' +
      '        _overShoulderCam.LookAt = t;\n' +
      '        _overShoulderCam.Follow = t;\n' +
      '    }\n\n' +
      '    public void AimDownSight(bool on)\n' +
      '    {\n' +
      '        // Aim Down Sight：把 Priority 抬高，Brain 自动 Blend\n' +
      '        _overShoulderCam.Priority = on ? 20 : 5;\n' +
      '        _followCam.Priority       = on ? 5  : 20;\n' +
      '    }\n\n' +
      '    public void Recoil()\n' +
      '    {\n' +
      '        // 发射冲量，CinemachineImpulseListener 自动震动画面\n' +
      '        _impulse.GenerateImpulseAt(transform.position, Vector3.down);\n' +
      '    }\n' +
      '}\n\n' +
      '/*\n' +
      '// Inspector 配置：\n' +
      '// 1) Main Camera 上挂 CinemachineBrain。\n' +
      '// 2) 创建两个 CinemachineCamera：\n' +
      '//    - Follow Cam：Priority 20，默认激活；Component = ThirdPersonFollow + Composer\n' +
      '//    - Over-Shoulder Cam：Priority 5；Component = ThirdPersonFollow (右肩 offset) + Composer\n' +
      '// 3) Cm3Setup 脚本拖到玩家，挂上两个虚拟相机引用。\n' +
      '// 4) Player 里挂 CinemachineImpulseSource，Recoil() 调用时震动。\n' +
      '*/'
  }
];