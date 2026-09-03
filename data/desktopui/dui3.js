// 桌面 UI 开发 11–15：绘制/动画/跨平台/异步
const dui11 = {
  id: 'dui-drawing-animation',
  title: '11. 绘制与动画',
  category: '绘制',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: 'Canvas 绘制、形状(Shape)、Storyboard 时间线动画、缓动与关键帧。',
  detail: [
    '绘制两种：形状(Shape 声明式, 如 Rectangle/Ellipse/Path 放在画布)与几何(Geometry 复杂路径)。',
    'Canvas 允许绝对坐标绘制; 配合 Shape 做自绘 UI(图表/画板)。',
    '动画(Animatable)：用 Storyboard 在时间线上改变属性(位置/颜色/透明度), 支持关键帧与缓动。',
    '缓动(Easing)：让动画更自然——加速/回弹/弹性; WPF 内置多个 EasingFunction。',
    '关键帧：沿时间轴设置多个值点, 中间自动插值(线性/离散/样条)。',
    '渲染时钟：WPF 动画基于时间而非帧, 与帧率无关; 控件属性均可动画。',
  ],
  notes: [
    '高频自绘(如游戏/图表)可用 DirectX/Skia/Vulkan 更高效; WPF 动画适合 UI 级。',
    '动画别滥用, 影响性能与可用性(尤其无障碍减弱动画)。',
  ],
  example:
    '# Canvas 绘制形状\n' +
    '<Canvas Width="300" Height="200">\n' +
    '  <Rectangle Canvas.Left="10" Canvas.Top="10"\n' +
    '             Width="80" Height="50" Fill="DodgerBlue"/>\n' +
    '  <Ellipse Canvas.Left="120" Canvas.Top="30"\n' +
    '           Width="60" Height="60" Fill="Orange"/>\n' +
    '  <Path Fill="None" Stroke="Black" StrokeThickness="2">\n' +
    '    <Path.Data>\n' +
    '      <PathGeometry Figures="M 0,100 L 50,20 L 100,100 Z"/>\n' +
    '    </Path.Data>\n' +
    '  </Path>\n' +
    '</Canvas>',
  example2:
    '# Storyboard 平移动画\n' +
    '<Ellipse x:Name="Ball" Fill="Red" Width="40" Height="40">\n' +
    '  <Ellipse.Triggers>\n' +
    '    <EventTrigger RoutedEvent="Loaded">\n' +
    '      <BeginStoryboard>\n' +
    '        <Storyboard>\n' +
    '          <DoubleAnimation Storyboard.TargetName="Ball"\n' +
    '                           Storyboard.TargetProperty="(Canvas.Left)"\n' +
    '                           From="0" To="260" Duration="0:0:2"\n' +
    '                           AutoReverse="True" RepeatBehavior="Forever">\n' +
    '            <DoubleAnimation.EasingFunction>\n' +
    '              <CubicEase EasingMode="EaseOut"/>\n' +
    '            </DoubleAnimation.EasingFunction>\n' +
    '          </DoubleAnimation>\n' +
    '        </Storyboard>\n' +
    '      </BeginStoryboard>\n' +
    '    </EventTrigger>\n' +
    '  </Ellipse.Triggers>\n' +
    '</Ellipse>\n' +
    '# 小圆来回滚动(缓动更自然)',
  example3:
    '# 代码控制动画(透明度淡入)\n' +
    'var fade = new DoubleAnimation\n' +
    '{\n' +
    '    From = 0, To = 1,\n' +
    '    Duration = TimeSpan.FromMilliseconds(300)\n' +
    '};\n' +
    'element.BeginAnimation(UIElement.OpacityProperty, fade);\n' +
    '# Avalonia 用 Animation/Transition 类似\n' +
    '# Button.Transitions += new DoubleTransition { Property = OpacityProperty, Duration = ... }',
};

