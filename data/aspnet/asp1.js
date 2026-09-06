// ASP.NET Core 开发 1–5：入门与基础
const asp1 = {
  id: 'asp-intro',
  title: '1. 环境搭建与项目结构',
  category: '入门',
  version: '.NET 8',
  level: '入门',
  summary: '安装 SDK、dotnet CLI 建项目、理解 Program.cs 与启动流程，跑通第一个 Web 应用。',
  detail: [
    'ASP.NET Core 是微软的跨平台 Web 框架，跑在 Linux/macOS/Windows 上，基于 .NET 运行时。.NET 8 是当前 LTS 长期支持版本。',
    '环境：安装 .NET SDK（含 CLI），VSCode + C# 扩展或 Visual Studio 均可开发；学习用 VSCode + CLI 最轻量。',
    '建项目：dotnet new web（最小 API）、dotnet new webapi（带控制器示例）、dotnet new mvc（Razor 页面方案）。',
    'Program.cs 是入口：构建 WebApplicationBuilder、注册服务（builder.Services）、注册中间件（app.MapGet/UseXxx）、app.Run() 启动。',
    '项目结构：Program.cs 入口、appsettings.json 配置、Controllers/Models/Properties/launchSettings.json、wwwroot 静态资源。',
    '启动流程：Build() 组装管道 -> 运行 host -> Kestrel 监听端口（默认 localhost:5xxx，可用 launchSettings 或 --urls 改）。',
  ],
  notes: [
    '确认版本用 dotnet --list-sdks；跑起来用 dotnet run，Ctrl+C 停止。',
    '.NET 6+ 默认启用顶级语句（Top-level statements），Program.cs 很精简，不必写完整的 Main。',
  ],
  example:
    '# 安装与验证 SDK\n' +
    'dotnet --version          # 8.x\n' +
    'dotnet --list-sdks\n\n' +
    '# 创建最小 Web 应用\n' +
    'dotnet new web -n HelloApp\n' +
    'cd HelloApp\n' +
    'dotnet run                # 启动, 访问 http://localhost:5xxx\n\n' +
    '# Program.cs (最小 API)\n' +
    'var builder = WebApplication.CreateBuilder(args);\n' +
    'var app = builder.Build();\n' +
    'app.MapGet("/", () => "Hello World!");\n' +
    'app.Run();',
  example2:
    '# 创建带控制器的 Web API 项目\n' +
    'dotnet new webapi -n TodoApi\n' +
    'cd TodoApi\n' +
    'dotnet run\n' +
    '# 访问 /swagger 可看到接口文档(Swashbuckle)\n\n' +
    '# 项目结构\n' +
    'dotnet new webapi -n Demo --use-controllers  # 或 -controllers\n' +
    'tree Demo\n' +
    '#   Program.cs\n' +
    '#   Controllers/\n' +
    '#   Models/\n' +
    '#   appsettings.json\n' +
    '#   Properties/launchSettings.json',
  example3:
    '# 改监听端口 / 环境\n' +
    '# 方式1: 命令行\n' +
    'dotnet run --urls http://localhost:5000\n' +
    '# 方式2: 环境变量\n' +
    'ASPNETCORE_URLS=http://0.0.0.0:5000 dotnet run\n' +
    '# 方式3: launchSettings.json 里改\n\n' +
    '# 指定环境(开发/生产)\n' +
    'ASPNETCORE_ENVIRONMENT=Production dotnet run\n\n' +
    '# 发布发布版(用于部署)\n' +
    'dotnet publish -c Release -o ./publish\n' +
    'cd publish && ./HelloApp\n' +
    '# 跳过启动 banner 加环境变量 DOTNET_NOLOGO=1\n' +
    '# (亦可由 Program.cs 依环境做不同配置)',
};

