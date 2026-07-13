var Ee=Object.defineProperty;var ke=Object.getOwnPropertyDescriptor;var w=(a,e,t,n)=>{for(var i=n>1?void 0:n?ke(e,t):e,r=a.length-1,s;r>=0;r--)(s=a[r])&&(i=(n?s(e,t,i):s(i))||i);return n&&i&&Ee(e,t,i),i};var W=globalThis,j=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),ae=new WeakMap,D=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(j&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&ae.set(t,e))}return e}toString(){return this.cssText}},le=a=>new D(typeof a=="string"?a:a+"",void 0,K),B=(a,...e)=>{let t=a.length===1?a[0]:e.reduce((n,i,r)=>n+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[r+1],a[0]);return new D(t,a,K)},ce=(a,e)=>{if(j)a.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=W.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,a.appendChild(n)}},J=j?a=>a:a=>a instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return le(t)})(a):a;var{is:Me,defineProperty:Pe,getOwnPropertyDescriptor:De,getOwnPropertyNames:Le,getOwnPropertySymbols:ze,getPrototypeOf:He}=Object,F=globalThis,de=F.trustedTypes,Te=de?de.emptyScript:"",Oe=F.reactiveElementPolyfillSupport,L=(a,e)=>a,z={toAttribute(a,e){switch(e){case Boolean:a=a?Te:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,e){let t=a;switch(e){case Boolean:t=a!==null;break;case Number:t=a===null?null:Number(a);break;case Object:case Array:try{t=JSON.parse(a)}catch{t=null}}return t}},V=(a,e)=>!Me(a,e),ue={attribute:!0,type:String,converter:z,reflect:!1,useDefault:!1,hasChanged:V};Symbol.metadata??=Symbol("metadata"),F.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ue){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&Pe(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=De(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:i,set(s){let o=i?.call(this);r?.call(this,s),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ue}static _$Ei(){if(this.hasOwnProperty(L("elementProperties")))return;let e=He(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(L("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(L("properties"))){let t=this.properties,n=[...Le(t),...ze(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(J(i))}else e!==void 0&&t.push(J(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ce(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:z).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),s=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:z;this._$Em=i;let o=s.fromAttribute(t,r.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let s=this.constructor;if(i===!1&&(r=this[e]),n??=s.getPropertyOptions(e),!((n.hasChanged??V)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},s){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),r!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:s}=r,o=this[i];s!==!0||this._$AL.has(i)||o===void 0||this.C(i,void 0,r,o)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[L("elementProperties")]=new Map,b[L("finalized")]=new Map,Oe?.({ReactiveElement:b}),(F.reactiveElementVersions??=[]).push("2.1.2");var ie=globalThis,pe=a=>a,Z=ie.trustedTypes,he=Z?Z.createPolicy("lit-html",{createHTML:a=>a}):void 0,be="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,ye="?"+$,Ne=`<${ye}>`,S=document,T=()=>S.createComment(""),O=a=>a===null||typeof a!="object"&&typeof a!="function",ne=Array.isArray,Re=a=>ne(a)||typeof a?.[Symbol.iterator]=="function",Y=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ge=/-->/g,_e=/>/g,C=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),me=/'/g,fe=/"/g,we=/^(?:script|style|textarea|title)$/i,re=a=>(e,...t)=>({_$litType$:a,strings:e,values:t}),d=re(1),Xe=re(2),Ge=re(3),E=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ve=new WeakMap,A=S.createTreeWalker(S,129);function $e(a,e){if(!ne(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return he!==void 0?he.createHTML(e):e}var Ue=(a,e)=>{let t=a.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",s=H;for(let o=0;o<t;o++){let l=a[o],c,h,u=-1,g=0;for(;g<l.length&&(s.lastIndex=g,h=s.exec(l),h!==null);)g=s.lastIndex,s===H?h[1]==="!--"?s=ge:h[1]!==void 0?s=_e:h[2]!==void 0?(we.test(h[2])&&(i=RegExp("</"+h[2],"g")),s=C):h[3]!==void 0&&(s=C):s===C?h[0]===">"?(s=i??H,u=-1):h[1]===void 0?u=-2:(u=s.lastIndex-h[2].length,c=h[1],s=h[3]===void 0?C:h[3]==='"'?fe:me):s===fe||s===me?s=C:s===ge||s===_e?s=H:(s=C,i=void 0);let _=s===C&&a[o+1].startsWith("/>")?" ":"";r+=s===H?l+Ne:u>=0?(n.push(c),l.slice(0,u)+be+l.slice(u)+$+_):l+$+(u===-2?o:_)}return[$e(a,r+(a[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},N=class a{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,s=0,o=e.length-1,l=this.parts,[c,h]=Ue(e,t);if(this.el=a.createElement(c,n),A.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=A.nextNode())!==null&&l.length<o;){if(i.nodeType===1){if(i.hasAttributes())for(let u of i.getAttributeNames())if(u.endsWith(be)){let g=h[s++],_=i.getAttribute(u).split($),v=/([.?@])?(.*)/.exec(g);l.push({type:1,index:r,name:v[2],strings:_,ctor:v[1]==="."?G:v[1]==="?"?Q:v[1]==="@"?ee:M}),i.removeAttribute(u)}else u.startsWith($)&&(l.push({type:6,index:r}),i.removeAttribute(u));if(we.test(i.tagName)){let u=i.textContent.split($),g=u.length-1;if(g>0){i.textContent=Z?Z.emptyScript:"";for(let _=0;_<g;_++)i.append(u[_],T()),A.nextNode(),l.push({type:2,index:++r});i.append(u[g],T())}}}else if(i.nodeType===8)if(i.data===ye)l.push({type:2,index:r});else{let u=-1;for(;(u=i.data.indexOf($,u+1))!==-1;)l.push({type:7,index:r}),u+=$.length-1}r++}}static createElement(e,t){let n=S.createElement("template");return n.innerHTML=e,n}};function k(a,e,t=a,n){if(e===E)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=O(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(a),i._$AT(a,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=k(a,i._$AS(a,e.values),i,n)),e}var X=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??S).importNode(t,!0);A.currentNode=i;let r=A.nextNode(),s=0,o=0,l=n[0];for(;l!==void 0;){if(s===l.index){let c;l.type===2?c=new R(r,r.nextSibling,this,e):l.type===1?c=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(c=new te(r,this,e)),this._$AV.push(c),l=n[++o]}s!==l?.index&&(r=A.nextNode(),s++)}return A.currentNode=S,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},R=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),O(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==E&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Re(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=N.createElement($e(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new X(i,this),s=r.u(this.options);r.p(t),this.T(s),this._$AH=r}}_$AC(e){let t=ve.get(e.strings);return t===void 0&&ve.set(e.strings,t=new N(e)),t}k(e){ne(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new a(this.O(T()),this.O(T()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=pe(e).nextSibling;pe(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=p}_$AI(e,t=this,n,i){let r=this.strings,s=!1;if(r===void 0)e=k(this,e,t,0),s=!O(e)||e!==this._$AH&&e!==E,s&&(this._$AH=e);else{let o=e,l,c;for(e=r[0],l=0;l<r.length-1;l++)c=k(this,o[n+l],t,l),c===E&&(c=this._$AH[l]),s||=!O(c)||c!==this._$AH[l],c===p?e=p:e!==p&&(e+=(c??"")+r[l+1]),this._$AH[l]=c}s&&!i&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},G=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}},Q=class extends M{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}},ee=class extends M{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??p)===E)return;let n=this._$AH,i=e===p&&n!==p||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==p&&(n===p||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},te=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}};var We=ie.litHtmlPolyfillSupport;We?.(N,R),(ie.litHtmlVersions??=[]).push("3.3.2");var xe=(a,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new R(e.insertBefore(T(),r),r,void 0,t??{})}return i._$AI(a),i};var se=globalThis,y=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=xe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};y._$litElement$=!0,y.finalized=!0,se.litElementHydrateSupport?.({LitElement:y});var je=se.litElementPolyfillSupport;je?.({LitElement:y});(se.litElementVersions??=[]).push("4.2.2");var oe=a=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(a,e)}):customElements.define(a,e)};var Be={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:V},Fe=(a=Be,e,t)=>{let{kind:n,metadata:i}=t,r=globalThis.litPropertyMetadata.get(i);if(r===void 0&&globalThis.litPropertyMetadata.set(i,r=new Map),n==="setter"&&((a=Object.create(a)).wrapped=!0),r.set(t.name,a),n==="accessor"){let{name:s}=t;return{set(o){let l=e.get.call(this);e.set.call(this,o),this.requestUpdate(s,l,a,!0,o)},init(o){return o!==void 0&&this.C(s,void 0,a,o),o}}}if(n==="setter"){let{name:s}=t;return function(o){let l=this[s];e.call(this,o),this.requestUpdate(s,l,a,!0,o)}}throw Error("Unsupported decorator location: "+n)};function U(a){return(e,t)=>typeof t=="object"?Fe(a,e,t):((n,i,r)=>{let s=i.hasOwnProperty(r);return i.constructor.createProperty(r,n),s?Object.getOwnPropertyDescriptor(i,r):void 0})(a,e,t)}function q(a){return U({...a,state:!0,attribute:!1})}function Ce(a){return a.split(".",2)[1]||void 0}function Ae(a,e){let t=Ce(e);if(!t)return[];let n=l=>{let c=`select.${t}_${l}`;return a[c]?c:void 0},i=[n("map"),n("mowing_action")].filter(l=>!!l),r=n("mowing_action"),s=r?a[r]?.state.trim().toLowerCase():"",o=s.includes("zone")?"zone":s.includes("spot")?"spot":s.includes("edge")||s.includes("border")?"edge":void 0;if(o){let l=n(o);l&&i.push(l)}return i}function Se(a,e){let t=Ce(e);if(!t)return[];let n=(r,s)=>{let o=`${r}.${t}_${s}`;if(a[o])return o;let l=`_${t}_${s}`,c=Object.keys(a).filter(h=>h.startsWith(`${r}.`)&&h.endsWith(l));return c.length===1?c[0]:void 0};return[{entityId:n("camera","live_video"),label:"Live Video",icon:"mdi:video-wireless-outline"},{entityId:n("calendar","schedule"),label:"Schedule",icon:"mdi:calendar"},{entityId:n("camera","live_path_map"),label:"Live Map",icon:"mdi:map-marker-path"},{entityId:n("camera","all_maps"),label:"All Maps",icon:"mdi:map-multiple-outline"}].filter(r=>!!r.entityId)}var Ve={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},Ze={"charging completed":"charging completed","rain protection enabled":"rain protection enabled","rain protection disabled":"rain protection disabled","rain delay active":"rain delay active","rain delay inactive":"rain delay inactive","no error":"no error","task unknown":"task unknown"},m=class extends y{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(e){if(!e.entity)throw new Error("The 'entity' option is required.");this._config=e}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return p;let e=this.hass.states[this._config.entity];if(!e)return d`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let t=this._config.name||this._friendlyName(e)||this._entityName(this._config.entity),n=this._config.layout||"default",i=this._entityState(this._config.status_entity)||this._friendlyMowerState(e.state),r=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,s=r?this._cameraUrl(r):void 0,o=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(e.state),h=this._buildHeaderSummary(),u=this._resolvedControlEntities(),g=this._plannedRunDetails(e),_=this._runtimeSessionDetails(),v=this._config.show_advanced_details??!1;return d`
      <ha-card>
        <div class=${`wrap layout-${n}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${t}</div>
                <div class="subtitle">${i}</div>
                ${h.length?d`
                      <div class="header-summary">
                        ${h.map(f=>d`<div class="summary-chip">${f}</div>`)}
                      </div>
                    `:p}
              </div>
              <div class=${`state-pill state-${e.state}`}>${this._friendlyMowerState(e.state)}</div>
            </div>

            ${o?d`
                  <div class="map">
                    ${s?d`<img src=${s} alt=${t} />`:d`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `:p}
          </div>

          <div class="side">
            ${v&&g?this._renderPlannedRunPanel(g):p}

            ${v&&_?this._renderRuntimeSessionPanel(_):p}

            ${u.length?d`
                  <div class="selectors">
                    ${u.map(f=>this._renderSelectControl(f))}
                  </div>
                `:p}

            ${c.length?d`
                  ${c.map(f=>d`
                      <div class="action-group">
                        ${c.length>1?d`<div class="action-group-title">${f.title}</div>`:p}
                        <div class="actions">
                          ${f.actions.map(P=>d`
                              <button @click=${P.handler} ?disabled=${P.disabled}>
                                <span class="button-content">
                                  ${P.icon?d`<ha-icon .icon=${P.icon}></ha-icon>`:p}
                                  <span>${P.label}</span>
                                </span>
                              </button>
                            `)}
                        </div>
                      </div>
                    `)}
                `:p}

            ${l.length?d`
                  <div class="stats">
                    ${l.map(f=>d`
                        <div class="tile">
                          <div class="tile-label">${f.label}</div>
                          <div class="tile-value">${f.value}</div>
                        </div>
                      `)}
                  </div>
                `:p}
          </div>
        </div>
      </ha-card>
    `}getCardSize(){let e=this._config?.show_map??!!this._config?.map_entity,t=this._config?.layout||"default";return t==="compact"?e?8:6:t==="wide"?e?10:8:e?9:7}_buildTiles(){return!this._config||!this.hass?[]:(this._config.tiles||[]).map(e=>this._tileFromEntity(e.entity,e.label,e.icon)).filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let e=[],t=this.hass.states[this._config.entity];if(!t)return e;let n=this._stringAttribute(t,"error_display")||this._stringAttribute(t,"error_text");n&&!["none","no error"].includes(n.toLowerCase())&&e.push(`Error ${n}`);let i=this._entityState(this._config.battery_entity)||this._stringAttribute(t,"battery_level","%");i&&e.push(`Battery ${i}`);let r=(this._config.summary_entities||[]).filter(Boolean);if(r.length)for(let o of r){let l=this.hass.states[o];if(!l||this._isUnavailableEntity(l))continue;let c=this._preferredEntityLabel(o)||this._entityName(o);e.push(`${c} ${this._friendlyState(l)}`)}else{let o=this._entityState(this._config.progress_entity)||this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress");o&&e.push(`Progress ${o}`);let l=this._companionState("sensor","runtime_current_area"),c=this._companionState("sensor","runtime_total_area");l&&c&&e.push(`Coverage ${l} / ${c}`)}let s=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");return s&&e.push(s),[...new Set(e)].slice(0,4)}_resolvedControlEntities(){if(!this._config)return[];let e=(this._config.control_entities||[]).filter(Boolean);return e.length?e:this._autoDetectedControlEntities(this._config.entity)}_autoDetectedControlEntities(e){return!e||!this.hass?.states?[]:Ae(this.hass.states,e)}_renderSelectControl(e){let t=this.hass.states[e];if(!t)return p;let n=Array.isArray(t.attributes.options)?t.attributes.options.filter(s=>typeof s=="string"):[];if(!n.length)return p;let i=this._friendlyName(t)||this._preferredEntityLabel(e)||this._entityName(e),r=["unavailable","unknown"].includes(String(t.state));return d`
      <label class="selector-card">
        <span class="selector-label">${i}</span>
        <select
          .value=${String(t.state)}
          ?disabled=${r}
          @change=${s=>this._selectOption(e,s)}
        >
          ${n.map(s=>d`<option value=${s}>${s}</option>`)}
        </select>
      </label>
    `}_buildActionGroups(e){if(!this._config)return[];let t=[];(this._config.show_default_actions??!0)&&t.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()});let n=[];(this._config.show_helper_actions??!0)&&n.push(...this._buildHelperActions());let i=[];for(let r of this._config.actions||[]){let s=this._buildConfiguredAction(r,e);s&&i.push(s)}return[{title:"Controls",actions:t},{title:"Helpers",actions:n},{title:"Custom",actions:i}].filter(r=>r.actions.length)}_buildConfiguredAction(e,t){let n=e.type||"more-info";if(n==="start")return{label:e.label||"Start",icon:e.icon||"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()};if(n==="pause")return{label:e.label||"Pause",icon:e.icon||"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()};if(n==="dock")return{label:e.label||"Dock",icon:e.icon||"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()};if(n==="more-info")return{label:e.label||"Details",icon:e.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(e.entity)};if(n==="service"&&e.service)return{label:e.label||e.service,icon:e.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(e.service,e.service_data)}}_buildHelperActions(){return this._config?Se(this.hass.states,this._config.entity).map(e=>({label:e.label,icon:e.icon,disabled:!1,handler:()=>this._showMoreInfo(e.entityId)})):[]}_tileFromEntity(e,t,n){let i=this.hass.states[e];if(!i||this._isUnavailableEntity(i))return{label:t||this._preferredEntityLabel(e),value:"Unavailable"};let r=t||this._friendlyName(i)||this._preferredEntityLabel(e),s=this._friendlyState(i);return{label:n?`${n} ${r}`:r,value:s}}_friendlyState(e){let t=e.attributes.unit_of_measurement;return typeof t=="string"&&t?`${e.state} ${t}`:this._humanizeEntityState(e.entity_id,String(e.state))}_entityState(e){if(!e)return;let t=this.hass.states[e];return t&&!this._isUnavailableEntity(t)?this._friendlyState(t):void 0}_stringAttribute(e,t,n){let i=e.attributes[t];if(!(i==null||i===""))return n?`${String(i)} ${n}`:this._humanizeValue(String(i))}_humanizeValue(e){let t=e.trim();if(!t)return t;let n=Ve[t];if(n)return n;let i=t.replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(!i)return t;let r=i.toLowerCase(),s=Ze[r]||r;return s.charAt(0).toUpperCase()+s.slice(1)}_humanizeEntityState(e,t){let n=t.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(e.endsWith("_weather_protection_status")){if(n==="rain protection enabled"||n==="enabled")return"Enabled";if(n==="rain protection disabled"||n==="disabled")return"Disabled"}return(e.endsWith("_task_status")||e.endsWith("_task_status_name"))&&this._isUnknownLike(t)?"Unknown":this._humanizeValue(t)}_isUnknownLike(e){let t=e.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();return["unknown","unavailable","none","task unknown"].includes(t)}_preferredEntityLabel(e,t){return e.endsWith("_weather_protection_status")?"Rain protection":e.endsWith("_state_name")?"State":e.endsWith("_task_status")||e.endsWith("_task_status_name")?"Task":e.endsWith("_battery")?"Battery":e.endsWith("_selected_mowing_action")?"Selected Action":e.endsWith("_selected_target")?"Selected Target":e.endsWith("_selected_map")?"Selected Map":e.endsWith("_selected_zone_mowing_height")?"Mowing Height":e.endsWith("_selected_zone_efficiency_mode")?"Efficiency":e.endsWith("_selected_zone_direction_mode")?"Direction":e.endsWith("_selected_zone_obstacle_avoidance")?"Obstacle Avoidance":e.endsWith("_selected_zone_obstacle_distance")?"Obstacle Distance":e.endsWith("_selected_zone_obstacle_height")?"Obstacle Height":e.endsWith("_selected_zone_obstacle_classes")?"Obstacle Classes":e.endsWith("_mowing_action")?"Mowing Action":e.endsWith("_zone")?"Zone":e.endsWith("_spot")?"Spot":e.endsWith("_map")?"Map":e.endsWith("_mowing_progress")?"Progress":e.endsWith("_runtime_mission_progress")?"Mission Progress":e.endsWith("_runtime_current_area")?"Current Area":e.endsWith("_runtime_total_area")?"Total Area":e.endsWith("_runtime_position_x")?"Position X":e.endsWith("_runtime_position_y")?"Position Y":e.endsWith("_runtime_heading")?"Heading":e.endsWith("_runtime_live_track_length")?"Live Trail":e.endsWith("_runtime_live_track_point_count")?"Live Points":e.endsWith("_runtime_live_track_segment_count")?"Live Segments":e.endsWith("_current_cleaned_area")?"Cut Area":e.endsWith("_current_cleaning_time")?"Time":e.endsWith("_current_zone")?"Current Zone":e.endsWith("_active_segment_count")?"Active Segments":e.endsWith("_current_app_map_area")?"Map Area":e.endsWith("_current_app_map_zone_count")?"Zones":e.endsWith("_current_app_map_spot_count")?"Spots":e.endsWith("_current_app_map_trajectory_point_count")?"Path Points":e.endsWith("_current_app_map_trajectory_length")?"Path Length":e.endsWith("_current_app_map_mow_path_length")?"Trail Length":e.endsWith("_current_app_map_cut_relation_count")?"Cut Links":e.endsWith("_error")?"Error":t||this._entityName(e)}_friendlyName(e){let t=e.attributes.friendly_name;return typeof t=="string"?t:void 0}_entityName(e){return e.split(".")[1]?.replace(/_/g," ")||e}_friendlyMowerState(e){return this._humanizeValue(e)}_cameraUrl(e){let t=e.attributes.entity_picture;return typeof t=="string"&&t?t:`/api/camera_proxy/${e.entity_id}?v=${Date.now()}`}_mapEntity(){if(this._config?.map_entity)return this.hass.states[this._config.map_entity]}_entityAttributeString(e,t){let n=e.attributes[t];return typeof n=="string"&&n.trim()?n.trim():void 0}_entityAttributeInteger(e,t){let n=e.attributes[t];return typeof n=="number"&&Number.isInteger(n)?n:void 0}_entityAttributeRecord(e,t){let n=e.attributes[t];return n&&typeof n=="object"&&!Array.isArray(n)?n:void 0}_recordString(e,t){let n=e?.[t];return typeof n=="string"&&n.trim()?n.trim():void 0}_recordNumber(e,t){let n=e?.[t];return typeof n=="number"&&Number.isFinite(n)?n:void 0}_recordBoolean(e,t){let n=e?.[t];return typeof n=="boolean"?n:void 0}_recordStringArray(e,t){let n=e?.[t];return Array.isArray(n)&&n.every(i=>typeof i=="string")?n:void 0}_numberAttribute(e,t){let n=e.attributes[t];if(typeof n=="number"&&Number.isFinite(n))return n;if(typeof n=="string"&&n.trim()){let i=Number(n);if(Number.isFinite(i))return i}}_formatMeters(e){let t=e>=10?1:2;return`${e.toFixed(t)} m`}_formatCoordinate(e){return Number.isInteger(e)?`${e}`:e.toFixed(1)}_formatCentimeters(e){return`${Number.isInteger(e)?`${Math.round(e)}`:e.toFixed(1)} cm`}_formatOptionalCentimeters(e){return e!==void 0?this._formatCentimeters(e):void 0}_humanizedOptionalBoolean(e){if(e!==void 0)return e?"Enabled":"Disabled"}_humanizedOptionalList(e){if(e?.length)return e.map(t=>this._humanizeValue(t)).join(", ")}_humanizedOptionalValue(e){return e?this._humanizeValue(e):void 0}_formatOptionalCount(e){if(e!==void 0)return`${Math.round(e)}`}_selectedZoneDirectionLabel(e){let t=this._recordString(e,"mowing_direction_mode_name"),n=this._recordNumber(e,"mowing_direction_degrees"),i=this._humanizedOptionalValue(t);if(i&&n!==void 0)return`${i} (${Math.round(n)}\xB0)`;if(i)return i;if(n!==void 0)return`${Math.round(n)}\xB0`}_selectedZonePreferenceDetails(e,t){let n=this._entityAttributeInteger(e,"selected_zone_id"),i=this._entityAttributeString(e,"selected_mowing_action"),r=this._entityAttributeRecord(e,"selected_zone_preference"),s=t?.toLowerCase();if(!(i==="zone"||(s?.includes("zone")??!1)))return;let l=this._companionState("sensor","selected_zone_mowing_height")||this._formatOptionalCentimeters(this._recordNumber(r,"mowing_height_cm")),c=this._companionState("sensor","selected_zone_efficiency_mode")||this._humanizedOptionalValue(this._recordString(r,"efficient_mode_name")),h=this._companionState("sensor","selected_zone_direction_mode")||this._selectedZoneDirectionLabel(r),u=this._companionState("sensor","selected_zone_obstacle_avoidance")||this._humanizedOptionalBoolean(this._recordBoolean(r,"obstacle_avoidance_enabled")),g=this._companionState("sensor","selected_zone_obstacle_distance")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_distance_cm")),_=this._companionState("sensor","selected_zone_obstacle_height")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_height_cm")),v=this._companionState("sensor","selected_zone_obstacle_classes")||this._humanizedOptionalList(this._recordStringArray(r,"obstacle_avoidance_ai_classes")),f=this._recordString(r,"label")||(n!==void 0?`Zone #${n}`:void 0);if(!(!f&&!l&&!c&&!h&&!u&&!g&&!_&&!v))return{zoneLabel:f,mowingHeight:l,efficiencyMode:c,directionMode:h,obstacleAvoidance:u,obstacleDistance:g,obstacleHeight:_,obstacleClasses:v}}_selectedMapPreferenceDetails(e){let t=this._entityAttributeRecord(e,"selected_map_preference"),n=this._companionState("sensor","selected_map_preference_mode"),i=this._recordString(t,"mode_name")||this._entityAttributeString(e,"selected_map_preference_mode"),r=n||this._humanizedOptionalValue(i),s=this._companionState("sensor","selected_map_preference_area_count")||this._formatOptionalCount(this._recordNumber(t,"area_count")),o=this._companionState("sensor","selected_map_preference_count")||this._formatOptionalCount(this._recordNumber(t,"preference_count"));if(!(!r&&!s&&!o))return{modeLabel:r,modeKey:i?.trim().toLowerCase(),areaCount:s,preferenceCount:o}}_plannedRunDetails(e){let t=this._entityAttributeString(e,"selected_mowing_action"),n=this._companionState("sensor","selected_mowing_action")||this._entityAttributeString(e,"selected_mowing_action_label")||this._entityAttributeString(e,"task_status_name"),i=this._companionState("sensor","selected_map")||this._entityAttributeString(e,"selected_map_label"),r=this._entityAttributeString(e,"app_current_map_label"),s=this._companionState("sensor","selected_target"),o=this._entityAttributeInteger(e,"selected_zone_id"),l=this._entityAttributeInteger(e,"selected_spot_id"),c=this._entityAttributeString(e,"selected_contour_label"),h=e.attributes.selected_map_matches_active_app_map===!1,u=s;u||(t==="edge"&&c?u=c:t==="spot"&&l!==void 0?u=`Spot #${l}`:o!==void 0?u=`Zone #${o}`:c?u=c:l!==void 0&&(u=`Spot #${l}`));let g=this._selectedMapPreferenceDetails(e);if(!n&&!i&&!r&&!u&&!h&&!g)return;let _=this._selectedZonePreferenceDetails(e,u);return{action:n,selectedMap:i,activeMap:r,target:u,needsMapSwitch:h,selectedMapPreferences:g,selectedZonePreferences:_}}_runtimeSessionDetails(){let e=this._mapEntity(),t=this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress"),n=this._companionState("sensor","runtime_current_area")||this._companionState("sensor","current_cleaned_area"),i=this._companionState("sensor","runtime_total_area"),r=this._companionState("sensor","current_zone"),s=this._companionBinaryStateLabel("bluetooth_connected","Connected","Disconnected")||void 0,o=e?this._numberAttribute(e,"runtime_track_length_m"):void 0,l=e?this._numberAttribute(e,"runtime_track_point_count"):void 0,c=e?this._numberAttribute(e,"runtime_track_segment_count"):void 0,h=e?this._numberAttribute(e,"runtime_heading_deg"):void 0,u=e?this._numberAttribute(e,"runtime_pose_x"):void 0,g=e?this._numberAttribute(e,"runtime_pose_y"):void 0,_=e&&typeof e.attributes.source=="string"&&e.attributes.source?e.attributes.source:void 0;if(t!==void 0||n!==void 0||i!==void 0||r!==void 0||o!==void 0&&o>0||l!==void 0&&l>1||c!==void 0&&c>0||h!==void 0||u!==void 0&&g!==void 0)return{missionProgress:t,currentArea:n,totalArea:i,currentZone:r,bluetoothState:s,trailLengthM:o,pointCount:l,segmentCount:c,headingDeg:h,positionX:u,positionY:g,source:_}}_renderPlannedRunPanel(e){let t=[];e.action&&t.push({label:"Action",value:e.action}),e.selectedMap&&t.push({label:"Selected Map",value:e.selectedMap}),e.activeMap&&e.activeMap!==e.selectedMap&&t.push({label:"Active Map",value:e.activeMap}),e.target&&t.push({label:"Target",value:e.target});let n=e.selectedMapPreferences;n?.modeLabel&&t.push({label:"Preference Mode",value:n.modeLabel}),n?.areaCount&&t.push({label:"Preference Areas",value:n.areaCount}),n?.preferenceCount&&t.push({label:"Stored Preferences",value:n.preferenceCount});let i=e.selectedZonePreferences;return i?.zoneLabel&&i.zoneLabel!==e.target&&t.push({label:"Zone",value:i.zoneLabel}),i?.mowingHeight&&t.push({label:"Mowing Height",value:i.mowingHeight}),i?.efficiencyMode&&t.push({label:"Efficiency",value:i.efficiencyMode}),i?.directionMode&&t.push({label:"Direction",value:i.directionMode}),i?.obstacleAvoidance&&t.push({label:"Obstacle Avoidance",value:i.obstacleAvoidance}),i?.obstacleDistance&&t.push({label:"Obstacle Distance",value:i.obstacleDistance}),i?.obstacleHeight&&t.push({label:"Obstacle Height",value:i.obstacleHeight}),i?.obstacleClasses&&t.push({label:"Obstacle AI",value:i.obstacleClasses}),!t.length&&!e.needsMapSwitch?p:d`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">Planned Run</div>
          <div class="target-badge">Start Preview</div>
        </div>
        <div class="target-grid">
          ${t.map(r=>d`
              <div class="target-metric">
                <div class="target-metric-label">${r.label}</div>
                <div class="target-metric-value">${r.value}</div>
              </div>
            `)}
        </div>
        ${n?.modeKey==="global"&&i?d`
              <div class="target-note">
                The selected map is still using global preferences, so zone-specific mowing
                settings may not apply until custom mode is enabled.
              </div>
            `:p}
        ${e.needsMapSwitch?d`
              <div class="target-note">
                The selected map does not match the mower's active app map yet. Switch maps before
                starting a scoped run.
              </div>
            `:p}
      </div>
    `}_renderRuntimeSessionPanel(e){let t=[];return e.missionProgress&&t.push({label:"Progress",value:e.missionProgress}),e.currentArea&&e.totalArea?t.push({label:"Coverage",value:`${e.currentArea} / ${e.totalArea}`}):e.currentArea&&t.push({label:"Current Area",value:e.currentArea}),e.currentZone&&t.push({label:"Current Zone",value:e.currentZone}),e.bluetoothState&&t.push({label:"Bluetooth",value:e.bluetoothState}),e.trailLengthM!==void 0&&e.trailLengthM>0&&t.push({label:"Live Trail",value:this._formatMeters(e.trailLengthM)}),e.pointCount!==void 0&&e.pointCount>1&&t.push({label:"Points",value:`${Math.round(e.pointCount)}`}),e.segmentCount!==void 0&&e.segmentCount>0&&t.push({label:"Segments",value:`${Math.round(e.segmentCount)}`}),e.headingDeg!==void 0&&t.push({label:"Heading",value:`${Math.round(e.headingDeg)}\xB0`}),e.positionX!==void 0&&e.positionY!==void 0&&t.push({label:"Position",value:`${this._formatCoordinate(e.positionX)}, ${this._formatCoordinate(e.positionY)}`}),e.source&&t.push({label:"Source",value:this._humanizeValue(e.source)}),t.length?d`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">Live Session</div>
          <div class="session-badge">Runtime Overlay</div>
        </div>
        <div class="session-subtitle">
          Current mowing telemetry from the live runtime map stream.
        </div>
        <div class="session-grid">
          ${t.map(n=>d`
              <div class="session-metric">
                <div class="session-metric-label">${n.label}</div>
                <div class="session-metric-value">${n.value}</div>
              </div>
            `)}
        </div>
      </div>
    `:p}_showMoreInfo(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(e,t){let[n,i]=e.split(".",2);if(!n||!i)throw new Error(`Invalid service '${e}'. Use domain.service format.`);await this.hass.callService(n,i,t||{})}async _selectOption(e,t){let i=t.currentTarget.value;i&&await this.hass.callService("select","select_option",{entity_id:e,option:i})}_companionEntityId(e,t){if(!this._config)return;let n=this._config.entity.split(".",2)[1];if(!n)return;let i=`${e}.${n}_${t}`;return this.hass.states[i]?i:void 0}_companionSummaryFromBinary(e,t){let n=this._companionEntityId("binary_sensor",e);if(!n)return;let i=this.hass.states[n];if(i&&i.state==="on")return t}_companionState(e,t){let n=this._companionEntityId(e,t);if(!n)return;let i=this.hass.states[n];if(!(!i||this._isUnavailableEntity(i)))return this._friendlyState(i)}_isUnavailableEntity(e){return["unknown","unavailable",""].includes(String(e.state).trim().toLowerCase())}_companionBinaryStateLabel(e,t,n){let i=this._companionEntityId("binary_sensor",e);if(!i)return;let r=this.hass.states[i];if(!(!r||this._isUnavailableEntity(r)))return r.state==="on"?t:r.state==="off"&&n?n:this._friendlyState(r)}_canStart(e){return!["mowing","returning","unavailable","unknown"].includes(e)}_canPause(e){return["mowing","returning"].includes(e)}_canDock(e){return!["docked","unavailable","unknown"].includes(e)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};m.styles=B`
    :host {
      display: block;
    }

    ha-card {
      overflow: hidden;
    }

    .wrap {
      display: grid;
      gap: 16px;
      padding: 16px;
    }

    .wrap.layout-compact {
      gap: 12px;
      padding: 12px;
    }

    .wrap.layout-wide {
      grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
      align-items: start;
    }

    .main {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .side {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 12px;
    }

    .title-block {
      min-width: 0;
    }

    .title {
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .subtitle {
      color: var(--secondary-text-color);
      margin-top: 4px;
      word-break: break-word;
    }

    .header-summary {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .summary-chip {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.82rem;
      background: color-mix(in srgb, var(--card-background-color) 94%, var(--primary-color) 6%);
      white-space: nowrap;
    }

    .state-pill {
      align-self: center;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.85rem;
      white-space: nowrap;
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
    }

    .state-pill.state-mowing {
      background: color-mix(in srgb, #173122 80%, var(--card-background-color) 20%);
      border-color: color-mix(in srgb, #4ade80 45%, var(--divider-color) 55%);
      color: #d8fbe6;
    }

    .state-pill.state-returning {
      background: color-mix(in srgb, #2d2a15 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #facc15 45%, var(--divider-color) 55%);
      color: #fff2bf;
    }

    .state-pill.state-paused {
      background: color-mix(in srgb, #2a2235 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #c084fc 45%, var(--divider-color) 55%);
      color: #f0ddff;
    }

    .state-pill.state-docked {
      background: color-mix(in srgb, #182431 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #60a5fa 45%, var(--divider-color) 55%);
      color: #d8ecff;
    }

    .state-pill.state-error {
      background: color-mix(in srgb, #351b1b 82%, var(--card-background-color) 18%);
      border-color: color-mix(in srgb, #f87171 45%, var(--divider-color) 55%);
      color: #ffd9d9;
    }

    .map {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      overflow: hidden;
      background: color-mix(in srgb, var(--card-background-color) 90%, black 10%);
      min-height: 180px;
      display: grid;
      place-items: center;
    }

    .map img {
      display: block;
      width: 100%;
      max-height: min(62vh, 560px);
      object-fit: contain;
    }

    .map-placeholder {
      min-height: 180px;
      display: grid;
      place-items: center;
      color: var(--secondary-text-color);
      padding: 16px;
      text-align: center;
    }

    .selectors {
      display: grid;
      gap: 10px;
    }

    .selector-card {
      display: grid;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      background: color-mix(in srgb, var(--card-background-color) 94%, var(--primary-color) 6%);
    }

    .selector-label {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .selector-card select {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    .target-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--primary-color) 22%, var(--divider-color) 78%);
      border-radius: 12px;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--card-background-color) 93%, var(--primary-color) 7%),
          color-mix(in srgb, var(--card-background-color) 98%, var(--primary-color) 2%)
        );
    }

    .target-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .target-title {
      font-size: 0.86rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .target-badge {
      border: 1px solid color-mix(in srgb, var(--primary-color) 28%, var(--divider-color) 72%);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: var(--secondary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
      white-space: nowrap;
    }

    .target-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .target-metric {
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      padding: 10px;
      background: color-mix(in srgb, var(--card-background-color) 96%, var(--primary-color) 4%);
      min-width: 0;
    }

    .target-metric-label {
      color: var(--secondary-text-color);
      font-size: 0.76rem;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .target-metric-value {
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }

    .target-note {
      color: var(--secondary-text-color);
      font-size: 0.84rem;
      line-height: 1.4;
    }

    .session-panel {
      display: grid;
      gap: 12px;
      padding: 14px;
      border: 1px solid color-mix(in srgb, #4ade80 32%, var(--divider-color) 68%);
      border-radius: 12px;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, #153527 18%, var(--card-background-color) 82%),
          color-mix(in srgb, var(--card-background-color) 95%, #153527 5%)
        );
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .session-title {
      font-size: 0.86rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: color-mix(in srgb, var(--primary-text-color) 86%, #4ade80 14%);
    }

    .session-badge {
      border: 1px solid color-mix(in srgb, #4ade80 34%, var(--divider-color) 66%);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 0.76rem;
      color: color-mix(in srgb, var(--primary-text-color) 78%, #4ade80 22%);
      background: color-mix(in srgb, #153527 24%, var(--card-background-color) 76%);
      white-space: nowrap;
    }

    .session-subtitle {
      color: var(--secondary-text-color);
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .session-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    }

    .session-metric {
      border: 1px solid color-mix(in srgb, #4ade80 16%, var(--divider-color) 84%);
      border-radius: 10px;
      padding: 10px;
      background: color-mix(in srgb, var(--card-background-color) 95%, #4ade80 5%);
      min-width: 0;
    }

    .session-metric-label {
      color: var(--secondary-text-color);
      font-size: 0.76rem;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .session-metric-value {
      font-size: 0.98rem;
      font-weight: 600;
      line-height: 1.25;
      word-break: break-word;
    }

    .actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .action-group {
      display: grid;
      gap: 10px;
    }

    .action-group-title {
      color: var(--secondary-text-color);
      font-size: 0.8rem;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    button {
      font: inherit;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      color: var(--primary-text-color);
      background: color-mix(in srgb, var(--card-background-color) 92%, var(--primary-color) 8%);
      cursor: pointer;
    }

    button:hover {
      background: color-mix(in srgb, var(--card-background-color) 82%, var(--primary-color) 18%);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 0;
    }

    ha-icon {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
    }

    .wrap.layout-compact .stats {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 8px;
    }

    .tile {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 12px;
      min-width: 0;
    }

    .tile-label {
      color: var(--secondary-text-color);
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    .tile-value {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.2;
      word-break: break-word;
    }

    .wrap.layout-compact .title {
      font-size: 1.15rem;
    }

    .wrap.layout-compact button {
      padding: 10px;
    }

    .wrap.layout-compact .tile {
      padding: 10px;
    }

    @media (max-width: 480px) {
      .actions {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .wrap.layout-wide {
        grid-template-columns: 1fr;
      }
    }
  `,w([U({attribute:!1})],m.prototype,"hass",2),w([q()],m.prototype,"_config",2),m=w([oe("lawn-mower-card")],m);var x=class extends y{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(t){this._config=t}render(){let t=this._config||m.getStubConfig();return d`
      <div class="editor">
        <div class="hint">
          Select a mower first. The editor will prefill common companion entities such as map, state,
          battery, and status tiles when they can be derived safely.
        </div>
        ${this._field("Mower entity",t.entity,"entity","lawn_mower.my_mower","Required lawn_mower entity.",["lawn_mower"])}
        ${this._field("Title",t.name,"name","Backyard mower","Optional card title override.")}
        ${this._layoutField(t.layout||"default")}
        ${this._field("Map camera",t.map_entity,"map_entity","camera.my_mower_live_path_map","Optional camera entity used for the map preview. Live path cameras work best when available.",["camera"])}
        ${this._toggle("Show map section",t.show_map??!!t.map_entity,"show_map")}
        ${this._field("Status entity",t.status_entity,"status_entity","sensor.my_mower_state_name","Optional entity shown under the title.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._field("Battery entity",t.battery_entity,"battery_entity","sensor.my_mower_battery","Optional entity shown as a stat tile.",["sensor","number","input_number","binary_sensor"])}
        ${this._field("Progress or status tile",t.progress_entity,"progress_entity","sensor.my_mower_progress","Optional entity shown as a second stat tile.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._toggle("Show default actions",t.show_default_actions??!0,"show_default_actions")}
        ${this._toggle("Show helper actions",t.show_helper_actions??!0,"show_helper_actions")}
        ${this._toggle("Show advanced planning and live telemetry",t.show_advanced_details??!1,"show_advanced_details")}
        ${this._controlEntitiesSection(t.control_entities||[])}
        ${this._summaryEntitiesSection(t.summary_entities||[])}
        ${this._tilesSection(t.tiles||[])}
        ${this._actionsSection(t.actions||[])}
      </div>
    `}_layoutField(t){return d`
      <label>
        <span>Layout</span>
        <select .value=${t} @change=${this._layoutChanged}>
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="wide">Wide</option>
        </select>
        <span class="hint">Choose how the card balances map, actions, and stats.</span>
      </label>
    `}_field(t,n,i,r,s,o){let l=o?.length?`lawn-mower-card-editor-${String(i)}-entities`:void 0;return d`
      <label>
        <span>${t}</span>
        <input
          .value=${n||""}
          data-key=${String(i)}
          placeholder=${r}
          list=${l||p}
          @input=${this._valueChanged}
        />
        <span class="hint">${s}</span>
        ${l?this._entityDatalist(l,o):p}
      </label>
    `}_toggle(t,n,i){return d`
      <label class="toggle">
        <span>${t}</span>
        <input
          type="checkbox"
          .checked=${n}
          data-key=${i}
          @change=${this._toggleChanged}
        />
      </label>
    `}_controlEntitiesSection(t){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Control selectors</strong>
            <span class="hint">
              Add Home Assistant select entities for map, mowing action, zone, spot, or edge controls.
            </span>
          </div>
          <button type="button" @click=${this._addControlEntity}>Add selector</button>
        </div>
        ${t.length?d`
              <div class="collection">
                ${t.map((n,i)=>d`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Select entity</span>
                          <input
                            .value=${n||""}
                            data-index=${String(i)}
                            placeholder="select.my_mower_mowing_action"
                            list="lawn-mower-card-editor-control-entities"
                            @input=${this._controlEntityChanged}
                          />
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(i)}
                          @click=${this._removeControlEntity}
                        >
                          Remove selector
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:d`
              <div class="hint">
                No explicit control selectors yet. The card will auto-detect common mower select companions
                like map, mowing action, zone, and spot when they exist.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-control-entities",["select"])}
      </div>
    `}_summaryEntitiesSection(t){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Header summary chips</strong>
            <span class="hint">Add specific entities when you want tighter control over the header summary.</span>
          </div>
          <button type="button" @click=${this._addSummaryEntity}>Add summary entity</button>
        </div>
        ${t.length?d`
              <div class="collection">
                ${t.map((n,i)=>d`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${n||""}
                            data-index=${String(i)}
                            placeholder="sensor.my_mower_weather_protection_status"
                            list="lawn-mower-card-editor-summary-entities"
                            @input=${this._summaryEntityChanged}
                          />
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(i)}
                          @click=${this._removeSummaryEntity}
                        >
                          Remove summary entity
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:d`
              <div class="hint">
                No explicit summary entities yet. The card will continue to build summary chips from battery,
                activity, task, weather, and common companion sensors automatically.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-summary-entities",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
      </div>
    `}_tilesSection(t){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Extra tiles</strong>
            <span class="hint">Add companion entities as extra stat tiles.</span>
          </div>
          <button type="button" @click=${this._addTile}>Add tile</button>
        </div>
        ${t.length?d`
              <div class="collection">
                ${t.map((n,i)=>d`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${n.entity||""}
                            data-index=${String(i)}
                            data-key="entity"
                            placeholder="sensor.my_mower_error"
                            list="lawn-mower-card-editor-tile-entities"
                            @input=${this._tileChanged}
                          />
                        </label>
                        <label>
                          <span>Label</span>
                          <input
                            .value=${n.label||""}
                            data-index=${String(i)}
                            data-key="label"
                            placeholder="Error"
                            @input=${this._tileChanged}
                          />
                        </label>
                      </div>
                      <div class="row-grid">
                        <label>
                          <span>Icon</span>
                          <input
                            .value=${n.icon||""}
                            data-index=${String(i)}
                            data-key="icon"
                            placeholder="mdi:alert-circle-outline"
                            @input=${this._tileChanged}
                          />
                          <span class="hint">Optional MDI icon for future richer tile rendering.</span>
                        </label>
                      </div>
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(i)}
                          @click=${this._removeTile}
                        >
                          Remove tile
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:d`<div class="hint">No extra tiles yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-tile-entities")}
      </div>
    `}_actionsSection(t){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Custom actions</strong>
            <span class="hint">Add extra control chips beyond the built-in mower and helper actions.</span>
          </div>
          <button type="button" @click=${this._addAction}>Add action</button>
        </div>
        ${t.length?d`
              <div class="collection">
                ${t.map((n,i)=>{let r=n.type||"more-info",s=this._serviceDataDraftError(i,n);return d`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Type</span>
                          <select
                            .value=${r}
                            data-index=${String(i)}
                            @change=${this._actionTypeChanged}
                          >
                            <option value="more-info">More info</option>
                            <option value="service">Service</option>
                            <option value="start">Start</option>
                            <option value="pause">Pause</option>
                            <option value="dock">Dock</option>
                          </select>
                        </label>
                        <label>
                          <span>Label</span>
                          <input
                            .value=${n.label||""}
                            data-index=${String(i)}
                            data-key="label"
                            placeholder="Details"
                            @input=${this._actionChanged}
                          />
                        </label>
                      </div>
                      <div class="row-grid">
                        <label>
                          <span>Icon</span>
                          <input
                            .value=${n.icon||""}
                            data-index=${String(i)}
                            data-key="icon"
                            placeholder="mdi:information-outline"
                            @input=${this._actionChanged}
                          />
                        </label>
                        ${r==="more-info"?d`
                              <label>
                                <span>Target entity</span>
                                <input
                                  .value=${n.entity||""}
                                  data-index=${String(i)}
                                  data-key="entity"
                                  placeholder="camera.my_mower_map"
                                  list="lawn-mower-card-editor-action-targets"
                                  @input=${this._actionChanged}
                                />
                                <span class="hint">Optional. Defaults to the mower entity.</span>
                              </label>
                            `:r==="service"?d`
                                <label>
                                  <span>Service</span>
                                  <input
                                    .value=${n.service||""}
                                    data-index=${String(i)}
                                    data-key="service"
                                    placeholder="button.press"
                                    @input=${this._actionChanged}
                                  />
                                </label>
                              `:d`<div></div>`}
                      </div>
                      ${r==="service"?d`
                            <div class="row-grid single">
                              <label>
                                <span>Service data</span>
                                <textarea
                                  data-index=${String(i)}
                                  placeholder='{"entity_id":"button.my_probe"}'
                                  @input=${this._actionServiceDataChanged}
                                >${this._serviceDataValue(i,n)}</textarea>
                                <span class=${`hint ${s?"error":""}`}>
                                  ${s?"Enter valid JSON before this service data can be saved.":"Optional JSON object passed to the service call."}
                                </span>
                              </label>
                            </div>
                          `:p}
                      <div class="row-actions">
                        <button
                          type="button"
                          class="danger"
                          data-index=${String(i)}
                          @click=${this._removeAction}
                        >
                          Remove action
                        </button>
                      </div>
                    </div>
                  `})}
              </div>
            `:d`<div class="hint">No custom actions yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-action-targets")}
      </div>
    `}_entityDatalist(t,n){let i=this._entityIds(n);return i.length?d`
      <datalist id=${t}>
        ${i.map(r=>d`<option value=${r}></option>`)}
      </datalist>
    `:p}_entityIds(t){if(!this.hass?.states)return[];let n=t?.length?new Set(t):void 0;return Object.keys(this.hass.states).filter(i=>{if(!n)return!0;let[r]=i.split(".");return n.has(r)}).sort((i,r)=>i.localeCompare(r))}_valueChanged(t){let n=t.currentTarget,i=n.dataset.key;if(!i)return;let r=this._config||m.getStubConfig(),s={...r},o=n.value.trim();o?s[i]=o:delete s[i],s.entity||(s.entity=m.getStubConfig().entity),i==="entity"&&o&&o!==r.entity&&this._applyEntityAutofill(s,r),this._emitConfigChanged(s)}_applyEntityAutofill(t,n){let i=this._autoDetectedCompanions(n.entity),r=this._autoDetectedCompanions(t.entity);this._replaceAutoEntityField("map_entity",t,i,r),this._replaceAutoEntityField("status_entity",t,i,r),this._replaceAutoEntityField("battery_entity",t,i,r),this._replaceAutoEntityField("progress_entity",t,i,r),this._replaceAutoControlEntities(t,i,r),this._replaceAutoSummaryEntities(t,i,r);let s=!!i.map_entity;(t.show_map===void 0||t.show_map===s)&&(r.map_entity?t.show_map=!0:delete t.show_map)}_replaceAutoControlEntities(t,n,i){let r=(t.control_entities||[]).filter(Boolean),s=Array.isArray(n.control_entities)?n.control_entities.filter(Boolean):[],o=Array.isArray(i.control_entities)?i.control_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(o.length?t.control_entities=o:delete t.control_entities)}_replaceAutoSummaryEntities(t,n,i){let r=(t.summary_entities||[]).filter(Boolean),s=Array.isArray(n.summary_entities)?n.summary_entities.filter(Boolean):[],o=Array.isArray(i.summary_entities)?i.summary_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(o.length?t.summary_entities=o:delete t.summary_entities)}_replaceAutoEntityField(t,n,i,r){let s=n[t],o=i[t],l=r[t];(!s||o!==void 0&&s===o)&&(l?n[t]=l:delete n[t])}_autoDetectedCompanions(t){if(!t||!this.hass?.states)return{};let n=t.split(".",2)[1];if(!n)return{};let i=(o,l)=>{let c=`${o}.${n}_${l}`;return this.hass.states[c]?c:void 0},r=(...o)=>o.find(l=>!!l);return{map_entity:r(i("camera","live_path_map"),i("camera","map"),i("camera","all_maps"),i("camera","map_data")),status_entity:r(i("sensor","state_name"),i("sensor","activity"),i("sensor","error")),battery_entity:i("sensor","battery"),progress_entity:r(i("sensor","runtime_mission_progress"),i("sensor","mowing_progress"),i("sensor","weather_protection_status"),i("sensor","task_status_name"),i("sensor","task_status"),i("sensor","error")),control_entities:[i("select","map"),i("select","mowing_action"),i("select","edge"),i("select","zone"),i("select","spot")].filter(o=>!!o),summary_entities:[i("sensor","runtime_mission_progress"),i("sensor","runtime_current_area"),i("sensor","runtime_total_area"),i("sensor","current_zone"),i("sensor","current_cleaned_area"),i("sensor","current_cleaning_time"),i("sensor","active_segment_count"),r(i("sensor","current_app_map_trajectory_length"),i("sensor","current_app_map_mow_path_length"),i("sensor","current_app_map_trajectory_point_count"))].filter(o=>!!o)}}_sameEntityList(t,n){return t.length===n.length&&t.every((i,r)=>i===n[r])}_toggleChanged(t){let n=t.currentTarget,i=n.dataset.key;if(!i)return;let r={...this._config||m.getStubConfig(),[i]:n.checked};r.entity||(r.entity=m.getStubConfig().entity),this._emitConfigChanged(r)}_layoutChanged(t){let n=t.currentTarget,i={...this._config||m.getStubConfig(),layout:n.value};i.entity||(i.entity=m.getStubConfig().entity),this._emitConfigChanged(i)}_addSummaryEntity(){let t=this._nextConfig();t.summary_entities=[...t.summary_entities||[],""],this._emitConfigChanged(t)}_addControlEntity(){let t=this._nextConfig();t.control_entities=[...t.control_entities||[],""],this._emitConfigChanged(t)}_removeControlEntity(t){let n=this._indexFromEvent(t);if(n===void 0)return;let i=this._nextConfig();i.control_entities=(i.control_entities||[]).filter((r,s)=>s!==n),i.control_entities.length||delete i.control_entities,this._emitConfigChanged(i)}_controlEntityChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t);if(i===void 0)return;let r=this._nextConfig(),s=[...r.control_entities||[]];s[i]=n.value.trim();let o=s.filter(Boolean);o.length?r.control_entities=o:delete r.control_entities,this._emitConfigChanged(r)}_removeSummaryEntity(t){let n=this._indexFromEvent(t);if(n===void 0)return;let i=this._nextConfig();i.summary_entities=(i.summary_entities||[]).filter((r,s)=>s!==n),i.summary_entities.length||delete i.summary_entities,this._emitConfigChanged(i)}_summaryEntityChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t);if(i===void 0)return;let r=this._nextConfig(),s=[...r.summary_entities||[]];s[i]=n.value.trim();let o=s.filter(Boolean);o.length?r.summary_entities=o:delete r.summary_entities,this._emitConfigChanged(r)}_addTile(){let t=this._nextConfig();t.tiles=[...t.tiles||[],{entity:""}],this._emitConfigChanged(t)}_removeTile(t){let n=this._indexFromEvent(t);if(n===void 0)return;let i=this._nextConfig();i.tiles=(i.tiles||[]).filter((r,s)=>s!==n),i.tiles.length||delete i.tiles,this._emitConfigChanged(i)}_tileChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t),r=n.dataset.key;if(i===void 0||!r)return;let s=this._nextConfig(),o=[...s.tiles||[]],l={...o[i]||{entity:""}},c=n.value.trim();c?l[r]=c:delete l[r],o[i]=l,s.tiles=o,this._emitConfigChanged(s)}_addAction(){let t=this._nextConfig();t.actions=[...t.actions||[],{type:"more-info"}],this._emitConfigChanged(t)}_removeAction(t){let n=this._indexFromEvent(t);if(n===void 0)return;let i=this._nextConfig();i.actions=(i.actions||[]).filter((r,s)=>s!==n),i.actions.length||delete i.actions,delete this._serviceDataDrafts[n],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,n),this._emitConfigChanged(i)}_actionChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t),r=n.dataset.key;if(i===void 0||!r)return;let s=this._nextConfig(),o=[...s.actions||[]],l={...o[i]||{type:"more-info"}},c=n.value.trim();c?l[r]=r==="service_data"?void 0:c:delete l[r],o[i]=l,s.actions=o,this._emitConfigChanged(s)}_actionTypeChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t);if(i===void 0)return;let r=this._nextConfig(),s=[...r.actions||[]],o={...s[i]||{}};o.type=n.value,o.type!=="service"&&(delete o.service,delete o.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts}),o.type!=="more-info"&&delete o.entity,s[i]=o,r.actions=s,this._emitConfigChanged(r)}_actionServiceDataChanged(t){let n=t.currentTarget,i=this._indexFromEvent(t);if(i===void 0)return;let r=n.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[i]:n.value};let s=this._nextConfig(),o=[...s.actions||[]],l={...o[i]||{type:"service"}};if(!r){delete l.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts},o[i]=l,s.actions=o,this._emitConfigChanged(s);return}try{let c=JSON.parse(r);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,o[i]=l,s.actions=o,this._emitConfigChanged(s)}catch{this.requestUpdate()}}_serviceDataValue(t,n){return t in this._serviceDataDrafts?this._serviceDataDrafts[t]:n.service_data?JSON.stringify(n.service_data,null,2):""}_serviceDataDraftError(t,n){let i=this._serviceDataValue(t,n).trim();if(!i)return!1;try{let r=JSON.parse(i);return!r||typeof r!="object"||Array.isArray(r)}catch{return!0}}_nextConfig(){let t={...this._config||m.getStubConfig()};return t.entity||(t.entity=m.getStubConfig().entity),t}_emitConfigChanged(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_indexFromEvent(t){let i=t.currentTarget?.dataset.index;if(i===void 0)return;let r=Number(i);return Number.isInteger(r)?r:void 0}_reindexDrafts(t,n){let i={};for(let[r,s]of Object.entries(t)){let o=Number(r);Number.isNaN(o)||o===n||(i[o>n?o-1:o]=s)}return i}};x.styles=B`
    :host {
      display: block;
    }

    .editor {
      display: grid;
      gap: 12px;
      padding: 16px;
    }

    label {
      display: grid;
      gap: 6px;
      font-size: 0.95rem;
    }

    .hint {
      color: var(--secondary-text-color);
      font-size: 0.8rem;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    select {
      box-sizing: border-box;
      width: 100%;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }

    .toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .toggle input {
      width: auto;
    }

    .section {
      display: grid;
      gap: 10px;
      padding: 14px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }

    .section-header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
    }

    .section-title {
      display: grid;
      gap: 4px;
    }

    .section-title strong {
      font-size: 0.95rem;
    }

    .collection {
      display: grid;
      gap: 12px;
    }

    .row {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: color-mix(in srgb, var(--card-background-color) 92%, white 8%);
    }

    .row-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .row-grid.single {
      grid-template-columns: 1fr;
    }

    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    button {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      cursor: pointer;
    }

    button.danger {
      color: #ffd7d7;
      border-color: color-mix(in srgb, #f87171 45%, var(--divider-color) 55%);
    }

    textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 110px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 10px 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      resize: vertical;
    }

    .error {
      color: #ffb4b4;
    }

    @media (max-width: 640px) {
      .row-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        display: grid;
      }
    }
  `,w([U({attribute:!1})],x.prototype,"hass",2),w([q()],x.prototype,"_config",2),w([q()],x.prototype,"_serviceDataDrafts",2),x=w([oe("lawn-mower-card-editor")],x);window.customCards=window.customCards||[];window.customCards.push({type:"lawn-mower-card",name:"Lawn Mower Card",description:"A mower-native Home Assistant card with controls, map, and status tiles."});export{m as LawnMowerCard,x as LawnMowerCardEditor};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
