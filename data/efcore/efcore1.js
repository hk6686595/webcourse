// EF Core 教程 1–4：认识 EF Core 与实体建模
const ef1 = {
  id: 'efcore-intro',
  title: '1. EF Core 是什么：ORM 与 EF Core 概览',
  category: '认识 EF Core',
  version: 'EF Core 8',
  level: '入门',
  summary: '理解 ORM 的动机、EF Core 在 .NET 数据访问中的位置，以及它如何把 C# 对象映射到关系数据库。',
  detail: [
    'EF Core（Entity Framework Core）是微软开源的跨平台 ORM，让你用 C# 对象（实体）操作关系数据库，而不用手写大部分 SQL。',
    '核心对象模型：DbContext（工作单元 + 会话）、DbSet<T>（表的类型化集合）、实体类（表中的一行）。',
    '优势：强类型查询（LINQ）、数据库迁移、自动生成增删改查、支持 SQL Server/SQLite/PostgreSQL/MySQL/InMemory 等十余种提供程序。',
    '相比 ADO.NET 手写 SQL：开发快、难以写 SQL 注入、重构安全（改实体即改数据库）；代价是学习映射与性能调优。',
    '版本对应关系：EF Core 8 随 .NET 8、EF Core 9 随 .NET 9、EF Core 10 随 .NET 10（LTS）。',
    '适合：CRUD 为主的业务系统；对极高吞吐或存在复杂存储过程的场景，仍需评估原生 SQL 或 Dapper。'
  ],
  notes: [
    'EF Core 的职责边界：内存中对实体的操作自动生成 SQL，查询通过 IQueryable 惰性执行。',
    '误区澄清：EF Core 不是"数据库套壳"，它内置了跟踪、缓存、延迟加载等机制。'
  ],
  example: `using Microsoft.EntityFrameworkCore;

// 实体（POCO，纯 C# 对象）
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public decimal Price { get; set; }
}

// DbContext：代表一次数据库会话
public class BookContext : DbContext
{
    public DbSet<Book> Books => Set<Book>();   // 表

    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlite("Data Source=books.db"); // SQLite 演示
}

// 使用（顶层语句）
using var db = new BookContext();
db.Database.EnsureCreated();                    // 照模型建库（演示用）

db.Books.Add(new Book { Title = "C# in Depth", Price = 99.9m });
db.SaveChanges();                               // 生成 INSERT

foreach (var b in db.Books)                     // 生成 SELECT
    Console.WriteLine($"{b.Title}: {b.Price:C}");
// C# in Depth: ¥99.90`,
  example2Title: '对比：手写 SQL 与 EF Core',
  example2: `// —— 传统 ADO.NET 手写（代码多，容易出错）——
using var conn = new SqliteConnection("Data Source=books.db");
conn.Open();
var cmd = conn.CreateCommand();
cmd.CommandText = "INSERT INTO Books (Title, Price) VALUES (@t, @p)";   // 参数化防注入
cmd.Parameters.AddWithValue("@t", "Clean Architecture");
cmd.Parameters.AddWithValue("@p", 120);
cmd.ExecuteNonQuery();

// —— EF Core（一行完成，自动参数化，模型即表结构）——
using var db = new BookContext();
db.Books.Add(new Book { Title = "Clean Architecture", Price = 120m });
db.SaveChanges();                               // 自动生成参数化 INSERT`,
};

const ef2 = {
  id: 'efcore-dbcontext',
  title: '2. 安装与第一个 DbContext：从零连接数据库',
  category: '认识 EF Core',
  version: 'EF Core 8',
  level: '入门',
  summary: '安装提供程序包、配置 DbContext、建 NuGet 依赖与连接字符串，跑通第一个查询。',
  detail: [
    '安装步骤：dotnet add package Microsoft.EntityFrameworkCore.Sqlite（或 .UseSqlite 对应的提供程序包）。',
    'DbContext 需要 DbContextOptions：常用 OnConfiguring 内联配置，或构造器注入（ASP.NET Core 场景）。',
    '连接字符串：Provider 不同写法不同，SQLite 本地文件；SQL Server 含 Server/Database 与认证信息。',
    'DbSet<T> 属性是"表的类型化句柄"：LINQ 从它开始，Add/Update/Remove 也以它作为操作入口。',
    'EnsureCreated() 快速建库但不会演进结构；生产应使用迁移（见第 4 篇）。',
    '依赖注入环境中注册 scoped DbContext：AddDbContext<T>(...) 默认作用域生命周期，每次请求一个新实例。'
  ],
  notes: [
    'DbContext 做不到线程安全：同一实例不要跨线程并发使用。',
    'Connections 由 DbContext 自动管理：通常不需要手动 Open/Close。'
  ],
  example: `# 创建项目并安装提供程序（终端）
dotnet new console -o DemoEf && cd DemoEf
dotnet add package Microsoft.EntityFrameworkCore.Sqlite

using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlite("Data Source=shop.db");
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
}

using var db = new AppDbContext();
db.Database.EnsureCreated();

db.Customers.Add(new Customer { Name = "张三" });
db.SaveChanges();

var row = db.Customers.Single(c => c.Name == "张三");
Console.WriteLine($"客户 #{row.Id}: {row.Name}");`,
  example2Title: 'ASP.NET Core 中的依赖注入注册',
  example2: `// Program.cs —— Web 应用中惯例做法
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 从配置读取连接字符串（appsettings.json 的 ConnectionStrings:Shop）
builder.Services.AddDbContext<ShopDb>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Shop")));  // PostgreSQL

var app = builder.Build();

app.MapGet("/customers", async (ShopDb db) =>
    await db.Customers.ToListAsync());      // 自动参数注入

app.Run();

public class ShopDb(DbContextOptions<ShopDb> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
}
public class Customer { public int Id { get; set; } public string Name { get; set; } = ""; }`,
};