const asp2 = {
  id: 'asp-di',
  title: '2. 依赖注入（DI）基础',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '理解 ASP.NET Core 内置 DI 容器：注册服务、生命期（单例/作用域/瞬时）、构造函数注入。',
  detail: [
    'DI（依赖注入）是 ASP.NET Core 的骨架：框架内置轻量容器，服务通过构造函数自动注入，降低耦合、便于测试。',
    '注册服务：builder.Services.AddTransient/AddScoped/AddSingleton<TInterface, TImpl>() 或 AddScoped<T>()。',
    '三种生命期：Transient 每次解析新建；Scoped 每个请求(作用域)内共享；Singleton 整个应用单例共享。',
    '构造函数注入：在控制器/服务的构造函数里声明接口参数，容器运行时自动传入实例。',
    '解析方式：构造函数注入最常用；偶用 app.Services.GetRequiredService<T>()（服务定位器，尽量少用）。',
    '作用域注意：Singleton 里注入 Scoped 服务会出错（无法从根容器解析作用域服务），需用 IServiceScopeFactory 显式建作用域。',
  ],
  notes: [
    '所有 AddXxx 都要放在 builder.Build() 之前调用。',
    'Singleton 捕获 Scoped 是易错点：内存里长期保留请求级对象，可能造成状态错乱/内存泄漏。',
  ],
  example:
    '// 接口与实现\n' +
    'public interface IGreeter\n' +
    '{\n' +
    '    string Greet(string name);\n' +
    '}\n' +
    'public class Greeter : IGreeter\n' +
    '{\n' +
    '    public string Greet(string name)\n' +
    '        => $\"Hello, {name}\";\n' +
    '}\n\n' +
    '// Program.cs 注册\n' +
    'builder.Services.AddScoped<IGreeter, Greeter>();\n' +
    'var app = builder.Build();\n' +
    'app.MapGet("/greet/{name}", (string name, IGreeter g)\n' +
    '    => g.Greet(name));\n' +
    'app.Run();',
  example2:
    '// 构造函数注入(控制器)\n' +
    'public class GreetController : ControllerBase\n' +
    '{\n' +
    '    private readonly IGreeter _g;\n' +
    '    public GreetController(IGreeter g)\n' +
    '        => _g = g;\n\n' +
    '    [HttpGet("greet/{name}")]\n' +
    '    public string Get(string name)\n' +
    '        => _g.Greet(name);\n' +
    '}',
  example3:
    '// 三种生命期对比\n' +
    'builder.Services.AddTransient<IOp, Op>();   // 每次新对象\n' +
    'builder.Services.AddScoped<IOp, Op>();      // 每请求一个\n' +
    'builder.Services.AddSingleton<IOp, Op>();   // 全局一个\n\n' +
    '// 在 Singleton 中安全使用 Scoped(显式作用域)\n' +
    'public class Worker\n' +
    '{\n' +
    '    private readonly IServiceScopeFactory _sf;\n' +
    '    public Worker(IServiceScopeFactory sf) => _sf = sf;\n\n' +
    '    public void Do()\n' +
    '    {\n' +
    '        using var scope = _sf.CreateScope();\n' +
    '        var repo = scope\n' +
    '            .ServiceProvider\n' +
    '            .GetRequiredService<IOrderRepo>();\n' +
    '        // 使用 repo...\n' +
    '    }\n' +
    '}',
};

