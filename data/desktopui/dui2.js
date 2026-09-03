// 桌面 UI 开发 6–10：MVVM 与数据
const dui6 = {
  id: 'dui-mvvm',
  title: '6. MVVM 架构详解',
  category: '架构',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: 'Model-View-ViewModel 分离 UI 与逻辑，命令与通知绑定，让界面可测试可维护。',
  detail: [
    'MVVM 是 XAML 框架的核心架构：View(界面)、ViewModel(界面状态与命令)、Model(业务/数据)。',
    'View 只含 XAML 与后台轻量代码；ViewModel 不含 UI 控件依赖，只暴露属性与命令。',
    'ViewModel 通过数据绑定把属性给 View；通知属性变化用 INotifyPropertyChanged。',
    '命令(ICommand)绑定到按钮；参数化用 CommandParameter；CanExecute 控制可用。',
    'ViewModel 从 View 解耦后可用单元测试直接测逻辑，UI 只测绑定。',
    '用 MVVM 工具库(MvvmLight/CommunityToolkit.Mvvm)可少写样板(源生成器+RelayCommand)。',
    '取舍：小工具可不用 MVVM；规模上多用它收益明显。',
  ],
  notes: [
    '属性通知一定要在 setter 里调用 OnPropertyChanged, 否则 UI 不更新。',
    'ViewModel 别去操作控件对象(TextBox.Text), 全部经绑定/命令/参数。',
  ],
  example:
    '# 基础 ViewModel 属性通知\n' +
    'using System.ComponentModel;\n' +
    'using System.Runtime.CompilerServices;\n' +
    'public class MainViewModel : INotifyPropertyChanged\n' +
    '{\n' +
    '    private string _name = "";\n' +
    '    public string Name\n' +
    '    {\n' +
    '        get => _name;\n' +
    '        set { if (_name != value)\n' +
    '            { _name = value; OnPropertyChanged(); } }\n' +
    '    }\n' +
    '    public event PropertyChangedEventHandler? PropertyChanged;\n' +
    '    private void OnPropertyChanged([CallerMemberName] string? n = null)\n' +
    '        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));\n' +
    '}',
  example2:
    '# 命令绑定到按钮\n' +
    'public class MainViewModel\n' +
    '{\n' +
    '    public ICommand SaveCmd { get; }\n' +
    '    public string Text { get; set; } = "";\n\n' +
    '    public MainViewModel()\n' +
    '    {\n' +
    '        SaveCmd = new RelayCommand(\n' +
    '            _ => DoSave(),\n' +
    '            _ => !string.IsNullOrEmpty(Text));\n' +
    '    }\n' +
    '    void DoSave() { /* 保存 */ }\n' +
    '}\n\n' +
    '# XAML: <Button Content="保存" Command="{Binding SaveCmd}"/>',
  example3:
    '# 用 CommunityToolkit.Mvvm 源生成器简化\n' +
    'using CommunityToolkit.Mvvm.ComponentModel;\n' +
    'using CommunityToolkit.Mvvm.Input;\n\n' +
    'public partial class MainViewModel : ObservableObject\n' +
    '{\n' +
    '    [ObservableProperty] private string _name = "";\n\n' +
    '    [RelayCommand(CanExecute = nameof(CanSave))]\n' +
    '    private void Save() { /* ... */ }\n' +
    '    private bool CanSave() => !string.IsNullOrEmpty(Name);\n' +
    '}\n' +
    '# 源生成器自动生成 Name 属性通知 与 SaveCommand\n' +
    '# (大幅减少 INotifyPropertyChanged 样板代码)',
};