const ef3 = {
  id: 'efcore-mapping',
  title: '3. 实体与映射：约定 vs 数据注解 vs Fluent API',
  category: '实体建模',
  version: 'EF Core 8',
  level: '入门',
  summary: '三档映射手段的取舍：默认约定最省事，数据注解最直观，Fluent API 最灵活。',
  detail: [
    '第一档是约定（Convention）：Id 或 XxxId 自动成为主键；字符串→TEXT/varchar；导航属性自动建外键。不写任何配置即可工作。',
    '第二档是数据注解（Data Annotations）：[Key]、[Required]、[MaxLength(50)]、[Column("name")]、[NotMapped]。',
    '第三档是 Fluent API：OnModelCreating 里用 builder.Entity<T>() 精确控制索引、复合键、级联删除等注解办不到的事。',
    '取舍原则：简单规则用约定/注解；复杂规则（索引、唯一约束、级联、值转换）上 Fluent API。',
    '精度映射：decimal 需显式 [Precision(18,2)] 或 HasPrecision，否则各数据库默认精度可能回引起告警。'
  ],
  notes: [
    '可以混用：约定打底 + 注解标关键约束 + Fluent 收尾复杂关系。',
    '模型不是配置越多越好：保持实体"贫血/干净"，复杂逻辑交给 Fluent 层。'
  ],
  example: `public class Blog
{
    public int BlogId { get; set; }              // 约定：XxxId → 主键
    public string Title { get; set; } = "";

    [MaxLength(2000)]                            // 数据注解：限长
    [Column("Body", TypeName = "text")]          // 指定列名/类型
    public string? Body { get; set; }

    [NotMapped]                                  // 不落入数据库
    public int WordCount => Body?.Split(' ').Length ?? 0;

    public List<Post> Posts { get; set; } = [];  // 导航属性：自动外键
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; } = "";
    public int BlogId { get; set; }              // 外键
    public Blog? Blog { get; set; }
}`,
  example2Title: 'Fluent API：索引、精度与唯一约束（用 Fluent，不用注解）',
  example2: `using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>(u =>
        {
            u.ToTable("sys_users");                          // 表名
            u.HasKey(x => x.Id);                             // 复合主键：HasKey(x => new { x.TenantId, x.Id })
            u.Property(x => x.Email)
                .HasMaxLength(150)
                .IsRequired();                               // 必填
            u.HasIndex(x => x.Email).IsUnique();             // 唯一索引
            u.Property(x => x.Balance)
                .HasPrecision(18, 2);                        // 金额精度
            u.HasQueryFilter(x => !x.Deleted);               // 全局软删过滤
        });
    }
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public decimal Balance { get; set; }
    public bool Deleted { get; set; }
}`,
};

const ef4 = {
  id: 'efcore-migrations',
  title: '4. 迁移 Migrations：让模型演进而不丢数据',
  category: '实体建模',
  version: 'EF Core 8',
  level: '入门',
  summary: '模型改一版数据库就加一版 Migration：快照 + 增量脚本，团队协同与上线都安全。',
  detail: [
    '迁移把"模型↔数据库"之间的差异固化为可回放、可审计的增量脚本，是生产级 EF Core 的标准工作流。',
    '命令流程：dotnet ef migrations add <名称> 生成 C# 迁移文件；dotnet ef database update 应用到数据库。',
    '迁移文件内含 Up()/Down()（向前/回滚），并带模型快照（ModelSnapshot）记录上次基线。',
    '团队协作：迁移文件提交进版本库，其余成员 update 即可；冲突场景需先 rebase 再编辑迁移。',
    '脚本化发布：dotnet ef migrations script --from 0 --to <target> 输出纯 SQL 交给 DBA 审阅。',
    'EnsureCreated() 与迁移二选一是坑：前者不生成迁移，混用会冲突；演示学习前者，生产必须后者。'
  ],
  notes: [
    'dotnet-ef 工具需先安装：dotnet tool install --global dotnet-ef。',
    '每次只改模型不建迁移：运行时不会自动改库，查询很快会报"表不存在/列不存在"。'
  ],
  example: `# 1) 安装全局工具
dotnet tool install --global dotnet-ef

# 2) 生成第一个迁移（需要一个已配置 DbContext 的项目）
dotnet ef migrations add InitialCreate

# 3) 生成文件并应用（默认库为 DesignTime 配置的提供程序）
dotnet ef database update

# 4) 模型再次改动后追加新迁移
dotnet ef migrations add AddBookIsbn
dotnet ef database update

# 5) 生成可交付的 SQL 脚本
dotnet ef migrations script --from InitialCreate --to AddBookIsbn -o upgrade.sql`,
  example2Title: '迁移文件长什么样（Up/Down 与快照）',
  example2: `// Migrations/20260AddBookIsbn.cs（节选）
public partial class AddBookIsbn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Isbn",                       // 新列
            table: "Books",
            type: "TEXT",
            maxLength: 13,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Books_Isbn",
            table: "Books",
            column: "Isbn",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Books_Isbn", table: "Books");
        migrationBuilder.DropColumn(name: "Isbn", table: "Books");
    }
}

// 版本回滚到上一版
// dotnet ef database update <上一个迁移名>`,
};

module.exports = [ef1, ef2, ef3, ef4];