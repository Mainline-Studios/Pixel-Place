var vy=Object.defineProperty;var _y=(a,e,t)=>e in a?vy(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var Ne=(a,e,t)=>_y(a,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();function qv(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}var Rh={exports:{}},va={},bh={exports:{}},vt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Km;function yy(){if(Km)return vt;Km=1;var a=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),i=Symbol.for("react.strict_mode"),s=Symbol.for("react.profiler"),o=Symbol.for("react.provider"),c=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),d=Symbol.for("react.suspense"),f=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),v=Symbol.iterator;function p(V){return V===null||typeof V!="object"?null:(V=v&&V[v]||V["@@iterator"],typeof V=="function"?V:null)}var y={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,E={};function x(V,Z,be){this.props=V,this.context=Z,this.refs=E,this.updater=be||y}x.prototype.isReactComponent={},x.prototype.setState=function(V,Z){if(typeof V!="object"&&typeof V!="function"&&V!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,V,Z,"setState")},x.prototype.forceUpdate=function(V){this.updater.enqueueForceUpdate(this,V,"forceUpdate")};function _(){}_.prototype=x.prototype;function w(V,Z,be){this.props=V,this.context=Z,this.refs=E,this.updater=be||y}var A=w.prototype=new _;A.constructor=w,M(A,x.prototype),A.isPureReactComponent=!0;var T=Array.isArray,U=Object.prototype.hasOwnProperty,D={current:null},N={key:!0,ref:!0,__self:!0,__source:!0};function O(V,Z,be){var re,de={},Me=null,_e=null;if(Z!=null)for(re in Z.ref!==void 0&&(_e=Z.ref),Z.key!==void 0&&(Me=""+Z.key),Z)U.call(Z,re)&&!N.hasOwnProperty(re)&&(de[re]=Z[re]);var Ce=arguments.length-2;if(Ce===1)de.children=be;else if(1<Ce){for(var Oe=Array(Ce),nt=0;nt<Ce;nt++)Oe[nt]=arguments[nt+2];de.children=Oe}if(V&&V.defaultProps)for(re in Ce=V.defaultProps,Ce)de[re]===void 0&&(de[re]=Ce[re]);return{$$typeof:a,type:V,key:Me,ref:_e,props:de,_owner:D.current}}function b(V,Z){return{$$typeof:a,type:V.type,key:Z,ref:V.ref,props:V.props,_owner:V._owner}}function C(V){return typeof V=="object"&&V!==null&&V.$$typeof===a}function z(V){var Z={"=":"=0",":":"=2"};return"$"+V.replace(/[=:]/g,function(be){return Z[be]})}var K=/\/+/g;function B(V,Z){return typeof V=="object"&&V!==null&&V.key!=null?z(""+V.key):Z.toString(36)}function j(V,Z,be,re,de){var Me=typeof V;(Me==="undefined"||Me==="boolean")&&(V=null);var _e=!1;if(V===null)_e=!0;else switch(Me){case"string":case"number":_e=!0;break;case"object":switch(V.$$typeof){case a:case e:_e=!0}}if(_e)return _e=V,de=de(_e),V=re===""?"."+B(_e,0):re,T(de)?(be="",V!=null&&(be=V.replace(K,"$&/")+"/"),j(de,Z,be,"",function(nt){return nt})):de!=null&&(C(de)&&(de=b(de,be+(!de.key||_e&&_e.key===de.key?"":(""+de.key).replace(K,"$&/")+"/")+V)),Z.push(de)),1;if(_e=0,re=re===""?".":re+":",T(V))for(var Ce=0;Ce<V.length;Ce++){Me=V[Ce];var Oe=re+B(Me,Ce);_e+=j(Me,Z,be,Oe,de)}else if(Oe=p(V),typeof Oe=="function")for(V=Oe.call(V),Ce=0;!(Me=V.next()).done;)Me=Me.value,Oe=re+B(Me,Ce++),_e+=j(Me,Z,be,Oe,de);else if(Me==="object")throw Z=String(V),Error("Objects are not valid as a React child (found: "+(Z==="[object Object]"?"object with keys {"+Object.keys(V).join(", ")+"}":Z)+"). If you meant to render a collection of children, use an array instead.");return _e}function q(V,Z,be){if(V==null)return V;var re=[],de=0;return j(V,re,"","",function(Me){return Z.call(be,Me,de++)}),re}function G(V){if(V._status===-1){var Z=V._result;Z=Z(),Z.then(function(be){(V._status===0||V._status===-1)&&(V._status=1,V._result=be)},function(be){(V._status===0||V._status===-1)&&(V._status=2,V._result=be)}),V._status===-1&&(V._status=0,V._result=Z)}if(V._status===1)return V._result.default;throw V._result}var ne={current:null},H={transition:null},W={ReactCurrentDispatcher:ne,ReactCurrentBatchConfig:H,ReactCurrentOwner:D};function se(){throw Error("act(...) is not supported in production builds of React.")}return vt.Children={map:q,forEach:function(V,Z,be){q(V,function(){Z.apply(this,arguments)},be)},count:function(V){var Z=0;return q(V,function(){Z++}),Z},toArray:function(V){return q(V,function(Z){return Z})||[]},only:function(V){if(!C(V))throw Error("React.Children.only expected to receive a single React element child.");return V}},vt.Component=x,vt.Fragment=t,vt.Profiler=s,vt.PureComponent=w,vt.StrictMode=i,vt.Suspense=d,vt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W,vt.act=se,vt.cloneElement=function(V,Z,be){if(V==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+V+".");var re=M({},V.props),de=V.key,Me=V.ref,_e=V._owner;if(Z!=null){if(Z.ref!==void 0&&(Me=Z.ref,_e=D.current),Z.key!==void 0&&(de=""+Z.key),V.type&&V.type.defaultProps)var Ce=V.type.defaultProps;for(Oe in Z)U.call(Z,Oe)&&!N.hasOwnProperty(Oe)&&(re[Oe]=Z[Oe]===void 0&&Ce!==void 0?Ce[Oe]:Z[Oe])}var Oe=arguments.length-2;if(Oe===1)re.children=be;else if(1<Oe){Ce=Array(Oe);for(var nt=0;nt<Oe;nt++)Ce[nt]=arguments[nt+2];re.children=Ce}return{$$typeof:a,type:V.type,key:de,ref:Me,props:re,_owner:_e}},vt.createContext=function(V){return V={$$typeof:c,_currentValue:V,_currentValue2:V,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},V.Provider={$$typeof:o,_context:V},V.Consumer=V},vt.createElement=O,vt.createFactory=function(V){var Z=O.bind(null,V);return Z.type=V,Z},vt.createRef=function(){return{current:null}},vt.forwardRef=function(V){return{$$typeof:u,render:V}},vt.isValidElement=C,vt.lazy=function(V){return{$$typeof:m,_payload:{_status:-1,_result:V},_init:G}},vt.memo=function(V,Z){return{$$typeof:f,type:V,compare:Z===void 0?null:Z}},vt.startTransition=function(V){var Z=H.transition;H.transition={};try{V()}finally{H.transition=Z}},vt.unstable_act=se,vt.useCallback=function(V,Z){return ne.current.useCallback(V,Z)},vt.useContext=function(V){return ne.current.useContext(V)},vt.useDebugValue=function(){},vt.useDeferredValue=function(V){return ne.current.useDeferredValue(V)},vt.useEffect=function(V,Z){return ne.current.useEffect(V,Z)},vt.useId=function(){return ne.current.useId()},vt.useImperativeHandle=function(V,Z,be){return ne.current.useImperativeHandle(V,Z,be)},vt.useInsertionEffect=function(V,Z){return ne.current.useInsertionEffect(V,Z)},vt.useLayoutEffect=function(V,Z){return ne.current.useLayoutEffect(V,Z)},vt.useMemo=function(V,Z){return ne.current.useMemo(V,Z)},vt.useReducer=function(V,Z,be){return ne.current.useReducer(V,Z,be)},vt.useRef=function(V){return ne.current.useRef(V)},vt.useState=function(V){return ne.current.useState(V)},vt.useSyncExternalStore=function(V,Z,be){return ne.current.useSyncExternalStore(V,Z,be)},vt.useTransition=function(){return ne.current.useTransition()},vt.version="18.3.1",vt}var Qm;function uf(){return Qm||(Qm=1,bh.exports=yy()),bh.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Jm;function xy(){if(Jm)return va;Jm=1;var a=uf(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),i=Object.prototype.hasOwnProperty,s=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function c(u,d,f){var m,v={},p=null,y=null;f!==void 0&&(p=""+f),d.key!==void 0&&(p=""+d.key),d.ref!==void 0&&(y=d.ref);for(m in d)i.call(d,m)&&!o.hasOwnProperty(m)&&(v[m]=d[m]);if(u&&u.defaultProps)for(m in d=u.defaultProps,d)v[m]===void 0&&(v[m]=d[m]);return{$$typeof:e,type:u,key:p,ref:y,props:v,_owner:s.current}}return va.Fragment=t,va.jsx=c,va.jsxs=c,va}var eg;function Sy(){return eg||(eg=1,Rh.exports=xy()),Rh.exports}var ve=Sy(),Tt=uf();const Pa=qv(Tt);var Yl={},Ph={exports:{}},qn={},Lh={exports:{}},Ih={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var tg;function My(){return tg||(tg=1,(function(a){function e(H,W){var se=H.length;H.push(W);e:for(;0<se;){var V=se-1>>>1,Z=H[V];if(0<s(Z,W))H[V]=W,H[se]=Z,se=V;else break e}}function t(H){return H.length===0?null:H[0]}function i(H){if(H.length===0)return null;var W=H[0],se=H.pop();if(se!==W){H[0]=se;e:for(var V=0,Z=H.length,be=Z>>>1;V<be;){var re=2*(V+1)-1,de=H[re],Me=re+1,_e=H[Me];if(0>s(de,se))Me<Z&&0>s(_e,de)?(H[V]=_e,H[Me]=se,V=Me):(H[V]=de,H[re]=se,V=re);else if(Me<Z&&0>s(_e,se))H[V]=_e,H[Me]=se,V=Me;else break e}}return W}function s(H,W){var se=H.sortIndex-W.sortIndex;return se!==0?se:H.id-W.id}if(typeof performance=="object"&&typeof performance.now=="function"){var o=performance;a.unstable_now=function(){return o.now()}}else{var c=Date,u=c.now();a.unstable_now=function(){return c.now()-u}}var d=[],f=[],m=1,v=null,p=3,y=!1,M=!1,E=!1,x=typeof setTimeout=="function"?setTimeout:null,_=typeof clearTimeout=="function"?clearTimeout:null,w=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function A(H){for(var W=t(f);W!==null;){if(W.callback===null)i(f);else if(W.startTime<=H)i(f),W.sortIndex=W.expirationTime,e(d,W);else break;W=t(f)}}function T(H){if(E=!1,A(H),!M)if(t(d)!==null)M=!0,G(U);else{var W=t(f);W!==null&&ne(T,W.startTime-H)}}function U(H,W){M=!1,E&&(E=!1,_(O),O=-1),y=!0;var se=p;try{for(A(W),v=t(d);v!==null&&(!(v.expirationTime>W)||H&&!z());){var V=v.callback;if(typeof V=="function"){v.callback=null,p=v.priorityLevel;var Z=V(v.expirationTime<=W);W=a.unstable_now(),typeof Z=="function"?v.callback=Z:v===t(d)&&i(d),A(W)}else i(d);v=t(d)}if(v!==null)var be=!0;else{var re=t(f);re!==null&&ne(T,re.startTime-W),be=!1}return be}finally{v=null,p=se,y=!1}}var D=!1,N=null,O=-1,b=5,C=-1;function z(){return!(a.unstable_now()-C<b)}function K(){if(N!==null){var H=a.unstable_now();C=H;var W=!0;try{W=N(!0,H)}finally{W?B():(D=!1,N=null)}}else D=!1}var B;if(typeof w=="function")B=function(){w(K)};else if(typeof MessageChannel<"u"){var j=new MessageChannel,q=j.port2;j.port1.onmessage=K,B=function(){q.postMessage(null)}}else B=function(){x(K,0)};function G(H){N=H,D||(D=!0,B())}function ne(H,W){O=x(function(){H(a.unstable_now())},W)}a.unstable_IdlePriority=5,a.unstable_ImmediatePriority=1,a.unstable_LowPriority=4,a.unstable_NormalPriority=3,a.unstable_Profiling=null,a.unstable_UserBlockingPriority=2,a.unstable_cancelCallback=function(H){H.callback=null},a.unstable_continueExecution=function(){M||y||(M=!0,G(U))},a.unstable_forceFrameRate=function(H){0>H||125<H?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):b=0<H?Math.floor(1e3/H):5},a.unstable_getCurrentPriorityLevel=function(){return p},a.unstable_getFirstCallbackNode=function(){return t(d)},a.unstable_next=function(H){switch(p){case 1:case 2:case 3:var W=3;break;default:W=p}var se=p;p=W;try{return H()}finally{p=se}},a.unstable_pauseExecution=function(){},a.unstable_requestPaint=function(){},a.unstable_runWithPriority=function(H,W){switch(H){case 1:case 2:case 3:case 4:case 5:break;default:H=3}var se=p;p=H;try{return W()}finally{p=se}},a.unstable_scheduleCallback=function(H,W,se){var V=a.unstable_now();switch(typeof se=="object"&&se!==null?(se=se.delay,se=typeof se=="number"&&0<se?V+se:V):se=V,H){case 1:var Z=-1;break;case 2:Z=250;break;case 5:Z=1073741823;break;case 4:Z=1e4;break;default:Z=5e3}return Z=se+Z,H={id:m++,callback:W,priorityLevel:H,startTime:se,expirationTime:Z,sortIndex:-1},se>V?(H.sortIndex=se,e(f,H),t(d)===null&&H===t(f)&&(E?(_(O),O=-1):E=!0,ne(T,se-V))):(H.sortIndex=Z,e(d,H),M||y||(M=!0,G(U))),H},a.unstable_shouldYield=z,a.unstable_wrapCallback=function(H){var W=p;return function(){var se=p;p=W;try{return H.apply(this,arguments)}finally{p=se}}}})(Ih)),Ih}var ng;function Ey(){return ng||(ng=1,Lh.exports=My()),Lh.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ig;function wy(){if(ig)return qn;ig=1;var a=uf(),e=Ey();function t(n){for(var r="https://reactjs.org/docs/error-decoder.html?invariant="+n,l=1;l<arguments.length;l++)r+="&args[]="+encodeURIComponent(arguments[l]);return"Minified React error #"+n+"; visit "+r+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var i=new Set,s={};function o(n,r){c(n,r),c(n+"Capture",r)}function c(n,r){for(s[n]=r,n=0;n<r.length;n++)i.add(r[n])}var u=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),d=Object.prototype.hasOwnProperty,f=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,m={},v={};function p(n){return d.call(v,n)?!0:d.call(m,n)?!1:f.test(n)?v[n]=!0:(m[n]=!0,!1)}function y(n,r,l,h){if(l!==null&&l.type===0)return!1;switch(typeof r){case"function":case"symbol":return!0;case"boolean":return h?!1:l!==null?!l.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function M(n,r,l,h){if(r===null||typeof r>"u"||y(n,r,l,h))return!0;if(h)return!1;if(l!==null)switch(l.type){case 3:return!r;case 4:return r===!1;case 5:return isNaN(r);case 6:return isNaN(r)||1>r}return!1}function E(n,r,l,h,g,S,R){this.acceptsBooleans=r===2||r===3||r===4,this.attributeName=h,this.attributeNamespace=g,this.mustUseProperty=l,this.propertyName=n,this.type=r,this.sanitizeURL=S,this.removeEmptyString=R}var x={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){x[n]=new E(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var r=n[0];x[r]=new E(r,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){x[n]=new E(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){x[n]=new E(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){x[n]=new E(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){x[n]=new E(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){x[n]=new E(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){x[n]=new E(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){x[n]=new E(n,5,!1,n.toLowerCase(),null,!1,!1)});var _=/[\-:]([a-z])/g;function w(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var r=n.replace(_,w);x[r]=new E(r,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var r=n.replace(_,w);x[r]=new E(r,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var r=n.replace(_,w);x[r]=new E(r,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){x[n]=new E(n,1,!1,n.toLowerCase(),null,!1,!1)}),x.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){x[n]=new E(n,1,!1,n.toLowerCase(),null,!0,!0)});function A(n,r,l,h){var g=x.hasOwnProperty(r)?x[r]:null;(g!==null?g.type!==0:h||!(2<r.length)||r[0]!=="o"&&r[0]!=="O"||r[1]!=="n"&&r[1]!=="N")&&(M(r,l,g,h)&&(l=null),h||g===null?p(r)&&(l===null?n.removeAttribute(r):n.setAttribute(r,""+l)):g.mustUseProperty?n[g.propertyName]=l===null?g.type===3?!1:"":l:(r=g.attributeName,h=g.attributeNamespace,l===null?n.removeAttribute(r):(g=g.type,l=g===3||g===4&&l===!0?"":""+l,h?n.setAttributeNS(h,r,l):n.setAttribute(r,l))))}var T=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,U=Symbol.for("react.element"),D=Symbol.for("react.portal"),N=Symbol.for("react.fragment"),O=Symbol.for("react.strict_mode"),b=Symbol.for("react.profiler"),C=Symbol.for("react.provider"),z=Symbol.for("react.context"),K=Symbol.for("react.forward_ref"),B=Symbol.for("react.suspense"),j=Symbol.for("react.suspense_list"),q=Symbol.for("react.memo"),G=Symbol.for("react.lazy"),ne=Symbol.for("react.offscreen"),H=Symbol.iterator;function W(n){return n===null||typeof n!="object"?null:(n=H&&n[H]||n["@@iterator"],typeof n=="function"?n:null)}var se=Object.assign,V;function Z(n){if(V===void 0)try{throw Error()}catch(l){var r=l.stack.trim().match(/\n( *(at )?)/);V=r&&r[1]||""}return`
`+V+n}var be=!1;function re(n,r){if(!n||be)return"";be=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(r)if(r=function(){throw Error()},Object.defineProperty(r.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(r,[])}catch(le){var h=le}Reflect.construct(n,[],r)}else{try{r.call()}catch(le){h=le}n.call(r.prototype)}else{try{throw Error()}catch(le){h=le}n()}}catch(le){if(le&&h&&typeof le.stack=="string"){for(var g=le.stack.split(`
`),S=h.stack.split(`
`),R=g.length-1,k=S.length-1;1<=R&&0<=k&&g[R]!==S[k];)k--;for(;1<=R&&0<=k;R--,k--)if(g[R]!==S[k]){if(R!==1||k!==1)do if(R--,k--,0>k||g[R]!==S[k]){var X=`
`+g[R].replace(" at new "," at ");return n.displayName&&X.includes("<anonymous>")&&(X=X.replace("<anonymous>",n.displayName)),X}while(1<=R&&0<=k);break}}}finally{be=!1,Error.prepareStackTrace=l}return(n=n?n.displayName||n.name:"")?Z(n):""}function de(n){switch(n.tag){case 5:return Z(n.type);case 16:return Z("Lazy");case 13:return Z("Suspense");case 19:return Z("SuspenseList");case 0:case 2:case 15:return n=re(n.type,!1),n;case 11:return n=re(n.type.render,!1),n;case 1:return n=re(n.type,!0),n;default:return""}}function Me(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case N:return"Fragment";case D:return"Portal";case b:return"Profiler";case O:return"StrictMode";case B:return"Suspense";case j:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case z:return(n.displayName||"Context")+".Consumer";case C:return(n._context.displayName||"Context")+".Provider";case K:var r=n.render;return n=n.displayName,n||(n=r.displayName||r.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case q:return r=n.displayName||null,r!==null?r:Me(n.type)||"Memo";case G:r=n._payload,n=n._init;try{return Me(n(r))}catch{}}return null}function _e(n){var r=n.type;switch(n.tag){case 24:return"Cache";case 9:return(r.displayName||"Context")+".Consumer";case 10:return(r._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=r.render,n=n.displayName||n.name||"",r.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return r;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Me(r);case 8:return r===O?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof r=="function")return r.displayName||r.name||null;if(typeof r=="string")return r}return null}function Ce(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function Oe(n){var r=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(r==="checkbox"||r==="radio")}function nt(n){var r=Oe(n)?"checked":"value",l=Object.getOwnPropertyDescriptor(n.constructor.prototype,r),h=""+n[r];if(!n.hasOwnProperty(r)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var g=l.get,S=l.set;return Object.defineProperty(n,r,{configurable:!0,get:function(){return g.call(this)},set:function(R){h=""+R,S.call(this,R)}}),Object.defineProperty(n,r,{enumerable:l.enumerable}),{getValue:function(){return h},setValue:function(R){h=""+R},stopTracking:function(){n._valueTracker=null,delete n[r]}}}}function Dt(n){n._valueTracker||(n._valueTracker=nt(n))}function yt(n){if(!n)return!1;var r=n._valueTracker;if(!r)return!0;var l=r.getValue(),h="";return n&&(h=Oe(n)?n.checked?"true":"false":n.value),n=h,n!==l?(r.setValue(n),!0):!1}function zt(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function te(n,r){var l=r.checked;return se({},r,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:l??n._wrapperState.initialChecked})}function Dn(n,r){var l=r.defaultValue==null?"":r.defaultValue,h=r.checked!=null?r.checked:r.defaultChecked;l=Ce(r.value!=null?r.value:l),n._wrapperState={initialChecked:h,initialValue:l,controlled:r.type==="checkbox"||r.type==="radio"?r.checked!=null:r.value!=null}}function _t(n,r){r=r.checked,r!=null&&A(n,"checked",r,!1)}function mt(n,r){_t(n,r);var l=Ce(r.value),h=r.type;if(l!=null)h==="number"?(l===0&&n.value===""||n.value!=l)&&(n.value=""+l):n.value!==""+l&&(n.value=""+l);else if(h==="submit"||h==="reset"){n.removeAttribute("value");return}r.hasOwnProperty("value")?Lt(n,r.type,l):r.hasOwnProperty("defaultValue")&&Lt(n,r.type,Ce(r.defaultValue)),r.checked==null&&r.defaultChecked!=null&&(n.defaultChecked=!!r.defaultChecked)}function Je(n,r,l){if(r.hasOwnProperty("value")||r.hasOwnProperty("defaultValue")){var h=r.type;if(!(h!=="submit"&&h!=="reset"||r.value!==void 0&&r.value!==null))return;r=""+n._wrapperState.initialValue,l||r===n.value||(n.value=r),n.defaultValue=r}l=n.name,l!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,l!==""&&(n.name=l)}function Lt(n,r,l){(r!=="number"||zt(n.ownerDocument)!==n)&&(l==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+l&&(n.defaultValue=""+l))}var Qe=Array.isArray;function F(n,r,l,h){if(n=n.options,r){r={};for(var g=0;g<l.length;g++)r["$"+l[g]]=!0;for(l=0;l<n.length;l++)g=r.hasOwnProperty("$"+n[l].value),n[l].selected!==g&&(n[l].selected=g),g&&h&&(n[l].defaultSelected=!0)}else{for(l=""+Ce(l),r=null,g=0;g<n.length;g++){if(n[g].value===l){n[g].selected=!0,h&&(n[g].defaultSelected=!0);return}r!==null||n[g].disabled||(r=n[g])}r!==null&&(r.selected=!0)}}function L(n,r){if(r.dangerouslySetInnerHTML!=null)throw Error(t(91));return se({},r,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function ae(n,r){var l=r.value;if(l==null){if(l=r.children,r=r.defaultValue,l!=null){if(r!=null)throw Error(t(92));if(Qe(l)){if(1<l.length)throw Error(t(93));l=l[0]}r=l}r==null&&(r=""),l=r}n._wrapperState={initialValue:Ce(l)}}function me(n,r){var l=Ce(r.value),h=Ce(r.defaultValue);l!=null&&(l=""+l,l!==n.value&&(n.value=l),r.defaultValue==null&&n.defaultValue!==l&&(n.defaultValue=l)),h!=null&&(n.defaultValue=""+h)}function ye(n){var r=n.textContent;r===n._wrapperState.initialValue&&r!==""&&r!==null&&(n.value=r)}function fe(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function qe(n,r){return n==null||n==="http://www.w3.org/1999/xhtml"?fe(r):n==="http://www.w3.org/2000/svg"&&r==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var Pe,ze=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(r,l,h,g){MSApp.execUnsafeLocalFunction(function(){return n(r,l,h,g)})}:n})(function(n,r){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=r;else{for(Pe=Pe||document.createElement("div"),Pe.innerHTML="<svg>"+r.valueOf().toString()+"</svg>",r=Pe.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;r.firstChild;)n.appendChild(r.firstChild)}});function pt(n,r){if(r){var l=n.firstChild;if(l&&l===n.lastChild&&l.nodeType===3){l.nodeValue=r;return}}n.textContent=r}var Ee={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},ke=["Webkit","ms","Moz","O"];Object.keys(Ee).forEach(function(n){ke.forEach(function(r){r=r+n.charAt(0).toUpperCase()+n.substring(1),Ee[r]=Ee[n]})});function it(n,r,l){return r==null||typeof r=="boolean"||r===""?"":l||typeof r!="number"||r===0||Ee.hasOwnProperty(n)&&Ee[n]?(""+r).trim():r+"px"}function rt(n,r){n=n.style;for(var l in r)if(r.hasOwnProperty(l)){var h=l.indexOf("--")===0,g=it(l,r[l],h);l==="float"&&(l="cssFloat"),h?n.setProperty(l,g):n[l]=g}}var He=se({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function gt(n,r){if(r){if(He[n]&&(r.children!=null||r.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(r.dangerouslySetInnerHTML!=null){if(r.children!=null)throw Error(t(60));if(typeof r.dangerouslySetInnerHTML!="object"||!("__html"in r.dangerouslySetInnerHTML))throw Error(t(61))}if(r.style!=null&&typeof r.style!="object")throw Error(t(62))}}function ct(n,r){if(n.indexOf("-")===-1)return typeof r.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Pt=null;function Q(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var Le=null,he=null,pe=null;function De(n){if(n=na(n)){if(typeof Le!="function")throw Error(t(280));var r=n.stateNode;r&&(r=cl(r),Le(n.stateNode,n.type,r))}}function Ie(n){he?pe?pe.push(n):pe=[n]:he=n}function ut(){if(he){var n=he,r=pe;if(pe=he=null,De(n),r)for(n=0;n<r.length;n++)De(r[n])}}function Ht(n,r){return n(r)}function an(){}var Et=!1;function kn(n,r,l){if(Et)return n(r,l);Et=!0;try{return Ht(n,r,l)}finally{Et=!1,(he!==null||pe!==null)&&(an(),ut())}}function Nn(n,r){var l=n.stateNode;if(l===null)return null;var h=cl(l);if(h===null)return null;l=h[r];e:switch(r){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(h=!h.disabled)||(n=n.type,h=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!h;break e;default:n=!1}if(n)return null;if(l&&typeof l!="function")throw Error(t(231,r,typeof l));return l}var Fs=!1;if(u)try{var xr={};Object.defineProperty(xr,"passive",{get:function(){Fs=!0}}),window.addEventListener("test",xr,xr),window.removeEventListener("test",xr,xr)}catch{Fs=!1}function qi(n,r,l,h,g,S,R,k,X){var le=Array.prototype.slice.call(arguments,3);try{r.apply(l,le)}catch(xe){this.onError(xe)}}var Yi=!1,Jr=null,es=!1,Sr=null,Ga={onError:function(n){Yi=!0,Jr=n}};function Os(n,r,l,h,g,S,R,k,X){Yi=!1,Jr=null,qi.apply(Ga,arguments)}function Wa(n,r,l,h,g,S,R,k,X){if(Os.apply(this,arguments),Yi){if(Yi){var le=Jr;Yi=!1,Jr=null}else throw Error(t(198));es||(es=!0,Sr=le)}}function Ni(n){var r=n,l=n;if(n.alternate)for(;r.return;)r=r.return;else{n=r;do r=n,(r.flags&4098)!==0&&(l=r.return),n=r.return;while(n)}return r.tag===3?l:null}function Xa(n){if(n.tag===13){var r=n.memoizedState;if(r===null&&(n=n.alternate,n!==null&&(r=n.memoizedState)),r!==null)return r.dehydrated}return null}function ja(n){if(Ni(n)!==n)throw Error(t(188))}function Zc(n){var r=n.alternate;if(!r){if(r=Ni(n),r===null)throw Error(t(188));return r!==n?null:n}for(var l=n,h=r;;){var g=l.return;if(g===null)break;var S=g.alternate;if(S===null){if(h=g.return,h!==null){l=h;continue}break}if(g.child===S.child){for(S=g.child;S;){if(S===l)return ja(g),n;if(S===h)return ja(g),r;S=S.sibling}throw Error(t(188))}if(l.return!==h.return)l=g,h=S;else{for(var R=!1,k=g.child;k;){if(k===l){R=!0,l=g,h=S;break}if(k===h){R=!0,h=g,l=S;break}k=k.sibling}if(!R){for(k=S.child;k;){if(k===l){R=!0,l=S,h=g;break}if(k===h){R=!0,h=S,l=g;break}k=k.sibling}if(!R)throw Error(t(189))}}if(l.alternate!==h)throw Error(t(190))}if(l.tag!==3)throw Error(t(188));return l.stateNode.current===l?n:r}function I(n){return n=Zc(n),n!==null?J(n):null}function J(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var r=J(n);if(r!==null)return r;n=n.sibling}return null}var ce=e.unstable_scheduleCallback,ue=e.unstable_cancelCallback,ee=e.unstable_shouldYield,Ae=e.unstable_requestPaint,we=e.unstable_now,Ye=e.unstable_getCurrentPriorityLevel,We=e.unstable_ImmediatePriority,st=e.unstable_UserBlockingPriority,lt=e.unstable_NormalPriority,$e=e.unstable_LowPriority,St=e.unstable_IdlePriority,bt=null,xt=null;function Mn(n){if(xt&&typeof xt.onCommitFiberRoot=="function")try{xt.onCommitFiberRoot(bt,n,void 0,(n.current.flags&128)===128)}catch{}}var ht=Math.clz32?Math.clz32:Ct,Ke=Math.log,vi=Math.LN2;function Ct(n){return n>>>=0,n===0?32:31-(Ke(n)/vi|0)|0}var En=64,_i=4194304;function ln(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function Ui(n,r){var l=n.pendingLanes;if(l===0)return 0;var h=0,g=n.suspendedLanes,S=n.pingedLanes,R=l&268435455;if(R!==0){var k=R&~g;k!==0?h=ln(k):(S&=R,S!==0&&(h=ln(S)))}else R=l&~g,R!==0?h=ln(R):S!==0&&(h=ln(S));if(h===0)return 0;if(r!==0&&r!==h&&(r&g)===0&&(g=h&-h,S=r&-r,g>=S||g===16&&(S&4194240)!==0))return r;if((h&4)!==0&&(h|=l&16),r=n.entangledLanes,r!==0)for(n=n.entanglements,r&=h;0<r;)l=31-ht(r),g=1<<l,h|=n[l],r&=~g;return h}function Ft(n,r){switch(n){case 1:case 2:case 4:return r+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return r+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ai(n,r){for(var l=n.suspendedLanes,h=n.pingedLanes,g=n.expirationTimes,S=n.pendingLanes;0<S;){var R=31-ht(S),k=1<<R,X=g[R];X===-1?((k&l)===0||(k&h)!==0)&&(g[R]=Ft(k,r)):X<=r&&(n.expiredLanes|=k),S&=~k}}function $i(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function Un(){var n=En;return En<<=1,(En&4194240)===0&&(En=64),n}function li(n){for(var r=[],l=0;31>l;l++)r.push(n);return r}function Hn(n,r,l){n.pendingLanes|=r,r!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,r=31-ht(r),n[r]=l}function qa(n,r){var l=n.pendingLanes&~r;n.pendingLanes=r,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=r,n.mutableReadLanes&=r,n.entangledLanes&=r,r=n.entanglements;var h=n.eventTimes;for(n=n.expirationTimes;0<l;){var g=31-ht(l),S=1<<g;r[g]=0,h[g]=-1,n[g]=-1,l&=~S}}function Kc(n,r){var l=n.entangledLanes|=r;for(n=n.entanglements;l;){var h=31-ht(l),g=1<<h;g&r|n[h]&r&&(n[h]|=r),l&=~g}}var It=0;function bf(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Pf,Qc,Lf,If,Df,Jc=!1,Ya=[],Mr=null,Er=null,wr=null,ko=new Map,Ho=new Map,Tr=[],B0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Nf(n,r){switch(n){case"focusin":case"focusout":Mr=null;break;case"dragenter":case"dragleave":Er=null;break;case"mouseover":case"mouseout":wr=null;break;case"pointerover":case"pointerout":ko.delete(r.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ho.delete(r.pointerId)}}function Vo(n,r,l,h,g,S){return n===null||n.nativeEvent!==S?(n={blockedOn:r,domEventName:l,eventSystemFlags:h,nativeEvent:S,targetContainers:[g]},r!==null&&(r=na(r),r!==null&&Qc(r)),n):(n.eventSystemFlags|=h,r=n.targetContainers,g!==null&&r.indexOf(g)===-1&&r.push(g),n)}function k0(n,r,l,h,g){switch(r){case"focusin":return Mr=Vo(Mr,n,r,l,h,g),!0;case"dragenter":return Er=Vo(Er,n,r,l,h,g),!0;case"mouseover":return wr=Vo(wr,n,r,l,h,g),!0;case"pointerover":var S=g.pointerId;return ko.set(S,Vo(ko.get(S)||null,n,r,l,h,g)),!0;case"gotpointercapture":return S=g.pointerId,Ho.set(S,Vo(Ho.get(S)||null,n,r,l,h,g)),!0}return!1}function Uf(n){var r=ts(n.target);if(r!==null){var l=Ni(r);if(l!==null){if(r=l.tag,r===13){if(r=Xa(l),r!==null){n.blockedOn=r,Df(n.priority,function(){Lf(l)});return}}else if(r===3&&l.stateNode.current.memoizedState.isDehydrated){n.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}n.blockedOn=null}function $a(n){if(n.blockedOn!==null)return!1;for(var r=n.targetContainers;0<r.length;){var l=tu(n.domEventName,n.eventSystemFlags,r[0],n.nativeEvent);if(l===null){l=n.nativeEvent;var h=new l.constructor(l.type,l);Pt=h,l.target.dispatchEvent(h),Pt=null}else return r=na(l),r!==null&&Qc(r),n.blockedOn=l,!1;r.shift()}return!0}function Ff(n,r,l){$a(n)&&l.delete(r)}function H0(){Jc=!1,Mr!==null&&$a(Mr)&&(Mr=null),Er!==null&&$a(Er)&&(Er=null),wr!==null&&$a(wr)&&(wr=null),ko.forEach(Ff),Ho.forEach(Ff)}function Go(n,r){n.blockedOn===r&&(n.blockedOn=null,Jc||(Jc=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,H0)))}function Wo(n){function r(g){return Go(g,n)}if(0<Ya.length){Go(Ya[0],n);for(var l=1;l<Ya.length;l++){var h=Ya[l];h.blockedOn===n&&(h.blockedOn=null)}}for(Mr!==null&&Go(Mr,n),Er!==null&&Go(Er,n),wr!==null&&Go(wr,n),ko.forEach(r),Ho.forEach(r),l=0;l<Tr.length;l++)h=Tr[l],h.blockedOn===n&&(h.blockedOn=null);for(;0<Tr.length&&(l=Tr[0],l.blockedOn===null);)Uf(l),l.blockedOn===null&&Tr.shift()}var zs=T.ReactCurrentBatchConfig,Za=!0;function V0(n,r,l,h){var g=It,S=zs.transition;zs.transition=null;try{It=1,eu(n,r,l,h)}finally{It=g,zs.transition=S}}function G0(n,r,l,h){var g=It,S=zs.transition;zs.transition=null;try{It=4,eu(n,r,l,h)}finally{It=g,zs.transition=S}}function eu(n,r,l,h){if(Za){var g=tu(n,r,l,h);if(g===null)_u(n,r,h,Ka,l),Nf(n,h);else if(k0(g,n,r,l,h))h.stopPropagation();else if(Nf(n,h),r&4&&-1<B0.indexOf(n)){for(;g!==null;){var S=na(g);if(S!==null&&Pf(S),S=tu(n,r,l,h),S===null&&_u(n,r,h,Ka,l),S===g)break;g=S}g!==null&&h.stopPropagation()}else _u(n,r,h,null,l)}}var Ka=null;function tu(n,r,l,h){if(Ka=null,n=Q(h),n=ts(n),n!==null)if(r=Ni(n),r===null)n=null;else if(l=r.tag,l===13){if(n=Xa(r),n!==null)return n;n=null}else if(l===3){if(r.stateNode.current.memoizedState.isDehydrated)return r.tag===3?r.stateNode.containerInfo:null;n=null}else r!==n&&(n=null);return Ka=n,null}function Of(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ye()){case We:return 1;case st:return 4;case lt:case $e:return 16;case St:return 536870912;default:return 16}default:return 16}}var Ar=null,nu=null,Qa=null;function zf(){if(Qa)return Qa;var n,r=nu,l=r.length,h,g="value"in Ar?Ar.value:Ar.textContent,S=g.length;for(n=0;n<l&&r[n]===g[n];n++);var R=l-n;for(h=1;h<=R&&r[l-h]===g[S-h];h++);return Qa=g.slice(n,1<h?1-h:void 0)}function Ja(n){var r=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&r===13&&(n=13)):n=r,n===10&&(n=13),32<=n||n===13?n:0}function el(){return!0}function Bf(){return!1}function Jn(n){function r(l,h,g,S,R){this._reactName=l,this._targetInst=g,this.type=h,this.nativeEvent=S,this.target=R,this.currentTarget=null;for(var k in n)n.hasOwnProperty(k)&&(l=n[k],this[k]=l?l(S):S[k]);return this.isDefaultPrevented=(S.defaultPrevented!=null?S.defaultPrevented:S.returnValue===!1)?el:Bf,this.isPropagationStopped=Bf,this}return se(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=el)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=el)},persist:function(){},isPersistent:el}),r}var Bs={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},iu=Jn(Bs),Xo=se({},Bs,{view:0,detail:0}),W0=Jn(Xo),ru,su,jo,tl=se({},Xo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:au,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==jo&&(jo&&n.type==="mousemove"?(ru=n.screenX-jo.screenX,su=n.screenY-jo.screenY):su=ru=0,jo=n),ru)},movementY:function(n){return"movementY"in n?n.movementY:su}}),kf=Jn(tl),X0=se({},tl,{dataTransfer:0}),j0=Jn(X0),q0=se({},Xo,{relatedTarget:0}),ou=Jn(q0),Y0=se({},Bs,{animationName:0,elapsedTime:0,pseudoElement:0}),$0=Jn(Y0),Z0=se({},Bs,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),K0=Jn(Z0),Q0=se({},Bs,{data:0}),Hf=Jn(Q0),J0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},e_={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},t_={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function n_(n){var r=this.nativeEvent;return r.getModifierState?r.getModifierState(n):(n=t_[n])?!!r[n]:!1}function au(){return n_}var i_=se({},Xo,{key:function(n){if(n.key){var r=J0[n.key]||n.key;if(r!=="Unidentified")return r}return n.type==="keypress"?(n=Ja(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?e_[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:au,charCode:function(n){return n.type==="keypress"?Ja(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ja(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),r_=Jn(i_),s_=se({},tl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Vf=Jn(s_),o_=se({},Xo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:au}),a_=Jn(o_),l_=se({},Bs,{propertyName:0,elapsedTime:0,pseudoElement:0}),c_=Jn(l_),u_=se({},tl,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),h_=Jn(u_),d_=[9,13,27,32],lu=u&&"CompositionEvent"in window,qo=null;u&&"documentMode"in document&&(qo=document.documentMode);var f_=u&&"TextEvent"in window&&!qo,Gf=u&&(!lu||qo&&8<qo&&11>=qo),Wf=" ",Xf=!1;function jf(n,r){switch(n){case"keyup":return d_.indexOf(r.keyCode)!==-1;case"keydown":return r.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function qf(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var ks=!1;function p_(n,r){switch(n){case"compositionend":return qf(r);case"keypress":return r.which!==32?null:(Xf=!0,Wf);case"textInput":return n=r.data,n===Wf&&Xf?null:n;default:return null}}function m_(n,r){if(ks)return n==="compositionend"||!lu&&jf(n,r)?(n=zf(),Qa=nu=Ar=null,ks=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(r.ctrlKey||r.altKey||r.metaKey)||r.ctrlKey&&r.altKey){if(r.char&&1<r.char.length)return r.char;if(r.which)return String.fromCharCode(r.which)}return null;case"compositionend":return Gf&&r.locale!=="ko"?null:r.data;default:return null}}var g_={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Yf(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r==="input"?!!g_[n.type]:r==="textarea"}function $f(n,r,l,h){Ie(h),r=ol(r,"onChange"),0<r.length&&(l=new iu("onChange","change",null,l,h),n.push({event:l,listeners:r}))}var Yo=null,$o=null;function v_(n){fp(n,0)}function nl(n){var r=Xs(n);if(yt(r))return n}function __(n,r){if(n==="change")return r}var Zf=!1;if(u){var cu;if(u){var uu="oninput"in document;if(!uu){var Kf=document.createElement("div");Kf.setAttribute("oninput","return;"),uu=typeof Kf.oninput=="function"}cu=uu}else cu=!1;Zf=cu&&(!document.documentMode||9<document.documentMode)}function Qf(){Yo&&(Yo.detachEvent("onpropertychange",Jf),$o=Yo=null)}function Jf(n){if(n.propertyName==="value"&&nl($o)){var r=[];$f(r,$o,n,Q(n)),kn(v_,r)}}function y_(n,r,l){n==="focusin"?(Qf(),Yo=r,$o=l,Yo.attachEvent("onpropertychange",Jf)):n==="focusout"&&Qf()}function x_(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return nl($o)}function S_(n,r){if(n==="click")return nl(r)}function M_(n,r){if(n==="input"||n==="change")return nl(r)}function E_(n,r){return n===r&&(n!==0||1/n===1/r)||n!==n&&r!==r}var yi=typeof Object.is=="function"?Object.is:E_;function Zo(n,r){if(yi(n,r))return!0;if(typeof n!="object"||n===null||typeof r!="object"||r===null)return!1;var l=Object.keys(n),h=Object.keys(r);if(l.length!==h.length)return!1;for(h=0;h<l.length;h++){var g=l[h];if(!d.call(r,g)||!yi(n[g],r[g]))return!1}return!0}function ep(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function tp(n,r){var l=ep(n);n=0;for(var h;l;){if(l.nodeType===3){if(h=n+l.textContent.length,n<=r&&h>=r)return{node:l,offset:r-n};n=h}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=ep(l)}}function np(n,r){return n&&r?n===r?!0:n&&n.nodeType===3?!1:r&&r.nodeType===3?np(n,r.parentNode):"contains"in n?n.contains(r):n.compareDocumentPosition?!!(n.compareDocumentPosition(r)&16):!1:!1}function ip(){for(var n=window,r=zt();r instanceof n.HTMLIFrameElement;){try{var l=typeof r.contentWindow.location.href=="string"}catch{l=!1}if(l)n=r.contentWindow;else break;r=zt(n.document)}return r}function hu(n){var r=n&&n.nodeName&&n.nodeName.toLowerCase();return r&&(r==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||r==="textarea"||n.contentEditable==="true")}function w_(n){var r=ip(),l=n.focusedElem,h=n.selectionRange;if(r!==l&&l&&l.ownerDocument&&np(l.ownerDocument.documentElement,l)){if(h!==null&&hu(l)){if(r=h.start,n=h.end,n===void 0&&(n=r),"selectionStart"in l)l.selectionStart=r,l.selectionEnd=Math.min(n,l.value.length);else if(n=(r=l.ownerDocument||document)&&r.defaultView||window,n.getSelection){n=n.getSelection();var g=l.textContent.length,S=Math.min(h.start,g);h=h.end===void 0?S:Math.min(h.end,g),!n.extend&&S>h&&(g=h,h=S,S=g),g=tp(l,S);var R=tp(l,h);g&&R&&(n.rangeCount!==1||n.anchorNode!==g.node||n.anchorOffset!==g.offset||n.focusNode!==R.node||n.focusOffset!==R.offset)&&(r=r.createRange(),r.setStart(g.node,g.offset),n.removeAllRanges(),S>h?(n.addRange(r),n.extend(R.node,R.offset)):(r.setEnd(R.node,R.offset),n.addRange(r)))}}for(r=[],n=l;n=n.parentNode;)n.nodeType===1&&r.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<r.length;l++)n=r[l],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var T_=u&&"documentMode"in document&&11>=document.documentMode,Hs=null,du=null,Ko=null,fu=!1;function rp(n,r,l){var h=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;fu||Hs==null||Hs!==zt(h)||(h=Hs,"selectionStart"in h&&hu(h)?h={start:h.selectionStart,end:h.selectionEnd}:(h=(h.ownerDocument&&h.ownerDocument.defaultView||window).getSelection(),h={anchorNode:h.anchorNode,anchorOffset:h.anchorOffset,focusNode:h.focusNode,focusOffset:h.focusOffset}),Ko&&Zo(Ko,h)||(Ko=h,h=ol(du,"onSelect"),0<h.length&&(r=new iu("onSelect","select",null,r,l),n.push({event:r,listeners:h}),r.target=Hs)))}function il(n,r){var l={};return l[n.toLowerCase()]=r.toLowerCase(),l["Webkit"+n]="webkit"+r,l["Moz"+n]="moz"+r,l}var Vs={animationend:il("Animation","AnimationEnd"),animationiteration:il("Animation","AnimationIteration"),animationstart:il("Animation","AnimationStart"),transitionend:il("Transition","TransitionEnd")},pu={},sp={};u&&(sp=document.createElement("div").style,"AnimationEvent"in window||(delete Vs.animationend.animation,delete Vs.animationiteration.animation,delete Vs.animationstart.animation),"TransitionEvent"in window||delete Vs.transitionend.transition);function rl(n){if(pu[n])return pu[n];if(!Vs[n])return n;var r=Vs[n],l;for(l in r)if(r.hasOwnProperty(l)&&l in sp)return pu[n]=r[l];return n}var op=rl("animationend"),ap=rl("animationiteration"),lp=rl("animationstart"),cp=rl("transitionend"),up=new Map,hp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Cr(n,r){up.set(n,r),o(r,[n])}for(var mu=0;mu<hp.length;mu++){var gu=hp[mu],A_=gu.toLowerCase(),C_=gu[0].toUpperCase()+gu.slice(1);Cr(A_,"on"+C_)}Cr(op,"onAnimationEnd"),Cr(ap,"onAnimationIteration"),Cr(lp,"onAnimationStart"),Cr("dblclick","onDoubleClick"),Cr("focusin","onFocus"),Cr("focusout","onBlur"),Cr(cp,"onTransitionEnd"),c("onMouseEnter",["mouseout","mouseover"]),c("onMouseLeave",["mouseout","mouseover"]),c("onPointerEnter",["pointerout","pointerover"]),c("onPointerLeave",["pointerout","pointerover"]),o("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),o("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),o("onBeforeInput",["compositionend","keypress","textInput","paste"]),o("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),o("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),o("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Qo="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),R_=new Set("cancel close invalid load scroll toggle".split(" ").concat(Qo));function dp(n,r,l){var h=n.type||"unknown-event";n.currentTarget=l,Wa(h,r,void 0,n),n.currentTarget=null}function fp(n,r){r=(r&4)!==0;for(var l=0;l<n.length;l++){var h=n[l],g=h.event;h=h.listeners;e:{var S=void 0;if(r)for(var R=h.length-1;0<=R;R--){var k=h[R],X=k.instance,le=k.currentTarget;if(k=k.listener,X!==S&&g.isPropagationStopped())break e;dp(g,k,le),S=X}else for(R=0;R<h.length;R++){if(k=h[R],X=k.instance,le=k.currentTarget,k=k.listener,X!==S&&g.isPropagationStopped())break e;dp(g,k,le),S=X}}}if(es)throw n=Sr,es=!1,Sr=null,n}function Vt(n,r){var l=r[wu];l===void 0&&(l=r[wu]=new Set);var h=n+"__bubble";l.has(h)||(pp(r,n,2,!1),l.add(h))}function vu(n,r,l){var h=0;r&&(h|=4),pp(l,n,h,r)}var sl="_reactListening"+Math.random().toString(36).slice(2);function Jo(n){if(!n[sl]){n[sl]=!0,i.forEach(function(l){l!=="selectionchange"&&(R_.has(l)||vu(l,!1,n),vu(l,!0,n))});var r=n.nodeType===9?n:n.ownerDocument;r===null||r[sl]||(r[sl]=!0,vu("selectionchange",!1,r))}}function pp(n,r,l,h){switch(Of(r)){case 1:var g=V0;break;case 4:g=G0;break;default:g=eu}l=g.bind(null,r,l,n),g=void 0,!Fs||r!=="touchstart"&&r!=="touchmove"&&r!=="wheel"||(g=!0),h?g!==void 0?n.addEventListener(r,l,{capture:!0,passive:g}):n.addEventListener(r,l,!0):g!==void 0?n.addEventListener(r,l,{passive:g}):n.addEventListener(r,l,!1)}function _u(n,r,l,h,g){var S=h;if((r&1)===0&&(r&2)===0&&h!==null)e:for(;;){if(h===null)return;var R=h.tag;if(R===3||R===4){var k=h.stateNode.containerInfo;if(k===g||k.nodeType===8&&k.parentNode===g)break;if(R===4)for(R=h.return;R!==null;){var X=R.tag;if((X===3||X===4)&&(X=R.stateNode.containerInfo,X===g||X.nodeType===8&&X.parentNode===g))return;R=R.return}for(;k!==null;){if(R=ts(k),R===null)return;if(X=R.tag,X===5||X===6){h=S=R;continue e}k=k.parentNode}}h=h.return}kn(function(){var le=S,xe=Q(l),Se=[];e:{var ge=up.get(n);if(ge!==void 0){var Ue=iu,Ve=n;switch(n){case"keypress":if(Ja(l)===0)break e;case"keydown":case"keyup":Ue=r_;break;case"focusin":Ve="focus",Ue=ou;break;case"focusout":Ve="blur",Ue=ou;break;case"beforeblur":case"afterblur":Ue=ou;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":Ue=kf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":Ue=j0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":Ue=a_;break;case op:case ap:case lp:Ue=$0;break;case cp:Ue=c_;break;case"scroll":Ue=W0;break;case"wheel":Ue=h_;break;case"copy":case"cut":case"paste":Ue=K0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":Ue=Vf}var Xe=(r&4)!==0,Jt=!Xe&&n==="scroll",ie=Xe?ge!==null?ge+"Capture":null:ge;Xe=[];for(var $=le,oe;$!==null;){oe=$;var Te=oe.stateNode;if(oe.tag===5&&Te!==null&&(oe=Te,ie!==null&&(Te=Nn($,ie),Te!=null&&Xe.push(ea($,Te,oe)))),Jt)break;$=$.return}0<Xe.length&&(ge=new Ue(ge,Ve,null,l,xe),Se.push({event:ge,listeners:Xe}))}}if((r&7)===0){e:{if(ge=n==="mouseover"||n==="pointerover",Ue=n==="mouseout"||n==="pointerout",ge&&l!==Pt&&(Ve=l.relatedTarget||l.fromElement)&&(ts(Ve)||Ve[Zi]))break e;if((Ue||ge)&&(ge=xe.window===xe?xe:(ge=xe.ownerDocument)?ge.defaultView||ge.parentWindow:window,Ue?(Ve=l.relatedTarget||l.toElement,Ue=le,Ve=Ve?ts(Ve):null,Ve!==null&&(Jt=Ni(Ve),Ve!==Jt||Ve.tag!==5&&Ve.tag!==6)&&(Ve=null)):(Ue=null,Ve=le),Ue!==Ve)){if(Xe=kf,Te="onMouseLeave",ie="onMouseEnter",$="mouse",(n==="pointerout"||n==="pointerover")&&(Xe=Vf,Te="onPointerLeave",ie="onPointerEnter",$="pointer"),Jt=Ue==null?ge:Xs(Ue),oe=Ve==null?ge:Xs(Ve),ge=new Xe(Te,$+"leave",Ue,l,xe),ge.target=Jt,ge.relatedTarget=oe,Te=null,ts(xe)===le&&(Xe=new Xe(ie,$+"enter",Ve,l,xe),Xe.target=oe,Xe.relatedTarget=Jt,Te=Xe),Jt=Te,Ue&&Ve)t:{for(Xe=Ue,ie=Ve,$=0,oe=Xe;oe;oe=Gs(oe))$++;for(oe=0,Te=ie;Te;Te=Gs(Te))oe++;for(;0<$-oe;)Xe=Gs(Xe),$--;for(;0<oe-$;)ie=Gs(ie),oe--;for(;$--;){if(Xe===ie||ie!==null&&Xe===ie.alternate)break t;Xe=Gs(Xe),ie=Gs(ie)}Xe=null}else Xe=null;Ue!==null&&mp(Se,ge,Ue,Xe,!1),Ve!==null&&Jt!==null&&mp(Se,Jt,Ve,Xe,!0)}}e:{if(ge=le?Xs(le):window,Ue=ge.nodeName&&ge.nodeName.toLowerCase(),Ue==="select"||Ue==="input"&&ge.type==="file")var Ze=__;else if(Yf(ge))if(Zf)Ze=M_;else{Ze=x_;var et=y_}else(Ue=ge.nodeName)&&Ue.toLowerCase()==="input"&&(ge.type==="checkbox"||ge.type==="radio")&&(Ze=S_);if(Ze&&(Ze=Ze(n,le))){$f(Se,Ze,l,xe);break e}et&&et(n,ge,le),n==="focusout"&&(et=ge._wrapperState)&&et.controlled&&ge.type==="number"&&Lt(ge,"number",ge.value)}switch(et=le?Xs(le):window,n){case"focusin":(Yf(et)||et.contentEditable==="true")&&(Hs=et,du=le,Ko=null);break;case"focusout":Ko=du=Hs=null;break;case"mousedown":fu=!0;break;case"contextmenu":case"mouseup":case"dragend":fu=!1,rp(Se,l,xe);break;case"selectionchange":if(T_)break;case"keydown":case"keyup":rp(Se,l,xe)}var tt;if(lu)e:{switch(n){case"compositionstart":var ot="onCompositionStart";break e;case"compositionend":ot="onCompositionEnd";break e;case"compositionupdate":ot="onCompositionUpdate";break e}ot=void 0}else ks?jf(n,l)&&(ot="onCompositionEnd"):n==="keydown"&&l.keyCode===229&&(ot="onCompositionStart");ot&&(Gf&&l.locale!=="ko"&&(ks||ot!=="onCompositionStart"?ot==="onCompositionEnd"&&ks&&(tt=zf()):(Ar=xe,nu="value"in Ar?Ar.value:Ar.textContent,ks=!0)),et=ol(le,ot),0<et.length&&(ot=new Hf(ot,n,null,l,xe),Se.push({event:ot,listeners:et}),tt?ot.data=tt:(tt=qf(l),tt!==null&&(ot.data=tt)))),(tt=f_?p_(n,l):m_(n,l))&&(le=ol(le,"onBeforeInput"),0<le.length&&(xe=new Hf("onBeforeInput","beforeinput",null,l,xe),Se.push({event:xe,listeners:le}),xe.data=tt))}fp(Se,r)})}function ea(n,r,l){return{instance:n,listener:r,currentTarget:l}}function ol(n,r){for(var l=r+"Capture",h=[];n!==null;){var g=n,S=g.stateNode;g.tag===5&&S!==null&&(g=S,S=Nn(n,l),S!=null&&h.unshift(ea(n,S,g)),S=Nn(n,r),S!=null&&h.push(ea(n,S,g))),n=n.return}return h}function Gs(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function mp(n,r,l,h,g){for(var S=r._reactName,R=[];l!==null&&l!==h;){var k=l,X=k.alternate,le=k.stateNode;if(X!==null&&X===h)break;k.tag===5&&le!==null&&(k=le,g?(X=Nn(l,S),X!=null&&R.unshift(ea(l,X,k))):g||(X=Nn(l,S),X!=null&&R.push(ea(l,X,k)))),l=l.return}R.length!==0&&n.push({event:r,listeners:R})}var b_=/\r\n?/g,P_=/\u0000|\uFFFD/g;function gp(n){return(typeof n=="string"?n:""+n).replace(b_,`
`).replace(P_,"")}function al(n,r,l){if(r=gp(r),gp(n)!==r&&l)throw Error(t(425))}function ll(){}var yu=null,xu=null;function Su(n,r){return n==="textarea"||n==="noscript"||typeof r.children=="string"||typeof r.children=="number"||typeof r.dangerouslySetInnerHTML=="object"&&r.dangerouslySetInnerHTML!==null&&r.dangerouslySetInnerHTML.__html!=null}var Mu=typeof setTimeout=="function"?setTimeout:void 0,L_=typeof clearTimeout=="function"?clearTimeout:void 0,vp=typeof Promise=="function"?Promise:void 0,I_=typeof queueMicrotask=="function"?queueMicrotask:typeof vp<"u"?function(n){return vp.resolve(null).then(n).catch(D_)}:Mu;function D_(n){setTimeout(function(){throw n})}function Eu(n,r){var l=r,h=0;do{var g=l.nextSibling;if(n.removeChild(l),g&&g.nodeType===8)if(l=g.data,l==="/$"){if(h===0){n.removeChild(g),Wo(r);return}h--}else l!=="$"&&l!=="$?"&&l!=="$!"||h++;l=g}while(l);Wo(r)}function Rr(n){for(;n!=null;n=n.nextSibling){var r=n.nodeType;if(r===1||r===3)break;if(r===8){if(r=n.data,r==="$"||r==="$!"||r==="$?")break;if(r==="/$")return null}}return n}function _p(n){n=n.previousSibling;for(var r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="$"||l==="$!"||l==="$?"){if(r===0)return n;r--}else l==="/$"&&r++}n=n.previousSibling}return null}var Ws=Math.random().toString(36).slice(2),Fi="__reactFiber$"+Ws,ta="__reactProps$"+Ws,Zi="__reactContainer$"+Ws,wu="__reactEvents$"+Ws,N_="__reactListeners$"+Ws,U_="__reactHandles$"+Ws;function ts(n){var r=n[Fi];if(r)return r;for(var l=n.parentNode;l;){if(r=l[Zi]||l[Fi]){if(l=r.alternate,r.child!==null||l!==null&&l.child!==null)for(n=_p(n);n!==null;){if(l=n[Fi])return l;n=_p(n)}return r}n=l,l=n.parentNode}return null}function na(n){return n=n[Fi]||n[Zi],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function Xs(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function cl(n){return n[ta]||null}var Tu=[],js=-1;function br(n){return{current:n}}function Gt(n){0>js||(n.current=Tu[js],Tu[js]=null,js--)}function Bt(n,r){js++,Tu[js]=n.current,n.current=r}var Pr={},wn=br(Pr),Vn=br(!1),ns=Pr;function qs(n,r){var l=n.type.contextTypes;if(!l)return Pr;var h=n.stateNode;if(h&&h.__reactInternalMemoizedUnmaskedChildContext===r)return h.__reactInternalMemoizedMaskedChildContext;var g={},S;for(S in l)g[S]=r[S];return h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=r,n.__reactInternalMemoizedMaskedChildContext=g),g}function Gn(n){return n=n.childContextTypes,n!=null}function ul(){Gt(Vn),Gt(wn)}function yp(n,r,l){if(wn.current!==Pr)throw Error(t(168));Bt(wn,r),Bt(Vn,l)}function xp(n,r,l){var h=n.stateNode;if(r=r.childContextTypes,typeof h.getChildContext!="function")return l;h=h.getChildContext();for(var g in h)if(!(g in r))throw Error(t(108,_e(n)||"Unknown",g));return se({},l,h)}function hl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||Pr,ns=wn.current,Bt(wn,n),Bt(Vn,Vn.current),!0}function Sp(n,r,l){var h=n.stateNode;if(!h)throw Error(t(169));l?(n=xp(n,r,ns),h.__reactInternalMemoizedMergedChildContext=n,Gt(Vn),Gt(wn),Bt(wn,n)):Gt(Vn),Bt(Vn,l)}var Ki=null,dl=!1,Au=!1;function Mp(n){Ki===null?Ki=[n]:Ki.push(n)}function F_(n){dl=!0,Mp(n)}function Lr(){if(!Au&&Ki!==null){Au=!0;var n=0,r=It;try{var l=Ki;for(It=1;n<l.length;n++){var h=l[n];do h=h(!0);while(h!==null)}Ki=null,dl=!1}catch(g){throw Ki!==null&&(Ki=Ki.slice(n+1)),ce(We,Lr),g}finally{It=r,Au=!1}}return null}var Ys=[],$s=0,fl=null,pl=0,ci=[],ui=0,is=null,Qi=1,Ji="";function rs(n,r){Ys[$s++]=pl,Ys[$s++]=fl,fl=n,pl=r}function Ep(n,r,l){ci[ui++]=Qi,ci[ui++]=Ji,ci[ui++]=is,is=n;var h=Qi;n=Ji;var g=32-ht(h)-1;h&=~(1<<g),l+=1;var S=32-ht(r)+g;if(30<S){var R=g-g%5;S=(h&(1<<R)-1).toString(32),h>>=R,g-=R,Qi=1<<32-ht(r)+g|l<<g|h,Ji=S+n}else Qi=1<<S|l<<g|h,Ji=n}function Cu(n){n.return!==null&&(rs(n,1),Ep(n,1,0))}function Ru(n){for(;n===fl;)fl=Ys[--$s],Ys[$s]=null,pl=Ys[--$s],Ys[$s]=null;for(;n===is;)is=ci[--ui],ci[ui]=null,Ji=ci[--ui],ci[ui]=null,Qi=ci[--ui],ci[ui]=null}var ei=null,ti=null,Xt=!1,xi=null;function wp(n,r){var l=pi(5,null,null,0);l.elementType="DELETED",l.stateNode=r,l.return=n,r=n.deletions,r===null?(n.deletions=[l],n.flags|=16):r.push(l)}function Tp(n,r){switch(n.tag){case 5:var l=n.type;return r=r.nodeType!==1||l.toLowerCase()!==r.nodeName.toLowerCase()?null:r,r!==null?(n.stateNode=r,ei=n,ti=Rr(r.firstChild),!0):!1;case 6:return r=n.pendingProps===""||r.nodeType!==3?null:r,r!==null?(n.stateNode=r,ei=n,ti=null,!0):!1;case 13:return r=r.nodeType!==8?null:r,r!==null?(l=is!==null?{id:Qi,overflow:Ji}:null,n.memoizedState={dehydrated:r,treeContext:l,retryLane:1073741824},l=pi(18,null,null,0),l.stateNode=r,l.return=n,n.child=l,ei=n,ti=null,!0):!1;default:return!1}}function bu(n){return(n.mode&1)!==0&&(n.flags&128)===0}function Pu(n){if(Xt){var r=ti;if(r){var l=r;if(!Tp(n,r)){if(bu(n))throw Error(t(418));r=Rr(l.nextSibling);var h=ei;r&&Tp(n,r)?wp(h,l):(n.flags=n.flags&-4097|2,Xt=!1,ei=n)}}else{if(bu(n))throw Error(t(418));n.flags=n.flags&-4097|2,Xt=!1,ei=n}}}function Ap(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;ei=n}function ml(n){if(n!==ei)return!1;if(!Xt)return Ap(n),Xt=!0,!1;var r;if((r=n.tag!==3)&&!(r=n.tag!==5)&&(r=n.type,r=r!=="head"&&r!=="body"&&!Su(n.type,n.memoizedProps)),r&&(r=ti)){if(bu(n))throw Cp(),Error(t(418));for(;r;)wp(n,r),r=Rr(r.nextSibling)}if(Ap(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,r=0;n;){if(n.nodeType===8){var l=n.data;if(l==="/$"){if(r===0){ti=Rr(n.nextSibling);break e}r--}else l!=="$"&&l!=="$!"&&l!=="$?"||r++}n=n.nextSibling}ti=null}}else ti=ei?Rr(n.stateNode.nextSibling):null;return!0}function Cp(){for(var n=ti;n;)n=Rr(n.nextSibling)}function Zs(){ti=ei=null,Xt=!1}function Lu(n){xi===null?xi=[n]:xi.push(n)}var O_=T.ReactCurrentBatchConfig;function ia(n,r,l){if(n=l.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(l._owner){if(l=l._owner,l){if(l.tag!==1)throw Error(t(309));var h=l.stateNode}if(!h)throw Error(t(147,n));var g=h,S=""+n;return r!==null&&r.ref!==null&&typeof r.ref=="function"&&r.ref._stringRef===S?r.ref:(r=function(R){var k=g.refs;R===null?delete k[S]:k[S]=R},r._stringRef=S,r)}if(typeof n!="string")throw Error(t(284));if(!l._owner)throw Error(t(290,n))}return n}function gl(n,r){throw n=Object.prototype.toString.call(r),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(r).join(", ")+"}":n))}function Rp(n){var r=n._init;return r(n._payload)}function bp(n){function r(ie,$){if(n){var oe=ie.deletions;oe===null?(ie.deletions=[$],ie.flags|=16):oe.push($)}}function l(ie,$){if(!n)return null;for(;$!==null;)r(ie,$),$=$.sibling;return null}function h(ie,$){for(ie=new Map;$!==null;)$.key!==null?ie.set($.key,$):ie.set($.index,$),$=$.sibling;return ie}function g(ie,$){return ie=Br(ie,$),ie.index=0,ie.sibling=null,ie}function S(ie,$,oe){return ie.index=oe,n?(oe=ie.alternate,oe!==null?(oe=oe.index,oe<$?(ie.flags|=2,$):oe):(ie.flags|=2,$)):(ie.flags|=1048576,$)}function R(ie){return n&&ie.alternate===null&&(ie.flags|=2),ie}function k(ie,$,oe,Te){return $===null||$.tag!==6?($=Mh(oe,ie.mode,Te),$.return=ie,$):($=g($,oe),$.return=ie,$)}function X(ie,$,oe,Te){var Ze=oe.type;return Ze===N?xe(ie,$,oe.props.children,Te,oe.key):$!==null&&($.elementType===Ze||typeof Ze=="object"&&Ze!==null&&Ze.$$typeof===G&&Rp(Ze)===$.type)?(Te=g($,oe.props),Te.ref=ia(ie,$,oe),Te.return=ie,Te):(Te=kl(oe.type,oe.key,oe.props,null,ie.mode,Te),Te.ref=ia(ie,$,oe),Te.return=ie,Te)}function le(ie,$,oe,Te){return $===null||$.tag!==4||$.stateNode.containerInfo!==oe.containerInfo||$.stateNode.implementation!==oe.implementation?($=Eh(oe,ie.mode,Te),$.return=ie,$):($=g($,oe.children||[]),$.return=ie,$)}function xe(ie,$,oe,Te,Ze){return $===null||$.tag!==7?($=ds(oe,ie.mode,Te,Ze),$.return=ie,$):($=g($,oe),$.return=ie,$)}function Se(ie,$,oe){if(typeof $=="string"&&$!==""||typeof $=="number")return $=Mh(""+$,ie.mode,oe),$.return=ie,$;if(typeof $=="object"&&$!==null){switch($.$$typeof){case U:return oe=kl($.type,$.key,$.props,null,ie.mode,oe),oe.ref=ia(ie,null,$),oe.return=ie,oe;case D:return $=Eh($,ie.mode,oe),$.return=ie,$;case G:var Te=$._init;return Se(ie,Te($._payload),oe)}if(Qe($)||W($))return $=ds($,ie.mode,oe,null),$.return=ie,$;gl(ie,$)}return null}function ge(ie,$,oe,Te){var Ze=$!==null?$.key:null;if(typeof oe=="string"&&oe!==""||typeof oe=="number")return Ze!==null?null:k(ie,$,""+oe,Te);if(typeof oe=="object"&&oe!==null){switch(oe.$$typeof){case U:return oe.key===Ze?X(ie,$,oe,Te):null;case D:return oe.key===Ze?le(ie,$,oe,Te):null;case G:return Ze=oe._init,ge(ie,$,Ze(oe._payload),Te)}if(Qe(oe)||W(oe))return Ze!==null?null:xe(ie,$,oe,Te,null);gl(ie,oe)}return null}function Ue(ie,$,oe,Te,Ze){if(typeof Te=="string"&&Te!==""||typeof Te=="number")return ie=ie.get(oe)||null,k($,ie,""+Te,Ze);if(typeof Te=="object"&&Te!==null){switch(Te.$$typeof){case U:return ie=ie.get(Te.key===null?oe:Te.key)||null,X($,ie,Te,Ze);case D:return ie=ie.get(Te.key===null?oe:Te.key)||null,le($,ie,Te,Ze);case G:var et=Te._init;return Ue(ie,$,oe,et(Te._payload),Ze)}if(Qe(Te)||W(Te))return ie=ie.get(oe)||null,xe($,ie,Te,Ze,null);gl($,Te)}return null}function Ve(ie,$,oe,Te){for(var Ze=null,et=null,tt=$,ot=$=0,gn=null;tt!==null&&ot<oe.length;ot++){tt.index>ot?(gn=tt,tt=null):gn=tt.sibling;var Rt=ge(ie,tt,oe[ot],Te);if(Rt===null){tt===null&&(tt=gn);break}n&&tt&&Rt.alternate===null&&r(ie,tt),$=S(Rt,$,ot),et===null?Ze=Rt:et.sibling=Rt,et=Rt,tt=gn}if(ot===oe.length)return l(ie,tt),Xt&&rs(ie,ot),Ze;if(tt===null){for(;ot<oe.length;ot++)tt=Se(ie,oe[ot],Te),tt!==null&&($=S(tt,$,ot),et===null?Ze=tt:et.sibling=tt,et=tt);return Xt&&rs(ie,ot),Ze}for(tt=h(ie,tt);ot<oe.length;ot++)gn=Ue(tt,ie,ot,oe[ot],Te),gn!==null&&(n&&gn.alternate!==null&&tt.delete(gn.key===null?ot:gn.key),$=S(gn,$,ot),et===null?Ze=gn:et.sibling=gn,et=gn);return n&&tt.forEach(function(kr){return r(ie,kr)}),Xt&&rs(ie,ot),Ze}function Xe(ie,$,oe,Te){var Ze=W(oe);if(typeof Ze!="function")throw Error(t(150));if(oe=Ze.call(oe),oe==null)throw Error(t(151));for(var et=Ze=null,tt=$,ot=$=0,gn=null,Rt=oe.next();tt!==null&&!Rt.done;ot++,Rt=oe.next()){tt.index>ot?(gn=tt,tt=null):gn=tt.sibling;var kr=ge(ie,tt,Rt.value,Te);if(kr===null){tt===null&&(tt=gn);break}n&&tt&&kr.alternate===null&&r(ie,tt),$=S(kr,$,ot),et===null?Ze=kr:et.sibling=kr,et=kr,tt=gn}if(Rt.done)return l(ie,tt),Xt&&rs(ie,ot),Ze;if(tt===null){for(;!Rt.done;ot++,Rt=oe.next())Rt=Se(ie,Rt.value,Te),Rt!==null&&($=S(Rt,$,ot),et===null?Ze=Rt:et.sibling=Rt,et=Rt);return Xt&&rs(ie,ot),Ze}for(tt=h(ie,tt);!Rt.done;ot++,Rt=oe.next())Rt=Ue(tt,ie,ot,Rt.value,Te),Rt!==null&&(n&&Rt.alternate!==null&&tt.delete(Rt.key===null?ot:Rt.key),$=S(Rt,$,ot),et===null?Ze=Rt:et.sibling=Rt,et=Rt);return n&&tt.forEach(function(gy){return r(ie,gy)}),Xt&&rs(ie,ot),Ze}function Jt(ie,$,oe,Te){if(typeof oe=="object"&&oe!==null&&oe.type===N&&oe.key===null&&(oe=oe.props.children),typeof oe=="object"&&oe!==null){switch(oe.$$typeof){case U:e:{for(var Ze=oe.key,et=$;et!==null;){if(et.key===Ze){if(Ze=oe.type,Ze===N){if(et.tag===7){l(ie,et.sibling),$=g(et,oe.props.children),$.return=ie,ie=$;break e}}else if(et.elementType===Ze||typeof Ze=="object"&&Ze!==null&&Ze.$$typeof===G&&Rp(Ze)===et.type){l(ie,et.sibling),$=g(et,oe.props),$.ref=ia(ie,et,oe),$.return=ie,ie=$;break e}l(ie,et);break}else r(ie,et);et=et.sibling}oe.type===N?($=ds(oe.props.children,ie.mode,Te,oe.key),$.return=ie,ie=$):(Te=kl(oe.type,oe.key,oe.props,null,ie.mode,Te),Te.ref=ia(ie,$,oe),Te.return=ie,ie=Te)}return R(ie);case D:e:{for(et=oe.key;$!==null;){if($.key===et)if($.tag===4&&$.stateNode.containerInfo===oe.containerInfo&&$.stateNode.implementation===oe.implementation){l(ie,$.sibling),$=g($,oe.children||[]),$.return=ie,ie=$;break e}else{l(ie,$);break}else r(ie,$);$=$.sibling}$=Eh(oe,ie.mode,Te),$.return=ie,ie=$}return R(ie);case G:return et=oe._init,Jt(ie,$,et(oe._payload),Te)}if(Qe(oe))return Ve(ie,$,oe,Te);if(W(oe))return Xe(ie,$,oe,Te);gl(ie,oe)}return typeof oe=="string"&&oe!==""||typeof oe=="number"?(oe=""+oe,$!==null&&$.tag===6?(l(ie,$.sibling),$=g($,oe),$.return=ie,ie=$):(l(ie,$),$=Mh(oe,ie.mode,Te),$.return=ie,ie=$),R(ie)):l(ie,$)}return Jt}var Ks=bp(!0),Pp=bp(!1),vl=br(null),_l=null,Qs=null,Iu=null;function Du(){Iu=Qs=_l=null}function Nu(n){var r=vl.current;Gt(vl),n._currentValue=r}function Uu(n,r,l){for(;n!==null;){var h=n.alternate;if((n.childLanes&r)!==r?(n.childLanes|=r,h!==null&&(h.childLanes|=r)):h!==null&&(h.childLanes&r)!==r&&(h.childLanes|=r),n===l)break;n=n.return}}function Js(n,r){_l=n,Iu=Qs=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&r)!==0&&(Wn=!0),n.firstContext=null)}function hi(n){var r=n._currentValue;if(Iu!==n)if(n={context:n,memoizedValue:r,next:null},Qs===null){if(_l===null)throw Error(t(308));Qs=n,_l.dependencies={lanes:0,firstContext:n}}else Qs=Qs.next=n;return r}var ss=null;function Fu(n){ss===null?ss=[n]:ss.push(n)}function Lp(n,r,l,h){var g=r.interleaved;return g===null?(l.next=l,Fu(r)):(l.next=g.next,g.next=l),r.interleaved=l,er(n,h)}function er(n,r){n.lanes|=r;var l=n.alternate;for(l!==null&&(l.lanes|=r),l=n,n=n.return;n!==null;)n.childLanes|=r,l=n.alternate,l!==null&&(l.childLanes|=r),l=n,n=n.return;return l.tag===3?l.stateNode:null}var Ir=!1;function Ou(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Ip(n,r){n=n.updateQueue,r.updateQueue===n&&(r.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function tr(n,r){return{eventTime:n,lane:r,tag:0,payload:null,callback:null,next:null}}function Dr(n,r,l){var h=n.updateQueue;if(h===null)return null;if(h=h.shared,(wt&2)!==0){var g=h.pending;return g===null?r.next=r:(r.next=g.next,g.next=r),h.pending=r,er(n,l)}return g=h.interleaved,g===null?(r.next=r,Fu(h)):(r.next=g.next,g.next=r),h.interleaved=r,er(n,l)}function yl(n,r,l){if(r=r.updateQueue,r!==null&&(r=r.shared,(l&4194240)!==0)){var h=r.lanes;h&=n.pendingLanes,l|=h,r.lanes=l,Kc(n,l)}}function Dp(n,r){var l=n.updateQueue,h=n.alternate;if(h!==null&&(h=h.updateQueue,l===h)){var g=null,S=null;if(l=l.firstBaseUpdate,l!==null){do{var R={eventTime:l.eventTime,lane:l.lane,tag:l.tag,payload:l.payload,callback:l.callback,next:null};S===null?g=S=R:S=S.next=R,l=l.next}while(l!==null);S===null?g=S=r:S=S.next=r}else g=S=r;l={baseState:h.baseState,firstBaseUpdate:g,lastBaseUpdate:S,shared:h.shared,effects:h.effects},n.updateQueue=l;return}n=l.lastBaseUpdate,n===null?l.firstBaseUpdate=r:n.next=r,l.lastBaseUpdate=r}function xl(n,r,l,h){var g=n.updateQueue;Ir=!1;var S=g.firstBaseUpdate,R=g.lastBaseUpdate,k=g.shared.pending;if(k!==null){g.shared.pending=null;var X=k,le=X.next;X.next=null,R===null?S=le:R.next=le,R=X;var xe=n.alternate;xe!==null&&(xe=xe.updateQueue,k=xe.lastBaseUpdate,k!==R&&(k===null?xe.firstBaseUpdate=le:k.next=le,xe.lastBaseUpdate=X))}if(S!==null){var Se=g.baseState;R=0,xe=le=X=null,k=S;do{var ge=k.lane,Ue=k.eventTime;if((h&ge)===ge){xe!==null&&(xe=xe.next={eventTime:Ue,lane:0,tag:k.tag,payload:k.payload,callback:k.callback,next:null});e:{var Ve=n,Xe=k;switch(ge=r,Ue=l,Xe.tag){case 1:if(Ve=Xe.payload,typeof Ve=="function"){Se=Ve.call(Ue,Se,ge);break e}Se=Ve;break e;case 3:Ve.flags=Ve.flags&-65537|128;case 0:if(Ve=Xe.payload,ge=typeof Ve=="function"?Ve.call(Ue,Se,ge):Ve,ge==null)break e;Se=se({},Se,ge);break e;case 2:Ir=!0}}k.callback!==null&&k.lane!==0&&(n.flags|=64,ge=g.effects,ge===null?g.effects=[k]:ge.push(k))}else Ue={eventTime:Ue,lane:ge,tag:k.tag,payload:k.payload,callback:k.callback,next:null},xe===null?(le=xe=Ue,X=Se):xe=xe.next=Ue,R|=ge;if(k=k.next,k===null){if(k=g.shared.pending,k===null)break;ge=k,k=ge.next,ge.next=null,g.lastBaseUpdate=ge,g.shared.pending=null}}while(!0);if(xe===null&&(X=Se),g.baseState=X,g.firstBaseUpdate=le,g.lastBaseUpdate=xe,r=g.shared.interleaved,r!==null){g=r;do R|=g.lane,g=g.next;while(g!==r)}else S===null&&(g.shared.lanes=0);ls|=R,n.lanes=R,n.memoizedState=Se}}function Np(n,r,l){if(n=r.effects,r.effects=null,n!==null)for(r=0;r<n.length;r++){var h=n[r],g=h.callback;if(g!==null){if(h.callback=null,h=l,typeof g!="function")throw Error(t(191,g));g.call(h)}}}var ra={},Oi=br(ra),sa=br(ra),oa=br(ra);function os(n){if(n===ra)throw Error(t(174));return n}function zu(n,r){switch(Bt(oa,r),Bt(sa,n),Bt(Oi,ra),n=r.nodeType,n){case 9:case 11:r=(r=r.documentElement)?r.namespaceURI:qe(null,"");break;default:n=n===8?r.parentNode:r,r=n.namespaceURI||null,n=n.tagName,r=qe(r,n)}Gt(Oi),Bt(Oi,r)}function eo(){Gt(Oi),Gt(sa),Gt(oa)}function Up(n){os(oa.current);var r=os(Oi.current),l=qe(r,n.type);r!==l&&(Bt(sa,n),Bt(Oi,l))}function Bu(n){sa.current===n&&(Gt(Oi),Gt(sa))}var qt=br(0);function Sl(n){for(var r=n;r!==null;){if(r.tag===13){var l=r.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||l.data==="$?"||l.data==="$!"))return r}else if(r.tag===19&&r.memoizedProps.revealOrder!==void 0){if((r.flags&128)!==0)return r}else if(r.child!==null){r.child.return=r,r=r.child;continue}if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return null;r=r.return}r.sibling.return=r.return,r=r.sibling}return null}var ku=[];function Hu(){for(var n=0;n<ku.length;n++)ku[n]._workInProgressVersionPrimary=null;ku.length=0}var Ml=T.ReactCurrentDispatcher,Vu=T.ReactCurrentBatchConfig,as=0,Yt=null,cn=null,pn=null,El=!1,aa=!1,la=0,z_=0;function Tn(){throw Error(t(321))}function Gu(n,r){if(r===null)return!1;for(var l=0;l<r.length&&l<n.length;l++)if(!yi(n[l],r[l]))return!1;return!0}function Wu(n,r,l,h,g,S){if(as=S,Yt=r,r.memoizedState=null,r.updateQueue=null,r.lanes=0,Ml.current=n===null||n.memoizedState===null?V_:G_,n=l(h,g),aa){S=0;do{if(aa=!1,la=0,25<=S)throw Error(t(301));S+=1,pn=cn=null,r.updateQueue=null,Ml.current=W_,n=l(h,g)}while(aa)}if(Ml.current=Al,r=cn!==null&&cn.next!==null,as=0,pn=cn=Yt=null,El=!1,r)throw Error(t(300));return n}function Xu(){var n=la!==0;return la=0,n}function zi(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return pn===null?Yt.memoizedState=pn=n:pn=pn.next=n,pn}function di(){if(cn===null){var n=Yt.alternate;n=n!==null?n.memoizedState:null}else n=cn.next;var r=pn===null?Yt.memoizedState:pn.next;if(r!==null)pn=r,cn=n;else{if(n===null)throw Error(t(310));cn=n,n={memoizedState:cn.memoizedState,baseState:cn.baseState,baseQueue:cn.baseQueue,queue:cn.queue,next:null},pn===null?Yt.memoizedState=pn=n:pn=pn.next=n}return pn}function ca(n,r){return typeof r=="function"?r(n):r}function ju(n){var r=di(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=cn,g=h.baseQueue,S=l.pending;if(S!==null){if(g!==null){var R=g.next;g.next=S.next,S.next=R}h.baseQueue=g=S,l.pending=null}if(g!==null){S=g.next,h=h.baseState;var k=R=null,X=null,le=S;do{var xe=le.lane;if((as&xe)===xe)X!==null&&(X=X.next={lane:0,action:le.action,hasEagerState:le.hasEagerState,eagerState:le.eagerState,next:null}),h=le.hasEagerState?le.eagerState:n(h,le.action);else{var Se={lane:xe,action:le.action,hasEagerState:le.hasEagerState,eagerState:le.eagerState,next:null};X===null?(k=X=Se,R=h):X=X.next=Se,Yt.lanes|=xe,ls|=xe}le=le.next}while(le!==null&&le!==S);X===null?R=h:X.next=k,yi(h,r.memoizedState)||(Wn=!0),r.memoizedState=h,r.baseState=R,r.baseQueue=X,l.lastRenderedState=h}if(n=l.interleaved,n!==null){g=n;do S=g.lane,Yt.lanes|=S,ls|=S,g=g.next;while(g!==n)}else g===null&&(l.lanes=0);return[r.memoizedState,l.dispatch]}function qu(n){var r=di(),l=r.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=n;var h=l.dispatch,g=l.pending,S=r.memoizedState;if(g!==null){l.pending=null;var R=g=g.next;do S=n(S,R.action),R=R.next;while(R!==g);yi(S,r.memoizedState)||(Wn=!0),r.memoizedState=S,r.baseQueue===null&&(r.baseState=S),l.lastRenderedState=S}return[S,h]}function Fp(){}function Op(n,r){var l=Yt,h=di(),g=r(),S=!yi(h.memoizedState,g);if(S&&(h.memoizedState=g,Wn=!0),h=h.queue,Yu(kp.bind(null,l,h,n),[n]),h.getSnapshot!==r||S||pn!==null&&pn.memoizedState.tag&1){if(l.flags|=2048,ua(9,Bp.bind(null,l,h,g,r),void 0,null),mn===null)throw Error(t(349));(as&30)!==0||zp(l,r,g)}return g}function zp(n,r,l){n.flags|=16384,n={getSnapshot:r,value:l},r=Yt.updateQueue,r===null?(r={lastEffect:null,stores:null},Yt.updateQueue=r,r.stores=[n]):(l=r.stores,l===null?r.stores=[n]:l.push(n))}function Bp(n,r,l,h){r.value=l,r.getSnapshot=h,Hp(r)&&Vp(n)}function kp(n,r,l){return l(function(){Hp(r)&&Vp(n)})}function Hp(n){var r=n.getSnapshot;n=n.value;try{var l=r();return!yi(n,l)}catch{return!0}}function Vp(n){var r=er(n,1);r!==null&&wi(r,n,1,-1)}function Gp(n){var r=zi();return typeof n=="function"&&(n=n()),r.memoizedState=r.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ca,lastRenderedState:n},r.queue=n,n=n.dispatch=H_.bind(null,Yt,n),[r.memoizedState,n]}function ua(n,r,l,h){return n={tag:n,create:r,destroy:l,deps:h,next:null},r=Yt.updateQueue,r===null?(r={lastEffect:null,stores:null},Yt.updateQueue=r,r.lastEffect=n.next=n):(l=r.lastEffect,l===null?r.lastEffect=n.next=n:(h=l.next,l.next=n,n.next=h,r.lastEffect=n)),n}function Wp(){return di().memoizedState}function wl(n,r,l,h){var g=zi();Yt.flags|=n,g.memoizedState=ua(1|r,l,void 0,h===void 0?null:h)}function Tl(n,r,l,h){var g=di();h=h===void 0?null:h;var S=void 0;if(cn!==null){var R=cn.memoizedState;if(S=R.destroy,h!==null&&Gu(h,R.deps)){g.memoizedState=ua(r,l,S,h);return}}Yt.flags|=n,g.memoizedState=ua(1|r,l,S,h)}function Xp(n,r){return wl(8390656,8,n,r)}function Yu(n,r){return Tl(2048,8,n,r)}function jp(n,r){return Tl(4,2,n,r)}function qp(n,r){return Tl(4,4,n,r)}function Yp(n,r){if(typeof r=="function")return n=n(),r(n),function(){r(null)};if(r!=null)return n=n(),r.current=n,function(){r.current=null}}function $p(n,r,l){return l=l!=null?l.concat([n]):null,Tl(4,4,Yp.bind(null,r,n),l)}function $u(){}function Zp(n,r){var l=di();r=r===void 0?null:r;var h=l.memoizedState;return h!==null&&r!==null&&Gu(r,h[1])?h[0]:(l.memoizedState=[n,r],n)}function Kp(n,r){var l=di();r=r===void 0?null:r;var h=l.memoizedState;return h!==null&&r!==null&&Gu(r,h[1])?h[0]:(n=n(),l.memoizedState=[n,r],n)}function Qp(n,r,l){return(as&21)===0?(n.baseState&&(n.baseState=!1,Wn=!0),n.memoizedState=l):(yi(l,r)||(l=Un(),Yt.lanes|=l,ls|=l,n.baseState=!0),r)}function B_(n,r){var l=It;It=l!==0&&4>l?l:4,n(!0);var h=Vu.transition;Vu.transition={};try{n(!1),r()}finally{It=l,Vu.transition=h}}function Jp(){return di().memoizedState}function k_(n,r,l){var h=Or(n);if(l={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null},em(n))tm(r,l);else if(l=Lp(n,r,l,h),l!==null){var g=On();wi(l,n,h,g),nm(l,r,h)}}function H_(n,r,l){var h=Or(n),g={lane:h,action:l,hasEagerState:!1,eagerState:null,next:null};if(em(n))tm(r,g);else{var S=n.alternate;if(n.lanes===0&&(S===null||S.lanes===0)&&(S=r.lastRenderedReducer,S!==null))try{var R=r.lastRenderedState,k=S(R,l);if(g.hasEagerState=!0,g.eagerState=k,yi(k,R)){var X=r.interleaved;X===null?(g.next=g,Fu(r)):(g.next=X.next,X.next=g),r.interleaved=g;return}}catch{}finally{}l=Lp(n,r,g,h),l!==null&&(g=On(),wi(l,n,h,g),nm(l,r,h))}}function em(n){var r=n.alternate;return n===Yt||r!==null&&r===Yt}function tm(n,r){aa=El=!0;var l=n.pending;l===null?r.next=r:(r.next=l.next,l.next=r),n.pending=r}function nm(n,r,l){if((l&4194240)!==0){var h=r.lanes;h&=n.pendingLanes,l|=h,r.lanes=l,Kc(n,l)}}var Al={readContext:hi,useCallback:Tn,useContext:Tn,useEffect:Tn,useImperativeHandle:Tn,useInsertionEffect:Tn,useLayoutEffect:Tn,useMemo:Tn,useReducer:Tn,useRef:Tn,useState:Tn,useDebugValue:Tn,useDeferredValue:Tn,useTransition:Tn,useMutableSource:Tn,useSyncExternalStore:Tn,useId:Tn,unstable_isNewReconciler:!1},V_={readContext:hi,useCallback:function(n,r){return zi().memoizedState=[n,r===void 0?null:r],n},useContext:hi,useEffect:Xp,useImperativeHandle:function(n,r,l){return l=l!=null?l.concat([n]):null,wl(4194308,4,Yp.bind(null,r,n),l)},useLayoutEffect:function(n,r){return wl(4194308,4,n,r)},useInsertionEffect:function(n,r){return wl(4,2,n,r)},useMemo:function(n,r){var l=zi();return r=r===void 0?null:r,n=n(),l.memoizedState=[n,r],n},useReducer:function(n,r,l){var h=zi();return r=l!==void 0?l(r):r,h.memoizedState=h.baseState=r,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:r},h.queue=n,n=n.dispatch=k_.bind(null,Yt,n),[h.memoizedState,n]},useRef:function(n){var r=zi();return n={current:n},r.memoizedState=n},useState:Gp,useDebugValue:$u,useDeferredValue:function(n){return zi().memoizedState=n},useTransition:function(){var n=Gp(!1),r=n[0];return n=B_.bind(null,n[1]),zi().memoizedState=n,[r,n]},useMutableSource:function(){},useSyncExternalStore:function(n,r,l){var h=Yt,g=zi();if(Xt){if(l===void 0)throw Error(t(407));l=l()}else{if(l=r(),mn===null)throw Error(t(349));(as&30)!==0||zp(h,r,l)}g.memoizedState=l;var S={value:l,getSnapshot:r};return g.queue=S,Xp(kp.bind(null,h,S,n),[n]),h.flags|=2048,ua(9,Bp.bind(null,h,S,l,r),void 0,null),l},useId:function(){var n=zi(),r=mn.identifierPrefix;if(Xt){var l=Ji,h=Qi;l=(h&~(1<<32-ht(h)-1)).toString(32)+l,r=":"+r+"R"+l,l=la++,0<l&&(r+="H"+l.toString(32)),r+=":"}else l=z_++,r=":"+r+"r"+l.toString(32)+":";return n.memoizedState=r},unstable_isNewReconciler:!1},G_={readContext:hi,useCallback:Zp,useContext:hi,useEffect:Yu,useImperativeHandle:$p,useInsertionEffect:jp,useLayoutEffect:qp,useMemo:Kp,useReducer:ju,useRef:Wp,useState:function(){return ju(ca)},useDebugValue:$u,useDeferredValue:function(n){var r=di();return Qp(r,cn.memoizedState,n)},useTransition:function(){var n=ju(ca)[0],r=di().memoizedState;return[n,r]},useMutableSource:Fp,useSyncExternalStore:Op,useId:Jp,unstable_isNewReconciler:!1},W_={readContext:hi,useCallback:Zp,useContext:hi,useEffect:Yu,useImperativeHandle:$p,useInsertionEffect:jp,useLayoutEffect:qp,useMemo:Kp,useReducer:qu,useRef:Wp,useState:function(){return qu(ca)},useDebugValue:$u,useDeferredValue:function(n){var r=di();return cn===null?r.memoizedState=n:Qp(r,cn.memoizedState,n)},useTransition:function(){var n=qu(ca)[0],r=di().memoizedState;return[n,r]},useMutableSource:Fp,useSyncExternalStore:Op,useId:Jp,unstable_isNewReconciler:!1};function Si(n,r){if(n&&n.defaultProps){r=se({},r),n=n.defaultProps;for(var l in n)r[l]===void 0&&(r[l]=n[l]);return r}return r}function Zu(n,r,l,h){r=n.memoizedState,l=l(h,r),l=l==null?r:se({},r,l),n.memoizedState=l,n.lanes===0&&(n.updateQueue.baseState=l)}var Cl={isMounted:function(n){return(n=n._reactInternals)?Ni(n)===n:!1},enqueueSetState:function(n,r,l){n=n._reactInternals;var h=On(),g=Or(n),S=tr(h,g);S.payload=r,l!=null&&(S.callback=l),r=Dr(n,S,g),r!==null&&(wi(r,n,g,h),yl(r,n,g))},enqueueReplaceState:function(n,r,l){n=n._reactInternals;var h=On(),g=Or(n),S=tr(h,g);S.tag=1,S.payload=r,l!=null&&(S.callback=l),r=Dr(n,S,g),r!==null&&(wi(r,n,g,h),yl(r,n,g))},enqueueForceUpdate:function(n,r){n=n._reactInternals;var l=On(),h=Or(n),g=tr(l,h);g.tag=2,r!=null&&(g.callback=r),r=Dr(n,g,h),r!==null&&(wi(r,n,h,l),yl(r,n,h))}};function im(n,r,l,h,g,S,R){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(h,S,R):r.prototype&&r.prototype.isPureReactComponent?!Zo(l,h)||!Zo(g,S):!0}function rm(n,r,l){var h=!1,g=Pr,S=r.contextType;return typeof S=="object"&&S!==null?S=hi(S):(g=Gn(r)?ns:wn.current,h=r.contextTypes,S=(h=h!=null)?qs(n,g):Pr),r=new r(l,S),n.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,r.updater=Cl,n.stateNode=r,r._reactInternals=n,h&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=g,n.__reactInternalMemoizedMaskedChildContext=S),r}function sm(n,r,l,h){n=r.state,typeof r.componentWillReceiveProps=="function"&&r.componentWillReceiveProps(l,h),typeof r.UNSAFE_componentWillReceiveProps=="function"&&r.UNSAFE_componentWillReceiveProps(l,h),r.state!==n&&Cl.enqueueReplaceState(r,r.state,null)}function Ku(n,r,l,h){var g=n.stateNode;g.props=l,g.state=n.memoizedState,g.refs={},Ou(n);var S=r.contextType;typeof S=="object"&&S!==null?g.context=hi(S):(S=Gn(r)?ns:wn.current,g.context=qs(n,S)),g.state=n.memoizedState,S=r.getDerivedStateFromProps,typeof S=="function"&&(Zu(n,r,S,l),g.state=n.memoizedState),typeof r.getDerivedStateFromProps=="function"||typeof g.getSnapshotBeforeUpdate=="function"||typeof g.UNSAFE_componentWillMount!="function"&&typeof g.componentWillMount!="function"||(r=g.state,typeof g.componentWillMount=="function"&&g.componentWillMount(),typeof g.UNSAFE_componentWillMount=="function"&&g.UNSAFE_componentWillMount(),r!==g.state&&Cl.enqueueReplaceState(g,g.state,null),xl(n,l,g,h),g.state=n.memoizedState),typeof g.componentDidMount=="function"&&(n.flags|=4194308)}function to(n,r){try{var l="",h=r;do l+=de(h),h=h.return;while(h);var g=l}catch(S){g=`
Error generating stack: `+S.message+`
`+S.stack}return{value:n,source:r,stack:g,digest:null}}function Qu(n,r,l){return{value:n,source:null,stack:l??null,digest:r??null}}function Ju(n,r){try{console.error(r.value)}catch(l){setTimeout(function(){throw l})}}var X_=typeof WeakMap=="function"?WeakMap:Map;function om(n,r,l){l=tr(-1,l),l.tag=3,l.payload={element:null};var h=r.value;return l.callback=function(){Nl||(Nl=!0,ph=h),Ju(n,r)},l}function am(n,r,l){l=tr(-1,l),l.tag=3;var h=n.type.getDerivedStateFromError;if(typeof h=="function"){var g=r.value;l.payload=function(){return h(g)},l.callback=function(){Ju(n,r)}}var S=n.stateNode;return S!==null&&typeof S.componentDidCatch=="function"&&(l.callback=function(){Ju(n,r),typeof h!="function"&&(Ur===null?Ur=new Set([this]):Ur.add(this));var R=r.stack;this.componentDidCatch(r.value,{componentStack:R!==null?R:""})}),l}function lm(n,r,l){var h=n.pingCache;if(h===null){h=n.pingCache=new X_;var g=new Set;h.set(r,g)}else g=h.get(r),g===void 0&&(g=new Set,h.set(r,g));g.has(l)||(g.add(l),n=sy.bind(null,n,r,l),r.then(n,n))}function cm(n){do{var r;if((r=n.tag===13)&&(r=n.memoizedState,r=r!==null?r.dehydrated!==null:!0),r)return n;n=n.return}while(n!==null);return null}function um(n,r,l,h,g){return(n.mode&1)===0?(n===r?n.flags|=65536:(n.flags|=128,l.flags|=131072,l.flags&=-52805,l.tag===1&&(l.alternate===null?l.tag=17:(r=tr(-1,1),r.tag=2,Dr(l,r,1))),l.lanes|=1),n):(n.flags|=65536,n.lanes=g,n)}var j_=T.ReactCurrentOwner,Wn=!1;function Fn(n,r,l,h){r.child=n===null?Pp(r,null,l,h):Ks(r,n.child,l,h)}function hm(n,r,l,h,g){l=l.render;var S=r.ref;return Js(r,g),h=Wu(n,r,l,h,S,g),l=Xu(),n!==null&&!Wn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~g,nr(n,r,g)):(Xt&&l&&Cu(r),r.flags|=1,Fn(n,r,h,g),r.child)}function dm(n,r,l,h,g){if(n===null){var S=l.type;return typeof S=="function"&&!Sh(S)&&S.defaultProps===void 0&&l.compare===null&&l.defaultProps===void 0?(r.tag=15,r.type=S,fm(n,r,S,h,g)):(n=kl(l.type,null,h,r,r.mode,g),n.ref=r.ref,n.return=r,r.child=n)}if(S=n.child,(n.lanes&g)===0){var R=S.memoizedProps;if(l=l.compare,l=l!==null?l:Zo,l(R,h)&&n.ref===r.ref)return nr(n,r,g)}return r.flags|=1,n=Br(S,h),n.ref=r.ref,n.return=r,r.child=n}function fm(n,r,l,h,g){if(n!==null){var S=n.memoizedProps;if(Zo(S,h)&&n.ref===r.ref)if(Wn=!1,r.pendingProps=h=S,(n.lanes&g)!==0)(n.flags&131072)!==0&&(Wn=!0);else return r.lanes=n.lanes,nr(n,r,g)}return eh(n,r,l,h,g)}function pm(n,r,l){var h=r.pendingProps,g=h.children,S=n!==null?n.memoizedState:null;if(h.mode==="hidden")if((r.mode&1)===0)r.memoizedState={baseLanes:0,cachePool:null,transitions:null},Bt(io,ni),ni|=l;else{if((l&1073741824)===0)return n=S!==null?S.baseLanes|l:l,r.lanes=r.childLanes=1073741824,r.memoizedState={baseLanes:n,cachePool:null,transitions:null},r.updateQueue=null,Bt(io,ni),ni|=n,null;r.memoizedState={baseLanes:0,cachePool:null,transitions:null},h=S!==null?S.baseLanes:l,Bt(io,ni),ni|=h}else S!==null?(h=S.baseLanes|l,r.memoizedState=null):h=l,Bt(io,ni),ni|=h;return Fn(n,r,g,l),r.child}function mm(n,r){var l=r.ref;(n===null&&l!==null||n!==null&&n.ref!==l)&&(r.flags|=512,r.flags|=2097152)}function eh(n,r,l,h,g){var S=Gn(l)?ns:wn.current;return S=qs(r,S),Js(r,g),l=Wu(n,r,l,h,S,g),h=Xu(),n!==null&&!Wn?(r.updateQueue=n.updateQueue,r.flags&=-2053,n.lanes&=~g,nr(n,r,g)):(Xt&&h&&Cu(r),r.flags|=1,Fn(n,r,l,g),r.child)}function gm(n,r,l,h,g){if(Gn(l)){var S=!0;hl(r)}else S=!1;if(Js(r,g),r.stateNode===null)bl(n,r),rm(r,l,h),Ku(r,l,h,g),h=!0;else if(n===null){var R=r.stateNode,k=r.memoizedProps;R.props=k;var X=R.context,le=l.contextType;typeof le=="object"&&le!==null?le=hi(le):(le=Gn(l)?ns:wn.current,le=qs(r,le));var xe=l.getDerivedStateFromProps,Se=typeof xe=="function"||typeof R.getSnapshotBeforeUpdate=="function";Se||typeof R.UNSAFE_componentWillReceiveProps!="function"&&typeof R.componentWillReceiveProps!="function"||(k!==h||X!==le)&&sm(r,R,h,le),Ir=!1;var ge=r.memoizedState;R.state=ge,xl(r,h,R,g),X=r.memoizedState,k!==h||ge!==X||Vn.current||Ir?(typeof xe=="function"&&(Zu(r,l,xe,h),X=r.memoizedState),(k=Ir||im(r,l,k,h,ge,X,le))?(Se||typeof R.UNSAFE_componentWillMount!="function"&&typeof R.componentWillMount!="function"||(typeof R.componentWillMount=="function"&&R.componentWillMount(),typeof R.UNSAFE_componentWillMount=="function"&&R.UNSAFE_componentWillMount()),typeof R.componentDidMount=="function"&&(r.flags|=4194308)):(typeof R.componentDidMount=="function"&&(r.flags|=4194308),r.memoizedProps=h,r.memoizedState=X),R.props=h,R.state=X,R.context=le,h=k):(typeof R.componentDidMount=="function"&&(r.flags|=4194308),h=!1)}else{R=r.stateNode,Ip(n,r),k=r.memoizedProps,le=r.type===r.elementType?k:Si(r.type,k),R.props=le,Se=r.pendingProps,ge=R.context,X=l.contextType,typeof X=="object"&&X!==null?X=hi(X):(X=Gn(l)?ns:wn.current,X=qs(r,X));var Ue=l.getDerivedStateFromProps;(xe=typeof Ue=="function"||typeof R.getSnapshotBeforeUpdate=="function")||typeof R.UNSAFE_componentWillReceiveProps!="function"&&typeof R.componentWillReceiveProps!="function"||(k!==Se||ge!==X)&&sm(r,R,h,X),Ir=!1,ge=r.memoizedState,R.state=ge,xl(r,h,R,g);var Ve=r.memoizedState;k!==Se||ge!==Ve||Vn.current||Ir?(typeof Ue=="function"&&(Zu(r,l,Ue,h),Ve=r.memoizedState),(le=Ir||im(r,l,le,h,ge,Ve,X)||!1)?(xe||typeof R.UNSAFE_componentWillUpdate!="function"&&typeof R.componentWillUpdate!="function"||(typeof R.componentWillUpdate=="function"&&R.componentWillUpdate(h,Ve,X),typeof R.UNSAFE_componentWillUpdate=="function"&&R.UNSAFE_componentWillUpdate(h,Ve,X)),typeof R.componentDidUpdate=="function"&&(r.flags|=4),typeof R.getSnapshotBeforeUpdate=="function"&&(r.flags|=1024)):(typeof R.componentDidUpdate!="function"||k===n.memoizedProps&&ge===n.memoizedState||(r.flags|=4),typeof R.getSnapshotBeforeUpdate!="function"||k===n.memoizedProps&&ge===n.memoizedState||(r.flags|=1024),r.memoizedProps=h,r.memoizedState=Ve),R.props=h,R.state=Ve,R.context=X,h=le):(typeof R.componentDidUpdate!="function"||k===n.memoizedProps&&ge===n.memoizedState||(r.flags|=4),typeof R.getSnapshotBeforeUpdate!="function"||k===n.memoizedProps&&ge===n.memoizedState||(r.flags|=1024),h=!1)}return th(n,r,l,h,S,g)}function th(n,r,l,h,g,S){mm(n,r);var R=(r.flags&128)!==0;if(!h&&!R)return g&&Sp(r,l,!1),nr(n,r,S);h=r.stateNode,j_.current=r;var k=R&&typeof l.getDerivedStateFromError!="function"?null:h.render();return r.flags|=1,n!==null&&R?(r.child=Ks(r,n.child,null,S),r.child=Ks(r,null,k,S)):Fn(n,r,k,S),r.memoizedState=h.state,g&&Sp(r,l,!0),r.child}function vm(n){var r=n.stateNode;r.pendingContext?yp(n,r.pendingContext,r.pendingContext!==r.context):r.context&&yp(n,r.context,!1),zu(n,r.containerInfo)}function _m(n,r,l,h,g){return Zs(),Lu(g),r.flags|=256,Fn(n,r,l,h),r.child}var nh={dehydrated:null,treeContext:null,retryLane:0};function ih(n){return{baseLanes:n,cachePool:null,transitions:null}}function ym(n,r,l){var h=r.pendingProps,g=qt.current,S=!1,R=(r.flags&128)!==0,k;if((k=R)||(k=n!==null&&n.memoizedState===null?!1:(g&2)!==0),k?(S=!0,r.flags&=-129):(n===null||n.memoizedState!==null)&&(g|=1),Bt(qt,g&1),n===null)return Pu(r),n=r.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((r.mode&1)===0?r.lanes=1:n.data==="$!"?r.lanes=8:r.lanes=1073741824,null):(R=h.children,n=h.fallback,S?(h=r.mode,S=r.child,R={mode:"hidden",children:R},(h&1)===0&&S!==null?(S.childLanes=0,S.pendingProps=R):S=Hl(R,h,0,null),n=ds(n,h,l,null),S.return=r,n.return=r,S.sibling=n,r.child=S,r.child.memoizedState=ih(l),r.memoizedState=nh,n):rh(r,R));if(g=n.memoizedState,g!==null&&(k=g.dehydrated,k!==null))return q_(n,r,R,h,k,g,l);if(S){S=h.fallback,R=r.mode,g=n.child,k=g.sibling;var X={mode:"hidden",children:h.children};return(R&1)===0&&r.child!==g?(h=r.child,h.childLanes=0,h.pendingProps=X,r.deletions=null):(h=Br(g,X),h.subtreeFlags=g.subtreeFlags&14680064),k!==null?S=Br(k,S):(S=ds(S,R,l,null),S.flags|=2),S.return=r,h.return=r,h.sibling=S,r.child=h,h=S,S=r.child,R=n.child.memoizedState,R=R===null?ih(l):{baseLanes:R.baseLanes|l,cachePool:null,transitions:R.transitions},S.memoizedState=R,S.childLanes=n.childLanes&~l,r.memoizedState=nh,h}return S=n.child,n=S.sibling,h=Br(S,{mode:"visible",children:h.children}),(r.mode&1)===0&&(h.lanes=l),h.return=r,h.sibling=null,n!==null&&(l=r.deletions,l===null?(r.deletions=[n],r.flags|=16):l.push(n)),r.child=h,r.memoizedState=null,h}function rh(n,r){return r=Hl({mode:"visible",children:r},n.mode,0,null),r.return=n,n.child=r}function Rl(n,r,l,h){return h!==null&&Lu(h),Ks(r,n.child,null,l),n=rh(r,r.pendingProps.children),n.flags|=2,r.memoizedState=null,n}function q_(n,r,l,h,g,S,R){if(l)return r.flags&256?(r.flags&=-257,h=Qu(Error(t(422))),Rl(n,r,R,h)):r.memoizedState!==null?(r.child=n.child,r.flags|=128,null):(S=h.fallback,g=r.mode,h=Hl({mode:"visible",children:h.children},g,0,null),S=ds(S,g,R,null),S.flags|=2,h.return=r,S.return=r,h.sibling=S,r.child=h,(r.mode&1)!==0&&Ks(r,n.child,null,R),r.child.memoizedState=ih(R),r.memoizedState=nh,S);if((r.mode&1)===0)return Rl(n,r,R,null);if(g.data==="$!"){if(h=g.nextSibling&&g.nextSibling.dataset,h)var k=h.dgst;return h=k,S=Error(t(419)),h=Qu(S,h,void 0),Rl(n,r,R,h)}if(k=(R&n.childLanes)!==0,Wn||k){if(h=mn,h!==null){switch(R&-R){case 4:g=2;break;case 16:g=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:g=32;break;case 536870912:g=268435456;break;default:g=0}g=(g&(h.suspendedLanes|R))!==0?0:g,g!==0&&g!==S.retryLane&&(S.retryLane=g,er(n,g),wi(h,n,g,-1))}return xh(),h=Qu(Error(t(421))),Rl(n,r,R,h)}return g.data==="$?"?(r.flags|=128,r.child=n.child,r=oy.bind(null,n),g._reactRetry=r,null):(n=S.treeContext,ti=Rr(g.nextSibling),ei=r,Xt=!0,xi=null,n!==null&&(ci[ui++]=Qi,ci[ui++]=Ji,ci[ui++]=is,Qi=n.id,Ji=n.overflow,is=r),r=rh(r,h.children),r.flags|=4096,r)}function xm(n,r,l){n.lanes|=r;var h=n.alternate;h!==null&&(h.lanes|=r),Uu(n.return,r,l)}function sh(n,r,l,h,g){var S=n.memoizedState;S===null?n.memoizedState={isBackwards:r,rendering:null,renderingStartTime:0,last:h,tail:l,tailMode:g}:(S.isBackwards=r,S.rendering=null,S.renderingStartTime=0,S.last=h,S.tail=l,S.tailMode=g)}function Sm(n,r,l){var h=r.pendingProps,g=h.revealOrder,S=h.tail;if(Fn(n,r,h.children,l),h=qt.current,(h&2)!==0)h=h&1|2,r.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=r.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&xm(n,l,r);else if(n.tag===19)xm(n,l,r);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===r)break e;for(;n.sibling===null;){if(n.return===null||n.return===r)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}h&=1}if(Bt(qt,h),(r.mode&1)===0)r.memoizedState=null;else switch(g){case"forwards":for(l=r.child,g=null;l!==null;)n=l.alternate,n!==null&&Sl(n)===null&&(g=l),l=l.sibling;l=g,l===null?(g=r.child,r.child=null):(g=l.sibling,l.sibling=null),sh(r,!1,g,l,S);break;case"backwards":for(l=null,g=r.child,r.child=null;g!==null;){if(n=g.alternate,n!==null&&Sl(n)===null){r.child=g;break}n=g.sibling,g.sibling=l,l=g,g=n}sh(r,!0,l,null,S);break;case"together":sh(r,!1,null,null,void 0);break;default:r.memoizedState=null}return r.child}function bl(n,r){(r.mode&1)===0&&n!==null&&(n.alternate=null,r.alternate=null,r.flags|=2)}function nr(n,r,l){if(n!==null&&(r.dependencies=n.dependencies),ls|=r.lanes,(l&r.childLanes)===0)return null;if(n!==null&&r.child!==n.child)throw Error(t(153));if(r.child!==null){for(n=r.child,l=Br(n,n.pendingProps),r.child=l,l.return=r;n.sibling!==null;)n=n.sibling,l=l.sibling=Br(n,n.pendingProps),l.return=r;l.sibling=null}return r.child}function Y_(n,r,l){switch(r.tag){case 3:vm(r),Zs();break;case 5:Up(r);break;case 1:Gn(r.type)&&hl(r);break;case 4:zu(r,r.stateNode.containerInfo);break;case 10:var h=r.type._context,g=r.memoizedProps.value;Bt(vl,h._currentValue),h._currentValue=g;break;case 13:if(h=r.memoizedState,h!==null)return h.dehydrated!==null?(Bt(qt,qt.current&1),r.flags|=128,null):(l&r.child.childLanes)!==0?ym(n,r,l):(Bt(qt,qt.current&1),n=nr(n,r,l),n!==null?n.sibling:null);Bt(qt,qt.current&1);break;case 19:if(h=(l&r.childLanes)!==0,(n.flags&128)!==0){if(h)return Sm(n,r,l);r.flags|=128}if(g=r.memoizedState,g!==null&&(g.rendering=null,g.tail=null,g.lastEffect=null),Bt(qt,qt.current),h)break;return null;case 22:case 23:return r.lanes=0,pm(n,r,l)}return nr(n,r,l)}var Mm,oh,Em,wm;Mm=function(n,r){for(var l=r.child;l!==null;){if(l.tag===5||l.tag===6)n.appendChild(l.stateNode);else if(l.tag!==4&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===r)break;for(;l.sibling===null;){if(l.return===null||l.return===r)return;l=l.return}l.sibling.return=l.return,l=l.sibling}},oh=function(){},Em=function(n,r,l,h){var g=n.memoizedProps;if(g!==h){n=r.stateNode,os(Oi.current);var S=null;switch(l){case"input":g=te(n,g),h=te(n,h),S=[];break;case"select":g=se({},g,{value:void 0}),h=se({},h,{value:void 0}),S=[];break;case"textarea":g=L(n,g),h=L(n,h),S=[];break;default:typeof g.onClick!="function"&&typeof h.onClick=="function"&&(n.onclick=ll)}gt(l,h);var R;l=null;for(le in g)if(!h.hasOwnProperty(le)&&g.hasOwnProperty(le)&&g[le]!=null)if(le==="style"){var k=g[le];for(R in k)k.hasOwnProperty(R)&&(l||(l={}),l[R]="")}else le!=="dangerouslySetInnerHTML"&&le!=="children"&&le!=="suppressContentEditableWarning"&&le!=="suppressHydrationWarning"&&le!=="autoFocus"&&(s.hasOwnProperty(le)?S||(S=[]):(S=S||[]).push(le,null));for(le in h){var X=h[le];if(k=g!=null?g[le]:void 0,h.hasOwnProperty(le)&&X!==k&&(X!=null||k!=null))if(le==="style")if(k){for(R in k)!k.hasOwnProperty(R)||X&&X.hasOwnProperty(R)||(l||(l={}),l[R]="");for(R in X)X.hasOwnProperty(R)&&k[R]!==X[R]&&(l||(l={}),l[R]=X[R])}else l||(S||(S=[]),S.push(le,l)),l=X;else le==="dangerouslySetInnerHTML"?(X=X?X.__html:void 0,k=k?k.__html:void 0,X!=null&&k!==X&&(S=S||[]).push(le,X)):le==="children"?typeof X!="string"&&typeof X!="number"||(S=S||[]).push(le,""+X):le!=="suppressContentEditableWarning"&&le!=="suppressHydrationWarning"&&(s.hasOwnProperty(le)?(X!=null&&le==="onScroll"&&Vt("scroll",n),S||k===X||(S=[])):(S=S||[]).push(le,X))}l&&(S=S||[]).push("style",l);var le=S;(r.updateQueue=le)&&(r.flags|=4)}},wm=function(n,r,l,h){l!==h&&(r.flags|=4)};function ha(n,r){if(!Xt)switch(n.tailMode){case"hidden":r=n.tail;for(var l=null;r!==null;)r.alternate!==null&&(l=r),r=r.sibling;l===null?n.tail=null:l.sibling=null;break;case"collapsed":l=n.tail;for(var h=null;l!==null;)l.alternate!==null&&(h=l),l=l.sibling;h===null?r||n.tail===null?n.tail=null:n.tail.sibling=null:h.sibling=null}}function An(n){var r=n.alternate!==null&&n.alternate.child===n.child,l=0,h=0;if(r)for(var g=n.child;g!==null;)l|=g.lanes|g.childLanes,h|=g.subtreeFlags&14680064,h|=g.flags&14680064,g.return=n,g=g.sibling;else for(g=n.child;g!==null;)l|=g.lanes|g.childLanes,h|=g.subtreeFlags,h|=g.flags,g.return=n,g=g.sibling;return n.subtreeFlags|=h,n.childLanes=l,r}function $_(n,r,l){var h=r.pendingProps;switch(Ru(r),r.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return An(r),null;case 1:return Gn(r.type)&&ul(),An(r),null;case 3:return h=r.stateNode,eo(),Gt(Vn),Gt(wn),Hu(),h.pendingContext&&(h.context=h.pendingContext,h.pendingContext=null),(n===null||n.child===null)&&(ml(r)?r.flags|=4:n===null||n.memoizedState.isDehydrated&&(r.flags&256)===0||(r.flags|=1024,xi!==null&&(vh(xi),xi=null))),oh(n,r),An(r),null;case 5:Bu(r);var g=os(oa.current);if(l=r.type,n!==null&&r.stateNode!=null)Em(n,r,l,h,g),n.ref!==r.ref&&(r.flags|=512,r.flags|=2097152);else{if(!h){if(r.stateNode===null)throw Error(t(166));return An(r),null}if(n=os(Oi.current),ml(r)){h=r.stateNode,l=r.type;var S=r.memoizedProps;switch(h[Fi]=r,h[ta]=S,n=(r.mode&1)!==0,l){case"dialog":Vt("cancel",h),Vt("close",h);break;case"iframe":case"object":case"embed":Vt("load",h);break;case"video":case"audio":for(g=0;g<Qo.length;g++)Vt(Qo[g],h);break;case"source":Vt("error",h);break;case"img":case"image":case"link":Vt("error",h),Vt("load",h);break;case"details":Vt("toggle",h);break;case"input":Dn(h,S),Vt("invalid",h);break;case"select":h._wrapperState={wasMultiple:!!S.multiple},Vt("invalid",h);break;case"textarea":ae(h,S),Vt("invalid",h)}gt(l,S),g=null;for(var R in S)if(S.hasOwnProperty(R)){var k=S[R];R==="children"?typeof k=="string"?h.textContent!==k&&(S.suppressHydrationWarning!==!0&&al(h.textContent,k,n),g=["children",k]):typeof k=="number"&&h.textContent!==""+k&&(S.suppressHydrationWarning!==!0&&al(h.textContent,k,n),g=["children",""+k]):s.hasOwnProperty(R)&&k!=null&&R==="onScroll"&&Vt("scroll",h)}switch(l){case"input":Dt(h),Je(h,S,!0);break;case"textarea":Dt(h),ye(h);break;case"select":case"option":break;default:typeof S.onClick=="function"&&(h.onclick=ll)}h=g,r.updateQueue=h,h!==null&&(r.flags|=4)}else{R=g.nodeType===9?g:g.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=fe(l)),n==="http://www.w3.org/1999/xhtml"?l==="script"?(n=R.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof h.is=="string"?n=R.createElement(l,{is:h.is}):(n=R.createElement(l),l==="select"&&(R=n,h.multiple?R.multiple=!0:h.size&&(R.size=h.size))):n=R.createElementNS(n,l),n[Fi]=r,n[ta]=h,Mm(n,r,!1,!1),r.stateNode=n;e:{switch(R=ct(l,h),l){case"dialog":Vt("cancel",n),Vt("close",n),g=h;break;case"iframe":case"object":case"embed":Vt("load",n),g=h;break;case"video":case"audio":for(g=0;g<Qo.length;g++)Vt(Qo[g],n);g=h;break;case"source":Vt("error",n),g=h;break;case"img":case"image":case"link":Vt("error",n),Vt("load",n),g=h;break;case"details":Vt("toggle",n),g=h;break;case"input":Dn(n,h),g=te(n,h),Vt("invalid",n);break;case"option":g=h;break;case"select":n._wrapperState={wasMultiple:!!h.multiple},g=se({},h,{value:void 0}),Vt("invalid",n);break;case"textarea":ae(n,h),g=L(n,h),Vt("invalid",n);break;default:g=h}gt(l,g),k=g;for(S in k)if(k.hasOwnProperty(S)){var X=k[S];S==="style"?rt(n,X):S==="dangerouslySetInnerHTML"?(X=X?X.__html:void 0,X!=null&&ze(n,X)):S==="children"?typeof X=="string"?(l!=="textarea"||X!=="")&&pt(n,X):typeof X=="number"&&pt(n,""+X):S!=="suppressContentEditableWarning"&&S!=="suppressHydrationWarning"&&S!=="autoFocus"&&(s.hasOwnProperty(S)?X!=null&&S==="onScroll"&&Vt("scroll",n):X!=null&&A(n,S,X,R))}switch(l){case"input":Dt(n),Je(n,h,!1);break;case"textarea":Dt(n),ye(n);break;case"option":h.value!=null&&n.setAttribute("value",""+Ce(h.value));break;case"select":n.multiple=!!h.multiple,S=h.value,S!=null?F(n,!!h.multiple,S,!1):h.defaultValue!=null&&F(n,!!h.multiple,h.defaultValue,!0);break;default:typeof g.onClick=="function"&&(n.onclick=ll)}switch(l){case"button":case"input":case"select":case"textarea":h=!!h.autoFocus;break e;case"img":h=!0;break e;default:h=!1}}h&&(r.flags|=4)}r.ref!==null&&(r.flags|=512,r.flags|=2097152)}return An(r),null;case 6:if(n&&r.stateNode!=null)wm(n,r,n.memoizedProps,h);else{if(typeof h!="string"&&r.stateNode===null)throw Error(t(166));if(l=os(oa.current),os(Oi.current),ml(r)){if(h=r.stateNode,l=r.memoizedProps,h[Fi]=r,(S=h.nodeValue!==l)&&(n=ei,n!==null))switch(n.tag){case 3:al(h.nodeValue,l,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&al(h.nodeValue,l,(n.mode&1)!==0)}S&&(r.flags|=4)}else h=(l.nodeType===9?l:l.ownerDocument).createTextNode(h),h[Fi]=r,r.stateNode=h}return An(r),null;case 13:if(Gt(qt),h=r.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(Xt&&ti!==null&&(r.mode&1)!==0&&(r.flags&128)===0)Cp(),Zs(),r.flags|=98560,S=!1;else if(S=ml(r),h!==null&&h.dehydrated!==null){if(n===null){if(!S)throw Error(t(318));if(S=r.memoizedState,S=S!==null?S.dehydrated:null,!S)throw Error(t(317));S[Fi]=r}else Zs(),(r.flags&128)===0&&(r.memoizedState=null),r.flags|=4;An(r),S=!1}else xi!==null&&(vh(xi),xi=null),S=!0;if(!S)return r.flags&65536?r:null}return(r.flags&128)!==0?(r.lanes=l,r):(h=h!==null,h!==(n!==null&&n.memoizedState!==null)&&h&&(r.child.flags|=8192,(r.mode&1)!==0&&(n===null||(qt.current&1)!==0?un===0&&(un=3):xh())),r.updateQueue!==null&&(r.flags|=4),An(r),null);case 4:return eo(),oh(n,r),n===null&&Jo(r.stateNode.containerInfo),An(r),null;case 10:return Nu(r.type._context),An(r),null;case 17:return Gn(r.type)&&ul(),An(r),null;case 19:if(Gt(qt),S=r.memoizedState,S===null)return An(r),null;if(h=(r.flags&128)!==0,R=S.rendering,R===null)if(h)ha(S,!1);else{if(un!==0||n!==null&&(n.flags&128)!==0)for(n=r.child;n!==null;){if(R=Sl(n),R!==null){for(r.flags|=128,ha(S,!1),h=R.updateQueue,h!==null&&(r.updateQueue=h,r.flags|=4),r.subtreeFlags=0,h=l,l=r.child;l!==null;)S=l,n=h,S.flags&=14680066,R=S.alternate,R===null?(S.childLanes=0,S.lanes=n,S.child=null,S.subtreeFlags=0,S.memoizedProps=null,S.memoizedState=null,S.updateQueue=null,S.dependencies=null,S.stateNode=null):(S.childLanes=R.childLanes,S.lanes=R.lanes,S.child=R.child,S.subtreeFlags=0,S.deletions=null,S.memoizedProps=R.memoizedProps,S.memoizedState=R.memoizedState,S.updateQueue=R.updateQueue,S.type=R.type,n=R.dependencies,S.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),l=l.sibling;return Bt(qt,qt.current&1|2),r.child}n=n.sibling}S.tail!==null&&we()>ro&&(r.flags|=128,h=!0,ha(S,!1),r.lanes=4194304)}else{if(!h)if(n=Sl(R),n!==null){if(r.flags|=128,h=!0,l=n.updateQueue,l!==null&&(r.updateQueue=l,r.flags|=4),ha(S,!0),S.tail===null&&S.tailMode==="hidden"&&!R.alternate&&!Xt)return An(r),null}else 2*we()-S.renderingStartTime>ro&&l!==1073741824&&(r.flags|=128,h=!0,ha(S,!1),r.lanes=4194304);S.isBackwards?(R.sibling=r.child,r.child=R):(l=S.last,l!==null?l.sibling=R:r.child=R,S.last=R)}return S.tail!==null?(r=S.tail,S.rendering=r,S.tail=r.sibling,S.renderingStartTime=we(),r.sibling=null,l=qt.current,Bt(qt,h?l&1|2:l&1),r):(An(r),null);case 22:case 23:return yh(),h=r.memoizedState!==null,n!==null&&n.memoizedState!==null!==h&&(r.flags|=8192),h&&(r.mode&1)!==0?(ni&1073741824)!==0&&(An(r),r.subtreeFlags&6&&(r.flags|=8192)):An(r),null;case 24:return null;case 25:return null}throw Error(t(156,r.tag))}function Z_(n,r){switch(Ru(r),r.tag){case 1:return Gn(r.type)&&ul(),n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 3:return eo(),Gt(Vn),Gt(wn),Hu(),n=r.flags,(n&65536)!==0&&(n&128)===0?(r.flags=n&-65537|128,r):null;case 5:return Bu(r),null;case 13:if(Gt(qt),n=r.memoizedState,n!==null&&n.dehydrated!==null){if(r.alternate===null)throw Error(t(340));Zs()}return n=r.flags,n&65536?(r.flags=n&-65537|128,r):null;case 19:return Gt(qt),null;case 4:return eo(),null;case 10:return Nu(r.type._context),null;case 22:case 23:return yh(),null;case 24:return null;default:return null}}var Pl=!1,Cn=!1,K_=typeof WeakSet=="function"?WeakSet:Set,Be=null;function no(n,r){var l=n.ref;if(l!==null)if(typeof l=="function")try{l(null)}catch(h){Zt(n,r,h)}else l.current=null}function ah(n,r,l){try{l()}catch(h){Zt(n,r,h)}}var Tm=!1;function Q_(n,r){if(yu=Za,n=ip(),hu(n)){if("selectionStart"in n)var l={start:n.selectionStart,end:n.selectionEnd};else e:{l=(l=n.ownerDocument)&&l.defaultView||window;var h=l.getSelection&&l.getSelection();if(h&&h.rangeCount!==0){l=h.anchorNode;var g=h.anchorOffset,S=h.focusNode;h=h.focusOffset;try{l.nodeType,S.nodeType}catch{l=null;break e}var R=0,k=-1,X=-1,le=0,xe=0,Se=n,ge=null;t:for(;;){for(var Ue;Se!==l||g!==0&&Se.nodeType!==3||(k=R+g),Se!==S||h!==0&&Se.nodeType!==3||(X=R+h),Se.nodeType===3&&(R+=Se.nodeValue.length),(Ue=Se.firstChild)!==null;)ge=Se,Se=Ue;for(;;){if(Se===n)break t;if(ge===l&&++le===g&&(k=R),ge===S&&++xe===h&&(X=R),(Ue=Se.nextSibling)!==null)break;Se=ge,ge=Se.parentNode}Se=Ue}l=k===-1||X===-1?null:{start:k,end:X}}else l=null}l=l||{start:0,end:0}}else l=null;for(xu={focusedElem:n,selectionRange:l},Za=!1,Be=r;Be!==null;)if(r=Be,n=r.child,(r.subtreeFlags&1028)!==0&&n!==null)n.return=r,Be=n;else for(;Be!==null;){r=Be;try{var Ve=r.alternate;if((r.flags&1024)!==0)switch(r.tag){case 0:case 11:case 15:break;case 1:if(Ve!==null){var Xe=Ve.memoizedProps,Jt=Ve.memoizedState,ie=r.stateNode,$=ie.getSnapshotBeforeUpdate(r.elementType===r.type?Xe:Si(r.type,Xe),Jt);ie.__reactInternalSnapshotBeforeUpdate=$}break;case 3:var oe=r.stateNode.containerInfo;oe.nodeType===1?oe.textContent="":oe.nodeType===9&&oe.documentElement&&oe.removeChild(oe.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(Te){Zt(r,r.return,Te)}if(n=r.sibling,n!==null){n.return=r.return,Be=n;break}Be=r.return}return Ve=Tm,Tm=!1,Ve}function da(n,r,l){var h=r.updateQueue;if(h=h!==null?h.lastEffect:null,h!==null){var g=h=h.next;do{if((g.tag&n)===n){var S=g.destroy;g.destroy=void 0,S!==void 0&&ah(r,l,S)}g=g.next}while(g!==h)}}function Ll(n,r){if(r=r.updateQueue,r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&n)===n){var h=l.create;l.destroy=h()}l=l.next}while(l!==r)}}function lh(n){var r=n.ref;if(r!==null){var l=n.stateNode;switch(n.tag){case 5:n=l;break;default:n=l}typeof r=="function"?r(n):r.current=n}}function Am(n){var r=n.alternate;r!==null&&(n.alternate=null,Am(r)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(r=n.stateNode,r!==null&&(delete r[Fi],delete r[ta],delete r[wu],delete r[N_],delete r[U_])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Cm(n){return n.tag===5||n.tag===3||n.tag===4}function Rm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Cm(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function ch(n,r,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,r?l.nodeType===8?l.parentNode.insertBefore(n,r):l.insertBefore(n,r):(l.nodeType===8?(r=l.parentNode,r.insertBefore(n,l)):(r=l,r.appendChild(n)),l=l._reactRootContainer,l!=null||r.onclick!==null||(r.onclick=ll));else if(h!==4&&(n=n.child,n!==null))for(ch(n,r,l),n=n.sibling;n!==null;)ch(n,r,l),n=n.sibling}function uh(n,r,l){var h=n.tag;if(h===5||h===6)n=n.stateNode,r?l.insertBefore(n,r):l.appendChild(n);else if(h!==4&&(n=n.child,n!==null))for(uh(n,r,l),n=n.sibling;n!==null;)uh(n,r,l),n=n.sibling}var _n=null,Mi=!1;function Nr(n,r,l){for(l=l.child;l!==null;)bm(n,r,l),l=l.sibling}function bm(n,r,l){if(xt&&typeof xt.onCommitFiberUnmount=="function")try{xt.onCommitFiberUnmount(bt,l)}catch{}switch(l.tag){case 5:Cn||no(l,r);case 6:var h=_n,g=Mi;_n=null,Nr(n,r,l),_n=h,Mi=g,_n!==null&&(Mi?(n=_n,l=l.stateNode,n.nodeType===8?n.parentNode.removeChild(l):n.removeChild(l)):_n.removeChild(l.stateNode));break;case 18:_n!==null&&(Mi?(n=_n,l=l.stateNode,n.nodeType===8?Eu(n.parentNode,l):n.nodeType===1&&Eu(n,l),Wo(n)):Eu(_n,l.stateNode));break;case 4:h=_n,g=Mi,_n=l.stateNode.containerInfo,Mi=!0,Nr(n,r,l),_n=h,Mi=g;break;case 0:case 11:case 14:case 15:if(!Cn&&(h=l.updateQueue,h!==null&&(h=h.lastEffect,h!==null))){g=h=h.next;do{var S=g,R=S.destroy;S=S.tag,R!==void 0&&((S&2)!==0||(S&4)!==0)&&ah(l,r,R),g=g.next}while(g!==h)}Nr(n,r,l);break;case 1:if(!Cn&&(no(l,r),h=l.stateNode,typeof h.componentWillUnmount=="function"))try{h.props=l.memoizedProps,h.state=l.memoizedState,h.componentWillUnmount()}catch(k){Zt(l,r,k)}Nr(n,r,l);break;case 21:Nr(n,r,l);break;case 22:l.mode&1?(Cn=(h=Cn)||l.memoizedState!==null,Nr(n,r,l),Cn=h):Nr(n,r,l);break;default:Nr(n,r,l)}}function Pm(n){var r=n.updateQueue;if(r!==null){n.updateQueue=null;var l=n.stateNode;l===null&&(l=n.stateNode=new K_),r.forEach(function(h){var g=ay.bind(null,n,h);l.has(h)||(l.add(h),h.then(g,g))})}}function Ei(n,r){var l=r.deletions;if(l!==null)for(var h=0;h<l.length;h++){var g=l[h];try{var S=n,R=r,k=R;e:for(;k!==null;){switch(k.tag){case 5:_n=k.stateNode,Mi=!1;break e;case 3:_n=k.stateNode.containerInfo,Mi=!0;break e;case 4:_n=k.stateNode.containerInfo,Mi=!0;break e}k=k.return}if(_n===null)throw Error(t(160));bm(S,R,g),_n=null,Mi=!1;var X=g.alternate;X!==null&&(X.return=null),g.return=null}catch(le){Zt(g,r,le)}}if(r.subtreeFlags&12854)for(r=r.child;r!==null;)Lm(r,n),r=r.sibling}function Lm(n,r){var l=n.alternate,h=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Ei(r,n),Bi(n),h&4){try{da(3,n,n.return),Ll(3,n)}catch(Xe){Zt(n,n.return,Xe)}try{da(5,n,n.return)}catch(Xe){Zt(n,n.return,Xe)}}break;case 1:Ei(r,n),Bi(n),h&512&&l!==null&&no(l,l.return);break;case 5:if(Ei(r,n),Bi(n),h&512&&l!==null&&no(l,l.return),n.flags&32){var g=n.stateNode;try{pt(g,"")}catch(Xe){Zt(n,n.return,Xe)}}if(h&4&&(g=n.stateNode,g!=null)){var S=n.memoizedProps,R=l!==null?l.memoizedProps:S,k=n.type,X=n.updateQueue;if(n.updateQueue=null,X!==null)try{k==="input"&&S.type==="radio"&&S.name!=null&&_t(g,S),ct(k,R);var le=ct(k,S);for(R=0;R<X.length;R+=2){var xe=X[R],Se=X[R+1];xe==="style"?rt(g,Se):xe==="dangerouslySetInnerHTML"?ze(g,Se):xe==="children"?pt(g,Se):A(g,xe,Se,le)}switch(k){case"input":mt(g,S);break;case"textarea":me(g,S);break;case"select":var ge=g._wrapperState.wasMultiple;g._wrapperState.wasMultiple=!!S.multiple;var Ue=S.value;Ue!=null?F(g,!!S.multiple,Ue,!1):ge!==!!S.multiple&&(S.defaultValue!=null?F(g,!!S.multiple,S.defaultValue,!0):F(g,!!S.multiple,S.multiple?[]:"",!1))}g[ta]=S}catch(Xe){Zt(n,n.return,Xe)}}break;case 6:if(Ei(r,n),Bi(n),h&4){if(n.stateNode===null)throw Error(t(162));g=n.stateNode,S=n.memoizedProps;try{g.nodeValue=S}catch(Xe){Zt(n,n.return,Xe)}}break;case 3:if(Ei(r,n),Bi(n),h&4&&l!==null&&l.memoizedState.isDehydrated)try{Wo(r.containerInfo)}catch(Xe){Zt(n,n.return,Xe)}break;case 4:Ei(r,n),Bi(n);break;case 13:Ei(r,n),Bi(n),g=n.child,g.flags&8192&&(S=g.memoizedState!==null,g.stateNode.isHidden=S,!S||g.alternate!==null&&g.alternate.memoizedState!==null||(fh=we())),h&4&&Pm(n);break;case 22:if(xe=l!==null&&l.memoizedState!==null,n.mode&1?(Cn=(le=Cn)||xe,Ei(r,n),Cn=le):Ei(r,n),Bi(n),h&8192){if(le=n.memoizedState!==null,(n.stateNode.isHidden=le)&&!xe&&(n.mode&1)!==0)for(Be=n,xe=n.child;xe!==null;){for(Se=Be=xe;Be!==null;){switch(ge=Be,Ue=ge.child,ge.tag){case 0:case 11:case 14:case 15:da(4,ge,ge.return);break;case 1:no(ge,ge.return);var Ve=ge.stateNode;if(typeof Ve.componentWillUnmount=="function"){h=ge,l=ge.return;try{r=h,Ve.props=r.memoizedProps,Ve.state=r.memoizedState,Ve.componentWillUnmount()}catch(Xe){Zt(h,l,Xe)}}break;case 5:no(ge,ge.return);break;case 22:if(ge.memoizedState!==null){Nm(Se);continue}}Ue!==null?(Ue.return=ge,Be=Ue):Nm(Se)}xe=xe.sibling}e:for(xe=null,Se=n;;){if(Se.tag===5){if(xe===null){xe=Se;try{g=Se.stateNode,le?(S=g.style,typeof S.setProperty=="function"?S.setProperty("display","none","important"):S.display="none"):(k=Se.stateNode,X=Se.memoizedProps.style,R=X!=null&&X.hasOwnProperty("display")?X.display:null,k.style.display=it("display",R))}catch(Xe){Zt(n,n.return,Xe)}}}else if(Se.tag===6){if(xe===null)try{Se.stateNode.nodeValue=le?"":Se.memoizedProps}catch(Xe){Zt(n,n.return,Xe)}}else if((Se.tag!==22&&Se.tag!==23||Se.memoizedState===null||Se===n)&&Se.child!==null){Se.child.return=Se,Se=Se.child;continue}if(Se===n)break e;for(;Se.sibling===null;){if(Se.return===null||Se.return===n)break e;xe===Se&&(xe=null),Se=Se.return}xe===Se&&(xe=null),Se.sibling.return=Se.return,Se=Se.sibling}}break;case 19:Ei(r,n),Bi(n),h&4&&Pm(n);break;case 21:break;default:Ei(r,n),Bi(n)}}function Bi(n){var r=n.flags;if(r&2){try{e:{for(var l=n.return;l!==null;){if(Cm(l)){var h=l;break e}l=l.return}throw Error(t(160))}switch(h.tag){case 5:var g=h.stateNode;h.flags&32&&(pt(g,""),h.flags&=-33);var S=Rm(n);uh(n,S,g);break;case 3:case 4:var R=h.stateNode.containerInfo,k=Rm(n);ch(n,k,R);break;default:throw Error(t(161))}}catch(X){Zt(n,n.return,X)}n.flags&=-3}r&4096&&(n.flags&=-4097)}function J_(n,r,l){Be=n,Im(n)}function Im(n,r,l){for(var h=(n.mode&1)!==0;Be!==null;){var g=Be,S=g.child;if(g.tag===22&&h){var R=g.memoizedState!==null||Pl;if(!R){var k=g.alternate,X=k!==null&&k.memoizedState!==null||Cn;k=Pl;var le=Cn;if(Pl=R,(Cn=X)&&!le)for(Be=g;Be!==null;)R=Be,X=R.child,R.tag===22&&R.memoizedState!==null?Um(g):X!==null?(X.return=R,Be=X):Um(g);for(;S!==null;)Be=S,Im(S),S=S.sibling;Be=g,Pl=k,Cn=le}Dm(n)}else(g.subtreeFlags&8772)!==0&&S!==null?(S.return=g,Be=S):Dm(n)}}function Dm(n){for(;Be!==null;){var r=Be;if((r.flags&8772)!==0){var l=r.alternate;try{if((r.flags&8772)!==0)switch(r.tag){case 0:case 11:case 15:Cn||Ll(5,r);break;case 1:var h=r.stateNode;if(r.flags&4&&!Cn)if(l===null)h.componentDidMount();else{var g=r.elementType===r.type?l.memoizedProps:Si(r.type,l.memoizedProps);h.componentDidUpdate(g,l.memoizedState,h.__reactInternalSnapshotBeforeUpdate)}var S=r.updateQueue;S!==null&&Np(r,S,h);break;case 3:var R=r.updateQueue;if(R!==null){if(l=null,r.child!==null)switch(r.child.tag){case 5:l=r.child.stateNode;break;case 1:l=r.child.stateNode}Np(r,R,l)}break;case 5:var k=r.stateNode;if(l===null&&r.flags&4){l=k;var X=r.memoizedProps;switch(r.type){case"button":case"input":case"select":case"textarea":X.autoFocus&&l.focus();break;case"img":X.src&&(l.src=X.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(r.memoizedState===null){var le=r.alternate;if(le!==null){var xe=le.memoizedState;if(xe!==null){var Se=xe.dehydrated;Se!==null&&Wo(Se)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}Cn||r.flags&512&&lh(r)}catch(ge){Zt(r,r.return,ge)}}if(r===n){Be=null;break}if(l=r.sibling,l!==null){l.return=r.return,Be=l;break}Be=r.return}}function Nm(n){for(;Be!==null;){var r=Be;if(r===n){Be=null;break}var l=r.sibling;if(l!==null){l.return=r.return,Be=l;break}Be=r.return}}function Um(n){for(;Be!==null;){var r=Be;try{switch(r.tag){case 0:case 11:case 15:var l=r.return;try{Ll(4,r)}catch(X){Zt(r,l,X)}break;case 1:var h=r.stateNode;if(typeof h.componentDidMount=="function"){var g=r.return;try{h.componentDidMount()}catch(X){Zt(r,g,X)}}var S=r.return;try{lh(r)}catch(X){Zt(r,S,X)}break;case 5:var R=r.return;try{lh(r)}catch(X){Zt(r,R,X)}}}catch(X){Zt(r,r.return,X)}if(r===n){Be=null;break}var k=r.sibling;if(k!==null){k.return=r.return,Be=k;break}Be=r.return}}var ey=Math.ceil,Il=T.ReactCurrentDispatcher,hh=T.ReactCurrentOwner,fi=T.ReactCurrentBatchConfig,wt=0,mn=null,tn=null,yn=0,ni=0,io=br(0),un=0,fa=null,ls=0,Dl=0,dh=0,pa=null,Xn=null,fh=0,ro=1/0,ir=null,Nl=!1,ph=null,Ur=null,Ul=!1,Fr=null,Fl=0,ma=0,mh=null,Ol=-1,zl=0;function On(){return(wt&6)!==0?we():Ol!==-1?Ol:Ol=we()}function Or(n){return(n.mode&1)===0?1:(wt&2)!==0&&yn!==0?yn&-yn:O_.transition!==null?(zl===0&&(zl=Un()),zl):(n=It,n!==0||(n=window.event,n=n===void 0?16:Of(n.type)),n)}function wi(n,r,l,h){if(50<ma)throw ma=0,mh=null,Error(t(185));Hn(n,l,h),((wt&2)===0||n!==mn)&&(n===mn&&((wt&2)===0&&(Dl|=l),un===4&&zr(n,yn)),jn(n,h),l===1&&wt===0&&(r.mode&1)===0&&(ro=we()+500,dl&&Lr()))}function jn(n,r){var l=n.callbackNode;ai(n,r);var h=Ui(n,n===mn?yn:0);if(h===0)l!==null&&ue(l),n.callbackNode=null,n.callbackPriority=0;else if(r=h&-h,n.callbackPriority!==r){if(l!=null&&ue(l),r===1)n.tag===0?F_(Om.bind(null,n)):Mp(Om.bind(null,n)),I_(function(){(wt&6)===0&&Lr()}),l=null;else{switch(bf(h)){case 1:l=We;break;case 4:l=st;break;case 16:l=lt;break;case 536870912:l=St;break;default:l=lt}l=Xm(l,Fm.bind(null,n))}n.callbackPriority=r,n.callbackNode=l}}function Fm(n,r){if(Ol=-1,zl=0,(wt&6)!==0)throw Error(t(327));var l=n.callbackNode;if(so()&&n.callbackNode!==l)return null;var h=Ui(n,n===mn?yn:0);if(h===0)return null;if((h&30)!==0||(h&n.expiredLanes)!==0||r)r=Bl(n,h);else{r=h;var g=wt;wt|=2;var S=Bm();(mn!==n||yn!==r)&&(ir=null,ro=we()+500,us(n,r));do try{iy();break}catch(k){zm(n,k)}while(!0);Du(),Il.current=S,wt=g,tn!==null?r=0:(mn=null,yn=0,r=un)}if(r!==0){if(r===2&&(g=$i(n),g!==0&&(h=g,r=gh(n,g))),r===1)throw l=fa,us(n,0),zr(n,h),jn(n,we()),l;if(r===6)zr(n,h);else{if(g=n.current.alternate,(h&30)===0&&!ty(g)&&(r=Bl(n,h),r===2&&(S=$i(n),S!==0&&(h=S,r=gh(n,S))),r===1))throw l=fa,us(n,0),zr(n,h),jn(n,we()),l;switch(n.finishedWork=g,n.finishedLanes=h,r){case 0:case 1:throw Error(t(345));case 2:hs(n,Xn,ir);break;case 3:if(zr(n,h),(h&130023424)===h&&(r=fh+500-we(),10<r)){if(Ui(n,0)!==0)break;if(g=n.suspendedLanes,(g&h)!==h){On(),n.pingedLanes|=n.suspendedLanes&g;break}n.timeoutHandle=Mu(hs.bind(null,n,Xn,ir),r);break}hs(n,Xn,ir);break;case 4:if(zr(n,h),(h&4194240)===h)break;for(r=n.eventTimes,g=-1;0<h;){var R=31-ht(h);S=1<<R,R=r[R],R>g&&(g=R),h&=~S}if(h=g,h=we()-h,h=(120>h?120:480>h?480:1080>h?1080:1920>h?1920:3e3>h?3e3:4320>h?4320:1960*ey(h/1960))-h,10<h){n.timeoutHandle=Mu(hs.bind(null,n,Xn,ir),h);break}hs(n,Xn,ir);break;case 5:hs(n,Xn,ir);break;default:throw Error(t(329))}}}return jn(n,we()),n.callbackNode===l?Fm.bind(null,n):null}function gh(n,r){var l=pa;return n.current.memoizedState.isDehydrated&&(us(n,r).flags|=256),n=Bl(n,r),n!==2&&(r=Xn,Xn=l,r!==null&&vh(r)),n}function vh(n){Xn===null?Xn=n:Xn.push.apply(Xn,n)}function ty(n){for(var r=n;;){if(r.flags&16384){var l=r.updateQueue;if(l!==null&&(l=l.stores,l!==null))for(var h=0;h<l.length;h++){var g=l[h],S=g.getSnapshot;g=g.value;try{if(!yi(S(),g))return!1}catch{return!1}}}if(l=r.child,r.subtreeFlags&16384&&l!==null)l.return=r,r=l;else{if(r===n)break;for(;r.sibling===null;){if(r.return===null||r.return===n)return!0;r=r.return}r.sibling.return=r.return,r=r.sibling}}return!0}function zr(n,r){for(r&=~dh,r&=~Dl,n.suspendedLanes|=r,n.pingedLanes&=~r,n=n.expirationTimes;0<r;){var l=31-ht(r),h=1<<l;n[l]=-1,r&=~h}}function Om(n){if((wt&6)!==0)throw Error(t(327));so();var r=Ui(n,0);if((r&1)===0)return jn(n,we()),null;var l=Bl(n,r);if(n.tag!==0&&l===2){var h=$i(n);h!==0&&(r=h,l=gh(n,h))}if(l===1)throw l=fa,us(n,0),zr(n,r),jn(n,we()),l;if(l===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=r,hs(n,Xn,ir),jn(n,we()),null}function _h(n,r){var l=wt;wt|=1;try{return n(r)}finally{wt=l,wt===0&&(ro=we()+500,dl&&Lr())}}function cs(n){Fr!==null&&Fr.tag===0&&(wt&6)===0&&so();var r=wt;wt|=1;var l=fi.transition,h=It;try{if(fi.transition=null,It=1,n)return n()}finally{It=h,fi.transition=l,wt=r,(wt&6)===0&&Lr()}}function yh(){ni=io.current,Gt(io)}function us(n,r){n.finishedWork=null,n.finishedLanes=0;var l=n.timeoutHandle;if(l!==-1&&(n.timeoutHandle=-1,L_(l)),tn!==null)for(l=tn.return;l!==null;){var h=l;switch(Ru(h),h.tag){case 1:h=h.type.childContextTypes,h!=null&&ul();break;case 3:eo(),Gt(Vn),Gt(wn),Hu();break;case 5:Bu(h);break;case 4:eo();break;case 13:Gt(qt);break;case 19:Gt(qt);break;case 10:Nu(h.type._context);break;case 22:case 23:yh()}l=l.return}if(mn=n,tn=n=Br(n.current,null),yn=ni=r,un=0,fa=null,dh=Dl=ls=0,Xn=pa=null,ss!==null){for(r=0;r<ss.length;r++)if(l=ss[r],h=l.interleaved,h!==null){l.interleaved=null;var g=h.next,S=l.pending;if(S!==null){var R=S.next;S.next=g,h.next=R}l.pending=h}ss=null}return n}function zm(n,r){do{var l=tn;try{if(Du(),Ml.current=Al,El){for(var h=Yt.memoizedState;h!==null;){var g=h.queue;g!==null&&(g.pending=null),h=h.next}El=!1}if(as=0,pn=cn=Yt=null,aa=!1,la=0,hh.current=null,l===null||l.return===null){un=1,fa=r,tn=null;break}e:{var S=n,R=l.return,k=l,X=r;if(r=yn,k.flags|=32768,X!==null&&typeof X=="object"&&typeof X.then=="function"){var le=X,xe=k,Se=xe.tag;if((xe.mode&1)===0&&(Se===0||Se===11||Se===15)){var ge=xe.alternate;ge?(xe.updateQueue=ge.updateQueue,xe.memoizedState=ge.memoizedState,xe.lanes=ge.lanes):(xe.updateQueue=null,xe.memoizedState=null)}var Ue=cm(R);if(Ue!==null){Ue.flags&=-257,um(Ue,R,k,S,r),Ue.mode&1&&lm(S,le,r),r=Ue,X=le;var Ve=r.updateQueue;if(Ve===null){var Xe=new Set;Xe.add(X),r.updateQueue=Xe}else Ve.add(X);break e}else{if((r&1)===0){lm(S,le,r),xh();break e}X=Error(t(426))}}else if(Xt&&k.mode&1){var Jt=cm(R);if(Jt!==null){(Jt.flags&65536)===0&&(Jt.flags|=256),um(Jt,R,k,S,r),Lu(to(X,k));break e}}S=X=to(X,k),un!==4&&(un=2),pa===null?pa=[S]:pa.push(S),S=R;do{switch(S.tag){case 3:S.flags|=65536,r&=-r,S.lanes|=r;var ie=om(S,X,r);Dp(S,ie);break e;case 1:k=X;var $=S.type,oe=S.stateNode;if((S.flags&128)===0&&(typeof $.getDerivedStateFromError=="function"||oe!==null&&typeof oe.componentDidCatch=="function"&&(Ur===null||!Ur.has(oe)))){S.flags|=65536,r&=-r,S.lanes|=r;var Te=am(S,k,r);Dp(S,Te);break e}}S=S.return}while(S!==null)}Hm(l)}catch(Ze){r=Ze,tn===l&&l!==null&&(tn=l=l.return);continue}break}while(!0)}function Bm(){var n=Il.current;return Il.current=Al,n===null?Al:n}function xh(){(un===0||un===3||un===2)&&(un=4),mn===null||(ls&268435455)===0&&(Dl&268435455)===0||zr(mn,yn)}function Bl(n,r){var l=wt;wt|=2;var h=Bm();(mn!==n||yn!==r)&&(ir=null,us(n,r));do try{ny();break}catch(g){zm(n,g)}while(!0);if(Du(),wt=l,Il.current=h,tn!==null)throw Error(t(261));return mn=null,yn=0,un}function ny(){for(;tn!==null;)km(tn)}function iy(){for(;tn!==null&&!ee();)km(tn)}function km(n){var r=Wm(n.alternate,n,ni);n.memoizedProps=n.pendingProps,r===null?Hm(n):tn=r,hh.current=null}function Hm(n){var r=n;do{var l=r.alternate;if(n=r.return,(r.flags&32768)===0){if(l=$_(l,r,ni),l!==null){tn=l;return}}else{if(l=Z_(l,r),l!==null){l.flags&=32767,tn=l;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{un=6,tn=null;return}}if(r=r.sibling,r!==null){tn=r;return}tn=r=n}while(r!==null);un===0&&(un=5)}function hs(n,r,l){var h=It,g=fi.transition;try{fi.transition=null,It=1,ry(n,r,l,h)}finally{fi.transition=g,It=h}return null}function ry(n,r,l,h){do so();while(Fr!==null);if((wt&6)!==0)throw Error(t(327));l=n.finishedWork;var g=n.finishedLanes;if(l===null)return null;if(n.finishedWork=null,n.finishedLanes=0,l===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var S=l.lanes|l.childLanes;if(qa(n,S),n===mn&&(tn=mn=null,yn=0),(l.subtreeFlags&2064)===0&&(l.flags&2064)===0||Ul||(Ul=!0,Xm(lt,function(){return so(),null})),S=(l.flags&15990)!==0,(l.subtreeFlags&15990)!==0||S){S=fi.transition,fi.transition=null;var R=It;It=1;var k=wt;wt|=4,hh.current=null,Q_(n,l),Lm(l,n),w_(xu),Za=!!yu,xu=yu=null,n.current=l,J_(l),Ae(),wt=k,It=R,fi.transition=S}else n.current=l;if(Ul&&(Ul=!1,Fr=n,Fl=g),S=n.pendingLanes,S===0&&(Ur=null),Mn(l.stateNode),jn(n,we()),r!==null)for(h=n.onRecoverableError,l=0;l<r.length;l++)g=r[l],h(g.value,{componentStack:g.stack,digest:g.digest});if(Nl)throw Nl=!1,n=ph,ph=null,n;return(Fl&1)!==0&&n.tag!==0&&so(),S=n.pendingLanes,(S&1)!==0?n===mh?ma++:(ma=0,mh=n):ma=0,Lr(),null}function so(){if(Fr!==null){var n=bf(Fl),r=fi.transition,l=It;try{if(fi.transition=null,It=16>n?16:n,Fr===null)var h=!1;else{if(n=Fr,Fr=null,Fl=0,(wt&6)!==0)throw Error(t(331));var g=wt;for(wt|=4,Be=n.current;Be!==null;){var S=Be,R=S.child;if((Be.flags&16)!==0){var k=S.deletions;if(k!==null){for(var X=0;X<k.length;X++){var le=k[X];for(Be=le;Be!==null;){var xe=Be;switch(xe.tag){case 0:case 11:case 15:da(8,xe,S)}var Se=xe.child;if(Se!==null)Se.return=xe,Be=Se;else for(;Be!==null;){xe=Be;var ge=xe.sibling,Ue=xe.return;if(Am(xe),xe===le){Be=null;break}if(ge!==null){ge.return=Ue,Be=ge;break}Be=Ue}}}var Ve=S.alternate;if(Ve!==null){var Xe=Ve.child;if(Xe!==null){Ve.child=null;do{var Jt=Xe.sibling;Xe.sibling=null,Xe=Jt}while(Xe!==null)}}Be=S}}if((S.subtreeFlags&2064)!==0&&R!==null)R.return=S,Be=R;else e:for(;Be!==null;){if(S=Be,(S.flags&2048)!==0)switch(S.tag){case 0:case 11:case 15:da(9,S,S.return)}var ie=S.sibling;if(ie!==null){ie.return=S.return,Be=ie;break e}Be=S.return}}var $=n.current;for(Be=$;Be!==null;){R=Be;var oe=R.child;if((R.subtreeFlags&2064)!==0&&oe!==null)oe.return=R,Be=oe;else e:for(R=$;Be!==null;){if(k=Be,(k.flags&2048)!==0)try{switch(k.tag){case 0:case 11:case 15:Ll(9,k)}}catch(Ze){Zt(k,k.return,Ze)}if(k===R){Be=null;break e}var Te=k.sibling;if(Te!==null){Te.return=k.return,Be=Te;break e}Be=k.return}}if(wt=g,Lr(),xt&&typeof xt.onPostCommitFiberRoot=="function")try{xt.onPostCommitFiberRoot(bt,n)}catch{}h=!0}return h}finally{It=l,fi.transition=r}}return!1}function Vm(n,r,l){r=to(l,r),r=om(n,r,1),n=Dr(n,r,1),r=On(),n!==null&&(Hn(n,1,r),jn(n,r))}function Zt(n,r,l){if(n.tag===3)Vm(n,n,l);else for(;r!==null;){if(r.tag===3){Vm(r,n,l);break}else if(r.tag===1){var h=r.stateNode;if(typeof r.type.getDerivedStateFromError=="function"||typeof h.componentDidCatch=="function"&&(Ur===null||!Ur.has(h))){n=to(l,n),n=am(r,n,1),r=Dr(r,n,1),n=On(),r!==null&&(Hn(r,1,n),jn(r,n));break}}r=r.return}}function sy(n,r,l){var h=n.pingCache;h!==null&&h.delete(r),r=On(),n.pingedLanes|=n.suspendedLanes&l,mn===n&&(yn&l)===l&&(un===4||un===3&&(yn&130023424)===yn&&500>we()-fh?us(n,0):dh|=l),jn(n,r)}function Gm(n,r){r===0&&((n.mode&1)===0?r=1:(r=_i,_i<<=1,(_i&130023424)===0&&(_i=4194304)));var l=On();n=er(n,r),n!==null&&(Hn(n,r,l),jn(n,l))}function oy(n){var r=n.memoizedState,l=0;r!==null&&(l=r.retryLane),Gm(n,l)}function ay(n,r){var l=0;switch(n.tag){case 13:var h=n.stateNode,g=n.memoizedState;g!==null&&(l=g.retryLane);break;case 19:h=n.stateNode;break;default:throw Error(t(314))}h!==null&&h.delete(r),Gm(n,l)}var Wm;Wm=function(n,r,l){if(n!==null)if(n.memoizedProps!==r.pendingProps||Vn.current)Wn=!0;else{if((n.lanes&l)===0&&(r.flags&128)===0)return Wn=!1,Y_(n,r,l);Wn=(n.flags&131072)!==0}else Wn=!1,Xt&&(r.flags&1048576)!==0&&Ep(r,pl,r.index);switch(r.lanes=0,r.tag){case 2:var h=r.type;bl(n,r),n=r.pendingProps;var g=qs(r,wn.current);Js(r,l),g=Wu(null,r,h,n,g,l);var S=Xu();return r.flags|=1,typeof g=="object"&&g!==null&&typeof g.render=="function"&&g.$$typeof===void 0?(r.tag=1,r.memoizedState=null,r.updateQueue=null,Gn(h)?(S=!0,hl(r)):S=!1,r.memoizedState=g.state!==null&&g.state!==void 0?g.state:null,Ou(r),g.updater=Cl,r.stateNode=g,g._reactInternals=r,Ku(r,h,n,l),r=th(null,r,h,!0,S,l)):(r.tag=0,Xt&&S&&Cu(r),Fn(null,r,g,l),r=r.child),r;case 16:h=r.elementType;e:{switch(bl(n,r),n=r.pendingProps,g=h._init,h=g(h._payload),r.type=h,g=r.tag=cy(h),n=Si(h,n),g){case 0:r=eh(null,r,h,n,l);break e;case 1:r=gm(null,r,h,n,l);break e;case 11:r=hm(null,r,h,n,l);break e;case 14:r=dm(null,r,h,Si(h.type,n),l);break e}throw Error(t(306,h,""))}return r;case 0:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),eh(n,r,h,g,l);case 1:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),gm(n,r,h,g,l);case 3:e:{if(vm(r),n===null)throw Error(t(387));h=r.pendingProps,S=r.memoizedState,g=S.element,Ip(n,r),xl(r,h,null,l);var R=r.memoizedState;if(h=R.element,S.isDehydrated)if(S={element:h,isDehydrated:!1,cache:R.cache,pendingSuspenseBoundaries:R.pendingSuspenseBoundaries,transitions:R.transitions},r.updateQueue.baseState=S,r.memoizedState=S,r.flags&256){g=to(Error(t(423)),r),r=_m(n,r,h,l,g);break e}else if(h!==g){g=to(Error(t(424)),r),r=_m(n,r,h,l,g);break e}else for(ti=Rr(r.stateNode.containerInfo.firstChild),ei=r,Xt=!0,xi=null,l=Pp(r,null,h,l),r.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling;else{if(Zs(),h===g){r=nr(n,r,l);break e}Fn(n,r,h,l)}r=r.child}return r;case 5:return Up(r),n===null&&Pu(r),h=r.type,g=r.pendingProps,S=n!==null?n.memoizedProps:null,R=g.children,Su(h,g)?R=null:S!==null&&Su(h,S)&&(r.flags|=32),mm(n,r),Fn(n,r,R,l),r.child;case 6:return n===null&&Pu(r),null;case 13:return ym(n,r,l);case 4:return zu(r,r.stateNode.containerInfo),h=r.pendingProps,n===null?r.child=Ks(r,null,h,l):Fn(n,r,h,l),r.child;case 11:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),hm(n,r,h,g,l);case 7:return Fn(n,r,r.pendingProps,l),r.child;case 8:return Fn(n,r,r.pendingProps.children,l),r.child;case 12:return Fn(n,r,r.pendingProps.children,l),r.child;case 10:e:{if(h=r.type._context,g=r.pendingProps,S=r.memoizedProps,R=g.value,Bt(vl,h._currentValue),h._currentValue=R,S!==null)if(yi(S.value,R)){if(S.children===g.children&&!Vn.current){r=nr(n,r,l);break e}}else for(S=r.child,S!==null&&(S.return=r);S!==null;){var k=S.dependencies;if(k!==null){R=S.child;for(var X=k.firstContext;X!==null;){if(X.context===h){if(S.tag===1){X=tr(-1,l&-l),X.tag=2;var le=S.updateQueue;if(le!==null){le=le.shared;var xe=le.pending;xe===null?X.next=X:(X.next=xe.next,xe.next=X),le.pending=X}}S.lanes|=l,X=S.alternate,X!==null&&(X.lanes|=l),Uu(S.return,l,r),k.lanes|=l;break}X=X.next}}else if(S.tag===10)R=S.type===r.type?null:S.child;else if(S.tag===18){if(R=S.return,R===null)throw Error(t(341));R.lanes|=l,k=R.alternate,k!==null&&(k.lanes|=l),Uu(R,l,r),R=S.sibling}else R=S.child;if(R!==null)R.return=S;else for(R=S;R!==null;){if(R===r){R=null;break}if(S=R.sibling,S!==null){S.return=R.return,R=S;break}R=R.return}S=R}Fn(n,r,g.children,l),r=r.child}return r;case 9:return g=r.type,h=r.pendingProps.children,Js(r,l),g=hi(g),h=h(g),r.flags|=1,Fn(n,r,h,l),r.child;case 14:return h=r.type,g=Si(h,r.pendingProps),g=Si(h.type,g),dm(n,r,h,g,l);case 15:return fm(n,r,r.type,r.pendingProps,l);case 17:return h=r.type,g=r.pendingProps,g=r.elementType===h?g:Si(h,g),bl(n,r),r.tag=1,Gn(h)?(n=!0,hl(r)):n=!1,Js(r,l),rm(r,h,g),Ku(r,h,g,l),th(null,r,h,!0,n,l);case 19:return Sm(n,r,l);case 22:return pm(n,r,l)}throw Error(t(156,r.tag))};function Xm(n,r){return ce(n,r)}function ly(n,r,l,h){this.tag=n,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=r,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=h,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function pi(n,r,l,h){return new ly(n,r,l,h)}function Sh(n){return n=n.prototype,!(!n||!n.isReactComponent)}function cy(n){if(typeof n=="function")return Sh(n)?1:0;if(n!=null){if(n=n.$$typeof,n===K)return 11;if(n===q)return 14}return 2}function Br(n,r){var l=n.alternate;return l===null?(l=pi(n.tag,r,n.key,n.mode),l.elementType=n.elementType,l.type=n.type,l.stateNode=n.stateNode,l.alternate=n,n.alternate=l):(l.pendingProps=r,l.type=n.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=n.flags&14680064,l.childLanes=n.childLanes,l.lanes=n.lanes,l.child=n.child,l.memoizedProps=n.memoizedProps,l.memoizedState=n.memoizedState,l.updateQueue=n.updateQueue,r=n.dependencies,l.dependencies=r===null?null:{lanes:r.lanes,firstContext:r.firstContext},l.sibling=n.sibling,l.index=n.index,l.ref=n.ref,l}function kl(n,r,l,h,g,S){var R=2;if(h=n,typeof n=="function")Sh(n)&&(R=1);else if(typeof n=="string")R=5;else e:switch(n){case N:return ds(l.children,g,S,r);case O:R=8,g|=8;break;case b:return n=pi(12,l,r,g|2),n.elementType=b,n.lanes=S,n;case B:return n=pi(13,l,r,g),n.elementType=B,n.lanes=S,n;case j:return n=pi(19,l,r,g),n.elementType=j,n.lanes=S,n;case ne:return Hl(l,g,S,r);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case C:R=10;break e;case z:R=9;break e;case K:R=11;break e;case q:R=14;break e;case G:R=16,h=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return r=pi(R,l,r,g),r.elementType=n,r.type=h,r.lanes=S,r}function ds(n,r,l,h){return n=pi(7,n,h,r),n.lanes=l,n}function Hl(n,r,l,h){return n=pi(22,n,h,r),n.elementType=ne,n.lanes=l,n.stateNode={isHidden:!1},n}function Mh(n,r,l){return n=pi(6,n,null,r),n.lanes=l,n}function Eh(n,r,l){return r=pi(4,n.children!==null?n.children:[],n.key,r),r.lanes=l,r.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},r}function uy(n,r,l,h,g){this.tag=r,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=li(0),this.expirationTimes=li(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=li(0),this.identifierPrefix=h,this.onRecoverableError=g,this.mutableSourceEagerHydrationData=null}function wh(n,r,l,h,g,S,R,k,X){return n=new uy(n,r,l,k,X),r===1?(r=1,S===!0&&(r|=8)):r=0,S=pi(3,null,null,r),n.current=S,S.stateNode=n,S.memoizedState={element:h,isDehydrated:l,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ou(S),n}function hy(n,r,l){var h=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:D,key:h==null?null:""+h,children:n,containerInfo:r,implementation:l}}function jm(n){if(!n)return Pr;n=n._reactInternals;e:{if(Ni(n)!==n||n.tag!==1)throw Error(t(170));var r=n;do{switch(r.tag){case 3:r=r.stateNode.context;break e;case 1:if(Gn(r.type)){r=r.stateNode.__reactInternalMemoizedMergedChildContext;break e}}r=r.return}while(r!==null);throw Error(t(171))}if(n.tag===1){var l=n.type;if(Gn(l))return xp(n,l,r)}return r}function qm(n,r,l,h,g,S,R,k,X){return n=wh(l,h,!0,n,g,S,R,k,X),n.context=jm(null),l=n.current,h=On(),g=Or(l),S=tr(h,g),S.callback=r??null,Dr(l,S,g),n.current.lanes=g,Hn(n,g,h),jn(n,h),n}function Vl(n,r,l,h){var g=r.current,S=On(),R=Or(g);return l=jm(l),r.context===null?r.context=l:r.pendingContext=l,r=tr(S,R),r.payload={element:n},h=h===void 0?null:h,h!==null&&(r.callback=h),n=Dr(g,r,R),n!==null&&(wi(n,g,R,S),yl(n,g,R)),R}function Gl(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function Ym(n,r){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var l=n.retryLane;n.retryLane=l!==0&&l<r?l:r}}function Th(n,r){Ym(n,r),(n=n.alternate)&&Ym(n,r)}function dy(){return null}var $m=typeof reportError=="function"?reportError:function(n){console.error(n)};function Ah(n){this._internalRoot=n}Wl.prototype.render=Ah.prototype.render=function(n){var r=this._internalRoot;if(r===null)throw Error(t(409));Vl(n,r,null,null)},Wl.prototype.unmount=Ah.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var r=n.containerInfo;cs(function(){Vl(null,n,null,null)}),r[Zi]=null}};function Wl(n){this._internalRoot=n}Wl.prototype.unstable_scheduleHydration=function(n){if(n){var r=If();n={blockedOn:null,target:n,priority:r};for(var l=0;l<Tr.length&&r!==0&&r<Tr[l].priority;l++);Tr.splice(l,0,n),l===0&&Uf(n)}};function Ch(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Xl(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Zm(){}function fy(n,r,l,h,g){if(g){if(typeof h=="function"){var S=h;h=function(){var le=Gl(R);S.call(le)}}var R=qm(r,h,n,0,null,!1,!1,"",Zm);return n._reactRootContainer=R,n[Zi]=R.current,Jo(n.nodeType===8?n.parentNode:n),cs(),R}for(;g=n.lastChild;)n.removeChild(g);if(typeof h=="function"){var k=h;h=function(){var le=Gl(X);k.call(le)}}var X=wh(n,0,!1,null,null,!1,!1,"",Zm);return n._reactRootContainer=X,n[Zi]=X.current,Jo(n.nodeType===8?n.parentNode:n),cs(function(){Vl(r,X,l,h)}),X}function jl(n,r,l,h,g){var S=l._reactRootContainer;if(S){var R=S;if(typeof g=="function"){var k=g;g=function(){var X=Gl(R);k.call(X)}}Vl(r,R,n,g)}else R=fy(l,r,n,g,h);return Gl(R)}Pf=function(n){switch(n.tag){case 3:var r=n.stateNode;if(r.current.memoizedState.isDehydrated){var l=ln(r.pendingLanes);l!==0&&(Kc(r,l|1),jn(r,we()),(wt&6)===0&&(ro=we()+500,Lr()))}break;case 13:cs(function(){var h=er(n,1);if(h!==null){var g=On();wi(h,n,1,g)}}),Th(n,1)}},Qc=function(n){if(n.tag===13){var r=er(n,134217728);if(r!==null){var l=On();wi(r,n,134217728,l)}Th(n,134217728)}},Lf=function(n){if(n.tag===13){var r=Or(n),l=er(n,r);if(l!==null){var h=On();wi(l,n,r,h)}Th(n,r)}},If=function(){return It},Df=function(n,r){var l=It;try{return It=n,r()}finally{It=l}},Le=function(n,r,l){switch(r){case"input":if(mt(n,l),r=l.name,l.type==="radio"&&r!=null){for(l=n;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll("input[name="+JSON.stringify(""+r)+'][type="radio"]'),r=0;r<l.length;r++){var h=l[r];if(h!==n&&h.form===n.form){var g=cl(h);if(!g)throw Error(t(90));yt(h),mt(h,g)}}}break;case"textarea":me(n,l);break;case"select":r=l.value,r!=null&&F(n,!!l.multiple,r,!1)}},Ht=_h,an=cs;var py={usingClientEntryPoint:!1,Events:[na,Xs,cl,Ie,ut,_h]},ga={findFiberByHostInstance:ts,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},my={bundleType:ga.bundleType,version:ga.version,rendererPackageName:ga.rendererPackageName,rendererConfig:ga.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:T.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=I(n),n===null?null:n.stateNode},findFiberByHostInstance:ga.findFiberByHostInstance||dy,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var ql=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!ql.isDisabled&&ql.supportsFiber)try{bt=ql.inject(my),xt=ql}catch{}}return qn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=py,qn.createPortal=function(n,r){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Ch(r))throw Error(t(200));return hy(n,r,null,l)},qn.createRoot=function(n,r){if(!Ch(n))throw Error(t(299));var l=!1,h="",g=$m;return r!=null&&(r.unstable_strictMode===!0&&(l=!0),r.identifierPrefix!==void 0&&(h=r.identifierPrefix),r.onRecoverableError!==void 0&&(g=r.onRecoverableError)),r=wh(n,1,!1,null,null,l,!1,h,g),n[Zi]=r.current,Jo(n.nodeType===8?n.parentNode:n),new Ah(r)},qn.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var r=n._reactInternals;if(r===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=I(r),n=n===null?null:n.stateNode,n},qn.flushSync=function(n){return cs(n)},qn.hydrate=function(n,r,l){if(!Xl(r))throw Error(t(200));return jl(null,n,r,!0,l)},qn.hydrateRoot=function(n,r,l){if(!Ch(n))throw Error(t(405));var h=l!=null&&l.hydratedSources||null,g=!1,S="",R=$m;if(l!=null&&(l.unstable_strictMode===!0&&(g=!0),l.identifierPrefix!==void 0&&(S=l.identifierPrefix),l.onRecoverableError!==void 0&&(R=l.onRecoverableError)),r=qm(r,null,n,1,l??null,g,!1,S,R),n[Zi]=r.current,Jo(n),h)for(n=0;n<h.length;n++)l=h[n],g=l._getVersion,g=g(l._source),r.mutableSourceEagerHydrationData==null?r.mutableSourceEagerHydrationData=[l,g]:r.mutableSourceEagerHydrationData.push(l,g);return new Wl(r)},qn.render=function(n,r,l){if(!Xl(r))throw Error(t(200));return jl(null,n,r,!1,l)},qn.unmountComponentAtNode=function(n){if(!Xl(n))throw Error(t(40));return n._reactRootContainer?(cs(function(){jl(null,null,n,!1,function(){n._reactRootContainer=null,n[Zi]=null})}),!0):!1},qn.unstable_batchedUpdates=_h,qn.unstable_renderSubtreeIntoContainer=function(n,r,l,h){if(!Xl(l))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return jl(n,r,l,!1,h)},qn.version="18.3.1-next-f1338f8080-20240426",qn}var rg;function Ty(){if(rg)return Ph.exports;rg=1;function a(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a)}catch(e){console.error(e)}}return a(),Ph.exports=wy(),Ph.exports}var sg;function Ay(){if(sg)return Yl;sg=1;var a=Ty();return Yl.createRoot=a.createRoot,Yl.hydrateRoot=a.hydrateRoot,Yl}var Cy=Ay();const Ry=qv(Cy),by=[{id:"primitive-box",label:"Block",description:"Scaled cube primitive",kind:"primitive",primitive:"box"},{id:"primitive-sphere",label:"Ball",description:"Sphere primitive",kind:"primitive",primitive:"sphere"},{id:"primitive-cylinder",label:"Cylinder",description:"Rounded column primitive",kind:"primitive",primitive:"cylinder"},{id:"primitive-plane",label:"Plate",description:"Flat staging plane",kind:"primitive",primitive:"plane"},{id:"texture-grid",label:"Checker",description:"Procedural-friendly placeholder texture",kind:"texture",url:"/assets/textures/placeholder-checker.svg"}];/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const hf="170",Py=0,og=1,Ly=2,Yv=1,Iy=2,fr=3,Qr=0,Kn=1,Xi=2,Zr=0,Ao=1,ag=2,lg=3,cg=4,Dy=5,As=100,Ny=101,Uy=102,Fy=103,Oy=104,zy=200,By=201,ky=202,Hy=203,yd=204,xd=205,Vy=206,Gy=207,Wy=208,Xy=209,jy=210,qy=211,Yy=212,$y=213,Zy=214,Sd=0,Md=1,Ed=2,bo=3,wd=4,Td=5,Ad=6,Cd=7,$v=0,Ky=1,Qy=2,Kr=0,Jy=1,ex=2,tx=3,nx=4,ix=5,rx=6,sx=7,Zv=300,Po=301,Lo=302,Rd=303,bd=304,Vc=306,Is=1e3,Ps=1001,Pd=1002,Ii=1003,ox=1004,$l=1005,ji=1006,Dh=1007,Ls=1008,yr=1009,Kv=1010,Qv=1011,Fa=1012,df=1013,Ds=1014,gr=1015,Ba=1016,ff=1017,pf=1018,Io=1020,Jv=35902,e0=1021,t0=1022,Pi=1023,n0=1024,i0=1025,Co=1026,Do=1027,r0=1028,mf=1029,s0=1030,gf=1031,vf=1033,Rc=33776,bc=33777,Pc=33778,Lc=33779,Ld=35840,Id=35841,Dd=35842,Nd=35843,Ud=36196,Fd=37492,Od=37496,zd=37808,Bd=37809,kd=37810,Hd=37811,Vd=37812,Gd=37813,Wd=37814,Xd=37815,jd=37816,qd=37817,Yd=37818,$d=37819,Zd=37820,Kd=37821,Ic=36492,Qd=36494,Jd=36495,o0=36283,ef=36284,tf=36285,nf=36286,ax=3200,lx=3201,a0=0,cx=1,$r="",Bn="srgb",Uo="srgb-linear",Gc="linear",Nt="srgb",oo=7680,ug=519,ux=512,hx=513,dx=514,l0=515,fx=516,px=517,mx=518,gx=519,hg=35044,dg="300 es",vr=2e3,Oc=2001;class Us{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const o=s.indexOf(t);o!==-1&&s.splice(o,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let o=0,c=s.length;o<c;o++)s[o].call(this,e);e.target=null}}}const Rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Nh=Math.PI/180,rf=180/Math.PI;function ka(){const a=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Rn[a&255]+Rn[a>>8&255]+Rn[a>>16&255]+Rn[a>>24&255]+"-"+Rn[e&255]+Rn[e>>8&255]+"-"+Rn[e>>16&15|64]+Rn[e>>24&255]+"-"+Rn[t&63|128]+Rn[t>>8&255]+"-"+Rn[t>>16&255]+Rn[t>>24&255]+Rn[i&255]+Rn[i>>8&255]+Rn[i>>16&255]+Rn[i>>24&255]).toLowerCase()}function Zn(a,e,t){return Math.max(e,Math.min(t,a))}function vx(a,e){return(a%e+e)%e}function Uh(a,e,t){return(1-t)*a+t*e}function _a(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return a/4294967295;case Uint16Array:return a/65535;case Uint8Array:return a/255;case Int32Array:return Math.max(a/2147483647,-1);case Int16Array:return Math.max(a/32767,-1);case Int8Array:return Math.max(a/127,-1);default:throw new Error("Invalid component type.")}}function Yn(a,e){switch(e.constructor){case Float32Array:return a;case Uint32Array:return Math.round(a*4294967295);case Uint16Array:return Math.round(a*65535);case Uint8Array:return Math.round(a*255);case Int32Array:return Math.round(a*2147483647);case Int16Array:return Math.round(a*32767);case Int8Array:return Math.round(a*127);default:throw new Error("Invalid component type.")}}class Mt{constructor(e=0,t=0){Mt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Zn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),o=this.x-e.x,c=this.y-e.y;return this.x=o*i-c*s+e.x,this.y=o*s+c*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class dt{constructor(e,t,i,s,o,c,u,d,f){dt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,o,c,u,d,f)}set(e,t,i,s,o,c,u,d,f){const m=this.elements;return m[0]=e,m[1]=s,m[2]=u,m[3]=t,m[4]=o,m[5]=d,m[6]=i,m[7]=c,m[8]=f,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,o=this.elements,c=i[0],u=i[3],d=i[6],f=i[1],m=i[4],v=i[7],p=i[2],y=i[5],M=i[8],E=s[0],x=s[3],_=s[6],w=s[1],A=s[4],T=s[7],U=s[2],D=s[5],N=s[8];return o[0]=c*E+u*w+d*U,o[3]=c*x+u*A+d*D,o[6]=c*_+u*T+d*N,o[1]=f*E+m*w+v*U,o[4]=f*x+m*A+v*D,o[7]=f*_+m*T+v*N,o[2]=p*E+y*w+M*U,o[5]=p*x+y*A+M*D,o[8]=p*_+y*T+M*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],m=e[8];return t*c*m-t*u*f-i*o*m+i*u*d+s*o*f-s*c*d}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],m=e[8],v=m*c-u*f,p=u*d-m*o,y=f*o-c*d,M=t*v+i*p+s*y;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/M;return e[0]=v*E,e[1]=(s*f-m*i)*E,e[2]=(u*i-s*c)*E,e[3]=p*E,e[4]=(m*t-s*d)*E,e[5]=(s*o-u*t)*E,e[6]=y*E,e[7]=(i*d-f*t)*E,e[8]=(c*t-i*o)*E,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,o,c,u){const d=Math.cos(o),f=Math.sin(o);return this.set(i*d,i*f,-i*(d*c+f*u)+c+e,-s*f,s*d,-s*(-f*c+d*u)+u+t,0,0,1),this}scale(e,t){return this.premultiply(Fh.makeScale(e,t)),this}rotate(e){return this.premultiply(Fh.makeRotation(-e)),this}translate(e,t){return this.premultiply(Fh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Fh=new dt;function c0(a){for(let e=a.length-1;e>=0;--e)if(a[e]>=65535)return!0;return!1}function Oa(a){return document.createElementNS("http://www.w3.org/1999/xhtml",a)}function _x(){const a=Oa("canvas");return a.style.display="block",a}const fg={};function La(a){a in fg||(fg[a]=!0,console.warn(a))}function yx(a,e,t){return new Promise(function(i,s){function o(){switch(a.clientWaitSync(e,a.SYNC_FLUSH_COMMANDS_BIT,0)){case a.WAIT_FAILED:s();break;case a.TIMEOUT_EXPIRED:setTimeout(o,t);break;default:i()}}setTimeout(o,t)})}function xx(a){const e=a.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Sx(a){const e=a.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const At={enabled:!0,workingColorSpace:Uo,spaces:{},convert:function(a,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Nt&&(a.r=_r(a.r),a.g=_r(a.g),a.b=_r(a.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(a.applyMatrix3(this.spaces[e].toXYZ),a.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Nt&&(a.r=Ro(a.r),a.g=Ro(a.g),a.b=Ro(a.b))),a},fromWorkingColorSpace:function(a,e){return this.convert(a,this.workingColorSpace,e)},toWorkingColorSpace:function(a,e){return this.convert(a,e,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===$r?Gc:this.spaces[a].transfer},getLuminanceCoefficients:function(a,e=this.workingColorSpace){return a.fromArray(this.spaces[e].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,e,t){return a.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace}};function _r(a){return a<.04045?a*.0773993808:Math.pow(a*.9478672986+.0521327014,2.4)}function Ro(a){return a<.0031308?a*12.92:1.055*Math.pow(a,.41666)-.055}const pg=[.64,.33,.3,.6,.15,.06],mg=[.2126,.7152,.0722],gg=[.3127,.329],vg=new dt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_g=new dt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);At.define({[Uo]:{primaries:pg,whitePoint:gg,transfer:Gc,toXYZ:vg,fromXYZ:_g,luminanceCoefficients:mg,workingColorSpaceConfig:{unpackColorSpace:Bn},outputColorSpaceConfig:{drawingBufferColorSpace:Bn}},[Bn]:{primaries:pg,whitePoint:gg,transfer:Nt,toXYZ:vg,fromXYZ:_g,luminanceCoefficients:mg,outputColorSpaceConfig:{drawingBufferColorSpace:Bn}}});let ao;class Mx{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ao===void 0&&(ao=Oa("canvas")),ao.width=e.width,ao.height=e.height;const i=ao.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=ao}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Oa("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),o=s.data;for(let c=0;c<o.length;c++)o[c]=_r(o[c]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(_r(t[i]/255)*255):t[i]=_r(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Ex=0;class u0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ex++}),this.uuid=ka(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let o;if(Array.isArray(s)){o=[];for(let c=0,u=s.length;c<u;c++)s[c].isDataTexture?o.push(Oh(s[c].image)):o.push(Oh(s[c]))}else o=Oh(s);i.url=o}return t||(e.images[this.uuid]=i),i}}function Oh(a){return typeof HTMLImageElement<"u"&&a instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&a instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&a instanceof ImageBitmap?Mx.getDataURL(a):a.data?{data:Array.from(a.data),width:a.width,height:a.height,type:a.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let wx=0;class In extends Us{constructor(e=In.DEFAULT_IMAGE,t=In.DEFAULT_MAPPING,i=Ps,s=Ps,o=ji,c=Ls,u=Pi,d=yr,f=In.DEFAULT_ANISOTROPY,m=$r){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:wx++}),this.uuid=ka(),this.name="",this.source=new u0(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=o,this.minFilter=c,this.anisotropy=f,this.format=u,this.internalFormat=null,this.type=d,this.offset=new Mt(0,0),this.repeat=new Mt(1,1),this.center=new Mt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new dt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Is:e.x=e.x-Math.floor(e.x);break;case Ps:e.x=e.x<0?0:1;break;case Pd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Is:e.y=e.y-Math.floor(e.y);break;case Ps:e.y=e.y<0?0:1;break;case Pd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}In.DEFAULT_IMAGE=null;In.DEFAULT_MAPPING=Zv;In.DEFAULT_ANISOTROPY=1;class Qt{constructor(e=0,t=0,i=0,s=1){Qt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,o=this.w,c=e.elements;return this.x=c[0]*t+c[4]*i+c[8]*s+c[12]*o,this.y=c[1]*t+c[5]*i+c[9]*s+c[13]*o,this.z=c[2]*t+c[6]*i+c[10]*s+c[14]*o,this.w=c[3]*t+c[7]*i+c[11]*s+c[15]*o,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,o;const d=e.elements,f=d[0],m=d[4],v=d[8],p=d[1],y=d[5],M=d[9],E=d[2],x=d[6],_=d[10];if(Math.abs(m-p)<.01&&Math.abs(v-E)<.01&&Math.abs(M-x)<.01){if(Math.abs(m+p)<.1&&Math.abs(v+E)<.1&&Math.abs(M+x)<.1&&Math.abs(f+y+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(f+1)/2,T=(y+1)/2,U=(_+1)/2,D=(m+p)/4,N=(v+E)/4,O=(M+x)/4;return A>T&&A>U?A<.01?(i=0,s=.707106781,o=.707106781):(i=Math.sqrt(A),s=D/i,o=N/i):T>U?T<.01?(i=.707106781,s=0,o=.707106781):(s=Math.sqrt(T),i=D/s,o=O/s):U<.01?(i=.707106781,s=.707106781,o=0):(o=Math.sqrt(U),i=N/o,s=O/o),this.set(i,s,o,t),this}let w=Math.sqrt((x-M)*(x-M)+(v-E)*(v-E)+(p-m)*(p-m));return Math.abs(w)<.001&&(w=1),this.x=(x-M)/w,this.y=(v-E)/w,this.z=(p-m)/w,this.w=Math.acos((f+y+_-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Tx extends Us{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Qt(0,0,e,t),this.scissorTest=!1,this.viewport=new Qt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ji,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const o=new In(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);o.flipY=!1,o.generateMipmaps=i.generateMipmaps,o.internalFormat=i.internalFormat,this.textures=[];const c=i.count;for(let u=0;u<c;u++)this.textures[u]=o.clone(),this.textures[u].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,o=this.textures.length;s<o;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new u0(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ns extends Tx{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class h0 extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ii,this.minFilter=Ii,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ax extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Ii,this.minFilter=Ii,this.wrapR=Ps,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}let Ln=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,o,c,u){let d=i[s+0],f=i[s+1],m=i[s+2],v=i[s+3];const p=o[c+0],y=o[c+1],M=o[c+2],E=o[c+3];if(u===0){e[t+0]=d,e[t+1]=f,e[t+2]=m,e[t+3]=v;return}if(u===1){e[t+0]=p,e[t+1]=y,e[t+2]=M,e[t+3]=E;return}if(v!==E||d!==p||f!==y||m!==M){let x=1-u;const _=d*p+f*y+m*M+v*E,w=_>=0?1:-1,A=1-_*_;if(A>Number.EPSILON){const U=Math.sqrt(A),D=Math.atan2(U,_*w);x=Math.sin(x*D)/U,u=Math.sin(u*D)/U}const T=u*w;if(d=d*x+p*T,f=f*x+y*T,m=m*x+M*T,v=v*x+E*T,x===1-u){const U=1/Math.sqrt(d*d+f*f+m*m+v*v);d*=U,f*=U,m*=U,v*=U}}e[t]=d,e[t+1]=f,e[t+2]=m,e[t+3]=v}static multiplyQuaternionsFlat(e,t,i,s,o,c){const u=i[s],d=i[s+1],f=i[s+2],m=i[s+3],v=o[c],p=o[c+1],y=o[c+2],M=o[c+3];return e[t]=u*M+m*v+d*y-f*p,e[t+1]=d*M+m*p+f*v-u*y,e[t+2]=f*M+m*y+u*p-d*v,e[t+3]=m*M-u*v-d*p-f*y,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,o=e._z,c=e._order,u=Math.cos,d=Math.sin,f=u(i/2),m=u(s/2),v=u(o/2),p=d(i/2),y=d(s/2),M=d(o/2);switch(c){case"XYZ":this._x=p*m*v+f*y*M,this._y=f*y*v-p*m*M,this._z=f*m*M+p*y*v,this._w=f*m*v-p*y*M;break;case"YXZ":this._x=p*m*v+f*y*M,this._y=f*y*v-p*m*M,this._z=f*m*M-p*y*v,this._w=f*m*v+p*y*M;break;case"ZXY":this._x=p*m*v-f*y*M,this._y=f*y*v+p*m*M,this._z=f*m*M+p*y*v,this._w=f*m*v-p*y*M;break;case"ZYX":this._x=p*m*v-f*y*M,this._y=f*y*v+p*m*M,this._z=f*m*M-p*y*v,this._w=f*m*v+p*y*M;break;case"YZX":this._x=p*m*v+f*y*M,this._y=f*y*v+p*m*M,this._z=f*m*M-p*y*v,this._w=f*m*v-p*y*M;break;case"XZY":this._x=p*m*v-f*y*M,this._y=f*y*v-p*m*M,this._z=f*m*M+p*y*v,this._w=f*m*v+p*y*M;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+c)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],o=t[8],c=t[1],u=t[5],d=t[9],f=t[2],m=t[6],v=t[10],p=i+u+v;if(p>0){const y=.5/Math.sqrt(p+1);this._w=.25/y,this._x=(m-d)*y,this._y=(o-f)*y,this._z=(c-s)*y}else if(i>u&&i>v){const y=2*Math.sqrt(1+i-u-v);this._w=(m-d)/y,this._x=.25*y,this._y=(s+c)/y,this._z=(o+f)/y}else if(u>v){const y=2*Math.sqrt(1+u-i-v);this._w=(o-f)/y,this._x=(s+c)/y,this._y=.25*y,this._z=(d+m)/y}else{const y=2*Math.sqrt(1+v-i-u);this._w=(c-s)/y,this._x=(o+f)/y,this._y=(d+m)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Zn(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,o=e._z,c=e._w,u=t._x,d=t._y,f=t._z,m=t._w;return this._x=i*m+c*u+s*f-o*d,this._y=s*m+c*d+o*u-i*f,this._z=o*m+c*f+i*d-s*u,this._w=c*m-i*u-s*d-o*f,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,o=this._z,c=this._w;let u=c*e._w+i*e._x+s*e._y+o*e._z;if(u<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,u=-u):this.copy(e),u>=1)return this._w=c,this._x=i,this._y=s,this._z=o,this;const d=1-u*u;if(d<=Number.EPSILON){const y=1-t;return this._w=y*c+t*this._w,this._x=y*i+t*this._x,this._y=y*s+t*this._y,this._z=y*o+t*this._z,this.normalize(),this}const f=Math.sqrt(d),m=Math.atan2(f,u),v=Math.sin((1-t)*m)/f,p=Math.sin(t*m)/f;return this._w=c*v+this._w*p,this._x=i*v+this._x*p,this._y=s*v+this._y*p,this._z=o*v+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),o=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),o*Math.sin(t),o*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}};class Y{constructor(e=0,t=0,i=0){Y.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yg.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yg.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*s,this.y=o[1]*t+o[4]*i+o[7]*s,this.z=o[2]*t+o[5]*i+o[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,o=e.elements,c=1/(o[3]*t+o[7]*i+o[11]*s+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*s+o[12])*c,this.y=(o[1]*t+o[5]*i+o[9]*s+o[13])*c,this.z=(o[2]*t+o[6]*i+o[10]*s+o[14])*c,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z,d=e.w,f=2*(c*s-u*i),m=2*(u*t-o*s),v=2*(o*i-c*t);return this.x=t+d*f+c*v-u*m,this.y=i+d*m+u*f-o*v,this.z=s+d*v+o*m-c*f,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s,this.y=o[1]*t+o[5]*i+o[9]*s,this.z=o[2]*t+o[6]*i+o[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,o=e.z,c=t.x,u=t.y,d=t.z;return this.x=s*d-o*u,this.y=o*c-i*d,this.z=i*u-s*c,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return zh.copy(this).projectOnVector(e),this.sub(zh)}reflect(e){return this.sub(zh.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Zn(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const zh=new Y,yg=new Ln;class Fo{constructor(e=new Y(1/0,1/0,1/0),t=new Y(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Ti.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Ti.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Ti.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let c=0,u=o.count;c<u;c++)e.isMesh===!0?e.getVertexPosition(c,Ti):Ti.fromBufferAttribute(o,c),Ti.applyMatrix4(e.matrixWorld),this.expandByPoint(Ti);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Zl.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Zl.copy(i.boundingBox)),Zl.applyMatrix4(e.matrixWorld),this.union(Zl)}const s=e.children;for(let o=0,c=s.length;o<c;o++)this.expandByObject(s[o],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ti),Ti.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ya),Kl.subVectors(this.max,ya),lo.subVectors(e.a,ya),co.subVectors(e.b,ya),uo.subVectors(e.c,ya),Hr.subVectors(co,lo),Vr.subVectors(uo,co),fs.subVectors(lo,uo);let t=[0,-Hr.z,Hr.y,0,-Vr.z,Vr.y,0,-fs.z,fs.y,Hr.z,0,-Hr.x,Vr.z,0,-Vr.x,fs.z,0,-fs.x,-Hr.y,Hr.x,0,-Vr.y,Vr.x,0,-fs.y,fs.x,0];return!Bh(t,lo,co,uo,Kl)||(t=[1,0,0,0,1,0,0,0,1],!Bh(t,lo,co,uo,Kl))?!1:(Ql.crossVectors(Hr,Vr),t=[Ql.x,Ql.y,Ql.z],Bh(t,lo,co,uo,Kl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ti).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ti).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(rr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),rr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),rr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),rr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),rr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),rr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),rr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),rr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(rr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const rr=[new Y,new Y,new Y,new Y,new Y,new Y,new Y,new Y],Ti=new Y,Zl=new Fo,lo=new Y,co=new Y,uo=new Y,Hr=new Y,Vr=new Y,fs=new Y,ya=new Y,Kl=new Y,Ql=new Y,ps=new Y;function Bh(a,e,t,i,s){for(let o=0,c=a.length-3;o<=c;o+=3){ps.fromArray(a,o);const u=s.x*Math.abs(ps.x)+s.y*Math.abs(ps.y)+s.z*Math.abs(ps.z),d=e.dot(ps),f=t.dot(ps),m=i.dot(ps);if(Math.max(-Math.max(d,f,m),Math.min(d,f,m))>u)return!1}return!0}const Cx=new Fo,xa=new Y,kh=new Y;class Wc{constructor(e=new Y,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Cx.setFromPoints(e).getCenter(i);let s=0;for(let o=0,c=e.length;o<c;o++)s=Math.max(s,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;xa.subVectors(e,this.center);const t=xa.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(xa,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(kh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(xa.copy(e.center).add(kh)),this.expandByPoint(xa.copy(e.center).sub(kh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const sr=new Y,Hh=new Y,Jl=new Y,Gr=new Y,Vh=new Y,ec=new Y,Gh=new Y;let _f=class{constructor(e=new Y,t=new Y(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,sr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=sr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(sr.copy(this.origin).addScaledVector(this.direction,t),sr.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Hh.copy(e).add(t).multiplyScalar(.5),Jl.copy(t).sub(e).normalize(),Gr.copy(this.origin).sub(Hh);const o=e.distanceTo(t)*.5,c=-this.direction.dot(Jl),u=Gr.dot(this.direction),d=-Gr.dot(Jl),f=Gr.lengthSq(),m=Math.abs(1-c*c);let v,p,y,M;if(m>0)if(v=c*d-u,p=c*u-d,M=o*m,v>=0)if(p>=-M)if(p<=M){const E=1/m;v*=E,p*=E,y=v*(v+c*p+2*u)+p*(c*v+p+2*d)+f}else p=o,v=Math.max(0,-(c*p+u)),y=-v*v+p*(p+2*d)+f;else p=-o,v=Math.max(0,-(c*p+u)),y=-v*v+p*(p+2*d)+f;else p<=-M?(v=Math.max(0,-(-c*o+u)),p=v>0?-o:Math.min(Math.max(-o,-d),o),y=-v*v+p*(p+2*d)+f):p<=M?(v=0,p=Math.min(Math.max(-o,-d),o),y=p*(p+2*d)+f):(v=Math.max(0,-(c*o+u)),p=v>0?o:Math.min(Math.max(-o,-d),o),y=-v*v+p*(p+2*d)+f);else p=c>0?-o:o,v=Math.max(0,-(c*p+u)),y=-v*v+p*(p+2*d)+f;return i&&i.copy(this.origin).addScaledVector(this.direction,v),s&&s.copy(Hh).addScaledVector(Jl,p),y}intersectSphere(e,t){sr.subVectors(e.center,this.origin);const i=sr.dot(this.direction),s=sr.dot(sr)-i*i,o=e.radius*e.radius;if(s>o)return null;const c=Math.sqrt(o-s),u=i-c,d=i+c;return d<0?null:u<0?this.at(d,t):this.at(u,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,o,c,u,d;const f=1/this.direction.x,m=1/this.direction.y,v=1/this.direction.z,p=this.origin;return f>=0?(i=(e.min.x-p.x)*f,s=(e.max.x-p.x)*f):(i=(e.max.x-p.x)*f,s=(e.min.x-p.x)*f),m>=0?(o=(e.min.y-p.y)*m,c=(e.max.y-p.y)*m):(o=(e.max.y-p.y)*m,c=(e.min.y-p.y)*m),i>c||o>s||((o>i||isNaN(i))&&(i=o),(c<s||isNaN(s))&&(s=c),v>=0?(u=(e.min.z-p.z)*v,d=(e.max.z-p.z)*v):(u=(e.max.z-p.z)*v,d=(e.min.z-p.z)*v),i>d||u>s)||((u>i||i!==i)&&(i=u),(d<s||s!==s)&&(s=d),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,sr)!==null}intersectTriangle(e,t,i,s,o){Vh.subVectors(t,e),ec.subVectors(i,e),Gh.crossVectors(Vh,ec);let c=this.direction.dot(Gh),u;if(c>0){if(s)return null;u=1}else if(c<0)u=-1,c=-c;else return null;Gr.subVectors(this.origin,e);const d=u*this.direction.dot(ec.crossVectors(Gr,ec));if(d<0)return null;const f=u*this.direction.dot(Vh.cross(Gr));if(f<0||d+f>c)return null;const m=-u*Gr.dot(Gh);return m<0?null:this.at(m/c,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};class kt{constructor(e,t,i,s,o,c,u,d,f,m,v,p,y,M,E,x){kt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,o,c,u,d,f,m,v,p,y,M,E,x)}set(e,t,i,s,o,c,u,d,f,m,v,p,y,M,E,x){const _=this.elements;return _[0]=e,_[4]=t,_[8]=i,_[12]=s,_[1]=o,_[5]=c,_[9]=u,_[13]=d,_[2]=f,_[6]=m,_[10]=v,_[14]=p,_[3]=y,_[7]=M,_[11]=E,_[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new kt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/ho.setFromMatrixColumn(e,0).length(),o=1/ho.setFromMatrixColumn(e,1).length(),c=1/ho.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*c,t[9]=i[9]*c,t[10]=i[10]*c,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,o=e.z,c=Math.cos(i),u=Math.sin(i),d=Math.cos(s),f=Math.sin(s),m=Math.cos(o),v=Math.sin(o);if(e.order==="XYZ"){const p=c*m,y=c*v,M=u*m,E=u*v;t[0]=d*m,t[4]=-d*v,t[8]=f,t[1]=y+M*f,t[5]=p-E*f,t[9]=-u*d,t[2]=E-p*f,t[6]=M+y*f,t[10]=c*d}else if(e.order==="YXZ"){const p=d*m,y=d*v,M=f*m,E=f*v;t[0]=p+E*u,t[4]=M*u-y,t[8]=c*f,t[1]=c*v,t[5]=c*m,t[9]=-u,t[2]=y*u-M,t[6]=E+p*u,t[10]=c*d}else if(e.order==="ZXY"){const p=d*m,y=d*v,M=f*m,E=f*v;t[0]=p-E*u,t[4]=-c*v,t[8]=M+y*u,t[1]=y+M*u,t[5]=c*m,t[9]=E-p*u,t[2]=-c*f,t[6]=u,t[10]=c*d}else if(e.order==="ZYX"){const p=c*m,y=c*v,M=u*m,E=u*v;t[0]=d*m,t[4]=M*f-y,t[8]=p*f+E,t[1]=d*v,t[5]=E*f+p,t[9]=y*f-M,t[2]=-f,t[6]=u*d,t[10]=c*d}else if(e.order==="YZX"){const p=c*d,y=c*f,M=u*d,E=u*f;t[0]=d*m,t[4]=E-p*v,t[8]=M*v+y,t[1]=v,t[5]=c*m,t[9]=-u*m,t[2]=-f*m,t[6]=y*v+M,t[10]=p-E*v}else if(e.order==="XZY"){const p=c*d,y=c*f,M=u*d,E=u*f;t[0]=d*m,t[4]=-v,t[8]=f*m,t[1]=p*v+E,t[5]=c*m,t[9]=y*v-M,t[2]=M*v-y,t[6]=u*m,t[10]=E*v+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Rx,e,bx)}lookAt(e,t,i){const s=this.elements;return ii.subVectors(e,t),ii.lengthSq()===0&&(ii.z=1),ii.normalize(),Wr.crossVectors(i,ii),Wr.lengthSq()===0&&(Math.abs(i.z)===1?ii.x+=1e-4:ii.z+=1e-4,ii.normalize(),Wr.crossVectors(i,ii)),Wr.normalize(),tc.crossVectors(ii,Wr),s[0]=Wr.x,s[4]=tc.x,s[8]=ii.x,s[1]=Wr.y,s[5]=tc.y,s[9]=ii.y,s[2]=Wr.z,s[6]=tc.z,s[10]=ii.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,o=this.elements,c=i[0],u=i[4],d=i[8],f=i[12],m=i[1],v=i[5],p=i[9],y=i[13],M=i[2],E=i[6],x=i[10],_=i[14],w=i[3],A=i[7],T=i[11],U=i[15],D=s[0],N=s[4],O=s[8],b=s[12],C=s[1],z=s[5],K=s[9],B=s[13],j=s[2],q=s[6],G=s[10],ne=s[14],H=s[3],W=s[7],se=s[11],V=s[15];return o[0]=c*D+u*C+d*j+f*H,o[4]=c*N+u*z+d*q+f*W,o[8]=c*O+u*K+d*G+f*se,o[12]=c*b+u*B+d*ne+f*V,o[1]=m*D+v*C+p*j+y*H,o[5]=m*N+v*z+p*q+y*W,o[9]=m*O+v*K+p*G+y*se,o[13]=m*b+v*B+p*ne+y*V,o[2]=M*D+E*C+x*j+_*H,o[6]=M*N+E*z+x*q+_*W,o[10]=M*O+E*K+x*G+_*se,o[14]=M*b+E*B+x*ne+_*V,o[3]=w*D+A*C+T*j+U*H,o[7]=w*N+A*z+T*q+U*W,o[11]=w*O+A*K+T*G+U*se,o[15]=w*b+A*B+T*ne+U*V,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],o=e[12],c=e[1],u=e[5],d=e[9],f=e[13],m=e[2],v=e[6],p=e[10],y=e[14],M=e[3],E=e[7],x=e[11],_=e[15];return M*(+o*d*v-s*f*v-o*u*p+i*f*p+s*u*y-i*d*y)+E*(+t*d*y-t*f*p+o*c*p-s*c*y+s*f*m-o*d*m)+x*(+t*f*v-t*u*y-o*c*v+i*c*y+o*u*m-i*f*m)+_*(-s*u*m-t*d*v+t*u*p+s*c*v-i*c*p+i*d*m)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],o=e[3],c=e[4],u=e[5],d=e[6],f=e[7],m=e[8],v=e[9],p=e[10],y=e[11],M=e[12],E=e[13],x=e[14],_=e[15],w=v*x*f-E*p*f+E*d*y-u*x*y-v*d*_+u*p*_,A=M*p*f-m*x*f-M*d*y+c*x*y+m*d*_-c*p*_,T=m*E*f-M*v*f+M*u*y-c*E*y-m*u*_+c*v*_,U=M*v*d-m*E*d-M*u*p+c*E*p+m*u*x-c*v*x,D=t*w+i*A+s*T+o*U;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const N=1/D;return e[0]=w*N,e[1]=(E*p*o-v*x*o-E*s*y+i*x*y+v*s*_-i*p*_)*N,e[2]=(u*x*o-E*d*o+E*s*f-i*x*f-u*s*_+i*d*_)*N,e[3]=(v*d*o-u*p*o-v*s*f+i*p*f+u*s*y-i*d*y)*N,e[4]=A*N,e[5]=(m*x*o-M*p*o+M*s*y-t*x*y-m*s*_+t*p*_)*N,e[6]=(M*d*o-c*x*o-M*s*f+t*x*f+c*s*_-t*d*_)*N,e[7]=(c*p*o-m*d*o+m*s*f-t*p*f-c*s*y+t*d*y)*N,e[8]=T*N,e[9]=(M*v*o-m*E*o-M*i*y+t*E*y+m*i*_-t*v*_)*N,e[10]=(c*E*o-M*u*o+M*i*f-t*E*f-c*i*_+t*u*_)*N,e[11]=(m*u*o-c*v*o-m*i*f+t*v*f+c*i*y-t*u*y)*N,e[12]=U*N,e[13]=(m*E*s-M*v*s+M*i*p-t*E*p-m*i*x+t*v*x)*N,e[14]=(M*u*s-c*E*s-M*i*d+t*E*d+c*i*x-t*u*x)*N,e[15]=(c*v*s-m*u*s+m*i*d-t*v*d-c*i*p+t*u*p)*N,this}scale(e){const t=this.elements,i=e.x,s=e.y,o=e.z;return t[0]*=i,t[4]*=s,t[8]*=o,t[1]*=i,t[5]*=s,t[9]*=o,t[2]*=i,t[6]*=s,t[10]*=o,t[3]*=i,t[7]*=s,t[11]*=o,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),o=1-i,c=e.x,u=e.y,d=e.z,f=o*c,m=o*u;return this.set(f*c+i,f*u-s*d,f*d+s*u,0,f*u+s*d,m*u+i,m*d-s*c,0,f*d-s*u,m*d+s*c,o*d*d+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,o,c){return this.set(1,i,o,0,e,1,c,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,o=t._x,c=t._y,u=t._z,d=t._w,f=o+o,m=c+c,v=u+u,p=o*f,y=o*m,M=o*v,E=c*m,x=c*v,_=u*v,w=d*f,A=d*m,T=d*v,U=i.x,D=i.y,N=i.z;return s[0]=(1-(E+_))*U,s[1]=(y+T)*U,s[2]=(M-A)*U,s[3]=0,s[4]=(y-T)*D,s[5]=(1-(p+_))*D,s[6]=(x+w)*D,s[7]=0,s[8]=(M+A)*N,s[9]=(x-w)*N,s[10]=(1-(p+E))*N,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let o=ho.set(s[0],s[1],s[2]).length();const c=ho.set(s[4],s[5],s[6]).length(),u=ho.set(s[8],s[9],s[10]).length();this.determinant()<0&&(o=-o),e.x=s[12],e.y=s[13],e.z=s[14],Ai.copy(this);const f=1/o,m=1/c,v=1/u;return Ai.elements[0]*=f,Ai.elements[1]*=f,Ai.elements[2]*=f,Ai.elements[4]*=m,Ai.elements[5]*=m,Ai.elements[6]*=m,Ai.elements[8]*=v,Ai.elements[9]*=v,Ai.elements[10]*=v,t.setFromRotationMatrix(Ai),i.x=o,i.y=c,i.z=u,this}makePerspective(e,t,i,s,o,c,u=vr){const d=this.elements,f=2*o/(t-e),m=2*o/(i-s),v=(t+e)/(t-e),p=(i+s)/(i-s);let y,M;if(u===vr)y=-(c+o)/(c-o),M=-2*c*o/(c-o);else if(u===Oc)y=-c/(c-o),M=-c*o/(c-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return d[0]=f,d[4]=0,d[8]=v,d[12]=0,d[1]=0,d[5]=m,d[9]=p,d[13]=0,d[2]=0,d[6]=0,d[10]=y,d[14]=M,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(e,t,i,s,o,c,u=vr){const d=this.elements,f=1/(t-e),m=1/(i-s),v=1/(c-o),p=(t+e)*f,y=(i+s)*m;let M,E;if(u===vr)M=(c+o)*v,E=-2*v;else if(u===Oc)M=o*v,E=-1*v;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return d[0]=2*f,d[4]=0,d[8]=0,d[12]=-p,d[1]=0,d[5]=2*m,d[9]=0,d[13]=-y,d[2]=0,d[6]=0,d[10]=E,d[14]=-M,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ho=new Y,Ai=new kt,Rx=new Y(0,0,0),bx=new Y(1,1,1),Wr=new Y,tc=new Y,ii=new Y,xg=new kt,Sg=new Ln;class si{constructor(e=0,t=0,i=0,s=si.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,o=s[0],c=s[4],u=s[8],d=s[1],f=s[5],m=s[9],v=s[2],p=s[6],y=s[10];switch(t){case"XYZ":this._y=Math.asin(Zn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-m,y),this._z=Math.atan2(-c,o)):(this._x=Math.atan2(p,f),this._z=0);break;case"YXZ":this._x=Math.asin(-Zn(m,-1,1)),Math.abs(m)<.9999999?(this._y=Math.atan2(u,y),this._z=Math.atan2(d,f)):(this._y=Math.atan2(-v,o),this._z=0);break;case"ZXY":this._x=Math.asin(Zn(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-v,y),this._z=Math.atan2(-c,f)):(this._y=0,this._z=Math.atan2(d,o));break;case"ZYX":this._y=Math.asin(-Zn(v,-1,1)),Math.abs(v)<.9999999?(this._x=Math.atan2(p,y),this._z=Math.atan2(d,o)):(this._x=0,this._z=Math.atan2(-c,f));break;case"YZX":this._z=Math.asin(Zn(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-m,f),this._y=Math.atan2(-v,o)):(this._x=0,this._y=Math.atan2(u,y));break;case"XZY":this._z=Math.asin(-Zn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(p,f),this._y=Math.atan2(u,o)):(this._x=Math.atan2(-m,y),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return xg.makeRotationFromQuaternion(e),this.setFromRotationMatrix(xg,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Sg.setFromEuler(this),this.setFromQuaternion(Sg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}si.DEFAULT_ORDER="XYZ";class yf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Px=0;const Mg=new Y,fo=new Ln,or=new kt,nc=new Y,Sa=new Y,Lx=new Y,Ix=new Ln,Eg=new Y(1,0,0),wg=new Y(0,1,0),Tg=new Y(0,0,1),Ag={type:"added"},Dx={type:"removed"},po={type:"childadded",child:null},Wh={type:"childremoved",child:null};class on extends Us{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Px++}),this.uuid=ka(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=on.DEFAULT_UP.clone();const e=new Y,t=new si,i=new Ln,s=new Y(1,1,1);function o(){i.setFromEuler(t,!1)}function c(){t.setFromQuaternion(i,void 0,!1)}t._onChange(o),i._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new kt},normalMatrix:{value:new dt}}),this.matrix=new kt,this.matrixWorld=new kt,this.matrixAutoUpdate=on.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=on.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return fo.setFromAxisAngle(e,t),this.quaternion.multiply(fo),this}rotateOnWorldAxis(e,t){return fo.setFromAxisAngle(e,t),this.quaternion.premultiply(fo),this}rotateX(e){return this.rotateOnAxis(Eg,e)}rotateY(e){return this.rotateOnAxis(wg,e)}rotateZ(e){return this.rotateOnAxis(Tg,e)}translateOnAxis(e,t){return Mg.copy(e).applyQuaternion(this.quaternion),this.position.add(Mg.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Eg,e)}translateY(e){return this.translateOnAxis(wg,e)}translateZ(e){return this.translateOnAxis(Tg,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(or.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?nc.copy(e):nc.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Sa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?or.lookAt(Sa,nc,this.up):or.lookAt(nc,Sa,this.up),this.quaternion.setFromRotationMatrix(or),s&&(or.extractRotation(s.matrixWorld),fo.setFromRotationMatrix(or),this.quaternion.premultiply(fo.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ag),po.child=e,this.dispatchEvent(po),po.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Dx),Wh.child=e,this.dispatchEvent(Wh),Wh.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),or.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),or.multiply(e.parent.matrixWorld)),e.applyMatrix4(or),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ag),po.child=e,this.dispatchEvent(po),po.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const c=this.children[i].getObjectByProperty(e,t);if(c!==void 0)return c}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let o=0,c=s.length;o<c;o++)s[o].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,e,Lx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sa,Ix,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let o=0,c=s.length;o<c;o++)s[o].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(u=>({boxInitialized:u.boxInitialized,boxMin:u.box.min.toArray(),boxMax:u.box.max.toArray(),sphereInitialized:u.sphereInitialized,sphereRadius:u.sphere.radius,sphereCenter:u.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function o(u,d){return u[d.uuid]===void 0&&(u[d.uuid]=d.toJSON(e)),d.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=o(e.geometries,this.geometry);const u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){const d=u.shapes;if(Array.isArray(d))for(let f=0,m=d.length;f<m;f++){const v=d[f];o(e.shapes,v)}else o(e.shapes,d)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const u=[];for(let d=0,f=this.material.length;d<f;d++)u.push(o(e.materials,this.material[d]));s.material=u}else s.material=o(e.materials,this.material);if(this.children.length>0){s.children=[];for(let u=0;u<this.children.length;u++)s.children.push(this.children[u].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let u=0;u<this.animations.length;u++){const d=this.animations[u];s.animations.push(o(e.animations,d))}}if(t){const u=c(e.geometries),d=c(e.materials),f=c(e.textures),m=c(e.images),v=c(e.shapes),p=c(e.skeletons),y=c(e.animations),M=c(e.nodes);u.length>0&&(i.geometries=u),d.length>0&&(i.materials=d),f.length>0&&(i.textures=f),m.length>0&&(i.images=m),v.length>0&&(i.shapes=v),p.length>0&&(i.skeletons=p),y.length>0&&(i.animations=y),M.length>0&&(i.nodes=M)}return i.object=s,i;function c(u){const d=[];for(const f in u){const m=u[f];delete m.metadata,d.push(m)}return d}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}on.DEFAULT_UP=new Y(0,1,0);on.DEFAULT_MATRIX_AUTO_UPDATE=!0;on.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ci=new Y,ar=new Y,Xh=new Y,lr=new Y,mo=new Y,go=new Y,Cg=new Y,jh=new Y,qh=new Y,Yh=new Y,$h=new Qt,Zh=new Qt,Kh=new Qt;class bi{constructor(e=new Y,t=new Y,i=new Y){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Ci.subVectors(e,t),s.cross(Ci);const o=s.lengthSq();return o>0?s.multiplyScalar(1/Math.sqrt(o)):s.set(0,0,0)}static getBarycoord(e,t,i,s,o){Ci.subVectors(s,t),ar.subVectors(i,t),Xh.subVectors(e,t);const c=Ci.dot(Ci),u=Ci.dot(ar),d=Ci.dot(Xh),f=ar.dot(ar),m=ar.dot(Xh),v=c*f-u*u;if(v===0)return o.set(0,0,0),null;const p=1/v,y=(f*d-u*m)*p,M=(c*m-u*d)*p;return o.set(1-y-M,M,y)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,lr)===null?!1:lr.x>=0&&lr.y>=0&&lr.x+lr.y<=1}static getInterpolation(e,t,i,s,o,c,u,d){return this.getBarycoord(e,t,i,s,lr)===null?(d.x=0,d.y=0,"z"in d&&(d.z=0),"w"in d&&(d.w=0),null):(d.setScalar(0),d.addScaledVector(o,lr.x),d.addScaledVector(c,lr.y),d.addScaledVector(u,lr.z),d)}static getInterpolatedAttribute(e,t,i,s,o,c){return $h.setScalar(0),Zh.setScalar(0),Kh.setScalar(0),$h.fromBufferAttribute(e,t),Zh.fromBufferAttribute(e,i),Kh.fromBufferAttribute(e,s),c.setScalar(0),c.addScaledVector($h,o.x),c.addScaledVector(Zh,o.y),c.addScaledVector(Kh,o.z),c}static isFrontFacing(e,t,i,s){return Ci.subVectors(i,t),ar.subVectors(e,t),Ci.cross(ar).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ci.subVectors(this.c,this.b),ar.subVectors(this.a,this.b),Ci.cross(ar).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return bi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return bi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,o){return bi.getInterpolation(e,this.a,this.b,this.c,t,i,s,o)}containsPoint(e){return bi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return bi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,o=this.c;let c,u;mo.subVectors(s,i),go.subVectors(o,i),jh.subVectors(e,i);const d=mo.dot(jh),f=go.dot(jh);if(d<=0&&f<=0)return t.copy(i);qh.subVectors(e,s);const m=mo.dot(qh),v=go.dot(qh);if(m>=0&&v<=m)return t.copy(s);const p=d*v-m*f;if(p<=0&&d>=0&&m<=0)return c=d/(d-m),t.copy(i).addScaledVector(mo,c);Yh.subVectors(e,o);const y=mo.dot(Yh),M=go.dot(Yh);if(M>=0&&y<=M)return t.copy(o);const E=y*f-d*M;if(E<=0&&f>=0&&M<=0)return u=f/(f-M),t.copy(i).addScaledVector(go,u);const x=m*M-y*v;if(x<=0&&v-m>=0&&y-M>=0)return Cg.subVectors(o,s),u=(v-m)/(v-m+(y-M)),t.copy(s).addScaledVector(Cg,u);const _=1/(x+E+p);return c=E*_,u=p*_,t.copy(i).addScaledVector(mo,c).addScaledVector(go,u)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const d0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xr={h:0,s:0,l:0},ic={h:0,s:0,l:0};function Qh(a,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?a+(e-a)*6*t:t<1/2?e:t<2/3?a+(e-a)*6*(2/3-t):a}class at{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,At.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=At.workingColorSpace){return this.r=e,this.g=t,this.b=i,At.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=At.workingColorSpace){if(e=vx(e,1),t=Zn(t,0,1),i=Zn(i,0,1),t===0)this.r=this.g=this.b=i;else{const o=i<=.5?i*(1+t):i+t-i*t,c=2*i-o;this.r=Qh(c,o,e+1/3),this.g=Qh(c,o,e),this.b=Qh(c,o,e-1/3)}return At.toWorkingColorSpace(this,s),this}setStyle(e,t=Bn){function i(o){o!==void 0&&parseFloat(o)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let o;const c=s[1],u=s[2];switch(c){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const o=s[1],c=o.length;if(c===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(c===6)return this.setHex(parseInt(o,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bn){const i=d0[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=_r(e.r),this.g=_r(e.g),this.b=_r(e.b),this}copyLinearToSRGB(e){return this.r=Ro(e.r),this.g=Ro(e.g),this.b=Ro(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bn){return At.fromWorkingColorSpace(bn.copy(this),e),Math.round(Zn(bn.r*255,0,255))*65536+Math.round(Zn(bn.g*255,0,255))*256+Math.round(Zn(bn.b*255,0,255))}getHexString(e=Bn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=At.workingColorSpace){At.fromWorkingColorSpace(bn.copy(this),t);const i=bn.r,s=bn.g,o=bn.b,c=Math.max(i,s,o),u=Math.min(i,s,o);let d,f;const m=(u+c)/2;if(u===c)d=0,f=0;else{const v=c-u;switch(f=m<=.5?v/(c+u):v/(2-c-u),c){case i:d=(s-o)/v+(s<o?6:0);break;case s:d=(o-i)/v+2;break;case o:d=(i-s)/v+4;break}d/=6}return e.h=d,e.s=f,e.l=m,e}getRGB(e,t=At.workingColorSpace){return At.fromWorkingColorSpace(bn.copy(this),t),e.r=bn.r,e.g=bn.g,e.b=bn.b,e}getStyle(e=Bn){At.fromWorkingColorSpace(bn.copy(this),e);const t=bn.r,i=bn.g,s=bn.b;return e!==Bn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Xr),this.setHSL(Xr.h+e,Xr.s+t,Xr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Xr),e.getHSL(ic);const i=Uh(Xr.h,ic.h,t),s=Uh(Xr.s,ic.s,t),o=Uh(Xr.l,ic.l,t);return this.setHSL(i,s,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*s,this.g=o[1]*t+o[4]*i+o[7]*s,this.b=o[2]*t+o[5]*i+o[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const bn=new at;at.NAMES=d0;let Nx=0,Oo=class extends Us{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nx++}),this.uuid=ka(),this.name="",this.blending=Ao,this.side=Qr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=yd,this.blendDst=xd,this.blendEquation=As,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new at(0,0,0),this.blendAlpha=0,this.depthFunc=bo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ug,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=oo,this.stencilZFail=oo,this.stencilZPass=oo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ao&&(i.blending=this.blending),this.side!==Qr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==yd&&(i.blendSrc=this.blendSrc),this.blendDst!==xd&&(i.blendDst=this.blendDst),this.blendEquation!==As&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==bo&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ug&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==oo&&(i.stencilFail=this.stencilFail),this.stencilZFail!==oo&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==oo&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(o){const c=[];for(const u in o){const d=o[u];delete d.metadata,c.push(d)}return c}if(t){const o=s(e.textures),c=s(e.images);o.length>0&&(i.textures=o),c.length>0&&(i.images=c)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let o=0;o!==s;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}};class Xc extends Oo{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new at(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.combine=$v,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const nn=new Y,rc=new Mt;class Qn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=hg,this.updateRanges=[],this.gpuType=gr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,o=this.itemSize;s<o;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)rc.fromBufferAttribute(this,t),rc.applyMatrix3(e),this.setXY(t,rc.x,rc.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix3(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyMatrix4(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.applyNormalMatrix(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)nn.fromBufferAttribute(this,t),nn.transformDirection(e),this.setXYZ(t,nn.x,nn.y,nn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=_a(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Yn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=_a(t,this.array)),t}setX(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=_a(t,this.array)),t}setY(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=_a(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=_a(t,this.array)),t}setW(e,t){return this.normalized&&(t=Yn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array),s=Yn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,o){return e*=this.itemSize,this.normalized&&(t=Yn(t,this.array),i=Yn(i,this.array),s=Yn(s,this.array),o=Yn(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==hg&&(e.usage=this.usage),e}}class f0 extends Qn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class p0 extends Qn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class $t extends Qn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Ux=0;const mi=new kt,Jh=new on,vo=new Y,ri=new Fo,Ma=new Fo,vn=new Y;class Sn extends Us{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ux++}),this.uuid=ka(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(c0(e)?p0:f0)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const o=new dt().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return mi.makeRotationFromQuaternion(e),this.applyMatrix4(mi),this}rotateX(e){return mi.makeRotationX(e),this.applyMatrix4(mi),this}rotateY(e){return mi.makeRotationY(e),this.applyMatrix4(mi),this}rotateZ(e){return mi.makeRotationZ(e),this.applyMatrix4(mi),this}translate(e,t,i){return mi.makeTranslation(e,t,i),this.applyMatrix4(mi),this}scale(e,t,i){return mi.makeScale(e,t,i),this.applyMatrix4(mi),this}lookAt(e){return Jh.lookAt(e),Jh.updateMatrix(),this.applyMatrix4(Jh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vo).negate(),this.translate(vo.x,vo.y,vo.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,o=e.length;s<o;s++){const c=e[s];i.push(c.x,c.y,c.z||0)}this.setAttribute("position",new $t(i,3))}else{for(let i=0,s=t.count;i<s;i++){const o=e[i];t.setXYZ(i,o.x,o.y,o.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Y(-1/0,-1/0,-1/0),new Y(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const o=t[i];ri.setFromBufferAttribute(o),this.morphTargetsRelative?(vn.addVectors(this.boundingBox.min,ri.min),this.boundingBox.expandByPoint(vn),vn.addVectors(this.boundingBox.max,ri.max),this.boundingBox.expandByPoint(vn)):(this.boundingBox.expandByPoint(ri.min),this.boundingBox.expandByPoint(ri.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wc);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Y,1/0);return}if(e){const i=this.boundingSphere.center;if(ri.setFromBufferAttribute(e),t)for(let o=0,c=t.length;o<c;o++){const u=t[o];Ma.setFromBufferAttribute(u),this.morphTargetsRelative?(vn.addVectors(ri.min,Ma.min),ri.expandByPoint(vn),vn.addVectors(ri.max,Ma.max),ri.expandByPoint(vn)):(ri.expandByPoint(Ma.min),ri.expandByPoint(Ma.max))}ri.getCenter(i);let s=0;for(let o=0,c=e.count;o<c;o++)vn.fromBufferAttribute(e,o),s=Math.max(s,i.distanceToSquared(vn));if(t)for(let o=0,c=t.length;o<c;o++){const u=t[o],d=this.morphTargetsRelative;for(let f=0,m=u.count;f<m;f++)vn.fromBufferAttribute(u,f),d&&(vo.fromBufferAttribute(e,f),vn.add(vo)),s=Math.max(s,i.distanceToSquared(vn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,o=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Qn(new Float32Array(4*i.count),4));const c=this.getAttribute("tangent"),u=[],d=[];for(let O=0;O<i.count;O++)u[O]=new Y,d[O]=new Y;const f=new Y,m=new Y,v=new Y,p=new Mt,y=new Mt,M=new Mt,E=new Y,x=new Y;function _(O,b,C){f.fromBufferAttribute(i,O),m.fromBufferAttribute(i,b),v.fromBufferAttribute(i,C),p.fromBufferAttribute(o,O),y.fromBufferAttribute(o,b),M.fromBufferAttribute(o,C),m.sub(f),v.sub(f),y.sub(p),M.sub(p);const z=1/(y.x*M.y-M.x*y.y);isFinite(z)&&(E.copy(m).multiplyScalar(M.y).addScaledVector(v,-y.y).multiplyScalar(z),x.copy(v).multiplyScalar(y.x).addScaledVector(m,-M.x).multiplyScalar(z),u[O].add(E),u[b].add(E),u[C].add(E),d[O].add(x),d[b].add(x),d[C].add(x))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let O=0,b=w.length;O<b;++O){const C=w[O],z=C.start,K=C.count;for(let B=z,j=z+K;B<j;B+=3)_(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const A=new Y,T=new Y,U=new Y,D=new Y;function N(O){U.fromBufferAttribute(s,O),D.copy(U);const b=u[O];A.copy(b),A.sub(U.multiplyScalar(U.dot(b))).normalize(),T.crossVectors(D,b);const z=T.dot(d[O])<0?-1:1;c.setXYZW(O,A.x,A.y,A.z,z)}for(let O=0,b=w.length;O<b;++O){const C=w[O],z=C.start,K=C.count;for(let B=z,j=z+K;B<j;B+=3)N(e.getX(B+0)),N(e.getX(B+1)),N(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Qn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,y=i.count;p<y;p++)i.setXYZ(p,0,0,0);const s=new Y,o=new Y,c=new Y,u=new Y,d=new Y,f=new Y,m=new Y,v=new Y;if(e)for(let p=0,y=e.count;p<y;p+=3){const M=e.getX(p+0),E=e.getX(p+1),x=e.getX(p+2);s.fromBufferAttribute(t,M),o.fromBufferAttribute(t,E),c.fromBufferAttribute(t,x),m.subVectors(c,o),v.subVectors(s,o),m.cross(v),u.fromBufferAttribute(i,M),d.fromBufferAttribute(i,E),f.fromBufferAttribute(i,x),u.add(m),d.add(m),f.add(m),i.setXYZ(M,u.x,u.y,u.z),i.setXYZ(E,d.x,d.y,d.z),i.setXYZ(x,f.x,f.y,f.z)}else for(let p=0,y=t.count;p<y;p+=3)s.fromBufferAttribute(t,p+0),o.fromBufferAttribute(t,p+1),c.fromBufferAttribute(t,p+2),m.subVectors(c,o),v.subVectors(s,o),m.cross(v),i.setXYZ(p+0,m.x,m.y,m.z),i.setXYZ(p+1,m.x,m.y,m.z),i.setXYZ(p+2,m.x,m.y,m.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)vn.fromBufferAttribute(e,t),vn.normalize(),e.setXYZ(t,vn.x,vn.y,vn.z)}toNonIndexed(){function e(u,d){const f=u.array,m=u.itemSize,v=u.normalized,p=new f.constructor(d.length*m);let y=0,M=0;for(let E=0,x=d.length;E<x;E++){u.isInterleavedBufferAttribute?y=d[E]*u.data.stride+u.offset:y=d[E]*m;for(let _=0;_<m;_++)p[M++]=f[y++]}return new Qn(p,m,v)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Sn,i=this.index.array,s=this.attributes;for(const u in s){const d=s[u],f=e(d,i);t.setAttribute(u,f)}const o=this.morphAttributes;for(const u in o){const d=[],f=o[u];for(let m=0,v=f.length;m<v;m++){const p=f[m],y=e(p,i);d.push(y)}t.morphAttributes[u]=d}t.morphTargetsRelative=this.morphTargetsRelative;const c=this.groups;for(let u=0,d=c.length;u<d;u++){const f=c[u];t.addGroup(f.start,f.count,f.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const d=this.parameters;for(const f in d)d[f]!==void 0&&(e[f]=d[f]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const d in i){const f=i[d];e.data.attributes[d]=f.toJSON(e.data)}const s={};let o=!1;for(const d in this.morphAttributes){const f=this.morphAttributes[d],m=[];for(let v=0,p=f.length;v<p;v++){const y=f[v];m.push(y.toJSON(e.data))}m.length>0&&(s[d]=m,o=!0)}o&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const c=this.groups;c.length>0&&(e.data.groups=JSON.parse(JSON.stringify(c)));const u=this.boundingSphere;return u!==null&&(e.data.boundingSphere={center:u.center.toArray(),radius:u.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const f in s){const m=s[f];this.setAttribute(f,m.clone(t))}const o=e.morphAttributes;for(const f in o){const m=[],v=o[f];for(let p=0,y=v.length;p<y;p++)m.push(v[p].clone(t));this.morphAttributes[f]=m}this.morphTargetsRelative=e.morphTargetsRelative;const c=e.groups;for(let f=0,m=c.length;f<m;f++){const v=c[f];this.addGroup(v.start,v.count,v.materialIndex)}const u=e.boundingBox;u!==null&&(this.boundingBox=u.clone());const d=e.boundingSphere;return d!==null&&(this.boundingSphere=d.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Rg=new kt,ms=new _f,sc=new Wc,bg=new Y,oc=new Y,ac=new Y,lc=new Y,ed=new Y,cc=new Y,Pg=new Y,uc=new Y;class Fe extends on{constructor(e=new Sn,t=new Xc){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,c=s.length;o<c;o++){const u=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=o}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,o=i.morphAttributes.position,c=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const u=this.morphTargetInfluences;if(o&&u){cc.set(0,0,0);for(let d=0,f=o.length;d<f;d++){const m=u[d],v=o[d];m!==0&&(ed.fromBufferAttribute(v,e),c?cc.addScaledVector(ed,m):cc.addScaledVector(ed.sub(t),m))}t.add(cc)}return t}raycast(e,t){const i=this.geometry,s=this.material,o=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),sc.copy(i.boundingSphere),sc.applyMatrix4(o),ms.copy(e.ray).recast(e.near),!(sc.containsPoint(ms.origin)===!1&&(ms.intersectSphere(sc,bg)===null||ms.origin.distanceToSquared(bg)>(e.far-e.near)**2))&&(Rg.copy(o).invert(),ms.copy(e.ray).applyMatrix4(Rg),!(i.boundingBox!==null&&ms.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ms)))}_computeIntersections(e,t,i){let s;const o=this.geometry,c=this.material,u=o.index,d=o.attributes.position,f=o.attributes.uv,m=o.attributes.uv1,v=o.attributes.normal,p=o.groups,y=o.drawRange;if(u!==null)if(Array.isArray(c))for(let M=0,E=p.length;M<E;M++){const x=p[M],_=c[x.materialIndex],w=Math.max(x.start,y.start),A=Math.min(u.count,Math.min(x.start+x.count,y.start+y.count));for(let T=w,U=A;T<U;T+=3){const D=u.getX(T),N=u.getX(T+1),O=u.getX(T+2);s=hc(this,_,e,i,f,m,v,D,N,O),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{const M=Math.max(0,y.start),E=Math.min(u.count,y.start+y.count);for(let x=M,_=E;x<_;x+=3){const w=u.getX(x),A=u.getX(x+1),T=u.getX(x+2);s=hc(this,c,e,i,f,m,v,w,A,T),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}else if(d!==void 0)if(Array.isArray(c))for(let M=0,E=p.length;M<E;M++){const x=p[M],_=c[x.materialIndex],w=Math.max(x.start,y.start),A=Math.min(d.count,Math.min(x.start+x.count,y.start+y.count));for(let T=w,U=A;T<U;T+=3){const D=T,N=T+1,O=T+2;s=hc(this,_,e,i,f,m,v,D,N,O),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{const M=Math.max(0,y.start),E=Math.min(d.count,y.start+y.count);for(let x=M,_=E;x<_;x+=3){const w=x,A=x+1,T=x+2;s=hc(this,c,e,i,f,m,v,w,A,T),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}}}function Fx(a,e,t,i,s,o,c,u){let d;if(e.side===Kn?d=i.intersectTriangle(c,o,s,!0,u):d=i.intersectTriangle(s,o,c,e.side===Qr,u),d===null)return null;uc.copy(u),uc.applyMatrix4(a.matrixWorld);const f=t.ray.origin.distanceTo(uc);return f<t.near||f>t.far?null:{distance:f,point:uc.clone(),object:a}}function hc(a,e,t,i,s,o,c,u,d,f){a.getVertexPosition(u,oc),a.getVertexPosition(d,ac),a.getVertexPosition(f,lc);const m=Fx(a,e,t,i,oc,ac,lc,Pg);if(m){const v=new Y;bi.getBarycoord(Pg,oc,ac,lc,v),s&&(m.uv=bi.getInterpolatedAttribute(s,u,d,f,v,new Mt)),o&&(m.uv1=bi.getInterpolatedAttribute(o,u,d,f,v,new Mt)),c&&(m.normal=bi.getInterpolatedAttribute(c,u,d,f,v,new Y),m.normal.dot(i.direction)>0&&m.normal.multiplyScalar(-1));const p={a:u,b:d,c:f,normal:new Y,materialIndex:0};bi.getNormal(oc,ac,lc,p.normal),m.face=p,m.barycoord=v}return m}class Kt extends Sn{constructor(e=1,t=1,i=1,s=1,o=1,c=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:o,depthSegments:c};const u=this;s=Math.floor(s),o=Math.floor(o),c=Math.floor(c);const d=[],f=[],m=[],v=[];let p=0,y=0;M("z","y","x",-1,-1,i,t,e,c,o,0),M("z","y","x",1,-1,i,t,-e,c,o,1),M("x","z","y",1,1,e,i,t,s,c,2),M("x","z","y",1,-1,e,i,-t,s,c,3),M("x","y","z",1,-1,e,t,i,s,o,4),M("x","y","z",-1,-1,e,t,-i,s,o,5),this.setIndex(d),this.setAttribute("position",new $t(f,3)),this.setAttribute("normal",new $t(m,3)),this.setAttribute("uv",new $t(v,2));function M(E,x,_,w,A,T,U,D,N,O,b){const C=T/N,z=U/O,K=T/2,B=U/2,j=D/2,q=N+1,G=O+1;let ne=0,H=0;const W=new Y;for(let se=0;se<G;se++){const V=se*z-B;for(let Z=0;Z<q;Z++){const be=Z*C-K;W[E]=be*w,W[x]=V*A,W[_]=j,f.push(W.x,W.y,W.z),W[E]=0,W[x]=0,W[_]=D>0?1:-1,m.push(W.x,W.y,W.z),v.push(Z/N),v.push(1-se/O),ne+=1}}for(let se=0;se<O;se++)for(let V=0;V<N;V++){const Z=p+V+q*se,be=p+V+q*(se+1),re=p+(V+1)+q*(se+1),de=p+(V+1)+q*se;d.push(Z,be,de),d.push(be,re,de),H+=6}u.addGroup(y,H,b),y+=H,p+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Kt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function No(a){const e={};for(const t in a){e[t]={};for(const i in a[t]){const s=a[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function zn(a){const e={};for(let t=0;t<a.length;t++){const i=No(a[t]);for(const s in i)e[s]=i[s]}return e}function Ox(a){const e=[];for(let t=0;t<a.length;t++)e.push(a[t].clone());return e}function m0(a){const e=a.getRenderTarget();return e===null?a.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:At.workingColorSpace}const g0={clone:No,merge:zn};var zx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Bx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Di extends Oo{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zx,this.fragmentShader=Bx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=No(e.uniforms),this.uniformsGroups=Ox(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const c=this.uniforms[s].value;c&&c.isTexture?t.uniforms[s]={type:"t",value:c.toJSON(e).uuid}:c&&c.isColor?t.uniforms[s]={type:"c",value:c.getHex()}:c&&c.isVector2?t.uniforms[s]={type:"v2",value:c.toArray()}:c&&c.isVector3?t.uniforms[s]={type:"v3",value:c.toArray()}:c&&c.isVector4?t.uniforms[s]={type:"v4",value:c.toArray()}:c&&c.isMatrix3?t.uniforms[s]={type:"m3",value:c.toArray()}:c&&c.isMatrix4?t.uniforms[s]={type:"m4",value:c.toArray()}:t.uniforms[s]={value:c}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class v0 extends on{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new kt,this.projectionMatrix=new kt,this.projectionMatrixInverse=new kt,this.coordinateSystem=vr}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const jr=new Y,Lg=new Mt,Ig=new Mt;class gi extends v0{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=rf*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Nh*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rf*2*Math.atan(Math.tan(Nh*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){jr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(jr.x,jr.y).multiplyScalar(-e/jr.z),jr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(jr.x,jr.y).multiplyScalar(-e/jr.z)}getViewSize(e,t){return this.getViewBounds(e,Lg,Ig),t.subVectors(Ig,Lg)}setViewOffset(e,t,i,s,o,c){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=o,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Nh*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,o=-.5*s;const c=this.view;if(this.view!==null&&this.view.enabled){const d=c.fullWidth,f=c.fullHeight;o+=c.offsetX*s/d,t-=c.offsetY*i/f,s*=c.width/d,i*=c.height/f}const u=this.filmOffset;u!==0&&(o+=e*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const _o=-90,yo=1;class kx extends on{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new gi(_o,yo,e,t);s.layers=this.layers,this.add(s);const o=new gi(_o,yo,e,t);o.layers=this.layers,this.add(o);const c=new gi(_o,yo,e,t);c.layers=this.layers,this.add(c);const u=new gi(_o,yo,e,t);u.layers=this.layers,this.add(u);const d=new gi(_o,yo,e,t);d.layers=this.layers,this.add(d);const f=new gi(_o,yo,e,t);f.layers=this.layers,this.add(f)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,o,c,u,d]=t;for(const f of t)this.remove(f);if(e===vr)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),d.up.set(0,1,0),d.lookAt(0,0,-1);else if(e===Oc)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),d.up.set(0,-1,0),d.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const f of t)this.add(f),f.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[o,c,u,d,f,m]=this.children,v=e.getRenderTarget(),p=e.getActiveCubeFace(),y=e.getActiveMipmapLevel(),M=e.xr.enabled;e.xr.enabled=!1;const E=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,o),e.setRenderTarget(i,1,s),e.render(t,c),e.setRenderTarget(i,2,s),e.render(t,u),e.setRenderTarget(i,3,s),e.render(t,d),e.setRenderTarget(i,4,s),e.render(t,f),i.texture.generateMipmaps=E,e.setRenderTarget(i,5,s),e.render(t,m),e.setRenderTarget(v,p,y),e.xr.enabled=M,i.texture.needsPMREMUpdate=!0}}class _0 extends In{constructor(e,t,i,s,o,c,u,d,f,m){e=e!==void 0?e:[],t=t!==void 0?t:Po,super(e,t,i,s,o,c,u,d,f,m),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Hx extends Ns{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new _0(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:ji}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Kt(5,5,5),o=new Di({name:"CubemapFromEquirect",uniforms:No(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Kn,blending:Zr});o.uniforms.tEquirect.value=t;const c=new Fe(s,o),u=t.minFilter;return t.minFilter===Ls&&(t.minFilter=ji),new kx(1,10,this).update(e,c),t.minFilter=u,c.geometry.dispose(),c.material.dispose(),this}clear(e,t,i,s){const o=e.getRenderTarget();for(let c=0;c<6;c++)e.setRenderTarget(this,c),e.clear(t,i,s);e.setRenderTarget(o)}}const td=new Y,Vx=new Y,Gx=new dt;class Es{constructor(e=new Y(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=td.subVectors(i,t).cross(Vx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(td),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/s;return o<0||o>1?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Gx.getNormalMatrix(e),s=this.coplanarPoint(td).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const gs=new Wc,dc=new Y;class xf{constructor(e=new Es,t=new Es,i=new Es,s=new Es,o=new Es,c=new Es){this.planes=[e,t,i,s,o,c]}set(e,t,i,s,o,c){const u=this.planes;return u[0].copy(e),u[1].copy(t),u[2].copy(i),u[3].copy(s),u[4].copy(o),u[5].copy(c),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=vr){const i=this.planes,s=e.elements,o=s[0],c=s[1],u=s[2],d=s[3],f=s[4],m=s[5],v=s[6],p=s[7],y=s[8],M=s[9],E=s[10],x=s[11],_=s[12],w=s[13],A=s[14],T=s[15];if(i[0].setComponents(d-o,p-f,x-y,T-_).normalize(),i[1].setComponents(d+o,p+f,x+y,T+_).normalize(),i[2].setComponents(d+c,p+m,x+M,T+w).normalize(),i[3].setComponents(d-c,p-m,x-M,T-w).normalize(),i[4].setComponents(d-u,p-v,x-E,T-A).normalize(),t===vr)i[5].setComponents(d+u,p+v,x+E,T+A).normalize();else if(t===Oc)i[5].setComponents(u,v,E,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gs)}intersectsSprite(e){return gs.center.set(0,0,0),gs.radius=.7071067811865476,gs.applyMatrix4(e.matrixWorld),this.intersectsSphere(gs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(dc.x=s.normal.x>0?e.max.x:e.min.x,dc.y=s.normal.y>0?e.max.y:e.min.y,dc.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(dc)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function y0(){let a=null,e=!1,t=null,i=null;function s(o,c){t(o,c),i=a.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=a.requestAnimationFrame(s),e=!0)},stop:function(){a.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){a=o}}}function Wx(a){const e=new WeakMap;function t(u,d){const f=u.array,m=u.usage,v=f.byteLength,p=a.createBuffer();a.bindBuffer(d,p),a.bufferData(d,f,m),u.onUploadCallback();let y;if(f instanceof Float32Array)y=a.FLOAT;else if(f instanceof Uint16Array)u.isFloat16BufferAttribute?y=a.HALF_FLOAT:y=a.UNSIGNED_SHORT;else if(f instanceof Int16Array)y=a.SHORT;else if(f instanceof Uint32Array)y=a.UNSIGNED_INT;else if(f instanceof Int32Array)y=a.INT;else if(f instanceof Int8Array)y=a.BYTE;else if(f instanceof Uint8Array)y=a.UNSIGNED_BYTE;else if(f instanceof Uint8ClampedArray)y=a.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:p,type:y,bytesPerElement:f.BYTES_PER_ELEMENT,version:u.version,size:v}}function i(u,d,f){const m=d.array,v=d.updateRanges;if(a.bindBuffer(f,u),v.length===0)a.bufferSubData(f,0,m);else{v.sort((y,M)=>y.start-M.start);let p=0;for(let y=1;y<v.length;y++){const M=v[p],E=v[y];E.start<=M.start+M.count+1?M.count=Math.max(M.count,E.start+E.count-M.start):(++p,v[p]=E)}v.length=p+1;for(let y=0,M=v.length;y<M;y++){const E=v[y];a.bufferSubData(f,E.start*m.BYTES_PER_ELEMENT,m,E.start,E.count)}d.clearUpdateRanges()}d.onUploadCallback()}function s(u){return u.isInterleavedBufferAttribute&&(u=u.data),e.get(u)}function o(u){u.isInterleavedBufferAttribute&&(u=u.data);const d=e.get(u);d&&(a.deleteBuffer(d.buffer),e.delete(u))}function c(u,d){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){const m=e.get(u);(!m||m.version<u.version)&&e.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}const f=e.get(u);if(f===void 0)e.set(u,t(u,d));else if(f.version<u.version){if(f.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(f.buffer,u,d),f.version=u.version}}return{get:s,remove:o,update:c}}class zo extends Sn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const o=e/2,c=t/2,u=Math.floor(i),d=Math.floor(s),f=u+1,m=d+1,v=e/u,p=t/d,y=[],M=[],E=[],x=[];for(let _=0;_<m;_++){const w=_*p-c;for(let A=0;A<f;A++){const T=A*v-o;M.push(T,-w,0),E.push(0,0,1),x.push(A/u),x.push(1-_/d)}}for(let _=0;_<d;_++)for(let w=0;w<u;w++){const A=w+f*_,T=w+f*(_+1),U=w+1+f*(_+1),D=w+1+f*_;y.push(A,T,D),y.push(T,U,D)}this.setIndex(y),this.setAttribute("position",new $t(M,3)),this.setAttribute("normal",new $t(E,3)),this.setAttribute("uv",new $t(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zo(e.width,e.height,e.widthSegments,e.heightSegments)}}var Xx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,jx=`#ifdef USE_ALPHAHASH
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
#endif`,qx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$x=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Zx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Kx=`#ifdef USE_AOMAP
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
#endif`,Qx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Jx=`#ifdef USE_BATCHING
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
#endif`,yS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,xS=`#ifdef USE_EMISSIVEMAP
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
}`,DS=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,NS=`LambertMaterial material;
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
#endif`,OS=`#ifdef USE_ENVMAP
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
#endif`,zS=`ToonMaterial material;
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
#endif`,XS=`#if defined( RE_IndirectDiffuse )
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
#endif`,jS=`#if defined( RE_IndirectDiffuse )
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
#endif`,$S=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ZS=`#ifdef USE_LOGDEPTHBUF
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
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,yM=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,xM=`#ifdef PREMULTIPLIED_ALPHA
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
#endif`,DM=`#ifdef USE_SKINNING
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
#endif`,NM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,UM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,FM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,OM=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,zM=`#ifdef USE_TRANSMISSION
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
}`,XM=`uniform sampler2D t2D;
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
}`,jM=`varying vec3 vWorldDirection;
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
}`,$M=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ZM=`#include <common>
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
}`,yE=`uniform vec3 diffuse;
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
}`,xE=`#include <common>
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
}`,ft={alphahash_fragment:Xx,alphahash_pars_fragment:jx,alphamap_fragment:qx,alphamap_pars_fragment:Yx,alphatest_fragment:$x,alphatest_pars_fragment:Zx,aomap_fragment:Kx,aomap_pars_fragment:Qx,batching_pars_vertex:Jx,batching_vertex:eS,begin_vertex:tS,beginnormal_vertex:nS,bsdfs:iS,iridescence_fragment:rS,bumpmap_pars_fragment:sS,clipping_planes_fragment:oS,clipping_planes_pars_fragment:aS,clipping_planes_pars_vertex:lS,clipping_planes_vertex:cS,color_fragment:uS,color_pars_fragment:hS,color_pars_vertex:dS,color_vertex:fS,common:pS,cube_uv_reflection_fragment:mS,defaultnormal_vertex:gS,displacementmap_pars_vertex:vS,displacementmap_vertex:_S,emissivemap_fragment:yS,emissivemap_pars_fragment:xS,colorspace_fragment:SS,colorspace_pars_fragment:MS,envmap_fragment:ES,envmap_common_pars_fragment:wS,envmap_pars_fragment:TS,envmap_pars_vertex:AS,envmap_physical_pars_fragment:OS,envmap_vertex:CS,fog_vertex:RS,fog_pars_vertex:bS,fog_fragment:PS,fog_pars_fragment:LS,gradientmap_pars_fragment:IS,lightmap_pars_fragment:DS,lights_lambert_fragment:NS,lights_lambert_pars_fragment:US,lights_pars_begin:FS,lights_toon_fragment:zS,lights_toon_pars_fragment:BS,lights_phong_fragment:kS,lights_phong_pars_fragment:HS,lights_physical_fragment:VS,lights_physical_pars_fragment:GS,lights_fragment_begin:WS,lights_fragment_maps:XS,lights_fragment_end:jS,logdepthbuf_fragment:qS,logdepthbuf_pars_fragment:YS,logdepthbuf_pars_vertex:$S,logdepthbuf_vertex:ZS,map_fragment:KS,map_pars_fragment:QS,map_particle_fragment:JS,map_particle_pars_fragment:eM,metalnessmap_fragment:tM,metalnessmap_pars_fragment:nM,morphinstance_vertex:iM,morphcolor_vertex:rM,morphnormal_vertex:sM,morphtarget_pars_vertex:oM,morphtarget_vertex:aM,normal_fragment_begin:lM,normal_fragment_maps:cM,normal_pars_fragment:uM,normal_pars_vertex:hM,normal_vertex:dM,normalmap_pars_fragment:fM,clearcoat_normal_fragment_begin:pM,clearcoat_normal_fragment_maps:mM,clearcoat_pars_fragment:gM,iridescence_pars_fragment:vM,opaque_fragment:_M,packing:yM,premultiplied_alpha_fragment:xM,project_vertex:SM,dithering_fragment:MM,dithering_pars_fragment:EM,roughnessmap_fragment:wM,roughnessmap_pars_fragment:TM,shadowmap_pars_fragment:AM,shadowmap_pars_vertex:CM,shadowmap_vertex:RM,shadowmask_pars_fragment:bM,skinbase_vertex:PM,skinning_pars_vertex:LM,skinning_vertex:IM,skinnormal_vertex:DM,specularmap_fragment:NM,specularmap_pars_fragment:UM,tonemapping_fragment:FM,tonemapping_pars_fragment:OM,transmission_fragment:zM,transmission_pars_fragment:BM,uv_pars_fragment:kM,uv_pars_vertex:HM,uv_vertex:VM,worldpos_vertex:GM,background_vert:WM,background_frag:XM,backgroundCube_vert:jM,backgroundCube_frag:qM,cube_vert:YM,cube_frag:$M,depth_vert:ZM,depth_frag:KM,distanceRGBA_vert:QM,distanceRGBA_frag:JM,equirect_vert:eE,equirect_frag:tE,linedashed_vert:nE,linedashed_frag:iE,meshbasic_vert:rE,meshbasic_frag:sE,meshlambert_vert:oE,meshlambert_frag:aE,meshmatcap_vert:lE,meshmatcap_frag:cE,meshnormal_vert:uE,meshnormal_frag:hE,meshphong_vert:dE,meshphong_frag:fE,meshphysical_vert:pE,meshphysical_frag:mE,meshtoon_vert:gE,meshtoon_frag:vE,points_vert:_E,points_frag:yE,shadow_vert:xE,shadow_frag:SE,sprite_vert:ME,sprite_frag:EE},Re={common:{diffuse:{value:new at(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new dt},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new dt}},envmap:{envMap:{value:null},envMapRotation:{value:new dt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new dt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new dt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new dt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new dt},normalScale:{value:new Mt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new dt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new dt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new dt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new dt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new at(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new at(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0},uvTransform:{value:new dt}},sprite:{diffuse:{value:new at(16777215)},opacity:{value:1},center:{value:new Mt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new dt},alphaMap:{value:null},alphaMapTransform:{value:new dt},alphaTest:{value:0}}},Wi={basic:{uniforms:zn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.fog]),vertexShader:ft.meshbasic_vert,fragmentShader:ft.meshbasic_frag},lambert:{uniforms:zn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new at(0)}}]),vertexShader:ft.meshlambert_vert,fragmentShader:ft.meshlambert_frag},phong:{uniforms:zn([Re.common,Re.specularmap,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,Re.lights,{emissive:{value:new at(0)},specular:{value:new at(1118481)},shininess:{value:30}}]),vertexShader:ft.meshphong_vert,fragmentShader:ft.meshphong_frag},standard:{uniforms:zn([Re.common,Re.envmap,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.roughnessmap,Re.metalnessmap,Re.fog,Re.lights,{emissive:{value:new at(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag},toon:{uniforms:zn([Re.common,Re.aomap,Re.lightmap,Re.emissivemap,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.gradientmap,Re.fog,Re.lights,{emissive:{value:new at(0)}}]),vertexShader:ft.meshtoon_vert,fragmentShader:ft.meshtoon_frag},matcap:{uniforms:zn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,Re.fog,{matcap:{value:null}}]),vertexShader:ft.meshmatcap_vert,fragmentShader:ft.meshmatcap_frag},points:{uniforms:zn([Re.points,Re.fog]),vertexShader:ft.points_vert,fragmentShader:ft.points_frag},dashed:{uniforms:zn([Re.common,Re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ft.linedashed_vert,fragmentShader:ft.linedashed_frag},depth:{uniforms:zn([Re.common,Re.displacementmap]),vertexShader:ft.depth_vert,fragmentShader:ft.depth_frag},normal:{uniforms:zn([Re.common,Re.bumpmap,Re.normalmap,Re.displacementmap,{opacity:{value:1}}]),vertexShader:ft.meshnormal_vert,fragmentShader:ft.meshnormal_frag},sprite:{uniforms:zn([Re.sprite,Re.fog]),vertexShader:ft.sprite_vert,fragmentShader:ft.sprite_frag},background:{uniforms:{uvTransform:{value:new dt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ft.background_vert,fragmentShader:ft.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new dt}},vertexShader:ft.backgroundCube_vert,fragmentShader:ft.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ft.cube_vert,fragmentShader:ft.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ft.equirect_vert,fragmentShader:ft.equirect_frag},distanceRGBA:{uniforms:zn([Re.common,Re.displacementmap,{referencePosition:{value:new Y},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ft.distanceRGBA_vert,fragmentShader:ft.distanceRGBA_frag},shadow:{uniforms:zn([Re.lights,Re.fog,{color:{value:new at(0)},opacity:{value:1}}]),vertexShader:ft.shadow_vert,fragmentShader:ft.shadow_frag}};Wi.physical={uniforms:zn([Wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new dt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new dt},clearcoatNormalScale:{value:new Mt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new dt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new dt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new dt},sheen:{value:0},sheenColor:{value:new at(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new dt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new dt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new dt},transmissionSamplerSize:{value:new Mt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new dt},attenuationDistance:{value:0},attenuationColor:{value:new at(0)},specularColor:{value:new at(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new dt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new dt},anisotropyVector:{value:new Mt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new dt}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag};const fc={r:0,b:0,g:0},vs=new si,wE=new kt;function TE(a,e,t,i,s,o,c){const u=new at(0);let d=o===!0?0:1,f,m,v=null,p=0,y=null;function M(w){let A=w.isScene===!0?w.background:null;return A&&A.isTexture&&(A=(w.backgroundBlurriness>0?t:e).get(A)),A}function E(w){let A=!1;const T=M(w);T===null?_(u,d):T&&T.isColor&&(_(T,1),A=!0);const U=a.xr.getEnvironmentBlendMode();U==="additive"?i.buffers.color.setClear(0,0,0,1,c):U==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,c),(a.autoClear||A)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),a.clear(a.autoClearColor,a.autoClearDepth,a.autoClearStencil))}function x(w,A){const T=M(A);T&&(T.isCubeTexture||T.mapping===Vc)?(m===void 0&&(m=new Fe(new Kt(1,1,1),new Di({name:"BackgroundCubeMaterial",uniforms:No(Wi.backgroundCube.uniforms),vertexShader:Wi.backgroundCube.vertexShader,fragmentShader:Wi.backgroundCube.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),m.geometry.deleteAttribute("uv"),m.onBeforeRender=function(U,D,N){this.matrixWorld.copyPosition(N.matrixWorld)},Object.defineProperty(m.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(m)),vs.copy(A.backgroundRotation),vs.x*=-1,vs.y*=-1,vs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(vs.y*=-1,vs.z*=-1),m.material.uniforms.envMap.value=T,m.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,m.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,m.material.uniforms.backgroundRotation.value.setFromMatrix4(wE.makeRotationFromEuler(vs)),m.material.toneMapped=At.getTransfer(T.colorSpace)!==Nt,(v!==T||p!==T.version||y!==a.toneMapping)&&(m.material.needsUpdate=!0,v=T,p=T.version,y=a.toneMapping),m.layers.enableAll(),w.unshift(m,m.geometry,m.material,0,0,null)):T&&T.isTexture&&(f===void 0&&(f=new Fe(new zo(2,2),new Di({name:"BackgroundMaterial",uniforms:No(Wi.background.uniforms),vertexShader:Wi.background.vertexShader,fragmentShader:Wi.background.fragmentShader,side:Qr,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),Object.defineProperty(f.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(f)),f.material.uniforms.t2D.value=T,f.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,f.material.toneMapped=At.getTransfer(T.colorSpace)!==Nt,T.matrixAutoUpdate===!0&&T.updateMatrix(),f.material.uniforms.uvTransform.value.copy(T.matrix),(v!==T||p!==T.version||y!==a.toneMapping)&&(f.material.needsUpdate=!0,v=T,p=T.version,y=a.toneMapping),f.layers.enableAll(),w.unshift(f,f.geometry,f.material,0,0,null))}function _(w,A){w.getRGB(fc,m0(a)),i.buffers.color.setClear(fc.r,fc.g,fc.b,A,c)}return{getClearColor:function(){return u},setClearColor:function(w,A=1){u.set(w),d=A,_(u,d)},getClearAlpha:function(){return d},setClearAlpha:function(w){d=w,_(u,d)},render:E,addToRenderList:x}}function AE(a,e){const t=a.getParameter(a.MAX_VERTEX_ATTRIBS),i={},s=p(null);let o=s,c=!1;function u(C,z,K,B,j){let q=!1;const G=v(B,K,z);o!==G&&(o=G,f(o.object)),q=y(C,B,K,j),q&&M(C,B,K,j),j!==null&&e.update(j,a.ELEMENT_ARRAY_BUFFER),(q||c)&&(c=!1,T(C,z,K,B),j!==null&&a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,e.get(j).buffer))}function d(){return a.createVertexArray()}function f(C){return a.bindVertexArray(C)}function m(C){return a.deleteVertexArray(C)}function v(C,z,K){const B=K.wireframe===!0;let j=i[C.id];j===void 0&&(j={},i[C.id]=j);let q=j[z.id];q===void 0&&(q={},j[z.id]=q);let G=q[B];return G===void 0&&(G=p(d()),q[B]=G),G}function p(C){const z=[],K=[],B=[];for(let j=0;j<t;j++)z[j]=0,K[j]=0,B[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:K,attributeDivisors:B,object:C,attributes:{},index:null}}function y(C,z,K,B){const j=o.attributes,q=z.attributes;let G=0;const ne=K.getAttributes();for(const H in ne)if(ne[H].location>=0){const se=j[H];let V=q[H];if(V===void 0&&(H==="instanceMatrix"&&C.instanceMatrix&&(V=C.instanceMatrix),H==="instanceColor"&&C.instanceColor&&(V=C.instanceColor)),se===void 0||se.attribute!==V||V&&se.data!==V.data)return!0;G++}return o.attributesNum!==G||o.index!==B}function M(C,z,K,B){const j={},q=z.attributes;let G=0;const ne=K.getAttributes();for(const H in ne)if(ne[H].location>=0){let se=q[H];se===void 0&&(H==="instanceMatrix"&&C.instanceMatrix&&(se=C.instanceMatrix),H==="instanceColor"&&C.instanceColor&&(se=C.instanceColor));const V={};V.attribute=se,se&&se.data&&(V.data=se.data),j[H]=V,G++}o.attributes=j,o.attributesNum=G,o.index=B}function E(){const C=o.newAttributes;for(let z=0,K=C.length;z<K;z++)C[z]=0}function x(C){_(C,0)}function _(C,z){const K=o.newAttributes,B=o.enabledAttributes,j=o.attributeDivisors;K[C]=1,B[C]===0&&(a.enableVertexAttribArray(C),B[C]=1),j[C]!==z&&(a.vertexAttribDivisor(C,z),j[C]=z)}function w(){const C=o.newAttributes,z=o.enabledAttributes;for(let K=0,B=z.length;K<B;K++)z[K]!==C[K]&&(a.disableVertexAttribArray(K),z[K]=0)}function A(C,z,K,B,j,q,G){G===!0?a.vertexAttribIPointer(C,z,K,j,q):a.vertexAttribPointer(C,z,K,B,j,q)}function T(C,z,K,B){E();const j=B.attributes,q=K.getAttributes(),G=z.defaultAttributeValues;for(const ne in q){const H=q[ne];if(H.location>=0){let W=j[ne];if(W===void 0&&(ne==="instanceMatrix"&&C.instanceMatrix&&(W=C.instanceMatrix),ne==="instanceColor"&&C.instanceColor&&(W=C.instanceColor)),W!==void 0){const se=W.normalized,V=W.itemSize,Z=e.get(W);if(Z===void 0)continue;const be=Z.buffer,re=Z.type,de=Z.bytesPerElement,Me=re===a.INT||re===a.UNSIGNED_INT||W.gpuType===df;if(W.isInterleavedBufferAttribute){const _e=W.data,Ce=_e.stride,Oe=W.offset;if(_e.isInstancedInterleavedBuffer){for(let nt=0;nt<H.locationSize;nt++)_(H.location+nt,_e.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let nt=0;nt<H.locationSize;nt++)x(H.location+nt);a.bindBuffer(a.ARRAY_BUFFER,be);for(let nt=0;nt<H.locationSize;nt++)A(H.location+nt,V/H.locationSize,re,se,Ce*de,(Oe+V/H.locationSize*nt)*de,Me)}else{if(W.isInstancedBufferAttribute){for(let _e=0;_e<H.locationSize;_e++)_(H.location+_e,W.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let _e=0;_e<H.locationSize;_e++)x(H.location+_e);a.bindBuffer(a.ARRAY_BUFFER,be);for(let _e=0;_e<H.locationSize;_e++)A(H.location+_e,V/H.locationSize,re,se,V*de,V/H.locationSize*_e*de,Me)}}else if(G!==void 0){const se=G[ne];if(se!==void 0)switch(se.length){case 2:a.vertexAttrib2fv(H.location,se);break;case 3:a.vertexAttrib3fv(H.location,se);break;case 4:a.vertexAttrib4fv(H.location,se);break;default:a.vertexAttrib1fv(H.location,se)}}}}w()}function U(){O();for(const C in i){const z=i[C];for(const K in z){const B=z[K];for(const j in B)m(B[j].object),delete B[j];delete z[K]}delete i[C]}}function D(C){if(i[C.id]===void 0)return;const z=i[C.id];for(const K in z){const B=z[K];for(const j in B)m(B[j].object),delete B[j];delete z[K]}delete i[C.id]}function N(C){for(const z in i){const K=i[z];if(K[C.id]===void 0)continue;const B=K[C.id];for(const j in B)m(B[j].object),delete B[j];delete K[C.id]}}function O(){b(),c=!0,o!==s&&(o=s,f(o.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:u,reset:O,resetDefaultState:b,dispose:U,releaseStatesOfGeometry:D,releaseStatesOfProgram:N,initAttributes:E,enableAttribute:x,disableUnusedAttributes:w}}function CE(a,e,t){let i;function s(f){i=f}function o(f,m){a.drawArrays(i,f,m),t.update(m,i,1)}function c(f,m,v){v!==0&&(a.drawArraysInstanced(i,f,m,v),t.update(m,i,v))}function u(f,m,v){if(v===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,f,0,m,0,v);let y=0;for(let M=0;M<v;M++)y+=m[M];t.update(y,i,1)}function d(f,m,v,p){if(v===0)return;const y=e.get("WEBGL_multi_draw");if(y===null)for(let M=0;M<f.length;M++)c(f[M],m[M],p[M]);else{y.multiDrawArraysInstancedWEBGL(i,f,0,m,0,p,0,v);let M=0;for(let E=0;E<v;E++)M+=m[E]*p[E];t.update(M,i,1)}}this.setMode=s,this.render=o,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function RE(a,e,t,i){let s;function o(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const N=e.get("EXT_texture_filter_anisotropic");s=a.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function c(N){return!(N!==Pi&&i.convert(N)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(N){const O=N===Ba&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(N!==yr&&i.convert(N)!==a.getParameter(a.IMPLEMENTATION_COLOR_READ_TYPE)&&N!==gr&&!O)}function d(N){if(N==="highp"){if(a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.HIGH_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.HIGH_FLOAT).precision>0)return"highp";N="mediump"}return N==="mediump"&&a.getShaderPrecisionFormat(a.VERTEX_SHADER,a.MEDIUM_FLOAT).precision>0&&a.getShaderPrecisionFormat(a.FRAGMENT_SHADER,a.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let f=t.precision!==void 0?t.precision:"highp";const m=d(f);m!==f&&(console.warn("THREE.WebGLRenderer:",f,"not supported, using",m,"instead."),f=m);const v=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),y=a.getParameter(a.MAX_TEXTURE_IMAGE_UNITS),M=a.getParameter(a.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=a.getParameter(a.MAX_TEXTURE_SIZE),x=a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE),_=a.getParameter(a.MAX_VERTEX_ATTRIBS),w=a.getParameter(a.MAX_VERTEX_UNIFORM_VECTORS),A=a.getParameter(a.MAX_VARYING_VECTORS),T=a.getParameter(a.MAX_FRAGMENT_UNIFORM_VECTORS),U=M>0,D=a.getParameter(a.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:d,textureFormatReadable:c,textureTypeReadable:u,precision:f,logarithmicDepthBuffer:v,reverseDepthBuffer:p,maxTextures:y,maxVertexTextures:M,maxTextureSize:E,maxCubemapSize:x,maxAttributes:_,maxVertexUniforms:w,maxVaryings:A,maxFragmentUniforms:T,vertexTextures:U,maxSamples:D}}function bE(a){const e=this;let t=null,i=0,s=!1,o=!1;const c=new Es,u=new dt,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(v,p){const y=v.length!==0||p||i!==0||s;return s=p,i=v.length,y},this.beginShadows=function(){o=!0,m(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(v,p){t=m(v,p,0)},this.setState=function(v,p,y){const M=v.clippingPlanes,E=v.clipIntersection,x=v.clipShadows,_=a.get(v);if(!s||M===null||M.length===0||o&&!x)o?m(null):f();else{const w=o?0:i,A=w*4;let T=_.clippingState||null;d.value=T,T=m(M,p,A,y);for(let U=0;U!==A;++U)T[U]=t[U];_.clippingState=T,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=w}};function f(){d.value!==t&&(d.value=t,d.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function m(v,p,y,M){const E=v!==null?v.length:0;let x=null;if(E!==0){if(x=d.value,M!==!0||x===null){const _=y+E*4,w=p.matrixWorldInverse;u.getNormalMatrix(w),(x===null||x.length<_)&&(x=new Float32Array(_));for(let A=0,T=y;A!==E;++A,T+=4)c.copy(v[A]).applyMatrix4(w,u),c.normal.toArray(x,T),x[T+3]=c.constant}d.value=x,d.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,x}}function PE(a){let e=new WeakMap;function t(c,u){return u===Rd?c.mapping=Po:u===bd&&(c.mapping=Lo),c}function i(c){if(c&&c.isTexture){const u=c.mapping;if(u===Rd||u===bd)if(e.has(c)){const d=e.get(c).texture;return t(d,c.mapping)}else{const d=c.image;if(d&&d.height>0){const f=new Hx(d.height);return f.fromEquirectangularTexture(a,c),e.set(c,f),c.addEventListener("dispose",s),t(f.texture,c.mapping)}else return null}}return c}function s(c){const u=c.target;u.removeEventListener("dispose",s);const d=e.get(u);d!==void 0&&(e.delete(u),d.dispose())}function o(){e=new WeakMap}return{get:i,dispose:o}}class x0 extends v0{constructor(e=-1,t=1,i=1,s=-1,o=.1,c=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=o,this.far=c,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,o,c){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=o,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let o=i-e,c=i+e,u=s+t,d=s-t;if(this.view!==null&&this.view.enabled){const f=(this.right-this.left)/this.view.fullWidth/this.zoom,m=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=f*this.view.offsetX,c=o+f*this.view.width,u-=m*this.view.offsetY,d=u-m*this.view.height}this.projectionMatrix.makeOrthographic(o,c,u,d,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Eo=4,Dg=[.125,.215,.35,.446,.526,.582],Cs=20,nd=new x0,Ng=new at;let id=null,rd=0,sd=0,od=!1;const ws=(1+Math.sqrt(5))/2,xo=1/ws,Ug=[new Y(-ws,xo,0),new Y(ws,xo,0),new Y(-xo,0,ws),new Y(xo,0,ws),new Y(0,ws,-xo),new Y(0,ws,xo),new Y(-1,1,-1),new Y(1,1,-1),new Y(-1,1,1),new Y(1,1,1)];class Fg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){id=this._renderer.getRenderTarget(),rd=this._renderer.getActiveCubeFace(),sd=this._renderer.getActiveMipmapLevel(),od=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,s,o),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zg(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(id,rd,sd),this._renderer.xr.enabled=od,e.scissorTest=!1,pc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Po||e.mapping===Lo?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),id=this._renderer.getRenderTarget(),rd=this._renderer.getActiveCubeFace(),sd=this._renderer.getActiveMipmapLevel(),od=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:ji,minFilter:ji,generateMipmaps:!1,type:Ba,format:Pi,colorSpace:Uo,depthBuffer:!1},s=Og(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Og(e,t,i);const{_lodMax:o}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=LE(o)),this._blurMaterial=IE(o,e,t)}return s}_compileMaterial(e){const t=new Fe(this._lodPlanes[0],e);this._renderer.compile(t,nd)}_sceneToCubeUV(e,t,i,s){const u=new gi(90,1,t,i),d=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],m=this._renderer,v=m.autoClear,p=m.toneMapping;m.getClearColor(Ng),m.toneMapping=Kr,m.autoClear=!1;const y=new Xc({name:"PMREM.Background",side:Kn,depthWrite:!1,depthTest:!1}),M=new Fe(new Kt,y);let E=!1;const x=e.background;x?x.isColor&&(y.color.copy(x),e.background=null,E=!0):(y.color.copy(Ng),E=!0);for(let _=0;_<6;_++){const w=_%3;w===0?(u.up.set(0,d[_],0),u.lookAt(f[_],0,0)):w===1?(u.up.set(0,0,d[_]),u.lookAt(0,f[_],0)):(u.up.set(0,d[_],0),u.lookAt(0,0,f[_]));const A=this._cubeSize;pc(s,w*A,_>2?A:0,A,A),m.setRenderTarget(s),E&&m.render(M,u),m.render(e,u)}M.geometry.dispose(),M.material.dispose(),m.toneMapping=p,m.autoClear=v,e.background=x}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Po||e.mapping===Lo;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zg());const o=s?this._cubemapMaterial:this._equirectMaterial,c=new Fe(this._lodPlanes[0],o),u=o.uniforms;u.envMap.value=e;const d=this._cubeSize;pc(t,0,0,3*d,2*d),i.setRenderTarget(t),i.render(c,nd)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let o=1;o<s;o++){const c=Math.sqrt(this._sigmas[o]*this._sigmas[o]-this._sigmas[o-1]*this._sigmas[o-1]),u=Ug[(s-o-1)%Ug.length];this._blur(e,o-1,o,c,u)}t.autoClear=i}_blur(e,t,i,s,o){const c=this._pingPongRenderTarget;this._halfBlur(e,c,t,i,s,"latitudinal",o),this._halfBlur(c,e,i,i,s,"longitudinal",o)}_halfBlur(e,t,i,s,o,c,u){const d=this._renderer,f=this._blurMaterial;c!=="latitudinal"&&c!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const m=3,v=new Fe(this._lodPlanes[s],f),p=f.uniforms,y=this._sizeLods[i]-1,M=isFinite(o)?Math.PI/(2*y):2*Math.PI/(2*Cs-1),E=o/M,x=isFinite(o)?1+Math.floor(m*E):Cs;x>Cs&&console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${Cs}`);const _=[];let w=0;for(let N=0;N<Cs;++N){const O=N/E,b=Math.exp(-O*O/2);_.push(b),N===0?w+=b:N<x&&(w+=2*b)}for(let N=0;N<_.length;N++)_[N]=_[N]/w;p.envMap.value=e.texture,p.samples.value=x,p.weights.value=_,p.latitudinal.value=c==="latitudinal",u&&(p.poleAxis.value=u);const{_lodMax:A}=this;p.dTheta.value=M,p.mipInt.value=A-i;const T=this._sizeLods[s],U=3*T*(s>A-Eo?s-A+Eo:0),D=4*(this._cubeSize-T);pc(t,U,D,3*T,2*T),d.setRenderTarget(t),d.render(v,nd)}}function LE(a){const e=[],t=[],i=[];let s=a;const o=a-Eo+1+Dg.length;for(let c=0;c<o;c++){const u=Math.pow(2,s);t.push(u);let d=1/u;c>a-Eo?d=Dg[c-a+Eo-1]:c===0&&(d=0),i.push(d);const f=1/(u-2),m=-f,v=1+f,p=[m,m,v,m,v,v,m,m,v,v,m,v],y=6,M=6,E=3,x=2,_=1,w=new Float32Array(E*M*y),A=new Float32Array(x*M*y),T=new Float32Array(_*M*y);for(let D=0;D<y;D++){const N=D%3*2/3-1,O=D>2?0:-1,b=[N,O,0,N+2/3,O,0,N+2/3,O+1,0,N,O,0,N+2/3,O+1,0,N,O+1,0];w.set(b,E*M*D),A.set(p,x*M*D);const C=[D,D,D,D,D,D];T.set(C,_*M*D)}const U=new Sn;U.setAttribute("position",new Qn(w,E)),U.setAttribute("uv",new Qn(A,x)),U.setAttribute("faceIndex",new Qn(T,_)),e.push(U),s>Eo&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Og(a,e,t){const i=new Ns(a,e,t);return i.texture.mapping=Vc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function pc(a,e,t,i,s){a.viewport.set(e,t,i,s),a.scissor.set(e,t,i,s)}function IE(a,e,t){const i=new Float32Array(Cs),s=new Y(0,1,0);return new Di({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Sf(),fragmentShader:`

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
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function zg(){return new Di({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Sf(),fragmentShader:`

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
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function Bg(){return new Di({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Sf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Zr,depthTest:!1,depthWrite:!1})}function Sf(){return`

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
	`}function DE(a){let e=new WeakMap,t=null;function i(u){if(u&&u.isTexture){const d=u.mapping,f=d===Rd||d===bd,m=d===Po||d===Lo;if(f||m){let v=e.get(u);const p=v!==void 0?v.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return t===null&&(t=new Fg(a)),v=f?t.fromEquirectangular(u,v):t.fromCubemap(u,v),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),v.texture;if(v!==void 0)return v.texture;{const y=u.image;return f&&y&&y.height>0||m&&y&&s(y)?(t===null&&(t=new Fg(a)),v=f?t.fromEquirectangular(u):t.fromCubemap(u),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),u.addEventListener("dispose",o),v.texture):null}}}return u}function s(u){let d=0;const f=6;for(let m=0;m<f;m++)u[m]!==void 0&&d++;return d===f}function o(u){const d=u.target;d.removeEventListener("dispose",o);const f=e.get(d);f!==void 0&&(e.delete(d),f.dispose())}function c(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:c}}function NE(a){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=a.getExtension("WEBGL_depth_texture")||a.getExtension("MOZ_WEBGL_depth_texture")||a.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=a.getExtension("EXT_texture_filter_anisotropic")||a.getExtension("MOZ_EXT_texture_filter_anisotropic")||a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=a.getExtension("WEBGL_compressed_texture_s3tc")||a.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=a.getExtension("WEBGL_compressed_texture_pvrtc")||a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=a.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&La("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function UE(a,e,t,i){const s={},o=new WeakMap;function c(v){const p=v.target;p.index!==null&&e.remove(p.index);for(const M in p.attributes)e.remove(p.attributes[M]);for(const M in p.morphAttributes){const E=p.morphAttributes[M];for(let x=0,_=E.length;x<_;x++)e.remove(E[x])}p.removeEventListener("dispose",c),delete s[p.id];const y=o.get(p);y&&(e.remove(y),o.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function u(v,p){return s[p.id]===!0||(p.addEventListener("dispose",c),s[p.id]=!0,t.memory.geometries++),p}function d(v){const p=v.attributes;for(const M in p)e.update(p[M],a.ARRAY_BUFFER);const y=v.morphAttributes;for(const M in y){const E=y[M];for(let x=0,_=E.length;x<_;x++)e.update(E[x],a.ARRAY_BUFFER)}}function f(v){const p=[],y=v.index,M=v.attributes.position;let E=0;if(y!==null){const w=y.array;E=y.version;for(let A=0,T=w.length;A<T;A+=3){const U=w[A+0],D=w[A+1],N=w[A+2];p.push(U,D,D,N,N,U)}}else if(M!==void 0){const w=M.array;E=M.version;for(let A=0,T=w.length/3-1;A<T;A+=3){const U=A+0,D=A+1,N=A+2;p.push(U,D,D,N,N,U)}}else return;const x=new(c0(p)?p0:f0)(p,1);x.version=E;const _=o.get(v);_&&e.remove(_),o.set(v,x)}function m(v){const p=o.get(v);if(p){const y=v.index;y!==null&&p.version<y.version&&f(v)}else f(v);return o.get(v)}return{get:u,update:d,getWireframeAttribute:m}}function FE(a,e,t){let i;function s(p){i=p}let o,c;function u(p){o=p.type,c=p.bytesPerElement}function d(p,y){a.drawElements(i,y,o,p*c),t.update(y,i,1)}function f(p,y,M){M!==0&&(a.drawElementsInstanced(i,y,o,p*c,M),t.update(y,i,M))}function m(p,y,M){if(M===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,y,0,o,p,0,M);let x=0;for(let _=0;_<M;_++)x+=y[_];t.update(x,i,1)}function v(p,y,M,E){if(M===0)return;const x=e.get("WEBGL_multi_draw");if(x===null)for(let _=0;_<p.length;_++)f(p[_]/c,y[_],E[_]);else{x.multiDrawElementsInstancedWEBGL(i,y,0,o,p,0,E,0,M);let _=0;for(let w=0;w<M;w++)_+=y[w]*E[w];t.update(_,i,1)}}this.setMode=s,this.setIndex=u,this.render=d,this.renderInstances=f,this.renderMultiDraw=m,this.renderMultiDrawInstances=v}function OE(a){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,c,u){switch(t.calls++,c){case a.TRIANGLES:t.triangles+=u*(o/3);break;case a.LINES:t.lines+=u*(o/2);break;case a.LINE_STRIP:t.lines+=u*(o-1);break;case a.LINE_LOOP:t.lines+=u*o;break;case a.POINTS:t.points+=u*o;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",c);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function zE(a,e,t){const i=new WeakMap,s=new Qt;function o(c,u,d){const f=c.morphTargetInfluences,m=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,v=m!==void 0?m.length:0;let p=i.get(u);if(p===void 0||p.count!==v){let C=function(){O.dispose(),i.delete(u),u.removeEventListener("dispose",C)};var y=C;p!==void 0&&p.texture.dispose();const M=u.morphAttributes.position!==void 0,E=u.morphAttributes.normal!==void 0,x=u.morphAttributes.color!==void 0,_=u.morphAttributes.position||[],w=u.morphAttributes.normal||[],A=u.morphAttributes.color||[];let T=0;M===!0&&(T=1),E===!0&&(T=2),x===!0&&(T=3);let U=u.attributes.position.count*T,D=1;U>e.maxTextureSize&&(D=Math.ceil(U/e.maxTextureSize),U=e.maxTextureSize);const N=new Float32Array(U*D*4*v),O=new h0(N,U,D,v);O.type=gr,O.needsUpdate=!0;const b=T*4;for(let z=0;z<v;z++){const K=_[z],B=w[z],j=A[z],q=U*D*4*z;for(let G=0;G<K.count;G++){const ne=G*b;M===!0&&(s.fromBufferAttribute(K,G),N[q+ne+0]=s.x,N[q+ne+1]=s.y,N[q+ne+2]=s.z,N[q+ne+3]=0),E===!0&&(s.fromBufferAttribute(B,G),N[q+ne+4]=s.x,N[q+ne+5]=s.y,N[q+ne+6]=s.z,N[q+ne+7]=0),x===!0&&(s.fromBufferAttribute(j,G),N[q+ne+8]=s.x,N[q+ne+9]=s.y,N[q+ne+10]=s.z,N[q+ne+11]=j.itemSize===4?s.w:1)}}p={count:v,texture:O,size:new Mt(U,D)},i.set(u,p),u.addEventListener("dispose",C)}if(c.isInstancedMesh===!0&&c.morphTexture!==null)d.getUniforms().setValue(a,"morphTexture",c.morphTexture,t);else{let M=0;for(let x=0;x<f.length;x++)M+=f[x];const E=u.morphTargetsRelative?1:1-M;d.getUniforms().setValue(a,"morphTargetBaseInfluence",E),d.getUniforms().setValue(a,"morphTargetInfluences",f)}d.getUniforms().setValue(a,"morphTargetsTexture",p.texture,t),d.getUniforms().setValue(a,"morphTargetsTextureSize",p.size)}return{update:o}}function BE(a,e,t,i){let s=new WeakMap;function o(d){const f=i.render.frame,m=d.geometry,v=e.get(d,m);if(s.get(v)!==f&&(e.update(v),s.set(v,f)),d.isInstancedMesh&&(d.hasEventListener("dispose",u)===!1&&d.addEventListener("dispose",u),s.get(d)!==f&&(t.update(d.instanceMatrix,a.ARRAY_BUFFER),d.instanceColor!==null&&t.update(d.instanceColor,a.ARRAY_BUFFER),s.set(d,f))),d.isSkinnedMesh){const p=d.skeleton;s.get(p)!==f&&(p.update(),s.set(p,f))}return v}function c(){s=new WeakMap}function u(d){const f=d.target;f.removeEventListener("dispose",u),t.remove(f.instanceMatrix),f.instanceColor!==null&&t.remove(f.instanceColor)}return{update:o,dispose:c}}class S0 extends In{constructor(e,t,i,s,o,c,u,d,f,m=Co){if(m!==Co&&m!==Do)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&m===Co&&(i=Ds),i===void 0&&m===Do&&(i=Io),super(null,s,o,c,u,d,m,i,f),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=u!==void 0?u:Ii,this.minFilter=d!==void 0?d:Ii,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const M0=new In,kg=new S0(1,1),E0=new h0,w0=new Ax,T0=new _0,Hg=[],Vg=[],Gg=new Float32Array(16),Wg=new Float32Array(9),Xg=new Float32Array(4);function Bo(a,e,t){const i=a[0];if(i<=0||i>0)return a;const s=e*t;let o=Hg[s];if(o===void 0&&(o=new Float32Array(s),Hg[s]=o),e!==0){i.toArray(o,0);for(let c=1,u=0;c!==e;++c)u+=t,a[c].toArray(o,u)}return o}function dn(a,e){if(a.length!==e.length)return!1;for(let t=0,i=a.length;t<i;t++)if(a[t]!==e[t])return!1;return!0}function fn(a,e){for(let t=0,i=e.length;t<i;t++)a[t]=e[t]}function jc(a,e){let t=Vg[e];t===void 0&&(t=new Int32Array(e),Vg[e]=t);for(let i=0;i!==e;++i)t[i]=a.allocateTextureUnit();return t}function kE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1f(this.addr,e),t[0]=e)}function HE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2fv(this.addr,e),fn(t,e)}}function VE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(a.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dn(t,e))return;a.uniform3fv(this.addr,e),fn(t,e)}}function GE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4fv(this.addr,e),fn(t,e)}}function WE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix2fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Xg.set(i),a.uniformMatrix2fv(this.addr,!1,Xg),fn(t,i)}}function XE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix3fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Wg.set(i),a.uniformMatrix3fv(this.addr,!1,Wg),fn(t,i)}}function jE(a,e){const t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;a.uniformMatrix4fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Gg.set(i),a.uniformMatrix4fv(this.addr,!1,Gg),fn(t,i)}}function qE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1i(this.addr,e),t[0]=e)}function YE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2iv(this.addr,e),fn(t,e)}}function $E(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;a.uniform3iv(this.addr,e),fn(t,e)}}function ZE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4iv(this.addr,e),fn(t,e)}}function KE(a,e){const t=this.cache;t[0]!==e&&(a.uniform1ui(this.addr,e),t[0]=e)}function QE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(a.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;a.uniform2uiv(this.addr,e),fn(t,e)}}function JE(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(a.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;a.uniform3uiv(this.addr,e),fn(t,e)}}function ew(a,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(a.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;a.uniform4uiv(this.addr,e),fn(t,e)}}function tw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s);let o;this.type===a.SAMPLER_2D_SHADOW?(kg.compareFunction=l0,o=kg):o=M0,t.setTexture2D(e||o,s)}function nw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||w0,s)}function iw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||T0,s)}function rw(a,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(a.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||E0,s)}function sw(a){switch(a){case 5126:return kE;case 35664:return HE;case 35665:return VE;case 35666:return GE;case 35674:return WE;case 35675:return XE;case 35676:return jE;case 5124:case 35670:return qE;case 35667:case 35671:return YE;case 35668:case 35672:return $E;case 35669:case 35673:return ZE;case 5125:return KE;case 36294:return QE;case 36295:return JE;case 36296:return ew;case 35678:case 36198:case 36298:case 36306:case 35682:return tw;case 35679:case 36299:case 36307:return nw;case 35680:case 36300:case 36308:case 36293:return iw;case 36289:case 36303:case 36311:case 36292:return rw}}function ow(a,e){a.uniform1fv(this.addr,e)}function aw(a,e){const t=Bo(e,this.size,2);a.uniform2fv(this.addr,t)}function lw(a,e){const t=Bo(e,this.size,3);a.uniform3fv(this.addr,t)}function cw(a,e){const t=Bo(e,this.size,4);a.uniform4fv(this.addr,t)}function uw(a,e){const t=Bo(e,this.size,4);a.uniformMatrix2fv(this.addr,!1,t)}function hw(a,e){const t=Bo(e,this.size,9);a.uniformMatrix3fv(this.addr,!1,t)}function dw(a,e){const t=Bo(e,this.size,16);a.uniformMatrix4fv(this.addr,!1,t)}function fw(a,e){a.uniform1iv(this.addr,e)}function pw(a,e){a.uniform2iv(this.addr,e)}function mw(a,e){a.uniform3iv(this.addr,e)}function gw(a,e){a.uniform4iv(this.addr,e)}function vw(a,e){a.uniform1uiv(this.addr,e)}function _w(a,e){a.uniform2uiv(this.addr,e)}function yw(a,e){a.uniform3uiv(this.addr,e)}function xw(a,e){a.uniform4uiv(this.addr,e)}function Sw(a,e,t){const i=this.cache,s=e.length,o=jc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture2D(e[c]||M0,o[c])}function Mw(a,e,t){const i=this.cache,s=e.length,o=jc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture3D(e[c]||w0,o[c])}function Ew(a,e,t){const i=this.cache,s=e.length,o=jc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTextureCube(e[c]||T0,o[c])}function ww(a,e,t){const i=this.cache,s=e.length,o=jc(t,s);dn(i,o)||(a.uniform1iv(this.addr,o),fn(i,o));for(let c=0;c!==s;++c)t.setTexture2DArray(e[c]||E0,o[c])}function Tw(a){switch(a){case 5126:return ow;case 35664:return aw;case 35665:return lw;case 35666:return cw;case 35674:return uw;case 35675:return hw;case 35676:return dw;case 5124:case 35670:return fw;case 35667:case 35671:return pw;case 35668:case 35672:return mw;case 35669:case 35673:return gw;case 5125:return vw;case 36294:return _w;case 36295:return yw;case 36296:return xw;case 35678:case 36198:case 36298:case 36306:case 35682:return Sw;case 35679:case 36299:case 36307:return Mw;case 35680:case 36300:case 36308:case 36293:return Ew;case 36289:case 36303:case 36311:case 36292:return ww}}class Aw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=sw(t.type)}}class Cw{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Tw(t.type)}}class Rw{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let o=0,c=s.length;o!==c;++o){const u=s[o];u.setValue(e,t[u.id],i)}}}const ad=/(\w+)(\])?(\[|\.)?/g;function jg(a,e){a.seq.push(e),a.map[e.id]=e}function bw(a,e,t){const i=a.name,s=i.length;for(ad.lastIndex=0;;){const o=ad.exec(i),c=ad.lastIndex;let u=o[1];const d=o[2]==="]",f=o[3];if(d&&(u=u|0),f===void 0||f==="["&&c+2===s){jg(t,f===void 0?new Aw(u,a,e):new Cw(u,a,e));break}else{let v=t.map[u];v===void 0&&(v=new Rw(u),jg(t,v)),t=v}}}class Dc{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const o=e.getActiveUniform(t,s),c=e.getUniformLocation(t,o.name);bw(o,c,this)}}setValue(e,t,i,s){const o=this.map[t];o!==void 0&&o.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let o=0,c=t.length;o!==c;++o){const u=t[o],d=i[u.id];d.needsUpdate!==!1&&u.setValue(e,d.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,o=e.length;s!==o;++s){const c=e[s];c.id in t&&i.push(c)}return i}}function qg(a,e,t){const i=a.createShader(e);return a.shaderSource(i,t),a.compileShader(i),i}const Pw=37297;let Lw=0;function Iw(a,e){const t=a.split(`
`),i=[],s=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let c=s;c<o;c++){const u=c+1;i.push(`${u===e?">":" "} ${u}: ${t[c]}`)}return i.join(`
`)}const Yg=new dt;function Dw(a){At._getMatrix(Yg,At.workingColorSpace,a);const e=`mat3( ${Yg.elements.map(t=>t.toFixed(4))} )`;switch(At.getTransfer(a)){case Gc:return[e,"LinearTransferOETF"];case Nt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",a),[e,"LinearTransferOETF"]}}function $g(a,e,t){const i=a.getShaderParameter(e,a.COMPILE_STATUS),s=a.getShaderInfoLog(e).trim();if(i&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const c=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+Iw(a.getShaderSource(e),c)}else return s}function Nw(a,e){const t=Dw(e);return[`vec4 ${a}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Uw(a,e){let t;switch(e){case Jy:t="Linear";break;case ex:t="Reinhard";break;case tx:t="Cineon";break;case nx:t="ACESFilmic";break;case rx:t="AgX";break;case sx:t="Neutral";break;case ix:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+a+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const mc=new Y;function Fw(){At.getLuminanceCoefficients(mc);const a=mc.x.toFixed(4),e=mc.y.toFixed(4),t=mc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${a}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ow(a){return[a.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",a.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ia).join(`
`)}function zw(a){const e=[];for(const t in a){const i=a[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Bw(a,e){const t={},i=a.getProgramParameter(e,a.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const o=a.getActiveAttrib(e,s),c=o.name;let u=1;o.type===a.FLOAT_MAT2&&(u=2),o.type===a.FLOAT_MAT3&&(u=3),o.type===a.FLOAT_MAT4&&(u=4),t[c]={type:o.type,location:a.getAttribLocation(e,c),locationSize:u}}return t}function Ia(a){return a!==""}function Zg(a,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return a.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Kg(a,e){return a.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const kw=/^[ \t]*#include +<([\w\d./]+)>/gm;function sf(a){return a.replace(kw,Vw)}const Hw=new Map;function Vw(a,e){let t=ft[e];if(t===void 0){const i=Hw.get(e);if(i!==void 0)t=ft[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return sf(t)}const Gw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qg(a){return a.replace(Gw,Ww)}function Ww(a,e,t,i){let s="";for(let o=parseInt(e);o<parseInt(t);o++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return s}function Jg(a){let e=`precision ${a.precision} float;
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
#define LOW_PRECISION`),e}function Xw(a){let e="SHADOWMAP_TYPE_BASIC";return a.shadowMapType===Yv?e="SHADOWMAP_TYPE_PCF":a.shadowMapType===Iy?e="SHADOWMAP_TYPE_PCF_SOFT":a.shadowMapType===fr&&(e="SHADOWMAP_TYPE_VSM"),e}function jw(a){let e="ENVMAP_TYPE_CUBE";if(a.envMap)switch(a.envMapMode){case Po:case Lo:e="ENVMAP_TYPE_CUBE";break;case Vc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function qw(a){let e="ENVMAP_MODE_REFLECTION";if(a.envMap)switch(a.envMapMode){case Lo:e="ENVMAP_MODE_REFRACTION";break}return e}function Yw(a){let e="ENVMAP_BLENDING_NONE";if(a.envMap)switch(a.combine){case $v:e="ENVMAP_BLENDING_MULTIPLY";break;case Ky:e="ENVMAP_BLENDING_MIX";break;case Qy:e="ENVMAP_BLENDING_ADD";break}return e}function $w(a){const e=a.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Zw(a,e,t,i){const s=a.getContext(),o=t.defines;let c=t.vertexShader,u=t.fragmentShader;const d=Xw(t),f=jw(t),m=qw(t),v=Yw(t),p=$w(t),y=Ow(t),M=zw(o),E=s.createProgram();let x,_,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Ia).join(`
`),x.length>0&&(x+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(Ia).join(`
`),_.length>0&&(_+=`
`)):(x=[Jg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+m:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ia).join(`
`),_=[Jg(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.envMap?"#define "+m:"",t.envMap?"#define "+v:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Kr?"#define TONE_MAPPING":"",t.toneMapping!==Kr?ft.tonemapping_pars_fragment:"",t.toneMapping!==Kr?Uw("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ft.colorspace_pars_fragment,Nw("linearToOutputTexel",t.outputColorSpace),Fw(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ia).join(`
`)),c=sf(c),c=Zg(c,t),c=Kg(c,t),u=sf(u),u=Zg(u,t),u=Kg(u,t),c=Qg(c),u=Qg(u),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,x=[y,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,_=["#define varying in",t.glslVersion===dg?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===dg?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);const A=w+x+c,T=w+_+u,U=qg(s,s.VERTEX_SHADER,A),D=qg(s,s.FRAGMENT_SHADER,T);s.attachShader(E,U),s.attachShader(E,D),t.index0AttributeName!==void 0?s.bindAttribLocation(E,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(E,0,"position"),s.linkProgram(E);function N(z){if(a.debug.checkShaderErrors){const K=s.getProgramInfoLog(E).trim(),B=s.getShaderInfoLog(U).trim(),j=s.getShaderInfoLog(D).trim();let q=!0,G=!0;if(s.getProgramParameter(E,s.LINK_STATUS)===!1)if(q=!1,typeof a.debug.onShaderError=="function")a.debug.onShaderError(s,E,U,D);else{const ne=$g(s,U,"vertex"),H=$g(s,D,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(E,s.VALIDATE_STATUS)+`

Material Name: `+z.name+`
Material Type: `+z.type+`

Program Info Log: `+K+`
`+ne+`
`+H)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(B===""||j==="")&&(G=!1);G&&(z.diagnostics={runnable:q,programLog:K,vertexShader:{log:B,prefix:x},fragmentShader:{log:j,prefix:_}})}s.deleteShader(U),s.deleteShader(D),O=new Dc(s,E),b=Bw(s,E)}let O;this.getUniforms=function(){return O===void 0&&N(this),O};let b;this.getAttributes=function(){return b===void 0&&N(this),b};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(E,Pw)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(E),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Lw++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=U,this.fragmentShader=D,this}let Kw=0;class Qw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),o=this._getShaderStage(i),c=this._getShaderCacheForMaterial(e);return c.has(s)===!1&&(c.add(s),s.usedTimes++),c.has(o)===!1&&(c.add(o),o.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Jw(e),t.set(e,i)),i}}class Jw{constructor(e){this.id=Kw++,this.code=e,this.usedTimes=0}}function e1(a,e,t,i,s,o,c){const u=new yf,d=new Qw,f=new Set,m=[],v=s.logarithmicDepthBuffer,p=s.vertexTextures;let y=s.precision;const M={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function E(b){return f.add(b),b===0?"uv":`uv${b}`}function x(b,C,z,K,B){const j=K.fog,q=B.geometry,G=b.isMeshStandardMaterial?K.environment:null,ne=(b.isMeshStandardMaterial?t:e).get(b.envMap||G),H=ne&&ne.mapping===Vc?ne.image.height:null,W=M[b.type];b.precision!==null&&(y=s.getMaxPrecision(b.precision),y!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",y,"instead."));const se=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,V=se!==void 0?se.length:0;let Z=0;q.morphAttributes.position!==void 0&&(Z=1),q.morphAttributes.normal!==void 0&&(Z=2),q.morphAttributes.color!==void 0&&(Z=3);let be,re,de,Me;if(W){const Et=Wi[W];be=Et.vertexShader,re=Et.fragmentShader}else be=b.vertexShader,re=b.fragmentShader,d.update(b),de=d.getVertexShaderID(b),Me=d.getFragmentShaderID(b);const _e=a.getRenderTarget(),Ce=a.state.buffers.depth.getReversed(),Oe=B.isInstancedMesh===!0,nt=B.isBatchedMesh===!0,Dt=!!b.map,yt=!!b.matcap,zt=!!ne,te=!!b.aoMap,Dn=!!b.lightMap,_t=!!b.bumpMap,mt=!!b.normalMap,Je=!!b.displacementMap,Lt=!!b.emissiveMap,Qe=!!b.metalnessMap,F=!!b.roughnessMap,L=b.anisotropy>0,ae=b.clearcoat>0,me=b.dispersion>0,ye=b.iridescence>0,fe=b.sheen>0,qe=b.transmission>0,Pe=L&&!!b.anisotropyMap,ze=ae&&!!b.clearcoatMap,pt=ae&&!!b.clearcoatNormalMap,Ee=ae&&!!b.clearcoatRoughnessMap,ke=ye&&!!b.iridescenceMap,it=ye&&!!b.iridescenceThicknessMap,rt=fe&&!!b.sheenColorMap,He=fe&&!!b.sheenRoughnessMap,gt=!!b.specularMap,ct=!!b.specularColorMap,Pt=!!b.specularIntensityMap,Q=qe&&!!b.transmissionMap,Le=qe&&!!b.thicknessMap,he=!!b.gradientMap,pe=!!b.alphaMap,De=b.alphaTest>0,Ie=!!b.alphaHash,ut=!!b.extensions;let Ht=Kr;b.toneMapped&&(_e===null||_e.isXRRenderTarget===!0)&&(Ht=a.toneMapping);const an={shaderID:W,shaderType:b.type,shaderName:b.name,vertexShader:be,fragmentShader:re,defines:b.defines,customVertexShaderID:de,customFragmentShaderID:Me,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:y,batching:nt,batchingColor:nt&&B._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&B.instanceColor!==null,instancingMorph:Oe&&B.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:_e===null?a.outputColorSpace:_e.isXRRenderTarget===!0?_e.texture.colorSpace:Uo,alphaToCoverage:!!b.alphaToCoverage,map:Dt,matcap:yt,envMap:zt,envMapMode:zt&&ne.mapping,envMapCubeUVHeight:H,aoMap:te,lightMap:Dn,bumpMap:_t,normalMap:mt,displacementMap:p&&Je,emissiveMap:Lt,normalMapObjectSpace:mt&&b.normalMapType===cx,normalMapTangentSpace:mt&&b.normalMapType===a0,metalnessMap:Qe,roughnessMap:F,anisotropy:L,anisotropyMap:Pe,clearcoat:ae,clearcoatMap:ze,clearcoatNormalMap:pt,clearcoatRoughnessMap:Ee,dispersion:me,iridescence:ye,iridescenceMap:ke,iridescenceThicknessMap:it,sheen:fe,sheenColorMap:rt,sheenRoughnessMap:He,specularMap:gt,specularColorMap:ct,specularIntensityMap:Pt,transmission:qe,transmissionMap:Q,thicknessMap:Le,gradientMap:he,opaque:b.transparent===!1&&b.blending===Ao&&b.alphaToCoverage===!1,alphaMap:pe,alphaTest:De,alphaHash:Ie,combine:b.combine,mapUv:Dt&&E(b.map.channel),aoMapUv:te&&E(b.aoMap.channel),lightMapUv:Dn&&E(b.lightMap.channel),bumpMapUv:_t&&E(b.bumpMap.channel),normalMapUv:mt&&E(b.normalMap.channel),displacementMapUv:Je&&E(b.displacementMap.channel),emissiveMapUv:Lt&&E(b.emissiveMap.channel),metalnessMapUv:Qe&&E(b.metalnessMap.channel),roughnessMapUv:F&&E(b.roughnessMap.channel),anisotropyMapUv:Pe&&E(b.anisotropyMap.channel),clearcoatMapUv:ze&&E(b.clearcoatMap.channel),clearcoatNormalMapUv:pt&&E(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&E(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ke&&E(b.iridescenceMap.channel),iridescenceThicknessMapUv:it&&E(b.iridescenceThicknessMap.channel),sheenColorMapUv:rt&&E(b.sheenColorMap.channel),sheenRoughnessMapUv:He&&E(b.sheenRoughnessMap.channel),specularMapUv:gt&&E(b.specularMap.channel),specularColorMapUv:ct&&E(b.specularColorMap.channel),specularIntensityMapUv:Pt&&E(b.specularIntensityMap.channel),transmissionMapUv:Q&&E(b.transmissionMap.channel),thicknessMapUv:Le&&E(b.thicknessMap.channel),alphaMapUv:pe&&E(b.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(mt||L),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!q.attributes.uv&&(Dt||pe),fog:!!j,useFog:b.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:v,reverseDepthBuffer:Ce,skinning:B.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:V,morphTextureStride:Z,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:b.dithering,shadowMapEnabled:a.shadowMap.enabled&&z.length>0,shadowMapType:a.shadowMap.type,toneMapping:Ht,decodeVideoTexture:Dt&&b.map.isVideoTexture===!0&&At.getTransfer(b.map.colorSpace)===Nt,decodeVideoTextureEmissive:Lt&&b.emissiveMap.isVideoTexture===!0&&At.getTransfer(b.emissiveMap.colorSpace)===Nt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Xi,flipSided:b.side===Kn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:ut&&b.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ut&&b.extensions.multiDraw===!0||nt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return an.vertexUv1s=f.has(1),an.vertexUv2s=f.has(2),an.vertexUv3s=f.has(3),f.clear(),an}function _(b){const C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(const z in b.defines)C.push(z),C.push(b.defines[z]);return b.isRawShaderMaterial===!1&&(w(C,b),A(C,b),C.push(a.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function w(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function A(b,C){u.disableAll(),C.supportsVertexTextures&&u.enable(0),C.instancing&&u.enable(1),C.instancingColor&&u.enable(2),C.instancingMorph&&u.enable(3),C.matcap&&u.enable(4),C.envMap&&u.enable(5),C.normalMapObjectSpace&&u.enable(6),C.normalMapTangentSpace&&u.enable(7),C.clearcoat&&u.enable(8),C.iridescence&&u.enable(9),C.alphaTest&&u.enable(10),C.vertexColors&&u.enable(11),C.vertexAlphas&&u.enable(12),C.vertexUv1s&&u.enable(13),C.vertexUv2s&&u.enable(14),C.vertexUv3s&&u.enable(15),C.vertexTangents&&u.enable(16),C.anisotropy&&u.enable(17),C.alphaHash&&u.enable(18),C.batching&&u.enable(19),C.dispersion&&u.enable(20),C.batchingColor&&u.enable(21),b.push(u.mask),u.disableAll(),C.fog&&u.enable(0),C.useFog&&u.enable(1),C.flatShading&&u.enable(2),C.logarithmicDepthBuffer&&u.enable(3),C.reverseDepthBuffer&&u.enable(4),C.skinning&&u.enable(5),C.morphTargets&&u.enable(6),C.morphNormals&&u.enable(7),C.morphColors&&u.enable(8),C.premultipliedAlpha&&u.enable(9),C.shadowMapEnabled&&u.enable(10),C.doubleSided&&u.enable(11),C.flipSided&&u.enable(12),C.useDepthPacking&&u.enable(13),C.dithering&&u.enable(14),C.transmission&&u.enable(15),C.sheen&&u.enable(16),C.opaque&&u.enable(17),C.pointsUvs&&u.enable(18),C.decodeVideoTexture&&u.enable(19),C.decodeVideoTextureEmissive&&u.enable(20),C.alphaToCoverage&&u.enable(21),b.push(u.mask)}function T(b){const C=M[b.type];let z;if(C){const K=Wi[C];z=g0.clone(K.uniforms)}else z=b.uniforms;return z}function U(b,C){let z;for(let K=0,B=m.length;K<B;K++){const j=m[K];if(j.cacheKey===C){z=j,++z.usedTimes;break}}return z===void 0&&(z=new Zw(a,C,b,o),m.push(z)),z}function D(b){if(--b.usedTimes===0){const C=m.indexOf(b);m[C]=m[m.length-1],m.pop(),b.destroy()}}function N(b){d.remove(b)}function O(){d.dispose()}return{getParameters:x,getProgramCacheKey:_,getUniforms:T,acquireProgram:U,releaseProgram:D,releaseShaderCache:N,programs:m,dispose:O}}function t1(){let a=new WeakMap;function e(c){return a.has(c)}function t(c){let u=a.get(c);return u===void 0&&(u={},a.set(c,u)),u}function i(c){a.delete(c)}function s(c,u,d){a.get(c)[u]=d}function o(){a=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:o}}function n1(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.material.id!==e.material.id?a.material.id-e.material.id:a.z!==e.z?a.z-e.z:a.id-e.id}function ev(a,e){return a.groupOrder!==e.groupOrder?a.groupOrder-e.groupOrder:a.renderOrder!==e.renderOrder?a.renderOrder-e.renderOrder:a.z!==e.z?e.z-a.z:a.id-e.id}function tv(){const a=[];let e=0;const t=[],i=[],s=[];function o(){e=0,t.length=0,i.length=0,s.length=0}function c(v,p,y,M,E,x){let _=a[e];return _===void 0?(_={id:v.id,object:v,geometry:p,material:y,groupOrder:M,renderOrder:v.renderOrder,z:E,group:x},a[e]=_):(_.id=v.id,_.object=v,_.geometry=p,_.material=y,_.groupOrder=M,_.renderOrder=v.renderOrder,_.z=E,_.group=x),e++,_}function u(v,p,y,M,E,x){const _=c(v,p,y,M,E,x);y.transmission>0?i.push(_):y.transparent===!0?s.push(_):t.push(_)}function d(v,p,y,M,E,x){const _=c(v,p,y,M,E,x);y.transmission>0?i.unshift(_):y.transparent===!0?s.unshift(_):t.unshift(_)}function f(v,p){t.length>1&&t.sort(v||n1),i.length>1&&i.sort(p||ev),s.length>1&&s.sort(p||ev)}function m(){for(let v=e,p=a.length;v<p;v++){const y=a[v];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:t,transmissive:i,transparent:s,init:o,push:u,unshift:d,finish:m,sort:f}}function i1(){let a=new WeakMap;function e(i,s){const o=a.get(i);let c;return o===void 0?(c=new tv,a.set(i,[c])):s>=o.length?(c=new tv,o.push(c)):c=o[s],c}function t(){a=new WeakMap}return{get:e,dispose:t}}function r1(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new Y,color:new at};break;case"SpotLight":t={position:new Y,direction:new Y,color:new at,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Y,color:new at,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Y,skyColor:new at,groundColor:new at};break;case"RectAreaLight":t={color:new at,position:new Y,halfWidth:new Y,halfHeight:new Y};break}return a[e.id]=t,t}}}function s1(){const a={};return{get:function(e){if(a[e.id]!==void 0)return a[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Mt,shadowCameraNear:1,shadowCameraFar:1e3};break}return a[e.id]=t,t}}}let o1=0;function a1(a,e){return(e.castShadow?2:0)-(a.castShadow?2:0)+(e.map?1:0)-(a.map?1:0)}function l1(a){const e=new r1,t=s1(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)i.probe.push(new Y);const s=new Y,o=new kt,c=new kt;function u(f){let m=0,v=0,p=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let y=0,M=0,E=0,x=0,_=0,w=0,A=0,T=0,U=0,D=0,N=0;f.sort(a1);for(let b=0,C=f.length;b<C;b++){const z=f[b],K=z.color,B=z.intensity,j=z.distance,q=z.shadow&&z.shadow.map?z.shadow.map.texture:null;if(z.isAmbientLight)m+=K.r*B,v+=K.g*B,p+=K.b*B;else if(z.isLightProbe){for(let G=0;G<9;G++)i.probe[G].addScaledVector(z.sh.coefficients[G],B);N++}else if(z.isDirectionalLight){const G=e.get(z);if(G.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){const ne=z.shadow,H=t.get(z);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,i.directionalShadow[y]=H,i.directionalShadowMap[y]=q,i.directionalShadowMatrix[y]=z.shadow.matrix,w++}i.directional[y]=G,y++}else if(z.isSpotLight){const G=e.get(z);G.position.setFromMatrixPosition(z.matrixWorld),G.color.copy(K).multiplyScalar(B),G.distance=j,G.coneCos=Math.cos(z.angle),G.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),G.decay=z.decay,i.spot[E]=G;const ne=z.shadow;if(z.map&&(i.spotLightMap[U]=z.map,U++,ne.updateMatrices(z),z.castShadow&&D++),i.spotLightMatrix[E]=ne.matrix,z.castShadow){const H=t.get(z);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,i.spotShadow[E]=H,i.spotShadowMap[E]=q,T++}E++}else if(z.isRectAreaLight){const G=e.get(z);G.color.copy(K).multiplyScalar(B),G.halfWidth.set(z.width*.5,0,0),G.halfHeight.set(0,z.height*.5,0),i.rectArea[x]=G,x++}else if(z.isPointLight){const G=e.get(z);if(G.color.copy(z.color).multiplyScalar(z.intensity),G.distance=z.distance,G.decay=z.decay,z.castShadow){const ne=z.shadow,H=t.get(z);H.shadowIntensity=ne.intensity,H.shadowBias=ne.bias,H.shadowNormalBias=ne.normalBias,H.shadowRadius=ne.radius,H.shadowMapSize=ne.mapSize,H.shadowCameraNear=ne.camera.near,H.shadowCameraFar=ne.camera.far,i.pointShadow[M]=H,i.pointShadowMap[M]=q,i.pointShadowMatrix[M]=z.shadow.matrix,A++}i.point[M]=G,M++}else if(z.isHemisphereLight){const G=e.get(z);G.skyColor.copy(z.color).multiplyScalar(B),G.groundColor.copy(z.groundColor).multiplyScalar(B),i.hemi[_]=G,_++}}x>0&&(a.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Re.LTC_FLOAT_1,i.rectAreaLTC2=Re.LTC_FLOAT_2):(i.rectAreaLTC1=Re.LTC_HALF_1,i.rectAreaLTC2=Re.LTC_HALF_2)),i.ambient[0]=m,i.ambient[1]=v,i.ambient[2]=p;const O=i.hash;(O.directionalLength!==y||O.pointLength!==M||O.spotLength!==E||O.rectAreaLength!==x||O.hemiLength!==_||O.numDirectionalShadows!==w||O.numPointShadows!==A||O.numSpotShadows!==T||O.numSpotMaps!==U||O.numLightProbes!==N)&&(i.directional.length=y,i.spot.length=E,i.rectArea.length=x,i.point.length=M,i.hemi.length=_,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=A,i.pointShadowMap.length=A,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=A,i.spotLightMatrix.length=T+U-D,i.spotLightMap.length=U,i.numSpotLightShadowsWithMaps=D,i.numLightProbes=N,O.directionalLength=y,O.pointLength=M,O.spotLength=E,O.rectAreaLength=x,O.hemiLength=_,O.numDirectionalShadows=w,O.numPointShadows=A,O.numSpotShadows=T,O.numSpotMaps=U,O.numLightProbes=N,i.version=o1++)}function d(f,m){let v=0,p=0,y=0,M=0,E=0;const x=m.matrixWorldInverse;for(let _=0,w=f.length;_<w;_++){const A=f[_];if(A.isDirectionalLight){const T=i.directional[v];T.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(x),v++}else if(A.isSpotLight){const T=i.spot[y];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(x),T.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(x),y++}else if(A.isRectAreaLight){const T=i.rectArea[M];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(x),c.identity(),o.copy(A.matrixWorld),o.premultiply(x),c.extractRotation(o),T.halfWidth.set(A.width*.5,0,0),T.halfHeight.set(0,A.height*.5,0),T.halfWidth.applyMatrix4(c),T.halfHeight.applyMatrix4(c),M++}else if(A.isPointLight){const T=i.point[p];T.position.setFromMatrixPosition(A.matrixWorld),T.position.applyMatrix4(x),p++}else if(A.isHemisphereLight){const T=i.hemi[E];T.direction.setFromMatrixPosition(A.matrixWorld),T.direction.transformDirection(x),E++}}}return{setup:u,setupView:d,state:i}}function nv(a){const e=new l1(a),t=[],i=[];function s(m){f.camera=m,t.length=0,i.length=0}function o(m){t.push(m)}function c(m){i.push(m)}function u(){e.setup(t)}function d(m){e.setupView(t,m)}const f={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:f,setupLights:u,setupLightsView:d,pushLight:o,pushShadow:c}}function c1(a){let e=new WeakMap;function t(s,o=0){const c=e.get(s);let u;return c===void 0?(u=new nv(a),e.set(s,[u])):o>=c.length?(u=new nv(a),c.push(u)):u=c[o],u}function i(){e=new WeakMap}return{get:t,dispose:i}}class u1 extends Oo{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=ax,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class h1 extends Oo{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const d1=`void main() {
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
}`;function p1(a,e,t){let i=new xf;const s=new Mt,o=new Mt,c=new Qt,u=new u1({depthPacking:lx}),d=new h1,f={},m=t.maxTextureSize,v={[Qr]:Kn,[Kn]:Qr,[Xi]:Xi},p=new Di({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Mt},radius:{value:4}},vertexShader:d1,fragmentShader:f1}),y=p.clone();y.defines.HORIZONTAL_PASS=1;const M=new Sn;M.setAttribute("position",new Qn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new Fe(M,p),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Yv;let _=this.type;this.render=function(D,N,O){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||D.length===0)return;const b=a.getRenderTarget(),C=a.getActiveCubeFace(),z=a.getActiveMipmapLevel(),K=a.state;K.setBlending(Zr),K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const B=_!==fr&&this.type===fr,j=_===fr&&this.type!==fr;for(let q=0,G=D.length;q<G;q++){const ne=D[q],H=ne.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const W=H.getFrameExtents();if(s.multiply(W),o.copy(H.mapSize),(s.x>m||s.y>m)&&(s.x>m&&(o.x=Math.floor(m/W.x),s.x=o.x*W.x,H.mapSize.x=o.x),s.y>m&&(o.y=Math.floor(m/W.y),s.y=o.y*W.y,H.mapSize.y=o.y)),H.map===null||B===!0||j===!0){const V=this.type!==fr?{minFilter:Ii,magFilter:Ii}:{};H.map!==null&&H.map.dispose(),H.map=new Ns(s.x,s.y,V),H.map.texture.name=ne.name+".shadowMap",H.camera.updateProjectionMatrix()}a.setRenderTarget(H.map),a.clear();const se=H.getViewportCount();for(let V=0;V<se;V++){const Z=H.getViewport(V);c.set(o.x*Z.x,o.y*Z.y,o.x*Z.z,o.y*Z.w),K.viewport(c),H.updateMatrices(ne,V),i=H.getFrustum(),T(N,O,H.camera,ne,this.type)}H.isPointLightShadow!==!0&&this.type===fr&&w(H,O),H.needsUpdate=!1}_=this.type,x.needsUpdate=!1,a.setRenderTarget(b,C,z)};function w(D,N){const O=e.update(E);p.defines.VSM_SAMPLES!==D.blurSamples&&(p.defines.VSM_SAMPLES=D.blurSamples,y.defines.VSM_SAMPLES=D.blurSamples,p.needsUpdate=!0,y.needsUpdate=!0),D.mapPass===null&&(D.mapPass=new Ns(s.x,s.y)),p.uniforms.shadow_pass.value=D.map.texture,p.uniforms.resolution.value=D.mapSize,p.uniforms.radius.value=D.radius,a.setRenderTarget(D.mapPass),a.clear(),a.renderBufferDirect(N,null,O,p,E,null),y.uniforms.shadow_pass.value=D.mapPass.texture,y.uniforms.resolution.value=D.mapSize,y.uniforms.radius.value=D.radius,a.setRenderTarget(D.map),a.clear(),a.renderBufferDirect(N,null,O,y,E,null)}function A(D,N,O,b){let C=null;const z=O.isPointLight===!0?D.customDistanceMaterial:D.customDepthMaterial;if(z!==void 0)C=z;else if(C=O.isPointLight===!0?d:u,a.localClippingEnabled&&N.clipShadows===!0&&Array.isArray(N.clippingPlanes)&&N.clippingPlanes.length!==0||N.displacementMap&&N.displacementScale!==0||N.alphaMap&&N.alphaTest>0||N.map&&N.alphaTest>0){const K=C.uuid,B=N.uuid;let j=f[K];j===void 0&&(j={},f[K]=j);let q=j[B];q===void 0&&(q=C.clone(),j[B]=q,N.addEventListener("dispose",U)),C=q}if(C.visible=N.visible,C.wireframe=N.wireframe,b===fr?C.side=N.shadowSide!==null?N.shadowSide:N.side:C.side=N.shadowSide!==null?N.shadowSide:v[N.side],C.alphaMap=N.alphaMap,C.alphaTest=N.alphaTest,C.map=N.map,C.clipShadows=N.clipShadows,C.clippingPlanes=N.clippingPlanes,C.clipIntersection=N.clipIntersection,C.displacementMap=N.displacementMap,C.displacementScale=N.displacementScale,C.displacementBias=N.displacementBias,C.wireframeLinewidth=N.wireframeLinewidth,C.linewidth=N.linewidth,O.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const K=a.properties.get(C);K.light=O}return C}function T(D,N,O,b,C){if(D.visible===!1)return;if(D.layers.test(N.layers)&&(D.isMesh||D.isLine||D.isPoints)&&(D.castShadow||D.receiveShadow&&C===fr)&&(!D.frustumCulled||i.intersectsObject(D))){D.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,D.matrixWorld);const B=e.update(D),j=D.material;if(Array.isArray(j)){const q=B.groups;for(let G=0,ne=q.length;G<ne;G++){const H=q[G],W=j[H.materialIndex];if(W&&W.visible){const se=A(D,W,b,C);D.onBeforeShadow(a,D,N,O,B,se,H),a.renderBufferDirect(O,null,B,se,D,H),D.onAfterShadow(a,D,N,O,B,se,H)}}}else if(j.visible){const q=A(D,j,b,C);D.onBeforeShadow(a,D,N,O,B,q,null),a.renderBufferDirect(O,null,B,q,D,null),D.onAfterShadow(a,D,N,O,B,q,null)}}const K=D.children;for(let B=0,j=K.length;B<j;B++)T(K[B],N,O,b,C)}function U(D){D.target.removeEventListener("dispose",U);for(const O in f){const b=f[O],C=D.target.uuid;C in b&&(b[C].dispose(),delete b[C])}}}const m1={[Sd]:Md,[Ed]:Ad,[wd]:Cd,[bo]:Td,[Md]:Sd,[Ad]:Ed,[Cd]:wd,[Td]:bo};function g1(a,e){function t(){let Q=!1;const Le=new Qt;let he=null;const pe=new Qt(0,0,0,0);return{setMask:function(De){he!==De&&!Q&&(a.colorMask(De,De,De,De),he=De)},setLocked:function(De){Q=De},setClear:function(De,Ie,ut,Ht,an){an===!0&&(De*=Ht,Ie*=Ht,ut*=Ht),Le.set(De,Ie,ut,Ht),pe.equals(Le)===!1&&(a.clearColor(De,Ie,ut,Ht),pe.copy(Le))},reset:function(){Q=!1,he=null,pe.set(-1,0,0,0)}}}function i(){let Q=!1,Le=!1,he=null,pe=null,De=null;return{setReversed:function(Ie){if(Le!==Ie){const ut=e.get("EXT_clip_control");Le?ut.clipControlEXT(ut.LOWER_LEFT_EXT,ut.ZERO_TO_ONE_EXT):ut.clipControlEXT(ut.LOWER_LEFT_EXT,ut.NEGATIVE_ONE_TO_ONE_EXT);const Ht=De;De=null,this.setClear(Ht)}Le=Ie},getReversed:function(){return Le},setTest:function(Ie){Ie?_e(a.DEPTH_TEST):Ce(a.DEPTH_TEST)},setMask:function(Ie){he!==Ie&&!Q&&(a.depthMask(Ie),he=Ie)},setFunc:function(Ie){if(Le&&(Ie=m1[Ie]),pe!==Ie){switch(Ie){case Sd:a.depthFunc(a.NEVER);break;case Md:a.depthFunc(a.ALWAYS);break;case Ed:a.depthFunc(a.LESS);break;case bo:a.depthFunc(a.LEQUAL);break;case wd:a.depthFunc(a.EQUAL);break;case Td:a.depthFunc(a.GEQUAL);break;case Ad:a.depthFunc(a.GREATER);break;case Cd:a.depthFunc(a.NOTEQUAL);break;default:a.depthFunc(a.LEQUAL)}pe=Ie}},setLocked:function(Ie){Q=Ie},setClear:function(Ie){De!==Ie&&(Le&&(Ie=1-Ie),a.clearDepth(Ie),De=Ie)},reset:function(){Q=!1,he=null,pe=null,De=null,Le=!1}}}function s(){let Q=!1,Le=null,he=null,pe=null,De=null,Ie=null,ut=null,Ht=null,an=null;return{setTest:function(Et){Q||(Et?_e(a.STENCIL_TEST):Ce(a.STENCIL_TEST))},setMask:function(Et){Le!==Et&&!Q&&(a.stencilMask(Et),Le=Et)},setFunc:function(Et,kn,Nn){(he!==Et||pe!==kn||De!==Nn)&&(a.stencilFunc(Et,kn,Nn),he=Et,pe=kn,De=Nn)},setOp:function(Et,kn,Nn){(Ie!==Et||ut!==kn||Ht!==Nn)&&(a.stencilOp(Et,kn,Nn),Ie=Et,ut=kn,Ht=Nn)},setLocked:function(Et){Q=Et},setClear:function(Et){an!==Et&&(a.clearStencil(Et),an=Et)},reset:function(){Q=!1,Le=null,he=null,pe=null,De=null,Ie=null,ut=null,Ht=null,an=null}}}const o=new t,c=new i,u=new s,d=new WeakMap,f=new WeakMap;let m={},v={},p=new WeakMap,y=[],M=null,E=!1,x=null,_=null,w=null,A=null,T=null,U=null,D=null,N=new at(0,0,0),O=0,b=!1,C=null,z=null,K=null,B=null,j=null;const q=a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,ne=0;const H=a.getParameter(a.VERSION);H.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(H)[1]),G=ne>=1):H.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),G=ne>=2);let W=null,se={};const V=a.getParameter(a.SCISSOR_BOX),Z=a.getParameter(a.VIEWPORT),be=new Qt().fromArray(V),re=new Qt().fromArray(Z);function de(Q,Le,he,pe){const De=new Uint8Array(4),Ie=a.createTexture();a.bindTexture(Q,Ie),a.texParameteri(Q,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(Q,a.TEXTURE_MAG_FILTER,a.NEAREST);for(let ut=0;ut<he;ut++)Q===a.TEXTURE_3D||Q===a.TEXTURE_2D_ARRAY?a.texImage3D(Le,0,a.RGBA,1,1,pe,0,a.RGBA,a.UNSIGNED_BYTE,De):a.texImage2D(Le+ut,0,a.RGBA,1,1,0,a.RGBA,a.UNSIGNED_BYTE,De);return Ie}const Me={};Me[a.TEXTURE_2D]=de(a.TEXTURE_2D,a.TEXTURE_2D,1),Me[a.TEXTURE_CUBE_MAP]=de(a.TEXTURE_CUBE_MAP,a.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[a.TEXTURE_2D_ARRAY]=de(a.TEXTURE_2D_ARRAY,a.TEXTURE_2D_ARRAY,1,1),Me[a.TEXTURE_3D]=de(a.TEXTURE_3D,a.TEXTURE_3D,1,1),o.setClear(0,0,0,1),c.setClear(1),u.setClear(0),_e(a.DEPTH_TEST),c.setFunc(bo),_t(!1),mt(og),_e(a.CULL_FACE),te(Zr);function _e(Q){m[Q]!==!0&&(a.enable(Q),m[Q]=!0)}function Ce(Q){m[Q]!==!1&&(a.disable(Q),m[Q]=!1)}function Oe(Q,Le){return v[Q]!==Le?(a.bindFramebuffer(Q,Le),v[Q]=Le,Q===a.DRAW_FRAMEBUFFER&&(v[a.FRAMEBUFFER]=Le),Q===a.FRAMEBUFFER&&(v[a.DRAW_FRAMEBUFFER]=Le),!0):!1}function nt(Q,Le){let he=y,pe=!1;if(Q){he=p.get(Le),he===void 0&&(he=[],p.set(Le,he));const De=Q.textures;if(he.length!==De.length||he[0]!==a.COLOR_ATTACHMENT0){for(let Ie=0,ut=De.length;Ie<ut;Ie++)he[Ie]=a.COLOR_ATTACHMENT0+Ie;he.length=De.length,pe=!0}}else he[0]!==a.BACK&&(he[0]=a.BACK,pe=!0);pe&&a.drawBuffers(he)}function Dt(Q){return M!==Q?(a.useProgram(Q),M=Q,!0):!1}const yt={[As]:a.FUNC_ADD,[Ny]:a.FUNC_SUBTRACT,[Uy]:a.FUNC_REVERSE_SUBTRACT};yt[Fy]=a.MIN,yt[Oy]=a.MAX;const zt={[zy]:a.ZERO,[By]:a.ONE,[ky]:a.SRC_COLOR,[yd]:a.SRC_ALPHA,[jy]:a.SRC_ALPHA_SATURATE,[Wy]:a.DST_COLOR,[Vy]:a.DST_ALPHA,[Hy]:a.ONE_MINUS_SRC_COLOR,[xd]:a.ONE_MINUS_SRC_ALPHA,[Xy]:a.ONE_MINUS_DST_COLOR,[Gy]:a.ONE_MINUS_DST_ALPHA,[qy]:a.CONSTANT_COLOR,[Yy]:a.ONE_MINUS_CONSTANT_COLOR,[$y]:a.CONSTANT_ALPHA,[Zy]:a.ONE_MINUS_CONSTANT_ALPHA};function te(Q,Le,he,pe,De,Ie,ut,Ht,an,Et){if(Q===Zr){E===!0&&(Ce(a.BLEND),E=!1);return}if(E===!1&&(_e(a.BLEND),E=!0),Q!==Dy){if(Q!==x||Et!==b){if((_!==As||T!==As)&&(a.blendEquation(a.FUNC_ADD),_=As,T=As),Et)switch(Q){case Ao:a.blendFuncSeparate(a.ONE,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ag:a.blendFunc(a.ONE,a.ONE);break;case lg:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case cg:a.blendFuncSeparate(a.ZERO,a.SRC_COLOR,a.ZERO,a.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",Q);break}else switch(Q){case Ao:a.blendFuncSeparate(a.SRC_ALPHA,a.ONE_MINUS_SRC_ALPHA,a.ONE,a.ONE_MINUS_SRC_ALPHA);break;case ag:a.blendFunc(a.SRC_ALPHA,a.ONE);break;case lg:a.blendFuncSeparate(a.ZERO,a.ONE_MINUS_SRC_COLOR,a.ZERO,a.ONE);break;case cg:a.blendFunc(a.ZERO,a.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",Q);break}w=null,A=null,U=null,D=null,N.set(0,0,0),O=0,x=Q,b=Et}return}De=De||Le,Ie=Ie||he,ut=ut||pe,(Le!==_||De!==T)&&(a.blendEquationSeparate(yt[Le],yt[De]),_=Le,T=De),(he!==w||pe!==A||Ie!==U||ut!==D)&&(a.blendFuncSeparate(zt[he],zt[pe],zt[Ie],zt[ut]),w=he,A=pe,U=Ie,D=ut),(Ht.equals(N)===!1||an!==O)&&(a.blendColor(Ht.r,Ht.g,Ht.b,an),N.copy(Ht),O=an),x=Q,b=!1}function Dn(Q,Le){Q.side===Xi?Ce(a.CULL_FACE):_e(a.CULL_FACE);let he=Q.side===Kn;Le&&(he=!he),_t(he),Q.blending===Ao&&Q.transparent===!1?te(Zr):te(Q.blending,Q.blendEquation,Q.blendSrc,Q.blendDst,Q.blendEquationAlpha,Q.blendSrcAlpha,Q.blendDstAlpha,Q.blendColor,Q.blendAlpha,Q.premultipliedAlpha),c.setFunc(Q.depthFunc),c.setTest(Q.depthTest),c.setMask(Q.depthWrite),o.setMask(Q.colorWrite);const pe=Q.stencilWrite;u.setTest(pe),pe&&(u.setMask(Q.stencilWriteMask),u.setFunc(Q.stencilFunc,Q.stencilRef,Q.stencilFuncMask),u.setOp(Q.stencilFail,Q.stencilZFail,Q.stencilZPass)),Lt(Q.polygonOffset,Q.polygonOffsetFactor,Q.polygonOffsetUnits),Q.alphaToCoverage===!0?_e(a.SAMPLE_ALPHA_TO_COVERAGE):Ce(a.SAMPLE_ALPHA_TO_COVERAGE)}function _t(Q){C!==Q&&(Q?a.frontFace(a.CW):a.frontFace(a.CCW),C=Q)}function mt(Q){Q!==Py?(_e(a.CULL_FACE),Q!==z&&(Q===og?a.cullFace(a.BACK):Q===Ly?a.cullFace(a.FRONT):a.cullFace(a.FRONT_AND_BACK))):Ce(a.CULL_FACE),z=Q}function Je(Q){Q!==K&&(G&&a.lineWidth(Q),K=Q)}function Lt(Q,Le,he){Q?(_e(a.POLYGON_OFFSET_FILL),(B!==Le||j!==he)&&(a.polygonOffset(Le,he),B=Le,j=he)):Ce(a.POLYGON_OFFSET_FILL)}function Qe(Q){Q?_e(a.SCISSOR_TEST):Ce(a.SCISSOR_TEST)}function F(Q){Q===void 0&&(Q=a.TEXTURE0+q-1),W!==Q&&(a.activeTexture(Q),W=Q)}function L(Q,Le,he){he===void 0&&(W===null?he=a.TEXTURE0+q-1:he=W);let pe=se[he];pe===void 0&&(pe={type:void 0,texture:void 0},se[he]=pe),(pe.type!==Q||pe.texture!==Le)&&(W!==he&&(a.activeTexture(he),W=he),a.bindTexture(Q,Le||Me[Q]),pe.type=Q,pe.texture=Le)}function ae(){const Q=se[W];Q!==void 0&&Q.type!==void 0&&(a.bindTexture(Q.type,null),Q.type=void 0,Q.texture=void 0)}function me(){try{a.compressedTexImage2D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function ye(){try{a.compressedTexImage3D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function fe(){try{a.texSubImage2D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function qe(){try{a.texSubImage3D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function Pe(){try{a.compressedTexSubImage2D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function ze(){try{a.compressedTexSubImage3D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function pt(){try{a.texStorage2D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function Ee(){try{a.texStorage3D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function ke(){try{a.texImage2D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function it(){try{a.texImage3D.apply(a,arguments)}catch(Q){console.error("THREE.WebGLState:",Q)}}function rt(Q){be.equals(Q)===!1&&(a.scissor(Q.x,Q.y,Q.z,Q.w),be.copy(Q))}function He(Q){re.equals(Q)===!1&&(a.viewport(Q.x,Q.y,Q.z,Q.w),re.copy(Q))}function gt(Q,Le){let he=f.get(Le);he===void 0&&(he=new WeakMap,f.set(Le,he));let pe=he.get(Q);pe===void 0&&(pe=a.getUniformBlockIndex(Le,Q.name),he.set(Q,pe))}function ct(Q,Le){const pe=f.get(Le).get(Q);d.get(Le)!==pe&&(a.uniformBlockBinding(Le,pe,Q.__bindingPointIndex),d.set(Le,pe))}function Pt(){a.disable(a.BLEND),a.disable(a.CULL_FACE),a.disable(a.DEPTH_TEST),a.disable(a.POLYGON_OFFSET_FILL),a.disable(a.SCISSOR_TEST),a.disable(a.STENCIL_TEST),a.disable(a.SAMPLE_ALPHA_TO_COVERAGE),a.blendEquation(a.FUNC_ADD),a.blendFunc(a.ONE,a.ZERO),a.blendFuncSeparate(a.ONE,a.ZERO,a.ONE,a.ZERO),a.blendColor(0,0,0,0),a.colorMask(!0,!0,!0,!0),a.clearColor(0,0,0,0),a.depthMask(!0),a.depthFunc(a.LESS),c.setReversed(!1),a.clearDepth(1),a.stencilMask(4294967295),a.stencilFunc(a.ALWAYS,0,4294967295),a.stencilOp(a.KEEP,a.KEEP,a.KEEP),a.clearStencil(0),a.cullFace(a.BACK),a.frontFace(a.CCW),a.polygonOffset(0,0),a.activeTexture(a.TEXTURE0),a.bindFramebuffer(a.FRAMEBUFFER,null),a.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),a.bindFramebuffer(a.READ_FRAMEBUFFER,null),a.useProgram(null),a.lineWidth(1),a.scissor(0,0,a.canvas.width,a.canvas.height),a.viewport(0,0,a.canvas.width,a.canvas.height),m={},W=null,se={},v={},p=new WeakMap,y=[],M=null,E=!1,x=null,_=null,w=null,A=null,T=null,U=null,D=null,N=new at(0,0,0),O=0,b=!1,C=null,z=null,K=null,B=null,j=null,be.set(0,0,a.canvas.width,a.canvas.height),re.set(0,0,a.canvas.width,a.canvas.height),o.reset(),c.reset(),u.reset()}return{buffers:{color:o,depth:c,stencil:u},enable:_e,disable:Ce,bindFramebuffer:Oe,drawBuffers:nt,useProgram:Dt,setBlending:te,setMaterial:Dn,setFlipSided:_t,setCullFace:mt,setLineWidth:Je,setPolygonOffset:Lt,setScissorTest:Qe,activeTexture:F,bindTexture:L,unbindTexture:ae,compressedTexImage2D:me,compressedTexImage3D:ye,texImage2D:ke,texImage3D:it,updateUBOMapping:gt,uniformBlockBinding:ct,texStorage2D:pt,texStorage3D:Ee,texSubImage2D:fe,texSubImage3D:qe,compressedTexSubImage2D:Pe,compressedTexSubImage3D:ze,scissor:rt,viewport:He,reset:Pt}}function iv(a,e,t,i){const s=v1(i);switch(t){case e0:return a*e;case n0:return a*e;case i0:return a*e*2;case r0:return a*e/s.components*s.byteLength;case mf:return a*e/s.components*s.byteLength;case s0:return a*e*2/s.components*s.byteLength;case gf:return a*e*2/s.components*s.byteLength;case t0:return a*e*3/s.components*s.byteLength;case Pi:return a*e*4/s.components*s.byteLength;case vf:return a*e*4/s.components*s.byteLength;case Rc:case bc:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Pc:case Lc:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Id:case Nd:return Math.max(a,16)*Math.max(e,8)/4;case Ld:case Dd:return Math.max(a,8)*Math.max(e,8)/2;case Ud:case Fd:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*8;case Od:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case zd:return Math.floor((a+3)/4)*Math.floor((e+3)/4)*16;case Bd:return Math.floor((a+4)/5)*Math.floor((e+3)/4)*16;case kd:return Math.floor((a+4)/5)*Math.floor((e+4)/5)*16;case Hd:return Math.floor((a+5)/6)*Math.floor((e+4)/5)*16;case Vd:return Math.floor((a+5)/6)*Math.floor((e+5)/6)*16;case Gd:return Math.floor((a+7)/8)*Math.floor((e+4)/5)*16;case Wd:return Math.floor((a+7)/8)*Math.floor((e+5)/6)*16;case Xd:return Math.floor((a+7)/8)*Math.floor((e+7)/8)*16;case jd:return Math.floor((a+9)/10)*Math.floor((e+4)/5)*16;case qd:return Math.floor((a+9)/10)*Math.floor((e+5)/6)*16;case Yd:return Math.floor((a+9)/10)*Math.floor((e+7)/8)*16;case $d:return Math.floor((a+9)/10)*Math.floor((e+9)/10)*16;case Zd:return Math.floor((a+11)/12)*Math.floor((e+9)/10)*16;case Kd:return Math.floor((a+11)/12)*Math.floor((e+11)/12)*16;case Ic:case Qd:case Jd:return Math.ceil(a/4)*Math.ceil(e/4)*16;case o0:case ef:return Math.ceil(a/4)*Math.ceil(e/4)*8;case tf:case nf:return Math.ceil(a/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function v1(a){switch(a){case yr:case Kv:return{byteLength:1,components:1};case Fa:case Qv:case Ba:return{byteLength:2,components:1};case ff:case pf:return{byteLength:2,components:4};case Ds:case df:case gr:return{byteLength:4,components:1};case Jv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${a}.`)}function _1(a,e,t,i,s,o,c){const u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new Mt,m=new WeakMap;let v;const p=new WeakMap;let y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(F,L){return y?new OffscreenCanvas(F,L):Oa("canvas")}function E(F,L,ae){let me=1;const ye=Qe(F);if((ye.width>ae||ye.height>ae)&&(me=ae/Math.max(ye.width,ye.height)),me<1)if(typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&F instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&F instanceof ImageBitmap||typeof VideoFrame<"u"&&F instanceof VideoFrame){const fe=Math.floor(me*ye.width),qe=Math.floor(me*ye.height);v===void 0&&(v=M(fe,qe));const Pe=L?M(fe,qe):v;return Pe.width=fe,Pe.height=qe,Pe.getContext("2d").drawImage(F,0,0,fe,qe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ye.width+"x"+ye.height+") to ("+fe+"x"+qe+")."),Pe}else return"data"in F&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ye.width+"x"+ye.height+")."),F;return F}function x(F){return F.generateMipmaps}function _(F){a.generateMipmap(F)}function w(F){return F.isWebGLCubeRenderTarget?a.TEXTURE_CUBE_MAP:F.isWebGL3DRenderTarget?a.TEXTURE_3D:F.isWebGLArrayRenderTarget||F.isCompressedArrayTexture?a.TEXTURE_2D_ARRAY:a.TEXTURE_2D}function A(F,L,ae,me,ye=!1){if(F!==null){if(a[F]!==void 0)return a[F];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+F+"'")}let fe=L;if(L===a.RED&&(ae===a.FLOAT&&(fe=a.R32F),ae===a.HALF_FLOAT&&(fe=a.R16F),ae===a.UNSIGNED_BYTE&&(fe=a.R8)),L===a.RED_INTEGER&&(ae===a.UNSIGNED_BYTE&&(fe=a.R8UI),ae===a.UNSIGNED_SHORT&&(fe=a.R16UI),ae===a.UNSIGNED_INT&&(fe=a.R32UI),ae===a.BYTE&&(fe=a.R8I),ae===a.SHORT&&(fe=a.R16I),ae===a.INT&&(fe=a.R32I)),L===a.RG&&(ae===a.FLOAT&&(fe=a.RG32F),ae===a.HALF_FLOAT&&(fe=a.RG16F),ae===a.UNSIGNED_BYTE&&(fe=a.RG8)),L===a.RG_INTEGER&&(ae===a.UNSIGNED_BYTE&&(fe=a.RG8UI),ae===a.UNSIGNED_SHORT&&(fe=a.RG16UI),ae===a.UNSIGNED_INT&&(fe=a.RG32UI),ae===a.BYTE&&(fe=a.RG8I),ae===a.SHORT&&(fe=a.RG16I),ae===a.INT&&(fe=a.RG32I)),L===a.RGB_INTEGER&&(ae===a.UNSIGNED_BYTE&&(fe=a.RGB8UI),ae===a.UNSIGNED_SHORT&&(fe=a.RGB16UI),ae===a.UNSIGNED_INT&&(fe=a.RGB32UI),ae===a.BYTE&&(fe=a.RGB8I),ae===a.SHORT&&(fe=a.RGB16I),ae===a.INT&&(fe=a.RGB32I)),L===a.RGBA_INTEGER&&(ae===a.UNSIGNED_BYTE&&(fe=a.RGBA8UI),ae===a.UNSIGNED_SHORT&&(fe=a.RGBA16UI),ae===a.UNSIGNED_INT&&(fe=a.RGBA32UI),ae===a.BYTE&&(fe=a.RGBA8I),ae===a.SHORT&&(fe=a.RGBA16I),ae===a.INT&&(fe=a.RGBA32I)),L===a.RGB&&ae===a.UNSIGNED_INT_5_9_9_9_REV&&(fe=a.RGB9_E5),L===a.RGBA){const qe=ye?Gc:At.getTransfer(me);ae===a.FLOAT&&(fe=a.RGBA32F),ae===a.HALF_FLOAT&&(fe=a.RGBA16F),ae===a.UNSIGNED_BYTE&&(fe=qe===Nt?a.SRGB8_ALPHA8:a.RGBA8),ae===a.UNSIGNED_SHORT_4_4_4_4&&(fe=a.RGBA4),ae===a.UNSIGNED_SHORT_5_5_5_1&&(fe=a.RGB5_A1)}return(fe===a.R16F||fe===a.R32F||fe===a.RG16F||fe===a.RG32F||fe===a.RGBA16F||fe===a.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function T(F,L){let ae;return F?L===null||L===Ds||L===Io?ae=a.DEPTH24_STENCIL8:L===gr?ae=a.DEPTH32F_STENCIL8:L===Fa&&(ae=a.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):L===null||L===Ds||L===Io?ae=a.DEPTH_COMPONENT24:L===gr?ae=a.DEPTH_COMPONENT32F:L===Fa&&(ae=a.DEPTH_COMPONENT16),ae}function U(F,L){return x(F)===!0||F.isFramebufferTexture&&F.minFilter!==Ii&&F.minFilter!==ji?Math.log2(Math.max(L.width,L.height))+1:F.mipmaps!==void 0&&F.mipmaps.length>0?F.mipmaps.length:F.isCompressedTexture&&Array.isArray(F.image)?L.mipmaps.length:1}function D(F){const L=F.target;L.removeEventListener("dispose",D),O(L),L.isVideoTexture&&m.delete(L)}function N(F){const L=F.target;L.removeEventListener("dispose",N),C(L)}function O(F){const L=i.get(F);if(L.__webglInit===void 0)return;const ae=F.source,me=p.get(ae);if(me){const ye=me[L.__cacheKey];ye.usedTimes--,ye.usedTimes===0&&b(F),Object.keys(me).length===0&&p.delete(ae)}i.remove(F)}function b(F){const L=i.get(F);a.deleteTexture(L.__webglTexture);const ae=F.source,me=p.get(ae);delete me[L.__cacheKey],c.memory.textures--}function C(F){const L=i.get(F);if(F.depthTexture&&(F.depthTexture.dispose(),i.remove(F.depthTexture)),F.isWebGLCubeRenderTarget)for(let me=0;me<6;me++){if(Array.isArray(L.__webglFramebuffer[me]))for(let ye=0;ye<L.__webglFramebuffer[me].length;ye++)a.deleteFramebuffer(L.__webglFramebuffer[me][ye]);else a.deleteFramebuffer(L.__webglFramebuffer[me]);L.__webglDepthbuffer&&a.deleteRenderbuffer(L.__webglDepthbuffer[me])}else{if(Array.isArray(L.__webglFramebuffer))for(let me=0;me<L.__webglFramebuffer.length;me++)a.deleteFramebuffer(L.__webglFramebuffer[me]);else a.deleteFramebuffer(L.__webglFramebuffer);if(L.__webglDepthbuffer&&a.deleteRenderbuffer(L.__webglDepthbuffer),L.__webglMultisampledFramebuffer&&a.deleteFramebuffer(L.__webglMultisampledFramebuffer),L.__webglColorRenderbuffer)for(let me=0;me<L.__webglColorRenderbuffer.length;me++)L.__webglColorRenderbuffer[me]&&a.deleteRenderbuffer(L.__webglColorRenderbuffer[me]);L.__webglDepthRenderbuffer&&a.deleteRenderbuffer(L.__webglDepthRenderbuffer)}const ae=F.textures;for(let me=0,ye=ae.length;me<ye;me++){const fe=i.get(ae[me]);fe.__webglTexture&&(a.deleteTexture(fe.__webglTexture),c.memory.textures--),i.remove(ae[me])}i.remove(F)}let z=0;function K(){z=0}function B(){const F=z;return F>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+F+" texture units while this GPU supports only "+s.maxTextures),z+=1,F}function j(F){const L=[];return L.push(F.wrapS),L.push(F.wrapT),L.push(F.wrapR||0),L.push(F.magFilter),L.push(F.minFilter),L.push(F.anisotropy),L.push(F.internalFormat),L.push(F.format),L.push(F.type),L.push(F.generateMipmaps),L.push(F.premultiplyAlpha),L.push(F.flipY),L.push(F.unpackAlignment),L.push(F.colorSpace),L.join()}function q(F,L){const ae=i.get(F);if(F.isVideoTexture&&Je(F),F.isRenderTargetTexture===!1&&F.version>0&&ae.__version!==F.version){const me=F.image;if(me===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(me.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{re(ae,F,L);return}}t.bindTexture(a.TEXTURE_2D,ae.__webglTexture,a.TEXTURE0+L)}function G(F,L){const ae=i.get(F);if(F.version>0&&ae.__version!==F.version){re(ae,F,L);return}t.bindTexture(a.TEXTURE_2D_ARRAY,ae.__webglTexture,a.TEXTURE0+L)}function ne(F,L){const ae=i.get(F);if(F.version>0&&ae.__version!==F.version){re(ae,F,L);return}t.bindTexture(a.TEXTURE_3D,ae.__webglTexture,a.TEXTURE0+L)}function H(F,L){const ae=i.get(F);if(F.version>0&&ae.__version!==F.version){de(ae,F,L);return}t.bindTexture(a.TEXTURE_CUBE_MAP,ae.__webglTexture,a.TEXTURE0+L)}const W={[Is]:a.REPEAT,[Ps]:a.CLAMP_TO_EDGE,[Pd]:a.MIRRORED_REPEAT},se={[Ii]:a.NEAREST,[ox]:a.NEAREST_MIPMAP_NEAREST,[$l]:a.NEAREST_MIPMAP_LINEAR,[ji]:a.LINEAR,[Dh]:a.LINEAR_MIPMAP_NEAREST,[Ls]:a.LINEAR_MIPMAP_LINEAR},V={[ux]:a.NEVER,[gx]:a.ALWAYS,[hx]:a.LESS,[l0]:a.LEQUAL,[dx]:a.EQUAL,[mx]:a.GEQUAL,[fx]:a.GREATER,[px]:a.NOTEQUAL};function Z(F,L){if(L.type===gr&&e.has("OES_texture_float_linear")===!1&&(L.magFilter===ji||L.magFilter===Dh||L.magFilter===$l||L.magFilter===Ls||L.minFilter===ji||L.minFilter===Dh||L.minFilter===$l||L.minFilter===Ls)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),a.texParameteri(F,a.TEXTURE_WRAP_S,W[L.wrapS]),a.texParameteri(F,a.TEXTURE_WRAP_T,W[L.wrapT]),(F===a.TEXTURE_3D||F===a.TEXTURE_2D_ARRAY)&&a.texParameteri(F,a.TEXTURE_WRAP_R,W[L.wrapR]),a.texParameteri(F,a.TEXTURE_MAG_FILTER,se[L.magFilter]),a.texParameteri(F,a.TEXTURE_MIN_FILTER,se[L.minFilter]),L.compareFunction&&(a.texParameteri(F,a.TEXTURE_COMPARE_MODE,a.COMPARE_REF_TO_TEXTURE),a.texParameteri(F,a.TEXTURE_COMPARE_FUNC,V[L.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(L.magFilter===Ii||L.minFilter!==$l&&L.minFilter!==Ls||L.type===gr&&e.has("OES_texture_float_linear")===!1)return;if(L.anisotropy>1||i.get(L).__currentAnisotropy){const ae=e.get("EXT_texture_filter_anisotropic");a.texParameterf(F,ae.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(L.anisotropy,s.getMaxAnisotropy())),i.get(L).__currentAnisotropy=L.anisotropy}}}function be(F,L){let ae=!1;F.__webglInit===void 0&&(F.__webglInit=!0,L.addEventListener("dispose",D));const me=L.source;let ye=p.get(me);ye===void 0&&(ye={},p.set(me,ye));const fe=j(L);if(fe!==F.__cacheKey){ye[fe]===void 0&&(ye[fe]={texture:a.createTexture(),usedTimes:0},c.memory.textures++,ae=!0),ye[fe].usedTimes++;const qe=ye[F.__cacheKey];qe!==void 0&&(ye[F.__cacheKey].usedTimes--,qe.usedTimes===0&&b(L)),F.__cacheKey=fe,F.__webglTexture=ye[fe].texture}return ae}function re(F,L,ae){let me=a.TEXTURE_2D;(L.isDataArrayTexture||L.isCompressedArrayTexture)&&(me=a.TEXTURE_2D_ARRAY),L.isData3DTexture&&(me=a.TEXTURE_3D);const ye=be(F,L),fe=L.source;t.bindTexture(me,F.__webglTexture,a.TEXTURE0+ae);const qe=i.get(fe);if(fe.version!==qe.__version||ye===!0){t.activeTexture(a.TEXTURE0+ae);const Pe=At.getPrimaries(At.workingColorSpace),ze=L.colorSpace===$r?null:At.getPrimaries(L.colorSpace),pt=L.colorSpace===$r||Pe===ze?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,L.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,L.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);let Ee=E(L.image,!1,s.maxTextureSize);Ee=Lt(L,Ee);const ke=o.convert(L.format,L.colorSpace),it=o.convert(L.type);let rt=A(L.internalFormat,ke,it,L.colorSpace,L.isVideoTexture);Z(me,L);let He;const gt=L.mipmaps,ct=L.isVideoTexture!==!0,Pt=qe.__version===void 0||ye===!0,Q=fe.dataReady,Le=U(L,Ee);if(L.isDepthTexture)rt=T(L.format===Do,L.type),Pt&&(ct?t.texStorage2D(a.TEXTURE_2D,1,rt,Ee.width,Ee.height):t.texImage2D(a.TEXTURE_2D,0,rt,Ee.width,Ee.height,0,ke,it,null));else if(L.isDataTexture)if(gt.length>0){ct&&Pt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,gt[0].width,gt[0].height);for(let he=0,pe=gt.length;he<pe;he++)He=gt[he],ct?Q&&t.texSubImage2D(a.TEXTURE_2D,he,0,0,He.width,He.height,ke,it,He.data):t.texImage2D(a.TEXTURE_2D,he,rt,He.width,He.height,0,ke,it,He.data);L.generateMipmaps=!1}else ct?(Pt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,Ee.width,Ee.height),Q&&t.texSubImage2D(a.TEXTURE_2D,0,0,0,Ee.width,Ee.height,ke,it,Ee.data)):t.texImage2D(a.TEXTURE_2D,0,rt,Ee.width,Ee.height,0,ke,it,Ee.data);else if(L.isCompressedTexture)if(L.isCompressedArrayTexture){ct&&Pt&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Le,rt,gt[0].width,gt[0].height,Ee.depth);for(let he=0,pe=gt.length;he<pe;he++)if(He=gt[he],L.format!==Pi)if(ke!==null)if(ct){if(Q)if(L.layerUpdates.size>0){const De=iv(He.width,He.height,L.format,L.type);for(const Ie of L.layerUpdates){const ut=He.data.subarray(Ie*De/He.data.BYTES_PER_ELEMENT,(Ie+1)*De/He.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,he,0,0,Ie,He.width,He.height,1,ke,ut)}L.clearLayerUpdates()}else t.compressedTexSubImage3D(a.TEXTURE_2D_ARRAY,he,0,0,0,He.width,He.height,Ee.depth,ke,He.data)}else t.compressedTexImage3D(a.TEXTURE_2D_ARRAY,he,rt,He.width,He.height,Ee.depth,0,He.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ct?Q&&t.texSubImage3D(a.TEXTURE_2D_ARRAY,he,0,0,0,He.width,He.height,Ee.depth,ke,it,He.data):t.texImage3D(a.TEXTURE_2D_ARRAY,he,rt,He.width,He.height,Ee.depth,0,ke,it,He.data)}else{ct&&Pt&&t.texStorage2D(a.TEXTURE_2D,Le,rt,gt[0].width,gt[0].height);for(let he=0,pe=gt.length;he<pe;he++)He=gt[he],L.format!==Pi?ke!==null?ct?Q&&t.compressedTexSubImage2D(a.TEXTURE_2D,he,0,0,He.width,He.height,ke,He.data):t.compressedTexImage2D(a.TEXTURE_2D,he,rt,He.width,He.height,0,He.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ct?Q&&t.texSubImage2D(a.TEXTURE_2D,he,0,0,He.width,He.height,ke,it,He.data):t.texImage2D(a.TEXTURE_2D,he,rt,He.width,He.height,0,ke,it,He.data)}else if(L.isDataArrayTexture)if(ct){if(Pt&&t.texStorage3D(a.TEXTURE_2D_ARRAY,Le,rt,Ee.width,Ee.height,Ee.depth),Q)if(L.layerUpdates.size>0){const he=iv(Ee.width,Ee.height,L.format,L.type);for(const pe of L.layerUpdates){const De=Ee.data.subarray(pe*he/Ee.data.BYTES_PER_ELEMENT,(pe+1)*he/Ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,pe,Ee.width,Ee.height,1,ke,it,De)}L.clearLayerUpdates()}else t.texSubImage3D(a.TEXTURE_2D_ARRAY,0,0,0,0,Ee.width,Ee.height,Ee.depth,ke,it,Ee.data)}else t.texImage3D(a.TEXTURE_2D_ARRAY,0,rt,Ee.width,Ee.height,Ee.depth,0,ke,it,Ee.data);else if(L.isData3DTexture)ct?(Pt&&t.texStorage3D(a.TEXTURE_3D,Le,rt,Ee.width,Ee.height,Ee.depth),Q&&t.texSubImage3D(a.TEXTURE_3D,0,0,0,0,Ee.width,Ee.height,Ee.depth,ke,it,Ee.data)):t.texImage3D(a.TEXTURE_3D,0,rt,Ee.width,Ee.height,Ee.depth,0,ke,it,Ee.data);else if(L.isFramebufferTexture){if(Pt)if(ct)t.texStorage2D(a.TEXTURE_2D,Le,rt,Ee.width,Ee.height);else{let he=Ee.width,pe=Ee.height;for(let De=0;De<Le;De++)t.texImage2D(a.TEXTURE_2D,De,rt,he,pe,0,ke,it,null),he>>=1,pe>>=1}}else if(gt.length>0){if(ct&&Pt){const he=Qe(gt[0]);t.texStorage2D(a.TEXTURE_2D,Le,rt,he.width,he.height)}for(let he=0,pe=gt.length;he<pe;he++)He=gt[he],ct?Q&&t.texSubImage2D(a.TEXTURE_2D,he,0,0,ke,it,He):t.texImage2D(a.TEXTURE_2D,he,rt,ke,it,He);L.generateMipmaps=!1}else if(ct){if(Pt){const he=Qe(Ee);t.texStorage2D(a.TEXTURE_2D,Le,rt,he.width,he.height)}Q&&t.texSubImage2D(a.TEXTURE_2D,0,0,0,ke,it,Ee)}else t.texImage2D(a.TEXTURE_2D,0,rt,ke,it,Ee);x(L)&&_(me),qe.__version=fe.version,L.onUpdate&&L.onUpdate(L)}F.__version=L.version}function de(F,L,ae){if(L.image.length!==6)return;const me=be(F,L),ye=L.source;t.bindTexture(a.TEXTURE_CUBE_MAP,F.__webglTexture,a.TEXTURE0+ae);const fe=i.get(ye);if(ye.version!==fe.__version||me===!0){t.activeTexture(a.TEXTURE0+ae);const qe=At.getPrimaries(At.workingColorSpace),Pe=L.colorSpace===$r?null:At.getPrimaries(L.colorSpace),ze=L.colorSpace===$r||qe===Pe?a.NONE:a.BROWSER_DEFAULT_WEBGL;a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,L.flipY),a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),a.pixelStorei(a.UNPACK_ALIGNMENT,L.unpackAlignment),a.pixelStorei(a.UNPACK_COLORSPACE_CONVERSION_WEBGL,ze);const pt=L.isCompressedTexture||L.image[0].isCompressedTexture,Ee=L.image[0]&&L.image[0].isDataTexture,ke=[];for(let pe=0;pe<6;pe++)!pt&&!Ee?ke[pe]=E(L.image[pe],!0,s.maxCubemapSize):ke[pe]=Ee?L.image[pe].image:L.image[pe],ke[pe]=Lt(L,ke[pe]);const it=ke[0],rt=o.convert(L.format,L.colorSpace),He=o.convert(L.type),gt=A(L.internalFormat,rt,He,L.colorSpace),ct=L.isVideoTexture!==!0,Pt=fe.__version===void 0||me===!0,Q=ye.dataReady;let Le=U(L,it);Z(a.TEXTURE_CUBE_MAP,L);let he;if(pt){ct&&Pt&&t.texStorage2D(a.TEXTURE_CUBE_MAP,Le,gt,it.width,it.height);for(let pe=0;pe<6;pe++){he=ke[pe].mipmaps;for(let De=0;De<he.length;De++){const Ie=he[De];L.format!==Pi?rt!==null?ct?Q&&t.compressedTexSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De,0,0,Ie.width,Ie.height,rt,Ie.data):t.compressedTexImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De,gt,Ie.width,Ie.height,0,Ie.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ct?Q&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De,0,0,Ie.width,Ie.height,rt,He,Ie.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De,gt,Ie.width,Ie.height,0,rt,He,Ie.data)}}}else{if(he=L.mipmaps,ct&&Pt){he.length>0&&Le++;const pe=Qe(ke[0]);t.texStorage2D(a.TEXTURE_CUBE_MAP,Le,gt,pe.width,pe.height)}for(let pe=0;pe<6;pe++)if(Ee){ct?Q&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,ke[pe].width,ke[pe].height,rt,He,ke[pe].data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,gt,ke[pe].width,ke[pe].height,0,rt,He,ke[pe].data);for(let De=0;De<he.length;De++){const ut=he[De].image[pe].image;ct?Q&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De+1,0,0,ut.width,ut.height,rt,He,ut.data):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De+1,gt,ut.width,ut.height,0,rt,He,ut.data)}}else{ct?Q&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,0,0,rt,He,ke[pe]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,gt,rt,He,ke[pe]);for(let De=0;De<he.length;De++){const Ie=he[De];ct?Q&&t.texSubImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De+1,0,0,rt,He,Ie.image[pe]):t.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X+pe,De+1,gt,rt,He,Ie.image[pe])}}}x(L)&&_(a.TEXTURE_CUBE_MAP),fe.__version=ye.version,L.onUpdate&&L.onUpdate(L)}F.__version=L.version}function Me(F,L,ae,me,ye,fe){const qe=o.convert(ae.format,ae.colorSpace),Pe=o.convert(ae.type),ze=A(ae.internalFormat,qe,Pe,ae.colorSpace),pt=i.get(L),Ee=i.get(ae);if(Ee.__renderTarget=L,!pt.__hasExternalTextures){const ke=Math.max(1,L.width>>fe),it=Math.max(1,L.height>>fe);ye===a.TEXTURE_3D||ye===a.TEXTURE_2D_ARRAY?t.texImage3D(ye,fe,ze,ke,it,L.depth,0,qe,Pe,null):t.texImage2D(ye,fe,ze,ke,it,0,qe,Pe,null)}t.bindFramebuffer(a.FRAMEBUFFER,F),mt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,me,ye,Ee.__webglTexture,0,_t(L)):(ye===a.TEXTURE_2D||ye>=a.TEXTURE_CUBE_MAP_POSITIVE_X&&ye<=a.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&a.framebufferTexture2D(a.FRAMEBUFFER,me,ye,Ee.__webglTexture,fe),t.bindFramebuffer(a.FRAMEBUFFER,null)}function _e(F,L,ae){if(a.bindRenderbuffer(a.RENDERBUFFER,F),L.depthBuffer){const me=L.depthTexture,ye=me&&me.isDepthTexture?me.type:null,fe=T(L.stencilBuffer,ye),qe=L.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,Pe=_t(L);mt(L)?u.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,Pe,fe,L.width,L.height):ae?a.renderbufferStorageMultisample(a.RENDERBUFFER,Pe,fe,L.width,L.height):a.renderbufferStorage(a.RENDERBUFFER,fe,L.width,L.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,qe,a.RENDERBUFFER,F)}else{const me=L.textures;for(let ye=0;ye<me.length;ye++){const fe=me[ye],qe=o.convert(fe.format,fe.colorSpace),Pe=o.convert(fe.type),ze=A(fe.internalFormat,qe,Pe,fe.colorSpace),pt=_t(L);ae&&mt(L)===!1?a.renderbufferStorageMultisample(a.RENDERBUFFER,pt,ze,L.width,L.height):mt(L)?u.renderbufferStorageMultisampleEXT(a.RENDERBUFFER,pt,ze,L.width,L.height):a.renderbufferStorage(a.RENDERBUFFER,ze,L.width,L.height)}}a.bindRenderbuffer(a.RENDERBUFFER,null)}function Ce(F,L){if(L&&L.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(a.FRAMEBUFFER,F),!(L.depthTexture&&L.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const me=i.get(L.depthTexture);me.__renderTarget=L,(!me.__webglTexture||L.depthTexture.image.width!==L.width||L.depthTexture.image.height!==L.height)&&(L.depthTexture.image.width=L.width,L.depthTexture.image.height=L.height,L.depthTexture.needsUpdate=!0),q(L.depthTexture,0);const ye=me.__webglTexture,fe=_t(L);if(L.depthTexture.format===Co)mt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,ye,0,fe):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_ATTACHMENT,a.TEXTURE_2D,ye,0);else if(L.depthTexture.format===Do)mt(L)?u.framebufferTexture2DMultisampleEXT(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,ye,0,fe):a.framebufferTexture2D(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.TEXTURE_2D,ye,0);else throw new Error("Unknown depthTexture format")}function Oe(F){const L=i.get(F),ae=F.isWebGLCubeRenderTarget===!0;if(L.__boundDepthTexture!==F.depthTexture){const me=F.depthTexture;if(L.__depthDisposeCallback&&L.__depthDisposeCallback(),me){const ye=()=>{delete L.__boundDepthTexture,delete L.__depthDisposeCallback,me.removeEventListener("dispose",ye)};me.addEventListener("dispose",ye),L.__depthDisposeCallback=ye}L.__boundDepthTexture=me}if(F.depthTexture&&!L.__autoAllocateDepthBuffer){if(ae)throw new Error("target.depthTexture not supported in Cube render targets");Ce(L.__webglFramebuffer,F)}else if(ae){L.__webglDepthbuffer=[];for(let me=0;me<6;me++)if(t.bindFramebuffer(a.FRAMEBUFFER,L.__webglFramebuffer[me]),L.__webglDepthbuffer[me]===void 0)L.__webglDepthbuffer[me]=a.createRenderbuffer(),_e(L.__webglDepthbuffer[me],F,!1);else{const ye=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,fe=L.__webglDepthbuffer[me];a.bindRenderbuffer(a.RENDERBUFFER,fe),a.framebufferRenderbuffer(a.FRAMEBUFFER,ye,a.RENDERBUFFER,fe)}}else if(t.bindFramebuffer(a.FRAMEBUFFER,L.__webglFramebuffer),L.__webglDepthbuffer===void 0)L.__webglDepthbuffer=a.createRenderbuffer(),_e(L.__webglDepthbuffer,F,!1);else{const me=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,ye=L.__webglDepthbuffer;a.bindRenderbuffer(a.RENDERBUFFER,ye),a.framebufferRenderbuffer(a.FRAMEBUFFER,me,a.RENDERBUFFER,ye)}t.bindFramebuffer(a.FRAMEBUFFER,null)}function nt(F,L,ae){const me=i.get(F);L!==void 0&&Me(me.__webglFramebuffer,F,F.texture,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,0),ae!==void 0&&Oe(F)}function Dt(F){const L=F.texture,ae=i.get(F),me=i.get(L);F.addEventListener("dispose",N);const ye=F.textures,fe=F.isWebGLCubeRenderTarget===!0,qe=ye.length>1;if(qe||(me.__webglTexture===void 0&&(me.__webglTexture=a.createTexture()),me.__version=L.version,c.memory.textures++),fe){ae.__webglFramebuffer=[];for(let Pe=0;Pe<6;Pe++)if(L.mipmaps&&L.mipmaps.length>0){ae.__webglFramebuffer[Pe]=[];for(let ze=0;ze<L.mipmaps.length;ze++)ae.__webglFramebuffer[Pe][ze]=a.createFramebuffer()}else ae.__webglFramebuffer[Pe]=a.createFramebuffer()}else{if(L.mipmaps&&L.mipmaps.length>0){ae.__webglFramebuffer=[];for(let Pe=0;Pe<L.mipmaps.length;Pe++)ae.__webglFramebuffer[Pe]=a.createFramebuffer()}else ae.__webglFramebuffer=a.createFramebuffer();if(qe)for(let Pe=0,ze=ye.length;Pe<ze;Pe++){const pt=i.get(ye[Pe]);pt.__webglTexture===void 0&&(pt.__webglTexture=a.createTexture(),c.memory.textures++)}if(F.samples>0&&mt(F)===!1){ae.__webglMultisampledFramebuffer=a.createFramebuffer(),ae.__webglColorRenderbuffer=[],t.bindFramebuffer(a.FRAMEBUFFER,ae.__webglMultisampledFramebuffer);for(let Pe=0;Pe<ye.length;Pe++){const ze=ye[Pe];ae.__webglColorRenderbuffer[Pe]=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,ae.__webglColorRenderbuffer[Pe]);const pt=o.convert(ze.format,ze.colorSpace),Ee=o.convert(ze.type),ke=A(ze.internalFormat,pt,Ee,ze.colorSpace,F.isXRRenderTarget===!0),it=_t(F);a.renderbufferStorageMultisample(a.RENDERBUFFER,it,ke,F.width,F.height),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+Pe,a.RENDERBUFFER,ae.__webglColorRenderbuffer[Pe])}a.bindRenderbuffer(a.RENDERBUFFER,null),F.depthBuffer&&(ae.__webglDepthRenderbuffer=a.createRenderbuffer(),_e(ae.__webglDepthRenderbuffer,F,!0)),t.bindFramebuffer(a.FRAMEBUFFER,null)}}if(fe){t.bindTexture(a.TEXTURE_CUBE_MAP,me.__webglTexture),Z(a.TEXTURE_CUBE_MAP,L);for(let Pe=0;Pe<6;Pe++)if(L.mipmaps&&L.mipmaps.length>0)for(let ze=0;ze<L.mipmaps.length;ze++)Me(ae.__webglFramebuffer[Pe][ze],F,L,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,ze);else Me(ae.__webglFramebuffer[Pe],F,L,a.COLOR_ATTACHMENT0,a.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0);x(L)&&_(a.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(qe){for(let Pe=0,ze=ye.length;Pe<ze;Pe++){const pt=ye[Pe],Ee=i.get(pt);t.bindTexture(a.TEXTURE_2D,Ee.__webglTexture),Z(a.TEXTURE_2D,pt),Me(ae.__webglFramebuffer,F,pt,a.COLOR_ATTACHMENT0+Pe,a.TEXTURE_2D,0),x(pt)&&_(a.TEXTURE_2D)}t.unbindTexture()}else{let Pe=a.TEXTURE_2D;if((F.isWebGL3DRenderTarget||F.isWebGLArrayRenderTarget)&&(Pe=F.isWebGL3DRenderTarget?a.TEXTURE_3D:a.TEXTURE_2D_ARRAY),t.bindTexture(Pe,me.__webglTexture),Z(Pe,L),L.mipmaps&&L.mipmaps.length>0)for(let ze=0;ze<L.mipmaps.length;ze++)Me(ae.__webglFramebuffer[ze],F,L,a.COLOR_ATTACHMENT0,Pe,ze);else Me(ae.__webglFramebuffer,F,L,a.COLOR_ATTACHMENT0,Pe,0);x(L)&&_(Pe),t.unbindTexture()}F.depthBuffer&&Oe(F)}function yt(F){const L=F.textures;for(let ae=0,me=L.length;ae<me;ae++){const ye=L[ae];if(x(ye)){const fe=w(F),qe=i.get(ye).__webglTexture;t.bindTexture(fe,qe),_(fe),t.unbindTexture()}}}const zt=[],te=[];function Dn(F){if(F.samples>0){if(mt(F)===!1){const L=F.textures,ae=F.width,me=F.height;let ye=a.COLOR_BUFFER_BIT;const fe=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT,qe=i.get(F),Pe=L.length>1;if(Pe)for(let ze=0;ze<L.length;ze++)t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+ze,a.RENDERBUFFER,null),t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+ze,a.TEXTURE_2D,null,0);t.bindFramebuffer(a.READ_FRAMEBUFFER,qe.__webglMultisampledFramebuffer),t.bindFramebuffer(a.DRAW_FRAMEBUFFER,qe.__webglFramebuffer);for(let ze=0;ze<L.length;ze++){if(F.resolveDepthBuffer&&(F.depthBuffer&&(ye|=a.DEPTH_BUFFER_BIT),F.stencilBuffer&&F.resolveStencilBuffer&&(ye|=a.STENCIL_BUFFER_BIT)),Pe){a.framebufferRenderbuffer(a.READ_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.RENDERBUFFER,qe.__webglColorRenderbuffer[ze]);const pt=i.get(L[ze]).__webglTexture;a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,pt,0)}a.blitFramebuffer(0,0,ae,me,0,0,ae,me,ye,a.NEAREST),d===!0&&(zt.length=0,te.length=0,zt.push(a.COLOR_ATTACHMENT0+ze),F.depthBuffer&&F.resolveDepthBuffer===!1&&(zt.push(fe),te.push(fe),a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,te)),a.invalidateFramebuffer(a.READ_FRAMEBUFFER,zt))}if(t.bindFramebuffer(a.READ_FRAMEBUFFER,null),t.bindFramebuffer(a.DRAW_FRAMEBUFFER,null),Pe)for(let ze=0;ze<L.length;ze++){t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglMultisampledFramebuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0+ze,a.RENDERBUFFER,qe.__webglColorRenderbuffer[ze]);const pt=i.get(L[ze]).__webglTexture;t.bindFramebuffer(a.FRAMEBUFFER,qe.__webglFramebuffer),a.framebufferTexture2D(a.DRAW_FRAMEBUFFER,a.COLOR_ATTACHMENT0+ze,a.TEXTURE_2D,pt,0)}t.bindFramebuffer(a.DRAW_FRAMEBUFFER,qe.__webglMultisampledFramebuffer)}else if(F.depthBuffer&&F.resolveDepthBuffer===!1&&d){const L=F.stencilBuffer?a.DEPTH_STENCIL_ATTACHMENT:a.DEPTH_ATTACHMENT;a.invalidateFramebuffer(a.DRAW_FRAMEBUFFER,[L])}}}function _t(F){return Math.min(s.maxSamples,F.samples)}function mt(F){const L=i.get(F);return F.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&L.__useRenderToTexture!==!1}function Je(F){const L=c.render.frame;m.get(F)!==L&&(m.set(F,L),F.update())}function Lt(F,L){const ae=F.colorSpace,me=F.format,ye=F.type;return F.isCompressedTexture===!0||F.isVideoTexture===!0||ae!==Uo&&ae!==$r&&(At.getTransfer(ae)===Nt?(me!==Pi||ye!==yr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",ae)),L}function Qe(F){return typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement?(f.width=F.naturalWidth||F.width,f.height=F.naturalHeight||F.height):typeof VideoFrame<"u"&&F instanceof VideoFrame?(f.width=F.displayWidth,f.height=F.displayHeight):(f.width=F.width,f.height=F.height),f}this.allocateTextureUnit=B,this.resetTextureUnits=K,this.setTexture2D=q,this.setTexture2DArray=G,this.setTexture3D=ne,this.setTextureCube=H,this.rebindTextures=nt,this.setupRenderTarget=Dt,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=Dn,this.setupDepthRenderbuffer=Oe,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=mt}function y1(a,e){function t(i,s=$r){let o;const c=At.getTransfer(s);if(i===yr)return a.UNSIGNED_BYTE;if(i===ff)return a.UNSIGNED_SHORT_4_4_4_4;if(i===pf)return a.UNSIGNED_SHORT_5_5_5_1;if(i===Jv)return a.UNSIGNED_INT_5_9_9_9_REV;if(i===Kv)return a.BYTE;if(i===Qv)return a.SHORT;if(i===Fa)return a.UNSIGNED_SHORT;if(i===df)return a.INT;if(i===Ds)return a.UNSIGNED_INT;if(i===gr)return a.FLOAT;if(i===Ba)return a.HALF_FLOAT;if(i===e0)return a.ALPHA;if(i===t0)return a.RGB;if(i===Pi)return a.RGBA;if(i===n0)return a.LUMINANCE;if(i===i0)return a.LUMINANCE_ALPHA;if(i===Co)return a.DEPTH_COMPONENT;if(i===Do)return a.DEPTH_STENCIL;if(i===r0)return a.RED;if(i===mf)return a.RED_INTEGER;if(i===s0)return a.RG;if(i===gf)return a.RG_INTEGER;if(i===vf)return a.RGBA_INTEGER;if(i===Rc||i===bc||i===Pc||i===Lc)if(c===Nt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(i===Rc)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===bc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Pc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Lc)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(i===Rc)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===bc)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Pc)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Lc)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ld||i===Id||i===Dd||i===Nd)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(i===Ld)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Id)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Dd)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Nd)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ud||i===Fd||i===Od)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(i===Ud||i===Fd)return c===Nt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(i===Od)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===zd||i===Bd||i===kd||i===Hd||i===Vd||i===Gd||i===Wd||i===Xd||i===jd||i===qd||i===Yd||i===$d||i===Zd||i===Kd)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(i===zd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Bd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===kd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Hd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Vd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Wd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Xd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===jd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===qd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Yd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===$d)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Zd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Kd)return c===Nt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ic||i===Qd||i===Jd)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(i===Ic)return c===Nt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Qd)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Jd)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===o0||i===ef||i===tf||i===nf)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(i===Ic)return o.COMPRESSED_RED_RGTC1_EXT;if(i===ef)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===tf)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===nf)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Io?a.UNSIGNED_INT_24_8:a[i]!==void 0?a[i]:null}return{convert:t}}class x1 extends gi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class wo extends on{constructor(){super(),this.isGroup=!0,this.type="Group"}}const S1={type:"move"};class ld{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Y,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Y),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Y,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Y),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,o=null,c=null;const u=this._targetRay,d=this._grip,f=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(f&&e.hand){c=!0;for(const E of e.hand.values()){const x=t.getJointPose(E,i),_=this._getHandJoint(f,E);x!==null&&(_.matrix.fromArray(x.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=x.radius),_.visible=x!==null}const m=f.joints["index-finger-tip"],v=f.joints["thumb-tip"],p=m.position.distanceTo(v.position),y=.02,M=.005;f.inputState.pinching&&p>y+M?(f.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!f.inputState.pinching&&p<=y-M&&(f.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else d!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(d.matrix.fromArray(o.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,o.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(o.linearVelocity)):d.hasLinearVelocity=!1,o.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(o.angularVelocity)):d.hasAngularVelocity=!1));u!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&o!==null&&(s=o),s!==null&&(u.matrix.fromArray(s.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,s.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(s.linearVelocity)):u.hasLinearVelocity=!1,s.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(s.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(S1)))}return u!==null&&(u.visible=s!==null),d!==null&&(d.visible=o!==null),f!==null&&(f.visible=c!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new wo;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const M1=`
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

}`;class w1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new In,o=e.properties.get(s);o.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Di({vertexShader:M1,fragmentShader:E1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Fe(new zo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class T1 extends Us{constructor(e,t){super();const i=this;let s=null,o=1,c=null,u="local-floor",d=1,f=null,m=null,v=null,p=null,y=null,M=null;const E=new w1,x=t.getContextAttributes();let _=null,w=null;const A=[],T=[],U=new Mt;let D=null;const N=new gi;N.viewport=new Qt;const O=new gi;O.viewport=new Qt;const b=[N,O],C=new x1;let z=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(re){let de=A[re];return de===void 0&&(de=new ld,A[re]=de),de.getTargetRaySpace()},this.getControllerGrip=function(re){let de=A[re];return de===void 0&&(de=new ld,A[re]=de),de.getGripSpace()},this.getHand=function(re){let de=A[re];return de===void 0&&(de=new ld,A[re]=de),de.getHandSpace()};function B(re){const de=T.indexOf(re.inputSource);if(de===-1)return;const Me=A[de];Me!==void 0&&(Me.update(re.inputSource,re.frame,f||c),Me.dispatchEvent({type:re.type,data:re.inputSource}))}function j(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",j),s.removeEventListener("inputsourceschange",q);for(let re=0;re<A.length;re++){const de=T[re];de!==null&&(T[re]=null,A[re].disconnect(de))}z=null,K=null,E.reset(),e.setRenderTarget(_),y=null,p=null,v=null,s=null,w=null,be.stop(),i.isPresenting=!1,e.setPixelRatio(D),e.setSize(U.width,U.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(re){o=re,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(re){u=re,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return f||c},this.setReferenceSpace=function(re){f=re},this.getBaseLayer=function(){return p!==null?p:y},this.getBinding=function(){return v},this.getFrame=function(){return M},this.getSession=function(){return s},this.setSession=async function(re){if(s=re,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",j),s.addEventListener("inputsourceschange",q),x.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(U),s.renderState.layers===void 0){const de={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:o};y=new XRWebGLLayer(s,t,de),s.updateRenderState({baseLayer:y}),e.setPixelRatio(1),e.setSize(y.framebufferWidth,y.framebufferHeight,!1),w=new Ns(y.framebufferWidth,y.framebufferHeight,{format:Pi,type:yr,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let de=null,Me=null,_e=null;x.depth&&(_e=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,de=x.stencil?Do:Co,Me=x.stencil?Io:Ds);const Ce={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:o};v=new XRWebGLBinding(s,t),p=v.createProjectionLayer(Ce),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),w=new Ns(p.textureWidth,p.textureHeight,{format:Pi,type:yr,depthTexture:new S0(p.textureWidth,p.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,de),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(d),f=null,c=await s.requestReferenceSpace(u),be.setContext(s),be.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function q(re){for(let de=0;de<re.removed.length;de++){const Me=re.removed[de],_e=T.indexOf(Me);_e>=0&&(T[_e]=null,A[_e].disconnect(Me))}for(let de=0;de<re.added.length;de++){const Me=re.added[de];let _e=T.indexOf(Me);if(_e===-1){for(let Oe=0;Oe<A.length;Oe++)if(Oe>=T.length){T.push(Me),_e=Oe;break}else if(T[Oe]===null){T[Oe]=Me,_e=Oe;break}if(_e===-1)break}const Ce=A[_e];Ce&&Ce.connect(Me)}}const G=new Y,ne=new Y;function H(re,de,Me){G.setFromMatrixPosition(de.matrixWorld),ne.setFromMatrixPosition(Me.matrixWorld);const _e=G.distanceTo(ne),Ce=de.projectionMatrix.elements,Oe=Me.projectionMatrix.elements,nt=Ce[14]/(Ce[10]-1),Dt=Ce[14]/(Ce[10]+1),yt=(Ce[9]+1)/Ce[5],zt=(Ce[9]-1)/Ce[5],te=(Ce[8]-1)/Ce[0],Dn=(Oe[8]+1)/Oe[0],_t=nt*te,mt=nt*Dn,Je=_e/(-te+Dn),Lt=Je*-te;if(de.matrixWorld.decompose(re.position,re.quaternion,re.scale),re.translateX(Lt),re.translateZ(Je),re.matrixWorld.compose(re.position,re.quaternion,re.scale),re.matrixWorldInverse.copy(re.matrixWorld).invert(),Ce[10]===-1)re.projectionMatrix.copy(de.projectionMatrix),re.projectionMatrixInverse.copy(de.projectionMatrixInverse);else{const Qe=nt+Je,F=Dt+Je,L=_t-Lt,ae=mt+(_e-Lt),me=yt*Dt/F*Qe,ye=zt*Dt/F*Qe;re.projectionMatrix.makePerspective(L,ae,me,ye,Qe,F),re.projectionMatrixInverse.copy(re.projectionMatrix).invert()}}function W(re,de){de===null?re.matrixWorld.copy(re.matrix):re.matrixWorld.multiplyMatrices(de.matrixWorld,re.matrix),re.matrixWorldInverse.copy(re.matrixWorld).invert()}this.updateCamera=function(re){if(s===null)return;let de=re.near,Me=re.far;E.texture!==null&&(E.depthNear>0&&(de=E.depthNear),E.depthFar>0&&(Me=E.depthFar)),C.near=O.near=N.near=de,C.far=O.far=N.far=Me,(z!==C.near||K!==C.far)&&(s.updateRenderState({depthNear:C.near,depthFar:C.far}),z=C.near,K=C.far),N.layers.mask=re.layers.mask|2,O.layers.mask=re.layers.mask|4,C.layers.mask=N.layers.mask|O.layers.mask;const _e=re.parent,Ce=C.cameras;W(C,_e);for(let Oe=0;Oe<Ce.length;Oe++)W(Ce[Oe],_e);Ce.length===2?H(C,N,O):C.projectionMatrix.copy(N.projectionMatrix),se(re,C,_e)};function se(re,de,Me){Me===null?re.matrix.copy(de.matrixWorld):(re.matrix.copy(Me.matrixWorld),re.matrix.invert(),re.matrix.multiply(de.matrixWorld)),re.matrix.decompose(re.position,re.quaternion,re.scale),re.updateMatrixWorld(!0),re.projectionMatrix.copy(de.projectionMatrix),re.projectionMatrixInverse.copy(de.projectionMatrixInverse),re.isPerspectiveCamera&&(re.fov=rf*2*Math.atan(1/re.projectionMatrix.elements[5]),re.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(p===null&&y===null))return d},this.setFoveation=function(re){d=re,p!==null&&(p.fixedFoveation=re),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=re)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(C)};let V=null;function Z(re,de){if(m=de.getViewerPose(f||c),M=de,m!==null){const Me=m.views;y!==null&&(e.setRenderTargetFramebuffer(w,y.framebuffer),e.setRenderTarget(w));let _e=!1;Me.length!==C.cameras.length&&(C.cameras.length=0,_e=!0);for(let Oe=0;Oe<Me.length;Oe++){const nt=Me[Oe];let Dt=null;if(y!==null)Dt=y.getViewport(nt);else{const zt=v.getViewSubImage(p,nt);Dt=zt.viewport,Oe===0&&(e.setRenderTargetTextures(w,zt.colorTexture,p.ignoreDepthValues?void 0:zt.depthStencilTexture),e.setRenderTarget(w))}let yt=b[Oe];yt===void 0&&(yt=new gi,yt.layers.enable(Oe),yt.viewport=new Qt,b[Oe]=yt),yt.matrix.fromArray(nt.transform.matrix),yt.matrix.decompose(yt.position,yt.quaternion,yt.scale),yt.projectionMatrix.fromArray(nt.projectionMatrix),yt.projectionMatrixInverse.copy(yt.projectionMatrix).invert(),yt.viewport.set(Dt.x,Dt.y,Dt.width,Dt.height),Oe===0&&(C.matrix.copy(yt.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),_e===!0&&C.cameras.push(yt)}const Ce=s.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const Oe=v.getDepthInformation(Me[0]);Oe&&Oe.isValid&&Oe.texture&&E.init(e,Oe,s.renderState)}}for(let Me=0;Me<A.length;Me++){const _e=T[Me],Ce=A[Me];_e!==null&&Ce!==void 0&&Ce.update(_e,de,f||c)}V&&V(re,de),de.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:de}),M=null}const be=new y0;be.setAnimationLoop(Z),this.setAnimationLoop=function(re){V=re},this.dispose=function(){}}}const _s=new si,A1=new kt;function C1(a,e){function t(x,_){x.matrixAutoUpdate===!0&&x.updateMatrix(),_.value.copy(x.matrix)}function i(x,_){_.color.getRGB(x.fogColor.value,m0(a)),_.isFog?(x.fogNear.value=_.near,x.fogFar.value=_.far):_.isFogExp2&&(x.fogDensity.value=_.density)}function s(x,_,w,A,T){_.isMeshBasicMaterial||_.isMeshLambertMaterial?o(x,_):_.isMeshToonMaterial?(o(x,_),v(x,_)):_.isMeshPhongMaterial?(o(x,_),m(x,_)):_.isMeshStandardMaterial?(o(x,_),p(x,_),_.isMeshPhysicalMaterial&&y(x,_,T)):_.isMeshMatcapMaterial?(o(x,_),M(x,_)):_.isMeshDepthMaterial?o(x,_):_.isMeshDistanceMaterial?(o(x,_),E(x,_)):_.isMeshNormalMaterial?o(x,_):_.isLineBasicMaterial?(c(x,_),_.isLineDashedMaterial&&u(x,_)):_.isPointsMaterial?d(x,_,w,A):_.isSpriteMaterial?f(x,_):_.isShadowMaterial?(x.color.value.copy(_.color),x.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function o(x,_){x.opacity.value=_.opacity,_.color&&x.diffuse.value.copy(_.color),_.emissive&&x.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(x.map.value=_.map,t(_.map,x.mapTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.bumpMap&&(x.bumpMap.value=_.bumpMap,t(_.bumpMap,x.bumpMapTransform),x.bumpScale.value=_.bumpScale,_.side===Kn&&(x.bumpScale.value*=-1)),_.normalMap&&(x.normalMap.value=_.normalMap,t(_.normalMap,x.normalMapTransform),x.normalScale.value.copy(_.normalScale),_.side===Kn&&x.normalScale.value.negate()),_.displacementMap&&(x.displacementMap.value=_.displacementMap,t(_.displacementMap,x.displacementMapTransform),x.displacementScale.value=_.displacementScale,x.displacementBias.value=_.displacementBias),_.emissiveMap&&(x.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,x.emissiveMapTransform)),_.specularMap&&(x.specularMap.value=_.specularMap,t(_.specularMap,x.specularMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest);const w=e.get(_),A=w.envMap,T=w.envMapRotation;A&&(x.envMap.value=A,_s.copy(T),_s.x*=-1,_s.y*=-1,_s.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(_s.y*=-1,_s.z*=-1),x.envMapRotation.value.setFromMatrix4(A1.makeRotationFromEuler(_s)),x.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,x.reflectivity.value=_.reflectivity,x.ior.value=_.ior,x.refractionRatio.value=_.refractionRatio),_.lightMap&&(x.lightMap.value=_.lightMap,x.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,x.lightMapTransform)),_.aoMap&&(x.aoMap.value=_.aoMap,x.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,x.aoMapTransform))}function c(x,_){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,_.map&&(x.map.value=_.map,t(_.map,x.mapTransform))}function u(x,_){x.dashSize.value=_.dashSize,x.totalSize.value=_.dashSize+_.gapSize,x.scale.value=_.scale}function d(x,_,w,A){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,x.size.value=_.size*w,x.scale.value=A*.5,_.map&&(x.map.value=_.map,t(_.map,x.uvTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest)}function f(x,_){x.diffuse.value.copy(_.color),x.opacity.value=_.opacity,x.rotation.value=_.rotation,_.map&&(x.map.value=_.map,t(_.map,x.mapTransform)),_.alphaMap&&(x.alphaMap.value=_.alphaMap,t(_.alphaMap,x.alphaMapTransform)),_.alphaTest>0&&(x.alphaTest.value=_.alphaTest)}function m(x,_){x.specular.value.copy(_.specular),x.shininess.value=Math.max(_.shininess,1e-4)}function v(x,_){_.gradientMap&&(x.gradientMap.value=_.gradientMap)}function p(x,_){x.metalness.value=_.metalness,_.metalnessMap&&(x.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,x.metalnessMapTransform)),x.roughness.value=_.roughness,_.roughnessMap&&(x.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,x.roughnessMapTransform)),_.envMap&&(x.envMapIntensity.value=_.envMapIntensity)}function y(x,_,w){x.ior.value=_.ior,_.sheen>0&&(x.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),x.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(x.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,x.sheenColorMapTransform)),_.sheenRoughnessMap&&(x.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,x.sheenRoughnessMapTransform))),_.clearcoat>0&&(x.clearcoat.value=_.clearcoat,x.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(x.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,x.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(x.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===Kn&&x.clearcoatNormalScale.value.negate())),_.dispersion>0&&(x.dispersion.value=_.dispersion),_.iridescence>0&&(x.iridescence.value=_.iridescence,x.iridescenceIOR.value=_.iridescenceIOR,x.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(x.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,x.iridescenceMapTransform)),_.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),_.transmission>0&&(x.transmission.value=_.transmission,x.transmissionSamplerMap.value=w.texture,x.transmissionSamplerSize.value.set(w.width,w.height),_.transmissionMap&&(x.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,x.transmissionMapTransform)),x.thickness.value=_.thickness,_.thicknessMap&&(x.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=_.attenuationDistance,x.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(x.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(x.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=_.specularIntensity,x.specularColor.value.copy(_.specularColor),_.specularColorMap&&(x.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,x.specularColorMapTransform)),_.specularIntensityMap&&(x.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,x.specularIntensityMapTransform))}function M(x,_){_.matcap&&(x.matcap.value=_.matcap)}function E(x,_){const w=e.get(_).light;x.referencePosition.value.setFromMatrixPosition(w.matrixWorld),x.nearDistance.value=w.shadow.camera.near,x.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function R1(a,e,t,i){let s={},o={},c=[];const u=a.getParameter(a.MAX_UNIFORM_BUFFER_BINDINGS);function d(w,A){const T=A.program;i.uniformBlockBinding(w,T)}function f(w,A){let T=s[w.id];T===void 0&&(M(w),T=m(w),s[w.id]=T,w.addEventListener("dispose",x));const U=A.program;i.updateUBOMapping(w,U);const D=e.render.frame;o[w.id]!==D&&(p(w),o[w.id]=D)}function m(w){const A=v();w.__bindingPointIndex=A;const T=a.createBuffer(),U=w.__size,D=w.usage;return a.bindBuffer(a.UNIFORM_BUFFER,T),a.bufferData(a.UNIFORM_BUFFER,U,D),a.bindBuffer(a.UNIFORM_BUFFER,null),a.bindBufferBase(a.UNIFORM_BUFFER,A,T),T}function v(){for(let w=0;w<u;w++)if(c.indexOf(w)===-1)return c.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(w){const A=s[w.id],T=w.uniforms,U=w.__cache;a.bindBuffer(a.UNIFORM_BUFFER,A);for(let D=0,N=T.length;D<N;D++){const O=Array.isArray(T[D])?T[D]:[T[D]];for(let b=0,C=O.length;b<C;b++){const z=O[b];if(y(z,D,b,U)===!0){const K=z.__offset,B=Array.isArray(z.value)?z.value:[z.value];let j=0;for(let q=0;q<B.length;q++){const G=B[q],ne=E(G);typeof G=="number"||typeof G=="boolean"?(z.__data[0]=G,a.bufferSubData(a.UNIFORM_BUFFER,K+j,z.__data)):G.isMatrix3?(z.__data[0]=G.elements[0],z.__data[1]=G.elements[1],z.__data[2]=G.elements[2],z.__data[3]=0,z.__data[4]=G.elements[3],z.__data[5]=G.elements[4],z.__data[6]=G.elements[5],z.__data[7]=0,z.__data[8]=G.elements[6],z.__data[9]=G.elements[7],z.__data[10]=G.elements[8],z.__data[11]=0):(G.toArray(z.__data,j),j+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}a.bufferSubData(a.UNIFORM_BUFFER,K,z.__data)}}}a.bindBuffer(a.UNIFORM_BUFFER,null)}function y(w,A,T,U){const D=w.value,N=A+"_"+T;if(U[N]===void 0)return typeof D=="number"||typeof D=="boolean"?U[N]=D:U[N]=D.clone(),!0;{const O=U[N];if(typeof D=="number"||typeof D=="boolean"){if(O!==D)return U[N]=D,!0}else if(O.equals(D)===!1)return O.copy(D),!0}return!1}function M(w){const A=w.uniforms;let T=0;const U=16;for(let N=0,O=A.length;N<O;N++){const b=Array.isArray(A[N])?A[N]:[A[N]];for(let C=0,z=b.length;C<z;C++){const K=b[C],B=Array.isArray(K.value)?K.value:[K.value];for(let j=0,q=B.length;j<q;j++){const G=B[j],ne=E(G),H=T%U,W=H%ne.boundary,se=H+W;T+=W,se!==0&&U-se<ne.storage&&(T+=U-se),K.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=T,T+=ne.storage}}}const D=T%U;return D>0&&(T+=U-D),w.__size=T,w.__cache={},this}function E(w){const A={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(A.boundary=4,A.storage=4):w.isVector2?(A.boundary=8,A.storage=8):w.isVector3||w.isColor?(A.boundary=16,A.storage=12):w.isVector4?(A.boundary=16,A.storage=16):w.isMatrix3?(A.boundary=48,A.storage=48):w.isMatrix4?(A.boundary=64,A.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),A}function x(w){const A=w.target;A.removeEventListener("dispose",x);const T=c.indexOf(A.__bindingPointIndex);c.splice(T,1),a.deleteBuffer(s[A.id]),delete s[A.id],delete o[A.id]}function _(){for(const w in s)a.deleteBuffer(s[w]);c=[],s={},o={}}return{bind:d,update:f,dispose:_}}class b1{constructor(e={}){const{canvas:t=_x(),context:i=null,depth:s=!0,stencil:o=!1,alpha:c=!1,antialias:u=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:f=!1,powerPreference:m="default",failIfMajorPerformanceCaveat:v=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let y;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");y=i.getContextAttributes().alpha}else y=c;const M=new Uint32Array(4),E=new Int32Array(4);let x=null,_=null;const w=[],A=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Bn,this.toneMapping=Kr,this.toneMappingExposure=1;const T=this;let U=!1,D=0,N=0,O=null,b=-1,C=null;const z=new Qt,K=new Qt;let B=null;const j=new at(0);let q=0,G=t.width,ne=t.height,H=1,W=null,se=null;const V=new Qt(0,0,G,ne),Z=new Qt(0,0,G,ne);let be=!1;const re=new xf;let de=!1,Me=!1;const _e=new kt,Ce=new kt,Oe=new Y,nt=new Qt,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let yt=!1;function zt(){return O===null?H:1}let te=i;function Dn(I,J){return t.getContext(I,J)}try{const I={alpha:!0,depth:s,stencil:o,antialias:u,premultipliedAlpha:d,preserveDrawingBuffer:f,powerPreference:m,failIfMajorPerformanceCaveat:v};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${hf}`),t.addEventListener("webglcontextlost",pe,!1),t.addEventListener("webglcontextrestored",De,!1),t.addEventListener("webglcontextcreationerror",Ie,!1),te===null){const J="webgl2";if(te=Dn(J,I),te===null)throw Dn(J)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(I){throw console.error("THREE.WebGLRenderer: "+I.message),I}let _t,mt,Je,Lt,Qe,F,L,ae,me,ye,fe,qe,Pe,ze,pt,Ee,ke,it,rt,He,gt,ct,Pt,Q;function Le(){_t=new NE(te),_t.init(),ct=new y1(te,_t),mt=new RE(te,_t,e,ct),Je=new g1(te,_t),mt.reverseDepthBuffer&&p&&Je.buffers.depth.setReversed(!0),Lt=new OE(te),Qe=new t1,F=new _1(te,_t,Je,Qe,mt,ct,Lt),L=new PE(T),ae=new DE(T),me=new Wx(te),Pt=new AE(te,me),ye=new UE(te,me,Lt,Pt),fe=new BE(te,ye,me,Lt),rt=new zE(te,mt,F),Ee=new bE(Qe),qe=new e1(T,L,ae,_t,mt,Pt,Ee),Pe=new C1(T,Qe),ze=new i1,pt=new c1(_t),it=new TE(T,L,ae,Je,fe,y,d),ke=new p1(T,fe,mt),Q=new R1(te,Lt,mt,Je),He=new CE(te,_t,Lt),gt=new FE(te,_t,Lt),Lt.programs=qe.programs,T.capabilities=mt,T.extensions=_t,T.properties=Qe,T.renderLists=ze,T.shadowMap=ke,T.state=Je,T.info=Lt}Le();const he=new T1(T,te);this.xr=he,this.getContext=function(){return te},this.getContextAttributes=function(){return te.getContextAttributes()},this.forceContextLoss=function(){const I=_t.get("WEBGL_lose_context");I&&I.loseContext()},this.forceContextRestore=function(){const I=_t.get("WEBGL_lose_context");I&&I.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(I){I!==void 0&&(H=I,this.setSize(G,ne,!1))},this.getSize=function(I){return I.set(G,ne)},this.setSize=function(I,J,ce=!0){if(he.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=I,ne=J,t.width=Math.floor(I*H),t.height=Math.floor(J*H),ce===!0&&(t.style.width=I+"px",t.style.height=J+"px"),this.setViewport(0,0,I,J)},this.getDrawingBufferSize=function(I){return I.set(G*H,ne*H).floor()},this.setDrawingBufferSize=function(I,J,ce){G=I,ne=J,H=ce,t.width=Math.floor(I*ce),t.height=Math.floor(J*ce),this.setViewport(0,0,I,J)},this.getCurrentViewport=function(I){return I.copy(z)},this.getViewport=function(I){return I.copy(V)},this.setViewport=function(I,J,ce,ue){I.isVector4?V.set(I.x,I.y,I.z,I.w):V.set(I,J,ce,ue),Je.viewport(z.copy(V).multiplyScalar(H).round())},this.getScissor=function(I){return I.copy(Z)},this.setScissor=function(I,J,ce,ue){I.isVector4?Z.set(I.x,I.y,I.z,I.w):Z.set(I,J,ce,ue),Je.scissor(K.copy(Z).multiplyScalar(H).round())},this.getScissorTest=function(){return be},this.setScissorTest=function(I){Je.setScissorTest(be=I)},this.setOpaqueSort=function(I){W=I},this.setTransparentSort=function(I){se=I},this.getClearColor=function(I){return I.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(I=!0,J=!0,ce=!0){let ue=0;if(I){let ee=!1;if(O!==null){const Ae=O.texture.format;ee=Ae===vf||Ae===gf||Ae===mf}if(ee){const Ae=O.texture.type,we=Ae===yr||Ae===Ds||Ae===Fa||Ae===Io||Ae===ff||Ae===pf,Ye=it.getClearColor(),We=it.getClearAlpha(),st=Ye.r,lt=Ye.g,$e=Ye.b;we?(M[0]=st,M[1]=lt,M[2]=$e,M[3]=We,te.clearBufferuiv(te.COLOR,0,M)):(E[0]=st,E[1]=lt,E[2]=$e,E[3]=We,te.clearBufferiv(te.COLOR,0,E))}else ue|=te.COLOR_BUFFER_BIT}J&&(ue|=te.DEPTH_BUFFER_BIT),ce&&(ue|=te.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),te.clear(ue)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",pe,!1),t.removeEventListener("webglcontextrestored",De,!1),t.removeEventListener("webglcontextcreationerror",Ie,!1),ze.dispose(),pt.dispose(),Qe.dispose(),L.dispose(),ae.dispose(),fe.dispose(),Pt.dispose(),Q.dispose(),qe.dispose(),he.dispose(),he.removeEventListener("sessionstart",Fs),he.removeEventListener("sessionend",xr),qi.stop()};function pe(I){I.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),U=!0}function De(){console.log("THREE.WebGLRenderer: Context Restored."),U=!1;const I=Lt.autoReset,J=ke.enabled,ce=ke.autoUpdate,ue=ke.needsUpdate,ee=ke.type;Le(),Lt.autoReset=I,ke.enabled=J,ke.autoUpdate=ce,ke.needsUpdate=ue,ke.type=ee}function Ie(I){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",I.statusMessage)}function ut(I){const J=I.target;J.removeEventListener("dispose",ut),Ht(J)}function Ht(I){an(I),Qe.remove(I)}function an(I){const J=Qe.get(I).programs;J!==void 0&&(J.forEach(function(ce){qe.releaseProgram(ce)}),I.isShaderMaterial&&qe.releaseShaderCache(I))}this.renderBufferDirect=function(I,J,ce,ue,ee,Ae){J===null&&(J=Dt);const we=ee.isMesh&&ee.matrixWorld.determinant()<0,Ye=Xa(I,J,ce,ue,ee);Je.setMaterial(ue,we);let We=ce.index,st=1;if(ue.wireframe===!0){if(We=ye.getWireframeAttribute(ce),We===void 0)return;st=2}const lt=ce.drawRange,$e=ce.attributes.position;let St=lt.start*st,bt=(lt.start+lt.count)*st;Ae!==null&&(St=Math.max(St,Ae.start*st),bt=Math.min(bt,(Ae.start+Ae.count)*st)),We!==null?(St=Math.max(St,0),bt=Math.min(bt,We.count)):$e!=null&&(St=Math.max(St,0),bt=Math.min(bt,$e.count));const xt=bt-St;if(xt<0||xt===1/0)return;Pt.setup(ee,ue,Ye,ce,We);let Mn,ht=He;if(We!==null&&(Mn=me.get(We),ht=gt,ht.setIndex(Mn)),ee.isMesh)ue.wireframe===!0?(Je.setLineWidth(ue.wireframeLinewidth*zt()),ht.setMode(te.LINES)):ht.setMode(te.TRIANGLES);else if(ee.isLine){let Ke=ue.linewidth;Ke===void 0&&(Ke=1),Je.setLineWidth(Ke*zt()),ee.isLineSegments?ht.setMode(te.LINES):ee.isLineLoop?ht.setMode(te.LINE_LOOP):ht.setMode(te.LINE_STRIP)}else ee.isPoints?ht.setMode(te.POINTS):ee.isSprite&&ht.setMode(te.TRIANGLES);if(ee.isBatchedMesh)if(ee._multiDrawInstances!==null)ht.renderMultiDrawInstances(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount,ee._multiDrawInstances);else if(_t.get("WEBGL_multi_draw"))ht.renderMultiDraw(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount);else{const Ke=ee._multiDrawStarts,vi=ee._multiDrawCounts,Ct=ee._multiDrawCount,En=We?me.get(We).bytesPerElement:1,_i=Qe.get(ue).currentProgram.getUniforms();for(let ln=0;ln<Ct;ln++)_i.setValue(te,"_gl_DrawID",ln),ht.render(Ke[ln]/En,vi[ln])}else if(ee.isInstancedMesh)ht.renderInstances(St,xt,ee.count);else if(ce.isInstancedBufferGeometry){const Ke=ce._maxInstanceCount!==void 0?ce._maxInstanceCount:1/0,vi=Math.min(ce.instanceCount,Ke);ht.renderInstances(St,xt,vi)}else ht.render(St,xt)};function Et(I,J,ce){I.transparent===!0&&I.side===Xi&&I.forceSinglePass===!1?(I.side=Kn,I.needsUpdate=!0,Os(I,J,ce),I.side=Qr,I.needsUpdate=!0,Os(I,J,ce),I.side=Xi):Os(I,J,ce)}this.compile=function(I,J,ce=null){ce===null&&(ce=I),_=pt.get(ce),_.init(J),A.push(_),ce.traverseVisible(function(ee){ee.isLight&&ee.layers.test(J.layers)&&(_.pushLight(ee),ee.castShadow&&_.pushShadow(ee))}),I!==ce&&I.traverseVisible(function(ee){ee.isLight&&ee.layers.test(J.layers)&&(_.pushLight(ee),ee.castShadow&&_.pushShadow(ee))}),_.setupLights();const ue=new Set;return I.traverse(function(ee){if(!(ee.isMesh||ee.isPoints||ee.isLine||ee.isSprite))return;const Ae=ee.material;if(Ae)if(Array.isArray(Ae))for(let we=0;we<Ae.length;we++){const Ye=Ae[we];Et(Ye,ce,ee),ue.add(Ye)}else Et(Ae,ce,ee),ue.add(Ae)}),A.pop(),_=null,ue},this.compileAsync=function(I,J,ce=null){const ue=this.compile(I,J,ce);return new Promise(ee=>{function Ae(){if(ue.forEach(function(we){Qe.get(we).currentProgram.isReady()&&ue.delete(we)}),ue.size===0){ee(I);return}setTimeout(Ae,10)}_t.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let kn=null;function Nn(I){kn&&kn(I)}function Fs(){qi.stop()}function xr(){qi.start()}const qi=new y0;qi.setAnimationLoop(Nn),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(I){kn=I,he.setAnimationLoop(I),I===null?qi.stop():qi.start()},he.addEventListener("sessionstart",Fs),he.addEventListener("sessionend",xr),this.render=function(I,J){if(J!==void 0&&J.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;if(I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),J.parent===null&&J.matrixWorldAutoUpdate===!0&&J.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(he.cameraAutoUpdate===!0&&he.updateCamera(J),J=he.getCamera()),I.isScene===!0&&I.onBeforeRender(T,I,J,O),_=pt.get(I,A.length),_.init(J),A.push(_),Ce.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),re.setFromProjectionMatrix(Ce),Me=this.localClippingEnabled,de=Ee.init(this.clippingPlanes,Me),x=ze.get(I,w.length),x.init(),w.push(x),he.enabled===!0&&he.isPresenting===!0){const Ae=T.xr.getDepthSensingMesh();Ae!==null&&Yi(Ae,J,-1/0,T.sortObjects)}Yi(I,J,0,T.sortObjects),x.finish(),T.sortObjects===!0&&x.sort(W,se),yt=he.enabled===!1||he.isPresenting===!1||he.hasDepthSensing()===!1,yt&&it.addToRenderList(x,I),this.info.render.frame++,de===!0&&Ee.beginShadows();const ce=_.state.shadowsArray;ke.render(ce,I,J),de===!0&&Ee.endShadows(),this.info.autoReset===!0&&this.info.reset();const ue=x.opaque,ee=x.transmissive;if(_.setupLights(),J.isArrayCamera){const Ae=J.cameras;if(ee.length>0)for(let we=0,Ye=Ae.length;we<Ye;we++){const We=Ae[we];es(ue,ee,I,We)}yt&&it.render(I);for(let we=0,Ye=Ae.length;we<Ye;we++){const We=Ae[we];Jr(x,I,We,We.viewport)}}else ee.length>0&&es(ue,ee,I,J),yt&&it.render(I),Jr(x,I,J);O!==null&&(F.updateMultisampleRenderTarget(O),F.updateRenderTargetMipmap(O)),I.isScene===!0&&I.onAfterRender(T,I,J),Pt.resetDefaultState(),b=-1,C=null,A.pop(),A.length>0?(_=A[A.length-1],de===!0&&Ee.setGlobalState(T.clippingPlanes,_.state.camera)):_=null,w.pop(),w.length>0?x=w[w.length-1]:x=null};function Yi(I,J,ce,ue){if(I.visible===!1)return;if(I.layers.test(J.layers)){if(I.isGroup)ce=I.renderOrder;else if(I.isLOD)I.autoUpdate===!0&&I.update(J);else if(I.isLight)_.pushLight(I),I.castShadow&&_.pushShadow(I);else if(I.isSprite){if(!I.frustumCulled||re.intersectsSprite(I)){ue&&nt.setFromMatrixPosition(I.matrixWorld).applyMatrix4(Ce);const we=fe.update(I),Ye=I.material;Ye.visible&&x.push(I,we,Ye,ce,nt.z,null)}}else if((I.isMesh||I.isLine||I.isPoints)&&(!I.frustumCulled||re.intersectsObject(I))){const we=fe.update(I),Ye=I.material;if(ue&&(I.boundingSphere!==void 0?(I.boundingSphere===null&&I.computeBoundingSphere(),nt.copy(I.boundingSphere.center)):(we.boundingSphere===null&&we.computeBoundingSphere(),nt.copy(we.boundingSphere.center)),nt.applyMatrix4(I.matrixWorld).applyMatrix4(Ce)),Array.isArray(Ye)){const We=we.groups;for(let st=0,lt=We.length;st<lt;st++){const $e=We[st],St=Ye[$e.materialIndex];St&&St.visible&&x.push(I,we,St,ce,nt.z,$e)}}else Ye.visible&&x.push(I,we,Ye,ce,nt.z,null)}}const Ae=I.children;for(let we=0,Ye=Ae.length;we<Ye;we++)Yi(Ae[we],J,ce,ue)}function Jr(I,J,ce,ue){const ee=I.opaque,Ae=I.transmissive,we=I.transparent;_.setupLightsView(ce),de===!0&&Ee.setGlobalState(T.clippingPlanes,ce),ue&&Je.viewport(z.copy(ue)),ee.length>0&&Sr(ee,J,ce),Ae.length>0&&Sr(Ae,J,ce),we.length>0&&Sr(we,J,ce),Je.buffers.depth.setTest(!0),Je.buffers.depth.setMask(!0),Je.buffers.color.setMask(!0),Je.setPolygonOffset(!1)}function es(I,J,ce,ue){if((ce.isScene===!0?ce.overrideMaterial:null)!==null)return;_.state.transmissionRenderTarget[ue.id]===void 0&&(_.state.transmissionRenderTarget[ue.id]=new Ns(1,1,{generateMipmaps:!0,type:_t.has("EXT_color_buffer_half_float")||_t.has("EXT_color_buffer_float")?Ba:yr,minFilter:Ls,samples:4,stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:At.workingColorSpace}));const Ae=_.state.transmissionRenderTarget[ue.id],we=ue.viewport||z;Ae.setSize(we.z,we.w);const Ye=T.getRenderTarget();T.setRenderTarget(Ae),T.getClearColor(j),q=T.getClearAlpha(),q<1&&T.setClearColor(16777215,.5),T.clear(),yt&&it.render(ce);const We=T.toneMapping;T.toneMapping=Kr;const st=ue.viewport;if(ue.viewport!==void 0&&(ue.viewport=void 0),_.setupLightsView(ue),de===!0&&Ee.setGlobalState(T.clippingPlanes,ue),Sr(I,ce,ue),F.updateMultisampleRenderTarget(Ae),F.updateRenderTargetMipmap(Ae),_t.has("WEBGL_multisampled_render_to_texture")===!1){let lt=!1;for(let $e=0,St=J.length;$e<St;$e++){const bt=J[$e],xt=bt.object,Mn=bt.geometry,ht=bt.material,Ke=bt.group;if(ht.side===Xi&&xt.layers.test(ue.layers)){const vi=ht.side;ht.side=Kn,ht.needsUpdate=!0,Ga(xt,ce,ue,Mn,ht,Ke),ht.side=vi,ht.needsUpdate=!0,lt=!0}}lt===!0&&(F.updateMultisampleRenderTarget(Ae),F.updateRenderTargetMipmap(Ae))}T.setRenderTarget(Ye),T.setClearColor(j,q),st!==void 0&&(ue.viewport=st),T.toneMapping=We}function Sr(I,J,ce){const ue=J.isScene===!0?J.overrideMaterial:null;for(let ee=0,Ae=I.length;ee<Ae;ee++){const we=I[ee],Ye=we.object,We=we.geometry,st=ue===null?we.material:ue,lt=we.group;Ye.layers.test(ce.layers)&&Ga(Ye,J,ce,We,st,lt)}}function Ga(I,J,ce,ue,ee,Ae){I.onBeforeRender(T,J,ce,ue,ee,Ae),I.modelViewMatrix.multiplyMatrices(ce.matrixWorldInverse,I.matrixWorld),I.normalMatrix.getNormalMatrix(I.modelViewMatrix),ee.onBeforeRender(T,J,ce,ue,I,Ae),ee.transparent===!0&&ee.side===Xi&&ee.forceSinglePass===!1?(ee.side=Kn,ee.needsUpdate=!0,T.renderBufferDirect(ce,J,ue,ee,I,Ae),ee.side=Qr,ee.needsUpdate=!0,T.renderBufferDirect(ce,J,ue,ee,I,Ae),ee.side=Xi):T.renderBufferDirect(ce,J,ue,ee,I,Ae),I.onAfterRender(T,J,ce,ue,ee,Ae)}function Os(I,J,ce){J.isScene!==!0&&(J=Dt);const ue=Qe.get(I),ee=_.state.lights,Ae=_.state.shadowsArray,we=ee.state.version,Ye=qe.getParameters(I,ee.state,Ae,J,ce),We=qe.getProgramCacheKey(Ye);let st=ue.programs;ue.environment=I.isMeshStandardMaterial?J.environment:null,ue.fog=J.fog,ue.envMap=(I.isMeshStandardMaterial?ae:L).get(I.envMap||ue.environment),ue.envMapRotation=ue.environment!==null&&I.envMap===null?J.environmentRotation:I.envMapRotation,st===void 0&&(I.addEventListener("dispose",ut),st=new Map,ue.programs=st);let lt=st.get(We);if(lt!==void 0){if(ue.currentProgram===lt&&ue.lightsStateVersion===we)return Ni(I,Ye),lt}else Ye.uniforms=qe.getUniforms(I),I.onBeforeCompile(Ye,T),lt=qe.acquireProgram(Ye,We),st.set(We,lt),ue.uniforms=Ye.uniforms;const $e=ue.uniforms;return(!I.isShaderMaterial&&!I.isRawShaderMaterial||I.clipping===!0)&&($e.clippingPlanes=Ee.uniform),Ni(I,Ye),ue.needsLights=Zc(I),ue.lightsStateVersion=we,ue.needsLights&&($e.ambientLightColor.value=ee.state.ambient,$e.lightProbe.value=ee.state.probe,$e.directionalLights.value=ee.state.directional,$e.directionalLightShadows.value=ee.state.directionalShadow,$e.spotLights.value=ee.state.spot,$e.spotLightShadows.value=ee.state.spotShadow,$e.rectAreaLights.value=ee.state.rectArea,$e.ltc_1.value=ee.state.rectAreaLTC1,$e.ltc_2.value=ee.state.rectAreaLTC2,$e.pointLights.value=ee.state.point,$e.pointLightShadows.value=ee.state.pointShadow,$e.hemisphereLights.value=ee.state.hemi,$e.directionalShadowMap.value=ee.state.directionalShadowMap,$e.directionalShadowMatrix.value=ee.state.directionalShadowMatrix,$e.spotShadowMap.value=ee.state.spotShadowMap,$e.spotLightMatrix.value=ee.state.spotLightMatrix,$e.spotLightMap.value=ee.state.spotLightMap,$e.pointShadowMap.value=ee.state.pointShadowMap,$e.pointShadowMatrix.value=ee.state.pointShadowMatrix),ue.currentProgram=lt,ue.uniformsList=null,lt}function Wa(I){if(I.uniformsList===null){const J=I.currentProgram.getUniforms();I.uniformsList=Dc.seqWithValue(J.seq,I.uniforms)}return I.uniformsList}function Ni(I,J){const ce=Qe.get(I);ce.outputColorSpace=J.outputColorSpace,ce.batching=J.batching,ce.batchingColor=J.batchingColor,ce.instancing=J.instancing,ce.instancingColor=J.instancingColor,ce.instancingMorph=J.instancingMorph,ce.skinning=J.skinning,ce.morphTargets=J.morphTargets,ce.morphNormals=J.morphNormals,ce.morphColors=J.morphColors,ce.morphTargetsCount=J.morphTargetsCount,ce.numClippingPlanes=J.numClippingPlanes,ce.numIntersection=J.numClipIntersection,ce.vertexAlphas=J.vertexAlphas,ce.vertexTangents=J.vertexTangents,ce.toneMapping=J.toneMapping}function Xa(I,J,ce,ue,ee){J.isScene!==!0&&(J=Dt),F.resetTextureUnits();const Ae=J.fog,we=ue.isMeshStandardMaterial?J.environment:null,Ye=O===null?T.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:Uo,We=(ue.isMeshStandardMaterial?ae:L).get(ue.envMap||we),st=ue.vertexColors===!0&&!!ce.attributes.color&&ce.attributes.color.itemSize===4,lt=!!ce.attributes.tangent&&(!!ue.normalMap||ue.anisotropy>0),$e=!!ce.morphAttributes.position,St=!!ce.morphAttributes.normal,bt=!!ce.morphAttributes.color;let xt=Kr;ue.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(xt=T.toneMapping);const Mn=ce.morphAttributes.position||ce.morphAttributes.normal||ce.morphAttributes.color,ht=Mn!==void 0?Mn.length:0,Ke=Qe.get(ue),vi=_.state.lights;if(de===!0&&(Me===!0||I!==C)){const Un=I===C&&ue.id===b;Ee.setState(ue,I,Un)}let Ct=!1;ue.version===Ke.__version?(Ke.needsLights&&Ke.lightsStateVersion!==vi.state.version||Ke.outputColorSpace!==Ye||ee.isBatchedMesh&&Ke.batching===!1||!ee.isBatchedMesh&&Ke.batching===!0||ee.isBatchedMesh&&Ke.batchingColor===!0&&ee.colorTexture===null||ee.isBatchedMesh&&Ke.batchingColor===!1&&ee.colorTexture!==null||ee.isInstancedMesh&&Ke.instancing===!1||!ee.isInstancedMesh&&Ke.instancing===!0||ee.isSkinnedMesh&&Ke.skinning===!1||!ee.isSkinnedMesh&&Ke.skinning===!0||ee.isInstancedMesh&&Ke.instancingColor===!0&&ee.instanceColor===null||ee.isInstancedMesh&&Ke.instancingColor===!1&&ee.instanceColor!==null||ee.isInstancedMesh&&Ke.instancingMorph===!0&&ee.morphTexture===null||ee.isInstancedMesh&&Ke.instancingMorph===!1&&ee.morphTexture!==null||Ke.envMap!==We||ue.fog===!0&&Ke.fog!==Ae||Ke.numClippingPlanes!==void 0&&(Ke.numClippingPlanes!==Ee.numPlanes||Ke.numIntersection!==Ee.numIntersection)||Ke.vertexAlphas!==st||Ke.vertexTangents!==lt||Ke.morphTargets!==$e||Ke.morphNormals!==St||Ke.morphColors!==bt||Ke.toneMapping!==xt||Ke.morphTargetsCount!==ht)&&(Ct=!0):(Ct=!0,Ke.__version=ue.version);let En=Ke.currentProgram;Ct===!0&&(En=Os(ue,J,ee));let _i=!1,ln=!1,Ui=!1;const Ft=En.getUniforms(),ai=Ke.uniforms;if(Je.useProgram(En.program)&&(_i=!0,ln=!0,Ui=!0),ue.id!==b&&(b=ue.id,ln=!0),_i||C!==I){Je.buffers.depth.getReversed()?(_e.copy(I.projectionMatrix),xx(_e),Sx(_e),Ft.setValue(te,"projectionMatrix",_e)):Ft.setValue(te,"projectionMatrix",I.projectionMatrix),Ft.setValue(te,"viewMatrix",I.matrixWorldInverse);const li=Ft.map.cameraPosition;li!==void 0&&li.setValue(te,Oe.setFromMatrixPosition(I.matrixWorld)),mt.logarithmicDepthBuffer&&Ft.setValue(te,"logDepthBufFC",2/(Math.log(I.far+1)/Math.LN2)),(ue.isMeshPhongMaterial||ue.isMeshToonMaterial||ue.isMeshLambertMaterial||ue.isMeshBasicMaterial||ue.isMeshStandardMaterial||ue.isShaderMaterial)&&Ft.setValue(te,"isOrthographic",I.isOrthographicCamera===!0),C!==I&&(C=I,ln=!0,Ui=!0)}if(ee.isSkinnedMesh){Ft.setOptional(te,ee,"bindMatrix"),Ft.setOptional(te,ee,"bindMatrixInverse");const Un=ee.skeleton;Un&&(Un.boneTexture===null&&Un.computeBoneTexture(),Ft.setValue(te,"boneTexture",Un.boneTexture,F))}ee.isBatchedMesh&&(Ft.setOptional(te,ee,"batchingTexture"),Ft.setValue(te,"batchingTexture",ee._matricesTexture,F),Ft.setOptional(te,ee,"batchingIdTexture"),Ft.setValue(te,"batchingIdTexture",ee._indirectTexture,F),Ft.setOptional(te,ee,"batchingColorTexture"),ee._colorsTexture!==null&&Ft.setValue(te,"batchingColorTexture",ee._colorsTexture,F));const $i=ce.morphAttributes;if(($i.position!==void 0||$i.normal!==void 0||$i.color!==void 0)&&rt.update(ee,ce,En),(ln||Ke.receiveShadow!==ee.receiveShadow)&&(Ke.receiveShadow=ee.receiveShadow,Ft.setValue(te,"receiveShadow",ee.receiveShadow)),ue.isMeshGouraudMaterial&&ue.envMap!==null&&(ai.envMap.value=We,ai.flipEnvMap.value=We.isCubeTexture&&We.isRenderTargetTexture===!1?-1:1),ue.isMeshStandardMaterial&&ue.envMap===null&&J.environment!==null&&(ai.envMapIntensity.value=J.environmentIntensity),ln&&(Ft.setValue(te,"toneMappingExposure",T.toneMappingExposure),Ke.needsLights&&ja(ai,Ui),Ae&&ue.fog===!0&&Pe.refreshFogUniforms(ai,Ae),Pe.refreshMaterialUniforms(ai,ue,H,ne,_.state.transmissionRenderTarget[I.id]),Dc.upload(te,Wa(Ke),ai,F)),ue.isShaderMaterial&&ue.uniformsNeedUpdate===!0&&(Dc.upload(te,Wa(Ke),ai,F),ue.uniformsNeedUpdate=!1),ue.isSpriteMaterial&&Ft.setValue(te,"center",ee.center),Ft.setValue(te,"modelViewMatrix",ee.modelViewMatrix),Ft.setValue(te,"normalMatrix",ee.normalMatrix),Ft.setValue(te,"modelMatrix",ee.matrixWorld),ue.isShaderMaterial||ue.isRawShaderMaterial){const Un=ue.uniformsGroups;for(let li=0,Hn=Un.length;li<Hn;li++){const qa=Un[li];Q.update(qa,En),Q.bind(qa,En)}}return En}function ja(I,J){I.ambientLightColor.needsUpdate=J,I.lightProbe.needsUpdate=J,I.directionalLights.needsUpdate=J,I.directionalLightShadows.needsUpdate=J,I.pointLights.needsUpdate=J,I.pointLightShadows.needsUpdate=J,I.spotLights.needsUpdate=J,I.spotLightShadows.needsUpdate=J,I.rectAreaLights.needsUpdate=J,I.hemisphereLights.needsUpdate=J}function Zc(I){return I.isMeshLambertMaterial||I.isMeshToonMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isShadowMaterial||I.isShaderMaterial&&I.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(I,J,ce){Qe.get(I.texture).__webglTexture=J,Qe.get(I.depthTexture).__webglTexture=ce;const ue=Qe.get(I);ue.__hasExternalTextures=!0,ue.__autoAllocateDepthBuffer=ce===void 0,ue.__autoAllocateDepthBuffer||_t.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ue.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(I,J){const ce=Qe.get(I);ce.__webglFramebuffer=J,ce.__useDefaultFramebuffer=J===void 0},this.setRenderTarget=function(I,J=0,ce=0){O=I,D=J,N=ce;let ue=!0,ee=null,Ae=!1,we=!1;if(I){const We=Qe.get(I);if(We.__useDefaultFramebuffer!==void 0)Je.bindFramebuffer(te.FRAMEBUFFER,null),ue=!1;else if(We.__webglFramebuffer===void 0)F.setupRenderTarget(I);else if(We.__hasExternalTextures)F.rebindTextures(I,Qe.get(I.texture).__webglTexture,Qe.get(I.depthTexture).__webglTexture);else if(I.depthBuffer){const $e=I.depthTexture;if(We.__boundDepthTexture!==$e){if($e!==null&&Qe.has($e)&&(I.width!==$e.image.width||I.height!==$e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");F.setupDepthRenderbuffer(I)}}const st=I.texture;(st.isData3DTexture||st.isDataArrayTexture||st.isCompressedArrayTexture)&&(we=!0);const lt=Qe.get(I).__webglFramebuffer;I.isWebGLCubeRenderTarget?(Array.isArray(lt[J])?ee=lt[J][ce]:ee=lt[J],Ae=!0):I.samples>0&&F.useMultisampledRTT(I)===!1?ee=Qe.get(I).__webglMultisampledFramebuffer:Array.isArray(lt)?ee=lt[ce]:ee=lt,z.copy(I.viewport),K.copy(I.scissor),B=I.scissorTest}else z.copy(V).multiplyScalar(H).floor(),K.copy(Z).multiplyScalar(H).floor(),B=be;if(Je.bindFramebuffer(te.FRAMEBUFFER,ee)&&ue&&Je.drawBuffers(I,ee),Je.viewport(z),Je.scissor(K),Je.setScissorTest(B),Ae){const We=Qe.get(I.texture);te.framebufferTexture2D(te.FRAMEBUFFER,te.COLOR_ATTACHMENT0,te.TEXTURE_CUBE_MAP_POSITIVE_X+J,We.__webglTexture,ce)}else if(we){const We=Qe.get(I.texture),st=J||0;te.framebufferTextureLayer(te.FRAMEBUFFER,te.COLOR_ATTACHMENT0,We.__webglTexture,ce||0,st)}b=-1},this.readRenderTargetPixels=function(I,J,ce,ue,ee,Ae,we){if(!(I&&I.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ye=Qe.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&we!==void 0&&(Ye=Ye[we]),Ye){Je.bindFramebuffer(te.FRAMEBUFFER,Ye);try{const We=I.texture,st=We.format,lt=We.type;if(!mt.textureFormatReadable(st)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!mt.textureTypeReadable(lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}J>=0&&J<=I.width-ue&&ce>=0&&ce<=I.height-ee&&te.readPixels(J,ce,ue,ee,ct.convert(st),ct.convert(lt),Ae)}finally{const We=O!==null?Qe.get(O).__webglFramebuffer:null;Je.bindFramebuffer(te.FRAMEBUFFER,We)}}},this.readRenderTargetPixelsAsync=async function(I,J,ce,ue,ee,Ae,we){if(!(I&&I.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ye=Qe.get(I).__webglFramebuffer;if(I.isWebGLCubeRenderTarget&&we!==void 0&&(Ye=Ye[we]),Ye){const We=I.texture,st=We.format,lt=We.type;if(!mt.textureFormatReadable(st))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!mt.textureTypeReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(J>=0&&J<=I.width-ue&&ce>=0&&ce<=I.height-ee){Je.bindFramebuffer(te.FRAMEBUFFER,Ye);const $e=te.createBuffer();te.bindBuffer(te.PIXEL_PACK_BUFFER,$e),te.bufferData(te.PIXEL_PACK_BUFFER,Ae.byteLength,te.STREAM_READ),te.readPixels(J,ce,ue,ee,ct.convert(st),ct.convert(lt),0);const St=O!==null?Qe.get(O).__webglFramebuffer:null;Je.bindFramebuffer(te.FRAMEBUFFER,St);const bt=te.fenceSync(te.SYNC_GPU_COMMANDS_COMPLETE,0);return te.flush(),await yx(te,bt,4),te.bindBuffer(te.PIXEL_PACK_BUFFER,$e),te.getBufferSubData(te.PIXEL_PACK_BUFFER,0,Ae),te.deleteBuffer($e),te.deleteSync(bt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(I,J=null,ce=0){I.isTexture!==!0&&(La("WebGLRenderer: copyFramebufferToTexture function signature has changed."),J=arguments[0]||null,I=arguments[1]);const ue=Math.pow(2,-ce),ee=Math.floor(I.image.width*ue),Ae=Math.floor(I.image.height*ue),we=J!==null?J.x:0,Ye=J!==null?J.y:0;F.setTexture2D(I,0),te.copyTexSubImage2D(te.TEXTURE_2D,ce,0,0,we,Ye,ee,Ae),Je.unbindTexture()},this.copyTextureToTexture=function(I,J,ce=null,ue=null,ee=0){I.isTexture!==!0&&(La("WebGLRenderer: copyTextureToTexture function signature has changed."),ue=arguments[0]||null,I=arguments[1],J=arguments[2],ee=arguments[3]||0,ce=null);let Ae,we,Ye,We,st,lt,$e,St,bt;const xt=I.isCompressedTexture?I.mipmaps[ee]:I.image;ce!==null?(Ae=ce.max.x-ce.min.x,we=ce.max.y-ce.min.y,Ye=ce.isBox3?ce.max.z-ce.min.z:1,We=ce.min.x,st=ce.min.y,lt=ce.isBox3?ce.min.z:0):(Ae=xt.width,we=xt.height,Ye=xt.depth||1,We=0,st=0,lt=0),ue!==null?($e=ue.x,St=ue.y,bt=ue.z):($e=0,St=0,bt=0);const Mn=ct.convert(J.format),ht=ct.convert(J.type);let Ke;J.isData3DTexture?(F.setTexture3D(J,0),Ke=te.TEXTURE_3D):J.isDataArrayTexture||J.isCompressedArrayTexture?(F.setTexture2DArray(J,0),Ke=te.TEXTURE_2D_ARRAY):(F.setTexture2D(J,0),Ke=te.TEXTURE_2D),te.pixelStorei(te.UNPACK_FLIP_Y_WEBGL,J.flipY),te.pixelStorei(te.UNPACK_PREMULTIPLY_ALPHA_WEBGL,J.premultiplyAlpha),te.pixelStorei(te.UNPACK_ALIGNMENT,J.unpackAlignment);const vi=te.getParameter(te.UNPACK_ROW_LENGTH),Ct=te.getParameter(te.UNPACK_IMAGE_HEIGHT),En=te.getParameter(te.UNPACK_SKIP_PIXELS),_i=te.getParameter(te.UNPACK_SKIP_ROWS),ln=te.getParameter(te.UNPACK_SKIP_IMAGES);te.pixelStorei(te.UNPACK_ROW_LENGTH,xt.width),te.pixelStorei(te.UNPACK_IMAGE_HEIGHT,xt.height),te.pixelStorei(te.UNPACK_SKIP_PIXELS,We),te.pixelStorei(te.UNPACK_SKIP_ROWS,st),te.pixelStorei(te.UNPACK_SKIP_IMAGES,lt);const Ui=I.isDataArrayTexture||I.isData3DTexture,Ft=J.isDataArrayTexture||J.isData3DTexture;if(I.isRenderTargetTexture||I.isDepthTexture){const ai=Qe.get(I),$i=Qe.get(J),Un=Qe.get(ai.__renderTarget),li=Qe.get($i.__renderTarget);Je.bindFramebuffer(te.READ_FRAMEBUFFER,Un.__webglFramebuffer),Je.bindFramebuffer(te.DRAW_FRAMEBUFFER,li.__webglFramebuffer);for(let Hn=0;Hn<Ye;Hn++)Ui&&te.framebufferTextureLayer(te.READ_FRAMEBUFFER,te.COLOR_ATTACHMENT0,Qe.get(I).__webglTexture,ee,lt+Hn),I.isDepthTexture?(Ft&&te.framebufferTextureLayer(te.DRAW_FRAMEBUFFER,te.COLOR_ATTACHMENT0,Qe.get(J).__webglTexture,ee,bt+Hn),te.blitFramebuffer(We,st,Ae,we,$e,St,Ae,we,te.DEPTH_BUFFER_BIT,te.NEAREST)):Ft?te.copyTexSubImage3D(Ke,ee,$e,St,bt+Hn,We,st,Ae,we):te.copyTexSubImage2D(Ke,ee,$e,St,bt+Hn,We,st,Ae,we);Je.bindFramebuffer(te.READ_FRAMEBUFFER,null),Je.bindFramebuffer(te.DRAW_FRAMEBUFFER,null)}else Ft?I.isDataTexture||I.isData3DTexture?te.texSubImage3D(Ke,ee,$e,St,bt,Ae,we,Ye,Mn,ht,xt.data):J.isCompressedArrayTexture?te.compressedTexSubImage3D(Ke,ee,$e,St,bt,Ae,we,Ye,Mn,xt.data):te.texSubImage3D(Ke,ee,$e,St,bt,Ae,we,Ye,Mn,ht,xt):I.isDataTexture?te.texSubImage2D(te.TEXTURE_2D,ee,$e,St,Ae,we,Mn,ht,xt.data):I.isCompressedTexture?te.compressedTexSubImage2D(te.TEXTURE_2D,ee,$e,St,xt.width,xt.height,Mn,xt.data):te.texSubImage2D(te.TEXTURE_2D,ee,$e,St,Ae,we,Mn,ht,xt);te.pixelStorei(te.UNPACK_ROW_LENGTH,vi),te.pixelStorei(te.UNPACK_IMAGE_HEIGHT,Ct),te.pixelStorei(te.UNPACK_SKIP_PIXELS,En),te.pixelStorei(te.UNPACK_SKIP_ROWS,_i),te.pixelStorei(te.UNPACK_SKIP_IMAGES,ln),ee===0&&J.generateMipmaps&&te.generateMipmap(Ke),Je.unbindTexture()},this.copyTextureToTexture3D=function(I,J,ce=null,ue=null,ee=0){return I.isTexture!==!0&&(La("WebGLRenderer: copyTextureToTexture3D function signature has changed."),ce=arguments[0]||null,ue=arguments[1]||null,I=arguments[2],J=arguments[3],ee=arguments[4]||0),La('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(I,J,ce,ue,ee)},this.initRenderTarget=function(I){Qe.get(I).__webglFramebuffer===void 0&&F.setupRenderTarget(I)},this.initTexture=function(I){I.isCubeTexture?F.setTextureCube(I,0):I.isData3DTexture?F.setTexture3D(I,0):I.isDataArrayTexture||I.isCompressedArrayTexture?F.setTexture2DArray(I,0):F.setTexture2D(I,0),Je.unbindTexture()},this.resetState=function(){D=0,N=0,O=null,Je.reset(),Pt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=At._getDrawingBufferColorSpace(e),t.unpackColorSpace=At._getUnpackColorSpace()}}class P1 extends on{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new si,this.environmentIntensity=1,this.environmentRotation=new si,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Mf extends Oo{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new at(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const zc=new Y,Bc=new Y,rv=new kt,Ea=new _f,gc=new Wc,cd=new Y,sv=new Y;class pr extends on{constructor(e=new Sn,t=new Mf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,o=t.count;s<o;s++)zc.fromBufferAttribute(t,s-1),Bc.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=zc.distanceTo(Bc);e.setAttribute("lineDistance",new $t(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,o=e.params.Line.threshold,c=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),gc.copy(i.boundingSphere),gc.applyMatrix4(s),gc.radius+=o,e.ray.intersectsSphere(gc)===!1)return;rv.copy(s).invert(),Ea.copy(e.ray).applyMatrix4(rv);const u=o/((this.scale.x+this.scale.y+this.scale.z)/3),d=u*u,f=this.isLineSegments?2:1,m=i.index,p=i.attributes.position;if(m!==null){const y=Math.max(0,c.start),M=Math.min(m.count,c.start+c.count);for(let E=y,x=M-1;E<x;E+=f){const _=m.getX(E),w=m.getX(E+1),A=vc(this,e,Ea,d,_,w);A&&t.push(A)}if(this.isLineLoop){const E=m.getX(M-1),x=m.getX(y),_=vc(this,e,Ea,d,E,x);_&&t.push(_)}}else{const y=Math.max(0,c.start),M=Math.min(p.count,c.start+c.count);for(let E=y,x=M-1;E<x;E+=f){const _=vc(this,e,Ea,d,E,E+1);_&&t.push(_)}if(this.isLineLoop){const E=vc(this,e,Ea,d,M-1,y);E&&t.push(E)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,c=s.length;o<c;o++){const u=s[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=o}}}}}function vc(a,e,t,i,s,o){const c=a.geometry.attributes.position;if(zc.fromBufferAttribute(c,s),Bc.fromBufferAttribute(c,o),t.distanceSqToSegment(zc,Bc,cd,sv)>i)return;cd.applyMatrix4(a.matrixWorld);const d=e.ray.origin.distanceTo(cd);if(!(d<e.near||d>e.far))return{distance:d,point:sv.clone().applyMatrix4(a.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:a}}const ov=new Y,av=new Y;class L1 extends pr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,o=t.count;s<o;s+=2)ov.fromBufferAttribute(t,s),av.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+ov.distanceTo(av);e.setAttribute("lineDistance",new $t(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class I1 extends In{constructor(e,t,i,s,o,c,u,d,f){super(e,t,i,s,o,c,u,d,f),this.isCanvasTexture=!0,this.needsUpdate=!0}}class xn extends Sn{constructor(e=1,t=1,i=1,s=32,o=1,c=!1,u=0,d=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:o,openEnded:c,thetaStart:u,thetaLength:d};const f=this;s=Math.floor(s),o=Math.floor(o);const m=[],v=[],p=[],y=[];let M=0;const E=[],x=i/2;let _=0;w(),c===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(m),this.setAttribute("position",new $t(v,3)),this.setAttribute("normal",new $t(p,3)),this.setAttribute("uv",new $t(y,2));function w(){const T=new Y,U=new Y;let D=0;const N=(t-e)/i;for(let O=0;O<=o;O++){const b=[],C=O/o,z=C*(t-e)+e;for(let K=0;K<=s;K++){const B=K/s,j=B*d+u,q=Math.sin(j),G=Math.cos(j);U.x=z*q,U.y=-C*i+x,U.z=z*G,v.push(U.x,U.y,U.z),T.set(q,N,G).normalize(),p.push(T.x,T.y,T.z),y.push(B,1-C),b.push(M++)}E.push(b)}for(let O=0;O<s;O++)for(let b=0;b<o;b++){const C=E[b][O],z=E[b+1][O],K=E[b+1][O+1],B=E[b][O+1];(e>0||b!==0)&&(m.push(C,z,B),D+=3),(t>0||b!==o-1)&&(m.push(z,K,B),D+=3)}f.addGroup(_,D,0),_+=D}function A(T){const U=M,D=new Mt,N=new Y;let O=0;const b=T===!0?e:t,C=T===!0?1:-1;for(let K=1;K<=s;K++)v.push(0,x*C,0),p.push(0,C,0),y.push(.5,.5),M++;const z=M;for(let K=0;K<=s;K++){const j=K/s*d+u,q=Math.cos(j),G=Math.sin(j);N.x=b*G,N.y=x*C,N.z=b*q,v.push(N.x,N.y,N.z),p.push(0,C,0),D.x=q*.5+.5,D.y=G*.5*C+.5,y.push(D.x,D.y),M++}for(let K=0;K<s;K++){const B=U+K,j=z+K;T===!0?m.push(j,j+1,B):m.push(j+1,j,B),O+=3}f.addGroup(_,O,T===!0?1:2),_+=O}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ef extends Sn{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const o=[],c=[];u(s),f(i),m(),this.setAttribute("position",new $t(o,3)),this.setAttribute("normal",new $t(o.slice(),3)),this.setAttribute("uv",new $t(c,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function u(w){const A=new Y,T=new Y,U=new Y;for(let D=0;D<t.length;D+=3)y(t[D+0],A),y(t[D+1],T),y(t[D+2],U),d(A,T,U,w)}function d(w,A,T,U){const D=U+1,N=[];for(let O=0;O<=D;O++){N[O]=[];const b=w.clone().lerp(T,O/D),C=A.clone().lerp(T,O/D),z=D-O;for(let K=0;K<=z;K++)K===0&&O===D?N[O][K]=b:N[O][K]=b.clone().lerp(C,K/z)}for(let O=0;O<D;O++)for(let b=0;b<2*(D-O)-1;b++){const C=Math.floor(b/2);b%2===0?(p(N[O][C+1]),p(N[O+1][C]),p(N[O][C])):(p(N[O][C+1]),p(N[O+1][C+1]),p(N[O+1][C]))}}function f(w){const A=new Y;for(let T=0;T<o.length;T+=3)A.x=o[T+0],A.y=o[T+1],A.z=o[T+2],A.normalize().multiplyScalar(w),o[T+0]=A.x,o[T+1]=A.y,o[T+2]=A.z}function m(){const w=new Y;for(let A=0;A<o.length;A+=3){w.x=o[A+0],w.y=o[A+1],w.z=o[A+2];const T=x(w)/2/Math.PI+.5,U=_(w)/Math.PI+.5;c.push(T,1-U)}M(),v()}function v(){for(let w=0;w<c.length;w+=6){const A=c[w+0],T=c[w+2],U=c[w+4],D=Math.max(A,T,U),N=Math.min(A,T,U);D>.9&&N<.1&&(A<.2&&(c[w+0]+=1),T<.2&&(c[w+2]+=1),U<.2&&(c[w+4]+=1))}}function p(w){o.push(w.x,w.y,w.z)}function y(w,A){const T=w*3;A.x=e[T+0],A.y=e[T+1],A.z=e[T+2]}function M(){const w=new Y,A=new Y,T=new Y,U=new Y,D=new Mt,N=new Mt,O=new Mt;for(let b=0,C=0;b<o.length;b+=9,C+=6){w.set(o[b+0],o[b+1],o[b+2]),A.set(o[b+3],o[b+4],o[b+5]),T.set(o[b+6],o[b+7],o[b+8]),D.set(c[C+0],c[C+1]),N.set(c[C+2],c[C+3]),O.set(c[C+4],c[C+5]),U.copy(w).add(A).add(T).divideScalar(3);const z=x(U);E(D,C+0,w,z),E(N,C+2,A,z),E(O,C+4,T,z)}}function E(w,A,T,U){U<0&&w.x===1&&(c[A]=w.x-1),T.x===0&&T.z===0&&(c[A]=U/2/Math.PI+.5)}function x(w){return Math.atan2(w.z,-w.x)}function _(w){return Math.atan2(-w.y,Math.sqrt(w.x*w.x+w.z*w.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ef(e.vertices,e.indices,e.radius,e.details)}}class To extends Ef{constructor(e=1,t=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new To(e.radius,e.detail)}}class qc extends Sn{constructor(e=1,t=32,i=16,s=0,o=Math.PI*2,c=0,u=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:o,thetaStart:c,thetaLength:u},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const d=Math.min(c+u,Math.PI);let f=0;const m=[],v=new Y,p=new Y,y=[],M=[],E=[],x=[];for(let _=0;_<=i;_++){const w=[],A=_/i;let T=0;_===0&&c===0?T=.5/t:_===i&&d===Math.PI&&(T=-.5/t);for(let U=0;U<=t;U++){const D=U/t;v.x=-e*Math.cos(s+D*o)*Math.sin(c+A*u),v.y=e*Math.cos(c+A*u),v.z=e*Math.sin(s+D*o)*Math.sin(c+A*u),M.push(v.x,v.y,v.z),p.copy(v).normalize(),E.push(p.x,p.y,p.z),x.push(D+T,1-A),w.push(f++)}m.push(w)}for(let _=0;_<i;_++)for(let w=0;w<t;w++){const A=m[_][w+1],T=m[_][w],U=m[_+1][w],D=m[_+1][w+1];(_!==0||c>0)&&y.push(A,T,D),(_!==i-1||d<Math.PI)&&y.push(T,U,D)}this.setIndex(y),this.setAttribute("position",new $t(M,3)),this.setAttribute("normal",new $t(E,3)),this.setAttribute("uv",new $t(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Rs extends Sn{constructor(e=1,t=.4,i=12,s=48,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:o},i=Math.floor(i),s=Math.floor(s);const c=[],u=[],d=[],f=[],m=new Y,v=new Y,p=new Y;for(let y=0;y<=i;y++)for(let M=0;M<=s;M++){const E=M/s*o,x=y/i*Math.PI*2;v.x=(e+t*Math.cos(x))*Math.cos(E),v.y=(e+t*Math.cos(x))*Math.sin(E),v.z=t*Math.sin(x),u.push(v.x,v.y,v.z),m.x=e*Math.cos(E),m.y=e*Math.sin(E),p.subVectors(v,m).normalize(),d.push(p.x,p.y,p.z),f.push(M/s),f.push(y/i)}for(let y=1;y<=i;y++)for(let M=1;M<=s;M++){const E=(s+1)*y+M-1,x=(s+1)*(y-1)+M-1,_=(s+1)*(y-1)+M,w=(s+1)*y+M;c.push(E,x,w),c.push(x,_,w)}this.setIndex(c),this.setAttribute("position",new $t(u,3)),this.setAttribute("normal",new $t(d,3)),this.setAttribute("uv",new $t(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rs(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class of extends Oo{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new at(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=a0,this.normalScale=new Mt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}const lv={enabled:!1,files:{},add:function(a,e){this.enabled!==!1&&(this.files[a]=e)},get:function(a){if(this.enabled!==!1)return this.files[a]},remove:function(a){delete this.files[a]},clear:function(){this.files={}}};class D1{constructor(e,t,i){const s=this;let o=!1,c=0,u=0,d;const f=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(m){u++,o===!1&&s.onStart!==void 0&&s.onStart(m,c,u),o=!0},this.itemEnd=function(m){c++,s.onProgress!==void 0&&s.onProgress(m,c,u),c===u&&(o=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(m){s.onError!==void 0&&s.onError(m)},this.resolveURL=function(m){return d?d(m):m},this.setURLModifier=function(m){return d=m,this},this.addHandler=function(m,v){return f.push(m,v),this},this.removeHandler=function(m){const v=f.indexOf(m);return v!==-1&&f.splice(v,2),this},this.getHandler=function(m){for(let v=0,p=f.length;v<p;v+=2){const y=f[v],M=f[v+1];if(y.global&&(y.lastIndex=0),y.test(m))return M}return null}}}const N1=new D1;class wf{constructor(e){this.manager=e!==void 0?e:N1,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,o){i.load(e,s,t,o)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}wf.DEFAULT_MATERIAL_NAME="__DEFAULT";class U1 extends wf{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const o=this,c=lv.get(e);if(c!==void 0)return o.manager.itemStart(e),setTimeout(function(){t&&t(c),o.manager.itemEnd(e)},0),c;const u=Oa("img");function d(){m(),lv.add(e,this),t&&t(this),o.manager.itemEnd(e)}function f(v){m(),s&&s(v),o.manager.itemError(e),o.manager.itemEnd(e)}function m(){u.removeEventListener("load",d,!1),u.removeEventListener("error",f,!1)}return u.addEventListener("load",d,!1),u.addEventListener("error",f,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(u.crossOrigin=this.crossOrigin),o.manager.itemStart(e),u.src=e,u}}class F1 extends wf{constructor(e){super(e)}load(e,t,i,s){const o=new In,c=new U1(this.manager);return c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(e,function(u){o.image=u,o.needsUpdate=!0,t!==void 0&&t(o)},i,s),o}}class A0 extends on{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new at(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const ud=new kt,cv=new Y,uv=new Y;class O1{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Mt(512,512),this.map=null,this.mapPass=null,this.matrix=new kt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xf,this._frameExtents=new Mt(1,1),this._viewportCount=1,this._viewports=[new Qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;cv.setFromMatrixPosition(e.matrixWorld),t.position.copy(cv),uv.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uv),t.updateMatrixWorld(),ud.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ud),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ud)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class z1 extends O1{constructor(){super(new x0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class B1 extends A0{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(on.DEFAULT_UP),this.updateMatrix(),this.target=new on,this.shadow=new z1}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class k1 extends A0{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class H1{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=hv(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=hv();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function hv(){return performance.now()}const dv=new kt;class C0{constructor(e,t,i=0,s=1/0){this.ray=new _f(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new yf,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return dv.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(dv),this}intersectObject(e,t=!0,i=[]){return af(e,this,i,t),i.sort(fv),i}intersectObjects(e,t=!0,i=[]){for(let s=0,o=e.length;s<o;s++)af(e[s],this,i,t);return i.sort(fv),i}}function fv(a,e){return a.distance-e.distance}function af(a,e,t,i){let s=!0;if(a.layers.test(e.layers)&&a.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const o=a.children;for(let c=0,u=o.length;c<u;c++)af(o[c],e,t,!0)}}const _c=new Fo;class V1 extends L1{constructor(e,t=16776960){const i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),o=new Sn;o.setIndex(new Qn(i,1)),o.setAttribute("position",new Qn(s,3)),super(o,new Mf({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(e){if(e!==void 0&&console.warn("THREE.BoxHelper: .update() has no longer arguments."),this.object!==void 0&&_c.setFromObject(this.object),_c.isEmpty())return;const t=_c.min,i=_c.max,s=this.geometry.attributes.position,o=s.array;o[0]=i.x,o[1]=i.y,o[2]=i.z,o[3]=t.x,o[4]=i.y,o[5]=i.z,o[6]=t.x,o[7]=t.y,o[8]=i.z,o[9]=i.x,o[10]=t.y,o[11]=i.z,o[12]=i.x,o[13]=i.y,o[14]=t.z,o[15]=t.x,o[16]=i.y,o[17]=t.z,o[18]=t.x,o[19]=t.y,o[20]=t.z,o[21]=i.x,o[22]=t.y,o[23]=t.z,s.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class G1 extends Us{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:hf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=hf);class W1{constructor(e){Ne(this,"camera");Ne(this,"keys",new Set);Ne(this,"moveDir",new Y);Ne(this,"pointerLocked",!1);Ne(this,"enabled",!0);Ne(this,"yaw",0);Ne(this,"pitch",0);Ne(this,"moveSpeed",6);Ne(this,"lookSensitivity",.0025);this.camera=e}setEnabled(e){this.enabled=e,e||(this.keys.clear(),this.moveDir.set(0,0,0))}isEnabled(){return this.enabled}attach(e){const t=f=>{const m=f;return m?!!m.closest("input, textarea, select, [contenteditable='true']"):!1},i=f=>{this.enabled&&(t(f.target)||(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(f.code)&&f.preventDefault(),this.keys.add(f.code)))},s=f=>{t(f.target)||this.keys.delete(f.code)},o=()=>{this.pointerLocked=document.pointerLockElement===e},c=f=>{if(!this.enabled||!this.pointerLocked)return;this.yaw-=f.movementX*this.lookSensitivity,this.pitch-=f.movementY*this.lookSensitivity;const m=Math.PI/2-.01;this.pitch=Math.max(-m,Math.min(m,this.pitch))},u=f=>{this.enabled&&f.button===2&&(f.preventDefault(),document.pointerLockElement!==e&&e.requestPointerLock())},d=f=>{f.preventDefault()};return window.addEventListener("keydown",i),window.addEventListener("keyup",s),e.addEventListener("mousemove",c),e.addEventListener("mousedown",u),e.addEventListener("contextmenu",d),document.addEventListener("pointerlockchange",o),()=>{window.removeEventListener("keydown",i),window.removeEventListener("keyup",s),e.removeEventListener("mousemove",c),e.removeEventListener("mousedown",u),e.removeEventListener("contextmenu",d),document.removeEventListener("pointerlockchange",o),document.pointerLockElement===e&&document.exitPointerLock()}}update(e){if(this.enabled&&(this.camera.rotation.order="YXZ",this.camera.rotation.y=this.yaw,this.camera.rotation.x=this.pitch,this.moveDir.set(0,0,0),this.keys.has("KeyW")&&(this.moveDir.z-=1),this.keys.has("KeyS")&&(this.moveDir.z+=1),this.keys.has("KeyA")&&(this.moveDir.x-=1),this.keys.has("KeyD")&&(this.moveDir.x+=1),this.keys.has("Space")&&(this.moveDir.y+=1),(this.keys.has("ShiftLeft")||this.keys.has("ShiftRight"))&&(this.moveDir.y-=1),this.moveDir.lengthSq()>0)){this.moveDir.normalize();const t=this.moveSpeed*e;this.camera.translateX(this.moveDir.x*t),this.camera.translateY(this.moveDir.y*t),this.camera.translateZ(this.moveDir.z*t)}}captureState(){return{position:this.camera.position.clone(),yaw:this.yaw,pitch:this.pitch}}restoreState(e){this.camera.position.copy(e.position),this.yaw=e.yaw,this.pitch=e.pitch,this.camera.rotation.order="YXZ",this.camera.rotation.y=this.yaw,this.camera.rotation.x=this.pitch}}class X1{static create(e,t){const i=Math.max(.05,t);switch(e){case"box":return new Kt(i,i,i);case"sphere":return new qc(i*.55,24,16);case"cylinder":return new xn(i*.45,i*.45,i,24);case"plane":return new zo(i*2,i*2);default:return new Kt(i,i,i)}}}const mr=256;function j1(){const a=document.createElement("canvas");return a.width=mr,a.height=mr,a}function yc(a,e,t){const i=Math.sin(a*12.9898+e*78.233+t*.001)*43758.5453;return i-Math.floor(i)}function Nc(a,e,t){let i=.55,s=3,o=0;for(let c=0;c<4;c+=1){const u=Math.floor(a*s),d=Math.floor(e*s),f=yc(u,d,t+c*17),m=yc(u+1,d,t+c*17),v=yc(u,d+1,t+c*17),p=yc(u+1,d+1,t+c*17),y=a*s-u,M=e*s-d,E=y*y*(3-2*y),x=M*M*(3-2*M),_=f*(1-E)+m*E,w=v*(1-E)+p*E;o+=(_*(1-x)+w*x)*i,i*=.5,s*=2.1}return Math.min(1,Math.max(0,o))}function q1(a,e=1337){const t=j1(),i=t.getContext("2d");if(!i)return t;const s=i.createImageData(mr,mr),o=s.data;for(let c=0;c<mr;c+=1)for(let u=0;u<mr;u+=1){const d=u/mr,f=c/mr,m=Nc(d,f,e);let v=80,p=120,y=60;if(a==="grass")v=40+m*90,p=110+m*80,y=40+m*40;else if(a==="stone"){const E=90+m*70;v=E,p=E*.95,y=E*.9}else if(a==="sand")v=200+m*40,p=170+m*35,y=110+m*25;else if(a==="metal"){const E=120+m*80;v=E,p=E*.97,y=E*1.02}else v=m*255,p=Nc(d+.3,f-.1,e+3)*255,y=Nc(d-.2,f+.4,e+9)*255;const M=(c*mr+u)*4;o[M]=v,o[M+1]=p,o[M+2]=y,o[M+3]=255}return i.putImageData(s,0,0),t}class Y1{constructor(){Ne(this,"textures",new Map);Ne(this,"inflight",new Set);Ne(this,"notify")}setNotifier(e){this.notify=e}has(e){return this.textures.has(e)}get(e){return this.textures.get(e)}ensure(e){if(!e||this.textures.has(e)||this.inflight.has(e))return;this.inflight.add(e),new F1().load(e,i=>{var s;i.wrapS=Is,i.wrapT=Is,i.colorSpace=Bn,this.textures.set(e,i),this.inflight.delete(e),(s=this.notify)==null||s.call(this)},void 0,()=>{this.inflight.delete(e)})}}const kc=new Y1,pv=new Map;function $1(a,e){const t=e.surface.mapDataUrl?kc.has(e.surface.mapDataUrl):!0;return[a,e.enabled,e.primitive,e.size,e.color,e.surface.mode,e.surface.mapDataUrl,t?"mapReady":"mapPending",e.surface.tilingU,e.surface.tilingV,e.surface.offsetU,e.surface.offsetV,e.surface.rotation,e.surface.proceduralPreset,e.surface.shaderId].join("|")}function Uc(a){return`${a.primitive}:${a.size}`}function mv(a,e,t,i,s){e.surface.mapDataUrl&&kc.ensure(e.surface.mapDataUrl);const o=$1(a.userData.gameObjectId??"",e),c=!t||t.signature!==o;if(c&&t&&("map"in t.material&&t.material.map&&(t.material.map=null),t.material.dispose()),c)if(e.surface.mode==="shader"){const u=i.createBuiltIn(e.surface.shaderId);a.material=u,t={mesh:a,material:u,signature:o,primitiveKey:Uc(e)}}else if(e.surface.mode==="procedural"){const u=e.surface.proceduralPreset;let d=pv.get(u);if(!d){const m=q1(e.surface.proceduralPreset);d=new I1(m),d.colorSpace=Bn,d.wrapS=Is,d.wrapT=Is,pv.set(u,d)}const f=new of({map:d,color:e.color});gv(f,e),a.material=f,t={mesh:a,material:f,signature:o,primitiveKey:Uc(e)}}else{const u=new of({color:e.color}),d=e.surface.mapDataUrl?kc.get(e.surface.mapDataUrl):void 0;d&&(u.map=d),gv(u,e),a.material=u,t={mesh:a,material:u,signature:o,primitiveKey:Uc(e)}}return t=t,Z1(t.material,s,e),t}function gv(a,e){a.map&&(a.map.repeat.set(e.surface.tilingU,e.surface.tilingV),a.map.offset.set(e.surface.offsetU,e.surface.offsetV),a.map.rotation=e.surface.rotation,a.map.needsUpdate=!0)}function Z1(a,e,t){var i;a instanceof Di&&(a.uniforms.uTime&&(a.uniforms.uTime.value=e),a.uniforms.uColor&&(a.uniforms.uColor.value=new at(t.color)),((i=a.uniforms.uBaseColor)==null?void 0:i.value)instanceof at&&a.uniforms.uBaseColor.value.set(t.color))}class Li{constructor(e){e===void 0&&(e=[0,0,0,0,0,0,0,0,0]),this.elements=e}identity(){const e=this.elements;e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=1,e[5]=0,e[6]=0,e[7]=0,e[8]=1}setZero(){const e=this.elements;e[0]=0,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=0,e[6]=0,e[7]=0,e[8]=0}setTrace(e){const t=this.elements;t[0]=e.x,t[4]=e.y,t[8]=e.z}getTrace(e){e===void 0&&(e=new P);const t=this.elements;return e.x=t[0],e.y=t[4],e.z=t[8],e}vmult(e,t){t===void 0&&(t=new P);const i=this.elements,s=e.x,o=e.y,c=e.z;return t.x=i[0]*s+i[1]*o+i[2]*c,t.y=i[3]*s+i[4]*o+i[5]*c,t.z=i[6]*s+i[7]*o+i[8]*c,t}smult(e){for(let t=0;t<this.elements.length;t++)this.elements[t]*=e}mmult(e,t){t===void 0&&(t=new Li);const i=this.elements,s=e.elements,o=t.elements,c=i[0],u=i[1],d=i[2],f=i[3],m=i[4],v=i[5],p=i[6],y=i[7],M=i[8],E=s[0],x=s[1],_=s[2],w=s[3],A=s[4],T=s[5],U=s[6],D=s[7],N=s[8];return o[0]=c*E+u*w+d*U,o[1]=c*x+u*A+d*D,o[2]=c*_+u*T+d*N,o[3]=f*E+m*w+v*U,o[4]=f*x+m*A+v*D,o[5]=f*_+m*T+v*N,o[6]=p*E+y*w+M*U,o[7]=p*x+y*A+M*D,o[8]=p*_+y*T+M*N,t}scale(e,t){t===void 0&&(t=new Li);const i=this.elements,s=t.elements;for(let o=0;o!==3;o++)s[3*o+0]=e.x*i[3*o+0],s[3*o+1]=e.y*i[3*o+1],s[3*o+2]=e.z*i[3*o+2];return t}solve(e,t){t===void 0&&(t=new P);const i=3,s=4,o=[];let c,u;for(c=0;c<i*s;c++)o.push(0);for(c=0;c<3;c++)for(u=0;u<3;u++)o[c+s*u]=this.elements[c+3*u];o[3]=e.x,o[7]=e.y,o[11]=e.z;let d=3;const f=d;let m;const v=4;let p;do{if(c=f-d,o[c+s*c]===0){for(u=c+1;u<f;u++)if(o[c+s*u]!==0){m=v;do p=v-m,o[p+s*c]+=o[p+s*u];while(--m);break}}if(o[c+s*c]!==0)for(u=c+1;u<f;u++){const y=o[c+s*u]/o[c+s*c];m=v;do p=v-m,o[p+s*u]=p<=c?0:o[p+s*u]-o[p+s*c]*y;while(--m)}}while(--d);if(t.z=o[2*s+3]/o[2*s+2],t.y=(o[1*s+3]-o[1*s+2]*t.z)/o[1*s+1],t.x=(o[0*s+3]-o[0*s+2]*t.z-o[0*s+1]*t.y)/o[0*s+0],isNaN(t.x)||isNaN(t.y)||isNaN(t.z)||t.x===1/0||t.y===1/0||t.z===1/0)throw`Could not solve equation! Got x=[${t.toString()}], b=[${e.toString()}], A=[${this.toString()}]`;return t}e(e,t,i){if(i===void 0)return this.elements[t+3*e];this.elements[t+3*e]=i}copy(e){for(let t=0;t<e.elements.length;t++)this.elements[t]=e.elements[t];return this}toString(){let e="";for(let i=0;i<9;i++)e+=this.elements[i]+",";return e}reverse(e){e===void 0&&(e=new Li);const t=3,i=6,s=K1;let o,c;for(o=0;o<3;o++)for(c=0;c<3;c++)s[o+i*c]=this.elements[o+3*c];s[3]=1,s[9]=0,s[15]=0,s[4]=0,s[10]=1,s[16]=0,s[5]=0,s[11]=0,s[17]=1;let u=3;const d=u;let f;const m=i;let v;do{if(o=d-u,s[o+i*o]===0){for(c=o+1;c<d;c++)if(s[o+i*c]!==0){f=m;do v=m-f,s[v+i*o]+=s[v+i*c];while(--f);break}}if(s[o+i*o]!==0)for(c=o+1;c<d;c++){const p=s[o+i*c]/s[o+i*o];f=m;do v=m-f,s[v+i*c]=v<=o?0:s[v+i*c]-s[v+i*o]*p;while(--f)}}while(--u);o=2;do{c=o-1;do{const p=s[o+i*c]/s[o+i*o];f=i;do v=i-f,s[v+i*c]=s[v+i*c]-s[v+i*o]*p;while(--f)}while(c--)}while(--o);o=2;do{const p=1/s[o+i*o];f=i;do v=i-f,s[v+i*o]=s[v+i*o]*p;while(--f)}while(o--);o=2;do{c=2;do{if(v=s[t+c+i*o],isNaN(v)||v===1/0)throw`Could not reverse! A=[${this.toString()}]`;e.e(o,c,v)}while(c--)}while(o--);return e}setRotationFromQuaternion(e){const t=e.x,i=e.y,s=e.z,o=e.w,c=t+t,u=i+i,d=s+s,f=t*c,m=t*u,v=t*d,p=i*u,y=i*d,M=s*d,E=o*c,x=o*u,_=o*d,w=this.elements;return w[0]=1-(p+M),w[1]=m-_,w[2]=v+x,w[3]=m+_,w[4]=1-(f+M),w[5]=y-E,w[6]=v-x,w[7]=y+E,w[8]=1-(f+p),this}transpose(e){e===void 0&&(e=new Li);const t=this.elements,i=e.elements;let s;return i[0]=t[0],i[4]=t[4],i[8]=t[8],s=t[1],i[1]=t[3],i[3]=s,s=t[2],i[2]=t[6],i[6]=s,s=t[5],i[5]=t[7],i[7]=s,e}}const K1=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];class P{constructor(e,t,i){e===void 0&&(e=0),t===void 0&&(t=0),i===void 0&&(i=0),this.x=e,this.y=t,this.z=i}cross(e,t){t===void 0&&(t=new P);const i=e.x,s=e.y,o=e.z,c=this.x,u=this.y,d=this.z;return t.x=u*o-d*s,t.y=d*i-c*o,t.z=c*s-u*i,t}set(e,t,i){return this.x=e,this.y=t,this.z=i,this}setZero(){this.x=this.y=this.z=0}vadd(e,t){if(t)t.x=e.x+this.x,t.y=e.y+this.y,t.z=e.z+this.z;else return new P(this.x+e.x,this.y+e.y,this.z+e.z)}vsub(e,t){if(t)t.x=this.x-e.x,t.y=this.y-e.y,t.z=this.z-e.z;else return new P(this.x-e.x,this.y-e.y,this.z-e.z)}crossmat(){return new Li([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){const e=this.x,t=this.y,i=this.z,s=Math.sqrt(e*e+t*t+i*i);if(s>0){const o=1/s;this.x*=o,this.y*=o,this.z*=o}else this.x=0,this.y=0,this.z=0;return s}unit(e){e===void 0&&(e=new P);const t=this.x,i=this.y,s=this.z;let o=Math.sqrt(t*t+i*i+s*s);return o>0?(o=1/o,e.x=t*o,e.y=i*o,e.z=s*o):(e.x=1,e.y=0,e.z=0),e}length(){const e=this.x,t=this.y,i=this.z;return Math.sqrt(e*e+t*t+i*i)}lengthSquared(){return this.dot(this)}distanceTo(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z;return Math.sqrt((o-t)*(o-t)+(c-i)*(c-i)+(u-s)*(u-s))}distanceSquared(e){const t=this.x,i=this.y,s=this.z,o=e.x,c=e.y,u=e.z;return(o-t)*(o-t)+(c-i)*(c-i)+(u-s)*(u-s)}scale(e,t){t===void 0&&(t=new P);const i=this.x,s=this.y,o=this.z;return t.x=e*i,t.y=e*s,t.z=e*o,t}vmul(e,t){return t===void 0&&(t=new P),t.x=e.x*this.x,t.y=e.y*this.y,t.z=e.z*this.z,t}addScaledVector(e,t,i){return i===void 0&&(i=new P),i.x=this.x+e*t.x,i.y=this.y+e*t.y,i.z=this.z+e*t.z,i}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(e){return e===void 0&&(e=new P),e.x=-this.x,e.y=-this.y,e.z=-this.z,e}tangents(e,t){const i=this.length();if(i>0){const s=Q1,o=1/i;s.set(this.x*o,this.y*o,this.z*o);const c=J1;Math.abs(s.x)<.9?(c.set(1,0,0),s.cross(c,e)):(c.set(0,1,0),s.cross(c,e)),s.cross(e,t)}else e.set(1,0,0),t.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}lerp(e,t,i){const s=this.x,o=this.y,c=this.z;i.x=s+(e.x-s)*t,i.y=o+(e.y-o)*t,i.z=c+(e.z-c)*t}almostEquals(e,t){return t===void 0&&(t=1e-6),!(Math.abs(this.x-e.x)>t||Math.abs(this.y-e.y)>t||Math.abs(this.z-e.z)>t)}almostZero(e){return e===void 0&&(e=1e-6),!(Math.abs(this.x)>e||Math.abs(this.y)>e||Math.abs(this.z)>e)}isAntiparallelTo(e,t){return this.negate(vv),vv.almostEquals(e,t)}clone(){return new P(this.x,this.y,this.z)}}P.ZERO=new P(0,0,0);P.UNIT_X=new P(1,0,0);P.UNIT_Y=new P(0,1,0);P.UNIT_Z=new P(0,0,1);const Q1=new P,J1=new P,vv=new P;class oi{constructor(e){e===void 0&&(e={}),this.lowerBound=new P,this.upperBound=new P,e.lowerBound&&this.lowerBound.copy(e.lowerBound),e.upperBound&&this.upperBound.copy(e.upperBound)}setFromPoints(e,t,i,s){const o=this.lowerBound,c=this.upperBound,u=i;o.copy(e[0]),u&&u.vmult(o,o),c.copy(o);for(let d=1;d<e.length;d++){let f=e[d];u&&(u.vmult(f,_v),f=_v),f.x>c.x&&(c.x=f.x),f.x<o.x&&(o.x=f.x),f.y>c.y&&(c.y=f.y),f.y<o.y&&(o.y=f.y),f.z>c.z&&(c.z=f.z),f.z<o.z&&(o.z=f.z)}return t&&(t.vadd(o,o),t.vadd(c,c)),s&&(o.x-=s,o.y-=s,o.z-=s,c.x+=s,c.y+=s,c.z+=s),this}copy(e){return this.lowerBound.copy(e.lowerBound),this.upperBound.copy(e.upperBound),this}clone(){return new oi().copy(this)}extend(e){this.lowerBound.x=Math.min(this.lowerBound.x,e.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,e.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,e.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,e.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,e.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,e.upperBound.z)}overlaps(e){const t=this.lowerBound,i=this.upperBound,s=e.lowerBound,o=e.upperBound,c=s.x<=i.x&&i.x<=o.x||t.x<=o.x&&o.x<=i.x,u=s.y<=i.y&&i.y<=o.y||t.y<=o.y&&o.y<=i.y,d=s.z<=i.z&&i.z<=o.z||t.z<=o.z&&o.z<=i.z;return c&&u&&d}volume(){const e=this.lowerBound,t=this.upperBound;return(t.x-e.x)*(t.y-e.y)*(t.z-e.z)}contains(e){const t=this.lowerBound,i=this.upperBound,s=e.lowerBound,o=e.upperBound;return t.x<=s.x&&i.x>=o.x&&t.y<=s.y&&i.y>=o.y&&t.z<=s.z&&i.z>=o.z}getCorners(e,t,i,s,o,c,u,d){const f=this.lowerBound,m=this.upperBound;e.copy(f),t.set(m.x,f.y,f.z),i.set(m.x,m.y,f.z),s.set(f.x,m.y,m.z),o.set(m.x,f.y,m.z),c.set(f.x,m.y,f.z),u.set(f.x,f.y,m.z),d.copy(m)}toLocalFrame(e,t){const i=yv,s=i[0],o=i[1],c=i[2],u=i[3],d=i[4],f=i[5],m=i[6],v=i[7];this.getCorners(s,o,c,u,d,f,m,v);for(let p=0;p!==8;p++){const y=i[p];e.pointToLocal(y,y)}return t.setFromPoints(i)}toWorldFrame(e,t){const i=yv,s=i[0],o=i[1],c=i[2],u=i[3],d=i[4],f=i[5],m=i[6],v=i[7];this.getCorners(s,o,c,u,d,f,m,v);for(let p=0;p!==8;p++){const y=i[p];e.pointToWorld(y,y)}return t.setFromPoints(i)}overlapsRay(e){const{direction:t,from:i}=e,s=1/t.x,o=1/t.y,c=1/t.z,u=(this.lowerBound.x-i.x)*s,d=(this.upperBound.x-i.x)*s,f=(this.lowerBound.y-i.y)*o,m=(this.upperBound.y-i.y)*o,v=(this.lowerBound.z-i.z)*c,p=(this.upperBound.z-i.z)*c,y=Math.max(Math.max(Math.min(u,d),Math.min(f,m)),Math.min(v,p)),M=Math.min(Math.min(Math.max(u,d),Math.max(f,m)),Math.max(v,p));return!(M<0||y>M)}}const _v=new P,yv=[new P,new P,new P,new P,new P,new P,new P,new P];class xv{constructor(){this.matrix=[]}get(e,t){let{index:i}=e,{index:s}=t;if(s>i){const o=s;s=i,i=o}return this.matrix[(i*(i+1)>>1)+s-1]}set(e,t,i){let{index:s}=e,{index:o}=t;if(o>s){const c=o;o=s,s=c}this.matrix[(s*(s+1)>>1)+o-1]=i?1:0}reset(){for(let e=0,t=this.matrix.length;e!==t;e++)this.matrix[e]=0}setNumObjects(e){this.matrix.length=e*(e-1)>>1}}class R0{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;return i[e]===void 0&&(i[e]=[]),i[e].includes(t)||i[e].push(t),this}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return!!(i[e]!==void 0&&i[e].includes(t))}hasAnyEventListener(e){return this._listeners===void 0?!1:this._listeners[e]!==void 0}removeEventListener(e,t){if(this._listeners===void 0)return this;const i=this._listeners;if(i[e]===void 0)return this;const s=i[e].indexOf(t);return s!==-1&&i[e].splice(s,1),this}dispatchEvent(e){if(this._listeners===void 0)return this;const i=this._listeners[e.type];if(i!==void 0){e.target=this;for(let s=0,o=i.length;s<o;s++)i[s].call(this,e)}return this}}class sn{constructor(e,t,i,s){e===void 0&&(e=0),t===void 0&&(t=0),i===void 0&&(i=0),s===void 0&&(s=1),this.x=e,this.y=t,this.z=i,this.w=s}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(e,t){const i=Math.sin(t*.5);return this.x=e.x*i,this.y=e.y*i,this.z=e.z*i,this.w=Math.cos(t*.5),this}toAxisAngle(e){e===void 0&&(e=new P),this.normalize();const t=2*Math.acos(this.w),i=Math.sqrt(1-this.w*this.w);return i<.001?(e.x=this.x,e.y=this.y,e.z=this.z):(e.x=this.x/i,e.y=this.y/i,e.z=this.z/i),[e,t]}setFromVectors(e,t){if(e.isAntiparallelTo(t)){const i=eT,s=tT;e.tangents(i,s),this.setFromAxisAngle(i,Math.PI)}else{const i=e.cross(t);this.x=i.x,this.y=i.y,this.z=i.z,this.w=Math.sqrt(e.length()**2*t.length()**2)+e.dot(t),this.normalize()}return this}mult(e,t){t===void 0&&(t=new sn);const i=this.x,s=this.y,o=this.z,c=this.w,u=e.x,d=e.y,f=e.z,m=e.w;return t.x=i*m+c*u+s*f-o*d,t.y=s*m+c*d+o*u-i*f,t.z=o*m+c*f+i*d-s*u,t.w=c*m-i*u-s*d-o*f,t}inverse(e){e===void 0&&(e=new sn);const t=this.x,i=this.y,s=this.z,o=this.w;this.conjugate(e);const c=1/(t*t+i*i+s*s+o*o);return e.x*=c,e.y*=c,e.z*=c,e.w*=c,e}conjugate(e){return e===void 0&&(e=new sn),e.x=-this.x,e.y=-this.y,e.z=-this.z,e.w=this.w,e}normalize(){let e=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(e=1/e,this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}normalizeFast(){const e=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return e===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=e,this.y*=e,this.z*=e,this.w*=e),this}vmult(e,t){t===void 0&&(t=new P);const i=e.x,s=e.y,o=e.z,c=this.x,u=this.y,d=this.z,f=this.w,m=f*i+u*o-d*s,v=f*s+d*i-c*o,p=f*o+c*s-u*i,y=-c*i-u*s-d*o;return t.x=m*f+y*-c+v*-d-p*-u,t.y=v*f+y*-u+p*-c-m*-d,t.z=p*f+y*-d+m*-u-v*-c,t}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w,this}toEuler(e,t){t===void 0&&(t="YZX");let i,s,o;const c=this.x,u=this.y,d=this.z,f=this.w;switch(t){case"YZX":const m=c*u+d*f;if(m>.499&&(i=2*Math.atan2(c,f),s=Math.PI/2,o=0),m<-.499&&(i=-2*Math.atan2(c,f),s=-Math.PI/2,o=0),i===void 0){const v=c*c,p=u*u,y=d*d;i=Math.atan2(2*u*f-2*c*d,1-2*p-2*y),s=Math.asin(2*m),o=Math.atan2(2*c*f-2*u*d,1-2*v-2*y)}break;default:throw new Error(`Euler order ${t} not supported yet.`)}e.y=i,e.z=s,e.x=o}setFromEuler(e,t,i,s){s===void 0&&(s="XYZ");const o=Math.cos(e/2),c=Math.cos(t/2),u=Math.cos(i/2),d=Math.sin(e/2),f=Math.sin(t/2),m=Math.sin(i/2);return s==="XYZ"?(this.x=d*c*u+o*f*m,this.y=o*f*u-d*c*m,this.z=o*c*m+d*f*u,this.w=o*c*u-d*f*m):s==="YXZ"?(this.x=d*c*u+o*f*m,this.y=o*f*u-d*c*m,this.z=o*c*m-d*f*u,this.w=o*c*u+d*f*m):s==="ZXY"?(this.x=d*c*u-o*f*m,this.y=o*f*u+d*c*m,this.z=o*c*m+d*f*u,this.w=o*c*u-d*f*m):s==="ZYX"?(this.x=d*c*u-o*f*m,this.y=o*f*u+d*c*m,this.z=o*c*m-d*f*u,this.w=o*c*u+d*f*m):s==="YZX"?(this.x=d*c*u+o*f*m,this.y=o*f*u+d*c*m,this.z=o*c*m-d*f*u,this.w=o*c*u-d*f*m):s==="XZY"&&(this.x=d*c*u-o*f*m,this.y=o*f*u-d*c*m,this.z=o*c*m+d*f*u,this.w=o*c*u+d*f*m),this}clone(){return new sn(this.x,this.y,this.z,this.w)}slerp(e,t,i){i===void 0&&(i=new sn);const s=this.x,o=this.y,c=this.z,u=this.w;let d=e.x,f=e.y,m=e.z,v=e.w,p,y,M,E,x;return y=s*d+o*f+c*m+u*v,y<0&&(y=-y,d=-d,f=-f,m=-m,v=-v),1-y>1e-6?(p=Math.acos(y),M=Math.sin(p),E=Math.sin((1-t)*p)/M,x=Math.sin(t*p)/M):(E=1-t,x=t),i.x=E*s+x*d,i.y=E*o+x*f,i.z=E*c+x*m,i.w=E*u+x*v,i}integrate(e,t,i,s){s===void 0&&(s=new sn);const o=e.x*i.x,c=e.y*i.y,u=e.z*i.z,d=this.x,f=this.y,m=this.z,v=this.w,p=t*.5;return s.x+=p*(o*v+c*m-u*f),s.y+=p*(c*v+u*d-o*m),s.z+=p*(u*v+o*f-c*d),s.w+=p*(-o*d-c*f-u*m),s}}const eT=new P,tT=new P,nT={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256};class je{constructor(e){e===void 0&&(e={}),this.id=je.idCounter++,this.type=e.type||0,this.boundingSphereRadius=0,this.collisionResponse=e.collisionResponse?e.collisionResponse:!0,this.collisionFilterGroup=e.collisionFilterGroup!==void 0?e.collisionFilterGroup:1,this.collisionFilterMask=e.collisionFilterMask!==void 0?e.collisionFilterMask:-1,this.material=e.material?e.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(e,t){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(e,t,i,s){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}}je.idCounter=0;je.types=nT;let Ut=class lf{constructor(e){e===void 0&&(e={}),this.position=new P,this.quaternion=new sn,e.position&&this.position.copy(e.position),e.quaternion&&this.quaternion.copy(e.quaternion)}pointToLocal(e,t){return lf.pointToLocalFrame(this.position,this.quaternion,e,t)}pointToWorld(e,t){return lf.pointToWorldFrame(this.position,this.quaternion,e,t)}vectorToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t}static pointToLocalFrame(e,t,i,s){return s===void 0&&(s=new P),i.vsub(e,s),t.conjugate(Sv),Sv.vmult(s,s),s}static pointToWorldFrame(e,t,i,s){return s===void 0&&(s=new P),t.vmult(i,s),s.vadd(e,s),s}static vectorToWorldFrame(e,t,i){return i===void 0&&(i=new P),e.vmult(t,i),i}static vectorToLocalFrame(e,t,i,s){return s===void 0&&(s=new P),t.w*=-1,t.vmult(i,s),t.w*=-1,s}};const Sv=new sn;class Ua extends je{constructor(e){e===void 0&&(e={});const{vertices:t=[],faces:i=[],normals:s=[],axes:o,boundingSphereRadius:c}=e;super({type:je.types.CONVEXPOLYHEDRON}),this.vertices=t,this.faces=i,this.faceNormals=s,this.faceNormals.length===0&&this.computeNormals(),c?this.boundingSphereRadius=c:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=o?o.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){const e=this.faces,t=this.vertices,i=this.uniqueEdges;i.length=0;const s=new P;for(let o=0;o!==e.length;o++){const c=e[o],u=c.length;for(let d=0;d!==u;d++){const f=(d+1)%u;t[c[d]].vsub(t[c[f]],s),s.normalize();let m=!1;for(let v=0;v!==i.length;v++)if(i[v].almostEquals(s)||i[v].almostEquals(s)){m=!0;break}m||i.push(s.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let e=0;e<this.faces.length;e++){for(let s=0;s<this.faces[e].length;s++)if(!this.vertices[this.faces[e][s]])throw new Error(`Vertex ${this.faces[e][s]} not found!`);const t=this.faceNormals[e]||new P;this.getFaceNormal(e,t),t.negate(t),this.faceNormals[e]=t;const i=this.vertices[this.faces[e][0]];if(t.dot(i)<0){console.error(`.faceNormals[${e}] = Vec3(${t.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let s=0;s<this.faces[e].length;s++)console.warn(`.vertices[${this.faces[e][s]}] = Vec3(${this.vertices[this.faces[e][s]].toString()})`)}}}getFaceNormal(e,t){const i=this.faces[e],s=this.vertices[i[0]],o=this.vertices[i[1]],c=this.vertices[i[2]];Ua.computeNormal(s,o,c,t)}static computeNormal(e,t,i,s){const o=new P,c=new P;t.vsub(e,c),i.vsub(t,o),o.cross(c,s),s.isZero()||s.normalize()}clipAgainstHull(e,t,i,s,o,c,u,d,f){const m=new P;let v=-1,p=-Number.MAX_VALUE;for(let M=0;M<i.faces.length;M++){m.copy(i.faceNormals[M]),o.vmult(m,m);const E=m.dot(c);E>p&&(p=E,v=M)}const y=[];for(let M=0;M<i.faces[v].length;M++){const E=i.vertices[i.faces[v][M]],x=new P;x.copy(E),o.vmult(x,x),s.vadd(x,x),y.push(x)}v>=0&&this.clipFaceAgainstHull(c,e,t,y,u,d,f)}findSeparatingAxis(e,t,i,s,o,c,u,d){const f=new P,m=new P,v=new P,p=new P,y=new P,M=new P;let E=Number.MAX_VALUE;const x=this;if(x.uniqueAxes)for(let _=0;_!==x.uniqueAxes.length;_++){i.vmult(x.uniqueAxes[_],f);const w=x.testSepAxis(f,e,t,i,s,o);if(w===!1)return!1;w<E&&(E=w,c.copy(f))}else{const _=u?u.length:x.faces.length;for(let w=0;w<_;w++){const A=u?u[w]:w;f.copy(x.faceNormals[A]),i.vmult(f,f);const T=x.testSepAxis(f,e,t,i,s,o);if(T===!1)return!1;T<E&&(E=T,c.copy(f))}}if(e.uniqueAxes)for(let _=0;_!==e.uniqueAxes.length;_++){o.vmult(e.uniqueAxes[_],m);const w=x.testSepAxis(m,e,t,i,s,o);if(w===!1)return!1;w<E&&(E=w,c.copy(m))}else{const _=d?d.length:e.faces.length;for(let w=0;w<_;w++){const A=d?d[w]:w;m.copy(e.faceNormals[A]),o.vmult(m,m);const T=x.testSepAxis(m,e,t,i,s,o);if(T===!1)return!1;T<E&&(E=T,c.copy(m))}}for(let _=0;_!==x.uniqueEdges.length;_++){i.vmult(x.uniqueEdges[_],p);for(let w=0;w!==e.uniqueEdges.length;w++)if(o.vmult(e.uniqueEdges[w],y),p.cross(y,M),!M.almostZero()){M.normalize();const A=x.testSepAxis(M,e,t,i,s,o);if(A===!1)return!1;A<E&&(E=A,c.copy(M))}}return s.vsub(t,v),v.dot(c)>0&&c.negate(c),!0}testSepAxis(e,t,i,s,o,c){const u=this;Ua.project(u,e,i,s,hd),Ua.project(t,e,o,c,dd);const d=hd[0],f=hd[1],m=dd[0],v=dd[1];if(d<v||m<f)return!1;const p=d-v,y=m-f;return p<y?p:y}calculateLocalInertia(e,t){const i=new P,s=new P;this.computeLocalAABB(s,i);const o=i.x-s.x,c=i.y-s.y,u=i.z-s.z;t.x=1/12*e*(2*c*2*c+2*u*2*u),t.y=1/12*e*(2*o*2*o+2*u*2*u),t.z=1/12*e*(2*c*2*c+2*o*2*o)}getPlaneConstantOfFace(e){const t=this.faces[e],i=this.faceNormals[e],s=this.vertices[t[0]];return-i.dot(s)}clipFaceAgainstHull(e,t,i,s,o,c,u){const d=new P,f=new P,m=new P,v=new P,p=new P,y=new P,M=new P,E=new P,x=this,_=[],w=s,A=_;let T=-1,U=Number.MAX_VALUE;for(let C=0;C<x.faces.length;C++){d.copy(x.faceNormals[C]),i.vmult(d,d);const z=d.dot(e);z<U&&(U=z,T=C)}if(T<0)return;const D=x.faces[T];D.connectedFaces=[];for(let C=0;C<x.faces.length;C++)for(let z=0;z<x.faces[C].length;z++)D.indexOf(x.faces[C][z])!==-1&&C!==T&&D.connectedFaces.indexOf(C)===-1&&D.connectedFaces.push(C);const N=D.length;for(let C=0;C<N;C++){const z=x.vertices[D[C]],K=x.vertices[D[(C+1)%N]];z.vsub(K,f),m.copy(f),i.vmult(m,m),t.vadd(m,m),v.copy(this.faceNormals[T]),i.vmult(v,v),t.vadd(v,v),m.cross(v,p),p.negate(p),y.copy(z),i.vmult(y,y),t.vadd(y,y);const B=D.connectedFaces[C];M.copy(this.faceNormals[B]);const j=this.getPlaneConstantOfFace(B);E.copy(M),i.vmult(E,E);const q=j-E.dot(t);for(this.clipFaceAgainstPlane(w,A,E,q);w.length;)w.shift();for(;A.length;)w.push(A.shift())}M.copy(this.faceNormals[T]);const O=this.getPlaneConstantOfFace(T);E.copy(M),i.vmult(E,E);const b=O-E.dot(t);for(let C=0;C<w.length;C++){let z=E.dot(w[C])+b;if(z<=o&&(console.log(`clamped: depth=${z} to minDist=${o}`),z=o),z<=c){const K=w[C];if(z<=1e-6){const B={point:K,normal:E,depth:z};u.push(B)}}}}clipFaceAgainstPlane(e,t,i,s){let o,c;const u=e.length;if(u<2)return t;let d=e[e.length-1],f=e[0];o=i.dot(d)+s;for(let m=0;m<u;m++){if(f=e[m],c=i.dot(f)+s,o<0)if(c<0){const v=new P;v.copy(f),t.push(v)}else{const v=new P;d.lerp(f,o/(o-c),v),t.push(v)}else if(c<0){const v=new P;d.lerp(f,o/(o-c),v),t.push(v),t.push(f)}d=f,o=c}return t}computeWorldVertices(e,t){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new P);const i=this.vertices,s=this.worldVertices;for(let o=0;o!==this.vertices.length;o++)t.vmult(i[o],s[o]),e.vadd(s[o],s[o]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(e,t){const i=this.vertices;e.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),t.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let s=0;s<this.vertices.length;s++){const o=i[s];o.x<e.x?e.x=o.x:o.x>t.x&&(t.x=o.x),o.y<e.y?e.y=o.y:o.y>t.y&&(t.y=o.y),o.z<e.z?e.z=o.z:o.z>t.z&&(t.z=o.z)}}computeWorldFaceNormals(e){const t=this.faceNormals.length;for(;this.worldFaceNormals.length<t;)this.worldFaceNormals.push(new P);const i=this.faceNormals,s=this.worldFaceNormals;for(let o=0;o!==t;o++)e.vmult(i[o],s[o]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let e=0;const t=this.vertices;for(let i=0;i!==t.length;i++){const s=t[i].lengthSquared();s>e&&(e=s)}this.boundingSphereRadius=Math.sqrt(e)}calculateWorldAABB(e,t,i,s){const o=this.vertices;let c,u,d,f,m,v,p=new P;for(let y=0;y<o.length;y++){p.copy(o[y]),t.vmult(p,p),e.vadd(p,p);const M=p;(c===void 0||M.x<c)&&(c=M.x),(f===void 0||M.x>f)&&(f=M.x),(u===void 0||M.y<u)&&(u=M.y),(m===void 0||M.y>m)&&(m=M.y),(d===void 0||M.z<d)&&(d=M.z),(v===void 0||M.z>v)&&(v=M.z)}i.set(c,u,d),s.set(f,m,v)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(e){e===void 0&&(e=new P);const t=this.vertices;for(let i=0;i<t.length;i++)e.vadd(t[i],e);return e.scale(1/t.length,e),e}transformAllPoints(e,t){const i=this.vertices.length,s=this.vertices;if(t){for(let o=0;o<i;o++){const c=s[o];t.vmult(c,c)}for(let o=0;o<this.faceNormals.length;o++){const c=this.faceNormals[o];t.vmult(c,c)}}if(e)for(let o=0;o<i;o++){const c=s[o];c.vadd(e,c)}}pointIsInside(e){const t=this.vertices,i=this.faces,s=this.faceNormals,o=new P;this.getAveragePointLocal(o);for(let c=0;c<this.faces.length;c++){let u=s[c];const d=t[i[c][0]],f=new P;e.vsub(d,f);const m=u.dot(f),v=new P;o.vsub(d,v);const p=u.dot(v);if(m<0&&p>0||m>0&&p<0)return!1}return-1}static project(e,t,i,s,o){const c=e.vertices.length,u=iT;let d=0,f=0;const m=rT,v=e.vertices;m.setZero(),Ut.vectorToLocalFrame(i,s,t,u),Ut.pointToLocalFrame(i,s,m,m);const p=m.dot(u);f=d=v[0].dot(u);for(let y=1;y<c;y++){const M=v[y].dot(u);M>d&&(d=M),M<f&&(f=M)}if(f-=p,d-=p,f>d){const y=f;f=d,d=y}o[0]=d,o[1]=f}}const hd=[],dd=[];new P;const iT=new P,rT=new P;class za extends je{constructor(e){super({type:je.types.BOX}),this.halfExtents=e,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){const e=this.halfExtents.x,t=this.halfExtents.y,i=this.halfExtents.z,s=P,o=[new s(-e,-t,-i),new s(e,-t,-i),new s(e,t,-i),new s(-e,t,-i),new s(-e,-t,i),new s(e,-t,i),new s(e,t,i),new s(-e,t,i)],c=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],u=[new s(0,0,1),new s(0,1,0),new s(1,0,0)],d=new Ua({vertices:o,faces:c,axes:u});this.convexPolyhedronRepresentation=d,d.material=this.material}calculateLocalInertia(e,t){return t===void 0&&(t=new P),za.calculateInertia(this.halfExtents,e,t),t}static calculateInertia(e,t,i){const s=e;i.x=1/12*t*(2*s.y*2*s.y+2*s.z*2*s.z),i.y=1/12*t*(2*s.x*2*s.x+2*s.z*2*s.z),i.z=1/12*t*(2*s.y*2*s.y+2*s.x*2*s.x)}getSideNormals(e,t){const i=e,s=this.halfExtents;if(i[0].set(s.x,0,0),i[1].set(0,s.y,0),i[2].set(0,0,s.z),i[3].set(-s.x,0,0),i[4].set(0,-s.y,0),i[5].set(0,0,-s.z),t!==void 0)for(let o=0;o!==i.length;o++)t.vmult(i[o],i[o]);return i}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(e,t,i){const s=this.halfExtents,o=[[s.x,s.y,s.z],[-s.x,s.y,s.z],[-s.x,-s.y,s.z],[-s.x,-s.y,-s.z],[s.x,-s.y,-s.z],[s.x,s.y,-s.z],[-s.x,s.y,-s.z],[s.x,-s.y,s.z]];for(let c=0;c<o.length;c++)qr.set(o[c][0],o[c][1],o[c][2]),t.vmult(qr,qr),e.vadd(qr,qr),i(qr.x,qr.y,qr.z)}calculateWorldAABB(e,t,i,s){const o=this.halfExtents;ki[0].set(o.x,o.y,o.z),ki[1].set(-o.x,o.y,o.z),ki[2].set(-o.x,-o.y,o.z),ki[3].set(-o.x,-o.y,-o.z),ki[4].set(o.x,-o.y,-o.z),ki[5].set(o.x,o.y,-o.z),ki[6].set(-o.x,o.y,-o.z),ki[7].set(o.x,-o.y,o.z);const c=ki[0];t.vmult(c,c),e.vadd(c,c),s.copy(c),i.copy(c);for(let u=1;u<8;u++){const d=ki[u];t.vmult(d,d),e.vadd(d,d);const f=d.x,m=d.y,v=d.z;f>s.x&&(s.x=f),m>s.y&&(s.y=m),v>s.z&&(s.z=v),f<i.x&&(i.x=f),m<i.y&&(i.y=m),v<i.z&&(i.z=v)}}}const qr=new P,ki=[new P,new P,new P,new P,new P,new P,new P,new P],Tf={DYNAMIC:1,STATIC:2,KINEMATIC:4},Af={AWAKE:0,SLEEPY:1,SLEEPING:2};class Ge extends R0{constructor(e){e===void 0&&(e={}),super(),this.id=Ge.idCounter++,this.index=-1,this.world=null,this.vlambda=new P,this.collisionFilterGroup=typeof e.collisionFilterGroup=="number"?e.collisionFilterGroup:1,this.collisionFilterMask=typeof e.collisionFilterMask=="number"?e.collisionFilterMask:-1,this.collisionResponse=typeof e.collisionResponse=="boolean"?e.collisionResponse:!0,this.position=new P,this.previousPosition=new P,this.interpolatedPosition=new P,this.initPosition=new P,e.position&&(this.position.copy(e.position),this.previousPosition.copy(e.position),this.interpolatedPosition.copy(e.position),this.initPosition.copy(e.position)),this.velocity=new P,e.velocity&&this.velocity.copy(e.velocity),this.initVelocity=new P,this.force=new P;const t=typeof e.mass=="number"?e.mass:0;this.mass=t,this.invMass=t>0?1/t:0,this.material=e.material||null,this.linearDamping=typeof e.linearDamping=="number"?e.linearDamping:.01,this.type=t<=0?Ge.STATIC:Ge.DYNAMIC,typeof e.type==typeof Ge.STATIC&&(this.type=e.type),this.allowSleep=typeof e.allowSleep<"u"?e.allowSleep:!0,this.sleepState=Ge.AWAKE,this.sleepSpeedLimit=typeof e.sleepSpeedLimit<"u"?e.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof e.sleepTimeLimit<"u"?e.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new P,this.quaternion=new sn,this.initQuaternion=new sn,this.previousQuaternion=new sn,this.interpolatedQuaternion=new sn,e.quaternion&&(this.quaternion.copy(e.quaternion),this.initQuaternion.copy(e.quaternion),this.previousQuaternion.copy(e.quaternion),this.interpolatedQuaternion.copy(e.quaternion)),this.angularVelocity=new P,e.angularVelocity&&this.angularVelocity.copy(e.angularVelocity),this.initAngularVelocity=new P,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new P,this.invInertia=new P,this.invInertiaWorld=new Li,this.invMassSolve=0,this.invInertiaSolve=new P,this.invInertiaWorldSolve=new Li,this.fixedRotation=typeof e.fixedRotation<"u"?e.fixedRotation:!1,this.angularDamping=typeof e.angularDamping<"u"?e.angularDamping:.01,this.linearFactor=new P(1,1,1),e.linearFactor&&this.linearFactor.copy(e.linearFactor),this.angularFactor=new P(1,1,1),e.angularFactor&&this.angularFactor.copy(e.angularFactor),this.aabb=new oi,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new P,this.isTrigger=!!e.isTrigger,e.shape&&this.addShape(e.shape),this.updateMassProperties()}wakeUp(){const e=this.sleepState;this.sleepState=Ge.AWAKE,this.wakeUpAfterNarrowphase=!1,e===Ge.SLEEPING&&this.dispatchEvent(Ge.wakeupEvent)}sleep(){this.sleepState=Ge.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(e){if(this.allowSleep){const t=this.sleepState,i=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),s=this.sleepSpeedLimit**2;t===Ge.AWAKE&&i<s?(this.sleepState=Ge.SLEEPY,this.timeLastSleepy=e,this.dispatchEvent(Ge.sleepyEvent)):t===Ge.SLEEPY&&i>s?this.wakeUp():t===Ge.SLEEPY&&e-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(Ge.sleepEvent))}}updateSolveMassProperties(){this.sleepState===Ge.SLEEPING||this.type===Ge.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(e,t){return t===void 0&&(t=new P),e.vsub(this.position,t),this.quaternion.conjugate().vmult(t,t),t}vectorToLocalFrame(e,t){return t===void 0&&(t=new P),this.quaternion.conjugate().vmult(e,t),t}pointToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t.vadd(this.position,t),t}vectorToWorldFrame(e,t){return t===void 0&&(t=new P),this.quaternion.vmult(e,t),t}addShape(e,t,i){const s=new P,o=new sn;return t&&s.copy(t),i&&o.copy(i),this.shapes.push(e),this.shapeOffsets.push(s),this.shapeOrientations.push(o),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=this,this}removeShape(e){const t=this.shapes.indexOf(e);return t===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(t,1),this.shapeOffsets.splice(t,1),this.shapeOrientations.splice(t,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,e.body=null,this)}updateBoundingRadius(){const e=this.shapes,t=this.shapeOffsets,i=e.length;let s=0;for(let o=0;o!==i;o++){const c=e[o];c.updateBoundingSphereRadius();const u=t[o].length(),d=c.boundingSphereRadius;u+d>s&&(s=u+d)}this.boundingRadius=s}updateAABB(){const e=this.shapes,t=this.shapeOffsets,i=this.shapeOrientations,s=e.length,o=sT,c=oT,u=this.quaternion,d=this.aabb,f=aT;for(let m=0;m!==s;m++){const v=e[m];u.vmult(t[m],o),o.vadd(this.position,o),u.mult(i[m],c),v.calculateWorldAABB(o,c,f.lowerBound,f.upperBound),m===0?d.copy(f):d.extend(f)}this.aabbNeedsUpdate=!1}updateInertiaWorld(e){const t=this.invInertia;if(!(t.x===t.y&&t.y===t.z&&!e)){const i=lT,s=cT;i.setRotationFromQuaternion(this.quaternion),i.transpose(s),i.scale(t,i),i.mmult(s,this.invInertiaWorld)}}applyForce(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;this.sleepState===Ge.SLEEPING&&this.wakeUp();const i=uT;t.cross(e,i),this.force.vadd(e,this.force),this.torque.vadd(i,this.torque)}applyLocalForce(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;const i=hT,s=dT;this.vectorToWorldFrame(e,i),this.vectorToWorldFrame(t,s),this.applyForce(i,s)}applyTorque(e){this.type===Ge.DYNAMIC&&(this.sleepState===Ge.SLEEPING&&this.wakeUp(),this.torque.vadd(e,this.torque))}applyImpulse(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;this.sleepState===Ge.SLEEPING&&this.wakeUp();const i=t,s=fT;s.copy(e),s.scale(this.invMass,s),this.velocity.vadd(s,this.velocity);const o=pT;i.cross(e,o),this.invInertiaWorld.vmult(o,o),this.angularVelocity.vadd(o,this.angularVelocity)}applyLocalImpulse(e,t){if(t===void 0&&(t=new P),this.type!==Ge.DYNAMIC)return;const i=mT,s=gT;this.vectorToWorldFrame(e,i),this.vectorToWorldFrame(t,s),this.applyImpulse(i,s)}updateMassProperties(){const e=vT;this.invMass=this.mass>0?1/this.mass:0;const t=this.inertia,i=this.fixedRotation;this.updateAABB(),e.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),za.calculateInertia(e,this.mass,t),this.invInertia.set(t.x>0&&!i?1/t.x:0,t.y>0&&!i?1/t.y:0,t.z>0&&!i?1/t.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(e,t){const i=new P;return e.vsub(this.position,i),this.angularVelocity.cross(i,t),this.velocity.vadd(t,t),t}integrate(e,t,i){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===Ge.DYNAMIC||this.type===Ge.KINEMATIC)||this.sleepState===Ge.SLEEPING)return;const s=this.velocity,o=this.angularVelocity,c=this.position,u=this.force,d=this.torque,f=this.quaternion,m=this.invMass,v=this.invInertiaWorld,p=this.linearFactor,y=m*e;s.x+=u.x*y*p.x,s.y+=u.y*y*p.y,s.z+=u.z*y*p.z;const M=v.elements,E=this.angularFactor,x=d.x*E.x,_=d.y*E.y,w=d.z*E.z;o.x+=e*(M[0]*x+M[1]*_+M[2]*w),o.y+=e*(M[3]*x+M[4]*_+M[5]*w),o.z+=e*(M[6]*x+M[7]*_+M[8]*w),c.x+=s.x*e,c.y+=s.y*e,c.z+=s.z*e,f.integrate(this.angularVelocity,e,this.angularFactor,f),t&&(i?f.normalizeFast():f.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}}Ge.idCounter=0;Ge.COLLIDE_EVENT_NAME="collide";Ge.DYNAMIC=Tf.DYNAMIC;Ge.STATIC=Tf.STATIC;Ge.KINEMATIC=Tf.KINEMATIC;Ge.AWAKE=Af.AWAKE;Ge.SLEEPY=Af.SLEEPY;Ge.SLEEPING=Af.SLEEPING;Ge.wakeupEvent={type:"wakeup"};Ge.sleepyEvent={type:"sleepy"};Ge.sleepEvent={type:"sleep"};const sT=new P,oT=new sn,aT=new oi,lT=new Li,cT=new Li;new Li;const uT=new P,hT=new P,dT=new P,fT=new P,pT=new P,mT=new P,gT=new P,vT=new P;class _T{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(e,t,i){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(e,t){return!((e.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&e.collisionFilterMask)===0||((e.type&Ge.STATIC)!==0||e.sleepState===Ge.SLEEPING)&&((t.type&Ge.STATIC)!==0||t.sleepState===Ge.SLEEPING))}intersectionTest(e,t,i,s){this.useBoundingBoxes?this.doBoundingBoxBroadphase(e,t,i,s):this.doBoundingSphereBroadphase(e,t,i,s)}doBoundingSphereBroadphase(e,t,i,s){const o=yT;t.position.vsub(e.position,o);const c=(e.boundingRadius+t.boundingRadius)**2;o.lengthSquared()<c&&(i.push(e),s.push(t))}doBoundingBoxBroadphase(e,t,i,s){e.aabbNeedsUpdate&&e.updateAABB(),t.aabbNeedsUpdate&&t.updateAABB(),e.aabb.overlaps(t.aabb)&&(i.push(e),s.push(t))}makePairsUnique(e,t){const i=xT,s=ST,o=MT,c=e.length;for(let u=0;u!==c;u++)s[u]=e[u],o[u]=t[u];e.length=0,t.length=0;for(let u=0;u!==c;u++){const d=s[u].id,f=o[u].id,m=d<f?`${d},${f}`:`${f},${d}`;i[m]=u,i.keys.push(m)}for(let u=0;u!==i.keys.length;u++){const d=i.keys.pop(),f=i[d];e.push(s[f]),t.push(o[f]),delete i[d]}}setWorld(e){}static boundingSphereCheck(e,t){const i=new P;e.position.vsub(t.position,i);const s=e.shapes[0],o=t.shapes[0];return Math.pow(s.boundingSphereRadius+o.boundingSphereRadius,2)>i.lengthSquared()}aabbQuery(e,t,i){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}}const yT=new P;new P;new sn;new P;const xT={keys:[]},ST=[],MT=[];new P;new P;new P;class ET extends _T{constructor(){super()}collisionPairs(e,t,i){const s=e.bodies,o=s.length;let c,u;for(let d=0;d!==o;d++)for(let f=0;f!==d;f++)c=s[d],u=s[f],this.needBroadphaseCollision(c,u)&&this.intersectionTest(c,u,t,i)}aabbQuery(e,t,i){i===void 0&&(i=[]);for(let s=0;s<e.bodies.length;s++){const o=e.bodies[s];o.aabbNeedsUpdate&&o.updateAABB(),o.aabb.overlaps(t)&&i.push(o)}return i}}class Hc{constructor(){this.rayFromWorld=new P,this.rayToWorld=new P,this.hitNormalWorld=new P,this.hitPointWorld=new P,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(e,t,i,s,o,c,u){this.rayFromWorld.copy(e),this.rayToWorld.copy(t),this.hitNormalWorld.copy(i),this.hitPointWorld.copy(s),this.shape=o,this.body=c,this.distance=u}}let b0,P0,L0,I0,D0,N0,U0;const Cf={CLOSEST:1,ANY:2,ALL:4};b0=je.types.SPHERE;P0=je.types.PLANE;L0=je.types.BOX;I0=je.types.CYLINDER;D0=je.types.CONVEXPOLYHEDRON;N0=je.types.HEIGHTFIELD;U0=je.types.TRIMESH;class rn{get[b0](){return this._intersectSphere}get[P0](){return this._intersectPlane}get[L0](){return this._intersectBox}get[I0](){return this._intersectConvex}get[D0](){return this._intersectConvex}get[N0](){return this._intersectHeightfield}get[U0](){return this._intersectTrimesh}constructor(e,t){e===void 0&&(e=new P),t===void 0&&(t=new P),this.from=e.clone(),this.to=t.clone(),this.direction=new P,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=rn.ANY,this.result=new Hc,this.hasHit=!1,this.callback=i=>{}}intersectWorld(e,t){return this.mode=t.mode||rn.ANY,this.result=t.result||new Hc,this.skipBackfaces=!!t.skipBackfaces,this.collisionFilterMask=typeof t.collisionFilterMask<"u"?t.collisionFilterMask:-1,this.collisionFilterGroup=typeof t.collisionFilterGroup<"u"?t.collisionFilterGroup:-1,this.checkCollisionResponse=typeof t.checkCollisionResponse<"u"?t.checkCollisionResponse:!0,t.from&&this.from.copy(t.from),t.to&&this.to.copy(t.to),this.callback=t.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(Mv),fd.length=0,e.broadphase.aabbQuery(e,Mv,fd),this.intersectBodies(fd),this.hasHit}intersectBody(e,t){t&&(this.result=t,this.updateDirection());const i=this.checkCollisionResponse;if(i&&!e.collisionResponse||(this.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&this.collisionFilterMask)===0)return;const s=wT,o=TT;for(let c=0,u=e.shapes.length;c<u;c++){const d=e.shapes[c];if(!(i&&!d.collisionResponse)&&(e.quaternion.mult(e.shapeOrientations[c],o),e.quaternion.vmult(e.shapeOffsets[c],s),s.vadd(e.position,s),this.intersectShape(d,o,s,e),this.result.shouldStop))break}}intersectBodies(e,t){t&&(this.result=t,this.updateDirection());for(let i=0,s=e.length;!this.result.shouldStop&&i<s;i++)this.intersectBody(e[i])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(e,t,i,s){const o=this.from;if(BT(o,this.direction,i)>e.boundingSphereRadius)return;const u=this[e.type];u&&u.call(this,e,t,i,s,e)}_intersectBox(e,t,i,s,o){return this._intersectConvex(e.convexPolyhedronRepresentation,t,i,s,o)}_intersectPlane(e,t,i,s,o){const c=this.from,u=this.to,d=this.direction,f=new P(0,0,1);t.vmult(f,f);const m=new P;c.vsub(i,m);const v=m.dot(f);u.vsub(i,m);const p=m.dot(f);if(v*p>0||c.distanceTo(u)<v)return;const y=f.dot(d);if(Math.abs(y)<this.precision)return;const M=new P,E=new P,x=new P;c.vsub(i,M);const _=-f.dot(M)/y;d.scale(_,E),c.vadd(E,x),this.reportIntersection(f,x,o,s,-1)}getAABB(e){const{lowerBound:t,upperBound:i}=e,s=this.to,o=this.from;t.x=Math.min(s.x,o.x),t.y=Math.min(s.y,o.y),t.z=Math.min(s.z,o.z),i.x=Math.max(s.x,o.x),i.y=Math.max(s.y,o.y),i.z=Math.max(s.z,o.z)}_intersectHeightfield(e,t,i,s,o){e.data,e.elementSize;const c=AT;c.from.copy(this.from),c.to.copy(this.to),Ut.pointToLocalFrame(i,t,c.from,c.from),Ut.pointToLocalFrame(i,t,c.to,c.to),c.updateDirection();const u=CT;let d,f,m,v;d=f=0,m=v=e.data.length-1;const p=new oi;c.getAABB(p),e.getIndexOfPosition(p.lowerBound.x,p.lowerBound.y,u,!0),d=Math.max(d,u[0]),f=Math.max(f,u[1]),e.getIndexOfPosition(p.upperBound.x,p.upperBound.y,u,!0),m=Math.min(m,u[0]+1),v=Math.min(v,u[1]+1);for(let y=d;y<m;y++)for(let M=f;M<v;M++){if(this.result.shouldStop)return;if(e.getAabbAtIndex(y,M,p),!!p.overlapsRay(c)){if(e.getConvexTrianglePillar(y,M,!1),Ut.pointToWorldFrame(i,t,e.pillarOffset,xc),this._intersectConvex(e.pillarConvex,t,xc,s,o,Ev),this.result.shouldStop)return;e.getConvexTrianglePillar(y,M,!0),Ut.pointToWorldFrame(i,t,e.pillarOffset,xc),this._intersectConvex(e.pillarConvex,t,xc,s,o,Ev)}}}_intersectSphere(e,t,i,s,o){const c=this.from,u=this.to,d=e.radius,f=(u.x-c.x)**2+(u.y-c.y)**2+(u.z-c.z)**2,m=2*((u.x-c.x)*(c.x-i.x)+(u.y-c.y)*(c.y-i.y)+(u.z-c.z)*(c.z-i.z)),v=(c.x-i.x)**2+(c.y-i.y)**2+(c.z-i.z)**2-d**2,p=m**2-4*f*v,y=RT,M=bT;if(!(p<0))if(p===0)c.lerp(u,p,y),y.vsub(i,M),M.normalize(),this.reportIntersection(M,y,o,s,-1);else{const E=(-m-Math.sqrt(p))/(2*f),x=(-m+Math.sqrt(p))/(2*f);if(E>=0&&E<=1&&(c.lerp(u,E,y),y.vsub(i,M),M.normalize(),this.reportIntersection(M,y,o,s,-1)),this.result.shouldStop)return;x>=0&&x<=1&&(c.lerp(u,x,y),y.vsub(i,M),M.normalize(),this.reportIntersection(M,y,o,s,-1))}}_intersectConvex(e,t,i,s,o,c){const u=PT,d=wv,f=c&&c.faceList||null,m=e.faces,v=e.vertices,p=e.faceNormals,y=this.direction,M=this.from,E=this.to,x=M.distanceTo(E),_=f?f.length:m.length,w=this.result;for(let A=0;!w.shouldStop&&A<_;A++){const T=f?f[A]:A,U=m[T],D=p[T],N=t,O=i;d.copy(v[U[0]]),N.vmult(d,d),d.vadd(O,d),d.vsub(M,d),N.vmult(D,u);const b=y.dot(u);if(Math.abs(b)<this.precision)continue;const C=u.dot(d)/b;if(!(C<0)){y.scale(C,$n),$n.vadd(M,$n),Ri.copy(v[U[0]]),N.vmult(Ri,Ri),O.vadd(Ri,Ri);for(let z=1;!w.shouldStop&&z<U.length-1;z++){Hi.copy(v[U[z]]),Vi.copy(v[U[z+1]]),N.vmult(Hi,Hi),N.vmult(Vi,Vi),O.vadd(Hi,Hi),O.vadd(Vi,Vi);const K=$n.distanceTo(M);!(rn.pointInTriangle($n,Ri,Hi,Vi)||rn.pointInTriangle($n,Hi,Ri,Vi))||K>x||this.reportIntersection(u,$n,o,s,T)}}}}_intersectTrimesh(e,t,i,s,o,c){const u=LT,d=OT,f=zT,m=wv,v=IT,p=DT,y=NT,M=FT,E=UT,x=e.indices;e.vertices;const _=this.from,w=this.to,A=this.direction;f.position.copy(i),f.quaternion.copy(t),Ut.vectorToLocalFrame(i,t,A,v),Ut.pointToLocalFrame(i,t,_,p),Ut.pointToLocalFrame(i,t,w,y),y.x*=e.scale.x,y.y*=e.scale.y,y.z*=e.scale.z,p.x*=e.scale.x,p.y*=e.scale.y,p.z*=e.scale.z,y.vsub(p,v),v.normalize();const T=p.distanceSquared(y);e.tree.rayQuery(this,f,d);for(let U=0,D=d.length;!this.result.shouldStop&&U!==D;U++){const N=d[U];e.getNormal(N,u),e.getVertex(x[N*3],Ri),Ri.vsub(p,m);const O=v.dot(u),b=u.dot(m)/O;if(b<0)continue;v.scale(b,$n),$n.vadd(p,$n),e.getVertex(x[N*3+1],Hi),e.getVertex(x[N*3+2],Vi);const C=$n.distanceSquared(p);!(rn.pointInTriangle($n,Hi,Ri,Vi)||rn.pointInTriangle($n,Ri,Hi,Vi))||C>T||(Ut.vectorToWorldFrame(t,u,E),Ut.pointToWorldFrame(i,t,$n,M),this.reportIntersection(E,M,o,s,N))}d.length=0}reportIntersection(e,t,i,s,o){const c=this.from,u=this.to,d=c.distanceTo(t),f=this.result;if(!(this.skipBackfaces&&e.dot(this.direction)>0))switch(f.hitFaceIndex=typeof o<"u"?o:-1,this.mode){case rn.ALL:this.hasHit=!0,f.set(c,u,e,t,i,s,d),f.hasHit=!0,this.callback(f);break;case rn.CLOSEST:(d<f.distance||!f.hasHit)&&(this.hasHit=!0,f.hasHit=!0,f.set(c,u,e,t,i,s,d));break;case rn.ANY:this.hasHit=!0,f.hasHit=!0,f.set(c,u,e,t,i,s,d),f.shouldStop=!0;break}}static pointInTriangle(e,t,i,s){s.vsub(t,bs),i.vsub(t,wa),e.vsub(t,pd);const o=bs.dot(bs),c=bs.dot(wa),u=bs.dot(pd),d=wa.dot(wa),f=wa.dot(pd);let m,v;return(m=d*u-c*f)>=0&&(v=o*f-c*u)>=0&&m+v<o*d-c*c}}rn.CLOSEST=Cf.CLOSEST;rn.ANY=Cf.ANY;rn.ALL=Cf.ALL;const Mv=new oi,fd=[],wa=new P,pd=new P,wT=new P,TT=new sn,$n=new P,Ri=new P,Hi=new P,Vi=new P;new P;new Hc;const Ev={faceList:[0]},xc=new P,AT=new rn,CT=[],RT=new P,bT=new P,PT=new P;new P;new P;const wv=new P,LT=new P,IT=new P,DT=new P,NT=new P,UT=new P,FT=new P;new oi;const OT=[],zT=new Ut,bs=new P,Sc=new P;function BT(a,e,t){t.vsub(a,bs);const i=bs.dot(e);return e.scale(i,Sc),Sc.vadd(a,Sc),t.distanceTo(Sc)}class kT{static defaults(e,t){e===void 0&&(e={});for(let i in t)i in e||(e[i]=t[i]);return e}}class Tv{constructor(){this.spatial=new P,this.rotational=new P}multiplyElement(e){return e.spatial.dot(this.spatial)+e.rotational.dot(this.rotational)}multiplyVectors(e,t){return e.dot(this.spatial)+t.dot(this.rotational)}}class Ha{constructor(e,t,i,s){i===void 0&&(i=-1e6),s===void 0&&(s=1e6),this.id=Ha.idCounter++,this.minForce=i,this.maxForce=s,this.bi=e,this.bj=t,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new Tv,this.jacobianElementB=new Tv,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(e,t,i){const s=t,o=e,c=i;this.a=4/(c*(1+4*s)),this.b=4*s/(1+4*s),this.eps=4/(c*c*o*(1+4*s))}computeB(e,t,i){const s=this.computeGW(),o=this.computeGq(),c=this.computeGiMf();return-o*e-s*t-c*i}computeGq(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.position,c=s.position;return e.spatial.dot(o)+t.spatial.dot(c)}computeGW(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.velocity,c=s.velocity,u=i.angularVelocity,d=s.angularVelocity;return e.multiplyVectors(o,u)+t.multiplyVectors(c,d)}computeGWlambda(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.vlambda,c=s.vlambda,u=i.wlambda,d=s.wlambda;return e.multiplyVectors(o,u)+t.multiplyVectors(c,d)}computeGiMf(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.force,c=i.torque,u=s.force,d=s.torque,f=i.invMassSolve,m=s.invMassSolve;return o.scale(f,Av),u.scale(m,Cv),i.invInertiaWorldSolve.vmult(c,Rv),s.invInertiaWorldSolve.vmult(d,bv),e.multiplyVectors(Av,Rv)+t.multiplyVectors(Cv,bv)}computeGiMGt(){const e=this.jacobianElementA,t=this.jacobianElementB,i=this.bi,s=this.bj,o=i.invMassSolve,c=s.invMassSolve,u=i.invInertiaWorldSolve,d=s.invInertiaWorldSolve;let f=o+c;return u.vmult(e.rotational,Mc),f+=Mc.dot(e.rotational),d.vmult(t.rotational,Mc),f+=Mc.dot(t.rotational),f}addToWlambda(e){const t=this.jacobianElementA,i=this.jacobianElementB,s=this.bi,o=this.bj,c=HT;s.vlambda.addScaledVector(s.invMassSolve*e,t.spatial,s.vlambda),o.vlambda.addScaledVector(o.invMassSolve*e,i.spatial,o.vlambda),s.invInertiaWorldSolve.vmult(t.rotational,c),s.wlambda.addScaledVector(e,c,s.wlambda),o.invInertiaWorldSolve.vmult(i.rotational,c),o.wlambda.addScaledVector(e,c,o.wlambda)}computeC(){return this.computeGiMGt()+this.eps}}Ha.idCounter=0;const Av=new P,Cv=new P,Rv=new P,bv=new P,Mc=new P,HT=new P;class VT extends Ha{constructor(e,t,i){i===void 0&&(i=1e6),super(e,t,0,i),this.restitution=0,this.ri=new P,this.rj=new P,this.ni=new P}computeB(e){const t=this.a,i=this.b,s=this.bi,o=this.bj,c=this.ri,u=this.rj,d=GT,f=WT,m=s.velocity,v=s.angularVelocity;s.force,s.torque;const p=o.velocity,y=o.angularVelocity;o.force,o.torque;const M=XT,E=this.jacobianElementA,x=this.jacobianElementB,_=this.ni;c.cross(_,d),u.cross(_,f),_.negate(E.spatial),d.negate(E.rotational),x.spatial.copy(_),x.rotational.copy(f),M.copy(o.position),M.vadd(u,M),M.vsub(s.position,M),M.vsub(c,M);const w=_.dot(M),A=this.restitution+1,T=A*p.dot(_)-A*m.dot(_)+y.dot(f)-v.dot(d),U=this.computeGiMf();return-w*t-T*i-e*U}getImpactVelocityAlongNormal(){const e=jT,t=qT,i=YT,s=$T,o=ZT;return this.bi.position.vadd(this.ri,i),this.bj.position.vadd(this.rj,s),this.bi.getVelocityAtWorldPoint(i,e),this.bj.getVelocityAtWorldPoint(s,t),e.vsub(t,o),this.ni.dot(o)}}const GT=new P,WT=new P,XT=new P,jT=new P,qT=new P,YT=new P,$T=new P,ZT=new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;class Pv extends Ha{constructor(e,t,i){super(e,t,-i,i),this.ri=new P,this.rj=new P,this.t=new P}computeB(e){this.a;const t=this.b;this.bi,this.bj;const i=this.ri,s=this.rj,o=KT,c=QT,u=this.t;i.cross(u,o),s.cross(u,c);const d=this.jacobianElementA,f=this.jacobianElementB;u.negate(d.spatial),o.negate(d.rotational),f.spatial.copy(u),f.rotational.copy(c);const m=this.computeGW(),v=this.computeGiMf();return-m*t-e*v}}const KT=new P,QT=new P;class Yc{constructor(e,t,i){i=kT.defaults(i,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=Yc.idCounter++,this.materials=[e,t],this.friction=i.friction,this.restitution=i.restitution,this.contactEquationStiffness=i.contactEquationStiffness,this.contactEquationRelaxation=i.contactEquationRelaxation,this.frictionEquationStiffness=i.frictionEquationStiffness,this.frictionEquationRelaxation=i.frictionEquationRelaxation}}Yc.idCounter=0;class $c{constructor(e){e===void 0&&(e={});let t="";typeof e=="string"&&(t=e,e={}),this.name=t,this.id=$c.idCounter++,this.friction=typeof e.friction<"u"?e.friction:-1,this.restitution=typeof e.restitution<"u"?e.restitution:-1}}$c.idCounter=0;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new rn;new P;new P;new P;new P(1,0,0),new P(0,1,0),new P(0,0,1);new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new P;new oi;new P;new oi;new P;new P;new P;new P;new P;new P;new P;new oi;new P;new Ut;new oi;class JT{constructor(){this.equations=[]}solve(e,t){return 0}addEquation(e){e.enabled&&!e.bi.isTrigger&&!e.bj.isTrigger&&this.equations.push(e)}removeEquation(e){const t=this.equations,i=t.indexOf(e);i!==-1&&t.splice(i,1)}removeAllEquations(){this.equations.length=0}}class eA extends JT{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(e,t){let i=0;const s=this.iterations,o=this.tolerance*this.tolerance,c=this.equations,u=c.length,d=t.bodies,f=d.length,m=e;let v,p,y,M,E,x;if(u!==0)for(let T=0;T!==f;T++)d[T].updateSolveMassProperties();const _=nA,w=iA,A=tA;_.length=u,w.length=u,A.length=u;for(let T=0;T!==u;T++){const U=c[T];A[T]=0,w[T]=U.computeB(m),_[T]=1/U.computeC()}if(u!==0){for(let D=0;D!==f;D++){const N=d[D],O=N.vlambda,b=N.wlambda;O.set(0,0,0),b.set(0,0,0)}for(i=0;i!==s;i++){M=0;for(let D=0;D!==u;D++){const N=c[D];v=w[D],p=_[D],x=A[D],E=N.computeGWlambda(),y=p*(v-E-N.eps*x),x+y<N.minForce?y=N.minForce-x:x+y>N.maxForce&&(y=N.maxForce-x),A[D]+=y,M+=y>0?y:-y,N.addToWlambda(y)}if(M*M<o)break}for(let D=0;D!==f;D++){const N=d[D],O=N.velocity,b=N.angularVelocity;N.vlambda.vmul(N.linearFactor,N.vlambda),O.vadd(N.vlambda,O),N.wlambda.vmul(N.angularFactor,N.wlambda),b.vadd(N.wlambda,b)}let T=c.length;const U=1/m;for(;T--;)c[T].multiplier=A[T]*U}return i}}const tA=[],nA=[],iA=[];class rA{constructor(){this.objects=[],this.type=Object}release(){const e=arguments.length;for(let t=0;t!==e;t++)this.objects.push(t<0||arguments.length<=t?void 0:arguments[t]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(e){const t=this.objects;for(;t.length>e;)t.pop();for(;t.length<e;)t.push(this.constructObject());return this}}class sA extends rA{constructor(){super(...arguments),this.type=P}constructObject(){return new P}}const Wt={sphereSphere:je.types.SPHERE,spherePlane:je.types.SPHERE|je.types.PLANE,boxBox:je.types.BOX|je.types.BOX,sphereBox:je.types.SPHERE|je.types.BOX,planeBox:je.types.PLANE|je.types.BOX,convexConvex:je.types.CONVEXPOLYHEDRON,sphereConvex:je.types.SPHERE|je.types.CONVEXPOLYHEDRON,planeConvex:je.types.PLANE|je.types.CONVEXPOLYHEDRON,boxConvex:je.types.BOX|je.types.CONVEXPOLYHEDRON,sphereHeightfield:je.types.SPHERE|je.types.HEIGHTFIELD,boxHeightfield:je.types.BOX|je.types.HEIGHTFIELD,convexHeightfield:je.types.CONVEXPOLYHEDRON|je.types.HEIGHTFIELD,sphereParticle:je.types.PARTICLE|je.types.SPHERE,planeParticle:je.types.PLANE|je.types.PARTICLE,boxParticle:je.types.BOX|je.types.PARTICLE,convexParticle:je.types.PARTICLE|je.types.CONVEXPOLYHEDRON,cylinderCylinder:je.types.CYLINDER,sphereCylinder:je.types.SPHERE|je.types.CYLINDER,planeCylinder:je.types.PLANE|je.types.CYLINDER,boxCylinder:je.types.BOX|je.types.CYLINDER,convexCylinder:je.types.CONVEXPOLYHEDRON|je.types.CYLINDER,heightfieldCylinder:je.types.HEIGHTFIELD|je.types.CYLINDER,particleCylinder:je.types.PARTICLE|je.types.CYLINDER,sphereTrimesh:je.types.SPHERE|je.types.TRIMESH,planeTrimesh:je.types.PLANE|je.types.TRIMESH};class oA{get[Wt.sphereSphere](){return this.sphereSphere}get[Wt.spherePlane](){return this.spherePlane}get[Wt.boxBox](){return this.boxBox}get[Wt.sphereBox](){return this.sphereBox}get[Wt.planeBox](){return this.planeBox}get[Wt.convexConvex](){return this.convexConvex}get[Wt.sphereConvex](){return this.sphereConvex}get[Wt.planeConvex](){return this.planeConvex}get[Wt.boxConvex](){return this.boxConvex}get[Wt.sphereHeightfield](){return this.sphereHeightfield}get[Wt.boxHeightfield](){return this.boxHeightfield}get[Wt.convexHeightfield](){return this.convexHeightfield}get[Wt.sphereParticle](){return this.sphereParticle}get[Wt.planeParticle](){return this.planeParticle}get[Wt.boxParticle](){return this.boxParticle}get[Wt.convexParticle](){return this.convexParticle}get[Wt.cylinderCylinder](){return this.convexConvex}get[Wt.sphereCylinder](){return this.sphereConvex}get[Wt.planeCylinder](){return this.planeConvex}get[Wt.boxCylinder](){return this.boxConvex}get[Wt.convexCylinder](){return this.convexConvex}get[Wt.heightfieldCylinder](){return this.heightfieldCylinder}get[Wt.particleCylinder](){return this.particleCylinder}get[Wt.sphereTrimesh](){return this.sphereTrimesh}get[Wt.planeTrimesh](){return this.planeTrimesh}constructor(e){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new sA,this.world=e,this.currentContactMaterial=e.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(e,t,i,s,o,c){let u;this.contactPointPool.length?(u=this.contactPointPool.pop(),u.bi=e,u.bj=t):u=new VT(e,t),u.enabled=e.collisionResponse&&t.collisionResponse&&i.collisionResponse&&s.collisionResponse;const d=this.currentContactMaterial;u.restitution=d.restitution,u.setSpookParams(d.contactEquationStiffness,d.contactEquationRelaxation,this.world.dt);const f=i.material||e.material,m=s.material||t.material;return f&&m&&f.restitution>=0&&m.restitution>=0&&(u.restitution=f.restitution*m.restitution),u.si=o||i,u.sj=c||s,u}createFrictionEquationsFromContact(e,t){const i=e.bi,s=e.bj,o=e.si,c=e.sj,u=this.world,d=this.currentContactMaterial;let f=d.friction;const m=o.material||i.material,v=c.material||s.material;if(m&&v&&m.friction>=0&&v.friction>=0&&(f=m.friction*v.friction),f>0){const p=f*(u.frictionGravity||u.gravity).length();let y=i.invMass+s.invMass;y>0&&(y=1/y);const M=this.frictionEquationPool,E=M.length?M.pop():new Pv(i,s,p*y),x=M.length?M.pop():new Pv(i,s,p*y);return E.bi=x.bi=i,E.bj=x.bj=s,E.minForce=x.minForce=-p*y,E.maxForce=x.maxForce=p*y,E.ri.copy(e.ri),E.rj.copy(e.rj),x.ri.copy(e.ri),x.rj.copy(e.rj),e.ni.tangents(E.t,x.t),E.setSpookParams(d.frictionEquationStiffness,d.frictionEquationRelaxation,u.dt),x.setSpookParams(d.frictionEquationStiffness,d.frictionEquationRelaxation,u.dt),E.enabled=x.enabled=e.enabled,t.push(E,x),!0}return!1}createFrictionFromAverage(e){let t=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(t,this.frictionResult)||e===1)return;const i=this.frictionResult[this.frictionResult.length-2],s=this.frictionResult[this.frictionResult.length-1];ys.setZero(),So.setZero(),Mo.setZero();const o=t.bi;t.bj;for(let u=0;u!==e;u++)t=this.result[this.result.length-1-u],t.bi!==o?(ys.vadd(t.ni,ys),So.vadd(t.ri,So),Mo.vadd(t.rj,Mo)):(ys.vsub(t.ni,ys),So.vadd(t.rj,So),Mo.vadd(t.ri,Mo));const c=1/e;So.scale(c,i.ri),Mo.scale(c,i.rj),s.ri.copy(i.ri),s.rj.copy(i.rj),ys.normalize(),ys.tangents(i.t,s.t)}getContacts(e,t,i,s,o,c,u){this.contactPointPool=o,this.frictionEquationPool=u,this.result=s,this.frictionResult=c;const d=cA,f=uA,m=aA,v=lA;for(let p=0,y=e.length;p!==y;p++){const M=e[p],E=t[p];let x=null;M.material&&E.material&&(x=i.getContactMaterial(M.material,E.material)||null);const _=M.type&Ge.KINEMATIC&&E.type&Ge.STATIC||M.type&Ge.STATIC&&E.type&Ge.KINEMATIC||M.type&Ge.KINEMATIC&&E.type&Ge.KINEMATIC;for(let w=0;w<M.shapes.length;w++){M.quaternion.mult(M.shapeOrientations[w],d),M.quaternion.vmult(M.shapeOffsets[w],m),m.vadd(M.position,m);const A=M.shapes[w];for(let T=0;T<E.shapes.length;T++){E.quaternion.mult(E.shapeOrientations[T],f),E.quaternion.vmult(E.shapeOffsets[T],v),v.vadd(E.position,v);const U=E.shapes[T];if(!(A.collisionFilterMask&U.collisionFilterGroup&&U.collisionFilterMask&A.collisionFilterGroup)||m.distanceTo(v)>A.boundingSphereRadius+U.boundingSphereRadius)continue;let D=null;A.material&&U.material&&(D=i.getContactMaterial(A.material,U.material)||null),this.currentContactMaterial=D||x||i.defaultContactMaterial;const N=A.type|U.type,O=this[N];if(O){let b=!1;A.type<U.type?b=O.call(this,A,U,m,v,d,f,M,E,A,U,_):b=O.call(this,U,A,v,m,f,d,E,M,A,U,_),b&&_&&(i.shapeOverlapKeeper.set(A.id,U.id),i.bodyOverlapKeeper.set(M.id,E.id))}}}}}sphereSphere(e,t,i,s,o,c,u,d,f,m,v){if(v)return i.distanceSquared(s)<(e.radius+t.radius)**2;const p=this.createContactEquation(u,d,e,t,f,m);s.vsub(i,p.ni),p.ni.normalize(),p.ri.copy(p.ni),p.rj.copy(p.ni),p.ri.scale(e.radius,p.ri),p.rj.scale(-t.radius,p.rj),p.ri.vadd(i,p.ri),p.ri.vsub(u.position,p.ri),p.rj.vadd(s,p.rj),p.rj.vsub(d.position,p.rj),this.result.push(p),this.createFrictionEquationsFromContact(p,this.frictionResult)}spherePlane(e,t,i,s,o,c,u,d,f,m,v){const p=this.createContactEquation(u,d,e,t,f,m);if(p.ni.set(0,0,1),c.vmult(p.ni,p.ni),p.ni.negate(p.ni),p.ni.normalize(),p.ni.scale(e.radius,p.ri),i.vsub(s,Ec),p.ni.scale(p.ni.dot(Ec),Lv),Ec.vsub(Lv,p.rj),-Ec.dot(p.ni)<=e.radius){if(v)return!0;const y=p.ri,M=p.rj;y.vadd(i,y),y.vsub(u.position,y),M.vadd(s,M),M.vsub(d.position,M),this.result.push(p),this.createFrictionEquationsFromContact(p,this.frictionResult)}}boxBox(e,t,i,s,o,c,u,d,f,m,v){return e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t.convexPolyhedronRepresentation,i,s,o,c,u,d,e,t,v)}sphereBox(e,t,i,s,o,c,u,d,f,m,v){const p=this.v3pool,y=FA;i.vsub(s,wc),t.getSideNormals(y,c);const M=e.radius;let E=!1;const x=zA,_=BA,w=kA;let A=null,T=0,U=0,D=0,N=null;for(let G=0,ne=y.length;G!==ne&&E===!1;G++){const H=DA;H.copy(y[G]);const W=H.length();H.normalize();const se=wc.dot(H);if(se<W+M&&se>0){const V=NA,Z=UA;V.copy(y[(G+1)%3]),Z.copy(y[(G+2)%3]);const be=V.length(),re=Z.length();V.normalize(),Z.normalize();const de=wc.dot(V),Me=wc.dot(Z);if(de<be&&de>-be&&Me<re&&Me>-re){const _e=Math.abs(se-W-M);if((N===null||_e<N)&&(N=_e,U=de,D=Me,A=W,x.copy(H),_.copy(V),w.copy(Z),T++,v))return!0}}}if(T){E=!0;const G=this.createContactEquation(u,d,e,t,f,m);x.scale(-M,G.ri),G.ni.copy(x),G.ni.negate(G.ni),x.scale(A,x),_.scale(U,_),x.vadd(_,x),w.scale(D,w),x.vadd(w,G.rj),G.ri.vadd(i,G.ri),G.ri.vsub(u.position,G.ri),G.rj.vadd(s,G.rj),G.rj.vsub(d.position,G.rj),this.result.push(G),this.createFrictionEquationsFromContact(G,this.frictionResult)}let O=p.get();const b=OA;for(let G=0;G!==2&&!E;G++)for(let ne=0;ne!==2&&!E;ne++)for(let H=0;H!==2&&!E;H++)if(O.set(0,0,0),G?O.vadd(y[0],O):O.vsub(y[0],O),ne?O.vadd(y[1],O):O.vsub(y[1],O),H?O.vadd(y[2],O):O.vsub(y[2],O),s.vadd(O,b),b.vsub(i,b),b.lengthSquared()<M*M){if(v)return!0;E=!0;const W=this.createContactEquation(u,d,e,t,f,m);W.ri.copy(b),W.ri.normalize(),W.ni.copy(W.ri),W.ri.scale(M,W.ri),W.rj.copy(O),W.ri.vadd(i,W.ri),W.ri.vsub(u.position,W.ri),W.rj.vadd(s,W.rj),W.rj.vsub(d.position,W.rj),this.result.push(W),this.createFrictionEquationsFromContact(W,this.frictionResult)}p.release(O),O=null;const C=p.get(),z=p.get(),K=p.get(),B=p.get(),j=p.get(),q=y.length;for(let G=0;G!==q&&!E;G++)for(let ne=0;ne!==q&&!E;ne++)if(G%3!==ne%3){y[ne].cross(y[G],C),C.normalize(),y[G].vadd(y[ne],z),K.copy(i),K.vsub(z,K),K.vsub(s,K);const H=K.dot(C);C.scale(H,B);let W=0;for(;W===G%3||W===ne%3;)W++;j.copy(i),j.vsub(B,j),j.vsub(z,j),j.vsub(s,j);const se=Math.abs(H),V=j.length();if(se<y[W].length()&&V<M){if(v)return!0;E=!0;const Z=this.createContactEquation(u,d,e,t,f,m);z.vadd(B,Z.rj),Z.rj.copy(Z.rj),j.negate(Z.ni),Z.ni.normalize(),Z.ri.copy(Z.rj),Z.ri.vadd(s,Z.ri),Z.ri.vsub(i,Z.ri),Z.ri.normalize(),Z.ri.scale(M,Z.ri),Z.ri.vadd(i,Z.ri),Z.ri.vsub(u.position,Z.ri),Z.rj.vadd(s,Z.rj),Z.rj.vsub(d.position,Z.rj),this.result.push(Z),this.createFrictionEquationsFromContact(Z,this.frictionResult)}}p.release(C,z,K,B,j)}planeBox(e,t,i,s,o,c,u,d,f,m,v){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,t.convexPolyhedronRepresentation.id=t.id,this.planeConvex(e,t.convexPolyhedronRepresentation,i,s,o,c,u,d,e,t,v)}convexConvex(e,t,i,s,o,c,u,d,f,m,v,p,y){const M=tC;if(!(i.distanceTo(s)>e.boundingSphereRadius+t.boundingSphereRadius)&&e.findSeparatingAxis(t,i,o,s,c,M,p,y)){const E=[],x=nC;e.clipAgainstHull(i,o,t,s,c,M,-100,100,E);let _=0;for(let w=0;w!==E.length;w++){if(v)return!0;const A=this.createContactEquation(u,d,e,t,f,m),T=A.ri,U=A.rj;M.negate(A.ni),E[w].normal.negate(x),x.scale(E[w].depth,x),E[w].point.vadd(x,T),U.copy(E[w].point),T.vsub(i,T),U.vsub(s,U),T.vadd(i,T),T.vsub(u.position,T),U.vadd(s,U),U.vsub(d.position,U),this.result.push(A),_++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(A,this.frictionResult)}this.enableFrictionReduction&&_&&this.createFrictionFromAverage(_)}}sphereConvex(e,t,i,s,o,c,u,d,f,m,v){const p=this.v3pool;i.vsub(s,HA);const y=t.faceNormals,M=t.faces,E=t.vertices,x=e.radius;let _=!1;for(let w=0;w!==E.length;w++){const A=E[w],T=XA;c.vmult(A,T),s.vadd(T,T);const U=WA;if(T.vsub(i,U),U.lengthSquared()<x*x){if(v)return!0;_=!0;const D=this.createContactEquation(u,d,e,t,f,m);D.ri.copy(U),D.ri.normalize(),D.ni.copy(D.ri),D.ri.scale(x,D.ri),T.vsub(s,D.rj),D.ri.vadd(i,D.ri),D.ri.vsub(u.position,D.ri),D.rj.vadd(s,D.rj),D.rj.vsub(d.position,D.rj),this.result.push(D),this.createFrictionEquationsFromContact(D,this.frictionResult);return}}for(let w=0,A=M.length;w!==A&&_===!1;w++){const T=y[w],U=M[w],D=jA;c.vmult(T,D);const N=qA;c.vmult(E[U[0]],N),N.vadd(s,N);const O=YA;D.scale(-x,O),i.vadd(O,O);const b=$A;O.vsub(N,b);const C=b.dot(D),z=ZA;if(i.vsub(N,z),C<0&&z.dot(D)>0){const K=[];for(let B=0,j=U.length;B!==j;B++){const q=p.get();c.vmult(E[U[B]],q),s.vadd(q,q),K.push(q)}if(IA(K,D,i)){if(v)return!0;_=!0;const B=this.createContactEquation(u,d,e,t,f,m);D.scale(-x,B.ri),D.negate(B.ni);const j=p.get();D.scale(-C,j);const q=p.get();D.scale(-x,q),i.vsub(s,B.rj),B.rj.vadd(q,B.rj),B.rj.vadd(j,B.rj),B.rj.vadd(s,B.rj),B.rj.vsub(d.position,B.rj),B.ri.vadd(i,B.ri),B.ri.vsub(u.position,B.ri),p.release(j),p.release(q),this.result.push(B),this.createFrictionEquationsFromContact(B,this.frictionResult);for(let G=0,ne=K.length;G!==ne;G++)p.release(K[G]);return}else for(let B=0;B!==U.length;B++){const j=p.get(),q=p.get();c.vmult(E[U[(B+1)%U.length]],j),c.vmult(E[U[(B+2)%U.length]],q),s.vadd(j,j),s.vadd(q,q);const G=VA;q.vsub(j,G);const ne=GA;G.unit(ne);const H=p.get(),W=p.get();i.vsub(j,W);const se=W.dot(ne);ne.scale(se,H),H.vadd(j,H);const V=p.get();if(H.vsub(i,V),se>0&&se*se<G.lengthSquared()&&V.lengthSquared()<x*x){if(v)return!0;const Z=this.createContactEquation(u,d,e,t,f,m);H.vsub(s,Z.rj),H.vsub(i,Z.ni),Z.ni.normalize(),Z.ni.scale(x,Z.ri),Z.rj.vadd(s,Z.rj),Z.rj.vsub(d.position,Z.rj),Z.ri.vadd(i,Z.ri),Z.ri.vsub(u.position,Z.ri),this.result.push(Z),this.createFrictionEquationsFromContact(Z,this.frictionResult);for(let be=0,re=K.length;be!==re;be++)p.release(K[be]);p.release(j),p.release(q),p.release(H),p.release(V),p.release(W);return}p.release(j),p.release(q),p.release(H),p.release(V),p.release(W)}for(let B=0,j=K.length;B!==j;B++)p.release(K[B])}}}planeConvex(e,t,i,s,o,c,u,d,f,m,v){const p=KA,y=QA;y.set(0,0,1),o.vmult(y,y);let M=0;const E=JA;for(let x=0;x!==t.vertices.length;x++)if(p.copy(t.vertices[x]),c.vmult(p,p),s.vadd(p,p),p.vsub(i,E),y.dot(E)<=0){if(v)return!0;const w=this.createContactEquation(u,d,e,t,f,m),A=eC;y.scale(y.dot(E),A),p.vsub(A,A),A.vsub(i,w.ri),w.ni.copy(y),p.vsub(s,w.rj),w.ri.vadd(i,w.ri),w.ri.vsub(u.position,w.ri),w.rj.vadd(s,w.rj),w.rj.vsub(d.position,w.rj),this.result.push(w),M++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(w,this.frictionResult)}this.enableFrictionReduction&&M&&this.createFrictionFromAverage(M)}boxConvex(e,t,i,s,o,c,u,d,f,m,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}sphereHeightfield(e,t,i,s,o,c,u,d,f,m,v){const p=t.data,y=e.radius,M=t.elementSize,E=pC,x=fC;Ut.pointToLocalFrame(s,c,i,x);let _=Math.floor((x.x-y)/M)-1,w=Math.ceil((x.x+y)/M)+1,A=Math.floor((x.y-y)/M)-1,T=Math.ceil((x.y+y)/M)+1;if(w<0||T<0||_>p.length||A>p[0].length)return;_<0&&(_=0),w<0&&(w=0),A<0&&(A=0),T<0&&(T=0),_>=p.length&&(_=p.length-1),w>=p.length&&(w=p.length-1),T>=p[0].length&&(T=p[0].length-1),A>=p[0].length&&(A=p[0].length-1);const U=[];t.getRectMinMax(_,A,w,T,U);const D=U[0],N=U[1];if(x.z-y>N||x.z+y<D)return;const O=this.result;for(let b=_;b<w;b++)for(let C=A;C<T;C++){const z=O.length;let K=!1;if(t.getConvexTrianglePillar(b,C,!1),Ut.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(K=this.sphereConvex(e,t.pillarConvex,i,E,o,c,u,d,e,t,v)),v&&K||(t.getConvexTrianglePillar(b,C,!0),Ut.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(K=this.sphereConvex(e,t.pillarConvex,i,E,o,c,u,d,e,t,v)),v&&K))return!0;if(O.length-z>2)return}}boxHeightfield(e,t,i,s,o,c,u,d,f,m,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexHeightfield(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}convexHeightfield(e,t,i,s,o,c,u,d,f,m,v){const p=t.data,y=t.elementSize,M=e.boundingSphereRadius,E=hC,x=dC,_=uC;Ut.pointToLocalFrame(s,c,i,_);let w=Math.floor((_.x-M)/y)-1,A=Math.ceil((_.x+M)/y)+1,T=Math.floor((_.y-M)/y)-1,U=Math.ceil((_.y+M)/y)+1;if(A<0||U<0||w>p.length||T>p[0].length)return;w<0&&(w=0),A<0&&(A=0),T<0&&(T=0),U<0&&(U=0),w>=p.length&&(w=p.length-1),A>=p.length&&(A=p.length-1),U>=p[0].length&&(U=p[0].length-1),T>=p[0].length&&(T=p[0].length-1);const D=[];t.getRectMinMax(w,T,A,U,D);const N=D[0],O=D[1];if(!(_.z-M>O||_.z+M<N))for(let b=w;b<A;b++)for(let C=T;C<U;C++){let z=!1;if(t.getConvexTrianglePillar(b,C,!1),Ut.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(z=this.convexConvex(e,t.pillarConvex,i,E,o,c,u,d,null,null,v,x,null)),v&&z||(t.getConvexTrianglePillar(b,C,!0),Ut.pointToWorldFrame(s,c,t.pillarOffset,E),i.distanceTo(E)<t.pillarConvex.boundingSphereRadius+e.boundingSphereRadius&&(z=this.convexConvex(e,t.pillarConvex,i,E,o,c,u,d,null,null,v,x,null)),v&&z))return!0}}sphereParticle(e,t,i,s,o,c,u,d,f,m,v){const p=oC;if(p.set(0,0,1),s.vsub(i,p),p.lengthSquared()<=e.radius*e.radius){if(v)return!0;const M=this.createContactEquation(d,u,t,e,f,m);p.normalize(),M.rj.copy(p),M.rj.scale(e.radius,M.rj),M.ni.copy(p),M.ni.negate(M.ni),M.ri.set(0,0,0),this.result.push(M),this.createFrictionEquationsFromContact(M,this.frictionResult)}}planeParticle(e,t,i,s,o,c,u,d,f,m,v){const p=iC;p.set(0,0,1),u.quaternion.vmult(p,p);const y=rC;if(s.vsub(u.position,y),p.dot(y)<=0){if(v)return!0;const E=this.createContactEquation(d,u,t,e,f,m);E.ni.copy(p),E.ni.negate(E.ni),E.ri.set(0,0,0);const x=sC;p.scale(p.dot(s),x),s.vsub(x,x),E.rj.copy(x),this.result.push(E),this.createFrictionEquationsFromContact(E,this.frictionResult)}}boxParticle(e,t,i,s,o,c,u,d,f,m,v){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexParticle(e.convexPolyhedronRepresentation,t,i,s,o,c,u,d,e,t,v)}convexParticle(e,t,i,s,o,c,u,d,f,m,v){let p=-1;const y=lC,M=cC;let E=null;const x=aC;if(x.copy(s),x.vsub(i,x),o.conjugate(Iv),Iv.vmult(x,x),e.pointIsInside(x)){e.worldVerticesNeedsUpdate&&e.computeWorldVertices(i,o),e.worldFaceNormalsNeedsUpdate&&e.computeWorldFaceNormals(o);for(let _=0,w=e.faces.length;_!==w;_++){const A=[e.worldVertices[e.faces[_][0]]],T=e.worldFaceNormals[_];s.vsub(A[0],Dv);const U=-T.dot(Dv);if(E===null||Math.abs(U)<Math.abs(E)){if(v)return!0;E=U,p=_,y.copy(T)}}if(p!==-1){const _=this.createContactEquation(d,u,t,e,f,m);y.scale(E,M),M.vadd(s,M),M.vsub(i,M),_.rj.copy(M),y.negate(_.ni),_.ri.set(0,0,0);const w=_.ri,A=_.rj;w.vadd(s,w),w.vsub(d.position,w),A.vadd(i,A),A.vsub(u.position,A),this.result.push(_),this.createFrictionEquationsFromContact(_,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(e,t,i,s,o,c,u,d,f,m,v){return this.convexHeightfield(t,e,s,i,c,o,d,u,f,m,v)}particleCylinder(e,t,i,s,o,c,u,d,f,m,v){return this.convexParticle(t,e,s,i,c,o,d,u,f,m,v)}sphereTrimesh(e,t,i,s,o,c,u,d,f,m,v){const p=_A,y=yA,M=xA,E=SA,x=MA,_=EA,w=CA,A=vA,T=mA,U=RA;Ut.pointToLocalFrame(s,c,i,x);const D=e.radius;w.lowerBound.set(x.x-D,x.y-D,x.z-D),w.upperBound.set(x.x+D,x.y+D,x.z+D),t.getTrianglesInAABB(w,U);const N=gA,O=e.radius*e.radius;for(let B=0;B<U.length;B++)for(let j=0;j<3;j++)if(t.getVertex(t.indices[U[B]*3+j],N),N.vsub(x,T),T.lengthSquared()<=O){if(A.copy(N),Ut.pointToWorldFrame(s,c,A,N),N.vsub(i,T),v)return!0;let q=this.createContactEquation(u,d,e,t,f,m);q.ni.copy(T),q.ni.normalize(),q.ri.copy(q.ni),q.ri.scale(e.radius,q.ri),q.ri.vadd(i,q.ri),q.ri.vsub(u.position,q.ri),q.rj.copy(N),q.rj.vsub(d.position,q.rj),this.result.push(q),this.createFrictionEquationsFromContact(q,this.frictionResult)}for(let B=0;B<U.length;B++)for(let j=0;j<3;j++){t.getVertex(t.indices[U[B]*3+j],p),t.getVertex(t.indices[U[B]*3+(j+1)%3],y),y.vsub(p,M),x.vsub(y,_);const q=_.dot(M);x.vsub(p,_);let G=_.dot(M);if(G>0&&q<0&&(x.vsub(p,_),E.copy(M),E.normalize(),G=_.dot(E),E.scale(G,_),_.vadd(p,_),_.distanceTo(x)<e.radius)){if(v)return!0;const H=this.createContactEquation(u,d,e,t,f,m);_.vsub(x,H.ni),H.ni.normalize(),H.ni.scale(e.radius,H.ri),H.ri.vadd(i,H.ri),H.ri.vsub(u.position,H.ri),Ut.pointToWorldFrame(s,c,_,_),_.vsub(d.position,H.rj),Ut.vectorToWorldFrame(c,H.ni,H.ni),Ut.vectorToWorldFrame(c,H.ri,H.ri),this.result.push(H),this.createFrictionEquationsFromContact(H,this.frictionResult)}}const b=wA,C=TA,z=AA,K=pA;for(let B=0,j=U.length;B!==j;B++){t.getTriangleVertices(U[B],b,C,z),t.getNormal(U[B],K),x.vsub(b,_);let q=_.dot(K);if(K.scale(q,_),x.vsub(_,_),q=_.distanceTo(x),rn.pointInTriangle(_,b,C,z)&&q<e.radius){if(v)return!0;let G=this.createContactEquation(u,d,e,t,f,m);_.vsub(x,G.ni),G.ni.normalize(),G.ni.scale(e.radius,G.ri),G.ri.vadd(i,G.ri),G.ri.vsub(u.position,G.ri),Ut.pointToWorldFrame(s,c,_,_),_.vsub(d.position,G.rj),Ut.vectorToWorldFrame(c,G.ni,G.ni),Ut.vectorToWorldFrame(c,G.ri,G.ri),this.result.push(G),this.createFrictionEquationsFromContact(G,this.frictionResult)}}U.length=0}planeTrimesh(e,t,i,s,o,c,u,d,f,m,v){const p=new P,y=hA;y.set(0,0,1),o.vmult(y,y);for(let M=0;M<t.vertices.length/3;M++){t.getVertex(M,p);const E=new P;E.copy(p),Ut.pointToWorldFrame(s,c,E,p);const x=dA;if(p.vsub(i,x),y.dot(x)<=0){if(v)return!0;const w=this.createContactEquation(u,d,e,t,f,m);w.ni.copy(y);const A=fA;y.scale(x.dot(y),A),p.vsub(A,A),w.ri.copy(A),w.ri.vsub(u.position,w.ri),w.rj.copy(p),w.rj.vsub(d.position,w.rj),this.result.push(w),this.createFrictionEquationsFromContact(w,this.frictionResult)}}}}const ys=new P,So=new P,Mo=new P,aA=new P,lA=new P,cA=new sn,uA=new sn,hA=new P,dA=new P,fA=new P,pA=new P,mA=new P;new P;const gA=new P,vA=new P,_A=new P,yA=new P,xA=new P,SA=new P,MA=new P,EA=new P,wA=new P,TA=new P,AA=new P,CA=new oi,RA=[],Ec=new P,Lv=new P,bA=new P,PA=new P,LA=new P;function IA(a,e,t){let i=null;const s=a.length;for(let o=0;o!==s;o++){const c=a[o],u=bA;a[(o+1)%s].vsub(c,u);const d=PA;u.cross(e,d);const f=LA;t.vsub(c,f);const m=d.dot(f);if(i===null||m>0&&i===!0||m<=0&&i===!1){i===null&&(i=m>0);continue}else return!1}return!0}const wc=new P,DA=new P,NA=new P,UA=new P,FA=[new P,new P,new P,new P,new P,new P],OA=new P,zA=new P,BA=new P,kA=new P,HA=new P,VA=new P,GA=new P,WA=new P,XA=new P,jA=new P,qA=new P,YA=new P,$A=new P,ZA=new P;new P;new P;const KA=new P,QA=new P,JA=new P,eC=new P,tC=new P,nC=new P,iC=new P,rC=new P,sC=new P,oC=new P,Iv=new sn,aC=new P;new P;const lC=new P,Dv=new P,cC=new P,uC=new P,hC=new P,dC=[0],fC=new P,pC=new P;class Nv{constructor(){this.current=[],this.previous=[]}getKey(e,t){if(t<e){const i=t;t=e,e=i}return e<<16|t}set(e,t){const i=this.getKey(e,t),s=this.current;let o=0;for(;i>s[o];)o++;if(i!==s[o]){for(let c=s.length-1;c>=o;c--)s[c+1]=s[c];s[o]=i}}tick(){const e=this.current;this.current=this.previous,this.previous=e,this.current.length=0}getDiff(e,t){const i=this.current,s=this.previous,o=i.length,c=s.length;let u=0;for(let d=0;d<o;d++){let f=!1;const m=i[d];for(;m>s[u];)u++;f=m===s[u],f||Uv(e,m)}u=0;for(let d=0;d<c;d++){let f=!1;const m=s[d];for(;m>i[u];)u++;f=i[u]===m,f||Uv(t,m)}}}function Uv(a,e){a.push((e&4294901760)>>16,e&65535)}const md=(a,e)=>a<e?`${a}-${e}`:`${e}-${a}`;class mC{constructor(){this.data={keys:[]}}get(e,t){const i=md(e,t);return this.data[i]}set(e,t,i){const s=md(e,t);this.get(e,t)||this.data.keys.push(s),this.data[s]=i}delete(e,t){const i=md(e,t),s=this.data.keys.indexOf(i);s!==-1&&this.data.keys.splice(s,1),delete this.data[i]}reset(){const e=this.data,t=e.keys;for(;t.length>0;){const i=t.pop();delete e[i]}}}class gC extends R0{constructor(e){e===void 0&&(e={}),super(),this.dt=-1,this.allowSleep=!!e.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=e.quatNormalizeSkip!==void 0?e.quatNormalizeSkip:0,this.quatNormalizeFast=e.quatNormalizeFast!==void 0?e.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new P,e.gravity&&this.gravity.copy(e.gravity),e.frictionGravity&&(this.frictionGravity=new P,this.frictionGravity.copy(e.frictionGravity)),this.broadphase=e.broadphase!==void 0?e.broadphase:new ET,this.bodies=[],this.hasActiveBodies=!1,this.solver=e.solver!==void 0?e.solver:new eA,this.constraints=[],this.narrowphase=new oA(this),this.collisionMatrix=new xv,this.collisionMatrixPrevious=new xv,this.bodyOverlapKeeper=new Nv,this.shapeOverlapKeeper=new Nv,this.contactmaterials=[],this.contactMaterialTable=new mC,this.defaultMaterial=new $c("default"),this.defaultContactMaterial=new Yc(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(e,t){return this.contactMaterialTable.get(e.id,t.id)}collisionMatrixTick(){const e=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=e,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(e){this.constraints.push(e)}removeConstraint(e){const t=this.constraints.indexOf(e);t!==-1&&this.constraints.splice(t,1)}rayTest(e,t,i){i instanceof Hc?this.raycastClosest(e,t,{skipBackfaces:!0},i):this.raycastAll(e,t,{skipBackfaces:!0},i)}raycastAll(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.ALL,i.from=e,i.to=t,i.callback=s,gd.intersectWorld(this,i)}raycastAny(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.ANY,i.from=e,i.to=t,i.result=s,gd.intersectWorld(this,i)}raycastClosest(e,t,i,s){return i===void 0&&(i={}),i.mode=rn.CLOSEST,i.from=e,i.to=t,i.result=s,gd.intersectWorld(this,i)}addBody(e){this.bodies.includes(e)||(e.index=this.bodies.length,this.bodies.push(e),e.world=this,e.initPosition.copy(e.position),e.initVelocity.copy(e.velocity),e.timeLastSleepy=this.time,e instanceof Ge&&(e.initAngularVelocity.copy(e.angularVelocity),e.initQuaternion.copy(e.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=e,this.idToBodyMap[e.id]=e,this.dispatchEvent(this.addBodyEvent))}removeBody(e){e.world=null;const t=this.bodies.length-1,i=this.bodies,s=i.indexOf(e);if(s!==-1){i.splice(s,1);for(let o=0;o!==i.length;o++)i[o].index=o;this.collisionMatrix.setNumObjects(t),this.removeBodyEvent.body=e,delete this.idToBodyMap[e.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(e){return this.idToBodyMap[e]}getShapeById(e){const t=this.bodies;for(let i=0;i<t.length;i++){const s=t[i].shapes;for(let o=0;o<s.length;o++){const c=s[o];if(c.id===e)return c}}return null}addContactMaterial(e){this.contactmaterials.push(e),this.contactMaterialTable.set(e.materials[0].id,e.materials[1].id,e)}removeContactMaterial(e){const t=this.contactmaterials.indexOf(e);t!==-1&&(this.contactmaterials.splice(t,1),this.contactMaterialTable.delete(e.materials[0].id,e.materials[1].id))}fixedStep(e,t){e===void 0&&(e=1/60),t===void 0&&(t=10);const i=hn.now()/1e3;if(!this.lastCallTime)this.step(e,void 0,t);else{const s=i-this.lastCallTime;this.step(e,s,t)}this.lastCallTime=i}step(e,t,i){if(i===void 0&&(i=10),t===void 0)this.internalStep(e),this.time+=e;else{this.accumulator+=t;const s=hn.now();let o=0;for(;this.accumulator>=e&&o<i&&(this.internalStep(e),this.accumulator-=e,o++,!(hn.now()-s>e*1e3)););this.accumulator=this.accumulator%e;const c=this.accumulator/e;for(let u=0;u!==this.bodies.length;u++){const d=this.bodies[u];d.previousPosition.lerp(d.position,c,d.interpolatedPosition),d.previousQuaternion.slerp(d.quaternion,c,d.interpolatedQuaternion),d.previousQuaternion.normalize()}this.time+=t}}internalStep(e){this.dt=e;const t=this.contacts,i=SC,s=MC,o=this.bodies.length,c=this.bodies,u=this.solver,d=this.gravity,f=this.doProfiling,m=this.profile,v=Ge.DYNAMIC;let p=-1/0;const y=this.constraints,M=xC;d.length();const E=d.x,x=d.y,_=d.z;let w=0;for(f&&(p=hn.now()),w=0;w!==o;w++){const B=c[w];if(B.type===v){const j=B.force,q=B.mass;j.x+=q*E,j.y+=q*x,j.z+=q*_}}for(let B=0,j=this.subsystems.length;B!==j;B++)this.subsystems[B].update();f&&(p=hn.now()),i.length=0,s.length=0,this.broadphase.collisionPairs(this,i,s),f&&(m.broadphase=hn.now()-p);let A=y.length;for(w=0;w!==A;w++){const B=y[w];if(!B.collideConnected)for(let j=i.length-1;j>=0;j-=1)(B.bodyA===i[j]&&B.bodyB===s[j]||B.bodyB===i[j]&&B.bodyA===s[j])&&(i.splice(j,1),s.splice(j,1))}this.collisionMatrixTick(),f&&(p=hn.now());const T=yC,U=t.length;for(w=0;w!==U;w++)T.push(t[w]);t.length=0;const D=this.frictionEquations.length;for(w=0;w!==D;w++)M.push(this.frictionEquations[w]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(i,s,this,t,T,this.frictionEquations,M),f&&(m.narrowphase=hn.now()-p),f&&(p=hn.now()),w=0;w<this.frictionEquations.length;w++)u.addEquation(this.frictionEquations[w]);const N=t.length;for(let B=0;B!==N;B++){const j=t[B],q=j.bi,G=j.bj,ne=j.si,H=j.sj;let W;if(q.material&&G.material?W=this.getContactMaterial(q.material,G.material)||this.defaultContactMaterial:W=this.defaultContactMaterial,W.friction,q.material&&G.material&&(q.material.friction>=0&&G.material.friction>=0&&q.material.friction*G.material.friction,q.material.restitution>=0&&G.material.restitution>=0&&(j.restitution=q.material.restitution*G.material.restitution)),u.addEquation(j),q.allowSleep&&q.type===Ge.DYNAMIC&&q.sleepState===Ge.SLEEPING&&G.sleepState===Ge.AWAKE&&G.type!==Ge.STATIC){const se=G.velocity.lengthSquared()+G.angularVelocity.lengthSquared(),V=G.sleepSpeedLimit**2;se>=V*2&&(q.wakeUpAfterNarrowphase=!0)}if(G.allowSleep&&G.type===Ge.DYNAMIC&&G.sleepState===Ge.SLEEPING&&q.sleepState===Ge.AWAKE&&q.type!==Ge.STATIC){const se=q.velocity.lengthSquared()+q.angularVelocity.lengthSquared(),V=q.sleepSpeedLimit**2;se>=V*2&&(G.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(q,G,!0),this.collisionMatrixPrevious.get(q,G)||(Ta.body=G,Ta.contact=j,q.dispatchEvent(Ta),Ta.body=q,G.dispatchEvent(Ta)),this.bodyOverlapKeeper.set(q.id,G.id),this.shapeOverlapKeeper.set(ne.id,H.id)}for(this.emitContactEvents(),f&&(m.makeContactConstraints=hn.now()-p,p=hn.now()),w=0;w!==o;w++){const B=c[w];B.wakeUpAfterNarrowphase&&(B.wakeUp(),B.wakeUpAfterNarrowphase=!1)}for(A=y.length,w=0;w!==A;w++){const B=y[w];B.update();for(let j=0,q=B.equations.length;j!==q;j++){const G=B.equations[j];u.addEquation(G)}}u.solve(e,this),f&&(m.solve=hn.now()-p),u.removeAllEquations();const O=Math.pow;for(w=0;w!==o;w++){const B=c[w];if(B.type&v){const j=O(1-B.linearDamping,e),q=B.velocity;q.scale(j,q);const G=B.angularVelocity;if(G){const ne=O(1-B.angularDamping,e);G.scale(ne,G)}}}this.dispatchEvent(_C),f&&(p=hn.now());const C=this.stepnumber%(this.quatNormalizeSkip+1)===0,z=this.quatNormalizeFast;for(w=0;w!==o;w++)c[w].integrate(e,C,z);this.clearForces(),this.broadphase.dirty=!0,f&&(m.integrate=hn.now()-p),this.stepnumber+=1,this.dispatchEvent(vC);let K=!0;if(this.allowSleep)for(K=!1,w=0;w!==o;w++){const B=c[w];B.sleepTick(this.time),B.sleepState!==Ge.SLEEPING&&(K=!0)}this.hasActiveBodies=K}emitContactEvents(){const e=this.hasAnyEventListener("beginContact"),t=this.hasAnyEventListener("endContact");if((e||t)&&this.bodyOverlapKeeper.getDiff(cr,ur),e){for(let o=0,c=cr.length;o<c;o+=2)Aa.bodyA=this.getBodyById(cr[o]),Aa.bodyB=this.getBodyById(cr[o+1]),this.dispatchEvent(Aa);Aa.bodyA=Aa.bodyB=null}if(t){for(let o=0,c=ur.length;o<c;o+=2)Ca.bodyA=this.getBodyById(ur[o]),Ca.bodyB=this.getBodyById(ur[o+1]),this.dispatchEvent(Ca);Ca.bodyA=Ca.bodyB=null}cr.length=ur.length=0;const i=this.hasAnyEventListener("beginShapeContact"),s=this.hasAnyEventListener("endShapeContact");if((i||s)&&this.shapeOverlapKeeper.getDiff(cr,ur),i){for(let o=0,c=cr.length;o<c;o+=2){const u=this.getShapeById(cr[o]),d=this.getShapeById(cr[o+1]);hr.shapeA=u,hr.shapeB=d,u&&(hr.bodyA=u.body),d&&(hr.bodyB=d.body),this.dispatchEvent(hr)}hr.bodyA=hr.bodyB=hr.shapeA=hr.shapeB=null}if(s){for(let o=0,c=ur.length;o<c;o+=2){const u=this.getShapeById(ur[o]),d=this.getShapeById(ur[o+1]);dr.shapeA=u,dr.shapeB=d,u&&(dr.bodyA=u.body),d&&(dr.bodyB=d.body),this.dispatchEvent(dr)}dr.bodyA=dr.bodyB=dr.shapeA=dr.shapeB=null}}clearForces(){const e=this.bodies,t=e.length;for(let i=0;i!==t;i++){const s=e[i];s.force,s.torque,s.force.set(0,0,0),s.torque.set(0,0,0)}}}new oi;const gd=new rn,hn=globalThis.performance||{};if(!hn.now){let a=Date.now();hn.timing&&hn.timing.navigationStart&&(a=hn.timing.navigationStart),hn.now=()=>Date.now()-a}new P;const vC={type:"postStep"},_C={type:"preStep"},Ta={type:Ge.COLLIDE_EVENT_NAME,body:null,contact:null},yC=[],xC=[],SC=[],MC=[],cr=[],ur=[],Aa={type:"beginContact",bodyA:null,bodyB:null},Ca={type:"endContact",bodyA:null,bodyB:null},hr={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},dr={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},xs=new Y,Ss=new Ln,Fv=new si(0,0,0,"YXZ");class EC{constructor(){Ne(this,"world",new gC({gravity:new P(0,-9.82,0)}));Ne(this,"bodies",new Map);Ne(this,"ground",null)}rebuild(e){this.clear(),this.ensureGround(),e.traverse(t=>{if(!t.meshRenderer.enabled)return;this.halfExtents(t.meshRenderer.primitive,t.meshRenderer.size);const i=new za(new P(xs.x,xs.y,xs.z)),s=new Ge({mass:1});s.addShape(i);const o=t.transform.localPosition,c=t.transform.localRotation;s.position.set(o.x,o.y,o.z),Ss.setFromEuler(c),s.quaternion.set(Ss.x,Ss.y,Ss.z,Ss.w),this.world.addBody(s),this.bodies.set(t.id,s)})}step(e){this.world.step(1/60,e,3)}syncTransforms(e){for(const[t,i]of this.bodies){const s=e.getObject(t);s&&(s.transform.localPosition.set(i.position.x,i.position.y,i.position.z),Ss.set(i.quaternion.x,i.quaternion.y,i.quaternion.z,i.quaternion.w),Fv.setFromQuaternion(Ss,"YXZ"),s.transform.localRotation.copy(Fv))}}clear(){for(const e of this.bodies.values())this.world.removeBody(e);this.bodies.clear(),this.ground&&(this.world.removeBody(this.ground),this.ground=null)}ensureGround(){const e=new Ge({mass:0});e.addShape(new za(new P(50,.05,50))),e.position.set(0,-.05,0),this.world.addBody(e),this.ground=e}halfExtents(e,t){const i=Math.max(.05,t);if(xs.set(i/2,i/2,i/2),e==="sphere"){const s=i*.55;xs.set(s,s,s)}else e==="cylinder"?xs.set(i*.45,i/2,i*.45):e==="plane"&&xs.set(i*2,.05,i*2)}}function wC(a,e,t){const i={log:(...u)=>console.log("[Script]",...u),setColor(u){a.meshRenderer.color=u,e.notifyMaterialsDirty()},spin(u){a.transform.localRotation.y+=u*.016}},s=new Function("api","dt",t),o=a.script;if(!o)return;const c=o.onUpdate.bind(o);o.onUpdate=(u,d,f)=>{c(u,d,f),s(i,u)}}function TC(){return{mode:"standard",mapDataUrl:null,tilingU:1,tilingV:1,offsetU:0,offsetV:0,rotation:0,proceduralPreset:"grass",shaderId:"basicColor"}}class AC{constructor(){Ne(this,"enabled",!0);Ne(this,"primitive","box");Ne(this,"color","#6b8cff");Ne(this,"size",1);Ne(this,"surface",TC())}}class CC{constructor(){Ne(this,"localPosition",new Y);Ne(this,"localRotation",new si(0,0,0,"YXZ"));Ne(this,"localScale",new Y(1,1,1))}copyFrom(e){this.localPosition.copy(e.localPosition),this.localRotation.copy(e.localRotation),this.localScale.copy(e.localScale)}}let Ov=0;function RC(a="Object"){return Ov+=1,`${a}_${Ov}`}class Rf{constructor(e,t){Ne(this,"id");Ne(this,"name");Ne(this,"transform",new CC);Ne(this,"meshRenderer");Ne(this,"script");Ne(this,"parent",null);Ne(this,"children",[]);this.id=t??RC("GameObject"),this.name=e??"GameObject",this.meshRenderer=new AC}getPath(){const e=[];let t=this;for(;t;)e.unshift(t.name),t=t.parent;return e.join(" / ")}}class cf{constructor(){Ne(this,"enabled",!0);Ne(this,"userSource")}onUpdate(e,t,i){}}class F0{constructor(){Ne(this,"roots",[]);Ne(this,"index",new Map);Ne(this,"listeners",new Set)}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(){for(const e of this.listeners)e()}getRoots(){return this.roots}getObject(e){return this.index.get(e)}createPrimitive(e,t,i=null){const s=new Rf(e);return s.meshRenderer.primitive=t,this.register(s),this.setParent(s,i),this.emit(),s}register(e){if(this.index.has(e.id))throw new Error(`GameObject ${e.id} is already registered`);this.index.set(e.id,e),!e.parent&&!this.roots.includes(e)&&this.roots.push(e),this.emit()}destroy(e){if(!this.index.has(e.id))return;const t=[...e.children];for(const i of t)this.setParent(i,e.parent);this.setParent(e,null),this.roots.splice(this.roots.indexOf(e),1),this.index.delete(e.id),this.emit()}setParent(e,t){if(!this.index.has(e.id))throw new Error(`Unknown GameObject ${e.id}`);if(t&&!this.index.has(t.id))throw new Error(`Unknown parent GameObject ${t.id}`);if(t&&this.isDescendant(t,e))throw new Error("Cannot parent an object to one of its descendants");if(e.parent){const i=e.parent.children;i.splice(i.indexOf(e),1)}else{const i=this.roots.indexOf(e);i>=0&&this.roots.splice(i,1)}e.parent=t,t?t.children.push(e):this.roots.includes(e)||this.roots.push(e),this.emit()}isDescendant(e,t){let i=t.parent;for(;i;){if(i.id===e.id)return!0;i=i.parent}return!1}traverse(e){const t=i=>{e(i);for(const s of i.children)t(s)};for(const i of this.roots)t(i)}attachDemoSpinner(e){const t=new cf;t.onUpdate=(i,s)=>{s.transform.localRotation.y+=i*.9},e.script=t,this.emit()}cloneMeshAndScriptFrom(e,t){if(t.meshRenderer.enabled=e.meshRenderer.enabled,t.meshRenderer.primitive=e.meshRenderer.primitive,t.meshRenderer.color=e.meshRenderer.color,t.meshRenderer.size=e.meshRenderer.size,t.meshRenderer.surface={...e.meshRenderer.surface},e.script){const i=new cf;i.enabled=e.script.enabled,i.userSource=e.script.userSource,i.onUpdate=(s,o,c)=>e.script.onUpdate(s,o,c),t.script=i}else t.script=void 0;this.emit()}}function bC(a){const e=new F0,t=s=>{const o=new Rf(s.name,s.id);if(o.transform.copyFrom(s.transform),PC(s.meshRenderer,o.meshRenderer),s.script){const c=new cf;c.enabled=s.script.enabled,c.userSource=s.script.userSource,c.onUpdate=(u,d,f)=>s.script.onUpdate(u,d,f),o.script=c}return o},i=(s,o)=>{const c=t(s);e.register(c),e.setParent(c,o);for(const u of s.children)i(u,c)};for(const s of a.getRoots())i(s,null);return e}function PC(a,e){e.enabled=a.enabled,e.primitive=a.primitive,e.color=a.color,e.size=a.size,e.surface={...a.surface}}class LC{constructor(){Ne(this,"raycaster",new C0);Ne(this,"ndc",new Mt)}pick(e,t,i,s,o,c){if(o<=0||c<=0)return null;this.ndc.x=i/o*2-1,this.ndc.y=-(s/c)*2+1,this.raycaster.setFromCamera(this.ndc,e);const u=this.raycaster.intersectObject(t,!0);for(const d of u){const f=d.object.userData.gameObjectId;if(f)return f}return null}}class IC{createBuiltIn(e,t){const i=this.getSource(e),s=g0.merge([Re.lights,Re.fog,i.uniforms]);return t&&Object.assign(s,t),new Di({uniforms:s,vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,lights:e!=="basicColor",fog:!0})}validateGlsl(e,t){try{const i=new Di({uniforms:{},vertexShader:e,fragmentShader:t});return i.needsUpdate=!0,{ok:!0}}catch(i){return{ok:!1,message:i instanceof Error?i.message:String(i)}}}getSource(e){switch(e){case"water":return FC;case"glow":return OC;case"pbrLite":return UC;case"texturedLit":return NC;case"basicColor":default:return DC}}}const DC={uniforms:{uColor:{value:new at(7048447)},uTime:{value:0}},vertexShader:`
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
  `},NC={uniforms:{uMap:{value:null},uTime:{value:0}},vertexShader:`
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
  `},UC={uniforms:{uBaseColor:{value:new at(11184810)},uLightDir:{value:new Y(.4,.85,.35).normalize()},uTime:{value:0}},vertexShader:`
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
  `},OC={uniforms:{uColor:{value:new at(6750156)},uTime:{value:0}},vertexShader:`
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
  `};class zC{constructor(){Ne(this,"resolution",48);Ne(this,"worldSize",36);Ne(this,"heights");Ne(this,"splat");Ne(this,"mesh");Ne(this,"biome","forest");const e=this.resolution*this.resolution;this.heights=new Float32Array(e),this.splat=new Uint8Array(e),this.mesh=new Fe(new Sn,new of({vertexColors:!0,flatShading:!1})),this.mesh.receiveShadow=!0,this.mesh.castShadow=!1,this.mesh.name="Terrain",this.flattenHeights(0)}flattenHeights(e){this.heights.fill(e),this.rebuildMesh()}generateNoise(e,t,i,s){this.biome=s;const o=this.resolution,c=Math.max(1e-4,t);for(let u=0;u<o;u+=1)for(let d=0;d<o;d+=1){const f=d/o,m=u/o,v=Nc(f*i,m*i,s.length*131),p=(v-.5)*2*e;this.heights[u*o+d]=p/c,this.splat[u*o+d]=v>.62?2:v<.35?1:0}this.rebuildMesh()}applyBrush(e,t,i,s,o,c){const u=this.worldSize/2,d=this.resolution;for(let f=0;f<d;f+=1)for(let m=0;m<d;m+=1){const v=m/(d-1)*this.worldSize-u,p=f/(d-1)*this.worldSize-u,y=v-e,M=p-t,E=Math.sqrt(y*y+M*M);if(E>i)continue;const x=1-E/i,_=f*d+m;o==="raise"&&(this.heights[_]+=s*x*.08),o==="lower"&&(this.heights[_]-=s*x*.08),o==="flatten"&&(this.heights[_]+=(c-this.heights[_])*s*x*.15)}this.rebuildMesh()}paintSplat(e,t,i,s){const o=this.worldSize/2,c=this.resolution;for(let u=0;u<c;u+=1)for(let d=0;d<c;d+=1){const f=d/(c-1)*this.worldSize-o,m=u/(c-1)*this.worldSize-o,v=f-e,p=m-t;Math.sqrt(v*v+p*p)<=i&&(this.splat[u*c+d]=s)}this.rebuildMesh()}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}rebuildMesh(){const e=this.resolution,t=this.worldSize/2,i=e*e,s=new Float32Array(i*3),o=new Float32Array(i*3),c=[],u=this.biome==="desert"?new at(13608555):this.biome==="snow"?new at(14150911):new at(5214038);for(let f=0;f<e;f+=1)for(let m=0;m<e;m+=1){const v=f*e+m,p=m/(e-1)*this.worldSize-t,y=f/(e-1)*this.worldSize-t,M=this.heights[v],E=v*3;s[E+0]=p,s[E+1]=M,s[E+2]=y;const x=this.splat[v]===1?new at(14467216):this.splat[v]===2?new at(7304837):u.clone();o[E+0]=x.r,o[E+1]=x.g,o[E+2]=x.b}for(let f=0;f<e-1;f+=1)for(let m=0;m<e-1;m+=1){const v=f*e+m,p=v+1,y=v+e,M=y+1;c.push(v,y,p,p,y,M)}const d=new Sn;d.setAttribute("position",new Qn(s,3)),d.setAttribute("color",new Qn(o,3)),d.setIndex(c),d.computeVertexNormals(),this.mesh.geometry.dispose(),this.mesh.geometry=d}}class BC{constructor(){Ne(this,"sceneGraph",new F0);Ne(this,"runtimeGraph",null);Ne(this,"scene",new P1);Ne(this,"camera");Ne(this,"renderer");Ne(this,"flyController");Ne(this,"selectionResolver",new LC);Ne(this,"shaderManager",new IC);Ne(this,"physics",new EC);Ne(this,"terrain",new zC);Ne(this,"gizmo",null);Ne(this,"gizmoDragging",!1);Ne(this,"clock",new H1);Ne(this,"totalTime",0);Ne(this,"sceneRoot",new wo);Ne(this,"groups",new Map);Ne(this,"meshes",new Map);Ne(this,"playMode",!1);Ne(this,"disposers",[]);Ne(this,"selectionHelper",null);Ne(this,"selectedId",null);Ne(this,"sun");Ne(this,"ambient");Ne(this,"onMaterialDirty");this.scene.background=new at(1184794),this.scene.add(this.sceneRoot),this.scene.add(this.terrain.mesh),this.camera=new gi(60,1,.1,500),this.camera.position.set(4,3,6),this.renderer=new b1({antialias:!0,alpha:!1}),this.renderer.outputColorSpace=Bn,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.sun=new B1(16777215,1.1),this.sun.position.set(3,6,4),this.sun.castShadow=!0,this.scene.add(this.sun),this.ambient=new k1(16777215,.35),this.scene.add(this.ambient),this.flyController=new W1(this.camera),this.flyController.yaw=-.7,this.flyController.pitch=-.35,this.camera.rotation.order="YXZ",this.camera.rotation.y=this.flyController.yaw,this.camera.rotation.x=this.flyController.pitch}mount(e){e.innerHTML="",e.appendChild(this.renderer.domElement),this.renderer.setSize(e.clientWidth,e.clientHeight,!1),this.camera.aspect=e.clientWidth/Math.max(e.clientHeight,1),this.camera.updateProjectionMatrix();const t=new ResizeObserver(()=>{const i=e.clientWidth,s=Math.max(e.clientHeight,1);this.renderer.setSize(i,s,!1),this.camera.aspect=i/s,this.camera.updateProjectionMatrix()});t.observe(e),this.disposers.push(()=>t.disconnect())}dispose(){for(const e of this.disposers)e();this.disposers=[],this.renderer.dispose();for(const e of this.meshes.values())e.mesh.geometry.dispose(),e.material.dispose();this.meshes.clear(),this.groups.clear(),this.terrain.dispose()}notifyMaterialsDirty(){var e;(e=this.onMaterialDirty)==null||e.call(this)}setMaterialDirtyNotifier(e){this.onMaterialDirty=e,kc.setNotifier(e)}setGizmoDragging(e){this.gizmoDragging=e}setSelectedId(e){this.selectedId=e,this.refreshSelectionHelper()}getSelectedId(){return this.selectedId}getObjectGroup(e){return this.groups.get(e)}refreshSelectionHelper(){if(this.selectionHelper&&(this.scene.remove(this.selectionHelper),this.selectionHelper.dispose(),this.selectionHelper=null),!this.selectedId)return;const e=this.groups.get(this.selectedId);e&&(this.selectionHelper=new V1(e,3137791),this.scene.add(this.selectionHelper))}setLightingPreset(e){e==="day"?(this.scene.background=new at(10406143),this.sun.intensity=1.1,this.ambient.intensity=.35):(this.scene.background=new at(461330),this.sun.intensity=.35,this.ambient.intensity=.12)}setPlayMode(e){this.playMode=e,this.flyController.setEnabled(!e),!e&&document.pointerLockElement===this.renderer.domElement.parentElement&&document.exitPointerLock(),this.gizmo&&(this.gizmo.controls.enabled=!e)}isPlayMode(){return this.playMode}getActiveGraph(){return this.runtimeGraph??this.sceneGraph}enterPlayMode(){this.runtimeGraph=bC(this.sceneGraph),this.runtimeGraph.traverse(e=>{var t;(t=e.script)!=null&&t.userSource&&wC(e,this,e.script.userSource)}),this.physics.rebuild(this.runtimeGraph),this.setPlayMode(!0)}exitPlayMode(){this.setPlayMode(!1),this.physics.clear(),this.runtimeGraph=null}bootstrapDemoScene(){const e=this.sceneGraph.createPrimitive("Baseplate","plane",null);e.transform.localScale.set(4,4,4),e.meshRenderer.color="#2a2f3a";const t=this.sceneGraph.createPrimitive("Part","box",null);t.transform.localPosition.set(0,.6,0),t.meshRenderer.color="#4a90d9",this.sceneGraph.attachDemoSpinner(t);const i=this.sceneGraph.createPrimitive("Orb","sphere",t);i.transform.localPosition.set(1.1,.9,0),i.meshRenderer.color="#f5a524",i.meshRenderer.size=.45}tick(){const e=Math.min(this.clock.getDelta(),.05);this.totalTime+=e;const t=this.getActiveGraph();if(this.playMode&&this.runtimeGraph&&(this.physics.step(e),this.physics.syncTransforms(this.runtimeGraph)),this.syncSceneGraph(t),this.playMode&&t.traverse(i=>{var s;(s=i.script)!=null&&s.enabled&&i.script.onUpdate(e,i,this)}),this.selectionHelper){const i=this.selectedId?this.groups.get(this.selectedId):null;i&&this.selectionHelper.setFromObject(i)}this.flyController.update(e),this.renderer.render(this.scene,this.camera)}pickFromDomEvent(e,t,i,s){return this.selectionResolver.pick(this.camera,this.sceneRoot,e,t,i,s)}syncSceneGraph(e){const t=new Set,i=s=>{t.add(s.id);let o=this.groups.get(s.id);if(o||(o=new wo,o.userData.gameObjectId=s.id,this.groups.set(s.id,o)),this.gizmoDragging&&s.id===this.selectedId||(o.position.copy(s.transform.localPosition),o.rotation.copy(s.transform.localRotation),o.scale.copy(s.transform.localScale)),this.syncMesh(s,o),s.parent){const u=this.groups.get(s.parent.id);u&&o.parent!==u&&u.add(o)}else o.parent!==this.sceneRoot&&this.sceneRoot.add(o);for(const u of s.children)i(u)};for(const s of e.getRoots())i(s);for(const s of[...this.groups.keys()])if(!t.has(s)){this.groups.get(s).removeFromParent(),this.groups.delete(s);const c=this.meshes.get(s);c&&(c.mesh.geometry.dispose(),"map"in c.material&&c.material.map&&(c.material.map=null),c.material.dispose(),this.meshes.delete(s))}}syncMesh(e,t){const i=e.meshRenderer;if(!i.enabled){const u=this.meshes.get(e.id);u&&(t.remove(u.mesh),u.mesh.geometry.dispose(),u.material.dispose(),this.meshes.delete(e.id));return}let s=this.meshes.get(e.id);const o=Uc(i);if((!s||s.primitiveKey!==o)&&s&&(t.remove(s.mesh),s.mesh.geometry.dispose(),"map"in s.material&&s.material.map&&(s.material.map=null),s.material.dispose(),s=void 0),s)s=mv(s.mesh,i,s,this.shaderManager,this.totalTime),this.meshes.set(e.id,s);else{const u=X1.create(i.primitive,i.size),d=new Fe(u);d.castShadow=!0,d.receiveShadow=!0,d.userData.gameObjectId=e.id,t.add(d),s=mv(d,i,void 0,this.shaderManager,this.totalTime),this.meshes.set(e.id,s)}s.mesh.visible=!0}}class kC{constructor(){Ne(this,"savedCamera",null)}start(e){e.isPlayMode()||(this.savedCamera=e.flyController.captureState(),e.enterPlayMode())}stop(e){e.isPlayMode()&&(e.exitPlayMode(),this.savedCamera&&e.flyController.restoreState(this.savedCamera),this.savedCamera=null)}toggle(e){e.isPlayMode()?this.stop(e):this.start(e)}}const zv=a=>{let e;const t=new Set,i=(f,m)=>{const v=typeof f=="function"?f(e):f;if(!Object.is(v,e)){const p=e;e=m??(typeof v!="object"||v===null)?v:Object.assign({},e,v),t.forEach(y=>y(e,p))}},s=()=>e,u={setState:i,getState:s,getInitialState:()=>d,subscribe:f=>(t.add(f),()=>t.delete(f))},d=e=a(i,s,u);return u},HC=(a=>a?zv(a):zv),VC=a=>a;function GC(a,e=VC){const t=Pa.useSyncExternalStore(a.subscribe,Pa.useCallback(()=>e(a.getState()),[a,e]),Pa.useCallback(()=>e(a.getInitialState()),[a,e]));return Pa.useDebugValue(t),t}const Bv=a=>{const e=HC(a),t=i=>GC(e,i);return Object.assign(t,e),t},WC=(a=>a?Bv(a):Bv),en=WC(a=>({selectedId:null,isPlaying:!1,sceneRevision:0,gizmoMode:"translate",snapGrid:0,lightingPreset:"day",terrainBrush:"raise",terrainPaintLayer:0,terrainBiome:"forest",terrainBrushRadius:3,terrainBrushStrength:1,setSelectedId:e=>a({selectedId:e}),setPlaying:e=>a({isPlaying:e}),bumpScene:()=>a(e=>({sceneRevision:e.sceneRevision+1})),setGizmoMode:e=>a({gizmoMode:e}),setSnapGrid:e=>a({snapGrid:e}),setLightingPreset:e=>a({lightingPreset:e}),setTerrainBrush:e=>a({terrainBrush:e}),setTerrainPaintLayer:e=>a({terrainPaintLayer:e}),setTerrainBiome:e=>a({terrainBiome:e}),setTerrainBrushRadius:e=>a({terrainBrushRadius:e}),setTerrainBrushStrength:e=>a({terrainBrushStrength:e})})),O0=Tt.createContext(null);function XC({children:a}){const e=Tt.useMemo(()=>new BC,[]),t=Tt.useMemo(()=>new kC,[]);Tt.useEffect(()=>{const s=e.sceneGraph.subscribe(()=>{en.getState().bumpScene()});return e.sceneGraph.getRoots().length===0&&e.bootstrapDemoScene(),en.getState().bumpScene(),()=>{s()}},[e]);const i=Tt.useMemo(()=>({engine:e,playSession:t}),[e,t]);return ve.jsx(O0.Provider,{value:i,children:a})}function Va(){const a=Tt.useContext(O0);if(!a)throw new Error("useEngineContext must be used within EngineProvider");return a}function jC(){const{engine:a}=Va(),e=en(o=>o.selectedId),t=en(o=>o.setSelectedId),i=en(o=>o.bumpScene),s=(o,c)=>{const u=e?a.sceneGraph.getObject(e)??null:null,d=a.sceneGraph.createPrimitive(o,c,u);t(d.id),i()};return ve.jsxs("footer",{className:"panel asset-panel",children:[ve.jsxs("div",{className:"panel-header",children:[ve.jsx("span",{children:"Asset Browser"}),ve.jsx("span",{className:"muted tiny",children:"Double-click to insert"})]}),ve.jsx("div",{className:"asset-strip",children:by.map(o=>ve.jsxs("button",{type:"button",className:"asset-card",onDoubleClick:()=>{o.kind==="primitive"&&o.primitive&&s(o.label,o.primitive)},children:[ve.jsx("div",{className:"asset-thumb",children:o.kind==="texture"&&o.url?ve.jsx("img",{src:o.url,alt:""}):ve.jsx("div",{className:"asset-placeholder",children:o.label[0]})}),ve.jsxs("div",{className:"asset-meta",children:[ve.jsx("div",{className:"asset-title",children:o.label}),ve.jsx("div",{className:"asset-desc",children:o.description})]})]},o.id))})]})}function z0({node:a,depth:e,selectedId:t,onSelect:i}){const s=a.id===t;return ve.jsxs("div",{className:"hierarchy-node",children:[ve.jsxs("button",{type:"button",className:s?"hierarchy-row selected":"hierarchy-row",style:{paddingLeft:8+e*14},onClick:()=>i(a.id),children:[ve.jsx("span",{className:"hierarchy-chevron",children:a.children.length?"▾":"·"}),ve.jsx("span",{className:"hierarchy-name",children:a.name}),ve.jsx("span",{className:"hierarchy-type",children:a.meshRenderer.primitive})]}),a.children.map(o=>ve.jsx(z0,{node:o,depth:e+1,selectedId:t,onSelect:i},o.id))]})}function qC(){const{engine:a}=Va(),e=en(d=>d.selectedId),t=en(d=>d.setSelectedId),i=en(d=>d.sceneRevision),s=en(d=>d.bumpScene),o=Tt.useMemo(()=>[...a.sceneGraph.getRoots()],[a,i]),c=()=>{if(!e)return;const d=a.sceneGraph.getObject(e);d&&(a.sceneGraph.destroy(d),t(null),s())},u=()=>{const d=e?a.sceneGraph.getObject(e)??null:null,f=a.sceneGraph.createPrimitive("Part","box",d);t(f.id),s()};return ve.jsxs("aside",{className:"panel hierarchy-panel",children:[ve.jsxs("div",{className:"panel-header",children:[ve.jsx("span",{children:"Hierarchy"}),ve.jsxs("div",{className:"panel-header-actions",children:[ve.jsx("button",{type:"button",className:"ghost",onClick:u,children:"+ Part"}),ve.jsx("button",{type:"button",className:"ghost danger",onClick:c,disabled:!e,children:"Delete"})]})]}),ve.jsx("div",{className:"panel-body scrollable",children:o.map(d=>ve.jsx(z0,{node:d,depth:0,selectedId:e,onSelect:t},d.id))})]})}const YC=["box","sphere","cylinder","plane"];function $C(){const{engine:a}=Va(),e=en(W=>W.selectedId),t=en(W=>W.sceneRevision),i=en(W=>W.bumpScene),s=e?a.sceneGraph.getObject(e):void 0,[o,c]=Tt.useState(""),[u,d]=Tt.useState(0),[f,m]=Tt.useState(0),[v,p]=Tt.useState(0),[y,M]=Tt.useState(0),[E,x]=Tt.useState(0),[_,w]=Tt.useState(0),[A,T]=Tt.useState(1),[U,D]=Tt.useState(1),[N,O]=Tt.useState(1),[b,C]=Tt.useState("#ffffff"),[z,K]=Tt.useState("box"),[B,j]=Tt.useState(!0),[q,G]=Tt.useState(!1);Tt.useEffect(()=>{var W;if(!s){c("");return}c(s.name),d(s.transform.localPosition.x),m(s.transform.localPosition.y),p(s.transform.localPosition.z),M(s.transform.localRotation.x),x(s.transform.localRotation.y),w(s.transform.localRotation.z),T(s.transform.localScale.x),D(s.transform.localScale.y),O(s.transform.localScale.z),C(s.meshRenderer.color),K(s.meshRenderer.primitive),j(s.meshRenderer.enabled),G(!!((W=s.script)!=null&&W.enabled))},[s,t,e]);const ne=()=>{s&&(s.name=o.trim()||s.name,s.transform.localPosition.set(u,f,v),s.transform.localRotation.set(y,E,_,"YXZ"),s.transform.localScale.set(A,U,N),i())},H=()=>{s&&(s.meshRenderer.color=b,s.meshRenderer.primitive=z,s.meshRenderer.enabled=B,i())};return ve.jsxs("aside",{className:"panel inspector-panel",children:[ve.jsx("div",{className:"panel-header",children:ve.jsx("span",{children:"Properties"})}),ve.jsxs("div",{className:"panel-body scrollable",children:[!s&&ve.jsx("p",{className:"muted",children:"Select an object to edit its components."}),s&&ve.jsxs("div",{className:"inspector-sections",children:[ve.jsxs("section",{children:[ve.jsx("h3",{children:"GameObject"}),ve.jsxs("label",{className:"field",children:[ve.jsx("span",{children:"Name"}),ve.jsx("input",{value:o,onChange:W=>c(W.target.value),onBlur:ne})]}),ve.jsx("p",{className:"muted tiny",children:s.getPath()})]}),ve.jsxs("section",{children:[ve.jsx("h3",{children:"Transform"}),ve.jsxs("div",{className:"vec3-grid",children:[ve.jsxs("label",{children:["Pos X",ve.jsx("input",{type:"number",step:"0.01",value:u,onChange:W=>d(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Pos Y",ve.jsx("input",{type:"number",step:"0.01",value:f,onChange:W=>m(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Pos Z",ve.jsx("input",{type:"number",step:"0.01",value:v,onChange:W=>p(Number(W.target.value)),onBlur:ne})]})]}),ve.jsxs("div",{className:"vec3-grid",children:[ve.jsxs("label",{children:["Rot X",ve.jsx("input",{type:"number",step:"0.01",value:y,onChange:W=>M(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Rot Y",ve.jsx("input",{type:"number",step:"0.01",value:E,onChange:W=>x(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Rot Z",ve.jsx("input",{type:"number",step:"0.01",value:_,onChange:W=>w(Number(W.target.value)),onBlur:ne})]})]}),ve.jsxs("div",{className:"vec3-grid",children:[ve.jsxs("label",{children:["Scale X",ve.jsx("input",{type:"number",step:"0.01",value:A,onChange:W=>T(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Scale Y",ve.jsx("input",{type:"number",step:"0.01",value:U,onChange:W=>D(Number(W.target.value)),onBlur:ne})]}),ve.jsxs("label",{children:["Scale Z",ve.jsx("input",{type:"number",step:"0.01",value:N,onChange:W=>O(Number(W.target.value)),onBlur:ne})]})]})]}),ve.jsxs("section",{children:[ve.jsx("h3",{children:"MeshRenderer"}),ve.jsxs("label",{className:"field",children:[ve.jsx("span",{children:"Primitive"}),ve.jsx("select",{value:z,onChange:W=>{const se=W.target.value;K(se),s&&(s.meshRenderer.primitive=se,s.meshRenderer.color=b,s.meshRenderer.enabled=B,i())},children:YC.map(W=>ve.jsx("option",{value:W,children:W},W))})]}),ve.jsxs("label",{className:"field",children:[ve.jsx("span",{children:"Color"}),ve.jsx("input",{type:"color",value:b,onChange:W=>C(W.target.value),onBlur:H})]}),ve.jsxs("label",{className:"field checkbox",children:[ve.jsx("input",{type:"checkbox",checked:B,onChange:W=>{j(W.target.checked),s&&(s.meshRenderer.enabled=W.target.checked,i())}}),ve.jsx("span",{children:"Enabled"})]})]}),ve.jsxs("section",{children:[ve.jsx("h3",{children:"Script"}),ve.jsx("p",{className:"muted tiny",children:"Demo script rotates the object while Play mode is active."}),ve.jsxs("label",{className:"field checkbox",children:[ve.jsx("input",{type:"checkbox",checked:q,onChange:W=>{const se=W.target.checked;G(se),s&&(se?s.script?s.script.enabled=!0:a.sceneGraph.attachDemoSpinner(s):s.script&&(s.script.enabled=!1),i())}}),ve.jsx("span",{children:"Run demo script"})]})]})]})]})]})}function ZC(){const{engine:a,playSession:e}=Va(),t=en(o=>o.isPlaying),i=en(o=>o.setPlaying),s=()=>{e.toggle(a),i(a.isPlayMode())};return ve.jsxs("header",{className:"top-bar",children:[ve.jsxs("div",{className:"brand",children:[ve.jsx("span",{className:"brand-mark",children:"◆"}),ve.jsxs("div",{children:[ve.jsx("div",{className:"brand-title",children:"Pixel Studio"}),ve.jsx("div",{className:"brand-subtitle",children:"Modular three.js editor shell"})]})]}),ve.jsxs("div",{className:"top-actions",children:[ve.jsx("button",{type:"button",className:t?"play-toggle active":"play-toggle",onClick:s,children:t?"Stop":"Play"}),ve.jsx("span",{className:"hint",children:"Right-click viewport to capture mouse · WASD moves · Space / Shift vertical"})]})]})}const Ms=new C0,Pn=new Y,Yr=new Y,jt=new Ln,kv={X:new Y(1,0,0),Y:new Y(0,1,0),Z:new Y(0,0,1)},vd={type:"change"},Hv={type:"mouseDown",mode:null},Vv={type:"mouseUp",mode:null},Gv={type:"objectChange"};class KC extends G1{constructor(e,t=null){super(void 0,t);const i=new iR(this);this._root=i;const s=new rR;this._gizmo=s,i.add(s);const o=new sR;this._plane=o,i.add(o);const c=this;function u(A,T){let U=T;Object.defineProperty(c,A,{get:function(){return U!==void 0?U:T},set:function(D){U!==D&&(U=D,o[A]=D,s[A]=D,c.dispatchEvent({type:A+"-changed",value:D}),c.dispatchEvent(vd))}}),c[A]=T,o[A]=T,s[A]=T}u("camera",e),u("object",void 0),u("enabled",!0),u("axis",null),u("mode","translate"),u("translationSnap",null),u("rotationSnap",null),u("scaleSnap",null),u("space","world"),u("size",1),u("dragging",!1),u("showX",!0),u("showY",!0),u("showZ",!0),u("minX",-1/0),u("maxX",1/0),u("minY",-1/0),u("maxY",1/0),u("minZ",-1/0),u("maxZ",1/0);const d=new Y,f=new Y,m=new Ln,v=new Ln,p=new Y,y=new Ln,M=new Y,E=new Y,x=new Y,_=0,w=new Y;u("worldPosition",d),u("worldPositionStart",f),u("worldQuaternion",m),u("worldQuaternionStart",v),u("cameraPosition",p),u("cameraQuaternion",y),u("pointStart",M),u("pointEnd",E),u("rotationAxis",x),u("rotationAngle",_),u("eye",w),this._offset=new Y,this._startNorm=new Y,this._endNorm=new Y,this._cameraScale=new Y,this._parentPosition=new Y,this._parentQuaternion=new Ln,this._parentQuaternionInv=new Ln,this._parentScale=new Y,this._worldScaleStart=new Y,this._worldQuaternionInv=new Ln,this._worldScale=new Y,this._positionStart=new Y,this._quaternionStart=new Ln,this._scaleStart=new Y,this._getPointer=QC.bind(this),this._onPointerDown=eR.bind(this),this._onPointerHover=JC.bind(this),this._onPointerMove=tR.bind(this),this._onPointerUp=nR.bind(this),t!==null&&this.connect()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointermove",this._onPointerHover),this.domElement.addEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerHover),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="auto"}getHelper(){return this._root}pointerHover(e){if(this.object===void 0||this.dragging===!0)return;e!==null&&Ms.setFromCamera(e,this.camera);const t=_d(this._gizmo.picker[this.mode],Ms);t?this.axis=t.object.name:this.axis=null}pointerDown(e){if(!(this.object===void 0||this.dragging===!0||e!=null&&e.button!==0)&&this.axis!==null){e!==null&&Ms.setFromCamera(e,this.camera);const t=_d(this._plane,Ms,!0);t&&(this.object.updateMatrixWorld(),this.object.parent.updateMatrixWorld(),this._positionStart.copy(this.object.position),this._quaternionStart.copy(this.object.quaternion),this._scaleStart.copy(this.object.scale),this.object.matrixWorld.decompose(this.worldPositionStart,this.worldQuaternionStart,this._worldScaleStart),this.pointStart.copy(t.point).sub(this.worldPositionStart)),this.dragging=!0,Hv.mode=this.mode,this.dispatchEvent(Hv)}}pointerMove(e){const t=this.axis,i=this.mode,s=this.object;let o=this.space;if(i==="scale"?o="local":(t==="E"||t==="XYZE"||t==="XYZ")&&(o="world"),s===void 0||t===null||this.dragging===!1||e!==null&&e.button!==-1)return;e!==null&&Ms.setFromCamera(e,this.camera);const c=_d(this._plane,Ms,!0);if(c){if(this.pointEnd.copy(c.point).sub(this.worldPositionStart),i==="translate")this._offset.copy(this.pointEnd).sub(this.pointStart),o==="local"&&t!=="XYZ"&&this._offset.applyQuaternion(this._worldQuaternionInv),t.indexOf("X")===-1&&(this._offset.x=0),t.indexOf("Y")===-1&&(this._offset.y=0),t.indexOf("Z")===-1&&(this._offset.z=0),o==="local"&&t!=="XYZ"?this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale):this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale),s.position.copy(this._offset).add(this._positionStart),this.translationSnap&&(o==="local"&&(s.position.applyQuaternion(jt.copy(this._quaternionStart).invert()),t.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.position.applyQuaternion(this._quaternionStart)),o==="world"&&(s.parent&&s.position.add(Pn.setFromMatrixPosition(s.parent.matrixWorld)),t.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.parent&&s.position.sub(Pn.setFromMatrixPosition(s.parent.matrixWorld)))),s.position.x=Math.max(this.minX,Math.min(this.maxX,s.position.x)),s.position.y=Math.max(this.minY,Math.min(this.maxY,s.position.y)),s.position.z=Math.max(this.minZ,Math.min(this.maxZ,s.position.z));else if(i==="scale"){if(t.search("XYZ")!==-1){let u=this.pointEnd.length()/this.pointStart.length();this.pointEnd.dot(this.pointStart)<0&&(u*=-1),Yr.set(u,u,u)}else Pn.copy(this.pointStart),Yr.copy(this.pointEnd),Pn.applyQuaternion(this._worldQuaternionInv),Yr.applyQuaternion(this._worldQuaternionInv),Yr.divide(Pn),t.search("X")===-1&&(Yr.x=1),t.search("Y")===-1&&(Yr.y=1),t.search("Z")===-1&&(Yr.z=1);s.scale.copy(this._scaleStart).multiply(Yr),this.scaleSnap&&(t.search("X")!==-1&&(s.scale.x=Math.round(s.scale.x/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Y")!==-1&&(s.scale.y=Math.round(s.scale.y/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Z")!==-1&&(s.scale.z=Math.round(s.scale.z/this.scaleSnap)*this.scaleSnap||this.scaleSnap))}else if(i==="rotate"){this._offset.copy(this.pointEnd).sub(this.pointStart);const u=20/this.worldPosition.distanceTo(Pn.setFromMatrixPosition(this.camera.matrixWorld));let d=!1;t==="XYZE"?(this.rotationAxis.copy(this._offset).cross(this.eye).normalize(),this.rotationAngle=this._offset.dot(Pn.copy(this.rotationAxis).cross(this.eye))*u):(t==="X"||t==="Y"||t==="Z")&&(this.rotationAxis.copy(kv[t]),Pn.copy(kv[t]),o==="local"&&Pn.applyQuaternion(this.worldQuaternion),Pn.cross(this.eye),Pn.length()===0?d=!0:this.rotationAngle=this._offset.dot(Pn.normalize())*u),(t==="E"||d)&&(this.rotationAxis.copy(this.eye),this.rotationAngle=this.pointEnd.angleTo(this.pointStart),this._startNorm.copy(this.pointStart).normalize(),this._endNorm.copy(this.pointEnd).normalize(),this.rotationAngle*=this._endNorm.cross(this._startNorm).dot(this.eye)<0?1:-1),this.rotationSnap&&(this.rotationAngle=Math.round(this.rotationAngle/this.rotationSnap)*this.rotationSnap),o==="local"&&t!=="E"&&t!=="XYZE"?(s.quaternion.copy(this._quaternionStart),s.quaternion.multiply(jt.setFromAxisAngle(this.rotationAxis,this.rotationAngle)).normalize()):(this.rotationAxis.applyQuaternion(this._parentQuaternionInv),s.quaternion.copy(jt.setFromAxisAngle(this.rotationAxis,this.rotationAngle)),s.quaternion.multiply(this._quaternionStart).normalize())}this.dispatchEvent(vd),this.dispatchEvent(Gv)}}pointerUp(e){e!==null&&e.button!==0||(this.dragging&&this.axis!==null&&(Vv.mode=this.mode,this.dispatchEvent(Vv)),this.dragging=!1,this.axis=null)}dispose(){this.disconnect(),this._root.dispose()}attach(e){return this.object=e,this._root.visible=!0,this}detach(){return this.object=void 0,this.axis=null,this._root.visible=!1,this}reset(){this.enabled&&this.dragging&&(this.object.position.copy(this._positionStart),this.object.quaternion.copy(this._quaternionStart),this.object.scale.copy(this._scaleStart),this.dispatchEvent(vd),this.dispatchEvent(Gv),this.pointStart.copy(this.pointEnd))}getRaycaster(){return Ms}getMode(){return this.mode}setMode(e){this.mode=e}setTranslationSnap(e){this.translationSnap=e}setRotationSnap(e){this.rotationSnap=e}setScaleSnap(e){this.scaleSnap=e}setSize(e){this.size=e}setSpace(e){this.space=e}}function QC(a){if(this.domElement.ownerDocument.pointerLockElement)return{x:0,y:0,button:a.button};{const e=this.domElement.getBoundingClientRect();return{x:(a.clientX-e.left)/e.width*2-1,y:-(a.clientY-e.top)/e.height*2+1,button:a.button}}}function JC(a){if(this.enabled)switch(a.pointerType){case"mouse":case"pen":this.pointerHover(this._getPointer(a));break}}function eR(a){this.enabled&&(document.pointerLockElement||this.domElement.setPointerCapture(a.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.pointerHover(this._getPointer(a)),this.pointerDown(this._getPointer(a)))}function tR(a){this.enabled&&this.pointerMove(this._getPointer(a))}function nR(a){this.enabled&&(this.domElement.releasePointerCapture(a.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.pointerUp(this._getPointer(a)))}function _d(a,e,t){const i=e.intersectObject(a,!0);for(let s=0;s<i.length;s++)if(i[s].object.visible||t)return i[s];return!1}const Tc=new si,Ot=new Y(0,1,0),Wv=new Y(0,0,0),Xv=new kt,Ac=new Ln,Fc=new Ln,Gi=new Y,jv=new kt,Da=new Y(1,0,0),Ts=new Y(0,1,0),Na=new Y(0,0,1),Cc=new Y,Ra=new Y,ba=new Y;class iR extends on{constructor(e){super(),this.isTransformControlsRoot=!0,this.controls=e,this.visible=!1}updateMatrixWorld(e){const t=this.controls;t.object!==void 0&&(t.object.updateMatrixWorld(),t.object.parent===null?console.error("TransformControls: The attached 3D object must be a part of the scene graph."):t.object.parent.matrixWorld.decompose(t._parentPosition,t._parentQuaternion,t._parentScale),t.object.matrixWorld.decompose(t.worldPosition,t.worldQuaternion,t._worldScale),t._parentQuaternionInv.copy(t._parentQuaternion).invert(),t._worldQuaternionInv.copy(t.worldQuaternion).invert()),t.camera.updateMatrixWorld(),t.camera.matrixWorld.decompose(t.cameraPosition,t.cameraQuaternion,t._cameraScale),t.camera.isOrthographicCamera?t.camera.getWorldDirection(t.eye).negate():t.eye.copy(t.cameraPosition).sub(t.worldPosition).normalize(),super.updateMatrixWorld(e)}dispose(){this.traverse(function(e){e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}}class rR extends on{constructor(){super(),this.isTransformControlsGizmo=!0,this.type="TransformControlsGizmo";const e=new Xc({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),t=new Mf({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),i=e.clone();i.opacity=.15;const s=t.clone();s.opacity=.5;const o=e.clone();o.color.setHex(16711680);const c=e.clone();c.color.setHex(65280);const u=e.clone();u.color.setHex(255);const d=e.clone();d.color.setHex(16711680),d.opacity=.5;const f=e.clone();f.color.setHex(65280),f.opacity=.5;const m=e.clone();m.color.setHex(255),m.opacity=.5;const v=e.clone();v.opacity=.25;const p=e.clone();p.color.setHex(16776960),p.opacity=.25,e.clone().color.setHex(16776960);const M=e.clone();M.color.setHex(7895160);const E=new xn(0,.04,.1,12);E.translate(0,.05,0);const x=new Kt(.08,.08,.08);x.translate(0,.04,0);const _=new Sn;_.setAttribute("position",new $t([0,0,0,1,0,0],3));const w=new xn(.0075,.0075,.5,3);w.translate(0,.25,0);function A(q,G){const ne=new Rs(q,.0075,3,64,G*Math.PI*2);return ne.rotateY(Math.PI/2),ne.rotateX(Math.PI/2),ne}function T(){const q=new Sn;return q.setAttribute("position",new $t([0,0,0,1,1,1],3)),q}const U={X:[[new Fe(E,o),[.5,0,0],[0,0,-Math.PI/2]],[new Fe(E,o),[-.5,0,0],[0,0,Math.PI/2]],[new Fe(w,o),[0,0,0],[0,0,-Math.PI/2]]],Y:[[new Fe(E,c),[0,.5,0]],[new Fe(E,c),[0,-.5,0],[Math.PI,0,0]],[new Fe(w,c)]],Z:[[new Fe(E,u),[0,0,.5],[Math.PI/2,0,0]],[new Fe(E,u),[0,0,-.5],[-Math.PI/2,0,0]],[new Fe(w,u),null,[Math.PI/2,0,0]]],XYZ:[[new Fe(new To(.1,0),v.clone()),[0,0,0]]],XY:[[new Fe(new Kt(.15,.15,.01),m.clone()),[.15,.15,0]]],YZ:[[new Fe(new Kt(.15,.15,.01),d.clone()),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Kt(.15,.15,.01),f.clone()),[.15,0,.15],[-Math.PI/2,0,0]]]},D={X:[[new Fe(new xn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Fe(new xn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(new xn(.2,0,.6,4),i),[0,.3,0]],[new Fe(new xn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Fe(new xn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Fe(new xn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new To(.2,0),i)]],XY:[[new Fe(new Kt(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Fe(new Kt(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Kt(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]]},N={START:[[new Fe(new To(.01,2),s),null,null,null,"helper"]],END:[[new Fe(new To(.01,2),s),null,null,null,"helper"]],DELTA:[[new pr(T(),s),null,null,null,"helper"]],X:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new pr(_,s.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new pr(_,s.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]},O={XYZE:[[new Fe(A(.5,1),M),null,[0,Math.PI/2,0]]],X:[[new Fe(A(.5,.5),o)]],Y:[[new Fe(A(.5,.5),c),null,[0,0,-Math.PI/2]]],Z:[[new Fe(A(.5,.5),u),null,[0,Math.PI/2,0]]],E:[[new Fe(A(.75,1),p),null,[0,Math.PI/2,0]]]},b={AXIS:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]]},C={XYZE:[[new Fe(new qc(.25,10,8),i)]],X:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[0,-Math.PI/2,-Math.PI/2]]],Y:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[Math.PI/2,0,0]]],Z:[[new Fe(new Rs(.5,.1,4,24),i),[0,0,0],[0,0,-Math.PI/2]]],E:[[new Fe(new Rs(.75,.1,2,24),i)]]},z={X:[[new Fe(x,o),[.5,0,0],[0,0,-Math.PI/2]],[new Fe(w,o),[0,0,0],[0,0,-Math.PI/2]],[new Fe(x,o),[-.5,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(x,c),[0,.5,0]],[new Fe(w,c)],[new Fe(x,c),[0,-.5,0],[0,0,Math.PI]]],Z:[[new Fe(x,u),[0,0,.5],[Math.PI/2,0,0]],[new Fe(w,u),[0,0,0],[Math.PI/2,0,0]],[new Fe(x,u),[0,0,-.5],[-Math.PI/2,0,0]]],XY:[[new Fe(new Kt(.15,.15,.01),m),[.15,.15,0]]],YZ:[[new Fe(new Kt(.15,.15,.01),d),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Kt(.15,.15,.01),f),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new Kt(.1,.1,.1),v.clone())]]},K={X:[[new Fe(new xn(.2,0,.6,4),i),[.3,0,0],[0,0,-Math.PI/2]],[new Fe(new xn(.2,0,.6,4),i),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new Fe(new xn(.2,0,.6,4),i),[0,.3,0]],[new Fe(new xn(.2,0,.6,4),i),[0,-.3,0],[0,0,Math.PI]]],Z:[[new Fe(new xn(.2,0,.6,4),i),[0,0,.3],[Math.PI/2,0,0]],[new Fe(new xn(.2,0,.6,4),i),[0,0,-.3],[-Math.PI/2,0,0]]],XY:[[new Fe(new Kt(.2,.2,.01),i),[.15,.15,0]]],YZ:[[new Fe(new Kt(.2,.2,.01),i),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new Fe(new Kt(.2,.2,.01),i),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new Fe(new Kt(.2,.2,.2),i),[0,0,0]]]},B={X:[[new pr(_,s.clone()),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new pr(_,s.clone()),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new pr(_,s.clone()),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]};function j(q){const G=new on;for(const ne in q)for(let H=q[ne].length;H--;){const W=q[ne][H][0].clone(),se=q[ne][H][1],V=q[ne][H][2],Z=q[ne][H][3],be=q[ne][H][4];W.name=ne,W.tag=be,se&&W.position.set(se[0],se[1],se[2]),V&&W.rotation.set(V[0],V[1],V[2]),Z&&W.scale.set(Z[0],Z[1],Z[2]),W.updateMatrix();const re=W.geometry.clone();re.applyMatrix4(W.matrix),W.geometry=re,W.renderOrder=1/0,W.position.set(0,0,0),W.rotation.set(0,0,0),W.scale.set(1,1,1),G.add(W)}return G}this.gizmo={},this.picker={},this.helper={},this.add(this.gizmo.translate=j(U)),this.add(this.gizmo.rotate=j(O)),this.add(this.gizmo.scale=j(z)),this.add(this.picker.translate=j(D)),this.add(this.picker.rotate=j(C)),this.add(this.picker.scale=j(K)),this.add(this.helper.translate=j(N)),this.add(this.helper.rotate=j(b)),this.add(this.helper.scale=j(B)),this.picker.translate.visible=!1,this.picker.rotate.visible=!1,this.picker.scale.visible=!1}updateMatrixWorld(e){const i=(this.mode==="scale"?"local":this.space)==="local"?this.worldQuaternion:Fc;this.gizmo.translate.visible=this.mode==="translate",this.gizmo.rotate.visible=this.mode==="rotate",this.gizmo.scale.visible=this.mode==="scale",this.helper.translate.visible=this.mode==="translate",this.helper.rotate.visible=this.mode==="rotate",this.helper.scale.visible=this.mode==="scale";let s=[];s=s.concat(this.picker[this.mode].children),s=s.concat(this.gizmo[this.mode].children),s=s.concat(this.helper[this.mode].children);for(let o=0;o<s.length;o++){const c=s[o];c.visible=!0,c.rotation.set(0,0,0),c.position.copy(this.worldPosition);let u;if(this.camera.isOrthographicCamera?u=(this.camera.top-this.camera.bottom)/this.camera.zoom:u=this.worldPosition.distanceTo(this.cameraPosition)*Math.min(1.9*Math.tan(Math.PI*this.camera.fov/360)/this.camera.zoom,7),c.scale.set(1,1,1).multiplyScalar(u*this.size/4),c.tag==="helper"){c.visible=!1,c.name==="AXIS"?(c.visible=!!this.axis,this.axis==="X"&&(jt.setFromEuler(Tc.set(0,0,0)),c.quaternion.copy(i).multiply(jt),Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="Y"&&(jt.setFromEuler(Tc.set(0,0,Math.PI/2)),c.quaternion.copy(i).multiply(jt),Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="Z"&&(jt.setFromEuler(Tc.set(0,Math.PI/2,0)),c.quaternion.copy(i).multiply(jt),Math.abs(Ot.copy(Na).applyQuaternion(i).dot(this.eye))>.9&&(c.visible=!1)),this.axis==="XYZE"&&(jt.setFromEuler(Tc.set(0,Math.PI/2,0)),Ot.copy(this.rotationAxis),c.quaternion.setFromRotationMatrix(Xv.lookAt(Wv,Ot,Ts)),c.quaternion.multiply(jt),c.visible=this.dragging),this.axis==="E"&&(c.visible=!1)):c.name==="START"?(c.position.copy(this.worldPositionStart),c.visible=this.dragging):c.name==="END"?(c.position.copy(this.worldPosition),c.visible=this.dragging):c.name==="DELTA"?(c.position.copy(this.worldPositionStart),c.quaternion.copy(this.worldQuaternionStart),Pn.set(1e-10,1e-10,1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1),Pn.applyQuaternion(this.worldQuaternionStart.clone().invert()),c.scale.copy(Pn),c.visible=this.dragging):(c.quaternion.copy(i),this.dragging?c.position.copy(this.worldPositionStart):c.position.copy(this.worldPosition),this.axis&&(c.visible=this.axis.search(c.name)!==-1));continue}c.quaternion.copy(i),this.mode==="translate"||this.mode==="scale"?(c.name==="X"&&Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="Y"&&Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="Z"&&Math.abs(Ot.copy(Na).applyQuaternion(i).dot(this.eye))>.99&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="XY"&&Math.abs(Ot.copy(Na).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="YZ"&&Math.abs(Ot.copy(Da).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1),c.name==="XZ"&&Math.abs(Ot.copy(Ts).applyQuaternion(i).dot(this.eye))<.2&&(c.scale.set(1e-10,1e-10,1e-10),c.visible=!1)):this.mode==="rotate"&&(Ac.copy(i),Ot.copy(this.eye).applyQuaternion(jt.copy(i).invert()),c.name.search("E")!==-1&&c.quaternion.setFromRotationMatrix(Xv.lookAt(this.eye,Wv,Ts)),c.name==="X"&&(jt.setFromAxisAngle(Da,Math.atan2(-Ot.y,Ot.z)),jt.multiplyQuaternions(Ac,jt),c.quaternion.copy(jt)),c.name==="Y"&&(jt.setFromAxisAngle(Ts,Math.atan2(Ot.x,Ot.z)),jt.multiplyQuaternions(Ac,jt),c.quaternion.copy(jt)),c.name==="Z"&&(jt.setFromAxisAngle(Na,Math.atan2(Ot.y,Ot.x)),jt.multiplyQuaternions(Ac,jt),c.quaternion.copy(jt))),c.visible=c.visible&&(c.name.indexOf("X")===-1||this.showX),c.visible=c.visible&&(c.name.indexOf("Y")===-1||this.showY),c.visible=c.visible&&(c.name.indexOf("Z")===-1||this.showZ),c.visible=c.visible&&(c.name.indexOf("E")===-1||this.showX&&this.showY&&this.showZ),c.material._color=c.material._color||c.material.color.clone(),c.material._opacity=c.material._opacity||c.material.opacity,c.material.color.copy(c.material._color),c.material.opacity=c.material._opacity,this.enabled&&this.axis&&(c.name===this.axis||this.axis.split("").some(function(d){return c.name===d}))&&(c.material.color.setHex(16776960),c.material.opacity=1)}super.updateMatrixWorld(e)}}class sR extends Fe{constructor(){super(new zo(1e5,1e5,2,2),new Xc({visible:!1,wireframe:!0,side:Xi,transparent:!0,opacity:.1,toneMapped:!1})),this.isTransformControlsPlane=!0,this.type="TransformControlsPlane"}updateMatrixWorld(e){let t=this.space;switch(this.position.copy(this.worldPosition),this.mode==="scale"&&(t="local"),Cc.copy(Da).applyQuaternion(t==="local"?this.worldQuaternion:Fc),Ra.copy(Ts).applyQuaternion(t==="local"?this.worldQuaternion:Fc),ba.copy(Na).applyQuaternion(t==="local"?this.worldQuaternion:Fc),Ot.copy(Ra),this.mode){case"translate":case"scale":switch(this.axis){case"X":Ot.copy(this.eye).cross(Cc),Gi.copy(Cc).cross(Ot);break;case"Y":Ot.copy(this.eye).cross(Ra),Gi.copy(Ra).cross(Ot);break;case"Z":Ot.copy(this.eye).cross(ba),Gi.copy(ba).cross(Ot);break;case"XY":Gi.copy(ba);break;case"YZ":Gi.copy(Cc);break;case"XZ":Ot.copy(ba),Gi.copy(Ra);break;case"XYZ":case"E":Gi.set(0,0,0);break}break;case"rotate":default:Gi.set(0,0,0)}Gi.length()===0?this.quaternion.copy(this.cameraQuaternion):(jv.lookAt(Pn.set(0,0,0),Gi,Ot),this.quaternion.setFromRotationMatrix(jv)),super.updateMatrixWorld(e)}}class oR{constructor(e,t){Ne(this,"controls");Ne(this,"activeObject",null);Ne(this,"spaceObject",null);this.controls=new KC(e,t),this.controls.setSpace("local")}setMode(e){this.controls.setMode(e)}setSnapGrid(e){this.controls.setTranslationSnap(e>0?e:null),this.controls.setRotationSnap(e>0?Math.PI/12:null),this.controls.setScaleSnap(e>0?e:null)}attachToThreeObject(e,t){this.activeObject=t,this.spaceObject=e,this.controls.attach(e)}detach(){this.activeObject=null,this.spaceObject=null,this.controls.detach()}getAttachedGameObject(){return this.activeObject}addToScene(e){e.add(this.controls)}syncGameObjectFromGizmo(){if(!this.activeObject||!this.spaceObject)return;const e=this.activeObject.transform,t=this.spaceObject;e.localPosition.copy(t.position),e.localRotation.copy(t.rotation),e.localScale.copy(t.scale)}dispose(){this.controls.dispose()}}function aR(){const a=Tt.useRef(null),e=Tt.useRef(null),{engine:t}=Va(),i=en(p=>p.setSelectedId),s=en(p=>p.selectedId),o=en(p=>p.gizmoMode),c=en(p=>p.snapGrid),u=en(p=>p.lightingPreset),d=en(p=>p.isPlaying),f=en(p=>p.bumpScene),m=Tt.useRef(s);m.current=s,Tt.useEffect(()=>{t.setMaterialDirtyNotifier(()=>f())},[t,f]),Tt.useEffect(()=>{t.setLightingPreset(u)},[t,u]),Tt.useEffect(()=>{const p=a.current;if(!p)return;t.mount(p);const y=new oR(t.camera,t.renderer.domElement);y.addToScene(t.scene),e.current=y,t.gizmo=y;const M=A=>{t.setGizmoDragging(!!A.value)};y.controls.addEventListener("dragging-changed",M);const E=()=>{y.syncGameObjectFromGizmo(),f()};y.controls.addEventListener("objectChange",E);const x=t.flyController.attach(p);let _=0;const w=()=>{t.tick(),_=requestAnimationFrame(w)};return _=requestAnimationFrame(w),()=>{cancelAnimationFrame(_),y.controls.removeEventListener("dragging-changed",M),y.controls.removeEventListener("objectChange",E),y.detach(),y.dispose(),t.gizmo=null,e.current=null,x(),p.replaceChildren()}},[t,f]),Tt.useEffect(()=>{const p=y=>{if(y.repeat||y.target.closest("input, textarea, select, [contenteditable='true']"))return;const E=m.current;if(y.key==="Delete"){if(!E)return;const x=t.sceneGraph.getObject(E);x&&(t.sceneGraph.destroy(x),i(null),f()),y.preventDefault()}if((y.ctrlKey||y.metaKey)&&y.key.toLowerCase()==="d"){if(!E)return;const x=t.sceneGraph.getObject(E);if(!x)return;const _=x.parent,w=new Rf(`${x.name} Copy`);w.transform.copyFrom(x.transform),t.sceneGraph.register(w),t.sceneGraph.setParent(w,_),t.sceneGraph.cloneMeshAndScriptFrom(x,w),i(w.id),f(),y.preventDefault()}};return window.addEventListener("keydown",p),()=>window.removeEventListener("keydown",p)},[t,f,i]),Tt.useEffect(()=>{const p=e.current;p&&p.setMode(o)},[o]),Tt.useEffect(()=>{const p=e.current;p&&p.setSnapGrid(c)},[c]),Tt.useEffect(()=>{t.setSelectedId(s);const p=requestAnimationFrame(()=>{const y=e.current;if(!y)return;if(!s||d){y.detach();return}const M=t.sceneGraph.getObject(s),E=t.getObjectGroup(s);M&&E&&y.attachToThreeObject(E,M)});return()=>cancelAnimationFrame(p)},[t,s,d]);const v=p=>{var w;if(p.button!==0)return;const y=p.target;if(!((w=a.current)!=null&&w.contains(y)))return;const M=a.current.getBoundingClientRect(),E=p.clientX-M.left,x=p.clientY-M.top,_=t.pickFromDomEvent(E,x,M.width,M.height);i(_)};return ve.jsx("div",{ref:a,className:"viewport-host",onPointerDown:v,role:"application","aria-label":"3D viewport"})}function lR(){return ve.jsxs("div",{className:"editor-shell",children:[ve.jsx(ZC,{}),ve.jsxs("div",{className:"editor-workspace",children:[ve.jsx(qC,{}),ve.jsx("main",{className:"viewport-pane",children:ve.jsx(aR,{})}),ve.jsx($C,{})]}),ve.jsx(jC,{})]})}function cR(){return ve.jsx(XC,{children:ve.jsx(lR,{})})}Ry.createRoot(document.getElementById("root")).render(ve.jsx(Pa.StrictMode,{children:ve.jsx(cR,{})}));