const dui7 = {
  id: 'dui-binding',
  title: '7. 数据绑定深入',
  category: '数据',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: 'Binding 方向与模式、值转换器、集合绑定、ObservableCollection 与更新通知。',
  detail: [
    '数据绑定把 UI 属性与数据源连起来，源改变 UI 自动更新(前提源发通知)。',
    '方向：OneTime(一次)、OneWay(源到 UI)、TwoWay(双向, 输入框常用)、Default(按属性默认)。',
    'INotifyPropertyChanged：属性 setter 发通知, 单向绑定 OneWay/TwoWay 需它才实时。',
    '集合绑定项用 INotifyCollectionChanged(ObservableCollection<T>), 增删自动刷新, List<T> 不会。',
    '值转换器(ValueConverter)：绑定遇到类型/格式不符时转换, 如 bool->Visibility、枚举->颜色、DateTime->string。',
    '绑定路径 {Binding Property.SubProperty}、元素绑定 {Binding ElementName=..., Path=...}、相对源。',
  ],
  notes: [
    'TwoWay 输入框常用; DisplayTemplate 默认值绑定为 TwoWay 于可编辑控件。',
    '忘了实现在 INotifyPropertyChanged 是"绑了不刷新"最常见原因。',
  ],
  example:
    '# 双向绑定到 ViewModel\n' +
    '<TextBox Text="{Binding Name, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}"/>\n' +
    '# 输入即回写 Name, Name 改变输入框也变\n' +
    '# UpdateSourceTrigger=PropertyChanged: 每敲一次就写\n' +
    '# (默认 LostFocus 才回写)',
  example2:
    '# bool 到 Visibility 转换器\n' +
    'public class BoolToVisibility : IValueConverter\n' +
    '{\n' +
    '    public object Convert(object? v, Type t, object? p, CultureInfo c)\n' +
    '        => (bool)v! ? Visibility.Visible\n' +
    '                     : Visibility.Collapsed;\n' +
    '    public object ConvertBack(object? v, Type t, object? p, CultureInfo c)\n' +
    '        => throw new NotSupportedException();\n' +
    '}\n\n' +
    '# 用: <Window.Resources>\n' +
    '#       <BoolToVisibility x:Key="b2v"/>\n' +
    '#     </Window.Resources>\n' +
    '#  <TextBlock Visibility="{Binding IsAdmin, Converter={StaticResource b2v}}"/>',
  example3:
    '# ObservableCollection 增删自动刷新\n' +
    'public ObservableCollection<Todo> Todos { get; } = new();\n\n' +
    'void AddTodo(string text)\n' +
    '{\n' +
    '    Todos.Add(new Todo(text));    // UI 自动多一行\n' +
    '    Todos.RemoveAt(0);            // UI 自动少一行\n' +
    '}\n' +
    '# XAML:\n' +
    '<ListBox ItemsSource="{Binding Todos}">\n' +
    '  <ListBox.ItemTemplate>\n' +
    '    <DataTemplate><TextBlock Text="{Binding Text}"/></DataTemplate>\n' +
    '  </ListBox.ItemTemplate>\n' +
    '</ListBox>\n' +
    '# 用 List<T> 则须手动重置 Source, 不会自动刷新',
};

