// Unity3D 教程 —— 第二部分：渲染管线（URP / HDRP）
module.exports = [
  {
    id: 'unity-render-pipelines',
    title: '8. 渲染管线总览：Built-in / URP / HDRP / 自定义 SRP',
    category: '渲染管线',
    version: 'Unity 2022 LTS+',
    level: '进阶',
    summary: 'Unity 的渲染由 Scriptable Render Pipeline (SRP) 接管，理解 URP/HDRP 的差异与何时该自写管线，是进阶图形程序员的基础。',
    detail: [
      'Built-in Render Pipeline 是 Unity 长期默认管线，固定阶段（Forward/Deferred），渲染逻辑黑盒；URP/HDRP 是基于 SRP（Scriptable Render Pipeline）的"可编程管线"，用 C# 控制 Pass 与 RenderGraph（旧版叫 Render Pipeline Manager + ScriptableRendererFeature）。',
      '选择标准：① 移动端/中端 PC/Switch → URP（轻量、Forward、Lit 着色器稳定）；② 高端 PC/主机、追求电影感、复杂光照 → HDRP（Deferred + Clustered、Volume 框架）；③ 高度自定义（自有 Forward+、Mesh Shader）→ 自写 SRP 或在 URP 上加 Renderer Feature。',
      'URP 的最小可配置单位是 URP Asset（控制 MSAA、SRP Batcher、HDR、Additional Lights 模式）；场景可以用 Render Pipeline Override 单独覆盖。',
      'HDRP 的核心概念是 Volume 框架 + Frame Setting：Volume 优先级控制全局/局部/摄像机叠加；Frame Setting 决定质量等级（Low/Medium/High/Ultra）。',
      'Render Graph（Unity 2022.2 LTS 起在 URP 引入）：把所有 Pass 的输入输出显式建模为图结构，自动剔除未使用的资源，避免临时 RT 泄漏。是 URP 14+ 默认渲染方式，旧 API（CommandBuffer + RenderPipelineManager.BeginCameraRendering）已不推荐。',
      'SRP Batcher：开启后 Unity 把所有"兼容 Shader"的网格合批渲染，把材质属性存进 GPU 常量缓冲，DrawCall 数量大幅下降。条件：Shader 必须声明 CBUFFER_START(UnityPerMaterial) 块、UnityPerDraw 标准块。',
      'URP Renderer Feature：在 Project Settings → Graphics → URP Asset → Add Renderer Feature。常见用途：Render Objects（自定义 Layer 渲染）、Screen Space Ambient Occlusion、Decal、Full Screen Pass Renderer Feature（自定义后处理）。'
    ],
    notes: [
      '切换 Built-in → URP 不能"无感"完成：材质（Standard → Lit）、光照烘焙、天空盒、后处理组件、Light Probe 都要重做。建议新建工程而非迁移。',
      'Renderer Feature 顺序敏感：Render Objects 必须放在 Render Opaque Geometry 之后、Transparent 之前，否则深度不正确。',
      'SRP Batcher 不兼容的项目会落到传统合批（Dynamic Batching / Static Batching / GPU Instancing），性能差距 30%~50%。'
    ],
    example:
      '// 一个 Renderer Feature：在不透明几何之后绘制自定义 Outline Pass\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.Rendering;\n' +
      'using UnityEngine.Rendering.Universal;\n\n' +
      'public class OutlineRendererFeature : ScriptableRendererFeature\n' +
      '{\n' +
      '    [System.Serializable]\n' +
      '    public class Settings\n' +
      '    {\n' +
      '        public LayerMask layerMask = -1;\n' +
      '        public Material outlineMaterial;\n' +
      '    }\n' +
      '    public Settings settings = new();\n' +
      '    OutlinePass _pass;\n\n' +
      '    public override void Create()\n' +
      '    {\n' +
      '        _pass = new OutlinePass(settings) { renderPassEvent = RenderPassEvent.AfterRenderingOpaques };\n' +
      '    }\n\n' +
      '    public override void AddRenderPasses(ScriptableRenderer renderer, ref RenderingData data)\n' +
      '    {\n' +
      '        if (settings.outlineMaterial == null) return;\n' +
      '        _pass.Setup(renderer.cameraColorTargetHandle);\n' +
      '        renderer.EnqueuePass(_pass);\n' +
      '    }\n\n' +
      '    class OutlinePass : ScriptableRenderPass\n' +
      '    {\n' +
      '        static readonly int _TmpID = Shader.PropertyToID("_OutlineRT");\n' +
      '        Settings _s;\n' +
      '        RTHandle _tmp;\n\n' +
      '        public OutlinePass(Settings s) { _s = s; ConfigureInput(ScriptableRenderPassInput.Color); }\n' +
      '        public void Setup(RTHandle colorTarget) { }\n' +
      '        public override void OnCameraSetup(CommandBuffer cmd, ref RenderingData data)\n' +
      '        {\n' +
      '            var desc = data.cameraData.cameraTargetDescriptor;\n' +
      '            RenderingUtils.ReAllocateIfNeeded(ref _tmp, desc, name: "_OutlineRT");\n' +
      '            ConfigureTarget(_tmp);\n' +
      '        }\n' +
      '        public override void Execute(ScriptableRenderContext ctx, ref RenderingData data)\n' +
      '        {\n' +
      '            var cmd = CommandBufferPool.Get("OutlinePass");\n' +
      '            // 设置材质、Filter 设置、绘制流程\n' +
      '            // cmd.DrawProcedural(...) 或 cmd.Blit(...) 由具体 outline 算法决定\n' +
      '            ctx.ExecuteCommandBuffer(cmd);\n' +
      '            CommandBufferPool.Release(cmd);\n' +
      '        }\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-urp-shader',
    title: '9. URP 着色器：Lit / SimpleLit / Unlit 与 SRP Batcher 兼容',
    category: '渲染管线',
    version: 'URP 14+',
    level: '进阶',
    summary: '写 URP Shader 要避开 Built-in 时期的"表面着色器"和 "UnityPerMaterial 不在 CBUFFER 内"这两个性能陷阱。',
    detail: [
      'URP 不支持旧的 Surface Shader 语法；必须手写 HLSL/ShaderLab，从 Universal Forward / Universal ForwardOnly / Universal GBuffer Pass 起手。最快的方法是复制 URP 自带的 Lit.shader 模板（Packages/com.unity.render-pipelines.universal/Shaders/Lit.shader）。',
      'SRP Batcher 兼容性是 URP 性能的命门：所有 per-material 变量（颜色、纹理、平滑度等）必须放进 CBUFFER_START(UnityPerMaterial) ... CBUFFER_END；内置变量 _Time、unity_ObjectToWorld 等不需要。每加一个变量忘了包进 CBUFFER，整批兼容材质会"掉"出 SRP Batcher。',
      'LightMode Pass Tag：URP 用 LightMode="UniversalForward" 走主渲染，"ShadowCaster" 走阴影投射，"DepthOnly" 走深度（用于 Depth Prepass 和 Shadow），"Meta" 走光照贴图烘焙。Shader 必须实现 UniversalForward 才能被 URP 渲染。',
      '多光源：URP 默认 Forward+（URP 12+）。Lighting.hlsl 里 GetAdditionalLightCount() 等函数动态取光源数量，不要在 shader 里写 for (int i = 0; i < 4; i++) 写死。',
      'GPU Instancing：在 Shader 里加 #pragma multi_compile_instancing，使用 UNITY_INSTANCING_BUFFER_START/UNITY_DEFINE_INSTANCED_PROP。SRP Batcher 和 GPU Instancing 是两个互斥的合批路径，但 URP 优先 SRP Batcher。',
      '使用 URP Shader Library：Lighting.hlsl、ShaderVariablesFunctions.hlsl、Core.hlsl 已封装好 PBR、SH、光照衰减；不要重新实现 Standard PBR。',
      'Custom Editor 与 ShaderGUI：想让 Shader 暴露更友好的 Inspector，可以写 CustomEditor "UnityEditor.Rendering.Universal.ShaderGUI.LitShader" 或继承 ShaderGUI 写自定义面板。'
    ],
    notes: [
      'SRP Batcher 兼容看 Frame Debugger：选 DrawCall 后右侧会显示 "SRP Batch"，否则是 "Dynamic Batched" 或 "Instanced"。',
      'Shader 里 #pragma multi_compile 太多会让变体爆炸（几百/上千个），变体裁剪（IPreprocessShaders + IShaderVariantCollection）必须在 CI 里处理。',
      'SRP Batcher 与 Tessellation、Geometry Shader 也冲突——这些特性 URP 已不推荐。'
    ],
    example:
      '// 一个最小、SRP Batcher 兼容的 Unlit URP Shader\n' +
      'Shader "Custom/MyUnlit"\n' +
      '{\n' +
      '    Properties\n' +
      '    {\n' +
      '        [MainColor] _BaseColor ("Base Color", Color) = (1,1,1,1)\n' +
      '        [MainTexture] _BaseMap ("Base Map", 2D) = "white" {}\n' +
      '    }\n' +
      '    SubShader\n' +
      '    {\n' +
      '        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" "Queue"="Geometry" }\n' +
      '        LOD 100\n\n' +
      '        Pass\n' +
      '        {\n' +
      '            Name "UniversalForward"\n' +
      '            Tags { "LightMode"="UniversalForward" }\n' +
      '            HLSLPROGRAM\n' +
      '            #pragma vertex vert\n' +
      '            #pragma fragment frag\n' +
      '            #pragma multi_compile_instancing\n\n' +
      '            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"\n' +
      '            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"\n\n' +
      '            // SRP Batcher 兼容：所有 per-material 变量放进这个 CBUFFER\n' +
      '            CBUFFER_START(UnityPerMaterial)\n' +
      '                float4 _BaseMap_ST;\n' +
      '                half4  _BaseColor;\n' +
      '            CBUFFER_END\n\n' +
      '            TEXTURE2D(_BaseMap); SAMPLER(sampler_BaseMap);\n\n' +
      '            struct Attributes\n' +
      '            {\n' +
      '                float4 positionOS : POSITION;\n' +
      '                float2 uv         : TEXCOORD0;\n' +
      '                UNITY_VERTEX_INPUT_INSTANCE_ID\n' +
      '            };\n' +
      '            struct Varyings\n' +
      '            {\n' +
      '                float4 positionHCS : SV_POSITION;\n' +
      '                float2 uv          : TEXCOORD0;\n' +
      '                UNITY_VERTEX_INPUT_INSTANCE_ID\n' +
      '            };\n\n' +
      '            Varyings vert(Attributes IN)\n' +
      '            {\n' +
      '                Varyings OUT;\n' +
      '                UNITY_SETUP_INSTANCE_ID(IN);\n' +
      '                UNITY_TRANSFER_INSTANCE_ID(IN, OUT);\n' +
      '                OUT.positionHCS = TransformObjectToHClip(IN.positionOS.xyz);\n' +
      '                OUT.uv = TRANSFORM_TEX(IN.uv, _BaseMap);\n' +
      '                return OUT;\n' +
      '            }\n\n' +
      '            half4 frag(Varyings IN) : SV_Target\n' +
      '            {\n' +
      '                UNITY_SETUP_INSTANCE_ID(IN);\n' +
      '                half4 tex = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, IN.uv);\n' +
      '                return tex * _BaseColor;\n' +
      '            }\n' +
      '            ENDHLSL\n' +
      '        }\n' +
      '    }\n' +
      '}\n'
  },
  {
    id: 'unity-camera-stacking',
    title: '10. Camera Stacking：Base / Overlay 与多相机渲染',
    category: '渲染管线',
    version: 'URP 14+',
    level: '进阶',
    summary: 'URP 的 Camera Stack 让多个相机按顺序叠加到同一输出，常见玩法是 Base 渲 3D 世界 + Overlay 渲 UI/小地图/望远镜。',
    detail: [
      'URP Camera Stacking：一个 Base Camera + 多个 Overlay Camera；最终画面是 Base 输出，Overlay 相机按顺序叠加到 Base 的 Color Target。注意：Overlay 相机必须有 Base 才能生效，且两者必须 Camera Stack 同一种 Render Type（Base+Overlay 不能与 Camera Stack Base 共存同栈）。',
      'Overlay 相机的典型用途：① 小地图（RT 输出到 RawImage）；② UI 屏幕外发光、Blur 后期（用 FullScreenPassRendererFeature）；③ 望远镜/狙击镜的"放大镜"效果（用一个 RT 再投到主屏）。',
      '常见坑：Overlay 相机如果不勾选 "Post Processing"，它会跳过后期；如果你想把后期只应用到主相机，要把后期挂在 Base 上，并让 Overlay 跳过。',
      '多 Base Camera：每个 Base 相机独立 Render Target，常用于分屏本地多人（split-screen）或多窗口。需要在 URP Asset 里允许 Multi-Camera。',
      'Camera Component 关键属性：Render Type（Base/Overlay）、Output Target（Camera 的最终 RT）、Culling Mask、Clear Flags、Background Color、Renderer Override（允许用不同的 Renderer Asset，例如一个 Base 用 Forward Lit，另一个 Base 用 Forward Simple）。',
      'Camera.depth 决定渲染顺序，URP 默认按 depth 升序；Camera Stack 内部的 Overlay 顺序由 Stack 列表顺序决定。',
      'Render Texture 输出：把 Base 相机 Target Texture 设到一个 RT，再让 UI 用 RawImage 显示。常用于游戏内小地图、监控系统、电视剧"中插广告"的画中画。'
    ],
    notes: [
      'Camera Stacking 与 Multi-Pass VR 不兼容；VR 项目用 Single Pass Instanced。',
      'Overlay 相机不能"独立"显示，必须挂在 Base 下；想脱离基座就用 Base 相机自己设置 Target Texture。',
      'URP 17+ 在 Render Graph 下 Camera Stack 行为略变，旧代码迁移要检查 RT 释放。'
    ],
    example:
      'using UnityEngine;\n' +
      'using UnityEngine.Rendering;\n' +
      'using UnityEngine.Rendering.Universal;\n' +
      'using UnityEngine.UI;\n\n' +
      'public class MiniMapSetup : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] Camera _baseCamera;       // 主相机（3D 世界）\n' +
      '    [SerializeField] Camera _minimapCamera;    // 小地图相机\n' +
      '    [SerializeField] RenderTexture _minimapRT; // 200x200 的 RT\n' +
      '    [SerializeField] RawImage _minimapImage;   // UI 显示\n' +
      '    [SerializeField] UniversalRendererData _rendererOverride; // 可选\n\n' +
      '    void Start()\n' +
      '    {\n' +
      '        // 1) 小地图相机作为 Overlay 堆叠到 Base\n' +
      '        _minimapCamera.GetUniversalAdditionalCameraData().renderType = CameraRenderType.Overlay;\n' +
      '        _baseCamera.GetUniversalAdditionalCameraData().cameraStack.Add(_minimapCamera);\n' +
      '        _baseCamera.GetUniversalAdditionalCameraData().renderShadows = false;\n\n' +
      '        // 2) 把小地图的渲染结果同时输出到一张 RT（用于截图/录像）\n' +
      '        _minimapCamera.targetTexture = _minimapRT;\n' +
      '        _minimapImage.texture = _minimapRT;\n\n' +
      '        // 3) 只让小地图相机看"Minimap"层\n' +
      '        _minimapCamera.cullingMask = LayerMask.GetMask("Minimap");\n' +
      '        _baseCamera.cullingMask &= ~LayerMask.GetMask("Minimap"); // 主相机不画\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-post-processing',
    title: '11. 后处理：URP Volume 系统与 Full Screen Pass',
    category: '渲染管线',
    version: 'URP 14+',
    level: '进阶',
    summary: 'URP 后处理用 Volume 框架 + FullScreenPassRendererFeature，比 Built-in 的 PostProcess Volume 更统一、更可扩展。',
    detail: [
      'Volume 框架：场景里放一个 Global Volume（优先级最低），在区域内放 Local Volume（用 Box/Sphere Collider 触发）；每个 Volume 上挂 VolumeProfile，里面包含一组 VolumeComponent（Bloom、ColorAdjustments、Vignette、ChromaticAberration 等）。',
      'Volume 优先级（Priority）：数值越大越优先。Local Volume 离开 Collider 时不生效，离开 Camera Frustum 也不生效；可以同时存在多个 Local，按 Priority 叠加（叠加规则由 blendDistance 控制插值距离）。',
      'Override：每个 Volume Component 上的 Override 勾选决定是否"覆盖"下一级 Volume 的同名组件；不勾选则该属性完全继承下层。这避免复制大量属性。',
      '内置组件：Bloom、Chromatic Aberration、Color Adjustments、Depth Of Field、Film Grain、Lens Distortion、Lift Gamma Gain、Motion Blur、Panini Projection、Vignette、Screen Space Ambient Occlusion（URP SSAO Renderer Feature）、Screen Space Reflections（实验性）。',
      '自定义后处理：FullScreenPassRendererFeature + ScriptableRenderPass。Shader 用 Blit.hlsl 的 FullscreenVert 函数；Render Graph 下用 RenderGraphUtils.BlitMaterialParameters API。',
      '后处理顺序：URP 后处理在 "After Rendering Post Processing" 事件阶段触发。Bloom 内部多次 Blit 成本高，移动端要降采样（Bloom Downsample）。'
    ],
    notes: [
      'Volume 与 VolumeProfile 是 ScriptableObject，可以在编辑器复用。',
      'Color Space：Linear 项目下颜色管理更准；Gamma 项目里后处理参数含义不一样。',
      'URP 在 2022 LTS 之后很多 Renderer Feature 已经从 Universal RP 单独抽到 com.unity.render-pipelines.universal.experimental（如 SSAO、Decal）。'
    ],
    example:
      '// 自定义后处理：灰度 + 描边（用一个 FullScreenPassRendererFeature 装载 Material）\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.Rendering;\n' +
      'using UnityEngine.Rendering.RenderGraphModule;\n' +
      'using UnityEngine.Rendering.Universal;\n\n' +
      'public class GrayscaleFeature : ScriptableRendererFeature\n' +
      '{\n' +
      '    public Material mat;\n' +
      '    GrayscalePass _pass;\n\n' +
      '    public override void Create()\n' +
      '    {\n' +
      '        _pass = new GrayscalePass(mat) { renderPassEvent = RenderPassEvent.AfterRenderingPostProcessing };\n' +
      '    }\n' +
      '    public override void AddRenderPasses(ScriptableRenderer r, ref RenderingData d)\n' +
      '    {\n' +
      '        if (mat == null) return;\n' +
      '        r.EnqueuePass(_pass);\n' +
      '    }\n\n' +
      '    class GrayscalePass : ScriptableRenderPass\n' +
      '    {\n' +
      '        Material _m;\n' +
      '        public GrayscalePass(Material m) { _m = m; requiresIntermediateTexture = true; }\n' +
      '        public override void RecordRenderGraph(RenderGraph rg, ContextContainer ctx)\n' +
      '        {\n' +
      '            var resourceData = ctx.Get<UniversalResourceData>();\n' +
      '            var src = resourceData.activeColorTexture;\n' +
      '            var desc = rg.GetTextureDesc(src);\n' +
      '            desc.name = "GrayscaleTemp"; desc.clearBuffer = false;\n' +
      '            var dst = rg.CreateTexture(desc);\n' +
      '            var blit = new RenderGraphUtils.BlitMaterialParameters(src, dst, _m, 0);\n' +
      '            rg.AddBlitPass(blit, "GrayscalePass");\n' +
      '            resourceData.cameraColor = dst;\n' +
      '        }\n' +
      '    }\n' +
      '}\n\n' +
      '/* Shader "Hidden/Custom/Grayscale"\n' +
      '   SubShader { Tags { "RenderPipeline"="UniversalPipeline" }\n' +
      '   Pass { Name "Grayscale" ZWrite Off Cull Off\n' +
      '       HLSLPROGRAM\n' +
      '       #pragma vertex Vert\n' +
      '       #pragma fragment Frag\n' +
      '       #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"\n' +
      '       #include "Packages/com.unity.render-pipelines.core/Runtime/Utilities/Blit.hlsl"\n' +
      '       half4 Frag(Varyings IN) : SV_Target\n' +
      '       {\n' +
      '           half4 c = SAMPLE_TEXTURE2D_X(_BlitTexture, sampler_LinearClamp, IN.texcoord);\n' +
      '           half l = dot(c.rgb, half3(0.299, 0.587, 0.114));\n' +
      '           return half4(l.xxx, c.a);\n' +
      '       }\n' +
      '       ENDHLSL\n' +
      '   } }\n' +
      '*/'
  },
  {
    id: 'unity-light-baking',
    title: '12. 光照与光照烘焙：Light Probe / Lightmap / Volumetric',
    category: '渲染管线',
    version: 'Unity 2022 LTS+',
    level: '进阶',
    summary: '实时光照 + 烘焙光照贴图 + Light Probe + Reflection Probe + Volume Light，是 URP 真实感的核心拼图。',
    detail: [
      '实时光照：Directional Light 给环境主光，Point/Spot Light 给局部光。URP 在 Forward+ 模式下光源数量受 URP Asset 的 Additional Lights Per Pixel Limit 影响（默认 32/64），超过的会 fallback 到顶点光或被裁掉。',
      '光照烘焙（Lightmapping）：把静态光源的间接光、阴影烘到 Lightmap（贴图）。Static 标记 + Light 勾选 Baked/Indirect Baked/Realtime 三种模式。Baked 模式光源完全烘焙；Indirect Baked 只烘间接光、直接光仍实计算；Realtime 不烘。',
      'Light Probe Group：让动态物体（玩家、敌人）也接收烘焙的间接光。生成场景中放置几个 Probe，把动态物体包进 Probe 影响范围。运行时插值最近的几个 Probe 数据给物体着色。',
      'Reflection Probe：捕获环境立方贴图作为 PBR 的反射输入。实时（每帧/每 N 帧刷新）、烘焙（一次性生成）或自定义（Custom Render Texture 提供）。车漆、金属、玻璃必加。',
      'HDRP 的体积光 / Volumetric Fog：HDRP 用 Volumetric Fog + Directional/Point/Spot Light 的 Volumetrics 选项做体积光；URP 需要第三方或自写 Renderer Feature。',
      'Adaptive Probe Volumes（APV）：Unity 2022.2 起 URP 实验性功能，类似 HDRP 的 Probe Volumes，在场景里自动放置 Probe，运行时按需流式加载。',
      '光照调试：Lighting Settings → Debug Visualization 看 Light Probe / Lightmap / Shadow Cascade / Lightmap Stitching 是否合理。Frame Debugger 看 DrawCall 与 RT。'
    ],
    notes: [
      'Lightmap size 决定烘焙时长与质量：户外大场景每张 2048~4096；室内 1024~2048。Lightmap Atlas 的 Max Size 要在 Lighting Settings 里调。',
      'Light Probe 不能太密（浪费内存），也不能太稀（插值失真），经验值 1~3 米一个 Probe。',
      'Mixed Lighting 在 URP 下有限支持，推荐 Realtime + Baked 组合。'
    ],
    example:
      '// 用 LightingSettings API 在 Editor 里自动烘焙\n' +
      'using UnityEditor;\n' +
      'using UnityEditor.SceneManagement;\n' +
      'using UnityEngine;\n' +
      'using UnityEngine.SceneManagement;\n' +
      'using UnityEngine.Rendering;\n\n' +
      'public static class BakeHelper\n' +
      '{\n' +
      '    [MenuItem("Tools/Bake Current Scene")]\n' +
      '    public static void BakeCurrent()\n' +
      '    {\n' +
      '        var scene = SceneManager.GetActiveScene();\n' +
      '        var settings = LightmapSettings.lightingSettings;\n\n' +
      '        // 1) 调 Lightmap 参数（GPU 烘焙需要 com.unity.rendering.lightmap.d3d12.experimental）\n' +
      '        settings.lightmapMaxSize = 2048;\n' +
      '        settings.filterMode = LightmapFilterMode.PCF;\n' +
      '        LightmapSettings.lightingSettings = settings;\n\n' +
      '        // 2) 同步烘焙（CI 友好）\n' +
      '        bool ok = Lightmapping.bakeCompleted;\n' +
      '        Lightmapping.bake();\n' +
      '        EditorApplication.update += Wait;\n' +
      '    }\n' +
      '    static void Wait()\n' +
      '    {\n' +
      '        if (Lightmapping.bakeCompleted)\n' +
      '        {\n' +
      '            EditorApplication.update -= Wait;\n' +
      '            AssetDatabase.SaveAssets();\n' +
      '            Debug.Log("烘焙完成");\n' +
      '        }\n' +
      '    }\n' +
      '}'
  },
  {
    id: 'unity-shader-graph',
    title: '13. Shader Graph：可视化着色器与自定义函数',
    category: '渲染管线',
    version: 'URP 14+ / Shader Graph 14+',
    level: '进阶',
    summary: 'Shader Graph 让美术/TA 拖节点写 Shader，能胜任大部分 URP 任务，但性能 / 复杂度的拐点需要写 HLSL Custom Function。',
    detail: [
      'Shader Graph 通过节点图生成 HLSL，SRP Batcher 兼容（自动生成 UnityPerMaterial CBUFFER）。支持的 Master Stack：URP Lit、URP Unlit、HDRP Lit、HDRP Unlit、Fullscreen（用于后处理）等。',
      'Property 暴露成 Material Property，在 Inspector 显示，可以在 C# 里用 Material.SetFloat/SetTexture 动态改。Reference 命名要稳定，否则 Material Override 引用会失效。',
      '节点类型：Math（基础运算）、Vector、Texture Sample、UV Manipulation、PBR（直接采样 BRDF）、Custom Function（HLSL 函数）、Sub Graph（子图复用）、Function Call 节点。',
      'Custom Function：用一个 .hlsl 文件写函数体，Shader Graph 节点引用并匹配入参/出参类型。支持 include 共享工具函数库。',
      '性能拐点：Shader Graph 自动展开后经常生成冗余指令——比如嵌套 lerp、重复采样同张纹理。Profile 时用 RenderDoc / Frame Debugger + Wave 占用率判断，必要时手写 HLSL。',
      '粒子系统 / VFX Graph：粒子着色器、Sub Emitter、Custom Texture Sample 都和 Shader Graph 配合使用，VFX Graph 还有 GPU 粒子能力（Mesh Particles / Skinned）。',
      '预览：右键节点 → Preview / 拖到 Master Stack 看效果；Asset 里选中 Node 会高亮 Master Stack 用到它的部分。'
    ],
    notes: [
      'Shader Graph 不适合做大规模"分支"逻辑（很多 if/case），节点图会爆炸；这种情况回退到 HLSL。',
      'Custom Function 不能引用 Shader Graph 生成的中间变量，只能用自己声明的输入参数。',
      'URP 在 Render Graph 下 Shader Graph 兼容性已经稳定，但一些老 Graph（如 Particle Lit）在 Render Graph 升级后需要重新生成。'
    ],
    example:
      '// 一个 Custom Function 节点：柏林噪声扰动 UV\n' +
      '// 文件 Assets/Shaders/Noise.hlsl\n' +
      'float Hash(float2 p)\n' +
      '{\n' +
      '    p = frac(p * float2(123.34, 456.21));\n' +
      '    p += dot(p, p + 45.32);\n' +
      '    return frac(p.x * p.y);\n' +
      '}\n' +
      'float ValueNoise(float2 uv)\n' +
      '{\n' +
      '    float2 i = floor(uv);\n' +
      '    float2 f = frac(uv);\n' +
      '    float a = Hash(i);\n' +
      '    float b = Hash(i + float2(1, 0));\n' +
      '    float c = Hash(i + float2(0, 1));\n' +
      '    float d = Hash(i + float2(1, 1));\n' +
      '    float2 u = f * f * (3 - 2 * f);\n' +
      '    return lerp(lerp(a, b, u.x), lerp(c, d, u.x), u.y);\n' +
      '}\n' +
      '// Custom Function 节点调用示例（HLSL 里）：\n' +
      '/*\n' +
      'void DistortUV_float(float2 uv, float strength, float time, out float2 outUv)\n' +
      '{\n' +
      '    float n = ValueNoise(uv * 8 + time);\n' +
      '    outUv = uv + float2(n - 0.5, n - 0.5) * strength * 0.1;\n' +
      '}\n' +
      '*/\n' +
      '\n' +
      '// 在 C# 里动态驱动 Shader Graph Property\n' +
      'using UnityEngine;\n' +
      'public class WobbleUV : MonoBehaviour\n' +
      '{\n' +
      '    [SerializeField] Renderer _renderer;\n' +
      '    [SerializeField] float _strength = 1f;\n' +
      '    MaterialPropertyBlock _mpb;\n' +
      '    static readonly int _StrengthID = Shader.PropertyToID("_Strength");\n' +
      '    static readonly int _TimeID    = Shader.PropertyToID("_TimeOffset");\n\n' +
      '    void Awake() { _mpb = new MaterialPropertyBlock(); }\n' +
      '    void Update()\n' +
      '    {\n' +
      '        _renderer.GetPropertyBlock(_mpb);\n' +
      '        _mpb.SetFloat(_StrengthID, _strength);\n' +
      '        _mpb.SetFloat(_TimeID, Time.time);\n' +
      '        _renderer.SetPropertyBlock(_mpb);\n' +
      '    }\n' +
      '}'
  }
];