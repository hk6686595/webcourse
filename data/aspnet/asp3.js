// ASP.NET Core 开发 11–15：数据与安全
const asp11 = {
  id: 'asp-ef-core',
  title: '11. EF Core 基础',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '用 Entity Framework Core 做 ORM：定义 DbContext、实体映射、迁移建库、基础 CRUD。',
  detail: [
    'EF Core 是 .NET 官方 ORM：用 C# 类(实体)映射数据库表，用 LINQ 查询，免写 SQL，跨数据库(SQLite/SQL Server/PostgreSQL/MySQL)。',
    '安装：dotnet add package Microsoft.EntityFrameworkCore.Sqlite（或对应数据库 Provider）+ Microsoft.EntityFrameworkCore.Design。',
    'DbContext：核心类，继承 DbContext，定义 DbSet<T> 属性代表表，重写 OnConfiguring 或注册方式配置连接串。',
    '映射：属性->列、有 Id 主键、导航属性表达外键关系(一对多/多对多)。',
    '迁移(Migrations)：代码先行工作流——dotnet ef migrations add Init 生成迁移，dotnet ef database update 更新数据库，数据库结构随代码版本管理。',
    'CRUD：Add/Update/Remove + SaveChangesAsync 提交；HTTP 层组合成服务方法。异步方法避免阻塞线程。',
  ],
  notes: [
    '安装 Design 包后需 dotnet tool install --global dotnet-ef 才可跑 ef 命令。',
    '迁移前先把 package 版本和 EF 版本一致(.NET 8 对应 EF Core 8)。',
  ],
  example:
    '// 1) 实体\n' +
    'public class Product\n' +
    '{\n' +
    '    public int Id { get; set; }\n' +
    '    public string Name { get; set; } = "";\n' +
    '    public decimal Price { get; set; }\n' +
    '    public DateTime CreatedAt { get; set; }\n' +
    '}\n\n' +
    '// 2) DbContext\n' +
    'public class AppDbContext : DbContext\n' +
    '{\n' +
    '    public AppDbContext(DbContextOptions<AppDbContext> o)\n' +
    '        : base(o) { }\n' +
    '    public DbSet<Product> Products => Set<Product>();\n' +
    '}\n\n' +
    '// 3) Program.cs 注册\n' +
    'builder.Services.AddDbContext<AppDbContext>(o =>\n' +
    '    o.UseSqlite(builder.Configuration\n' +
    '        .GetConnectionString("Default")));',
  example2:
    '// 生成迁移并建库\n' +
    '# 终端(项目根目录)\n' +
    'dotnet ef migrations add InitialCreate\n' +
    'dotnet ef database update\n\n' +
    '# 或在启动时若有表缺失自动建(开发期)\n' +
    '// using var scope = app.Services.CreateScope();\n' +
    '// scope.ServiceProvider.\n' +
    '//     GetRequiredService<AppDbContext>().Database.EnsureCreated();\n\n' +
    '# (生产建议用 migrate 命令而不是 EnsureCreated 自动建)',
  example3:
    '// CRUD 服务方法\n' +
    'public class ProductService\n' +
    '{\n' +
    '    private readonly AppDbContext _db;\n' +
    '    public ProductService(AppDbContext db) => _db = db;\n\n' +
    '    public async Task<IEnumerable<Product>> All()\n' +
    '        => await _db.Products.ToListAsync();\n\n' +
    '    public async Task<Product?> Get(int id)\n' +
    '        => await _db.Products.FindAsync(id);\n\n' +
    '    public async Task<Product> Create(Product p)\n' +
    '    {\n' +
    '        p.CreatedAt = DateTime.UtcNow;\n' +
    '        _db.Products.Add(p);\n' +
    '        await _db.SaveChangesAsync();\n' +
    '        return p;\n' +
    '    }\n\n' +
    '    public async Task Delete(int id)\n' +
    '    {\n' +
    '        var p = await Get(id);\n' +
    '        if (p is not null) { _db.Products.Remove(p);\n' +
    '            await _db.SaveChangesAsync(); }\n' +
    '    }\n' +
    '}',
};

