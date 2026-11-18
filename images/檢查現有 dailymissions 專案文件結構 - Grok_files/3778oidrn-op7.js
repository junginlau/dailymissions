;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="13e81494-dc50-874d-1c52-e6a5d4cdf006")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,4768155,e=>{"use strict";var t=e.i(4398962),n=e.i(3869250),r=e.i(7690407),a=e.i(5535468),o=e.i(6177080),i=e.i(603814),l=e.i(9063320);e.i(4594870);var s=e.i(8815121);e.i(3778443);var c=e.i(2830736);function u(e){return["frames-canvas",e]}async function d(e){let t=await (0,s.$)({workspaceId:e,path:"/",recursive:!1});return(0,o.f)(t.files)}function f(e,n){let r,o,i,l,s=(0,t.c)(11),f=(0,a.y)()&&n?e:void 0,p=f??"";s[0]!==p?(r=u(p),s[0]=p,s[1]=r):r=s[1],s[2]!==f?(o=()=>f?d(f):Promise.resolve(!1),s[2]=f,s[3]=o):o=s[3];let m=!!f;s[4]!==r||s[5]!==o||s[6]!==m?(i={queryKey:r,queryFn:o,enabled:m},s[4]=r,s[5]=o,s[6]=m,s[7]=i):i=s[7];let h=(0,c.f)(i),g=!!f;return s[8]!==h||s[9]!==g?(l={checked:g,known:h},s[8]=h,s[9]=g,s[10]=l):l=s[10],l}e.s(["t",0,function(e){return(0,r.u)(n.L.getState())?(0,l.getQueryClient)().fetchQuery({queryKey:u(e),queryFn:()=>d(e),staleTime:3e4}).catch(t=>{(0,i.W)("frames-canvas:frames-check",t,{workspace_id:e})}):Promise.resolve(!1)},"P",0,function(e,t){let{checked:n,known:r}=f(e,t);return!!n&&r.data},"q",0,function(e,t){let{checked:n,known:r}=f(e,t);return!!n&&(r.data??(!r.isError&&void 0))}])},8687395,e=>{"use strict";e.i(3145442);var t=e.i(4037202),n=e.i(1122946),r=e.i(4628566);let a="app-sidebar",o="desktop-shell.sidebar-last-open-width";function i(e){return e<t._?0:Math.min(t.w,Math.max(t.H,Math.round(e)))}let l={animate:!1,dragHeldShut:!1,lastOpenWidth:t.p},s={snapshot:null,listeners:new Set},c=new Set;function u(e){requestAnimationFrame(()=>{setTimeout(e,0)})}function d(){let e=[...c];for(let t of(c.clear(),e))t()}function f(){let e,n;return s.snapshot??={animate:!1,dragHeldShut:!1,lastOpenWidth:(n=Number.isFinite(e=Number(r.a.getItem(o)))?i(e):0)>0?n:t.p},s.snapshot}function p(){return l}function m(e){return s.listeners.add(e),()=>{s.listeners.delete(e)}}function h(e){let t=f(),n={...t,...e};if(n.animate!==t.animate||n.dragHeldShut!==t.dragHeldShut||n.lastOpenWidth!==t.lastOpenWidth){for(let e of(n.lastOpenWidth!==t.lastOpenWidth&&r.a.setItem(o,String(n.lastOpenWidth)),s.snapshot=n,s.listeners))e();t.animate&&!n.animate&&c.size>0&&u(d)}}let g={animate:!1,collapsed:!1,expanded:!0,lastOpenWidth:t.p,layoutWidth:t.p,overlay:!1,width:t.p,close:()=>{},closeOverlay:()=>{},commit:()=>{},toggle:()=>{}},y=(0,n.createContext)(g),v=(0,n.createContext)(g.collapsed),b=(0,n.createContext)(g.layoutWidth),x=(0,n.createContext)(g.closeOverlay),w={animate:!1,header:null,id:a,lastOpenWidth:t.p,onWidthChange:()=>{},onWidthTransitionEnd:()=>{},width:t.p},k=(0,n.createContext)(w);e.s(["r",0,a,"J",0,v,"d",0,y,"K",0,x,"G",0,k,"P",0,b,"s",0,function(e){c.add(e),f().animate||u(d)},"Q",0,i,"q",0,function(e){h(e>0?{animate:!1,dragHeldShut:!1,lastOpenWidth:e}:{animate:!1,dragHeldShut:!1})},"t",0,function(){h({animate:!1})},"z",0,function(e){h({dragHeldShut:e})},"y",0,function(e){h({animate:e,dragHeldShut:!1})},"_",0,function(){return(0,n.use)(y)},"F",0,function(){return(0,n.use)(x)},"H",0,function(){return(0,n.use)(v)},"U",0,function(){return(0,n.use)(k)},"E",0,function(){return(0,n.useSyncExternalStore)(m,f,p)},"I",0,function(){return(0,n.use)(b)}])},5804718,e=>{"use strict";let t=new Set,n=new Set,r=new Set;function a(){return n.size>0}function o(e){let t=a();e();let n=a();if(n!==t)for(let e of r)e(n)}e.s(["h",0,function(e){t.add(e)},"B",0,function(e){o(()=>n.add(e))},"m",0,function(){return t.size>0},"J",0,a,"w",0,function(e){t.delete(e)},"Z",0,function(e){o(()=>n.delete(e))},"A",0,function(e){return r.add(e),()=>{r.delete(e)}}])},5408876,e=>{"use strict";var t=e.i(5535468);e.i(2090143);var n=e.i(9239037);e.i(1137683);var r=e.i(9628502),a=e.i(3869250);function o(e){return!0===e.getFeature(t.u.ENABLE_UNIFIED_PROJECTS)&&!0===e.getFeature(t.u.ENABLE_UNIFIED_IMAGINE_SIDEBAR)}e.s(["n",0,function(e){return e?.kind===n.b.ConversationKindImagine},"P",0,function(e){return e?.kind===r.x.WorkspaceKindImagine},"S",0,function(){return o(a.L.getState())},"Y",0,function(e){return e?.kind===r.x.WorkspaceKindUnified},"v",0,function(){return(0,a.L)(o)}])},2538452,e=>{"use strict";var t=e.i(1601224),n=e.i(1665391);e.s(["f",0,function(e){t.F.getState().idsetFocusQueryDraftAtEndByConversationId(Date.now(),e||n.h)}])},9136702,e=>{"use strict";e.s(["A",0,"ctrl+d","l",0,"cmd+i, ctrl+i","I",0,"cmd+j, ctrl+j","j",0,"cmd+shift+j, ctrl+shift+j","m",0,"cmd+/, ctrl+/","C",0,"cmd+,, ctrl+,","P",0,"cmd+shift+l, ctrl+shift+l","y",0,"cmd+enter, ctrl+enter","H",0,"cmd+shift+m, ctrl+shift+m","k",0,"cmd+shift+., ctrl+shift+.","$",0,"cmd+alt+b, ctrl+alt+b","Q",0,"cmd+shift+o, ctrl+shift+o"])},1552333,e=>{"use strict";var t=e.i(4398962),n=e.i(3671706),r=e.i(6116086),a=e.i(9679492),o=e.i(2968684);e.i(1381178);var i=e.i(6271884);e.s(["f",0,function(){let e,l=(0,t.c)(3),s=(0,n.f)(),c=(0,o.E)();if("commerce"!==s)return null;let u=(0,a.Q)((0,a.W)(c),{plusAvailable:!0});if(null===u)return null;let d=r.n[u],f=u===i.F.SuperGrokPro?"Ultra":"Super";return l[0]!==d||l[1]!==f?(e={next:d,priority:f},l[0]=d,l[1]=f,l[2]=e):e=l[2],e}])},6568562,e=>{"use strict";var t=e.i(4398962),n=e.i(4520385),r=e.i(5446406);function a(e){return e.openUpsell}e.s(["f",0,function(e){let o,i,l,s,c=(0,t.c)(14),{entrypointKey:u}=e,d=(0,n.f)(),f=(0,r.N)(a);c[0]!==u?(o={location:u},c[0]=u,c[1]=o):o=c[1];let p=o;c[2]!==u||c[3]!==p||c[4]!==d?(i=()=>{d("upsell_entrypoint_seen",u,p)},c[2]=u,c[3]=p,c[4]=d,c[5]=i):i=c[5];let m=i;c[6]!==u||c[7]!==p||c[8]!==d||c[9]!==f?(l=e=>{d("upsell_entrypoint_clicked",u,p),f({entrypointKey:u,targetTier:e?.targetTier,upsellCategory:e?.upsellCategory,successUrl:e?.successUrl,opensCheckout:e?.opensCheckout})},c[6]=u,c[7]=p,c[8]=d,c[9]=f,c[10]=l):l=c[10];let h=l;return c[11]!==h||c[12]!==m?(s={logImpression:m,goToUpsellPage:h},c[11]=h,c[12]=m,c[13]=s):s=c[13],s}])},103871,8552824,9202366,2603225,5814441,188593,e=>{"use strict";var t=e.i(1552184),n=e.i(4398962),r=e.i(5535468),a=e.i(8312865),o=e.i(652817),i=e.i(8687395),l=e.i(1524656);let s=`(function () {
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
})();`,c="--cursor-canvas-viewport-height",u="data-canvas-keyboard-nav",d=`:root{--cursor-canvas-focus-ring-width:1px;--cursor-canvas-focus-ring-offset:2px;--cursor-canvas-focus-ring-radius:4px}*:focus,*:focus-visible{outline:none}:root[${u}] *:focus-visible{outline:var(--cursor-canvas-focus-ring-width) solid var(--cursor-canvas-focus-ring-color,currentColor);outline-offset:var(--cursor-canvas-focus-ring-offset)}:where(a[href],[role="link"]):focus-visible{border-radius:var(--cursor-canvas-focus-ring-radius)}`,f=`(function () {
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
})();`,p={card:2,stage:4};var m=e.i(4541847),h=e.i(9851997),g=e.i(2284756),y=e.i(2893597),v=e.i(174472);let b=["d3","three"],x={d3:"d3",three:"THREE"},w="sand-canvas-frame-runtimes-request",k="sand-canvas-frame-runtimes";function E(e){return JSON.stringify(e).replaceAll("<","\\u003c")}let j=b.map(e=>[e,RegExp(`(?<![\\w$'"\`])(?<!(?<!\\.\\.)\\.)${x[e].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?![\\w$'"\`])`)]);function S(e){return b.filter(t=>e.includes(t))}let C=h.z.enum(b),T=g.z.object({type:y.z.literal(w),runtimes:v.z.array(C)});function L(){return{type:k,outcome:"failed"}}let _=(0,m.o)("visualization-d3-runtime",async()=>(await e.A(4553075)).VISUALIZATION_D3_RUNTIME_JS),O=(0,m.o)("visualization-three-runtime",async()=>(await e.A(9401182)).VISUALIZATION_THREE_RUNTIME_JS),I={d3:()=>_.load(),three:()=>O.load()};async function P(e){return Object.fromEntries(await Promise.all(S(e).map(async e=>[e,await I[e]()])))}let N="allow-scripts allow-pointer-lock",A=String.fromCodePoint(39),$=e=>`${A}${e}${A}`,M=$("none"),R=$("unsafe-inline");[["default-src",M],["script-src",R,"blob:"],["sandbox",N],["style-src",R],["img-src","data:","blob:"],["font-src","data:"],["connect-src",M],["worker-src",M],["child-src",M],["frame-src",M],["object-src",M],["base-uri",M],["form-action",M]].map(e=>e.join(" ")).join("; "),["accelerometer","camera","geolocation","gyroscope","magnetometer","microphone","payment","usb","clipboard-read","clipboard-write"].map(e=>`${e}=()`).join(", ");let U="__grokBotPageRetitlePort",z=g.z.object({type:y.z.literal("grok-bot-page:ready")});var K=e.i(3499852),H=e.i(5233334);let B="cursor-canvas-frame-close-request",F="cursor-canvas-frame-scroll",D=g.z.object({type:y.z.literal(B)}),q=g.z.object({type:y.z.literal(F),scrolled:K.z.boolean()}),W=`<script>
(function () {
  var scrolled = false;
  function report() {
    var next = scrollY > 0;
    if (next === scrolled) return;
    scrolled = next;
    try {
      parent.postMessage({ type: '${F}', scrolled: scrolled }, '*');
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
    parent.postMessage({ type: '${B}' }, '*');
  } catch {}
}, true);
</script>`,J="cursor-canvas-open-link",Q=g.z.object({type:y.z.literal(J),href:H.z.string()}),G=`<script>
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
      parent.postMessage({ type: '${J}', href: href }, '*');
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
</script>`,Y="cursor-canvas-frame-retitle",Z=`<script>${s}</script>`,X=`<script>${f}</script>`,ee={"<":String.raw`\u003c`,">":String.raw`\u003e`,"&":String.raw`\u0026`,"\u2028":String.raw`\u2028`,"\u2029":String.raw`\u2029`};function et(e){return e.replace(/[<>&\u2028\u2029]/g,e=>ee[e]??e)}function en(e){return et(JSON.stringify(e))}let er=`<script type="module">
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
</script>`;var ea=e.i(603814),eo=e.i(245799),ei=e.i(1122946);function el(e,t){return e.getPropertyValue(t).trim()}let es=new Map;function ec(e){let r,a=(0,n.c)(8),{page:o,title:i,opensLinks:l,onCloseRequest:s,onScrollEdge:c}=e,u=void 0!==l&&l,{resolvedTheme:d}=(0,eo.useTheme)(),f="dark"===d?"dark":"light",p=`${f}:${u?"stage":"card"}:${o.contentKey}`;return a[0]!==s||a[1]!==c||a[2]!==u||a[3]!==o||a[4]!==p||a[5]!==f||a[6]!==i?(r=(0,t.jsx)(eu,{page:o,theme:f,title:i,opensLinks:u,onCloseRequest:s,onScrollEdge:c},p),a[0]=s,a[1]=c,a[2]=u,a[3]=o,a[4]=p,a[5]=f,a[6]=i,a[7]=r):r=a[7],r}function eu(e){let r,a,o,i,l,s,u,f,m,h,g,y=(0,n.c)(29),{page:v,theme:b,title:x,opensLinks:j,onCloseRequest:C,onScrollEdge:_}=e,O=(0,ei.useRef)(null),I=(0,ei.useRef)(null),A=(0,ei.useRef)(x);y[0]!==j||y[1]!==v||y[2]!==b||y[3]!==x?(r=()=>{var e,t,n,r;let a,o,i,l;return l=(t=(e={page:v,title:x,theme:b,frame:O.current??document.body,opensLinks:j}).page,n=e.title,void 0===(a=es.get(t.contentKey))||a===n?void 0:{title:n,previousTitle:a}),function(e){var t,n,r,a,o,i,l,s,u;let f,m,h,g,y,v,b,x,{colors:j}=e,C=(n={kind:(t={theme:e.theme,colors:j,...void 0===e.brand?{}:{brand:e.brand}}).theme,...void 0===t.brand?{}:{brand:t.brand},primary:t.colors.primary,editorBackground:t.colors.background,editorForeground:t.colors.foreground},h=[`kind:${en(n.kind)}`],void 0!==n.brand&&h.push(`brand:${en(n.brand)}`),h.push(`primary:${en(n.primary)}`,`editorBackground:${en(n.editorBackground)}`,`editorForeground:${en(n.editorForeground)}`),`{${h.join(",")}}`);return g=void 0===(a={colors:j,theme:e.theme,head:"<title>Page</title>",body:`<div id="root"><div id="status">Loading page</div></div>
${l=e.runtimes,s=e.room??"card",void 0===l||0===l.length?"":`<script>${u=p[s],`(function () {
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
<script>${f=S(l),m=`{ type: ${E(w)}, runtimes: runtimes }`,`(function () {
  const host = window.parent;
  const runtimes = ${E(f)};
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
      if (event.source !== host || data === null || typeof data !== "object" || data.type !== ${E(k)}) return;
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
    state: new Map([['theme', ${C}]]),
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
  var port = window.${U};
  delete window.${U};
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
${er}`}).theme?"":(o=a.theme,`html{color-scheme:${o}}`),`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">${a.head}<style>${g}${i=a.colors,y="32px",v="16px",b="calc(100vh - 48px)",x=i.scrollbar??i.status,`*{margin:0;padding:0;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:${x} transparent}
html{height:100%;scrollbar-gutter:stable}
html:fullscreen,html:has(:fullscreen){scrollbar-gutter:auto}
html,body{width:100%;min-height:100%;background:${i.background};-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{padding:24px ${y};color:${i.foreground};font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;font-size:13px;line-height:1.385;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
#root{position:relative;width:100%;max-width:calc(100vw - 2*${y});margin-inline:auto;min-height:${b};overflow-x:auto}
${function({viewportHeight:e}){return`#root{${c}:${e}}#root>:only-child:is([style^="height:100%;"],[style^="height: 100%;"],[style*=";height:100%;"],[style*="; height: 100%;"]){min-height:var(${c})!important}`}({viewportHeight:b})}
::-webkit-scrollbar{width:8px;height:8px;background:transparent}
::-webkit-scrollbar-track,::-webkit-scrollbar-corner{background:transparent}
::-webkit-scrollbar-thumb{background:${x};border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${i.foreground}}
body>#root>#status{display:flex;align-items:center;justify-content:center;min-height:${b};color:${i.status};font:13px system-ui}
${function({inlinePadding:e,extraRules:t=""}={}){let n="calc(100vh - 32px)";return`@media (max-width: 479.98px){body{padding:${void 0===e?"16px":`16px ${e}`}}#root{min-height:${n};${c}:${n}}#root{overflow-x:hidden;overflow-x:clip}${t}}`}({inlinePadding:v,extraRules:`#root{max-width:calc(100vw - 2*${v})}body>#root>#status{min-height:calc(100vh - 32px)}`})}
${d}`}</style></head><body>${a.body}
${V}
${G}
${W}
${Z}
${X}</body></html>`}({bundleJsonText:e.page.bundleJsonText,dataJsonText:e.page.dataJsonText,theme:e.theme,colors:{background:(r=el(o=getComputedStyle(e.frame),"--surface-base"),(i=document.createElement("canvas").getContext("2d"))?(i.fillStyle=r,i.fillStyle):r),foreground:el(o,"--fg-primary"),primary:el(o,"--button-filled"),status:el(o,"--fg-tertiary"),scrollbar:el(o,"--border-l3")},brand:"grok",room:e.opensLinks?"stage":"card",...void 0===e.page.runtimes?{}:{runtimes:e.page.runtimes},...void 0===l?{}:{retitle:l}})},y[0]=j,y[1]=v,y[2]=b,y[3]=x,y[4]=r):r=y[4];let $=(0,ei.useEffectEvent)(r);y[5]!==v.runtimes?(a=async(e,t,n)=>{let r=v.runtimes??[];if(0===e.length||!e.every(e=>r.includes(e)))return void t.postMessage(L(),"*");try{let r=await P(e);if(n())return;t.postMessage({type:k,outcome:"loaded",sources:r},"*")}catch(e){if((0,ea.W)("BotPageFrame:loadRuntimes",e),n())return;t.postMessage(L(),"*")}},y[5]=v.runtimes,y[6]=a):a=y[6];let M=(0,ei.useEffectEvent)(a);y[7]!==C?(o=()=>C?.(),y[7]=C,y[8]=o):o=y[8];let R=(0,ei.useEffectEvent)(o);y[9]!==j?(i=e=>{j&&document.activeElement===O.current&&navigator.userActivation?.isActive===!0&&window.open(e,"_blank","noopener,noreferrer")},y[9]=j,y[10]=i):i=y[10];let K=(0,ei.useEffectEvent)(i);y[11]!==_?(l=e=>_?.(e),y[11]=_,y[12]=l):l=y[12];let H=(0,ei.useEffectEvent)(l);return y[13]!==M||y[14]!==$||y[15]!==K||y[16]!==H||y[17]!==R?(s=()=>{let e=O.current?.contentWindow;if(!e)return;let t=!1,n=!1,r=!1,a=a=>{var o,i,l,s;let c;if(a.source!==e)return;let u=(o=a.data,(c=T.safeParse(o)).success?{runtimes:S(c.data.runtimes)}:null);if(null!==u){if(n)return;n=!0,M(u.runtimes,e,()=>r).catch(ed);return}if(i=a.data,D.safeParse(i).success)return void R();let d=function(e){let t=Q.safeParse(e);if(!t.success||!URL.canParse(t.data.href))return null;let n=new URL(t.data.href);return"http:"===n.protocol||"https:"===n.protocol?n.href:null}(a.data);if(null!==d)return void K(d);if(l=a.data,q.safeParse(l).success)return void H(a.data.scrolled);if(t||(s=a.data,!z.safeParse(s).success))return;t=!0;let f=new MessageChannel;I.current=f.port1,e.postMessage({type:"grok-bot-page:render",document:$()},"*",[f.port2])};return window.addEventListener("message",a),e.postMessage({type:"grok-bot-page:probe"},"*"),()=>{r=!0,I.current?.close(),I.current=null,window.removeEventListener("message",a),H(!1)}},y[13]=M,y[14]=$,y[15]=K,y[16]=H,y[17]=R,y[18]=s):s=y[18],y[19]===Symbol.for("react.memo_cache_sentinel")?(u=[],y[19]=u):u=y[19],(0,ei.useEffect)(s,u),y[20]!==v.contentKey||y[21]!==x?(f=()=>{let e=A.current;e!==x&&(A.current=x,es.has(v.contentKey)||es.set(v.contentKey,e),I.current?.postMessage({type:Y,title:x,previousTitle:e}))},m=[x,v.contentKey],y[20]=v.contentKey,y[21]=x,y[22]=f,y[23]=m):(f=y[22],m=y[23]),(0,ei.useEffect)(f,m),y[24]!==b?(h={colorScheme:b},y[24]=b,y[25]=h):h=y[25],y[26]!==h||y[27]!==x?(g=(0,t.jsx)("iframe",{ref:O,title:x,src:"/bot-page",sandbox:N,referrerPolicy:"no-referrer",className:"block size-full border-0",style:h}),y[26]=h,y[27]=x,y[28]=g):g=y[28],g}function ed(e){(0,ea.W)("BotPageFrame:answerRuntimes",e)}e.s(["f",0,ec],8552824);var ef=e.i(2136015),ep=e.i(9333196);e.i(7866742);var em=e.i(8103987),eh=e.i(919432);e.i(3778443);var eg=e.i(8679187),ey=e.i(238963);e.i(9337504);var ev=e.i(2910017);function eb(e){return e.replace(/\s+/g," ").trim().slice(0,200).trimEnd()}var ex=e.i(7671246);function ew(e){let r,a,o,i,l,s,c,u=(0,n.c)(12),{size:d}=e,f=void 0===d?"md":d,p="md"===f?"size-10":"size-6";u[0]!==p?(r=(0,ex.c)("inline-flex shrink-0 items-center justify-center",p),u[0]=p,u[1]=r):r=u[1];let m="sm"===f&&"scale-[0.6]";return u[2]!==m?(a=(0,ex.c)("flex h-10 w-8 shrink-0 flex-col overflow-hidden rounded-md bg-surface-elevated shadow-[0_2px_6px_rgb(0_0_0/0.06)] ring-[0.5px] ring-fg-primary/12",m),u[2]=m,u[3]=a):a=u[3],u[4]===Symbol.for("react.memo_cache_sentinel")?(o=(0,t.jsx)("span",{className:"h-1 shrink-0 rounded-xs bg-fg-primary/18"}),i=(0,t.jsx)("span",{className:"h-1 w-[calc(50%_-_1px)] shrink-0 rounded-xs bg-fg-primary/18"}),u[4]=o,u[5]=i):(o=u[4],i=u[5]),u[6]===Symbol.for("react.memo_cache_sentinel")?(l=(0,t.jsxs)("span",{className:"flex min-h-0 grow flex-col gap-0.75 p-1",children:[o,i,(0,t.jsxs)("span",{className:"flex grow items-end justify-between",children:[(0,t.jsx)("span",{className:"h-2 w-1 rounded-xs bg-fg-success"}),(0,t.jsx)("span",{className:"h-2 w-1 rounded-xs bg-fg-warning"}),(0,t.jsx)("span",{className:"h-3 w-1 rounded-xs bg-fg-orange"}),(0,t.jsx)("span",{className:"h-4.5 w-1 rounded-xs bg-fg-accent"})]})]}),u[6]=l):l=u[6],u[7]!==a?(s=(0,t.jsx)("span",{className:a,children:l}),u[7]=a,u[8]=s):s=u[8],u[9]!==r||u[10]!==s?(c=(0,t.jsx)("span",{"aria-hidden":!0,className:r,children:s}),u[9]=r,u[10]=s,u[11]=c):c=u[11],c}e.s(["f",0,ew],9202366);var ek=e.i(1295507),eE=e.i(4292823);function ej(e){let r,a,o,i,s,c,u,d,f,p=(0,n.c)(66),{locator:m,title:h,canRename:g,look:y}=e,{t:v}=(0,ev.f)("bots"),b=(0,l.P)();p[0]!==m||p[1]!==h?(r={locator:m,title:h},p[0]=m,p[1]=h,p[2]=r):r=p[2];let{displayTitle:x,rename:w}=function(e){let t,r,a,o,i,l,s,c,u,d,f,p,m=(0,n.c)(37),{locator:h,title:g}=e,{t:y}=(0,ev.f)("bots"),v=(0,ey.d)(),b=(0,ep.s)();if(m[0]!==h)t=`${h.storeId}:${h.canvasId}`,m[0]=h,m[1]=t;else t=m[1];let x=t;m[2]!==h.canvasId||m[3]!==h.storeId?(r=em.f.pages(h.storeId,h.canvasId),m[2]=h.canvasId,m[3]=h.storeId,m[4]=r):r=m[4];let w=r,[k,E]=(0,ei.useState)(null);m[5]===Symbol.for("react.memo_cache_sentinel")?(a=new Map,m[5]=a):a=m[5];let j=(0,ei.useRef)(a);null!==k&&(k.key!==x||k.settled&&g!==k.baseTitle)&&E(null),m[6]!==v?(o=(e,t)=>{let n=j.current.get(e);if(void 0!==n)return n;let r={attempt:0,inFlight:0,confirmedTitle:null,confirmedAttempt:0,baseline:v.getQueriesData({queryKey:t})};return j.current.set(e,r),r},m[6]=v,m[7]=o):o=m[7];let S=o;m[8]!==v?(i=(e,t)=>v.setQueriesData({queryKey:em.f.pages(e.storeId,e.canvasId)},e=>e?.status==="ready"?{...e,title:t}:e),m[8]=v,m[9]=i):i=m[9];let C=i,T=null!==k&&k.key===x&&g===k.baseTitle?k.next:g;m[10]!==v?(l=async e=>{let{locator:t,next:n}=e;return await v.cancelQueries({queryKey:em.f.pages(t.storeId,t.canvasId)}),eh.f.renameCanvas({...t,title:n})},m[10]=v,m[11]=l):l=m[11],m[12]!==C?(s=(e,t)=>{let{locator:n,pageKey:r,attempt:a}=t,o=j.current.get(r);o&&(a>=o.confirmedAttempt&&(o.confirmedAttempt=a,o.confirmedTitle=e.title),a===o.attempt&&(C(n,e.title),E(t=>null!==t&&t.key===r&&t.attempt===a?{...t,next:e.title,settled:!0}:t)))},m[12]=C,m[13]=s):s=m[13],m[14]!==b||m[15]!==v||m[16]!==C||m[17]!==y?(c=(e,t)=>{let{locator:n,pageKey:r,attempt:a}=t;b("BotPageRename:renameCanvas",e,y("page-rename.failed","Couldn't rename this page. Try again."));let o=j.current.get(r);if(o&&a===o.attempt){if(E(e=>null!==e&&e.key===r&&e.attempt===a?null:e),null!==o.confirmedTitle)return void C(n,o.confirmedTitle);for(let[e,t]of o.baseline)v.setQueryData(e,t)}},m[14]=b,m[15]=v,m[16]=C,m[17]=y,m[18]=c):c=m[18],m[19]===Symbol.for("react.memo_cache_sentinel")?(u=(e,t,n)=>{let{pageKey:r}=n,a=j.current.get(r);a&&(a.inFlight=Math.max(0,a.inFlight-1))},m[19]=u):u=m[19],m[20]!==l||m[21]!==s||m[22]!==c?(d={mutationFn:l,onSuccess:s,onError:c,onSettled:u},m[20]=l,m[21]=s,m[22]=c,m[23]=d):d=m[23];let{mutate:L}=(0,eg.f)(d);return m[24]!==T||m[25]!==h||m[26]!==L||m[27]!==x||m[28]!==w||m[29]!==v||m[30]!==C||m[31]!==S||m[32]!==g?(f=e=>{let t=eb(e);if(""===t||t===eb(T))return;let n=S(x,w);0===n.inFlight&&(n.confirmedTitle=null,n.confirmedAttempt=0,n.baseline=v.getQueriesData({queryKey:w})),n.inFlight=n.inFlight+1;let r=n.attempt+1;n.attempt=r,E({key:x,baseTitle:g,next:t,attempt:r,settled:!1}),v.cancelQueries({queryKey:w}),C(h,t),L({locator:h,pageKey:x,next:t,attempt:r})},m[24]=T,m[25]=h,m[26]=L,m[27]=x,m[28]=w,m[29]=v,m[30]=C,m[31]=S,m[32]=g,m[33]=f):f=m[33],m[34]!==T||m[35]!==f?(p={displayTitle:T,rename:f},m[34]=T,m[35]=f,m[36]=p):p=m[36],p}(r),[k,E]=(0,ei.useState)(null),j=(0,ei.useRef)(!1),S=(0,ei.useRef)(!1),C=(0,ei.useRef)(!1),T=(0,ei.useRef)(null),L=(0,ei.useRef)(null),_=(0,ei.useId)(),O="pill"===(void 0===y?"dialog":y),I=g&&null!==k,P=O?"text-sm font-medium text-fg-primary":"text-base font-semibold leading-6 tracking-tight text-fg-primary";if(p[3]!==k?(a=()=>{null===k&&C.current&&(C.current=!1,T.current?.focus({preventScroll:!0}))},o=[k],p[3]=k,p[4]=a,p[5]=o):(a=p[4],o=p[5]),(0,ei.useLayoutEffect)(a,o),O){let e,n;return p[6]===Symbol.for("react.memo_cache_sentinel")?(e=(0,t.jsx)(ew,{size:"sm"}),p[6]=e):e=p[6],p[7]!==g||p[8]!==b.bots.PageTitlePill||p[9]!==x||p[10]!==w?(n=(0,t.jsx)(b.bots.PageTitlePill,{canRename:g,glyph:e,maxLength:200,onRename:w,title:x}),p[7]=g,p[8]=b.bots.PageTitlePill,p[9]=x,p[10]=w,p[11]=n):n=p[11],n}p[12]!==x?(i=()=>{j.current=!1,S.current=!1,E(x)},p[12]=x,p[13]=i):i=p[13];let N=i;p[14]!==w?(s=e=>{if(S.current)return;S.current=!0;let t=j.current;j.current=!1,E(null),t||w(e)},p[14]=w,p[15]=s):s=p[15];let A=s;p[16]!==A?(c=e=>{e.nativeEvent.isComposing||("Enter"===e.key||"Escape"===e.key)&&(e.preventDefault(),e.stopPropagation(),j.current="Escape"===e.key,C.current=!0,A(e.currentTarget.value))},p[16]=A,p[17]=c):c=p[17];let $=c;p[18]!==O?(u=O?(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex shrink-0 text-fg-secondary",children:(0,t.jsx)(ek.f,{size:4})}):(0,t.jsx)(ew,{size:"sm"}),p[18]=O,p[19]=u):u=p[19];let M=u;if(O){let e,n,r,a,o,i=I||void 0;p[20]!==I?(e=e=>{I&&e.target!==L.current&&(e.preventDefault(),L.current?.focus({preventScroll:!0}))},p[20]=I,p[21]=e):e=p[21],p[22]!==g||p[23]!==I||p[24]!==N?(n=e=>{!g||I||e.target instanceof Element&&e.target.closest("button")||N()},p[22]=g,p[23]=I,p[24]=N,p[25]=n):n=p[25];let l=g&&"cursor-text";return p[26]!==l?(r=(0,ex.c)("group/pill inline-flex h-[38px] max-w-[min(420px,46vw)] min-w-0 items-center gap-1.5 rounded-full border border-border-l2 bg-surface-base px-3",l),p[26]=l,p[27]=r):r=p[27],p[28]!==g||p[29]!==x||p[30]!==k||p[31]!==A||p[32]!==_||p[33]!==I||p[34]!==$||p[35]!==N||p[36]!==v||p[37]!==P?(a=g?(0,t.jsxs)("span",{className:(0,ex.c)("-mx-1.5 inline-flex h-7 min-w-0 items-center rounded-lg px-1.5 transition-colors duration-140 ease-[ease]",I?"bg-button-secondary-fill-hover":"group-hover/pill:bg-button-secondary-fill-hover has-focus-visible:ring-2 has-focus-visible:ring-fg-accent"),children:[I?(0,t.jsx)("input",{ref:L,type:"text","aria-label":v("page-title.input.aria-label","Page title"),placeholder:v("page-title.input.placeholder","Untitled page"),autoFocus:!0,maxLength:200,spellCheck:!1,value:k,onChange:e=>E(e.currentTarget.value),onFocus:eC,onBlur:e=>A(e.currentTarget.value),onKeyDown:$,className:(0,ex.c)("field-sizing-content max-w-full min-w-6 bg-transparent p-0 outline-none placeholder:text-fg-tertiary",P)}):(0,t.jsxs)("button",{type:"button",ref:T,"aria-describedby":_,title:x,onClick:N,className:"flex min-w-0 cursor-text items-center bg-transparent p-0 outline-hidden",children:[(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",P),children:x}),(0,t.jsx)("span",{hidden:!0,id:_,children:v("page-title.rename-btn.description","Rename page")})]}),(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex max-w-0 shrink-0 overflow-hidden text-fg-secondary opacity-0 transition-[max-width,opacity,margin-inline-start] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover/pill:ms-2 group-hover/pill:max-w-3 group-hover/pill:opacity-100 group-has-focus-visible/pill:ms-2 group-has-focus-visible/pill:max-w-3 group-has-focus-visible/pill:opacity-100 group-data-[editing]/pill:ms-2 group-data-[editing]/pill:max-w-3 group-data-[editing]/pill:opacity-100 pointer-coarse:ms-2 pointer-coarse:max-w-3 pointer-coarse:opacity-100",children:(0,t.jsx)(eE.f,{size:3})})]}):(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",P),children:x}),p[28]=g,p[29]=x,p[30]=k,p[31]=A,p[32]=_,p[33]=I,p[34]=$,p[35]=N,p[36]=v,p[37]=P,p[38]=a):a=p[38],p[39]!==M||p[40]!==e||p[41]!==n||p[42]!==r||p[43]!==a||p[44]!==i?(o=(0,t.jsxs)("span",{"data-testid":"bot-page-title-chip","data-editing":i,onMouseDown:e,onClick:n,className:r,children:[M,a]}),p[39]=M,p[40]=e,p[41]=n,p[42]=r,p[43]=a,p[44]=i,p[45]=o):o=p[45],o}if(!g){let e,n,r;return p[46]!==P?(e=(0,ex.c)("min-w-0 truncate",P),p[46]=P,p[47]=e):e=p[47],p[48]!==x||p[49]!==e?(n=(0,t.jsx)("span",{className:e,children:x}),p[48]=x,p[49]=e,p[50]=n):n=p[50],p[51]!==M||p[52]!==n?(r=(0,t.jsxs)("span",{"aria-hidden":!0,className:"flex h-6 min-w-0 flex-1 items-center gap-2",children:[M,n]}),p[51]=M,p[52]=n,p[53]=r):r=p[53],r}return p[54]!==x||p[55]!==k||p[56]!==A||p[57]!==_||p[58]!==$||p[59]!==N||p[60]!==v||p[61]!==P?(d=null===k?(0,t.jsxs)("button",{type:"button",ref:T,"aria-describedby":_,title:x,onClick:N,className:(0,ex.c)("group/title -mx-1.5 flex h-8 min-w-0 cursor-text items-center gap-1.5 rounded-lg px-1.5 outline-hidden","transition-colors duration-140 ease-[ease] hover:bg-button-secondary-fill-hover","focus-visible:ring-1",ef.F),children:[(0,t.jsx)("span",{className:(0,ex.c)("min-w-0 truncate",P),children:x}),(0,t.jsx)("span",{"aria-hidden":!0,className:"inline-flex shrink-0 text-fg-secondary opacity-0 transition-opacity duration-140 group-hover/title:opacity-100 group-focus-visible/title:opacity-100 pointer-coarse:opacity-100",children:(0,t.jsx)(eE.f,{size:3})}),(0,t.jsx)("span",{hidden:!0,id:_,children:v("page-title.rename-btn.description","Rename page")})]}):(0,t.jsx)("span",{className:"-mx-1.5 flex h-8 min-w-0 items-center rounded-lg bg-button-secondary-fill-hover px-1.5",children:(0,t.jsx)("input",{type:"text","aria-label":v("page-title.input.aria-label","Page title"),placeholder:v("page-title.input.placeholder","Untitled page"),autoFocus:!0,maxLength:200,spellCheck:!1,value:k,onChange:e=>E(e.currentTarget.value),onFocus:eS,onBlur:e=>A(e.currentTarget.value),onKeyDown:$,className:(0,ex.c)("field-sizing-content max-w-full min-w-6 bg-transparent outline-none placeholder:text-fg-tertiary",P)})}),p[54]=x,p[55]=k,p[56]=A,p[57]=_,p[58]=$,p[59]=N,p[60]=v,p[61]=P,p[62]=d):d=p[62],p[63]!==M||p[64]!==d?(f=(0,t.jsxs)("span",{className:"flex h-6 min-w-0 flex-1 items-center gap-2",children:[M,d]}),p[63]=M,p[64]=d,p[65]=f):f=p[65],f}function eS(e){return e.currentTarget.select()}function eC(e){return e.currentTarget.select()}let eT=new Set(["cursor.com","www.cursor.com"]),eL="cursor.com/canvas/",e_=/\[([^\]\n]*)\]\(([^()\s]+)\)|https:\/\/(?:www\.)?cursor\.com\/canvas\/[^\s/()<>\]]+\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}(?![0-9a-z%/?#_-])/gi,eO=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,eI=/^[a-z][a-z0-9]*-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;function eP(e){let t,n;if(!e.includes(eL))return null;let r=e.trim(),a=URL.canParse(r)?new URL(r):null;if(null==a||"https:"!==a.protocol||!eT.has(a.hostname)||""!==a.port||""!==a.username||""!==a.password||""!==a.search||""!==a.hash)return null;let o=a.pathname.split("/");if(4!==o.length||""!==o[0]||"canvas"!==o[1])return null;let i=(t=(o[2]??"").trim(),eI.test(t)?t:null),l=(n=(o[3]??"").trim().toLowerCase(),eO.test(n)?n:null);return null==i||null==l?null:{storeId:i,canvasId:l}}function eN(e){if(!e.includes(eL))return null;let t=null;for(let n of e.matchAll(e_)){let e=(n[2]??n[0]).trim(),r=eP(e);if(null!=r){if(null!=t)return null;t={locator:r,label:n[1]?.trim()||null,href:e,matchStart:n.index,matchEnd:n.index+n[0].length}}}return t}function eA(e,t){return 0===e.slice(0,t.matchStart).trim().length&&0===e.slice(t.matchEnd).trim().length}e.s(["u",0,eN,"U",0,eA,"W",0,eP],2603225);let e$=new WeakMap;function eM(e){if("bot_message"!==e.kind)return null;let t=e$.get(e);if(void 0!==t)return t;let n=function(e){let t=eN(e.text);if(null==t)return null;let n=null!=e.images&&e.images.length>0;return{link:t,isStandalone:eA(e.text,t)&&!n}}(e);return e$.set(e,n),n}function eR(e,t){for(let n=e.length-1;n>=0;n-=1){let r=e[n];if(void 0!==r&&eM(r)?.link.locator.canvasId===t)return r.entryId}return null}e.s(["I",0,eM,"q",0,eR],5814441);class eU extends Error{}async function ez(e){let t=new Blob([function(e){let{buffer:t}=e;return t instanceof ArrayBuffer?new Uint8Array(t,e.byteOffset,e.byteLength):Uint8Array.from(e)}(e)]).stream().pipeThrough(new DecompressionStream("gzip")).getReader(),n=[],r=0;for(;;){let e=await t.read();if(e.done)break;if((r+=e.value.byteLength)>2e7)throw await t.cancel(),new eU;n.push(e.value)}let a=new Uint8Array(r),o=0;for(let e of n)a.set(e,o),o+=e.byteLength;return a}let eK=g.z.object({version:y.z.literal(1),runtimeEsm:H.z.string(),userModule:H.z.string()});async function eH(e){let t;if(0===e.byteLength)return{isDecoded:!1,errorClass:"empty"};if(e.byteLength>5e6)return{isDecoded:!1,errorClass:"compressed-too-large"};try{t=new TextDecoder("utf-8",{fatal:!0}).decode(await ez(e))}catch(e){return{isDecoded:!1,errorClass:function(e){if(e instanceof eU)return"decompressed-too-large";if(!(e instanceof Error))return typeof e;let t="code"in e&&"string"==typeof e.code?e.code:null;return null!=t&&t.length>0?`${e.name} (${t})`:e.name}(e)}}let n=function(e){let t=e.trimStart();if(!t.startsWith("{"))return null;try{let e=eK.safeParse(JSON.parse(t));return e.success?e.data.userModule:null}catch{return null}}(t);return null!==n?{isDecoded:!0,bundleJsonText:t,userModule:n}:{isDecoded:!1,errorClass:"invalid-bundle"}}var eB=e.i(5530262),eF=e.i(5967225),eD=e.i(9415910),eq=e.i(6630418),eW=e.i(3003272),eV=e.i(2830736),eJ=e.i(2461599),eQ=e.i(2286875);let eG=new Set(["compressed-too-large","decompressed-too-large"]),eY={status:"unavailable"},eZ=eJ.z.record(H.z.string(),eQ.z.unknown());async function eX(e,t){let n=new TextEncoder().encode(t),r=new Uint8Array(e.byteLength+n.byteLength);return r.set(e),r.set(n,e.byteLength),Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",r)),e=>e.toString(16).padStart(2,"0")).join("")}async function e0({locator:e,groupChatId:t}){var n;let r=await eh.f.getCanvasPayload({storeId:e.storeId,canvasId:e.canvasId,...null===t?{}:{groupChatId:t}});if("ok"!==r.status)return{status:r.status};let{metadata:a}=r;if(void 0!==a&&(a.storeId!==e.storeId||a.canvasId!==e.canvasId))return eY;let o=function(e){if(!e)return"{}";try{return eZ.safeParse(JSON.parse(e)).success?e:null}catch{return null}}(r.dataJson),i=function(e){try{return new Uint8Array((0,eF.D)(e))}catch{return null}}(r.renderBundleGzip);if(null===o||null===i)return eY;let l=await eH(i);if(!l.isDecoded)return eG.has(l.errorClass)?{status:"too_large"}:eY;let s=(n=l.userModule,j.filter(([,e])=>e.test(n)).map(([e])=>e));return{status:"ready",title:a?.title??null,bundleJsonText:l.bundleJsonText,dataJsonText:o,contentKey:await eX(i,o),...0===s.length?{}:{runtimes:s}}}function e1(e){let t,r,a=(0,n.c)(6),{agentId:o,locator:i,revision:l}=e;a[0]!==o?(t=e=>e.agents.find(e=>e.agentId===o)?.isGroup===!0,a[0]=o,a[1]=t):t=a[1];let s=(0,eB.f)(t)?o:null;a[2]!==i||a[3]!==l||a[4]!==s?(r=function({locator:e,groupChatId:t,revision:n}){return(0,eW.f)({queryKey:em.f.page(e.storeId,e.canvasId,t,n),queryFn:()=>e0({locator:e,groupChatId:t}),staleTime:6e4,placeholderData:eq.y,retry:(e,t)=>e<1&&(0,eD.iB)(t)})}({locator:i,groupChatId:s,revision:l}),a[2]=i,a[3]=l,a[4]=s,a[5]=r):r=a[5];let{data:c,isError:u}=(0,eV.f)(r);return c??(u?eY:void 0)}function e2(e,t){let r,a,o,i,l,s,c,u,d=(0,n.c)(25),f=void 0===t||t,{t:p}=(0,ev.f)("bots"),m=(0,ey.d)(),h=(0,ep.s)();d[0]!==e.canvasId||d[1]!==e.storeId?(r=em.f.pageShare(e.storeId,e.canvasId),d[0]=e.canvasId,d[1]=e.storeId,d[2]=r):r=d[2];let g=r;d[3]!==e?(a=async()=>(await eh.f.getCanvasMetadata(e))?.owner??null,d[3]=e,d[4]=a):a=d[4],d[5]!==f||d[6]!==g||d[7]!==a?(o={queryKey:g,queryFn:a,enabled:f,retry:!1},d[5]=f,d[6]=g,d[7]=a,d[8]=o):o=d[8];let{data:y}=(0,eV.f)(o);d[9]!==e?(i=t=>eh.f.setCanvasVisibility({...e,visibility:t,..."team_view"===t?{openToTeam:!0}:{}}),d[9]=e,d[10]=i):i=d[10],d[11]!==m||d[12]!==g?(l=e=>{m.setQueryData(g,t=>{if(null==t)return t;let{pageUrl:n,...r}=t;return{...r,...e}})},d[11]=m,d[12]=g,d[13]=l):l=d[13],d[14]!==h||d[15]!==p?(s=e=>{h("BotPageShare:setVisibility",e,p("page-share.update.failed","Couldn't change who can open this page. Try again."))},d[14]=h,d[15]=p,d[16]=s):s=d[16],d[17]!==i||d[18]!==l||d[19]!==s?(c={mutationFn:i,onSuccess:l,onError:s},d[17]=i,d[18]=l,d[19]=s,d[20]=c):c=d[20];let{mutate:v,isPending:b}=(0,eg.f)(c);return d[21]!==b||d[22]!==v||d[23]!==y?(u={owner:y,setVisibility:v,isUpdating:b},d[21]=b,d[22]=v,d[23]=y,d[24]=u):u=d[24],u}e.s(["f",0,e1],188593);var e3=e.i(4939445),e4=e.i(481778),e6=e.i(2777665),e5=e.i(8818862),e8=e.i(7026337),e9=e.i(6307696),e7=e.i(6348076),te=e.i(1682626),tt=e.i(1404024),tn=e.i(7302423),tr=e.i(8674340),ta=e.i(8171567);function to(e){let r,a,o,i=(0,n.c)(11),{locator:s,title:c,href:u}=e,d=(0,l.P)(),{owner:f,setVisibility:p,isUpdating:m}=e2(s);if(null==f)return null;i[0]!==d.bots.PageShareButton?(r=(0,t.jsx)(e9.J,{render:(0,t.jsx)(d.bots.PageShareButton,{})}),i[0]=d.bots.PageShareButton,i[1]=r):r=i[1];let h=f.pageUrl??u;return i[2]!==m||i[3]!==f||i[4]!==p||i[5]!==h||i[6]!==c?(a=(0,t.jsx)(e9.T,{align:"end",sideOffset:8,size:"xl",padding:"none",children:(0,t.jsx)(ti,{owner:f,title:c,link:h,isUpdating:m,onVisibilityChange:p})}),i[2]=m,i[3]=f,i[4]=p,i[5]=h,i[6]=c,i[7]=a):a=i[7],i[8]!==r||i[9]!==a?(o=(0,t.jsxs)(e9.V,{modal:!0,children:[r,a]}),i[8]=r,i[9]=a,i[10]=o):o=i[10],o}function ti({owner:e,title:r,link:o,isUpdating:i,onVisibilityChange:l}){let{t:s}=(0,ev.f)("bots"),{user:c,team:u}=(0,a.useSession)(),d=[c?.givenName,c?.familyName].filter(Boolean).join(" ")||c?.email||s("page-share.owner.fallback-name","You"),f=function(e,t){let r,a,o,i,l,s,c,u=(0,n.c)(24),{t:d}=(0,ev.f)("bots"),f=e.canShareToTeam||e.teamShareBlockedByAdmin||"team_view"===e.visibility;u[0]!==e.teamShareBlockedByAdmin||u[1]!==d||u[2]!==t?(r=e.teamShareBlockedByAdmin?d("page-share.team.blocked-description","Your team admin turned off team sharing"):t?d("page-share.team.description","Everyone at {{teamName}}",{teamName:t}):d("page-share.team.fallback-description","Everyone on your team"),u[0]=e.teamShareBlockedByAdmin,u[1]=d,u[2]=t,u[3]=r):r=u[3];let p=r;return u[4]!==d?(a=d("page-share.private.label","Only you"),u[4]=d,u[5]=a):a=u[5],u[6]!==d?(o=d("page-share.private.description","Only you can open this page"),u[6]=d,u[7]=o):o=u[7],u[8]!==a||u[9]!==o?(i={value:"private",label:a,description:o,Icon:ta.f,disabled:!1},u[8]=a,u[9]=o,u[10]=i):i=u[10],u[11]!==e.canShareToTeam||u[12]!==f||u[13]!==d||u[14]!==p||u[15]!==t?(l=f?{value:"team_view",label:t||d("page-share.team.fallback-label","Your team"),description:p,Icon:tr.f,disabled:!e.canShareToTeam}:null,u[11]=e.canShareToTeam,u[12]=f,u[13]=d,u[14]=p,u[15]=t,u[16]=l):l=u[16],u[17]!==e.visibility||u[18]!==d?(s="public"===e.visibility?{value:"public",label:d("page-share.public.label","Anyone with the link"),description:d("page-share.public.description","Anyone with the link can open this page"),Icon:tt.f,disabled:!0}:null,u[17]=e.visibility,u[18]=d,u[19]=s):s=u[19],u[20]!==i||u[21]!==l||u[22]!==s?(c=[i,l,s].filter(tl),u[20]=i,u[21]=l,u[22]=s,u[23]=c):c=u[23],c}(e,u?.name);return(0,t.jsxs)("div",{className:"flex flex-col gap-4 p-4",children:[(0,t.jsx)("p",{className:"line-clamp-2 break-words text-base font-semibold leading-6 tracking-tight text-fg-primary",children:s("page-share.heading","Share “{{title}}”",{title:r})}),(0,t.jsxs)("div",{className:"flex items-center gap-3 border border-transparent px-2",children:[(0,t.jsx)(e7.f,{name:d,imageUrl:c?.profileImageUrl,size:32}),(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate text-sm text-fg-primary",children:d}),(0,t.jsx)("span",{className:"shrink-0 text-sm text-fg-tertiary",children:s("page-share.owner.label","Owner")})]}),(0,t.jsx)(tc,{value:e.visibility,options:f,disabled:i,onChange:l}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-2",children:[(0,t.jsx)(tu,{link:o}),(0,t.jsxs)(e6.K,{render:(0,t.jsx)("a",{href:o,target:"_blank",rel:"noopener noreferrer"}),variant:"outline",size:"xl",shape:"pill",children:[(0,t.jsx)(te.f,{size:4}),s("page-share.open-in-new-tab-btn.label","Open in new tab")]})]})]})}function tl(e){return null!==e}function ts(e){let r,a=(0,n.c)(2),{Icon:o}=e;return a[0]!==o?(r=(0,t.jsx)("span",{"aria-hidden":!0,className:"flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-l2 text-fg-secondary",children:(0,t.jsx)(o,{size:4})}),a[0]=o,a[1]=r):r=a[1],r}function tc(e){let r,a,o,i,l,s,c,u,d,f,p,m,h,g,y,v,b,x,w=(0,n.c)(49),{value:k,options:E,disabled:j,onChange:S}=e,{t:C}=(0,ev.f)("bots"),[T,L]=(0,ei.useState)(!1);if(w[0]!==j||w[1]!==T||w[2]!==E||w[3]!==C||w[4]!==k){let e;w[14]!==k?(e=e=>e.value===k,w[14]=k,w[15]=e):e=w[15],o=E.find(e),a=e5.G,c=T,u=L,d=!1,r=e5.X,i="button",l=j,s=C("page-share.visibility-trigger.aria-label","Who can open: {{access}}",{access:o?.label??""}),w[0]=j,w[1]=T,w[2]=E,w[3]=C,w[4]=k,w[5]=r,w[6]=a,w[7]=o,w[8]=i,w[9]=l,w[10]=s,w[11]=c,w[12]=u,w[13]=d}else r=w[5],a=w[6],o=w[7],i=w[8],l=w[9],s=w[10],c=w[11],u=w[12],d=w[13];w[16]===Symbol.for("react.memo_cache_sentinel")?(f=(0,ex.c)("flex w-full items-center gap-3 rounded-xl border border-border-l1 px-2 py-1.5 text-start","transition-colors hover:bg-surface-l2 data-[state=open]:bg-surface-l2","disabled:cursor-not-allowed disabled:opacity-50"),w[16]=f):f=w[16],w[17]!==i||w[18]!==l||w[19]!==s?(p=(0,t.jsx)("button",{type:i,disabled:l,"aria-label":s,className:f}),w[17]=i,w[18]=l,w[19]=s,w[20]=p):p=w[20],w[21]!==o?(m=o?(0,t.jsx)(ts,{Icon:o.Icon}):null,w[21]=o,w[22]=m):m=w[22];let _=o?.label;if(w[23]!==_?(h=(0,t.jsx)("span",{className:"min-w-0 flex-1 truncate text-sm font-medium text-fg-primary",children:_}),w[23]=_,w[24]=h):h=w[24],w[25]!==T?(g=(0,t.jsx)(e8.f,{open:T,size:4,tone:"secondary"}),w[25]=T,w[26]=g):g=w[26],w[27]!==r||w[28]!==h||w[29]!==g||w[30]!==p||w[31]!==m?(y=(0,t.jsxs)(r,{render:p,children:[m,h,g]}),w[27]=r,w[28]=h,w[29]=g,w[30]=p,w[31]=m,w[32]=y):y=w[32],w[33]!==S||w[34]!==E||w[35]!==k){let e;w[37]!==S||w[38]!==k?(e=e=>(0,t.jsx)(e5.r,{disabled:e.disabled,onClick:()=>{e.value!==k&&S(e.value)},trailing:e.value===k&&(0,t.jsx)(tn.f,{size:4}),children:(0,t.jsxs)("span",{className:"flex min-w-0 items-center gap-3 py-1",children:[(0,t.jsx)(ts,{Icon:e.Icon}),(0,t.jsxs)("span",{className:"flex min-w-0 flex-col",children:[(0,t.jsx)("span",{className:"truncate text-sm text-fg-primary",children:e.label}),(0,t.jsx)("span",{className:"truncate text-xs text-fg-tertiary",children:e.description})]})]})},e.value),w[37]=S,w[38]=k,w[39]=e):e=w[39],v=E.map(e),w[33]=S,w[34]=E,w[35]=k,w[36]=v}else v=w[36];return w[40]!==v?(b=(0,t.jsx)(e5.L,{align:"start",width:"anchor",children:v}),w[40]=v,w[41]=b):b=w[41],w[42]!==a||w[43]!==y||w[44]!==b||w[45]!==c||w[46]!==u||w[47]!==d?(x=(0,t.jsxs)(a,{open:c,onOpenChange:u,modal:d,children:[y,b]}),w[42]=a,w[43]=y,w[44]=b,w[45]=c,w[46]=u,w[47]=d,w[48]=x):x=w[48],x}function tu(e){let r,a,o,i,l,s=(0,n.c)(17),{link:c}=e,{t:u}=(0,ev.f)("bots"),{ref:d,isCopied:f,play:p}=(0,e3.V)();return s[0]!==f||s[1]!==u?(r=f?u("page-share.copy-link-btn.copied","Copied"):void 0,s[0]=f,s[1]=u,s[2]=r):r=s[2],s[3]!==f||s[4]!==c||s[5]!==p||s[6]!==u?(a=()=>{f||navigator.clipboard.writeText(c).then(p,()=>e4.f.error(u("page-share.copy-link.failed","Couldn't copy the link")))},s[3]=f,s[4]=c,s[5]=p,s[6]=u,s[7]=a):a=s[7],s[8]!==d?(o=(0,t.jsx)(e3.l,{ref:d,size:16}),s[8]=d,s[9]=o):o=s[9],s[10]!==u?(i=u("page-share.copy-link-btn.label","Copy link"),s[10]=u,s[11]=i):i=s[11],s[12]!==r||s[13]!==a||s[14]!==o||s[15]!==i?(l=(0,t.jsxs)(e6.K,{type:"button",variant:"outline",size:"xl",shape:"pill","aria-label":r,onClick:a,children:[o,i]}),s[12]=r,s[13]=a,s[14]=o,s[15]=i,s[16]=l):l=s[16],l}let td=null,tf=new Set;function tp(e){for(let t of(td=e,tf))t()}function tm(){null!==td&&((0,o.C)(),tp(null))}function th(){return(0,ei.useSyncExternalStore)(tv,ty,tg)}function tg(){return null}function ty(){return td}function tv(e){return tf.add(e),()=>tf.delete(e)}function tb(e){let o,s,c,u,d,f,p,m,h,g,y,v,b,x,w,k,E,j,S=(0,n.c)(53),{request:C}=e,{t:T}=(0,ev.f)("bots"),L=(0,l.P)(),_=(0,ei.use)(L.StageLayer)?.spanPane;S[0]!==_?(o=()=>_?.(),s=[_],S[0]=_,S[1]=o,S[2]=s):(o=S[1],s=S[2]),(0,ei.useLayoutEffect)(o,s);let O=(0,i.I)(),I=(0,r.Y)(),{user:P}=(0,a.useSession)(),N=(I.ENABLE_UNIFIED_IMAGINE_SIDEBAR||!I.DISABLE_CONVERSATION_SEARCH)&&(null!=P||!I.DESKTOP_UI_LOGGED_OUT_LAYOUT);S[3]!==C.agentId||S[4]!==C.locator.canvasId?(c=e=>eR(e.transcriptsByAgentId[C.agentId]?.entries??[],C.locator.canvasId),S[3]=C.agentId,S[4]=C.locator.canvasId,S[5]=c):c=S[5];let A=(0,eB.f)(c)??C.revision;S[6]!==C.agentId||S[7]!==C.locator||S[8]!==A?(u={agentId:C.agentId,locator:C.locator,revision:A},S[6]=C.agentId,S[7]=C.locator,S[8]=A,S[9]=u):u=S[9];let $=e1(u),M=$?.status==="ready",{owner:R}=e2(C.locator,M),[U,z]=(0,ei.useState)(!1);S[10]!==M||S[11]!==$||S[12]!==T?(d=(M?$.title:null)??T("page-card.title-fallback","Page"),S[10]=M,S[11]=$,S[12]=T,S[13]=d):d=S[13];let K=d;if(S[14]===Symbol.for("react.memo_cache_sentinel")?(f=[],S[14]=f):f=S[14],(0,ei.useEffect)(tx,f),S[15]!==N||S[16]!==O)p={"--bot-page-leading-inset":`max(var(--grok-space-3, 12px), calc(${N?"calc(var(--grok-traffic-light-clearance, 0px) + var(--grok-space-3, 12px) + 2 * var(--grok-control-height-lg, 32px) + var(--grok-space-0-5, 2px) + var(--grok-space-2, 8px))":"calc(var(--grok-traffic-light-clearance, 0px) + var(--grok-space-3, 12px) + var(--grok-control-height-lg, 32px) + var(--grok-space-2, 8px))"} - ${O}px))`},S[15]=N,S[16]=O,S[17]=p;else p=S[17];let H=U&&"after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-border-l1";S[18]!==H?(m=(0,ex.c)("relative grid h-(--grok-chrome-height,56px) shrink-0 grid-cols-[minmax(var(--bot-page-leading-inset),1fr)_minmax(0,auto)_minmax(auto,1fr)] items-center gap-2",H),S[18]=H,S[19]=m):m=S[19],S[20]===Symbol.for("react.memo_cache_sentinel")?(h=(0,t.jsx)("span",{"aria-hidden":!0}),S[20]=h):h=S[20];let B=M&&null!=R;S[21]!==C.locator||S[22]!==B||S[23]!==K?(g=(0,t.jsx)(ej,{locator:C.locator,title:K,canRename:B,look:"pill"}),S[21]=C.locator,S[22]=B,S[23]=K,S[24]=g):g=S[24],S[25]!==M||S[26]!==C.href||S[27]!==C.locator||S[28]!==K?(y=M?(0,t.jsx)(to,{locator:C.locator,title:K,href:C.href}):null,S[25]=M,S[26]=C.href,S[27]=C.locator,S[28]=K,S[29]=y):y=S[29];let F=L.bots.PageCloseButton;return S[30]!==T?(v=T("page-card.close-btn.aria-label","Close"),S[30]=T,S[31]=v):v=S[31],S[32]!==L.bots.PageCloseButton||S[33]!==v?(b=(0,t.jsx)(F,{label:v,onClick:tm}),S[32]=L.bots.PageCloseButton,S[33]=v,S[34]=b):b=S[34],S[35]!==y||S[36]!==b?(x=(0,t.jsxs)("div",{className:"flex items-center justify-end gap-1 pe-3",children:[y,b]}),S[35]=y,S[36]=b,S[37]=x):x=S[37],S[38]!==m||S[39]!==g||S[40]!==x||S[41]!==p?(w=(0,t.jsxs)("div",{style:p,className:m,children:[h,g,x]}),S[38]=m,S[39]=g,S[40]=x,S[41]=p,S[42]=w):w=S[42],S[43]!==$||S[44]!==C.href||S[45]!==K?(k=void 0===$?null:"ready"===$.status?(0,t.jsx)(ec,{page:$,title:K,opensLinks:!0,onCloseRequest:tm,onScrollEdge:z}):(0,t.jsx)(tk,{page:$,href:C.href}),S[43]=$,S[44]=C.href,S[45]=K,S[46]=k):k=S[46],S[47]!==k?(E=(0,t.jsx)("div",{className:"min-h-0 flex-1 pb-(--bot-page-composer)",children:k}),S[47]=k,S[48]=E):E=S[48],S[49]!==w||S[50]!==E||S[51]!==K?(j=(0,t.jsxs)("div",{"data-testid":"bot-page-stage",role:"region","aria-label":K,className:"flex h-full min-h-0 flex-col bg-surface-base text-fg-primary",children:[w,E]}),S[49]=w,S[50]=E,S[51]=K,S[52]=j):j=S[52],j}function tx(){return document.addEventListener("keydown",tw),()=>document.removeEventListener("keydown",tw)}function tw(e){if("Escape"!==e.key||e.repeat||e.defaultPrevented)return;let t=e.target;t instanceof Element&&t.closest('input, textarea, [contenteditable="true"]')||tm()}function tk(e){let r,a,o,i,l,s,c,u=(0,n.c)(17),{page:d,href:f}=e,{t:p}=(0,ev.f)("bots");u[0]!==p?(r=p("page-card.too-large.description","This page is too large to open here"),u[0]=p,u[1]=r):r=u[1],u[2]!==p?(a=p("page-card.unavailable.description","This page isn't available"),u[2]=p,u[3]=a):a=u[3],u[4]!==r||u[5]!==a?(o={too_large:r,unavailable:a},u[4]=r,u[5]=a,u[6]=o):o=u[6];let m=o["ready"===d.status?"unavailable":d.status];return u[7]!==m?(i=(0,t.jsx)("p",{role:"status",className:"text-sm text-fg-secondary",children:m}),u[7]=m,u[8]=i):i=u[8],u[9]!==p?(l=p("page-card.open-in-cursor-btn.label","Open in Cursor"),u[9]=p,u[10]=l):l=u[10],u[11]!==f||u[12]!==l?(s=(0,t.jsx)("a",{href:f,target:"_blank",rel:"noopener noreferrer",className:"text-sm font-medium text-fg-primary underline",children:l}),u[11]=f,u[12]=l,u[13]=s):s=u[13],u[14]!==i||u[15]!==s?(c=(0,t.jsxs)("div",{className:"flex h-full flex-col items-center justify-center gap-4 px-6",children:[i,s]}),u[14]=i,u[15]=s,u[16]=c):c=u[16],c}e.s(["L",0,function(e){let r,a,o,i,l,s=(0,n.c)(10),{agentId:c,composerHeightPx:u}=e,d=th();s[0]!==c?(r=()=>()=>{td?.agentId===c&&tp(null)},a=[c],s[0]=c,s[1]=r,s[2]=a):(r=s[1],a=s[2]),(0,ei.useEffect)(r,a);let f=d?.agentId===c?d:null;if(s[3]!==u)o={"--bot-page-composer":`${u}px`},s[3]=u,s[4]=o;else o=s[4];return s[5]!==f?(i=null===f?null:(0,t.jsx)(tb,{request:f}),s[5]=f,s[6]=i):i=s[6],s[7]!==o||s[8]!==i?(l=(0,t.jsx)("div",{"data-testid":"bot-page-stage-slot",className:"pointer-events-none absolute inset-0 z-[1] [&:not(:empty)]:pointer-events-auto",style:o,children:i}),s[7]=o,s[8]=i,s[9]=l):l=s[9],l},"Q",0,function(e){null===td&&(0,o.C)(),tp(e)},"W",0,th],103871)},652817,e=>{"use strict";var t=e.i(6936896);let n=null,r=null;function a(e,t){let n=Object.keys(t).map(t=>[t,e.style.getPropertyValue(t)]);for(let[n,r]of Object.entries(t))e.style.setProperty(n,r);return()=>{for(let[t,r]of n)e.style.setProperty(t,r)}}function o(e){let t,n,r=getComputedStyle(e);return{duration:Number.isFinite(n=Number.parseFloat(t=r.getPropertyValue("--grok-duration-spring").trim()))?t.endsWith("ms")?n:1e3*n:400,easing:r.getPropertyValue("--grok-ease-spring").trim()||"cubic-bezier(0.22, 1, 0.36, 1)"}}e.s(["w",0,function(e){if(null===e)return;n=e;let i=r;return r=null,null!==i&&performance.now()-i.at<250&&function(e,n){if(!("function"!=typeof e.animate||(0,t.l)())){var r;!function(e,t){let n=e.getBoundingClientRect().width;if(.5>Math.abs(n-t))return;let r=e.querySelector("[data-title-pill-name]"),i=[a(e,{overflow:"clip","justify-content":"center"}),null===r?null:a(r,{flex:`0 0 ${r.getBoundingClientRect().width}px`})],l=()=>{for(let e of i)e?.()};e.animate({width:[`${t}px`,`${n}px`]},o(e)).finished.then(l,l)}(e,n.width),r=n.centre,requestAnimationFrame(()=>{let t;if(!e.isConnected)return;let n=r-((t=e.getBoundingClientRect()).left+t.width/2);.5>Math.abs(n)||e.animate({translate:[`${n}px 0`,"0 0"]},o(e))})}}(e,i),()=>{n===e&&(n=null)}},"C",0,function(){let e=n?.isConnected===!0?n.getBoundingClientRect():null;r=null!==e&&e.width>0?{width:e.width,centre:e.left+e.width/2,at:performance.now()}:null}])},9301014,e=>{"use strict";let t="u">typeof navigator&&navigator.userAgent.toLowerCase().indexOf("firefox")>0;function n(e,t,n,r){e.addEventListener?e.addEventListener(t,n,r):e.attachEvent&&e.attachEvent("on".concat(t),n)}function r(e,t,n,r){e.removeEventListener?e.removeEventListener(t,n,r):e.detachEvent&&e.detachEvent("on".concat(t),n)}function a(e,t){let n=t.slice(0,t.length-1);for(let t=0;t<n.length;t++)n[t]=e[n[t].toLowerCase()];return n}function o(e){"string"!=typeof e&&(e="");let t=(e=e.replace(/\s/g,"")).split(","),n=t.lastIndexOf("");for(;n>=0;)t[n-1]+=",",t.splice(n,1),n=t.lastIndexOf("");return t}let i={backspace:8,"⌫":8,tab:9,clear:12,enter:13,"↩":13,return:13,esc:27,escape:27,space:32,left:37,up:38,right:39,down:40,del:46,delete:46,ins:45,insert:45,home:36,end:35,pageup:33,pagedown:34,capslock:20,num_0:96,num_1:97,num_2:98,num_3:99,num_4:100,num_5:101,num_6:102,num_7:103,num_8:104,num_9:105,num_multiply:106,num_add:107,num_enter:108,num_subtract:109,num_decimal:110,num_divide:111,"⇪":20,",":188,".":190,"/":191,"`":192,"-":t?173:189,"=":t?61:187,";":t?59:186,"'":222,"[":219,"]":221,"\\":220},l={"⇧":16,shift:16,"⌥":18,alt:18,option:18,"⌃":17,ctrl:17,control:17,"⌘":91,cmd:91,command:91},s={16:"shiftKey",18:"altKey",17:"ctrlKey",91:"metaKey",shiftKey:16,ctrlKey:17,altKey:18,metaKey:91},c={16:!1,18:!1,17:!1,91:!1},u={};for(let e=1;e<20;e++)i["f".concat(e)]=111+e;let d=[],f=null,p="all",m=new Map,h=e=>i[e.toLowerCase()]||l[e.toLowerCase()]||e.toUpperCase().charCodeAt(0);function g(e){p=e||"all"}function y(){return p||"all"}function v(e){if(void 0===e)Object.keys(u).forEach(e=>{Array.isArray(u[e])&&u[e].forEach(e=>b(e)),delete u[e]}),E(null);else if(Array.isArray(e))e.forEach(e=>{e.key&&b(e)});else if("object"==typeof e)e.key&&b(e);else if("string"==typeof e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];let[a,o]=n;"function"==typeof a&&(o=a,a=""),b({key:e,scope:a,method:o,splitKey:"+"})}}let b=e=>{let{key:t,scope:n,method:r,splitKey:i="+"}=e;o(t).forEach(e=>{let t=e.split(i),o=t.length,s=t[o-1],c="*"===s?"*":h(s);if(!u[c])return;n||(n=y());let d=o>1?a(l,t):[],f=[];u[c]=u[c].filter(e=>{let t=(!r||e.method===r)&&e.scope===n&&function(e,t){let n=e.length>=t.length?e:t,r=e.length>=t.length?t:e,a=!0;for(let e=0;e<n.length;e++)-1===r.indexOf(n[e])&&(a=!1);return a}(e.mods,d);return t&&f.push(e.element),!t}),f.forEach(e=>E(e))})};function x(e,t,n,r){let a;if(t.element===r&&(t.scope===n||"all"===t.scope)){for(let e in a=t.mods.length>0,c)Object.prototype.hasOwnProperty.call(c,e)&&(!c[e]&&t.mods.indexOf(+e)>-1||c[e]&&-1===t.mods.indexOf(+e))&&(a=!1);(0!==t.mods.length||c[16]||c[18]||c[17]||c[91])&&!a&&"*"!==t.shortcut||(t.keys=[],t.keys=t.keys.concat(d),!1===t.method(e,t)&&(e.preventDefault?e.preventDefault():e.returnValue=!1,e.stopPropagation&&e.stopPropagation(),e.cancelBubble&&(e.cancelBubble=!0)))}}function w(e,t){let n=u["*"],r=e.keyCode||e.which||e.charCode;if(!k.filter.call(this,e))return;if((93===r||224===r)&&(r=91),-1===d.indexOf(r)&&229!==r&&d.push(r),["ctrlKey","altKey","shiftKey","metaKey"].forEach(t=>{let n=s[t];e[t]&&-1===d.indexOf(n)?d.push(n):!e[t]&&d.indexOf(n)>-1?d.splice(d.indexOf(n),1):"metaKey"===t&&e[t]&&3===d.length&&!(e.ctrlKey||e.shiftKey||e.altKey)&&(d=d.slice(d.indexOf(n)))}),r in c){for(let e in c[r]=!0,l)l[e]===r&&(k[e]=!0);if(!n)return}for(let t in c)Object.prototype.hasOwnProperty.call(c,t)&&(c[t]=e[s[t]]);e.getModifierState&&!(e.altKey&&!e.ctrlKey)&&e.getModifierState("AltGraph")&&(-1===d.indexOf(17)&&d.push(17),-1===d.indexOf(18)&&d.push(18),c[17]=!0,c[18]=!0);let a=y();if(n)for(let r=0;r<n.length;r++)n[r].scope===a&&("keydown"===e.type&&n[r].keydown||"keyup"===e.type&&n[r].keyup)&&x(e,n[r],a,t);if(!(r in u))return;let o=u[r],i=o.length;for(let n=0;n<i;n++)if(("keydown"===e.type&&o[n].keydown||"keyup"===e.type&&o[n].keyup)&&o[n].key){let r=o[n],{splitKey:i}=r,l=r.key.split(i),s=[];for(let e=0;e<l.length;e++)s.push(h(l[e]));s.sort().join("")===d.sort().join("")&&x(e,r,a,t)}}function k(e,t,r){d=[];let i=o(e),s=[],p="all",g=document,y=0,b=!1,x=!0,E="+",j=!1,S=!1;for(void 0===r&&"function"==typeof t&&(r=t),"[object Object]"===Object.prototype.toString.call(t)&&(t.scope&&(p=t.scope),t.element&&(g=t.element),t.keyup&&(b=t.keyup),void 0!==t.keydown&&(x=t.keydown),void 0!==t.capture&&(j=t.capture),"string"==typeof t.splitKey&&(E=t.splitKey),!0===t.single&&(S=!0)),"string"==typeof t&&(p=t),S&&v(e,p);y<i.length;y++)e=i[y].split(E),s=[],e.length>1&&(s=a(l,e)),(e="*"===(e=e[e.length-1])?"*":h(e))in u||(u[e]=[]),u[e].push({keyup:b,keydown:x,scope:p,mods:s,shortcut:i[y],method:r,key:i[y],splitKey:E,element:g});if(void 0!==g&&window){if(!m.has(g)){let e=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.event;return w(e,g)},t=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.event;w(e,g);let t=e.keyCode||e.which||e.charCode,n=d.indexOf(t);if(n>=0&&d.splice(n,1),e.key&&"meta"===e.key.toLowerCase()&&d.splice(0,d.length),(93===t||224===t)&&(t=91),t in c)for(let e in c[t]=!1,l)l[e]===t&&(k[e]=!1)};m.set(g,{keydownListener:e,keyupListenr:t,capture:j}),n(g,"keydown",e,j),n(g,"keyup",t,j)}if(!f){let e=()=>{d=[]};f={listener:e,capture:j},n(window,"focus",e,j)}}}function E(e){let t=Object.values(u).flat();if(0>t.findIndex(t=>{let{element:n}=t;return n===e})){let{keydownListener:t,keyupListenr:n,capture:a}=m.get(e)||{};t&&n&&(r(e,"keyup",n,a),r(e,"keydown",t,a),m.delete(e))}if((t.length<=0||m.size<=0)&&(Object.keys(m).forEach(e=>{let{keydownListener:t,keyupListenr:n,capture:a}=m.get(e)||{};t&&n&&(r(e,"keyup",n,a),r(e,"keydown",t,a),m.delete(e))}),m.clear(),Object.keys(u).forEach(e=>delete u[e]),f)){let{listener:e,capture:t}=f;r(window,"focus",e,t),f=null}}let j={getPressedKeyString:function(){return d.map(e=>Object.keys(i).find(t=>i[t]===e)||Object.keys(l).find(t=>l[t]===e)||String.fromCharCode(e))},setScope:g,getScope:y,deleteScope:function(e,t){let n,r;for(let t in e||(e=y()),u)if(Object.prototype.hasOwnProperty.call(u,t))for(n=u[t],r=0;r<n.length;)n[r].scope===e?n.splice(r,1).forEach(e=>{let{element:t}=e;return E(t)}):r++;y()===e&&g(t||"all")},getPressedKeyCodes:function(){return d.slice(0)},getAllKeyCodes:function(){let e=[];return Object.keys(u).forEach(t=>{u[t].forEach(t=>{let{key:n,scope:r,mods:a,shortcut:o}=t;e.push({scope:r,shortcut:o,mods:a,keys:n.split("+").map(e=>h(e))})})}),e},isPressed:function(e){return"string"==typeof e&&(e=h(e)),-1!==d.indexOf(e)},filter:function(e){let t=e.target||e.srcElement,{tagName:n}=t,r=!0,a="INPUT"===n&&!["checkbox","radio","range","button","file","reset","submit","color"].includes(t.type);return(t.isContentEditable||(a||"TEXTAREA"===n||"SELECT"===n)&&!t.readOnly)&&(r=!1),r},trigger:function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"all";Object.keys(u).forEach(n=>{u[n].filter(n=>n.scope===t&&n.shortcut===e).forEach(e=>{e&&e.method&&e.method()})})},unbind:v,keyMap:i,modifier:l,modifierMap:s};for(let e in j)Object.prototype.hasOwnProperty.call(j,e)&&(k[e]=j[e]);if("u">typeof window){let e=window.hotkeys;k.noConflict=t=>(t&&window.hotkeys===k&&(window.hotkeys=e),k),window.hotkeys=k}var S=e.i(1122946);k.filter=()=>!0,e.s(["f",0,function(e,t,n,r){let a=r?.enabled??!0;(0,S.useEffect)(()=>{if(a)return k(e,t),()=>k.unbind(e,t)},[...n,e,a])}],9301014)},8562165,e=>{"use strict";var t=e.i(1552184),n=e.i(4398962),r=e.i(3068334);let a=e=>{let a,o,i=(0,n.c)(3);return i[0]===Symbol.for("react.memo_cache_sentinel")?(a=(0,t.jsx)("g",{id:"name=chevron-right-md",children:(0,t.jsx)("path",{id:"vector",d:"M17.4141 12L10 19.4141L8.58594 18L14.5859 12L8.58594 6L10 4.58594L17.4141 12Z",fill:"currentColor"})}),i[0]=a):a=i[0],i[1]!==e?(o=(0,t.jsx)(r.c,{...e,children:a}),i[1]=e,i[2]=o):o=i[2],o};a.displayName="ChevronRightMdIcon",e.s(["f",0,a])},5934629,e=>{"use strict";var t=e.i(1552184),n=e.i(4398962),r=e.i(3068334);let a=e=>{let a,o,i=(0,n.c)(3);return i[0]===Symbol.for("react.memo_cache_sentinel")?(a=(0,t.jsx)("g",{id:"name=plus",children:(0,t.jsx)("path",{id:"vector",d:"M13 4V11H20V13H13V20H11V13H4V11H11V4H13Z",fill:"currentColor"})}),i[0]=a):a=i[0],i[1]!==e?(o=(0,t.jsx)(r.c,{...e,children:a}),i[1]=e,i[2]=o):o=i[2],o};a.displayName="PlusIcon",e.s(["f",0,a])}]);

//# debugId=13e81494-dc50-874d-1c52-e6a5d4cdf006