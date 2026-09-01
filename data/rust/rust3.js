// Rust 教程 11–15：数据结构与基础语法
const rust11 = {
  id: 'rust-structs',
  title: '11. 结构体 Struct：自定义数据类型',
  category: '数据结构',
  version: '1.0+',
  level: '入门',
  summary: '定义结构体、实例化、字段访问、方法（impl）、关联函数与 derive 宏。',
  detail: [
    'struct User { name: String, age: u32 } 定义具名字段结构体；还有元组结构体 tuple struct 和单元结构体。',
    '实例化：User { name: String::from("A"), age: 20 }，字段必须都有值。',
    '字段更新语法 ..other：用另一个实例补全未指定字段。',
    'impl 块定义方法（实例方法接收 &self）和关联函数（如 String::from，用 Self:: 调用）。',
    'derive 宏自动实现公共 trait：#[derive(Debug, Clone, PartialEq)]。',
    '没有构造器惯例，常用关联函数 new() 模拟。',
  ],
  notes: [
    '方法 self 有三种：&self 借用、&mut self 可变借用、self 拿走所有权。',
    '结构体字段有所有权；若持引用需生命周期标注。',
  ],
  example: `#[derive(Debug)]
struct User {
    name: String,
    age: u32,
    active: bool,
}

impl User {
    // 关联函数（构造器惯例）
    fn new(name: String, age: u32) -> Self {
        User { name, age, active: true }
    }

    // 实例方法（借用）
    fn is_adult(&self) -> bool {
        self.age >= 18
    }

    // 可变借用方法
    fn celebrate_birthday(&mut self) {
        self.age += 1;
    }
}

fn main() {
    let mut u = User::new(String::from("Alice"), 20);
    println!("{:?}", u);
    println!("adult? {}", u.is_adult());
    u.celebrate_birthday();
    println!("age now {}", u.age);  // 21
}`,
};

const rust12 = {
  id: 'rust-enums-match',
  title: '12. 枚举与模式匹配：enum 与 match',
  category: '数据结构',
  version: '1.0+',
  level: '入门',
  summary: '枚举定义带数据的变体，match 穷尽匹配，if let 简化单分支匹配。',
  detail: [
    'enum Direction { Up, Down } 定义无数据枚举；变体还可携带数据：enum Msg { Text(String), Quit }。',
    'match 必须穷尽所有分支（exhaustive），每个分支是表达式，返回统一类型。',
    '_ 通配符匹配所有未枚举的情况。',
    'if let Some(x) = ... 用于只关心一个分支的简化写法。',
    'Option<T> 是标准枚举：Some(T) / None；Result<T,E>：Ok(T)/Err(E)。',
    'match 与 if let 都是表达式，可作返回值。',
  ],
  notes: [
    'match 穷尽性是 Rust 强项：新增枚举变体时代码会编译失败提醒处理。',
    '模式匹配支持绑定（&x）、忽略（_）、范围（1..=5）等。',
  ],
  example: `enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter { year: u32 },
}

fn value(c: Coin) -> u32 {
    match c {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter { year } => {
            println!("quarter from {}", year);
            25
        }
    }
}

fn main() {
    let c = Coin::Quarter { year: 2024 };
    println!("{} cents", value(c));

    // Option 匹配
    let some = Some(42);
    match some {
        Some(n) => println!("got {}", n),
        None => println!("nothing"),
    }

    // if let 简化
    if let Some(n) = some {
        println!("if let: {}", n);
    }
}`,
};

const rust13 = {
  id: 'rust-collections',
  title: '13. 集合：Vec / HashMap / HashSet / 迭代',
  category: '数据结构',
  version: '1.0+',
  level: '入门',
  summary: '标准库动态数组 Vec、哈希表 HashMap、集合 HashSet 及常用操作。',
  detail: [
    'Vec<T> 动态可增长数组：vec![u8::MAX; 3]；push/pop、len、get、迭代。',
    'HashMap<K, V> 键值对：insert/get/entry，borrow 键。',
    'HashSet<T> 无重复集合：insert/contains/remove，用于去重与成员判断。',
    '遍历：for x in &vec、for (k,v) in &map、for v in set.iter()。',
    '遍历时修改：for item in vec.iter_mut()。',
    'Vec 索引越界 panic；用 get() 返回 Option 更安全。',
  ],
  notes: [
    'HashMap 的迭代顺序是随机的；需要有序时用 BTreeMap。',
    'Vec 扩容会触发 reallocation，大量插入时可用 with_capacity 预分配。',
  ],
  example: `use std::collections::{HashMap, HashSet};

fn main() {
    // Vec
    let mut v = vec![1, 2, 3];
    v.push(4);
    println!("{:?}", v);                    // [1,2,3,4]
    println!("first: {:?}", v.first());     // Some(1)
    for x in &v { print!("{} ", x); }
    println!();

    // HashMap
    let mut scores = HashMap::new();
    scores.insert(String::from("A"), 90);
    scores.insert(String::from("B"), 80);
    let val = scores.get("A");              // Some(&90)
    scores.entry(String::from("A")).or_insert(0);
    for (k, val) in &scores {
        println!("{} → {}", k, val);
    }

    // HashSet
    let mut set = HashSet::new();
    set.insert("apple");
    set.insert("banana");
    set.insert("apple");
    println!("len {}", set.len());          // 2（去重）
    println!("has apple? {}", set.contains("apple"));
}`,
};

