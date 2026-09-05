// 微软全栈开发 1–5：架构概览与 Blazor 入门
const msfs1 = {
  id: 'msfs-arch',
  title: '1. 微软全栈架构概览',
  category: '架构',
  version: '.NET 8',
  level: '入门',
  summary: '理解微软全栈技术栈：ASP.NET Core + Blazor + EF Core + Identity + SignalR + Azure，掌握整体架构设计思路。',
  detail: [
    '微软全栈开发是指使用微软技术栈构建完整的 Web 应用，涵盖前端、后端、数据库、身份认证和云部署。',
    '核心技术栈：ASP.NET Core（后端API）、Blazor（前端UI）、Entity Framework Core（ORM）、ASP.NET Core Identity（认证授权）、SignalR（实时通信）。',
    '前端方案选择：Blazor WebAssembly（客户端渲染）、Blazor Server（服务端渲染）、Blazor Hybrid（混合模式，可嵌入桌面/移动）。',
    '数据层：EF Core 支持 SQL Server、PostgreSQL、SQLite 等多种数据库，提供 Code First 迁移和 LINQ 查询。',
    '安全层：ASP.NET Core Identity 提供用户管理、角色、JWT/OAuth 认证，可集成 Azure AD、GitHub 等外部提供商。',
    '部署平台：Azure App Service、Azure Container Apps、Docker、IIS，支持 CI/CD 自动化发布。',
  ],
  notes: [
    '微软全栈的优势：统一技术栈（C#）、强大的 IDE 支持（VS/VSCode）、完善的文档和社区。',
    '学习路径建议：先掌握 ASP.NET Core 基础，再学习 Blazor，最后集成其他组件。',
  ],
  example:
    '# 微软全栈技术栈概览\n' +
    '┌─────────────────────────────────────────┐\n' +
    '│           前端 (Blazor)                  │\n' +
    '│  WebAssembly / Server / Hybrid          │\n' +
    '├─────────────────────────────────────────┤\n' +
    '│           后端 (ASP.NET Core)            │\n' +
    '│  Minimal API / Controllers / gRPC       │\n' +
    '├─────────────────────────────────────────┤\n' +
    '│           数据层 (EF Core)               │\n' +
    '│  SQL Server / PostgreSQL / SQLite       │\n' +
    '├─────────────────────────────────────────┤\n' +
    '│           安全 (Identity)                │\n' +
    '│  JWT / OAuth / Azure AD                 │\n' +
    '├─────────────────────────────────────────┤\n' +
    '│           实时 (SignalR)                 │\n' +
    '│  WebSocket / Hub / 聊天室               │\n' +
    '├─────────────────────────────────────────┤\n' +
    '│           部署 (Azure)                   │\n' +
    '│  App Service / Container / CI/CD        │\n' +
    '└─────────────────────────────────────────┘',
  example2:
    '# 创建全栈项目\n' +
    'dotnet new blazorwasm -n MyApp\n' +
    'cd MyApp\n\n' +
    '# 添加 ASP.NET Core Web API\n' +
    'dotnet new webapi -n MyApp.Api\n\n' +
    '# 添加 EF Core\n' +
    'dotnet add package Microsoft.EntityFrameworkCore.SqlServer\n' +
    'dotnet add package Microsoft.EntityFrameworkCore.Tools',
  example3:
    '# 项目结构建议\n' +
    'MyApp/\n' +
    '├── MyApp.Api/           # 后端 API\n' +
    '│   ├── Controllers/\n' +
    '│   ├── Models/\n' +
    '│   ├── Data/\n' +
    '│   └── Program.cs\n' +
    '├── MyApp.Client/        # Blazor 前端\n' +
    '│   ├── Pages/\n' +
    '│   ├── Components/\n' +
    '│   └── Program.cs\n' +
    '├── MyApp.Shared/        # 共享类库\n' +
    '│   └── DTOs/\n' +
    '└── MyApp.sln',
};

