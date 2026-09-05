// EF Core 教程 9–12：原生 SQL、并发与性能实战
const ef9 = {
  id: 'efcore-native-sql',
  title: '9. 原生 SQL：FromSql 与 EF Core 的安全边界',
  category: '进阶',
  version: 'EF Core 8',
  level: '进阶',
  summary: 'FromSql* 跑手写 SQL（含存储过程），ExecuteSql* 做更新：只有参数化才安全。',
  detail: [
    'FromSqlRaw 接受可参数化的原始 SQL 并映射回实体/标量：.FromSqlRaw("SELECT * FROM Books WHERE Price > {0}", min)。',
    '从 EF Core 8 起 FromSql 支持内插字符串自动参数化：.FromSql($"… WHERE Price > {min}")，杜绝拼接注入。',
    'List< T> 映射与组合 LINQ 有限制：必须先做基础筛选再叠加；复合查询签名 FromSql(dbSet, sql, parameters)。',
    'ExecuteSqlInterpolatedAsync 用于 UPDATE/DELETE/DDL 等非查询：同样内插参数化。',
    '何时用原生 SQL：复杂报表、窗口函数、临时表、存储过程、数据库专属特性——EF 翻译不了或生成的 SQL 不优时。'
  ],
  notes: [
    '永远不要字符串拼接 SQL：{0}/内插 {x} 是正确姿势。',
    'FromSql 结果集列名需与实体属性或投影匹配，否则映射失败。'
  ],
  example: `using Microsoft.EntityFrameworkCore;

// 内插参数化（推荐，EF Core 8+）
var books = db.Books
    .FromSql($"SELECT * FROM Books WHERE Price > {minPrice} AND IsActive = TRUE")
    .OrderBy(b => b.Price)
    .ToListAsync();

// 旧式占位符（需自己传参数对象）
// db.Books.FromSqlRaw("SELECT * FROM Books WHERE Price > {0}", minPrice)

// 投影到任意形状
var report = db.Database
    .SqlQuery<string>($"SELECT Title FROM Books WHERE Year > {sinceYear}")
    .ToListAsync();

// 非查询：批量归档
await db.Database.ExecuteSqlInterpolatedAsync(
    $"UPDATE Books SET IsActive = FALSE WHERE UpdatedAt < now() - INTERVAL '1 year'");`,
  example2Title: '实战：窗口函数做排名（EF 翻译不易的原生 SQL）',
  example2: `// 场景：给每类图书按价格排回（ROW_NUMBER / OVER）
var ranked = await db.Database
    .SqlQuery<RankedBook>(// 投影类型：Rank 与 BookId 两列
        """
        SELECT BookId,
               ROW_NUMBER() OVER (PARTITION BY Category ORDER BY Price) AS Rank
        FROM Books
        """)
    .ToListAsync();

Console.WriteLine(ranked.FirstOrDefault()?.Rank);

// 注意：存储过程一样——
// var r = await db.Database.SqlQuery<X>($"CALL get_top_books({limit})").ToListAsync();
public class RankedBook { public int BookId { get; set; } public long Rank { get; set; } }
`,
};