const asp12 = {
  id: 'asp-ef-query',
  title: '12. EF Core 查询与关系',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: 'LINQ 查询、导航属性与预加载、过滤与投影、异步查询与性能要点。',
  detail: [
    'LINQ 查询：_db.Products.Where(x => x.Price > 10).OrderBy(...).ToListAsync()，会翻译成 SQL 在数据库执行(延迟执行)。',
    '关系建模：导航属性表达一对多。类 A Xxx = new(); 列表 ICollection<B> Yyy = new List<B>()。',
    '加载策略：默认懒加载不启用(.NET 3.0+ 移除了隐式)，需用 Include(x => x.Yyy) 预加载(JOIN) 或 ThenInclude 多级。',
    '投影：Select(x => new { x.Id, x.Name }) 只取需要的列，减少传输量并避免整个实体加载。',
    '过滤与聚合：CountAsync/SumAsync/GroupBy；AnyAsync 判断存在；FirstOrDefaultAsync/ SingleOrDefaultAsync。',
    '性能要点：禁止 N+1(循环里逐条查询)，用 Include 一次取；大批量操作用 ExecuteUpdateAsync(EF8) 直接发 SQL；注意跟踪与 AsNoTracking 只读优化。',
  ],
  notes: [
    '查询只读用 AsNoTracking() 避免追踪开销。',
    'ToAsyncEnumerable / 流式可能比 ToListAsync 更省内存，但一般 ToListAsync 足够。',
  ],
  example:
    'public class Order { public int Id { get; set; }\n' +
    '    public int CustomerId { get; set; }\n' +
    '    public Customer Customer { get; set; } = null!;\n' +
    '    public List<OrderItem> Items { get; set; } = new(); }\n' +
    'public class OrderItem { public int Id { get; set; }\n' +
    '    public int OrderId { get; set; }\n' +
    '    public string Sku { get; set; } = ""; }\n\n' +
    '// 预加载(避免 N+1)\n' +
    'var orders = await _db.Orders\n' +
    '    .Include(o => o.Customer)\n' +
    '    .Include(o => o.Items)\n' +
    '    .Where(o => o.CustomerId == cid)\n' +
    '    .ToListAsync();',
  example2:
    '// 投影 + 聚合\n' +
    'var projection = await _db.Orders\n' +
    '    .Where(o => o.CustomerId == cid)\n' +
    '    .Select(o => new\n' +
    '    {\n' +
    '        o.Id,\n' +
    '        CustomerName = o.Customer.Name,\n' +
    '        ItemCount = o.Items.Count\n' +
    '    })\n' +
    '    .ToListAsync();\n\n' +
    'var total = await _db.Orders\n' +
    '    .SumAsync(o => o.Total);\n' +
    'bool exists = await _db.Orders\n' +
    '    .AnyAsync(o => o.CustomerId == cid);',
  example3:
    '// 只读 + 高效批更新(EF Core 8 ExecuteUpdate)\n' +
    'var list = await _db.Products\n' +
    '    .AsNoTracking()\n' +
    '    .Where(p => p.Category == "old")\n' +
    '    .ToListAsync();\n\n' +
    '// 批量更新(不先加载实体的高效写法)\n' +
    'await _db.Products\n' +
    '    .Where(p => p.Category == "old")\n' +
    '    .ExecuteUpdateAsync(set =>\n' +
    '        set.SetProperty(p => p.Category, "new"));\n\n' +
    '// 批量删除\n' +
    'await _db.Orders\n' +
    '    .Where(o => o.CreatedAt < cutoff)\n' +
    '    .ExecuteDeleteAsync();',
};

