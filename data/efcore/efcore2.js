// EF Core 教程 5–8：查询、加载模式与更改跟踪
const ef5 = {
  id: 'efcore-relations',
  title: '5. 关系模型与导航属性：一对多 / 一对一 / 多对多',
  category: '实体建模',
  version: 'EF Core 8',
  level: '进阶',
  summary: '用导航属性表达表间关系，EF Core 自动替你维护外键与连接表，重点掌握多对多的约定与配置。',
  detail: [
    '导航属性让 C# 世界里直接"点"出关系，EF 自动为关系生成外键列（或连接表）。',
    '一对多：主表导航集合 IColl<Child> + 子表引用 Father，外键落在子表。',
    '一对一：两侧都是引用导航，适合把大表按域拆列；需配置唯一外键。',
    '多对多（EF Core 5+ 含采用跳过实体）：两侧各持集合导航即可，EF 自动建连接表；可显式命名为中间实体以扩展字段（如加入关联数量）。',
    '必需关系与可选关系：可为 null 的 FK 意味着可选；配置 Required/非 null 类型控制级联删除行为。',
    '常见坑：导航属性忘初始化集合会 NRE；双向导航要注意两端一致性（推荐集合使用 = [] 初始化并配合关系配置）。'
  ],
  notes: [
    '级联行为默认值随关系必需性不同：必需要级联、可选要 delete 时置 null。',
    '用 Fluent 配置更稳妥：HasOne(...).WithMany(...) 显式声明关系两端。'
  ],
  example: `public class Blog
{
    public int BlogId { get; set; }
    public string Title { get; set; } = "";
    public ICollection<Post> Posts { get; set; } = [];   // 一对多：集合侧
}

public class Post
{
    public int PostId { get; set; }
    public string Title { get; set; } = "";
    public int BlogId { get; set; }                       // 外键
    public Blog? Blog { get; set; }                       // 引用侧
}

// —— 多对多：双侧集合导航，EF 自动建 PostTag 连接表 ——
public class Tag
{
    public int TagId { get; set; }
    public string Name { get; set; } = "";
    public ICollection<Post> Posts { get; set; } = [];
}

// Post 中补充：
// public ICollection<Tag> Tags { get; set; } = [];

using var db = new BlogContext();

var blog = db.Blogs.Include(b => b.Posts)
                   .Single(b => b.BlogId == 1);
foreach (var p in blog.Posts)
    Console.WriteLine(p.Title);`,
  example2Title: 'Fluent API 显式配置关系与可选级联策略',
  example2: `protected override void OnModelCreating(ModelBuilder mb)
{
    // 一对多：显式两端
    mb.Entity<Post>()
      .HasOne(p => p.Blog)                  // Post 有一个 Blog
      .WithMany(b => b.Posts)               // Blog 有多个 Post
      .HasForeignKey(p => p.BlogId);        // 外键字段

    // 一对一：Address 是 User 的扩展表（可选）
    mb.Entity<User>()
      .HasOne(u => u.Address)
      .WithOne(a => a.User)
      .HasForeignKey<Address>(a => a.UserId)
      .IsRequired(false)
      .OnDelete(DeleteBehavior.SetNull);    // 删用户时把地址置空

    // 多对多：显式中间实体（可附加业务字段）
    mb.Entity<Post>()
      .HasMany(p => p.Tags)
      .WithMany(t => t.Posts)
      .UsingEntity<PostTag>(pt =>
      {
          pt.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
      });
}

public class PostTag
{
    public int PostId { get; set; }
    public int TagId { get; set; }
    public DateTime CreatedAt { get; set; }   // 连接表上的附加字段
}`,
};

