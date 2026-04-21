var xt=Object.defineProperty;var Ct=Object.getOwnPropertyDescriptor;var b=(o,t,e,n)=>{for(var i=n>1?void 0:n?Ct(t,e):t,r=o.length-1,s;r>=0;r--)(s=o[r])&&(i=(n?s(t,e,i):s(i))||i);return n&&i&&xt(t,e,i),i};var O=globalThis,B=O.ShadowRoot&&(O.ShadyCSS===void 0||O.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol(),at=new WeakMap,P=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==Z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(B&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=at.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&at.set(e,t))}return t}toString(){return this.cssText}},ot=o=>new P(typeof o=="string"?o:o+"",void 0,Z),W=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((n,i,r)=>n+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[r+1],o[0]);return new P(e,o,Z)},lt=(o,t)=>{if(B)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let n=document.createElement("style"),i=O.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=e.cssText,o.appendChild(n)}},J=B?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let n of t.cssRules)e+=n.cssText;return ot(e)})(o):o;var{is:At,defineProperty:St,getOwnPropertyDescriptor:Et,getOwnPropertyNames:kt,getOwnPropertySymbols:Mt,getPrototypeOf:Pt}=Object,j=globalThis,ct=j.trustedTypes,Dt=ct?ct.emptyScript:"",Tt=j.reactiveElementPolyfillSupport,D=(o,t)=>o,T={toAttribute(o,t){switch(t){case Boolean:o=o?Dt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},F=(o,t)=>!At(o,t),dt={attribute:!0,type:String,converter:T,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=dt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(t,n,e);i!==void 0&&St(this.prototype,t,i)}}static getPropertyDescriptor(t,e,n){let{get:i,set:r}=Et(this.prototype,t)??{get(){return this[e]},set(s){this[e]=s}};return{get:i,set(s){let a=i?.call(this);r?.call(this,s),this.requestUpdate(t,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??dt}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;let t=Pt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){let e=this.properties,n=[...kt(e),...Mt(e)];for(let i of n)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,i]of e)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let i=this._$Eu(e,n);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let i of n)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return lt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:T).toAttribute(e,n.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){let n=this.constructor,i=n._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),s=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:T;this._$Em=i;let a=s.fromAttribute(e,r.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(t,e,n,i=!1,r){if(t!==void 0){let s=this.constructor;if(i===!1&&(r=this[t]),n??=s.getPropertyOptions(t),!((n.hasChanged??F)(r,e)||n.useDefault&&n.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:i,wrapped:r},s){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),r!==!0||s!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:s}=r,a=this[i];s!==!0||this._$AL.has(i)||a===void 0||this.C(i,void 0,r,a)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[D("elementProperties")]=new Map,v[D("finalized")]=new Map,Tt?.({ReactiveElement:v}),(j.reactiveElementVersions??=[]).push("2.1.2");var et=globalThis,ut=o=>o,q=et.trustedTypes,pt=q?q.createPolicy("lit-html",{createHTML:o=>o}):void 0,vt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,yt="?"+w,Lt=`<${yt}>`,A=document,H=()=>A.createComment(""),R=o=>o===null||typeof o!="object"&&typeof o!="function",it=Array.isArray,Ht=o=>it(o)||typeof o?.[Symbol.iterator]=="function",Y=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,gt=/>/g,x=RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),_t=/'/g,mt=/"/g,bt=/^(?:script|style|textarea|title)$/i,nt=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),d=nt(1),Zt=nt(2),Jt=nt(3),S=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ft=new WeakMap,C=A.createTreeWalker(A,129);function wt(o,t){if(!it(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}var Rt=(o,t)=>{let e=o.length-1,n=[],i,r=t===2?"<svg>":t===3?"<math>":"",s=L;for(let a=0;a<e;a++){let l=o[a],c,p,h=-1,g=0;for(;g<l.length&&(s.lastIndex=g,p=s.exec(l),p!==null);)g=s.lastIndex,s===L?p[1]==="!--"?s=ht:p[1]!==void 0?s=gt:p[2]!==void 0?(bt.test(p[2])&&(i=RegExp("</"+p[2],"g")),s=x):p[3]!==void 0&&(s=x):s===x?p[0]===">"?(s=i??L,h=-1):p[1]===void 0?h=-2:(h=s.lastIndex-p[2].length,c=p[1],s=p[3]===void 0?x:p[3]==='"'?mt:_t):s===mt||s===_t?s=x:s===ht||s===gt?s=L:(s=x,i=void 0);let _=s===x&&o[a+1].startsWith("/>")?" ":"";r+=s===L?l+Lt:h>=0?(n.push(c),l.slice(0,h)+vt+l.slice(h)+w+_):l+w+(h===-2?a:_)}return[wt(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),n]},N=class o{constructor({strings:t,_$litType$:e},n){let i;this.parts=[];let r=0,s=0,a=t.length-1,l=this.parts,[c,p]=Rt(t,e);if(this.el=o.createElement(c,n),C.currentNode=this.el.content,e===2||e===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=C.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(vt)){let g=p[s++],_=i.getAttribute(h).split(w),m=/([.?@])?(.*)/.exec(g);l.push({type:1,index:r,name:m[2],strings:_,ctor:m[1]==="."?K:m[1]==="?"?G:m[1]==="@"?Q:k}),i.removeAttribute(h)}else h.startsWith(w)&&(l.push({type:6,index:r}),i.removeAttribute(h));if(bt.test(i.tagName)){let h=i.textContent.split(w),g=h.length-1;if(g>0){i.textContent=q?q.emptyScript:"";for(let _=0;_<g;_++)i.append(h[_],H()),C.nextNode(),l.push({type:2,index:++r});i.append(h[g],H())}}}else if(i.nodeType===8)if(i.data===yt)l.push({type:2,index:r});else{let h=-1;for(;(h=i.data.indexOf(w,h+1))!==-1;)l.push({type:7,index:r}),h+=w.length-1}r++}}static createElement(t,e){let n=A.createElement("template");return n.innerHTML=t,n}};function E(o,t,e=o,n){if(t===S)return t;let i=n!==void 0?e._$Co?.[n]:e._$Cl,r=R(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(o),i._$AT(o,e,n)),n!==void 0?(e._$Co??=[])[n]=i:e._$Cl=i),i!==void 0&&(t=E(o,i._$AS(o,t.values),i,n)),t}var X=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,i=(t?.creationScope??A).importNode(e,!0);C.currentNode=i;let r=C.nextNode(),s=0,a=0,l=n[0];for(;l!==void 0;){if(s===l.index){let c;l.type===2?c=new z(r,r.nextSibling,this,t):l.type===1?c=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(c=new tt(r,this,t)),this._$AV.push(c),l=n[++a]}s!==l?.index&&(r=C.nextNode(),s++)}return C.currentNode=A,i}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(t,n,e),e+=n.strings.length-2):n._$AI(t[e])),e++}},z=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,n,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),R(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ht(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(A.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:n}=t,i=typeof n=="number"?this._$AC(t):(n.el===void 0&&(n.el=N.createElement(wt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(e);else{let r=new X(i,this),s=r.u(this.options);r.p(e),this.T(s),this._$AH=r}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new N(t)),e}k(t){it(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,n,i=0;for(let r of t)i===e.length?e.push(n=new o(this.O(H()),this.O(H()),this,this.options)):n=e[i],n._$AI(r),i++;i<e.length&&(this._$AR(n&&n._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let n=ut(t).nextSibling;ut(t).remove(),t=n}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},k=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,i,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=u}_$AI(t,e=this,n,i){let r=this.strings,s=!1;if(r===void 0)t=E(this,t,e,0),s=!R(t)||t!==this._$AH&&t!==S,s&&(this._$AH=t);else{let a=t,l,c;for(t=r[0],l=0;l<r.length-1;l++)c=E(this,a[n+l],e,l),c===S&&(c=this._$AH[l]),s||=!R(c)||c!==this._$AH[l],c===u?t=u:t!==u&&(t+=(c??"")+r[l+1]),this._$AH[l]=c}s&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},K=class extends k{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},G=class extends k{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},Q=class extends k{constructor(t,e,n,i,r){super(t,e,n,i,r),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??u)===S)return;let n=this._$AH,i=t===u&&n!==u||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,r=t!==u&&(n===u||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},tt=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var Nt=et.litHtmlPolyfillSupport;Nt?.(N,z),(et.litHtmlVersions??=[]).push("3.3.2");var $t=(o,t,e)=>{let n=e?.renderBefore??t,i=n._$litPart$;if(i===void 0){let r=e?.renderBefore??null;n._$litPart$=i=new z(t.insertBefore(H(),r),r,void 0,e??{})}return i._$AI(o),i};var rt=globalThis,y=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$t(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};y._$litElement$=!0,y.finalized=!0,rt.litElementHydrateSupport?.({LitElement:y});var zt=rt.litElementPolyfillSupport;zt?.({LitElement:y});(rt.litElementVersions??=[]).push("4.2.2");var st=o=>(t,e)=>{e!==void 0?e.addInitializer(()=>{customElements.define(o,t)}):customElements.define(o,t)};var Ut={attribute:!0,type:String,converter:T,reflect:!1,hasChanged:F},Ot=(o=Ut,t,e)=>{let{kind:n,metadata:i}=e,r=globalThis.litPropertyMetadata.get(i);if(r===void 0&&globalThis.litPropertyMetadata.set(i,r=new Map),n==="setter"&&((o=Object.create(o)).wrapped=!0),r.set(e.name,o),n==="accessor"){let{name:s}=e;return{set(a){let l=t.get.call(this);t.set.call(this,a),this.requestUpdate(s,l,o,!0,a)},init(a){return a!==void 0&&this.C(s,void 0,o,a),a}}}if(n==="setter"){let{name:s}=e;return function(a){let l=this[s];t.call(this,a),this.requestUpdate(s,l,o,!0,a)}}throw Error("Unsupported decorator location: "+n)};function U(o){return(t,e)=>typeof e=="object"?Ot(o,t,e):((n,i,r)=>{let s=i.hasOwnProperty(r);return i.constructor.createProperty(r,n),s?Object.getOwnPropertyDescriptor(i,r):void 0})(o,t,e)}function I(o){return U({...o,state:!0,attribute:!1})}var Bt={mowing:"Mowing",docked:"Docked",paused:"Paused",returning:"Returning",error:"Error",unavailable:"Unavailable",unknown:"Unknown"},Wt={"charging completed":"charging completed","rain protection enabled":"rain protection enabled","rain protection disabled":"rain protection disabled","rain delay active":"rain delay active","rain delay inactive":"rain delay inactive","no error":"no error","task unknown":"task unknown"},f=class extends y{static getStubConfig(){return{type:"custom:lawn-mower-card",entity:"lawn_mower.my_mower"}}setConfig(t){if(!t.entity)throw new Error("The 'entity' option is required.");this._config=t}static async getConfigElement(){return document.createElement("lawn-mower-card-editor")}render(){if(!this.hass||!this._config)return u;let t=this.hass.states[this._config.entity];if(!t)return d`
        <ha-card>
          <div class="wrap">Entity not found: ${this._config.entity}</div>
        </ha-card>
      `;let e=this._config.name||this._friendlyName(t)||this._entityName(this._config.entity),n=this._config.layout||"default",i=this._entityState(this._config.status_entity)||this._friendlyMowerState(t.state),r=this._config.map_entity?this.hass.states[this._config.map_entity]:void 0,s=r?this._cameraUrl(r):void 0,a=this._config.show_map??!!this._config.map_entity,l=this._buildTiles(),c=this._buildActionGroups(t.state),p=this._buildHeaderSummary(),h=this._resolvedControlEntities(),g=this._plannedRunDetails(t),_=this._runtimeSessionDetails();return d`
      <ha-card>
        <div class=${`wrap layout-${n}`}>
          <div class="main">
            <div class="header">
              <div class="title-block">
                <div class="title">${e}</div>
                <div class="subtitle">${i}</div>
                ${p.length?d`
                      <div class="header-summary">
                        ${p.map(m=>d`<div class="summary-chip">${m}</div>`)}
                      </div>
                    `:u}
              </div>
              <div class=${`state-pill state-${t.state}`}>${this._friendlyMowerState(t.state)}</div>
            </div>

            ${a?d`
                  <div class="map">
                    ${s?d`<img src=${s} alt=${e} />`:d`<div class="map-placeholder">No mower map configured yet.</div>`}
                  </div>
                `:u}
          </div>

          <div class="side">
            ${g?this._renderPlannedRunPanel(g):u}

            ${_?this._renderRuntimeSessionPanel(_):u}

            ${h.length?d`
                  <div class="selectors">
                    ${h.map(m=>this._renderSelectControl(m))}
                  </div>
                `:u}

            ${c.length?d`
                  ${c.map(m=>d`
                      <div class="action-group">
                        ${c.length>1?d`<div class="action-group-title">${m.title}</div>`:u}
                        <div class="actions">
                          ${m.actions.map(M=>d`
                              <button @click=${M.handler} ?disabled=${M.disabled}>
                                <span class="button-content">
                                  ${M.icon?d`<ha-icon .icon=${M.icon}></ha-icon>`:u}
                                  <span>${M.label}</span>
                                </span>
                              </button>
                            `)}
                        </div>
                      </div>
                    `)}
                `:u}

            ${l.length?d`
                  <div class="stats">
                    ${l.map(m=>d`
                        <div class="tile">
                          <div class="tile-label">${m.label}</div>
                          <div class="tile-value">${m.value}</div>
                        </div>
                      `)}
                  </div>
                `:u}
          </div>
        </div>
      </ha-card>
    `}getCardSize(){let t=this._config?.show_map??!!this._config?.map_entity,e=this._config?.layout||"default";return e==="compact"?t?8:6:e==="wide"?t?10:8:t?9:7}_buildTiles(){if(!this._config||!this.hass)return[];let t=[];if(this._config.battery_entity)t.push(this._tileFromEntity(this._config.battery_entity,"Battery"));else{let e=this._tileFromMowerAttribute("battery_level","Battery","%");e&&t.push(e)}if(this._config.progress_entity)t.push(this._tileFromEntity(this._config.progress_entity,this._preferredEntityLabel(this._config.progress_entity,"Status")));else{let e=this._tileFromMowerAttribute("task_status_name","Task")||this._tileFromMowerAttribute("activity","Activity");e&&t.push(e)}for(let e of this._config.tiles||[])t.push(this._tileFromEntity(e.entity,e.label,e.icon));if(!(this._config.tiles||[]).length){let e=this._runtimeCoverageTile();e&&t.push(e);let n=this._runtimeLiveTrackTile();n&&t.push(n)}return t.filter(e=>e.value!=="Unavailable")}_buildHeaderSummary(){if(!this._config||!this.hass)return[];let t=[],e=this.hass.states[this._config.entity];if(!e)return t;for(let g of this._resolvedSummaryEntities()){let _=this.hass.states[g];if(!_)continue;let m=this._friendlyName(_)||this._entityName(g);t.push(`${m} ${this._friendlyState(_)}`)}let n=this._entityState(this._config.battery_entity)||this._stringAttribute(e,"battery_level","%");n&&t.push(`Battery ${n}`);let i=this._stringAttribute(e,"activity");i&&t.push(`Activity ${i}`);let r=this._stringAttribute(e,"task_status_name");r&&!this._isUnknownLike(r)&&t.push(`Task ${r}`);let s=this._companionSummaryFromBinary("docked","Docked");s&&t.push(s);let a=this._companionSummaryFromBinary("charging","Charging");a&&t.push(a);let l=this._companionSummaryFromBinary("bluetooth_connected","Bluetooth");l&&t.push(l);let c=this._companionSummaryFromBinary("rain_delay_active","Rain Delay");c&&t.push(c);let p=this._companionSummaryFromEntity("sensor","weather_protection_status","Rain protection");p&&t.push(p);let h=this._stringAttribute(e,"error_display")||this._stringAttribute(e,"error_text");return h&&!["none","no error"].includes(h.toLowerCase())&&t.push(`Error ${h}`),t.push(...this._runtimeMapSummaryItems()),[...new Set(t)].slice(0,6)}_resolvedSummaryEntities(){if(!this._config)return[];let t=(this._config.summary_entities||[]).filter(Boolean);return t.length?t:this._autoDetectedSummaryEntities(this._config.entity)}_autoDetectedSummaryEntities(t){if(!t||!this.hass?.states)return[];let e=t.split(".",2)[1];if(!e)return[];let n=(...i)=>{let r=i.find(s=>!!this.hass.states[s]);return r?[r]:[]};return[`sensor.${e}_runtime_mission_progress`,`sensor.${e}_runtime_current_area`,`sensor.${e}_runtime_total_area`,`sensor.${e}_selected_target`,`sensor.${e}_selected_map`,`sensor.${e}_current_zone`,`sensor.${e}_current_cleaned_area`,`sensor.${e}_current_cleaning_time`,`sensor.${e}_active_segment_count`,...n(`sensor.${e}_current_app_map_trajectory_length`,`sensor.${e}_current_app_map_mow_path_length`,`sensor.${e}_current_app_map_trajectory_point_count`)].filter(i=>!!this.hass.states[i])}_resolvedControlEntities(){if(!this._config)return[];let t=(this._config.control_entities||[]).filter(Boolean);return t.length?t:this._autoDetectedControlEntities(this._config.entity)}_autoDetectedControlEntities(t){if(!t||!this.hass?.states)return[];let e=t.split(".",2)[1];return e?["map","mowing_action","edge","zone","spot"].map(n=>`select.${e}_${n}`).filter(n=>!!this.hass.states[n]):[]}_renderSelectControl(t){let e=this.hass.states[t];if(!e)return u;let n=Array.isArray(e.attributes.options)?e.attributes.options.filter(s=>typeof s=="string"):[];if(!n.length)return u;let i=this._friendlyName(e)||this._preferredEntityLabel(t)||this._entityName(t),r=["unavailable","unknown"].includes(String(e.state));return d`
      <label class="selector-card">
        <span class="selector-label">${i}</span>
        <select
          .value=${String(e.state)}
          ?disabled=${r}
          @change=${s=>this._selectOption(t,s)}
        >
          ${n.map(s=>d`<option value=${s}>${s}</option>`)}
        </select>
      </label>
    `}_tileFromMowerAttribute(t,e,n){let r=(this._config?this.hass.states[this._config.entity]:void 0)?.attributes[t];if(!(r==null||r===""))return{label:e,value:n?`${String(r)} ${n}`:this._humanizeValue(String(r))}}_runtimeCoverageTile(){let t=this._companionState("sensor","runtime_current_area"),e=this._companionState("sensor","runtime_total_area");if(t&&e)return{label:"Coverage",value:`${t} / ${e}`};if(t)return{label:"Current Area",value:t}}_runtimeLiveTrackTile(){let t=this._runtimeSessionDetails();if(t){if(t.trailLengthM!==void 0&&t.trailLengthM>0)return{label:"Live Trail",value:this._formatMeters(t.trailLengthM)};if(t.pointCount!==void 0&&t.pointCount>1)return{label:"Live Points",value:`${Math.round(t.pointCount)}`}}}_buildActionGroups(t){if(!this._config)return[];let e=[];(this._config.show_default_actions??!0)&&e.push({label:"Start",icon:"mdi:play",disabled:!this._canStart(t),handler:()=>this._startMowing()},{label:"Pause",icon:"mdi:pause",disabled:!this._canPause(t),handler:()=>this._pauseMowing()},{label:"Dock",icon:"mdi:home-import-outline",disabled:!this._canDock(t),handler:()=>this._dockMower()});let n=[];(this._config.show_helper_actions??!0)&&n.push(...this._buildHelperActions());let i=[];for(let r of this._config.actions||[]){let s=this._buildConfiguredAction(r,t);s&&i.push(s)}return[{title:"Controls",actions:e},{title:"Helpers",actions:n},{title:"Custom",actions:i}].filter(r=>r.actions.length)}_buildConfiguredAction(t,e){let n=t.type||"more-info";if(n==="start")return{label:t.label||"Start",icon:t.icon||"mdi:play",disabled:!this._canStart(e),handler:()=>this._startMowing()};if(n==="pause")return{label:t.label||"Pause",icon:t.icon||"mdi:pause",disabled:!this._canPause(e),handler:()=>this._pauseMowing()};if(n==="dock")return{label:t.label||"Dock",icon:t.icon||"mdi:home-import-outline",disabled:!this._canDock(e),handler:()=>this._dockMower()};if(n==="more-info")return{label:t.label||"Details",icon:t.icon||"mdi:information-outline",disabled:!1,handler:()=>this._showMoreInfo(t.entity)};if(n==="service"&&t.service)return{label:t.label||t.service,icon:t.icon||"mdi:flash-outline",disabled:!1,handler:()=>this._callConfiguredService(t.service,t.service_data)}}_buildHelperActions(){let t=[],e=this._companionEntityId("calendar","schedule");e&&t.push({label:"Schedule",icon:"mdi:calendar",disabled:!1,handler:()=>this._showMoreInfo(e)});let n=this._companionEntityId("calendar","all_schedules");n&&t.push({label:"All Schedules",icon:"mdi:calendar-multiselect",disabled:!1,handler:()=>this._showMoreInfo(n)});let i=this._companionEntityId("camera","map_data");i&&t.push({label:"Map Diagnostics",icon:"mdi:map-search-outline",disabled:!1,handler:()=>this._showMoreInfo(i)});let r=this._companionEntityId("camera","all_maps");r&&t.push({label:"All Maps",icon:"mdi:map-multiple-outline",disabled:!1,handler:()=>this._showMoreInfo(r)});let s=this._companionEntityId("button","capture_weather_probe");s&&t.push({label:"Weather",icon:"mdi:weather-rainy",disabled:!1,handler:()=>this._pressButton(s)});let a=this._companionEntityId("button","capture_schedule_probe");a&&t.push({label:"Refresh Schedules",icon:"mdi:calendar-search",disabled:!1,handler:()=>this._pressButton(a)});let l=this._companionEntityId("button","capture_map_probe");l&&t.push({label:"Probe Map",icon:"mdi:map-search",disabled:!1,handler:()=>this._pressButton(l)});let c=this._companionEntityId("button","capture_operation_snapshot");return c&&t.push({label:"Snapshot",icon:"mdi:clipboard-pulse-outline",disabled:!1,handler:()=>this._pressButton(c)}),t}_tileFromEntity(t,e,n){let i=this.hass.states[t];if(!i)return{label:e||this._preferredEntityLabel(t),value:"Unavailable"};let r=e||this._friendlyName(i)||this._preferredEntityLabel(t),s=this._friendlyState(i);return{label:n?`${n} ${r}`:r,value:s}}_friendlyState(t){let e=t.attributes.unit_of_measurement;return typeof e=="string"&&e?`${t.state} ${e}`:this._humanizeEntityState(t.entity_id,String(t.state))}_entityState(t){if(!t)return;let e=this.hass.states[t];return e?this._friendlyState(e):void 0}_stringAttribute(t,e,n){let i=t.attributes[e];if(!(i==null||i===""))return n?`${String(i)} ${n}`:this._humanizeValue(String(i))}_humanizeValue(t){let e=t.trim();if(!e)return e;let n=Bt[e];if(n)return n;let i=e.replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(!i)return e;let r=i.toLowerCase(),s=Wt[r]||r;return s.charAt(0).toUpperCase()+s.slice(1)}_humanizeEntityState(t,e){let n=e.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();if(t.endsWith("_weather_protection_status")){if(n==="rain protection enabled"||n==="enabled")return"Enabled";if(n==="rain protection disabled"||n==="disabled")return"Disabled"}return(t.endsWith("_task_status")||t.endsWith("_task_status_name"))&&this._isUnknownLike(e)?"Unknown":this._humanizeValue(e)}_isUnknownLike(t){let e=t.trim().toLowerCase().replace(/[_-]+/g," ").replace(/\s+/g," ").trim();return["unknown","unavailable","none","task unknown"].includes(e)}_preferredEntityLabel(t,e){return t.endsWith("_weather_protection_status")?"Rain protection":t.endsWith("_state_name")?"State":t.endsWith("_task_status")||t.endsWith("_task_status_name")?"Task":t.endsWith("_battery")?"Battery":t.endsWith("_selected_mowing_action")?"Selected Action":t.endsWith("_selected_target")?"Selected Target":t.endsWith("_selected_map")?"Selected Map":t.endsWith("_mowing_action")?"Mowing Action":t.endsWith("_zone")?"Zone":t.endsWith("_spot")?"Spot":t.endsWith("_map")?"Map":t.endsWith("_mowing_progress")?"Progress":t.endsWith("_runtime_mission_progress")?"Mission Progress":t.endsWith("_runtime_current_area")?"Current Area":t.endsWith("_runtime_total_area")?"Total Area":t.endsWith("_runtime_position_x")?"Position X":t.endsWith("_runtime_position_y")?"Position Y":t.endsWith("_runtime_heading")?"Heading":t.endsWith("_runtime_live_track_length")?"Live Trail":t.endsWith("_runtime_live_track_point_count")?"Live Points":t.endsWith("_runtime_live_track_segment_count")?"Live Segments":t.endsWith("_current_cleaned_area")?"Cut Area":t.endsWith("_current_cleaning_time")?"Time":t.endsWith("_current_zone")?"Current Zone":t.endsWith("_active_segment_count")?"Active Segments":t.endsWith("_current_app_map_area")?"Map Area":t.endsWith("_current_app_map_zone_count")?"Zones":t.endsWith("_current_app_map_spot_count")?"Spots":t.endsWith("_current_app_map_trajectory_point_count")?"Path Points":t.endsWith("_current_app_map_trajectory_length")?"Path Length":t.endsWith("_current_app_map_mow_path_length")?"Trail Length":t.endsWith("_current_app_map_cut_relation_count")?"Cut Links":t.endsWith("_error")?"Error":e||this._entityName(t)}_friendlyName(t){let e=t.attributes.friendly_name;return typeof e=="string"?e:void 0}_entityName(t){return t.split(".")[1]?.replace(/_/g," ")||t}_friendlyMowerState(t){return this._humanizeValue(t)}_cameraUrl(t){let e=t.attributes.entity_picture;return typeof e=="string"&&e?e:`/api/camera_proxy/${t.entity_id}?v=${Date.now()}`}_mapEntity(){if(this._config?.map_entity)return this.hass.states[this._config.map_entity]}_entityAttributeString(t,e){let n=t.attributes[e];return typeof n=="string"&&n.trim()?n.trim():void 0}_entityAttributeInteger(t,e){let n=t.attributes[e];return typeof n=="number"&&Number.isInteger(n)?n:void 0}_numberAttribute(t,e){let n=t.attributes[e];if(typeof n=="number"&&Number.isFinite(n))return n;if(typeof n=="string"&&n.trim()){let i=Number(n);if(Number.isFinite(i))return i}}_formatMeters(t){let e=t>=10?1:2;return`${t.toFixed(e)} m`}_formatCoordinate(t){return Number.isInteger(t)?`${t}`:t.toFixed(1)}_plannedRunDetails(t){let e=this._companionState("sensor","selected_mowing_action")||this._entityAttributeString(t,"selected_mowing_action_label")||this._entityAttributeString(t,"task_status_name"),n=this._companionState("sensor","selected_map")||this._entityAttributeString(t,"selected_map_label"),i=this._entityAttributeString(t,"app_current_map_label"),r=this._companionState("sensor","selected_target"),s=this._entityAttributeInteger(t,"selected_zone_id"),a=this._entityAttributeInteger(t,"selected_spot_id"),l=this._entityAttributeString(t,"selected_contour_label"),c=t.attributes.selected_map_matches_active_app_map===!1,p=r;if(!p&&l?p=l:!p&&s!==void 0?p=`Zone ${s}`:!p&&a!==void 0&&(p=`Spot #${a}`),!(!e&&!n&&!i&&!p&&!c))return{action:e,selectedMap:n,activeMap:i,target:p,needsMapSwitch:c}}_runtimeSessionDetails(){let t=this._mapEntity(),e=this._companionState("sensor","runtime_mission_progress")||this._companionState("sensor","mowing_progress"),n=this._companionState("sensor","runtime_current_area")||this._companionState("sensor","current_cleaned_area"),i=this._companionState("sensor","runtime_total_area"),r=this._companionState("sensor","current_zone"),s=this._companionBinaryStateLabel("bluetooth_connected","Connected","Disconnected")||void 0,a=t?this._numberAttribute(t,"runtime_track_length_m"):void 0,l=t?this._numberAttribute(t,"runtime_track_point_count"):void 0,c=t?this._numberAttribute(t,"runtime_track_segment_count"):void 0,p=t?this._numberAttribute(t,"runtime_heading_deg"):void 0,h=t?this._numberAttribute(t,"runtime_pose_x"):void 0,g=t?this._numberAttribute(t,"runtime_pose_y"):void 0,_=t&&typeof t.attributes.source=="string"&&t.attributes.source?t.attributes.source:void 0;if(e!==void 0||n!==void 0||i!==void 0||r!==void 0||s!==void 0||a!==void 0&&a>0||l!==void 0&&l>1||c!==void 0&&c>0||p!==void 0||h!==void 0&&g!==void 0)return{missionProgress:e,currentArea:n,totalArea:i,currentZone:r,bluetoothState:s,trailLengthM:a,pointCount:l,segmentCount:c,headingDeg:p,positionX:h,positionY:g,source:_}}_runtimeMapSummaryItems(){let t=this._runtimeSessionDetails();if(!t)return[];let e=[],n=t.trailLengthM,i=t.pointCount,r=n!==void 0&&n>0||i!==void 0&&i>1;n!==void 0&&n>0?e.push(`Live trail ${this._formatMeters(n)}`):i!==void 0&&i>1&&e.push(`Live points ${Math.round(i)}`);let s=t.headingDeg;return s!==void 0&&r&&e.push(`Heading ${Math.round(s)}\xB0`),t.bluetoothState==="Connected"&&e.push("Bluetooth Connected"),e}_renderPlannedRunPanel(t){let e=[];return t.action&&e.push({label:"Action",value:t.action}),t.selectedMap&&e.push({label:"Selected Map",value:t.selectedMap}),t.activeMap&&t.activeMap!==t.selectedMap&&e.push({label:"Active Map",value:t.activeMap}),t.target&&e.push({label:"Target",value:t.target}),!e.length&&!t.needsMapSwitch?u:d`
      <div class="target-panel">
        <div class="target-header">
          <div class="target-title">Planned Run</div>
          <div class="target-badge">Start Preview</div>
        </div>
        <div class="target-grid">
          ${e.map(n=>d`
              <div class="target-metric">
                <div class="target-metric-label">${n.label}</div>
                <div class="target-metric-value">${n.value}</div>
              </div>
            `)}
        </div>
        ${t.needsMapSwitch?d`
              <div class="target-note">
                The selected map does not match the mower's active app map yet. Switch maps before
                starting a scoped run.
              </div>
            `:u}
      </div>
    `}_renderRuntimeSessionPanel(t){let e=[];return t.missionProgress&&e.push({label:"Progress",value:t.missionProgress}),t.currentArea&&t.totalArea?e.push({label:"Coverage",value:`${t.currentArea} / ${t.totalArea}`}):t.currentArea&&e.push({label:"Current Area",value:t.currentArea}),t.currentZone&&e.push({label:"Current Zone",value:t.currentZone}),t.bluetoothState&&e.push({label:"Bluetooth",value:t.bluetoothState}),t.trailLengthM!==void 0&&t.trailLengthM>0&&e.push({label:"Live Trail",value:this._formatMeters(t.trailLengthM)}),t.pointCount!==void 0&&t.pointCount>1&&e.push({label:"Points",value:`${Math.round(t.pointCount)}`}),t.segmentCount!==void 0&&t.segmentCount>0&&e.push({label:"Segments",value:`${Math.round(t.segmentCount)}`}),t.headingDeg!==void 0&&e.push({label:"Heading",value:`${Math.round(t.headingDeg)}\xB0`}),t.positionX!==void 0&&t.positionY!==void 0&&e.push({label:"Position",value:`${this._formatCoordinate(t.positionX)}, ${this._formatCoordinate(t.positionY)}`}),t.source&&e.push({label:"Source",value:this._humanizeValue(t.source)}),e.length?d`
      <div class="session-panel">
        <div class="session-header">
          <div class="session-title">Live Session</div>
          <div class="session-badge">Runtime Overlay</div>
        </div>
        <div class="session-subtitle">
          Current mowing telemetry from the live runtime map stream.
        </div>
        <div class="session-grid">
          ${e.map(n=>d`
              <div class="session-metric">
                <div class="session-metric-label">${n.label}</div>
                <div class="session-metric-value">${n.value}</div>
              </div>
            `)}
        </div>
      </div>
    `:u}_showMoreInfo(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t||this._config?.entity},bubbles:!0,composed:!0}))}async _callConfiguredService(t,e){let[n,i]=t.split(".",2);if(!n||!i)throw new Error(`Invalid service '${t}'. Use domain.service format.`);await this.hass.callService(n,i,e||{})}async _pressButton(t){await this.hass.callService("button","press",{entity_id:t})}async _selectOption(t,e){let i=e.currentTarget.value;i&&await this.hass.callService("select","select_option",{entity_id:t,option:i})}_companionEntityId(t,e){if(!this._config)return;let n=this._config.entity.split(".",2)[1];if(!n)return;let i=`${t}.${n}_${e}`;return this.hass.states[i]?i:void 0}_companionSummaryFromBinary(t,e){let n=this._companionEntityId("binary_sensor",t);if(!n)return;let i=this.hass.states[n];if(i&&i.state==="on")return e}_companionSummaryFromEntity(t,e,n){let i=this._companionEntityId(t,e);if(!i)return;let r=this.hass.states[i];if(!(!r||["unknown","unavailable",""].includes(r.state)))return`${n} ${this._friendlyState(r)}`}_companionState(t,e){let n=this._companionEntityId(t,e);if(n)return this._entityState(n)}_companionBinaryStateLabel(t,e,n){let i=this._companionEntityId("binary_sensor",t);if(!i)return;let r=this.hass.states[i];if(!(!r||["unknown","unavailable",""].includes(r.state)))return r.state==="on"?e:r.state==="off"&&n?n:this._friendlyState(r)}_canStart(t){return!["mowing","returning","unavailable","unknown"].includes(t)}_canPause(t){return["mowing","returning"].includes(t)}_canDock(t){return!["docked","unavailable","unknown"].includes(t)}async _startMowing(){await this.hass.callService("lawn_mower","start_mowing",{entity_id:this._config?.entity})}async _pauseMowing(){await this.hass.callService("lawn_mower","pause",{entity_id:this._config?.entity})}async _dockMower(){await this.hass.callService("lawn_mower","dock",{entity_id:this._config?.entity})}};f.styles=W`
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
  `,b([U({attribute:!1})],f.prototype,"hass",2),b([I()],f.prototype,"_config",2),f=b([st("lawn-mower-card")],f);var $=class extends y{constructor(){super(...arguments);this._serviceDataDrafts={}}setConfig(e){this._config=e}render(){let e=this._config||f.getStubConfig();return d`
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
        ${this._controlEntitiesSection(e.control_entities||[])}
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
    `}_field(e,n,i,r,s,a){let l=a?.length?`lawn-mower-card-editor-${String(i)}-entities`:void 0;return d`
      <label>
        <span>${e}</span>
        <input
          .value=${n||""}
          data-key=${String(i)}
          placeholder=${r}
          list=${l||u}
          @input=${this._valueChanged}
        />
        <span class="hint">${s}</span>
        ${l?this._entityDatalist(l,a):u}
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
    `}_controlEntitiesSection(e){return d`
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
        ${e.length?d`
              <div class="collection">
                ${e.map((n,i)=>d`
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
                ${e.map((n,i)=>{let r=n.type||"more-info",s=this._serviceDataDraftError(i,n);return d`
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
                          `:u}
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
        ${i.map(r=>d`<option value=${r}></option>`)}
      </datalist>
    `:u}_entityIds(e){if(!this.hass?.states)return[];let n=e?.length?new Set(e):void 0;return Object.keys(this.hass.states).filter(i=>{if(!n)return!0;let[r]=i.split(".");return n.has(r)}).sort((i,r)=>i.localeCompare(r))}_valueChanged(e){let n=e.currentTarget,i=n.dataset.key;if(!i)return;let r=this._config||f.getStubConfig(),s={...r},a=n.value.trim();a?s[i]=a:delete s[i],s.entity||(s.entity=f.getStubConfig().entity),i==="entity"&&a&&a!==r.entity&&this._applyEntityAutofill(s,r),this._emitConfigChanged(s)}_applyEntityAutofill(e,n){let i=this._autoDetectedCompanions(n.entity),r=this._autoDetectedCompanions(e.entity);this._replaceAutoEntityField("map_entity",e,i,r),this._replaceAutoEntityField("status_entity",e,i,r),this._replaceAutoEntityField("battery_entity",e,i,r),this._replaceAutoEntityField("progress_entity",e,i,r),this._replaceAutoControlEntities(e,i,r),this._replaceAutoSummaryEntities(e,i,r);let s=!!i.map_entity;(e.show_map===void 0||e.show_map===s)&&(r.map_entity?e.show_map=!0:delete e.show_map)}_replaceAutoControlEntities(e,n,i){let r=(e.control_entities||[]).filter(Boolean),s=Array.isArray(n.control_entities)?n.control_entities.filter(Boolean):[],a=Array.isArray(i.control_entities)?i.control_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(a.length?e.control_entities=a:delete e.control_entities)}_replaceAutoSummaryEntities(e,n,i){let r=(e.summary_entities||[]).filter(Boolean),s=Array.isArray(n.summary_entities)?n.summary_entities.filter(Boolean):[],a=Array.isArray(i.summary_entities)?i.summary_entities.filter(Boolean):[];(!r.length||this._sameEntityList(r,s))&&(a.length?e.summary_entities=a:delete e.summary_entities)}_replaceAutoEntityField(e,n,i,r){let s=n[e],a=i[e],l=r[e];(!s||a!==void 0&&s===a)&&(l?n[e]=l:delete n[e])}_autoDetectedCompanions(e){if(!e||!this.hass?.states)return{};let n=e.split(".",2)[1];if(!n)return{};let i=(a,l)=>{let c=`${a}.${n}_${l}`;return this.hass.states[c]?c:void 0},r=(...a)=>a.find(l=>!!l);return{map_entity:r(i("camera","map"),i("camera","all_maps"),i("camera","map_data")),status_entity:r(i("sensor","state_name"),i("sensor","activity"),i("sensor","error")),battery_entity:i("sensor","battery"),progress_entity:r(i("sensor","runtime_mission_progress"),i("sensor","mowing_progress"),i("sensor","weather_protection_status"),i("sensor","task_status_name"),i("sensor","task_status"),i("sensor","error")),control_entities:[i("select","map"),i("select","mowing_action"),i("select","edge"),i("select","zone"),i("select","spot")].filter(a=>!!a),summary_entities:[i("sensor","runtime_mission_progress"),i("sensor","runtime_current_area"),i("sensor","runtime_total_area"),i("sensor","current_zone"),i("sensor","current_cleaned_area"),i("sensor","current_cleaning_time"),i("sensor","active_segment_count"),r(i("sensor","current_app_map_trajectory_length"),i("sensor","current_app_map_mow_path_length"),i("sensor","current_app_map_trajectory_point_count"))].filter(a=>!!a)}}_sameEntityList(e,n){return e.length===n.length&&e.every((i,r)=>i===n[r])}_toggleChanged(e){let n=e.currentTarget,i=n.dataset.key;if(!i)return;let r={...this._config||f.getStubConfig(),[i]:n.checked};r.entity||(r.entity=f.getStubConfig().entity),this._emitConfigChanged(r)}_layoutChanged(e){let n=e.currentTarget,i={...this._config||f.getStubConfig(),layout:n.value};i.entity||(i.entity=f.getStubConfig().entity),this._emitConfigChanged(i)}_addSummaryEntity(){let e=this._nextConfig();e.summary_entities=[...e.summary_entities||[],""],this._emitConfigChanged(e)}_addControlEntity(){let e=this._nextConfig();e.control_entities=[...e.control_entities||[],""],this._emitConfigChanged(e)}_removeControlEntity(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.control_entities=(i.control_entities||[]).filter((r,s)=>s!==n),i.control_entities.length||delete i.control_entities,this._emitConfigChanged(i)}_controlEntityChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let r=this._nextConfig(),s=[...r.control_entities||[]];s[i]=n.value.trim();let a=s.filter(Boolean);a.length?r.control_entities=a:delete r.control_entities,this._emitConfigChanged(r)}_removeSummaryEntity(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.summary_entities=(i.summary_entities||[]).filter((r,s)=>s!==n),i.summary_entities.length||delete i.summary_entities,this._emitConfigChanged(i)}_summaryEntityChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let r=this._nextConfig(),s=[...r.summary_entities||[]];s[i]=n.value.trim();let a=s.filter(Boolean);a.length?r.summary_entities=a:delete r.summary_entities,this._emitConfigChanged(r)}_addTile(){let e=this._nextConfig();e.tiles=[...e.tiles||[],{entity:""}],this._emitConfigChanged(e)}_removeTile(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.tiles=(i.tiles||[]).filter((r,s)=>s!==n),i.tiles.length||delete i.tiles,this._emitConfigChanged(i)}_tileChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e),r=n.dataset.key;if(i===void 0||!r)return;let s=this._nextConfig(),a=[...s.tiles||[]],l={...a[i]||{entity:""}},c=n.value.trim();c?l[r]=c:delete l[r],a[i]=l,s.tiles=a,this._emitConfigChanged(s)}_addAction(){let e=this._nextConfig();e.actions=[...e.actions||[],{type:"more-info"}],this._emitConfigChanged(e)}_removeAction(e){let n=this._indexFromEvent(e);if(n===void 0)return;let i=this._nextConfig();i.actions=(i.actions||[]).filter((r,s)=>s!==n),i.actions.length||delete i.actions,delete this._serviceDataDrafts[n],this._serviceDataDrafts=this._reindexDrafts(this._serviceDataDrafts,n),this._emitConfigChanged(i)}_actionChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e),r=n.dataset.key;if(i===void 0||!r)return;let s=this._nextConfig(),a=[...s.actions||[]],l={...a[i]||{type:"more-info"}},c=n.value.trim();c?l[r]=r==="service_data"?void 0:c:delete l[r],a[i]=l,s.actions=a,this._emitConfigChanged(s)}_actionTypeChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let r=this._nextConfig(),s=[...r.actions||[]],a={...s[i]||{}};a.type=n.value,a.type!=="service"&&(delete a.service,delete a.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts}),a.type!=="more-info"&&delete a.entity,s[i]=a,r.actions=s,this._emitConfigChanged(r)}_actionServiceDataChanged(e){let n=e.currentTarget,i=this._indexFromEvent(e);if(i===void 0)return;let r=n.value.trim();this._serviceDataDrafts={...this._serviceDataDrafts,[i]:n.value};let s=this._nextConfig(),a=[...s.actions||[]],l={...a[i]||{type:"service"}};if(!r){delete l.service_data,delete this._serviceDataDrafts[i],this._serviceDataDrafts={...this._serviceDataDrafts},a[i]=l,s.actions=a,this._emitConfigChanged(s);return}try{let c=JSON.parse(r);if(!c||typeof c!="object"||Array.isArray(c)){this.requestUpdate();return}l.service_data=c,a[i]=l,s.actions=a,this._emitConfigChanged(s)}catch{this.requestUpdate()}}_serviceDataValue(e,n){return e in this._serviceDataDrafts?this._serviceDataDrafts[e]:n.service_data?JSON.stringify(n.service_data,null,2):""}_serviceDataDraftError(e,n){let i=this._serviceDataValue(e,n).trim();if(!i)return!1;try{let r=JSON.parse(i);return!r||typeof r!="object"||Array.isArray(r)}catch{return!0}}_nextConfig(){let e={...this._config||f.getStubConfig()};return e.entity||(e.entity=f.getStubConfig().entity),e}_emitConfigChanged(e){this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_indexFromEvent(e){let i=e.currentTarget?.dataset.index;if(i===void 0)return;let r=Number(i);return Number.isInteger(r)?r:void 0}_reindexDrafts(e,n){let i={};for(let[r,s]of Object.entries(e)){let a=Number(r);Number.isNaN(a)||a===n||(i[a>n?a-1:a]=s)}return i}};$.styles=W`
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
  `,b([U({attribute:!1})],$.prototype,"hass",2),b([I()],$.prototype,"_config",2),b([I()],$.prototype,"_serviceDataDrafts",2),$=b([st("lawn-mower-card-editor")],$);window.customCards=window.customCards||[];window.customCards.push({type:"lawn-mower-card",name:"Lawn Mower Card",description:"A mower-native Home Assistant card with controls, map, and status tiles."});export{f as LawnMowerCard,$ as LawnMowerCardEditor};
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
