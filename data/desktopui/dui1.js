// 桌面 UI 开发 1–5：框架与基础
const dui1 = {
  id: 'dui-overview',
  title: '1. 桌面 UI 概览与技术选型',
  category: '入门',
  version: '综合',
  level: '入门',
  summary: '对比 WinForms/WPF/WinUI/Avalonia/Electron/Qt/Tauri，按场景选择合适框架。',
  detail: [
    '桌面 UI 技术按"原生 vs Web"与"平台"划分。原生(WPF/Avalonia/Qt)性能好、贴近系统；Web 技术(Electron/Tauri)开发快、跨平台一致。',
    'Windows 专属：WinForms(简单但 UI 能力弱)、WPF(XAML+数据绑定, 成熟)、WinUI 3(现代 Fluent, 微软新推荐)。',
    '跨平台原生：Avalonia(XAML 类 WPF, 支持 Win/macOS/Linux)、Qt(C++/QML, 工业强)、.NET MAUI(偏图形与移动)。',
    'Web 桌面：Electron(Chromium+Node, 体积大但生态全, VSCode/Slack)、Tauri(Rust+系统 WebView, 体积小, 新手门槛高)。',
    '选型要素：目标平台、团队语言(C#/C++/JS/Rust)、体积与性能要求、界面复杂度、打包分发难度。',
    '入门建议：想学"桌面 UI 正典"学 WPF 或 Avalonia(XAML+MVVM 概念通用)；做快速工具可用 Electron 或 Tauri。',
  ],
  notes: [
    '框架只是起点，XAML/数据绑定/MVVM/布局/自定义绘制这些概念跨框架通用，值得学透一个。',
    '体积对比：Electron 常 200MB+，Tauri 可 <10MB，原生 10-50MB。',
  ],
  example:
    '# 各框架"Hello World"最小差异\n' +
    '# WPF MainWindow.xaml:\n' +
    '<Window ...><StackPanel>\n' +
    '  <TextBlock Text="Hello WPF"/>\n' +
    '</StackPanel></Window>\n\n' +
    '# Avalonia MainWindow.axaml:\n' +
    '<Window ...><Panel>\n' +
    '  <TextBlock Text="Hello Avalonia"/>\n' +
    '</Panel></Window>\n\n' +
    '# Electron main.js(JS):\n' +
    'BrowserWindow: new BrowserWindow({width:800})\n' +
    'win.loadFile(\'index.html\')   # 页面用 HTML/CSS',
  example2:
    '# 框架与语言速查\n' +
    'WinForms      C#      简单窗体      Windows\n' +
    'WPF           C#      XAML+数据绑定 Windows\n' +
    'WinUI 3       C#      Fluent        Windows\n' +
    'Avalonia      C#      XAML(MVVM)   Win/mac/Linux\n' +
    'MAUI          C#      XAML+移动    Win/mac/移动\n' +
    'Qt            C++     QML/Widgets  多平台\n' +
    'Electron      JS/TS   Web技术      多平台(大)\n' +
    'Tauri         Rust+JS 系统WebView  多平台(小)',
  example3:
    '# 按需求选型决策(伪代码/清单)\n' +
    '需要平台: Windows仅用 -> WPF/WinUI\n' +
    '需要跨平台原生 -> Avalonia / Qt\n' +
    '需要Web生态/团队会JS -> Electron / Tauri\n' +
    '要小体积高安全 -> Tauri\n' +
    '要海量复杂控件/工具型 -> Qt\n\n' +
    '# 建议先学:\n' +
    'C# -> WPF/Avalonia -> MVVM 通用技能\n' +
    'JS -> Electron -> webview 通用技能\n' +
    '# 本模块以 WPF(概念)+ Avalonia(跨平台)为主, 各框架相通',
};