const dui12 = {
  id: 'dui-avalonia',
  title: '12. 跨平台框架：Avalonia',
  category: '跨平台',
  version: 'Avalonia 11',
  level: '进阶',
  summary: 'XAML 类 WPF 的跨平台 UI，一套代码跑 Win/macOS/Linux，MVVM 与样式。',
  detail: [
    'Avalonia 是 .NET 跨平台 UI 框架：API 极像 WPF(XAML/MVVM/绑定/模板), 但运行在 Win/macOS/Linux 原生渲染。',
    '创建项目：dotnet new avalonia.app；改造自 WPF 学习成本低。',
    '与 WPF 差异点：无 Window.Resources 前序规则用 Styles(类似 CSS 选择器)、控件命名/属性略有不同、依赖 SkiaSharp。',
    'MVVM/绑定/DataTemplate/命令与 WPF 概念一致, 前面章节可直接迁移。',
    '控件样式：Avalonia 用 Styles + Classes + 伪类(:pointerover/:pressed), 更像 CSS 而非 WPF Trigger。',
    '适用：需要 Linux 原生、跨平台一致的桌面工具; 发布走单文件(见打包篇)。',
  ],
  notes: [
    'Avalonia XAML 扩展名 .axaml; 编译为原生程序的 .NET 构建。',
    '移动端也可用 Avalonia, 但主要还是桌面。',
  ],
  example:
    '# 创建 Avalonia 项目\n' +
    'dotnet new install Avalonia.Templates\n' +
    'dotnet new avalonia.app -n MyApp\n' +
    'cd MyApp && dotnet run\n' +
    '# 会弹出跨平台原生窗口\n\n' +
    '# MainWindow.axaml 与 WPF 几乎一样\n' +
    '<Window ...>\n' +
    '  <StackPanel Spacing="8" Margin="16">\n' +
    '    <TextBlock Text="Avalonia 应用"/>\n' +
    '    <Button Content="点击" Command="{Binding DoCmd}"/>\n' +
    '  </StackPanel>\n' +
    '</Window>',
  example2:
    '# Avalonia 用 Styles 做悬停态(类似 CSS)\n' +
    '<Window.Styles>\n' +
    '  <Style Selector="Button">\n' +
    '    <Setter Property="Margin" Value="4"/>\n' +
    '  </Style>\n' +
    '  <Style Selector="Button:pointerover">\n' +
    '    <Setter Property="Background" Value="LightBlue" />\n' +
    '  </Style>\n' +
    '</Window.Styles>\n' +
    '# :pointerover 伪类 = 鼠标悬停, 选择器强大',
  example3:
    '# 数据模板映射 ViewModel -> View(Avalonia)\n' +
    '<Window.DataTemplates>\n' +
    '  <DataTemplate DataType="{x:Type vm:HomeVM}">\n' +
    '    <views:HomeView/>\n' +
    '  </DataTemplate>\n' +
    '</Window.DataTemplates>\n' +
    '<ContentControl Content="{Binding Current}"/>\n' +
    '# 跨平台发布\n' +
    '# dotnet publish -c Release -r linux-x64 --self-contained\n' +
    '# dotnet publish -c Release -r win-x64 --self-contained\n' +
    '# (产出各平台可执行文件)',
};

