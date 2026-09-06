// ASP.NET Core 开发 16–20：文件/实时/缓存/部署/实战
const asp16 = {
  id: 'asp-uploads-static',
  title: '16. 文件上传与静态文件',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '提供 wwwroot 静态文件、实现文件上传(流式写盘)、MIME 限制与安全校验。',
  detail: [
    '静态文件：app.UseStaticFiles() 提供 wwwroot 下的 CSS/JS/图片；默认禁止目录浏览；可选 UseFileServer 加默认页。',
    '上传原理：前端 multipart/form-data POST，后端用 IFormFile 绑定接收。',
    '接收大文件：用 IFormFile.CopyToAsync 或流式读取流到目标文件；限制体积防内存溢出(默认表单限制可配置)。',
    '文件名安全：永远不要信任客户端文件名——用 GUID 重命名存储，扩展名白名单校验，防路径穿越/恶意文件。',
    '存储：本地磁盘或云存储(S3/Azure Blob)；上传后把 URL 存库。',
    '下载/预览：静态文件用 UseStaticFiles 提供；动态文件可用 FileStreamResult 返回。',
  ],
  notes: [
    '路径穿越：绝不把用户输入直接拼进路径，用 Path.GetFileName 只取文件名并校验。',
    '上传体积默认上限 30MB(ASP.NET Core)，可调 FormOptions.MultipartBodyLengthLimit。',
  ],
  example:
    '# 前端 HTML\n' +
    '<form method="post" action="/api/upload"\n' +
    '      enctype="multipart/form-data">\n' +
    '  <input type="file" name="file">\n' +
    '  <button>上传</button>\n' +
    '</form>\n\n' +
    '# 启用静态文件 + 限制上传体积\n' +
    'app.UseStaticFiles();\n' +
    'builder.Services.Configure<FormOptions>(o =>\n' +
    '    o.MultipartBodyLengthLimit = 50 * 1024 * 1024);',
  example2:
    '// 上传端点(安全重命名 + 白名单)\n' +
    'private static readonly string[] Allow =\n' +
    '    { ".png", ".jpg", ".jpeg", ".gif", ".pdf" };\n\n' +
    '[HttpPost("api/upload")]\n' +
    'public async Task<IActionResult> Upload(IFormFile file)\n' +
    '{\n' +
    '    var ext = Path.GetExtension(file.FileName).ToLower();\n' +
    '    if (!Allow.Contains(ext)) return BadRequest("不允许的文件类型");\n\n' +
    '    var name = Guid.NewGuid().ToString("N") + ext;\n' +
    '    var path = Path.Combine(_wwwroot, "uploads", name);\n' +
    '    await using var s = System.IO.File.Create(path);\n' +
    '    await file.CopyToAsync(s);          // 流式写入\n' +
    '    return Ok(new { url = $"/uploads/{name}" });\n' +
    '}',
  example3:
    '// 动态文件下载(生成报表/导出)\n' +
    '[HttpGet("api/export")]\n' +
    'public async Task<IActionResult> Export()\n' +
    '{\n' +
    '    var bytes = System.Text.Encoding.UTF8.GetBytes("id,name\\n1,foo\\n");\n' +
    '    return File(bytes, "text/csv", "report.csv");\n' +
    '}\n\n' +
    '# 目录浏览(危险,生产别开)\n' +
    '// app.UseDirectoryBrowser();\n\n' +
    '# 默认文档(index.html)\n' +
    '// app.UseDefaultFiles();  // 放在 UseStaticFiles 前',
};