const msfs2 = {
  id: 'msfs-blazor-intro',
  title: '2. Blazor WebAssembly 入门',
  category: '前端',
  version: '.NET 8',
  level: '入门',
  summary: '搭建 Blazor WebAssembly 项目，理解 Razor 语法、组件生命周期、JS 互操作，运行第一个客户端应用。',
  detail: [
    'Blazor WebAssembly (WASM) 是微软的前端框架，使用 C# 替代 JavaScript 构建交互式 Web UI，运行在浏览器中。',
    '与 JS 框架对比：React/Vue 用 JS/TS，Blazor 用 C#；WASM 版本在浏览器中运行 .NET 运行时，无需服务器。',
    'Razor 语法：@code 定义 C# 逻辑，@foreach/@if 渲染 HTML，@onclick 绑定事件，@bind 双向绑定。',
    '组件模型：.razor 文件即组件，支持参数(@parameter)、事件回调(@onclick)、插件(Content)、级联值(CascadingValue)。',
    '生命周期：OnInitializedAsync（初始化）、OnParametersSet（参数更新）、OnAfterRender（DOM 渲染后）。',
    'JS 互操作：通过 IJSRuntime 调用 JS 函数，JS 也可调用 .NET 方法，实现与现有 JS 库集成。',
  ],
  notes: [
    'Blazor WASM 首次加载较大（约 5-10MB），后续缓存后秒开；可用 AOT 编译优化。',
    '调试：VS/VSCode 支持断点调试 C# 代码，Chrome DevTools 也可查看。',
  ],
  example:
    '@page "/counter"\n\n' +
    '<h3>Counter</h3>\n\n' +
    '<p>Current count: @currentCount</p>\n\n' +
    '<button class="btn btn-primary" @onclick="IncrementCount">Click me</button>\n\n' +
    '@code {\n' +
    '    private int currentCount = 0;\n\n' +
    '    private void IncrementCount()\n' +
    '    {\n' +
    '        currentCount++;\n' +
    '    }\n' +
    '}',
  example2:
    '// 带参数的组件\n' +
    '// Welcome.razor\n' +
    '@code {\n' +
    '    [Parameter]\n' +
    '    public string Name { get; set; } = "World";\n' +
    '}\n\n' +
    '<h3>Hello, @Name!</h3>\n\n' +
    '// 使用组件\n' +
    '<Welcome Name="Developer" />',
  example3:
    '// JS 互操作\n' +
    '@inject IJSRuntime JS\n\n' +
    '@code {\n' +
    '    protected override async Task OnInitializedAsync()\n' +
    '    {\n' +
    '        // 调用 JS 函数\n' +
    '        var result = await JS.InvokeAsync<string>(\n' +
    '            "eval", "navigator.userAgent");\n' +
    '        Console.WriteLine(result);\n' +
    '    }\n\n' +
    '    // JS 调用 .NET 方法\n' +
    '    [JSInvokable]\n' +
    '    public static Task<string> DotNetMethod()\n' +
    '        => Task.FromResult("Hello from .NET!");\n' +
    '}',
};

const msfs3 = {
  id: 'msfs-blazor-server',
  title: '3. Blazor Server 实时交互',
  category: '前端',
  version: '.NET 8',
  level: '入门',
  summary: '理解 Blazor Server 工作原理、SignalR 连接、状态管理、与 WASM 的区别，构建实时交互应用。',
  detail: [
    'Blazor Server 在服务端运行组件，通过 SignalR（WebSocket）将 UI 更新推送到浏览器，无需下载 .NET 运行时。',
    '工作原理：用户操作 -> SignalR 发送到服务器 -> 服务器处理 -> 差异化更新 DOM -> 推送到浏览器。',
    '优势：首屏加载快（约 200KB）、支持完整 .NET API、适合企业内网应用。',
    '劣势：需要持续的 WebSocket 连接、服务器压力较大、离线不可用。',
    '状态管理：组件状态保存在服务器内存中，断线重连可恢复（需配置 StateProvider）。',
    '与 WASM 选择：WASM 适合面向公网的 SPA，Server 适合企业内网、需要访问服务器资源的场景。',
  ],
  notes: [
    'Blazor Server 默认使用 SignalR，需在 Program.cs 中添加 app.MapBlazorHub()。',
    '断线重连：配置 ReconnectInterval 和具体策略，用户体验更佳。',
  ],
  example:
    '// Program.cs (Server)\n' +
    'var builder = WebApplication.CreateBuilder(args);\n' +
    'builder.Services.AddRazorComponents()\n' +
    '    .AddInteractiveServerComponents();\n\n' +
    'var app = builder.Build();\n' +
    'app.UseStaticFiles();\n' +
    'app.MapRazorComponents<App>();\n' +
    'app.Run();',
  example2:
    '// 带交互的组件\n' +
    '@page "/chat"\n' +
    '@rendermode InteractiveServer\n\n' +
    '<h3>Chat Room</h3>\n\n' +
    '<div>\n' +
    '    @foreach (var msg in messages)\n' +
    '    {\n' +
    '        <p><b>@msg.User</b>: @msg.Text</p>\n' +
    '    }\n' +
    '</div>\n\n' +
    '<input @bind="newMessage" />\n' +
    '<button @onclick="Send">Send</button>\n\n' +
    '@code {\n' +
    '    private List<Message> messages = new();\n' +
    '    private string newMessage = "";\n\n' +
    '    private void Send()\n' +
    '    {\n' +
    '        messages.Add(new Message("User", newMessage));\n' +
    '        newMessage = "";\n' +
    '    }\n' +
    '}',
  example3:
    '// 状态管理示例\n' +
    '@page "/state"\n' +
    '@rendermode InteractiveServer\n' +
    '@inject ILogger<StateExample> Logger\n\n' +
    '<p>Count: @count</p>\n' +
    '<button @onclick="Increment">+1</button>\n\n' +
    '@code {\n' +
    '    private int count = 0;\n\n' +
    '    private void Increment()\n' +
    '    {\n' +
    '        count++;\n' +
    '        Logger.LogInformation("Count: {Count}", count);\n' +
    '    }\n\n' +
    '    protected override void OnInitialized()\n' +
    '    {\n' +
    '        Logger.LogInformation("Component initialized");\n' +
    '    }\n' +
    '}',
};