const dui13 = {
  id: 'dui-electron',
  title: '13. 跨平台框架：Electron',
  category: '跨平台',
  version: 'Electron',
  level: '进阶',
  summary: '用 Web 技术(HTML/CSS/JS)做桌面应用：主进程/渲染进程、IPC、打包。',
  detail: [
    'Electron = Chromium(渲染 UI) + Node.js(系统能力), 用 Web 技术开发桌面程序, 跨 Win/mac/Linux。',
    '两个进程：主进程(main, 后端, 创建窗口/访问系统)与渲染进程(renderer, 页面 UI)。',
    'IPC 通信：主从进程间用 ipcMain/ipcRenderer 发消息(send/invoke/handle)传递数据。',
    '前端框架：可用 React/Vue/原生 JS；页面即应用界面。',
    '优势：Web 生态丰富、热重载、开发快；劣势：体积大(200MB+)、内存占用高。',
    '打包：electron-builder/electron-packager 产出各平台安装包; 注意代码签名与更新。',
  ],
  notes: [
    '安全: 渲染进程勿直接信任用户内容; 开 contextIsolation、别轻易 nodeIntegration。',
    '尽量把重逻辑放主进程, 渲染进程只做显示。',
  ],
  example:
    '# 最小 Electron 应用\n' +
    '// main.js (主进程)\n' +
    'const { app, BrowserWindow } = require("electron");\n' +
    'app.whenReady().then(() => {\n' +
    '  const win = new BrowserWindow({\n' +
    '    width: 800, height: 600,\n' +
    '    webPreferences: { contextIsolation: true }\n' +
    '  });\n' +
    '  win.loadFile("index.html");\n' +
    '});\n' +
    '// 启动: npx electron .',
  example2:
    '# 主从进程 IPC\n' +
    '// 主进程\n' +
    'const { ipcMain } = require("electron");\n' +
    'ipcMain.handle("read-file", async (e, path) => {\n' +
    '  return require("fs").readFileSync(path, "utf8");\n' +
    '});\n\n' +
    '// 渲染进程 (preload 里暴露)\n' +
    'const { ipcRenderer } = require("electron");\n' +
    'const text = await ipcRenderer.invoke("read-file", "a.txt");\n' +
    'document.body.textContent = text;\n' +
    '# 用 preload + contextBridge 更安全暴露 API',
  example3:
    '# 安装依赖 + 启动 + 打包\n' +
    'npm init -y\n' +
    'npm install --save-dev electron\n' +
    'npx electron .              # 运行\n\n' +
    '# 打包(需 electron-builder)\n' +
    'npm install --save-dev electron-builder\n' +
    'npx electron-builder --win    # Windows 安装包\n' +
    'npx electron-builder --linux  # Linux\n' +
    '# package.json 配 "build" 字段与图标\n' +
    '# (产物在 dist/ )',
};

const dui14 = {
  id: 'dui-tauri-qt',
  title: '14. 跨平台框架：Tauri 与 Qt',
  category: '跨平台',
  version: 'Tauri2/Qt6',
  level: '进阶',
  summary: 'Tauri(Rust+系统 WebView, 小体积)与 Qt(C++/QML, 工业级)概览。',
  detail: [
    'Tauri：用 Rust 做后端 + 系统自带 WebView 渲染前端, 比 Electron 体积小得多(几 MB)、内存低、更安全。',
    'Tauri 前端仍是 Web(HTML/CSS/JS, 可配 React/Vue); 与 Rust 命令通过 invoke 调用。',
    '适合：想要 Web 界面又在意体积/性能/安全的工具型应用; 门槛在 Rust。',
    'Qt：C++ 为主(或 Python PySide/PyQt), 工业/嵌入式/科学软件常用, 控件全、跨平台成熟。',
    'Qt 两套 UI：Widgets(经典控件)与 QML/QtQuick(声明式, 现代动画丰富, 类似前端)。',
    '选型：Tauri 追求小与安全选它; Qt 需要 C++ 性能与复杂控件生态选它。',
  ],
  notes: [
    'Tauri 后端命令是 Rust 函数, 前端 fetch 不到, 用注入的 invoke 调用。',
    '做原生小工具且不想学 Rust, 可留 Avalonia/WinForms; 别为框架而框架。',
  ],
  example:
    '# 创建 Tauri 项目(前端 + Rust)\n' +
    'npm create tauri-app@latest\n' +
    'cd my-app\n' +
    'npm install\n' +
    'npm run tauri dev           # 调试运行\n' +
    'npm run tauri build         # 产出安装包(小体积)',
  example2:
    '# Tauri 后端命令(Rust)\n' +
    '// src-tauri/src/lib.rs\n' +
    '#[tauri::command]\n' +
    'fn greet(name: &str) -> String {\n' +
    '    format!("你好, {}!", name)\n' +
    '}\n' +
    '// main: .invoke_handler(tauri::generate_handler![greet])\n\n' +
    '// 前端调用\n' +
    'const res = await window.__TAURI__.core.invoke("greet", { name: "世界" });\n' +
    'console.log(res);   // "你好, 世界!"\n' +
    '# (具体版本 API 以官方文档为准)',
  example3:
    '# Qt Widgets 最小窗口(C++)\n' +
    '#include <QApplication>\n' +
    '#include <QLabel>\n' +
    'int main(int argc, char** argv)\n' +
    '{\n' +
    '    QApplication app(argc, argv);\n' +
    '    QLabel label("Qt 窗口");\n' +
    '    label.show();\n' +
    '    return app.exec();\n' +
    '}\n' +
    '# 编译: 需 qmake/CMake + Qt SDK\n' +
    '# qmake:   g++ main.cpp $(pkg-config --cflags --libs Qt6Widgets) -fPIC -o app\n' +
    '# QML 更适合动画丰富的现代界面',
};

