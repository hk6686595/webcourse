const $ = (id) => document.getElementById(id);
const state = { view: 'home', lang: 'csharp', list: [], current: null, cache: {} };

/* ================= 语法高亮 ================= */
const KW = {
  cs: 'using namespace class struct record interface enum public private protected internal static readonly const void new return if else switch case default break continue for foreach while do in out ref this base null true false var async await yield get set init required partial override virtual abstract sealed throw try catch finally is as and or not when where operator implicit explicit params typeof sizeof nameof lock event delegate global file checked unchecked stackalloc with from select group orderby let join into equals descending ascending by on add remove unmanaged notnull scoped nint nuint',
  cpp: 'alignas alignof auto bool break case catch char char8_t char16_t char32_t class concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if import inline int long mutable namespace new noexcept nullptr operator private protected public register requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while module suspend_always suspend_never suspend_once std size_t uint8_t uint16_t uint32_t uint64_t int8_t int16_t int32_t int64_t',
  js: 'var let const function return if else for while do switch case default break continue of in typeof instanceof new class extends super this null undefined true false void delete yield async await try catch finally throw import export from default static get set constructor debugger with arguments',
  ts: 'var let const function return if else for while do switch case default break continue of in typeof instanceof new class extends super this null undefined true false void delete yield async await try catch finally throw import export from default static get set constructor debugger type interface enum implements declare namespace abstract readonly keyof infer satisfies override module global accessor as is never unknown any',
  py: 'def class return if elif else for while break continue in not and or is None True False import from as with try except finally raise yield lambda global nonlocal pass del assert async await match case print type isinstance',
  rust: 'fn let mut const static use mod pub struct enum trait impl self Self super crate break continue for while loop if else match return where as async await dyn move ref type unsafe extern macro_rules in if let while let true false Some None Ok Err box'
};
const TYPES = {
  cs: 'int string bool double decimal float long short byte sbyte char uint ulong ushort object dynamic Task Action Func ValueTask Span ReadOnlySpan IAsyncEnumerable CancellationToken IList IDictionary IEnumerable IQueryable List Dictionary HashSet Nullable DateTime TimeSpan Guid Math Console Convert String Int32 Int64 Decimal Boolean Exception HttpClient WebApplication record class struct interface enum',
  cpp: 'string string_view vector array span map set unordered_map optional variant tuple pair unique_ptr shared_ptr weak_ptr function thread jthread mutex atomic semaphore latch barrier generator coroutine_handle promise_type stop_token counting_semaphore strong_ordering weak_ordering partial_ordering formatter hash iterator size_t',
  js: 'console Math JSON Object Array Promise Map Set Symbol Number String Boolean Date RegExp Function Proxy Reflect BigInt Int8Array Uint8Array Float64Array document window globalThis setTimeout setInterval queueMicrotask structuredClone Symbol Iterator Generator AsyncFunction',
  ts: 'string number boolean bigint symbol object undefined null any unknown never void Array Promise Record Partial Required Pick Omit Readonly Exclude Extract NonNullable ReturnType Parameters Awaited ConstructorParameters InstanceType ReadonlyArray Map Set Date Error JSON console document window fetch HTMLElement',
  py: 'int float str bool list dict set tuple None range enumerate zip map filter open print len type object Exception str bytes frozenset complex property dataclass Enum Counter defaultdict deque Path datetime json re asyncio',
  rust: 'String str Vec HashMap HashSet Box Rc RefCell Arc Mutex RwLock Option Result i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char usize isize Self std io fs path thread sync mpsc future Future tokio axum serde Serialize Deserialize Parser HashMap BTreeMap VecDeque LinkedList BinaryHeap Cow slice'
};
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function highlight(code, lang) {
  const kws = new Set(KW[lang].split(' '));
  const types = new Set(TYPES[lang].split(' ').filter(t => !kws.has(t)));
  // 组合正则：注释 | 字符串/字符/模板字符串 | 预处理 | 单词 | 数字
  const strAlt = '"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`';
  const re = lang === 'py'
    ? new RegExp('(#[^\n]*)|(' + strAlt + ')|(^[ \\t]*#[a-z]+)|([A-Za-z_][A-Za-z0-9_]*)|(\\b\\d[\\d\'.]*f?\\b|\\b0x[0-9a-fA-F]+\\b)', 'gm')
    : new RegExp('(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(' + strAlt + ')|(^[ \\t]*#[a-z]+)|([A-Za-z_][A-Za-z0-9_]*)|(\\b\\d[\\d\'.]*f?\\b|\\b0x[0-9a-fA-F]+\\b)', 'gm');
  let out = '', last = 0, m;
  while ((m = re.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    last = re.lastIndex;
    if (m[1]) out += `<span class="tok-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-pre">${esc(m[3])}</span>`;
    else if (m[4]) {
      const w = m[4];
      if (kws.has(w)) out += `<span class="tok-kw">${esc(w)}</span>`;
      else if (types.has(w)) out += `<span class="tok-type">${esc(w)}</span>`;
      else out += esc(w);
    }
    else if (m[5]) out += `<span class="tok-num">${esc(m[5])}</span>`;
  }
  out += esc(code.slice(last));
  return out;
}

/* ================= 视图切换 ================= */
function closeNav() {
  const hd = document.querySelector('header');
  if (hd) hd.classList.remove('nav-open');
  const btn = $('nav-toggle');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function isPhone() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function openSidebar() {
  const docs = $('view-docs');
  if (!docs) return;
  docs.classList.add('sidebar-open');
  const bd = $('sidebar-backdrop');
  if (bd) bd.hidden = false;
}

function closeSidebar() {
  const docs = $('view-docs');
  if (!docs) return;
  docs.classList.remove('sidebar-open');
  const bd = $('sidebar-backdrop');
  if (bd) bd.hidden = true;
}

function showView(view) {
  state.view = view;
  $('view-home').style.display = view === 'home' ? '' : 'none';
  $('view-docs').style.display = view === 'home' ? 'none' : '';
  document.body.classList.toggle('view-cpp20', view === 'cpp20');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view));
  closeNav();
  if (view === 'home') closeSidebar();
  if (view !== 'home') loadDocs(view);
}

