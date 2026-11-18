;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="d5196de3-9ed1-9058-ff33-64e50bd39679")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,103871,8552824,9202366,2603225,5814441,188593,e=>{"use strict";var t=e.i(1552184),n=e.i(4398962),r=e.i(5535468),a=e.i(8312865),o=e.i(652817),i=e.i(8687395),s=e.i(1524656);let l=`(function () {
  const root = document.documentElement;
  let inside = false;
  let floor = 0;
  let actedUntil = 0;
  function follow() {
    const next = Math.min(Math.ceil(scrollY + innerHeight), root.scrollHeight);
    if (!(next > 0) || next === floor) return;
    floor = next;
    root.style.minHeight = next + 'px';
  }
  function settle() {
    if (floor !== 0 && !(inside && performance.now() >= actedUntil)) {
      floor = 0;
      root.style.minHeight = '';
    }
    follow();
  }
  function enter(event) {
    if (event.pointerType === 'touch') return;
    inside = true;
    follow();
  }
  function leave() {
    inside = false;
    settle();
  }
  function acted() {
    actedUntil = performance.now() + 400;
    settle();
  }
  addEventListener('pointerover', enter, true);
  addEventListener('pointermove', enter, { passive: true });
  root.addEventListener('pointerleave', leave);
  addEventListener('scroll', follow, { passive: true });
  addEventListener('resize', follow);
  addEventListener('load', follow);
  addEventListener('click', acted, true);
  addEventListener('keydown', acted, true);
  addEventListener('beforeprint', acted);
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') leave();
  });
  if (typeof ResizeObserver !== 'undefined' && document.body) {
    new ResizeObserver(settle).observe(document.body);
  }
  follow();
})();`,c="--cursor-canvas-viewport-height",u="data-canvas-keyboard-nav",d=`:root{--cursor-canvas-focus-ring-width:1px;--cursor-canvas-focus-ring-offset:2px;--cursor-canvas-focus-ring-radius:4px}*:focus,*:focus-visible{outline:none}:root[${u}] *:focus-visible{outline:var(--cursor-canvas-focus-ring-width) solid var(--cursor-canvas-focus-ring-color,currentColor);outline-offset:var(--cursor-canvas-focus-ring-offset)}:where(a[href],[role="link"]):focus-visible{border-radius:var(--cursor-canvas-focus-ring-radius)}`,p=`(function () {
  const root = document.documentElement;
  const attribute = ${JSON.stringify(u)};
  const arrows = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  const modifiers = new Set(['Alt', 'AltGraph', 'CapsLock', 'Control', 'Meta', 'OS', 'Shift']);
  const nonTextInput = /^(button|checkbox|color|file|image|radio|range|reset|submit)$/;
  let tabHeld = false;
  function isTextField(target) {
    return (
      !!target &&
      (target.isContentEditable ||
        target.tagName === 'TEXTAREA' ||
        (target.tagName === 'INPUT' && !nonTextInput.test(target.type)))
    );
  }
  function setKeyboardNav(on) {
    if (root.hasAttribute(attribute) !== on) root.toggleAttribute(attribute, on);
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') tabHeld = true;
    if (modifiers.has(event.key) || event.isComposing) return;
    const chorded = event.metaKey || event.ctrlKey || event.altKey;
    const navigates =
      event.key === 'Tab' ||
      (arrows.has(event.key) && !event.shiftKey && !isTextField(event.target));
    setKeyboardNav(!chorded && navigates);
  }, true);
  document.addEventListener('keyup', function (event) {
    if (event.key !== 'Tab') return;
    const cameFromHost = !tabHeld;
    tabHeld = false;
    if (cameFromHost && !event.metaKey && !event.ctrlKey && !event.altKey && !event.isComposing) {
      setKeyboardNav(true);
    }
  }, true);
  window.addEventListener('blur', function () {
    tabHeld = false;
  });
  for (const type of ['pointerdown', 'mousedown', 'touchstart']) {
    document.addEventListener(type, function () {
      setKeyboardNav(false);
    }, { capture: true, passive: true });
  }
})();`,f={card:2,stage:4};var m=e.i(4541847),g=e.i(9851997),h=e.i(2284756),v=e.i(2893597),y=e.i(174472);let b=["d3","three"],x={d3:"d3",three:"THREE"},w="sand-canvas-frame-runtimes-request",k="sand-canvas-frame-runtimes";function j(e){return JSON.stringify(e).replaceAll("<","\\u003c")}let E=b.map(e=>[e,RegExp(`(?<![\\w$'"\`])(?<!(?<!\\.\\.)\\.)${x[e].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?![\\w$'"\`])`)]);function T(e){return b.filter(t=>e.includes(t))}let S=g.z.enum(b),L=h.z.object({type:v.z.literal(w),runtimes:y.z.array(S)});function C(){return{type:k,outcome:"failed"}}let _=(0,m.o)("visualization-d3-runtime",async()=>(await e.A(4553075)).VISUALIZATION_D3_RUNTIME_JS),$=(0,m.o)("visualization-three-runtime",async()=>(await e.A(9401182)).VISUALIZATION_THREE_RUNTIME_JS),I={d3:()=>_.load(),three:()=>$.load()};async function N(e){return Object.fromEntries(await Promise.all(T(e).map(async e=>[e,await I[e]()])))}let P="allow-scripts allow-pointer-lock",M=String.fromCodePoint(39),A=e=>`${M}${e}${M}`,R=A("none"),O=A("unsafe-inline");[["default-src",R],["script-src",O,"blob:"],["sandbox",P],["style-src",O],["img-src","data:","blob:"],["font-src","data:"],["connect-src",R],["worker-src",R],["child-src",R],["frame-src",R],["object-src",R],["base-uri",R],["form-action",R]].map(e=>e.join(" ")).join("; "),["accelerometer","camera","geolocation","gyroscope","magnetometer","microphone","payment","usb","clipboard-read","clipboard-write"].map(e=>`${e}=()`).join(", ");let z="__grokBotPageRetitlePort",U=h.z.object({type:v.z.literal("grok-bot-page:ready")});var B=e.i(3499852),D=e.i(5233334);let F="cursor-canvas-frame-close-request",H="cursor-canvas-frame-scroll",K=h.z.object({type:v.z.literal(F)}),q=h.z.object({type:v.z.literal(H),scrolled:B.z.boolean()}),J=`<script>
(function () {
  var scrolled = false;
  function report() {
    var next = scrollY > 0;
    if (next === scrolled) return;
    scrolled = next;
    try {
      parent.postMessage({ type: '${H}', scrolled: scrolled }, '*');
    } catch (e) {}
  }
  addEventListener('scroll', report, { passive: true });
  addEventListener('resize', report);
  report();
})();
</script>`,V=`<script>
addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  try {
    parent.postMessage({ type: '${F}' }, '*');
  } catch {}
}, true);
</script>`,W="cursor-canvas-open-link",G=h.z.object({type:v.z.literal(W),href:D.z.string()}),Q=`<script>
(function () {
  function openInParent(raw) {
    var href = String(raw == null ? '' : raw).trim();
    try {
      href = new URL(href).href;
    } catch {
      return;
    }
    if (href.indexOf('http:') !== 0 && href.indexOf('https:') !== 0) return;
    try {
      parent.postMessage({ type: '${W}', href: href }, '*');
    } catch {}
  }
  window.open = function (url) {
    openInParent(url);
    return null;
  };
  function onActivate(event) {
    if (event.defaultPrevented) return;
    if (event.type === 'click' && event.button !== 0) return;
    if (event.type === 'auxclick' && event.button !== 1) return;
    var target = event.target;
    var anchor = target && target.closest ? target.closest('a[href], area[href], a[*|href]') : null;
    if (!anchor) return;
    var href = anchor.getAttribute('href') || anchor.getAttribute('xlink:href') || '';
    if (href.trim().charAt(0) === '#') return;
    event.preventDefault();
    openInParent(href);
  }
  document.addEventListener('click', onActivate, true);
  document.addEventListener('auxclick', onActivate, true);
})();
</script>`,Y="cursor-canvas-frame-retitle",X=`<script>${l}</script>`,Z=`<script>${p}</script>`,ee={"<":String.raw`\u003c`,">":String.raw`\u003e`,"&":String.raw`\u0026`,"\u2028":String.raw`\u2028`,"\u2029":String.raw`\u2029`};function et(e){return e.replace(/[<>&\u2028\u2029]/g,e=>ee[e]??e)}function en(e){return et(JSON.stringify(e))}let er=`<script type="module">
const moduleUrl = (source) => URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
async function mount() {
  if (window.__sandCanvasBeforeMount) await window.__sandCanvasBeforeMount;
  const bundle = window.__sandCanvasBundle;
  if (!bundle) return;
  const runtimeUrl = moduleUrl(bundle.runtimeEsm);
  try {
    const runtimeModule = await import(runtimeUrl);
    const userUrl = moduleUrl(bundle.userModule);
    try {
      await runtimeModule.mountCanvas(userUrl);
    } finally {
      URL.revokeObjectURL(userUrl);
    }
  } finally {
    URL.revokeObjectURL(runtimeUrl);
  }
}
mount().catch(window.__sandCanvasShowError);
</script>`;var ea=e.i(603814),eo=e.i(245799),ei=e.i(1122946);function es(e,t){return e.getPropertyValue(t).trim()}let el=new Map;function ec(e){let r,a=(0,n.c)(8),{page:o,title:i,opensLinks:s,onCloseRequest:l,onScrollEdge:c}=e,u=void 0!==s&&s,{resolvedTheme:d}=(0,eo.useTheme)(),p="dark"===d?"dark":"light",f=`${p}:${u?"stage":"card"}:${o.contentKey}`;return a[0]!==l||a[1]!==c||a[2]!==u||a[3]!==o||a[4]!==f||a[5]!==p||a[6]!==i?(r=(0,t.jsx)(eu,{page:o,theme:p,title:i,opensLinks:u,onCloseRequest:l,onScrollEdge:c},f),a[0]=l,a[1]=c,a[2]=u,a[3]=o,a[4]=f,a[5]=p,a[6]=i,a[7]=r):r=a[7],r}function eu(e){let r,a,o,i,s,l,u,p,m,g,h,v=(0,n.c)(29),{page:y,theme:b,title:x,opensLinks:E,onCloseRequest:S,onScrollEdge:_}=e,$=(0,ei.useRef)(null),I=(0,ei.useRef)(null),M=(0,ei.useRef)(x);v[0]!==E||v[1]!==y||v[2]!==b||v[3]!==x?(r=()=>{var e,t,n,r;let a,o,i,s;return s=(t=(e={page:y,title:x,theme:b,frame:$.current??document.body,opensLinks:E}).page,n=e.title,void 0===(a=el.get(t.contentKey))||a===n?void 0:{title:n,previousTitle:a}),function(e){var t,n,r,a,o,i,s,l,u;let p,m,g,h,v,y,b,x,{colors:E}=e,S=(n={kind:(t={theme:e.theme,colors:E,...void 0===e.brand?{}:{brand:e.brand}}).theme,...void 0===t.brand?{}:{brand:t.brand},primary:t.colors.primary,editorBackground:t.colors.background,editorForeground:t.colors.foreground},g=[`kind:${en(n.kind)}`],void 0!==n.brand&&g.push(`brand:${en(n.brand)}`),g.push(`primary:${en(n.primary)}`,`editorBackground:${en(n.editorBackground)}`,`editorForeground:${en(n.editorForeground)}`),`{${g.join(",")}}`);return h=void 0===(a={colors:E,theme:e.theme,head:"<title>Page</title>",body:`<div id="root"><div id="status">Loading page</div></div>
${s=e.runtimes,l=e.room??"card",void 0===s||0===s.length?"":`<script>${u=f[l],`(function () {
  const apply = Reflect.apply;
  const descriptor = Object.getOwnPropertyDescriptor;
  const none = [];
  const replace = (holder, name, value) => Object.defineProperty(holder, name, { __proto__: null, value: value });
  const nested = "iframe, frame, object, embed, fencedframe, portal";

  const hasFocus = document.hasFocus;
  const activation = navigator.userActivation ?? null;
  const isActive = activation !== null ? descriptor(Object.getPrototypeOf(activation), "isActive")?.get ?? null : null;
  const activeElement = descriptor(Document.prototype, "activeElement").get;
  const matches = Element.prototype.matches;
  const ownFocus = () => {
    if (!apply(hasFocus, document, none)) return false;
    const active = apply(activeElement, document, none);
    return active === null || !apply(matches, active, [nested]);
  };
  const focusAllowed = () => (isActive !== null && apply(isActive, activation, none)) || ownFocus();
  const mathmlProto = typeof MathMLElement === "function" ? MathMLElement.prototype : null;
  for (const [holder, name] of [
    [HTMLElement.prototype, "focus"], [SVGElement.prototype, "focus"], [mathmlProto, "focus"], [window, "focus"],
    [HTMLInputElement.prototype, "select"], [HTMLTextAreaElement.prototype, "select"],
    [HTMLDialogElement.prototype, "show"], [HTMLDialogElement.prototype, "showModal"],
    [HTMLElement.prototype, "showPopover"], [HTMLElement.prototype, "togglePopover"],
    [HTMLFormElement.prototype, "requestSubmit"], [HTMLFormElement.prototype, "reportValidity"],
    [HTMLInputElement.prototype, "reportValidity"], [HTMLSelectElement.prototype, "reportValidity"],
    [HTMLTextAreaElement.prototype, "reportValidity"], [HTMLButtonElement.prototype, "reportValidity"],
  ]) {
    if (!holder || typeof holder[name] !== "function") continue;
    const original = holder[name];
    replace(holder, name, function () {
      return focusAllowed() ? apply(original, this, arguments) : undefined;
    });
  }

  const composedPathOf = Event.prototype.composedPath;
  const nodeTypeOf = descriptor(Node.prototype, "nodeType").get;
  const preventDefault = Event.prototype.preventDefault;
  const listen = EventTarget.prototype.addEventListener;
  const gateScriptedClick = (event) => {
    if (event.isTrusted || focusAllowed()) return;
    const path = apply(composedPathOf, event, none);
    for (let index = 0; index < path.length; index += 1) {
      const node = path[index];
      if (node === window || apply(nodeTypeOf, node, none) !== 1) continue;
      if (apply(matches, node, ["label, [popovertarget], [commandfor]"])) {
        apply(preventDefault, event, none);
        return;
      }
    }
  };
  apply(listen, window, ["click", gateScriptedClick, true]);

  const webglTypes = { __proto__: null, webgl: true, webgl2: true, "experimental-webgl": true };
  const webglCanvases = new WeakSet();
  const holdsWebgl = WeakSet.prototype.has;
  const markWebgl = WeakSet.prototype.add;
  let webglContexts = 0;
  const withoutRedundantAntialias = (attributes) =>
    window.devicePixelRatio >= 2 ? { __proto__: attributes ?? null, antialias: false } : attributes;
  const canvases = typeof OffscreenCanvas === "function" ? [HTMLCanvasElement, OffscreenCanvas] : [HTMLCanvasElement];
  for (const canvas of canvases) {
    const getContext = canvas.prototype.getContext;
    if (typeof getContext !== "function") continue;
    replace(canvas.prototype, "getContext", function (type, attributes) {
      const kind = "" + type;
      if (webglTypes[kind] !== true || apply(holdsWebgl, webglCanvases, [this])) {
        return apply(getContext, this, [kind, attributes]);
      }
      if (webglContexts >= ${u}) {
        return null;
      }
      const context = apply(getContext, this, [kind, withoutRedundantAntialias(attributes)]);
      if (context !== null) {
        apply(markWebgl, webglCanvases, [this]);
        webglContexts += 1;
      }
      return context;
    });
  }

  delete window.RTCPeerConnection;
  delete window.webkitRTCPeerConnection;

  const Observer = MutationObserver;
  const observe = MutationObserver.prototype.observe;
  const lengthOf = descriptor(NodeList.prototype, "length").get;
  const itemOf = NodeList.prototype.item;
  const removeNode = Element.prototype.remove;
  const everyInsertion = { __proto__: null, childList: true, subtree: true };
  const guardRoot = (root, query) => {
    const sweep = () => {
      const found = apply(query, root, [nested]);
      for (let index = apply(lengthOf, found, none) - 1; index >= 0; index -= 1) {
        apply(removeNode, apply(itemOf, found, [index]), none);
      }
    };
    sweep();
    apply(observe, new Observer(sweep), [root, everyInsertion]);
  };
  guardRoot(document, Document.prototype.querySelectorAll);
  const queryFragment = DocumentFragment.prototype.querySelectorAll;
  const attachShadow = Element.prototype.attachShadow;
  replace(Element.prototype, "attachShadow", function () {
    const root = apply(attachShadow, this, arguments);
    guardRoot(root, queryFragment);
    apply(listen, root, ["click", gateScriptedClick, true]);
    return root;
  });

  for (const holder of [Element.prototype, ShadowRoot.prototype]) {
    const setInnerHTML = descriptor(holder, "innerHTML")?.set;
    if (setInnerHTML && typeof holder.setHTMLUnsafe === "function") {
      replace(holder, "setHTMLUnsafe", function (html) {
        apply(setInnerHTML, this, [html]);
      });
    }
  }
  const Parser = DOMParser;
  const parseFromString = DOMParser.prototype.parseFromString;
  if (typeof Document.parseHTMLUnsafe === "function") {
    replace(Document, "parseHTMLUnsafe", (html) => apply(parseFromString, new Parser(), [html, "text/html"]));
  }
})();`}</script>
<script>${p=T(s),m=`{ type: ${j(w)}, runtimes: runtimes }`,`(function () {
  const host = window.parent;
  const runtimes = ${j(p)};
  window.__sandCanvasBeforeMount = new Promise((resolve) => {
    let timer = 0;
    const finish = () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      resolve();
    };
    const run = (source) => new Promise((settle) => {
      const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      const script = document.createElement("script");
      const done = () => {
        URL.revokeObjectURL(url);
        settle();
      };
      script.addEventListener("load", done);
      script.addEventListener("error", done);
      script.src = url;
      document.head.append(script);
    });
    const onMessage = (event) => {
      const data = event.data;
      if (event.source !== host || data === null || typeof data !== "object" || data.type !== ${j(k)}) return;
      window.removeEventListener("message", onMessage);
      const sources = data.outcome === "loaded" && data.sources !== null && typeof data.sources === "object" ? data.sources : null;
      if (sources === null || !runtimes.every((name) => typeof sources[name] === "string")) {
        finish();
        return;
      }
      clearTimeout(timer);
      runtimes.reduce((previous, name) => previous.then(() => run(sources[name])), Promise.resolve()).then(finish, finish);
    };
    window.addEventListener("message", onMessage);
    timer = setTimeout(finish, 15000);
    host.postMessage(${m}, "*");
  });
})();`}</script>
`}<script>
window.__sandCanvasShowError = function () {
  const root = document.getElementById('root');
  if (root) root.innerHTML = '<div id="status">Page failed to load</div>';
};
try {
  const dataJson = JSON.parse(${en(e.dataJsonText)});
  window.__cursorCanvas = {
    tokenParam: '',
    state: new Map([['theme', ${S}]]),
    data: new Map(Object.entries(dataJson)),
    reportError: window.__sandCanvasShowError,
  };
  window.__sandCanvasBundle = ${et(e.bundleJsonText)};
} catch {
  window.__sandCanvasShowError();
}
</script>
${r=e.retitle,`<script>
(function () {
  var port = window.${z};
  delete window.${z};
  var wanted = ${void 0===r?"null":et(JSON.stringify(r))};
  var original = wanted ? wanted.previousTitle : null;
  var matched = null;
  var observer = null;
  function heading() {
    var marked = document.querySelector('h1[data-canvas-page-title]');
    if (marked) return marked;
    if (matched && matched.isConnected) return matched;
    var primary = matched ? wanted.previousTitle : original;
    var fallback = matched ? original : wanted.previousTitle;
    var all = document.querySelectorAll('h1');
    for (var i = 0; i < all.length; i++) {
      if (all[i].textContent === primary) {
        matched = all[i];
        return matched;
      }
    }
    if (fallback !== primary) {
      for (var j = 0; j < all.length; j++) {
        if (all[j].textContent === fallback) {
          matched = all[j];
          return matched;
        }
      }
    }
    return null;
  }
  function stop() {
    if (observer) observer.disconnect();
    observer = null;
  }
  function settle() {
    var target = heading();
    if (target) {
      var text = target.firstChild;
      if (target.textContent !== wanted.title) {
        if (text && text.nodeType === 3 && !text.nextSibling) text.nodeValue = wanted.title;
        else target.textContent = wanted.title;
      }
      stop();
      return;
    }
    if (!document.querySelector('#root > #status')) {
      stop();
      return;
    }
    if (observer) return;
    observer = new MutationObserver(settle);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (port) {
    port.onmessage = function (event) {
      var data = event.data;
      if (!data || data.type !== '${Y}') return;
      if (typeof data.title !== 'string' || typeof data.previousTitle !== 'string') return;
      if (original === null) original = data.previousTitle;
      wanted = { title: data.title, previousTitle: data.previousTitle };
      settle();
    };
  }
  if (wanted) settle();
})();
</script>`}
${er}`}).theme?"":(o=a.theme,`html{color-scheme:${o}}`),`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${a.head}<style>${h}${i=a.colors,v="32px",y="16px",b="calc(100vh - 48px)",x=i.scrollbar??i.status,`*{margin:0;padding:0;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:${x} transparent}
html{height:100%;scrollbar-gutter:stable}
html:fullscreen,html:has(:fullscreen){scrollbar-gutter:auto}
html,body{width:100%;min-height:100%;background:${i.background};-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{padding:24px ${v};color:${i.foreground};font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;font-size:13px;line-height:1.385;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
#root{position:relative;width:100%;max-width:calc(100vw - 2*${v});margin-inline:auto;min-height:${b};overflow-x:auto}
${function({viewportHeight:e}){return`#root{${c}:${e}}#root>:only-child:is([style^="height:100%;"],[style^="height: 100%;"],[style*=";height:100%;"],[style*="; height: 100%;"]){min-height:var(${c})!important}`}({viewportHeight:b})}
::-webkit-scrollbar{width:8px;height:8px;background:transparent}
::-webkit-scrollbar-track,::-webkit-scrollbar-corner{background:transparent}
::-webkit-scrollbar-thumb{background:${x};border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${i.foreground}}
body>#root>#status{display:flex;align-items:center;justify-content:center;min-height:${b};color:${i.status};font:13px system-ui}
${function({inlinePadding:e,extraRules:t=""}={}){let n="calc(100vh - 32px)";return`@media (max-width: 479.98px){body{padding:${void 0===e?"16px":`16px ${e}`}}#root{min-height:${n};${c}:${n}}#root{overflow-x:hidden;overflow-x:clip}${t}}`}({inlinePadding:y,extraRules:`#root{max-width:calc(100vw - 2*${y})}body>#root>#status{min-height:calc(100vh - 32px)}`})}
${d}`}</style></head><body>${a.body}
${V}
${Q}
${J}
${X}
${Z}</body></html>`}({bundleJsonText:e.page.bundleJsonText,dataJsonText:e.page.dataJsonText,theme:e.theme,colors:{background:(r=es(o=getComputedStyle(e.frame),"--surface-base"),(i=document.createElement("canvas").getContext("2d"))?(i.fillStyle=r,i.fillStyle):r),foreground:es(o,"--fg-primary"),primary:es(o,"--button-filled"),status:es(o,"--fg-tertiary"),scrollbar:es(o,"--border-l3")},brand:"grok",room:e.opensLinks?"stage":"card",...void 0===e.page.runtimes?{}:{runtimes:e.page.runtimes},...void 0===s?{}:{retitle:s}})},v[0]=E,v[1]=y,v[2]=b,v[3]=x,v[4]=r):r=v[4];let A=(0,ei.useEffectEvent)(r);v[5]!==y.runtimes?(a=async(e,t,n)=>{let r=y.runtimes??[];if(0===e.length||!e.every(e=>r.includes(e)))return void t.postMessage(C(),"*");try{let r=await N(e);if(n())return;t.postMessage({type:k,outcome:"loaded",sources:r},"*")}catch(e){if((0,ea.W)("BotPageFrame:loadRuntimes",e),n())return;t.postMessage(C(),"*")}},v[5]=y.runtimes,v[6]=a):a=v[6];let R=(0,ei.useEffectEvent)(a);v[7]!==S?(o=()=>S?.(),v[7]=S,v[8]=o):o=v[8];let O=(0,ei.useEffectEvent)(o);v[9]!==E?(i=e=>{E&&document.activeElement===$.current&&navigator.userActivation?.isActive===!0&&window.open(e,"_blank","noopener,noreferrer")},v[9]=E,v[10]=i):i=v[10];let B=(0,ei.useEffectEvent)(i);v[11]!==_?(s=e=>_?.(e),v[11]=_,v[12]=s):s=v[12];let D=(0,ei.useEffectEvent)(s);return v[13]!==R||v[14]!==A||v[15]!==B||v[16]!==D||v[17]!==O?(l=()=>{let e=$.current?.contentWindow;if(!e)return;let t=!1,n=!1,r=!1,a=a=>{var o,i,s,l;let c;if(a.source!==e)return;let u=(o=a.data,(c=L.safeParse(o)).success?{runtimes:T(c.data.runtimes)}:null);if(null!==u){if(n)return;n=!0,R(u.runtimes,e,()=>r).catch(ed);return}if(i=a.data,K.safeParse(i).success)return void O();let d=function(e){let t=G.safeParse(e);if(!t.success||!URL.canParse(t.data.href))return null;let n=new URL(t.data.href);return"http:"===n.protocol||"https:"===n.protocol?n.href:null}(a.data);if(null!==d)return void B(d);if(s=a.data,q.safeParse(s).success)return void D(a.data.scrolled);if(t||(l=a.data,!U.safeParse(l).success))return;t=!0;let p=new MessageChannel;I.current=p.port1,e.postMessage({type:"grok-bot-page:render",document:A()},"*",[p.port2])};return window.addEventListener("message",a),e.postMessage({type:"grok-bot-page:probe"},"*"),()=>{r=!0,I.current?.close(),I.current=null,window.removeEventListener("message",a),D(!1)}},v[13]=R,v[14]=A,v[15]=B,v[16]=D,v[17]=O,v[18]=l):l=v[18],v[19]===Symbol.for("react.memo_cache_sentinel")?(u=[],v[19]=u):u=v[19],(0,ei.useEffect)(l,u),v[20]!==y.contentKey||v[21]!==x?(p=()=>{let e=M.current;e!==x&&(M.current=x,el.has(y.contentKey)||el.set(y.contentKey,e),I.current?.postMessage({type:Y,title:x,previousTitle:e}))},m=[x,y.contentKey],v[20]=y.contentKey,v[21]=x,v[22]=p,v[23]=m):(p=v[22],m=v[23]),(0,ei.useEffect)(p,m),v[24]!==b?(g={colorScheme:b},v[24]=b,v[25]=g):g=v[25],v[26]!==g||v[27]!==x?(h=(0,t.jsx)("iframe",{ref:$,title:x,src:"/bot-page",sandbox:P,referrerPolicy:"no-referrer",className:"block size-full border-0",style:g}),v[26]=g,v[27]=x,v[28]=h):h=v[28],h}function ed(e){(0,ea.W)("BotPageFrame:answerRuntimes",e)}e.s(["f",0,ec],8552824);var ep=e.i(2136015),ef=e.i(9333196);e.i(7866742);var em=e.i(8103987),eg=e.i(919432);e.i(3778443);var eh=e.i(8679187),ev=e.i(238963);e.i(9337504);var ey=e.i(2910017);function eb(e){return e.replace(/\s+/g," ").trim().slice(0,200).trimEnd()}var ex=e.i(7671246);function ew(e){let r,a,o,i,s,l,c,u=(0,n.c)(12),{size:d}=e,p=void 0===d?"md":d,f="md"===p?"size-10":"size-6";u[0]!==f?(r=(0,ex.c)("inline-flex shrink-0 items-center justify-center",f),u[0]=f,u[1]=r):r=u[1];let m="sm"===p&&"scale-[0.6]";return u[2]!==m?(a=(0,ex.c)("flex h-10 w-8 shrink-0 flex-col overflow-hidden rounded-md bg-surface-elevated shadow-[0_2px_6px_rgb(0_0_0/0.06)] ring-[0.5px] ring-fg-primary/12",m),u[2]=m,u[3]=a):a=u[3],u[4]===Symbol.for("react.memo_cache_sentinel")?(o=(0,t.jsx)("span",{className:"h-1 shrink-0 rounded-xs bg-fg-primary/18"}),i=(0,t.jsx)("span",{className:"h-1 w-[calc(50%_-_1px)] shrink-0 rounded-xs bg-fg-primary/18"}),u[4]=o,u[5]=i):(o=u[4],i=u[5]),u[6]===Symbol.for("react.memo_cache_sentinel")?(s=(0,t.jsxs)("span",{className:"flex min-h-0 grow flex-col gap-0.75 p-1",children:[o,i,(0,t.jsxs)("span",{className:"flex grow items-end justify-between",children:[(0,t.jsx)("span",{className:"h-2 w-1 rounded-xs bg-fg-success"}),(0,t.jsx)("span",{className:"h-2 w-1 rounded-xs bg-fg-warning"}),(0,t.jsx)("span",{className:"h-3 w-1 rounded-xs bg-fg-orange"}),(0,t.jsx)("span",{className:"h-4.5 w-1 rounded-xs bg-fg-accent"})]})]}),u[6]=s):s=u[6],u[7]!==a?(l=(0,t.jsx)("span",{className:a,children:s}),u[7]=a,u[8]=l):l=u[8],u[9]!==r||u[10]!==l?(c=(0,t.jsx)("span",{"aria-hidden":!0,className:r,children:l}),u[9]=r,u[10]=l,u[11]=c):c=u[11],c}e.s(["f",0,ew],9202366);var ek=e.i(1295507),ej=e.i(4292823);function eE(e){let r,a,o,i,l,c,u,d,p,f=(0,n.c)(66),{locator:m,title:g,canRename:h,look:v}=e,{t:y}=(0,ey.f)("bots"),b=(0,s.P)();f[0]!==m||f[1]!==g?(r={locator:m,title:g},f[0]=m,f[1]=g,f[2]=r):r=f[2];let{displayTitle:x,rename:w}=function(e){let t,r,a,o,i,s,l,c,u,d,p,f,m=(0,n.c)(37),{locator:g,title:h}=e,{t:v}=(0,ey.f)("bots"),y=(0,ev.d)(),b=(0,ef.s)();if(m[0]!==g)t=`${g.storeId}:${g.canvasId}`,m[0]=g,m[1]=t;else t=m[1];let x=t;m[2]!==g.canvasId||m[3]!==g.storeId?(r=em.f.pages(g.storeId,g.canvasId),m[2]=g.canvasId,m[3]=g.storeId,m[4]=r):r=m[4];let w=r,[k,j]=(0,ei.useState)(null);m[5]===Symbol.for("react.memo_cache_sentinel")?(a=new Map,m[5]=a):a=m[5];let E=(0,ei.useRef)(a);null!==k&&(k.key!==x||k.settled&&h!==k.baseTitle)&&j(null),m[6]!==y?(o=(e,t)=>{let n=E.current.get(e);if(void 0!==n)return n;let r={attempt:0,inFlight:0,confirmedTitle:null,confirmedAttempt:0,baseline:y.getQueriesData({queryKey:t})};return E.current.set(e,r),r},m[6]=y,m[7]=o):o=m[7];let T=o;m[8]!==y?(i=(e,t)=>y.setQueriesData({queryKey:em.f.pages(e.storeId,e.canvasId)},e=>e?.status==="ready"?{...e,title:t}:e),m[8]=y,m[9]=i):i=m[9];let S=i,L=null!==k&&k.key===x&&h===k.baseTitle?k.next:h;m[10]!==y?(s=async e=>{let{locator:t,next:n}=e;return await y.cancelQueries({queryKey:em.f.pages(t.storeId,t.canvasId)}),eg.f.renameCanvas({...t,title:n})},m[10]=y,m[11]=s):s=m[11],m[12]!==S?(l=(e,t)=>{let{locator:n,pageKey:r,attempt:a}=t,o=E.current.get(r);o&&(a>=o.confirmedAttempt&&(o.confirmedAttempt=a,o.confirmedTitle=e.title),a===o.attempt&&(S(n,e.title),j(t=>null!==t&&t.key===r&&t.attempt===a?{...t,next:e.title,settled:!0}:t)))},m[12]=S,m[13]=l):l=m[13],m[14]!==b||m[15]!==y||m[16]!==S||m[17]!==v?(c=(e,t)=>{let{locator:n,pageKey:r,attempt:a}=t;b("BotPageRename:renameCanvas",e,v("page-rename.failed","Couldn't rename this page. Try again."));let o=E.current.get(r);if(o&&a===o.attempt){if(j(e=>null!==e&&e.key===r&&e.attempt===a?null:e),null!==o.confirmedTitle)return void S(n,o.confirmedTitle);for(let[e,t]of o.baseline)y.setQueryData(e,t)}},m[14]=b,m[15]=y,m[16]=S,m[17]=v,m[18]=c):c=m[18],m[19]===Symbol.for("react.memo_cache_sentinel")?(u=(e,t,n)=>{let{pageKey:r}=n,a=E.current.get(r);a&&(a.inFlight=Math.max(0,a.inFlight-1))},m[19]=u):u=m[19],m[20]!==s||m[21]!==l||m[22]!==c?(d={mutationFn:s,onSuccess:l,onError:c,onSettled:u},m[20]=s,m[21]=l,m[22]=c,m[23]=d):d=m[23];let{mutate:C}=(0,eh.f)(d);return m[24]!==L||m[25]!==g||m[26]!==C||m[27]!==x||m[28]!==w||m[29]!==y||m[30]!==S||m[31]!==T||m[32]!==h?(p=e=>{let t=eb(e);if(""===t||t===eb(L))return;let n=T(x,w);0===n.inFlight&&(n.confirmedTitle=null,n.confirmedAttempt=0,n.baseline=y.getQueriesData({queryKey:w})),n.inFlight=n.inFlight+1;let r=n.attempt+1;n.attempt=r,j({key:x,baseTitle:h,next:t,attempt:r,settled:!1}),y.cancelQueries({queryKey:w}),S(g,t),C({locator:g,pageKey:x,next:t,attempt:r})},m[24]=L,m[25]=g,m[26]=C,m[27]=x,m[28]=w,m[29]=y,m[30]=S,m[31]=T,m[32]=h,m[33]=p):p=m[33],m[34]!==L||m[35]!==p?(f={displayTitle:L,rename:p},m[34]=L,m[35]=p,m[36]=f):f=m[36],f}(r),[k,j]=(0,ei.useState)(null),E=(0,ei.useRef)(!1),T=(0,ei.useRef)(!1),S=(0,ei.useRef)(!1),L=(0,ei.useRef)(null),C=(0,ei.useRef)(null),_=(0,ei.useId)(),$="pill"===(void 0===v?"dialog":v),I=h&&null!==k,N=$?"text-sm font-medium text-fg-primary":"text-base font-semibold leading-6 tracking-tight text-fg-primary";if(f[3]!==k?(a=()=>{null===k&&S.current&&(S.current=!1,L.current?.focus({preventScroll:!0}))},o=[k],f[3]=k,f[4]=a,f[5]=o):(a=f[4],o=f[5]),(0,ei.useLayoutEffect)(a,o),$){let e,n;return f[6]===Symbol.for("react.memo_cache_sentinel")?(e=(0,t.jsx)(ew,{size:"sm"}),f[6]=e):e=f[6],f[7]!==h||f[8]!==b.bots.PageTitlePill||f[9]!==x||f[10]!==w?(n=(0,t.jsx)(b.bots.PageTitlePill,{canRename:h,glyph:e,maxLength:200,onRename:w,title:x}),f[7]=h,f[8]=b.bots.PageTitlePill,f[9]=x,f[10]=w,f[11]=n):n=f[11],n}f[12]!==x?(i=()=>{E.current=!1,T.current=!1,j(x)},f[12]=x,f[13]=i):i=f[13];let P=i;f[14]!==w?(l=e=>{if(T.current)return;T.current=!0;let t=E.current;E.current=!1,j(null),t||w(e)},f[14]=w,f[15]=l):l=f[15];let M=l;f[16]!==M?(c=e=>{e.nativeEvent.isComposing||("Enter"===e.key||"Escape"===e.key)&&(e.preventDefault(),e.stopPropagation(),E.current="Escape"===e.key,S.current=!0,M(e.currentTarget.value))},f[16]=M,f[17]=c):c=f[17];let A=c;f[18]!==$?(u=$?(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex shrink-0 text-fg-secondary",children:(0,t.jsx)(ek.f,{size:4})}):(0,t.jsx)(ew,{size:"sm"}),f[18]=$,f[19]=u):u=f[19];let R=u;if($){let e,n,r,a,o,i=I||void 0;f[20]!==I?(e=e=>{I&&e.target!==C.current&&(e.preventDefault(),C.current?.focus({preventScroll:!0}))},f[20]=I,f[21]=e):e=f[21],f[22]!==h||f[23]!==I||f[24]!==P?(n=e=>{!h||I||e.target instanceof Element&&e.target.closest("button")||P()},f[22]=h,f[23]=I,f[24]=P,f[25]=n):n=f[25];let s=h&&"cursor-text";return f[26]!==s?(r=(0,ex.c)("group/pill inline-flex h-[38px] max-w-[min(420px,46vw)] min-w-0 items-center gap-1.5 rounded-full border border-border-l2 bg-surface-base px-3",s),f[26]=s,f[27]=r):r=f[27],f[28]!==h||f[29]!==x||f[30]!==k||f[31]!==M||f[32]!==_||f[33]!==I||f[34]!==A||f[35]!==P||f[36]!==y||f[37]!==N?(a=h?(0,t.jsxs)("span",{className:(0,ex.c)("-mx-1.5 inline-flex h-7 min-w-0 items-center rounded-lg px-1.5 transition-colors duration-140 ease-[ease]",I?"bg-button-secondary-fill-hover":"group-hover/pill:bg-button-secondary-fill-hover has-focus-visible:ring-2 has-focus-visible:ring-fg-accent"),children:[I?(0,t.jsx)("input",{ref:C,type:"text","aria-label":y("page-title.input.aria-label","Page title"),placeholder:y("page-title.input.placeholder","Untitled page"),autoFocus:!0,maxLength:200,spellCheck:!1,value:k,onChange:e=>j(e.currentTarget.value),onFocus:eS,onBlur:e=>M(e.currentTarget.value),onKeyDown:A,className:(0,ex.c)("field-sizing-content max-w-full min-w-6 bg-transparent p-0 outline-none placeholder:text-fg-tertiary",N)}):(0,t.jsxs)("button",{type:"button",ref:L,"aria-describedby":_,title:x,onClick:P,className:"flex min-w-0 cursor-text items-center bg-transparent p-0 outline-hidden",children:[(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",N),children:x}),(0,t.jsx)("span",{hidden:!0,id:_,children:y("page-title.rename-btn.description","Rename page")})]}),(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex max-w-0 shrink-0 overflow-hidden text-fg-secondary opacity-0 transition-[max-width,opacity,margin-inline-start] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/pill:ms-2 group-hover/pill:max-w-3 group-hover/pill:opacity-100 group-has-focus-visible/pill:ms-2 group-has-focus-visible/pill:max-w-3 group-has-focus-visible/pill:opacity-100 group-data-[editing]/pill:ms-2 group-data-[editing]/pill:max-w-3 group-data-[editing]/pill:opacity-100 pointer-coarse:ms-2 pointer-coarse:max-w-3 pointer-coarse:opacity-100",children:(0,t.jsx)(ej.f,{size:3})})]}):(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",N),children:x}),f[28]=h,f[29]=x,f[30]=k,f[31]=M,f[32]=_,f[33]=I,f[34]=A,f[35]=P,f[36]=y,f[37]=N,f[38]=a):a=f[38],f[39]!==R||f[40]!==e||f[41]!==n||f[42]!==r||f[43]!==a||f[44]!==i?(o=(0,t.jsxs)("span",{"data-testid":"bot-page-title-chip","data-editing":i,onMouseDown:e,onClick:n,className:r,children:[R,a]}),f[39]=R,f[40]=e,f[41]=n,f[42]=r,f[43]=a,f[44]=i,f[45]=o):o=f[45],o}if(!h){let e,n,r;return f[46]!==N?(e=(0,ex.c)("min-w-0 truncate",N),f[46]=N,f[47]=e):e=f[47],f[48]!==x||f[49]!==e?(n=(0,t.jsx)("span",{className:e,children:x}),f[48]=x,f[49]=e,f[50]=n):n=f[50],f[51]!==R||f[52]!==n?(r=(0,t.jsxs)("span",{"aria-hidden":!0,className:"flex h-6 min-w-0 flex-1 items-center gap-2",children:[R,n]}),f[51]=R,f[52]=n,f[53]=r):r=f[53],r}return f[54]!==x||f[55]!==k||f[56]!==M||f[57]!==_||f[58]!==A||f[59]!==P||f[60]!==y||f[61]!==N?(d=null===k?(0,t.jsxs)("button",{type:"button",ref:L,"aria-describedby":_,title:x,onClick:P,className:(0,ex.c)("group/title -mx-1.5 flex h-8 min-w-0 cursor-text items-center gap-1.5 rounded-lg px-1.5 outline-hidden","transition-colors duration-140 ease-[ease] hover:bg-button-secondary-fill-hover","focus-visible:ring-1",ep.F),children:[(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",N),children:x}),(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex shrink-0 text-fg-secondary opacity-0 transition-opacity duration-140 group-hover/title:opacity-100 group-focus-visible/title:opacity-100 pointer-coarse:opacity-100",children:(0,t.jsx)(ej.f,{size:3})}),(0,t.jsx)("span",{hidden:!0,id:_,children:y("page-title.rename-btn.description","Rename page")})]}):(0,t.jsx)("span",{className:"-mx-1.5 flex h-8 min-w-0 items-center rounded-lg bg-button-secondary-fill-hover px-1.5",children:(0,t.jsx)("input",{type:"text","aria-label":y("page-title.input.aria-label","Page title"),placeholder:y("page-title.input.placeholder","Untitled page"),autoFocus:!0,maxLength:200,spellCheck:!1,value:k,onChange:e=>j(e.currentTarget.value),onFocus:eT,onBlur:e=>M(e.currentTarget.value),onKeyDown:A,className:(0,ex.c)("field-sizing-content max-w-full min-w-6 bg-transparent outline-none placeholder:text-fg-tertiary",N)})}),f[54]=x,f[55]=k,f[56]=M,f[57]=_,f[58]=A,f[59]=P,f[60]=y,f[61]=N,f[62]=d):d=f[62],f[63]!==R||f[64]!==d?(p=(0,t.jsxs)("span",{className:"flex h-6 min-w-0 flex-1 items-center gap-2",children:[R,d]}),f[63]=R,f[64]=d,f[65]=p):p=f[65],p}function eT(e){return e.currentTarget.select()}function eS(e){return e.currentTarget.select()}let eL=new Set(["cursor.com","www.cursor.com"]),eC="cursor.com/canvas/",e_=/\[([^\]\n]*)\]\(([^()\s]+)\)|https:\/\/(?:www\.)?cursor\.com\/canvas\/[^\s/()<>\]]+\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}(?![0-9a-z%/?#_-])/gi,e$=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,eI=/^[a-z][a-z0-9]*-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;function eN(e){let t,n;if(!e.includes(eC))return null;let r=e.trim(),a=URL.canParse(r)?new URL(r):null;if(null==a||"https:"!==a.protocol||!eL.has(a.hostname)||""!==a.port||""!==a.username||""!==a.password||""!==a.search||""!==a.hash)return null;let o=a.pathname.split("/");if(4!==o.length||""!==o[0]||"canvas"!==o[1])return null;let i=(t=(o[2]??"").trim(),eI.test(t)?t:null),s=(n=(o[3]??"").trim().toLowerCase(),e$.test(n)?n:null);return null==i||null==s?null:{storeId:i,canvasId:s}}function eP(e){if(!e.includes(eC))return null;let t=null;for(let n of e.matchAll(e_)){let e=(n[2]??n[0]).trim(),r=eN(e);if(null!=r){if(null!=t)return null;t={locator:r,label:n[1]?.trim()||null,href:e,matchStart:n.index,matchEnd:n.index+n[0].length}}}return t}function eM(e,t){return 0===e.slice(0,t.matchStart).trim().length&&0===e.slice(t.matchEnd).trim().length}e.s(["u",0,eP,"U",0,eM,"W",0,eN],2603225);let eA=new WeakMap;function eR(e){if("bot_message"!==e.kind)return null;let t=eA.get(e);if(void 0!==t)return t;let n=function(e){let t=eP(e.text);if(null==t)return null;let n=null!=e.images&&e.images.length>0;return{link:t,isStandalone:eM(e.text,t)&&!n}}(e);return eA.set(e,n),n}function eO(e,t){for(let n=e.length-1;n>=0;n-=1){let r=e[n];if(void 0!==r&&eR(r)?.link.locator.canvasId===t)return r.entryId}return null}e.s(["I",0,eR,"q",0,eO],5814441);class ez extends Error{}async function eU(e){let t=new Blob([function(e){let{buffer:t}=e;return t instanceof ArrayBuffer?new Uint8Array(t,e.byteOffset,e.byteLength):Uint8Array.from(e)}(e)]).stream().pipeThrough(new DecompressionStream("gzip")).getReader(),n=[],r=0;for(;;){let e=await t.read();if(e.done)break;if((r+=e.value.byteLength)>2e7)throw await t.cancel(),new ez;n.push(e.value)}let a=new Uint8Array(r),o=0;for(let e of n)a.set(e,o),o+=e.byteLength;return a}let eB=h.z.object({version:v.z.literal(1),runtimeEsm:D.z.string(),userModule:D.z.string()});async function eD(e){let t;if(0===e.byteLength)return{isDecoded:!1,errorClass:"empty"};if(e.byteLength>5e6)return{isDecoded:!1,errorClass:"compressed-too-large"};try{t=new TextDecoder("utf-8",{fatal:!0}).decode(await eU(e))}catch(e){return{isDecoded:!1,errorClass:function(e){if(e instanceof ez)return"decompressed-too-large";if(!(e instanceof Error))return typeof e;let t="code"in e&&"string"==typeof e.code?e.code:null;return null!=t&&t.length>0?`${e.name} (${t})`:e.name}(e)}}let n=function(e){let t=e.trimStart();if(!t.startsWith("{"))return null;try{let e=eB.safeParse(JSON.parse(t));return e.success?e.data.userModule:null}catch{return null}}(t);return null!==n?{isDecoded:!0,bundleJsonText:t,userModule:n}:{isDecoded:!1,errorClass:"invalid-bundle"}}var eF=e.i(5530262),eH=e.i(5967225),eK=e.i(9415910),eq=e.i(6630418),eJ=e.i(3003272),eV=e.i(2830736),eW=e.i(2461599),eG=e.i(2286875);let eQ=new Set(["compressed-too-large","decompressed-too-large"]),eY={status:"unavailable"},eX=eW.z.record(D.z.string(),eG.z.unknown());async function eZ(e,t){let n=new TextEncoder().encode(t),r=new Uint8Array(e.byteLength+n.byteLength);return r.set(e),r.set(n,e.byteLength),Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",r)),e=>e.toString(16).padStart(2,"0")).join("")}async function e0({locator:e,groupChatId:t}){var n;let r=await eg.f.getCanvasPayload({storeId:e.storeId,canvasId:e.canvasId,...null===t?{}:{groupChatId:t}});if("ok"!==r.status)return{status:r.status};let{metadata:a}=r;if(void 0!==a&&(a.storeId!==e.storeId||a.canvasId!==e.canvasId))return eY;let o=function(e){if(!e)return"{}";try{return eX.safeParse(JSON.parse(e)).success?e:null}catch{return null}}(r.dataJson),i=function(e){try{return new Uint8Array((0,eH.D)(e))}catch{return null}}(r.renderBundleGzip);if(null===o||null===i)return eY;let s=await eD(i);if(!s.isDecoded)return eQ.has(s.errorClass)?{status:"too_large"}:eY;let l=(n=s.userModule,E.filter(([,e])=>e.test(n)).map(([e])=>e));return{status:"ready",title:a?.title??null,bundleJsonText:s.bundleJsonText,dataJsonText:o,contentKey:await eZ(i,o),...0===l.length?{}:{runtimes:l}}}function e1(e){let t,r,a=(0,n.c)(6),{agentId:o,locator:i,revision:s}=e;a[0]!==o?(t=e=>e.agents.find(e=>e.agentId===o)?.isGroup===!0,a[0]=o,a[1]=t):t=a[1];let l=(0,eF.f)(t)?o:null;a[2]!==i||a[3]!==s||a[4]!==l?(r=function({locator:e,groupChatId:t,revision:n}){return(0,eJ.f)({queryKey:em.f.page(e.storeId,e.canvasId,t,n),queryFn:()=>e0({locator:e,groupChatId:t}),staleTime:6e4,placeholderData:eq.y,retry:(e,t)=>e<1&&(0,eK.iB)(t)})}({locator:i,groupChatId:l,revision:s}),a[2]=i,a[3]=s,a[4]=l,a[5]=r):r=a[5];let{data:c,isError:u}=(0,eV.f)(r);return c??(u?eY:void 0)}function e2(e,t){let r,a,o,i,s,l,c,u,d=(0,n.c)(25),p=void 0===t||t,{t:f}=(0,ey.f)("bots"),m=(0,ev.d)(),g=(0,ef.s)();d[0]!==e.canvasId||d[1]!==e.storeId?(r=em.f.pageShare(e.storeId,e.canvasId),d[0]=e.canvasId,d[1]=e.storeId,d[2]=r):r=d[2];let h=r;d[3]!==e?(a=async()=>(await eg.f.getCanvasMetadata(e))?.owner??null,d[3]=e,d[4]=a):a=d[4],d[5]!==p||d[6]!==h||d[7]!==a?(o={queryKey:h,queryFn:a,enabled:p,retry:!1},d[5]=p,d[6]=h,d[7]=a,d[8]=o):o=d[8];let{data:v}=(0,eV.f)(o);d[9]!==e?(i=t=>eg.f.setCanvasVisibility({...e,visibility:t,..."team_view"===t?{openToTeam:!0}:{}}),d[9]=e,d[10]=i):i=d[10],d[11]!==m||d[12]!==h?(s=e=>{m.setQueryData(h,t=>{if(null==t)return t;let{pageUrl:n,...r}=t;return{...r,...e}})},d[11]=m,d[12]=h,d[13]=s):s=d[13],d[14]!==g||d[15]!==f?(l=e=>{g("BotPageShare:setVisibility",e,f("page-share.update.failed","Couldn't change who can open this page. Try again."))},d[14]=g,d[15]=f,d[16]=l):l=d[16],d[17]!==i||d[18]!==s||d[19]!==l?(c={mutationFn:i,onSuccess:s,onError:l},d[17]=i,d[18]=s,d[19]=l,d[20]=c):c=d[20];let{mutate:y,isPending:b}=(0,eh.f)(c);return d[21]!==b||d[22]!==y||d[23]!==v?(u={owner:v,setVisibility:y,isUpdating:b},d[21]=b,d[22]=y,d[23]=v,d[24]=u):u=d[24],u}e.s(["f",0,e1],188593);var e3=e.i(4939445),e4=e.i(481778),e5=e.i(2777665),e6=e.i(8818862),e8=e.i(7026337),e9=e.i(6307696),e7=e.i(6348076),te=e.i(1682626),tt=e.i(1404024),tn=e.i(7302423),tr=e.i(8674340),ta=e.i(8171567);function to(e){let r,a,o,i=(0,n.c)(11),{locator:l,title:c,href:u}=e,d=(0,s.P)(),{owner:p,setVisibility:f,isUpdating:m}=e2(l);if(null==p)return null;i[0]!==d.bots.PageShareButton?(r=(0,t.jsx)(e9.J,{render:(0,t.jsx)(d.bots.PageShareButton,{})}),i[0]=d.bots.PageShareButton,i[1]=r):r=i[1];let g=p.pageUrl??u;return i[2]!==m||i[3]!==p||i[4]!==f||i[5]!==g||i[6]!==c?(a=(0,t.jsx)(e9.T,{align:"end",sideOffset:8,size:"xl",padding:"none",children:(0,t.jsx)(ti,{owner:p,title:c,link:g,isUpdating:m,onVisibilityChange:f})}),i[2]=m,i[3]=p,i[4]=f,i[5]=g,i[6]=c,i[7]=a):a=i[7],i[8]!==r||i[9]!==a?(o=(0,t.jsxs)(e9.V,{modal:!0,children:[r,a]}),i[8]=r,i[9]=a,i[10]=o):o=i[10],o}function ti({owner:e,title:r,link:o,isUpdating:i,onVisibilityChange:s}){let{t:l}=(0,ey.f)("bots"),{user:c,team:u}=(0,a.useSession)(),d=[c?.givenName,c?.familyName].filter(Boolean).join(" ")||c?.email||l("page-share.owner.fallback-name","You"),p=function(e,t){let r,a,o,i,s,l,c,u=(0,n.c)(24),{t:d}=(0,ey.f)("bots"),p=e.canShareToTeam||e.teamShareBlockedByAdmin||"team_view"===e.visibility;u[0]!==e.teamShareBlockedByAdmin||u[1]!==d||u[2]!==t?(r=e.teamShareBlockedByAdmin?d("page-share.team.blocked-description","Your team admin turned off team sharing"):t?d("page-share.team.description","Everyone at {{teamName}}",{teamName:t}):d("page-share.team.fallback-description","Everyone on your team"),u[0]=e.teamShareBlockedByAdmin,u[1]=d,u[2]=t,u[3]=r):r=u[3];let f=r;return u[4]!==d?(a=d("page-share.private.label","Only you"),u[4]=d,u[5]=a):a=u[5],u[6]!==d?(o=d("page-share.private.description","Only you can open this page"),u[6]=d,u[7]=o):o=u[7],u[8]!==a||u[9]!==o?(i={value:"private",label:a,description:o,Icon:ta.f,disabled:!1},u[8]=a,u[9]=o,u[10]=i):i=u[10],u[11]!==e.canShareToTeam||u[12]!==p||u[13]!==d||u[14]!==f||u[15]!==t?(s=p?{value:"team_view",label:t||d("page-share.team.fallback-label","Your team"),description:f,Icon:tr.f,disabled:!e.canShareToTeam}:null,u[11]=e.canShareToTeam,u[12]=p,u[13]=d,u[14]=f,u[15]=t,u[16]=s):s=u[16],u[17]!==e.visibility||u[18]!==d?(l="public"===e.visibility?{value:"public",label:d("page-share.public.label","Anyone with the link"),description:d("page-share.public.description","Anyone with the link can open this page"),Icon:tt.f,disabled:!0}:null,u[17]=e.visibility,u[18]=d,u[19]=l):l=u[19],u[20]!==i||u[21]!==s||u[22]!==l?(c=[i,s,l].filter(ts),u[20]=i,u[21]=s,u[22]=l,u[23]=c):c=u[23],c}(e,u?.name);return(0,t.jsxs)("div",{className:"flex flex-col gap-4 p-4",children:[(0,t.jsx)("p",{className:"line-clamp-2 break-words text-base font-semibold leading-6 tracking-tight text-fg-primary",children:l("page-share.heading","Share “{{title}}”",{title:r})}),(0,t.jsxs)("div",{className:"flex items-center gap-3 border border-transparent px-2",children:[(0,t.jsx)(e7.f,{name:d,imageUrl:c?.profileImageUrl,size:32}),(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate text-sm text-fg-primary",children:d}),(0,t.jsx)("span",{className:"shrink-0 text-sm text-fg-tertiary",children:l("page-share.owner.label","Owner")})]}),(0,t.jsx)(tc,{value:e.visibility,options:p,disabled:i,onChange:s}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsx)(tu,{link:o}),(0,t.jsxs)(e5.K,{render:(0,t.jsx)("a",{href:o,target:"_blank",rel:"noopener noreferrer"}),variant:"outline",size:"xl",shape:"pill",children:[(0,t.jsx)(te.f,{size:4}),l("page-share.open-in-new-tab-btn.label","Open in new tab")]})]})]})}function ts(e){return null!==e}function tl(e){let r,a=(0,n.c)(2),{Icon:o}=e;return a[0]!==o?(r=(0,t.jsx)("span",{"aria-hidden":!0,className:"flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-l2 text-fg-secondary",children:(0,t.jsx)(o,{size:4})}),a[0]=o,a[1]=r):r=a[1],r}function tc(e){let r,a,o,i,s,l,c,u,d,p,f,m,g,h,v,y,b,x,w=(0,n.c)(49),{value:k,options:j,disabled:E,onChange:T}=e,{t:S}=(0,ey.f)("bots"),[L,C]=(0,ei.useState)(!1);if(w[0]!==E||w[1]!==L||w[2]!==j||w[3]!==S||w[4]!==k){let e;w[14]!==k?(e=e=>e.value===k,w[14]=k,w[15]=e):e=w[15],o=j.find(e),a=e6.G,c=L,u=C,d=!1,r=e6.X,i="button",s=E,l=S("page-share.visibility-trigger.aria-label","Who can open: {{access}}",{access:o?.label??""}),w[0]=E,w[1]=L,w[2]=j,w[3]=S,w[4]=k,w[5]=r,w[6]=a,w[7]=o,w[8]=i,w[9]=s,w[10]=l,w[11]=c,w[12]=u,w[13]=d}else r=w[5],a=w[6],o=w[7],i=w[8],s=w[9],l=w[10],c=w[11],u=w[12],d=w[13];w[16]===Symbol.for("react.memo_cache_sentinel")?(p=(0,ex.c)("flex w-full items-center gap-3 rounded-xl border border-border-l1 px-2 py-1.5 text-start","transition-colors hover:bg-surface-l2 data-[state=open]:bg-surface-l2","disabled:cursor-not-allowed disabled:opacity-50"),w[16]=p):p=w[16],w[17]!==i||w[18]!==s||w[19]!==l?(f=(0,t.jsx)("button",{type:i,disabled:s,"aria-label":l,className:p}),w[17]=i,w[18]=s,w[19]=l,w[20]=f):f=w[20],w[21]!==o?(m=o?(0,t.jsx)(tl,{Icon:o.Icon}):null,w[21]=o,w[22]=m):m=w[22];let _=o?.label;if(w[23]!==_?(g=(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate text-sm font-medium text-fg-primary",children:_}),w[23]=_,w[24]=g):g=w[24],w[25]!==L?(h=(0,t.jsx)(e8.f,{open:L,size:4,tone:"secondary"}),w[25]=L,w[26]=h):h=w[26],w[27]!==r||w[28]!==g||w[29]!==h||w[30]!==f||w[31]!==m?(v=(0,t.jsxs)(r,{render:f,children:[m,g,h]}),w[27]=r,w[28]=g,w[29]=h,w[30]=f,w[31]=m,w[32]=v):v=w[32],w[33]!==T||w[34]!==j||w[35]!==k){let e;w[37]!==T||w[38]!==k?(e=e=>(0,t.jsx)(e6.r,{disabled:e.disabled,onClick:()=>{e.value!==k&&T(e.value)},trailing:e.value===k&&(0,t.jsx)(tn.f,{size:4}),children:(0,t.jsxs)("span",{className:"flex min-w-0 items-center gap-3 py-1",children:[(0,t.jsx)(tl,{Icon:e.Icon}),(0,t.jsxs)("span",{className:"flex min-w-0 flex-col",children:[(0,t.jsx)("span",{className:"truncate text-sm text-fg-primary",children:e.label}),(0,t.jsx)("span",{className:"truncate text-xs text-fg-tertiary",children:e.description})]})]})},e.value),w[37]=T,w[38]=k,w[39]=e):e=w[39],y=j.map(e),w[33]=T,w[34]=j,w[35]=k,w[36]=y}else y=w[36];return w[40]!==y?(b=(0,t.jsx)(e6.L,{align:"start",width:"anchor",children:y}),w[40]=y,w[41]=b):b=w[41],w[42]!==a||w[43]!==v||w[44]!==b||w[45]!==c||w[46]!==u||w[47]!==d?(x=(0,t.jsxs)(a,{open:c,onOpenChange:u,modal:d,children:[v,b]}),w[42]=a,w[43]=v,w[44]=b,w[45]=c,w[46]=u,w[47]=d,w[48]=x):x=w[48],x}function tu(e){let r,a,o,i,s,l=(0,n.c)(17),{link:c}=e,{t:u}=(0,ey.f)("bots"),{ref:d,isCopied:p,play:f}=(0,e3.V)();return l[0]!==p||l[1]!==u?(r=p?u("page-share.copy-link-btn.copied","Copied"):void 0,l[0]=p,l[1]=u,l[2]=r):r=l[2],l[3]!==p||l[4]!==c||l[5]!==f||l[6]!==u?(a=()=>{p||navigator.clipboard.writeText(c).then(f,()=>e4.f.error(u("page-share.copy-link.failed","Couldn't copy the link")))},l[3]=p,l[4]=c,l[5]=f,l[6]=u,l[7]=a):a=l[7],l[8]!==d?(o=(0,t.jsx)(e3.l,{ref:d,size:16}),l[8]=d,l[9]=o):o=l[9],l[10]!==u?(i=u("page-share.copy-link-btn.label","Copy link"),l[10]=u,l[11]=i):i=l[11],l[12]!==r||l[13]!==a||l[14]!==o||l[15]!==i?(s=(0,t.jsxs)(e5.K,{type:"button",variant:"outline",size:"xl",shape:"pill","aria-label":r,onClick:a,children:[o,i]}),l[12]=r,l[13]=a,l[14]=o,l[15]=i,l[16]=s):s=l[16],s}let td=null,tp=new Set;function tf(e){for(let t of(td=e,tp))t()}function tm(){null!==td&&((0,o.C)(),tf(null))}function tg(){return(0,ei.useSyncExternalStore)(ty,tv,th)}function th(){return null}function tv(){return td}function ty(e){return tp.add(e),()=>tp.delete(e)}function tb(e){let o,l,c,u,d,p,f,m,g,h,v,y,b,x,w,k,j,E,T=(0,n.c)(53),{request:S}=e,{t:L}=(0,ey.f)("bots"),C=(0,s.P)(),_=(0,ei.use)(C.StageLayer)?.spanPane;T[0]!==_?(o=()=>_?.(),l=[_],T[0]=_,T[1]=o,T[2]=l):(o=T[1],l=T[2]),(0,ei.useLayoutEffect)(o,l);let $=(0,i.I)(),I=(0,r.Y)(),{user:N}=(0,a.useSession)(),P=(I.ENABLE_UNIFIED_IMAGINE_SIDEBAR||!I.DISABLE_CONVERSATION_SEARCH)&&(null!=N||!I.DESKTOP_UI_LOGGED_OUT_LAYOUT);T[3]!==S.agentId||T[4]!==S.locator.canvasId?(c=e=>eO(e.transcriptsByAgentId[S.agentId]?.entries??[],S.locator.canvasId),T[3]=S.agentId,T[4]=S.locator.canvasId,T[5]=c):c=T[5];let M=(0,eF.f)(c)??S.revision;T[6]!==S.agentId||T[7]!==S.locator||T[8]!==M?(u={agentId:S.agentId,locator:S.locator,revision:M},T[6]=S.agentId,T[7]=S.locator,T[8]=M,T[9]=u):u=T[9];let A=e1(u),R=A?.status==="ready",{owner:O}=e2(S.locator,R),[z,U]=(0,ei.useState)(!1);T[10]!==R||T[11]!==A||T[12]!==L?(d=(R?A.title:null)??L("page-card.title-fallback","Page"),T[10]=R,T[11]=A,T[12]=L,T[13]=d):d=T[13];let B=d;if(T[14]===Symbol.for("react.memo_cache_sentinel")?(p=[],T[14]=p):p=T[14],(0,ei.useEffect)(tx,p),T[15]!==P||T[16]!==$)f={"--bot-page-leading-inset":`max(var(--grok-space-3, 12px), calc(${P?"calc(var(--grok-traffic-light-clearance, 0px) + var(--grok-space-3, 12px) + 2 * var(--grok-control-height-lg, 32px) + var(--grok-space-0-5, 2px) + var(--grok-space-2, 8px))":"calc(var(--grok-traffic-light-clearance, 0px) + var(--grok-space-3, 12px) + var(--grok-control-height-lg, 32px) + var(--grok-space-2, 8px))"} - ${$}px))`},T[15]=P,T[16]=$,T[17]=f;else f=T[17];let D=z&&"after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-border-l1";T[18]!==D?(m=(0,ex.c)("relative grid h-(--grok-chrome-height,56px) shrink-0 grid-cols-[minmax(var(--bot-page-leading-inset),1fr)_minmax(0,auto)_minmax(auto,1fr)] items-center gap-2",D),T[18]=D,T[19]=m):m=T[19],T[20]===Symbol.for("react.memo_cache_sentinel")?(g=(0,t.jsx)("span",{"aria-hidden":!0}),T[20]=g):g=T[20];let F=R&&null!=O;T[21]!==S.locator||T[22]!==F||T[23]!==B?(h=(0,t.jsx)(eE,{locator:S.locator,title:B,canRename:F,look:"pill"}),T[21]=S.locator,T[22]=F,T[23]=B,T[24]=h):h=T[24],T[25]!==R||T[26]!==S.href||T[27]!==S.locator||T[28]!==B?(v=R?(0,t.jsx)(to,{locator:S.locator,title:B,href:S.href}):null,T[25]=R,T[26]=S.href,T[27]=S.locator,T[28]=B,T[29]=v):v=T[29];let H=C.bots.PageCloseButton;return T[30]!==L?(y=L("page-card.close-btn.aria-label","Close"),T[30]=L,T[31]=y):y=T[31],T[32]!==C.bots.PageCloseButton||T[33]!==y?(b=(0,t.jsx)(H,{label:y,onClick:tm}),T[32]=C.bots.PageCloseButton,T[33]=y,T[34]=b):b=T[34],T[35]!==v||T[36]!==b?(x=(0,t.jsxs)("div",{className:"flex items-center justify-end gap-1 pe-3",children:[v,b]}),T[35]=v,T[36]=b,T[37]=x):x=T[37],T[38]!==m||T[39]!==h||T[40]!==x||T[41]!==f?(w=(0,t.jsxs)("div",{style:f,className:m,children:[g,h,x]}),T[38]=m,T[39]=h,T[40]=x,T[41]=f,T[42]=w):w=T[42],T[43]!==A||T[44]!==S.href||T[45]!==B?(k=void 0===A?null:"ready"===A.status?(0,t.jsx)(ec,{page:A,title:B,opensLinks:!0,onCloseRequest:tm,onScrollEdge:U}):(0,t.jsx)(tk,{page:A,href:S.href}),T[43]=A,T[44]=S.href,T[45]=B,T[46]=k):k=T[46],T[47]!==k?(j=(0,t.jsx)("div",{className:"min-h-0 flex-1 pb-(--bot-page-composer)",children:k}),T[47]=k,T[48]=j):j=T[48],T[49]!==w||T[50]!==j||T[51]!==B?(E=(0,t.jsxs)("div",{"data-testid":"bot-page-stage",role:"region","aria-label":B,className:"flex h-full min-h-0 flex-col bg-surface-base text-fg-primary",children:[w,j]}),T[49]=w,T[50]=j,T[51]=B,T[52]=E):E=T[52],E}function tx(){return document.addEventListener("keydown",tw),()=>document.removeEventListener("keydown",tw)}function tw(e){if("Escape"!==e.key||e.repeat||e.defaultPrevented)return;let t=e.target;t instanceof Element&&t.closest('input, textarea, [contenteditable="true"]')||tm()}function tk(e){let r,a,o,i,s,l,c,u=(0,n.c)(17),{page:d,href:p}=e,{t:f}=(0,ey.f)("bots");u[0]!==f?(r=f("page-card.too-large.description","This page is too large to open here"),u[0]=f,u[1]=r):r=u[1],u[2]!==f?(a=f("page-card.unavailable.description","This page isn't available"),u[2]=f,u[3]=a):a=u[3],u[4]!==r||u[5]!==a?(o={too_large:r,unavailable:a},u[4]=r,u[5]=a,u[6]=o):o=u[6];let m=o["ready"===d.status?"unavailable":d.status];return u[7]!==m?(i=(0,t.jsx)("p",{role:"status",className:"text-sm text-fg-secondary",children:m}),u[7]=m,u[8]=i):i=u[8],u[9]!==f?(s=f("page-card.open-in-cursor-btn.label","Open in Cursor"),u[9]=f,u[10]=s):s=u[10],u[11]!==p||u[12]!==s?(l=(0,t.jsx)("a",{href:p,target:"_blank",rel:"noopener noreferrer",className:"text-sm font-medium text-fg-primary underline",children:s}),u[11]=p,u[12]=s,u[13]=l):l=u[13],u[14]!==i||u[15]!==l?(c=(0,t.jsxs)("div",{className:"flex h-full flex-col items-center justify-center gap-4 px-6",children:[i,l]}),u[14]=i,u[15]=l,u[16]=c):c=u[16],c}e.s(["L",0,function(e){let r,a,o,i,s,l=(0,n.c)(10),{agentId:c,composerHeightPx:u}=e,d=tg();l[0]!==c?(r=()=>()=>{td?.agentId===c&&tf(null)},a=[c],l[0]=c,l[1]=r,l[2]=a):(r=l[1],a=l[2]),(0,ei.useEffect)(r,a);let p=d?.agentId===c?d:null;if(l[3]!==u)o={"--bot-page-composer":`${u}px`},l[3]=u,l[4]=o;else o=l[4];return l[5]!==p?(i=null===p?null:(0,t.jsx)(tb,{request:p}),l[5]=p,l[6]=i):i=l[6],l[7]!==o||l[8]!==i?(s=(0,t.jsx)("div",{"data-testid":"bot-page-stage-slot",className:"pointer-events-none absolute inset-0 z-[1] [&:not(:empty)]:pointer-events-auto",style:o,children:i}),l[7]=o,l[8]=i,l[9]=s):s=l[9],s},"Q",0,function(e){null===td&&(0,o.C)(),tf(e)},"W",0,tg],103871)},652817,e=>{"use strict";var t=e.i(6936896);let n=null,r=null;function a(e,t){let n=Object.keys(t).map(t=>[t,e.style.getPropertyValue(t)]);for(let[n,r]of Object.entries(t))e.style.setProperty(n,r);return()=>{for(let[t,r]of n)e.style.setProperty(t,r)}}function o(e){let t,n,r=getComputedStyle(e);return{duration:Number.isFinite(n=Number.parseFloat(t=r.getPropertyValue("--grok-duration-spring").trim()))?t.endsWith("ms")?n:1e3*n:400,easing:r.getPropertyValue("--grok-ease-spring").trim()||"cubic-bezier(0.22, 1, 0.36, 1)"}}e.s(["w",0,function(e){if(null===e)return;n=e;let i=r;return r=null,null!==i&&performance.now()-i.at<250&&function(e,n){if(!("function"!=typeof e.animate||(0,t.l)())){var r;!function(e,t){let n=e.getBoundingClientRect().width;if(.5>Math.abs(n-t))return;let r=e.querySelector("[data-title-pill-name]"),i=[a(e,{overflow:"clip","justify-content":"center"}),null===r?null:a(r,{flex:`0 0 ${r.getBoundingClientRect().width}px`})],s=()=>{for(let e of i)e?.()};e.animate({width:[`${t}px`,`${n}px`]},o(e)).finished.then(s,s)}(e,n.width),r=n.centre,requestAnimationFrame(()=>{let t;if(!e.isConnected)return;let n=r-((t=e.getBoundingClientRect()).left+t.width/2);.5>Math.abs(n)||e.animate({translate:[`${n}px 0`,"0 0"]},o(e))})}}(e,i),()=>{n===e&&(n=null)}},"C",0,function(){let e=n?.isConnected===!0?n.getBoundingClientRect():null;r=null!==e&&e.width>0?{width:e.width,centre:e.left+e.width/2,at:performance.now()}:null}])}]);

//# debugId=d5196de3-9ed1-9058-ff33-64e50bd39679