const ef6 = {
  id: 'efcore-linq',
  title: '6. LINQ 查询：投影、筛选、排序与分页',
  category: '查询',
  version: 'EF Core 8',
  level: '入门',
  summary: 'IQueryable 惰性求值 + 翻译 SQL：Where/Select/OrderBy/Skip/Take 是日常最强组合。',
  detail: [
    'IQueryable 是"查询计划"不是结果：到 ToListAsync()/SingleAsync()/FirstOrDefaultAsync() 等执行时才会到数据库。',
    '投影优先 Select：只取需要字段，避免了整个实体+垃圾数据，SQL 也生成得更精简。',
    '任何能翻译成 SQL 的 LINQ 都会被翻译；不能翻译的部分（如调用自定义 C# 方法）会抛异常或退化为客户端求值。',
    '分页规矩：OrderBy 之后 Skip(page-1)*size、Take(size)，否则结果不稳定。',
    '聚合计数 CountAsync、求和 SumAsync、分组 GroupBy 用在服务端，别用 Count()（同步枚举）。',
    '注意 N+1：循环里逐条查数据库=灾难；一次查询带上关联数据（见第 7 篇加载）。'
  ],
  notes: [
    '.NET 8+ 提供 ExecuteUpdateAsync/ExecuteDeleteAsync 直接批量更新删除，不必先查询到内存。',
    '追踪行为默认跟踪实体；只读查询配合 AsNoTracking 省内存（见第 11 篇）。'
  ],
  example: `using Microsoft.EntityFrameworkCore;

// 条件组装（按需拼接查询，惰性）
var query = db.Products.AsQueryable();

if (!string.IsNullOrWhiteSpace(category))
    query = query.Where(p => p.Category == category);
if (minPrice.HasValue)
    query = query.Where(p => p.Price >= minPrice);

// 排序 + 分页 + 投影 → 一个 SQL 搞定
var page1 = await query
    .OrderBy(p => p.Price)
    .Skip(0).Take(20)
    .Select(p => new { p.Id, p.Name, p.Price })   // 投影，只回传所需列
    .ToListAsync();

// 聚合全部在服务端完成
var stats = await db.Products
    .Where(p => p.Category == "book")
    .GroupBy(p => p.Category)
    .Select(g => new { g.Key, Total = g.Sum(p => p.Price), Count = g.Count() })
    .ToListAsync();`,
  example2Title: '批量更新/删除（EF Core 7+，不需要先查出实体）',
  example2: `// 一次性批量更新：直接生成 UPDATE，绕开加载
await db.Products
    .Where(p => p.Category == "obsolete")
    .ExecuteUpdateAsync(s => s
        .SetProperty(p => p.IsActive, false)
        .SetProperty(p => p.Discount, 0.5m));

// 批量删除
await db.Carts.Where(c => c.OlderThan).ExecuteDeleteAsync();

// 传统方式对比（每次一行，慢且样板多）：
// foreach (var p in db.Products.Where(...)) { p.IsActive = false; }
// await db.SaveChangesAsync();`,
};

const ef7 = {
  id: 'efcore-loading',
  title: '7. 加载模式：Eager / Explicit / Lazy',
  category: '查询',
  version: 'EF Core 8',
  level: '进阶',
  summary: 'Include/ThenInclude 预加载、Explicit Load 显式加载、Lazy Loading 懒加载，三种取舍一次讲清。',
  detail: [
    'Eager Loading（预加载）：Include(x => x.Posts) 一次 JOIN 把导航一起取回，最常用、最可控。',
    '多级带上 ThenInclude(p => p.Comments)；多集合各自 Include 会产生叉积，注意去重或拆查询。',
    'Explicit Loading：db.Entry(entity).Collection(x => x.Posts).LoadAsync()——已拿实体，需要时再补数据。',
    'Lazy Loading：导航属性首次访问才查库；需安装 Microsoft.EntityFrameworkCore.Proxies 并开启，且属性需 virtual。',
    '推荐：默认 Eager 精确控制；Explicit 处理"按需加载"；Lazy 只适合原型，因其隐藏的 SQL 与 N+1 风险难排查。',
    '单条投影替代加载：很多场景用 Select 投影 + 子查询（.Select(p => new { p.Title, p.CommentCount })）更省流量。'
  ],
  notes: [
    'Include 之后即便整表没用到仍会生成 JOIN——过度 Include 同样伤性能。',
    '对几千行以上的"主表+多集合"分页场景，考虑分次查询或视图。'
  ],
  example: `// 1) Eager Loading：预加载两级
var blogs = await db.Blogs
    .Include(b => b.Posts)                // 先带出 Posts
        .ThenInclude(p => p.Tags)         // 再带出 Posts.Tags
    .Where(b => b.IsActive)
    .ToListAsync();

// 2) Explicit Loading：实体已在手，按需补数据
var blog = await db.Blogs.FindAsync(1);
await db.Entry(blog)
        .Collection(b => b.Posts)
        .LoadAsync();                     // 只在需要时拉取

// 3) 投影 + 计数子查询：不加载整个集合
var blogCard = await db.Blogs.Select(b => new
{
    b.Title,
    PostCount = b.Posts.Count,            // 服务端子查询，非 N+1
}).ToListAsync();`,
  example2Title: 'Lazy Loading 配置与告诫',
  example2: `// （需要安装包）dotnet add package Microsoft.EntityFrameworkCore.Proxies
using Microsoft.EntityFrameworkCore;

public class BlogContext : DbContext
{
    protected override void OnConfiguring(DbContextOptionsBuilder o)
        => o.UseSqlite("Data Source=blog.db")
            .UseLazyLoadingProxies();     // 开启代理

    public DbSet<Blog> Blogs => Set<Blog>();
}

public class Blog
{
    public int BlogId { get; set; }
    public string Title { get; set; } = "";

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}

using var db = new BlogContext();
var b = await db.Blogs.FindAsync(1);
Console.WriteLine(b.Posts.Count);   // 首次访问才查 Posts —— 隐式 SQL，慎用之`,
};

