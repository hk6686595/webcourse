// 桌面 UI 开发 16–20：进阶/打包/优化/速查
const dui16 = {
  id: 'dui-custom-control',
  title: '16. 自定义控件与绘制',
  category: '进阶',
  version: 'WPF/Avalonia',
  level: '实战',
  summary: '写自定义控件：UserControl 组装、模板化控件、OnRender 自绘与依赖属性。',
  detail: [
    '自定义 UI 两种路线：UserControl(组合现成控件, 简单) 与 TemplateControl(全新模板化控件, 灵活)。',
    'UserControl：XAML 里组合控件, 暴露属性绑定, 适合较复杂的可复用组件(卡片/输入组)。',
    '模板化控件：定义类继承 Control, 提供默认模板与依赖属性, 用户可换肤。',
    'OnRender/自绘：重写 OnRender 用 DrawingContext 画(图表/波形/画板), 高效绘制向量。',
    '依赖属性(DependencyProperty)：支持绑定/样式/动画的"增强属性", 供模板与外部设置。',
    '绑定模板内部用 TemplateBinding / RelativeSource TemplatedParent 连到依赖属性。',
  ],
  notes: [
    '优先用现成控件+Style 组合；确需全新视觉才写模板化控件。',
    '依赖属性注册命名约定: Xxx 属性 + XxxProperty 静态字段。',
  ],
  example:
    '# 自定义 UserControl(XAML 组合)\n' +
    '<!-- Card.xaml -->\n' +
    '<UserControl x:Class="App.Card">\n' +
    '  <Border Background="White" CornerRadius="8" Padding="16" BorderBrush="Gray" BorderThickness="1">\n' +
    '    <StackPanel>\n' +
    '      <TextBlock x:Name="TitleText" FontWeight="Bold"/>\n' +
    '      <ContentControl x:Name="BodyHost"/>\n' +
    '    </StackPanel>\n' +
    '  </Border>\n' +
    '</UserControl>',
  example2:
    '# Card Code-behind: 暴露标题依赖属性\n' +
    'public partial class Card : UserControl\n' +
    '{\n' +
    '    public static readonly DependencyProperty TitleProperty =\n' +
    '        DependencyProperty.Register("Title", typeof(string),\n' +
    '            typeof(Card),\n' +
    '            new PropertyMetadata("", (d, e) =>\n' +
    '                ((Card)d).TitleText.Text = (string)e.NewValue));\n\n' +
    '    public string Title\n' +
    '    {\n' +
    '        get => (string)GetValue(TitleProperty);\n' +
    '        set => SetValue(TitleProperty, value);\n' +
    '    }\n' +
    '    public Card() { InitializeComponent(); }\n' +
    '}\n' +
    '# 用: <local:Card Title="我的卡片"><TextBlock Text="内容"/></local:Card>',
  example3:
    '# OnRender 自绘画布(进度环/图表)\n' +
    'public class Ring : FrameworkElement\n' +
    '{\n' +
    '    protected override void OnRender(DrawingContext dc)\n' +
    '    {\n' +
    '        var r = ActualWidth / 2;\n' +
    '        dc.DrawEllipse(null,\n' +
    '            new Pen(Brushes.Gray, 12),\n' +
    '            new Point(r, r), r - 6, r - 6);\n' +
    '        // 绘制圆角弧表示进度\n' +
    '        var figure = new PathFigure(new Point(r, 6),\n' +
    '            new[] { new ArcSegment(new Point(r, ActualHeight - 6),\n' +
    '                       new Size(r, r), 180, false, SweepDirection.Clockwise, true) },\n' +
    '            true);\n' +
    '        dc.DrawGeometry(null, new Pen(Brushes.DodgerBlue, 12),\n' +
    '            new PathGeometry(new[] { figure }));\n' +
    '    }\n' +
    '}\n' +
    '# (每改值调 InvalidateVisual() 重绘)',
};