const asp13 = {
  id: 'asp-identity',
  title: '13. ASP.NET Core Identity 认证',
  category: '安全',
  version: '.NET 8',
  level: '进阶',
  summary: '用 Identity 管理用户：注册登录、密码哈希、角色与基于 Cookie 的认证。',
  detail: [
    'Identity 是官方用户身份框架：提供用户/角色存储、密码哈希、登录 Cookie、双因素等，默认存 EF 表格(AspNetUsers/AspNetRoles...)。',
    '安装：Microsoft.AspNetCore.Identity.EntityFrameworkCore + 配置 DbContext 继承 IdentityDbContext<TUser> + UseAuthentication/UseAuthorization 中间件。',
    '密码安全：框架用适配器哈希(RFC 2898)自动加盐，不要自己存明文。',
    'Cookie 认证：登录成功后发 Set-Cookie；服务端靠 Cookie 识别请求，UseAuthentication 解析身份。',
    '注册/登录：UserManager<TUser> 管理用户(CreateAsync/CheckPasswordAsync)；SignInManager<TUser> 处理登录(SignInAsync)与退出。',
    '角色：IdentityRole 存角色，AddToRoleAsync；结合 [Authorize(Roles="Admin")] 做基于角色的控制。',
  ],
  notes: [
    'Cookie 认证默认在 Web App/MVC；纯 API 常用 JWT(见下篇)而不用 Cookie。',
    '遗留：Identity 默认需要 HTTPS 要求 Cookie 安全，开发环境可临时放宽。',
  ],
  example:
    '# 安装包\n' +
    'dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore\n' +
    '# DbContext 改为\n' +
    'public class AppDbContext(DbContextOptions<AppDbContext> o)\n' +
    '    : IdentityDbContext<IdentityUser>(o) { }\n\n' +
    '# Program.cs\n' +
    'builder.Services.AddDefaultIdentity<IdentityUser>()\n' +
    '    .AddEntityFrameworkStores<AppDbContext>();\n' +
    'app.UseAuthentication();\n' +
    'app.UseAuthorization();\n' +
    '# 迁移: dotnet ef migrations add IdentityUI\n' +
    '#       dotnet ef database update',
  example2:
    '// 注册 + 登录端点(注入服务)\n' +
    'public class AuthController(\n' +
    '    UserManager<IdentityUser> um,\n' +
    '    SignInManager<IdentityUser> sm) : ControllerBase\n' +
    '{\n' +
    '    [HttpPost("register")]\n' +
    '    public async Task<IActionResult> Register(string email, string pwd)\n' +
    '    {\n' +
    '        var user = new IdentityUser { UserName = email, Email = email };\n' +
    '        var r = await um.CreateAsync(user, pwd);   // 哈希存库\n' +
    '        return r.Succeeded ? Ok() : BadRequest(r.Errors);\n' +
    '    }\n\n' +
    '    [HttpPost("login")]\n' +
    '    public async Task<IActionResult> Login(string email, string pwd)\n' +
    '    {\n' +
    '        var user = await um.FindByEmailAsync(email);\n' +
    '        if (user is null ||\n' +
    '            !await um.CheckPasswordAsync(user, pwd)) return Unauthorized();\n' +
    '        await sm.SignInAsync(user, isPersistent: true); // 发 Cookie\n' +
    '        return Ok();\n' +
    '    }\n' +
    '}',
  example3:
    '# 用 [Authorize] 保护端点\n' +
    '// [Authorize]\n' +
    '// public class SecretController : ControllerBase\n' +
    '//   { [HttpGet] public IActionResult Get()\n' +
    '//       => Ok($"{User.Identity!.Name} 已登录"); }\n\n' +
    '# 分配角色\n' +
    '// await um.AddToRoleAsync(user, "Admin");\n\n' +
    '# 基于角色授权\n' +
    '// [Authorize(Roles = "Admin")]\n\n' +
    '# 获取当前用户身份\n' +
    '// User.Identity!.IsAuthenticated\n' +
    '// User.Identity!.Name            # 用户名',
};