const asp17 = {
  id: 'asp-signalr',
  title: '17. SignalR 实时通信',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '用 SignalR 实现服务端主动推送：Hub、客户端调用、群组与常见应用(聊天/通知/协作)。',
  detail: [
    'SignalR 是实时通信库：服务端可主动向客户端推送，自动在 WebSocket/Server-Sent Events/Long-Polling 间协商降级。',
    'Hub 是核心：定义方法，客户端调用；服务端可用 Clients.All/Clients.Group/Clients.User 群发或定向推送。',
    '建立连接：客户端经 /hubName 连上来；连接会维持，服务端 Invoke 方法把数据推给对应客户端。',
    '分组(Group)：把连接加进逻辑组(如房间/频道)，向整组推送；适合聊天室、协作文档。',
    '身份识别：连接关联到登录用户(Clients.User(userId) 按用户推送)，需配置身份提供者。',
    '前端配合：@microsoft/signalr JS 库；后端 .NET 客户端用 SignalR.Client 包。',
  ],
  notes: [
    'Hub 方法应返回 Task，重逻辑别阻塞；推送是去中心化的，客户端暂时离线消息会丢失(需持久化做离线补发)。',
    '服务端可用 CancellationToken 感知客户端断开。',
  ],
  example:
    '# 安装\n' +
    'dotnet add package Microsoft.AspNetCore.SignalR\n\n' +
    '# Program.cs\n' +
    'builder.Services.AddSignalR();\n' +
    'var app = builder.Build();\n' +
    'app.MapHub<ChatHub>("/hubs/chat");       // 端点\n\n' +
    'public class ChatHub : Hub\n' +
    '{\n' +
    '    public async Task Send(string user, string msg)\n' +
    '        => await Clients.All.SendAsync("Receive", user, msg);\n' +
    '}',
  example2:
    '// 分组 + 加入房间\n' +
    'public class RoomHub : Hub\n' +
    '{\n' +
    '    public async Task JoinRoom(string room)\n' +
    '        => await Groups.AddToGroupAsync(Context.ConnectionId, room);\n\n' +
    '    public async Task LeaveRoom(string room)\n' +
    '        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, room);\n\n' +
    '    public async Task Broadcast(string room, string msg)\n' +
    '        => await Clients.Group(room)\n' +
    '            .SendAsync("msg", Context.User?.Identity?.Name, msg);\n' +
    '}',
  example3:
    '# 前端 JS\n' +
    'const conn = new signalR.HubConnectionBuilder()\n' +
    '    .withUrl("/hubs/chat")\n' +
    '    .build();\n' +
    'conn.on("Receive", (user, msg) =>\n' +
    '    console.log(user + ": " + msg));\n' +
    'await conn.start();\n' +
    'conn.invoke("Send", "alice", "hello");\n\n' +
    '# 服务端主动推送(如新订单通知)\n' +
    '// 在某服务里注入 IHubContext<OrderHub>\n' +
    'public class OrderHub : Hub { }\n' +
    '// var hub = httpContext.RequestServices\n' +
    '//     .GetRequiredService<IHubContext<OrderHub>>();\n' +
    '// await hub.Clients.All.SendAsync("newOrder", order);',
};

const asp18 = {
  id: 'asp-caching',
  title: '18. 缓存与性能优化',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '内存缓存、分布式缓存(Redis)、响应缓存与输出缓存，提升接口与页面性能。',
  detail: [
    '缓存目标：减少重复计算/数据库访问，常用于热点数据(配置、热门列表、高耗时查询)。',
    'IMemoryCache：进程内缓存，适合单实例；GetOrCreateAsync + 绝对/滑动过期 + 缓存键设计。',
    '分布式缓存(IDistributedCache)：多实例共享，用 Redis/SQL Server 后端，存字节/JSON，跨进程一致。',
    '响应缓存(Response Caching)：按 HTTP 缓存头让浏览器/CDN 缓存 GET 响应，减少服务端压力。',
    '输出缓存(Output Caching)：.NET 8 服务端缓存整个响应(含动态页面)，比内存缓存更省。',
    '缓存键设计：包含影响结果的所有参数(url/query/依赖版本)；失效策略用绝对过期+滑动过期配合。',
  ],
  notes: [
    '缓存是权衡：要有数据一致性策略；写入后主动失效(Remove 旧 key)。',
    '分布式缓存 JSON 序列化：存 string，读时反序列化，注意类型与版本。',
  ],
  example:
    '// 内存缓存\n' +
    'public class CatalogService\n' +
    '{\n' +
    '    private readonly IMemoryCache _cache;\n' +
    '    public CatalogService(IMemoryCache cache) => _cache = cache;\n\n' +
    '    public async Task<List<Product>> TopSellers()\n' +
    '        => await _cache.GetOrCreateAsync("top-sellers", async e =>\n' +
    '        {\n' +
    '            e.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);\n' +
    '            return await _db.Products\n' +
    '                .OrderByDescending(p => p.Sales)\n' +
    '                .Take(10).ToListAsync();\n' +
    '        }) ?? new();\n' +
    '}\n' +
    'builder.Services.AddMemoryCache();',
  example2:
    '// Redis 分布式缓存\n' +
    '# 安装: dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis\n' +
    'builder.Services.AddStackExchangeRedisCache(o =>\n' +
    '    o.Configuration = "localhost:6379");\n\n' +
    'var dist = httpContext.RequestServices\n' +
    '    .GetRequiredService<IDistributedCache>();\n' +
    'var cached = await dist.GetStringAsync("profile:" + userId);\n' +
    'if (cached is null)\n' +
    '{\n' +
    '    cached = System.Text.Json.JsonSerializer.Serialize(profile);\n' +
    '    await dist.SetStringAsync("profile:" + userId, cached,\n' +
    '        new DistributedCacheEntryOptions\n' +
    '        {\n' +
    '            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)\n' +
    '        });\n' +
    '}',
  example3:
    '# 输出缓存(服务端整响应缓存,.NET 8)\n' +
    'builder.Services.AddOutputCache();\n' +
    'app.UseOutputCache();\n\n' +
    '[HttpGet("api/weather")]\n' +
    '[OutputCache(Duration = 60)]       // 缓存60秒\n' +
    'public IActionResult Weather()\n' +
    '    => Ok(new { now = DateTime.UtcNow });\n\n' +
    '# 响应缓存头让浏览器缓存\n' +
    '# [ResponseCache(Duration = 60)]\n\n' +
    '# 基准测试工具\n' +
    '# dotnet tool install --global dotnet-counters\n' +
    '# dotnet-counters monitor --process-id <PID> --counters System.Runtime',
};

