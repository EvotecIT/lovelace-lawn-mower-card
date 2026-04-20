var wt=Object.defineProperty;var xt=Object.getOwnPropertyDescriptor;var v=(o,t,e,s)=>{for(var i=s>1?void 0:s?xt(t,e):t,n=o.length-1,r;n>=0;n--)(r=o[n])&&(i=(s?r(t,e,i):r(i))||i);return s&&i&&wt(t,e,i),i};var L=globalThis,I=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),rt=new WeakMap,k=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(I&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=rt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&rt.set(e,t))}return t}toString(){return this.cssText}},ot=o=>new k(typeof o=="string"?o:o+"",void 0,W),j=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((s,i,n)=>s+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[n+1],o[0]);return new k(e,o,W)},at=(o,t)=>{if(I)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=L.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,o.appendChild(s)}},J=I?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return ot(e)})(o):o;var{is:At,defineProperty:Ct,getOwnPropertyDescriptor:St,getOwnPropertyNames:Et,getOwnPropertySymbols:kt,getPrototypeOf:Mt}=Object,B=globalThis,lt=B.trustedTypes,Dt=lt?lt.emptyScript:"",Pt=B.reactiveElementPolyfillSupport,M=(o,t)=>o,D={toAttribute(o,t){switch(t){case Boolean:o=o?Dt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},z=(o,t)=>!At(o,t),ct={attribute:!0,type:String,converter:D,reflect:!1,useDefault:!1,hasChanged:z};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;var _=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ct){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Ct(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:n}=St(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:i,set(r){let a=i?.call(this);n?.call(this,r),this.requestUpdate(t,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=Mt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,s=[...Et(e),...kt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return at(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:D).toAttribute(e,s.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:D;this._$Em=i;let a=r.fromAttribute(e,n.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(t,e,s,i=!1,n){if(t!==void 0){let r=this.constructor;if(i===!1&&(n=this[t]),s??=r.getPropertyOptions(t),!((s.hasChanged??z)(n,e)||s.useDefault&&s.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:n},r){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),n!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:r}=n,a=this[i];r!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,n,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};_.elementStyles=[],_.shadowRootOptions={mode:"open"},_[M("elementProperties")]=new Map,_[M("finalized")]=new Map,Pt?.({ReactiveElement:_}),(B.reactiveElementVersions??=[]).push("2.1.2");var tt=globalThis,dt=o=>o,F=tt.trustedTypes,ht=F?F.createPolicy("lit-html",{createHTML:o=>o}):void 0,_t="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+b,Tt=`<${yt}>`,A=document,T=()=>A.createComment(""),H=o=>o===null||typeof o!="object"&&typeof o!="function",et=Array.isArray,Ht=o=>et(o)||typeof o?.[Symbol.iterator]=="function",K=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pt=/-->/g,ut=/>/g,w=RegExp(`>|${K}(?:([^\\s"'>=/]+)(${K}*=${K}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,it=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),d=it(1),Vt=it(2),Wt=it(3),C=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ft=new WeakMap,x=A.createTreeWalker(A,129);function bt(o,t){if(!et(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ht!==void 0?ht.createHTML(t):t}var Nt=(o,t)=>{let e=o.length-1,s=[],i,n=t===2?"<svg>":t===3?"<math>":"",r=P;for(let a=0;a<e;a++){let l=o[a],c,u,h=-1,g=0;for(;g<l.length&&(r.lastIndex=g,u=r.exec(l),u!==null);)g=r.lastIndex,r===P?u[1]==="!--"?r=pt:u[1]!==void 0?r=ut:u[2]!==void 0?(vt.test(u[2])&&(i=RegExp("</"+u[2],"g")),r=w):u[3]!==void 0&&(r=w):r===w?u[0]===">"?(r=i??P,h=-1):u[1]===void 0?h=-2:(h=r.lastIndex-u[2].length,c=u[1],r=u[3]===void 0?w:u[3]==='"'?mt:gt):r===mt||r===gt?r=w:r===pt||r===ut?r=P:(r=w,i=void 0);let f=r===w&&o[a+1].startsWith("/>")?" ":"";n+=r===P?l+Tt:h>=0?(s.push(c),l.slice(0,h)+_t+l.slice(h)+b+f):l+b+(h===-2?a:f)}return[bt(o,n+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},N=class o{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let n=0,r=0,a=t.length-1,l=this.parts,[c,u]=Nt(t,e);if(this.el=o.createElement(c,s),x.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=x.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(_t)){let g=u[r++],f=i.getAttribute(h).split(b),U=/([.?@])?(.*)/.exec(g);l.push({type:1,index:n,name:U[2],strings:f,ctor:U[1]==="."?Y:U[1]==="?"?Z:U[1]==="@"?Q:E}),i.removeAttribute(h)}else h.startsWith(b)&&(l.push({type:6,index:n}),i.removeAttribute(h));if(vt.test(i.tagName)){let h=i.textContent.split(b),g=h.length-1;if(g>0){i.textContent=F?F.emptyScript:"";for(let f=0;f<g;f++)i.append(h[f],T()),x.nextNode(),l.push({type:2,index:++n});i.append(h[g],T())}}}else if(i.nodeType===8)if(i.data===yt)l.push({type:2,index:n});else{let h=-1;for(;(h=i.data.indexOf(b,h+1))!==-1;)l.push({type:7,index:n}),h+=b.length-1}n++}}static createElement(t,e){let s=A.createElement("template");return s.innerHTML=t,s}};function S(o,t,e=o,s){if(t===C)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,n=H(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(o),i._$AT(o,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=S(o,i._$AS(o,t.values),i,s)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);x.currentNode=i;let n=x.nextNode(),r=0,a=0,l=s[0];for(;l!==void 0;){if(r===l.index){let c;l.type===2?c=new O(n,n.nextSibling,this,t):l.type===1?c=new l.ctor(n,l.name,l.strings,this,t):l.type===6&&(c=new X(n,this,t)),this._$AV.push(c),l=s[++a]}r!==l?.index&&(n=x.nextNode(),r++)}return x.currentNode=A,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},O=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=S(this,t,e),H(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ht(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=N.createElement(bt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let n=new G(i,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new N(t)),e}k(t){et(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let n of t)i===e.length?e.push(s=new o(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(n),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=dt(t).nextSibling;dt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(t,e=this,s,i){let n=this.strings,r=!1;if(n===void 0)t=S(this,t,e,0),r=!H(t)||t!==this._$AH&&t!==C,r&&(this._$AH=t);else{let a=t,l,c;for(t=n[0],l=0;l<n.length-1;l++)c=S(this,a[s+l],e,l),c===C&&(c=this._$AH[l]),r||=!H(c)||c!==this._$AH[l],c===p?t=p:t!==p&&(t+=(c??"")+n[l+1]),this._$AH[l]=c}r&&!i&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Y=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},Z=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends E{constructor(t,e,s,i,n){super(t,e,s,i,n),this.type=5}_$AI(t,e=this){if((t=S(this,t,e,0)??p)===C)return;let s=this._$AH,i=t===p&&s!==p||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,n=t!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},X=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t)}};var Ot=tt.litHtmlPolyfillSupport;Ot?.(N,O),(tt.litHtmlVersions??=[]).push("3.3.2");var $t=(o,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let n=e?.renderBefore??null;s._$litPart$=i=new O(t.insertBefore(T(),n),n,void 0,e??{})}return i._$AI(o),i};var st=globalThis,y=class extends _{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$t(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};y._$litElement$=!0,y.finalized=!0,st.litElementHydrateSupport?.({LitElement:y});var Rt=st.litElementPolyfillSupport;Rt?.({LitElement:y});(st.litElementVersions??=[]).push("4.2.2");var nt=o=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(o,t)}):customElements.define(o,t)};var Ut={attribute:!0,type:String,converter:D,reflect:!1,hasChanged:z},Lt=(o=Ut,t,e)=>{let{kind:s,metadata:i}=e,n=globalThis.litPropertyMetadata.get(i);if(n===void 0&&globalThis.litPropertyMetadata.set(i,n=new Map),s==="setter"&&((o=Object.create(o)).wrapped=!0),n.set(e.name,o),s==="accessor"){let{name:r}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(r,l,o,!0,a)},init(a){return a!==void 0&&this.C(r,void 0,o,a),a}}}if(s==="setter"){let{name:r}=e;return function(a){let l=this[r];t.call(this,a),this.requestUpdate(r,l,o,!0,a)}}throw Error("Unsupported decorator location: "+s)};function R(o){return(t,e)=>typeof e=="object"?Lt(o,t,e):((s,i,n)=>{let r=i.hasOwnProperty(n);return i.constructor.createProperty(n,s),r?Object.getOwnPropertyDescriptor(i,n):void 0})(o,t,e)}function q(o){return R({...o,state:!0,attribute:!1})}var It={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},m=class extends y{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(t){if(!t.entity)throw new Error("The 'entity' option is required.");this._config=t}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return p;let t=this.hass.states[this._config.entity];if(!t)return d`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let e=this._config.name||this._friendlyName(t)||this._entityName(this._config.entity),s=this._config.layout||"default",i=this._entityState(this._config.status_entity)||this._friendlyMowerState(t.state),n=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,r=n?this._cameraUrl(n):void 0,a=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(t.state),u=this._buildHeaderSummary();return d`
      <ha-card>
        <div class=${`wrap layout-${s}`}>
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

            ${a?d`
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
    `}getCardSize(){let t=this._config?.show_map??!!this._config?.map_entity,e=this._config?.layout||"default";return e==="compact"?t?6:4:e==="wide"?t?8:6:t?7:5}_buildTiles(){if(!this._config||!this.hass)return[];let t=[];if(this._config.battery_entity)t.push(this._tileFromEntity(this._config.battery_entity,"Battery"));else{let e=this._tileFromMowerAttribute("battery_level","Battery","%");e&&t.push(e)}if(this._config.progress_entity)t.push(this._tileFromEntity(this._config.progress_entity,"Status"));else{let e=this._tileFromMowerAttribute("task_status_name","Task")||this._tileFromMowerAttribute("activity","Activity");e&&t.push(e)}for(let e of this._config.tiles||[])t.push(this._tileFromEntity(e.entity,e.label,e.icon));return t.filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let t=[],e=this.hass.states[this._config.entity];if(!e)return t;for(let h of this._config.summary_entities||[]){let g=this.hass.states[h];if(!g)continue;let f=this._friendlyName(g)||this._entityName(h);t.push(`${f} ${this._friendlyState(g)}`)}let s=this._entityState(this._config.battery_entity)||this._stringAttribute(e,"battery_level","%");s&&t.push(`Battery ${s}`);let i=this._stringAttribute(e,"activity");i&&t.push(`Activity ${i}`);let n=this._stringAttribute(e,"task_status_name");n&&t.push(`Task ${n}`);let r=this._companionSummaryFromBinary("docked","Docked");r&&t.push(r);let a=this._companionSummaryFromBinary("charging","Charging");a&&t.push(a);let l=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");l&&t.push(l);let c=this._companionSummaryFromEntity("sensor","weather_protection_status","Weather");c&&t.push(c);let u=this._stringAttribute(e,"error_display")||this._stringAttribute(e,"error_text");return u&&!["none","no error"].includes(u.toLowerCase())&&t.push(`Error ${u}`),[...new Set(t)].slice(0,6)}_tileFromMowerAttribute(t,e,s){let n=(this._config?this.hass.states[this._config.entity]:void 0)?.attributes[t];if(!(n==null||n===""))return{label:e,value:s?`${String(n)} ${s}`:String(n)}}_buildActionGroups(t){if(!this._config)return[];let e=[];(this._config.show_default_actions??!0)&&e.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()});let s=[];(this._config.show_helper_actions??!0)&&s.push(...this._buildHelperActions());let i=[];for(let n of this._config.actions||[]){let r=this._buildConfiguredAction(n,t);r&&i.push(r)}return[{title:"Controls",actions:e},{title:"Helpers",actions:s},{title:"Custom",actions:i}].filter(n=>n.actions.length)}_buildConfiguredAction(t,e){let s=t.type||"more-info";if(s==="start")return{label:t.label||"Start",icon:t.icon||"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()};if(s==="pause")return{label:t.label||"Pause",icon:t.icon||"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()};if(s==="dock")return{label:t.label||"Dock",icon:t.icon||"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()};if(s==="more-info")return{label:t.label||"Details",icon:t.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(t.entity)};if(s==="service"&&t.service)return{label:t.label||t.service,icon:t.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(t.service,t.service_data)}}_buildHelperActions(){let t=[],e=this._companionEntityId("calendar","schedule");e&&t.push({label:"Schedule",icon:"mdi:calendar",disabled:!1,handler:()=>this._showMoreInfo(e)});let s=this._companionEntityId("calendar","all_schedules");s&&t.push({label:"All Schedules",icon:"mdi:calendar-multiselect",disabled:!1,handler:()=>this._showMoreInfo(s)});let i=this._companionEntityId("camera","map_data");i&&t.push({label:"Map Diagnostics",icon:"mdi:map-search-outline",disabled:!1,handler:()=>this._showMoreInfo(i)});let n=this._companionEntityId("camera","all_maps");n&&t.push({label:"All Maps",icon:"mdi:map-multiple-outline",disabled:!1,handler:()=>this._showMoreInfo(n)});let r=this._companionEntityId("button","capture_weather_probe");r&&t.push({label:"Weather",icon:"mdi:weather-rainy",disabled:!1,handler:()=>this._pressButton(r)});let a=this._companionEntityId("button","capture_schedule_probe");a&&t.push({label:"Refresh Schedules",icon:"mdi:calendar-search",disabled:!1,handler:()=>this._pressButton(a)});let l=this._companionEntityId("button","capture_map_probe");l&&t.push({label:"Probe Map",icon:"mdi:map-search",disabled:!1,handler:()=>this._pressButton(l)});let c=this._companionEntityId("button","capture_operation_snapshot");return c&&t.push({label:"Snapshot",icon:"mdi:clipboard-pulse-outline",disabled:!1,handler:()=>this._pressButton(c)}),t}_tileFromEntity(t,e,s){let i=this.hass.states[t];if(!i)return{label:e||this._entityName(t),value:"Unavailable"};let n=e||this._friendlyName(i)||this._entityName(t),r=this._friendlyState(i);return{label:s?`${s} ${n}`:n,value:r}}_friendlyState(t){let e=t.attributes.unit_of_measurement;return typeof e=="string"&&e?`${t.state} ${e}`:String(t.state)}_entityState(t){if(!t)return;let e=this.hass.states[t];return e?this._friendlyState(e):void 0}_stringAttribute(t,e,s){let i=t.attributes[e];if(!(i==null||i===""))return s?`${String(i)} ${s}`:String(i)}_friendlyName(t){let e=t.attributes.friendly_name;return typeof e=="string"?e:void 0}_entityName(t){return t.split(".")[1]?.replace(/_/g," ")||t}_friendlyMowerState(t){return It[t]||t.replace(/_/g," ")}_cameraUrl(t){let e=t.attributes.entity_picture;return typeof e=="string"&&e?e:`/api/camera_proxy/${t.entity_id}?v=${Date.now()}`}_showMoreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(t,e){let[s,i]=t.split(".",2);if(!s||!i)throw new Error(`Invalid service '${t}'. Use domain.service format.`);await this.hass.callService(s,i,e||{})}async _pressButton(t){await this.hass.callService("button","press",{entity_id:t})}_companionEntityId(t,e){if(!this._config)return;let s=this._config.entity.split(".",2)[1];if(!s)return;let i=`${t}.${s}_${e}`;return this.hass.states[i]?i:void 0}_companionSummaryFromBinary(t,e){let s=this._companionEntityId("binary_sensor",t);if(!s)return;let i=this.hass.states[s];if(i&&i.state==="on")return e}_companionSummaryFromEntity(t,e,s){let i=this._companionEntityId(t,e);if(!i)return;let n=this.hass.states[i];if(!(!n||["unknown","unavailable",""].includes(n.state)))return`${s} ${this._friendlyState(n)}`}_canStart(t){return!["mowing","returning","unavailable","unknown"].includes(t)}_canPause(t){return["mowing","returning"].includes(t)}_canDock(t){return!["docked","unavailable","unknown"].includes(t)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};m.styles=j`
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
  `,v([R({attribute:!1})],m.prototype,"hass",2),v([q()],m.prototype,"_config",2),m=v([nt("lawn-mower-card")],m);var $=class extends y{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(e){this._config=e}render(){let e=this._config||m.getStubConfig();return d`
      <div class="editor">
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
    `}_field(e,s,i,n,r,a){let l=a?.length?`lawn-mower-card-editor-${String(i)}-entities`:void 0;return d`
      <label>
        <span>${e}</span>
        <input
          .value=${s||""}
          data-key=${String(i)}
          placeholder=${n}
          list=${l||p}
          @input=${this._valueChanged}
        />
        <span class="hint">${r}</span>
        ${l?this._entityDatalist(l,a):p}
      </label>
    `}_toggle(e,s,i){return d`
      <label class="toggle">
        <span>${e}</span>
        <input
          type="checkbox"
          .checked=${s}
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
                ${e.map((s,i)=>d`
                    <div class="row">
                      <div class="row-grid single">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${s||""}
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
                ${e.map((s,i)=>d`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Entity</span>
                          <input
                            .value=${s.entity||""}
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
                            .value=${s.label||""}
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
                            .value=${s.icon||""}
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
                ${e.map((s,i)=>{let n=s.type||"more-info",r=this._serviceDataDraftError(i,s);return d`
                    <div class="row">
                      <div class="row-grid">
                        <label>
                          <span>Type</span>
                          <select
                            .value=${n}
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
                            .value=${s.label||""}
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
                            .value=${s.icon||""}
                            data-index=${String(i)}
                            data-key="icon"
                            placeholder="mdi:information-outline"
                            @input=${this._actionChanged}
                          />
                        </label>
                        ${n==="more-info"?d`
                              <label>
                                <span>Target entity</span>
                                <input
                                  .value=${s.entity||""}
                                  data-index=${String(i)}
                                  data-key="entity"
                                  placeholder="camera.my_mower_map"
                                  list="lawn-mower-card-editor-action-targets"
                                  @input=${this._actionChanged}
                                />
                                <span class="hint">Optional. Defaults to the mower entity.</span>
                              </label>
                            `:n==="service"?d`
                                <label>
                                  <span>Service</span>
                                  <input
                                    .value=${s.service||""}
                                    data-index=${String(i)}
                                    data-key="service"
                                    placeholder="button.press"
                                    @input=${this._actionChanged}
                                  />
                                </label>
                              `:d`<div></div>`}
                      </div>
                      ${n==="service"?d`
                            <div class="row-grid single">
                              <label>
                                <span>Service data</span>
                                <textarea
                                  data-index=${String(i)}
                                  placeholder='{"entity_id":"button.my_probe"}'
                                  @input=${this._actionServiceDataChanged}
                                >${this._serviceDataValue(i,s)}</textarea>
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
    `}_entityDatalist(e,s){let i=this._entityIds(s);return i.length?d`
      <datalist id=${e}>
        ${i.map(n=>d`<option value=${n}></option>`)}
      </datalist>
    `:p}_entityIds(e){if(!this.hass?.states)return[];let s=e?.length?new Set(e):void 0;return Object.keys(this.hass.states).filter(i=>{if(!s)return!0;let[n]=i.split(".");return s.has(n)}).sort((i,n)=>i.localeCompare(n))}_valueChanged(e){let s=e.currentTarget,i=s.dataset.key;if(!i)return;let n={...this._config||m.getStubConfig()},r=s.value.trim();r?n[i]=r:delete n[i],n.entity||(n.entity=m.getStubConfig().entity),this._emitConfigChanged(n)}_toggleChanged(e){let s=e.currentTarget,i=s.dataset.key;if(!i)return;let n={...this._config||m.getStubConfig(),[i]:s.checked};n.entity||(n.entity=m.getStubConfig().entity),this._emitConfigChanged(n)}_layoutChanged(e){let s=e.currentTarget,i={...this._config||m.getStubConfig(),layout:s.value};i.entity||(i.entity=m.getStubConfig().entity),this._emitConfigChanged(i)}_addSummaryEntity(){let e=this._nextConfig();e.summary_entities=[...e.summary_entities||[],""],this._emitConfigChanged(e)}_removeSummaryEntity(e){let s=this._indexFromEvent(e);if(s===void 0)return;let i=this._nextConfig();i.summary_entities=(i.summary_entities||[]).filter((n,r)=>r!==s),i.summary_entities.length||delete i.summary_entities,this._emitConfigChanged(i)}_summaryEntityChanged(e){let s=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig(),r=[...n.summary_entities||[]];r[i]=s.value.trim();let a=r.filter(Boolean);a.length?n.summary_entities=a:delete n.summary_entities,this._emitConfigChanged(n)}_addTile(){let e=this._nextConfig();e.tiles=[...e.tiles||[],{entity:""}],this._emitConfigChanged(e)}_removeTile(e){let s=this._indexFromEvent(e);if(s===void 0)return;let i=this._nextConfig();i.tiles=(i.tiles||[]).filter((n,r)=>r!==s),i.tiles.length||delete i.tiles,this._emitConfigChanged(i)}_tileChanged(e){let s=e.currentTarget,i=this._indexFromEvent(e),n=s.dataset.key;if(i===void 0||!n)return;let r=this._nextConfig(),a=[...r.tiles||[]],l={...a[i]||{entity:""}},c=s.value.trim();c?l[n]=c:delete l[n],a[i]=l,r.tiles=a,this._emitConfigChanged(r)}_addAction(){let e=this._nextConfig();e.actions=[...e.actions||[],{type:"more-info"}],this._emitConfigChanged(e)}_removeAction(e){let s=this._indexFromEvent(e);if(s===void 0)return;let i=this._nextConfig();i.actions=(i.actions||[]).filter((n,r)=>r!==s),i.actions.length||delete i.actions,delete this._serviceDataDrafts[s],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,s),this._emitConfigChanged(i)}_actionChanged(e){let s=e.currentTarget,i=this._indexFromEvent(e),n=s.dataset.key;if(i===void 0||!n)return;let r=this._nextConfig(),a=[...r.actions||[]],l={...a[i]||{type:"more-info"}},c=s.value.trim();c?l[n]=n==="service_data"?void 0:c:delete l[n],a[i]=l,r.actions=a,this._emitConfigChanged(r)}_actionTypeChanged(e){let s=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let n=this._nextConfig(),r=[...n.actions||[]],a={...r[i]||{}};a.type=s.value,a.type!=="service"&&(delete a.service,delete a.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts}),a.type!=="more-info"&&delete a.entity,r[i]=a,n.actions=r,this._emitConfigChanged(n)}_actionServiceDataChanged(e){let s=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let n=s.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[i]:s.value};let r=this._nextConfig(),a=[...r.actions||[]],l={...a[i]||{type:"service"}};if(!n){delete l.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts},a[i]=l,r.actions=a,this._emitConfigChanged(r);return}try{let c=JSON.parse(n);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,a[i]=l,r.actions=a,this._emitConfigChanged(r)}catch{this.requestUpdate()}}_serviceDataValue(e,s){return e in this._serviceDataDrafts?this._serviceDataDrafts[e]:s.service_data?JSON.stringify(s.service_data,null,2):""}_serviceDataDraftError(e,s){let i=this._serviceDataValue(e,s).trim();if(!i)return!1;try{let n=JSON.parse(i);return!n||typeof n!="object"||Array.isArray(n)}catch{return!0}}_nextConfig(){let e={...this._config||m.getStubConfig()};return e.entity||(e.entity=m.getStubConfig().entity),e}_emitConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_indexFromEvent(e){let i=e.currentTarget?.dataset.index;if(i===void 0)return;let n=Number(i);return Number.isInteger(n)?n:void 0}_reindexDrafts(e,s){let i={};for(let[n,r]of Object.entries(e)){let a=Number(n);Number.isNaN(a)||a===s||(i[a>s?a-1:a]=r)}return i}};$.styles=j`
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
  `,v([R({attribute:!1})],$.prototype,"hass",2),v([q()],$.prototype,"_config",2),v([q()],$.prototype,"_serviceDataDrafts",2),$=v([nt("lawn-mower-card-editor")],$);window.customCards=window.customCards||[];window.customCards.push({type:"lawn-mower-card",name:"Lawn Mower Card",description:"A mower-native Home Assistant card with controls, map, and status tiles."});export{m as LawnMowerCard,$ as LawnMowerCardEditor};
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
