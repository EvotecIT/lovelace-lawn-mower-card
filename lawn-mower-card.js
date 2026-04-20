var $t=Object.defineProperty;var xt=Object.getOwnPropertyDescriptor;var v=(a,t,e,n)=>{for(var i=n>1?void 0:n?xt(t,e):t,s=a.length-1,r;s>=0;s--)(r=a[s])&&(i=(n?r(t,e,i):r(i))||i);return n&&i&&$t(t,e,i),i};var O=globalThis,I=O.ShadowRoot&&(O.ShadyCSS===void 0||O.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),rt=new WeakMap,k=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(I&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=rt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&rt.set(e,t))}return t}toString(){return this.cssText}},at=a=>new k(typeof a=="string"?a:a+"",void 0,W),z=(a,...t)=>{let e=a.length===1?a[0]:t.reduce((n,i,s)=>n+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[s+1],a[0]);return new k(e,a,W)},ot=(a,t)=>{if(I)a.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),i=O.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=e.cssText,a.appendChild(n)}},J=I?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return at(e)})(a):a;var{is:At,defineProperty:Ct,getOwnPropertyDescriptor:St,getOwnPropertyNames:Et,getOwnPropertySymbols:kt,getPrototypeOf:Mt}=Object,B=globalThis,lt=B.trustedTypes,Dt=lt?lt.emptyScript:"",Pt=B.reactiveElementPolyfillSupport,M=(a,t)=>a,D={toAttribute(a,t){switch(t){case Boolean:a=a?Dt:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},j=(a,t)=>!At(a,t),ct={attribute:!0,type:String,converter:D,reflect:!1,useDefault:!1,hasChanged:j};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ct){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(t,n,e);i!==void 0&&Ct(this.prototype,t,i)}}static getPropertyDescriptor(t,e,n){let{get:i,set:s}=St(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:i,set(r){let o=i?.call(this);s?.call(this,r),this.requestUpdate(t,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=Mt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,n=[...Et(e),...kt(e)];for(let i of n)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,i]of e)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let i=this._$Eu(e,n);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let i of n)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ot(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,n);if(i!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:D).toAttribute(e,n.type);this._$Em=t,s==null?this.removeAttribute(i):this.setAttribute(i,s),this._$Em=null}}_$AK(t,e){let n=this.constructor,i=n._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let s=n.getPropertyOptions(i),r=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:D;this._$Em=i;let o=r.fromAttribute(e,s.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(t,e,n,i=!1,s){if(t!==void 0){let r=this.constructor;if(i===!1&&(s=this[t]),n??=r.getPropertyOptions(t),!((n.hasChanged??j)(s,e)||n.useDefault&&n.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:i,wrapped:s},r){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),s!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,s]of this._$Ep)this[i]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,s]of n){let{wrapped:r}=s,o=this[i];r!==!0||this._$AL.has(i)||o===void 0||this.C(i,void 0,s,o)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[M("elementProperties")]=new Map,_[M("finalized")]=new Map,Pt?.({ReactiveElement:_}),(B.reactiveElementVersions??=[]).push("2.1.2");var tt=globalThis,dt=a=>a,F=tt.trustedTypes,ht=F?F.createPolicy("lit-html",{createHTML:a=>a}):void 0,_t="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+b,Tt=`<${yt}>`,A=document,T=()=>A.createComment(""),L=a=>a===null||typeof a!="object"&&typeof a!="function",et=Array.isArray,Lt=a=>et(a)||typeof a?.[Symbol.iterator]=="function",K=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pt=/-->/g,ut=/>/g,$=RegExp(`>|${K}(?:([^\\s"'>=/]+)(${K}*=${K}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,it=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),d=it(1),Wt=it(2),Jt=it(3),C=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ft=new WeakMap,x=A.createTreeWalker(A,129);function bt(a,t){if(!et(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return ht!==void 0?ht.createHTML(t):t}var Ut=(a,t)=>{let e=a.length-1,n=[],i,s=t===2?"<svg>":t===3?"<math>":"",r=P;for(let o=0;o<e;o++){let l=a[o],c,u,h=-1,g=0;for(;g<l.length&&(r.lastIndex=g,u=r.exec(l),u!==null);)g=r.lastIndex,r===P?u[1]==="!--"?r=pt:u[1]!==void 0?r=ut:u[2]!==void 0?(vt.test(u[2])&&(i=RegExp("</"+u[2],"g")),r=$):u[3]!==void 0&&(r=$):r===$?u[0]===">"?(r=i??P,h=-1):u[1]===void 0?h=-2:(h=r.lastIndex-u[2].length,c=u[1],r=u[3]===void 0?$:u[3]==='"'?mt:gt):r===mt||r===gt?r=$:r===pt||r===ut?r=P:(r=$,i=void 0);let f=r===$&&a[o+1].startsWith("/>")?" ":"";s+=r===P?l+Tt:h>=0?(n.push(c),l.slice(0,h)+_t+l.slice(h)+b+f):l+b+(h===-2?o:f)}return[bt(a,s+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},U=class a{constructor({strings:t,_$litType$:e},n){let i;this.parts=[];let s=0,r=0,o=t.length-1,l=this.parts,[c,u]=Ut(t,e);if(this.el=a.createElement(c,n),x.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=x.nextNode())!==null&&l.length<o;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(_t)){let g=u[r++],f=i.getAttribute(h).split(b),N=/([.?@])?(.*)/.exec(g);l.push({type:1,index:s,name:N[2],strings:f,ctor:N[1]==="."?Y:N[1]==="?"?Z:N[1]==="@"?Q:E}),i.removeAttribute(h)}else h.startsWith(b)&&(l.push({type:6,index:s}),i.removeAttribute(h));if(vt.test(i.tagName)){let h=i.textContent.split(b),g=h.length-1;if(g>0){i.textContent=F?F.emptyScript:"";for(let f=0;f<g;f++)i.append(h[f],T()),x.nextNode(),l.push({type:2,index:++s});i.append(h[g],T())}}}else if(i.nodeType===8)if(i.data===yt)l.push({type:2,index:s});else{let h=-1;for(;(h=i.data.indexOf(b,h+1))!==-1;)l.push({type:7,index:s}),h+=b.length-1}s++}}static createElement(t,e){let n=A.createElement("template");return n.innerHTML=t,n}};function S(a,t,e=a,n){if(t===C)return t;let i=n!==void 0?e._$Co?.[n]:e._$Cl,s=L(t)?void 0:t._$litDirective$;return i?.constructor!==s&&(i?._$AO?.(!1),s===void 0?i=void 0:(i=new s(a),i._$AT(a,e,n)),n!==void 0?(e._$Co??=[])[n]=i:e._$Cl=i),i!==void 0&&(t=S(a,i._$AS(a,t.values),i,n)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);x.currentNode=i;let s=x.nextNode(),r=0,o=0,l=n[0];for(;l!==void 0;){if(r===l.index){let c;l.type===2?c=new R(s,s.nextSibling,this,t):l.type===1?c=new l.ctor(s,l.name,l.strings,this,t):l.type===6&&(c=new X(s,this,t)),this._$AV.push(c),l=n[++o]}r!==l?.index&&(s=x.nextNode(),r++)}return x.currentNode=A,i}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},R=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=S(this,t,e),L(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Lt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,i=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=U.createElement(bt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(e);else{let s=new G(i,this),r=s.u(this.options);s.p(e),this.T(r),this._$AH=s}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new U(t)),e}k(t){et(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,i=0;for(let s of t)i===e.length?e.push(n=new a(this.O(T()),this.O(T()),this,this.options)):n=e[i],n._$AI(s),i++;i<e.length&&(this._$AR(n&&n._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=dt(t).nextSibling;dt(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,i,s){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=p}_$AI(t,e=this,n,i){let s=this.strings,r=!1;if(s===void 0)t=S(this,t,e,0),r=!L(t)||t!==this._$AH&&t!==C,r&&(this._$AH=t);else{let o=t,l,c;for(t=s[0],l=0;l<s.length-1;l++)c=S(this,o[n+l],e,l),c===C&&(c=this._$AH[l]),r||=!L(c)||c!==this._$AH[l],c===p?t=p:t!==p&&(t+=(c??"")+s[l+1]),this._$AH[l]=c}r&&!i&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Y=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},Z=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends E{constructor(t,e,n,i,s){super(t,e,n,i,s),this.type=5}_$AI(t,e=this){if((t=S(this,t,e,0)??p)===C)return;let n=this._$AH,i=t===p&&n!==p||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,s=t!==p&&(n===p||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},X=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}};var Rt=tt.litHtmlPolyfillSupport;Rt?.(U,R),(tt.litHtmlVersions??=[]).push("3.3.2");var wt=(a,t,e)=>{let n=e?.renderBefore??t,i=n._$litPart$;if(i===void 0){let s=e?.renderBefore??null;n._$litPart$=i=new R(t.insertBefore(T(),s),s,void 0,e??{})}return i._$AI(a),i};var nt=globalThis,y=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=wt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};y._$litElement$=!0,y.finalized=!0,nt.litElementHydrateSupport?.({LitElement:y});var Ht=nt.litElementPolyfillSupport;Ht?.({LitElement:y});(nt.litElementVersions??=[]).push("4.2.2");var st=a=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(a,t)}):customElements.define(a,t)};var Nt={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:j},Ot=(a=Nt,t,e)=>{let{kind:n,metadata:i}=e,s=globalThis.litPropertyMetadata.get(i);if(s===void 0&&globalThis.litPropertyMetadata.set(i,s=new Map),n==="setter"&&((a=Object.create(a)).wrapped=!0),s.set(e.name,a),n==="accessor"){let{name:r}=e;return{set(o){let l=t.get.call(this);t.set.call(this,o),this.requestUpdate(r,l,a,!0,o)},init(o){return o!==void 0&&this.C(r,void 0,a,o),o}}}if(n==="setter"){let{name:r}=e;return function(o){let l=this[r];t.call(this,o),this.requestUpdate(r,l,a,!0,o)}}throw Error("Unsupported decorator location: "+n)};function H(a){return(t,e)=>typeof e=="object"?Ot(a,t,e):((n,i,s)=>{let r=i.hasOwnProperty(s);return i.constructor.createProperty(s,n),r?Object.getOwnPropertyDescriptor(i,s):void 0})(a,t,e)}function q(a){return H({...a,state:!0,attribute:!1})}var It={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},zt={"charging completed":"charging completed","rain protection enabled":"rain protection enabled","rain protection disabled":"rain protection disabled","rain delay active":"rain delay active","rain delay inactive":"rain delay inactive","no error":"no error","task unknown":"task unknown"},m=class extends y{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(t){if(!t.entity)throw new Error("The 'entity' option is required.");this._config=t}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return p;let t=this.hass.states[this._config.entity];if(!t)return d`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let e=this._config.name||this._friendlyName(t)||this._entityName(this._config.entity),n=this._config.layout||"default",i=this._entityState(this._config.status_entity)||this._friendlyMowerState(t.state),s=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,r=s?this._cameraUrl(s):void 0,o=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(t.state),u=this._buildHeaderSummary();return d`
      <ha-card>
        <div class=${`wrap layout-${n}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${e}</div>
                <div class="subtitle">${i}</div>
                ${u.length?d`
                      <div class="header-summary">
                        ${u.map(h=>d`<div class="summary-chip">${h}</div>`)}
                      </div>
                    `:p}
              </div>
              <div class=${`state-pill state-${t.state}`}>${this._friendlyMowerState(t.state)}</div>
            </div>

            ${o?d`
                  <div class="map">
                    ${r?d`<img src=${r} alt=${e} />`:d`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `:p}
          </div>

          <div class="side">
            ${c.length?d`
                  ${c.map(h=>d`
                      <div class="action-group">
                        ${c.length>1?d`<div class="action-group-title">${h.title}</div>`:p}
                        <div class="actions">
                          ${h.actions.map(g=>d`
                              <button @click=${g.handler} ?disabled=${g.disabled}>
                                <span class="button-content">
                                  ${g.icon?d`<ha-icon .icon=${g.icon}></ha-icon>`:p}
                                  <span>${g.label}</span>
                                </span>
                              </button>
                            `)}
                        </div>
                      </div>
                    `)}
                `:p}

            ${l.length?d`
                  <div class="stats">
                    ${l.map(h=>d`
                        <div class="tile">
                          <div class="tile-label">${h.label}</div>
                          <div class="tile-value">${h.value}</div>
                        </div>
                      `)}
                  </div>
                `:p}
          </div>
        </div>
      </ha-card>
    `}getCardSize(){let t=this._config?.show_map??!!this._config?.map_entity,e=this._config?.layout||"default";return e==="compact"?t?6:4:e==="wide"?t?8:6:t?7:5}_buildTiles(){if(!this._config||!this.hass)return[];let t=[];if(this._config.battery_entity)t.push(this._tileFromEntity(this._config.battery_entity,"Battery"));else{let e=this._tileFromMowerAttribute("battery_level","Battery","%");e&&t.push(e)}if(this._config.progress_entity)t.push(this._tileFromEntity(this._config.progress_entity,this._preferredEntityLabel(this._config.progress_entity,"Status")));else{let e=this._tileFromMowerAttribute("task_status_name","Task")||this._tileFromMowerAttribute("activity","Activity");e&&t.push(e)}for(let e of this._config.tiles||[])t.push(this._tileFromEntity(e.entity,e.label,e.icon));return t.filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let t=[],e=this.hass.states[this._config.entity];if(!e)return t;for(let h of this._config.summary_entities||[]){let g=this.hass.states[h];if(!g)continue;let f=this._friendlyName(g)||this._entityName(h);t.push(`${f} ${this._friendlyState(g)}`)}let n=this._entityState(this._config.battery_entity)||this._stringAttribute(e,"battery_level","%");n&&t.push(`Battery ${n}`);let i=this._stringAttribute(e,"activity");i&&t.push(`Activity ${i}`);let s=this._stringAttribute(e,"task_status_name");s&&!this._isUnknownLike(s)&&t.push(`Task ${s}`);let r=this._companionSummaryFromBinary("docked","Docked");r&&t.push(r);let o=this._companionSummaryFromBinary("charging","Charging");o&&t.push(o);let l=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");l&&t.push(l);let c=this._companionSummaryFromEntity("sensor","weather_protection_status","Rain protection");c&&t.push(c);let u=this._stringAttribute(e,"error_display")||this._stringAttribute(e,"error_text");return u&&!["none","no error"].includes(u.toLowerCase())&&t.push(`Error ${u}`),[...new Set(t)].slice(0,6)}_tileFromMowerAttribute(t,e,n){let s=(this._config?this.hass.states[this._config.entity]:void 0)?.attributes[t];if(!(s==null||s===""))return{label:e,value:n?`${String(s)} ${n}`:this._humanizeValue(String(s))}}_buildActionGroups(t){if(!this._config)return[];let e=[];(this._config.show_default_actions??!0)&&e.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()});let n=[];(this._config.show_helper_actions??!0)&&n.push(...this._buildHelperActions());let i=[];for(let s of this._config.actions||[]){let r=this._buildConfiguredAction(s,t);r&&i.push(r)}return[{title:"Controls",actions:e},{title:"Helpers",actions:n},{title:"Custom",actions:i}].filter(s=>s.actions.length)}_buildConfiguredAction(t,e){let n=t.type||"more-info";if(n==="start")return{label:t.label||"Start",icon:t.icon||"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()};if(n==="pause")return{label:t.label||"Pause",icon:t.icon||"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()};if(n==="dock")return{label:t.label||"Dock",icon:t.icon||"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()};if(n==="more-info")return{label:t.label||"Details",icon:t.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(t.entity)};if(n==="service"&&t.service)return{label:t.label||t.service,icon:t.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(t.service,t.service_data)}}_buildHelperActions(){let t=[],e=this._companionEntityId("calendar","schedule");e&&t.push({label:"Schedule",icon:"mdi:calendar",disabled:!1,handler:()=>this._showMoreInfo(e)});let n=this._companionEntityId("calendar","all_schedules");n&&t.push({label:"All Schedules",icon:"mdi:calendar-multiselect",disabled:!1,handler:()=>this._showMoreInfo(n)});let i=this._companionEntityId("camera","map_data");i&&t.push({label:"Map Diagnostics",icon:"mdi:map-search-outline",disabled:!1,handler:()=>this._showMoreInfo(i)});let s=this._companionEntityId("camera","all_maps");s&&t.push({label:"All Maps",icon:"mdi:map-multiple-outline",disabled:!1,handler:()=>this._showMoreInfo(s)});let r=this._companionEntityId("button","capture_weather_probe");r&&t.push({label:"Weather",icon:"mdi:weather-rainy",disabled:!1,handler:()=>this._pressButton(r)});let o=this._companionEntityId("button","capture_schedule_probe");o&&t.push({label:"Refresh Schedules",icon:"mdi:calendar-search",disabled:!1,handler:()=>this._pressButton(o)});let l=this._companionEntityId("button","capture_map_probe");l&&t.push({label:"Probe Map",icon:"mdi:map-search",disabled:!1,handler:()=>this._pressButton(l)});let c=this._companionEntityId("button","capture_operation_snapshot");return c&&t.push({label:"Snapshot",icon:"mdi:clipboard-pulse-outline",disabled:!1,handler:()=>this._pressButton(c)}),t}_tileFromEntity(t,e,n){let i=this.hass.states[t];if(!i)return{label:e||this._preferredEntityLabel(t),value:"Unavailable"};let s=e||this._friendlyName(i)||this._preferredEntityLabel(t),r=this._friendlyState(i);return{label:n?`${n} ${s}`:s,value:r}}_friendlyState(t){let e=t.attributes.unit_of_measurement;return typeof e=="string"&&e?`${t.state} ${e}`:this._humanizeEntityState(t.entity_id,String(t.state))}_entityState(t){if(!t)return;let e=this.hass.states[t];return e?this._friendlyState(e):void 0}_stringAttribute(t,e,n){let i=t.attributes[e];if(!(i==null||i===""))return n?`${String(i)} ${n}`:this._humanizeValue(String(i))}_humanizeValue(t){let e=t.trim();if(!e)return e;let n=It[e];if(n)return n;let i=e.replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(!i)return e;let s=i.toLowerCase(),r=zt[s]||s;return r.charAt(0).toUpperCase()+r.slice(1)}_humanizeEntityState(t,e){let n=e.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(t.endsWith("_weather_protection_status")){if(n==="rain protection enabled"||n==="enabled")return"Enabled";if(n==="rain protection disabled"||n==="disabled")return"Disabled"}return(t.endsWith("_task_status")||t.endsWith("_task_status_name"))&&this._isUnknownLike(e)?"Unknown":this._humanizeValue(e)}_isUnknownLike(t){let e=t.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();return["unknown","unavailable","none","task unknown"].includes(e)}_preferredEntityLabel(t,e){return t.endsWith("_weather_protection_status")?"Rain protection":t.endsWith("_state_name")?"State":t.endsWith("_task_status")||t.endsWith("_task_status_name")?"Task":t.endsWith("_battery")?"Battery":t.endsWith("_error")?"Error":e||this._entityName(t)}_friendlyName(t){let e=t.attributes.friendly_name;return typeof e=="string"?e:void 0}_entityName(t){return t.split(".")[1]?.replace(/_/g," ")||t}_friendlyMowerState(t){return this._humanizeValue(t)}_cameraUrl(t){let e=t.attributes.entity_picture;return typeof e=="string"&&e?e:`/api/camera_proxy/${t.entity_id}?v=${Date.now()}`}_showMoreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(t,e){let[n,i]=t.split(".",2);if(!n||!i)throw new Error(`Invalid service '${t}'. Use domain.service format.`);await this.hass.callService(n,i,e||{})}async _pressButton(t){await this.hass.callService("button","press",{entity_id:t})}_companionEntityId(t,e){if(!this._config)return;let n=this._config.entity.split(".",2)[1];if(!n)return;let i=`${t}.${n}_${e}`;return this.hass.states[i]?i:void 0}_companionSummaryFromBinary(t,e){let n=this._companionEntityId("binary_sensor",t);if(!n)return;let i=this.hass.states[n];if(i&&i.state==="on")return e}_companionSummaryFromEntity(t,e,n){let i=this._companionEntityId(t,e);if(!i)return;let s=this.hass.states[i];if(!(!s||["unknown","unavailable",""].includes(s.state)))return`${n} ${this._friendlyState(s)}`}_canStart(t){return!["mowing","returning","unavailable","unknown"].includes(t)}_canPause(t){return["mowing","returning"].includes(t)}_canDock(t){return!["docked","unavailable","unknown"].includes(t)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};m.styles=z`
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
  `,v([H({attribute:!1})],m.prototype,"hass",2),v([q()],m.prototype,"_config",2),m=v([st("lawn-mower-card")],m);var w=class extends y{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(e){this._config=e}render(){let e=this._config||m.getStubConfig();return d`
      <div class="editor">
        <div class="hint">
          Select a mower first. The editor will prefill common companion entities such as map, state,
          battery, and status tiles when they can be derived safely.
        </div>
        ${this._field("Mower entity",e.entity,"entity","lawn_mower.my_mower","Required lawn_mower entity.",["lawn_mower"])}
        ${this._field("Title",e.name,"name","Backyard mower","Optional card title override.")}
        ${this._layoutField(e.layout||"default")}
        ${this._field("Map camera",e.map_entity,"map_entity","camera.my_mower_map","Optional camera entity used for the map preview.",["camera"])}
        ${this._toggle("Show map section",e.show_map??!!e.map_entity,"show_map")}
        ${this._field("Status entity",e.status_entity,"status_entity","sensor.my_mower_state_name","Optional entity shown under the title.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._field("Battery entity",e.battery_entity,"battery_entity","sensor.my_mower_battery","Optional entity shown as a stat tile.",["sensor","number","input_number","binary_sensor"])}
        ${this._field("Progress or status tile",e.progress_entity,"progress_entity","sensor.my_mower_progress","Optional entity shown as a second stat tile.",["sensor","binary_sensor","calendar","camera","lawn_mower"])}
        ${this._toggle("Show default actions",e.show_default_actions??!0,"show_default_actions")}
        ${this._toggle("Show helper actions",e.show_helper_actions??!0,"show_helper_actions")}
        ${this._summaryEntitiesSection(e.summary_entities||[])}
        ${this._tilesSection(e.tiles||[])}
        ${this._actionsSection(e.actions||[])}
      </div>
    `}_layoutField(e){return d`
      <label>
        <span>Layout</span>
        <select .value=${e} @change=${this._layoutChanged}>
          <option value="default">Default</option>
          <option value="compact">Compact</option>
          <option value="wide">Wide</option>
        </select>
        <span class="hint">Choose how the card balances map, actions, and stats.</span>
      </label>
    `}_field(e,n,i,s,r,o){let l=o?.length?`lawn-mower-card-editor-${String(i)}-entities`:void 0;return d`
      <label>
        <span>${e}</span>
        <input
          .value=${n||""}
          data-key=${String(i)}
          placeholder=${s}
          list=${l||p}
          @input=${this._valueChanged}
        />
        <span class="hint">${r}</span>
        ${l?this._entityDatalist(l,o):p}
      </label>
    `}_toggle(e,n,i){return d`
      <label class="toggle">
        <span>${e}</span>
        <input
          type="checkbox"
          .checked=${n}
          data-key=${i}
          @change=${this._toggleChanged}
        />
      </label>
    `}_summaryEntitiesSection(e){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Header summary chips</strong>
            <span class="hint">Add specific entities when you want tighter control over the header summary.</span>
          </div>
          <button type="button" @click=${this._addSummaryEntity}>Add summary entity</button>
        </div>
        ${e.length?d`
              <div class="collection">
                ${e.map((n,i)=>d`
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
    `}_tilesSection(e){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Extra tiles</strong>
            <span class="hint">Add companion entities as extra stat tiles.</span>
          </div>
          <button type="button" @click=${this._addTile}>Add tile</button>
        </div>
        ${e.length?d`
              <div class="collection">
                ${e.map((n,i)=>d`
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
    `}_actionsSection(e){return d`
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <strong>Custom actions</strong>
            <span class="hint">Add extra control chips beyond the built-in mower and helper actions.</span>
          </div>
          <button type="button" @click=${this._addAction}>Add action</button>
        </div>
        ${e.length?d`
              <div class="collection">
                ${e.map((n,i)=>{let s=n.type||"more-info",r=this._serviceDataDraftError(i,n);return d`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Type</span>
                          <select
                            .value=${s}
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
                        ${s==="more-info"?d`
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
                            `:s==="service"?d`
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
                      ${s==="service"?d`
                            <div class="row-grid single">
                              <label>
                                <span>Service data</span>
                                <textarea
                                  data-index=${String(i)}
                                  placeholder='{"entity_id":"button.my_probe"}'
                                  @input=${this._actionServiceDataChanged}
                                >${this._serviceDataValue(i,n)}</textarea>
                                <span class=${`hint ${r?"error":""}`}>
                                  ${r?"Enter valid JSON before this service data can be saved.":"Optional JSON object passed to the service call."}
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
    `}_entityDatalist(e,n){let i=this._entityIds(n);return i.length?d`
      <datalist id=${e}>
        ${i.map(s=>d`<option value=${s}></option>`)}
      </datalist>
    `:p}_entityIds(e){if(!this.hass?.states)return[];let n=e?.length?new Set(e):void 0;return Object.keys(this.hass.states).filter(i=>{if(!n)return!0;let[s]=i.split(".");return n.has(s)}).sort((i,s)=>i.localeCompare(s))}_valueChanged(e){let n=e.currentTarget,i=n.dataset.key;if(!i)return;let s=this._config||m.getStubConfig(),r={...s},o=n.value.trim();o?r[i]=o:delete r[i],r.entity||(r.entity=m.getStubConfig().entity),i==="entity"&&o&&o!==s.entity&&this._applyEntityAutofill(r,s),this._emitConfigChanged(r)}_applyEntityAutofill(e,n){let i=this._autoDetectedCompanions(n.entity),s=this._autoDetectedCompanions(e.entity);this._replaceAutoEntityField("map_entity",e,i,s),this._replaceAutoEntityField("status_entity",e,i,s),this._replaceAutoEntityField("battery_entity",e,i,s),this._replaceAutoEntityField("progress_entity",e,i,s);let r=!!i.map_entity;(e.show_map===void 0||e.show_map===r)&&(s.map_entity?e.show_map=!0:delete e.show_map)}_replaceAutoEntityField(e,n,i,s){let r=n[e],o=i[e],l=s[e];(!r||o!==void 0&&r===o)&&(l?n[e]=l:delete n[e])}_autoDetectedCompanions(e){if(!e||!this.hass?.states)return{};let n=e.split(".",2)[1];if(!n)return{};let i=(o,l)=>{let c=`${o}.${n}_${l}`;return this.hass.states[c]?c:void 0},s=(...o)=>o.find(l=>!!l);return{map_entity:s(i("camera","map"),i("camera","all_maps"),i("camera","map_data")),status_entity:s(i("sensor","state_name"),i("sensor","activity"),i("sensor","error")),battery_entity:i("sensor","battery"),progress_entity:s(i("sensor","weather_protection_status"),i("sensor","task_status_name"),i("sensor","task_status"),i("sensor","error"))}}_toggleChanged(e){let n=e.currentTarget,i=n.dataset.key;if(!i)return;let s={...this._config||m.getStubConfig(),[i]:n.checked};s.entity||(s.entity=m.getStubConfig().entity),this._emitConfigChanged(s)}_layoutChanged(e){let n=e.currentTarget,i={...this._config||m.getStubConfig(),layout:n.value};i.entity||(i.entity=m.getStubConfig().entity),this._emitConfigChanged(i)}_addSummaryEntity(){let e=this._nextConfig();e.summary_entities=[...e.summary_entities||[],""],this._emitConfigChanged(e)}_removeSummaryEntity(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.summary_entities=(i.summary_entities||[]).filter((s,r)=>r!==n),i.summary_entities.length||delete i.summary_entities,this._emitConfigChanged(i)}_summaryEntityChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let s=this._nextConfig(),r=[...s.summary_entities||[]];r[i]=n.value.trim();let o=r.filter(Boolean);o.length?s.summary_entities=o:delete s.summary_entities,this._emitConfigChanged(s)}_addTile(){let e=this._nextConfig();e.tiles=[...e.tiles||[],{entity:""}],this._emitConfigChanged(e)}_removeTile(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.tiles=(i.tiles||[]).filter((s,r)=>r!==n),i.tiles.length||delete i.tiles,this._emitConfigChanged(i)}_tileChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e),s=n.dataset.key;if(i===void 0||!s)return;let r=this._nextConfig(),o=[...r.tiles||[]],l={...o[i]||{entity:""}},c=n.value.trim();c?l[s]=c:delete l[s],o[i]=l,r.tiles=o,this._emitConfigChanged(r)}_addAction(){let e=this._nextConfig();e.actions=[...e.actions||[],{type:"more-info"}],this._emitConfigChanged(e)}_removeAction(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.actions=(i.actions||[]).filter((s,r)=>r!==n),i.actions.length||delete i.actions,delete this._serviceDataDrafts[n],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,n),this._emitConfigChanged(i)}_actionChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e),s=n.dataset.key;if(i===void 0||!s)return;let r=this._nextConfig(),o=[...r.actions||[]],l={...o[i]||{type:"more-info"}},c=n.value.trim();c?l[s]=s==="service_data"?void 0:c:delete l[s],o[i]=l,r.actions=o,this._emitConfigChanged(r)}_actionTypeChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let s=this._nextConfig(),r=[...s.actions||[]],o={...r[i]||{}};o.type=n.value,o.type!=="service"&&(delete o.service,delete o.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts}),o.type!=="more-info"&&delete o.entity,r[i]=o,s.actions=r,this._emitConfigChanged(s)}_actionServiceDataChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let s=n.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[i]:n.value};let r=this._nextConfig(),o=[...r.actions||[]],l={...o[i]||{type:"service"}};if(!s){delete l.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts},o[i]=l,r.actions=o,this._emitConfigChanged(r);return}try{let c=JSON.parse(s);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,o[i]=l,r.actions=o,this._emitConfigChanged(r)}catch{this.requestUpdate()}}_serviceDataValue(e,n){return e in this._serviceDataDrafts?this._serviceDataDrafts[e]:n.service_data?JSON.stringify(n.service_data,null,2):""}_serviceDataDraftError(e,n){let i=this._serviceDataValue(e,n).trim();if(!i)return!1;try{let s=JSON.parse(i);return!s||typeof s!="object"||Array.isArray(s)}catch{return!0}}_nextConfig(){let e={...this._config||m.getStubConfig()};return e.entity||(e.entity=m.getStubConfig().entity),e}_emitConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_indexFromEvent(e){let i=e.currentTarget?.dataset.index;if(i===void 0)return;let s=Number(i);return Number.isInteger(s)?s:void 0}_reindexDrafts(e,n){let i={};for(let[s,r]of Object.entries(e)){let o=Number(s);Number.isNaN(o)||o===n||(i[o>n?o-1:o]=r)}return i}};w.styles=z`
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
  `,v([H({attribute:!1})],w.prototype,"hass",2),v([q()],w.prototype,"_config",2),v([q()],w.prototype,"_serviceDataDrafts",2),w=v([st("lawn-mower-card-editor")],w);window.customCards=window.customCards||[];window.customCards.push({type:"lawn-mower-card",name:"Lawn Mower Card",description:"A mower-native Home Assistant card with controls, map, and status tiles."});export{m as LawnMowerCard,w as LawnMowerCardEditor};
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