const dui2 = {
  id: 'dui-xaml',
  title: '2. XAML 标记语言与实例化',
  category: '基础',
  version: 'WPF/Avalonia',
  level: '入门',
  summary: 'XAML 语法、元素与属性、命名空间、代码隐藏与对象实例化的关系。',
  detail: [
    'XAML 是声明式标记语言，用来"描述 UI 对象树"。每个 XAML 元素对应一个 .NET 类实例(如 <Button> 是 Button 对象)。',
    '属性设置两种写法：属性语法(<Button Content="确定"/>)与元素语法(属性作为子元素 <Button><Button.Content>…)。',
    '命名空间：xmlns 声明类型来源；xmlns:x 是 XAML 工具命名空间(x:Key/x:Name/x:Class)。',
    'x:Class 指定编译出的类名，配合 Code-behind(如 MainWindow.xaml.cs) 放事件处理与初始化。',
    'x:Name/x:Key：x:Name 给元素取变量名(可在代码里访问)，x:Key 用于资源字典标识。',
    '事件：按钮 Click="OnClick" 属性挂代码隐藏方法；数据绑定用 {Binding} 标记扩展。',
  ],
  notes: [
    'XAML 是实例化语法的子集：能写的 XAML 基本都能用 C# 代码建对象。',
    '大小写敏感且顺序重要：元素/属性名与类/属性名一致。',
  ],
  example:
    '# 一个窗口的 XAML\n' +
    '<Window x:Class="App1.MainWindow"\n' +
    '        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"\n' +
    '        Title="Demo" Width="400" Height="300">\n' +
    '  <StackPanel Margin="20">\n' +
    '    <TextBlock x:Name="Greeting" Text="你好"/>\n' +
    '    <Button Content="点我" Click="OnClick"/>\n' +
    '  </StackPanel>\n' +
    '</Window>',
  example2:
    '# Code-behind 事件处理\n' +
    'using System.Windows;\n' +
    'public partial class MainWindow : Window\n' +
    '{\n' +
    '    public MainWindow() { InitializeComponent(); }\n' +
    '    private void OnClick(object sender, RoutedEventArgs e)\n' +
    '    {\n' +
    '        Greeting.Text = "点击了按钮";   // 访问 x:Name\n' +
    '    }\n' +
    '}\n' +
    '# partial class: XAML 编译部分 + 你的代码部分合并',
  example3:
    '# 属性元素语法 vs 属性语法示例\n' +
    '<Button>\n' +
    '  <Button.Content>\n' +
    '    <StackPanel Orientation="Horizontal">\n' +
    '      <TextBlock Text="★"/>\n' +
    '      <TextBlock Text="收藏"/>\n' +
    '    </StackPanel>\n' +
    '  </Button.Content>\n' +
    '</Button>\n' +
    '# (复杂内容放一块, 属性语法放简单值)',
};

