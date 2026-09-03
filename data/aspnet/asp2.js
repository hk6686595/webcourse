// ASP.NET Core 开发 6–10：API 与控制器
const asp6 = {
  id: 'asp-minimal',
  title: '6. Minimal API 快速上手',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '用极简代码定义路由：参数、返回类型、绑定请求体，适合轻量服务与学习原型。',
  detail: [
    'Minimal API 是 .NET 6+ 推出的轻量写法：用 app.MapGet/MapPost/MapPut/MapDelete 等直接定义端点，不需要控制器类。',
    '路由参数：MapGet("/users/{id}", (int id) => ...)；参数可从路由/查询串/请求体自动绑定。',
    '返回类型：可返回标量（自动 200）、对象（自动序列化 JSON）、IResult（如 Results.Ok/NotFound）显式控制状态码。',
    '请求体绑定：参数从 body 反序列化（POST/PUT 里的复杂对象），配合 [FromBody] 等标注可精确控制来源。',
    '内容协商：默认返回 JSON（System.Text.Json），可配置返回格式；Swagger 可用 .WithOpenApi() 增强。',
    '相比控制器：Minimal 代码少、适合中小型/微服务端点；大型项目用控制器利于组织和属性路由。',
  ],
  notes: [
    'Minimal 端点也支持 DI：直接在 lambda 参数列出需要的服务即可自动注入（如 IConfiguration、ILogger）。',
    '结果写代码块就用 Results.Ok(obj)、Results.Created(uri, obj)、Results.Problem()。',
  ],
  example:
    '// 一个完整的 Minimal API\n' +
    'var builder = WebApplication.CreateBuilder(args);\n' +
    'var app = builder.Build();\n\n' +
    'app.MapGet("/", () => "Hello API");\n\n' +
    'app.MapGet("/users/{id:int}", (int id)\n' +
    '    => Results.Ok(new { Id = id, Name = $"User{id}" }));\n\n' +
    'app.MapPost("/users", (User u) =>\n' +
    '{\n' +
    '    // 保存 u...\n' +
    '    return Results.Created($"/users/{u.Id}", u);\n' +
    '});\n\n' +
    'app.Run();\n' +
    'record User(int Id, string Name);',
  example2:
    '// 明确指定绑定来源\n' +
    'using Microsoft.AspNetCore.Mvc;\n' +
    'app.MapPost("/search", ([FromBody] string keyword,\n' +
    '                        [FromQuery] int page = 1,\n' +
    '                        [FromHeader] string? token)\n' +
    '    => Results.Ok(new { keyword, page, hasToken = !string.IsNullOrEmpty(token) }));\n\n' +
    '# 测试\n' +
    'curl -X POST "http://localhost:5000/search?page=2" \\\n' +
    '  -H "token: abc" -H "Content-Type: application/json" \\\n' +
    '  -d \'"hello"\'',
  example3:
    '// 分组与过滤器(简单验证)\n' +
    'var api = app.MapGroup("/api");\n\n' +
    'api.MapGet("/now", () => DateTime.Now.ToString("O"))\n' +
    '   .WithName("GetNow")\n' +
    '   .WithOpenApi();     // Swagger 文档\n\n' +
    '// 端点过滤器:前置处理\n' +
    'app.MapGet("/secret", () => "s3cret")\n' +
    '   .AddEndpointFilter(async (ctx, next) =>\n' +
    '   {\n' +
    '       if (ctx.HttpContext.Request.Headers.ContainsKey("X-Key"))\n' +
    '           return await next(ctx);\n' +
    '       return Results.Unauthorized();\n' +
    '   });',
};