document.querySelectorAll('.nav-btn[data-view]').forEach(btn =>
  btn.addEventListener('click', () => showView(btn.dataset.view)));
document.querySelectorAll('.card[data-goto]').forEach(card =>
  card.addEventListener('click', (e) => { e.preventDefault(); showView(card.dataset.goto); }));

const navToggle = $('nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const hd = document.querySelector('header');
    const open = !hd.classList.contains('nav-open');
    hd.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
const sidebarToggle = $('sidebar-toggle');
if (sidebarToggle) sidebarToggle.addEventListener('click', () => {
  if ($('view-docs').classList.contains('sidebar-open')) closeSidebar();
  else openSidebar();
});
const sidebarBackdrop = $('sidebar-backdrop');
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

function apiUrl(name) {
  const script = document.currentScript || document.querySelector('script[src$="app.js"]');
  const base = script && script.src ? script.src.replace(/[^/]+$/, '') : '';
  return base + 'api/' + name + '.json';
}

function featureText(f) {
  return [f.title, f.summary, (f.detail || []).join(' '), f.example || '', f.example2 || '', f.example3 || ''].join(' ');
}

/* ================= 文档加载 ================= */
async function loadDocs(lang) {
  state.lang = lang;
  if (!state.cache[lang]) {
    const all = await fetch(apiUrl(lang)).then(r => r.json());
    state.cache[lang] = all;
    all.forEach(f => { state.cache[f.id] = f; });
  }
  state.list = state.cache[lang];
  renderList();
  $('doc-empty').style.display = '';
  $('doc-body').style.display = 'none';
  const tt = $('toolbar-title');
  if (tt) tt.textContent = '选择一篇开始阅读';
  if (isPhone()) openSidebar();
}

function renderList() {
  const ul = $('feature-list');
  ul.innerHTML = '';
  const grouped = {};
  state.list.forEach(f => (grouped[f.category] ||= []).push(f));
  Object.entries(grouped).forEach(([cat, feats]) => {
    ul.insertAdjacentHTML('beforeend', `<li class="cat-label">${esc(cat)}（${feats.length}）</li>`);
    feats.forEach(f => {
      const li = document.createElement('li');
      li.className = 'feat';
      li.dataset.id = f.id;
      li.innerHTML =
        `<span>${esc(f.title)}</span>` +
        `<span class="feat-ver">${esc(state.lang === 'csharp' ? f.version : f.level)}</span>`;
      li.onclick = () => openFeature(f.id, li);
      ul.appendChild(li);
    });
  });
}

async function openFeature(id, li) {
  document.querySelectorAll('#feature-list li.feat').forEach(el =>
    el.classList.toggle('active', el === li));
  $('doc-content').scrollTop = 0;

  const f = state.cache[id];
  if (!f) return;
  const codeLang = state.lang === 'csharp' || state.lang === 'patterns' || state.lang === 'unity' ? 'cs'
    : state.lang === 'python' || state.lang === 'agent' || state.lang === 'opencv' || state.lang === 'pandas' ? 'py'
    : state.lang === 'js' || state.lang === 'nodejs' ? 'js'
    : state.lang === 'ts' ? 'ts'
    : state.lang === 'rust' ? 'rust'
    : state.lang === 'docker' || state.lang === 'sqlite' || state.lang === 'linux' || state.lang === 'git' || state.lang === 'redis' ? 'py'
    : 'cpp';

  const badgeCls = (v) => 'badge lvl-' + v;
  $('doc-badges').innerHTML =
    `<span class="badge ver">${esc(f.version || f.status)}</span>` +
    `<span class="badge cat">${esc(f.category)}</span>` +
    `<span class="${badgeCls(f.level)}">${esc(f.level)}</span>`;

  $('doc-title').textContent = f.title;
  $('doc-summary').textContent = f.summary;
  const tt = $('toolbar-title');
  if (tt) tt.textContent = f.title;

  let html = '<h3>要点解析</h3><div id="doc-detail">' +
    f.detail.map(p => `<p>${esc(p)}</p>`).join('') + '</div>';

  if (f.notes && f.notes.length) {
    html += '<h3>注意事项</h3><ul class="note-list">' +
      f.notes.map(n => `<li>${esc(n)}</li>`).join('') + '</ul>';
  }

  html += `<h3>示例代码</h3><pre class="code">${highlight(f.example, codeLang)}</pre>`;
  if (f.example2) {
    html += `<h3>${esc(f.example2Title || '进阶示例')}</h3>` +
      `<pre class="code">${highlight(f.example2, codeLang)}</pre>`;
  }
  if (f.example3) {
    html += `<h3>${esc(f.example3Title || '实战进阶示例')}</h3>` +
      `<pre class="code">${highlight(f.example3, codeLang)}</pre>`;
  }
  $('doc-sections').innerHTML = html;

  $('doc-empty').style.display = 'none';
  $('doc-body').style.display = '';
  if (isPhone()) closeSidebar();
}

/* ================= 搜索 ================= */
let searchTimer;
$('doc-search').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = $('doc-search').value.trim();
    if (!q) { state.list = state.cache[state.lang]; renderList(); return; }
    const kw = q.toLowerCase();
    state.list = (state.cache[state.lang] || []).filter(f =>
      featureText(f).toLowerCase().includes(kw));
    renderList();
    $('doc-empty').style.display = '';
    $('doc-body').style.display = 'none';
  }, 300);
});