const dui3 = {
  id: 'dui-layout',
  title: '3. 布局系统',
  category: '基础',
  version: 'WPF/Avalonia',
  level: '入门',
  summary: '容器与布局模型：StackPanel/Grid/Dock/Canvas，尺寸与对齐(Margin/Padding/Stretch)。',
  detail: [
    '布局=用容器(面板)把子元素排列到窗口。WPF/Avalonia 双通道布局：Measure(量尺寸) + Arrange(定位)。',
    'StackPanel：垂直或水平堆叠(间距用 Margin)。',
    'Grid：行列网格，元素放在指定 Cell(跨行列用 RowSpan/ColumnSpan)。最强大最常用。',
    'DockPanel：停靠左/右/上/下，常用于窗口骨架(顶栏/侧栏/主区)。',
    '尺寸与对齐：Width/Height、Max/Min、HorizontalAlignment 决定在可用空间的摆放；Stretch 自动拉伸填满。',
    'Margin(外边距,推离) vs Padding(内边距,内容收缩)：理解两者区别对排版很重要。',
    '布局原则：用 Grid 分栏、避免绝对定位(Canvas)保证窗口缩放自适应。',
  ],
  notes: [
    '能用 Grid/StackPanel 就别用 Canvas 写死坐标, 否则窗口拉伸就乱。',
    'Auto(自动按内容)/ */星号(按比例分摊剩余空间, 如 2*:1*)/ 固定像素 三种列宽。',
  ],
  example:
    '# Grid 三列布局\n' +
    '<Grid>\n' +
    '  <Grid.ColumnDefinitions>\n' +
    '    <ColumnDefinition Width="Auto"/>\n' +
    '    <ColumnDefinition Width="2*"/>\n' +
    '    <ColumnDefinition Width="1*"/>\n' +
    '  </Grid.ColumnDefinitions>\n' +
    '  <Button Grid.Column="0" Content="侧栏"/>\n' +
    '  <TextBox Grid.Column="1"/>\n' +
    '  <Button Grid.Column="2" Content="右侧"/>\n' +
    '</Grid>\n' +
    '# Auto=按内容, 2*:1*=比例分摊剩余',
  example2:
    '# StackPanel 垂直堆叠带间距\n' +
    '<StackPanel Margin="10">\n' +
    '  <TextBlock Text="标题" FontSize="20"/>\n' +
    '  <TextBox Margin="0,8,0,8" PlaceholderText="输入..."/>\n' +
    '  <Button HorizontalAlignment="Right" Content="确定"/>\n' +
    '</StackPanel>\n\n' +
    '# DockPanel 搭窗口骨架\n' +
    '<DockPanel>\n' +
    '  <Menu DockPanel.Dock="Top">...</Menu>\n' +
    '  <StatusBar DockPanel.Dock="Bottom">...</StatusBar>\n' +
    '  <TreeView DockPanel.Dock="Left" Width="180"/>\n' +
    '  <ContentControl/>   <!-- 填充剩余 -->\n' +
    '</DockPanel>',
  example3:
    '# Avalonia 布局示例(几乎同上, 语法一致)\n' +
    '<Panel Background="LightGray">\n' +
    '  <Grid RowDefinitions="Auto,*" Margin="16">\n' +
    '    <Button Content="添加" HorizontalAlignment="Right"/>\n' +
    '    <ListBox Grid.Row="1" Margin="0,12,0,0"/>\n' +
    '  </Grid>\n' +
    '</Panel>\n' +
    '# Avalonia 5 简化带命名行; WPF 需显式 RowDefinitions\n' +
    '# 通用点: 大容器用 Panel/Grid, 堆叠用 StackPanel',
};

const dui4 = {
  id: 'dui-controls-templates',
  title: '4. 控件与模板',
  category: '基础',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: '常用控件、DataTemplate 绑定数据呈现、ControlTemplate 自定义控件外观。',
  detail: [
    '常用控件：按钮/文本框/列表(ItemsControl/ListBox/ListView/DataGrid)、下拉(ComboBox)、Tab、滑动条(Slider)、复选框等。',
    'ItemsControl 系：绑定 ItemSource 到集合，用 DataTemplate 定义"每个条目怎么画"。',
    'DataTemplate：描述数据对象的可视化——列表里一项显示绑定对象的哪些字段。',
    'ControlTemplate：重定义控件"长什么样"——让按钮换肤、列表加分隔线，而不改其行为。',
    '模板化(templating)是 WPF/Avalonia 强大之处：Control 逻辑与视觉分离。',
    '样式(Style)与模板常一起：Style 设属性默认值, 模板决定结构；见资源篇。',
  ],
  notes: [
    'DataTemplate 管"数据怎么显示", ControlTemplate 管"控件长什么样", 别混。',
    '集合变更通知用 ObservableCollection, 否则 UI 不自动刷新(见绑定篇)。',
  ],
  example:
    '# DataTemplate 列表显示\n' +
    '<ListBox ItemsSource="{Binding Users}">\n' +
    '  <ListBox.ItemTemplate>\n' +
    '    <DataTemplate>\n' +
    '      <StackPanel Orientation="Horizontal">\n' +
    '        <TextBlock Text="{Binding Name}" FontWeight="Bold"/>\n' +
    '        <TextBlock Text="{Binding Age, \n' +
    '                   StringFormat=\' ({0})\'}"\n' +
    '                  Foreground="Gray"/>\n' +
    '      </StackPanel>\n' +
    '    </DataTemplate>\n' +
    '  </ListBox.ItemTemplate>\n' +
    '</ListBox>',
  example2:
    '# 自定义按钮外观 ControlTemplate\n' +
    '<Button>\n' +
    '  <Button.Template>\n' +
    '    <ControlTemplate TargetType="Button">\n' +
    '      <Border Background="DodgerBlue" CornerRadius="6" Padding="10,6">\n' +
    '        <ContentPresenter/>\n' +
    '      </Border>\n' +
    '    </ControlTemplate>\n' +
    '  </Button.Template>\n' +
    '</Button>\n' +
    '# ContentPresenter 放按钮原有内容\n' +
    '# (保留 Button 点击/命令行为)',
  example3:
    '# Avalonia 同样机制(DataTemplates)\n' +
    '<Window ...>\n' +
    ' <ListBox ItemsSource="{Binding Notes}">\n' +
    '   <ListBox.ItemTemplate>\n' +
    '     <DataTemplate>\n' +
    '       <Border CornerRadius="6" Background="#eee" Padding="8" Margin="0,2">\n' +
    '         <TextBlock Text="{Binding Text}"/>\n' +
    '       </Border>\n' +
    '     </DataTemplate>\n' +
    '   </ListBox.ItemTemplate>\n' +
    ' </ListBox>\n' +
    '</Window>\n' +
    '# 两种框架模板语法基本互通',
};