const asp7 = {
  id: 'asp-controllers',
  title: '7. 控制器与路由',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '用 MVC 控制器组织接口：属性路由、ActionResult、动作与 HTTP 谓词映射。',
  detail: [
    '控制器(Controller)是通过类 + 属性路由组织端点的经典方式，适合规则复杂的大型应用。',
    '建控制器：[ApiController] + ControllerBase 基类；每个 public 方法成为一个 action（端点）。',
    '路由：控制器的 [Route("api/users")] + 动作上的 [HttpGet] 等组合成完整路径；可用 {id} 占位符。',
    '[ApiController] 特性自动启用：模型验证自动 400、绑定来源推断、返回类型自动包装。',
    '返回类型：IActionResult / ActionResult<T>，配合 Ok()、BadRequest()、NotFound()、CreatedAtAction()。',
    '属性路由需在管道里 app.MapControllers() 生效；Name 属性便于生成链接。',
  ],
  notes: [
    '动作方法的 action name 默认决定路由后半段，除非加 [HttpGet("...")] 显式指定。',
    '异步动作应返回 Task<IActionResult>/Task<ActionResult<T>>，用 await。',
  ],
  example:
    '// 控制器示例\n' +
    '[ApiController]\n' +
    '[Route("api/[controller]")]   // api/Users\n' +
    'public class UsersController : ControllerBase\n' +
    '{\n' +
    '    private static readonly List<User> _list = new();\n\n' +
    '    [HttpGet]\n' +
    '    public ActionResult<IEnumerable<User>> Get()\n' +
    '        => Ok(_list);\n\n' +
    '    [HttpGet("{id}")]\n' +
    '    public ActionResult<User> Get(int id)\n' +
    '    {\n' +
    '        var u = _list.FirstOrDefault(x => x.Id == id);\n' +
    '        return u is null ? NotFound() : Ok(u);\n' +
    '    }\n\n' +
    '    [HttpPost]\n' +
    '    public ActionResult<User> Post(User u)\n' +
    '    {\n' +
    '        _list.Add(u);\n' +
    '        return CreatedAtAction(nameof(Get), new { id = u.Id }, u);\n' +
    '    }\n' +
    '}',
  example2:
    '// 属性路由细节\n' +
    'public class OrdersController : ControllerBase\n' +
    '{\n' +
    '    [HttpGet("api/orders")]          // 覆盖类路由,完整路径\n' +
    '    public IActionResult All() => Ok();\n\n' +
    '    [HttpGet("api/orders/{id:int}")] // 仅整型匹配\n' +
    '    public IActionResult One(int id) => Ok(id);\n\n' +
    '    [HttpPost("api/orders")]\n' +
    '    public async Task<IActionResult> Create(Order o)\n' +
    '    {\n' +
    '        // 业务\n' +
    '        return CreatedAtAction(nameof(One), new { id = o.Id }, o);\n' +
    '    }\n' +
    '}',
  example3:
    '# 用路由约束限定参数\n' +
    '# [HttpGet("api/stats/{days:range(1,90)}")]\n' +
    '# [HttpDelete("api/users/{id:guid}")]  # GUID 参数\n' +
    '# 正则约束 [Route("api/zip/{code:regex(^[0-9]{5}$)}")]\n\n' +
    '# 在 Program.cs 启用控制器\n' +
    'builder.Services.AddControllers();\n' +
    'var app = builder.Build();\n' +
    'app.MapControllers();\n' +
    '# 启动后 Swagger 会自动列出所有 [ApiController] 端点',
};

const asp8 = {
  id: 'asp-binding-validation',
  title: '8. 模型绑定与验证',
  category: '基础',
  version: '.NET 8',
  level: '入门',
  summary: '请求参数如何绑定到模型、数据注解校验规则与自动返回 400 错误。',
  detail: [
    '模型绑定：ASP.NET Core 自动把路由/查询/表单/请求体映射到方法参数或对象属性，无需手动解析。',
    '绑定来源推断：[ApiController] 下，简单类型默认来自路由+查询，复杂对象来自请求体 JSON，可用 [FromBody]/[FromQuery]/[FromRoute]/[FromForm] 显式改。',
    '数据注解校验：在模型属性上用 [Required]、[Range]、[StringLength]、[EmailAddress]、[RegularExpression] 等声明规则。',
    '开启 [ApiController] 后，校验失败自动返回 400 + 错误详情（ModelState），无需手动 if。',
    '非 ApiController（MVC 页面）需手动判断 ModelState.IsValid。',
    '自定义规则可写 [ValidateNever] 排除、继承 ValidationAttribute 实现自定义校验，或用 IValidatableObject。',
  ],
  notes: [
    '同时标注 [FromBody][FromQuery] 会冲突；每个参数只能一个绑定源。',
    '内置校验错误信息默认英文，可设置注入器或自定义 ErrorMessage 中文文案。',
  ],
  example:
    '// 模型校验注解\n' +
    'public class RegisterModel\n' +
    '{\n' +
    '    [Required(ErrorMessage = "邮箱必填")]\n' +
    '    [EmailAddress]\n' +
    '    public string Email { get; set; } = "";\n\n' +
    '    [Required]\n' +
    '    [StringLength(20, MinimumLength = 6)]\n' +
    '    public string Password { get; set; } = "";\n\n' +
    '    [Range(18, 120)]\n' +
    '    public int Age { get; set; }\n' +
    '}',
  example2:
    '// 控制器使用 + 自动 400\n' +
    '[ApiController]\n' +
    '[Route("api/account")]\n' +
    'public class AccountController : ControllerBase\n' +
    '{\n' +
    '    [HttpPost("register")]\n' +
    '    public IActionResult Register(RegisterModel m)\n' +
    '    {\n' +
    '        // [ApiController] 已自动校验,走到这里即通过\n' +
    '        return Ok(new { registered = m.Email });\n' +
    '    }\n' +
    '}\n\n' +
    '# 提交非法数据会返回 400:\n' +
    '# curl -X POST localhost:5000/api/account/register \\\n' +
    '#   -H "Content-Type: application/json" -d \\\n' +
    '#   \'{"Email":"bad","Password":"123""}\'',
  example3:
    '// 自定义校验特性\n' +
    'public class AllowedValuesAttribute : ValidationAttribute\n' +
    '{\n' +
    '    private readonly string[] _values;\n' +
    '    public AllowedValuesAttribute(params string[] values)\n' +
    '        => _values = values;\n\n' +
    '    protected override ValidationResult? IsValid(object? value, ValidationContext ctx)\n' +
    '    {\n' +
    '        if (value is string s && _values.Contains(s))\n' +
    '            return ValidationResult.Success;\n' +
    '        return new ValidationResult($"只允许 {string.Join(",", _values)}");\n' +
    '    }\n' +
    '}\n' +
    '// 用法\n' +
    '// [AllowedValues("admin", "user", "guest")]\n' +
    '// public string Role { get; set; }',
};