const dui17 = {
  id: 'dui-l10n-a11y',
  title: '17. 本地化与无障碍访问',
  category: '体验',
  version: '综合',
  level: '进阶',
  summary: '多语言国际化(resx/字典)、Unicode/编码、无障碍(Automation/对比度/键盘)。',
  detail: [
    '本地化(L10n)：把界面文本抽到资源, 按语言切换; 用户能选语言/跟随系统。',
    'WPF: 用 resx(resource) + 文化上下文; 或用资源字典按语言加载。',
    '编码：界面处理 Unicode(UTF-8); 文件读写/网络传输指定编码, 避免乱码。',
    '无障碍(A11y)：屏幕阅读器、键盘全操作、高对比度、合理字号与焦点可见, 面向所有用户。',
    'Acce能力：给控件 AutomationProperties.Name/帮助文本; 表单有 Label 关联输入框。',
    '测试：切语言验收文本不截断/不错位; 纯键盘走全流程; 开高对比度/大字号验证。',
  ],
  notes: [
    '前端(MVVM)文本别硬编码进 XAML/字符串, 放资源字典(resx)。',
    '图标/emoji 作唯一含义要配文本, 否则读屏读不出。',
  ],
  example:
    '# resx 本地化(WPF)\n' +
    '// Resources.resx 含 key: Greeting="你好"\n' +
    '// Resources.en.resx    Greeting="Hello"\n\n' +
    '// 代码取值:\n' +
    'var text = Properties.Resources.Greeting;\n' +
    '// 绑定用 DynamicResource / 代码切换 CurrentUICulture\n' +
    '# 切换语言后 Resources.Greeting 跟随',
  example2:
    '# 控件自动化命名(读屏)\n' +
    '<Button AutomationProperties.Name="保存文档"\n' +
    '        AutomationProperties.HelpText="将当前文档保存到磁盘"\n' +
    '        Content="💾"/>\n' +
    '<TextBlock x:Name="MessageLabel" Text="状态"/>\n' +
    '<!-- 键盘可聚焦 & 有清晰焦点框 -->\n' +
    '<Button Content="提交" IsDefault="True"/>\n' +
    '# 读屏可读出按钮用途, 而非只读图标',
  example3:
    '# 编码处理(避免乱码)\n' +
    '// 写入 UTF-8\n' +
    'using var w = new StreamWriter(path, false, Encoding.UTF8);\n' +
    'w.Write(text);\n\n' +
    '// 读取时指定\n' +
    'string t = File.ReadAllText(path, Encoding.UTF8);\n' +
    '// 网络响应\n' +
    'var body = Encoding.UTF8.GetString(bytes);\n' +
    '# 高对比度与字号: 控件样式里用系统资源\n' +
    '# FontSize="{DynamicResource {x:Static SystemFonts.MessageFontSize}}"',
};

const dui18 = {
  id: 'dui-packaging',
  title: '18. 打包与分发',
  category: '打包',
  version: 'WPF/Avalonia/Electron',
  level: '实战',
  summary: 'Windows 安装包、单文件自包含、跨平台发布、自动更新与签名。',
  detail: [
    '分发目标：用户拿到能双击安装运行的包; 考虑依赖(.NET 运行时)问题。',
    '自包含(self-contained)：把 .NET 运行时打进应用, 目标机无需装 .NET; 体积大但省心。',
    'Windows 打包：MSIX(应用商店/现代)、MSI/EXE(InstallShield/WIX/Inno Setup)、绿色免安装(解压即用)。',
    'Avalonia/MAUI/.NET 发布：dotnet publish -r win-x64 --self-contained -p:PublishSingleFile=true 出单文件。',
    'Electron 用 electron-builder 出 NSIS/msi/dmg; Tauri 用 tauri build 出安装包。',
    '签名与更新：代码签名(Win/mac 防警告, 付费证书); 自动更新(联网拉新版本, 应用内提示)。',
  ],
  notes: [
    '发布前做"干净机"测试: 无 SDK/运行时也能跑(自包含)。',
    '商店分发(微软商店/mac App Store)需额外配置与签名。',
  ],
  example:
    '# .NET 自包含单文件发布(WPF/Avalonia)\n' +
    'dotnet publish -c Release \\\n' +
    '  -r win-x64 \\\n' +
    '  --self-contained true \\\n' +
    '  -p:PublishSingleFile=true \\\n' +
    '  -o ./out\n' +
    '# 产出 out/MyApp.exe(含运行时, 目标机免装.NET)\n\n' +
    '# Linux 自包含\n' +
    'dotnet publish -c Release -r linux-x64 --self-contained true -o ./out',
  example2:
    '# Electron 打包配置(package.json)\n' +
    '"build": {\n' +
    '  "appId": "com.example.myapp",\n' +
    '  "productName": "MyApp",\n' +
    '  "win": { "target": ["nsis"] },\n' +
    '  "nsis": { "oneClick": false }\n' +
    '}\n' +
    '# 执行:\n' +
    'npx electron-builder --win\n' +
    '# 产出 dist/MyApp Setup.exe 安装包',
  example3:
    '# Inno Setup 脚本片段(.iss, 选项之一)\n' +
    '[Setup]\n' +
    'AppName=MyApp\n' +
    'AppVersion=1.0\n' +
    'DefaultDirName={pf}\\MyApp\n' +
    'OutputDir=installer\n\n' +
    '[Files]\n' +
    'Source: "out\\*"; DestDir: "{app}"; Flags: recursesubdirs\n\n' +
    '[Icons]\n' +
    'Name: "{group}\\MyApp"; Filename: "{app}\\MyApp.exe"\n' +
    '# 用 Inno Setup Compiler 编译该脚本得到 setup.exe\n' +
    '# (分发测试: 在无开发的干净 Windows 验证安装)',
};