const ef10 = {
  id: 'efcore-transactions-concurrency',
  title: '10. 事务与并发控制：从隔离级别到乐观并发',
  category: '进阶',
  version: 'EF Core 8',
  level: '进阶',
  summary: '手动事务组装多条 SaveChanges，并用并发令牌（rowversion/版本列）处理并发写冲突。',
  detail: [
    '单次 SaveChangesAsync 天然在一个事务里；多条 SaveChanges 之间想原子化就用手动事务。',
    'begin/commit/rollback：await db.Database.BeginTransactionAsync()，配合 try/finally 保底回滚。',
    'Savepoint（嵌套事务）：transaction.CreateSavepoint 允许部分回滚，长事务里的局部失败不必全盘重来。',
    '并发控制：乐观并发=更新时比对版本，EF 用 [Timestamp]（rowversion）或自定义 Version 列 + IsConcurrencyToken。',
    '冲突处理：SaveChangesAsync 抛 DbUpdateConcurrencyException；捕获后重读 CurrentValues/OriginalValues 决定覆盖或重试。',
    '隔离级别：默认 ReadCommitted 等由提供程序决定；高并发扣库存类场景可显式选定（Serializable 或配合行锁）。'
  ],
  notes: [
    '分布式事务：EF Core 无内置；跨库一致性考虑 Outbox 模式或消息事务。',
    '乐观并发推荐默认选择：无锁、冲突时可重试，适合大多数业务。'
  ],
  example: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

// —— 手动事务：跨多次 SaveChanges 原子化 ——
await using var tx = await db.Database.BeginTransactionAsync();
try
{
    db.Orders.Add(order);
    await db.SaveChangesAsync();                 // 第一次写

    stock.Deduce(order.Qty);                     // 改第二个实体
    db.Products.Update(stock);
    await db.SaveChangesAsync();                 // 第二次写

    await tx.CommitAsync();                      // 一起生效
}
catch
{
    await tx.RollbackAsync();                    // 任一步失败全回滚
    throw;
}`,
  example2Title: '乐观并发令牌与冲突重试',
  example2: `public class Account
{
    public int Id { get; set; }
    public decimal Balance { get; set; }

    [Timestamp]                       // 每次 UPDATE 自动变更的 rowversion
    public byte[] RowVersion { get; set; } = [];
}

// 扣款 + 冲突重试
static async Task<bool> TryDeduct(AppDbContext db, int id, decimal amount, int maxRetry = 3)
{
    for (int i = 0; i < maxRetry; i++)
    {
        var acc = await db.Accounts.FindAsync(id);
        if (acc == null || acc.Balance < amount) return false;

        acc.Balance -= amount;
        try
        {
            await db.SaveChangesAsync();      // 乐观：并发写会抛并发异常
            return true;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // 重新读取最新行再重试
            foreach (var entry in ex.Entries)
                await entry.ReloadAsync();
        }
    }
    return false;
}`,
};

const ef11 = {
  id: 'efcore-performance',
  title: '11. 性能优化：AsNoTracking、编译查询与索引',
  category: '性能',
  version: 'EF Core 8',
  level: '高级',
  summary: '从"少取、不跟踪、预编译、建索引"四个方向把查询压到最优。',
  detail: [
    'AsNoTracking() / AsNoTrackingWithIdentityResolution()：只读数据不必进跟踪器，摆脱内存与开销。',
    'AsSplitQuery()：多集合 Include 时拆成多条 SQL 避免叉积；量大的关联查询应拆分。',
    '编译查询（EF Core 8+）：EF.CompileAsyncQuery 把热门查询编译一次、大降解析成本。',
    '投影大杀器：Select 只取需要的列 + 服务端聚合，不给 ORM 机会拉整行。',
    '索引配合：慢查询先看数据库执行计划，为排序/筛选列补索引；唯一约束、外键列默认有索引。',
    '关闭无谓的开销：LogTo 生产关闭或降级；修改泄漏检测（ChangeTracker）关闭可省开销但失安全网。'
  ],
  notes: [
    '先量化再用优化手段：用 ToQueryString()/日志抓真实 SQL，再决定加 Include 还是拆查询。',
    'AsNoTracking 下若之后又要改数据，可能得重新查询或 Attach。'
  ],
  example: `using Microsoft.EntityFrameworkCore;

// 只读大列表：不跟踪，省内存
var catalog = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .Select(p => new { p.Id, p.Name, p.Price })
    .ToListAsync();

// 编译查询：参数化热路径（EF Core 8+）
var byCategory = EF.CompileAsyncQuery(
    (AppDbContext db, string cat) =>
        db.Products.AsNoTracking().Where(p => p.Category == cat).Take(50));

var first = await byCategory(db, "book");

// 拆查询防叉积
var blogs = await db.Blogs
    .Include(b => b.Posts)
    .Include(b => b.Authors)
    .AsSplitQuery()                  // 分别查 Posts 与 Authors，再内存拼接
    .Where(b => b.IsActive)
    .ToListAsync();`,
  example2Title: '用 SQL 度量：抓取生成的语句与执行计划',
  example2: `// 打印真实 SQL（开发期排查利器）
protected override void OnConfiguring(DbContextOptionsBuilder o)
{
    o.UseSqlite("Data Source=shop.db")
     .LogTo(Console.WriteLine, minimumLevel: LogLevel.Information);
}

// 或在查询时取 SQL 文本
var sql = db.Products
    .Where(p => p.Category == "book")
    .OrderBy(p => p.Price)
    .ToQueryString();
Console.WriteLine(sql);
// SELECT ... FROM "Products" AS "p" WHERE "p"."Category" = 'book'
// ORDER BY "p"."Price"

// 慢查询三板斧：
// 1) EXPLAIN QUERY PLAN <sql> 看索引是否命中
// 2) 为 OrderBy/Where 常用列建索引
// 3) 撂不掉的关联才 AreInclude / 拆查询`,
};

