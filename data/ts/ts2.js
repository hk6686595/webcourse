// TypeScript 语法教程 —— 第二阶段：类型系统、面向对象与工程化
module.exports = [
  {
    id: 'ts-any-unknown-never',
    title: '16. any / unknown / never / void',
    category: '类型系统',
    version: '入门',
    level: '入门',
    summary: 'any 关闭检查；unknown 必须先窄化；never 表示不可能；void 表示无返回值。',
    detail: [
      'any 是逃生舱：可以赋任何值，也可以被当成任何类型用。用了 any，TS 在这条链上几乎不再帮你。从 JS 迁移时难免出现，但应尽快收口，不要在新代码里当默认类型。',
      'unknown 是安全的 any：也能接任何值，但你不能直接调方法、做运算，必须先窄化（typeof、断言等）。接收外部输入（JSON、用户输入、第三方回调）时优先 unknown。',
      'void 用于函数：调用方不应使用返回值。箭头函数 () => undefined 可以赋给 () => void，这是特意设计，方便把"有返回值的函数"传给"忽略返回值的回调"。',
      'never 是空集：没有值属于 never。总是抛错或死循环的函数返回 never。在 switch 的 default 里写 const _exhaustive: never = x 可以保证联合的每个分支都处理了——多一个成员就会报错。',
      '四者关系：所有类型都能赋给 any / unknown；never 能赋给所有类型（空集是任何集合的子集）；any 能赋给所有类型（这正是它危险的原因）。'
    ],
    notes: [
      'JSON.parse 的返回类型是 any，立刻写成 unknown 再校验，或用 zod 等库。',
      '捕获 catch (e) 在严格配置下是 unknown，不要假设它一定是 Error，先判断。'
    ],
    example:
      'function die(msg: string): never {\n' +
      '  throw new Error(msg);\n' +
      '}\n\n' +
      'function parse(raw: string): unknown {\n' +
      '  return JSON.parse(raw);\n' +
      '}\n' +
      'const data = parse("{\\"n\\":1}");\n' +
      'if (typeof data === "object" && data && "n" in data) {\n' +
      '  console.log((data as { n: number }).n);\n' +
      '}\n\n' +
      'type Align = "l" | "r";\n' +
      'function dir(a: Align) {\n' +
      '  switch (a) {\n' +
      '    case "l": return -1;\n' +
      '    case "r": return 1;\n' +
      '    default: {\n' +
      '      const _: never = a;       // 漏分支会在这里报错\n' +
      '      return _;\n' +
      '    }\n' +
      '  }\n' +
      '}'
  },
  {
    id: 'ts-intersection',
    title: '17. 交叉类型 A & B',
    category: '类型系统',
    version: '入门',
    level: '入门',
    summary: '交叉表示同时满足两边；常用来合并对象形状，冲突字段可能变成 never。',
    detail: [
      'A & B 表示一个值既是 A 又是 B。对象交叉 { a: number } & { b: string } 等价于 { a: number; b: string }。这是用 type 做"接口继承"的方式。',
      '和联合相反：联合是"或"，交叉是"且"。函数里很少直接写交叉参数，更多出现在工具类型和 mixin 风格的组合里。',
      '原始类型交叉 number & string 会变成 never，因为不可能既是数字又是字符串。对象字段同名但类型不兼容时，该字段也会变成 never，赋值就永远失败——这是在提醒你合并错了。',
      '交叉会把两边的可选性收紧：一边必填则结果必填。合并多个配置类型时要注意。',
      'implements 多个接口、mixin、把"基础用户 & 权限字段"拼起来，都是交叉的典型场景。能讲清楚"同时拥有"再用，否则联合更合适。'
    ],
    notes: [
      '接口的 extends 在字段冲突时往往更早报错，排查比交叉变成 never 更直观。',
      '不要用 A & B 表达"可能是 A 也可能是 B"——那是 A | B。'
    ],
    example:
      'type Timestamped = { createdAt: Date };\n' +
      'type User = { id: number; name: string };\n' +
      'type UserEntity = User & Timestamped;\n\n' +
      'const u: UserEntity = {\n' +
      '  id: 1,\n' +
      '  name: "Tom",\n' +
      '  createdAt: new Date()\n' +
      '};\n\n' +
      '// type Boom = number & string;  // never\n' +
      'type Admin = User & { role: "admin" };'
  },
  {
    id: 'ts-enum',
    title: '18. 枚举 enum 与联合替代',
    category: '类型系统',
    version: '入门',
    level: '入门',
    summary: 'enum 会生成运行时对象；多数场景用字面量联合更轻量。',
    detail: [
      'enum Dir { Left, Right } 默认从 0 编号。也可 enum Dir { Left = "left", Right = "right" } 做成字符串枚举。编译后会留下一个双向映射的 JS 对象（数字枚举尤其明显）。',
      'const enum 在编译时内联，不生成对象，但孤立模块和某些打包配置下会出问题，很多团队直接禁用。',
      '现代 TS 更推荐 type Dir = "left" | "right"，或 const Dir = { Left: "left", Right: "right" } as const 再 type Dir = typeof Dir[keyof typeof Dir]。没有额外运行时代码，和 JSON、API 字符串天然对齐。',
      '什么时候还用 enum：要对接已经按枚举设计的旧库、需要数字枚举的反向映射、团队规范强制。新项目默认用联合即可。',
      '枚举成员是值，也是类型。Dir.Left 既可当值用，也可出现在类型位置（取决于声明方式）。初学记"枚举会进 JS，联合不会"就够。'
    ],
    notes: [
      '数字枚举的反向映射 Dir[0] === "Left" 是历史特性，也容易把意外的数字当成合法成员。',
      '不要既用枚举又用同义联合，选一种。'
    ],
    example:
      '// 旧写法\n' +
      'enum Legacy {\n' +
      '  A = 1,\n' +
      '  B = 2\n' +
      '}\n' +
      'const x: Legacy = Legacy.A;\n\n' +
      '// 推荐：字面量联合\n' +
      'type Dir = "left" | "right";\n' +
      'function move(d: Dir) {\n' +
      '  console.log(d);\n' +
      '}\n' +
      'move("left");\n\n' +
      '// 带运行时对象的常量 + 类型\n' +
      'const Role = { Admin: "admin", User: "user" } as const;\n' +
      'type Role = typeof Role[keyof typeof Role];'
  },
  {
    id: 'ts-generic-fn',
    title: '19. 泛型函数',
    category: '类型系统',
    version: '进阶',
    level: '进阶',
    summary: '用 <T> 让函数"类型随参数走"，既保持复用又保住精确类型。',
    detail: [
      '没有泛型时 identity 只能写成 (x: any) => any，调用后类型信息丢了。function identity<T>(x: T): T { return x } 表示：你传入什么类型，返回就是什么类型。',
      'T 叫类型参数，名字可以是 T、U、K、TItem，习惯用大写开头。调用时可显式 identity<number>(1)，多数时候靠推断 identity(1) 即可。',
      '多个类型参数：function pair<A, B>(a: A, b: B): [A, B]。数组上的 map 就是泛型：Array<T>.map<U>(f: (t: T) => U): U[]。',
      '泛型不是"运行时模板"。编译后 T 消失，不会生成多份函数。它只影响检查和编辑器提示。',
      '什么时候上泛型：输入和输出、或多个参数之间"类型要挂钩"。如果挂钩不存在，普通类型或联合就够，不要为了看起来高级而加 <T>。'
    ],
    notes: [
      '箭头函数泛型在 .tsx 里要写成 const f = <T,>(x: T) => x，多一个逗号避免被当成 JSX。',
      '默认类型参数：function f<T = string>(x: T) 在无法推断时用 string。'
    ],
    example:
      'function identity<T>(x: T): T {\n' +
      '  return x;\n' +
      '}\n' +
      'const a = identity("hi");        // string\n' +
      'const b = identity(1);           // number\n\n' +
      'function first<T>(xs: T[]): T | undefined {\n' +
      '  return xs[0];\n' +
      '}\n' +
      'first([1, 2, 3]);                // number | undefined\n\n' +
      'function pair<A, B>(a: A, b: B): [A, B] {\n' +
      '  return [a, b];\n' +
      '}'
  },
  {
    id: 'ts-generic-constraint',
    title: '20. 泛型约束与 keyof',
    category: '类型系统',
    version: '进阶',
    level: '进阶',
    summary: 'T extends X 限制 T 必须具备某些能力；keyof 取出对象的键联合。',
    detail: [
      '裸 T 上不能读 .length，因为 T 可能是 number。写 T extends { length: number } 就约束了"必须有 length"。这叫泛型约束。',
      'keyof T 得到 T 所有键的字面量联合。interface User { name: string; age: number } 则 keyof User 是 "name" | "age"。',
      '经典组合：function get<T, K extends keyof T>(obj: T, key: K): T[K]。K 必须是 T 的键，返回值精确到该属性类型。这比 (obj: any, key: string) => any 安全几个数量级。',
      'T[K] 是索引访问类型：用键取出对应值类型。K 是联合时，T[K] 也是对应值类型的联合。',
      '约束可以是接口、联合、另一个类型参数。T extends U ? ... 是条件类型，下一章再展开。先把 extends 当成"T 必须能赋给 U"。'
    ],
    notes: [
      'keyof 任何[] 得到 number | 数组方法名等，一般对接口/对象别名使用更直观。',
      '约束过窄会导致难以传入合法值；过宽又失去检查。从实际用到的属性出发写约束。'
    ],
    example:
      'function longest<T extends { length: number }>(a: T, b: T): T {\n' +
      '  return a.length >= b.length ? a : b;\n' +
      '}\n' +
      'longest("ab", "xyz");            // string\n' +
      'longest([1], [1, 2, 3]);         // number[]\n' +
      '// longest(1, 2);               // 报错：number 没有 length\n\n' +
      'function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n' +
      '  return obj[key];\n' +
      '}\n' +
      'const user = { name: "Tom", age: 18 };\n' +
      'const n = getProp(user, "name"); // string'
  },
  {
    id: 'ts-typeof-index',
    title: '21. typeof、索引访问与 typeof 值',
    category: '类型系统',
    version: '进阶',
    level: '进阶',
    summary: 'typeof 在类型位置取"值的类型"；T["key"] 取属性类型。',
    detail: [
      'JS 的 typeof 返回字符串；TS 在类型位置写 typeof x 表示"x 这个值的类型"。const cfg = { port: 3000 }; type Cfg = typeof cfg。先有值再推导类型，改对象时类型跟着变。',
      'typeof 也可以用在函数上，得到函数类型，再 ReturnType<typeof fn> 取出返回值类型（工具类型下一章）。',
      '索引访问 T["name"] 得到 name 字段的类型。T["name" | "age"] 得到这两个字段值类型的联合。结合 keyof 能批量操作。',
      '数组的元素类型可以写 Arr[number]。元组也一样，number 作为索引会得到所有位置类型的联合。',
      '这套组合是"从已有代码提取类型"的基础，避免把同样的形状手写两遍（一遍值、一遍类型）。'
    ],
    notes: [
      '类型位置的 typeof 只能跟在值后面，不能 typeof string（string 是类型不是值）。',
      'import type 进来的名字不能当值用；反过来值可以用 typeof 变成类型。'
    ],
    example:
      'const cfg = {\n' +
      '  host: "localhost",\n' +
      '  port: 3000\n' +
      '};\n' +
      'type Cfg = typeof cfg;           // { host: string; port: number }\n\n' +
      'type Port = Cfg["port"];         // number\n' +
      'type Keys = keyof Cfg;           // "host" | "port"\n\n' +
      'const langs = ["js", "ts"] as const;\n' +
      'type Lang = typeof langs[number]; // "js" | "ts"\n\n' +
      'function add(a: number, b: number) {\n' +
      '  return a + b;\n' +
      '}\n' +
      'type AddFn = typeof add;         // (a: number, b: number) => number'
  },
  {
    id: 'ts-mapped',
    title: '22. 映射类型',
    category: '类型系统',
    version: '进阶',
    level: '进阶',
    summary: '{ [K in keyof T]: ... } 批量变换每个属性，是工具类型的底层机制。',
    detail: [
      '映射类型像对象上的"类型版 map"：遍历 keyof T，给每个键生成一个新属性。type Readonly<T> = { readonly [K in keyof T]: T[K] } 就是内置 Readonly 的思路。',
      '修饰符可以加减：-readonly 去掉只读，-? 把可选变成必填。Partial 是把每个属性加上 ?，Required 是 -?。',
      '键可以再映射：{ [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] } 这类模板字面量键属于进阶玩法，能生成 getter 接口。',
      '映射只发生在类型层，不会循环运行时对象。你写的仍是类型别名。',
      '能用内置工具类型就不要手写映射。理解映射是为了读懂 Partial / Pick 的原理，以及必要时自己做"把所有值变成 Promise"这种变换。'
    ],
    notes: [
      '映射的 in 右边必须是键类型（string | number | symbol 的子类型），通常是 keyof 或字面量联合。',
      '同态映射（K in keyof T）会保留可选、只读等修饰；从随便一个联合映射则不会。'
    ],
    example:
      'type ReadonlyAll<T> = {\n' +
      '  readonly [K in keyof T]: T[K];\n' +
      '};\n' +
      'type OptionalAll<T> = {\n' +
      '  [K in keyof T]?: T[K];\n' +
      '};\n\n' +
      'type User = { id: number; name: string };\n' +
      'type UserPatch = OptionalAll<User>;\n' +
      '// { id?: number; name?: string }\n\n' +
      'const patch: UserPatch = { name: "Bob" };'
  },
  {
    id: 'ts-conditional',
    title: '23. 条件类型与 infer',
    category: '类型系统',
    version: '进阶',
    level: '高级',
    summary: 'T extends U ? A : B 按关系选择类型；infer 在条件里取出一段类型。',
    detail: [
      '条件类型读作：如果 T 能赋给 U，结果是 A，否则是 B。type IsStr<T> = T extends string ? true : false。',
      '分配律：当 T 是联合时，T extends U ? X : Y 会拆开每个成员分别计算再联合。这就是 Exclude、Extract 的原理。不想分配可以写成 [T] extends [U]。',
      'infer 只能出现在条件类型的 extends 子句里，表示"这里挖一个类型出来"。type Ret<F> = F extends (...args: any) => infer R ? R : never 就是手写版 ReturnType。',
      '常见挖掘：函数返回值、Promise 解开（Awaited）、数组元素、元组头尾。库的类型体操大量依赖 infer，业务代码里用内置工具类型通常就够。',
      '条件类型难调试。先写几个简单的 type _ = YourType<SomeInput>，把鼠标悬停看展开结果，再改条件。'
    ],
    notes: [
      'never 分配时什么都不产生，Exclude<string | never, string> 会得到 never。',
      '循环过深或过复杂的条件会报 Type instantiation is excessively deep，说明该拆步骤或换方案。'
    ],
    example:
      'type IsStr<T> = T extends string ? "yes" : "no";\n' +
      'type A = IsStr<"a">;             // "yes"\n' +
      'type B = IsStr<1>;               // "no"\n\n' +
      'type Flatten<T> = T extends (infer U)[] ? U : T;\n' +
      'type C = Flatten<number[]>;      // number\n' +
      'type D = Flatten<string>;        // string\n\n' +
      'type ReturnOf<F> =\n' +
      '  F extends (...args: never[]) => infer R ? R : never;\n' +
      'type R = ReturnOf<() => Promise<number>>; // Promise<number>'
  },
  {
    id: 'ts-utility',
    title: '24. 内置工具类型',
    category: '类型系统',
    version: '进阶',
    level: '进阶',
    summary: 'Partial、Required、Pick、Omit、Record、Readonly、ReturnType 等现成变换。',
    detail: [
      'Partial<T> 全部可选，适合 patch / 表单草稿。Required<T> 全部必填。Readonly<T> 全部只读。',
      'Pick<T, K> 选出若干键；Omit<T, K> 去掉若干键。改 API 响应时很常用：对外隐藏 password 就 Omit<User, "password">。',
      'Record<K, V> 表示键是 K、值是 V 的对象。Record<"a" | "b", number> 是 { a: number; b: number }。字典用 Record<string, V>。',
      'Exclude<T, U> 从联合 T 里去掉能赋给 U 的成员；Extract 则留下。NonNullable<T> 去掉 null | undefined。',
      'ReturnType<F>、Parameters<F>、ConstructorParameters<C>、InstanceType<C>、Awaited<P> 从函数和 Promise 上挖类型。优先用它们，少手写 infer。'
    ],
    notes: [
      '工具类型都在 lib.es5.d.ts 等内置声明里，不用导入。',
      'Omit 对联合对象的表现有时不如手写映射精确，复杂联合上先悬停确认结果。'
    ],
    example:
      'type User = {\n' +
      '  id: number;\n' +
      '  name: string;\n' +
      '  password: string;\n' +
      '};\n\n' +
      'type PublicUser = Omit<User, "password">;\n' +
      'type UserPatch = Partial<Pick<User, "name" | "password">>;\n' +
      'type Roles = Record<"admin" | "guest", string[]>;\n\n' +
      'function fetchUser(): Promise<User> {\n' +
      '  return Promise.resolve({ id: 1, name: "a", password: "x" });\n' +
      '}\n' +
      'type U = Awaited<ReturnType<typeof fetchUser>>; // User'
  },
  {
    id: 'ts-class',
    title: '25. 类、修饰符与参数属性',
    category: '面向对象',
    version: '入门',
    level: '入门',
    summary: 'public / private / protected / readonly；构造函数参数可直接声明字段。',
    detail: [
      'TS 的 class 编译成 JS 的 class（target 足够新时）。额外提供的是字段类型和访问修饰符。',
      'public 默认公开；private 仅在本类内；protected 本类与子类。#field 是 JS 真正的运行时私有字段，和 private 不同：private 只在编译期检查，编译后仍是普通属性。',
      'readonly 字段只能在声明或构造函数里赋值。static 属于类本身。',
      '参数属性：constructor(public name: string) 一步完成"声明字段 + 赋值"，少写样板。适合小数据类；字段很多时仍建议在类体里显式列出，更易读。',
      '类既是值又是类型：let u: User 里的 User 指实例类型；typeof User 才是构造器类型。这和接口"纯类型"不同。'
    ],
    notes: [
      'strictPropertyInitialization 要求字段在构造时赋值，或标上 !（明确稍后赋值）。',
      'implements 只检查公开实例成员，检查不到 private。'
    ],
    example:
      'class User {\n' +
      '  readonly id: number;\n' +
      '  constructor(\n' +
      '    id: number,\n' +
      '    public name: string,\n' +
      '    private password: string\n' +
      '  ) {\n' +
      '    this.id = id;\n' +
      '  }\n' +
      '  check(pw: string): boolean {\n' +
      '    return pw === this.password;\n' +
      '  }\n' +
      '}\n\n' +
      'const u = new User(1, "Tom", "secret");\n' +
      'console.log(u.name);\n' +
      '// u.password;                 // 报错：private\n' +
      '// u.id = 2;                   // 报错：readonly'
  },
  {
    id: 'ts-implements-abstract',
    title: '26. implements 与抽象类',
    category: '面向对象',
    version: '进阶',
    level: '进阶',
    summary: 'implements 声明满足接口；abstract class 规定子类必须实现的成员。',
    detail: [
      'class Dog implements Animal 要求 Dog 具备 Animal 的所有成员。可以 implements 多个接口，用逗号隔开。接口仍会擦除，运行时没有 Animal 这个东西可 instanceof。',
      '抽象类 abstract class Shape 不能直接 new，可以包含抽象方法 abstract area(): number 和普通方法。子类必须实现抽象成员。抽象类会留下运行时的 class。',
      '接口 vs 抽象类：只需要形状、可能有多种无关实现 → 接口；要分享代码又要强制子类补齐某些方法 → 抽象类。TS 里组合接口往往比深继承更常见。',
      '类可以 extends 一个类，再 implements 若干接口。构造函数、重写方法时，参数要兼容基类（可多不能乱改）。override 关键字（TS 4.3+）能防止写错方法名。',
      'this 类型在链式 API 里有用：方法返回 this，子类调用能保持子类类型。初学知道有这回事即可。'
    ],
    notes: [
      '接口里不能写构造器实现，只能描述 new (...args) => T 这种构造签名（较少用）。',
      '不要为了"像 Java"而把所有东西塞进类层次，函数 + 接口在 TS 里往往更简单。'
    ],
    example:
      'interface Animal {\n' +
      '  name: string;\n' +
      '  speak(): string;\n' +
      '}\n\n' +
      'abstract class Shape {\n' +
      '  abstract area(): number;\n' +
      '  describe(): string {\n' +
      '    return `面积 ${this.area()}`;\n' +
      '  }\n' +
      '}\n\n' +
      'class Rect extends Shape {\n' +
      '  constructor(public w: number, public h: number) {\n' +
      '    super();\n' +
      '  }\n' +
      '  override area(): number {\n' +
      '    return this.w * this.h;\n' +
      '  }\n' +
      '}\n\n' +
      'class Dog implements Animal {\n' +
      '  constructor(public name: string) {}\n' +
      '  speak() { return "汪"; }\n' +
      '}'
  },
  {
    id: 'ts-modules',
    title: '27. TS 中的模块',
    category: '工程化',
    version: 'ES2015',
    level: '入门',
    summary: 'TS 模块语法与 JS 的 import/export 相同，另有 import type 只导入类型。',
    detail: [
      '带 import / export 的 .ts 文件就是模块，文件作用域隔离，和 JS 模块教程里的规则一致：命名导出、默认导出、路径、活绑定，全部适用。',
      '类型也可以导出：export type User = { ... } 或 export interface User。导入方写 import type { User } from "./user.js" 明确这是类型，保证被完全擦除，避免循环依赖时误把类型当值。',
      '值和类型同名可以一起导出（class、enum）。import { User } 既能当类型注解也能 new。若只当类型，仍建议 import type。',
      'tsconfig 的 module / moduleResolution 决定编出来的 JS 是 ESM 还是 CJS，以及怎样解析路径。现代 Node 项目常用 "module": "NodeNext"，导入要带 .js 扩展名（指向编译产物，即使源文件是 .ts）。',
      '不要用老的 namespace / /// <reference> 组织新代码，那是外部模块出现之前的方案。遇到老 .d.ts 里的 declare namespace 能读懂即可。'
    ],
    notes: [
      'verbatimModuleSyntax 开启后，类型导入必须写 import type，值导入不能带 type，规则更死也更清晰。',
      'esModuleInterop 让你对 CJS 库写 import fs from "fs" 更顺手。'
    ],
    example:
      '// user.ts\n' +
      'export type User = { id: number; name: string };\n' +
      'export function createUser(name: string): User {\n' +
      '  return { id: Date.now(), name };\n' +
      '}\n\n' +
      '// app.ts\n' +
      'import { createUser } from "./user.js";\n' +
      'import type { User } from "./user.js";\n\n' +
      'const u: User = createUser("Tom");\n' +
      'console.log(u.name);'
  },
  {
    id: 'ts-dts',
    title: '28. 声明文件与 @types',
    category: '工程化',
    version: '进阶',
    level: '进阶',
    summary: '.d.ts 只描述类型不输出 JS；给无类型的 JS 库补声明，或发布库的类型。',
    detail: [
      '声明文件以 .d.ts 结尾，里面是 declare 开头的环境声明：告诉 TS"运行时已经有这个东西"，但编译器不会为它生成 JS。全局变量、模块形状、第三方库都靠它。',
      '你 import 一个纯 JS 包，若它自带 types / typings 字段，TS 会自动用。没有的话，社区在 DefinitelyTyped 维护 @types/包名。npm i -D @types/node、@types/express 就是在装声明，不是装运行时。',
      '自己写：declare module "some-lib" { export function f(): void } 放进任意 .d.ts，并确保 tsconfig 能包含到。declare global { interface Window { myApp: boolean } } 用来扩展全局。',
      'allowJs + checkJs 可以让 JS 文件也做类型检查；JSDoc 注解 @param {string} 也能提供类型。逐步迁移时很有用。',
      '发 npm 包时：编译出 .js 的同时用 "declaration": true 生成 .d.ts，并在 package.json 写 "types": "./dist/index.d.ts"。这样别人 import 你的库就有补全。'
    ],
    notes: [
      'Could not find a declaration file for module xxx：先搜 @types/xxx，没有就自己写 declare module，或把 skipLibCheck 当权宜之计（治标不治本）。',
      '不要把实现写进 .d.ts，那里只能声明。'
    ],
    example:
      '// types/jquery-shim.d.ts  （示意）\n' +
      'declare module "legacy-lib" {\n' +
      '  export function run(cmd: string): Promise<number>;\n' +
      '}\n\n' +
      '// types/global.d.ts\n' +
      'export {};                         // 确保这是模块，才能 declare global\n' +
      'declare global {\n' +
      '  interface Window {\n' +
      '    APP_VERSION: string;\n' +
      '  }\n' +
      '}\n\n' +
      '// 业务代码\n' +
      '// import { run } from "legacy-lib";\n' +
      '// console.log(window.APP_VERSION);'
  },
  {
    id: 'ts-tsconfig',
    title: '29. tsconfig.json 与 strict',
    category: '工程化',
    version: '进阶',
    level: '进阶',
    summary: 'target / module 决定产物；strict 打开一整组安全检查，新项目默认全开。',
    detail: [
      'tsconfig.json 是项目的编译合同。npx tsc 不跟文件名时就读它。关键字段：include / exclude 指定编译哪些文件；compilerOptions 才是检查与输出规则。',
      'target：输出 JS 的语法级别（ES2015、ES2020、ESNext）。太旧则 async 会被降级；太新则老环境跑不了。现代 Node 20+ 用 ES2022 很常见。',
      'module 与 moduleResolution：决定 import 怎么发出、怎么解析。浏览器打包多用 ESNext + Bundler；纯 Node ESM 用 NodeNext。rootDir / outDir 控制源和产物目录。',
      'strict: true 等于打开 strictNullChecks、noImplicitAny、strictFunctionTypes 等一篮子选项。noImplicitAny 禁止"推断失败就变 any"；strictNullChecks 让 null 不能随便赋给 string。新项目不要关。',
      'noEmit: true 适合"类型检查交给 tsc，发出 JS 交给 vite/webpack"。skipLibCheck 跳过 node_modules 里声明文件的检查，加快编译，几乎所有项目都会开。',
      '改配置后重启 TS 服务器（VS Code 命令：Restart TS Server）再看报错是否变化。'
    ],
    notes: [
      'extends 可以继承一份基础配置（如 @tsconfig/node20）。',
      'paths 做别名（@/utils）时，运行时和打包器也要配同样的别名，tsc 不会在运行时帮你改路径。'
    ],
    example:
      '// tsconfig.json（学习用最小集）\n' +
      '// {\n' +
      '//   "compilerOptions": {\n' +
      '//     "target": "ES2022",\n' +
      '//     "module": "NodeNext",\n' +
      '//     "moduleResolution": "NodeNext",\n' +
      '//     "strict": true,\n' +
      '//     "skipLibCheck": true,\n' +
      '//     "esModuleInterop": true,\n' +
      '//     "noEmit": true\n' +
      '//   },\n' +
      '//   "include": ["src"]\n' +
      '// }\n\n' +
      '// 检查但不生成文件：\n' +
      '// npx tsc --noEmit'
  },
  {
    id: 'ts-practice2',
    title: '30. 阶段练习：给 API 客户端加类型',
    category: '工程化',
    version: '进阶',
    level: '进阶',
    summary: '用接口、泛型、工具类型和可辨识联合，描述一个小型 HTTP 封装。',
    detail: [
      '目标：写 request<T>(url, options?)，返回 Promise<T>。options 包含 method: "GET" | "POST" 和可选 body。用泛型保住调用方拿到的数据类型。',
      '定义 ApiError 与 ApiOk<T> 组成联合，再写 unwrap(result) 在失败时抛错、成功时返回 data。练习窄化和工具类型：PublicUser = Omit<User, "password">。',
      '加一个 getProp 泛型函数读取配置对象的键，约束 K extends keyof T。再写一个 Partial 风格的 update(user, patch: Partial<User>)。',
      '自检：request<PublicUser>("/me") 之后应能补全 name 而不能读 password；unwrap 在 ok: false 分支不能访问 data；getProp(cfg, "nope") 应报错。',
      '做完后试着开 strict 跑 tsc --noEmit。能过检查，说明你已经具备在真实项目里给 JS 模块补 TS 类型的能力。'
    ],
    notes: [
      '练习不必真发网络请求，用 Promise.resolve 模拟即可。',
      '若与 JS 模块教程对照：这里多出来的全部是类型，运行时仍是普通 fetch + JSON。'
    ],
    example:
      'type HttpMethod = "GET" | "POST";\n' +
      'type RequestOpts = { method?: HttpMethod; body?: unknown };\n\n' +
      'async function request<T>(url: string, opts: RequestOpts = {}): Promise<T> {\n' +
      '  const res = await fetch(url, {\n' +
      '    method: opts.method ?? "GET",\n' +
      '    body: opts.body ? JSON.stringify(opts.body) : undefined\n' +
      '  });\n' +
      '  return res.json() as Promise<T>;\n' +
      '}\n\n' +
      'type User = { id: number; name: string; password: string };\n' +
      'type PublicUser = Omit<User, "password">;\n' +
      '// const me = await request<PublicUser>("/api/me");',
    example2Title: '可辨识联合 + 泛型取值',
    example2:
      'type ApiResult<T> =\n' +
      '  | { ok: true; data: T }\n' +
      '  | { ok: false; error: string };\n\n' +
      'function unwrap<T>(r: ApiResult<T>): T {\n' +
      '  if (r.ok) return r.data;\n' +
      '  throw new Error(r.error);\n' +
      '}\n\n' +
      'function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n' +
      '  return obj[key];\n' +
      '}\n' +
      'function update<T>(obj: T, patch: Partial<T>): T {\n' +
      '  return { ...obj, ...patch };\n' +
      '}'
  }
];
