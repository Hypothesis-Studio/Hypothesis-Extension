const path=require('path'),fs=require('fs');let d=null;const m=[];
function l(f){try{return JSON.parse(fs.readFileSync(path.join(__dirname,'themes',f),'utf-8'))}catch{return null}}
function r(t,b,def){const R=[];if(def.tokenColors){for(const tc of def.tokenColors){const sc=Array.isArray(tc.scope)?tc.scope:[tc.scope];for(const s of sc)R.push({token:s,foreground:tc.settings?.foreground?.replace('#',''),fontStyle:tc.settings?.fontStyle||''})}}const C={};for(const[k,v] of Object.entries(def.colors||{}))if(typeof v==='string')C[k]=v;
const p={themeId:t,baseTheme:b,rules:R,colors:C};const s=()=>{try{const w=require('electron').BrowserWindow.getAllWindows()[0];if(w&&!w.isDestroyed())w.webContents.send('ext:monaco:defineTheme',p)}catch{}};s();setTimeout(s,300);setTimeout(s,800);setTimeout(s,1500);m.push(t)}
function bCSS(def){const c=def.colors||{};const tk={};if(def.tokenColors)for(const tc of def.tokenColors){const sc=Array.isArray(tc.scope)?tc.scope:[tc.scope];for(const s of sc)if(tc.settings?.foreground)tk[s]=tc.settings.foreground}
let css=':root {\n';for(const[k,v] of Object.entries(c))if(typeof v==='string')css+='  --theme-'+k.replace(/\./g,'-').replace(/([A-Z])/g,'-$1').toLowerCase()+': '+v+';\n';
for(const[k,v] of Object.entries(def.cssVars||{}))if(typeof v==='string')css+='  '+k+': '+v+';\n';
const sm={comment:'--editor-comment',keyword:'--editor-keyword',string:'--editor-string',number:'--editor-number',function:'--editor-function',variable:'--editor-variable',type:'--editor-type'};
for(const[s,n] of Object.entries(sm))if(tk[s])css+='  '+n+': '+tk[s]+';\n';css+='}';return css}
function activate(ctx){const{theme,settings,commands}=ctx;const dark=l('github-dark.json');
if(dark)ctx.subscriptions.push(theme.register(dark));if(dark)r('github-dark','vs-dark',dark);
settings.set('workbench.colorTheme','github-dark');
ctx.subscriptions.push(theme.onDidChange(()=>{if(dark){if(d)d.dispose();d=theme.injectCSS('github-dark-vars',bCSS(dark))}}));
if(dark){d=theme.injectCSS('github-dark-vars',bCSS(dark));ctx.subscriptions.push(d)}
if(commands)ctx.subscriptions.push(commands.registerCommand('github-dark.activate',()=>settings.set('workbench.colorTheme','github-dark')));
console.log('[GitHub Dark] activated')}
function deactivate(){if(d){d.dispose();d=null}try{const w=require('electron').BrowserWindow.getAllWindows()[0];if(w&&!w.isDestroyed()){if(m.length)w.webContents.send('ext:monaco:unregister',[...m]);w.webContents.send('ext:theme:revert')}}catch{}m.length=0;console.log('[GitHub Dark] deactivated')}
module.exports={activate,deactivate};