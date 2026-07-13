var De=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var w=(o,e,t,i)=>{for(var n=i>1?void 0:i?Pe(e,t):e,r=o.length-1,s;r>=0;r--)(s=o[r])&&(n=(i?s(e,t,n):s(n))||n);return i&&n&&De(e,t,n),n};var W=globalThis,j=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),le=new WeakMap,P=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(j&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=le.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&le.set(t,e))}return e}toString(){return this.cssText}},ce=o=>new P(typeof o=="string"?o:o+"",void 0,K),B=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((i,n,r)=>i+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+o[r+1],o[0]);return new P(t,o,K)},de=(o,e)=>{if(j)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),n=W.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,o.appendChild(i)}},J=j?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return ce(t)})(o):o;var{is:Le,defineProperty:He,getOwnPropertyDescriptor:ze,getOwnPropertyNames:Te,getOwnPropertySymbols:Oe,getPrototypeOf:Ne}=Object,F=globalThis,ue=F.trustedTypes,Re=ue?ue.emptyScript:"",Ue=F.reactiveElementPolyfillSupport,L=(o,e)=>o,H={toAttribute(o,e){switch(e){case Boolean:o=o?Re:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},V=(o,e)=>!Le(o,e),pe={attribute:!0,type:String,converter:H,reflect:!1,useDefault:!1,hasChanged:V};Symbol.metadata??=Symbol("metadata"),F.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=pe){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),n=this.getPropertyDescriptor(e,i,t);n!==void 0&&He(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){let{get:n,set:r}=ze(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:n,set(s){let a=n?.call(this);r?.call(this,s),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??pe}static _$Ei(){if(this.hasOwnProperty(L("elementProperties")))return;let e=Ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(L("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(L("properties"))){let t=this.properties,i=[...Te(t),...Oe(t)];for(let n of i)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,n]of t)this.elementProperties.set(i,n)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let n=this._$Eu(t,i);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let n of i)t.unshift(J(n))}else e!==void 0&&t.push(J(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return de(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(n!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:H).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,t){let i=this.constructor,n=i._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let r=i.getPropertyOptions(n),s=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:H;this._$Em=n;let a=s.fromAttribute(t,r.type);this[n]=a??this._$Ej?.get(n)??a,this._$Em=null}}requestUpdate(e,t,i,n=!1,r){if(e!==void 0){let s=this.constructor;if(n===!1&&(r=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??V)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:r},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),r!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[n,r]of i){let{wrapped:s}=r,a=this[n];s!==!0||this._$AL.has(n)||a===void 0||this.C(n,void 0,r,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[L("elementProperties")]=new Map,b[L("finalized")]=new Map,Ue?.({ReactiveElement:b}),(F.reactiveElementVersions??=[]).push("2.1.2");var ie=globalThis,he=o=>o,Z=ie.trustedTypes,ge=Z?Z.createPolicy("lit-html",{createHTML:o=>o}):void 0,ye="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,we="?"+$,We=`<${we}>`,S=document,T=()=>S.createComment(""),O=o=>o===null||typeof o!="object"&&typeof o!="function",ne=Array.isArray,je=o=>ne(o)||typeof o?.[Symbol.iterator]=="function",Y=`[ 	
\f\r]`,z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_e=/-->/g,me=/>/g,C=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),fe=/'/g,ve=/"/g,$e=/^(?:script|style|textarea|title)$/i,re=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),u=re(1),tt=re(2),it=re(3),E=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),be=new WeakMap,A=S.createTreeWalker(S,129);function xe(o,e){if(!ne(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ge!==void 0?ge.createHTML(e):e}var Be=(o,e)=>{let t=o.length-1,i=[],n,r=e===2?"<svg>":e===3?"<math>":"",s=z;for(let a=0;a<t;a++){let l=o[a],c,h,d=-1,g=0;for(;g<l.length&&(s.lastIndex=g,h=s.exec(l),h!==null);)g=s.lastIndex,s===z?h[1]==="!--"?s=_e:h[1]!==void 0?s=me:h[2]!==void 0?($e.test(h[2])&&(n=RegExp("</"+h[2],"g")),s=C):h[3]!==void 0&&(s=C):s===C?h[0]===">"?(s=n??z,d=-1):h[1]===void 0?d=-2:(d=s.lastIndex-h[2].length,c=h[1],s=h[3]===void 0?C:h[3]==='"'?ve:fe):s===ve||s===fe?s=C:s===_e||s===me?s=z:(s=C,n=void 0);let _=s===C&&o[a+1].startsWith("/>")?" ":"";r+=s===z?l+We:d>=0?(i.push(c),l.slice(0,d)+ye+l.slice(d)+$+_):l+$+(d===-2?a:_)}return[xe(o,r+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},N=class o{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let r=0,s=0,a=e.length-1,l=this.parts,[c,h]=Be(e,t);if(this.el=o.createElement(c,i),A.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=A.nextNode())!==null&&l.length<a;){if(n.nodeType===1){if(n.hasAttributes())for(let d of n.getAttributeNames())if(d.endsWith(ye)){let g=h[s++],_=n.getAttribute(d).split($),f=/([.?@])?(.*)/.exec(g);l.push({type:1,index:r,name:f[2],strings:_,ctor:f[1]==="."?G:f[1]==="?"?Q:f[1]==="@"?ee:M}),n.removeAttribute(d)}else d.startsWith($)&&(l.push({type:6,index:r}),n.removeAttribute(d));if($e.test(n.tagName)){let d=n.textContent.split($),g=d.length-1;if(g>0){n.textContent=Z?Z.emptyScript:"";for(let _=0;_<g;_++)n.append(d[_],T()),A.nextNode(),l.push({type:2,index:++r});n.append(d[g],T())}}}else if(n.nodeType===8)if(n.data===we)l.push({type:2,index:r});else{let d=-1;for(;(d=n.data.indexOf($,d+1))!==-1;)l.push({type:7,index:r}),d+=$.length-1}r++}}static createElement(e,t){let i=S.createElement("template");return i.innerHTML=e,i}};function k(o,e,t=o,i){if(e===E)return e;let n=i!==void 0?t._$Co?.[i]:t._$Cl,r=O(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(o),n._$AT(o,t,i)),i!==void 0?(t._$Co??=[])[i]=n:t._$Cl=n),n!==void 0&&(e=k(o,n._$AS(o,e.values),n,i)),e}var X=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??S).importNode(t,!0);A.currentNode=n;let r=A.nextNode(),s=0,a=0,l=i[0];for(;l!==void 0;){if(s===l.index){let c;l.type===2?c=new R(r,r.nextSibling,this,e):l.type===1?c=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(c=new te(r,this,e)),this._$AV.push(c),l=i[++a]}s!==l?.index&&(r=A.nextNode(),s++)}return A.currentNode=S,n}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},R=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=k(this,e,t),O(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==E&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):je(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,n=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=N.createElement(xe(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{let r=new X(n,this),s=r.u(this.options);r.p(t),this.T(s),this._$AH=r}}_$AC(e){let t=be.get(e.strings);return t===void 0&&be.set(e.strings,t=new N(e)),t}k(e){ne(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,n=0;for(let r of e)n===t.length?t.push(i=new o(this.O(T()),this.O(T()),this,this.options)):i=t[n],i._$AI(r),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=he(e).nextSibling;he(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(e,t=this,i,n){let r=this.strings,s=!1;if(r===void 0)e=k(this,e,t,0),s=!O(e)||e!==this._$AH&&e!==E,s&&(this._$AH=e);else{let a=e,l,c;for(e=r[0],l=0;l<r.length-1;l++)c=k(this,a[i+l],t,l),c===E&&(c=this._$AH[l]),s||=!O(c)||c!==this._$AH[l],c===p?e=p:e!==p&&(e+=(c??"")+r[l+1]),this._$AH[l]=c}s&&!n&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},G=class extends M{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}},Q=class extends M{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}},ee=class extends M{constructor(e,t,i,n,r){super(e,t,i,n,r),this.type=5}_$AI(e,t=this){if((e=k(this,e,t,0)??p)===E)return;let i=this._$AH,n=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==p&&(i===p||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},te=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){k(this,e)}};var Fe=ie.litHtmlPolyfillSupport;Fe?.(N,R),(ie.litHtmlVersions??=[]).push("3.3.2");var Ce=(o,e,t)=>{let i=t?.renderBefore??e,n=i._$litPart$;if(n===void 0){let r=t?.renderBefore??null;i._$litPart$=n=new R(e.insertBefore(T(),r),r,void 0,t??{})}return n._$AI(o),n};var se=globalThis,y=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};y._$litElement$=!0,y.finalized=!0,se.litElementHydrateSupport?.({LitElement:y});var Ve=se.litElementPolyfillSupport;Ve?.({LitElement:y});(se.litElementVersions??=[]).push("4.2.2");var oe=o=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(o,e)}):customElements.define(o,e)};var Ze={attribute:!0,type:String,converter:H,reflect:!1,hasChanged:V},qe=(o=Ze,e,t)=>{let{kind:i,metadata:n}=t,r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),i==="setter"&&((o=Object.create(o)).wrapped=!0),r.set(t.name,o),i==="accessor"){let{name:s}=t;return{set(a){let l=e.get.call(this);e.set.call(this,a),this.requestUpdate(s,l,o,!0,a)},init(a){return a!==void 0&&this.C(s,void 0,o,a),a}}}if(i==="setter"){let{name:s}=t;return function(a){let l=this[s];e.call(this,a),this.requestUpdate(s,l,o,!0,a)}}throw Error("Unsupported decorator location: "+i)};function U(o){return(e,t)=>typeof t=="object"?qe(o,e,t):((i,n,r)=>{let s=n.hasOwnProperty(r);return n.constructor.createProperty(r,i),s?Object.getOwnPropertyDescriptor(n,r):void 0})(o,e,t)}function q(o){return U({...o,state:!0,attribute:!1})}function Ae(o){return o.split(".",2)[1]||void 0}function Ie(o,e){let t=Ae(e);if(!t)return[];let i=d=>{let g=`select.${t}_${d}`;return o[g]?g:void 0},n={map:i("map"),mowing_action:i("mowing_action"),edge:i("edge"),zone:i("zone"),spot:i("spot")},r=Object.values(n).filter(d=>!!d),s=i("mowing_action");if(!s)return r;let a=o[s]?.state.trim().toLowerCase()||"",l=a.includes("zone")?"zone":a.includes("spot")?"spot":a.includes("edge")||a.includes("border")?"edge":void 0,c=new Set([n.edge,n.zone,n.spot].filter(d=>!!d)),h=l?n[l]:void 0;return r.filter(d=>!c.has(d)||d===h)}function Se(o,e,t){let i=t?.filter(Boolean)||[];return i.length?i:Ie(o,e)}function Ee(o){return o?.filter(Boolean)||[]}function ae(o,e,t){let i=e.attributes?.friendly_name;return typeof i=="string"&&i.trim()?i.trim():t||o.split(".")[1]?.replace(/_/g," ")||o}function ke(o,e,t=4){return[...new Set([...o,...e])].slice(0,t)}function Me(o,e){let t=Ae(e);if(!t)return[];let i=(r,s)=>{let a=`${r}.${t}_${s}`;if(o[a])return a;let l=`_${t}_${s}`,c=Object.keys(o).filter(h=>h.startsWith(`${r}.`)&&h.endsWith(l));return c.length===1?c[0]:void 0};return[{entityId:i("camera","live_video"),label:"Live Video",icon:"mdi:video-wireless-outline"},{entityId:i("calendar","schedule"),label:"Schedule",icon:"mdi:calendar"},{entityId:i("camera","live_path_map"),label:"Live Map",icon:"mdi:map-marker-path"},{entityId:i("camera","all_maps"),label:"All Maps",icon:"mdi:map-multiple-outline"}].filter(r=>!!r.entityId)}var Ke={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},Je={"charging completed":"charging completed","rain protection enabled":"rain protection enabled","rain protection disabled":"rain protection disabled","rain delay active":"rain delay active","rain delay inactive":"rain delay inactive","no error":"no error","task unknown":"task unknown"},m=class extends y{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(e){if(!e.entity)throw new Error("The 'entity' option is required.");this._config=e}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return p;let e=this.hass.states[this._config.entity];if(!e)return u`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let t=this._config.name||this._friendlyName(e)||this._entityName(this._config.entity),i=this._config.layout||"default",n=this._entityState(this._config.status_entity)||this._friendlyMowerState(e.state),r=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,s=r?this._cameraUrl(r):void 0,a=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(e.state),h=this._buildHeaderSummary(),d=this._resolvedControlEntities(),g=this._plannedRunDetails(e),_=this._runtimeSessionDetails(),f=this._config.show_advanced_details??!1;return u`
      <ha-card>
        <div class=${`wrap layout-${i}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${t}</div>
                <div class="subtitle">${n}</div>
                ${h.length?u`
                      <div class="header-summary">
                        ${h.map(v=>u`<div class="summary-chip">${v}</div>`)}
                      </div>
                    `:p}
              </div>
              <div class=${`state-pill state-${e.state}`}>${this._friendlyMowerState(e.state)}</div>
            </div>

            ${a?u`
                  <div class="map">
                    ${s?u`<img src=${s} alt=${t} />`:u`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `:p}
          </div>

          <div class="side">
            ${f&&g?this._renderPlannedRunPanel(g):p}

            ${f&&_?this._renderRuntimeSessionPanel(_):p}

            ${d.length?u`
                  <div class="selectors">
                    ${d.map(v=>this._renderSelectControl(v))}
                  </div>
                `:p}

            ${c.length?u`
                  ${c.map(v=>u`
                      <div class="action-group">
                        ${c.length>1?u`<div class="action-group-title">${v.title}</div>`:p}
                        <div class="actions">
                          ${v.actions.map(D=>u`
                              <button @click=${D.handler} ?disabled=${D.disabled}>
                                <span class="button-content">
                                  ${D.icon?u`<ha-icon .icon=${D.icon}></ha-icon>`:p}
                                  <span>${D.label}</span>
                                </span>
                              </button>
                            `)}
                        </div>
                      </div>
                    `)}
                `:p}

            ${l.length?u`
                  <div class="stats">
                    ${l.map(v=>u`
                        <div class="tile">
                          <div class="tile-label">${v.label}</div>
                          <div class="tile-value">${v.value}</div>
                        </div>
                      `)}
                  </div>
                `:p}
          </div>
        </div>
      </ha-card>
    `}getCardSize(){let e=this._config?.show_map??!!this._config?.map_entity,t=this._config?.layout||"default";return t==="compact"?e?8:6:t==="wide"?e?10:8:e?9:7}_buildTiles(){return!this._config||!this.hass?[]:(this._config.tiles||[]).map(e=>this._tileFromEntity(e.entity,e.label,e.icon)).filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let e=[],t=[],i=this.hass.states[this._config.entity];if(!i)return e;let n=this._stringAttribute(i,"error_display")||this._stringAttribute(i,"error_text");n&&!["none","no error"].includes(n.toLowerCase())&&e.push(`Error ${n}`);let r=this._entityState(this._config.battery_entity)||this._stringAttribute(i,"battery_level","%");r&&e.push(`Battery ${r}`);let s=Ee(this._config.summary_entities);if(s.length)for(let l of s){let c=this.hass.states[l];if(!c||this._isUnavailableEntity(c))continue;let h=ae(l,c,this._preferredEntityLabel(l));t.push(`${h} ${this._friendlyState(c)}`)}else{let l=this._config.progress_entity,c=l?this.hass.states[l]:void 0,h=this._entityState(l),d=h||this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress");if(d){let f=h&&c&&l?ae(l,c,this._preferredEntityLabel(l)):"Progress";e.push(`${f} ${d}`)}let g=this._companionState("sensor","runtime_current_area"),_=this._companionState("sensor","runtime_total_area");g&&_&&e.push(`Coverage ${g} / ${_}`)}let a=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");return a&&e.push(a),ke(t,e)}_resolvedControlEntities(){if(!this._config)return[];let e=(this._config.control_entities||[]).filter(Boolean);return!this._config.entity||!this.hass?.states?[]:Se(this.hass.states,this._config.entity,e)}_renderSelectControl(e){let t=this.hass.states[e];if(!t)return p;let i=Array.isArray(t.attributes.options)?t.attributes.options.filter(s=>typeof s=="string"):[];if(!i.length)return p;let n=this._friendlyName(t)||this._preferredEntityLabel(e)||this._entityName(e),r=["unavailable","unknown"].includes(String(t.state));return u`
      <label class="selector-card">
        <span class="selector-label">${n}</span>
        <select
          .value=${String(t.state)}
          ?disabled=${r}
          @change=${s=>this._selectOption(e,s)}
        >
          ${i.map(s=>u`<option value=${s}>${s}</option>`)}
        </select>
      </label>
    `}_buildActionGroups(e){if(!this._config)return[];let t=[];(this._config.show_default_actions??!0)&&t.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()});let i=[];(this._config.show_helper_actions??!0)&&i.push(...this._buildHelperActions());let n=[];for(let r of this._config.actions||[]){let s=this._buildConfiguredAction(r,e);s&&n.push(s)}return[{title:"Controls",actions:t},{title:"Helpers",actions:i},{title:"Custom",actions:n}].filter(r=>r.actions.length)}_buildConfiguredAction(e,t){let i=e.type||"more-info";if(i==="start")return{label:e.label||"Start",icon:e.icon||"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()};if(i==="pause")return{label:e.label||"Pause",icon:e.icon||"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()};if(i==="dock")return{label:e.label||"Dock",icon:e.icon||"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()};if(i==="more-info")return{label:e.label||"Details",icon:e.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(e.entity)};if(i==="service"&&e.service)return{label:e.label||e.service,icon:e.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(e.service,e.service_data)}}_buildHelperActions(){return this._config?Me(this.hass.states,this._config.entity).map(e=>({label:e.label,icon:e.icon,disabled:!1,handler:()=>this._showMoreInfo(e.entityId)})):[]}_tileFromEntity(e,t,i){let n=this.hass.states[e];if(!n||this._isUnavailableEntity(n))return{label:t||this._preferredEntityLabel(e),value:"Unavailable"};let r=t||this._friendlyName(n)||this._preferredEntityLabel(e),s=this._friendlyState(n);return{label:i?`${i} ${r}`:r,value:s}}_friendlyState(e){let t=e.attributes.unit_of_measurement;return typeof t=="string"&&t?`${e.state} ${t}`:this._humanizeEntityState(e.entity_id,String(e.state))}_entityState(e){if(!e)return;let t=this.hass.states[e];return t&&!this._isUnavailableEntity(t)?this._friendlyState(t):void 0}_stringAttribute(e,t,i){let n=e.attributes[t];if(!(n==null||n===""))return i?`${String(n)} ${i}`:this._humanizeValue(String(n))}_humanizeValue(e){let t=e.trim();if(!t)return t;let i=Ke[t];if(i)return i;let n=t.replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(!n)return t;let r=n.toLowerCase(),s=Je[r]||r;return s.charAt(0).toUpperCase()+s.slice(1)}_humanizeEntityState(e,t){let i=t.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(e.endsWith("_weather_protection_status")){if(i==="rain protection enabled"||i==="enabled")return"Enabled";if(i==="rain protection disabled"||i==="disabled")return"Disabled"}return(e.endsWith("_task_status")||e.endsWith("_task_status_name"))&&this._isUnknownLike(t)?"Unknown":this._humanizeValue(t)}_isUnknownLike(e){let t=e.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();return["unknown","unavailable","none","task unknown"].includes(t)}_preferredEntityLabel(e,t){return e.endsWith("_weather_protection_status")?"Rain protection":e.endsWith("_state_name")?"State":e.endsWith("_task_status")||e.endsWith("_task_status_name")?"Task":e.endsWith("_battery")?"Battery":e.endsWith("_selected_mowing_action")?"Selected Action":e.endsWith("_selected_target")?"Selected Target":e.endsWith("_selected_map")?"Selected Map":e.endsWith("_selected_zone_mowing_height")?"Mowing Height":e.endsWith("_selected_zone_efficiency_mode")?"Efficiency":e.endsWith("_selected_zone_direction_mode")?"Direction":e.endsWith("_selected_zone_obstacle_avoidance")?"Obstacle Avoidance":e.endsWith("_selected_zone_obstacle_distance")?"Obstacle Distance":e.endsWith("_selected_zone_obstacle_height")?"Obstacle Height":e.endsWith("_selected_zone_obstacle_classes")?"Obstacle Classes":e.endsWith("_mowing_action")?"Mowing Action":e.endsWith("_zone")?"Zone":e.endsWith("_spot")?"Spot":e.endsWith("_map")?"Map":e.endsWith("_mowing_progress")?"Progress":e.endsWith("_runtime_mission_progress")?"Mission Progress":e.endsWith("_runtime_current_area")?"Current Area":e.endsWith("_runtime_total_area")?"Total Area":e.endsWith("_runtime_position_x")?"Position X":e.endsWith("_runtime_position_y")?"Position Y":e.endsWith("_runtime_heading")?"Heading":e.endsWith("_runtime_live_track_length")?"Live Trail":e.endsWith("_runtime_live_track_point_count")?"Live Points":e.endsWith("_runtime_live_track_segment_count")?"Live Segments":e.endsWith("_current_cleaned_area")?"Cut Area":e.endsWith("_current_cleaning_time")?"Time":e.endsWith("_current_zone")?"Current Zone":e.endsWith("_active_segment_count")?"Active Segments":e.endsWith("_current_app_map_area")?"Map Area":e.endsWith("_current_app_map_zone_count")?"Zones":e.endsWith("_current_app_map_spot_count")?"Spots":e.endsWith("_current_app_map_trajectory_point_count")?"Path Points":e.endsWith("_current_app_map_trajectory_length")?"Path Length":e.endsWith("_current_app_map_mow_path_length")?"Trail Length":e.endsWith("_current_app_map_cut_relation_count")?"Cut Links":e.endsWith("_error")?"Error":t||this._entityName(e)}_friendlyName(e){let t=e.attributes.friendly_name;return typeof t=="string"?t:void 0}_entityName(e){return e.split(".")[1]?.replace(/_/g," ")||e}_friendlyMowerState(e){return this._humanizeValue(e)}_cameraUrl(e){let t=e.attributes.entity_picture;return typeof t=="string"&&t?t:`/api/camera_proxy/${e.entity_id}?v=${Date.now()}`}_mapEntity(){if(this._config?.map_entity)return this.hass.states[this._config.map_entity]}_entityAttributeString(e,t){let i=e.attributes[t];return typeof i=="string"&&i.trim()?i.trim():void 0}_entityAttributeInteger(e,t){let i=e.attributes[t];return typeof i=="number"&&Number.isInteger(i)?i:void 0}_entityAttributeRecord(e,t){let i=e.attributes[t];return i&&typeof i=="object"&&!Array.isArray(i)?i:void 0}_recordString(e,t){let i=e?.[t];return typeof i=="string"&&i.trim()?i.trim():void 0}_recordNumber(e,t){let i=e?.[t];return typeof i=="number"&&Number.isFinite(i)?i:void 0}_recordBoolean(e,t){let i=e?.[t];return typeof i=="boolean"?i:void 0}_recordStringArray(e,t){let i=e?.[t];return Array.isArray(i)&&i.every(n=>typeof n=="string")?i:void 0}_numberAttribute(e,t){let i=e.attributes[t];if(typeof i=="number"&&Number.isFinite(i))return i;if(typeof i=="string"&&i.trim()){let n=Number(i);if(Number.isFinite(n))return n}}_formatMeters(e){let t=e>=10?1:2;return`${e.toFixed(t)} m`}_formatCoordinate(e){return Number.isInteger(e)?`${e}`:e.toFixed(1)}_formatCentimeters(e){return`${Number.isInteger(e)?`${Math.round(e)}`:e.toFixed(1)} cm`}_formatOptionalCentimeters(e){return e!==void 0?this._formatCentimeters(e):void 0}_humanizedOptionalBoolean(e){if(e!==void 0)return e?"Enabled":"Disabled"}_humanizedOptionalList(e){if(e?.length)return e.map(t=>this._humanizeValue(t)).join(", ")}_humanizedOptionalValue(e){return e?this._humanizeValue(e):void 0}_formatOptionalCount(e){if(e!==void 0)return`${Math.round(e)}`}_selectedZoneDirectionLabel(e){let t=this._recordString(e,"mowing_direction_mode_name"),i=this._recordNumber(e,"mowing_direction_degrees"),n=this._humanizedOptionalValue(t);if(n&&i!==void 0)return`${n} (${Math.round(i)}\xB0)`;if(n)return n;if(i!==void 0)return`${Math.round(i)}\xB0`}_selectedZonePreferenceDetails(e,t){let i=this._entityAttributeInteger(e,"selected_zone_id"),n=this._entityAttributeString(e,"selected_mowing_action"),r=this._entityAttributeRecord(e,"selected_zone_preference"),s=t?.toLowerCase();if(!(n==="zone"||(s?.includes("zone")??!1)))return;let l=this._companionState("sensor","selected_zone_mowing_height")||this._formatOptionalCentimeters(this._recordNumber(r,"mowing_height_cm")),c=this._companionState("sensor","selected_zone_efficiency_mode")||this._humanizedOptionalValue(this._recordString(r,"efficient_mode_name")),h=this._companionState("sensor","selected_zone_direction_mode")||this._selectedZoneDirectionLabel(r),d=this._companionState("sensor","selected_zone_obstacle_avoidance")||this._humanizedOptionalBoolean(this._recordBoolean(r,"obstacle_avoidance_enabled")),g=this._companionState("sensor","selected_zone_obstacle_distance")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_distance_cm")),_=this._companionState("sensor","selected_zone_obstacle_height")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_height_cm")),f=this._companionState("sensor","selected_zone_obstacle_classes")||this._humanizedOptionalList(this._recordStringArray(r,"obstacle_avoidance_ai_classes")),v=this._recordString(r,"label")||(i!==void 0?`Zone #${i}`:void 0);if(!(!v&&!l&&!c&&!h&&!d&&!g&&!_&&!f))return{zoneLabel:v,mowingHeight:l,efficiencyMode:c,directionMode:h,obstacleAvoidance:d,obstacleDistance:g,obstacleHeight:_,obstacleClasses:f}}_selectedMapPreferenceDetails(e){let t=this._entityAttributeRecord(e,"selected_map_preference"),i=this._companionState("sensor","selected_map_preference_mode"),n=this._recordString(t,"mode_name")||this._entityAttributeString(e,"selected_map_preference_mode"),r=i||this._humanizedOptionalValue(n),s=this._companionState("sensor","selected_map_preference_area_count")||this._formatOptionalCount(this._recordNumber(t,"area_count")),a=this._companionState("sensor","selected_map_preference_count")||this._formatOptionalCount(this._recordNumber(t,"preference_count"));if(!(!r&&!s&&!a))return{modeLabel:r,modeKey:n?.trim().toLowerCase(),areaCount:s,preferenceCount:a}}_plannedRunDetails(e){let t=this._entityAttributeString(e,"selected_mowing_action"),i=this._companionState("sensor","selected_mowing_action")||this._entityAttributeString(e,"selected_mowing_action_label")||this._entityAttributeString(e,"task_status_name"),n=this._companionState("sensor","selected_map")||this._entityAttributeString(e,"selected_map_label"),r=this._entityAttributeString(e,"app_current_map_label"),s=this._companionState("sensor","selected_target"),a=this._entityAttributeInteger(e,"selected_zone_id"),l=this._entityAttributeInteger(e,"selected_spot_id"),c=this._entityAttributeString(e,"selected_contour_label"),h=e.attributes.selected_map_matches_active_app_map===!1,d=s;d||(t==="edge"&&c?d=c:t==="spot"&&l!==void 0?d=`Spot #${l}`:a!==void 0?d=`Zone #${a}`:c?d=c:l!==void 0&&(d=`Spot #${l}`));let g=this._selectedMapPreferenceDetails(e);if(!i&&!n&&!r&&!d&&!h&&!g)return;let _=this._selectedZonePreferenceDetails(e,d);return{action:i,selectedMap:n,activeMap:r,target:d,needsMapSwitch:h,selectedMapPreferences:g,selectedZonePreferences:_}}_runtimeSessionDetails(){let e=this._mapEntity(),t=this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress"),i=this._companionState("sensor","runtime_current_area")||this._companionState("sensor","current_cleaned_area"),n=this._companionState("sensor","runtime_total_area"),r=this._companionState("sensor","current_zone"),s=this._companionBinaryStateLabel("bluetooth_connected","Connected","Disconnected")||void 0,a=e?this._numberAttribute(e,"runtime_track_length_m"):void 0,l=e?this._numberAttribute(e,"runtime_track_point_count"):void 0,c=e?this._numberAttribute(e,"runtime_track_segment_count"):void 0,h=e?this._numberAttribute(e,"runtime_heading_deg"):void 0,d=e?this._numberAttribute(e,"runtime_pose_x"):void 0,g=e?this._numberAttribute(e,"runtime_pose_y"):void 0,_=e&&typeof e.attributes.source=="string"&&e.attributes.source?e.attributes.source:void 0;if(t!==void 0||i!==void 0||n!==void 0||r!==void 0||a!==void 0&&a>0||l!==void 0&&l>1||c!==void 0&&c>0||h!==void 0||d!==void 0&&g!==void 0)return{missionProgress:t,currentArea:i,totalArea:n,currentZone:r,bluetoothState:s,trailLengthM:a,pointCount:l,segmentCount:c,headingDeg:h,positionX:d,positionY:g,source:_}}_renderPlannedRunPanel(e){let t=[];e.action&&t.push({label:"Action",value:e.action}),e.selectedMap&&t.push({label:"Selected Map",value:e.selectedMap}),e.activeMap&&e.activeMap!==e.selectedMap&&t.push({label:"Active Map",value:e.activeMap}),e.target&&t.push({label:"Target",value:e.target});let i=e.selectedMapPreferences;i?.modeLabel&&t.push({label:"Preference Mode",value:i.modeLabel}),i?.areaCount&&t.push({label:"Preference Areas",value:i.areaCount}),i?.preferenceCount&&t.push({label:"Stored Preferences",value:i.preferenceCount});let n=e.selectedZonePreferences;return n?.zoneLabel&&n.zoneLabel!==e.target&&t.push({label:"Zone",value:n.zoneLabel}),n?.mowingHeight&&t.push({label:"Mowing Height",value:n.mowingHeight}),n?.efficiencyMode&&t.push({label:"Efficiency",value:n.efficiencyMode}),n?.directionMode&&t.push({label:"Direction",value:n.directionMode}),n?.obstacleAvoidance&&t.push({label:"Obstacle Avoidance",value:n.obstacleAvoidance}),n?.obstacleDistance&&t.push({label:"Obstacle Distance",value:n.obstacleDistance}),n?.obstacleHeight&&t.push({label:"Obstacle Height",value:n.obstacleHeight}),n?.obstacleClasses&&t.push({label:"Obstacle AI",value:n.obstacleClasses}),!t.length&&!e.needsMapSwitch?p:u`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">Planned Run</div>
          <div class="target-badge">Start Preview</div>
        </div>
        <div class="target-grid">
          ${t.map(r=>u`
              <div class="target-metric">
                <div class="target-metric-label">${r.label}</div>
                <div class="target-metric-value">${r.value}</div>
              </div>
            `)}
        </div>
        ${i?.modeKey==="global"&&n?u`
              <div class="target-note">
                The selected map is still using global preferences, so zone-specific mowing
                settings may not apply until custom mode is enabled.
              </div>
            `:p}
        ${e.needsMapSwitch?u`
              <div class="target-note">
                The selected map does not match the mower's active app map yet. Switch maps before
                starting a scoped run.
              </div>
            `:p}
      </div>
    `}_renderRuntimeSessionPanel(e){let t=[];return e.missionProgress&&t.push({label:"Progress",value:e.missionProgress}),e.currentArea&&e.totalArea?t.push({label:"Coverage",value:`${e.currentArea} / ${e.totalArea}`}):e.currentArea&&t.push({label:"Current Area",value:e.currentArea}),e.currentZone&&t.push({label:"Current Zone",value:e.currentZone}),e.bluetoothState&&t.push({label:"Bluetooth",value:e.bluetoothState}),e.trailLengthM!==void 0&&e.trailLengthM>0&&t.push({label:"Live Trail",value:this._formatMeters(e.trailLengthM)}),e.pointCount!==void 0&&e.pointCount>1&&t.push({label:"Points",value:`${Math.round(e.pointCount)}`}),e.segmentCount!==void 0&&e.segmentCount>0&&t.push({label:"Segments",value:`${Math.round(e.segmentCount)}`}),e.headingDeg!==void 0&&t.push({label:"Heading",value:`${Math.round(e.headingDeg)}\xB0`}),e.positionX!==void 0&&e.positionY!==void 0&&t.push({label:"Position",value:`${this._formatCoordinate(e.positionX)}, ${this._formatCoordinate(e.positionY)}`}),e.source&&t.push({label:"Source",value:this._humanizeValue(e.source)}),t.length?u`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">Live Session</div>
          <div class="session-badge">Runtime Overlay</div>
        </div>
        <div class="session-subtitle">
          Current mowing telemetry from the live runtime map stream.
        </div>
        <div class="session-grid">
          ${t.map(i=>u`
              <div class="session-metric">
                <div class="session-metric-label">${i.label}</div>
                <div class="session-metric-value">${i.value}</div>
              </div>
            `)}
        </div>
      </div>
    `:p}_showMoreInfo(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(e,t){let[i,n]=e.split(".",2);if(!i||!n)throw new Error(`Invalid service '${e}'. Use domain.service format.`);await this.hass.callService(i,n,t||{})}async _selectOption(e,t){let n=t.currentTarget.value;n&&await this.hass.callService("select","select_option",{entity_id:e,option:n})}_companionEntityId(e,t){if(!this._config)return;let i=this._config.entity.split(".",2)[1];if(!i)return;let n=`${e}.${i}_${t}`;return this.hass.states[n]?n:void 0}_companionSummaryFromBinary(e,t){let i=this._companionEntityId("binary_sensor",e);if(!i)return;let n=this.hass.states[i];if(n&&n.state==="on")return t}_companionState(e,t){let i=this._companionEntityId(e,t);if(!i)return;let n=this.hass.states[i];if(!(!n||this._isUnavailableEntity(n)))return this._friendlyState(n)}_isUnavailableEntity(e){return["unknown","unavailable",""].includes(String(e.state).trim().toLowerCase())}_companionBinaryStateLabel(e,t,i){let n=this._companionEntityId("binary_sensor",e);if(!n)return;let r=this.hass.states[n];if(!(!r||this._isUnavailableEntity(r)))return r.state==="on"?t:r.state==="off"&&i?i:this._friendlyState(r)}_canStart(e){return!["mowing","returning","unavailable","unknown"].includes(e)}_canPause(e){return["mowing","returning"].includes(e)}_canDock(e){return!["docked","unavailable","unknown"].includes(e)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};m.styles=B`
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
  `,w([U({attribute:!1})],m.prototype,"hass",2),w([q()],m.prototype,"_config",2),m=w([oe("lawn-mower-card")],m);var x=class extends y{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(t){this._config=t}render(){let t=this._config||m.getStubConfig();return u`
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
    `}_layoutField(t){return u`
      <label>
        <span>Layout</span>
        <select .value=${t} @change=${this._layoutChanged}>
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="wide">Wide</option>
        </select>
        <span class="hint">Choose how the card balances map, actions, and stats.</span>
      </label>
    `}_field(t,i,n,r,s,a){let l=a?.length?`lawn-mower-card-editor-${String(n)}-entities`:void 0;return u`
      <label>
        <span>${t}</span>
        <input
          .value=${i||""}
          data-key=${String(n)}
          placeholder=${r}
          list=${l||p}
          @input=${this._valueChanged}
        />
        <span class="hint">${s}</span>
        ${l?this._entityDatalist(l,a):p}
      </label>
    `}_toggle(t,i,n){return u`
      <label class="toggle">
        <span>${t}</span>
        <input
          type="checkbox"
          .checked=${i}
          data-key=${n}
          @change=${this._toggleChanged}
        />
      </label>
    `}_controlEntitiesSection(t){return u`
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
        ${t.length?u`
              <div class="collection">
                ${t.map((i,n)=>u`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Select entity</span>
                          <input
                            .value=${i||""}
                            data-index=${String(n)}
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
                          data-index=${String(n)}
                          @click=${this._removeControlEntity}
                        >
                          Remove selector
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:u`
              <div class="hint">
                No explicit control selectors yet. The card will auto-detect common mower select companions
                like map, mowing action, zone, and spot when they exist.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-control-entities",["select"])}
      </div>
    `}_summaryEntitiesSection(t){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Header summary chips</strong>
            <span class="hint">Add specific entities when you want tighter control over the header summary.</span>
          </div>
          <button type="button" @click=${this._addSummaryEntity}>Add summary entity</button>
        </div>
        ${t.length?u`
              <div class="collection">
                ${t.map((i,n)=>u`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${i||""}
                            data-index=${String(n)}
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
                          data-index=${String(n)}
                          @click=${this._removeSummaryEntity}
                        >
                          Remove summary entity
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:u`
              <div class="hint">
                No explicit summary entities yet. The card will continue to build summary chips from battery,
                activity, task, weather, and common companion sensors automatically.
              </div>
            `}
        ${this._entityDatalist("lawn-mower-card-editor-summary-entities",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
      </div>
    `}_tilesSection(t){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Extra tiles</strong>
            <span class="hint">Add companion entities as extra stat tiles.</span>
          </div>
          <button type="button" @click=${this._addTile}>Add tile</button>
        </div>
        ${t.length?u`
              <div class="collection">
                ${t.map((i,n)=>u`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${i.entity||""}
                            data-index=${String(n)}
                            data-key="entity"
                            placeholder="sensor.my_mower_error"
                            list="lawn-mower-card-editor-tile-entities"
                            @input=${this._tileChanged}
                          />
                        </label>
                        <label>
                          <span>Label</span>
                          <input
                            .value=${i.label||""}
                            data-index=${String(n)}
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
                            .value=${i.icon||""}
                            data-index=${String(n)}
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
                          data-index=${String(n)}
                          @click=${this._removeTile}
                        >
                          Remove tile
                        </button>
                      </div>
                    </div>
                  `)}
              </div>
            `:u`<div class="hint">No extra tiles yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-tile-entities")}
      </div>
    `}_actionsSection(t){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Custom actions</strong>
            <span class="hint">Add extra control chips beyond the built-in mower and helper actions.</span>
          </div>
          <button type="button" @click=${this._addAction}>Add action</button>
        </div>
        ${t.length?u`
              <div class="collection">
                ${t.map((i,n)=>{let r=i.type||"more-info",s=this._serviceDataDraftError(n,i);return u`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Type</span>
                          <select
                            .value=${r}
                            data-index=${String(n)}
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
                            .value=${i.label||""}
                            data-index=${String(n)}
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
                            .value=${i.icon||""}
                            data-index=${String(n)}
                            data-key="icon"
                            placeholder="mdi:information-outline"
                            @input=${this._actionChanged}
                          />
                        </label>
                        ${r==="more-info"?u`
                              <label>
                                <span>Target entity</span>
                                <input
                                  .value=${i.entity||""}
                                  data-index=${String(n)}
                                  data-key="entity"
                                  placeholder="camera.my_mower_map"
                                  list="lawn-mower-card-editor-action-targets"
                                  @input=${this._actionChanged}
                                />
                                <span class="hint">Optional. Defaults to the mower entity.</span>
                              </label>
                            `:r==="service"?u`
                                <label>
                                  <span>Service</span>
                                  <input
                                    .value=${i.service||""}
                                    data-index=${String(n)}
                                    data-key="service"
                                    placeholder="button.press"
                                    @input=${this._actionChanged}
                                  />
                                </label>
                              `:u`<div></div>`}
                      </div>
                      ${r==="service"?u`
                            <div class="row-grid single">
                              <label>
                                <span>Service data</span>
                                <textarea
                                  data-index=${String(n)}
                                  placeholder='{"entity_id":"button.my_probe"}'
                                  @input=${this._actionServiceDataChanged}
                                >${this._serviceDataValue(n,i)}</textarea>
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
                          data-index=${String(n)}
                          @click=${this._removeAction}
                        >
                          Remove action
                        </button>
                      </div>
                    </div>
                  `})}
              </div>
            `:u`<div class="hint">No custom actions yet.</div>`}
        ${this._entityDatalist("lawn-mower-card-editor-action-targets")}
      </div>
    `}_entityDatalist(t,i){let n=this._entityIds(i);return n.length?u`
      <datalist id=${t}>
        ${n.map(r=>u`<option value=${r}></option>`)}
      </datalist>
    `:p}_entityIds(t){if(!this.hass?.states)return[];let i=t?.length?new Set(t):void 0;return Object.keys(this.hass.states).filter(n=>{if(!i)return!0;let[r]=n.split(".");return i.has(r)}).sort((n,r)=>n.localeCompare(r))}_valueChanged(t){let i=t.currentTarget,n=i.dataset.key;if(!n)return;let r=this._config||m.getStubConfig(),s={...r},a=i.value.trim();a?s[n]=a:delete s[n],s.entity||(s.entity=m.getStubConfig().entity),n==="entity"&&a&&a!==r.entity&&this._applyEntityAutofill(s,r),this._emitConfigChanged(s)}_applyEntityAutofill(t,i){let n=this._autoDetectedCompanions(i.entity),r=this._autoDetectedCompanions(t.entity);this._replaceAutoEntityField("map_entity",t,n,r),this._replaceAutoEntityField("status_entity",t,n,r),this._replaceAutoEntityField("battery_entity",t,n,r),this._replaceAutoEntityField("progress_entity",t,n,r);let s=!!n.map_entity;(t.show_map===void 0||t.show_map===s)&&(r.map_entity?t.show_map=!0:delete t.show_map)}_replaceAutoEntityField(t,i,n,r){let s=i[t],a=n[t],l=r[t];(!s||a!==void 0&&s===a)&&(l?i[t]=l:delete i[t])}_autoDetectedCompanions(t){if(!t||!this.hass?.states)return{};let i=t.split(".",2)[1];if(!i)return{};let n=(a,l)=>{let c=`${a}.${i}_${l}`;return this.hass.states[c]?c:void 0},r=(...a)=>a.find(l=>!!l);return{map_entity:r(n("camera","live_path_map"),n("camera","map"),n("camera","all_maps"),n("camera","map_data")),status_entity:r(n("sensor","state_name"),n("sensor","activity"),n("sensor","error")),battery_entity:n("sensor","battery"),progress_entity:r(n("sensor","runtime_mission_progress"),n("sensor","mowing_progress"),n("sensor","weather_protection_status"),n("sensor","task_status_name"),n("sensor","task_status"),n("sensor","error"))}}_toggleChanged(t){let i=t.currentTarget,n=i.dataset.key;if(!n)return;let r={...this._config||m.getStubConfig(),[n]:i.checked};r.entity||(r.entity=m.getStubConfig().entity),this._emitConfigChanged(r)}_layoutChanged(t){let i=t.currentTarget,n={...this._config||m.getStubConfig(),layout:i.value};n.entity||(n.entity=m.getStubConfig().entity),this._emitConfigChanged(n)}_addSummaryEntity(){let t=this._nextConfig();t.summary_entities=[...t.summary_entities||[],""],this._emitConfigChanged(t)}_addControlEntity(){let t=this._nextConfig();t.control_entities=[...t.control_entities||[],""],this._emitConfigChanged(t)}_removeControlEntity(t){let i=this._indexFromEvent(t);if(i===void 0)return;let n=this._nextConfig();n.control_entities=(n.control_entities||[]).filter((r,s)=>s!==i),n.control_entities.length||delete n.control_entities,this._emitConfigChanged(n)}_controlEntityChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t);if(n===void 0)return;let r=this._nextConfig(),s=[...r.control_entities||[]];s[n]=i.value.trim();let a=s.filter(Boolean);a.length?r.control_entities=a:delete r.control_entities,this._emitConfigChanged(r)}_removeSummaryEntity(t){let i=this._indexFromEvent(t);if(i===void 0)return;let n=this._nextConfig();n.summary_entities=(n.summary_entities||[]).filter((r,s)=>s!==i),n.summary_entities.length||delete n.summary_entities,this._emitConfigChanged(n)}_summaryEntityChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t);if(n===void 0)return;let r=this._nextConfig(),s=[...r.summary_entities||[]];s[n]=i.value.trim();let a=s.filter(Boolean);a.length?r.summary_entities=a:delete r.summary_entities,this._emitConfigChanged(r)}_addTile(){let t=this._nextConfig();t.tiles=[...t.tiles||[],{entity:""}],this._emitConfigChanged(t)}_removeTile(t){let i=this._indexFromEvent(t);if(i===void 0)return;let n=this._nextConfig();n.tiles=(n.tiles||[]).filter((r,s)=>s!==i),n.tiles.length||delete n.tiles,this._emitConfigChanged(n)}_tileChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t),r=i.dataset.key;if(n===void 0||!r)return;let s=this._nextConfig(),a=[...s.tiles||[]],l={...a[n]||{entity:""}},c=i.value.trim();c?l[r]=c:delete l[r],a[n]=l,s.tiles=a,this._emitConfigChanged(s)}_addAction(){let t=this._nextConfig();t.actions=[...t.actions||[],{type:"more-info"}],this._emitConfigChanged(t)}_removeAction(t){let i=this._indexFromEvent(t);if(i===void 0)return;let n=this._nextConfig();n.actions=(n.actions||[]).filter((r,s)=>s!==i),n.actions.length||delete n.actions,delete this._serviceDataDrafts[i],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,i),this._emitConfigChanged(n)}_actionChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t),r=i.dataset.key;if(n===void 0||!r)return;let s=this._nextConfig(),a=[...s.actions||[]],l={...a[n]||{type:"more-info"}},c=i.value.trim();c?l[r]=r==="service_data"?void 0:c:delete l[r],a[n]=l,s.actions=a,this._emitConfigChanged(s)}_actionTypeChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t);if(n===void 0)return;let r=this._nextConfig(),s=[...r.actions||[]],a={...s[n]||{}};a.type=i.value,a.type!=="service"&&(delete a.service,delete a.service_data,delete this._serviceDataDrafts[n],this._serviceDataDrafts={...this._serviceDataDrafts}),a.type!=="more-info"&&delete a.entity,s[n]=a,r.actions=s,this._emitConfigChanged(r)}_actionServiceDataChanged(t){let i=t.currentTarget,n=this._indexFromEvent(t);if(n===void 0)return;let r=i.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[n]:i.value};let s=this._nextConfig(),a=[...s.actions||[]],l={...a[n]||{type:"service"}};if(!r){delete l.service_data,delete this._serviceDataDrafts[n],this._serviceDataDrafts={...this._serviceDataDrafts},a[n]=l,s.actions=a,this._emitConfigChanged(s);return}try{let c=JSON.parse(r);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,a[n]=l,s.actions=a,this._emitConfigChanged(s)}catch{this.requestUpdate()}}_serviceDataValue(t,i){return t in this._serviceDataDrafts?this._serviceDataDrafts[t]:i.service_data?JSON.stringify(i.service_data,null,2):""}_serviceDataDraftError(t,i){let n=this._serviceDataValue(t,i).trim();if(!n)return!1;try{let r=JSON.parse(n);return!r||typeof r!="object"||Array.isArray(r)}catch{return!0}}_nextConfig(){let t={...this._config||m.getStubConfig()};return t.entity||(t.entity=m.getStubConfig().entity),t}_emitConfigChanged(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_indexFromEvent(t){let n=t.currentTarget?.dataset.index;if(n===void 0)return;let r=Number(n);return Number.isInteger(r)?r:void 0}_reindexDrafts(t,i){let n={};for(let[r,s]of Object.entries(t)){let a=Number(r);Number.isNaN(a)||a===i||(n[a>i?a-1:a]=s)}return n}};x.styles=B`
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