const dui8 = {
  id: 'dui-resources-styles',
  title: '8. 资源与样式',
  category: '样式',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: 'ResourceDictionary 管理资源、Style 统一样式、主题与动态资源。',
  detail: [
    '资源(Resource)：可复用对象(颜色/画刷/样式/模板/转换器)，存资源字典并通过 key 引用。',
    '资源字典作用域：Window.Resources / App.Resources / 全局；最近作用域优先。StaticResource 一次解析。',
    'Style：为一类控件设默认属性，如所有 Button 统一样式；BasedOn 继承；TargetType 限定类型。',
    '样式内可用 Setter 设属性、触发器(Trigger)按状态改属性(鼠标悬停变色)。',
    'DynamicResource：运行时重新解析, 支持主题切换; StaticResource 只读一次更快。',
    '主题：把全部样式放独立资源字典, 运行时切换(浅色/深色)实现换肤。',
  ],
  notes: [
    'StaticResource 快, DynamicResource 能跟随切换; 初始读不到的用动态。',
    '全局样式放 App.xaml 的 <Application.Resources>。',
  ],
  example:
    '# 资源字典定义样式\n' +
    '<Window.Resources>\n' +
    '  <SolidColorBrush x:Key="Primary" Color="DodgerBlue"/>\n' +
    '  <Style x:Key="TitleStyle" TargetType="TextBlock">\n' +
    '    <Setter Property="FontSize" Value="22"/>\n' +
    '    <Setter Property="FontWeight" Value="Bold"/>\n' +
    '  </Style>\n' +
    '</Window.Resources>\n\n' +
    '<TextBlock Style="{StaticResource TitleStyle}"\n' +
    '           Foreground="{StaticResource Primary}"\n' +
    '           Text="欢迎"/>',
  example2:
    '# 应用全局样式(按钮统一)\n' +
    '<Application.Resources>\n' +
    '  <Style TargetType="Button">\n' +
    '    <Setter Property="Margin" Value="8"/>\n' +
    '    <Setter Property="Padding" Value="12,6"/>\n' +
    '    <Setter Property="Cursor" Value="Hand"/>\n' +
    '  </Style>\n' +
    '</Application.Resources>\n' +
    '# 无 key 的 TargetType 样式自动应用到所有该类型\n' +
    '# 有 key 的需显式引用',
  example3:
    '# 触发器: 悬停变色(按钮)\n' +
    '<Style x:Key="HoverBtn" TargetType="Button">\n' +
    '  <Setter Property="Background" Value="White"/>\n' +
    '  <Style.Triggers>\n' +
    '    <Trigger Property="IsMouseOver" Value="True">\n' +
    '      <Setter Property="Background" Value="LightBlue"/>\n' +
    '    </Trigger>\n' +
    '  </Style.Triggers>\n' +
    '</Style>\n\n' +
    '# Avalonia 用 Classes + 伪类(:pointerover) 类似 CSS\n' +
    '# Button:pointerover { Background: LightBlue; }',
};

const dui9 = {
  id: 'dui-window-nav',
  title: '9. 窗口、页面与导航',
  category: '导航',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: '多窗口、模态对话框、页面/框架导航、对话框结果与生命周期。',
  detail: [
    '应用多由多个窗口/页面组成：主窗口、对话框、页面切换导航。',
    '窗口管理：new Window 显示、Show()(非模态)/ShowDialog()(模态, 阻塞至关闭)、Close()。',
    '对话框结果：DialogResult(true/false) 由确定/取消按钮设置, 调用方据此判断。',
    '页面导航：Frame + Page, 用 Navigate 往返; 或 ContentControl 换 View(配合 MVVM)。',
    '生命周期：Loaded/Unloaded、Window Closing 拦截(提示保存)、Closing/Cancelled。',
    'MVVM 里 View 由 DataTemplate 映射(ViewModel 类型->View), 用 ContentControl 显示当前 VM。',
  ],
  notes: [
    '模态对话框用 ShowDialog() 且勿对主窗口操作; 单例窗口/关闭处理要小心。',
    'MVVM 显示对话框: 用对话框服务/消息, 别在 VM 直接 new Window(破坏解耦, 但小工具可妥协)。',
  ],
  example:
    '# 打开模态对话框\n' +
    '// MainWindow Code-behind\n' +
    'private void OnLogin(object s, RoutedEventArgs e)\n' +
    '{\n' +
    '    var dlg = new LoginWindow();\n' +
    '    bool? ok = dlg.ShowDialog(this);   // 模态\n' +
    '    if (ok == true)\n' +
    '        MessageBox.Show("已登录: " + dlg.Result);\n' +
    '}\n\n' +
    '# LoginWindow:\n' +
    '//  确定按钮: this.DialogResult = true;\n' +
    '//  取消按钮: this.DialogResult = false;',
  example2:
    '# Frame + Page 导航\n' +
    '<Window>\n' +
    '  <Frame x:Name="MainFrame"/>\n' +
    '</Window>\n\n' +
    '// 代码导航\n' +
    'MainFrame.Navigate(new HomePage());\n' +
    'MainFrame.Navigate(new DetailPage(id));\n' +
    'MainFrame.GoBack();      // 后退\n' +
    'MainFrame.GoForward();   // 前进\n' +
    '# 页面继承 System.Windows.Controls.Page',
  example3:
    '# MVVM 换 View(ContentControl + DataTemplate)\n' +
    '# App.xaml:\n' +
    '<!-- <DataTemplate DataType="{x:Type vm:HomeVM}">\n' +
    '     <views:HomeView/> </DataTemplate> -->\n\n' +
    '# 主窗口:\n' +
    '<!-- <ContentControl Content="{Binding CurrentVM}"/> -->\n\n' +
    '# ViewModel:\n' +
    'void GoHome() => CurrentVM = new HomeVM();\n' +
    'void GoDetail() => CurrentVM = new DetailVM(id);\n' +
    '# 切 CurrentVM => UI 自动换对应 View(映射闭环)',
};