const dui19 = {
  id: 'dui-performance',
  title: '19. 性能优化与调试',
  category: '优化',
  version: 'WPF/Avalonia',
  level: '实战',
  summary: '启动速度、渲染与内存优化、虚拟化列表、Profiler 定位瓶颈。',
  detail: [
    '先测后优：用 Profiler(VS 诊断/PerfView/Avalonia profiler) 量化慢在哪, 别猜。',
    '启动优化：延迟加载、简化启动逻辑、后台预初始化、减少启动时读取。',
    '列表性能：大数据集用虚拟化(ItemsControl 只渲染可见项), 而非全部创建。WPF VirtualizingStackPanel。',
    '渲染：避免每帧动画大面积重绘、用缓存(writeable bitmap)、少用高开销效果、限制复杂模板。',
    '内存：监听事件后反注册(防泄漏)、用弱事件、及时置空引用、枚举转 ObservableCollection 注意容量。',
    'UI 线程：长任务异步/后台(见异步篇), 别在 UpdateLayout 反复触发布局。',
  ],
  notes: [
    '虚拟化容器如 ListBox/DataGrid 默认提供; 手工 ScrollViewer 包裹会关掉虚拟化, 慎用。',
    '泄漏主因常是事件订阅/静态引用/DispatcherTimer 未停。',
  ],
  example:
    '# 虚拟化列表(大数据量)\n' +
    '<!-- 默认 ListBox 用虚拟化容器 -->\n' +
    '<ListBox VirtualizingPanel.IsVirtualizing="True"\n' +
    '         VirtualizingPanel.VirtualizationMode="Recycling\"\n' +
    '         ItemsSource="{Binding BigList}"/>\n' +
    '# 百万条只渲染可见, 滚动不卡\n' +
    '# 注意: 套在 ScrollViewer 里会禁用虚拟化',
  example2:
    '# 事件反注册防泄漏\n' +
    'private void OnOpen()\n' +
    '{\n' +
    '    _model.PropertyChanged += OnChanged;\n' +
    '}\n' +
    'private void OnClose()\n' +
    '{\n' +
    '    _model.PropertyChanged -= OnChanged;   // 关键!\n' +
    '}\n' +
    '# 订阅后不再使用时务必 -=, 否则对象无法被GC卸载',
  example3:
    '# 启动测量与后台初始化\n' +
    '// 测量启动耗时\n' +
    'var sw = Stopwatch.StartNew();\n' +
    'InitializeComponent();\n' +
    'sw.Stop();\n' +
    'Debug.WriteLine($"UI 构建: {sw.ElapsedMilliseconds}ms");\n\n' +
    '// 后台加载重数据, 不阻塞首帧显示\n' +
    'public MainWindow()\n' +
    '{\n' +
    '    InitializeComponent();\n' +
    '    _ = LoadDataAsync();   // 后台\n' +
    '}\n' +
    'async Task LoadDataAsync()\n' +
    '{\n' +
    '    ShowSplash();\n' +
    '    var data = await Task.Run(GetData);\n' +
    '    Bind(data);\n' +
    '}\n' +
    '# (窗口先出现, 数据后台就绪后填充)',
};