const dui5 = {
  id: 'dui-events-commands',
  title: '5. 事件与命令',
  category: '基础',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: '路由事件、冒泡/隧道、事件处理器与 ICommand 命令把 UI 动作绑定到逻辑。',
  detail: [
    '路由事件(RoutedEvent)：事件沿元素树"冒泡"(子到父)或"隧道"(父到子)，让父元素统一处理子事件。',
    '常用事件：Click、MouseDown/Up、KeyDown、TextChanged、SelectionChanged、Loaded。',
    'Handler 写法：XAML 属性挂方法 += 传 sender 与 EventArgs；用 x:Name 访问控件。',
    '命令(ICommand)：把"动作意图"(如保存/删除)从控件解耦出来——命令可禁用(CanExecute)、可复用、可测试。',
    'WPF 内置命令：ApplicationCommands.Copy, Commands.Cut, MediaCommands.Play 等，绑定 Command 属性。',
    'MVVM 里用 RelayCommand 封装 ViewModel 方法, 见下篇；命令比裸事件更适合 MVVM。',
  ],
  notes: [
    'MVVM 优先用命令而非事件: 命令在 ViewModel 层, 可绑定可测。',
    'RoutedEventArgs.Handled=true 停止冒泡。',
  ],
  example:
    '# 事件处理 XAML + Code-behind\n' +
    '<Button Content="删除" Click="OnDelete"/>\n' +
    '<TextBox x:Name="Input" TextChanged="OnChanged"/>\n\n' +
    'private void OnDelete(object s, RoutedEventArgs e)\n' +
    '{\n' +
    '    if (Input.Text.Length > 0)\n' +
    '        MessageBox.Show("确认删除?");\n' +
    '}\n' +
    'private void OnChanged(object s, TextChangedEventArgs e)\n' +
    '    => ChangedCount.Text = Input.Text.Length.ToString();',
  example2:
    '# 冒泡事件: 父容器统一处理子项点击\n' +
    '// XAML\n' +
    '// <StackPanel Button.Click="OnAnyButton"> \n' +
    '//   <Button Content="A"/> <Button Content="B"/>\n' +
    '// </StackPanel>\n\n' +
    'private void OnAnyButton(object s, RoutedEventArgs e)\n' +
    '{\n' +
    '    var btn = e.Source as Button;      // 谁点的\n' +
    '    Title = "点了: " + btn?.Content;\n' +
    '}\n' +
    '# 不必给每个按钮单独挂 Click',
  example3:
    '# ICommand 接口\n' +
    'public interface ICommand\n' +
    '{\n' +
    '    bool CanExecute(object? p);\n' +
    '    void Execute(object? p);\n' +
    '    event EventHandler? CanExecuteChanged;\n' +
    '}\n\n' +
    '# 一个通用 RelayCommand 实现\n' +
    'public class RelayCommand(Action<object?> ex,\n' +
    '                          Func<object?, bool>? can = null) : ICommand\n' +
    '{\n' +
    '    public bool CanExecute(object? p) => can == null || can(p);\n' +
    '    public void Execute(object? p) => ex(p);\n' +
    '    public event EventHandler? CanExecuteChanged;\n' +
    '}\n' +
    '# 绑定: <Button Command="{Binding SaveCmd}"/>',
};

if (typeof module !== 'undefined') module.exports = { dui1, dui2, dui3, dui4, dui5 };