const dui15 = {
  id: 'dui-async-threading',
  title: '15. 异步与线程',
  category: '并发',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: 'async/await、UI 线程与 Dispatcher、后台任务、长时间操作不卡界面。',
  detail: [
    'UI 只能从 UI 线程更新; 长时间工作(网络/文件/计算)若在 UI 线程会卡死界面(无响应)。',
    'async/await：把异步工作交后台, await 后回到 UI 线程更新; 语法整洁不阻塞。',
    'Dispatcher/Dispatcher.UIThread：从后台线程更新 UI 需调度到 UI 线程(InvokeAsync)。',
    'Task.Run：把 CPU/阻塞工作丢线程池执行, await 其结果。',
    '进度与取消：IProgress<T>/Progress 报告进度, CancellationToken 优雅取消后台任务。',
    '陷阱：闭包捕获、await 上下文、UI 线程死锁(同步 .Result)、忘调度更新 UI。',
  ],
  notes: [
    '在 async void 事件里 await 长操作, UI 不卡; 但别滥用 async void(仅事件可用)。',
    '更新控件: 在 UI 线程直接改; 后台线程用 Dispatcher 调度回 UI。',
  ],
  example:
    '# 异步加载数据不卡 UI\n' +
    'private async void OnLoad(object s, RoutedEventArgs e)\n' +
    '{\n' +
    '    Status.Text = "加载中...";\n' +
    '    var data = await Task.Run(() => LoadHeavy());\n' +
    '    ListBox.ItemsSource = data;  // 已回到 UI 线程\n' +
    '    Status.Text = "完成";\n' +
    '}\n' +
    '# 前端在 await 前/后都运行于 UI 线程',
  example2:
    '# Dispatcher 后台线程更新 UI(WPF/Avalonia)\n' +
    '# 后台线程:\n' +
    'Dispatcher.UIThread.InvokeAsync(() =>\n' +
    '{\n' +
    '    ProgressBar.Value = 42;\n' +
    '    Label.Text = "进度";\n' +
    '});\n\n' +
    '# 或 async/await 版\n' +
    'await Dispatcher.UIThread.InvokeAsync(() =>\n' +
    '    Label.Text = "已更新");\n' +
    '# 记住: 直接改控件若跨线程会抛异常或错乱',
  example3:
    '# 进度 + 取消\n' +
    'private async void OnRun(object s, RoutedEventArgs e)\n' +
    '{\n' +
    '    var p = new Progress<int>(v => ProgressBar.Value = v);\n' +
    '    using var cts = new CancellationTokenSource();\n' +
    '    CancelToken = cts;\n' +
    '    try\n' +
    '    {\n' +
    '        await Task.Run(() => HeavyLoop(p, cts.Token));\n' +
    '    }\n' +
    '    catch (OperationCanceledException)\n' +
    '    {\n' +
    '        Status.Text = "已取消";\n' +
    '    }\n' +
    '}\n' +
    '# 取消按钮: CancelToken?.Cancel();\n' +
    '# (IProgress<T> 会安全地调度回 UI 线程)',
};

if (typeof module !== 'undefined') module.exports = { dui11, dui12, dui13, dui14, dui15 };