const msfs4 = {
  id: 'msfs-efcore',
  title: '4. Entity Framework Core 数据访问',
  category: '数据',
  version: '.NET 8',
  level: '入门',
  summary: '掌握 EF Core 基础：DbContext、实体配置、CRUD 操作、LINQ 查询、迁移与数据库生成。',
  detail: [
    'EF Core 是微软的 ORM 框架，将 C# 对象映射到数据库表，消除手写 SQL 的繁琐，支持 LINQ 强类型查询。',
    'DbContext：数据库会话，管理实体状态、变更跟踪、保存；继承 DbContext 并配置 DbSet<T> 属性。',
    '实体配置：Data Annotations（[Key]、[Required]）或 Fluent API（modelBuilder.Entity<T>().HasKey()）。',
    'CRUD 操作：Add/Update/Remove + SaveChangesAsync()；查询用 Where/OrderBy/Include 等 LINQ。',
    '迁移（Migration）：dotnet ef migrations add Xxx -> dotnet ef database update，跟踪模型变更。',
    '数据库支持：SQL Server（AddSqlServer）、PostgreSQL（AddNpgsql）、SQLite（AddSqlite）。',
  ],
  notes: [
    '生产环境建议用 Fluent API 配置，比 Data Annotations 更灵活。',
    '避免 N+1 查询问题：用 Include() 加载关联数据，或用 Split Query 分拆。',
  ],
  example:
    '// 实体定义\n' +
    'public class Product\n' +
    '{\n' +
    '    public int Id { get; set; }\n' +
    '    [Required]\n' +
    '    public string Name { get; set; } = "";\n' +
    '    public decimal Price { get; set; }\n' +
    '    public int CategoryId { get; set; }\n' +
    '    public Category Category { get; set; } = null!;\n' +
    '}\n\n' +
    'public class Category\n' +
    '{\n' +
    '    public int Id { get; set; }\n' +
    '    public string Name { get; set; } = "";\n' +
    '    public List<Product> Products { get; set; } = new();\n' +
    '}',
  example2:
    '// DbContext 配置\n' +
    'public class AppDbContext : DbContext\n' +
    '{\n' +
    '    public DbSet<Product> Products => Set<Product>();\n' +
    '    public DbSet<Category> Categories => Set<Category>();\n\n' +
    '    protected override void OnConfiguring(\n' +
    '        DbContextOptionsBuilder options)\n' +
    '    {\n' +
    '        options.UseSqlServer(\n' +
    '            "Server=.;Database=MyApp;Trusted_Connection=True;");\n' +
    '    }\n\n' +
    '    protected override void OnModelCreating(\n' +
    '        ModelBuilder modelBuilder)\n' +
    '    {\n' +
    '        modelBuilder.Entity<Product>()\n' +
    '            .HasOne(p => p.Category)\n' +
    '            .WithMany(c => c.Products)\n' +
    '            .HasForeignKey(p => p.CategoryId);\n' +
    '    }\n' +
    '}',
  example3:
    '// CRUD 示例\n' +
    'await using var db = new AppDbContext();\n\n' +
    '// 创建\n' +
    'var product = new Product { Name = "Laptop", Price = 999 };\n' +
    'db.Products.Add(product);\n' +
    'await db.SaveChangesAsync();\n\n' +
    '// 查询\n' +
    'var cheap = await db.Products\n' +
    '    .Where(p => p.Price < 500)\n' +
    '    .OrderBy(p => p.Name)\n' +
    '    .Include(p => p.Category)\n' +
    '    .ToListAsync();\n\n' +
    '// 更新\n' +
    'product.Price = 899;\n' +
    'await db.SaveChangesAsync();\n\n' +
    '// 删除\n' +
    'db.Products.Remove(product);\n' +
    'await db.SaveChangesAsync();',
};