const asp14 = {
  id: 'asp-jwt',
  title: '14. JWT Bearer 认证（API）',
  category: '安全',
  version: '.NET 8',
  level: '进阶',
  summary: '用 JWT 做无状态 API 认证：签发 Token、配置 Bearer 校验、[Authorize] 保护接口。',
  detail: [
    'JWT(JSON Web Token) 是自包含的 JSON 令牌，适合前后端分离/无状态 API：服务端不存会话，验证签名即可。',
    '结构 header.payload.signature，三个 Base64Url 段；payload 放 claims(用户ID/角色等)。签名用密钥(HS256)或公私钥(RS256)保证不被篡改。',
    '签发：用 JwtSecurityTokenHandler 创建，加密钥(Kestrel/配置里的 SigningKey)、过期时间、claims。',
    '配置校验：builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(选项)，配置 Authority 或直接设 IssuerSigningKey + ValidIssuer/ValidAudience。',
    'UseAuthentication 解析 Authorization: Bearer <token> 并验证，通过后设置 User 身份。',
    'Authorization 策略与身份结合：[Authorize]、Claim-based [Authorize(Policy=...)]。',
  ],
  notes: [
    '签名密钥(Secret)必须长且保密；生产用证书(RSA/ECDSA)或密钥库，别写死在代码。',
    'JWT 过期后令牌失效但无法主动吊销，这在无状态设计里的权衡；敏感场景配合短期 token+refresh。',
  ],
  example:
    '# 安装\n' +
    'dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer\n\n' +
    '# appsettings.json\n' +
    '# "Jwt": { "Issuer": "myapi", "Audience": "myclient",\n' +
    '#          "Key": "A-LONG-RANDOM-SECRET-KEY-LONGER-THAN-32-CHARACTERS" }\n\n' +
    '# Program.cs\n' +
    'builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)\n' +
    '    .AddJwtBearer(o =>\n' +
    '    {\n' +
    '        var j = builder.Configuration.GetSection("Jwt");\n' +
    '        o.TokenValidationParameters = new TokenValidationParameters\n' +
    '        {\n' +
    '            ValidateIssuer = true,\n' +
    '            ValidIssuer = j["Issuer"],\n' +
    '            ValidateAudience = true,\n' +
    '            ValidAudience = j["Audience"],\n' +
    '            ValidateLifetime = true,\n' +
    '            IssuerSigningKey = new SymmetricSecurityKey(\n' +
    '                Encoding.UTF8.GetBytes(j["Key"]!))\n' +
    '        };\n' +
    '    });\n' +
    'app.UseAuthentication();\n' +
    'app.UseAuthorization();',
  example2:
    '// 登录签发 JWT\n' +
    'var key = new SymmetricSecurityKey(\n' +
    '    Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));\n' +
    'var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);\n' +
    'var token = new JwtSecurityToken(\n' +
    '    issuer: cfg["Jwt:Issuer"],\n' +
    '    audience: cfg["Jwt:Audience"],\n' +
    '    claims: new[]\n' +
    '    {\n' +
    '        new Claim(JwtRegisteredClaimNames.Sub, user.Id),\n' +
    '        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),\n' +
    '        new Claim(ClaimTypes.Name, user.UserName ?? "")\n' +
    '    },\n' +
    '    expires: DateTime.UtcNow.AddHours(1),\n' +
    '    signingCredentials: creds);\n' +
    'var raw = new JwtSecurityTokenHandler().WriteToken(token);\n' +
    'return Ok(new { token = raw, expires = DateTime.UtcNow.AddHours(1) });',
  example3:
    '# 测试工具调用\n' +
    'TOKEN=$(curl -s -X POST localhost:5000/api/auth/login \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"email":"a@b.c","password":"secret"}\' \\\n' +
    '  | jq -r .token)\n' +
    'curl -s localhost:5000/api/secret \\\n' +
    '  -H "Authorization: Bearer $TOKEN"\n\n' +
    '# 保护端点\n' +
    '// [Authorize] public class SecretController : ControllerBase\n' +
    '//   { [HttpGet] public IActionResult Get()\n' +
    '//       => Ok($"用户 {User.Identity!.Name}"); }\n' +
    '# (无 token 访问返回 401)',
};