const dui20 = {
  id: 'dui-cheatsheet-project',
  title: '20. 综合实战与速查手册',
  category: '实战',
  version: '综合',
  level: '实战',
  summary: '用全书知识做一个待办/笔记桌面应用, 速查表与提升路线。',
  detail: [
    '把全书串成一个项目(如笔记/待办桌面应用)：搭框架 -> MVVM -> 界面布局 -> 数据绑定/样式 -> 增删改/集合 -> 异步保存 -> 打包分发。',
    '推荐里程碑项目：待办清单(MVVM+绑定+命令+集合)、笔记编辑器(自定义控件+异步保存+本地化)、文件管理器样式(Frame 导航+树+视图切换)、数据图表(OnRender 自绘)。',
    '工程组织：Views/ ViewModels/ Models/ Resources/ 分层; 用社区工具库(CommunityToolkit)减少样板; 版本管理 commit 稳定。',
    '最佳实践清单：界面文本进资源、数据全走绑定/命令、长任务异步、列表虚拟化、事件反注册、样式集中、包小化。',
    '进阶方向：Avalonia 做 Linux/Mac、Tauri 压体积、性能剖析深入、自定义 shader/Effect、跨平台 CI 自动打包。',
    '学习心态：每个项目做完复盘"哪卡了/哪慢/哪泄漏"; 参考开源桌面应用源码(如社区 Avalonia 项目)。',
  ],
  notes: [
    '所有内容为自身学习/自研软件; 涉及第三方版权代码/素材注意授权。',
    '把每章方法实际敲进项目才算掌握; 先跑通再做美化。',
  ],
  example:
    '# 待办应用骨架(MVVM)\n' +
    '# TodoViewModel.cs\n' +
    'public partial class TodoVM : ObservableObject\n' +
    '{\n' +
    '    public ObservableCollection<string> Items { get; } = new();\n' +
    '    [ObservableProperty] private string _input = "";\n\n' +
    '    [RelayCommand]\n' +
    '    void Add()\n' +
    '    {\n' +
    '        if (!string.IsNullOrWhiteSpace(Input))\n' +
    '        { Items.Add(Input); Input = ""; }\n' +
    '    }\n' +
    '}\n' +
    '# XAML 绑定 ItemsControl + ItemsSource + Command',
  example2:
    '# 主界面 XAML 全貌\n' +
    '<StackPanel Margin="16" Spacing="12">\n' +
    '  <DockPanel>\n' +
    '    <Button DockPanel.Dock="Right" Content="添加"\n' +
    '            Command="{Binding AddCommand}"/>\n' +
    '    <TextBox Text="{Binding Input, Mode=TwoWay,\n' +
    '                     UpdateSourceTrigger=PropertyChanged}"/>\n' +
    '  </DockPanel>\n' +
    '  <ListBox ItemsSource="{Binding Items}"\n' +
    '           Height="280">\n' +
    '    <ListBox.ItemTemplate>\n' +
    '      <DataTemplate>\n' +
    '        <TextBlock Text="{Binding}" Margin="2"/>\n' +
    '      </DataTemplate>\n' +
    '    </ListBox.ItemTemplate>\n' +
    '  </ListBox>\n' +
    '</StackPanel>\n' +
    '# 输入+回车/按钮 添加进列表, 双向绑定自动显示',
  example3:
    '# 全书速查\n' +
    '# 选型    WPF(Windows)/Avalonia(跨平台)/Electron(Web)/Tauri(小)\n' +
    '# 布局    Grid/StackPanel/DockPanel/Margin/Padding/Star\n' +
    '# 绑定    {Binding}/TwoWay/Converte/ObservableCollection\n' +
    '# 命令    ICommand/RelayCommand/CommandParameter/CanExecute\n' +
    '# 模板    DataTemplate(数据)/ControlTemplate(外观)\n' +
    '# 样式    资源字典/Style/Trigger/动态资源换肤\n' +
    '# 窗口    ShowDialog/Frame导航/ContentControl+DataTemplate\n' +
    '# 异步    async/await/Dispatcher/Task.Run/CancellationToken\n' +
    '# 绘制    Canvas/Shape/OnRender/Storyboard/缓动\n' +
    '# 打包    dotnet publish 自包含/electron-builder/tauri build\n' +
    '# 优化    Profiler/虚拟化/事件反注册/后台加载\n' +
    '# 建议: 学透一个(XAML系)推行所有, 再横向看 Web/Rust 变体。',
};

if (typeof module !== 'undefined') module.exports = { dui16, dui17, dui18, dui19, dui20 };