const asp19 = {
  id: 'asp-deploy',
  title: '19. 部署与上线',
  category: '部署',
  version: '.NET 8',
  level: '进阶',
  summary: 'Kestrel vs IIS、环境配置、Docker 容器化、反向代理 Nginx、健康检查与上线策略。',
  detail: [
    '部署形态：自托管 Kestrel 直出、挂反向代理(Nginx/HAProxy)、容器化(Docker/K8s)、云平台(Azure/自有主机)。',
    '生产配置：ASPNETCORE_ENVIRONMENT=Production、用环境变量/密钥库存敏感信息、开启 HSTS、压缩、静态缓存。',
    'Docker：写 Dockerfile(基于 mcr.microsoft.com/dotnet/aspnet:8.0 运行时镜像, 多阶段构建)，COPY publish 输出 -> ENTRYPOINT。',
    'CI/CD：GitHub Actions 构建+发布+推送镜像/部署(本教程站即 GitHub Pages 静态托管示例)。',
    '健康检查：AddHealthChecks + UseHealthChecks 暴露 /health，供负载均衡/调度器探活。',
    '上线策略：蓝绿/滚动/金丝雀发布配合反向代理；做好日志、监控(OpenTelemetry)、错误告警。',
  ],
  notes: [
    'Docker 首层用 aspnet:8.0(运行时)而非 sdk 镜像可大幅减小体积；发布产物用 dotnet publish -c Release。',
    '容器里默认 Kestrel 端口 8080；健康检查要与探针路径一致。',
  ],
  example:
    '# Dockerfile 多阶段构建\n' +
    'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\n' +
    'WORKDIR /src\n' +
    'COPY . .\n' +
    'RUN dotnet publish -c Release -o /app/out\n\n' +
    'FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime\n' +
    'WORKDIR /app\n' +
    'COPY --from=build /app/out .\n' +
    'ENV ASPNETCORE_URLS=http://+:8080\n' +
    'EXPOSE 8080\n' +
    'ENTRYPOINT ["dotnet", "App.dll"]\n\n' +
    '# 构建并运行\n' +
    'docker build -t myapp .\n' +
    'docker run -p 8080:8080 myapp',
  example2:
    '# 健康检查\n' +
    'builder.Services.AddHealthChecks();\n' +
    'app.MapHealthChecks("/health");\n\n' +
    '# 检查\n' +
    'curl -s localhost:8080/health   # Healthy\n\n' +
    '# Nginx 反向代理反代到 Kestrel\n' +
    '# server { location / {\n' +
    '#     proxy_pass http://127.0.0.1:8080;\n' +
    '#     proxy_set_header Host $host;\n' +
    '#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n' +
    '# } }',
  example3:
    '# GitHub Actions CI(构建+测试+镜像推送骨架)\n' +
    '# name: ci\n' +
    '# on: [push]\n' +
    '# jobs:\n' +
    '#   build:\n' +
    '#     runs-on: ubuntu-latest\n' +
    '#     steps:\n' +
    '#       - uses: actions/checkout@v4\n' +
    '#       - uses: actions/setup-dotnet@v4\n' +
    '#         with: { dotnet-version: "8.0.x" }\n' +
    '#       - run: dotnet restore\n' +
    '#       - run: dotnet build -c Release\n' +
    '#       - run: dotnet test -c Release\n' +
    '#       - run: dotnet publish -c Release -o publish\n\n' +
    '# 本地验证发布产物\n' +
    'dotnet publish -c Release -o ./publish\n' +
    'cd publish && ASPNETCORE_URLS=http://localhost:5000 ./App',
};