const asp15 = {
  id: 'asp-authorization',
  title: '15. 授权与策略',
  category: '安全',
  version: '.NET 8',
  level: '进阶',
  summary: '基于角色/声明/自定义策略的授权，AuthorizationHandler 实现细粒度权限控制。',
  detail: [
    '认证(Authentication)回答"你是谁"，授权(Authorization)回答"你能做什么"。ASP.NET Core 授权与认证解耦。',
    '基础方式：[Authorize] 要求登录；[Authorize(Roles="Admin,Manager")] 按角色；按声明 [Authorize(Policy=...)]。',
    '策略(Policy)是核心抽象：AddAuthorization(options => options.AddPolicy("name", p => p.RequireClaim(...).RequireRole(...)))。',
    'RequireRole / RequireClaim / RequireAssertion / RequireAuthenticatedUser 等组合成策略。',
    '自定义 Handler：实现 AuthorizationHandler<TRequirement>，在 HandleRequirementAsync 里做复杂判断(如资源属主)，写完注册。',
    '资源级授权：操作当前资源(如能否编辑这篇文档)，通常在控制器里注入 IAuthorizationService 调 AuthorizeAsync(user, resource, requirement)。',
  ],
  notes: [
    '策略在 Program.cs 的 AddAuthorization 里集中配置，便于统一管理。',
    '角色是声明(ClaimType=Role)的一种，角色授权本质是声明授权依赖。',
  ],
  example:
    '// 声明式策略\n' +
    'builder.Services.AddAuthorization(o =>\n' +
    '{\n' +
    '    o.AddPolicy("AdultOnly", p =>\n' +
    '        p.RequireClaim("Age", "18")\n' +
    '         .RequireAuthenticatedUser());\n' +
    '    o.AddPolicy("CanManageOrders", p =>\n' +
    '        p.RequireRole("Admin", "Manager"));\n' +
    '});\n\n' +
    '// 使用\n' +
    '// [Authorize(Policy = "CanManageOrders")]\n' +
    '// public class OrdersController : ControllerBase { }',
  example2:
    '// 自定义 requirement + handler\n' +
    'public class IsOwnerRequirement : IAuthorizationRequirement { }\n' +
    'public class IsOwnerHandler : AuthorizationHandler<IsOwnerRequirement>\n' +
    '{\n' +
    '    private readonly IHttpContextAccessor _acc;\n' +
    '    public IsOwnerHandler(IHttpContextAccessor acc) => _acc = acc;\n\n' +
    '    protected override Task HandleRequirementAsync(\n' +
    '        AuthorizationHandlerContext ctx, IsOwnerRequirement req)\n' +
    '    {\n' +
    '        var resource = ctx.Resource as Document;\n' +
    '        if (resource != null &&\n' +
    '            resource.OwnerId == ctx.User.FindFirstValue(ClaimTypes.NameIdentifier))\n' +
    '            ctx.Succeed(req);          // 通过\n' +
    '        return Task.CompletedTask;\n' +
    '    }\n' +
    '}\n' +
    '// 注册: builder.Services.AddSingleton<IAuthorizationHandler, IsOwnerHandler>();\n' +
    '//      options.AddPolicy("DocOwner", p => p.Requirements.Add(new IsOwnerRequirement()));',
  example3:
    '// 资源级授权(注入 IAuthorizationService)\n' +
    'public class DocsController(\n' +
    '    IAuthorizationService auth)\n' +
    '    : ControllerBase\n' +
    '{\n' +
    '    [HttpPut("documents/{id}")]\n' +
    '    public async Task<IActionResult> Update(int id, Document doc)\n' +
    '    {\n' +
    '        var r = await auth.AuthorizeAsync(User, doc, "DocOwner");\n' +
    '        if (!r.Succeeded) return Forbid();\n' +
    '        return Ok();\n' +
    '    }\n' +
    '}\n\n' +
    '# 区别: 401=未认证(Anonymous), 403=已认证但无权限(Forbid)',
};

if (typeof module !== 'undefined') module.exports = { asp11, asp12, asp13, asp14, asp15 };