// JavaScript 语法教程 —— 第四阶段：模块系统（从零开始）
module.exports = [
  {
    id: 'js-mod-why',
    title: '30. 为什么需要模块',
    category: '模块系统',
    version: '入门',
    level: '入门',
    summary: '没有模块时，脚本会互相污染全局变量、依赖加载顺序，代码也难以复用。',
    detail: [
      '早期网页往往把所有 JS 写在一个大文件里，或者用多个 <script> 依次加载。每个脚本默认共享同一个全局作用域：你在 a.js 里写 var user = "Tom"，b.js 里也能读到这个 user，甚至会不小心把它覆盖掉。',
      '这叫全局污染。项目变大后，函数名、变量名极易撞车。你写了一个叫 format 的函数，同事也写了一个 format，后加载的那个会把前面的覆盖掉，页面上表现为"莫名其妙坏了"，排查起来非常痛苦。',
      '第二个问题是依赖顺序。如果 utils.js 里定义了函数，main.js 要用它，HTML 里必须先加载 utils.js 再加载 main.js。文件一多，顺序全靠人脑记忆，漏了一行或调换了顺序就会报 xxx is not defined。',
      '第三个问题是无法按需复用。你想把"格式化日期"这段逻辑拿到另一个项目用，只能复制粘贴，改了一处还得同步改所有副本。没有"导出 / 导入"这种明确边界，代码就像一锅炖，分不清谁依赖谁。',
      '模块要解决的就是这三件事：① 每个文件有自己的作用域，变量默认不泄漏；② 依赖关系写在代码里（谁 import 谁），不再靠 HTML 脚本顺序；③ 只公开需要给别人用的东西（export），其余细节藏在文件内部。',
      '一句话：模块就是给代码画格子。格子里的东西默认是私有的，只有你主动"递出去"的才能被别人拿到。'
    ],
    notes: [
      '后面所有章节都围绕"怎么画格子、怎么递东西、怎么拿东西"展开。先记住问题，语法才不会变成死记硬背。',
      '现代前端项目（React、Vue 等）几乎全部建立在 ES 模块之上，这一章是工程化的起点。'
    ],
    example:
      '// ===== 没有模块时的典型事故 =====\n' +
      '// a.js\n' +
      'var name = "页面 A";\n' +
      'function show() { console.log(name); }\n\n' +
      '// b.js（后加载，把 a.js 的 name 覆盖了）\n' +
      'var name = "页面 B";\n\n' +
      '// 用户点击按钮调用 show()，期望输出"页面 A"\n' +
      '// 实际输出"页面 B" —— 全局变量被踩踏\n\n' +
      '// HTML 里还要小心顺序：\n' +
      '// <script src="utils.js"></script>\n' +
      '// <script src="main.js"></script>\n' +
      '// 如果写反，main.js 里调用的工具函数还不存在'
  },
  {
    id: 'js-mod-what',
    title: '31. 模块是什么：一个文件就是一个模块',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '在 ES 模块里，每个 .js 文件自成一个作用域；只有 export 出去的名字才能被别人 import。',
    detail: [
      '先建立一个最简单的心智模型：一个 .js 文件 = 一个模块。文件里用 let / const / function 声明的东西，默认只在这个文件内部可见，外面拿不到。',
      '想让别的文件使用某段逻辑，必须显式 export（导出）。想用别人文件里的逻辑，必须显式 import（导入）。没有 export 的东西永远是"私有实现细节"。',
      '模块会自动开启严格模式（相当于文件顶部写了 "use strict"）。未声明的变量会直接报错，this 在顶层是 undefined 而不是 window。这对新手是好事：很多隐蔽错误会立刻暴露。',
      '同一个模块无论被 import 多少次，只会执行一次，之后大家拿到的是同一份实例（单例）。这意味着你可以在模块顶层做初始化（读配置、建缓存），不用担心被重复跑。',
      'import 语句会提升到文件顶部执行，而且必须写在文件顶层，不能塞进 if 或函数里（动态按需加载要用后面的 import()）。引擎会先解析所有静态依赖，再按依赖图执行。',
      '路径写法：导入自己项目里的文件时，相对路径必须以 ./ 或 ../ 开头。写成 import "math.js" 会被当成"去找一个叫 math.js 的第三方包"，而不是当前目录的文件。'
    ],
    notes: [
      '记住三句话：默认私有、显式导出、显式导入。这就是模块的全部哲学。',
      '浏览器里导入本地文件时，路径通常要带 .js 扩展名；漏写扩展名是新手最常见的报错原因之一。'
    ],
    example:
      '// math.js  —— 这是一个模块\n' +
      'const secret = 42;              // 私有，外面拿不到\n' +
      'export function add(a, b) {     // 公开，别人可以 import\n' +
      '  return a + b;\n' +
      '}\n' +
      'export const PI = 3.14;\n\n' +
      '// main.js  —— 另一个模块\n' +
      'import { add, PI } from "./math.js";\n' +
      'console.log(add(1, 2));         // 3\n' +
      'console.log(PI);                // 3.14\n' +
      '// console.log(secret);         // 报错：secret 没被导出',
    example2Title: '模块 vs 普通脚本的关键差异',
    example2:
      '// 普通 <script src="app.js">：\n' +
      '//   - 变量默认挂到全局（var 会污染 window）\n' +
      '//   - 不自动严格模式\n' +
      '//   - 文件之间靠"加载顺序"传递依赖\n\n' +
      '// ES 模块 <script type="module" src="app.js">：\n' +
      '//   - 文件作用域，默认不污染全局\n' +
      '//   - 自动严格模式\n' +
      '//   - 依赖写在 import 里，引擎按图加载\n' +
      '//   - 每个模块只执行一次（单例）'
  },
  {
    id: 'js-mod-history',
    title: '32. 历史方案：script、IIFE 与 CommonJS',
    category: '模块系统',
    version: '入门',
    level: '入门',
    summary: 'ES 模块出现之前，人们用 IIFE 隔离作用域、用 CommonJS（require）在 Node 里组织代码。',
    detail: [
      '了解历史不是为了考古，而是因为你现在读到的很多老代码、老教程、以及 Node.js 生态里大量 npm 包，仍然在用这些方案。见到 require 不要慌，知道它是"另一套模块语法"即可。',
      '方案一：多个 <script> 标签。最原始。所有文件共享全局，靠命名约定（比如全塞进一个 MyApp 对象）减少冲突。简单页面还能用，稍大就乱。',
      '方案二：IIFE（立即执行函数表达式）。把代码包进 (function () { ... })() 里，函数有自己的作用域，内部变量不会漏到全局。想公开的东西主动挂到 window 上。这是 jQuery 时代的主流做法，本质是"手工模拟模块"。',
      '方案三：CommonJS。Node.js 从诞生就采用这套：用 module.exports 导出，用 require("./file") 导入。加载是同步的（读完文件立刻拿到结果），很适合服务器。浏览器本身不支持 require，需要打包工具（webpack、browserify）才能用。',
      'CommonJS 导出的是值的拷贝（对原始类型而言）：模块里后来改了那个变量，已经 require 出去的那份不会跟着变。这和后面要讲的 ES 模块"活绑定"正好相反，是两套系统最大的行为差异之一。',
      '今天写新代码：浏览器和现代 Node 都优先用 ES 模块（import / export）。但维护旧项目、看 npm 文档时，require / module.exports 依然随处可见，必须能读懂。'
    ],
    notes: [
      'IIFE 现在几乎只在极老的代码或必须兼容远古浏览器时出现，新项目不必再手写。',
      'Node 文档和很多库 README 会同时给出 "ESM" 和 "CJS" 两种用法，分别对应 import 和 require。'
    ],
    example:
      '// ----- IIFE：用函数作用域隔离 -----\n' +
      'var MyApp = MyApp || {};\n' +
      'MyApp.math = (function () {\n' +
      '  var secret = 42;              // 外面看不到\n' +
      '  function add(a, b) { return a + b; }\n' +
      '  return { add: add };          // 只公开 add\n' +
      '})();\n' +
      'MyApp.math.add(1, 2);           // 3',
    example2Title: 'CommonJS（Node 传统写法）',
    example2:
      '// math.cjs  或  math.js（package.json 未设 "type":"module" 时）\n' +
      'function add(a, b) { return a + b; }\n' +
      'const PI = 3.14;\n' +
      'module.exports = { add, PI };\n' +
      '// 也可以：exports.add = add;\n\n' +
      '// main.cjs\n' +
      'const { add, PI } = require("./math");\n' +
      'console.log(add(2, 3), PI);\n\n' +
      '// 运行：node main.cjs'
  },
  {
    id: 'js-mod-overview',
    title: '33. ES 模块总览：import / export',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: 'ES 模块用 export 公开接口、用 import 引用接口；命名导出和默认导出是两种出口。',
    detail: [
      'ES 模块（ESM）是 2015 年写进语言标准的官方模块系统。浏览器（type="module"）和 Node.js（.mjs 或 "type":"module"）都已原生支持，不再必须靠打包工具才能用——虽然实际项目里打包仍然很常见。',
      '两套出口：命名导出（一个模块可以有很多个，用名字对应）和默认导出（一个模块最多一个，import 时自己起名）。两者可以同时存在，但团队里通常约定"一个文件只用一种"，避免混乱。',
      '最常见的日常写法：工具文件用命名导出（export function add / export const PI），"这个文件的主角只有一个"时用默认导出（比如一个 React 组件、一个 class）。',
      'import 必须指向一个模块说明符：相对路径（"./math.js"）、绝对 URL（浏览器）、或包名（"lodash"，由 Node / 打包器解析）。普通字符串常量才能出现在静态 import 里，不能是变量拼出来的路径（那种需求用动态 import()）。',
      '模块是静态可分析的：引擎不运行代码也能画出依赖图。好处是能在打包时做 tree-shaking（删掉没被用到的导出），减小体积。这也是静态 import 不能写进 if 的原因——条件会让依赖图变得不确定。',
      '接下来几章会把命名导出、默认导出、各种 import 写法、浏览器 / Node 运行方式拆开讲。这一章只要建立地图：export 是出口，import 是入口。'
    ],
    notes: [
      'ESM = ES Modules = import/export 这一套。CJS = CommonJS = require/module.exports 那一套。',
      '如果报错 Unexpected token export 或 Cannot use import statement outside a module，说明当前文件没被当成 ES 模块加载，先检查运行环境配置（后面两章会讲）。'
    ],
    example:
      '// ===== 一张图记住语法位置 =====\n' +
      '//\n' +
      '//   math.js                      main.js\n' +
      '//   +------------------+         +----------------------+\n' +
      '//   | export const PI  |  ---->  | import { PI, add }   |\n' +
      '//   | export function  |         |   from "./math.js";  |\n' +
      '//   |   add() {}       |         | console.log(add(1,2))|\n' +
      '//   +------------------+         +----------------------+\n' +
      '//\n' +
      '// 左边"递出去"，右边"接过来"，路径写清楚是哪个文件。\n\n' +
      'export const PI = 3.14;\n' +
      'export function add(a, b) {\n' +
      '  return a + b;\n' +
      '}',
    example2Title: '最小可运行组合（先混个眼熟）',
    example2:
      '// greet.js\n' +
      'export function greet(name) {\n' +
      '  return `你好，${name}`;\n' +
      '}\n' +
      'export default function () {\n' +
      '  return "默认问候";\n' +
      '}\n\n' +
      '// app.js\n' +
      'import fallback, { greet } from "./greet.js";\n' +
      'console.log(greet("Tom"));    // 你好，Tom\n' +
      'console.log(fallback());      // 默认问候'
  },
  {
    id: 'js-mod-named-export',
    title: '34. 命名导出 export',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '声明时导出或先声明再集中导出；导入时名字必须对得上，也可用 as 改名。',
    detail: [
      '命名导出的核心是"带名字的出口"。对方 import 时必须写同样的名字（或用 as 改名），引擎靠这个名字把两边对上。',
      '写法一：声明时直接导出。在 const / let / function / class 前面加 export。这是最直观的写法，看到声明就知道它是公开接口。',
      '写法二：先在文件里正常声明，文件底部用 export { add, PI } 一次性列出要公开的名字。适合"实现很长、接口想集中放在文件末尾"的情况，也方便一眼看完这个模块对外提供了什么。',
      '可以用 as 在导出时改名：export { add as plus }。外面必须用 plus 来导入，add 这个内部名字对外不可见。导入侧也能改名：import { plus as p } from "..."。',
      '导出的是绑定（名字），不是一次性拍扁的值。对函数和对象来说，你平时感觉不到差别；对 let 变量来说，模块内部后来改了这个变量，导入方下次读取会看到新值（下一章的"活绑定"会细讲）。导入过来的名字相当于 const，你不能在导入方重新赋值。',
      '一个模块可以有任意多个命名导出。工具库（数学函数、日期工具、校验函数）特别适合这种"一文件多出口"的风格。'
    ],
    notes: [
      'export default 和 export { x as default } 是两回事，前者是默认导出语法，见下一章。',
      '不要写 export 1 + 2 这种"导出一个值但不给名字"——命名导出必须有名字。想导出匿名值请用默认导出。'
    ],
    example:
      '// math.js —— 声明时导出\n' +
      'export const PI = 3.14;\n' +
      'export function add(a, b) {\n' +
      '  return a + b;\n' +
      '}\n' +
      'export function sub(a, b) {\n' +
      '  return a - b;\n' +
      '}\n\n' +
      '// main.js\n' +
      'import { PI, add, sub } from "./math.js";\n' +
      'console.log(add(10, 3));       // 13\n' +
      'console.log(sub(10, 3));       // 7\n' +
      'console.log(PI);',
    example2Title: '底部集中导出 + 改名',
    example2:
      '// math.js\n' +
      'function add(a, b) { return a + b; }\n' +
      'function sub(a, b) { return a - b; }\n' +
      'const PI = 3.14;\n' +
      'const hidden = "不公开";\n\n' +
      'export { add, sub, PI };\n' +
      '// export { add as plus };    // 外面只能 import { plus }\n\n' +
      '// main.js —— 导入时改名，避免和本地变量撞名\n' +
      'import { add as sum, PI } from "./math.js";\n' +
      'const add = "我本地也有个 add";\n' +
      'console.log(sum(1, 2), PI, add);'
  },
  {
    id: 'js-mod-default-export',
    title: '35. 默认导出 export default',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '每个模块最多一个默认导出；导入时自己起名，不用花括号。',
    detail: [
      '默认导出表达的是："这个文件的主角就是它"。一个模块最多只能有一个 default。导入时不使用花括号，名字由导入方自己定——这是和命名导出最大的使用差别。',
      '常见写法：export default function foo() {}、export default class User {}、export default 某个已经声明的名字、甚至 export default { ... } 直接导出对象。function / class 的默认导出可以有名字（方便在本文件里递归调用或看堆栈），也可以匿名。',
      '导入：import User from "./user.js"；这里的 User 只是你起的本地名字，不必和导出文件里的函数名一致。这也是默认导出被批评的原因：跳转到定义时，不同文件可能用了不同的名字，搜索不方便。',
      '可以和命名导出混用：import User, { helper } from "./user.js"。前半是默认导出，花括号里是命名导出。能写，但不代表应该天天混用——一个文件接口风格保持单一，读起来更轻松。',
      '新手易混点：export default function add() {} 导入时写 import { add } 会失败，因为 { add } 是在找命名导出 add，而这个文件提供的是 default。反过来，export function add() {} 却写 import add from "..." 也会失败。花括号 = 按名字取；没花括号 = 取 default。',
      '团队实践建议：工具函数、多个平级出口 → 命名导出；React/Vue 组件、一个 class 撑起整个文件 → 默认导出。选定后全项目保持一致。'
    ],
    notes: [
      'export default a, b 不合法；默认导出只能有一个值。想一次带出多个东西，用命名导出或导出一个对象。',
      'export default 不能直接用于 export default const x = 1（语法不允许）。应先 const x = 1; 再 export default x; 或直接 export default 1。'
    ],
    example:
      '// user.js\n' +
      'export default class User {\n' +
      '  constructor(name) {\n' +
      '    this.name = name;\n' +
      '  }\n' +
      '  hello() {\n' +
      '    return `我是 ${this.name}`;\n' +
      '  }\n' +
      '}\n\n' +
      '// app.js —— 名字由导入方决定，不必叫 User\n' +
      'import Person from "./user.js";\n' +
      'const u = new Person("Tom");\n' +
      'console.log(u.hello());         // 我是 Tom',
    example2Title: '混用默认导出和命名导出',
    example2:
      '// http.js\n' +
      'export function get(url) { return "GET " + url; }\n' +
      'export function post(url) { return "POST " + url; }\n' +
      'export default {\n' +
      '  version: "1.0",\n' +
      '  timeout: 3000\n' +
      '};\n\n' +
      '// app.js\n' +
      'import config, { get, post } from "./http.js";\n' +
      'console.log(config.timeout);    // 3000\n' +
      'console.log(get("/api/users"));\n\n' +
      '// 错误示范：\n' +
      '// import { default as config } from "./http.js";  // 能写，但啰嗦\n' +
      '// import { get } 才能取到命名导出；import get 取的是 default'
  },
  {
    id: 'js-mod-import-syntax',
    title: '36. 导入语法全解',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '花括号取命名导出、不带括号取默认、* as 打包成对象、as 改名、空导入只跑副作用。',
    detail: [
      'import 的几种形态看起来多，其实只在回答一件事：你要从那个模块里拿什么。把"拿什么"对上"那边 export 了什么"，就不会混。',
      '① import { add, PI } from "./math.js"：按名字取，名字必须存在于对方的命名导出中，否则报错 xxx is not exported。',
      '② import { add as plus } from "./math.js"：取来后在本文件改名叫 plus，解决命名冲突，或让名字更符合当前语境。',
      '③ import Calc from "./calc.js"：取默认导出，Calc 是你起的本地名。',
      '④ import Calc, { PI } from "./calc.js"：同时取默认导出和若干命名导出。',
      '⑤ import * as math from "./math.js"：把该模块所有命名导出（以及 default，若有）收进一个对象。之后用 math.add、math.PI 访问。适合"这个模块出口很多，不想把名字一个个列出来"。注意这是模块命名空间对象，不要去改它的属性。',
      '⑥ import "./polyfill.js"：不取任何导出，只是让该模块执行一遍。用来加载 polyfill、注册全局插件、跑初始化副作用。',
      '静态 import 只能出现在模块顶层，不能包在 if / 函数 / 循环里。需要按条件、按点击再加载时，用后面的动态 import()。'
    ],
    notes: [
      'from 后面的路径在浏览器里通常要写完整文件名含 .js；Node 的规则见第 38、44 章。',
      'import type { Foo } from "..." 是 TypeScript 语法，运行时会被擦除，纯 JS 里没有这句。'
    ],
    example:
      '// math.js\n' +
      'export const PI = 3.14;\n' +
      'export function add(a, b) { return a + b; }\n' +
      'export function mul(a, b) { return a * b; }\n' +
      'export default function () { return "math-mod"; }\n\n' +
      '// ① 命名导入\n' +
      'import { add, PI } from "./math.js";\n\n' +
      '// ② 改名\n' +
      'import { mul as multiply } from "./math.js";\n\n' +
      '// ③ 默认导入\n' +
      'import id from "./math.js";\n\n' +
      '// ④ 默认 + 命名\n' +
      'import id2, { add as plus } from "./math.js";\n\n' +
      '// ⑤ 命名空间导入\n' +
      'import * as math from "./math.js";\n' +
      'math.add(1, 2);\n' +
      'math.PI;\n' +
      'math.default();               // 默认导出挂在 .default 上\n\n' +
      '// ⑥ 只执行模块（副作用）\n' +
      'import "./math.js";',
    example2Title: '对照表（看花括号就知道在干什么）',
    example2:
      '// export 侧                     import 侧\n' +
      '// export function add()        import { add } from "..."\n' +
      '// export const PI = 3          import { PI } from "..."\n' +
      '// export { add as plus }       import { plus } from "..."\n' +
      '// export default class X {}    import X from "..."\n' +
      '//                              import AnyName from "..."\n' +
      '// export default + 命名导出    import X, { add } from "..."\n' +
      '// 全部打包                     import * as ns from "..."\n' +
      '// 只跑代码不取值               import "..."'
  },
  {
    id: 'js-mod-browser',
    title: '37. 浏览器中运行 ES 模块',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '用 <script type="module"> 加载入口；模块默认 defer，且不能直接用 file:// 打开。',
    detail: [
      '浏览器要把一个脚本当模块跑，必须写 <script type="module" src="main.js"></script>。没有 type="module" 的普通脚本里写 import / export 会直接语法报错。',
      'type="module" 的脚本默认带 defer 行为：HTML 解析完再按顺序执行，不会阻塞页面渲染。多个 module 脚本之间仍保持在文档中的先后顺序。',
      '模块请求受 CORS 约束。用双击 HTML（file:// 协议）打开时，浏览器通常会拦截模块加载（报 CORS 或 Failed to load module）。正确做法：起一个本地静态服务器，用 http://localhost 访问。VS Code 的 Live Server、npx serve、python -m http.server 都可以。',
      '入口一般只放一个 main.js，由它去 import 其他文件。子模块不要再各写一个 <script>，否则容易重复执行或搞乱依赖。',
      '路径：浏览器不会帮你补 .js 后缀，也不会去 node_modules 里找包名（除非你配了 Import Maps）。所以 import { add } from "./math.js" 的 "./" 和 ".js" 都不能省。',
      'type="module" 脚本即使没有 import / export，也仍然是模块作用域：里面的 let 不会变成全局变量。想挂到 window 上必须显式写 window.xxx = ...。'
    ],
    notes: [
      '调试：Chrome DevTools 的 Network 面板能看到每个模块的请求；Console 报错会指出是哪个文件的哪一行。',
      '老旧浏览器不支持模块时，需要打包（vite / webpack）转成普通脚本。现代浏览器（Chrome、Firefox、Edge、Safari）均已支持。'
    ],
    example:
      '<!-- index.html -->\n' +
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<body>\n' +
      '  <h1>模块演示</h1>\n' +
      '  <!-- 入口：注意 type="module" -->\n' +
      '  <script type="module" src="./main.js"></script>\n' +
      '</body>\n' +
      '</html>\n\n' +
      '// math.js\n' +
      'export function add(a, b) { return a + b; }\n\n' +
      '// main.js\n' +
      'import { add } from "./math.js";\n' +
      'console.log("1+2=", add(1, 2));',
    example2Title: '本地预览（不要用 file://）',
    example2:
      '// 在项目目录打开终端，任选一种：\n' +
      '// npx --yes serve .\n' +
      '// python -m http.server 5500\n' +
      '// 然后浏览器访问 http://localhost:3000 或 5500\n\n' +
      '// 常见报错：\n' +
      '// 1) Unexpected token import\n' +
      '//    → 忘了 type="module"\n' +
      '// 2) CORS / Cross origin ... not allowed\n' +
      '//    → 用了 file://，请换本地服务器\n' +
      '// 3) Failed to resolve module specifier "math.js"\n' +
      '//    → 缺少 ./ ，应写成 "./math.js"'
  },
  {
    id: 'js-mod-nodejs',
    title: '38. Node.js 中运行 ES 模块',
    category: '模块系统',
    version: 'ES2015',
    level: '入门',
    summary: '用 .mjs 扩展名，或在 package.json 里设 "type": "module"，然后 node 入口文件即可。',
    detail: [
      'Node 长期默认 CommonJS（require）。要让它把文件当 ES 模块解析，有两种官方开关，二选一即可。',
      '开关一：把文件改成 .mjs 扩展名（module 的 m）。main.mjs 里就可以写 import。对应的 CommonJS 文件可用 .cjs 强制按 require 解析。适合"同一个项目两套模块混着跑"的过渡期。',
      '开关二：在最近的 package.json 里写 "type": "module"，之后所有 .js 都按 ESM 解析。这是新项目更干净的做法。此时若个别文件仍要 CommonJS，把它改名为 .cjs。',
      '运行方式和以前一样：node main.js（或 node main.mjs）。不需要 type="module" 那种 HTML 标签——那是浏览器的事。',
      '在 ESM 里没有 require、没有 module.exports、没有 __dirname / __filename 这些 CJS 特有变量。需要目录路径时，用 import.meta.url 配合 URL / fileURLToPath 计算。需要加载 CJS 包时，多数情况下可以直接 import，Node 会做互操作；反向（CJS 里 require ESM）限制更多，能避免则避免。',
      'Node 对扩展名的要求比以前严：导入自己的文件时，官方推荐写出 .js。省略扩展名在旧 CJS 里很常见，ESM 里经常会报错找不到模块。'
    ],
    notes: [
      '先确认 Node 版本：LTS 即可稳定使用原生 ESM。太老的版本（12 早期等）支持不完整。',
      'package.json 的 "type" 只影响该包范围内的 .js；依赖包各自有自己的 type，互不干扰。'
    ],
    example:
      '// package.json（新项目推荐）\n' +
      '// {\n' +
      '//   "name": "mod-demo",\n' +
      '//   "type": "module"\n' +
      '// }\n\n' +
      '// math.js\n' +
      'export function add(a, b) {\n' +
      '  return a + b;\n' +
      '}\n\n' +
      '// main.js\n' +
      'import { add } from "./math.js";\n' +
      'console.log(add(2, 3));         // 5\n\n' +
      '// 终端：node main.js',
    example2Title: '没有 __dirname 时怎么拿当前文件目录',
    example2:
      'import { fileURLToPath } from "node:url";\n' +
      'import { dirname, join } from "node:path";\n' +
      'import { readFileSync } from "node:fs";\n\n' +
      'const __filename = fileURLToPath(import.meta.url);\n' +
      'const __dirname = dirname(__filename);\n\n' +
      'const text = readFileSync(join(__dirname, "notes.txt"), "utf8");\n' +
      'console.log(text);\n\n' +
      '// import.meta.url 是当前模块的 file:// URL\n' +
      '// 转成路径后，就和以前的 __dirname 一样用了'
  },
  {
    id: 'js-mod-live-binding',
    title: '39. 活绑定：导入的值会跟着变',
    category: '模块系统',
    version: 'ES2015',
    level: '进阶',
    summary: 'ESM 导入的是名字的实时绑定，不是拷贝；导出方改值，导入方下次读取能看见。',
    detail: [
      '这是 ESM 和 CommonJS 最容易忽略的差别。CommonJS 的 require 对原始类型相当于"拍照"：拍完之后源对象怎么变，你手里那张照片都不变。ESM 的 import 更像"订阅同一个变量"：对方改了，你再读就是新值。',
      '术语叫活绑定（live binding）。import { count } 并不是把当时的数字抄过来，而是让本地的 count 这个名字始终指向导出模块里的那个 count。',
      '因此：导入方不能给导入的名字重新赋值（像 const 一样受保护）。你不能写 count = 1 去改别人的导出。要改，只能调用对方导出的函数（例如 inc()），由对方在自己的模块里改自己的变量。',
      '对对象、数组、函数来说，两边拿到的是同一个引用，改属性本来就会互相看见——这和普通对象赋值一样，不是活绑定特有的。活绑定真正关键的是 let / const 这种绑定本身：const 不能改；let 在导出方改了，导入方能读到新值。',
      '这个机制让循环依赖在 ESM 里比 CJS 更容易活下来：即使对方模块还没执行完，你导入的函数名字已经存在，只要等双方都初始化完再调用函数即可（不要在模块顶层立刻去读对方还没赋值的变量）。',
      '实践上：少导出会变来变去的 let 变量，多导出函数。接口更清晰，也不用让使用者操心"我现在读到的是不是最新值"。'
    ],
    notes: [
      'import * as ns 得到的命名空间对象也是活的：ns.count 同样会看到更新。',
      '不要试图 Object.assign 或改 ns 上的属性来"补丁"别人的模块，运行时会抛错或静默失败。'
    ],
    example:
      '// counter.js\n' +
      'export let count = 0;\n' +
      'export function inc() {\n' +
      '  count += 1;\n' +
      '}\n\n' +
      '// main.js\n' +
      'import { count, inc } from "./counter.js";\n' +
      'console.log(count);             // 0\n' +
      'inc();\n' +
      'inc();\n' +
      'console.log(count);             // 2  ← 看到了新值（活绑定）\n' +
      '// count = 100;                // 报错：不能给导入绑定赋值',
    example2Title: '对比 CommonJS（拷贝）',
    example2:
      '// counter.cjs\n' +
      'let count = 0;\n' +
      'function inc() { count += 1; }\n' +
      'module.exports = { count, inc };\n\n' +
      '// main.cjs\n' +
      'const c = require("./counter.cjs");\n' +
      'console.log(c.count);           // 0\n' +
      'c.inc();\n' +
      'console.log(c.count);           // 仍是 0！\n' +
      '// require 时把当时的数字 0 拷进了导出对象\n' +
      '// 内部 count 变了，导出对象上的 count 还是旧的\n' +
      '// CJS 若要看到更新，应导出 getter 或只导出 inc 并提供 getCount()'
  },
  {
    id: 'js-mod-reexport',
    title: '40. 重新导出与模块聚合',
    category: '模块系统',
    version: 'ES2015',
    level: '进阶',
    summary: '用 export ... from 把子模块的出口转到一个入口文件，方便外界只 import 一次。',
    detail: [
      '项目稍大后，工具函数会拆到多个文件：add.js、sub.js、format.js……如果每次都从深层路径导入，调用方会写一长串相对路径，重构时到处改。',
      '惯例是在文件夹里放一个 index.js 当"前台"：它自己可以没有多少逻辑，只负责把内部模块重新导出。外界只需要 from "./math/index.js" 或 from "./math.js"（看你的目录约定）。',
      '语法：export { add } from "./add.js" 等于"从 add.js 导入 add，立刻再导出 add"，当前文件里不会出现 add 这个本地变量。若本文件还要用，就写成 import { add } from "./add.js"; export { add };',
      'export * from "./add.js" 会把对方所有命名导出转发出去（不含 default）。多个 export * 时，若出现同名导出会报错，这时改用显式列出名字来消歧义。',
      '默认导出的转发要单独写：export { default } from "./user.js" 或 export { default as User } from "./user.js"。容易漏，所以很多团队在聚合层只用命名导出。',
      '聚合文件是公共 API 的边界：文件夹内部结构以后怎么拆，只要 index.js 的导出名单不变，外面就不用改。这和"画格子"是同一思想，只是格子从文件升级成了目录。'
    ],
    notes: [
      '重新导出不会复制一份代码，只是把绑定再连出去，仍然是活绑定。',
      '不要为了"好看"把整个项目都从同一个巨型 index 导入，循环依赖和打包体积都会变差。按功能域分几个入口即可。'
    ],
    example:
      '// math/add.js\n' +
      'export function add(a, b) { return a + b; }\n\n' +
      '// math/sub.js\n' +
      'export function sub(a, b) { return a - b; }\n\n' +
      '// math/index.js  —— 聚合入口\n' +
      'export { add } from "./add.js";\n' +
      'export { sub } from "./sub.js";\n' +
      '// 或一行：export { add } from "./add.js";\n\n' +
      '// app.js  —— 只需面对 index\n' +
      'import { add, sub } from "./math/index.js";\n' +
      'console.log(add(5, 2), sub(5, 2));',
    example2Title: '本文件既使用又转发',
    example2:
      '// math/index.js\n' +
      'import { add } from "./add.js";\n' +
      'import { sub } from "./sub.js";\n\n' +
      'export function sumAll(...nums) {\n' +
      '  return nums.reduce((s, n) => add(s, n), 0);\n' +
      '}\n' +
      'export { add, sub };            // 再转发出去\n\n' +
      '// export * from "./add.js";    // 快捷转发全部命名导出'
  },
  {
    id: 'js-mod-sideeffect-cycle',
    title: '41. 副作用导入与循环依赖',
    category: '模块系统',
    version: 'ES2015',
    level: '进阶',
    summary: 'import "./x.js" 只执行模块；循环 import 允许存在，但顶层不要立刻读对方还没初始化的变量。',
    detail: [
      '副作用导入：import "./init.js" 不绑定任何名字，目的就是让 init.js 跑一遍。典型用途：给 Array.prototype 打补丁、注册自定义元素、连接数据库、加载 CSS（在打包器里）。写这种模块时，顶层代码就是它的全部意义，要克制，避免隐式全局修改让人找不到来源。',
      '模块只执行一次。A 和 B 都副作用导入 init.js，init.js 仍然只跑一遍。依赖"每次 import 都重新初始化"会失望——那不是模块的语义，需要的话请导出工厂函数，由调用方显式执行。',
      '循环依赖：a.js import b.js，b.js 又 import a.js。ESM 允许这种图。引擎会先实例化所有模块（创建作用域、连上绑定），再执行它们的顶层代码。活绑定让"函数"在双方都执行完之前就可以先连上名字。',
      '危险点在顶层立刻读变量。若 a.js 顶层写 console.log(x)，而 x 是从 b.js 导入的，b.js 又要等 a.js 执行完才给 x 赋值，这时读到的可能是暂时的死区或未初始化错误。安全模式：循环两边只导入函数，真正用到的值放到函数被调用时再读——那时双方都初始化完了。',
      '更好的做法：能不循环就不循环。把双方都依赖的那一小段抽到第三个文件 c.js，a 和 b 都只依赖 c。图变成树，问题消失。',
      '排查循环：报错 Cannot access xxx before initialization 且栈里两个模块互相出现时，优先怀疑循环 + 顶层读值。打包器有时会警告 cyclic dependency。'
    ],
    notes: [
      '副作用模块会妨碍 tree-shaking：打包器不敢删"看起来没被用到"的文件，因为它可能在改全局。能做成显式函数就做成函数。',
      '测试时若发现"改了代码却像没执行"，检查是否被另一个测试先 import 过——单例只会跑一次。'
    ],
    example:
      '// init.js —— 副作用模块\n' +
      'console.log("初始化一次");\n' +
      'if (typeof globalThis.appReady === "undefined") {\n' +
      '  globalThis.appReady = true;\n' +
      '}\n\n' +
      '// a.js\n' +
      'import "./init.js";\n' +
      '// b.js\n' +
      'import "./init.js";\n' +
      '// 无论 a、b 谁先被加载，"初始化一次"只打印一遍',
    example2Title: '循环依赖：顶层读变量会炸，函数调用通常没事',
    example2:
      '// a.js\n' +
      'import { hello } from "./b.js";\n' +
      'export function ping() {\n' +
      '  return hello() + " from a";\n' +
      '}\n\n' +
      '// b.js\n' +
      'import { ping } from "./a.js";\n' +
      'export function hello() {\n' +
      '  return "hello";\n' +
      '}\n' +
      '// 顶层立刻调用 ping() 可能失败（a 还没执行完）\n' +
      '// export const bad = ping();\n' +
      '// 放到函数里，等双方就绪再调用就安全：\n' +
      'export function start() {\n' +
      '  return ping();\n' +
      '}'
  },
  {
    id: 'js-mod-dynamic',
    title: '42. 动态 import() 按需加载',
    category: '模块系统',
    version: 'ES2020',
    level: '进阶',
    summary: 'import() 返回 Promise，可在点击、分支、异步函数里再加载模块，实现代码分割。',
    detail: [
      '静态 import 必须写在顶层，加载时机由引擎在执行前决定。有些代码很重（编辑器、图表库、管理后台页面），用户可能根本点不进去——一上来全加载会拖慢首屏。',
      '动态 import("./editor.js") 是一个函数调用，返回 Promise。resolve 的结果是模块命名空间对象，和 import * as ns 拿到的那个对象同一类：命名导出是属性，默认导出在 ns.default。',
      '可以写在任何地方：按钮点击回调、if 分支、async 函数里。路径可以是字符串变量（仍建议保持在可分析的范围内，打包器才能切出独立小包）。await import(...) 是最常见的写法。',
      '失败时 Promise 会 reject（文件 404、语法错误、网络问题），要用 try/catch 包住，给用户一个降级提示，而不是让整页白屏。',
      '和静态 import 的分工：启动就需要的工具、类型明确的核心依赖 → 静态 import；路由页面、弹窗、按特性开关加载的重模块 → 动态 import()。不要把所有东西都改成动态，那样会失去静态分析，代码更难看，启动也未必更快（请求变碎）。',
      '顶层 await（在模块顶层直接 await）可以和动态 import 配合做"启动时按环境加载"：例如仅在浏览器缺少某 API 时再加载 polyfill。顶层 await 会让依赖此模块的其他模块等待它完成。'
    ],
    notes: [
      '打包工具（vite、webpack）看到 import("./page.js") 通常会把 page.js 打成单独的异步 chunk。',
      'import() 和 Node 的 require() 都是"运行时加载"，但 import() 是异步的，不要把它当同步 require 用。'
    ],
    example:
      '// 点击后再加载重模块，避免拖慢首屏\n' +
      'const btn = document.querySelector("#open-editor");\n' +
      'btn.addEventListener("click", async () => {\n' +
      '  try {\n' +
      '    const { openEditor } = await import("./editor.js");\n' +
      '    openEditor();\n' +
      '  } catch (err) {\n' +
      '    console.error("编辑器加载失败", err);\n' +
      '  }\n' +
      '});',
    example2Title: '条件加载与取默认导出',
    example2:
      'async function loadChart(kind) {\n' +
      '  const mod = kind === "bar"\n' +
      '    ? await import("./charts/bar.js")\n' +
      '    : await import("./charts/line.js");\n' +
      '  const Chart = mod.default;    // 默认导出\n' +
      '  return new Chart();\n' +
      '}\n\n' +
      '// 顶层 await（该文件本身必须是模块）\n' +
      'const locale = await import(`./i18n/${navigator.language}.js`)\n' +
      '  .catch(() => import("./i18n/en.js"));\n' +
      'console.log(locale.default);'
  },
  {
    id: 'js-mod-cjs-vs-esm',
    title: '43. CommonJS 与 ESM 对照',
    category: '模块系统',
    version: '进阶',
    level: '进阶',
    summary: 'require 同步、导出拷贝；import 静态、活绑定。混用时认准文件扩展名和 package.json 的 type。',
    detail: [
      '两套系统会在相当长时间内共存。读代码时先判断当前文件是哪一套，再套对应语法，不要在同一个文件里混写 require 和 import（除非经过构建工具转译）。',
      '加载时机：CJS 的 require 是同步的，执行到那一行才读文件，可以包在 if 里。ESM 的静态 import 在执行前就解析完依赖图；运行时按需加载只能用 import()。',
      '导出物：CJS 导出的是值（对象拷贝语义，原始类型尤其明显）。ESM 导出的是绑定。这导致"导出一个会变的数字"在两边行为不同，前面活绑定一章已演示。',
      'this / 路径辅助：CJS 有 __dirname、__filename、require、module、exports。ESM 顶层 this 是 undefined，用 import.meta.url 代替文件路径信息。',
      '互操作：在 ESM 文件里 import 一个 CJS 包，通常能用，默认导出往往对应 module.exports 整体。反过来，CJS 文件 require 一个 ESM 模块，在很多 Node 版本里会直接报错（ERR_REQUIRE_ESM）。发布库时若要同时服务两种用户，需要双格式导出（package.json 的 exports 字段分别给 import / require 指向不同文件）。',
      '判断清单：① 看扩展名 .cjs / .mjs；② 看最近的 package.json 有没有 "type":"module"；③ 看代码里是 require 还是 import。三步能定 90% 的现场。'
    ],
    notes: [
      '本教程站点的 Node 服务端（server.js）使用的就是 CommonJS 的 require，这是 Express 生态里非常典型的写法。',
      '新项目选 ESM 即可；维护老项目不要为了"追新"强行把所有 require 改 import，收益小、风险大。'
    ],
    example:
      '// --------- CommonJS ---------\n' +
      '// const fs = require("fs");\n' +
      '// module.exports = { add };\n' +
      '// exports.add = add;         // 与上一行相关，别混用风格\n' +
      '// console.log(__dirname);\n\n' +
      '// --------- ES Module ---------\n' +
      '// import fs from "node:fs";\n' +
      '// export function add() {}\n' +
      '// export default class X {}\n' +
      '// console.log(import.meta.url);',
    example2Title: '同一句话的两边写法',
    example2:
      '// 导出一个函数\n' +
      '// CJS:  function add(a,b){return a+b}  module.exports = { add };\n' +
      '// ESM:  export function add(a, b) { return a + b; }\n\n' +
      '// 导入这个函数\n' +
      '// CJS:  const { add } = require("./math");\n' +
      '// ESM:  import { add } from "./math.js";\n\n' +
      '// 默认/整体导出\n' +
      '// CJS:  module.exports = class User {}\n' +
      '// ESM:  export default class User {}\n' +
      '// CJS 导入：const User = require("./user");\n' +
      '// ESM 导入：import User from "./user.js";'
  },
  {
    id: 'js-mod-path-pkg',
    title: '44. 路径、扩展名与 package.json',
    category: '模块系统',
    version: '进阶',
    level: '进阶',
    summary: '相对路径要有 ./；浏览器要带 .js；Node 用 type 和 exports 决定怎么解析包。',
    detail: [
      '相对路径：当前目录用 ./file.js，上级目录用 ../file.js。写成 import "file.js" 或 import "math" 时，解析器会当成包名，去 node_modules 里找，而不是旁边那个文件。漏写 ./ 是仅次于漏写扩展名的第二常见错误。',
      '扩展名：浏览器 ESM 必须写 .js（或你实际的后缀，如 .mjs）。Node 的 ESM 也强烈建议写上。打包器（vite）有时允许省略甚至导入 .ts，那是工具帮你补的，离开工具就失效——学语法时按运行时规则写完整。',
      'package.json 的 "type":"module" 让该包内 .js 按 ESM 解析。"main" 是 CJS 时代的入口字段；现代库用 "exports" 精确指定：别人写 import "my-lib" 时到底拿到哪一个文件，以及 import 和 require 是否指向不同构建产物。',
      '第三方包：import _ from "lodash" 这种不带路径的说明符，由 Node 或打包器在 node_modules 里解析。浏览器原生不认包名，除非配置 Import Maps，或继续用打包器。所以"纯浏览器无构建"项目里，要么写相对路径，要么上 import map。',
      'Import Maps（浏览器）：在 HTML 里用 <script type="importmap"> 声明 { "imports": { "dayjs": "/vendor/dayjs.js" } }，之后页面模块里就可以 import dayjs from "dayjs"。这是让浏览器接近 Node 解析体验的官方手段。',
      'JSON 模块、CSS 模块等是运行时或工具链的扩展（import data from "./a.json" with { type: "json" }）。先把 JS 模块走顺，再按需了解这些断言语法。'
    ],
    notes: [
      '报错 ERR_MODULE_NOT_FOUND 先查：路径是否带 ./、扩展名是否写出、文件是否真的在那个位置、大小写是否一致（Linux 服务器区分大小写）。',
      '不要把 node_modules 里的深路径当公共 API 去 import，升级依赖时内部结构一变你的代码就碎。只从包名入口导入。'
    ],
    example:
      '// 相对路径：必须有 ./ 或 ../\n' +
      'import { add } from "./math.js";\n' +
      'import { User } from "../models/user.js";\n\n' +
      '// 包名：交给 Node / 打包器\n' +
      '// import express from "express";\n\n' +
      '// package.json 片段（库作者视角）\n' +
      '// {\n' +
      '//   "name": "my-lib",\n' +
      '//   "type": "module",\n' +
      '//   "exports": {\n' +
      '//     ".": {\n' +
      '//       "import": "./dist/index.js",\n' +
      '//       "require": "./dist/index.cjs"\n' +
      '//     }\n' +
      '//   }\n' +
      '// }',
    example2Title: '浏览器 Import Maps 最小例子',
    example2:
      '<!-- index.html -->\n' +
      '<script type="importmap">\n' +
      '{\n' +
      '  "imports": {\n' +
      '    "utils": "./lib/utils.js"\n' +
      '  }\n' +
      '}\n' +
      '</script>\n' +
      '<script type="module">\n' +
      '  import { add } from "utils";\n' +
      '  console.log(add(1, 2));\n' +
      '</script>'
  },
  {
    id: 'js-mod-practice',
    title: '45. 阶段练习：做一个小工具库',
    category: '模块系统',
    version: '入门',
    level: '入门',
    summary: '拆分文件、命名导出、index 聚合、写一个入口 main.js，在 Node 或浏览器里跑通。',
    detail: [
      '练习目标：亲手搭一个最小的多文件项目，把前面的语法全部用一遍。不要只看，一定要建文件夹、写文件、跑起来。',
      '目录建议：lib/string.js 放字符串工具，lib/number.js 放数字工具，lib/index.js 聚合导出，main.js 作为入口调用它们。先让 Node 跑通（package.json 设 "type":"module"，然后 node main.js），有余力再配一个 index.html 用 type="module" 在浏览器里跑。',
      'string.js 要求：导出 capitalize（首字母大写）、repeat（重复 n 次）。number.js 要求：导出 clamp（把数字限制在 min~max 之间）、average（求平均值）。index.js 用 export { ... } from 转发。main.js 只从 "./lib/index.js" 导入，不要深入子文件。',
      '自测用例：capitalize("hello") 为 "Hello"；clamp(120, 0, 100) 为 100；average(2, 4, 6) 为 4。自己用 console.log 或 console.assert 验证。',
      '加分项：① 给 string.js 增加一个默认导出对象，里面包含全部方法，main 里同时演示命名导入和默认导入；② 把 average 改成动态 import，只有当你在 main 里设置 USE_STATS = true 时才加载 number.js；③ 故意制造一次循环依赖再拆掉它，体会报错信息。',
      '做完后的能力清单：能说清为什么需要模块；能写命名导出和默认导出并不搞混花括号；能在 Node 和浏览器各自把入口跑起来；看到 require 知道那是 CJS。达到这四条，就可以在真实项目里开始拆文件了。'
    ],
    notes: [
      '若 Node 报 Cannot use import statement，检查 package.json 是否有 "type": "module"，或把文件改名为 .mjs。',
      '若浏览器 CORS 报错，用本地静态服务器而不是双击 HTML。'
    ],
    example:
      '// ===== lib/string.js =====\n' +
      'export function capitalize(s) {\n' +
      '  if (!s) return "";\n' +
      '  return s[0].toUpperCase() + s.slice(1);\n' +
      '}\n' +
      'export function repeat(s, n) {\n' +
      '  return String(s).repeat(n);\n' +
      '}\n\n' +
      '// ===== lib/number.js =====\n' +
      'export function clamp(n, min, max) {\n' +
      '  return Math.min(max, Math.max(min, n));\n' +
      '}\n' +
      'export function average(...nums) {\n' +
      '  const total = nums.reduce((s, x) => s + x, 0);\n' +
      '  return total / nums.length;\n' +
      '}\n\n' +
      '// ===== lib/index.js =====\n' +
      'export { capitalize, repeat } from "./string.js";\n' +
      'export { clamp, average } from "./number.js";',
    example2Title: '入口 main.js 与自测',
    example2:
      '// package.json 需包含 "type": "module"\n' +
      '// ===== main.js =====\n' +
      'import { capitalize, repeat, clamp, average } from "./lib/index.js";\n\n' +
      'console.assert(capitalize("hello") === "Hello");\n' +
      'console.assert(repeat("ab", 3) === "ababab");\n' +
      'console.assert(clamp(120, 0, 100) === 100);\n' +
      'console.assert(clamp(-5, 0, 100) === 0);\n' +
      'console.assert(average(2, 4, 6) === 4);\n' +
      'console.log("全部通过");\n' +
      'console.log(capitalize("modules"), clamp(80, 0, 100));\n\n' +
      '// 加分：按需加载\n' +
      'const USE_STATS = true;\n' +
      'if (USE_STATS) {\n' +
      '  const { average: avg } = await import("./lib/number.js");\n' +
      '  console.log("avg", avg(1, 2, 3));\n' +
      '}'
  }
];