const rust14 = {
  id: 'rust-iterators-closures',
  title: '14. 迭代器与闭包：Iterator / map / filter / Closure',
  category: '进阶特性',
  version: '1.0+',
  level: '进阶',
  summary: '迭代器是 Rust 函数式编程的核心：惰性、组合子（map/filter/fold）、闭包捕获。',
  detail: [
    'Iterator trait：next() 逐项返回 Option<Item>；iterator 是惰性的，需消费才执行。',
    '组合子：iter().map(|x| x*2).filter(|x| x>10).collect::<Vec<_>>()。',
    '.iter() 借不可变引用、.iter_mut() 可变、.into_iter() 拿走所有权。',
    '消费适配器：collect、sum、count、fold、for_each。',
    '闭包（closure）：|参数| 表达式，可捕获外部变量（Fn/FnMut/FnOnce）。',
    '在迭代器中使用闭包配合 map/filter 是 Rust 惯用风格，零拷贝高效。',
  ],
  notes: [
    '闭包捕获分三种：Fn（只读）、FnMut（可变借用）、FnOnce（拿走所有权）。',
    '链式迭代器编译期内联，性能通常优于手写循环。',
  ],
  example: `fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6];

    // map + filter + collect
    let even_squares: Vec<i32> = nums
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .collect();
    println!("{:?}", even_squares);  // [4, 16, 36]

    // sum / fold
    let sum: i32 = nums.iter().sum();
    println!("sum = {}", sum);       // 21

    let product: i32 = nums.iter().fold(1, |acc, &x| acc * x);
    println!("product = {}", product);

    // 闭包捕获
    let threshold = 3;
    let gt: Vec<_> = nums.iter().filter(|&&x| x > threshold).collect();
    println!("{:?}", gt);            // [4,5,6]

    // 字符串迭代
    let s = String::from("hello");
    let upper: String = s.chars().map(|c| c.to_uppercase().to_string()).collect();
    println!("{}", upper);           // HELLO
}`,
};

const rust15 = {
  id: 'rust-error-handling',
  title: '15. 错误处理：Option / Result / ? 运算符 / panic',
  category: '进阶特性',
  version: '1.0+',
  level: '进阶',
  summary: 'Rust 没有异常，用 Option 和 Result 处理可恢复错误，? 运算符传播错误，panic! 处理不可恢复错误。',
  detail: [
    'Option<T>：Some(T) 或有或无，用于可能为空的值（代替 null）。',
    'Result<T, E>：Ok(T) 成功或 Err(E) 失败，用于可能出错的操作。',
    'unwrap() 取内部值，出错则 panic；expect("msg") 带错误信息。',
    '? 运算符：在返回 Result 的函数中，遇到 Err 自动提前 return Err（传播错误）。',
    'panic!("msg") 不可恢复错误：数组越界、unwrap 失败等立即终止，可设置 panic 策略。',
    '自定义错误类型：实现 std::error::Error + Display；或用 thiserror/anyhow 库简化。',
  ],
  notes: [
    '业务代码优先用 Result 处理可预期错误，panic 只用于程序 bug。',
    '? 运算符只能用于返回 Result/Option 的函数内。',
  ],
  example: `use std::fs::File;
use std::io::{self, Read};

// ? 运算符传播错误
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;   // 出错则 return Err
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

fn parse_num(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.trim().parse::<i32>()
}

fn main() {
    // Result 使用
    match parse_num("123") {
        Ok(n) => println!("parsed {}", n),
        Err(e) => println!("error {}", e),
    }

    // Option 使用
    let v = vec![10, 20];
    match v.get(0) {
        Some(x) => println!("first {}", x),
        None => println!("empty"),
    }

    // unwrap / expect（谨慎）
    // let n = parse_num("abc").unwrap();  // panic!

    // 函数返回 Result，main 也能返回 Result
}
// 更惯用的入口
// fn main() -> Result<(), Box<dyn std::error::Error>> {
//     let data = read_file("Cargo.toml")?;
//     println!("{}", data);
//     Ok(())
// }`,
};

if (typeof module !== 'undefined') module.exports = { rust11, rust12, rust13, rust14, rust15 };