const asp3 = {
  id: 'asp-middleware',
  title: '3. 中间件管道（Middleware）',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '理解请求流经中间件管道的顺序，编写自定义中间件做日志、异常处理、认证等横切关注点。',
  detail: [
    '中间件(Middleware)是处理 HTTP 请求的处理组件，按注册顺序串成管道：请求从外到里，响应从里到外返回。',
    '每段中间件可决定：直接短路(不调用 next，返回自己结果)或调用 next(context) 交给下一段，最后执行后续代码。',
    '内置常用中间件顺序（重要）：异常处理 -> HSTS -> HTTPS 重定向 -> 静态文件 -> 路由 -> CORS -> 认证 -> 授权 -> 自定义。顺序错了认证/授权可能失效。',
    '自定义中间件两种写法：Use() 内联 lambda，或独立类 + UseMiddleware<T>()。',
    'next(context) 之后的代码在"响应返回途中"执行，可用于给响应头/日志记录耗时等。',
    '顺序是中间件的核心：先注册的先处理请求、后处理响应；错误中间件应放最外层以捕获全程异常。',
  ],
  notes: [
    'app.UseAuthentication() 必须在使用授权(app.UseAuthorization)之前注册。',
    '用 Run() 注册的中间件是管道终点（不调用 next）。',
  ],
  example:
    '// 内联中间件示例\n' +
    'var app = builder.Build();\n\n' +
    'app.Use(async (context, next) =>\n' +
    '{\n' +
    '    var sw = System.Diagnostics.Stopwatch.StartNew();\n' +
    '    await next();                       // 交给下一段\n' +
    '    sw.Stop();\n' +
    '    Console.WriteLine($"{context.Request.Path} took {sw.ElapsedMilliseconds}ms");\n' +
    '});\n\n' +
    'app.Run(async context =>\n' +
    '    await context.Response.WriteAsync("Done"));\n' +
    'app.Run();',
  example2:
    '// 独立中间件类\n' +
    'public class RequestLogging\n' +
    '{\n' +
    '    private readonly RequestDelegate _next;\n' +
    '    public RequestLogging(RequestDelegate next) => _next = next;\n\n' +
    '    public async Task Invoke(HttpContext ctx)\n' +
    '    {\n' +
    '        Console.WriteLine($"IN  {ctx.Request.Method} {ctx.Request.Path}");\n' +
    '        await _next(ctx);\n' +
    '        Console.WriteLine($"OUT {ctx.Response.StatusCode}");\n' +
    '    }\n' +
    '}\n\n' +
    '// 注册\n' +
    'app.UseMiddleware<RequestLogging>();',
  example3:
    '// 异常处理中间件(置顶)\n' +
    'app.Use(async (ctx, next) =>\n' +
    '{\n' +
    '    try\n' +
    '    {\n' +
    '        await next();\n' +
    '    }\n' +
    '    catch (Exception ex)\n' +
    '    {\n' +
    '        ctx.Response.StatusCode = 500;\n' +
    '        await ctx.Response.WriteAsJsonAsync(new\n' +
    '        {\n' +
    '            error = ex.Message\n' +
    '        });\n' +
    '    }\n' +
    '});\n\n' +
    '// 推荐的完整顺序示例\n' +
    '// UseExceptionHandler -> UseHttpsRedirection ->\n' +
    '// UseStaticFiles -> UseRouting -> UseCors ->\n' +
    '// UseAuthentication -> UseAuthorization -> MapControllers/MapGet',
};

const asp4 = {
  id: 'asp-config',
  title: '4. 配置与选项模式',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '用 appsettings.json、环境变量、命令行管理配置，用 IOptions 类型化读取配置。',
  detail: [
    '配置系统支持多来源：appsettings.json、appsettings.{Environment}.json、环境变量、命令行、密钥库，按优先级合并。',
    '默认来源优先级（后覆盖前）：命令行 > 环境变量 > user secrets > appsettings.{env}.json > appsettings.json。',
    '读取简单值：注入 IConfiguration，config["ConnectionStrings:Default"]（冒号分隔层级）。',
    '选项模式(IOptions)：定义强类型类绑定某节，builder.Services.Configure<T>(config.GetSection("Xxx"))，再注入 IOptions<T>。',
    '三种选项接口：IOptions<T> 应用全生命周期读一次；IOptionsMonitor<T> 支持配置热更新+变更通知；IOptionsSnapshot<T> 每请求最新（Scoped）。',
    '敏感数据(连接串/密钥)别写死：开发用 user-secrets，生产用环境变量/密钥库。',
  ],
  notes: [
    '连接字符串在 appsettings 用冒号层级：{"ConnectionStrings": {"Default": "..."}} 取 config["ConnectionStrings:Default"]。',
    '绑定到类时属性名需与 JSON 一致（默认大小写不敏感）。',
  ],
  example:
    '// appsettings.json\n' +
    '{\n' +
    '  "ConnectionStrings": {\n' +
    '    "Default": "Data Source=app.db"\n' +
    '  },\n' +
    '  "Smtp": { "Host": "smtp.example.com", "Port": 587 }\n' +
    '}\n\n' +
    '// 强类型绑定(选项模式)\n' +
    'public class SmtpOptions\n' +
    '{\n' +
    '    public string Host { get; set; } = "";\n' +
    '    public int Port { get; set; } = 25;\n' +
    '}\n\n' +
    '// Program.cs\n' +
    'builder.Services.Configure<SmtpOptions>(\n' +
    '    builder.Configuration.GetSection("Smtp"));',
  example2:
    '// 在服务中读取选项\n' +
    'public class MailService\n' +
    '{\n' +
    '    private readonly IOptions<SmtpOptions> _opts;\n' +
    '    public MailService(IOptions<SmtpOptions> opts) => _opts = opts;\n\n' +
    '    public void Send()\n' +
    '    {\n' +
    '        var host = _opts.Value.Host;   // 读取\n' +
    '        // ...\n' +
    '    }\n' +
    '}\n\n' +
    '// 或者直接注入 IConfiguration\n' +
    'app.MapGet("/conn", (IConfiguration cfg)\n' +
    '    => cfg["ConnectionStrings:Default"]);',
  example3:
    '// 按不同环境覆盖配置\n' +
    '# appsettings.Production.json\n' +
    '# { "ConnectionStrings": { "Default": "Server=prod" } }\n\n' +
    '# 启动时读取哪个文件由 ASPNETCORE_ENVIRONMENT 决定\n' +
    'ASPNETCORE_ENVIRONMENT=Development dotnet run\n' +
    'ASPNETCORE_ENVIRONMENT=Production dotnet run\n\n' +
    '# 环境变量覆盖(层级用双下划线 __)\n' +
    'Smtp__Host=prod-smtp dotnet run\n\n' +
    '# 开发时密钥放 user-secrets\n' +
    'dotnet user-secrets init\n' +
    'dotnet user-secrets set "Smtp:Host" "dev-smtp"\n' +
    '# (避免密钥进 git)',
};