const dui10 = {
  id: 'dui-input-interaction',
  title: '10. 输入与用户交互',
  category: '交互',
  version: 'WPF/Avalonia',
  level: '进阶',
  summary: '键盘/鼠标/触控事件、焦点管理、拖拽、快捷键与手势，做好可访问输入。',
  detail: [
    '输入来源：键盘(KeyDown)、鼠标(Click/MouseMove/Wheel)、触控与手势、游戏手柄(少见)。',
    '焦点：Focusable + Focus() 控制哪个控件接收键盘; 方向键/Tab 浏览做无障碍。',
    '鼠标：定位(GetPosition)、拖拽(Drag/Drop 或手动 MouseDown/Move/Up 计算位移)。',
    '快捷键：InputBinding + KeyGesture(如 Ctrl+S 存盘)绑定命令, 比手动监听整洁。',
    '触摸/笔：常见于平板; 手势(滑动/捏合)需识别器(Manipulation/Touch)。',
    '无障碍：Accessibility/ AutomationProperties.Name 让读屏可读; 按钮给文本而非纯图标。',
  ],
  notes: [
    '键盘操作为主应用务必支持 Tab 顺序与回车触发(IsDefault)。',
    '输入框要用 IME(中文输入法)友好: 输入法状态变化事件。',
  ],
  example:
    '# 快捷键绑定到命令\n' +
    '<Window.InputBindings>\n' +
    '  <KeyBinding Command="{Binding SaveCmd}"\n' +
    '              Gesture="Ctrl+S"/>\n' +
    '  <KeyBinding Command="{Binding NewCmd}"\n' +
    '              Gesture="Ctrl+N"/>\n' +
    '</Window.InputBindings>\n' +
    '# 全局快键无需在控件上挂事件',
  example2:
    '# 手动拖拽(左上角拖动窗口/元素)\n' +
    '// XAML: <Border MouseLeftButtonDown="OnDrag"/>\n' +
    'private void OnDrag(object s, MouseButtonEventArgs e)\n' +
    '{\n' +
    '    var src = (Border)s;\n' +
    '    var win = Window.GetWindow(src);\n' +
    '    if (e.ChangedButton == MouseButton.Left)\n' +
    '        win.DragMove();\n' +
    '}\n' +
    '# 无边框窗口全靠这个才能移动',
  example3:
    '# 无障碍: 命名自动化属性 + 键盘支持\n' +
    '<!-- 纯图按钮给读屏名字 -->\n' +
    '<Button AutomationProperties.Name="保存"\n' +
    '        Content="💾"/>\n' +
    '# 对话框默认按钮\n' +
    '<Button Content="确定" IsDefault="True"/>\n' +
    '<Button Content="取消" IsCancel="True"/>\n' +
    '# IsCancel: 按 Esc 自动触发取消',
};

if (typeof module !== 'undefined') module.exports = { dui6, dui7, dui8, dui9, dui10 };