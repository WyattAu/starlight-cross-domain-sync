import type { CrossDomainSyncOptions } from './types';

export function generateSyncScript(options: Required<CrossDomainSyncOptions>): string {
  const {
    domain,
    cookieName,
    cookieMaxAge,
    storageKey,
    themeAttribute,
    darkValue,
    lightValue,
    broadcastChannel: useBroadcast,
    channelName,
  } = options;

  const validValues = [darkValue, lightValue].map((v) => "'" + v + "'").join(',');

  return `(function(){`
    + `var SK='${escape(storageKey)}',CN='${escape(cookieName)}',CD='${escape(domain)}',`
    + `CM=${cookieMaxAge},TA='${escape(themeAttribute)}',VV=[${validValues}],`
    + `BC=${useBroadcast ? 'true' : 'false'},CH='${escape(channelName)}';`

    + 'function gc(n){var m=document.cookie.match(new RegExp(\'(?:^|;\\\\s*)\'+n.replace(/[.*+?^${}()|[\\]\\\\]/g,\'\\\\$&\')+\'=([^;]*)\'));return m?decodeURIComponent(m[1]):null}'
    + `function sc(n,v){document.cookie=n+'='+encodeURIComponent(v)+'; domain='+CD+'; path=/; max-age='+CM+'; SameSite=Lax; Secure'}`

    + `function gs(){try{var r=localStorage.getItem(SK);if(r){var p=JSON.parse(r);return p&&typeof p.colorMode==='string'?p.colorMode:null}}catch(e){}return null}`
    + `function ss(m){try{var e={};try{e=JSON.parse(localStorage.getItem(SK))||{}}catch(x){}e.colorMode=m;localStorage.setItem(SK,JSON.stringify(e))}catch(e){}}`

    + `function stc(m){if(m&&m!==gc(CN)){sc(CN,m)}}`
    + `function iv(v){return VV.indexOf(v)!==-1}`

    + `function sync(){`
    + `var s=gs(),c=gc(CN);`
    + `if(s&&!c){stc(s)}`
    + `else if(c&&!s){ss(c)}`
    + `else if(s&&c&&s!==c){stc(s)}`
    + `}`

    + `function watch(){`
    + `var cur=document.documentElement.getAttribute(TA);`
    + `var obs=new MutationObserver(function(mutations){`
    + `for(var i=0;i<mutations.length;i++){`
    + `if(mutations[i].attributeName===TA){`
    + `var nv=document.documentElement.getAttribute(TA);`
    + `if(nv&&nv!==cur&&iv(nv)){`
    + `cur=nv;stc(nv);`
    + `if(BC&&window._stlsCh){try{window._stlsCh.postMessage(JSON.stringify({t:nv,s:Date.now()}))}catch(e){}}`
    + `}`
    + `}}`
    + `});`
    + `obs.observe(document.documentElement,{attributes:true,attributeFilter:[TA]});`
    + `}`

    + (useBroadcast
      ? `function initBC(){`
        + `try{`
        + `var ch=new BroadcastChannel(CH);`
        + `window._stlsCh=ch;`
        + `ch.onmessage=function(e){`
        + `try{`
        + `var d=JSON.parse(e.data);`
        + `if(d&&typeof d.t==='string'&&typeof d.s==='number'&&iv(d.t)){`
        + `ss(d.t);stc(d.t);`
        + `var el=document.documentElement;`
        + `if(el.getAttribute(TA)!==d.t){el.setAttribute(TA,d.t)}`
        + `}`
        + `}catch(x){}`
        + `};`
        + `}catch(e){}`
        + `}`
      : '')

    + `function init(){sync();watch();`
    + (useBroadcast ? 'initBC();' : '')
    + `}`

    + `if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}`
    + `else{init()}`

    + `document.addEventListener('astro:after-swap',function(){`
    + `sync();`
    + `var cur2=document.documentElement.getAttribute(TA);`
    + `var obs2=new MutationObserver(function(mutations){`
    + `for(var j=0;j<mutations.length;j++){`
    + `if(mutations[j].attributeName===TA){`
    + `var nv2=document.documentElement.getAttribute(TA);`
    + `if(nv2&&nv2!==cur2&&iv(nv2)){`
    + `cur2=nv2;stc(nv2);`
    + `if(BC&&window._stlsCh){try{window._stlsCh.postMessage(JSON.stringify({t:nv2,s:Date.now()}))}catch(e){}}`
    + `}`
    + `}}`
    + `});`
    + `obs2.observe(document.documentElement,{attributes:true,attributeFilter:[TA]});`
    + `});`

    + `window.addEventListener('storage',function(e){`
    + `if(e.key===SK){var nm=gs();if(nm&&iv(nm)){stc(nm)}}`
    + `});`
    + `})();`;
}

function escape(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