const ef8 = {
  id: 'efcore-crud',
  title: '8. 增删改查与更改跟踪：三种状态一次看透',
  category: '进阶',
  version: 'EF Core 8',
  level: '进阶',
  summary: 'Added / Modified / Unchanged / Deleted / Detached 五种状态决定 SaveChanges 做什么。',
  detail: [
    'DbContext 内部维护变更跟踪器（ChangeTracker）：实体状态决定 SaveChanges 生成的 SQL。',
    'Add → Added（INSERT，含其导航的级联）；Find 查到的 → Unchanged；改属性自动变 Modified（UPDATE 该实体）。',
    'Remove/RemoveRange → Deleted（DELETE）；脱离上下文手动操作则处于 Detached，需要 Attach/Update 拉回跟踪。',
    'SaveChanges 返回受影响行数；SaveChangesAsync 异步版本；事务自动（单次 SaveChanges 即一个事务）。',
    '更新技巧：只想改某几个字段可用 Attach + Property(x=>x.X).IsModified = true，否则会更新整行。',
    '批量场景优先第 6 篇的 ExecuteUpdateAsync/ExecuteDeleteAsync，而不是循环改实体再 SaveChanges。'
  ],
  notes: [
    'SaveChanges 只提交一次，但会按依赖顺序对若干实体逐条执行 SQL（SQL Server 可批处理）。',
    '唯一约束违反（如重复邮箱）会抛 DbUpdateException，记得捕获并回滚业务状态。'
  ],
  example: `using Microsoft.EntityFrameworkCore;

// —— Create ——
db.Books.Add(new Book { Title = "新书", Price = 66m });
await db.SaveChangesAsync();                     // INSERT

// —— Read ——
var book = await db.Books.FindAsync(1);          // 先查缓存，再落库

// —— Update：改属性即标记 Modified ——
book.Price = 77m;
await db.SaveChangesAsync();                     // UPDATE Books SET Price = @p

// —— Delete ——
db.Books.Remove(book);
await db.SaveChangesAsync();                     // DELETE

// —— 批量：直接让 EF 生成一条 UPDATE ——
await db.Books
    .Where(b => b.Price > 100)
    .ExecuteUpdateAsync(s => s.SetProperty(b => b.Price, b => b.Price * 0.9m));`,
  example2Title: '只看改动的字段更新 + 状态手工控制',
  example2: `// 场景：DTO 只带了部分字段，只想更新它们
public async Task UpdateEmail(int id, string email)
{
    var user = new User { Id = id };
    db.Attach(user);                        // Detached → Unchanged
    user.Email = email;                     // 自动变 Modified
    await db.SaveChangesAsync();            // 只 UPDATE Email 一列
}

// 显式查看状态
var state = db.Entry(book).State;           // Added / Modified / ...

// 一次性加多条
db.AddRange(b1, b2, b3);
await db.SaveChangesAsync();                // 三行一次提交（事务内）

// 取消某次操作
db.Entry(book).State = EntityState.Detached; // 断开跟踪，不再保存`,
};

module.exports = [ef5, ef6, ef7, ef8];