const asp20 = {
  id: 'asp-case-study',
  title: '20. 综合实战：构建完整 API',
  category: '实战',
  version: '.NET 8',
  level: '实战',
  summary: '从零组合前面所有知识构建一个带认证、数据、缓存的完整待办事项 REST API。',
  detail: [
    '把所学串起来做一个真实项目：Todo API——清单项目(Crud + EF Core 持久化)、用户注册登录(JWT)、仅能操作自己的任务(策略授权)、热门统计加缓存。',
    '结构：Models(DbContext/实体)、Services(业务)、Controllers(端点)、DTO(避免直接把实体暴露)、Program.cs(装配)。',
    '完整流程：建项目 -> 定义模型与 DbContext -> 迁移 -> 服务 -> 控制器(CRUD) -> 加 JWT 认证 -> 加属主策略 -> 加缓存 -> 加健康检查 -> 容器化。',
    '质量意识：async/await、依赖注入、验证注解、异常处理中间件、分层清晰、配置外置。',
    '测试意识：可以先用 Swagger/curl 手测，进阶引入 xUnit 集成测试。',
    '对照前面各章选依赖与方法，按这套清单即可完成一个可上线的工程化 API 骨架。',
  ],
  notes: [
    '这个项目把所有章节连成一个整体，建议按序动手敲一遍并跑通每个 curl。',
    '记得把 SigningKey/连接串放进 user-secrets，别提交 git。',
  ],
  example:
    '# 搭建骨架\n' +
    'dotnet new webapi -n TodoApi -controllers\n' +
    'cd TodoApi\n' +
    '# 增包:\n' +
    '#  Microsoft.EntityFrameworkCore.Sqlite\n' +
    '#  Microsoft.EntityFrameworkCore.Design\n' +
    '#  Microsoft.AspNetCore.Authentication.JwtBearer\n' +
    '#  Microsoft.AspNetCore.Identity.EntityFrameworkCore\n\n' +
    '# 实体 + DbContext = asp11/asp13\n' +
    '# 迁移\n' +
    'dotnet ef migrations add Init && dotnet ef database update',
  example2:
    '// 待办服务 + 控制器(组合 asp11/asp15)\n' +
    'public class TodoService(AppDbContext db)\n' +
    '{\n' +
    '    public async Task<List<Todo>> Mine(string userId)\n' +
    '        => await db.Todos.Where(t => t.OwnerId == userId)\n' +
    '                         .OrderByDescending(t => t.CreatedAt).ToListAsync();\n\n' +
    '    public async Task<Todo?> Get(string userId, int id)\n' +
    '        => await db.Todos.FirstOrDefaultAsync(t =>\n' +
    '            t.Id == id && t.OwnerId == userId);\n' +
    '}\n\n' +
    '// 控制器只做 HTTP 层, 组合认证+属主\n' +
    '[Authorize]\n' +
    '[ApiController]\n' +
    '[Route("api/[controller]")]\n' +
    'public class TodosController(TodoService svc) : ControllerBase\n' +
    '{\n' +
    '    [HttpGet]\n' +
    '    public Task<List<Todo>> Mine()\n' +
    '        => svc.Mine(User.FindFirstValue(ClaimTypes.NameIdentifier)!);\n' +
    '}',
  example3:
    '# 校验整体\n' +
    'dotnet build\n' +
    'dotnet run\n\n' +
    '# 1. 注册\n' +
    'curl -X POST localhost:5000/api/auth/register \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"email":"a@b.c","password":"Str0ng!"}\'\n\n' +
    '# 2. 登录拿 token\n' +
    'TOKEN=$(curl -s -X POST localhost:5000/api/auth/login \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"email":"a@b.c","password":"Str0ng!"}\' | jq -r .token)\n\n' +
    '# 3. 带 token 建任务\n' +
    'curl -X POST localhost:5000/api/todos \\\n' +
    '  -H "Authorization: Bearer $TOKEN" \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"title":"learn asp.net core"}\'\n\n' +
    '# 4. 未带 token 应 401\n' +
    'curl -s -o /dev/null -w "%{http_code}\\n" localhost:5000/api/todos\n' +
    '# 输出 401',
};

if (typeof module !== 'undefined') module.exports = { asp16, asp17, asp18, asp19, asp20 };