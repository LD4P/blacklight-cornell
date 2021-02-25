/*!
 * ﻿HistropediaJS v1.2.0 | Histropedia Ltd. (c) 2020 | https://js.histropedia.com
 * Use of this software is subject to our End User Licence Agreement: https://js.histropedia.com/licence.html
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 242);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(169);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(5);
var getOwnPropertyDescriptor = __webpack_require__(28).f;
var isForced = __webpack_require__(106);
var path = __webpack_require__(2);
var bind = __webpack_require__(70);
var createNonEnumerableProperty = __webpack_require__(13);
var has = __webpack_require__(8);

var wrapConstructor = function (NativeConstructor) {
  var Wrapper = function (a, b, c) {
    if (this instanceof NativeConstructor) {
      switch (arguments.length) {
        case 0: return new NativeConstructor();
        case 1: return new NativeConstructor(a);
        case 2: return new NativeConstructor(a, b);
      } return new NativeConstructor(a, b, c);
    } return NativeConstructor.apply(this, arguments);
  };
  Wrapper.prototype = NativeConstructor.prototype;
  return Wrapper;
};

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var PROTO = options.proto;

  var nativeSource = GLOBAL ? global : STATIC ? global[TARGET] : (global[TARGET] || {}).prototype;

  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
  var targetPrototype = target.prototype;

  var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
  var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

  for (key in source) {
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contains in native
    USE_NATIVE = !FORCED && nativeSource && has(nativeSource, key);

    targetProperty = target[key];

    if (USE_NATIVE) if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(nativeSource, key);
      nativeProperty = descriptor && descriptor.value;
    } else nativeProperty = nativeSource[key];

    // export native or implementation
    sourceProperty = (USE_NATIVE && nativeProperty) ? nativeProperty : source[key];

    if (USE_NATIVE && typeof targetProperty === typeof sourceProperty) continue;

    // bind timers to global for call from export context
    if (options.bind && USE_NATIVE) resultProperty = bind(sourceProperty, global);
    // wrap global constructors for prevent changs in this version
    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
    // make static versions for prototype methods
    else if (PROTO && typeof sourceProperty == 'function') resultProperty = bind(Function.call, sourceProperty);
    // default case
    else resultProperty = sourceProperty;

    // add a flag to not completely full polyfills
    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(resultProperty, 'sham', true);
    }

    target[key] = resultProperty;

    if (PROTO) {
      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
      if (!has(path, VIRTUAL_PROTOTYPE)) {
        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
      }
      // export virtual prototype methods
      path[VIRTUAL_PROTOTYPE][key] = sourceProperty;
      // export real prototype methods
      if (options.real && targetPrototype && !targetPrototype[key]) {
        createNonEnumerableProperty(targetPrototype, key, sourceProperty);
      }
    }
  }
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var has = __webpack_require__(8);
var wrappedWellKnownSymbolModule = __webpack_require__(61);
var defineProperty = __webpack_require__(17).f;

module.exports = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(105)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);

module.exports = function (CONSTRUCTOR) {
  return path[CONSTRUCTOR + 'Prototype'];
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var shared = __webpack_require__(55);
var has = __webpack_require__(8);
var uid = __webpack_require__(56);
var NATIVE_SYMBOL = __webpack_require__(57);
var USE_SYMBOL_AS_UID = __webpack_require__(81);

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL && has(Symbol, name)) WellKnownSymbolsStore[name] = Symbol[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(202);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(48);
var requireObjectCoercible = __webpack_require__(29);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var definePropertyModule = __webpack_require__(17);
var createPropertyDescriptor = __webpack_require__(22);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(29);

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(157);

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(154);

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var IE8_DOM_DEFINE = __webpack_require__(68);
var anObject = __webpack_require__(19);
var toPrimitive = __webpack_require__(30);

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(145);

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(12);

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(33);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var fails = __webpack_require__(4);
var has = __webpack_require__(8);

var defineProperty = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

module.exports = function (METHOD_NAME, options) {
  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has(options, 0) ? options[0] : thrower;
  var argument1 = has(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails(function () {
    if (ACCESSORS && !DESCRIPTORS) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(2);
var global = __webpack_require__(5);

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var TO_STRING_TAG_SUPPORT = __webpack_require__(58);
var defineProperty = __webpack_require__(17).f;
var createNonEnumerableProperty = __webpack_require__(13);
var has = __webpack_require__(8);
var toString = __webpack_require__(122);
var wellKnownSymbol = __webpack_require__(9);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC, SET_METHOD) {
  if (it) {
    var target = STATIC ? it : it.prototype;
    if (!has(target, TO_STRING_TAG)) {
      defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
    }
    if (SET_METHOD && !TO_STRING_TAG_SUPPORT) {
      createNonEnumerableProperty(target, 'toString', toString);
    }
  }
};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(206);

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(215);

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(224);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var propertyIsEnumerableModule = __webpack_require__(47);
var createPropertyDescriptor = __webpack_require__(22);
var toIndexedObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(30);
var has = __webpack_require__(8);
var IE8_DOM_DEFINE = __webpack_require__(68);

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(12);

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(72);
var enumBugKeys = __webpack_require__(51);

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(55);
var uid = __webpack_require__(56);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var bind = __webpack_require__(70);
var IndexedObject = __webpack_require__(48);
var toObject = __webpack_require__(14);
var toLength = __webpack_require__(20);
var arraySpeciesCreate = __webpack_require__(60);

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6)
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(49);

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
module.exports = Array.isArray || function isArray(arg) {
  return classof(arg) == 'Array';
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(4);

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);
var wellKnownSymbol = __webpack_require__(9);
var V8_VERSION = __webpack_require__(84);

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(103);

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(148);

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(210);

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(216);

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);
var classof = __webpack_require__(49);

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),
/* 49 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(33);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),
/* 51 */
/***/ (function(module, exports) {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(72);
var enumBugKeys = __webpack_require__(51);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toPrimitive = __webpack_require__(30);
var definePropertyModule = __webpack_require__(17);
var createPropertyDescriptor = __webpack_require__(22);

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(116);
var global = __webpack_require__(5);
var isObject = __webpack_require__(12);
var createNonEnumerableProperty = __webpack_require__(13);
var objectHas = __webpack_require__(8);
var sharedKey = __webpack_require__(36);
var hiddenKeys = __webpack_require__(34);

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var IS_PURE = __webpack_require__(37);
var store = __webpack_require__(77);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.4',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 56 */
/***/ (function(module, exports) {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(9);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var TO_STRING_TAG_SUPPORT = __webpack_require__(58);
var classofRaw = __webpack_require__(49);
var wellKnownSymbol = __webpack_require__(9);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(12);
var isArray = __webpack_require__(39);
var wellKnownSymbol = __webpack_require__(9);

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(9);

exports.f = wellKnownSymbol;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(29);
var whitespaces = __webpack_require__(42);

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(110);

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(114);

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(130);

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(137);

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(104);
var path = __webpack_require__(2);

var Object = path.Object;

var defineProperty = module.exports = function defineProperty(it, key, desc) {
  return Object.defineProperty(it, key, desc);
};

if (Object.defineProperty.sham) defineProperty.sham = true;


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var fails = __webpack_require__(4);
var createElement = __webpack_require__(69);

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var isObject = __webpack_require__(12);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(31);

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var definePropertyModule = __webpack_require__(17);
var anObject = __webpack_require__(19);
var objectKeys = __webpack_require__(32);

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(8);
var toIndexedObject = __webpack_require__(11);
var indexOf = __webpack_require__(73).indexOf;
var hiddenKeys = __webpack_require__(34);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(11);
var toLength = __webpack_require__(20);
var toAbsoluteIndex = __webpack_require__(50);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),
/* 74 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(115);
var DOMIterables = __webpack_require__(125);
var global = __webpack_require__(5);
var classof = __webpack_require__(59);
var createNonEnumerableProperty = __webpack_require__(13);
var Iterators = __webpack_require__(35);
var wellKnownSymbol = __webpack_require__(9);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype && classof(CollectionPrototype) !== TO_STRING_TAG) {
    createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
  }
  Iterators[COLLECTION_NAME] = Iterators.Array;
}


/***/ }),
/* 76 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var setGlobal = __webpack_require__(118);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var createIteratorConstructor = __webpack_require__(119);
var getPrototypeOf = __webpack_require__(80);
var setPrototypeOf = __webpack_require__(123);
var setToStringTag = __webpack_require__(24);
var createNonEnumerableProperty = __webpack_require__(13);
var redefine = __webpack_require__(83);
var wellKnownSymbol = __webpack_require__(9);
var IS_PURE = __webpack_require__(37);
var Iterators = __webpack_require__(35);
var IteratorsCore = __webpack_require__(79);

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getPrototypeOf = __webpack_require__(80);
var createNonEnumerableProperty = __webpack_require__(13);
var has = __webpack_require__(8);
var wellKnownSymbol = __webpack_require__(9);
var IS_PURE = __webpack_require__(37);

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(8);
var toObject = __webpack_require__(14);
var sharedKey = __webpack_require__(36);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(120);

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_SYMBOL = __webpack_require__(57);

module.exports = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(19);
var defineProperties = __webpack_require__(71);
var enumBugKeys = __webpack_require__(51);
var hiddenKeys = __webpack_require__(34);
var html = __webpack_require__(121);
var documentCreateElement = __webpack_require__(69);
var sharedKey = __webpack_require__(36);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var createNonEnumerableProperty = __webpack_require__(13);

module.exports = function (target, key, value, options) {
  if (options && options.enumerable) target[key] = value;
  else createNonEnumerableProperty(target, key, value);
};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var userAgent = __webpack_require__(85);

var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

module.exports = version && +version;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(23);

module.exports = getBuiltIn('navigator', 'userAgent') || '';


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var global = __webpack_require__(5);
var getBuiltIn = __webpack_require__(23);
var IS_PURE = __webpack_require__(37);
var DESCRIPTORS = __webpack_require__(6);
var NATIVE_SYMBOL = __webpack_require__(57);
var USE_SYMBOL_AS_UID = __webpack_require__(81);
var fails = __webpack_require__(4);
var has = __webpack_require__(8);
var isArray = __webpack_require__(39);
var isObject = __webpack_require__(12);
var anObject = __webpack_require__(19);
var toObject = __webpack_require__(14);
var toIndexedObject = __webpack_require__(11);
var toPrimitive = __webpack_require__(30);
var createPropertyDescriptor = __webpack_require__(22);
var nativeObjectCreate = __webpack_require__(82);
var objectKeys = __webpack_require__(32);
var getOwnPropertyNamesModule = __webpack_require__(52);
var getOwnPropertyNamesExternal = __webpack_require__(139);
var getOwnPropertySymbolsModule = __webpack_require__(74);
var getOwnPropertyDescriptorModule = __webpack_require__(28);
var definePropertyModule = __webpack_require__(17);
var propertyIsEnumerableModule = __webpack_require__(47);
var createNonEnumerableProperty = __webpack_require__(13);
var redefine = __webpack_require__(83);
var shared = __webpack_require__(55);
var sharedKey = __webpack_require__(36);
var hiddenKeys = __webpack_require__(34);
var uid = __webpack_require__(56);
var wellKnownSymbol = __webpack_require__(9);
var wrappedWellKnownSymbolModule = __webpack_require__(61);
var defineWellKnownSymbol = __webpack_require__(3);
var setToStringTag = __webpack_require__(24);
var InternalStateModule = __webpack_require__(54);
var $forEach = __webpack_require__(38).forEach;

var HIDDEN = sharedKey('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(SYMBOL);
var ObjectPrototype = Object[PROTOTYPE];
var $Symbol = global.Symbol;
var $stringify = getBuiltIn('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
var AllSymbols = shared('symbols');
var ObjectPrototypeSymbols = shared('op-symbols');
var StringToSymbolRegistry = shared('string-to-symbol-registry');
var SymbolToStringRegistry = shared('symbol-to-string-registry');
var WellKnownSymbolsStore = shared('wks');
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS && fails(function () {
  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS) symbol.description = description;
  return symbol;
};

var isSymbol = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject(O);
  var key = toPrimitive(P, true);
  anObject(Attributes);
  if (has(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject(O);
  var properties = toIndexedObject(Properties);
  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive(V, true);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject(O);
  var key = toPrimitive(P, true);
  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
  var result = [];
  $forEach(names, function (key) {
    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.github.io/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid(description);
    var setter = function (value) {
      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
    };
    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return getInternalState(this).tag;
  });

  redefine($Symbol, 'withoutSetter', function (description) {
    return wrap(uid(description), description);
  });

  propertyIsEnumerableModule.f = $propertyIsEnumerable;
  definePropertyModule.f = $defineProperty;
  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol(name), name);
  };

  if (DESCRIPTORS) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty($Symbol[PROTOTYPE], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState(this).description;
      }
    });
    if (!IS_PURE) {
      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  // `Symbol.for` method
  // https://tc39.github.io/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.github.io/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
  // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create
  create: $create,
  // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty
  defineProperty: $defineProperty,
  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties
  defineProperties: $defineProperties,
  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$({ target: 'Object', stat: true, forced: fails(function () { getOwnPropertySymbolsModule.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule.f(toObject(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.github.io/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  $({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
  createNonEnumerableProperty($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.github.io/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag($Symbol, SYMBOL);

hiddenKeys[HIDDEN] = true;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var global = __webpack_require__(5);
var userAgent = __webpack_require__(85);

var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check

var wrap = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
$({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap(global.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap(global.setInterval)
});


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var fails = __webpack_require__(4);
var isArray = __webpack_require__(39);
var isObject = __webpack_require__(12);
var toObject = __webpack_require__(14);
var toLength = __webpack_require__(20);
var createProperty = __webpack_require__(53);
var arraySpeciesCreate = __webpack_require__(60);
var arrayMethodHasSpeciesSupport = __webpack_require__(41);
var wellKnownSymbol = __webpack_require__(9);
var V8_VERSION = __webpack_require__(84);

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.iterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.iterator
defineWellKnownSymbol('iterator');


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(107);

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(133);

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(140);

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var _Object$defineProperty = __webpack_require__(143);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    _Object$defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(153);

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(161);

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(165);

/***/ }),
/* 97 */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var _Symbol$iterator = __webpack_require__(173);

var _Symbol = __webpack_require__(178);

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof _Symbol === "function" && typeof _Symbol$iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof _Symbol === "function" && obj.constructor === _Symbol && obj !== _Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(220);

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(229);

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(234);

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(238);

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(67);

module.exports = parent;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var DESCRIPTORS = __webpack_require__(6);
var objectDefinePropertyModile = __webpack_require__(17);

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
$({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperty: objectDefinePropertyModile.f
});


/***/ }),
/* 105 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(108);

module.exports = parent;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(109);
var path = __webpack_require__(2);

var Object = path.Object;

var defineProperties = module.exports = function defineProperties(T, D) {
  return Object.defineProperties(T, D);
};

if (Object.defineProperties.sham) defineProperties.sham = true;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var DESCRIPTORS = __webpack_require__(6);
var defineProperties = __webpack_require__(71);

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
$({ target: 'Object', stat: true, forced: !DESCRIPTORS, sham: !DESCRIPTORS }, {
  defineProperties: defineProperties
});


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(111);

module.exports = parent;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(112);
var path = __webpack_require__(2);

module.exports = path.Object.getOwnPropertyDescriptors;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var DESCRIPTORS = __webpack_require__(6);
var ownKeys = __webpack_require__(113);
var toIndexedObject = __webpack_require__(11);
var getOwnPropertyDescriptorModule = __webpack_require__(28);
var createProperty = __webpack_require__(53);

// `Object.getOwnPropertyDescriptors` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
    var keys = ownKeys(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty(result, key, descriptor);
    }
    return result;
  }
});


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(23);
var getOwnPropertyNamesModule = __webpack_require__(52);
var getOwnPropertySymbolsModule = __webpack_require__(74);
var anObject = __webpack_require__(19);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(75);
var forEach = __webpack_require__(126);
var classof = __webpack_require__(59);
var ArrayPrototype = Array.prototype;

var DOMIterables = {
  DOMTokenList: true,
  NodeList: true
};

module.exports = function (it) {
  var own = it.forEach;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.forEach)
    // eslint-disable-next-line no-prototype-builtins
    || DOMIterables.hasOwnProperty(classof(it)) ? forEach : own;
};


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toIndexedObject = __webpack_require__(11);
var addToUnscopables = __webpack_require__(76);
var Iterators = __webpack_require__(35);
var InternalStateModule = __webpack_require__(54);
var defineIterator = __webpack_require__(78);

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var inspectSource = __webpack_require__(117);

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(77);

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var createNonEnumerableProperty = __webpack_require__(13);

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var IteratorPrototype = __webpack_require__(79).IteratorPrototype;
var create = __webpack_require__(82);
var createPropertyDescriptor = __webpack_require__(22);
var setToStringTag = __webpack_require__(24);
var Iterators = __webpack_require__(35);

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(23);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var TO_STRING_TAG_SUPPORT = __webpack_require__(58);
var classof = __webpack_require__(59);

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
module.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
  return '[object ' + classof(this) + ']';
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(19);
var aPossiblePrototype = __webpack_require__(124);

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(12);

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};


/***/ }),
/* 125 */
/***/ (function(module, exports) {

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(127);

module.exports = parent;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(128);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').forEach;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var forEach = __webpack_require__(129);

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
$({ target: 'Array', proto: true, forced: [].forEach != forEach }, {
  forEach: forEach
});


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $forEach = __webpack_require__(38).forEach;
var arrayMethodIsStrict = __webpack_require__(40);
var arrayMethodUsesToLength = __webpack_require__(21);

var STRICT_METHOD = arrayMethodIsStrict('forEach');
var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = (!STRICT_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(131);

module.exports = parent;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(132);
var path = __webpack_require__(2);

var Object = path.Object;

var getOwnPropertyDescriptor = module.exports = function getOwnPropertyDescriptor(it, key) {
  return Object.getOwnPropertyDescriptor(it, key);
};

if (Object.getOwnPropertyDescriptor.sham) getOwnPropertyDescriptor.sham = true;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var fails = __webpack_require__(4);
var toIndexedObject = __webpack_require__(11);
var nativeGetOwnPropertyDescriptor = __webpack_require__(28).f;
var DESCRIPTORS = __webpack_require__(6);

var FAILS_ON_PRIMITIVES = fails(function () { nativeGetOwnPropertyDescriptor(1); });
var FORCED = !DESCRIPTORS || FAILS_ON_PRIMITIVES;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
$({ target: 'Object', stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
  }
});


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(134);

module.exports = parent;


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

var filter = __webpack_require__(135);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.filter;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.filter) ? filter : own;
};


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(136);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').filter;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var $filter = __webpack_require__(38).filter;
var arrayMethodHasSpeciesSupport = __webpack_require__(41);
var arrayMethodUsesToLength = __webpack_require__(21);

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
// Edge 14- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('filter');

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(138);

module.exports = parent;


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(86);
var path = __webpack_require__(2);

module.exports = path.Object.getOwnPropertySymbols;


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(11);
var nativeGetOwnPropertyNames = __webpack_require__(52).f;

var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames(toIndexedObject(it));
};


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(141);

module.exports = parent;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(142);
var path = __webpack_require__(2);

module.exports = path.Object.keys;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var toObject = __webpack_require__(14);
var nativeKeys = __webpack_require__(32);
var fails = __webpack_require__(4);

var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
  keys: function keys(it) {
    return nativeKeys(toObject(it));
  }
});


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(144);

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(67);

module.exports = parent;


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(146);

module.exports = parent;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(147);
var core = __webpack_require__(2);

if (!core.JSON) core.JSON = { stringify: JSON.stringify };

// eslint-disable-next-line no-unused-vars
module.exports = function stringify(it, replacer, space) {
  return core.JSON.stringify.apply(null, arguments);
};


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var getBuiltIn = __webpack_require__(23);
var fails = __webpack_require__(4);

var $stringify = getBuiltIn('JSON', 'stringify');
var re = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var fix = function (match, offset, string) {
  var prev = string.charAt(offset - 1);
  var next = string.charAt(offset + 1);
  if ((low.test(match) && !hi.test(next)) || (hi.test(match) && !low.test(prev))) {
    return '\\u' + match.charCodeAt(0).toString(16);
  } return match;
};

var FORCED = fails(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

if ($stringify) {
  // https://github.com/tc39/proposal-well-formed-stringify
  $({ target: 'JSON', stat: true, forced: FORCED }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var result = $stringify.apply(null, arguments);
      return typeof result == 'string' ? result.replace(re, fix) : result;
    }
  });
}


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(149);

module.exports = parent;


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

var bind = __webpack_require__(150);

var FunctionPrototype = Function.prototype;

module.exports = function (it) {
  var own = it.bind;
  return it === FunctionPrototype || (it instanceof Function && own === FunctionPrototype.bind) ? bind : own;
};


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(151);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Function').bind;


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var bind = __webpack_require__(152);

// `Function.prototype.bind` method
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
$({ target: 'Function', proto: true }, {
  bind: bind
});


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var aFunction = __webpack_require__(31);
var isObject = __webpack_require__(12);

var slice = [].slice;
var factories = {};

var construct = function (C, argsLength, args) {
  if (!(argsLength in factories)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.github.io/ecma262/#sec-function.prototype.bind
module.exports = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = slice.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(87);
var path = __webpack_require__(2);

module.exports = path.setInterval;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(155);

module.exports = parent;


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

var concat = __webpack_require__(156);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.concat;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.concat) ? concat : own;
};


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(88);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').concat;


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(158);

module.exports = parent;


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

var sort = __webpack_require__(159);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.sort;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.sort) ? sort : own;
};


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(160);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').sort;


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var aFunction = __webpack_require__(31);
var toObject = __webpack_require__(14);
var fails = __webpack_require__(4);
var arrayMethodIsStrict = __webpack_require__(40);

var test = [];
var nativeSort = test.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(162);

module.exports = parent;


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(163);
var path = __webpack_require__(2);

module.exports = path.Object.values;


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var $values = __webpack_require__(164).values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(6);
var objectKeys = __webpack_require__(32);
var toIndexedObject = __webpack_require__(11);
var propertyIsEnumerable = __webpack_require__(47).f;

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod(false)
};


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(166);

module.exports = parent;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(167);
var path = __webpack_require__(2);

module.exports = path.parseFloat;


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var parseFloatImplementation = __webpack_require__(168);

// `parseFloat` method
// https://tc39.github.io/ecma262/#sec-parsefloat-string
$({ global: true, forced: parseFloat != parseFloatImplementation }, {
  parseFloat: parseFloatImplementation
});


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var trim = __webpack_require__(62).trim;
var whitespaces = __webpack_require__(42);

var $parseFloat = global.parseFloat;
var FORCED = 1 / $parseFloat(whitespaces + '-0') !== -Infinity;

// `parseFloat` method
// https://tc39.github.io/ecma262/#sec-parsefloat-string
module.exports = FORCED ? function parseFloat(string) {
  var trimmedString = trim(String(string));
  var result = $parseFloat(trimmedString);
  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
} : $parseFloat;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(170);

module.exports = parent;


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(171);
var path = __webpack_require__(2);