const asp9 = {
  id: 'asp-di-advanced',
  title: '9. 依赖注入进阶模式',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '接口多实现、工厂、委托注入、生命周期陷阱与作用域在后台任务中的正确用法。',
  detail: [
    '接口多实现：同一接口注册多个，可分别命名注册，或用 Func<T> 工厂解析，或用 TryAddXxx 只注册第一个。',
    '工厂注册：AddScoped<T>(sp => new T(sp.GetRequiredService<X>())) 在闭包里定制构造。',
    '生命周期与陷阱：Singleton 捕获 Scoped 的 DbContext 会导致状态串扰与线程问题；后台任务(HostedService)默认是 Singleton，需自建作用域取 Scoped。',
    '用 Microsoft.Extensions.DependencyInjection 的 TryAdd 避免重复注册导致覆盖。',
    'KEYED 服务（.NET 8+）：AddKeyedScoped<T>(name, impl) + [FromKeyedServices(name)] 按名称取不同实现。',
    '服务定位(Service Locator)反模式：能注入就注入，避免到处 GetRequiredService。',
  ],
  notes: [
    '后台任务正确姿势：inject IServiceScopeFactory -> CreateScope() -> scope.ServiceProvider.GetRequiredService<T>()。',
    '黄金准则：Transient < Scoped < Singleton 单向依赖，杜绝 Singleton 依赖 Scoped。',
  ],
  example:
    '// 多实现 + 工厂\n' +
    'public interface IFormatter { string Format(string s); }\n' +
    'public class UpperFormatter : IFormatter\n' +
    '    { public string Format(string s) => s.ToUpper(); }\n' +
    'public class LowerFormatter : IFormatter\n' +
    '    { public string Format(string s) => s.ToLower(); }\n\n' +
    'builder.Services.AddSingleton<UpperFormatter>();\n' +
    'builder.Services.AddSingleton<LowerFormatter>();\n' +
    'builder.Services.AddSingleton<Func<string, IFormatter>>(sp => name =>\n' +
    '    name == "upper"\n' +
    '        ? sp.GetRequiredService<UpperFormatter>()\n' +
    '        : sp.GetRequiredService<LowerFormatter>());',
  example2:
    '// 后台任务中使用 Scoped 服务\n' +
    'public class CleanupWorker : BackgroundService\n' +
    '{\n' +
    '    private readonly IServiceScopeFactory _sf;\n' +
    '    public CleanupWorker(IServiceScopeFactory sf) => _sf = sf;\n\n' +
    '    protected override async Task ExecuteAsync(\n' +
    '        CancellationToken stoppingToken)\n' +
    '    {\n' +
    '        while (!stoppingToken.IsCancellationRequested)\n' +
    '        {\n' +
    '            using var scope = _sf.CreateScope();\n' +
    '            var db = scope.ServiceProvider\n' +
    '                .GetRequiredService<AppDbContext>();\n' +
    '            await db.CleanupAsync(stoppingToken);\n' +
    '            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);\n' +
    '        }\n' +
    '    }\n' +
    '}',
  example3:
    '// KEYED 服务(按名取实现, .NET 8+)\n' +
    'builder.Services.AddKeyedSingleton<IFormatter, UpperFormatter>("up");\n' +
    'builder.Services.AddKeyedSingleton<IFormatter, LowerFormatter>("low");\n\n' +
    '// 在服务里按 key 注入\n' +
    'public class Printer(\n' +
    '    [FromKeyedServices("up")] IFormatter up,\n' +
    '    [FromKeyedServices("low")] IFormatter low)\n' +
    '{\n' +
    '    public string A(string s) => up.Format(s);\n' +
    '    public string B(string s) => low.Format(s);\n' +
    '}\n' +
    '// (需引用 Microsoft.AspNetCore.Mvc / 开放场景服务)',
};

