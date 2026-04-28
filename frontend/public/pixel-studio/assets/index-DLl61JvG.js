var vx=Object.defineProperty;var _x=(a,e,t)=>e in a?vx(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var Ie=(a,e,t)=>_x(a,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();function Yv(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}var bh={exports:{}},_a={},Ph={exports:{}},xt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Qm;function xx(){if(Qm)return xt;Qm=1;var a=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),i=Symbol.for("react.strict_mode"),s=Symbol.for("react.profiler"),o=Symbol.for("react.provider"),c=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),d=Symbol.for("react.suspense"),f=Symbol.for("react.memo"),p=Symbol.for("react.lazy"),v=Symbol.iterator;function m(G){return G===null||typeof G!="object"?null:(G=v&&G[v]||G["@@iterator"],typeof G=="function"?G:null)}var x={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},S=Object.assign,E={};function y(G,Q,be){this.props=G,this.context=Q,this.refs=E,this.updater=be||x}y.prototype.isReactComponent={},y.prototype.setState=function(G,Q){if(typeof G!="object"&&typeof G!="function"&&G!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,G,Q,"setState")},y.prototype.forceUpdate=function(G){this.updater.enqueueForceUpdate(this,G,"forceUpdate")};function _(){}_.prototype=y.prototype;function w(G,Q,be){this.props=G,this.context=Q,this.refs=E,this.updater=be||x}var A=w.prototype=new _;A.constructor=w,S(A,y.prototype),A.isPureReactComponent=!0;var T=Array.isArray,U=Object.prototype.hasOwnProperty,N={current:null},D={key:!0,ref:!0,__self:!0,__source:!0};function z(G,Q,be){var se,fe={},Me=null,_e=null;if(Q!=null)for(se in Q.ref!==void 0&&(_e=Q.ref),Q.key!==void 0&&(Me=""+Q.key),Q)U.call(Q,se)&&!D.hasOwnProperty(se)&&(fe[se]=Q[se]);var Ce=arguments.length-2;if(Ce===1)fe.children=be;else if(1<Ce){for(var ze=Array(Ce),nt=0;nt<Ce;nt++)ze[nt]=arguments[nt+2];fe.children=ze}if(G&&G.defaultProps)for(se in Ce=G.defaultProps,Ce)fe[se]===void 0&&(fe[se]=Ce[se]);return{$$typeof:a,type:G,key:Me,ref:_e,props:fe,_owner:N.current}}function b(G,Q){return{$$typeof:a,type:G.type,key:Q,ref:G.ref,props:G.props,_owner:G._owner}}function C(G){return typeof G=="object"&&G!==null&&G.$$typeof===a}function B(G){var Q={"=":"=0",":":"=2"};return"$"+G.replace(/[=:]/g,function(be){return Q[be]})}var O=/\/+/g;function k(G,Q){return typeof G=="object"&&G!==null&&G.key!=null?B(""+G.key):Q.toString(36)}function j(G,Q,be,se,fe){var Me=typeof G;(Me==="undefined"||Me==="boolean")&&(G=null);var _e=!1;if(G===null)_e=!0;else switch(Me){case"string":case"number":_e=!0;break;case"object":switch(G.$$typeof){case a:case e:_e=!0}}if(_e)return _e=G,fe=fe(_e),G=se===""?"."+k(_e,0):se,T(fe)?(be="",G!=null&&(be=G.replace(O,"$&/")+"/"),j(fe,Q,be,"",function(nt){return nt})):fe!=null&&(C(fe)&&(fe=b(fe,be+(!fe.key||_e&&_e.key===fe.key?"":(""+fe.key).replace(O,"$&/")+"/")+G)),Q.push(fe)),1;if(_e=0,se=se===""?".":se+":",T(G))for(var Ce=0;Ce<G.length;Ce++){Me=G[Ce];var ze=se+k(Me,Ce);_e+=j(Me,Q,be,ze,fe)}else if(ze=m(G),typeof ze=="function")for(G=ze.call(G),Ce=0;!(Me=G.next()).done;)Me=Me.value,ze=se+k(Me,Ce++),_e+=j(Me,Q,be,ze,fe);else if(Me==="object")throw Q=String(G),Error("Objects are not valid as a React child (found: "+(Q==="[object Object]"?"object with keys {"+Object.keys(G).join(", ")+"}":Q)+"). If you meant to render a collection of children, use an array instead.");return _e}function X(G,Q,be){if(G==null)return G;var se=[],fe=0;return j(G,se,"","",function(Me){return Q.call(be,Me,fe++)}),se}function W(G){if(G._status===-1){var Q=G._result;Q=Q(),Q.then(function(be){(G._status===0||G._status===-1)&&(G._status=1,G._result=be)},function(be){(G._status===0||G._status===-1)&&(G._status=2,G._result=be)}),G._status===-1&&(G._status=0,G._result=Q)}if(G._status===1)return G._result.default;throw G._result}var ie={current:null},H={transition:null},q={ReactCurrentDispatcher:ie,ReactCurrentBatchConfig:H,ReactCurrentOwner:N};function oe(){throw Error("act(...) is not supported in production builds of React.")}return xt.Children={map:X,forEach:function(G,Q,be){X(G,function(){Q.apply(this,arguments)},be)},count:function(G){var Q=0;return X(G,function(){Q++}),Q},toArray:function(G){return X(G,function(Q){return Q})||[]},only:function(G){if(!C(G))throw Error("React.Children.only expected to receive a single React element child.");return G}},xt.Component=y,xt.Fragment=t,xt.Profiler=s,xt.PureComponent=w,xt.StrictMode=i,xt.Suspense=d,xt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=q,xt.act=oe,xt.cloneElement=function(G,Q,be){if(G==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+G+".");var se=S({},G.props),fe=G.key,Me=G.ref,_e=G._owner;if(Q!=null){if(Q.ref!==void 0&&(Me=Q.ref,_e=N.current),Q.key!==void 0&&(fe=""+Q.key),G.type&&G.type.defaultProps)var Ce=G.type.defaultProps;for(ze in Q)U.call(Q,ze)&&!D.hasOwnProperty(ze)&&(se[ze]=Q[ze]===void 0&&Ce!==void 0?Ce[ze]:Q[ze])}var ze=arguments.length-2;if(ze===1)se.children=be;else if(1<ze){Ce=Array(ze);for(var nt=0;nt<ze;nt++)Ce[nt]=arguments[nt+2];se.children=Ce}return{$$typeof:a,type:G.type,key:fe,ref:Me,props:se,_owner:_e}},xt.createContext=function(G){return G={$$typeof:c,_currentValue:G,_currentValue2:G,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},G.Provider={$$typeof:o,_context:G},G.Consumer=G},xt.createElement=z,xt.createFactory=function(G){var Q=z.bind(null,G);return Q.type=G,Q},xt.createRef=function(){return{current:null}},xt.forwardRef=function(G){return{$$typeof:u,render:G}},xt.isValidElement=C,xt.lazy=function(G){return{$$typeof:p,_payload:{_status:-1,_result:G},_init:W}},xt.memo=function(G,Q){return{$$typeof:f,type:G,compare:Q===void 0?null:Q}},xt.startTransition=function(G){var Q=H.transition;H.transition={};try{G()}finally{H.transition=Q}},xt.unstable_act=oe,xt.useCallback=function(G,Q){return ie.current.useCallback(G,Q)},xt.useContext=function(G){return ie.current.useContext(G)},xt.useDebugValue=function(){},xt.useDeferredValue=function(G){return ie.current.useDeferredValue(G)},xt.useEffect=function(G,Q){return ie.current.useEffect(G,Q)},xt.useId=function(){return ie.current.useId()},xt.useImperativeHandle=function(G,Q,be){return ie.current.useImperativeHandle(G,Q,be)},xt.useInsertionEffect=function(G,Q){return ie.current.useInsertionEffect(G,Q)},xt.useLayoutEffect=function(G,Q){return ie.current.useLayoutEffect(G,Q)},xt.useMemo=function(G,Q){return ie.current.useMemo(G,Q)},xt.useReducer=function(G,Q,be){return ie.current.useReducer(G,Q,be)},xt.useRef=function(G){return ie.current.useRef(G)},xt.useState=function(G){return ie.current.useState(G)},xt.useSyncExternalStore=function(G,Q,be){return ie.current.useSyncExternalStore(G,Q,be)},xt.useTransition=function(){return ie.current.useTransition()},xt.version="18.3.1",xt}var Jm;function uf(){return Jm||(Jm=1,Ph.exports=xx()),Ph.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var eg;function yx(){if(eg)return _a;eg=1;var a=uf(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,s=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function c(u,d,f){var p,v={},m=null,x=null;f!==void 0&&(m=""+f),d.key!==void 0&&(m=""+d.key),d.ref!==void 0&&(x=d.ref);for(p in d)i.call(d,p)&&!o.hasOwnProperty(p)&&(v[p]=d[p]);if(u&&u.defaultProps)for(p in d=u.defaultProps,d)v[p]===void 0&&(v[p]=d[p]);return{$$typeof:e,type:u,key:m,ref:x,props:v,_owner:s.current}}return _a.Fragment=t,_a.jsx=c,_a.jsxs=c,_a}var tg;function Sx(){return tg||(tg=1,bh.exports=yx()),bh.exports}var Y=Sx(),gt=uf();const La=Yv(gt);var Yl={},Lh={exports:{}},qn={},Ih={exports:{}},Nh={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ng;function Mx(){return ng||(ng=1,(function(a){function e(H,q){var oe=H.length;H.push(q);e:for(;0<oe;){var G=oe-1>>>1,Q=H[G];if(0<s(Q,q))H[G]=q,H[oe]=Q,oe=G;else break e}}function t(H){return H.length===0?null:H[0]}function i(H){if(H.length===0)return null;var q=H[0],oe=H.pop();if(oe!==q){H[0]=oe;e:for(var G=0,Q=H.length,be=Q>>>1;G<be;){var se=2*(G+1)-1,fe=H[se],Me=se+1,_e=H[Me];if(0>s(fe,oe))Me<Q&&0>s(_e,fe)?(H[G]=_e,H[Me]=oe,G=Me):(H[G]=fe,H[se]=oe,G=se);else if(Me<Q&&0>s(_e,oe))H[G]=_e,H[Me]=oe,G=Me;else break e}}return q}function s(H,q){var oe=H.sortIndex-q.sortIndex;return oe!==0?oe:H.id-q.id}if(typeof performance=="object"&&typeof performance.now=="function"){var o=performance;a.unstable_now=function(){return o.now()}}else{var c=Date,u=c.now();a.unstable_now=function(){return c.now()-u}}var d=[],f=[],p=1,v=null,m=3,x=!1,S=!1,E=!1,y=typeof setTimeout=="function"?setTimeout:null,_=typeof clearTimeout=="function"?clearTimeout:null,w=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function A(H){for(var q=t(f);q!==null;){if(q.callback===null)i(f);else if(q.startTime<=H)i(f),q.sortIndex=q.expirationTime,e(d,q);else break;q=t(f)}}function T(H){if(E=!1,A(H),!S)if(t(d)!==null)S=!0,W(U);else{var q=t(f);q!==null&&ie(T,q.startTime-H)}}function U(H,q){S=!1,E&&(E=!1,_(z),z=-1),x=!0;var oe=m;try{for(A(q),v=t(d);v!==null&&(!(v.expirationTime>q)||H&&!B());){var G=v.callback;if(typeof G=="function"){v.callback=null,m=v.priorityLevel;var Q=G(v.expirationTime<=q);q=a.unstable_now(),typeof Q=="function"?v.callback=Q:v===t(d)&&i(d),A(q)}else i(d);v=t(d)}if(v!==null)var be=!0;else{var se=t(f);se!==null&&ie(T,se.startTime-q),be=!1}return be}finally{v=null,m=oe,x=!1}}var N=!1,D=null,z=-1,b=5,C=-1;function B(){return!(a.unstable_now()-C<b)}function O(){if(D!==null){var H=a.unstable_now();C=H;var q=!0;try{q=D(!0,H)}finally{q?k():(N=!1,D=null)}}else N=!1}var k;if(typeof w=="function")k=function(){w(O)};else if(typeof MessageChannel<"u"){var j=new MessageChannel,X=j.port2;j.port1.onmessage=O,k=function(){X.postMessage(null)}}else k=function(){y(O,0)};function W(H){D=H,N||(N=!0,k())}function ie(H,q){z=y(function(){H(a.unstable_now())},q)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(H){H.callback=null},a.unstable_continueExecution=function(){S||x||(S=!0,W(U))},a.unstable_forceFrameRate=function(H){0>H||125<H?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):b=0<H?Math.floor(1e3/H):5},a.unstable_getCurrentPriorityLevel=function(){return m},a.unstable_getFirstCallbackNode=function(){return t(d)},a.unstable_next=function(H){switch(m){case 1:case 2:case 3:var q=3;break;default:q=m}var oe=m;m=q;try{return H()}finally{m=oe}},a.unstable_pauseExecution=function(){},a.unstable_requestPaint=function(){},a.unstable_runWithPriority=function(H,q){switch(H){case 1:case 2:case 3:case 4:case 5:break;default:H=3}var oe=m;m=H;try{return q()}finally{m=oe}},a.unstable_scheduleCallback=function(H,q,oe){var G=a.unstable_now();switch(typeof oe=="object"&&oe!==null?(oe=oe.delay,oe=typeof oe=="number"&&0<oe?G+oe:G):oe=G,H){case 1:var Q=-1;break;case 2:Q=250;break;case 5:Q=1073741823;break;case 4:Q=1e4;break;default:Q=5e3}return Q=oe+Q,H={id:p++,callback:q,priorityLevel:H,startTime:oe,expirationTime:Q,sortIndex:-1},oe>G?(H.sortIndex=oe,e(f,H),t(d)===null&&H===t(f)&&(E?(_(z),z=-1):E=!0,ie(T,oe-G))):(H.sortIndex=Q,e(d,H),S||x||(S=!0,W(U))),H},a.unstable_shouldYield=B,a.unstable_wrapCallback=function(H){var q=m;return function(){var oe=m;m=q;try{return H.apply(this,arguments)}finally{m=oe}}}})(Nh)),Nh}var ig;function Ex(){return ig||(ig=1,Ih.exports=Mx()),Ih.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var rg;function wx(){if(rg)return qn;rg=1;var a=uf(),e=Ex();function t(n){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+n,l=1;l<arguments.length;l++)r+="&args[]="+encodeURIComponent(arguments[l]);return"Minified React error #"+n+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var i=new Set,s={};function o(n,r){c(n,r),c(n+"Capture",r)}function c(n,r){for(s[n]=r,n=0;n<r.length;n++)i.add(r[n])}var u=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),d=Object.prototype.hasOwnProperty,f=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,p={},v={};function m(n){return d.call(v,n)?!0:d.call(p,n)?!1:f.test(n)?v[n]=!0:(p[n]=!0,!1)}function x(n,r,l,h){if(l!==null&&l.type===0)return!1;switch(typeof r){case"function":case"symbol":return!0;case"boolean":return h?!1:l!==null?!l.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function S(n,r,l,h){if(r===null||typeof r>"u"||x(n,r,l,h))return!0;if(h)return!1;if(l!==null)switch(l.type){case 3:return!r;case 4:return r===!1;case 5:return isNaN(r);case 6:return isNaN(r)||1>r}return!1}function E(n,r,l,h,g,M,R){this.acceptsBooleans=r===2||r===3||r===4,this.attributeName=h,this.attributeNamespace=g,this.mustUseProperty=l,this.propertyName=n,this.type=r,this.sanitizeURL=M,this.removeEmptyString=R}var y={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){y[n]=new E(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var r=n[0];y[r]=new E(r,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){y[n]=new E(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){y[n]=new E(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){y[n]=new E(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){y[n]=new E(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){y[n]=new E(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){y[n]=new E(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){y[n]=new E(n,5,!1,n.toLowerCase(),null,!1,!1)});var _=/[\-:]([a-z])/g;function w(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var r=n.replace(_,w);y[r]=new E(r,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var r=n.replace(_,w);y[r]=new E(r,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var r=n.replace(_,w);y[r]=new E(r,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){y[n]=new E(n,1,!1,n.toLowerCase(),null,!1,!1)}),y.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){y[n]=new E(n,1,!1,n.toLowerCase(),null,!0,!0)});function A(n,r,l,h){var g=y.hasOwnProperty(r)?y[r]:null;(g!==null?g.type!==0:h||!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(S(r,l,g,h)&&(l=null),h||g===null?m(r)&&(l===null?n.removeAttribute(r):n.setAttribute(r,""+l)):g.mustUseProperty?n[g.propertyName]=l===null?g.type===3?!1:"":l:(r=g.attributeName,h=g.attributeNamespace,l===null?n.removeAttribute(r):(g=g.type,l=g===3||g===4&&l===!0?"":""+l,h?n.setAttributeNS(h,r,l):n.setAttribute(r,l))))}var T=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,U=Symbol.for("react.element"),N=Symbol.for("react.portal"),D=Symbol.for("react.fragment"),z=Symbol.for("react.strict_mode"),b=Symbol.for("react.profiler"),C=Symbol.for("react.provider"),B=Symbol.for("react.context"),O=Symbol.for("react.forward_ref"),k=Symbol.for("react.suspense"),j=Symbol.for("react.suspense_list"),X=Symbol.for("react.memo"),W=Symbol.for("react.lazy"),ie=Symbol.for("react.offscreen"),H=Symbol.iterator;function q(n){return n===null||typeof n!="object"?null:(n=H&&n[H]||n["@@iterator"],typeof n=="function"?n:null)}var oe=Object.assign,G;function Q(n){if(G===void 0)try{throw Error()}catch(l){var r=l.stack.trim().match(/\n( *(at )?)/);G=r&&r[1]||""}return`
`+G+n}var be=!1;function se(n,r){if(!n||be)return"";be=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(r)if(r=function(){throw Error()},Object.defineProperty(r.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(r,[])}catch(ce){var h=ce}Reflect.construct(n,[],r)}else{try{r.call()}catch(ce){h=ce}n.call(r.prototype)}else{try{throw Error()}catch(ce){h=ce}n()}}catch(ce){if(ce&&h&&typeof ce.stack=="string"){for(var g=ce.stack.split(`
`),M=h.stack.split(`
`),R=g.length-1,V=M.length-1;1<=R&&0<=V&&g[R]!==M[V];)V--;for(;1<=R&&0<=V;R--,V--)if(g[R]!==M[V]){if(R!==1||V!==1)do if(R--,V--,0>V||g[R]!==M[V]){var Z=`
`+g[R].replace(" at new "," at ");return n.displayName&&Z.includes("<anonymous>")&&(Z=Z.replace("<anonymous>",n.displayName)),Z}while(1<=R&&0<=V);break}}}finally{be=!1,Error.prepareStackTrace=l}return(n=n?n.displayName||n.name:"")?Q(n):""}function fe(n){switch(n.tag){case 5:return Q(n.type);case 16:return Q("Lazy");case 13:return Q("Suspense");case 19:return Q("SuspenseList");case 0:case 2:case 15:return n=se(n.type,!1),n;case 11:return n=se(n.type.render,!1),n;case 1:return n=se(n.type,!0),n;default:return""}}function Me(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case D:return"Fragment";case N:return"Portal";case b:return"Profiler";case z:return"StrictMode";case k:return"Suspense";case j:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case B:return(n.displayName||"Context")+".Consumer";case C:return(n._context.displayName||"Context")+".Provider";case O:var r=n.render;return n=n.displayName,n||(n=r.displayName||r.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case X:return r=n.displayName||null,r!==null?r:Me(n.type)||"Memo";case W:r=n._payload,n=n._init;try{return Me(n(r))}catch{}}return null}function _e(n){var r=n.type;switch(n.tag){case 24:return"Cache";case 9:return(r.displayName||"Context")+".Consumer";case 10:return(r._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=r.render,n=n.displayName||n.name||"",r.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return r;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Me(r);case 8:return r===z?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof r=="function")return r.displayName||r.name||null;if(typeof r=="string")return r}return null}function Ce(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function ze(n){var r=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(r==="checkbox"||r==="radio")}function nt(n){var r=ze(n)?"checked":"value",l=Object.getOwnPropertyDescriptor(n.constructor.prototype,r),h=""+n[r];if(!n.hasOwnProperty(r)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var g=l.get,M=l.set;return Object.defineProperty(n,r,{configurable:!0,get:function(){return g.call(this)},set:function(R){h=""+R,M.call(this,R)}}),Object.defineProperty(n,r,{enumerable:l.enumerable}),{getValue:function(){return h},setValue:function(R){h=""+R},stopTracking:function(){n._valueTracker=null,delete n[r]}}}}function Dt(n){n._valueTracker||(n._valueTracker=nt(n))}function St(n){if(!n)return!1;var r=n._valueTracker;if(!r)return!0;var l=r.getValue(),h="";return n&&(h=ze(n)?n.checked?"true":"false":n.value),n=h,n!==l?(r.setValue(n),!0):!1}function Bt(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function ne(n,r){var l=r.checked;return oe({},r,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:l??n._wrapperState.initialChecked})}function Nn(n,r){var l=r.defaultValue==null?"":r.defaultValue,h=r.checked!=null?r.checked:r.defaultChecked;l=Ce(r.value!=null?r.value:l),n._wrapperState={initialChecked:h,initialValue:l,controlled:r.type==="checkbox"||r.type==="radio"?r.checked!=null:r.value!=null}}function yt(n,r){r=r.checked,r!=null&&A(n,"checked",r,!1)}function vt(n,r){yt(n,r);var l=Ce(r.value),h=r.type;if(l!=null)h==="number"?(l===0&&n.value===""||n.value!=l)&&(n.value=""+l):n.value!==""+l&&(n.value=""+l);else if(h==="submit"||h==="reset"){n.removeAttribute("value");return}r.hasOwnProperty("value")?It(n,r.type,l):r.hasOwnProperty("defaultValue")&&It(n,r.type,Ce(r.defaultValue)),r.checked==null&&r.defaultChecked!=null&&(n.defaultChecked=!!r.defaultChecked)}function Je(n,r,l){if(r.hasOwnProperty("value")||r.hasOwnProperty("defaultValue")){var h=r.type;if(!(h!=="submit"&&h!=="reset"||r.value!==void 0&&r.value!==null))return;r=""+n._wrapperState.initialValue,l||r===n.value||(n.value=r),n.defaultValue=r}l=n.name,l!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,l!==""&&(n.name=l)}function It(n,r,l){(r!=="number"||Bt(n.ownerDocument)!==n)&&(l==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+l&&(n.defaultValue=""+l))}var Qe=Array.isArray;function F(n,r,l,h){if(n=n.options,r){r={};for(var g=0;g<l.length;g++)r["$"+l[g]]=!0;for(l=0;l<n.length;l++)g=r.hasOwnProperty("$"+n[l].value),n[l].selected!==g&&(n[l].selected=g),g&&h&&(n[l].defaultSelected=!0)}else{for(l=""+Ce(l),r=null,g=0;g<n.length;g++){if(n[g].value===l){n[g].selected=!0,h&&(n[g].defaultSelected=!0);return}r!==null||n[g].disabled||(r=n[g])}r!==null&&(r.selected=!0)}}function L(n,r){if(r.dangerouslySetInnerHTML!=null)throw Error(t(91));return oe({},r,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function le(n,r){var l=r.value;if(l==null){if(l=r.children,r=r.defaultValue,l!=null){if(r!=null)throw Error(t(92));if(Qe(l)){if(1<l.length)throw Error(t(93));l=l[0]}r=l}r==null&&(r=""),l=r}n._wrapperState={initialValue:Ce(l)}}function ge(n,r){var l=Ce(r.value),h=Ce(r.defaultValue);l!=null&&(l=""+l,l!==n.value&&(n.value=l),r.defaultValue==null&&n.defaultValue!==l&&(n.defaultValue=l)),h!=null&&(n.defaultValue=""+h)}function xe(n){var r=n.textContent;r===n._wrapperState.initialValue&&r!==""&&r!==null&&(n.value=r)}function pe(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function qe(n,r){return n==null||n==="http://www.w3.org/1999/xhtml"?pe(r):n==="http://www.w3.org/2000/svg"&&r==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Pe,Oe=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(r,l,h,g){MSApp.execUnsafeLocalFunction(function(){return n(r,l,h,g)})}:n})(function(n,r){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=r;else{for(Pe=Pe||document.createElement("div"),Pe.innerHTML="<svg>"+r.valueOf().toString()+"</svg>",r=Pe.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;r.firstChild;)n.appendChild(r.firstChild)}});function mt(n,r){if(r){var l=n.firstChild;if(l&&l===n.lastChild&&l.nodeType===3){l.nodeValue=r;return}}n.textContent=r}var Ee={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ke=["Webkit","ms","Moz","O"];Object.keys(Ee).forEach(function(n){ke.forEach(function(r){r=r+n.charAt(0).toUpperCase()+n.substring(1),Ee[r]=Ee[n]})});function it(n,r,l){return r==null||typeof r=="boolean"||r===""?"":l||typeof r!="number"||r===0||Ee.hasOwnProperty(n)&&Ee[n]?(""+r).trim():r+"px"}function rt(n,r){n=n.style;for(var l in r)if(r.hasOwnProperty(l)){var h=l.indexOf("--")===0,g=it(l,r[l],h);l==="float"&&(l="cssFloat"),h?n.setProperty(l,g):n[l]=g}}var He=oe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function _t(n,r){if(r){if(He[n]&&(r.children!=null||r.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(r.dangerouslySetInnerHTML!=null){if(r.children!=null)throw Error(t(60));if(typeof r.dangerouslySetInnerHTML!="object"||!("__html"in r.dangerouslySetInnerHTML))throw Error(t(61))}if(r.style!=null&&typeof r.style!="object")throw Error(t(62))}}function ct(n,r){if(n.indexOf("-")===-1)return typeof r.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Lt=null;function J(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Le=null,de=null,me=null;function De(n){if(n=ia(n)){if(typeof Le!="function")throw Error(t(280));var r=n.stateNode;r&&(r=cl(r),Le(n.stateNode,n.type,r))}}function Ne(n){de?me?me.push(n):me=[n]:de=n}function ut(){if(de){var n=de,r=me;if(me=de=null,De(n),r)for(n=0;n<r.length;n++)De(r[n])}}function Vt(n,r){return n(r)}function an(){}var Tt=!1;function kn(n,r,l){if(Tt)return n(r,l);Tt=!0;try{return Vt(n,r,l)}finally{Tt=!1,(de!==null||me!==null)&&(an(),ut())}}function Dn(n,r){var l=n.stateNode;if(l===null)return null;var h=cl(l);if(h===null)return null;l=h[r];e:switch(r){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(h=!h.disabled)||(n=n.type,h=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!h;break e;default:n=!1}if(n)return null;if(l&&typeof l!="function")throw Error(t(231,r,typeof l));return l}var Fs=!1;if(u)try{var yr={};Object.defineProperty(yr,"passive",{get:function(){Fs=!0}}),window.addEventListener("test",yr,yr),window.removeEventListener("test",yr,yr)}catch{Fs=!1}function qi(n,r,l,h,g,M,R,V,Z){var ce=Array.prototype.slice.call(arguments,3);try{r.apply(l,ce)}catch(ye){this.onError(ye)}}var Yi=!1,Jr=null,es=!1,Sr=null,Ga={onError:function(n){Yi=!0,Jr=n}};function zs(n,r,l,h,g,M,R,V,Z){Yi=!1,Jr=null,qi.apply(Ga,arguments)}function Wa(n,r,l,h,g,M,R,V,Z){if(zs.apply(this,arguments),Yi){if(Yi){var ce=Jr;Yi=!1,Jr=null}else throw Error(t(198));es||(es=!0,Sr=ce)}}function Di(n){var r=n,l=n;if(n.alternate)for(;r.return;)r=r.return;else{n=r;do r=n,(r.flags&4098)!==0&&(l=r.return),n=r.return;while(n)}return r.tag===3?l:null}function ja(n){if(n.tag===13){var r=n.memoizedState;if(r===null&&(n=n.alternate,n!==null&&(r=n.memoizedState)),r!==null)return r.dehydrated}return null}function Xa(n){if(Di(n)!==n)throw Error(t(188))}function Kc(n){var r=n.alternate;if(!r){if(r=Di(n),r===null)throw Error(t(188));return r!==n?null:n}for(var l=n,h=r;;){var g=l.return;if(g===null)break;var M=g.alternate;if(M===null){if(h=g.return,h!==null){l=h;continue}break}if(g.child===M.child){for(M=g.child;M;){if(M===l)return Xa(g),n;if(M===h)return Xa(g),r;M=M.sibling}throw Error(t(188))}if(l.return!==h.return)l=g,h=M;else{for(var R=!1,V=g.child;V;){if(V===l){R=!0,l=g,h=M;break}if(V===h){R=!0,h=g,l=M;break}V=V.sibling}if(!R){for(V=M.child;V;){if(V===l){R=!0,l=M,h=g;break}if(V===h){R=!0,h=M,l=g;break}V=V.sibling}if(!R)throw Error(t(189))}}if(l.alternate!==h)throw Error(t(190))}if(l.tag!==3)throw Error(t(188));return l.stateNode.current===l?n:r}function I(n){return n=Kc(n),n!==null?ee(n):null}function ee(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var r=ee(n);if(r!==null)return r;n=n.sibling}return null}var ue=e.unstable_scheduleCallback,he=e.unstable_cancelCallback,te=e.unstable_shouldYield,Ae=e.unstable_requestPaint,we=e.unstable_now,Ye=e.unstable_getCurrentPriorityLevel,We=e.unstable_ImmediatePriority,st=e.unstable_UserBlockingPriority,lt=e.unstable_NormalPriority,Ze=e.unstable_LowPriority,wt=e.unstable_IdlePriority,Pt=null,Mt=null;function Mn(n){if(Mt&&typeof Mt.onCommitFiberRoot=="function")try{Mt.onCommitFiberRoot(Pt,n,void 0,(n.current.flags&128)===128)}catch{}}var ht=Math.clz32?Math.clz32:Rt,Ke=Math.log,vi=Math.LN2;function Rt(n){return n>>>=0,n===0?32:31-(Ke(n)/vi|0)|0}var En=64,_i=4194304;function ln(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ui(n,r){var l=n.pendingLanes;if(l===0)return 0;var h=0,g=n.suspendedLanes,M=n.pingedLanes,R=l&268435455;if(R!==0){var V=R&~g;V!==0?h=ln(V):(M&=R,M!==0&&(h=ln(M)))}else R=l&~g,R!==0?h=ln(R):M!==0&&(h=ln(M));if(h===0)return 0;if(r!==0&&r!==h&&(r&g)===0&&(g=h&-h,M=r&-r,g>=M||g===16&&(M&4194240)!==0))return r;if((h&4)!==0&&(h|=l&16),r=n.entangledLanes,r!==0)for(n=n.entanglements,r&=h;0<r;)l=31-ht(r),g=1<<l,h|=n[l],r&=~g;return h}function zt(n,r){switch(n){case 1:case 2:case 4:return r+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return r+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ai(n,r){for(var l=n.suspendedLanes,h=n.pingedLanes,g=n.expirationTimes,M=n.pendingLanes;0<M;){var R=31-ht(M),V=1<<R,Z=g[R];Z===-1?((V&l)===0||(V&h)!==0)&&(g[R]=zt(V,r)):Z<=r&&(n.expiredLanes|=V),M&=~V}}function Zi(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function Un(){var n=En;return En<<=1,(En&4194240)===0&&(En=64),n}function li(n){for(var r=[],l=0;31>l;l++)r.push(n);return r}function Hn(n,r,l){n.pendingLanes|=r,r!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,r=31-ht(r),n[r]=l}function qa(n,r){var l=n.pendingLanes&~r;n.pendingLanes=r,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=r,n.mutableReadLanes&=r,n.entangledLanes&=r,r=n.entanglements;var h=n.eventTimes;for(n=n.expirationTimes;0<l;){var g=31-ht(l),M=1<<g;r[g]=0,h[g]=-1,n[g]=-1,l&=~M}}function Qc(n,r){var l=n.entangledLanes|=r;for(n=n.entanglements;l;){var h=31-ht(l),g=1<<h;g&r|n[h]&r&&(n[h]|=r),l&=~g}}var Nt=0;function Pf(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Lf,Jc,If,Nf,Df,eu=!1,Ya=[],Mr=null,Er=null,wr=null,Ho=new Map,Vo=new Map,Tr=[],B0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Uf(n,r){switch(n){case"focusin":case"focusout":Mr=null;break;case"dragenter":case"dragleave":Er=null;break;case"mouseover":case"mouseout":wr=null;break;case"pointerover":case"pointerout":Ho.delete(r.pointerId);break;case"gotpointercapture":case"lostpointercapture":Vo.delete(r.pointerId)}}function Go(n,r,l,h,g,M){return n===null||n.nativeEvent!==M?(n={blockedOn:r,domEventName:l,eventSystemFlags:h,nativeEvent:M,targetContainers:[g]},r!==null&&(r=ia(r),r!==null&&Jc(r)),n):(n.eventSystemFlags|=h,r=n.targetContainers,g!==null&&r.indexOf(g)===-1&&r.push(g),n)}function k0(n,r,l,h,g){switch(r){case"focusin":return Mr=Go(Mr,n,r,l,h,g),!0;case"dragenter":return Er=Go(Er,n,r,l,h,g),!0;case"mouseover":return wr=Go(wr,n,r,l,h,g),!0;case"pointerover":var M=g.pointerId;return Ho.set(M,Go(Ho.get(M)||null,n,r,l,h,g)),!0;case"gotpointercapture":return M=g.pointerId,Vo.set(M,Go(Vo.get(M)||null,n,r,l,h,g)),!0}return!1}function Ff(n){var r=ts(n.target);if(r!==null){var l=Di(r);if(l!==null){if(r=l.tag,r===13){if(r=ja(l),r!==null){n.blockedOn=r,Df(n.priority,function(){If(l)});return}}else if(r===3&&l.stateNode.current.memoizedState.isDehydrated){n.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Za(n){if(n.blockedOn!==null)return!1;for(var r=n.targetContainers;0<r.length;){var l=nu(n.domEventName,n.eventSystemFlags,r[0],n.nativeEvent);if(l===null){l=n.nativeEvent;var h=new l.constructor(l.type,l);Lt=h,l.target.dispatchEvent(h),Lt=null}else return r=ia(l),r!==null&&Jc(r),n.blockedOn=l,!1;r.shift()}return!0}function zf(n,r,l){Za(n)&&l.delete(r)}function H0(){eu=!1,Mr!==null&&Za(Mr)&&(Mr=null),Er!==null&&Za(Er)&&(Er=null),wr!==null&&Za(wr)&&(wr=null),Ho.forEach(zf),Vo.forEach(zf)}function Wo(n,r){n.blockedOn===r&&(n.blockedOn=null,eu||(eu=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,H0)))}function jo(n){function r(g){return Wo(g,n)}if(0<Ya.length){Wo(Ya[0],n);for(var l=1;l<Ya.length;l++){var h=Ya[l];h.blockedOn===n&&(h.blockedOn=null)}}for(Mr!==null&&Wo(Mr,n),Er!==null&&Wo(Er,n),wr!==null&&Wo(wr,n),Ho.forEach(r),Vo.forEach(r),l=0;l<Tr.length;l++)h=Tr[l],h.blockedOn===n&&(h.blockedOn=null);for(;0<Tr.length&&(l=Tr[0],l.blockedOn===null);)Ff(l),l.blockedOn===null&&Tr.shift()}var Os=T.ReactCurrentBatchConfig,$a=!0;function V0(n,r,l,h){var g=Nt,M=Os.transition;Os.transition=null;try{Nt=1,tu(n,r,l,h)}finally{Nt=g,Os.transition=M}}function G0(n,r,l,h){var g=Nt,M=Os.transition;Os.transition=null;try{Nt=4,tu(n,r,l,h)}finally{Nt=g,Os.transition=M}}function tu(n,r,l,h){if($a){var g=nu(n,r,l,h);if(g===null)xu(n,r,h,Ka,l),Uf(n,h);else if(k0(g,n,r,l,h))h.stopPropagation();else if(Uf(n,h),r&4&&-1<B0.indexOf(n)){for(;g!==null;){var M=ia(g);if(M!==null&&Lf(M),M=nu(n,r,l,h),M===null&&xu(n,r,h,Ka,l),M===g)break;g=M}g!==null&&h.stopPropagation()}else xu(n,r,h,null,l)}}var Ka=null;function nu(n,r,l,h){if(Ka=null,n=J(h),n=ts(n),n!==null)if(r=Di(n),r===null)n=null;else if(l=r.tag,l===13){if(n=ja(r),n!==null)return n;n=null}else if(l===3){if(r.stateNode.current.memoizedState.isDehydrated)return r.tag===3?r.stateNode.containerInfo:null;n=null}else r!==n&&(n=null);return Ka=n,null}function Of(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ye()){case We:return 1;case st:return 4;case lt:case Ze:return 16;case wt:return 536870912;default:return 16}default:return 16}}var Ar=null,iu=null,Qa=null;function Bf(){if(Qa)return Qa;var n,r=iu,l=r.length,h,g="value"in Ar?Ar.value:Ar.textContent,M=g.length;for(n=0;n<l&&r[n]===g[n];n++);var R=l-n;for(h=1;h<=R&&r[l-h]===g[M-h];h++);return Qa=g.slice(n,1<h?1-h:void 0)}function Ja(n){var r=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&r===13&&(n=13)):n=r,n===10&&(n=13),32<=n||n===13?n:0}function el(){return!0}function kf(){return!1}function Jn(n){function r(l,h,g,M,R){this._reactName=l,this._targetInst=g,this.type=h,this.nativeEvent=M,this.target=R,this.currentTarget=null;for(var V in n)n.hasOwnProperty(V)&&(l=n[V],this[V]=l?l(M):M[V]);return this.isDefaultPrevented=(M.defaultPrevented!=null?M.defaultPrevented:M.returnValue===!1)?el:kf,this.isPropagationStopped=kf,this}return oe(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=el)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=el)},persist:function(){},isPersistent:el}),r}var Bs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ru=Jn(Bs),Xo=oe({},Bs,{view:0,detail:0}),W0=Jn(Xo),su,ou,qo,tl=oe({},Xo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:lu,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==qo&&(qo&&n.type==="mousemove"?(su=n.screenX-qo.screenX,ou=n.screenY-qo.screenY):ou=su=0,qo=n),su)},movementY:function(n){return"movementY"in n?n.movementY:ou}}),Hf=Jn(tl),j0=oe({},tl,{dataTransfer:0}),X0=Jn(j0),q0=oe({},Xo,{relatedTarget:0}),au=Jn(q0),Y0=oe({},Bs,{animationName:0,elapsedTime:0,pseudoElement:0}),Z0=Jn(Y0),$0=oe({},Bs,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),K0=Jn($0),Q0=oe({},Bs,{data:0}),Vf=Jn(Q0),J0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},e_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},t_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function n_(n){var r=this.nativeEvent;return r.getModifierState?r.getModifierState(n):(n=t_[n])?!!r[n]:!1}function lu(){return n_}var i_=oe({},Xo,{key:function(n){if(n.key){var r=J0[n.key]||n.key;if(r!=="Unidentified")return r}return n.type==="keypress"?(n=Ja(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?e_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:lu,charCode:function(n){return n.type==="keypress"?Ja(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ja(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),r_=Jn(i_),s_=oe({},tl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Gf=Jn(s_),o_=oe({},Xo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:lu}),a_=Jn(o_),l_=oe({},Bs,{propertyName:0,elapsedTime:0,pseudoElement:0}),c_=Jn(l_),u_=oe({},tl,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),h_=Jn(u_),d_=[9,13,27,32],cu=u&&"CompositionEvent"in window,Yo=null;u&&"documentMode"in document&&(Yo=document.documentMode);var f_=u&&"TextEvent"in window&&!Yo,Wf=u&&(!cu||Yo&&8<Yo&&11>=Yo),jf=" ",Xf=!1;function qf(n,r){switch(n){case"keyup":return d_.indexOf(r.keyCode)!==-1;case"keydown":return r.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Yf(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var ks=!1;function p_(n,r){switch(n){case"compositionend":return Yf(r);case"keypress":return r.which!==32?null:(Xf=!0,jf);case"textInput":return n=r.data,n===jf&&Xf?null:n;default:return null}}function m_(n,r){if(ks)return n==="compositionend"||!cu&&qf(n,r)?(n=Bf(),Qa=iu=Ar=null,ks=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(r.ctrlKey||r.altKey||r.metaKey)||r.ctrlKey&&r.altKey){if(r.char&&1<r.char.length)return r.char;if(r.which)return String.fromCharCode(r.which)}return null;case"compositionend":return Wf&&r.locale!=="ko"?null:r.data;default:return null}}var g_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Zf(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r==="input"?!!g_[n.type]:r==="textarea"}function $f(n,r,l,h){Ne(h),r=ol(r,"onChange"),0<r.length&&(l=new ru("onChange","change",null,l,h),n.push({event:l,listeners:r}))}var Zo=null,$o=null;function v_(n){pp(n,0)}function nl(n){var r=js(n);if(St(r))return n}function __(n,r){if(n==="change")return r}var Kf=!1;if(u){var uu;if(u){var hu="oninput"in document;if(!hu){var Qf=document.createElement("div");Qf.setAttribute("oninput","return;"),hu=typeof Qf.oninput=="function"}uu=hu}else uu=!1;Kf=uu&&(!document.documentMode||9<document.documentMode)}function Jf(){Zo&&(Zo.detachEvent("onpropertychange",ep),$o=Zo=null)}function ep(n){if(n.propertyName==="value"&&nl($o)){var r=[];$f(r,$o,n,J(n)),kn(v_,r)}}function x_(n,r,l){n==="focusin"?(Jf(),Zo=r,$o=l,Zo.attachEvent("onpropertychange",ep)):n==="focusout"&&Jf()}function y_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return nl($o)}function S_(n,r){if(n==="click")return nl(r)}function M_(n,r){if(n==="input"||n==="change")return nl(r)}function E_(n,r){return n===r&&(n!==0||1/n===1/r)||n!==n&&r!==r}var xi=typeof Object.is=="function"?Object.is:E_;function Ko(n,r){if(xi(n,r))return!0;if(typeof n!="object"||n===null||typeof r!="object"||r===null)return!1;var l=Object.keys(n),h=Object.keys(r);if(l.length!==h.length)return!1;for(h=0;h<l.length;h++){var g=l[h];if(!d.call(r,g)||!xi(n[g],r[g]))return!1}return!0}function tp(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function np(n,r){var l=tp(n);n=0;for(var h;l;){if(l.nodeType===3){if(h=n+l.textContent.length,n<=r&&h>=r)return{node:l,offset:r-n};n=h}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=tp(l)}}function ip(n,r){return n&&r?n===r?!0:n&&n.nodeType===3?!1:r&&r.nodeType===3?ip(n,r.parentNode):"contains"in n?n.contains(r):n.compareDocumentPosition?!!(n.compareDocumentPosition(r)&16):!1:!1}function rp(){for(var n=window,r=Bt();r instanceof n.HTMLIFrameElement;){try{var l=typeof r.contentWindow.location.href=="string"}catch{l=!1}if(l)n=r.contentWindow;else break;r=Bt(n.document)}return r}function du(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r&&(r==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||r==="textarea"||n.contentEditable==="true")}function w_(n){var r=rp(),l=n.focusedElem,h=n.selectionRange;if(r!==l&&l&&l.ownerDocument&&ip(l.ownerDocument.documentElement,l)){if(h!==null&&du(l)){if(r=h.start,n=h.end,n===void 0&&(n=r),"selectionStart"in l)l.selectionStart=r,l.selectionEnd=Math.min(n,l.value.length);else if(n=(r=l.ownerDocument||document)&&r.defaultView||window,n.getSelection){n=n.getSelection();var g=l.textContent.length,M=Math.min(h.start,g);h=h.end===void 0?M:Math.min(h.end,g),!n.extend&&M>h&&(g=h,h=M,M=g),g=np(l,M);var R=np(l,h);g&&R&&(n.rangeCount!==1||n.anchorNode!==g.node||n.anchorOffset!==g.offset||n.focusNode!==R.node||n.focusOffset!==R.offset)&&(r=r.createRange(),r.setStart(g.node,g.offset),n.removeAllRanges(),M>h?(n.addRange(r),n.extend(R.node,R.offset)):(r.setEnd(R.node,R.offset),n.addRange(r)))}}for(r=[],n=l;n=n.parentNode;)n.nodeType===1&&r.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<r.length;l++)n=r[l],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var T_=u&&"documentMode"in document&&11>=document.documentMode,Hs=null,fu=null,Qo=null,pu=!1;function sp(n,r,l){var h=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;pu||Hs==null||Hs!==Bt(h)||(h=Hs,"selectionStart"in h&&du(h)?h={start:h.selectionStart,end:h.selectionEnd}:(h=(h.ownerDocument&&h.ownerDocument.defaultView||window).getSelection(),h={anchorNode:h.anchorNode,anchorOffset:h.anchorOffset,focusNode:h.focusNode,focusOffset:h.focusOffset}),Qo&&Ko(Qo,h)||(Qo=h,h=ol(fu,"onSelect"),0<h.length&&(r=new ru("onSelect","select",null,r,l),n.push({event:r,listeners:h}),r.target=Hs)))}function il(n,r){var l={};return l[n.toLowerCase()]=r.toLowerCase(),l["Webkit"+n]="webkit"+r,l["Moz"+n]="moz"+r,l}var Vs={animationend:il("Animation","AnimationEnd"),animationiteration:il("Animation","AnimationIteration"),animationstart:il("Animation","AnimationStart"),transitionend:il("Transition","TransitionEnd")},mu={},op={};u&&(op=document.createElement("div").style,"AnimationEvent"in window||(delete Vs.animationend.animation,delete Vs.animationiteration.animation,delete Vs.animationstart.animation),"TransitionEvent"in window||delete Vs.transitionend.transition);function rl(n){if(mu[n])return mu[n];if(!Vs[n])return n;var r=Vs[n],l;for(l in r)if(r.hasOwnProperty(l)&&l in op)return mu[n]=r[l];return n}var ap=rl("animationend"),lp=rl("animationiteration"),cp=rl("animationstart"),up=rl("transitionend"),hp=new Map,dp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Cr(n,r){hp.set(n,r),o(r,[n])}for(var gu=0;gu<dp.length;gu++){var vu=dp[gu],A_=vu.toLowerCase(),C_=vu[0].toUpperCase()+vu.slice(1);Cr(A_,"on"+C_)}Cr(ap,"onAnimationEnd"),Cr(lp,"onAnimationIteration"),Cr(cp,"onAnimationStart"),Cr("dblclick","onDoubleClick"),Cr("focusin","onFocus"),Cr("focusout","onBlur"),Cr(up,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),o("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),o("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),o("onBeforeInput",["compositionend","keypress","textInput","paste"]),o("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),o("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),o("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Jo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),R_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Jo));function fp(n,r,l){var h=n.type||"unknown-event";n.currentTarget=l,Wa(h,r,void 0,n),n.currentTarget=null}function pp(n,r){r=(r&4)!==0;for(var l=0;l<n.length;l++){var h=n[l],g=h.event;h=h.listeners;e:{var M=void 0;if(r)for(var R=h.length-1;0<=R;R--){var V=h[R],Z=V.instance,ce=V.currentTarget;if(V=V.listener,Z!==M&&g.isPropagationStopped())break e;fp(g,V,ce),M=Z}else for(R=0;R<h.length;R++){if(V=h[R],Z=V.instance,ce=V.currentTarget,V=V.listener,Z!==M&&g.isPropagationStopped())break e;fp(g,V,ce),M=Z}}}if(es)throw n=Sr,es=!1,Sr=null,n}function Gt(n,r){var l=r[Tu];l===void 0&&(l=r[Tu]=new Set);var h=n+"__bubble";l.has(h)||(mp(r,n,2,!1),l.add(h))}function _u(n,r,l){var h=0;r&&(h|=4),mp(l,n,h,r)}var sl="_reactListening"+Math.random().toString(36).slice(2);function ea(n){if(!n[sl]){n[sl]=!0,i.forEach(function(l){l!=="selectionchange"&&(R_.has(l)||_u(l,!1,n),_u(l,!0,n))});var r=n.nodeType===9?n:n.ownerDocument;r===null||r[sl]||(r[sl]=!0,_u("selectionchange",!1,r))}}function mp(n,r,l,h){switch(Of(r)){case 1:var g=V0;break;case 4:g=G0;break;default:g=tu}l=g.bind(null,r,l,n),g=void 0,!Fs||r!=="touchstart"&&r!=="touchmove"&&r!=="wheel"||(g=!0),h?g!==void 0?n.addEventListener(r,l,{capture:!0,passive:g}):n.addEventListener(r,l,!0):g!==void 0?n.addEventListener(r,l,{passive:g}):n.addEventListener(r,l,!1)}function xu(n,r,l,h,g){var M=h;if((r&1)===0&&(r&2)===0&&h!==null)e:for(;;){if(h===null)return;var R=h.tag;if(R===3||R===4){var V=h.stateNode.containerInfo;if(V===g||V.nodeType===8&&V.parentNode===g)break;if(R===4)for(R=h.return;R!==null;){var Z=R.tag;if((Z===3||Z===4)&&(Z=R.stateNode.containerInfo,Z===g||Z.nodeType===8&&Z.parentNode===g))return;R=R.return}for(;V!==null;){if(R=ts(V),R===null)return;if(Z=R.tag,Z===5||Z===6){h=M=R;continue e}V=V.parentNode}}h=h.return}kn(function(){var ce=M,ye=J(l),Se=[];e:{var ve=hp.get(n);if(ve!==void 0){var Ue=ru,Ve=n;switch(n){case"keypress":if(Ja(l)===0)break e;case"keydown":case"keyup":Ue=r_;break;case"focusin":Ve="focus",Ue=au;break;case"focusout":Ve="blur",Ue=au;break;case"beforeblur":case"afterblur":Ue=au;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Ue=Hf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Ue=X0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Ue=a_;break;case ap:case lp:case cp:Ue=Z0;break;case up:Ue=c_;break;case"scroll":Ue=W0;break;case"wheel":Ue=h_;break;case"copy":case"cut":case"paste":Ue=K0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Ue=Gf}var je=(r&4)!==0,en=!je&&n==="scroll",re=je?ve!==null?ve+"Capture":null:ve;je=[];for(var K=ce,ae;K!==null;){ae=K;var Te=ae.stateNode;if(ae.tag===5&&Te!==null&&(ae=Te,re!==null&&(Te=Dn(K,re),Te!=null&&je.push(ta(K,Te,ae)))),en)break;K=K.return}0<je.length&&(ve=new Ue(ve,Ve,null,l,ye),Se.push({event:ve,listeners:je}))}}if((r&7)===0){e:{if(ve=n==="mouseover"||n==="pointerover",Ue=n==="mouseout"||n==="pointerout",ve&&l!==Lt&&(Ve=l.relatedTarget||l.fromElement)&&(ts(Ve)||Ve[$i]))break e;if((Ue||ve)&&(ve=ye.window===ye?ye:(ve=ye.ownerDocument)?ve.defaultView||ve.parentWindow:window,Ue?(Ve=l.relatedTarget||l.toElement,Ue=ce,Ve=Ve?ts(Ve):null,Ve!==null&&(en=Di(Ve),Ve!==en||Ve.tag!==5&&Ve.tag!==6)&&(Ve=null)):(Ue=null,Ve=ce),Ue!==Ve)){if(je=Hf,Te="onMouseLeave",re="onMouseEnter",K="mouse",(n==="pointerout"||n==="pointerover")&&(je=Gf,Te="onPointerLeave",re="onPointerEnter",K="pointer"),en=Ue==null?ve:js(Ue),ae=Ve==null?ve:js(Ve),ve=new je(Te,K+"leave",Ue,l,ye),ve.target=en,ve.relatedTarget=ae,Te=null,ts(ye)===ce&&(je=new je(re,K+"enter",Ve,l,ye),je.target=ae,je.relatedTarget=en,Te=je),en=Te,Ue&&Ve)t:{for(je=Ue,re=Ve,K=0,ae=je;ae;ae=Gs(ae))K++;for(ae=0,Te=re;Te;Te=Gs(Te))ae++;for(;0<K-ae;)je=Gs(je),K--;for(;0<ae-K;)re=Gs(re),ae--;for(;K--;){if(je===re||re!==null&&je===re.alternate)break t;je=Gs(je),re=Gs(re)}je=null}else je=null;Ue!==null&&gp(Se,ve,Ue,je,!1),Ve!==null&&en!==null&&gp(Se,en,Ve,je,!0)}}e:{if(ve=ce?js(ce):window,Ue=ve.nodeName&&ve.nodeName.toLowerCase(),Ue==="select"||Ue==="input"&&ve.type==="file")var $e=__;else if(Zf(ve))if(Kf)$e=M_;else{$e=y_;var et=x_}else(Ue=ve.nodeName)&&Ue.toLowerCase()==="input"&&(ve.type==="checkbox"||ve.type==="radio")&&($e=S_);if($e&&($e=$e(n,ce))){$f(Se,$e,l,ye);break e}et&&et(n,ve,ce),n==="focusout"&&(et=ve._wrapperState)&&et.controlled&&ve.type==="number"&&It(ve,"number",ve.value)}switch(et=ce?js(ce):window,n){case"focusin":(Zf(et)||et.contentEditable==="true")&&(Hs=et,fu=ce,Qo=null);break;case"focusout":Qo=fu=Hs=null;break;case"mousedown":pu=!0;break;case"contextmenu":case"mouseup":case"dragend":pu=!1,sp(Se,l,ye);break;case"selectionchange":if(T_)break;case"keydown":case"keyup":sp(Se,l,ye)}var tt;if(cu)e:{switch(n){case"compositionstart":var ot="onCompositionStart";break e;case"compositionend":ot="onCompositionEnd";break e;case"compositionupdate":ot="onCompositionUpdate";break e}ot=void 0}else ks?qf(n,l)&&(ot="onCompositionEnd"):n==="keydown"&&l.keyCode===229&&(ot="onCompositionStart");ot&&(Wf&&l.locale!=="ko"&&(ks||ot!=="onCompositionStart"?ot==="onCompositionEnd"&&ks&&(tt=Bf()):(Ar=ye,iu="value"in Ar?Ar.value:Ar.textContent,ks=!0)),et=ol(ce,ot),0<et.length&&(ot=new Vf(ot,n,null,l,ye),Se.push({event:ot,listeners:et}),tt?ot.data=tt:(tt=Yf(l),tt!==null&&(ot.data=tt)))),(tt=f_?p_(n,l):m_(n,l))&&(ce=ol(ce,"onBeforeInput"),0<ce.length&&(ye=new Vf("onBeforeInput","beforeinput",null,l,ye),Se.push({event:ye,listeners:ce}),ye.data=tt))}pp(Se,r)})}function ta(n,r,l){return{instance:n,listener:r,currentTarget:l}}function ol(n,r){for(var l=r+"Capture",h=[];n!==null;){var g=n,M=g.stateNode;g.tag===5&&M!==null&&(g=M,M=Dn(n,l),M!=null&&h.unshift(ta(n,M,g)),M=Dn(n,r),M!=null&&h.push(ta(n,M,g))),n=n.return}return h}function Gs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function gp(n,r,l,h,g){for(var M=r._reactName,R=[];l!==null&&l!==h;){var V=l,Z=V.alternate,ce=V.stateNode;if(Z!==null&&Z===h)break;V.tag===5&&ce!==null&&(V=ce,g?(Z=Dn(l,M),Z!=null&&R.unshift(ta(l,Z,V))):g||(Z=Dn(l,M),Z!=null&&R.push(ta(l,Z,V)))),l=l.return}R.length!==0&&n.push({event:r,listeners:R})}var b_=/\r\n?/g,P_=/\u0000|\uFFFD/g;function vp(n){return(typeof n=="string"?n:""+n).replace(b_,`
`).replace(P_,"")}function al(n,r,l){if(r=vp(r),vp(n)!==r&&l)throw Error(t(425))}function ll(){}var yu=null,Su=null;function Mu(n,r){return n==="textarea"||n==="noscript"||typeof r.children=="string"||typeof r.children=="number"||typeof r.dangerouslySetInnerHTML=="object"&&r.dangerouslySetInnerHTML!==null&&r.dangerouslySetInnerHTML.__html!=null}var Eu=typeof setTimeout=="function"?setTimeout:void 0,L_=typeof clearTimeout=="function"?clearTimeout:void 0,_p=typeof Promise=="function"?Promise:void 0,I_=typeof queueMicrotask=="function"?queueMicrotask:typeof _p<"u"?function(n){return _p.resolve(null).then(n).catch(N_)}:Eu;function N_(n){setTimeout(function(){throw n})}function wu(n,r){var l=r,h=0;do{var g=l.nextSibling;if(n.removeChild(l),g&&g.nodeType===8)if(l=g.data,l==="/$"){if(h===0){n.removeChild(g),jo(r);return}h--}else l!=="$"&&l!=="$?"&&l!=="$!"||h++;l=g}while(l);jo(r)}function Rr(n){for(;n!=null;n=n.nextSibling){var r=n.nodeType;if(r===1||r===3)break;if(r===8){if(r=n.data,r==="$"||r==="$!"||r==="$?")break;if(r==="/$")return null}}return n}function xp(n){n=n.previousSibling;for(var r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="$"||l==="$!"||l==="$?"){if(r===0)return n;r--}else l==="/$"&&r++}n=n.previousSibling}return null}var Ws=Math.random().toString(36).slice(2),Fi="__reactFiber$"+Ws,na="__reactProps$"+Ws,$i="__reactContainer$"+Ws,Tu="__reactEvents$"+Ws,D_="__reactListeners$"+Ws,U_="__reactHandles$"+Ws;function ts(n){var r=n[Fi];if(r)return r;for(var l=n.parentNode;l;){if(r=l[$i]||l[Fi]){if(l=r.alternate,r.child!==null||l!==null&&l.child!==null)for(n=xp(n);n!==null;){if(l=n[Fi])return l;n=xp(n)}return r}n=l,l=n.parentNode}return null}function ia(n){return n=n[Fi]||n[$i],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function js(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function cl(n){return n[na]||null}var Au=[],Xs=-1;function br(n){return{current:n}}function Wt(n){0>Xs||(n.current=Au[Xs],Au[Xs]=null,Xs--)}function kt(n,r){Xs++,Au[Xs]=n.current,n.current=r}var Pr={},wn=br(Pr),Vn=br(!1),ns=Pr;function qs(n,r){var l=n.type.contextTypes;if(!l)return Pr;var h=n.stateNode;if(h&&h.__reactInternalMemoizedUnmaskedChildContext===r)return h.__reactInternalMemoizedMaskedChildContext;var g={},M;for(M in l)g[M]=r[M];return h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=g),g}function Gn(n){return n=n.childContextTypes,n!=null}function ul(){Wt(Vn),Wt(wn)}function yp(n,r,l){if(wn.current!==Pr)throw Error(t(168));kt(wn,r),kt(Vn,l)}function Sp(n,r,l){var h=n.stateNode;if(r=r.childContextTypes,typeof h.getChildContext!="function")return l;h=h.getChildContext();for(var g in h)if(!(g in r))throw Error(t(108,_e(n)||"Unknown",g));return oe({},l,h)}function hl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Pr,ns=wn.current,kt(wn,n),kt(Vn,Vn.current),!0}function Mp(n,r,l){var h=n.stateNode;if(!h)throw Error(t(169));l?(n=Sp(n,r,ns),h.__reactInternalMemoizedMergedChildContext=n,Wt(Vn),Wt(wn),kt(wn,n)):Wt(Vn),kt(Vn,l)}var Ki=null,dl=!1,Cu=!1;function Ep(n){Ki===null?Ki=[n]:Ki.push(n)}function F_(n){dl=!0,Ep(n)}function Lr(){if(!Cu&&Ki!==null){Cu=!0;var n=0,r=Nt;try{var l=Ki;for(Nt=1;n<l.length;n++){var h=l[n];do h=h(!0);while(h!==null)}Ki=null,dl=!1}catch(g){throw Ki!==null&&(Ki=Ki.slice(n+1)),ue(We,Lr),g}finally{Nt=r,Cu=!1}}return null}var Ys=[],Zs=0,fl=null,pl=0,ci=[],ui=0,is=null,Qi=1,Ji="";function rs(n,r){Ys[Zs++]=pl,Ys[Zs++]=fl,fl=n,pl=r}function wp(n,r,l){ci[ui++]=Qi,ci[ui++]=Ji,ci[ui++]=is,is=n;var h=Qi;n=Ji;var g=32-ht(h)-1;h&=~(1<<g),l+=1;var M=32-ht(r)+g;if(30<M){var R=g-g%5;M=(h&(1<<R)-1).toString(32),h>>=R,g-=R,Qi=1<<32-ht(r)+g|l<<g|h,Ji=M+n}else Qi=1<<M|l<<g|h,Ji=n}function Ru(n){n.return!==null&&(rs(n,1),wp(n,1,0))}function bu(n){for(;n===fl;)fl=Ys[--Zs],Ys[Zs]=null,pl=Ys[--Zs],Ys[Zs]=null;for(;n===is;)is=ci[--ui],ci[ui]=null,Ji=ci[--ui],ci[ui]=null,Qi=ci[--ui],ci[ui]=null}var ei=null,ti=null,Xt=!1,yi=null;function Tp(n,r){var l=pi(5,null,null,0);l.elementType="DELETED",l.stateNode=r,l.return=n,r=n.deletions,r===null?(n.deletions=[l],n.flags|=16):r.push(l)}function Ap(n,r){switch(n.tag){case 5:var l=n.type;return r=r.nodeType!==1||l.toLowerCase()!==r.nodeName.toLowerCase()?null:r,r!==null?(n.stateNode=r,ei=n,ti=Rr(r.firstChild),!0):!1;case 6:return r=n.pendingProps===""||r.nodeType!==3?null:r,r!==null?(n.stateNode=r,ei=n,ti=null,!0):!1;case 13:return r=r.nodeType!==8?null:r,r!==null?(l=is!==null?{id:Qi,overflow:Ji}:null,n.memoizedState={dehydrated:r,treeContext:l,retryLane:1073741824},l=pi(18,null,null,0),l.stateNode=r,l.return=n,n.child=l,ei=n,ti=null,!0):!1;default:return!1}}function Pu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Lu(n){if(Xt){var r=ti;if(r){var l=r;if(!Ap(n,r)){if(Pu(n))throw Error(t(418));r=Rr(l.nextSibling);var h=ei;r&&Ap(n,r)?Tp(h,l):(n.flags=n.flags&-4097|2,Xt=!1,ei=n)}}else{if(Pu(n))throw Error(t(418));n.flags=n.flags&-4097|2,Xt=!1,ei=n}}}function Cp(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;ei=n}function ml(n){if(n!==ei)return!1;if(!Xt)return Cp(n),Xt=!0,!1;var r;if((r=n.tag!==3)&&!(r=n.tag!==5)&&(r=n.type,r=r!=="head"&&r!=="body"&&!Mu(n.type,n.memoizedProps)),r&&(r=ti)){if(Pu(n))throw Rp(),Error(t(418));for(;r;)Tp(n,r),r=Rr(r.nextSibling)}if(Cp(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="/$"){if(r===0){ti=Rr(n.nextSibling);break e}r--}else l!=="$"&&l!=="$!"&&l!=="$?"||r++}n=n.nextSibling}ti=null}}else ti=ei?Rr(n.stateNode.nextSibling):null;return!0}function Rp(){for(var n=ti;n;)n=Rr(n.nextSibling)}function $s(){ti=ei=null,Xt=!1}function Iu(n){yi===null?yi=[n]:yi.push(n)}var z_=T.ReactCurrentBatchConfig;function ra(n,r,l){if(n=l.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(l._owner){if(l=l._owner,l){if(l.tag!==1)throw Error(t(309));var h=l.stateNode}if(!h)throw Error(t(147,n));var g=h,M=""+n;return r!==null&&r.ref!==null&&typeof r.ref=="function"&&r.ref._stringRef===M?r.ref:(r=function(R){var V=g.refs;R===null?delete V[M]:V[M]=R},r._stringRef=M,r)}if(typeof n!="string")throw Error(t(284));if(!l._owner)throw Error(t(290,n))}return n}function gl(n,r){throw n=Object.prototype.toString.call(r),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(r).join(", ")+"}":n))}function bp(n){var r=n._init;return r(n._payload)}function Pp(n){function r(re,K){if(n){var ae=re.deletions;ae===null?(re.deletions=[K],re.flags|=16):ae.push(K)}}function l(re,K){if(!n)return null;for(;K!==null;)r(re,K),K=K.sibling;return null}function h(re,K){for(re=new Map;K!==null;)K.key!==null?re.set(K.key,K):re.set(K.index,K),K=K.sibling;return re}function g(re,K){return re=Br(re,K),re.index=0,re.sibling=null,re}function M(re,K,ae){return re.index=ae,n?(ae=re.alternate,ae!==null?(ae=ae.index,ae<K?(re.flags|=2,K):ae):(re.flags|=2,K)):(re.flags|=1048576,K)}function R(re){return n&&re.alternate===null&&(re.flags|=2),re}function V(re,K,ae,Te){return K===null||K.tag!==6?(K=Eh(ae,re.mode,Te),K.return=re,K):(K=g(K,ae),K.return=re,K)}function Z(re,K,ae,Te){var $e=ae.type;return $e===D?ye(re,K,ae.props.children,Te,ae.key):K!==null&&(K.elementType===$e||typeof $e=="object"&&$e!==null&&$e.$$typeof===W&&bp($e)===K.type)?(Te=g(K,ae.props),Te.ref=ra(re,K,ae),Te.return=re,Te):(Te=kl(ae.type,ae.key,ae.props,null,re.mode,Te),Te.ref=ra(re,K,ae),Te.return=re,Te)}function ce(re,K,ae,Te){return K===null||K.tag!==4||K.stateNode.containerInfo!==ae.containerInfo||K.stateNode.implementation!==ae.implementation?(K=wh(ae,re.mode,Te),K.return=re,K):(K=g(K,ae.children||[]),K.return=re,K)}function ye(re,K,ae,Te,$e){return K===null||K.tag!==7?(K=ds(ae,re.mode,Te,$e),K.return=re,K):(K=g(K,ae),K.return=re,K)}function Se(re,K,ae){if(typeof K=="string"&&K!==""||typeof K=="number")return K=Eh(""+K,re.mode,ae),K.return=re,K;if(typeof K=="object"&&K!==null){switch(K.$$typeof){case U:return ae=kl(K.type,K.key,K.props,null,re.mode,ae),ae.ref=ra(re,null,K),ae.return=re,ae;case N:return K=wh(K,re.mode,ae),K.return=re,K;case W:var Te=K._init;return Se(re,Te(K._payload),ae)}if(Qe(K)||q(K))return K=ds(K,re.mode,ae,null),K.return=re,K;gl(re,K)}return null}function ve(re,K,ae,Te){var $e=K!==null?K.key:null;if(typeof ae=="string"&&ae!==""||typeof ae=="number")return $e!==null?null:V(re,K,""+ae,Te);if(typeof ae=="object"&&ae!==null){switch(ae.$$typeof){case U:return ae.key===$e?Z(re,K,ae,Te):null;case N:return ae.key===$e?ce(re,K,ae,Te):null;case W:return $e=ae._init,ve(re,K,$e(ae._payload),Te)}if(Qe(ae)||q(ae))return $e!==null?null:ye(re,K,ae,Te,null);gl(re,ae)}return null}function Ue(re,K,ae,Te,$e){if(typeof Te=="string"&&Te!==""||typeof Te=="number")return re=re.get(ae)||null,V(K,re,""+Te,$e);if(typeof Te=="object"&&Te!==null){switch(Te.$$typeof){case U:return re=re.get(Te.key===null?ae:Te.key)||null,Z(K,re,Te,$e);case N:return re=re.get(Te.key===null?ae:Te.key)||null,ce(K,re,Te,$e);case W:var et=Te._init;return Ue(re,K,ae,et(Te._payload),$e)}if(Qe(Te)||q(Te))return re=re.get(ae)||null,ye(K,re,Te,$e,null);gl(K,Te)}return null}function Ve(re,K,ae,Te){for(var $e=null,et=null,tt=K,ot=K=0,gn=null;tt!==null&&ot<ae.length;ot++){tt.index>ot?(gn=tt,tt=null):gn=tt.sibling;var bt=ve(re,tt,ae[ot],Te);if(bt===null){tt===null&&(tt=gn);break}n&&tt&&bt.alternate===null&&r(re,tt),K=M(bt,K,ot),et===null?$e=bt:et.sibling=bt,et=bt,tt=gn}if(ot===ae.length)return l(re,tt),Xt&&rs(re,ot),$e;if(tt===null){for(;ot<ae.length;ot++)tt=Se(re,ae[ot],Te),tt!==null&&(K=M(tt,K,ot),et===null?$e=tt:et.sibling=tt,et=tt);return Xt&&rs(re,ot),$e}for(tt=h(re,tt);ot<ae.length;ot++)gn=Ue(tt,re,ot,ae[ot],Te),gn!==null&&(n&&gn.alternate!==null&&tt.delete(gn.key===null?ot:gn.key),K=M(gn,K,ot),et===null?$e=gn:et.sibling=gn,et=gn);return n&&tt.forEach(function(kr){return r(re,kr)}),Xt&&rs(re,ot),$e}function je(re,K,ae,Te){var $e=q(ae);if(typeof $e!="function")throw Error(t(150));if(ae=$e.call(ae),ae==null)throw Error(t(151));for(var et=$e=null,tt=K,ot=K=0,gn=null,bt=ae.next();tt!==null&&!bt.done;ot++,bt=ae.next()){tt.index>ot?(gn=tt,tt=null):gn=tt.sibling;var kr=ve(re,tt,bt.value,Te);if(kr===null){tt===null&&(tt=gn);break}n&&tt&&kr.alternate===null&&r(re,tt),K=M(kr,K,ot),et===null?$e=kr:et.sibling=kr,et=kr,tt=gn}if(bt.done)return l(re,tt),Xt&&rs(re,ot),$e;if(tt===null){for(;!bt.done;ot++,bt=ae.next())bt=Se(re,bt.value,Te),bt!==null&&(K=M(bt,K,ot),et===null?$e=bt:et.sibling=bt,et=bt);return Xt&&rs(re,ot),$e}for(tt=h(re,tt);!bt.done;ot++,bt=ae.next())bt=Ue(tt,re,ot,bt.value,Te),bt!==null&&(n&&bt.alternate!==null&&tt.delete(bt.key===null?ot:bt.key),K=M(bt,K,ot),et===null?$e=bt:et.sibling=bt,et=bt);return n&&tt.forEach(function(gx){return r(re,gx)}),Xt&&rs(re,ot),$e}function en(re,K,ae,Te){if(typeof ae=="object"&&ae!==null&&ae.type===D&&ae.key===null&&(ae=ae.props.children),typeof ae=="object"&&ae!==null){switch(ae.$$typeof){case U:e:{for(var $e=ae.key,et=K;et!==null;){if(et.key===$e){if($e=ae.type,$e===D){if(et.tag===7){l(re,et.sibling),K=g(et,ae.props.children),K.return=re,re=K;break e}}else if(et.elementType===$e||typeof $e=="object"&&$e!==null&&$e.$$typeof===W&&bp($e)===et.type){l(re,et.sibling),K=g(et,ae.props),K.ref=ra(re,et,ae),K.return=re,re=K;break e}l(re,et);break}else r(re,et);et=et.sibling}ae.type===D?(K=ds(ae.props.children,re.mode,Te,ae.key),K.return=re,re=K):(Te=kl(ae.type,ae.key,ae.props,null,re.mode,Te),Te.ref=ra(re,K,ae),Te.return=re,re=Te)}return R(re);case N:e:{for(et=ae.key;K!==null;){if(K.key===et)if(K.tag===4&&K.stateNode.containerInfo===ae.containerInfo&&K.stateNode.implementation===ae.implementation){l(re,K.sibling),K=g(K,ae.children||[]),K.return=re,re=K;break e}else{l(re,K);break}else r(re,K);K=K.sibling}K=wh(ae,re.mode,Te),K.return=re,re=K}return R(re);case W:return et=ae._init,en(re,K,et(ae._payload),Te)}if(Qe(ae))return Ve(re,K,ae,Te);if(q(ae))return je(re,K,ae,Te);gl(re,ae)}return typeof ae=="string"&&ae!==""||typeof ae=="number"?(ae=""+ae,K!==null&&K.tag===6?(l(re,K.sibling),K=g(K,ae),K.return=re,re=K):(l(re,K),K=Eh(ae,re.mode,Te),K.return=re,re=K),R(re)):l(re,K)}return en}var Ks=Pp(!0),Lp=Pp(!1),vl=br(null),_l=null,Qs=null,Nu=null;function Du(){Nu=Qs=_l=null}function Uu(n){var r=vl.current;Wt(vl),n._currentValue=r}function Fu(n,r,l){for(;n!==null;){var h=n.alternate;if((n.childLanes&r)!==r?(n.childLanes|=r,h!==null&&(h.childLanes|=r)):h!==null&&(h.childLanes&r)!==r&&(h.childLanes|=r),n===l)break;n=n.return}}function Js(n,r){_l=n,Nu=Qs=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&r)!==0&&(Wn=!0),n.firstContext=null)}function hi(n){var r=n._currentValue;if(Nu!==n)if(n={context:n,memoizedValue:r,next:null},Qs===null){if(_l===null)throw Error(t(308));Qs=n,_l.dependencies={lanes:0,firstContext:n}}else Qs=Qs.next=n;return r}var ss=null;function zu(n){ss===null?ss=[n]:ss.push(n)}function Ip(n,r,l,h){var g=r.interleaved;return g===null?(l.next=l,zu(r)):(l.next=g.next,g.next=l),r.interleaved=l,er(n,h)}function er(n,r){n.lanes|=r;var l=n.alternate;for(l!==null&&(l.lanes|=r),l=n,n=n.return;n!==null;)n.childLanes|=r,l=n.alternate,l!==null&&(l.childLanes|=r),l=n,n=n.return;return l.tag===3?l.stateNode:null}var Ir=!1;function Ou(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Np(n,r){n=n.updateQueue,r.updateQueue===n&&(r.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function tr(n,r){return{eventTime:n,lane:r,tag:0,payload:null,callback:null,next:null}}function Nr(n,r,l){var h=n.updateQueue;if(h===null)return null;if(h=h.shared,(At&2)!==0){var g=h.pending;return g===null?r.next=r:(r.next=g.next,g.next=r),h.pending=r,er(n,l)}return g=h.interleaved,g===null?(r.next=r,zu(h)):(r.next=g.next,g.next=r),h.interleaved=r,er(n,l)}function xl(n,r,l){if(r=r.updateQueue,r!==null&&(r=r.shared,(l&4194240)!==0)){var h=r.lanes;h&=n.pendingLanes,l|=h,r.lanes=l,Qc(n,l)}}function Dp(n,r){var l=n.updateQueue,h=n.alternate;if(h!==null&&(h=h.updateQueue,l===h)){var g=null,M=null;if(l=l.firstBaseUpdate,l!==null){do{var R={eventTime:l.eventTime,lane:l.lane,tag:l.tag,payload:l.payload,callback:l.callback,next:null};M===null?g=M=R:M=M.next=R,l=l.next}while(l!==null);M===null?g=M=r:M=M.next=r}else g=M=r;l={baseState:h.baseState,firstBaseUpdate:g,lastBaseUpdate:M,shared:h.shared,effects:h.effects},n.updateQueue=l;return}n=l.lastBaseUpdate,n===null?l.firstBaseUpdate=r:n.next=r,l.lastBaseUpdate=r}function yl(n,r,l,h){var g=n.updateQueue;Ir=!1;var M=g.firstBaseUpdate,R=g.lastBaseUpdate,V=g.shared.pending;if(V!==null){g.shared.pending=null;var Z=V,ce=Z.next;Z.next=null,R===null?M=ce:R.next=ce,R=Z;var ye=n.alternate;ye!==null&&(ye=ye.updateQueue,V=ye.lastBaseUpdate,V!==R&&(V===null?ye.firstBaseUpdate=ce:V.next=ce,ye.lastBaseUpdate=Z))}if(M!==null){var Se=g.baseState;R=0,ye=ce=Z=null,V=M;do{var ve=V.lane,Ue=V.eventTime;if((h&ve)===ve){ye!==null&&(ye=ye.next={eventTime:Ue,lane:0,tag:V.tag,payload:V.payload,callback:V.callback,next:null});e:{var Ve=n,je=V;switch(ve=r,Ue=l,je.tag){case 1:if(Ve=je.payload,typeof Ve=="function"){Se=Ve.call(Ue,Se,ve);break e}Se=Ve;break e;case 3:Ve.flags=Ve.flags&-65537|128;case 0:if(Ve=je.payload,ve=typeof Ve=="function"?Ve.call(Ue,Se,ve):Ve,ve==null)break e;Se=oe({},Se,ve);break e;case 2:Ir=!0}}V.callback!==null&&V.lane!==0&&(n.flags|=64,ve=g.effects,ve===null?g.effects=[V]:ve.push(V))}else Ue={eventTime:Ue,lane:ve,tag:V.tag,payload:V.payload,callback:V.callback,next:null},ye===null?(ce=ye=Ue,Z=Se):ye=ye.next=Ue,R|=ve;if(V=V.next,V===null){if(V=g.shared.pending,V===null)break;ve=V,V=ve.next,ve.next=null,g.lastBaseUpdate=ve,g.shared.pending=null}}while(!0);if(ye===null&&(Z=Se),g.baseState=Z,g.firstBaseUpdate=ce,g.lastBaseUpdate=ye,r=g.shared.interleaved,r!==null){g=r;do R|=g.lane,g=g.next;while(g!==r)}else M===null&&(g.shared.lanes=0);ls|=R,n.lanes=R,n.memoizedState=Se}}function Up(n,r,l){if(n=r.effects,r.effects=null,n!==null)for(r=0;r<n.length;r++){var h=n[r],g=h.callback;if(g!==null){if(h.callback=null,h=l,typeof g!="function")throw Error(t(191,g));g.call(h)}}}var sa={},zi=br(sa),oa=br(sa),aa=br(sa);function os(n){if(n===sa)throw Error(t(174));return n}function Bu(n,r){switch(kt(aa,r),kt(oa,n),kt(zi,sa),n=r.nodeType,n){case 9:case 11:r=(r=r.documentElement)?r.namespaceURI:qe(null,"");break;default:n=n===8?r.parentNode:r,r=n.namespaceURI||null,n=n.tagName,r=qe(r,n)}Wt(zi),kt(zi,r)}function eo(){Wt(zi),Wt(oa),Wt(aa)}function Fp(n){os(aa.current);var r=os(zi.current),l=qe(r,n.type);r!==l&&(kt(oa,n),kt(zi,l))}function ku(n){oa.current===n&&(Wt(zi),Wt(oa))}var Yt=br(0);function Sl(n){for(var r=n;r!==null;){if(r.tag===13){var l=r.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||l.data==="$?"||l.data==="$!"))return r}else if(r.tag===19&&r.memoizedProps.revealOrder!==void 0){if((r.flags&128)!==0)return r}else if(r.child!==null){r.child.return=r,r=r.child;continue}if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return null;r=r.return}r.sibling.return=r.return,r=r.sibling}return null}var Hu=[];function Vu(){for(var n=0;n<Hu.length;n++)Hu[n]._workInProgressVersionPrimary=null;Hu.length=0}var Ml=T.ReactCurrentDispatcher,Gu=T.ReactCurrentBatchConfig,as=0,Zt=null,cn=null,pn=null,El=!1,la=!1,ca=0,O_=0;function Tn(){throw Error(t(321))}function Wu(n,r){if(r===null)return!1;for(var l=0;l<r.length&&l<n.length;l++)if(!xi(n[l],r[l]))return!1;return!0}function ju(n,r,l,h,g,M){if(as=M,Zt=r,r.memoizedState=null,r.updateQueue=null,r.lanes=0,Ml.current=n===null||n.memoizedState===null?V_:G_,n=l(h,g),la){M=0;do{if(la=!1,ca=0,25<=M)throw Error(t(301));M+=1,pn=cn=null,r.updateQueue=null,Ml.current=W_,n=l(h,g)}while(la)}if(Ml.current=Al,r=cn!==null&&cn.next!==null,as=0,pn=cn=Zt=null,El=!1,r)throw Error(t(300));return n}function Xu(){var n=ca!==0;return ca=0,n}function Oi(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return pn===null?Zt.memoizedState=pn=n:pn=pn.next=n,pn}function di(){if(cn===null){var n=Zt.alternate;n=n!==null?n.memoizedState:null}else n=cn.next;var r=pn===null?Zt.memoizedState:pn.next;if(r!==null)pn=r,cn=n;else{if(n===null)throw Error(t(310));cn=n,n={memoizedState:cn.memoizedState,baseState:cn.baseState,baseQueue:cn.baseQueue,queue:cn.queue,next:null},pn===null?Zt.memoizedState=pn=n:pn=pn.next=n}return pn}function ua(n,r){return typeof r=="function"?r(n):r}function qu(n){var r=di(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=cn,g=h.baseQueue,M=l.pending;if(M!==null){if(g!==null){var R=g.next;g.next=M.next,M.next=R}h.baseQueue=g=M,l.pending=null}if(g!==null){M=g.next,h=h.baseState;var V=R=null,Z=null,ce=M;do{var ye=ce.lane;if((as&ye)===ye)Z!==null&&(Z=Z.next={lane:0,action:ce.action,hasEagerState:ce.hasEagerState,eagerState:ce.eagerState,next:null}),h=ce.hasEagerState?ce.eagerState:n(h,ce.action);else{var Se={lane:ye,action:ce.action,hasEagerState:ce.hasEagerState,eagerState:ce.eagerState,next:null};Z===null?(V=Z=Se,R=h):Z=Z.next=Se,Zt.lanes|=ye,ls|=ye}ce=ce.next}while(ce!==null&&ce!==M);Z===null?R=h:Z.next=V,xi(h,r.memoizedState)||(Wn=!0),r.memoizedState=h,r.baseState=R,r.baseQueue=Z,l.lastRenderedState=h}if(n=l.interleaved,n!==null){g=n;do M=g.lane,Zt.lanes|=M,ls|=M,g=g.next;while(g!==n)}else g===null&&(l.lanes=0);return[r.memoizedState,l.dispatch]}function Yu(n){var r=di(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=l.dispatch,g=l.pending,M=r.memoizedState;if(g!==null){l.pending=null;var R=g=g.next;do M=n(M,R.action),R=R.next;while(R!==g);xi(M,r.memoizedState)||(Wn=!0),r.memoizedState=M,r.baseQueue===null&&(r.baseState=M),l.lastRenderedState=M}return[M,h]}function zp(){}function Op(n,r){var l=Zt,h=di(),g=r(),M=!xi(h.memoizedState,g);if(M&&(h.memoizedState=g,Wn=!0),h=h.queue,Zu(Hp.bind(null,l,h,n),[n]),h.getSnapshot!==r||M||pn!==null&&pn.memoizedState.tag&1){if(l.flags|=2048,ha(9,kp.bind(null,l,h,g,r),void 0,null),mn===null)throw Error(t(349));(as&30)!==0||Bp(l,r,g)}return g}function Bp(n,r,l){n.flags|=16384,n={getSnapshot:r,value:l},r=Zt.updateQueue,r===null?(r={lastEffect:null,stores:null},Zt.updateQueue=r,r.stores=[n]):(l=r.stores,l===null?r.stores=[n]:l.push(n))}function kp(n,r,l,h){r.value=l,r.getSnapshot=h,Vp(r)&&Gp(n)}function Hp(n,r,l){return l(function(){Vp(r)&&Gp(n)})}function Vp(n){var r=n.getSnapshot;n=n.value;try{var l=r();return!xi(n,l)}catch{return!0}}function Gp(n){var r=er(n,1);r!==null&&wi(r,n,1,-1)}function Wp(n){var r=Oi();return typeof n=="function"&&(n=n()),r.memoizedState=r.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ua,lastRenderedState:n},r.queue=n,n=n.dispatch=H_.bind(null,Zt,n),[r.memoizedState,n]}function ha(n,r,l,h){return n={tag:n,create:r,destroy:l,deps:h,next:null},r=Zt.updateQueue,r===null?(r={lastEffect:null,stores:null},Zt.updateQueue=r,r.lastEffect=n.next=n):(l=r.lastEffect,l===null?r.lastEffect=n.next=n:(h=l.next,l.next=n,n.next=h,r.lastEffect=n)),n}function jp(){return di().memoizedState}function wl(n,r,l,h){var g=Oi();Zt.flags|=n,g.memoizedState=ha(1|r,l,void 0,h===void 0?null:h)}function Tl(n,r,l,h){var g=di();h=h===void 0?null:h;var M=void 0;if(cn!==null){var R=cn.memoizedState;if(M=R.destroy,h!==null&&Wu(h,R.deps)){g.memoizedState=ha(r,l,M,h);return}}Zt.flags|=n,g.memoizedState=ha(1|r,l,M,h)}function Xp(n,r){return wl(8390656,8,n,r)}function Zu(n,r){return Tl(2048,8,n,r)}function qp(n,r){return Tl(4,2,n,r)}function Yp(n,r){return Tl(4,4,n,r)}function Zp(n,r){if(typeof r=="function")return n=n(),r(n),function(){r(null)};if(r!=null)return n=n(),r.current=n,function(){r.current=null}}function $p(n,r,l){return l=l!=null?l.concat([n]):null,Tl(4,4,Zp.bind(null,r,n),l)}function $u(){}function Kp(n,r){var l=di();r=r===void 0?null:r;var h=l.memoizedState;return h!==null&&r!==null&&Wu(r,h[1])?h[0]:(l.memoizedState=[n,r],n)}function Qp(n,r){var l=di();r=r===void 0?null:r;var h=l.memoizedState;return h!==null&&r!==null&&Wu(r,h[1])?h[0]:(n=n(),l.memoizedState=[n,r],n)}function Jp(n,r,l){return(as&21)===0?(n.baseState&&(n.baseState=!1,Wn=!0),n.memoizedState=l):(xi(l,r)||(l=Un(),Zt.lanes|=l,ls|=l,n.baseState=!0),r)}function B_(n,r){var l=Nt;Nt=l!==0&&4>l?l:4,n(!0);var h=Gu.transition;Gu.transition={};try{n(!1),r()}finally{Nt=l,Gu.transition=h}}function em(){return di().memoizedState}function k_(n,r,l){var h=zr(n);if(l={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null},tm(n))nm(r,l);else if(l=Ip(n,r,l,h),l!==null){var g=zn();wi(l,n,h,g),im(l,r,h)}}function H_(n,r,l){var h=zr(n),g={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null};if(tm(n))nm(r,g);else{var M=n.alternate;if(n.lanes===0&&(M===null||M.lanes===0)&&(M=r.lastRenderedReducer,M!==null))try{var R=r.lastRenderedState,V=M(R,l);if(g.hasEagerState=!0,g.eagerState=V,xi(V,R)){var Z=r.interleaved;Z===null?(g.next=g,zu(r)):(g.next=Z.next,Z.next=g),r.interleaved=g;return}}catch{}finally{}l=Ip(n,r,g,h),l!==null&&(g=zn(),wi(l,n,h,g),im(l,r,h))}}function tm(n){var r=n.alternate;return n===Zt||r!==null&&r===Zt}function nm(n,r){la=El=!0;var l=n.pending;l===null?r.next=r:(r.next=l.next,l.next=r),n.pending=r}function im(n,r,l){if((l&4194240)!==0){var h=r.lanes;h&=n.pendingLanes,l|=h,r.lanes=l,Qc(n,l)}}var Al={readContext:hi,useCallback:Tn,useContext:Tn,useEffect:Tn,useImperativeHandle:Tn,useInsertionEffect:Tn,useLayoutEffect:Tn,useMemo:Tn,useReducer:Tn,useRef:Tn,useState:Tn,useDebugValue:Tn,useDeferredValue:Tn,useTransition:Tn,useMutableSource:Tn,useSyncExternalStore:Tn,useId:Tn,unstable_isNewReconciler:!1},V_={readContext:hi,useCallback:function(n,r){return Oi().memoizedState=[n,r===void 0?null:r],n},useContext:hi,useEffect:Xp,useImperativeHandle:function(n,r,l){return l=l!=null?l.concat([n]):null,wl(4194308,4,Zp.bind(null,r,n),l)},useLayoutEffect:function(n,r){return wl(4194308,4,n,r)},useInsertionEffect:function(n,r){return wl(4,2,n,r)},useMemo:function(n,r){var l=Oi();return r=r===void 0?null:r,n=n(),l.memoizedState=[n,r],n},useReducer:function(n,r,l){var h=Oi();return r=l!==void 0?l(r):r,h.memoizedState=h.baseState=r,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},h.queue=n,n=n.dispatch=k_.bind(null,Zt,n),[h.memoizedState,n]},useRef:function(n){var r=Oi();return n={current:n},r.memoizedState=n},useState:Wp,useDebugValue:$u,useDeferredValue:function(n){return Oi().memoizedState=n},useTransition:function(){var n=Wp(!1),r=n[0];return n=B_.bind(null,n[1]),Oi().memoizedState=n,[r,n]},useMutableSource:function(){},useSyncExternalStore:function(n,r,l){var h=Zt,g=Oi();if(Xt){if(l===void 0)throw Error(t(407));l=l()}else{if(l=r(),mn===null)throw Error(t(349));(as&30)!==0||Bp(h,r,l)}g.memoizedState=l;var M={value:l,getSnapshot:r};return g.queue=M,Xp(Hp.bind(null,h,M,n),[n]),h.flags|=2048,ha(9,kp.bind(null,h,M,l,r),void 0,null),l},useId:function(){var n=Oi(),r=mn.identifierPrefix;if(Xt){var l=Ji,h=Qi;l=(h&~(1<<32-ht(h)-1)).toString(32)+l,r=":"+r+"R"+l,l=ca++,0<l&&(r+="H"+l.toString(32)),r+=":"}else l=O_++,r=":"+r+"r"+l.toString(32)+":";return n.memoizedState=r},unstable_isNewReconciler:!1},G_={readContext:hi,useCallback:Kp,useContext:hi,useEffect:Zu,useImperativeHandle:$p,useInsertionEffect:qp,useLayoutEffect:Yp,useMemo:Qp,useReducer:qu,useRef:jp,useState:function(){return qu(ua)},useDebugValue:$u,useDeferredValue:function(n){var r=di();return Jp(r,cn.memoizedState,n)},useTransition:function(){var n=qu(ua)[0],r=di().memoizedState;return[n,r]},useMutableSource:zp,useSyncExternalStore:Op,useId:em,unstable_isNewReconciler:!1},W_={readContext:hi,useCallback:Kp,useContext:hi,useEffect:Zu,useImperativeHandle:$p,useInsertionEffect:qp,useLayoutEffect:Yp,useMemo:Qp,useReducer:Yu,useRef:jp,useState:function(){return Yu(ua)},useDebugValue:$u,useDeferredValue:function(n){var r=di();return cn===null?r.memoizedState=n:Jp(r,cn.memoizedState,n)},useTransition:function(){var n=Yu(ua)[0],r=di().memoizedState;return[n,r]},useMutableSource:zp,useSyncExternalStore:Op,useId:em,unstable_isNewReconciler:!1};function Si(n,r){if(n&&n.defaultProps){r=oe({},r),n=n.defaultProps;for(var l in n)r[l]===void 0&&(r[l]=n[l]);return r}return r}function Ku(n,r,l,h){r=n.memoizedState,l=l(h,r),l=l==null?r:oe({},r,l),n.memoizedState=l,n.lanes===0&&(n.updateQueue.baseState=l)}var Cl={isMounted:function(n){return(n=n._reactInternals)?Di(n)===n:!1},enqueueSetState:function(n,r,l){n=n._reactInternals;var h=zn(),g=zr(n),M=tr(h,g);M.payload=r,l!=null&&(M.callback=l),r=Nr(n,M,g),r!==null&&(wi(r,n,g,h),xl(r,n,g))},enqueueReplaceState:function(n,r,l){n=n._reactInternals;var h=zn(),g=zr(n),M=tr(h,g);M.tag=1,M.payload=r,l!=null&&(M.callback=l),r=Nr(n,M,g),r!==null&&(wi(r,n,g,h),xl(r,n,g))},enqueueForceUpdate:function(n,r){n=n._reactInternals;var l=zn(),h=zr(n),g=tr(l,h);g.tag=2,r!=null&&(g.callback=r),r=Nr(n,g,h),r!==null&&(wi(r,n,h,l),xl(r,n,h))}};function rm(n,r,l,h,g,M,R){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(h,M,R):r.prototype&&r.prototype.isPureReactComponent?!Ko(l,h)||!Ko(g,M):!0}function sm(n,r,l){var h=!1,g=Pr,M=r.contextType;return typeof M=="object"&&M!==null?M=hi(M):(g=Gn(r)?ns:wn.current,h=r.contextTypes,M=(h=h!=null)?qs(n,g):Pr),r=new r(l,M),n.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Cl,n.stateNode=r,r._reactInternals=n,h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=g,n.__reactInternalMemoizedMaskedChildContext=M),r}function om(n,r,l,h){n=r.state,typeof r.componentWillReceiveProps=="function"&&r.componentWillReceiveProps(l,h),typeof r.UNSAFE_componentWillReceiveProps=="function"&&r.UNSAFE_componentWillReceiveProps(l,h),r.state!==n&&Cl.enqueueReplaceState(r,r.state,null)}function Qu(n,r,l,h){var g=n.stateNode;g.props=l,g.state=n.memoizedState,g.refs={},Ou(n);var M=r.contextType;typeof M=="object"&&M!==null?g.context=hi(M):(M=Gn(r)?ns:wn.current,g.context=qs(n,M)),g.state=n.memoizedState,M=r.getDerivedStateFromProps,typeof M=="function"&&(Ku(n,r,M,l),g.state=n.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof g.getSnapshotBeforeUpdate=="function"||typeof g.UNSAFE_componentWillMount!="function"&&typeof g.componentWillMount!="function"||(r=g.state,typeof g.componentWillMount=="function"&&g.componentWillMount(),typeof g.UNSAFE_componentWillMount=="function"&&g.UNSAFE_componentWillMount(),r!==g.state&&Cl.enqueueReplaceState(g,g.state,null),yl(n,l,g,h),g.state=n.memoizedState),typeof g.componentDidMount=="function"&&(n.flags|=4194308)}function to(n,r){try{var l="",h=r;do l+=fe(h),h=h.return;while(h);var g=l}catch(M){g=`
Error generating stack: `+M.message+`
`+M.stack}return{value:n,source:r,stack:g,digest:null}}function Ju(n,r,l){return{value:n,source:null,stack:l??null,digest:r??null}}function eh(n,r){try{console.error(r.value)}catch(l){setTimeout(function(){throw l})}}var j_=typeof WeakMap=="function"?WeakMap:Map;function am(n,r,l){l=tr(-1,l),l.tag=3,l.payload={element:null};var h=r.value;return l.callback=function(){Dl||(Dl=!0,mh=h),eh(n,r)},l}function lm(n,r,l){l=tr(-1,l),l.tag=3;var h=n.type.getDerivedStateFromError;if(typeof h=="function"){var g=r.value;l.payload=function(){return h(g)},l.callback=function(){eh(n,r)}}var M=n.stateNode;return M!==null&&typeof M.componentDidCatch=="function"&&(l.callback=function(){eh(n,r),typeof h!="function"&&(Ur===null?Ur=new Set([this]):Ur.add(this));var R=r.stack;this.componentDidCatch(r.value,{componentStack:R!==null?R:""})}),l}function cm(n,r,l){var h=n.pingCache;if(h===null){h=n.pingCache=new j_;var g=new Set;h.set(r,g)}else g=h.get(r),g===void 0&&(g=new Set,h.set(r,g));g.has(l)||(g.add(l),n=sx.bind(null,n,r,l),r.then(n,n))}function um(n){do{var r;if((r=n.tag===13)&&(r=n.memoizedState,r=r!==null?r.dehydrated!==null:!0),r)return n;n=n.return}while(n!==null);return null}function hm(n,r,l,h,g){return(n.mode&1)===0?(n===r?n.flags|=65536:(n.flags|=128,l.flags|=131072,l.flags&=-52805,l.tag===1&&(l.alternate===null?l.tag=17:(r=tr(-1,1),r.tag=2,Nr(l,r,1))),l.lanes|=1),n):(n.flags|=65536,n.lanes=g,n)}var X_=T.ReactCurrentOwner,Wn=!1;function Fn(n,r,l,h){r.child=n===null?Lp(r,null,l,h):Ks(r,n.child,l,h)}function dm(n,r,l,h,g){l=l.render;var M=r.ref;return Js(r,g),h=ju(n,r,l,h,M,g),l=Xu(),n!==null&&!Wn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~g,nr(n,r,g)):(Xt&&l&&Ru(r),r.flags|=1,Fn(n,r,h,g),r.child)}function fm(n,r,l,h,g){if(n===null){var M=l.type;return typeof M=="function"&&!Mh(M)&&M.defaultProps===void 0&&l.compare===null&&l.defaultProps===void 0?(r.tag=15,r.type=M,pm(n,r,M,h,g)):(n=kl(l.type,null,h,r,r.mode,g),n.ref=r.ref,n.return=r,r.child=n)}if(M=n.child,(n.lanes&g)===0){var R=M.memoizedProps;if(l=l.compare,l=l!==null?l:Ko,l(R,h)&&n.ref===r.ref)return nr(n,r,g)}return r.flags|=1,n=Br(M,h),n.ref=r.ref,n.return=r,r.child=n}function pm(n,r,l,h,g){if(n!==null){var M=n.memoizedProps;if(Ko(M,h)&&n.ref===r.ref)if(Wn=!1,r.pendingProps=h=M,(n.lanes&g)!==0)(n.flags&131072)!==0&&(Wn=!0);else return r.lanes=n.lanes,nr(n,r,g)}return th(n,r,l,h,g)}function mm(n,r,l){var h=r.pendingProps,g=h.children,M=n!==null?n.memoizedState:null;if(h.mode==="hidden")if((r.mode&1)===0)r.memoizedState={baseLanes:0,cachePool:null,transitions:null},kt(io,ni),ni|=l;else{if((l&1073741824)===0)return n=M!==null?M.baseLanes|l:l,r.lanes=r.childLanes=1073741824,r.memoizedState={baseLanes:n,cachePool:null,transitions:null},r.updateQueue=null,kt(io,ni),ni|=n,null;r.memoizedState={baseLanes:0,cachePool:null,transitions:null},h=M!==null?M.baseLanes:l,kt(io,ni),ni|=h}else M!==null?(h=M.baseLanes|l,r.memoizedState=null):h=l,kt(io,ni),ni|=h;return Fn(n,r,g,l),r.child}function gm(n,r){var l=r.ref;(n===null&&l!==null||n!==null&&n.ref!==l)&&(r.flags|=512,r.flags|=2097152)}function th(n,r,l,h,g){var M=Gn(l)?ns:wn.current;return M=qs(r,M),Js(r,g),l=ju(n,r,l,h,M,g),h=Xu(),n!==null&&!Wn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~g,nr(n,r,g)):(Xt&&h&&Ru(r),r.flags|=1,Fn(n,r,l,g),r.child)}function vm(n,r,l,h,g){if(Gn(l)){var M=!0;hl(r)}else M=!1;if(Js(r,g),r.stateNode===null)bl(n,r),sm(r,l,h),Qu(r,l,h,g),h=!0;else if(n===null){var R=r.stateNode,V=r.memoizedProps;R.props=V;var Z=R.context,ce=l.contextType;typeof ce=="object"&&ce!==null?ce=hi(ce):(ce=Gn(l)?ns:wn.current,ce=qs(r,ce));var ye=l.getDerivedStateFromProps,Se=typeof ye=="function"||typeof R.getSnapshotBeforeUpdate=="function";Se||typeof R.UNSAFE_componentWillReceiveProps!="function"&&typeof R.componentWillReceiveProps!="function"||(V!==h||Z!==ce)&&om(r,R,h,ce),Ir=!1;var ve=r.memoizedState;R.state=ve,yl(r,h,R,g),Z=r.memoizedState,V!==h||ve!==Z||Vn.current||Ir?(typeof ye=="function"&&(Ku(r,l,ye,h),Z=r.memoizedState),(V=Ir||rm(r,l,V,h,ve,Z,ce))?(Se||typeof R.UNSAFE_componentWillMount!="function"&&typeof R.componentWillMount!="function"||(typeof R.componentWillMount=="function"&&R.componentWillMount(),typeof R.UNSAFE_componentWillMount=="function"&&R.UNSAFE_componentWillMount()),typeof R.componentDidMount=="function"&&(r.flags|=4194308)):(typeof R.componentDidMount=="function"&&(r.flags|=4194308),r.memoizedProps=h,r.memoizedState=Z),R.props=h,R.state=Z,R.context=ce,h=V):(typeof R.componentDidMount=="function"&&(r.flags|=4194308),h=!1)}else{R=r.stateNode,Np(n,r),V=r.memoizedProps,ce=r.type===r.elementType?V:Si(r.type,V),R.props=ce,Se=r.pendingProps,ve=R.context,Z=l.contextType,typeof Z=="object"&&Z!==null?Z=hi(Z):(Z=Gn(l)?ns:wn.current,Z=qs(r,Z));var Ue=l.getDerivedStateFromProps;(ye=typeof Ue=="function"||typeof R.getSnapshotBeforeUpdate=="function")||typeof R.UNSAFE_componentWillReceiveProps!="function"&&typeof R.componentWillReceiveProps!="function"||(V!==Se||ve!==Z)&&om(r,R,h,Z),Ir=!1,ve=r.memoizedState,R.state=ve,yl(r,h,R,g);var Ve=r.memoizedState;V!==Se||ve!==Ve||Vn.current||Ir?(typeof Ue=="function"&&(Ku(r,l,Ue,h),Ve=r.memoizedState),(ce=Ir||rm(r,l,ce,h,ve,Ve,Z)||!1)?(ye||typeof R.UNSAFE_componentWillUpdate!="function"&&typeof R.componentWillUpdate!="function"||(typeof R.componentWillUpdate=="function"&&R.componentWillUpdate(h,Ve,Z),typeof R.UNSAFE_componentWillUpdate=="function"&&R.UNSAFE_componentWillUpdate(h,Ve,Z)),typeof R.componentDidUpdate=="function"&&(r.flags|=4),typeof R.getSnapshotBeforeUpdate=="function"&&(r.flags|=1024)):(typeof R.componentDidUpdate!="function"||V===n.memoizedProps&&ve===n.memoizedState||(r.flags|=4),typeof R.getSnapshotBeforeUpdate!="function"||V===n.memoizedProps&&ve===n.memoizedState||(r.flags|=1024),r.memoizedProps=h,r.memoizedState=Ve),R.props=h,R.state=Ve,R.context=Z,h=ce):(typeof R.componentDidUpdate!="function"||V===n.memoizedProps&&ve===n.memoizedState||(r.flags|=4),typeof R.getSnapshotBeforeUpdate!="function"||V===n.memoizedProps&&ve===n.memoizedState||(r.flags|=1024),h=!1)}return nh(n,r,l,h,M,g)}function nh(n,r,l,h,g,M){gm(n,r);var R=(r.flags&128)!==0;if(!h&&!R)return g&&Mp(r,l,!1),nr(n,r,M);h=r.stateNode,X_.current=r;var V=R&&typeof l.getDerivedStateFromError!="function"?null:h.render();return r.flags|=1,n!==null&&R?(r.child=Ks(r,n.child,null,M),r.child=Ks(r,null,V,M)):Fn(n,r,V,M),r.memoizedState=h.state,g&&Mp(r,l,!0),r.child}function _m(n){var r=n.stateNode;r.pendingContext?yp(n,r.pendingContext,r.pendingContext!==r.context):r.context&&yp(n,r.context,!1),Bu(n,r.containerInfo)}function xm(n,r,l,h,g){return $s(),Iu(g),r.flags|=256,Fn(n,r,l,h),r.child}var ih={dehydrated:null,treeContext:null,retryLane:0};function rh(n){return{baseLanes:n,cachePool:null,transitions:null}}function ym(n,r,l){var h=r.pendingProps,g=Yt.current,M=!1,R=(r.flags&128)!==0,V;if((V=R)||(V=n!==null&&n.memoizedState===null?!1:(g&2)!==0),V?(M=!0,r.flags&=-129):(n===null||n.memoizedState!==null)&&(g|=1),kt(Yt,g&1),n===null)return Lu(r),n=r.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((r.mode&1)===0?r.lanes=1:n.data==="$!"?r.lanes=8:r.lanes=1073741824,null):(R=h.children,n=h.fallback,M?(h=r.mode,M=r.child,R={mode:"hidden",children:R},(h&1)===0&&M!==null?(M.childLanes=0,M.pendingProps=R):M=Hl(R,h,0,null),n=ds(n,h,l,null),M.return=r,n.return=r,M.sibling=n,r.child=M,r.child.memoizedState=rh(l),r.memoizedState=ih,n):sh(r,R));if(g=n.memoizedState,g!==null&&(V=g.dehydrated,V!==null))return q_(n,r,R,h,V,g,l);if(M){M=h.fallback,R=r.mode,g=n.child,V=g.sibling;var Z={mode:"hidden",children:h.children};return(R&1)===0&&r.child!==g?(h=r.child,h.childLanes=0,h.pendingProps=Z,r.deletions=null):(h=Br(g,Z),h.subtreeFlags=g.subtreeFlags&14680064),V!==null?M=Br(V,M):(M=ds(M,R,l,null),M.flags|=2),M.return=r,h.return=r,h.sibling=M,r.child=h,h=M,M=r.child,R=n.child.memoizedState,R=R===null?rh(l):{baseLanes:R.baseLanes|l,cachePool:null,transitions:R.transitions},M.memoizedState=R,M.childLanes=n.childLanes&~l,r.memoizedState=ih,h}return M=n.child,n=M.sibling,h=Br(M,{mode:"visible",children:h.children}),(r.mode&1)===0&&(h.lanes=l),h.return=r,h.sibling=null,n!==null&&(l=r.deletions,l===null?(r.deletions=[n],r.flags|=16):l.push(n)),r.child=h,r.memoizedState=null,h}function sh(n,r){return r=Hl({mode:"visible",children:r},n.mode,0,null),r.return=n,n.child=r}function Rl(n,r,l,h){return h!==null&&Iu(h),Ks(r,n.child,null,l),n=sh(r,r.pendingProps.children),n.flags|=2,r.memoizedState=null,n}function q_(n,r,l,h,g,M,R){if(l)return r.flags&256?(r.flags&=-257,h=Ju(Error(t(422))),Rl(n,r,R,h)):r.memoizedState!==null?(r.child=n.child,r.flags|=128,null):(M=h.fallback,g=r.mode,h=Hl({mode:"visible",children:h.children},g,0,null),M=ds(M,g,R,null),M.flags|=2,h.return=r,M.return=r,h.sibling=M,r.child=h,(r.mode&1)!==0&&Ks(r,n.child,null,R),r.child.memoizedState=rh(R),r.memoizedState=ih,M);if((r.mode&1)===0)return Rl(n,r,R,null);if(g.data==="$!"){if(h=g.nextSibling&&g.nextSibling.dataset,h)var V=h.dgst;return h=V,M=Error(t(419)),h=Ju(M,h,void 0),Rl(n,r,R,h)}if(V=(R&n.childLanes)!==0,Wn||V){if(h=mn,h!==null){switch(R&-R){case 4:g=2;break;case 16:g=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:g=32;break;case 536870912:g=268435456;break;default:g=0}g=(g&(h.suspendedLanes|R))!==0?0:g,g!==0&&g!==M.retryLane&&(M.retryLane=g,er(n,g),wi(h,n,g,-1))}return Sh(),h=Ju(Error(t(421))),Rl(n,r,R,h)}return g.data==="$?"?(r.flags|=128,r.child=n.child,r=ox.bind(null,n),g._reactRetry=r,null):(n=M.treeContext,ti=Rr(g.nextSibling),ei=r,Xt=!0,yi=null,n!==null&&(ci[ui++]=Qi,ci[ui++]=Ji,ci[ui++]=is,Qi=n.id,Ji=n.overflow,is=r),r=sh(r,h.children),r.flags|=4096,r)}function Sm(n,r,l){n.lanes|=r;var h=n.alternate;h!==null&&(h.lanes|=r),Fu(n.return,r,l)}function oh(n,r,l,h,g){var M=n.memoizedState;M===null?n.memoizedState={isBackwards:r,rendering:null,renderingStartTime:0,last:h,tail:l,tailMode:g}:(M.isBackwards=r,M.rendering=null,M.renderingStartTime=0,M.last=h,M.tail=l,M.tailMode=g)}function Mm(n,r,l){var h=r.pendingProps,g=h.revealOrder,M=h.tail;if(Fn(n,r,h.children,l),h=Yt.current,(h&2)!==0)h=h&1|2,r.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=r.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Sm(n,l,r);else if(n.tag===19)Sm(n,l,r);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===r)break e;for(;n.sibling===null;){if(n.return===null||n.return===r)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}h&=1}if(kt(Yt,h),(r.mode&1)===0)r.memoizedState=null;else switch(g){case"forwards":for(l=r.child,g=null;l!==null;)n=l.alternate,n!==null&&Sl(n)===null&&(g=l),l=l.sibling;l=g,l===null?(g=r.child,r.child=null):(g=l.sibling,l.sibling=null),oh(r,!1,g,l,M);break;case"backwards":for(l=null,g=r.child,r.child=null;g!==null;){if(n=g.alternate,n!==null&&Sl(n)===null){r.child=g;break}n=g.sibling,g.sibling=l,l=g,g=n}oh(r,!0,l,null,M);break;case"together":oh(r,!1,null,null,void 0);break;default:r.memoizedState=null}return r.child}function bl(n,r){(r.mode&1)===0&&n!==null&&(n.alternate=null,r.alternate=null,r.flags|=2)}function nr(n,r,l){if(n!==null&&(r.dependencies=n.dependencies),ls|=r.lanes,(l&r.childLanes)===0)return null;if(n!==null&&r.child!==n.child)throw Error(t(153));if(r.child!==null){for(n=r.child,l=Br(n,n.pendingProps),r.child=l,l.return=r;n.sibling!==null;)n=n.sibling,l=l.sibling=Br(n,n.pendingProps),l.return=r;l.sibling=null}return r.child}function Y_(n,r,l){switch(r.tag){case 3:_m(r),$s();break;case 5:Fp(r);break;case 1:Gn(r.type)&&hl(r);break;case 4:Bu(r,r.stateNode.containerInfo);break;case 10:var h=r.type._context,g=r.memoizedProps.value;kt(vl,h._currentValue),h._currentValue=g;break;case 13:if(h=r.memoizedState,h!==null)return h.dehydrated!==null?(kt(Yt,Yt.current&1),r.flags|=128,null):(l&r.child.childLanes)!==0?ym(n,r,l):(kt(Yt,Yt.current&1),n=nr(n,r,l),n!==null?n.sibling:null);kt(Yt,Yt.current&1);break;case 19:if(h=(l&r.childLanes)!==0,(n.flags&128)!==0){if(h)return Mm(n,r,l);r.flags|=128}if(g=r.memoizedState,g!==null&&(g.rendering=null,g.tail=null,g.lastEffect=null),kt(Yt,Yt.current),h)break;return null;case 22:case 23:return r.lanes=0,mm(n,r,l)}return nr(n,r,l)}var Em,ah,wm,Tm;Em=function(n,r){for(var l=r.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===r)break;for(;l.sibling===null;){if(l.return===null||l.return===r)return;l=l.return}l.sibling.return=l.return,l=l.sibling}},ah=function(){},wm=function(n,r,l,h){var g=n.memoizedProps;if(g!==h){n=r.stateNode,os(zi.current);var M=null;switch(l){case"input":g=ne(n,g),h=ne(n,h),M=[];break;case"select":g=oe({},g,{value:void 0}),h=oe({},h,{value:void 0}),M=[];break;case"textarea":g=L(n,g),h=L(n,h),M=[];break;default:typeof g.onClick!="function"&&typeof h.onClick=="function"&&(n.onclick=ll)}_t(l,h);var R;l=null;for(ce in g)if(!h.hasOwnProperty(ce)&&g.hasOwnProperty(ce)&&g[ce]!=null)if(ce==="style"){var V=g[ce];for(R in V)V.hasOwnProperty(R)&&(l||(l={}),l[R]="")}else ce!=="dangerouslySetInnerHTML"&&ce!=="children"&&ce!=="suppressContentEditableWarning"&&ce!=="suppressHydrationWarning"&&ce!=="autoFocus"&&(s.hasOwnProperty(ce)?M||(M=[]):(M=M||[]).push(ce,null));for(ce in h){var Z=h[ce];if(V=g!=null?g[ce]:void 0,h.hasOwnProperty(ce)&&Z!==V&&(Z!=null||V!=null))if(ce==="style")if(V){for(R in V)!V.hasOwnProperty(R)||Z&&Z.hasOwnProperty(R)||(l||(l={}),l[R]="");for(R in Z)Z.hasOwnProperty(R)&&V[R]!==Z[R]&&(l||(l={}),l[R]=Z[R])}else l||(M||(M=[]),M.push(ce,l)),l=Z;else ce==="dangerouslySetInnerHTML"?(Z=Z?Z.__html:void 0,V=V?V.__html:void 0,Z!=null&&V!==Z&&(M=M||[]).push(ce,Z)):ce==="children"?typeof Z!="string"&&typeof Z!="number"||(M=M||[]).push(ce,""+Z):ce!=="suppressContentEditableWarning"&&ce!=="suppressHydrationWarning"&&(s.hasOwnProperty(ce)?(Z!=null&&ce==="onScroll"&&Gt("scroll",n),M||V===Z||(M=[])):(M=M||[]).push(ce,Z))}l&&(M=M||[]).push("style",l);var ce=M;(r.updateQueue=ce)&&(r.flags|=4)}},Tm=function(n,r,l,h){l!==h&&(r.flags|=4)};function da(n,r){if(!Xt)switch(n.tailMode){case"hidden":r=n.tail;for(var l=null;r!==null;)r.alternate!==null&&(l=r),r=r.sibling;l===null?n.tail=null:l.sibling=null;break;case"collapsed":l=n.tail;for(var h=null;l!==null;)l.alternate!==null&&(h=l),l=l.sibling;h===null?r||n.tail===null?n.tail=null:n.tail.sibling=null:h.sibling=null}}function An(n){var r=n.alternate!==null&&n.alternate.child===n.child,l=0,h=0;if(r)for(var g=n.child;g!==null;)l|=g.lanes|g.childLanes,h|=g.subtreeFlags&14680064,h|=g.flags&14680064,g.return=n,g=g.sibling;else for(g=n.child;g!==null;)l|=g.lanes|g.childLanes,h|=g.subtreeFlags,h|=g.flags,g.return=n,g=g.sibling;return n.subtreeFlags|=h,n.childLanes=l,r}function Z_(n,r,l){var h=r.pendingProps;switch(bu(r),r.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return An(r),null;case 1:return Gn(r.type)&&ul(),An(r),null;case 3:return h=r.stateNode,eo(),Wt(Vn),Wt(wn),Vu(),h.pendingContext&&(h.context=h.pendingContext,h.pendingContext=null),(n===null||n.child===null)&&(ml(r)?r.flags|=4:n===null||n.memoizedState.isDehydrated&&(r.flags&256)===0||(r.flags|=1024,yi!==null&&(_h(yi),yi=null))),ah(n,r),An(r),null;case 5:ku(r);var g=os(aa.current);if(l=r.type,n!==null&&r.stateNode!=null)wm(n,r,l,h,g),n.ref!==r.ref&&(r.flags|=512,r.flags|=2097152);else{if(!h){if(r.stateNode===null)throw Error(t(166));return An(r),null}if(n=os(zi.current),ml(r)){h=r.stateNode,l=r.type;var M=r.memoizedProps;switch(h[Fi]=r,h[na]=M,n=(r.mode&1)!==0,l){case"dialog":Gt("cancel",h),Gt("close",h);break;case"iframe":case"object":case"embed":Gt("load",h);break;case"video":case"audio":for(g=0;g<Jo.length;g++)Gt(Jo[g],h);break;case"source":Gt("error",h);break;case"img":case"image":case"link":Gt("error",h),Gt("load",h);break;case"details":Gt("toggle",h);break;case"input":Nn(h,M),Gt("invalid",h);break;case"select":h._wrapperState={wasMultiple:!!M.multiple},Gt("invalid",h);break;case"textarea":le(h,M),Gt("invalid",h)}_t(l,M),g=null;for(var R in M)if(M.hasOwnProperty(R)){var V=M[R];R==="children"?typeof V=="string"?h.textContent!==V&&(M.suppressHydrationWarning!==!0&&al(h.textContent,V,n),g=["children",V]):typeof V=="number"&&h.textContent!==""+V&&(M.suppressHydrationWarning!==!0&&al(h.textContent,V,n),g=["children",""+V]):s.hasOwnProperty(R)&&V!=null&&R==="onScroll"&&Gt("scroll",h)}switch(l){case"input":Dt(h),Je(h,M,!0);break;case"textarea":Dt(h),xe(h);break;case"select":case"option":break;default:typeof M.onClick=="function"&&(h.onclick=ll)}h=g,r.updateQueue=h,h!==null&&(r.flags|=4)}else{R=g.nodeType===9?g:g.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=pe(l)),n==="http://www.w3.org/1999/xhtml"?l==="script"?(n=R.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof h.is=="string"?n=R.createElement(l,{is:h.is}):(n=R.createElement(l),l==="select"&&(R=n,h.multiple?R.multiple=!0:h.size&&(R.size=h.size))):n=R.createElementNS(n,l),n[Fi]=r,n[na]=h,Em(n,r,!1,!1),r.stateNode=n;e:{switch(R=ct(l,h),l){case"dialog":Gt("cancel",n),Gt("close",n),g=h;break;case"iframe":case"object":case"embed":Gt("load",n),g=h;break;case"video":case"audio":for(g=0;g<Jo.length;g++)Gt(Jo[g],n);g=h;break;case"source":Gt("error",n),g=h;break;case"img":case"image":case"link":Gt("error",n),Gt("load",n),g=h;break;case"details":Gt("toggle",n),g=h;break;case"input":Nn(n,h),g=ne(n,h),Gt("invalid",n);break;case"option":g=h;break;case"select":n._wrapperState={wasMultiple:!!h.multiple},g=oe({},h,{value:void 0}),Gt("invalid",n);break;case"textarea":le(n,h),g=L(n,h),Gt("invalid",n);break;default:g=h}_t(l,g),V=g;for(M in V)if(V.hasOwnProperty(M)){var Z=V[M];M==="style"?rt(n,Z):M==="dangerouslySetInnerHTML"?(Z=Z?Z.__html:void 0,Z!=null&&Oe(n,Z)):M==="children"?typeof Z=="string"?(l!=="textarea"||Z!=="")&&mt(n,Z):typeof Z=="number"&&mt(n,""+Z):M!=="suppressContentEditableWarning"&&M!=="suppressHydrationWarning"&&M!=="autoFocus"&&(s.hasOwnProperty(M)?Z!=null&&M==="onScroll"&&Gt("scroll",n):Z!=null&&A(n,M,Z,R))}switch(l){case"input":Dt(n),Je(n,h,!1);break;case"textarea":Dt(n),xe(n);break;case"option":h.value!=null&&n.setAttribute("value",""+Ce(h.value));break;case"select":n.multiple=!!h.multiple,M=h.value,M!=null?F(n,!!h.multiple,M,!1):h.defaultValue!=null&&F(n,!!h.multiple,h.defaultValue,!0);break;default:typeof g.onClick=="function"&&(n.onclick=ll)}switch(l){case"button":case"input":case"select":case"textarea":h=!!h.autoFocus;break e;case"img":h=!0;break e;default:h=!1}}h&&(r.flags|=4)}r.ref!==null&&(r.flags|=512,r.flags|=2097152)}return An(r),null;case 6:if(n&&r.stateNode!=null)Tm(n,r,n.memoizedProps,h);else{if(typeof h!="string"&&r.stateNode===null)throw Error(t(166));if(l=os(aa.current),os(zi.current),ml(r)){if(h=r.stateNode,l=r.memoizedProps,h[Fi]=r,(M=h.nodeValue!==l)&&(n=ei,n!==null))switch(n.tag){case 3:al(h.nodeValue,l,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&al(h.nodeValue,l,(n.mode&1)!==0)}M&&(r.flags|=4)}else h=(l.nodeType===9?l:l.ownerDocument).createTextNode(h),h[Fi]=r,r.stateNode=h}return An(r),null;case 13:if(Wt(Yt),h=r.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Xt&&ti!==null&&(r.mode&1)!==0&&(r.flags&128)===0)Rp(),$s(),r.flags|=98560,M=!1;else if(M=ml(r),h!==null&&h.dehydrated!==null){if(n===null){if(!M)throw Error(t(318));if(M=r.memoizedState,M=M!==null?M.dehydrated:null,!M)throw Error(t(317));M[Fi]=r}else $s(),(r.flags&128)===0&&(r.memoizedState=null),r.flags|=4;An(r),M=!1}else yi!==null&&(_h(yi),yi=null),M=!0;if(!M)return r.flags&65536?r:null}return(r.flags&128)!==0?(r.lanes=l,r):(h=h!==null,h!==(n!==null&&n.memoizedState!==null)&&h&&(r.child.flags|=8192,(r.mode&1)!==0&&(n===null||(Yt.current&1)!==0?un===0&&(un=3):Sh())),r.updateQueue!==null&&(r.flags|=4),An(r),null);case 4:return eo(),ah(n,r),n===null&&ea(r.stateNode.containerInfo),An(r),null;case 10:return Uu(r.type._context),An(r),null;case 17:return Gn(r.type)&&ul(),An(r),null;case 19:if(Wt(Yt),M=r.memoizedState,M===null)return An(r),null;if(h=(r.flags&128)!==0,R=M.rendering,R===null)if(h)da(M,!1);else{if(un!==0||n!==null&&(n.flags&128)!==0)for(n=r.child;n!==null;){if(R=Sl(n),R!==null){for(r.flags|=128,da(M,!1),h=R.updateQueue,h!==null&&(r.updateQueue=h,r.flags|=4),r.subtreeFlags=0,h=l,l=r.child;l!==null;)M=l,n=h,M.flags&=14680066,R=M.alternate,R===null?(M.childLanes=0,M.lanes=n,M.child=null,M.subtreeFlags=0,M.memoizedProps=null,M.memoizedState=null,M.updateQueue=null,M.dependencies=null,M.stateNode=null):(M.childLanes=R.childLanes,M.lanes=R.lanes,M.child=R.child,M.subtreeFlags=0,M.deletions=null,M.memoizedProps=R.memoizedProps,M.memoizedState=R.memoizedState,M.updateQueue=R.updateQueue,M.type=R.type,n=R.dependencies,M.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),l=l.sibling;return kt(Yt,Yt.current&1|2),r.child}n=n.sibling}M.tail!==null&&we()>ro&&(r.flags|=128,h=!0,da(M,!1),r.lanes=4194304)}else{if(!h)if(n=Sl(R),n!==null){if(r.flags|=128,h=!0,l=n.updateQueue,l!==null&&(r.updateQueue=l,r.flags|=4),da(M,!0),M.tail===null&&M.tailMode==="hidden"&&!R.alternate&&!Xt)return An(r),null}else 2*we()-M.renderingStartTime>ro&&l!==1073741824&&(r.flags|=128,h=!0,da(M,!1),r.lanes=4194304);M.isBackwards?(R.sibling=r.child,r.child=R):(l=M.last,l!==null?l.sibling=R:r.child=R,M.last=R)}return M.tail!==null?(r=M.tail,M.rendering=r,M.tail=r.sibling,M.renderingStartTime=we(),r.sibling=null,l=Yt.current,kt(Yt,h?l&1|2:l&1),r):(An(r),null);case 22:case 23:return yh(),h=r.memoizedState!==null,n!==null&&n.memoizedState!==null!==h&&(r.flags|=8192),h&&(r.mode&1)!==0?(ni&1073741824)!==0&&(An(r),r.subtreeFlags&6&&(r.flags|=8192)):An(r),null;case 24:return null;case 25:return null}throw Error(t(156,r.tag))}function $_(n,r){switch(bu(r),r.tag){case 1:return Gn(r.type)&&ul(),n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 3:return eo(),Wt(Vn),Wt(wn),Vu(),n=r.flags,(n&65536)!==0&&(n&128)===0?(r.flags=n&-65537|128,r):null;case 5:return ku(r),null;case 13:if(Wt(Yt),n=r.memoizedState,n!==null&&n.dehydrated!==null){if(r.alternate===null)throw Error(t(340));$s()}return n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 19:return Wt(Yt),null;case 4:return eo(),null;case 10:return Uu(r.type._context),null;case 22:case 23:return yh(),null;case 24:return null;default:return null}}var Pl=!1,Cn=!1,K_=typeof WeakSet=="function"?WeakSet:Set,Be=null;function no(n,r){var l=n.ref;if(l!==null)if(typeof l=="function")try{l(null)}catch(h){Kt(n,r,h)}else l.current=null}function lh(n,r,l){try{l()}catch(h){Kt(n,r,h)}}var Am=!1;function Q_(n,r){if(yu=$a,n=rp(),du(n)){if("selectionStart"in n)var l={start:n.selectionStart,end:n.selectionEnd};else e:{l=(l=n.ownerDocument)&&l.defaultView||window;var h=l.getSelection&&l.getSelection();if(h&&h.rangeCount!==0){l=h.anchorNode;var g=h.anchorOffset,M=h.focusNode;h=h.focusOffset;try{l.nodeType,M.nodeType}catch{l=null;break e}var R=0,V=-1,Z=-1,ce=0,ye=0,Se=n,ve=null;t:for(;;){for(var Ue;Se!==l||g!==0&&Se.nodeType!==3||(V=R+g),Se!==M||h!==0&&Se.nodeType!==3||(Z=R+h),Se.nodeType===3&&(R+=Se.nodeValue.length),(Ue=Se.firstChild)!==null;)ve=Se,Se=Ue;for(;;){if(Se===n)break t;if(ve===l&&++ce===g&&(V=R),ve===M&&++ye===h&&(Z=R),(Ue=Se.nextSibling)!==null)break;Se=ve,ve=Se.parentNode}Se=Ue}l=V===-1||Z===-1?null:{start:V,end:Z}}else l=null}l=l||{start:0,end:0}}else l=null;for(Su={focusedElem:n,selectionRange:l},$a=!1,Be=r;Be!==null;)if(r=Be,n=r.child,(r.subtreeFlags&1028)!==0&&n!==null)n.return=r,Be=n;else for(;Be!==null;){r=Be;try{var Ve=r.alternate;if((r.flags&1024)!==0)switch(r.tag){case 0:case 11:case 15:break;case 1:if(Ve!==null){var je=Ve.memoizedProps,en=Ve.memoizedState,re=r.stateNode,K=re.getSnapshotBeforeUpdate(r.elementType===r.type?je:Si(r.type,je),en);re.__reactInternalSnapshotBeforeUpdate=K}break;case 3:var ae=r.stateNode.containerInfo;ae.nodeType===1?ae.textContent="":ae.nodeType===9&&ae.documentElement&&ae.removeChild(ae.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Te){Kt(r,r.return,Te)}if(n=r.sibling,n!==null){n.return=r.return,Be=n;break}Be=r.return}return Ve=Am,Am=!1,Ve}function fa(n,r,l){var h=r.updateQueue;if(h=h!==null?h.lastEffect:null,h!==null){var g=h=h.next;do{if((g.tag&n)===n){var M=g.destroy;g.destroy=void 0,M!==void 0&&lh(r,l,M)}g=g.next}while(g!==h)}}function Ll(n,r){if(r=r.updateQueue,r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&n)===n){var h=l.create;l.destroy=h()}l=l.next}while(l!==r)}}function ch(n){var r=n.ref;if(r!==null){var l=n.stateNode;switch(n.tag){case 5:n=l;break;default:n=l}typeof r=="function"?r(n):r.current=n}}function Cm(n){var r=n.alternate;r!==null&&(n.alternate=null,Cm(r)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(r=n.stateNode,r!==null&&(delete r[Fi],delete r[na],delete r[Tu],delete r[D_],delete r[U_])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Rm(n){return n.tag===5||n.tag===3||n.tag===4}function bm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Rm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function uh(n,r,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,r?l.nodeType===8?l.parentNode.insertBefore(n,r):l.insertBefore(n,r):(l.nodeType===8?(r=l.parentNode,r.insertBefore(n,l)):(r=l,r.appendChild(n)),l=l._reactRootContainer,l!=null||r.onclick!==null||(r.onclick=ll));else if(h!==4&&(n=n.child,n!==null))for(uh(n,r,l),n=n.sibling;n!==null;)uh(n,r,l),n=n.sibling}function hh(n,r,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,r?l.insertBefore(n,r):l.appendChild(n);else if(h!==4&&(n=n.child,n!==null))for(hh(n,r,l),n=n.sibling;n!==null;)hh(n,r,l),n=n.sibling}var _n=null,Mi=!1;function Dr(n,r,l){for(l=l.child;l!==null;)Pm(n,r,l),l=l.sibling}function Pm(n,r,l){if(Mt&&typeof Mt.onCommitFiberUnmount=="function")try{Mt.onCommitFiberUnmount(Pt,l)}catch{}switch(l.tag){case 5:Cn||no(l,r);case 6:var h=_n,g=Mi;_n=null,Dr(n,r,l),_n=h,Mi=g,_n!==null&&(Mi?(n=_n,l=l.stateNode,n.nodeType===8?n.parentNode.removeChild(l):n.removeChild(l)):_n.removeChild(l.stateNode));break;case 18:_n!==null&&(Mi?(n=_n,l=l.stateNode,n.nodeType===8?wu(n.parentNode,l):n.nodeType===1&&wu(n,l),jo(n)):wu(_n,l.stateNode));break;case 4:h=_n,g=Mi,_n=l.stateNode.containerInfo,Mi=!0,Dr(n,r,l),_n=h,Mi=g;break;case 0:case 11:case 14:case 15:if(!Cn&&(h=l.updateQueue,h!==null&&(h=h.lastEffect,h!==null))){g=h=h.next;do{var M=g,R=M.destroy;M=M.tag,R!==void 0&&((M&2)!==0||(M&4)!==0)&&lh(l,r,R),g=g.next}while(g!==h)}Dr(n,r,l);break;case 1:if(!Cn&&(no(l,r),h=l.stateNode,typeof h.componentWillUnmount=="function"))try{h.props=l.memoizedProps,h.state=l.memoizedState,h.componentWillUnmount()}catch(V){Kt(l,r,V)}Dr(n,r,l);break;case 21:Dr(n,r,l);break;case 22:l.mode&1?(Cn=(h=Cn)||l.memoizedState!==null,Dr(n,r,l),Cn=h):Dr(n,r,l);break;default:Dr(n,r,l)}}function Lm(n){var r=n.updateQueue;if(r!==null){n.updateQueue=null;var l=n.stateNode;l===null&&(l=n.stateNode=new K_),r.forEach(function(h){var g=ax.bind(null,n,h);l.has(h)||(l.add(h),h.then(g,g))})}}function Ei(n,r){var l=r.deletions;if(l!==null)for(var h=0;h<l.length;h++){var g=l[h];try{var M=n,R=r,V=R;e:for(;V!==null;){switch(V.tag){case 5:_n=V.stateNode,Mi=!1;break e;case 3:_n=V.stateNode.containerInfo,Mi=!0;break e;case 4:_n=V.stateNode.containerInfo,Mi=!0;break e}V=V.return}if(_n===null)throw Error(t(160));Pm(M,R,g),_n=null,Mi=!1;var Z=g.alternate;Z!==null&&(Z.return=null),g.return=null}catch(ce){Kt(g,r,ce)}}if(r.subtreeFlags&12854)for(r=r.child;r!==null;)Im(r,n),r=r.sibling}function Im(n,r){var l=n.alternate,h=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Ei(r,n),Bi(n),h&4){try{fa(3,n,n.return),Ll(3,n)}catch(je){Kt(n,n.return,je)}try{fa(5,n,n.return)}catch(je){Kt(n,n.return,je)}}break;case 1:Ei(r,n),Bi(n),h&512&&l!==null&&no(l,l.return);break;case 5:if(Ei(r,n),Bi(n),h&512&&l!==null&&no(l,l.return),n.flags&32){var g=n.stateNode;try{mt(g,"")}catch(je){Kt(n,n.return,je)}}if(h&4&&(g=n.stateNode,g!=null)){var M=n.memoizedProps,R=l!==null?l.memoizedProps:M,V=n.type,Z=n.updateQueue;if(n.updateQueue=null,Z!==null)try{V==="input"&&M.type==="radio"&&M.name!=null&&yt(g,M),ct(V,R);var ce=ct(V,M);for(R=0;R<Z.length;R+=2){var ye=Z[R],Se=Z[R+1];ye==="style"?rt(g,Se):ye==="dangerouslySetInnerHTML"?Oe(g,Se):ye==="children"?mt(g,Se):A(g,ye,Se,ce)}switch(V){case"input":vt(g,M);break;case"textarea":ge(g,M);break;case"select":var ve=g._wrapperState.wasMultiple;g._wrapperState.wasMultiple=!!M.multiple;var Ue=M.value;Ue!=null?F(g,!!M.multiple,Ue,!1):ve!==!!M.multiple&&(M.defaultValue!=null?F(g,!!M.multiple,M.defaultValue,!0):F(g,!!M.multiple,M.multiple?[]:"",!1))}g[na]=M}catch(je){Kt(n,n.return,je)}}break;case 6:if(Ei(r,n),Bi(n),h&4){if(n.stateNode===null)throw Error(t(162));g=n.stateNode,M=n.memoizedProps;try{g.nodeValue=M}catch(je){Kt(n,n.return,je)}}break;case 3:if(Ei(r,n),Bi(n),h&4&&l!==null&&l.memoizedState.isDehydrated)try{jo(r.containerInfo)}catch(je){Kt(n,n.return,je)}break;case 4:Ei(r,n),Bi(n);break;case 13:Ei(r,n),Bi(n),g=n.child,g.flags&8192&&(M=g.memoizedState!==null,g.stateNode.isHidden=M,!M||g.alternate!==null&&g.alternate.memoizedState!==null||(ph=we())),h&4&&Lm(n);break;case 22:if(ye=l!==null&&l.memoizedState!==null,n.mode&1?(Cn=(ce=Cn)||ye,Ei(r,n),Cn=ce):Ei(r,n),Bi(n),h&8192){if(ce=n.memoizedState!==null,(n.stateNode.isHidden=ce)&&!ye&&(n.mode&1)!==0)for(Be=n,ye=n.child;ye!==null;){for(Se=Be=ye;Be!==null;){switch(ve=Be,Ue=ve.child,ve.tag){case 0:case 11:case 14:case 15:fa(4,ve,ve.return);break;case 1:no(ve,ve.return);var Ve=ve.stateNode;if(typeof Ve.componentWillUnmount=="function"){h=ve,l=ve.return;try{r=h,Ve.props=r.memoizedProps,Ve.state=r.memoizedState,Ve.componentWillUnmount()}catch(je){Kt(h,l,je)}}break;case 5:no(ve,ve.return);break;case 22:if(ve.memoizedState!==null){Um(Se);continue}}Ue!==null?(Ue.return=ve,Be=Ue):Um(Se)}ye=ye.sibling}e:for(ye=null,Se=n;;){if(Se.tag===5){if(ye===null){ye=Se;try{g=Se.stateNode,ce?(M=g.style,typeof M.setProperty=="function"?M.setProperty("display","none","important"):M.display="none"):(V=Se.stateNode,Z=Se.memoizedProps.style,R=Z!=null&&Z.hasOwnProperty("display")?Z.display:null,V.style.display=it("display",R))}catch(je){Kt(n,n.return,je)}}}else if(Se.tag===6){if(ye===null)try{Se.stateNode.nodeValue=ce?"":Se.memoizedProps}catch(je){Kt(n,n.return,je)}}else if((Se.tag!==22&&Se.tag!==23||Se.memoizedState===null||Se===n)&&Se.child!==null){Se.child.return=Se,Se=Se.child;continue}if(Se===n)break e;for(;Se.sibling===null;){if(Se.return===null||Se.return===n)break e;ye===Se&&(ye=null),Se=Se.return}ye===Se&&(ye=null),Se.sibling.return=Se.return,Se=Se.sibling}}break;case 19:Ei(r,n),Bi(n),h&4&&Lm(n);break;case 21:break;default:Ei(r,n),Bi(n)}}function Bi(n){var r=n.flags;if(r&2){try{e:{for(var l=n.return;l!==null;){if(Rm(l)){var h=l;break e}l=l.return}throw Error(t(160))}switch(h.tag){case 5:var g=h.stateNode;h.flags&32&&(mt(g,""),h.flags&=-33);var M=bm(n);hh(n,M,g);break;case 3:case 4:var R=h.stateNode.containerInfo,V=bm(n);uh(n,V,R);break;default:throw Error(t(161))}}catch(Z){Kt(n,n.return,Z)}n.flags&=-3}r&4096&&(n.flags&=-4097)}function J_(n,r,l){Be=n,Nm(n)}function Nm(n,r,l){for(var h=(n.mode&1)!==0;Be!==null;){var g=Be,M=g.child;if(g.tag===22&&h){var R=g.memoizedState!==null||Pl;if(!R){var V=g.alternate,Z=V!==null&&V.memoizedState!==null||Cn;V=Pl;var ce=Cn;if(Pl=R,(Cn=Z)&&!ce)for(Be=g;Be!==null;)R=Be,Z=R.child,R.tag===22&&R.memoizedState!==null?Fm(g):Z!==null?(Z.return=R,Be=Z):Fm(g);for(;M!==null;)Be=M,Nm(M),M=M.sibling;Be=g,Pl=V,Cn=ce}Dm(n)}else(g.subtreeFlags&8772)!==0&&M!==null?(M.return=g,Be=M):Dm(n)}}function Dm(n){for(;Be!==null;){var r=Be;if((r.flags&8772)!==0){var l=r.alternate;try{if((r.flags&8772)!==0)switch(r.tag){case 0:case 11:case 15:Cn||Ll(5,r);break;case 1:var h=r.stateNode;if(r.flags&4&&!Cn)if(l===null)h.componentDidMount();else{var g=r.elementType===r.type?l.memoizedProps:Si(r.type,l.memoizedProps);h.componentDidUpdate(g,l.memoizedState,h.__reactInternalSnapshotBeforeUpdate)}var M=r.updateQueue;M!==null&&Up(r,M,h);break;case 3:var R=r.updateQueue;if(R!==null){if(l=null,r.child!==null)switch(r.child.tag){case 5:l=r.child.stateNode;break;case 1:l=r.child.stateNode}Up(r,R,l)}break;case 5:var V=r.stateNode;if(l===null&&r.flags&4){l=V;var Z=r.memoizedProps;switch(r.type){case"button":case"input":case"select":case"textarea":Z.autoFocus&&l.focus();break;case"img":Z.src&&(l.src=Z.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(r.memoizedState===null){var ce=r.alternate;if(ce!==null){var ye=ce.memoizedState;if(ye!==null){var Se=ye.dehydrated;Se!==null&&jo(Se)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}Cn||r.flags&512&&ch(r)}catch(ve){Kt(r,r.return,ve)}}if(r===n){Be=null;break}if(l=r.sibling,l!==null){l.return=r.return,Be=l;break}Be=r.return}}function Um(n){for(;Be!==null;){var r=Be;if(r===n){Be=null;break}var l=r.sibling;if(l!==null){l.return=r.return,Be=l;break}Be=r.return}}function Fm(n){for(;Be!==null;){var r=Be;try{switch(r.tag){case 0:case 11:case 15:var l=r.return;try{Ll(4,r)}catch(Z){Kt(r,l,Z)}break;case 1:var h=r.stateNode;if(typeof h.componentDidMount=="function"){var g=r.return;try{h.componentDidMount()}catch(Z){Kt(r,g,Z)}}var M=r.return;try{ch(r)}catch(Z){Kt(r,M,Z)}break;case 5:var R=r.return;try{ch(r)}catch(Z){Kt(r,R,Z)}}}catch(Z){Kt(r,r.return,Z)}if(r===n){Be=null;break}var V=r.sibling;if(V!==null){V.return=r.return,Be=V;break}Be=r.return}}var ex=Math.ceil,Il=T.ReactCurrentDispatcher,dh=T.ReactCurrentOwner,fi=T.ReactCurrentBatchConfig,At=0,mn=null,tn=null,xn=0,ni=0,io=br(0),un=0,pa=null,ls=0,Nl=0,fh=0,ma=null,jn=null,ph=0,ro=1/0,ir=null,Dl=!1,mh=null,Ur=null,Ul=!1,Fr=null,Fl=0,ga=0,gh=null,zl=-1,Ol=0;function zn(){return(At&6)!==0?we():zl!==-1?zl:zl=we()}function zr(n){return(n.mode&1)===0?1:(At&2)!==0&&xn!==0?xn&-xn:z_.transition!==null?(Ol===0&&(Ol=Un()),Ol):(n=Nt,n!==0||(n=window.event,n=n===void 0?16:Of(n.type)),n)}function wi(n,r,l,h){if(50<ga)throw ga=0,gh=null,Error(t(185));Hn(n,l,h),((At&2)===0||n!==mn)&&(n===mn&&((At&2)===0&&(Nl|=l),un===4&&Or(n,xn)),Xn(n,h),l===1&&At===0&&(r.mode&1)===0&&(ro=we()+500,dl&&Lr()))}function Xn(n,r){var l=n.callbackNode;ai(n,r);var h=Ui(n,n===mn?xn:0);if(h===0)l!==null&&he(l),n.callbackNode=null,n.callbackPriority=0;else if(r=h&-h,n.callbackPriority!==r){if(l!=null&&he(l),r===1)n.tag===0?F_(Om.bind(null,n)):Ep(Om.bind(null,n)),I_(function(){(At&6)===0&&Lr()}),l=null;else{switch(Pf(h)){case 1:l=We;break;case 4:l=st;break;case 16:l=lt;break;case 536870912:l=wt;break;default:l=lt}l=Xm(l,zm.bind(null,n))}n.callbackPriority=r,n.callbackNode=l}}function zm(n,r){if(zl=-1,Ol=0,(At&6)!==0)throw Error(t(327));var l=n.callbackNode;if(so()&&n.callbackNode!==l)return null;var h=Ui(n,n===mn?xn:0);if(h===0)return null;if((h&30)!==0||(h&n.expiredLanes)!==0||r)r=Bl(n,h);else{r=h;var g=At;At|=2;var M=km();(mn!==n||xn!==r)&&(ir=null,ro=we()+500,us(n,r));do try{ix();break}catch(V){Bm(n,V)}while(!0);Du(),Il.current=M,At=g,tn!==null?r=0:(mn=null,xn=0,r=un)}if(r!==0){if(r===2&&(g=Zi(n),g!==0&&(h=g,r=vh(n,g))),r===1)throw l=pa,us(n,0),Or(n,h),Xn(n,we()),l;if(r===6)Or(n,h);else{if(g=n.current.alternate,(h&30)===0&&!tx(g)&&(r=Bl(n,h),r===2&&(M=Zi(n),M!==0&&(h=M,r=vh(n,M))),r===1))throw l=pa,us(n,0),Or(n,h),Xn(n,we()),l;switch(n.finishedWork=g,n.finishedLanes=h,r){case 0:case 1:throw Error(t(345));case 2:hs(n,jn,ir);break;case 3:if(Or(n,h),(h&130023424)===h&&(r=ph+500-we(),10<r)){if(Ui(n,0)!==0)break;if(g=n.suspendedLanes,(g&h)!==h){zn(),n.pingedLanes|=n.suspendedLanes&g;break}n.timeoutHandle=Eu(hs.bind(null,n,jn,ir),r);break}hs(n,jn,ir);break;case 4:if(Or(n,h),(h&4194240)===h)break;for(r=n.eventTimes,g=-1;0<h;){var R=31-ht(h);M=1<<R,R=r[R],R>g&&(g=R),h&=~M}if(h=g,h=we()-h,h=(120>h?120:480>h?480:1080>h?1080:1920>h?1920:3e3>h?3e3:4320>h?4320:1960*ex(h/1960))-h,10<h){n.timeoutHandle=Eu(hs.bind(null,n,jn,ir),h);break}hs(n,jn,ir);break;case 5:hs(n,jn,ir);break;default:throw Error(t(329))}}}return Xn(n,we()),n.callbackNode===l?zm.bind(null,n):null}function vh(n,r){var l=ma;return n.current.memoizedState.isDehydrated&&(us(n,r).flags|=256),n=Bl(n,r),n!==2&&(r=jn,jn=l,r!==null&&_h(r)),n}function _h(n){jn===null?jn=n:jn.push.apply(jn,n)}function tx(n){for(var r=n;;){if(r.flags&16384){var l=r.updateQueue;if(l!==null&&(l=l.stores,l!==null))for(var h=0;h<l.length;h++){var g=l[h],M=g.getSnapshot;g=g.value;try{if(!xi(M(),g))return!1}catch{return!1}}}if(l=r.child,r.subtreeFlags&16384&&l!==null)l.return=r,r=l;else{if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return!0;r=r.return}r.sibling.return=r.return,r=r.sibling}}return!0}function Or(n,r){for(r&=~fh,r&=~Nl,n.suspendedLanes|=r,n.pingedLanes&=~r,n=n.expirationTimes;0<r;){var l=31-ht(r),h=1<<l;n[l]=-1,r&=~h}}function Om(n){if((At&6)!==0)throw Error(t(327));so();var r=Ui(n,0);if((r&1)===0)return Xn(n,we()),null;var l=Bl(n,r);if(n.tag!==0&&l===2){var h=Zi(n);h!==0&&(r=h,l=vh(n,h))}if(l===1)throw l=pa,us(n,0),Or(n,r),Xn(n,we()),l;if(l===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=r,hs(n,jn,ir),Xn(n,we()),null}function xh(n,r){var l=At;At|=1;try{return n(r)}finally{At=l,At===0&&(ro=we()+500,dl&&Lr())}}function cs(n){Fr!==null&&Fr.tag===0&&(At&6)===0&&so();var r=At;At|=1;var l=fi.transition,h=Nt;try{if(fi.transition=null,Nt=1,n)return n()}finally{Nt=h,fi.transition=l,At=r,(At&6)===0&&Lr()}}function yh(){ni=io.current,Wt(io)}function us(n,r){n.finishedWork=null,n.finishedLanes=0;var l=n.timeoutHandle;if(l!==-1&&(n.timeoutHandle=-1,L_(l)),tn!==null)for(l=tn.return;l!==null;){var h=l;switch(bu(h),h.tag){case 1:h=h.type.childContextTypes,h!=null&&ul();break;case 3:eo(),Wt(Vn),Wt(wn),Vu();break;case 5:ku(h);break;case 4:eo();break;case 13:Wt(Yt);break;case 19:Wt(Yt);break;case 10:Uu(h.type._context);break;case 22:case 23:yh()}l=l.return}if(mn=n,tn=n=Br(n.current,null),xn=ni=r,un=0,pa=null,fh=Nl=ls=0,jn=ma=null,ss!==null){for(r=0;r<ss.length;r++)if(l=ss[r],h=l.interleaved,h!==null){l.interleaved=null;var g=h.next,M=l.pending;if(M!==null){var R=M.next;M.next=g,h.next=R}l.pending=h}ss=null}return n}function Bm(n,r){do{var l=tn;try{if(Du(),Ml.current=Al,El){for(var h=Zt.memoizedState;h!==null;){var g=h.queue;g!==null&&(g.pending=null),h=h.next}El=!1}if(as=0,pn=cn=Zt=null,la=!1,ca=0,dh.current=null,l===null||l.return===null){un=1,pa=r,tn=null;break}e:{var M=n,R=l.return,V=l,Z=r;if(r=xn,V.flags|=32768,Z!==null&&typeof Z=="object"&&typeof Z.then=="function"){var ce=Z,ye=V,Se=ye.tag;if((ye.mode&1)===0&&(Se===0||Se===11||Se===15)){var ve=ye.alternate;ve?(ye.updateQueue=ve.updateQueue,ye.memoizedState=ve.memoizedState,ye.lanes=ve.lanes):(ye.updateQueue=null,ye.memoizedState=null)}var Ue=um(R);if(Ue!==null){Ue.flags&=-257,hm(Ue,R,V,M,r),Ue.mode&1&&cm(M,ce,r),r=Ue,Z=ce;var Ve=r.updateQueue;if(Ve===null){var je=new Set;je.add(Z),r.updateQueue=je}else Ve.add(Z);break e}else{if((r&1)===0){cm(M,ce,r),Sh();break e}Z=Error(t(426))}}else if(Xt&&V.mode&1){var en=um(R);if(en!==null){(en.flags&65536)===0&&(en.flags|=256),hm(en,R,V,M,r),Iu(to(Z,V));break e}}M=Z=to(Z,V),un!==4&&(un=2),ma===null?ma=[M]:ma.push(M),M=R;do{switch(M.tag){case 3:M.flags|=65536,r&=-r,M.lanes|=r;var re=am(M,Z,r);Dp(M,re);break e;case 1:V=Z;var K=M.type,ae=M.stateNode;if((M.flags&128)===0&&(typeof K.getDerivedStateFromError=="function"||ae!==null&&typeof ae.componentDidCatch=="function"&&(Ur===null||!Ur.has(ae)))){M.flags|=65536,r&=-r,M.lanes|=r;var Te=lm(M,V,r);Dp(M,Te);break e}}M=M.return}while(M!==null)}Vm(l)}catch($e){r=$e,tn===l&&l!==null&&(tn=l=l.return);continue}break}while(!0)}function km(){var n=Il.current;return Il.current=Al,n===null?Al:n}function Sh(){(un===0||un===3||un===2)&&(un=4),mn===null||(ls&268435455)===0&&(Nl&268435455)===0||Or(mn,xn)}function Bl(n,r){var l=At;At|=2;var h=km();(mn!==n||xn!==r)&&(ir=null,us(n,r));do try{nx();break}catch(g){Bm(n,g)}while(!0);if(Du(),At=l,Il.current=h,tn!==null)throw Error(t(261));return mn=null,xn=0,un}function nx(){for(;tn!==null;)Hm(tn)}function ix(){for(;tn!==null&&!te();)Hm(tn)}function Hm(n){var r=jm(n.alternate,n,ni);n.memoizedProps=n.pendingProps,r===null?Vm(n):tn=r,dh.current=null}function Vm(n){var r=n;do{var l=r.alternate;if(n=r.return,(r.flags&32768)===0){if(l=Z_(l,r,ni),l!==null){tn=l;return}}else{if(l=$_(l,r),l!==null){l.flags&=32767,tn=l;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{un=6,tn=null;return}}if(r=r.sibling,r!==null){tn=r;return}tn=r=n}while(r!==null);un===0&&(un=5)}function hs(n,r,l){var h=Nt,g=fi.transition;try{fi.transition=null,Nt=1,rx(n,r,l,h)}finally{fi.transition=g,Nt=h}return null}function rx(n,r,l,h){do so();while(Fr!==null);if((At&6)!==0)throw Error(t(327));l=n.finishedWork;var g=n.finishedLanes;if(l===null)return null;if(n.finishedWork=null,n.finishedLanes=0,l===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var M=l.lanes|l.childLanes;if(qa(n,M),n===mn&&(tn=mn=null,xn=0),(l.subtreeFlags&2064)===0&&(l.flags&2064)===0||Ul||(Ul=!0,Xm(lt,function(){return so(),null})),M=(l.flags&15990)!==0,(l.subtreeFlags&15990)!==0||M){M=fi.transition,fi.transition=null;var R=Nt;Nt=1;var V=At;At|=4,dh.current=null,Q_(n,l),Im(l,n),w_(Su),$a=!!yu,Su=yu=null,n.current=l,J_(l),Ae(),At=V,Nt=R,fi.transition=M}else n.current=l;if(Ul&&(Ul=!1,Fr=n,Fl=g),M=n.pendingLanes,M===0&&(Ur=null),Mn(l.stateNode),Xn(n,we()),r!==null)for(h=n.onRecoverableError,l=0;l<r.length;l++)g=r[l],h(g.value,{componentStack:g.stack,digest:g.digest});if(Dl)throw Dl=!1,n=mh,mh=null,n;return(Fl&1)!==0&&n.tag!==0&&so(),M=n.pendingLanes,(M&1)!==0?n===gh?ga++:(ga=0,gh=n):ga=0,Lr(),null}function so(){if(Fr!==null){var n=Pf(Fl),r=fi.transition,l=Nt;try{if(fi.transition=null,Nt=16>n?16:n,Fr===null)var h=!1;else{if(n=Fr,Fr=null,Fl=0,(At&6)!==0)throw Error(t(331));var g=At;for(At|=4,Be=n.current;Be!==null;){var M=Be,R=M.child;if((Be.flags&16)!==0){var V=M.deletions;if(V!==null){for(var Z=0;Z<V.length;Z++){var ce=V[Z];for(Be=ce;Be!==null;){var ye=Be;switch(ye.tag){case 0:case 11:case 15:fa(8,ye,M)}var Se=ye.child;if(Se!==null)Se.return=ye,Be=Se;else for(;Be!==null;){ye=Be;var ve=ye.sibling,Ue=ye.return;if(Cm(ye),ye===ce){Be=null;break}if(ve!==null){ve.return=Ue,Be=ve;break}Be=Ue}}}var Ve=M.alternate;if(Ve!==null){var je=Ve.child;if(je!==null){Ve.child=null;do{var en=je.sibling;je.sibling=null,je=en}while(je!==null)}}Be=M}}if((M.subtreeFlags&2064)!==0&&R!==null)R.return=M,Be=R;else e:for(;Be!==null;){if(M=Be,(M.flags&2048)!==0)switch(M.tag){case 0:case 11:case 15:fa(9,M,M.return)}var re=M.sibling;if(re!==null){re.return=M.return,Be=re;break e}Be=M.return}}var K=n.current;for(Be=K;Be!==null;){R=Be;var ae=R.child;if((R.subtreeFlags&2064)!==0&&ae!==null)ae.return=R,Be=ae;else e:for(R=K;Be!==null;){if(V=Be,(V.flags&2048)!==0)try{switch(V.tag){case 0:case 11:case 15:Ll(9,V)}}catch($e){Kt(V,V.return,$e)}if(V===R){Be=null;break e}var Te=V.sibling;if(Te!==null){Te.return=V.return,Be=Te;break e}Be=V.return}}if(At=g,Lr(),Mt&&typeof Mt.onPostCommitFiberRoot=="function")try{Mt.onPostCommitFiberRoot(Pt,n)}catch{}h=!0}return h}finally{Nt=l,fi.transition=r}}return!1}function Gm(n,r,l){r=to(l,r),r=am(n,r,1),n=Nr(n,r,1),r=zn(),n!==null&&(Hn(n,1,r),Xn(n,r))}function Kt(n,r,l){if(n.tag===3)Gm(n,n,l);else for(;r!==null;){if(r.tag===3){Gm(r,n,l);break}else if(r.tag===1){var h=r.stateNode;if(typeof r.type.getDerivedStateFromError=="function"||typeof h.componentDidCatch=="function"&&(Ur===null||!Ur.has(h))){n=to(l,n),n=lm(r,n,1),r=Nr(r,n,1),n=zn(),r!==null&&(Hn(r,1,n),Xn(r,n));break}}r=r.return}}function sx(n,r,l){var h=n.pingCache;h!==null&&h.delete(r),r=zn(),n.pingedLanes|=n.suspendedLanes&l,mn===n&&(xn&l)===l&&(un===4||un===3&&(xn&130023424)===xn&&500>we()-ph?us(n,0):fh|=l),Xn(n,r)}function Wm(n,r){r===0&&((n.mode&1)===0?r=1:(r=_i,_i<<=1,(_i&130023424)===0&&(_i=4194304)));var l=zn();n=er(n,r),n!==null&&(Hn(n,r,l),Xn(n,l))}function ox(n){var r=n.memoizedState,l=0;r!==null&&(l=r.retryLane),Wm(n,l)}function ax(n,r){var l=0;switch(n.tag){case 13:var h=n.stateNode,g=n.memoizedState;g!==null&&(l=g.retryLane);break;case 19:h=n.stateNode;break;default:throw Error(t(314))}h!==null&&h.delete(r),Wm(n,l)}var jm;jm=function(n,r,l){if(n!==null)if(n.memoizedProps!==r.pendingProps||Vn.current)Wn=!0;else{if((n.lanes&l)===0&&(r.flags&128)===0)return Wn=!1,Y_(n,r,l);Wn=(n.flags&131072)!==0}else Wn=!1,Xt&&(r.flags&1048576)!==0&&wp(r,pl,r.index);switch(r.lanes=0,r.tag){case 2:var h=r.type;bl(n,r),n=r.pendingProps;var g=qs(r,wn.current);Js(r,l),g=ju(null,r,h,n,g,l);var M=Xu();return r.flags|=1,typeof g=="object"&&g!==null&&typeof g.render=="function"&&g.$$typeof===void 0?(r.tag=1,r.memoizedState=null,r.updateQueue=null,Gn(h)?(M=!0,hl(r)):M=!1,r.memoizedState=g.state!==null&&g.state!==void 0?g.state:null,Ou(r),g.updater=Cl,r.stateNode=g,g._reactInternals=r,Qu(r,h,n,l),r=nh(null,r,h,!0,M,l)):(r.tag=0,Xt&&M&&Ru(r),Fn(null,r,g,l),r=r.child),r;case 16:h=r.elementType;e:{switch(bl(n,r),n=r.pendingProps,g=h._init,h=g(h._payload),r.type=h,g=r.tag=cx(h),n=Si(h,n),g){case 0:r=th(null,r,h,n,l);break e;case 1:r=vm(null,r,h,n,l);break e;case 11:r=dm(null,r,h,n,l);break e;case 14:r=fm(null,r,h,Si(h.type,n),l);break e}throw Error(t(306,h,""))}return r;case 0:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),th(n,r,h,g,l);case 1:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),vm(n,r,h,g,l);case 3:e:{if(_m(r),n===null)throw Error(t(387));h=r.pendingProps,M=r.memoizedState,g=M.element,Np(n,r),yl(r,h,null,l);var R=r.memoizedState;if(h=R.element,M.isDehydrated)if(M={element:h,isDehydrated:!1,cache:R.cache,pendingSuspenseBoundaries:R.pendingSuspenseBoundaries,transitions:R.transitions},r.updateQueue.baseState=M,r.memoizedState=M,r.flags&256){g=to(Error(t(423)),r),r=xm(n,r,h,l,g);break e}else if(h!==g){g=to(Error(t(424)),r),r=xm(n,r,h,l,g);break e}else for(ti=Rr(r.stateNode.containerInfo.firstChild),ei=r,Xt=!0,yi=null,l=Lp(r,null,h,l),r.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling;else{if($s(),h===g){r=nr(n,r,l);break e}Fn(n,r,h,l)}r=r.child}return r;case 5:return Fp(r),n===null&&Lu(r),h=r.type,g=r.pendingProps,M=n!==null?n.memoizedProps:null,R=g.children,Mu(h,g)?R=null:M!==null&&Mu(h,M)&&(r.flags|=32),gm(n,r),Fn(n,r,R,l),r.child;case 6:return n===null&&Lu(r),null;case 13:return ym(n,r,l);case 4:return Bu(r,r.stateNode.containerInfo),h=r.pendingProps,n===null?r.child=Ks(r,null,h,l):Fn(n,r,h,l),r.child;case 11:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),dm(n,r,h,g,l);case 7:return Fn(n,r,r.pendingProps,l),r.child;case 8:return Fn(n,r,r.pendingProps.children,l),r.child;case 12:return Fn(n,r,r.pendingProps.children,l),r.child;case 10:e:{if(h=r.type._context,g=r.pendingProps,M=r.memoizedProps,R=g.value,kt(vl,h._currentValue),h._currentValue=R,M!==null)if(xi(M.value,R)){if(M.children===g.children&&!Vn.current){r=nr(n,r,l);break e}}else for(M=r.child,M!==null&&(M.return=r);M!==null;){var V=M.dependencies;if(V!==null){R=M.child;for(var Z=V.firstContext;Z!==null;){if(Z.context===h){if(M.tag===1){Z=tr(-1,l&-l),Z.tag=2;var ce=M.updateQueue;if(ce!==null){ce=ce.shared;var ye=ce.pending;ye===null?Z.next=Z:(Z.next=ye.next,ye.next=Z),ce.pending=Z}}M.lanes|=l,Z=M.alternate,Z!==null&&(Z.lanes|=l),Fu(M.return,l,r),V.lanes|=l;break}Z=Z.next}}else if(M.tag===10)R=M.type===r.type?null:M.child;else if(M.tag===18){if(R=M.return,R===null)throw Error(t(341));R.lanes|=l,V=R.alternate,V!==null&&(V.lanes|=l),Fu(R,l,r),R=M.sibling}else R=M.child;if(R!==null)R.return=M;else for(R=M;R!==null;){if(R===r){R=null;break}if(M=R.sibling,M!==null){M.return=R.return,R=M;break}R=R.return}M=R}Fn(n,r,g.children,l),r=r.child}return r;case 9:return g=r.type,h=r.pendingProps.children,Js(r,l),g=hi(g),h=h(g),r.flags|=1,Fn(n,r,h,l),r.child;case 14:return h=r.type,g=Si(h,r.pendingProps),g=Si(h.type,g),fm(n,r,h,g,l);case 15:return pm(n,r,r.type,r.pendingProps,l);case 17:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),bl(n,r),r.tag=1,Gn(h)?(n=!0,hl(r)):n=!1,Js(r,l),sm(r,h,g),Qu(r,h,g,l),nh(null,r,h,!0,n,l);case 19:return Mm(n,r,l);case 22:return mm(n,r,l)}throw Error(t(156,r.tag))};function Xm(n,r){return ue(n,r)}function lx(n,r,l,h){this.tag=n,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=r,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=h,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function pi(n,r,l,h){return new lx(n,r,l,h)}function Mh(n){return n=n.prototype,!(!n||!n.isReactComponent)}function cx(n){if(typeof n=="function")return Mh(n)?1:0;if(n!=null){if(n=n.$$typeof,n===O)return 11;if(n===X)return 14}return 2}function Br(n,r){var l=n.alternate;return l===null?(l=pi(n.tag,r,n.key,n.mode),l.elementType=n.elementType,l.type=n.type,l.stateNode=n.stateNode,l.alternate=n,n.alternate=l):(l.pendingProps=r,l.type=n.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=n.flags&14680064,l.childLanes=n.childLanes,l.lanes=n.lanes,l.child=n.child,l.memoizedProps=n.memoizedProps,l.memoizedState=n.memoizedState,l.updateQueue=n.updateQueue,r=n.dependencies,l.dependencies=r===null?null:{lanes:r.lanes,firstContext:r.firstContext},l.sibling=n.sibling,l.index=n.index,l.ref=n.ref,l}function kl(n,r,l,h,g,M){var R=2;if(h=n,typeof n=="function")Mh(n)&&(R=1);else if(typeof n=="string")R=5;else e:switch(n){case D:return ds(l.children,g,M,r);case z:R=8,g|=8;break;case b:return n=pi(12,l,r,g|2),n.elementType=b,n.lanes=M,n;case k:return n=pi(13,l,r,g),n.elementType=k,n.lanes=M,n;case j:return n=pi(19,l,r,g),n.elementType=j,n.lanes=M,n;case ie:return Hl(l,g,M,r);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case C:R=10;break e;case B:R=9;break e;case O:R=11;break e;case X:R=14;break e;case W:R=16,h=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return r=pi(R,l,r,g),r.elementType=n,r.type=h,r.lanes=M,r}function ds(n,r,l,h){return n=pi(7,n,h,r),n.lanes=l,n}function Hl(n,r,l,h){return n=pi(22,n,h,r),n.elementType=ie,n.lanes=l,n.stateNode={isHidden:!1},n}function Eh(n,r,l){return n=pi(6,n,null,r),n.lanes=l,n}function wh(n,r,l){return r=pi(4,n.children!==null?n.children:[],n.key,r),r.lanes=l,r.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},r}function ux(n,r,l,h,g){this.tag=r,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=li(0),this.expirationTimes=li(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=li(0),this.identifierPrefix=h,this.onRecoverableError=g,this.mutableSourceEagerHydrationData=null}function Th(n,r,l,h,g,M,R,V,Z){return n=new ux(n,r,l,V,Z),r===1?(r=1,M===!0&&(r|=8)):r=0,M=pi(3,null,null,r),n.current=M,M.stateNode=n,M.memoizedState={element:h,isDehydrated:l,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ou(M),n}function hx(n,r,l){var h=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:N,key:h==null?null:""+h,children:n,containerInfo:r,implementation:l}}function qm(n){if(!n)return Pr;n=n._reactInternals;e:{if(Di(n)!==n||n.tag!==1)throw Error(t(170));var r=n;do{switch(r.tag){case 3:r=r.stateNode.context;break e;case 1:if(Gn(r.type)){r=r.stateNode.__reactInternalMemoizedMergedChildContext;break e}}r=r.return}while(r!==null);throw Error(t(171))}if(n.tag===1){var l=n.type;if(Gn(l))return Sp(n,l,r)}return r}function Ym(n,r,l,h,g,M,R,V,Z){return n=Th(l,h,!0,n,g,M,R,V,Z),n.context=qm(null),l=n.current,h=zn(),g=zr(l),M=tr(h,g),M.callback=r??null,Nr(l,M,g),n.current.lanes=g,Hn(n,g,h),Xn(n,h),n}function Vl(n,r,l,h){var g=r.current,M=zn(),R=zr(g);return l=qm(l),r.context===null?r.context=l:r.pendingContext=l,r=tr(M,R),r.payload={element:n},h=h===void 0?null:h,h!==null&&(r.callback=h),n=Nr(g,r,R),n!==null&&(wi(n,g,R,M),xl(n,g,R)),R}function Gl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Zm(n,r){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var l=n.retryLane;n.retryLane=l!==0&&l<r?l:r}}function Ah(n,r){Zm(n,r),(n=n.alternate)&&Zm(n,r)}function dx(){return null}var $m=typeof reportError=="function"?reportError:function(n){console.error(n)};function Ch(n){this._internalRoot=n}Wl.prototype.render=Ch.prototype.render=function(n){var r=this._internalRoot;if(r===null)throw Error(t(409));Vl(n,r,null,null)},Wl.prototype.unmount=Ch.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var r=n.containerInfo;cs(function(){Vl(null,n,null,null)}),r[$i]=null}};function Wl(n){this._internalRoot=n}Wl.prototype.unstable_scheduleHydration=function(n){if(n){var r=Nf();n={blockedOn:null,target:n,priority:r};for(var l=0;l<Tr.length&&r!==0&&r<Tr[l].priority;l++);Tr.splice(l,0,n),l===0&&Ff(n)}};function Rh(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function jl(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Km(){}function fx(n,r,l,h,g){if(g){if(typeof h=="function"){var M=h;h=function(){var ce=Gl(R);M.call(ce)}}var R=Ym(r,h,n,0,null,!1,!1,"",Km);return n._reactRootContainer=R,n[$i]=R.current,ea(n.nodeType===8?n.parentNode:n),cs(),R}for(;g=n.lastChild;)n.removeChild(g);if(typeof h=="function"){var V=h;h=function(){var ce=Gl(Z);V.call(ce)}}var Z=Th(n,0,!1,null,null,!1,!1,"",Km);return n._reactRootContainer=Z,n[$i]=Z.current,ea(n.nodeType===8?n.parentNode:n),cs(function(){Vl(r,Z,l,h)}),Z}function Xl(n,r,l,h,g){var M=l._reactRootContainer;if(M){var R=M;if(typeof g=="function"){var V=g;g=function(){var Z=Gl(R);V.call(Z)}}Vl(r,R,n,g)}else R=fx(l,r,n,g,h);return Gl(R)}Lf=function(n){switch(n.tag){case 3:var r=n.stateNode;if(r.current.memoizedState.isDehydrated){var l=ln(r.pendingLanes);l!==0&&(Qc(r,l|1),Xn(r,we()),(At&6)===0&&(ro=we()+500,Lr()))}break;case 13:cs(function(){var h=er(n,1);if(h!==null){var g=zn();wi(h,n,1,g)}}),Ah(n,1)}},Jc=function(n){if(n.tag===13){var r=er(n,134217728);if(r!==null){var l=zn();wi(r,n,134217728,l)}Ah(n,134217728)}},If=function(n){if(n.tag===13){var r=zr(n),l=er(n,r);if(l!==null){var h=zn();wi(l,n,r,h)}Ah(n,r)}},Nf=function(){return Nt},Df=function(n,r){var l=Nt;try{return Nt=n,r()}finally{Nt=l}},Le=function(n,r,l){switch(r){case"input":if(vt(n,l),r=l.name,l.type==="radio"&&r!=null){for(l=n;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll("input[name="+JSON.stringify(""+r)+'][type="radio"]'),r=0;r<l.length;r++){var h=l[r];if(h!==n&&h.form===n.form){var g=cl(h);if(!g)throw Error(t(90));St(h),vt(h,g)}}}break;case"textarea":ge(n,l);break;case"select":r=l.value,r!=null&&F(n,!!l.multiple,r,!1)}},Vt=xh,an=cs;var px={usingClientEntryPoint:!1,Events:[ia,js,cl,Ne,ut,xh]},va={findFiberByHostInstance:ts,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},mx={bundleType:va.bundleType,version:va.version,rendererPackageName:va.rendererPackageName,rendererConfig:va.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:T.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=I(n),n===null?null:n.stateNode},findFiberByHostInstance:va.findFiberByHostInstance||dx,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ql=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ql.isDisabled&&ql.supportsFiber)try{Pt=ql.inject(mx),Mt=ql}catch{}}return qn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=px,qn.createPortal=function(n,r){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Rh(r))throw Error(t(200));return hx(n,r,null,l)},qn.createRoot=function(n,r){if(!Rh(n))throw Error(t(299));var l=!1,h="",g=$m;return r!=null&&(r.unstable_strictMode===!0&&(l=!0),r.identifierPrefix!==void 0&&(h=r.identifierPrefix),r.onRecoverableError!==void 0&&(g=r.onRecoverableError)),r=Th(n,1,!1,null,null,l,!1,h,g),n[$i]=r.current,ea(n.nodeType===8?n.parentNode:n),new Ch(r)},qn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var r=n._reactInternals;if(r===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=I(r),n=n===null?null:n.stateNode,n},qn.flushSync=function(n){return cs(n)},qn.hydrate=function(n,r,l){if(!jl(r))throw Error(t(200));return Xl(null,n,r,!0,l)},qn.hydrateRoot=function(n,r,l){if(!Rh(n))throw Error(t(405));var h=l!=null&&l.hydratedSources||null,g=!1,M="",R=$m;if(l!=null&&(l.unstable_strictMode===!0&&(g=!0),l.identifierPrefix!==void 0&&(M=l.identifierPrefix),l.onRecoverableError!==void 0&&(R=l.onRecoverableError)),r=Ym(r,null,n,1,l??null,g,!1,M,R),n[$i]=r.current,ea(n),h)for(n=0;n<h.length;n++)l=h[n],g=l._getVersion,g=g(l._source),r.mutableSourceEagerHydrationData==null?r.mutableSourceEagerHydrationData=[l,g]:r.mutableSourceEagerHydrationData.push(l,g);return new Wl(r)},qn.render=function(n,r,l){if(!jl(r))throw Error(t(200));return Xl(null,n,r,!1,l)},qn.unmountComponentAtNode=function(n){if(!jl(n))throw Error(t(40));return n._reactRootContainer?(cs(function(){Xl(null,null,n,!1,function(){n._reactRootContainer=null,n[$i]=null})}),!0):!1},qn.unstable_batchedUpdates=xh,qn.unstable_renderSubtreeIntoContainer=function(n,r,l,h){if(!jl(l))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Xl(n,r,l,!1,h)},qn.version="18.3.1-next-f1338f8080-20240426",qn}var sg;function Tx(){if(sg)return Lh.exports;sg=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(e){console.error(e)}}return a(),Lh.exports=wx(),Lh.exports}var og;function Ax(){if(og)return Yl;og=1;var a=Tx();return Yl.createRoot=a.createRoot,Yl.hydrateRoot=a.hydrateRoot,Yl}var Cx=Ax();const Rx=Yv(Cx),bx=[{id:"primitive-box",label:"Block",description:"Scaled cube primitive",kind:"primitive",primitive:"box"},{id:"primitive-sphere",label:"Ball",description:"Sphere primitive",kind:"primitive",primitive:"sphere"},{id:"primitive-cylinder",label:"Cylinder",description:"Rounded column primitive",kind:"primitive",primitive:"cylinder"},{id:"primitive-plane",label:"Plate",description:"Flat staging plane",kind:"primitive",primitive:"plane"},{id:"texture-grid",label:"Checker",description:"Procedural-friendly placeholder texture",kind:"texture",url:"/assets/textures/placeholder-checker.svg"}];/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const hf="170",Px=0,ag=1,Lx=2,Zv=1,Ix=2,fr=3,Qr=0,Kn=1,ji=2,$r=0,Ao=1,lg=2,cg=3,ug=4,Nx=5,As=100,Dx=101,Ux=102,Fx=103,zx=104,Ox=200,Bx=201,kx=202,Hx=203,yd=204,Sd=205,Vx=206,Gx=207,Wx=208,jx=209,Xx=210,qx=211,Yx=212,Zx=213,$x=214,Md=0,Ed=1,wd=2,bo=3,Td=4,Ad=5,Cd=6,Rd=7,$v=0,Kx=1,Qx=2,Kr=0,Jx=1,ey=2,ty=3,ny=4,iy=5,ry=6,sy=7,Kv=300,Po=301,Lo=302,bd=303,Pd=304,Gc=306,Is=1e3,Ps=1001,Ld=1002,Ii=1003,oy=1004,Zl=1005,Xi=1006,Dh=1007,Ls=1008,xr=1009,Qv=1010,Jv=1011,za=1012,df=1013,Ns=1014,gr=1015,ka=1016,ff=1017,pf=1018,Io=1020,e0=35902,t0=1021,n0=1022,Pi=1023,i0=1024,r0=1025,Co=1026,No=1027,s0=1028,mf=1029,o0=1030,gf=1031,vf=1033,Rc=33776,bc=33777,Pc=33778,Lc=33779,Id=35840,Nd=35841,Dd=35842,Ud=35843,Fd=36196,zd=37492,Od=37496,Bd=37808,kd=37809,Hd=37810,Vd=37811,Gd=37812,Wd=37813,jd=37814,Xd=37815,qd=37816,Yd=37817,Zd=37818,$d=37819,Kd=37820,Qd=37821,Ic=36492,Jd=36494,ef=36495,a0=36283,tf=36284,nf=36285,rf=36286,ay=3200,ly=3201,l0=0,cy=1,Zr="",Bn="srgb",Uo="srgb-linear",Wc="linear",Ut="srgb",oo=7680,hg=519,uy=512,hy=513,dy=514,c0=515,fy=516,py=517,my=518,gy=519,dg=35044,fg="300 es",vr=2e3,zc=2001;class Us{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const o=s.indexOf(t);o!==-1&&s.splice(o,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let o=0,c=s.length;o<c;o++)s[o].call(this,e);e.target=null}}}const Rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Uh=Math.PI/180,sf=180/Math.PI;function Ha(){const a=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Rn[a&255]+Rn[a>>8&255]+Rn[a>>16&255]+Rn[a>>24&255]+"-"+Rn[e&255]+Rn[e>>8&255]+"-"+Rn[e>>16&15|64]+Rn[e>>24&255]+"-"+Rn[t&63|128]+Rn[t>>8&255]+"-"+Rn[t>>16&255]+Rn[t>>24&255]+Rn[i&255]+Rn[i>>8&255]+Rn[i>>16&255]+Rn[i>>24&255]).toLowerCase()}function $n(a,e,t){return Math.max(e,Math.min(t,a))}function vy(a,e){return(a%e+e)%e}function Fh(a,e,t){return(1-t)*a+t*e}function xa(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return a/4294967295;case Uint16Array:return a/65535;case Uint8Array:return a/255;case Int32Array:return Math.max(a/2147483647,-1);case Int16Array:return Math.max(a/32767,-1);case Int8Array:return Math.max(a/127,-1);default:throw new Error("Invalid component type.")}}function Yn(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return Math.round(a*4294967295);case Uint16Array:return Math.round(a*65535);case Uint8Array:return Math.round(a*255);case Int32Array:return Math.round(a*2147483647);case Int16Array:return Math.round(a*32767);case Int8Array:return Math.round(a*127);default:throw new Error("Invalid component type.")}}class Et{constructor(e=0,t=0){Et.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos($n(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),o=this.x-e.x,c=this.y-e.y;return this.x=o*i-c*s+e.x,this.y=o*s+c*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ft{constructor(e,t,i,s,o,c,u,d,f){ft.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,o,c,u,d,f)}set(e,t,i,s,o,c,u,d,f){const p=this.elements;return p[0]=e,p[1]=s,p[2]=u,p[3]=t,p[4]=o,p[5]=d,p[6]=i,p[7]=c,p[8]=f,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,o=this.elements,c=i[0],u=i[3],d=i[6],f=i[1],p=i[4],v=i[7],m=i[2],x=i[5],S=i[8],E=s[0],y=s[3],_=s[6],w=s[1],A=s[4],T=s[7],U=s[2],N=s[5],D=s[8];return o[0]=c*E+u*w+d*U,o[3]=c*y+u*A+d*N,o[6]=c*_+u*T+d*D,o[1]=f*E+p*w+v*U,o[4]=f*y+p*A+v*N,o[7]=f*_+p*T+v*D,o[2]=m*E+x*w+S*U,o[5]=m*y+x*A+S*N,o[8]=m*_+x*T+S*D,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],p=e[8];return t*c*p-t*u*f-i*o*p+i*u*d+s*o*f-s*c*d}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],p=e[8],v=p*c-u*f,m=u*d-p*o,x=f*o-c*d,S=t*v+i*m+s*x;if(S===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/S;return e[0]=v*E,e[1]=(s*f-p*i)*E,e[2]=(u*i-s*c)*E,e[3]=m*E,e[4]=(p*t-s*d)*E,e[5]=(s*o-u*t)*E,e[6]=x*E,e[7]=(i*d-f*t)*E,e[8]=(c*t-i*o)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,o,c,u){const d=Math.cos(o),f=Math.sin(o);return this.set(i*d,i*f,-i*(d*c+f*u)+c+e,-s*f,s*d,-s*(-f*c+d*u)+u+t,0,0,1),this}scale(e,t){return this.premultiply(zh.makeScale(e,t)),this}rotate(e){return this.premultiply(zh.makeRotation(-e)),this}translate(e,t){return this.premultiply(zh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const zh=new ft;function u0(a){for(let e=a.length-1;e>=0;--e)if(a[e]>=65535)return!0;return!1}function Oa(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}function _y(){const a=Oa("canvas");return a.style.display="block",a}const pg={};function Ia(a){a in pg||(pg[a]=!0,console.warn(a))}function xy(a,e,t){return new Promise(function(i,s){function o(){switch(a.clientWaitSync(e,a.SYNC_FLUSH_COMMANDS_BIT,0)){case a.WAIT_FAILED:s();break;case a.TIMEOUT_EXPIRED:setTimeout(o,t);break;default:i()}}setTimeout(o,t)})}function yy(a){const e=a.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Sy(a){const e=a.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ct={enabled:!0,workingColorSpace:Uo,spaces:{},convert:function(a,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Ut&&(a.r=_r(a.r),a.g=_r(a.g),a.b=_r(a.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(a.applyMatrix3(this.spaces[e].toXYZ),a.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Ut&&(a.r=Ro(a.r),a.g=Ro(a.g),a.b=Ro(a.b))),a},fromWorkingColorSpace:function(a,e){return this.convert(a,this.workingColorSpace,e)},toWorkingColorSpace:function(a,e){return this.convert(a,e,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===Zr?Wc:this.spaces[a].transfer},getLuminanceCoefficients:function(a,e=this.workingColorSpace){return a.fromArray(this.spaces[e].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,e,t){return a.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace}};function _r(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function Ro(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}const mg=[.64,.33,.3,.6,.15,.06],gg=[.2126,.7152,.0722],vg=[.3127,.329],_g=new ft().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),xg=new ft().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ct.define({[Uo]:{primaries:mg,whitePoint:vg,transfer:Wc,toXYZ:_g,fromXYZ:xg,luminanceCoefficients:gg,workingColorSpaceConfig:{unpackColorSpace:Bn},outputColorSpaceConfig:{drawingBufferColorSpace:Bn}},[Bn]:{primaries:mg,whitePoint:vg,transfer:Ut,toXYZ:_g,fromXYZ:xg,luminanceCoefficients:gg,outputColorSpaceConfig:{drawingBufferColorSpace:Bn}}});let ao;class My{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ao===void 0&&(ao=Oa("canvas")),ao.width=e.width,ao.height=e.height;const i=ao.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=ao}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Oa("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),o=s.data;for(let c=0;c<o.length;c++)o[c]=_r(o[c]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(_r(t[i]/255)*255):t[i]=_r(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Ey=0;class h0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ey++}),this.uuid=Ha(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let o;if(Array.isArray(s)){o=[];for(let c=0,u=s.length;c<u;c++)s[c].isDataTexture?o.push(Oh(s[c].image)):o.push(Oh(s[c]))}else o=Oh(s);i.url=o}return t||(e.images[this.uuid]=i),i}}function Oh(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?My.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let wy=0;class In extends Us{constructor(e=In.DEFAULT_IMAGE,t=In.DEFAULT_MAPPING,i=Ps,s=Ps,o=Xi,c=Ls,u=Pi,d=xr,f=In.DEFAULT_ANISOTROPY,p=Zr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:wy++}),this.uuid=Ha(),this.name="",this.source=new h0(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=o,this.minFilter=c,this.anisotropy=f,this.format=u,this.internalFormat=null,this.type=d,this.offset=new Et(0,0),this.repeat=new Et(1,1),this.center=new Et(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ft,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=p,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Kv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Is:e.x=e.x-Math.floor(e.x);break;case Ps:e.x=e.x<0?0:1;break;case Ld:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Is:e.y=e.y-Math.floor(e.y);break;case Ps:e.y=e.y<0?0:1;break;case Ld:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}In.DEFAULT_IMAGE=null;In.DEFAULT_MAPPING=Kv;In.DEFAULT_ANISOTROPY=1;class Jt{constructor(e=0,t=0,i=0,s=1){Jt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,o=this.w,c=e.elements;return this.x=c[0]*t+c[4]*i+c[8]*s+c[12]*o,this.y=c[1]*t+c[5]*i+c[9]*s+c[13]*o,this.z=c[2]*t+c[6]*i+c[10]*s+c[14]*o,this.w=c[3]*t+c[7]*i+c[11]*s+c[15]*o,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,o;const d=e.elements,f=d[0],p=d[4],v=d[8],m=d[1],x=d[5],S=d[9],E=d[2],y=d[6],_=d[10];if(Math.abs(p-m)<.01&&Math.abs(v-E)<.01&&Math.abs(S-y)<.01){if(Math.abs(p+m)<.1&&Math.abs(v+E)<.1&&Math.abs(S+y)<.1&&Math.abs(f+x+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(f+1)/2,T=(x+1)/2,U=(_+1)/2,N=(p+m)/4,D=(v+E)/4,z=(S+y)/4;return A>T&&A>U?A<.01?(i=0,s=.707106781,o=.707106781):(i=Math.sqrt(A),s=N/i,o=D/i):T>U?T<.01?(i=.707106781,s=0,o=.707106781):(s=Math.sqrt(T),i=N/s,o=z/s):U<.01?(i=.707106781,s=.707106781,o=0):(o=Math.sqrt(U),i=D/o,s=z/o),this.set(i,s,o,t),this}let w=Math.sqrt((y-S)*(y-S)+(v-E)*(v-E)+(m-p)*(m-p));return Math.abs(w)<.001&&(w=1),this.x=(y-S)/w,this.y=(v-E)/w,this.z=(m-p)/w,this.w=Math.acos((f+x+_-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ty extends Us{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Jt(0,0,e,t),this.scissorTest=!1,this.viewport=new Jt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Xi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const o=new In(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);o.flipY=!1,o.generateMipmaps=i.generateMipmaps,o.internalFormat=i.internalFormat,this.textures=[];const c=i.count;for(let u=0;u<c;u++)this.textures[u]=o.clone(),this.textures[u].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,o=this.textures.length;s<o;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new h0(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ds extends Ty{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class d0 extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ii,this.minFilter=Ii,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ay extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ii,this.minFilter=Ii,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}let Ln=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,o,c,u){let d=i[s+0],f=i[s+1],p=i[s+2],v=i[s+3];const m=o[c+0],x=o[c+1],S=o[c+2],E=o[c+3];if(u===0){e[t+0]=d,e[t+1]=f,e[t+2]=p,e[t+3]=v;return}if(u===1){e[t+0]=m,e[t+1]=x,e[t+2]=S,e[t+3]=E;return}if(v!==E||d!==m||f!==x||p!==S){let y=1-u;const _=d*m+f*x+p*S+v*E,w=_>=0?1:-1,A=1-_*_;if(A>Number.EPSILON){const U=Math.sqrt(A),N=Math.atan2(U,_*w);y=Math.sin(y*N)/U,u=Math.sin(u*N)/U}const T=u*w;if(d=d*y+m*T,f=f*y+x*T,p=p*y+S*T,v=v*y+E*T,y===1-u){const U=1/Math.sqrt(d*d+f*f+p*p+v*v);d*=U,f*=U,p*=U,v*=U}}e[t]=d,e[t+1]=f,e[t+2]=p,e[t+3]=v}static multiplyQuaternionsFlat(e,t,i,s,o,c){const u=i[s],d=i[s+1],f=i[s+2],p=i[s+3],v=o[c],m=o[c+1],x=o[c+2],S=o[c+3];return e[t]=u*S+p*v+d*x-f*m,e[t+1]=d*S+p*m+f*v-u*x,e[t+2]=f*S+p*x+u*m-d*v,e[t+3]=p*S-u*v-d*m-f*x,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,o=e._z,c=e._order,u=Math.cos,d=Math.sin,f=u(i/2),p=u(s/2),v=u(o/2),m=d(i/2),x=d(s/2),S=d(o/2);switch(c){case"XYZ":this._x=m*p*v+f*x*S,this._y=f*x*v-m*p*S,this._z=f*p*S+m*x*v,this._w=f*p*v-m*x*S;break;case"YXZ":this._x=m*p*v+f*x*S,this._y=f*x*v-m*p*S,this._z=f*p*S-m*x*v,this._w=f*p*v+m*x*S;break;case"ZXY":this._x=m*p*v-f*x*S,this._y=f*x*v+m*p*S,this._z=f*p*S+m*x*v,this._w=f*p*v-m*x*S;break;case"ZYX":this._x=m*p*v-f*x*S,this._y=f*x*v+m*p*S,this._z=f*p*S-m*x*v,this._w=f*p*v+m*x*S;break;case"YZX":this._x=m*p*v+f*x*S,this._y=f*x*v+m*p*S,this._z=f*p*S-m*x*v,this._w=f*p*v-m*x*S;break;case"XZY":this._x=m*p*v-f*x*S,this._y=f*x*v-m*p*S,this._z=f*p*S+m*x*v,this._w=f*p*v+m*x*S;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],o=t[8],c=t[1],u=t[5],d=t[9],f=t[2],p=t[6],v=t[10],m=i+u+v;if(m>0){const x=.5/Math.sqrt(m+1);this._w=.25/x,this._x=(p-d)*x,this._y=(o-f)*x,this._z=(c-s)*x}else if(i>u&&i>v){const x=2*Math.sqrt(1+i-u-v);this._w=(p-d)/x,this._x=.25*x,this._y=(s+c)/x,this._z=(o+f)/x}else if(u>v){const x=2*Math.sqrt(1+u-i-v);this._w=(o-f)/x,this._x=(s+c)/x,this._y=.25*x,this._z=(d+p)/x}else{const x=2*Math.sqrt(1+v-i-u);this._w=(c-s)/x,this._x=(o+f)/x,this._y=(d+p)/x,this._z=.25*x}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs($n(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,o=e._z,c=e._w,u=t._x,d=t._y,f=t._z,p=t._w;return this._x=i*p+c*u+s*f-o*d,this._y=s*p+c*d+o*u-i*f,this._z=o*p+c*f+i*d-s*u,this._w=c*p-i*u-s*d-o*f,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,o=this._z,c=this._w;let u=c*e._w+i*e._x+s*e._y+o*e._z;if(u<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,u=-u):this.copy(e),u>=1)return this._w=c,this._x=i,this._y=s,this._z=o,this;const d=1-u*u;if(d<=Number.EPSILON){const x=1-t;return this._w=x*c+t*this._w,this._x=x*i+t*this._x,this._y=x*s+t*this._y,this._z=x*o+t*this._z,this.normalize(),this}const f=Math.sqrt(d),p=Math.atan2(f,u),v=Math.sin((1-t)*p)/f,m=Math.sin(t*p)/f;return this._w=c*v+this._w*m,this._x=i*v+this._x*m,this._y=s*v+this._y*m,this._z=o*v+this._z*m,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),o=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),o*Math.sin(t),o*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}};class ${constructor(e=0,t=0,i=0){$.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yg.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yg.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*s,this.y=o[1]*t+o[4]*i+o[7]*s,this.z=o[2]*t+o[5]*i+o[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,o=e.elements,c=1/(o[3]*t+o[7]*i+o[11]*s+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*s+o[12])*c,this.y=(o[1]*t+o[5]*i+o[9]*s+o[13])*c,this.z=(o[2]*t+o[6]*i+o[10]*s+o[14])*c,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z,d=e.w,f=2*(c*s-u*i),p=2*(u*t-o*s),v=2*(o*i-c*t);return this.x=t+d*f+c*v-u*p,this.y=i+d*p+u*f-o*v,this.z=s+d*v+o*p-c*f,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s,this.y=o[1]*t+o[5]*i+o[9]*s,this.z=o[2]*t+o[6]*i+o[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,o=e.z,c=t.x,u=t.y,d=t.z;return this.x=s*d-o*u,this.y=o*c-i*d,this.z=i*u-s*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Bh.copy(this).projectOnVector(e),this.sub(Bh)}reflect(e){return this.sub(Bh.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos($n(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Bh=new $,yg=new Ln;class Fo{constructor(e=new $(1/0,1/0,1/0),t=new $(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Ti.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Ti.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Ti.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let c=0,u=o.count;c<u;c++)e.isMesh===!0?e.getVertexPosition(c,Ti):Ti.fromBufferAttribute(o,c),Ti.applyMatrix4(e.matrixWorld),this.expandByPoint(Ti);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$l.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),$l.copy(i.boundingBox)),$l.applyMatrix4(e.matrixWorld),this.union($l)}const s=e.children;for(let o=0,c=s.length;o<c;o++)this.expandByObject(s[o],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ti),Ti.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ya),Kl.subVectors(this.max,ya),lo.subVectors(e.a,ya),co.subVectors(e.b,ya),uo.subVectors(e.c,ya),Hr.subVectors(co,lo),Vr.subVectors(uo,co),fs.subVectors(lo,uo);let t=[0,-Hr.z,Hr.y,0,-Vr.z,Vr.y,0,-fs.z,fs.y,Hr.z,0,-Hr.x,Vr.z,0,-Vr.x,fs.z,0,-fs.x,-Hr.y,Hr.x,0,-Vr.y,Vr.x,0,-fs.y,fs.x,0];return!kh(t,lo,co,uo,Kl)||(t=[1,0,0,0,1,0,0,0,1],!kh(t,lo,co,uo,Kl))?!1:(Ql.crossVectors(Hr,Vr),t=[Ql.x,Ql.y,Ql.z],kh(t,lo,co,uo,Kl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ti).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ti).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(rr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),rr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),rr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),rr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),rr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),rr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),rr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),rr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(rr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const rr=[new $,new $,new $,new $,new $,new $,new $,new $],Ti=new $,$l=new Fo,lo=new $,co=new $,uo=new $,Hr=new $,Vr=new $,fs=new $,ya=new $,Kl=new $,Ql=new $,ps=new $;function kh(a,e,t,i,s){for(let o=0,c=a.length-3;o<=c;o+=3){ps.fromArray(a,o);const u=s.x*Math.abs(ps.x)+s.y*Math.abs(ps.y)+s.z*Math.abs(ps.z),d=e.dot(ps),f=t.dot(ps),p=i.dot(ps);if(Math.max(-Math.max(d,f,p),Math.min(d,f,p))>u)return!1}return!0}const Cy=new Fo,Sa=new $,Hh=new $;class jc{constructor(e=new $,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Cy.setFromPoints(e).getCenter(i);let s=0;for(let o=0,c=e.length;o<c;o++)s=Math.max(s,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Sa.subVectors(e,this.center);const t=Sa.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Sa,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Hh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Sa.copy(e.center).add(Hh)),this.expandByPoint(Sa.copy(e.center).sub(Hh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const sr=new $,Vh=new $,Jl=new $,Gr=new $,Gh=new $,ec=new $,Wh=new $;let _f=class{constructor(e=new $,t=new $(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,sr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=sr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(sr.copy(this.origin).addScaledVector(this.direction,t),sr.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Vh.copy(e).add(t).multiplyScalar(.5),Jl.copy(t).sub(e).normalize(),Gr.copy(this.origin).sub(Vh);const o=e.distanceTo(t)*.5,c=-this.direction.dot(Jl),u=Gr.dot(this.direction),d=-Gr.dot(Jl),f=Gr.lengthSq(),p=Math.abs(1-c*c);let v,m,x,S;if(p>0)if(v=c*d-u,m=c*u-d,S=o*p,v>=0)if(m>=-S)if(m<=S){const E=1/p;v*=E,m*=E,x=v*(v+c*m+2*u)+m*(c*v+m+2*d)+f}else m=o,v=Math.max(0,-(c*m+u)),x=-v*v+m*(m+2*d)+f;else m=-o,v=Math.max(0,-(c*m+u)),x=-v*v+m*(m+2*d)+f;else m<=-S?(v=Math.max(0,-(-c*o+u)),m=v>0?-o:Math.min(Math.max(-o,-d),o),x=-v*v+m*(m+2*d)+f):m<=S?(v=0,m=Math.min(Math.max(-o,-d),o),x=m*(m+2*d)+f):(v=Math.max(0,-(c*o+u)),m=v>0?o:Math.min(Math.max(-o,-d),o),x=-v*v+m*(m+2*d)+f);else m=c>0?-o:o,v=Math.max(0,-(c*m+u)),x=-v*v+m*(m+2*d)+f;return i&&i.copy(this.origin).addScaledVector(this.direction,v),s&&s.copy(Vh).addScaledVector(Jl,m),x}intersectSphere(e,t){sr.subVectors(e.center,this.origin);const i=sr.dot(this.direction),s=sr.dot(sr)-i*i,o=e.radius*e.radius;if(s>o)return null;const c=Math.sqrt(o-s),u=i-c,d=i+c;return d<0?null:u<0?this.at(d,t):this.at(u,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,o,c,u,d;const f=1/this.direction.x,p=1/this.direction.y,v=1/this.direction.z,m=this.origin;return f>=0?(i=(e.min.x-m.x)*f,s=(e.max.x-m.x)*f):(i=(e.max.x-m.x)*f,s=(e.min.x-m.x)*f),p>=0?(o=(e.min.y-m.y)*p,c=(e.max.y-m.y)*p):(o=(e.max.y-m.y)*p,c=(e.min.y-m.y)*p),i>c||o>s||((o>i||isNaN(i))&&(i=o),(c<s||isNaN(s))&&(s=c),v>=0?(u=(e.min.z-m.z)*v,d=(e.max.z-m.z)*v):(u=(e.max.z-m.z)*v,d=(e.min.z-m.z)*v),i>d||u>s)||((u>i||i!==i)&&(i=u),(d<s||s!==s)&&(s=d),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,sr)!==null}intersectTriangle(e,t,i,s,o){Gh.subVectors(t,e),ec.subVectors(i,e),Wh.crossVectors(Gh,ec);let c=this.direction.dot(Wh),u;if(c>0){if(s)return null;u=1}else if(c<0)u=-1,c=-c;else return null;Gr.subVectors(this.origin,e);const d=u*this.direction.dot(ec.crossVectors(Gr,ec));if(d<0)return null;const f=u*this.direction.dot(Gh.cross(Gr));if(f<0||d+f>c)return null;const p=-u*Gr.dot(Wh);return p<0?null:this.at(p/c,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};class Ht{constructor(e,t,i,s,o,c,u,d,f,p,v,m,x,S,E,y){Ht.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,o,c,u,d,f,p,v,m,x,S,E,y)}set(e,t,i,s,o,c,u,d,f,p,v,m,x,S,E,y){const _=this.elements;return _[0]=e,_[4]=t,_[8]=i,_[12]=s,_[1]=o,_[5]=c,_[9]=u,_[13]=d,_[2]=f,_[6]=p,_[10]=v,_[14]=m,_[3]=x,_[7]=S,_[11]=E,_[15]=y,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ht().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/ho.setFromMatrixColumn(e,0).length(),o=1/ho.setFromMatrixColumn(e,1).length(),c=1/ho.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*c,t[9]=i[9]*c,t[10]=i[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,o=e.z,c=Math.cos(i),u=Math.sin(i),d=Math.cos(s),f=Math.sin(s),p=Math.cos(o),v=Math.sin(o);if(e.order==="XYZ"){const m=c*p,x=c*v,S=u*p,E=u*v;t[0]=d*p,t[4]=-d*v,t[8]=f,t[1]=x+S*f,t[5]=m-E*f,t[9]=-u*d,t[2]=E-m*f,t[6]=S+x*f,t[10]=c*d}else if(e.order==="YXZ"){const m=d*p,x=d*v,S=f*p,E=f*v;t[0]=m+E*u,t[4]=S*u-x,t[8]=c*f,t[1]=c*v,t[5]=c*p,t[9]=-u,t[2]=x*u-S,t[6]=E+m*u,t[10]=c*d}else if(e.order==="ZXY"){const m=d*p,x=d*v,S=f*p,E=f*v;t[0]=m-E*u,t[4]=-c*v,t[8]=S+x*u,t[1]=x+S*u,t[5]=c*p,t[9]=E-m*u,t[2]=-c*f,t[6]=u,t[10]=c*d}else if(e.order==="ZYX"){const m=c*p,x=c*v,S=u*p,E=u*v;t[0]=d*p,t[4]=S*f-x,t[8]=m*f+E,t[1]=d*v,t[5]=E*f+m,t[9]=x*f-S,t[2]=-f,t[6]=u*d,t[10]=c*d}else if(e.order==="YZX"){const m=c*d,x=c*f,S=u*d,E=u*f;t[0]=d*p,t[4]=E-m*v,t[8]=S*v+x,t[1]=v,t[5]=c*p,t[9]=-u*p,t[2]=-f*p,t[6]=x*v+S,t[10]=m-E*v}else if(e.order==="XZY"){const m=c*d,x=c*f,S=u*d,E=u*f;t[0]=d*p,t[4]=-v,t[8]=f*p,t[1]=m*v+E,t[5]=c*p,t[9]=x*v-S,t[2]=S*v-x,t[6]=u*p,t[10]=E*v+m}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ry,e,by)}lookAt(e,t,i){const s=this.elements;return ii.subVectors(e,t),ii.lengthSq()===0&&(ii.z=1),ii.normalize(),Wr.crossVectors(i,ii),Wr.lengthSq()===0&&(Math.abs(i.z)===1?ii.x+=1e-4:ii.z+=1e-4,ii.normalize(),Wr.crossVectors(i,ii)),Wr.normalize(),tc.crossVectors(ii,Wr),s[0]=Wr.x,s[4]=tc.x,s[8]=ii.x,s[1]=Wr.y,s[5]=tc.y,s[9]=ii.y,s[2]=Wr.z,s[6]=tc.z,s[10]=ii.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,o=this.elements,c=i[0],u=i[4],d=i[8],f=i[12],p=i[1],v=i[5],m=i[9],x=i[13],S=i[2],E=i[6],y=i[10],_=i[14],w=i[3],A=i[7],T=i[11],U=i[15],N=s[0],D=s[4],z=s[8],b=s[12],C=s[1],B=s[5],O=s[9],k=s[13],j=s[2],X=s[6],W=s[10],ie=s[14],H=s[3],q=s[7],oe=s[11],G=s[15];return o[0]=c*N+u*C+d*j+f*H,o[4]=c*D+u*B+d*X+f*q,o[8]=c*z+u*O+d*W+f*oe,o[12]=c*b+u*k+d*ie+f*G,o[1]=p*N+v*C+m*j+x*H,o[5]=p*D+v*B+m*X+x*q,o[9]=p*z+v*O+m*W+x*oe,o[13]=p*b+v*k+m*ie+x*G,o[2]=S*N+E*C+y*j+_*H,o[6]=S*D+E*B+y*X+_*q,o[10]=S*z+E*O+y*W+_*oe,o[14]=S*b+E*k+y*ie+_*G,o[3]=w*N+A*C+T*j+U*H,o[7]=w*D+A*B+T*X+U*q,o[11]=w*z+A*O+T*W+U*oe,o[15]=w*b+A*k+T*ie+U*G,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],o=e[12],c=e[1],u=e[5],d=e[9],f=e[13],p=e[2],v=e[6],m=e[10],x=e[14],S=e[3],E=e[7],y=e[11],_=e[15];return S*(+o*d*v-s*f*v-o*u*m+i*f*m+s*u*x-i*d*x)+E*(+t*d*x-t*f*m+o*c*m-s*c*x+s*f*p-o*d*p)+y*(+t*f*v-t*u*x-o*c*v+i*c*x+o*u*p-i*f*p)+_*(-s*u*p-t*d*v+t*u*m+s*c*v-i*c*m+i*d*p)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],p=e[8],v=e[9],m=e[10],x=e[11],S=e[12],E=e[13],y=e[14],_=e[15],w=v*y*f-E*m*f+E*d*x-u*y*x-v*d*_+u*m*_,A=S*m*f-p*y*f-S*d*x+c*y*x+p*d*_-c*m*_,T=p*E*f-S*v*f+S*u*x-c*E*x-p*u*_+c*v*_,U=S*v*d-p*E*d-S*u*m+c*E*m+p*u*y-c*v*y,N=t*w+i*A+s*T+o*U;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const D=1/N;return e[0]=w*D,e[1]=(E*m*o-v*y*o-E*s*x+i*y*x+v*s*_-i*m*_)*D,e[2]=(u*y*o-E*d*o+E*s*f-i*y*f-u*s*_+i*d*_)*D,e[3]=(v*d*o-u*m*o-v*s*f+i*m*f+u*s*x-i*d*x)*D,e[4]=A*D,e[5]=(p*y*o-S*m*o+S*s*x-t*y*x-p*s*_+t*m*_)*D,e[6]=(S*d*o-c*y*o-S*s*f+t*y*f+c*s*_-t*d*_)*D,e[7]=(c*m*o-p*d*o+p*s*f-t*m*f-c*s*x+t*d*x)*D,e[8]=T*D,e[9]=(S*v*o-p*E*o-S*i*x+t*E*x+p*i*_-t*v*_)*D,e[10]=(c*E*o-S*u*o+S*i*f-t*E*f-c*i*_+t*u*_)*D,e[11]=(p*u*o-c*v*o-p*i*f+t*v*f+c*i*x-t*u*x)*D,e[12]=U*D,e[13]=(p*E*s-S*v*s+S*i*m-t*E*m-p*i*y+t*v*y)*D,e[14]=(S*u*s-c*E*s-S*i*d+t*E*d+c*i*y-t*u*y)*D,e[15]=(c*v*s-p*u*s+p*i*d-t*v*d-c*i*m+t*u*m)*D,this}scale(e){const t=this.elements,i=e.x,s=e.y,o=e.z;return t[0]*=i,t[4]*=s,t[8]*=o,t[1]*=i,t[5]*=s,t[9]*=o,t[2]*=i,t[6]*=s,t[10]*=o,t[3]*=i,t[7]*=s,t[11]*=o,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),o=1-i,c=e.x,u=e.y,d=e.z,f=o*c,p=o*u;return this.set(f*c+i,f*u-s*d,f*d+s*u,0,f*u+s*d,p*u+i,p*d-s*c,0,f*d-s*u,p*d+s*c,o*d*d+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,o,c){return this.set(1,i,o,0,e,1,c,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,o=t._x,c=t._y,u=t._z,d=t._w,f=o+o,p=c+c,v=u+u,m=o*f,x=o*p,S=o*v,E=c*p,y=c*v,_=u*v,w=d*f,A=d*p,T=d*v,U=i.x,N=i.y,D=i.z;return s[0]=(1-(E+_))*U,s[1]=(x+T)*U,s[2]=(S-A)*U,s[3]=0,s[4]=(x-T)*N,s[5]=(1-(m+_))*N,s[6]=(y+w)*N,s[7]=0,s[8]=(S+A)*D,s[9]=(y-w)*D,s[10]=(1-(m+E))*D,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let o=ho.set(s[0],s[1],s[2]).length();const c=ho.set(s[4],s[5],s[6]).length(),u=ho.set(s[8],s[9],s[10]).length();this.determinant()<0&&(o=-o),e.x=s[12],e.y=s[13],e.z=s[14],Ai.copy(this);const f=1/o,p=1/c,v=1/u;return Ai.elements[0]*=f,Ai.elements[1]*=f,Ai.elements[2]*=f,Ai.elements[4]*=p,Ai.elements[5]*=p,Ai.elements[6]*=p,Ai.elements[8]*=v,Ai.elements[9]*=v,Ai.elements[10]*=v,t.setFromRotationMatrix(Ai),i.x=o,i.y=c,i.z=u,this}makePerspective(e,t,i,s,o,c,u=vr){const d=this.elements,f=2*o/(t-e),p=2*o/(i-s),v=(t+e)/(t-e),m=(i+s)/(i-s);let x,S;if(u===vr)x=-(c+o)/(c-o),S=-2*c*o/(c-o);else if(u===zc)x=-c/(c-o),S=-c*o/(c-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return d[0]=f,d[4]=0,d[8]=v,d[12]=0,d[1]=0,d[5]=p,d[9]=m,d[13]=0,d[2]=0,d[6]=0,d[10]=x,d[14]=S,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(e,t,i,s,o,c,u=vr){const d=this.elements,f=1/(t-e),p=1/(i-s),v=1/(c-o),m=(t+e)*f,x=(i+s)*p;let S,E;if(u===vr)S=(c+o)*v,E=-2*v;else if(u===zc)S=o*v,E=-1*v;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return d[0]=2*f,d[4]=0,d[8]=0,d[12]=-m,d[1]=0,d[5]=2*p,d[9]=0,d[13]=-x,d[2]=0,d[6]=0,d[10]=E,d[14]=-S,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ho=new $,Ai=new Ht,Ry=new $(0,0,0),by=new $(1,1,1),Wr=new $,tc=new $,ii=new $,Sg=new Ht,Mg=new Ln;class si{constructor(e=0,t=0,i=0,s=si.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,o=s[0],c=s[4],u=s[8],d=s[1],f=s[5],p=s[9],v=s[2],m=s[6],x=s[10];switch(t){case"XYZ":this._y=Math.asin($n(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-p,x),this._z=Math.atan2(-c,o)):(this._x=Math.atan2(m,f),this._z=0);break;case"YXZ":this._x=Math.asin(-$n(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(u,x),this._z=Math.atan2(d,f)):(this._y=Math.atan2(-v,o),this._z=0);break;case"ZXY":this._x=Math.asin($n(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(-v,x),this._z=Math.atan2(-c,f)):(this._y=0,this._z=Math.atan2(d,o));break;case"ZYX":this._y=Math.asin(-$n(v,-1,1)),Math.abs(v)<.9999999?(this._x=Math.atan2(m,x),this._z=Math.atan2(d,o)):(this._x=0,this._z=Math.atan2(-c,f));break;case"YZX":this._z=Math.asin($n(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-p,f),this._y=Math.atan2(-v,o)):(this._x=0,this._y=Math.atan2(u,x));break;case"XZY":this._z=Math.asin(-$n(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(m,f),this._y=Math.atan2(u,o)):(this._x=Math.atan2(-p,x),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Sg.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sg,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Mg.setFromEuler(this),this.setFromQuaternion(Mg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}si.DEFAULT_ORDER="XYZ";class xf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Py=0;const Eg=new $,fo=new Ln,or=new Ht,nc=new $,Ma=new $,Ly=new $,Iy=new Ln,wg=new $(1,0,0),Tg=new $(0,1,0),Ag=new $(0,0,1),Cg={type:"added"},Ny={type:"removed"},po={type:"childadded",child:null},jh={type:"childremoved",child:null};class on extends Us{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Py++}),this.uuid=Ha(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=on.DEFAULT_UP.clone();const e=new $,t=new si,i=new Ln,s=new $(1,1,1);function o(){i.setFromEuler(t,!1)}function c(){t.setFromQuaternion(i,void 0,!1)}t._onChange(o),i._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ht},normalMatrix:{value:new ft}}),this.matrix=new Ht,this.matrixWorld=new Ht,this.matrixAutoUpdate=on.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=on.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return fo.setFromAxisAngle(e,t),this.quaternion.multiply(fo),this}rotateOnWorldAxis(e,t){return fo.setFromAxisAngle(e,t),this.quaternion.premultiply(fo),this}rotateX(e){return this.rotateOnAxis(wg,e)}rotateY(e){return this.rotateOnAxis(Tg,e)}rotateZ(e){return this.rotateOnAxis(Ag,e)}translateOnAxis(e,t){return Eg.copy(e).applyQuaternion(this.quaternion),this.position.add(Eg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(wg,e)}translateY(e){return this.translateOnAxis(Tg,e)}translateZ(e){return this.translateOnAxis(Ag,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(or.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?nc.copy(e):nc.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ma.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?or.lookAt(Ma,nc,this.up):or.lookAt(nc,Ma,this.up),this.quaternion.setFromRotationMatrix(or),s&&(or.extractRotation(s.matrixWorld),fo.setFromRotationMatrix(or),this.quaternion.premultiply(fo.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Cg),po.child=e,this.dispatchEvent(po),po.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ny),jh.child=e,this.dispatchEvent(jh),jh.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),or.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),or.multiply(e.parent.matrixWorld)),e.applyMatrix4(or),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Cg),po.child=e,this.dispatchEvent(po),po.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const c=this.children[i].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let o=0,c=s.length;o<c;o++)s[o].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ma,e,Ly),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ma,Iy,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let o=0,c=s.length;o<c;o++)s[o].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(u=>({boxInitialized:u.boxInitialized,boxMin:u.box.min.toArray(),boxMax:u.box.max.toArray(),sphereInitialized:u.sphereInitialized,sphereRadius:u.sphere.radius,sphereCenter:u.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function o(u,d){return u[d.uuid]===void 0&&(u[d.uuid]=d.toJSON(e)),d.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=o(e.geometries,this.geometry);const u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){const d=u.shapes;if(Array.isArray(d))for(let f=0,p=d.length;f<p;f++){const v=d[f];o(e.shapes,v)}else o(e.shapes,d)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const u=[];for(let d=0,f=this.material.length;d<f;d++)u.push(o(e.materials,this.material[d]));s.material=u}else s.material=o(e.materials,this.material);if(this.children.length>0){s.children=[];for(let u=0;u<this.children.length;u++)s.children.push(this.children[u].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let u=0;u<this.animations.length;u++){const d=this.animations[u];s.animations.push(o(e.animations,d))}}if(t){const u=c(e.geometries),d=c(e.materials),f=c(e.textures),p=c(e.images),v=c(e.shapes),m=c(e.skeletons),x=c(e.animations),S=c(e.nodes);u.length>0&&(i.geometries=u),d.length>0&&(i.materials=d),f.length>0&&(i.textures=f),p.length>0&&(i.images=p),v.length>0&&(i.shapes=v),m.length>0&&(i.skeletons=m),x.length>0&&(i.animations=x),S.length>0&&(i.nodes=S)}return i.object=s,i;function c(u){const d=[];for(const f in u){const p=u[f];delete p.metadata,d.push(p)}return d}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}on.DEFAULT_UP=new $(0,1,0);on.DEFAULT_MATRIX_AUTO_UPDATE=!0;on.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ci=new $,ar=new $,Xh=new $,lr=new $,mo=new $,go=new $,Rg=new $,qh=new $,Yh=new $,Zh=new $,$h=new Jt,Kh=new Jt,Qh=new Jt;class bi{constructor(e=new $,t=new $,i=new $){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Ci.subVectors(e,t),s.cross(Ci);const o=s.lengthSq();return o>0?s.multiplyScalar(1/Math.sqrt(o)):s.set(0,0,0)}static getBarycoord(e,t,i,s,o){Ci.subVectors(s,t),ar.subVectors(i,t),Xh.subVectors(e,t);const c=Ci.dot(Ci),u=Ci.dot(ar),d=Ci.dot(Xh),f=ar.dot(ar),p=ar.dot(Xh),v=c*f-u*u;if(v===0)return o.set(0,0,0),null;const m=1/v,x=(f*d-u*p)*m,S=(c*p-u*d)*m;return o.set(1-x-S,S,x)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,lr)===null?!1:lr.x>=0&&lr.y>=0&&lr.x+lr.y<=1}static getInterpolation(e,t,i,s,o,c,u,d){return this.getBarycoord(e,t,i,s,lr)===null?(d.x=0,d.y=0,"z"in d&&(d.z=0),"w"in d&&(d.w=0),null):(d.setScalar(0),d.addScaledVector(o,lr.x),d.addScaledVector(c,lr.y),d.addScaledVector(u,lr.z),d)}static getInterpolatedAttribute(e,t,i,s,o,c){return $h.setScalar(0),Kh.setScalar(0),Qh.setScalar(0),$h.fromBufferAttribute(e,t),Kh.fromBufferAttribute(e,i),Qh.fromBufferAttribute(e,s),c.setScalar(0),c.addScaledVector($h,o.x),c.addScaledVector(Kh,o.y),c.addScaledVector(Qh,o.z),c}static isFrontFacing(e,t,i,s){return Ci.subVectors(i,t),ar.subVectors(e,t),Ci.cross(ar).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ci.subVectors(this.c,this.b),ar.subVectors(this.a,this.b),Ci.cross(ar).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return bi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return bi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,o){return bi.getInterpolation(e,this.a,this.b,this.c,t,i,s,o)}containsPoint(e){return bi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return bi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,o=this.c;let c,u;mo.subVectors(s,i),go.subVectors(o,i),qh.subVectors(e,i);const d=mo.dot(qh),f=go.dot(qh);if(d<=0&&f<=0)return t.copy(i);Yh.subVectors(e,s);const p=mo.dot(Yh),v=go.dot(Yh);if(p>=0&&v<=p)return t.copy(s);const m=d*v-p*f;if(m<=0&&d>=0&&p<=0)return c=d/(d-p),t.copy(i).addScaledVector(mo,c);Zh.subVectors(e,o);const x=mo.dot(Zh),S=go.dot(Zh);if(S>=0&&x<=S)return t.copy(o);const E=x*f-d*S;if(E<=0&&f>=0&&S<=0)return u=f/(f-S),t.copy(i).addScaledVector(go,u);const y=p*S-x*v;if(y<=0&&v-p>=0&&x-S>=0)return Rg.subVectors(o,s),u=(v-p)/(v-p+(x-S)),t.copy(s).addScaledVector(Rg,u);const _=1/(y+E+m);return c=E*_,u=m*_,t.copy(i).addScaledVector(mo,c).addScaledVector(go,u)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const f0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},jr={h:0,s:0,l:0},ic={h:0,s:0,l:0};function Jh(a,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?a+(e-a)*6*t:t<1/2?e:t<2/3?a+(e-a)*6*(2/3-t):a}class at{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ct.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=Ct.workingColorSpace){return this.r=e,this.g=t,this.b=i,Ct.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=Ct.workingColorSpace){if(e=vy(e,1),t=$n(t,0,1),i=$n(i,0,1),t===0)this.r=this.g=this.b=i;else{const o=i<=.5?i*(1+t):i+t-i*t,c=2*i-o;this.r=Jh(c,o,e+1/3),this.g=Jh(c,o,e),this.b=Jh(c,o,e-1/3)}return Ct.toWorkingColorSpace(this,s),this}setStyle(e,t=Bn){function i(o){o!==void 0&&parseFloat(o)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let o;const c=s[1],u=s[2];switch(c){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const o=s[1],c=o.length;if(c===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(o,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bn){const i=f0[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=_r(e.r),this.g=_r(e.g),this.b=_r(e.b),this}copyLinearToSRGB(e){return this.r=Ro(e.r),this.g=Ro(e.g),this.b=Ro(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bn){return Ct.fromWorkingColorSpace(bn.copy(this),e),Math.round($n(bn.r*255,0,255))*65536+Math.round($n(bn.g*255,0,255))*256+Math.round($n(bn.b*255,0,255))}getHexString(e=Bn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ct.workingColorSpace){Ct.fromWorkingColorSpace(bn.copy(this),t);const i=bn.r,s=bn.g,o=bn.b,c=Math.max(i,s,o),u=Math.min(i,s,o);let d,f;const p=(u+c)/2;if(u===c)d=0,f=0;else{const v=c-u;switch(f=p<=.5?v/(c+u):v/(2-c-u),c){case i:d=(s-o)/v+(s<o?6:0);break;case s:d=(o-i)/v+2;break;case o:d=(i-s)/v+4;break}d/=6}return e.h=d,e.s=f,e.l=p,e}getRGB(e,t=Ct.workingColorSpace){return Ct.fromWorkingColorSpace(bn.copy(this),t),e.r=bn.r,e.g=bn.g,e.b=bn.b,e}getStyle(e=Bn){Ct.fromWorkingColorSpace(bn.copy(this),e);const t=bn.r,i=bn.g,s=bn.b;return e!==Bn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(jr),this.setHSL(jr.h+e,jr.s+t,jr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(jr),e.getHSL(ic);const i=Fh(jr.h,ic.h,t),s=Fh(jr.s,ic.s,t),o=Fh(jr.l,ic.l,t);return this.setHSL(i,s,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*s,this.g=o[1]*t+o[4]*i+o[7]*s,this.b=o[2]*t+o[5]*i+o[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const bn=new at;at.NAMES=f0;let Dy=0,zo=class extends Us{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Dy++}),this.uuid=Ha(),this.name="",this.blending=Ao,this.side=Qr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=yd,this.blendDst=Sd,this.blendEquation=As,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new at(0,0,0),this.blendAlpha=0,this.depthFunc=bo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=hg,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=oo,this.stencilZFail=oo,this.stencilZPass=oo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ao&&(i.blending=this.blending),this.side!==Qr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==yd&&(i.blendSrc=this.blendSrc),this.blendDst!==Sd&&(i.blendDst=this.blendDst),this.blendEquation!==As&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==bo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==hg&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==oo&&(i.stencilFail=this.stencilFail),this.stencilZFail!==oo&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==oo&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(o){const c=[];for(const u in o){const d=o[u];delete d.metadata,c.push(d)}return c}if(t){const o=s(e.textures),c=s(e.images);o.length>0&&(i.textures=o),c.length>0&&(i.images=c)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let o=0;o!==s;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}};class Xc extends zo{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new at(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.combine=$v,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const nn=new $,rc=new Et;class Qn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=dg,this.updateRanges=[],this.gpuType=gr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,o=this.itemSize;s<o;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)rc.fromBufferAttribute(this,t),rc.applyMatrix3(e),this.setXY(t,rc.x,rc.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix3(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix4(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyNormalMatrix(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.transformDirection(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=xa(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Yn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=xa(t,this.array)),t}setX(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=xa(t,this.array)),t}setY(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=xa(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=xa(t,this.array)),t}setW(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array),s=Yn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,o){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array),s=Yn(s,this.array),o=Yn(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==dg&&(e.usage=this.usage),e}}class p0 extends Qn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class m0 extends Qn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class $t extends Qn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Uy=0;const mi=new Ht,ed=new on,vo=new $,ri=new Fo,Ea=new Fo,vn=new $;class Sn extends Us{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Uy++}),this.uuid=Ha(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(u0(e)?m0:p0)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const o=new ft().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return mi.makeRotationFromQuaternion(e),this.applyMatrix4(mi),this}rotateX(e){return mi.makeRotationX(e),this.applyMatrix4(mi),this}rotateY(e){return mi.makeRotationY(e),this.applyMatrix4(mi),this}rotateZ(e){return mi.makeRotationZ(e),this.applyMatrix4(mi),this}translate(e,t,i){return mi.makeTranslation(e,t,i),this.applyMatrix4(mi),this}scale(e,t,i){return mi.makeScale(e,t,i),this.applyMatrix4(mi),this}lookAt(e){return ed.lookAt(e),ed.updateMatrix(),this.applyMatrix4(ed.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vo).negate(),this.translate(vo.x,vo.y,vo.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,o=e.length;s<o;s++){const c=e[s];i.push(c.x,c.y,c.z||0)}this.setAttribute("position",new $t(i,3))}else{for(let i=0,s=t.count;i<s;i++){const o=e[i];t.setXYZ(i,o.x,o.y,o.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new $(-1/0,-1/0,-1/0),new $(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const o=t[i];ri.setFromBufferAttribute(o),this.morphTargetsRelative?(vn.addVectors(this.boundingBox.min,ri.min),this.boundingBox.expandByPoint(vn),vn.addVectors(this.boundingBox.max,ri.max),this.boundingBox.expandByPoint(vn)):(this.boundingBox.expandByPoint(ri.min),this.boundingBox.expandByPoint(ri.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new jc);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new $,1/0);return}if(e){const i=this.boundingSphere.center;if(ri.setFromBufferAttribute(e),t)for(let o=0,c=t.length;o<c;o++){const u=t[o];Ea.setFromBufferAttribute(u),this.morphTargetsRelative?(vn.addVectors(ri.min,Ea.min),ri.expandByPoint(vn),vn.addVectors(ri.max,Ea.max),ri.expandByPoint(vn)):(ri.expandByPoint(Ea.min),ri.expandByPoint(Ea.max))}ri.getCenter(i);let s=0;for(let o=0,c=e.count;o<c;o++)vn.fromBufferAttribute(e,o),s=Math.max(s,i.distanceToSquared(vn));if(t)for(let o=0,c=t.length;o<c;o++){const u=t[o],d=this.morphTargetsRelative;for(let f=0,p=u.count;f<p;f++)vn.fromBufferAttribute(u,f),d&&(vo.fromBufferAttribute(e,f),vn.add(vo)),s=Math.max(s,i.distanceToSquared(vn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,o=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Qn(new Float32Array(4*i.count),4));const c=this.getAttribute("tangent"),u=[],d=[];for(let z=0;z<i.count;z++)u[z]=new $,d[z]=new $;const f=new $,p=new $,v=new $,m=new Et,x=new Et,S=new Et,E=new $,y=new $;function _(z,b,C){f.fromBufferAttribute(i,z),p.fromBufferAttribute(i,b),v.fromBufferAttribute(i,C),m.fromBufferAttribute(o,z),x.fromBufferAttribute(o,b),S.fromBufferAttribute(o,C),p.sub(f),v.sub(f),x.sub(m),S.sub(m);const B=1/(x.x*S.y-S.x*x.y);isFinite(B)&&(E.copy(p).multiplyScalar(S.y).addScaledVector(v,-x.y).multiplyScalar(B),y.copy(v).multiplyScalar(x.x).addScaledVector(p,-S.x).multiplyScalar(B),u[z].add(E),u[b].add(E),u[C].add(E),d[z].add(y),d[b].add(y),d[C].add(y))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let z=0,b=w.length;z<b;++z){const C=w[z],B=C.start,O=C.count;for(let k=B,j=B+O;k<j;k+=3)_(e.getX(k+0),e.getX(k+1),e.getX(k+2))}const A=new $,T=new $,U=new $,N=new $;function D(z){U.fromBufferAttribute(s,z),N.copy(U);const b=u[z];A.copy(b),A.sub(U.multiplyScalar(U.dot(b))).normalize(),T.crossVectors(N,b);const B=T.dot(d[z])<0?-1:1;c.setXYZW(z,A.x,A.y,A.z,B)}for(let z=0,b=w.length;z<b;++z){const C=w[z],B=C.start,O=C.count;for(let k=B,j=B+O;k<j;k+=3)D(e.getX(k+0)),D(e.getX(k+1)),D(e.getX(k+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Qn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let m=0,x=i.count;m<x;m++)i.setXYZ(m,0,0,0);const s=new $,o=new $,c=new $,u=new $,d=new $,f=new $,p=new $,v=new $;if(e)for(let m=0,x=e.count;m<x;m+=3){const S=e.getX(m+0),E=e.getX(m+1),y=e.getX(m+2);s.fromBufferAttribute(t,S),o.fromBufferAttribute(t,E),c.fromBufferAttribute(t,y),p.subVectors(c,o),v.subVectors(s,o),p.cross(v),u.fromBufferAttribute(i,S),d.fromBufferAttribute(i,E),f.fromBufferAttribute(i,y),u.add(p),d.add(p),f.add(p),i.setXYZ(S,u.x,u.y,u.z),i.setXYZ(E,d.x,d.y,d.z),i.setXYZ(y,f.x,f.y,f.z)}else for(let m=0,x=t.count;m<x;m+=3)s.fromBufferAttribute(t,m+0),o.fromBufferAttribute(t,m+1),c.fromBufferAttribute(t,m+2),p.subVectors(c,o),v.subVectors(s,o),p.cross(v),i.setXYZ(m+0,p.x,p.y,p.z),i.setXYZ(m+1,p.x,p.y,p.z),i.setXYZ(m+2,p.x,p.y,p.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)vn.fromBufferAttribute(e,t),vn.normalize(),e.setXYZ(t,vn.x,vn.y,vn.z)}toNonIndexed(){function e(u,d){const f=u.array,p=u.itemSize,v=u.normalized,m=new f.constructor(d.length*p);let x=0,S=0;for(let E=0,y=d.length;E<y;E++){u.isInterleavedBufferAttribute?x=d[E]*u.data.stride+u.offset:x=d[E]*p;for(let _=0;_<p;_++)m[S++]=f[x++]}return new Qn(m,p,v)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Sn,i=this.index.array,s=this.attributes;for(const u in s){const d=s[u],f=e(d,i);t.setAttribute(u,f)}const o=this.morphAttributes;for(const u in o){const d=[],f=o[u];for(let p=0,v=f.length;p<v;p++){const m=f[p],x=e(m,i);d.push(x)}t.morphAttributes[u]=d}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let u=0,d=c.length;u<d;u++){const f=c[u];t.addGroup(f.start,f.count,f.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const d=this.parameters;for(const f in d)d[f]!==void 0&&(e[f]=d[f]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const d in i){const f=i[d];e.data.attributes[d]=f.toJSON(e.data)}const s={};let o=!1;for(const d in this.morphAttributes){const f=this.morphAttributes[d],p=[];for(let v=0,m=f.length;v<m;v++){const x=f[v];p.push(x.toJSON(e.data))}p.length>0&&(s[d]=p,o=!0)}o&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const u=this.boundingSphere;return u!==null&&(e.data.boundingSphere={center:u.center.toArray(),radius:u.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const f in s){const p=s[f];this.setAttribute(f,p.clone(t))}const o=e.morphAttributes;for(const f in o){const p=[],v=o[f];for(let m=0,x=v.length;m<x;m++)p.push(v[m].clone(t));this.morphAttributes[f]=p}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let f=0,p=c.length;f<p;f++){const v=c[f];this.addGroup(v.start,v.count,v.materialIndex)}const u=e.boundingBox;u!==null&&(this.boundingBox=u.clone());const d=e.boundingSphere;return d!==null&&(this.boundingSphere=d.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const bg=new Ht,ms=new _f,sc=new jc,Pg=new $,oc=new $,ac=new $,lc=new $,td=new $,cc=new $,Lg=new $,uc=new $;class Fe extends on{constructor(e=new Sn,t=new Xc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,c=s.length;o<c;o++){const u=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=o}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,o=i.morphAttributes.position,c=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const u=this.morphTargetInfluences;if(o&&u){cc.set(0,0,0);for(let d=0,f=o.length;d<f;d++){const p=u[d],v=o[d];p!==0&&(td.fromBufferAttribute(v,e),c?cc.addScaledVector(td,p):cc.addScaledVector(td.sub(t),p))}t.add(cc)}return t}raycast(e,t){const i=this.geometry,s=this.material,o=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),sc.copy(i.boundingSphere),sc.applyMatrix4(o),ms.copy(e.ray).recast(e.near),!(sc.containsPoint(ms.origin)===!1&&(ms.intersectSphere(sc,Pg)===null||ms.origin.distanceToSquared(Pg)>(e.far-e.near)**2))&&(bg.copy(o).invert(),ms.copy(e.ray).applyMatrix4(bg),!(i.boundingBox!==null&&ms.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ms)))}_computeIntersections(e,t,i){let s;const o=this.geometry,c=this.material,u=o.index,d=o.attributes.position,f=o.attributes.uv,p=o.attributes.uv1,v=o.attributes.normal,m=o.groups,x=o.drawRange;if(u!==null)if(Array.isArray(c))for(let S=0,E=m.length;S<E;S++){const y=m[S],_=c[y.materialIndex],w=Math.max(y.start,x.start),A=Math.min(u.count,Math.min(y.start+y.count,x.start+x.count));for(let T=w,U=A;T<U;T+=3){const N=u.getX(T),D=u.getX(T+1),z=u.getX(T+2);s=hc(this,_,e,i,f,p,v,N,D,z),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const S=Math.max(0,x.start),E=Math.min(u.count,x.start+x.count);for(let y=S,_=E;y<_;y+=3){const w=u.getX(y),A=u.getX(y+1),T=u.getX(y+2);s=hc(this,c,e,i,f,p,v,w,A,T),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}else if(d!==void 0)if(Array.isArray(c))for(let S=0,E=m.length;S<E;S++){const y=m[S],_=c[y.materialIndex],w=Math.max(y.start,x.start),A=Math.min(d.count,Math.min(y.start+y.count,x.start+x.count));for(let T=w,U=A;T<U;T+=3){const N=T,D=T+1,z=T+2;s=hc(this,_,e,i,f,p,v,N,D,z),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=y.materialIndex,t.push(s))}}else{const S=Math.max(0,x.start),E=Math.min(d.count,x.start+x.count);for(let y=S,_=E;y<_;y+=3){const w=y,A=y+1,T=y+2;s=hc(this,c,e,i,f,p,v,w,A,T),s&&(s.faceIndex=Math.floor(y/3),t.push(s))}}}}function Fy(a,e,t,i,s,o,c,u){let d;if(e.side===Kn?d=i.intersectTriangle(c,o,s,!0,u):d=i.intersectTriangle(s,o,c,e.side===Qr,u),d===null)return null;uc.copy(u),uc.applyMatrix4(a.matrixWorld);const f=t.ray.origin.distanceTo(uc);return f<t.near||f>t.far?null:{distance:f,point:uc.clone(),object:a}}function hc(a,e,t,i,s,o,c,u,d,f){a.getVertexPosition(u,oc),a.getVertexPosition(d,ac),a.getVertexPosition(f,lc);const p=Fy(a,e,t,i,oc,ac,lc,Lg);if(p){const v=new $;bi.getBarycoord(Lg,oc,ac,lc,v),s&&(p.uv=bi.getInterpolatedAttribute(s,u,d,f,v,new Et)),o&&(p.uv1=bi.getInterpolatedAttribute(o,u,d,f,v,new Et)),c&&(p.normal=bi.getInterpolatedAttribute(c,u,d,f,v,new $),p.normal.dot(i.direction)>0&&p.normal.multiplyScalar(-1));const m={a:u,b:d,c:f,normal:new $,materialIndex:0};bi.getNormal(oc,ac,lc,m.normal),p.face=m,p.barycoord=v}return p}class Qt extends Sn{constructor(e=1,t=1,i=1,s=1,o=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:o,depthSegments:c};const u=this;s=Math.floor(s),o=Math.floor(o),c=Math.floor(c);const d=[],f=[],p=[],v=[];let m=0,x=0;S("z","y","x",-1,-1,i,t,e,c,o,0),S("z","y","x",1,-1,i,t,-e,c,o,1),S("x","z","y",1,1,e,i,t,s,c,2),S("x","z","y",1,-1,e,i,-t,s,c,3),S("x","y","z",1,-1,e,t,i,s,o,4),S("x","y","z",-1,-1,e,t,-i,s,o,5),this.setIndex(d),this.setAttribute("position",new $t(f,3)),this.setAttribute("normal",new $t(p,3)),this.setAttribute("uv",new $t(v,2));function S(E,y,_,w,A,T,U,N,D,z,b){const C=T/D,B=U/z,O=T/2,k=U/2,j=N/2,X=D+1,W=z+1;let ie=0,H=0;const q=new $;for(let oe=0;oe<W;oe++){const G=oe*B-k;for(let Q=0;Q<X;Q++){const be=Q*C-O;q[E]=be*w,q[y]=G*A,q[_]=j,f.push(q.x,q.y,q.z),q[E]=0,q[y]=0,q[_]=N>0?1:-1,p.push(q.x,q.y,q.z),v.push(Q/D),v.push(1-oe/z),ie+=1}}for(let oe=0;oe<z;oe++)for(let G=0;G<D;G++){const Q=m+G+X*oe,be=m+G+X*(oe+1),se=m+(G+1)+X*(oe+1),fe=m+(G+1)+X*oe;d.push(Q,be,fe),d.push(be,se,fe),H+=6}u.addGroup(x,H,b),x+=H,m+=ie}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Do(a){const e={};for(const t in a){e[t]={};for(const i in a[t]){const s=a[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function On(a){const e={};for(let t=0;t<a.length;t++){const i=Do(a[t]);for(const s in i)e[s]=i[s]}return e}function zy(a){const e=[];for(let t=0;t<a.length;t++)e.push(a[t].clone());return e}function g0(a){const e=a.getRenderTarget();return e===null?a.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ct.workingColorSpace}const v0={clone:Do,merge:On};var Oy=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,By=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ni extends zo{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Oy,this.fragmentShader=By,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Do(e.uniforms),this.uniformsGroups=zy(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const c=this.uniforms[s].value;c&&c.isTexture?t.uniforms[s]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[s]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[s]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[s]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[s]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[s]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[s]={type:"m4",value:c.toArray()}:t.uniforms[s]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class _0 extends on{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ht,this.projectionMatrix=new Ht,this.projectionMatrixInverse=new Ht,this.coordinateSystem=vr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Xr=new $,Ig=new Et,Ng=new Et;class gi extends _0{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=sf*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Uh*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return sf*2*Math.atan(Math.tan(Uh*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Xr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Xr.x,Xr.y).multiplyScalar(-e/Xr.z),Xr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Xr.x,Xr.y).multiplyScalar(-e/Xr.z)}getViewSize(e,t){return this.getViewBounds(e,Ig,Ng),t.subVectors(Ng,Ig)}setViewOffset(e,t,i,s,o,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=o,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Uh*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,o=-.5*s;const c=this.view;if(this.view!==null&&this.view.enabled){const d=c.fullWidth,f=c.fullHeight;o+=c.offsetX*s/d,t-=c.offsetY*i/f,s*=c.width/d,i*=c.height/f}const u=this.filmOffset;u!==0&&(o+=e*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const _o=-90,xo=1;class ky extends on{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new gi(_o,xo,e,t);s.layers=this.layers,this.add(s);const o=new gi(_o,xo,e,t);o.layers=this.layers,this.add(o);const c=new gi(_o,xo,e,t);c.layers=this.layers,this.add(c);const u=new gi(_o,xo,e,t);u.layers=this.layers,this.add(u);const d=new gi(_o,xo,e,t);d.layers=this.layers,this.add(d);const f=new gi(_o,xo,e,t);f.layers=this.layers,this.add(f)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,o,c,u,d]=t;for(const f of t)this.remove(f);if(e===vr)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),d.up.set(0,1,0),d.lookAt(0,0,-1);else if(e===zc)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),d.up.set(0,-1,0),d.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const f of t)this.add(f),f.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[o,c,u,d,f,p]=this.children,v=e.getRenderTarget(),m=e.getActiveCubeFace(),x=e.getActiveMipmapLevel(),S=e.xr.enabled;e.xr.enabled=!1;const E=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,o),e.setRenderTarget(i,1,s),e.render(t,c),e.setRenderTarget(i,2,s),e.render(t,u),e.setRenderTarget(i,3,s),e.render(t,d),e.setRenderTarget(i,4,s),e.render(t,f),i.texture.generateMipmaps=E,e.setRenderTarget(i,5,s),e.render(t,p),e.setRenderTarget(v,m,x),e.xr.enabled=S,i.texture.needsPMREMUpdate=!0}}class x0 extends In{constructor(e,t,i,s,o,c,u,d,f,p){e=e!==void 0?e:[],t=t!==void 0?t:Po,super(e,t,i,s,o,c,u,d,f,p),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Hy extends Ds{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new x0(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Xi}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Qt(5,5,5),o=new Ni({name:"CubemapFromEquirect",uniforms:Do(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Kn,blending:$r});o.uniforms.tEquirect.value=t;const c=new Fe(s,o),u=t.minFilter;return t.minFilter===Ls&&(t.minFilter=Xi),new ky(1,10,this).update(e,c),t.minFilter=u,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,i,s){const o=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,i,s);e.setRenderTarget(o)}}const nd=new $,Vy=new $,Gy=new ft;class Es{constructor(e=new $(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=nd.subVectors(i,t).cross(Vy.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(nd),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/s;return o<0||o>1?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Gy.getNormalMatrix(e),s=this.coplanarPoint(nd).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const gs=new jc,dc=new $;class yf{constructor(e=new Es,t=new Es,i=new Es,s=new Es,o=new Es,c=new Es){this.planes=[e,t,i,s,o,c]}set(e,t,i,s,o,c){const u=this.planes;return u[0].copy(e),u[1].copy(t),u[2].copy(i),u[3].copy(s),u[4].copy(o),u[5].copy(c),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=vr){const i=this.planes,s=e.elements,o=s[0],c=s[1],u=s[2],d=s[3],f=s[4],p=s[5],v=s[6],m=s[7],x=s[8],S=s[9],E=s[10],y=s[11],_=s[12],w=s[13],A=s[14],T=s[15];if(i[0].setComponents(d-o,m-f,y-x,T-_).normalize(),i[1].setComponents(d+o,m+f,y+x,T+_).normalize(),i[2].setComponents(d+c,m+p,y+S,T+w).normalize(),i[3].setComponents(d-c,m-p,y-S,T-w).normalize(),i[4].setComponents(d-u,m-v,y-E,T-A).normalize(),t===vr)i[5].setComponents(d+u,m+v,y+E,T+A).normalize();else if(t===zc)i[5].setComponents(u,v,E,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gs)}intersectsSprite(e){return gs.center.set(0,0,0),gs.radius=.7071067811865476,gs.applyMatrix4(e.matrixWorld),this.intersectsSphere(gs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(dc.x=s.normal.x>0?e.max.x:e.min.x,dc.y=s.normal.y>0?e.max.y:e.min.y,dc.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(dc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function y0(){let a=null,e=!1,t=null,i=null;function s(o,c){t(o,c),i=a.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=a.requestAnimationFrame(s),e=!0)},stop:function(){a.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){a=o}}}function Wy(a){const e=new WeakMap;function t(u,d){const f=u.array,p=u.usage,v=f.byteLength,m=a.createBuffer();a.bindBuffer(d,m),a.bufferData(d,f,p),u.onUploadCallback();let x;if(f instanceof Float32Array)x=a.FLOAT;else if(f instanceof Uint16Array)u.isFloat16BufferAttribute?x=a.HALF_FLOAT:x=a.UNSIGNED_SHORT;else if(f instanceof Int16Array)x=a.SHORT;else if(f instanceof Uint32Array)x=a.UNSIGNED_INT;else if(f instanceof Int32Array)x=a.INT;else if(f instanceof Int8Array)x=a.BYTE;else if(f instanceof Uint8Array)x=a.UNSIGNED_BYTE;else if(f instanceof Uint8ClampedArray)x=a.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:m,type:x,bytesPerElement:f.BYTES_PER_ELEMENT,version:u.version,size:v}}function i(u,d,f){const p=d.array,v=d.updateRanges;if(a.bindBuffer(f,u),v.length===0)a.bufferSubData(f,0,p);else{v.sort((x,S)=>x.start-S.start);let m=0;for(let x=1;x<v.length;x++){const S=v[m],E=v[x];E.start<=S.start+S.count+1?S.count=Math.max(S.count,E.start+E.count-S.start):(++m,v[m]=E)}v.length=m+1;for(let x=0,S=v.length;x<S;x++){const E=v[x];a.bufferSubData(f,E.start*p.BYTES_PER_ELEMENT,p,E.start,E.count)}d.clearUpdateRanges()}d.onUploadCallback()}function s(u){return u.isInterleavedBufferAttribute&&(u=u.data),e.get(u)}function o(u){u.isInterleavedBufferAttribute&&(u=u.data);const d=e.get(u);d&&(a.deleteBuffer(d.buffer),e.delete(u))}function c(u,d){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){const p=e.get(u);(!p||p.version<u.version)&&e.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}const f=e.get(u);if(f===void 0)e.set(u,t(u,d));else if(f.version<u.version){if(f.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(f.buffer,u,d),f.version=u.version}}return{get:s,remove:o,update:c}}class Oo extends Sn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const o=e/2,c=t/2,u=Math.floor(i),d=Math.floor(s),f=u+1,p=d+1,v=e/u,m=t/d,x=[],S=[],E=[],y=[];for(let _=0;_<p;_++){const w=_*m-c;for(let A=0;A<f;A++){const T=A*v-o;S.push(T,-w,0),E.push(0,0,1),y.push(A/u),y.push(1-_/d)}}for(let _=0;_<d;_++)for(let w=0;w<u;w++){const A=w+f*_,T=w+f*(_+1),U=w+1+f*(_+1),N=w+1+f*_;x.push(A,T,N),x.push(T,U,N)}this.setIndex(x),this.setAttribute("position",new $t(S,3)),this.setAttribute("normal",new $t(E,3)),this.setAttribute("uv",new $t(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Oo(e.width,e.height,e.widthSegments,e.heightSegments)}}var jy=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xy=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qy=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yy=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zy=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$y=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ky=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Qy=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Jy=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,eS=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tS=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,nS=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,iS=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,rS=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,sS=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,oS=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,aS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lS=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cS=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,uS=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,hS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,dS=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,fS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,pS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,mS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,gS=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,vS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,_S=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,xS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,yS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,SS="gl_FragColor = linearToOutputTexel( gl_FragColor );",MS=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ES=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,wS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,TS=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,AS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,CS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,RS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,bS=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,PS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,LS=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,IS=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,NS=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,DS=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,US=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,FS=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,zS=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,OS=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,BS=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,kS=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,HS=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,VS=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,GS=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,WS=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,jS=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,XS=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qS=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,YS=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ZS=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$S=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,KS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,QS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,JS=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,eM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,nM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,iM=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,rM=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,oM=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,aM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lM=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,cM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,uM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,fM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,pM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,mM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,vM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_M=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,yM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,SM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,MM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,EM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,wM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,TM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,AM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,CM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,RM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,bM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,PM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,LM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,IM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,NM=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,DM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,UM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,FM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,zM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,OM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,BM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,kM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,HM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,VM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,GM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const WM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,jM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,XM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,YM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ZM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$M=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,KM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,QM=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,JM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,eE=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,tE=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nE=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,iE=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rE=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,sE=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,oE=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,aE=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,cE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,uE=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,hE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,dE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,mE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_E=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,xE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,SE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ME=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,EE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pt={alphahash_fragment:jy,alphahash_pars_fragment:Xy,alphamap_fragment:qy,alphamap_pars_fragment:Yy,alphatest_fragment:Zy,alphatest_pars_fragment:$y,aomap_fragment:Ky,aomap_pars_fragment:Qy,batching_pars_vertex:Jy,batching_vertex:eS,begin_vertex:tS,beginnormal_vertex:nS,bsdfs:iS,iridescence_fragment:rS,bumpmap_pars_fragment:sS,clipping_planes_fragment:oS,clipping_planes_pars_fragment:aS,clipping_planes_pars_vertex:lS,clipping_planes_vertex:cS,color_fragment:uS,color_pars_fragment:hS,color_pars_vertex:dS,color_vertex:fS,common:pS,cube_uv_reflection_fragment:mS,defaultnormal_vertex:gS,displacementmap_pars_vertex:vS,displacementmap_vertex:_S,emissivemap_fragment:xS,emissivemap_pars_fragment:yS,colorspace_fragment:SS,colorspace_pars_fragment:MS,envmap_fragment:ES,envmap_common_pars_fragment:wS,envmap_pars_fragment:TS,envmap_pars_vertex:AS,envmap_physical_pars_fragment:zS,envmap_vertex:CS,fog_vertex:RS,fog_pars_vertex:bS,fog_fragment:PS,fog_pars_fragment:LS,gradientmap_pars_fragment:IS,lightmap_pars_fragment:NS,lights_lambert_fragment:DS,lights_lambert_pars_fragment:US,lights_pars_begin:FS,lights_toon_fragment:OS,lights_toon_pars_fragment:BS,lights_phong_fragment:kS,lights_phong_pars_fragment:HS,lights_physical_fragment:VS,lights_physical_pars_fragment:GS,lights_fragment_begin:WS,lights_fragment_maps:jS,lights_fragment_end:XS,logdepthbuf_fragment:qS,logdepthbuf_pars_fragment:YS,logdepthbuf_pars_vertex:ZS,logdepthbuf_vertex:$S,map_fragment:KS,map_pars_fragment:QS,map_particle_fragment:JS,map_particle_pars_fragment:eM,metalnessmap_fragment:tM,metalnessmap_pars_fragment:nM,morphinstance_vertex:iM,morphcolor_vertex:rM,morphnormal_vertex:sM,morphtarget_pars_vertex:oM,morphtarget_vertex:aM,normal_fragment_begin:lM,normal_fragment_maps:cM,normal_pars_fragment:uM,normal_pars_vertex:hM,normal_vertex:dM,normalmap_pars_fragment:fM,clearcoat_normal_fragment_begin:pM,clearcoat_normal_fragment_maps:mM,clearcoat_pars_fragment:gM,iridescence_pars_fragment:vM,opaque_fragment:_M,packing:xM,premultiplied_alpha_fragment:yM,project_vertex:SM,dithering_fragment:MM,dithering_pars_fragment:EM,roughnessmap_fragment:wM,roughnessmap_pars_fragment:TM,shadowmap_pars_fragment:AM,shadowmap_pars_vertex:CM,shadowmap_vertex:RM,shadowmask_pars_fragment:bM,skinbase_vertex:PM,skinning_pars_vertex:LM,skinning_vertex:IM,skinnormal_vertex:NM,specularmap_fragment:DM,specularmap_pars_fragment:UM,tonemapping_fragment:FM,tonemapping_pars_fragment:zM,transmission_fragment:OM,transmission_pars_fragment:BM,uv_pars_fragment:kM,uv_pars_vertex:HM,uv_vertex:VM,worldpos_vertex:GM,background_vert:WM,background_frag:jM,backgroundCube_vert:XM,backgroundCube_frag:qM,cube_vert:YM,cube_frag:ZM,depth_vert:$M,depth_frag:KM,distanceRGBA_vert:QM,distanceRGBA_frag:JM,equirect_vert:eE,equirect_frag:tE,linedashed_vert:nE,linedashed_frag:iE,meshbasic_vert:rE,meshbasic_frag:sE,meshlambert_vert:oE,meshlambert_frag:aE,meshmatcap_vert:lE,meshmatcap_frag:cE,meshnormal_vert:uE,meshnormal_frag:hE,meshphong_vert:dE,meshphong_frag:fE,meshphysical_vert:pE,meshphysical_frag:mE,meshtoon_vert:gE,meshtoon_frag:vE,points_vert:_E,points_frag:xE,shadow_vert:yE,shadow_frag:SE,sprite_vert:ME,sprite_frag:EE},Re={common:{diffuse:{value:new at(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ft},alphaMap:{value:null},alphaMapTransform:{value:new ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ft}},envmap:{envMap:{value:null},envMapRotation:{value:new ft},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ft},normalScale:{value:new Et(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new at(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new at(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ft},alphaTest:{value:0},uvTransform:{value:new ft}},sprite:{diffuse:{value:new at(16777215)},opacity:{value:1},center:{value:new Et(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ft},alphaMap:{value:null},alphaMapTransform:{value:new ft},alphaTest:{value:0}}},Wi={basic:{uniforms:On([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.fog]),vertexShader:pt.meshbasic_vert,fragmentShader:pt.meshbasic_frag},lambert:{uniforms:On([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new at(0)}}]),vertexShader:pt.meshlambert_vert,fragmentShader:pt.meshlambert_frag},phong:{uniforms:On([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new at(0)},specular:{value:new at(1118481)},shininess:{value:30}}]),vertexShader:pt.meshphong_vert,fragmentShader:pt.meshphong_frag},standard:{uniforms:On([Re.common,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.roughnessmap,Re.metalnessmap,Re.fog,Re.lights,{emissive:{value:new at(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag},toon:{uniforms:On([Re.common,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.gradientmap,Re.fog,Re.lights,{emissive:{value:new at(0)}}]),vertexShader:pt.meshtoon_vert,fragmentShader:pt.meshtoon_frag},matcap:{uniforms:On([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,{matcap:{value:null}}]),vertexShader:pt.meshmatcap_vert,fragmentShader:pt.meshmatcap_frag},points:{uniforms:On([Re.points,Re.fog]),vertexShader:pt.points_vert,fragmentShader:pt.points_frag},dashed:{uniforms:On([Re.common,Re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pt.linedashed_vert,fragmentShader:pt.linedashed_frag},depth:{uniforms:On([Re.common,Re.displacementmap]),vertexShader:pt.depth_vert,fragmentShader:pt.depth_frag},normal:{uniforms:On([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,{opacity:{value:1}}]),vertexShader:pt.meshnormal_vert,fragmentShader:pt.meshnormal_frag},sprite:{uniforms:On([Re.sprite,Re.fog]),vertexShader:pt.sprite_vert,fragmentShader:pt.sprite_frag},background:{uniforms:{uvTransform:{value:new ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pt.background_vert,fragmentShader:pt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ft}},vertexShader:pt.backgroundCube_vert,fragmentShader:pt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pt.cube_vert,fragmentShader:pt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pt.equirect_vert,fragmentShader:pt.equirect_frag},distanceRGBA:{uniforms:On([Re.common,Re.displacementmap,{referencePosition:{value:new $},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pt.distanceRGBA_vert,fragmentShader:pt.distanceRGBA_frag},shadow:{uniforms:On([Re.lights,Re.fog,{color:{value:new at(0)},opacity:{value:1}}]),vertexShader:pt.shadow_vert,fragmentShader:pt.shadow_frag}};Wi.physical={uniforms:On([Wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ft},clearcoatNormalScale:{value:new Et(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ft},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ft},sheen:{value:0},sheenColor:{value:new at(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ft},transmissionSamplerSize:{value:new Et},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ft},attenuationDistance:{value:0},attenuationColor:{value:new at(0)},specularColor:{value:new at(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ft},anisotropyVector:{value:new Et},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ft}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag};const fc={r:0,b:0,g:0},vs=new si,wE=new Ht;function TE(a,e,t,i,s,o,c){const u=new at(0);let d=o===!0?0:1,f,p,v=null,m=0,x=null;function S(w){let A=w.isScene===!0?w.background:null;return A&&A.isTexture&&(A=(w.backgroundBlurriness>0?t:e).get(A)),A}function E(w){let A=!1;const T=S(w);T===null?_(u,d):T&&T.isColor&&(_(T,1),A=!0);const U=a.xr.getEnvironmentBlendMode();U==="additive"?i.buffers.color.setClear(0,0,0,1,c):U==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,c),(a.autoClear||A)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil))}function y(w,A){const T=S(A);T&&(T.isCubeTexture||T.mapping===Gc)?(p===void 0&&(p=new Fe(new Qt(1,1,1),new Ni({name:"BackgroundCubeMaterial",uniforms:Do(Wi.backgroundCube.uniforms),vertexShader:Wi.backgroundCube.vertexShader,fragmentShader:Wi.backgroundCube.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1})),p.geometry.deleteAttribute("normal"),p.geometry.deleteAttribute("uv"),p.onBeforeRender=function(U,N,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(p.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(p)),vs.copy(A.backgroundRotation),vs.x*=-1,vs.y*=-1,vs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(vs.y*=-1,vs.z*=-1),p.material.uniforms.envMap.value=T,p.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,p.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,p.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,p.material.uniforms.backgroundRotation.value.setFromMatrix4(wE.makeRotationFromEuler(vs)),p.material.toneMapped=Ct.getTransfer(T.colorSpace)!==Ut,(v!==T||m!==T.version||x!==a.toneMapping)&&(p.material.needsUpdate=!0,v=T,m=T.version,x=a.toneMapping),p.layers.enableAll(),w.unshift(p,p.geometry,p.material,0,0,null)):T&&T.isTexture&&(f===void 0&&(f=new Fe(new Oo(2,2),new Ni({name:"BackgroundMaterial",uniforms:Do(Wi.background.uniforms),vertexShader:Wi.background.vertexShader,fragmentShader:Wi.background.fragmentShader,side:Qr,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),Object.defineProperty(f.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(f)),f.material.uniforms.t2D.value=T,f.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,f.material.toneMapped=Ct.getTransfer(T.colorSpace)!==Ut,T.matrixAutoUpdate===!0&&T.updateMatrix(),f.material.uniforms.uvTransform.value.copy(T.matrix),(v!==T||m!==T.version||x!==a.toneMapping)&&(f.material.needsUpdate=!0,v=T,m=T.version,x=a.toneMapping),f.layers.enableAll(),w.unshift(f,f.geometry,f.material,0,0,null))}function _(w,A){w.getRGB(fc,g0(a)),i.buffers.color.setClear(fc.r,fc.g,fc.b,A,c)}return{getClearColor:function(){return u},setClearColor:function(w,A=1){u.set(w),d=A,_(u,d)},getClearAlpha:function(){return d},setClearAlpha:function(w){d=w,_(u,d)},render:E,addToRenderList:y}}function AE(a,e){const t=a.getParameter(a.MAX_VERTEX_ATTRIBS),i={},s=m(null);let o=s,c=!1;function u(C,B,O,k,j){let X=!1;const W=v(k,O,B);o!==W&&(o=W,f(o.object)),X=x(C,k,O,j),X&&S(C,k,O,j),j!==null&&e.update(j,a.ELEMENT_ARRAY_BUFFER),(X||c)&&(c=!1,T(C,B,O,k),j!==null&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,e.get(j).buffer))}function d(){return a.createVertexArray()}function f(C){return a.bindVertexArray(C)}function p(C){return a.deleteVertexArray(C)}function v(C,B,O){const k=O.wireframe===!0;let j=i[C.id];j===void 0&&(j={},i[C.id]=j);let X=j[B.id];X===void 0&&(X={},j[B.id]=X);let W=X[k];return W===void 0&&(W=m(d()),X[k]=W),W}function m(C){const B=[],O=[],k=[];for(let j=0;j<t;j++)B[j]=0,O[j]=0,k[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:O,attributeDivisors:k,object:C,attributes:{},index:null}}function x(C,B,O,k){const j=o.attributes,X=B.attributes;let W=0;const ie=O.getAttributes();for(const H in ie)if(ie[H].location>=0){const oe=j[H];let G=X[H];if(G===void 0&&(H==="instanceMatrix"&&C.instanceMatrix&&(G=C.instanceMatrix),H==="instanceColor"&&C.instanceColor&&(G=C.instanceColor)),oe===void 0||oe.attribute!==G||G&&oe.data!==G.data)return!0;W++}return o.attributesNum!==W||o.index!==k}function S(C,B,O,k){const j={},X=B.attributes;let W=0;const ie=O.getAttributes();for(const H in ie)if(ie[H].location>=0){let oe=X[H];oe===void 0&&(H==="instanceMatrix"&&C.instanceMatrix&&(oe=C.instanceMatrix),H==="instanceColor"&&C.instanceColor&&(oe=C.instanceColor));const G={};G.attribute=oe,oe&&oe.data&&(G.data=oe.data),j[H]=G,W++}o.attributes=j,o.attributesNum=W,o.index=k}function E(){const C=o.newAttributes;for(let B=0,O=C.length;B<O;B++)C[B]=0}function y(C){_(C,0)}function _(C,B){const O=o.newAttributes,k=o.enabledAttributes,j=o.attributeDivisors;O[C]=1,k[C]===0&&(a.enableVertexAttribArray(C),k[C]=1),j[C]!==B&&(a.vertexAttribDivisor(C,B),j[C]=B)}function w(){const C=o.newAttributes,B=o.enabledAttributes;for(let O=0,k=B.length;O<k;O++)B[O]!==C[O]&&(a.disableVertexAttribArray(O),B[O]=0)}function A(C,B,O,k,j,X,W){W===!0?a.vertexAttribIPointer(C,B,O,j,X):a.vertexAttribPointer(C,B,O,k,j,X)}function T(C,B,O,k){E();const j=k.attributes,X=O.getAttributes(),W=B.defaultAttributeValues;for(const ie in X){const H=X[ie];if(H.location>=0){let q=j[ie];if(q===void 0&&(ie==="instanceMatrix"&&C.instanceMatrix&&(q=C.instanceMatrix),ie==="instanceColor"&&C.instanceColor&&(q=C.instanceColor)),q!==void 0){const oe=q.normalized,G=q.itemSize,Q=e.get(q);if(Q===void 0)continue;const be=Q.buffer,se=Q.type,fe=Q.bytesPerElement,Me=se===a.INT||se===a.UNSIGNED_INT||q.gpuType===df;if(q.isInterleavedBufferAttribute){const _e=q.data,Ce=_e.stride,ze=q.offset;if(_e.isInstancedInterleavedBuffer){for(let nt=0;nt<H.locationSize;nt++)_(H.location+nt,_e.meshPerAttribute);C.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let nt=0;nt<H.locationSize;nt++)y(H.location+nt);a.bindBuffer(a.ARRAY_BUFFER,be);for(let nt=0;nt<H.locationSize;nt++)A(H.location+nt,G/H.locationSize,se,oe,Ce*fe,(ze+G/H.locationSize*nt)*fe,Me)}else{if(q.isInstancedBufferAttribute){for(let _e=0;_e<H.locationSize;_e++)_(H.location+_e,q.meshPerAttribute);C.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let _e=0;_e<H.locationSize;_e++)y(H.location+_e);a.bindBuffer(a.ARRAY_BUFFER,be);for(let _e=0;_e<H.locationSize;_e++)A(H.location+_e,G/H.locationSize,se,oe,G*fe,G/H.locationSize*_e*fe,Me)}}else if(W!==void 0){const oe=W[ie];if(oe!==void 0)switch(oe.length){case 2:a.vertexAttrib2fv(H.location,oe);break;case 3:a.vertexAttrib3fv(H.location,oe);break;case 4:a.vertexAttrib4fv(H.location,oe);break;default:a.vertexAttrib1fv(H.location,oe)}}}}w()}function U(){z();for(const C in i){const B=i[C];for(const O in B){const k=B[O];for(const j in k)p(k[j].object),delete k[j];delete B[O]}delete i[C]}}function N(C){if(i[C.id]===void 0)return;const B=i[C.id];for(const O in B){const k=B[O];for(const j in k)p(k[j].object),delete k[j];delete B[O]}delete i[C.id]}function D(C){for(const B in i){const O=i[B];if(O[C.id]===void 0)continue;const k=O[C.id];for(const j in k)p(k[j].object),delete k[j];delete O[C.id]}}function z(){b(),c=!0,o!==s&&(o=s,f(o.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:u,reset:z,resetDefaultState:b,dispose:U,releaseStatesOfGeometry:N,releaseStatesOfProgram:D,initAttributes:E,enableAttribute:y,disableUnusedAttributes:w}}function CE(a,e,t){let i;function s(f){i=f}function o(f,p){a.drawArrays(i,f,p),t.update(p,i,1)}function c(f,p,v){v!==0&&(a.drawArraysInstanced(i,f,p,v),t.update(p,i,v))}function u(f,p,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,f,0,p,0,v);let x=0;for(let S=0;S<v;S++)x+=p[S];t.update(x,i,1)}function d(f,p,v,m){if(v===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let S=0;S<f.length;S++)c(f[S],p[S],m[S]);else{x.multiDrawArraysInstancedWEBGL(i,f,0,p,0,m,0,v);let S=0;for(let E=0;E<v;E++)S+=p[E]*m[E];t.update(S,i,1)}}this.setMode=s,this.render=o,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function RE(a,e,t,i){let s;function o(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const D=e.get("EXT_texture_filter_anisotropic");s=a.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function c(D){return!(D!==Pi&&i.convert(D)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(D){const z=D===ka&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(D!==xr&&i.convert(D)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_TYPE)&&D!==gr&&!z)}function d(D){if(D==="highp"){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";D="mediump"}return D==="mediump"&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let f=t.precision!==void 0?t.precision:"highp";const p=d(f);p!==f&&(console.warn("THREE.WebGLRenderer:",f,"not supported, using",p,"instead."),f=p);const v=t.logarithmicDepthBuffer===!0,m=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),x=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),S=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=a.getParameter(a.MAX_TEXTURE_SIZE),y=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),_=a.getParameter(a.MAX_VERTEX_ATTRIBS),w=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),A=a.getParameter(a.MAX_VARYING_VECTORS),T=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),U=S>0,N=a.getParameter(a.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:d,textureFormatReadable:c,textureTypeReadable:u,precision:f,logarithmicDepthBuffer:v,reverseDepthBuffer:m,maxTextures:x,maxVertexTextures:S,maxTextureSize:E,maxCubemapSize:y,maxAttributes:_,maxVertexUniforms:w,maxVaryings:A,maxFragmentUniforms:T,vertexTextures:U,maxSamples:N}}function bE(a){const e=this;let t=null,i=0,s=!1,o=!1;const c=new Es,u=new ft,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(v,m){const x=v.length!==0||m||i!==0||s;return s=m,i=v.length,x},this.beginShadows=function(){o=!0,p(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(v,m){t=p(v,m,0)},this.setState=function(v,m,x){const S=v.clippingPlanes,E=v.clipIntersection,y=v.clipShadows,_=a.get(v);if(!s||S===null||S.length===0||o&&!y)o?p(null):f();else{const w=o?0:i,A=w*4;let T=_.clippingState||null;d.value=T,T=p(S,m,A,x);for(let U=0;U!==A;++U)T[U]=t[U];_.clippingState=T,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=w}};function f(){d.value!==t&&(d.value=t,d.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function p(v,m,x,S){const E=v!==null?v.length:0;let y=null;if(E!==0){if(y=d.value,S!==!0||y===null){const _=x+E*4,w=m.matrixWorldInverse;u.getNormalMatrix(w),(y===null||y.length<_)&&(y=new Float32Array(_));for(let A=0,T=x;A!==E;++A,T+=4)c.copy(v[A]).applyMatrix4(w,u),c.normal.toArray(y,T),y[T+3]=c.constant}d.value=y,d.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,y}}function PE(a){let e=new WeakMap;function t(c,u){return u===bd?c.mapping=Po:u===Pd&&(c.mapping=Lo),c}function i(c){if(c&&c.isTexture){const u=c.mapping;if(u===bd||u===Pd)if(e.has(c)){const d=e.get(c).texture;return t(d,c.mapping)}else{const d=c.image;if(d&&d.height>0){const f=new Hy(d.height);return f.fromEquirectangularTexture(a,c),e.set(c,f),c.addEventListener("dispose",s),t(f.texture,c.mapping)}else return null}}return c}function s(c){const u=c.target;u.removeEventListener("dispose",s);const d=e.get(u);d!==void 0&&(e.delete(u),d.dispose())}function o(){e=new WeakMap}return{get:i,dispose:o}}class S0 extends _0{constructor(e=-1,t=1,i=1,s=-1,o=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=o,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,o,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=o,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let o=i-e,c=i+e,u=s+t,d=s-t;if(this.view!==null&&this.view.enabled){const f=(this.right-this.left)/this.view.fullWidth/this.zoom,p=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=f*this.view.offsetX,c=o+f*this.view.width,u-=p*this.view.offsetY,d=u-p*this.view.height}this.projectionMatrix.makeOrthographic(o,c,u,d,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Eo=4,Dg=[.125,.215,.35,.446,.526,.582],Cs=20,id=new S0,Ug=new at;let rd=null,sd=0,od=0,ad=!1;const ws=(1+Math.sqrt(5))/2,yo=1/ws,Fg=[new $(-ws,yo,0),new $(ws,yo,0),new $(-yo,0,ws),new $(yo,0,ws),new $(0,ws,-yo),new $(0,ws,yo),new $(-1,1,-1),new $(1,1,-1),new $(-1,1,1),new $(1,1,1)];class zg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){rd=this._renderer.getRenderTarget(),sd=this._renderer.getActiveCubeFace(),od=this._renderer.getActiveMipmapLevel(),ad=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,s,o),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(rd,sd,od),this._renderer.xr.enabled=ad,e.scissorTest=!1,pc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Po||e.mapping===Lo?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),rd=this._renderer.getRenderTarget(),sd=this._renderer.getActiveCubeFace(),od=this._renderer.getActiveMipmapLevel(),ad=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Xi,minFilter:Xi,generateMipmaps:!1,type:ka,format:Pi,colorSpace:Uo,depthBuffer:!1},s=Og(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Og(e,t,i);const{_lodMax:o}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=LE(o)),this._blurMaterial=IE(o,e,t)}return s}_compileMaterial(e){const t=new Fe(this._lodPlanes[0],e);this._renderer.compile(t,id)}_sceneToCubeUV(e,t,i,s){const u=new gi(90,1,t,i),d=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],p=this._renderer,v=p.autoClear,m=p.toneMapping;p.getClearColor(Ug),p.toneMapping=Kr,p.autoClear=!1;const x=new Xc({name:"PMREM.Background",side:Kn,depthWrite:!1,depthTest:!1}),S=new Fe(new Qt,x);let E=!1;const y=e.background;y?y.isColor&&(x.color.copy(y),e.background=null,E=!0):(x.color.copy(Ug),E=!0);for(let _=0;_<6;_++){const w=_%3;w===0?(u.up.set(0,d[_],0),u.lookAt(f[_],0,0)):w===1?(u.up.set(0,0,d[_]),u.lookAt(0,f[_],0)):(u.up.set(0,d[_],0),u.lookAt(0,0,f[_]));const A=this._cubeSize;pc(s,w*A,_>2?A:0,A,A),p.setRenderTarget(s),E&&p.render(S,u),p.render(e,u)}S.geometry.dispose(),S.material.dispose(),p.toneMapping=m,p.autoClear=v,e.background=y}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Po||e.mapping===Lo;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=kg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Bg());const o=s?this._cubemapMaterial:this._equirectMaterial,c=new Fe(this._lodPlanes[0],o),u=o.uniforms;u.envMap.value=e;const d=this._cubeSize;pc(t,0,0,3*d,2*d),i.setRenderTarget(t),i.render(c,id)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let o=1;o<s;o++){const c=Math.sqrt(this._sigmas[o]*this._sigmas[o]-this._sigmas[o-1]*this._sigmas[o-1]),u=Fg[(s-o-1)%Fg.length];this._blur(e,o-1,o,c,u)}t.autoClear=i}_blur(e,t,i,s,o){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,i,s,"latitudinal",o),this._halfBlur(c,e,i,i,s,"longitudinal",o)}_halfBlur(e,t,i,s,o,c,u){const d=this._renderer,f=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const p=3,v=new Fe(this._lodPlanes[s],f),m=f.uniforms,x=this._sizeLods[i]-1,S=isFinite(o)?Math.PI/(2*x):2*Math.PI/(2*Cs-1),E=o/S,y=isFinite(o)?1+Math.floor(p*E):Cs;y>Cs&&console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${y} samples when the maximum is set to ${Cs}`);const _=[];let w=0;for(let D=0;D<Cs;++D){const z=D/E,b=Math.exp(-z*z/2);_.push(b),D===0?w+=b:D<y&&(w+=2*b)}for(let D=0;D<_.length;D++)_[D]=_[D]/w;m.envMap.value=e.texture,m.samples.value=y,m.weights.value=_,m.latitudinal.value=c==="latitudinal",u&&(m.poleAxis.value=u);const{_lodMax:A}=this;m.dTheta.value=S,m.mipInt.value=A-i;const T=this._sizeLods[s],U=3*T*(s>A-Eo?s-A+Eo:0),N=4*(this._cubeSize-T);pc(t,U,N,3*T,2*T),d.setRenderTarget(t),d.render(v,id)}}function LE(a){const e=[],t=[],i=[];let s=a;const o=a-Eo+1+Dg.length;for(let c=0;c<o;c++){const u=Math.pow(2,s);t.push(u);let d=1/u;c>a-Eo?d=Dg[c-a+Eo-1]:c===0&&(d=0),i.push(d);const f=1/(u-2),p=-f,v=1+f,m=[p,p,v,p,v,v,p,p,v,v,p,v],x=6,S=6,E=3,y=2,_=1,w=new Float32Array(E*S*x),A=new Float32Array(y*S*x),T=new Float32Array(_*S*x);for(let N=0;N<x;N++){const D=N%3*2/3-1,z=N>2?0:-1,b=[D,z,0,D+2/3,z,0,D+2/3,z+1,0,D,z,0,D+2/3,z+1,0,D,z+1,0];w.set(b,E*S*N),A.set(m,y*S*N);const C=[N,N,N,N,N,N];T.set(C,_*S*N)}const U=new Sn;U.setAttribute("position",new Qn(w,E)),U.setAttribute("uv",new Qn(A,y)),U.setAttribute("faceIndex",new Qn(T,_)),e.push(U),s>Eo&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Og(a,e,t){const i=new Ds(a,e,t);return i.texture.mapping=Gc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function pc(a,e,t,i,s){a.viewport.set(e,t,i,s),a.scissor.set(e,t,i,s)}function IE(a,e,t){const i=new Float32Array(Cs),s=new $(0,1,0);return new Ni({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Sf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:$r,depthTest:!1,depthWrite:!1})}function Bg(){return new Ni({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Sf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:$r,depthTest:!1,depthWrite:!1})}function kg(){return new Ni({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Sf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:$r,depthTest:!1,depthWrite:!1})}function Sf(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function NE(a){let e=new WeakMap,t=null;function i(u){if(u&&u.isTexture){const d=u.mapping,f=d===bd||d===Pd,p=d===Po||d===Lo;if(f||p){let v=e.get(u);const m=v!==void 0?v.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==m)return t===null&&(t=new zg(a)),v=f?t.fromEquirectangular(u,v):t.fromCubemap(u,v),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),v.texture;if(v!==void 0)return v.texture;{const x=u.image;return f&&x&&x.height>0||p&&x&&s(x)?(t===null&&(t=new zg(a)),v=f?t.fromEquirectangular(u):t.fromCubemap(u),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),u.addEventListener("dispose",o),v.texture):null}}}return u}function s(u){let d=0;const f=6;for(let p=0;p<f;p++)u[p]!==void 0&&d++;return d===f}function o(u){const d=u.target;d.removeEventListener("dispose",o);const f=e.get(d);f!==void 0&&(e.delete(d),f.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:c}}function DE(a){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=a.getExtension("WEBGL_depth_texture")||a.getExtension("MOZ_WEBGL_depth_texture")||a.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=a.getExtension("EXT_texture_filter_anisotropic")||a.getExtension("MOZ_EXT_texture_filter_anisotropic")||a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=a.getExtension("WEBGL_compressed_texture_s3tc")||a.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=a.getExtension("WEBGL_compressed_texture_pvrtc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=a.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Ia("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function UE(a,e,t,i){const s={},o=new WeakMap;function c(v){const m=v.target;m.index!==null&&e.remove(m.index);for(const S in m.attributes)e.remove(m.attributes[S]);for(const S in m.morphAttributes){const E=m.morphAttributes[S];for(let y=0,_=E.length;y<_;y++)e.remove(E[y])}m.removeEventListener("dispose",c),delete s[m.id];const x=o.get(m);x&&(e.remove(x),o.delete(m)),i.releaseStatesOfGeometry(m),m.isInstancedBufferGeometry===!0&&delete m._maxInstanceCount,t.memory.geometries--}function u(v,m){return s[m.id]===!0||(m.addEventListener("dispose",c),s[m.id]=!0,t.memory.geometries++),m}function d(v){const m=v.attributes;for(const S in m)e.update(m[S],a.ARRAY_BUFFER);const x=v.morphAttributes;for(const S in x){const E=x[S];for(let y=0,_=E.length;y<_;y++)e.update(E[y],a.ARRAY_BUFFER)}}function f(v){const m=[],x=v.index,S=v.attributes.position;let E=0;if(x!==null){const w=x.array;E=x.version;for(let A=0,T=w.length;A<T;A+=3){const U=w[A+0],N=w[A+1],D=w[A+2];m.push(U,N,N,D,D,U)}}else if(S!==void 0){const w=S.array;E=S.version;for(let A=0,T=w.length/3-1;A<T;A+=3){const U=A+0,N=A+1,D=A+2;m.push(U,N,N,D,D,U)}}else return;const y=new(u0(m)?m0:p0)(m,1);y.version=E;const _=o.get(v);_&&e.remove(_),o.set(v,y)}function p(v){const m=o.get(v);if(m){const x=v.index;x!==null&&m.version<x.version&&f(v)}else f(v);return o.get(v)}return{get:u,update:d,getWireframeAttribute:p}}function FE(a,e,t){let i;function s(m){i=m}let o,c;function u(m){o=m.type,c=m.bytesPerElement}function d(m,x){a.drawElements(i,x,o,m*c),t.update(x,i,1)}function f(m,x,S){S!==0&&(a.drawElementsInstanced(i,x,o,m*c,S),t.update(x,i,S))}function p(m,x,S){if(S===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,x,0,o,m,0,S);let y=0;for(let _=0;_<S;_++)y+=x[_];t.update(y,i,1)}function v(m,x,S,E){if(S===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let _=0;_<m.length;_++)f(m[_]/c,x[_],E[_]);else{y.multiDrawElementsInstancedWEBGL(i,x,0,o,m,0,E,0,S);let _=0;for(let w=0;w<S;w++)_+=x[w]*E[w];t.update(_,i,1)}}this.setMode=s,this.setIndex=u,this.render=d,this.renderInstances=f,this.renderMultiDraw=p,this.renderMultiDrawInstances=v}function zE(a){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,c,u){switch(t.calls++,c){case a.TRIANGLES:t.triangles+=u*(o/3);break;case a.LINES:t.lines+=u*(o/2);break;case a.LINE_STRIP:t.lines+=u*(o-1);break;case a.LINE_LOOP:t.lines+=u*o;break;case a.POINTS:t.points+=u*o;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function OE(a,e,t){const i=new WeakMap,s=new Jt;function o(c,u,d){const f=c.morphTargetInfluences,p=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,v=p!==void 0?p.length:0;let m=i.get(u);if(m===void 0||m.count!==v){let C=function(){z.dispose(),i.delete(u),u.removeEventListener("dispose",C)};var x=C;m!==void 0&&m.texture.dispose();const S=u.morphAttributes.position!==void 0,E=u.morphAttributes.normal!==void 0,y=u.morphAttributes.color!==void 0,_=u.morphAttributes.position||[],w=u.morphAttributes.normal||[],A=u.morphAttributes.color||[];let T=0;S===!0&&(T=1),E===!0&&(T=2),y===!0&&(T=3);let U=u.attributes.position.count*T,N=1;U>e.maxTextureSize&&(N=Math.ceil(U/e.maxTextureSize),U=e.maxTextureSize);const D=new Float32Array(U*N*4*v),z=new d0(D,U,N,v);z.type=gr,z.needsUpdate=!0;const b=T*4;for(let B=0;B<v;B++){const O=_[B],k=w[B],j=A[B],X=U*N*4*B;for(let W=0;W<O.count;W++){const ie=W*b;S===!0&&(s.fromBufferAttribute(O,W),D[X+ie+0]=s.x,D[X+ie+1]=s.y,D[X+ie+2]=s.z,D[X+ie+3]=0),E===!0&&(s.fromBufferAttribute(k,W),D[X+ie+4]=s.x,D[X+ie+5]=s.y,D[X+ie+6]=s.z,D[X+ie+7]=0),y===!0&&(s.fromBufferAttribute(j,W),D[X+ie+8]=s.x,D[X+ie+9]=s.y,D[X+ie+10]=s.z,D[X+ie+11]=j.itemSize===4?s.w:1)}}m={count:v,texture:z,size:new Et(U,N)},i.set(u,m),u.addEventListener("dispose",C)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)d.getUniforms().setValue(a,"morphTexture",c.morphTexture,t);else{let S=0;for(let y=0;y<f.length;y++)S+=f[y];const E=u.morphTargetsRelative?1:1-S;d.getUniforms().setValue(a,"morphTargetBaseInfluence",E),d.getUniforms().setValue(a,"morphTargetInfluences",f)}d.getUniforms().setValue(a,"morphTargetsTexture",m.texture,t),d.getUniforms().setValue(a,"morphTargetsTextureSize",m.size)}return{update:o}}function BE(a,e,t,i){let s=new WeakMap;function o(d){const f=i.render.frame,p=d.geometry,v=e.get(d,p);if(s.get(v)!==f&&(e.update(v),s.set(v,f)),d.isInstancedMesh&&(d.hasEventListener("dispose",u)===!1&&d.addEventListener("dispose",u),s.get(d)!==f&&(t.update(d.instanceMatrix,a.ARRAY_BUFFER),d.instanceColor!==null&&t.update(d.instanceColor,a.ARRAY_BUFFER),s.set(d,f))),d.isSkinnedMesh){const m=d.skeleton;s.get(m)!==f&&(m.update(),s.set(m,f))}return v}function c(){s=new WeakMap}function u(d){const f=d.target;f.removeEventListener("dispose",u),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:o,dispose:c}}class M0 extends In{constructor(e,t,i,s,o,c,u,d,f,p=Co){if(p!==Co&&p!==No)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&p===Co&&(i=Ns),i===void 0&&p===No&&(i=Io),super(null,s,o,c,u,d,p,i,f),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=u!==void 0?u:Ii,this.minFilter=d!==void 0?d:Ii,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const E0=new In,Hg=new M0(1,1),w0=new d0,T0=new Ay,A0=new x0,Vg=[],Gg=[],Wg=new Float32Array(16),jg=new Float32Array(9),Xg=new Float32Array(4);function Bo(a,e,t){const i=a[0];if(i<=0||i>0)return a;const s=e*t;let o=Vg[s];if(o===void 0&&(o=new Float32Array(s),Vg[s]=o),e!==0){i.toArray(o,0);for(let c=1,u=0;c!==e;++c)u+=t,a[c].toArray(o,u)}return o}function dn(a,e){if(a.length!==e.length)return!1;for(let t=0,i=a.length;t<i;t++)if(a[t]!==e[t])return!1;return!0}function fn(a,e){for(let t=0,i=e.length;t<i;t++)a[t]=e[t]}function qc(a,e){let t=Gg[e];t===void 0&&(t=new Int32Array(e),Gg[e]=t);for(let i=0;i!==e;++i)t[i]=a.allocateTextureUnit();return t}function kE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1f(this.addr,e),t[0]=e)}function HE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2fv(this.addr,e),fn(t,e)}}function VE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(a.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dn(t,e))return;a.uniform3fv(this.addr,e),fn(t,e)}}function GE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4fv(this.addr,e),fn(t,e)}}function WE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix2fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Xg.set(i),a.uniformMatrix2fv(this.addr,!1,Xg),fn(t,i)}}function jE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix3fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;jg.set(i),a.uniformMatrix3fv(this.addr,!1,jg),fn(t,i)}}function XE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix4fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Wg.set(i),a.uniformMatrix4fv(this.addr,!1,Wg),fn(t,i)}}function qE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1i(this.addr,e),t[0]=e)}function YE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2iv(this.addr,e),fn(t,e)}}function ZE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;a.uniform3iv(this.addr,e),fn(t,e)}}function $E(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4iv(this.addr,e),fn(t,e)}}function KE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1ui(this.addr,e),t[0]=e)}function QE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2uiv(this.addr,e),fn(t,e)}}function JE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;a.uniform3uiv(this.addr,e),fn(t,e)}}function ew(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4uiv(this.addr,e),fn(t,e)}}function tw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s);let o;this.type===a.SAMPLER_2D_SHADOW?(Hg.compareFunction=c0,o=Hg):o=E0,t.setTexture2D(e||o,s)}function nw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||T0,s)}function iw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||A0,s)}function rw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||w0,s)}function sw(a){switch(a){case 5126:return kE;case 35664:return HE;case 35665:return VE;case 35666:return GE;case 35674:return WE;case 35675:return jE;case 35676:return XE;case 5124:case 35670:return qE;case 35667:case 35671:return YE;case 35668:case 35672:return ZE;case 35669:case 35673:return $E;case 5125:return KE;case 36294:return QE;case 36295:return JE;case 36296:return ew;case 35678:case 36198:case 36298:case 36306:case 35682:return tw;case 35679:case 36299:case 36307:return nw;case 35680:case 36300:case 36308:case 36293:return iw;case 36289:case 36303:case 36311:case 36292:return rw}}function ow(a,e){a.uniform1fv(this.addr,e)}function aw(a,e){const t=Bo(e,this.size,2);a.uniform2fv(this.addr,t)}function lw(a,e){const t=Bo(e,this.size,3);a.uniform3fv(this.addr,t)}function cw(a,e){const t=Bo(e,this.size,4);a.uniform4fv(this.addr,t)}function uw(a,e){const t=Bo(e,this.size,4);a.uniformMatrix2fv(this.addr,!1,t)}function hw(a,e){const t=Bo(e,this.size,9);a.uniformMatrix3fv(this.addr,!1,t)}function dw(a,e){const t=Bo(e,this.size,16);a.uniformMatrix4fv(this.addr,!1,t)}function fw(a,e){a.uniform1iv(this.addr,e)}function pw(a,e){a.uniform2iv(this.addr,e)}function mw(a,e){a.uniform3iv(this.addr,e)}function gw(a,e){a.uniform4iv(this.addr,e)}function vw(a,e){a.uniform1uiv(this.addr,e)}function _w(a,e){a.uniform2uiv(this.addr,e)}function xw(a,e){a.uniform3uiv(this.addr,e)}function yw(a,e){a.uniform4uiv(this.addr,e)}function Sw(a,e,t){const i=this.cache,s=e.length,o=qc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture2D(e[c]||E0,o[c])}function Mw(a,e,t){const i=this.cache,s=e.length,o=qc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture3D(e[c]||T0,o[c])}function Ew(a,e,t){const i=this.cache,s=e.length,o=qc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTextureCube(e[c]||A0,o[c])}function ww(a,e,t){const i=this.cache,s=e.length,o=qc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture2DArray(e[c]||w0,o[c])}function Tw(a){switch(a){case 5126:return ow;case 35664:return aw;case 35665:return lw;case 35666:return cw;case 35674:return uw;case 35675:return hw;case 35676:return dw;case 5124:case 35670:return fw;case 35667:case 35671:return pw;case 35668:case 35672:return mw;case 35669:case 35673:return gw;case 5125:return vw;case 36294:return _w;case 36295:return xw;case 36296:return yw;case 35678:case 36198:case 36298:case 36306:case 35682:return Sw;case 35679:case 36299:case 36307:return Mw;case 35680:case 36300:case 36308:case 36293:return Ew;case 36289:case 36303:case 36311:case 36292:return ww}}class Aw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=sw(t.type)}}class Cw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Tw(t.type)}}class Rw{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let o=0,c=s.length;o!==c;++o){const u=s[o];u.setValue(e,t[u.id],i)}}}const ld=/(\w+)(\])?(\[|\.)?/g;function qg(a,e){a.seq.push(e),a.map[e.id]=e}function bw(a,e,t){const i=a.name,s=i.length;for(ld.lastIndex=0;;){const o=ld.exec(i),c=ld.lastIndex;let u=o[1];const d=o[2]==="]",f=o[3];if(d&&(u=u|0),f===void 0||f==="["&&c+2===s){qg(t,f===void 0?new Aw(u,a,e):new Cw(u,a,e));break}else{let v=t.map[u];v===void 0&&(v=new Rw(u),qg(t,v)),t=v}}}class Nc{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const o=e.getActiveUniform(t,s),c=e.getUniformLocation(t,o.name);bw(o,c,this)}}setValue(e,t,i,s){const o=this.map[t];o!==void 0&&o.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let o=0,c=t.length;o!==c;++o){const u=t[o],d=i[u.id];d.needsUpdate!==!1&&u.setValue(e,d.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,o=e.length;s!==o;++s){const c=e[s];c.id in t&&i.push(c)}return i}}function Yg(a,e,t){const i=a.createShader(e);return a.shaderSource(i,t),a.compileShader(i),i}const Pw=37297;let Lw=0;function Iw(a,e){const t=a.split(`
`),i=[],s=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let c=s;c<o;c++){const u=c+1;i.push(`${u===e?">":" "} ${u}: ${t[c]}`)}return i.join(`
`)}const Zg=new ft;function Nw(a){Ct._getMatrix(Zg,Ct.workingColorSpace,a);const e=`mat3( ${Zg.elements.map(t=>t.toFixed(4))} )`;switch(Ct.getTransfer(a)){case Wc:return[e,"LinearTransferOETF"];case Ut:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",a),[e,"LinearTransferOETF"]}}function $g(a,e,t){const i=a.getShaderParameter(e,a.COMPILE_STATUS),s=a.getShaderInfoLog(e).trim();if(i&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const c=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+Iw(a.getShaderSource(e),c)}else return s}function Dw(a,e){const t=Nw(e);return[`vec4 ${a}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Uw(a,e){let t;switch(e){case Jx:t="Linear";break;case ey:t="Reinhard";break;case ty:t="Cineon";break;case ny:t="ACESFilmic";break;case ry:t="AgX";break;case sy:t="Neutral";break;case iy:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+a+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const mc=new $;function Fw(){Ct.getLuminanceCoefficients(mc);const a=mc.x.toFixed(4),e=mc.y.toFixed(4),t=mc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${a}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function zw(a){return[a.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",a.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Na).join(`
`)}function Ow(a){const e=[];for(const t in a){const i=a[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Bw(a,e){const t={},i=a.getProgramParameter(e,a.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const o=a.getActiveAttrib(e,s),c=o.name;let u=1;o.type===a.FLOAT_MAT2&&(u=2),o.type===a.FLOAT_MAT3&&(u=3),o.type===a.FLOAT_MAT4&&(u=4),t[c]={type:o.type,location:a.getAttribLocation(e,c),locationSize:u}}return t}function Na(a){return a!==""}function Kg(a,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return a.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Qg(a,e){return a.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const kw=/^[ \t]*#include +<([\w\d./]+)>/gm;function of(a){return a.replace(kw,Vw)}const Hw=new Map;function Vw(a,e){let t=pt[e];if(t===void 0){const i=Hw.get(e);if(i!==void 0)t=pt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return of(t)}const Gw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Jg(a){return a.replace(Gw,Ww)}function Ww(a,e,t,i){let s="";for(let o=parseInt(e);o<parseInt(t);o++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return s}function ev(a){let e=`precision ${a.precision} float;
	precision ${a.precision} int;
	precision ${a.precision} sampler2D;
	precision ${a.precision} samplerCube;
	precision ${a.precision} sampler3D;
	precision ${a.precision} sampler2DArray;
	precision ${a.precision} sampler2DShadow;
	precision ${a.precision} samplerCubeShadow;
	precision ${a.precision} sampler2DArrayShadow;
	precision ${a.precision} isampler2D;
	precision ${a.precision} isampler3D;
	precision ${a.precision} isamplerCube;
	precision ${a.precision} isampler2DArray;
	precision ${a.precision} usampler2D;
	precision ${a.precision} usampler3D;
	precision ${a.precision} usamplerCube;
	precision ${a.precision} usampler2DArray;
	`;return a.precision==="highp"?e+=`
#define HIGH_PRECISION`:a.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:a.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function jw(a){let e="SHADOWMAP_TYPE_BASIC";return a.shadowMapType===Zv?e="SHADOWMAP_TYPE_PCF":a.shadowMapType===Ix?e="SHADOWMAP_TYPE_PCF_SOFT":a.shadowMapType===fr&&(e="SHADOWMAP_TYPE_VSM"),e}function Xw(a){let e="ENVMAP_TYPE_CUBE";if(a.envMap)switch(a.envMapMode){case Po:case Lo:e="ENVMAP_TYPE_CUBE";break;case Gc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function qw(a){let e="ENVMAP_MODE_REFLECTION";if(a.envMap)switch(a.envMapMode){case Lo:e="ENVMAP_MODE_REFRACTION";break}return e}function Yw(a){let e="ENVMAP_BLENDING_NONE";if(a.envMap)switch(a.combine){case $v:e="ENVMAP_BLENDING_MULTIPLY";break;case Kx:e="ENVMAP_BLENDING_MIX";break;case Qx:e="ENVMAP_BLENDING_ADD";break}return e}function Zw(a){const e=a.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function $w(a,e,t,i){const s=a.getContext(),o=t.defines;let c=t.vertexShader,u=t.fragmentShader;const d=jw(t),f=Xw(t),p=qw(t),v=Yw(t),m=Zw(t),x=zw(t),S=Ow(o),E=s.createProgram();let y,_,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(y=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S].filter(Na).join(`
`),y.length>0&&(y+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S].filter(Na).join(`
`),_.length>0&&(_+=`
`)):(y=[ev(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+p:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Na).join(`
`),_=[ev(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,S,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.envMap?"#define "+p:"",t.envMap?"#define "+v:"",m?"#define CUBEUV_TEXEL_WIDTH "+m.texelWidth:"",m?"#define CUBEUV_TEXEL_HEIGHT "+m.texelHeight:"",m?"#define CUBEUV_MAX_MIP "+m.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Kr?"#define TONE_MAPPING":"",t.toneMapping!==Kr?pt.tonemapping_pars_fragment:"",t.toneMapping!==Kr?Uw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",pt.colorspace_pars_fragment,Dw("linearToOutputTexel",t.outputColorSpace),Fw(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Na).join(`
`)),c=of(c),c=Kg(c,t),c=Qg(c,t),u=of(u),u=Kg(u,t),u=Qg(u,t),c=Jg(c),u=Jg(u),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,y=[x,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+y,_=["#define varying in",t.glslVersion===fg?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===fg?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);const A=w+y+c,T=w+_+u,U=Yg(s,s.VERTEX_SHADER,A),N=Yg(s,s.FRAGMENT_SHADER,T);s.attachShader(E,U),s.attachShader(E,N),t.index0AttributeName!==void 0?s.bindAttribLocation(E,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(E,0,"position"),s.linkProgram(E);function D(B){if(a.debug.checkShaderErrors){const O=s.getProgramInfoLog(E).trim(),k=s.getShaderInfoLog(U).trim(),j=s.getShaderInfoLog(N).trim();let X=!0,W=!0;if(s.getProgramParameter(E,s.LINK_STATUS)===!1)if(X=!1,typeof a.debug.onShaderError=="function")a.debug.onShaderError(s,E,U,N);else{const ie=$g(s,U,"vertex"),H=$g(s,N,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(E,s.VALIDATE_STATUS)+`

Material Name: `+B.name+`
Material Type: `+B.type+`

Program Info Log: `+O+`
`+ie+`
`+H)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(k===""||j==="")&&(W=!1);W&&(B.diagnostics={runnable:X,programLog:O,vertexShader:{log:k,prefix:y},fragmentShader:{log:j,prefix:_}})}s.deleteShader(U),s.deleteShader(N),z=new Nc(s,E),b=Bw(s,E)}let z;this.getUniforms=function(){return z===void 0&&D(this),z};let b;this.getAttributes=function(){return b===void 0&&D(this),b};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(E,Pw)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(E),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Lw++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=U,this.fragmentShader=N,this}let Kw=0;class Qw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),o=this._getShaderStage(i),c=this._getShaderCacheForMaterial(e);return c.has(s)===!1&&(c.add(s),s.usedTimes++),c.has(o)===!1&&(c.add(o),o.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Jw(e),t.set(e,i)),i}}class Jw{constructor(e){this.id=Kw++,this.code=e,this.usedTimes=0}}function e1(a,e,t,i,s,o,c){const u=new xf,d=new Qw,f=new Set,p=[],v=s.logarithmicDepthBuffer,m=s.vertexTextures;let x=s.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function E(b){return f.add(b),b===0?"uv":`uv${b}`}function y(b,C,B,O,k){const j=O.fog,X=k.geometry,W=b.isMeshStandardMaterial?O.environment:null,ie=(b.isMeshStandardMaterial?t:e).get(b.envMap||W),H=ie&&ie.mapping===Gc?ie.image.height:null,q=S[b.type];b.precision!==null&&(x=s.getMaxPrecision(b.precision),x!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",x,"instead."));const oe=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,G=oe!==void 0?oe.length:0;let Q=0;X.morphAttributes.position!==void 0&&(Q=1),X.morphAttributes.normal!==void 0&&(Q=2),X.morphAttributes.color!==void 0&&(Q=3);let be,se,fe,Me;if(q){const Tt=Wi[q];be=Tt.vertexShader,se=Tt.fragmentShader}else be=b.vertexShader,se=b.fragmentShader,d.update(b),fe=d.getVertexShaderID(b),Me=d.getFragmentShaderID(b);const _e=a.getRenderTarget(),Ce=a.state.buffers.depth.getReversed(),ze=k.isInstancedMesh===!0,nt=k.isBatchedMesh===!0,Dt=!!b.map,St=!!b.matcap,Bt=!!ie,ne=!!b.aoMap,Nn=!!b.lightMap,yt=!!b.bumpMap,vt=!!b.normalMap,Je=!!b.displacementMap,It=!!b.emissiveMap,Qe=!!b.metalnessMap,F=!!b.roughnessMap,L=b.anisotropy>0,le=b.clearcoat>0,ge=b.dispersion>0,xe=b.iridescence>0,pe=b.sheen>0,qe=b.transmission>0,Pe=L&&!!b.anisotropyMap,Oe=le&&!!b.clearcoatMap,mt=le&&!!b.clearcoatNormalMap,Ee=le&&!!b.clearcoatRoughnessMap,ke=xe&&!!b.iridescenceMap,it=xe&&!!b.iridescenceThicknessMap,rt=pe&&!!b.sheenColorMap,He=pe&&!!b.sheenRoughnessMap,_t=!!b.specularMap,ct=!!b.specularColorMap,Lt=!!b.specularIntensityMap,J=qe&&!!b.transmissionMap,Le=qe&&!!b.thicknessMap,de=!!b.gradientMap,me=!!b.alphaMap,De=b.alphaTest>0,Ne=!!b.alphaHash,ut=!!b.extensions;let Vt=Kr;b.toneMapped&&(_e===null||_e.isXRRenderTarget===!0)&&(Vt=a.toneMapping);const an={shaderID:q,shaderType:b.type,shaderName:b.name,vertexShader:be,fragmentShader:se,defines:b.defines,customVertexShaderID:fe,customFragmentShaderID:Me,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:x,batching:nt,batchingColor:nt&&k._colorsTexture!==null,instancing:ze,instancingColor:ze&&k.instanceColor!==null,instancingMorph:ze&&k.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:_e===null?a.outputColorSpace:_e.isXRRenderTarget===!0?_e.texture.colorSpace:Uo,alphaToCoverage:!!b.alphaToCoverage,map:Dt,matcap:St,envMap:Bt,envMapMode:Bt&&ie.mapping,envMapCubeUVHeight:H,aoMap:ne,lightMap:Nn,bumpMap:yt,normalMap:vt,displacementMap:m&&Je,emissiveMap:It,normalMapObjectSpace:vt&&b.normalMapType===cy,normalMapTangentSpace:vt&&b.normalMapType===l0,metalnessMap:Qe,roughnessMap:F,anisotropy:L,anisotropyMap:Pe,clearcoat:le,clearcoatMap:Oe,clearcoatNormalMap:mt,clearcoatRoughnessMap:Ee,dispersion:ge,iridescence:xe,iridescenceMap:ke,iridescenceThicknessMap:it,sheen:pe,sheenColorMap:rt,sheenRoughnessMap:He,specularMap:_t,specularColorMap:ct,specularIntensityMap:Lt,transmission:qe,transmissionMap:J,thicknessMap:Le,gradientMap:de,opaque:b.transparent===!1&&b.blending===Ao&&b.alphaToCoverage===!1,alphaMap:me,alphaTest:De,alphaHash:Ne,combine:b.combine,mapUv:Dt&&E(b.map.channel),aoMapUv:ne&&E(b.aoMap.channel),lightMapUv:Nn&&E(b.lightMap.channel),bumpMapUv:yt&&E(b.bumpMap.channel),normalMapUv:vt&&E(b.normalMap.channel),displacementMapUv:Je&&E(b.displacementMap.channel),emissiveMapUv:It&&E(b.emissiveMap.channel),metalnessMapUv:Qe&&E(b.metalnessMap.channel),roughnessMapUv:F&&E(b.roughnessMap.channel),anisotropyMapUv:Pe&&E(b.anisotropyMap.channel),clearcoatMapUv:Oe&&E(b.clearcoatMap.channel),clearcoatNormalMapUv:mt&&E(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&E(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ke&&E(b.iridescenceMap.channel),iridescenceThicknessMapUv:it&&E(b.iridescenceThicknessMap.channel),sheenColorMapUv:rt&&E(b.sheenColorMap.channel),sheenRoughnessMapUv:He&&E(b.sheenRoughnessMap.channel),specularMapUv:_t&&E(b.specularMap.channel),specularColorMapUv:ct&&E(b.specularColorMap.channel),specularIntensityMapUv:Lt&&E(b.specularIntensityMap.channel),transmissionMapUv:J&&E(b.transmissionMap.channel),thicknessMapUv:Le&&E(b.thicknessMap.channel),alphaMapUv:me&&E(b.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(vt||L),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!X.attributes.uv&&(Dt||me),fog:!!j,useFog:b.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:v,reverseDepthBuffer:Ce,skinning:k.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:G,morphTextureStride:Q,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:b.dithering,shadowMapEnabled:a.shadowMap.enabled&&B.length>0,shadowMapType:a.shadowMap.type,toneMapping:Vt,decodeVideoTexture:Dt&&b.map.isVideoTexture===!0&&Ct.getTransfer(b.map.colorSpace)===Ut,decodeVideoTextureEmissive:It&&b.emissiveMap.isVideoTexture===!0&&Ct.getTransfer(b.emissiveMap.colorSpace)===Ut,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===ji,flipSided:b.side===Kn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:ut&&b.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ut&&b.extensions.multiDraw===!0||nt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return an.vertexUv1s=f.has(1),an.vertexUv2s=f.has(2),an.vertexUv3s=f.has(3),f.clear(),an}function _(b){const C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(const B in b.defines)C.push(B),C.push(b.defines[B]);return b.isRawShaderMaterial===!1&&(w(C,b),A(C,b),C.push(a.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function w(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function A(b,C){u.disableAll(),C.supportsVertexTextures&&u.enable(0),C.instancing&&u.enable(1),C.instancingColor&&u.enable(2),C.instancingMorph&&u.enable(3),C.matcap&&u.enable(4),C.envMap&&u.enable(5),C.normalMapObjectSpace&&u.enable(6),C.normalMapTangentSpace&&u.enable(7),C.clearcoat&&u.enable(8),C.iridescence&&u.enable(9),C.alphaTest&&u.enable(10),C.vertexColors&&u.enable(11),C.vertexAlphas&&u.enable(12),C.vertexUv1s&&u.enable(13),C.vertexUv2s&&u.enable(14),C.vertexUv3s&&u.enable(15),C.vertexTangents&&u.enable(16),C.anisotropy&&u.enable(17),C.alphaHash&&u.enable(18),C.batching&&u.enable(19),C.dispersion&&u.enable(20),C.batchingColor&&u.enable(21),b.push(u.mask),u.disableAll(),C.fog&&u.enable(0),C.useFog&&u.enable(1),C.flatShading&&u.enable(2),C.logarithmicDepthBuffer&&u.enable(3),C.reverseDepthBuffer&&u.enable(4),C.skinning&&u.enable(5),C.morphTargets&&u.enable(6),C.morphNormals&&u.enable(7),C.morphColors&&u.enable(8),C.premultipliedAlpha&&u.enable(9),C.shadowMapEnabled&&u.enable(10),C.doubleSided&&u.enable(11),C.flipSided&&u.enable(12),C.useDepthPacking&&u.enable(13),C.dithering&&u.enable(14),C.transmission&&u.enable(15),C.sheen&&u.enable(16),C.opaque&&u.enable(17),C.pointsUvs&&u.enable(18),C.decodeVideoTexture&&u.enable(19),C.decodeVideoTextureEmissive&&u.enable(20),C.alphaToCoverage&&u.enable(21),b.push(u.mask)}function T(b){const C=S[b.type];let B;if(C){const O=Wi[C];B=v0.clone(O.uniforms)}else B=b.uniforms;return B}function U(b,C){let B;for(let O=0,k=p.length;O<k;O++){const j=p[O];if(j.cacheKey===C){B=j,++B.usedTimes;break}}return B===void 0&&(B=new $w(a,C,b,o),p.push(B)),B}function N(b){if(--b.usedTimes===0){const C=p.indexOf(b);p[C]=p[p.length-1],p.pop(),b.destroy()}}function D(b){d.remove(b)}function z(){d.dispose()}return{getParameters:y,getProgramCacheKey:_,getUniforms:T,acquireProgram:U,releaseProgram:N,releaseShaderCache:D,programs:p,dispose:z}}function t1(){let a=new WeakMap;function e(c){return a.has(c)}function t(c){let u=a.get(c);return u===void 0&&(u={},a.set(c,u)),u}function i(c){a.delete(c)}function s(c,u,d){a.get(c)[u]=d}function o(){a=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:o}}function n1(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.material.id!==e.material.id?a.material.id-e.material.id:a.z!==e.z?a.z-e.z:a.id-e.id}function tv(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.z!==e.z?e.z-a.z:a.id-e.id}function nv(){const a=[];let e=0;const t=[],i=[],s=[];function o(){e=0,t.length=0,i.length=0,s.length=0}function c(v,m,x,S,E,y){let _=a[e];return _===void 0?(_={id:v.id,object:v,geometry:m,material:x,groupOrder:S,renderOrder:v.renderOrder,z:E,group:y},a[e]=_):(_.id=v.id,_.object=v,_.geometry=m,_.material=x,_.groupOrder=S,_.renderOrder=v.renderOrder,_.z=E,_.group=y),e++,_}function u(v,m,x,S,E,y){const _=c(v,m,x,S,E,y);x.transmission>0?i.push(_):x.transparent===!0?s.push(_):t.push(_)}function d(v,m,x,S,E,y){const _=c(v,m,x,S,E,y);x.transmission>0?i.unshift(_):x.transparent===!0?s.unshift(_):t.unshift(_)}function f(v,m){t.length>1&&t.sort(v||n1),i.length>1&&i.sort(m||tv),s.length>1&&s.sort(m||tv)}function p(){for(let v=e,m=a.length;v<m;v++){const x=a[v];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:i,transparent:s,init:o,push:u,unshift:d,finish:p,sort:f}}function i1(){let a=new WeakMap;function e(i,s){const o=a.get(i);let c;return o===void 0?(c=new nv,a.set(i,[c])):s>=o.length?(c=new nv,o.push(c)):c=o[s],c}function t(){a=new WeakMap}return{get:e,dispose:t}}function r1(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new $,color:new at};break;case"SpotLight":t={position:new $,direction:new $,color:new at,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new $,color:new at,distance:0,decay:0};break;case"HemisphereLight":t={direction:new $,skyColor:new at,groundColor:new at};break;case"RectAreaLight":t={color:new at,position:new $,halfWidth:new $,halfHeight:new $};break}return a[e.id]=t,t}}}function s1(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et,shadowCameraNear:1,shadowCameraFar:1e3};break}return a[e.id]=t,t}}}let o1=0;function a1(a,e){return(e.castShadow?2:0)-(a.castShadow?2:0)+(e.map?1:0)-(a.map?1:0)}function l1(a){const e=new r1,t=s1(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)i.probe.push(new $);const s=new $,o=new Ht,c=new Ht;function u(f){let p=0,v=0,m=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let x=0,S=0,E=0,y=0,_=0,w=0,A=0,T=0,U=0,N=0,D=0;f.sort(a1);for(let b=0,C=f.length;b<C;b++){const B=f[b],O=B.color,k=B.intensity,j=B.distance,X=B.shadow&&B.shadow.map?B.shadow.map.texture:null;if(B.isAmbientLight)p+=O.r*k,v+=O.g*k,m+=O.b*k;else if(B.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(B.sh.coefficients[W],k);D++}else if(B.isDirectionalLight){const W=e.get(B);if(W.color.copy(B.color).multiplyScalar(B.intensity),B.castShadow){const ie=B.shadow,H=t.get(B);H.shadowIntensity=ie.intensity,H.shadowBias=ie.bias,H.shadowNormalBias=ie.normalBias,H.shadowRadius=ie.radius,H.shadowMapSize=ie.mapSize,i.directionalShadow[x]=H,i.directionalShadowMap[x]=X,i.directionalShadowMatrix[x]=B.shadow.matrix,w++}i.directional[x]=W,x++}else if(B.isSpotLight){const W=e.get(B);W.position.setFromMatrixPosition(B.matrixWorld),W.color.copy(O).multiplyScalar(k),W.distance=j,W.coneCos=Math.cos(B.angle),W.penumbraCos=Math.cos(B.angle*(1-B.penumbra)),W.decay=B.decay,i.spot[E]=W;const ie=B.shadow;if(B.map&&(i.spotLightMap[U]=B.map,U++,ie.updateMatrices(B),B.castShadow&&N++),i.spotLightMatrix[E]=ie.matrix,B.castShadow){const H=t.get(B);H.shadowIntensity=ie.intensity,H.shadowBias=ie.bias,H.shadowNormalBias=ie.normalBias,H.shadowRadius=ie.radius,H.shadowMapSize=ie.mapSize,i.spotShadow[E]=H,i.spotShadowMap[E]=X,T++}E++}else if(B.isRectAreaLight){const W=e.get(B);W.color.copy(O).multiplyScalar(k),W.halfWidth.set(B.width*.5,0,0),W.halfHeight.set(0,B.height*.5,0),i.rectArea[y]=W,y++}else if(B.isPointLight){const W=e.get(B);if(W.color.copy(B.color).multiplyScalar(B.intensity),W.distance=B.distance,W.decay=B.decay,B.castShadow){const ie=B.shadow,H=t.get(B);H.shadowIntensity=ie.intensity,H.shadowBias=ie.bias,H.shadowNormalBias=ie.normalBias,H.shadowRadius=ie.radius,H.shadowMapSize=ie.mapSize,H.shadowCameraNear=ie.camera.near,H.shadowCameraFar=ie.camera.far,i.pointShadow[S]=H,i.pointShadowMap[S]=X,i.pointShadowMatrix[S]=B.shadow.matrix,A++}i.point[S]=W,S++}else if(B.isHemisphereLight){const W=e.get(B);W.skyColor.copy(B.color).multiplyScalar(k),W.groundColor.copy(B.groundColor).multiplyScalar(k),i.hemi[_]=W,_++}}y>0&&(a.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Re.LTC_FLOAT_1,i.rectAreaLTC2=Re.LTC_FLOAT_2):(i.rectAreaLTC1=Re.LTC_HALF_1,i.rectAreaLTC2=Re.LTC_HALF_2)),i.ambient[0]=p,i.ambient[1]=v,i.ambient[2]=m;const z=i.hash;(z.directionalLength!==x||z.pointLength!==S||z.spotLength!==E||z.rectAreaLength!==y||z.hemiLength!==_||z.numDirectionalShadows!==w||z.numPointShadows!==A||z.numSpotShadows!==T||z.numSpotMaps!==U||z.numLightProbes!==D)&&(i.directional.length=x,i.spot.length=E,i.rectArea.length=y,i.point.length=S,i.hemi.length=_,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=A,i.pointShadowMap.length=A,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=A,i.spotLightMatrix.length=T+U-N,i.spotLightMap.length=U,i.numSpotLightShadowsWithMaps=N,i.numLightProbes=D,z.directionalLength=x,z.pointLength=S,z.spotLength=E,z.rectAreaLength=y,z.hemiLength=_,z.numDirectionalShadows=w,z.numPointShadows=A,z.numSpotShadows=T,z.numSpotMaps=U,z.numLightProbes=D,i.version=o1++)}function d(f,p){let v=0,m=0,x=0,S=0,E=0;const y=p.matrixWorldInverse;for(let _=0,w=f.length;_<w;_++){const A=f[_];if(A.isDirectionalLight){const T=i.directional[v];T.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(y),v++}else if(A.isSpotLight){const T=i.spot[x];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(y),T.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(y),x++}else if(A.isRectAreaLight){const T=i.rectArea[S];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(y),c.identity(),o.copy(A.matrixWorld),o.premultiply(y),c.extractRotation(o),T.halfWidth.set(A.width*.5,0,0),T.halfHeight.set(0,A.height*.5,0),T.halfWidth.applyMatrix4(c),T.halfHeight.applyMatrix4(c),S++}else if(A.isPointLight){const T=i.point[m];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(y),m++}else if(A.isHemisphereLight){const T=i.hemi[E];T.direction.setFromMatrixPosition(A.matrixWorld),T.direction.transformDirection(y),E++}}}return{setup:u,setupView:d,state:i}}function iv(a){const e=new l1(a),t=[],i=[];function s(p){f.camera=p,t.length=0,i.length=0}function o(p){t.push(p)}function c(p){i.push(p)}function u(){e.setup(t)}function d(p){e.setupView(t,p)}const f={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:f,setupLights:u,setupLightsView:d,pushLight:o,pushShadow:c}}function c1(a){let e=new WeakMap;function t(s,o=0){const c=e.get(s);let u;return c===void 0?(u=new iv(a),e.set(s,[u])):o>=c.length?(u=new iv(a),c.push(u)):u=c[o],u}function i(){e=new WeakMap}return{get:t,dispose:i}}class u1 extends zo{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=ay,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class h1 extends zo{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const d1=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,f1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function p1(a,e,t){let i=new yf;const s=new Et,o=new Et,c=new Jt,u=new u1({depthPacking:ly}),d=new h1,f={},p=t.maxTextureSize,v={[Qr]:Kn,[Kn]:Qr,[ji]:ji},m=new Ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Et},radius:{value:4}},vertexShader:d1,fragmentShader:f1}),x=m.clone();x.defines.HORIZONTAL_PASS=1;const S=new Sn;S.setAttribute("position",new Qn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new Fe(S,m),y=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zv;let _=this.type;this.render=function(N,D,z){if(y.enabled===!1||y.autoUpdate===!1&&y.needsUpdate===!1||N.length===0)return;const b=a.getRenderTarget(),C=a.getActiveCubeFace(),B=a.getActiveMipmapLevel(),O=a.state;O.setBlending($r),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const k=_!==fr&&this.type===fr,j=_===fr&&this.type!==fr;for(let X=0,W=N.length;X<W;X++){const ie=N[X],H=ie.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",ie,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const q=H.getFrameExtents();if(s.multiply(q),o.copy(H.mapSize),(s.x>p||s.y>p)&&(s.x>p&&(o.x=Math.floor(p/q.x),s.x=o.x*q.x,H.mapSize.x=o.x),s.y>p&&(o.y=Math.floor(p/q.y),s.y=o.y*q.y,H.mapSize.y=o.y)),H.map===null||k===!0||j===!0){const G=this.type!==fr?{minFilter:Ii,magFilter:Ii}:{};H.map!==null&&H.map.dispose(),H.map=new Ds(s.x,s.y,G),H.map.texture.name=ie.name+".shadowMap",H.camera.updateProjectionMatrix()}a.setRenderTarget(H.map),a.clear();const oe=H.getViewportCount();for(let G=0;G<oe;G++){const Q=H.getViewport(G);c.set(o.x*Q.x,o.y*Q.y,o.x*Q.z,o.y*Q.w),O.viewport(c),H.updateMatrices(ie,G),i=H.getFrustum(),T(D,z,H.camera,ie,this.type)}H.isPointLightShadow!==!0&&this.type===fr&&w(H,z),H.needsUpdate=!1}_=this.type,y.needsUpdate=!1,a.setRenderTarget(b,C,B)};function w(N,D){const z=e.update(E);m.defines.VSM_SAMPLES!==N.blurSamples&&(m.defines.VSM_SAMPLES=N.blurSamples,x.defines.VSM_SAMPLES=N.blurSamples,m.needsUpdate=!0,x.needsUpdate=!0),N.mapPass===null&&(N.mapPass=new Ds(s.x,s.y)),m.uniforms.shadow_pass.value=N.map.texture,m.uniforms.resolution.value=N.mapSize,m.uniforms.radius.value=N.radius,a.setRenderTarget(N.mapPass),a.clear(),a.renderBufferDirect(D,null,z,m,E,null),x.uniforms.shadow_pass.value=N.mapPass.texture,x.uniforms.resolution.value=N.mapSize,x.uniforms.radius.value=N.radius,a.setRenderTarget(N.map),a.clear(),a.renderBufferDirect(D,null,z,x,E,null)}function A(N,D,z,b){let C=null;const B=z.isPointLight===!0?N.customDistanceMaterial:N.customDepthMaterial;if(B!==void 0)C=B;else if(C=z.isPointLight===!0?d:u,a.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0){const O=C.uuid,k=D.uuid;let j=f[O];j===void 0&&(j={},f[O]=j);let X=j[k];X===void 0&&(X=C.clone(),j[k]=X,D.addEventListener("dispose",U)),C=X}if(C.visible=D.visible,C.wireframe=D.wireframe,b===fr?C.side=D.shadowSide!==null?D.shadowSide:D.side:C.side=D.shadowSide!==null?D.shadowSide:v[D.side],C.alphaMap=D.alphaMap,C.alphaTest=D.alphaTest,C.map=D.map,C.clipShadows=D.clipShadows,C.clippingPlanes=D.clippingPlanes,C.clipIntersection=D.clipIntersection,C.displacementMap=D.displacementMap,C.displacementScale=D.displacementScale,C.displacementBias=D.displacementBias,C.wireframeLinewidth=D.wireframeLinewidth,C.linewidth=D.linewidth,z.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const O=a.properties.get(C);O.light=z}return C}function T(N,D,z,b,C){if(N.visible===!1)return;if(N.layers.test(D.layers)&&(N.isMesh||N.isLine||N.isPoints)&&(N.castShadow||N.receiveShadow&&C===fr)&&(!N.frustumCulled||i.intersectsObject(N))){N.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,N.matrixWorld);const k=e.update(N),j=N.material;if(Array.isArray(j)){const X=k.groups;for(let W=0,ie=X.length;W<ie;W++){const H=X[W],q=j[H.materialIndex];if(q&&q.visible){const oe=A(N,q,b,C);N.onBeforeShadow(a,N,D,z,k,oe,H),a.renderBufferDirect(z,null,k,oe,N,H),N.onAfterShadow(a,N,D,z,k,oe,H)}}}else if(j.visible){const X=A(N,j,b,C);N.onBeforeShadow(a,N,D,z,k,X,null),a.renderBufferDirect(z,null,k,X,N,null),N.onAfterShadow(a,N,D,z,k,X,null)}}const O=N.children;for(let k=0,j=O.length;k<j;k++)T(O[k],D,z,b,C)}function U(N){N.target.removeEventListener("dispose",U);for(const z in f){const b=f[z],C=N.target.uuid;C in b&&(b[C].dispose(),delete b[C])}}}const m1={[Md]:Ed,[wd]:Cd,[Td]:Rd,[bo]:Ad,[Ed]:Md,[Cd]:wd,[Rd]:Td,[Ad]:bo};function g1(a,e){function t(){let J=!1;const Le=new Jt;let de=null;const me=new Jt(0,0,0,0);return{setMask:function(De){de!==De&&!J&&(a.colorMask(De,De,De,De),de=De)},setLocked:function(De){J=De},setClear:function(De,Ne,ut,Vt,an){an===!0&&(De*=Vt,Ne*=Vt,ut*=Vt),Le.set(De,Ne,ut,Vt),me.equals(Le)===!1&&(a.clearColor(De,Ne,ut,Vt),me.copy(Le))},reset:function(){J=!1,de=null,me.set(-1,0,0,0)}}}function i(){let J=!1,Le=!1,de=null,me=null,De=null;return{setReversed:function(Ne){if(Le!==Ne){const ut=e.get("EXT_clip_control");Le?ut.clipControlEXT(ut.LOWER_LEFT_EXT,ut.ZERO_TO_ONE_EXT):ut.clipControlEXT(ut.LOWER_LEFT_EXT,ut.NEGATIVE_ONE_TO_ONE_EXT);const Vt=De;De=null,this.setClear(Vt)}Le=Ne},getReversed:function(){return Le},setTest:function(Ne){Ne?_e(a.DEPTH_TEST):Ce(a.DEPTH_TEST)},setMask:function(Ne){de!==Ne&&!J&&(a.depthMask(Ne),de=Ne)},setFunc:function(Ne){if(Le&&(Ne=m1[Ne]),me!==Ne){switch(Ne){case Md:a.depthFunc(a.NEVER);break;case Ed:a.depthFunc(a.ALWAYS);break;case wd:a.depthFunc(a.LESS);break;case bo:a.depthFunc(a.LEQUAL);break;case Td:a.depthFunc(a.EQUAL);break;case Ad:a.depthFunc(a.GEQUAL);break;case Cd:a.depthFunc(a.GREATER);break;case Rd:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}me=Ne}},setLocked:function(Ne){J=Ne},setClear:function(Ne){De!==Ne&&(Le&&(Ne=1-Ne),a.clearDepth(Ne),De=Ne)},reset:function(){J=!1,de=null,me=null,De=null,Le=!1}}}function s(){let J=!1,Le=null,de=null,me=null,De=null,Ne=null,ut=null,Vt=null,an=null;return{setTest:function(Tt){J||(Tt?_e(a.STENCIL_TEST):Ce(a.STENCIL_TEST))},setMask:function(Tt){Le!==Tt&&!J&&(a.stencilMask(Tt),Le=Tt)},setFunc:function(Tt,kn,Dn){(de!==Tt||me!==kn||De!==Dn)&&(a.stencilFunc(Tt,kn,Dn),de=Tt,me=kn,De=Dn)},setOp:function(Tt,kn,Dn){(Ne!==Tt||ut!==kn||Vt!==Dn)&&(a.stencilOp(Tt,kn,Dn),Ne=Tt,ut=kn,Vt=Dn)},setLocked:function(Tt){J=Tt},setClear:function(Tt){an!==Tt&&(a.clearStencil(Tt),an=Tt)},reset:function(){J=!1,Le=null,de=null,me=null,De=null,Ne=null,ut=null,Vt=null,an=null}}}const o=new t,c=new i,u=new s,d=new WeakMap,f=new WeakMap;let p={},v={},m=new WeakMap,x=[],S=null,E=!1,y=null,_=null,w=null,A=null,T=null,U=null,N=null,D=new at(0,0,0),z=0,b=!1,C=null,B=null,O=null,k=null,j=null;const X=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,ie=0;const H=a.getParameter(a.VERSION);H.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(H)[1]),W=ie>=1):H.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),W=ie>=2);let q=null,oe={};const G=a.getParameter(a.SCISSOR_BOX),Q=a.getParameter(a.VIEWPORT),be=new Jt().fromArray(G),se=new Jt().fromArray(Q);function fe(J,Le,de,me){const De=new Uint8Array(4),Ne=a.createTexture();a.bindTexture(J,Ne),a.texParameteri(J,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(J,a.TEXTURE_MAG_FILTER,a.NEAREST);for(let ut=0;ut<de;ut++)J===a.TEXTURE_3D||J===a.TEXTURE_2D_ARRAY?a.texImage3D(Le,0,a.RGBA,1,1,me,0,a.RGBA,a.UNSIGNED_BYTE,De):a.texImage2D(Le+ut,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,De);return Ne}const Me={};Me[a.TEXTURE_2D]=fe(a.TEXTURE_2D,a.TEXTURE_2D,1),Me[a.TEXTURE_CUBE_MAP]=fe(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[a.TEXTURE_2D_ARRAY]=fe(a.TEXTURE_2D_ARRAY,a.TEXTURE_2D_ARRAY,1,1),Me[a.TEXTURE_3D]=fe(a.TEXTURE_3D,a.TEXTURE_3D,1,1),o.setClear(0,0,0,1),c.setClear(1),u.setClear(0),_e(a.DEPTH_TEST),c.setFunc(bo),yt(!1),vt(ag),_e(a.CULL_FACE),ne($r);function _e(J){p[J]!==!0&&(a.enable(J),p[J]=!0)}function Ce(J){p[J]!==!1&&(a.disable(J),p[J]=!1)}function ze(J,Le){return v[J]!==Le?(a.bindFramebuffer(J,Le),v[J]=Le,J===a.DRAW_FRAMEBUFFER&&(v[a.FRAMEBUFFER]=Le),J===a.FRAMEBUFFER&&(v[a.DRAW_FRAMEBUFFER]=Le),!0):!1}function nt(J,Le){let de=x,me=!1;if(J){de=m.get(Le),de===void 0&&(de=[],m.set(Le,de));const De=J.textures;if(de.length!==De.length||de[0]!==a.COLOR_ATTACHMENT0){for(let Ne=0,ut=De.length;Ne<ut;Ne++)de[Ne]=a.COLOR_ATTACHMENT0+Ne;de.length=De.length,me=!0}}else de[0]!==a.BACK&&(de[0]=a.BACK,me=!0);me&&a.drawBuffers(de)}function Dt(J){return S!==J?(a.useProgram(J),S=J,!0):!1}const St={[As]:a.FUNC_ADD,[Dx]:a.FUNC_SUBTRACT,[Ux]:a.FUNC_REVERSE_SUBTRACT};St[Fx]=a.MIN,St[zx]=a.MAX;const Bt={[Ox]:a.ZERO,[Bx]:a.ONE,[kx]:a.SRC_COLOR,[yd]:a.SRC_ALPHA,[Xx]:a.SRC_ALPHA_SATURATE,[Wx]:a.DST_COLOR,[Vx]:a.DST_ALPHA,[Hx]:a.ONE_MINUS_SRC_COLOR,[Sd]:a.ONE_MINUS_SRC_ALPHA,[jx]:a.ONE_MINUS_DST_COLOR,[Gx]:a.ONE_MINUS_DST_ALPHA,[qx]:a.CONSTANT_COLOR,[Yx]:a.ONE_MINUS_CONSTANT_COLOR,[Zx]:a.CONSTANT_ALPHA,[$x]:a.ONE_MINUS_CONSTANT_ALPHA};function ne(J,Le,de,me,De,Ne,ut,Vt,an,Tt){if(J===$r){E===!0&&(Ce(a.BLEND),E=!1);return}if(E===!1&&(_e(a.BLEND),E=!0),J!==Nx){if(J!==y||Tt!==b){if((_!==As||T!==As)&&(a.blendEquation(a.FUNC_ADD),_=As,T=As),Tt)switch(J){case Ao:a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case lg:a.blendFunc(a.ONE,a.ONE);break;case cg:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case ug:a.blendFuncSeparate(a.ZERO,a.SRC_COLOR,a.ZERO,a.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",J);break}else switch(J){case Ao:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case lg:a.blendFunc(a.SRC_ALPHA,a.ONE);break;case cg:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case ug:a.blendFunc(a.ZERO,a.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",J);break}w=null,A=null,U=null,N=null,D.set(0,0,0),z=0,y=J,b=Tt}return}De=De||Le,Ne=Ne||de,ut=ut||me,(Le!==_||De!==T)&&(a.blendEquationSeparate(St[Le],St[De]),_=Le,T=De),(de!==w||me!==A||Ne!==U||ut!==N)&&(a.blendFuncSeparate(Bt[de],Bt[me],Bt[Ne],Bt[ut]),w=de,A=me,U=Ne,N=ut),(Vt.equals(D)===!1||an!==z)&&(a.blendColor(Vt.r,Vt.g,Vt.b,an),D.copy(Vt),z=an),y=J,b=!1}function Nn(J,Le){J.side===ji?Ce(a.CULL_FACE):_e(a.CULL_FACE);let de=J.side===Kn;Le&&(de=!de),yt(de),J.blending===Ao&&J.transparent===!1?ne($r):ne(J.blending,J.blendEquation,J.blendSrc,J.blendDst,J.blendEquationAlpha,J.blendSrcAlpha,J.blendDstAlpha,J.blendColor,J.blendAlpha,J.premultipliedAlpha),c.setFunc(J.depthFunc),c.setTest(J.depthTest),c.setMask(J.depthWrite),o.setMask(J.colorWrite);const me=J.stencilWrite;u.setTest(me),me&&(u.setMask(J.stencilWriteMask),u.setFunc(J.stencilFunc,J.stencilRef,J.stencilFuncMask),u.setOp(J.stencilFail,J.stencilZFail,J.stencilZPass)),It(J.polygonOffset,J.polygonOffsetFactor,J.polygonOffsetUnits),J.alphaToCoverage===!0?_e(a.SAMPLE_ALPHA_TO_COVERAGE):Ce(a.SAMPLE_ALPHA_TO_COVERAGE)}function yt(J){C!==J&&(J?a.frontFace(a.CW):a.frontFace(a.CCW),C=J)}function vt(J){J!==Px?(_e(a.CULL_FACE),J!==B&&(J===ag?a.cullFace(a.BACK):J===Lx?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):Ce(a.CULL_FACE),B=J}function Je(J){J!==O&&(W&&a.lineWidth(J),O=J)}function It(J,Le,de){J?(_e(a.POLYGON_OFFSET_FILL),(k!==Le||j!==de)&&(a.polygonOffset(Le,de),k=Le,j=de)):Ce(a.POLYGON_OFFSET_FILL)}function Qe(J){J?_e(a.SCISSOR_TEST):Ce(a.SCISSOR_TEST)}function F(J){J===void 0&&(J=a.TEXTURE0+X-1),q!==J&&(a.activeTexture(J),q=J)}function L(J,Le,de){de===void 0&&(q===null?de=a.TEXTURE0+X-1:de=q);let me=oe[de];me===void 0&&(me={type:void 0,texture:void 0},oe[de]=me),(me.type!==J||me.texture!==Le)&&(q!==de&&(a.activeTexture(de),q=de),a.bindTexture(J,Le||Me[J]),me.type=J,me.texture=Le)}function le(){const J=oe[q];J!==void 0&&J.type!==void 0&&(a.bindTexture(J.type,null),J.type=void 0,J.texture=void 0)}function ge(){try{a.compressedTexImage2D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function xe(){try{a.compressedTexImage3D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function pe(){try{a.texSubImage2D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function qe(){try{a.texSubImage3D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function Pe(){try{a.compressedTexSubImage2D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function Oe(){try{a.compressedTexSubImage3D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function mt(){try{a.texStorage2D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function Ee(){try{a.texStorage3D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function ke(){try{a.texImage2D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function it(){try{a.texImage3D.apply(a,arguments)}catch(J){console.error("THREE.WebGLState:",J)}}function rt(J){be.equals(J)===!1&&(a.scissor(J.x,J.y,J.z,J.w),be.copy(J))}function He(J){se.equals(J)===!1&&(a.viewport(J.x,J.y,J.z,J.w),se.copy(J))}function _t(J,Le){let de=f.get(Le);de===void 0&&(de=new WeakMap,f.set(Le,de));let me=de.get(J);me===void 0&&(me=a.getUniformBlockIndex(Le,J.name),de.set(J,me))}function ct(J,Le){const me=f.get(Le).get(J);d.get(Le)!==me&&(a.uniformBlockBinding(Le,me,J.__bindingPointIndex),d.set(Le,me))}function Lt(){a.disable(a.BLEND),a.disable(a.CULL_FACE),a.disable(a.DEPTH_TEST),a.disable(a.POLYGON_OFFSET_FILL),a.disable(a.SCISSOR_TEST),a.disable(a.STENCIL_TEST),a.disable(a.SAMPLE_ALPHA_TO_COVERAGE),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ZERO),a.blendFuncSeparate(a.ONE,a.ZERO,a.ONE,a.ZERO),a.blendColor(0,0,0,0),a.colorMask(!0,!0,!0,!0),a.clearColor(0,0,0,0),a.depthMask(!0),a.depthFunc(a.LESS),c.setReversed(!1),a.clearDepth(1),a.stencilMask(4294967295),a.stencilFunc(a.ALWAYS,0,4294967295),a.stencilOp(a.KEEP,a.KEEP,a.KEEP),a.clearStencil(0),a.cullFace(a.BACK),a.frontFace(a.CCW),a.polygonOffset(0,0),a.activeTexture(a.TEXTURE0),a.bindFramebuffer(a.FRAMEBUFFER,null),a.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),a.bindFramebuffer(a.READ_FRAMEBUFFER,null),a.useProgram(null),a.lineWidth(1),a.scissor(0,0,a.canvas.width,a.canvas.height),a.viewport(0,0,a.canvas.width,a.canvas.height),p={},q=null,oe={},v={},m=new WeakMap,x=[],S=null,E=!1,y=null,_=null,w=null,A=null,T=null,U=null,N=null,D=new at(0,0,0),z=0,b=!1,C=null,B=null,O=null,k=null,j=null,be.set(0,0,a.canvas.width,a.canvas.height),se.set(0,0,a.canvas.width,a.canvas.height),o.reset(),c.reset(),u.reset()}return{buffers:{color:o,depth:c,stencil:u},enable:_e,disable:Ce,bindFramebuffer:ze,drawBuffers:nt,useProgram:Dt,setBlending:ne,setMaterial:Nn,setFlipSided:yt,setCullFace:vt,setLineWidth:Je,setPolygonOffset:It,setScissorTest:Qe,activeTexture:F,bindTexture:L,unbindTexture:le,compressedTexImage2D:ge,compressedTexImage3D:xe,texImage2D:ke,texImage3D:it,updateUBOMapping:_t,uniformBlockBinding:ct,texStorage2D:mt,texStorage3D:Ee,texSubImage2D:pe,texSubImage3D:qe,compressedTexSubImage2D:Pe,compressedTexSubImage3D:Oe,scissor:rt,viewport:He,reset:Lt}}function rv(a,e,t,i){const s=v1(i);switch(t){case t0:return a*e;case i0:return a*e;case r0:return a*e*2;case s0:return a*e/s.components*s.byteLength;case mf:return a*e/s.components*s.byteLength;case o0:return a*e*2/s.components*s.byteLength;case gf:return a*e*2/s.components*s.byteLength;case n0:return a*e*3/s.components*s.byteLength;case Pi:return a*e*4/s.components*s.byteLength;case vf:return a*e*4/s.components*s.byteLength;case Rc:case bc:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Pc:case Lc:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Nd:case Ud:return Math.max(a,16)*Math.max(e,8)/4;case Id:case Dd:return Math.max(a,8)*Math.max(e,8)/2;case Fd:case zd:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Od:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Bd:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case kd:return Math.floor((a+4)/5)*Math.floor((e+3)/4)*16;case Hd:return Math.floor((a+4)/5)*Math.floor((e+4)/5)*16;case Vd:return Math.floor((a+5)/6)*Math.floor((e+4)/5)*16;case Gd:return Math.floor((a+5)/6)*Math.floor((e+5)/6)*16;case Wd:return Math.floor((a+7)/8)*Math.floor((e+4)/5)*16;case jd:return Math.floor((a+7)/8)*Math.floor((e+5)/6)*16;case Xd:return Math.floor((a+7)/8)*Math.floor((e+7)/8)*16;case qd:return Math.floor((a+9)/10)*Math.floor((e+4)/5)*16;case Yd:return Math.floor((a+9)/10)*Math.floor((e+5)/6)*16;case Zd:return Math.floor((a+9)/10)*Math.floor((e+7)/8)*16;case $d:return Math.floor((a+9)/10)*Math.floor((e+9)/10)*16;case Kd:return Math.floor((a+11)/12)*Math.floor((e+9)/10)*16;case Qd:return Math.floor((a+11)/12)*Math.floor((e+11)/12)*16;case Ic:case Jd:case ef:return Math.ceil(a/4)*Math.ceil(e/4)*16;case a0:case tf:return Math.ceil(a/4)*Math.ceil(e/4)*8;case nf:case rf:return Math.ceil(a/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function v1(a){switch(a){case xr:case Qv:return{byteLength:1,components:1};case za:case Jv:case ka:return{byteLength:2,components:1};case ff:case pf:return{byteLength:2,components:4};case Ns:case df:case gr:return{byteLength:4,components:1};case e0:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${a}.`)}function _1(a,e,t,i,s,o,c){const u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new Et,p=new WeakMap;let v;const m=new WeakMap;let x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(F,L){return x?new OffscreenCanvas(F,L):Oa("canvas")}function E(F,L,le){let ge=1;const xe=Qe(F);if((xe.width>le||xe.height>le)&&(ge=le/Math.max(xe.width,xe.height)),ge<1)if(typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&F instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&F instanceof ImageBitmap||typeof VideoFrame<"u"&&F instanceof VideoFrame){const pe=Math.floor(ge*xe.width),qe=Math.floor(ge*xe.height);v===void 0&&(v=S(pe,qe));const Pe=L?S(pe,qe):v;return Pe.width=pe,Pe.height=qe,Pe.getContext("2d").drawImage(F,0,0,pe,qe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+xe.width+"x"+xe.height+") to ("+pe+"x"+qe+")."),Pe}else return"data"in F&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+xe.width+"x"+xe.height+")."),F;return F}function y(F){return F.generateMipmaps}function _(F){a.generateMipmap(F)}function w(F){return F.isWebGLCubeRenderTarget?a.TEXTURE_CUBE_MAP:F.isWebGL3DRenderTarget?a.TEXTURE_3D:F.isWebGLArrayRenderTarget||F.isCompressedArrayTexture?a.TEXTURE_2D_ARRAY:a.TEXTURE_2D}function A(F,L,le,ge,xe=!1){if(F!==null){if(a[F]!==void 0)return a[F];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+F+"'")}let pe=L;if(L===a.RED&&(le===a.FLOAT&&(pe=a.R32F),le===a.HALF_FLOAT&&(pe=a.R16F),le===a.UNSIGNED_BYTE&&(pe=a.R8)),L===a.RED_INTEGER&&(le===a.UNSIGNED_BYTE&&(pe=a.R8UI),le===a.UNSIGNED_SHORT&&(pe=a.R16UI),le===a.UNSIGNED_INT&&(pe=a.R32UI),le===a.BYTE&&(pe=a.R8I),le===a.SHORT&&(pe=a.R16I),le===a.INT&&(pe=a.R32I)),L===a.RG&&(le===a.FLOAT&&(pe=a.RG32F),le===a.HALF_FLOAT&&(pe=a.RG16F),le===a.UNSIGNED_BYTE&&(pe=a.RG8)),L===a.RG_INTEGER&&(le===a.UNSIGNED_BYTE&&(pe=a.RG8UI),le===a.UNSIGNED_SHORT&&(pe=a.RG16UI),le===a.UNSIGNED_INT&&(pe=a.RG32UI),le===a.BYTE&&(pe=a.RG8I),le===a.SHORT&&(pe=a.RG16I),le===a.INT&&(pe=a.RG32I)),L===a.RGB_INTEGER&&(le===a.UNSIGNED_BYTE&&(pe=a.RGB8UI),le===a.UNSIGNED_SHORT&&(pe=a.RGB16UI),le===a.UNSIGNED_INT&&(pe=a.RGB32UI),le===a.BYTE&&(pe=a.RGB8I),le===a.SHORT&&(pe=a.RGB16I),le===a.INT&&(pe=a.RGB32I)),L===a.RGBA_INTEGER&&(le===a.UNSIGNED_BYTE&&(pe=a.RGBA8UI),le===a.UNSIGNED_SHORT&&(pe=a.RGBA16UI),le===a.UNSIGNED_INT&&(pe=a.RGBA32UI),le===a.BYTE&&(pe=a.RGBA8I),le===a.SHORT&&(pe=a.RGBA16I),le===a.INT&&(pe=a.RGBA32I)),L===a.RGB&&le===a.UNSIGNED_INT_5_9_9_9_REV&&(pe=a.RGB9_E5),L===a.RGBA){const qe=xe?Wc:Ct.getTransfer(ge);le===a.FLOAT&&(pe=a.RGBA32F),le===a.HALF_FLOAT&&(pe=a.RGBA16F),le===a.UNSIGNED_BYTE&&(pe=qe===Ut?a.SRGB8_ALPHA8:a.RGBA8),le===a.UNSIGNED_SHORT_4_4_4_4&&(pe=a.RGBA4),le===a.UNSIGNED_SHORT_5_5_5_1&&(pe=a.RGB5_A1)}return(pe===a.R16F||pe===a.R32F||pe===a.RG16F||pe===a.RG32F||pe===a.RGBA16F||pe===a.RGBA32F)&&e.get("EXT_color_buffer_float"),pe}function T(F,L){let le;return F?L===null||L===Ns||L===Io?le=a.DEPTH24_STENCIL8:L===gr?le=a.DEPTH32F_STENCIL8:L===za&&(le=a.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):L===null||L===Ns||L===Io?le=a.DEPTH_COMPONENT24:L===gr?le=a.DEPTH_COMPONENT32F:L===za&&(le=a.DEPTH_COMPONENT16),le}function U(F,L){return y(F)===!0||F.isFramebufferTexture&&F.minFilter!==Ii&&F.minFilter!==Xi?Math.log2(Math.max(L.width,L.height))+1:F.mipmaps!==void 0&&F.mipmaps.length>0?F.mipmaps.length:F.isCompressedTexture&&Array.isArray(F.image)?L.mipmaps.length:1}function N(F){const L=F.target;L.removeEventListener("dispose",N),z(L),L.isVideoTexture&&p.delete(L)}function D(F){const L=F.target;L.removeEventListener("dispose",D),C(L)}function z(F){const L=i.get(F);if(L.__webglInit===void 0)return;const le=F.source,ge=m.get(le);if(ge){const xe=ge[L.__cacheKey];xe.usedTimes--,xe.usedTimes===0&&b(F),Object.keys(ge).length===0&&m.delete(le)}i.remove(F)}function b(F){const L=i.get(F);a.deleteTexture(L.__webglTexture);const le=F.source,ge=m.get(le);delete ge[L.__cacheKey],c.memory.textures--}function C(F){const L=i.get(F);if(F.depthTexture&&(F.depthTexture.dispose(),i.remove(F.depthTexture)),F.isWebGLCubeRenderTarget)for(let ge=0;ge<6;ge++){if(Array.isArray(L.__webglFramebuffer[ge]))for(let xe=0;xe<L.__webglFramebuffer[ge].length;xe++)a.deleteFramebuffer(L.__webglFramebuffer[ge][xe]);else a.deleteFramebuffer(L.__webglFramebuffer[ge]);L.__webglDepthbuffer&&a.deleteRenderbuffer(L.__webglDepthbuffer[ge])}else{if(Array.isArray(L.__webglFramebuffer))for(let ge=0;ge<L.__webglFramebuffer.length;ge++)a.deleteFramebuffer(L.__webglFramebuffer[ge]);else a.deleteFramebuffer(L.__webglFramebuffer);if(L.__webglDepthbuffer&&a.deleteRenderbuffer(L.__webglDepthbuffer),L.__webglMultisampledFramebuffer&&a.deleteFramebuffer(L.__webglMultisampledFramebuffer),L.__webglColorRenderbuffer)for(let ge=0;ge<L.__webglColorRenderbuffer.length;ge++)L.__webglColorRenderbuffer[ge]&&a.deleteRenderbuffer(L.__webglColorRenderbuffer[ge]);L.__webglDepthRenderbuffer&&a.deleteRenderbuffer(L.__webglDepthRenderbuffer)}const le=F.textures;for(let ge=0,xe=le.length;ge<xe;ge++){const pe=i.get(le[ge]);pe.__webglTexture&&(a.deleteTexture(pe.__webglTexture),c.memory.textures--),i.remove(le[ge])}i.remove(F)}let B=0;function O(){B=0}function k(){const F=B;return F>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+F+" texture units while this GPU supports only "+s.maxTextures),B+=1,F}function j(F){const L=[];return L.push(F.wrapS),L.push(F.wrapT),L.push(F.wrapR||0),L.push(F.magFilter),L.push(F.minFilter),L.push(F.anisotropy),L.push(F.internalFormat),L.push(F.format),L.push(F.type),L.push(F.generateMipmaps),L.push(F.premultiplyAlpha),L.push(F.flipY),L.push(F.unpackAlignment),L.push(F.colorSpace),L.join()}function X(F,L){const le=i.get(F);if(F.isVideoTexture&&Je(F),F.isRenderTargetTexture===!1&&F.version>0&&le.__version!==F.version){const ge=F.image;if(ge===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ge.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{se(le,F,L);return}}t.bindTexture(a.TEXTURE_2D,le.__webglTexture,a.TEXTURE0+L)}function W(F,L){const le=i.get(F);if(F.version>0&&le.__version!==F.version){se(le,F,L);return}t.bindTexture(a.TEXTURE_2D_ARRAY,le.__webglTexture,a.TEXTURE0+L)}function ie(F,L){const le=i.get(F);if(F.version>0&&le.__version!==F.version){se(le,F,L);return}t.bindTexture(a.TEXTURE_3D,le.__webglTexture,a.TEXTURE0+L)}function H(F,L){const le=i.get(F);if(F.version>0&&le.__version!==F.version){fe(le,F,L);return}t.bindTexture(a.TEXTURE_CUBE_MAP,le.__webglTexture,a.TEXTURE0+L)}const q={[Is]:a.REPEAT,[Ps]:a.CLAMP_TO_EDGE,[Ld]:a.MIRRORED_REPEAT},oe={[Ii]:a.NEAREST,[oy]:a.NEAREST_MIPMAP_NEAREST,[Zl]:a.NEAREST_MIPMAP_LINEAR,[Xi]:a.LINEAR,[Dh]:a.LINEAR_MIPMAP_NEAREST,[Ls]:a.LINEAR_MIPMAP_LINEAR},G={[uy]:a.NEVER,[gy]:a.ALWAYS,[hy]:a.LESS,[c0]:a.LEQUAL,[dy]:a.EQUAL,[my]:a.GEQUAL,[fy]:a.GREATER,[py]:a.NOTEQUAL};function Q(F,L){if(L.type===gr&&e.has("OES_texture_float_linear")===!1&&(L.magFilter===Xi||L.magFilter===Dh||L.magFilter===Zl||L.magFilter===Ls||L.minFilter===Xi||L.minFilter===Dh||L.minFilter===Zl||L.minFilter===Ls)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),a.texParameteri(F,a.TEXTURE_WRAP_S,q[L.wrapS]),a.texParameteri(F,a.TEXTURE_WRAP_T,q[L.wrapT]),(F===a.TEXTURE_3D||F===a.TEXTURE_2D_ARRAY)&&a.texParameteri(F,a.TEXTURE_WRAP_R,q[L.wrapR]),a.texParameteri(F,a.TEXTURE_MAG_FILTER,oe[L.magFilter]),a.texParameteri(F,a.TEXTURE_MIN_FILTER,oe[L.minFilter]),L.compareFunction&&(a.texParameteri(F,a.TEXTURE_COMPARE_MODE,a.COMPARE_REF_TO_TEXTURE),a.texParameteri(F,a.TEXTURE_COMPARE_FUNC,G[L.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(L.magFilter===Ii||L.minFilter!==Zl&&L.minFilter!==Ls||L.type===gr&&e.has("OES_texture_float_linear")===!1)return;if(L.anisotropy>1||i.get(L).__currentAnisotropy){const le=e.get("EXT_texture_filter_anisotropic");a.texParameterf(F,le.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(L.anisotropy,s.getMaxAnisotropy())),i.get(L).__currentAnisotropy=L.anisotropy}}}function be(F,L){let le=!1;F.__webglInit===void 0&&(F.__webglInit=!0,L.addEventListener("dispose",N));const ge=L.source;let xe=m.get(ge);xe===void 0&&(xe={},m.set(ge,xe));const pe=j(L);if(pe!==F.__cacheKey){xe[pe]===void 0&&(xe[pe]={texture:a.createTexture(),usedTimes:0},c.memory.textures++,le=!0),xe[pe].usedTimes++;const qe=xe[F.__cacheKey];qe!==void 0&&(xe[F.__cacheKey].usedTimes--,qe.usedTimes===0&&b(L)),F.__cacheKey=pe,F.__webglTexture=xe[pe].texture}return le}function se(F,L,le){let ge=a.TEXTURE_2D;(L.isDataArrayTexture||L.isCompressedArrayTexture)&&(ge=a.TEXTURE_2D_ARRAY),L.isData3DTexture&&(ge=a.TEXTURE_3D);const xe=be(F,L),pe=L.source;t.bindTexture(ge,F.__webglTexture,a.TEXTURE0+le);const qe=i.get(pe);if(pe.version!==qe.__version||xe===!0){t.activeTexture(a.TEXTURE0+le);const Pe=Ct.getPrimaries(Ct.workingColorSpace),Oe=L.colorSpace===Zr?null:Ct.getPrimaries(L.colorSpace),mt=L.colorSpace===Zr||Pe===Oe?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,L.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,L.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,mt);let Ee=E(L.image,!1,s.maxTextureSize);Ee=It(L,Ee);const ke=o.convert(L.format,L.colorSpace),it=o.convert(L.type);let rt=A(L.internalFormat,ke,it,L.colorSpace,L.isVideoTexture);Q(ge,L);let He;const _t=L.mipmaps,ct=L.isVideoTexture!==!0,Lt=qe.__version===void 0||xe===!0,J=pe.dataReady,Le=U(L,Ee);if(L.isDepthTexture)rt=T(L.format===No,L.type),Lt&&(ct?t.texStorage2D(a.TEXTURE_2D,1,rt,Ee.width,Ee.height):t.texImage2D(a.TEXTURE_2D,0,rt,Ee.width,Ee.height,0,ke,it,null));else if(L.isDataTexture)if(_t.length>0){ct&&Lt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,_t[0].width,_t[0].height);for(let de=0,me=_t.length;de<me;de++)He=_t[de],ct?J&&t.texSubImage2D(a.TEXTURE_2D,de,0,0,He.width,He.height,ke,it,He.data):t.texImage2D(a.TEXTURE_2D,de,rt,He.width,He.height,0,ke,it,He.data);L.generateMipmaps=!1}else ct?(Lt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,Ee.width,Ee.height),J&&t.texSubImage2D(a.TEXTURE_2D,0,0,0,Ee.width,Ee.height,ke,it,Ee.data)):t.texImage2D(a.TEXTURE_2D,0,rt,Ee.width,Ee.height,0,ke,it,Ee.data);else if(L.isCompressedTexture)if(L.isCompressedArrayTexture){ct&&Lt&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Le,rt,_t[0].width,_t[0].height,Ee.depth);for(let de=0,me=_t.length;de<me;de++)if(He=_t[de],L.format!==Pi)if(ke!==null)if(ct){if(J)if(L.layerUpdates.size>0){const De=rv(He.width,He.height,L.format,L.type);for(const Ne of L.layerUpdates){const ut=He.data.subarray(Ne*De/He.data.BYTES_PER_ELEMENT,(Ne+1)*De/He.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,de,0,0,Ne,He.width,He.height,1,ke,ut)}L.clearLayerUpdates()}else t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,de,0,0,0,He.width,He.height,Ee.depth,ke,He.data)}else t.compressedTexImage3D(a.TEXTURE_2D_ARRAY,de,rt,He.width,He.height,Ee.depth,0,He.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ct?J&&t.texSubImage3D(a.TEXTURE_2D_ARRAY,de,0,0,0,He.width,He.height,Ee.depth,ke,it,He.data):t.texImage3D(a.TEXTURE_2D_ARRAY,de,rt,He.width,He.height,Ee.depth,0,ke,it,He.data)}else{ct&&Lt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,_t[0].width,_t[0].height);for(let de=0,me=_t.length;de<me;de++)He=_t[de],L.format!==Pi?ke!==null?ct?J&&t.compressedTexSubImage2D(a.TEXTURE_2D,de,0,0,He.width,He.height,ke,He.data):t.compressedTexImage2D(a.TEXTURE_2D,de,rt,He.width,He.height,0,He.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ct?J&&t.texSubImage2D(a.TEXTURE_2D,de,0,0,He.width,He.height,ke,it,He.data):t.texImage2D(a.TEXTURE_2D,de,rt,He.width,He.height,0,ke,it,He.data)}else if(L.isDataArrayTexture)if(ct){if(Lt&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Le,rt,Ee.width,Ee.height,Ee.depth),J)if(L.layerUpdates.size>0){const de=rv(Ee.width,Ee.height,L.format,L.type);for(const me of L.layerUpdates){const De=Ee.data.subarray(me*de/Ee.data.BYTES_PER_ELEMENT,(me+1)*de/Ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,me,Ee.width,Ee.height,1,ke,it,De)}L.clearLayerUpdates()}else t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,0,Ee.width,Ee.height,Ee.depth,ke,it,Ee.data)}else t.texImage3D(a.TEXTURE_2D_ARRAY,0,rt,Ee.width,Ee.height,Ee.depth,0,ke,it,Ee.data);else if(L.isData3DTexture)ct?(Lt&&t.texStorage3D(a.TEXTURE_3D,Le,rt,Ee.width,Ee.height,Ee.depth),J&&t.texSubImage3D(a.TEXTURE_3D,0,0,0,0,Ee.width,Ee.height,Ee.depth,ke,it,Ee.data)):t.texImage3D(a.TEXTURE_3D,0,rt,Ee.width,Ee.height,Ee.depth,0,ke,it,Ee.data);else if(L.isFramebufferTexture){if(Lt)if(ct)t.texStorage2D(a.TEXTURE_2D,Le,rt,Ee.width,Ee.height);else{let de=Ee.width,me=Ee.height;for(let De=0;De<Le;De++)t.texImage2D(a.TEXTURE_2D,De,rt,de,me,0,ke,it,null),de>>=1,me>>=1}}else if(_t.length>0){if(ct&&Lt){const de=Qe(_t[0]);t.texStorage2D(a.TEXTURE_2D,Le,rt,de.width,de.height)}for(let de=0,me=_t.length;de<me;de++)He=_t[de],ct?J&&t.texSubImage2D(a.TEXTURE_2D,de,0,0,ke,it,He):t.texImage2D(a.TEXTURE_2D,de,rt,ke,it,He);L.generateMipmaps=!1}else if(ct){if(Lt){const de=Qe(Ee);t.texStorage2D(a.TEXTURE_2D,Le,rt,de.width,de.height)}J&&t.texSubImage2D(a.TEXTURE_2D,0,0,0,ke,it,Ee)}else t.texImage2D(a.TEXTURE_2D,0,rt,ke,it,Ee);y(L)&&_(ge),qe.__version=pe.version,L.onUpdate&&L.onUpdate(L)}F.__version=L.version}function fe(F,L,le){if(L.image.length!==6)return;const ge=be(F,L),xe=L.source;t.bindTexture(a.TEXTURE_CUBE_MAP,F.__webglTexture,a.TEXTURE0+le);const pe=i.get(xe);if(xe.version!==pe.__version||ge===!0){t.activeTexture(a.TEXTURE0+le);const qe=Ct.getPrimaries(Ct.workingColorSpace),Pe=L.colorSpace===Zr?null:Ct.getPrimaries(L.colorSpace),Oe=L.colorSpace===Zr||qe===Pe?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,L.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,L.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,Oe);const mt=L.isCompressedTexture||L.image[0].isCompressedTexture,Ee=L.image[0]&&L.image[0].isDataTexture,ke=[];for(let me=0;me<6;me++)!mt&&!Ee?ke[me]=E(L.image[me],!0,s.maxCubemapSize):ke[me]=Ee?L.image[me].image:L.image[me],ke[me]=It(L,ke[me]);const it=ke[0],rt=o.convert(L.format,L.colorSpace),He=o.convert(L.type),_t=A(L.internalFormat,rt,He,L.colorSpace),ct=L.isVideoTexture!==!0,Lt=pe.__version===void 0||ge===!0,J=xe.dataReady;let Le=U(L,it);Q(a.TEXTURE_CUBE_MAP,L);let de;if(mt){ct&&Lt&&t.texStorage2D(a.TEXTURE_CUBE_MAP,Le,_t,it.width,it.height);for(let me=0;me<6;me++){de=ke[me].mipmaps;for(let De=0;De<de.length;De++){const Ne=de[De];L.format!==Pi?rt!==null?ct?J&&t.compressedTexSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De,0,0,Ne.width,Ne.height,rt,Ne.data):t.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De,_t,Ne.width,Ne.height,0,Ne.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ct?J&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De,0,0,Ne.width,Ne.height,rt,He,Ne.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De,_t,Ne.width,Ne.height,0,rt,He,Ne.data)}}}else{if(de=L.mipmaps,ct&&Lt){de.length>0&&Le++;const me=Qe(ke[0]);t.texStorage2D(a.TEXTURE_CUBE_MAP,Le,_t,me.width,me.height)}for(let me=0;me<6;me++)if(Ee){ct?J&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,ke[me].width,ke[me].height,rt,He,ke[me].data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,_t,ke[me].width,ke[me].height,0,rt,He,ke[me].data);for(let De=0;De<de.length;De++){const ut=de[De].image[me].image;ct?J&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De+1,0,0,ut.width,ut.height,rt,He,ut.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De+1,_t,ut.width,ut.height,0,rt,He,ut.data)}}else{ct?J&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,rt,He,ke[me]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,_t,rt,He,ke[me]);for(let De=0;De<de.length;De++){const Ne=de[De];ct?J&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De+1,0,0,rt,He,Ne.image[me]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+me,De+1,_t,rt,He,Ne.image[me])}}}y(L)&&_(a.TEXTURE_CUBE_MAP),pe.__version=xe.version,L.onUpdate&&L.onUpdate(L)}F.__version=L.version}function Me(F,L,le,ge,xe,pe){const qe=o.convert(le.format,le.colorSpace),Pe=o.convert(le.type),Oe=A(le.internalFormat,qe,Pe,le.colorSpace),mt=i.get(L),Ee=i.get(le);if(Ee.__renderTarget=L,!mt.__hasExternalTextures){const ke=Math.max(1,L.width>>pe),it=Math.max(1,L.height>>pe);xe===a.TEXTURE_3D||xe===a.TEXTURE_2D_ARRAY?t.texImage3D(xe,pe,Oe,ke,it,L.depth,0,qe,Pe,null):t.texImage2D(xe,pe,Oe,ke,it,0,qe,Pe,null)}t.bindFramebuffer(a.FRAMEBUFFER,F),vt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,ge,xe,Ee.__webglTexture,0,yt(L)):(xe===a.TEXTURE_2D||xe>=a.TEXTURE_CUBE_MAP_POSITIVE_X&&xe<=a.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&a.framebufferTexture2D(a.FRAMEBUFFER,ge,xe,Ee.__webglTexture,pe),t.bindFramebuffer(a.FRAMEBUFFER,null)}function _e(F,L,le){if(a.bindRenderbuffer(a.RENDERBUFFER,F),L.depthBuffer){const ge=L.depthTexture,xe=ge&&ge.isDepthTexture?ge.type:null,pe=T(L.stencilBuffer,xe),qe=L.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Pe=yt(L);vt(L)?u.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,Pe,pe,L.width,L.height):le?a.renderbufferStorageMultisample(a.RENDERBUFFER,Pe,pe,L.width,L.height):a.renderbufferStorage(a.RENDERBUFFER,pe,L.width,L.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,qe,a.RENDERBUFFER,F)}else{const ge=L.textures;for(let xe=0;xe<ge.length;xe++){const pe=ge[xe],qe=o.convert(pe.format,pe.colorSpace),Pe=o.convert(pe.type),Oe=A(pe.internalFormat,qe,Pe,pe.colorSpace),mt=yt(L);le&&vt(L)===!1?a.renderbufferStorageMultisample(a.RENDERBUFFER,mt,Oe,L.width,L.height):vt(L)?u.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,mt,Oe,L.width,L.height):a.renderbufferStorage(a.RENDERBUFFER,Oe,L.width,L.height)}}a.bindRenderbuffer(a.RENDERBUFFER,null)}function Ce(F,L){if(L&&L.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(a.FRAMEBUFFER,F),!(L.depthTexture&&L.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ge=i.get(L.depthTexture);ge.__renderTarget=L,(!ge.__webglTexture||L.depthTexture.image.width!==L.width||L.depthTexture.image.height!==L.height)&&(L.depthTexture.image.width=L.width,L.depthTexture.image.height=L.height,L.depthTexture.needsUpdate=!0),X(L.depthTexture,0);const xe=ge.__webglTexture,pe=yt(L);if(L.depthTexture.format===Co)vt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,xe,0,pe):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,xe,0);else if(L.depthTexture.format===No)vt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,xe,0,pe):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,xe,0);else throw new Error("Unknown depthTexture format")}function ze(F){const L=i.get(F),le=F.isWebGLCubeRenderTarget===!0;if(L.__boundDepthTexture!==F.depthTexture){const ge=F.depthTexture;if(L.__depthDisposeCallback&&L.__depthDisposeCallback(),ge){const xe=()=>{delete L.__boundDepthTexture,delete L.__depthDisposeCallback,ge.removeEventListener("dispose",xe)};ge.addEventListener("dispose",xe),L.__depthDisposeCallback=xe}L.__boundDepthTexture=ge}if(F.depthTexture&&!L.__autoAllocateDepthBuffer){if(le)throw new Error("target.depthTexture not supported in Cube render targets");Ce(L.__webglFramebuffer,F)}else if(le){L.__webglDepthbuffer=[];for(let ge=0;ge<6;ge++)if(t.bindFramebuffer(a.FRAMEBUFFER,L.__webglFramebuffer[ge]),L.__webglDepthbuffer[ge]===void 0)L.__webglDepthbuffer[ge]=a.createRenderbuffer(),_e(L.__webglDepthbuffer[ge],F,!1);else{const xe=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,pe=L.__webglDepthbuffer[ge];a.bindRenderbuffer(a.RENDERBUFFER,pe),a.framebufferRenderbuffer(a.FRAMEBUFFER,xe,a.RENDERBUFFER,pe)}}else if(t.bindFramebuffer(a.FRAMEBUFFER,L.__webglFramebuffer),L.__webglDepthbuffer===void 0)L.__webglDepthbuffer=a.createRenderbuffer(),_e(L.__webglDepthbuffer,F,!1);else{const ge=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,xe=L.__webglDepthbuffer;a.bindRenderbuffer(a.RENDERBUFFER,xe),a.framebufferRenderbuffer(a.FRAMEBUFFER,ge,a.RENDERBUFFER,xe)}t.bindFramebuffer(a.FRAMEBUFFER,null)}function nt(F,L,le){const ge=i.get(F);L!==void 0&&Me(ge.__webglFramebuffer,F,F.texture,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,0),le!==void 0&&ze(F)}function Dt(F){const L=F.texture,le=i.get(F),ge=i.get(L);F.addEventListener("dispose",D);const xe=F.textures,pe=F.isWebGLCubeRenderTarget===!0,qe=xe.length>1;if(qe||(ge.__webglTexture===void 0&&(ge.__webglTexture=a.createTexture()),ge.__version=L.version,c.memory.textures++),pe){le.__webglFramebuffer=[];for(let Pe=0;Pe<6;Pe++)if(L.mipmaps&&L.mipmaps.length>0){le.__webglFramebuffer[Pe]=[];for(let Oe=0;Oe<L.mipmaps.length;Oe++)le.__webglFramebuffer[Pe][Oe]=a.createFramebuffer()}else le.__webglFramebuffer[Pe]=a.createFramebuffer()}else{if(L.mipmaps&&L.mipmaps.length>0){le.__webglFramebuffer=[];for(let Pe=0;Pe<L.mipmaps.length;Pe++)le.__webglFramebuffer[Pe]=a.createFramebuffer()}else le.__webglFramebuffer=a.createFramebuffer();if(qe)for(let Pe=0,Oe=xe.length;Pe<Oe;Pe++){const mt=i.get(xe[Pe]);mt.__webglTexture===void 0&&(mt.__webglTexture=a.createTexture(),c.memory.textures++)}if(F.samples>0&&vt(F)===!1){le.__webglMultisampledFramebuffer=a.createFramebuffer(),le.__webglColorRenderbuffer=[],t.bindFramebuffer(a.FRAMEBUFFER,le.__webglMultisampledFramebuffer);for(let Pe=0;Pe<xe.length;Pe++){const Oe=xe[Pe];le.__webglColorRenderbuffer[Pe]=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,le.__webglColorRenderbuffer[Pe]);const mt=o.convert(Oe.format,Oe.colorSpace),Ee=o.convert(Oe.type),ke=A(Oe.internalFormat,mt,Ee,Oe.colorSpace,F.isXRRenderTarget===!0),it=yt(F);a.renderbufferStorageMultisample(a.RENDERBUFFER,it,ke,F.width,F.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Pe,a.RENDERBUFFER,le.__webglColorRenderbuffer[Pe])}a.bindRenderbuffer(a.RENDERBUFFER,null),F.depthBuffer&&(le.__webglDepthRenderbuffer=a.createRenderbuffer(),_e(le.__webglDepthRenderbuffer,F,!0)),t.bindFramebuffer(a.FRAMEBUFFER,null)}}if(pe){t.bindTexture(a.TEXTURE_CUBE_MAP,ge.__webglTexture),Q(a.TEXTURE_CUBE_MAP,L);for(let Pe=0;Pe<6;Pe++)if(L.mipmaps&&L.mipmaps.length>0)for(let Oe=0;Oe<L.mipmaps.length;Oe++)Me(le.__webglFramebuffer[Pe][Oe],F,L,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,Oe);else Me(le.__webglFramebuffer[Pe],F,L,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0);y(L)&&_(a.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(qe){for(let Pe=0,Oe=xe.length;Pe<Oe;Pe++){const mt=xe[Pe],Ee=i.get(mt);t.bindTexture(a.TEXTURE_2D,Ee.__webglTexture),Q(a.TEXTURE_2D,mt),Me(le.__webglFramebuffer,F,mt,a.COLOR_ATTACHMENT0+Pe,a.TEXTURE_2D,0),y(mt)&&_(a.TEXTURE_2D)}t.unbindTexture()}else{let Pe=a.TEXTURE_2D;if((F.isWebGL3DRenderTarget||F.isWebGLArrayRenderTarget)&&(Pe=F.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),t.bindTexture(Pe,ge.__webglTexture),Q(Pe,L),L.mipmaps&&L.mipmaps.length>0)for(let Oe=0;Oe<L.mipmaps.length;Oe++)Me(le.__webglFramebuffer[Oe],F,L,a.COLOR_ATTACHMENT0,Pe,Oe);else Me(le.__webglFramebuffer,F,L,a.COLOR_ATTACHMENT0,Pe,0);y(L)&&_(Pe),t.unbindTexture()}F.depthBuffer&&ze(F)}function St(F){const L=F.textures;for(let le=0,ge=L.length;le<ge;le++){const xe=L[le];if(y(xe)){const pe=w(F),qe=i.get(xe).__webglTexture;t.bindTexture(pe,qe),_(pe),t.unbindTexture()}}}const Bt=[],ne=[];function Nn(F){if(F.samples>0){if(vt(F)===!1){const L=F.textures,le=F.width,ge=F.height;let xe=a.COLOR_BUFFER_BIT;const pe=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,qe=i.get(F),Pe=L.length>1;if(Pe)for(let Oe=0;Oe<L.length;Oe++)t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Oe,a.RENDERBUFFER,null),t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+Oe,a.TEXTURE_2D,null,0);t.bindFramebuffer(a.READ_FRAMEBUFFER,qe.__webglMultisampledFramebuffer),t.bindFramebuffer(a.DRAW_FRAMEBUFFER,qe.__webglFramebuffer);for(let Oe=0;Oe<L.length;Oe++){if(F.resolveDepthBuffer&&(F.depthBuffer&&(xe|=a.DEPTH_BUFFER_BIT),F.stencilBuffer&&F.resolveStencilBuffer&&(xe|=a.STENCIL_BUFFER_BIT)),Pe){a.framebufferRenderbuffer(a.READ_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.RENDERBUFFER,qe.__webglColorRenderbuffer[Oe]);const mt=i.get(L[Oe]).__webglTexture;a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,mt,0)}a.blitFramebuffer(0,0,le,ge,0,0,le,ge,xe,a.NEAREST),d===!0&&(Bt.length=0,ne.length=0,Bt.push(a.COLOR_ATTACHMENT0+Oe),F.depthBuffer&&F.resolveDepthBuffer===!1&&(Bt.push(pe),ne.push(pe),a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,ne)),a.invalidateFramebuffer(a.READ_FRAMEBUFFER,Bt))}if(t.bindFramebuffer(a.READ_FRAMEBUFFER,null),t.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),Pe)for(let Oe=0;Oe<L.length;Oe++){t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Oe,a.RENDERBUFFER,qe.__webglColorRenderbuffer[Oe]);const mt=i.get(L[Oe]).__webglTexture;t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+Oe,a.TEXTURE_2D,mt,0)}t.bindFramebuffer(a.DRAW_FRAMEBUFFER,qe.__webglMultisampledFramebuffer)}else if(F.depthBuffer&&F.resolveDepthBuffer===!1&&d){const L=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,[L])}}}function yt(F){return Math.min(s.maxSamples,F.samples)}function vt(F){const L=i.get(F);return F.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&L.__useRenderToTexture!==!1}function Je(F){const L=c.render.frame;p.get(F)!==L&&(p.set(F,L),F.update())}function It(F,L){const le=F.colorSpace,ge=F.format,xe=F.type;return F.isCompressedTexture===!0||F.isVideoTexture===!0||le!==Uo&&le!==Zr&&(Ct.getTransfer(le)===Ut?(ge!==Pi||xe!==xr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",le)),L}function Qe(F){return typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement?(f.width=F.naturalWidth||F.width,f.height=F.naturalHeight||F.height):typeof VideoFrame<"u"&&F instanceof VideoFrame?(f.width=F.displayWidth,f.height=F.displayHeight):(f.width=F.width,f.height=F.height),f}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.setTexture2D=X,this.setTexture2DArray=W,this.setTexture3D=ie,this.setTextureCube=H,this.rebindTextures=nt,this.setupRenderTarget=Dt,this.updateRenderTargetMipmap=St,this.updateMultisampleRenderTarget=Nn,this.setupDepthRenderbuffer=ze,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=vt}function x1(a,e){function t(i,s=Zr){let o;const c=Ct.getTransfer(s);if(i===xr)return a.UNSIGNED_BYTE;if(i===ff)return a.UNSIGNED_SHORT_4_4_4_4;if(i===pf)return a.UNSIGNED_SHORT_5_5_5_1;if(i===e0)return a.UNSIGNED_INT_5_9_9_9_REV;if(i===Qv)return a.BYTE;if(i===Jv)return a.SHORT;if(i===za)return a.UNSIGNED_SHORT;if(i===df)return a.INT;if(i===Ns)return a.UNSIGNED_INT;if(i===gr)return a.FLOAT;if(i===ka)return a.HALF_FLOAT;if(i===t0)return a.ALPHA;if(i===n0)return a.RGB;if(i===Pi)return a.RGBA;if(i===i0)return a.LUMINANCE;if(i===r0)return a.LUMINANCE_ALPHA;if(i===Co)return a.DEPTH_COMPONENT;if(i===No)return a.DEPTH_STENCIL;if(i===s0)return a.RED;if(i===mf)return a.RED_INTEGER;if(i===o0)return a.RG;if(i===gf)return a.RG_INTEGER;if(i===vf)return a.RGBA_INTEGER;if(i===Rc||i===bc||i===Pc||i===Lc)if(c===Ut)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(i===Rc)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===bc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Pc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Lc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(i===Rc)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===bc)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Pc)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Lc)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Id||i===Nd||i===Dd||i===Ud)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(i===Id)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Nd)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Dd)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ud)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Fd||i===zd||i===Od)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(i===Fd||i===zd)return c===Ut?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(i===Od)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Bd||i===kd||i===Hd||i===Vd||i===Gd||i===Wd||i===jd||i===Xd||i===qd||i===Yd||i===Zd||i===$d||i===Kd||i===Qd)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(i===Bd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===kd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Hd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Vd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Gd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Wd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===jd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Xd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===qd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Yd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Zd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===$d)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Qd)return c===Ut?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ic||i===Jd||i===ef)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(i===Ic)return c===Ut?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Jd)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ef)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===a0||i===tf||i===nf||i===rf)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(i===Ic)return o.COMPRESSED_RED_RGTC1_EXT;if(i===tf)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===nf)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===rf)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Io?a.UNSIGNED_INT_24_8:a[i]!==void 0?a[i]:null}return{convert:t}}class y1 extends gi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class wo extends on{constructor(){super(),this.isGroup=!0,this.type="Group"}}const S1={type:"move"};class cd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new $,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new $),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new $,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new $),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,o=null,c=null;const u=this._targetRay,d=this._grip,f=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(f&&e.hand){c=!0;for(const E of e.hand.values()){const y=t.getJointPose(E,i),_=this._getHandJoint(f,E);y!==null&&(_.matrix.fromArray(y.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=y.radius),_.visible=y!==null}const p=f.joints["index-finger-tip"],v=f.joints["thumb-tip"],m=p.position.distanceTo(v.position),x=.02,S=.005;f.inputState.pinching&&m>x+S?(f.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!f.inputState.pinching&&m<=x-S&&(f.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else d!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(d.matrix.fromArray(o.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,o.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(o.linearVelocity)):d.hasLinearVelocity=!1,o.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(o.angularVelocity)):d.hasAngularVelocity=!1));u!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&o!==null&&(s=o),s!==null&&(u.matrix.fromArray(s.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,s.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(s.linearVelocity)):u.hasLinearVelocity=!1,s.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(s.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(S1)))}return u!==null&&(u.visible=s!==null),d!==null&&(d.visible=o!==null),f!==null&&(f.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new wo;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const M1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,E1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class w1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new In,o=e.properties.get(s);o.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ni({vertexShader:M1,fragmentShader:E1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Fe(new Oo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class T1 extends Us{constructor(e,t){super();const i=this;let s=null,o=1,c=null,u="local-floor",d=1,f=null,p=null,v=null,m=null,x=null,S=null;const E=new w1,y=t.getContextAttributes();let _=null,w=null;const A=[],T=[],U=new Et;let N=null;const D=new gi;D.viewport=new Jt;const z=new gi;z.viewport=new Jt;const b=[D,z],C=new y1;let B=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(se){let fe=A[se];return fe===void 0&&(fe=new cd,A[se]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(se){let fe=A[se];return fe===void 0&&(fe=new cd,A[se]=fe),fe.getGripSpace()},this.getHand=function(se){let fe=A[se];return fe===void 0&&(fe=new cd,A[se]=fe),fe.getHandSpace()};function k(se){const fe=T.indexOf(se.inputSource);if(fe===-1)return;const Me=A[fe];Me!==void 0&&(Me.update(se.inputSource,se.frame,f||c),Me.dispatchEvent({type:se.type,data:se.inputSource}))}function j(){s.removeEventListener("select",k),s.removeEventListener("selectstart",k),s.removeEventListener("selectend",k),s.removeEventListener("squeeze",k),s.removeEventListener("squeezestart",k),s.removeEventListener("squeezeend",k),s.removeEventListener("end",j),s.removeEventListener("inputsourceschange",X);for(let se=0;se<A.length;se++){const fe=T[se];fe!==null&&(T[se]=null,A[se].disconnect(fe))}B=null,O=null,E.reset(),e.setRenderTarget(_),x=null,m=null,v=null,s=null,w=null,be.stop(),i.isPresenting=!1,e.setPixelRatio(N),e.setSize(U.width,U.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(se){o=se,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(se){u=se,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return f||c},this.setReferenceSpace=function(se){f=se},this.getBaseLayer=function(){return m!==null?m:x},this.getBinding=function(){return v},this.getFrame=function(){return S},this.getSession=function(){return s},this.setSession=async function(se){if(s=se,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",k),s.addEventListener("selectstart",k),s.addEventListener("selectend",k),s.addEventListener("squeeze",k),s.addEventListener("squeezestart",k),s.addEventListener("squeezeend",k),s.addEventListener("end",j),s.addEventListener("inputsourceschange",X),y.xrCompatible!==!0&&await t.makeXRCompatible(),N=e.getPixelRatio(),e.getSize(U),s.renderState.layers===void 0){const fe={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:o};x=new XRWebGLLayer(s,t,fe),s.updateRenderState({baseLayer:x}),e.setPixelRatio(1),e.setSize(x.framebufferWidth,x.framebufferHeight,!1),w=new Ds(x.framebufferWidth,x.framebufferHeight,{format:Pi,type:xr,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil})}else{let fe=null,Me=null,_e=null;y.depth&&(_e=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=y.stencil?No:Co,Me=y.stencil?Io:Ns);const Ce={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:o};v=new XRWebGLBinding(s,t),m=v.createProjectionLayer(Ce),s.updateRenderState({layers:[m]}),e.setPixelRatio(1),e.setSize(m.textureWidth,m.textureHeight,!1),w=new Ds(m.textureWidth,m.textureHeight,{format:Pi,type:xr,depthTexture:new M0(m.textureWidth,m.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:m.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(d),f=null,c=await s.requestReferenceSpace(u),be.setContext(s),be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function X(se){for(let fe=0;fe<se.removed.length;fe++){const Me=se.removed[fe],_e=T.indexOf(Me);_e>=0&&(T[_e]=null,A[_e].disconnect(Me))}for(let fe=0;fe<se.added.length;fe++){const Me=se.added[fe];let _e=T.indexOf(Me);if(_e===-1){for(let ze=0;ze<A.length;ze++)if(ze>=T.length){T.push(Me),_e=ze;break}else if(T[ze]===null){T[ze]=Me,_e=ze;break}if(_e===-1)break}const Ce=A[_e];Ce&&Ce.connect(Me)}}const W=new $,ie=new $;function H(se,fe,Me){W.setFromMatrixPosition(fe.matrixWorld),ie.setFromMatrixPosition(Me.matrixWorld);const _e=W.distanceTo(ie),Ce=fe.projectionMatrix.elements,ze=Me.projectionMatrix.elements,nt=Ce[14]/(Ce[10]-1),Dt=Ce[14]/(Ce[10]+1),St=(Ce[9]+1)/Ce[5],Bt=(Ce[9]-1)/Ce[5],ne=(Ce[8]-1)/Ce[0],Nn=(ze[8]+1)/ze[0],yt=nt*ne,vt=nt*Nn,Je=_e/(-ne+Nn),It=Je*-ne;if(fe.matrixWorld.decompose(se.position,se.quaternion,se.scale),se.translateX(It),se.translateZ(Je),se.matrixWorld.compose(se.position,se.quaternion,se.scale),se.matrixWorldInverse.copy(se.matrixWorld).invert(),Ce[10]===-1)se.projectionMatrix.copy(fe.projectionMatrix),se.projectionMatrixInverse.copy(fe.projectionMatrixInverse);else{const Qe=nt+Je,F=Dt+Je,L=yt-It,le=vt+(_e-It),ge=St*Dt/F*Qe,xe=Bt*Dt/F*Qe;se.projectionMatrix.makePerspective(L,le,ge,xe,Qe,F),se.projectionMatrixInverse.copy(se.projectionMatrix).invert()}}function q(se,fe){fe===null?se.matrixWorld.copy(se.matrix):se.matrixWorld.multiplyMatrices(fe.matrixWorld,se.matrix),se.matrixWorldInverse.copy(se.matrixWorld).invert()}this.updateCamera=function(se){if(s===null)return;let fe=se.near,Me=se.far;E.texture!==null&&(E.depthNear>0&&(fe=E.depthNear),E.depthFar>0&&(Me=E.depthFar)),C.near=z.near=D.near=fe,C.far=z.far=D.far=Me,(B!==C.near||O!==C.far)&&(s.updateRenderState({depthNear:C.near,depthFar:C.far}),B=C.near,O=C.far),D.layers.mask=se.layers.mask|2,z.layers.mask=se.layers.mask|4,C.layers.mask=D.layers.mask|z.layers.mask;const _e=se.parent,Ce=C.cameras;q(C,_e);for(let ze=0;ze<Ce.length;ze++)q(Ce[ze],_e);Ce.length===2?H(C,D,z):C.projectionMatrix.copy(D.projectionMatrix),oe(se,C,_e)};function oe(se,fe,Me){Me===null?se.matrix.copy(fe.matrixWorld):(se.matrix.copy(Me.matrixWorld),se.matrix.invert(),se.matrix.multiply(fe.matrixWorld)),se.matrix.decompose(se.position,se.quaternion,se.scale),se.updateMatrixWorld(!0),se.projectionMatrix.copy(fe.projectionMatrix),se.projectionMatrixInverse.copy(fe.projectionMatrixInverse),se.isPerspectiveCamera&&(se.fov=sf*2*Math.atan(1/se.projectionMatrix.elements[5]),se.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(m===null&&x===null))return d},this.setFoveation=function(se){d=se,m!==null&&(m.fixedFoveation=se),x!==null&&x.fixedFoveation!==void 0&&(x.fixedFoveation=se)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(C)};let G=null;function Q(se,fe){if(p=fe.getViewerPose(f||c),S=fe,p!==null){const Me=p.views;x!==null&&(e.setRenderTargetFramebuffer(w,x.framebuffer),e.setRenderTarget(w));let _e=!1;Me.length!==C.cameras.length&&(C.cameras.length=0,_e=!0);for(let ze=0;ze<Me.length;ze++){const nt=Me[ze];let Dt=null;if(x!==null)Dt=x.getViewport(nt);else{const Bt=v.getViewSubImage(m,nt);Dt=Bt.viewport,ze===0&&(e.setRenderTargetTextures(w,Bt.colorTexture,m.ignoreDepthValues?void 0:Bt.depthStencilTexture),e.setRenderTarget(w))}let St=b[ze];St===void 0&&(St=new gi,St.layers.enable(ze),St.viewport=new Jt,b[ze]=St),St.matrix.fromArray(nt.transform.matrix),St.matrix.decompose(St.position,St.quaternion,St.scale),St.projectionMatrix.fromArray(nt.projectionMatrix),St.projectionMatrixInverse.copy(St.projectionMatrix).invert(),St.viewport.set(Dt.x,Dt.y,Dt.width,Dt.height),ze===0&&(C.matrix.copy(St.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),_e===!0&&C.cameras.push(St)}const Ce=s.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const ze=v.getDepthInformation(Me[0]);ze&&ze.isValid&&ze.texture&&E.init(e,ze,s.renderState)}}for(let Me=0;Me<A.length;Me++){const _e=T[Me],Ce=A[Me];_e!==null&&Ce!==void 0&&Ce.update(_e,fe,f||c)}G&&G(se,fe),fe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:fe}),S=null}const be=new y0;be.setAnimationLoop(Q),this.setAnimationLoop=function(se){G=se},this.dispose=function(){}}}const _s=new si,A1=new Ht;function C1(a,e){function t(y,_){y.matrixAutoUpdate===!0&&y.updateMatrix(),_.value.copy(y.matrix)}function i(y,_){_.color.getRGB(y.fogColor.value,g0(a)),_.isFog?(y.fogNear.value=_.near,y.fogFar.value=_.far):_.isFogExp2&&(y.fogDensity.value=_.density)}function s(y,_,w,A,T){_.isMeshBasicMaterial||_.isMeshLambertMaterial?o(y,_):_.isMeshToonMaterial?(o(y,_),v(y,_)):_.isMeshPhongMaterial?(o(y,_),p(y,_)):_.isMeshStandardMaterial?(o(y,_),m(y,_),_.isMeshPhysicalMaterial&&x(y,_,T)):_.isMeshMatcapMaterial?(o(y,_),S(y,_)):_.isMeshDepthMaterial?o(y,_):_.isMeshDistanceMaterial?(o(y,_),E(y,_)):_.isMeshNormalMaterial?o(y,_):_.isLineBasicMaterial?(c(y,_),_.isLineDashedMaterial&&u(y,_)):_.isPointsMaterial?d(y,_,w,A):_.isSpriteMaterial?f(y,_):_.isShadowMaterial?(y.color.value.copy(_.color),y.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function o(y,_){y.opacity.value=_.opacity,_.color&&y.diffuse.value.copy(_.color),_.emissive&&y.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(y.map.value=_.map,t(_.map,y.mapTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.bumpMap&&(y.bumpMap.value=_.bumpMap,t(_.bumpMap,y.bumpMapTransform),y.bumpScale.value=_.bumpScale,_.side===Kn&&(y.bumpScale.value*=-1)),_.normalMap&&(y.normalMap.value=_.normalMap,t(_.normalMap,y.normalMapTransform),y.normalScale.value.copy(_.normalScale),_.side===Kn&&y.normalScale.value.negate()),_.displacementMap&&(y.displacementMap.value=_.displacementMap,t(_.displacementMap,y.displacementMapTransform),y.displacementScale.value=_.displacementScale,y.displacementBias.value=_.displacementBias),_.emissiveMap&&(y.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,y.emissiveMapTransform)),_.specularMap&&(y.specularMap.value=_.specularMap,t(_.specularMap,y.specularMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest);const w=e.get(_),A=w.envMap,T=w.envMapRotation;A&&(y.envMap.value=A,_s.copy(T),_s.x*=-1,_s.y*=-1,_s.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(_s.y*=-1,_s.z*=-1),y.envMapRotation.value.setFromMatrix4(A1.makeRotationFromEuler(_s)),y.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,y.reflectivity.value=_.reflectivity,y.ior.value=_.ior,y.refractionRatio.value=_.refractionRatio),_.lightMap&&(y.lightMap.value=_.lightMap,y.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,y.lightMapTransform)),_.aoMap&&(y.aoMap.value=_.aoMap,y.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,y.aoMapTransform))}function c(y,_){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,_.map&&(y.map.value=_.map,t(_.map,y.mapTransform))}function u(y,_){y.dashSize.value=_.dashSize,y.totalSize.value=_.dashSize+_.gapSize,y.scale.value=_.scale}function d(y,_,w,A){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,y.size.value=_.size*w,y.scale.value=A*.5,_.map&&(y.map.value=_.map,t(_.map,y.uvTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest)}function f(y,_){y.diffuse.value.copy(_.color),y.opacity.value=_.opacity,y.rotation.value=_.rotation,_.map&&(y.map.value=_.map,t(_.map,y.mapTransform)),_.alphaMap&&(y.alphaMap.value=_.alphaMap,t(_.alphaMap,y.alphaMapTransform)),_.alphaTest>0&&(y.alphaTest.value=_.alphaTest)}function p(y,_){y.specular.value.copy(_.specular),y.shininess.value=Math.max(_.shininess,1e-4)}function v(y,_){_.gradientMap&&(y.gradientMap.value=_.gradientMap)}function m(y,_){y.metalness.value=_.metalness,_.metalnessMap&&(y.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,y.metalnessMapTransform)),y.roughness.value=_.roughness,_.roughnessMap&&(y.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,y.roughnessMapTransform)),_.envMap&&(y.envMapIntensity.value=_.envMapIntensity)}function x(y,_,w){y.ior.value=_.ior,_.sheen>0&&(y.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),y.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(y.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,y.sheenColorMapTransform)),_.sheenRoughnessMap&&(y.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,y.sheenRoughnessMapTransform))),_.clearcoat>0&&(y.clearcoat.value=_.clearcoat,y.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(y.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,y.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(y.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,y.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(y.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,y.clearcoatNormalMapTransform),y.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===Kn&&y.clearcoatNormalScale.value.negate())),_.dispersion>0&&(y.dispersion.value=_.dispersion),_.iridescence>0&&(y.iridescence.value=_.iridescence,y.iridescenceIOR.value=_.iridescenceIOR,y.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],y.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(y.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,y.iridescenceMapTransform)),_.iridescenceThicknessMap&&(y.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,y.iridescenceThicknessMapTransform))),_.transmission>0&&(y.transmission.value=_.transmission,y.transmissionSamplerMap.value=w.texture,y.transmissionSamplerSize.value.set(w.width,w.height),_.transmissionMap&&(y.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,y.transmissionMapTransform)),y.thickness.value=_.thickness,_.thicknessMap&&(y.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,y.thicknessMapTransform)),y.attenuationDistance.value=_.attenuationDistance,y.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(y.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(y.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,y.anisotropyMapTransform))),y.specularIntensity.value=_.specularIntensity,y.specularColor.value.copy(_.specularColor),_.specularColorMap&&(y.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,y.specularColorMapTransform)),_.specularIntensityMap&&(y.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,y.specularIntensityMapTransform))}function S(y,_){_.matcap&&(y.matcap.value=_.matcap)}function E(y,_){const w=e.get(_).light;y.referencePosition.value.setFromMatrixPosition(w.matrixWorld),y.nearDistance.value=w.shadow.camera.near,y.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function R1(a,e,t,i){let s={},o={},c=[];const u=a.getParameter(a.MAX_UNIFORM_BUFFER_BINDINGS);function d(w,A){const T=A.program;i.uniformBlockBinding(w,T)}function f(w,A){let T=s[w.id];T===void 0&&(S(w),T=p(w),s[w.id]=T,w.addEventListener("dispose",y));const U=A.program;i.updateUBOMapping(w,U);const N=e.render.frame;o[w.id]!==N&&(m(w),o[w.id]=N)}function p(w){const A=v();w.__bindingPointIndex=A;const T=a.createBuffer(),U=w.__size,N=w.usage;return a.bindBuffer(a.UNIFORM_BUFFER,T),a.bufferData(a.UNIFORM_BUFFER,U,N),a.bindBuffer(a.UNIFORM_BUFFER,null),a.bindBufferBase(a.UNIFORM_BUFFER,A,T),T}function v(){for(let w=0;w<u;w++)if(c.indexOf(w)===-1)return c.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function m(w){const A=s[w.id],T=w.uniforms,U=w.__cache;a.bindBuffer(a.UNIFORM_BUFFER,A);for(let N=0,D=T.length;N<D;N++){const z=Array.isArray(T[N])?T[N]:[T[N]];for(let b=0,C=z.length;b<C;b++){const B=z[b];if(x(B,N,b,U)===!0){const O=B.__offset,k=Array.isArray(B.value)?B.value:[B.value];let j=0;for(let X=0;X<k.length;X++){const W=k[X],ie=E(W);typeof W=="number"||typeof W=="boolean"?(B.__data[0]=W,a.bufferSubData(a.UNIFORM_BUFFER,O+j,B.__data)):W.isMatrix3?(B.__data[0]=W.elements[0],B.__data[1]=W.elements[1],B.__data[2]=W.elements[2],B.__data[3]=0,B.__data[4]=W.elements[3],B.__data[5]=W.elements[4],B.__data[6]=W.elements[5],B.__data[7]=0,B.__data[8]=W.elements[6],B.__data[9]=W.elements[7],B.__data[10]=W.elements[8],B.__data[11]=0):(W.toArray(B.__data,j),j+=ie.storage/Float32Array.BYTES_PER_ELEMENT)}a.bufferSubData(a.UNIFORM_BUFFER,O,B.__data)}}}a.bindBuffer(a.UNIFORM_BUFFER,null)}function x(w,A,T,U){const N=w.value,D=A+"_"+T;if(U[D]===void 0)return typeof N=="number"||typeof N=="boolean"?U[D]=N:U[D]=N.clone(),!0;{const z=U[D];if(typeof N=="number"||typeof N=="boolean"){if(z!==N)return U[D]=N,!0}else if(z.equals(N)===!1)return z.copy(N),!0}return!1}function S(w){const A=w.uniforms;let T=0;const U=16;for(let D=0,z=A.length;D<z;D++){const b=Array.isArray(A[D])?A[D]:[A[D]];for(let C=0,B=b.length;C<B;C++){const O=b[C],k=Array.isArray(O.value)?O.value:[O.value];for(let j=0,X=k.length;j<X;j++){const W=k[j],ie=E(W),H=T%U,q=H%ie.boundary,oe=H+q;T+=q,oe!==0&&U-oe<ie.storage&&(T+=U-oe),O.__data=new Float32Array(ie.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=T,T+=ie.storage}}}const N=T%U;return N>0&&(T+=U-N),w.__size=T,w.__cache={},this}function E(w){const A={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(A.boundary=4,A.storage=4):w.isVector2?(A.boundary=8,A.storage=8):w.isVector3||w.isColor?(A.boundary=16,A.storage=12):w.isVector4?(A.boundary=16,A.storage=16):w.isMatrix3?(A.boundary=48,A.storage=48):w.isMatrix4?(A.boundary=64,A.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),A}function y(w){const A=w.target;A.removeEventListener("dispose",y);const T=c.indexOf(A.__bindingPointIndex);c.splice(T,1),a.deleteBuffer(s[A.id]),delete s[A.id],delete o[A.id]}function _(){for(const w in s)a.deleteBuffer(s[w]);c=[],s={},o={}}return{bind:d,update:f,dispose:_}}class b1{constructor(e={}){const{canvas:t=_y(),context:i=null,depth:s=!0,stencil:o=!1,alpha:c=!1,antialias:u=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:f=!1,powerPreference:p="default",failIfMajorPerformanceCaveat:v=!1,reverseDepthBuffer:m=!1}=e;this.isWebGLRenderer=!0;let x;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=i.getContextAttributes().alpha}else x=c;const S=new Uint32Array(4),E=new Int32Array(4);let y=null,_=null;const w=[],A=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Bn,this.toneMapping=Kr,this.toneMappingExposure=1;const T=this;let U=!1,N=0,D=0,z=null,b=-1,C=null;const B=new Jt,O=new Jt;let k=null;const j=new at(0);let X=0,W=t.width,ie=t.height,H=1,q=null,oe=null;const G=new Jt(0,0,W,ie),Q=new Jt(0,0,W,ie);let be=!1;const se=new yf;let fe=!1,Me=!1;const _e=new Ht,Ce=new Ht,ze=new $,nt=new Jt,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let St=!1;function Bt(){return z===null?H:1}let ne=i;function Nn(I,ee){return t.getContext(I,ee)}try{const I={alpha:!0,depth:s,stencil:o,antialias:u,premultipliedAlpha:d,preserveDrawingBuffer:f,powerPreference:p,failIfMajorPerformanceCaveat:v};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${hf}`),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",De,!1),t.addEventListener("webglcontextcreationerror",Ne,!1),ne===null){const ee="webgl2";if(ne=Nn(ee,I),ne===null)throw Nn(ee)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(I){throw console.error("THREE.WebGLRenderer: "+I.message),I}let yt,vt,Je,It,Qe,F,L,le,ge,xe,pe,qe,Pe,Oe,mt,Ee,ke,it,rt,He,_t,ct,Lt,J;function Le(){yt=new DE(ne),yt.init(),ct=new x1(ne,yt),vt=new RE(ne,yt,e,ct),Je=new g1(ne,yt),vt.reverseDepthBuffer&&m&&Je.buffers.depth.setReversed(!0),It=new zE(ne),Qe=new t1,F=new _1(ne,yt,Je,Qe,vt,ct,It),L=new PE(T),le=new NE(T),ge=new Wy(ne),Lt=new AE(ne,ge),xe=new UE(ne,ge,It,Lt),pe=new BE(ne,xe,ge,It),rt=new OE(ne,vt,F),Ee=new bE(Qe),qe=new e1(T,L,le,yt,vt,Lt,Ee),Pe=new C1(T,Qe),Oe=new i1,mt=new c1(yt),it=new TE(T,L,le,Je,pe,x,d),ke=new p1(T,pe,vt),J=new R1(ne,It,vt,Je),He=new CE(ne,yt,It),_t=new FE(ne,yt,It),It.programs=qe.programs,T.capabilities=vt,T.extensions=yt,T.properties=Qe,T.renderLists=Oe,T.shadowMap=ke,T.state=Je,T.info=It}Le();const de=new T1(T,ne);this.xr=de,this.getContext=function(){return ne},this.getContextAttributes=function(){return ne.getContextAttributes()},this.forceContextLoss=function(){const I=yt.get("WEBGL_lose_context");I&&I.loseContext()},this.forceContextRestore=function(){const I=yt.get("WEBGL_lose_context");I&&I.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(I){I!==void 0&&(H=I,this.setSize(W,ie,!1))},this.getSize=function(I){return I.set(W,ie)},this.setSize=function(I,ee,ue=!0){if(de.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=I,ie=ee,t.width=Math.floor(I*H),t.height=Math.floor(ee*H),ue===!0&&(t.style.width=I+"px",t.style.height=ee+"px"),this.setViewport(0,0,I,ee)},this.getDrawingBufferSize=function(I){return I.set(W*H,ie*H).floor()},this.setDrawingBufferSize=function(I,ee,ue){W=I,ie=ee,H=ue,t.width=Math.floor(I*ue),t.height=Math.floor(ee*ue),this.setViewport(0,0,I,ee)},this.getCurrentViewport=function(I){return I.copy(B)},this.getViewport=function(I){return I.copy(G)},this.setViewport=function(I,ee,ue,he){I.isVector4?G.set(I.x,I.y,I.z,I.w):G.set(I,ee,ue,he),Je.viewport(B.copy(G).multiplyScalar(H).round())},this.getScissor=function(I){return I.copy(Q)},this.setScissor=function(I,ee,ue,he){I.isVector4?Q.set(I.x,I.y,I.z,I.w):Q.set(I,ee,ue,he),Je.scissor(O.copy(Q).multiplyScalar(H).round())},this.getScissorTest=function(){return be},this.setScissorTest=function(I){Je.setScissorTest(be=I)},this.setOpaqueSort=function(I){q=I},this.setTransparentSort=function(I){oe=I},this.getClearColor=function(I){return I.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(I=!0,ee=!0,ue=!0){let he=0;if(I){let te=!1;if(z!==null){const Ae=z.texture.format;te=Ae===vf||Ae===gf||Ae===mf}if(te){const Ae=z.texture.type,we=Ae===xr||Ae===Ns||Ae===za||Ae===Io||Ae===ff||Ae===pf,Ye=it.getClearColor(),We=it.getClearAlpha(),st=Ye.r,lt=Ye.g,Ze=Ye.b;we?(S[0]=st,S[1]=lt,S[2]=Ze,S[3]=We,ne.clearBufferuiv(ne.COLOR,0,S)):(E[0]=st,E[1]=lt,E[2]=Ze,E[3]=We,ne.clearBufferiv(ne.COLOR,0,E))}else he|=ne.COLOR_BUFFER_BIT}ee&&(he|=ne.DEPTH_BUFFER_BIT),ue&&(he|=ne.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),ne.clear(he)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",De,!1),t.removeEventListener("webglcontextcreationerror",Ne,!1),Oe.dispose(),mt.dispose(),Qe.dispose(),L.dispose(),le.dispose(),pe.dispose(),Lt.dispose(),J.dispose(),qe.dispose(),de.dispose(),de.removeEventListener("sessionstart",Fs),de.removeEventListener("sessionend",yr),qi.stop()};function me(I){I.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),U=!0}function De(){console.log("THREE.WebGLRenderer: Context Restored."),U=!1;const I=It.autoReset,ee=ke.enabled,ue=ke.autoUpdate,he=ke.needsUpdate,te=ke.type;Le(),It.autoReset=I,ke.enabled=ee,ke.autoUpdate=ue,ke.needsUpdate=he,ke.type=te}function Ne(I){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",I.statusMessage)}function ut(I){const ee=I.target;ee.removeEventListener("dispose",ut),Vt(ee)}function Vt(I){an(I),Qe.remove(I)}function an(I){const ee=Qe.get(I).programs;ee!==void 0&&(ee.forEach(function(ue){qe.releaseProgram(ue)}),I.isShaderMaterial&&qe.releaseShaderCache(I))}this.renderBufferDirect=function(I,ee,ue,he,te,Ae){ee===null&&(ee=Dt);const we=te.isMesh&&te.matrixWorld.determinant()<0,Ye=ja(I,ee,ue,he,te);Je.setMaterial(he,we);let We=ue.index,st=1;if(he.wireframe===!0){if(We=xe.getWireframeAttribute(ue),We===void 0)return;st=2}const lt=ue.drawRange,Ze=ue.attributes.position;let wt=lt.start*st,Pt=(lt.start+lt.count)*st;Ae!==null&&(wt=Math.max(wt,Ae.start*st),Pt=Math.min(Pt,(Ae.start+Ae.count)*st)),We!==null?(wt=Math.max(wt,0),Pt=Math.min(Pt,We.count)):Ze!=null&&(wt=Math.max(wt,0),Pt=Math.min(Pt,Ze.count));const Mt=Pt-wt;if(Mt<0||Mt===1/0)return;Lt.setup(te,he,Ye,ue,We);let Mn,ht=He;if(We!==null&&(Mn=ge.get(We),ht=_t,ht.setIndex(Mn)),te.isMesh)he.wireframe===!0?(Je.setLineWidth(he.wireframeLinewidth*Bt()),ht.setMode(ne.LINES)):ht.setMode(ne.TRIANGLES);else if(te.isLine){let Ke=he.linewidth;Ke===void 0&&(Ke=1),Je.setLineWidth(Ke*Bt()),te.isLineSegments?ht.setMode(ne.LINES):te.isLineLoop?ht.setMode(ne.LINE_LOOP):ht.setMode(ne.LINE_STRIP)}else te.isPoints?ht.setMode(ne.POINTS):te.isSprite&&ht.setMode(ne.TRIANGLES);if(te.isBatchedMesh)if(te._multiDrawInstances!==null)ht.renderMultiDrawInstances(te._multiDrawStarts,te._multiDrawCounts,te._multiDrawCount,te._multiDrawInstances);else if(yt.get("WEBGL_multi_draw"))ht.renderMultiDraw(te._multiDrawStarts,te._multiDrawCounts,te._multiDrawCount);else{const Ke=te._multiDrawStarts,vi=te._multiDrawCounts,Rt=te._multiDrawCount,En=We?ge.get(We).bytesPerElement:1,_i=Qe.get(he).currentProgram.getUniforms();for(let ln=0;ln<Rt;ln++)_i.setValue(ne,"_gl_DrawID",ln),ht.render(Ke[ln]/En,vi[ln])}else if(te.isInstancedMesh)ht.renderInstances(wt,Mt,te.count);else if(ue.isInstancedBufferGeometry){const Ke=ue._maxInstanceCount!==void 0?ue._maxInstanceCount:1/0,vi=Math.min(ue.instanceCount,Ke);ht.renderInstances(wt,Mt,vi)}else ht.render(wt,Mt)};function Tt(I,ee,ue){I.transparent===!0&&I.side===ji&&I.forceSinglePass===!1?(I.side=Kn,I.needsUpdate=!0,zs(I,ee,ue),I.side=Qr,I.needsUpdate=!0,zs(I,ee,ue),I.side=ji):zs(I,ee,ue)}this.compile=function(I,ee,ue=null){ue===null&&(ue=I),_=mt.get(ue),_.init(ee),A.push(_),ue.traverseVisible(function(te){te.isLight&&te.layers.test(ee.layers)&&(_.pushLight(te),te.castShadow&&_.pushShadow(te))}),I!==ue&&I.traverseVisible(function(te){te.isLight&&te.layers.test(ee.layers)&&(_.pushLight(te),te.castShadow&&_.pushShadow(te))}),_.setupLights();const he=new Set;return I.traverse(function(te){if(!(te.isMesh||te.isPoints||te.isLine||te.isSprite))return;const Ae=te.material;if(Ae)if(Array.isArray(Ae))for(let we=0;we<Ae.length;we++){const Ye=Ae[we];Tt(Ye,ue,te),he.add(Ye)}else Tt(Ae,ue,te),he.add(Ae)}),A.pop(),_=null,he},this.compileAsync=function(I,ee,ue=null){const he=this.compile(I,ee,ue);return new Promise(te=>{function Ae(){if(he.forEach(function(we){Qe.get(we).currentProgram.isReady()&&he.delete(we)}),he.size===0){te(I);return}setTimeout(Ae,10)}yt.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let kn=null;function Dn(I){kn&&kn(I)}function Fs(){qi.stop()}function yr(){qi.start()}const qi=new y0;qi.setAnimationLoop(Dn),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(I){kn=I,de.setAnimationLoop(I),I===null?qi.stop():qi.start()},de.addEventListener("sessionstart",Fs),de.addEventListener("sessionend",yr),this.render=function(I,ee){if(ee!==void 0&&ee.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;if(I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),ee.parent===null&&ee.matrixWorldAutoUpdate===!0&&ee.updateMatrixWorld(),de.enabled===!0&&de.isPresenting===!0&&(de.cameraAutoUpdate===!0&&de.updateCamera(ee),ee=de.getCamera()),I.isScene===!0&&I.onBeforeRender(T,I,ee,z),_=mt.get(I,A.length),_.init(ee),A.push(_),Ce.multiplyMatrices(ee.projectionMatrix,ee.matrixWorldInverse),se.setFromProjectionMatrix(Ce),Me=this.localClippingEnabled,fe=Ee.init(this.clippingPlanes,Me),y=Oe.get(I,w.length),y.init(),w.push(y),de.enabled===!0&&de.isPresenting===!0){const Ae=T.xr.getDepthSensingMesh();Ae!==null&&Yi(Ae,ee,-1/0,T.sortObjects)}Yi(I,ee,0,T.sortObjects),y.finish(),T.sortObjects===!0&&y.sort(q,oe),St=de.enabled===!1||de.isPresenting===!1||de.hasDepthSensing()===!1,St&&it.addToRenderList(y,I),this.info.render.frame++,fe===!0&&Ee.beginShadows();const ue=_.state.shadowsArray;ke.render(ue,I,ee),fe===!0&&Ee.endShadows(),this.info.autoReset===!0&&this.info.reset();const he=y.opaque,te=y.transmissive;if(_.setupLights(),ee.isArrayCamera){const Ae=ee.cameras;if(te.length>0)for(let we=0,Ye=Ae.length;we<Ye;we++){const We=Ae[we];es(he,te,I,We)}St&&it.render(I);for(let we=0,Ye=Ae.length;we<Ye;we++){const We=Ae[we];Jr(y,I,We,We.viewport)}}else te.length>0&&es(he,te,I,ee),St&&it.render(I),Jr(y,I,ee);z!==null&&(F.updateMultisampleRenderTarget(z),F.updateRenderTargetMipmap(z)),I.isScene===!0&&I.onAfterRender(T,I,ee),Lt.resetDefaultState(),b=-1,C=null,A.pop(),A.length>0?(_=A[A.length-1],fe===!0&&Ee.setGlobalState(T.clippingPlanes,_.state.camera)):_=null,w.pop(),w.length>0?y=w[w.length-1]:y=null};function Yi(I,ee,ue,he){if(I.visible===!1)return;if(I.layers.test(ee.layers)){if(I.isGroup)ue=I.renderOrder;else if(I.isLOD)I.autoUpdate===!0&&I.update(ee);else if(I.isLight)_.pushLight(I),I.castShadow&&_.pushShadow(I);else if(I.isSprite){if(!I.frustumCulled||se.intersectsSprite(I)){he&&nt.setFromMatrixPosition(I.matrixWorld).applyMatrix4(Ce);const we=pe.update(I),Ye=I.material;Ye.visible&&y.push(I,we,Ye,ue,nt.z,null)}}else if((I.isMesh||I.isLine||I.isPoints)&&(!I.frustumCulled||se.intersectsObject(I))){const we=pe.update(I),Ye=I.material;if(he&&(I.boundingSphere!==void 0?(I.boundingSphere===null&&I.computeBoundingSphere(),nt.copy(I.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),nt.copy(we.boundingSphere.center)),nt.applyMatrix4(I.matrixWorld).applyMatrix4(Ce)),Array.isArray(Ye)){const We=we.groups;for(let st=0,lt=We.length;st<lt;st++){const Ze=We[st],wt=Ye[Ze.materialIndex];wt&&wt.visible&&y.push(I,we,wt,ue,nt.z,Ze)}}else Ye.visible&&y.push(I,we,Ye,ue,nt.z,null)}}const Ae=I.children;for(let we=0,Ye=Ae.length;we<Ye;we++)Yi(Ae[we],ee,ue,he)}function Jr(I,ee,ue,he){const te=I.opaque,Ae=I.transmissive,we=I.transparent;_.setupLightsView(ue),fe===!0&&Ee.setGlobalState(T.clippingPlanes,ue),he&&Je.viewport(B.copy(he)),te.length>0&&Sr(te,ee,ue),Ae.length>0&&Sr(Ae,ee,ue),we.length>0&&Sr(we,ee,ue),Je.buffers.depth.setTest(!0),Je.buffers.depth.setMask(!0),Je.buffers.color.setMask(!0),Je.setPolygonOffset(!1)}function es(I,ee,ue,he){if((ue.isScene===!0?ue.overrideMaterial:null)!==null)return;_.state.transmissionRenderTarget[he.id]===void 0&&(_.state.transmissionRenderTarget[he.id]=new Ds(1,1,{generateMipmaps:!0,type:yt.has("EXT_color_buffer_half_float")||yt.has("EXT_color_buffer_float")?ka:xr,minFilter:Ls,samples:4,stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ct.workingColorSpace}));const Ae=_.state.transmissionRenderTarget[he.id],we=he.viewport||B;Ae.setSize(we.z,we.w);const Ye=T.getRenderTarget();T.setRenderTarget(Ae),T.getClearColor(j),X=T.getClearAlpha(),X<1&&T.setClearColor(16777215,.5),T.clear(),St&&it.render(ue);const We=T.toneMapping;T.toneMapping=Kr;const st=he.viewport;if(he.viewport!==void 0&&(he.viewport=void 0),_.setupLightsView(he),fe===!0&&Ee.setGlobalState(T.clippingPlanes,he),Sr(I,ue,he),F.updateMultisampleRenderTarget(Ae),F.updateRenderTargetMipmap(Ae),yt.has("WEBGL_multisampled_render_to_texture")===!1){let lt=!1;for(let Ze=0,wt=ee.length;Ze<wt;Ze++){const Pt=ee[Ze],Mt=Pt.object,Mn=Pt.geometry,ht=Pt.material,Ke=Pt.group;if(ht.side===ji&&Mt.layers.test(he.layers)){const vi=ht.side;ht.side=Kn,ht.needsUpdate=!0,Ga(Mt,ue,he,Mn,ht,Ke),ht.side=vi,ht.needsUpdate=!0,lt=!0}}lt===!0&&(F.updateMultisampleRenderTarget(Ae),F.updateRenderTargetMipmap(Ae))}T.setRenderTarget(Ye),T.setClearColor(j,X),st!==void 0&&(he.viewport=st),T.toneMapping=We}function Sr(I,ee,ue){const he=ee.isScene===!0?ee.overrideMaterial:null;for(let te=0,Ae=I.length;te<Ae;te++){const we=I[te],Ye=we.object,We=we.geometry,st=he===null?we.material:he,lt=we.group;Ye.layers.test(ue.layers)&&Ga(Ye,ee,ue,We,st,lt)}}function Ga(I,ee,ue,he,te,Ae){I.onBeforeRender(T,ee,ue,he,te,Ae),I.modelViewMatrix.multiplyMatrices(ue.matrixWorldInverse,I.matrixWorld),I.normalMatrix.getNormalMatrix(I.modelViewMatrix),te.onBeforeRender(T,ee,ue,he,I,Ae),te.transparent===!0&&te.side===ji&&te.forceSinglePass===!1?(te.side=Kn,te.needsUpdate=!0,T.renderBufferDirect(ue,ee,he,te,I,Ae),te.side=Qr,te.needsUpdate=!0,T.renderBufferDirect(ue,ee,he,te,I,Ae),te.side=ji):T.renderBufferDirect(ue,ee,he,te,I,Ae),I.onAfterRender(T,ee,ue,he,te,Ae)}function zs(I,ee,ue){ee.isScene!==!0&&(ee=Dt);const he=Qe.get(I),te=_.state.lights,Ae=_.state.shadowsArray,we=te.state.version,Ye=qe.getParameters(I,te.state,Ae,ee,ue),We=qe.getProgramCacheKey(Ye);let st=he.programs;he.environment=I.isMeshStandardMaterial?ee.environment:null,he.fog=ee.fog,he.envMap=(I.isMeshStandardMaterial?le:L).get(I.envMap||he.environment),he.envMapRotation=he.environment!==null&&I.envMap===null?ee.environmentRotation:I.envMapRotation,st===void 0&&(I.addEventListener("dispose",ut),st=new Map,he.programs=st);let lt=st.get(We);if(lt!==void 0){if(he.currentProgram===lt&&he.lightsStateVersion===we)return Di(I,Ye),lt}else Ye.uniforms=qe.getUniforms(I),I.onBeforeCompile(Ye,T),lt=qe.acquireProgram(Ye,We),st.set(We,lt),he.uniforms=Ye.uniforms;const Ze=he.uniforms;return(!I.isShaderMaterial&&!I.isRawShaderMaterial||I.clipping===!0)&&(Ze.clippingPlanes=Ee.uniform),Di(I,Ye),he.needsLights=Kc(I),he.lightsStateVersion=we,he.needsLights&&(Ze.ambientLightColor.value=te.state.ambient,Ze.lightProbe.value=te.state.probe,Ze.directionalLights.value=te.state.directional,Ze.directionalLightShadows.value=te.state.directionalShadow,Ze.spotLights.value=te.state.spot,Ze.spotLightShadows.value=te.state.spotShadow,Ze.rectAreaLights.value=te.state.rectArea,Ze.ltc_1.value=te.state.rectAreaLTC1,Ze.ltc_2.value=te.state.rectAreaLTC2,Ze.pointLights.value=te.state.point,Ze.pointLightShadows.value=te.state.pointShadow,Ze.hemisphereLights.value=te.state.hemi,Ze.directionalShadowMap.value=te.state.directionalShadowMap,Ze.directionalShadowMatrix.value=te.state.directionalShadowMatrix,Ze.spotShadowMap.value=te.state.spotShadowMap,Ze.spotLightMatrix.value=te.state.spotLightMatrix,Ze.spotLightMap.value=te.state.spotLightMap,Ze.pointShadowMap.value=te.state.pointShadowMap,Ze.pointShadowMatrix.value=te.state.pointShadowMatrix),he.currentProgram=lt,he.uniformsList=null,lt}function Wa(I){if(I.uniformsList===null){const ee=I.currentProgram.getUniforms();I.uniformsList=Nc.seqWithValue(ee.seq,I.uniforms)}return I.uniformsList}function Di(I,ee){const ue=Qe.get(I);ue.outputColorSpace=ee.outputColorSpace,ue.batching=ee.batching,ue.batchingColor=ee.batchingColor,ue.instancing=ee.instancing,ue.instancingColor=ee.instancingColor,ue.instancingMorph=ee.instancingMorph,ue.skinning=ee.skinning,ue.morphTargets=ee.morphTargets,ue.morphNormals=ee.morphNormals,ue.morphColors=ee.morphColors,ue.morphTargetsCount=ee.morphTargetsCount,ue.numClippingPlanes=ee.numClippingPlanes,ue.numIntersection=ee.numClipIntersection,ue.vertexAlphas=ee.vertexAlphas,ue.vertexTangents=ee.vertexTangents,ue.toneMapping=ee.toneMapping}function ja(I,ee,ue,he,te){ee.isScene!==!0&&(ee=Dt),F.resetTextureUnits();const Ae=ee.fog,we=he.isMeshStandardMaterial?ee.environment:null,Ye=z===null?T.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Uo,We=(he.isMeshStandardMaterial?le:L).get(he.envMap||we),st=he.vertexColors===!0&&!!ue.attributes.color&&ue.attributes.color.itemSize===4,lt=!!ue.attributes.tangent&&(!!he.normalMap||he.anisotropy>0),Ze=!!ue.morphAttributes.position,wt=!!ue.morphAttributes.normal,Pt=!!ue.morphAttributes.color;let Mt=Kr;he.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(Mt=T.toneMapping);const Mn=ue.morphAttributes.position||ue.morphAttributes.normal||ue.morphAttributes.color,ht=Mn!==void 0?Mn.length:0,Ke=Qe.get(he),vi=_.state.lights;if(fe===!0&&(Me===!0||I!==C)){const Un=I===C&&he.id===b;Ee.setState(he,I,Un)}let Rt=!1;he.version===Ke.__version?(Ke.needsLights&&Ke.lightsStateVersion!==vi.state.version||Ke.outputColorSpace!==Ye||te.isBatchedMesh&&Ke.batching===!1||!te.isBatchedMesh&&Ke.batching===!0||te.isBatchedMesh&&Ke.batchingColor===!0&&te.colorTexture===null||te.isBatchedMesh&&Ke.batchingColor===!1&&te.colorTexture!==null||te.isInstancedMesh&&Ke.instancing===!1||!te.isInstancedMesh&&Ke.instancing===!0||te.isSkinnedMesh&&Ke.skinning===!1||!te.isSkinnedMesh&&Ke.skinning===!0||te.isInstancedMesh&&Ke.instancingColor===!0&&te.instanceColor===null||te.isInstancedMesh&&Ke.instancingColor===!1&&te.instanceColor!==null||te.isInstancedMesh&&Ke.instancingMorph===!0&&te.morphTexture===null||te.isInstancedMesh&&Ke.instancingMorph===!1&&te.morphTexture!==null||Ke.envMap!==We||he.fog===!0&&Ke.fog!==Ae||Ke.numClippingPlanes!==void 0&&(Ke.numClippingPlanes!==Ee.numPlanes||Ke.numIntersection!==Ee.numIntersection)||Ke.vertexAlphas!==st||Ke.vertexTangents!==lt||Ke.morphTargets!==Ze||Ke.morphNormals!==wt||Ke.morphColors!==Pt||Ke.toneMapping!==Mt||Ke.morphTargetsCount!==ht)&&(Rt=!0):(Rt=!0,Ke.__version=he.version);let En=Ke.currentProgram;Rt===!0&&(En=zs(he,ee,te));let _i=!1,ln=!1,Ui=!1;const zt=En.getUniforms(),ai=Ke.uniforms;if(Je.useProgram(En.program)&&(_i=!0,ln=!0,Ui=!0),he.id!==b&&(b=he.id,ln=!0),_i||C!==I){Je.buffers.depth.getReversed()?(_e.copy(I.projectionMatrix),yy(_e),Sy(_e),zt.setValue(ne,"projectionMatrix",_e)):zt.setValue(ne,"projectionMatrix",I.projectionMatrix),zt.setValue(ne,"viewMatrix",I.matrixWorldInverse);const li=zt.map.cameraPosition;li!==void 0&&li.setValue(ne,ze.setFromMatrixPosition(I.matrixWorld)),vt.logarithmicDepthBuffer&&zt.setValue(ne,"logDepthBufFC",2/(Math.log(I.far+1)/Math.LN2)),(he.isMeshPhongMaterial||he.isMeshToonMaterial||he.isMeshLambertMaterial||he.isMeshBasicMaterial||he.isMeshStandardMaterial||he.isShaderMaterial)&&zt.setValue(ne,"isOrthographic",I.isOrthographicCamera===!0),C!==I&&(C=I,ln=!0,Ui=!0)}if(te.isSkinnedMesh){zt.setOptional(ne,te,"bindMatrix"),zt.setOptional(ne,te,"bindMatrixInverse");const Un=te.skeleton;Un&&(Un.boneTexture===null&&Un.computeBoneTexture(),zt.setValue(ne,"boneTexture",Un.boneTexture,F))}te.isBatchedMesh&&(zt.setOptional(ne,te,"batchingTexture"),zt.setValue(ne,"batchingTexture",te._matricesTexture,F),zt.setOptional(ne,te,"batchingIdTexture"),zt.setValue(ne,"batchingIdTexture",te._indirectTexture,F),zt.setOptional(ne,te,"batchingColorTexture"),te._colorsTexture!==null&&zt.setValue(ne,"batchingColorTexture",te._colorsTexture,F));const Zi=ue.morphAttributes;if((Zi.position!==void 0||Zi.normal!==void 0||Zi.color!==void 0)&&rt.update(te,ue,En),(ln||Ke.receiveShadow!==te.receiveShadow)&&(Ke.receiveShadow=te.receiveShadow,zt.setValue(ne,"receiveShadow",te.receiveShadow)),he.isMeshGouraudMaterial&&he.envMap!==null&&(ai.envMap.value=We,ai.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),he.isMeshStandardMaterial&&he.envMap===null&&ee.environment!==null&&(ai.envMapIntensity.value=ee.environmentIntensity),ln&&(zt.setValue(ne,"toneMappingExposure",T.toneMappingExposure),Ke.needsLights&&Xa(ai,Ui),Ae&&he.fog===!0&&Pe.refreshFogUniforms(ai,Ae),Pe.refreshMaterialUniforms(ai,he,H,ie,_.state.transmissionRenderTarget[I.id]),Nc.upload(ne,Wa(Ke),ai,F)),he.isShaderMaterial&&he.uniformsNeedUpdate===!0&&(Nc.upload(ne,Wa(Ke),ai,F),he.uniformsNeedUpdate=!1),he.isSpriteMaterial&&zt.setValue(ne,"center",te.center),zt.setValue(ne,"modelViewMatrix",te.modelViewMatrix),zt.setValue(ne,"normalMatrix",te.normalMatrix),zt.setValue(ne,"modelMatrix",te.matrixWorld),he.isShaderMaterial||he.isRawShaderMaterial){const Un=he.uniformsGroups;for(let li=0,Hn=Un.length;li<Hn;li++){const qa=Un[li];J.update(qa,En),J.bind(qa,En)}}return En}function Xa(I,ee){I.ambientLightColor.needsUpdate=ee,I.lightProbe.needsUpdate=ee,I.directionalLights.needsUpdate=ee,I.directionalLightShadows.needsUpdate=ee,I.pointLights.needsUpdate=ee,I.pointLightShadows.needsUpdate=ee,I.spotLights.needsUpdate=ee,I.spotLightShadows.needsUpdate=ee,I.rectAreaLights.needsUpdate=ee,I.hemisphereLights.needsUpdate=ee}function Kc(I){return I.isMeshLambertMaterial||I.isMeshToonMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isShadowMaterial||I.isShaderMaterial&&I.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return D},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(I,ee,ue){Qe.get(I.texture).__webglTexture=ee,Qe.get(I.depthTexture).__webglTexture=ue;const he=Qe.get(I);he.__hasExternalTextures=!0,he.__autoAllocateDepthBuffer=ue===void 0,he.__autoAllocateDepthBuffer||yt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),he.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(I,ee){const ue=Qe.get(I);ue.__webglFramebuffer=ee,ue.__useDefaultFramebuffer=ee===void 0},this.setRenderTarget=function(I,ee=0,ue=0){z=I,N=ee,D=ue;let he=!0,te=null,Ae=!1,we=!1;if(I){const We=Qe.get(I);if(We.__useDefaultFramebuffer!==void 0)Je.bindFramebuffer(ne.FRAMEBUFFER,null),he=!1;else if(We.__webglFramebuffer===void 0)F.setupRenderTarget(I);else if(We.__hasExternalTextures)F.rebindTextures(I,Qe.get(I.texture).__webglTexture,Qe.get(I.depthTexture).__webglTexture);else if(I.depthBuffer){const Ze=I.depthTexture;if(We.__boundDepthTexture!==Ze){if(Ze!==null&&Qe.has(Ze)&&(I.width!==Ze.image.width||I.height!==Ze.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");F.setupDepthRenderbuffer(I)}}const st=I.texture;(st.isData3DTexture||st.isDataArrayTexture||st.isCompressedArrayTexture)&&(we=!0);const lt=Qe.get(I).__webglFramebuffer;I.isWebGLCubeRenderTarget?(Array.isArray(lt[ee])?te=lt[ee][ue]:te=lt[ee],Ae=!0):I.samples>0&&F.useMultisampledRTT(I)===!1?te=Qe.get(I).__webglMultisampledFramebuffer:Array.isArray(lt)?te=lt[ue]:te=lt,B.copy(I.viewport),O.copy(I.scissor),k=I.scissorTest}else B.copy(G).multiplyScalar(H).floor(),O.copy(Q).multiplyScalar(H).floor(),k=be;if(Je.bindFramebuffer(ne.FRAMEBUFFER,te)&&he&&Je.drawBuffers(I,te),Je.viewport(B),Je.scissor(O),Je.setScissorTest(k),Ae){const We=Qe.get(I.texture);ne.framebufferTexture2D(ne.FRAMEBUFFER,ne.COLOR_ATTACHMENT0,ne.TEXTURE_CUBE_MAP_POSITIVE_X+ee,We.__webglTexture,ue)}else if(we){const We=Qe.get(I.texture),st=ee||0;ne.framebufferTextureLayer(ne.FRAMEBUFFER,ne.COLOR_ATTACHMENT0,We.__webglTexture,ue||0,st)}b=-1},this.readRenderTargetPixels=function(I,ee,ue,he,te,Ae,we){if(!(I&&I.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ye=Qe.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&we!==void 0&&(Ye=Ye[we]),Ye){Je.bindFramebuffer(ne.FRAMEBUFFER,Ye);try{const We=I.texture,st=We.format,lt=We.type;if(!vt.textureFormatReadable(st)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!vt.textureTypeReadable(lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}ee>=0&&ee<=I.width-he&&ue>=0&&ue<=I.height-te&&ne.readPixels(ee,ue,he,te,ct.convert(st),ct.convert(lt),Ae)}finally{const We=z!==null?Qe.get(z).__webglFramebuffer:null;Je.bindFramebuffer(ne.FRAMEBUFFER,We)}}},this.readRenderTargetPixelsAsync=async function(I,ee,ue,he,te,Ae,we){if(!(I&&I.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ye=Qe.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&we!==void 0&&(Ye=Ye[we]),Ye){const We=I.texture,st=We.format,lt=We.type;if(!vt.textureFormatReadable(st))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!vt.textureTypeReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(ee>=0&&ee<=I.width-he&&ue>=0&&ue<=I.height-te){Je.bindFramebuffer(ne.FRAMEBUFFER,Ye);const Ze=ne.createBuffer();ne.bindBuffer(ne.PIXEL_PACK_BUFFER,Ze),ne.bufferData(ne.PIXEL_PACK_BUFFER,Ae.byteLength,ne.STREAM_READ),ne.readPixels(ee,ue,he,te,ct.convert(st),ct.convert(lt),0);const wt=z!==null?Qe.get(z).__webglFramebuffer:null;Je.bindFramebuffer(ne.FRAMEBUFFER,wt);const Pt=ne.fenceSync(ne.SYNC_GPU_COMMANDS_COMPLETE,0);return ne.flush(),await xy(ne,Pt,4),ne.bindBuffer(ne.PIXEL_PACK_BUFFER,Ze),ne.getBufferSubData(ne.PIXEL_PACK_BUFFER,0,Ae),ne.deleteBuffer(Ze),ne.deleteSync(Pt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(I,ee=null,ue=0){I.isTexture!==!0&&(Ia("WebGLRenderer: copyFramebufferToTexture function signature has changed."),ee=arguments[0]||null,I=arguments[1]);const he=Math.pow(2,-ue),te=Math.floor(I.image.width*he),Ae=Math.floor(I.image.height*he),we=ee!==null?ee.x:0,Ye=ee!==null?ee.y:0;F.setTexture2D(I,0),ne.copyTexSubImage2D(ne.TEXTURE_2D,ue,0,0,we,Ye,te,Ae),Je.unbindTexture()},this.copyTextureToTexture=function(I,ee,ue=null,he=null,te=0){I.isTexture!==!0&&(Ia("WebGLRenderer: copyTextureToTexture function signature has changed."),he=arguments[0]||null,I=arguments[1],ee=arguments[2],te=arguments[3]||0,ue=null);let Ae,we,Ye,We,st,lt,Ze,wt,Pt;const Mt=I.isCompressedTexture?I.mipmaps[te]:I.image;ue!==null?(Ae=ue.max.x-ue.min.x,we=ue.max.y-ue.min.y,Ye=ue.isBox3?ue.max.z-ue.min.z:1,We=ue.min.x,st=ue.min.y,lt=ue.isBox3?ue.min.z:0):(Ae=Mt.width,we=Mt.height,Ye=Mt.depth||1,We=0,st=0,lt=0),he!==null?(Ze=he.x,wt=he.y,Pt=he.z):(Ze=0,wt=0,Pt=0);const Mn=ct.convert(ee.format),ht=ct.convert(ee.type);let Ke;ee.isData3DTexture?(F.setTexture3D(ee,0),Ke=ne.TEXTURE_3D):ee.isDataArrayTexture||ee.isCompressedArrayTexture?(F.setTexture2DArray(ee,0),Ke=ne.TEXTURE_2D_ARRAY):(F.setTexture2D(ee,0),Ke=ne.TEXTURE_2D),ne.pixelStorei(ne.UNPACK_FLIP_Y_WEBGL,ee.flipY),ne.pixelStorei(ne.UNPACK_PREMULTIPLY_ALPHA_WEBGL,ee.premultiplyAlpha),ne.pixelStorei(ne.UNPACK_ALIGNMENT,ee.unpackAlignment);const vi=ne.getParameter(ne.UNPACK_ROW_LENGTH),Rt=ne.getParameter(ne.UNPACK_IMAGE_HEIGHT),En=ne.getParameter(ne.UNPACK_SKIP_PIXELS),_i=ne.getParameter(ne.UNPACK_SKIP_ROWS),ln=ne.getParameter(ne.UNPACK_SKIP_IMAGES);ne.pixelStorei(ne.UNPACK_ROW_LENGTH,Mt.width),ne.pixelStorei(ne.UNPACK_IMAGE_HEIGHT,Mt.height),ne.pixelStorei(ne.UNPACK_SKIP_PIXELS,We),ne.pixelStorei(ne.UNPACK_SKIP_ROWS,st),ne.pixelStorei(ne.UNPACK_SKIP_IMAGES,lt);const Ui=I.isDataArrayTexture||I.isData3DTexture,zt=ee.isDataArrayTexture||ee.isData3DTexture;if(I.isRenderTargetTexture||I.isDepthTexture){const ai=Qe.get(I),Zi=Qe.get(ee),Un=Qe.get(ai.__renderTarget),li=Qe.get(Zi.__renderTarget);Je.bindFramebuffer(ne.READ_FRAMEBUFFER,Un.__webglFramebuffer),Je.bindFramebuffer(ne.DRAW_FRAMEBUFFER,li.__webglFramebuffer);for(let Hn=0;Hn<Ye;Hn++)Ui&&ne.framebufferTextureLayer(ne.READ_FRAMEBUFFER,ne.COLOR_ATTACHMENT0,Qe.get(I).__webglTexture,te,lt+Hn),I.isDepthTexture?(zt&&ne.framebufferTextureLayer(ne.DRAW_FRAMEBUFFER,ne.COLOR_ATTACHMENT0,Qe.get(ee).__webglTexture,te,Pt+Hn),ne.blitFramebuffer(We,st,Ae,we,Ze,wt,Ae,we,ne.DEPTH_BUFFER_BIT,ne.NEAREST)):zt?ne.copyTexSubImage3D(Ke,te,Ze,wt,Pt+Hn,We,st,Ae,we):ne.copyTexSubImage2D(Ke,te,Ze,wt,Pt+Hn,We,st,Ae,we);Je.bindFramebuffer(ne.READ_FRAMEBUFFER,null),Je.bindFramebuffer(ne.DRAW_FRAMEBUFFER,null)}else zt?I.isDataTexture||I.isData3DTexture?ne.texSubImage3D(Ke,te,Ze,wt,Pt,Ae,we,Ye,Mn,ht,Mt.data):ee.isCompressedArrayTexture?ne.compressedTexSubImage3D(Ke,te,Ze,wt,Pt,Ae,we,Ye,Mn,Mt.data):ne.texSubImage3D(Ke,te,Ze,wt,Pt,Ae,we,Ye,Mn,ht,Mt):I.isDataTexture?ne.texSubImage2D(ne.TEXTURE_2D,te,Ze,wt,Ae,we,Mn,ht,Mt.data):I.isCompressedTexture?ne.compressedTexSubImage2D(ne.TEXTURE_2D,te,Ze,wt,Mt.width,Mt.height,Mn,Mt.data):ne.texSubImage2D(ne.TEXTURE_2D,te,Ze,wt,Ae,we,Mn,ht,Mt);ne.pixelStorei(ne.UNPACK_ROW_LENGTH,vi),ne.pixelStorei(ne.UNPACK_IMAGE_HEIGHT,Rt),ne.pixelStorei(ne.UNPACK_SKIP_PIXELS,En),ne.pixelStorei(ne.UNPACK_SKIP_ROWS,_i),ne.pixelStorei(ne.UNPACK_SKIP_IMAGES,ln),te===0&&ee.generateMipmaps&&ne.generateMipmap(Ke),Je.unbindTexture()},this.copyTextureToTexture3D=function(I,ee,ue=null,he=null,te=0){return I.isTexture!==!0&&(Ia("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ue=arguments[0]||null,he=arguments[1]||null,I=arguments[2],ee=arguments[3],te=arguments[4]||0),Ia('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(I,ee,ue,he,te)},this.initRenderTarget=function(I){Qe.get(I).__webglFramebuffer===void 0&&F.setupRenderTarget(I)},this.initTexture=function(I){I.isCubeTexture?F.setTextureCube(I,0):I.isData3DTexture?F.setTexture3D(I,0):I.isDataArrayTexture||I.isCompressedArrayTexture?F.setTexture2DArray(I,0):F.setTexture2D(I,0),Je.unbindTexture()},this.resetState=function(){N=0,D=0,z=null,Je.reset(),Lt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ct._getUnpackColorSpace()}}class P1 extends on{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new si,this.environmentIntensity=1,this.environmentRotation=new si,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Mf extends zo{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new at(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Oc=new $,Bc=new $,sv=new Ht,wa=new _f,gc=new jc,ud=new $,ov=new $;class pr extends on{constructor(e=new Sn,t=new Mf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,o=t.count;s<o;s++)Oc.fromBufferAttribute(t,s-1),Bc.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Oc.distanceTo(Bc);e.setAttribute("lineDistance",new $t(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,o=e.params.Line.threshold,c=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),gc.copy(i.boundingSphere),gc.applyMatrix4(s),gc.radius+=o,e.ray.intersectsSphere(gc)===!1)return;sv.copy(s).invert(),wa.copy(e.ray).applyMatrix4(sv);const u=o/((this.scale.x+this.scale.y+this.scale.z)/3),d=u*u,f=this.isLineSegments?2:1,p=i.index,m=i.attributes.position;if(p!==null){const x=Math.max(0,c.start),S=Math.min(p.count,c.start+c.count);for(let E=x,y=S-1;E<y;E+=f){const _=p.getX(E),w=p.getX(E+1),A=vc(this,e,wa,d,_,w);A&&t.push(A)}if(this.isLineLoop){const E=p.getX(S-1),y=p.getX(x),_=vc(this,e,wa,d,E,y);_&&t.push(_)}}else{const x=Math.max(0,c.start),S=Math.min(m.count,c.start+c.count);for(let E=x,y=S-1;E<y;E+=f){const _=vc(this,e,wa,d,E,E+1);_&&t.push(_)}if(this.isLineLoop){const E=vc(this,e,wa,d,S-1,x);E&&t.push(E)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,c=s.length;o<c;o++){const u=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=o}}}}}function vc(a,e,t,i,s,o){const c=a.geometry.attributes.position;if(Oc.fromBufferAttribute(c,s),Bc.fromBufferAttribute(c,o),t.distanceSqToSegment(Oc,Bc,ud,ov)>i)return;ud.applyMatrix4(a.matrixWorld);const d=e.ray.origin.distanceTo(ud);if(!(d<e.near||d>e.far))return{distance:d,point:ov.clone().applyMatrix4(a.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:a}}const av=new $,lv=new $;class L1 extends pr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,o=t.count;s<o;s+=2)av.fromBufferAttribute(t,s),lv.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+av.distanceTo(lv);e.setAttribute("lineDistance",new $t(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class I1 extends In{constructor(e,t,i,s,o,c,u,d,f){super(e,t,i,s,o,c,u,d,f),this.isCanvasTexture=!0,this.needsUpdate=!0}}class yn extends Sn{constructor(e=1,t=1,i=1,s=32,o=1,c=!1,u=0,d=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:o,openEnded:c,thetaStart:u,thetaLength:d};const f=this;s=Math.floor(s),o=Math.floor(o);const p=[],v=[],m=[],x=[];let S=0;const E=[],y=i/2;let _=0;w(),c===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(p),this.setAttribute("position",new $t(v,3)),this.setAttribute("normal",new $t(m,3)),this.setAttribute("uv",new $t(x,2));function w(){const T=new $,U=new $;let N=0;const D=(t-e)/i;for(let z=0;z<=o;z++){const b=[],C=z/o,B=C*(t-e)+e;for(let O=0;O<=s;O++){const k=O/s,j=k*d+u,X=Math.sin(j),W=Math.cos(j);U.x=B*X,U.y=-C*i+y,U.z=B*W,v.push(U.x,U.y,U.z),T.set(X,D,W).normalize(),m.push(T.x,T.y,T.z),x.push(k,1-C),b.push(S++)}E.push(b)}for(let z=0;z<s;z++)for(let b=0;b<o;b++){const C=E[b][z],B=E[b+1][z],O=E[b+1][z+1],k=E[b][z+1];(e>0||b!==0)&&(p.push(C,B,k),N+=3),(t>0||b!==o-1)&&(p.push(B,O,k),N+=3)}f.addGroup(_,N,0),_+=N}function A(T){const U=S,N=new Et,D=new $;let z=0;const b=T===!0?e:t,C=T===!0?1:-1;for(let O=1;O<=s;O++)v.push(0,y*C,0),m.push(0,C,0),x.push(.5,.5),S++;const B=S;for(let O=0;O<=s;O++){const j=O/s*d+u,X=Math.cos(j),W=Math.sin(j);D.x=b*W,D.y=y*C,D.z=b*X,v.push(D.x,D.y,D.z),m.push(0,C,0),N.x=X*.5+.5,N.y=W*.5*C+.5,x.push(N.x,N.y),S++}for(let O=0;O<s;O++){const k=U+O,j=B+O;T===!0?p.push(j,j+1,k):p.push(j+1,j,k),z+=3}f.addGroup(_,z,T===!0?1:2),_+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ef extends Sn{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const o=[],c=[];u(s),f(i),p(),this.setAttribute("position",new $t(o,3)),this.setAttribute("normal",new $t(o.slice(),3)),this.setAttribute("uv",new $t(c,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function u(w){const A=new $,T=new $,U=new $;for(let N=0;N<t.length;N+=3)x(t[N+0],A),x(t[N+1],T),x(t[N+2],U),d(A,T,U,w)}function d(w,A,T,U){const N=U+1,D=[];for(let z=0;z<=N;z++){D[z]=[];const b=w.clone().lerp(T,z/N),C=A.clone().lerp(T,z/N),B=N-z;for(let O=0;O<=B;O++)O===0&&z===N?D[z][O]=b:D[z][O]=b.clone().lerp(C,O/B)}for(let z=0;z<N;z++)for(let b=0;b<2*(N-z)-1;b++){const C=Math.floor(b/2);b%2===0?(m(D[z][C+1]),m(D[z+1][C]),m(D[z][C])):(m(D[z][C+1]),m(D[z+1][C+1]),m(D[z+1][C]))}}function f(w){const A=new $;for(let T=0;T<o.length;T+=3)A.x=o[T+0],A.y=o[T+1],A.z=o[T+2],A.normalize().multiplyScalar(w),o[T+0]=A.x,o[T+1]=A.y,o[T+2]=A.z}function p(){const w=new $;for(let A=0;A<o.length;A+=3){w.x=o[A+0],w.y=o[A+1],w.z=o[A+2];const T=y(w)/2/Math.PI+.5,U=_(w)/Math.PI+.5;c.push(T,1-U)}S(),v()}function v(){for(let w=0;w<c.length;w+=6){const A=c[w+0],T=c[w+2],U=c[w+4],N=Math.max(A,T,U),D=Math.min(A,T,U);N>.9&&D<.1&&(A<.2&&(c[w+0]+=1),T<.2&&(c[w+2]+=1),U<.2&&(c[w+4]+=1))}}function m(w){o.push(w.x,w.y,w.z)}function x(w,A){const T=w*3;A.x=e[T+0],A.y=e[T+1],A.z=e[T+2]}function S(){const w=new $,A=new $,T=new $,U=new $,N=new Et,D=new Et,z=new Et;for(let b=0,C=0;b<o.length;b+=9,C+=6){w.set(o[b+0],o[b+1],o[b+2]),A.set(o[b+3],o[b+4],o[b+5]),T.set(o[b+6],o[b+7],o[b+8]),N.set(c[C+0],c[C+1]),D.set(c[C+2],c[C+3]),z.set(c[C+4],c[C+5]),U.copy(w).add(A).add(T).divideScalar(3);const B=y(U);E(N,C+0,w,B),E(D,C+2,A,B),E(z,C+4,T,B)}}function E(w,A,T,U){U<0&&w.x===1&&(c[A]=w.x-1),T.x===0&&T.z===0&&(c[A]=U/2/Math.PI+.5)}function y(w){return Math.atan2(w.z,-w.x)}function _(w){return Math.atan2(-w.y,Math.sqrt(w.x*w.x+w.z*w.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ef(e.vertices,e.indices,e.radius,e.details)}}class To extends Ef{constructor(e=1,t=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new To(e.radius,e.detail)}}class Yc extends Sn{constructor(e=1,t=32,i=16,s=0,o=Math.PI*2,c=0,u=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:o,thetaStart:c,thetaLength:u},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const d=Math.min(c+u,Math.PI);let f=0;const p=[],v=new $,m=new $,x=[],S=[],E=[],y=[];for(let _=0;_<=i;_++){const w=[],A=_/i;let T=0;_===0&&c===0?T=.5/t:_===i&&d===Math.PI&&(T=-.5/t);for(let U=0;U<=t;U++){const N=U/t;v.x=-e*Math.cos(s+N*o)*Math.sin(c+A*u),v.y=e*Math.cos(c+A*u),v.z=e*Math.sin(s+N*o)*Math.sin(c+A*u),S.push(v.x,v.y,v.z),m.copy(v).normalize(),E.push(m.x,m.y,m.z),y.push(N+T,1-A),w.push(f++)}p.push(w)}for(let _=0;_<i;_++)for(let w=0;w<t;w++){const A=p[_][w+1],T=p[_][w],U=p[_+1][w],N=p[_+1][w+1];(_!==0||c>0)&&x.push(A,T,N),(_!==i-1||d<Math.PI)&&x.push(T,U,N)}this.setIndex(x),this.setAttribute("position",new $t(S,3)),this.setAttribute("normal",new $t(E,3)),this.setAttribute("uv",new $t(y,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Rs extends Sn{constructor(e=1,t=.4,i=12,s=48,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:o},i=Math.floor(i),s=Math.floor(s);const c=[],u=[],d=[],f=[],p=new $,v=new $,m=new $;for(let x=0;x<=i;x++)for(let S=0;S<=s;S++){const E=S/s*o,y=x/i*Math.PI*2;v.x=(e+t*Math.cos(y))*Math.cos(E),v.y=(e+t*Math.cos(y))*Math.sin(E),v.z=t*Math.sin(y),u.push(v.x,v.y,v.z),p.x=e*Math.cos(E),p.y=e*Math.sin(E),m.subVectors(v,p).normalize(),d.push(m.x,m.y,m.z),f.push(S/s),f.push(x/i)}for(let x=1;x<=i;x++)for(let S=1;S<=s;S++){const E=(s+1)*x+S-1,y=(s+1)*(x-1)+S-1,_=(s+1)*(x-1)+S,w=(s+1)*x+S;c.push(E,y,w),c.push(y,_,w)}this.setIndex(c),this.setAttribute("position",new $t(u,3)),this.setAttribute("normal",new $t(d,3)),this.setAttribute("uv",new $t(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rs(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class af extends zo{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new at(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=l0,this.normalScale=new Et(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const cv={enabled:!1,files:{},add:function(a,e){this.enabled!==!1&&(this.files[a]=e)},get:function(a){if(this.enabled!==!1)return this.files[a]},remove:function(a){delete this.files[a]},clear:function(){this.files={}}};class N1{constructor(e,t,i){const s=this;let o=!1,c=0,u=0,d;const f=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(p){u++,o===!1&&s.onStart!==void 0&&s.onStart(p,c,u),o=!0},this.itemEnd=function(p){c++,s.onProgress!==void 0&&s.onProgress(p,c,u),c===u&&(o=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(p){s.onError!==void 0&&s.onError(p)},this.resolveURL=function(p){return d?d(p):p},this.setURLModifier=function(p){return d=p,this},this.addHandler=function(p,v){return f.push(p,v),this},this.removeHandler=function(p){const v=f.indexOf(p);return v!==-1&&f.splice(v,2),this},this.getHandler=function(p){for(let v=0,m=f.length;v<m;v+=2){const x=f[v],S=f[v+1];if(x.global&&(x.lastIndex=0),x.test(p))return S}return null}}}const D1=new N1;class wf{constructor(e){this.manager=e!==void 0?e:D1,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,o){i.load(e,s,t,o)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}wf.DEFAULT_MATERIAL_NAME="__DEFAULT";class U1 extends wf{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const o=this,c=cv.get(e);if(c!==void 0)return o.manager.itemStart(e),setTimeout(function(){t&&t(c),o.manager.itemEnd(e)},0),c;const u=Oa("img");function d(){p(),cv.add(e,this),t&&t(this),o.manager.itemEnd(e)}function f(v){p(),s&&s(v),o.manager.itemError(e),o.manager.itemEnd(e)}function p(){u.removeEventListener("load",d,!1),u.removeEventListener("error",f,!1)}return u.addEventListener("load",d,!1),u.addEventListener("error",f,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(u.crossOrigin=this.crossOrigin),o.manager.itemStart(e),u.src=e,u}}class F1 extends wf{constructor(e){super(e)}load(e,t,i,s){const o=new In,c=new U1(this.manager);return c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(e,function(u){o.image=u,o.needsUpdate=!0,t!==void 0&&t(o)},i,s),o}}class C0 extends on{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new at(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const hd=new Ht,uv=new $,hv=new $;class z1{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Et(512,512),this.map=null,this.mapPass=null,this.matrix=new Ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yf,this._frameExtents=new Et(1,1),this._viewportCount=1,this._viewports=[new Jt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;uv.setFromMatrixPosition(e.matrixWorld),t.position.copy(uv),hv.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(hv),t.updateMatrixWorld(),hd.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(hd),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(hd)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class O1 extends z1{constructor(){super(new S0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class B1 extends C0{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(on.DEFAULT_UP),this.updateMatrix(),this.target=new on,this.shadow=new O1}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class k1 extends C0{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class H1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=dv(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=dv();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function dv(){return performance.now()}const fv=new Ht;class Tf{constructor(e,t,i=0,s=1/0){this.ray=new _f(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new xf,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return fv.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(fv),this}intersectObject(e,t=!0,i=[]){return lf(e,this,i,t),i.sort(pv),i}intersectObjects(e,t=!0,i=[]){for(let s=0,o=e.length;s<o;s++)lf(e[s],this,i,t);return i.sort(pv),i}}function pv(a,e){return a.distance-e.distance}function lf(a,e,t,i){let s=!0;if(a.layers.test(e.layers)&&a.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const o=a.children;for(let c=0,u=o.length;c<u;c++)lf(o[c],e,t,!0)}}const _c=new Fo;class V1 extends L1{constructor(e,t=16776960){const i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),o=new Sn;o.setIndex(new Qn(i,1)),o.setAttribute("position",new Qn(s,3)),super(o,new Mf({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(e){if(e!==void 0&&console.warn("THREE.BoxHelper: .update() has no longer arguments."),this.object!==void 0&&_c.setFromObject(this.object),_c.isEmpty())return;const t=_c.min,i=_c.max,s=this.geometry.attributes.position,o=s.array;o[0]=i.x,o[1]=i.y,o[2]=i.z,o[3]=t.x,o[4]=i.y,o[5]=i.z,o[6]=t.x,o[7]=t.y,o[8]=i.z,o[9]=i.x,o[10]=t.y,o[11]=i.z,o[12]=i.x,o[13]=i.y,o[14]=t.z,o[15]=t.x,o[16]=i.y,o[17]=t.z,o[18]=t.x,o[19]=t.y,o[20]=t.z,o[21]=i.x,o[22]=t.y,o[23]=t.z,s.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class G1 extends Us{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:hf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=hf);class W1{constructor(e){Ie(this,"camera");Ie(this,"keys",new Set);Ie(this,"moveDir",new $);Ie(this,"pointerLocked",!1);Ie(this,"enabled",!0);Ie(this,"yaw",0);Ie(this,"pitch",0);Ie(this,"moveSpeed",6);Ie(this,"lookSensitivity",.0025);this.camera=e}setEnabled(e){this.enabled=e,e||(this.keys.clear(),this.moveDir.set(0,0,0))}isEnabled(){return this.enabled}attach(e){const t=f=>{const p=f;return p?!!p.closest("input, textarea, select, [contenteditable='true']"):!1},i=f=>{this.enabled&&(t(f.target)||(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(f.code)&&f.preventDefault(),this.keys.add(f.code)))},s=f=>{t(f.target)||this.keys.delete(f.code)},o=()=>{this.pointerLocked=document.pointerLockElement===e},c=f=>{if(!this.enabled||!this.pointerLocked)return;this.yaw-=f.movementX*this.lookSensitivity,this.pitch-=f.movementY*this.lookSensitivity;const p=Math.PI/2-.01;this.pitch=Math.max(-p,Math.min(p,this.pitch))},u=f=>{this.enabled&&f.button===2&&(f.preventDefault(),document.pointerLockElement!==e&&e.requestPointerLock())},d=f=>{f.preventDefault()};return window.addEventListener("keydown",i),window.addEventListener("keyup",s),e.addEventListener("mousemove",c),e.addEventListener("mousedown",u),e.addEventListener("contextmenu",d),document.addEventListener("pointerlockchange",o),()=>{window.removeEventListener("keydown",i),window.removeEventListener("keyup",s),e.removeEventListener("mousemove",c),e.removeEventListener("mousedown",u),e.removeEventListener("contextmenu",d),document.removeEventListener("pointerlockchange",o),document.pointerLockElement===e&&document.exitPointerLock()}}update(e){if(this.enabled&&(this.camera.rotation.order="YXZ",this.camera.rotation.y=this.yaw,this.camera.rotation.x=this.pitch,this.moveDir.set(0,0,0),this.keys.has("KeyW")&&(this.moveDir.z-=1),this.keys.has("KeyS")&&(this.moveDir.z+=1),this.keys.has("KeyA")&&(this.moveDir.x-=1),this.keys.has("KeyD")&&(this.moveDir.x+=1),this.keys.has("Space")&&(this.moveDir.y+=1),(this.keys.has("ShiftLeft")||this.keys.has("ShiftRight"))&&(this.moveDir.y-=1),this.moveDir.lengthSq()>0)){this.moveDir.normalize();const t=this.moveSpeed*e;this.camera.translateX(this.moveDir.x*t),this.camera.translateY(this.moveDir.y*t),this.camera.translateZ(this.moveDir.z*t)}}captureState(){return{position:this.camera.position.clone(),yaw:this.yaw,pitch:this.pitch}}restoreState(e){this.camera.position.copy(e.position),this.yaw=e.yaw,this.pitch=e.pitch,this.camera.rotation.order="YXZ",this.camera.rotation.y=this.yaw,this.camera.rotation.x=this.pitch}}class j1{static create(e,t){const i=Math.max(.05,t);switch(e){case"box":return new Qt(i,i,i);case"sphere":return new Yc(i*.55,24,16);case"cylinder":return new yn(i*.45,i*.45,i,24);case"plane":return new Oo(i*2,i*2);default:return new Qt(i,i,i)}}}const mr=256;function X1(){const a=document.createElement("canvas");return a.width=mr,a.height=mr,a}function xc(a,e,t){const i=Math.sin(a*12.9898+e*78.233+t*.001)*43758.5453;return i-Math.floor(i)}function Dc(a,e,t){let i=.55,s=3,o=0;for(let c=0;c<4;c+=1){const u=Math.floor(a*s),d=Math.floor(e*s),f=xc(u,d,t+c*17),p=xc(u+1,d,t+c*17),v=xc(u,d+1,t+c*17),m=xc(u+1,d+1,t+c*17),x=a*s-u,S=e*s-d,E=x*x*(3-2*x),y=S*S*(3-2*S),_=f*(1-E)+p*E,w=v*(1-E)+m*E;o+=(_*(1-y)+w*y)*i,i*=.5,s*=2.1}return Math.min(1,Math.max(0,o))}function q1(a,e=1337){const t=X1(),i=t.getContext("2d");if(!i)return t;const s=i.createImageData(mr,mr),o=s.data;for(let c=0;c<mr;c+=1)for(let u=0;u<mr;u+=1){const d=u/mr,f=c/mr,p=Dc(d,f,e);let v=80,m=120,x=60;if(a==="grass")v=40+p*90,m=110+p*80,x=40+p*40;else if(a==="stone"){const E=90+p*70;v=E,m=E*.95,x=E*.9}else if(a==="sand")v=200+p*40,m=170+p*35,x=110+p*25;else if(a==="metal"){const E=120+p*80;v=E,m=E*.97,x=E*1.02}else v=p*255,m=Dc(d+.3,f-.1,e+3)*255,x=Dc(d-.2,f+.4,e+9)*255;const S=(c*mr+u)*4;o[S]=v,o[S+1]=m,o[S+2]=x,o[S+3]=255}return i.putImageData(s,0,0),t}class Y1{constructor(){Ie(this,"textures",new Map);Ie(this,"inflight",new Set);Ie(this,"notify")}setNotifier(e){this.notify=e}has(e){return this.textures.has(e)}get(e){return this.textures.get(e)}ensure(e){if(!e||this.textures.has(e)||this.inflight.has(e))return;this.inflight.add(e),new F1().load(e,i=>{var s;i.wrapS=Is,i.wrapT=Is,i.colorSpace=Bn,this.textures.set(e,i),this.inflight.delete(e),(s=this.notify)==null||s.call(this)},void 0,()=>{this.inflight.delete(e)})}}const kc=new Y1,mv=new Map;function Z1(a,e){const t=e.surface.mapDataUrl?kc.has(e.surface.mapDataUrl):!0;return[a,e.enabled,e.primitive,e.size,e.color,e.surface.mode,e.surface.mapDataUrl,t?"mapReady":"mapPending",e.surface.tilingU,e.surface.tilingV,e.surface.offsetU,e.surface.offsetV,e.surface.rotation,e.surface.proceduralPreset,e.surface.shaderId].join("|")}function Uc(a){return`${a.primitive}:${a.size}`}function gv(a,e,t,i,s){e.surface.mapDataUrl&&kc.ensure(e.surface.mapDataUrl);const o=Z1(a.userData.gameObjectId??"",e),c=!t||t.signature!==o;if(c&&t&&("map"in t.material&&t.material.map&&(t.material.map=null),t.material.dispose()),c)if(e.surface.mode==="shader"){const u=i.createBuiltIn(e.surface.shaderId);a.material=u,t={mesh:a,material:u,signature:o,primitiveKey:Uc(e)}}else if(e.surface.mode==="procedural"){const u=e.surface.proceduralPreset;let d=mv.get(u);if(!d){const p=q1(e.surface.proceduralPreset);d=new I1(p),d.colorSpace=Bn,d.wrapS=Is,d.wrapT=Is,mv.set(u,d)}const f=new af({map:d,color:e.color});vv(f,e),a.material=f,t={mesh:a,material:f,signature:o,primitiveKey:Uc(e)}}else{const u=new af({color:e.color}),d=e.surface.mapDataUrl?kc.get(e.surface.mapDataUrl):void 0;d&&(u.map=d),vv(u,e),a.material=u,t={mesh:a,material:u,signature:o,primitiveKey:Uc(e)}}return t=t,$1(t.material,s,e),t}function vv(a,e){a.map&&(a.map.repeat.set(e.surface.tilingU,e.surface.tilingV),a.map.offset.set(e.surface.offsetU,e.surface.offsetV),a.map.rotation=e.surface.rotation,a.map.needsUpdate=!0)}function $1(a,e,t){var i;a instanceof Ni&&(a.uniforms.uTime&&(a.uniforms.uTime.value=e),a.uniforms.uColor&&(a.uniforms.uColor.value=new at(t.color)),((i=a.uniforms.uBaseColor)==null?void 0:i.value)instanceof at&&a.uniforms.uBaseColor.value.set(t.color))}class Li{constructor(e){e===void 0&&(e=[0,0,0,0,0,0,0,0,0]),this.elements=e}identity(){const e=this.elements;e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1}setZero(){const e=this.elements;e[0]=0,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=0,e[6]=0,e[7]=0,e[8]=0}setTrace(e){const t=this.elements;t[0]=e.x,t[4]=e.y,t[8]=e.z}getTrace(e){e===void 0&&(e=new P);const t=this.elements;return e.x=t[0],e.y=t[4],e.z=t[8],e}vmult(e,t){t===void 0&&(t=new P);const i=this.elements,s=e.x,o=e.y,c=e.z;return t.x=i[0]*s+i[1]*o+i[2]*c,t.y=i[3]*s+i[4]*o+i[5]*c,t.z=i[6]*s+i[7]*o+i[8]*c,t}smult(e){for(let t=0;t<this.elements.length;t++)this.elements[t]*=e}mmult(e,t){t===void 0&&(t=new Li);const i=this.elements,s=e.elements,o=t.elements,c=i[0],u=i[1],d=i[2],f=i[3],p=i[4],v=i[5],m=i[6],x=i[7],S=i[8],E=s[0],y=s[1],_=s[2],w=s[3],A=s[4],T=s[5],U=s[6],N=s[7],D=s[8];return o[0]=c*E+u*w+d*U,o[1]=c*y+u*A+d*N,o[2]=c*_+u*T+d*D,o[3]=f*E+p*w+v*U,o[4]=f*y+p*A+v*N,o[5]=f*_+p*T+v*D,o[6]=m*E+x*w+S*U,o[7]=m*y+x*A+S*N,o[8]=m*_+x*T+S*D,t}scale(e,t){t===void 0&&(t=new Li);const i=this.elements,s=t.elements;for(let o=0;o!==3;o++)s[3*o+0]=e.x*i[3*o+0],s[3*o+1]=e.y*i[3*o+1],s[3*o+2]=e.z*i[3*o+2];return t}solve(e,t){t===void 0&&(t=new P);const i=3,s=4,o=[];let c,u;for(c=0;c<i*s;c++)o.push(0);for(c=0;c<3;c++)for(u=0;u<3;u++)o[c+s*u]=this.elements[c+3*u];o[3]=e.x,o[7]=e.y,o[11]=e.z;let d=3;const f=d;let p;const v=4;let m;do{if(c=f-d,o[c+s*c]===0){for(u=c+1;u<f;u++)if(o[c+s*u]!==0){p=v;do m=v-p,o[m+s*c]+=o[m+s*u];while(--p);break}}if(o[c+s*c]!==0)for(u=c+1;u<f;u++){const x=o[c+s*u]/o[c+s*c];p=v;do m=v-p,o[m+s*u]=m<=c?0:o[m+s*u]-o[m+s*c]*x;while(--p)}}while(--d);if(t.z=o[2*s+3]/o[2*s+2],t.y=(o[1*s+3]-o[1*s+2]*t.z)/o[1*s+1],t.x=(o[0*s+3]-o[0*s+2]*t.z-o[0*s+1]*t.y)/o[0*s+0],isNaN(t.x)||isNaN(t.y)||isNaN(t.z)||t.x===1/0||t.y===1/0||t.z===1/0)throw`Could not solve equation! Got x=[${t.toString()}], b=[${e.toString()}], A=[${this.toString()}]`;return t}e(e,t,i){if(i===void 0)return this.elements[t+3*e];this.elements[t+3*e]=i}copy(e){for(let t=0;t<e.elements.length;t++)this.elements[t]=e.elements[t];return this}toString(){let e="";for(let i=0;i<9;i++)e+=this.elements[i]+",";return e}reverse(e){e===void 0&&(e=new Li);const t=3,i=6,s=K1;let o,c;for(o=0;o<3;o++)for(c=0;c<3;c++)s[o+i*c]=this.elements[o+3*c];s[3]=1,s[9]=0,s[15]=0,s[4]=0,s[10]=1,s[16]=0,s[5]=0,s[11]=0,s[17]=1;let u=3;const d=u;let f;const p=i;let v;do{if(o=d-u,s[o+i*o]===0){for(c=o+1;c<d;c++)if(s[o+i*c]!==0){f=p;do v=p-f,s[v+i*o]+=s[v+i*c];while(--f);break}}if(s[o+i*o]!==0)for(c=o+1;c<d;c++){const m=s[o+i*c]/s[o+i*o];f=p;do v=p-f,s[v+i*c]=v<=o?0:s[v+i*c]-s[v+i*o]*m;while(--f)}}while(--u);o=2;do{c=o-1;do{const m=s[o+i*c]/s[o+i*o];f=i;do v=i-f,s[v+i*c]=s[v+i*c]-s[v+i*o]*m;while(--f)}while(c--)}while(--o);o=2;do{const m=1/s[o+i*o];f=i;do v=i-f,s[v+i*o]=s[v+i*o]*m;while(--f)}while(o--);o=2;do{c=2;do{if(v=s[t+c+i*o],isNaN(v)||v===1/0)throw`Could not reverse! A=[${this.toString()}]`;e.e(o,c,v)}while(c--)}while(o--);return e}setRotationFromQuaternion(e){const t=e.x,i=e.y,s=e.z,o=e.w,c=t+t,u=i+i,d=s+s,f=t*c,p=t*u,v=t*d,m=i*u,x=i*d,S=s*d,E=o*c,y=o*u,_=o*d,w=this.elements;return w[0]=1-(m+S),w[1]=p-_,w[2]=v+y,w[3]=p+_,w[4]=1-(f+S),w[5]=x-E,w[6]=v-y,w[7]=x+E,w[8]=1-(f+m),this}transpose(e){e===void 0&&(e=new Li);const t=this.elements,i=e.elements;let s;return i[0]=t[0],i[4]=t[4],i[8]=t[8],s=t[1],i[1]=t[3],i[3]=s,s=t[2],i[2]=t[6],i[6]=s,s=t[5],i[5]=t[7],i[7]=s,e}}const K1=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];class P{constructor(e,t,i){e===void 0&&(e=0),t===void 0&&(t=0),i===void 0&&(i=0),this.x=e,this.y=t,this.z=i}cross(e,t){t===void 0&&(t=new P);const i=e.x,s=e.y,o=e.z,c=this.x,u=this.y,d=this.z;return t.x=u*o-d*s,t.y=d*i-c*o,t.z=c*s-u*i,t}set(e,t,i){return this.x=e,this.y=t,this.z=i,this}setZero(){this.x=this.y=this.z=0}vadd(e,t){if(t)t.x=e.x+this.x,t.y=e.y+this.y,t.z=e.z+this.z;else return new P(this.x+e.x,this.y+e.y,this.z+e.z)}vsub(e,t){if(t)t.x=this.x-e.x,t.y=this.y-e.y,t.z=this.z-e.z;else return new P(this.x-e.x,this.y-e.y,this.z-e.z)}crossmat(){return new Li([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){const e=this.x,t=this.y,i=this.z,s=Math.sqrt(e*e+t*t+i*i);if(s>0){const o=1/s;this.x*=o,this.y*=o,this.z*=o}else this.x=0,this.y=0,this.z=0;return s}unit(e){e===void 0&&(e=new P);const t=this.x,i=this.y,s=this.z;let o=Math.sqrt(t*t+i*i+s*s);return o>0?(o=1/o,e.x=t*o,e.y=i*o,e.z=s*o):(e.x=1,e.y=0,e.z=0),e}length(){const e=this.x,t=this.y,i=this.z;return Math.sqrt(e*e+t*t+i*i)}lengthSquared(){return this.dot(this)}distanceTo(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z;return Math.sqrt((o-t)*(o-t)+(c-i)*(c-i)+(u-s)*(u-s))}distanceSquared(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z;return(o-t)*(o-t)+(c-i)*(c-i)+(u-s)*(u-s)}scale(e,t){t===void 0&&(t=new P);const i=this.x,s=this.y,o=this.z;return t.x=e*i,t.y=e*s,t.z=e*o,t}vmul(e,t){return t===void 0&&(t=new P),t.x=e.x*this.x,t.y=e.y*this.y,t.z=e.z*this.z,t}addScaledVector(e,t,i){return i===void 0&&(i=new P),i.x=this.x+e*t.x,i.y=this.y+e*t.y,i.z=this.z+e*t.z,i}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(e){return e===void 0&&(e=new P),e.x=-this.x,e.y=-this.y,e.z=-this.z,e}tangents(e,t){const i=this.length();if(i>0){const s=Q1,o=1/i;s.set(this.x*o,this.y*o,this.z*o);const c=J1;Math.abs(s.x)<.9?(c.set(1,0,0),s.cross(c,e)):(c.set(0,1,0),s.cross(c,e)),s.cross(e,t)}else e.set(1,0,0),t.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}lerp(e,t,i){const s=this.x,o=this.y,c=this.z;i.x=s+(e.x-s)*t,i.y=o+(e.y-o)*t,i.z=c+(e.z-c)*t}almostEquals(e,t){return t===void 0&&(t=1e-6),!(Math.abs(this.x-e.x)>t||Math.abs(this.y-e.y)>t||Math.abs(this.z-e.z)>t)}almostZero(e){return e===void 0&&(e=1e-6),!(Math.abs(this.x)>e||Math.abs(this.y)>e||Math.abs(this.z)>e)}isAntiparallelTo(e,t){return this.negate(_v),_v.almostEquals(e,t)}clone(){return new P(this.x,this.y,this.z)}}P.ZERO=new P(0,0,0);P.UNIT_X=new P(1,0,0);P.UNIT_Y=new P(0,1,0);P.UNIT_Z=new P(0,0,1);const Q1=new P,J1=new P,_v=new P;class oi{constructor(e){e===void 0&&(e={}),this.lowerBound=new P,this.upperBound=new P,e.lowerBound&&this.lowerBound.copy(e.lowerBound),e.upperBound&&this.upperBound.copy(e.upperBound)}setFromPoints(e,t,i,s){const o=this.lowerBound,c=this.upperBound,u=i;o.copy(e[0]),u&&u.vmult(o,o),c.copy(o);for(let d=1;d<e.length;d++){let f=e[d];u&&(u.vmult(f,xv),f=xv),f.x>c.x&&(c.x=f.x),f.x<o.x&&(o.x=f.x),f.y>c.y&&(c.y=f.y),f.y<o.y&&(o.y=f.y),f.z>c.z&&(c.z=f.z),f.z<o.z&&(o.z=f.z)}return t&&(t.vadd(o,o),t.vadd(c,c)),s&&(o.x-=s,o.y-=s,o.z-=s,c.x+=s,c.y+=s,c.z+=s),this}copy(e){return this.lowerBound.copy(e.lowerBound),this.upperBound.copy(e.upperBound),this}clone(){return new oi().copy(this)}extend(e){this.lowerBound.x=Math.min(this.lowerBound.x,e.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,e.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,e.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,e.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,e.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,e.upperBound.z)}overlaps(e){const t=this.lowerBound,i=this.upperBound,s=e.lowerBound,o=e.upperBound,c=s.x<=i.x&&i.x<=o.x||t.x<=o.x&&o.x<=i.x,u=s.y<=i.y&&i.y<=o.y||t.y<=o.y&&o.y<=i.y,d=s.z<=i.z&&i.z<=o.z||t.z<=o.z&&o.z<=i.z;return c&&u&&d}volume(){const e=this.lowerBound,t=this.upperBound;return(t.x-e.x)*(t.y-e.y)*(t.z-e.z)}contains(e){const t=this.lowerBound,i=this.upperBound,s=e.lowerBound,o=e.upperBound;return t.x<=s.x&&i.x>=o.x&&t.y<=s.y&&i.y>=o.y&&t.z<=s.z&&i.z>=o.z}getCorners(e,t,i,s,o,c,u,d){const f=this.lowerBound,p=this.upperBound;e.copy(f),t.set(p.x,f.y,f.z),i.set(p.x,p.y,f.z),s.set(f.x,p.y,p.z),o.set(p.x,f.y,p.z),c.set(f.x,p.y,f.z),u.set(f.x,f.y,p.z),d.copy(p)}toLocalFrame(e,t){const i=yv,s=i[0],o=i[1],c=i[2],u=i[3],d=i[4],f=i[5],p=i[6],v=i[7];this.getCorners(s,o,c,u,d,f,p,v);for(let m=0;m!==8;m++){const x=i[m];e.pointToLocal(x,x)}return t.setFromPoints(i)}toWorldFrame(e,t){const i=yv,s=i[0],o=i[1],c=i[2],u=i[3],d=i[4],f=i[5],p=i[6],v=i[7];this.getCorners(s,o,c,u,d,f,p,v);for(let m=0;m!==8;m++){const x=i[m];e.pointToWorld(x,x)}return t.setFromPoints(i)}overlapsRay(e){const{direction:t,from:i}=e,s=1/t.x,o=1/t.y,c=1/t.z,u=(this.lowerBound.x-i.x)*s,d=(this.upperBound.x-i.x)*s,f=(this.lowerBound.y-i.y)*o,p=(this.upperBound.y-i.y)*o,v=(this.lowerBound.z-i.z)*c,m=(this.upperBound.z-i.z)*c,x=Math.max(Math.max(Math.min(u,d),Math.min(f,p)),Math.min(v,m)),S=Math.min(Math.min(Math.max(u,d),Math.max(f,p)),Math.max(v,m));return!(S<0||x>S)}}const xv=new P,yv=[new P,new P,new P,new P,new P,new P,new P,new P];class Sv{constructor(){this.matrix=[]}get(e,t){let{index:i}=e,{index:s}=t;if(s>i){const o=s;s=i,i=o}return this.matrix[(i*(i+1)>>1)+s-1]}set(e,t,i){let{index:s}=e,{index:o}=t;if(o>s){const c=o;o=s,s=c}this.matrix[(s*(s+1)>>1)+o-1]=i?1:0}reset(){for(let e=0,t=this.matrix.length;e!==t;e++)this.matrix[e]=0}setNumObjects(e){this.matrix.length=e*(e-1)>>1}}class R0{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;return i[e]===void 0&&(i[e]=[]),i[e].includes(t)||i[e].push(t),this}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return!!(i[e]!==void 0&&i[e].includes(t))}hasAnyEventListener(e){return this._listeners===void 0?!1:this._listeners[e]!==void 0}removeEventListener(e,t){if(this._listeners===void 0)return this;const i=this._listeners;if(i[e]===void 0)return this;const s=i[e].indexOf(t);return s!==-1&&i[e].splice(s,1),this}dispatchEvent(e){if(this._listeners===void 0)return this;const i=this._listeners[e.type];if(i!==void 0){e.target=this;for(let s=0,o=i.length;s<o;s++)i[s].call(this,e)}return this}}class sn{constructor(e,t,i,s){e===void 0&&(e=0),t===void 0&&(t=0),i===void 0&&(i=0),s===void 0&&(s=1),this.x=e,this.y=t,this.z=i,this.w=s}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(e,t){const i=Math.sin(t*.5);return this.x=e.x*i,this.y=e.y*i,this.z=e.z*i,this.w=Math.cos(t*.5),this}toAxisAngle(e){e===void 0&&(e=new P),this.normalize();const t=2*Math.acos(this.w),i=Math.sqrt(1-this.w*this.w);return i<.001?(e.x=this.x,e.y=this.y,e.z=this.z):(e.x=this.x/i,e.y=this.y/i,e.z=this.z/i),[e,t]}setFromVectors(e,t){if(e.isAntiparallelTo(t)){const i=eT,s=tT;e.tangents(i,s),this.setFromAxisAngle(i,Math.PI)}else{const i=e.cross(t);this.x=i.x,this.y=i.y,this.z=i.z,this.w=Math.sqrt(e.length()**2*t.length()**2)+e.dot(t),this.normalize()}return this}mult(e,t){t===void 0&&(t=new sn);const i=this.x,s=this.y,o=this.z,c=this.w,u=e.x,d=e.y,f=e.z,p=e.w;return t.x=i*p+c*u+s*f-o*d,t.y=s*p+c*d+o*u-i*f,t.z=o*p+c*f+i*d-s*u,t.w=c*p-i*u-s*d-o*f,t}inverse(e){e===void 0&&(e=new sn);const t=this.x,i=this.y,s=this.z,o=this.w;this.conjugate(e);const c=1/(t*t+i*i+s*s+o*o);return e.x*=c,e.y*=c,e.z*=c,e.w*=c,e}conjugate(e){return e===void 0&&(e=new sn),e.x=-this.x,e.y=-this.y,e.z=-this.z,e.w=this.w,e}normalize(){let e=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(e=1/e,this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}normalizeFast(){const e=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}vmult(e,t){t===void 0&&(t=new P);const i=e.x,s=e.y,o=e.z,c=this.x,u=this.y,d=this.z,f=this.w,p=f*i+u*o-d*s,v=f*s+d*i-c*o,m=f*o+c*s-u*i,x=-c*i-u*s-d*o;return t.x=p*f+x*-c+v*-d-m*-u,t.y=v*f+x*-u+m*-c-p*-d,t.z=m*f+x*-d+p*-u-v*-c,t}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w,this}toEuler(e,t){t===void 0&&(t="YZX");let i,s,o;const c=this.x,u=this.y,d=this.z,f=this.w;switch(t){case"YZX":const p=c*u+d*f;if(p>.499&&(i=2*Math.atan2(c,f),s=Math.PI/2,o=0),p<-.499&&(i=-2*Math.atan2(c,f),s=-Math.PI/2,o=0),i===void 0){const v=c*c,m=u*u,x=d*d;i=Math.atan2(2*u*f-2*c*d,1-2*m-2*x),s=Math.asin(2*p),o=Math.atan2(2*c*f-2*u*d,1-2*v-2*x)}break;default:throw new Error(`Euler order ${t} not supported yet.`)}e.y=i,e.z=s,e.x=o}setFromEuler(e,t,i,s){s===void 0&&(s="XYZ");const o=Math.cos(e/2),c=Math.cos(t/2),u=Math.cos(i/2),d=Math.sin(e/2),f=Math.sin(t/2),p=Math.sin(i/2);return s==="XYZ"?(this.x=d*c*u+o*f*p,this.y=o*f*u-d*c*p,this.z=o*c*p+d*f*u,this.w=o*c*u-d*f*p):s==="YXZ"?(this.x=d*c*u+o*f*p,this.y=o*f*u-d*c*p,this.z=o*c*p-d*f*u,this.w=o*c*u+d*f*p):s==="ZXY"?(this.x=d*c*u-o*f*p,this.y=o*f*u+d*c*p,this.z=o*c*p+d*f*u,this.w=o*c*u-d*f*p):s==="ZYX"?(this.x=d*c*u-o*f*p,this.y=o*f*u+d*c*p,this.z=o*c*p-d*f*u,this.w=o*c*u+d*f*p):s==="YZX"?(this.x=d*c*u+o*f*p,this.y=o*f*u+d*c*p,this.z=o*c*p-d*f*u,this.w=o*c*u-d*f*p):s==="XZY"&&(this.x=d*c*u-o*f*p,this.y=o*f*u-d*c*p,this.z=o*c*p+d*f*u,this.w=o*c*u+d*f*p),this}clone(){return new sn(this.x,this.y,this.z,this.w)}slerp(e,t,i){i===void 0&&(i=new sn);const s=this.x,o=this.y,c=this.z,u=this.w;let d=e.x,f=e.y,p=e.z,v=e.w,m,x,S,E,y;return x=s*d+o*f+c*p+u*v,x<0&&(x=-x,d=-d,f=-f,p=-p,v=-v),1-x>1e-6?(m=Math.acos(x),S=Math.sin(m),E=Math.sin((1-t)*m)/S,y=Math.sin(t*m)/S):(E=1-t,y=t),i.x=E*s+y*d,i.y=E*o+y*f,i.z=E*c+y*p,i.w=E*u+y*v,i}integrate(e,t,i,s){s===void 0&&(s=new sn);const o=e.x*i.x,c=e.y*i.y,u=e.z*i.z,d=this.x,f=this.y,p=this.z,v=this.w,m=t*.5;return s.x+=m*(o*v+c*p-u*f),s.y+=m*(c*v+u*d-o*p),s.z+=m*(u*v+o*f-c*d),s.w+=m*(-o*d-c*f-u*p),s}}const eT=new P,tT=new P,nT={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256};class Xe{constructor(e){e===void 0&&(e={}),this.id=Xe.idCounter++,this.type=e.type||0,this.boundingSphereRadius=0,this.collisionResponse=e.collisionResponse?e.collisionResponse:!0,this.collisionFilterGroup=e.collisionFilterGroup!==void 0?e.collisionFilterGroup:1,this.collisionFilterMask=e.collisionFilterMask!==void 0?e.collisionFilterMask:-1,this.material=e.material?e.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(e,t){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(e,t,i,s){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}}Xe.idCounter=0;Xe.types=nT;let Ft=class cf{constructor(e){e===void 0&&(e={}),this.position=new P,this.quaternion=new sn,e.position&&this.position.copy(e.position),e.quaternion&&this.quaternion.copy(e.quaternion)}pointToLocal(e,t){return cf.pointToLocalFrame(this.position,this.quaternion,e,t)}pointToWorld(e,t){return cf.pointToWorldFrame(this.position,this.quaternion,e,t)}vectorToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t}static pointToLocalFrame(e,t,i,s){return s===void 0&&(s=new P),i.vsub(e,s),t.conjugate(Mv),Mv.vmult(s,s),s}static pointToWorldFrame(e,t,i,s){return s===void 0&&(s=new P),t.vmult(i,s),s.vadd(e,s),s}static vectorToWorldFrame(e,t,i){return i===void 0&&(i=new P),e.vmult(t,i),i}static vectorToLocalFrame(e,t,i,s){return s===void 0&&(s=new P),t.w*=-1,t.vmult(i,s),t.w*=-1,s}};const Mv=new sn;class Fa extends Xe{constructor(e){e===void 0&&(e={});const{vertices:t=[],faces:i=[],normals:s=[],axes:o,boundingSphereRadius:c}=e;super({type:Xe.types.CONVEXPOLYHEDRON}),this.vertices=t,this.faces=i,this.faceNormals=s,this.faceNormals.length===0&&this.computeNormals(),c?this.boundingSphereRadius=c:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=o?o.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){const e=this.faces,t=this.vertices,i=this.uniqueEdges;i.length=0;const s=new P;for(let o=0;o!==e.length;o++){const c=e[o],u=c.length;for(let d=0;d!==u;d++){const f=(d+1)%u;t[c[d]].vsub(t[c[f]],s),s.normalize();let p=!1;for(let v=0;v!==i.length;v++)if(i[v].almostEquals(s)||i[v].almostEquals(s)){p=!0;break}p||i.push(s.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let e=0;e<this.faces.length;e++){for(let s=0;s<this.faces[e].length;s++)if(!this.vertices[this.faces[e][s]])throw new Error(`Vertex ${this.faces[e][s]} not found!`);const t=this.faceNormals[e]||new P;this.getFaceNormal(e,t),t.negate(t),this.faceNormals[e]=t;const i=this.vertices[this.faces[e][0]];if(t.dot(i)<0){console.error(`.faceNormals[${e}] = Vec3(${t.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let s=0;s<this.faces[e].length;s++)console.warn(`.vertices[${this.faces[e][s]}] = Vec3(${this.vertices[this.faces[e][s]].toString()})`)}}}getFaceNormal(e,t){const i=this.faces[e],s=this.vertices[i[0]],o=this.vertices[i[1]],c=this.vertices[i[2]];Fa.computeNormal(s,o,c,t)}static computeNormal(e,t,i,s){const o=new P,c=new P;t.vsub(e,c),i.vsub(t,o),o.cross(c,s),s.isZero()||s.normalize()}clipAgainstHull(e,t,i,s,o,c,u,d,f){const p=new P;let v=-1,m=-Number.MAX_VALUE;for(let S=0;S<i.faces.length;S++){p.copy(i.faceNormals[S]),o.vmult(p,p);const E=p.dot(c);E>m&&(m=E,v=S)}const x=[];for(let S=0;S<i.faces[v].length;S++){const E=i.vertices[i.faces[v][S]],y=new P;y.copy(E),o.vmult(y,y),s.vadd(y,y),x.push(y)}v>=0&&this.clipFaceAgainstHull(c,e,t,x,u,d,f)}findSeparatingAxis(e,t,i,s,o,c,u,d){const f=new P,p=new P,v=new P,m=new P,x=new P,S=new P;let E=Number.MAX_VALUE;const y=this;if(y.uniqueAxes)for(let _=0;_!==y.uniqueAxes.length;_++){i.vmult(y.uniqueAxes[_],f);const w=y.testSepAxis(f,e,t,i,s,o);if(w===!1)return!1;w<E&&(E=w,c.copy(f))}else{const _=u?u.length:y.faces.length;for(let w=0;w<_;w++){const A=u?u[w]:w;f.copy(y.faceNormals[A]),i.vmult(f,f);const T=y.testSepAxis(f,e,t,i,s,o);if(T===!1)return!1;T<E&&(E=T,c.copy(f))}}if(e.uniqueAxes)for(let _=0;_!==e.uniqueAxes.length;_++){o.vmult(e.uniqueAxes[_],p);const w=y.testSepAxis(p,e,t,i,s,o);if(w===!1)return!1;w<E&&(E=w,c.copy(p))}else{const _=d?d.length:e.faces.length;for(let w=0;w<_;w++){const A=d?d[w]:w;p.copy(e.faceNormals[A]),o.vmult(p,p);const T=y.testSepAxis(p,e,t,i,s,o);if(T===!1)return!1;T<E&&(E=T,c.copy(p))}}for(let _=0;_!==y.uniqueEdges.length;_++){i.vmult(y.uniqueEdges[_],m);for(let w=0;w!==e.uniqueEdges.length;w++)if(o.vmult(e.uniqueEdges[w],x),m.cross(x,S),!S.almostZero()){S.normalize();const A=y.testSepAxis(S,e,t,i,s,o);if(A===!1)return!1;A<E&&(E=A,c.copy(S))}}return s.vsub(t,v),v.dot(c)>0&&c.negate(c),!0}testSepAxis(e,t,i,s,o,c){const u=this;Fa.project(u,e,i,s,dd),Fa.project(t,e,o,c,fd);const d=dd[0],f=dd[1],p=fd[0],v=fd[1];if(d<v||p<f)return!1;const m=d-v,x=p-f;return m<x?m:x}calculateLocalInertia(e,t){const i=new P,s=new P;this.computeLocalAABB(s,i);const o=i.x-s.x,c=i.y-s.y,u=i.z-s.z;t.x=1/12*e*(2*c*2*c+2*u*2*u),t.y=1/12*e*(2*o*2*o+2*u*2*u),t.z=1/12*e*(2*c*2*c+2*o*2*o)}getPlaneConstantOfFace(e){const t=this.faces[e],i=this.faceNormals[e],s=this.vertices[t[0]];return-i.dot(s)}clipFaceAgainstHull(e,t,i,s,o,c,u){const d=new P,f=new P,p=new P,v=new P,m=new P,x=new P,S=new P,E=new P,y=this,_=[],w=s,A=_;let T=-1,U=Number.MAX_VALUE;for(let C=0;C<y.faces.length;C++){d.copy(y.faceNormals[C]),i.vmult(d,d);const B=d.dot(e);B<U&&(U=B,T=C)}if(T<0)return;const N=y.faces[T];N.connectedFaces=[];for(let C=0;C<y.faces.length;C++)for(let B=0;B<y.faces[C].length;B++)N.indexOf(y.faces[C][B])!==-1&&C!==T&&N.connectedFaces.indexOf(C)===-1&&N.connectedFaces.push(C);const D=N.length;for(let C=0;C<D;C++){const B=y.vertices[N[C]],O=y.vertices[N[(C+1)%D]];B.vsub(O,f),p.copy(f),i.vmult(p,p),t.vadd(p,p),v.copy(this.faceNormals[T]),i.vmult(v,v),t.vadd(v,v),p.cross(v,m),m.negate(m),x.copy(B),i.vmult(x,x),t.vadd(x,x);const k=N.connectedFaces[C];S.copy(this.faceNormals[k]);const j=this.getPlaneConstantOfFace(k);E.copy(S),i.vmult(E,E);const X=j-E.dot(t);for(this.clipFaceAgainstPlane(w,A,E,X);w.length;)w.shift();for(;A.length;)w.push(A.shift())}S.copy(this.faceNormals[T]);const z=this.getPlaneConstantOfFace(T);E.copy(S),i.vmult(E,E);const b=z-E.dot(t);for(let C=0;C<w.length;C++){let B=E.dot(w[C])+b;if(B<=o&&(console.log(`clamped: depth=${B} to minDist=${o}`),B=o),B<=c){const O=w[C];if(B<=1e-6){const k={point:O,normal:E,depth:B};u.push(k)}}}}clipFaceAgainstPlane(e,t,i,s){let o,c;const u=e.length;if(u<2)return t;let d=e[e.length-1],f=e[0];o=i.dot(d)+s;for(let p=0;p<u;p++){if(f=e[p],c=i.dot(f)+s,o<0)if(c<0){const v=new P;v.copy(f),t.push(v)}else{const v=new P;d.lerp(f,o/(o-c),v),t.push(v)}else if(c<0){const v=new P;d.lerp(f,o/(o-c),v),t.push(v),t.push(f)}d=f,o=c}return t}computeWorldVertices(e,t){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new P);const i=this.vertices,s=this.worldVertices;for(let o=0;o!==this.vertices.length;o++)t.vmult(i[o],s[o]),e.vadd(s[o],s[o]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(e,t){const i=this.vertices;e.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),t.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let s=0;s<this.vertices.length;s++){const o=i[s];o.x<e.x?e.x=o.x:o.x>t.x&&(t.x=o.x),o.y<e.y?e.y=o.y:o.y>t.y&&(t.y=o.y),o.z<e.z?e.z=o.z:o.z>t.z&&(t.z=o.z)}}computeWorldFaceNormals(e){const t=this.faceNormals.length;for(;this.worldFaceNormals.length<t;)this.worldFaceNormals.push(new P);const i=this.faceNormals,s=this.worldFaceNormals;for(let o=0;o!==t;o++)e.vmult(i[o],s[o]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let e=0;const t=this.vertices;for(let i=0;i!==t.length;i++){const s=t[i].lengthSquared();s>e&&(e=s)}this.boundingSphereRadius=Math.sqrt(e)}calculateWorldAABB(e,t,i,s){const o=this.vertices;let c,u,d,f,p,v,m=new P;for(let x=0;x<o.length;x++){m.copy(o[x]),t.vmult(m,m),e.vadd(m,m);const S=m;(c===void 0||S.x<c)&&(c=S.x),(f===void 0||S.x>f)&&(f=S.x),(u===void 0||S.y<u)&&(u=S.y),(p===void 0||S.y>p)&&(p=S.y),(d===void 0||S.z<d)&&(d=S.z),(v===void 0||S.z>v)&&(v=S.z)}i.set(c,u,d),s.set(f,p,v)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(e){e===void 0&&(e=new P);const t=this.vertices;for(let i=0;i<t.length;i++)e.vadd(t[i],e);return e.scale(1/t.length,e),e}transformAllPoints(e,t){const i=this.vertices.length,s=this.vertices;if(t){for(let o=0;o<i;o++){const c=s[o];t.vmult(c,c)}for(let o=0;o<this.faceNormals.length;o++){const c=this.faceNormals[o];t.vmult(c,c)}}if(e)for(let o=0;o<i;o++){const c=s[o];c.vadd(e,c)}}pointIsInside(e){const t=this.vertices,i=this.faces,s=this.faceNormals,o=new P;this.getAveragePointLocal(o);for(let c=0;c<this.faces.length;c++){let u=s[c];const d=t[i[c][0]],f=new P;e.vsub(d,f);const p=u.dot(f),v=new P;o.vsub(d,v);const m=u.dot(v);if(p<0&&m>0||p>0&&m<0)return!1}return-1}static project(e,t,i,s,o){const c=e.vertices.length,u=iT;let d=0,f=0;const p=rT,v=e.vertices;p.setZero(),Ft.vectorToLocalFrame(i,s,t,u),Ft.pointToLocalFrame(i,s,p,p);const m=p.dot(u);f=d=v[0].dot(u);for(let x=1;x<c;x++){const S=v[x].dot(u);S>d&&(d=S),S<f&&(f=S)}if(f-=m,d-=m,f>d){const x=f;f=d,d=x}o[0]=d,o[1]=f}}const dd=[],fd=[];new P;const iT=new P,rT=new P;class Ba extends Xe{constructor(e){super({type:Xe.types.BOX}),this.halfExtents=e,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){const e=this.halfExtents.x,t=this.halfExtents.y,i=this.halfExtents.z,s=P,o=[new s(-e,-t,-i),new s(e,-t,-i),new s(e,t,-i),new s(-e,t,-i),new s(-e,-t,i),new s(e,-t,i),new s(e,t,i),new s(-e,t,i)],c=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],u=[new s(0,0,1),new s(0,1,0),new s(1,0,0)],d=new Fa({vertices:o,faces:c,axes:u});this.convexPolyhedronRepresentation=d,d.material=this.material}calculateLocalInertia(e,t){return t===void 0&&(t=new P),Ba.calculateInertia(this.halfExtents,e,t),t}static calculateInertia(e,t,i){const s=e;i.x=1/12*t*(2*s.y*2*s.y+2*s.z*2*s.z),i.y=1/12*t*(2*s.x*2*s.x+2*s.z*2*s.z),i.z=1/12*t*(2*s.y*2*s.y+2*s.x*2*s.x)}getSideNormals(e,t){const i=e,s=this.halfExtents;if(i[0].set(s.x,0,0),i[1].set(0,s.y,0),i[2].set(0,0,s.z),i[3].set(-s.x,0,0),i[4].set(0,-s.y,0),i[5].set(0,0,-s.z),t!==void 0)for(let o=0;o!==i.length;o++)t.vmult(i[o],i[o]);return i}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(e,t,i){const s=this.halfExtents,o=[[s.x,s.y,s.z],[-s.x,s.y,s.z],[-s.x,-s.y,s.z],[-s.x,-s.y,-s.z],[s.x,-s.y,-s.z],[s.x,s.y,-s.z],[-s.x,s.y,-s.z],[s.x,-s.y,s.z]];for(let c=0;c<o.length;c++)qr.set(o[c][0],o[c][1],o[c][2]),t.vmult(qr,qr),e.vadd(qr,qr),i(qr.x,qr.y,qr.z)}calculateWorldAABB(e,t,i,s){const o=this.halfExtents;ki[0].set(o.x,o.y,o.z),ki[1].set(-o.x,o.y,o.z),ki[2].set(-o.x,-o.y,o.z),ki[3].set(-o.x,-o.y,-o.z),ki[4].set(o.x,-o.y,-o.z),ki[5].set(o.x,o.y,-o.z),ki[6].set(-o.x,o.y,-o.z),ki[7].set(o.x,-o.y,o.z);const c=ki[0];t.vmult(c,c),e.vadd(c,c),s.copy(c),i.copy(c);for(let u=1;u<8;u++){const d=ki[u];t.vmult(d,d),e.vadd(d,d);const f=d.x,p=d.y,v=d.z;f>s.x&&(s.x=f),p>s.y&&(s.y=p),v>s.z&&(s.z=v),f<i.x&&(i.x=f),p<i.y&&(i.y=p),v<i.z&&(i.z=v)}}}const qr=new P,ki=[new P,new P,new P,new P,new P,new P,new P,new P],Af={DYNAMIC:1,STATIC:2,KINEMATIC:4},Cf={AWAKE:0,SLEEPY:1,SLEEPING:2};class Ge extends R0{constructor(e){e===void 0&&(e={}),super(),this.id=Ge.idCounter++,this.index=-1,this.world=null,this.vlambda=new P,this.collisionFilterGroup=typeof e.collisionFilterGroup=="number"?e.collisionFilterGroup:1,this.collisionFilterMask=typeof e.collisionFilterMask=="number"?e.collisionFilterMask:-1,this.collisionResponse=typeof e.collisionResponse=="boolean"?e.collisionResponse:!0,this.position=new P,this.previousPosition=new P,this.interpolatedPosition=new P,this.initPosition=new P,e.position&&(this.position.copy(e.position),this.previousPosition.copy(e.position),this.interpolatedPosition.copy(e.position),this.initPosition.copy(e.position)),this.velocity=new P,e.velocity&&this.velocity.copy(e.velocity),this.initVelocity=new P,this.force=new P;const t=typeof e.mass=="number"?e.mass:0;this.mass=t,this.invMass=t>0?1/t:0,this.material=e.material||null,this.linearDamping=typeof e.linearDamping=="number"?e.linearDamping:.01,this.type=t<=0?Ge.STATIC:Ge.DYNAMIC,typeof e.type==typeof Ge.STATIC&&(this.type=e.type),this.allowSleep=typeof e.allowSleep<"u"?e.allowSleep:!0,this.sleepState=Ge.AWAKE,this.sleepSpeedLimit=typeof e.sleepSpeedLimit<"u"?e.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof e.sleepTimeLimit<"u"?e.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new P,this.quaternion=new sn,this.initQuaternion=new sn,this.previousQuaternion=new sn,this.interpolatedQuaternion=new sn,e.quaternion&&(this.quaternion.copy(e.quaternion),this.initQuaternion.copy(e.quaternion),this.previousQuaternion.copy(e.quaternion),this.interpolatedQuaternion.copy(e.quaternion)),this.angularVelocity=new P,e.angularVelocity&&this.angularVelocity.copy(e.angularVelocity),this.initAngularVelocity=new P,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new P,this.invInertia=new P,this.invInertiaWorld=new Li,this.invMassSolve=0,this.invInertiaSolve=new P,this.invInertiaWorldSolve=new Li,this.fixedRotation=typeof e.fixedRotation<"u"?e.fixedRotation:!1,this.angularDamping=typeof e.angularDamping<"u"?e.angularDamping:.01,this.linearFactor=new P(1,1,1),e.linearFactor&&this.linearFactor.copy(e.linearFactor),this.angularFactor=new P(1,1,1),e.angularFactor&&this.angularFactor.copy(e.angularFactor),this.aabb=new oi,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new P,this.isTrigger=!!e.isTrigger,e.shape&&this.addShape(e.shape),this.updateMassProperties()}wakeUp(){const e=this.sleepState;this.sleepState=Ge.AWAKE,this.wakeUpAfterNarrowphase=!1,e===Ge.SLEEPING&&this.dispatchEvent(Ge.wakeupEvent)}sleep(){this.sleepState=Ge.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(e){if(this.allowSleep){const t=this.sleepState,i=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),s=this.sleepSpeedLimit**2;t===Ge.AWAKE&&i<s?(this.sleepState=Ge.SLEEPY,this.timeLastSleepy=e,this.dispatchEvent(Ge.sleepyEvent)):t===Ge.SLEEPY&&i>s?this.wakeUp():t===Ge.SLEEPY&&e-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(Ge.sleepEvent))}}updateSolveMassProperties(){this.sleepState===Ge.SLEEPING||this.type===Ge.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(e,t){return t===void 0&&(t=new P),e.vsub(this.position,t),this.quaternion.conjugate().vmult(t,t),t}vectorToLocalFrame(e,t){return t===void 0&&(t=new P),this.quaternion.conjugate().vmult(e,t),t}pointToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t.vadd(this.position,t),t}vectorToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t}addShape(e,t,i){const s=new P,o=new sn;return t&&s.copy(t),i&&o.copy(i),this.shapes.push(e),this.shapeOffsets.push(s),this.shapeOrientations.push(o),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=this,this}removeShape(e){const t=this.shapes.indexOf(e);return t===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(t,1),this.shapeOffsets.splice(t,1),this.shapeOrientations.splice(t,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=null,this)}updateBoundingRadius(){const e=this.shapes,t=this.shapeOffsets,i=e.length;let s=0;for(let o=0;o!==i;o++){const c=e[o];c.updateBoundingSphereRadius();const u=t[o].length(),d=c.boundingSphereRadius;u+d>s&&(s=u+d)}this.boundingRadius=s}updateAABB(){const e=this.shapes,t=this.shapeOffsets,i=this.shapeOrientations,s=e.length,o=sT,c=oT,u=this.quaternion,d=this.aabb,f=aT;for(let p=0;p!==s;p++){const v=e[p];u.vmult(t[p],o),o.vadd(this.position,o),u.mult(i[p],c),v.calculateWorldAABB(o,c,f.lowerBound,f.upperBound),p===0?d.copy(f):d.extend(f)}this.aabbNeedsUpdate=!1}updateInertiaWorld(e){const t=this.invInertia;if(!(t.x===t.y&&t.y===t.z&&!e)){const i=lT,s=cT;i.setRotationFromQuaternion(this.quaternion),i.transpose(s),i.scale(t,i),i.mmult(s,this.invInertiaWorld)}}applyForce(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;this.sleepState===Ge.SLEEPING&&this.wakeUp();const i=uT;t.cross(e,i),this.force.vadd(e,this.force),this.torque.vadd(i,this.torque)}applyLocalForce(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;const i=hT,s=dT;this.vectorToWorldFrame(e,i),this.vectorToWorldFrame(t,s),this.applyForce(i,s)}applyTorque(e){this.type===Ge.DYNAMIC&&(this.sleepState===Ge.SLEEPING&&this.wakeUp(),this.torque.vadd(e,this.torque))}applyImpulse(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;this.sleepState===Ge.SLEEPING&&this.wakeUp();const i=t,s=fT;s.copy(e),s.scale(this.invMass,s),this.velocity.vadd(s,this.velocity);const o=pT;i.cross(e,o),this.invInertiaWorld.vmult(o,o),this.angularVelocity.vadd(o,this.angularVelocity)}applyLocalImpulse(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;const i=mT,s=gT;this.vectorToWorldFrame(e,i),this.vectorToWorldFrame(t,s),this.applyImpulse(i,s)}updateMassProperties(){const e=vT;this.invMass=this.mass>0?1/this.mass:0;const t=this.inertia,i=this.fixedRotation;this.updateAABB(),e.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),Ba.calculateInertia(e,this.mass,t),this.invInertia.set(t.x>0&&!i?1/t.x:0,t.y>0&&!i?1/t.y:0,t.z>0&&!i?1/t.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(e,t){const i=new P;return e.vsub(this.position,i),this.angularVelocity.cross(i,t),this.velocity.vadd(t,t),t}integrate(e,t,i){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===Ge.DYNAMIC||this.type===Ge.KINEMATIC)||this.sleepState===Ge.SLEEPING)return;const s=this.velocity,o=this.angularVelocity,c=this.position,u=this.force,d=this.torque,f=this.quaternion,p=this.invMass,v=this.invInertiaWorld,m=this.linearFactor,x=p*e;s.x+=u.x*x*m.x,s.y+=u.y*x*m.y,s.z+=u.z*x*m.z;const S=v.elements,E=this.angularFactor,y=d.x*E.x,_=d.y*E.y,w=d.z*E.z;o.x+=e*(S[0]*y+S[1]*_+S[2]*w),o.y+=e*(S[3]*y+S[4]*_+S[5]*w),o.z+=e*(S[6]*y+S[7]*_+S[8]*w),c.x+=s.x*e,c.y+=s.y*e,c.z+=s.z*e,f.integrate(this.angularVelocity,e,this.angularFactor,f),t&&(i?f.normalizeFast():f.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}}Ge.idCounter=0;Ge.COLLIDE_EVENT_NAME="collide";Ge.DYNAMIC=Af.DYNAMIC;Ge.STATIC=Af.STATIC;Ge.KINEMATIC=Af.KINEMATIC;Ge.AWAKE=Cf.AWAKE;Ge.SLEEPY=Cf.SLEEPY;Ge.SLEEPING=Cf.SLEEPING;Ge.wakeupEvent={type:"wakeup"};Ge.sleepyEvent={type:"sleepy"};Ge.sleepEvent={type:"sleep"};const sT=new P,oT=new sn,aT=new oi,lT=new Li,cT=new Li;new Li;const uT=new P,hT=new P,dT=new P,fT=new P,pT=new P,mT=new P,gT=new P,vT=new P;class _T{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(e,t,i){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(e,t){return!((e.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&e.collisionFilterMask)===0||((e.type&Ge.STATIC)!==0||e.sleepState===Ge.SLEEPING)&&((t.type&Ge.STATIC)!==0||t.sleepState===Ge.SLEEPING))}intersectionTest(e,t,i,s){this.useBoundingBoxes?this.doBoundingBoxBroadphase(e,t,i,s):this.doBoundingSphereBroadphase(e,t,i,s)}doBoundingSphereBroadphase(e,t,i,s){const o=xT;t.position.vsub(e.position,o);const c=(e.boundingRadius+t.boundingRadius)**2;o.lengthSquared()<c&&(i.push(e),s.push(t))}doBoundingBoxBroadphase(e,t,i,s){e.aabbNeedsUpdate&&e.updateAABB(),t.aabbNeedsUpdate&&t.updateAABB(),e.aabb.overlaps(t.aabb)&&(i.push(e),s.push(t))}makePairsUnique(e,t){const i=yT,s=ST,o=MT,c=e.length;for(let u=0;u!==c;u++)s[u]=e[u],o[u]=t[u];e.length=0,t.length=0;for(let u=0;u!==c;u++){const d=s[u].id,f=o[u].id,p=d<f?`${d},${f}`:`${f},${d}`;i[p]=u,i.keys.push(p)}for(let u=0;u!==i.keys.length;u++){const d=i.keys.pop(),f=i[d];e.push(s[f]),t.push(o[f]),delete i[d]}}setWorld(e){}static boundingSphereCheck(e,t){const i=new P;e.position.vsub(t.position,i);const s=e.shapes[0],o=t.shapes[0];return Math.pow(s.boundingSphereRadius+o.boundingSphereRadius,2)>i.lengthSquared()}aabbQuery(e,t,i){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}}const xT=new P;new P;new sn;new P;const yT={keys:[]},ST=[],MT=[];new P;new P;new P;class ET extends _T{constructor(){super()}collisionPairs(e,t,i){const s=e.bodies,o=s.length;let c,u;for(let d=0;d!==o;d++)for(let f=0;f!==d;f++)c=s[d],u=s[f],this.needBroadphaseCollision(c,u)&&this.intersectionTest(c,u,t,i)}aabbQuery(e,t,i){i===void 0&&(i=[]);for(let s=0;s<e.bodies.length;s++){const o=e.bodies[s];o.aabbNeedsUpdate&&o.updateAABB(),o.aabb.overlaps(t)&&i.push(o)}return i}}class Hc{constructor(){this.rayFromWorld=new P,this.rayToWorld=new P,this.hitNormalWorld=new P,this.hitPointWorld=new P,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(e,t,i,s,o,c,u){this.rayFromWorld.copy(e),this.rayToWorld.copy(t),this.hitNormalWorld.copy(i),this.hitPointWorld.copy(s),this.shape=o,this.body=c,this.distance=u}}let b0,P0,L0,I0,N0,D0,U0;const Rf={CLOSEST:1,ANY:2,ALL:4};b0=Xe.types.SPHERE;P0=Xe.types.PLANE;L0=Xe.types.BOX;I0=Xe.types.CYLINDER;N0=Xe.types.CONVEXPOLYHEDRON;D0=Xe.types.HEIGHTFIELD;U0=Xe.types.TRIMESH;class rn{get[b0](){return this._intersectSphere}get[P0](){return this._intersectPlane}get[L0](){return this._intersectBox}get[I0](){return this._intersectConvex}get[N0](){return this._intersectConvex}get[D0](){return this._intersectHeightfield}get[U0](){return this._intersectTrimesh}constructor(e,t){e===void 0&&(e=new P),t===void 0&&(t=new P),this.from=e.clone(),this.to=t.clone(),this.direction=new P,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=rn.ANY,this.result=new Hc,this.hasHit=!1,this.callback=i=>{}}intersectWorld(e,t){return this.mode=t.mode||rn.ANY,this.result=t.result||new Hc,this.skipBackfaces=!!t.skipBackfaces,this.collisionFilterMask=typeof t.collisionFilterMask<"u"?t.collisionFilterMask:-1,this.collisionFilterGroup=typeof t.collisionFilterGroup<"u"?t.collisionFilterGroup:-1,this.checkCollisionResponse=typeof t.checkCollisionResponse<"u"?t.checkCollisionResponse:!0,t.from&&this.from.copy(t.from),t.to&&this.to.copy(t.to),this.callback=t.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(Ev),pd.length=0,e.broadphase.aabbQuery(e,Ev,pd),this.intersectBodies(pd),this.hasHit}intersectBody(e,t){t&&(this.result=t,this.updateDirection());const i=this.checkCollisionResponse;if(i&&!e.collisionResponse||(this.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&this.collisionFilterMask)===0)return;const s=wT,o=TT;for(let c=0,u=e.shapes.length;c<u;c++){const d=e.shapes[c];if(!(i&&!d.collisionResponse)&&(e.quaternion.mult(e.shapeOrientations[c],o),e.quaternion.vmult(e.shapeOffsets[c],s),s.vadd(e.position,s),this.intersectShape(d,o,s,e),this.result.shouldStop))break}}intersectBodies(e,t){t&&(this.result=t,this.updateDirection());for(let i=0,s=e.length;!this.result.shouldStop&&i<s;i++)this.intersectBody(e[i])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(e,t,i,s){const o=this.from;if(BT(o,this.direction,i)>e.boundingSphereRadius)return;const u=this[e.type];u&&u.call(this,e,t,i,s,e)}_intersectBox(e,t,i,s,o){return this._intersectConvex(e.convexPolyhedronRepresentation,t,i,s,o)}_intersectPlane(e,t,i,s,o){const c=this.from,u=this.to,d=this.direction,f=new P(0,0,1);t.vmult(f,f);const p=new P;c.vsub(i,p);const v=p.dot(f);u.vsub(i,p);const m=p.dot(f);if(v*m>0||c.distanceTo(u)<v)return;const x=f.dot(d);if(Math.abs(x)<this.precision)return;const S=new P,E=new P,y=new P;c.vsub(i,S);const _=-f.dot(S)/x;d.scale(_,E),c.vadd(E,y),this.reportIntersection(f,y,o,s,-1)}getAABB(e){const{lowerBound:t,upperBound:i}=e,s=this.to,o=this.from;t.x=Math.min(s.x,o.x),t.y=Math.min(s.y,o.y),t.z=Math.min(s.z,o.z),i.x=Math.max(s.x,o.x),i.y=Math.max(s.y,o.y),i.z=Math.max(s.z,o.z)}_intersectHeightfield(e,t,i,s,o){e.data,e.elementSize;const c=AT;c.from.copy(this.from),c.to.copy(this.to),Ft.pointToLocalFrame(i,t,c.from,c.from),Ft.pointToLocalFrame(i,t,c.to,c.to),c.updateDirection();const u=CT;let d,f,p,v;d=f=0,p=v=e.data.length-1;const m=new oi;c.getAABB(m),e.getIndexOfPosition(m.lowerBound.x,m.lowerBound.y,u,!0),d=Math.max(d,u[0]),f=Math.max(f,u[1]),e.getIndexOfPosition(m.upperBound.x,m.upperBound.y,u,!0),p=Math.min(p,u[0]+1),v=Math.min(v,u[1]+1);for(let x=d;x<p;x++)for(let S=f;S<v;S++){if(this.result.shouldStop)return;if(e.getAabbAtIndex(x,S,m),!!m.overlapsRay(c)){if(e.getConvexTrianglePillar(x,S,!1),Ft.pointToWorldFrame(i,t,e.pillarOffset,yc),this._intersectConvex(e.pillarConvex,t,yc,s,o,wv),this.result.shouldStop)return;e.getConvexTrianglePillar(x,S,!0),Ft.pointToWorldFrame(i,t,e.pillarOffset,yc),this._intersectConvex(e.pillarConvex,t,yc,s,o,wv)}}}_intersectSphere(e,t,i,s,o){const c=this.from,u=this.to,d=e.radius,f=(u.x-c.x)**2+(u.y-c.y)**2+(u.z-c.z)**2,p=2*((u.x-c.x)*(c.x-i.x)+(u.y-c.y)*(c.y-i.y)+(u.z-c.z)*(c.z-i.z)),v=(c.x-i.x)**2+(c.y-i.y)**2+(c.z-i.z)**2-d**2,m=p**2-4*f*v,x=RT,S=bT;if(!(m<0))if(m===0)c.lerp(u,m,x),x.vsub(i,S),S.normalize(),this.reportIntersection(S,x,o,s,-1);else{const E=(-p-Math.sqrt(m))/(2*f),y=(-p+Math.sqrt(m))/(2*f);if(E>=0&&E<=1&&(c.lerp(u,E,x),x.vsub(i,S),S.normalize(),this.reportIntersection(S,x,o,s,-1)),this.result.shouldStop)return;y>=0&&y<=1&&(c.lerp(u,y,x),x.vsub(i,S),S.normalize(),this.reportIntersection(S,x,o,s,-1))}}_intersectConvex(e,t,i,s,o,c){const u=PT,d=Tv,f=c&&c.faceList||null,p=e.faces,v=e.vertices,m=e.faceNormals,x=this.direction,S=this.from,E=this.to,y=S.distanceTo(E),_=f?f.length:p.length,w=this.result;for(let A=0;!w.shouldStop&&A<_;A++){const T=f?f[A]:A,U=p[T],N=m[T],D=t,z=i;d.copy(v[U[0]]),D.vmult(d,d),d.vadd(z,d),d.vsub(S,d),D.vmult(N,u);const b=x.dot(u);if(Math.abs(b)<this.precision)continue;const C=u.dot(d)/b;if(!(C<0)){x.scale(C,Zn),Zn.vadd(S,Zn),Ri.copy(v[U[0]]),D.vmult(Ri,Ri),z.vadd(Ri,Ri);for(let B=1;!w.shouldStop&&B<U.length-1;B++){Hi.copy(v[U[B]]),Vi.copy(v[U[B+1]]),D.vmult(Hi,Hi),D.vmult(Vi,Vi),z.vadd(Hi,Hi),z.vadd(Vi,Vi);const O=Zn.distanceTo(S);!(rn.pointInTriangle(Zn,Ri,Hi,Vi)||rn.pointInTriangle(Zn,Hi,Ri,Vi))||O>y||this.reportIntersection(u,Zn,o,s,T)}}}}_intersectTrimesh(e,t,i,s,o,c){const u=LT,d=zT,f=OT,p=Tv,v=IT,m=NT,x=DT,S=FT,E=UT,y=e.indices;e.vertices;const _=this.from,w=this.to,A=this.direction;f.position.copy(i),f.quaternion.copy(t),Ft.vectorToLocalFrame(i,t,A,v),Ft.pointToLocalFrame(i,t,_,m),Ft.pointToLocalFrame(i,t,w,x),x.x*=e.scale.x,x.y*=e.scale.y,x.z*=e.scale.z,m.x*=e.scale.x,m.y*=e.scale.y,m.z*=e.scale.z,x.vsub(m,v),v.normalize();const T=m.distanceSquared(x);e.tree.rayQuery(this,f,d);for(let U=0,N=d.length;!this.result.shouldStop&&U!==N;U++){const D=d[U];e.getNormal(D,u),e.getVertex(y[D*3],Ri),Ri.vsub(m,p);const z=v.dot(u),b=u.dot(p)/z;if(b<0)continue;v.scale(b,Zn),Zn.vadd(m,Zn),e.getVertex(y[D*3+1],Hi),e.getVertex(y[D*3+2],Vi);const C=Zn.distanceSquared(m);!(rn.pointInTriangle(Zn,Hi,Ri,Vi)||rn.pointInTriangle(Zn,Ri,Hi,Vi))||C>T||(Ft.vectorToWorldFrame(t,u,E),Ft.pointToWorldFrame(i,t,Zn,S),this.reportIntersection(E,S,o,s,D))}d.length=0}reportIntersection(e,t,i,s,o){const c=this.from,u=this.to,d=c.distanceTo(t),f=this.result;if(!(this.skipBackfaces&&e.dot(this.direction)>0))switch(f.hitFaceIndex=typeof o<"u"?o:-1,this.mode){case rn.ALL:this.hasHit=!0,f.set(c,u,e,t,i,s,d),f.hasHit=!0,this.callback(f);break;case rn.CLOSEST:(d<f.distance||!f.hasHit)&&(this.hasHit=!0,f.hasHit=!0,f.set(c,u,e,t,i,s,d));break;case rn.ANY:this.hasHit=!0,f.hasHit=!0,f.set(c,u,e,t,i,s,d),f.shouldStop=!0;break}}static pointInTriangle(e,t,i,s){s.vsub(t,bs),i.vsub(t,Ta),e.vsub(t,md);const o=bs.dot(bs),c=bs.dot(Ta),u=bs.dot(md),d=Ta.dot(Ta),f=Ta.dot(md);let p,v;return(p=d*u-c*f)>=0&&(v=o*f-c*u)>=0&&p+v<o*d-c*c}}rn.CLOSEST=Rf.CLOSEST;rn.ANY=Rf.ANY;rn.ALL=Rf.ALL;const Ev=new oi,pd=[],Ta=new P,md=new P,wT=new P,TT=new sn,Zn=new P,Ri=new P,Hi=new P,Vi=new P;new P;new Hc;const wv={faceList:[0]},yc=new P,AT=new rn,CT=[],RT=new P,bT=new P,PT=new P;new P;new P;const Tv=new P,LT=new P,IT=new P,NT=new P,DT=new P,UT=new P,FT=new P;new oi;const zT=[],OT=new Ft,bs=new P,Sc=new P;function BT(a,e,t){t.vsub(a,bs);const i=bs.dot(e);return e.scale(i,Sc),Sc.vadd(a,Sc),t.distanceTo(Sc)}class kT{static defaults(e,t){e===void 0&&(e={});for(let i in t)i in e||(e[i]=t[i]);return e}}class Av{constructor(){this.spatial=new P,this.rotational=new P}multiplyElement(e){return e.spatial.dot(this.spatial)+e.rotational.dot(this.rotational)}multiplyVectors(e,t){return e.dot(this.spatial)+t.dot(this.rotational)}}class Va{constructor(e,t,i,s){i===void 0&&(i=-1e6),s===void 0&&(s=1e6),this.id=Va.idCounter++,this.minForce=i,this.maxForce=s,this.bi=e,this.bj=t,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new Av,this.jacobianElementB=new Av,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(e,t,i){const s=t,o=e,c=i;this.a=4/(c*(1+4*s)),this.b=4*s/(1+4*s),this.eps=4/(c*c*o*(1+4*s))}computeB(e,t,i){const s=this.computeGW(),o=this.computeGq(),c=this.computeGiMf();return-o*e-s*t-c*i}computeGq(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.position,c=s.position;return e.spatial.dot(o)+t.spatial.dot(c)}computeGW(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.velocity,c=s.velocity,u=i.angularVelocity,d=s.angularVelocity;return e.multiplyVectors(o,u)+t.multiplyVectors(c,d)}computeGWlambda(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.vlambda,c=s.vlambda,u=i.wlambda,d=s.wlambda;return e.multiplyVectors(o,u)+t.multiplyVectors(c,d)}computeGiMf(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.force,c=i.torque,u=s.force,d=s.torque,f=i.invMassSolve,p=s.invMassSolve;return o.scale(f,Cv),u.scale(p,Rv),i.invInertiaWorldSolve.vmult(c,bv),s.invInertiaWorldSolve.vmult(d,Pv),e.multiplyVectors(Cv,bv)+t.multiplyVectors(Rv,Pv)}computeGiMGt(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.invMassSolve,c=s.invMassSolve,u=i.invInertiaWorldSolve,d=s.invInertiaWorldSolve;let f=o+c;return u.vmult(e.rotational,Mc),f+=Mc.dot(e.rotational),d.vmult(t.rotational,Mc),f+=Mc.dot(t.rotational),f}addToWlambda(e){const t=this.jacobianElementA,i=this.jacobianElementB,s=this.bi,o=this.bj,c=HT;s.vlambda.addScaledVector(s.invMassSolve*e,t.spatial,s.vlambda),o.vlambda.addScaledVector(o.invMassSolve*e,i.spatial,o.vlambda),s.invInertiaWorldSolve.vmult(t.rotational,c),s.wlambda.addScaledVector(e,c,s.wlambda),o.invInertiaWorldSolve.vmult(i.rotational,c),o.wlambda.addScaledVector(e,c,o.wlambda)}computeC(){return this.computeGiMGt()+this.eps}}Va.idCounter=0;const Cv=new P,Rv=new P,bv=new P,Pv=new P,Mc=new P,HT=new P;class VT extends Va{constructor(e,t,i){i===void 0&&(i=1e6),super(e,t,0,i),this.restitution=0,this.ri=new P,this.rj=new P,this.ni=new P}computeB(e){const t=this.a,i=this.b,s=this.bi,o=this.bj,c=this.ri,u=this.rj,d=GT,f=WT,p=s.velocity,v=s.angularVelocity;s.force,s.torque;const m=o.velocity,x=o.angularVelocity;o.force,o.torque;const S=jT,E=this.jacobianElementA,y=this.jacobianElementB,_=this.ni;c.cross(_,d),u.cross(_,f),_.negate(E.spatial),d.negate(E.rotational),y.spatial.copy(_),y.rotational.copy(f),S.copy(o.position),S.vadd(u,S),S.vsub(s.position,S),S.vsub(c,S);const w=_.dot(S),A=this.restitution+1,T=A*m.dot(_)-A*p.dot(_)+x.dot(f)-v.dot(d),U=this.computeGiMf();return-w*t-T*i-e*U}getImpactVelocityAlongNormal(){const e=XT,t=qT,i=YT,s=ZT,o=$T;return this.bi.position.vadd(this.ri,i),this.bj.position.vadd(this.rj,s),this.bi.getVelocityAtWorldPoint(i,e),this.bj.getVelocityAtWorldPoint(s,t),e.vsub(t,o),this.ni.dot(o)}}const GT=new P,WT=new P,jT=new P,XT=new P,qT=new P,YT=new P,ZT=new P,$T=new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;class Lv extends Va{constructor(e,t,i){super(e,t,-i,i),this.ri=new P,this.rj=new P,this.t=new P}computeB(e){this.a;const t=this.b;this.bi,this.bj;const i=this.ri,s=this.rj,o=KT,c=QT,u=this.t;i.cross(u,o),s.cross(u,c);const d=this.jacobianElementA,f=this.jacobianElementB;u.negate(d.spatial),o.negate(d.rotational),f.spatial.copy(u),f.rotational.copy(c);const p=this.computeGW(),v=this.computeGiMf();return-p*t-e*v}}const KT=new P,QT=new P;class Zc{constructor(e,t,i){i=kT.defaults(i,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=Zc.idCounter++,this.materials=[e,t],this.friction=i.friction,this.restitution=i.restitution,this.contactEquationStiffness=i.contactEquationStiffness,this.contactEquationRelaxation=i.contactEquationRelaxation,this.frictionEquationStiffness=i.frictionEquationStiffness,this.frictionEquationRelaxation=i.frictionEquationRelaxation}}Zc.idCounter=0;class $c{constructor(e){e===void 0&&(e={});let t="";typeof e=="string"&&(t=e,e={}),this.name=t,this.id=$c.idCounter++,this.friction=typeof e.friction<"u"?e.friction:-1,this.restitution=typeof e.restitution<"u"?e.restitution:-1}}$c.idCounter=0;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new rn;new P;new P;new P;new P(1,0,0),new P(0,1,0),new P(0,0,1);new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new oi;new P;new oi;new P;new P;new P;new P;new P;new P;new P;new oi;new P;new Ft;new oi;class JT{constructor(){this.equations=[]}solve(e,t){return 0}addEquation(e){e.enabled&&!e.bi.isTrigger&&!e.bj.isTrigger&&this.equations.push(e)}removeEquation(e){const t=this.equations,i=t.indexOf(e);i!==-1&&t.splice(i,1)}removeAllEquations(){this.equations.length=0}}class eA extends JT{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(e,t){let i=0;const s=this.iterations,o=this.tolerance*this.tolerance,c=this.equations,u=c.length,d=t.bodies,f=d.length,p=e;let v,m,x,S,E,y;if(u!==0)for(let T=0;T!==f;T++)d[T].updateSolveMassProperties();const _=nA,w=iA,A=tA;_.length=u,w.length=u,A.length=u;for(let T=0;T!==u;T++){const U=c[T];A[T]=0,w[T]=U.computeB(p),_[T]=1/U.computeC()}if(u!==0){for(let N=0;N!==f;N++){const D=d[N],z=D.vlambda,b=D.wlambda;z.set(0,0,0),b.set(0,0,0)}for(i=0;i!==s;i++){S=0;for(let N=0;N!==u;N++){const D=c[N];v=w[N],m=_[N],y=A[N],E=D.computeGWlambda(),x=m*(v-E-D.eps*y),y+x<D.minForce?x=D.minForce-y:y+x>D.maxForce&&(x=D.maxForce-y),A[N]+=x,S+=x>0?x:-x,D.addToWlambda(x)}if(S*S<o)break}for(let N=0;N!==f;N++){const D=d[N],z=D.velocity,b=D.angularVelocity;D.vlambda.vmul(D.linearFactor,D.vlambda),z.vadd(D.vlambda,z),D.wlambda.vmul(D.angularFactor,D.wlambda),b.vadd(D.wlambda,b)}let T=c.length;const U=1/p;for(;T--;)c[T].multiplier=A[T]*U}return i}}const tA=[],nA=[],iA=[];class rA{constructor(){this.objects=[],this.type=Object}release(){const e=arguments.length;for(let t=0;t!==e;t++)this.objects.push(t<0||arguments.length<=t?void 0:arguments[t]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(e){const t=this.objects;for(;t.length>e;)t.pop();for(;t.length<e;)t.push(this.constructObject());return this}}class sA extends rA{constructor(){super(...arguments),this.type=P}constructObject(){return new P}}const jt={sphereSphere:Xe.types.SPHERE,spherePlane:Xe.types.SPHERE|Xe.types.PLANE,boxBox:Xe.types.BOX|Xe.types.BOX,sphereBox:Xe.types.SPHERE|Xe.types.BOX,planeBox:Xe.types.PLANE|Xe.types.BOX,convexConvex:Xe.types.CONVEXPOLYHEDRON,sphereConvex:Xe.types.SPHERE|Xe.types.CONVEXPOLYHEDRON,planeConvex:Xe.types.PLANE|Xe.types.CONVEXPOLYHEDRON,boxConvex:Xe.types.BOX|Xe.types.CONVEXPOLYHEDRON,sphereHeightfield:Xe.types.SPHERE|Xe.types.HEIGHTFIELD,boxHeightfield:Xe.types.BOX|Xe.types.HEIGHTFIELD,convexHeightfield:Xe.types.CONVEXPOLYHEDRON|Xe.types.HEIGHTFIELD,sphereParticle:Xe.types.PARTICLE|Xe.types.SPHERE,planeParticle:Xe.types.PLANE|Xe.types.PARTICLE,boxParticle:Xe.types.BOX|Xe.types.PARTICLE,convexParticle:Xe.types.PARTICLE|Xe.types.CONVEXPOLYHEDRON,cylinderCylinder:Xe.types.CYLINDER,sphereCylinder:Xe.types.SPHERE|Xe.types.CYLINDER,planeCylinder:Xe.types.PLANE|Xe.types.CYLINDER,boxCylinder:Xe.types.BOX|Xe.types.CYLINDER,convexCylinder:Xe.types.CONVEXPOLYHEDRON|Xe.types.CYLINDER,heightfieldCylinder:Xe.types.HEIGHTFIELD|Xe.types.CYLINDER,particleCylinder:Xe.types.PARTICLE|Xe.types.CYLINDER,sphereTrimesh:Xe.types.SPHERE|Xe.types.TRIMESH,planeTrimesh:Xe.types.PLANE|Xe.types.TRIMESH};class oA{get[jt.sphereSphere](){return this.sphereSphere}get[jt.spherePlane](){return this.spherePlane}get[jt.boxBox](){return this.boxBox}get[jt.sphereBox](){return this.sphereBox}get[jt.planeBox](){return this.planeBox}get[jt.convexConvex](){return this.convexConvex}get[jt.sphereConvex](){return this.sphereConvex}get[jt.planeConvex](){return this.planeConvex}get[jt.boxConvex](){return this.boxConvex}get[jt.sphereHeightfield](){return this.sphereHeightfield}get[jt.boxHeightfield](){return this.boxHeightfield}get[jt.convexHeightfield](){return this.convexHeightfield}get[jt.sphereParticle](){return this.sphereParticle}get[jt.planeParticle](){return this.planeParticle}get[jt.boxParticle](){return this.boxParticle}get[jt.convexParticle](){return this.convexParticle}get[jt.cylinderCylinder](){return this.convexConvex}get[jt.sphereCylinder](){return this.sphereConvex}get[jt.planeCylinder](){return this.planeConvex}get[jt.boxCylinder](){return this.boxConvex}get[jt.convexCylinder](){return this.convexConvex}get[jt.heightfieldCylinder](){return this.heightfieldCylinder}get[jt.particleCylinder](){return this.particleCylinder}get[jt.sphereTrimesh](){return this.sphereTrimesh}get[jt.planeTrimesh](){return this.planeTrimesh}constructor(e){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new sA,this.world=e,this.currentContactMaterial=e.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(e,t,i,s,o,c){let u;this.contactPointPool.length?(u=this.contactPointPool.pop(),u.bi=e,u.bj=t):u=new VT(e,t),u.enabled=e.collisionResponse&&t.collisionResponse&&i.collisionResponse&&s.collisionResponse;const d=this.currentContactMaterial;u.restitution=d.restitution,u.setSpookParams(d.contactEquationStiffness,d.contactEquationRelaxation,this.world.dt);const f=i.material||e.material,p=s.material||t.material;return f&&p&&f.restitution>=0&&p.restitution>=0&&(u.restitution=f.restitution*p.restitution),u.si=o||i,u.sj=c||s,u}createFrictionEquationsFromContact(e,t){const i=e.bi,s=e.bj,o=e.si,c=e.sj,u=this.world,d=this.currentContactMaterial;let f=d.friction;const p=o.material||i.material,v=c.material||s.material;if(p&&v&&p.friction>=0&&v.friction>=0&&(f=p.friction*v.friction),f>0){const m=f*(u.frictionGravity||u.gravity).length();let x=i.invMass+s.invMass;x>0&&(x=1/x);const S=this.frictionEquationPool,E=S.length?S.pop():new Lv(i,s,m*x),y=S.length?S.pop():new Lv(i,s,m*x);return E.bi=y.bi=i,E.bj=y.bj=s,E.minForce=y.minForce=-m*x,E.maxForce=y.maxForce=m*x,E.ri.copy(e.ri),E.rj.copy(e.rj),y.ri.copy(e.ri),y.rj.copy(e.rj),e.ni.tangents(E.t,y.t),E.setSpookParams(d.frictionEquationStiffness,d.frictionEquationRelaxation,u.dt),y.setSpookParams(d.frictionEquationStiffness,d.frictionEquationRelaxation,u.dt),E.enabled=y.enabled=e.enabled,t.push(E,y),!0}return!1}createFrictionFromAverage(e){let t=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(t,this.frictionResult)||e===1)return;const i=this.frictionResult[this.frictionResult.length-2],s=this.frictionResult[this.frictionResult.length-1];xs.setZero(),So.setZero(),Mo.setZero();const o=t.bi;t.bj;for(let u=0;u!==e;u++)t=this.result[this.result.length-1-u],t.bi!==o?(xs.vadd(t.ni,xs),So.vadd(t.ri,So),Mo.vadd(t.rj,Mo)):(xs.vsub(t.ni,xs),So.vadd(t.rj,So),Mo.vadd(t.ri,Mo));const c=1/e;So.scale(c,i.ri),Mo.scale(c,i.rj),s.ri.copy(i.ri),s.rj.copy(i.rj),xs.normalize(),xs.tangents(i.t,s.t)}getContacts(e,t,i,s,o,c,u){this.contactPointPool=o,this.frictionEquationPool=u,this.result=s,this.frictionResult=c;const d=cA,f=uA,p=aA,v=lA;for(let m=0,x=e.length;m!==x;m++){const S=e[m],E=t[m];let y=null;S.material&&E.material&&(y=i.getContactMaterial(S.material,E.material)||null);const _=S.type&Ge.KINEMATIC&&E.type&Ge.STATIC||S.type&Ge.STATIC&&E.type&Ge.KINEMATIC||S.type&Ge.KINEMATIC&&E.type&Ge.KINEMATIC;for(let w=0;w<S.shapes.length;w++){S.quaternion.mult(S.shapeOrientations[w],d),S.quaternion.vmult(S.shapeOffsets[w],p),p.vadd(S.position,p);const A=S.shapes[w];for(let T=0;T<E.shapes.length;T++){E.quaternion.mult(E.shapeOrientations[T],f),E.quaternion.vmult(E.shapeOffsets[T],v),v.vadd(E.position,v);const U=E.shapes[T];if(!(A.collisionFilterMask&U.collisionFilterGroup&&U.collisionFilterMask&A.collisionFilterGroup)||p.distanceTo(v)>A.boundingSphereRadius+U.boundingSphereRadius)continue;let N=null;A.material&&U.material&&(N=i.getContactMaterial(A.material,U.material)||null),this.currentContactMaterial=N||y||i.defaultContactMaterial;const D=A.type|U.type,z=this[D];if(z){let b=!1;A.type<U.type?b=z.call(this,A,U,p,v,d,f,S,E,A,U,_):b=z.call(this,U,A,v,p,f,d,E,S,A,U,_),b&&_&&(i.shapeOverlapKeeper.set(A.id,U.id),i.bodyOverlapKeeper.set(S.id,E.id))}}}}}sphereSphere(e,t,i,s,o,c,u,d,f,p,v){if(v)return i.distanceSquared(s)<(e.radius+t.radius)**2;const m=this.createContactEquation(u,d,e,t,f,p);s.vsub(i,m.ni),m.ni.normalize(),m.ri.copy(m.ni),m.rj.copy(m.ni),m.ri.scale(e.radius,m.ri),m.rj.scale(-t.radius,m.rj),m.ri.vadd(i,m.ri),m.ri.vsub(u.position,m.ri),m.rj.vadd(s,m.rj),m.rj.vsub(d.position,m.rj),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}spherePlane(e,t,i,s,o,c,u,d,f,p,v){const m=this.createContactEquation(u,d,e,t,f,p);if(m.ni.set(0,0,1),c.vmult(m.ni,m.ni),m.ni.negate(m.ni),m.ni.normalize(),m.ni.scale(e.radius,m.ri),i.vsub(s,Ec),m.ni.scale(m.ni.dot(Ec),Iv),Ec.vsub(Iv,m.rj),-Ec.dot(m.ni)<=e.radius){if(v)return!0;const x=m.ri,S=m.rj;x.vadd(i,x),x.vsub(u.position,x),S.vadd(s,S),S.vsub(d.position,S),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}}boxBox(e,t,i,s,o,c,u,d,f,p,v){return e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t.convexPolyhedronRepresentation,i,s,o,c,u,d,e,t,v)}sphereBox(e,t,i,s,o,c,u,d,f,p,v){const m=this.v3pool,x=FA;i.vsub(s,wc),t.getSideNormals(x,c);const S=e.radius;let E=!1;const y=OA,_=BA,w=kA;let A=null,T=0,U=0,N=0,D=null;for(let W=0,ie=x.length;W!==ie&&E===!1;W++){const H=NA;H.copy(x[W]);const q=H.length();H.normalize();const oe=wc.dot(H);if(oe<q+S&&oe>0){const G=DA,Q=UA;G.copy(x[(W+1)%3]),Q.copy(x[(W+2)%3]);const be=G.length(),se=Q.length();G.normalize(),Q.normalize();const fe=wc.dot(G),Me=wc.dot(Q);if(fe<be&&fe>-be&&Me<se&&Me>-se){const _e=Math.abs(oe-q-S);if((D===null||_e<D)&&(D=_e,U=fe,N=Me,A=q,y.copy(H),_.copy(G),w.copy(Q),T++,v))return!0}}}if(T){E=!0;const W=this.createContactEquation(u,d,e,t,f,p);y.scale(-S,W.ri),W.ni.copy(y),W.ni.negate(W.ni),y.scale(A,y),_.scale(U,_),y.vadd(_,y),w.scale(N,w),y.vadd(w,W.rj),W.ri.vadd(i,W.ri),W.ri.vsub(u.position,W.ri),W.rj.vadd(s,W.rj),W.rj.vsub(d.position,W.rj),this.result.push(W),this.createFrictionEquationsFromContact(W,this.frictionResult)}let z=m.get();const b=zA;for(let W=0;W!==2&&!E;W++)for(let ie=0;ie!==2&&!E;ie++)for(let H=0;H!==2&&!E;H++)if(z.set(0,0,0),W?z.vadd(x[0],z):z.vsub(x[0],z),ie?z.vadd(x[1],z):z.vsub(x[1],z),H?z.vadd(x[2],z):z.vsub(x[2],z),s.vadd(z,b),b.vsub(i,b),b.lengthSquared()<S*S){if(v)return!0;E=!0;const q=this.createContactEquation(u,d,e,t,f,p);q.ri.copy(b),q.ri.normalize(),q.ni.copy(q.ri),q.ri.scale(S,q.ri),q.rj.copy(z),q.ri.vadd(i,q.ri),q.ri.vsub(u.position,q.ri),q.rj.vadd(s,q.rj),q.rj.vsub(d.position,q.rj),this.result.push(q),this.createFrictionEquationsFromContact(q,this.frictionResult)}m.release(z),z=null;const C=m.get(),B=m.get(),O=m.get(),k=m.get(),j=m.get(),X=x.length;for(let W=0;W!==X&&!E;W++)for(let ie=0;ie!==X&&!E;ie++)if(W%3!==ie%3){x[ie].cross(x[W],C),C.normalize(),x[W].vadd(x[ie],B),O.copy(i),O.vsub(B,O),O.vsub(s,O);const H=O.dot(C);C.scale(H,k);let q=0;for(;q===W%3||q===ie%3;)q++;j.copy(i),j.vsub(k,j),j.vsub(B,j),j.vsub(s,j);const oe=Math.abs(H),G=j.length();if(oe<x[q].length()&&G<S){if(v)return!0;E=!0;const Q=this.createContactEquation(u,d,e,t,f,p);B.vadd(k,Q.rj),Q.rj.copy(Q.rj),j.negate(Q.ni),Q.ni.normalize(),Q.ri.copy(Q.rj),Q.ri.vadd(s,Q.ri),Q.ri.vsub(i,Q.ri),Q.ri.normalize(),Q.ri.scale(S,Q.ri),Q.ri.vadd(i,Q.ri),Q.ri.vsub(u.position,Q.ri),Q.rj.vadd(s,Q.rj),Q.rj.vsub(d.position,Q.rj),this.result.push(Q),this.createFrictionEquationsFromContact(Q,this.frictionResult)}}m.release(C,B,O,k,j)}planeBox(e,t,i,s,o,c,u,d,f,p,v){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,t.convexPolyhedronRepresentation.id=t.id,this.planeConvex(e,t.convexPolyhedronRepresentation,i,s,o,c,u,d,e,t,v)}convexConvex(e,t,i,s,o,c,u,d,f,p,v,m,x){const S=tC;if(!(i.distanceTo(s)>e.boundingSphereRadius+t.boundingSphereRadius)&&e.findSeparatingAxis(t,i,o,s,c,S,m,x)){const E=[],y=nC;e.clipAgainstHull(i,o,t,s,c,S,-100,100,E);let _=0;for(let w=0;w!==E.length;w++){if(v)return!0;const A=this.createContactEquation(u,d,e,t,f,p),T=A.ri,U=A.rj;S.negate(A.ni),E[w].normal.negate(y),y.scale(E[w].depth,y),E[w].point.vadd(y,T),U.copy(E[w].point),T.vsub(i,T),U.vsub(s,U),T.vadd(i,T),T.vsub(u.position,T),U.vadd(s,U),U.vsub(d.position,U),this.result.push(A),_++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(A,this.frictionResult)}this.enableFrictionReduction&&_&&this.createFrictionFromAverage(_)}}sphereConvex(e,t,i,s,o,c,u,d,f,p,v){const m=this.v3pool;i.vsub(s,HA);const x=t.faceNormals,S=t.faces,E=t.vertices,y=e.radius;let _=!1;for(let w=0;w!==E.length;w++){const A=E[w],T=jA;c.vmult(A,T),s.vadd(T,T);const U=WA;if(T.vsub(i,U),U.lengthSquared()<y*y){if(v)return!0;_=!0;const N=this.createContactEquation(u,d,e,t,f,p);N.ri.copy(U),N.ri.normalize(),N.ni.copy(N.ri),N.ri.scale(y,N.ri),T.vsub(s,N.rj),N.ri.vadd(i,N.ri),N.ri.vsub(u.position,N.ri),N.rj.vadd(s,N.rj),N.rj.vsub(d.position,N.rj),this.result.push(N),this.createFrictionEquationsFromContact(N,this.frictionResult);return}}for(let w=0,A=S.length;w!==A&&_===!1;w++){const T=x[w],U=S[w],N=XA;c.vmult(T,N);const D=qA;c.vmult(E[U[0]],D),D.vadd(s,D);const z=YA;N.scale(-y,z),i.vadd(z,z);const b=ZA;z.vsub(D,b);const C=b.dot(N),B=$A;if(i.vsub(D,B),C<0&&B.dot(N)>0){const O=[];for(let k=0,j=U.length;k!==j;k++){const X=m.get();c.vmult(E[U[k]],X),s.vadd(X,X),O.push(X)}if(IA(O,N,i)){if(v)return!0;_=!0;const k=this.createContactEquation(u,d,e,t,f,p);N.scale(-y,k.ri),N.negate(k.ni);const j=m.get();N.scale(-C,j);const X=m.get();N.scale(-y,X),i.vsub(s,k.rj),k.rj.vadd(X,k.rj),k.rj.vadd(j,k.rj),k.rj.vadd(s,k.rj),k.rj.vsub(d.position,k.rj),k.ri.vadd(i,k.ri),k.ri.vsub(u.position,k.ri),m.release(j),m.release(X),this.result.push(k),this.createFrictionEquationsFromContact(k,this.frictionResult);for(let W=0,ie=O.length;W!==ie;W++)m.release(O[W]);return}else for(let k=0;k!==U.length;k++){const j=m.get(),X=m.get();c.vmult(E[U[(k+1)%U.length]],j),c.vmult(E[U[(k+2)%U.length]],X),s.vadd(j,j),s.vadd(X,X);const W=VA;X.vsub(j,W);const ie=GA;W.unit(ie);const H=m.get(),q=m.get();i.vsub(j,q);const oe=q.dot(ie);ie.scale(oe,H),H.vadd(j,H);const G=m.get();if(H.vsub(i,G),oe>0&&oe*oe<W.lengthSquared()&&G.lengthSquared()<y*y){if(v)return!0;const Q=this.createContactEquation(u,d,e,t,f,p);H.vsub(s,Q.rj),H.vsub(i,Q.ni),Q.ni.normalize(),Q.ni.scale(y,Q.ri),Q.rj.vadd(s,Q.rj),Q.rj.vsub(d.position,Q.rj),Q.ri.vadd(i,Q.ri),Q.ri.vsub(u.position,Q.ri),this.result.push(Q),this.createFrictionEquationsFromContact(Q,this.frictionResult);for(let be=0,se=O.length;be!==se;be++)m.release(O[be]);m.release(j),m.release(X),m.release(H),m.release(G),m.release(q);return}m.release(j),m.release(X),m.release(H),m.release(G),m.release(q)}for(let k=0,j=O.length;k!==j;k++)m.release(O[k])}}}planeConvex(e,t,i,s,o,c,u,d,f,p,v){const m=KA,x=QA;x.set(0,0,1),o.vmult(x,x);let S=0;const E=JA;for(let y=0;y!==t.vertices.length;y++)if(m.copy(t.vertices[y]),c.vmult(m,m),s.vadd(m,m),m.vsub(i,E),x.dot(E)<=0){if(v)return!0;const w=this.createContactEquation(u,d,e,t,f,p),A=eC;x.scale(x.dot(E),A),m.vsub(A,A),A.vsub(i,w.ri),w.ni.copy(x),m.vsub(s,w.rj),w.ri.vadd(i,w.ri),w.ri.vsub(u.position,w.ri),w.rj.vadd(s,w.rj),w.rj.vsub(d.position,w.rj),this.result.push(w),S++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(w,this.frictionResult)}this.enableFrictionReduction&&S&&this.createFrictionFromAverage(S)}boxConvex(e,t,i,s,o,c,u,d,f,p,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}sphereHeightfield(e,t,i,s,o,c,u,d,f,p,v){const m=t.data,x=e.radius,S=t.elementSize,E=pC,y=fC;Ft.pointToLocalFrame(s,c,i,y);let _=Math.floor((y.x-x)/S)-1,w=Math.ceil((y.x+x)/S)+1,A=Math.floor((y.y-x)/S)-1,T=Math.ceil((y.y+x)/S)+1;if(w<0||T<0||_>m.length||A>m[0].length)return;_<0&&(_=0),w<0&&(w=0),A<0&&(A=0),T<0&&(T=0),_>=m.length&&(_=m.length-1),w>=m.length&&(w=m.length-1),T>=m[0].length&&(T=m[0].length-1),A>=m[0].length&&(A=m[0].length-1);const U=[];t.getRectMinMax(_,A,w,T,U);const N=U[0],D=U[1];if(y.z-x>D||y.z+x<N)return;const z=this.result;for(let b=_;b<w;b++)for(let C=A;C<T;C++){const B=z.length;let O=!1;if(t.getConvexTrianglePillar(b,C,!1),Ft.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(O=this.sphereConvex(e,t.pillarConvex,i,E,o,c,u,d,e,t,v)),v&&O||(t.getConvexTrianglePillar(b,C,!0),Ft.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(O=this.sphereConvex(e,t.pillarConvex,i,E,o,c,u,d,e,t,v)),v&&O))return!0;if(z.length-B>2)return}}boxHeightfield(e,t,i,s,o,c,u,d,f,p,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexHeightfield(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}convexHeightfield(e,t,i,s,o,c,u,d,f,p,v){const m=t.data,x=t.elementSize,S=e.boundingSphereRadius,E=hC,y=dC,_=uC;Ft.pointToLocalFrame(s,c,i,_);let w=Math.floor((_.x-S)/x)-1,A=Math.ceil((_.x+S)/x)+1,T=Math.floor((_.y-S)/x)-1,U=Math.ceil((_.y+S)/x)+1;if(A<0||U<0||w>m.length||T>m[0].length)return;w<0&&(w=0),A<0&&(A=0),T<0&&(T=0),U<0&&(U=0),w>=m.length&&(w=m.length-1),A>=m.length&&(A=m.length-1),U>=m[0].length&&(U=m[0].length-1),T>=m[0].length&&(T=m[0].length-1);const N=[];t.getRectMinMax(w,T,A,U,N);const D=N[0],z=N[1];if(!(_.z-S>z||_.z+S<D))for(let b=w;b<A;b++)for(let C=T;C<U;C++){let B=!1;if(t.getConvexTrianglePillar(b,C,!1),Ft.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(B=this.convexConvex(e,t.pillarConvex,i,E,o,c,u,d,null,null,v,y,null)),v&&B||(t.getConvexTrianglePillar(b,C,!0),Ft.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(B=this.convexConvex(e,t.pillarConvex,i,E,o,c,u,d,null,null,v,y,null)),v&&B))return!0}}sphereParticle(e,t,i,s,o,c,u,d,f,p,v){const m=oC;if(m.set(0,0,1),s.vsub(i,m),m.lengthSquared()<=e.radius*e.radius){if(v)return!0;const S=this.createContactEquation(d,u,t,e,f,p);m.normalize(),S.rj.copy(m),S.rj.scale(e.radius,S.rj),S.ni.copy(m),S.ni.negate(S.ni),S.ri.set(0,0,0),this.result.push(S),this.createFrictionEquationsFromContact(S,this.frictionResult)}}planeParticle(e,t,i,s,o,c,u,d,f,p,v){const m=iC;m.set(0,0,1),u.quaternion.vmult(m,m);const x=rC;if(s.vsub(u.position,x),m.dot(x)<=0){if(v)return!0;const E=this.createContactEquation(d,u,t,e,f,p);E.ni.copy(m),E.ni.negate(E.ni),E.ri.set(0,0,0);const y=sC;m.scale(m.dot(s),y),s.vsub(y,y),E.rj.copy(y),this.result.push(E),this.createFrictionEquationsFromContact(E,this.frictionResult)}}boxParticle(e,t,i,s,o,c,u,d,f,p,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexParticle(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}convexParticle(e,t,i,s,o,c,u,d,f,p,v){let m=-1;const x=lC,S=cC;let E=null;const y=aC;if(y.copy(s),y.vsub(i,y),o.conjugate(Nv),Nv.vmult(y,y),e.pointIsInside(y)){e.worldVerticesNeedsUpdate&&e.computeWorldVertices(i,o),e.worldFaceNormalsNeedsUpdate&&e.computeWorldFaceNormals(o);for(let _=0,w=e.faces.length;_!==w;_++){const A=[e.worldVertices[e.faces[_][0]]],T=e.worldFaceNormals[_];s.vsub(A[0],Dv);const U=-T.dot(Dv);if(E===null||Math.abs(U)<Math.abs(E)){if(v)return!0;E=U,m=_,x.copy(T)}}if(m!==-1){const _=this.createContactEquation(d,u,t,e,f,p);x.scale(E,S),S.vadd(s,S),S.vsub(i,S),_.rj.copy(S),x.negate(_.ni),_.ri.set(0,0,0);const w=_.ri,A=_.rj;w.vadd(s,w),w.vsub(d.position,w),A.vadd(i,A),A.vsub(u.position,A),this.result.push(_),this.createFrictionEquationsFromContact(_,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(e,t,i,s,o,c,u,d,f,p,v){return this.convexHeightfield(t,e,s,i,c,o,d,u,f,p,v)}particleCylinder(e,t,i,s,o,c,u,d,f,p,v){return this.convexParticle(t,e,s,i,c,o,d,u,f,p,v)}sphereTrimesh(e,t,i,s,o,c,u,d,f,p,v){const m=_A,x=xA,S=yA,E=SA,y=MA,_=EA,w=CA,A=vA,T=mA,U=RA;Ft.pointToLocalFrame(s,c,i,y);const N=e.radius;w.lowerBound.set(y.x-N,y.y-N,y.z-N),w.upperBound.set(y.x+N,y.y+N,y.z+N),t.getTrianglesInAABB(w,U);const D=gA,z=e.radius*e.radius;for(let k=0;k<U.length;k++)for(let j=0;j<3;j++)if(t.getVertex(t.indices[U[k]*3+j],D),D.vsub(y,T),T.lengthSquared()<=z){if(A.copy(D),Ft.pointToWorldFrame(s,c,A,D),D.vsub(i,T),v)return!0;let X=this.createContactEquation(u,d,e,t,f,p);X.ni.copy(T),X.ni.normalize(),X.ri.copy(X.ni),X.ri.scale(e.radius,X.ri),X.ri.vadd(i,X.ri),X.ri.vsub(u.position,X.ri),X.rj.copy(D),X.rj.vsub(d.position,X.rj),this.result.push(X),this.createFrictionEquationsFromContact(X,this.frictionResult)}for(let k=0;k<U.length;k++)for(let j=0;j<3;j++){t.getVertex(t.indices[U[k]*3+j],m),t.getVertex(t.indices[U[k]*3+(j+1)%3],x),x.vsub(m,S),y.vsub(x,_);const X=_.dot(S);y.vsub(m,_);let W=_.dot(S);if(W>0&&X<0&&(y.vsub(m,_),E.copy(S),E.normalize(),W=_.dot(E),E.scale(W,_),_.vadd(m,_),_.distanceTo(y)<e.radius)){if(v)return!0;const H=this.createContactEquation(u,d,e,t,f,p);_.vsub(y,H.ni),H.ni.normalize(),H.ni.scale(e.radius,H.ri),H.ri.vadd(i,H.ri),H.ri.vsub(u.position,H.ri),Ft.pointToWorldFrame(s,c,_,_),_.vsub(d.position,H.rj),Ft.vectorToWorldFrame(c,H.ni,H.ni),Ft.vectorToWorldFrame(c,H.ri,H.ri),this.result.push(H),this.createFrictionEquationsFromContact(H,this.frictionResult)}}const b=wA,C=TA,B=AA,O=pA;for(let k=0,j=U.length;k!==j;k++){t.getTriangleVertices(U[k],b,C,B),t.getNormal(U[k],O),y.vsub(b,_);let X=_.dot(O);if(O.scale(X,_),y.vsub(_,_),X=_.distanceTo(y),rn.pointInTriangle(_,b,C,B)&&X<e.radius){if(v)return!0;let W=this.createContactEquation(u,d,e,t,f,p);_.vsub(y,W.ni),W.ni.normalize(),W.ni.scale(e.radius,W.ri),W.ri.vadd(i,W.ri),W.ri.vsub(u.position,W.ri),Ft.pointToWorldFrame(s,c,_,_),_.vsub(d.position,W.rj),Ft.vectorToWorldFrame(c,W.ni,W.ni),Ft.vectorToWorldFrame(c,W.ri,W.ri),this.result.push(W),this.createFrictionEquationsFromContact(W,this.frictionResult)}}U.length=0}planeTrimesh(e,t,i,s,o,c,u,d,f,p,v){const m=new P,x=hA;x.set(0,0,1),o.vmult(x,x);for(let S=0;S<t.vertices.length/3;S++){t.getVertex(S,m);const E=new P;E.copy(m),Ft.pointToWorldFrame(s,c,E,m);const y=dA;if(m.vsub(i,y),x.dot(y)<=0){if(v)return!0;const w=this.createContactEquation(u,d,e,t,f,p);w.ni.copy(x);const A=fA;x.scale(y.dot(x),A),m.vsub(A,A),w.ri.copy(A),w.ri.vsub(u.position,w.ri),w.rj.copy(m),w.rj.vsub(d.position,w.rj),this.result.push(w),this.createFrictionEquationsFromContact(w,this.frictionResult)}}}}const xs=new P,So=new P,Mo=new P,aA=new P,lA=new P,cA=new sn,uA=new sn,hA=new P,dA=new P,fA=new P,pA=new P,mA=new P;new P;const gA=new P,vA=new P,_A=new P,xA=new P,yA=new P,SA=new P,MA=new P,EA=new P,wA=new P,TA=new P,AA=new P,CA=new oi,RA=[],Ec=new P,Iv=new P,bA=new P,PA=new P,LA=new P;function IA(a,e,t){let i=null;const s=a.length;for(let o=0;o!==s;o++){const c=a[o],u=bA;a[(o+1)%s].vsub(c,u);const d=PA;u.cross(e,d);const f=LA;t.vsub(c,f);const p=d.dot(f);if(i===null||p>0&&i===!0||p<=0&&i===!1){i===null&&(i=p>0);continue}else return!1}return!0}const wc=new P,NA=new P,DA=new P,UA=new P,FA=[new P,new P,new P,new P,new P,new P],zA=new P,OA=new P,BA=new P,kA=new P,HA=new P,VA=new P,GA=new P,WA=new P,jA=new P,XA=new P,qA=new P,YA=new P,ZA=new P,$A=new P;new P;new P;const KA=new P,QA=new P,JA=new P,eC=new P,tC=new P,nC=new P,iC=new P,rC=new P,sC=new P,oC=new P,Nv=new sn,aC=new P;new P;const lC=new P,Dv=new P,cC=new P,uC=new P,hC=new P,dC=[0],fC=new P,pC=new P;class Uv{constructor(){this.current=[],this.previous=[]}getKey(e,t){if(t<e){const i=t;t=e,e=i}return e<<16|t}set(e,t){const i=this.getKey(e,t),s=this.current;let o=0;for(;i>s[o];)o++;if(i!==s[o]){for(let c=s.length-1;c>=o;c--)s[c+1]=s[c];s[o]=i}}tick(){const e=this.current;this.current=this.previous,this.previous=e,this.current.length=0}getDiff(e,t){const i=this.current,s=this.previous,o=i.length,c=s.length;let u=0;for(let d=0;d<o;d++){let f=!1;const p=i[d];for(;p>s[u];)u++;f=p===s[u],f||Fv(e,p)}u=0;for(let d=0;d<c;d++){let f=!1;const p=s[d];for(;p>i[u];)u++;f=i[u]===p,f||Fv(t,p)}}}function Fv(a,e){a.push((e&4294901760)>>16,e&65535)}const gd=(a,e)=>a<e?`${a}-${e}`:`${e}-${a}`;class mC{constructor(){this.data={keys:[]}}get(e,t){const i=gd(e,t);return this.data[i]}set(e,t,i){const s=gd(e,t);this.get(e,t)||this.data.keys.push(s),this.data[s]=i}delete(e,t){const i=gd(e,t),s=this.data.keys.indexOf(i);s!==-1&&this.data.keys.splice(s,1),delete this.data[i]}reset(){const e=this.data,t=e.keys;for(;t.length>0;){const i=t.pop();delete e[i]}}}class gC extends R0{constructor(e){e===void 0&&(e={}),super(),this.dt=-1,this.allowSleep=!!e.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=e.quatNormalizeSkip!==void 0?e.quatNormalizeSkip:0,this.quatNormalizeFast=e.quatNormalizeFast!==void 0?e.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new P,e.gravity&&this.gravity.copy(e.gravity),e.frictionGravity&&(this.frictionGravity=new P,this.frictionGravity.copy(e.frictionGravity)),this.broadphase=e.broadphase!==void 0?e.broadphase:new ET,this.bodies=[],this.hasActiveBodies=!1,this.solver=e.solver!==void 0?e.solver:new eA,this.constraints=[],this.narrowphase=new oA(this),this.collisionMatrix=new Sv,this.collisionMatrixPrevious=new Sv,this.bodyOverlapKeeper=new Uv,this.shapeOverlapKeeper=new Uv,this.contactmaterials=[],this.contactMaterialTable=new mC,this.defaultMaterial=new $c("default"),this.defaultContactMaterial=new Zc(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(e,t){return this.contactMaterialTable.get(e.id,t.id)}collisionMatrixTick(){const e=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=e,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(e){this.constraints.push(e)}removeConstraint(e){const t=this.constraints.indexOf(e);t!==-1&&this.constraints.splice(t,1)}rayTest(e,t,i){i instanceof Hc?this.raycastClosest(e,t,{skipBackfaces:!0},i):this.raycastAll(e,t,{skipBackfaces:!0},i)}raycastAll(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.ALL,i.from=e,i.to=t,i.callback=s,vd.intersectWorld(this,i)}raycastAny(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.ANY,i.from=e,i.to=t,i.result=s,vd.intersectWorld(this,i)}raycastClosest(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.CLOSEST,i.from=e,i.to=t,i.result=s,vd.intersectWorld(this,i)}addBody(e){this.bodies.includes(e)||(e.index=this.bodies.length,this.bodies.push(e),e.world=this,e.initPosition.copy(e.position),e.initVelocity.copy(e.velocity),e.timeLastSleepy=this.time,e instanceof Ge&&(e.initAngularVelocity.copy(e.angularVelocity),e.initQuaternion.copy(e.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=e,this.idToBodyMap[e.id]=e,this.dispatchEvent(this.addBodyEvent))}removeBody(e){e.world=null;const t=this.bodies.length-1,i=this.bodies,s=i.indexOf(e);if(s!==-1){i.splice(s,1);for(let o=0;o!==i.length;o++)i[o].index=o;this.collisionMatrix.setNumObjects(t),this.removeBodyEvent.body=e,delete this.idToBodyMap[e.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(e){return this.idToBodyMap[e]}getShapeById(e){const t=this.bodies;for(let i=0;i<t.length;i++){const s=t[i].shapes;for(let o=0;o<s.length;o++){const c=s[o];if(c.id===e)return c}}return null}addContactMaterial(e){this.contactmaterials.push(e),this.contactMaterialTable.set(e.materials[0].id,e.materials[1].id,e)}removeContactMaterial(e){const t=this.contactmaterials.indexOf(e);t!==-1&&(this.contactmaterials.splice(t,1),this.contactMaterialTable.delete(e.materials[0].id,e.materials[1].id))}fixedStep(e,t){e===void 0&&(e=1/60),t===void 0&&(t=10);const i=hn.now()/1e3;if(!this.lastCallTime)this.step(e,void 0,t);else{const s=i-this.lastCallTime;this.step(e,s,t)}this.lastCallTime=i}step(e,t,i){if(i===void 0&&(i=10),t===void 0)this.internalStep(e),this.time+=e;else{this.accumulator+=t;const s=hn.now();let o=0;for(;this.accumulator>=e&&o<i&&(this.internalStep(e),this.accumulator-=e,o++,!(hn.now()-s>e*1e3)););this.accumulator=this.accumulator%e;const c=this.accumulator/e;for(let u=0;u!==this.bodies.length;u++){const d=this.bodies[u];d.previousPosition.lerp(d.position,c,d.interpolatedPosition),d.previousQuaternion.slerp(d.quaternion,c,d.interpolatedQuaternion),d.previousQuaternion.normalize()}this.time+=t}}internalStep(e){this.dt=e;const t=this.contacts,i=SC,s=MC,o=this.bodies.length,c=this.bodies,u=this.solver,d=this.gravity,f=this.doProfiling,p=this.profile,v=Ge.DYNAMIC;let m=-1/0;const x=this.constraints,S=yC;d.length();const E=d.x,y=d.y,_=d.z;let w=0;for(f&&(m=hn.now()),w=0;w!==o;w++){const k=c[w];if(k.type===v){const j=k.force,X=k.mass;j.x+=X*E,j.y+=X*y,j.z+=X*_}}for(let k=0,j=this.subsystems.length;k!==j;k++)this.subsystems[k].update();f&&(m=hn.now()),i.length=0,s.length=0,this.broadphase.collisionPairs(this,i,s),f&&(p.broadphase=hn.now()-m);let A=x.length;for(w=0;w!==A;w++){const k=x[w];if(!k.collideConnected)for(let j=i.length-1;j>=0;j-=1)(k.bodyA===i[j]&&k.bodyB===s[j]||k.bodyB===i[j]&&k.bodyA===s[j])&&(i.splice(j,1),s.splice(j,1))}this.collisionMatrixTick(),f&&(m=hn.now());const T=xC,U=t.length;for(w=0;w!==U;w++)T.push(t[w]);t.length=0;const N=this.frictionEquations.length;for(w=0;w!==N;w++)S.push(this.frictionEquations[w]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(i,s,this,t,T,this.frictionEquations,S),f&&(p.narrowphase=hn.now()-m),f&&(m=hn.now()),w=0;w<this.frictionEquations.length;w++)u.addEquation(this.frictionEquations[w]);const D=t.length;for(let k=0;k!==D;k++){const j=t[k],X=j.bi,W=j.bj,ie=j.si,H=j.sj;let q;if(X.material&&W.material?q=this.getContactMaterial(X.material,W.material)||this.defaultContactMaterial:q=this.defaultContactMaterial,q.friction,X.material&&W.material&&(X.material.friction>=0&&W.material.friction>=0&&X.material.friction*W.material.friction,X.material.restitution>=0&&W.material.restitution>=0&&(j.restitution=X.material.restitution*W.material.restitution)),u.addEquation(j),X.allowSleep&&X.type===Ge.DYNAMIC&&X.sleepState===Ge.SLEEPING&&W.sleepState===Ge.AWAKE&&W.type!==Ge.STATIC){const oe=W.velocity.lengthSquared()+W.angularVelocity.lengthSquared(),G=W.sleepSpeedLimit**2;oe>=G*2&&(X.wakeUpAfterNarrowphase=!0)}if(W.allowSleep&&W.type===Ge.DYNAMIC&&W.sleepState===Ge.SLEEPING&&X.sleepState===Ge.AWAKE&&X.type!==Ge.STATIC){const oe=X.velocity.lengthSquared()+X.angularVelocity.lengthSquared(),G=X.sleepSpeedLimit**2;oe>=G*2&&(W.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(X,W,!0),this.collisionMatrixPrevious.get(X,W)||(Aa.body=W,Aa.contact=j,X.dispatchEvent(Aa),Aa.body=X,W.dispatchEvent(Aa)),this.bodyOverlapKeeper.set(X.id,W.id),this.shapeOverlapKeeper.set(ie.id,H.id)}for(this.emitContactEvents(),f&&(p.makeContactConstraints=hn.now()-m,m=hn.now()),w=0;w!==o;w++){const k=c[w];k.wakeUpAfterNarrowphase&&(k.wakeUp(),k.wakeUpAfterNarrowphase=!1)}for(A=x.length,w=0;w!==A;w++){const k=x[w];k.update();for(let j=0,X=k.equations.length;j!==X;j++){const W=k.equations[j];u.addEquation(W)}}u.solve(e,this),f&&(p.solve=hn.now()-m),u.removeAllEquations();const z=Math.pow;for(w=0;w!==o;w++){const k=c[w];if(k.type&v){const j=z(1-k.linearDamping,e),X=k.velocity;X.scale(j,X);const W=k.angularVelocity;if(W){const ie=z(1-k.angularDamping,e);W.scale(ie,W)}}}this.dispatchEvent(_C),f&&(m=hn.now());const C=this.stepnumber%(this.quatNormalizeSkip+1)===0,B=this.quatNormalizeFast;for(w=0;w!==o;w++)c[w].integrate(e,C,B);this.clearForces(),this.broadphase.dirty=!0,f&&(p.integrate=hn.now()-m),this.stepnumber+=1,this.dispatchEvent(vC);let O=!0;if(this.allowSleep)for(O=!1,w=0;w!==o;w++){const k=c[w];k.sleepTick(this.time),k.sleepState!==Ge.SLEEPING&&(O=!0)}this.hasActiveBodies=O}emitContactEvents(){const e=this.hasAnyEventListener("beginContact"),t=this.hasAnyEventListener("endContact");if((e||t)&&this.bodyOverlapKeeper.getDiff(cr,ur),e){for(let o=0,c=cr.length;o<c;o+=2)Ca.bodyA=this.getBodyById(cr[o]),Ca.bodyB=this.getBodyById(cr[o+1]),this.dispatchEvent(Ca);Ca.bodyA=Ca.bodyB=null}if(t){for(let o=0,c=ur.length;o<c;o+=2)Ra.bodyA=this.getBodyById(ur[o]),Ra.bodyB=this.getBodyById(ur[o+1]),this.dispatchEvent(Ra);Ra.bodyA=Ra.bodyB=null}cr.length=ur.length=0;const i=this.hasAnyEventListener("beginShapeContact"),s=this.hasAnyEventListener("endShapeContact");if((i||s)&&this.shapeOverlapKeeper.getDiff(cr,ur),i){for(let o=0,c=cr.length;o<c;o+=2){const u=this.getShapeById(cr[o]),d=this.getShapeById(cr[o+1]);hr.shapeA=u,hr.shapeB=d,u&&(hr.bodyA=u.body),d&&(hr.bodyB=d.body),this.dispatchEvent(hr)}hr.bodyA=hr.bodyB=hr.shapeA=hr.shapeB=null}if(s){for(let o=0,c=ur.length;o<c;o+=2){const u=this.getShapeById(ur[o]),d=this.getShapeById(ur[o+1]);dr.shapeA=u,dr.shapeB=d,u&&(dr.bodyA=u.body),d&&(dr.bodyB=d.body),this.dispatchEvent(dr)}dr.bodyA=dr.bodyB=dr.shapeA=dr.shapeB=null}}clearForces(){const e=this.bodies,t=e.length;for(let i=0;i!==t;i++){const s=e[i];s.force,s.torque,s.force.set(0,0,0),s.torque.set(0,0,0)}}}new oi;const vd=new rn,hn=globalThis.performance||{};if(!hn.now){let a=Date.now();hn.timing&&hn.timing.navigationStart&&(a=hn.timing.navigationStart),hn.now=()=>Date.now()-a}new P;const vC={type:"postStep"},_C={type:"preStep"},Aa={type:Ge.COLLIDE_EVENT_NAME,body:null,contact:null},xC=[],yC=[],SC=[],MC=[],cr=[],ur=[],Ca={type:"beginContact",bodyA:null,bodyB:null},Ra={type:"endContact",bodyA:null,bodyB:null},hr={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},dr={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},ys=new $,Ss=new Ln,zv=new si(0,0,0,"YXZ");class EC{constructor(){Ie(this,"world",new gC({gravity:new P(0,-9.82,0)}));Ie(this,"bodies",new Map);Ie(this,"ground",null)}rebuild(e){this.clear(),this.ensureGround(),e.traverse(t=>{if(!t.meshRenderer.enabled)return;this.halfExtents(t.meshRenderer.primitive,t.meshRenderer.size);const i=new Ba(new P(ys.x,ys.y,ys.z)),s=t.meshRenderer.primitive==="plane"?0:1,o=new Ge({mass:s});o.addShape(i);const c=t.transform.localPosition,u=t.transform.localRotation;o.position.set(c.x,c.y,c.z),Ss.setFromEuler(u),o.quaternion.set(Ss.x,Ss.y,Ss.z,Ss.w),this.world.addBody(o),this.bodies.set(t.id,o)})}step(e){this.world.step(1/60,e,3)}syncTransforms(e){for(const[t,i]of this.bodies){const s=e.getObject(t);s&&(s.transform.localPosition.set(i.position.x,i.position.y,i.position.z),Ss.set(i.quaternion.x,i.quaternion.y,i.quaternion.z,i.quaternion.w),zv.setFromQuaternion(Ss,"YXZ"),s.transform.localRotation.copy(zv))}}clear(){for(const e of this.bodies.values())this.world.removeBody(e);this.bodies.clear(),this.ground&&(this.world.removeBody(this.ground),this.ground=null)}ensureGround(){const e=new Ge({mass:0});e.addShape(new Ba(new P(50,.05,50))),e.position.set(0,-.05,0),this.world.addBody(e),this.ground=e}halfExtents(e,t){const i=Math.max(.05,t);if(ys.set(i/2,i/2,i/2),e==="sphere"){const s=i*.55;ys.set(s,s,s)}else e==="cylinder"?ys.set(i*.45,i/2,i*.45):e==="plane"&&ys.set(i*2,.05,i*2)}}function wC(a,e,t){const i=new Function("api","dt",t),s=a.script;if(!s)return;const o=s.onUpdate.bind(s);s.onUpdate=(c,u,d)=>{o(c,u,d),i({log:(...p)=>console.log("[Script]",...p),setColor(p){u.meshRenderer.color=p,e.notifyMaterialsDirty()},spin(p){u.transform.localRotation.y+=p*c}},c)}}function TC(){return{mode:"standard",mapDataUrl:null,tilingU:1,tilingV:1,offsetU:0,offsetV:0,rotation:0,proceduralPreset:"grass",shaderId:"basicColor"}}class AC{constructor(){Ie(this,"enabled",!0);Ie(this,"primitive","box");Ie(this,"color","#6b8cff");Ie(this,"size",1);Ie(this,"surface",TC())}}class CC{constructor(){Ie(this,"localPosition",new $);Ie(this,"localRotation",new si(0,0,0,"YXZ"));Ie(this,"localScale",new $(1,1,1))}copyFrom(e){this.localPosition.copy(e.localPosition),this.localRotation.copy(e.localRotation),this.localScale.copy(e.localScale)}}let Ov=0;function RC(a="Object"){return Ov+=1,`${a}_${Ov}`}class bf{constructor(e,t){Ie(this,"id");Ie(this,"name");Ie(this,"transform",new CC);Ie(this,"meshRenderer");Ie(this,"script");Ie(this,"parent",null);Ie(this,"children",[]);this.id=t??RC("GameObject"),this.name=e??"GameObject",this.meshRenderer=new AC}getPath(){const e=[];let t=this;for(;t;)e.unshift(t.name),t=t.parent;return e.join(" / ")}}class Vc{constructor(){Ie(this,"enabled",!0);Ie(this,"userSource")}onUpdate(e,t,i){}}class F0{constructor(){Ie(this,"roots",[]);Ie(this,"index",new Map);Ie(this,"listeners",new Set)}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(){for(const e of this.listeners)e()}getRoots(){return this.roots}getObject(e){return this.index.get(e)}createPrimitive(e,t,i=null){const s=new bf(e);return s.meshRenderer.primitive=t,this.register(s),this.setParent(s,i),this.emit(),s}register(e){if(this.index.has(e.id))throw new Error(`GameObject ${e.id} is already registered`);this.index.set(e.id,e),!e.parent&&!this.roots.includes(e)&&this.roots.push(e),this.emit()}destroy(e){if(!this.index.has(e.id))return;const t=[...e.children];for(const i of t)this.setParent(i,e.parent);this.setParent(e,null),this.roots.splice(this.roots.indexOf(e),1),this.index.delete(e.id),this.emit()}setParent(e,t){if(!this.index.has(e.id))throw new Error(`Unknown GameObject ${e.id}`);if(t&&!this.index.has(t.id))throw new Error(`Unknown parent GameObject ${t.id}`);if(t&&this.isDescendant(t,e))throw new Error("Cannot parent an object to one of its descendants");if(e.parent){const i=e.parent.children;i.splice(i.indexOf(e),1)}else{const i=this.roots.indexOf(e);i>=0&&this.roots.splice(i,1)}e.parent=t,t?t.children.push(e):this.roots.includes(e)||this.roots.push(e),this.emit()}isDescendant(e,t){let i=t.parent;for(;i;){if(i.id===e.id)return!0;i=i.parent}return!1}traverse(e){const t=i=>{e(i);for(const s of i.children)t(s)};for(const i of this.roots)t(i)}attachDemoSpinner(e){const t=new Vc;t.onUpdate=(i,s)=>{s.transform.localRotation.y+=i*.9},e.script=t,this.emit()}cloneMeshAndScriptFrom(e,t){if(t.meshRenderer.enabled=e.meshRenderer.enabled,t.meshRenderer.primitive=e.meshRenderer.primitive,t.meshRenderer.color=e.meshRenderer.color,t.meshRenderer.size=e.meshRenderer.size,t.meshRenderer.surface={...e.meshRenderer.surface},e.script){const i=new Vc;i.enabled=e.script.enabled,i.userSource=e.script.userSource,i.onUpdate=(s,o,c)=>e.script.onUpdate(s,o,c),t.script=i}else t.script=void 0;this.emit()}}function bC(a){const e=new F0,t=s=>{const o=new bf(s.name,s.id);if(o.transform.copyFrom(s.transform),PC(s.meshRenderer,o.meshRenderer),s.script){const c=new Vc;c.enabled=s.script.enabled,c.userSource=s.script.userSource,c.onUpdate=(u,d,f)=>s.script.onUpdate(u,d,f),o.script=c}return o},i=(s,o)=>{const c=t(s);e.register(c),e.setParent(c,o);for(const u of s.children)i(u,c)};for(const s of a.getRoots())i(s,null);return e}function PC(a,e){e.enabled=a.enabled,e.primitive=a.primitive,e.color=a.color,e.size=a.size,e.surface={...a.surface}}class LC{constructor(){Ie(this,"raycaster",new Tf);Ie(this,"ndc",new Et)}pick(e,t,i,s,o,c){if(o<=0||c<=0)return null;this.ndc.x=i/o*2-1,this.ndc.y=-(s/c)*2+1,this.raycaster.setFromCamera(this.ndc,e);const u=this.raycaster.intersectObject(t,!0);for(const d of u){const f=d.object.userData.gameObjectId;if(f)return f}return null}}class IC{createBuiltIn(e,t){const i=this.getSource(e),s=v0.merge([Re.lights,Re.fog,i.uniforms]);return t&&Object.assign(s,t),new Ni({uniforms:s,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,lights:e!=="basicColor",fog:!0,transparent:e==="water",depthWrite:e!=="water"})}validateGlsl(e,t){try{const i=new Ni({uniforms:{},vertexShader:e,fragmentShader:t});return i.needsUpdate=!0,{ok:!0}}catch(i){return{ok:!1,message:i instanceof Error?i.message:String(i)}}}getSource(e){switch(e){case"water":return FC;case"glow":return zC;case"pbrLite":return UC;case"texturedLit":return DC;case"basicColor":default:return NC}}}const NC={uniforms:{uColor:{value:new at(7048447)},uTime:{value:0}},vertexShader:`
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vPosition;
    void main() {
      float pulse = 0.08 * sin(uTime * 3.0 + vPosition.y * 4.0);
      gl_FragColor = vec4(uColor + pulse, 1.0);
    }
  `},DC={uniforms:{uMap:{value:null},uTime:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D uMap;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv + 0.02 * vec2(sin(uTime + vUv.y * 6.0), cos(uTime + vUv.x * 6.0));
      vec4 tex = texture2D(uMap, uv);
      gl_FragColor = tex;
    }
  `},UC={uniforms:{uBaseColor:{value:new at(11184810)},uLightDir:{value:new $(.4,.85,.35).normalize()},uTime:{value:0}},vertexShader:`
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,fragmentShader:`
    uniform vec3 uBaseColor;
    uniform vec3 uLightDir;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vView);
      float wrap = 0.35;
      float ndl = max(0.0, (dot(N, normalize(uLightDir)) + wrap) / (1.0 + wrap));
      float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
      vec3 col = uBaseColor * (0.15 + 0.85 * ndl) + vec3(0.2, 0.45, 1.0) * rim * 0.35;
      col += 0.05 * sin(uTime * 2.0 + N.y * 5.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `},FC={uniforms:{uTime:{value:0},uDeep:{value:new at(797266)},uShallow:{value:new at(3844095)}},vertexShader:`
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += 0.08 * sin(uTime * 2.0 + p.x * 6.0) * cos(uTime * 1.4 + p.y * 5.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,fragmentShader:`
    uniform float uTime;
    uniform vec3 uDeep;
    uniform vec3 uShallow;
    varying vec2 vUv;
    void main() {
      float t = 0.5 + 0.5 * sin(uTime * 1.2 + vUv.x * 20.0 + vUv.y * 18.0);
      vec3 col = mix(uDeep, uShallow, t);
      gl_FragColor = vec4(col, 0.85);
    }
  `},zC={uniforms:{uColor:{value:new at(6750156)},uTime:{value:0}},vertexShader:`
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vNormal;
    void main() {
      float pulse = 0.5 + 0.5 * sin(uTime * 4.0);
      vec3 emissive = uColor * (1.2 + pulse);
      gl_FragColor = vec4(emissive, 1.0);
    }
  `};class OC{constructor(){Ie(this,"resolution",48);Ie(this,"worldSize",36);Ie(this,"heights");Ie(this,"splat");Ie(this,"mesh");Ie(this,"biome","forest");const e=this.resolution*this.resolution;this.heights=new Float32Array(e),this.splat=new Uint8Array(e),this.mesh=new Fe(new Sn,new af({vertexColors:!0,flatShading:!1})),this.mesh.receiveShadow=!0,this.mesh.castShadow=!1,this.mesh.name="Terrain",this.flattenHeights(0)}flattenHeights(e){this.heights.fill(e),this.rebuildMesh()}generateNoise(e,t,i,s){this.biome=s;const o=this.resolution,c=Math.max(1e-4,t);for(let u=0;u<o;u+=1)for(let d=0;d<o;d+=1){const f=d/o,p=u/o,v=Dc(f*i,p*i,s.length*131),m=(v-.5)*2*e;this.heights[u*o+d]=m/c,this.splat[u*o+d]=v>.62?2:v<.35?1:0}this.rebuildMesh()}applyBrush(e,t,i,s,o,c){const u=this.worldSize/2,d=this.resolution;for(let f=0;f<d;f+=1)for(let p=0;p<d;p+=1){const v=p/(d-1)*this.worldSize-u,m=f/(d-1)*this.worldSize-u,x=v-e,S=m-t,E=Math.sqrt(x*x+S*S);if(E>i)continue;const y=1-E/i,_=f*d+p;o==="raise"&&(this.heights[_]+=s*y*.08),o==="lower"&&(this.heights[_]-=s*y*.08),o==="flatten"&&(this.heights[_]+=(c-this.heights[_])*s*y*.15)}this.rebuildMesh()}paintSplat(e,t,i,s){const o=this.worldSize/2,c=this.resolution;for(let u=0;u<c;u+=1)for(let d=0;d<c;d+=1){const f=d/(c-1)*this.worldSize-o,p=u/(c-1)*this.worldSize-o,v=f-e,m=p-t;Math.sqrt(v*v+m*m)<=i&&(this.splat[u*c+d]=s)}this.rebuildMesh()}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}rebuildMesh(){const e=this.resolution,t=this.worldSize/2,i=e*e,s=new Float32Array(i*3),o=new Float32Array(i*3),c=[],u=this.biome==="desert"?new at(13608555):this.biome==="snow"?new at(14150911):new at(5214038);for(let f=0;f<e;f+=1)for(let p=0;p<e;p+=1){const v=f*e+p,m=p/(e-1)*this.worldSize-t,x=f/(e-1)*this.worldSize-t,S=this.heights[v],E=v*3;s[E+0]=m,s[E+1]=S,s[E+2]=x;const y=this.splat[v]===1?new at(14467216):this.splat[v]===2?new at(7304837):u.clone();o[E+0]=y.r,o[E+1]=y.g,o[E+2]=y.b}for(let f=0;f<e-1;f+=1)for(let p=0;p<e-1;p+=1){const v=f*e+p,m=v+1,x=v+e,S=x+1;c.push(v,x,m,m,x,S)}const d=new Sn;d.setAttribute("position",new Qn(s,3)),d.setAttribute("color",new Qn(o,3)),d.setIndex(c),d.computeVertexNormals(),this.mesh.geometry.dispose(),this.mesh.geometry=d}}class BC{constructor(){Ie(this,"sceneGraph",new F0);Ie(this,"runtimeGraph",null);Ie(this,"scene",new P1);Ie(this,"camera");Ie(this,"renderer");Ie(this,"flyController");Ie(this,"selectionResolver",new LC);Ie(this,"terrainRaycaster",new Tf);Ie(this,"terrainNdc",new Et);Ie(this,"shaderManager",new IC);Ie(this,"physics",new EC);Ie(this,"terrain",new OC);Ie(this,"gizmo",null);Ie(this,"gizmoDragging",!1);Ie(this,"clock",new H1);Ie(this,"totalTime",0);Ie(this,"sceneRoot",new wo);Ie(this,"groups",new Map);Ie(this,"meshes",new Map);Ie(this,"playMode",!1);Ie(this,"disposers",[]);Ie(this,"selectionHelper",null);Ie(this,"selectedId",null);Ie(this,"sun");Ie(this,"ambient");Ie(this,"onMaterialDirty");this.scene.background=new at(1184794),this.scene.add(this.sceneRoot),this.scene.add(this.terrain.mesh),this.camera=new gi(60,1,.1,500),this.camera.position.set(4,3,6),this.renderer=new b1({antialias:!0,alpha:!1}),this.renderer.outputColorSpace=Bn,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.sun=new B1(16777215,1.1),this.sun.position.set(3,6,4),this.sun.castShadow=!0,this.scene.add(this.sun),this.ambient=new k1(16777215,.35),this.scene.add(this.ambient),this.flyController=new W1(this.camera),this.flyController.yaw=-.7,this.flyController.pitch=-.35,this.camera.rotation.order="YXZ",this.camera.rotation.y=this.flyController.yaw,this.camera.rotation.x=this.flyController.pitch}mount(e){e.innerHTML="",e.appendChild(this.renderer.domElement),this.renderer.setSize(e.clientWidth,e.clientHeight,!1),this.camera.aspect=e.clientWidth/Math.max(e.clientHeight,1),this.camera.updateProjectionMatrix();const t=new ResizeObserver(()=>{const i=e.clientWidth,s=Math.max(e.clientHeight,1);this.renderer.setSize(i,s,!1),this.camera.aspect=i/s,this.camera.updateProjectionMatrix()});t.observe(e),this.disposers.push(()=>t.disconnect())}dispose(){for(const e of this.disposers)e();this.disposers=[],this.renderer.dispose();for(const e of this.meshes.values())e.mesh.geometry.dispose(),e.material.dispose();this.meshes.clear(),this.groups.clear(),this.terrain.dispose()}notifyMaterialsDirty(){var e;(e=this.onMaterialDirty)==null||e.call(this)}setMaterialDirtyNotifier(e){this.onMaterialDirty=e,kc.setNotifier(e)}setGizmoDragging(e){this.gizmoDragging=e}setSelectedId(e){this.selectedId=e,this.refreshSelectionHelper()}getSelectedId(){return this.selectedId}getObjectGroup(e){return this.groups.get(e)}refreshSelectionHelper(){if(this.selectionHelper&&(this.scene.remove(this.selectionHelper),this.selectionHelper.dispose(),this.selectionHelper=null),!this.selectedId)return;const e=this.groups.get(this.selectedId);e&&(this.selectionHelper=new V1(e,3137791),this.scene.add(this.selectionHelper))}setLightingPreset(e){e==="day"?(this.scene.background=new at(10406143),this.sun.intensity=1.1,this.ambient.intensity=.35):(this.scene.background=new at(461330),this.sun.intensity=.35,this.ambient.intensity=.12)}setPlayMode(e){this.playMode=e,this.flyController.setEnabled(!e),!e&&document.pointerLockElement===this.renderer.domElement.parentElement&&document.exitPointerLock(),this.gizmo&&(this.gizmo.controls.enabled=!e)}isPlayMode(){return this.playMode}getActiveGraph(){return this.runtimeGraph??this.sceneGraph}enterPlayMode(){this.runtimeGraph=bC(this.sceneGraph),this.runtimeGraph.traverse(e=>{var i,s;const t=(s=(i=e.script)==null?void 0:i.userSource)==null?void 0:s.trim();t&&wC(e,this,t)}),this.physics.rebuild(this.runtimeGraph),this.setPlayMode(!0)}exitPlayMode(){this.setPlayMode(!1),this.physics.clear(),this.runtimeGraph=null}bootstrapDemoScene(){const e=this.sceneGraph.createPrimitive("Baseplate","plane",null);e.transform.localScale.set(4,4,4),e.meshRenderer.color="#2a2f3a";const t=this.sceneGraph.createPrimitive("Part","box",null);t.transform.localPosition.set(0,.6,0),t.meshRenderer.color="#4a90d9",this.sceneGraph.attachDemoSpinner(t);const i=this.sceneGraph.createPrimitive("Orb","sphere",t);i.transform.localPosition.set(1.1,.9,0),i.meshRenderer.color="#f5a524",i.meshRenderer.size=.45}tick(){const e=Math.min(this.clock.getDelta(),.05);this.totalTime+=e;const t=this.getActiveGraph();if(this.playMode&&this.runtimeGraph&&(this.physics.step(e),this.physics.syncTransforms(this.runtimeGraph)),this.syncSceneGraph(t),this.playMode&&t.traverse(i=>{var s;(s=i.script)!=null&&s.enabled&&i.script.onUpdate(e,i,this)}),this.selectionHelper){const i=this.selectedId?this.groups.get(this.selectedId):null;i&&this.selectionHelper.setFromObject(i)}this.flyController.update(e),this.renderer.render(this.scene,this.camera)}pickFromDomEvent(e,t,i,s){return this.selectionResolver.pick(this.camera,this.sceneRoot,e,t,i,s)}pickTerrainXZ(e,t,i,s){if(i<=0||s<=0)return null;this.terrainNdc.x=e/i*2-1,this.terrainNdc.y=-(t/s)*2+1,this.terrainRaycaster.setFromCamera(this.terrainNdc,this.camera);const o=this.terrainRaycaster.intersectObject(this.terrain.mesh,!1);if(!o.length)return null;const c=o[0].point;return{x:c.x,z:c.z}}syncSceneGraph(e){const t=new Set,i=s=>{t.add(s.id);let o=this.groups.get(s.id);if(o||(o=new wo,o.userData.gameObjectId=s.id,this.groups.set(s.id,o)),this.gizmoDragging&&s.id===this.selectedId||(o.position.copy(s.transform.localPosition),o.rotation.copy(s.transform.localRotation),o.scale.copy(s.transform.localScale)),this.syncMesh(s,o),s.parent){const u=this.groups.get(s.parent.id);u&&o.parent!==u&&u.add(o)}else o.parent!==this.sceneRoot&&this.sceneRoot.add(o);for(const u of s.children)i(u)};for(const s of e.getRoots())i(s);for(const s of[...this.groups.keys()])if(!t.has(s)){this.groups.get(s).removeFromParent(),this.groups.delete(s);const c=this.meshes.get(s);c&&(c.mesh.geometry.dispose(),"map"in c.material&&c.material.map&&(c.material.map=null),c.material.dispose(),this.meshes.delete(s))}}syncMesh(e,t){const i=e.meshRenderer;if(!i.enabled){const u=this.meshes.get(e.id);u&&(t.remove(u.mesh),u.mesh.geometry.dispose(),u.material.dispose(),this.meshes.delete(e.id));return}let s=this.meshes.get(e.id);const o=Uc(i);if((!s||s.primitiveKey!==o)&&s&&(t.remove(s.mesh),s.mesh.geometry.dispose(),"map"in s.material&&s.material.map&&(s.material.map=null),s.material.dispose(),s=void 0),s)s=gv(s.mesh,i,s,this.shaderManager,this.totalTime),this.meshes.set(e.id,s);else{const u=j1.create(i.primitive,i.size),d=new Fe(u);d.castShadow=!0,d.receiveShadow=!0,d.userData.gameObjectId=e.id,t.add(d),s=gv(d,i,void 0,this.shaderManager,this.totalTime),this.meshes.set(e.id,s)}s.mesh.visible=!0}}class kC{constructor(){Ie(this,"savedCamera",null)}start(e){e.isPlayMode()||(this.savedCamera=e.flyController.captureState(),e.enterPlayMode())}stop(e){e.isPlayMode()&&(e.exitPlayMode(),this.savedCamera&&e.flyController.restoreState(this.savedCamera),this.savedCamera=null)}toggle(e){e.isPlayMode()?this.stop(e):this.start(e)}}const Bv=a=>{let e;const t=new Set,i=(f,p)=>{const v=typeof f=="function"?f(e):f;if(!Object.is(v,e)){const m=e;e=p??(typeof v!="object"||v===null)?v:Object.assign({},e,v),t.forEach(x=>x(e,m))}},s=()=>e,u={setState:i,getState:s,getInitialState:()=>d,subscribe:f=>(t.add(f),()=>t.delete(f))},d=e=a(i,s,u);return u},HC=(a=>a?Bv(a):Bv),VC=a=>a;function GC(a,e=VC){const t=La.useSyncExternalStore(a.subscribe,La.useCallback(()=>e(a.getState()),[a,e]),La.useCallback(()=>e(a.getInitialState()),[a,e]));return La.useDebugValue(t),t}const kv=a=>{const e=HC(a),t=i=>GC(e,i);return Object.assign(t,e),t},WC=(a=>a?kv(a):kv),dt=WC(a=>({selectedId:null,isPlaying:!1,sceneRevision:0,gizmoMode:"translate",snapGrid:0,lightingPreset:"day",terrainBrush:"raise",terrainPaintLayer:0,terrainBiome:"forest",terrainBrushRadius:3,terrainBrushStrength:1,setSelectedId:e=>a({selectedId:e}),setPlaying:e=>a({isPlaying:e}),bumpScene:()=>a(e=>({sceneRevision:e.sceneRevision+1})),setGizmoMode:e=>a({gizmoMode:e}),setSnapGrid:e=>a({snapGrid:e}),setLightingPreset:e=>a({lightingPreset:e}),setTerrainBrush:e=>a({terrainBrush:e}),setTerrainPaintLayer:e=>a({terrainPaintLayer:e}),setTerrainBiome:e=>a({terrainBiome:e}),setTerrainBrushRadius:e=>a({terrainBrushRadius:e}),setTerrainBrushStrength:e=>a({terrainBrushStrength:e})})),z0=gt.createContext(null);function jC({children:a}){const e=gt.useMemo(()=>new BC,[]),t=gt.useMemo(()=>new kC,[]);gt.useEffect(()=>{const s=e.sceneGraph.subscribe(()=>{dt.getState().bumpScene()});return e.sceneGraph.getRoots().length===0&&e.bootstrapDemoScene(),dt.getState().bumpScene(),()=>{s()}},[e]);const i=gt.useMemo(()=>({engine:e,playSession:t}),[e,t]);return Y.jsx(z0.Provider,{value:i,children:a})}function ko(){const a=gt.useContext(z0);if(!a)throw new Error("useEngineContext must be used within EngineProvider");return a}function XC(){const{engine:a}=ko(),e=dt(o=>o.selectedId),t=dt(o=>o.setSelectedId),i=dt(o=>o.bumpScene),s=(o,c)=>{const u=e?a.sceneGraph.getObject(e)??null:null,d=a.sceneGraph.createPrimitive(o,c,u);t(d.id),i()};return Y.jsxs("footer",{className:"panel asset-panel",children:[Y.jsxs("div",{className:"panel-header",children:[Y.jsx("span",{children:"Asset Browser"}),Y.jsx("span",{className:"muted tiny",children:"Double-click to insert"})]}),Y.jsx("div",{className:"asset-strip",children:bx.map(o=>Y.jsxs("button",{type:"button",className:"asset-card",onDoubleClick:()=>{o.kind==="primitive"&&o.primitive&&s(o.label,o.primitive)},children:[Y.jsx("div",{className:"asset-thumb",children:o.kind==="texture"&&o.url?Y.jsx("img",{src:o.url,alt:""}):Y.jsx("div",{className:"asset-placeholder",children:o.label[0]})}),Y.jsxs("div",{className:"asset-meta",children:[Y.jsx("div",{className:"asset-title",children:o.label}),Y.jsx("div",{className:"asset-desc",children:o.description})]})]},o.id))})]})}function qC(){const a=dt(c=>c.gizmoMode),e=dt(c=>c.setGizmoMode),t=dt(c=>c.snapGrid),i=dt(c=>c.setSnapGrid),s=dt(c=>c.lightingPreset),o=dt(c=>c.setLightingPreset);return Y.jsxs("div",{className:"build-tools",children:[Y.jsxs("div",{className:"tool-group",children:[Y.jsx("span",{className:"tool-label",children:"Gizmo"}),Y.jsx("button",{type:"button",className:a==="translate"?"tool active":"tool",onClick:()=>e("translate"),children:"Move"}),Y.jsx("button",{type:"button",className:a==="rotate"?"tool active":"tool",onClick:()=>e("rotate"),children:"Rotate"}),Y.jsx("button",{type:"button",className:a==="scale"?"tool active":"tool",onClick:()=>e("scale"),children:"Scale"})]}),Y.jsxs("div",{className:"tool-group",children:[Y.jsx("span",{className:"tool-label",children:"Snap"}),[0,.5,1].map(c=>Y.jsx("button",{type:"button",className:t===c?"tool active":"tool",onClick:()=>i(c),children:c===0?"Off":String(c)},c))]}),Y.jsxs("div",{className:"tool-group",children:[Y.jsx("span",{className:"tool-label",children:"Light"}),Y.jsx("button",{type:"button",className:s==="day"?"tool active":"tool",onClick:()=>o("day"),children:"Day"}),Y.jsx("button",{type:"button",className:s==="night"?"tool active":"tool",onClick:()=>o("night"),children:"Night"})]})]})}function O0({node:a,depth:e,selectedId:t,onSelect:i}){const s=a.id===t;return Y.jsxs("div",{className:"hierarchy-node",children:[Y.jsxs("button",{type:"button",className:s?"hierarchy-row selected":"hierarchy-row",style:{paddingLeft:8+e*14},onClick:()=>i(a.id),children:[Y.jsx("span",{className:"hierarchy-chevron",children:a.children.length?"▾":"·"}),Y.jsx("span",{className:"hierarchy-name",children:a.name}),Y.jsx("span",{className:"hierarchy-type",children:a.meshRenderer.primitive})]}),a.children.map(o=>Y.jsx(O0,{node:o,depth:e+1,selectedId:t,onSelect:i},o.id))]})}function YC(){const{engine:a}=ko(),e=dt(d=>d.selectedId),t=dt(d=>d.setSelectedId),i=dt(d=>d.sceneRevision),s=dt(d=>d.bumpScene),o=gt.useMemo(()=>[...a.sceneGraph.getRoots()],[a,i]),c=()=>{if(!e)return;const d=a.sceneGraph.getObject(e);d&&(a.sceneGraph.destroy(d),t(null),s())},u=()=>{const d=e?a.sceneGraph.getObject(e)??null:null,f=a.sceneGraph.createPrimitive("Part","box",d);t(f.id),s()};return Y.jsxs("aside",{className:"panel hierarchy-panel",children:[Y.jsxs("div",{className:"panel-header",children:[Y.jsx("span",{children:"Hierarchy"}),Y.jsxs("div",{className:"panel-header-actions",children:[Y.jsx("button",{type:"button",className:"ghost",onClick:u,children:"+ Part"}),Y.jsx("button",{type:"button",className:"ghost danger",onClick:c,disabled:!e,children:"Delete"})]})]}),Y.jsx("div",{className:"panel-body scrollable",children:o.map(d=>Y.jsx(O0,{node:d,depth:0,selectedId:e,onSelect:t},d.id))})]})}const ZC=["box","sphere","cylinder","plane"];function $C(){const{engine:a}=ko(),e=dt(q=>q.selectedId),t=dt(q=>q.sceneRevision),i=dt(q=>q.bumpScene),s=e?a.sceneGraph.getObject(e):void 0,[o,c]=gt.useState(""),[u,d]=gt.useState(0),[f,p]=gt.useState(0),[v,m]=gt.useState(0),[x,S]=gt.useState(0),[E,y]=gt.useState(0),[_,w]=gt.useState(0),[A,T]=gt.useState(1),[U,N]=gt.useState(1),[D,z]=gt.useState(1),[b,C]=gt.useState("#ffffff"),[B,O]=gt.useState("box"),[k,j]=gt.useState(!0),[X,W]=gt.useState(!1);gt.useEffect(()=>{var q;if(!s){c("");return}c(s.name),d(s.transform.localPosition.x),p(s.transform.localPosition.y),m(s.transform.localPosition.z),S(s.transform.localRotation.x),y(s.transform.localRotation.y),w(s.transform.localRotation.z),T(s.transform.localScale.x),N(s.transform.localScale.y),z(s.transform.localScale.z),C(s.meshRenderer.color),O(s.meshRenderer.primitive),j(s.meshRenderer.enabled),W(!!((q=s.script)!=null&&q.enabled))},[s,t,e]);const ie=()=>{s&&(s.name=o.trim()||s.name,s.transform.localPosition.set(u,f,v),s.transform.localRotation.set(x,E,_,"YXZ"),s.transform.localScale.set(A,U,D),i())},H=()=>{s&&(s.meshRenderer.color=b,s.meshRenderer.primitive=B,s.meshRenderer.enabled=k,i())};return Y.jsxs("aside",{className:"panel inspector-panel",children:[Y.jsx("div",{className:"panel-header",children:Y.jsx("span",{children:"Properties"})}),Y.jsxs("div",{className:"panel-body scrollable",children:[!s&&Y.jsx("p",{className:"muted",children:"Select an object to edit its components."}),s&&Y.jsxs("div",{className:"inspector-sections",children:[Y.jsxs("section",{children:[Y.jsx("h3",{children:"GameObject"}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Name"}),Y.jsx("input",{value:o,onChange:q=>c(q.target.value),onBlur:ie})]}),Y.jsx("p",{className:"muted tiny",children:s.getPath()})]}),Y.jsxs("section",{children:[Y.jsx("h3",{children:"Transform"}),Y.jsxs("div",{className:"vec3-grid",children:[Y.jsxs("label",{children:["Pos X",Y.jsx("input",{type:"number",step:"0.01",value:u,onChange:q=>d(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Pos Y",Y.jsx("input",{type:"number",step:"0.01",value:f,onChange:q=>p(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Pos Z",Y.jsx("input",{type:"number",step:"0.01",value:v,onChange:q=>m(Number(q.target.value)),onBlur:ie})]})]}),Y.jsxs("div",{className:"vec3-grid",children:[Y.jsxs("label",{children:["Rot X",Y.jsx("input",{type:"number",step:"0.01",value:x,onChange:q=>S(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Rot Y",Y.jsx("input",{type:"number",step:"0.01",value:E,onChange:q=>y(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Rot Z",Y.jsx("input",{type:"number",step:"0.01",value:_,onChange:q=>w(Number(q.target.value)),onBlur:ie})]})]}),Y.jsxs("div",{className:"vec3-grid",children:[Y.jsxs("label",{children:["Scale X",Y.jsx("input",{type:"number",step:"0.01",value:A,onChange:q=>T(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Scale Y",Y.jsx("input",{type:"number",step:"0.01",value:U,onChange:q=>N(Number(q.target.value)),onBlur:ie})]}),Y.jsxs("label",{children:["Scale Z",Y.jsx("input",{type:"number",step:"0.01",value:D,onChange:q=>z(Number(q.target.value)),onBlur:ie})]})]})]}),Y.jsxs("section",{children:[Y.jsx("h3",{children:"MeshRenderer"}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Primitive"}),Y.jsx("select",{value:B,onChange:q=>{const oe=q.target.value;O(oe),s&&(s.meshRenderer.primitive=oe,s.meshRenderer.color=b,s.meshRenderer.enabled=k,i())},children:ZC.map(q=>Y.jsx("option",{value:q,children:q},q))})]}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Color"}),Y.jsx("input",{type:"color",value:b,onChange:q=>C(q.target.value),onBlur:H})]}),Y.jsxs("label",{className:"field checkbox",children:[Y.jsx("input",{type:"checkbox",checked:k,onChange:q=>{j(q.target.checked),s&&(s.meshRenderer.enabled=q.target.checked,i())}}),Y.jsx("span",{children:"Enabled"})]})]}),Y.jsxs("section",{children:[Y.jsx("h3",{children:"Script"}),Y.jsx("p",{className:"muted tiny",children:"Demo script rotates the object while Play mode is active."}),Y.jsxs("label",{className:"field checkbox",children:[Y.jsx("input",{type:"checkbox",checked:X,onChange:q=>{const oe=q.target.checked;W(oe),s&&(oe?s.script?s.script.enabled=!0:a.sceneGraph.attachDemoSpinner(s):s.script&&(s.script.enabled=!1),i())}}),Y.jsx("span",{children:"Run demo script"})]})]})]})]})]})}function KC(a){const e=[];return a.sceneGraph.traverse(t=>{var i,s;e.push({id:t.id,name:t.name,parentId:((i=t.parent)==null?void 0:i.id)??null,position:[t.transform.localPosition.x,t.transform.localPosition.y,t.transform.localPosition.z],rotation:[t.transform.localRotation.x,t.transform.localRotation.y,t.transform.localRotation.z],scale:[t.transform.localScale.x,t.transform.localScale.y,t.transform.localScale.z],mesh:{enabled:t.meshRenderer.enabled,primitive:t.meshRenderer.primitive,color:t.meshRenderer.color,size:t.meshRenderer.size,surface:{...t.meshRenderer.surface}},scriptUser:(s=t.script)==null?void 0:s.userSource})}),{version:1,objects:e,terrain:{resolution:a.terrain.resolution,worldSize:a.terrain.worldSize,heights:Array.from(a.terrain.heights),splat:Array.from(a.terrain.splat),biome:a.terrain.biome}}}function QC(a,e="pixel-studio-project.json"){const t=KC(a),i=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),s=URL.createObjectURL(i),o=document.createElement("a");o.href=s,o.download=e,o.click(),URL.revokeObjectURL(s)}const JC=["grass","stone","sand","metal","noise"],eR=["basicColor","texturedLit","pbrLite","water","glow"];function tR(){var B;const{engine:a}=ko(),e=dt(O=>O.selectedId),t=dt(O=>O.bumpScene),i=dt(O=>O.sceneRevision),s=dt(O=>O.terrainBrush),o=dt(O=>O.setTerrainBrush),c=dt(O=>O.terrainPaintLayer),u=dt(O=>O.setTerrainPaintLayer),d=dt(O=>O.terrainBiome),f=dt(O=>O.setTerrainBiome),p=dt(O=>O.terrainBrushRadius),v=dt(O=>O.setTerrainBrushRadius),m=dt(O=>O.terrainBrushStrength),x=dt(O=>O.setTerrainBrushStrength),S=gt.useMemo(()=>e?a.sceneGraph.getObject(e):void 0,[a,e,i]),[E,y]=gt.useState("material"),[_,w]=gt.useState("void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"),[A,T]=gt.useState("void main() { gl_FragColor = vec4(1.0,0.2,0.5,1.0); }"),[U,N]=gt.useState(null),D=gt.useRef(null),z=O=>{S&&(S.meshRenderer.surface.mode="shader",S.meshRenderer.surface.shaderId=O,t())},b=()=>{const O=a.shaderManager.validateGlsl(_,A);N(O.ok?null:O.message)},C=()=>{for(let j=0;j<40;j+=1){if(Math.random()>.35)continue;const X=a.sceneGraph.createPrimitive("Tree","cylinder",null),W=(Math.random()-.5)*14,ie=(Math.random()-.5)*14,H=.75+Math.random()*.2;X.transform.localPosition.set(W,H,ie),X.transform.localScale.set(.35,1.2+Math.random(),.35),X.meshRenderer.color="#2d6b3d"}for(let j=0;j<25;j+=1){if(Math.random()>.45)continue;const X=a.sceneGraph.createPrimitive("Rock","sphere",null);X.transform.localPosition.set((Math.random()-.5)*14,.35,(Math.random()-.5)*14),X.meshRenderer.size=.4+Math.random()*.3,X.meshRenderer.color="#6b6f78"}t()};return Y.jsxs("div",{className:"panel studio-tools",children:[Y.jsxs("div",{className:"panel-header",children:[Y.jsx("span",{children:"Studio Tools"}),Y.jsx("button",{type:"button",className:"ghost",onClick:()=>QC(a),children:"Save JSON"})]}),Y.jsx("div",{className:"studio-tabs",children:["material","terrain","shader","code","world"].map(O=>Y.jsx("button",{type:"button",className:E===O?"tab active":"tab",onClick:()=>y(O),children:O},O))}),Y.jsxs("div",{className:"panel-body scrollable tools-body",children:[E==="material"&&Y.jsxs("section",{children:[Y.jsx("h3",{children:"Surface"}),!S&&Y.jsx("p",{className:"muted tiny",children:"Select an object to edit materials."}),S&&Y.jsxs(Y.Fragment,{children:[Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Mode"}),Y.jsxs("select",{value:S.meshRenderer.surface.mode,onChange:O=>{S.meshRenderer.surface.mode=O.target.value,t()},children:[Y.jsx("option",{value:"standard",children:"Color / texture"}),Y.jsx("option",{value:"procedural",children:"Procedural"}),Y.jsx("option",{value:"shader",children:"Shader template"})]})]}),S.meshRenderer.surface.mode==="procedural"&&Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Preset"}),Y.jsx("select",{value:S.meshRenderer.surface.proceduralPreset,onChange:O=>{S.meshRenderer.surface.proceduralPreset=O.target.value,t()},children:JC.map(O=>Y.jsx("option",{value:O,children:O},O))})]}),S.meshRenderer.surface.mode==="standard"&&Y.jsxs(Y.Fragment,{children:[Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Image texture"}),Y.jsx("input",{ref:D,type:"file",accept:"image/*",onChange:O=>{var X;const k=(X=O.target.files)==null?void 0:X[0];if(!k||!S)return;const j=new FileReader;j.onload=()=>{S.meshRenderer.surface.mapDataUrl=String(j.result),t()},j.readAsDataURL(k)}})]}),Y.jsxs("div",{className:"vec3-grid",children:[Y.jsxs("label",{children:["Tile U",Y.jsx("input",{type:"number",step:"0.1",value:S.meshRenderer.surface.tilingU,onChange:O=>{S.meshRenderer.surface.tilingU=Number(O.target.value),t()}})]}),Y.jsxs("label",{children:["Tile V",Y.jsx("input",{type:"number",step:"0.1",value:S.meshRenderer.surface.tilingV,onChange:O=>{S.meshRenderer.surface.tilingV=Number(O.target.value),t()}})]}),Y.jsxs("label",{children:["Rot",Y.jsx("input",{type:"number",step:"0.1",value:S.meshRenderer.surface.rotation,onChange:O=>{S.meshRenderer.surface.rotation=Number(O.target.value),t()}})]})]})]}),Y.jsx("p",{className:"muted tiny",children:"Procedural textures are canvas-generated; image uploads become reusable data URLs."})]})]}),E==="terrain"&&Y.jsxs("section",{children:[Y.jsx("h3",{children:"Terrain"}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Biome"}),Y.jsxs("select",{value:d,onChange:O=>f(O.target.value),children:[Y.jsx("option",{value:"forest",children:"Forest"}),Y.jsx("option",{value:"desert",children:"Desert"}),Y.jsx("option",{value:"snow",children:"Snow"})]})]}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Height scale"}),Y.jsx("input",{type:"range",min:"0.5",max:"8",step:"0.1",defaultValue:"3",id:"terrain-height"})]}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Smoothness"}),Y.jsx("input",{type:"range",min:"0.5",max:"3",step:"0.05",defaultValue:"1",id:"terrain-smooth"})]}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Noise scale"}),Y.jsx("input",{type:"range",min:"1",max:"10",step:"0.1",defaultValue:"3",id:"terrain-noise"})]}),Y.jsx("button",{type:"button",className:"ghost",onClick:()=>{const O=Number(document.getElementById("terrain-height").value),k=Number(document.getElementById("terrain-smooth").value),j=Number(document.getElementById("terrain-noise").value);a.terrain.generateNoise(O,k,j,d),t()},children:"Generate noise"}),Y.jsxs("div",{className:"tool-group",style:{marginTop:8},children:[Y.jsx("button",{type:"button",className:s==="raise"?"tool active":"tool",onClick:()=>o("raise"),children:"Raise"}),Y.jsx("button",{type:"button",className:s==="lower"?"tool active":"tool",onClick:()=>o("lower"),children:"Lower"}),Y.jsx("button",{type:"button",className:s==="flatten"?"tool active":"tool",onClick:()=>o("flatten"),children:"Flatten"}),Y.jsx("button",{type:"button",className:s==="paint"?"tool active":"tool",onClick:()=>o("paint"),children:"Paint"})]}),Y.jsxs("label",{className:"field",children:[Y.jsx("span",{children:"Paint layer (grass/sand/rock)"}),Y.jsxs("select",{value:c,onChange:O=>u(Number(O.target.value)),children:[Y.jsx("option",{value:0,children:"Grass"}),Y.jsx("option",{value:1,children:"Sand"}),Y.jsx("option",{value:2,children:"Rock"})]})]}),Y.jsxs("label",{className:"field",children:[Y.jsxs("span",{children:["Brush radius ",p]}),Y.jsx("input",{type:"range",min:"0.5",max:"8",step:"0.1",value:p,onChange:O=>v(Number(O.target.value))})]}),Y.jsxs("label",{className:"field",children:[Y.jsxs("span",{children:["Brush strength ",m]}),Y.jsx("input",{type:"range",min:"0.1",max:"3",step:"0.05",value:m,onChange:O=>x(Number(O.target.value))})]}),Y.jsx("p",{className:"muted tiny",children:"Shift + Left-drag on the viewport sculpts terrain (XZ projection)."})]}),E==="shader"&&Y.jsxs("section",{children:[Y.jsx("h3",{children:"Shader templates"}),Y.jsx("div",{className:"shader-preset-grid",children:eR.map(O=>Y.jsx("button",{type:"button",className:"ghost",onClick:()=>z(O),children:O},O))}),Y.jsx("h4",{children:"Custom GLSL (validate)"}),Y.jsx("textarea",{className:"code-area",value:_,onChange:O=>w(O.target.value),rows:4}),Y.jsx("textarea",{className:"code-area",value:A,onChange:O=>T(O.target.value),rows:4}),Y.jsx("button",{type:"button",className:"ghost",onClick:b,children:"Check compile"}),U&&Y.jsx("pre",{className:"error-text",children:U}),Y.jsx("p",{className:"muted tiny",children:"Live custom shader injection hooks into the engine in a future pass; presets apply immediately."})]}),E==="code"&&Y.jsxs("section",{children:[Y.jsx("h3",{children:"User script"}),!S&&Y.jsx("p",{className:"muted tiny",children:"Select an object to attach JS."}),S&&Y.jsxs(Y.Fragment,{children:[Y.jsx("textarea",{className:"code-area",rows:8,value:((B=S.script)==null?void 0:B.userSource)??"",onChange:O=>{const k=O.target.value;S.script||(S.script=new Vc),S.script.userSource=k,t()}}),Y.jsx("p",{className:"muted tiny",children:'Runs in play mode only. Example: `api.spin(2);` or `api.setColor("#ff00aa");`'})]})]}),E==="world"&&Y.jsxs("section",{children:[Y.jsx("h3",{children:"Procedural world"}),Y.jsx("p",{className:"muted tiny",children:"Scatter trees/rocks using noise + density. Tune biome on the Terrain tab first."}),Y.jsx("button",{type:"button",className:"play-toggle",onClick:C,children:"Generate props"})]})]})]})}function nR(){const{engine:a,playSession:e}=ko(),t=dt(o=>o.isPlaying),i=dt(o=>o.setPlaying),s=()=>{e.toggle(a),i(a.isPlayMode())};return Y.jsxs("header",{className:"top-bar",children:[Y.jsxs("div",{className:"brand",children:[Y.jsx("span",{className:"brand-mark",children:"◆"}),Y.jsxs("div",{children:[Y.jsx("div",{className:"brand-title",children:"Pixel Studio"}),Y.jsx("div",{className:"brand-subtitle",children:"Modular three.js editor shell"})]})]}),Y.jsxs("div",{className:"top-actions",children:[Y.jsx("button",{type:"button",className:t?"play-toggle active":"play-toggle",onClick:s,children:t?"Stop":"Play"}),Y.jsx("span",{className:"hint",children:"Right-click viewport to capture mouse · WASD moves · Space / Shift vertical"})]})]})}const Ms=new Tf,Pn=new $,Yr=new $,qt=new Ln,Hv={X:new $(1,0,0),Y:new $(0,1,0),Z:new $(0,0,1)},_d={type:"change"},Vv={type:"mouseDown",mode:null},Gv={type:"mouseUp",mode:null},Wv={type:"objectChange"};class iR extends G1{constructor(e,t=null){super(void 0,t);const i=new cR(this);this._root=i;const s=new uR;this._gizmo=s,i.add(s);const o=new hR;this._plane=o,i.add(o);const c=this;function u(A,T){let U=T;Object.defineProperty(c,A,{get:function(){return U!==void 0?U:T},set:function(N){U!==N&&(U=N,o[A]=N,s[A]=N,c.dispatchEvent({type:A+"-changed",value:N}),c.dispatchEvent(_d))}}),c[A]=T,o[A]=T,s[A]=T}u("camera",e),u("object",void 0),u("enabled",!0),u("axis",null),u("mode","translate"),u("translationSnap",null),u("rotationSnap",null),u("scaleSnap",null),u("space","world"),u("size",1),u("dragging",!1),u("showX",!0),u("showY",!0),u("showZ",!0),u("minX",-1/0),u("maxX",1/0),u("minY",-1/0),u("maxY",1/0),u("minZ",-1/0),u("maxZ",1/0);const d=new $,f=new $,p=new Ln,v=new Ln,m=new $,x=new Ln,S=new $,E=new $,y=new $,_=0,w=new $;u("worldPosition",d),u("worldPositionStart",f),u("worldQuaternion",p),u("worldQuaternionStart",v),u("cameraPosition",m),u("cameraQuaternion",x),u("pointStart",S),u("pointEnd",E),u("rotationAxis",y),u("rotationAngle",_),u("eye",w),this._offset=new $,this._startNorm=new $,this._endNorm=new $,this._cameraScale=new $,this._parentPosition=new $,this._parentQuaternion=new Ln,this._parentQuaternionInv=new Ln,this._parentScale=new $,this._worldScaleStart=new $,this._worldQuaternionInv=new Ln,this._worldScale=new $,this._positionStart=new $,this._quaternionStart=new Ln,this._scaleStart=new $,this._getPointer=rR.bind(this),this._onPointerDown=oR.bind(this),this._onPointerHover=sR.bind(this),this._onPointerMove=aR.bind(this),this._onPointerUp=lR.bind(this),t!==null&&this.connect()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointermove",this._onPointerHover),this.domElement.addEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerHover),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="auto"}getHelper(){return this._root}pointerHover(e){if(this.object===void 0||this.dragging===!0)return;e!==null&&Ms.setFromCamera(e,this.camera);const t=xd(this._gizmo.picker[this.mode],Ms);t?this.axis=t.object.name:this.axis=null}pointerDown(e){if(!(this.object===void 0||this.dragging===!0||e!=null&&e.button!==0)&&this.axis!==null){e!==null&&Ms.setFromCamera(e,this.camera);const t=xd(this._plane,Ms,!0);t&&(this.object.updateMatrixWorld(),this.object.parent.updateMatrixWorld(),this._positionStart.copy(this.object.position),this._quaternionStart.copy(this.object.quaternion),this._scaleStart.copy(this.object.scale),this.object.matrixWorld.decompose(this.worldPositionStart,this.worldQuaternionStart,this._worldScaleStart),this.pointStart.copy(t.point).sub(this.worldPositionStart)),this.dragging=!0,Vv.mode=this.mode,this.dispatchEvent(Vv)}}pointerMove(e){const t=this.axis,i=this.mode,s=this.object;let o=this.space;if(i==="scale"?o="local":(t==="E"||t==="XYZE"||t==="XYZ")&&(o="world"),s===void 0||t===null||this.dragging===!1||e!==null&&e.button!==-1)return;e!==null&&Ms.setFromCamera(e,this.camera);const c=xd(this._plane,Ms,!0);if(c){if(this.pointEnd.copy(c.point).sub(this.worldPositionStart),i==="translate")this._offset.copy(this.pointEnd).sub(this.pointStart),o==="local"&&t!=="XYZ"&&this._offset.applyQuaternion(this._worldQuaternionInv),t.indexOf("X")===-1&&(this._offset.x=0),t.indexOf("Y")===-1&&(this._offset.y=0),t.indexOf("Z")===-1&&(this._offset.z=0),o==="local"&&t!=="XYZ"?this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale):this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale),s.position.copy(this._offset).add(this._positionStart),this.translationSnap&&(o==="local"&&(s.position.applyQuaternion(qt.copy(this._quaternionStart).invert()),t.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.position.applyQuaternion(this._quaternionStart)),o==="world"&&(s.parent&&s.position.add(Pn.setFromMatrixPosition(s.parent.matrixWorld)),t.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.parent&&s.position.sub(Pn.setFromMatrixPosition(s.parent.matrixWorld)))),s.position.x=Math.max(this.minX,Math.min(this.maxX,s.position.x)),s.position.y=Math.max(this.minY,Math.min(this.maxY,s.position.y)),s.position.z=Math.max(this.minZ,Math.min(this.maxZ,s.position.z));else if(i==="scale"){if(t.search("XYZ")!==-1){let u=this.pointEnd.length()/this.pointStart.length();this.pointEnd.dot(this.pointStart)<0&&(u*=-1),Yr.set(u,u,u)}else Pn.copy(this.pointStart),Yr.copy(this.pointEnd),Pn.applyQuaternion(this._worldQuaternionInv),Yr.applyQuaternion(this._worldQuaternionInv),Yr.divide(Pn),t.search("X")===-1&&(Yr.x=1),t.search("Y")===-1&&(Yr.y=1),t.search("Z")===-1&&(Yr.z=1);s.scale.copy(this._scaleStart).multiply(Yr),this.scaleSnap&&(t.search("X")!==-1&&(s.scale.x=Math.round(s.scale.x/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Y")!==-1&&(s.scale.y=Math.round(s.scale.y/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Z")!==-1&&(s.scale.z=Math.round(s.scale.z/this.scaleSnap)*this.scaleSnap||this.scaleSnap))}else if(i==="rotate"){this._offset.copy(this.pointEnd).sub(this.pointStart);const u=20/this.worldPosition.distanceTo(Pn.setFromMatrixPosition(this.camera.matrixWorld));let d=!1;t==="XYZE"?(this.rotationAxis.copy(this._offset).cross(this.eye).normalize(),this.rotationAngle=this._offset.dot(Pn.copy(this.rotationAxis).cross(this.eye))*u):(t==="X"||t==="Y"||t==="Z")&&(this.rotationAxis.copy(Hv[t]),Pn.copy(Hv[t]),o==="local"&&Pn.applyQuaternion(this.worldQuaternion),Pn.cross(this.eye),Pn.length()===0?d=!0:this.rotationAngle=this._offset.dot(Pn.normalize())*u),(t==="E"||d)&&(this.rotationAxis.copy(this.eye),this.rotationAngle=this.pointEnd.angleTo(this.pointStart),this._startNorm.copy(this.pointStart).normalize(),this._endNorm.copy(this.pointEnd).normalize(),this.rotationAngle*=this._endNorm.cross(this._startNorm).dot(this.eye)<0?1:-1),this.rotationSnap&&(this.rotationAngle=Math.round(this.rotationAngle/this.rotationSnap)*this.rotationSnap),o==="local"&&t!=="E"&&t!=="XYZE"?(s.quaternion.copy(this._quaternionStart),s.quaternion.multiply(qt.setFromAxisAngle(this.rotationAxis,this.rotationAngle)).normalize()):(this.rotationAxis.applyQuaternion(this._parentQuaternionInv),s.quaternion.copy(qt.setFromAxisAngle(this.rotationAxis,this.rotationAngle)),s.quaternion.multiply(this._quaternionStart).normalize())}this.dispatchEvent(_d),this.dispatchEvent(Wv)}}pointerUp(e){e!==null&&e.button!==0||(this.dragging&&this.axis!==null&&(Gv.mode=this.mode,this.dispatchEvent(Gv)),this.dragging=!1,this.axis=null)}dispose(){this.disconnect(),this._root.dispose()}attach(e){return this.object=e,this._root.visible=!0,this}detach(){return this.object=void 0,this.axis=null,this._root.visible=!1,this}reset(){this.enabled&&this.dragging&&(this.object.position.copy(this._positionStart),this.object.quaternion.copy(this._quaternionStart),this.object.scale.copy(this._scaleStart),this.dispatchEvent(_d),this.dispatchEvent(Wv),this.pointStart.copy(this.pointEnd))}getRaycaster(){return Ms}getMode(){return this.mode}setMode(e){this.mode=e}setTranslationSnap(e){this.translationSnap=e}setRotationSnap(e){this.rotationSnap=e}setScaleSnap(e){this.scaleSnap=e}setSize(e){this.size=e}setSpace(e){this.space=e}}function rR(a){if(this.domElement.ownerDocument.pointerLockElement)return{x:0,y:0,button:a.button};{const e=this.domElement.getBoundingClientRect();return{x:(a.clientX-e.left)/e.width*2-1,y:-(a.clientY-e.top)/e.height*2+1,button:a.button}}}function sR(a){if(this.enabled)switch(a.pointerType){case"mouse":case"pen":this.pointerHover(this._getPointer(a));break}}function oR(a){this.enabled&&(document.pointerLockElement||this.domElement.setPointerCapture(a.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.pointerHover(this._getPointer(a)),this.pointerDown(this._getPointer(a)))}function aR(a){this.enabled&&this.pointerMove(this._getPointer(a))}function lR(a){this.enabled&&(this.domElement.releasePointerCapture(a.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.pointerUp(this._getPointer(a)))}function xd(a,e,t){const i=e.intersectObject(a,!0);for(let s=0;s<i.length;s++)if(i[s].object.visible||t)return i[s];return!1}const Tc=new si,Ot=new $(0,1,0),jv=new $(0,0,0),Xv=new Ht,Ac=new Ln,Fc=new Ln,Gi=new $,qv=new Ht,Da=new $(1,0,0),Ts=new $(0,1,0),Ua=new $(0,0,1),Cc=new $,ba=new $,Pa=new $;class cR extends on{constructor(e){super(),this.isTransformControlsRoot=!0,this.controls=e,this.visible=!1}updateMatrixWorld(e){const t=this.controls;t.object!==void 0&&(t.object.updateMatrixWorld(),t.object.parent===null?console.error("TransformControls: The attached 3D object must be a part of the scene graph."):t.object.parent.matrixWorld.decompose(t._parentPosition,t._parentQuaternion,t._parentScale),t.object.matrixWorld.decompose(t.worldPosition,t.worldQuaternion,t._worldScale),t._parentQuaternionInv.copy(t._parentQuaternion).invert(),t._worldQuaternionInv.copy(t.worldQuaternion).invert()),t.camera.updateMatrixWorld(),t.camera.matrixWorld.decompose(t.cameraPosition,t.cameraQuaternion,t._cameraScale),t.camera.isOrthographicCamera?t.camera.getWorldDirection(t.eye).negate():t.eye.copy(t.cameraPosition).sub(t.worldPosition).normalize(),super.updateMatrixWorld(e)}dispose(){this.traverse(function(e){e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}}class uR extends on{constructor(){super(),this.isTransformControlsGizmo=!0,this.type="TransformControlsGizmo";const e=new Xc({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),t=new Mf({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),i=e.clone();i.opacity=.15;const s=t.clone();s.opacity=.5;const o=e.clone();o.color.setHex(16711680);const c=e.clone();c.color.setHex(65280);const u=e.clone();u.color.setHex(255);const d=e.clone();d.color.setHex(16711680),d.opacity=.5;const f=e.clone();f.color.setHex(65280),f.opacity=.5;const p=e.clone();p.color.setHex(255),p.opacity=.5;const v=e.clone();v.opacity=.25;const m=e.clone();m.color.setHex(16776960),m.opacity=.25,e.clone().color.setHex(16776960);const S=e.clone();S.color.setHex(7895160);const E=new yn(0,.04,.1,12);E.translate(0,.05,0);const y=new Qt(.08,.08,.08);y.translate(0,.04,0);const _=new Sn;_.setAttribute("position",new $t([0,0,0,1,0,0],3));const w=new yn(.0075,.0075,.5,3);w.translate(0,.25,0);function A(X,W){const ie=new Rs(X,.0075,3,64,W*Math.PI*2);return ie.rotateY(Math.PI/2),ie.rotateX(Math.PI/2),ie}function T(){const X=new Sn;return X.setAttribute("position",new $t([0,0,0,1,1,1],3)),X}const U={X:[[new Fe(E,o),[.5,0,0],[0,0,-Math.PI/2]],[new Fe(E,o),[-.5,0,0],[0,0,Math.PI/2]],[new Fe(w,o),[0,0,0],[0,0,-Math.PI/2]]],Y:[[new Fe(E,c),[0,.5,0]],[new Fe(E,c),[0,-.5,0],[Math.PI,0,0]],[new Fe(w,c)]],Z:[[new Fe(E,u),[0,0,.5],[Math.PI/2,0,0]],[new Fe(E,u),[0,0,-.5],[-Math.PI/2,0,0]],[new Fe(w,u),null,[Math.PI/2,0,0]]],XYZ:[[new Fe(new To(.1,0),v.clone()),[0,0,0]]],XY:[[new Fe(new Qt(.15,.15,.01),p.clone()),[.15,.15,0]]],YZ:[[new Fe(new Qt(.15,.15,.01),d.clone()),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Qt(.15,.15,.01),f.clone()),[.15,0,.15],[-Math.PI/2,0,0]]]},N={X:[[new Fe(new yn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Fe(new yn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(new yn(.2,0,.6,4),i),[0,.3,0]],[new Fe(new yn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Fe(new yn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Fe(new yn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new To(.2,0),i)]],XY:[[new Fe(new Qt(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Fe(new Qt(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Qt(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]]},D={START:[[new Fe(new To(.01,2),s),null,null,null,"helper"]],END:[[new Fe(new To(.01,2),s),null,null,null,"helper"]],DELTA:[[new pr(T(),s),null,null,null,"helper"]],X:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new pr(_,s.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new pr(_,s.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]},z={XYZE:[[new Fe(A(.5,1),S),null,[0,Math.PI/2,0]]],X:[[new Fe(A(.5,.5),o)]],Y:[[new Fe(A(.5,.5),c),null,[0,0,-Math.PI/2]]],Z:[[new Fe(A(.5,.5),u),null,[0,Math.PI/2,0]]],E:[[new Fe(A(.75,1),m),null,[0,Math.PI/2,0]]]},b={AXIS:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]]},C={XYZE:[[new Fe(new Yc(.25,10,8),i)]],X:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[0,-Math.PI/2,-Math.PI/2]]],Y:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[Math.PI/2,0,0]]],Z:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[0,0,-Math.PI/2]]],E:[[new Fe(new Rs(.75,.1,2,24),i)]]},B={X:[[new Fe(y,o),[.5,0,0],[0,0,-Math.PI/2]],[new Fe(w,o),[0,0,0],[0,0,-Math.PI/2]],[new Fe(y,o),[-.5,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(y,c),[0,.5,0]],[new Fe(w,c)],[new Fe(y,c),[0,-.5,0],[0,0,Math.PI]]],Z:[[new Fe(y,u),[0,0,.5],[Math.PI/2,0,0]],[new Fe(w,u),[0,0,0],[Math.PI/2,0,0]],[new Fe(y,u),[0,0,-.5],[-Math.PI/2,0,0]]],XY:[[new Fe(new Qt(.15,.15,.01),p),[.15,.15,0]]],YZ:[[new Fe(new Qt(.15,.15,.01),d),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Qt(.15,.15,.01),f),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new Qt(.1,.1,.1),v.clone())]]},O={X:[[new Fe(new yn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Fe(new yn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(new yn(.2,0,.6,4),i),[0,.3,0]],[new Fe(new yn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Fe(new yn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Fe(new yn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XY:[[new Fe(new Qt(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Fe(new Qt(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Qt(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new Qt(.2,.2,.2),i),[0,0,0]]]},k={X:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new pr(_,s.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new pr(_,s.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]};function j(X){const W=new on;for(const ie in X)for(let H=X[ie].length;H--;){const q=X[ie][H][0].clone(),oe=X[ie][H][1],G=X[ie][H][2],Q=X[ie][H][3],be=X[ie][H][4];q.name=ie,q.tag=be,oe&&q.position.set(oe[0],oe[1],oe[2]),G&&q.rotation.set(G[0],G[1],G[2]),Q&&q.scale.set(Q[0],Q[1],Q[2]),q.updateMatrix();const se=q.geometry.clone();se.applyMatrix4(q.matrix),q.geometry=se,q.renderOrder=1/0,q.position.set(0,0,0),q.rotation.set(0,0,0),q.scale.set(1,1,1),W.add(q)}return W}this.gizmo={},this.picker={},this.helper={},this.add(this.gizmo.translate=j(U)),this.add(this.gizmo.rotate=j(z)),this.add(this.gizmo.scale=j(B)),this.add(this.picker.translate=j(N)),this.add(this.picker.rotate=j(C)),this.add(this.picker.scale=j(O)),this.add(this.helper.translate=j(D)),this.add(this.helper.rotate=j(b)),this.add(this.helper.scale=j(k)),this.picker.translate.visible=!1,this.picker.rotate.visible=!1,this.picker.scale.visible=!1}updateMatrixWorld(e){const i=(this.mode==="scale"?"local":this.space)==="local"?this.worldQuaternion:Fc;this.gizmo.translate.visible=this.mode==="translate",this.gizmo.rotate.visible=this.mode==="rotate",this.gizmo.scale.visible=this.mode==="scale",this.helper.translate.visible=this.mode==="translate",this.helper.rotate.visible=this.mode==="rotate",this.helper.scale.visible=this.mode==="scale";let s=[];s=s.concat(this.picker[this.mode].children),s=s.concat(this.gizmo[this.mode].children),s=s.concat(this.helper[this.mode].children);for(let o=0;o<s.length;o++){const c=s[o];c.visible=!0,c.rotation.set(0,0,0),c.position.copy(this.worldPosition);let u;if(this.camera.isOrthographicCamera?u=(this.camera.top-this.camera.bottom)/this.camera.zoom:u=this.worldPosition.distanceTo(this.cameraPosition)*Math.min(1.9*Math.tan(Math.PI*this.camera.fov/360)/this.camera.zoom,7),c.scale.set(1,1,1).multiplyScalar(u*this.size/4),c.tag==="helper"){c.visible=!1,c.name==="AXIS"?(c.visible=!!this.axis,this.axis==="X"&&(qt.setFromEuler(Tc.set(0,0,0)),c.quaternion.copy(i).multiply(qt),Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="Y"&&(qt.setFromEuler(Tc.set(0,0,Math.PI/2)),c.quaternion.copy(i).multiply(qt),Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="Z"&&(qt.setFromEuler(Tc.set(0,Math.PI/2,0)),c.quaternion.copy(i).multiply(qt),Math.abs(Ot.copy(Ua).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="XYZE"&&(qt.setFromEuler(Tc.set(0,Math.PI/2,0)),Ot.copy(this.rotationAxis),c.quaternion.setFromRotationMatrix(Xv.lookAt(jv,Ot,Ts)),c.quaternion.multiply(qt),c.visible=this.dragging),this.axis==="E"&&(c.visible=!1)):c.name==="START"?(c.position.copy(this.worldPositionStart),c.visible=this.dragging):c.name==="END"?(c.position.copy(this.worldPosition),c.visible=this.dragging):c.name==="DELTA"?(c.position.copy(this.worldPositionStart),c.quaternion.copy(this.worldQuaternionStart),Pn.set(1e-10,1e-10,1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1),Pn.applyQuaternion(this.worldQuaternionStart.clone().invert()),c.scale.copy(Pn),c.visible=this.dragging):(c.quaternion.copy(i),this.dragging?c.position.copy(this.worldPositionStart):c.position.copy(this.worldPosition),this.axis&&(c.visible=this.axis.search(c.name)!==-1));continue}c.quaternion.copy(i),this.mode==="translate"||this.mode==="scale"?(c.name==="X"&&Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="Y"&&Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="Z"&&Math.abs(Ot.copy(Ua).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="XY"&&Math.abs(Ot.copy(Ua).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="YZ"&&Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="XZ"&&Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1)):this.mode==="rotate"&&(Ac.copy(i),Ot.copy(this.eye).applyQuaternion(qt.copy(i).invert()),c.name.search("E")!==-1&&c.quaternion.setFromRotationMatrix(Xv.lookAt(this.eye,jv,Ts)),c.name==="X"&&(qt.setFromAxisAngle(Da,Math.atan2(-Ot.y,Ot.z)),qt.multiplyQuaternions(Ac,qt),c.quaternion.copy(qt)),c.name==="Y"&&(qt.setFromAxisAngle(Ts,Math.atan2(Ot.x,Ot.z)),qt.multiplyQuaternions(Ac,qt),c.quaternion.copy(qt)),c.name==="Z"&&(qt.setFromAxisAngle(Ua,Math.atan2(Ot.y,Ot.x)),qt.multiplyQuaternions(Ac,qt),c.quaternion.copy(qt))),c.visible=c.visible&&(c.name.indexOf("X")===-1||this.showX),c.visible=c.visible&&(c.name.indexOf("Y")===-1||this.showY),c.visible=c.visible&&(c.name.indexOf("Z")===-1||this.showZ),c.visible=c.visible&&(c.name.indexOf("E")===-1||this.showX&&this.showY&&this.showZ),c.material._color=c.material._color||c.material.color.clone(),c.material._opacity=c.material._opacity||c.material.opacity,c.material.color.copy(c.material._color),c.material.opacity=c.material._opacity,this.enabled&&this.axis&&(c.name===this.axis||this.axis.split("").some(function(d){return c.name===d}))&&(c.material.color.setHex(16776960),c.material.opacity=1)}super.updateMatrixWorld(e)}}class hR extends Fe{constructor(){super(new Oo(1e5,1e5,2,2),new Xc({visible:!1,wireframe:!0,side:ji,transparent:!0,opacity:.1,toneMapped:!1})),this.isTransformControlsPlane=!0,this.type="TransformControlsPlane"}updateMatrixWorld(e){let t=this.space;switch(this.position.copy(this.worldPosition),this.mode==="scale"&&(t="local"),Cc.copy(Da).applyQuaternion(t==="local"?this.worldQuaternion:Fc),ba.copy(Ts).applyQuaternion(t==="local"?this.worldQuaternion:Fc),Pa.copy(Ua).applyQuaternion(t==="local"?this.worldQuaternion:Fc),Ot.copy(ba),this.mode){case"translate":case"scale":switch(this.axis){case"X":Ot.copy(this.eye).cross(Cc),Gi.copy(Cc).cross(Ot);break;case"Y":Ot.copy(this.eye).cross(ba),Gi.copy(ba).cross(Ot);break;case"Z":Ot.copy(this.eye).cross(Pa),Gi.copy(Pa).cross(Ot);break;case"XY":Gi.copy(Pa);break;case"YZ":Gi.copy(Cc);break;case"XZ":Ot.copy(Pa),Gi.copy(ba);break;case"XYZ":case"E":Gi.set(0,0,0);break}break;case"rotate":default:Gi.set(0,0,0)}Gi.length()===0?this.quaternion.copy(this.cameraQuaternion):(qv.lookAt(Pn.set(0,0,0),Gi,Ot),this.quaternion.setFromRotationMatrix(qv)),super.updateMatrixWorld(e)}}class dR{constructor(e,t){Ie(this,"controls");Ie(this,"activeObject",null);Ie(this,"spaceObject",null);this.controls=new iR(e,t),this.controls.setSpace("local")}setMode(e){this.controls.setMode(e)}setSnapGrid(e){this.controls.setTranslationSnap(e>0?e:null),this.controls.setRotationSnap(e>0?Math.PI/12:null),this.controls.setScaleSnap(e>0?e:null)}attachToThreeObject(e,t){this.activeObject=t,this.spaceObject=e,this.controls.attach(e)}detach(){this.activeObject=null,this.spaceObject=null,this.controls.detach()}getAttachedGameObject(){return this.activeObject}addToScene(e){e.add(this.controls)}syncGameObjectFromGizmo(){if(!this.activeObject||!this.spaceObject)return;const e=this.activeObject.transform,t=this.spaceObject;e.localPosition.copy(t.position),e.localRotation.copy(t.rotation),e.localScale.copy(t.scale)}dispose(){this.controls.dispose()}}function fR(){const a=gt.useRef(null),e=gt.useRef(null),{engine:t}=ko(),i=dt(x=>x.setSelectedId),s=dt(x=>x.selectedId),o=dt(x=>x.gizmoMode),c=dt(x=>x.snapGrid),u=dt(x=>x.lightingPreset),d=dt(x=>x.isPlaying),f=dt(x=>x.bumpScene),p=gt.useRef(s);p.current=s,gt.useEffect(()=>{t.setMaterialDirtyNotifier(()=>f())},[t,f]),gt.useEffect(()=>{t.setLightingPreset(u)},[t,u]),gt.useEffect(()=>{const x=a.current;if(!x)return;t.mount(x);const S=new dR(t.camera,t.renderer.domElement);S.addToScene(t.scene),e.current=S,t.gizmo=S;const E=T=>{t.setGizmoDragging(!!T.value)};S.controls.addEventListener("dragging-changed",E);const y=()=>{S.syncGameObjectFromGizmo(),f()};S.controls.addEventListener("objectChange",y);const _=t.flyController.attach(x);let w=0;const A=()=>{t.tick(),w=requestAnimationFrame(A)};return w=requestAnimationFrame(A),()=>{cancelAnimationFrame(w),S.controls.removeEventListener("dragging-changed",E),S.controls.removeEventListener("objectChange",y),S.detach(),S.dispose(),t.gizmo=null,e.current=null,_(),x.replaceChildren()}},[t,f]),gt.useEffect(()=>{const x=S=>{if(S.repeat||S.target.closest("input, textarea, select, [contenteditable='true']"))return;const y=p.current;if(S.key==="Delete"){if(!y)return;const _=t.sceneGraph.getObject(y);_&&(t.sceneGraph.destroy(_),i(null),f()),S.preventDefault()}if((S.ctrlKey||S.metaKey)&&S.key.toLowerCase()==="d"){if(!y)return;const _=t.sceneGraph.getObject(y);if(!_)return;const w=_.parent,A=new bf(`${_.name} Copy`);A.transform.copyFrom(_.transform),t.sceneGraph.register(A),t.sceneGraph.setParent(A,w),t.sceneGraph.cloneMeshAndScriptFrom(_,A),i(A.id),f(),S.preventDefault()}};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[t,f,i]),gt.useEffect(()=>{const x=e.current;x&&x.setMode(o)},[o]),gt.useEffect(()=>{const x=e.current;x&&x.setSnapGrid(c)},[c]),gt.useEffect(()=>{t.setSelectedId(s);const x=requestAnimationFrame(()=>{const S=e.current;if(!S)return;if(!s||d){S.detach();return}const E=t.sceneGraph.getObject(s),y=t.getObjectGroup(s);E&&y&&S.attachToThreeObject(y,E)});return()=>cancelAnimationFrame(x)},[t,s,d]);const v=x=>{var A;if(x.button!==0)return;const S=x.target;if(!((A=a.current)!=null&&A.contains(S)))return;const E=a.current.getBoundingClientRect(),y=x.clientX-E.left,_=x.clientY-E.top;if(x.shiftKey){const T=t.pickTerrainXZ(y,_,E.width,E.height);if(T){const U=dt.getState();U.terrainBrush==="paint"?t.terrain.paintSplat(T.x,T.z,U.terrainBrushRadius,U.terrainPaintLayer):t.terrain.applyBrush(T.x,T.z,U.terrainBrushRadius,U.terrainBrushStrength,U.terrainBrush==="flatten"?"flatten":U.terrainBrush,0),f()}return}const w=t.pickFromDomEvent(y,_,E.width,E.height);i(w)},m=x=>{var A;if(!x.shiftKey||x.buttons!==1)return;const S=(A=a.current)==null?void 0:A.getBoundingClientRect();if(!S)return;const E=x.clientX-S.left,y=x.clientY-S.top,_=t.pickTerrainXZ(E,y,S.width,S.height);if(!_)return;const w=dt.getState();w.terrainBrush==="paint"?t.terrain.paintSplat(_.x,_.z,w.terrainBrushRadius,w.terrainPaintLayer):t.terrain.applyBrush(_.x,_.z,w.terrainBrushRadius,w.terrainBrushStrength,w.terrainBrush==="flatten"?"flatten":w.terrainBrush,0),f()};return Y.jsx("div",{ref:a,className:"viewport-host",onPointerDown:v,onPointerMove:m,role:"application","aria-label":"3D viewport"})}function pR(){return Y.jsxs("div",{className:"editor-shell",children:[Y.jsx(nR,{}),Y.jsx(qC,{}),Y.jsxs("div",{className:"editor-workspace",children:[Y.jsx(YC,{}),Y.jsx("main",{className:"viewport-pane",children:Y.jsx(fR,{})}),Y.jsxs("div",{className:"right-stack",children:[Y.jsx($C,{}),Y.jsx(tR,{})]})]}),Y.jsx(XC,{})]})}function mR(){return Y.jsx(jC,{children:Y.jsx(pR,{})})}Rx.createRoot(document.getElementById("root")).render(Y.jsx(La.StrictMode,{children:Y.jsx(mR,{})}));
