var xt=Object.defineProperty;var At=Object.getOwnPropertyDescriptor;var w=(a,t,e,i)=>{for(var n=i>1?void 0:i?At(t,e):t,r=a.length-1,s;r>=0;r--)(s=a[r])&&(n=(i?s(t,e,n):s(n))||n);return i&&n&&xt(t,e,n),n};var U=globalThis,B=U.ShadowRoot&&(U.ShadyCSS===void 0||U.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,q=Symbol(),ot=new WeakMap,P=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(B&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=ot.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ot.set(e,t))}return t}toString(){return this.cssText}},at=a=>new P(typeof a=="string"?a:a+"",void 0,q),W=(a,...t)=>{let e=a.length===1?a[0]:t.reduce((i,n,r)=>i+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+a[r+1],a[0]);return new P(e,a,q)},lt=(a,t)=>{if(B)a.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),n=U.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=e.cssText,a.appendChild(i)}},J=B?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return at(e)})(a):a;var{is:Ct,defineProperty:St,getOwnPropertyDescriptor:Et,getOwnPropertyNames:kt,getOwnPropertySymbols:Mt,getPrototypeOf:Pt}=Object,j=globalThis,ct=j.trustedTypes,Dt=ct?ct.emptyScript:"",Lt=j.reactiveElementPolyfillSupport,D=(a,t)=>a,L={toAttribute(a,t){switch(t){case Boolean:a=a?Dt:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},F=(a,t)=>!Ct(a,t),dt={attribute:!0,type:String,converter:L,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=dt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),n=this.getPropertyDescriptor(t,i,e);n!==void 0&&St(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){let{get:n,set:r}=Et(this.prototype,t)??{get(){return this[e]},set(s){this[e]=s}};return{get:n,set(s){let o=n?.call(this);r?.call(this,s),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??dt}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=Pt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,i=[...kt(e),...Mt(e)];for(let n of i)this.createProperty(n,e[n])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,n]of e)this.elementProperties.set(i,n)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let n=this._$Eu(e,i);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let n of i)e.unshift(J(n))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(n!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:L).toAttribute(e,i.type);this._$Em=t,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(t,e){let i=this.constructor,n=i._$Eh.get(t);if(n!==void 0&&this._$Em!==n){let r=i.getPropertyOptions(n),s=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:L;this._$Em=n;let o=s.fromAttribute(e,r.type);this[n]=o??this._$Ej?.get(n)??o,this._$Em=null}}requestUpdate(t,e,i,n=!1,r){if(t!==void 0){let s=this.constructor;if(n===!1&&(r=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??F)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:r},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),r!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),n===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[n,r]of i){let{wrapped:s}=r,o=this[n];s!==!0||this._$AL.has(n)||o===void 0||this.C(n,void 0,r,o)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[D("elementProperties")]=new Map,v[D("finalized")]=new Map,Lt?.({ReactiveElement:v}),(j.reactiveElementVersions??=[]).push("2.1.2");var et=globalThis,ut=a=>a,I=et.trustedTypes,pt=I?I.createPolicy("lit-html",{createHTML:a=>a}):void 0,vt="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,bt="?"+$,Tt=`<${bt}>`,S=document,z=()=>S.createComment(""),H=a=>a===null||typeof a!="object"&&typeof a!="function",it=Array.isArray,zt=a=>it(a)||typeof a?.[Symbol.iterator]=="function",Y=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,_t=/>/g,A=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,mt=/"/g,yt=/^(?:script|style|textarea|title)$/i,nt=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),u=nt(1),qt=nt(2),Jt=nt(3),E=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ft=new WeakMap,C=S.createTreeWalker(S,129);function wt(a,t){if(!it(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}var Ht=(a,t)=>{let e=a.length-1,i=[],n,r=t===2?"<svg>":t===3?"<math>":"",s=T;for(let o=0;o<e;o++){let l=a[o],c,h,d=-1,_=0;for(;_<l.length&&(s.lastIndex=_,h=s.exec(l),h!==null);)_=s.lastIndex,s===T?h[1]==="!--"?s=ht:h[1]!==void 0?s=_t:h[2]!==void 0?(yt.test(h[2])&&(n=RegExp("</"+h[2],"g")),s=A):h[3]!==void 0&&(s=A):s===A?h[0]===">"?(s=n??T,d=-1):h[1]===void 0?d=-2:(d=s.lastIndex-h[2].length,c=h[1],s=h[3]===void 0?A:h[3]==='"'?mt:gt):s===mt||s===gt?s=A:s===ht||s===_t?s=T:(s=A,n=void 0);let g=s===A&&a[o+1].startsWith("/>")?" ":"";r+=s===T?l+Tt:d>=0?(i.push(c),l.slice(0,d)+vt+l.slice(d)+$+g):l+$+(d===-2?o:g)}return[wt(a,r+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},O=class a{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let r=0,s=0,o=t.length-1,l=this.parts,[c,h]=Ht(t,e);if(this.el=a.createElement(c,i),C.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(n=C.nextNode())!==null&&l.length<o;){if(n.nodeType===1){if(n.hasAttributes())for(let d of n.getAttributeNames())if(d.endsWith(vt)){let _=h[s++],g=n.getAttribute(d).split($),m=/([.?@])?(.*)/.exec(_);l.push({type:1,index:r,name:m[2],strings:g,ctor:m[1]==="."?X:m[1]==="?"?G:m[1]==="@"?Q:M}),n.removeAttribute(d)}else d.startsWith($)&&(l.push({type:6,index:r}),n.removeAttribute(d));if(yt.test(n.tagName)){let d=n.textContent.split($),_=d.length-1;if(_>0){n.textContent=I?I.emptyScript:"";for(let g=0;g<_;g++)n.append(d[g],z()),C.nextNode(),l.push({type:2,index:++r});n.append(d[_],z())}}}else if(n.nodeType===8)if(n.data===bt)l.push({type:2,index:r});else{let d=-1;for(;(d=n.data.indexOf($,d+1))!==-1;)l.push({type:7,index:r}),d+=$.length-1}r++}}static createElement(t,e){let i=S.createElement("template");return i.innerHTML=t,i}};function k(a,t,e=a,i){if(t===E)return t;let n=i!==void 0?e._$Co?.[i]:e._$Cl,r=H(t)?void 0:t._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(a),n._$AT(a,e,i)),i!==void 0?(e._$Co??=[])[i]=n:e._$Cl=n),n!==void 0&&(t=k(a,n._$AS(a,t.values),n,i)),t}var K=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??S).importNode(e,!0);C.currentNode=n;let r=C.nextNode(),s=0,o=0,l=i[0];for(;l!==void 0;){if(s===l.index){let c;l.type===2?c=new R(r,r.nextSibling,this,t):l.type===1?c=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(c=new tt(r,this,t)),this._$AV.push(c),l=i[++o]}s!==l?.index&&(r=C.nextNode(),s++)}return C.currentNode=S,n}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},R=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=k(this,t,e),H(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):zt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,n=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=O.createElement(wt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{let r=new K(n,this),s=r.u(this.options);r.p(e),this.T(s),this._$AH=r}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new O(t)),e}k(t){it(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,n=0;for(let r of t)n===e.length?e.push(i=new a(this.O(z()),this.O(z()),this,this.options)):i=e[n],i._$AI(r),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=ut(t).nextSibling;ut(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,n){let r=this.strings,s=!1;if(r===void 0)t=k(this,t,e,0),s=!H(t)||t!==this._$AH&&t!==E,s&&(this._$AH=t);else{let o=t,l,c;for(t=r[0],l=0;l<r.length-1;l++)c=k(this,o[i+l],e,l),c===E&&(c=this._$AH[l]),s||=!H(c)||c!==this._$AH[l],c===p?t=p:t!==p&&(t+=(c??"")+r[l+1]),this._$AH[l]=c}s&&!n&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},X=class extends M{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},G=class extends M{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends M{constructor(t,e,i,n,r){super(t,e,i,n,r),this.type=5}_$AI(t,e=this){if((t=k(this,t,e,0)??p)===E)return;let i=this._$AH,n=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==p&&(i===p||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},tt=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){k(this,t)}};var Ot=et.litHtmlPolyfillSupport;Ot?.(O,R),(et.litHtmlVersions??=[]).push("3.3.2");var $t=(a,t,e)=>{let i=e?.renderBefore??t,n=i._$litPart$;if(n===void 0){let r=e?.renderBefore??null;i._$litPart$=n=new R(t.insertBefore(z(),r),r,void 0,e??{})}return n._$AI(a),n};var rt=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$t(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};b._$litElement$=!0,b.finalized=!0,rt.litElementHydrateSupport?.({LitElement:b});var Rt=rt.litElementPolyfillSupport;Rt?.({LitElement:b});(rt.litElementVersions??=[]).push("4.2.2");var st=a=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(a,t)}):customElements.define(a,t)};var Nt={attribute:!0,type:String,converter:L,reflect:!1,hasChanged:F},Ut=(a=Nt,t,e)=>{let{kind:i,metadata:n}=e,r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),i==="setter"&&((a=Object.create(a)).wrapped=!0),r.set(e.name,a),i==="accessor"){let{name:s}=e;return{set(o){let l=t.get.call(this);t.set.call(this,o),this.requestUpdate(s,l,a,!0,o)},init(o){return o!==void 0&&this.C(s,void 0,a,o),o}}}if(i==="setter"){let{name:s}=e;return function(o){let l=this[s];t.call(this,o),this.requestUpdate(s,l,a,!0,o)}}throw Error("Unsupported decorator location: "+i)};function N(a){return(t,e)=>typeof e=="object"?Ut(a,t,e):((i,n,r)=>{let s=n.hasOwnProperty(r);return n.constructor.createProperty(r,i),s?Object.getOwnPropertyDescriptor(n,r):void 0})(a,t,e)}function V(a){return N({...a,state:!0,attribute:!1})}var Bt={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},Wt={"charging completed":"charging completed","rain protection enabled":"rain protection enabled","rain protection disabled":"rain protection disabled","rain delay active":"rain delay active","rain delay inactive":"rain delay inactive","no error":"no error","task unknown":"task unknown"},f=class extends b{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(t){if(!t.entity)throw new Error("The 'entity' option is required.");this._config=t}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return p;let t=this.hass.states[this._config.entity];if(!t)return u`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let e=this._config.name||this._friendlyName(t)||this._entityName(this._config.entity),i=this._config.layout||"default",n=this._entityState(this._config.status_entity)||this._friendlyMowerState(t.state),r=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,s=r?this._cameraUrl(r):void 0,o=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(t.state),h=this._buildHeaderSummary(),d=this._resolvedControlEntities(),_=this._plannedRunDetails(t),g=this._runtimeSessionDetails();return u`
      <ha-card>
        <div class=${`wrap layout-${i}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${e}</div>
                <div class="subtitle">${n}</div>
                ${h.length?u`
                      <div class="header-summary">
                        ${h.map(m=>u`<div class="summary-chip">${m}</div>`)}
                      </div>
                    `:p}
              </div>
              <div class=${`state-pill state-${t.state}`}>${this._friendlyMowerState(t.state)}</div>
            </div>

            ${o?u`
                  <div class="map">
                    ${s?u`<img src=${s} alt=${e} />`:u`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `:p}
          </div>

          <div class="side">
            ${_?this._renderPlannedRunPanel(_):p}

            ${g?this._renderRuntimeSessionPanel(g):p}

            ${d.length?u`
                  <div class="selectors">
                    ${d.map(m=>this._renderSelectControl(m))}
                  </div>
                `:p}

            ${c.length?u`
                  ${c.map(m=>u`
                      <div class="action-group">
                        ${c.length>1?u`<div class="action-group-title">${m.title}</div>`:p}
                        <div class="actions">
                          ${m.actions.map(y=>u`
                              <button @click=${y.handler} ?disabled=${y.disabled}>
                                <span class="button-content">
                                  ${y.icon?u`<ha-icon .icon=${y.icon}></ha-icon>`:p}
                                  <span>${y.label}</span>
                                </span>
                              </button>
                            `)}
                        </div>
                      </div>
                    `)}
                `:p}

            ${l.length?u`
                  <div class="stats">
                    ${l.map(m=>u`
                        <div class="tile">
                          <div class="tile-label">${m.label}</div>
                          <div class="tile-value">${m.value}</div>
                        </div>
                      `)}
                  </div>
                `:p}
          </div>
        </div>
      </ha-card>
    `}getCardSize(){let t=this._config?.show_map??!!this._config?.map_entity,e=this._config?.layout||"default";return e==="compact"?t?8:6:e==="wide"?t?10:8:t?9:7}_buildTiles(){if(!this._config||!this.hass)return[];let t=[];if(this._config.battery_entity)t.push(this._tileFromEntity(this._config.battery_entity,"Battery"));else{let e=this._tileFromMowerAttribute("battery_level","Battery","%");e&&t.push(e)}if(this._config.progress_entity)t.push(this._tileFromEntity(this._config.progress_entity,this._preferredEntityLabel(this._config.progress_entity,"Status")));else{let e=this._tileFromMowerAttribute("task_status_name","Task")||this._tileFromMowerAttribute("activity","Activity");e&&t.push(e)}for(let e of this._config.tiles||[])t.push(this._tileFromEntity(e.entity,e.label,e.icon));if(!(this._config.tiles||[]).length){let e=this._runtimeCoverageTile();e&&t.push(e);let i=this._runtimeLiveTrackTile();i&&t.push(i)}return t.filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let t=[],e=this.hass.states[this._config.entity];if(!e)return t;for(let _ of this._resolvedSummaryEntities()){let g=this.hass.states[_];if(!g)continue;let m=this._friendlyName(g)||this._entityName(_);t.push(`${m} ${this._friendlyState(g)}`)}let i=this._entityState(this._config.battery_entity)||this._stringAttribute(e,"battery_level","%");i&&t.push(`Battery ${i}`);let n=this._stringAttribute(e,"activity");n&&t.push(`Activity ${n}`);let r=this._stringAttribute(e,"task_status_name");r&&!this._isUnknownLike(r)&&t.push(`Task ${r}`);let s=this._companionSummaryFromBinary("docked","Docked");s&&t.push(s);let o=this._companionSummaryFromBinary("charging","Charging");o&&t.push(o);let l=this._companionSummaryFromBinary("bluetooth_connected","Bluetooth");l&&t.push(l);let c=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");c&&t.push(c);let h=this._companionSummaryFromEntity("sensor","weather_protection_status","Rain protection");h&&t.push(h);let d=this._stringAttribute(e,"error_display")||this._stringAttribute(e,"error_text");return d&&!["none","no error"].includes(d.toLowerCase())&&t.push(`Error ${d}`),t.push(...this._runtimeMapSummaryItems()),[...new Set(t)].slice(0,6)}_resolvedSummaryEntities(){if(!this._config)return[];let t=(this._config.summary_entities||[]).filter(Boolean);return t.length?t:this._autoDetectedSummaryEntities(this._config.entity)}_autoDetectedSummaryEntities(t){if(!t||!this.hass?.states)return[];let e=t.split(".",2)[1];if(!e)return[];let i=(...n)=>{let r=n.find(s=>!!this.hass.states[s]);return r?[r]:[]};return[`sensor.${e}_runtime_mission_progress`,`sensor.${e}_runtime_current_area`,`sensor.${e}_runtime_total_area`,`sensor.${e}_selected_target`,`sensor.${e}_selected_map`,`sensor.${e}_current_zone`,`sensor.${e}_current_cleaned_area`,`sensor.${e}_current_cleaning_time`,`sensor.${e}_active_segment_count`,...i(`sensor.${e}_current_app_map_trajectory_length`,`sensor.${e}_current_app_map_mow_path_length`,`sensor.${e}_current_app_map_trajectory_point_count`)].filter(n=>!!this.hass.states[n])}_resolvedControlEntities(){if(!this._config)return[];let t=(this._config.control_entities||[]).filter(Boolean);return t.length?t:this._autoDetectedControlEntities(this._config.entity)}_autoDetectedControlEntities(t){if(!t||!this.hass?.states)return[];let e=t.split(".",2)[1];return e?["map","mowing_action","edge","zone","spot"].map(i=>`select.${e}_${i}`).filter(i=>!!this.hass.states[i]):[]}_renderSelectControl(t){let e=this.hass.states[t];if(!e)return p;let i=Array.isArray(e.attributes.options)?e.attributes.options.filter(s=>typeof s=="string"):[];if(!i.length)return p;let n=this._friendlyName(e)||this._preferredEntityLabel(t)||this._entityName(t),r=["unavailable","unknown"].includes(String(e.state));return u`
      <label class="selector-card">
        <span class="selector-label">${n}</span>
        <select
          .value=${String(e.state)}
          ?disabled=${r}
          @change=${s=>this._selectOption(t,s)}
        >
          ${i.map(s=>u`<option value=${s}>${s}</option>`)}
        </select>
      </label>
    `}_tileFromMowerAttribute(t,e,i){let r=(this._config?this.hass.states[this._config.entity]:void 0)?.attributes[t];if(!(r==null||r===""))return{label:e,value:i?`${String(r)} ${i}`:this._humanizeValue(String(r))}}_runtimeCoverageTile(){let t=this._companionState("sensor","runtime_current_area"),e=this._companionState("sensor","runtime_total_area");if(t&&e)return{label:"Coverage",value:`${t} / ${e}`};if(t)return{label:"Current Area",value:t}}_runtimeLiveTrackTile(){let t=this._runtimeSessionDetails();if(t){if(t.trailLengthM!==void 0&&t.trailLengthM>0)return{label:"Live Trail",value:this._formatMeters(t.trailLengthM)};if(t.pointCount!==void 0&&t.pointCount>1)return{label:"Live Points",value:`${Math.round(t.pointCount)}`}}}_buildActionGroups(t){if(!this._config)return[];let e=[];(this._config.show_default_actions??!0)&&e.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()});let i=[];(this._config.show_helper_actions??!0)&&i.push(...this._buildHelperActions());let n=[];for(let r of this._config.actions||[]){let s=this._buildConfiguredAction(r,t);s&&n.push(s)}return[{title:"Controls",actions:e},{title:"Helpers",actions:i},{title:"Custom",actions:n}].filter(r=>r.actions.length)}_buildConfiguredAction(t,e){let i=t.type||"more-info";if(i==="start")return{label:t.label||"Start",icon:t.icon||"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()};if(i==="pause")return{label:t.label||"Pause",icon:t.icon||"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()};if(i==="dock")return{label:t.label||"Dock",icon:t.icon||"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()};if(i==="more-info")return{label:t.label||"Details",icon:t.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(t.entity)};if(i==="service"&&t.service)return{label:t.label||t.service,icon:t.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(t.service,t.service_data)}}_buildHelperActions(){let t=[],e=this._companionEntityId("calendar","schedule");e&&t.push({label:"Schedule",icon:"mdi:calendar",disabled:!1,handler:()=>this._showMoreInfo(e)});let i=this._companionEntityId("calendar","all_schedules");i&&t.push({label:"All Schedules",icon:"mdi:calendar-multiselect",disabled:!1,handler:()=>this._showMoreInfo(i)});let n=this._companionEntityId("sensor","last_schedule_write");n&&t.push({label:"Last Schedule Write",icon:"mdi:calendar-check-outline",disabled:!1,handler:()=>this._showMoreInfo(n)});let r=this._companionEntityId("camera","map_data");r&&t.push({label:"Map Diagnostics",icon:"mdi:map-search-outline",disabled:!1,handler:()=>this._showMoreInfo(r)});let s=this._companionEntityId("camera","live_path_map");s&&t.push({label:"Live Map",icon:"mdi:map-marker-path",disabled:!1,handler:()=>this._showMoreInfo(s)});let o=this._companionEntityId("camera","all_maps");o&&t.push({label:"All Maps",icon:"mdi:map-multiple-outline",disabled:!1,handler:()=>this._showMoreInfo(o)});let l=this._companionEntityId("button","capture_weather_probe");l&&t.push({label:"Weather",icon:"mdi:weather-rainy",disabled:!1,handler:()=>this._pressButton(l)});let c=this._companionEntityId("button","capture_preference_probe");c&&t.push({label:"Preferences",icon:"mdi:tune-variant",disabled:!1,handler:()=>this._pressButton(c)});let h=this._companionEntityId("sensor","last_preference_write");h&&t.push({label:"Last Preference Write",icon:"mdi:tune",disabled:!1,handler:()=>this._showMoreInfo(h)});let d=this._companionEntityId("button","capture_schedule_probe");d&&t.push({label:"Refresh Schedules",icon:"mdi:calendar-search",disabled:!1,handler:()=>this._pressButton(d)});let _=this._companionEntityId("button","capture_task_status_probe");_&&t.push({label:"Task Status",icon:"mdi:list-status",disabled:!1,handler:()=>this._pressButton(_)});let g=this._companionEntityId("button","capture_map_probe");g&&t.push({label:"Probe Map",icon:"mdi:map-search",disabled:!1,handler:()=>this._pressButton(g)});let m=this._companionEntityId("button","capture_operation_snapshot");return m&&t.push({label:"Snapshot",icon:"mdi:clipboard-pulse-outline",disabled:!1,handler:()=>this._pressButton(m)}),t}_tileFromEntity(t,e,i){let n=this.hass.states[t];if(!n)return{label:e||this._preferredEntityLabel(t),value:"Unavailable"};let r=e||this._friendlyName(n)||this._preferredEntityLabel(t),s=this._friendlyState(n);return{label:i?`${i} ${r}`:r,value:s}}_friendlyState(t){let e=t.attributes.unit_of_measurement;return typeof e=="string"&&e?`${t.state} ${e}`:this._humanizeEntityState(t.entity_id,String(t.state))}_entityState(t){if(!t)return;let e=this.hass.states[t];return e?this._friendlyState(e):void 0}_stringAttribute(t,e,i){let n=t.attributes[e];if(!(n==null||n===""))return i?`${String(n)} ${i}`:this._humanizeValue(String(n))}_humanizeValue(t){let e=t.trim();if(!e)return e;let i=Bt[e];if(i)return i;let n=e.replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(!n)return e;let r=n.toLowerCase(),s=Wt[r]||r;return s.charAt(0).toUpperCase()+s.slice(1)}_humanizeEntityState(t,e){let i=e.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(t.endsWith("_weather_protection_status")){if(i==="rain protection enabled"||i==="enabled")return"Enabled";if(i==="rain protection disabled"||i==="disabled")return"Disabled"}return(t.endsWith("_task_status")||t.endsWith("_task_status_name"))&&this._isUnknownLike(e)?"Unknown":this._humanizeValue(e)}_isUnknownLike(t){let e=t.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();return["unknown","unavailable","none","task unknown"].includes(e)}_preferredEntityLabel(t,e){return t.endsWith("_weather_protection_status")?"Rain protection":t.endsWith("_state_name")?"State":t.endsWith("_task_status")||t.endsWith("_task_status_name")?"Task":t.endsWith("_battery")?"Battery":t.endsWith("_selected_mowing_action")?"Selected Action":t.endsWith("_selected_target")?"Selected Target":t.endsWith("_selected_map")?"Selected Map":t.endsWith("_selected_zone_mowing_height")?"Mowing Height":t.endsWith("_selected_zone_efficiency_mode")?"Efficiency":t.endsWith("_selected_zone_direction_mode")?"Direction":t.endsWith("_selected_zone_obstacle_avoidance")?"Obstacle Avoidance":t.endsWith("_selected_zone_obstacle_distance")?"Obstacle Distance":t.endsWith("_selected_zone_obstacle_height")?"Obstacle Height":t.endsWith("_selected_zone_obstacle_classes")?"Obstacle Classes":t.endsWith("_mowing_action")?"Mowing Action":t.endsWith("_zone")?"Zone":t.endsWith("_spot")?"Spot":t.endsWith("_map")?"Map":t.endsWith("_mowing_progress")?"Progress":t.endsWith("_runtime_mission_progress")?"Mission Progress":t.endsWith("_runtime_current_area")?"Current Area":t.endsWith("_runtime_total_area")?"Total Area":t.endsWith("_runtime_position_x")?"Position X":t.endsWith("_runtime_position_y")?"Position Y":t.endsWith("_runtime_heading")?"Heading":t.endsWith("_runtime_live_track_length")?"Live Trail":t.endsWith("_runtime_live_track_point_count")?"Live Points":t.endsWith("_runtime_live_track_segment_count")?"Live Segments":t.endsWith("_current_cleaned_area")?"Cut Area":t.endsWith("_current_cleaning_time")?"Time":t.endsWith("_current_zone")?"Current Zone":t.endsWith("_active_segment_count")?"Active Segments":t.endsWith("_current_app_map_area")?"Map Area":t.endsWith("_current_app_map_zone_count")?"Zones":t.endsWith("_current_app_map_spot_count")?"Spots":t.endsWith("_current_app_map_trajectory_point_count")?"Path Points":t.endsWith("_current_app_map_trajectory_length")?"Path Length":t.endsWith("_current_app_map_mow_path_length")?"Trail Length":t.endsWith("_current_app_map_cut_relation_count")?"Cut Links":t.endsWith("_error")?"Error":e||this._entityName(t)}_friendlyName(t){let e=t.attributes.friendly_name;return typeof e=="string"?e:void 0}_entityName(t){return t.split(".")[1]?.replace(/_/g," ")||t}_friendlyMowerState(t){return this._humanizeValue(t)}_cameraUrl(t){let e=t.attributes.entity_picture;return typeof e=="string"&&e?e:`/api/camera_proxy/${t.entity_id}?v=${Date.now()}`}_mapEntity(){if(this._config?.map_entity)return this.hass.states[this._config.map_entity]}_entityAttributeString(t,e){let i=t.attributes[e];return typeof i=="string"&&i.trim()?i.trim():void 0}_entityAttributeInteger(t,e){let i=t.attributes[e];return typeof i=="number"&&Number.isInteger(i)?i:void 0}_entityAttributeRecord(t,e){let i=t.attributes[e];return i&&typeof i=="object"&&!Array.isArray(i)?i:void 0}_recordString(t,e){let i=t?.[e];return typeof i=="string"&&i.trim()?i.trim():void 0}_recordNumber(t,e){let i=t?.[e];return typeof i=="number"&&Number.isFinite(i)?i:void 0}_recordBoolean(t,e){let i=t?.[e];return typeof i=="boolean"?i:void 0}_recordStringArray(t,e){let i=t?.[e];return Array.isArray(i)&&i.every(n=>typeof n=="string")?i:void 0}_numberAttribute(t,e){let i=t.attributes[e];if(typeof i=="number"&&Number.isFinite(i))return i;if(typeof i=="string"&&i.trim()){let n=Number(i);if(Number.isFinite(n))return n}}_formatMeters(t){let e=t>=10?1:2;return`${t.toFixed(e)} m`}_formatCoordinate(t){return Number.isInteger(t)?`${t}`:t.toFixed(1)}_formatCentimeters(t){return`${Number.isInteger(t)?`${Math.round(t)}`:t.toFixed(1)} cm`}_formatOptionalCentimeters(t){return t!==void 0?this._formatCentimeters(t):void 0}_humanizedOptionalBoolean(t){if(t!==void 0)return t?"Enabled":"Disabled"}_humanizedOptionalList(t){if(t?.length)return t.map(e=>this._humanizeValue(e)).join(", ")}_humanizedOptionalValue(t){return t?this._humanizeValue(t):void 0}_selectedZoneDirectionLabel(t){let e=this._recordString(t,"mowing_direction_mode_name"),i=this._recordNumber(t,"mowing_direction_degrees"),n=this._humanizedOptionalValue(e);if(n&&i!==void 0)return`${n} (${Math.round(i)}\xB0)`;if(n)return n;if(i!==void 0)return`${Math.round(i)}\xB0`}_selectedZonePreferenceDetails(t,e){let i=this._entityAttributeInteger(t,"selected_zone_id"),n=this._entityAttributeString(t,"selected_mowing_action"),r=this._entityAttributeRecord(t,"selected_zone_preference"),s=e?.toLowerCase();if(!(n==="zone"||(s?.includes("zone")??!1)))return;let l=this._companionState("sensor","selected_zone_mowing_height")||this._formatOptionalCentimeters(this._recordNumber(r,"mowing_height_cm")),c=this._companionState("sensor","selected_zone_efficiency_mode")||this._humanizedOptionalValue(this._recordString(r,"efficient_mode_name")),h=this._companionState("sensor","selected_zone_direction_mode")||this._selectedZoneDirectionLabel(r),d=this._companionState("sensor","selected_zone_obstacle_avoidance")||this._humanizedOptionalBoolean(this._recordBoolean(r,"obstacle_avoidance_enabled")),_=this._companionState("sensor","selected_zone_obstacle_distance")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_distance_cm")),g=this._companionState("sensor","selected_zone_obstacle_height")||this._formatOptionalCentimeters(this._recordNumber(r,"obstacle_avoidance_height_cm")),m=this._companionState("sensor","selected_zone_obstacle_classes")||this._humanizedOptionalList(this._recordStringArray(r,"obstacle_avoidance_ai_classes")),y=this._recordString(r,"label")||(i!==void 0?`Zone #${i}`:void 0);if(!(!y&&!l&&!c&&!h&&!d&&!_&&!g&&!m))return{zoneLabel:y,mowingHeight:l,efficiencyMode:c,directionMode:h,obstacleAvoidance:d,obstacleDistance:_,obstacleHeight:g,obstacleClasses:m}}_plannedRunDetails(t){let e=this._entityAttributeString(t,"selected_mowing_action"),i=this._companionState("sensor","selected_mowing_action")||this._entityAttributeString(t,"selected_mowing_action_label")||this._entityAttributeString(t,"task_status_name"),n=this._companionState("sensor","selected_map")||this._entityAttributeString(t,"selected_map_label"),r=this._entityAttributeString(t,"app_current_map_label"),s=this._companionState("sensor","selected_target"),o=this._entityAttributeInteger(t,"selected_zone_id"),l=this._entityAttributeInteger(t,"selected_spot_id"),c=this._entityAttributeString(t,"selected_contour_label"),h=t.attributes.selected_map_matches_active_app_map===!1,d=s;if(d||(e==="edge"&&c?d=c:e==="spot"&&l!==void 0?d=`Spot #${l}`:o!==void 0?d=`Zone #${o}`:c?d=c:l!==void 0&&(d=`Spot #${l}`)),!i&&!n&&!r&&!d&&!h)return;let _=this._selectedZonePreferenceDetails(t,d);return{action:i,selectedMap:n,activeMap:r,target:d,needsMapSwitch:h,selectedZonePreferences:_}}_runtimeSessionDetails(){let t=this._mapEntity(),e=this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress"),i=this._companionState("sensor","runtime_current_area")||this._companionState("sensor","current_cleaned_area"),n=this._companionState("sensor","runtime_total_area"),r=this._companionState("sensor","current_zone"),s=this._companionBinaryStateLabel("bluetooth_connected","Connected","Disconnected")||void 0,o=t?this._numberAttribute(t,"runtime_track_length_m"):void 0,l=t?this._numberAttribute(t,"runtime_track_point_count"):void 0,c=t?this._numberAttribute(t,"runtime_track_segment_count"):void 0,h=t?this._numberAttribute(t,"runtime_heading_deg"):void 0,d=t?this._numberAttribute(t,"runtime_pose_x"):void 0,_=t?this._numberAttribute(t,"runtime_pose_y"):void 0,g=t&&typeof t.attributes.source=="string"&&t.attributes.source?t.attributes.source:void 0;if(e!==void 0||i!==void 0||n!==void 0||r!==void 0||s!==void 0||o!==void 0&&o>0||l!==void 0&&l>1||c!==void 0&&c>0||h!==void 0||d!==void 0&&_!==void 0)return{missionProgress:e,currentArea:i,totalArea:n,currentZone:r,bluetoothState:s,trailLengthM:o,pointCount:l,segmentCount:c,headingDeg:h,positionX:d,positionY:_,source:g}}_runtimeMapSummaryItems(){let t=this._runtimeSessionDetails();if(!t)return[];let e=[],i=t.trailLengthM,n=t.pointCount,r=i!==void 0&&i>0||n!==void 0&&n>1;i!==void 0&&i>0?e.push(`Live trail ${this._formatMeters(i)}`):n!==void 0&&n>1&&e.push(`Live points ${Math.round(n)}`);let s=t.headingDeg;return s!==void 0&&r&&e.push(`Heading ${Math.round(s)}\xB0`),t.bluetoothState==="Connected"&&e.push("Bluetooth Connected"),e}_renderPlannedRunPanel(t){let e=[];t.action&&e.push({label:"Action",value:t.action}),t.selectedMap&&e.push({label:"Selected Map",value:t.selectedMap}),t.activeMap&&t.activeMap!==t.selectedMap&&e.push({label:"Active Map",value:t.activeMap}),t.target&&e.push({label:"Target",value:t.target});let i=t.selectedZonePreferences;return i?.zoneLabel&&i.zoneLabel!==t.target&&e.push({label:"Zone",value:i.zoneLabel}),i?.mowingHeight&&e.push({label:"Mowing Height",value:i.mowingHeight}),i?.efficiencyMode&&e.push({label:"Efficiency",value:i.efficiencyMode}),i?.directionMode&&e.push({label:"Direction",value:i.directionMode}),i?.obstacleAvoidance&&e.push({label:"Obstacle Avoidance",value:i.obstacleAvoidance}),i?.obstacleDistance&&e.push({label:"Obstacle Distance",value:i.obstacleDistance}),i?.obstacleHeight&&e.push({label:"Obstacle Height",value:i.obstacleHeight}),i?.obstacleClasses&&e.push({label:"Obstacle AI",value:i.obstacleClasses}),!e.length&&!t.needsMapSwitch?p:u`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">Planned Run</div>
          <div class="target-badge">Start Preview</div>
        </div>
        <div class="target-grid">
          ${e.map(n=>u`
              <div class="target-metric">
                <div class="target-metric-label">${n.label}</div>
                <div class="target-metric-value">${n.value}</div>
              </div>
            `)}
        </div>
        ${t.needsMapSwitch?u`
              <div class="target-note">
                The selected map does not match the mower's active app map yet. Switch maps before
                starting a scoped run.
              </div>
            `:p}
      </div>
    `}_renderRuntimeSessionPanel(t){let e=[];return t.missionProgress&&e.push({label:"Progress",value:t.missionProgress}),t.currentArea&&t.totalArea?e.push({label:"Coverage",value:`${t.currentArea} / ${t.totalArea}`}):t.currentArea&&e.push({label:"Current Area",value:t.currentArea}),t.currentZone&&e.push({label:"Current Zone",value:t.currentZone}),t.bluetoothState&&e.push({label:"Bluetooth",value:t.bluetoothState}),t.trailLengthM!==void 0&&t.trailLengthM>0&&e.push({label:"Live Trail",value:this._formatMeters(t.trailLengthM)}),t.pointCount!==void 0&&t.pointCount>1&&e.push({label:"Points",value:`${Math.round(t.pointCount)}`}),t.segmentCount!==void 0&&t.segmentCount>0&&e.push({label:"Segments",value:`${Math.round(t.segmentCount)}`}),t.headingDeg!==void 0&&e.push({label:"Heading",value:`${Math.round(t.headingDeg)}\xB0`}),t.positionX!==void 0&&t.positionY!==void 0&&e.push({label:"Position",value:`${this._formatCoordinate(t.positionX)}, ${this._formatCoordinate(t.positionY)}`}),t.source&&e.push({label:"Source",value:this._humanizeValue(t.source)}),e.length?u`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">Live Session</div>
          <div class="session-badge">Runtime Overlay</div>
        </div>
        <div class="session-subtitle">
          Current mowing telemetry from the live runtime map stream.
        </div>
        <div class="session-grid">
          ${e.map(i=>u`
              <div class="session-metric">
                <div class="session-metric-label">${i.label}</div>
                <div class="session-metric-value">${i.value}</div>
              </div>
            `)}
        </div>
      </div>
    `:p}_showMoreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(t,e){let[i,n]=t.split(".",2);if(!i||!n)throw new Error(`Invalid service '${t}'. Use domain.service format.`);await this.hass.callService(i,n,e||{})}async _pressButton(t){await this.hass.callService("button","press",{entity_id:t})}async _selectOption(t,e){let n=e.currentTarget.value;n&&await this.hass.callService("select","select_option",{entity_id:t,option:n})}_companionEntityId(t,e){if(!this._config)return;let i=this._config.entity.split(".",2)[1];if(!i)return;let n=`${t}.${i}_${e}`;return this.hass.states[n]?n:void 0}_companionSummaryFromBinary(t,e){let i=this._companionEntityId("binary_sensor",t);if(!i)return;let n=this.hass.states[i];if(n&&n.state==="on")return e}_companionSummaryFromEntity(t,e,i){let n=this._companionEntityId(t,e);if(!n)return;let r=this.hass.states[n];if(!(!r||["unknown","unavailable",""].includes(r.state)))return`${i} ${this._friendlyState(r)}`}_companionState(t,e){let i=this._companionEntityId(t,e);if(i)return this._entityState(i)}_companionBinaryStateLabel(t,e,i){let n=this._companionEntityId("binary_sensor",t);if(!n)return;let r=this.hass.states[n];if(!(!r||["unknown","unavailable",""].includes(r.state)))return r.state==="on"?e:r.state==="off"&&i?i:this._friendlyState(r)}_canStart(t){return!["mowing","returning","unavailable","unknown"].includes(t)}_canPause(t){return["mowing","returning"].includes(t)}_canDock(t){return!["docked","unavailable","unknown"].includes(t)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};f.styles=W`
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
    }

    .map img {
      display: block;
      width: 100%;
      height: auto;
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
  `,w([N({attribute:!1})],f.prototype,"hass",2),w([V()],f.prototype,"_config",2),f=w([st("lawn-mower-card")],f);var x=class extends b{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(e){this._config=e}render(){let e=this._config||f.getStubConfig();return u`
      <div class="editor">
        <div class="hint">
          Select a mower first. The editor will prefill common companion entities such as map, state,
          battery, and status tiles when they can be derived safely.
        </div>
        ${this._field("Mower entity",e.entity,"entity","lawn_mower.my_mower","Required lawn_mower entity.",["lawn_mower"])}
        ${this._field("Title",e.name,"name","Backyard mower","Optional card title override.")}
        ${this._layoutField(e.layout||"default")}
        ${this._field("Map camera",e.map_entity,"map_entity","camera.my_mower_live_path_map","Optional camera entity used for the map preview. Live path cameras work best when available.",["camera"])}
        ${this._toggle("Show map section",e.show_map??!!e.map_entity,"show_map")}
        ${this._field("Status entity",e.status_entity,"status_entity","sensor.my_mower_state_name","Optional entity shown under the title.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._field("Battery entity",e.battery_entity,"battery_entity","sensor.my_mower_battery","Optional entity shown as a stat tile.",["sensor","number","input_number","binary_sensor"])}
        ${this._field("Progress or status tile",e.progress_entity,"progress_entity","sensor.my_mower_progress","Optional entity shown as a second stat tile.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._toggle("Show default actions",e.show_default_actions??!0,"show_default_actions")}
        ${this._toggle("Show helper actions",e.show_helper_actions??!0,"show_helper_actions")}
        ${this._controlEntitiesSection(e.control_entities||[])}
        ${this._summaryEntitiesSection(e.summary_entities||[])}
        ${this._tilesSection(e.tiles||[])}
        ${this._actionsSection(e.actions||[])}
      </div>
    `}_layoutField(e){return u`
      <label>
        <span>Layout</span>
        <select .value=${e} @change=${this._layoutChanged}>
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="wide">Wide</option>
        </select>
        <span class="hint">Choose how the card balances map, actions, and stats.</span>
      </label>
    `}_field(e,i,n,r,s,o){let l=o?.length?`lawn-mower-card-editor-${String(n)}-entities`:void 0;return u`
      <label>
        <span>${e}</span>
        <input
          .value=${i||""}
          data-key=${String(n)}
          placeholder=${r}
          list=${l||p}
          @input=${this._valueChanged}
        />
        <span class="hint">${s}</span>
        ${l?this._entityDatalist(l,o):p}
      </label>
    `}_toggle(e,i,n){return u`
      <label class="toggle">
        <span>${e}</span>
        <input
          type="checkbox"
          .checked=${i}
          data-key=${n}
          @change=${this._toggleChanged}
        />
      </label>
    `}_controlEntitiesSection(e){return u`
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
        ${e.length?u`
              <div class="collection">
                ${e.map((i,n)=>u`
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
    `}_summaryEntitiesSection(e){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Header summary chips</strong>
            <span class="hint">Add specific entities when you want tighter control over the header summary.</span>
          </div>
          <button type="button" @click=${this._addSummaryEntity}>Add summary entity</button>
        </div>
        ${e.length?u`
              <div class="collection">
                ${e.map((i,n)=>u`
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
    `}_tilesSection(e){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Extra tiles</strong>
            <span class="hint">Add companion entities as extra stat tiles.</span>
          </div>
          <button type="button" @click=${this._addTile}>Add tile</button>
        </div>
        ${e.length?u`
              <div class="collection">
                ${e.map((i,n)=>u`
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
    `}_actionsSection(e){return u`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Custom actions</strong>
            <span class="hint">Add extra control chips beyond the built-in mower and helper actions.</span>
          </div>
          <button type="button" @click=${this._addAction}>Add action</button>
        </div>
        ${e.length?u`
              <div class="collection">
                ${e.map((i,n)=>{let r=i.type||"more-info",s=this._serviceDataDraftError(n,i);return u`
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
    `}_entityDatalist(e,i){let n=this._entityIds(i);return n.length?u`
      <datalist id=${e}>
        ${n.map(r=>u`<option value=${r}></option>`)}
      </datalist>
    `:p}_entityIds(e){if(!this.hass?.states)return[];let i=e?.length?new Set(e):void 0;return Object.keys(this.hass.states).filter(n=>{if(!i)return!0;let[r]=n.split(".");return i.has(r)}).sort((n,r)=>n.localeCompare(r))}_valueChanged(e){let i=e.currentTarget,n=i.dataset.key;if(!n)return;let r=this._config||f.getStubConfig(),s={...r},o=i.value.trim();o?s[n]=o:delete s[n],s.entity||(s.entity=f.getStubConfig().entity),n==="entity"&&o&&o!==r.entity&&this._applyEntityAutofill(s,r),this._emitConfigChanged(s)}_applyEntityAutofill(e,i){let n=this._autoDetectedCompanions(i.entity),r=this._autoDetectedCompanions(e.entity);this._replaceAutoEntityField("map_entity",e,n,r),this._replaceAutoEntityField("status_entity",e,n,r),this._replaceAutoEntityField("battery_entity",e,n,r),this._replaceAutoEntityField("progress_entity",e,n,r),this._replaceAutoControlEntities(e,n,r),this._replaceAutoSummaryEntities(e,n,r);let s=!!n.map_entity;(e.show_map===void 0||e.show_map===s)&&(r.map_entity?e.show_map=!0:delete e.show_map)}_replaceAutoControlEntities(e,i,n){let r=(e.control_entities||[]).filter(Boolean),s=Array.isArray(i.control_entities)?i.control_entities.filter(Boolean):[],o=Array.isArray(n.control_entities)?n.control_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(o.length?e.control_entities=o:delete e.control_entities)}_replaceAutoSummaryEntities(e,i,n){let r=(e.summary_entities||[]).filter(Boolean),s=Array.isArray(i.summary_entities)?i.summary_entities.filter(Boolean):[],o=Array.isArray(n.summary_entities)?n.summary_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(o.length?e.summary_entities=o:delete e.summary_entities)}_replaceAutoEntityField(e,i,n,r){let s=i[e],o=n[e],l=r[e];(!s||o!==void 0&&s===o)&&(l?i[e]=l:delete i[e])}_autoDetectedCompanions(e){if(!e||!this.hass?.states)return{};let i=e.split(".",2)[1];if(!i)return{};let n=(o,l)=>{let c=`${o}.${i}_${l}`;return this.hass.states[c]?c:void 0},r=(...o)=>o.find(l=>!!l);return{map_entity:r(n("camera","live_path_map"),n("camera","map"),n("camera","all_maps"),n("camera","map_data")),status_entity:r(n("sensor","state_name"),n("sensor","activity"),n("sensor","error")),battery_entity:n("sensor","battery"),progress_entity:r(n("sensor","runtime_mission_progress"),n("sensor","mowing_progress"),n("sensor","weather_protection_status"),n("sensor","task_status_name"),n("sensor","task_status"),n("sensor","error")),control_entities:[n("select","map"),n("select","mowing_action"),n("select","edge"),n("select","zone"),n("select","spot")].filter(o=>!!o),summary_entities:[n("sensor","runtime_mission_progress"),n("sensor","runtime_current_area"),n("sensor","runtime_total_area"),n("sensor","current_zone"),n("sensor","current_cleaned_area"),n("sensor","current_cleaning_time"),n("sensor","active_segment_count"),r(n("sensor","current_app_map_trajectory_length"),n("sensor","current_app_map_mow_path_length"),n("sensor","current_app_map_trajectory_point_count"))].filter(o=>!!o)}}_sameEntityList(e,i){return e.length===i.length&&e.every((n,r)=>n===i[r])}_toggleChanged(e){let i=e.currentTarget,n=i.dataset.key;if(!n)return;let r={...this._config||f.getStubConfig(),[n]:i.checked};r.entity||(r.entity=f.getStubConfig().entity),this._emitConfigChanged(r)}_layoutChanged(e){let i=e.currentTarget,n={...this._config||f.getStubConfig(),layout:i.value};n.entity||(n.entity=f.getStubConfig().entity),this._emitConfigChanged(n)}_addSummaryEntity(){let e=this._nextConfig();e.summary_entities=[...e.summary_entities||[],""],this._emitConfigChanged(e)}_addControlEntity(){let e=this._nextConfig();e.control_entities=[...e.control_entities||[],""],this._emitConfigChanged(e)}_removeControlEntity(e){let i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig();n.control_entities=(n.control_entities||[]).filter((r,s)=>s!==i),n.control_entities.length||delete n.control_entities,this._emitConfigChanged(n)}_controlEntityChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e);if(n===void 0)return;let r=this._nextConfig(),s=[...r.control_entities||[]];s[n]=i.value.trim();let o=s.filter(Boolean);o.length?r.control_entities=o:delete r.control_entities,this._emitConfigChanged(r)}_removeSummaryEntity(e){let i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig();n.summary_entities=(n.summary_entities||[]).filter((r,s)=>s!==i),n.summary_entities.length||delete n.summary_entities,this._emitConfigChanged(n)}_summaryEntityChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e);if(n===void 0)return;let r=this._nextConfig(),s=[...r.summary_entities||[]];s[n]=i.value.trim();let o=s.filter(Boolean);o.length?r.summary_entities=o:delete r.summary_entities,this._emitConfigChanged(r)}_addTile(){let e=this._nextConfig();e.tiles=[...e.tiles||[],{entity:""}],this._emitConfigChanged(e)}_removeTile(e){let i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig();n.tiles=(n.tiles||[]).filter((r,s)=>s!==i),n.tiles.length||delete n.tiles,this._emitConfigChanged(n)}_tileChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e),r=i.dataset.key;if(n===void 0||!r)return;let s=this._nextConfig(),o=[...s.tiles||[]],l={...o[n]||{entity:""}},c=i.value.trim();c?l[r]=c:delete l[r],o[n]=l,s.tiles=o,this._emitConfigChanged(s)}_addAction(){let e=this._nextConfig();e.actions=[...e.actions||[],{type:"more-info"}],this._emitConfigChanged(e)}_removeAction(e){let i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig();n.actions=(n.actions||[]).filter((r,s)=>s!==i),n.actions.length||delete n.actions,delete this._serviceDataDrafts[i],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,i),this._emitConfigChanged(n)}_actionChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e),r=i.dataset.key;if(n===void 0||!r)return;let s=this._nextConfig(),o=[...s.actions||[]],l={...o[n]||{type:"more-info"}},c=i.value.trim();c?l[r]=r==="service_data"?void 0:c:delete l[r],o[n]=l,s.actions=o,this._emitConfigChanged(s)}_actionTypeChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e);if(n===void 0)return;let r=this._nextConfig(),s=[...r.actions||[]],o={...s[n]||{}};o.type=i.value,o.type!=="service"&&(delete o.service,delete o.service_data,delete this._serviceDataDrafts[n],this._serviceDataDrafts={...this._serviceDataDrafts}),o.type!=="more-info"&&delete o.entity,s[n]=o,r.actions=s,this._emitConfigChanged(r)}_actionServiceDataChanged(e){let i=e.currentTarget,n=this._indexFromEvent(e);if(n===void 0)return;let r=i.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[n]:i.value};let s=this._nextConfig(),o=[...s.actions||[]],l={...o[n]||{type:"service"}};if(!r){delete l.service_data,delete this._serviceDataDrafts[n],this._serviceDataDrafts={...this._serviceDataDrafts},o[n]=l,s.actions=o,this._emitConfigChanged(s);return}try{let c=JSON.parse(r);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,o[n]=l,s.actions=o,this._emitConfigChanged(s)}catch{this.requestUpdate()}}_serviceDataValue(e,i){return e in this._serviceDataDrafts?this._serviceDataDrafts[e]:i.service_data?JSON.stringify(i.service_data,null,2):""}_serviceDataDraftError(e,i){let n=this._serviceDataValue(e,i).trim();if(!n)return!1;try{let r=JSON.parse(n);return!r||typeof r!="object"||Array.isArray(r)}catch{return!0}}_nextConfig(){let e={...this._config||f.getStubConfig()};return e.entity||(e.entity=f.getStubConfig().entity),e}_emitConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_indexFromEvent(e){let n=e.currentTarget?.dataset.index;if(n===void 0)return;let r=Number(n);return Number.isInteger(r)?r:void 0}_reindexDrafts(e,i){let n={};for(let[r,s]of Object.entries(e)){let o=Number(r);Number.isNaN(o)||o===i||(n[o>i?o-1:o]=s)}return n}};x.styles=W`
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
  `,w([N({attribute:!1})],x.prototype,"hass",2),w([V()],x.prototype,"_config",2),w([V()],x.prototype,"_serviceDataDrafts",2),x=w([st("lawn-mower-card-editor")],x);window.customCards=window.customCards||[];window.customCards.push({type:"lawn-mower-card",name:"Lawn Mower Card",description:"A mower-native Home Assistant card with controls, map, and status tiles."});export{f as LawnMowerCard,x as LawnMowerCardEditor};
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