/* ================= 首页统计 ================= */
(async () => {
  try {
    const meta = await fetch(apiUrl('meta')).then(r => r.json());
$('cs-count').textContent = meta.csharp;
  $('cpp-count').textContent = meta.cpp20;
  $('cpp11-count').textContent = meta.cpp11;
  $('js-count').textContent = meta.js;
  $('ts-count').textContent = meta.ts;
  $('agent-count').textContent = meta.agent;
  $('pattern-count').textContent = meta.patterns;
  $('py-count').textContent = meta.python;
  $('unity-count').textContent = meta.unity;
  $('opencv-count').textContent = meta.opencv;
  $('docker-count').textContent = meta.docker;
  $('sqlite-count').textContent = meta.sqlite;
  $('linux-count').textContent = meta.linux;
  $('rust-count').textContent = meta.rust;
  $('pandas-count').textContent = meta.pandas;
  $('nodejs-count').textContent = meta.nodejs;
  $('git-count').textContent = meta.git;
  $('redis-count').textContent = meta.redis;
  } catch { /* 忽略 */ }
})();

/* 支持 #csharp / #cpp20 直达 */
const HASH_VIEWS = ['csharp', 'patterns', 'python', 'js', 'ts', 'agent', 'cpp11', 'cpp20', 'unity', 'opencv', 'docker', 'sqlite', 'linux', 'rust', 'pandas', 'nodejs', 'git', 'redis'];
{
  const h = location.hash.slice(1);
  if (HASH_VIEWS.includes(h)) showView(h);
}

/* ================= 主题切换 ================= */
const THEME_KEY = 'langdocs-theme';
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = $('theme-toggle');
  if (btn) btn.textContent = t === 'light' ? '深色' : '浅色';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#eaeef5' : '#16171d');
}
(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* 隐私模式忽略 */ }
  applyTheme(saved === 'light' ? 'light' : 'dark');   // 默认深色
})();
$('theme-toggle').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(THEME_KEY, next); } catch { /* 忽略 */ }
  applyTheme(next);
});