const msfs5 = {
  id: 'msfs-identity',
  title: '5. Identity 身份认证与授权',
  category: '安全',
  version: '.NET 8',
  level: '入门',
  summary: '使用 ASP.NET Core Identity 实现用户注册登录、JWT 认证、角色授权、Claims 与策略授权。',
  detail: [
    'ASP.NET Core Identity 是完整的身份管理系统：用户注册、登录、密码重置、双因素认证、外部登录提供商。',
    '核心概念：IdentityUser（用户）、IdentityRole（角色）、UserManager（用户管理）、SignInManager（登录管理）。',
    '认证方式：Cookie 认证（传统 Web 应用）、JWT Bearer（API/SPA）、OAuth/OpenID Connect（第三方登录）。',
    '授权机制：[Authorize] 特性、角色要求（[Authorize(Roles="Admin")]）、策略授权（AddPolicy）。',
    'Claims：用户属性的键值对（如 name、email），可用于细粒度权限控制。',
    'JWT 流程：用户登录 -> 服务器验证 -> 签发 JWT -> 客户端存储 -> 后续请求携带 -> 服务器验证令牌。',
  ],
  notes: [
    '生产环境必须使用 HTTPS，JWT 密钥要足够长且保密。',
    '密码策略：最低长度、必需特殊字符、锁定策略，通过 IdentityOptions 配置。',
  ],
  example:
    '// Program.cs 配置 Identity\n' +
    'builder.Services.AddDbContext<AppDbContext>(opt =>\n' +
    '    opt.UseSqlServer(connStr));\n\n' +
    'builder.Services.AddIdentity<IdentityUser, IdentityRole>()\n' +
    '    .AddEntityFrameworkStores<AppDbContext>()\n' +
    '    .AddDefaultTokenProviders();\n\n' +
    'builder.Services.AddAuthentication()\n' +
    '    .AddJwtBearer(opt =>\n' +
    '    {\n' +
    '        opt.TokenValidationParameters = new()\n' +
    '        {\n' +
    '            ValidateIssuer = true,\n' +
    '            ValidateAudience = true,\n' +
    '            ValidateLifetime = true,\n' +
    '            ValidIssuer = "MyApp",\n' +
    '            ValidAudience = "MyApp",\n' +
    '            IssuerSigningKey = new SymmetricSecurityKey(\n' +
    '                Encoding.UTF8.GetBytes(secret))\n' +
    '        };\n' +
    '    });',
  example2:
    '// 注册/登录 API\n' +
    '[ApiController]\n' +
    '[Route("api/[controller]")]\n' +
    'public class AuthController : ControllerBase\n' +
    '{\n' +
    '    private readonly UserManager<IdentityUser> _userManager;\n' +
    '    private readonly SignInManager<IdentityUser> _signIn;\n\n' +
    '    [HttpPost("register")]\n' +
    '    public async Task<IActionResult> Register(\n' +
    '        RegisterDto dto)\n' +
    '    {\n' +
    '        var user = new IdentityUser { UserName = dto.Email,\n' +
    '            Email = dto.Email };\n' +
    '        var result = await _userManager.CreateAsync(\n' +
    '            user, dto.Password);\n' +
    '        if (!result.Succeeded)\n' +
    '            return BadRequest(result.Errors);\n' +
    '        return Ok();\n' +
    '    }\n' +
    '}',
  example3:
    '// JWT 生成示例\n' +
    'private string GenerateJwt(IdentityUser user)\n' +
    '{\n' +
    '    var claims = new[]\n' +
    '    {\n' +
    '        new Claim(ClaimTypes.Name, user.UserName!),\n' +
    '        new Claim(ClaimTypes.Email, user.Email!),\n' +
    '        new Claim(JwtRegisteredClaimNames.Jti,\n' +
    '            Guid.NewGuid().ToString())\n' +
    '    };\n\n' +
    '    var key = new SymmetricSecurityKey(\n' +
    '        Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));\n' +
    '    var creds = new SigningCredentials(\n' +
    '        key, SecurityAlgorithms.HmacSha256);\n\n' +
    '    var token = new JwtSecurityToken(\n' +
    '        issuer: "MyApp",\n' +
    '        audience: "MyApp",\n' +
    '        claims: claims,\n' +
    '        expires: DateTime.UtcNow.AddHours(1),\n' +
    '        signingCredentials: creds);\n\n' +
    '    return new JwtSecurityTokenHandler()\n' +
    '        .WriteToken(token);\n' +
    '}',
};

if (typeof module !== 'undefined') module.exports = { msfs1, msfs2, msfs3, msfs4, msfs5 };