const ef12 = {
  id: 'efcore-aspnet-integration',
  title: '12. 实战：ASP.NET Core + EF Core 完整 CRUD API',
  category: '实战',
  version: 'EF Core 8',
  level: '高级',
  summary: '一个迷你书店 Web API：DbContext 注入、仓库查询、迁移上线、异步化全链路演示。',
  detail: [
    '依赖注入：AddDbContext 注册 scoped，控制器/端点方法注入即用，DbContext 每请求创建。',
    '注册即生效：业务代码不 new DbContext，全部靠注入——方便替换数据库与单测（UseInMemoryDatabase）。',
    '规划项目结构：实体/服务/接口分层；简单项目可 Keep It Simple、不滥用仓储层。',
    '端点内使用 ToListAsync/FindAsync/FirstOrDefaultAsync 等 *Async 版本与 async 函数配合。',
    '上线前核心动作：迁移脚本评审 + 连接串加密（保护连接字符串）+ 只读查询开 AsNoTracking。',
    '测试策略：集成测试可用真实 SQLite 或 Testcontainers 起 SQL Server，别只用 InMemory 掩盖真实行为。'
  ],
  notes: [
    'Scoped 生命周期下不要缓存 DbContext 于静态字段——并发共享会崩。',
    '全局过滤器（HasQueryFilter）常用于多租户与软删除，业务查询自动带上条件。'
  ],
  example: `// Program.cs —— 完整装配
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<BookStoreDb>(o =>
    o.UseSqlite("Data Source=shop.db"));                  // 开发期 SQLite

var app = builder.Build();
app.MapGet("/books/{id}", async (int id, BookStoreDb db) =>
    await db.Books.FindAsync(id)
    is Book b ? Results.Ok(b) : Results.NotFound());

app.MapGet("/books", async (string? cat, BookStoreDb db) =>        // 列表+筛选
    await db.Books.AsNoTracking()
                  .Where(b => cat == null || b.Category == cat)
                  .OrderByDescending(b => b.UpdatedAt)
                  .ToListAsync());

app.MapPost("/books", async (Book input, BookStoreDb db) =>        // 创建
{
    input.UpdatedAt = DateTime.UtcNow;
    db.Books.Add(input);
    await db.SaveChangesAsync();
    return Results.Created($"/books/{input.Id}", input);
});

app.MapDelete("/books/{id}", async (int id, BookStoreDb db) =>     // 删除
    await db.Books.Where(b => b.Id == id).ExecuteDeleteAsync() > 0
        ? Results.NoContent() : Results.NotFound());

app.Run();

public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Category { get; set; }
    public decimal Price { get; set; }
    public DateTime UpdatedAt { get; set; }
}`,
  example2Title: '上线前的迁移与配置安全',
  example2: `// 1) 生成迁移并打包
# dotnet ef migrations add Init --project src/Store.Data
# dotnet ef migrations script --idempotent -o deploy/migrate.sql   # 可幂等执行

// 2) 配置（appsettings.json）
{
  "ConnectionStrings": {
    "Default": "Server=db;Database=shop;User Id=app;Password=***;"  // 重器放 User Secrets / 环境变量
  }
}

// 3) 启动时自动迁移到最新（仅演示；生产还应配锁与备份）
app.Services.CreateScope()
   .ServiceProvider.GetRequiredService<BookStoreDb>()
   .Database.Migrate();

// 4) 健康检查会遇到数据库健康探测
// builder.Services.AddHealthChecks().AddDbContextCheck<BookStoreDb>();`,
};

module.exports = [ef9, ef10, ef11, ef12];