module.exports = path.parseInt;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var parseIntImplementation = __webpack_require__(172);

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
$({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var trim = __webpack_require__(62).trim;
var whitespaces = __webpack_require__(42);

var $parseInt = global.parseInt;
var hex = /^[+-]?0[Xx]/;
var FORCED = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22;

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
module.exports = FORCED ? function parseInt(string, radix) {
  var S = trim(String(string));
  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
} : $parseInt;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(174);

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(175);

module.exports = parent;


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(89);
__webpack_require__(176);
__webpack_require__(75);
var WrappedWellKnownSymbolModule = __webpack_require__(61);

module.exports = WrappedWellKnownSymbolModule.f('iterator');


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(177).charAt;
var InternalStateModule = __webpack_require__(54);
var defineIterator = __webpack_require__(78);

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(33);
var requireObjectCoercible = __webpack_require__(29);

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(179);

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(180);
__webpack_require__(197);
__webpack_require__(198);
__webpack_require__(199);
__webpack_require__(200);
// TODO: Remove from `core-js@4`
__webpack_require__(201);

module.exports = parent;


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(88);
__webpack_require__(181);
__webpack_require__(86);
__webpack_require__(182);
__webpack_require__(183);
__webpack_require__(184);
__webpack_require__(185);
__webpack_require__(89);
__webpack_require__(186);
__webpack_require__(187);
__webpack_require__(188);
__webpack_require__(189);
__webpack_require__(190);
__webpack_require__(191);
__webpack_require__(192);
__webpack_require__(193);
__webpack_require__(194);
__webpack_require__(195);
__webpack_require__(196);
var path = __webpack_require__(2);

module.exports = path.Symbol;


/***/ }),
/* 181 */
/***/ (function(module, exports) {

// empty


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.asyncIterator` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol('asyncIterator');


/***/ }),
/* 183 */
/***/ (function(module, exports) {

// empty


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.hasInstance` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol('hasInstance');


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol('isConcatSpreadable');


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.match` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.match
defineWellKnownSymbol('match');


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.matchAll` well-known symbol
defineWellKnownSymbol('matchAll');


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.replace` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.replace
defineWellKnownSymbol('replace');


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.search` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.search
defineWellKnownSymbol('search');


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.species` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.species
defineWellKnownSymbol('species');


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.split` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.split
defineWellKnownSymbol('split');


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.toPrimitive` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol('toPrimitive');


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.toStringTag` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol('toStringTag');


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.unscopables` well-known symbol
// https://tc39.github.io/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol('unscopables');


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

var setToStringTag = __webpack_require__(24);

// Math[@@toStringTag] property
// https://tc39.github.io/ecma262/#sec-math-@@tostringtag
setToStringTag(Math, 'Math', true);


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(5);
var setToStringTag = __webpack_require__(24);

// JSON[@@toStringTag] property
// https://tc39.github.io/ecma262/#sec-json-@@tostringtag
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol('asyncDispose');


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol('dispose');


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol('observable');


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

var defineWellKnownSymbol = __webpack_require__(3);

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol('patternMatch');


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

// TODO: remove from `core-js@4`
var defineWellKnownSymbol = __webpack_require__(3);

defineWellKnownSymbol('replaceAll');


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(203);

module.exports = parent;


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

var indexOf = __webpack_require__(204);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.indexOf;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.indexOf) ? indexOf : own;
};


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(205);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').indexOf;


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var $indexOf = __webpack_require__(73).indexOf;
var arrayMethodIsStrict = __webpack_require__(40);
var arrayMethodUsesToLength = __webpack_require__(21);

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD = arrayMethodIsStrict('indexOf');
var USES_TO_LENGTH = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
$({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(207);

module.exports = parent;


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

var splice = __webpack_require__(208);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.splice;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.splice) ? splice : own;
};


/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(209);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').splice;


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var toAbsoluteIndex = __webpack_require__(50);
var toInteger = __webpack_require__(33);
var toLength = __webpack_require__(20);
var toObject = __webpack_require__(14);
var arraySpeciesCreate = __webpack_require__(60);
var createProperty = __webpack_require__(53);
var arrayMethodHasSpeciesSupport = __webpack_require__(41);
var arrayMethodUsesToLength = __webpack_require__(21);

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');
var USES_TO_LENGTH = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });

var max = Math.max;
var min = Math.min;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject(this);
    var len = toLength(O.length);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toInteger(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    O.length = len - actualDeleteCount + insertCount;
    return A;
  }
});


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(211);

module.exports = parent;


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

var reduce = __webpack_require__(212);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.reduce;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.reduce) ? reduce : own;
};


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(213);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').reduce;


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var $reduce = __webpack_require__(214).left;
var arrayMethodIsStrict = __webpack_require__(40);
var arrayMethodUsesToLength = __webpack_require__(21);

var STRICT_METHOD = arrayMethodIsStrict('reduce');
var USES_TO_LENGTH = arrayMethodUsesToLength('reduce', { 1: 0 });

// `Array.prototype.reduce` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
$({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(31);
var toObject = __webpack_require__(14);
var IndexedObject = __webpack_require__(48);
var toLength = __webpack_require__(20);

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction(callbackfn);
    var O = toObject(that);
    var self = IndexedObject(O);
    var length = toLength(O.length);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

module.exports = {
  // `Array.prototype.reduce` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};


/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(87);
var path = __webpack_require__(2);

module.exports = path.setTimeout;


/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(217);

module.exports = parent;


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

var map = __webpack_require__(218);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.map;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.map) ? map : own;
};


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(219);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').map;


/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var $map = __webpack_require__(38).map;
var arrayMethodHasSpeciesSupport = __webpack_require__(41);
var arrayMethodUsesToLength = __webpack_require__(21);

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');
// FF49- issue
var USES_TO_LENGTH = arrayMethodUsesToLength('map');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(221);

module.exports = parent;


/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(222);
var path = __webpack_require__(2);

module.exports = path.Date.now;


/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);

// `Date.now` method
// https://tc39.github.io/ecma262/#sec-date.now
$({ target: 'Date', stat: true }, {
  now: function now() {
    return new Date().getTime();
  }
});


/***/ }),
/* 223 */
/***/ (function(module, exports) {

module.exports = "iVBORw0KGgoAAAANSUhEUgAAAIIAAAAnCAYAAADD0pCgAAAdb0lEQVR4nO18eVwUV7b/t6pXaOiGZmlAEVyRSEKiKEREo4CZwS1mUXxMiD5N4kSNDi7EJW6/xJgYmSeJWxLjJDH64nPiBJdoRidqEmRVWWUPi9DQQEMDvVfVeX9UkzhO1jHJ/ObF7+dzP3youvfUqXvOPfcstxq4gzsAwBDRN10fBWA1gGEAbu1QCuAogEsA+J+Vuzv4RcAwDKTfcm+Zg6MxVS2cgmW/vkgAvFRs0ABvyWAABgBlPz+bd/BL4JsUQQVgyPVmp/uad7uHKGSMeNX157H73Tsen6hiAXj8QjzewS+Ab1KEUQAUVS2cu0YFyCTiRSJAJmHonkEyK4A2AFW/HJt38HPjmxQhjBfIra7N4cYC6PchiACZlBGGBUrtALpc7XYRDmAegB4AFwAU/AQ0/10xBEAMRL/sHIDsHzleCmAWgEkAygH8D4CBAKYAGOS6zwGoBVAIIN/1/1eDb8VdggD3Lw1ON4DQ70sKBPipWbtKwfa5iN0uAgFsJKL7eJ63SSSSJIZhNkN0Qn9tCAHw/4goXBAEN4lEEg1gI0SB/RBIAKwgoid4npezLBvLsuwMAApBEHwEQXCDuLkTy7IWlmUfB3AcwC4AVgBgbyHIAggy9PBKk5mXiYrgagIhxFdiBdCH298WZADSOI67OzU11S86OnpYR0eHP4DRt0n33xESAM86nc6o1NTUkKSkpAEAQgEM/RE0dADuzcrK8g0LCxuckZGhAxCYl5c36Le//e0wX1/fMK1WO8LPzy9sypQpI44dOxZgt9tTASyGyxjcqgihALyuNzmUAkcMCaICkEDgeQHDA2VWAGYAFbf37rgXQOzhw4dVhw4d0o4ZM8bs7u5OAJpu6ScHEAwgAoDPj6Af6hrjfpt8/hKIBxCzf/9+90OHDmk1Gg0PoBeAFkAY/lFG3wQfAD41NTVMe3u7lGEYoaKiQp6SkjIoNzfX/b777jOPHz++b8yYMeaioiK3JUuWDMjNzXWDqGxK4B+3hqEAvGpa7W48Cf2BAkCirzAiSGaFuJ833saLKwE8YzKZPHbu3Omv1Wq59PT0TpVKVQ8g76Z+MgBPAkiEKNhsAC8AaPke+vEAVgEIAPAxgD8CaL8Nfn9OeAKYZzAY/Pft26dVqVT85s2b9QBMAGYASAXwXwCOARC+gw5BNPtgXfF+YWGhqqamRvH888+3bt26tc7VR3rkyBE/vV4vHzJkCANRjjbgH7UtDIBPXatDyfM8BEGAIAjgeB5aD9ah9ZDYAdTh9hJJU4jonnfffVdTXFzsvnz58rbQ0FAewFv42iKwAH4H4MmPPvooKiMjw18QhEQAj3wP7XsAPFdRUTF0586dOqPR+DhEB4r5nnH/CrAAkgCM2b59u2dZWZn7ihUrWu+6666e7u7ugA0bNkTl5OT4A1gK0Tr8cMIsi4EDBzoAoLS01P2jjz7yu3Dhgm9TU5PbvHnz9GlpaS0DBw5sBnAeLofxVosw0GQR3DtMTpkgEBhXUpHjCYP9pRaphLHj9pJIPgBS2traFFu3bg2Mjo7uW7FiRZ9EIsl2MdWPYQDmnDt3TrtgwQJ/s9ksmT9/fpNWqx3wHbRDAaw1m81BKSkpQU6nk1m8eLEBosZ/Y/r0XwwVgIfz8/NVb7/9ts+oUaMsK1eubLdYLLJ169bp9u7d6y+VSp0xMTHeAHwBdHwDjQAArbjFWjidTiY6Orrntddea0pLSws+efKk2t/fn/Pz8+NGjhxpS05ONs6aNcsAYCJEedputgi+APyrmm0yi4NjCQIEEpvDyWNIgMwilzEO3J4iTAEwIiMjw7erq0uyZMkSo1qtbgGwD6IT2o9hAAa+8cYbnl1dXbLp06f3qtVqI8T09jdBAuBpAPcuXbrUv7y83G3jxo0tKpXKBOA3AO67DZ5/DjAAkgGMeOedd1Qmk0m6adMmvbe3t6OpqUmxd+9enaenJxcbG2sDUAmg+ZbxvgA2A/gTxG3QBwDHMKLh4ziOUSqVtHTp0rbKysrS/Pz88tTU1I6hQ4da8/Ly3J944omQkydPBkLcftTA31uEAQAC61rtcpudZyEA5DKoHMcjLEhhZQA7gJJ/8uW1AGa2tbWp33rrLZ/Y2FhzSkpKH8SY+dotfc0AnN7e3hQXF9eXmZnZKpVKawEUA/CGKHge4mq3A3gAwISDBw96HD58WJuSkmKMjY3ta21tZTw8PO718PBIBzDf1f+7IIO4b7MQwyqz6zoD4CEA0wDUQwxxbyfM1QGYc/nyZff9+/f7TZ482RQfH2+BuLqHBwcHO9asWdMeHx9vAnAZol8lh7hYWABbLRZL/IULFxQPPvign0QimQFA3tnZSQ6Hg9FoNBwRsT09PZLBgwfbAfCRkZFmAHTu3DnvxMTE4efPn3ebNm2aP8MwwwEYblWEgHqDXW518IxMyoIhgOcBjUrCe3tKnABqAATh6z2XcTH3Q5yxiQCGv/LKK942m41dtWpVB8uyRoihqBsAy019JQDq9u/fb4Fo9owQcxfzANwPwMv13ELX+KTW1lbtjh07fB0OB3vw4EHfgwcP+gLApk2bWjZv3hzmev4VFz0/iNtFA0RFAsSEzuMAfuua+BIAr7j+xgNIq6ur8yeiiUOHDp0E4EWXkPrHw0VX66LdBtHpuxmBLt4TnU6nT2Zmpg/HceyqVas6tFqtHkBtWFiYsrGxsQui0n4JMfo57Rp/AaICeu/du9d7w4YNfitXrlTMnj3bWFNT4/bee+/5cByHsWPHWs6dO6d5/PHHQ2fMmNE9d+7cLq1WyzmdTmbfvn1+ABAQEMAxDOOEGKH8nUUIcXKk0RvtMp4TIGMIBMDpJAwPUFo93SROl4DeuEVgLQDeB3AW3w5vADObm5t9jx49qhk3blzfjBkz2iEqQBqAaIjJjRsQV94zEItaBohmkQBMLywsVNTX17M2m41RKpWeMTExiRzH/ba+vp5/9dVXAyoqKhSPPvpol1KpFIhEezZp0qQ+l7DWQ3R0HRDzFQLEqGIPgOEA1guCMPTkyZNsb2+vJCEhYZxOp1sGMbHzmMFgCEhKShrwwAMP9O7bt08NYDtEb/6PLuHOhqhs4S5+C1z3qiH6A49AdFyHAkBDQwN76tQpzdSpU01RUVEWAHrXvWaIdZxSADFtbW1Dzp8/L5dKpRQXF/doYGCgLwD38PBwR1RUlPnFF18MePHFFwMAQKfT8evXr9dHRUUJJ06ckIaGhtoOHTrk+9Zbb/n2C0IqleKxxx7rmjNnjhOiJa69WRHcAITUG+wSY49TyoAgCKJ/5XAKCPaXW33VUntBdd/k1i6nWIZiAAcnMEMClMMjB6tGQdy33v8WRRgPIHLXrl0eN27ckGVlZdUAYHbt2uXH8zz7xBNPzPHx8WmEuPrW5OXl6XJzc0elpKR0a7VamclkCn355Ze1Bw4c8DEYDPJ+ogsXLmyz2+3ssWPHfGw2G5uenq7fvn17q2sibRCtBnP27FltcXGxx+rVq70MBoPi9ddf12g0Gv7JJ59MUavVegCP3rhxI3jNmjU+R44c8QGAzZs3GzZt2hQA4D8BROzatcuzra1N5ubmJjz//PPBUVFRjlmzZqVCzKlMAjDz4sWLskuXLimVSqWwYMGC3/j6+rYAyHQpU0J2drbmzJkzCiLC9evXFVarVbJo0aIOf39/syAIo998803vkSNH8pMmTaoFMP7ixYsj0tPT/XJzcz0AYNmyZe2ZmZkjAFxJSkrSjBo1KvjSpUuylpYWlmEYJjIy0v7ggw/aARTPmjUrdMKECcL58+eNjY2NEiJiGIZBcHAwn5iYSFqtthKibyZuf67M4UAi+uCTK103Zmwq5xPXltKDG8rowQ1lFP2HIjqZZ2y40WEv+o9XKu1T1pZSwrpSmvJcCSWsKxHyqnor6/TWKiLKI6IJX2Uiv24qIsqsra2tGzZsmDUhIaE7Ly+vLDk5uQMAaTQaR1lZWQURPU9EJ/V6fdmgQYNssbGxpt7e3kKj0Vg8e/ZsIwDSarWOnTt3Nr300ktNSqWSnzVrljErK6vKz8/PodPp7HV1dSVEdIiI4oloHRGVZGdnl/n7+9tHjx7de/Xq1ZKYmJheALRixQo9z/P5RHTKZDKVjB49us/d3Z1LS0vT+/v7O2bOnNlNRH8losO5ubl1Op3O7uHhwSuVSh4AhYeHW+rr68uJ6CwRFaxfv77F29vb4bIGdOnSpUoi+oiInnM6nRUZGRlNAQEB9v77AGjy5Mmm7u7uAiLK2bFjRyMAOnr0aBUR5V2+fLnKz8/PMXLkSMvbb7/9ZUREhHnu3LlGIiohoklEdB8R7XTxWOG6foaIlhNRsEsWLxDRade9ciIqJqIsItruGv9VLalfWPcQUd7bn+hb41Zdo4S1xZS4rpji1xZR4rpiIbvcVPXS0aaOiWuKKWFtCcWvK6H7/3CNDn7S1vJ5aXfV0t3VfX1WrpKI9rkEf7MiTCCiwt27dzcAoCVLlrQOGjToqwlZu3Zti91uv0pEmXa7veDpp582yGQy/uOPP64kopwtW7Y0AaDk5OSO+vr6q0SUc/r06UqVSsUdPny4prS0tMzNzY1fvnx5K8/z14hohuu5L9XX11eOGzeuNyAgwL5t27aGoKAgOwDKyMhodDgcuX/6059qCwoKKqdOndrt5ubGnz59urKlpeVacHCwffny5XoiyuV5/vL8+fM7ANDYsWN7z5w5UxUZGdnn4+PjyM7OLieiwtWrV+sB0O9+97v25557Th8QEGCvqKgoI6I/EVH28ePHa1iWFUaOHGm5ePFixcKFCw1SqVTIzMysJ6Ls7Ozscl9fX8f06dONDocjv7a2tigsLMwSHh5uqaysLCGi/NDQUOv8+fM7XcKMdb2jBxENIqJwIgpzKQB709y7uRZ5GBGNdP0dQETKm2V0syJME4iqth6u74xZcYUS1hZRwtoimrj6Kj2VWdm3O6u5ZfbWMufk54oocV0xxa68Rn/YX2OqaraWLt1d1Tdp1VU6eqmtmYg+J6IpNz1EQkQvNDU1VcbExPQAIJVKxcXGxpoCAwPt0dHRve3t7Vd5ns8XBCHnypUrpS5laSOiHCLKTUxM7Pby8uKuXLlSeuPGjWsvv/xyw6BBg2xpaWl6k8l0ZdasWUapVMp/+umnNUT0ARE9QETLBUEofP311xsYhqG5c+d2BAcH2wDQhAkTeo8fP141adKk7vDwcPPixYtbAdC2bdsaieiLfsX785//XE1EuadPn64GQFOmTOluaWm5JghCQXh4uHnkyJEWvV5/bevWrU0sywpbt269UVFRUTJ16tSuXbt2Nbgs5BdffvlliZeXlzMyMrKvvLy8mIhyoqOjewcOHGjv6Oi4wvN8TmpqaodUKuWvX79eQkT5y5YtawNAp06dqiaiyxs3brzh7u7Ov//++01E9AkR3fUNlvefbv2KICGi5a1d9prFuyr7xq8opPj0qxSffpVilhfSC4e/7Hj5aKNh0pprFP9cEU1afZWmbSzmcitMlW993NwSt7KQ4tIK6ck/XjdbHXwVEb1KRArXQ/yI6MRf/vKXOojOGS1cuNCwffv2Rnd3d/7EiROVPM/nbNmypamhoaH4kUce6dDpdI78/PySvr6+gurq6uJnn31WHxQU5Pjss8/KZ8yYYYyLi+t98803bxBRQW1tbbFUKhUSExO7Ozs7rxLR+0SUbTKZrjU2NhaHhYVZ1Gq108vLy7lmzZrmoKCg/uQSRUVF9Z09e7YyNDTUNnnyZBMR5X766afXAwMD7YGBgXa73V5otVoL4+Pju93d3bnS0tJSIsotLS0tBUDr169vycnJKfPy8uImTpxo+uyzz64nJSUZN2zY0ExEue3t7Vf37NlT//DDD3d6enpy586dqyCi7HfeeadGJpMJ8+fPNxDR5fPnz1colUr+mWeeaSWi/H76ycnJHVartcBqteaHhITYYmNje4mojMQtVP5TK4IUYmFmZEunXdLSZZOzLEEgMVElCALU7hKuzyZI7TYnJEoJeF7AI+N1bXIpIxzPbvcDESQSBnWtNuXHeZ1us2P97gcQBeALANPtdnvI8ePHPQAwSUlJ3WvWrGlLSEgYnpSUZJo+fXrngQMHAt944w3fESNG2M6ePeu1YMGCjvvuu69v2bJlQxobG6Xp6emGI0eO+Hz88cearKysSohevx7AoBMnTvhxHMfMmDGjR6vVmgAMO3TokH9ZWZk8IiLCXllZ6QYAmzZtat68eXNXSEiIcOHCBVVwcLD9xRdfbM7MzPRvbGxU7NixowkAZWVleev1evm2bdtuyOVy/q9//avm/Pnzmi1btjSPGjXKAoBZv359kFKpFCZOnNjz4Ycfaru7uyU6nc752muv+c6ePdu0aNGi1s7OTvm0adOGKZVKIT8/3yM5OdkYHx/fbbPZpEeOHPF1Op3MnDlzumw2m/S9997zYVmWVq1a1Q6ADh48qJVKpTRv3jyjUqm079mzJ+jGjRvyBQsWmFzvfcY1Bz8tiEhHRBfPFHTURz+bSxNX5tOkVfk0cWU+TV5dIOz8c31r2v4q0/0r8ikuLZ/m7ywz95idV77UW67PeaHIdv/yPJq8uoCil+XS0tcrekxmZw2JToo/ER1qaGgo0Wg0Th8fH0ddXV1Renp6s0KhEHJzc8saGxuv+fj4OHbs2NGYkpLSrtFouOrq6qLCwsJylmWFnTt3NhJR7r59++p9fX2d2dnZNUT0IRE9y3Hc32bOnNmt1Wqdly5dKiei3Orq6mKdTudIT09vjoyM7ANAKSkp7VartZiI/puIviCiaiK6QkS5MTExvaGhoTabzVbgcDjy5s+f367Vah2NjY1FRJQ/fvz4nnvuucfc1tZ2hYhyPvnkkwqJRCIkJyd3lJWVFYeEhFjDw8MtBw8erDOZTIVE9IXBYLjywAMP9ISGhtoyMzPr1Wo1d/DgwVoiyv7oo4+q3NzceJVKxdtstoLS0tIyuVzOP/nkkwabzZbvdDoLhwwZYo2Li+tpb28vMBqNBaNHjzZ7enrytbW1VUS0l4jUP6U16LcILMQEkW9Dm1VutfNgXGcPOE6An1rmkADUaLAoGBIgl0JYPG2g3tNdag4NcGuMu9urBxDACwLkUgZFdSaP7LJuKYDJAGbyPB965MgRb5PJJF2yZIlh8ODB9tOnT3sFBQU5hw8fbn/44YeHRUZGWmfOnNmdm5vrOX78+N5hw4ZZOjo6JIIgMIGBgU4AmD9/fifHcbR7925vAP4AojiOU5SXlysHDBjgjIyMtFmtVsnixYtDIiIiLLGxsX3FxcWqu+66y/rqq68alEplDYBNAP4AYA2A0srKSm19fb1i4sSJPQqFgqusrHQ/evSo94YNG/TBwcH2s2fPqnNycjwWLVrU7u/vby0tLVUtWbIkRK1W89u3b28GwNhsNpZlWaSmphrVarXz2LFjfjNmzBhRW1srz8rKqmloaJArFAphwoQJfV1dXfKdO3cGWK1W1tvbm5PL5XT8+HGN0+lk586d26VQKPi2tjZpXV2dctSoUVZfX1/L0aNHfYuKity0Wi0/ZMgQB8QcQ89Pbg1cihDeZ+NR22J2k0oAwaUlHCfAz0vmUMhZoaXDJheIMOt+v47oMHU7gIsAaqaN9esN8lY4nRwPhiGYrRzz1yudmu4+zhvAeKvVKj1w4IB28ODBttTUVGN3d7e0o6ND2tLSIouJiQnneR4ffPBBbU5OjqqhoUE2b948IwBWp9NxAwYMcLzyyiu6vr4+WXV1tdxqtUra29slDodDDTFPwNhsNlYqlVJvby+7ZcuWoKKiIuWuXbtunDlzRkNEWLp0aUdAQEAPxMROJcQy93EALUajUcnzPIiIMRgMijlz5gyeOnVq75IlS9oBYNu2bYFqtZqPi4vrLS8v95w3b96Q6upqZWZmZlNISIiDiBi1Ws2XlZW5RUREjBozZszdTzzxxBB/f3/nZ599Vn333Xeb+/r6JAzDoK2tTbpu3bpgg8EgHTNmjJllWTQ0NMiPHTvmPXbs2L57773XAkBis9kYAFAoFFRSUuKVkZHhr9PpnBKJRLDZbBzErOfsn0MRQEQvfdlquf7Qpiu2+37/BcUsu0zRyy7TvU9/QSv3X+/ed7KxZcT8i5T6SpG5q89RTkRHSQw/ZhBR4fYjtR3jlmRT9LLLNHZJNo155gs6f7WzlohyPv/883IAlJ6e3kpEf+M4LnvBggWdGo2Ge/TRR7v0en0JEV1+7LHHjCzLCi7zepHjuIIVK1a0AqD+2F0ikfCZmZnNgiCcIqLddrs9Z/z48V9FIjqdzn769OkqnucLVSoVN3r06D6j0VhJRK+QGEb1m0IZEb1QUVFR3x/Genl5cREREZaqqqoiIsrJysqqksvlvEKh4D09PTk3NzdeJpMJBw4caCCibCI6xHFcwYcffvhlSEiITaFQ8BEREZbMzMwbFoulhIjeJaJP9u3b18gwDMlkMkEul/OnTp2q3r17d4NMJuOjoqJ6ITqdeiL6lIg+7e7uvqLRaDiWZUmj0XArV67UP/744wYANG7cuJ6cnJxmIvov+scQ/SdxFkNtdoEVSGAG+MidEpYBEcCAgc5LYTNbOXagn9KxbGaI3kslM0JMMdsgZgHrHo7Taa/V9ajMNk7CMgwsNgH5FV0esRHa3i5jp2L8+PF9jzzyCA+gXCKRyN9++23VgQMH2hmGMQGw8zzv3t3dLZk3b16XSqUiAJ9IJJKQjRs3aohIcubMGQ+JREJpaWnGhQsXdrtWdYFcLg/LyMhof/rpp6VSqZR2797dGh0d3WU2m5WRkZG2Z555ptfb29sA4Ahc5/JccALIDwsLm/773//e7b333lNHRkba0tPTDcOHDzcBYPfs2eOv0Wj4F154oXnXrl0BWq2W27RpU3tCQkI3xFT6HyUSybzZs2cvfuihh2wAJAzDmF3PuQbRAj21aNGikNzcXOPly5fdV61a1ZGUlNRtNBoVf/vb39QlJSXKwYMH2yZPnsxBNPnFarX6kW3btulff/1134SEhN7Nmzd35eTkyK9du6YSBIE1m81SiOlsJb4uiP0kYIjoPy12fm1Tu00hZZmv6vYsA3i6SwW7U2CIwAT5KE0si30Qc/P9mAlgfZPBGujgSADAEEBSFswAXzejTMpwLsbbALwEsUA0GWJuvxhAJ4Cn8vLy7r/nnnt6lUrl5xBrAhqIe3kExDIpA7Hw9AmADIgnqFMglp778+itEIsziRCPt3VDrAXswT9WHX0ApEMsi6tdfOgBeBYWFgYnJCQMTU5O7ty7d28zxEkniDWVEwAOQCyQSQFMhZheVkCsY1wDkAuxtjEcol8yCmIK3wixtjECwL1Op1NRVFTkHhUVZXC90/8A2ACxNOwOsWB1HWIxMMTFQzvEtPC73ybQfwYMw4AhIhmA3wMYjJuON7se3AexNKsAUARxYu230PkNROFKXGMYF50iV98BEI+ZfduJ3N8AmANxovfi69q7L4AJEIUKiJPy2S3PfwDixAKiEK64xgxz9S/4Bn77oYV4fHwIxCpfKIB5Tz311Mg333xTW1xcXHX33XeXQQzXBABXXfR/DEIgFtR8IfooF128jYN4GkwHUTn+7OqvhLi4dBDn4zzExRAFseyeDyDnR/LwvWAYBjfvFUoSE0H97eakheR79hnJTeOU9Pdpzh/S1P/EmJ+6ZVZVVdUFBQXZExISTERUSETP/IzPY+lnCAX/mQb8fRn6uw5tfN8ZRf4H9Pku/Cwh0Y/AFACxp0+flrW0tMg/+OCDeoh1+u8qrd8uBPzr3/sr/JCj0v/XIQUwubGx0ePAgQPayMhIc0REhB3Ap/hpPuT5t8AdRRD376irV69KS0pK3BcsWGD08vKyQPQNfjW4owhAvNVqDXr33Xe9XDUEK0RH94d+bvZ/AncUAYhubm6Wnjlzxuuhhx7qGj58uAAxyvlV/QjIHUUAtCaTSWqxWDB79uxeDw8PPcTK6f+P30L8bPi2X0z5NaEqLCzs3ry8vOqRI0cqIMb69f9inn5xfNtvKP2aoIX4kYgvxARUFsQs5a8G/R/G3MEd4H8BJC54RF3W494AAAAASUVORK5CYII="

/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(225);

module.exports = parent;


/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

var fill = __webpack_require__(226);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.fill;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.fill) ? fill : own;
};


/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(227);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').fill;


/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var fill = __webpack_require__(228);
var addToUnscopables = __webpack_require__(76);

// `Array.prototype.fill` method
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
$({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('fill');


/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toObject = __webpack_require__(14);
var toAbsoluteIndex = __webpack_require__(50);
var toLength = __webpack_require__(20);

// `Array.prototype.fill` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};


/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(230);

module.exports = parent;


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(231);

var StringPrototype = String.prototype;

module.exports = function (it) {
  var own = it.trim;
  return typeof it === 'string' || it === StringPrototype
    || (it instanceof String && own === StringPrototype.trim) ? trim : own;
};


/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(232);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('String').trim;


/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var $trim = __webpack_require__(62).trim;
var forcedStringTrimMethod = __webpack_require__(233);

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});


/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(4);
var whitespaces = __webpack_require__(42);

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};


/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(235);

module.exports = parent;


/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

var reverse = __webpack_require__(236);

var ArrayPrototype = Array.prototype;

module.exports = function (it) {
  var own = it.reverse;
  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.reverse) ? reverse : own;
};


/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(237);
var entryVirtual = __webpack_require__(7);

module.exports = entryVirtual('Array').reverse;


/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(1);
var isArray = __webpack_require__(39);

var nativeReverse = [].reverse;
var test = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.github.io/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

var parent = __webpack_require__(239);

module.exports = parent;


/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(240);
var path = __webpack_require__(2);

module.exports = path.Math.sign;


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

var $ = __webpack_require__(1);
var sign = __webpack_require__(241);

// `Math.sign` method
// https://tc39.github.io/ecma262/#sec-math.sign
$({ target: 'Math', stat: true }, {
  sign: sign
});


/***/ }),
/* 241 */
/***/ (function(module, exports) {

// `Math.sign` method implementation
// https://tc39.github.io/ecma262/#sec-math.sign
module.exports = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};


/***/ }),
/* 242 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Histropedia", function() { return /* binding */ Histropedia; });

// NAMESPACE OBJECT: ./js/constants.js
var constants_namespaceObject = {};
__webpack_require__.r(constants_namespaceObject);
__webpack_require__.d(constants_namespaceObject, "MINOR_MARKER", function() { return MINOR_MARKER; });
__webpack_require__.d(constants_namespaceObject, "MAJOR_MARKER", function() { return MAJOR_MARKER; });
__webpack_require__.d(constants_namespaceObject, "ERA_MARKER", function() { return ERA_MARKER; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_DAY", function() { return ZOOM_DAY; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_MONTH", function() { return ZOOM_MONTH; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_YEAR", function() { return ZOOM_YEAR; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_DECADE", function() { return ZOOM_DECADE; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_CENTURY", function() { return ZOOM_CENTURY; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_MILLENNIUM", function() { return ZOOM_MILLENNIUM; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_10_THOUSAND_YEARS", function() { return ZOOM_10_THOUSAND_YEARS; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_100_THOUSAND_YEARS", function() { return ZOOM_100_THOUSAND_YEARS; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_MILLION_YEARS", function() { return ZOOM_MILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_10_MILLION_YEARS", function() { return ZOOM_10_MILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_100_MILLION_YEARS", function() { return ZOOM_100_MILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "ZOOM_BILLION_YEARS", function() { return ZOOM_BILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_DAY", function() { return PRECISION_DAY; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_MONTH", function() { return PRECISION_MONTH; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_YEAR", function() { return PRECISION_YEAR; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_DECADE", function() { return PRECISION_DECADE; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_CENTURY", function() { return PRECISION_CENTURY; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_MILLENNIUM", function() { return PRECISION_MILLENNIUM; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_MILLION_YEARS", function() { return PRECISION_MILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "PRECISION_BILLION_YEARS", function() { return PRECISION_BILLION_YEARS; });
__webpack_require__.d(constants_namespaceObject, "YEAR_PREFIXES", function() { return YEAR_PREFIXES; });
__webpack_require__.d(constants_namespaceObject, "DENSITY_LOW", function() { return DENSITY_LOW; });
__webpack_require__.d(constants_namespaceObject, "DENSITY_MEDIUM", function() { return DENSITY_MEDIUM; });
__webpack_require__.d(constants_namespaceObject, "DENSITY_HIGH", function() { return DENSITY_HIGH; });
__webpack_require__.d(constants_namespaceObject, "DENSITY_ALL", function() { return DENSITY_ALL; });
__webpack_require__.d(constants_namespaceObject, "RANGE_ALL", function() { return RANGE_ALL; });
__webpack_require__.d(constants_namespaceObject, "RANGE_SCREEN", function() { return RANGE_SCREEN; });
__webpack_require__.d(constants_namespaceObject, "DENSITY_SETTINGS", function() { return DENSITY_SETTINGS; });

// NAMESPACE OBJECT: ./js/Article.sorters.js
var Article_sorters_namespaceObject = {};
__webpack_require__.r(Article_sorters_namespaceObject);
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_DURATION_SORTER", function() { return ARTICLE_DURATION_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_DURATION_YEARS_SORTER", function() { return ARTICLE_DURATION_YEARS_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_IMAGE_QUEUE_SORTER", function() { return ARTICLE_IMAGE_QUEUE_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_FROM_SORTER", function() { return ARTICLE_FROM_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_TO_SORTER", function() { return ARTICLE_TO_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_TOP_SORTER", function() { return ARTICLE_TOP_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_ROW_SORTER", function() { return ARTICLE_ROW_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_RANK_SORTER", function() { return ARTICLE_RANK_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_EFFECTIVE_RANK_SORTER", function() { return ARTICLE_EFFECTIVE_RANK_SORTER; });
__webpack_require__.d(Article_sorters_namespaceObject, "ARTICLE_POSITION_SORTER", function() { return ARTICLE_POSITION_SORTER; });

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/define-property.js
var define_property = __webpack_require__(43);
var define_property_default = /*#__PURE__*/__webpack_require__.n(define_property);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/define-properties.js
var define_properties = __webpack_require__(90);
var define_properties_default = /*#__PURE__*/__webpack_require__.n(define_properties);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptors.js
var get_own_property_descriptors = __webpack_require__(63);
var get_own_property_descriptors_default = /*#__PURE__*/__webpack_require__.n(get_own_property_descriptors);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/for-each.js
var for_each = __webpack_require__(64);
var for_each_default = /*#__PURE__*/__webpack_require__.n(for_each);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/get-own-property-descriptor.js
var get_own_property_descriptor = __webpack_require__(65);
var get_own_property_descriptor_default = /*#__PURE__*/__webpack_require__.n(get_own_property_descriptor);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/filter.js
var filter = __webpack_require__(91);
var filter_default = /*#__PURE__*/__webpack_require__.n(filter);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/get-own-property-symbols.js
var get_own_property_symbols = __webpack_require__(66);
var get_own_property_symbols_default = /*#__PURE__*/__webpack_require__.n(get_own_property_symbols);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/keys.js
var object_keys = __webpack_require__(92);
var keys_default = /*#__PURE__*/__webpack_require__.n(object_keys);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/helpers/defineProperty.js
var defineProperty = __webpack_require__(93);
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/json/stringify.js
var stringify = __webpack_require__(18);
var stringify_default = /*#__PURE__*/__webpack_require__.n(stringify);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/bind.js
var bind = __webpack_require__(44);
var bind_default = /*#__PURE__*/__webpack_require__.n(bind);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/set-interval.js
var set_interval = __webpack_require__(94);
var set_interval_default = /*#__PURE__*/__webpack_require__.n(set_interval);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/concat.js
var concat = __webpack_require__(16);
var concat_default = /*#__PURE__*/__webpack_require__.n(concat);

// CONCATENATED MODULE: ./js/constants.js
// timeline marker types
var MINOR_MARKER = 0;
var MAJOR_MARKER = 1;
var ERA_MARKER = 2; // zoom levels

var ZOOM_DAY = 0;
var ZOOM_MONTH = 1;
var ZOOM_YEAR = 2;
var ZOOM_DECADE = 3;
var ZOOM_CENTURY = 4;
var ZOOM_MILLENNIUM = 5;
var ZOOM_10_THOUSAND_YEARS = 6;
var ZOOM_100_THOUSAND_YEARS = 7;
var ZOOM_MILLION_YEARS = 8;
var ZOOM_10_MILLION_YEARS = 9;
var ZOOM_100_MILLION_YEARS = 10;
var ZOOM_BILLION_YEARS = 11; // precision levels

var PRECISION_DAY = 11;
var PRECISION_MONTH = 10;
var PRECISION_YEAR = 9;
var PRECISION_DECADE = 8;
var PRECISION_CENTURY = 7;
var PRECISION_MILLENNIUM = 6;
var PRECISION_MILLION_YEARS = 3;
var PRECISION_BILLION_YEARS = 1; // year multiple prefixes

var YEAR_PREFIXES = {
  //uses power of ten of prefix as key to access it's settings
  3: {
    label: " ka",
    value: 1000
  },
  6: {
    label: " Ma",
    value: 1000000
  },
  9: {
    label: " Ga",
    value: 1000000000
  }
}; // density

var DENSITY_LOW = 1;
var DENSITY_MEDIUM = 2;
var DENSITY_HIGH = 3;
var DENSITY_ALL = 0; // auto stacking range

var RANGE_ALL = 0;
var RANGE_SCREEN = 1; //todo: decide if these should be configurable

var DENSITY_SETTINGS = [{
  "region": 1,
  "zoom": {
    "from": 0,
    "to": 3.11
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 1
  }
}, {
  "region": 2,
  "zoom": {
    "from": 3.11,
    "to": 6.22
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 2
  }
}, {
  "region": 3,
  "zoom": {
    "from": 6.22,
    "to": 9.33
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 4
  }
}, {
  "region": 4,
  "zoom": {
    "from": 9.33,
    "to": 12.44
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 8
  }
}, {
  "region": 5,
  "zoom": {
    "from": 12.44,
    "to": 15.549999999999999
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 16
  }
}, {
  "region": 6,
  "zoom": {
    "from": 15.549999999999999,
    "to": 18.66
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 32
  }
}, {
  "region": 7,
  "zoom": {
    "from": 18.66,
    "to": 21.77
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 64
  }
}, {
  "region": 8,
  "zoom": {
    "from": 21.77,
    "to": 24.88
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 128
  }
}, {
  "region": 9,
  "zoom": {
    "from": 24.88,
    "to": 27.99
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 256
  }
}, {
  "region": 10,
  "zoom": {
    "from": 27.99,
    "to": 31.099999999999998
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 512
  }
}, {
  "region": 11,
  "zoom": {
    "from": 31.099999999999998,
    "to": 34.21
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 1024
  }
}, {
  "region": 12,
  "zoom": {
    "from": 34.21,
    "to": 37.32
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 2048
  }
}, {
  "region": 13,
  "zoom": {
    "from": 37.32,
    "to": 40.43
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 4096
  }
}, {
  "region": 14,
  "zoom": {
    "from": 40.43,
    "to": 43.54
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 8192
  }
}, {
  "region": 15,
  "zoom": {
    "from": 43.54,
    "to": 46.65
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 16384
  }
}, {
  "region": 16,
  "zoom": {
    "from": 46.65,
    "to": 49.76
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 32768
  }
}, {
  "region": 17,
  "zoom": {
    "from": 49.76,
    "to": 52.87
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 65536
  }
}, {
  "region": 18,
  "zoom": {
    "from": 52.87,
    "to": 55.98
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 131072
  }
}, {
  "region": 19,
  "zoom": {
    "from": 55.98,
    "to": 59.089999999999996
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 262144
  }
}, {
  "region": 20,
  "zoom": {
    "from": 59.089999999999996,
    "to": 62.199999999999996
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 524288
  }
}, {
  "region": 21,
  "zoom": {
    "from": 62.199999999999996,
    "to": 65.31
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 1048576
  }
}, {
  "region": 22,
  "zoom": {
    "from": 65.31,
    "to": 68.42
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 2097152
  }
}, {
  "region": 23,
  "zoom": {
    "from": 68.42,
    "to": 71.53
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 4194304
  }
}, {
  "region": 24,
  "zoom": {
    "from": 71.53,
    "to": 74.64
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 8388608
  }
}, {
  "region": 25,
  "zoom": {
    "from": 74.64,
    "to": 77.75
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 16777216
  }
}, {
  "region": 26,
  "zoom": {
    "from": 77.75,
    "to": 80.86
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 33554432
  }
}, {
  "region": 27,
  "zoom": {
    "from": 80.86,
    "to": 83.97
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 67108864
  }
}, {
  "region": 28,
  "zoom": {
    "from": 83.97,
    "to": 87.08
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 134217728
  }
}, {
  "region": 29,
  "zoom": {
    "from": 87.08,
    "to": 90.19
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 268435456
  }
}, {
  "region": 30,
  "zoom": {
    "from": 90.19,
    "to": 93.3
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 536870912
  }
}, {
  "region": 31,
  "zoom": {
    "from": 93.3,
    "to": 96.41
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 1073741824
  }
}, {
  "region": 32,
  "zoom": {
    "from": 96.41,
    "to": 99.52
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 2147483648
  }
}, {
  "region": 33,
  "zoom": {
    "from": 99.52,
    "to": 102.63
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 4294967296
  }
}, {
  "region": 34,
  "zoom": {
    "from": 102.63,
    "to": 105.74
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 8589934592
  }
}, {
  "region": 35,
  "zoom": {
    "from": 105.74,
    "to": 108.85
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 17179869184
  }
}, {
  "region": 36,
  "zoom": {
    "from": 108.85,
    "to": 111.96
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 34359738368
  }
}, {
  "region": 37,
  "zoom": {
    "from": 111.96,
    "to": 115.07
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 68719476736
  }
}, {
  "region": 38,
  "zoom": {
    "from": 115.07,
    "to": 118.17999999999999
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 137438953472
  }
}, {
  "region": 39,
  "zoom": {
    "from": 118.17999999999999,
    "to": 121.28999999999999
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 274877906944
  }
}, {
  "region": 40,
  "zoom": {
    "from": 121.28999999999999,
    "to": 124.39999999999999
  },
  "low": 1,
  "medium": 2,
  "high": 3,
  "all": 25,
  "step": {
    "months": 0,
    "days": 549755813888
  }
}];
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/sort.js
var sort = __webpack_require__(15);
var sort_default = /*#__PURE__*/__webpack_require__.n(sort);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/object/values.js
var values = __webpack_require__(95);
var values_default = /*#__PURE__*/__webpack_require__.n(values);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/parse-float.js
var parse_float = __webpack_require__(96);
var parse_float_default = /*#__PURE__*/__webpack_require__.n(parse_float);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(97);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/parse-int.js
var parse_int = __webpack_require__(0);
var parse_int_default = /*#__PURE__*/__webpack_require__.n(parse_int);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/helpers/typeof.js
var helpers_typeof = __webpack_require__(98);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);

// CONCATENATED MODULE: ./js/Dmy.js


 // Proleptic Gregorian calendar
// Immutable
// Months are from 1-12
// Faster than normal Date() or Momentjs

var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; // month 1-12

function Dmy(year, month, day) {
  if (typeof_default()(year) === "object") {
    var options = year;
    this.year = options.year;
    this.month = options.month;
    this.day = getCorrectDay(options.year, options.month, options.day);
  } else {
    this.year = year;
    this.month = month;
    this.day = getCorrectDay(year, month, day);
  }
}

function getCorrectDay(year, month, day) {
  return day > 28 ? Math.min(day, daysInMonth(year, month)) : day;
}

function daysInMonth(year, month) {
  if (month == 2) {
    // is leap year?
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) return 29;
  }

  return DAYS_IN_MONTH[month - 1];
}

function digitGroupedNumber(number, separator) {
  //Separates thousands within the number e.g. 1,345,450 (must have < 3 decimal places)
  number = number.toString();
  separator = typeof separator === 'string' ? separator : ",";
  if (number.length <= 4) return number;
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
} // Integer number of days between


Dmy.prototype.getDaysTo = function (other) {
  return other.getDaysSinceYearZero() - this.getDaysSinceYearZero();
}; // Decimal number of months between


Dmy.prototype.getMonthsTo = function (other) {
  return this.getYearsTo(other) * 12;
}; // Decimal number of years between


Dmy.prototype.getYearsTo = function (other) {
  var yearDiff = other.year - this.year; // Find fraction from day and month

  yearDiff += (other.month - this.month) / 12 + (other.day - this.day) / 365.2422;
  return yearDiff;
}; // Total number of leap years since 'year 0' 


Dmy.prototype.getLeapYearsSinceYearZero = function () {
  var year = this.year;
  if (this.month < 3) year--;
  return Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
};

Dmy.prototype.getDaysSinceYearZero = function () {
  // Start by adding years and days
  var year = this.year;
  var days = year * 365 + this.day; // Add days for all the months in the date. Leap year day accounted for afterwards

  for (var i = 0; i < this.month - 1; i++) {
    days += DAYS_IN_MONTH[i];
  } // Finally add number of leap years (as there's one extra day for each leap year)


  days += this.getLeapYearsSinceYearZero();
  return days;
};

Dmy.prototype.getDayOfYear = function () {
  // lazy loading 'day of year' to increase speed
  if (isUndefined(this._dayOfYear)) {
    this._dayOfYear = 0;

    for (var m = 1; m < this.month; m++) {
      this._dayOfYear += daysInMonth(this.year, m);
    }

    this._dayOfYear += this.day;
  }

  return this._dayOfYear;
}; // returns a Dmy with correct Month and Day based on the dayOfYear


Dmy.getByDayOfYear = function (year, dayOfYear) {
  var dmy = new Dmy(year, 1, 1); // Performance: instead of calling daysInMonth() only change daysInMonth variable when there is change in month/year

  var dim = DAYS_IN_MONTH[0];

  for (var i = 0; i < dayOfYear - 1; i++) {
    // Performance: instead of calling getNextDay(), run a mutating version of it
    dmy.day++;

    if (dmy.day > dim) {
      dmy.day = 1;
      dmy.month++;

      if (dmy.month > 12) {
        dmy.month = 1;
        dmy.year++;
      }

      dim = dmy.month == 2 ? daysInMonth(dmy.year, dmy.month) : DAYS_IN_MONTH[dmy.month - 1];
    }
  }

  return dmy;
};

Dmy.prototype.getNextDay = function () {
  return this.addDays(1);
}; // only works for positive values


Dmy.prototype.addDays = function (amount) {
  var day = this.day;
  var month = this.month;
  var year = this.year;

  for (var i = 0; i < amount; i++) {
    day++;

    if (day > daysInMonth(year, month)) {
      day = 1;
      month++;

      if (month > 12) {
        month = 1;
        year++;
      }
    }
  }

  return new Dmy(year, month, day);
}; // limited: assume day is always 1 and amount is positive


Dmy.prototype.addMonths = function (amount) {
  var month = this.month;
  var year = this.year;

  for (var i = 0; i < amount; i++) {
    month++;

    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return new Dmy(year, month, 1);
};

Dmy.prototype.getPreviousDay = function () {
  var day = this.day;
  var month = this.month;
  var year = this.year;
  day--;

  if (day < 1) {
    month--;

    if (month < 1) {
      month = 12;
      year--;
    }

    day = daysInMonth(year, month);
  }

  return new Dmy(year, month, day);
}; // always jump to the first day of the month


Dmy.prototype.getNextMonth = function () {
  var month = this.month;
  var year = this.year;
  month++;

  if (month > 12) {
    month = 1;
    year++;
  }

  return new Dmy(year, month, 1);
}; // always jump to the first day of the month


Dmy.prototype.getPreviousMonth = function () {
  var month = this.month;
  var year = this.year;
  month--;

  if (month < 1) {
    month = 12;
    year--;
  }

  return new Dmy(year, month, 1);
}; // always jump to the first day of the Jan


Dmy.prototype.addYears = function (amount) {
  return new Dmy(this.year + amount, 1, 1);
}; // only supports YYYY, MMM, D


Dmy.prototype.format = function (format, options) {
  var options = options || {},
      format = format || 'D MMM YYYY',
      prefixSettings = options.yearPrefix,
      bceText = typeof options.bceText === 'string' ? options.bceText : ' ʙᴄᴇ',
      isBc = this.year <= 0,
      is1Bc = this.year === 0,
      thousandsSeparator = options.thousandsSeparator;

  if (prefixSettings && !is1Bc) {
    //don't use any prefix for 1BC
    var prefixValue = prefixSettings.value || 1;
    var prefixLabel = prefixSettings.label || "";
    var formattedYear;

    if (isBc) {
      formattedYear = digitGroupedNumber((-this.year + 1) / prefixValue, thousandsSeparator) + prefixLabel + bceText; // ISO 8601: year 0 is called 1 BC
    } else {
      formattedYear = digitGroupedNumber(this.year / prefixValue, thousandsSeparator) + prefixLabel;
    }

    return formattedYear; //display year only when using a prefix
  } //else, no prefix settings


  return format.replace('YYYY', isBc ? digitGroupedNumber(-this.year + 1, thousandsSeparator) + bceText : digitGroupedNumber(this.year, thousandsSeparator)). // ISO 8601: year 0 is called 1 BC
  replace('D', this.day).replace('MMM', MONTH_NAMES[this.month - 1]);
};

Dmy.prototype.isSame = function (other) {
  return other.year == this.year && other.month == this.month && other.day == this.day;
};

Dmy.prototype.toKeyString = function () {
  return this.year + '|' + this.month + '|' + this.day;
};

Dmy.prototype.isAfter = function (other) {
  if (this.year > other.year) return true;

  if (this.year == other.year) {
    if (this.month > other.month) return true;

    if (this.month == other.month) {
      return this.day > other.day;
    }
  }

  return false;
};

Dmy.prototype.isBetween = function (from, to) {
  return this.isAfter(from) && to.isAfter(this);
};

Dmy.prototype.compare = function (other) {
  if (this.isSame(other)) return 0;
  if (this.isAfter(other)) return +1;
  return -1;
};

Dmy.prototype.asFloat = function () {
  var m = this.month - 1;
  var d = this.day - 1;
  if (m == 0 && d == 0) return this.year;
  return Math.round((this.year + (m * 31 + d) / 371) * 100) / 100;
};

Dmy.prototype.isInFuture = function () {
  var date = new Date();
  var today = new Dmy(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return this.isAfter(today);
}; // Changes original Dmy to ISO:8601 format 
// Affects BCE only, e.g. 2BCE --> 1BCE
// Year 0 input is invalid but defaults to year 1BCE


Dmy.prototype.convertToIso = function () {
  if (this.year < 0) this.year += 1;
  return this;
};

Dmy.CreateAsStartOfPeriod = function (isoDmy, precision) {
  //century and millenium precision use historical conventions so start at different points to other precisions
  var isoYear = isoDmy.year;
  var month = isoDmy.month || 1;
  var day = isoDmy.day || 1;
  var precision = precision || PRECISION_DAY;

  if (precision === PRECISION_CENTURY) {
    // 8th century AD (+800) = 701 AD to 800 AD
    // 8th century BC (-800) = 800 BC to 701 BC
    return isoYear < 0 ? new Dmy(isoYear, 1, 1) : new Dmy(isoYear - 99, 1, 1);
  }

  if (precision === PRECISION_MILLENNIUM) {
    // 8th millennium AD (+8000) = 7001 AD to 8000 AD
    // 8th millennium BC (-8000) = 8000 BC to 7001 BC
    return isoYear < 0 ? new Dmy(isoYear, 1, 1) : new Dmy(isoYear - 999, 1, 1);
  }

  return new Dmy(isoYear, month, day);
};

Dmy.CreateAsEndOfPeriod = function (isoDmy, precision) {
  //century and millenium precision use historical conventions so start at different points to other precisions
  var isoYear = isoDmy.year;
  var month = isoDmy.month || 1;
  var day = isoDmy.day || 1;
  var precision = precision || PRECISION_DAY;
  if (precision === PRECISION_DAY) return new Dmy(isoYear, month, day);
  if (precision === PRECISION_MONTH) return new Dmy(isoYear, month, daysInMonth(isoYear, month));
  if (precision === PRECISION_YEAR) return new Dmy(isoYear, 12, 31);
  if (precision === PRECISION_DECADE) return new Dmy(isoYear + 9, 12, 31);
  var isBc = isoYear <= 0;

  if (precision === PRECISION_CENTURY) {
    // 8th century AD (+800) = 701 AD to 800 AD
    // 8th century BC (-800) = 800 BC to 701 BC
    return isBc ? new Dmy(isoYear + 99, 12, 31) : new Dmy(isoYear, 12, 31);
  }

  if (precision == PRECISION_MILLENNIUM) {
    // 8th millennium AD (+8000) = 7001 AD to 8000 AD
    // 8th millennium BC (-8000) = 8000 BC to 7001 BC
    return isBc ? new Dmy(isoYear + 999, 12, 31) : new Dmy(isoYear, 12, 31);
  }

  if (precision == PRECISION_MILLION_YEARS) {
    return new Dmy(isoYear + 999999, 12, 31);
  }

  if (precision == PRECISION_BILLION_YEARS) {
    return new Dmy(isoYear + 999999999, 12, 31);
  }

  console.error('precision is not implemented');
  return new Dmy(isoYear, month, day);
};

Dmy.now = function () {
  var now = new Date();
  return new Dmy({
    year: now.getYear() + 1900,
    month: now.getMonth() + 1,
    day: now.getDate()
  });
};

Dmy.fromString = function (dateString) {
  //"dd-mm-yyyy" day and month default to 1 if not included
  var dateParts = dateString.split("-");
  var isBc = dateParts[0] === ""; //bc dates start with - leaving blank first element

  if (isBc) {
    dateParts.shift();
    dateParts[0] = "-" + dateParts[0];
  }

  var year = parse_int_default()(dateParts[0]);

  var month = parse_int_default()(dateParts[1]) || 1;
  var day = parse_int_default()(dateParts[2]) || 1;
  return new Dmy({
    year: parse_int_default()(year),
    month: parse_int_default()(month),
    day: parse_int_default()(day)
  });
};
// CONCATENATED MODULE: ./js/TimescaleManager.js





 // different periods of time have different scales. Bing bang until Jurassic cannot be displayed year by year. This module takes care of these jumps in time scale

var TimescaleManager_TimescaleManager = function TimescaleManager(owner, zoomOptions) {
  classCallCheck_default()(this, TimescaleManager);

  this.owner = owner;
  this.zoomOptions = zoomOptions;
  this.zoom = 0;
  this.startToken = null;
  this.unit = ZOOM_DAY;
  this.unitSizeInPixels = 100;
  this.unitLengthInYears = 1;
  this.zoomChangedHandlers = [];
  this.yearPrefix = {
    //updated by setCurrentYearPrefixes()
    minor: false,
    major: false
  };
  this.unitLevels = []; //populated by setUnitLevels() on startup
};

TimescaleManager_TimescaleManager.prototype.getUnitSizeInPixelsForZoom = function (zoom) {
  var zoomRatio = this.zoomOptions.ratio;
  var currentUnitSettings = this.unitLevels[this.unit];
  var zoomStart = currentUnitSettings.zoomStart; //lower boundary zoom level for the current unit

  var startUnitSize = currentUnitSettings.startUnitSize; //size of unit in pixels at zoomStart

  return startUnitSize * Math.pow(zoomRatio, zoom - zoomStart);
};

TimescaleManager_TimescaleManager.prototype.getChangePoint = function (unit) {
  var unitLevels = this.unitLevels;
  return this.unitLevels[this.unit].zoomStart;
};

TimescaleManager_TimescaleManager.prototype.getUnitFromZoom = function (zoom) {
  var unitLevels = this.unitLevels;

  for (var i = unitLevels.length - 1; i < unitLevels.length; i--) {
    if (zoom >= unitLevels[i].zoomStart) {
      return i;
    }
  }
};

TimescaleManager_TimescaleManager.prototype.getDateLabelFormatOptions = function (tokenType) {
  tokenType = tokenType === MAJOR_MARKER ? "major" : "minor";
  var dateLabelFormatOptions = this.owner.options.style.dateLabel[tokenType];
  return {
    thousandsSeparator: dateLabelFormatOptions.thousandsSeparator,
    bceText: dateLabelFormatOptions.bceText,
    yearPrefix: this.yearPrefix[tokenType]
  };
};

TimescaleManager_TimescaleManager.prototype.createYearToken = function (dmy) {
  var me = this;
  var token = {
    unit: this.unit,
    value: dmy,
    length: this.unitSizeInPixels
  };
  var year = dmy.year;
  var is1BC = year == 0;
  if (year <= 0) year = -year + 1;
  var unitLengthInYears = this.unitLengthInYears;
  var unitSettings = this.unitLevels[this.unit];

  if (year % (unitLengthInYears * 10) === 0 || is1BC) {
    token.label = dmy.format('YYYY', this.getDateLabelFormatOptions(MAJOR_MARKER));
    token.type = MAJOR_MARKER;
  } else {
    token.type = MINOR_MARKER;

    if (this.zoom < unitSettings.zoomHideMinorLabels) {
      token.label = dmy.format('YYYY', this.getDateLabelFormatOptions(MINOR_MARKER));
    }
  }

  return token;
};

TimescaleManager_TimescaleManager.prototype.createMonthToken = function (dmy) {
  var token = {
    unit: this.unit,
    value: dmy,
    length: this.unitSizeInPixels
  };
  var unitSettings = this.unitLevels[ZOOM_MONTH];

  if (dmy.month == 1) {
    token.label = dmy.format('YYYY', this.getDateLabelFormatOptions(MAJOR_MARKER));
    token.type = MAJOR_MARKER;
  } else {
    token.type = MINOR_MARKER;
    if (this.zoom < unitSettings.zoomHideMinorLabels) token.label = dmy.format('MMM');
  }

  return token;
};

TimescaleManager_TimescaleManager.prototype.createDayToken = function (dmy) {
  var token = {
    unit: this.unit,
    value: dmy,
    length: this.unitSizeInPixels
  };
  var unitSettings = this.unitLevels[ZOOM_DAY];

  if (dmy.day == 1) {
    token.label = dmy.format('MMM YYYY', this.getDateLabelFormatOptions(MAJOR_MARKER));
    token.type = MAJOR_MARKER;
  } else {
    token.type = MINOR_MARKER;
    if (this.zoom < unitSettings.zoomHideMinorLabels) token.label = dmy.format('D');
  }

  return token;
};

TimescaleManager_TimescaleManager.prototype.addZoomChangedHandler = function (handler, context) {
  this.zoomChangedHandlers.push({
    callback: handler,
    context: context || this
  });
};

TimescaleManager_TimescaleManager.prototype.notifyZoomChanged = function () {
  for (var i = 0; i < this.zoomChangedHandlers.length; i++) {
    this.zoomChangedHandlers[i].callback.call(this.zoomChangedHandlers[i].context);
  }
};

TimescaleManager_TimescaleManager.prototype.setZoom = function (value) {
  this.zoom = parse_float_default()(value.toFixed(4));
  if (this.zoom < this.zoomOptions.minimum) this.zoom = this.zoomOptions.minimum;
  if (this.zoom > this.zoomOptions.maximum) this.zoom = this.zoomOptions.maximum; // find the unit base on the zoom

  this.unit = this.getUnitFromZoom(this.zoom);
  this.unitSizeInPixels = this.getUnitSizeInPixelsForZoom(this.zoom); //zoom month or day settings

  var unitLengthInYears = 0; //remove?

  if (this.unit >= ZOOM_YEAR) {
    //zoom year or above settings
    var unitYearPowerOfTen = this.unit - ZOOM_YEAR;
    unitLengthInYears = Math.pow(10, unitYearPowerOfTen);
  }

  this.unitLengthInYears = unitLengthInYears;
  this.setCurrentYearPrefixes();
  this.notifyZoomChanged();
  return this.zoom;
};

TimescaleManager_TimescaleManager.prototype.getPixelsBetween = function (a, b) {
  var unit = this.unit;
  if (unit <= ZOOM_DAY) return a.getDaysTo(b) * this.unitSizeInPixels;

  if (unit === ZOOM_MONTH) {
    return a.getMonthsTo(b) * this.unitSizeInPixels;
  } else {
    //zoom year and above
    return a.getYearsTo(b) * this.unitSizeInPixels / this.unitLengthInYears;
  }
};

TimescaleManager_TimescaleManager.prototype.setStartToken = function (token) {
  return this.startToken = token;
}; // from is Dmy
// returns a value that indicate compensation necessary to reposition window. Caller can decide to use it or not.


TimescaleManager_TimescaleManager.prototype.setStartDate = function (from) {
  var bcMove = 0;
  if (from.year < 0) bcMove = 1; // we want to make sure labels of BC dates are a multiplication of 10 or 1000 in Decade or Century

  switch (this.unit) {
    case ZOOM_DAY:
      this.startToken = this.createDayToken(from);
      return 0;

    case ZOOM_MONTH:
      this.startToken = this.createMonthToken(new Dmy(from.year, from.month, 1));
      var unitSizeForDays = this.unitSizeInPixels / 30.44;
      return unitSizeForDays * (this.startToken.value.day - from.day);

    case ZOOM_YEAR:
      this.startToken = this.createYearToken(new Dmy(from.year, 1, 1));
      var unitSizeForDays = this.unitSizeInPixels / 365.2422;
      return unitSizeForDays * ((this.startToken.value.month - from.month) * 30.44 + (this.startToken.value.day - from.day));

    default:
      //zoom decade and above
      var tokenLengthInYears = this.unitLengthInYears;
      this.startToken = this.createYearToken(new Dmy(Math.floor(from.year / tokenLengthInYears) * tokenLengthInYears + bcMove, 1, 1));
      var unitSizeForDays = this.unitSizeInPixels / (365.2422 * tokenLengthInYears);
      return unitSizeForDays * ((this.startToken.value.year - from.year) * 365.2422 + (this.startToken.value.month - from.month) * 30.44 + (this.startToken.value.day - from.day));
  }
}; // Can be used in cases which a direct reference needed to be changed and we want that to not affect TimescaleManager's startToken
// In other cases direct accesss to the startToken for performance


TimescaleManager_TimescaleManager.prototype.getStartTokenCloned = function () {
  switch (this.startToken.unit) {
    case ZOOM_DAY:
      return this.createDayToken(this.startToken.value);

    case ZOOM_MONTH:
      return this.createMonthToken(this.startToken.value);

    default:
      //zoom year and above
      return this.createYearToken(this.startToken.value);
  }
};

TimescaleManager_TimescaleManager.prototype.getNext = function (token) {
  switch (token.unit) {
    case ZOOM_DAY:
      return this.createDayToken(token.value.getNextDay());

    case ZOOM_MONTH:
      return this.createMonthToken(token.value.getNextMonth());

    case ZOOM_YEAR:
      return this.createYearToken(token.value.addYears(+1));

    default:
      //zoom decade and above
      // in decades jump from 10BC (-9) to 1BC (0)
      // in century jump from 100 BC (-99) to 1BC (0) etc...
      var unitLengthInYears = this.unitLengthInYears;
      return this.createYearToken(token.value.addYears(token.value.year == -(unitLengthInYears - 1) ? unitLengthInYears - 1 : unitLengthInYears));
  }

  throw 'Unknown unit:' + token.unit;
};

TimescaleManager_TimescaleManager.prototype.getPrevious = function (token) {
  switch (token.unit) {
    case ZOOM_DAY:
      return this.createDayToken(token.value.getPreviousDay());

    case ZOOM_MONTH:
      return this.createMonthToken(token.value.getPreviousMonth());

    case ZOOM_YEAR:
      return this.createYearToken(token.value.addYears(-1));

    default:
      //zoom decade and above
      // in decades jump from 1BC (0) to 10BC (-9)
      // in century jump from 1BC (0) to 100BC (-99) etc...
      var unitLengthInYears = this.unitLengthInYears;
      return this.createYearToken(token.value.addYears(token.value.year == 0 ? 1 - unitLengthInYears : -unitLengthInYears));
  }
};

TimescaleManager_TimescaleManager.prototype.getPreviousNth = function (token, n) {
  for (var i = 0; i < n; i++) {
    token = this.getPrevious(token);
  }

  return token;
};

TimescaleManager_TimescaleManager.prototype.zoomUnitToString = function (unit) {
  switch (unit) {
    case ZOOM_DAY:
      return 'day';

    case ZOOM_MONTH:
      return 'month';

    case ZOOM_YEAR:
      return 'year';

    case ZOOM_DECADE:
      return 'decade';

    case ZOOM_CENTURY:
      return 'century';

    case ZOOM_MILLENNIUM:
      return 'millennium';

    case ZOOM_10_THOUSAND_YEARS:
      return '10 thousand years';

    case ZOOM_100_THOUSAND_YEARS:
      return '100 thousand years';

    case ZOOM_MILLION_YEARS:
      return 'million years';

    case ZOOM_10_MILLION_YEARS:
      return '10 million years';

    case ZOOM_100_MILLION_YEARS:
      return '100 million years';

    case ZOOM_BILLION_YEARS:
      return 'billion years';

    default:
      return 'unknown';
  }
}; //Calculate the zoom levels where unit changes, according to zoom ratio and minimum allowed unit size
//Each change level is found by calculating the *change* in zoom level that will turn startUnitSize into minUnitSize
//Then calculate next startUnitSize so that distance is perfectly matched on transition between units
//e.g. no. of pixels for 12 months with 'month unit' = no. of pixels for 1 year with 'year unit') 
//Note: only needs running on startup, or if zoom ratio or minUnitSize changes 


TimescaleManager_TimescaleManager.prototype.setUnitLevels = function () {
  this.unitLevels = []; //reset

  var zoomRatio = this.zoomOptions.ratio;
  var minUnitSize = this.zoomOptions.unitSize.minimum; //unit size to switch to next unit

  var showMinorLabelUnitSize = this.zoomOptions.unitSize.showMinorLabels;
  var dayZoomStart = 0; //zoom change from zoomEnd -> zoomHideMinorLabels
  //This is the same for all unitLevels. It gives the amount to subtract from endZoom to get from minUnitSize (at endZoom) back to showMinorLabelUnitSize

  var hideLabelsZoomChangeFromEnd = this.getZoomChangeByDistance(showMinorLabelUnitSize, minUnitSize); //day change points

  var dayStartUnitSize = this.zoomOptions.unitSize.initial;
  var dayZoomSpan = this.getZoomChangeByDistance(dayStartUnitSize, minUnitSize);
  var dayZoomEnd = dayZoomStart + dayZoomSpan;
  var dayZoomHideMinorLabels = dayZoomEnd - hideLabelsZoomChangeFromEnd;
  var daySettings = {
    startUnitSize: dayStartUnitSize,
    zoomStart: dayZoomStart,
    zoomHideMinorLabels: dayZoomHideMinorLabels,
    zoomEnd: dayZoomEnd
  };
  this.unitLevels.push(daySettings); //month change points

  var monthStartUnitSize = minUnitSize * 31; //31 days (at minUnitSize) should match 1 month

  var monthZoomSpan = this.getZoomChangeByDistance(monthStartUnitSize, minUnitSize);
  var monthZoomEnd = dayZoomEnd + monthZoomSpan;
  var monthZoomHideMinorLabels = monthZoomEnd - hideLabelsZoomChangeFromEnd;
  this.unitLevels.push({
    startUnitSize: monthStartUnitSize,
    zoomStart: dayZoomEnd,
    zoomHideMinorLabels: monthZoomHideMinorLabels,
    zoomEnd: monthZoomEnd
  }); //year change points

  var yearStartUnitSize = minUnitSize * 12; //12 months should match 1 year

  var yearZoomSpan = this.getZoomChangeByDistance(yearStartUnitSize, minUnitSize);
  var yearZoomEnd = monthZoomEnd + yearZoomSpan;
  var yearZoomHideMinorLabels = yearZoomEnd - hideLabelsZoomChangeFromEnd;
  this.unitLevels.push({
    startUnitSize: yearStartUnitSize,
    zoomStart: monthZoomEnd,
    zoomHideMinorLabels: yearZoomHideMinorLabels,
    zoomEnd: yearZoomEnd
  }); //decade and above change points

  var startUnitSize;
  var zoomSpan;
  var zoomStart = yearZoomEnd;
  var zoomEnd;
  var zoomHideMinorLabels;
  var numberOfUnits = 8; //e.g. 2 would have zoom century as maximum (10^2 years)

  for (var i = 1; i <= numberOfUnits; i++) {
    //i represents powers of 10, so <=6 would go up to million year zoom units (x10^6)
    startUnitSize = minUnitSize * 10;
    zoomSpan = this.getZoomChangeByDistance(startUnitSize, minUnitSize);
    zoomEnd = zoomStart + zoomSpan;
    zoomHideMinorLabels = zoomEnd - hideLabelsZoomChangeFromEnd;
    this.unitLevels.push({
      startUnitSize: startUnitSize,
      zoomStart: zoomStart,
      zoomHideMinorLabels: zoomHideMinorLabels,
      zoomEnd: zoomEnd
    });
    zoomStart = zoomEnd;
    if (i === numberOfUnits) this.zoomOptions.maximum = Math.min(this.zoomOptions.maximum, zoomEnd);
  }
}; //get zoom level change that will turn startDistance into endDistance


TimescaleManager_TimescaleManager.prototype.getZoomChangeByDistance = function (startDistance, endDistance) {
  var zoomRatio = this.zoomOptions.ratio;
  var zoom = Math.log(endDistance / startDistance) / Math.log(zoomRatio);
  return zoom;
}; //get changed distance after zoom level change


TimescaleManager_TimescaleManager.prototype.scaleDistanceByZoomChange = function (startDistance, zoomChange) {
  var zoomRatio = this.zoomOptions.ratio;
  var endDistance = startDistance * Math.pow(zoomRatio, zoomChange);
  return endDistance;
};

TimescaleManager_TimescaleManager.prototype.setCurrentYearPrefixes = function () {
  var markerTypes = ["minor", "major"];

  if (this.unit < ZOOM_YEAR) {
    //only use yearPrefixes for ZOOM_YEAR and above
    for (var i = 0; i < markerTypes.length; i++) {
      this.yearPrefix[markerTypes[i]] = false;
    }

    return;
  }

  var dateLabelOptions = this.owner.options.style.dateLabel;
  var currentDivisions = {
    minor: this.unitLengthInYears,
    major: this.unitLengthInYears * 10
  };

  for (var i = 0; i < markerTypes.length; i++) {
    var markerType = markerTypes[i];

    var prefixOptions = values_default()(dateLabelOptions[markerType].yearPrefixes); //reset to no prefix, will remain like this if no prefix is found 


    this.yearPrefix[markerType] = false;

    sort_default()(prefixOptions).call(prefixOptions, function (a, b) {
      return b.minDivision - a.minDivision;
    });

    for (var j = 0; j < prefixOptions.length; j++) {
      var prefix = prefixOptions[j];

      if (prefix.minDivision <= currentDivisions[markerType]) {
        this.yearPrefix[markerType] = {
          label: prefix.label,
          value: prefix.value
        };
        break;
      }
    }
  }
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/index-of.js
var index_of = __webpack_require__(10);
var index_of_default = /*#__PURE__*/__webpack_require__.n(index_of);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/splice.js
var splice = __webpack_require__(25);
var splice_default = /*#__PURE__*/__webpack_require__.n(splice);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/reduce.js
var reduce = __webpack_require__(45);
var reduce_default = /*#__PURE__*/__webpack_require__.n(reduce);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/set-timeout.js
var set_timeout = __webpack_require__(26);
var set_timeout_default = /*#__PURE__*/__webpack_require__.n(set_timeout);

// CONCATENATED MODULE: ./js/utils.js






function preventDefault(e) {
  if (!e) var e = window.event; //e.cancelBubble is supported by IE - this will kill the bubbling process.

  e.cancelBubble = true;
  e.returnValue = false; //e.stopPropagation works only in Firefox.

  if (e.stopPropagation) {
    e.stopPropagation();
    e.preventDefault();
  }

  return false;
}
function extractPinchCentre(event) {
  var touches = event.originalEvent.touches;
  return {
    x: (touches[0].pageX + touches[1].pageX) / 2,
    y: (touches[0].pageY + touches[1].pageY) / 2
  };
}
function getTouchDistance(event) {
  var touches = event.originalEvent.touches;
  var x1 = touches[0].pageX;
  var y1 = touches[0].pageY;
  var x2 = touches[1].pageX;
  var y2 = touches[1].pageY;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

var delay = function () {
  var timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = set_timeout_default()(callback, ms);
  };
}();

String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.hashCode = function () {
  var _context;

  return reduce_default()(_context = this.split("")).call(_context, function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

function moveInArray(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length;

    while (k-- + 1) {
      arr.push(undefined);
    }
  }

  splice_default()(arr).call(arr, new_index, 0, splice_default()(arr).call(arr, old_index, 1)[0]);

  return arr;
}
;
function getIndexById(arr, id) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == id) return i;
  }

  return -1;
}
function clearSelection() {
  if (document.selection) {
    document.selection.empty();
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
}

function enableSelectionInTextBoxes(target) {
  if (typeof target.onselectstart != "undefined") {
    target.onselectstart = function (event) {
      event.cancelBubble = true;
      return true;
    };
  }
}

function renderTemplate(template, item) {
  var result = template;

  for (var p in item) {
    var re = new RegExp("\{\{" + p + "\}\}", "g");
    result = result.replace(re, item[p]);
  }

  return result;
}

function getQueryString(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(window.location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function formatNumber(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

String.prototype.endsWith = function (suffix) {
  var _context2;

  return index_of_default()(_context2 = this).call(_context2, suffix, this.length - suffix.length) !== -1;
};

function getMergeOrReplaceDecision(callback) {
  var currentState = timeline.getCurrentState();
  var hasArticles = currentState && currentState.a && currentState.a.length > 0;

  if (!hasArticles || isEmbeddedMode) {
    callback('replace');
    return;
  } // display Replace, Merge or Cancel


  var confirmation = $("<div>" + mergeOrReplaceMessage + "</div>");
  confirmation.dialog({
    position: {
      my: "center",
      at: "center",
      of: "#canvas-1"
    },
    resizable: false,
    width: 500,
    modal: true,
    buttons: [{
      text: 'Cancel',
      click: function click() {
        $(this).dialog("close");
        callback('cancel');
      }
    }, {
      text: 'Merge',
      click: function click() {
        $(this).dialog("close");
        callback('merge');
      }
    }, {
      text: 'Replace',
      click: function click() {
        $(this).dialog("close");
        callback('replace');
      }
    }]
  });
}

function MakeTimeoutCall(fn, data) {
  // to minimise closure
  set_timeout_default()(function () {
    fn.call(null, data);
  }, 0);
}

function extractPagePosition(event) {
  //click and single touch events
  return {
    left: event.pageX ? event.pageX : event.originalEvent.changedTouches ? event.originalEvent.changedTouches[0].pageX : event.pageX,
    top: event.pageY ? event.pageY : event.originalEvent.changedTouches ? event.originalEvent.changedTouches[0].pageY : event.pageY
  };
} // TODO: move to app.js

function updateVerticalStackButtonVisibility(eventSpacing) {
  $(".button-rearrange")[eventSpacing === 0 ? "show" : "hide"]();
}

function utils_isUndefined(x) {
  return typeof x === 'undefined';
}

function hasValue(str) {
  return typeof str !== "undefined" && str !== null && str.length > 0;
}

function utils_bind(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
function findMinIndex(arr, property) {
  if (arr.length == 0) return -1;
  var minIndex = 0;
  var minValue = arr[0][property];

  for (var i = 1; i < arr.length; i++) {
    if (arr[i][property] < minValue) {
      minValue = arr[i][property];
      minIndex = i;
    }
  }

  return minIndex;
}
function isFunction(obj) {
  return typeof obj === 'function';
}
function buildObjectFromPath(path, value) {
  //builds object from dot notation property path, with value set for the deepest property
  var pathParts = path.split(".");
  var pathEnd = pathParts[pathParts.length - 1];
  var obj = {};
  obj[pathEnd] = value;

  for (var i = pathParts.length - 2; i >= 0; i--) {
    var previousPathPart = pathParts[i];
    var objClone = $.extend(true, {}, obj);
    obj = {};
    obj[previousPathPart] = objClone;
  }

  return obj;
}
function defineValueOrFunctionProperty(obj, propName) {
  var privatePropertyName = "_" + propName;
  obj[privatePropertyName] = undefined;

  define_property_default()(obj, propName, {
    get: function get() {
      var value = this[privatePropertyName];

      if (isFunction(value)) {
        return value(this);
      }

      return value;
    },
    set: function set(value) {
      this[privatePropertyName] = value;
    },
    enumerable: true,
    configurable: false
  });
}
function getValueOrFunctionResult(value, context) {
  var _context3;

  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return typeof value === 'function' ? value.call.apply(value, concat_default()(_context3 = [context]).call(_context3, args)) : value;
}
// CONCATENATED MODULE: ./js/Article.sorters.js

function ARTICLE_DURATION_SORTER(articleA, articleB) {
  var a = articleA.period.from.getDaysTo(articleA.period.to);
  var b = articleB.period.from.getDaysTo(articleB.period.to);
  if (a < b) return +1;
  if (a > b) return -1;
  return parse_int_default()(articleA.id) - parse_int_default()(articleB.id);
} //faster than ARTICLE_DURATION_SORTER, but only compares duation in years.

function ARTICLE_DURATION_YEARS_SORTER(articleA, articleB) {
  var a = articleA.period.years;
  var b = articleB.period.years;
  if (a < b) return +1;
  if (a > b) return -1;
  return parse_int_default()(articleA.id) - parse_int_default()(articleB.id);
} //To sort imageLoadingQueue to prioritise articles that are inView, visible and closest to the timeline

function ARTICLE_IMAGE_QUEUE_SORTER(articleA, articleB) {
  var a = articleA.isInView && articleA.isVisible;
  var b = articleB.isInView && articleB.isVisible; //visbible & inView articles first

  if (!a && b) return -1;
  if (a && !b) return +1; //articles closer to timeline first

  return articleA.position.top - articleB.position.top;
} //Sort by start date

function ARTICLE_FROM_SORTER(articleA, articleB) {
  var a = articleA.period.from;
  var b = articleB.period.from;
  var result = a.compare(b);

  if (result == 0) {
    result = parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
  }

  return result;
} //Sort by end date

function ARTICLE_TO_SORTER(articleA, articleB) {
  var a = articleA.period.to;
  var b = articleB.period.to;
  var result = b.compare(a);

  if (result == 0) {
    result = parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
  }

  return result;
}
function ARTICLE_TOP_SORTER(articleA, articleB) {
  var a = articleA.position.top;
  var b = articleB.position.top;
  if (a < b) return -1;
  if (a > b) return +1;
  return parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
} //Sort by auto-stacking row

function ARTICLE_ROW_SORTER(articleA, articleB) {
  var a = articleA.row; //position.top;

  var b = articleB.row; //position.top;

  if (a < b) return +1;
  if (a > b) return -1;
  return parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
}
function ARTICLE_RANK_SORTER(articleA, articleB) {
  var a = articleA.rank;
  var b = articleB.rank;
  if (a < b) return +1;
  if (a > b) return -1;
  return parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
} //effecive rank includes boosting of selected article

function ARTICLE_EFFECTIVE_RANK_SORTER(articleA, articleB) {
  var a = articleA.effectiveRank;
  var b = articleB.effectiveRank;
  if (a < b) return +1;
  if (a > b) return -1;
  return parse_int_default()(articleB.id) - parse_int_default()(articleA.id);
}
function ARTICLE_POSITION_SORTER(articleA, articleB) {
  var a = articleA.position.left;
  var b = articleB.position.left;
  var result = a < b ? +1 : a > b ? -1 : 0;

  if (result == 0) {
    // same left? use top
    result = articleA.position.top - articleB.position.top;

    if (result == 0) {
      // same top? use from
      result = articleA.period.from.compare(articleB.period.from);

      if (result == 0) {
        // same from? use id as the last resort
        result = parse_int_default()(articleA.id) - parse_int_default()(articleB.id);
      }
    }
  }

  return result;
}
// CONCATENATED MODULE: ./js/Timeline.options.js


var DEFAULT_OPTIONS = {
  width: 1000,
  height: 500,
  verticalOffset: 40,
  enableUserControl: true,
  enableCursor: true,
  zoom: {
    initial: 34,
    minimum: 0,
    maximum: 123,
    wheelStep: 0.1,
    wheelSpeed: 3,
    ratio: 0.8,
    unitSize: {
      // todo: This effects 2 things and needs to be adjusted for separate
      // control. Currently is size of day unit at zoom = 0 AND maximum
      // density region size
      initial: 200,
      showMinorLabels: 48,
      minimum: 8
    }
  },
  initialDate: {
    year: 1990,
    month: 1,
    day: 1
  },
  shiftBceDates: false,
  draggingVicinity: true,
  style: {
    mainLine: {
      visible: true,
      size: 8
    },
    draggingHighlight: {
      visible: true,
      color: 'rgba(237, 247, 255, 0.5)',
      area: {
        up: 0,
        down: 40
      }
    },
    marker: {
      minor: {
        height: 12,
        color: "#6097f2",
        futureColor: "#ccc"
      },
      major: {
        height: 30,
        color: "#0c3a88",
        futureColor: "#ccc"
      }
    },
    dateLabel: {
      minor: {
        font: "normal 10px Calibri",
        color: "#333",
        futureColor: "#ccc",
        textAlign: "start",
        offset: {
          x: 4,
          y: 0
        },
        bceText: "",
        thousandsSeparator: ",",
        yearPrefixes: {
          ka: {
            label: "ka",
            value: 1e3,
            minDivision: 1e3
          },
          Ma: {
            label: "Ma",
            value: 1e6,
            minDivision: 1e5
          },
          Ga: {
            label: "Ga",
            value: 1e9,
            minDivision: 1e8
          }
        }
      },
      major: {
        font: "normal 16px Calibri",
        color: "#000",
        futureColor: "#ccc",
        textAlign: "start",
        offset: {
          x: 4,
          y: 0
        },
        bceText: " ʙᴄᴇ",
        thousandsSeparator: ",",
        yearPrefixes: {
          ka: {
            label: "ka",
            value: 1e3,
            minDivision: 1e5
          },
          Ma: {
            label: "Ma",
            value: 1e6,
            minDivision: 1e6
          },
          Ga: {
            label: "Ga",
            value: 1e9,
            minDivision: 1e9
          }
        }
      }
    }
  },
  article: {
    density: DENSITY_ALL,
    draggable: true,
    distanceToMainLine: 350,
    collectOngoing: false,
    autoStacking: {
      active: true,
      rowSpacing: 50,
      range: RANGE_ALL,
      fitToHeight: true,
      topGap: 10
    },
    periodLine: {
      defaultHide: false,
      spacing: 4,
      thickness: 10,
      stacking: {
        sorter: ARTICLE_FROM_SORTER,
        reverseOrder: false
      }
    },
    animation: {
      fade: {
        active: true,
        duration: 1500,
        easing: "swing"
      },
      move: {
        active: true,
        duration: 1500,
        easing: "swing"
      }
    },
    defaultStyle: {
      width: 150,
      color: '#e9e9e9',
      topRadius: 3,
      maxImageHeight: 400,
      header: {
        height: 50,
        text: {
          font: "normal 14px 'Segoe UI'",
          align: 'left',
          baseline: 'middle',
          margin: 10,
          color: "#333",
          lineHeight: 18,
          numberOfLines: 2
        }
      },
      subheader: {
        height: 30,
        color: '#555',
        text: {
          font: "normal 11px 'Segoe UI'",
          color: "#eee",
          align: 'left',
          baseline: 'middle',
          margin: 10
        }
      },
      shadow: {
        x: 0,
        y: 0,
        amount: 0,
        color: '#000'
      },
      border: {
        color: '#ddd',
        width: 1
      },
      connectorLine: {
        offsetX: 18,
        offsetY: -20,
        thickness: 1,
        arrow: {
          width: 16,
          height: 45
        }
      },
      star: {
        width: 16,
        margin: 3
      }
    },
    defaultHoverStyle: {
      color: "#a6c6e2"
    },
    defaultActiveStyle: {
      color: "#337ab7",
      header: {
        text: {
          color: "#fff"
        }
      },
      subheader: {
        color: '#333'
      },
      shadow: {
        x: 3,
        y: 3,
        amount: 5,
        color: '#333'
      },
      border: {
        width: 2,
        color: "#2e6da4"
      },
      connectorLine: {
        thickness: 2
      }
    }
  }
};
// CONCATENATED MODULE: ./js/Article.base.js




function Article(owner, id) {
  this.id = id;
  this.owner = owner;
  this.isDataLoaded = false;
  this.imageLoaded = false;
  this.stacking = 0;
  this.groupIndex = 0;
  this.isActive = false;
  this.isVisible = false;
  this.isInRange = false;
  this.isInView = false;
  this.isVisibleInGroup = false;
  this.isVisibleInRows = true;
  this.isStarred = false;
  this.isMouseOverStar = false;
  this.isMouseover = false;
  this.isDragging = false;
  this.registeredPosition = {
    left: 0,
    top: 0
  };
  this.position = {
    left: 0,
    top: 0
  };
  this.dragStartOffset = {
    left: 0,
    top: 0
  };
  this.indicator = {
    fromX: 0,
    toX: 0
  }; //Move and Fade animations

  this.offset = {
    left: 0,
    top: 0
  }; // current offset from registeredPosition, including during animation

  this.finalOffset = {
    left: 0,
    top: 0
  }; // used in timeline.stack to set offset to change to during draw cycle 

  this.isVisibleAfterFade = false; // visiblity article will have once fade animation is complete

  this.opacity = 0;
  this.fadeAnimation = {
    finalOpacity: 0,
    dummyElement: undefined
  };
  this.moveAnimation = {
    finalOffset: {
      left: 0,
      top: 0
    },
    dummyElement: undefined
  };
  this.row = 0;
  this.isFading = false;
  this.isMoving = false; // events

  this.activatedHandlers = [];
}

Article.prototype.setupByReceivedData = function (data) {
  this.data = $.extend(
  /* deep */
  true, {}, data);
  this.title = getPropertyFromData(data, "title") || '';
  this.rank = getPropertyFromData(data, "rank") || 0;
  this.subtitle = getPropertyFromData(data, "subtitle") || '';

  this._setupArticlePeriod(data);

  this.initialiseStyles(data);
  this.offset.left = this.finalOffset.left = this.moveAnimation.finalOffset.left = data.offsetLeft || 0; //todo: shouldn't need to be set in moveAnimation as well

  this.offset.top = this.finalOffset.top = this.moveAnimation.finalOffset.top = data.offsetTop || 0;
  this.isStarred = !!data.starred;
  this.isDataLoaded = true;
  this.isImageInfoLoaded = false;
  this.hiddenByFilter = getPropertyFromData(data, "hiddenByFilter");
  this.hidePeriodLine = existsInData(data, "hidePeriodLine") ? getPropertyFromData(data, "hidePeriodLine") : this.owner.options.article.periodLine.defaultHide;
};

Article.prototype._setupArticlePeriod = function (data) {
  var fromDmy = new Dmy(parse_int_default()(getPropertyFromData(data, "from.year")), parse_int_default()(getPropertyFromData(data, "from.month")), parse_int_default()(getPropertyFromData(data, "from.day"))); // Shift input BCE dates by 1, year 0 = 1BCE internally

  this.owner.getDmyFromInput(fromDmy);

  var fromPrecision = parse_int_default()(getPropertyFromData(data, "from.precision"));

  var isToPresentProp = getPropertyFromData(data, "isToPresent");
  var isToPresent = isToPresentProp === true || isToPresentProp === 1;
  var toDmy, toPrecision;

  if (isToPresent) {
    toDmy = Dmy.now();
  } else if (existsInData(data, "to")) {
    toDmy = new Dmy(parse_int_default()(getPropertyFromData(data, "to.year")), parse_int_default()(getPropertyFromData(data, "to.month")), parse_int_default()(getPropertyFromData(data, "to.day")));
    this.owner.getDmyFromInput(toDmy);
    toPrecision = parse_int_default()(getPropertyFromData(data, "to.precision"));
  } else {
    //if no end date is set and not to present, reuse start date
    toDmy = fromDmy;
    toPrecision = fromPrecision;
  }

  var from = Dmy.CreateAsStartOfPeriod(fromDmy, fromPrecision);
  var to = Dmy.CreateAsEndOfPeriod(toDmy, toPrecision);
  this.period = {
    from: from,
    to: to.getNextDay(),
    isToPresent: isToPresent
  }; // period years does not need to be accurate, it will be used only to compare length of the articles

  this.period.years = this.period.to.asFloat() - this.period.from.asFloat();
};

Article.prototype.setImage = function () {
  this.isImageInfoLoaded = true;

  if (getPropertyFromData(this.data, "imageUrl")) {
    this.owner.enqueueImageLoad(this);
  } else {
    this.image = null;
  }
};

Article.prototype.registerPosition = function (pos) {
  this.registeredPosition = this.position = pos;
};

Article.prototype.overlaps = function (other) {
  return other.period.from.isSame(this.period.from) && other.period.to.isSame(this.period.to) || other.period.from.isBetween(this.period.from, this.period.to) || other.period.to.isBetween(this.period.from, this.period.to) || this.period.from.isBetween(other.period.from, other.period.to) || this.period.to.isBetween(other.period.from, other.period.to);
};

Article.prototype.overlapsInclusiveWithDates = function (from, to) {
  return !(this.period.from.isAfter(to) || from.isAfter(this.period.to));
};

Article.prototype.overlapsInclusive = function (other) {
  return this.overlapsInclusiveWithDates(other.period.from, other.period.to);
};

Article.prototype.isInside = function (pos) {
  return this.isVisible && pos.left >= this.position.left && pos.left <= this.position.left + this._getWidth() && pos.top >= this.position.top && pos.top <= this.position.top + this.height;
}; // events


Article.prototype.addActivatedHandler = function (handler) {
  this.activatedHandlers.push(handler);
};

Article.prototype.activated = function () {
  for (var i = 0; i < this.activatedHandlers.length; i++) {
    this.activatedHandlers[i].call(this);
  }
};

Article.prototype.mouseover = function () {
  this.isMouseover = true; // Todo: Create 'ArticleMouseover' event
};

Article.prototype.mouseout = function () {
  this.isMouseover = false; // Todo: Create 'ArticleMouseout' event
}; // cursor


Article.prototype.updateIsMouseOverStar = function (pos) {
  var star = this.getStarBox();
  var oldState = this.isMouseOverStar;
  this.isMouseOverStar = pos.left >= star.left && pos.left <= star.left + star.width && pos.top >= star.top && pos.top <= star.top + star.height;
  if (this.isMouseOverStar != oldState && !this.owner.isAnimating) this.owner.redraw();
  return this.isMouseOverStar;
};

Article.prototype.getCursor = function (pos) {
  this.updateIsMouseOverStar(pos);
  if (!this.owner.options.article.draggable) return 'pointer'; //draggable article

  if (this.isActive) {
    return this.isMouseOverStar ? 'pointer' : 'move';
  }

  return 'pointer';
}; // returns true if event handled. false if caller should continue handling the event


Article.prototype.clicked = function (pos) {
  this.activated();
  this.updateIsMouseOverStar(pos);

  if (this.isMouseOverStar) {
    this.isStarred = !this.isStarred;
    return true;
  }

  return false;
}; // save


Article.prototype.getStatusForSave = function () {
  var state = {
    i: this.id
  }; // to keep it compact do not save zero values

  if (this.offset.left != 0) state.l = this.offset.left;
  if (this.offset.top != 0) state.t = this.offset.top;
  if (this.isStarred) state.v = true;
  return state;
};

Article.prototype.headerOverlapsWith = function (other) {
  var thisLeft = this.registeredPosition.left;
  var otherLeft = other.registeredPosition.left;

  var thisRight = thisLeft + this._getWidth();

  var otherRight = otherLeft + other._getWidth();

  return otherRight >= thisLeft && thisRight >= otherLeft;
};

Article.prototype._getWidth = function () {
  return this._getCurrentStyle().width;
};

Article.prototype.setOption = function (option, value) {
  var needsDefaultRedraw = false;

  if (typeof option === "string") {
    if (typeof value === 'undefined') {
      //return current value if none given
      var selectedOption = getPropertyFromData(this.data, option);
      return selectedOption;
    } //convert option string to object


    option = buildObjectFromPath(option, value);
  }

  $.extend(
  /* deep */
  true, this.data, option); //has id changed?

  if (existsInData(option, "id")) {
    this.id = option.id;
  } //has title changed?


  if (existsInData(option, "title")) {
    this.title = option.title;
    this.titleLines = undefined; //triggers recalc from this.title on next redraw
  } //has subtitle changed?


  if (existsInData(option, "subtitle")) {
    this.subtitle = option.subtitle;
    this.summarisedSubtitle = undefined; //trigger recalc from this.subtitle on next redraw
  } //has date changed?


  if (existsInData(option, "from") || existsInData(option, "to") || existsInData(option, "isToPresent")) {
    this._setupArticlePeriod(this.data);

    needsDefaultRedraw = true;
  } //has image changed?


  if (existsInData(option, "imageUrl")) {
    this.setImage();
  } //has rank changed?


  if (existsInData(option, "rank")) {
    this.rank = option.rank;
    needsDefaultRedraw = true;
  } //has star changed?


  if (existsInData(option, "starred")) {
    this.isStarred = option.starred;
  } //has hiddenByFilter changed?


  if (existsInData(option, "hiddenByFilter")) {
    this.hiddenByFilter = option.hiddenByFilter;
  } //has hidePeriodLine changed?


  if (existsInData(option, "hidePeriodLine")) {
    this.hidePeriodLine = option.hidePeriodLine;
  }

  var styleChanged = existsInData(option, "style");
  var activeStyleChanged = existsInData(option, "activeStyle");
  var hoverStyleChanged = existsInData(option, "hoverStyle");
  var timelineOptions = this.owner.options.article;
  var activeHoverStyleUpdated = false;

  if (styleChanged) {
    // root style changed so all styles need updating
    this.initialiseStyles(this.data);
  } else {
    if (hoverStyleChanged) {
      // final override for hoverStyle, no need to check defaults
      $.extend(true
      /*deep*/
      , this.hoverStyle, option.hoverStyle);
      this.activeHoverStyle = $.extend(true
      /*deep*/
      , {}, this.hoverStyle, timelineOptions.defaultActiveStyle, this.data.activeStyle);
      activeHoverStyleUpdated = true;
    }

    if (activeStyleChanged) {
      // final override for active & activeHover, no need to check defaults
      this.activeStyle = $.extend(true
      /*deep*/
      , this.activeStyle, option.activeStyle);

      if (!activeHoverStyleUpdated) {
        $.extend(true
        /*deep*/
        , this.activeHoverStyle, option.activeStyle);
      }
    }
  }

  if (needsDefaultRedraw) {
    this.owner.requestRedraw();
  } else {
    this.owner.requestRedraw(this.redraw);
  }
};

Article.prototype.initialiseStyles = function (data) {
  var articleOptions = this.owner.options.article;
  var style = $.extend(true
  /*deep*/
  , {}, articleOptions.defaultStyle, getPropertyFromData(data, "style") || {});
  var activeStyle = $.extend(true
  /*deep*/
  , {}, articleOptions.defaultActiveStyle, getPropertyFromData(data, "activeStyle") || {});
  var hoverStyle = $.extend(true
  /*deep*/
  , {}, articleOptions.defaultHoverStyle, getPropertyFromData(data, "hoverStyle"));
  this.style = style;
  this.activeStyle = $.extend(true
  /*deep*/
  , {}, style, activeStyle);
  this.hoverStyle = $.extend(true
  /*deep*/
  , {}, style, hoverStyle);
  this.activeHoverStyle = $.extend(true
  /*deep*/
  , {}, this.hoverStyle, activeStyle);
};

Article.prototype.setStyle = function (option, value) {
  if (typeof option === "string") {
    if (typeof value === "undefined") return getPropertyFromData(this.style, option);
    option = buildObjectFromPath(option, value);
  }

  this.data.style = $.extend(true, this.data.style || {}, option);
  this.initialiseStyles(this.data);
  this.owner.requestRedraw();
};

Article.prototype.setHoverStyle = function (option, value) {
  if (typeof option === "string") {
    if (typeof value === "undefined") return getPropertyFromData(this.activeStyle, option);
    option = buildObjectFromPath(option, value);
  }

  this.data.hoverStyle = $.extend(true, this.data.hoverStyle || {}, option); // hoverStyle overrides style, so no need to check defaults

  $.extend(true, this.hoverStyle, option);
  this.activeHoverStyle = $.extend(true, {}, this.hoverStyle, this.owner.options.article.defaultActiveStyle, this.data.activeStyle);
  this.owner.requestRedraw();
};

Article.prototype.setActiveStyle = function (option, value) {
  if (typeof option === "string") {
    if (typeof value === "undefined") return getPropertyFromData(this.activeStyle, option);
    option = buildObjectFromPath(option, value);
  }

  this.data.activeStyle = $.extend(true, this.data.activeStyle || {}, option); // overrides all other styles, so no need to check defaults

  $.extend(true, this.activeStyle, option);
  $.extend(true, this.activeHoverStyle, option);
  this.owner.requestRedraw();
};
// CONCATENATED MODULE: ./js/Article.data.js




var propertyAbbreviations = {
  "id": "i",
  "title": "t",
  "rank": "r",
  "subtitle": "s",
  "from.year": "fy",
  "from.month": "fm",
  "from.day": "fd",
  "from.precision": "fp",
  "to.year": "ty",
  "to.month": "tm",
  "to.day": "td",
  "to.precision": "tp",
  "isToPresent": "p",
  "isStarred": "v",
  "offset.left": "ol",
  "offset.top": "ot",
  "imageUrl": "m",
  "style": "st",
  "activeStyle": "ast",
  "hiddenByFilter": "h",
  "hidePeriodLine": "hp"
};

function extractProperty(data, property) {
  return data.hasOwnProperty(property) ? data[property] : data[propertyAbbreviations[property]];
}

function extractPropertyFromPath(data, path) {
  var pathParts = path.split("."); // pull each object in the path out sequentially and return it

  return reduce_default()(pathParts).call(pathParts, function (curr, next) {
    return curr ? curr[next] : undefined;
  }, data);
}

function isPath(property) {
  return index_of_default()(property).call(property, ".") > -1;
}

function getPropertyFromData(data, property) {
  if (isPath(property)) {
    return extractPropertyFromPath(data, property);
  }

  return extractProperty(data, property);
}
function existsInData(data, property) {
  if (isPath(property)) {
    return !utils_isUndefined(extractPropertyFromPath(data, property));
  }

  return data.hasOwnProperty(property);
}
defineValueOrFunctionProperty(Article.prototype, "hidePeriodLine");
defineValueOrFunctionProperty(Article.prototype, "hiddenByFilter");
// CONCATENATED MODULE: ./js/Timeline.base.js








 // todo: yuck



function Timeline(container, inputOptions) {
  var _context2;

  this.options = $.extend(
  /* deep */
  true, {}, DEFAULT_OPTIONS, inputOptions);

  if ($(container).is("canvas")) {
    this.canvas = $(container);
    this.options.width = this.canvas.width();
  } else {
    var _context;

    this.canvas = $(concat_default()(_context = "<canvas width='".concat(this.options.width, "' height='")).call(_context, this.options.height, "'/>"));
    $(container).append(this.canvas);
  }

  this.canvasContext = this.canvas[0].getContext("2d");
  this.width = this.options.width;
  this.top = this.options.height - this.options.verticalOffset; // reposition window to enable dragging, works with From 

  this.repositionWindow = 0; // id

  this.uniqueId = 'tl' + new Date().getTime(); // this can be removed? should we use reference instead here?

  this.title = "My timeline"; // info

  this.ownerId = undefined;
  this.isInPublicDirectory = false; // states

  this.cursor = 'default';
  this.mouseoverArticle = null;
  this.isDragging = false;
  this.draggingArticle = null;
  this.dragStartX = 0;
  this.isPanning = false;
  this.isPinching = false;
  this.isAnimating = false;
  this.isAnimatingArticles = false;
  this.isCustomAnimating = false;
  this.animation = {
    redrawFunction: false,
    defaultRedrawFunction: this.repositionRedraw,
    dragRedrawFunction: this.defaultRedraw,
    panDummy: $("<span/>")
  };
  this.lastAnimatingArticle = {
    id: null,
    endTime: 0
  };
  this.topRow = 0;
  this.loadingHttpRequests = [];
  this.articles = [];
  this.articleImageLoadQueue = [];
  this.redrawRequests = {
    default: false,
    reposition: false
  }; // events
  // todo: worth having different handlers for activated/onclick? confusing?
  // todo: activated/doubleclicked on Article as well?
  // todo: what do we want to pass to the handler functions? original event, and article?
  // todo: Timeline.dragging is in charge of triggering click event

  this.activatedHandlers = [];
  this.articleDoubleClickedHandlers = [];
  this.backgroundClickHandlers = [];
  this.redrawHandlers = [];

  if (this.options.onArticleClick) {
    this.addActivatedHandler(this.options.onArticleClick);
  }

  if (this.options.onArticleDoubleClick) {
    this.addArticleDoubleClickedHandlers(this.options.onArticleDoubleClick);
  }

  if (this.options.onBackgroundClick) {
    this.onBackgroundClick(this.options.onBackgroundClick);
  }

  if (this.options.onRedraw) {
    this.onRedraw(this.options.onRedraw);
  } // init


  var zoom = this.options.zoom,
      startDate = this.getDmyFromInput(new Dmy(this.options.initialDate));
  this.timescaleManager = new TimescaleManager_TimescaleManager(this, zoom);
  this.timescaleManager.setUnitLevels();
  this.timescaleManager.addZoomChangedHandler(this.zoomChanged, this);
  this.timescaleManager.setZoom(zoom.initial);
  this.timescaleManager.setStartDate(startDate);

  if (this.options.enableUserControl) {
    this.enableZoomByWheel();
    this.enableDragging();
  }

  this.groups = {
    level: -1,
    periods: []
  }; // setup article image load queue

  set_interval_default()(bind_default()(_context2 = this.loadArticleImageFromQueue).call(_context2, this), 5);

  this.requestRedraw();
}

Timeline.prototype.setTitle = function (title) {
  this.title = title;
  this.save();
  PubSub.publish(EVENTS.TIMELINE_TITLE_CHANGED, title);
};

Timeline.prototype.setIsInPublicDirectory = function (isInPublicDirectory) {
  this.isInPublicDirectory = isInPublicDirectory;
  this.save();
  PubSub.publish(EVENTS.TIMELINE_IS_IN_PUBLIC_DIRECTORY_CHANGED, isInPublicDirectory);
}; // functions


Timeline.prototype.getWidth = function () {
  return this.canvas[0].width;
};

Timeline.prototype.isInVicinity = function (event, vicinityParameters, relativePosition) {
  vicinityParameters = getValueOrFunctionResult(vicinityParameters, this, event, relativePosition);
  if (typeof vicinityParameters === 'boolean') return vicinityParameters;
  var pos = relativePosition || this.getRelativePosition(event);
  return pos.top > this.top - vicinityParameters.up && pos.top < this.top + vicinityParameters.down;
};

Timeline.prototype.getPixel = function (dmy, drawCycleContext) {
  var cache;
  var key = dmy.toKeyString();

  if (drawCycleContext) {
    cache = drawCycleContext.tokens;
    if (cache.hasOwnProperty(key)) return cache[key];
  } else {
    // TODO: remvoe when made sure it is always being called by a proper cache argument
    cache = {};
  }

  var width = this.getWidth();
  var x = this.repositionWindow;
  var token = this.timescaleManager.startToken;
  return cache[key] = this.timescaleManager.getPixelsBetween(token.value, dmy) + x;
}; // events


Timeline.prototype.addActivatedHandler = function (handler) {
  this.activatedHandlers.push(handler);
};

Timeline.prototype.activated = function (article) {
  if (article) {
    for (var i = 0; i < this.activatedHandlers.length; i++) {
      this.activatedHandlers[i].call(this, article);
    }
  }
}; // positioning


Timeline.prototype.getRelativePosition = function (event) {
  var screenPos = this.canvas.offset();
  var pagePos = extractPagePosition(event);
  return {
    left: pagePos.left - screenPos.left,
    top: pagePos.top - screenPos.top
  };
};

Timeline.prototype.getRelativeCoordinates = function (coords) {
  var screenPos = this.canvas.offset();
  return {
    x: coords.x - screenPos.left,
    y: coords.y - screenPos.top
  };
};

Timeline.prototype.getPagePosition = function (pos) {
  var screenPos = this.canvas.parent().position();
  return {
    left: pos.left + screenPos.left,
    top: pos.top + screenPos.top
  };
}; // cursor


Timeline.prototype.updateCursor = function (event) {
  var oldCursor = this.cursor;
  var newCursor = this.cursor = this.getCursor(event);

  if (oldCursor !== newCursor) {
    this.canvas.css("cursor", newCursor);
  }
};

Timeline.prototype.getCursor = function (event) {
  if (this.isDragging) return "e-resize";
  var pos = this.getRelativePosition(event);
  if (this.draggingArticle) return this.draggingArticle.getCursor(pos);
  if (!this.options.disableBranding && (this._isInsideHistropediaJSLink(pos) || this._isInsideTermsLink(pos))) return 'pointer';
  if (this.mouseoverArticle !== null) return this.mouseoverArticle.getCursor(pos);
  return 'default';
}; // Todo: reconcile all event handlers with generic timeline.on function


Timeline.prototype.doubleClicked = function (event) {
  var pos = this.getRelativePosition(event);

  for (var i = this.articles.length - 1; i >= 0; i--) {
    var article = this.articles[i];

    if (article.isInside(pos)) {
      this.articleDoubleClicked(article);
      return;
    }
  }
};

Timeline.prototype.addArticleDoubleClickedHandlers = function (handler) {
  this.articleDoubleClickedHandlers.push(handler);
};

Timeline.prototype.articleDoubleClicked = function (article) {
  for (var i = 0; i < this.articleDoubleClickedHandlers.length; i++) {
    this.articleDoubleClickedHandlers[i].call(this, article);
  }
};

Timeline.prototype.onBackgroundClick = function (handler) {
  this.backgroundClickHandlers.push(handler);
};

Timeline.prototype.backgroundClicked = function (event, isDoubleClick) {
  for (var i = 0; i < this.backgroundClickHandlers.length; i++) {
    this.backgroundClickHandlers[i].call(this, event, isDoubleClick);
  }
};

Timeline.prototype.onRedraw = function (handler) {
  this.redrawHandlers.push(handler);
};

Timeline.prototype.zoomChanged = function () {
  var oldRegionId;
  if (this.currentDensitySetting) oldRegionId = this.currentDensitySetting.region;
  this.updateCurrentDensitySetting();

  if (oldRegionId !== this.currentDensitySetting.region) {
    this.updateArticlesGroupIndex();
  }
};

Timeline.prototype.updateCurrentDensitySetting = function () {
  for (var i = 0; i < DENSITY_SETTINGS.length; i++) {
    var densitySetting = DENSITY_SETTINGS[i];

    if (this.timescaleManager.zoom >= densitySetting.zoom.from && this.timescaleManager.zoom < densitySetting.zoom.to) {
      this.currentDensitySetting = densitySetting;
      break;
    }
  }
};

Timeline.prototype.calculateEndToken = function () {
  var width = this.getWidth();
  var x = this.repositionWindow;
  var startToken = this.timescaleManager.startToken;
  var token = startToken;
  var endToken;

  do {
    endToken = token;
    token = this.timescaleManager.getNext(token);
    x += token.length;
  } while (x < width);

  return endToken;
};

Timeline.prototype.getDensityPick = function () {
  // density is currently controlled through the same user control as event spacing for #27164 @ 27/01/2015 
  switch (this.options.article.density) {
    case DENSITY_LOW:
      return this.currentDensitySetting.low;

    case DENSITY_MEDIUM:
      return this.currentDensitySetting.medium;

    case DENSITY_HIGH:
      return this.currentDensitySetting.high;

    case DENSITY_ALL:
      return this.currentDensitySetting.all;
  }

  console.error('Unknown density selector:' + val);
};

Timeline.prototype.invoke = function (method, callbacks, params) {
  if (callbacks.hasOwnProperty(method)) {
    callbacks[method].call(this, params);
  }
};

Timeline.prototype.forLoadedArticles = function (f) {
  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];

    if (article.isDataLoaded) {
      f.call(this, article);
    }
  }
};

Timeline.prototype.forVisibleArticles = function (f) {
  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];

    if (article.isDataLoaded && article.isVisible) {
      f.call(this, article);
    }
  }
};

Timeline.prototype.forInRangeArticles = function (f) {
  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];

    if (article.isDataLoaded && (article.isInRange || article.isFading)) {
      // "|| article.isFading" is a bit of a hack to solve issues with articles that are fading OUT at the edges of the screen stopping moving with the timeline. They are not in range, but do need repositioning to finish scrolling off the screen. This will be solved properly automatically once we are only drawing event cards that are in view.
      f.call(this, article);
    }
  }
}; //add enqueueImageLoad


Timeline.prototype.enqueueImageLoad = function (article) {
  this.articleImageLoadQueue.push(article);
};

Timeline.prototype.loadArticleImageFromQueue = function () {
  var article = this.articleImageLoadQueue.pop();

  if (article) {
    article.image = new Image();

    article.image.onload = function () {
      article.adjustHeightFromLoadedImage();
      article.imageLoaded = true;
      article.owner.requestRedraw(this.redraw);
    };

    article.image.src = getPropertyFromData(article.data, "imageUrl");
  }
};

Timeline.prototype.setStartDate = function (dmy, pixelOffset) {
  //pixelOffset lets you adjust the screen position of the specifed start date
  var pixelOffset = pixelOffset || 0; //default date position is left edge of canvas
  // todo: move string conversion to getDmyFromInput

  if (typeof dmy === "string") {
    dmy = Dmy.fromString(dmy);
  }

  dmy = this.getDmyFromInput(dmy);
  var dateFraction = this.timescaleManager.setStartDate(dmy);
  this.repositionWindow = dateFraction;
  if (pixelOffset) this.updateFromByPixels(-pixelOffset);
  this.requestRedraw();
};

Timeline.prototype.setCentreDate = function (dmy, pixelOffset) {
  this.setStartDate(dmy, this.options.width / 2 + pixelOffset);
};

Timeline.prototype.setOption = function (option, value) {
  if (typeof option === "string") {
    var selectedOption = getPropertyFromData(this.options, option);

    if (typeof value === 'undefined') {
      //return current value if none given
      return selectedOption;
    } //build object so that check for special cases (e.g. when width changes) is same for string or object input 


    option = buildObjectFromPath(option, value);
  }

  $.extend(
  /* deep */
  true, this.options, option); //has width or height changed?

  if (option.width || option.height) {
    this.setSize(this.options.width, this.options.height);
  } //has verticalOffset has changed?


  if (typeof option.verticalOffset === 'number') {
    //need to allow 0 as possible value
    this.top = this.options.height - this.options.verticalOffset;
  }

  var styleChanged = existsInData(option, "article.defaultStyle"),
      activeStyleChanged = existsInData(option, "article.defaultActiveStyle"),
      hoverStyleChanged = existsInData(option, "article.defaultHoverStyle");

  if (styleChanged || activeStyleChanged || hoverStyleChanged) {
    this.forLoadedArticles(function (article) {
      article.initialiseStyles(article.data);
      article.titleLines = undefined; //todo: only need to update titleLines if header text margin,font or no. of lines changes

      article.summarisedSubtitle = undefined; //todo: onnly update if subheader text margin or font changes
    });
  }

  this.requestRedraw();
};

Timeline.prototype.setSize = function (width, height) {
  this.canvas[0].height = this.options.width = height;
  this.canvas[0].width = this.width = this.options.width = width;
  this.top = height - this.options.verticalOffset;
  this.requestRedraw();
};

Timeline.prototype.generateDensitySettings = function () {
  //Generate density settings from current zoom ratio. Run at startup if we allow zoom ratio change
  var zoomRatio = this.timescaleManager.zoomOptions.ratio;
  console.log(this.timescaleManager);
  var newSettings = [];
  var halfZoom = Math.round(Math.log(0.5) / Math.log(zoomRatio) * 100) / 100; //the difference in zoom level that will HALF the unit size (i.e. halfZoom can be added to any zoom level to half the size of any time period )

  for (var i = 0; i < 19; i++) {
    // for 19 regions, can be changed (or could easily be made to stop automatically when zoom maximum has been reached)
    var nextRegion = {
      region: i + 1,
      zoom: {
        from: i * halfZoom,
        to: (i + 1) * halfZoom
      },
      low: 1,
      medium: 2,
      high: 3,
      all: 25,
      step: {
        months: 0,
        days: Math.pow(2, i)
      }
    };
    newSettings.push(nextRegion);
  }

  console.log(stringify_default()(newSettings));
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/map.js
var map = __webpack_require__(46);
var map_default = /*#__PURE__*/__webpack_require__.n(map);

// CONCATENATED MODULE: ./js/Timeline.groups.js






Timeline.prototype.updateArticlesGroupIndex = function () {
  this.forLoadedArticles(function (article) {
    article.groupIndex = this.calculateGroupIndex(article.period.from);
  });
};

Timeline.prototype.updateVisibleArticlesOfGroups = function (drawCycleContext) {
  // TODO: only groups that newly come into view should be updated
  this.groups = {}; //When range = "all", we need to go more groups either side to keep stacking & period line visibility as stable as possible 
  //20 groups seems like a good trade off between stacking stability and performance

  var groupIndexExtension = this.options.article.autoStacking.range == RANGE_SCREEN ? 1 : 20;
  var leftmostGroupIndex = this.calculateGroupIndex(drawCycleContext.tokens.start) - groupIndexExtension;
  var rightmostGroupIndex = this.calculateGroupIndex(drawCycleContext.tokens.end) + groupIndexExtension;
  this.forLoadedArticles(function (article) {
    article.isVisibleInGroup = false;
  });

  for (var index = leftmostGroupIndex; index <= rightmostGroupIndex; index++) {
    var _context;

    this.groups[index] = map_default()(_context = this.getArticlesInGroup(index, leftmostGroupIndex, rightmostGroupIndex)).call(_context, function (a) {
      a.isVisibleInGroup = true;
      return a.id;
    });
  }
};

var STARRED_INCREASE_CONSTANT = 10000000;
var ACTIVE_INCREASE_CONSTANT = 20000000;

Timeline.prototype.getArticlesInGroup = function (index, leftmostGroupIndex, rightmostGroupIndex) {
  function getArticleEffectiveRank(article) {
    var effectiveRank = article.rank;

    if (article.isActive) {
      effectiveRank += ACTIVE_INCREASE_CONSTANT;
    } else {
      // don't need to increase twice if active AND starred
      if (article.isStarred) {
        effectiveRank += STARRED_INCREASE_CONSTANT;
      }
    }

    return effectiveRank;
  }

  var pick = this.getDensityPick();
  var topArticles = [];
  var minRankIndex = 0;

  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];
    if (!article.isDataLoaded || article.isHiddenByFilter) //don't include filtered articles in group count
      continue;
    var belongsToThisGroup = utils_bind(article.groupIndex, leftmostGroupIndex, rightmostGroupIndex) === index;
    if (!belongsToThisGroup) continue;
    article.effectiveRank = getArticleEffectiveRank(article); // initial filling of topArticles array

    if (topArticles.length < pick) {
      topArticles.push(article); // maintain the position of minRankIndex

      if (article.effectiveRank < topArticles[minRankIndex].effectiveRank) minRankIndex = topArticles.length - 1;
      continue;
    } // if article.rank is greater than any of the ranks in topArticles replace smallest value with the article


    if (article.effectiveRank > topArticles[minRankIndex].effectiveRank) {
      topArticles[minRankIndex] = article; // minRankIndex is now possibly changed

      minRankIndex = findMinIndex(topArticles, 'effectiveRank');
    }
  }

  return topArticles;
};

Timeline.prototype.calculateGroupIndex = function (date) {
  if (this.timescaleManager.unit >= ZOOM_MONTH && this.currentDensitySetting.step.months !== 0) {
    var g = date.year * 12 + (date.month - 1);
    return Math.floor(g / this.currentDensitySetting.step.months);
  } // ZOOM_DAY


  var g = date.year * 372 + (date.month - 1) * 31 + date.day;

  if (this.currentDensitySetting.step.days === 0) {
    return Math.floor(g / (this.currentDensitySetting.step.months * 30));
  }

  return Math.floor(g / this.currentDensitySetting.step.days);
}; // TODO: remove


Timeline.prototype.canBeVisibleInGroup = function (article, startToken, endToken) {
  var _context2;

  if (article.isActive) return true;
  startToken = startToken || this.timescaleManager.startToken;
  endToken = endToken || this.calculateEndToken();
  var leftmostGroupIndex = this.calculateGroupIndex(startToken.value) - 1;
  var rightmostGroupIndex = this.calculateGroupIndex(endToken.value) + 1;
  var effectiveArticleGroupIndex = utils_bind(article.groupIndex, leftmostGroupIndex, rightmostGroupIndex);
  if (!this.groups.hasOwnProperty(effectiveArticleGroupIndex)) return false;
  return index_of_default()(_context2 = this.groups[effectiveArticleGroupIndex]).call(_context2, article.id) >= 0;
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/date/now.js
var date_now = __webpack_require__(99);
var now_default = /*#__PURE__*/__webpack_require__.n(date_now);

// CONCATENATED MODULE: ./js/Timeline.branding.js



var Timeline_branding_context2;



var LOGO_LEFT_MARGIN = 5;
var LOGO_BOTTOM_MARGIN = 5;
var LOGO_HEIGHT = 34;
var LOGO_WIDTH = 130;

var LOGO_BASE_64_IMAGE = __webpack_require__(223);

var LOGO_SRC_URL = "data:image/png;base64,".concat(LOGO_BASE_64_IMAGE);

Timeline.prototype._drawBranding = function (ctx) {
  this._drawLogo(ctx);

  this._drawCopyrightLinks(ctx);
};

Timeline.prototype._drawLogo = function (ctx) {
  if (utils_isUndefined(this.logo)) {
    var _context;

    this.logo = new Image();
    this.logo.onload = bind_default()(_context = this._drawLogoImage).call(_context, this, ctx);
    this.logo.src = LOGO_SRC_URL;
  } else {
    this._drawLogoImage(ctx);
  }
};

Timeline.prototype._drawLogoImage = function (ctx, top) {
  ctx.drawImage(this.logo, LOGO_LEFT_MARGIN, this.top - Math.floor(this.options.style.mainLine.size / 2) - LOGO_HEIGHT - LOGO_BOTTOM_MARGIN);
};

var LINKS_WIDTH = 100;
var LINKS_HEIGHT = 18;
var LINKS_RIGHT_MARGIN = 3;
var LINKS_BOTTOM_MARGIN = 3;
var LINKS_PADDING_X = 10;
var LINKS_PADDING_Y = 1;
var LINKS_FONT_SIZE = 10;
var LINKS_HISTROPEDIAJS_TEXT = "HistropediaJS";
var LINKS_HISTROPEDIAJS_WIDTH = 63;
var LINKS_TERMS_TEXT = "Terms";
var LINKS_TERMS_WIDTH = 27;
var LINKS_SEPARATOR_WIDTH = 10;

var LINKS_TEXT = concat_default()(Timeline_branding_context2 = "".concat(LINKS_HISTROPEDIAJS_TEXT, " | ")).call(Timeline_branding_context2, LINKS_TERMS_TEXT);

var LINKS_TEXT_STYLING = {
  textBaseline: "middle",
  fillStyle: "#000000",
  font: "normal ".concat(LINKS_FONT_SIZE, "px \"Helvetica Neue\", Helvetica, Arial, sans-serif")
};

Timeline.prototype._drawCopyrightLinks = function (ctx) {
  // draw background
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(this.width - LINKS_WIDTH - LINKS_RIGHT_MARGIN - LINKS_PADDING_X * 2, this.top - Math.floor(this.options.style.mainLine.size / 2) - LINKS_HEIGHT - LINKS_BOTTOM_MARGIN - LINKS_PADDING_Y * 2, LINKS_WIDTH + LINKS_PADDING_X * 2, LINKS_HEIGHT + LINKS_PADDING_Y * 2); // draw text

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.font = "normal ".concat(LINKS_FONT_SIZE, "px \"Helvetica Neue\", Helvetica, Arial, sans-serif");

  var textCoords = this._getBrandingTextCoords();

  ctx.fillText(LINKS_TEXT, textCoords.left, textCoords.top, LINKS_WIDTH + LINKS_PADDING_X);
};

Timeline.prototype._getBrandingTextCoords = function () {
  return {
    left: this.width - LINKS_WIDTH - LINKS_RIGHT_MARGIN - LINKS_PADDING_X,
    top: this.top - Math.floor(this.options.style.mainLine.size / 2) - LINKS_HEIGHT - LINKS_BOTTOM_MARGIN + LINKS_FONT_SIZE - LINKS_PADDING_Y
  };
};

Timeline.prototype._isInsideHistropediaJSLink = function (pos) {
  var textCoords = this._getBrandingTextCoords();

  return isInside(pos, {
    left: textCoords.left,
    top: textCoords.top - LINKS_FONT_SIZE / 2,
    width: LINKS_HISTROPEDIAJS_WIDTH,
    height: LINKS_FONT_SIZE
  });
};

Timeline.prototype._isInsideTermsLink = function (pos) {
  var textCoords = this._getBrandingTextCoords();

  return isInside(pos, {
    left: textCoords.left + LINKS_HISTROPEDIAJS_WIDTH + LINKS_SEPARATOR_WIDTH,
    top: textCoords.top - LINKS_FONT_SIZE / 2,
    width: LINKS_TERMS_WIDTH,
    height: LINKS_FONT_SIZE
  });
};

function handleHistropediaJSLinkClick() {
  window.open('https://js.histropedia.com', '_blank');
}
function handleTermsLinkClick() {
  window.open('https://js.histropedia.com/licence.html', '_blank');
}

function measureTextWithStyling(ctx, text, textStyling) {
  var prevTextBaseline = ctx.textBaseline;
  var prevFillStyle = ctx.fillStyle;
  var prevFont = ctx.font;
  ctx.textBaseline = textStyling.textBaseline;
  ctx.fillStyle = textStyling.fillStyle;
  ctx.font = textStyling.font;
  var result = ctx.measureText(text); // text measuring without affecting previous state - don't want side effects

  ctx.textBaseline = prevTextBaseline;
  ctx.fillStyle = prevFillStyle;
  ctx.font = prevFont;
  return result;
}

function isInside(pos, rectangle) {
  return pos.left >= rectangle.left && pos.left <= rectangle.left + rectangle.width && pos.top >= rectangle.top && pos.top <= rectangle.top + rectangle.height;
}
// CONCATENATED MODULE: ./js/Timeline.dragging.js





Timeline.prototype.enableDragging = function () {
  var me = this;
  var mousedown = {
    relativePos: null,
    //to check if mouse movement is within click tolerance on mouseup
    pagePos: null,
    //to check if timeline drag should include article stacking (small movements don't re-stack articles for UX)
    time: 0,
    isDoubleClick: false,
    isArticleClick: false,
    isArticleDoubleClick: false,
    isTermsClick: false,
    isHjsClick: false,
    article: null
  };
  var pinch = {
    initial: {
      distance: 0,
      zoom: 0
    },
    centre: {},
    scale: 1
  };

  function isMousemoveWithinTolerance(mousedownPos, mouseupPos) {
    //check if click should register on mouseup. Todo: move to utils.js?
    var mouseMoveClickTolerance = 2; //number of pixels you can move in x or y and still register a click

    return !(Math.abs(mousedownPos.left - mouseupPos.left) > mouseMoveClickTolerance || Math.abs(mousedownPos.top - mouseupPos.top) > mouseMoveClickTolerance);
  }

  function mousedownHandler(event) {
    clearSelection(); //clear any selected text on the page

    event.preventDefault();

    if (event.originalEvent.touches && event.originalEvent.touches.length > 1) {
      //if multi-touch event
      pinchstartHandler(event);
      return;
    }

    var relativePos = mousedown.relativePos = me.getRelativePosition(event);

    if (!me.options.disableBranding) {
      mousedown.isHjsClick = me._isInsideHistropediaJSLink(relativePos);
      mousedown.isTermsClick = me._isInsideTermsLink(relativePos);
    } //is it a double click?


    var now = now_default()();

    if (now - mousedown.time < 500) {
      //todo: set double click speed in options
      mousedown.isDoubleClick = true;
    }

    mousedown.time = now; //reset for next click

    if (!(mousedown.isHjsClick || mousedown.isTermsClick)) {
      //if click not on terms/hjs links
      // is mouse click on an article?
      for (var i = me.articles.length - 1; i >= 0; i--) {
        // in reverse order because of the way draw works, the last item is topmost
        var article = me.articles[i];

        if (article.isVisible && article.isInside(relativePos)) {
          //click is on an article...
          //is it a double click on same article?
          if (mousedown.isDoubleClick && mousedown.article !== null && article.id === mousedown.article.id) {
            //todo: set double click speed in options
            mousedown.isArticleDoubleClick = true;
          } //set article click details


          mousedown.isArticleClick = true;
          mousedown.article = article; //start article dragging if it's active

          if (article.isActive && me.options.article.draggable) {
            me.draggingArticle = article;
            article.startDragging(relativePos);
            return;
          }

          break; //go on to start dragging the timeline now clicked article has been found
        }
      }
    }

    if (me.draggingArticle === null && me.isInVicinity(event, me.options.draggingVicinity, relativePos)) {
      me.startDragging(event);
    }
  }

  function mouseupHandler(event) {
    if (me.isPinching && event.originalEvent.touches.length < 2) {
      //if mouseup ends pinch
      if (event.originalEvent.touches[0]) {
        //if one finger remains, dragging is started from current X position
        me.dragStartX = event.originalEvent.touches[0].pageX;
      }

      me.isPinching = false;
      return;
    }

    var relativePos = me.getRelativePosition(event);

    if (mousedown.relativePos !== null && isMousemoveWithinTolerance(mousedown.relativePos, relativePos)) {
      if (mousedown.isHjsClick) {
        handleHistropediaJSLinkClick();
        mousedown.isHjsClick = false;
      } else if (mousedown.isTermsClick) {
        handleTermsLinkClick();
        mousedown.isHjsClick = false;
      } else if (mousedown.isArticleClick) {
        me.bringFront(mousedown.article.id); //select the article that was first clicked on

        var starClick = mousedown.article.clicked(mousedown.relativePos);
        me.canvas.css('cursor', mousedown.article.getCursor(relativePos)); //update cursor when clicked article becomes active

        mousedown.isArticleClick = false;

        if (mousedown.isArticleDoubleClick) {
          //fire double click on article
          me.articleDoubleClicked(mousedown.article);
          mousedown.isArticleDoubleClick = false;
        }
      } else {
        //is click on background
        me.backgroundClicked(event, mousedown.isDoubleClick);
      }

      mousedown.isDoubleClick = false; //reset AFTER isArticleClick and isBackgroundClick else-if blocks
    }

    if (me.draggingArticle !== null) {
      me.draggingArticle.stopDragging();
      me.draggingArticle = null;
    } else if (me.isDragging) {
      me.endDragging();
    }

    me.redraw();
  }

  function mousemoveHandler(event) {
    if (me.isPinching) {
      var zoomRatio = me.timescaleManager.zoomOptions.ratio;
      var previousCentreX = pinch.centre.x;
      pinch.centre = me.getRelativeCoordinates(extractPinchCentre(event));
      pinch.scale = getTouchDistance(event) / pinch.initial.distance;
      var zoomChange = Math.log(pinch.scale) / Math.log(zoomRatio);
      var deltaX = previousCentreX - pinch.centre.x; //change since last processed mousemove event

      me.setZoomByPivotPixel(pinch.initial.zoom + zoomChange, pinch.centre.x, deltaX);
    } else if (me.isDragging) {
      me.doDrag(event);
    } else if (me.draggingArticle !== null) {
      var relativePos = me.getRelativePosition(event);
      me.draggingArticle.dragging(relativePos);
    } else if (event.originalEvent.type === "mousemove") {
      // Check mouseover article, skip for touchmove event
      me.updateMouseoverArticle(event);
    } // Update cursor now all states are up to date


    if (me.options.enableCursor) me.updateCursor(event);
  }

  function pinchstartHandler(event) {
    if (!event.originalEvent.touches || event.originalEvent.touches.length < 2) return;
    pinch.centre = me.getRelativeCoordinates(extractPinchCentre(event));
    pinch.initial.distance = getTouchDistance(event);
    pinch.initial.zoom = me.timescaleManager.zoom;
    me.isPinching = true;
    me.startAnimation();
  }

  this.canvas.on('mousedown touchstart', mousedownHandler);
  $(document).on('mouseup touchend', mouseupHandler);
  $(document).on('mousemove touchmove', mousemoveHandler);
};

Timeline.prototype.startDragging = function (event) {
  this.isDragging = true;
  var pagePos = this.dragOrigin = extractPagePosition(event);
  this.dragStartX = pagePos.left;
  this.dragStartY = pagePos.top; // Animation started if needed on first dragging mousemove event
  // Otherwise animation is always on when mouse is down, even when no movement occurs
};

Timeline.prototype.endDragging = function (event) {
  this.isDragging = false;
};

Timeline.prototype.doDrag = function (event) {
  // Todo: Check for isPanning should be in pan animation step.
  // To do that, only set isDragging=true when mouse moves instead of 
  // immediately on mousedown.
  // Otherwise a click on the timeline can't trigger pan, it will get
  // cancelled immediately on the check for isDragging.
  if (this.isPanning) this.animation.panDummy.stop(); // change start token

  var pagePos = extractPagePosition(event);
  var moveInPixelsX = this.dragStartX - pagePos.left;
  var moveInPixelsY = this.dragStartY - pagePos.top;
  var absMoveFromOriginX = Math.abs(this.dragOrigin.left - pagePos.left);
  this.dragStartX = pagePos.left; // We only start animation on first mousemove event

  if (!this.isAnimating) this.startAnimation(); // 30px movement allowed without causing restacking on doDrag

  if (absMoveFromOriginX > 30) this.animation.dragRedrawFunction = this.defaultRedraw;
  this.updateFromByPixels(moveInPixelsX);
}; // pixels: pixels to move to left (use negative to move to right)


Timeline.prototype.updateFromByPixels = function (pixels) {
  this.repositionWindow -= pixels; // tokens

  var start = this.timescaleManager.startToken;
  var prev = this.timescaleManager.getPrevious(start); // reposition behind previous token

  while (this.repositionWindow >= prev.length) {
    this.repositionWindow -= prev.length;
    start = prev;
    prev = this.timescaleManager.getPrevious(start);
  } // reposition ahead of start


  while (-this.repositionWindow >= start.length) {
    this.repositionWindow += start.length;
    start = this.timescaleManager.getNext(start);
  }

  this.timescaleManager.setStartToken(start);
};

Timeline.prototype.updateMouseoverArticle = function (event) {
  var articles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.articles;
  var relativePos = this.getRelativePosition(event);
  var oldMouseoverArticle = this.mouseoverArticle;
  var newMouseoverArticle = null;

  for (var i = articles.length - 1; i >= 0; i--) {
    var article = articles[i]; // Todo: Use isCardInView to filter for visible event cards only

    if (article.isVisible && article.isInside(relativePos)) {
      newMouseoverArticle = article;
      break;
    }
  }

  this.mouseoverArticle = newMouseoverArticle;

  if (oldMouseoverArticle !== newMouseoverArticle) {
    if (oldMouseoverArticle !== null) oldMouseoverArticle.mouseout();
    if (newMouseoverArticle !== null) newMouseoverArticle.mouseover();
    this.requestRedraw(this.redraw);
  }
};
// CONCATENATED MODULE: ./js/Article.anim.js




Article.prototype.updateVisibility = function () {
  var oldVisibility = this.isVisibleAfterFade;
  var newVisibility = this.isInRange && this.isVisibleInGroup && this.isVisibleInRows && !this.isHiddenByFilter;
  if (oldVisibility == newVisibility) return;

  if (newVisibility && !this.isImageInfoLoaded) {
    this.setImage(); //only load image the first time article becomes visible
  } //If fade animation is OFF, set visibility straight away


  if (!this.owner.options.article.animation.fade.active) {
    this.setVisibility(newVisibility);
    return;
  } //else


  this.setVisibilityWithFade(newVisibility);
};

Article.prototype.setVisibility = function (visibility) {
  this.isVisible = this.isVisibleAfterFade = this.opacity = visibility; //Keep track of article.opacity and this.isVisibleAfterFade, so fade animation works correctly if turned on
};

Article.prototype.setVisibilityWithFade = function (visibility
/* true or false */
) {
  var me = this;
  if (visibility == me.isVisibleAfterFade) return; //if (!me.isInView) return me.setVisibility(visibility);

  if (me.isFading) me.fadeAnimation.dummyElement.stop();
  me.isFading = true; //set isVisible immediately for fading in, but wait till end of animation when fading out

  if (visibility) me.isVisible = true;
  var fadeAnimation = this.fadeAnimation;
  me.isVisibleAfterFade = fadeAnimation.finalOpacity = visibility; //store so we can check animation direction later

  me.owner.notifyArticleAnimating('fade', me.id);
  var settings = me.owner.options.article.animation.fade;
  fadeAnimation.dummyElement = fadeAnimation.dummyElement || $("<span />");
  fadeAnimation.dummyElement.css("left", me.opacity);
  var finalOpacity = {
    left: fadeAnimation.finalOpacity
  };
  var animationOptions = {
    duration: settings.duration,
    easing: settings.easing,
    step: function step(now, fx) {
      me.opacity = now;
    },
    complete: function complete() {
      me.isFading = false; //When fading OUT, set isVisible at end of animation (so it's still drawn during fade out)

      if (visibility == 0) me.isVisible = false;
      var lastAnimatingArticle = me.owner.lastAnimatingArticle;

      if (me.id === lastAnimatingArticle.id && lastAnimatingArticle.animationType === 'fade') {
        me.owner.isAnimatingArticles = false;
      }
    }
  };
  fadeAnimation.dummyElement.animate(finalOpacity, animationOptions);
};

Article.prototype.moveToOffset = function (destination) {
  this.finalOffset.top = this.offset.top = destination.top || this.offset.top;
  this.finalOffset.left = this.offset.left = destination.left || this.offset.left;
  this.position.top = this.registeredPosition.top + this.offset.top; //set position so that normal redraw updates to show new position (as opposed to defaultRedraw, which will update pos from offset )

  this.position.left = this.registeredPosition.left + this.offset.left;
};

Article.prototype.moveTo = function (destination) {
  var finalOffset = {
    left: destination.left - this.registeredPosition.left,
    top: destination.top - this.registeredPosition.top
  };
  this.moveToOffset(finalOffset);
};

Article.prototype.moveToWithAnim = function (destination) {
  var finalOffset = {
    left: destination.left - this.registeredPosition.left,
    top: destination.top - this.registeredPosition.top
  };
  this.moveToOffsetWithAnim(finalOffset); //no redraw at end of anim, as this will make the article jump back to stacked position if autoStacking is active
};

Article.prototype.moveToOffsetWithAnim = function (destination) {
  var me = this;
  var moveAnimation = me.moveAnimation;
  if (destination.top == moveAnimation.finalOffset.top && destination.left == moveAnimation.finalOffset.left) return;
  moveAnimation.finalOffset = this.finalOffset = {
    left: destination.left,
    top: destination.top
  };
  if (me.isMoving) moveAnimation.dummyElement.stop();
  me.isMoving = true;
  me.owner.notifyArticleAnimating('move', me.id);
  var settings = me.owner.options.article.animation.move;
  var dummy = moveAnimation.dummyElement = moveAnimation.dummyElement || $("<span />");
  moveAnimation.dummyElement.css("top", me.offset.top).css("left", me.offset.left);
  var finalPos = {
    top: destination.top,
    left: destination.left
  };
  var animationOptions = {
    duration: settings.duration,
    easing: settings.easing,
    step: function step(now, fx) {
      me.offset.top = parse_int_default()(dummy.css("top"));
      me.offset.left = parse_int_default()(dummy.css("left"));
      me.position.top = me.registeredPosition.top + me.offset.top;
      me.position.left = me.registeredPosition.left + me.offset.left;
    },
    complete: function complete() {
      me.isMoving = false;
      var lastAnimatingArticle = me.owner.lastAnimatingArticle;

      if (me.id === lastAnimatingArticle.id && lastAnimatingArticle.animationType === 'move') {
        me.owner.isAnimatingArticles = false;
      }
    }
  };
  dummy.animate(finalPos, animationOptions);
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/fill.js
var fill = __webpack_require__(27);
var fill_default = /*#__PURE__*/__webpack_require__.n(fill);

// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/trim.js
var trim = __webpack_require__(100);
var trim_default = /*#__PURE__*/__webpack_require__.n(trim);

// CONCATENATED MODULE: ./js/utils.drawing.js


function noShadow(context) {
  context.shadowBlur = 0.0;
  context.shadowOffsetX = 0.0;
  context.shadowOffsetY = 0.0;
  context.shadowColor = "transparent black"; // disable shadow
}
function wrapText(context, text, width) {
  var lines = [];
  var words = text.split(/ /);
  var line = "";

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n];
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;

    if (testWidth <= width) {
      line += words[n] + " ";
    } else if (testLine.split(/ /).length === 1) {
      line += words[n].substr(0, 12) + "... \n";
    } else {
      lines.push(line);
      line = "";
      n--;
    }
  }

  if (line != "") lines.push(line);
  return lines;
}
function summarize(context, text, width) {
  var shortText = text;
  var lastChar = text.length - 1;

  while (context.measureText(shortText).width > width) {
    shortText = text.substr(0, lastChar) + '…';
    lastChar--;
  }

  return shortText;
}
function topRoundRectPath(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  if (radius > 0) ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  if (radius > 0) ctx.quadraticCurveTo(x, y, x + radius, y);
  if (radius == 0) ctx.closePath();
}
function drawStar(ctx, cx, cy, spikes, r0, r1, fillColour, strokeColour) {
  ctx.beginPath();
  var angle = Math.PI / spikes;

  for (var i = 0; i < 2 * spikes; i++) {
    var r = (i & 1) == 0 ? r1 : r0;
    var currX = cx + Math.cos(1 + i * angle) * r;
    var currY = cy + Math.sin(1 + i * angle) * r;

    if (i == 0) {
      ctx.moveTo(currX, currY);
    } else {
      ctx.lineTo(currX, currY);
    }
  }

  ctx.closePath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = strokeColour;
  ctx.fillStyle = fillColour;
  ctx.stroke();

  fill_default()(ctx).call(ctx);
}
function squeezeEllipsis(context, text, width) {
  text = trim_default()(text).call(text);
  var shortText = text + '…';
  var lastChar = text.length - 1;

  while (context.measureText(shortText).width > width) {
    shortText = text.substr(0, lastChar) + '…';
    lastChar--;
  }

  return shortText;
}
function getTextOrigin(left, width, textAlign, margin) {
  var textOriginX;

  switch (textAlign) {
    case 'left':
      textOriginX = left + margin;
      break;

    case 'center':
      textOriginX = left + Math.floor(width / 2);
      break;

    case 'right':
      textOriginX = left + width - margin;

    default:
      left + margin;
  }

  return textOriginX;
}
// CONCATENATED MODULE: ./js/Article.draw.js





Article.prototype.draw = function (ctx) {
  if (!this.isDataLoaded || isNaN(this.position.left)) return;
  ctx.globalAlpha = this.opacity;

  var style = this._getCurrentStyle(); // the outer rectangle
  // used to draw shadow, border, title background, star


  var outerSpace = {
    // always draw on the rounded pixel to avoid misplaced images and shadows due to floating point calulation
    top: Math.floor(this.position.top),
    left: Math.floor(this.position.left),
    width: this._getWidth(),
    height: this.height // height is set already based on options and image loaded height by this.adjustHeightFromLoadedImage()

  }; // the inner rectangle
  // used to draw title text, subtitle text, subtitle background, subtitle triangle, image

  var innerSpace = {
    left: outerSpace.left + style.border.width / 2,
    top: outerSpace.top + style.border.width / 2,
    width: outerSpace.width - style.border.width,
    height: outerSpace.height - style.border.width
  };

  if (style.shadow) {
    ctx.shadowOffsetX = style.shadow.x;
    ctx.shadowOffsetY = style.shadow.y;
    ctx.shadowBlur = style.shadow.amount;
    ctx.shadowColor = style.shadow.color;
    ctx.fillStyle = '#fff'; // starting just below the curve radius to avoid white colour behind the curve (we want it transparent)

    ctx.fillRect(outerSpace.left, outerSpace.top + style.topRadius, outerSpace.width, outerSpace.height - style.topRadius);
    noShadow(ctx);
  } // main title background
  // we make use pos rather than innerSpace here since we want smooth edges with the border -
  // we do this by drawing the title background LARGER than the actual innerSpace
  // the border then draws over this


  ctx.save();
  ctx.beginPath();
  topRoundRectPath(ctx, outerSpace.left, outerSpace.top, outerSpace.width, outerSpace.height, style.topRadius);
  ctx.clip();
  var titleHeight = style.header.height;
  var subtitleHeight = style.subheader.height;
  ctx.fillStyle = style.color;
  ctx.fillRect(outerSpace.left, outerSpace.top, outerSpace.width, Math.ceil(titleHeight + style.border.width / 2)); // clip is not needed any more

  ctx.restore();

  if (style.subheader.height !== 0) {
    // subtitle background
    ctx.fillStyle = style.subheader.color;
    ctx.fillRect(outerSpace.left, innerSpace.top + titleHeight, outerSpace.width, subtitleHeight); // little triangle    

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(innerSpace.left + 5, innerSpace.top + titleHeight + 1);
    ctx.lineTo(innerSpace.left + 10, innerSpace.top + titleHeight - 5);
    ctx.lineTo(innerSpace.left + 15, innerSpace.top + titleHeight + 1);
    ctx.closePath();

    fill_default()(ctx).call(ctx);
  } // title


  var titleTextAlign = style.header.text.align;
  ctx.fillStyle = style.header.text.color;
  ctx.font = style.header.text.font;
  ctx.textAlign = titleTextAlign;
  ctx.textBaseline = style.header.text.baseline; // wrap title into several lines and add ellipsis if necessary

  var textMargin = style.header.text.margin;
  var lineHeight = style.header.text.lineHeight;
  var textWidth = innerSpace.width - textMargin * 2;
  var maxNumberOfLines = style.header.text.numberOfLines;

  if (utils_isUndefined(this.titleLines)) {
    this.titleLines = wrapText(ctx, this.title, textWidth);

    if (this.titleLines.length > maxNumberOfLines) {
      this.titleLines[maxNumberOfLines - 1] = squeezeEllipsis(ctx, this.titleLines[maxNumberOfLines - 1], textWidth);
    }
  }

  var numberOfLines = Math.min(maxNumberOfLines, this.titleLines.length); // vertical align middle

  var allTextHeight = (numberOfLines - 1) * lineHeight;
  var availableSpace = titleHeight;
  var y = innerSpace.top - (allTextHeight - availableSpace) / 2;
  var titleOriginX = getTextOrigin(innerSpace.left, innerSpace.width, titleTextAlign, textMargin);

  for (var i = 0; i < numberOfLines; i++) {
    ctx.fillText(this.titleLines[i], titleOriginX, y, textWidth);
    y += lineHeight;
  } // subtitle


  if (style.subheader.height !== 0) {
    var subtitleTextAlign = style.subheader.text.align;
    var subheaderTextMargin = style.subheader.text.margin;
    var subtitleTextWidth = innerSpace.width - subheaderTextMargin * 2; // we just have one line of subheader so can use default text orientation rather than manual
    // calculation of drawing dimensions as in header

    ctx.textAlign = subtitleTextAlign;
    ctx.textBaseline = style.subheader.text.baseline;
    ctx.fillStyle = style.subheader.text.color;
    ctx.font = style.subheader.text.font;

    if (utils_isUndefined(this.summarisedSubtitle)) {
      this.summarisedSubtitle = summarize(ctx, this.subtitle, subtitleTextWidth);
    }

    var subtitleOriginX = getTextOrigin(innerSpace.left, innerSpace.width, subtitleTextAlign, subheaderTextMargin);
    ctx.fillText(this.summarisedSubtitle, subtitleOriginX, innerSpace.top + titleHeight + subtitleHeight / 2, subtitleTextWidth);
  } // image


  if (this.imageLoaded) {
    // height of the upper part of the article (excluding image)
    var articleTopHeight = titleHeight + style.subheader.height;
    var w = innerSpace.width;
    var h = innerSpace.height - articleTopHeight;
    var imageLeft = innerSpace.left;
    var imageTop = innerSpace.top + articleTopHeight;
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#111';
    ctx.fillRect(imageLeft, imageTop, w, h);
    ctx.drawImage(this.image, imageLeft, imageTop, w, h);
  } // border


  if (style.border.width > 0) {
    ctx.beginPath();
    topRoundRectPath(ctx, outerSpace.left, outerSpace.top, outerSpace.width, outerSpace.height, style.topRadius);
    ctx.lineWidth = style.border.width;
    ctx.strokeStyle = style.border.color; // these line dashes are useful for debugging the border drawing
    //ctx.setLineDash([5,15]);

    ctx.stroke(); //ctx.setLineDash([0,0]);
  } // star


  if (this.isActive || this.isStarred) {
    var star = this.getStarBox();
    var starStroke, starFill;

    if (!this.isStarred) {
      if (this.isMouseOverStar) {
        starStroke = '#8A8A8A';
        starFill = '#dfdfdf';
      } else {
        starStroke = '#a5a5a5';
        starFill = '#ebebeb';
      }
    } else {
      if (this.isMouseOverStar) {
        starStroke = '#8A8A8A';
        starFill = '#fff800';
      } else {
        starStroke = '#a5a5a5';
        starFill = '#fff800';
      }
    }

    drawStar(ctx, star.centreX, star.centreY, 5, star.innerRadius, star.outerRadius, starFill, starStroke);
  }
};

Article.prototype._getCurrentStyle = function () {
  if (this.isActive) {
    return this.isMouseover ? this.activeHoverStyle : this.activeStyle;
  }

  return this.isMouseover ? this.hoverStyle : this.style;
};

Article.prototype.drawPeriodLinesAndConnectors = function (ctx, top) {
  ctx.globalAlpha = this.opacity;

  var style = this._getCurrentStyle();

  var effectivePeriodLineSize = this.hidePeriodLine ? 0 : this.owner.options.article.periodLine.spacing;
  var effectivePeriodLineThickness = this.hidePeriodLine ? 0 : this.owner.options.article.periodLine.thickness;
  var offset = (effectivePeriodLineSize + effectivePeriodLineThickness) * this.stacking; // canvas draws a line with y as the centre so we have to adjust

  var y = top - offset - this.owner.options.style.mainLine.size / 2 - effectivePeriodLineThickness / 2;

  if (!this.hidePeriodLine) {
    // period line
    var fromX = this.indicator.fromX,
        toX = this.indicator.toX;
    ctx.beginPath();
    ctx.lineWidth = effectivePeriodLineThickness;
    ctx.moveTo(fromX, y);
    ctx.lineTo(toX, y);

    if (this.period.isToPresent) {
      // if period is toPresent, we need end period line with fade effect
      var periodLength = toX - fromX,
          maxFadeLength = 15,
          fadeStartColorStop = Math.max(1 - maxFadeLength / periodLength, 0.7),
          grad = ctx.createLinearGradient(fromX, y, toX, y);
      grad.addColorStop(0, style.color);
      grad.addColorStop(fadeStartColorStop, style.color);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
    } else {
      ctx.strokeStyle = style.color;
    }

    ctx.stroke();
  } // connector line


  var x1 = Math.max(0, this.indicator.fromX);
  var y1 = y;
  var x2 = this.position.left + style.connectorLine.offsetX;
  var y2 = this.position.top + this.height + style.connectorLine.offsetY;
  ctx.strokeStyle = ctx.fillStyle = style.color;
  ctx.lineWidth = style.connectorLine.thickness; // connector line

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke(); // arrow head

  var radians = Math.atan((y2 - y1) / (x2 - x1)) + (x2 >= x1 ? -90 : 90) * Math.PI / 180;
  ctx.save();
  ctx.beginPath();
  ctx.translate(x2, y2);
  ctx.rotate(radians);
  ctx.moveTo(-style.connectorLine.arrow.width, 0);
  ctx.lineTo(style.connectorLine.arrow.width, 0);
  ctx.lineTo(0, -style.connectorLine.arrow.height);
  ctx.closePath();
  ctx.restore();

  fill_default()(ctx).call(ctx);
};

Article.prototype.getStarBox = function () {
  var style = this._getCurrentStyle();

  var sideLength = style.star.width;
  var box = {
    width: sideLength,
    height: sideLength
  };
  box.left = Math.floor(this.position.left) - style.topRadius / 4 + this._getWidth() - box.width - style.star.margin;
  box.top = Math.floor(this.position.top) + style.topRadius / 4 + style.star.margin;
  box.centreX = box.left + box.width / 2;
  box.centreY = box.top + box.height / 2;
  box.outerRadius = box.width / 2;
  box.innerRadius = box.outerRadius / 2;
  return box;
};

Article.prototype.adjustHeightFromLoadedImage = function () {
  var style = this._getCurrentStyle();

  var imageHeight = 0;

  if (this.imageLoaded) {
    var ratioHW = this._getWidth() / this.image.width;
    imageHeight = Math.min(this.image.height * ratioHW, style.maxImageHeight);
  } // height of the upper part of the article (excluding image)


  var articleTopHeight = style.header.height + style.subheader.height + style.border.width / 2;
  this.height = imageHeight + articleTopHeight;
};
// CONCATENATED MODULE: ./js/Article.dragging.js


Article.prototype.startDragging = function (pos) {
  if (this.isMoving) this.moveAnimation.dummyElement.stop();
  this.isDragging = true;
  this.dragStartOffset = {
    left: pos.left - this.position.left,
    top: pos.top - this.position.top
  };
  this.owner.startAnimation();
};

Article.prototype.stopDragging = function () {
  this.offset = this.finalOffset = this.moveAnimation.finalOffset = {
    left: this.position.left - this.registeredPosition.left,
    top: this.position.top - this.registeredPosition.top
  };
  this.isDragging = false;
};

Article.prototype.dragging = function (pos) {
  this.position = {
    left: pos.left - this.dragStartOffset.left,
    top: pos.top - this.dragStartOffset.top
  };
};
// CONCATENATED MODULE: ./js/Article.js




var Article_Article = Article;
// CONCATENATED MODULE: ./js/Timeline.data.js



 // todo: yuck



Timeline.prototype.load = function (articles) {
  this.addArticles(articles);
  this.updateCurrentDensitySetting();
  this.updateArticlesGroupIndex();
  this.requestRedraw();
};

Timeline.prototype.addArticles = function (articles, progress, callback) {
  var _context;

  if (articles.length == 0) {
    if (callback) {
      callback.call(this);
    }

    return;
  }
  /* bulk load - start */
  // ignore the ones already loaded


  var existingArticleIds = map_default()(_context = this.articles).call(_context, function (a) {
    return a.id;
  });

  var newArticles = [];

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    if (index_of_default()(existingArticleIds).call(existingArticleIds, getPropertyFromData(article, "id")) === -1) {
      newArticles.push(article);
    }
  }

  var me = this;

  for (var i = 0; i < newArticles.length; i++) {
    var article = new Article_Article(this, getPropertyFromData(newArticles[i], "id"));
    this.articles.push(article);
    article.addActivatedHandler(function () {
      me.activated(this);
    });
    article.setupByReceivedData(newArticles[i]);
    article.registerPosition(this.getOriginalPosition(article));
  }

  this.updateIsActiveStatus();

  if (callback) {
    callback.call(this);
  }
}; // Process and return valid Dmy from any input date (article data, methods etc)
// Todo: Convert string dates to dmy


Timeline.prototype.getDmyFromInput = function (dmy) {
  if (!this.options.shiftBceDates) return dmy;
  if (dmy.year < 0) dmy.year += 1; // note: year=0 is invalid when shiftBceDates=true, so this defaults to 1BCE

  return dmy;
};
// CONCATENATED MODULE: ./js/Timeline.articles.js




Timeline.prototype.getActiveArticle = function () {
  for (var i = this.articles.length - 1; i >= 0; i--) {
    if (this.articles[i].isActive) return this.articles[i];
  }

  return null;
};

Timeline.prototype.getArticleById = function (id) {
  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];
    if (article.id == id) return article;
  }
};

Timeline.prototype.bringFront = function (articleId) {
  var index = getIndexById(this.articles, articleId);

  if (index >= 0) {
    moveInArray(this.articles, index, this.articles.length - 1);
  }

  this.updateIsActiveStatus();
  this.save();
};

Timeline.prototype.updateIsActiveStatus = function () {
  for (var i = 0; i < this.articles.length; i++) {
    this.articles[i].isActive = false;
  } // choose the topmost loaded one


  for (var i = this.articles.length - 1; i >= 0; i--) {
    if (this.articles[i].isDataLoaded) {
      this.articles[i].isActive = true;
      return;
    }
  }
};

Timeline.prototype.getVisibleArticlesClone = function () {
  var validArticles = [];

  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];

    if (article.isVisible && article.isDataLoaded) {
      validArticles.push(article);
    }
  }

  return validArticles;
};

Timeline.prototype.hasArticle = function (articleId) {
  var article;

  for (var i = 0; i < this.articles.length; i++) {
    if (this.articles[i].id === articleId) {
      article = this.articles[i];
    }
  }

  return !isUndefined(article);
};

Timeline.prototype.reposition = function (article, drawCycleContext) {
  if (article.isDragging) return;
  var pos = this.getOriginalPosition(article, drawCycleContext);
  article.registeredPosition = pos;
  var finalOffset = article.finalOffset; //finalOffset has been updated by stack function
  //if move animation is off. Set new position directly

  if (!this.options.article.animation.move.active) {
    article.position = {
      left: pos.left + finalOffset.left,
      top: pos.top + finalOffset.top
    }; //always keep track of current offset, in case animation is turned on

    article.offset = {
      left: finalOffset.left,
      top: finalOffset.top
    };
    ;
    return;
  } //else, move animation on...
  //does the article have a new destination?


  if (article.moveAnimation.finalOffset.top != finalOffset.top || article.moveAnimation.finalOffset.left != finalOffset.left) {
    //yes, move to new offset with anim
    article.moveToOffsetWithAnim(finalOffset, true
    /*with defaultRedraw at end*/
    );
  } else {
    //no animation is needed
    article.position = {
      // but still need to set the position (registered pos is changing on scroll and zoom)
      left: pos.left + article.offset.left,
      top: pos.top + article.offset.top
    };
  }
};

Timeline.prototype.getOriginalPosition = function (article, drawCycleContext) {
  var from = this.getPixel(article.period.from, drawCycleContext);
  var to = this.getPixel(article.period.to, drawCycleContext);
  var isFromNegative = isNaN(from) || from < 0;
  var isToPositive = isNaN(to) || to > 0;

  if (this.options.article.collectOngoing && isFromNegative && isToPositive) {
    from = 0;
  }

  var style = article._getCurrentStyle();

  return {
    left: from - style.connectorLine.offsetX,
    top: this.top - this.options.article.distanceToMainLine
  };
}; // reorders articles to match the order of given array of ids


Timeline.prototype.reorderArticles = function (ids) {
  var result = [];

  for (var i = 0; i < ids.length; i++) {
    var index = getIndexById(this.articles, ids[i]);
    result.push(this.articles[index]);
  }

  this.articles = result;
};

Timeline.prototype.getSortedByYearClone = function () {// and keep initial order
  // assign current index to each item to use during sort
  // really sort them
};

Timeline.prototype.removeArticleById = function (id) {
  for (var i = 0; i < this.articles.length; i++) {
    var _context;

    if (this.articles[i].id == id) splice_default()(_context = this.articles).call(_context, i, 1);
  }
}; // delete


Timeline.prototype.deleteCurrentArticle = function () {
  if (this.articles.length == 0) return;
  this.removeById(this.articles, this.getActiveArticle().id);
  this.requestRedraw(); // update statuses

  for (var i = this.articles.length - 1; i >= 0; i--) {
    var article = this.articles[i];

    if (article.isVisible) {
      this.bringFront(article.id);
      this.activated(this.getActiveArticle());
      this.requestRedraw();
      return;
    }
  }
}; // pretty print (for debug only)


Timeline.prototype.pp = function (msg) {
  var str = "";

  for (var i = 0; i < this.articles.length; i++) {
    str += this.articles[i].title.split(' ')[0] + ",";
  }

  msg = msg || "";
  console.log(msg + ":" + str);
};
// CONCATENATED MODULE: ./js/Timeline.draw.js





 // Redraw with repostion article origins and stacking

Timeline.prototype.defaultRedraw = function () {
  this.redraw({
    // 1. update isVisibleInGroup and after articles IsInRange is decided
    onArticlesInRangeIsReady: function defaultRedraw_onArticlesInRangeIsReady(drawCycleContext) {
      this.updateVisibleArticlesOfGroups(drawCycleContext); // reposition sets registeredPosition which will be used in stack()

      this.forInRangeArticles(function defaultRedraw_repositionArticles(article) {
        this.reposition(article, drawCycleContext);
      });
      this.stack(drawCycleContext);
    },
    // 2. make sure articles move with the dragged line by repositioning them
    onArticlesVisiblityIsReady: function defaultRedraw_onArticlesVisiblityIsReady(drawCycleContext) {
      this.updateArticleLines();
    }
  });
}; // Redraw with repostion article origins
// Use when start date or zoom has changed, otherwise normal redraw() will do


Timeline.prototype.repositionRedraw = function () {
  this.redraw({
    // 1. update isVisibleInGroup and after articles IsInRange is decided
    onArticlesInRangeIsReady: function defaultRedraw_onArticlesInRangeIsReady(drawCycleContext) {
      this.updateVisibleArticlesOfGroups(drawCycleContext); // reposition sets registeredPosition which will be used in stack()

      this.forInRangeArticles(function defaultRedraw_repositionArticles(article) {
        this.reposition(article, drawCycleContext);
      });
    },
    // 2. make sure articles move with the dragged line by repositioning them
    onArticlesVisiblityIsReady: function defaultRedraw_onArticlesVisiblityIsReady(drawCycleContext) {
      this.updateArticleLines();
    }
  });
};

Timeline.prototype.redraw = function (callbacks) {
  var _context;

  // Todo: Manage redraw requests when timeline is not animating,
  // then redrawInProgress check below can be removed.
  if (this.redrawInProgress) return;
  this.redrawInProgress = true;
  var initialTopRow = this.topRow; //trigger autofit rowSpacing if this has changed by end of draw cycle

  callbacks = callbacks || {};
  var drawCycleContext = {};
  var ctx = this.canvasContext;
  var width = this.getWidth();
  var top = this.top; // 1. find start and end tokens

  var mainline = this.getTokensAndMarkers(width),
      markers = mainline.markers,
      tokens = mainline.tokens;
  drawCycleContext.tokens = tokens;
  this.invoke('onMainRangeIsReady', callbacks, drawCycleContext); // 2. decide which articles are in range

  this.forLoadedArticles(function redraw_articles_updateIsInRange(article) {
    article.isInView = article.overlapsInclusiveWithDates(drawCycleContext.tokens.start, drawCycleContext.tokens.end); //Now on article 
    //TODO should we check this exists first?

    if (this.options.article.autoStacking.range == RANGE_SCREEN) {
      article.isInRange = article.isInView;
    } else {
      article.isInRange = true;
    }

    if (article.isInRange) {
      article.isHiddenByFilter = article.hiddenByFilter;
    }
  });
  this.invoke('onArticlesInRangeIsReady', callbacks, drawCycleContext); // methods which would like to change Visiblity based on Column (group) rules or Row rules can do it in the above callback
  // 3. allow articles visiblity to update their visiblity (perhaps start an animation now)

  this.forLoadedArticles(function redraw_articles_updateVisibility(article) {
    article.updateVisibility();
  }); // Use new sorter to order image load queue

  sort_default()(_context = this.articleImageLoadQueue).call(_context, ARTICLE_IMAGE_QUEUE_SORTER);

  this.invoke('onArticlesVisiblityIsReady', callbacks, drawCycleContext); // 4. calculate and draw indicators and article parts

  this.forInRangeArticles(function redraw_articles_setIndicators(article) {
    article.indicator = {
      // performance: canvas works better with int, hence the Math.round
      fromX: Math.max(-3, Math.round(this.getPixel(article.period.from, drawCycleContext))),
      //-3 instead of 0 minimum ensures indicators don't 'pin' to left edge
      toX: Math.min(this.options.width, Math.round(this.getPixel(article.period.to, drawCycleContext)))
    }; // events in a year

    if (article.indicator.toX - article.indicator.fromX < 2) article.indicator.toX = article.indicator.fromX + 2;
    article.adjustHeightFromLoadedImage();
  });

  if (this.options.article.autoStacking.fitToHeight && initialTopRow !== this.topRow) {
    this.fitToHeight(true
    /*withDefaultRedraw*/
    );
  }

  this.render(ctx, top, width, markers);
  this.redrawInProgress = false; // Execute onRedraw handlers

  for (var i = 0; i < this.redrawHandlers.length; i++) {
    this.redrawHandlers[i].call(this, {
      canvasContext: ctx,
      drawCycleContext: drawCycleContext,
      top: top
    });
  }
};

Timeline.prototype.render = function (ctx, top, width, markers) {
  // performance: one-shift-to-right instead of floating point division by 2
  var halfMainlineSize = this.options.style.mainLine.size >> 1;
  if (!this.owner) ctx.clearRect(0, 0, width, this.top + this.options.verticalOffset);
  this.drawDraggingHighlight(ctx, top, width);
  this.drawMainline(ctx, top, width, markers);
  ctx.beginPath(); // position indicators on main line for articles in range (article itself might be invisible but always draw the indicator)

  this.forInRangeArticles(function redraw_articles_drawIndicators(article) {
    if (!article.isHiddenByFilter && article.isInView) {
      ctx.moveTo(article.indicator.fromX, top - halfMainlineSize);
      ctx.lineTo(article.indicator.fromX, top + halfMainlineSize);
    }
  });
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = '#303030';
  ctx.stroke();
  ctx.globalAlpha = 1;
  /*
   * When drawing articles, we want the article period lines/connectors to be underneath the article headers
   * We also want the selected article to be drawn over everything else so we draw both parts of that article at the very end
   */
  // draw article lines

  for (var i = 0; i < this.articles.length; i++) {
    var article = this.articles[i];

    if (article.isDataLoaded && article.isVisible && !article.isActive) {
      article.drawPeriodLinesAndConnectors(ctx, top);
    }
  } // draw articles


  for (var _i = 0; _i < this.articles.length; _i++) {
    var article = this.articles[_i];

    if (article.isDataLoaded && article.isVisible && !article.isActive) {
      article.draw(ctx);
    }
  } // draw active article


  var activeArticle = this.getActiveArticle();

  if (activeArticle && activeArticle.isVisible) {
    activeArticle.drawPeriodLinesAndConnectors(ctx, top);
    activeArticle.draw(ctx);
  } // draw branding


  if (!this.options.disableBranding) {
    ctx.globalAlpha = 1; // reset in case last drawn article sets global alpha less than 1

    this._drawBranding(ctx);
  }
};

Timeline.prototype.drawMainline = function (ctx, top, width, markers) {
  // draw main line
  if (this.options.style.mainLine.visible) {
    ctx.globalAlpha = 1;
    var halfMainlineSize = this.options.style.mainLine.size >> 1; // performance: one-shift-to-right instead of floating point division by 2

    var mainLineGradient = ctx.createLinearGradient(0, top - halfMainlineSize, 0, top + halfMainlineSize);
    mainLineGradient.addColorStop(0, '#808080');
    mainLineGradient.addColorStop(1, '#ccc');
    ctx.beginPath();
    ctx.lineWidth = this.options.style.mainLine.size;
    ctx.strokeStyle = ctx.fillStyle = mainLineGradient;
    ctx.moveTo(0, top);
    ctx.lineTo(width, top);
    ctx.stroke();

    for (var type in markers) {
      this.drawMarkersAndLabels(ctx, markers[type], type, top + halfMainlineSize);
    }
  }
};

Timeline.prototype.drawDraggingHighlight = function (ctx, top, width) {
  // highlight dragging area
  if (this.isDragging && this.options.style.draggingHighlight.visible) {
    ctx.fillStyle = this.options.style.draggingHighlight.color;
    var highlightArea = this.options.style.draggingHighlight.area;
    ctx.fillRect(0, top - highlightArea.up, width, highlightArea.up + highlightArea.down);
  }
};

Timeline.prototype.getTokensAndMarkers = function (width) {
  var tokens = {};
  var markers = {};
  markers[MAJOR_MARKER] = [];
  markers[MINOR_MARKER] = []; // generate tokens

  var x = this.repositionWindow;
  var token = this.timescaleManager.startToken;
  tokens.start = token.value;
  var endToken = token; // go back several tokens so that date labels start being drawn from a position that is OFF the left edge of the screen.
  // todo: make this calculated from a number of pixels which can be set in options for left and right edges of screen.

  var leftBufferNumberOfTokens = 9; // 9 tokens always reaches next major marker for zoom levels > month

  var token = this.timescaleManager.getPreviousNth(token, leftBufferNumberOfTokens);
  x -= token.length * leftBufferNumberOfTokens;

  do {
    // store tokens by type for later drawing same types together
    markers[token.type].push(token);
    tokens[token.value.toKeyString()] = token.drawX = x;
    x += token.length;
    endToken = token;
    token = this.timescaleManager.getNext(token);
  } while (x < width + 150); // extra 150px to stop articles disappearing early on right edge of screen. Todo: add to options


  tokens.end = endToken.value;
  return {
    tokens: tokens,
    markers: markers
  };
}; // Draw group of markers of the same type


Timeline.prototype.drawMarkersAndLabels = function (ctx, tokens, tokenType, markerTop) {
  if (tokens.length === 0) return; // labels only drawn if first marker has label defined.

  switch (tokenType) {
    case stringify_default()(MINOR_MARKER):
      tokenType = "minor";
      break;

    case stringify_default()(MAJOR_MARKER):
      tokenType = "major";
      break;

    default:
      console.log("token type not recognised", tokenType, MINOR_MARKER);
  }

  var markerStyle = this.options.style.marker[tokenType];
  var markerHeight = markerStyle.height;
  var withLabel = !!tokens[0].label;
  var isInFuture = tokens[0].value.isInFuture();
  var wasInPast = !isInFuture;

  if (withLabel) {
    var labelStyle = this.options.style.dateLabel[tokenType];
    ctx.font = labelStyle.font;
    ctx.textAlign = labelStyle.textAlign;
    ctx.textBaseline = "alphabetic";
    var labelY = markerTop + markerHeight + labelStyle.offset.y;
  }

  ctx.beginPath();

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]; // upon transition from past to future draw all the past markers and start a new path

    isInFuture = token.value.isInFuture();

    if (wasInPast && isInFuture) {
      wasInPast = false;
      ctx.strokeStyle = markerStyle.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
    }

    var drawX = Math.round(token.drawX); // performance: canvas works better with int

    ctx.moveTo(drawX, markerTop);
    ctx.lineTo(drawX, markerTop + markerHeight);

    if (withLabel && token.label) {
      var labelX = drawX + labelStyle.offset.x;
      ctx.fillStyle = isInFuture ? labelStyle.futureColor : labelStyle.color;
      ctx.fillText(token.label, labelX, labelY);
    }
  }

  ctx.strokeStyle = isInFuture ? markerStyle.futureColor : markerStyle.color;
  ctx.lineWidth = 1;
  ctx.stroke();
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/instance/reverse.js
var reverse = __webpack_require__(101);
var reverse_default = /*#__PURE__*/__webpack_require__.n(reverse);

// CONCATENATED MODULE: ./js/Timeline.stack.js






Timeline.prototype.updateArticleLines = function () {
  var me = this;

  function prepare(articles) {
    var result = [];
    me.forVisibleArticles(function (article) {
      if (!article.hidePeriodLine) {
        //don't stack hidden period lines
        result.push(article);
        result[result.length - 1].stacking = -1;
      }
    });

    sort_default()(result).call(result, me.options.article.periodLine.stacking.sorter);

    if (me.options.article.periodLine.stacking.reverseOrder) reverse_default()(result).call(result);
    return result;
  }

  function canPutOnStack(article, articlesOnStack) {
    // if there isn't an overlapping between this and other, then it's fine
    for (var i = 0; i < articlesOnStack.length; i++) {
      if (article.overlaps(articlesOnStack[i])) return false;
    }

    return true;
  }

  var articles = prepare(this.articles);
  var currentStack = 0;
  var stacks = [];

  do {
    stacks[currentStack] = [];
    var articleAddedToStack = false;

    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];
      if (article.stacking >= 0) // already done
        continue;

      if (canPutOnStack(article, stacks[currentStack])) {
        stacks[currentStack].push(article);
        article.stacking = currentStack;
        articleAddedToStack = true;
      }
    }

    currentStack++;
  } while (articleAddedToStack); // apply stacking to real articles

};

Timeline.prototype.stack = function (drawCycleContext) {
  var _context2;

  if (this.articles.length == 0) return;
  var me = this,
      rowHeight = this.options.article.autoStacking.rowSpacing; // do not stack if Manual setting is selected

  if (!this.options.article.autoStacking.active) return; // // // PRIVATE FUNCTIONS
  // Sorts the article into the correct order to be painted (selected > starred (sorted by rank) > non-starred (sorted by rank)

  function prepare(articles) {
    var _context;

    var selected;
    var starred = [];
    var rest = [];

    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];

      if (article.isDataLoaded && article.isInRange && article.isVisibleInGroup && !article.isHiddenByFilter) {
        if (article.isActive) {
          selected = article;
        } else if (article.isStarred) {
          starred.push(article);
        } else {
          rest.push(article);
        }
      }
    }

    sort_default()(starred).call(starred, ARTICLE_RANK_SORTER);

    sort_default()(rest).call(rest, ARTICLE_RANK_SORTER);

    return concat_default()(_context = []).call(_context, selected ? selected : [], // in case nothing is selected
    starred, rest);
  } // Checks if the given article's header overlaps with any of the other article headers in the row


  function overlapsWithNoArticleInRow(row, article) {
    for (var i = 0; i < row.length; i++) {
      var articleInRow = row[i];

      if (article.headerOverlapsWith(articleInRow)) {
        return false;
      }
    }

    return true;
  }

  function findLastOverlappingRow(rows, article) {
    for (var i = rows.length - 1; i >= 0; i--) {
      if (!overlapsWithNoArticleInRow(rows[i], article)) {
        return i;
      }
    }

    return -1;
  }

  function findFirstAvailableRow(rows, article) {
    for (var i = 0; i < rows.length; i++) {
      if (overlapsWithNoArticleInRow(rows[i], article)) {
        return i;
      }
    } // return one row after the topmost


    return rows.length;
  } // put the article in the first available space


  function tryPutInRowsHorizontal(rows, article) {
    var firstAvailableRow = findFirstAvailableRow(rows, article);
    if (firstAvailableRow >= rows.length) rows[firstAvailableRow] = [];
    rows[firstAvailableRow].push(article);
    return true;
  } // Tries to put the article in the rows on the page, returning false if it does not fit in any.


  function tryPutInRowsVertical(rows, article) {
    var overlapRowIndex = findLastOverlappingRow(rows, article);
    var nextRow = overlapRowIndex + 1; // add a new row

    if (nextRow >= rows.length) rows[nextRow] = [];
    rows[nextRow].push(article);
    return true;
  } // --------    


  var articles = prepare(this.articles),
      rows = []; // put them in rows - we set the visibility here so that updateArticleLines knows which articles will really be visible
  // in manual setting we return before this point so visibility is not altered in that case

  for (var i = 0; i < articles.length; i++) {
    // note: as a result of amp #27164 isVisibleInRows will be always true
    articles[i].isVisibleInRows = tryPutInRowsHorizontal(rows, articles[i]);
  }

  this.topRow = 0;

  for (var r = 0; r < rows.length; r++) {
    for (var i = 0; i < rows[r].length; i++) {
      var article = rows[r][i];
      article.finalOffset = {
        left: 0,
        // keep lines straight and vertical
        top: r * -rowHeight
      };
      article.row = r;
      if (article.isInView) this.topRow = Math.max(this.topRow, r); //track highest used row for articles in view

      this.reposition(article, drawCycleContext);
    }
  }

  var currentActiveArticle = this.getActiveArticle(); // fix z orders: put items on top behind the rest

  sort_default()(_context2 = this.articles).call(_context2, ARTICLE_ROW_SORTER); //when move animation is turned on, article.row will be the DESTINATION row (row after animation is complete). This gives the best visual effect, as articles change draw order immediately then animate into position with no more order changes
  // bring selected to front


  if (currentActiveArticle) {
    this.bringFront(currentActiveArticle.id);
  }
};

Timeline.prototype.isInManualStackingMode = function () {
  return this.options.article.rowSpacing == 0;
};

Timeline.prototype.notifyEventSpacingChanged = function () {
  var me = this;

  function repositionOffscreenArticles() {
    var topOfCanvas = -(this.canvas.height() - this.options.article.distanceToMainLine);

    for (var i = 0; i < me.articles.length; i++) {
      var article = me.articles[i]; // if article is not visible in rows or is drawn off screen

      if (!article.isVisibleInRows || article.offset.top <= topOfCanvas) {
        article.isVisibleInRows = true;
        article.offset = {
          left: 0,
          // keep lines straight and vertical
          top: topOfCanvas // top of canvas

        };
      }
    }
  }

  if (this.isInManualStackingMode()) {
    repositionOffscreenArticles();
  }

  this.defaultRedraw();
};
// CONCATENATED MODULE: ./js/Timeline.storage.js





Timeline.prototype.getStatusForSave = function () {
  // zoom and from 
  var from = this.timescaleManager.startToken.value;
  var articleSaveInfo = [];

  for (var i = 0; i < this.articles.length; i++) {
    articleSaveInfo.push(this.articles[i].getStatusForSave());
  }

  return stringify_default()({
    t: this.title,
    o: this.ownerId,
    //#uiupdate set by server *** we need this so that ownerId can be used to calculate button visibility
    pd: this.isInPublicDirectory,
    z: this.timescaleManager.zoom,
    // todo: confirm removal with Shayan
    //d: this.eventSpacingSelector.val(),
    fy: from.year,
    fm: from.month,
    fd: from.day,
    w: this.repositionWindow,
    a: articleSaveInfo,
    v: this.version
  });
}; // calls save only after callers stopped calling this function repetitively


Timeline.prototype.deferredSave = function () {
  if (isEmbeddedMode) return;

  if (this.saveSchedule) {
    clearTimeout(this.saveSchedule);
  }

  var me = this;
  this.saveSchedule = set_timeout_default()(function () {
    me.save();
    me.saveSchedule = null;
  }, 500);
};

Timeline.prototype.save = function () {
  if (this.restoring) return;
  if (this.options.onSave) this.options.onSave(this.getStatusForSave()); // todo: in histro attach this to onSave
  // also decide what state should be passed to the onSave function
  //if (state)
  //    state = JSON.stringify(state);
  //localStorage.setItem(STATE_KEY, state|| this.getStatusForSave());
};

Timeline.prototype.getCurrentState = function () {
  return JSON.parse(localStorage.getItem(STATE_KEY) || '{"a":[]}');
};

Timeline.prototype.mergeWithLocalStorage = function (newState) {
  var state = this.getCurrentState();
  var articles = state.a; // to reassign colours in new state

  var colour,
      currentIds = [];

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];

    if (isUndefined(colour) || article.c > colour) {
      colour = article.c + 1;
    }

    currentIds.push(article.i);
  } // merge


  for (var i = 0; i < newState.a.length; i++) {
    var article = newState.a[i];

    if (index_of_default()(currentIds).call(currentIds, article.i) == -1) {
      article.c = colour % PERIOD_COLOURS.length;
      colour++;
      state.a.push(article);
    }
  }

  return state;
};
// CONCATENATED MODULE: ./js/Timeline.wheel.js





Timeline.prototype.enableZoomByWheel = function () {
  var me = this;
  this.canvas.mousewheel(function (event, delta) {
    me.onWheel(event, delta);
  });
};

Timeline.prototype.onWheel = function (event, delta) {
  var oldZoom = this.timescaleManager.zoom;
  var speed = this.options.zoom.wheelSpeed;
  var newZoom = oldZoom + -delta * speed * this.options.zoom.wheelStep;
  if (newZoom > this.options.zoom.maximum) newZoom = this.options.zoom.maximum;
  if (newZoom < this.options.zoom.minimum) newZoom = this.options.zoom.minimum;
  var mousePositionX = event.pageX - this.canvas.parent().offset().left;
  this.setZoomByPivotPixel(newZoom, mousePositionX);
  this.requestRedraw();
  preventDefault(event);
};

Timeline.prototype.setZoom = function (newZoom, pivotPixel, offsetX) {
  //offsetX optionally used for left/right movement while zooming e.g. with pinch gesture
  var pivotPixel = pivotPixel || this.width / 2; //default to zoom from centre

  if (offsetX) {
    offsetX = Math.round(offsetX);
  }

  this.setZoomByPivotPixel(newZoom, pivotPixel, offsetX);
  this.requestRedraw();
}; // zoom with pivot updates the 'from' in a way that current point (pivot) 
// stays still and the rest of the objects zoom around it


Timeline.prototype.setZoomByPivotPixel = function (newZoom, pivotPixel, offsetX) {
  this.setZoomByPivotPoint(newZoom, this.getPivotPoint(pivotPixel), pivotPixel, offsetX);
};

Timeline.prototype.setZoomByPivotPoint = function (newZoom, pivotPoint, pivotPixel, offsetX) {
  var offsetX = offsetX || 0;
  this.timescaleManager.setZoom(newZoom); // move the start date to the pivot point to make sure it is in view

  var compensation = this.timescaleManager.setStartDate(pivotPoint.date);
  this.repositionWindow = compensation - pivotPoint.fraction;
  this.updateFromByPixels(-pivotPixel + offsetX); // notice: here calling setZoom takes place BEFORE updating start token
  // so any zoom-change-listerns logic which relies on 'start token' will have unexpected behaviour
  // TODO: fix or include in the new drawCycle logic
};

Timeline.prototype.getPivotPoint = function (pixel) {
  var token = this.timescaleManager.getStartTokenCloned();
  var x = this.repositionWindow; // go one token back from startToken if necessary (based on repositionWindow)

  if (x >= 0) {
    token = this.timescaleManager.getPrevious(token);
    x -= token.length;
  }

  var prevToken = token;

  while (x <= pixel) {
    x += token.length;
    prevToken = token;
    token = this.timescaleManager.getNext(token);
  } // set date details that might not be available in the token (when zoom in > day)


  var dmy = prevToken.value;
  var year = dmy.year;
  var month = dmy.month;
  var day = dmy.day;
  var unit = prevToken.unit;
  var fraction = pixel - (x - token.length);
  var len = prevToken.length;

  if (unit === ZOOM_MONTH) {
    day = Math.floor(fraction / len * 30.44) + 1;
    fraction -= (day - 1) * len / 30.44;
    prevToken.value = new Dmy(year, month, day);
  } else if (unit !== ZOOM_DAY) {
    //zoom year and above
    var yearMultiple = this.timescaleManager.unitLengthInYears;
    var daysFromToken = Math.floor(fraction * 365.2422 * yearMultiple / len) + 1; //performance: at higher zoom levels find approximate number of years within daysFromToken to prevent too many year iterations during Dmy.getByDayOfYear()

    var extraYears = 0;

    if (daysFromToken > 365) {
      extraYears = Math.floor(daysFromToken / 365);
      daysFromToken = daysFromToken - 365 * extraYears;
    } // fraction is now too low to be noticable 


    fraction = 0;
    prevToken.value = Dmy.getByDayOfYear(year + extraYears, daysFromToken);
  }

  return {
    date: prevToken.value,
    fraction: fraction
  };
};
// EXTERNAL MODULE: ./node_modules/@babel/runtime-corejs3/core-js-stable/math/sign.js
var sign = __webpack_require__(102);
var sign_default = /*#__PURE__*/__webpack_require__.n(sign);

// CONCATENATED MODULE: ./js/Timeline.anim.js




Timeline.prototype.startAnimation = function (redrawFunction) {
  if (this.isAnimating) return;
  this.isAnimating = true;
  this.animation.redrawFunction = redrawFunction;
  this.drawAnimationFrame();
};

Timeline.prototype.stopAnimation = function () {
  this.isAnimating = false; // Reset to repositionRedraw for when next drag begins.
  // During a drag, this gets changed to defaultRedraw if movement threshold exceeded

  this.animation.dragRedrawFunction = this.repositionRedraw; // Reset any custom redrawFunction that was defined

  this.animation.redrawFunction = false;
};

Timeline.prototype.areAnimationsFinished = function () {
  return !(this.isDragging || this.isPanning || this.isPinching || this.draggingArticle !== null || this.isAnimatingArticles || this.isCustomAnimating);
};

Timeline.prototype.drawAnimationFrame = function () {
  // Animation automatically stops when all possible animations are over
  // This allows each indivdual animiation to turn on/off without stopping
  // other ongoing animations
  if (this.areAnimationsFinished()) {
    return this.stopAnimation();
  }

  var me = this;
  var redrawFunction = this.getAnimationRedrawFunction();
  this.updateRedrawRequests(redrawFunction);
  requestAnimationFrame(function (timestamp) {
    // Todo: add framerate measurement from timestamp
    redrawFunction.call(me);
    me.drawAnimationFrame();
  });
}; // Request redraw without interrupting animation


Timeline.prototype.requestRedraw = function (redrawFunction) {
  redrawFunction = redrawFunction || this.defaultRedraw;
  var me = this; // Call immediately if not animating

  if (!this.isAnimating) return redrawFunction.call(me); // Otherwise request redraw for next frame

  if (redrawFunction === this.defaultRedraw) this.redrawRequests.default = true;
  if (redrawFunction === this.repositionRedraw) this.redrawRequests.reposition = true; // Note: No need to add basic redraw request while animation is ongoing,
  // as any animation redraw includes all basic redraw steps
}; // Updates redrawRequests based on redraw function about to be used


Timeline.prototype.updateRedrawRequests = function (nextRedrawFunction) {
  if (nextRedrawFunction === this.defaultRedraw) {
    this.redrawRequests.default = false; // reposition redraw also fulfilled by default redraw

    this.redrawRequests.reposition = false;
  }

  if (nextRedrawFunction === this.repositionRedraw) {
    this.redrawRequests.reposition = false;
  }
};

Timeline.prototype.getAnimationRedrawFunction = function () {
  if (this.isDragging) {
    return this.animation.dragRedrawFunction;
  }

  if (this.isPanning || this.isPinching) {
    return this.defaultRedraw;
  } // Fulfil any outstanding requests


  if (this.redrawRequests.default) return this.defaultRedraw;
  if (this.redrawRequests.reposition) return this.repositionRedraw; // else

  return this.animation.redrawFunction || this.animation.defaultRedrawFunction;
};

Timeline.prototype.switchToPositiveRepositionWindow = function () {
  // There are two ways to express a Start point in combination with Reposition Window
  // One of them is the year and a negative reposition window, the other one is next year and a positiove reposition window.
  // The effect on the screen is basically the same.
  // But some oprations (like go to year by animation) may need the positive window value for their calculations.
  if (this.repositionWindow < 0) {
    var start = this.timescaleManager.startToken;
    this.repositionWindow = start.length + this.repositionWindow;
    start = this.timescaleManager.getNext(start);
    this.timescaleManager.setStartToken(start);
  }
};

Timeline.prototype.zoomToAnim = function (newZoom, _complete) {
  var dummy = $("<span />").css("left", this.timescaleManager.zoom);
  var me = this;
  dummy.animate({
    left: newZoom
  }, {
    duration: 2000,
    step: function step(now, fx) {
      me.setZoom(now);
    },
    complete: function complete() {
      if (_complete) _complete.call(me);
    }
  });
};

Timeline.prototype.goToPixelAnim = function (pixels) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // options are {offsetX, complete}
  if (this.isPanning) this.animation.panDummy.stop();
  this.isPanning = true;
  var dummy = this.animation.panDummy = this.animation.panDummy || $("<span />");
  var maxMovement = 1e8;
  var maxMovementReached = false;

  if (Math.abs(pixels) > maxMovement) {
    // only animate up to maxPixelMovement, then jump directly to the date after that
    pixels = sign_default()(pixels) * maxMovement;
    maxMovementReached = true;
  }

  dummy.css("left", 0);
  this.startAnimation();
  var lastStep = 0;
  dummy.animate({
    left: pixels
  }, {
    duration: options.duration || 2000,
    easing: options.easing || 'swing',
    step: function step(now, fx) {
      var movement = now - lastStep;
      lastStep = now;

      _this.updateFromByPixels(movement);

      if (_this.isPinching) {
        // Todo: Also check for isPanning. See explanation with doDrag method
        dummy.stop();
        _this.isPanning = false;
      }
    },
    complete: function complete() {
      if (maxMovementReached && options.targetDmy) {
        _this.setStartDate(options.targetDmy); // set date directly

      }

      _this.isPanning = false;
      if (options.complete) options.complete.call(_this);
    }
  });
};

Timeline.prototype.goToDateAnim = function (dmy) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  this.switchToPositiveRepositionWindow();
  this.getDmyFromInput(dmy);
  var startDate = this.timescaleManager.startToken.value;
  var pixels = this.repositionWindow - this.timescaleManager.getPixelsBetween(dmy, startDate);
  if (options.offsetX) pixels -= options.offsetX; // Store target Dmy so it can be set directly if max allowed movement reached

  options.targetDmy = dmy;
  this.goToPixelAnim(pixels, options);
};

Timeline.prototype.repositionWithAnim = function (article) {
  var pos = this.getOriginalPosition(article);
  article.registeredPosition = pos;
  var destination = {
    left: pos.left + article.dragFinishOffset.left,
    top: pos.top + article.dragFinishOffset.top
  };
  article.moveToWithAnim(destination);
}; // Used to track the article animation that will finish last
// This 'leading' animation is responsible for stopping animation when finished


Timeline.prototype.notifyArticleAnimating = function (animationType, articleId) {
  var now = new Date().getTime();
  var duration = this.options.article.animation[animationType].duration;
  var endTime = now + duration; // Check if this replaces the current 'leading' animation

  if (endTime > this.lastAnimatingArticle.endTime) {
    this.lastAnimatingArticle.id = articleId;
    this.lastAnimatingArticle.endTime = endTime;
    this.lastAnimatingArticle.animationType = animationType;
  }

  this.isAnimatingArticles = true;
  this.startAnimation();
};

Timeline.prototype.toggleAutoFit = function () {
  //toggle automatic fit to height on/off
  var isFitToHeightOn = this.options.article.autoStacking.fitToHeight = !this.options.article.autoStacking.fitToHeight;

  if (isFitToHeightOn) {
    this.fitToHeight(true);
  }

  return isFitToHeightOn;
};

Timeline.prototype.fitToHeight = function (withRedraw) {
  //for non-auto 'fit-to-screen'
  var numberOfRows = this.topRow + 1; //this.topRow = 0 for row 1, this.topRow = 1 for row 2 etc.

  if (numberOfRows === 1) return; //nothing to fit with single row

  var rowSpacing = this.options.article.autoStacking.rowSpacing = this.getFitToHeightRowSpacing();

  if (withRedraw) {
    this.requestRedraw();
  }

  return rowSpacing;
};

Timeline.prototype.getFitToHeightRowSpacing = function () {
  var options = this.options;
  var firstRowTop = this.top - options.article.distanceToMainLine;
  var lastRowTop = getValueOrFunctionResult(options.article.autoStacking.topGap, this);
  var topRowNumber = this.topRow;
  if (topRowNumber == 0) return false;
  var stackingSpace = Math.abs(firstRowTop - lastRowTop);
  var numberOfRows = topRowNumber;
  return Math.max(Math.round(stackingSpace / numberOfRows), 1);
};

Timeline.prototype.incrementRowSpacing = function (change, withRedraw) {
  this.options.article.rowSpacing = Math.max(this.options.article.rowSpacing + change, 1);

  if (withRedraw) {
    this.requestRedraw();
  }

  return this.options.article.rowSpacing;
};
// CONCATENATED MODULE: ./js/Timeline.js










var Timeline_Timeline = Timeline;
// CONCATENATED MODULE: ./js/Histropedia.js










function ownKeys(object, enumerableOnly) { var keys = keys_default()(object); if (get_own_property_symbols_default.a) { var symbols = get_own_property_symbols_default()(object); if (enumerableOnly) symbols = filter_default()(symbols).call(symbols, function (sym) { return get_own_property_descriptor_default()(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { var _context; for_each_default()(_context = ownKeys(Object(source), true)).call(_context, function (key) { defineProperty_default()(target, key, source[key]); }); } else if (get_own_property_descriptors_default.a) { define_properties_default()(target, get_own_property_descriptors_default()(source)); } else { var _context2; for_each_default()(_context2 = ownKeys(Object(source))).call(_context2, function (key) { define_property_default()(target, key, get_own_property_descriptor_default()(source, key)); }); } } return target; }






var Histropedia = _objectSpread(_objectSpread({
  Timeline: Timeline_Timeline,
  Article: Article_Article,
  Dmy: Dmy
}, Article_sorters_namespaceObject), constants_namespaceObject);

/***/ })
/******/ ]);
});