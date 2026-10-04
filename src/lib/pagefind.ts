// Pagefind 仅存在于构建产物（dist/client/pagefind），dev 下导入失败由调用方兜底提示
let pagefindPromise: Promise<any> | null = null;

export function loadPagefind(): Promise<any> {
  pagefindPromise ??= (async () => {
    // 字面量动态导入会被 vite 注入 __VITE_PRELOAD__（内联脚本中未定义 → ReferenceError），
    // 必须运行时构造 URL + new Function 间接导入
    const url = new URL("pagefind/pagefind.js", window.location.origin).href;
    return new Function("u", "return import(u)")(url);
  })();
  return pagefindPromise;
}