const asp5 = {
  id: 'asp-logging',
  title: '5. 日志与诊断',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '用内置 ILogger 记录日志、配置级别与输出，理解结构化日志与排查技巧。',
  detail: [
    'ASP.NET Core 内置 ILogger<> 日志抽象，默认输出到控制台；可接 Serilog 等实现输出到文件/日志服务。',
    '等级：Trace < Debug < Information < Warning < Error < Critical；在 appsettings 里按类别/全局配置最低级别。',
    '使用：构造函数注入 ILogger<MyService>，调用 _log.LogInformation("...{Id}", id) 结构化占位符。',
    '为什么用占位符而非字符串拼接：结构化日志让字段可被查询/过滤，且避免没必要时分配字符串。',
    '配置：Logging 节里 LogLevel.Default 与类别覆盖；可开 OpenTelemetry 输出分布式追踪。',
    '诊断工具：dotnet-trace/dotnet-counters 采集性能；Production 里打大量 Debug 日志会拖慢，务必调级别。',
  ],
  notes: [
    '用 ILogger.LogInformation/$"..." 拼接是反模式，用 "文本 {参数}" + 参数列表。',
    '敏感信息别打进日志(密码/token)，脱敏后再记。',
  ],
  example:
    '// 注入并使用日志\n' +
    'public class OrderService\n' +
    '{\n' +
    '    private readonly ILogger<OrderService> _log;\n' +
    '    public OrderService(ILogger<OrderService> log) => _log = log;\n\n' +
    '    public void Place(int orderId)\n' +
    '    {\n' +
    '        _log.LogInformation("Placing order {OrderId}", orderId);\n' +
    '        // 业务...\n' +
    '        _log.LogWarning("Order {OrderId} is slow", orderId);\n' +
    '    }\n' +
    '}',
  example2:
    '// appsettings.json 日志级别\n' +
    '{\n' +
    '  "Logging": {\n' +
    '    "LogLevel": {\n' +
    '      "Default": "Information",\n' +
    '      "Microsoft.AspNetCore": "Warning",\n' +
    '      "MyApp.Services.OrderService": "Debug"\n' +
    '    }\n' +
    '  }\n' +
    '}',
  example3:
    '// 接入 Serilog(控制台+文件, 简洁示例)\n' +
    '# 安装: dotnet add package Serilog.AspNetCore\n' +
    '# Program.cs\n' +
    'using Serilog;\n' +
    'Log.Logger = new LoggerConfiguration()\n' +
    '    .WriteTo.Console()\n' +
    '    .WriteTo.File("logs/app.log", rollingInterval: RollingInterval.Day)\n' +
    '    .CreateLogger();\n' +
    'builder.Host.UseSerilog();\n\n' +
    '# 运行后日志写入 logs/app-YYYYMMDD.log\n' +
    '# 结构化输出字段便于后续接 ES/日志平台',
};

if (typeof module !== 'undefined') module.exports = { asp1, asp2, asp3, asp4, asp5 };