const asp10 = {
  id: 'asp-rest',
  title: '10. RESTful API 设计实践',
  category: '进阶',
  version: '.NET 8',
  level: '进阶',
  summary: '资源化 URL、HTTP 状态码、版本化、分页过滤排序，设计干净可维护的 REST 接口。',
  detail: [
    'REST 核心：把业务抽象为资源(noun)，URL 表达资源层级，HTTP 动词表达操作，状态码表达结果。',
    '常见映射：GET 列表/单个，POST 新建(201)，PUT 整体更新，PATCH 部分更新，DELETE 删除(204)。',
    '状态码：200 OK、201 Created、204 No Content、400 参数错、401 未认证、403 无权限、404 不存在、409 冲突、422 语义错。',
    '版本化：URL 路径 /api/v1/... 简单直观；或 header 版本化(ApiVersion 包)更干净但调用方要多传头。',
    '分页/过滤/排序：用查询参数 page/pageSize、filter 字段、sort 字段；返回元数据(总数)便于前端分页。',
    '统一响应结构：错误用 ProblemDetails(RFC 7807)，可加包装层但别过度；保持返回直接对象更简单。',
  ],
  notes: [
    '错误返回：控制器里用 Problem() 生成 standard ProblemDetails 响应。',
    'DELETE 幂等：目标不存在时返回 204 或 404 皆可，团队约定一致即可。',
  ],
  example:
    '// 资源化 + 状态码\n' +
    '[HttpPost("api/products")]\n' +
    'public async Task<ActionResult<Product>> Create(Product p)\n' +
    '{\n' +
    '    await _db.AddAsync(p); await _db.SaveChangesAsync();\n' +
    '    return CreatedAtAction(nameof(Get), new { id = p.Id }, p);\n' +
    '}\n\n' +
    '[HttpDelete("api/products/{id}")]\n' +
    'public async Task<IActionResult> Delete(int id)\n' +
    '{\n' +
    '    var p = await _db.FindAsync<Product>(id);\n' +
    '    if (p is null) return NotFound();\n' +
    '    _db.Remove(p); await _db.SaveChangesAsync();\n' +
    '    return NoContent();   // 204\n' +
    '}',
  example2:
    '// 分页 + 排序 + 过滤\n' +
    '[HttpGet("api/products")]\n' +
    'public async Task<IActionResult> List(\n' +
    '    [FromQuery] int page = 1,\n' +
    '    [FromQuery] int pageSize = 20,\n' +
    '    [FromQuery] string? category = null,\n' +
    '    [FromQuery] string? sort = "name")\n' +
    '{\n' +
    '    var q = _db.Products.AsQueryable();\n' +
    '    if (!string.IsNullOrEmpty(category))\n' +
    '        q = q.Where(x => x.Category == category);\n' +
    '    var total = await q.CountAsync();\n' +
    '    var items = await q\n' +
    '        .OrderBy(x => sort == "price" ? x.Price : 0)\n' +
    '        .Skip((page - 1) * pageSize)\n' +
    '        .Take(pageSize)\n' +
    '        .ToListAsync();\n' +
    '    return Ok(new { total, page, pageSize, items });\n' +
    '}',
  example3:
    '// 版本化(/api/v1 + /api/v2)\n' +
    'builder.Services.AddApiVersioning()\n' +
    '    .AddMvc()\n' +
    '    .AddApiExplorer()\n' +
    '    .SetDefaultApiVersion(new ApiVersion(1, 0));\n\n' +
    '// 控制器标注版本\n' +
    '// [ApiController]\n' +
    '// [Route("api/v{version:apiVersion}/products")]\n' +
    '// public class ProductsV1Controller : ControllerBase\n\n' +
    '// 错误统一格式(ProblemDetails)\n' +
    '// return Problem(statusCode: 409, detail: "商品已存在");\n' +
    '# curl 提示: 用 -s -i 看状态码, -s 静默输出',
};

if (typeof module !== 'undefined') module.exports = { asp6, asp7, asp8, asp9, asp10 };