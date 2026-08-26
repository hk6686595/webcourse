// TypeScript 语法教程 —— 第一阶段：从零开始
module.exports = [
  {
    id: 'ts-intro',
    title: '1. TypeScript 是什么',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'TypeScript 是 JavaScript 的超集：在 JS 上加了静态类型，编译后仍是普通 JS。',
    detail: [
      'TypeScript（简称 TS）由微软推出，目标很明确：让你在写 JS 的同一套语法上，提前用类型把错误抓出来。它是 JS 的超集——合法的 JS 几乎都是合法的 TS，你可以逐步给旧项目加类型，而不必一夜之间重写。',
      'JS 是动态类型：变量现在是数字，下一行可以变成字符串，引擎到运行时才知道出了错。TS 在"编译期"检查：你把数字传给一个只接受字符串的函数，保存文件时编辑器就会红线报错，根本不会等到用户点按钮才炸。',
      'TS 本身不能在浏览器里直接跑。编译器 tsc 把 .ts 翻译成 .js，浏览器和 Node 执行的仍是 JS。类型注解、interface、泛型这些在编译后会被擦掉，不会出现在最终产物里，也不会拖慢运行速度。',
      '和 JS 教程的关系：变量、函数、模块、异步这些运行时知识完全共用。TS 多出来的是"怎么描述数据长什么样"。如果你已经会 JS，学 TS 主要是在学类型系统，而不是另起一门语言。',
      '为什么值得学：编辑器能自动补全对象属性；重构改名更安全；团队协作时函数签名就是文档；大型前端（React、Vue、Angular、Node 后端）几乎默认用 TS。',
      '学习路线：先会写注解和对象/函数类型，再学联合、接口、泛型，最后才是 tsconfig 和声明文件。不要一上来死磕条件类型。'
    ],
    notes: [
      '超集意味着：你可以先把文件后缀改成 .ts，代码一行不改也能编过；类型是逐渐加上去的。',
      'TS 的版本按语言功能演进（如 4.9 的 satisfies、5.0 的装饰器）。本教程以现代 TS（4.x / 5.x）为准。'
    ],
    example:
      '// greet.ts  —— 多出来的只是 : string 这种注解\n' +
      'function greet(name: string): string {\n' +
      '  return `你好，${name}`;\n' +
      '}\n\n' +
      'console.log(greet("Tom"));\n' +
      '// greet(123);              // 编译报错：数字不是 string\n\n' +
      '// 编译后的 greet.js 里没有类型，只剩 JS：\n' +
      '// function greet(name) {\n' +
      '//   return "你好，" + name;\n' +
      '// }'
  },
  {
    id: 'ts-setup',
    title: '2. 安装、编译与运行',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '用 npm 安装 TypeScript，tsc 编译，或用 tsx 直接运行 .ts 文件。',
    detail: [
      '前提：已安装 Node.js（LTS）。终端里 node -v 和 npm -v 都能出版本号即可。',
      '安装编译器：在项目目录执行 npm init -y，再 npm install -D typescript。全局安装 npm install -g typescript 也可以，但项目内安装更利于锁定版本。装好后用 npx tsc -v 查看版本。',
      '生成配置：npx tsc --init 会得到 tsconfig.json。暂时不用改，默认就能把 .ts 编成 .js。核心选项后面工程化章节再讲，现在记住它是"编译器的说明书"。',
      '编译：npx tsc hello.ts 生成 hello.js，再用 node hello.js 运行。更常见的是在项目根目录直接 npx tsc，它会按 tsconfig 编译整个项目。',
      '想跳过"先编再跑"：用 npx tsx hello.ts（需安装 tsx）或 npx ts-node hello.ts。学习阶段用 tsx 最省事，改完立刻看输出。',
      '编辑器：VS Code 内置 TS 语言服务，保存时就能看到红线和鼠标悬停类型。这是学 TS 最好的反馈，比事后看编译日志快得多。'
    ],
    notes: [
      '报错 Cannot find module typescript：没装依赖，或没在项目目录执行 npx。',
      '官方 Playground（typescriptlang.org/play）可在浏览器里试语法，适合对照本教程敲例子。'
    ],
    example:
      '// 终端（在项目目录）\n' +
      '// npm init -y\n' +
      '// npm install -D typescript tsx\n' +
      '// npx tsc --init\n\n' +
      '// hello.ts\n' +
      'const msg: string = "Hello, TypeScript";\n' +
      'console.log(msg);\n\n' +
      '// 方式 A：直接跑（学习推荐）\n' +
      '// npx tsx hello.ts\n\n' +
      '// 方式 B：先编译再跑\n' +
      '// npx tsc hello.ts\n' +
      '// node hello.js'
  },
  {
    id: 'ts-annotation',
    title: '3. 类型注解入门',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '在名字后面写 : 类型，给变量、参数、返回值贴上标签。',
    detail: [
      '注解的写法永远是"名字 : 类型"。let count: number = 1 表示 count 只能放数字。之后 count = "hi" 会报错。这就是静态类型的全部直觉：盒子上写了标签，就不能装错东西。',
      '不是每个地方都要手写。TS 会根据右边的值推断类型：let count = 1 已经是 number。能推断时可以省略注解，代码更干净。需要"提前声明、稍后赋值"或"函数对外承诺"时再显式写。',
      '函数是注解最有价值的地方：参数和返回值写清楚，调用方传错立刻报错，这也是给同事看的合同。',
      '注解只存在于 TS 世界。运行时没有这些标签，typeof 看到的仍是 JS 的运行时类型。不要用注解去"改变"一个值——它不能把字符串变成数字，只能拒绝错误的赋值。',
      '刚开始常见两种极端：到处写 : any（等于放弃检查），或每个 let 都重复写右边已经能看出来的类型。目标是：公共接口写清楚，局部变量多靠推断。'
    ],
    notes: [
      '冒号后面是类型，等号后面是值。function f(): void 的 : void 是返回类型，不是参数。',
      '写错注解时，报错信息里的 Type X is not assignable to type Y 几乎是你今后见得最多的一句话。'
    ],
    example:
      'let age: number = 18;\n' +
      'let name: string = "Tom";\n' +
      'let ok: boolean = true;\n\n' +
      '// 推断：右边是 18，age2 自动是 number\n' +
      'let age2 = 18;\n' +
      '// age2 = "18";            // 报错，和显式注解效果一样\n\n' +
      'function add(a: number, b: number): number {\n' +
      '  return a + b;\n' +
      '}\n' +
      'console.log(add(1, 2));\n' +
      '// add("1", 2);             // 报错：第一个参数应为 number'
  },
  {
    id: 'ts-primitives',
    title: '4. 原始类型',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'string、number、boolean、bigint、symbol，以及 null 与 undefined。',
    detail: [
      'TS 的原始类型和 JS 一一对应。string 是字符串，number 覆盖整数和浮点（没有 int/float 之分），boolean 只有 true / false。',
      'bigint 用于超大整数，字面量带 n：10n。symbol 是唯一标识符。日常业务里前三种用得最多。',
      'null 和 undefined 在 strict 模式下是独立类型。let x: string = null 会报错，除非你写成 string | null。这是故意的：强迫你处理"可能为空"。',
      'void 表示"没有有意义的返回值"，多用于函数：function log(s: string): void。never 表示"这个函数不可能正常返回"（死循环或必定抛错），进阶章节会用到。',
      '注意大小写：String、Number、Boolean（首字母大写）是 JS 包装对象构造器，几乎不要当注解用。注解请写小写的 string / number / boolean。'
    ],
    notes: [
      '打开 tsconfig 的 strictNullChecks 后，null / undefined 不能随便赋给其他类型。新项目请保持开启。',
      '模板字符串的类型仍是 string：`id-${n}` 只要 n 能转成字符串，结果就是 string。'
    ],
    example:
      'const title: string = "LangDocs";\n' +
      'const score: number = 99.5;\n' +
      'const passed: boolean = score >= 60;\n' +
      'const huge: bigint = 9007199254740993n;\n' +
      'const id: symbol = Symbol("id");\n\n' +
      'function log(msg: string): void {\n' +
      '  console.log(msg);\n' +
      '}\n\n' +
      'let maybe: string | null = null;   // 允许空\n' +
      'maybe = "ok";\n' +
      '// let bad: string = null;         // strict 下报错'
  },
  {
    id: 'ts-array-tuple',
    title: '5. 数组与元组',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'T[] 或 Array<T> 表示同质数组；元组 [A, B] 表示固定长度、按位类型不同的数组。',
    detail: [
      '数组：number[] 和 Array<number> 完全等价，表示"元素都是 number 的数组"。嵌套就是 number[][]。空数组字面量 [] 在无上下文时可能被推断成 never[]，给它一个注解 const xs: number[] = [] 即可。',
      '只读数组：readonly number[] 或 ReadonlyArray<number>，没有 push / splice 等改动方法，适合函数参数"我保证不改你的数组"。',
      '元组：[string, number] 表示第一位是字符串、第二位是数字、长度就是 2。普通数组不管下标类型都一样；元组按位置区分，适合"坐标、键值对、CSV 一行"这种结构。',
      '元组可标记可选尾部：[string, number?]；也可 rest：[string, ...number[]]。只读元组：readonly [string, number]，连赋值给下标都不允许。',
      '解构时类型会跟着走：const [name, age]: [string, number] = ["Tom", 18]。不要用元组去模拟对象——有名字的字段请用对象类型，读起来更清楚。'
    ],
    notes: [
      'arr[1] 在普通 number[] 上仍是 number（不会因为"可能越界"变成 number | undefined），除非开启 noUncheckedIndexedAccess。',
      'as const 会把 ["a", 1] 推断成只读元组 readonly ["a", 1]，字面量类型保留，后面会用到。'
    ],
    example:
      'const scores: number[] = [90, 80, 70];\n' +
      'const names: Array<string> = ["Tom", "Bob"];\n' +
      'scores.push(60);\n\n' +
      'const point: [number, number] = [10, 20];\n' +
      'const entry: [string, number] = ["age", 18];\n' +
      'const [k, v] = entry;\n' +
      'console.log(k, v);\n\n' +
      'function first(xs: readonly number[]): number {\n' +
      '  return xs[0];\n' +
      '  // xs.push(1);          // 报错：只读\n' +
      '}'
  },
  {
    id: 'ts-object',
    title: '6. 对象类型与可选属性',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '用花括号描述对象形状；? 表示可选，readonly 表示不可改。',
    detail: [
      '对象类型写的是"形状"：{ name: string; age: number }。只要值具备这些属性且类型匹配，就能赋给它。多余属性在直接给对象字面量赋值时会被额外属性检查拦住，防止拼写错误。',
      '可选属性 name?: string 表示可以缺省，读的时候类型是 string | undefined。使用前要判断：if (user.age !== undefined)。',
      'readonly id: number 表示不能 user.id = 2。它是编译期约束，编译后的 JS 仍可能被改——和 const 一样，防的是自己人写错，不是运行时加密。',
      '属性之间用分号或逗号都行。习惯上类型里用分号，对象值里用逗号。嵌套对象就继续写花括号。',
      '索引签名 { [key: string]: number } 表示任意字符串键对应数字，适合"动态键"的字典。能写清字段名时不要用它，否则补全和拼写检查都会变弱。'
    ],
    notes: [
      '类型里的 ? 是"可以不存在"，值和类型里的 | undefined 略有差别：精确可选属性检查（exactOptionalPropertyTypes）会区分"没写"和"写了 undefined"。',
      '空对象类型 {} 几乎能接受除 null/undefined 外的一切，很少适合当注解。想表达"任意对象"用 object 或 Record<string, unknown>。'
    ],
    example:
      'let user: { name: string; age: number } = {\n' +
      '  name: "Tom",\n' +
      '  age: 18\n' +
      '};\n\n' +
      'let book: {\n' +
      '  readonly isbn: string;\n' +
      '  title: string;\n' +
      '  subtitle?: string;\n' +
      '} = { isbn: "978-0", title: "TS 入门" };\n\n' +
      '// book.isbn = "x";        // 报错：只读\n' +
      'console.log(book.subtitle ?? "无副标题");\n\n' +
      'const dict: { [k: string]: number } = { a: 1, b: 2 };'
  },
  {
    id: 'ts-function',
    title: '7. 函数类型',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '给参数和返回值写类型；函数本身也可以作为值传递。',
    detail: [
      '最常见：function add(a: number, b: number): number { return a + b; }。返回值可以省略，TS 会根据 return 推断；公开 API 建议写上，当作文档。',
      '箭头函数同样：const add = (a: number, b: number): number => a + b。如果把函数赋给一个已有类型的变量，参数往往能从上下文推断，左边就不必重复写。',
      '函数类型长这样：(a: number, b: number) => number。可以 type Add = (a: number, b: number) => number，然后 const add: Add = (a, b) => a + b。注意这里是 =>，和对象类型的 : 不同。',
      '没有 return 或只 return; 的函数返回 void。不要把 undefined 和 void 混为一谈：void 的意思是"调用方不该使用返回值"。',
      '回调很常见：function map(xs: number[], f: (n: number) => string): string[]。把回调的参数和返回值写清楚，map 内部调用 f 时就能自动检查。'
    ],
    notes: [
      '参数名在函数类型里只是占位，(x: number) => void 和 (n: number) => void 是同一个类型。',
      'JS 里函数参数个数可以比定义少；TS 默认也允许少传可选参数，但必填参数少传会报错。'
    ],
    example:
      'function add(a: number, b: number): number {\n' +
      '  return a + b;\n' +
      '}\n\n' +
      'type Binary = (a: number, b: number) => number;\n' +
      'const mul: Binary = (a, b) => a * b;\n\n' +
      'function map(\n' +
      '  xs: number[],\n' +
      '  f: (n: number) => string\n' +
      '): string[] {\n' +
      '  return xs.map(f);\n' +
      '}\n' +
      'console.log(map([1, 2], n => `n=${n}`));'
  },
  {
    id: 'ts-fn-params',
    title: '8. 可选、默认与剩余参数',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '可选参数用 ?，默认值用 =，剩余参数用 ...rest: T[]。',
    detail: [
      '可选参数：function f(x?: number)。可传可不传，函数体内 x 的类型是 number | undefined。可选参数必须放在必填参数后面。',
      '默认值：function f(x: number = 0)。有默认值的参数自动变成可选，调用方可省略。默认值在运行时生效，类型仍按注解检查。',
      '? 和默认值不要叠在同一个参数上搞混：有默认值时通常写 x = 0 即可，不必再写 x?: number = 0（能写，但类型会变成 number | undefined，往往不是你想要的）。',
      '剩余参数：function sum(...nums: number[]): number。nums 是数组。元组也能做剩余参数：function f(...args: [string, number])。',
      '对象参数解构时，类型写在整个模式后面：function f({ name, age }: { name: string; age: number })。可选字段同样用 ?。'
    ],
    notes: [
      'JS 的 arguments 在 TS 里极少用，用 rest 参数代替，类型更清楚。',
      '重载（同一函数多种签名）属于进阶，日常用联合类型往往就够。'
    ],
    example:
      'function greet(name: string, title?: string): string {\n' +
      '  return title ? `${title} ${name}` : name;\n' +
      '}\n' +
      'greet("Tom");\n' +
      'greet("Tom", "Dr.");\n\n' +
      'function paginate(page: number = 1, size: number = 10) {\n' +
      '  return { page, size };\n' +
      '}\n\n' +
      'function sum(...nums: number[]): number {\n' +
      '  return nums.reduce((s, n) => s + n, 0);\n' +
      '}\n' +
      'console.log(sum(1, 2, 3));        // 6'
  },
  {
    id: 'ts-union',
    title: '9. 联合类型与窄化',
    category: '从零开始',
    version: 'ES',
    level: '入门',
    summary: 'A | B 表示"二者之一"；用 typeof、in、=== 把范围收窄后再安全使用。',
    detail: [
      '联合类型 string | number 表示值是其中之一，不是同时都是。能对联合做的操作，必须是两边都支持的：len 不能直接对 string | number 调用，因为 number 没有 length。',
      '窄化（narrowing）就是用运行时检查让 TS 在某个分支里知道"现在一定是某一边"。if (typeof x === "string") 里面 x 就是 string，可以 x.toUpperCase()。',
      '常用窄化手段：typeof（原始类型）、=== / !==（字面量）、in（对象属性是否存在）、instanceof（类）、Array.isArray、自定义类型谓词。',
      '联合非常适合"成功或失败"：type Result = { ok: true; data: string } | { ok: false; error: string }。用 if (r.ok) 后，TS 知道 data 一定存在。这叫可辨识联合，是 TS 里最实用的模式之一。',
      '不要一遇到"可能是好几种"就写成 any。先写联合，再窄化。实在太多再考虑泛型。'
    ],
    notes: [
      'string | null 和可选属性经常一起出现。访问前用 if (x)、x ?? default 或可选链 x?.m()。',
      'A | B | B 会被简化成 A | B。联合是集合，重复成员无意义。'
    ],
    example:
      'function pad(x: string | number): string {\n' +
      '  if (typeof x === "number") {\n' +
      '    return String(x).padStart(3, "0");\n' +
      '  }\n' +
      '  return x.padStart(3, " ");     // 这里 x 是 string\n' +
      '}\n\n' +
      'type Result =\n' +
      '  | { ok: true; data: string }\n' +
      '  | { ok: false; error: string };\n\n' +
      'function show(r: Result) {\n' +
      '  if (r.ok) console.log(r.data);\n' +
      '  else console.log(r.error);\n' +
      '}'
  },
  {
    id: 'ts-literal',
    title: '10. 字面量类型与 as const',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '把类型收成具体的 "left" 或 1，而不是宽泛的 string / number。',
    detail: [
      '字面量类型是"只有这一个值"的类型：let dir: "left" | "right"。dir = "up" 会报错。这比 string 精确得多，编辑器还能自动列出合法取值。',
      '数字和布尔也可以：let bit: 0 | 1；let flag: true。常和联合一起做配置项、状态机。',
      'let x = "left" 会被推断成 string，而不是 "left"。因为 let 以后可能改成别的字符串。想钉死字面量：const x = "left"（推断为 "left"），或 let x: "left" = "left"。',
      'as const 把整个结构钉成只读字面量：const cfg = { mode: "dark" } as const 里 mode 是 "dark" 而不是 string。对元组、配置对象特别有用。',
      '字面量联合可以替代很多 enum：type Mode = "light" | "dark"。简单、可擦除、和 JS 字符串完全一致。只有需要反向映射或旧库 API 时才考虑 enum。'
    ],
    notes: [
      '函数参数写成 (mode: "on" | "off") 时，传入变量若是 string 会报错，需保证变量本身也是字面量联合。',
      'satisfies 操作符（TS 4.9+）能校验形状同时保留字面量推断，进阶时再看，现在用 as const 足够。'
    ],
    example:
      'type Align = "left" | "center" | "right";\n' +
      'function place(a: Align) {\n' +
      '  console.log(a);\n' +
      '}\n' +
      'place("center");\n' +
      '// place("top");               // 报错\n\n' +
      'const cfg = {\n' +
      '  mode: "dark",\n' +
      '  retry: 3\n' +
      '} as const;\n' +
      '// cfg.mode 的类型是 "dark"，不是 string\n' +
      '// cfg.retry = 4;             // 报错：只读'
  },
  {
    id: 'ts-typealias',
    title: '11. 类型别名 type',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '用 type 给类型起名字，避免把长形状复制粘贴得到处都是。',
    detail: [
      'type User = { name: string; age: number } 只是给右边那个类型起了个别名，没有新建运行时的东西。编译后全部消失。',
      '别名可以是联合、元组、函数类型、甚至另一个别名的组合：type ID = string | number。复杂结构一定要起名，否则函数签名会变成一堵墙。',
      'type 可以自己嵌套引用做递归类型（如树、JSON），初学遇到链表再写即可。',
      '类型别名不能重复声明同一个名字（在同一作用域）。这和后面的 interface 可合并声明不同。',
      '何时用 type：联合、元组、函数类型、映射类型、给一长串起短名。对象形状既可用 type 也可用 interface，下一章对比。'
    ],
    notes: [
      'type 右边不能写声明语句，只能写类型。不要把 type 当成 JS 的赋值。',
      '导出类型：export type User = { ... }，导入：import type { User } from "./user.js"（运行时会被擦除）。'
    ],
    example:
      'type ID = string | number;\n' +
      'type Point = { x: number; y: number };\n' +
      'type Formatter = (n: number) => string;\n\n' +
      'type User = {\n' +
      '  id: ID;\n' +
      '  name: string;\n' +
      '  point: Point;\n' +
      '};\n\n' +
      'const u: User = {\n' +
      '  id: 1,\n' +
      '  name: "Tom",\n' +
      '  point: { x: 0, y: 0 }\n' +
      '};\n' +
      'const fmt: Formatter = n => n.toFixed(2);'
  },
  {
    id: 'ts-interface',
    title: '12. 接口 interface',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: 'interface 描述对象形状，可 extends 扩展，也可被 class implements。',
    detail: [
      'interface User { name: string; age: number } 和 type 写对象形状看起来很像。习惯上，描述"对外的对象契约"时很多人用 interface。',
      'extends 可以继承并追加字段：interface Admin extends User { role: "admin" }。可以 extends 多个接口。type 则用交叉类型 A & B 达到类似效果。',
      '同名 interface 会自动合并（声明合并）。写库的类型定义时很有用：你可以给别人的接口补字段。日常业务代码里意外合并可能造成困惑，同一对象形状保持一个声明即可。',
      'class 可以用 implements 声明"我满足这个接口"。缺字段或类型不对会报错。接口仍然会在编译后消失，不会变成 JS 的某种运行时检查。',
      '接口也能描述函数和可索引类型，但初学先掌握"对象形状 + extends"就够。'
    ],
    notes: [
      'interface 不能直接表示联合（不能 interface X = A | B）。联合请用 type。',
      '可选和只读字段写法和对象类型一样：id?: string；readonly id: string。'
    ],
    example:
      'interface User {\n' +
      '  readonly id: number;\n' +
      '  name: string;\n' +
      '  age?: number;\n' +
      '}\n\n' +
      'interface Admin extends User {\n' +
      '  role: "admin";\n' +
      '}\n\n' +
      'const a: Admin = { id: 1, name: "Tom", role: "admin" };\n\n' +
      'class Person implements User {\n' +
      '  constructor(public id: number, public name: string) {}\n' +
      '}'
  },
  {
    id: 'ts-type-vs-iface',
    title: '13. type 与 interface 怎么选',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '对象契约用哪个都行；联合、元组、映射用 type；要声明合并用 interface。',
    detail: [
      '能用两者表达的对象形状，选一个团队风格坚持即可。没有性能差别，编译后都不存在。',
      '必须用 type 的情况：联合 A | B、元组 [A, B]、映射类型、给函数类型起名、typeof / keyof 算出来的类型。interface 做不了这些。',
      '更适合 interface 的情况：要 extends 一串对象契约、要声明合并（给第三方库补类型）、class implements 一组能力。',
      '交叉 type A & B 和 interface extends 都能"合并字段"。字段冲突时 interface extends 更早报错；交叉会尝试合成，冲突可能变成 never，排查更绕。',
      '实践建议：对象和类的契约用 interface；其余用 type。看到代码混用不必强迫统一重构，先保证每个名字只表达一件事。'
    ],
    notes: [
      '不要同时 type User 和 interface User，同名会冲突（除非在声明合并的语境下只对 interface）。',
      '文档和报错信息里两者都会出现，读的时候把它们都理解成"一种类型的名字"即可。'
    ],
    example:
      '// 对象形状：两种写法等价\n' +
      'interface IUser { name: string }\n' +
      'type TUser = { name: string };\n\n' +
      '// 只能用 type\n' +
      'type Result = { ok: true } | { ok: false };\n' +
      'type Pair = [string, number];\n' +
      'type Fn = (x: number) => void;\n\n' +
      '// 更适合 interface：扩展与实现\n' +
      'interface Animal { move(): void }\n' +
      'interface Dog extends Animal { bark(): void }'
  },
  {
    id: 'ts-inference',
    title: '14. 类型推断与断言',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '能推断就别写；断言 as 是你向编译器保证，错了运行时不会帮你挡。',
    detail: [
      '推断发生在：变量初始化、函数返回、数组字面量、上下文相关的回调参数（如 [1,2,3].map(n => ...) 里 n 已是 number）。善用推断能少写很多注解。',
      '需要显式注解的典型场景：稍后再赋值的变量、公共函数签名、JSON.parse 的结果（它是 any）、DOM 查询（可能是 null）。',
      '断言 value as Type 告诉编译器"把它当成 Type"。双重断言 value as unknown as Type 能绕过几乎所有检查，等于关闭安全网，只在对接极糟的 JS 库时偶尔用。',
      '非空断言 x! 表示"这里一定不是 null / undefined"。DOM 上常用：document.getElementById("app")!。如果元素其实不存在，运行时照样崩溃——TS 不会插入检查。',
      'as const 是安全的、收窄的断言，和 as User 那种"放宽或改口"不同。优先用窄化（if / typeof），断言留到你比编译器更清楚的边界（如已校验的 JSON）。'
    ],
    notes: [
      '尖括号断言 <User>value 在 .tsx 文件里会和 JSX 标签冲突，统一写 as User。',
      'eslint 规则 @typescript-eslint/no-explicit-any 和 consistent-type-assertions 能帮你管住断言滥用。'
    ],
    example:
      'const n = 1;                    // 推断为 number\n' +
      'const ids = [1, 2, 3];          // number[]\n\n' +
      'const el = document.getElementById("app");\n' +
      '// el 是 HTMLElement | null\n' +
      'if (el) {\n' +
      '  el.textContent = "ok";       // 窄化后安全\n' +
      '}\n\n' +
      'const raw = "{\"a\":1}";\n' +
      'const data = JSON.parse(raw) as { a: number };\n' +
      'console.log(data.a);\n\n' +
      '// const boom = el!;            // 非空断言：你担保它不是 null'
  },
  {
    id: 'ts-practice1',
    title: '15. 阶段练习：给购物车函数加类型',
    category: '从零开始',
    version: '入门',
    level: '入门',
    summary: '综合对象、数组、联合与函数类型，给一组购物车函数补上注解。',
    detail: [
      '练习要求：定义 CartItem（name、price、qty），Cart 是 CartItem 数组。实现 total(cart) 计算总价，addItem(cart, item) 返回新数组（不要改原数组）。',
      '再做一个 formatPrice(n, currency)，currency 只能是 "CNY" | "USD"。用字面量联合，传错货币直接编译失败。',
      '第三问：type PayResult = { ok: true; id: string } | { ok: false; reason: string }。写 function handle(r: PayResult): string，成功返回订单号，失败返回原因。必须靠窄化，不能用 as。',
      '自测：故意把 price 传成字符串、把 currency 传成 "EUR"、在 handle 里不判断 ok 就读 id，看编辑器是否拦住你。拦住了就说明类型起作用了。',
      '做完后对照：有没有到处写 any？局部变量能不能靠推断？联合有没有写成两个可选字段挤在一个对象里（那会让 ok 和 id 同时出现，比可辨识联合弱）。'
    ],
    notes: [
      '用 npx tsx 跑；若只想检查类型：npx tsc --noEmit。',
      '下一阶段会学泛型、工具类型和 tsconfig，把"能跑"升级成"在项目里可维护"。'
    ],
    example:
      'type CartItem = { name: string; price: number; qty: number };\n' +
      'type Cart = CartItem[];\n' +
      'type Currency = "CNY" | "USD";\n\n' +
      'function total(cart: Cart): number {\n' +
      '  return cart.reduce((s, it) => s + it.price * it.qty, 0);\n' +
      '}\n' +
      'function addItem(cart: Cart, item: CartItem): Cart {\n' +
      '  return [...cart, item];\n' +
      '}\n' +
      'function formatPrice(n: number, c: Currency): string {\n' +
      '  return c === "CNY" ? `￥${n}` : `$${n}`;\n' +
      '}',
    example2Title: '可辨识联合：支付结果',
    example2:
      'type PayResult =\n' +
      '  | { ok: true; id: string }\n' +
      '  | { ok: false; reason: string };\n\n' +
      'function handle(r: PayResult): string {\n' +
      '  if (r.ok) return r.id;\n' +
      '  return r.reason;\n' +
      '}\n\n' +
      'const cart: Cart = [{ name: "书", price: 40, qty: 2 }];\n' +
      'console.log(formatPrice(total(cart), "CNY"));\n' +
      'console.log(handle({ ok: true, id: "T100" }));'
  }
];
