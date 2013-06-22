self.addEventListener('message', function(e) {
  var data = e.data;
  if (!data) return;
  var cmd = data['cmd'];
  var transaction = data['transaction'];
  var name = data['name'];
  var content = data['content'];
  var result = {
    transaction: transaction
  };
  switch (cmd) {
    case 'run':
      try {
        shouldRunNow = true;
        if (content)
          Module.run(content);
        else
          Module.run();
      } catch(err) {
        Module.printErr('Exit called, reset state.');
        gnuplot_create();
      };
      result['content'] = 'FINISH';
      self.postMessage(result);  
      break;
    case 'putFile':
      if (FS.findObject(name))
        FS.deleteFile(name);
      var arrc = content;
      if (typeof(content) == "string")
        arrc = Module['intArrayFromString'](content, true);
      FS.createDataFile('/', name, arrc);
      result['content'] = 'OK';
      self.postMessage(result);
      break;
    case 'getFile':
      var file = FS.findObject(name);
      result['content'] = file.contents || 0;
      self.postMessage(result);
      break;
    default:
      result['content'] = 'unknown cmd';
      self.postMessage(result);
  };
}, false);
var Module = {
    'noInitialRun': true,
    print: function(text) {
        self.postMessage({'transaction': -1, 'content': text});
    },
    printErr: function(text) {
        self.postMessage({'transaction': -2, 'content': text});
    },
};
function gnuplot_create() {
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 216712;
var _stdout;
var _stdin;
var _stderr;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,140,48,226,142,121,69,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,108,1,0,152,4,3,0,200,94,1,0,0,0,0,0,40,99,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,103,1,0,40,101,1,0,232,92,1,0,0,0,0,0,192,96,1,0,0,0,0,0,216,57,1,0,8,0,0,0,24,55,1,0,9,0,0,0,64,51,1,0,10,0,0,0,96,43,1,0,13,0,0,0,192,41,1,0,27,0,0,0,112,39,1,0,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,213,1,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,3,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,184,30,133,235,81,184,158,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,148,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,118,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,148,1,0,216,143,1,0,248,177,1,0,184,180,1,0,0,0,0,0,168,101,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,224,1,0,0,0,0,0,104,112,1,0,112,110,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,12,2,0,1,0,0,0,216,187,2,0,2,0,0,0,72,11,2,0,3,0,0,0,0,0,0,0,0,0,0,0,117,110,115,32,112,109,51,100,59,115,101,32,108,109,97,114,103,32,115,99,114,101,32,48,46,48,53,59,115,101,32,114,109,97,114,103,32,115,99,114,101,32,48,46,57,55,53,59,32,115,101,32,98,109,97,114,103,32,115,99,114,101,32,48,46,50,50,59,32,115,101,32,116,109,97,114,103,32,115,99,114,101,32,48,46,56,54,59,115,101,32,103,114,105,100,59,115,101,32,116,105,99,115,32,115,99,97,108,101,32,48,59,32,115,101,32,120,116,105,99,115,32,48,44,48,46,49,59,115,101,32,121,116,105,99,115,32,48,44,48,46,49,59,115,101,32,107,101,121,32,116,111,112,32,114,105,103,104,116,32,97,116,32,115,99,114,101,32,48,46,57,55,53,44,48,46,57,55,53,32,104,111,114,105,122,111,110,116,97,108,32,116,105,116,108,101,32,39,82,44,71,44,66,32,112,114,111,102,105,108,101,115,32,111,102,32,116,104,101,32,99,117,114,114,101,110,116,32,99,111,108,111,114,32,112,97,108,101,116,116,101,39,59,0,0,0,0,0,115,112,108,111,116,32,49,47,48,59,10,10,10,0,0,0,114,101,115,101,116,59,115,101,116,32,109,117,108,116,105,59,117,110,115,32,98,111,114,100,101,114,59,117,110,115,32,107,101,121,59,115,101,116,32,116,105,99,32,105,110,59,117,110,115,32,120,116,105,99,115,59,117,110,115,32,121,116,105,99,115,59,115,101,32,99,98,116,105,99,32,48,44,48,46,49,44,49,32,109,105,114,114,32,102,111,114,109,97,116,32,39,39,59,115,101,32,120,114,91,48,58,49,93,59,115,101,32,121,114,91,48,58,49,93,59,115,101,32,122,114,91,48,58,49,93,59,115,101,32,99,98,114,91,48,58,49,93,59,115,101,32,112,109,51,100,32,109,97,112,59,115,101,116,32,99,111,108,111,114,98,111,120,32,104,111,114,32,117,115,101,114,32,111,114,105,103,32,48,46,48,53,44,48,46,48,50,32,115,105,122,101,32,48,46,57,50,53,44,48,46,49,50,59,0,0,0,0,0,0,0,0,10,10,10,117,110,115,32,109,117,108,116,105,59,10,0,0,88,24,3,0,208,166,2,0,100,0,0,0,100,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,188,0,0,0,126,0,0,0,126,0,0,0,126,0,0,0,2,0,0,0,126,0,0,0,28,0,0,0,28,0,0,0,74,0,0,0,54,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,165,2,0,16,164,2,0,112,23,0,0,160,15,0,0,100,0,0,0,80,0,0,0,100,0,0,0,100,0,0,0,10,0,0,0,98,0,0,0,144,0,0,0,236,0,0,0,2,0,0,0,24,1,0,0,84,0,0,0,70,0,0,0,176,0,0,0,74,0,0,0,22,0,0,0,12,0,0,0,42,0,0,0,36,0,0,0,52,0,0,0,26,0,0,0,1,11,0,0,0,0,0,0,0,0,0,0,40,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,40,0,0,0,50,0,0,0,0,0,0,0,6,0,0,0,238,0,0,0,82,0,0,0,16,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,216,162,2,0,184,161,2,0,73,127,0,0,182,91,0,0,12,3,0,0,177,1,0,0,153,1,0,0,153,1,0,0,66,0,0,0,100,0,0,0,110,0,0,0,2,0,0,0,2,0,0,0,18,1,0,0,20,0,0,0,54,0,0,0,190,0,0,0,14,0,0,0,60,0,0,0,40,0,0,0,32,0,0,0,36,0,0,0,88,0,0,0,34,0,0,0,4,9,0,0,0,0,0,0,0,0,0,0,38,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,0,0,0,0,0,0,0,246,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,160,2,0,120,158,2,0,72,23,0,0,32,28,0,0,220,0,0,0,132,0,0,0,90,0,0,0,90,0,0,0,18,0,0,0,88,0,0,0,44,0,0,0,194,0,0,0,2,0,0,0,186,0,0,0,82,0,0,0,26,0,0,0,18,0,0,0,20,0,0,0,116,0,0,0,122,0,0,0,34,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,157,2,0,208,154,2,0,79,0,0,0,24,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,132,0,0,0,34,0,0,0,158,0,0,0,174,0,0,0,2,0,0,0,56,0,0,0,22,0,0,0,10,0,0,0,114,0,0,0,64,0,0,0,38,0,0,0,104,0,0,0,22,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,22,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,153,2,0,232,151,2,0,32,28,0,0,192,18,0,0,124,0,0,0,100,0,0,0,120,0,0,0,120,0,0,0,188,0,0,0,242,0,0,0,164,0,0,0,118,0,0,0,2,0,0,0,58,0,0,0,52,0,0,0,66,0,0,0,10,1,0,0,36,0,0,0,4,0,0,0,148,0,0,0,34,0,0,0,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,150,2,0,240,147,2,0,122,105,0,0,28,79,0,0,38,2,0,0,254,0,0,0,168,0,0,0,168,0,0,0,190,0,0,0,160,0,0,0,252,0,0,0,26,0,0,0,2,0,0,0,208,0,0,0,16,0,0,0,24,0,0,0,180,0,0,0,62,0,0,0,24,0,0,0,142,0,0,0,44,0,0,0,36,0,0,0,138,0,0,0,16,0,0,0,4,25,0,0,0,0,0,0,0,0,0,0,20,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,46,0,0,0,202,0,0,0,38,0,0,0,34,0,0,0,0,0,0,0,10,0,0,0,152,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,146,2,0,24,144,2,0,112,23,0,0,16,14,0,0,125,0,0,0,75,0,0,0,75,0,0,0,75,0,0,0,52,0,0,0,168,0,0,0,20,1,0,0,200,0,0,0,2,0,0,0,192,0,0,0,64,0,0,0,6,0,0,0,60,1,0,0,60,0,0,0,68,0,0,0,130,0,0,0,68,0,0,0,34,0,0,0,0,0,0,0,20,0,0,0,4,1,0,0,0,0,0,0,0,0,0,0,26,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,0,44,1,0,0,86,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,142,2,0,112,140,2,0,32,28,0,0,176,19,0,0,140,0,0,0,84,0,0,0,63,0,0,0,63,0,0,0,240,0,0,0,36,0,0,0,182,0,0,0,96,0,0,0,2,0,0,0,106,0,0,0,12,0,0,0,60,0,0,0,130,0,0,0,72,0,0,0,16,0,0,0,126,0,0,0,70,0,0,0,42,0,0,0,72,0,0,0,4,0,0,0,148,29,0,0,0,0,0,0,0,0,0,0,4,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,238,0,0,0,4,0,0,0,22,0,0,0,8,0,0,0,84,0,0,0,64,1,0,0,214,0,0,0,68,0,0,0,0,0,0,0,0,0,36,64,96,180,2,0,56,138,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,1,0,0,28,0,0,0,4,0,0,0,104,0,0,0,2,0,0,0,140,0,0,0,40,0,0,0,32,0,0,0,12,0,0,0,40,0,0,0,110,0,0,0,92,0,0,0,76,0,0,0,36,0,0,0,120,0,0,0,8,0,0,0,5,11,0,0,0,0,0,0,0,0,0,0,16,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,116,0,0,0,218,0,0,0,8,0,0,0,0,0,0,0,4,0,0,0,54,0,0,0,154,0,0,0,188,0,0,0,40,1,0,0,0,0,0,0,0,0,36,64,88,136,2,0,16,134,2,0,220,5,0,0,132,3,0,0,45,0,0,0,22,0,0,0,20,0,0,0,20,0,0,0,124,0,0,0,226,0,0,0,22,1,0,0,16,1,0,0,2,0,0,0,48,0,0,0,76,0,0,0,74,0,0,0,124,0,0,0,56,0,0,0,96,0,0,0,18,0,0,0,30,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,132,2,0,240,130,2,0,32,28,0,0,176,19,0,0,110,0,0,0,66,0,0,0,63,0,0,0,63,0,0,0,240,0,0,0,36,0,0,0,122,0,0,0,96,0,0,0,2,0,0,0,106,0,0,0,12,0,0,0,60,0,0,0,242,0,0,0,12,0,0,0,16,0,0,0,126,0,0,0,70,0,0,0,36,0,0,0,72,0,0,0,4,0,0,0,148,32,0,0,0,0,0,0,0,0,0,0,4,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,22,0,0,0,4,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,32,129,2,0,128,127,2,0,32,28,0,0,176,19,0,0,100,0,0,0,60,0,0,0,63,0,0,0,63,0,0,0,240,0,0,0,36,0,0,0,122,0,0,0,8,0,0,0,2,0,0,0,106,0,0,0,12,0,0,0,60,0,0,0,130,0,0,0,8,0,0,0,16,0,0,0,126,0,0,0,70,0,0,0,42,0,0,0,0,0,0,0,4,0,0,0,128,32,0,0,0,0,0,0,0,0,0,0,4,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,238,0,0,0,4,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,40,125,2,0,152,115,2,0,32,28,0,0,176,19,0,0,100,0,0,0,60,0,0,0,63,0,0,0,63,0,0,0,240,0,0,0,36,0,0,0,122,0,0,0,8,0,0,0,2,0,0,0,106,0,0,0,12,0,0,0,60,0,0,0,130,0,0,0,8,0,0,0,16,0,0,0,126,0,0,0,70,0,0,0,42,0,0,0,0,0,0,0,4,0,0,0,128,32,0,0,0,0,0,0,0,0,0,0,4,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,238,0,0,0,4,0,0,0,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,0,0,0,0,0,0,0,0,0,0,224,112,2,0,32,111,2,0,16,39,0,0,16,39,0,0,164,1,0,0,160,0,0,0,200,0,0,0,150,0,0,0,250,0,0,0,156,0,0,0,204,0,0,0,224,0,0,0,2,0,0,0,184,0,0,0,48,0,0,0,36,0,0,0,24,0,0,0,38,0,0,0,98,0,0,0,78,0,0,0,10,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,0,0,0,0,0,0,0,116,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,108,2,0,96,101,2,0,220,5,0,0,132,3,0,0,45,0,0,0,22,0,0,0,20,0,0,0,20,0,0,0,188,0,0,0,146,0,0,0,60,0,0,0,76,0,0,0,2,0,0,0,114,0,0,0,72,0,0,0,56,0,0,0,110,0,0,0,80,0,0,0,108,0,0,0,154,0,0,0,50,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,97,2,0,152,95,2,0,220,5,0,0,132,3,0,0,45,0,0,0,22,0,0,0,20,0,0,0,20,0,0,0,188,0,0,0,72,0,0,0,102,0,0,0,216,0,0,0,2,0,0,0,62,0,0,0,78,0,0,0,80,0,0,0,140,0,0,0,66,0,0,0,58,0,0,0,152,0,0,0,28,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,93,2,0,0,93,2,0,224,46,0,0,32,28,0,0,110,1,0,0,176,0,0,0,166,0,0,0,166,0,0,0,248,0,0,0,198,0,0,0,80,0,0,0,128,0,0,0,2,0,0,0,162,0,0,0,14,0,0,0,30,0,0,0,164,0,0,0,16,0,0,0,62,0,0,0,42,0,0,0,18,0,0,0,12,0,0,0,56,0,0,0,10,0,0,0,132,1,0,0,0,0,0,0,0,0,0,0,14,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,0,0,0,1,0,0,172,0,0,0,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,92,2,0,240,91,2,0,156,49,0,0,196,29,0,0,165,1,0,0,206,0,0,0,123,0,0,0,123,0,0,0,178,0,0,0,50,0,0,0,196,0,0,0,70,0,0,0,2,0,0,0,40,0,0,0,38,0,0,0,2,0,0,0,162,0,0,0,26,0,0,0,144,0,0,0,94,0,0,0,58,0,0,0,18,0,0,0,26,0,0,0,24,0,0,0,0,59,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,142,0,0,0,58,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,0,0,0,128,63,0,0,0,0,0,0,240,65,0,0,0,0,0,0,112,66,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,93,0,0,0,0,0,0,9,46,46,46,105,116,32,105,115,78,101,119,76,101,118,101,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,97,65,101,69,102,70,103,71,0,0,0,0,0,0,0,0,99,100,105,111,117,120,88,0,104,108,76,113,106,122,90,116,67,83,112,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,170,2,0,8,155,2,0,192,136,2,0,192,108,2,0,192,89,2,0,136,82,2,0,88,75,2,0,232,67,2,0,112,93,2,0,224,47,2,0,80,131,2,0,136,33,2,0,48,25,2,0,64,18,2,0,64,12,2,0,200,4,2,0,192,253,1,0,208,247,1,0,56,241,1,0,248,235,1,0,136,230,1,0,56,225,1,0,104,220,1,0,56,214,1,0,168,208,1,0,232,202,1,0,168,195,1,0,200,183,1,0,200,178,1,0,136,175,1,0,232,171,1,0,232,152,1,0,224,148,1,0,16,145,1,0,208,139,1,0,160,135,1,0,32,132,1,0,216,128,1,0,184,118,1,0,80,115,1,0,216,112,1,0,216,110,1,0,184,108,1,0,56,106,1,0,200,103,1,0,160,101,1,0,104,99,1,0,96,97,1,0,64,95,1,0,120,93,1,0,144,91,1,0,168,89,1,0,136,87,1,0,152,85,1,0,200,83,1,0,40,81,1,0,16,79,1,0,96,77,1,0,208,73,1,0,136,71,1,0,72,69,1,0,64,67,1,0,240,64,1,0,248,62,1,0,200,60,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,168,1,0,1,0,0,0,136,162,1,0,2,0,0,0,96,161,1,0,3,0,0,0,240,89,1,0,4,0,0,0,152,156,1,0,4,0,0,0,152,80,1,0,5,0,0,0,120,154,1,0,9,0,0,0,72,153,1,0,10,0,0,0,224,152,1,0,6,0,0,0,104,152,1,0,7,0,0,0,160,151,1,0,8,0,0,0,8,151,1,0,11,0,0,0,0,0,0,0,0,0,0,0,112,34,1,0,176,32,1,0,80,30,1,0,136,28,1,0,176,25,1,0,0,0,0,0,32,209,1,0,176,208,1,0,80,30,1,0,136,28,1,0,176,25,1,0,0,0,0,0,32,209,1,0,176,208,1,0,80,30,1,0,136,28,1,0,72,219,1,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,115,99,97,108,101,32,109,117,115,116,32,98,101,32,62,32,48,59,32,118,105,101,119,32,117,110,99,104,97,110,103,101,100,0,0,0,0,0,114,111,116,95,37,99,32,109,117,115,116,32,98,101,32,105,110,32,91,48,58,37,100,93,32,100,101,103,114,101,101,115,32,114,97,110,103,101,59,32,118,105,101,119,32,117,110,99,104,97,110,103,101,100,0,0,8,89,1,0,2,0,0,0,0,87,1,0,1,0,0,0,208,84,1,0,1,0,0,0,40,83,1,0,3,0,0,0,152,80,1,0,4,0,0,0,120,78,1,0,5,0,0,0,72,76,1,0,6,0,0,0,128,161,1,0,7,0,0,0,168,70,1,0,8,0,0,0,176,68,1,0,9,0,0,0,120,66,1,0,10,0,0,0,16,64,1,0,11,0,0,0,56,62,1,0,12,0,0,0,48,60,1,0,13,0,0,0,16,57,1,0,14,0,0,0,48,54,1,0,15,0,0,0,208,49,1,0,17,0,0,0,192,42,1,0,18,0,0,0,232,40,1,0,19,0,0,0,240,38,1,0,20,0,0,0,128,36,1,0,21,0,0,0,48,34,1,0,22,0,0,0,104,32,1,0,23,0,0,0,16,30,1,0,16,0,0,0,16,28,1,0,16,0,0,0,240,24,1,0,24,0,0,0,152,22,1,0,25,0,0,0,216,19,1,0,26,0,0,0,192,17,1,0,27,0,0,0,144,16,1,0,28,0,0,0,184,14,1,0,29,0,0,0,200,12,1,0,30,0,0,0,112,10,1,0,31,0,0,0,152,8,1,0,32,0,0,0,64,7,1,0,31,0,0,0,152,24,3,0,32,0,0,0,176,21,3,0,33,0,0,0,240,16,3,0,34,0,0,0,216,13,3,0,35,0,0,0,144,11,3,0,36,0,0,0,56,9,3,0,37,0,0,0,32,8,3,0,37,0,0,0,80,7,3,0,38,0,0,0,0,6,3,0,39,0,0,0,200,4,3,0,40,0,0,0,248,2,3,0,41,0,0,0,32,1,3,0,42,0,0,0,224,254,2,0,44,0,0,0,8,253,2,0,45,0,0,0,64,251,2,0,48,0,0,0,80,248,2,0,49,0,0,0,160,244,2,0,46,0,0,0,8,241,2,0,47,0,0,0,208,238,2,0,52,0,0,0,72,237,2,0,53,0,0,0,152,234,2,0,50,0,0,0,120,232,2,0,51,0,0,0,248,230,2,0,54,0,0,0,168,228,2,0,55,0,0,0,120,226,2,0,68,0,0,0,240,222,2,0,69,0,0,0,168,220,2,0,56,0,0,0,192,213,2,0,57,0,0,0,248,210,2,0,58,0,0,0,128,204,2,0,59,0,0,0,128,190,2,0,61,0,0,0,216,187,2,0,60,0,0,0,64,185,2,0,62,0,0,0,32,183,2,0,63,0,0,0,0,182,2,0,63,0,0,0,56,97,2,0,76,0,0,0,112,180,2,0,77,0,0,0,0,179,2,0,78,0,0,0,248,177,2,0,79,0,0,0,32,88,2,0,80,0,0,0,176,176,2,0,81,0,0,0,8,175,2,0,75,0,0,0,8,173,2,0,82,0,0,0,24,96,1,0,83,0,0,0,8,169,2,0,85,0,0,0,8,167,2,0,84,0,0,0,128,165,2,0,86,0,0,0,168,92,1,0,87,0,0,0,72,164,2,0,88,0,0,0,8,163,2,0,89,0,0,0,240,161,2,0,90,0,0,0,160,160,2,0,91,0,0,0,224,158,2,0,92,0,0,0,72,157,2,0,93,0,0,0,0,155,2,0,94,0,0,0,240,90,1,0,97,0,0,0,160,153,2,0,98,0,0,0,40,152,2,0,99,0,0,0,152,150,2,0,119,0,0,0,40,148,2,0,110,0,0,0,88,146,2,0,101,0,0,0,104,144,2,0,129,0,0,0,160,142,2,0,120,0,0,0,192,140,2,0,138,0,0,0,112,138,2,0,70,0,0,0,184,136,2,0,113,0,0,0,72,134,2,0,104,0,0,0,168,132,2,0,132,0,0,0,64,131,2,0,123,0,0,0,64,129,2,0,141,0,0,0,216,127,2,0,64,0,0,0,64,125,2,0,117,0,0,0,224,115,2,0,118,0,0,0,16,113,2,0,108,0,0,0,104,111,2,0,109,0,0,0,184,108,2,0,136,0,0,0,160,101,2,0,137,0,0,0,48,97,2,0,127,0,0,0,200,95,2,0,128,0,0,0,240,93,2,0,145,0,0,0,32,93,2,0,146,0,0,0,160,92,2,0,147,0,0,0,32,92,2,0,148,0,0,0,72,91,2,0,66,0,0,0,144,90,2,0,67,0,0,0,184,89,2,0,111,0,0,0,200,88,2,0,112,0,0,0,16,88,2,0,102,0,0,0,24,87,2,0,103,0,0,0,104,86,2,0,130,0,0,0,160,85,2,0,131,0,0,0,136,84,2,0,121,0,0,0,216,83,2,0,122,0,0,0,80,83,2,0,139,0,0,0,216,82,2,0,140,0,0,0,120,82,2,0,71,0,0,0,184,81,2,0,72,0,0,0,24,81,2,0,114,0,0,0,168,80,2,0,115,0,0,0,216,79,2,0,105,0,0,0,0,79,2,0,106,0,0,0,168,78,2,0,133,0,0,0,0,78,2,0,134,0,0,0,232,76,2,0,124,0,0,0,248,75,2,0,125,0,0,0,80,75,2,0,142,0,0,0,104,74,2,0,143,0,0,0,216,73,2,0,73,0,0,0,80,73,2,0,74,0,0,0,192,72,2,0,116,0,0,0,48,72,2,0,107,0,0,0,80,71,2,0,135,0,0,0,128,70,2,0,126,0,0,0,160,69,2,0,144,0,0,0,176,68,2,0,65,0,0,0,176,67,2,0,149,0,0,0,248,65,2,0,95,0,0,0,224,64,2,0,96,0,0,0,64,64,2,0,100,0,0,0,72,63,2,0,153,0,0,0,80,62,2,0,154,0,0,0,152,61,2,0,155,0,0,0,208,60,2,0,156,0,0,0,88,59,2,0,157,0,0,0,112,58,2,0,152,0,0,0,160,57,2,0,150,0,0,0,208,56,2,0,151,0,0,0,0,0,0,0,0,0,0,0,208,84,1,0,1,0,0,0,104,245,1,0,2,0,0,0,200,244,1,0,3,0,0,0,248,243,1,0,4,0,0,0,120,243,1,0,5,0,0,0,56,243,1,0,6,0,0,0,200,242,1,0,7,0,0,0,40,242,1,0,8,0,0,0,176,241,1,0,9,0,0,0,40,241,1,0,10,0,0,0,144,240,1,0,11,0,0,0,248,239,1,0,12,0,0,0,136,239,1,0,13,0,0,0,8,239,1,0,14,0,0,0,176,237,1,0,15,0,0,0,56,238,1,0,16,0,0,0,184,237,1,0,17,0,0,0,56,237,1,0,18,0,0,0,168,236,1,0,19,0,0,0,232,235,1,0,20,0,0,0,200,234,1,0,21,0,0,0,40,234,1,0,22,0,0,0,152,233,1,0,23,0,0,0,0,0,0,0,0,0,0,0,136,3,2,0,1,0,0,0,200,2,2,0,2,0,0,0,56,63,1,0,3,0,0,0,144,1,2,0,3,0,0,0,128,239,1,0,4,0,0,0,24,0,2,0,5,0,0,0,144,255,1,0,9,0,0,0,136,254,1,0,10,0,0,0,176,253,1,0,11,0,0,0,176,252,1,0,12,0,0,0,72,252,1,0,6,0,0,0,184,251,1,0,7,0,0,0,0,251,1,0,8,0,0,0,152,250,1,0,13,0,0,0,208,249,1,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,154,153,153,153,153,153,169,63,154,153,153,153,153,153,201,63,154,153,153,153,153,153,185,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,208,63,102,102,102,102,102,102,230,63,51,51,51,51,51,51,235,63,205,204,204,204,204,204,236,63,154,153,153,153,153,153,217,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,102,102,102,102,102,102,230,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,204,204,204,204,204,236,63,51,51,51,51,51,51,227,63,51,51,51,51,51,51,227,63,51,51,51,51,51,51,227,63,0,0,0,0,0,0,240,63,102,102,102,102,102,102,238,63,102,102,102,102,102,102,238,63,102,102,102,102,102,102,238,63,112,174,1,0,0,0,0,0,200,93,2,0,1,0,0,0,184,93,2,0,2,0,0,0,168,93,2,0,4,0,0,0,152,93,2,0,5,0,0,0,136,93,2,0,3,0,0,0,128,93,2,0,6,0,0,0,0,201,1,0,7,0,0,0,0,0,0,0,8,0,0,0,232,131,2,0,39,0,0,0,152,43,2,0,40,0,0,0,0,43,2,0,41,0,0,0,56,42,2,0,1,0,0,0,112,41,2,0,2,0,0,0,240,40,2,0,3,0,0,0,88,40,2,0,4,0,0,0,112,39,2,0,5,0,0,0,248,38,2,0,6,0,0,0,152,38,2,0,7,0,0,0,16,38,2,0,8,0,0,0,24,37,2,0,13,0,0,0,200,36,2,0,9,0,0,0,32,36,2,0,14,0,0,0,208,84,1,0,10,0,0,0,80,35,2,0,11,0,0,0,128,34,2,0,12,0,0,0,120,33,2,0,15,0,0,0,96,32,2,0,16,0,0,0,240,30,2,0,17,0,0,0,240,29,2,0,18,0,0,0,64,29,2,0,19,0,0,0,176,28,2,0,20,0,0,0,0,28,2,0,21,0,0,0,72,27,2,0,22,0,0,0,176,26,2,0,23,0,0,0,0,26,2,0,24,0,0,0,208,181,1,0,25,0,0,0,160,177,1,0,26,0,0,0,224,22,2,0,27,0,0,0,24,22,2,0,28,0,0,0,48,21,2,0,29,0,0,0,120,20,2,0,30,0,0,0,224,19,2,0,31,0,0,0,152,19,2,0,32,0,0,0,88,19,2,0,37,0,0,0,224,18,2,0,38,0,0,0,0,201,1,0,33,0,0,0,152,17,2,0,34,0,0,0,144,194,1,0,35,0,0,0,144,16,2,0,36,0,0,0,200,15,2,0,36,0,0,0,0,15,2,0,42,0,0,0,160,14,2,0,42,0,0,0,48,14,2,0,43,0,0,0,128,13,2,0,44,0,0,0,216,12,2,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,55,2,0,1,0,0,0,128,93,2,0,2,0,0,0,184,53,2,0,3,0,0,0,184,52,2,0,4,0,0,0,152,51,2,0,5,0,0,0,176,50,2,0,6,0,0,0,192,49,2,0,7,0,0,0,248,48,2,0,8,0,0,0,208,47,2,0,9,0,0,0,144,46,2,0,10,0,0,0,192,45,2,0,11,0,0,0,24,45,2,0,12,0,0,0,0,0,0,0,0,0,0,0,232,131,2,0,0,0,0,0,80,96,2,0,15,0,0,0,240,87,2,0,1,0,0,0,200,41,2,0,2,0,0,0,176,231,1,0,3,0,0,0,96,172,1,0,4,0,0,0,248,80,2,0,5,0,0,0,216,91,1,0,6,0,0,0,136,69,1,0,7,0,0,0,192,39,1,0,8,0,0,0,24,17,1,0,9,0,0,0,128,12,3,0,10,0,0,0,72,252,2,0,11,0,0,0,160,73,2,0,12,0,0,0,200,64,2,0,13,0,0,0,48,55,2,0,14,0,0,0,0,0,0,0,16,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,176,0,0,0,0,0,0,192,10,2,0,1,0,0,0,0,10,2,0,2,0,0,0,232,131,2,0,3,0,0,0,24,9,2,0,4,0,0,0,208,84,1,0,4,0,0,0,136,8,2,0,5,0,0,0,240,7,2,0,6,0,0,0,56,7,2,0,7,0,0,0,160,6,2,0,8,0,0,0,120,42,1,0,9,0,0,0,192,4,2,0,10,0,0,0,80,4,2,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,96,1,0,1,0,0,0,152,94,1,0,3,0,0,0,168,92,1,0,2,0,0,0,240,90,1,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,74,2,0,128,73,2,0,224,72,2,0,96,72,2,0,136,71,2,0,0,0,0,0,100,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,205,204,204,204,204,204,236,63,205,204,204,204,204,204,236,63,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,16,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,1,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,1,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,1,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,1,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,212,1,0,200,130,1,0,248,104,1,0,168,84,1,0,0,62,1,0,40,158,2,0,72,10,1,0,192,170,2,0,200,240,2,0,160,213,2,0,176,177,2,0,152,161,2,0,240,143,2,0,232,124,2,0,144,92,2,0,40,84,2,0,136,78,2,0,0,71,2,0,112,61,2,0,72,51,2,0,176,42,2,0,168,36,2,0,176,27,2,0,208,19,2,0,128,14,2,0,208,7,2,0,160,0,2,0,184,249,1,0,24,243,1,0,32,238,1,0,48,232,1,0,16,227,1,0,208,222,1,0,16,216,1,0,112,210,1,0,200,204,1,0,112,197,1,0,184,185,1,0,144,180,1,0,208,176,1,0,232,172,1,0,176,156,1,0,216,149,1,0,72,146,1,0,200,141,1,0,240,136,1,0,64,133,1,0,40,130,1,0,72,125,1,0,56,116,1,0,104,113,1,0,64,111,1,0,56,109,1,0,64,107,1,0,112,104,1,0,40,102,1,0,40,100,1,0,72,98,1,0,176,95,1,0,200,93,1,0,24,92,1,0,0,90,1,0,232,87,1,0,8,86,1,0,240,83,1,0,144,81,1,0,64,79,1,0,224,77,1,0,200,74,1,0,224,71,1,0,192,69,1,0,224,67,1,0,136,65,1,0,64,63,1,0,176,107,2,0,176,107,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,3,0,0,0,50,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,65,0,0,128,63,0,0,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,1,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,3,0,0,0,50,0,0,0,50,0,0,0,2,0,0,0,0,0,0,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,65,0,0,128,63,0,0,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,1,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,255,255,255,255,0,0,0,0,48,0,0,0,0,0,0,0,0,173,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,0,0,0,0,0,0,98,0,97,52,0,0,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,96,161,1,0,1,0,0,0,160,150,1,0,33,0,0,0,240,21,2,0,18,0,0,0,248,149,1,0,51,0,0,0,192,149,1,0,51,0,0,0,136,149,1,0,64,0,0,0,72,149,1,0,39,1,0,0,208,148,1,0,39,1,0,0,24,148,1,0,23,1,0,0,136,147,1,0,55,1,0,0,88,147,1,0,102,0,0,0,0,147,1,0,102,0,0,0,160,146,1,0,86,0,0,0,104,146,1,0,118,0,0,0,48,146,1,0,153,0,0,0,240,145,1,0,136,1,0,0,152,145,1,0,89,1,0,0,0,145,1,0,169,0,0,0,240,143,1,0,137,0,0,0,128,143,1,0,177,0,0,0,24,143,1,0,184,0,0,0,240,142,1,0,193,0,0,0,112,142,1,0,209,0,0,0,232,141,1,0,225,0,0,0,120,141,1,0,1,1,0,0,0,141,1,0,252,0,0,0,8,151,1,0,218,1,0,0,128,190,2,0,96,1,0,0,112,140,1,0,112,1,0,0,200,139,1,0,144,1,0,0,160,138,1,0,160,1,0,0,24,138,1,0,176,1,0,0,192,137,1,0,201,1,0,0,120,137,1,0,233,1,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,176,151,1,0,1,0,0,0,152,147,1,0,2,0,0,0,136,143,1,0,3,0,0,0,40,138,1,0,4,0,0,0,144,134,1,0,5,0,0,0,16,131,1,0,6,0,0,0,80,127,1,0,7,0,0,0,80,117,1,0,8,0,0,0,48,114,1,0,9,0,0,0,0,0,0,0,0,0,0,0,67,97,110,32,115,112,101,99,105,102,121,32,96,111,114,105,103,105,110,96,32,111,114,32,96,99,101,110,116,101,114,96,44,32,98,117,116,32,110,111,116,32,98,111,116,104,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,182,1,0,0,0,0,0,200,177,1,0,1,0,0,0,136,174,1,0,2,0,0,0,0,170,1,0,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,154,153,153,153,153,153,201,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,148,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,118,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,4,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,44,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,32,35,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,28,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,30,0,0,0,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,22,3,0,104,22,3,0,224,21,3,0,56,21,3,0,184,20,3,0,32,20,3,0,48,19,3,0,224,18,3,0,136,18,3,0,32,18,3,0,216,17,3,0,160,17,3,0,64,17,3,0,224,16,3,0,144,16,3,0,80,16,3,0,224,15,3,0,208,15,3,0,136,15,3,0,104,15,3,0,16,15,3,0,144,14,3,0,0,14,3,0,160,13,3,0])
.concat([72,13,3,0,0,13,3,0,192,12,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,170,1,0,72,152,1,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,130,1,0,40,158,2,0,16,158,2,0,0,136,0,0,216,157,2,0,208,157,2,0,120,175,2,0,0,0,0,0,88,157,2,0,64,157,2,0,48,157,2,0,24,157,2,0,16,157,2,0,8,157,2,0,0,157,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,127,0,0,0,0,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,64,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,205,204,204,204,204,204,236,63,205,204,204,204,204,204,236,63,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,16,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,86,1,0,128,201,1,0,16,195,1,0,152,182,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,236,175,203,174,131,28,212,63,5,131,82,81,72,84,238,63,69,54,70,161,27,144,249,63,152,255,235,55,110,60,2,64,78,179,64,187,67,42,8,64,182,126,159,22,40,30,15,64,4,60,105,225,178,74,246,63,1,185,171,244,102,150,205,63,22,140,132,149,142,226,195,191,74,181,106,247,109,120,121,63,254,41,194,141,220,23,24,63,203,225,243,45,104,14,165,190,132,27,223,205,9,48,240,63,248,153,229,120,38,16,232,191,53,126,55,150,221,183,137,63,17,80,205,36,107,134,132,63,156,200,73,125,117,186,47,191,218,83,12,136,64,206,160,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,251,255,255,255,251,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,46,54,0,0,0,0,0,51,0,0,0,0,0,0,0,50,48,49,51,45,48,52,45,49,50,32,0,0,0,0,0,67,111,112,121,114,105,103,104,116,32,40,67,41,32,49,57,56,54,45,49,57,57,51,44,32,49,57,57,56,44,32,50,48,48,52,44,32,50,48,48,55,45,50,48,49,51,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,97,114,99,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,112,114,105,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,117,110,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,117,108,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,117,103,117,115,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,117,110,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,111,110,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,255,2,0,52,1,0,0,120,43,2,0,240,0,0,0,144,232,1,0,6,1,0,0,24,173,1,0,4,1,0,0,120,113,1,0,200,0,0,0,136,253,2,0,222,0,0,0,168,22,3,0,148,0,0,0,240,39,1,0,102,0,0,0,64,114,1,0,14,1,0,0,184,12,3,0,134,0,0,0,144,252,2,0,170,0,0,0,248,227,2,0,20,1,0,0,192,182,2,0,12,1,0,0,80,166,2,0,182,0,0,0,144,151,2,0,18,1,0,0,24,132,2,0,236,0,0,0,104,96,2,0,192,0,0,0,208,11,2,0,0,1,0,0,160,4,2,0,210,0,0,0,168,73,2,0,136,0,0,0,152,24,3,0,84,0,0,0,56,55,2,0,54,0,0,0,144,45,2,0,100,0,0,0,224,38,2,0,166,0,0,0,152,30,2,0,152,0,0,0,144,22,2,0,132,0,0,0,176,16,2,0,52,0,0,0,104,10,2,0,204,0,0,0,40,3,2,0,34,1,0,0,24,252,1,0,174,0,0,0,16,245,1,0,66,0,0,0,208,239,1,0,80,0,0,0,224,233,1,0,2,0,0,0,224,228,1,0,64,0,0,0,32,224,1,0,168,0,0,0,96,218,1,0,50,1,0,0,96,212,1,0,24,1,0,0,88,207,1,0,198,0,0,0,240,200,1,0,194,0,0,0,128,194,1,0,220,0,0,0,160,181,1,0,20,0,0,0,176,107,2,0,0,0,0,0,128,128,1,0,232,0,0,0,200,168,1,0,42,1,0,0,16,151,1,0,42,1,0,0,184,11,2,0,94,0,0,0,40,143,1,0,138,0,0,0,216,137,1,0,216,0,0,0,56,134,1,0,36,1,0,0,208,130,1,0,10,0,0,0,24,127,1,0,120,0,0,0,192,116,1,0,48,1,0,0,0,114,1,0,88,0,0,0,216,111,1,0,208,0,0,0,48,110,1,0,144,0,0,0,200,107,1,0,62,1,0,0,240,104,1,0,44,0,0,0,224,102,1,0,106,0,0,0,192,100,1,0,230,0,0,0,128,98,1,0,42,0,0,0,40,96,1,0,48,0,0,0,96,94,1,0,50,0,0,0,120,92,1,0,30,1,0,0,184,90,1,0,16,1,0,0,216,88,1,0,56,0,0,0,216,86,1,0,46,1,0,0,160,84,1,0,8,1,0,0,216,82,1,0,26,0,0,0,144,92,2,0,104,0,0,0,104,105,1,0,98,0,0,0,32,76,1,0,86,0,0,0,176,72,1,0,22,1,0,0,120,70,1,0,184,0,0,0,112,68,1,0,186,0,0,0,48,66,1,0,250,0,0,0,176,63,1,0,248,0,0,0,248,61,1,0,62,0,0,0,248,59,1,0,160,0,0,0,224,56,1,0,122,0,0,0,16,54,1,0,128,0,0,0,152,49,1,0,146,0,0,0,128,42,1,0,178,0,0,0,128,40,1,0,32,0,0,0,192,38,1,0,224,0,0,0,64,36,1,0,90,0,0,0,0,34,1,0,72,0,0,0,48,32,1,0,2,1,0,0,224,29,1,0,54,1,0,0,176,27,1,0,58,0,0,0,216,24,1,0,30,0,0,0,40,22,1,0,96,0,0,0,176,19,1,0,254,0,0,0,144,17,1,0,58,1,0,0,72,16,1,0,202,0,0,0,152,14,1,0,46,0,0,0,104,12,1,0,226,0,0,0,64,10,1,0,28,1,0,0,128,8,1,0,212,0,0,0,32,7,1,0,56,1,0,0,80,24,3,0,150,0,0,0,232,20,3,0,252,0,0,0,208,16,3,0,34,0,0,0,144,13,3,0,26,1,0,0,136,135,1,0,28,0,0,0,8,9,3,0,4,0,0,0,16,8,3,0,244,0,0,0,16,7,3,0,156,0,0,0,216,5,3,0,50,1,0,0,152,4,3,0,196,0,0,0,16,132,1,0,196,0,0,0,192,0,3,0,206,0,0,0,176,254,2,0,234,0,0,0,72,11,2,0,8,0,0,0,224,250,2,0,32,1,0,0,24,248,2,0,126,0,0,0,120,244,2,0,126,0,0,0,192,240,2,0,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,251,1,0,80,244,1,0,80,239,1,0,96,233,1,0,112,228,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,91,1,0,0,0,0,0,80,89,1,0,0,0,0,0,112,138,1,0,200,134,1,0,102,105,116,46,108,111,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,0,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,122,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,137,1,0,0,0,0,0,8,137,1,0,1,0,0,0,176,136,1,0,2,0,0,0,128,136,1,0,3,0,0,0,48,136,1,0,4,0,0,0,248,44,2,0,9,0,0,0,184,149,2,0,10,0,0,0,136,134,1,0,11,0,0,0,48,134,1,0,12,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,50,0,0,0,50,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,65,0,0,128,63,1,0,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,2,0,0,0,50,0,0,0,50,0,0,0,0,0,0,0,0,0,1,0,0,0,128,63,0,0,128,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,65,0,0,128,63,1,0,0,0,208,7,0,0,250,126,106,188,116,147,104,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,241,104,227,136,181,248,228,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,203,1,0,128,175,2,0,200,41,2,0,176,231,1,0,96,172,1,0,0,113,1,0,216,91,1,0,136,69,1,0,192,39,1,0,24,17,1,0,128,12,3,0,72,252,2,0,136,227,2,0,128,182,2,0,8,166,2,0,96,151,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,251,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,65,0,0,0,0,0,0,0,0,0,0,240,63,65,114,105,97,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,65,0,0,0,0,65,114,105,97,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,26,2,0,1,0,0,0,0,0,1,0,48,19,2,0,0,0,0,0,1,0,1,0])
.concat([168,18,2,0,3,0,0,0,0,0,2,0,144,12,2,0,2,0,0,0,1,0,2,0,64,5,2,0,5,0,0,0,0,0,4,0,32,254,1,0,4,0,0,0,1,0,4,0,40,248,1,0,7,0,0,0,0,0,8,0,120,241,1,0,6,0,0,0,1,0,8,0,40,236,1,0,8,0,0,0,2,0,4,0,176,230,1,0,9,0,0,0,2,0,8,0,128,225,1,0,8,0,0,0,2,0,4,0,208,220,1,0,9,0,0,0,2,0,8,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,72,41,2,0,0,0,0,0,40,35,2,0,3,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,0,0,0,0,0,0,0,101,120,101,99,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,10,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,8,112,1,0,1,0,0,0,56,110,1,0,2,0,0,0,32,108,1,0,3,0,0,0,104,105,1,0,4,0,0,0,24,103,1,0,5,0,0,0,0,101,1,0,6,0,0,0,160,98,1,0,7,0,0,0,0,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,127,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,68,2,0,64,233,2,0,168,57,2,0,16,166,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,1,0,1,2,2,1,0,1,3,2,1,0,24,166,0,0,10,0,0,0,120,165,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,198,0,0,2,0,0,0,0,0,0,0,1,0,0,0,200,7,0,0,2,0,0,0,1,0,0,0,1,0,0,0,24,3,0,0,2,0,0,0,2,0,0,0,2,0,0,0,120,3,0,0,2,0,0,0,3,0,0,0,2,0,0,0,40,3,0,0,1,0,0,0,6,0,0,0,4,0,0,0,136,3,0,0,1,0,0,0,7,0,0,0,4,0,0,0,32,3,0,0,1,0,0,0,10,0,0,0,8,0,0,0,128,3,0,0,1,0,0,0,11,0,0,0,8,0,0,0,32,144,0,0,1,0,0,0,8,0,0,0,4,0,0,0,40,144,0,0,1,0,0,0,9,0,0,0,8,0,0,0,24,190,0,0,3,0,0,0,0,0,0,0,1,0,0,0,192,7,0,0,1,0,0,0,1,0,0,0,1,0,0,0,240,63,0,0,1,0,0,0,2,0,0,0,2,0,0,0,64,4,0,0,1,0,0,0,3,0,0,0,2,0,0,0,104,129,0,0,4,0,0,0,4,0,0,0,4,0,0,0,136,7,0,0,2,0,0,0,5,0,0,0,4,0,0,0,112,120,0,0,2,0,0,0,6,0,0,0,4,0,0,0,128,7,0,0,2,0,0,0,7,0,0,0,4,0,0,0,48,144,0,0,2,0,0,0,8,0,0,0,4,0,0,0,224,179,0,0,2,0,0,0,9,0,0,0,8,0,0,0,128,34,1,0,253,255,255,255,252,255,255,255,251,255,255,255,0,66,2,0,252,255,255,255,251,255,255,255,253,255,255,255,216,56,2,0,251,255,255,255,253,255,255,255,252,255,255,255,136,46,2,0,252,255,255,255,253,255,255,255,251,255,255,255,104,39,2,0,253,255,255,255,251,255,255,255,252,255,255,255,88,32,2,0,251,255,255,255,252,255,255,255,253,255,255,255,240,23,2,0,253,255,255,255,252,255,255,255,251,255,255,255,144,17,2,0,252,255,255,255,251,255,255,255,253,255,255,255,64,11,2,0,251,255,255,255,253,255,255,255,252,255,255,255,72,4,2,0,252,255,255,255,253,255,255,255,251,255,255,255,152,252,1,0,253,255,255,255,251,255,255,255,252,255,255,255,48,246,1,0,251,255,255,255,252,255,255,255,253,255,255,255,248,44,2,0,253,255,255,255,252,255,255,255,251,255,255,255,120,38,2,0,252,255,255,255,253,255,255,255,251,255,255,255,216,88,2,0,253,255,255,255,252,255,255,255,251,255,255,255,200,81,2,0,252,255,255,255,253,255,255,255,251,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,253,255,255,255,252,255,255,255,251,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,178,1,0,134,0,0,0,48,118,1,0,112,0,0,0,24,95,1,0,6,1,0,0,112,73,1,0,6,1,0,0,64,6,3,0,92,0,0,0,96,20,1,0,78,0,0,0,152,17,3,0,166,0,0,0,72,255,2,0,166,0,0,0,80,231,2,0,94,0,0,0,200,185,2,0,112,0,0,0,24,79,1,0,112,0,0,0,80,167,2,0,46,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,194,176,0,0,0,0,0,0,1,0,0,0,1,0,1,0,18,0,0,0,1,0,1,0,33,0,0,0,1,0,1,0,51,0,0,0,1,0,1,0,64,0,0,0,1,0,1,0,86,0,0,0,2,0,1,0,102,0,0,0,2,0,1,0,118,0,0,0,3,0,1,0,137,0,0,0,3,0,1,0,153,0,0,0,1,0,1,0,169,0,0,0,3,0,1,0,177,0,0,0,1,0,1,0,193,0,0,0,1,0,1,0,184,0,0,0,1,0,1,0,209,0,0,0,1,0,1,0,225,0,0,0,2,0,2,0,252,0,0,0,4,0,1,0,1,1,0,0,4,0,1,0,218,1,0,0,2,0,1,0,23,1,0,0,2,0,1,0,39,1,0,0,2,0,1,0,55,1,0,0,3,0,1,0,89,1,0,0,1,0,1,0,96,1,0,0,1,0,2,0,112,1,0,0,2,0,1,0,136,1,0,0,1,0,0,0,144,1,0,0,1,0,2,0,160,1,0,0,3,0,2,0,176,1,0,0,4,0,2,0,201,1,0,0,2,0,1,0,233,1,0,0,2,0,3,0,0,0,0,0,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,3,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,184,30,133,235,81,184,158,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,63,1,0,255,255,255,0,72,63,1,0,0,0,0,0,80,232,1,0,160,160,160,0,216,231,1,0,0,0,255,0,48,231,1,0,0,192,0,0,232,230,1,0,255,128,0,0,120,230,1,0,255,0,192,0,144,229,1,0,238,238,0,0,32,229,1,0,0,64,192,0,176,228,1,0,0,200,200,0,80,228,1,0,225,105,65,0,168,227,1,0,32,192,255,0,96,227,1,0,64,128,0,0,208,226,1,0,255,128,192,0,72,226,1,0,128,96,48,0,168,225,1,0,0,0,139,0,40,225,1,0,0,128,64,0,184,224,1,0,255,128,255,0,88,224,1,0,212,255,127,0,248,223,1,0,42,42,165,0,192,223,1,0,0,255,255,0,96,223,1,0,208,224,64,0,248,222,1,0,0,0,0,0,120,222,1,0,26,26,26,0,216,221,1,0,51,51,51,0,96,221,1,0,77,77,77,0,96,220,1,0,102,102,102,0,96,219,1,0,127,127,127,0,200,218,1,0,153,153,153,0,152,217,1,0,179,179,179,0,144,1,2,0,192,192,192,0,56,217,1,0,204,204,204,0,200,216,1,0,229,229,229,0,64,216,1,0,255,255,255,0,200,215,1,0,50,50,240,0,64,215,1,0,144,238,144,0,216,214,1,0,230,216,173,0,40,214,1,0,240,85,240,0,64,213,1,0,255,255,224,0,152,212,1,0,130,221,238,0,56,212,1,0,193,182,255,0,184,211,1,0,238,238,175,0,16,211,1,0,0,215,255,0,32,63,1,0,0,255,0,0,64,210,1,0,0,100,0,0,128,209,1,0,127,255,0,0,16,209,1,0,34,139,34,0,152,208,1,0,87,139,46,0,168,62,1,0,255,0,0,0,120,207,1,0,139,0,0,0,32,207,1,0,112,25,25,0,168,206,1,0,128,0,0,0,48,206,1,0,205,0,0,0,224,205,1,0,235,206,135,0,96,62,1,0,255,255,0,0,40,204,1,0,255,0,255,0,176,203,1,0,209,206,0,0,216,202,1,0,147,20,255,0,192,201,1,0,80,127,255,0,40,201,1,0,128,128,240,0,192,200,1,0,0,69,255,0,152,199,1,0,114,128,250,0,48,199,1,0,122,150,233,0,200,197,1,0,140,230,240,0,56,197,1,0,107,183,189,0,152,196,1,0,11,134,184,0,72,196,1,0,220,245,245,0,160,195,1,0,32,128,160,0,48,195,1,0,0,165,255,0,176,194,1,0,238,130,238,0,88,194,1,0,211,0,148,0,32,194,1,0,221,160,221,0,248,185,1,0,64,80,144,0,208,185,1,0,47,107,85,0,128,185,1,0,0,20,128,0,40,185,1,0,20,20,128,0,96,184,1,0,20,64,128,0,192,183,1,0,128,64,128,0,168,182,1,0,192,96,128,0,240,181,1,0,255,96,128,0,144,181,1,0,0,128,128,0,112,181,1,0,64,128,255,0,248,180,1,0,64,160,255,0,168,180,1,0,96,160,255,0,56,180,1,0,112,160,255,0,200,179,1,0,192,192,255,0,48,179,1,0,128,255,255,0,184,178,1,0,192,255,255,0,24,178,1,0,158,183,205,0,184,177,1,0,240,255,240,0,128,177,1,0,205,182,160,0,96,177,1,0,193,255,193,0,40,177,1,0,176,192,205,0,232,176,1,0,64,255,124,0,160,176,1,0,32,255,160,0,56,63,1,0,190,190,190,0,104,176,1,0,211,211,211,0,240,175,1,0,211,211,211,0,120,175,1,0,160,160,160,0,248,174,1,0,205,182,160,0,128,174,1,0,0,0,0,0,56,174,1,0,26,26,26,0,216,173,1,0,51,51,51,0,136,173,1,0,77,77,77,0,16,173,1,0,102,102,102,0,192,172,1,0,127,127,127,0,88,172,1,0,153,153,153,0,32,172,1,0,179,179,179,0,224,171,1,0,204,204,204,0,8,171,1,0,229,229,229,0,248,169,1,0,255,255,255,0,0,0,0,0,255,255,255,255,100,118,1,0,254,255,255,255,1,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,205,204,204,204,204,204,236,63,154,153,153,153,153,153,201,63,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,154,153,153,153,153,153,169,63,51,51,51,51,51,51,227,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,2,0,0,0,1,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,148,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,118,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,131,1,0,176,127,1,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,28,0,0,0,0,0,0,72,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,65,0,0,0,0,0,0,0,0,0,0,0,0,22,0,0,0,0,0,0,0,83,119,105,116,122,101,114,108,97,110,100,76,105,103,104,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,5,3,0,136,3,3,0,192,60,1,0,192,1,3,0,88,255,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,56,46,51,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,236,1,0,6,0,0,0,64,184,2,0,2,1,0,0,40,46,2,0,64,0,0,0,144,234,1,0,206,0,0,0,168,174,1,0,24,0,0,0,72,114,1,0,210,0,0,0,200,92,1,0,42,0,0,0,192,70,1,0,142,0,0,0,0,41,1,0,8,1,0,0,232,17,1,0,90,0,0,0,248,13,3,0,222,0,0,0,80,253,2,0,222,0,0,0,208,228,2,0,150,0,0,0,48,183,2,0,108,0,0,0,24,167,2,0,246,0,0,0,48,152,2,0,218,0,0,0,200,132,2,0,30,0,0,0,56,97,2,0,154,0,0,0,32,88,2,0,254,0,0,0,32,81,2,0,16,0,0,0,232,73,2,0,8,1,0,0,232,64,2,0,12,1,0,0,208,55,2,0,136,0,0,0,200,45,2,0,170,0,0,0,8,39,2,0,86,0,0,0,0,31,2,0,82,0,0,0,232,22,2,0,232,0,0,0,40,17,2,0,180,0,0,0,208,10,2,0,120,0,0,0,152,3,2,0,32,0,0,0,88,252,1,0,14,0,0,0,120,245,1,0,228,0,0,0,0,240,1,0,20,0,0,0,56,234,1,0,172,0,0,0,48,229,1,0,148,0,0,0,104,224,1,0,130,0,0,0,208,218,1,0,214,0,0,0,168,212,1,0,234,0,0,0,136,207,1,0,220,0,0,0,56,201,1,0,176,0,0,0,128,111,1,0,74,0,0,0,0,0,0,0,230,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,157,255,255,255,0,0,0,0,104,249,1,0,114,0,0,0,56,249,1,0,104,0,0,0,168,248,1,0,99,0,0,0,200,247,1,0,121,0,0,0,104,246,1,0,120,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,88,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,240,1,0,176,234,1,0,120,229,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,254,255,255,255,0,0,0,0,254,255,255,255,254,255,255,255,254,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,224,191,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,66,111,108,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,68,1,0,0,0,0,0,57,180,200,118,190,159,240,63,96,66,1,0,0,0,0,0,47,221,36,6,129,149,241,63,0,64,1,0,0,0,0,0,135,22,217,206,247,83,241,63,32,62,1,0,0,0,0,0,147,24,4,86,14,45,240,63,8,103,1,0,0,0,0,0,49,8,172,28,90,100,239,63,144,98,1,0,0,0,0,0,133,235,81,184,30,133,239,63,240,100,1,0,0,0,0,0,227,165,155,196,32,176,238,63,64,96,1,0,0,0,0,0,0,0,0,0,0,0,240,63,112,78,1,0,0,0,0,0,8,172,28,90,100,59,245,63,216,72,1,0,0,0,0,0,8,172,28,90,100,59,245,63,56,76,1,0,0,0,0,0,176,114,104,145,237,124,243,63,144,70,1,0,0,0,0,0,219,249,126,106,188,116,245,63,224,24,1,0,0,0,0,0,78,98,16,88,57,180,236,63,32,146,2,0,0,0,0,0,155,85,159,171,173,216,243,63,232,145,2,0,0,0,0,0,210,111,95,7,206,25,237,63,208,145,2,0,0,0,0,0,39,194,134,167,87,202,243,63,184,145,2,0,0,0,0,0,188,150,144,15,122,54,237,63,160,145,2,0,0,0,0,0,84,82,39,160,137,176,246,63,128,145,2,0,0,0,0,0,215,163,112,61,10,215,241,63,104,145,2,0,0,0,0,0,233,72,46,255,33,253,236,63,8,145,2,0,0,0,0,0,28,124,97,50,85,48,246,63,112,144,2,0,0,0,0,0,224,190,14,156,51,162,246,63,72,144,2,0,0,0,0,0,238,235,192,57,35,74,243,63,0,144,2,0,0,0,0,0,208,213,86,236,47,187,242,63,200,143,2,0,0,0,0,0,201,118,190,159,26,47,245,63,176,143,2,0,0,0,0,0,178,157,239,167,198,75,245,63,152,143,2,0,0,0,0,0,238,235,192,57,35,74,243,63,128,143,2,0,0,0,0,0,121,88,168,53,205,59,243,63,88,143,2,0,0,0,0,0,121,88,168,53,205,59,243,63,64,143,2,0,0,0,0,0,233,72,46,255,33,253,236,63,16,143,2,0,0,0,0,0,233,72,46,255,33,253,236,63,168,142,2,0,0,0,0,0,233,72,46,255,33,253,236,63,144,142,2,0,0,0,0,0,135,22,217,206,247,83,249,63,120,142,2,0,0,0,0,0,211,77,98,16,88,57,242,63,96,142,2,0,0,0,0,0,211,77,98,16,88,57,242,63,72,142,2,0,0,0,0,0,47,221,36,6,129,149,241,63,32,142,2,0,0,0,0,0,147,24,4,86,14,45,240,63,16,142,2,0,0,0,0,0,176,114,104,145,237,124,243,63,184,141,2,0,0,0,0,0,219,249,126,106,188,116,245,63,168,141,2,0,0,0,0,0,227,165,155,196,32,176,238,63,128,141,2,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,160,15,0,0,0,0,0,0,255,255,255,255,0,0,0,0,112,23,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,251,255,255,255,0,0,0,0,176,107,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,117,1,0,152,114,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,63,1,0,0,0,6,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,2,0,0,0,0,0,0,0,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,56,143,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,37,45,49,55,115,32,32,37,115,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,1,0,0,0,0,0,0,0,0,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,1,0,0,0,252,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,25,1,0,0,0,0,0])
.concat([248,235,2,0,1,0,0,0,192,170,2,0,2,0,0,0,216,60,1,0,3,0,0,0,112,196,1,0,4,0,0,0,48,136,1,0,5,0,0,0,128,136,1,0,6,0,0,0,184,149,2,0,7,0,0,0,24,89,2,0,8,0,0,0,184,180,1,0,9,0,0,0,40,26,3,0,10,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,122,0,0,0,1,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,121,0,0,0,5,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,120,0,0,0,5,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,99,98,0,0,5,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,122,50,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,121,50,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,120,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,114,0,0,0,2,0,0,0,0,0,0,0,0,0,20,192,0,0,0,0,0,0,20,64,116,0,0,0,0,0,0,0,0,0,0,0,0,0,20,192,0,0,0,0,0,0,20,64,117,0,0,0,0,0,0,0,0,0,0,0,0,0,20,192,0,0,0,0,0,0,20,64,118,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,36,192,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,37,32,103,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,240,63,0,0,0,0,0,0,224,63,1,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,254,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,45,2,0,216,38,2,0,136,30,2,0,136,22,2,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,97,110,0,0,0,0,0,70,101,98,0,0,0,0,0,77,97,114,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,121,0,0,0,0,0,74,117,110,0,0,0,0,0,74,117,108,0,0,0,0,0,65,117,103,0,0,0,0,0,83,101,112,0,0,0,0,0,79,99,116,0,0,0,0,0,78,111,118,0,0,0,0,0,68,101,99,0,0,0,0,0,83,117,110,0,0,0,0,0,77,111,110,0,0,0,0,0,84,117,101,0,0,0,0,0,87,101,100,0,0,0,0,0,84,104,117,0,0,0,0,0,70,114,105,0,0,0,0,0,83,97,116,0,0,0,0,0,0,0,0,0,0,0,0,0,32,32,71,114,97,121,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,100,105,118,125,32,100,101,102,32,10,0,47,100,103,100,120,32,123,103,114,97,121,118,32,71,114,97,121,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,71,114,97,121,65,32,103,105,100,120,32,49,32,115,117,98,32,103,101,116,10,0,0,0,32,32,123,71,114,97,121,65,32,103,105,100,120,32,103,101,116,32,103,114,97,121,118,32,103,101,32,123,101,120,105,116,125,32,105,102,32,47,103,105,100,120,32,103,105,100,120,32,49,32,97,100,100,32,100,101,102,125,32,108,111,111,112,125,32,100,101,102,10,0,0,0,87,105,108,108,32,110,111,116,32,99,104,101,99,107,32,102,111,114,32,117,110,100,101,102,105,110,101,100,32,100,97,116,97,112,111,105,110,116,115,32,40,109,97,121,32,99,97,117,115,101,32,99,114,97,115,104,101,115,41,46,10,0,0,0,117,110,100,101,102,105,110,101,100,32,118,97,114,105,97,98,108,101,58,32,37,115,0,0,101,120,101,99,117,116,105,110,103,58,32,37,115,0,0,0,47,103,114,97,121,105,110,100,101,120,32,123,47,103,105,100,120,32,48,32,100,101,102,10,0,0,0,0,0,0,0,0,65,109,98,105,103,117,111,117,115,32,114,101,113,117,101,115,116,32,39,37,46,42,115,39,59,32,112,111,115,115,105,98,108,101,32,109,97,116,99,104,101,115,58,10,0,0,0,0,93,32,100,101,102,10,0,0,116,109,95,109,100,97,121,0,97,108,108,95,116,101,114,109,95,110,97,109,101,115,50,0,47,37,115,32,91,0,0,0,108,115,0,0,0,0,0,0,105,110,100,101,120,95,109,105,110,0,0,0,0,0,0,0,110,111,32,99,111,108,117,109,110,32,119,105,116,104,32,104,101,97,100,101,114,32,34,37,115,34,0,0,0,0,0,0,66,108,117,101,65,0,0,0,10,9,86,97,114,105,97,98,108,101,115,32,98,101,103,105,110,110,105,110,103,32,119,105,116,104,32,37,115,58,10,0,114,101,108,36,97,116,105,118,101,0,0,0,0,0,0,0,71,114,101,101,110,65,0,0,99,104,97,110,103,101,32,118,105,101,119,32,40,115,99,97,108,105,110,103,41,46,32,85,115,101,32,60,99,116,114,108,62,32,116,111,32,115,99,97,108,101,32,116,104,101,32,97,120,101,115,32,111,110,108,121,46,0,0,0,0,0,0,0,82,101,100,65,0,0,0,0,71,114,97,121,65,0,0,0,32,100,101,102,10,0,0,0,101,108,108,105,112,115,101,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,108,32,39,37,99,39,46,32,87,105,108,108,32,98,101,32,82,71,66,10,0,0,0,0,0,40,88,89,90,41,0,0,0,67,111,110,116,105,110,117,101,46,0,0,0,0,0,0,0,40,89,73,81,41,0,0,0,122,116,105,99,115,0,0,0,40,67,77,89,41,0,0,0,116,109,95,104,111,117,114,0,37,115,32,0,0,0,0,0,40,72,83,86,41,0,0,0,108,105,110,101,116,121,112,101,36,115,0,0,0,0,0,0,115,117,109,115,113,0,0,0,115,116,114,105,110,103,99,111,108,117,109,110,40,41,32,99,97,108,108,101,100,32,102,114,111,109,32,105,110,118,97,108,105,100,32,99,111,110,116,101,120,116,0,0,0,0,0,0,40,82,71,66,41,0,0,0,10,9,65,108,108,32,97,118,97,105,108,97,98,108,101,32,118,97,114,105,97,98,108,101,115,58,10,0,0,0,0,0,47,67,111,108,111,114,83,112,97,99,101,32,0,0,0,0,116,105,109,101,32,102,111,114,109,97,116,32,115,116,114,105,110,103,32,101,120,112,101,99,116,101,100,0,0,0,0,0,10,37,115,111,98,106,101,99,116,32,37,50,100,32,0,0,68,105,109,95,49,0,0,0,60,66,50,45,77,111,116,105,111,110,62,0,0,0,0,0,104,101,97,100,32,115,105,122,101,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,32,32,47,103,32,123,115,116,114,111,107,101,32,112,109,51,100,114,111,117,110,100,32,112,109,51,100,71,97,109,109,97,32,101,120,112,32,115,101,116,103,114,97,121,125,32,98,105,110,100,32,100,101,102,10,0,125,123,10,0,0,0,0,0,83,117,98,116,111,112,105,99,32,111,102,32,0,0,0,0,32,32,125,32,105,102,101,108,115,101,10,0,0,0,0,0,10,32,32,32,32,32,32,32,83,101,108,101,99,116,83,112,97,99,101,32,115,101,116,114,103,98,99,111,108,111,114,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,0,0,99,70,37,105,32,67,111,110,115,116,114,97,105,110,32,0,83,116,111,112,46,0,0,0,10,9,0,0,0,0,0,0,99,70,37,105,32,67,111,110,115,116,114,97,105,110,32,101,120,99,104,32,0,0,0,0,116,109,95,109,105,110,0,0,32,0,0,0,0,0,0,0,99,70,37,105,32,67,111,110,115,116,114,97,105,110,32,101,120,99,104,32,100,117,112,32,0,0,0,0,0,0,0,0,108,105,110,101,115,36,116,121,108,101,0,0,0,0,0,0,49,32,101,120,99,104,32,115,117,98,32,0,0,0,0,0,97,108,108,0,0,0,0,0,10,9,9,9,32,32,32,32,116,111,32,0,0,0,0,0,32,32,47,103,32,123,115,116,114,111,107,101,32,112,109,51,100,114,111,117,110,100,32,100,117,112,32,0,0,0,0,0,32,32,125,123,10,0,0,0,99,104,97,110,103,101,32,118,105,101,119,32,40,114,111,116,97,116,105,111,110,41,46,32,85,115,101,32,60,99,116,114,108,62,32,116,111,32,114,111,116,97,116,101,32,116,104,101,32,97,120,101,115,32,111,110,108,121,46,0,0,0,0,0,32,32,32,32,32,32,32,32,83,101,108,101,99,116,83,112,97,99,101,32,115,101,116,114,103,98,99,111,108,111,114,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,0,0,32,32,32,32,47,103,32,123,115,116,114,111,107,101,32,112,109,51,100,114,111,117,110,100,32,47,103,114,97,121,118,32,101,120,99,104,32,100,101,102,32,105,110,116,101,114,112,111,108,97,116,101,10,0,0,0,32,32,73,110,116,101,114,112,111,108,97,116,101,100,67,111,108,111,114,32,123,32,37,37,32,73,110,116,101,114,112,111,108,97,116,105,111,110,32,118,115,46,32,82,71,66,45,70,111,114,109,117,108,97,10,0,67,111,108,111,114,32,73,110,116,101,114,112,111,108,97,116,101,100,67,111,108,111,114,32,111,114,32,123,32,37,32,67,79,76,79,85,82,32,118,115,46,32,71,82,65,89,32,109,97,112,10,0,0,0,0,0,10,10,40,83,41,116,111,112,32,102,105,116,44,32,40,67,41,111,110,116,105,110,117,101,44,32,40,69,41,120,101,99,117,116,101,32,70,73,84,95,83,67,82,73,80,84,58,32,32,0,0,0,0,0,0,0,102,97,108,115,101,32,123,32,37,32,67,79,76,79,85,82,32,118,115,46,32,71,82,65,89,32,109,97,112,10,0,0,47,112,109,51,100,71,97,109,109,97,32,49,46,48,32,37,103,32,71,97,109,109,97,32,109,117,108,32,100,105,118,32,100,101,102,10,0,0,0,0,116,109,95,115,101,99,0,0,97,108,108,95,116,101,114,109,95,110,97,109,101,115,0,0,9,123,112,111,112,32,49,125,32,123,109,97,120,99,111,108,111,114,115,32,109,117,108,32,102,108,111,111,114,32,109,97,120,99,111,108,111,114,115,32,49,32,115,117,98,32,100,105,118,125,32,105,102,101,108,115,101,125,32,105,102,125,32,100,101,102,10,0,0,0,0,0,108,97,36,98,101,108,0,0,99,114,101,97,116,101,95,97,110,100,95,115,101,116,95,118,97,114,0,0,0,0,0,0,99,111,108,117,109,110,40,41,32,99,97,108,108,101,100,32,102,114,111,109,32,105,110,118,97,108,105,100,32,99,111,110,116,101,120,116,0,0,0,0,47,112,109,51,100,114,111,117,110,100,32,123,109,97,120,99,111,108,111,114,115,32,48,32,103,116,32,123,100,117,112,32,49,32,103,101,10,0,0,0,108,105,110,101,115,116,121,108,101,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,46,46,47,116,101,114,109,47,112,111,115,116,46,116,114,109,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,115,111,98,106,101,99,116,32,37,50,100,32,112,111,108,121,103,111,110,32,0,0,0,60,66,49,45,77,111,116,105,111,110,62,0,0,0,0,0,110,111,102,105,108,108,36,101,100,0,0,0,0,0,0,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,32,39,37,99,39,10,0,0,0,47,73,110,116,101,114,112,111,108,97,116,101,100,67,111,108,111,114,32,116,114,117,101,32,100,101,102,10,0,0,0,0,104,101,108,112,32,112,114,111,109,112,116,0,0,0,0,0,47,73,110,116,101,114,112,111,108,97,116,101,100,67,111,108,111,114,32,102,97,108,115,101,32,100,101,102,10,0,0,0,47,109,97,120,99,111,108,111,114,115,32,37,105,32,100,101,102,10,0,0,0,0,0,0,103,115,97,118,101,32,37,32,99,111,108,111,117,114,32,112,97,108,101,116,116,101,32,98,101,103,105,110,10,0,0,0,37,115,95,101,114,114,0,0,103,114,101,115,116,111,114,101,32,37,32,99,111,108,111,117,114,32,112,97,108,101,116,116,101,32,101,110,100,10,0,0,37,115,32,103,32,0,0,0,101,120,112,105,110,116,0,0,32,32,37,49,53,115,32,32,37,115,10,0,0,0,0,0,49,32,103,32,0,0,0,0,107,101,121,116,36,105,116,108,101,0,0,0,0,0,0,0,112,111,115,95,109,97,120,95,121,0,0,0,0,0,0,0,68,97,116,97,32,102,105,108,101,32,105,115,32,101,109,112,116,121,0,0,0,0,0,0,48,32,103,32,0,0,0,0,9,108,105,110,101,115,116,121,108,101,32,37,100,44,32,0,37,51,46,50,102,32,37,51,46,50,102,32,37,51,46,50,102,32,67,32,0,0,0,0,109,97,114,107,32,122,111,111,109,32,114,101,103,105,111,110,32,40,111,110,108,121,32,102,111,114,32,50,100,45,112,108,111,116,115,32,97,110,100,32,109,97,112,115,41,46,0,0,76,67,37,49,99,32,115,101,116,114,103,98,99,111,108,111,114,10,0,0,0,0,0,0,80,76,32,0,0,0,0,0,104,101,108,112,32,98,117,102,102,101,114,0,0,0,0,0,32,80,97,116,116,101,114,110,37,100,32,102,105,108,108,32,103,114,101,115,116,111,114,101,10,0,0,0,0,0,0,0,32,37,46,49,102,32,80,111,108,121,70,105,108,108,10,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,110,117,112,108,111,116,47,52,46,54,0,0,0,0,32,47,84,114,97,110,115,112,97,114,101,110,116,80,97,116,116,101,114,110,115,32,116,114,117,101,32,100,101,102,10,0,37,46,48,102,0,0,0,0,32,37,46,50,102,32,80,111,108,121,70,105,108,108,10,0,101,120,112,101,99,116,101,100,32,111,112,116,105,111,110,97,108,32,97,120,105,115,32,110,97,109,101,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,32,49,32,80,111,108,121,70,105,108,108,10,0,0,0,0,97,105,114,121,0,0,0,0,10,65,118,97,105,108,97,98,108,101,32,116,101,114,109,105,110,97,108,32,116,121,112,101,115,58,10,0,0,0,0,0,32,37,105,32,37,105,32,76,0,0,0,0,0,0,0,0,32,37,105,32,37,105,32,86,0,0,0,0,0,0,0,0,107,36,101,121,0,0,0,0,112,111,115,95,109,105,110,95,121,0,0,0,0,0,0,0,68,97,116,97,32,102,105,108,101,32,114,101,97,100,32,101,114,114,111,114,0,0,0,0,80,65,71,69,82,0,0,0,108,105,110,101,116,121,112,101,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,0,103,115,97,118,101,32,0,0,60,66,51,62,0,0,0,0,102,105,108,108,36,101,100,0,32,37,105,32,37,105,32,37,105,32,37,105,32,37,105,32,37,105,32,104,10,0,0,0,37,105,32,37,105,32,78,0,99,112,49,50,53,48,0,0,42,114,101,116,117,114,110,95,110,117,109,95,98,121,116,101,115,32,60,61,32,109,97,120,95,101,110,99,111,100,101,100,95,98,121,116,101,115,0,0,32,111,112,101,110,32,121,108,111,119,32,121,104,105,103,104,32,121,99,108,111,115,101,32,119,105,100,116,104,0,0,0,126,62,0,0,0,0,0,0,37,49,120,0,0,0,0,0,37,54,46,51,102,32,0,0,101,110,99,111,100,101,100,32,105,109,97,103,101,0,0,0,108,97,109,98,101,114,116,119,0,0,0,0,0,0,0,0,108,105,115,116,95,116,101,114,109,115,0,0,0,0,0,0,37,115,105,109,97,103,101,10,0,0,0,0,0,0,0,0,105,115,36,111,115,97,109,112,108,101,115,0,0,0,0,0,32,32,68,97,116,97,32,66,108,111,99,107,115,58,32,32,37,42,108,100,10,0,0,0,102,36,105,116,0,0,0,0,37,115,102,97,108,115,101,32,51,10,37,115,99,111,108,111,114,105,109,97,103,101,10,0,9,108,105,110,101,116,121,112,101,32,37,100,44,32,0,0,83,116,97,116,115,32,99,111,109,109,97,110,100,32,110,111,116,32,97,118,97,105,108,97,98,108,101,32,105,110,32,112,111,108,97,114,32,109,111,100,101,0,0,0,0,0,0,0,32,32,99,117,114,114,101,110,116,102,105,108,101,32,47,65,83,67,73,73,56,53,68,101,99,111,100,101,32,102,105,108,116,101,114,10,0,0,0,0,114,101,109,111,118,101,32,108,97,98,101,108,32,99,108,111,115,101,32,116,111,32,112,111,105,110,116,101,114,32,105,102,32,96,115,101,116,32,109,111,117,115,101,32,108,97,98,101,108,115,96,32,105,115,32,111,110,0,0,0,0,0,0,0,123,99,117,114,114,101,110,116,102,105,108,101,32,105,109,97,103,101,98,117,102,32,114,101,97,100,104,101,120,115,116,114,105,110,103,32,112,111,112,125,10,0,0,0,0,0,0,0,10,37,115,32,0,0,0,0,47,105,109,97,103,101,98,117,102,32,37,100,32,115,116,114,105,110,103,32,100,101,102,10,0,0,0,0,0,0,0,0,37,115,91,32,37,100,32,48,32,48,32,37,100,32,48,32,48,32,93,10,0,0,0,0,37,115,37,100,32,37,100,32,37,100,10,0,0,0,0,0,37,115,37,100,32,37,100,32,115,99,97,108,101,10,0,0,37,45,49,53,46,49,53,115,0,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,46,32,83,101,101,32,39,104,101,108,112,32,115,104,111,119,39,46,0,0,0,37,115,37,100,32,37,100,32,116,114,97,110,115,108,97,116,101,10,0,0,0,0,0,0,37,115,123,112,109,51,100,71,97,109,109,97,32,101,120,112,125,32,115,101,116,116,114,97,110,115,102,101,114,10,0,0,97,116,97,110,104,0,0,0,90,97,112,102,32,68,105,110,103,98,97,116,115,0,0,0,37,115,103,115,97,118,101,10,0,0,0,0,0,0,0,0,104,105,115,36,116,111,114,121,115,105,122,101,0,0,0,0,32,32,66,108,97,110,107,58,32,32,32,32,32,32,32,32,37,42,108,100,10,0,0,0,46,46,46,0,0,0,0,0,37,37,37,37,69,110,100,73,109,97,103,101,10,0,0,0,9,76,105,110,101,116,121,112,101,115,32,114,101,112,101,97,116,32,101,118,101,114,121,32,37,100,32,117,110,108,101,115,115,32,101,120,112,108,105,99,105,116,108,121,32,100,101,102,105,110,101,100,10,0,0,0,110,111,102,111,114,116,36,114,97,110,0,0,0,0,0,0,103,112,98,105,110,0,0,0,32,117,110,105,116,115,32,0,103,114,101,115,116,111,114,101,10,0,0,0,0,0,0,0,60,67,116,114,108,45,66,50,62,0,0,0,0,0,0,0,10,73,110,116,101,114,112,114,101,116,76,101,118,101,108,49,32,110,111,116,32,123,10,32,32,103,114,101,115,116,111,114,101,10,125,32,105,102,10,0,103,101,110,95,111,110,101,95,99,111,110,116,111,117,114,58,32,110,111,32,99,111,110,116,111,117,114,32,102,111,117,110,100,10,0,0,0,0,0,0,10,103,114,101,115,116,111,114,101,10,0,0,0,0,0,0,32,60,32,0,0,0,0,0,32,32,47,73,110,116,101,114,112,111,108,97,116,101,32,102,97,108,115,101,10,62,62,10,105,109,97,103,101,10,0,0,99,97,110,110,111,116,32,98,101,32,104,101,114,101,0,0,78,101,101,100,32,102,117,108,108,32,117,115,105,110,103,32,115,112,101,99,32,102,111,114,32,121,32,116,105,109,101,32,100,97,116,97,0,0,0,0,32,32,47,77,117,108,116,105,112,108,101,68,97,116,97,83,111,117,114,99,101,115,32,102,97,108,115,101,10,0,0,0,32,32,47,68,97,116,97,83,111,117,114,99,101,32,99,117,114,114,101,110,116,102,105,108,101,32,47,65,83,67,73,73,56,53,68,101,99,111,100,101,32,102,105,108,116,101,114,10,0,0,0,0,0,0,0,0,45,45,100,101,102,97,117,108,116,45,115,101,116,116,105,110,103,115,0,0,0,0,0,0,37,45,54,46,54,115,32,0,32,32,47,68,97,116,97,83,111,117,114,99,101,32,123,99,117,114,114,101,110,116,102,105,108,101,32,105,109,97,103,101,98,117,102,32,114,101,97,100,104,101,120,115,116,114,105,110,103,32,112,111,112,125,10,0,117,115,101,114,32,102,117,110,99,0,0,0,0,0,0,0,32,32,47,68,101,99,111,100,101,32,91,32,48,32,37,100,32,93,10,0,0,0,0,0,97,99,111,115,104,0,0,0,90,97,112,102,32,67,104,97,110,99,101,114,121,32,77,101,100,105,117,109,32,73,116,97,108,105,99,0,0,0,0,0,32,32,47,66,105,116,115,80,101,114,67,111,109,112,111,110,101,110,116,32,37,100,10,32,32,47,73,109,97,103,101,77,97,116,114,105,120,32,91,32,37,100,32,48,32,48,32,37,100,32,48,32,48,32,93,10,0,0,0,0,0,0,0,0,109,111,114,101,62,32,0,0,104,105,100,36,100,101,110,51,100,0,0,0,0,0,0,0,32,32,73,110,118,97,108,105,100,58,32,32,32,32,32,32,37,42,108,100,10,0,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,114,117,108,101,114,96,0,0,37,46,55,55,115,37,115,10,37,115,58,37,100,58,0,0,60,60,10,32,32,47,73,109,97,103,101,84,121,112,101,32,49,10,32,32,47,87,105,100,116,104,32,37,100,10,32,32,47,72,101,105,103,104,116,32,37,100,10,0,0,0,0,0,40,37,115,37,103,44,32,37,115,37,103,44,32,37,115,37,103,41,0,0,0,0,0,0,32,32,97,110,103,108,101,32,37,103,0,0,0,0,0,0,37,37,37,37,69,110,100,80,97,108,101,116,116,101,10,0,47,121,115,116,101,112,32,49,32,105,109,97,120,32,100,105,118,32,100,101,102,32,47,121,48,32,48,32,100,101,102,32,47,105,105,32,48,32,100,101,102,10,0,0,0,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,37,115,32,102,105,108,101,32,39,37,115,39,0,0,0,0,0,0,0,0,99,117,114,118,101,0,0,0,120,32,112,111,115,0,0,0,111,114,32,100,114,97,119,32,108,97,98,101,108,115,32,105,102,32,96,115,101,116,32,109,111,117,115,101,32,108,97,98,101,108,115,32,105,115,32,111,110,96,0,0,0,0,0,0,10,32,32,62,10,93,32,115,101,116,99,111,108,111,114,115,112,97,99,101,10,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58])
.concat([32,116,121,112,101,32,110,101,105,116,104,101,114,32,73,78,84,32,111,114,32,67,77,80,76,88,0,0,0,0,0,0,32,37,50,46,50,120,37,50,46,50,120,37,50,46,50,120,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,115,101,116,32,114,97,110,103,101,32,119,105,116,104,32,114,101,112,108,111,116,0,0,0,0,91,32,47,73,110,100,101,120,101,100,10,32,32,47,68,101,118,105,99,101,82,71,66,32,37,100,10,32,32,60,0,0,37,37,37,37,66,101,103,105,110,80,97,108,101,116,116,101,10,0,0,0,0,0,0,0,37,100,32,37,100,32,115,99,97,108,101,10,0,0,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,37,100,32,37,100,32,116,114,97,110,115,108,97,116,101,10,0,0,0,0,0,0,0,0,103,115,97,118,101,10,0,0,97,115,105,110,104,0,0,0,83,121,109,98,111,108,0,0,125,32,123,10,0,0,0,0,103,36,114,105,100,0,0,0,32,32,79,117,116,32,111,102,32,114,97,110,103,101,58,32,37,42,108,100,10,0,0,0,82,101,119,105,110,100,105,110,103,32,102,100,32,37,100,10,0,0,0,0,0,0,0,0,32,32,52,48,32,45,49,49,48,32,82,10,32,32,40,80,83,32,108,101,118,101,108,32,50,32,105,109,97,103,101,41,32,76,115,104,111,119,10,32,32,37,37,32,82,101,97,100,32,100,97,116,97,32,98,117,116,32,105,103,110,111,114,101,32,105,116,10,32,32,47,105,109,97,103,101,98,117,102,32,37,100,32,115,116,114,105,110,103,32,100,101,102,10,32,32,99,117,114,114,101,110,116,102,105,108,101,32,105,109,97,103,101,98,117,102,32,114,101,97,100,115,116,114,105,110,103,10,0,0,0,0,0,0,0,0,40,99,104,97,114,97,99,116,101,114,32,117,110,105,116,115,41,32,0,0,0,0,0,0,122,0,0,0,0,0,0,0,44,32,37,115,37,103,0,0,125,32,105,102,101,108,115,101,10,0,0,0,0,0,0,0,73,110,32,108,111,103,32,109,111,100,101,32,114,114,97,110,103,101,32,109,117,115,116,32,110,111,116,32,105,110,99,108,117,100,101,32,48,0,0,0,97,110,110,111,116,97,116,101,32,116,104,101,32,103,114,97,112,104,32,117,115,105,110,103,32,96,109,111,117,115,101,102,111,114,109,97,116,96,32,40,115,101,101,32,107,101,121,115,32,39,49,39,44,32,39,50,39,41,0,0,0,0,0,0,32,32,99,117,114,114,101,110,116,102,105,108,101,32,105,109,97,103,101,98,117,102,32,114,101,97,100,115,116,114,105,110,103,10,125,32,123,10,0,0,32,32,47,105,109,97,103,101,98,117,102,32,37,100,32,115,116,114,105,110,103,32,100,101,102,10,0,0,0,0,0,0,32,32,52,48,32,45,49,49,48,32,82,10,32,32,40,80,83,32,108,101,118,101,108,32,50,32,105,109,97,103,101,41,32,76,115,104,111,119,10,32,32,37,32,82,101,97,100,32,100,97,116,97,32,98,117,116,32,105,103,110,111,114,101,32,105,116,10,0,0,0,0,0,32,32,37,100,32,37,100,32,76,10,0,0,0,0,0,0,79,110,108,121,32,117,110,100,101,102,105,110,101,100,32,100,97,116,97,112,111,105,110,116,115,32,97,114,101,32,111,109,105,116,116,101,100,32,102,114,111,109,32,116,104,101,32,115,117,114,102,97,99,101,46,10,0,0,0,0,0,0,0,0,32,32,48,32,37,100,32,86,10,0,0,0,0,0,0,0,10,10,99,111,114,114,101,108,97,116,105,111,110,32,109,97,116,114,105,120,32,111,102,32,116,104,101,32,102,105,116,32,112,97,114,97,109,101,116,101,114,115,58,10,10,0,0,0,32,32,37,100,32,48,32,86,10,0,0,0,0,0,0,0,10,72,101,108,112,32,116,111,112,105,99,115,32,97,118,97,105,108,97,98,108,101,58,10,0,0,0,0,0,0,0,0,32,32,37,100,32,37,100,32,77,10,0,0,0,0,0,0,105,110,118,110,111,114,109,0,80,97,108,97,116,105,110,111,32,66,111,108,100,32,73,116,97,108,105,99,0,0,0,0,73,110,116,101,114,112,114,101,116,76,101,118,101,108,49,32,123,10,32,32,37,37,32,67,111,110,115,116,114,117,99,116,32,97,32,98,111,120,32,105,110,115,116,101,97,100,32,111,102,32,105,109,97,103,101,10,32,32,76,84,98,10,0,0,102,117,36,110,99,116,105,111,110,115,0,0,0,0,0,0,32,32,82,101,99,111,114,100,115,58,32,32,32,32,32,32,37,42,108,100,10,0,0,0,83,107,105,112,112,105,110,103,32,117,110,114,101,97,100,97,98,108,101,32,102,105,108,101,32,34,37,115,34,0,0,0,103,115,97,118,101,32,37,100,32,37,100,32,78,32,37,100,32,37,100,32,76,32,37,100,32,37,100,32,76,32,37,100,32,37,100,32,76,32,90,32,99,108,105,112,10,0,0,0,40,115,99,114,101,101,110,32,117,110,105,116,115,41,32,0,37,115,111,98,106,101,99,116,32,37,50,100,32,101,108,108,105,112,115,101,32,0,0,0,37,37,37,37,66,101,103,105,110,73,109,97,103,101,10,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,100,111,101,115,32,110,111,116,32,119,111,114,107,32,119,105,116,104,32,54,32,99,111,108,115,46,32,83,101,116,116,105,110,103,32,116,111,32,120,121,101,114,114,111,114,98,97,114,115,0,0,0,0,0,0,0,60,66,50,62,0,0,0,0,71,78,85,80,76,79,84,32,40,112,111,115,116,46,116,114,109,41,58,32,32,67,111,109,112,111,110,101,110,116,32,98,105,116,115,32,40,37,100,41,32,111,117,116,32,111,102,32,114,97,110,103,101,46,10,0,47,37,115,32,37,115,0,0,105,110,118,97,108,105,100,32,99,111,109,109,97,110,100,0,114,101,101,110,99,111,100,101,75,79,73,56,85,32,100,101,102,10,0,0,0,0,0,0,114,101,101,110,99,111,100,101,67,80,49,50,53,49,32,100,101,102,10,0,0,0,0,0,114,101,101,110,99,111,100,101,67,80,49,50,53,48,32,100,101,102,10,0,0,0,0,0,43,47,45,0,0,0,0,0,114,101,101,110,99,111,100,101,75,79,73,56,82,32,100,101,102,10,0,0,0,0,0,0,114,101,101,110,99,111,100,101,67,80,56,53,50,32,100,101,102,10,0,0,0,0,0,0,105,110,118,101,114,102,0,0,80,97,108,97,116,105,110,111,32,66,111,108,100,0,0,0,114,101,101,110,99,111,100,101,67,80,56,53,48,32,100,101,102,10,0,0,0,0,0,0,102,117,36,110,99,116,105,111,110,0,0,0,0,0,0,0,42,32,70,73,76,69,58,32,10,0,0,0,0,0,0,0,114,98,0,0,0,0,0,0,114,101,101,110,99,111,100,101,67,80,52,51,55,32,100,101,102,10,0,0,0,0,0,0,40,103,114,97,112,104,32,117,110,105,116,115,41,32,0,0,39,44,39,32,101,120,112,101,99,116,101,100,0,0,0,0,32,97,114,99,32,91,37,103,58,37,103,93,32,0,0,0,114,101,101,110,99,111,100,101,73,83,79,49,53,32,100,101,102,10,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,53,32,99,111,108,117,109,110,32,112,108,111,116,32,115,116,121,108,101,59,32,114,101,115,101,116,116,105,110,103,32,116,111,32,98,111,120,101,114,114,111,114,98,97,114,115,0,0,0,0,0,114,101,101,110,99,111,100,101,73,83,79,57,32,100,101,102,10,0,0,0,0,0,0,0,112,114,105,110,116,32,99,111,111,114,100,105,110,97,116,101,115,32,116,111,32,99,108,105,112,98,111,97,114,100,32,117,115,105,110,103,32,96,99,108,105,112,98,111,97,114,100,102,111,114,109,97,116,96,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,40,115,101,101,32,107,101,121,115,32,39,51,39,44,32,39,52,39,41,0,0,97,114,114,111,119,115,36,116,121,108,101,0,0,0,0,0,69,68,70,95,66,105,110,97,114,121,70,105,108,101,80,111,115,105,116,105,111,110,0,0,114,101,101,110,99,111,100,101,73,83,79,50,32,100,101,102,10,0,0,0,0,0,0,0,78,101,119,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,110,97,109,101,32,101,120,112,101,99,116,101,100,0,114,101,101,110,99,111,100,101,73,83,79,32,100,101,102,10,0,0,0,0,0,0,0,0,80,111,115,116,83,99,114,105,112,116,32,70,111,110,116,32,114,101,99,111,114,100,0,0,123,125,91,93,40,41,32,0,37,45,49,53,46,49,53,115,32,61,32,37,45,49,53,103,32,32,37,45,51,46,51,115,32,37,45,49,50,46,52,103,32,40,37,46,52,103,37,37,41,10,0,0,0,0,0,0,83,121,109,98,111,108,45,79,98,108,105,113,117,101,0,0,37,115,40,0,0,0,0,0,110,111,114,109,0,0,0,0,80,97,108,97,116,105,110,111,32,73,116,97,108,105,99,0,91,40,37,115,41,32,37,46,49,102,32,37,46,49,102,32,37,115,32,37,115,32,37,100,32,0,0,0,0,0,0,0,102,111,36,114,109,97,116,0,111,117,116,111,102,114,97,110,103,101,0,0,0,0,0,0,34,37,115,34,32,105,115,32,97,32,100,105,114,101,99,116,111,114,121,0,0,0,0,0,69,78,72,80,83,95,111,112,101,110,115,101,113,117,101,110,99,101,0,0,0,0,0,0,40,115,101,99,111,110,100,32,97,120,101,115,41,32,0,0,110,111,101,113,117,97,108,36,95,97,120,101,115,0,0,0,37,115,37,103,0,0,0,0,88,89,114,101,115,116,111,114,101,10,0,0,0,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,100,111,101,115,32,110,111,116,32,119,111,114,107,32,119,105,116,104,32,52,32,99,111,108,115,46,32,83,101,116,116,105,110,103,32,116,111,32,121,101,114,114,111,114,98,97,114,115,0,0,0,0,0,0,0,0,88,89,115,97,118,101,10,0,50,120,60,66,49,62,0,0,97,114,114,111,119,115,116,121,108,101,32,37,100,32,110,111,116,32,102,111,117,110,100,0,41,93,10,0,0,0,0,0,80,97,114,97,109,101,116,101,114,32,102,105,108,101,110,97,109,101,32,101,120,112,101,99,116,101,100,0,0,0,0,0,93,10,0,0,0,0,0,0,117,110,105,37,48,52,108,88,0,0,0,0,0,0,0,0,117,37,108,88,0,0,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,32,32,32,32,32,32,32,32,32,32,32,32,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,10,10,0,37,115,47,0,0,0,0,0,37,37,32,69,110,100,32,112,108,111,116,32,35,37,100,10,0,0,0,0,0,0,0,0,99,101,105,108,0,0,0,0,80,97,108,97,116,105,110,111,32,82,111,109,97,110,0,0,37,37,32,66,101,103,105,110,32,112,108,111,116,32,35,37,100,10,0,0,0,0,0,0,102,111,110,116,36,112,97,116,104,0,0,0,0,0,0,0,98,108,111,99,107,115,0,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,105,112,101,32,102,111,114,32,100,97,116,97,0,0,0,0,0,115,116,114,111,107,101,10,0,40,102,105,114,115,116,32,97,120,101,115,41,32,0,0,0,120,121,122,0,0,0,0,0,37,115,111,98,106,101,99,116,32,37,50,100,32,99,105,114,99,108,101,32,0,0,0,0,65,114,105,97,108,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,100,111,101,115,32,110,111,116,32,119,111,114,107,32,119,105,116,104,32,51,32,99,111,108,115,46,32,83,101,116,116,105,110,103,32,116,111,32,121,101,114,114,111,114,98,97,114,115,0,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,99,111,108,111,114,32,110,97,109,101,32,97,110,100,32,110,111,116,32,97,32,115,116,114,105,110,103,32,34,35,65,65,82,82,71,71,66,66,34,0,0,0,0,60,116,115,112,97,110,32,102,111,110,116,45,115,105,122,101,61,34,37,46,49,102,112,116,34,32,100,121,61,34,37,46,50,102,112,116,34,62,60,47,116,115,112,97,110,62,0,0,37,99,0,0,0,0,0,0,111,110,108,121,32,107,101,121,119,111,114,100,115,32,97,114,101,32,39,116,101,114,109,105,110,97,108,39,32,97,110,100,32,39,112,97,108,101,116,116,101,39,0,0,0,0,0,0,98,97,99,107,103,114,111,117,110,100,32,34,35,37,48,54,120,34,32,0,0,0,0,0,108,105,110,101,119,105,100,116,104,32,37,51,46,49,102,32,0,0,0,0,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,32,105,110,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,32,37,115,0,0,0,0,0,0,0,115,111,108,105,100,32,0,0,70,105,110,97,108,32,115,101,116,32,111,102,32,112,97,114,97,109,101,116,101,114,115,32,32,32,32,32,32,32,32,32,32,32,32,65,115,121,109,112,116,111,116,105,99,32,83,116,97,110,100,97,114,100,32,69,114,114,111,114,10,0,0,0,100,97,115,104,101,100,32,0,98,117,116,116,32,0,0,0,102,108,111,111,114,0,0,0,78,101,119,32,67,101,110,116,117,114,121,32,83,99,104,111,111,108,98,111,111,107,32,66,111,108,100,32,73,116,97,108,105,99,0,0,0,0,0,0,102,111,110,116,102,105,108,101,32,34,37,115,34,32,0,0,102,105,116,0,0,0,0,0,98,108,97,110,107,115,0,0,99,97,110,110,111,116,32,111,112,101,110,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,102,111,114,32,114,101,97,100,105,110,103,32,100,97,116,97,0,0,0,0,110,97,109,101,32,34,37,115,34,32,0,0,0,0,0,0,9,32,32,102,111,110,116,32,34,37,115,34,10,0,0,0,115,116,97,110,100,97,108,111,110,101,32,0,0,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,100,111,101,115,32,110,111,116,32,119,111,114,107,32,119,105,116,104,32,49,32,111,114,32,50,32,99,111,108,115,46,32,83,101,116,116,105,110,103,32,116,111,32,112,111,105,110,116,115,0,0,0,0,0,0,0,98,105,110,100,95,97,112,112,101,110,100,45,62,110,101,119,0,0,0,0,0,0,0,0,35,37,108,120,0,0,0,0,109,111,117,115,105,110,103,32,0,0,0,0,0,0,0,0,101,110,104,97,110,99,101,100,0,0,0,0,0,0,0,0,115,99,114,101,101,110,100,117,109,112,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,10,0,0,0,0,0,32,100,121,110,97,109,105,99,0,0,0,0,0,0,0,0,32,102,105,120,101,100,0,0,9,103,110,117,112,108,111,116,114,99,32,105,115,32,114,101,97,100,32,102,114,111,109,32,37,115,10,0,0,0,0,0,115,105,122,101,32,37,100,44,37,100,37,115,32,37,115,32,102,110,97,109,101,32,39,37,115,39,32,32,102,115,105,122,101,32,37,103,32,0,0,0,67,97,108,99,117,108,97,116,105,111,110,32,101,114,114,111,114,58,32,110,111,110,45,112,111,115,105,116,105,118,101,32,100,105,97,103,111,110,97,108,32,101,108,101,109,101,110,116,32,105,110,32,99,111,118,97,114,46,32,109,97,116,114,105,120,0,0,0,0,0,0,0,70,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,32,109,105,115,109,97,116,99,104,58,32,37,37,76,32,105,115,32,111,110,108,121,32,118,97,108,105,100,32,119,105,116,104,32,37,37,108,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,116,101,114,109,105,110,97,108,32,111,112,116,105,111,110,0,0,0,0,37,100,47,37,109,47,37,121,44,37,72,58,37,77,0,0,37,42,100,0,0,0,0,0,98,97,99,107,103,36,114,111,117,110,100,0,0,0,0,0,114,97,110,100,0,0,0,0,100,97,115,104,36,101,100,0,78,101,119,32,67,101,110,116,117,114,121,32,83,99,104,111,111,108,98,111,111,107,32,66,111,108,100,0,0,0,0,0,100,101,99,36,105,109,97,108,115,105,103,110,0,0,0,0,105,110,118,97,108,105,100,0,114,111,117,110,100,36,101,100,0,0,0,0,0,0,0,0,101,113,117,97,108,36,95,97,120,101,115,0,0,0,0,0,102,114,111,109,32,0,0,0,70,111,110,116,32,102,105,108,101,110,97,109,101,32,101,120,112,101,99,116,101,100,0,0,84,111,111,32,109,97,110,121,32,99,111,108,117,109,110,115,32,105,110,32,117,115,105,110,103,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0,68,101,108,101,116,101,0,0,102,111,110,116,102,105,108,101,0,0,0,0,0,0,0,0,102,115,105,122,101,58,32,101,120,112,101,99,116,105,110,103,32,102,111,110,116,32,115,105,122,101,0,0,0,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,115,97,118,101,32,102,105,108,101,0,0,0,99,112,57,53,48,0,0,0,102,115,36,105,122,101,0,0,32,111,112,101,110,32,121,108,111,119,32,121,104,105,103,104,32,121,99,108,111,115,101,0,102,110,36,97,109,101,0,0,99,97,108,108,110,0,0,0,102,105,36,120,101,100,0,0,70,73,84,95,87,83,83,82,0,0,0,0,0,0,0,0,100,36,121,110,97,109,105,99,0,0,0,0,0,0,0,0,110,97,109,101,32,109,117,115,116,32,99,111,110,116,97,105,110,32,111,110,108,121,32,97,108,112,104,97,110,117,109,101,114,105,99,115,32,111,114,32,95,0,0,0,0,0,0,0,67,97,110,110,111,116,32,115,112,108,111,116,32,105,110,32,112,111,108,97,114,32,99,111,111,114,100,105,110,97,116,101,32,115,121,115,116,101,109,46,0,0,0,0,0,0,0,0,105,103,97,109,109,97,0,0,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,95,49,50,51,52,53,54,55,56,57,48,0,78,101,119,32,67,101,110,116,117,114,121,32,83,99,104,111,111,108,98,111,111,107,32,73,116,97,108,105,99,0,0,0,101,110,99,36,111,100,105,110,103,0,0,0,0,0,0,0,114,101,99,111,114,100,115,0,101,120,36,105,116,0,0,0,99,97,110,110,111,116,32,112,108,111,116,32,102,114,111,109,32,115,116,100,105,110,47,115,116,100,111,117,116,47,115,116,100,101,114,114,0,0,0,0,101,120,112,101,99,116,105,110,103,32,97,32,112,108,111,116,32,110,97,109,101,0,0,0,9,32,0,0,0,0,0,0,83,116,97,116,115,32,99,111,109,109,97,110,100,32,110,111,116,32,97,118,97,105,108,97,98,108,101,32,105,110,32,116,105,109,101,100,97,116,97,32,109,111,100,101,0,0,0,0,32,115,105,122,101,32,0,0,110,97,109,101,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,99,111,108,117,109,110,115,32,105,110,32,117,115,105,110,103,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0,0,0,0,0,0,0,69,115,99,97,112,101,0,0,99,111,108,111,114,115,112,101,99,32,111,112,116,105,111,110,32,110,111,116,32,114,101,99,111,103,110,105,122,101,100,0,109,111,117,115,36,105,110,103,0,0,0,0,0,0,0,0,109,111,117,115,101,0,0,0,121,32,115,105,122,101,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,121,32,115,105,122,101,0,0,0,0,0,0,0,0,120,32,115,105,122,101,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,91,110,111,110,101,93,0,0,70,73,84,95,83,84,68,70,73,84,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,120,32,115,105,122,101,0,0,0,0,0,0,0,0,115,36,105,122,101,0,0,0,118,111,105,103,116,0,0,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,105,115,32,101,109,112,116,121,0,78,101,119,32,67,101,110,116,117,114,121,32,83,99,104,111,111,108,98,111,111,107,32,82,111,109,97,110,0,0,0,0,100,117,36,109,109,121,0,0,37,115,9,37,108,100,10,0,105,110,118,97,108,105,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,116,101,103,101,114,0,67,111,109,109,97,110,100,32,39,37,115,39,32,103,101,110,101,114,97,116,101,115,32,101,109,112,116,121,32,111,117,116,112,117,116,0,0,0,0,0,41,10,0,0,0,0,0,0,116,36,105,109,101,0,0,0,99,101,110,116,101,114,32,0,67,111,109,109,97,110,100,32,39,37,115,39,32,103,101,110,101,114,97,116,101,100,32,101,114,114,111,114,32,101,120,105,116,99,111,100,101,32,37,100,0,0,0,0,0,0,0,0,82,101,116,117,114,110,0,0,112,97,108,101,116,116,101,32,102,114,97,99,116,105,111,110,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,99,111,110,116,97,105,110,115,32,116,104,101,32,102,111,110,116,32,39,37,115,39,10,0,0,99,111,110,116,111,117,114,32,116,114,105,100,105,97,103,32,109,0,0,0,0,0,0,0,102,111,110,116,45,102,97,109,105,108,121,0,0,0,0,0,110,111,32,112,114,101,118,105,111,117,115,32,112,108,111,116,0,0,0,0,0,0,0,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,0,0,0,98,108,45,105,110,116,101,114,112,32,98,101,116,119,101,101,110,32,115,99,97,110,0,0,78,101,101,100,32,102,117,108,108,32,117,115,105,110,103,32,115,112,101,99,32,102,111,114,32,120,32,116,105,109,101,32,100,97,116,97,0,0,0,0,85,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,116,104,105,114,100,32,99,111,108,111,114,32,100,117,114,105,110,103,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,0,0,67,111,117,108,100,32,110,111,116,32,101,120,101,99,117,116,101,32,112,105,112,101,32,39,37,115,39,0,0,0,0,0,108,97,98,101,108,112,111,105,110,116,32,108,97,98,101,108,0,0,0,0,0,0,0,0,10,9,60,99,105,114,99,108,101,32,105,100,61,39,103,112,68,111,116,39,32,114,61,39,48,46,53,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,48,46,53,39,47,62,10,9,60,112,97,116,104,32,105,100,61,39,103,112,80,116,48,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,100,61,39,77,45,49,44,48,32,104,50,32,77,48,44,45,49,32,118,50,39,47,62,10,9,60,112,97,116,104,32,105,100,61,39,103,112,80,116,49,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,100,61,39,77,45,49,44,45,49,32,76,49,44,49,32,77,49,44,45,49,32,76,45,49,44,49,39,47,62,10,9,60,112,97,116,104,32,105,100,61,39,103,112,80,116,50,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,100,61,39,77,45,49,44,48,32,76,49,44,48,32,77,48,44,45,49,32,76,48,44,49,32,77,45,49,44,45,49,32,76,49,44,49,32,77,45,49,44,49,32,76,49,44,45,49,39,47,62,10,9,60,114,101,99,116,32,105,100,61,39,103,112,80,116,51,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,120,61,39,45,49,39,32,121,61,39,45,49,39,32,119,105,100,116,104,61,39,50,39,32,104,101,105,103,104,116,61,39,50,39,47,62,10,9,60,114,101,99,116,32,105,100,61,39,103,112,80,116,52,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,102,105,108,108,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,120,61,39,45,49,39,32,121,61,39,45,49,39,32,119,105,100,116,104,61,39,50,39,32,104,101,105,103,104,116,61,39,50,39,47,62,10,9,60,99,105,114,99,108,101,32,105,100,61,39,103,112,80,116,53,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,99,120,61,39,48,39,32,99,121,61,39,48,39,32,114,61,39,49,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,53,39,32,105,100,61,39,103,112,80,116,54,39,32,102,105,108,108,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,115,116,114,111,107,101,61,39,110,111,110,101,39,47,62,10,9,60,112,97,116,104,32,105,100,61,39,103,112,80,116,55,39,32,115,116,114,111,107,101,45,119,105,100,116,104,61,39,37,46,51,102,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,100,61,39,77,48,44,45,49,46,51,51,32,76,45,49,46,51,51,44,48,46,54,55,32,76,49,46,51,51,44,48,46,54,55,32,122,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,55,39,32,105,100,61,39,103,112,80,116,56,39,32,102,105,108,108,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,115,116,114,111,107,101,61,39,110,111,110,101,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,55,39,32,105,100,61,39,103,112,80,116,57,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,116,114,97,110,115,102,111,114,109,61,39,114,111,116,97,116,101,40,49,56,48,41,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,57,39,32,105,100,61,39,103,112,80,116,49,48,39,32,102,105,108,108,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,115,116,114,111,107,101,61,39,110,111,110,101,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,51,39,32,105,100,61,39,103,112,80,116,49,49,39,32,115,116,114,111,107,101,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,116,114,97,110,115,102,111,114,109,61,39,114,111,116,97,116,101,40,52,53,41,39,47,62,10,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,49,49,39,32,105,100,61,39,103,112,80,116,49,50,39,32,102,105,108,108,61,39,99,117,114,114,101,110,116,67,111,108,111,114,39,32,115,116,114,111,107,101,61,39,110,111,110,101,39,47,62,10,60,47,100,101,102,115,62,10,0,45,100,0,0,0,0,0,0,70,73,84,95,78,68,70,0,60,100,101,102,115,62,10,0,47,62,10,0,0,0,0,0,105,98,101,116,97,0,0,0,32,102,105,108,108,61,34,35,37,48,54,120,34,0,0,0,72,101,108,118,101,116,105,99,97,32,78,97,114,114,111,119,32,66,111,108,100,32,79,98,108,105,113,117,101,0,0,0,100,103,36,114,105,100,51,100,0,0,0,0,0,0,0,0,32,32,77,101,100,105,97,110,58,32,32,32,37,115,32,10,0,0,0,0,0,0,0,0,116,117,114,110,105,110,103,32,114,117,108,101,114,32,111,102,102,46,10,0,0,0,0,0,100,97,116,97,102,105,108,101,32,108,105,110,101,32,98,117,102,102,101,114,0,0,0,0,60,103,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,34,62,10,10,0,0,0,0,0,0,0,44,32,0,0,0,0,0,0,110,111,119,114,105,36,116,101,98,97,99,107,0,0,0,0,60,103,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,34,32,111,110,99,108,105,99,107,61,34,103,110,117,112,108,111,116,95,115,118,103,46,116,111,103,103,108,101,67,111,111,114,100,66,111,120,40,101,118,116,41,34,32,111,110,109,111,117,115,101,109,111,118,101,61,34,103,110,117,112,108,111,116,95,115,118,103,46,109,111,118,101,67,111,111,114,100,66,111,120,40,101,118,116,41,34,62,10,10,0,115,101,116,32,0,0,0,0,73,110,118,97,108,105,100,32,115,117,98,115,116,105,116,117,116,105,111,110,32,36,37,99,0,0,0,0,0,0,0,0,37,105,32,37,105,32,116,114,97,110,115,108,97,116,101,32,37,105,32,37,105,32,115,99,97,108,101,32,48,32,115,101,116,108,105,110,101,119,105,100,116,104,10,0,0,0,0,0,115,112,108,105,110,101,32,104,101,108,112,32,118,101,99,116,111,114,0,0,0,0,0,0,75,80,95,69,110,116,101,114,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,112,97,108,101,116,116,101,32,102,114,97,99,116,105,111,110,0,0,0,0,0,0,0,10,60,33,45,45,32,65,108,115,111,32,116,114,97,99,107,32,109,111,117,115,101,32,119,104,101,110,32,105,116,32,105,115,32,111,110,32,97,32,112,108,111,116,32,101,108,101,109,101,110,116,32,45,45,62,10,0,0,0,0,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,102,95,115,117,109,32,99,111,117,108,100,32,110,111,116,32,97,99,99,101,115,115,32,115,117,109,109,97,116,105,111,110,32,99,111,101,102,102,105,99,105,101,110,116,32,102,117,110,99,116,105,111,110,0,0,0,111,110,99,108,105,99,107,61,34,103,110,117,112,108,111,116,95,115,118,103,46,116,111,103,103,108,101,67,111,111,114,100,66,111,120,40,101,118,116,41,34,32,32,111,110,109,111,117,115,101,109,111,118,101,61,34,103,110,117,112,108,111,116,95,115,118,103,46,109,111,118,101,67,111,111,114,100,66,111,120,40,101,118,116,41,34,47,62,10,0,0,0,0,0,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,32,45,32,114,101,102,114,101,115,104,32,111,102,32,117,110,107,110,111,119,110,32,112,108,111,116,32,116,121,112,101,0,0,0,32,102,105,108,108,61,34,35,37,48,54,120,34,32,115,116,114,111,107,101,61,34,98,108,97,99,107,34,32,115,116,114,111,107,101,45,119,105,100,116,104,61,34,49,34,10,0,0,85,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,115,101,99,111,110,100,32,99,111,108,111,114,32,100,117,114,105,110,103,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,0,60,114,101,99,116,32,120,61,34,37,100,34,32,121,61,34,37,100,34,32,119,105,100,116,104,61,34,37,100,34,32,104,101,105,103,104,116,61,34,37,100,34,0,0,0,0,0,0,10,60,33,45,45,32,84,105,101,32,109,111,117,115,105,110,103,32,116,111,32,101,110,116,105,114,101,32,98,111,117,110,100,105,110,103,32,98,111,120,32,111,102,32,116,104,101,32,112,108,111,116,32,45,45,62,10,0,0,0,0,0,0,0,118,97,114,105,97,110,99,101,32,111,102,32,114,101,115,105,100,117,97,108,115,32,40,114,101,100,117,99,101,100,32,99,104,105,115,113,117,97,114,101,41,32,61,32,87,83,83,82,47,110,100,102,32,32,32,58,32,37,103,10,10,0,0,0,60,115,99,114,105,112,116,32,108,97,110,103,117,97,103,101,61,34,106,97,118,97,83,99,114,105,112,116,34,32,84,89,80,69,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,32,62,32,60,33,91,67,68,65,84,65,91,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,105,110,115,101,114,116,32,106,97,118,97,115,99,114,105,112,116,32,102,105,108,101,32,37,115,10,0,0,0,0,108,103,97,109,109,97,0,0,72,101,108,118,101,116,105,99,97,32,78,97,114,114,111,119,32,66,111,108,100,0,0,0,100,97,116,97,36,102,105,108,101,0,0,0,0,0,0,0,32,32,81,117,97,114,116,105,108,101,58,32,37,115,32,10,0,0,0,0,0,0,0,0,106,97,118,97,115,99,114,105,112,116,32,110,97,109,101,0,100,117,112,108,105,99,97,116,101,100,32,111,114,32,99,111,110,116,114,97,100,105,99,116,105,110,103,32,97,114,103,117,109,101,110,116,115,32,105,110,32,100,97,116,97,102,105,108,101,32,111,112,116,105,111,110,115,0,0,0,0,0,0,0,32,37,100,0,0,0,0,0,119,114,36,105,116,101,98,97,99,107,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,106,115,0,0,9,0,0,0,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,100,102,95,114,101,97,100,108,105,110,101,32,114,101,116,117,114,110,101,100,32,37,100,32,58,32,100,97,116,97,102,105,108,101,32,108,105,110,101,32,37,100,0,0,0,0,0,84,97,98,0,0,0,0,0,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,32,120,108,105,110,107,58,104,114,101,102,61,34,37,115,103,110,117,112,108,111,116,95,115,118,103,46,106,115,34,47,62,10,0,99,97,110,110,111,116,32,114,101,102,114,101,115,104,32,102,114,111,109,32,116,104,105,115,32,115,116,97,116,101,46,32,116,114,121,105,110,103,32,102,117,108,108,32,114,101,112,108,111,116,0,0,0,0,0,0,106,115,100,105,114,0,0,0,85,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,102,105,114,115,116,32,99,111,108,111,114,32,100,117,114,105,110,103,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,110,117,112,108,111,116,47,52,46,54,47,106,115,0,60,100,101,115,99,62,80,114,111,100,117,99,101,100,32,98,121,32,71,78,85,80,76,79,84,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,32,60,47,100,101,115,99,62,10,10,0,0,0,0,79,117,116,114,97,110,103,101,100,32,97,110,100,32,117,110,100,101,102,105,110,101,100,32,100,97,116,97,112,111,105,110,116,115,32,97,114,101,32,111,109,105,116,116,101,100,32,102,114,111,109,32,116,104,101,32,115,117,114,102,97,99,101,46,10,0,0,0,0,0,0,0,114,109,115,32,111,102,32,114,101,115,105,100,117,97,108,115,32,32,32,32,32,32,40,70,73,84,95,83,84,68,70,73,84,41,32,61,32,115,113,114,116,40,87,83,83,82,47,110,100,102,41,32,32,32,32,58,32,37,103,10,0,0,0,0,71,110,117,112,108,111,116,0,58,10,0,0,0,0,0,0,60,116,105,116,108,101,62,37,115,60,47,116,105,116,108,101,62,10,0,0,0,0,0,0,103,97,109,109,97,0,0,0,62,10,10,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,78,97,114,114,111,119,32,79,98,108,105,113,117,101,0,0,0,0,0,0,0,0,100,97,36,116,97,0,0,0,32,32,77,97,120,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,93,10,0,0,32,120,109,108,110,115,58,120,108,105,110,107,61,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,49,57,57,57,47,120,108,105,110,107,34,10,0,0,0,0,110,111,97,117,116,111,36,115,99,97,108,101,0,0,0,0,32,120,109,108,110,115,61,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,50,48,48,48,47,115,118,103,34,10,0,0,0,0,37,115,111,98,106,101,99,116,32,37,50,100,32,114,101,99,116,32,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,99,111,108,117,109,110,115,32,102,111,114,32,118,97,114,105,97,98,108,101,32,99,111,108,111,114,0,0,0,66,97,99,107,83,112,97,99,101,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,99,98,32,118,97,108,117,101,0,0,0,0,0,0,0,10,32,118,105,101,119,66,111,120,61,34,48,32,48,32,37,117,32,37,117,34,10,0,0,10,32,119,105,100,116,104,61,34,37,117,34,32,104,101,105,103,104,116,61,34,37,117,34,32,0,0,0,0,0,0,0,110,111,32,97,99,116,105,118,101,32,112,108,111,116,59,32,99,97,110,110,111,116,32,114,101,102,114,101,115,104,0,0,111,110,108,111,97,100,61,34,105,102,32,40,116,121,112,101,111,102,40,103,110,117,112,108,111,116,95,115,118,103,41,33,61,39,117,110,100,101,102,105,110,101,100,39,41,32,103,110,117,112,108,111,116,95,115,118,103,46,73,110,105,116,40,101,118,116,41,34,32,0,0,0,105,110,32,108,97,98,101,108,95,119,105,100,116,104,0,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,77,111,100,101,32,39,37,99,39,46,10,0,0,0,60,63,120,109,108,32,118,101,114,115,105,111,110,61,34,49,46,48,34,32,37,115,32,115,116,97,110,100,97,108,111,110,101,61,34,110,111,34,63,62,10,60,33,68,79,67,84,89,80,69,32,115,118,103,32,80,85,66,76,73,67,32,34,45,47,47,87,51,67,47,47,68,84,68,32,83,86,71,32,49,46,49,47,47,69,78,34,32,10,32,34,104,116,116,112,58,47,47,119,119,119,46,119,51,46,111,114,103,47,71,114,97,112,104,105,99,115,47,83,86,71,47,49,46,49,47,68,84,68,47,115,118,103,49,49,46,100,116,100,34,62,10,60,115,118,103,32,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,117,116,102,45,56,34,32,0,0,0,0,0,0,0,100,101,103,114,101,101,115,32,111,102,32,102,114,101,101,100,111,109,32,32,32,32,40,70,73,84,95,78,68,70,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,58,32,37,100,10,0,0,0,0,101,110,99,111,100,105,110,103,61,34,83,104,105,102,116,95,74,73,83,34,32,0,0,0,101,110,99,111,100,105,110,103,61,34,107,111,105,56,45,117,34,32,0,0,0,0,0,0,101,114,102,99,0,0,0,0,101,110,99,111,100,105,110,103,61,34,107,111,105,56,45,114,34,32,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,78,97,114,114,111,119,0,0,0,0,0,0,0,0,99,111,36,110,116,111,117,114,115,0,0,0,0,0,0,0,32,32,77,105,110,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,93,10,0,0,101,110,99,111,100,105,110,103,61,34,119,105,110,100,111,119,115,45,49,50,53,49,34,32,0,0,0,0,0,0,0,0,118,111,108,97,116,105,108,101,0,0,0,0,0,0,0,0,9,32,32,101,120,112,108,105,99,105,116,32,108,105,115,116,32,40,0,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,119,105,110,100,111,119,115,45,49,50,53,48,34,32,0,0,0,0,0,0,0,0,103,114,97,112,104,32,0,0,71,80,95,76,65,83,84,95,75,69,89,0,0,0,0,0,99,98,0,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,99,112,57,53,48,34,32,0,0,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,105,98,109,45,56,53,50,34,32,0,0,0,0,0,100,97,116,97,102,105,108,101,32,110,97,109,101,0,0,0,112,114,105,110,116,32,99,117,114,114,101,110,116,32,100,105,114,0,0,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,105,98,109,45,56,53,48,34,32,0,0,0,0,0,101,110,99,111,100,105,110,103,61,34,105,115,111,45,56,56,53,57,45,49,53,34,32,0,101,110,99,111,100,105,110,103,61,34,105,115,111,45,56,56,53,57,45,57,34,32,0,0,10,72,109,109,109,109,46,46,46,46,32,83,117,109,32,111,102,32,115,113,117,97,114,101,100,32,114,101,115,105,100,117,97,108,115,32,105,115,32,122,101,114,111,46,32,67,97,110,39,116,32,99,111,109,112,117,116,101,32,101,114,114,111,114,115,46,10,10,0,0,0,0,101,110,99,111,100,105,110,103,61,34,105,115,111,45,56,56,53,57,45,50,34,32,0,0,101,110,99,111,100,105,110,103,61,34,105,115,111,45,56,56,53,57,45,49,34,32,0,0,101,114,102,0,0,0,0,0,112,111,112,32,49,0,0,0,35,37,50,46,50,88,37,50,46,50,88,37,50,46,50,88,0,0,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,66,111,108,100,32,79,98,108,105,113,117,101,0,0,99,110,36,116,114,112,97,114,97,109,0,0,0,0,0,0,32,32,67,79,71,58,32,32,32,32,32,32,37,115,32,37,115,10,0,0,0,0,0,0,99,121,97,110,0,0,0,0,117,36,115,105,110,103,0,0,117,110,107,110,111,119,110,32,116,105,99,100,101,102,32,116,121,112,101,32,105,110,32,115,104,111,119,95,116,105,99,100,101,102,40,41,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,93,39,0,0,0,98,108,117,101,0,0,0,0,37,115,32,37,115,37,103,44,32,37,115,37,103,44,32,37,115,37,103,44,32,37,115,37,103,10,0,0,0,0,0,0,78,111,116,32,101,110,111,117,103,104,32,99,111,108,117,109,110,115,32,102,111,114,32,116,104,105,115,32,115,116,121,108,101,0,0,0,0,0,0,0,66,117,116,116,111,110,49,0,112,97,108,101,116,116,101,32,122,32,110,111,116,32,112,111,115,115,105,98,108,101,32,104,101,114,101,0,0,0,0,0,103,114,101,101,110,0,0,0,60,115,116,100,101,114,114,62,0,0,0,0,0,0,0,0,103,114,97,121,0,0,0,0,50,42,120,32,45,32,49,0,98,108,97,99,107,0,0,0,119,104,105,116,101,0,0,0,37,45,49,53,46,49,53,115,32,61,32,37,45,49,53,103,10,0,0,0,0,0,0,0,60,47,115,118,103,62,10,10,0,0,0,0,0,0,0,0,32,32,32,32,111,110,99,108,105,99,107,61,39,103,110,117,112,108,111,116,95,115,118,103,46,116,111,103,103,108,101,71,114,105,100,40,41,59,39,47,62,10,0,0,0,0,0,0,98,101,115,121,49,0,0,0,10,32,32,60,105,109,97,103,101,32,120,61,39,49,48,39,32,121,61,39,37,100,39,32,119,105,100,116,104,61,39,49,54,39,32,104,101,105,103,104,116,61,39,49,54,39,32,120,108,105,110,107,58,104,114,101,102,61,39,103,114,105,100,46,112,110,103,39,10,0,0,0,72,101,108,118,101,116,105,99])
.concat([97,32,66,111,108,100,0,0,99,36,108,105,112,0,0,0,32,32,77,97,120,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,32,37,108,100,32,93,10,0,0,0,0,0,32,32,118,105,115,105,98,105,108,105,116,121,61,34,104,105,100,100,101,110,34,62,32,60,47,116,101,120,116,62,10,0,116,104,114,117,36,0,0,0,32,32,110,111,32,97,117,116,111,45,103,101,110,101,114,97,116,101,100,32,116,105,99,115,10,0,0,0,0,0,0,0,93,0,0,0,0,0,0,0,32,32,102,111,110,116,45,115,105,122,101,61,34,49,50,34,32,102,111,110,116,45,102,97,109,105,108,121,61,34,65,114,105,97,108,34,10,0,0,0,32,112,111,105,110,116,105,110,116,101,114,118,97,108,32,37,100,0,0,0,0,0,0,0,84,111,111,32,109,97,110,121,32,117,115,105,110,103,32,115,112,101,99,115,32,102,111,114,32,116,104,105,115,32,115,116,121,108,101,0,0,0,0,0,67,108,111,115,101,0,0,0,10,32,32,60,116,101,120,116,32,105,100,61,34,99,111,111,114,100,95,116,101,120,116,34,32,116,101,120,116,45,97,110,99,104,111,114,61,34,115,116,97,114,116,34,32,112,111,105,110,116,101,114,45,101,118,101,110,116,115,61,34,110,111,110,101,34,10,0,0,0,0,0,93,93,62,10,60,47,115,99,114,105,112,116,62,10,0,0,60,115,116,100,111,117,116,62,0,0,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,116,105,109,101,97,120,105,115,95,120,32,61,32,34,34,59,10,0,0,0,0,0,0,50,32,109,117,108,32,49,32,115,117,98,0,0,0,0,0,68,97,116,101,84,105,109,101,0,0,0,0,0,0,0,0,110,101,119,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,32,37,115,32,99,111,117,108,100,32,110,111,116,32,98,101,32,99,114,101,97,116,101,100,0,0,0,0,0,0,84,105,109,101,0,0,0,0,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,61,32,10,10,0,0,0,0,0,0,68,97,116,101,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,116,105,109,101,97,120,105,115,95,120,32,61,32,34,37,115,34,59,10,0,0,0,0,98,101,115,121,48,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,97,120,105,115,95,120,109,97,120,32,61,32,37,46,51,102,59,10,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,79,98,108,105,113,117,101,0,0,0,0,0,0,0,99,108,36,97,98,101,108,0,32,32,77,105,110,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,32,37,108,100,32,93,10,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,97,120,105,115,95,120,109,105,110,32,61,32,37,46,51,102,59,10,0,0,0,0,0,101,118,36,101,114,121,0,0,32,117,110,116,105,108,32,0,101,120,112,101,99,116,105,110,103,32,39,91,39,32,111,114,32,39,114,101,115,116,111,114,101,39,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,108,111,103,97,120,105,115,95,114,32,61,32,37,100,59,10,0,0,0,0,0,0,0,32,112,111,105,110,116,115,105,122,101,32,37,46,51,102,0,118,97,114,99,111,108,111,114,32,97,114,114,97,121,0,0,70,49,50,0,0,0,0,0,111,110,108,121,32,116,99,32,108,116,32,60,110,62,32,112,111,115,115,105,98,108,101,32,104,101,114,101,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,108,111,103,97,120,105,115,95,121,32,61,32,37,100,59,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,108,111,103,97,120,105,115,95,120,32,61,32,37,100,59,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,97,120,105,115,95,121,50,109,105,110,32,61,32,34,110,111,110,101,34,10,0,0,0,50,42,120,32,45,32,48,46,53,0,0,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,121,50,109,97,120,0,9,108,111,97,100,112,97,116,104,32,105,115,32,101,109,112,116,121,10,0,0,0,0,0,71,80,86,65,76,95,89,50,95,77,65,88,0,0,0,0,70,105,110,97,108,32,115,101,116,32,111,102,32,112,97,114,97,109,101,116,101,114,115,32,10,0,0,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,121,50,109,105,110,0,37,48,42,100,0,0,0,0,71,80,86,65,76,95,89,50,95,77,73,78,0,0,0,0,98,101,115,106,49,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,97,120,105,115,95,120,50,109,105,110,32,61,32,34,110,111,110,101,34,10,0,0,0,72,101,108,118,101,116,105,99,97,0,0,0,0,0,0,0,98,111,120,36,119,105,100,116,104,0,0,0,0,0,0,0,32,32,83,117,109,32,83,113,46,58,32,32,37,115,10,0,112,108,111,116,95,97,120,105,115,95,120,50,109,97,120,0,105,36,110,100,101,120,0,0,32,115,101,99,115,0,0,0,91,0,0,0,0,0,0,0,71,80,86,65,76,95,88,50,95,77,65,88,0,0,0,0,32,112,111,105,110,116,115,105,122,101,32,100,101,102,97,117,108,116,0,0,0,0,0,0,65,108,108,32,112,111,105,110,116,115,32,105,110,32,104,105,115,116,111,103,114,97,109,32,85,78,68,69,70,73,78,69,68,0,0,0,0,0,0,0,70,49,49,0,0,0,0,0,105,108,108,101,103,97,108,32,108,105,110,101,116,121,112,101,0,0,0,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,120,50,109,105,110,0,71,80,86,65,76,95,88,50,95,77,73,78,0,0,0,0,99,112,56,53,50,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,97,120,105,115,95,114,109,105,110,32,61,32,37,103,59,10,0,0,0,0,0,0,0,49,32,121,50,0,0,0,0,50,32,109,117,108,32,48,46,53,32,115,117,98,0,0,0,102,97,108,115,101,0,0,0,116,114,117,101,0,0,0,0,73,110,32,116,104,105,115,32,100,101,103,101,110,101,114,97,116,101,32,99,97,115,101,44,32,97,108,108,32,101,114,114,111,114,115,32,97,114,101,32,122,101,114,111,32,98,121,32,100,101,102,105,110,105,116,105,111,110,46,10,10,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,111,108,97,114,95,109,111,100,101,32,61,32,37,115,59,10,0,0,0,112,108,111,116,95,97,120,105,115,95,121,109,97,120,0,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,108,32,39,37,99,39,10,0,0,98,101,115,106,48,0,0,0,71,80,86,65,76,95,89,95,77,65,88,0,0,0,0,0,67,111,117,114,105,101,114,32,66,111,108,100,32,79,98,108,105,113,117,101,0,0,0,0,98,111,114,36,100,101,114,0,32,32,83,117,109,58,32,32,32,32,32,32,37,115,10,0,101,118,97,108,36,117,97,116,101,0,0,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,121,109,105,110,0,0,110,111,110,117,110,105,36,102,111,114,109,0,0,0,0,0,32,98,121,32,37,103,37,115,0,0,0,0,0,0,0,0,114,101,36,115,116,111,114,101,0,0,0,0,0,0,0,0,83,116,97,116,115,32,99,111,109,109,97,110,100,32,110,111,116,32,97,118,97,105,108,97,98,108,101,32,119,105,116,104,32,108,111,103,115,99,97,108,101,32,97,99,116,105,118,101,0,0,0,0,0,0,0,0,71,80,86,65,76,95,89,95,77,73,78,0,0,0,0,0,32,112,111,105,110,116,115,105,122,101,32,118,97,114,105,97,98,108,101,0,0,0,0,0,115,116,97,99,107,104,101,105,103,104,116,32,97,114,114,97,121,0,0,0,0,0,0,0,70,49,48,0,0,0,0,0,101,120,112,101,99,116,101,100,32,108,105,110,101,116,121,112,101,0,0,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,120,109,97,120,0,0,71,80,86,65,76,95,88,95,77,65,88,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,37,115,32,61,32,37,103,59,10,0,0,0,50,42,120,0,0,0,0,0,112,108,111,116,95,97,120,105,115,95,120,109,105,110,0,0,103,110,117,112,108,111,116,95,115,118,103,46,37,115,32,61,32,37,100,59,10,0,0,0,84,101,114,109,105,110,97,108,32,111,112,116,105,111,110,115,32,97,114,101,32,39,37,115,39,10,0,0,0,0,0,0,71,80,86,65,76,95,88,95,77,73,78,0,0,0,0,0,10,69,120,97,99,116,108,121,32,97,115,32,109,97,110,121,32,100,97,116,97,32,112,111,105,110,116,115,32,97,115,32,116,104,101,114,101,32,97,114,101,32,112,97,114,97,109,101,116,101,114,115,46,10,0,0,103,101,116,95,111,102,102,115,101,116,115,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,104,101,105,103,104,116,32,61,32,37,46,49,102,59,10,0,0,0,0,0,0,0,0,108,111,103,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,119,105,100,116,104,32,61,32,37,46,49,102,59,10,0,67,111,117,114,105,101,114,32,66,111,108,100,0,0,0,0,32,32,83,116,100,32,68,101,118,58,32,32,37,115,10,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,121,116,111,112,32,61,32,37,46,49,102,59,10,0,0,37,35,103,0,0,0,0,0,105,110,116,101,103,101,114,32,111,118,101,114,102,108,111,119,59,32,99,104,97,110,103,105,110,103,32,116,111,32,102,108,111,97,116,105,110,103,32,112,111,105,110,116,0,0,0,0,101,120,112,101,99,116,105,110,103,32,114,105,103,104,116,32,112,97,114,101,110,116,104,101,115,105,115,32,41,0,0,0,101,104,102,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,121,98,111,116,32,61,32,37,46,49,102,59,10,0,0,32,112,111,105,110,116,116,121,112,101,32,37,100,0,0,0,98,111,120,112,108,111,116,32,104,97,115,32,117,110,100,101,102,105,110,101,100,32,120,32,99,111,111,114,100,105,110,97,116,101,0,0,0,0,0,0,70,57,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,99,111,108,111,114,115,112,101,99,0,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,120,109,97,120,32,61,32,37,46,49,102,59,10,0,0,99,111,110,116,111,117,114,32,100,50,121,0,0,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,120,109,105,110,32,61,32,37,46,49,102,59,10,0,0,115,101,116,32,37,115,114,97,110,103,101,32,91,32,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,116,101,114,109,95,121,109,97,120,32,61,32,37,100,59,10,0,0,0,0,0,0,0,98,108,45,105,110,116,101,114,112,32,97,108,111,110,103,32,115,99,97,110,0,0,0,0,112,114,101,118,105,111,117,115,32,112,97,114,97,109,101,116,114,105,99,32,102,117,110,99,116,105,111,110,32,110,111,116,32,102,117,108,108,121,32,115,112,101,99,105,102,105,101,100,0,0,0,0,0,0,0,0,50,32,109,117,108,0,0,0,103,110,117,112,108,111,116,95,115,118,103,46,112,108,111,116,95,116,101,114,109,95,120,109,97,120,32,61,32,37,100,59,10,0,0,0,0,0,0,0,116,101,120,116,95,108,97,98,101,108,32,108,105,115,116,32,119,97,115,32,110,111,116,32,105,110,105,116,105,97,108,105,122,101,100,0,0,0,0,0,47,47,32,112,108,111,116,32,98,111,117,110,100,97,114,105,101,115,32,97,110,100,32,97,120,105,115,32,115,99,97,108,105,110,103,32,105,110,102,111,114,109,97,116,105,111,110,32,102,111,114,32,109,111,117,115,105,110,103,32,10,0,0,0,45,45,112,101,114,115,105,115,116,0,0,0,0,0,0,0,97,98,115,46,32,99,104,97,110,103,101,32,100,117,114,105,110,103,32,108,97,115,116,32,105,116,101,114,97,116,105,111,110,32,58,32,37,103,10,10,0,0,0,0,0,0,0,0,10,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,62,60,33,91,67,68,65,84,65,91,10,0,0,0,0,0,0,87,97,114,110,105,110,103,32,58,32,117,100,102,32,115,104,97,100,111,119,101,100,32,98,121,32,98,117,105,108,116,45,105,110,32,102,117,110,99,116,105,111,110,32,111,102,32,116,104,101,32,115,97,109,101,32,110,97,109,101,0,0,0,0,32,57,44,52,44,49,44,52,44,49,44,52,0,0,0,0,108,111,103,49,48,0,0,0,32,56,44,52,44,50,44,52,0,0,0,0,0,0,0,0,67,111,117,114,105,101,114,32,79,98,108,105,113,117,101,0,98,36,97,114,115,0,0,0,32,32,77,101,97,110,58,32,32,32,32,32,37,115,10,0,77,79,85,83,69,95,82,85,76,69,82,95,89,0,0,0,32,50,44,52,0,0,0,0,32,102,114,111,109,32,0,0,105,110,99,114,101,109,101,110,116,32,109,117,115,116,32,98,101,32,110,101,103,97,116,105,118,101,0,0,0,0,0,0,32,53,44,56,0,0,0,0,32,108,105,110,101,119,105,100,116,104,32,37,46,51,102,0,98,111,120,112,108,111,116,32,112,101,114,109,117,116,97,116,105,111,110,115,32,97,114,114,97,121,0,0,0,0,0,0,115,116,114,111,107,101,32,103,115,97,118,101,9,37,37,32,100,114,97,119,32,103,114,97,121,32,115,99,97,108,101,32,115,109,111,111,116,104,32,98,111,120,10,109,97,120,99,111,108,111,114,115,32,48,32,103,116,32,123,47,105,109,97,120,32,109,97,120,99,111,108,111,114,115,32,100,101,102,125,32,123,47,105,109,97,120,32,49,48,50,52,32,100,101,102,125,32,105,102,101,108,115,101,10,0,0,0,0,0,0,0,0,115,112,108,105,110,101,32,115,111,108,117,116,105,111,110,32,118,101,99,116,111,114,0,0,70,56,0,0,0,0,0,0,32,100,61,39,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,102,95,115,117,109,32,99,111,117,108,100,32,110,111,116,32,97,99,99,101,115,115,32,105,116,101,114,97,116,105,111,110,32,118,97,114,105,97,98,108,101,46,0,0,0,0,0,0,99,108,97,115,115,61,34,103,114,105,100,108,105,110,101,34,32,0,0,0,0,0,0,0,115,116,114,111,107,101,45,100,97,115,104,97,114,114,97,121,61,39,37,115,39,32,0,0,124,50,42,120,32,45,32,48,46,53,124,0,0,0,0,0,115,116,114,111,107,101,61,39,37,115,39,32,0,0,0,0,115,116,114,111,107,101,61,39,114,103,98,40,37,51,100,44,32,37,51,100,44,32,37,51,100,41,39,32,0,0,0,0,114,101,108,46,32,99,104,97,110,103,101,32,100,117,114,105,110,103,32,108,97,115,116,32,105,116,101,114,97,116,105,111,110,32,58,32,37,103,10,10,0,0,0,0,0,0,0,0,9,60,112,97,116,104,32,0,77,37,46,49,102,44,37,46,49,102,32,0,0,0,0,0,10,9,9,0,0,0,0,0,67,111,117,114,105,101,114,0,97,117,36,116,111,115,99,97,108,101,0,0,0,0,0,0,42,32,67,79,76,85,77,78,58,32,10,0,0,0,0,0,76,37,46,49,102,44,37,46,49,102,32,0,0,0,0,0,32,32,115,101,114,105,101,115,0,0,0,0,0,0,0,0,105,110,99,114,101,109,101,110,116,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,0,0,0,0,0,0,60,47,116,101,120,116,62,10,9,60,47,103,62,10,0,0,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,0,98,111,120,112,108,111,116,32,108,97,98,101,108,115,32,97,114,114,97,121,0,0,0,0,70,55,0,0,0,0,0,0,114,103,98,0,0,0,0,0,38,97,109,112,59,0,0,0,38,108,116,59,0,0,0,0,9,9,60,116,101,120,116,62,0,0,0,0,0,0,0,0,50,32,109,117,108,32,48,46,53,32,115,117,98,32,97,98,115,0,0,0,0,0,0,0,9,9,60,116,101,120,116,32,120,109,108,58,115,112,97,99,101,61,34,112,114,101,115,101,114,118,101,34,62,0,0,0,32,32,0,0,0,0,0,0,9,32,32,66,97,99,107,32,115,105,100,101,32,111,102,32,115,117,114,102,97,99,101,115,32,104,97,115,32,108,105,110,101,115,116,121,108,101,32,111,102,102,115,101,116,32,111,102,32,37,100,10,9,32,32,66,105,116,45,77,97,115,107,32,111,102,32,76,105,110,101,115,32,116,111,32,100,114,97,119,32,105,110,32,101,97,99,104,32,116,114,105,97,110,103,108,101,32,105,115,32,37,108,100,10,9,32,32,37,100,58,32,0,0,0,0,0,0,0,0,102,105,110,97,108,32,115,117,109,32,111,102,32,115,113,117,97,114,101,115,32,111,102,32,114,101,115,105,100,117,97,108,115,32,58,32,37,103,10,0,32,116,101,120,116,45,97,110,99,104,111,114,58,37,115,34,62,10,0,0,0,0,0,0,32,102,111,110,116,45,115,116,121,108,101,58,37,115,59,0,10,83,117,98,116,111,112,105,99,115,32,97,118,97,105,108,97,98,108,101,32,102,111,114,32,0,0,0,0,0,0,0,32,102,111,110,116,45,119,101,105,103,104,116,58,37,115,59,0,0,0,0,0,0,0,0,66,111,111,107,109,97,110,32,68,101,109,105,32,73,116,97,108,105,99,0,0,0,0,0,97,114,36,114,111,119,0,0,42,32,77,65,84,82,73,88,58,32,91,37,100,32,88,32,37,100,93,32,10,0,0,0,59,32,102,111,110,116,45,102,97,109,105,108,121,58,37,115,59,32,102,111,110,116,45,115,105,122,101,58,37,46,50,102,112,116,59,0,0,0,0,0,78,111,32,112,114,101,118,105,111,117,115,32,102,105,108,101,110,97,109,101,0,0,0,0,32,32,68,97,121,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,114,103,98,40,37,100,44,37,100,44,37,100,41,0,0,0,70,54,0,0,0,0,0,0,34,32,115,116,121,108,101,61,34,115,116,114,111,107,101,58,110,111,110,101,59,32,102,105,108,108,58,0,0,0,0,0,32,114,111,116,97,116,101,40,37,105,41,0,0,0,0,0,9,60,103,32,116,114,97,110,115,102,111,114,109,61,34,116,114,97,110,115,108,97,116,101,40,37,46,49,102,44,37,46,49,102,41,0,0,0,0,0,121,116,105,99,115,0,0,0,52,120,59,49,59,45,50,120,43,49,46,56,52,59,120,47,48,46,48,56,45,49,49,46,53,0,0,0,0,0,0,0,101,110,100,0,0,0,0,0,109,105,100,100,108,101,0,0,10,65,102,116,101,114,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,116,104,101,32,102,105,116,32,99,111,110,118,101,114,103,101,100,46,10,0,0,0,0,0,0,0,0,115,116,97,114,116,0,0,0,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,80,116,37,117,39,32,116,114,97,110,115,102,111,114,109,61,39,116,114,97,110,115,108,97,116,101,40,37,46,49,102,44,37,46,49,102,41,32,115,99,97,108,101,40,37,46,50,102,41,39,37,115,47,62,10,0,0,0,0,32,32,87,97,114,110,105,110,103,58,32,83,105,110,103,108,101,32,105,115,111,108,105,110,101,32,40,115,99,97,110,41,32,105,115,32,110,111,116,32,101,110,111,117,103,104,32,102,111,114,32,97,32,112,109,51,100,32,112,108,111,116,46,10,9,32,32,32,72,105,110,116,58,32,77,105,115,115,105,110,103,32,98,108,97,110,107,32,108,105,110,101,115,32,105,110,32,116,104,101,32,100,97,116,97,32,102,105,108,101,63,32,83,101,101,32,39,104,101,108,112,32,112,109,51,100,39,32,97,110,100,32,70,65,81,46,10,0,0,0,0,0,0,0,115,103,110,0,0,0,0,0,9,60,117,115,101,32,120,108,105,110,107,58,104,114,101,102,61,39,35,103,112,68,111,116,39,32,120,61,39,37,46,49,102,39,32,121,61,39,37,46,49,102,39,37,115,47,62,10,0,0,0,0,0,0,0,0,66,111,111,107,109,97,110,32,68,101,109,105,0,0,0,0,97,110,36,103,108,101,115,0,109,97,120,95,105,110,100,101,120,0,0,0,0,0,0,0,32,99,111,108,111,114,61,39,37,115,39,0,0,0,0,0,32,32,77,111,110,116,104,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,0,0,0,32,99,111,108,111,114,61,39,114,103,98,40,37,51,100,44,32,37,51,100,44,32,37,51,100,41,39,0,0,0,0,0,32,108,105,110,101,99,111,108,111,114,0,0,0,0,0,0,120,112,45,62,112,95,99,111,117,110,116,32,61,61,32,121,112,45,62,112,95,99,111,117,110,116,0,0,0,0,0,0,70,53,0,0,0,0,0,0,98,111,108,100,0,0,0,0,105,116,97,108,105,99,0,0,32,73,116,97,108,105,99,0,32,59,10,0,0,0,0,0,100,117,112,32,48,46,52,50,32,108,101,32,123,52,32,109,117,108,125,32,123,100,117,112,32,48,46,57,50,32,108,101,32,123,45,50,32,109,117,108,32,49,46,56,52,32,97,100,100,125,32,123,48,46,48,56,32,100,105,118,32,49,49,46,53,32,115,117,98,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,0,0,0,32,105,116,97,108,105,99,0,32,66,111,108,100,0,0,0,10,84,104,101,32,102,105,116,32,119,97,115,32,115,116,111,112,112,101,100,32,98,121,32,116,104,101,32,117,115,101,114,32,97,102,116,101,114,32,37,100,32,105,116,101,114,97,116,105,111,110,115,46,10,0,0,32,98,111,108,100,0,0,0,34,62,10,0,0,0,0,0,97,98,115,0,0,0,0,0,48,46,53,0,0,0,0,0,109,105,116,101,114,0,0,0,66,111,111,107,109,97,110,32,76,105,103,104,116,32,73,116,97,108,105,99,0,0,0,0,97,116,0,0,0,0,0,0,109,105,110,95,105,110,100,101,120,0,0,0,0,0,0,0,59,32,115,116,114,111,107,101,45,119,105,100,116,104,58,37,46,50,102,59,32,115,116,114,111,107,101,45,108,105,110,101,99,97,112,58,37,115,59,32,115,116,114,111,107,101,45,108,105,110,101,106,111,105,110,58,37,115,0,0,0,0,0,0,109,97,120,95,117,115,105,110,103,32,60,61,32,77,65,88,68,65,84,65,67,79,76,83,0,0,0,0,0,0,0,0,32,32,105,110,116,101,114,118,97,108,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,100,36,116,105,99,115,0,0,99,117,114,114,101,110,116,67,111,108,111,114,0,0,0,0,32,108,105,110,101,116,121,112,101,32,37,100,0,0,0,0,70,52,0,0,0,0,0,0,112,36,97,116,116,101,114,110,0,0,0,0,0,0,0,0,114,103,98,40,37,51,100,44,32,37,51,100,44,32,37,51,100,41,0,0,0,0,0,0,60,103,32,115,116,121,108,101,61,34,102,105,108,108,58,110,111,110,101,59,32,99,111,108,111,114,58,37,115,59,32,115,116,114,111,107,101,58,0,0,9,9,60,47,112,97,116,116,101,114,110,62,10,9,60,47,100,101,102,115,62,10,0,0,50,42,120,45,48,46,56,52,0,0,0,0,0,0,0,0,9,9,9,60,112,97,116,104,32,115,116,121,108,101,32,61,32,39,37,115,32,37,115,58,99,117,114,114,101,110,116,67,111,108,111,114,39,32,100,61,39,37,115,39,47,62,10,0,10,77,97,120,105,109,117,109,32,105,116,101,114,97,116,105,111,110,32,99,111,117,110,116,32,40,37,100,41,32,114,101,97,99,104,101,100,46,32,70,105,116,32,115,116,111,112,112,101,100,46,10,0,0,0,0,9,9,9,60,112,97,116,104,32,115,116,121,108,101,32,61,32,39,37,115,32,37,115,58,37,115,39,32,100,61,32,39,37,115,39,47,62,10,0,0,9,9,9,60,112,97,116,104,32,115,116,121,108,101,61,39,37,115,32,37,115,58,114,103,98,40,37,100,44,37,100,44,37,100,41,39,32,100,61,39,37,115,39,47,62,10,0,0,105,110,116,0,0,0,0,0,115,116,114,111,107,101,58,110,111,110,101,59,0,0,0,0,66,111,111,107,109,97,110,32,76,105,103,104,116,0,0,0,97,99,36,116,105,111,110,95,116,97,98,108,101,0,0,0,99,111,103,95,121,0,0,0,102,105,108,108,58,110,111,110,101,59,0,0,0,0,0,0,109,36,116,105,99,115,0,0,77,45,50,44,48,32,76,52,44,49,50,32,77,48,44,45,52,32,76,56,44,49,50,32,77,52,44,45,52,32,76,49,48,44,56,0,0,0,0,0,45,45,45,101,114,114,111,114,33,45,45,45,10,0,0,0,117,115,101,115,95,97,120,105,115,91,83,69,67,79,78,68,95,89,95,65,88,73,83,93,0,0,0,0,0,0,0,0,70,51,0,0,0,0,0,0,77,45,50,44,56,32,76,52,44,45,52,32,77,48,44,49,50,32,76,56,44,45,52,32,77,52,44,49,50,32,76,49,48,44,48,0,0,0,0,0,77,45,52,44,56,32,76,56,44,45,52,32,77,48,44,49,50,32,76,49,50,44,48,0,77,45,52,44,48,32,76,56,44,49,50,32,77,48,44,45,52,32,76,49,50,44,56,0,50,32,109,117,108,32,48,46,56,52,32,115,117,98,0,0,77,48,44,48,32,76,48,44,56,32,76,56,44,56,32,76,56,44,48,32,76,48,44,48,0,0,0,0,0,0,0,0,77,48,44,48,32,76,56,44,56,32,77,48,44,56,32,76,56,44,48,32,77,48,44,52,32,76,52,44,56,32,76,56,44,52,32,76,52,44,48,32,76,48,44,52,0,0,0,0,70,73,84,95,67,79,78,86,69,82,71,69,68,0,0,0,77,48,44,48,32,76,56,44,56,32,77,48,44,56,32,76,56,44,48,0,0,0,0,0,9,60,100,101,102,115,62,10,9,9,60,112,97,116,116,101,114,110,32,105,100,61,39,103,112,80,97,116,37,100,39,32,112,97,116,116,101,114,110,85,110,105,116,115,61,39,117,115,101,114,83,112,97,99,101,79,110,85,115,101,39,32,120,61,39,48,39,32,121,61,39,48,39,32,119,105,100,116,104,61,39,56,39,32,104,101,105,103,104,116,61,39,56,39,62,10,0,0,0,0,0,0,0,0,69,108,108,105,112,116,105,99,80,105,0,0,0,0,0,0,115,116,114,111,107,101,0,0,65,118,97,110,116,71,97,114,100,101,32,68,101,109,105,32,79,98,108,105,113,117,101,0,97,36,108,108,0,0,0,0,99,111,103,95,120,0,0,0,9,60,103,32,115,116,121,108,101,32,61,32,39,115,116,114,111,107,101,58,110,111,110,101,59,32,115,104,97,112,101,45,114,101,110,100,101,114,105,110,103,58,99,114,105,115,112,69,100,103,101,115,39,62,10,0,102,108,111,97,116,54,52,0,32,32,32,32,111,102,102,115,101,116,32,0,0,0,0,0,37,115,32,61,32,39,99,117,114,114,101,110,116,67,111,108,111,114,39,0,0,0,0,0,101,108,108,105,112,115,101,115,10,0,0,0,0,0,0,0,117,115,101,115,95,97,120,105,115,91,70,73,82,83,84,95,89,95,65,88,73,83,93,0,70,50,0,0,0,0,0,0,101,36,109,112,116,121,0,0,37,115,32,61,32,39,37,115,39,0,0,0,0,0,0,0,37,115,32,61,32,39,114,103,98,40,37,51,100,44,32,37,51,100,44,32,37,51,100,41,39,0,0,0,0,0,0,0,112,97,117,115,101,100,0,0,102,105,108,108,0,0,0,0,39,47,62,10,0,0,0,0,120,47,48,46,51,50,45,48,46,55,56,49,50,53,0,0,9,108,111,97,100,112,97,116,104,32,102,114,111,109,32,71,78,85,80,76,79,84,95,76,73,66,32,105,115,32,0,0,37,46,49,102,44,37,46,49,102,37,115,0,0,0,0,0,70,73,84,58,32,101,114,114,111,114,32,111,99,99,117,114,114,101,100,32,100,117,114,105,110,103,32,102,105,116,0,0,103,112,95,115,116,114,97,100,100,0,0,0,0,0,0,0,32,112,111,105,110,116,115,32,61,32,39,0,0,0,0,0,37,56,46,51,103,0,0,0,116,105,109,101,32,118,97,108,117,101,32,111,117,116,32,111,102,32,114,97,110,103,101,0,32,102,105,108,108,32,61,32,39,117,114,108,40,35,103,112,80,97,116,37,100,41,39,0,69,108,108,105,112,116,105,99,69,0,0,0,0,0,0,0,32,102,105,108,108,45,111,112,97,99,105,116,121,32,61,32,39,37,102,39,0,0,0,0,65,118,97,110,116,71,97,114,100,101,32,68,101,109,105,0,118,36,97,114,105,97,98,108,101,115,0,0,0,0,0,0,105,110,100,101,120,95,109,97,120,95,121,0,0,0,0,0,32,102,105,108,108,32,61,32,39,37,115,39,0,0,0,0,102,108,111,97,116,51,50,0,32,97,110,100,32,97,114,101,32,110,111,116,32,114,111,116,97,116,101,100,44,10,9,0,97,117,36,116,111,102,114,101,113,0,0,0,0,0,0,0,9,9,60,112,111,108,121,103,111,110,32,0,0,0,0,0,99,105,114,99,108,101,115,10,0,0,0,0,0,0,0,0,97,108,108,32,112,111,105,110,116,115,32,121,50,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,33,0,0,70,49,0,0,0,0,0,0,116,114,97,110,115,36,112,97,114,101,110,116,0,0,0,0,32,120,109,108,58,115,112,97,99,101,61,34,112,114,101,115,101,114,118,101,34,0,0,0,77,111,117,115,105,110,103,32,110,111,116,32,97,99,116,105,118,101,0,0,0,0,0,0,99,112,56,53,48,0,0,0,32,102,105,108,108,61,34,110,111,110,101,34,0,0,0,0,32,120,108,111,119,32,120,104,105,103,104,32,121,108,111,119,32,121,104,105,103,104,0,0,32,100,121,61,34,37,46,50,102,112,116,34,0,0,0,0,48,46,51,50,32,100,105,118,32,48,46,55,56,49,50,53,32,115,117,98,0,0,0,0,32,100,120,61,34,37,46,50,102,101,109,34,0,0,0,0,108,111,103,102,105,108,101,0,32,102,111,110,116,45,115,116,121,108,101,61,34,37,115,34,32,0,0,0,0,0,0,0,32,102,111,110,116,45,119,101,105,103,104,116,61,34,37,115,34,32,0,0,0,0,0,0,69,108,108,105,112,116,105,99,75,0,0,0,0,0,0,0,110,111,114,109,97,108,0,0,65,118,97,110,116,71,97,114,100,101,32,66,111,111,107,32,79,98,108,105,113,117,101,0,116,36,101,114,109,105,110,97,108,0,0,0,0,0,0,0,105,110,100,101,120,95,109,97,120,95,120,0,0,0,0,0,100,111,0,0,0,0,0,0,32,102,111,110,116,45,115,105,122,101,61,34,37,46,49,102,112,116,34,0,0,0,0,0,117,105,110,116,54,52,0,0,32,105,110,32,50,68,32,109,111,100,101,44,32,116,101,114,109,105,110,97,108,32,112,101,114,109,105,116,116,105,110,103,44,10,9,0,0,0,0,0,101,120,112,101,99,116,101,100,32,102,111,114,109,97,116,0,32,115,116,121,108,101,61,34,102,111,110,116,45,102,97,109,105,108,121,58,37,115,34,32,0,0,0,0,0,0,0,0,114,103,98,105,109,97,103,101,10,0,0,0,0,0,0,0,97,108,108,32,112,111,105,110,116,115,32,121,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,33,0,0,0,75,80,95,57,0,0,0,0,60,116,115,112,97,110,0,0,60,116,115,112,97,110,32,100,120,61,34,45,37,46,49,102,101,109,34,32,100,121,61,34,37,46,49,102,112,116,34,62,0,0,0,0,0,0,0,0,37,115,60,47,116,115,112,97,110,62,0,0,0,0,0,0,60,47,103,62,10,0,0,0,124,40,51,120,45,50,41,47,50,124,0,0,0,0,0,0,62,10,0,0,0,0,0,0,78,111,32,102,105,116,116,97,98,108,101,32,112,97,114,97,109,101,116,101,114,115,33,10,0,0,0,0,0,0,0,0,111,110,99,108,105,99,107,61,34,103,110,117,112,108,111,116,95,115,118,103,46,116,111,103,103,108,101,86,105,115,105,98,105,108,105,116,121,40,101,118,116,44,39,37,115,95,112,108,111,116,95,37,100,37,115,39,41,34,0,0,0,0,0,0,9,60,103,32,118,105,115,105,98,105,108,105,116,121,61,34,118,105,115,105,98,108,101,34,32,0,0,0,0,0,0,0,116,97,110,104,0,0,0,0,62,60,116,105,116,108,101,62,37,115,95,112,108,111,116,95,37,100,37,115,60,47,116,105,116,108,101,62,10,0,0,0,65,118,97,110,116,71,97,114,100,101,32,66,111,111,107,0,115,36,101,116,0,0,0,0,105,110,100,101,120,95,109,105,110,95,121,0,0,0,0,0,9,60,103,32,105,100,61,34,37,115,95,112,108,111,116,95,37,100,37,115,34,32,0,0,105,110,116,54,52,0,0,0,32,98,121,32,37,100,0,0,99,111,109,36,109,101,110,116,115,99,104,97,114,115,0,0,101,120,112,101,99,116,105,110,103,32,101,120,112,111,110,101,110,116,0,0,0,0,0,0,102,111,114,109,97,116,0,0,103,110,117,112,108,111,116,0,105,109,97,103,101,10,0,0,101,100,102,0,0,0,0,0,117,115,101,115,95,97,120,105,115,91,83,69,67,79,78,68,95,88,95,65,88,73,83,93,0,0,0,0,0,0,0,0,75,80,95,56,0,0,0,0,9,60,47,103,62,10,0,0,99,111,110,116,111,117,114,32,100,50,120,0,0,0,0,0,32,104,48,46,48,49,39,47,62,0,0,0,0,0,0,0,35,32,115,101,116,32,111,117,116,112,117,116,10,0,0,0,90,32,0,0,0,0,0,0,112,109,51,100,95,112,108,111,116,45,62,113,117,97,100,114,97,110,103,108,101,115,0,0,110,111,36,114,111,116,97,116,101,0,0,0,0,0,0,0,49,46,53,32,109,117,108,32,49,32,115,117,98,32,97,98,115,0,0,0,0,0,0,0,114,111,116,36,97,116,101,0,45,112,101,114,115,105,115,116,0,0,0,0,0,0,0,0,78,117,109,98,101,114,32,111,102,32,100,97,116,97,32,112,111,105,110,116,115,32,115,109,97,108,108,101,114,32,116,104,97,110,32,110,117,109,98,101,114,32,111,102,32,112,97,114,97,109,101,116,101,114,115,0,115,105,36,122,101,0,0,0,114,36,111,109,97,110,0,0,99,111,115,104,0,0,0,0,99,36,111,117,114,105,101,114,0,0,0,0,0,0,0,0,84,105,109,101,115,32,66,111,108,100,32,73,116,97,108,105,99,0,0,0,0,0,0,0,102,36,117,110,99,116,105,111,110,115,0,0,0,0,0,0,105,110,100,101,120,95,109,105,110,95,120,0,0,0,0,0,84,111,111,32,109,97,110,121,32,108,101,118,101,108,115,32,111,102,32,110,101,115,116,101,100,32,109,97,99,114,111,115,0,0,0,0,0,0,0,0,77,79,85,83,69,95,82,85,76,69,82,95,88,0,0,0,32,110,111,114,111,116,97,116,101,0,0,0,0,0,0,0,117,105,110,116,51,50,0,0,32,114,111,116,97,116,101,100,0,0,0,0,0,0,0,0,101,120,112,101,99,116,101,100,32,102,111,110,116,0,0,0,108,97,98,101,108,115,10,0,99,108,111,115,101,0,0,0,37,105,0,0,0,0,0,0,117,115,101,115,95,97,120,105,115,91,70,73,82,83,84,95,88,95,65,88,73,83,93,0,83,105,110,103,117,108,97,114,32,109,97,116,114,105,120,32,105,110,32,76,85,45,68,69,67,79,77,80,0,0,0,0,115,109,111,111,116,104,95,98,111,120,0,0,0,0,0,0,115,112,108,105,110,101,32,114,105,103,104,116,32,115,105,100,101,0,0,0,0,0,0,0,75,80,95,55,0,0,0,0,100,117,112,108,105,99,97,116,101,100,32,97,114,103,117,109,101,110,116,115,32,105,110,32,115,116,121,108,101,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0,0,0,0,0,115,105,122,101,32,37,46,50,102,105,110,44,32,37,46,50,102,105,110,32,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,102,95,115,117,109,32,101,120,112,101,99,116,115,32,97,114,103,117,109,101,110,116,32,40,118,97,114,110,97,109,101,41,32,111,102,32,116,121,112,101,32,115,116,114,105,110,103,46,0,0,0,0,0,0,0,0,115,105,122,101,32,37,46,50,102,99,109,44,32,37,46,50,102,99,109,32,0,0,0,0,37,115,32,97,120,105,115,32,114,97,110,103,101,32,117,110,100,101,102,105,110,101,100,32,111,114,32,111,118,101,114,102,108,111,119,0,0,0,0,0,114,111,109,97,110,0,0,0,99,111,117,114,105,101,114,0,124,40,51,120,45,49,41,47,50,124,0,0,0,0,0,0,37,115,32,37,100,0,0,0,40,100,111,99,117,109,101,110,116,32,115,112,101,99,105,102,105,99,32,102,111,110,116,41,0,0,0,0,0,0,0,0,115,105,110,104,0,0,0,0,99,109,116,116,0,0,0,0,84,105,109,101,115,32,66,111,108,100,0,0,0,0,0,0,104,97,110,110,0,0,0,0,37,115,37,115,9,37,108,100,10,0,0,0,0,0,0,0,37,37,32,71,78,85,80,76,79,84,58,32,76,97,84,101,88,32,112,105,99,116,117,114,101,10,92,115,101,116,108,101,110,103,116,104,123,92,117,110,105,116,108,101,110,103,116,104,125,123,37,102,112,116,125,10,92,105,102,120,92,112,108,111,116,112,111,105,110,116,92,117,110,100,101,102,105,110,101,100,92,110,101,119,115,97,118,101,98,111,120,123,92,112,108,111,116,112,111,105,110,116,125,92,102,105,10,0,0,0,0,0,105,110,116,51,50,0,0,0,102,111,114,109,97,116,32,34,37,115,34,0,0,0,0,0,102,36,111,110,116,0,0,0,92,101,110,100,123,112,105,99,116,117,114,101,125,10,0,0,112,109,51,100,10,0,0,0,98,117,116,116,111,110,51,0,75,80,95,54,0,0,0,0,78,111,32,112,111,105,110,116,105,110,116,101,114,118,97,108,32,115,112,101,99,105,102,105,101,114,32,97,108,108,111,119,101,100,44,32,104,101,114,101,0,0,0,0,0,0,0,0,92,102,111,110,116,92,103,110,117,112,108,111,116,61,37,115,49,48,32,97,116,32,37,100,112,116,10,92,103,110,117,112,108,111,116,10,0,0,0,0,100,111,99,0,0,0,0,0,99,104,97,114,36,97,99,116,101,114,0,0,0,0,0,0,92,98,101,103,105,110,123,112,105,99,116,117,114,101,125,40,37,100,44,37,100,41,40,48,44,48,41,10,0,0,0,0,92,109,117,108,116,105,112,117,116,40,37,117,44,37,117,41,40,37,46,51,102,44,37,46,51,102,41,123,37,117,125,123,37,115,125,10,0,0,0,0,49,46,53,32,109,117,108,32,46,53,32,115,117,98,32,97,98,115,0,0,0,0,0,0,92,112,117,116,40,37,46,50,102,44,37,46,50,102,41,123,37,115,125,10,0,0,0,0,110,111,32,112,97,114,97,109,101,116,101,114,32,115,112,101,99,105,102,105,101,100,0,0,92,115,98,111,120,123,92,112,108,111,116,112,111,105,110,116,125,123,92,114,117,108,101,91,37,46,51,102,112,116,93,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,37,37,10,0,0,0,0,0,123,92,109,97,107,101,98,111,120,40,48,44,48,41,37,115,123,37,115,125,125,10,0,0,97,116,97,110,50,0,0,0,123,92,109,97,107,101,98,111,120,40,48,44,48,41,37,115,123,92,115,104,111,114,116,115,116,97,99,107,123,37,115,125,125,125,10,0,0,0,0,0,84,105,109,101,115,32,73,116,97,108,105,99,0,0,0,0,98,111,120,0,0,0,0,0,109,97,120,0,0,0,0,0,123,92,109,97,107,101,98,111,120,40,48,44,48,41,37,115,125,10,0,0,0,0,0,0,117,119,111,114,100,0,0,0,106,117,115,116,105,102,105,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,44,32,0,0,0,0,0,0,0,110,111,114,97,110,103,101,36,108,105,109,105,116,101,100,0,123,92,114,111,116,97,116,101,98,111,120,123,37,100,125,0,98,111,120,112,108,111,116,10,0,0,0,0,0,0,0,0,98,117,116,116,111,110,50,0,97,108,108,32,112,111,105,110,116,115,32,117,110,100,101,102,105,110,101,100,33,0,0,0,75,80,95,53,0,0,0,0,112,105,0,0,0,0,0,0,92,112,117,116,40,37,100,44,37,100,41,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,115,112,97,100,101,115,117,105,116,36,125,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,104,101,97,114,116,115,117,105,116,36,125,0,0,0,0,0,120,116,105,99,115,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,98,108,97,99,107,108,111,122,101,110,103,101,36,125,0,0,40,51,120,45,50,41,47,50,0,0,0,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,108,111,122,101,110,103,101,36,125,0,0,0,0,0,0,0,102,105,116,116,101,100,32,112,97,114,97,109,101,116,101,114,115,32,105,110,105,116,105,97,108,105,122,101,100,32,119,105,116,104,32,99,117,114,114,101,110,116,32,118,97,114,105,97,98,108,101,32,118,97,108,117,101,115,10,10,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,98,108,97,99,107,116,114,105,97,110,103,108,101,100,111,119,110,36,125,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,116,114,105,97,110,103,108,101,100,111,119,110,36,125,0,0,97,116,97,110,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,98,108,97,99,107,116,114,105,97,110,103,108,101,36,125,0,84,105,109,101,115,32,82,111,109,97,110,0,0,0,0,0,99,97,117,99,104,121,0,0,117,112,95,113,117,97,114,116,105,108,101,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,116,114,105,97,110,103,108,101,36,125,0,0,0,0,0,0,117,105,110,116,49,54,0,0,99,101,110,116,101,114,32,106,117,115,116,105,102,105,101,100,44,32,0,0,0,0,0,0,114,97,110,103,101,36,108,105,109,105,116,101,100,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,98,117,108,108,101,116,36,125,0,0,0,0,0,0,0,0,99,97,110,100,108,101,115,116,105,99,107,115,10,0,0,0,98,117,116,116,111,110,49,0,78,111,32,100,97,116,97,32,105,110,32,112,108,111,116,0,75,80,95,52,0,0,0,0,112,111,105,110,116,105,36,110,116,101,114,118,97,108,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,99,105,114,99,36,125,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92])
.concat([98,108,97,99,107,115,113,117,97,114,101,36,125,0,0,0,92,114,97,105,115,101,98,111,120,123,45,46,56,112,116,125,123,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,66,111,120,36,125,125,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,97,115,116,36,125,0,0,0,69,68,70,95,66,105,110,97,114,121,70,105,108,101,78,97,109,101,0,0,0,0,0,0,49,46,53,32,109,117,108,32,49,32,115,117,98,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,92,116,105,109,101,115,36,125,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,105,110,32,102,105,116,58,32,116,111,111,32,109,97,110,121,32,112,97,114,97,109,101,116,101,114,115,63,0,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,36,43,36,125,0,0,0,0,0,0,92,114,117,108,101,123,49,112,116,125,123,49,112,116,125,0,97,99,111,115,0,0,0,0,112,111,112,32,48,46,53,0,92,112,117,116,40,37,100,44,37,100,41,123,37,115,125,10,0,0,0,0,0,0,0,0,77,117,115,116,32,115,101,116,32,111,117,116,112,117,116,32,116,111,32,97,32,102,105,108,101,32,111,114,32,112,117,116,32,97,108,108,32,109,117,108,116,105,112,108,111,116,32,99,111,109,109,97,110,100,115,32,111,110,32,111,110,101,32,105,110,112,117,116,32,108,105,110,101,0,0,0,0,0,0,0,101,120,112,0,0,0,0,0,109,101,100,105,97,110,0,0,92,112,117,116,40,37,46,49,102,44,37,46,49,102,41,123,92,114,117,108,101,91,37,46,51,102,112,116,93,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,10,0,114,105,103,104,116,32,106,117,115,116,105,102,105,101,100,44,32,0,0,0,0,0,0,0,97,117,116,111,106,36,117,115,116,105,102,121,0,0,0,0,92,112,117,116,40,37,46,49,102,44,37,46,49,102,41,123,37,115,125,10,0,0,0,0,102,105,110,97,110,99,101,98,97,114,115,10,0,0,0,0,97,110,121,0,0,0,0,0,69,120,112,101,99,116,105,110,103,32,39,115,117,109,32,91,60,118,97,114,62,32,61,32,60,115,116,97,114,116,62,58,60,101,110,100,62,93,32,60,101,120,112,114,101,115,115,105,111,110,62,39,10,0,0,0,75,80,95,51,0,0,0,0,78,111,32,112,111,105,110,116,115,105,122,101,32,115,112,101,99,105,102,105,101,114,32,97,108,108,111,119,101,100,44,32,104,101,114,101,0,0,0,0,92,112,117,116,40,37,46,50,102,44,37,117,41,123,92,114,117,108,101,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,10,0,0,0,92,109,117,108,116,105,112,117,116,40,37,46,50,102,44,37,46,50,102,41,40,37,46,51,102,44,37,46,51,102,41,123,50,125,123,92,114,117,108,101,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,10,0,0,0,0,0,0,115,101,99,36,111,110,100,0,92,109,117,108,116,105,112,117,116,40,37,46,50,102,44,37,46,50,102,41,40,37,46,51,102,44,37,46,51,102,41,123,37,117,125,123,92,114,117,108,101,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,10,0,0,0,0,0,92,112,117,116,40,37,117,44,37,46,50,102,41,123,92,114,117,108,101,123,37,46,51,102,112,116,125,123,37,46,51,102,112,116,125,125,10,0,0,0,40,51,120,45,49,41,47,50,0,0,0,0,0,0,0,0,92,117,115,101,98,111,120,123,92,112,108,111,116,112,111,105,110,116,125,0,0,0,0,0,102,105,116,32,112,97,114,97,109,32,114,101,115,105,122,101,0,0,0,0,0,0,0,0,92,112,117,116,40,37,117,44,37,117,41,123,37,115,125,10,0,0,0,0,0,0,0,0,92,112,117,116,40,37,100,44,37,100,41,123,92,118,101,99,116,111,114,40,37,100,44,37,100,41,123,48,125,125,10,0,32,32,32,32,32,32,32,32,32,0,0,0,0,0,0,0,97,115,105,110,0,0,0,0,92,112,117,116,40,37,100,44,37,100,41,123,92,37,115,40,37,100,44,37,100,41,123,37,100,125,125,10,0,0,0,0,84,104,105,115,32,116,101,114,109,105,110,97,108,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,109,117,108,116,105,112,108,111,116,0,0,0,0,0,0,0,0,103,97,117,115,115,0,0,0,108,111,95,113,117,97,114,116,105,108,101,0,0,0,0,0,92,112,117,116,40,37,100,44,37,100,41,123,92,37,115,40,37,100,44,48,41,123,37,100,125,125,10,0,0,0,0,0,108,101,102,116,32,106,117,115,116,105,102,105,101,100,44,32,0,0,0,0,0,0,0,0,105,110,116,49,54,0,0,0,114,105,36,103,104,116,0,0,108,105,110,101,0,0,0,0,118,101,99,116,111,114,10,0,115,117,114,102,97,99,101,0,107,101,121,36,112,114,101,115,115,0,0,0,0,0,0,0,39,93,39,32,101,120,112,101,99,116,101,100,0,0,0,0,75,80,95,50,0,0,0,0,118,101,99,116,111,114,0,0,92,112,117,116,40,37,100,44,37,100,41,123,92,37,115,40,48,44,37,100,41,123,37,100,125,125,10,0,0,0,0,0,102,105,114,36,115,116,0,0,92,112,117,116,40,37,100,44,37,100,41,123,92,114,117,108,101,123,37,103,112,116,125,123,37,103,112,116,125,125,10,0,92,101,110,100,71,78,85,80,76,79,84,112,105,99,116,117,114,101,10,92,101,110,100,103,114,111,117,112,10,92,101,110,100,105,110,112,117,116,10,0,49,46,53,32,109,117,108,32,46,53,32,115,117,98,0,0,112,97,114,97,109,101,116,101,114,32,102,105,108,101,32,37,115,32,99,111,117,108,100,32,110,111,116,32,98,101,32,114,101,97,100,0,0,0,0,0,92,101,110,100,123,112,105,99,116,117,114,101,125,37,10,92,101,110,100,103,114,111,117,112,10,92,101,110,100,105,110,112,117,116,10,0,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,32,105,110,32,112,97,114,97,109,101,116,101,114,32,102,105,108,101,0,0,92,101,110,100,123,100,111,99,117,109,101,110,116,125,10,0,32,32,32,32,92,103,112,108,98,97,99,107,116,101,120,116,10,32,32,32,32,92,112,117,116,40,48,44,48,41,123,92,105,110,99,108,117,100,101,103,114,97,112,104,105,99,115,123,37,115,125,125,37,37,10,32,32,32,32,92,103,112,108,102,114,111,110,116,116,101,120,116,10,32,32,92,101,110,100,123,112,105,99,116,117,114,101,125,37,37,10,92,101,110,100,103,114,111,117,112,10,0,0,0,116,97,110,0,0,0,0,0,115,112,108,105,110,101,36,115,0,0,0,0,0,0,0,0,109,105,110,0,0,0,0,0,92,114,111,116,97,116,101,98,111,120,123,37,100,125,123,0,10,9,32,32,108,97,98,101,108,115,32,97,114,101,32,0,117,98,121,116,101,0,0,0,32,32,32,32,32,32,92,112,117,116,40,37,100,44,37,100,41,123,0,0,0,0,0,0,104,105,115,116,101,112,115,10,0,0,0,0,0,0,0,0,105,110,100,101,120,101,115,32,108,117,0,0,0,0,0,0,120,50,32,114,97,110,103,101,32,105,115,32,105,110,118,97,108,105,100,0,0,0,0,0,39,58,39,32,101,120,112,101,99,116,101,100,0,0,0,0,75,80,95,49,0,0,0,0,112,115,0,0,0,0,0,0,32,32,32,32,32,32,92,99,111,108,111,114,103,114,97,121,123,37,115,125,37,37,10,0,32,32,32,32,32,32,92,99,111,108,111,114,123,119,104,105,116,101,125,37,37,10,0,0,32,32,32,32,32,32,92,99,111,108,111,114,123,98,108,97,99,107,125,37,37,10,0,0,119,98,97,48,49,50,51,52,53,54,55,56,0,0,0,0,124,51,120,45,50,124,0,0,34,37,115,34,32,0,0,0,32,32,32,32,32,32,92,99,115,110,97,109,101,32,76,84,37,99,92,101,110,100,99,115,110,97,109,101,37,37,10,0,70,73,88,69,68,58,32,32,37,115,10,0,0,0,0,0,59,0,0,0,0,0,0,0,32,32,32,32,32,32,92,99,111,108,111,114,114,103,98,123,37,51,46,50,102,44,37,51,46,50,102,44,37,51,46,50,102,125,37,37,10,0,0,0,105,108,108,101,103,97,108,32,100,97,121,32,111,102,32,109,111,110,116,104,0,0,0,0,37,37,112,109,51,100,95,109,97,112,95,101,110,100,10,0,99,111,115,0,0,0,0,0,37,37,112,109,51,100,95,109,97,112,95,98,101,103,105,110,10,0,0,0,0,0,0,0,109,112,32,116,105,116,108,101,0,0,0,0,0,0,0,0,113,110,111,114,109,0,0,0,115,117,109,95,115,113,0,0,32,32,32,32,92,103,112,108,103,97,100,100,116,111,109,97,99,114,111,92,103,112,108,102,114,111,110,116,116,101,120,116,123,37,10,0,0,0,0,0,10,9,32,32,116,105,99,115,32,97,114,101,32,108,105,109,105,116,101,100,32,116,111,32,100,97,116,97,32,114,97,110,103,101,0,0,0,0,0,0,117,105,110,116,56,0,0,0,32,32,32,32,92,103,112,108,103,97,100,100,116,111,109,97,99,114,111,92,103,112,108,98,97,99,107,116,101,120,116,123,37,10,0,0,0,0,0,0,102,115,116,101,112,115,10,0,109,97,116,114,105,120,32,58,32,116,104,105,110,32,112,108,97,116,101,32,115,112,108,105,110,101,115,32,50,100,0,0,117,110,101,120,112,101,99,116,101,100,32,125,0,0,0,0,42,42,0,0,0,0,0,0,75,80,95,48,0,0,0,0,112,111,105,110,116,115,36,105,122,101,0,0,0,0,0,0,32,32,32,32,125,37,10,0,125,37,10,0,0,0,0,0,99,112,52,51,55,0,0,0,37,10,32,32,92,115,112,101,99,105,97,108,123,112,115,58,32,99,117,114,114,101,110,116,112,111,105,110,116,32,103,114,101,115,116,111,114,101,32,109,111,118,101,116,111,125,37,10,32,32,0,0,0,0,0,0,32,121,108,111,119,32,121,104,105,103,104,0,0,0,0,0,92,114,106,117,115,116,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,0,0,51,32,109,117,108,32,50,32,115,117,98,32,97,98,115,0,112,117,115,104,100,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,91,114,93,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,99,111,117,108,100,32,110,111,116,32,114,101,97,100,32,112,97,114,97,109,101,116,101,114,45,102,105,108,101,32,34,37,115,34,0,0,0,0,0,0,92,99,106,117,115,116,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,0,0,0,115,105,110,0,0,0,0,0,92,108,106,117,115,116,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,0,0,71,80,86,65,76,95,77,85,76,84,73,80,76,79,84,0,99,110,36,111,114,109,97,108,0,0,0,0,0,0,0,0,115,117,109,0,0,0,0,0,99,108,36,101,97,114,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,91,108,93,123,92,115,116,114,117,116,123,125,37,115,125,0,0,0,0,32,97,110,100,32,109,105,114,114,111,114,101,100,32,111,110,32,111,112,112,111,115,105,116,101,32,98,111,114,100,101,114,0,0,0,0,0,0,0,0,98,121,116,101,0,0,0,0,110,111,114,111,36,116,97,116,101,0,0,0,0,0,0,0,78,101,101,100,32,48,32,116,111,32,50,32,117,115,105,110,103,32,115,112,101,99,115,32,102,111,114,32,115,116,97,116,115,32,99,111,109,109,97,110,100,0,0,0,0,0,0,0,92,109,97,107,101,98,111,120,40,48,44,48,41,37,115,0,115,116,101,112,115,10,0,0,116,104,105,110,32,112,108,97,116,101,32,115,112,108,105,110,101,115,32,105,110,32,100,103,114,105,100,51,100,0,0,0,101,120,112,101,99,116,105,110,103,32,123,119,104,105,108,101,45,99,108,97,117,115,101,125,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,101,120,112,114,101,115,115,105,111,110,32,0,0,0,0,0,75,80,95,68,105,118,105,100,101,0,0,0,0,0,0,0,78,111,32,112,111,105,110,116,116,121,112,101,32,115,112,101,99,105,102,105,101,114,32,97,108,108,111,119,101,100,44,32,104,101,114,101,0,0,0,0,37,37,10,32,32,92,115,112,101,99,105,97,108,123,112,115,58,32,103,115,97,118,101,32,99,117,114,114,101,110,116,112,111,105,110,116,32,99,117,114,114,101,110,116,112,111,105,110,116,32,116,114,97,110,115,108,97,116,101,10,37,100,32,114,111,116,97,116,101,32,110,101,103,32,101,120,99,104,32,110,101,103,32,101,120,99,104,32,116,114,97,110,115,108,97,116,101,125,37,37,10,32,32,0,32,32,92,112,117,116,40,37,100,44,37,100,41,123,0,0,92,102,111,110,116,115,105,122,101,123,37,103,125,123,92,98,97,115,101,108,105,110,101,115,107,105,112,125,92,115,101,108,101,99,116,102,111,110,116,10,0,0,0,0,0,0,0,0,32,32,125,125,37,10,0,0,124,51,120,45,49,124,0,0,117,36,110,105,116,0,0,0,102,105,116,116,101,100,32,112,97,114,97,109,101,116,101,114,115,32,97,110,100,32,105,110,105,116,105,97,108,32,118,97,108,117,101,115,32,102,114,111,109,32,102,105,108,101,58,32,37,115,10,10,0,0,0,0,110,111,36,104,97,99,107,116,101,120,116,0,0,0,0,0,37,32,71,78,85,80,76,79,84,58,32,76,97,84,101,88,32,112,105,99,116,117,114,101,32,117,115,105,110,103,32,80,83,84,82,73,67,75,83,32,109,97,99,114,111,115,10,0,99,111,110,106,103,0,0,0,92,99,97,116,99,111,100,101,96,64,61,49,50,10,92,102,105,10,92,101,110,100,112,115,112,105,99,116,117,114,101,10,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,114,32,100,117,112,108,105,99,97,116,101,32,111,112,116,105,111,110,0,0,0,0,0,92,112,115,112,105,99,116,117,114,101,40,37,102,44,37,102,41,40,37,102,44,37,102,41,10,92,105,102,120,92,110,111,102,105,103,115,92,117,110,100,101,102,105,110,101,100,10,92,99,97,116,99,111,100,101,96,64,61,49,49,10,10,0,0,107,36,100,101,110,115,105,116,121,0,0,0,0,0,0,0,115,116,100,100,101,118,0,0,32,37,100,10,0,0,0,0,111,110,32,98,111,114,100,101,114,0,0,0,0,0,0,0,105,110,116,56,0,0,0,0,92,112,115,115,101,116,123,117,110,105,116,61,53,46,48,105,110,44,120,117,110,105,116,61,53,46,48,105,110,44,121,117,110,105,116,61,51,46,48,105,110,125,10,0,0,0,0,0,105,110,112,117,116,32,108,105,110,101,32,99,111,112,121,0,114,111,36,116,97,116,101,0,32,43,37,100,10,0,0,0,98,111,120,120,121,101,114,114,111,114,98,97,114,115,10,0,71,114,105,100,100,105,110,103,32,111,102,32,116,104,101,32,99,111,108,111,114,32,99,111,108,117,109,110,32,105,115,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,101,120,112,101,99,116,105,110,103,32,123,100,111,45,99,108,97,117,115,101,125,0,0,0,98,105,110,0,0,0,0,0,83,107,105,112,112,105,110,103,32,100,97,116,97,32,102,105,108,101,32,119,105,116,104,32,110,111,32,118,97,108,105,100,32,112,111,105,110,116,115,0,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,65,114,114,111,119,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,125,10,92,99,97,116,99,111,100,101,96,64,61,49,50,10,10,92,102,105,10,0,0,0,0,0,75,80,95,68,101,99,105,109,97,108,0,0,0,0,0,0,32,40,117,110,100,101,102,105,110,101,100,41,10,0,0,0,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,80,108,117,115,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,43,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,83,113,117,97,114,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,115,113,117,97,114,101,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,67,105,114,99,108,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,111,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,84,114,105,97,110,103,108,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,116,114,105,97,110,103,108,101,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,80,101,110,116,97,103,111,110,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,112,101,110,116,97,103,111,110,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,70,105,108,108,115,113,117,97,114,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,115,113,117,97,114,101,42,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,70,105,108,108,99,105,114,99,108,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,42,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,70,105,108,108,116,114,105,97,110,103,108,101,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,116,114,105,97,110,103,108,101,42,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,70,105,108,108,112,101,110,116,97,103,111,110,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,112,101,110,116,97,103,111,110,42,125,10,0,0,0,0,0,99,111,110,116,111,117,114,32,100,101,108,116,97,95,116,0,32,37,99,32,100,117,109,109,121,10,0,0,0,0,0,0,97,100,100,95,116,105,99,95,117,115,101,114,58,32,108,105,115,116,32,115,111,114,116,32,101,114,114,111,114,0,0,0,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,68,105,97,109,111,110,100,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,115,113,117,97,114,101,44,100,111,116,97,110,103,108,101,61,52,53,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,70,105,108,108,100,105,97,109,111,110,100,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,115,113,117,97,114,101,42,44,100,111,116,97,110,103,108,101,61,52,53,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,67,114,111,115,115,125,123,112,115,100,111,116,115,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,44,100,111,116,115,116,121,108,101,61,43,44,100,111,116,97,110,103,108,101,61,52,53,125,10,0,0,0,0,0,0,0,0,35,32,115,101,116,32,111,117,116,112,117,116,32,39,37,115,39,10,0,0,0,0,0,0,32,37,115,10,0,0,0,0,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,66,111,114,100,101,114,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,53,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,65,120,101,115,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,53,44,108,105,110,101,115,116,121,108,101,61,100,111,116,116,101,100,44,100,111,116,115,101,112,61,46,48,48,52,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,83,111,108,105,100,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,53,44,108,105,110,101,115,116,121,108,101,61,115,111,108,105,100,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,68,97,115,104,101,100,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,53,44,108,105,110,101,115,116,121,108,101,61,100,97,115,104,101,100,44,100,97,115,104,61,46,48,49,32,46,48,49,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,68,111,116,116,101,100,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,50,53,44,108,105,110,101,115,116,121,108,101,61,100,111,116,116,101,100,44,100,111,116,115,101,112,61,46,48,48,56,125,10,92,110,101,119,112,115,111,98,106,101,99,116,123,80,83,84,64,76,111,110,103,68,97,115,104,125,123,112,115,108,105,110,101,125,123,108,105,110,101,119,105,100,116,104,61,46,48,48,49,53,44,108,105,110,101,115,116,121,108,101,61,100,97,115,104,101,100,44,100,97,115,104,61,46,48,50,32,46,48,49,125,10,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,32,116,111,32,112,108,111,116,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,10,9,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,0,0,0,0,51,32,109,117,108,32,49,32,115,117,98,32,97,98,115,0,37,32,68,101,102,105,110,101,32,110,101,119,32,80,83,84,32,111,98,106,101,99,116,115,44,32,105,102,32,110,111,116,32,97,108,114,101,97,100,121,32,100,101,102,105,110,101,100,10,92,105,102,120,92,80,83,84,108,111,97,100,101,100,92,117,110,100,101,102,105,110,101,100,10,92,100,101,102,92,80,83,84,108,111,97,100,101,100,123,116,125,10,92,112,115,115,101,116,123,97,114,114,111,119,115,105,122,101,61,46,48,49,32,51,46,50,32,49,46,52,32,46,51,125,10,92,112,115,115,101,116,123,100,111,116,115,105,122,101,61,46,48,49,125,10,92,99,97,116,99,111,100,101,96,64,61,49,49,10,10,0,0,0,0,0,0,0,0,32,40,102,105,120,109,97,120,41,0,0,0,0,0,0,0,85,115,97,103,101,58,32,103,110,117,112,108,111,116,32,91,79,80,84,73,79,78,93,46,46,46,32,91,70,73,76,69,93,10,32,32,45,86,44,32,45,45,118,101,114,115,105,111,110,10,32,32,45,104,44,32,45,45,104,101,108,112,10,32,32,45,112,32,32,45,45,112,101,114,115,105,115,116,10,32,32,45,100,32,32,45,45,100,101,102,97,117,108,116,45,115,101,116,116,105,110,103,115,10,32,32,45,101,32,32,34,99,111,109,109,97,110,100,49,59,32,99,111,109,109,97,110,100,50,59,32,46,46,46,34,10,103,110,117,112,108,111,116,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,10,0,0,0,0,0,0,0,92,80,83,84,64,76,111,110,103,68,97,115,104,0,0,0,102,105,116,32,112,97,114,97,109,0,0,0,0,0,0,0,32,40,102,105,120,109,105,110,41,0,0,0,0,0,0,0,112,101,114,109,95,97,116,0,92,80,83,84,64,68,111,116,116,101,100,0,0,0,0,0,32,40,109,97,120,41,0,0,92,80,83,84,64,68,97,115,104,101,100,0,0,0,0,0,97,114,103,0,0,0,0,0,32,40,109,105,110,41,0,0,101,120,112,101,99,116,105,110,103,32,60,121,111,102,102,115,101,116,62,0,0,0,0,0,92,80,83,84,64,83,111,108,105,100,0,0,0,0,0,0,99,117,109,36,117,108,97,116,105,118,101,0,0,0,0,0,109,101,97,110,0,0,0,0,109,111,117,115,101,46,99,0,103,110,117,112,108,111,116,62,32,0,0,0,0,0,0,0,9,37,115,58,32,37,115,37,115,37,115,37,115,37,115,44,32,0,0,0,0,0,0,0,32,97,110,100,32,109,105,114,114,111,114,101,100,32,37,115,0,0,0,0,0,0,0,0,108,102,0,0,0,0,0,0,92,80,83,84,64,65,120,101,115,0,0,0,0,0,0,0,9,97,117,116,111,115,99,97,108,105,110,103,32,105,115,32,0,0,0,0,0,0,0,0,98,111,120,101,114,114,111,114,98,97,114,115,10,0,0,0,78,111,32,117,115,97,98,108,101,32,100,97,116,97,32,105,110,32,116,104,105,115,32,112,108,111,116,32,116,111,32,97,117,116,111,45,115,99,97,108,101,32,97,120,105,115,32,114,97,110,103,101,0,0,0,0,99,97,108,108,95,97,114,103,99,32,62,61,32,48,32,38,38,32,99,97,108,108,95,97,114,103,99,32,60,61,32,57,0,0,0,0,0,0,0,0,101,108,115,101,32,119,105,116,104,111,117,116,32,105,102,0,78,101,101,100,32,117,115,105,110,103,32,115,112,101,99,32,102,111,114,32,121,32,116,105,109,101,32,100,97,116,97,0,99,111,108,117,109,110,0,0,83,105,110,103,117,108,97,114,32,109,97,116,114,105,120,32,105,110,32,73,110,118,101,114,116,95,82,116,82,0,0,0,99,98,111,120,0,0,0,0,115,112,108,105,110,101,32,104,101,108,112,32,109,97,116,114,105,120,0,0,0,0,0,0,92,80,83,84,64,66,111,114,100,101,114,0,0,0,0,0,75,80,95,83,117,98,116,114,97,99,116,0,0,0,0,0,115,112,114,105,110,116,102,95,115,112,101,99,105,102,105,101,114,58,32,110,111,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,101,114,10,0,9,101,114,114,111,114,115,32,97,114,101,32,112,108,111,116,116,101,100,32,119,105,116,104,111,117,116,32,98,97,114,115,10,0,0,0,0,0,0,0,40,37,46,52,102,44,37,46,52,102,41,10,0,0,0,0,114,97,110,103,101,32,115,112,101,99,105,102,105,101,114,115,32,111,102,32,115,117,109,32,109,117,115,116,32,104,97,118,101,32,105,110,116,101,103,101,114,32,118,97,108,117,101,115,0,0,0,0,0,0,0,0,9,101,114,114,111,114,98,97,114,115,32,97,114,101,32,112,108,111,116,116,101,100,32,105,110,32,37,115,32,119,105,116,104,32,98,97,114,115,32,111,102,32,115,105,122,101,32,37,102,10,0,0,0,0,0,0,36,37,102,32,92,116,105,109,101,115,32,49,48,94,123,37,100,125,36,0,0,0,0,0,9,98,111,114,100,101,114,32,37,100,32,105,115,32,100,114,97,119,110,32,105,110,32,37,115,32,111,102,32,116,104,101,32,112,108,111,116,32,101,108,101,109,101,110,116,115,32,119,105,116,104,10,9,32,0,0,36,37,102,36,0,0,0,0,9,98,111,114,100,101,114,32,105,115,32,110,111,116,32,100,114,97,119,110,10,0,0,0,51,120,45,50,0,0,0,0,36,37,100,32,92,116,105,109,101,115,32,49,48,94,123,37,100,125,36,0,0,0,0,0,114,101,108,97,116,105,118,101,0,0,0,0,0,0,0,0,36,37,100,36,0,0,0,0,78,101,101,100,32,118,105,97,32,97,110,100,32,101,105,116,104,101,114,32,112,97,114,97,109,101,116,101,114,32,108,105,115,116,32,111,114,32,102,105,108,101,0,0,0,0,0,0,97,98,115,111,108,117,116,101,0,0,0,0,0,0,0,0,36,49,48,94,123,37,100,125,36,0,0,0,0,0,0,0,9,98,111,120,119,105,100,116,104,32,105,115,32,37,103,32,37,115,10,0,0,0,0,0,48,0,0,0,0,0,0,0,105,109,97,103,0,0,0,0,9,98,111,120,119,105,100,116,104,32,105,115,32,97,117,116,111,10,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,60,121,115,99,97,108,101,62,0,0,0,0,0,0,123,37,115,125,10,0,0,0,102,36,114,101,113,117,101,110,99,121,0,0,0,0,0,0,37,115,37,115,9,37,102,10,0,0,0,0,0,0,0,0,9,110,111,116,32,100,114,97,119,105,110,103,32,108,105,110,101,115,32,98,101,116,119,101,101,110,32,116,119,111,32,111,117,116,114,97,110,103,101,32,112,111,105,110,116,115,10,0,111,110,32,97,120,105,115,0,100,111,117,98,108,101,0,0,40,37,46,52,102,44,37,46,52,102,41,0,0,0,0,0,115,99,36,97,108,101,0,0,9,100,114,97,119,105,110,103,32,97,110,100,32,99,108,105,112,112,105,110,103,32,108,105,110,101,115,32,98,101,116,119,101,101,110,32,116,119,111,32,111,117,116,114,97,110,103,101,32,112,111,105,110,116,115,10,0,0,0,0,0,0,0,0,87,114,111,110,103,32,110,117,109,98,101,114,32,111,102,32,99,111,108,117,109,110,115,32,105,110,32,105,110,112,117,116,32,100,97,116,97,32,45,32,108,105,110,101,32,37,100,0,73,110,118,97,108,105,100,32,123,101,108,115,101,45,99,108,97,117,115,101,125,0,0,0,119,111,114,100,115,0,0,0,123,76,125,0,0,0,0,0,75,80,95,83,101,112,97,114,97,116,111,114,0,0,0,0,115,112,114,105,110,116,102,95,115,112,101,99,105,102,105,101,114,58,32,117,115,101,100,32,119,105,116,104,32,105,110,118,97,108,105,100,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,101,114,10,0,0,9,110,111,116,32,100,114,97,119,105,110,103,32,108,105,110,101,115,32,98,101,116,119,101,101,110,32,105,110,114,97,110,103,101,32,97,110,100,32,111,117,116,114,97,110,103,101,32,112,111,105,110,116,115,10,0,91,114,93,0,0,0,0,0,9,100,114,97,119,105,110,103,32,97,110,100,32,99,108,105,112,112,105,110,103,32,108,105,110,101,115,32,98,101,116,119,101,101,110,32,105,110,114,97,110,103,101,32,97,110,100,32,111,117,116,114,97,110,103,101,32,112,111,105,110,116,115,10,0,0,0,0,0,0,0,0,91,108,93,0,0,0,0,0,9,112,111,105,110,116,32,99,108,105,112,32,105,115,32,37,115,10,0,0,0,0,0,0,92,114,112,117,116,0,0,0,9,99,111,110,116,111,117,114,32,108,105,110,101,32,116,121,112,101,115,32,97,114,101,32,97,108,108,32,116,104,101,32,115,97,109,101,10,0,0,0,51,32,109,117,108,32,50,32,115,117,98,0,0,0,0,0,92,80,83,84,64,70,105,108,108,112,101,110,116,97,103,111,110,0,0,0,0,0,0,0,9,99,111,110,116,111,117,114,32,108,105,110,101,32,116,121,112,101,115,32,97,114,101,32,118,97,114,105,101,100,32,38,32,108,97,98,101,108,101,100,32,119,105,116,104,32,102,111,114,109,97,116,32,39,37,115,39,10,0,0,0,0,0,0,92,80,83,84,64,70,105,108,108,99,105,114,99,108,101,0,118,105,97,0,0,0,0,0,9,9,37,100,32,105,110,99,114,101,109,101,110,116,97,108,32,108,101,118,101,108,115,32,115,116,97,114,116,105,110,103,32,97,116,32,37,103,44,32,115,116,101,112,32,37,103,44,32,101,110,100,32,37,103,10,0,0,0,0,0,0,0,0,92,80,83,84,64,70,105,108,108,116,114,105,97,110,103,108,101,0,0,0,0,0,0,0,44,37,103,32,0,0,0,0,92,80,83,84,64,70,105,108,108,115,113,117,97,114,101,0,98,101,108,111,119,0,0,0,114,101,97,108,0,0,0,0,111,110,108,121,32,118,97,108,105,100,32,97,115,32,112,97,114,116,32,111,102,32,97,110,32,97,117,116,111,45,108,97,121,111,117,116,32,99,111,109,109,97,110,100,0,0,0,0,92,80,83,84,64,70,105,108,108,100,105,97,109,111,110,100,0,0,0,0,0,0,0,0,97,98,111,118,101,0,0,0,117,36,110,105,113,117,101,0,37,49,49,46,53,101,0,0,9,9,37,100,32,100,105,115,99,114,101,116,101,32,108,101,118,101,108,115,32,97,116,32,0,0,0,0,0,0,0,0,79,70,70,10,0,0,0,0,102,0,0,0,0,0,0,0,92,80,83,84,64,80,101,110,116,97,103,111,110,0,0,0,111,117,116,36,119,97,114,100,115,0,0,0,0,0,0,0,9,9,97,112,112,114,111,120,46,32,37,100,32,97,117,116,111,109,97,116,105,99,32,108,101,118,101,108,115,10,0,0,100,97,116,97,0,0,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,85,110,107,110,111,119,110,32,109,97,112,112,105,110,103,32,116,121,112,101,0,0,0,0,79,108,100,45,115,116,121,108,101,32,105,102,47,101,108,115,101,32,115,116,97,116,101,109,101,110,116,32,101,110,99,111,117,110,116,101,114,101,100,32,105,110,115,105,100,101,32,98,114,97,99,107,101,116,115,0,78,101,119,32,104,105,115,116,111,103,114,97,109,0,0,0,115,112,114,105,110,116,102,0,92,80,83,84,64,84,114,105,97,110,103,108,101,0,0,0,75,80,95,65,100,100,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,112,114,105,110,116,102,95,115,112,101,99,105,102,105,101,114,32,99,97,108,108,101,100,32,119,105,116,104,111,117,116,32,39,37,39,10,0,0,0,9,9,97,115,32,98,115,112,108,105,110,101,32,97,112,112,114,111,120,105,109,97,116,105,111,110,32,115,101,103,109,101,110,116,115,32,111,102,32,111,114,100,101,114,32,37,100,32,119,105,116,104,32,37,100,32,112,116,115,10,0,0,0,0,92,80,83,84,64,67,105,114,99,108,101,0,0,0,0,0,121,50,0,0,0,0,0,0,9,9,97,115,32,99,117,98,105,99,32,115,112,108,105,110,101,32,105,110,116,101,114,112,111,108,97,116,105,111,110,32,115,101,103,109,101,110,116,115,32,119,105,116,104,32,37,100,32,112,116,115,10,0,0,0,92,80,83,84,64,67,114,111,115,115,0,0,0,0,0,0,120,50,0,0,0,0,0,0,9,9,97,115,32,108,105,110,101,97,114,32,115,101,103,109,101,110,116,115,10,0,0,0,92,80,83,84,64,83,113,117,97,114,101,0,0,0,0,0,121,49,0,0,0,0,0,0,103,114,105,100,32,98,97,115,101,32,97,110,100,32,115,117,114,102,97,99,101,10,0,0,67,97,110,39,116,32,117,115,101,32,112,109,51,100,32,102,111,114,32,50,100,32,112,108,111,116,115,0,0,0,0,0,51,120,45,49,0,0,0,0,92,80,83,84,64,80,108,117,115,0,0,0,0,0,0,0,120,49,0,0,0,0,0,0,115,117,114,102,97,99,101,10,0,0,0,0,0,0,0,0,92,80,83,84,64,68,105,97,109,111,110,100,0,0,0,0,99,36,108,111,115,101,100,0,102,117,110,99,116,105,111,110,32,117,115,101,100,32,102,111,114,32,102,105,116,116,105,110,103,58,32,37,115,10,0,0,103,114,105,100,32,98,97,115,101,10,0,0,0,0,0,0,37,115,40,37,46,52,102,44,37,46,52,102,41,10,0,0,101,108,108,36,105,112,115,101,115,0,0,0,0,0,0,0,32,105,110,32,37,100,32,108,101,118,101,108,115,32,111,110,32,0,0,0,0,0,0,0,92,113,100,105,115,107,40,37,46,52,102,44,37,46,52,102,41,123,37,46,52,102,125,10,0,0,0,0,0,0,0,0,99,105,114,36,99,108,101,115,0,0,0,0,0,0,0,0,51,100,112,108,111,116,0,0,116,105,109,101,99,111,108,117,109,110,0,0,0,0,0,0,110,111,116,32,100,114,97,119,110,10,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,60,110,117,109,95,99,111,108,115,62,0,0,0,0,123,45,62,125,0,0,0,0,114,103,98,97,36,108,112,104,97,0,0,0,0,0,0,0,115,36,98,101,122,105,101,114,0,0,0,0,0,0,0,0,37,49,49,46,52,102,0,0,9,99,111,110,116,111,117,114,32,102,111,114,32,115,117,114,102,97,99,101,115,32,97,114,101,32,37,115,0,0,0,0,9,37,115,45,97,120,105,115,32,116,105,99,115,58,9,0,102,108,111,97,116,0,0,0,92,80,83,84,64,65,114,114,111,119,37,115,40,37,46,52,102,44,37,46,52,102,41,40,37,46,52,102,44,37,46,52,102,41,10,0,0,0,0,0,114,103,98,105,109,97,36,103,101,0,0,0,0,0,0,0,105,110,36,119,97,114,100,115,0,0,0,0,0,0,0,0,9,100,97,116,97,32,103,114,105,100,51,100,32,105,115,32,100,105,115,97,98,108,101,100,10,0,0,0,0,0,0,0,102,105,108,108,101,100,99,117,114,118,101,115,32,0,0,0,78,101,101,100,32,50,32,111,114,32,51,32,99,111,108,117,109,110,115,0,0,0,0,0,99,108,97,117,115,101,0,0,76,111,103,32,115,99,97,108,101,32,111,110,32,89,32,105,115,32,105,110,99,111,109,112,97,116,105,98,108,101,32,119,105,116,104,32,115,116,97,99,107,101,100,32,104,105,115,116,111,103,114,97,109,32,112,108,111,116,10,0,0,0,0,0,80,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,92,100,101,102,92,112,111,108,121,112,109,73,73,73,100,35,49,123,92,112,115,112,111,108,121,103,111,110,91,108,105,110,101,115,116,121,108,101,61,110,111,110,101,44,102,105,108,108,115,116,121,108,101,61,115,111,108,105,100,44,102,105,108,108,99,111,108,111,114,61,80,83,84,64,67,79,76,79,82,35,49,93,125,10,10,0,0,0,105,109,97,36,103,101,0,0,75,80,95,77,117,108,116,105,112,108,121,0,0,0,0,0,118,97,114,36,105,97,98,108,101,0,0,0,0,0,0,0,97,116,116,101,109,112,116,32,116,111,32,97,115,115,105,103,110,32,116,111,32,115,111,109,101,116,104,105,110,103,32,111,116,104,101,114,32,116,104,97,110,32,97,32,110,97,109,101,100,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,44,32,107,100,101,110,115,105,116,121,50,100,32,109,111,100,101,0,0,0,0,0,0,0,92,110,101,119,114,103,98,99,111,108,111,114,123,80,83,84,64,67,79,76,79,82,37,100,125,123,37,103,32,37,103,32,37,103,125,10,0,0,0,0,108,97,98,101,108,115,0,0,9,100,97,116,97,32,103,114,105,100,51,100,32,105,115,32,101,110,97,98,108,101,100,32,102,111,114,32,109,101,115,104,32,111,102,32,115,105,122,101,32,37,100,120,37,100,44,32,107,101,114,110,101,108,61,37,115,44,10,9,115,99,97,108,101,32,102,97,99,116,111,114,115,32,120,61,37,102,44,32,121,61,37,102,37,115,10,0,99,111,108,111,114,32,97,120,105,115,0,0,0,0,0,0,92,110,101,119,103,114,97,121,123,80,83,84,64,67,79,76,79,82,37,100,125,123,37,103,125,10,0,0,0,0,0,0,99,97,110,36,100,108,101,115,116,105,99,107,115,0,0,0,9,100,97,116,97,32,103,114,105,100,51,100,32,105,115,32,101,110,97,98,108,101,100,32,102,111,114,32,109,101,115,104,32,111,102,32,115,105,122,101,32,37,100,120,37,100,44,32,115,112,108,105,110,101,115,10,0,0,0,0,0,0,0,0,112,115,116,114,105,99,107,115,58,32,80,97,108,101,116,116,101,32,117,115,101,100,32,98,101,102,111,114,101,32,115,101,116,33,10,0,0,0,0,0,102,105,110,36,97,110,99,101,98,97,114,115,0,0,0,0,9,100,97,116,97,32,103,114,105,100,51,100,32,105,115,32,101,110,97,98,108,101,100,32,102,111,114,32,109,101,115,104,32,111,102,32,115,105,122,101,32,37,100,120,37,100,44,32,110,111,114,109,61,37,100,10,0,0,0,0,0,0,0,0,51,32,109,117,108,32,49,32,115,117,98,0,0,0,0,0,40,37,46,52,103,44,37,46,52,103,41,0,0,0,0,0,118,101,99,36,116,111,114,115,0,0,0,0,0,0,0,0,9,99,111,109,109,97,110,100,32,108,105,110,101,32,109,97,99,114,111,115,32,119,105,108,108,32,37,115,98,101,32,101,120,112,97,110,100,101,100,10,0,0,0,0,0,0,0,0,68,97,109,97,103,101,100,32,69,68,70,32,104,101,97,100,101,114,32,111,102,32,37,115,58,32,110,111,116,32,109,117,108,116,105,112,108,101,32,111,102,32,53,49,50,32,66,46,10,0,0,0,0,0,0,0,92,112,111,108,121,112,109,73,73,73,100,123,37,100,125,0,104,105,115,36,116,101,112,115,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,114,101,115,105,100,117,97,108,115,32,97,114,101,32,119,101,105,103,104,116,101,100,32,101,113,117,97,108,108,121,32,40,117,110,105,116,32,119,101,105,103,104,116,41,10,10,0,0,99,121,108,105,110,100,114,105,99,97,108,10,0,0,0,0,37,37,32,71,78,85,80,76,79,84,58,32,76,97,84,101,88,32,117,115,105,110,103,32,84,69,88,68,82,65,87,32,109,97,99,114,111,115,10,0,102,115,36,116,101,112,115,0,115,112,104,101,114,105,99,97,108,10,0,0,0,0,0,0,92,101,110,100,123,116,101,120,100,114,97,119,125,10,0,0,102,105,108,108,115,116,36,101,112,115,0,0,0,0,0,0,118,97,108,105,100,0,0,0,65,115,115,101,114,116,105,111,110,32,102,97,105,108,101,100,58,32,37,115,0,0,0,0,99,97,114,116,101,115,105,97,110,10,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,44,32,60,110,117,109,95,99,111,108,115,62,39,0,0,0,0,0,0,0,0,40,37,100,32,37,100,41,0,115,116,36,101,112,115,0,0,99,36,115,112,108,105,110,101,115,0,0,0,0,0,0,0,32,32,83,117,109,32,120,121,58,32,32,32,32,32,32,32,37,46,52,103,10,0,0,0,9,109,97,112,112,105,110,103,32,102,111,114,32,51,45,100,32,100,97,116,97,32,105,115,32,0,0,0,0,0,0,0,79,85,84,0,0,0,0,0,108,117,0,0,0,0,0,0,10,92,99,112,97,116,104,32,0,0,0,0,0,0,0,0,98,111,120,120,36,121,101,114,114,111,114,98,97,114,115,0,110,111,109,105,36,114,114,111])
.concat([114,0,0,0,0,0,0,0,9,100,117,109,109,121,32,118,97,114,105,97,98,108,101,115,32,97,114,101,32,34,37,115,34,32,97,110,100,32,34,37,115,34,10,0,0,0,0,0,104,105,115,116,111,103,114,97,109,115,10,0,0,0,0,0,50,32,99,111,108,117,109,110,115,32,111,110,108,121,32,112,111,115,115,105,98,108,101,32,119,105,116,104,32,101,120,112,108,105,99,105,116,32,112,109,51,100,32,115,116,121,108,101,32,40,108,105,110,101,32,37,100,41,0,0,0,0,0,0,76,111,103,32,115,99,97,108,101,32,111,110,32,88,32,105,115,32,105,110,99,111,109,112,97,116,105,98,108,101,32,119,105,116,104,32,104,105,115,116,111,103,114,97,109,32,112,108,111,116,115,10,0,0,0,0,101,120,112,101,99,116,101,100,32,123,101,108,115,101,45,99,108,97,117,115,101,125,0,0,67,111,108,117,109,110,32,110,117,109,98,101,114,32,101,120,112,101,99,116,101,100,0,0,92,112,97,116,104,32,40,37,100,32,37,100,41,0,0,0,98,111,120,101,114,36,114,111,114,98,97,114,115,0,0,0,75,80,95,69,113,117,97,108,0,0,0,0,0,0,0,0,65,116,116,101,109,112,116,32,116,111,32,97,115,115,105,103,110,32,116,111,32,97,32,114,101,97,100,45,111,110,108,121,32,118,97,114,105,97,98,108,101,0,0,0,0,0,0,0,9,32,32,37,115,45,97,120,105,115,58,32,34,37,115,34,10,0,0,0,0,0,0,0,101,114,114,111,114,32,105,110,32,101,100,103,101,51,100,95,105,110,116,101,114,115,101,99,116,0,0,0,0,0,0,0,92,108,105,110,101,119,100,32,37,100,10,0,0,0,0,0,102,105,108,108,101,100,99,36,117,114,118,101,115,0,0,0,9,116,105,99,32,102,111,114,109,97,116,32,105,115,58,10,0,0,0,0,0,0,0,0,39,58,39,32,111,114,32,107,101,121,119,111,114,100,32,39,116,111,39,32,101,120,112,101,99,116,101,100,0,0,0,0,92,37,99,116,101,120,116,123,37,115,125,10,0,0,0,0,104,105,115,116,36,111,103,114,97,109,115,0,0,0,0,0,9,37,115,32,97,114,101,32,112,108,111,116,116,101,100,32,119,105,116,104,32,0,0,0,92,116,101,120,116,114,101,102,32,104,58,82,32,118,58,67,32,0,0,0,0,0,0,0,98,111,120,101,115,0,0,0,32,119,105,116,104,32,98,111,114,100,101,114,32,0,0,0,51,120,0,0,0,0,0,0,92,116,101,120,116,114,101,102,32,104,58,76,32,118,58,67,32,0,0,0,0,0,0,0,120,121,101,36,114,114,111,114,98,97,114,115,0,0,0,0,32,119,105,116,104,32,110,111,32,98,111,114,100,101,114,10,0,0,0,0,0,0,0,0,92,109,111,118,101,32,40,37,100,32,37,100,41,0,0,0,120,101,36,114,114,111,114,98,97,114,115,0,0,0,0,0,9,70,105,108,108,32,115,116,121,108,101,32,105,115,32,101,109,112,116,121,0,0,0,0,32,32,32,32,32,32,32,32,35,100,97,116,97,112,111,105,110,116,115,32,61,32,37,100,10,0,0,0,0,0,0,0,92,102,99,105,114,32,102,58,48,46,57,32,114,58,49,54,0,0,0,0,0,0,0,0,101,36,114,114,111,114,98,97,114,115,0,0,0,0,0,0,9,70,105,108,108,32,115,116,121,108,101,32,117,115,101,115,32,37,115,32,112,97,116,116,101,114,110,115,32,115,116,97,114,116,105,110,103,32,97,116,32,37,100,0,0,0,0,0,92,102,99,105,114,32,102,58,48,46,57,32,114,58,49,50,0,0,0,0,0,0,0,0,121,101,36,114,114,111,114,98,97,114,115,0,0,0,0,0,116,114,97,110,115,112,97,114,101,110,116,0,0,0,0,0,92,102,99,105,114,32,102,58,48,46,57,32,114,58,57,0,120,121,101,114,114,111,114,108,36,105,110,101,115,0,0,0,98,36,101,122,105,101,114,0,32,32,67,111,114,114,101,108,97,116,105,111,110,58,32,32,114,32,61,32,37,46,52,103,10,0,0,0,0,0,0,0,9,70,105,108,108,32,115,116,121,108,101,32,117,115,101,115,32,37,115,32,115,111,108,105,100,32,99,111,108,111,117,114,32,119,105,116,104,32,100,101,110,115,105,116,121,32,37,46,51,102,0,0,0,0,0,0,73,78,0,0,0,0,0,0,117,108,111,110,103,0,0,0,92,108,99,105,114,32,114,58,49,54,0,0,0,0,0,0,120,101,114,114,111,114,108,36,105,110,101,115,0,0,0,0,109,105,36,114,114,111,114,0,100,101,102,97,117,108,116,32,108,105,110,101,116,121,112,101,115,10,0,0,0,0,0,0,98,111,120,101,115,10,0,0,103,101,116,95,100,97,116,97,58,32,107,101,121,32,116,105,116,108,101,32,110,111,116,32,102,111,117,110,100,32,105,110,32,114,101,113,117,101,115,116,101,100,32,99,111,108,117,109,110,10,0,0,0,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,105,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,32,105,110,32,112,111,108,97,114,32,109,111,100,101,0,0,36,0,0,0,0,0,0,0,92,108,99,105,114,32,114,58,49,50,0,0,0,0,0,0,101,114,114,111,114,108,36,105,110,101,115,0,0,0,0,0,75,80,95,68,101,108,101,116,101,0,0,0,0,0,0,0,117,115,101,114,45,100,101,102,105,110,101,100,32,108,105,110,101,32,115,116,121,108,101,115,32,114,97,116,104,101,114,32,116,104,97,110,32,100,101,102,97,117,108,116,32,108,105,110,101,32,116,121,112,101,115,10,0,0,0,0,0,0,0,0,61,0,0,0,0,0,0,0,92,108,99,105,114,32,114,58,57,0,0,0,0,0,0,0,121,101,114,114,111,114,108,36,105,110,101,115,0,0,0,0,9,80,108,111,116,32,108,105,110,101,115,32,105,110,99,114,101,109,101,110,116,32,111,118,101,114,32,0,0,0,0,0,92,104,116,101,120,116,123,36,92,115,116,97,114,36,125,0,100,36,111,116,115,0,0,0,32,116,101,120,116,99,111,108,111,114,32,108,116,32,37,100,0,0,0,0,0,0,0,0,92,104,116,101,120,116,123,36,92,116,114,105,97,110,103,108,101,36,125,0,0,0,0,0,108,112,0,0,0,0,0,0,32,116,105,116,108,101,32,111,102,102,115,101,116,32,0,0,51,32,109,117,108,0,0,0,92,104,116,101,120,116,123,36,92,116,105,109,101,115,36,125,0,0,0,0,0,0,0,0,108,105,110,101,115,112,36,111,105,110,116,115,0,0,0,0,9,72,105,115,116,111,103,114,97,109,32,115,116,121,108,101,32,105,115,32,99,111,108,117,109,110,115,116,97,99,107,101,100,32,0,0,0,0,0,0,92,114,109,111,118,101,40,48,32,52,41,92,104,116,101,120,116,123,36,92,66,111,120,36,125,0,0,0,0,0,0,0,102,111,114,116,36,114,97,110,0,0,0,0,0,0,0,0,78,111,32,100,97,116,97,32,116,111,32,102,105,116,32,0,9,72,105,115,116,111,103,114,97,109,32,115,116,121,108,101,32,105,115,32,114,111,119,115,116,97,99,107,101,100,32,0,92,104,116,101,120,116,123,36,43,36,125,0,0,0,0,0,105,36,109,112,117,108,115,101,115,0,0,0,0,0,0,0,9,72,105,115,116,111,103,114,97,109,32,115,116,121,108,101,32,105,115,32,101,114,114,111,114,98,97,114,115,32,119,105,116,104,32,103,97,112,32,37,100,32,108,119,32,37,103,32,0,0,0,0,0,0,0,0,92,114,109,111,118,101,40,48,32,52,41,92,104,116,101,120,116,123,36,92,68,105,97,109,111,110,100,36,125,0,0,0,98,111,120,112,108,111,116,0,115,116,114,99,111,108,0,0,9,72,105,115,116,111,103,114,97,109,32,115,116,121,108,101,32,105,115,32,99,108,117,115,116,101,114,101,100,32,119,105,116,104,32,103,97,112,32,37,100,32,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,60,110,117,109,95,99,111,108,115,62,44,60,110,117,109,95,114,111,119,115,62,39,0,0,0,0,0,0,0,66,97,100,32,97,98,98,114,101,118,105,97,116,101,100,32,109,111,110,116,104,32,110,97,109,101,0,0,0,0,0,0,92,104,116,101,120,116,123,36,92,99,100,111,116,36,125,0,114,101,99,116,36,97,110,103,108,101,0,0,0,0,0,0,97,36,99,115,112,108,105,110,101,115,0,0,0,0,0,0,32,32,76,105,110,101,97,114,32,77,111,100,101,108,58,32,121,32,61,32,37,46,52,103,32,120,32,43,32,37,46,52,103,10,0,0,0,0,0,0,97,114,114,111,119,115,116,121,108,101,32,110,111,116,32,102,111,117,110,100,0,0,0,0,9,37,115,45,97,120,105,115,32,116,105,99,115,32,97,114,101,32,37,115,44,32,9,109,97,106,111,114,32,116,105,99,115,99,97,108,101,32,105,115,32,37,103,32,97,110,100,32,109,105,110,111,114,32,116,105,99,115,99,97,108,101,32,105,115,32,37,103,10,0,0,0,108,100,0,0,0,0,0,0,92,116,101,120,116,114,101,102,32,104,58,67,32,118,58,67,32,0,0,0,0,0,0,0,101,108,108,36,105,112,115,101,0,0,0,0,0,0,0,0,32,40,100,101,102,97,117,108,116,32,108,101,110,103,116,104,32,97,110,100,32,97,110,103,108,101,115,41,10,0,0,0,120,121,101,114,114,111,114,98,97,114,115,10,0,0,0,0,101,120,112,101,99,116,105,110,103,32,40,101,120,112,114,101,115,115,105,111,110,41,0,0,39,41,39,32,101,120,112,101,99,116,101,100,0,0,0,0,92,109,111,118,101,32,40,37,100,32,37,100,41,10,0,0,99,105,114,99,36,108,101,0,75,80,95,80,97,103,101,85,112,0,0,0,0,0,0,0,108,105,110,101,99,36,111,108,111,114,0,0,0,0,0,0,32,108,101,110,103,116,104,32,37,115,37,103,44,32,97,110,103,108,101,32,37,103,32,100,101,103,0,0,0,0,0,0,92,109,111,118,101,32,40,37,100,32,37,100,41,92,37,99,118,101,99,32,40,37,100,32,37,100,41,0,0,0,0,0,104,105,115,116,36,111,103,114,97,109,0,0,0,0,0,0,9,32,32,97,114,114,111,119,32,104,101,97,100,115,58,32,37,115,44,32,0,0,0,0,115,116,97,114,116,105,110,103,32,114,97,110,103,101,32,118,97,108,117,101,32,111,114,32,39,58,39,32,111,114,32,39,116,111,39,32,101,120,112,101,99,116,101,100,0,0,0,0,10,10,102,111,110,116,95,105,100,101,110,116,105,102,105,101,114,58,61,34,71,78,85,80,76,79,84,34,59,10,102,111,110,116,95,115,105,122,101,32,55,50,112,116,35,59,10,116,104,35,61,48,46,52,112,116,35,59,32,100,101,102,105,110,101,95,119,104,111,108,101,95,112,105,120,101,108,115,40,116,104,41,59,10,10,112,97,116,104,32,97,114,114,111,119,104,101,97,100,59,10,97,114,114,111,119,104,101,97,100,32,61,32,40,45,55,112,116,44,45,50,112,116,41,123,100,105,114,51,48,125,46,46,40,45,54,112,116,44,48,112,116,41,46,46,123,100,105,114,49,53,48,125,40,45,55,112,116,44,50,112,116,41,32,38,10,32,32,40,45,55,112,116,44,50,112,116,41,45,45,40,48,112,116,44,48,112,116,41,45,45,40,45,55,112,116,44,45,50,112,116,41,32,38,32,99,121,99,108,101,59,10,0,0,0,0,105,110,99,114,36,101,109,101,110,116,0,0,0,0,0,0,32,110,111,104,101,97,100,0,10,100,101,102,32,101,110,100,99,104,97,114,32,61,10,32,32,37,32,78,101,120,116,32,108,105,110,101,32,115,104,111,117,108,100,32,112,114,111,98,97,98,108,121,32,98,101,32,114,101,109,111,118,101,100,32,105,102,32,67,77,32,98,97,115,101,32,105,115,32,117,115,101,100,10,32,32,108,58,61,48,59,32,114,58,61,119,59,10,32,32,37,73,110,99,108,117,100,101,32,116,104,101,32,110,101,120,116,32,116,119,111,32,108,105,110,101,115,32,105,102,32,121,111,117,32,119,97,110,116,32,116,111,10,32,32,37,114,111,116,97,116,101,32,116,104,101,32,112,105,99,116,117,114,101,32,57,48,32,100,101,103,46,40,80,111,114,116,114,97,105,116,32,116,111,32,76,97,110,100,115,99,97,112,101,41,10,32,32,37,99,117,114,114,101,110,116,112,105,99,116,117,114,101,58,61,99,117,114,114,101,110,116,112,105,99,116,117,114,101,32,114,111,116,97,116,101,100,32,57,48,32,115,104,105,102,116,101,100,32,40,104,44,48,41,59,10,32,32,37,116,109,112,58,61,99,104,97,114,104,116,59,32,99,104,97,114,104,116,58,61,99,104,97,114,119,100,59,32,99,104,97,114,119,100,58,61,116,109,112,59,10,32,32,115,99,97,110,116,111,107,101,110,115,32,101,120,116,114,97,95,101,110,100,99,104,97,114,59,10,32,32,105,102,32,112,114,111,111,102,105,110,103,62,48,58,32,109,97,107,101,98,111,120,40,112,114,111,111,102,114,117,108,101,41,59,32,102,105,10,32,32,99,104,97,114,100,120,58,61,119,59,10,32,32,115,104,105,112,105,116,59,10,32,32,105,102,32,100,105,115,112,108,97,121,105,110,103,62,48,58,32,109,97,107,101,98,111,120,40,115,99,114,101,101,110,114,117,108,101,41,59,32,115,104,111,119,105,116,59,32,102,105,10,32,32,101,110,100,103,114,111,117,112,32,10,101,110,100,100,101,102,59,10,108,101,116,32,101,110,100,99,104,97,114,95,32,61,32,101,110,100,99,104,97,114,59,10,108,101,116,32,103,101,110,101,114,97,116,101,32,61,32,105,110,112,117,116,59,10,108,101,116,32,114,111,109,97,110,32,61,32,114,111,109,97,110,59,10,0,102,115,0,0,0,0,0,0,32,111,110,101,32,104,101,97,100,32,0,0,0,0,0,0,124,99,111,115,40,55,50,48,120,41,124,0,0,0,0,0,9,108,111,97,100,112,97,116,104,32,105,115,32,0,0,0,10,99,109,99,104,97,114,32,34,80,101,114,105,111,100,34,59,10,32,32,110,117,109,101,114,105,99,32,100,111,116,95,100,105,97,109,35,59,32,100,111,116,95,100,105,97,109,35,58,61,105,102,32,109,111,110,111,115,112,97,99,101,58,32,53,47,52,32,102,105,92,32,100,111,116,95,115,105,122,101,35,59,10,32,32,100,101,102,105,110,101,95,119,104,111,108,101,95,98,108,97,99,107,101,114,95,112,105,120,101,108,115,40,100,111,116,95,100,105,97,109,41,59,10,32,32,98,101,103,105,110,99,104,97,114,40,34,46,34,44,53,117,35,44,100,111,116,95,100,105,97,109,35,44,48,41,59,10,32,32,97,100,106,117,115,116,95,102,105,116,40,48,44,48,41,59,32,112,105,99,107,117,112,32,102,105,110,101,46,110,105,98,59,10,32,32,112,111,115,49,40,100,111,116,95,100,105,97,109,44,48,41,59,32,112,111,115,50,40,100,111,116,95,100,105,97,109,44,57,48,41,59,10,32,32,108,102,116,32,120,49,108,61,104,114,111,117,110,100,40,46,53,119,45,46,53,100,111,116,95,100,105,97,109,41,59,32,98,111,116,32,121,50,108,61,48,59,32,122,49,61,122,50,59,32,100,111,116,40,49,44,50,41,59,9,37,32,100,111,116,10,32,32,112,101,110,108,97,98,101,108,115,40,49,44,50,41,59,10,101,110,100,99,104,97,114,59,10,0,0,0,0,0,0,0,0,32,98,111,116,104,32,104,101,97,100,115,32,0,0,0,0,105,110,112,117,116,32,99,109,114,49,48,46,109,102,10,105,102,32,108,105,103,115,62,49,58,32,102,111,110,116,95,99,111,100,105,110,103,95,115,99,104,101,109,101,58,61,34,84,101,88,32,116,101,120,116,34,59,10,32,32,115,112,97,110,105,115,104,95,115,104,114,105,101,107,61,111,99,116,34,48,55,52,34,59,32,115,112,97,110,105,115,104,95,113,117,101,114,121,61,111,99,116,34,48,55,54,34,59,10,101,108,115,101,58,32,102,111,110,116,95,99,111,100,105,110,103,95,115,99,104,101,109,101,58,61,10,32,32,105,102,32,108,105,103,115,61,48,58,32,34,84,101,88,32,116,121,112,101,119,114,105,116,101,114,32,116,101,120,116,34,10,32,32,101,108,115,101,58,32,34,84,101,88,32,116,101,120,116,32,119,105,116,104,111,117,116,32,102,45,108,105,103,97,116,117,114,101,115,34,32,102,105,59,10,32,32,115,112,97,110,105,115,104,95,115,104,114,105,101,107,61,111,99,116,34,48,49,54,34,59,32,115,112,97,110,105,115,104,95,113,117,101,114,121,61,111,99,116,34,48,49,55,34,59,32,102,105,10,102,111,110,116,95,115,101,116,117,112,59,10,105,110,112,117,116,32,114,111,109,97,110,117,46,109,102,32,37,82,111,109,97,110,32,117,112,112,101,114,99,97,115,101,46,10,105,110,112,117,116,32,114,111,109,97,110,108,46,109,102,32,37,82,111,109,97,110,32,108,111,119,101,114,99,97,115,101,46,10,105,110,112,117,116,32,103,114,101,101,107,117,46,109,102,32,37,71,114,101,101,107,32,117,112,112,101,114,99,97,115,101,46,10,105,110,112,117,116,32,114,111,109,97,110,100,46,109,102,32,37,78,117,109,101,114,97,108,115,46,10,105,110,112,117,116,32,114,111,109,97,110,112,46,109,102,32,37,65,109,112,101,114,115,97,110,100,44,32,113,117,101,115,116,105,111,110,32,109,97,114,107,115,44,32,99,117,114,114,101,110,99,121,32,115,105,103,110,46,10,105,110,112,117,116,32,114,111,109,115,112,108,46,109,102,32,37,76,111,119,101,114,99,97,115,101,32,115,112,101,99,105,97,108,115,32,40,100,111,116,108,101,115,115,32,92,105,44,32,108,105,103,97,116,117,114,101,32,92,97,101,44,32,101,116,99,46,41,10,105,110,112,117,116,32,114,111,109,115,112,117,46,109,102,32,37,85,112,112,101,114,99,97,115,101,32,115,112,101,99,105,97,108,115,32,40,92,65,69,44,32,92,79,69,44,32,92,79,41,10,105,110,112,117,116,32,112,117,110,99,116,46,109,102,32,37,80,117,110,99,116,117,97,116,105,111,110,32,115,121,109,98,111,108,115,46,10,10,109,105,110,117,115,61,65,83,67,73,73,34,45,34,59,32,99,109,99,104,97,114,32,34,77,105,110,117,115,32,115,105,103,110,34,59,10,32,98,101,103,105,110,97,114,105,116,104,99,104,97,114,40,109,105,110,117,115,41,59,32,10,32,32,112,105,99,107,117,112,32,114,117,108,101,46,110,105,98,59,10,32,32,108,102,116,32,120,49,61,104,114,111,117,110,100,32,49,46,53,117,45,101,112,115,59,10,32,32,120,50,61,119,45,120,49,59,32,121,49,61,121,50,61,109,97,116,104,95,97,120,105,115,59,10,32,32,100,114,97,119,32,122,49,45,45,122,50,59,9,32,37,32,98,97,114,10,32,32,108,97,98,101,108,115,40,49,44,50,41,59,32,10,101,110,100,99,104,97,114,59,10,0,0,0,0,0,0,0,0,108,36,105,110,101,115,0,0,115,116,114,105,110,103,0,0,37,103,93,10,0,0,0,0,9,32,37,115,32,37,115,0,98,105,110,100,0,0,0,0,10,100,101,102,32,101,110,100,99,104,97,114,32,61,10,32,32,114,91,99,104,97,114,99,111,100,101,93,58,61,99,117,114,114,101,110,116,112,105,99,116,117,114,101,59,10,32,32,119,100,91,99,104,97,114,99,111,100,101,93,58,61,119,59,104,116,91,99,104,97,114,99,111,100,101,93,58,61,104,59,100,112,91,99,104,97,114,99,111,100,101,93,58,61,100,59,10,32,32,109,101,115,115,97,103,101,32,34,80,105,99,116,117,114,101,32,111,102,32,99,104,97,114,99,111,100,101,32,110,111,46,34,32,38,32,100,101,99,105,109,97,108,32,99,104,97,114,99,111,100,101,59,10,32,32,101,110,100,103,114,111,117,112,59,10,101,110,100,100,101,102,59,10,108,101,116,32,101,110,100,99,104,97,114,95,32,61,32,101,110,100,99,104,97,114,59,10,108,101,116,32,103,101,110,101,114,97,116,101,32,61,32,114,101,108,97,120,59,10,108,101,116,32,114,111,109,97,110,32,61,32,114,101,108,97,120,59,10,0,0,105,108,108,101,103,97,108,32,109,111,110,116,104,0,0,0,102,36,117,110,99,116,105,111,110,0,0,0,0,0,0,0,9,97,114,114,111,119,115,116,121,108,101,32,37,100,44,32,0,0,0,0,0,0,0,0,10,100,101,102,32,112,117,116,95,116,101,120,116,40,101,120,112,114,32,116,115,44,120,115,116,97,114,116,44,121,115,116,97,114,116,44,114,111,116,44,106,117,115,116,105,102,105,99,97,116,105,111,110,41,32,61,10,32,32,98,101,103,105,110,103,114,111,117,112,10,32,32,32,32,116,101,120,116,95,119,105,100,116,104,58,61,48,59,116,101,120,116,95,104,101,105,103,104,116,58,61,48,59,116,101,120,116,95,100,101,112,116,104,58,61,48,59,10,32,32,32,32,102,111,114,32,105,110,100,58,61,48,32,115,116,101,112,32,49,32,117,110,116,105,108,32,108,101,110,103,116,104,40,116,115,41,45,49,58,10,32,32,32,32,32,32,100,101,99,95,110,117,109,58,61,65,83,67,73,73,32,115,117,98,115,116,114,105,110,103,32,40,105,110,100,44,105,110,100,43,49,41,32,111,102,32,116,115,59,10,32,32,32,32,32,32,105,102,32,117,110,107,110,111,119,110,32,114,91,100,101,99,95,110,117,109,93,58,32,100,101,99,95,110,117,109,58,61,51,50,59,32,102,105,10,32,32,32,32,32,32,105,102,32,100,101,99,95,110,117,109,61,51,50,58,32,10,32,32,32,32,32,32,32,32,116,101,120,116,95,119,105,100,116,104,58,61,116,101,120,116,95,119,105,100,116,104,43,119,100,91,54,53,93,59,10,32,32,32,32,32,32,32,32,116,101,120,116,95,104,101,105,103,104,116,58,61,109,97,120,40,116,101,120,116,95,104,101,105,103,104,116,44,104,116,91,54,53,93,41,59,10,32,32,32,32,32,32,32,32,116,101,120,116,95,100,101,112,116,104,58,61,109,97,120,40,116,101,120,116,95,100,101,112,116,104,44,100,112,91,54,53,93,41,59,10,32,32,32,32,32,32,101,108,115,101,105,102,32,100,101,99,95,110,117,109,62,61,48,58,32,10,32,32,32,32,32,32,32,32,116,101,120,116,95,119,105,100,116,104,58,61,116,101,120,116,95,119,105,100,116,104,43,119,100,91,100,101,99,95,110,117,109,93,59,10,32,32,32,32,32,32,32,32,116,101,120,116,95,104,101,105,103,104,116,58,61,109,97,120,40,116,101,120,116,95,104,101,105,103,104,116,44,104,116,91,100,101,99,95,110,117,109,93,41,59,10,32,32,32,32,32,32,32,32,116,101,120,116,95,100,101,112,116,104,58,61,109,97,120,40,116,101,120,116,95,100,101,112,116,104,44,100,112,91,100,101,99,95,110,117,109,93,41,59,10,32,32,32,32,32,32,102,105,10,32,32,32,32,101,110,100,102,111,114,10,32,32,32,32,105,102,32,114,111,116,61,57,48,58,10,32,32,32,32,32,32,105,102,32,106,117,115,116,105,102,105,99,97,116,105,111,110,61,49,58,32,121,110,101,120,116,58,61,121,115,116,97,114,116,59,10,32,32,32,32,32,32,101,108,115,101,105,102,32,106,117,115,116,105,102,105,99,97,116,105,111,110,61,50,58,32,121,110,101,120,116,58,61,114,111,117,110,100,40,121,115,116,97,114,116,45,116,101,120,116,95,119,105,100,116,104,47,50,41,59,10,32,32,32,32,32,32,101,108,115,101,58,32,121,110,101,120,116,58,61,114,111,117,110,100,40,121,115,116,97,114,116,45,116,101,120,116,95,119,105,100,116,104,41,59,10,32,32,32,32,32,32,102,105,10,32,32,32,32,32,32,120,110,101,120,116,58,61,120,115,116,97,114,116,43,40,116,101,120,116,95,104,101,105,103,104,116,45,116,101,120,116,95,100,101,112,116,104,41,47,50,59,10,32,32,32,32,101,108,115,101,58,10,32,32,32,32,32,32,105,102,32,106,117,115,116,105,102,105,99,97,116,105,111,110,61,49,58,32,120,110,101,120,116,58,61,120,115,116,97,114,116,59,10,32,32,32,32,32,32,101,108,115,101,105,102,32,106,117,115,116,105,102,105,99,97,116,105,111,110,61,50,58,32,120,110,101,120,116,58,61,114,111,117,110,100,40,120,115,116,97,114,116,45,116,101,120,116,95,119,105,100,116,104,47,50,41,59,10,32,32,32,32,32,32,101,108,115,101,58,32,120,110,101,120,116,58,61,114,111,117,110,100,40,120,115,116,97,114,116,45,116,101,120,116,95,119,105,100,116,104,41,59,10,32,32,32,32,32,32,102,105,10,32,32,32,32,32,32,121,110,101,120,116,58,61,121,115,116,97,114,116,45,40,116,101,120,116,95,104,101,105,103,104,116,45,116,101,120,116,95,100,101,112,116,104,41,47,50,59,10,32,32,32,32,102,105,10,32,32,32,32,102,111,114,32,105,110,100,58,61,48,32,115,116,101,112,32,49,32,117,110,116,105,108,32,108,101,110,103,116,104,40,116,115,41,45,49,58,10,32,32,32,32,32,32,100,101,99,95,110,117,109,58,61,65,83,67,73,73,32,115,117,98,115,116,114,105,110,103,32,40,105,110,100,44,105,110,100,43,49,41,32,111,102,32,116,115,59,10,32,32,32,32,32,32,105,102,32,117,110,107,110,111,119,110,32,114,91,100,101,99,95,110,117,109,93,58,32,100,101,99,95,110,117,109,58,61,51,50,59,32,102,105,10,32,32,32,32,32,32,105,102,32,100,101,99,95,110,117,109,61,51,50,58,32,10,32,32,32,32,32,32,32,32,120,110,101,120,116,58,61,120,110,101,120,116,43,119,100,91,54,53,93,42,99,111,115,100,32,114,111,116,59,10,32,32,32,32,32,32,32,32,121,110,101,120,116,58,61,121,110,101,120,116,43,119,100,91,54,53,93,42,115,105,110,100,32,114,111,116,59,10,32,32,32,32,32,32,101,108,115,101,105,102,32,100,101,99,95,110,117,109,62,61,48,58,32,10,32,32,32,32,32,32,32,32,99,117,114,114,101,110,116,112,105,99,116,117,114,101,58,61,99,117,114,114,101,110,116,112,105,99,116,117,114,101,43,114,91,100,101,99,95,110,117,109,93,32,115,104,105,102,116,101,100,40,120,110,101,120,116,44,121,110,101,120,116,41,10,32,32,32,32,32,32,32,32,32,32,114,111,116,97,116,101,100,97,114,111,117,110,100,32,40,40,120,110,101,120,116,44,121,110,101,120,116,41,44,114,111,116,41,59,32,10,32,32,32,32,32,32,32,32,120,110,101,120,116,58,61,120,110,101,120,116,43,119,100,91,100,101,99,95,110,117,109,93,42,99,111,115,100,32,114,111,116,59,10,32,32,32,32,32,32,32,32,121,110,101,120,116,58,61,121,110,101,120,116,43,119,100,91,100,101,99,95,110,117,109,93,42,115,105,110,100,32,114,111,116,59,10,32,32,32,32,32,32,102,105,10,32,32,32,32,101,110,100,102,111,114,10,32,32,101,110,100,103,114,111,117,112,32,10,101,110,100,100,101,102,59,10,0,0,0,0,100,36,97,116,97,0,0,0,115,116,114,105,110,103,99,111,108,117,109,110,0,0,0,0,97,112,112,101,97,114,32,105,110,32,116,104,101,32,111,114,100,101,114,32,116,104,101,121,32,119,101,114,101,32,102,111,117,110,100,0,0,0,0,0,116,111,111,32,109,97,110,121,32,108,97,121,111,117,116,32,99,111,109,109,97,110,100,115,0,0,0,0,0,0,0,0,10,37,73,110,99,108,117,100,101,32,110,101,120,116,32,101,105,103,104,116,32,108,105,110,101,115,32,105,102,32,121,111,117,32,104,97,118,101,32,112,114,111,98,108,101,109,115,32,119,105,116,104,32,116,104,101,32,109,111,100,101,32,111,110,32,121,111,117,114,32,115,121,115,116,101,109,46,46,10,37,112,114,111,111,102,105,110,103,58,61,48,59,10,37,102,111,110,116,109,97,107,105,110,103,58,61,49,59,10,37,116,114,97,99,105,110,103,116,105,116,108,101,115,58,61,48,59,10,37,112,105,120,101,108,115,95,112,101,114,95,105,110,99,104,58,61,51,48,48,59,10,37,98,108,97,99,107,101,114,58,61,48,59,10,37,102,105,108,108,105,110,58,61,46,50,59,10,37,111,95,99,111,114,114,101,99,116,105,111,110,58,61,46,54,59,10,37,102,105,120,95,117,110,105,116,115,59,10,0,0,0,0,0,0,0,0,103,114,97,121,49,48,48,0,120,50,121,49,0,0,0,0,32,32,76,105,110,101,97,114,32,77,111,100,101,108,58,32,121,32,61,32,37,46,52,103,32,120,32,45,32,37,46,52,103,10,0,0,0,0,0,0,98,101,32,115,111,114,116,101,100,32,97,108,112,104,97,98,101,116,105,99,97,108,108,121,0,0,0,0,0,0,0,0,46,48,0,0,0,0,0,0,108,111,110,103,0,0,0,0,105,102,32,117,110,107,110,111,119,110,32,99,109,98,97,115,101,58,32,105,110,112,117,116,32,99,109,98,97,115,101,32,102,105,10,10,116,114,97,99,105,110,103,115,116,97,116,115,58,61,49,59,10,112,105,99,116,117,114,101,32,114,91,93,59,10,10,100,101,102,32,111,112,101,110,105,116,32,61,32,111,112,101,110,119,105,110,100,111,119,32,99,117,114,114,101,110,116,119,105,110,100,111,119,10,32,32,102,114,111,109,32,40,48,44,48,41,32,116,111,32,40,52,48,48,44,56,48,48,41,32,97,116,32,40,45,53,48,44,53,48,48,41,32,101,110,100,100,101,102,59,10,10,109,111,100,101,95,115,101,116,117,112,59,10,0,0,0,103,114,97,121,57,48,0,0,97,120,36,105,115,0,0,0,9,102,97,99,116,111,114,32,108,97,98,101,108,115,32,119,105,108,108,32,37,115,10,0,120,101,114,114,111,114,98,97,114,115,10,0,0,0,0,0,66,97,100,32,100,97,116,97,32,111,110,32,108,105,110,101,32,37,100,32,111,102,32,102,105,108,101,32,37,115,0,0,89,111,117,32,104,97,118,101,32,116,111,32,99,111,109,112,105,108,101,32,103,110,117,112,108,111,116,32,119,105,116,104,32,98,117,105,108,116,105,110,32,114,101,97,100,108,105,110,101,32,111,114,32,71,78,85,32,114,101,97,100,108,105,110,101,32,111,114,32,66,83,68,32,101,100,105,116,108,105,110,101,32,116,111,32,101,110,97,98,108,101,32,104,105,115,116,111,114,121,32,115,117,112,112,111,114,116,46,0,0,0,0,101,110,100,99,104,97,114,59,10,0,0,0,0,0,0,0,103,114,97,121,56,48,0,0,75,80,95,85,112,0,0,0,108,99,0,0,0,0,0,0,69,82,82,78,79,0,0,0,97,114,101,32,111,102,102,0,97,58,61,119,47,37,100,59,98,58,61,104,47,37,100,59,10,0,0,0,0,0,0,0,103,114,97,121,55,48,0,0,97,114,101,32,97,117,116,111,109,97,116,105,99,0,0,0,10,10,98,101,103,105,110,99,104,97,114,40,37,100,44,37,103,105,110,35,44,37,103,105,110,35,44,48,41,59,10,0,103,114,97,121,54,48,0,0,105,115,111,95,56,56,53,57,95,49,53,0,0,0,0,0,119,105,108,108,32,98,101,32,112,117,116,32,111,110,32,116,104,101,32,120,50,32,97,120,105,115,0,0,0,0,0,0,32,120,108,111,119,32,120,104,105,103,104,0,0,0,0,0,100,114,97,119,32,40,37,100,97,44,37,100,98,41,45,45,40,37,100,97,44,37,100,98,41,59,10,0,0,0,0,0,103,114,97,121,53,48,0,0,119,105,108,108,32,98,101,32,112,117,116,32,111,110,32,116,104,101,32,120,32,97,120,105,115,0,0,0,0,0,0,0,55,50,48,32,109,117,108,32,99,111,115,32,97,98,115,0,100,114,97,119,100,111,116,32,40,37,100,97,44,37,100,98,41,59,10,0,0,0,0,0,103,114,97,121,52,48,0,0,112,117,115,104,100,50,0,0,9,102,97,99,116,111,114,32,108,97,98,101,108,115,32,37,115,10,0,0,0,0,0,0,100,114,111,112,108,97,115,116,95,100,121,110,97,114,114,97,121,58,32,100,121,110,97,114,114,97,121,32,119,97,115,110,39,116,32,105,110,105,116,105,97,108,105,122,101,100,33,0,112,105,99,107,117,112,32,112,101,110,99,105,114,99,108,101,32,115,99,97,108,101,100,32,37,103,116,104,59,10,0,0,103,114,97,121,51,48,0,0,9,115,101,112,97,114,97,116,105,111,110,32,98,101,116,119,101,101,110,32,98,111,120,112,108,111,116,115,32,105,115,32,37,103,10,0,0,0,0,0,112,117,116,95,116,101,120,116,40,34,37,115,34,44,37,100,97,44,37,100,98,44,37,100,44,37,100,41,59,10,0,0,103,114,97,121,50,48,0,0,9,111,117,116,108,105,101,114,115,32,119,105,108,108,32,110,111,116,32,98,101,32,100,114,97,119,110,10,0,0,0,0,102,105,108,108,32,97,114,114,111,119,104,101,97,100,32,114,111,116,97,116,101,100,32,97,110,103,108,101,40,37,100,44,37,100,41,32,115,104,105,102,116,101,100,32,40,37,100,97,44,37,100,98,41,59,10,0,103,114,97,121,49,48,0,0,9,111,117,116,108,105,101,114,115,32,119,105,108,108,32,98,101,32,100,114,97,119,110,32,117,115,105,110,103,32,112,111,105,110,116,32,116,121,112,101,32,37,100,10,0,0,0,0,108,97,121,36,111,117,116,0,102,111,36,110,116,0,0,0,103,114,97,121,48,0,0,0,120,49,121,50,0,0,0,0,32,32,77,101,100,105,97,110,58,32,32,32,37,115,32,37,115,32,37,115,10,0,0,0,99,100,0,0,0,0,0,0,32,32,98,111,120,32,98,121,32,37,53,46,50,102,32,111,102,32,116,104,101,32,105,110,116,101,114,113,117,97,114,116,105,108,101,32,100,105,115,116,97,110,99,101,10,0,0,0,37,46,49,53,103,0,0,0,109,97,36,103,110,105,102,105,99,97,116,105,111,110,0,0,115,108,97,116,101,103,114,97,121,0,0,0,0,0,0,0,116,36,105,99,115,0,0,0,67,97,110,39,116,32,114,101,97,100,32,100,97,116,97,32,102,105,108,101,0,0,0,0,32,32,109,101,100,105,97,110,32,116,111,32,105,110,99,108,117,100,101,32,37,53,46,50,102,32,111,102,32,116,104,101,32,112,111,105,110,116,115,10,0,0,0,0,0,0,0,0,121,101,114,114,111,114,98,97,114,115,10,0,0,0,0,0,110,111,112,114,111,36,108,111,103,117,101,115,0,0,0,0,100,97,114,107,45,103,114,97,121,0,0,0,0,0,0,0,75,80,95,72,111,109,101,0,98,103,110,100,0,0,0,0,110,111,110,45,115,116,114,105,110,103,32,97,114,103,117,109,101,110,116,32,116,111,32,115,121,115,116,101,109,40,41,0,9,98,111,120,112,108,111,116,32,114,97,110,103,101,32,101,120,116,101,110,100,115,32,102,114,111,109,32,116,104,101,32,0,0,0,0,0,0,0,0,112,114,111,36,108,111,103,117,101,115,0,0,0,0,0,0,108,105,103,104,116,45,103,114,101,121,0,0,0,0,0,0,98,111,120,32,97,110,100,32,119,104,105,115,107,101,114,0,85,112,112,101,114,32,98,111,117,110,100,32,111,102,32,99,111,110,115,116,114,97,105,110,116,32,60,32,108,111,119,101,114,32,98,111,117,110,100,58,32,32,84,117,114,110,105,110,103,32,111,102,32,99,111,110,115,116,114,97,105,110,116,115,46,0,0,0,0,0,0,0,110,111,112,115,36,110,102,115,115,0,0,0,0,0,0,0,108,105,103,104,116,45,103,114,97,121,0,0,0,0,0,0,102,105,110,97,110,99,101,32,98,97,114,0,0,0,0,0,112,115,110,102,115,115,45,118,36,101,114,115,105,111,110,55,0,0,0,0,0,0,0,0,103,114,101,101,110,121,101,108,108,111,119,0,0,0,0,0,9,98,111,120,112,108,111,116,32,114,101,112,114,101,115,101,110,116,97,116,105,111,110,32,105,115,32,37,115,10,0,0,124,115,105,110,40,55,50,48,120,41,124,0,0,0,0,0,112,115,36,110,102,115,115,0,99,104,97,114,116,114,101,117,115,101,0,0,0,0,0,0,44,32,102,105,108,108,115,116,121,108,101,0,0,0,0,0,109,117,108,116,105,112,108,111,116,32,109,111,100,101,32,105,115,32,37,115,10,0,0,0,97,109,36,115,116,101,120,0,97,110,116,105,113,117,101,119,104,105,116,101,0,0,0,0,37,103,58,0,0,0,0,0,44,32,108,119,32,37,46,49,102,32,0,0,0,0,0,0,97,52,36,112,97,112,101,114,0,0,0,0,0,0,0,0,115,101,97,103,114,101,101,110,0,0,0,0,0,0,0,0,108,116,32,37,100,0,0,0,108,97,36,116,101,120,0,0,115,108,97,116,101,103,114,101,121,0,0,0,0,0,0,0,98,97,99,107,103,114,111,117,110,100,0,0,0,0,0,0,110,111,101,110,104,36,97,110,99,101,100,0,0,0,0,0,116,36,101,120,0,0,0,0,104,111,110,101,121,100,101,119,0,0,0,0,0,0,0,0,120,50,121,50,0,0,0,0,32,32,81,117,97,114,116,105,108,101,58,32,37,115,32,37,115,32,37,115,10,0,0,0,98,101,104,105,110,100,0,0,37,48,51,111,0,0,0,0,117,105,110,116,0,0,0,0,110,36,111,116,101,120,0,0,99,111,109,109,97,110,100,32,115,116,114,105,110,103,0,0,98,105,115,113,117,101,0,0,9,82,101,99,116,97,110,103,108,101,32,115,116,121,108,101,32,105,115,32,37,115,44,32,102,105,108,108,32,99,111,108,111,114,32,0,0,0,0,0,120,121,101,114,114,111,114,108,105,110,101,115,10,0,0,0,78,101,101,100,32,50,32,111,114,32,51,32,99,111,108,117,109,110,115,32,102,111,114,32,112,111,108,97,114,32,100,97,116,97,0,0,0,0,0,0,102,105,108,108,36,115,116,121,108,101,0,0,0,0,0,0,69,120,112,101,99,116,101,100,32,99,111,109,109,97,110,100,32,115,116,114,105,110,103,0,97,118,115,0,0,0,0,0,115,36,111,108,105,100,0,0,108,101,109,111,110,99,104,105,102,102,111,110,0,0,0,0,75,80,95,82,105,103,104,116,0,0,0,0,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,105,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,32,116,121,112,101,0,0,0,9,67,105,114,99,108,101,32,115,116,121,108,101,32,104,97,115,32,100,101,102,97,117,108,116,32,114,97,100,105,117,115,32,0,0,0,0,0,0,0,99,36,111,108,111,117,114,0,107,104,97,107,105,49,0,0,44,32,98,111,116,104,32,100,105,97,109,101,116,101,114,115,32,97,114,101,32,105,110,32,116,104,101,32,115,97,109,101,32,117,110,105,116,115,32,97,115,32,116,104,101,32,121,32,97,120,105,115,10,0,0,0,110,111,32,117,112,112,101,114,32,98,111,117,110,100,32,99,111,110,115,116,114,97,105,110,116,32,97,108,108,111,119,101,100,32,105,102,32,110,111,116,32,97,117,116,111,115,99,97,108,105,110,103,0,0,0,0,99,111,110,116,111,117,114,32,98,95,115,112,108,105,110,101,0,0,0,0,0,0,0,0,99,36,111,108,111,114,0,0,112,105,110,107,0,0,0,0,115,101,116,32,116,101,114,109,105,110,97,108,32,117,110,107,110,111,119,110,10,0,0,0,44,32,98,111,116,104,32,100,105,97,109,101,116,101,114,115,32,97,114,101,32,105,110,32,116,104,101,32,115,97,109,101,32,117,110,105,116,115,32,97,115,32,116,104,101,32,120,32,97,120,105,115,10,0,0,0,60,110,111,62,0,0,0,0,109,111,36,110,111,99,104,114,111,109,101,0,0,0,0,0,108,105,103,104,116,45,115,97,108,109,111,110,0,0,0,0,44,32,100,105,97,109,101,116,101,114,115,32,97,114,101,32,105,110,32,100,105,102,102,101,114,101,110,116,32,117,110,105,116,115,32,40,109,97,106,111,114,58,32,120,32,97,120,105,115,44,32,109,105,110,111,114,58,32,121,32,97,120,105,115,41,10,0,0,0,0,0,0,55,50,48,32,109,117,108,32,115,105,110,32,97,98,115,0,112,115,110,115,102,115,115,0,115,97,110,100,121,98,114,111,119,110,0,0,0,0,0,0,117,0,0,0,0,0,0,0,44,32,100,101,102,97,117,108,116,32,97,110,103,108,101,32,105,115,32,37,46,49,102,32,100,101,103,114,101,101,115,0,45,45,104,101,108,112,0,0,112,115,110,115,102,115,115,40,118,55,41,0,0,0,0,0,116,97,110,49,0,0,0,0,42,58,0,0,0,0,0,0,9,69,108,108,105,112,115,101,32,115,116,121,108,101,32,104,97,115,32,100,101,102,97,117,108,116,32,115,105,122,101,32,0,0,0,0,0,0,0,0,97,99,116,105,111,110,32,116,97,98,108,101,0,0,0,0,37,115,32,37,115,32,37,115,116,101,120,37,115,37,115,32,109,97,103,32,37,46,51,102,32,37,115,32,37,115,112,114,111,108,111,103,117,101,115,40,37,100,41,0,0,0,0,0,115,105,101,110,110,97,49,0,70,117,110,99,116,105,111,110,115,0,0,0,0,0,0,0,32,97,109,115,116,101,120,0,121,101,108,108,111,119,52,0,68,97,116,97,0,0,0,0,106,116,101,114,110,0,0,0,101,120,112,101,99,116,105,110,103,32,39,114,97,100,105,97,110,115,39,32,111,114,32,39,100,101,103,114,101,101,115,39,0,0,0,0,0,0,0,0,101,110,104,36,97,110,99,101,100,0,0,0,0,0,0,0,32,97,52,112,97,112,101,114,0,0,0,0,0,0,0,0,115,108,97,116,101,98,108,117,101,49,0,0,0,0,0,0,120,49,121,49,0,0,0,0,9,37,115,32,105,115,32,117,110,100,101,102,105,110,101,100,10,0,0,0,0,0,0,0,32,32,77,97,120,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,93,32,32,32,37,115,32,91,37,42,108,100,93,10,0,0,0,0,0,0,37,115,58,37,100,32,112,114,111,116,111,99,111,108,32,101,114,114,111,114,10,0,0,0,100,36,101,103,114,101,101,115,0,0,0,0,0,0,0,0,109,117,108,116,105,112,108,111,116,62,32,0,0,0,0,0,99,111,110,118,95,116,101,120,116,32,98,117,102,102,101,114,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,108,97,0,0,0,0,0,0,109,101,100,105,117,109,112,117,114,112,108,101,51,0,0,0,9,37,115,10,0,0,0,0,115,116,121,108,101,32,108,105,110,101,0,0,0,0,0,0,114,36,97,100,105,97,110,115,0,0,0,0,0,0,0,0,120,101,114,114,111,114,108,105,110,101,115,10,0,0,0,0,78,101,101,100,32,49,32,111,114,32,51,32,99,111,108,117,109,110,115,32,102,111,114,32,99,97,114,116,101,115,105,97,110,32,100,97,116,97,0,0,67,97,110,39,116,32,99,104,97,110,103,101,32,116,111,32,116,104,105,115,32,100,105,114,101,99,116,111,114,121,0,0,126,0,0,0,0,0,0,0,83,105,110,103,117,108,97,114,32,109,97,116,114,105,120,32,105,110,32,71,105,118,101,110,115,40,41,0,0,0,0,0,67,97,110,39,116,32,99,97,108,99,117,108,97,116,101,32,97,112,112,114,111,120,105,109,97,116,105,111,110,32,115,112,108,105,110,101,115,44,32,97,108,108,32,119,101,105,103,104,116,115,32,104,97,118,101,32,116,111,32,98,101,32,62,32,48,0,0,0,0,0,0,0,109,111,110,111,99,104,114,111,109,101,0,0,0,0,0,0,99,98,116,105,99,115,0,0,111,114,99,104,105,100,52,0,75,80,95,66,101,103,105,110,0,0,0,0,0,0,0,0,10,9,85,115,101,114,45,68,101,102,105,110,101,100,32,70,117,110,99,116,105,111,110,115,58,10,0,0,0,0,0,0,114,103,98,36,99,111,108,111,114,0,0,0,0,0,0,0])
.concat([73,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,116,114,105,110,103,32,110,111,116,32,97,108,108,111,99,97,116,101,100,0,0,0,0,100,117,112,108,105,99,97,116,101,32,111,114,32,99,111,110,116,114,97,100,105,99,116,111,114,121,32,97,114,103,117,109,101,110,116,115,0,0,0,0,99,111,108,111,114,0,0,0,115,105,101,110,110,97,52,0,100,101,102,97,117,108,116,32,108,97,121,101,114,0,0,0,102,117,110,99,116,105,111,110,32,37,115,32,114,101,113,117,105,114,101,115,32,37,100,32,118,97,114,105,97,98,108,101,37,99,0,0,0,0,0,0,119,114,111,110,103,32,97,114,103,117,109,101,110,116,32,105,110,32,115,101,116,32,97,114,114,111,119,0,0,0,0,0,109,97,108,102,111,114,109,101,100,32,114,97,110,103,101,32,119,105,116,104,32,99,111,110,115,116,114,97,105,110,116,32,40,117,115,101,32,39,60,39,32,111,110,108,121,41,0,0,37,115,32,37,115,32,37,115,116,101,120,37,115,37,115,32,109,97,103,32,37,46,51,102,32,102,111,110,116,32,34,37,115,44,37,46,50,102,34,32,37,115,112,114,111,108,111,103,117,101,115,40,37,100,41,0,98,114,111,119,110,52,0,0,9,71,114,105,100,32,100,114,97,119,110,32,97,116,32,37,115,10,0,0,0,0,0,0,101,110,100,32,99,111,111,114,100,105,110,97,116,101,115,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,102,111,110,116,32,110,97,109,101,0,0,0,0,0,111,114,97,110,103,101,114,101,100,52,0,0,0,0,0,0,100,101,103,114,101,101,115,0,115,116,97,114,116,32,99,111,111,114,100,105,110,97,116,101,115,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,124,99,111,115,40,51,54,48,120,41,124,0,0,0,0,0,112,99,114,114,56,114,0,0,100,97,114,107,45,111,108,105,118,101,103,114,101,101,110,0,114,97,100,105,97,110,115,0,97,114,114,111,119,0,0,0,99,109,114,49,48,0,0,0,100,97,114,107,45,112,108,117,109,0,0,0,0,0,0,0,9,71,114,105,100,32,114,97,100,105,105,32,100,114,97,119,110,32,101,118,101,114,121,32,37,102,32,37,115,10,0,0,32,32,32,32,32,32,32,32,32,83,107,105,112,112,101,100,32,37,100,32,112,111,105,110,116,115,32,111,117,116,115,105,100,101,32,114,97,110,103,101,32,91,37,115,61,0,0,0,116,97,103,32,109,117,115,116,32,98,101,32,62,32,48,0,10,100,101,102,32,95,119,99,32,61,32,119,105,116,104,112,101,110,32,99,117,114,114,101,110,116,112,101,110,32,119,105,116,104,99,111,108,111,114,32,99,117,114,114,101,110,116,99,111,108,111,114,32,101,110,100,100,101,102,59,10,100,101,102,32,95,97,99,32,61,32,97,100,100,116,111,32,99,117,114,114,101,110,116,112,105,99,116,117,114,101,32,101,110,100,100,101,102,59,10,100,101,102,32,95,115,109,115,32,61,32,115,99,97,108,101,100,32,109,112,116,32,115,104,105,102,116,101,100,32,101,110,100,100,101,102,59,10,37,32,100,114,97,119,105,110,103,32,112,111,105,110,116,45,116,121,112,101,115,10,100,101,102,32,103,112,100,114,97,119,32,40,101,120,112,114,32,110,44,32,120,44,32,121,41,32,61,10,32,32,105,102,32,110,60,48,58,32,95,97,99,32,99,111,110,116,111,117,114,32,102,117,108,108,99,105,114,99,108,101,32,95,115,109,115,32,40,120,44,121,41,10,32,32,101,108,115,101,105,102,32,40,110,61,49,41,32,111,114,32,40,110,61,51,41,58,10,32,32,32,32,95,97,99,32,100,111,117,98,108,101,112,97,116,104,32,112,116,112,97,116,104,91,110,93,32,95,115,109,115,32,40,120,44,121,41,32,95,119,99,59,10,32,32,32,32,95,97,99,32,100,111,117,98,108,101,112,97,116,104,32,112,116,112,97,116,104,91,110,93,32,114,111,116,97,116,101,100,32,57,48,32,95,115,109,115,32,40,120,44,121,41,32,95,119,99,10,32,32,101,108,115,101,105,102,32,110,60,54,58,32,95,97,99,32,100,111,117,98,108,101,112,97,116,104,32,112,116,112,97,116,104,91,110,93,32,95,115,109,115,32,40,120,44,121,41,32,95,119,99,10,32,32,101,108,115,101,58,32,95,97,99,32,99,111,110,116,111,117,114,32,112,116,112,97,116,104,91,110,93,32,95,115,109,115,32,40,120,44,121,41,32,95,119,99,10,32,32,102,105,10,101,110,100,100,101,102,59,10,10,37,32,116,104,101,32,112,111,105,110,116,32,115,104,97,112,101,115,10,112,97,116,104,32,112,116,112,97,116,104,91,93,59,10,37,100,105,97,109,111,110,100,10,112,116,112,97,116,104,48,32,61,32,112,116,112,97,116,104,54,32,61,32,40,45,49,47,50,44,48,41,45,45,40,48,44,45,49,47,50,41,45,45,40,49,47,50,44,48,41,45,45,40,48,44,49,47,50,41,45,45,99,121,99,108,101,59,10,37,32,112,108,117,115,32,115,105,103,110,10,112,116,112,97,116,104,49,32,61,32,40,45,49,47,50,44,48,41,45,45,40,49,47,50,44,48,41,59,10,37,32,115,113,117,97,114,101,10,112,116,112,97,116,104,50,32,61,32,112,116,112,97,116,104,55,32,61,32,40,45,49,47,50,44,45,49,47,50,41,45,45,40,49,47,50,44,45,49,47,50,41,45,45,40,49,47,50,44,49,47,50,41,45,45,40,45,49,47,50,44,49,47,50,41,45,45,99,121,99,108,101,59,10,37,32,99,114,111,115,115,10,112,116,112,97,116,104,51,32,58,61,32,40,45,49,47,50,44,45,49,47,50,41,45,45,40,49,47,50,44,49,47,50,41,59,10,37,32,99,105,114,99,108,101,58,10,112,116,112,97,116,104,52,32,61,32,112,116,112,97,116,104,56,58,61,32,102,117,108,108,99,105,114,99,108,101,59,10,37,32,116,114,105,97,110,103,108,101,10,112,116,112,97,116,104,53,32,61,32,112,116,112,97,116,104,57,32,58,61,32,40,48,44,49,47,50,41,45,45,40,45,49,47,50,44,45,49,47,50,41,45,45,40,49,47,50,44,45,49,47,50,41,45,45,99,121,99,108,101,59,10,10,100,101,102,32,108,105,110,101,116,121,112,101,32,101,120,112,114,32,110,32,61,10,32,32,99,117,114,114,101,110,116,99,111,108,111,114,58,61,32,105,102,32,99,111,108,111,114,108,105,110,101,115,32,58,32,99,111,108,91,110,93,32,101,108,115,101,58,32,98,108,97,99,107,32,102,105,59,10,32,32,105,102,32,110,32,61,32,45,49,32,58,10,32,32,32,32,32,32,100,114,97,119,111,112,116,105,111,110,115,40,119,105,116,104,99,111,108,111,114,32,99,117,114,114,101,110,116,99,111,108,111,114,32,119,105,116,104,112,101,110,32,40,99,117,114,114,101,110,116,112,101,110,32,115,99,97,108,101,100,32,46,53,41,41,59,10,32,32,101,108,115,101,105,102,32,110,32,60,32,49,32,58,10,32,32,32,32,100,114,97,119,111,112,116,105,111,110,115,40,95,119,99,41,59,10,32,32,101,108,115,101,32,58,10,32,32,32,32,100,114,97,119,111,112,116,105,111,110,115,40,32,105,102,32,100,97,115,104,101,100,108,105,110,101,115,58,32,100,97,115,104,101,100,32,108,116,91,110,93,32,102,105,32,95,119,99,41,59,10,32,32,102,105,10,101,110,100,100,101,102,59,10,10,37,32,100,97,115,104,32,112,97,116,116,101,114,110,115,10,112,105,99,116,117,114,101,32,108,116,91,93,59,10,108,116,49,61,100,97,115,104,112,97,116,116,101,114,110,40,111,110,32,50,32,111,102,102,32,50,41,59,32,37,32,100,97,115,104,101,115,10,108,116,50,61,100,97,115,104,112,97,116,116,101,114,110,40,111,110,32,50,32,111,102,102,32,50,32,111,110,32,48,46,50,32,111,102,102,32,50,41,59,32,37,100,97,115,104,45,100,111,116,10,108,116,51,61,108,116,49,32,115,99,97,108,101,100,32,49,46,52,49,52,59,10,108,116,52,61,108,116,50,32,115,99,97,108,101,100,32,49,46,52,49,52,59,10,108,116,53,61,108,116,49,32,115,99,97,108,101,100,32,50,59,10,108,116,54,58,61,108,116,50,32,115,99,97,108,101,100,32,50,59,10,108,116,55,61,100,97,115,104,112,97,116,116,101,114,110,40,111,110,32,48,46,50,32,111,102,102,32,50,41,59,32,37,100,111,116,115,10,10,99,111,108,111,114,32,99,111,108,91,93,44,99,121,97,110,44,32,109,97,103,101,110,116,97,44,32,121,101,108,108,111,119,59,10,99,121,97,110,61,98,108,117,101,43,103,114,101,101,110,59,32,109,97,103,101,110,116,97,61,114,101,100,43,98,108,117,101,59,121,101,108,108,111,119,61,103,114,101,101,110,43,114,101,100,59,10,99,111,108,91,45,50,93,58,61,99,111,108,91,45,49,93,58,61,99,111,108,48,58,61,98,108,97,99,107,59,10,99,111,108,49,58,61,114,101,100,59,10,99,111,108,50,58,61,40,46,50,44,46,50,44,49,41,59,32,37,98,108,117,101,10,99,111,108,51,58,61,40,49,44,46,54,54,44,48,41,59,32,37,111,114,97,110,103,101,10,99,111,108,52,58,61,46,56,53,42,103,114,101,101,110,59,10,99,111,108,53,58,61,46,57,42,109,97,103,101,110,116,97,59,10,99,111,108,54,58,61,48,46,56,53,42,99,121,97,110,59,10,99,111,108,55,58,61,46,56,53,42,121,101,108,108,111,119,59,10,10,37,112,108,97,99,105,110,103,32,116,101,120,116,10,112,105,99,116,117,114,101,32,71,80,116,101,120,116,59,10,100,101,102,32,112,117,116,95,116,101,120,116,40,101,120,112,114,32,112,105,99,44,32,120,44,32,121,44,32,114,44,32,106,41,32,61,10,32,32,71,80,116,101,120,116,58,61,109,97,107,101,112,105,99,40,112,105,99,41,59,10,32,32,71,80,116,101,120,116,58,61,71,80,116,101,120,116,32,115,104,105,102,116,101,100,10,32,32,32,32,105,102,32,106,32,61,32,49,58,32,40,45,40,117,108,99,111,114,110,101,114,32,71,80,116,101,120,116,32,43,32,108,108,99,111,114,110,101,114,32,71,80,116,101,120,116,41,47,50,41,10,32,32,32,32,101,108,115,101,105,102,32,106,32,61,32,50,58,32,40,45,99,101,110,116,101,114,32,71,80,116,101,120,116,41,10,32,32,32,32,101,108,115,101,58,32,40,45,40,117,114,99,111,114,110,101,114,32,71,80,116,101,120,116,32,43,32,108,114,99,111,114,110,101,114,32,71,80,116,101,120,116,41,47,50,41,10,32,32,32,32,102,105,10,32,32,32,32,114,111,116,97,116,101,100,32,114,59,10,32,32,97,100,100,116,111,32,99,117,114,114,101,110,116,112,105,99,116,117,114,101,32,97,108,115,111,32,71,80,116,101,120,116,32,115,104,105,102,116,101,100,32,40,120,44,121,41,10,101,110,100,100,101,102,59,10,0,0,0,0,0,0,0,0,112,108,117,109,0,0,0,0,10,9,77,105,110,111,114,32,103,114,105,100,32,100,114,97,119,110,32,119,105,116,104,0,100,97,115,104,101,100,108,105,110,101,115,58,61,116,114,117,101,59,10,0,0,0,0,0,100,97,114,107,45,118,105,111,108,101,116,0,0,0,0,0,9,77,97,106,111,114,32,103,114,105,100,32,100,114,97,119,110,32,119,105,116,104,0,0,106,117,109,112,110,122,0,0,104,101,97,100,36,115,0,0,102,111,110,116,0,0,0,0,100,97,115,104,101,100,108,105,110,101,115,58,61,102,97,108,115,101,59,10,0,0,0,0,118,105,111,108,101,116,0,0,32,116,105,99,115,10,0,0,32,32,77,105,110,105,109,117,109,58,32,32,37,115,32,91,37,42,108,100,93,32,32,32,37,115,32,91,37,42,108,100,93,10,0,0,0,0,0,0,97,115,0,0,0,0,0,0,117,110,107,110,111,119,110,32,116,121,112,101,32,105,110,32,100,105,115,112,95,118,97,108,117,101,40,41,0,0,0,0,105,0,0,0,0,0,0,0,99,111,108,111,114,108,105,110,101,115,58,61,102,97,108,115,101,59,10,0,0,0,0,0,111,114,97,110,103,101,0,0,32,109,37,115,0,0,0,0,108,105,110,101,116,121,112,101,0,0,0,0,0,0,0,0,121,101,114,114,111,114,108,105,110,101,115,10,0,0,0,0,101,120,112,101,99,116,105,110,103,32,100,105,114,101,99,116,111,114,121,32,110,97,109,101,0,0,0,0,0,0,0,0,33,0,0,0,0,0,0,0,99,111,108,111,114,108,105,110,101,115,58,61,116,114,117,101,59,10,0,0,0,0,0,0,111,108,105,118,101,0,0,0,75,80,95,76,101,102,116,0,32,37,115,0,0,0,0,0,66,111,116,104,32,112,97,114,97,109,101,116,101,114,115,32,116,111,32,115,116,114,112,116,105,109,101,32,109,117,115,116,32,98,101,32,115,116,114,105,110,103,115,0,0,0,0,0,10,99,111,108,111,114,32,99,117,114,114,101,110,116,99,111,108,111,114,59,32,99,117,114,114,101,110,116,99,111,108,111,114,58,61,98,108,97,99,107,59,10,99,111,108,111,114,32,102,105,108,108,99,111,108,111,114,59,10,98,111,111,108,101,97,110,32,99,111,108,111,114,108,105,110,101,115,44,100,97,115,104,101,100,108,105,110,101,115,59,10,0,0,0,0,0,98,101,105,103,101,0,0,0,82,101,99,116,97,110,103,117,108,97,114,0,0,0,0,0,98,97,99,107,36,104,101,97,100,0,0,0,0,0,0,0,122,50,0,0,0,0,0,0,92,115,101,116,102,111,110,116,123,37,115,125,123,37,53,46,50,102,125,10,101,116,101,120,10,0,0,0,0,0,0,0,100,97,114,107,45,103,111,108,100,101,110,114,111,100,0,0,80,111,108,97,114,0,0,0,121,95,109,105,110,32,115,104,111,117,108,100,32,110,111,116,32,101,113,117,97,108,32,121,95,109,97,120,33,0,0,0,73,110,118,97,108,105,100,32,114,97,110,103,101,0,0,0,10,37,102,111,110,116,32,99,104,97,110,103,101,115,10,118,101,114,98,97,116,105,109,116,101,120,10,92,100,101,102,92,115,101,116,102,111,110,116,35,49,35,50,123,37,46,10,32,32,92,102,111,110,116,92,103,112,102,111,110,116,61,35,49,32,97,116,32,35,50,112,116,10,92,103,112,102,111,110,116,125,10,0,0,0,0,0,0,100,97,114,107,45,107,104,97,107,105,0,0,0,0,0,0,9,37,115,32,103,114,105,100,32,100,114,97,119,110,32,97,116,0,0,0,0,0,0,0,37,115,102,105,120,109,97,36,120,0,0,0,0,0,0,0,51,54,48,32,109,117,108,32,99,111,115,32,97,98,115,0,10,100,101,102,97,117,108,116,102,111,110,116,58,61,32,34,37,115,34,59,10,100,101,102,97,117,108,116,115,99,97,108,101,32,58,61,32,37,54,46,51,102,47,102,111,110,116,115,105,122,101,32,100,101,102,97,117,108,116,102,111,110,116,59,10,0,0,0,0,0,0,0,107,104,97,107,105,0,0,0,9,103,114,105,100,32,105,115,32,79,70,70,10,0,0,0,37,115,102,105,120,109,105,36,110,0,0,0,0,0,0,0,9,32,32,72,105,100,100,101,110,51,100,32,101,108,101,109,101,110,116,115,32,119,105,108,108,32,98,101,32,100,114,97,119,110,32,105,110,32,37,115,32,111,102,32,110,111,110,45,104,105,100,100,101,110,51,100,32,101,108,101,109,101,110,116,115,10,0,0,0,0,0,0,118,97,114,100,101,102,32,109,97,107,101,112,105,99,40,101,120,112,114,32,115,116,114,41,32,61,10,32,32,105,102,32,112,105,99,116,117,114,101,32,115,116,114,32,58,32,115,116,114,32,115,99,97,108,101,100,32,116,101,120,116,109,97,103,10,32,32,37,32,111,116,104,101,114,119,105,115,101,32,97,32,115,116,114,105,110,103,10,32,32,101,108,115,101,58,32,115,116,114,32,105,110,102,111,110,116,32,100,101,102,97,117,108,116,102,111,110,116,32,115,99,97,108,101,100,32,40,100,101,102,97,117,108,116,115,99,97,108,101,42,116,101,120,116,109,97,103,41,10,32,32,102,105,10,101,110,100,100,101,102,59,10,10,100,101,102,32,105,110,102,111,110,116,115,105,122,101,40,101,120,112,114,32,115,116,114,44,32,115,105,122,101,41,32,61,10,32,32,105,110,102,111,110,116,32,115,116,114,32,115,99,97,108,101,100,32,40,115,105,122,101,32,47,32,102,111,110,116,115,105,122,101,32,115,116,114,41,10,101,110,100,100,101,102,59,10,0,0,100,97,114,107,45,115,97,108,109,111,110,0,0,0,0,0,114,97,120,105,115,32,105,115,32,37,115,100,114,97,119,110,10,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,32,82,101,97,100,32,37,100,32,112,111,105,110,116,115,10,0,0,0,0,0,0,0,0,37,115,102,105,120,0,0,0,10,116,101,120,116,109,97,103,58,61,37,54,46,51,102,59,10,0,0,0,0,0,0,0,115,97,108,109,111,110,0,0,9,37,115,122,101,114,111,97,120,105,115,32,105,115,32,79,70,70,10,0,0,0,0,0,37,115,109,97,36,120,0,0,80,114,101,115,115,32,114,101,116,117,114,110,32,102,111,114,32,109,111,114,101,58,32,0,10,119,97,114,110,105,110,103,99,104,101,99,107,58,61,48,59,10,100,101,102,97,117,108,116,109,112,116,58,61,109,112,116,58,61,52,59,10,116,104,58,61,46,54,59,10,37,37,32,72,97,118,101,32,110,105,99,101,32,115,104,97,114,112,32,106,111,105,110,115,32,111,110,32,111,117,114,32,108,105,110,101,115,10,108,105,110,101,99,97,112,58,61,98,117,116,116,59,10,108,105,110,101,106,111,105,110,58,61,109,105,116,101,114,101,100,59,10,10,100,101,102,32,115,99,97,108,101,112,101,110,32,101,120,112,114,32,110,32,61,32,112,105,99,107,117,112,32,112,101,110,99,105,114,99,108,101,32,115,99,97,108,101,100,32,40,110,42,116,104,41,32,101,110,100,100,101,102,59,10,100,101,102,32,112,116,115,105,122,101,32,101,120,112,114,32,110,32,61,32,109,112,116,58,61,110,42,100,101,102,97,117,108,116,109,112,116,32,101,110,100,100,101,102,59,10,10,0,0,0,0,0,111,114,97,110,103,101,45,114,101,100,0,0,0,0,0,0,9,37,115,122,101,114,111,97,120,105,115,32,105,115,32,100,114,97,119,110,32,119,105,116,104,0,0,0,0,0,0,0,106,117,109,112,122,0,0,0,37,115,109,105,36,110,0,0,116,105,36,116,108,101,0,0,92,98,101,103,105,110,123,100,111,99,117,109,101,110,116,125,10,101,116,101,120,10,37,32,69,78,68,80,82,69,10,0,108,105,103,104,116,45,99,111,114,97,108,0,0,0,0,0,125,0,0,0,0,0,0,0,108,97,98,101,108,32,110,111,116,32,102,111,117,110,100,0,32,32,83,117,109,32,83,113,46,58,32,32,37,115,32,37,115,32,37,115,10,0,0,0,107,101,36,101,112,102,105,120,0,0,0,0,0,0,0,0,34,37,115,34,0,0,0,0,115,105,110,116,0,0,0,0,92,117,115,101,112,97,99,107,97,103,101,91,105,110,116,108,105,109,105,116,115,93,123,97,109,115,109,97,116,104,125,10,92,117,115,101,112,97,99,107,97,103,101,123,97,109,115,102,111,110,116,115,125,10,0,0,99,111,114,97,108,0,0,0,32,112,111,105,110,116,32,119,105,116,104,32,99,111,108,111,114,32,111,102,0,0,0,0,69,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,115,32,116,111,32,115,101,116,32,37,115,0,0,102,105,120,0,0,0,0,0,100,111,116,115,10,0,0,0,120,112,45,62,110,101,120,116,95,115,112,32,61,61,32,121,112,0,0,0,0,0,0,0,92,117,115,101,112,97,99,107,97,103,101,91,108,97,116,105,110,49,93,123,105,110,112,117,116,101,110,99,125,10,92,117,115,101,112,97,99,107,97,103,101,91,84,49,93,123,102,111,110,116,101,110,99,125,10,92,117,115,101,112,97,99,107,97,103,101,123,116,101,120,116,99,111,109,112,125,10,92,117,115,101,112,97,99,107,97,103,101,123,109,97,116,104,112,116,109,120,125,10,92,117,115,101,112,97,99,107,97,103,101,91,115,99,97,108,101,100,61,46,57,50,93,123,104,101,108,118,101,116,125,10,92,117,115,101,112,97,99,107,97,103,101,123,99,111,117,114,105,101,114,125,10,92,117,115,101,112,97,99,107,97,103,101,123,108,97,116,101,120,115,121,109,125,10,0,0,100,97,114,107,45,112,105,110,107,0,0,0,0,0,0,0,75,80,95,80,97,103,101,68,111,119,110,0,0,0,0,0,32,110,111,112,111,105,110,116,0,0,0,0,0,0,0,0,98,117,102,102,101,114,91,108,101,110,103,116,104,45,49,93,32,61,61,32,39,32,39,0,102,117,108,108,36,119,105,100,116,104,0,0,0,0,0,0,92,117,115,101,112,97,99,107,97,103,101,91,108,97,116,105,110,49,93,123,105,110,112,117,116,101,110,99,125,10,92,117,115,101,112,97,99,107,97,103,101,91,84,49,93,123,102,111,110,116,101,110,99,125,10,92,117,115,101,112,97,99,107,97,103,101,123,116,105,109,101,115,44,109,97,116,104,112,116,109,120,125,10,92,117,115,101,112,97,99,107,97,103,101,123,104,101,108,118,101,116,125,10,92,117,115,101,112,97,99,107,97,103,101,123,99,111,117,114,105,101,114,125,10,0,0,0,0,100,97,114,107,45,116,117,114,113,117,111,105,115,101,0,0,32,102,111,110,116,32,34,37,115,34,0,0,0,0,0,0,108,36,97,114,103,101,0,0,100,101,102,97,117,108,116,0,37,115,32,61,32,0,0,0,109,97,108,102,111,114,109,101,100,32,114,97,110,103,101,32,119,105,116,104,32,99,111,110,115,116,97,114,105,110,116,0,92,100,111,99,117,109,101,110,116,99,108,97,115,115,123,97,114,116,105,99,108,101,125,10,0,0,0,0,0,0,0,0,109,97,103,101,110,116,97,0,32,37,115,32,0,0,0,0,115,36,109,97,108,108,0,0,120,95,109,105,110,32,115,104,111,117,108,100,32,110,111,116,32,101,113,117,97,108,32,120,95,109,97,120,33,0,0,0,92,100,111,99,117,109,101,110,116,99,108,97,115,115,91,97,52,112,97,112,101,114,93,123,97,114,116,105,99,108,101,125,10,0,0,0,0,0,0,0,32,110,111,116,32,114,111,116,97,116,101,100,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,97,98,115,111,108,117,116,101,39,32,111,114,32,39,114,101,108,97,116,105,118,101,39,32,0,0,0,0,0,77,79,85,83,69,95,0,0,124,115,105,110,40,51,54,48,120,41,124,0,0,0,0,0,10,37,37,32,65,100,100,32,92,100,111,99,117,109,101,110,116,99,108,97,115,115,32,97,110,100,32,92,98,101,103,105,110,123,100,99,111,117,109,101,110,116,125,32,102,111,114,32,108,97,116,101,120,10,37,37,32,78,66,32,121,111,117,32,115,104,111,117,108,100,32,115,101,116,32,116,104,101,32,101,110,118,105,114,111,110,109,101,110,116,32,118,97,114,105,97,98,108,101,32,84,69,88,32,116,111,32,116,104,101,32,110,97,109,101,32,111,102,32,121,111,117,114,10,37,37,32,108,97,116,101,120,32,101,120,101,99,117,116,97,98,108,101,32,40,110,111,114,109,97,108,108,121,32,108,97,116,101,120,41,32,105,110,111,114,100,101,114,32,102,111,114,32,109,101,116,97,112,111,115,116,32,116,111,32,119,111,114,107,10,37,37,32,111,114,32,114,117,110,10,37,37,32,109,112,111,115,116,32,45,45,116,101,120,61,108,97,116,101,120,32,46,46,46,10,10,37,32,66,69,71,80,82,69,10,118,101,114,98,97,116,105,109,116,101,120,10,0,116,105,109,101,108,97,98,101,108,46,116,101,120,116,0,0,115,107,121,98,108,117,101,0,32,114,111,116,97,116,101,100,32,98,121,32,37,100,32,100,101,103,114,101,101,115,32,40,105,102,32,112,111,115,115,105,98,108,101,41,0,0,0,0,114,36,101,108,97,116,105,118,101,0,0,0,0,0,0,0,112,114,111,108,111,103,117,101,115,58,61,37,100,59,10,0,109,101,100,105,117,109,45,98,108,117,101,0,0,0,0,0,32,99,101,110,116,114,101,0,97,36,98,115,111,108,117,116,101,0,0,0,0,0,0,0,98,97,100,32,100,97,116,97,32,111,110,32,108,105,110,101,32,37,100,32,111,102,32,100,97,116,97,102,105,108,101,0,115,101,116,32,37,115,122,101,114,111,97,120,105,115,0,0,37,37,71,78,85,80,76,79,84,32,77,101,116,97,112,111,115,116,32,111,117,116,112,117,116,58,32,37,115,10,0,0,110,97,118,121,0,0,0,0,9,108,97,98,101,108,32,37,100,32,34,37,115,34,32,97,116,32,0,0,0,0,0,0,112,114,105,110,116,95,116,97,98,108,101,58,32,111,117,116,112,117,116,32,98,117,102,102,101,114,0,0,0,0,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,32,105,110,32,115,99,105,101,110,116,105,102,105,99,32,110,117,109,98,101,114,32,102,111,114,109,97,116,116,105,110,103,0,0,101,110,100,46,10,0,0,0,109,105,100,110,105,103,104,116,45,98,108,117,101,0,0,0,122,95,109,105,110,51,100,32,115,104,111,117,108,100,32,110,111,116,32,101,113,117,97,108,32,122,95,109,97,120,51,100,33,0,0,0,0,0,0,0,106,117,109,112,0,0,0,0,32,40,0,0,0,0,0,0,37,32,69,78,68,80,79,83,84,10,0,0,0,0,0,0,100,97,114,107,45,98,108,117,101,0,0,0,0,0,0,0,123,0,0,0,0,0,0,0,44,32,98,97,99,107,97,110,103,108,101,32,37,103,32,100,101,103,0,0,0,0,0,0,32,32,83,117,109,58,32,32,32,32,32,32,37,115,32,37,115,32,37,115,10,0,0,0,101,116,101,120,10,0,0,0,10,9,32,32,97,114,114,111,119,32,104,101,97,100,58,32,108,101,110,103,116,104,32,37,115,37,103,44,32,97,110,103,108,101,32,37,103,32,100,101,103,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,108,105,110,101,97,114,39,44,32,39,99,117,98,105,99,115,112,108,105,110,101,39,44,32,39,98,115,112,108,105,110,101,39,44,32,39,112,111,105,110,116,115,39,44,32,39,108,101,118,101,108,115,39,32,111,114,32,39,111,114,100,101,114,39,0,0,0,0,0,115,101,116,32,37,115,116,105,99,115,32,37,115,32,0,0,108,105,110,101,115,112,111,105,110,116,115,10,0,0,0,0,71,80,86,65,76,95,76,65,83,84,95,80,76,79,84,0,47,0,0,0,0,0,0,0,32,92,101,110,100,123,100,111,99,117,109,101,110,116,125,10,0,0,0,0,0,0,0,0,115,101,97,45,103,114,101,101,110,0,0,0,0,0,0,0,75,80,95,68,111,119,110,0,40,115,101,99,111,110,100,32,120,32,97,120,105,115,41,32,0,0,0,0,0,0,0,0,98,115,112,108,105,110,101,32,111,114,100,101,114,32,109,117,115,116,32,98,101,32,105,110,32,91,50,46,46,49,48,93,32,114,97,110,103,101,46,0,32,110,111,114,97,110,103,101,108,105,109,105,116,0,0,0,118,101,114,98,97,116,105,109,116,101,120,10,0,0,0,0,102,111,114,101,115,116,45,103,114,101,101,110,0,0,0,0,40,102,105,114,115,116,32,120,32,97,120,105,115,41,32,0,111,36,114,100,101,114,0,0,32,114,97,110,103,101,108,105,109,105,116,0,0,0,0,0,117,110,102,105,110,105,115,104,101,100,32,114,97,110,103,101,32,119,105,116,104,32,99,111,110,115,116,114,97,105,110,116,0,0,0,0,0,0,0,0,37,32,66,69,71,80,79,83,84,10,0,0,0,0,0,0,115,112,114,105,110,103,45,103,114,101,101,110,0,0,0,0,32,116,111,32,0,0,0,0,76,101,118,101,108,115,32,116,121,112,101,32,105,115,32,100,105,115,99,114,101,116,101,44,32,105,103,110,111,114,105,110,103,32,110,101,119,32,110,117,109,98,101,114,32,111,102,32,99,111,110,116,111,117,114,32,108,101,118,101,108,115,0,0,84,101,114,109,105,110,97,108,32,99,97,110,118,97,115,32,97,114,101,97,32,116,111,111,32,115,109,97,108,108,32,116,111,32,104,111,108,100,32,112,108,111,116,46,10,9,32,32,32,32,67,104,101,99,107,32,112,108,111,116,32,98,111,117,110,100,97,114,121,32,97,110,100,32,102,111,110,116,32,115,105,122,101,115,46,0,0,0,101,110,100,102,105,103,59,10,0,0,0,0,0,0,0,0,100,97,114,107,45,103,114,101,101,110,0,0,0,0,0,0,32,114,116,111,32,0,0,0,97,117,36,116,111,0,0,0,10,115,101,116,32,37,115,100,116,105,99,115,0,0,0,0,51,54,48,32,109,117,108,32,115,105,110,32,97,98,115,0,115,99,97,108,101,112,101,110,32,49,59,32,112,116,115,105,122,101,32,37,46,51,102,59,108,105,110,101,116,121,112,101,32,45,50,59,10,0,0,0,10,9,32,32,102,114,111,109,32,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,99,111,109,109,97,32,116,111,32,115,101,112,97,114,97,116,101,32,105,110,99,114,44,115,116,111,112,32,108,101,118,101,108,115,0,0,0,0,10,115,101,116,32,37,115,109,116,105,99,115,0,0,0,0,97,58,61,119,47,37,46,49,102,59,98,58,61,104,47,37,46,49,102,59,10,0,0,0,103,111,108,100,0,0,0,0,110,111,102,105,108,108,101,100,0,0,0,0,0,0,0,0,105,110,99,114,101,109,101,110,116,32,99,97,110,110,111,116,32,98,101,32,48,0,0,0,97,117,116,111,102,114,101,113,32,0,0,0,0,0,0,0,77,97,120,46,32,110,117,109,98,101,114,32,111,102,32,100,97,116,97,32,112,111,105,110,116,115,32,115,99,97,108,101,100,32,117,112,32,116,111,58,32,37,100,10,0,0,0,0,69,68,70,32,104,101,97,100,101,114,0,0,0,0,0,0,10,98,101,103,105,110,102,105,103,40,37,100,41,59,10,119,58,61,37,46,51,102,105,110,59,104,58,61,37,46,51,102,105,110,59,10,0,0,0,0,108,105,103,104,116,45,116,117,114,113,117,111,105,115,101,0,101,109,112,116,121,0,0,0,101,120,112,101,99,116,105,110,103,32,99,111,109,109,97,32,116,111,32,115,101,112,97,114,97,116,101,32,115,116,97,114,116,44,105,110,99,114,32,108,101,118,101,108,115,0,0,0,10,115,101,116,32,37,115,116,105,99,115,32,0,0,0,0,108,111,103,49,48,95,98,97,115,101,32,61,61,32,49,46,48,0,0,0,0,0,0,0,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,0,108,105,103,104,116,45,112,105,110,107,0,0,0,0,0,0,102,105,108,108,101,100,0,0,105,110,36,99,114,101,109,101,110,116,97,108,0,0,0,0,97,115,115,105,103,110,0,0,32,97,117,116,111,106,117,115,116,105,102,121,0,0,0,0,112,111,112,32,48,0,0,0,100,114,97,119,32,40,37,46,49,102,97,44,37,46,49,102,98,41,0,0,0,0,0,0,108,105,103,104,116,45,103,111,108,100,101,110,114,111,100,0,119,104,105,108,101,0,0,0,9,97,114,114,111,119,32,37,100,44,32,37,115,32,37,115,32,37,115,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,99,111,109,109,97,32,116,111,32,115,101,112,97,114,97,116,101,32,100,105,115,99,114,101,116,101,32,108,101,118,101,108,115,0,0,0,0,0,32,32,83,116,100,32,68,101,118,58,32,32,37,115,32,37,115,32,37,115,10,0,0,0,98,121,32,37,100,32,0,0,123,37,115,44,32,37,115,125,0,0,0,0,0,0,0,0,117,115,104,111,114,116,0,0,108,105,110,101,116,121,112,101,32,37,100,59,10,0,0,0,108,105,103,104,116,45,99,121,97,110,0,0,0,0,0,0,9,107,101,121,32,116,105,116,108,101,32,105,115,32,34,37,115,34,10,0,0,0,0,0,108,105,110,101,115,116,121,108,101,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,100,105,115,99,114,101,116,101,32,108,101,118,101,108,0,0,0,0,0,0,0,0,105,109,112,117,108,115,101,115,10,0,0,0,0,0,0,0,67,97,110,110,111,116,32,99,111,110,116,111,117,114,32,110,111,110,32,103,114,105,100,32,100,97,116,97,46,32,80,108,101,97,115,101,32,117,115,101,32,34,115,101,116,32,100,103,114,105,100,51,100,34,46,0,98,105,110,100,95,99,111,109,109,97,110,100,45,62,114,104,115,0,0,0,0,0,0,0,112,117,116,95,116,101,120,116,40,32,98,116,101,120,32,37,115,32,101,116,101,120,44,32,37,46,49,102,97,44,32,37,46,49,102,98,44,32,37,100,44,32,37,100,41,59,10,0,108,105,103,104,116,45,109,97,103,101,110,116,97,0,0,0,75,80,95,69,110,100,0,0,37,100,32,102,111,114,32,118,101,114,116,105,99,97,108,32,97,108,105,103,110,109,101,110,116,10,0,0,0,0,0,0,100,105,36,115,99,114,101,116,101,0,0,0,0,0,0,0,82,101,115,117,108,116,105,110,103,32,115,116,114,105,110,103,32,105,115,32,116,111,111,32,108,111,110,103,0,0,0,0,112,117,116,95,116,101,120,116,40,32,98,116,101,120,32,92,115,101,116,102,111,110,116,123,37,115,125,123,37,53,46,50,102,125,32,37,115,32,101,116,101,120,44,32,37,46,49,102,97,44,32,37,46,49,102,98,44,32,37,100,44,32,37,100,41,59,10,0,0,0,0,0,108,105,103,104,116,45,98,108,117,101,0,0,0,0,0,0,9,109,97,120,105,109,117,109,32,110,117,109,98,101,114,32,111,102,32,114,111,119,115,32,105,115,32,0,0,0,0,0,108,101,36,118,101,108,115,0,111,117,116,0,0,0,0,0,112,117,116,95,116,101,120,116,40,34,37,115,34,44,32,37,46,49,102,97,44,32,37,46,49,102,98,44,32,37,100,44,32,37,100,41,59,10,0,0,108,105,103,104,116,45,103,114,101,101,110,0,0,0,0,0,99,97,108,99,117,108,97,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,0,0,98,36,115,112,108,105,110,101,0,0,0,0,0,0,0,0,107,101,121,0,0,0,0,0,112,117,116,95,116,101,120,116,40,34,37,115,34,32,105,110,102,111,110,116,115,105,122,101,40,34,37,115,34,44,37,53,46,50,102,41,44,32,37,46,49,102,97,44,32,37,46,49,102,98,44,32,37,100,44,32,37,100,41,59,10,0,0,0,108,105,103,104,116,45,114,101,100,0,0,0,0,0,0,0,37,100,32,102,111,114,32,104,111,114,105,122,111,110,116,97,108,32,97,108,105,103,110,109,101,110,116,10,0,0,0,0,99,36,117,98,105,99,115,112,108,105,110,101,0,0,0,0,97,120,105,115,0,0,0,0,99,111,115,40,51,54,48,120,41,0,0,0,0,0,0,0,103,112,100,114,97,119,40,37,100,44,37,46,49,102,97,44,37,46,49,102,98,41,59,10,0,0,0,0,0,0,0,0,103,114,101,121,49,48,48,0,9,109,97,120,105,109,117,109,32,110,117,109,98,101,114,32,111,102,32,99,111,108,117,109,110,115,32,105,115,32,0,0,108,105,36,110,101,97,114,0,115,101,116,32,37,115,116,105,99,115,32,37,115,32,37,115,32,115,99,97,108,101,32,37,103,44,37,103,32,37,115,109,105,114,114,111,114,32,37,115,32,0,0,0,0,0,0,0,100,114,97,119,32,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,59,10,0,0,0,0,0,103,114,101,121,57,48,0,0,119,105,116,104,32,99,111,108,117,109,110,32,104,101,97,100,101,114,0,0,0,0,0,0,115,101,116,32,110,111,37,115,116,105,99,115,10,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,105,110,32,102,105,116,58,32,116,111,111,32,109,97,110,121,32,100,97,116,97,112,111,105,110,116,115,32,40,37,100,41,63,0,100,114,97,119,100,98,108,97,114,114,111,119,0,0,0,0,103,114,101,121,56,48,0,0,119,105,116,104,32,102,105,108,101,110,97,109,101,0,0,0,101,120,112,101,99,116,105,110,103,32,39,98,97,115,101,39,44,32,39,115,117,114,102,97,99,101,39,44,32,111,114,32,39,98,111,116,104,39,0,0,32,108,111,103,102,105,108,101,32,39,37,115,39,0,0,0,100,114,97,119,97,114,114,111,119,0,0,0,0,0,0,0,103,114,101,121,55,48,0,0,9,115,97,109,112,108,101,32,108,101,110,103,116,104,32,105,115,32,37,103,32,99,104,97,114,97,99,116,101,114,115,10,9,118,101,114,116,105,99,97,108,32,115,112,97,99,105,110,103,32,105,115,32,37,103,32,99,104,97,114,97,99,116,101,114,115,10,9,119,105,100,116,104,32,97,100,106,117,115,116,109,101,110,116,32,105,115,32,37,103,32,99,104,97,114,97,99,116,101,114,115,10,9,104,101,105,103,104,116,32,97,100,106,117,115,116,109,101,110,116,32,105,115,32,37,103,32,99,104,97,114,97,99,116,101,114,115,10,9,99,117,114,118,101,115,32,97,114,101,37,115,32,97,117,116,111,109,97,116,105,99,97,108,108,121,32,116,105,116,108,101,100,32,37,115,10,0,0,0,0,0,0,0,0,98,111,36,116,104,0,0,0,91,93,0,0,0,0,0,0,115,101,116,32,102,105,116,32,37,115,101,114,114,111,114,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,0,116,101,109,112,32,102,105,108,101,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,37,115,32,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,59,10,0,0,0,0,0,0,0,103,114,101,121,54,48,0,0,117,112,36,100,97,116,101,0,9,107,101,121,32,98,111,120,32,105,115,32,111,112,97,113,117,101,32,97,110,100,32,100,114,97,119,110,32,105,110,32,102,114,111,110,116,32,111,102,32,116,104,101,32,103,114,97,112,104,10,0,0,0,0,0,115,36,117,114,102,97,99,101,0,0,0,0,0,0,0,0,32,32,77,101,97,110,58,32,32,32,32,32,37,115,32,37,115,32,37,115,10,0,0,0,115,101,116,32,112,115,100,105,114,10,0,0,0,0,0,0,115,104,111,114,116,0,0,0,112,116,115,105,122,101,32,37,46,51,102,59,10,0,0,0,103,114,101,121,53,48,0,0,110,111,116,32,98,111,120,101,100,10,0,0,0,0,0,0,98,97,36,115,101,0,0,0,115,101,116,32,112,115,100,105,114,32,34,37,115,34,10,0,112,111,105,110,116,115,10,0,65,108,108,32,112,111,105,110,116,115,32,111,102,32,99,111,108,111,114,98,111,120,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,0,0,98,105,110,100,95,99,111,109,109,97,110,100,45,62,108,104,115,0,0,0,0,0,0,0,43,0,0,0,0,0,0,0,102,105,108,108,32,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,99,121,99,108,101,32,119,105,116,104,112,101,110,32,40,112,101,110,99,105,114,99,108,101,32,115,99,97,108,101,100,32,48,112,116,41,32,119,105,116,104,99,111,108,111,114,32,102,105,108,108,99,111,108,111,114,59,10,0,0,0,0,0,103,114,101,121,52,48,0,0,75,80,95,73,110,115,101,114,116,0,0,0,0,0,0,0,98,111,120,101,100,10,9,119,105,116,104,32,0,0,0,0,83,99,97,108,101,32,102,97,99,116,111,114,115,32,109,117,115,116,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,122,101,114,111,32,45,32,110,111,116,32,99,104,97,110,103,101,100,33,0,0,115,101,116,32,102,111,110,116,112,97,116,104,32,0,0,0,68,111,117,98,108,101,0,0,102,95,115,116,114,102,116,105,109,101,58,32,98,117,102,102,101,114,0,0,0,0,0,0,105,110,105,116,32,100,121,110,97,114,114,97,121,0,0,0,102,105,108,108,32,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,40,37,46,49,102,97,44,37,46,49,102,98,41,45,45,99,121,99,108,101,32,119,105,116,104,99,111,108,111,114,32,98,97,99,107,103,114,111,117,110,100,59,10,0,0,0,103,114,101,121,51,48,0,0,114,105,103,104,116,0,0,0,78,117,109,98,101,114,32,111,102,32,103,114,105,100,32,112,111,105,110,116,115,32,109,117,115,116,32,98,101,32,105,110,32,91,50,58,49,48,48,48,93,32,45,32,110,111,116,32,99,104,97,110,103,101,100,33,0,0,0,0,0,0,0,0,117,110,102,105,110,105,115,104,101,100,32,114,97,110,103,101,0,0,0,0,0,0,0,0,115,99,97,108,101,112,101,110,32,37,46,51,102,59,10,0,103,114,101,121,50,48,0,0,108,101,102,116,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,32,107,101,121,119,111,114,100,32,111,114,32,117,110,101,120,112,101,99,116,101,100,32,118,97,108,117,101,0,100,105,102,102,105,99,117,108,116,121,32,109,97,107,105,110,103,32,114,111,111,109,32,102,111,114,32,120,116,105,99,32,108,97,98,101,108,115,0,0,115,101,116,32,108,111,97,100,112,97,116,104,32,0,0,0,99,117,114,114,101,110,116,99,111,108,111,114,58,61,37,46,52,103,42,114,101,100,43,37,46,52,103,42,103,114,101,101,110,43,37,46,52,103,42,98,108,117,101,59,10,0,0,0,103,114,101,121,49,48,0,0,9,107,101,121,32,105,115,32,37,115,32,106,117,115,116,105,102,105,101,100,44,32,37,115,114,101,118,101,114,115,101,100,44,32,37,115,105,110,118,101,114,116,101,100,44,32,37,115,101,110,104,97,110,99,101,100,32,97,110,100,32,0,0,0,107,100,101,110,115,36,105,116,121,50,100,0,0,0,0,0,51,54,48,32,109,117,108,32,99,111,115,0,0,0,0,0,99,117,114,114,101,110,116,99,111,108,111,114,58,61,99,111,108,37,100,59,10,0,0,0,103,114,101,121,48,0,0,0,9,107,101,121,32,105,115,32,97,116,32,0,0,0,0,0,100,101,99,105,109,97,108,95,115,105,103,110,32,105,110,32,108,111,99,97,108,101,32,105,115,32,37,115,10,0,0,0,101,114,114,111,114,32,100,117,114,105,110,103,32,102,105,116,0,0,0,0,0,0,0,0,99,117,114,114,101,110,116,99,111,108,111,114,58,61,98,108,97,99,107,59,10,0,0,0,116,117,114,113,117,111,105,115,101,0,0,0,0,0,0,0,32,114,109,97,114,103,105,110,0,0,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,102,105,110,100,32,114,101,113,117,101,115,116,101,100,32,108,111,99,97,108,101,0,99,117,114,114,101,110,116,99,111,108,111,114,58,61,37,46,51,103,119,104,105,116,101,59,10,0,0,0,0,0,0,0,121,101,108,108,111,119,0,0,32,108,109,97,114,103,105,110,0,0,0,0,0,0,0,0,76,65,78,71,0,0,0,0,85,83,69,82,78,65,77,69,0,0,0,0,0,0,0,0,59,10,0,0,0,0,0,0,98,114,111,119,110,0,0,0,32,98,109,97,114,103,105,110])
.concat([0,0,0,0,0,0,0,0,76,67,95,78,85,77,69,82,73,67,0,0,0,0,0,0,110,101,115,0,0,0,0,0,67,108,111,115,105,110,103,32,37,115,10,0,0,0,0,0,99,121,99,108,101,32,119,105,116,104,99,111,108,111,114,32,102,105,108,108,99,111,108,111,114,59,10,0,0,0,0,0,97,113,117,97,109,97,114,105,110,101,0,0,0,0,0,0,117,110,115,36,101,116,0,0,32,116,109,97,114,103,105,110,0,0,0,0,0,0,0,0,76,67,95,65,76,76,0,0,42,32,67,79,76,85,77,78,83,58,10,0,0,0,0,0,102,114,97,99,116,105,111,110,0,0,0,0,0,0,0,0,117,99,104,97,114,0,0,0,45,45,0,0,0,0,0,0,111,114,99,104,105,100,0,0,32,111,117,116,115,105,100,101,0,0,0,0,0,0,0,0,99,97,110,100,108,101,115,0,108,105,110,101,115,10,0,0,65,108,108,32,112,111,105,110,116,115,32,122,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,0,0,0,0,119,104,105,115,107,101,114,36,98,97,114,115,0,0,0,0,99,111,109,109,97,110,100,46,99,0,0,0,0,0,0,0,10,45,45,0,0,0,0,0,100,97,114,107,45,99,104,97,114,116,114,101,117,115,101,0,75,80,95,70,52,0,0,0,32,105,110,115,105,100,101,0,101,120,112,101,99,116,105,110,103,32,115,101,99,111,110,100,32,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,110,97,109,101,0,0,0,0,120,121,61,37,103,44,37,103,0,0,0,0,0,0,0,0,70,108,111,97,116,0,0,0,102,105,110,97,110,99,101,98,97,114,115,0,0,0,0,0,40,37,46,49,102,97,44,37,46,49,102,98,41,37,115,0,100,97,114,107,45,114,101,100,0,0,0,0,0,0,0,0,32,104,111,114,105,122,111,110,116,97,108,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,110,97,109,101,0,0,0,115,101,116,32,115,116,121,108,101,32,98,111,120,112,108,111,116,32,37,115,32,37,115,32,37,53,46,50,102,32,37,115,111,117,116,108,105,101,114,115,32,112,116,32,37,100,32,115,101,112,97,114,97,116,105,111,110,32,37,103,32,108,97,98,101,108,115,32,37,115,32,37,115,115,111,114,116,101,100,10,0,0,0,0,0,0,0,0,102,105,108,108,32,0,0,0,115,116,101,101,108,98,108,117,101,0,0,0,0,0,0,0,32,118,101,114,116,105,99,97,108,0,0,0,0,0,0,0,105,99,111,110,118,32,102,97,105,108,101,100,32,116,111,32,99,111,110,118,101,114,116,32,100,101,103,114,101,101,32,115,105,103,110,0,0,0,0,0,120,116,105,99,0,0,0,0,10,117,110,115,101,116,32,99,111,108,111,114,98,111,120,10,0,0,0,0,0,0,0,0,102,105,108,108,99,111,108,111,114,58,61,99,117,114,114,101,110,116,99,111,108,111,114,59,10,0,0,0,0,0,0,0,112,117,114,112,108,101,0,0,32,99,101,110,116,101,114,0,105,99,111,110,118,95,111,112,101,110,32,102,97,105,108,101,100,32,102,111,114,32,37,115,0,0,0,0,0,0,0,0,98,111,114,100,101,114,32,37,100,0,0,0,0,0,0,0,115,105,110,40,51,54,48,120,41,0,0,0,0,0,0,0,101,120,112,97,110,100,32,108,111,97,100,112,97,116,104,0,102,105,108,108,99,111,108,111,114,58,61,99,117,114,114,101,110,116,99,111,108,111,114,42,37,46,50,102,43,98,97,99,107,103,114,111,117,110,100,42,37,46,50,102,59,10,0,0,100,97,114,107,45,115,112,114,105,110,103,45,103,114,101,101,110,0,0,0,0,0,0,0,32,114,105,103,104,116,0,0,98,100,101,102,97,117,108,116,0,0,0,0,0,0,0,0,102,105,108,108,99,111,108,111,114,58,61,98,97,99,107,103,114,111,117,110,100,59,10,0,103,111,108,100,101,110,114,111,100,0,0,0,0,0,0,0,32,108,101,102,116,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,101,110,99,111,100,105,110,103,32,115,112,101,99,105,102,105,99,97,116,105,111,110,59,32,115,101,101,32,39,104,101,108,112,32,101,110,99,111,100,105,110,103,39,46,0,0,0,0,0,0,0,41,0,0,0,0,0,0,0,110,111,98,111,114,100,101,114,0,0,0,0,0,0,0,0,101,114,114,36,111,114,115,116,97,116,101,0,0,0,0,0,100,101,102,97,117,108,116,102,111,110,116,0,0,0,0,0,73,108,108,101,103,97,108,32,100,97,121,32,111,102,32,121,101,97,114,0,0,0,0,0,114,111,121,97,108,98,108,117,101,0,0,0,0,0,0,0,99,101,110,116,101,114,0,0,57,51,50,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,104,111,115,116,115,99,114,105,112,116,47,102,111,110,116,115,0,0,0,0,0,0,85,83,69,82,0,0,0,0,101,120,116,101,114,110,97,108,36,105,109,97,103,101,115,0,100,97,114,107,45,121,101,108,108,111,119,0,0,0,0,0,9,107,101,121,32,105,115,32,79,78,44,32,112,111,115,105,116,105,111,110,58,32,0,0,83,74,73,83,0,0,0,0,101,113,115,0,0,0,0,0,104,111,114,105,122,111,110,116,0,0,0,0,0,0,0,0,78,111,32,116,101,114,109,105,110,97,108,32,100,101,102,105,110,101,100,0,0,0,0,0,105,110,108,105,110,101,36,105,109,97,103,101,115,0,0,0,100,97,114,107,45,111,114,97,110,103,101,0,0,0,0,0,117,110,100,36,101,102,105,110,101,0,0,0,0,0,0,0,9,107,101,121,32,105,115,32,79,70,70,10,0,0,0,0,118,101,114,116,105,99,0,0,72,69,76,80,70,73,76,69,32,32,32,32,32,32,32,32,32,32,32,61,32,34,37,115,34,10,0,0,0,0,0,0,99,0,0,0,0,0,0,0,112,111,105,110,116,115,119,105,116,104,116,101,120,0,0,0,100,97,114,107,45,99,121,97,110,0,0,0,0,0,0,0,32,111,110,108,121,10,0,0,85,84,70,0,0,0,0,0,115,101,116,32,99,111,108,111,114,98,111,120,32,37,115,97,108,32,111,114,105,103,105,110,32,0,0,0,0,0,0,0,32,114,103,98,32,34,35,37,54,46,54,120,34,32,0,0,65,108,108,32,112,111,105,110,116,115,32,121,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,0,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,105,115,32,111,110,108,121,32,102,111,114,32,100,97,116,97,102,105,108,101,115,44,32,114,101,118,101,114,116,105,110,103,32,116,111,32,34,112,111,105,110,116,115,34,0,0,0,0,40,98,105,110,100,95,99,111,109,109,97,110,100,41,32,37,115,58,37,100,10,0,0,0,60,61,0,0,0,0,0,0,112,111,105,110,116,115,119,105,116,104,109,101,116,97,112,111,115,116,0,0,0,0,0,0,100,97,114,107,45,109,97,103,101,110,116,97,0,0,0,0,75,80,95,70,51,0,0,0,9,110,111,32,108,111,103,115,99,97,108,105,110,103,10,0,117,116,102,0,0,0,0,0,37,115,61,37,103,0,0,0,68,111,117,98,108,101,86,97,108,117,101,0,0,0,0,0,102,95,115,116,114,102,116,105,109,101,58,32,102,109,116,0,117,115,101,114,0,0,0,0,112,111,105,110,116,115,119,105,116,104,109,112,0,0,0,0,119,101,98,45,98,108,117,101,0,0,0,0,0,0,0,0,32,97,110,100,0,0,0,0,108,111,99,97,108,101,0,0,115,101,116,32,99,111,108,111,114,98,111,120,32,37,115,10,0,0,0,0,0,0,0,0,116,101,120,36,112,111,105,110,116,115,0,0,0,0,0,0,119,101,98,45,103,114,101,101,110,0,0,0,0,0,0,0,9,108,111,103,115,99,97,108,105,110,103,0,0,0,0,0,117,110,107,110,111,119,110,32,45,45,45,32,101,120,112,101,99,116,101,100,32,39,108,111,103,102,105,108,101,39,32,111,114,32,91,110,111,93,101,114,114,111,114,118,97,114,105,97,98,108,101,115,0,0,0,0,65,108,108,32,112,111,105,110,116,115,32,111,102,32,99,111,108,111,114,32,97,120,105,115,32,117,110,100,101,102,105,110,101,100,46,0,0,0,0,0,105,115,111,95,56,56,53,57,95,57,0,0,0,0,0,0,10,35,32,120,32,121,0,0,109,112,36,112,111,105,110,116,115,0,0,0,0,0,0,0,114,101,100,0,0,0,0,0,37,115,32,37,115,32,40,98,97,115,101,32,37,103,41,0,110,111,113,117,105,101,116,0,99,117,98,101,104,101,108,105,120,32,115,116,97,114,116,32,37,46,50,103,32,99,121,99,108,101,115,32,37,46,50,103,32,115,97,116,117,114,97,116,105,111,110,32,37,46,50,103,10,0,0,0,0,0,0,0,51,54,48,32,109,117,108,32,115,105,110,0,0,0,0,0,116,101,120,116,115,99,97,108,101,0,0,0,0,0,0,0,100,97,114,107,45,103,114,101,121,0,0,0,0,0,0,0,9,111,102,102,115,101,116,115,32,97,114,101,0,0,0,0,113,117,105,101,116,0,0,0,102,117,110,99,116,105,111,110,115,32,37,115,44,32,37,115,44,32,37,115,10,0,0,0,112,117,115,104,100,49,0,0,102,111,110,116,115,99,97,108,101,0,0,0,0,0,0,0,110,101,120,116,102,114,111,109,95,100,121,110,97,114,114,97,121,58,32,100,121,110,97,114,114,97,121,32,119,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,100,33,0,0,9,116,109,97,114,103,105,110,32,105,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,110,111,101,114,114,36,111,114,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,32,41,10,0,0,0,0,0,122,58,115,10,0,0,0,0,108,119,0,0,0,0,0,0,9,116,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,37,103,10,0,0,101,114,114,36,111,114,118,97,114,105,97,98,108,101,115,0,92,10,32,32,32,32,0,0,47,117,115,114,47,115,104,97,114,101,47,103,104,111,115,116,115,99,114,105,112,116,47,102,111,110,116,115,0,0,0,0,37,51,111,37,110,0,0,0,108,105,110,101,119,36,105,100,116,104,0,0,0,0,0,0,99,111,114,110,101,114,115,50,99,36,111,108,111,114,0,0,9,116,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,115,99,114,101,101,110,32,37,103,10,0,0,0,101,120,112,101,99,116,105,110,103,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,99,111,110,99,97,116,101,110,97,116,101,0,0,0,0,0,99,97,110,110,111,116,32,111,112,101,110,32,102,105,108,101,59,32,111,117,116,112,117,116,32,110,111,116,32,99,104,97,110,103,101,100,0,0,0,0,37,115,0,0,0,0,0,0,100,108,0,0,0,0,0,0,101,36,120,112,108,105,99,105,116,0,0,0,0,0,0,0,116,101,115,116,0,0,0,0,9,114,109,97,114,103,105,110,32,105,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,108,111,103,36,102,105,108,101,0,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,0,0,0,0,99,97,36,108,108,0,0,0,32,37,46,52,103,32,37,46,52,103,32,37,46,52,103,32,37,46,52,103,0,0,0,0,115,99,104,97,114,0,0,0,100,97,115,104,108,36,101,110,103,116,104,0,0,0,0,0,110,111,105,36,109,112,108,105,99,105,116,0,0,0,0,0,9,114,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,37,103,10,0,0,101,120,112,101,99,116,105,110,103,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,100,101,102,105,110,101,100,32,40,0,0,0,0,0,0,0,79,117,116,32,111,102,32,109,101,109,111,114,121,32,105,110,32,115,116,97,116,115,58,32,116,111,111,32,109,97,110,121,32,100,97,116,97,112,111,105,110,116,115,32,40,37,100,41,63,0,0,0,0,0,0,0,32,114,103,98,32,34,37,115,34,32,0,0,0,0,0,0,65,108,108,32,112,111,105,110,116,115,32,120,32,118,97,108,117,101,32,117,110,100,101,102,105,110,101,100,0,0,0,0,34,119,105,116,104,34,32,97,108,108,111,119,101,100,32,111,110,108,121,32,97,102,116,101,114,32,112,97,114,97,109,101,116,114,105,99,32,102,117,110,99,116,105,111,110,32,102,117,108,108,121,32,115,112,101,99,105,102,105,101,100,0,0,0,97,108,108,36,119,105,110,100,111,119,115,0,0,0,0,0,62,61,0,0,0,0,0,0,115,113,117,97,114,101,36,100,0,0,0,0,0,0,0,0,110,111,101,36,120,112,108,105,99,105,116,0,0,0,0,0,75,80,95,70,50,0,0,0,9,114,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,115,99,114,101,101,110,32,37,103,10,0,0,0,99,108,111,115,101,100,0,0,70,108,111,97,116,86,97,108,117,101,0,0,0,0,0,0,70,105,114,115,116,32,112,97,114,97,109,101,116,101,114,32,116,111,32,115,116,114,102,116,105,109,101,32,109,117,115,116,32,98,101,32,97,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,0,0,0,0,114,103,98,102,111,114,109,117,108,97,101,32,37,100,44,32,37,100,44,32,37,100,10,0,114,97,36,105,115,101,0,0,100,111,109,97,105,110,0,0,98,101,118,101,108,36,101,100,0,0,0,0,0,0,0,0,105,36,109,112,108,105,99,105,116,0,0,0,0,0,0,0,9,98,109,97,114,103,105,110,32,105,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,78,97,78,0,0,0,0,0,10,115,101,116,32,112,97,108,101,116,116,101,32,0,0,0,119,104,105,99,104,61,61,65,85,84,79,83,67,65,76,69,95,77,73,78,32,124,124,32,119,104,105,99,104,61,61,65,85,84,79,83,67,65,76,69,95,77,65,88,0,0,0,0,109,105,116,101,114,36,101,100,0,0,0,0,0,0,0,0,116,114,36,97,110,115,112,97,114,101,110,116,0,0,0,0,9,98,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,37,103,10,0,0,108,97,121,101,114,100,36,101,102,97,117,108,116,0,0,0,87,97,114,110,105,110,103,32,45,32,100,105,102,102,105,99,117,108,116,121,32,102,105,116,116,105,110,103,32,112,108,111,116,32,116,105,116,108,101,115,32,105,110,116,111,32,107,101,121,0,0,0,0,0,0,0,115,97,118,101,46,99,0,0,115,111,36,108,105,100,0,0,110,111,115,111,36,108,105,100,0,0,0,0,0,0,0,0,9,98,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,115,99,114,101,101,110,32,37,103,10,0,0,0,110,111,112,111,36,108,97,114,0,0,0,0,0,0,0,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,108,32,39,37,99,39,46,10,0,124,99,111,115,40,49,56,48,120,41,124,0,0,0,0,0,100,97,36,115,104,101,100,0,110,111,116,114,36,97,110,115,112,97,114,101,110,116,0,0,9,108,109,97,114,103,105,110,32,105,115,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,112,111,36,108,97,114,0,0,88,89,90,32,0,0,0,0,107,101,121,119,111,114,100,32,39,100,97,116,97,39,32,100,101,112,114,101,99,97,116,101,100,44,32,117,115,101,32,39,115,104,111,119,32,115,116,121,108,101,32,100,97,116,97,39,0,0,0,0,0,0,0,0,109,111,110,111,36,99,104,114,111,109,101,0,0,0,0,0,9,108,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,37,103,10,0,0,110,111,114,36,116,105,99,115,0,0,0,0,0,0,0,0,89,73,81,32,0,0,0,0,122,10,0,0,0,0,0,0,99,111,108,36,111,117,114,0,110,111,104,105,36,100,100,101,110,51,100,0,0,0,0,0,9,108,109,97,114,103,105,110,32,105,115,32,115,101,116,32,116,111,32,115,99,114,101,101,110,32,37,103,10,0,0,0,110,111,109,99,98,36,116,105,99,115,0,0,0,0,0,0,67,77,89,32,0,0,0,0,47,117,115,114,47,108,105,98,47,88,49,49,47,102,111,110,116,115,33,0,0,0,0,0,37,52,111,37,110,0,0,0,97,114,114,111,119,32,110,111,116,32,102,111,117,110,100,0,99,111,108,36,111,114,0,0,104,105,36,100,100,101,110,51,100,0,0,0,0,0,0,0,9,111,117,116,112,117,116,32,105,115,32,115,101,110,116,32,116,111,32,83,84,68,79,85,84,10,0,0,0,0,0,0,110,111,99,98,36,116,105,99,115,0,0,0,0,0,0,0,72,83,86,32,0,0,0,0,100,111,108,108,97,114,115,0,119,98,0,0,0,0,0,0,101,110,108,0,0,0,0,0,110,111,104,101,97,100,101,114,0,0,0,0,0,0,0,0,109,97,112,0,0,0,0,0,115,121,36,115,116,101,109,0,9,111,117,116,112,117,116,32,105,115,32,115,101,110,116,32,116,111,32,39,37,115,39,10,0,0,0,0,0,0,0,0,110,111,109,121,50,36,116,105,99,115,0,0,0,0,0,0,115,117,109,120,121,0,0,0,82,71,66,32,0,0,0,0,71,78,85,80,76,79,84,95,80,83,95,68,73,82,32,32,32,32,32,61,32,34,37,115,34,10,0,0,0,0,0,0,99,104,97,114,0,0,0,0,104,101,97,100,101,114,0,0,105,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,37,99,0,0,0,0,99,108,105,112,52,36,105,110,0,0,0,0,0,0,0,0,9,112,114,105,110,116,32,111,117,116,112,117,116,32,105,115,32,115,101,110,116,32,116,111,32,39,37,115,39,10,0,0,110,111,109,120,50,36,116,105,99,115,0,0,0,0,0,0,99,111,108,111,114,32,109,111,100,101,108,32,0,0,0,0,32,114,103,98,32,118,97,114,105,97,98,108,101,32,0,0,110,111,32,102,117,110,99,116,105,111,110,115,32,111,114,32,100,97,116,97,32,116,111,32,112,108,111,116,0,0,0,0,42,0,0,0,0,0,0,0,110,111,116,105,109,101,36,115,116,97,109,112,0,0,0,0,99,108,105,112,49,36,105,110,0,0,0,0,0,0,0,0,75,80,95,70,49,0,0,0,9,100,101,102,97,117,108,116,32,115,121,115,116,101,109,32,100,105,114,101,99,116,111,114,121,32,34,37,115,34,10,0,110,111,109,122,36,116,105,99,115,0,0,0,0,0,0,0,98,101,108,111,119,32,0,0,83,105,103,110,101,100,76,111,110,103,0,0,0,0,0,0,102,95,103,112,114,105,110,116,102,0,0,0,0,0,0,0,103,114,97,121,10,0,0,0,116,105,109,101,36,115,116,97,109,112,0,0,0,0,0,0,110,111,102,116,114,36,105,97,110,103,108,101,115,0,0,0,110,111,109,121,36,116,105,99,115,0,0,0,0,0,0,0,103,97,109,109,97,32,37,103,32,0,0,0,0,0,0,0,99,111,110,116,111,117,114,32,99,111,111,114,100,115,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,111,117,116,32,111,102,32,109,101,109,111,114,121,32,105,110,32,115,116,97,116,115,0,0,115,116,97,110,100,36,97,108,111,110,101,0,0,0,0,0,102,116,114,36,105,97,110,103,108,101,115,0,0,0,0,0,9,101,110,118,105,114,111,110,109,101,110,116,32,118,97,114,105,97,98,108,101,32,71,78,85,80,76,79,84,95,80,83,95,68,73,82,58,32,0,0,110,111,109,120,36,116,105,99,115,0,0,0,0,0,0,0,115,101,116,32,116,101,114,109,105,110,97,108,32,37,115,32,37,115,10,0,0,0,0,0,98,111,117,110,100,97,114,121,0,0,0,0,0,0,0,0,35,32,67,111,110,116,111,117,114,58,32,112,111,105,110,116,115,32,37,105,44,32,122,32,37,103,44,32,108,97,98,101,108,58,32,37,115,10,0,0,105,110,112,36,117,116,0,0,102,108,36,117,115,104,0,0,110,111,110,101,0,0,0,0,110,111,121,50,36,116,105,99,115,0,0,0,0,0,0,0,117,115,101,32,39,115,101,116,32,116,101,114,109,39,32,116,111,32,115,101,116,32,116,101,114,109,105,110,97,108,32,116,121,112,101,32,102,105,114,115,116,0,0,0,0,0,0,0,49,56,48,32,109,117,108,32,99,111,115,32,97,98,115,0,100,101,102,97,117,108,116,115,105,122,101,0,0,0,0,0,100,101,112,36,116,104,111,114,100,101,114,0,0,0,0,0,110,111,120,50,36,116,105,99,115,0,0,0,0,0,0,0,110,101,103,97,116,105,118,101,0,0,0,0,0,0,0,0,45,104,0,0,0,0,0,0,115,105,122,101,0,0,0,0,115,99,97,110,115,97,117,116,111,36,109,97,116,105,99,0,9,100,105,114,101,99,116,111,114,121,32,102,114,111,109,32,39,115,101,116,32,112,115,100,105,114,39,58,32,0,0,0,110,111,122,36,116,105,99,115,0,0,0,0,0,0,0,0,112,111,115,105,116,105,118,101,0,0,0,0,0,0,0,0,37,115,58,0,0,0,0,0,101,120,112,114,101,115,115,105,111,110,32,101,120,112,101,99,116,101,100,0,0,0,0,0,100,36,101,102,97,117,108,116,0,0,0,0,0,0,0,0,115,99,97,110,115,98,97,99,107,36,119,97,114,100,0,0,9,112,97,114,97,109,101,116,114,105,99,32,105,115,32,37,115,10,0,0,0,0,0,0,110,111,121,36,116,105,99,115,0,0,0,0,0,0,0,0,115,101,116,32,112,97,108,101,116,116,101,32,37,115,32,37,115,32,109,97,120,99,111,108,111,114,115,32,37,100,32,0,47,117,115,114,47,88,49,49,82,54,47,108,105,98,47,88,49,49,47,102,111,110,116,115,47,116,114,117,101,116,121,112,101,0,0,0,0,0,0,0,119,97,114,110,105,110,103,58,32,0,0,0,0,0,0,0,101,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,115,32,116,111,32,117,110,115,101,116,32,97,114,114,111,119,0,0,0,0,0,115,105,122,101,58,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,115,99,97,110,115,102,111,114,36,119,97,114,100,0,0,0,35,37,48,50,120,37,48,50,120,37,48,50,120,32,61,32,37,51,105,32,37,51,105,32,37,51,105,0,0,0,0,0,110,111,120,36,116,105,99,115,0,0,0,0,0,0,0,0,99,37,105,0,0,0,0,0,98,111,111,108,0,0,0,0,99,97,110,110,111,116,32,99,114,101,97,116,101,32,112,105,112,101,59,32,111,117,116,112,117,116,32,110,111,116,32,99,104,97,110,103,101,100,0,0,10,35,32,67,111,110,116,111,117,114,32,37,100,44,32,108,97,98,101,108,58,32,37,115,10,0,0,0,0,0,0,0,105,110,36,99,104,101,115,0,105,110,116,101,114,112,36,111,108,97,116,101,0,0,0,0,115,116,36,97,116,115,0,0,10,32,32,37,45,49,56,115,32,0,0,0,0,0,0,0,105,103,110,111,114,105,110,103,32,108,101,102,116,47,99,101,110,116,101,114,47,114,105,103,104,116,59,32,105,110,99,111,109,112,97,116,105,98,108,101,32,119,105,116,104,32,108,109,97,114,103,105,110,47,116,109,97,114,103,105,110,46,0,0,99,111,114,114,101,108,97,116,105,111,110,0,0,0,0,0,114,101,112,108,111,116,0,0,101,120,116,101,110,100,32,116,111,107,101,110,32,116,97,98,108,101,0,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,110,117,112,108,111,116,47,52,46,54,47,103,110,117,112,108,111,116,46,103,105,104,0,0,0,0,0,0,0,0,122,114,116,0,0,0,0,0,115,105,122,101,32,114,101,113,117,105,114,101,115,32,116,119,111,32,110,117,109,98,101,114,115,58,32,32,120,115,105,122,101,44,32,121,115,105,122,101,0,0,0,0,0,0,0,0,88,89,90,0,0,0,0,0,9,84,104,101,114,101,32,97,114,101,32,37,100,32,112,114,101,100,101,102,105,110,101,100,32,99,111,108,111,114,32,110,97,109,101,115,58,0,0,0,111,102,36,102,115,101,116,0,105,103,110,111,114,105,110,103,32,116,111,112,47,99,101,110,116,101,114,47,98,111,116,116,111,109,59,32,105,110,99,111,109,112,97,116,105,98,108,101,32,119,105,116,104,32,116,109,97,114,103,105,110,47,98,109,97,114,103,105,110,46,0,0,32,112,97,108,101,116,116,101,32,102,114,97,99,116,105,111,110,32,37,52,46,50,102,0,105,103,110,111,114,105,110,103,32,116,114,97,105,108,105,110,103,32,99,111,109,109,97,32,105,110,32,112,108,111,116,32,99,111,109,109,97,110,100,0,46,103,110,117,112,108,111,116,0,0,0,0,0,0,0,0,60,0,0,0,0,0,0,0,117,115,97,103,101,58,32,114,97,105,115,101,32,123,112,108,111,116,95,105,100,125,0,0,119,32,61,32,48,32,105,110,32,71,105,118,101,110,115,40,41,59,32,32,67,106,106,32,61,32,37,103,44,32,32,67,105,106,32,61,32,37,103,0,67,97,110,39,116,32,99,97,108,99,117,108,97,116,101,32,97,112,112,114,111,120,105,109,97,116,105,111,110,32,115,112,108,105,110,101,115,44,32,110,101,101,100,32,97,116,32,108,101,97,115,116,32,52,32,112,111,105,110,116,115,0,0,0,102,111,110,116,32,34,37,115,44,37,103,34,0,0,0,0,89,73,81,0,0,0,0,0,75,80,95,84,97,98,0,0,102,105,108,108,101,100,95,112,111,108,121,103,111,110,95,122,102,105,120,32,99,111,114,110,101,114,115,0,0,0,0,0,37,105,9,37,105,9,37,105,10,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,107,101,121,32,111,112,116,105,111,110,0,0,0,0,0,0,97,98,111,118,101,32,0,0,85,110,115,105,103,110,101,100,76,111,110,103,0,0,0,0,70,105,114,115,116,32,112,97,114,97,109,101,116,101,114,32,116,111,32,103,112,114,105,110,116,102,32,109,117,115,116,32,98,101,32,97,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,0,0,0,0,0,99,97,110,32,111,110,108,121,32,100,111,32,101,108,108,105,112,116,105,99,32,105,110,116,101,103,114,97,108,115,32,111,102,32,114,101,97,108,115,0,109,112,112,111,105,110,116,115,32,0,0,0,0,0,0,0,67,77,89,0,0,0,0,0,37,48,46,52,102,9,37,48,46,52,102,9,37,48,46,52,102,10,0,0,0,0,0,0,97,36,117,116,111,109,97,116,105,99,0,0,0,0,0,0,114,101,99,117,114,115,105,111,110,32,100,101,112,116,104,32,108,105,109,105,116,32,101,120,99,101,101,100,101,100,0,0,116,105,99,107,32,105,110,116,101,114,118,97,108,32,116,111,111,32,115,109,97,108,108,32,102,111,114,32,109,97,99,104,105,110,101,32,112,114,101,99,105,115,105,111,110,0,0,0,116,101,120,112,111,105,110,116,115,32,0,0,0,0,0,0,72,83,86,0,0,0,0,0,46,10,0,0,0,0,0,0,99,111,108,36,117,109,110,104,101,97,100,101,114,0,0,0,95,94,0,0,0,0,0,0,115,111,108,105,100,0,0,0,82,71,66,0,0,0,0,0,32,115,97,118,101,100,32,116,111,32,34,37,115,34,46,0,77,117,108,116,105,112,108,101,32,115,116,97,99,107,32,100,105,114,101,99,116,105,111,110,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,32,99,111,114,110,101,114,115,50,99,111,108,111,114,32,0,115,105,110,40,49,56,48,120,41,0,0,0,0,0,0,0,100,97,115,104,101,100,0,0,99,117,98,101,104,101,108,105,120,0,0,0,0,0,0,0,67,111,108,111,114,0,0,0,77,117,108,116,105,112,108,101,32,108,111,99,97,116,105,111,110,32,114,101,103,105,111,110,32,115,101,116,116,105,110,103,115,0,0,0,0,0,0,0,32,110,111,104,105,100,100,101,110,51,100,0,0,0,0,0,105,110,118,101,114,115,101,95,101,114,114,111,114,95,102,117,110,99,58,32,84,104,101,32,118,97,108,117,101,32,111,117,116,32,111,102,32,116,104,101,32,114,97,110,103,101,32,111,102,32,116,104,101,32,102,117,110,99,116,105,111,110,0,0,32,37,115,32,100,97,115,104,108,101,110,103,116,104,32,37,103,32,108,105,110,101,119,105,100,116,104,32,37,103,32,102,111,110,116,115,99,97,108,101,32,37,103,32,92,10,32,32,32,0,0,0,0,0,0,0,103,97,109,36,109,97,0,0,71,114,97,121,0,0,0,0,77,117,108,116,105,112,108,101,32,104,111,114,105,122,111,110,116,97,108,32,112,111,115,105,116,105,111,110,32,115,101,116,116,105,110,103,115,0,0,0,32,104,105,100,100,101,110,51,100,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,102,111,114,109,97,116,32,61,32,0,0,0,0,0,0,0,114,111,117,110,100,0,0,0,109,97,120,99,36,111,108,111,114,115,0,0,0,0,0,0,37,115,32,112,97,108,101,116,116,101,32,119,105,116,104,32,37,105,32,100,105,115,99,114,101,116,101,32,99,111,108,111,114,115,0,0,0,0,0,0,77,117,108,116,105,112,108,101,32,118,101,114,116,105,99,97,108,32,112,111,115,105,116,105,111,110,32,115,101,116,116,105,110,103,115,0,0,0,0,0,32,104,105,100,100,101,110,51,100,32,37,100,0,0,0,0,47,117,115,114,47,88,49,49,82,54,47,108,105,98,47,88,49,49,47,102,111,110,116,115,47,84,121,112,101,49,0,0,71,80,86,65,76,95,69,82,82,77,83,71,0,0,0,0,116,121,120,0,0,0,0,0,98,101,118,101,108,101,100,32,0,0,0,0,0,0,0,0,112,115,95,97,108,108,99,70,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,110,111,32,111,112,116,105,111,110,32,111,114,32,105,110,116,32,111,114,32,102,108,111,97,116,0,0,0,0,0,102,105,108,108,95,110,117,109,98,101,114,115,32,99,108,111,115,105,110,103,0,0,0,0,102,116,114,105,97,110,103,108,101,115,0,0,0,0,0,0,102,97,99,116,111,114,105,97,108,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,37,99,10,0,0,0,0,0,114,111,117,110,100,101,100,32,0,0,0,0,0,0,0,0,110,111,112,115,95,97,108,108,99,70,0,0,0,0,0,0,115,112,36,108,111,116,0,0,105,36,110,116,0,0,0,0,115,116,114,105,110,103,32,101,120,112,101,99,116,101,100,0,105,110,116,101,114,99,101,112,116,0,0,0,0,0,0,0,32,110,111,0,0,0,0,0,71,78,85,72,69,76,80,0,116,122,114,0,0,0,0,0,109,105,116,101,114,101,100,32,0,0,0,0,0,0,0,0,109,111,36,100,101,108,0,0,102,36,108,111,97,116,0,0,110,111,112,111,36,105,110,116,0,0,0,0,0,0,0,0,102,105,108,108,95,110,117,109,98,101,114,115,32,114,101,115,105,122,101,32,112,97,116,116,101,114,110,0,0,0,0,0,67,111,110,102,108,105,99,116,32,98,101,116,119,101,101,110,32,115,111,109,101,32,109,97,116,114,105,120,32,98,105,110,97,114,121,32,97,110,100,32,103,101,110,101,114,97,108,32,98,105,110,97,114,121,32,107,101,121,119,111,114,100,115,0,32,112,97,108,101,116,116,101,32,99,98,32,37,103,0,0,115,97,109,112,108,101,115,32,111,114,32,105,115,111,95,115,97,109,112,108,101,115,32,60,32,50,46,32,77,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,46,0,103,110,117,112,108,111,116,114,99,0,0,0,0,0,0,0,62,0,0,0,0,0,0,0,117,115,97,103,101,58,32,108,111,119,101,114,32,123,112,108,111,116,95,105,100,125,0,0,109,111,110,111,99,104,114,111,109,101,32,0,0,0,0,0,102,117,110,99,36,116,105,111,110,115,0,0,0,0,0,0,75,80,95,83,112,97,99,101,0,0,0,0,0,0,0,0,112,97,108,101,116,116,101,32,115,105,122,101,32,114,101,113,117,105,114,101,100,0,0,0,102,105,108,108,95,110,117,109,98,101,114,115,32,110,101,120,116,32,110,117,109,98,101,114,0,0,0,0,0,0,0,0,115,121,110,116,97,120,32,105,115,32,120,121,61,60,120,62,44,60,121,62,0,0,0,0,83,105,103,110,101,100,73,110,116,101,103,101,114,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,105,110,118,97,108,105,100,32,115,112,101,99,95,116,121,112,101,0,0,0,0,0,0,0,76,97,115,116,32,108,105,110,101,32,109,117,115,116,32,110,111,116,32,98,101,32,98,101,102,111,114,101,32,102,105,114,115,116,32,108,105,110,101,0,99,111,108,111,114,32,0,0,102,105,108,101,0,0,0,0,37,51,105,46,32,103,114,97,121,61,37,48,46,52,102,44,32,40,114,44,103,44,98,41,61,40,37,48,46,52,102,44,37,48,46,52,102,44,37,48,46,52,102,41,44,32,35,37,48,50,120,37,48,50,120,37,48,50,120,32,61,32,37,51,105,32,37,51,105,32,37,51,105,10,0,0,0,0,0,0,99,111,110,115,116,97,110,116,32,101,120,112,114,101,115,115,105,111,110,32,101,120,112,101,99,116,101,100,0,0,0,0,98,101,103,105,110,0,0,0,76,97,115,116,32,112,111,105,110,116,32,109,117,115,116,32,110,111,116,32,98,101,32,98,101,102,111,114,101,32,102,105,114,115,116,32,112,111,105,110,116,0,0,0,0,0,0,0,84,111,111,32,109,97,110,121,32,97,120,105,115,32,116,105,99,107,115,32,114,101,113,117,101,115,116,101,100,32,40,62,37,46,48,103,41,0,0,0,102,117,110,99,116,105,111,110,32,37,115,32,114,101,113,117,105,114,101,115,32,37,100,32,118,97,114,105,97,98,108,101,115,0,0,0,0,0,0,0,34,32,92,10,32,32,32,0,100,101,102,36,105,110,101,100,0,0,0,0,0,0,0,0,9,99,111,108,111,114,32,109,97,112,112,105,110,103,32,42,110,111,116,42,32,100,111,110,101,32,98,121,32,100,101,102,105,110,101,100,32,103,114,97,100,105,101,110,116,46,10,0,102,105,108,108,95,110,117,109,98,101,114,115,32,111,117,116,112,117,116,32,98,117,102,102,101,114,0,0,0,0,0,0,69,120,112,101,99,116,101,100,32,110,111,110,45,110,101,103,97,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,34,0,0,0,0,0,0,0,114,103,98,36,102,111,114,109,117,108,97,101,0,0,0,0,9,32,32,42,32,116,104,117,115,32,116,104,101,32,114,97,110,103,101,115,32,105,110,32,96,115,101,116,32,112,109,51,100,32,114,103,98,102,111,114,109,117,108,97,101,39,32,97,114,101,32,45,37,105,46,46,37,105,10,0,0,0,0,0,112,111,105,110,116,116,36,121,112,101,0,0,0,0,0,0,32,102,108,117,115,104,32,0,69,120,112,101,99,116,101,100,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,49,56,48,32,109,117,108,32,115,105,110,0,0,0,0,0,92,10,32,32,32,104,101,97,100,101,114,32,0,0,0,0,9,32,32,42,32,110,101,103,97,116,105,118,101,32,110,117,109,98,101,114,115,32,109,101,97,110,32,105,110,118,101,114,116,101,100,61,110,101,103,97,116,105,118,101,32,99,111,108,111,117,114,32,99,111,109,112,111,110,101,110,116,10,0,0,108,105,110,101,116,36,121,112,101,0,0,0,0,0,0,0,115,101,116,32,112,109,51,100,32,105,110,116,101,114,112,111,108,97,116,101,32,37,100,44,37,100,0,0,0,0,0,0,73,110,100,101,120,32,115,116,101,112,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,0,0,0,0,0,110,111,104,101,97,100,101,114,32,92,10,32,32,32,0,0,78,111,32,115,117,99,104,32,111,112,116,105,111,110,32,116,111,32,104,105,100,100,101,110,51,100,32,40,111,114,32,119,114,111,110,103,32,111,114,100,101,114,41,0,0,0,0,0,103,114,101,121,0,0,0,0,37,50,105,58,32,37,45,49,53,115,0,0,0,0,0,0,100,101,112,116,104,111,114,100,101,114,10,0,0,0,0,0,85,112,112,101,114,32,105,110,100,101,120,32,115,104,111,117,108,100,32,98,101,32,98,105,103,103,101,114,32,116,104,97,110,32,108,111,119,101,114,32,105,110,100,101,120,0,0,0,70,73,84,58,32,32,32,32,100,97,116,97,32,114,101,97,100,32,102,114,111,109,32,37,115,10,0,0,0,0,0,0,110,111,116,105,109,101,115,116,97,109,112,0,0,0,0,0,10,9,32,32,32,32,0,0,115,99,97,110,115,98,97,99,107,119,97,114,100,10,0,0,66,105,110,97,114,121,32,109,97,116,114,105,120,32,102,105,108,101,32,102,111,114,109,97,116,32,100,111,101,115,32,110,111,116,32,97,108,108,111,119,32,109,111,114,101,32,116,104,97,110,32,111,110,101,32,115,117,114,102,97,99,101,32,112,101,114,32,102,105,108,101,0,67,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,112,111,105,110,116,115,39,44,32,39,111,110,101,39,44,32,111,114,32,39,116,119,111,39,0,0,0,0,0,76,73,78,69,83,0,0,0,116,105,109,101,115,116,97,109,112,0,0,0,0,0,0,0,110,101,103,36,97,116,105,118,101,0,0,0,0,0,0,0,9,32,32,42,32,116,104,101,114,101,32,97,114,101,32,37,105,32,97,118,97,105,108,97,98,108,101,32,114,103,98,32,99,111,108,111,114,32,109,97,112,112,105,110,103,32,102,111,114,109,117,108,97,101,58,0,99,101,110,116,114,101,0,0,115,99,97,110,115,102,111,114,119,97,114,100,10,0,0,0,112,111,119,101,114,0,0,0,73,110,32,109,117,108,116,105,112,108,111,116,32,109,111,100,101,32,121,111,117,32,99,97,110,39,116,32,99,104,97,110,103,101,32,116,104,101,32,111,117,116,112,117,116,10,0,0,32,100,101,108,116,97,95,120,32,100,101,108,116,97,95,121,32,100,101,108,116,97,95,122,0,0,0,0,0,0,0,0,105,110,112,117,116,0,0,0,112,111,115,36,105,116,105,118,101,0,0,0,0,0,0,0,115,104,36,111,119,0,0,0,9,84,104,101,32,98,101,115,116,32,109,97,116,99,104,32,111,102,32,116,104,101,32,99,117,114,114,101,110,116,32,112,97,108,101,116,116,101,32,99,111,114,114,101,115,112,111,110,100,115,32,116,111,10,9,32,32,32,32,115,101,116,32,112,97,108,101,116,116,101,32,114,103,98,102,111,114,109,117,108,97,101,32,37,105,44,37,105,44,37,105,10,0,0,0,0,115,108,111,112,101,0,0,0,115,99,97,110,115,97,117,116,111,109,97,116,105,99,10,0,102,70,101,69,103,71,0,0,67,111,109,112,105,108,101,32,111,112,116,105,111,110,115,58,10,37,115,10,0,0,0,0,115,116,97,110,100,97,108,111,110,101,0,0,0,0,0,0,114,116,122,0,0,0,0,0,98,97,36,99,107,0,0,0,102,111,114,109,117,108,97,101,32,112,116,115,0,0,0,0,112,111,36,105,110,116,0,0,32,97,116,32,37,115,10,0,43,45,35,48,49,50,51,52,53,54,55,56,57,46,0,0,32,112,97,108,101,116,116,101,32,122,0,0,0,0,0,0,121,32,114,97,110,103,101,0,110,101,0,0,0,0,0,0,115,105,122,101,32,37,103,37,115,44,37,103,37,115,32,37,115,32,37,115,32,37,115,0,102,114,36,111,110,116,0,0,66,101,103,105,110,0,0,0,102,111,114,109,117,108,97,101,0,0,0,0,0,0,0,0,116,109,112,32,108,111,97,100,112,97,116,104,0,0,0,0,101,120,112,108,105,99,105,116,0,0,0,0,0,0,0,0,102,95,115,112,114,105,110,116,102,58,32,97,116,116,101,109,112,116,32,116,111,32,112,114,105,110,116,32,115,116,114,105,110,103,32,118,97,108,117,101,32,119,105,116,104,32,110,117,109,101,114,105,99,32,102,111,114,109,97,116,0,0,0,0,85,110,115,105,103,110,101,100,73,110,116,101,103,101,114,0,116,105,99,108,97,98,101,108,115,32,109,117,115,116,32,99,111,109,101,32,102,114,111,109,32,97,32,114,101,97,108,32,99,111,108,117,109,110,0,0,101,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,32,105,110,32,115,101,116,32,116,101,114,109,105,110,97,108,32,37,115,0,0,102,111,114,109,117,108,97,101,83,101,113,0,0,0,0,0,116,109,112,32,102,111,110,116,112,97,116,104,0,0,0,0,105,109,112,108,105,99,105,116,0,0,0,0,0,0,0,0,102,111,114,109,97,116,32,109,117,115,116,32,104,97,118,101,32,49,45,55,32,99,111,110,118,101,114,115,105,111,110,115,32,111,102,32,116,121,112,101,32,100,111,117,98,108,101,32,40,37,37,108,102,41,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,117,110,107,110,111,119,110,32,116,105,99,32,116,121,112,101,0,0,0,0,0,0,0,71,110,117,112,108,111,116,32,119,97,115,32,98,117,105,108,116,32,119,105,116,104,111,117,116,32,115,117,112,112,111,114,116,32,102,111,114,32,80,78,71,32,105,109,97,103,101,115,46,32,89,111,117,32,99,97,110,110,111,116,32,117,115,101,32,116,104,105,115,32,111,112,116,105,111,110,32,117,110,108,101,115,115,32,121,111,117,32,114,101,98,117,105,108,100,32,103,110,117,112,108,111,116,46,0,0,0,0,0,0,0,0,111,36,114,105,103,105,110,0,82,71,66,32,112,116,115,0,101,120,112,101,99,116,101,100,32,115,116,114,105,110,103,0,115,101,116,32,112,109,51,100,32,0,0,0,0,0,0,0,99,111,114,110,101,114,115,32,102,111,114,32,102,105,108,108,101,100,99,117,114,118,101,115,0,0,0,0,0,0,0,0,67,111,108,117,109,110,32,109,117,115,116,32,98,101,32,62,61,32,45,50,0,0,0,0,83,116,114,105,110,103,32,99,111,110,116,97,105,110,105,110,103,32,104,101,97,100,101,114,32,105,110,102,111,114,109,97,116,105,111,110,32,101,120,112,101,99,116,101,100,0,0,0,110,111,98,111,36,114,100,101,114,0,0,0,0,0,0,0,9,67,117,114,114,101,110,116,32,112,97,108,101,116,116,101,32,105,115,10,9,32,32,32,32,115,101,116,32,112,97,108,101,116,116,101,32,114,103,98,102,111,114,109,117,108,97,101,32,37,105,44,37,105,44,37,105,10,0,0,0,0,0,0,108,111,103,32,98,97,115,101,32,109,117,115,116,32,98,101,32,62,32,49,46,48,59,32,108,111,103,115,99,97,108,101,32,117,110,99,104,97,110,103,101,100,0,0,0,0,0,0,115,101,116,32,108,111,99,97,108,101,32,34,37,115,34,10,0,0,0,0,0,0,0,0,40,50,120,45,49,41,94,50,0,0,0,0,0,0,0,0,10,92,115,116,97,114,116,116,101,120,116,10,10,0,0,0,98,100,36,101,102,97,117,108,116,0,0,0,0,0,0,0,100,111,112,108,111,116,0,0])
.concat([69,120,112,101,99,116,105,110,103,32,39,103,114,97,100,105,101,110,116,39,32,111,114,32,39,112,97,108,101,116,116,101,32,60,110,62,39,32,111,114,32,39,114,103,98,102,111,114,109,117,108,97,101,39,32,111,114,32,39,99,111,108,111,114,110,97,109,101,115,39,0,0,115,101,116,32,116,109,97,114,103,105,110,32,37,115,32,37,103,10,0,0,0,0,0,0,99,98,116,105,99,36,108,97,98,101,108,115,0,0,0,0,101,120,116,101,114,110,97,108,0,0,0,0,0,0,0,0,98,111,36,114,100,101,114,0,102,105,116,50,114,103,98,36,102,111,114,109,117,108,97,101,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,99,97,114,116,101,115,105,97,110,39,44,32,39,115,112,104,101,114,105,99,97,108,39,44,32,111,114,32,39,99,121,108,105,110,100,114,105,99,97,108,39,0,0,0,0,115,101,116,32,114,109,97,114,103,105,110,32,37,115,32,37,103,10,0,0,0,0,0,0,122,116,105,99,36,108,97,98,101,108,115,0,0,0,0,0,37,115,10,10,0,0,0,0,105,110,108,105,110,101,0,0,117,36,115,101,114,0,0,0,99,111,108,111,114,36,110,97,109,101,115,0,0,0,0,0,99,121,36,108,105,110,100,114,105,99,97,108,0,0,0,0,115,101,116,32,98,109,97,114,103,105,110,32,37,115,32,37,103,10,0,0,0,0,0,0,121,50,116,105,99,36,108,97,98,101,108,115,0,0,0,0,9,103,110,117,112,108,111,116,32,76,67,95,78,85,77,69,82,73,67,32,37,115,10,0,37,46,49,50,48,115,0,0,116,36,119,111,0,0,0,0,32,32,32,32,105,109,97,103,101,115,61,37,115,93,32,37,37,32,42,105,110,108,105,110,101,42,32,124,32,101,120,116,101,114,110,97,108,32,40,105,110,108,105,110,101,32,111,110,108,121,32,119,111,114,107,115,32,105,110,32,77,75,73,86,44,32,101,120,116,101,114,110,97,108,32,114,101,113,117,105,114,101,115,32,112,110,103,32,115,117,112,112,111,114,116,32,105,110,32,103,110,117,112,108,111,116,41,10,0,0,0,0,104,36,111,114,105,122,111,110,116,97,108,0,0,0,0,0,115,36,112,104,101,114,105,99,97,108,0,0,0,0,0,0,97,116,32,115,99,114,101,101,110,0,0,0,0,0,0,0,121,95,109,105,110,51,100,32,115,104,111,117,108,100,32,110,111,116,32,101,113,117,97,108,32,121,95,109,97,120,51,100,33,0,0,0,0,0,0,0,121,116,105,99,36,108,97,98,101,108,115,0,0,0,0,0,109,111,100,0,0,0,0,0,100,101,115,116,32,61,61,32,78,85,76,76,32,124,124,32,100,101,115,116,32,33,61,32,111,117,116,115,116,114,0,0,10,35,32,73,115,111,67,117,114,118,101,32,37,100,44,32,37,100,32,112,111,105,110,116,115,10,35,32,120,32,121,32,122,0,0,0,0,0,0,0,116,101,120,0,0,0,0,0,118,36,101,114,116,105,99,97,108,0,0,0,0,0,0,0,115,104,101,36,108,108,0,0,114,103,98,102,111,114,36,109,117,108,97,101,0,0,0,0,99,97,36,114,116,101,115,105,97,110,0,0,0,0,0,0,37,115,9,37,102,10,0,0,115,101,116,32,108,109,97,114,103,105,110,32,37,115,32,37,103,10,0,0,0,0,0,0,120,50,116,105,99,36,108,97,98,101,108,115,0,0,0,0,108,36,111,110,103,0,0,0,109,101,116,97,112,111,115,116,0,0,0,0,0,0,0,0,114,122,116,0,0,0,0,0,116,105,109,101,0,0,0,0,103,114,97,36,100,105,101,110,116,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,115,99,114,101,101,110,32,60,102,114,97,99,116,105,111,110,62,39,0,0,0,115,101,116,32,122,101,114,111,32,37,103,10,0,0,0,0,120,116,105,99,36,108,97,98,101,108,115,0,0,0,0,0,32,108,105,110,101,115,116,121,108,101,32,37,100,0,0,0,120,32,114,97,110,103,101,0,99,111,108,117,109,110,104,101,97,100,0,0,0,0,0,0,114,99,102,105,108,101,0,0,101,113,0,0,0,0,0,0,32,32,32,32,112,111,105,110,116,115,61,37,115,44,32,37,37,32,42,109,101,116,97,112,111,115,116,42,32,124,32,116,101,120,32,40,83,104,111,117,108,100,32,112,111,105,110,116,115,32,98,101,32,100,114,97,119,110,32,119,105,116,104,32,77,101,116,97,80,111,115,116,32,111,114,32,84,101,88,63,41,10,0,0,0,0,0,0,116,101,114,109,36,105,110,97,108,0,0,0,0,0,0,0,69,110,100,0,0,0,0,0,115,99,36,114,101,101,110,0,102,95,115,112,114,105,110,116,102,58,32,97,116,116,101,109,112,116,32,116,111,32,112,114,105,110,116,32,110,117,109,101,114,105,99,32,118,97,108,117,101,32,119,105,116,104,32,115,116,114,105,110,103,32,102,111,114,109,97,116,0,0,0,0,83,105,103,110,101,100,83,104,111,114,116,0,0,0,0,0,32,32,32,32,37,37,102,111,110,116,115,99,97,108,101,61,37,103,44,32,37,37,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,102,111,114,32,116,101,120,116,32,108,97,98,101,108,115,10,0,0,110,111,111,112,97,113,117,101,0,0,0,0,0,0,0,0,9,103,97,109,109,97,32,105,115,32,37,46,52,103,10,0,101,120,116,114,97,32,99,104,97,114,115,32,97,102,116,101,114,32,60,115,101,112,97,114,97,116,105,111,110,95,99,104,97,114,62,0,0,0,0,0,107,101,121,32,101,110,116,114,121,0,0,0,0,0,0,0,10,37,72,58,37,77,0,0,32,32,32,32,108,105,110,101,119,105,100,116,104,61,37,103,44,32,37,37,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,102,111,114,32,108,105,110,101,32,119,105,100,116,104,115,32,40,49,46,48,32,109,101,97,110,115,32,48,46,53,98,112,41,10,0,0,111,112,97,113,117,101,0,0,37,115,58,37,100,32,111,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,32,39,37,99,39,46,10,0,0,39,92,116,39,0,0,0,0,104,105,115,116,101,112,115,32,118,97,108,105,100,32,112,111,105,110,116,32,109,97,112,112,105,110,103,0,0,0,0,0,116,101,109,112,32,115,116,114,105,110,103,32,102,111,114,32,108,97,98,101,108,32,104,97,99,107,0,0,0,0,0,0,32,32,32,32,100,97,115,104,108,101,110,103,116,104,61,37,103,44,32,37,37,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,102,111,114,32,100,97,115,104,32,108,101,110,103,116,104,115,10,0,0,109,97,120,114,111,119,36,115,0,0,0,0,0,0,0,0,88,89,90,10,0,0,0,0,34,92,116,34,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,99,111,108,117,109,110,32,60,61,32,48,32,105,110,32,100,97,116,97,102,105,108,101,46,99,0,0,0,0,0,0,0,50,32,109,117,108,32,49,32,115,117,98,32,100,117,112,32,109,117,108,0,0,0,0,0,110,111,0,0,0,0,0,0,109,97,120,99,111,108,117,36,109,110,115,0,0,0,0,0,89,73,81,10,0,0,0,0,101,120,112,101,99,116,101,100,32,34,60,115,101,112,97,114,97,116,111,114,95,99,104,97,114,62,34,0,0,0,0,0,115,101,116,32,116,105,109,101,115,116,97,109,112,32,37,115,32,10,0,0,0,0,0,0,37,49,54,46,51,102,0,0,121,101,115,0,0,0,0,0,109,97,120,99,111,108,36,115,0,0,0,0,0,0,0,0,67,77,89,10,0,0,0,0,119,104,105,116,101,36,115,112,97,99,101,0,0,0,0,0,32,114,111,116,97,116,101,32,112,97,114,97,108,108,101,108,0,0,0,0,0,0,0,0,116,105,109,101,115,116,114,105,110,103,0,0,0,0,0,0,10,10,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,10,0,0,0,0,0,0,32,32,32,32,100,97,115,104,101,100,61,37,115,44,32,37,37,32,42,121,101,115,42,32,124,32,110,111,10,0,0,0,116,101,120,116,36,99,111,108,111,114,0,0,0,0,0,0,84,105,99,32,108,97,98,101,108,32,100,111,101,115,32,110,111,116,32,101,118,97,108,117,97,116,101,32,97,115,32,115,116,114,105,110,103,33,10,0,72,83,86,10,0,0,0,0,101,120,112,101,99,116,101,100,32,115,116,114,105,110,103,32,119,105,116,104,32,99,111,109,109,101,110,116,115,32,99,104,97,114,115,0,0,0,0,0,10,115,101,116,32,37,115,37,115,32,0,0,0,0,0,0,9,103,110,117,112,108,111,116,32,76,67,95,84,73,77,69,32,32,32,32,37,115,10,0,117,116,105,108,46,99,0,0,111,36,110,101,0,0,0,0,44,32,37,37,32,42,98,117,116,116,42,32,124,32,114,111,117,110,100,101,100,32,124,32,115,113,117,97,114,101,100,10,0,0,0,0,0,0,0,0,116,99,0,0,0,0,0,0,82,71,66,10,0,0,0,0,109,97,120,95,108,105,110,101,95,108,101,110,0,0,0,0,100,105,118,0,0,0,0,0,84,97,98,117,108,97,114,32,111,117,116,112,117,116,32,111,102,32,116,104,105,115,32,51,68,32,112,108,111,116,32,115,116,121,108,101,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,10,0,0,0,70,97,116,97,108,58,32,117,110,100,101,102,105,110,101,100,32,99,111,108,111,114,32,102,111,114,109,117,108,97,32,40,99,97,110,32,98,101,32,48,45,45,37,105,41,10,0,0,115,113,117,97,114,101,100,0,115,101,36,116,0,0,0,0,9,67,111,108,111,114,45,77,111,100,101,108,58,32,0,0,101,120,112,101,99,116,101,100,32,109,105,115,115,105,110,103,45,118,97,108,117,101,32,115,116,114,105,110,103,0,0,0,95,121,0,0,0,0,0,0,115,101,116,32,37,115,37,115,32,34,37,115,34,32,0,0,71,32,78,32,85,32,80,32,76,32,79,32,84,0,0,0,98,117,116,116,0,0,0,0,122,116,114,0,0,0,0,0,110,111,116,105,36,116,108,101,0,0,0,0,0,0,0,0,32,99,111,108,111,114,32,112,111,115,105,116,105,111,110,115,32,102,111,114,32,100,105,115,99,114,101,116,101,32,112,97,108,101,116,116,101,32,116,101,114,109,105,110,97,108,115,10,0,0,0,0,0,0,0,0,119,114,111,110,103,32,111,112,116,105,111,110,0,0,0,0,115,101,116,32,109,37,115,116,105,99,115,32,37,102,10,0,37,103,32,37,103,0,0,0,32,108,116,32,37,100,0,0,121,32,114,97,110,103,101,32,105,115,32,105,110,118,97,108,105,100,0,0,0,0,0,0,33,61,0,0,0,0,0,0,32,32,32,32,108,105,110,101,99,97,112,61,0,0,0,0,80,97,103,101,68,111,119,110,0,0,0,0,0,0,0,0,65,76,76,32,114,101,109,97,105,110,105,110,103,0,0,0,114,117,108,101,114,32,97,116,0,0,0,0,0,0,0,0,115,101,116,32,109,37,115,116,105,99,115,32,100,101,102,97,117,108,116,10,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,112,108,111,116,32,116,121,112,101,0,0,37,37,0,0,0,0,0,0,85,110,115,105,103,110,101,100,83,104,111,114,116,0,0,0,44,32,37,37,32,42,109,105,116,101,114,101,100,42,32,124,32,114,111,117,110,100,101,100,32,124,32,98,101,118,101,108,101,100,10,0,0,0,0,0,110,111,97,36,117,116,111,116,105,116,108,101,115,0,0,0,77,65,88,32,37,105,0,0,101,120,112,101,99,116,105,110,103,32,114,117,108,101,114,32,99,111,111,114,100,105,110,97,116,101,115,0,0,0,0,0,115,101,116,32,109,37,115,116,105,99,115,10,0,0,0,0,37,100,47,37,109,0,0,0,83,105,103,110,101,100,66,121,116,101,0,0,0,0,0,0,112,118,101,114,116,32,62,61,32,48,0,0,0,0,0,0,98,101,118,101,108,101,100,0,97,36,117,116,111,116,105,116,108,101,115,0,0,0,0,0,9,97,108,108,111,99,97,116,105,110,103,32,0,0,0,0,114,117,36,108,101,114,0,0,115,101,116,32,110,111,109,37,115,116,105,99,115,10,0,0,114,111,117,110,100,101,100,0,104,36,101,105,103,104,116,0,32,78,79,84,0,0,0,0,110,111,114,117,36,108,101,114,0,0,0,0,0,0,0,0,115,101,116,32,116,105,99,115,108,101,118,101,108,32,37,103,10,0,0,0,0,0,0,0,124,120,45,48,46,53,124,0,109,105,116,101,114,101,100,0,119,36,105,100,116,104,0,0,9,97,108,108,32,99,111,108,111,114,32,102,111,114,109,117,108,97,101,32,65,82,69,37,115,32,119,114,105,116,116,101,110,32,105,110,116,111,32,111,117,116,112,117,116,32,112,111,115,116,115,99,114,105,112,116,32,102,105,108,101,10,0,0,115,104,111,117,108,100,32,98,101,58,32,37,100,32,60,61,32,109,111,117,115,101,102,111,114,109,97,116,32,60,61,32,37,100,10,0,0,0,0,0,115,101,116,32,120,121,112,108,97,110,101,32,97,116,32,37,103,10,0,0,0,0,0,0,108,105,110,101,106,111,105,110,61,0,0,0,0,0,0,0,115,112,36,97,99,105,110,103,0,0,0,0,0,0,0,0,78,69,71,65,84,73,86,69,0,0,0,0,0,0,0,0,112,108,101,97,115,101,32,39,115,101,116,32,109,111,117,115,101,32,109,111,117,115,101,102,111,114,109,97,116,32,60,102,109,116,62,39,32,102,105,114,115,116,46,10,0,0,0,0,102,117,110,99,116,105,111,110,0,0,0,0,0,0,0,0,44,32,116,97,110,103,101,110,116,61,37,115,41,0,0,0,99,111,117,108,100,32,110,111,116,32,111,112,101,110,32,108,111,103,45,102,105,108,101,32,37,115,0,0,0,0,0,0,92,115,101,116,117,112,71,78,85,80,76,79,84,116,101,114,109,105,110,97,108,10,32,32,32,91,99,111,110,116,101,120,116,93,10,32,32,32,91,0,115,97,36,109,112,108,101,110,0,0,0,0,0,0,0,0,80,79,83,73,84,73,86,69,0,0,0,0,0,0,0,0,109,111,36,117,115,101,102,111,114,109,97,116,0,0,0,0,115,101,116,32,115,116,121,108,101,32,102,117,110,99,116,105,111,110,32,0,0,0,0,0,44,32,37,32,35,46,52,103,100,101,103,41,0,0,0,0,80,115,101,117,100,111,100,97,116,97,32,110,111,116,32,121,101,116,32,105,109,112,108,101,109,101,110,116,101,100,32,102,111,114,32,112,111,108,97,114,32,111,114,32,112,97,114,97,109,101,116,114,105,99,32,103,114,97,112,104,115,0,0,0,9,103,110,117,112,108,111,116,32,101,110,99,111,100,105,110,103,32,32,32,37,115,10,0,108,105,110,101,32,37,100,58,32,0,0,0,0,0,0,0,112,36,111,105,110,116,115,0,92,115,101,116,117,112,98,111,100,121,102,111,110,116,10,32,32,32,91,37,115,37,115,37,103,112,116,93,10,0,0,0,110,111,98,36,111,120,0,0,105,110,112,117,116,32,100,97,116,97,32,40,39,101,39,32,101,110,100,115,41,32,62,32,0,0,0,0,0,0,0,0,9,102,105,103,117,114,101,32,105,115,32,37,115,10,0,0,115,104,111,117,108,100,32,98,101,58,32,37,100,32,60,61,32,99,108,105,112,98,111,97,114,100,102,111,114,109,97,116,32,60,61,32,37,100,10,0,115,101,116,32,115,116,121,108,101,32,100,97,116,97,32,0,104,101,97,100,115,0,0,0,109,117,108,116,0,0,0,0,10,35,32,83,117,114,102,97,99,101,32,37,100,32,111,102,32,37,100,32,115,117,114,102,97,99,101,115,10,0,0,0,92,100,101,102,105,110,101,98,111,100,121,102,111,110,116,101,110,118,105,114,111,110,109,101,110,116,10,32,32,32,91,37,103,112,116,93,10,0,0,0,98,36,111,120,0,0,0,0,115,99,114,36,101,101,110,100,117,109,112,0,0,0,0,0,115,104,111,119,46,99,0,0,95,120,0,0,0,0,0,0,115,101,116,32,99,110,116,114,112,97,114,97,109,32,112,111,105,110,116,115,32,37,100,10,115,101,116,32,115,105,122,101,32,114,97,116,105,111,32,37,103,32,37,103,44,37,103,10,115,101,116,32,111,114,105,103,105,110,32,37,103,44,37,103,10,0,0,0,0,0,0,0,93,32,32,100,105,115,116,97,110,99,101,58,32,0,0,0,109,97,116,114,105,120,32,99,111,110,116,97,105,110,115,32,109,105,115,115,105,110,103,32,111,114,32,117,110,100,101,102,105,110,101,100,32,118,97,108,117,101,115,0,0,0,0,0,37,115,9,102,97,113,44,32,98,117,103,115,44,32,101,116,99,58,32,32,32,116,121,112,101,32,34,104,101,108,112,32,70,65,81,34,10,37,115,9,105,109,109,101,100,105,97,116,101,32,104,101,108,112,58,32,32,32,116,121,112,101,32,34,104,101,108,112,34,32,32,40,112,108,111,116,32,119,105,110,100,111,119,58,32,104,105,116,32,39,104,39,41,10,0,0,116,114,122,0,0,0,0,0,37,115,58,37,100,32,111,111,112,115,58,32,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,32,39,37,99,39,46,10,0,0,0,39,102,111,110,116,110,97,109,101,44,102,111,110,116,115,105,122,101,39,32,101,120,112,101,99,116,101,100,0,0,0,0,99,108,36,105,112,98,111,97,114,100,102,111,114,109,97,116,0,0,0,0,0,0,0,0,100,121,50,61,0,0,0,0,100,102,95,109,97,116,114,105,120,0,0,0,0,0,0,0,32,116,101,120,116,99,111,108,111,114,0,0,0,0,0,0,120,32,114,97,110,103,101,32,105,115,32,105,110,118,97,108,105,100,0,0,0,0,0,0,80,105,112,101,115,32,97,110,100,32,115,104,101,108,108,32,99,111,109,109,97,110,100,115,32,110,111,116,32,112,101,114,109,105,116,116,101,100,32,100,117,114,105,110,103,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,0,0,61,61,0,0,0,0,0,0,67,97,110,110,111,116,32,115,101,116,32,105,110,116,101,114,110,97,108,32,118,97,114,105,97,98,108,101,115,32,71,80,86,65,76,95,32,97,110,100,32,77,79,85,83,69,95,0,92,115,101,116,117,112,99,111,108,111,114,115,10,32,32,32,91,115,116,97,116,101,61,115,116,97,114,116,93,10,0,0,80,97,103,101,85,112,0,0,9,67,117,98,101,104,101,108,105,120,32,99,111,108,111,114,32,112,97,108,101,116,116,101,58,32,115,116,97,114,116,32,37,103,32,99,121,99,108,101,115,32,37,103,32,115,97,116,117,114,97,116,105,111,110,32,37,103,10,0,0,0,0,0,100,105,115,99,114,101,116,101,32,37,103,0,0,0,0,0,78,111,32,116,101,114,109,105,110,97,108,32,104,97,115,32,98,101,101,110,32,112,117,115,104,101,100,32,121,101,116,10,0,0,0,0,0,0,0,0,100,120,50,61,0,0,0,0,77,97,116,114,105,120,32,100,111,101,115,32,110,111,116,32,114,101,112,114,101,115,101,110,116,32,97,32,103,114,105,100,0,0,0,0,0,0,0,0,92,117,115,101,109,111,100,117,108,101,10,32,32,32,91,103,110,117,112,108,111,116,93,10,0,0,0,0,0,0,0,0,110,111,105,110,118,36,101,114,116,0,0,0,0,0,0,0,9,32,32,67,45,102,111,114,109,117,108,97,58,32,37,115,10,0,0,0,0,0,0,0,110,111,122,111,111,109,106,117,36,109,112,0,0,0,0,0,105,110,99,114,101,109,101,110,116,97,108,32,37,103,44,37,103,44,37,103,10,0,0,0,70,105,108,101,32,100,111,101,115,110,39,116,32,102,97,99,116,111,114,105,122,101,32,105,110,116,111,32,102,117,108,108,32,109,97,116,114,105,120,0,37,109,47,37,100,0,0,0,85,110,115,105,103,110,101,100,66,121,116,101,0,0,0,0,92,101,110,97,98,108,101,114,101,103,105,109,101,10,32,32,32,91,117,116,102,45,56,93,10,0,0,0,0,0,0,0,105,110,118,36,101,114,116,0,9,32,32,66,45,102,111,114,109,117,108,97,58,32,37,115,10,0,0,0,0,0,0,0,122,111,111,109,106,117,36,109,112,0,0,0,0,0,0,0,97,117,116,111,32,37,100,10,0,0,0,0,0,0,0,0,82,101,97,100,32,103,114,105,100,32,119,105,100,116,104,32,116,111,111,32,108,97,114,103,101,0,0,0,0,0,0,0,37,37,32,83,101,101,32,97,108,115,111,32,104,116,116,112,58,47,47,119,105,107,105,46,99,111,110,116,101,120,116,103,97,114,100,101,110,46,110,101,116,47,71,110,117,112,108,111,116,10,37,37,10,0,0,0,110,111,114,101,118,36,101,114,115,101,0,0,0,0,0,0,9,32,32,65,45,102,111,114,109,117,108,97,58,32,37,115,10,0,0,0,0,0,0,0,110,111,118,101,36,114,98,111,115,101,0,0,0,0,0,0,115,101,116,32,99,110,116,114,112,97,114,97,109,32,108,101,118,101,108,115,32,0,0,0,82,101,97,100,32,103,114,105,100,32,111,102,32,122,101,114,111,32,119,105,100,116,104,0,48,46,53,32,115,117,98,32,97,98,115,0,0,0,0,0,37,37,32,71,78,85,80,76,79,84,32,118,101,114,115,105,111,110,58,32,37,115,46,37,115,44,32,116,101,114,109,105,110,97,108,32,118,101,114,115,105,111,110,58,32,37,115,46,37,115,32,40,37,115,41,10,0,0,0,0,0,0,0,0,114,101,118,36,101,114,115,101,0,0,0,0,0,0,0,0,9,99,111,108,111,114,32,109,97,112,112,105,110,103,32,105,115,32,100,111,110,101,32,98,121,32,117,115,101,114,32,100,101,102,105,110,101,100,32,102,117,110,99,116,105,111,110,115,10,0,0,0,0,0,0,0,118,101,36,114,98,111,115,101,0,0,0,0,0,0,0,0,98,115,112,108,105,110,101,10,0,0,0,0,0,0,0,0,67,97,110,39,116,32,114,101,97,100,32,115,101,99,111,110,100,32,100,105,109,101,110,115,105,111,110,32,105,110,32,100,97,116,97,32,102,105,108,101,32,34,37,115,34,0,0,0,66,82,69,65,75,58,32,37,115,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,82,36,105,103,104,116,0,0,9,99,111,108,111,114,32,109,97,112,112,105,110,103,32,98,121,32,100,101,102,105,110,101,100,32,103,114,97,100,105,101,110,116,10,0,0,0,0,0,110,111,108,97,36,98,101,108,115,0,0,0,0,0,0,0,99,117,98,105,99,115,112,108,105,110,101,10,0,0,0,0,121,61,0,0,0,0,0,0,67,97,110,39,116,32,114,101,97,100,32,102,105,114,115,116,32,100,105,109,101,110,115,105,111,110,32,105,110,32,100,97,116,97,32,102,105,108,101,32,34,37,115,34,0,0,0,0,32,111,110,58,32,37,115,0,76,36,101,102,116,0,0,0,9,114,103,98,32,99,111,108,111,114,32,109,97,112,112,105,110,103,32,98,121,32,114,103,98,102,111,114,109,117,108,97,101,32,97,114,101,32,37,105,44,37,105,44,37,105,10,0,108,97,98,101,108,36,115,0,108,105,110,101,97,114,10,0,120,61,0,0,0,0,0,0,67,97,110,39,116,32,111,112,101,110,32,100,97,116,97,32,102,105,108,101,32,34,37,115,34,0,0,0,0,0,0,0,9,103,110,117,112,108,111,116,32,76,67,95,67,84,89,80,69,32,32,32,37,115,10,0,34,37,115,34,44,32,108,105,110,101,32,37,100,58,32,0,37,89,45,37,109,45,37,100,32,37,72,58,37,77,32,37,90,0,0,0,0,0,0,0,114,109,36,97,114,103,105,110,0,0,0,0,0,0,0,0,67,79,76,79,82,0,0,0,110,111,112,111,36,108,97,114,100,105,115,116,97,110,99,101,0,0,0,0,0,0,0,0,115,101,116,32,99,110,116,114,112,97,114,97,109,32,0,0,32,32,32,115,99,97,108,101,58,32,0,0,0,0,0,0,84,111,111,32,109,97,110,121,32,99,111,108,117,109,110,115,32,105,110,32,117,115,105,110,103,32,115,112,101,99,105,102,105,99,97,116,105,111,110,32,97,110,100,32,105,109,112,108,105,101,100,32,115,97,109,112,108,105,110,103,32,97,114,114,97,121,0,0,0,0,0,0,98,97,99,107,104,101,97,100,0,0,0,0,0,0,0,0,109,105,110,117,115,0,0,0,112,114,105,110,116,95,51,100,116,97,98,108,101,32,111,117,116,112,117,116,32,98,117,102,102,101,114,0,0,0,0,0,37,37,32,87,114,105,116,116,101,110,32,98,121,32,67,111,110,84,101,88,116,32,116,101,114,109,105,110,97,108,32,102,111,114,32,71,78,85,80,76,79,84,0,0,0,0,0,0,108,109,36,97,114,103,105,110,0,0,0,0,0,0,0,0,115,97,36,118,101,0,0,0,71,82,65,89,0,0,0,0,112,111,108,97,114,100,105,115,116,97,110,99,101,116,36,97,110,0,0,0,0,0,0,0,115,101,116,32,99,110,116,114,112,97,114,97,109,32,111,114,100,101,114,32,37,100,10,0,118,105,101,119,58,32,0,0,80,108,111,116,32,115,116,121,108,101,32,114,101,113,117,105,114,101,115,32,104,105,103,104,101,114,32,116,104,97,110,32,111,110,101,45,100,105,109,101,110,115,105,111,110,97,108,32,115,97,109,112,108,105,110,103,32,97,114,114,97,121,0,0,37,115,10,37,115,9,37,115,10,37,115,9,86,101,114,115,105,111,110,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,32,32,32,32,108,97,115,116,32,109,111,100,105,102,105,101,100,32,37,115,10,37,115,9,66,117,105,108,100,32,83,121,115,116,101,109,58,32,37,115,32,37,115,10,37,115,10,37,115,9,37,115,10,37,115,9,84,104,111,109,97,115,32,87,105,108,108,105,97,109,115,44,32,67,111,108,105,110,32,75,101,108,108,101,121,32,97,110,100,32,109,97,110,121,32,111,116,104,101,114,115,10,37,115,10,37,115,9,103,110,117,112,108,111,116,32,104,111,109,101,58,32,32,32,32,32,104,116,116,112,58,47,47,119,119,119,46,103,110,117,112,108,111,116,46,105,110,102,111,10,0,0,0,0,0,0,92,101,110,100,105,110,112,117,116,10,0,0,0,0,0,0,122,121,120,0,0,0,0,0,98,109,36,97,114,103,105,110,0,0,0,0,0,0,0,0,9,112,97,108,101,116,116,101,32,105,115,32,37,115,10,0,112,111,36,108,97,114,100,105,115,116,97,110,99,101,100,101,103,0,0,0,0,0,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,110,111,102,112,101,95,116,114,97,112,10,0,0,0,0,0,0,0,0,122,111,111,109,105,110,103,32,99,97,110,99,101,108,108,101,100,46,10,0,0,0,0,0,80,108,111,116,32,115,116,121,108,101,32,114,101,113,117,105,114,101,115,32,104,105,103,104,101,114,32,116,104,97,110,32,116,119,111,45,100,105,109,101,110,115,105,111,110,97,108,32,115,97,109,112,108,105,110,103,32,97,114,114,97,121,0,0,112,97,114,97,109,101,116,114,105,99,32,102,117,110,99,116,105,111,110,32,110,111,116,32,102,117,108,108,121,32,115,112,101,99,105,102,105,101,100,0,72,79,77,69,32,110,111,116,32,115,101,116,32,45,32,99,97,110,110,111,116,32,101,120,112,97,110,100,32,116,105,108,100,101,0,0,0,0,0,0,38,0,0,0,0,0,0,0,92,115,116,111,112,116,101,120,116,10,0,0,0,0,0,0,116,109,36,97,114,103,105,110,0,0,0,0,0,0,0,0,68,111,119,110,0,0,0,0,72,79,82,73,90,79,78,84,65,76,0,0,0,0,0,0,110,111,122,111,111,109,99,111,36,111,114,100,105,110,97,116,101,115,0,0,0,0,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,102,111,114,116,114,97,110,10,0,0,0,32,32,32,114,101,115,116,111,114,101,100,32,116,101,114,109,105,110,97,108,32,105,115,32,37,115,32,37,115,10,0,0,96,98,117,105,108,116,105,110,45,99,97,110,99,101,108,45,122,111,111,109,96,32,99,97,110,99,101,108,32,122,111,111,109,32,114,101,103,105,111,110,0,0,0,0,0,0,0,0,80,108,111,116,32,115,116,121,108,101,32,100,111,101,115,32,110,111,116,32,99,111,110,102,111,114,109,32,116,111,32,116,104,114,101,101,32,99,111,108,117,109,110,32,100,97,116,97,32,105,110,32,116,104,105,115,32,103,114,97,112,104,32,109,111,100,101,0,0,0,0,0,92,115,116,111,112,71,78,85,80,76,79,84,103,114,97,112,104,105,99,10,0,0,0,0,111,36,117,116,115,105,100,101,0,0,0,0,0,0,0,0,86,69,82,84,73,67,65,76,0,0,0,0,0,0,0,0,122,111,111,109,99,111,36,111,114,100,105,110,97,116,101,115,0,0,0,0,0,0,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,99,111,109,109,101,110,116,115,99,104,97,114,115,32,39,37,115,39,10,0,0,0,0,0,0,0,0,77,79,85,83,69,95,75,69,89,95,87,73,78,68,79,87,0,0,0,0,0,0,0,0,110,111,95,99,111,108,115,32,60,61,32,77,65,88,68,65,84,65,67,79,76,83,0,0,104,105,100,100,101,110,32,116,104,101,115,101,95,101,100,103,101,115,0,0,0,0,0,0,72,105,103,104,66,121,116,101,70,105,114,115,116,0,0,0,92,115,116,111,112,71,78,85,80,76,79,84,112,97,103,101,10,0,0,0,0,0,0,0,105,110,115,36,105,100,101,0,9,99,111,108,111,114,32,103,114,97,100,105,101,110,116,32,105,115,32,37,115,32,105,110,32,116,104,101,32,99,111,108,111,114,32,98,111,120,10,0,110,111,100,111,36,117,98,108,101,99,108,105,99,107,0,0,71,80,86,65,76,95,86,73,69,87,95,90,83,67,65,76,69,0,0,0,0,0,0,0,101,108,108,105,112,115,101,32,112,108,111,116,0,0,0,0,67,97,110,110,111,116,32,103,101,110,101,114,97,116,101,32,99,111,111,114,100,115,32,102,111,114,32,116,104,97,116,32,112,108,111,116,32,115,116,121,108,101,0,0,0,0,0,0,115,101,116,98,111,117,110,100,115,32,99,117,114,114,101,110,116,112,105,99,116,117,114,101,32,116,111,32,117,110,105,116,115,113,117,97,114,101,32,120,121,115,99,97,108,101,100,32,40,119,44,104,41,59,10,0,98,101,36,108,111,119,0,0,65,114,103,104,33,0,0,0,100,111,36,117,98,108,101,99,108,105,99,107,0,0,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,115,101,112,97,114,97,116,111,114,32,119,104,105,116,101,115,112,97,99,101,10,0,0,0,0,0,0,71,80,86,65,76,95,86,73,69,87,95,83,67,65,76,69,0,0,0,0,0,0,0,0,77,97,116,114,105,120,32,100,97,116,97,32,99,111,110,116,97,105,110,115,32,111,110,108,121,32,116,104,114,101,101,32,99,111,108,117,109,110,115,0,99,111,115,40,57,48,120,41,0,0,0,0,0,0,0,0,71,78,85,80,76,79,84,95,76,73,66,0,0,0,0,0,117,36,110,100,101,114,0,0,10,9,32,32,32,32,32,32,32,32,32,32,115,105,122,101,58,32,0,0,0,0,0,0,103,114,36,97,112,104,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,115,101,112,97,114,97,116,111,114,32,34,37,99,34,10,0,0,0,0,37,46,52,103,0,0,0,0,97,98,36,111,118,101,0,0,97,116,32,85,83,69,82,32,111,114,105,103,105,110,58,32,0,0,0,0,0,0,0,0,115,101,116,32,100,97,116,97,102,105,108,101,32,109,105,115,115,105,110,103,32,39,37,115,39,10,0,0,0,0,0,0,44,0,0,0,0,0,0,0,78,111,32,100,101,102,97,117,108,116,32,99,111,108,117,109,110,115,32,107,110,111,119,110,32,102,111,114,32,116,104,97,116,32,112,108,111,116,32,115,116,121,108,101,0,0,0,0,76,97,109,98,100,97,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,115,32,114,101,115,101,116,58,32,32,37,103,10,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,46,32,32,83,101,101,32,39,104,101,108,112,32,117,110,115,101,116,39,46,0,41,59,112,111,115,105,116,105,111,110,115,40,0,0,0,0,66,97,100,32,116,105,109,101,32,102,111,114,109,97,116,32,105,110,32,115,116,114,105,110,103,0,0,0,0,0,0,0,111,118,36,101,114,0,0,0,97,116,32,68,69,70,65,85,76,84,32,112,111,115,105,116,105,111,110,10,0,0,0,0,101,120,112,101,99,116,105,110,103,32,107,101,121,119,111,114,100,32,39,97,112,112,101,110,100,39,0,0,0,0,0,0,116,117,112,108,101,32,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,0,0,37,98,0,0,0,0,0,0,94,10,0,0,0,0,0,0,121,120,0,0,0,0,0,0,40,37,46,51,103,44,37,46,51,103,44,37,46,51,103,41,0,0,0,0,0,0,0,0,104,111,114,36,105,122,111,110,116,97,108,0,0,0,0,0,78,79,84,32,100,114,97,119,110,10,0,0,0,0,0,0,97,112,112,101,110,100,0,0,69,120,112,101,99,116,105,110,103,32,39,44,39,32,111,114,32,39,41,39,0,0,0,0,104,101,97,100,0,0,0,0,112,108,117,115,0,0,0,0,32,37,99,10,0,0,0,0,99,111,108,111,114,115,40,0,118,101,114,36,116,105,99,97,108,0,0,0,0,0,0,0,114,101,115,36,101,116,0,0,100,114,97,119,110,32,98,97,99,107,10,9,0,0,0,0,101,120,112,101,99,116,105,110,103,32,102,105,108,101,110,97,109,101,0,0,0,0,0,0,112,114,101,102,105,120,0,0,47,117,115,114,47,108,111,99,97,108,47,98,105,110,0,0,99,111,108,111,114,95,109,111,100,101,40,103,114,97,100,105,101,110,116,41,59,0,0,0,120,122,121,0,0,0,0,0,99,36,101,110,116,101,114,0,100,114,97,119,110,32,102,114,111,110,116,10,9,0,0,0,110,111,114,111,116,36,97,116,101,0,0,0,0,0,0,0,10,9,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,105,115,32,116,32,102,111,114,32,99,117,114,118,101,115,44,32,117,47,118,32,102,111,114,32,115,117,114,102,97,99,101,115,10,0,0,0,0,0,115,101,116,32,109,97,112,112,105,110,103,32,0,0,0,0,98,111,114,100,101,114,0,0,116,104,105,115,95,112,108,111,116,32,33,61,32,78,85,76,76,0,0,0,0,0,0,0,97,120,101,115,32,109,117,115,116,32,98,101,32,120,49,121,49,44,32,120,49,121,50,44,32,120,50,121,49,32,111,114,32,120,50,121,50,0,0,0,116,105,108,100,101,32,101,120,112,97,110,115,105,111,110,0,94,0,0,0,0,0,0,0,99,111,108,111,114,95,109,111,100,101,40,102,117,110,99,116,105,111,110,115,41,0,0,0,114,36,105,103,104,116,0,0,9,99,111,108,111,114,32,98,111,120,32,119,105,116,104,111,117,116,32,98,111,114,100,101,114,32,105,115,32,0,0,0,115,101,116,32,109,97,99,114,111,115,10,0,0,0,0,0,115,101,116,32,116,101,114,109,32,37,115,32,37,115,0,0,102,95,115,112,114,105,110,116,102,0,0,0,0,0,0,0,77,111,114,101,32,116,104,97,110,32,37,100,32,101,108,101,109,101,110,116,115,0,0,0,99,111,108,111,114,95,109,111,100,101,40,114,103,98,41,59,102,111,114,109,117,108,97,101,40,37,100,44,37,100,44,37,100,41,0,0,0,0,0,0,108,36,101,102,116,0,0,0,68,69,70,65,85,76,84,32,108,105,110,101,32,116,121,112,101,32,105,115,32,0,0,0,69,120,112,101,99,116,101,100,32,99,111,109,109,97,46,0,117,110,115,101,116,32,99,108,97,98,101,108,10,0,0,0,104,105,100,100,101,110,32,110,111,114,116,104,95,101,100,103,101,115,0,0,0,0,0,0,76,111,119,66,121,116,101,70,105,114,115,116,0,0,0,0,99,111,108,111,114,95,109,111,100,101,40,103,114,97,121,41,0,0,0,0,0,0,0,0,98,36,111,116,116,111,109,0,108,105,110,101,32,116,121,112,101,32,37,100,32,105,115,32,0,0,0,0,0,0,0,0,86,97,108,117,101,32,111,117,116,32,111,102,32,114,97,110,103,101,32,91,48,44,49,93,46,0,0,0,0,0,0,0,115,101,116,32,99,108,97,98,101,108,32,39,37,115,39,10,0,0,0,0,0,0,0,0,105,115,111,95,56,56,53,57,95,50,0,0,0,0,0,0,104,105,115,116,111,103,114,97,109,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,110,117,109,101,114,105,99,32,111,114,32,116,117,112,108,101,32,102,111,114,109,0,0,0,10,35,32,67,117,114,118,101,32,116,105,116,108,101,58,32,34,37,115,34,0,0,0,0,103,112,95,109,97,107,101,95,112,97,108,101,116,116,101,40,0,0,0,0,0,0,0,0,116,36,111,112,0,0,0,0,9,99,111,108,111,114,32,98,111,120,32,119,105,116,104,32,98,111,114,100,101,114,44,32,0,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,99,111,108,111,114,32,110,97,109,101,46,0,0,0,0,0,32,98,111,116,104,10,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,73,110,118,97,108,105,100,32,99,111,109,109,97,32,115,101,112,97,114,97,116,101,100,32,116,121,112,101,0,0,0,0,57,48,32,109,117,108,32,99,111,115,0,0,0,0,0,0,37,37,32,102,111,114,32,97,100,100,105,116,105,111,110,97,108,32,117,115,101,114,45,100,101,102,105,110,101,100,32,115,101,116,116,105,110,103,115,10,103,112,95,115,101,116,117,112,95,97,102,116,101,114,59,10,0,0,0,0,0,0,0,0,111,102,102,0,0,0,0,0,99,111,114,110,101,114,32,37,105,10,0,0,0,0,0,0,85,110,107,110,111,119,110,32,99,111,108,111,114,32,115,112,101,99,105,102,105,101,114,46,32,85,115,101,32,39,35,114,114,103,103,98,98,39,46,0,32,115,117,114,102,97,99,101,10,0,0,0,0,0,0,0,80,101,114,112,101,110,100,105,99,117,108,97,114,32,118,101,99,116,111,114,32,99,97,110,110,111,116,32,98,101,32,122,101,114,111,0,0,0,0,0,112,117,115,104,99,0,0,0,103,112,95,115,101,116,95,108,105,110,101,119,105,100,116,104,40,37,103,41,59,10,0,0,111,110,0,0,0,0,0,0,101,120,116,101,110,100,32,100,121,110,97,114,114,97,121,0,109,97,120,105,109,117,109,32,111,102,32,52,32,99,111,114,110,101,114,115,10,0,0,0,35,37,50,120,37,50,120,37,50,120,0,0,0,0,0,0,32,98,97,115,101,10,0,0,84,104,114,101,101,45,100,105,109,101,110,115,105,111,110,97,108,32,116,117,112,108,101,32,114,101,113,117,105,114,101,100,0,0,0,0,0,0,0,0,76,97,109,98,100,97,32,83,116,97,114,116,32,118,97,108,117,101,32,115,101,116,58,32,37,103,10,0,0,0,0,0,37,37,32,108,105,110,101,119,105,100,116,104,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,102,111,114,32,105,110,100,105,118,105,100,117,97,108,32,108,105,110,101,115,10,0,0,0,0,0,0,0,109,105,110,105,109,117,109,32,111,102,32,52,32,99,111,114,110,101,114,115,10,0,0,0,69,120,112,101,99,116,101,100,32,40,32,116,111,32,115,116,97,114,116,32,103,114,97,100,105,101,110,116,32,100,101,102,105,110,105,116,105,111,110,46,0,0,0,0,0,0,0,0,10,115,101,116,32,115,97,109,112,108,101,115,32,37,100,44,32,37,100,10,115,101,116,32,105,115,111,115,97,109,112,108,101,115,32,37,100,44,32,37,100,10,37,115,115,101,116,32,115,117,114,102,97,99,101,10,37,115,115,101,116,32,99,111,110,116,111,117,114,0,0,0,37,66,0,0,0,0,0,0,120,121,0,0,0,0,0,0,103,112,95,115,101,116,95,112,111,105,110,116,115,105,122,101,40,37,103,41,59,10,0,0,98,97,99,107,0,0,0,0,109,101,100,105,97,110,32,111,102,32,52,32,99,111,114,110,101,114,115,10,0,0,0,0,71,114,97,121,32,115,99,97,108,101,32,110,111,116,32,115,111,114,116,101,100,32,105,110,32,103,114,97,100,105,101,110,116,46,0,0,0,0,0,0,101,113,117,97,108,32,120,121,122,0,0,0,0,0,0,0,37,100,46,32,37,100,46,32,37,48,52,100,32,37,100,58,37,48,50,100,0,0,0,0,110,111,104,101,97,100,0,0,108,101,0,0,0,0,0,0,48,120,37,48,54,120,0,0,37,37,32,112,111,105,110,116,115,105,122,101,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,10,0,0,0,0,102,114,111,110,116,0,0,0,114,101,36,114,101,97,100,0,103,101,111,109,101,116,114,105,99,97,108,32,109,101,97,110,32,111,102,32,52,32,99,111,114,110,101,114,115,10,0,0,78,111,32,118,97,108,105,100,32,112,97,108,101,116,116,101,32,102,111,117,110,100,0,0,83,84,65,84,83,95,0,0,101,113,117,97,108,32,120,121,0,0,0,0,0,0,0,0,37,100,58,37,48,50,100,0,98,105,36,110,100,0,0,0,73,110,116,101,114,110,97,108,32,101,114,114,111,114,32,40,100,97,116,97,102,105,108,101,46,99,41,58,32,85,110,107,110,111,119,110,32,112,108,111,116,32,109,111,100,101,0,0,35,33,37,115,47,103,110,117,112,108,111,116,10,35,10,0,103,112,95,115,99,97,108,101,95,116,101,120,116,32,58,61,32,37,103,59,10,0,0,0,121,120,122,0,0,0,0,0,110,111,98,101,110,116,36,111,118,101,114,0,0,0,0,0,97,118,101,114,97,103,101,100,32,52,32,99,111,114,110,101,114,115,10,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,116,105,111,110,0,0,66,97,100,32,100,97,116,97,32,111,110,32,108,105,110,101,32,37,100,0,0,0,0,0,10,115,101,116,32,118,105,101,119,32,32,37,115,0,0,0,37,100,46,32,37,100,46,32,37,48,52,100,0,0,0,0,84,104,114,101,101,45,100,105,109,101,110,115,105,111,110,97,108,32,116,117,112,108,101,32,114,101,113,117,105,114,101,100,32,102,111,114,32,115,101,116,116,105,110,103,32,98,105,110,97,114,121,32,112,97,114,97,109,101,116,101,114,115,0,0,109,97,116,36,114,105,120,0,110,111,98,111,114,100,101,114,10,0,0,0,0,0,0,0,116,104,105,115,95,112,108,111,116,32,61,61,32,42,116,112,95,51,100,95,112,116,114,0,67,97,110,110,111,116,32,101,120,112,97,110,100,32,101,109,112,116,121,32,112,97,116,104,0,0,0,0,0,0,0,0,124,0,0,0,0,0,0,0,71,80,70,85,78,95,0,0,37,37,32,116,101,120,116,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,32,102,111,114,32,116,104,101,32,119,104,111,108,101,32,102,105,103,117,114,101,10,0,0,0,0,98,101,110,116,36,111,118,101,114,0,0,0,0,0,0,0,85,112,0,0,0,0,0,0,9,113,117,97,100,114,97,110,103,108,101,32,99,111,108,111,114,32,97,99,99,111,114,100,105,110,103,32,116,111,32,0])
.concat([112,109,51,100,32,103,114,97,100,105,101,110,116,0,0,0,37,103,44,32,37,103,44,32,37,103,44,32,37,103,0,0,99,97,110,32,111,110,108,121,32,100,111,32,98,101,115,115,101,108,32,102,117,110,99,116,105,111,110,115,32,111,102,32,114,101,97,108,115,0,0,0,70,105,114,115,116,32,112,97,114,97,109,101,116,101,114,32,116,111,32,115,112,114,105,110,116,102,32,109,117,115,116,32,98,101,32,97,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,0,0,0,0,0,84,104,114,101,101,45,100,105,109,101,110,115,105,111,110,97,108,32,116,117,112,108,101,32,114,101,113,117,105,114,101,100,32,102,111,114,32,51,68,32,112,108,111,116,0,0,0,0,37,37,32,102,111,114,32,97,100,100,105,116,105,111,110,97,108,32,117,115,101,114,45,100,101,102,105,110,101,100,32,115,101,116,116,105,110,103,115,10,103,112,95,115,101,116,117,112,95,98,101,102,111,114,101,59,10,0,0,0,0,0,0,0,110,111,97,108,116,36,100,105,97,103,111,110,97,108,0,0,9,115,116,101,112,115,32,102,111,114,32,98,105,108,105,110,101,97,114,32,105,110,116,101,114,112,111,108,97,116,105,111,110,58,32,37,100,44,37,100,10,0,0,0,0,0,0,0,103,114,97,100,105,101,110,116,0,0,0,0,0,0,0,0,84,119,111,45,100,105,109,101,110,115,105,111,110,97,108,32,116,117,112,108,101,32,114,101,113,117,105,114,101,100,32,102,111,114,32,50,68,32,112,108,111,116,0,0,0,0,0,0,104,105,100,100,101,110,32,116,104,101,115,101,95,112,111,108,121,115,0,0,0,0,0,0,88,114,105,103,104,116,89,117,112,0,0,0,0,0,0,0,37,37,32,68,105,102,102,101,114,101,110,116,32,105,110,105,116,105,97,108,105,115,97,116,105,111,110,115,10,0,0,0,97,108,116,36,100,105,97,103,111,110,97,108,0,0,0,0,9,112,109,51,100,45,104,105,100,100,101,110,51,100,32,105,115,32,37,115,10,0,0,0,76,101,115,115,32,116,104,97,110,32,51,32,117,115,105,110,103,32,115,112,101,99,115,32,102,111,114,32,112,97,108,101,116,116,101,0,0,0,0,0,115,101,116,32,118,105,101,119,32,0,0,0,0,0,0,0,44,32,40,117,110,100,101,102,105,110,101,100,41,47,0,0,99,117,116,101,32,108,105,116,116,108,101,32,101,108,108,105,112,115,101,32,102,111,114,32,116,104,101,32,107,101,121,32,115,97,109,112,108,101,0,0,78,117,109,98,101,114,32,111,102,32,98,121,116,101,115,32,116,111,32,115,107,105,112,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,0,37,37,32,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,110,111,117,110,100,36,101,102,105,110,101,100,0,0,0,0,9,112,109,51,100,45,104,105,100,100,101,110,51,100,32,105,115,32,111,110,32,97,110,100,32,119,105,108,108,32,117,115,101,32,108,105,110,101,115,116,121,108,101,32,37,100,10,0,117,110,115,101,116,32,100,101,99,105,109,97,108,115,105,103,110,10,0,0,0,0,0,0,73,109,112,114,111,112,101,114,32,115,99,97,110,110,105,110,103,32,115,116,114,105,110,103,46,32,84,114,121,32,50,32,99,104,97,114,97,99,116,101,114,32,115,116,114,105,110,103,32,102,111,114,32,50,68,32,100,97,116,97,0,0,0,0,115,105,110,40,57,48,120,41,0,0,0,0,0,0,0,0,37,37,32,116,101,109,112,111,114,97,114,121,32,118,97,114,105,97,98,108,101,32,102,111,114,32,115,116,111,114,105,110,103,32,116,104,101,32,112,97,116,104,10,115,97,118,101,32,112,59,32,112,97,116,104,32,112,59,10,0,0,0,0,0,117,110,100,101,102,36,105,110,101,100,0,0,0,0,0,0,97,108,108,32,52,32,112,111,105,110,116,115,32,111,102,32,116,104,101,32,113,117,97,100,114,97,110,103,108,101,32,105,110,32,120,44,121,32,114,97,110,103,101,115,10,0,0,0,69,120,112,101,99,116,101,100,32,99,111,109,109,97,0,0,115,101,116,32,100,101,99,105,109,97,108,115,105,103,110,32,39,37,115,39,10,0,0,0,47,40,117,110,100,101,102,105,110,101,100,41,0,0,0,0,73,109,112,114,111,112,101,114,32,115,99,97,110,110,105,110,103,32,115,116,114,105,110,103,46,32,84,114,121,32,51,32,99,104,97,114,97,99,116,101,114,32,115,116,114,105,110,103,32,102,111,114,32,51,68,32,100,97,116,97,0,0,0,0,37,37,32,116,101,109,112,111,114,97,114,121,32,118,97,114,105,97,98,108,101,32,102,111,114,32,115,116,111,114,105,110,103,32,116,104,101,32,112,97,116,104,32,97,110,100,32,105,109,97,103,101,115,10,115,97,118,101,32,112,44,32,105,109,103,44,32,105,109,97,59,32,112,97,116,104,32,112,59,32,115,116,114,105,110,103,32,105,109,103,44,32,105,109,97,59,10,0,0,0,0,0,0,0,116,114,105,36,97,110,103,108,101,112,97,116,116,101,114,110,0,0,0,0,0,0,0,0,97,116,32,108,101,97,115,116,32,49,32,112,111,105,110,116,32,111,102,32,116,104,101,32,113,117,97,100,114,97,110,103,108,101,32,105,110,32,120,44,121,32,114,97,110,103,101,115,10,0,0,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,102,111,114,32,102,117,110,99,116,105,111,110,0,0,115,101,116,32,100,101,99,105,109,97,108,115,105,103,110,32,108,111,99,97,108,101,32,34,37,115,34,10,0,0,0,0,67,97,110,110,111,116,32,97,108,116,101,114,32,115,99,97,110,110,105,110,103,32,109,101,116,104,111,100,32,102,111,114,32,111,110,101,45,100,105,109,101,110,115,105,111,110,97,108,32,100,97,116,97,0,0,0,84,111,111,32,109,97,110,121,32,114,97,110,103,101,45,115,112,101,99,115,32,102,111,114,32,97,32,37,100,45,118,97,114,105,97,98,108,101,32,102,105,116,0,0,0,0,0,0,99,109,0,0,0,0,0,0,110,111,111,102,102,36,115,101,116,0,0,0,0,0,0,0,9,99,108,105,112,112,105,110,103,58,32,0,0,0,0,0,115,101,116,32,112,111,105,110,116,115,105,122,101,32,37,103,10,115,101,116,32,112,111,105,110,116,105,110,116,101,114,118,97,108,98,111,120,32,37,103,10,115,101,116,32,101,110,99,111,100,105,110,103,32,37,115,10,37,115,115,101,116,32,112,111,108,97,114,10,37,115,115,101,116,32,112,97,114,97,109,101,116,114,105,99,10,0,0,122,90,0,0,0,0,0,0,37,97,0,0,0,0,0,0,10,37,115,37,115,10,0,0,100,101,112,114,101,99,97,116,101,100,32,115,121,110,116,97,120,44,32,117,115,101,32,34,117,110,115,101,116,34,0,0,67,111,109,109,97,110,100,32,39,117,110,115,101,116,32,104,105,115,116,111,114,121,115,105,122,101,39,32,114,101,113,117,105,114,101,115,32,104,105,115,116,111,114,121,32,115,117,112,112,111,114,116,46,0,0,0,105,110,0,0,0,0,0,0,9,102,108,117,115,104,105,110,103,32,116,114,105,97,110,103,108,101,115,32,97,114,101,32,37,115,100,114,97,119,110,10,0,0,0,0,0,0,0,0,78,97,109,101,100,32,99,111,108,111,114,115,32,119,105,108,108,32,112,114,111,100,117,99,101,32,115,116,114,97,110,103,101,32,114,101,115,117,108,116,115,32,105,102,32,110,111,116,32,105,110,32,99,111,108,111,114,32,109,111,100,101,32,82,71,66,46,0,0,0,0,0,115,101,116,32,111,102,102,115,101,116,115,0,0,0,0,0,121,89,0,0,0,0,0,0,115,106,36,105,115,0,0,0,103,101,0,0,0,0,0,0,37,52,100,32,0,0,0,0,37,108,102,32,44,32,37,108,102,32,37,99,0,0,0,0,37,37,32,115,99,97,108,105,110,103,32,102,97,99,116,111,114,44,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,111,102,32,116,104,101,32,102,105,103,117,114,101,10,97,32,58,61,32,49,99,109,59,32,119,32,58,61,32,37,46,51,102,97,59,32,104,32,58,61,32,37,46,51,102,97,59,32,37,37,32,40,37,103,37,115,44,32,37,103,37,115,41,10,0,0,0,0,100,101,102,36,97,117,108,116,115,0,0,0,0,0,0,0,114,101,112,36,108,111,116,0,69,78,68,0,0,0,0,0,105,110,118,97,108,105,100,32,112,97,108,101,116,116,101,32,111,112,116,105,111,110,0,0,69,120,112,101,99,116,105,110,103,32,91,110,111,93,111,117,116,112,117,116,32,111,114,32,112,114,101,102,105,120,0,0,115,101,116,32,108,111,103,115,99,97,108,101,32,37,115,32,37,103,10,0,0,0,0,0,120,88,0,0,0,0,0,0,37,115,37,115,10,37,115,37,115,10,37,115,37,115,10,37,115,37,115,37,115,37,115,10,37,115,10,0,0,0,0,0,67,111,109,109,97,110,100,32,39,115,101,116,32,104,105,115,116,111,114,121,115,105,122,101,39,32,114,101,113,117,105,114,101,115,32,104,105,115,116,111,114,121,32,115,117,112,112,111,114,116,46,0,0,0,0,0,115,116,114,105,110,103,32,116,101,114,109,118,101,114,115,105,111,110,59,32,32,32,32,116,101,114,109,118,101,114,115,105,111,110,32,32,32,32,58,61,32,34,37,115,34,59,10,0,110,111,32,109,97,116,99,104,105,110,103,32,39,125,39,0,122,36,101,114,111,0,0,0,121,122,120,0,0,0,0,0,66,69,71,73,78,0,0,0,112,97,114,97,36,108,108,101,108,0,0,0,0,0,0,0,110,111,110,45,110,101,103,97,116,105,118,101,32,110,117,109,98,101,114,32,114,101,113,117,105,114,101,100,0,0,0,0,117,110,115,101,116,32,108,111,103,115,99,97,108,101,10,0,67,97,110,32,111,110,108,121,32,102,108,105,112,32,120,44,32,121,44,32,97,110,100,47,111,114,32,122,0,0,0,0,32,101,109,112,116,121,32,0,97,120,36,101,115,0,0,0,47,98,105,110,47,115,104,0,38,38,0,0,0,0,0,0,118,97,114,110,97,109,101,0,115,116,114,105,110,103,32,103,110,117,112,108,111,116,118,101,114,115,105,111,110,59,32,103,110,117,112,108,111,116,118,101,114,115,105,111,110,32,58,61,32,34,37,115,34,59,10,0,114,97,120,36,105,115,0,0,115,119,97,112,112,101,100,32,112,100,112,32,40,100,105,109,109,108,101,41,0,0,0,0,102,108,117,115,104,101,100,32,102,114,111,109,32,37,115,10,0,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,99,111,108,111,114,32,109,111,100,101,108,46,0,0,0,0,116,105,116,108,101,32,0,0,9,99,117,114,114,101,110,116,32,116,101,114,109,105,110,97,108,32,116,121,112,101,32,105,115,32,117,110,107,110,111,119,110,10,0,0,0,0,0,0,37,115,10,0,0,0,0,0,77,79,85,83,69,95,67,84,82,76,0,0,0,0,0,0,115,112,114,105,110,116,102,32,97,114,103,115,0,0,0,0,120,88,121,89,122,90,0,0,92,115,116,97,114,116,71,78,85,80,76,79,84,103,114,97,112,104,105,99,91,37,100,93,10,0,0,0,0,0,0,0,122,101,114,111,97,36,120,105,115,0,0,0,0,0,0,0,67,69,78,84,69,82,69,68,10,0,0,0,0,0,0,0,69,120,112,101,99,116,101,100,32,99,111,108,111,114,32,109,111,100,101,108,46,0,0,0,99,111,108,117,109,110,115,116,97,99,107,101,100,32,0,0,77,79,85,83,69,95,65,76,84,0,0,0,0,0,0,0,70,108,105,112,112,105,110,103,32,100,105,109,101,110,115,105,111,110,32,100,105,114,101,99,116,105,111,110,32,109,117,115,116,32,98,101,32,49,32,111,114,32,48,0,0,0,0,0,104,105,100,100,101,110,32,110,111,114,116,104,95,112,111,108,121,115,0,0,0,0,0,0,103,110,117,112,108,111,116,95,99,111,110,116,111,117,114,0,92,115,116,97,114,116,71,78,85,80,76,79,84,112,97,103,101,32,37,37,32,71,114,97,112,104,105,99,32,78,114,46,32,37,100,10,0,0,0,0,88,114,105,103,104,116,89,100,111,119,110,0,0,0,0,0,122,122,101,114,111,97,36,120,105,115,0,0,0,0,0,0,9,115,117,98,115,101,113,117,101,110,116,32,115,99,97,110,115,32,119,105,116,104,32,100,105,102,102,101,114,101,110,116,32,110,98,32,111,102,32,112,116,115,32,97,114,101,32,0,115,97,116,36,117,114,97,116,105,111,110,0,0,0,0,0,114,111,119,115,116,97,99,107,101,100,32,0,0,0,0,0,35,35,32,0,0,0,0,0,77,79,85,83,69,95,83,72,73,70,84,0,0,0,0,0,83,97,109,112,108,101,32,112,101,114,105,111,100,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,46,32,84,114,121,32,96,102,108,105,112,96,32,102,111,114,32,99,104,97,110,103,105,110,103,32,100,105,114,101,99,116,105,111,110,0,0,0,0,0,0,0,84,104,105,115,32,116,101,114,109,105,110,97,108,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,102,105,108,108,101,100,32,112,111,108,121,103,111,110,115,0,0,112,97,114,97,109,101,116,101,114,32,116,111,32,96,112,109,51,100,32,97,116,96,32,114,101,113,117,105,114,101,115,32,99,111,109,98,105,110,97,116,105,111,110,32,111,102,32,117,112,32,116,111,32,54,32,99,104,97,114,97,99,116,101,114,115,32,98,44,115,44,116,10,9,40,100,114,97,119,105,110,103,32,97,116,32,98,111,116,116,111,109,44,32,115,117,114,102,97,99,101,44,32,116,111,112,41,0,0,0,0,0,0,112,32,58,61,32,40,37,46,51,102,97,44,37,46,51,102,97,41,0,0,0,0,0,0,121,50,122,101,114,111,97,36,120,105,115,0,0,0,0,0,9,116,97,107,105,110,103,32,115,99,97,110,115,32,100,105,114,101,99,116,105,111,110,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,99,121,99,36,108,101,115,0,101,114,114,111,114,98,97,114,115,32,103,97,112,32,37,100,32,108,119,32,37,103,0,0,77,79,85,83,69,95,89,50,0,0,0,0,0,0,0,0,77,111,114,101,32,112,97,114,97,109,101,116,101,114,115,32,115,112,101,99,105,102,105,101,100,32,116,104,97,110,32,100,97,116,97,32,114,101,99,111,114,100,115,32,115,112,101,99,105,102,105,101,100,0,0,0,57,48,32,109,117,108,32,115,105,110,0,0,0,0,0,0,103,112,95,115,101,116,95,108,105,110,101,116,121,112,101,40,37,100,41,59,10,0,0,0,121,122,101,114,111,97,36,120,105,115,0,0,0,0,0,0,66,65,67,75,87,65,82,68,0,0,0,0,0,0,0,0,99,108,117,115,116,101,114,101,100,32,103,97,112,32,37,100,32,0,0,0,0,0,0,0,101,120,112,97,110,100,105,110,103,32,99,117,114,118,101,32,118,97,114,105,97,98,108,101,32,99,111,108,111,114,115,0,77,79,85,83,69,95,88,50,0,0,0,0,0,0,0,0,67,97,110,110,111,116,32,102,108,105,112,32,97,32,110,111,110,45,101,120,105,115,116,101,110,116,32,100,105,109,101,110,115,105,111,110,0,0,0,0,103,110,117,112,108,111,116,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,10,0,0,0,0,0,0,0,123,37,115,125,41,59,10,0,120,50,122,101,114,111,97,36,120,105,115,0,0,0,0,0,70,79,82,87,65,82,68,0,99,111,108,111,114,32,102,111,114,109,117,108,97,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,117,115,101,32,96,115,104,111,119,32,112,97,108,101,116,116,101,32,114,103,98,102,111,114,109,117,108,97,101,39,32,116,111,32,100,105,115,112,108,97,121,32,116,104,101,32,114,97,110,103,101,41,0,0,0,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,104,105,115,116,111,103,114,97,109,32,0,0,0,0,77,79,85,83,69,95,89,0,70,111,114,109,97,116,32,115,112,101,99,105,102,105,101,114,32,109,117,115,116,32,98,101,103,105,110,32,119,105,116,104,32,39,37,39,0,0,0,0,67,97,110,39,116,32,114,101,45,110,97,109,101,32,39,121,39,32,105,110,32,97,32,111,110,101,45,118,97,114,105,97,98,108,101,32,102,105,116,0,117,110,100,101,102,105,110,101,100,32,118,97,108,117,101,0,91,37,115,93,0,0,0,0,120,122,101,114,111,97,36,120,105,115,0,0,0,0,0,0,9,116,97,107,105,110,103,32,115,99,97,110,115,32,105,110,32,37,115,32,100,105,114,101,99,116,105,111,110,10,0,0,99,111,110,102,108,105,99,116,105,110,103,32,111,112,116,105,111,110,115,0,0,0,0,0,77,79,85,83,69,95,88,0,85,110,114,101,99,111,103,110,105,122,101,100,32,98,105,110,97,114,121,32,102,111,114,109,97,116,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0,0,0,0,0,0,0,0,37,65,0,0,0,0,0,0,102,111,114,109,97,116,32,116,111,111,32,108,111,110,103,32,100,117,101,32,116,111,32,108,111,110,103,32,100,101,99,105,109,97,108,115,105,103,110,32,115,116,114,105,110,103,0,0,101,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,115,32,116,111,32,117,110,115,101,116,32,108,97,98,101,108,0,0,0,0,0,97,108,105,103,110,40,37,115,41,44,32,92,115,111,109,101,116,120,116,91,103,112,93,0,118,114,36,97,110,103,101,0,9,116,114,117,101,32,100,101,112,116,104,32,111,114,100,101,114,105,110,103,10,0,0,0,105,110,118,97,108,105,100,32,99,111,108,111,114,98,111,120,32,111,112,116,105,111,110,0,115,101,116,32,115,116,121,108,101,32,97,114,114,111,119,32,37,100,0,0,0,0,0,0,107,101,121,95,99,104,97,114,0,0,0,0,0,0,0,0,70,97,105,108,117,114,101,32,105,110,32,98,105,110,97,114,121,32,116,97,98,108,101,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,0,0,107,111,105,56,36,117,0,0,97,110,103,108,101,40,37,100,41,44,32,0,0,0,0,0,117,114,36,97,110,103,101,0,114,101,102,36,114,101,115,104,0,0,0,0,0,0,0,0,84,79,80,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,115,99,114,101,101,110,32,118,97,108,117,101,32,91,48,32,45,32,49,93,0,0,105,108,108,101,103,97,108,32,112,114,101,102,105,120,0,0,117,110,115,101,116,32,115,116,121,108,101,32,97,114,114,111,119,10,0,0,0,0,0,0,77,79,85,83,69,95,67,72,65,82,0,0,0,0,0,0,119,120,116,0,0,0,0,0,37,39,34,32,0,0,0,0,116,111,107,101,110,32,116,97,98,108,101,0,0,0,0,0,43,68,65,84,65,83,84,82,73,78,71,83,32,32,43,72,73,83,84,79,71,82,65,77,83,32,32,43,79,66,74,69,67,84,83,32,32,43,83,84,82,73,78,71,86,65,82,83,32,32,43,77,65,67,82,79,83,32,32,43,73,77,65,71,69,32,32,43,85,83,69,82,95,76,73,78,69,84,89,80,69,83,32,43,83,84,65,84,83,32,0,0,0,0,0,0,103,112,95,112,117,116,95,116,101,120,116,40,40,37,46,51,102,97,44,32,37,46,51,102,97,41,44,32,0,0,0,0,116,114,36,97,110,103,101,0,122,120,121,0,0,0,0,0,83,85,82,70,65,67,69,0,98,121,0,0,0,0,0,0,116,97,103,32,109,117,115,116,32,98,101,32,115,116,114,105,99,116,108,121,32,112,111,115,105,116,105,118,101,32,40,115,101,101,32,96,104,101,108,112,32,115,101,116,32,115,116,121,108,101,32,108,105,110,101,39,41,0,0,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,108,105,110,101,32,37,100,32,0,0,0,0,0,0,77,79,85,83,69,95,75,69,89,0,0,0,0,0,0,0,117,115,105,110,103,32,100,101,102,97,117,108,116,32,98,105,110,97,114,121,32,102,111,114,109,97,116,0,0,0,0,0,32,100,101,102,97,117,108,116,10,0,0,0,0,0,0,0,100,117,112,108,105,99,97,116,101,100,32,111,114,32,99,111,110,116,114,97,100,105,99,116,105,110,103,32,97,114,103,117,109,101,110,116,115,32,105,110,32,112,108,111,116,32,111,112,116,105,111,110,115,0,0,0,101,120,112,101,99,116,105,110,103,32,39,117,110,105,113,117,101,39,44,32,39,102,114,101,113,117,101,110,99,121,39,44,32,39,99,117,109,117,108,97,116,105,118,101,39,44,32,39,99,110,111,114,109,97,108,39,44,32,39,107,100,101,110,115,105,116,121,39,44,32,39,97,99,115,112,108,105,110,101,115,39,44,32,39,99,115,112,108,105,110,101,115,39,44,32,39,98,101,122,105,101,114,39,32,111,114,32,39,115,98,101,122,105,101,114,39,0,0,0,0,83,72,69,76,76,0,0,0,124,124,0,0,0,0,0,0,109,97,116,114,105,120,32,101,108,101,109,101,110,116,115,0,115,112,108,105,110,101,32,109,97,116,114,105,120,0,0,0,103,112,95,112,111,105,110,116,40,37,46,51,102,97,44,37,46,51,102,97,44,37,100,41,59,10,0,0,0,0,0,0,114,114,36,97,110,103,101,0,117,115,105,110,103,32,100,101,102,97,117,108,116,32,98,105,110,97,114,121,32,114,101,99,111,114,100,47,97,114,114,97,121,32,115,116,114,117,99,116,117,114,101,0,0,0,0,0,72,111,109,101,0,0,0,0,66,79,84,84,79,77,0,0,105,110,118,97,108,105,100,32,112,109,51,100,32,111,112,116,105,111,110,0,0,0,0,0,117,110,115,101,116,32,115,116,121,108,101,32,108,105,110,101,10,0,0,0,0,0,0,0,102,105,108,108,101,100,95,112,111,108,121,103,111,110,51,100,32,99,111,114,110,101,114,115,0,0,0,0,0,0,0,0,32,32,32,112,117,115,104,101,100,32,116,101,114,109,105,110,97,108,32,37,115,32,37,115,10,0,0,0,0,0,0,0,77,79,85,83,69,95,66,85,84,84,79,78,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,110,111,110,45,83,84,82,73,78,71,32,97,114,103,117,109,101,110,116,0,0,0,0,108,105,116,116,108,101,0,0,37,108,102,0,0,0,0,0,99,98,114,36,97,110,103,101,0,0,0,0,0,0,0,0,44,32,116,104,101,110,32,0,101,120,112,101,99,116,105,110,103,32,39,109,101,97,110,39,44,32,39,103,101,111,109,101,97,110,39,44,32,39,109,101,100,105,97,110,39,44,32,39,109,105,110,39,44,32,39,109,97,120,39,44,32,39,99,49,39,44,32,39,99,50,39,44,32,39,99,51,39,32,111,114,32,39,99,52,39,0,0,0,117,115,101,114,115,116,121,108,101,115,0,0,0,0,0,0,68,117,112,108,105,99,97,116,101,100,32,111,114,32,99,111,110,116,114,97,100,105,99,116,105,110,103,32,97,114,103,117,109,101,110,116,115,32,105,110,32,100,97,116,97,102,105,108,101,32,111,112,116,105,111,110,115,0,0,0,0,0,0,0,37,77,0,0,0,0,0,0,80,108,111,116,32,116,121,112,101,32,105,115,32,110,101,105,116,104,101,114,32,102,117,110,99,116,105,111,110,32,110,111,114,32,100,97,116,97,0,0,44,37,103,112,116,0,0,0,122,114,36,97,110,103,101,0,84,104,105,115,32,99,111,112,121,32,111,102,32,103,110,117,112,108,111,116,32,99,97,110,110,111,116,32,114,101,97,100,32,112,110,103,47,103,105,102,47,106,112,101,103,32,105,109,97,103,101,115,0,0,0,0,9,112,109,51,100,32,112,108,111,116,116,101,100,32,97,116,32,0,0,0,0,0,0,0,99,52,0,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,105,110,99,114,101,109,101,110,116,32,37,115,10,0,97,120,105,115,32,114,97,110,103,101,115,32,109,117,115,116,32,98,101,32,97,98,111,118,101,32,48,32,102,111,114,32,108,111,103,32,115,99,97,108,101,33,0,0,0,0,0,0,109,105,115,115,105,110,103,32,102,111,114,109,97,116,32,115,116,114,105,110,103,0,0,0,103,112,95,115,101,116,95,112,111,105,110,116,115,105,122,101,40,37,46,51,102,41,59,10,0,0,0,0,0,0,0,0,121,50,114,36,97,110,103,101,0,0,0,0,0,0,0,0,101,120,112,108,105,99,105,116,32,40,100,114,97,119,32,112,109,51,100,32,115,117,114,102,97,99,101,32,97,99,99,111,114,100,105,110,103,32,116,111,32,115,116,121,108,101,41,0,99,51,0,0,0,0,0,0,32,115,105,122,101,32,37,115,32,37,46,51,102,44,37,46,51,102,44,37,46,51,102,0,115,101,116,32,97,117,116,111,115,99,97,108,101,32,107,101,101,112,102,105,120,0,0,0,102,111,114,109,36,97,116,0,115,113,114,116,40,115,113,114,116,40,120,41,41,0,0,0,112,32,58,61,32,117,110,105,116,115,113,117,97,114,101,32,120,121,115,99,97,108,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,32,115,104,105,102,116,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,59,10,0,0,121,114,36,97,110,103,101,0,105,109,112,108,105,99,105,116,32,40,112,109,51,100,32,100,114,97,119,32,102,111,114,32,97,108,108,32,115,117,114,102,97,99,101,115,41,0,0,0,99,50,0,0,0,0,0,0,99,104,97,114,97,99,116,101,114,0,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,97,117,116,111,115,99,97,108,101,96,32,40,115,101,116,32,97,117,116,111,115,99,97,108,101,32,107,101,101,112,102,105,120,59,32,114,101,112,108,111,116,41,0,0,0,0,0,79,112,116,105,111,110,115,32,97,114,101,32,100,101,102,97,117,108,116,44,32,115,119,97,112,32,40,115,119,97,98,41,44,32,108,105,116,116,108,101,44,32,98,105,103,44,32,109,105,100,100,108,101,32,40,112,100,112,41,0,0,0,0,0,103,112,95,115,101,116,95,108,105,110,101,119,105,100,116,104,40,37,46,51,102,41,59,10,0,0,0,0,0,0,0,0,120,50,114,36,97,110,103,101,0,0,0,0,0,0,0,0,9,112,109,51,100,32,115,116,121,108,101,32,105,115,32,37,115,10,0,0,0,0,0,0,99,49,0,0,0,0,0,0,115,99,114,101,101,110,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,98,111,114,100,101,114,96,0,112,100,112,0,0,0,0,0,99,111,110,116,101,120,116,46,116,114,109,32,115,101,116,95,99,111,108,111,114,32,117,110,107,110,111,119,110,32,99,111,108,111,114,115,112,101,99,45,62,116,121,112,101,32,37,105,0,0,0,0,0,0,0,0,120,114,36,97,110,103,101,0,9,112,111,105,110,116,115,105,122,101,32,105,115,32,37,103,10,0,0,0,0,0,0,0,103,114,97,112,104,0,0,0,96,98,117,105,108,116,105,110,45,114,101,112,108,111,116,96,0,0,0,0,0,0,0,0,109,105,100,36,100,108,101,0,76,111,99,97,108,101,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,0,0,0,111,101,69,102,70,103,71,0,99,121,99,108,101,0,0,0,37,37,103,112,95,115,101,116,95,99,111,108,111,114,40,102,114,97,99,40,37,46,52,102,41,41,59,10,0,0,0,0,110,111,99,98,109,116,105,36,99,115,0,0,0,0,0,0,9,112,111,105,110,116,105,110,116,101,114,118,97,108,98,111,120,32,105,115,32,37,103,10,0,0,0,0,0,0,0,0,115,101,99,111,110,100,0,0,117,110,115,101,116,32,103,114,105,100,0,0,0,0,0,0,108,105,116,36,116,108,101,0,107,111,105,56,36,114,0,0,103,116,0,0,0,0,0,0,103,112,95,115,101,116,95,99,111,108,111,114,40,114,103,98,40,37,51,46,50,102,44,37,51,46,50,102,44,37,51,46,50,102,41,41,59,10,0,0,99,98,109,116,105,36,99,115,0,0,0,0,0,0,0,0,113,36,117,105,116,0,0,0,9,104,111,119,101,118,101,114,32,76,67,95,67,84,89,80,69,32,105,110,32,99,117,114,114,101,110,116,32,108,111,99,97,108,101,32,105,115,32,37,115,10,0,0,0,0,0,0,71,80,86,65,76,95,0,0,102,105,114,115,116,0,0,0,115,119,97,98,0,0,0,0,43,72,73,68,68,69,78,51,68,95,81,85,65,68,84,82,69,69,32,32,0,0,0,0,103,112,95,115,101,116,95,99,111,108,111,114,40,108,116,40,37,100,41,41,59,10,0,0,110,111,122,109,116,105,36,99,115,0,0,0,0,0,0,0,9,110,111,109,105,110,97,108,32,99,104,97,114,97,99,116,101,114,32,101,110,99,111,100,105,110,103,32,105,115,32,37,115,10,0,0,0,0,0,0,103,101,111,109,101,97,110,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,103,114,105,100,96,0,0,0,115,119,97,112,0,0,0,0,32,37,115,32,112,97,116,116,101,114,110,32,37,100,32,0,110,111,115,117,114,36,102,97,99,101,0,0,0,0,0,0,115,36,109,111,111,116,104,0,110,111,32,72,79,77,69,32,102,111,117,110,100,0,0,0,101,120,116,101,110,100,95,97,116,0,0,0,0,0,0,0,102,117,110,99,116,105,111,110,32,100,101,102,105,110,105,116,105,111,110,32,101,120,112,101,99,116,101,100,0,0,0,0,45,45,40,37,46,51,102,97,44,37,46,51,102,97,41,59,10,103,112,95,100,114,97,119,40,112,41,59,10,0,0,0,122,109,116,105,36,99,115,0,73,110,115,101,114,116,0,0,9,100,101,103,114,101,101,32,115,105,103,110,32,102,111,114,32,111,117,116,112,117,116,32,105,115,32,37,115,32,10,0,102,111,110,116,112,97,116,104,95,102,117,108,108,110,97,109,101,58,32,78,111,32,80,105,112,101,32,97,108,108,111,119,101,100,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,104,101,108,112,96,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,110,111,110,45,73,78,84,71,82,32,97,114,103,117,109,101,110,116,0,0,0,0,0,45,45,99,121,99,108,101,59,10,103,112,95,100,114,97,119,40,112,41,59,10,0,0,0,110,111,121,50,109,116,105,36,99,115,0,0,0,0,0,0,9,100,101,99,105,109,97,108,115,105,103,110,32,102,111,114,32,111,117,116,112,117,116,32,104,97,115,32,100,101,102,97,117,108,116,32,118,97,108,117,101,32,40,110,111,114,109,97,108,108,121,32,39,46,39,41,10,0,0,0,0,0,0,0,68,101,112,114,101,99,97,116,101,100,32,115,121,110,116,97,120,32,45,45,45,32,105,103,110,111,114,101,100,0,0,0,67,97,110,110,111,116,32,116,111,103,103,108,101,32,108,111,103,32,115,99,97,108,101,32,102,111,114,32,118,111,108,97,116,105,108,101,32,100,97,116,97,0,0,0,0,0,0,0,101,110,100,36,105,97,110,0,104,105,100,100,101,110,32,115,111,114,116,32,101,100,103,101,115,0,0,0,0,0,0,0,117,110,100,101,102,105,110,101,100,32,102,117,110,99,116,105,111,110,58,32,37,115,0,0,103,112,95,100,111,116,40,37,46,51,102,97,44,37,46,51,102,97,41,59,10,0,0,0,121,50,109,116,105,36,99,115,0,0,0,0,0,0,0,0,9,100,101,99,105,109,97,108,115,105,103,110,32,102,111,114,32,111,117,116,112,117,116,32,105,115,32,37,115,32,10,0,101,120,112,101,99,116,105,110,103,32,102,108,117,115,104,32,39,98,101,103,105,110,39,44,32,39,99,101,110,116,101,114,39,32,111,114,32,39,101,110,100,39,0,0,0,0,0,0,32,37,115,32,37,115,32,37,115,0,0,0,0,0,0,0,82,97,115,116,101,114,65,120,101,115,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,108,111,103,96,32,121,32,108,111,103,115,99,97,108,101,32,102,111,114,32,112,108,111,116,115,44,32,122,32,97,110,100,32,99,98,32,102,111,114,32,115,112,108,111,116,115,0,0,115,107,105,112,0,0,0,0,86,105,115,105,98,108,101,32,112,105,120,101,108,32,103,114,105,100,32,104,97,115,32,97,32,115,99,97,110,32,108,105,110,101,32,115,104,111,114,116,101,114,32,116,104,97,110,32,112,114,101,118,105,111,117,115,32,115,99,97,110,32,108,105,110,101,115,46,0,0,0,0,41,59,10,0,0,0,0,0,110,111,121,109,116,105,36,99,115,0,0,0,0,0,0,0,9,100,101,99,105,109,97,108,115,105,103,110,32,102,111,114,32,105,110,112,117,116,32,105,115,32,32,37,115,32,10,0,101,36,110,100,0,0,0,0,115,101,116,32,108,111,103,32,121,50,0,0,0,0,0,0,75,101,121,32,119,111,114,100,32,96,112,101,114,112,101,110,100,105,99,117,108,97,114,96,32,105,115,32,110,111,116,32,97,108,108,111,119,101,100,32,119,105,116,104,32,96,112,108,111,116,96,32,99,111,109,109,97,110,100,0,0,0,0,0,115,113,114,116,32,115,113,114,116,0,0,0,0,0,0,0,44,100,101,110,115,105,116,121,40,48,41,0,0,0,0,0,121,109,116,105,36,99,115,0,98,36,101,103,105,110,0,0,115,101,116,32,97,114,114,111,119,32,37,100,32,102,114,111,109,32,0,0,0,0,0,0,117,110,115,101,116,32,108,111,103,32,121,50,0,0,0,0,112,101,114,112,36,101,110,100,105,99,117,108,97,114,0,0,44,112,97,116,116,101,114,110,40,37,100,41,0,0,0,0,110,111,120,50,109,116,105,36,99,115,0,0,0,0,0,0,78,111,32,102,117,114,116,104,101,114,32,111,112,116,105,111,110,115,32,97,108,108,111,119,101,100,32,97,102,116,101,114,32,39,100,101,102,97,117,108,116,115,39,0,0,0,0,0,9,108,111,103,45,102,105,108,101,32,102,111,114,32,102,105,116,115,32,105,115,32,117,110,99,104,97,110,103,101,100,32,102,114,111,109,32,116,104,101,32,101,110,118,105,114,111,110,109,101,110,116,32,100,101,102,97,117,108,116,32,111,102,10,9,39,37,115,39,10,0,0,101,120,112,101,99,116,105,110,103,32,115,116,101,112,32,118,97,108,117,101,115,32,105,44,106,0,0,0,0,0,0,0,117,110,115,101,116,32,97,114,114,111,119,10,0,0,0,0,115,101,116,32,108,111,103,32,120,50,0,0,0,0,0,0,44,100,101,110,115,105,116,121,40,37,46,50,102,41,0,0,120,50,109,116,105,36,99,115,0,0,0,0,0,0,0,0,114,111,116,36,97,116,105,111,110,0,0,0,0,0,0,0,9,108,111,103,45,102,105,108,101,32,102,111,114,32,102,105,116,115,32,105,115,32,119,97,115,32,115,101,116,32,98,121,32,116,104,101,32,117,115,101,114,32,116,111,32,98,101,32,10,9,39,37,115,39,10,0,32,112,111,105,110,116,0,0,117,110,115,101,116,32,108,111,103,32,120,50,0,0,0,0,99,111,110,116,111,117,114,32,112,111,108,121,103,111,110,0,66,97,100,32,102,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,0,0,0,0,101,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,115,32,116,111,32,117,110,115,101,116,32,114,101,99,116,97,110,103,108,101,0,44,116,114,97,110,115,112,97,114,101,110,116,0,0,0,0,110,111,120,109,116,105,36,99,115,0,0,0,0,0,0,0,32,110,111,116,0,0,0,0,10,9,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,105,115,32,116,32,102,111,114,32,99,117,114,118,101,115,10,0,0,0,0,0,0,0,115,101,116,32,108,111,103,32,121,0,0,0,0,0,0,0,99,112,52,36,51,55,0,0,32,34,37,115,34,10,0,0,103,112,95,102,105,108,108,40,112,0,0,0,0,0,0,0,120,109,116,105,36,99,115,0,112,119,100,0,0,0,0,0,9,102,105,116,32,119,105,108,108,37,115,32,112,108,97,99,101,32,112,97,114,97,109,101,116,101,114,32,101,114,114,111,114,115,32,105,110,32,118,97,114,105,97,98,108,101,115,10,0,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,98,106,101,99,116,32,116,121,112,101,0,0,0,0,0,0,0,0,117,110,115,101,116,32,108,111,103,32,121,0,0,0,0,0,111,114,105,103,36,105,110,0,43,85,83,69,95,77,79,85,83,69,32,32,0,0,0,0,45,45,99,121,99,108,101,59,10,0,0,0,0,0,0,0,110,111,99,98,100,116,105,36,99,115,0,0,0,0,0,0,114,116,0,0,0,0,0,0,79,70,70,0,0,0,0,0,117,110,107,110,111,119,110,32,111,98,106,101,99,116,0,0,115,101,116,32,108,111,103,32,120,0,0,0,0,0,0,0,116,114,97,110,115,36,112,111,115,101,0,0,0,0,0,0,110,111,99,111,110,36,116,111,117,114,115,0,0,0,0,0,35,32,32,32,32,69,79,70,10,0,0,0,0,0,0,0,72,79,77,69,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,58,39,0,0,0,102,117,110,99,116,105,111,110,32,99,111,110,116,97,105,110,115,32,116,111,111,32,109,97,110,121,32,112,97,114,97,109,101,116,101,114,115,0,0,0,45,45,40,37,46,51,102,97,44,37,46,51,102,97,41,0,99,98,100,116,105,36,99,115,0,0,0,0,0,0,0,0,83,121,115,95,82,101,113,0,79,78,0,0,0,0,0,0,112,111,108,121,36,103,111,110,0,0,0,0,0,0,0,0,108,111,97,100,112,97,116,104,95,102,111,112,101,110,0,0,117,110,115,101,116,32,108,111,103,32,120,0,0,0,0,0,115,99,97,110,0,0,0,0,10,32,32,0,0,0,0,0,110,111,122,100,116,105,36,99,115,0,0,0,0,0,0,0,9,112,111,108,97,114,32,105,115,32,37,115,10,0,0,0,32,114,111,116,97,116,101,32,98,121,32,37,100,0,0,0,115,101,116,32,108,111,103,32,122,0,0,0,0,0,0,0,110,111,102,108,105,112,0,0,37,72,0,0,0,0,0,0,104,105,100,100,101,110,32,115,111,114,116,97,114,114,97,121,0,0,0,0,0,0,0,0,40,37,46,51,102,97,44,37,46,51,102,97,41,0,0,0,122,100,116,105,36,99,115,0,100,101,103,114,101,101,115,10,0,0,0,0,0,0,0,0,117,110,115,101,116,32,108,111,103,32,122,0,0,0,0,0,80,83,105,122,101,95,50,0,102,108,105,112,0,0,0,0,86,105,115,105,98,108,101,32,112,105,120,101,108,32,103,114,105,100,32,104,97,115,32,97,32,115,99,97,110,32,108,105,110,101,32,108,111,110,103,101,114,32,116,104,97,110,32,112,114,101,118,105,111,117,115,32,115,99,97,110,32,108,105,110,101,115,46,0,0,0,0,0,112,32,58,61,32,0,0,0,110,111,121,50,100,116,105,36,99,115,0,0,0,0,0,0,114,97,100,105,97,110,115,10,0,0,0,0,0,0,0,0,115,101,116,32,108,97,98,101,108,32,37,100,32,34,37,115,34,32,97,116,32,0,0,0,115,101,116,32,108,111,103,32,99,98,0,0,0,0,0,0,102,108,105,112,122,0,0,0,115,113,114,116,40,120,41,0,32,32,99,108,105,112,32,99,117,114,114,101,110,116,112,105,99,116,117,114,101,32,116,111,32,117,110,105,116,115,113,117,97,114,101,32,120,121,115,99,97,108,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,32,115,104,105,102,116,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,59,41,59,10,0,0,0,0,121,50,100,116,105,36,99,115,0,0,0,0,0,0,0,0,9,65,110,103,108,101,115,32,97,114,101,32,105,110,32,0,115,97,109,112,108,105,110,103,32,114,97,116,101,32,109,117,115,116,32,98,101,32,62,32,49,59,32,115,97,109,112,108,105,110,103,32,117,110,99,104,97,110,103,101,100,0,0,0,117,110,115,101,116,32,108,97,98,101,108,10,0,0,0,0,114,101,99,116,0,0,0,0,117,110,115,101,116,32,108,111,103,32,99,98,0,0,0,0,77,117,115,116,32,115,112,101,99,105,102,121,32,97,32,115,97,109,112,108,105,110,103,32,97,114,114,97,121,32,115,105,122,101,32,98,101,102,111,114,101,32,105,110,100,105,99,97,116,105,110,103,32,102,108,105,112,32,105,110,32,115,101,99,111,110,100,32,100,105,109,101,110,115,105,111,110,0,0,0,100,114,97,119,32,98,105,116,109,97,112,105,109,97,103,101,32,40,37,117,44,37,117,44,105,109,103,41,32,120,121,115,99,97,108,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,32,115,104,105,102,116,101,100,32,40,37,46,51,102,97,44,37,46,51,102,97,41,59,10,0,0,0,0,0,110,111,121,100,116,105,36,99,115,0,0,0,0,0,0,0,9,115,97,109,112,108,105,110,103,32,114,97,116,101,32,105,115,32,37,100,44,32,37,100,10,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,118,97,108,117,101,32,102,111,114,32,115,105,122,101,0,0,117,110,115,101,116,32,107,101,121,10,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,110,101,97,114,101,115,116,45,108,111,103,96,32,116,111,103,103,108,101,32,108,111,103,115,99,97,108,101,32,111,102,32,97,120,105,115,32,110,101,97,114,101,115,116,32,99,117,114,115,111,114,0,0,0,0,102,108,105,112,121,0,0,0,78,101,101,100,32,50,32,116,111,32,55,32,117,115,105,110,103,32,115,112,101,99,115,0,100,114,97,119,32,105,109,97,103,101,40,10,32,32,0,0,121,100,116,105,36,99,115,0,9,105,115,111,32,115,97,109,112,108,105,110,103,32,114,97,116,101,32,105,115,32,37,100,44,32,37,100,10,0,0,0,110,111,115,113,36,117,97,114,101,0,0,0,0,0,0,0,115,101,116,32,107,101,121,32,37,115,111,112,97,113,117,101,10,0,0,0,0,0,0,0,116,117,114,110,105,110,103,32,109,111,117,115,101,32,111,102,102,46,10,0,0,0,0,0,102,108,105,112,120,0,0,0,9,102,111,110,116,112,97,116,104,32,105,115,32,101,109,112,116,121,10,0,0,0,0,0,120,50,94,123,37,100,125,0,105,110,118,97,108,105,100,32,97,120,105,115,0,0,0,0,105,109,97,32,58,61,32,34,37,37,10,0,0,0,0,0,110,111,120,50,100,116,105,36,99,115,0,0,0,0,0,0,105,110,100,101,112,101,110,100,101,110,116,108,121,32,115,99,97,108,101,100,0,0,0,0,110,111,114,97,36,116,105,111,0,0,0,0,0,0,0,0,10,115,101,116,32,107,101,121,32,109,97,120,99,111,108,117,109,110,115,32,37,100,32,109,97,120,114,111,119,115,32,37,100,0,0,0,0,0,0,0,116,117,114,110,105,110,103,32,109,111,117,115,101,32,111,110,46,10,0,0,0,0,0,0,120,95,109,105,110,51,100,32,115,104,111,117,108,100,32,110,111,116,32,101,113,117,97,108,32,120,95,109,97,120,51,100,33,0,0,0,0,0,0,0,67,117,114,114,101,110,116,108,121,32,110,111,116,32,115,117,112,112,111,114,116,105,110,103,32,116,104,114,101,101,45,100,105,109,101,110,115,105,111,110,97,108,32,115,97,109,112,108,105,110,103,0,0,0,0,0,105,115,111,36,95,56,56,53,57,95,49,0,0,0,0,0,32,116,121,112,101,10,0,0])
.concat([37,48,50,120,0,0,0,0,120,50,100,116,105,36,99,115,0,0,0,0,0,0,0,0,112,114,36,105,110,116,0,0,111,110,32,116,104,101,32,115,97,109,101,32,115,99,97,108,101,0,0,0,0,0,0,0,114,97,36,116,105,111,0,0,112,114,101,36,102,105,120,0,10,115,101,116,32,107,101,121,32,37,115,105,110,118,101,114,116,32,115,97,109,112,108,101,110,32,37,103,32,115,112,97,99,105,110,103,32,37,103,32,119,105,100,116,104,32,37,103,32,104,101,105,103,104,116,32,37,103,32,0,0,0,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,109,111,117,115,101,96,0,0,100,122,0,0,0,0,0,0,45,85,83,69,95,67,87,68,82,67,32,32,0,0,0,0,34,59,10,0,0,0,0,0,110,111,120,100,116,105,36,99,115,0,0,0,0,0,0,0,116,114,0,0,0,0,0,0,120,47,121,47,122,0,0,0,115,113,36,117,97,114,101,0,110,111,98,111,120,0,0,0,96,98,117,105,108,116,105,110,45,112,114,101,118,105,111,117,115,45,109,111,117,115,101,45,102,111,114,109,97,116,96,0,116,0,0,0,0,0,0,0,77,117,115,116,32,115,112,101,99,105,102,121,32,97,32,115,97,109,112,108,105,110,103,32,97,114,114,97,121,32,115,105,122,101,32,98,101,102,111,114,101,32,105,110,100,105,99,97,116,105,110,103,32,115,112,97,99,105,110,103,32,105,110,32,115,101,99,111,110,100,32,100,105,109,101,110,115,105,111,110,0,0,0,0,0,0,0,0,32,37,115,32,115,111,108,105,100,32,37,46,50,102,32,0,110,111,104,105,100,100,101,110,36,51,100,0,0,0,0,0,115,121,110,116,97,120,32,101,114,114,111,114,0,0,0,0,37,48,50,120,37,48,50,120,37,48,50,120,0,0,0,0,120,100,116,105,36,99,115,0,83,99,114,111,108,108,95,76,111,99,107,0,0,0,0,0,120,47,121,0,0,0,0,0,101,120,116,114,97,110,101,111,117,115,32,111,114,32,111,117,116,45,111,102,45,111,114,100,101,114,32,97,114,103,117,109,101,110,116,115,32,105,110,32,115,101,116,32,97,114,114,111,119,115,116,121,108,101,0,0,115,119,105,116,99,104,101,100,32,109,111,117,115,101,32,102,111,114,109,97,116,32,102,114,111,109,32,37,108,100,32,116,111,32,37,108,100,10,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,117,98,115,116,114,105,110,103,32,114,97,110,103,101,32,111,112,101,114,97,116,111,114,32,97,112,112,108,105,101,100,32,116,111,32,110,111,110,45,83,84,82,73,78,71,32,116,121,112,101,0,0,0,0,0,100,114,0,0,0,0,0,0,37,37,10,0,0,0,0,0,110,111,99,98,116,105,36,99,115,0,0,0,0,0,0,0,9,9,37,115,32,97,120,101,115,32,97,114,101,32,37,115,10,0,0,0,0,0,0,0,97,114,114,111,119,115,116,121,108,101,0,0,0,0,0,0,110,111,97,117,116,111,116,105,116,108,101,115,0,0,0,0,96,98,117,105,108,116,105,110,45,110,101,120,116,45,109,111,117,115,101,45,102,111,114,109,97,116,96,0,0,0,0,0,100,121,0,0,0,0,0,0,42,65,108,108,42,32,101,100,103,101,115,32,117,110,100,101,102,105,110,101,100,32,111,114,32,111,117,116,32,111,102,32,114,97,110,103,101,44,32,116,104,117,115,32,110,111,32,112,108,111,116,46,0,0,0,0,105,109,103,32,58,61,32,34,37,37,10,0,0,0,0,0,99,98,116,105,36,99,115,0,37,103,32,114,111,116,95,120,44,32,37,103,32,114,111,116,95,122,44,32,37,103,32,115,99,97,108,101,44,32,37,103,32,115,99,97,108,101,95,122,10,0,0,0,0,0,0,0,111,98,106,101,99,116,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,32,102,97,105,108,117,114,101,0,0,0,97,117,116,111,116,105,116,108,101,115,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,100,101,99,114,101,109,101,110,116,45,99,108,105,112,98,111,97,114,100,109,111,100,101,96,0,0,0,0,0,0,0,80,83,105,122,101,95,49,0,100,116,0,0,0,0,0,0,105,109,97,103,101,0,0,0,67,111,110,84,101,88,116,32,119,105,116,104,32,77,101,116,97,70,117,110,32,40,102,111,114,32,80,68,70,32,100,111,99,117,109,101,110,116,115,41,0,0,0,0,0,0,0,0,110,111,114,116,105,36,99,115,0,0,0,0,0,0,0,0,109,97,112,10,0,0,0,0,111,98,106,101,99,116,0,0,97,117,116,111,116,105,116,108,101,115,32,99,111,108,117,109,110,104,101,97,100,0,0,0,115,119,105,116,99,104,101,100,32,99,108,105,112,98,111,97,114,100,32,102,111,114,109,97,116,32,102,114,111,109,32,37,108,100,32,116,111,32,37,108,100,10,0,0,0,0,0,0,100,120,0,0,0,0,0,0,115,113,114,116,0,0,0,0,99,111,110,116,101,120,116,0,114,116,105,36,99,115,0,0,9,118,105,101,119,32,105,115,32,0,0,0,0,0,0,0,73,110,99,111,110,115,105,115,116,101,110,116,32,111,112,116,105,111,110,115,0,0,0,0,96,98,117,105,108,116,105,110,45,105,110,99,114,101,109,101,110,116,45,99,108,105,112,98,111,97,114,100,109,111,100,101,96,0,0,0,0,0,0,0,97,114,114,36,97,121,0,0,77,101,116,97,80,111,115,116,32,112,108,111,116,116,105,110,103,32,115,116,97,110,100,97,114,100,0,0,0,0,0,0,110,111,122,116,105,36,99,115,0,0,0,0,0,0,0,0,9,115,117,114,102,97,99,101,32,105,115,32,37,115,100,114,97,119,110,10,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,111,114,32,100,117,112,108,105,99,97,116,101,32,111,112,116,105,111,110,0,0,0,0,0,0,0,0,76,101,102,116,0,0,0,0,110,111,116,0,0,0,0,0,111,102,102,36,115,101,116,0,115,99,97,36,108,101,0,0,114,101,99,36,111,114,100,0,117,112,36,119,97,114,100,115,0,0,0,0,0,0,0,0,100,111,119,110,36,119,97,114,100,115,0,0,0,0,0,0,114,111,119,36,115,102,105,114,115,116,0,0,0,0,0,0,99,111,108,36,117,109,110,115,102,105,114,115,116,0,0,0,116,105,116,108,101,0,0,0,109,112,0,0,0,0,0,0,106,115,36,100,105,114,0,0,122,116,105,36,99,115,0,0,102,115,105,122,101,0,0,0,100,114,97,119,110,0,0,0,102,105,108,108,99,36,111,108,111,114,0,0,0,0,0,0,104,111,114,105,122,111,110,116,97,108,0,0,0,0,0,0,32,106,115,100,105,114,32,34,37,115,34,0,0,0,0,0,100,105,115,116,97,110,99,101,32,116,111,32,114,117,108,101,114,32,119,105,108,108,32,37,115,32,98,101,32,115,104,111,119,110,32,105,110,32,112,111,108,97,114,32,99,111,111,114,100,105,110,97,116,101,115,46,10,0,0,0,0,0,0,0,32,116,105,116,108,101,32,34,37,115,34,0,0,0,0,0,32,109,111,117,115,105,110,103,0,0,0,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,102,105,108,101,116,121,112,101,59,32,116,114,121,32,34,115,104,111,119,32,100,97,116,97,102,105,108,101,32,98,105,110,97,114,121,32,102,105,108,101,116,121,112,101,115,34,0,0,0,0,0,32,115,116,97,110,100,97,108,111,110,101,0,0,0,0,0,32,110,97,109,101,32,34,37,115,34,0,0,0,0,0,0,9,115,121,115,116,101,109,32,102,111,110,116,112,97,116,104,32,105,115,32,0,0,0,0,32,102,111,110,116,115,99,97,108,101,32,37,103,0,0,0,120,50,94,123,37,100,125,89,105,0,0,0,0,0,0,0,32,101,110,104,97,110,99,101,100,0,0,0,0,0,0,0,121,111,117,32,99,97,110,39,116,32,99,104,97,110,103,101,32,116,104,101,32,111,117,116,112,117,116,32,105,110,32,109,117,108,116,105,112,108,111,116,32,109,111,100,101,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,37,115,32,102,115,105,122,101,32,37,103,32,108,119,32,37,103,0,0,0,0,0,0,0,77,101,116,97,102,111,110,116,32,112,108,111,116,116,105,110,103,32,115,116,97,110,100,97,114,100,0,0,0,0,0,0,32,115,105,122,101,32,37,100,44,37,100,0,0,0,0,0,110,111,121,50,116,105,36,99,115,0,0,0,0,0,0,0,32,98,117,116,116,0,0,0,114,101,109,111,118,101,100,0,102,99,0,0,0,0,0,0,118,101,114,116,105,99,97,108,0,0,0,0,0,0,0,0,32,114,111,117,110,100,101,100,0,0,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,112,111,108,97,114,100,105,115,116,97,110,99,101,96,0,0,32,100,97,115,104,108,101,110,103,116,104,32,37,51,46,49,102,0,0,0,0,0,0,0,32,115,111,108,105,100,0,0,117,116,102,36,56,0,0,0,32,100,97,115,104,101,100,0,32,32,99,111,108,111,114,0,98,97,110,100,0,0,0,0,102,111,110,116,58,32,101,120,112,101,99,116,105,110,103,32,115,116,114,105,110,103,0,0,105,108,108,101,103,97,108,32,106,97,118,97,115,99,114,105,112,116,32,102,117,110,99,116,105,111,110,32,110,97,109,101,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,97,32,106,97,118,97,115,99,114,105,112,116,32,102,117,110,99,116,105,111,110,32,110,97,109,101,0,0,0,0,103,101,116,99,111,108,111,114,46,99,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,97,110,32,72,84,77,76,32,116,105,116,108,101,32,115,116,114,105,110,103,0,0,109,102,0,0,0,0,0,0,60,47,100,105,118,62,10,10,60,47,98,111,100,121,62,10,60,47,104,116,109,108,62,10,0,0,0,0,0,0,0,0,121,50,116,105,36,99,115,0,112,36,108,111,116,0,0,0,60,47,116,100,62,60,47,116,114,62,60,47,116,97,98,108,101,62,10,0,0,0,0,0,9,104,105,100,100,101,110,32,115,117,114,102,97,99,101,32,105,115,32,37,115,10,0,0,73,110,118,97,108,105,100,32,99,111,109,109,97,110,100,32,45,32,100,105,100,32,121,111,117,32,109,101,97,110,32,39,117,110,115,101,116,32,115,116,121,108,101,32,114,101,99,116,97,110,103,108,101,39,63,0,110,111,111,117,116,36,112,117,116,0,0,0,0,0,0,0,32,37,115,32,37,115,32,37,115,114,101,118,101,114,115,101,32,37,115,101,110,104,97,110,99,101,100,32,37,115,32,0,60,116,97,98,108,101,32,99,108,97,115,115,61,34,112,108,111,116,34,62,10,60,116,114,62,60,116,100,62,10,32,32,32,32,60,99,97,110,118,97,115,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,34,32,119,105,100,116,104,61,34,37,100,34,32,104,101,105,103,104,116,61,34,37,100,34,32,116,97,98,105,110,100,101,120,61,34,48,34,62,10,9,83,111,114,114,121,44,32,121,111,117,114,32,98,114,111,119,115,101,114,32,115,101,101,109,115,32,110,111,116,32,116,111,32,115,117,112,112,111,114,116,32,116,104,101,32,72,84,77,76,32,53,32,99,97,110,118,97,115,32,101,108,101,109,101,110,116,10,32,32,32,32,60,47,99,97,110,118,97,115,62,10,60,47,116,100,62,60,47,116,114,62,10,60,47,116,97,98,108,101,62,10,0,0,0,0,0,0,0,99,111,109,109,117,110,105,99,97,116,105,111,110,32,99,111,109,109,97,110,100,115,32,119,105,108,108,32,98,101,32,101,99,104,111,101,100,46,10,0,60,47,116,100,62,60,116,100,62,10,0,0,0,0,0,0,60,47,116,97,98,108,101,62,60,47,116,100,62,60,47,116,114,62,10,60,47,116,97,98,108,101,62,10,0,0,0,0,102,105,108,101,36,116,121,112,101,0,0,0,0,0,0,0,60,116,114,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,48,34,62,121,50,38,110,98,115,112,59,60,47,116,100,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,49,34,62,60,115,112,97,110,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,95,121,50,34,62,38,110,98,115,112,59,60,47,115,112,97,110,62,60,47,116,100,62,32,60,47,116,114,62,10,0,0,0,0,0,0,0,60,116,114,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,48,34,62,120,50,38,110,98,115,112,59,60,47,116,100,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,49,34,62,60,115,112,97,110,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,95,120,50,34,62,38,110,98,115,112,59,60,47,115,112,97,110,62,60,47,116,100,62,32,60,47,116,114,62,10,0,0,0,0,0,0,0,60,116,97,98,108,101,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,32,105,100,61,34,103,110,117,112,108,111,116,95,109,111,117,115,101,98,111,120,34,32,98,111,114,100,101,114,61,49,62,10,60,116,114,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,48,34,62,120,38,110,98,115,112,59,60,47,116,100,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,49,34,62,60,115,112,97,110,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,95,120,34,62,38,110,98,115,112,59,60,47,115,112,97,110,62,60,47,116,100,62,32,60,47,116,114,62,10,60,116,114,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,48,34,62,121,38,110,98,115,112,59,60,47,116,100,62,32,60,116,100,32,99,108,97,115,115,61,34,109,98,49,34,62,60,115,112,97,110,32,105,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,95,121,34,62,38,110,98,115,112,59,60,47,115,112,97,110,62,60,47,116,100,62,32,60,47,116,114,62,10,0,0,43,66,73,78,65,82,89,95,68,65,84,65,32,32,0,0,32,32,32,32,32,32,60,47,116,97,98,108,101,62,10,32,32,60,47,116,100,62,60,47,116,114,62,10,60,47,116,97,98,108,101,62,60,47,116,100,62,60,47,116,114,62,60,116,114,62,60,116,100,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,62,10,0,0,0,0,0,0,0,0,9,60,47,116,114,62,10,0,76,97,84,101,88,32,116,101,120,100,114,97,119,32,101,110,118,105,114,111,110,109,101,110,116,0,0,0,0,0,0,0,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,62,32,60,47,116,100,62,10,0,0,0,0,110,111,121,116,105,36,99,115,0,0,0,0,0,0,0,0,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,116,111,103,103,108,101,95,112,108,111,116,40,34,103,112,95,112,108,111,116,95,37,100,34,41,62,37,100,60,47,116,100,62,10,0,0,9,84,114,121,32,116,111,32,115,101,116,32,76,79,67,75,69,68,32,97,115,112,101,99,116,32,114,97,116,105,111,32,116,111,32,37,103,58,49,46,48,10,0,0,0,0,0,0,99,36,101,110,116,114,101,0,32,98,111,116,116,111,109,0,9,60,116,114,62,10,0,0,101,99,104,111,105,110,103,32,111,102,32,99,111,109,109,117,110,105,99,97,116,105,111,110,32,99,111,109,109,97,110,100,115,32,105,115,32,116,117,114,110,101,100,32,111,102,102,46,10,0,0,0,0,0,0,0,60,116,97,98,108,101,32,99,108,97,115,115,61,34,109,98,108,101,102,116,34,62,60,116,114,62,60,116,100,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,62,10,60,116,97,98,108,101,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,32,98,111,114,100,101,114,61,48,62,10,32,32,60,116,114,62,60,116,100,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,62,10,32,32,32,32,60,116,97,98,108,101,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,32,105,100,61,34,103,110,117,112,108,111,116,95,109,111,117,115,101,98,111,120,34,32,98,111,114,100,101,114,61,48,62,10,32,32,32,32,60,116,114,62,60,116,100,32,99,108,97,115,115,61,34,109,98,104,34,62,60,47,116,100,62,60,47,116,114,62,10,32,32,32,32,60,116,114,62,60,116,100,32,99,108,97,115,115,61,34,109,98,104,34,62,10,32,32,32,32,32,32,60,116,97,98,108,101,32,99,108,97,115,115,61,34,109,111,117,115,101,98,111,120,34,62,10,9,60,116,114,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,62,60,47,116,100,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,116,111,103,103,108,101,95,103,114,105,100,62,60,105,109,103,32,115,114,99,61,34,37,115,103,114,105,100,46,112,110,103,34,32,105,100,61,34,103,110,117,112,108,111,116,95,103,114,105,100,95,105,99,111,110,34,32,99,108,97,115,115,61,34,105,99,111,110,45,105,109,97,103,101,34,32,97,108,116,61,34,35,34,32,116,105,116,108,101,61,34,116,111,103,103,108,101,32,103,114,105,100,34,62,60,47,116,100,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,117,110,122,111,111,109,62,60,105,109,103,32,115,114,99,61,34,37,115,112,114,101,118,105,111,117,115,122,111,111,109,46,112,110,103,34,32,105,100,61,34,103,110,117,112,108,111,116,95,117,110,122,111,111,109,95,105,99,111,110,34,32,99,108,97,115,115,61,34,105,99,111,110,45,105,109,97,103,101,34,32,97,108,116,61,34,117,110,122,111,111,109,34,32,116,105,116,108,101,61,34,117,110,122,111,111,109,34,62,60,47,116,100,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,114,101,122,111,111,109,62,60,105,109,103,32,115,114,99,61,34,37,115,110,101,120,116,122,111,111,109,46,112,110,103,34,32,105,100,61,34,103,110,117,112,108,111,116,95,114,101,122,111,111,109,95,105,99,111,110,34,32,99,108,97,115,115,61,34,105,99,111,110,45,105,109,97,103,101,34,32,97,108,116,61,34,114,101,122,111,111,109,34,32,116,105,116,108,101,61,34,114,101,122,111,111,109,34,62,60,47,116,100,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,116,111,103,103,108,101,95,122,111,111,109,95,116,101,120,116,62,60,105,109,103,32,115,114,99,61,34,37,115,116,101,120,116,122,111,111,109,46,112,110,103,34,32,105,100,61,34,103,110,117,112,108,111,116,95,116,101,120,116,122,111,111,109,95,105,99,111,110,34,32,99,108,97,115,115,61,34,105,99,111,110,45,105,109,97,103,101,34,32,97,108,116,61,34,122,111,111,109,32,116,101,120,116,34,32,116,105,116,108,101,61,34,122,111,111,109,32,116,101,120,116,32,119,105,116,104,32,112,108,111,116,34,62,60,47,116,100,62,10,9,32,32,60,116,100,32,99,108,97,115,115,61,34,105,99,111,110,34,32,111,110,99,108,105,99,107,61,103,110,117,112,108,111,116,46,112,111,112,117,112,95,104,101,108,112,40,41,62,60,105,109,103,32,115,114,99,61,34,37,115,104,101,108,112,46,112,110,103,34,32,105,100,61,34,103,110,117,112,108,111,116,95,104,101,108,112,95,105,99,111,110,34,32,99,108,97,115,115,61,34,105,99,111,110,45,105,109,97,103,101,34,32,97,108,116,61,34,63,34,32,116,105,116,108,101,61,34,104,101,108,112,34,62,60,47,116,100,62,10,9,60,47,116,114,62,10,0,0,0,0,0,60,47,115,99,114,105,112,116,62,10,60,108,105,110,107,32,116,121,112,101,61,34,116,101,120,116,47,99,115,115,34,32,104,114,101,102,61,34,37,115,103,110,117,112,108,111,116,95,109,111,117,115,101,46,99,115,115,34,32,114,101,108,61,34,115,116,121,108,101,115,104,101,101,116,34,62,10,60,47,104,101,97,100,62,10,60,98,111,100,121,32,111,110,108,111,97,100,61,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,40,41,59,32,103,110,117,112,108,111,116,46,105,110,105,116,40,41,59,34,32,111,110,99,111,110,116,101,120,116,109,101,110,117,61,34,114,101,116,117,114,110,32,102,97,108,115,101,59,34,62,10,10,60,100,105,118,32,99,108,97,115,115,61,34,103,110,117,112,108,111,116,34,62,10,0,0,0,0,100,97,116,97,102,105,108,101,32,99,111,108,117,109,110,0,115,101,116,32,97,117,116,111,115,99,97,108,101,32,37,115,102,105,120,109,97,120,10,0,125,10,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,116,105,109,101,97,120,105,115,95,120,32,61,32,34,34,59,10,0,0,0,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,116,105,109,101,97,120,105,115,95,120,32,61,32,34,37,115,34,59,10,0,0,0,0,0,0,0,0,99,117,114,118,101,32,112,111,105,110,116,115,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,32,37,115,10,0,105,116,101,114,97,116,105,111,110,32,108,105,110,107,101,100,32,108,105,115,116,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,97,120,32,61,32,37,46,51,102,59,10,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,105,110,32,61,32,37,46,51,102,59,10,0,116,101,120,100,114,97,119,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,104,101,105,103,104,116,32,61,32,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,109,97,120,32,45,32,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,109,105,110,59,10,0,0,0,0,121,116,105,36,99,115,0,0,80,97,117,115,101,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,119,105,100,116,104,32,61,32,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,97,120,32,45,32,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,105,110,59,10,0,0,0,0,0,9,78,111,32,97,116,116,101,109,112,116,32,116,111,32,99,111,110,116,114,111,108,32,97,115,112,101,99,116,32,114,97,116,105,111,10,0,0,0,0,85,110,114,101,99,111,103,105,110,105,122,101,100,32,111,98,106,101,99,116,32,116,121,112,101,0,0,0,0,0,0,0,32,116,111,112,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,108,111,103,97,120,105,115,95,114,32,61,32,37,100,59,10,0,0,0,108,102,32,116,111,107,101,110,115,0,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,118,101,114,98,111,115,101,96,0,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,108,111,103,97,120,105,115,95,121,32,61,32,37,100,59,10,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,115,117,98,115,116,114,105,110,103,32,114,97,110,103,101,32,115,112,101,99,105,102,105,101,114,115,32,109,117,115,116,32,104,97,118,101,32,105,110,116,101,103,101,114,32,118,97,108,117,101,115,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,108,111,103,97,120,105,115,95,120,32,61,32,37,100,59,10,0,0,0,100,102,95,110,111,95,117,115,101,95,115,112,101,99,115,32,61,61,32,48,32,124,124,32,111,117,116,112,117,116,32,61,61,32,100,102,95,110,111,95,117,115,101,95,115,112,101,99,115,32,124,124,32,111,117,116,112,117,116,32,61,61,32,109,97,120,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,50,109,105,110,32,61,32,34,110,111,110,101,34,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,50,109,97,120,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,50,109,105,110,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,50,109,105,110,32,61,32,34,110,111,110,101,34,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,50,109,97,120,0,76,97,84,101,88,32,112,105,99,116,117,114,101,32,101,110,118,105,114,111,110,109,101,110,116,32,119,105,116,104,32,80,83,84,114,105,99,107,115,32,109,97,99,114,111,115,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,50,109,105,110,0,110,111,120,50,116,105,36,99,115,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,114,109,105,110,32,61,32,37,103,59,10,0,0,0,9,84,114,121,32,116,111,32,115,101,116,32,97,115,112,101,99,116,32,114,97,116,105,111,32,116,111,32,37,103,58,49,46,48,10,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,112,111,108,121,103,111,110,32,115,121,110,116,97,120,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,109,97,120,0,0,115,101,116,32,115,105,122,101,32,115,113,117,97,114,101,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,121,109,105,110,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,97,120,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,58,32,117,110,107,110,111,119,110,32,99,111,108,117,109,110,32,116,121,112,101,0,0,0,0,0,37,37,46,37,100,102,0,0,37,115,32,61,32,37,103,59,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,97,120,105,115,95,120,109,105,110,0,0,37,115,32,61,32,37,100,59,10,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,104,101,105,103,104,116,32,61,32,37,46,49,102,59,10,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,119,105,100,116,104,32,61,32,37,46,49,102,59,10,0,0,0,0,0,112,115,116,114,105,99,107,115,0,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,121,116,111,112,32,61,32,37,46,49,102,59,10,0,0,0,0,0,0,120,50,116,105,36,99,115,0,103,110,117,112,108,111,116,46,112,108,111,116,95,121,98,111,116,32,61,32,37,46,49,102,59,10,0,0,0,0,0,0,9,115,105,122,101,32,105,115,32,115,99,97,108,101,100,32,98,121,32,37,103,44,37,103,10,0,0,0,0,0,0,0,80,111,108,121,103,111,110,32,105,115,32,110,111,116,32,99,108,111,115,101,100,32,45,32,97,100,100,105,110,103,32,101,120,116,114,97,32,118,101,114,116,101,120,10,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,120,109,97,120,32,61,32,37,46,49,102,59,10,0,0,0,0,0,0,115,101,116,32,115,105,122,101,32,110,111,115,113,117,97,114,101,0,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,120,109,105,110,32,61,32,37,46,49,102,59,10,0,0,0,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,116,101,114,109,95,121,109,97,120,32,61,32,37,100,59,10,0,0,0,113,117,111,116,101,0,0,0,103,110,117,112,108,111,116,46,112,108,111,116,95,116,101,114,109,95,120,109,97,120,32,61,32,37,100,59,10,0,0,0,78,117,109,98,101,114,32,111,102,32,112,105,120,101,108,115,32,99,97,110,110,111,116,32,98,101,32,102,97,99,116,111,114,101,100,32,105,110,116,111,32,105,110,116,101,103,101,114,115,32,109,97,116,99,104,105,110,103,32,103,114,105,100,46,32,78,32,61,32,37,100,32,32,75,32,61,32,37,100,0,67,101,110,116,101,114,95,50,0,0,0,0,0,0,0,0,10,47,47,32,112,108,111,116,32,98,111,117,110,100,97,114,105,101,115,32,97,110,100,32,97,120,105,115,32,115,99,97,108,105,110,103,32,105,110,102,111,114,109,97,116,105,111,110,32,102,111,114,32,109,111,117,115,105,110,103,32,10,0,0,67,97,110,118,97,115,84,101,120,116,70,117,110,99,116,105,111,110,115,46,101,110,97,98,108,101,40,99,116,120,41,59,10,99,116,120,46,115,116,114,111,107,101,83,116,121,108,101,32,61,32,34,114,103,98,40,50,49,53,44,50,49,53,44,50,49,53,41,34,59,10,99,116,120,46,108,105,110,101,87,105,100,116,104,32,61,32,37,46,49,103,59,10,10,0,0,99,116,120,46,102,105,108,108,83,116,121,108,101,32,61,32,34,37,115,34,59,10,99,116,120,46,102,105,108,108,82,101,99,116,40,48,44,48,44,37,100,44,37,100,41,59,10,0,37,115,95,37,115,95,37,115,0,0,0,0,0,0,0,0,99,116,120,46,108,105,110,101,67,97,112,32,61,32,34,37,115,34,59,32,99,116,120,46,108,105,110,101,74,111,105,110,32,61,32,34,37,115,34,59,10,0,0,0,0,0,0,0,112,108,97,105,110,32,84,101,88,32,119,105,116,104,32,80,111,115,116,83,99,114,105,112,116,32,92,115,112,101,99,105,97,108,115,0,0,0,0,0,103,110,117,112,108,111,116,46,100,97,115,104,108,101,110,103,116,104,32,61,32,37,100,59,10,0,0,0,0,0,0,0,110,111,120,116,105,36,99,115,0,0,0,0,0,0,0,0,47,47,32,115,104,111,114,116,32,102,111,114,109,115,32,111,102,32,99,111,109,109,97,110,100,115,32,112,114,111,118,105,100,101,100,32,98,121,32,103,110,117,112,108,111,116,95,99,111,109,109,111,110,46,106,115,10,102,117,110,99,116,105,111,110,32,68,84,32,32,40,100,116,41,32,32,123,103,110,117,112,108,111,116,46,100,97,115,104,116,121,112,101,40,100,116,41,59,125,59,10,102,117,110,99,116,105,111,110,32,68,83,32,32,40,120,44,121,41,32,123,103,110,117,112,108,111,116,46,100,97,115,104,115,116,97,114,116,40,120,44,121,41,59,125,59,10,102,117,110,99,116,105,111,110,32,68,76,32,32,40,120,44,121,41,32,123,103,110,117,112,108,111,116,46,100,97,115,104,115,116,101,112,40,120,44,121,41,59,125,59,10,102,117,110,99,116,105,111,110,32,77,32,32,32,40,120,44,121,41,32,123,105,102,32,40,103,110,117,112,108,111,116,46,112,97,116,116,101,114,110,46,108,101,110,103,116,104,32,62,32,48,41,32,68,83,40,120,44,121,41,59,32,101,108,115,101,32,103,110,117,112,108,111,116,46,77,40,120,44,121,41,59,125,59,10,102,117,110,99,116,105,111,110,32,76,32,32,32,40,120,44,121,41,32,123,105,102,32,40,103,110,117,112,108,111,116,46,112,97,116,116,101,114,110,46,108,101,110,103,116,104,32,62,32,48,41,32,68,76,40,120,44,121,41,59,32,101,108,115,101,32,103,110,117,112,108,111,116,46,76,40,120,44,121,41,59,125,59,10,102,117,110,99,116,105,111,110,32,68,111,116,32,40,120,44,121,41,32,123,103,110,117,112,108,111,116,46,68,111,116,40,120,47,49,48,46,44,121,47,49,48,46,41,59,125,59,10,102,117,110,99,116,105,111,110,32,80,116,32,32,40,78,44,120,44,121,44,119,41,32,123,103,110,117,112,108,111,116,46,80,116,40,78,44,120,47,49,48,46,44,121,47,49,48,46,44,119,47,49,48,46,41,59,125,59,10,102,117,110,99,116,105,111,110,32,82,32,32,32,40,120,44,121,44,119,44,104,41,32,123,103,110,117,112,108,111,116,46,82,40,120,44,121,44,119,44,104,41,59,125,59,10,102,117,110,99,116,105,111,110,32,84,32,32,32,40,120,44,121,44,102,111,110,116,115,105,122,101,44,106,117,115,116,105,102,121,44,115,116,114,105,110,103,41,32,123,103,110,117,112,108,111,116,46,84,40,120,44,121,44,102,111,110,116,115,105,122,101,44,106,117,115,116,105,102,121,44,115,116,114,105,110,103,41,59,125,59,10,102,117,110,99,116,105,111,110,32,84,82,32,32,40,120,44,121,44,97,110,103,108,101,44,102,111,110,116,115,105,122,101,44,106,117,115,116,105,102,121,44,115,116,114,105,110,103,41,32,123,103,110,117,112,108,111,116,46,84,82,40,120,44,121,44,97,110,103,108,101,44,102,111,110,116,115,105,122,101,44,106,117,115,116,105,102,121,44,115,116,114,105,110,103,41,59,125,59,10,102,117,110,99,116,105,111,110,32,98,112,32,32,40,120,44,121,41,32,123,103,110,117,112,108,111,116,46,98,112,40,120,44,121,41,59,125,59,10,102,117,110,99,116,105,111,110,32,99,102,112,32,40,41,32,123,103,110,117,112,108,111,116,46,99,102,112,40,41,59,125,59,10,102,117,110,99,116,105,111,110,32,99,102,115,112,40,41,32,123,103,110,117,112,108,111,116,46,99,102,115,112,40,41,59,125,59,10,10,0,9,111,114,105,103,105,110,32,105,115,32,115,101,116,32,116,111,32,37,103,44,37,103,10,0,0,0,0,0,0,0,0,112,111,108,121,103,111,110,32,118,101,114,116,101,120,0,0,47,47,32,71,110,117,112,108,111,116,32,118,101,114,115,105,111,110,32,37,115,46,37,115,10,0,0,0,0,0,0,0,115,101,116,32,115,105,122,101,32,114,97,116,105,111,32,45,49,0,0,0,0,0,0,0,47,47,32,82,101,105,110,105,116,105,97,108,105,122,101,32,109,111,117,115,101,32,116,114,97,99,107,105,110,103,32,97,110,100,32,122,111,111,109,32,102,111,114,32,116,104,105,115,32,112,97,114,116,105,99,117,108,97,114,32,112,108,111,116,10,105,102,32,40,40,116,121,112,101,111,102,40,103,110,117,112,108,111,116,46,97,99,116,105,118,101,95,112,108,111,116,41,32,61,61,32,34,117,110,100,101,102,105,110,101,100,34,32,124,124,32,103,110,117,112,108,111,116,46,97,99,116,105,118,101,95,112,108,111,116,32,33,61,32,37,115,41,32,32,38,38,32,32,116,121,112,101,111,102,40,103,110,117,112,108,111,116,46,109,111,117,115,101,95,117,112,100,97,116,101,41,32,33,61,32,34,117,110,100,101,102,105,110,101,100,34,41,32,123,10,32,32,103,110,117,112,108,111,116,46,97,99,116,105,118,101,95,112,108,111,116,95,110,97,109,101,32,61,32,34,37,115,34,59,10,32,32,103,110,117,112,108,111,116,46,97,99,116,105,118,101,95,112,108,111,116,32,61,32,37,115,59,10,32,32,99,97,110,118,97,115,46,111,110,109,111,117,115,101,109,111,118,101,32,61,32,103,110,117,112,108,111,116,46,109,111,117,115,101,95,117,112,100,97,116,101,59,10,32,32,99,97,110,118,97,115,46,111,110,109,111,117,115,101,117,112,32,61,32,103,110,117,112,108,111,116,46,122,111,111,109,95,105,110,59,10,32,32,99,97,110,118,97,115,46,111,110,109,111,117,115,101,100,111,119,110,32,61,32,103,110,117,112,108,111,116,46,115,97,118,101,99,108,105,99,107,59,10,32,32,99,97,110,118,97,115,46,111,110,107,101,121,112,114,101,115,115,32,61,32,103,110,117,112,108,111,116,46,100,111,95,104,111,116,107,101,121,59,10,32,32,105,102,32,40,99,97,110,118,97,115,46,97,116,116,97,99,104,69,118,101,110,116,41,32,123,99,97,110,118,97,115,46,97,116,116,97,99,104,69,118,101,110,116,40,39,109,111,117,115,101,111,118,101,114,39,44,32,37,115,41,59,125,10,32,32,101,108,115,101,32,105,102,32,40,99,97,110,118,97,115,46,97,100,100,69,118,101,110,116,76,105,115,116,101,110,101,114,41,32,123,99,97,110,118,97,115,46,97,100,100,69,118,101,110,116,76,105,115,116,101,110,101,114,40,39,109,111,117,115,101,111,118,101,114,39,44,32,37,115,44,32,102,97,108,115,101,41,59,125,32,10,32,32,103,110,117,112,108,111,116,46,122,111,111,109,101,100,32,61,32,102,97,108,115,101,59,10,32,32,103,110,117,112,108,111,116,46,122,111,111,109,95,97,120,105,115,95,119,105,100,116,104,32,61,32,48,59,10,32,32,103,110,117,112,108,111,116,46,122,111,111,109,95,105,110,95,112,114,111,103,114,101,115,115,32,61,32,102,97,108,115,101,59,10,32,32,103,110,117,112,108,111,116,46,112,111,108,97,114,95,109,111,100,101,32,61,32,37,115,59,10,32,32,99,116,120,46,99,108,101,97,114,82,101,99,116,40,48,44,48,44,37,100,44,37,100,41,59,10,125,10,0,102,117,110,99,116,105,111,110,32,37,115,40,41,32,123,10,99,97,110,118,97,115,32,61,32,100,111,99,117,109,101,110,116,46,103,101,116,69,108,101,109,101,110,116,66,121,73,100,40,34,37,115,34,41,59,10,99,116,120,32,61,32,99,97,110,118,97,115,46,103,101,116,67,111,110,116,101,120,116,40,34,50,100,34,41,59,10,0,76,97,115,116,32,112,111,105,110,116,32,105,110,32,116,104,101,32,98,105,110,97,114,121,32,102,105,108,101,32,100,105,100,32,110,111,116,32,109,97,116,99,104,32,116,104,101,32,115,112,101,99,105,102,105,101,100,32,96,117,115,105,110,103,96,32,99,111,108,117,109,110,115,0,0,0,0,0,0,0,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,62,10,118,97,114,32,99,97,110,118,97,115,44,32,99,116,120,59,10,103,110,117,112,108,111,116,46,103,114,105,100,95,108,105,110,101,115,32,61,32,116,114,117,101,59,10,103,110,117,112,108,111,116,46,122,111,111,109,101,100,32,61,32,102,97,108,115,101,59,10,103,110,117,112,108,111,116,46,97,99,116,105,118,101,95,112,108,111,116,95,110,97,109,101,32,61,32,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,34,59,10,10,102,117,110,99,116,105,111,110,32,103,110,117,112,108,111,116,95,99,97,110,118,97,115,40,41,32,123,10,99,97,110,118,97,115,32,61,32,100,111,99,117,109,101,110,116,46,103,101,116,69,108,101,109,101,110,116,66,121,73,100,40,34,103,110,117,112,108,111,116,95,99,97,110,118,97,115,34,41,59,10,99,116,120,32,61,32,99,97,110,118,97,115,46,103,101,116,67,111,110,116,101,120,116,40,34,50,100,34,41,59,10,0,0,0,0,0,0,0,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,62,103,110,117,112,108,111,116,46,105,110,105,116,32,61,32,102,117,110,99,116,105,111,110,40,41,32,123,125,59,60,47,115,99,114,105,112,116,62,10,0,0,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,62,32,103,110,117,112,108,111,116,46,104,101,108,112,95,85,82,76,32,61,32,34,37,115,47,99,97,110,118,97,115,95,104,101,108,112,46,104,116,109,108,34,59,32,60,47,115,99,114,105,112,116,62,10,0,0,0,0,60,115,99,114,105,112,116,32,115,114,99,61,34,37,115,103,110,117,112,108,111,116,95,109,111,117,115,101,46,106,115,34,62,60,47,115,99,114,105,112,116,62,10,0,0,0,0,0,71,80,86,65,76,95,68,65,84,65,0,0,0,0,0,0,120,94,52,0,0,0,0,0,60,115,99,114,105,112,116,32,115,114,99,61,34,37,115,103,110,117,112,108,111,116,95,100,97,115,104,101,100,108,105,110,101,115,46,106,115,34,62,60,47,115,99,114,105,112,116,62,10,0,0,0,0,0,0,0,112,115,116,101,120,0,0,0,99,97,110,118,97,115,116,101,120,116,0,0,0,0,0,0,120,116,105,36,99,115,0,0,99,97,110,118,97,115,109,97,116,104,0,0,0,0,0,0,9,116,101,114,109,105,110,97,108,32,116,121,112,101,32,105,115,32,117,110,107,110,111,119,110,10,0,0,0,0,0,0,69,120,112,101,99,116,105,110,103,32,97,114,99,32,91,60,98,101,103,105,110,62,58,60,101,110,100,62,93,0,0,0,97,116,32,0,0,0,0,0,60,33,45,45,91,105,102,32,73,69,93,62,60,115,99,114,105,112,116,32,116,121,112,101,61,34,116,101,120,116,47,106,97,118,97,115,99,114,105,112,116,34,32,115,114,99,61,34,101,120,99,97,110,118,97,115,46,106,115,34,62,60,47,115,99,114,105,112,116,62,60,33,91,101,110,100,105,102,93,45,45,62,10,60,115,99,114,105,112,116,32,115,114,99,61,34,37,115,37,115,46,106,115,34,62,60,47,115,99,114,105,112,116,62,10,60,115,99,114,105,112,116,32,115,114,99,61,34,37,115,103,110,117,112,108,111,116,95,99,111,109,109,111,110,46,106,115,34,62,60,47,115,99,114,105,112,116,62,10,0,96,98,117,105,108,116,105,110,45,116,111,103,103,108,101,45,114,97,116,105,111,96,0,0,60,109,101,116,97,32,104,116,116,112,45,101,113,117,105,118,61,34,99,111,110,116,101,110,116,45,116,121,112,101,34,32,99,111,110,116,101,110,116,61,34,116,101,120,116,47,104,116,109,108,59,32,99,104,97,114,115,101,116,61,85,84,70,45,56,34,62,10,0,0,0,0,45,86,0,0,0,0,0,0,71,110,117,112,108,111,116,32,67,97,110,118,97,115,32,71,114,97,112,104,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,116,111,32,99,114,101,97,116,101,32,118,101,99,116,111,114,0,0,0,0,0,0,60,33,68,79,67,84,89,80,69,32,72,84,77,76,62,10,60,104,116,109,108,62,10,60,104,101,97,100,62,10,60,116,105,116,108,101,62,37,115,60,47,116,105,116,108,101,62,10,0,0,0,0,0,0,0,0,99,116,120,46,98,101,103,105,110,80,97,116,104,40,41,59,10,0,0,0,0,0,0,0,77,40,37,117,44,37,117,41,59,10,0,0,0,0,0,0,76,40,37,117,44,37,117,41,59,10,0,0,0,0,0,0,76,79,71,0,0,0,0,0,68,84,40,103,110,117,112,108,111,116,46,100,97,115,104,112,97,116,116,101,114,110,51,41,59,10,0,0,0,0,0,0,76,97,84,101,88,32,112,105,99,116,117,114,101,32,101,110,118,105,114,111,110,109,101,110,116,32,119,105,116,104,32,80,111,115,116,83,99,114,105,112,116,32,92,115,112,101,99,105,97,108,115,0,0,0,0,0,68,84,40,103,110,117,112,108,111,116,46,100,97,115,104,112,97,116,116,101,114,110,37,49,100,41,59,10,0,0,0,0,99,98,108,36,97,98,101,108,0,0,0,0,0,0,0,0,114,103,98,40,49,55,49,44,50,49,52,44,48,48,48,41,0,0,0,0,0,0,0,0,32,32,32,116,101,114,109,105])
.concat([110,97,108,32,116,121,112,101,32,105,115,32,37,115,32,37,115,10,0,0,0,0,0,0,58,0,0,0,0,0,0,0,114,109,97,114,103,105,110,0,114,103,98,40,50,49,52,44,48,48,48,44,49,50,48,41,0,0,0,0,0,0,0,0,110,101,120,116,32,122,111,111,109,46,10,0,0,0,0,0,114,103,98,40,50,53,53,44,50,48,52,44,48,48,48,41,0,0,0,0,0,0,0,0,114,103,98,40,49,54,51,44,49,52,53,44,50,53,53,41,0,0,0,0,0,0,0,0,103,112,98,105,110,97,114,121,32,109,97,116,114,105,120,32,114,111,119,0,0,0,0,0,114,103,98,40,50,49,52,44,50,49,52,44,48,54,57,41,0,0,0,0,0,0,0,0,114,103,98,40,48,48,48,44,49,53,51,44,49,54,49,41,0,0,0,0,0,0,0,0,114,103,98,40,50,53,53,44,49,53,51,44,48,48,48,41,0,0,0,0,0,0,0,0,114,103,98,40,48,48,48,44,48,48,48,44,49,52,56,41,0,0,0,0,0,0,0,0,77,65,88,0,0,0,0,0,114,103,98,40,48,50,49,44,49,49,55,44,48,54,57,41,0,0,0,0,0,0,0,0,112,115,108,97,116,101,120,0,114,103,98,40,48,48,48,44,50,53,53,44,50,53,53,41,0,0,0,0,0,0,0,0,122,108,36,97,98,101,108,0,114,103,98,40,49,57,48,44,48,48,48,44,49,57,48,41,0,0,0,0,0,0,0,0,65,110,103,108,101,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,108,109,97,114,103,105,110,0,114,103,98,40,48,48,48,44,48,48,48,44,50,50,53,41,0,0,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,122,111,111,109,45,110,101,120,116,96,32,103,111,32,116,111,32,110,101,120,116,32,122,111,111,109,32,105,110,32,116,104,101,32,122,111,111,109,32,115,116,97,99,107,0,0,0,114,103,98,40,48,48,48,44,49,55,49,44,48,48,48,41,0,0,0,0,0,0,0,0,114,103,98,40,50,53,53,44,48,48,48,44,48,48,48,41,0,0,0,0,0,0,0,0,66,105,110,97,114,121,32,100,97,116,97,32,116,121,112,101,32,117,110,107,110,111,119,110,0,0,0,0,0,0,0,0,114,103,98,40,49,54,48,44,49,54,48,44,49,54,48,41,0,0,0,0,0,0,0,0,114,103,98,40,48,48,48,44,48,48,48,44,48,48,48,41,0,0,0,0,0,0,0,0,9,102,111,110,116,112,97,116,104,32,105,115,32,0,0,0,114,103,98,40,50,53,53,44,50,53,53,44,50,53,53,41,0,0,0,0,0,0,0,0,32,107,77,71,84,80,69,90,89,0,0,0,0,0,0,0,34,41,59,10,0,0,0,0,10,9,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,105,115,32,120,32,102,111,114,32,99,117,114,118,101,115,44,32,120,47,121,32,102,111,114,32,115,117,114,102,97,99,101,115,10,0,0,0,0,0,46,37,48,42,100,0,0,0,77,73,78,0,0,0,0,0,84,40,37,100,44,37,100,44,37,46,49,102,44,34,37,115,34,44,34,0,0,0,0,0,76,97,84,101,88,32,112,105,99,116,117,114,101,32,101,110,118,105,114,111,110,109,101,110,116,32,117,115,105,110,103,32,103,114,97,112,104,105,99,120,32,112,97,99,107,97,103,101,0,0,0,0,0,0,0,0,84,82,40,37,100,44,37,100,44,37,100,44,37,46,49,102,44,34,37,115,34,44,34,0,121,50,108,36,97,98,101,108,0,0,0,0,0,0,0,0,82,105,103,104,116,0,0,0,97,114,99,0,0,0,0,0,98,109,97,114,103,105,110,0,80,116,40,37,100,44,37,100,44,37,100,44,37,46,49,102,41,59,10,0,0,0,0,0,112,114,101,118,105,111,117,115,32,122,111,111,109,46,10,0,68,111,116,40,37,100,44,37,100,41,59,10,0,0,0,0,82,40,37,100,44,37,100,44,37,100,44,37,100,41,59,10,0,0,0,0,0,0,0,0,67,111,117,108,100,110,39,116,32,115,108,117,114,112,32,37,108,100,32,98,121,116,101,115,32,40,114,101,116,117,114,110,32,119,97,115,32,37,122,100,41,10,0,0,0,0,0,0,100,101,102,36,97,117,108,116,0,0,0,0,0,0,0,0,99,116,120,46,108,105,110,101,87,105,100,116,104,32,61,32,37,103,59,10,0,0,0,0,116,104,105,115,0,0,0,0,120,111,114,0,0,0,0,0,99,116,120,46,115,116,114,111,107,101,83,116,121,108,101,32,61,32,34,37,115,34,59,10,0,0,0,0,0,0,0,0,114,103,98,40,37,48,51,100,44,37,48,51,100,44,37,48,51,100,41,0,0,0,0,0,37,115,37,99,0,0,0,0,71,80,86,65,76,0,0,0,114,103,98,40,37,51,100,44,37,51,100,44,37,51,100,41,37,99,0,0,0,0,0,0,101,112,115,108,97,116,101,120,0,0,0,0,0,0,0,0,114,103,98,97,40,50,53,53,44,50,53,53,44,50,53,53,44,48,46,48,48,41,0,0,121,108,36,97,98,101,108,0,100,102,95,114,101,97,100,98,105,110,97,114,121,32,115,108,117,114,112,101,114,0,0,0,112,97,36,117,115,101,0,0,114,103,98,97,40,37,49,49,46,49,49,115,44,37,52,46,50,102,41,37,99,0,0,0,116,105,99,115,32,97,114,101,32,105,110,32,37,115,32,111,102,32,112,108,111,116,10,0,114,97,100,105,117,115,0,0,111,117,116,36,112,117,116,0,116,109,97,114,103,105,110,0,99,102,115,112,40,41,59,10,0,0,0,0,0,0,0,0,96,98,117,105,108,116,105,110,45,122,111,111,109,45,112,114,101,118,105,111,117,115,96,32,103,111,32,116,111,32,112,114,101,118,105,111,117,115,32,122,111,111,109,32,105,110,32,116,104,101,32,122,111,111,109,32,115,116,97,99,107,0,0,0,99,102,112,40,41,59,10,0,76,40,37,100,44,32,37,100,41,59,10,0,0,0,0,0,98,112,40,37,100,44,32,37,100,41,59,10,0,0,0,0,99,116,120,46,102,105,108,108,83,116,121,108,101,32,61,32,34,37,115,34,59,10,0,0,68,84,40,103,110,117,112,108,111,116,46,115,111,108,105,100,41,59,10,0,0,0,0,0,45,66,65,67,75,87,65,82,68,83,95,67,79,77,80,65,84,73,66,73,76,73,84,89,32,32,0,0,0,0,0,0,109,0,0,0,0,0,0,0,71,80,86,65,76,95,84,69,82,77,95,89,83,73,90,69,0,0,0,0,0,0,0,0,77,126,60,62,37,87,61,38,64,0,0,0,0,0,0,0,76,97,84,101,88,32,112,105,99,116,117,114,101,32,101,110,118,105,114,111,110,109,101,110,116,0,0,0,0,0,0,0,65,99,101,70,86,63,97,98,100,69,103,104,110,111,112,113,117,0,0,0,0,0,0,0,120,50,108,36,97,98,101,108,0,0,0,0,0,0,0,0,32,74,84,118,94,95,34,42,121,107,76,115,120,122,0,0,9,120,121,112,108,97,110,101,32,116,105,99,115,108,101,118,101,108,32,105,115,32,37,103,10,0,0,0,0,0,0,0,99,101,110,36,116,101,114,0,111,117,116,115,105,100,101,0,40,41,91,93,123,125,92,0,102,116,114,0,0,0,0,0,106,96,39,44,59,58,33,46,0,0,0,0,0,0,0,0,83,99,97,110,32,115,105,122,101,32,111,102,32,109,97,116,114,105,120,32,105,115,32,122,101,114,111,0,0,0,0,0,115,101,116,32,97,117,116,111,115,99,97,108,101,32,37,115,102,105,120,109,105,110,10,0,105,73,108,124,0,0,0,0,84,104,105,115,32,112,108,111,116,32,115,116,121,108,101,32,105,115,32,111,110,108,121,32,102,111,114,32,100,97,116,97,102,105,108,101,115,32,44,32,114,101,118,101,114,116,105,110,103,32,116,111,32,34,112,111,105,110,116,115,34,0,0,0,99,116,120,46,115,116,114,111,107,101,40,41,59,10,0,0,99,116,120,46,108,105,110,101,87,105,100,116,104,32,61,32,115,97,118,101,87,105,100,116,104,59,10,125,32,47,47,32,103,114,105,100,95,108,105,110,101,115,10,0,0,0,0,0,115,121,110,116,97,120,58,32,32,103,110,117,112,108,111,116,32,45,101,32,34,99,111,109,109,97,110,100,115,34,10,0,105,102,32,40,103,110,117,112,108,111,116,46,103,114,105,100,95,108,105,110,101,115,41,32,123,10,118,97,114,32,115,97,118,101,87,105,100,116,104,32,61,32,99,116,120,46,108,105,110,101,87,105,100,116,104,59,10,99,116,120,46,108,105,110,101,87,105,100,116,104,32,61,32,99,116,120,46,108,105,110,101,87,105,100,116,104,32,42,32,48,46,53,59,10,0,0,71,80,86,65,76,95,84,69,82,77,95,88,83,73,90,69,0,0,0,0,0,0,0,0,125,32,47,47,32,69,110,100,32,37,115,95,112,108,111,116,95,37,100,32,10,0,0,0,114,101,102,114,101,115,104,32,110,111,116,32,112,111,115,115,105,98,108,101,32,97,110,100,32,114,101,112,108,111,116,32,105,115,32,100,105,115,97,98,108,101,100,0,0,0,0,0,108,97,116,101,120,0,0,0,105,102,32,40,116,121,112,101,111,102,40,103,110,117,112,108,111,116,46,104,105,100,101,95,37,115,95,112,108,111,116,95,37,100,41,32,61,61,32,34,117,110,100,101,102,105,110,101,100,34,124,124,32,33,103,110,117,112,108,111,116,46,104,105,100,101,95,37,115,95,112,108,111,116,95,37,100,41,32,123,10,0,0,0,0,0,0,0,120,108,36,97,98,101,108,0,67,108,101,97,114,0,0,0,103,112,0,0,0,0,0,0,9,120,121,112,108,97,110,101,32,105,110,116,101,114,99,101,112,116,115,32,122,32,97,120,105,115,32,97,116,32,37,103,10,0,0,0,0,0,0,0,69,120,112,101,99,116,105,110,103,32,116,111,32,111,114,32,114,116,111,0,0,0,0,0,105,110,115,105,100,101,0,0,99,116,120,46,99,108,111,115,101,80,97,116,104,40,41,59,10,0,0,0,0,0,0,0,108,111,97,100,47,101,118,97,108,32,110,101,115,116,101,100,32,116,111,111,32,100,101,101,112,108,121,0,0,0,0,0,59,32,115,101,116,32,120,50,114,91,37,32,35,103,58,37,32,35,103,93,59,32,115,101,116,32,121,50,114,91,37,32,35,103,58,37,32,35,103,93,0,0,0,0,0,0,0,0,119,105,100,36,116,104,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,110,111,110,45,83,84,82,73,78,71,32,97,114,103,117,109,101,110,116,32,116,111,32,115,116,114,115,116,114,116,0,108,105,36,110,101,119,105,100,116,104,0,0,0,0,0,0,100,102,95,110,111,95,98,105,110,95,99,111,108,115,0,0,110,111,114,36,111,116,97,116,101,0,0,0,0,0,0,0,119,105,110,36,119,111,114,100,54,0,0,0,0,0,0,0,110,111,102,36,111,110,116,108,105,115,116,0,0,0,0,0,108,97,36,110,100,115,99,97,112,101,0,0,0,0,0,0,71,80,86,65,76,95,84,69,82,77,95,89,77,65,88,0,32,120,37,48,50,120,37,48,50,120,37,48,50,120,0,0,87,51,67,32,83,99,97,108,97,98,108,101,32,86,101,99,116,111,114,32,71,114,97,112,104,105,99,115,32,100,114,105,118,101,114,0,0,0,0,0,110,111,102,111,110,116,108,105,115,116,0,0,0,0,0,0,99,98,100,97,36,116,97,0,37,115,32,37,115,32,37,115,32,37,115,32,37,115,32,119,105,100,116,104,32,37,100,32,108,105,110,101,119,105,100,116,104,32,37,100,32,34,37,115,34,32,37,100,0,0,0,0,85,110,107,110,111,119,110,32,109,105,110,105,116,105,99,32,116,121,112,101,32,105,110,32,115,104,111,119,95,109,116,105,99,115,40,41,0,0,0,0,114,101,108,97,116,105,118,101,32,99,111,111,114,100,105,110,97,116,101,115,32,109,117,115,116,32,109,97,116,99,104,32,105,110,32,116,121,112,101,0,115,101,116,32,107,101,121,32,0,0,0,0,0,0,0,0,37,115,44,37,100,0,0,0,115,101,116,32,120,114,91,37,46,49,50,103,58,37,46,49,50,103,93,59,32,115,101,116,32,121,114,91,37,46,49,50,103,58,37,46,49,50,103,93,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,99,111,108,111,114,32,115,112,101,99,44,32,109,117,115,116,32,98,101,32,120,82,82,71,71,66,66,0,0,0,0,0,120,37,50,104,120,37,50,104,120,37,50,104,120,0,0,0,100,102,95,109,97,120,95,98,105,110,105,110,102,111,95,99,111,108,115,32,62,32,100,102,95,110,111,95,98,105,110,95,99,111,108,115,0,0,0,0,37,32,103,0,0,0,0,0,119,105,100,116,104,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,108,105,110,101,119,105,100,116,104,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,115,101,116,32,104,105,100,100,101,110,51,100,32,37,115,32,111,102,102,115,101,116,32,37,100,32,116,114,105,97,110,103,108,101,112,97,116,116,101,114,110,32,37,108,100,32,117,110,100,101,102,105,110,101,100,32,37,100,32,37,115,97,108,116,100,105,97,103,111,110,97,108,32,37,115,98,101,110,116,111,118,101,114,10,0,0,0,0,99,103,109,32,112,111,108,121,108,105,110,101,115,0,0,0,37,46,51,49,115,44,37,100,0,0,0,0,0,0,0,0,71,80,86,65,76,95,84,69,82,77,95,89,77,73,78,0,80,73,67,84,85,82,69,49,0,0,0,0,0,0,0,0,80,111,115,116,83,99,114,105,112,116,32,103,114,97,112,104,105,99,115,44,32,105,110,99,108,117,100,105,110,103,32,69,80,83,70,32,101,109,98,101,100,100,101,100,32,102,105,108,101,115,32,40,42,46,101,112,115,41,0,0,0,0,0,0,67,71,77,32,102,111,110,116,32,108,105,115,116,0,0,0,122,100,97,36,116,97,0,0,71,110,117,112,108,111,116,32,118,101,114,115,105,111,110,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,44,32,67,111,109,112,117,116,101,114,32,71,114,97,112,104,105,99,115,32,77,101,116,97,102,105,108,101,32,118,101,114,115,105,111,110,32,49,32,112,101,114,32,77,73,76,45,68,45,50,56,48,48,51,65,47,66,65,83,73,67,45,49,46,37,100,0,0,0,0,0,0,9,109,105,110,111,114,32,37,115,116,105,99,115,32,97,114,101,32,100,114,97,119,110,32,119,105,116,104,32,37,100,32,115,117,98,105,110,116,101,114,118,97,108,115,32,98,101,116,119,101,101,110,32,109,97,106,111,114,32,120,116,105,99,32,109,97,114,107,115,10,0,0,114,116,111,0,0,0,0,0,84,105,109,101,115,32,66,111,108,100,32,79,98,108,105,113,117,101,0,0,0,0,0,0,117,110,122,111,111,109,46,10,0,0,0,0,0,0,0,0,84,105,109,101,115,32,79,98,108,105,113,117,101,0,0,0,67,111,117,114,105,101,114,32,66,111,108,100,32,73,116,97,108,105,99,0,0,0,0,0,109,97,120,32,60,61,32,77,65,88,68,65,84,65,67,79,76,83,0,0,0,0,0,0,73,109,97,103,101,32,103,114,105,100,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,32,120,32,50,46,10,10,0,0,0,0,67,111,117,114,105,101,114,32,73,116,97,108,105,99,0,0,72,101,108,118,101,116,105,99,97,32,66,111,108,100,32,73,116,97,108,105,99,0,0,0,67,101,110,116,101,114,95,49,0,0,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,32,73,116,97,108,105,99,0,0,0,0,0,0,0,0,49,53,0,0,0,0,0,0,71,80,86,65,76,95,84,69,82,77,95,88,77,65,88,0,83,99,114,105,112,116,0,0,112,111,115,116,115,99,114,105,112,116,0,0,0,0,0,0,90,97,112,102,68,105,110,103,98,97,116,115,0,0,0,0,121,50,100,97,36,116,97,0,72,101,114,115,104,101,121,47,83,121,109,98,111,108,95,77,97,116,104,0,0,0,0,0,9,109,105,110,111,114,32,37,115,116,105,99,115,32,97,114,101,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,10,0,0,0,0,0,0,0,116,111,0,0,0,0,0,0,115,101,116,32,107,101,121,32,116,105,116,108,101,32,34,37,115,34,0,0,0,0,0,0,72,101,114,115,104,101,121,47,83,121,109,98,111,108,95,83,101,116,95,50,0,0,0,0,96,98,117,105,108,116,105,110,45,117,110,122,111,111,109,96,0,0,0,0,0,0,0,0,72,101,114,115,104,101,121,47,83,121,109,98,111,108,95,83,101,116,95,49,0,0,0,0,72,101,114,115,104,101,121,47,71,111,116,104,105,99,95,73,116,97,108,105,97,110,0,0,100,97,116,97,95,102,112,32,33,61,32,78,85,76,76,0,72,101,114,115,104,101,121,47,71,111,116,104,105,99,95,69,110,103,108,105,115,104,0,0,72,101,114,115,104,101,121,47,71,111,116,104,105,99,95,71,101,114,109,97,110,0,0,0,72,101,114,115,104,101,121,47,84,114,105,112,108,101,120,95,73,116,97,108,105,99,0,0,72,101,114,115,104,101,121,47,84,114,105,112,108,101,120,95,82,111,109,97,110,0,0,0,71,80,86,65,76,95,84,69,82,77,95,88,77,73,78,0,100,117,112,32,109,117,108,32,100,117,112,32,109,117,108,0,72,101,114,115,104,101,121,47,68,117,112,108,101,120,95,82,111,109,97,110,0,0,0,0,70,73,71,32,103,114,97,112,104,105,99,115,32,108,97,110,103,117,97,103,101,32,102,111,114,32,88,70,73,71,32,103,114,97,112,104,105,99,115,32,101,100,105,116,111,114,0,0,72,101,114,115,104,101,121,47,67,111,109,112,108,101,120,95,67,121,114,105,108,108,105,99,0,0,0,0,0,0,0,0,121,100,97,36,116,97,0,0,72,101,114,115,104,101,121,47,67,111,109,112,108,101,120,95,73,116,97,108,105,99,0,0,9,109,105,110,111,114,32,37,115,116,105,99,115,32,97,114,101,32,111,102,102,32,102,111,114,32,108,105,110,101,97,114,32,115,99,97,108,101,115,10,9,109,105,110,111,114,32,37,115,116,105,99,115,32,97,114,101,32,99,111,109,112,117,116,101,100,32,97,117,116,111,109,97,116,105,99,97,108,108,121,32,102,111,114,32,108,111,103,32,115,99,97,108,101,115,10,0,0,0,0,0,0,0,0,102,114,111,109,0,0,0,0,37,115,115,101,116,32,114,97,120,105,115,10,0,0,0,0,72,101,114,115,104,101,121,47,67,111,109,112,108,101,120,95,83,99,114,105,112,116,0,0,96,98,117,105,108,116,105,110,45,114,111,116,97,116,101,45,114,105,103,104,116,96,32,111,110,108,121,32,102,111,114,32,115,112,108,111,116,115,59,32,60,115,104,105,102,116,62,32,105,110,99,114,101,97,115,101,115,32,97,109,111,117,110,116,0,0,0,0,0,0,0,0,72,101,114,115,104,101,121,47,67,111,109,112,108,101,120,95,71,114,101,101,107,0,0,0,72,101,114,115,104,101,121,47,67,111,109,112,108,101,120,95,82,111,109,97,110,0,0,0,9,32,32,37,115,0,0,0,72,101,114,115,104,101,121,47,83,105,109,112,108,101,120,95,83,99,114,105,112,116,0,0,72,101,114,115,104,101,121,47,83,105,109,112,108,101,120,95,71,114,101,101,107,0,0,0,72,101,114,115,104,101,121,47,83,105,109,112,108,101,120,95,82,111,109,97,110,0,0,0,72,101,114,115,104,101,121,47,67,97,114,116,111,103,114,97,112,104,105,99,95,71,114,101,101,107,0,0,0,0,0,0,71,80,86,65,76,95,84,69,82,77,95,87,73,78,68,79,87,73,68,0,0,0,0,0,72,101,114,115,104,101,121,47,67,97,114,116,111,103,114,97,112,104,105,99,95,82,111,109,97,110,0,0,0,0,0,0,102,105,103,0,0,0,0,0,67,71,77,32,99,111,108,111,114,32,116,97,98,108,101,0,120,50,100,97,36,116,97,0,48,32,60,61,32,108,101,110,103,116,104,0,0,0,0,0,9,109,105,110,111,114,32,37,115,116,105,99,115,32,97,114,101,32,111,102,102,10,0,0,85,110,107,110,111,119,110,32,111,98,106,101,99,116,32,116,121,112,101,0,0,0,0,0,40,48,32,60,61,32,99,103,109,95,105,100,41,32,38,38,32,40,99,103,109,95,105,100,32,60,32,49,50,56,41,0,96,98,117,105,108,116,105,110,45,114,111,116,97,116,101,45,117,112,96,32,111,110,108,121,32,102,111,114,32,115,112,108,111,116,115,59,32,60,115,104,105,102,116,62,32,105,110,99,114,101,97,115,101,115,32,97,109,111,117,110,116,0,0,0,40,48,32,60,61,32,99,108,97,115,115,41,32,38,38,40,99,108,97,115,115,32,60,49,54,41,0,0,0,0,0,0,118,97,108,117,101,32,60,61,32,51,50,55,54,55,0,0,9,84,104,105,115,32,118,101,114,115,105,111,110,32,111,102,32,103,110,117,112,108,111,116,32,117,110,100,101,114,115,116,97,110,100,115,32,116,104,101,32,102,111,108,108,111,119,105,110,103,32,98,105,110,97,114,121,32,102,105,108,101,32,116,121,112,101,115,58,10,0,0,45,51,50,55,54,56,32,60,61,32,118,97,108,117,101,0,111,110,108,121,32,54,32,114,97,110,103,101,32,115,112,101,99,115,32,97,114,101,32,112,101,114,109,105,116,116,101,100,0,0,0,0,0,0,0,0,99,111,108,111,117,114,36,0,99,111,108,111,114,36,0,0,71,80,86,65,76,95,80,87,68,0,0,0,0,0,0,0,37,115,32,34,37,115,34,32,37,100,44,37,48,46,49,102,44,37,48,46,49,102,44,37,48,46,49,102,0,0,0,0,69,110,104,97,110,99,101,100,32,77,101,116,97,102,105,108,101,32,102,111,114,109,97,116,0,0,0,0,0,0,0,0,83,119,105,116,122,101,114,108,97,110,100,76,105,103,104,116,0,0,0,0,0,0,0,0,120,100,97,36,116,97,0,0,37,37,33,80,83,45,65,100,111,98,101,45,50,46,48,32,69,80,83,70,45,49,46,50,10,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,37,37,37,37,84,101,109,112,108,97,116,101,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,37,37,37,37,69,110,100,67,111,109,109,101,110,116,115,10,37,37,37,37,69,110,100,80,114,111,108,111,103,10,37,37,37,37,66,101,103,105,110,83,101,116,117,112,10,37,37,37,37,69,110,100,83,101,116,117,112,10,0,0,0,9,110,111,116,32,114,111,116,97,116,101,100,10,9,0,0,108,97,121,101,114,100,101,102,97,117,108,116,0,0,0,0,37,48,46,50,102,32,37,48,46,50,102,32,109,10,0,0,96,98,117,105,108,116,105,110,45,114,111,116,97,116,101,45,108,101,102,116,96,32,111,110,108,121,32,102,111,114,32,115,112,108,111,116,115,59,32,60,115,104,105,102,116,62,32,105,110,99,114,101,97,115,101,115,32,97,109,111,117,110,116,0,83,10,37,46,50,102,32,37,46,50,102,32,109,10,0,0,37,46,50,102,32,37,46,50,102,32,108,10,0,0,0,0,32,45,45,32,112,114,111,99,101,115,115,111,114,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,105,115,32,115,105,122,101,0,0,0,0,0,0,0,0,91,50,32,50,32,50,32,50,32,50,32,50,32,50,32,52,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,48,46,53,32,48,46,53,32,48,46,53,32,48,32,75,10,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,91,50,32,50,32,50,32,50,32,50,32,52,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,0,0,0,0,70,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,32,109,105,115,109,97,116,99,104,58,32,37,37,66,32,105,115,32,111,110,108,121,32,118,97,108,105,100,32,119,105,116,104,32,37,37,98,0,0,0,48,32,48,46,55,32,49,32,48,32,75,10,0,0,0,0,121,111,117,32,99,97,110,39,116,32,117,110,115,101,116,32,116,104,101,32,112,97,108,101,116,116,101,46,10,0,0,0,102,105,108,108,105,110,103,32,71,80,86,65,76,95,80,87,68,0,0,0,0,0,0,0,91,50,32,50,32,50,32,52,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,101,109,102,0,0,0,0,0,91,52,32,51,32,49,32,51,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,120,121,112,36,108,97,110,101,0,0,0,0,0,0,0,0,48,32,48,32,49,32,48,32,75,10,0,0,0,0,0,0,9,114,111,116,97,116,101,100,32,105,102,32,116,104,101,32,116,101,114,109,105,110,97,108,32,97,108,108,111,119,115,32,105,116,10,9,0,0,0,0,101,120,112,101,99,116,101,100,32,103,97,112,32,118,97,108,117,101,0,0,0,0,0,0,115,101,116,32,103,114,105,100,32,37,115,32,32,0,0,0,91,53,32,50,32,49,32,50,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,99,104,97,110,103,105,110,103,32,118,105,101,119,32,116,111,32,37,102,44,32,37,102,46,10,0,0,0,0,0,0,0,49,32,48,32,48,32,48,32,75,10,0,0,0,0,0,0,37,102,32,119,10,0,0,0,40,37,100,41,0,0,0,0,117,116,102,56,0,0,0,0,91,49,32,49,46,53,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,0,0,104,105,115,116,111,103,114,97,109,115,0,0,0,0,0,0,98,111,114,0,0,0,0,0,48,32,49,32,48,32,48,32,75,10,0,0,0,0,0,0,91,50,32,51,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,0,0,0,0,48,32,49,32,49,32,48,32,75,10,0,0,0,0,0,0,91,52,32,50,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,0,0,0,0,0,100,120,102,45,102,105,108,101,32,102,111,114,32,65,117,116,111,67,97,100,32,40,100,101,102,97,117,108,116,32,115,105,122,101,32,49,50,48,120,56,48,41,0,0,0,0,0,0,49,32,49,32,48,32,48,32,75,10,0,0,0,0,0,0,118,105,36,101,119,0,0,0,108,36,111,97,100,0,0,0,91,93,32,48,32,100,10,50,32,106,10,48,32,71,10,0,116,111,112,0,0,0,0,0,103,97,112,0,0,0,0,0,32,92,10,0,0,0,0,0,49,32,48,32,49,32,48,32,75,10,0,0,0,0,0,0,71,80,86,65,76,95,86,73,69,87,95,82,79,84,95,90,0,0,0,0,0,0,0,0,91,49,32,50,93,32,48,32,100,10,48,32,106,10,48,32,71,10,0,0,0,0,0,0,91,93,32,48,32,100,10,48,32,106,10,48,32,71,10,0,10,9,84,104,101,32,102,111,108,108,111,119,105,110,103,32,98,105,110,97,114,121,32,100,97,116,97,32,115,105,122,101,115,32,97,116,116,101,109,112,116,32,116,111,32,98,101,32,109,97,99,104,105,110,101,32,105,110,100,101,112,101,110,100,101,110,116,58,10,10,9,32,32,110,97,109,101,32,40,115,105,122,101,32,105,110,32,98,121,116,101,115,41,10,10,0,48,32,48,32,48,32,49,32,75,10,0,0,0,0,0,0,37,46,50,102,32,119,10,0,41,116,10,84,10,0,0,0,91,48,32,49,32,45,49,32,48,32,37,46,50,102,32,37,46,50,102,93,101,10,48,32,103,10,0,0,0,0,0,0,71,80,86,65,76,95,78,97,78,0,0,0,0,0,0,0,91,49,32,48,32,48,32,49,32,37,46,50,102,32,37,46,50,102,93,101,10,48,32,103,10,0,0,0,0,0,0,0,100,120,102,0,0,0,0,0,47,95,37,115,32,37,100,32,37,100,32,48,32,50,32,122,10,0,0,0,0,0,0,0,118,101,36,114,115,105,111,110,0,0,0,0,0,0,0,0,47,95,37,115,32,37,100,32,37,100,32,48,32,49,32,122,10,0,0,0,0,0,0,0,98,111,116,116,111,109,0,0,99,111,108,117,109,110,115,36,116,97,99,107,101,100,0,0,32,37,115,37,115,116,105,99,115,32,37,115,109,37,115,116,105,99,115,0,0,0,0,0,47,95,37,115,32,37,100,32,37,100,32,48,32,48,32,122,10,0,0,0,0,0,0,0,71,80,86,65,76,95,86,73,69,87,95,82,79,84,95,88,0,0,0,0,0,0,0,0,83,10,0,0,0,0,0,0,110,111,101,36,110,104,97,110,99,101,100,0,0,0,0,0,40,37,100,41,10,0,0,0,93,32,41,10,0,0,0,0,110,111,102,36,101,101,100,0,119,36,105,116,104,0,0,0,102,36,101,101,100,0,0,0,37,115,102,101,101,100,32,37,115,32,115,105,122,101,32,37,100,44,32,37,100,0,0,0,45,101,0,0,0,0,0,0,100,117,109,98,32,116,101,114,109,105,110,97,108,0,0,0,71,80,86,65,76,95,112,105,0,0,0,0,0,0,0,0,32,32,48,10,69,78,68,83,69,67,10,32,32,48,10,69,79,70,10,0,0,0,0,0,114,101,102,114,101,115,104,10,0,0,0,0,0,0,0,0,97,115,99,105,105,32,97,114,116,32,102,111,114,32,97,110,121,116,104,105,110,103,32,116,104,97,116,32,112,114,105,110,116,115,32,116,101,120,116,0,55,0,0,0,0,0,0,0,116,105,116,36,108,101,0,0,76,105,110,101,102,101,101,100,0,0,0,0,0,0,0,0,32,32,48,10,69,78,68,84,65,66,10,48,10,69,78,68,83,69,67,10,32,32,48,10,83,69,67,84,73,79,78,10,32,32,50,10,66,76,79,67,75,83,10,32,32,48,10,69,78,68,83,69,67,10,32,32,48,10,83,69,67,84,73,79,78,10,32,32,50,10,69,78,84,73,84,73,69,83,10,0,9,119,114,105,116,116,101,110,32,105,110,32,37,115,32,99,111,114,110,101,114,10,0,0,114,111,119,115,36,116,97,99,107,101,100,0,0,0,0,0,115,101,116,32,103,114,105,100,0,0,0,0,0,0,0,0,32,32,48,10,76,65,89,69,82,10,32,32,50,10,37,115,10,32,55,48,10,32,32,32,54,52,10,54,50,10,32,32,32,37,115,10,32,32,54,10,37,115,10,0,0,0,0,0,110,111,116,32,101,110,111,117,103,104,32,109,101,109,111,114,121,32,116,111,32,108,111,97,100,32,102,105,108,101,0,0,67,97,110,39,116,32,99,97,108,99,117,108,97,116,101,32,99,117,98,105,99,32,115,112,108,105,110,101,115,0,0,0,96,98,117,105,108,116,105,110,45,114,111,116,97,116,101,45,100,111,119,110,96,32,111,110,108,121,32,102,111,114,32,115,112,108,111,116,115,59,32,60,115,104,105,102,116,62,32,105,110,99,114,101,97,115,101,115,32,97,109,111,117,110,116,0,32,32,48,10,84,65,66,76,69,10,32,32,50,10,76,65,89,69,82,10,32,55,48,10,32,32,32,37,45,100,10,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,115,116,114,108,101,110,32,111,102,32,110,111,110,45,83,84,82,73,78,71,32,97,114,103,117,109,101,110,116,0,0,32,32,48,10,80,79,76,89,76,73,78,69,10,32,32,56,10,37,115,10,32,54,54,10,32,32,32,49,10,32,32,54,10,37,115,10,32,32,48,10,86,69,82,84,69,88,10,32,32,56,10,37,115,10,32,32,54,10,37,115,10,32,49,48,10,37,45,54,46,51,102,10,32,50,48,10,37,45,54,46,51,102,10,32,51,48,10,48,46,48,48,48,10,0,0,0,68,65,83,72,68,79,84,0,68,79,84,0,0,0,0,0,80,72,65,78,84,79,77,0,67,69,78,84,69,82,0,0,71,80,86,65,76,95,84,69,82,77,73,78,65,76,83,0,72,73,68,68,69,78,0,0,100,117,109,98,0,0,0,0,68,65,83,72,69,68,0,0,116,105,109,36,101,115,116,97,109,112,0,0,0,0,0,0,67,79,78,84,73,78,85,79,85,83,0,0,0,0,0,0,101,114,114,111,114,36,98,97,114,115,0,0,0,0,0,0,115,101,116,32,103,114,105,100,32,110,111,112,111,108,97,114,10,0,0,0,0,0,0,0,32,32,48,10,86,69,82,84,69,88,10,32,32,56,10,37,115,10,32,32,54,10,37,115,10,32,32,49,48,10,37,45,54,46,51,102,10,32,32,50,48,10,37,45,54,46,51,102,10,32,32,51,48,10,48,46,48,48,48,10,0,0,0,0,53,0,0,0,0,0,0,0,52,0,0,0,0,0,0,0,9,32,32,0,0,0,0,0,67,97,110,39,116,32,112,108,111,116,32,119,105,116,104,32,97,110,32,101,109,112,116,121,32,37,115,32,114,97,110,103,101,33,0,0,0,0,0,0,50,0,0,0,0,0,0,0,117,110,115,101,116,32,104,105,100,100,101,110,51,100,10,0,49,0,0,0,0,0,0,0,83,84,65,78,68,65,82,68,0,0,0,0,0,0,0,0,110,101,119,32,107,101,121,32,108,105,115,116,0,0,0,0,32,55,50,10,37,100,10,32,49,49,10,37,45,54,46,51,102,10,32,50,49,10,37,45,54,46,51,102,10,32,51,49,10,48,46,48,48,48,10,0,69,80,83,32,102,111,114,109,97,116,32,102,111,114,32,67,111,114,101,108,68,82,65,87,0,0,0,0,0,0,0,0,32,49,48,10,37,45,54,46,51,102,10,32,50,48,10,37,45,54,46,51,102,10,32,51,48,10,48,46,48,48,48,10,32,52,48,10,37,45,54,46,51,102,10,32,32,49,10,37,115,10,32,53,48,10,37,45,54,46,51,102,10,32,32,55,10,37,115,10,0,0,0,0,116,105,109,101,102,36,109,116,0,0,0,0,0,0,0,0,32,32,48,10,84,69,88,84,10,32,32,56,10,37,115,10,0,0,0,0,0,0,0,0,9,115,101,116,32,37,115,100,97,116,97,32,116,105,109,101,10,0,0,0,0,0,0,0,99,108,117,115,116,36,101,114,101,100,0,0,0,0,0,0,115,101,116,32,103,114,105,100,32,112,111,108,97,114,32,37,102,10,0,0,0,0,0,0,32,32,48,10,83,69,81,69,78,68,10,0,0,0,0,0,112,0,0,0,0,0,0,0,38,35,120,37,50,46,50,120,59,0,0,0,0,0,0,0,123,125,94,95,64,38,126,0,9,84,104,101,32,102,111,108,108,111,119,105,110,103,32,98,105,110,97,114,121,32,100,97,116,97,32,115,105,122,101,115,32,97,114,101,32,109,97,99,104,105,110,101,32,100,101,112,101,110,100,101,110,116,58,10,10,9,32,32,110,97,109,101,32,40,115,105,122,101,32,105,110,32,98,121,116,101,115,41,10,10,0,0,0,0,0,0,76,111,103,32,115,99,97,108,105,110,103,32,111,102,32,51,68,32,105,109,97,103,101,32,112,108,111,116,115,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,32,98,97,99,107,103,114,111,117,110,100,32,34,35,37,48,54,120,34,0,0,0,0,0,32,100,97,115,104,108,101,110,103,116,104,32,37,46,49,102,0,0,0,0,0,0,0,0,32,108,119,32,37,46,49,102,0,0,0,0,0,0,0,0,79,114,105,103,105,110,95,50,0,0,0,0,0,0,0,0,32,115,105,122,101,32,37,100,44,37,100,32,0,0,0,0,71,80,86,65,76,95,67,79,77,80,73,76,69,95,79,80,84,73,79,78,83,0,0,0,32,102,111,110,116,115,99,97,108,101,32,37,46,49,102,0,99,111,114,101,108,0,0,0,32,101,110,104,97,110,99,101,100,32,0,0,0,0,0,0,116,105,99,115,108,36,101,118,101,108,0,0,0,0,0,0,37,115,32,37,115,32,37,115,32,102,111,110,116,32,34,37,115,44,37,103,34,0,0,0,117,110,115,101,116,32,103,114,105,100,10,0,0,0,0,0,37,103,0,0,0,0,0,0,110,0,0,0,0,0,0,0,110,111,112,114,111,36,112,111,114,116,105,111,110,97,108,0,98,97,99,107,36,103,114,111,117,110,100,0,0,0,0,0,100,101,36,102,97,117,108,116,0,0,0,0,0,0,0,0,116,101,114,109,111,112,116,36,105,111,110,0,0,0,0,0,101,109,102,95,109,111,118,101,58,32,40,37,100,44,37,100,41,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,101,109,102,95,115,111,108,105,100,95,118,101,99,116,111,114,58,32,40,37,100,44,37,100,41,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,71,80,86,65,76,95,80,65,84,67,72,76,69,86,69,76,0,0,0,0,0,0,0,0,105,99,111,110,118,32,102,97,105,108,101,100,0,0,0,0,120,94,51,0,0,0,0,0,108,111,97,100,112,97,116,104,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,67,111,109,112,117,116,101,114,32,71,114,97,112,104,105,99,115,32,77,101,116,97,102,105,108,101,0,0,0,0,0,0,105,99,111,110,118,95,111,112,101,110,32,102,97,105,108,101,100,0,0,0,0,0,0,0,116,105,99,115,99,36,97,108,101,0,0,0,0,0,0,0,85,84,70,45,49,54,76,69,0,0,0,0,0,0,0,0,32,110,111,101,110,104,97,110,99,101,100,0,0,0,0,0,104,115,0,0,0,0,0,0,115,101,116,32,116,105,99,115,32,37,115,10,0,0,0,0,83,104,105,102,116,95,74,73,83,0,0,0,0,0,0,0,85,84,70,45,56,0,0,0,105,99,111,110,118,32,115,116,114,105,110,103,0,0,0,0,44,32,37,100,32,98,101,102,111,114,101,32,112,108,97,110,101,0,0,0,0,0,0,0,32,83,116,114,105,107,101,79,117,116,0,0,0,0,0,0,32,83,116,114,105,107,101,111,117,116,0,0,0,0,0,0,32,115,116,114,105,107,101,111,117,116,0,0,0,0,0,0,32,85,110,100,101,114,108,105,110,101,0,0,0,0,0,0,71,80,86,65,76,95,86,69,82,83,73,79,78,0,0,0,32,117,110,100,101,114,108,105,110,101,0,0,0,0,0,0,99,103,109,0,0,0,0,0,101,109,102,95,100,97,115,104,101,100,95,118,101,99,116,111,114,58,32,40,37,100,44,37,100,41,32,111,117,116,32,111,102,32,114,97,110,103,101,0,116,105,36,99,115,0,0,0,32,105,46,44,59,58,124,33,39,0,0,0,0,0,0,0,44,32,114,111,116,97,116,101,100,32,98,121,32,37,100,32,100,101,103,114,101,101,115,32,105,110,32,50,68,32,112,108,111,116,115,0,0,0,0,0,117,110,36,115,111,114,116,101,100,0,0,0,0,0,0,0,109,119,60,62,0,0,0,0,40,0,0,0,0,0,0,0,32,105,106,108,46,44,59,58,124,33,40,41,91,93,73,45,39,0,0,0,0,0,0,0,118,36,101,114,115,105,111,110,0,0,0,0,0,0,0,0,44,32,37,100,32,98,101,102,111,114,101,32,108,105,110,101,0,0,0,0,0,0,0,0,116,101,120,116,115,36,112,101,99,105,97,108,0,0,0,0,116,101,120,116,114,36,105,103,105,100,0,0,0,0,0,0,116,101,120,116,110,36,111,114,109,97,108,0,0,0,0,0,35,0,0,0,0,0,0,0,116,101,120,116,104,36,105,100,100,101,110,0,0,0,0,0,71,80,86,65,76,95,69,82,82,78,79,0,0,0,0,0,116,36,104,105,99,107,110,101,115,115,0,0,0,0,0,0,72,84,77,76,32,67,97,110,118,97,115,32,111,98,106,101,99,116,0,0,0,0,0,0,115,109,36,97,108,108,0,0,66,97,100,32,102,117,108,108,32,109,111,110,116,104,32,110,97,109,101,0,0,0,0,0,116,101,114,109,111,36,112,116,105,111,110,115,0,0,0,0,112,111,114,36,116,114,97,105,116,0,0,0,0,0,0,0,44,32,112,97,114,97,108,108,101,108,32,116,111,32,97,120,105,115,32,105,110,32,51,68,32,112,108,111,116,115,0,0,115,111,36,114,116,101,100,0,112,111,105,36,110,116,115,109,97,120,0,0,0,0,0,0,109,101,36,116,114,105,99,0,102,36,111,110,116,115,105,122,101,0,0,0,0,0,0,0,10,9,32,32,32,32,83,107,105,112,32,98,121,116,101,115,58,32,37,100,32,98,101,102,111,114,101,32,114,101,99,111,114,100,0,0,0,0,0,0,100,101,36,112,116,104,0,0,98,36,105,103,0,0,0,0,101,120,112,97,110,100,32,102,111,110,116,112,97,116,104,0,32,115,105,122,101,32,37,102,32,37,102,0,0,0,0,0,101,37,43,48,50,100,0,0,32,115,105,122,101,32,37,100,32,37,100,0,0,0,0,0,10,9,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,105,115,32,120,32,102,111,114,32,99,117,114,118,101,115,10,0,0,0,0,0,0,0,37,72,58,37,77,0,0,0,71,80,86,65,76,95,69,78,67,79,68,73,78,71,0,0,118,101,114,115,105,111,110,0,99,97,110,118,97,115,0,0,100,101,112,116,104,0,0,0,116,97,98,108,101,0,0,0,109,101,116,114,105,99,0,0,44,32,117,115,105,110,103,32,102,111,110,116,32,34,37,115,34,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,120,39,44,32,39,120,50,39,44,32,39,97,117,116,111,39,32,111,114,32,39,111,102,102,39,0,0,0,0,115,101,116,32,97,110,103,108,101,115,32,37,115,10,0,0,105,110,99,104,101,115,0,0,112,111,105,110,116,115,109,97,120,0,0,0,0,0,0,0,115,109,97,108,108,0,0,0,37,50,46,50,115,0,0,0,115,106,105,115,0,0,0,0,98,105,103,0,0,0,0,0,84,97,98,117,108,97,114,32,111,117,116,112,117,116,32,111,102,32,37,115,32,112,108,111,116,32,115,116,121,108,101,32,110,111,116,32,102,117,108,108,121,32,105,109,112,108,101,109,101,110,116,101,100,10,0,0,108,97,110,100,0,0,0,0,37,115,32,37,115,32,37,115,32,37,100,32,37,115,32,37,115,32,37,115,37,115,32,37,115,32,34,37,115,44,37,100,34,32,37,115,32,37,100,32,37,115,32,37,100,32,37,115,32,37,115,0,0,0,0,0,32,116,101,120,116,114,105,103,105,100,0,0,0,0,0,0,32,116,101,120,116,104,105,100,100,101,110,0,0,0,0,0,71,80,86,65,76,95,79,85,84,80,85,84,0,0,0,0,32,116,101,120,116,115,112,101,99,105,97,108,0,0,0,0,85,110,107,110,111,119,110,32,116,101,114,109,105,110,97,108,32,116,121,112,101,32,45,32,110,111,116,32,97,32,112,108,111,116,116,105,110,103,32,100,101,118,105,99,101,0,0,0,37,115,37,115,37,115,0,0,115,117,36,114,102,97,99,101,0,0,0,0,0,0,0,0,101,108,115,101,0,0,0,0,32,116,101,120,116,110,111,114,109,97,108,0,0,0,0,0,9,37,115,37,115,32,105,115,32,34,37,115,34,44,32,111,102,102,115,101,116,32,97,116,32,0,0,0,0,0,0,0,97,117,116,111,0,0,0,0,78,111,32,118,97,108,105,100,32,100,97,116,97,32,112,111,105,110,116,115,32,102,111,117,110,100,32,105,110,32,102,105,108,101,0,0,0,0,0,0,115,101,116,32,102,111,114,109,97,116,32,37,115,32,34,37,115,34,10,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,0,0,0,0,0,119,114,111,110,103,32,118,101,114,115,105,111,110,32,110,117,109,98,101,114,44,32,109,117,115,116,32,98,101,32,51,46,49,32,111,114,32,51,46,50,0,0,0,0,0,0,0,0,118,101,114,115,105,111,110,58,32,51,46,49,32,111,114,32,51,46,50,32,101,120,112,101,99,116,101,100,0,0,0,0,10,9,32,32,32,32,83,99])
.concat([97,110,58,32,0,0,0,0,112,111,105,110,116,115,109,97,120,58,32,110,117,109,98,101,114,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,50,44,37,108,100,41,0,0,109,97,120,46,32,112,111,105,110,116,115,32,112,101,114,32,112,111,108,121,108,105,110,101,58,32,110,117,109,98,101,114,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,100,101,112,116,104,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,45,76,73,66,71,68,32,32,0,0,0,0,0,0,0,0,100,101,112,116,104,58,32,110,117,109,98,101,114,32,101,120,112,101,99,116,101,100,0,0,71,80,86,65,76,95,84,69,82,77,79,80,84,73,79,78,83,0,0,0,0,0,0,0,116,104,105,99,107,110,101,115,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,123,125,94,95,64,38,126,10,0,0,0,0,0,0,0,0,116,104,105,99,107,110,101,115,115,58,32,110,117,109,98,101,114,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,115,116,36,121,108,101,0,0,115,105,122,101,58,32,50,32,110,117,109,98,101,114,115,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,0,108,97,98,101,108,0,0,0,116,101,120,116,95,108,97,98,101,108,0,0,0,0,0,0,115,101,116,32,100,117,109,109,121,32,37,115,44,37,115,10,0,0,0,0,0,0,0,0,83,105,110,103,108,101,0,0,65,52,0,0,0,0,0,0,76,101,116,116,101,114,0,0,10,9,32,32,32,32,51,68,32,110,111,114,109,97,108,32,118,101,99,116,111,114,58,32,40,37,102,44,32,37,102,44,32,37,102,41,0,0,0,0,32,32,35,32,40,99,117,114,114,101,110,116,108,121,32,91,0,0,0,0,0,0,0,0,35,70,73,71,32,51,46,50,10,37,115,10,37,115,10,37,115,10,37,115,10,37,54,46,50,102,10,37,115,10,37,100,10,37,100,32,37,100,10,0,110,111,116,36,105,116,108,101,0,0,0,0,0,0,0,0,51,46,50,0,0,0,0,0,77,101,116,114,105,99,0,0,45,0,0,0,0,0,0,0,73,110,99,104,101,115,0,0,67,101,110,116,101,114,0,0,46,0,0,0,0,0,0,0,35,70,73,71,32,51,46,49,10,37,115,10,37,115,10,37,115,10,37,100,32,37,100,10,0,0,0,0,0,0,0,0,71,80,95,70,73,82,83,84,95,75,69,89,0,0,0,0,51,46,49,0,0,0,0,0,110,117,109,101,114,105,99,97,108,0,0,0,0,0,0,0,47,121,48,32,121,48,32,121,115,116,101,112,32,97,100,100,32,100,101,102,32,47,105,105,32,105,105,32,49,32,97,100,100,32,100,101,102,10,105,105,32,105,109,97,120,32,103,101,32,123,101,120,105,116,125,32,105,102,32,125,32,108,111,111,112,10,103,114,101,115,116,111,114,101,32,48,32,115,101,116,103,114,97,121,10,0,0,0,120,0,0,0,0,0,0,0,32,107,100,101,110,115,105,116,121,50,100,0,0,0,0,0,70,73,71,95,112,111,105,110,116,115,0,0,0,0,0,0,116,111,107,101,110,95,116,97,98,108,101,95,115,105,122,101,32,62,61,32,108,102,45,62,110,117,109,95,116,111,107,101,110,115,43,49,0,0,0,0,67,97,110,39,116,32,99,97,108,99,117,108,97,116,101,32,115,112,108,105,110,101,115,44,32,110,101,101,100,32,97,116,32,108,101,97,115,116,32,51,32,112,111,105,110,116,115,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,54,46,51,102,32,37,54,46,51,102,32,37,100,32,37,54,46,51,102,32,37,54,46,51,102,32,37,100,32,37,100,32,37,115,92,48,48,49,10,0,0,0,0,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,83,84,82,73,78,71,32,111,112,101,114,97,116,111,114,32,97,112,112,108,105,101,100,32,116,111,32,110,111,110,45,83,84,82,73,78,71,32,116,121,112,101,0,0,0,0,0,70,73,71,32,116,101,120,116,0,0,0,0,0,0,0,0,10,9,32,32,32,32,50,68,32,114,111,116,97,116,105,111,110,32,97,110,103,108,101,58,32,37,102,0,0,0,0,0,52,10,9,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,0,0,53,10,9,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,0,0,0,0,50,32,51,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,54,46,51,102,32,48,32,48,32,48,32,48,32,48,32,0,0,0,0,0,0,0,49,32,51,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,54,46,51,102,32,49,32,48,46,48,48,48,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,71,80,86,65,76,95,84,69,82,77,0,0,0,0,0,0,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,0,101,115,116,105,109,97,116,101,32,119,105,100,116,104,32,111,102,32,101,110,104,97,110,99,101,100,32,116,101,120,116,32,115,116,114,105,110,103,0,0,37,100,32,37,100,32,37,46,51,102,32,37,46,51,102,32,37,46,51,102,10,0,0,0,115,97,36,109,112,108,101,115,0,0,0,0,0,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,57,46,51,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,0,0,115,101,116,32,100,103,114,105,100,51,100,32,37,100,44,37,100,32,37,115,37,115,32,37,102,44,37,102,10,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,54,46,51,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,32,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,0,0,102,105,103,58,32,65,116,116,101,109,112,116,32,116,111,32,115,101,116,32,112,97,108,101,116,116,101,32,116,119,105,99,101,10,0,0,0,0,0,0,37,100,32,37,100,32,35,37,50,46,50,120,37,50,46,50,120,37,50,46,50,120,10,0,32,40,37,102,44,32,37,102,44,32,37,102,41,0,0,0,97,100,106,117,115,116,105,110,103,32,116,111,32,91,37,103,58,37,103,93,10,0,0,0,77,111,110,111,99,104,114,111,109,101,32,102,105,103,32,102,105,108,101,58,32,117,115,105,110,103,32,103,114,97,121,32,112,97,108,101,116,116,101,32,105,110,115,116,101,97,100,32,111,102,32,99,111,108,111,114,10,0,0,0,0,0,0,0,102,105,103,58,32,80,97,108,101,116,116,101,32,117,115,101,100,32,98,101,102,111,114,101,32,115,101,116,10,0,0,0,32,37,100,32,37,100,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,57,46,51,102,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,108,100,10,9,0,0,0,110,101,119,32,108,105,110,101,32,98,117,102,102,101,114,0,45,54,10,0,0,0,0,0,101,115,116,105,109,97,116,101,0,0,0,0,0,0,0,0,35,32,69,110,100,32,112,108,111,116,32,35,37,100,10,0,111,98,106,36,101,99,116,0,35,32,66,101,103,105,110,32,112,108,111,116,32,35,37,100,10,0,0,0,0,0,0,0,9,37,115,32,105,115,32,115,101,116,32,116,111,32,37,115,10,0,0,0,0,0,0,0,108,97,98,36,101,108,115,0,115,101,116,32,100,103,114,105,100,51,100,32,37,100,44,37,100,32,115,112,108,105,110,101,115,10,0,0,0,0,0,0,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,54,0,0,0,0,0,0,0,105,115,111,95,56,56,53,57,95,49,0,0,0,0,0,0,110,111,98,97,99,107,103,36,114,111,117,110,100,0,0,0,10,9,32,32,32,32,67,101,110,116,101,114,58,0,0,0,110,111,97,100,111,98,101,36,103,108,121,112,104,110,97,109,101,115,0,0,0,0,0,0,73,109,97,103,101,32,103,114,105,100,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,52,32,112,111,105,110,116,115,32,40,50,32,120,32,50,41,46,10,10,0,97,100,111,98,101,36,103,108,121,112,104,110,97,109,101,115,0,0,0,0,0,0,0,0,110,101,119,36,115,116,121,108,101,0,0,0,0,0,0,0,111,108,100,36,115,116,121,108,101,0,0,0,0,0,0,0,85,110,107,110,111,119,110,32,112,111,105,110,116,32,116,121,112,101,32,105,110,32,112,108,111,116,51,100,95,108,105,110,101,115,0,0,0,0,0,0,79,114,105,103,105,110,95,49,0,0,0,0,0,0,0,0,10,35,32,67,117,114,118,101,32,37,100,32,111,102,32,37,100,44,32,37,100,32,112,111,105,110,116,115,0,0,0,0,110,111,97,36,117,120,102,105,108,101,0,0,0,0,0,0,123,125,36,91,93,92,0,0,97,36,117,120,102,105,108,101,0,0,0,0,0,0,0,0,112,115,100,105,114,0,0,0,110,36,111,114,111,116,97,116,101,0,0,0,0,0,0,0,9,114,101,97,100,32,102,111,114,109,97,116,32,102,111,114,32,116,105,109,101,32,111,110,32,37,115,32,97,120,105,115,32,105,115,32,34,37,115,34,10,0,0,0,0,0,0,0,115,101,112,97,114,97,116,105,111,110,32,109,117,115,116,32,98,101,32,62,32,48,0,0,115,101,116,32,100,103,114,105,100,51,100,32,37,100,44,37,100,44,32,37,100,10,0,0,114,36,111,116,97,116,101,0,76,0,0,0,0,0,0,0,112,97,108,102,36,117,110,99,112,97,114,97,109,0,0,0,110,111,102,111,110,116,102,36,105,108,101,115,0,0,0,0,10,9,32,32,32,32,79,114,105,103,105,110,58,0,0,0,102,111,110,116,102,36,105,108,101,0,0,0,0,0,0,0,114,111,117,36,110,100,101,100,0,0,0,0,0,0,0,0,100,101,102,97,117,108,116,112,36,108,101,120,0,0,0,0,100,117,36,112,108,101,120,0,115,105,36,109,112,108,101,120,0,0,0,0,0,0,0,0,100,117,112,32,100,117,112,32,109,117,108,32,109,117,108,0,101,110,104,97,110,99,101,100,32,116,101,120,116,32,109,111,100,101,32,112,97,114,115,105,110,103,32,101,114,114,111,114,0,0,0,0,0,0,0,0,99,111,108,111,117,114,116,36,101,120,116,0,0,0,0,0,112,111,108,36,97,114,0,0,99,111,108,111,114,116,36,101,120,116,0,0,0,0,0,0,9,122,101,114,111,32,105,115,32,37,103,10,0,0,0,0,115,101,112,36,97,114,97,116,105,111,110,0,0,0,0,0,121,121,10,0,0,0,0,0,98,36,108,97,99,107,116,101,120,116,0,0,0,0,0,0,108,0,0,0,0,0,0,0,109,36,111,110,111,99,104,114,111,109,101,0,0,0,0,0,101,112,36,115,102,0,0,0,44,32,100,122,61,37,102,0,108,36,97,110,100,115,99,97,112,101,0,0,0,0,0,0,112,36,111,114,116,114,97,105,116,0,0,0,0,0,0,0,32,102,111,110,116,115,99,97,108,101,32,37,51,46,49,102,32,0,0,0,0,0,0,0,37,103,32,0,0,0,0,0,34,37,115,34,32,37,103,32,0,0,0,0,0,0,0,0,101,110,104,97,110,99,101,100,32,116,101,120,116,32,109,111,100,101,32,112,97,114,115,101,114,32,45,32,105,103,110,111,114,105,110,103,32,115,112,117,114,105,111,117,115,32,125,0,34,37,115,34,32,37,103,37,115,32,0,0,0,0,0,0,112,111,105,36,110,116,115,105,122,101,0,0,0,0,0,0,32,37,115,97,100,111,98,101,103,108,121,112,104,110,97,109,101,115,32,92,10,32,32,32,0,0,0,0,0,0,0,0,102,105,108,101,116,36,121,112,101,115,0,0,0,0,0,0,110,111,104,101,97,100,101,114,32,0,0,0,0,0,0,0,102,105,110,97,110,99,101,36,98,97,114,115,0,0,0,0,120,120,10,0,0,0,0,0,114,101,115,105,122,101,95,100,121,110,97,114,114,97,121,58,32,100,121,110,97,114,114,97,121,32,119,97,115,110,39,116,32,105,110,105,116,105,97,108,105,122,101,100,33,0,0,0,104,0,0,0,0,0,0,0,104,101,97,100,101,114,32,34,37,115,34,32,0,0,0,0,110,111,97,117,120,102,105,108,101,0,0,0,0,0,0,0,44,32,100,121,61,37,102,0,97,117,120,102,105,108,101,0,37,115,32,37,115,32,0,0,73,47,79,32,101,114,114,111,114,32,100,117,114,105,110,103,32,117,112,100,97,116,101,0,32,32,32,112,97,108,102,117,110,99,112,97,114,97,109,32,37,100,44,37,103,32,92,10,32,32,32,0,0,0,0,0,32,32,32,110,111,98,97,99,107,103,114,111,117,110,100,32,92,10,0,0,0,0,0,0,71,80,86,65,76,95,86,73,69,87,95,77,65,80,0,0,32,32,32,98,97,99,107,103,114,111,117,110,100,32,34,35,37,48,50,120,37,48,50,120,37,48,50,120,34,32,92,10,0,0,0,0,0,0,0,0,115,118,103,0,0,0,0,0,110,111,99,108,105,112,0,0,112,111,105,110,116,105,110,116,36,101,114,118,97,108,98,111,120,0,0,0,0,0,0,0,99,108,105,112,0,0,0,0,100,97,116,97,115,36,105,122,101,115,0,0,0,0,0,0,99,97,110,100,108,101,36,115,116,105,99,107,115,0,0,0,120,121,10,0,0,0,0,0,99,111,108,111,114,116,101,120,116,0,0,0,0,0,0,0,103,0,0,0,0,0,0,0,98,108,97,99,107,116,101,120,116,0,0,0,0,0,0,0,108,101,118,101,108,100,101,102,97,117,108,116,0,0,0,0,10,9,32,32,32,32,83,97,109,112,108,101,32,112,101,114,105,111,100,115,58,32,100,120,61,37,102,0,0,0,0,0,108,101,118,101,108,49,0,0,32,32,32,37,115,32,37,115,32,37,115,32,92,10,32,32,32,37,115,32,100,97,115,104,108,101,110,103,116,104,32,37,46,49,102,32,108,105,110,101,119,105,100,116,104,32,37,46,49,102,32,37,115,32,37,115,32,92,10,0,0,0,0,0,36,96,0,0,0,0,0,0,32,97,117,120,102,105,108,101,0,0,0,0,0,0,0,0,121,122,97,102,112,110,117,109,32,107,77,71,84,80,69,90,89,0,0,0,0,0,0,0,110,111,114,111,116,97,116,101,0,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,71,80,86,65,76,95,83,80,76,79,84,0,0,0,0,0,114,111,116,97,116,101,0,0,101,110,104,97,110,99,101,100,32,116,101,120,116,32,112,97,114,115,101,114,32,45,45,32,115,112,117,114,105,111,117,115,32,98,97,99,107,115,108,97,115,104,0,0,0,0,0,0,100,101,102,97,117,108,116,112,108,101,120,0,0,0,0,0,99,111,108,111,114,115,0,0,115,105,109,112,108,101,120,0,98,105,110,36,97,114,121,0,102,114,97,99,116,105,111,110,32,109,117,115,116,32,98,101,32,108,101,115,115,32,116,104,97,110,32,49,0,0,0,0,117,110,105,116,115,32,0,0,100,117,112,108,101,120,0,0,101,0,0,0,0,0,0,0,110,111,101,110,104,97,110,99,101,100,0,0,0,0,0,0,108,97,110,100,115,99,97,112,101,0,0,0,0,0,0,0,97,108,108,32,102,111,114,119,97,114,100,0,0,0,0,0,107,111,105,56,117,0,0,0,112,111,114,116,114,97,105,116,0,0,0,0,0,0,0,0,32,32,114,101,100,32,103,114,101,101,110,32,98,108,117,101,32,97,108,112,104,97,0,0,37,115,32,37,115,32,37,115,32,92,10,0,0,0,0,0,108,111,114,0,0,0,0,0,32,102,111,110,116,102,105,108,101,32,34,37,115,34,0,0,112,115,95,102,111,110,116,102,105,108,101,95,99,104,97,114,0,0,0,0,0,0,0,0,71,80,86,65,76,95,80,76,79,84,0,0,0,0,0,0,37,115,44,37,103,0,0,0,94,95,64,38,126,123,125,0,111,102,32,102,111,110,116,32,110,97,109,101,0,0,0,0,99,111,108,111,114,110,36,97,109,101,115,0,0,0,0,0,105,102,0,0,0,0,0,0,116,101,114,109,105,110,97,108,32,37,115,32,100,111,101,115,32,110,111,116,32,97,108,108,111,119,32,115,112,101,99,105,102,105,99,97,116,105,111,110,32,37,115,0,0,0,0,0,9,78,111,32,102,108,111,97,116,105,110,103,32,112,111,105,110,116,32,101,120,99,101,112,116,105,111,110,32,104,97,110,100,108,101,114,32,100,117,114,105,110,103,32,100,97,116,97,32,105,110,112,117,116,10,0,102,114,97,99,36,116,105,111,110,0,0,0,0,0,0,0,65,108,108,32,112,111,105,110,116,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,32,97,110,103,108,101,32,37,103,32,0,0,0,0,0,0,73,32,119,105,108,108,32,116,114,121,32,116,111,32,102,105,120,32,105,116,32,98,117,116,32,116,104,105,115,32,109,97,121,32,110,111,116,32,119,111,114,107,46,0,0,0,0,0,98,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,99,104,97,114,97,99,116,101,114,115,32,105,110,32,80,111,115,116,83,99,114,105,112,116,32,102,111,110,116,32,110,97,109,101,46,0,0,0,0,0,108,111,119,36,101,114,0,0,40,41,91,93,123,125,124,32,0,0,0,0,0,0,0,0,37,115,102,108,105,112,32,122,0,0,0,0,0,0,0,0,97,108,108,111,119,101,100,32,100,101,118,105,97,116,105,111,110,32,109,117,115,116,32,98,101,32,60,32,49,0,0,0,67,97,110,39,116,32,100,101,108,101,116,101,32,70,111,110,116,32,102,105,108,101,110,97,109,101,32,39,37,115,39,0,110,101,119,95,112,115,95,102,111,110,116,102,105,108,101,45,62,102,111,110,116,102,105,108,101,95,110,97,109,101,0,0,45,76,73,66,82,69,65,68,76,73,78,69,32,32,45,72,73,83,84,79,82,89,32,32,0,0,0,0,0,0,0,0,110,101,119,95,112,115,95,102,111,110,116,102,105,108,101,0,71,80,86,65,76,95,82,95,76,79,71,0,0,0,0,0,100,101,108,36,101,116,101,0,98,97,100,32,115,121,110,116,97,120,32,105,110,32,101,110,104,97,110,99,101,100,32,116,101,120,116,32,115,116,114,105,110,103,0,0,0,0,0,0,97,100,100,0,0,0,0,0,99,111,108,111,114,98,36,111,120,0,0,0,0,0,0,0,67,97,110,110,111,116,32,117,115,101,32,97,117,120,32,102,105,108,101,32,111,110,32,115,116,100,111,117,116,46,32,83,119,105,116,99,104,105,110,103,32,111,102,102,32,97,117,120,102,105,108,101,32,111,112,116,105,111,110,46,10,0,0,0,9,68,97,116,97,102,105,108,101,32,112,97,114,115,105,110,103,32,119,105,108,108,32,97,99,99,101,112,116,32,70,111,114,116,114,97,110,32,68,32,111,114,32,81,32,99,111,110,115,116,97,110,116,115,10,0,114,97,119,0,0,0,0,0,85,110,114,101,99,111,103,110,105,122,101,100,32,111,112,116,105,111,110,46,32,32,83,101,101,32,39,104,101,108,112,32,115,101,116,39,46,0,0,0,114,97,110,103,101,0,0,0,115,101,116,32,115,116,121,108,101,32,101,108,108,105,112,115,101,32,115,105,122,101,32,0,84,117,114,110,105,110,103,32,111,102,102,32,97,117,120,102,105,108,101,32,111,112,116,105,111,110,10,0,0,0,0,0,97,0,0,0,0,0,0,0,67,97,110,110,111,116,32,109,97,107,101,32,80,111,115,116,83,99,114,105,112,116,32,102,105,108,101,32,110,97,109,101,32,102,114,111,109,32,37,115,10,0,0,0,0,0,0,0,67,97,110,110,111,116,32,111,112,101,110,32,97,117,120,32,102,105,108,101,32,37,115,32,102,111,114,32,111,117,116,112,117,116,46,32,83,119,105,116,99,104,105,110,103,32,111,102,102,32,97,117,120,102,105,108,101,32,111,112,116,105,111,110,46,10,0,0,0,0,0,0,109,105,115,115,105,110,103,32,102,105,108,101,110,97,109,101,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,34,116,105,116,108,101,34,32,102,111,114,32,112,108,111,116,0,0,0,0,0,0,112,115,108,97,116,101,120,32,97,117,120,32,102,105,108,101,110,97,109,101,0,0,0,0,110,101,119,104,105,115,116,36,111,103,114,97,109,0,0,0,101,112,115,108,97,116,101,120,32,84,101,88,32,102,105,108,101,110,97,109,101,0,0,0,87,65,82,78,73,78,71,58,32,69,114,114,111,114,32,100,117,114,105,110,103,32,105,110,105,116,105,97,108,105,122,97,116,105,111,110,10,10,0,0,111,112,101,110,32,111,102,32,112,111,115,116,115,99,105,112,116,32,111,117,116,112,117,116,32,102,105,108,101,32,37,115,32,102,97,105,108,101,100,0,46,37,115,0,0,0,0,0,71,80,86,65,76,95,82,95,77,73,78,0,0,0,0,0,39,59,39,32,101,120,112,101,99,116,101,100,0,0,0,0,101,110,104,97,110,99,101,100,32,116,101,120,116,32,112,97,114,115,101,114,32,45,32,115,112,117,114,105,111,117,115,32,125,0,0,0,0,0,0,0,45,105,110,99,46,37,115,0,112,97,108,36,101,116,116,101,0,0,0,0,0,0,0,0,98,105,110,100,58,32,99,97,110,110,111,116,32,112,97,114,115,101,32,37,115,10,0,0,45,45,45,32,114,101,111,112,101,110,32,102,97,105,108,101,100,0,0,0,0,0,0,0,9,67,111,109,109,101,110,116,115,32,99,104,97,114,115,32,97,114,101,32,34,37,115,34,10,0,0,0,0,0,0,0,112,116,0,0,0,0,0,0,121,48,32,48,32,78,32,48,32,49,32,86,32,121,115,116,101,112,32,48,32,86,32,48,32,45,49,32,102,10,0,0,32,10,0,0,0,0,0,0,82,101,115,101,116,116,105,110,103,32,112,114,105,109,97,114,121,32,111,117,116,112,117,116,32,102,105,108,101,32,116,111,32,37,115,44,10,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,80,111,115,116,83,99,114,105,112,116,32,111,117,116,112,117,116,32,116,111,32,37,115,0,0,67,97,110,110,111,116,32,115,109,111,111,116,104,58,32,110,111,32,100,97,116,97,32,119,105,116,104,105,110,32,102,105,120,101,100,32,120,114,97,110,103,101,33,0,0,0,0,0,37,115,65,108,116,45,0,0,105,110,116,101,114,110,97,108,32,101,114,114,111,114,32,58,32,97,114,103,117,109,101,110,116,32,110,101,105,116,104,101,114,32,73,78,84,32,111,114,32,67,77,80,76,88,0,0,103,105,118,101,32,116,104,101,32,116,101,120,32,102,105,108,101,110,97,109,101,32,97,115,32,111,117,116,112,117,116,0,37,115,102,108,105,112,32,121,0,0,0,0,0,0,0,0,70,111,114,32,101,112,115,108,97,116,101,120,32,115,116,97,110,100,97,108,111,110,101,32,109,111,100,101,44,32,121,111,117,32,104,97,118,101,32,116,111,32,37,115,0,0,0,0,46,69,80,83,0,0,0,0,105,110,118,101,114,115,101,95,110,111,114,109,97,108,95,102,117,110,99,0,0,0,0,0,46,101,112,115,0,0,0,0,101,112,115,108,97,116,101,120,32,101,112,115,32,102,105,108,101,110,97,109,101,0,0,0,101,112,115,108,97,116,101,120,32,111,117,116,112,117,116,32,102,105,108,101,32,110,97,109,101,32,109,117,115,116,32,98,101,32,111,102,32,116,104,101,32,102,111,114,109,32,102,105,108,101,110,97,109,101,46,120,120,120,0,0,0,0,0,0,105,115,95,106,117,109,112,40,111,112,101,114,97,116,111,114,41,32,124,124,32,40,106,117,109,112,95,111,102,102,115,101,116,32,61,61,32,49,41,0,78,111,32,102,105,108,108,101,100,32,112,111,108,121,103,111,110,115,0,0,0,0,0,0,92,112,117,116,40,48,44,48,41,123,92,99,111,108,111,114,98,111,120,123,103,112,66,97,99,107,103,114,111,117,110,100,125,123,92,109,97,107,101,98,111,120,40,37,46,50,102,44,37,46,50,102,41,91,93,123,125,125,125,37,37,10,0,0,112,109,36,51,100,0,0,0,92,100,101,102,105,110,101,99,111,108,111,114,123,103,112,66,97,99,107,103,114,111,117,110,100,125,123,114,103,98,125,123,37,46,51,102,44,32,37,46,51,102,44,32,37,46,51,102,125,37,37,10,0,0,0,0,99,111,109,36,109,101,110,116,115,0,0,0,0,0,0,0,112,111,105,110,116,36,116,121,112,101,0,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,99,105,114,99,108,101,32,114,97,100,105,117,115,32,0,0,0,0,0,0,0,0,32,32,92,115,101,116,108,101,110,103,116,104,123,92,117,110,105,116,108,101,110,103,116,104,125,123,37,46,52,102,98,112,125,37,37,10,32,32,92,98,101,103,105,110,123,112,105,99,116,117,114,101,125,40,37,46,50,102,44,37,46,50,102,41,37,37,10,0,0,0,0,0,32,32,32,32,92,101,108,115,101,10,32,32,32,32,32,32,37,32,103,114,97,121,10,32,32,32,32,32,32,92,100,101,102,92,99,111,108,111,114,114,103,98,35,49,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,100,101,102,92,99,111,108,111,114,103,114,97,121,35,49,123,92,99,111,108,111,114,91,103,114,97,121,93,123,35,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,119,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,119,104,105,116,101,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,98,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,97,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,48,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,49,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,50,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,51,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,52,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,53,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,54,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,55,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,56,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,92,102,105,10,32,32,92,102,105,10,0,0,0,67,116,114,108,45,0,0,0,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,48,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,48,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,49,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,49,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,50,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,48,44,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,51,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,48,44,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,52,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,49,44,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,53,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,49,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,54,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,48,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,55,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,48,46,51,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,56,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,46,53,44,48,46,53,44,48,46,53,125,125,37,10,0,0,0,0,0,0,0,102,108,105,112,32,120,0,0,87,97,114,110,105,110,103,58,32,101,109,112,116,121,32,37,115,32,114,97,110,103,101,32,91,37,103,58,37,103,93,44,32,0,0,0,0,0,0,0,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,48,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,48,44,48,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,49,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,48,44,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,50,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,48,44,49,44,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,51,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,91,114,103,98,93,123,49,44,48,44,49,125,125,37,10,0,0,0,0,32,32,92,105,102,71,80,98,108,97,99,107,116,101,120,116,10,32,32,32,32,37,32,110,111,32,116,101,120,116,99,111,108,111,114,32,97,116,32,97,108,108,10,32,32,32,32,92,100,101,102,92,99,111,108,111,114,114,103,98,35,49,123,125,37,10,32,32,32,32,92,100,101,102,92,99,111,108,111,114,103,114,97,121,35,49,123,125,37,10,32,32,92,101,108,115,101,10,32,32,32,32,37,32,103,114,97,121,32,111,114,32,99,111,108,111,114,63,10,32,32,32,32,92,105,102,71,80,99,111,108,111,114,10,32,32,32,32,32,32,92,100,101,102,92,99,111,108,111,114,114,103,98,35,49,123,92,99,111,108,111,114,91,114,103,98,93,123,35,49,125,125,37,10,32,32,32,32,32,32,92,100,101,102,92,99,111,108,111,114,103,114,97,121,35,49,123,92,99,111,108,111,114,91,103,114,97,121,93,123,35,49,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,119,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,119,104,105,116,101,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,98,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,32,32,32,32,32,32,92,101,120,112,97,110,100,97,102,116,101,114,92,100,101,102,92,99,115,110,97,109,101,32,76,84,97,92,101,110,100,99,115,110,97,109,101,123,92,99,111,108,111,114,123,98,108,97,99,107,125,125,37,10,0,0,0,0,32,32,92,109,97,107,101,97,116,108,101,116,116,101,114,10,32,32,92,112,114,111,118,105,100,101,99,111,109,109,97,110,100,92,99,111,108,111,114,91,50,93,91,93,123,37,37,10,32,32,32,32,92,71,101,110,101,114,105,99,69,114,114,111,114,123,40,103,110,117,112,108,111,116,41,32,92,115,112,97,99,101,92,115,112,97,99,101,92,115,112,97,99,101,92,64,115,112,97,99,101,115,125,123,37,37,10,32,32,32,32,32,32,80,97,99,107,97,103,101,32,99,111,108,111,114,32,110,111,116,32,108,111,97,100,101,100,32,105,110,32,99,111,110,106,117,110,99,116,105,111,110,32,119,105,116,104,10,32,32,32,32,32,32,116,101,114,109,105,110,97,108,32,111,112,116,105,111,110,32,96,99,111,108,111,117,114,116,101,120,116,39,37,37,10,32,32,32,32,125,123,83,101,101,32,116,104,101,32,103,110,117,112,108,111,116,32,100,111,99,117,109,101,110,116,97,116,105,111,110,32,102,111,114,32,101,120,112,108,97,110,97,116,105,111,110,46,37,37,10,32,32,32,32,125,123,69,105,116,104,101,114,32,117,115,101,32,39,98,108,97,99,107,116,101,120,116,39,32,105,110,32,103,110,117,112,108,111,116,32,111,114,32,108,111,97,100,32,116,104,101,32,112,97,99,107,97,103,101,10,32,32,32,32,32,32,99,111,108,111,114,46,115,116,121,32,105,110,32,76,97,84,101,88,46,125,37,37,10,32,32,32,32,92,114,101,110,101,119,99,111,109,109,97,110,100,92,99,111,108,111,114,91,50,93,91,93,123,125,37,37,10,32,32,125,37,37,10,32,32,92,112,114,111,118,105,100,101,99,111,109,109,97,110,100,92,105,110,99,108,117,100,101,103,114,97,112,104,105,99,115,91,50,93,91,93,123,37,37,10,32,32,32,32,92,71,101,110,101,114,105,99,69,114,114,111,114,123,40,103,110,117,112,108,111,116,41,32,92,115,112,97,99,101,92,115,112,97,99,101,92,115,112,97,99,101,92,64,115,112,97,99,101,115,125,123,37,37,10,32,32,32,32,32,32,80,97,99,107,97,103,101,32,103,114,97,112,104,105,99,120,32,111,114,32,103,114,97,112,104,105,99,115,32,110,111,116,32,108,111,97,100,101,100,37,37,10,32,32,32,32,125,123,83,101,101,32,116,104,101,32,103,110,117,112,108,111,116,32,100,111,99,117,109,101,110,116,97,116,105,111,110,32,102,111,114,32,101,120,112,108,97,110,97,116,105,111,110,46,37,37,10,32,32,32,32,125,123,84,104,101,32,103,110,117,112,108,111,116,32,101,112,115,108,97,116,101,120,32,116,101,114,109,105,110,97,108,32,110,101,101,100,115,32,103,114,97,112,104,105,99,120,46,115,116,121,32,111,114,32,103,114,97,112,104,105,99,115,46,115,116,121,46,125,37,37,10,32,32,32,32,92,114,101,110,101,119,99,111,109,109,97,110,100,92,105,110,99,108,117,100,101,103,114,97,112,104,105,99,115,91,50,93,91,93,123,125,37,37,10,32,32,125,37,37,10,32,32,92,112,114,111,118,105,100,101,99,111,109,109,97,110,100,92,114,111,116,97,116,101,98,111,120,91,50,93,123,35,50,125,37,37,10,32,32,92,64,105,102,117,110,100,101,102,105,110,101,100,123,105,102,71,80,99,111,108,111,114,125,123,37,37,10,32,32,32,32,92,110,101,119,105,102,92,105,102,71,80,99,111,108,111,114,10,32,32,32,32,92,71,80,99,111,108,111,114,37,115,10,32,32,125,123,125,37,37,10,32,32,92,64,105,102,117,110,100,101,102,105,110,101,100,123,105,102,71,80,98,108,97,99,107,116,101,120,116,125,123,37,37,10,32,32,32,32,92,110,101,119,105,102,92,105,102,71,80,98,108,97,99,107,116,101,120,116,10,32,32,32,32,92,71,80,98,108,97,99,107,116,101,120,116,37,115,10,32,32,125,123,125,37,37,10,32,32,37,37,32,100,101,102,105,110,101,32,97,32,92,103,64,97,100,100,116,111,64,109,97,99,114,111,32,119,105,116,104,111,117,116,32,64,32,105,110,32,116,104,101,32,110,97,109,101,58,10,32,32,92,108,101,116,92,103,112,108,103,97,100,100,116,111,109,97,99,114,111,92,103,64,97,100,100,116,111,64,109,97,99,114,111,10,32,32,37,37,32,100,101,102,105,110,101,32,101,109,112,116,121,32,116,101,109,112,108,97,116,101,115,32,102,111,114,32,97,108,108,32,99,111,109,109,97,110,100,115,32,116,97,107,105,110,103,32,116,101,120,116,58,10,32,32,92,103,100,101,102,92,103,112,108,98,97,99,107,116,101,120,116,123,125,37,37,10,32,32,92,103,100,101,102,92,103,112,108,102,114,111,110,116,116,101,120,116,123,125,37,37,10,32,32,92,109,97,107,101,97,116,111,116,104,101,114,10,0,0,0,0,0,0,0,32,32,92,115,101,108,101,99,116,102,111,110,116,10,0,0,107,101,121,32,97,114,114,97,121,0,0,0,0,0,0,0,32,32,92,102,111,110,116,115,104,97,112,101,123,37,115,125,37,37,10,0,0,0,0,0,102,105,108,108,101,100,32,112,111,108,121,103,111,110,115,58,0,0,0,0,0,0,0,0,32,32,92,102,111,110,116,115,101,114,105,101,115,123,37,115,125,37,37,10,0,0,0,0,112,97,36,114,97,109,101,116,114,105,99,0,0,0,0,0,32,32,92,102,111,110,116,102,97,109,105,108,121,123,37,115,125,37,37,10,0,0,0,0,9,100,97,116,97,102,105,108,101,32,102,105,101,108,100,115,32,115,101,112,97,114,97,116,101,100,32,98,121,32,119,104,105,116,101,115,112,97,99,101,10,0,0,0,0,0,0,0,111,117,116,36,108,105,101,114,115,0,0,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,114,101,99,116,97,110,103,108,101,32,37,115,32,102,99,32,0,0,0,0,0,0,32,32,37,37,32,69,110,99,111,100,105,110,103,32,105,110,115,105,100,101,32,116,104,101,32,112,108,111,116,46,32,32,73,110,32,116,104,101,32,104,101,97,100,101,114,32,111,102,32,121,111,117,114,32,100,111,99,117,109,101,110,116,44,32,116,104,105,115,32,101,110,99,111,100,105,110,103,10,32,32,37,37,32,115,104,111,117,108,100,32,116,111,32,100,101,102,105,110,101,100,44,32,101,46,103,46,44,32,98,121,32,117,115,105,110,103,10,32,32,37,37,32,92,117,115,101,112,97,99,107,97,103,101,91,37,115,44,60,111,116,104,101,114,32,101,110,99,111,100,105,110,103,115,62,93,123,105,110,112,117,116,101,110,99,125,10,32,32,92,105,110,112,117,116,101,110,99,111,100,105,110,103,123,37,115,125,37,37,10,0,0,0,96,37,115,58,37,100,32,111,111,112,115,46,39,10,0,0,92,98,101,103,105,110,103,114,111,117,112,10,0,0,0,0,37,0,0,0,0,0,0,0,10,9,32,32,32,32,68,105,114,101,99,116,105,111,110,58,32,0,0,0,0,0,0,0,92,109,97,107,101,97,116,108,101,116,116,101,114,10,37,37,32,83,101,108,101,99,116,32,97,110,32,97,112,112,114,111,112,114,105,97,116,101,32,100,101,102,97,117,108,116,32,100,114,105,118,101,114,32,40,102,114,111,109,32,84,101,88,76,105,118,101,32,103,114,97,112,104,105,99,115,46,99,102,103,41,10,92,98,101,103,105,110,103,114,111,117,112,10,32,32,92,99,104,97,114,100,101,102,92,120,61,48,32,37,37,10,32,32,37,37,32,99,104,101,99,107,32,112,100,102,84,101,88,10,32,32,92,64,105,102,117,110,100,101,102,105,110,101,100,123,112,100,102,111,117,116,112,117,116,125,123,125,123,37,37,10,32,32,32,32,92,105,102,99,97,115,101,92,112,100,102,111,117,116,112,117,116,10,32,32,32,32,92,101,108,115,101,10,32,32,32,32,32,32,92,99,104,97,114,100,101,102,92,120,61,49,32,37,37,10,32,32,32,32,92,102,105,10,32,32,125,37,37,10,32,32,37,37,32,99,104,101,99,107,32,86,84,101,88,10,32,32,92,64,105,102,117,110,100,101,102,105,110,101,100,123,79,112,77,111,100,101,125,123,125,123,37,37,10,32,32,32,32,92,99,104,97,114,100,101,102,92,120,61,50,32,37,37,10,32,32,125,37,37,10,92,101,120,112,97,110,100,97,102,116,101,114,92,101,110,100,103,114,111,117,112,10,92,105,102,99,97,115,101,92,120,10,32,32,37,37,32,100,101,102,97,117,108,116,32,99,97,115,101,10,32,32,92,80,97,115,115,79,112,116,105,111,110,115,84,111,80,97,99,107,97,103,101,123,100,118,105,112,115,125,123,103,101,111,109,101,116,114,121,125,10,92,111,114,10,32,32,37,37,32,112,100,102,84,101,88,32,105,115,32,114,117,110,110,105,110,103,32,105,110,32,112,100,102,32,109,111,100,101,10,32,32,92,80,97,115,115,79,112,116,105,111,110,115,84,111,80,97,99,107,97,103,101,123,112,100,102,116,101,120,125,123,103,101,111,109,101,116,114,121,125,10,92,101,108,115,101,10,32,32,37,37,32,86,84,101,88,32,105,115,32,114,117,110,110,105,110,103,10,32,32,92,80,97,115,115,79,112,116,105,111])
.concat([110,115,84,111,80,97,99,107,97,103,101,123,118,116,101,120,125,123,103,101,111,109,101,116,114,121,125,10,92,102,105,10,92,109,97,107,101,97,116,111,116,104,101,114,10,37,37,32,83,101,116,32,112,97,112,101,114,115,105,122,101,10,92,117,115,101,112,97,99,107,97,103,101,91,112,97,112,101,114,115,105,122,101,61,123,37,46,50,102,98,112,44,37,46,50,102,98,112,125,44,116,101,120,116,61,123,37,46,50,102,98,112,44,37,46,50,102,98,112,125,93,123,103,101,111,109,101,116,114,121,125,10,37,37,32,78,111,32,112,97,103,101,32,110,117,109,98,101,114,115,32,97,110,100,32,110,111,32,112,97,114,97,103,114,97,112,104,32,105,110,100,101,110,116,97,116,105,111,110,10,92,112,97,103,101,115,116,121,108,101,123,101,109,112,116,121,125,10,92,115,101,116,108,101,110,103,116,104,123,92,112,97,114,105,110,100,101,110,116,125,123,48,98,112,125,37,37,10,37,37,32,76,111,97,100,32,99,111,110,102,105,103,117,114,97,116,105,111,110,32,102,105,108,101,10,92,73,110,112,117,116,73,102,70,105,108,101,69,120,105,115,116,115,123,103,110,117,112,108,111,116,46,99,102,103,125,123,37,37,10,32,32,92,116,121,112,101,111,117,116,123,85,115,105,110,103,32,99,111,110,102,105,103,117,114,97,116,105,111,110,32,102,105,108,101,32,103,110,117,112,108,111,116,46,99,102,103,125,37,37,10,125,123,37,37,10,32,92,116,121,112,101,111,117,116,123,78,111,32,99,111,110,102,105,103,117,114,97,116,105,111,110,32,102,105,108,101,32,103,110,117,112,108,111,116,46,99,102,103,32,102,111,117,110,100,46,125,37,37,10,125,37,37,10,37,115,10,92,98,101,103,105,110,123,100,111,99,117,109,101,110,116,125,10,0,0,0,0,0,0,0,0,78,111,32,112,111,105,110,116,115,32,40,118,105,115,105,98,108,101,32,111,114,32,105,110,118,105,115,105,98,108,101,41,32,116,111,32,112,108,111,116,46,10,10,0,0,0,0,0,92,117,115,101,112,97,99,107,97,103,101,91,37,115,93,123,105,110,112,117,116,101,110,99,125,10,0,0,0,0,0,0,37,32,76,111,97,100,32,112,97,99,107,97,103,101,115,10,92,117,115,101,112,97,99,107,97,103,101,123,103,114,97,112,104,105,99,120,125,10,92,117,115,101,112,97,99,107,97,103,101,123,99,111,108,111,114,125,10,0,0,0,0,0,0,0,92,114,101,110,101,119,99,111,109,109,97,110,100,42,92,117,112,100,101,102,97,117,108,116,123,37,115,125,37,37,10,0,103,114,97,112,104,98,111,120,0,0,0,0,0,0,0,0,92,114,101,110,101,119,99,111,109,109,97,110,100,42,92,109,100,100,101,102,97,117,108,116,123,37,115,125,37,37,10,0,66,121,116,101,79,114,100,101,114,0,0,0,0,0,0,0,110,111,110,45,105,110,116,101,103,101,114,32,112,97,115,115,101,100,32,116,111,32,98,111,111,108,101,97,110,32,111,112,101,114,97,116,111,114,0,0,37,50,100,0,0,0,0,0,92,114,101,110,101,119,99,111,109,109,97,110,100,42,92,114,109,100,101,102,97,117,108,116,123,37,115,125,37,37,10,0,111,36,117,116,112,117,116,0,92,100,111,99,117,109,101,110,116,99,108,97,115,115,123,109,105,110,105,109,97,108,125,10,37,37,32,83,101,116,32,102,111,110,116,32,115,105,122,101,10,92,109,97,107,101,97,116,108,101,116,116,101,114,10,92,100,101,102,92,64,112,116,115,105,122,101,123,37,100,125,10,92,73,110,112,117,116,73,102,70,105,108,101,69,120,105,115,116,115,123,115,105,122,101,37,100,46,99,108,111,125,123,125,123,37,37,10,32,32,32,92,71,101,110,101,114,105,99,69,114,114,111,114,123,40,103,110,117,112,108,111,116,41,32,92,115,112,97,99,101,92,115,112,97,99,101,92,115,112,97,99,101,92,64,115,112,97,99,101,115,125,123,37,37,10,32,32,32,32,32,32,71,110,117,112,108,111,116,32,69,114,114,111,114,58,32,70,105,108,101,32,96,115,105,122,101,37,100,46,99,108,111,39,32,110,111,116,32,102,111,117,110,100,33,32,67,111,117,108,100,32,110,111,116,32,115,101,116,32,102,111,110,116,32,115,105,122,101,37,37,10,32,32,32,125,123,83,101,101,32,116,104,101,32,103,110,117,112,108,111,116,32,100,111,99,117,109,101,110,116,97,116,105,111,110,32,102,111,114,32,101,120,112,108,97,110,97,116,105,111,110,46,37,37,10,32,32,32,125,123,70,111,114,32,117,115,105,110,103,32,97,32,102,111,110,116,32,115,105,122,101,32,97,32,102,105,108,101,32,96,115,105,122,101,60,102,111,110,116,115,105,122,101,62,46,99,108,111,39,32,104,97,115,32,116,111,32,101,120,105,115,116,46,10,32,32,32,32,32,32,32,32,70,97,108,108,105,110,103,32,98,97,99,107,32,94,94,74,116,111,32,100,101,102,97,117,108,116,32,102,111,110,116,115,105,122,101,32,49,48,112,116,46,125,37,37,10,32,32,92,100,101,102,92,64,112,116,115,105,122,101,123,48,125,10,32,32,92,105,110,112,117,116,123,115,105,122,101,49,48,46,99,108,111,125,37,37,10,125,37,37,10,92,109,97,107,101,97,116,111,116,104,101,114,10,0,0,0,0,9,100,97,116,97,102,105,108,101,32,102,105,101,108,100,115,32,115,101,112,97,114,97,116,101,100,32,98,121,32,34,37,99,34,10,0,0,0,0,0,110,111,111,117,116,36,108,105,101,114,115,0,0,0,0,0,115,101,116,32,115,116,121,108,101,32,102,105,108,108,32,0,69,80,83,76,65,84,69,88,95,99,111,109,109,111,110,95,105,110,105,116,0,0,0,0,105,110,118,97,108,105,100,32,105,110,112,117,116,32,101,110,99,111,100,105,110,103,32,117,115,101,100,0,0,0,0,0,107,111,105,56,45,117,0,0,107,111,105,56,45,114,0,0,99,112,52,51,55,100,101,0,108,97,116,105,110,57,0,0,108,97,116,105,110,53,0,0,108,97,116,105,110,50,0,0,115,116,97,99,107,32,111,118,101,114,102,108,111,119,0,0,120,94,50,0,0,0,0,0,112,97,116,116,101,114,110,32,102,105,108,108,0,0,0,0,108,97,116,105,110,49,0,0,111,114,36,105,103,105,110,0,37,37,32,71,78,85,80,76,79,84,58,32,76,97,84,101,88,32,112,105,99,116,117,114,101,32,119,105,116,104,32,80,111,115,116,115,99,114,105,112,116,10,0,0,0,0,0,0,115,101,112,36,97,114,97,116,111,114,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,100,97,116,97,39,44,32,39,102,117,110,99,116,105,111,110,39,44,32,39,108,105,110,101,39,44,32,39,102,105,108,108,39,44,32,39,114,101,99,116,97,110,103,108,101,39,44,32,39,99,105,114,99,108,101,39,44,32,39,101,108,108,105,112,115,101,39,32,111,114,32,39,97,114,114,111,119,39,0,0,0,0,0,0,0,101,112,115,108,97,116,101,120,32,116,101,114,109,105,110,97,108,32,99,97,110,110,111,116,32,119,114,105,116,101,32,116,111,32,115,116,97,110,100,97,114,100,32,111,117,116,112,117,116,0,0,0,0,0,0,0,96,37,115,39,10,0,0,0,32,32,123,92,71,78,85,80,76,79,84,115,112,101,99,105,97,108,123,34,10,0,0,0,32,32,92,115,112,101,99,105,97,108,123,112,115,102,105,108,101,61,37,115,32,108,108,120,61,48,32,108,108,121,61,48,32,117,114,120,61,37,100,32,117,114,121,61,37,100,32,114,119,105,61,37,100,125,10,0,92,71,78,85,80,76,79,84,112,105,99,116,117,114,101,40,37,100,44,37,100,41,10,0,37,37,32,71,78,85,80,76,79,84,58,32,112,108,97,105,110,32,84,101,88,32,119,105,116,104,32,80,111,115,116,115,99,114,105,112,116,10,92,98,101,103,105,110,103,114,111,117,112,10,92,99,97,116,99,111,100,101,96,92,64,61,49,49,92,114,101,108,97,120,10,92,100,101,102,92,71,78,85,80,76,79,84,115,112,101,99,105,97,108,123,37,37,10,32,32,92,100,101,102,92,100,111,35,35,49,123,92,99,97,116,99,111,100,101,96,35,35,49,61,49,50,92,114,101,108,97,120,125,92,100,111,115,112,101,99,105,97,108,115,10,32,32,92,99,97,116,99,111,100,101,96,92,123,61,49,92,99,97,116,99,111,100,101,96,92,125,61,50,92,99,97,116,99,111,100,101,92,37,37,61,49,52,92,114,101,108,97,120,92,115,112,101,99,105,97,108,125,37,37,10,37,37,10,92,101,120,112,97,110,100,97,102,116,101,114,92,105,102,120,92,99,115,110,97,109,101,32,71,78,85,80,76,79,84,112,105,99,116,117,114,101,92,101,110,100,99,115,110,97,109,101,92,114,101,108,97,120,10,32,32,92,99,115,110,97,109,101,32,110,101,119,100,105,109,101,110,92,101,110,100,99,115,110,97,109,101,92,71,78,85,80,76,79,84,117,110,105,116,10,32,32,92,103,100,101,102,92,71,78,85,80,76,79,84,112,105,99,116,117,114,101,40,35,49,44,35,50,41,123,92,118,98,111,120,32,116,111,35,50,92,71,78,85,80,76,79,84,117,110,105,116,92,98,103,114,111,117,112,10,32,32,32,32,92,100,101,102,92,112,117,116,40,35,35,49,44,35,35,50,41,35,35,51,123,92,117,110,115,107,105,112,92,114,97,105,115,101,35,35,50,92,71,78,85,80,76,79,84,117,110,105,116,10,32,32,32,32,32,32,92,104,98,111,120,32,116,111,48,112,116,123,92,107,101,114,110,35,35,49,92,71,78,85,80,76,79,84,117,110,105,116,32,35,35,51,92,104,115,115,125,92,105,103,110,111,114,101,115,112,97,99,101,115,125,37,37,10,32,32,32,32,92,100,101,102,92,108,106,117,115,116,35,35,49,123,92,118,98,111,120,32,116,111,48,112,116,123,92,118,115,115,92,104,98,111,120,32,116,111,48,112,116,123,35,35,49,92,104,115,115,125,92,118,115,115,125,125,37,37,10,32,32,32,32,92,100,101,102,92,99,106,117,115,116,35,35,49,123,92,118,98,111,120,32,116,111,48,112,116,123,92,118,115,115,92,104,98,111,120,32,116,111,48,112,116,123,92,104,115,115,32,35,35,49,92,104,115,115,125,92,118,115,115,125,125,37,37,10,32,32,32,32,92,100,101,102,92,114,106,117,115,116,35,35,49,123,92,118,98,111,120,32,116,111,48,112,116,123,92,118,115,115,92,104,98,111,120,32,116,111,48,112,116,123,92,104,115,115,32,35,35,49,125,92,118,115,115,125,125,37,37,10,32,32,32,32,92,100,101,102,92,115,116,97,99,107,35,35,49,123,92,108,101,116,92,92,61,92,99,114,92,116,97,98,115,107,105,112,61,48,112,116,92,104,97,108,105,103,110,123,92,104,102,105,108,32,35,35,35,35,92,104,102,105,108,92,99,114,32,35,35,49,92,99,114,99,114,125,125,37,37,10,32,32,32,32,92,100,101,102,92,108,115,116,97,99,107,35,35,49,123,92,104,98,111,120,32,116,111,48,112,116,123,92,118,98,111,120,32,116,111,48,112,116,123,92,118,115,115,92,115,116,97,99,107,123,35,35,49,125,125,92,104,115,115,125,125,37,37,10,32,32,32,32,92,100,101,102,92,99,115,116,97,99,107,35,35,49,123,92,104,98,111,120,32,116,111,48,112,116,123,92,104,115,115,92,118,98,111,120,32,116,111,48,112,116,123,92,118,115,115,92,115,116,97,99,107,123,35,35,49,125,125,92,104,115,115,125,125,37,37,10,32,32,32,32,92,100,101,102,92,114,115,116,97,99,107,35,35,49,123,92,104,98,111,120,32,116,111,48,112,116,123,92,118,98,111,120,32,116,111,48,112,116,123,92,115,116,97,99,107,123,35,35,49,125,92,118,115,115,125,92,104,115,115,125,125,37,37,10,32,32,32,32,92,118,115,115,92,104,98,111,120,32,116,111,35,49,92,71,78,85,80,76,79,84,117,110,105,116,92,98,103,114,111,117,112,92,105,103,110,111,114,101,115,112,97,99,101,115,125,37,37,10,32,32,92,103,100,101,102,92,101,110,100,71,78,85,80,76,79,84,112,105,99,116,117,114,101,123,92,104,115,115,92,101,103,114,111,117,112,92,101,103,114,111,117,112,125,37,37,10,92,102,105,10,92,71,78,85,80,76,79,84,117,110,105,116,61,37,46,52,102,98,112,10,0,92,98,101,103,105,110,123,112,105,99,116,117,114,101,125,40,37,100,44,37,100,41,40,48,44,48,41,37,37,10,0,0,37,37,32,71,78,85,80,76,79,84,58,32,76,97,84,101,88,32,112,105,99,116,117,114,101,32,119,105,116,104,32,80,111,115,116,115,99,114,105,112,116,10,92,98,101,103,105,110,103,114,111,117,112,37,37,10,92,109,97,107,101,97,116,108,101,116,116,101,114,37,37,10,92,110,101,119,99,111,109,109,97,110,100,123,92,71,78,85,80,76,79,84,115,112,101,99,105,97,108,125,123,37,37,10,32,32,92,64,115,97,110,105,116,105,122,101,92,99,97,116,99,111,100,101,96,92,37,37,61,49,52,92,114,101,108,97,120,92,115,112,101,99,105,97,108,125,37,37,10,92,115,101,116,108,101,110,103,116,104,123,92,117,110,105,116,108,101,110,103,116,104,125,123,37,46,52,102,98,112,125,37,37,10,0,78,111,110,45,110,117,109,101,114,105,99,32,115,116,114,105,110,103,32,102,111,117,110,100,32,119,104,101,114,101,32,97,32,110,117,109,101,114,105,99,32,101,120,112,114,101,115,115,105,111,110,32,119,97,115,32,101,120,112,101,99,116,101,100,0,0,0,0,0,0,0,0,116,97,103,32,109,117,115,116,32,98,101,32,62,32,122,101,114,111,0,0,0,0,0,0,108,105,110,101,119,105,100,116,104,0,0,0,0,0,0,0,80,108,111,116,32,102,97,105,108,101,100,33,0,0,0,0,111,102,36,102,115,101,116,115,0,0,0,0,0,0,0,0,111,114,32,115,101,116,32,116,104,101,32,108,111,97,100,112,97,116,104,32,97,112,112,114,111,112,114,105,97,116,101,108,121,10,0,0,0,0,0,0,9,34,37,115,34,32,105,110,32,100,97,116,97,102,105,108,101,32,105,115,32,105,110,116,101,114,112,114,101,116,101,100,32,97,115,32,109,105,115,115,105,110,103,32,118,97,108,117,101,10,0,0,0,0,0,0,117,36,115,101,114,115,116,121,108,101,115,0,0,0,0,0,111,114,32,115,101,116,32,116,104,101,32,101,110,118,105,114,111,110,109,101,110,116,97,108,32,118,97,114,105,97,98,108,101,32,71,78,85,80,76,79,84,95,80,83,95,68,73,82,10,0,0,0,0,0,0,0,37,99,32,0,0,0,0,0,80,108,101,97,115,101,32,99,111,112,121,32,37,115,32,116,111,32,111,110,101,32,111,102,32,116,104,101,32,97,98,111,118,101,32,100,105,114,101,99,116,111,114,105,101,115,10,0,67,97,110,39,116,32,102,105,110,100,32,80,111,115,116,83,99,114,105,112,116,32,112,114,111,108,111,103,117,101,32,102,105,108,101,32,37,115,10,0,10,9,32,32,32,32,71,101,110,101,114,97,116,101,32,99,111,111,114,100,105,110,97,116,101,115,58,32,37,115,0,0,71,78,85,80,76,79,84,95,80,83,95,68,73,82,0,0,80,114,111,108,111,103,32,110,97,109,101,0,0,0,0,0,37,45,49,53,46,49,53,115,32,61,32,37,45,49,53,46,49,53,115,32,32,32,37,115,0,0,0,0,0,0,0,0,47,117,115,114,47,108,111,99,97,108,47,115,104,97,114,101,47,103,110,117,112,108,111,116,47,52,46,54,47,80,111,115,116,83,99,114,105,112,116,0,97,103,108,105,115,116,0,0,97,103,108,102,110,46,116,120,116,0,0,0,0,0,0,0,115,116,97,99,107,32,117,110,100,101,114,102,108,111,119,32,40,102,117,110,99,116,105,111,110,32,99,97,108,108,32,119,105,116,104,32,109,105,115,115,105,110,103,32,112,97,114,97,109,101,116,101,114,115,63,41,0,0,0,0,0,0,0,0,32,32,108,119,32,37,49,100,37,99,0,0,0,0,0,0,47,76,84,51,32,123,32,80,76,32,91,56,32,100,108,49,32,53,32,100,108,49,32,48,46,53,32,100,108,49,32,53,32,100,108,49,93,32,49,32,48,32,49,32,68,76,32,125,32,100,101,102,10,0,0,0,120,37,100,0,0,0,0,0,110,111,109,99,98,116,36,105,99,115,0,0,0,0,0,0,47,76,84,50,32,123,32,80,76,32,91,52,32,100,108,49,32,52,32,100,108,49,93,32,48,32,49,32,49,32,68,76,32,125,32,100,101,102,10,0,9,78,111,32,109,105,115,115,105,110,103,32,100,97,116,97,32,115,116,114,105,110,103,32,115,101,116,32,102,111,114,32,100,97,116,97,102,105,108,101,10,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,117,110,105,116,115,32,123,120,121,124,120,120,124,121,121,125,39,44,32,39,97,110,103,108,101,32,60,110,117,109,98,101,114,62,39,32,111,114,32,39,115,105,122,101,32,60,112,111,115,105,116,105,111,110,62,39,0,0,0,0,0,115,101,116,32,98,111,120,119,105,100,116,104,32,37,103,32,37,115,10,0,0,0,0,0,47,76,84,49,32,123,32,80,76,32,91,56,32,100,108,49,32,53,32,100,108,49,93,32,48,32,48,32,49,32,68,76,32,125,32,100,101,102,10,0,32,37,45,49,50,115,32,0,47,76,84,48,32,123,32,80,76,32,91,93,32,49,32,48,32,48,32,68,76,32,125,32,100,101,102,10,0,0,0,0,47,76,84,97,32,123,32,65,76,32,91,49,32,117,100,108,32,109,117,108,32,50,32,117,100,108,32,109,117,108,93,32,48,32,115,101,116,100,97,115,104,32,48,32,48,32,48,32,115,101,116,114,103,98,99,111,108,111,114,32,125,32,100,101,102,10,0,0,0,0,0,0,103,112,95,105,110,112,117,116,95,108,105,110,101,0,0,0,47,76,84,98,32,123,32,66,76,32,91,93,32,48,32,48,32,48,32,68,76,32,125,32,100,101,102,10,0,0,0,0,47,76,84,119,32,123,32,80,76,32,91,93,32,49,32,115,101,116,103,114,97,121,32,125,32,100,101,102,10,0,0,0,36,40,0,0,0,0,0,0,37,32,82,101,100,101,102,105,110,101,32,108,105,110,101,32,116,121,112,101,115,32,116,111,32,109,97,116,99,104,32,111,108,100,32,101,112,115,108,97,116,101,120,32,100,114,105,118,101,114,10,0,0,0,0,0,70,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,32,109,105,115,109,97,116,99,104,58,32,37,37,99,32,105,115,32,111,110,108,121,32,118,97,108,105,100,32,119,105,116,104,32,37,37,115,0,0,0,99,117,114,114,101,110,116,100,105,99,116,32,101,110,100,32,100,101,102,105,110,101,102,111,110,116,32,112,111,112,10,0,101,120,112,101,99,116,105,110,103,32,39,100,97,116,97,39,44,32,39,102,117,110,99,116,105,111,110,39,44,32,39,108,105,110,101,39,44,32,39,102,105,108,108,39,32,111,114,32,39,97,114,114,111,119,39,0,112,109,0,0,0,0,0,0,100,117,112,32,108,101,110,103,116,104,32,100,105,99,116,32,98,101,103,105,110,32,123,49,32,105,110,100,101,120,32,47,70,73,68,32,101,113,32,123,112,111,112,32,112,111,112,125,32,123,100,101,102,125,32,105,102,101,108,115,101,125,32,102,111,114,97,108,108,10,0,0,10,119,97,114,110,105,110,103,58,32,32,105,110,116,101,114,110,97,108,32,101,114,114,111,114,45,45,115,116,97,99,107,32,110,111,116,32,101,109,112,116,121,33,10,32,32,32,32,32,32,32,32,32,32,40,102,117,110,99,116,105,111,110,32,99,97,108,108,101,100,32,119,105,116,104,32,116,111,111,32,109,97,110,121,32,112,97,114,97,109,101,116,101,114,115,63,41,10,0,0,0,0,0,0,37,100,0,0,0,0,0,0,47,67,77,69,88,49,48,45,66,97,115,101,108,105,110,101,32,47,67,77,69,88,49,48,32,102,105,110,100,102,111,110,116,32,91,49,32,48,32,48,32,49,32,48,32,49,93,32,109,97,107,101,102,111,110,116,10,0,0,0,0,0,0,0,73,110,102,0,0,0,0,0,109,99,98,116,36,105,99,115,0,0,0,0,0,0,0,0,37,37,66,101,103,105,110,80,114,111,99,83,101,116,58,32,67,77,69,88,49,48,45,66,97,115,101,108,105,110,101,10,0,0,0,0,0,0,0,0,109,105,115,115,36,105,110,103,0,0,0,0,0,0,0,0,101,120,112,101,99,116,105,110,103,32,39,120,121,39,44,32,39,120,120,39,32,111,114,32,39,121,121,39,0,0,0,0,115,101,116,32,98,111,120,119,105,100,116,104,10,0,0,0,67,77,69,88,49,48,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,42,32,105,110,100,105,99,97,116,101,115,32,116,104,105,115,32,107,101,121,32,105,115,32,97,99,116,105,118,101,32,102,114,111,109,32,97,108,108,32,112,108,111,116,32,119,105,110,100,111,119,115,10,0,0,0,0,0,37,37,69,110,100,80,114,111,99,83,101,116,10,0,0,0,67,111,109,109,97,110,100,32,39,37,115,39,32,103,101,110,101,114,97,116,101,100,32,101,114,114,111,114,44,32,101,120,105,116,99,111,100,101,32,105,115,32,37,100,0,0,0,0,101,10,0,0,0,0,0,0,107,111,105,56,114,0,0,0,80,105,112,101,32,39,37,115,39,32,99,111,110,116,97,105,110,115,32,116,104,101,32,102,111,110,116,32,39,37,115,39,46,10,0,0,0,0,0,0,32,32,112,105,120,101,108,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,99,111,110,116,97,105,110,115,32,116,104,101,32,102,111,110,116,32,39,37,115,39,46,32,76,111,99,97,116,105,111,110,58,10,32,32,32,37,115,10,0,117,109,105,110,117,115,0,0,108,111,97,100,95,102,111,110,116,102,105,108,101,115,0,0,47,70,111,110,116,78,97,109,101,0,0,0,0,0,0,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,115,101,101,109,115,32,110,111,116,32,116,111,32,98,101,32,97,32,80,70,65,32,102,105,108,101,0,0,0,0,0,0,0,117,110,107,110,111,119,110,32,116,121,112,101,32,105,110,32,97,110,103,108,101,40,41,0,115,104,111,119,32,116,105,99,115,99,97,108,101,0,0,0,67,111,109,109,97,110,100,32,39,37,115,39,32,115,101,101,109,115,32,110,111,116,32,116,111,32,103,101,110,101,114,97,116,101,32,80,70,65,32,100,97,116,97,0,0,0,0,0,110,111,109,122,116,36,105,99,115,0,0,0,0,0,0,0,9,32,32,32,32,68,105,109,101,110,115,105,111,110,58,32,0,0,0,0,0,0,0,0,104,105,36,115,116,111,114,121,0,0,0,0,0,0,0,0,37,33,70,111,110,116,84,121,112,101,49,0,0,0,0,0,9,109,111,117,115,101,32,105,115,32,111,102,102,10,0,0,121,121,0,0,0,0,0,0,37,33,80,83,45,65,100,111,98,101,70,111,110,116,0,0,37,48,46,52,102,9,37,48,46,52,102,10,0,0,0,0,99,108,111,115,101,32,116,104,105,115,32,112,108,111,116,32,119,105,110,100,111,119,0,0,70,111,110,116,32,102,105,108,101,32,39,37,115,39,32,104,97,115,32,117,110,107,110,111,119,110,32,101,120,116,101,110,115,105,111,110,46,32,65,115,115,117,109,101,32,105,116,32,105,115,32,97,32,112,102,97,32,102,105,108,101,0,0,0,112,102,97,0,0,0,0,0,37,115,32,104,97,115,32,37,115,32,99,111,111,114,100,32,111,102,32,37,103,59,32,109,117,115,116,32,98,101,32,97,98,111,118,101,32,48,32,102,111,114,32,108,111,103,32,115,99,97,108,101,33,0,0,0,78,111,32,99,111,109,109,97,110,100,32,102,111,114,32,97,117,116,111,109,97,116,105,99,32,102,111,110,116,32,99,111,110,118,101,114,115,105,111,110,32,112,102,98,45,62,112,102,97,32,100,101,102,105,110,101,100,0,0,0,0,0,0,0,112,102,98,116,111,112,115,32,37,115,0,0,0,0,0,0,71,78,85,80,76,79,84,95,80,70,66,84,79,80,70,65,0,0,0,0,0,0,0,0,45,82,69,65,68,76,73,78,69,32,32,0,0,0,0,0,112,102,98,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,101,120,101,99,117,116,101,32,99,111,109,109,97,110,100,32,39,37,115,39,0,0,117,110,107,110,111,119,110,32,116,121,112,101,32,105,110,32,109,97,103,110,105,116,117,100,101,40,41,0,0,0,0,0,99,97,110,39,116,32,114,111,116,97,116,101,32,116,101,120,116,0,0,0,0,0,0,0,78,111,32,99,111,109,109,97,110,100,32,102,111,114,32,97,117,116,111,109,97,116,105,99,32,102,111,110,116,32,99,111,110,118,101,114,115,105,111,110,32,116,116,102,45,62,112,102,97,32,100,101,102,105,110,101,100,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,99,111,109,112,108,101,120,32,99,111,110,115,116,97,110,116,0,0,0,0,0,0,0,0,109,122,116,36,105,99,115,0,10,9,32,32,82,101,99,111,114,100,32,37,100,58,10,0,116,116,102,50,112,116,49,32,45,97,32,45,101,32,45,87,32,48,32,37,115,32,45,0,110,111,116,32,0,0,0,0,101,120,112,101,99,116,105,110,103,32,100,97,116,97,102,105,108,101,32,109,111,100,105,102,105,101,114,0,0,0,0,0,112,110,103,0,0,0,0,0,120,120,0,0,0,0,0,0,115,101,116,32,37,115,100,97,116,97,32,37,115,10,0,0,71,78,85,80,76,79,84,95,84,84,70,84,79,80,70,65,0,0,0,0,0,0,0,0,113,0,0,0,0,0,0,0,111,116,102,0,0,0,0,0,116,116,102,0,0,0,0,0,37,37,37,37,66,101,103,105,110,80,114,111,99,83,101,116,58,32,37,115,10,0,0,0,80,83,95,101,115,99,97,112,101,95,115,116,114,105,110,103,0,0,0,0,0,0,0,0,101,110,100,10,37,37,69,110,100,80,114,111,108,111,103,10,0,0,0,0,0,0,0,0,10,84,101,114,109,105,110,97,108,32,116,121,112,101,32,115,101,116,32,116,111,32,39,37,115,39,10,0,0,0,0,0,40,41,92,0,0,0,0,0,115,116,97,116,117,115,100,105,99,116,32,98,101,103,105,110,32,37,115,32,115,101,116,100,117,112,108,101,120,109,111,100,101,32,101,110,100,10,0,0,117,110,107,110,111,119,110,32,116,121,112,101,32,105,110,32,105,109,97,103,40,41,0,0,32,114,111,116,97,116,101,100,32,98,121,32,45,52,53,32,100,101,103,0,0,0,0,0,117,116,102,45,56,46,112,115,0,0,0,0,0,0,0,0,110,111,109,121,50,116,36,105,99,115,0,0,0,0,0,0,10,9,32,32,68,101,102,97,117,108,116,32,98,105,110,97,114,121,32,102,111,114,109,97,116,58,32,37,115,0,0,0,99,116,114,108,45,0,0,0,107,111,105,56,117,46,112,115,0,0,0,0,0,0,0,0,9,99,111,109,109,117,110,105,99,97,116,105,111,110,32,99,111,109,109,97,110,100,115,32,119,105,108,108,32,37,115,98,101,32,115,104,111,119,110,10,0,0,0,0,0,0,0,0,107,111,105,56,114,46,112,115,0,0,0,0,0,0,0,0,117,110,105,116,36,115,0,0,48,32,121,48,32,78,32,49,32,48,32,86,32,48,32,121,115,116,101,112,32,86,32,45,49,32,48,32,102,10,0,0,115,101,116,32,116,105,109,101,102,109,116,32,37,115,32,34,37,115,34,10,0,0,0,0,112,100,112,32,40,109,105,100,100,108,101,41,0,0,0,0,85,110,101,120,112,101,99,116,101,100,32,125,0,0,0,0,102,105,118,101,95,100,105,97,103,32,104,101,108,112,32,118,97,114,115,0,0,0,0,0,32,37,45,49,50,115,32,42,32,37,115,10,0,0,0,0,99,112,49,50,53,49,46,112,115,0,0,0,0,0,0,0,115,116,114,95,99,111,110,115,116,0,0,0,0,0,0,0,99,112,49,50,53,48,46,112,115,0,0,0,0,0,0,0,44,32,39,45,39,32,119,32,108,32,116,105,116,108,101,32,39,78,84,83,67,39,32,108,116,32,45,49,0,0,0,0,99,112,56,53,50,46,112,115,0,0,0,0,0,0,0,0,99,112,56,53,48,46,112,115,0,0,0,0,0,0,0,0,99,112,52,51,55,46,112,115,0,0,0,0,0,0,0,0,56,56,53,57,45,49,53,46,112,115,0,0,0,0,0,0,56,56,53,57,45,57,46,112,115,0,0,0,0,0,0,0,68,105,100,32,121,111,117,32,116,114,121,32,116,111,32,103,101,110,101,114,97,116,101,32,97,32,102,105,108,101,32,110,97,109,101,32,117,115,105,110,103,32,100,117,109,109,121,32,118,97,114,105,97,98,108,101,32,120,32,111,114,32,121,63,0,0,0,0,0,0,0,0,32,114,111,116,97,116,101,100,32,98,121,32,43,52,53,32,100,101,103,0,0,0,0,0,56,56,53,57,45,50,46,112,115,0,0,0,0,0,0,0,109,121,50,116,36,105,99,115,0,0,0,0,0,0,0,0,10,9,32,32,70,105,108,101,32,69,110,100,105,97,110,110,101,115,115,58,32,37,115,0,56,56,53,57,45,49,46,112,115,0,0,0,0,0,0,0,9,122,111,111,109,106,117,109,112,32,105,115,32,37,115,10,0,0,0,0,0,0,0,0,97,110,103,36,108,101,0,0,117,110,115,101,116,32,98,111,114,100,101,114,10,0,0,0,112,114,111,108,111,103,117,101,46,112,115,0,0,0,0,0,58,32,0,0,0,0,0,0,114,97,105,115,101,32,103,110,117,112,108,111,116,32,99,111,110,115,111,108,101,32,119,105,110,100,111,119,0,0,0,0,47,100,111,99,108,105,112,32,123,10,32,32,67,108,105,112,84,111,66,111,117,110,100,105,110,103,66,111,120,32,123,10,32,32,32,32,110,101,119,112,97,116,104,32,37,100,32,37,100,32,109,111,118,101,116,111,32,37,100,32,37,100,32,108,105,110,101,116,111,32,37,100,32,37,100,32,108,105,110,101,116,111,32,37,100,32,37,100,32,108,105,110,101,116,111,32,99,108,111,115,101,112,97,116,104,10,32,32,32,32,99,108,105,112,10,32,32,125,32,105,102,10,125,32,100,101,102,10,0,0,0,0,0,0,0,0,37,37,80,97,103,101,115,58,32,40,97,116,101,110,100,41,10,0,0,0,0,0,0,0,98,108,117,101,39,119,32,108,32,108,116,32,51,32,108,99,32,114,103,98,32,39,98,108,117,101,39,0,0,0,0,0,121,0,0,0,0,0,0,0,80,111,114,116,114,97,105,116,0,0,0,0,0,0,0,0,76,97,110,100,115,99,97,112,101,0,0,0,0,0,0,0,9,32,32,87,105,108,108,32,37,115,117,115,101,32,111,116,104,101,114,32,100,105,97,103,111,110,97,108,32,105,102,32,105,116,32,103,105,118,101,115,32,97,32,108,101,115,115,32,106,97,103,103,121,32,111,117,116,108,105,110,101,10,9,32,32,87,105,108,108,32,37,115,100,114,97,119,32,100,105,97,103,111,110,97,108,32,118,105,115,105,98,108,121,32,105,102,32,113,117,97,100,114,97,110,103,108,101,32,105,115,32,39,98,101,110,116,32,111,118,101,114,39,10,0,0,0,0,0,37,37,37,37,79,114,105,101,110,116,97,116,105,111,110,58,32,37,115,10,0,0,0,0,37,37,37,37,66,111,117,110,100,105,110,103,66,111,120,58,32,37,100,32,37,100,32,37,100,32,37,100,10,0,0,0,99,111,110,116,111,117,114,32,101,100,103,101,0,0,0,0,40,97,116,101,110,100,41,0,101,110,99,111,117,110,116,101,114,101,100,32,97,32,115,116,114,105,110,103,32,119,104,101,110,32,101,120,112,101,99,116,105,110,103,32,97,32,110,117,109,98,101,114,0,0,0,0,114,111,116,97,116,101,100,32,99,101,43,110,116,114,101,100,32,116,101,120,116,0,0,0,37,37,37,37,84,105,116,108,101,58,32,37,115,10,0,0,110,111,109,121,116,36,105,99,115,0,0,0,0,0,0,0,37,33,80,83,45,65,100,111,98,101,45,50,46,48,10,0,9,66,117,116,116,111,110,32,50,32,100,114,97,119,115,32,116,101,109,112,111,114,97,114,121,32,108,97,98,101,108,115,10,0,0,0,0,0,0,0,115,101,116,32,98,111,114,100,101,114,32,37,100,32,37,115,0,0,0,0,0,0,0,0,37,33,80,83,45,65,100,111,98,101,45,50,46,48,32,69,80,83,70,45,50,46,48,10,0,0,0,0,0,0,0,0,83,112,97,99,101,0,0,0,101,112,115,0,0,0,0,0,105,110,118,97,108,105,100,32,112,111,115,116,115,99,114,105,112,116,32,102,111,114,109,97,116,32,117,115,101,100,0,0,103,114,101,101,110,39,119,32,108,32,108,116,32,50,32,108,99,32,114,103,98,32,39,103,114,101,101,110,39,0,0,0,37,37,37,37,80,97,103,101,115,58,32,37,100,10,0,0,112,118,101,114,116,0,0,0,37,115,37,115,0,0,0,0,37,37,68,111,99,117,109,101,110,116,70,111,110,116,115,58,32,0,0,0,0,0,0,0,32,61,9,10,0,0,0,0,37,37,84,114,97,105,108,101,114,10,0,0,0,0,0,0,115,116,0,0,0,0,0,0,115,116,114,111,107,101,10,103,114,101,115,116,111,114,101,10,101,110,100,10,115,104,111,119,112,97,103,101,10,0,0,0,117,110,107,110,111,119,110,32,116,121,112,101,32,105,110,32,114,101,97,108,40,41,0,0,77,82,115,104,111,119,10,0,114,105,103,104,116,32,106,117,115,116,105,102,105,101,100,0,68,97,116,97,84,121,112,101,0,0,0,0,0,0,0,0,109,121,116,36,105,99,115,0,77,67,115,104,111,119,10,0,9,66,117,116,116,111,110,32,50,32,100,114,97,119,115,32,112,101,114,115,105,115,116,101,110,116,32,108,97,98,101,108,115,32,119,105,116,104,32,111,112,116,105,111,110,115,32,34,37,115,34,10,0,0,0,0,114,36,97,100,105,117,115,0,117,110,0,0,0,0,0,0,77,76,115,104,111,119,10,0,32,37,45,49,50,115,32,32,32,37,115,10,0,0,0,0,93,32,37,46,49,102,32,0,92,37,111,0,0,0,0,0,114,101,100,39,119,32,108,32,108,116,32,49,32,108,99,32,114,103,98,32,39,114,101,100,39,0,0,0,0,0,0,0,91,32,0,0,0,0,0,0,99,117,114,114,101,110,116,112,111,105,110,116,32,103,115,97,118,101,32,116,114,97,110,115,108,97,116,101,32,37,100,32,114,111,116,97,116,101,32,48,32,48,32,109,111,118,101,116,111,10,0,0,0,0,0,0,47,88,89,114,101,115,116,111,114,101,32,123,32,91,40,32,41,32,49,32,50,32,116,114,117,101,32,102,97,108,115,101,32,52,32,40,41,93,32,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,114,101,110,97,109,101,32,102,105,108,101,32,37,115,32,116,111,32,37,115,0,0,47,88,89,115,97,118,101,32,32,32,32,123,32,91,40,32,41,32,49,32,50,32,116,114,117,101,32,102,97,108,115,101,32,51,32,40,41,93,32,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,0,0,32,32,101,120,99,104,32,100,117,112,32,77,70,119,105,100,116,104,32,45,50,32,100,105,118,32,51,32,45,49,32,114,111,108,108,32,82,10,32,32,66,108,97,99,107,116,101,120,116,32,123,103,115,97,118,101,32,48,32,115,101,116,103,114,97,121,32,77,70,115,104,111,119,32,103,114,101,115,116,111,114,101,125,32,123,77,70,115,104,111,119,125,32,105,102,101,108,115,101,32,125,32,98,105,110,100,32,100,101,102,10,0,105,115,111,32,99,117,114,118,101,0,0,0,0,0,0,0,118,97,108,117,101,0,0,0,100,117,112,32,109,117,108,0,99,101,110,116,114,101,43,100,32,116,101,120,116,0,0,0,47,77,67,115,104,111,119,32,123,32,99,117,114,114,101,110,116,112,111,105,110,116,32,115,116,114,111,107,101,32,77,10,0,0,0,0,0,0,0,0,110,111,109,120,50,116,36,105,99,115,0,0,0,0,0,0,10,9,32,32,70,105,108,101,32,84,121,112,101,58,32,0,32,32,101,120,99,104,32,100,117,112,32,77,70,119,105,100,116,104,32,110,101,103,32,51,32,45,49,32,114,111,108,108,32,82,10,32,32,66,108,97,99,107,116,101,120,116,32,123,103,115,97,118,101,32,48,32,115,101,116,103,114,97,121,32,77,70,115,104,111,119,32,103,114,101,115,116,111,114,101,125,32,123,77,70,115,104,111,119,125,32,105,102,101,108,115,101,32,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,9,97,108,116,101,114,110,97,116,105,118,101,32,102,111,114,109,97,116,32,102,111,114,32,66,117,116,116,111,110,32,50,32,105,115,32,39,37,115,39,10,0,0,0,0,0,0,0,115,116,121,108,101,32,110,111,116,32,117,115,97,98,108,101,32,102,111,114,32,102,117,110,99,116,105,111,110,32,112,108,111,116,115,44,32,108,101,102,116,32,117,110,99,104,97,110,103,101,100,0,0,0,0,0,37,115,115,101,116,32,99,108,105,112,32,112,111,105,110,116,115,10,37,115,115,101,116,32,99,108,105,112,32,111,110,101,10,37,115,115,101,116,32,99,108,105,112,32,116,119,111,10,115,101,116,32,98,97,114,32,37,102,32,37,115,10,0,0,47,77,82,115,104,111,119,32,123,32,99,117,114,114,101,110,116,112,111,105,110,116,32,115,116,114,111,107,101,32,77,10,0,0,0,0,0,0,0,0,101,120,112,97,110,100,105,110,103,32,99,117,114,118,101,32,112,111,105,110,116,115,0,0,122,111,111,109,32,111,117,116,32,111,110,108,121,32,116,104,101,32,88,32,97,120,105,115,46,0,0,0,0,0,0,0,32,32,48,32,101,120,99,104,32,82,10,32,32,66,108,97,99,107,116,101,120,116,32,123,103,115,97,118,101,32,48,32,115,101,116,103,114,97,121,32,77,70,115,104,111,119,32,103,114,101,115,116,111,114,101,125,32,123,77,70,115,104,111,119,125,32,105,102,101,108,115,101,32,125,32,98,105,110,100,32,100,101,102,10,0,0,0,0,47,77,76,115,104,111,119,32,123,32,99,117,114,114,101,110,116,112,111,105,110,116,32,115,116,114,111,107,101,32,77,10,0,0,0,0,0,0,0,0,39,45,39,116,105,116,39,0,32,32,32,32,32,54,32,103,101,116,32,71,115,119,105,100,116,104,32,112,111,112,32,97,100,100,125,32,123,112,111,112,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,102,111,114,97,108,108,125,32,100,101,102,10,0,0,32,123,100,117,112,32,51,32,103,101,116,123,100,117,112,32,100,117,112,32,48,32,103,101,116,32,102,105,110,100,102,111,110,116,32,101,120,99,104,32,49,32,103,101,116,32,115,99,97,108,101,102,111,110,116,32,115,101,116,102,111,110,116,10,0,0,0,0,0,0,0,0,45,45,118,101,114,115,105,111,110,0,0,0,0,0,0,0,47,77,70,119,105,100,116,104,32,123,48,32,101,120,99,104,32,123,32,100,117,112,32,53,32,103,101,116,32,51,32,103,101,32,123,32,53,32,103,101,116,32,51,32,101,113,32,123,32,48,32,125,32,123,32,112,111,112,32,125,32,105,102,101,108,115,101,32,125,10,0,0,46,111,108,100,0,0,0,0,47,71,115,119,105,100,116,104,32,123,100,117,112,32,116,121,112,101,32,47,115,116,114,105,110,103,116,121,112,101,32,101,113,32,123,115,116,114,105,110,103,119,105,100,116,104,125,32,123,112,111,112,32,40,110,41,32,115,116,114,105,110,103,119,105,100,116,104,125,32,105,102,101,108,115,101,125,32,100,101,102,10,0,0,0,0,0,0,32,32,32,102,111,114,97,108,108,125,32,100,101,102,10,0,101,120,105,115,116,115,0,0,108,101,102,116,32,106,117,115,116,105,102,105,101,100,0,0,32,32,32,32,32,105,102,101,108,115,101,32,125,10,0,0,109,120,50,116,36,105,99,115,0,0,0,0,0,0,0,0,9,68,101,102,97,117,108,116,32,98,105,110,97,114,121,32,100,97,116,97,32,102,105,108,101,32,115,101,116,116,105,110,103,115,32,40,105,110,45,102,105,108,101,32,115,101,116,116,105,110,103,115,32,109,97,121,32,111,118,101,114,114,105,100,101,41,58,10,0,0,0,0,32,32,32,32,32,112,111,112,32,97,108,111,97,100,32,112,111,112,32,77,125,32,105,102,101,108,115,101,32,125,105,102,101,108,115,101,32,125,105,102,101,108,115,101,32,125,10,0,9,102,111,114,109,97,116,32,102,111,114,32,66,117,116,116,111,110,32,50,32,105,115,32,37,100,10,0,0,0,0,0,99,97,110,110,111,116,32,111,112,101,110,32,116,97,98,108,101,32,111,117,116,112,117,116,32,102,105,108,101,0,0,0,35,32,115,101,116,32,116,101,114,109,105,110,97,108,32,117,110,107,110,111,119,110,10,0,32,32,32,32,32,115,104,111,119,32,50,32,105,110,100,101,120,32,123,97,108,111,97,100,32,112,111,112,32,77,32,110,101,103,32,51,32,45,49,32,114,111,108,108,32,110,101,103,32,82,32,112,111,112,32,112,111,112,125,32,123,112,111,112,32,112,111,112,32,112,111,112,10,0,0,0,0,0,0,0,60,115,104,105,102,116,45,99,111,110,116,114,111,108,45,119,104,101,101,108,45,100,111,119,110,62,0,0,0,0,0,0,32,32,32,32,32,100,117,112,32,48,32,82,125,32,123,100,117,112,32,54,32,103,101,116,32,115,116,114,105,110,103,119,105,100,116,104,32,112,111,112,32,45,50,32,100,105,118,32,48,32,82,32,54,32,103,101,116,10,0,0,0,0,0,0,32,32,32,32,32,103,101,116,32,49,32,101,113,32,123,100,117,112,32,50,32,103,101,116,32,101,120,99,104,32,100,117,112,32,51,32,103,101,116,32,101,120,99,104,32,54,32,103,101,116,32,115,116,114,105,110,103,119,105,100,116,104,32,112,111,112,32,45,50,32,100,105,118,10,0,0,0,0,0,0,32,32,32,32,32,123,100,117,112,32,51,32,103,101,116,32,123,50,32,103,101,116,32,110,101,103,32,48,32,101,120,99,104,32,82,32,112,111,112,125,32,123,112,111,112,32,97,108,111,97,100,32,112,111,112,32,77,125,32,105,102,101,108,115,101,125,32,123,100,117,112,32,53,10,0,0,0,0,0,0,99,111,110,115,116,97,110,116,32,101,120,112,114,101,115,115,105,111,110,32,114,101,113,117,105,114,101,100,0,0,0,0,32,32,32,32,32,103,101,116,32,101,120,99,104,32,52,32,103,101,116,32,123,71,115,104,111,119,125,32,123,115,116,114,105,110,103,119,105,100,116,104,32,112,111,112,32,48,32,82,125,32,105,102,101,108,115,101,32,125,105,102,32,100,117,112,32,53,32,103,101,116,32,48,32,101,113,10,0,0,0,0,32,32,32,32,32,91,32,99,117,114,114,101,110,116,112,111,105,110,116,32,93,32,101,120,99,104,32,100,117,112,32,50,32,103,101,116,32,48,32,101,120,99,104,32,82,32,100,117,112,32,53,32,103,101,116,32,50,32,110,101,32,123,100,117,112,32,100,117,112,32,54,10,0,0,0,0,0,0,0,0,70,73,84,95,76,73,77,73,84,0,0,0,0,0,0,0,32,32,32,32,32,123,100,117,112,32,100,117,112,32,48,32,103,101,116,32,102,105,110,100,102,111,110,116,32,101,120,99,104,32,49,32,103,101,116,32,115,99,97,108,101,102,111,110,116,32,115,101,116,102,111,110,116,10,0,0,0,0,0,0,118,101,99,0,0,0,0,0,32,32,32,32,32,123,32,53,32,103,101,116,32,51,32,101,113,32,123,103,115,97,118,101,125,32,123,103,114,101,115,116])
.concat([111,114,101,125,32,105,102,101,108,115,101,32,125,10,0,0,101,120,105,115,116,0,0,0,115,101,116,32,116,101,114,109,111,112,116,32,110,111,101,110,104,0,0,0,0,0,0,0,32,32,32,123,32,100,117,112,32,53,32,103,101,116,32,51,32,103,101,10,0,0,0,0,110,111,109,120,116,36,105,99,115,0,0,0,0,0,0,0,100,97,116,97,102,105,108,101,32,99,111,108,117,109,110,115,32,98,105,110,97,114,121,32,105,110,102,111,114,109,97,116,105,111,110,0,0,0,0,0,47,77,70,115,104,111,119,32,123,10,0,0,0,0,0,0,9,97,108,116,101,114,110,97,116,105,118,101,32,102,111,114,109,97,116,32,102,111,114,32,66,117,116,116,111,110,32,49,32,105,115,32,39,37,115,39,10,0,0,0,0,0,0,0,35,32,115,101,116,32,116,101,114,109,105,110,97,108,32,37,115,32,37,115,10,0,0,0,125,32,105,102,10,0,0,0,122,111,111,109,32,105,110,32,111,110,108,121,32,116,104,101,32,88,32,97,120,105,115,46,0,0,0,0,0,0,0,0,103,115,97,118,101,32,66,97,99,107,103,114,111,117,110,100,67,111,108,111,114,32,67,32,99,108,105,112,112,97,116,104,32,102,105,108,108,32,103,114,101,115,116,111,114,101,0,0,66,97,99,107,103,114,111,117,110,100,67,111,108,111,114,32,67,32,49,46,48,48,48,32,48,32,48,32,37,46,50,102,32,37,46,50,102,32,66,111,120,67,111,108,70,105,108,108,0,0,0,0,0,0,0,0,99,97,110,110,111,116,32,119,114,105,116,101,32,116,101,109,112,111,114,97,114,121,32,102,105,108,101,0,0,0,0,0,66,97,99,107,103,114,111,117,110,100,67,111,108,111,114,32,48,32,108,116,32,51,32,49,32,114,111,108,108,32,48,32,108,116,32,101,120,99,104,32,48,32,108,116,32,111,114,32,111,114,32,110,111,116,32,123,0,0,0,0,0,0,0,0,40,37,115,41,32,102,105,110,100,102,111,110,116,32,37,100,32,115,99,97,108,101,102,111,110,116,32,115,101,116,102,111,110,116,10,0,0,0,0,0,71,78,85,80,76,79,84,95,70,79,78,84,80,65,84,72,0,0,0,0,0,0,0,0,48,32,115,101,116,103,114,97,121,10,110,101,119,112,97,116,104,10,0,0,0,0,0,0,70,73,84,95,77,65,88,73,84,69,82,0,0,0,0,0,70,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,32,109,105,115,109,97,116,99,104,58,32,37,37,83,32,105,115,32,111,110,108,121,32,118,97,108,105,100,32,119,105,116,104,32,37,37,115,0,0,0,57,48,32,114,111,116,97,116,101,10,48,32,37,100,32,116,114,97,110,115,108,97,116,101,10,0,0,0,0,0,0,0,71,78,85,84,69,82,77,0,97,109,0,0,0,0,0,0,103,110,117,100,105,99,116,32,98,101,103,105,110,10,103,115,97,118,101,10,100,111,99,108,105,112,10,37,100,32,37,100,32,116,114,97,110,115,108,97,116,101,10,37,46,51,102,32,37,46,51,102,32,115,99,97,108,101,10,0,0,0,0,0,115,121,115,116,101,109,0,0,69,110,104,97,110,99,101,100,32,116,101,120,116,58,32,32,32,123,120,64,95,123,48,125,94,123,110,43,49,125,125,0,87,114,105,116,105,110,103,32,111,117,116,32,80,111,115,116,83,99,114,105,112,116,32,109,97,99,114,111,115,32,102,111,114,32,101,110,104,97,110,99,101,100,32,116,101,120,116,32,109,111,100,101,10,0,0,0,109,120,116,36,105,99,115,0,99,111,108,32,62,32,48,0,37,37,37,37,80,97,103,101,58,32,37,100,32,37,100,10,0,0,0,0,0,0,0,0,9,102,111,114,109,97,116,32,102,111,114,32,66,117,116,116,111,110,32,49,32,105,115,32,37,100,10,0,0,0,0,0,79,112,116,105,111,110,115,32,97,114,101,32,39,37,115,39,10,0,0,0,0,0,0,0,37,115,37,103,44,32,37,115,37,103,44,32,37,115,37,103,0,0,0,0,0,0,0,0,37,100,32,37,100,32,78,10,0,0,0,0,0,0,0,0,60,115,104,105,102,116,45,99,111,110,116,114,111,108,45,119,104,101,101,108,45,117,112,62,0,0,0,0,0,0,0,0,37,100,32,37,100,32,82,10,0,0,0,0,0,0,0,0,37,100,32,37,100,32,77,10,0,0,0,0,0,0,0,0,99,111,109,98,105,110,97,116,105,111,110,32,114,103,98,32,111,114,32,103,98,114,32,111,114,32,98,114,103,32,101,116,99,46,32,101,120,112,101,99,116,101,100,0,0,0,0,0,115,116,114,111,107,101,32,37,100,32,37,100,32,77,10,0,99,112,49,50,53,52,0,0,105,110,116,101,114,112,111,108,97,116,105,111,110,32,116,97,98,108,101,0,0,0,0,0,32,100,101,108,116,97,95,120,32,100,101,108,116,97,95,121,0,0,0,0,0,0,0,0,37,100,32,37,100,32,86,10,0,0,0,0,0,0,0,0,98,110,111,116,0,0,0,0,37,100,32,37,100,32,76,10,0,0,0,0,0,0,0,0,70,73,84,95,83,84,65,82,84,95,76,65,77,66,68,65,0,0,0,0,0,0,0,0,76,84,37,99,10,0,0,0,41,32,82,115,104,111,119,10,0,0,0,0,0,0,0,0,116,101,115,116,32,111,102,32,99,104,97,114,97,99,116,101,114,32,119,105,100,116,104,58,0,0,0,0,0,0,0,0,41,32,67,115,104,111,119,10,0,0,0,0,0,0,0,0,109,117,108,116,105,36,112,108,111,116,0,0,0,0,0,0,69,114,114,111,114,32,97,115,115,105,103,110,105,110,103,32,109,101,109,111,114,121,32,102,111,114,32,98,105,110,97,114,121,32,102,105,108,101,32,100,97,116,97,32,114,101,99,111,114,100,115,0,0,0,0,0,63,0,0,0,0,0,0,0,41,32,76,115,104,111,119,10,0,0,0,0,0,0,0,0,9,102,111,114,109,97,116,116,105,110,103,32,110,117,109,98,101,114,115,32,119,105,116,104,32,34,37,115,34,10,0,0,112,111,112,0,0,0,0,0,98,97,100,32,100,97,116,97,32,111,110,32,108,105,110,101,32,37,100,32,111,102,32,102,105,108,101,32,37,115,0,0,32,111,102,102,115,101,116,32,0,0,0,0,0,0,0,0,93,32,71,82,115,104,111,119,10,0,0,0,0,0,0,0,32,122,111,111,109,32,111,117,116,46,0,0,0,0,0,0,93,32,71,67,115,104,111,119,10,0,0,0,0,0,0,0,73,108,108,101,103,97,108,32,115,101,101,100,32,118,97,108,117,101,0,0,0,0,0,0,93,32,71,76,115,104,111,119,10,0,0,0,0,0,0,0,99,117,114,114,101,110,116,112,111,105,110,116,32,103,115,97,118,101,32,116,114,97,110,115,108,97,116,101,32,37,100,32,114,111,116,97,116,101,32,48,32,48,32,77,10,0,0,0,37,100,32,37,100,32,37,115,10,0,0,0,0,0,0,0,80,101,110,116,87,0,0,0,70,73,84,95,76,65,77,66,68,65,95,70,65,67,84,79,82,0,0,0,0,0,0,0,99,111,109,112,105,108,101,95,111,112,116,105,111,110,115,0,68,105,97,87,0,0,0,0,101,120,116,101,110,100,32,105,110,112,117,116,32,108,105,110,101,0,0,0,0,0,0,0,84,114,105,68,87,0,0,0,115,116,114,112,116,105,109,101,0,0,0,0,0,0,0,0,49,50,51,52,53,54,55,56,57,48,49,50,51,52,53,54,55,56,57,48,0,0,0,0,84,114,105,85,87,0,0,0,109,111,36,117,115,101,0,0,98,105,110,97,114,121,32,102,105,108,101,32,100,97,116,97,32,114,101,99,111,114,100,115,0,0,0,0,0,0,0,0,67,105,114,99,87,0,0,0,9,100,111,117,98,108,101,32,99,108,105,99,107,32,114,101,115,111,108,117,116,105,111,110,32,105,115,32,111,102,102,10,0,0,0,0,0,0,0,0,110,111,102,112,101,95,116,114,97,112,0,0,0,0,0,0,106,112,103,0,0,0,0,0,112,117,115,104,0,0,0,0,99,104,97,114,97,99,116,101,114,32,0,0,0,0,0,0,66,111,120,87,0,0,0,0,60,99,111,110,116,114,111,108,45,119,104,101,101,108,45,100,111,119,110,62,0,0,0,0,80,101,110,116,69,0,0,0,99,111,110,116,111,117,114,32,99,110,116,114,95,115,116,114,117,99,116,0,0,0,0,0,68,105,97,69,0,0,0,0,99,111,110,118,101,114,116,32,98,97,99,107,32,34,37,115,34,32,45,32,37,100,47,37,100,47,37,100,58,58,37,100,58,37,100,58,37,100,32,44,32,119,100,97,121,61,37,100,44,32,121,100,97,121,61,37,100,10,0,0,0,0,0,0,32,93,32,37,115,114,101,118,101,114,115,101,32,37,115,119,114,105,116,101,98,97,99,107,0,0,0,0,0,0,0,0,84,114,105,68,69,0,0,0,34,116,105,116,108,101,34,32,97,108,108,111,119,101,100,32,111,110,108,121,32,97,102,116,101,114,32,112,97,114,97,109,101,116,114,105,99,32,102,117,110,99,116,105,111,110,32,102,117,108,108,121,32,115,112,101,99,105,102,105,101,100,0,0,84,114,105,85,69,0,0,0,105,115,111,32,99,117,114,118,101,32,112,111,105,110,116,115,0,0,0,0,0,0,0,0,67,105,114,99,69,0,0,0,70,73,84,95,83,67,82,73,80,84,0,0,0,0,0,0,66,111,120,69,0,0,0,0,102,111,114,0,0,0,0,0,109,97,116,114,105,120,32,114,111,119,32,112,111,105,110,116,101,114,115,0,0,0,0,0,68,49,53,0,0,0,0,0,115,116,114,102,116,105,109,101,0,0,0,0,0,0,0,0,98,101,122,105,101,114,32,99,111,101,102,102,105,99,105,101,110,116,115,0,0,0,0,0,77,111,117,115,101,32,97,110,100,32,104,111,116,107,101,121,115,32,97,114,101,32,115,117,112,112,111,114,116,101,100,44,32,104,105,116,58,32,104,32,114,32,109,32,54,0,0,0,68,49,52,0,0,0,0,0,98,109,97,114,36,103,105,110,0,0,0,0,0,0,0,0,69,113,117,97,108,32,40,39,61,39,41,32,115,121,109,98,111,108,32,114,101,113,117,105,114,101,100,0,0,0,0,0,97,108,116,45,0,0,0,0,68,49,51,0,0,0,0,0,9,100,111,117,98,108,101,32,99,108,105,99,107,32,114,101,115,111,108,117,116,105,111,110,32,105,115,32,37,100,32,109,115,10,0,0,0,0,0,0,89,111,117,32,99,97,110,39,116,32,99,104,97,110,103,101,32,116,104,101,32,116,101,114,109,105,110,97,108,32,105,110,32,109,117,108,116,105,112,108,111,116,32,109,111,100,101,0,123,32,121,48,32,103,32,0,115,99,114,101,101,110,32,0,68,49,50,0,0,0,0,0,108,111,97,100,0,0,0,0,67,97,110,39,116,32,99,97,108,99,117,108,97,116,101,32,97,112,112,114,111,120,105,109,97,116,105,111,110,32,115,112,108,105,110,101,115,0,0,0,68,49,49,0,0,0,0,0,122,111,111,109,32,105,110,32,116,111,119,97,114,100,32,116,104,101,32,99,101,110,116,101,114,32,111,102,32,116,104,101,32,112,108,111,116,46,0,0,112,109,51,100,32,112,97,108,101,116,116,101,32,99,111,108,111,114,0,0,0,0,0,0,102,97,99,116,111,114,105,97,108,32,40,33,41,32,97,114,103,117,109,101,110,116,32,109,117,115,116,32,98,101,32,97,110,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,68,49,48,0,0,0,0,0,105,110,116,101,114,110,97,108,32,61,32,37,102,32,45,32,37,100,47,37,100,47,37,100,58,58,37,100,58,37,100,58,37,100,32,44,32,119,100,97,121,61,37,100,44,32,121,100,97,121,61,37,100,10,0,0,68,57,0,0,0,0,0,0,68,56,0,0,0,0,0,0,68,55,0,0,0,0,0,0,68,54,0,0,0,0,0,0,68,53,0,0,0,0,0,0,32,32,116,101,114,109,105,110,97,108,32,116,101,115,116,0,68,52,0,0,0,0,0,0,116,109,97,114,36,103,105,110,0,0,0,0,0,0,0,0,111,112,116,105,111,110,32,101,120,112,101,99,116,101,100,0,68,51,0,0,0,0,0,0,9,110,111,32,112,111,108,97,114,32,100,105,115,116,97,110,99,101,32,116,111,32,114,117,108,101,114,32,119,105,108,108,32,98,101,32,115,104,111,119,110,10,0,0,0,0,0,0,84,104,105,115,32,111,112,116,105,111,110,32,99,97,110,110,111,116,32,98,101,32,99,104,97,110,103,101,100,32,117,115,105,110,103,32,39,115,101,116,32,116,101,114,109,111,112,116,105,111,110,39,0,0,0,0,115,101,99,111,110,100,32,0,68,50,0,0,0,0,0,0,60,99,111,110,116,114,111,108,45,119,104,101,101,108,45,117,112,62,0,0,0,0,0,0,68,49,0,0,0,0,0,0,68,48,0,0,0,0,0,0,115,109,111,111,116,104,32,112,97,108,101,116,116,101,32,105,110,32,37,115,58,32,117,115,105,110,103,32,37,105,32,111,102,32,37,105,32,97,118,97,105,108,97,98,108,101,32,99,111,108,111,114,32,112,111,115,105,116,105,111,110,115,10,0,37,115,32,114,97,110,103,101,32,109,117,115,116,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,48,32,102,111,114,32,108,111,103,32,115,99,97,108,101,0,0,0,83,49,53,0,0,0,0,0,83,49,52,0,0,0,0,0,86,97,108,117,101,32,115,116,111,114,101,100,32,102,111,114,32,117,110,100,101,102,105,110,101,100,32,100,97,116,97,112,111,105,110,116,32,104,97,110,100,108,105,110,103,32,105,115,32,105,108,108,101,103,97,108,33,33,33,10,0,0,0,0,83,49,51,0,0,0,0,0,83,49,50,0,0,0,0,0,83,49,49,0,0,0,0,0,119,111,114,100,0,0,0,0,116,101,114,109,105,110,97,108,32,116,121,112,101,32,105,115,32,117,110,107,110,111,119,110,0,0,0,0,0,0,0,0,83,49,48,0,0,0,0,0,114,109,97,114,36,103,105,110,0,0,0,0,0,0,0,0,83,57,0,0,0,0,0,0,9,100,105,115,116,97,110,99,101,32,116,111,32,114,117,108,101,114,32,119,105,108,108,32,98,101,32,115,104,111,119,32,105,110,32,112,111,108,97,114,32,99,111,111,114,100,105,110,97,116,101,115,10,0,0,0,100,101,108,97,121,0,0,0,102,105,114,115,116,32,0,0,83,56,0,0,0,0,0,0,115,99,114,111,108,108,32,114,105,103,104,116,46,0,0,0,83,55,0,0,0,0,0,0,83,54,0,0,0,0,0,0,101,120,116,101,110,100,32,105,110,32,100,111,95,115,121,115,116,101,109,95,102,117,110,99,0,0,0,0,0,0,0,0,83,53,0,0,0,0,0,0,112,111,108,121,103,111,110,0,83,52,0,0,0,0,0,0,83,51,0,0,0,0,0,0,83,50,0,0,0,0,0,0,67,97,110,110,111,116,32,109,105,120,32,115,99,114,101,101,110,32,111,114,32,99,104,97,114,97,99,116,101,114,32,99,111,111,114,100,115,32,119,105,116,104,32,112,108,111,116,32,99,111,111,114,100,115,0,0,83,49,0,0,0,0,0,0,115,117,98,115,116,114,0,0,115,101,116,32,116,101,114,109,111,112,116,32,101,110,104,0,83,48,0,0,0,0,0,0,67,49,53,0,0,0,0,0,108,109,97,114,36,103,105,110,0,0,0,0,0,0,0,0,68,105,109,95,50,0,0,0,9,110,111,32,122,111,111,109,32,99,111,111,114,100,105,110,97,116,101,115,32,119,105,108,108,32,98,101,32,100,114,97,119,110,10,0,0,0,0,0,103,105,102,0,0,0,0,0,111,98,106,101,99,116,32,110,111,116,32,102,111,117,110,100,0,0,0,0,0,0,0,0,67,49,52,0,0,0,0,0,60,115,104,105,102,116,45,119,104,101,101,108,45,100,111,119,110,62,0,0,0,0,0,0,67,49,51,0,0,0,0,0,67,49,50,0,0,0,0,0,42,118,101,114,121,42,32,108,111,110,103,32,115,121,115,116,101,109,32,99,97,108,108,32,111,117,116,112,117,116,32,104,97,115,32,98,101,101,110,32,116,114,117,110,99,97,116,101,100,0,0,0,0,0,0,0,67,49,49,0,0,0,0,0,67,49,48,0,0,0,0,0,67,57,0,0,0,0,0,0,9,37,115,32,114,97,110,103,101,32,114,101,115,116,114,105,99,116,101,100,32,116,111,32,91,0,0,0,0,0,0,0,67,56,0,0,0,0,0,0,67,55,0,0,0,0,0,0,115,116,114,115,116,114,116,0,85,110,107,110,111,119,110,32,111,114,32,97,109,98,105,103,117,111,117,115,32,116,101,114,109,105,110,97,108,32,110,97,109,101,32,39,37,115,39,10,0,0,0,0,0,0,0,0,67,54,0,0,0,0,0,0,109,97,114,36,103,105,110,0,67,53,0,0,0,0,0,0,9,122,111,111,109,32,99,111,111,114,100,105,110,97,116,101,115,32,119,105,108,108,32,98,101,32,100,114,97,119,110,10,0,0,0,0,0,0,0,0,67,52,0,0,0,0,0,0,32,102,105,108,108,115,116,121,108,101,32,0,0,0,0,0,115,99,114,111,108,108,32,108,101,102,116,32,40,105,110,32,45,88,32,100,105,114,101,99,116,105,111,110,41,46,0,0,67,51,0,0,0,0,0,0,67,50,0,0,0,0,0,0,100,111,95,115,121,115,116,101,109,95,102,117,110,99,0,0,67,49,0,0,0,0,0,0,67,48,0,0,0,0,0,0,80,101,110,116,70,0,0,0,35,32,70,73,88,69,68,0,80,101,110,116,0,0,0,0,68,105,97,70,0,0,0,0,115,116,114,108,101,110,0,0,68,105,97,0,0,0,0,0,109,97,112,36,112,105,110,103,51,100,0,0,0,0,0,0,84,114,105,68,70,0,0,0,9,109,111,117,115,101,32,105,115,32,111,110,10,0,0,0,84,114,105,68,0,0,0,0,60,115,104,105,102,116,45,119,104,101,101,108,45,117,112,62,0,0,0,0,0,0,0,0,116,111,111,32,109,97,110,121,32,97,114,103,117,109,101,110,116,115,32,102,111,114,32,39,99,97,108,108,32,60,102,105,108,101,62,39,0,0,0,0,84,114,105,85,70,0,0,0,84,114,105,85,0,0,0,0,112,111,112,101,110,32,102,97,105,108,101,100,0,0,0,0,67,105,114,99,108,101,70,0,67,105,114,99,108,101,0,0,66,111,120,70,0,0,0,0,85,110,100,101,102,105,110,101,100,32,118,97,108,117,101,32,100,117,114,105,110,103,32,102,117,110,99,116,105,111,110,32,101,118,97,108,117,97,116,105,111,110,0,0,0,0,0,0,66,111,120,0,0,0,0,0,83,116,97,114,0,0,0,0,103,112,114,105,110,116,102,0,84,101,114,109,105,110,97,108,32,116,121,112,101,32,115,101,116,32,116,111,32,39,37,115,39,10,0,0,0,0,0,0,67,114,115,0,0,0,0,0,109,97,112,36,112,105,110,103,0,0,0,0,0,0,0,0,112,108,111,116,32,116,105,116,108,101,0,0,0,0,0,0,80,108,115,0,0,0,0,0,9,108,97,115,116,32,112,108,111,116,32,99,111,109,109,97,110,100,32,119,97,115,58,32,37,115,10,0,0,0,0,0,80,110,116,0,0,0,0,0,115,99,114,111,108,108,32,100,111,119,110,46,0,0,0,0,46,46,0,0,0,0,0,0,103,115,97,118,101,32,91,93,32,48,32,115,101,116,100,97,115,104,10,0,0,0,0,0,47,118,115,104,105,102,116,32,37,100,32,100,101,102,10,0,37,115,32,105,115,32,110,111,116,32,97,32,115,116,114,105,110,103,32,118,97,114,105,97,98,108,101,0,0,0,0,0,47,37,115,32,102,105,110,100,102,111,110,116,32,37,103,32,115,99,97,108,101,102,111,110,116,32,115,101,116,102,111,110,116,10,0,0,0,0,0,0,37,102,0,0,0,0,0,0,102,111,110,116,112,97,116,104,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,37,46,51,102,32,85,80,10,0,0,0,0,0,0,0,0,37,45,49,53,46,49,53,115,32,61,32,37,103,10,0,0,70,111,114,109,97,116,32,99,104,97,114,97,99,116,101,114,32,109,105,115,109,97,116,99,104,58,32,37,37,84,32,105,115,32,111,110,108,121,32,118,97,108,105,100,32,119,105,116,104,32,37,37,116,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,48,32,80,97,116,116,101,114,110,70,105,108,108,10,0,0,0,0,0,0,0,0,68,101,112,114,101,99,97,116,101,100,32,115,121,110,116,97,120,32,45,32,112,108,101,97,115,101,32,117,115,101,32,39,115,101,116,32,116,105,99,115,32,115,99,97,108,101,32,100,101,102,97,117,108,116,39,0,37,89,45,37,109,45,37,100,0,0,0,0,0,0,0,0,49,32,37,100,32,37,100,32,37,100,32,37,100,32,66,111,120,67,111,108,70,105,108,108,10,0,0,0,0,0,0,0,87,97,114,110,105,110,103,58,32,115,99,97,108,101,32,105,110,116,101,114,102,97,99,101,32,105,115,32,110,111,116,32,110,117,108,108,95,115,99,97,108,101,32,45,32,109,97,121,32,110,111,116,32,119,111,114,107,32,119,105,116,104,32,109,117,108,116,105,112,108,111,116,10,0,0,0,0,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,50,32,80,97,116,116,101,114,110,70,105,108,108,10,0,0,0,0,0,0,0,0,109,97,99,36,114,111,115,0,116,105,109,101,99,111,108,117,109,110,40,41,32,99,97,108,108,101,100,32,102,114,111,109,32,105,110,118,97,108,105,100,32,99,111,110,116,101,120,116,0,0,0,0,0,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,37,100,32,49,32,80,97,116,116,101,114,110,70,105,108,108,10,0,0,0,0,0,0,0,0,61,32,0,0,0,0,0,0,102,99,32,0,0,0,0,0,37,100,32,37,100,32,37,100,32,37,100,32,66,111,120,70,105,108,108,10,0,0,0,0,60,119,104,101,101,108,45,100,111,119,110,62,0,0,0,0,10,32,47,84,114,97,110,115,112,97,114,101,110,116,80,97,116,116,101,114,110,115,32,116,114,117,101,32,100,101,102,10,0,0,0,0,0,0,0,0,37,46,51,102,32,37,100,32,37,100,32,37,100,32,37,100,32,66,111,120,67,111,108,70,105,108,108,10,0,0,0,0,115,116,114,105,110,103,32,118,97,114,105,97,98,108,101,0,99,112,49,50,53,49,0,0,37,100,32,37,100,32,37,100,32,37,100,32,82,101,99,32,102,105,108,108,10,0,0,0,32,108,97,98,101,108,0,0,37,46,51,102,32,85,76,10,0,0,0,0,0,0,0,0,108,110,111,116,0,0,0,0,32,32,105,102,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,100,101,102,10,0,0,0,0,0,0,105,110,105,116,105,97,108,32,115,101,116,32,111,102,32,102,114,101,101,0,0,0,0,0,32,32,88,89,90,50,82,71,66,125,123,67,111,108,111,114,83,112,97,99,101,32,40,67,77,89,41,32,101,113,32,123,67,77,89,50,82,71,66,125,123,67,111,108,111,114,83,112,97,99,101,32,40,89,73,81,41,32,101,113,32,123,89,73,81,50,82,71,66,125,10,0,47,83,101,108,101,99,116,83,112,97,99,101,32,123,67,111,108,111,114,83,112,97,99,101,32,40,72,83,86,41,32,101,113,32,123,72,83,86,50,82,71,66,125,123,67,111,108,111,114,83,112,97,99,101,32,40,88,89,90,41,32,101,113,32,123,10,0,0,0,0,0,0,116,109,95,121,100,97,121,0,120,49,49,0,0,0,0,0,32,32,101,120,99,104,32,49,46,57,49,32,109,117,108,32,101,120,99,104,32,97,100,100,32,67,111,110,115,116,114,97,105,110,32,51,32,49,32,114,111,108,108,125,32,100,101,102,10,0,0,0,0,0,0,0,108,111,103,36,115,99,97,108,101,0,0,0,0,0,0,0,64,67,79,76,85,77,78,72,69,65,68,64,0,0,0,0,104,36,101,108,112,0,0,0,32,32,45,48,46,57,56,52,52,32,109,117,108,32,97,100,100,32,67,111,110,115,116,114,97,105,110,32,53,32,49,32,114,111,108,108,32,45,48,46,50,56,57,49,32,109,117,108,32,101,120,99,104,32,45,48,46,53,51,51,56,32,109,117,108,32,97,100,100,10,0,0,9,37,45,42,115,32,0,0,83,116,97,116,115,32,99,111,109,109,97,110,100,32,110,111,116,32,97,118,97,105,108,97,98,108,101,32,105,110,32,112,97,114,97,109,101,116,114,105,99,32,109,111,100,101,0,0,108,119,32,37,46,49,102,32,0,0,0,0,0,0,0,0,32,32,67,111,110,115,116,114,97,105,110,32,52,32,49,32,114,111,108,108,32,51,32,99,111,112,121,32,45,48,46,48,50,55,57,32,109,117,108,32,101,120,99,104,32,49,46,57,57,57,32,109,117,108,32,97,100,100,32,101,120,99,104,10,0,0,0,0,0,0,0,0,115,99,114,111,108,108,32,117,112,32,40,105,110,32,43,89,32,100,105,114,101,99,116,105,111,110,41,46,0,0,0,0,102,111,110,116,112,97,116,104,95,102,117,108,108,110,97,109,101,0,0,0,0,0,0,0,32,32,51,32,99,111,112,121,32,45,48,46,57,48,49,55,32,109,117,108,32,101,120,99,104,32,45,48,46,49,49,56,55,32,109,117,108,32,97,100,100,32,101,120,99,104,32,48,46,48,53,56,53,32,109,117,108,32,101,120,99,104,32,97,100,100,10,0,0,0,0,0,37,115,32,101,114,114,111,114,10,0,0,0,0,0,0,0,47,88,89,90,50,82,71,66,32,123,0,0,0,0,0,0,115,121,115,116,101,109,40,41,32,102,97,105,108,101,100,0,32,32,49,32,101,120,99,104,32,115,117,98,32,101,120,99,104,32,49,32,101,120,99,104,32,115,117,98,32,51,32,50,32,114,111,108,108,32,49,32,101,120,99,104,32,115,117,98,32,51,32,49,32,114,111,108,108,32,101,120,99,104,32,125,32,100,101,102,10,0,0,0,47,67,77,89,50,82,71,66,32,123,0,0,0,0,0,0,32,32,48,46,54,50,49,32,109,117,108,32,101,120,99,104,32,45,48,46,57,53,54,32,109,117,108,32,97,100,100,32,97,100,100,32,67,111,110,115,116,114,97,105,110,32,51,32,49,32,114,111,108,108,32,125,32,100,101,102,10,0,0,0,114,101,115,117,108,116,97,110,116,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,114,32,100,101,112,114,101,99,97,116,101,100,32,115,121,110,116,97,120,0,0,0,0,32,32,51,32,99,111,112,121,32,45,48,46,54,52,55,32,109,117,108,32,101,120,99,104,32,45,48,46,50,55,50,32,109,117,108,32,97,100,100,32,97,100,100,32,67,111,110,115,116,114,97,105,110,32,53,32,49,32,114,111,108,108,10,0,32,32,51,32,99,111,112,121,32,45,49,46,55,48,50,32,109,117,108,32,101,120,99,104,32,45,49,46,49,48,53,32,109,117,108,32,97,100,100,32,97,100,100,32,67,111,110,115,116,114,97,105,110,32,52,32,49,32,114,111,108,108,10,0,116,109,95,119,100,97,121,0,88,49,49,0,0,0,0,0,47,89,73,81,50,82,71,66,32,123,10,0,0,0,0,0,108,111,99,36,97,108,101,0,97,110,97,108,121,122,101,95,115,103,108,95,99,111,108,117,109,110,0,0,0,0,0,0,99,111,108,117,109,110,104,101,97,100,40,41,32,99,97,108,108,101,100,32,102,114,111,109,32,105,110,118,97,108,105,100,32,99,111,110,116,101,120,116,0,0,0,0,0,0,0,0,32,32,100,117,112,32,48,32,108,116,32,123,48,32,101,120,99,104,32,112,111,112,125,123,100,117,112,32,49,32,103,116,32,123,49,32,101,120,99,104,32,112,111,112,125,32,105,102,125,32,105,102,101,108,115,101,125,32,100,101,102,10,0,0,102,112,101,95,116,114,97,112,0,0,0,0,0,0,0,0,102,110,97,109,101,0,0,0,106,112,101,103,0,0,0,0,47,67,111,110,115,116,114,97,105,110,32,123,10,0,0,0,60,119,104,101,101,108,45,117,112,62,0,0,0,0,0,0,114,101,99,117,114,115,105,118,101,102,117,108,108,110,97,109,101,0,0,0,0,0,0,0,32,32,125,32,105,102,101,108,115,101,125,32,100,101,102,10,0,0,0,0,0,0,0,0,116,114,97,99,101,95,99,111,110,116,111,117,114,58,32,117,110,101,120,112,101,99,116,101,100,32,101,110,100,32,111,102,32,99,111,110,116,111,117,114,10,0,0,0,0,0,0,0,9,32,123,72,83,86,118,32,72,83,86,112,32,72,83,86,113,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,125,32,105,102,101,108,115,101,10,0,0,0,0,0,0,73,109,112,111,115,115,105,98,108,101,32,99,97,115,101,32,105,110,32,115,119,105,116,99,104,0,0,0,0,0,0,0,32,58,32,0,0,0,0,0,9,32,123,51,32,72,83,86,105,32,101,113,32,123,72,83,86,112,32,72,83,86,113,32,72,83,86,118,125,123,52,32,72,83,86,105,32,101,113,32,123,72,83,86,116,32,72,83,86,112,32,72,83,86,118,125,10,0,0,0,0,0,0,0,112,109,51,100,32,115,99,97,110,32,97,114,114,97,121,0,116,36,105,116,108,101,0,0,9,32,123,49,32,72,83,86,105,32,101,113,32,123,72,83,86,113,32,72,83,86,118,32,72,83,86,112,125,123,50,32,72,83,86,105,32,101,113,32,123,72,83,86,112,32,72,83,86,118,32,72,83,86,116,125,10,0,0,0,0,0,0,0,108,97,98,101,108,112,111,105,110,116,32,116,101,120,116,0,9,32,47,72,83,86,105,32,72,83,86,105,32,54,32,109,111,100,32,100,101,102,32,48,32,72,83,86,105,32,101,113,32,123,72,83,86,118,32,72,83,86,116,32,72,83,86,112,125,10,0,0,0,0,0,0,67,111,117,108,100,32,110,111,116,32,108,105,110,101,98,117,102,102,101,114,32,115,116,100,111,117,116,10,0,0,0,0,10,10,32,73,116,101,114,97,116,105,111,110,32,37,100,10,32,87,83,83,82,32,32,32,32,32,32,32,32,58,32,37,45,49,53,103,32,32,32,100,101,108,116,97,40,87,83,83,82,41,47,87,83,83,82,32,32,32,58,32,37,103,10,32,100,101,108,116,97,40,87,83,83,82,41,32,58,32,37,45,49,53,103,32,32,32,108,105,109,105,116,32,102,111,114,32,115,116,111,112,112,105,110,103,32,58,32,37,103,10,32,108,97,109,98,100,97,9,32,32,58,32,37,103,10,10,37,115,32,112,97,114,97,109,101,116,101,114,32,118,97,108,117,101,115,10,10,0,0,0,0,0,9,32,47,72,83,86,116,32,72,83,86,118,32,49,46,48,32,72,83,86,115,32,49,46,48,32,72,83,86,102,32,115,117,98,32,109,117,108,32,115,117,98,32,109,117,108,32,100,101,102,10,0,0,0,0,0,69,120,112,101,99,116,105,110,103,32,105,116,101,114,97,116,111,114,32,9,102,111,114,32,91,60,118,97,114,62,32,61,32,60,115,116,97,114,116,62,32,58,32,60,101,110,100,62,93,10,9,9,9,111,114,9,102,111,114,32,91,60,118,97,114,62,32,105,110,32,34,115,116,114,105,110,103,32,111,102,32,119,111,114,100,115,34,93,0,0,0,0,0,0,0,0,9,32,47,72,83,86,113,32,72,83,86,118,32,49,46,48,32,72,83,86,115,32,72,83,86,102,32,109,117,108,32,115,117,98,32,109,117,108,32,100,101,102,32,10,0,0,0,0,116,109,95,121,101,97,114,0,117,110,107,110,111,119,110,32,111,114,32,97,109,98,105,103,117,111,117,115,32,116,101,114,109,105,110,97,108,32,116,121,112,101,59,32,116,121,112,101,32,106,117,115,116,32,39,115,101,116,32,116,101,114,109,105,110,97,108,39,32,102,111,114,32,97,32,108,105,115,116,0,32,32,32,32,47,72,83,86,102,32,101,120,99,104,32,100,101,102,32,47,72,83,86,105,32,101,120,99,104,32,99,118,105,32,100,101,102,32,47,72,83,86,112,32,72,83,86,118,32,49,46,48,32,72,83,86,115,32,115,117,98,32,109,117,108,32,100,101,102,10,0,0,83,121,110,116,97,120,32,101,114,114,111,114,58,32,109,105,115,115,105,110,103,32,98,108,111,99,107,32,116,101,114,109,105,110,97,116,111,114,32,125,0,0,0,0,0,0,0,0,108,111,97,36,100,112,97,116,104,0,0,0,0,0,0,0,98,108,97,110,107,0,0,0,116,117,114,110,105,110,103,32,114,117,108,101,114,32,111,110,46,10,0,0,0,0,0,0,32,32,123,32,47,72,83,86,115,32,101,120,99,104,32,100,101,102,32,47,72,83,86,118,32,101,120,99,104,32,100,101,102,32,54,46,48,32,109,117,108,32,100,117,112,32,102,108,111,111,114,32,100,117,112,32,51,32,49,32,114,111,108,108,32,115,117,98,10,32,0,0,101,120,116,114,97,110,101,111,117,115,32,97,114,103,117,109,101,110,116,115,32,105,110,32,115,101,116,32,116,105,99,115,0,0,0,0,0,0,0,0,123,32,48,46,57,57,57,57,57,32,121,48,32,115,117,98,32,103,32,0,0,0,0,0,32,32,101,120,99,104,32,100,117,112,32,48,46,48,32,101,113,32,123,112,111,112,32,101,120,99,104,32,112,111,112,32,100,117,112,32,100,117,112,125,32,37,32,97,99,104,114,111,109,97,116,105,99,32,103,114,97,121,10,0,0,0,0,0,99,97,108,108,0,0,0,0,121,32,112,111,115,0,0,0,118,101,114,116,105,99,97,108,32,109,111,116,105,111,110,32,45,45,32,99,104,97,110,103,101,32,120,121,112,108,97,110,101,0,0,0,0,0,0,0,102,97,105,108,115,97,102,101,0,0,0,0,0,0,0,0,47,72,83,86,50,82,71,66,32,123,0,0,0,0,0,0,99,97,110,32,111,110,108,121,32,109,111,100,32,105,110,116,115,0,0,0,0,0,0,0,47,99,70,37,105,32,123,37,115,125,32,98,105,110,100,32,100,101,102,9,37,37,32,37,115,10,0,0,0,0,0,0,83,111,114,114,121,44,32,110,111,32,104,101,108,112,32,102,111,114,32,39,37,115,39,10,0,0,0,0,0,0,0,0,32,32,32,32,123,47,100,103,100,120,118,97,108,32,100,103,100,120,32,100,101,102,32,114,101,100,118,97,108,117,101,32,103,114,101,101,110,118,97,108,117,101,32,98,108,117,101,118,97,108,117,101,125,32,105,102,101,108,115,101,125,32,100,101,102,10,0,0,0,0,0,0,32,32,32,32,123,82,101,100,65,32,103,105,100,120,32,103,101,116,32,71,114,101,101,110,65,32,103,105,100,120,32,103,101,116,32,66,108,117,101,65,32,103,105,100,120,32,103,101,116,125,10,0,0,0,0,0,32,32,103,114,97,121,105,110,100,101,120,32,103,114,97,121,118,32,71,114,97,121,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,97,98,115,32,49,101,45,53,32,108,101,10,0,0,0,0,0,0,0,47,105,110,116,101,114,112,111,108,97,116,101,32,123,10,0,32,32,66,108,117,101,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,100,103,100,120,118,97,108,32,109,117,108,32,97,100,100,125,32,100,101,102,10,0,0,0,0,0,0,116,109,95,109,111,110,0,0,117,110,107,110,111,119,110,0,47,98,108,117,101,118,97,108,117,101,32,123,66,108,117,101,65,32,103,105,100,120,32,103,101,116,32,66,108,117,101,65,32,103,105,100,120,32,49,32,115,117,98,32,103,101,116,10,0,0,0,0,0,0,0,0,108,116,0,0,0,0,0,0,105,110,100,101,120,95,109,97,120,0,0,0,0,0,0,0,112,97,114,116,105,97,108,32,109,97,116,99,104,32,97,103,97,105,110,115,116,32,99,111,108,117,109,110,32,37,100,32,104,101,97,100,101,114,32,37,115,0,0,0,0,0,0,0,32,32,71,114,101,101,110,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,100,103,100,120,118,97,108,32,109,117,108,32,97,100,100,125,32,100,101,102,10,0,0,0,0,0,10,9,85,115,101,114,32,97,110,100,32,100,101,102,97,117,108,116,32,118,97,114,105,97,98,108,101,115,58,10,0,0,68,101,112,114,101,99,97,116,101,100,32,115,121,110,116,97,120,32,45,32,112,108,101,97,115,101,32,117,115,101,32,39,115,101,116,32,116,105,99,115,32,115,99,97,108,101,39,32,107,101,121,119,111,114,100,0,47,103,114,101,101,110,118,97,108,117,101,32,123,71,114,101,101,110,65,32,103,105,100,120,32,103,101,116,32,71,114,101,101,110,65,32,103,105,100,120,32,49,32,115,117,98,32,103,101,116,10,0,0,0,0,0,60,83,104,105,102,116,45,66,50,45,77,111,116,105,111,110,62,0,0,0,0,0,0,0,32,32,82,101,100,65,32,103,105,100,120,32,103,101,116,32,115,117,98,32,100,103,100,120,118,97,108,32,109,117,108,32,97,100,100,125,32,100,101,102,10,0,0,0,0,0,0,0,47,114,101,100,118,97,108,117,101,32,123,82,101,100,65,32,103,105,100,120,32,103,101,116,32,82,101,100,65,32,103,105,100,120,32,49,32,115,117,98,32,103,101,116,10,0,0,0,72,101,108,112,32,116,111,112,105,99,58,32,0,0,0,0,118,0,0,0,0,0,0,0,111,117,116,32,111,102,32,109,101,109,111,114,121,32,102,111,114,32,37,115,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,150,1,0,144,150,1,0,48,150,1,0,224,149,1,0,168,149,1,0,120,149,1,0,56,149,1,0,192,148,1,0,8,148,1,0,120,147,1,0,64,147,1,0,232,146,1,0,4,0,0,0,3,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,92,98,101,103,105,110,123,116,101,120,100,114,97,119,125,10,92,110,111,114,109,97,108,115,105,122,101,10,92,105,102,120,92,112,97,116,104,68,69,70,73,78,69,68,92,114,101,108,97,120,92,101,108,115,101,92,108,101,116,92,112,97,116,104,68,69,70,73,78,69,68,92,114,101,108,97,120,10,32,92,100,101,102,92,81,116,71,102,114,123,92,105,102,120,32,40,92,84,71,114,101,32,92,108,101,116,92,89,104,101,116,84,92,99,112,97,116,104,92,101,108,115,101,92,108,101,116,92,89,104,101,116,84,92,114,101,108,97,120,92,102,105,92,89,104,101,116,84,125,10,32,92,100,101,102,92,112,97,116,104,32,40,35,49,32,35,50,41,123,92,109,111,118,101,32,40,35,49,32,35,50,41,92,102,117,116,117,114,101,108,101,116,92,84,71,114,101,92,81,116,71,102,114,125,10,32,92,100,101,102,92,99,112,97,116,104,32,40,35,49,32,35,50,41,123,92,108,118,101,99,32,40,35,49,32,35,50,41,92,102,117,116,117,114,101,108,101,116,92,84,71,114,101,92,81,116,71,102,114,125,10,92,102,105,10,92,100,114,97,119,100,105,109,32,112,116,10,92,115,101,116,117,110,105,116,115,99,97,108,101,32,37,50,46,50,102,10,92,108,105,110,101,119,100,32,37,100,10,92,116,101,120,116,114,101,102,32,104,58,76,32,118,58,67,10,0,0,0,0,0,0,0,0,0,0,0,192,18,0,0,0,0,0,0,255,255,255,255,0,0,0,0,112,23,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,176,107,2,0,160,76,1,0,112,76,1,0,40,76,1,0,16,76,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,9,3,0,24,8,3,0,184,8,3,0,88,9,3,0,48,9,3,0,248,8,3,0,8,8,3,0,176,8,3,0,192,8,3,0,0,0,0,0,128,9,3,0,88,9,3,0,48,9,3,0,0,9,3,0,248,8,3,0,192,8,3,0,184,8,3,0,176,8,3,0,152,8,3,0,144,8,3,0,72,8,3,0,48,8,3,0,24,8,3,0,8,8,3,0,0,8,3,0,240,7,3,0,232,7,3,0,224,7,3,0,200,7,3,0,192,7,3,0,136,7,3,0,88,7,3,0,72,7,3,0,8,7,3,0,0,7,3,0,216,6,3,0,208,6,3,0,200,6,3,0,136,6,3,0,128,6,3,0,96,6,3,0,248,5,3,0,240,5,3,0,208,5,3,0,144,5,3,0,136,5,3,0,128,5,3,0,112,5,3,0,72,5,3,0,64,5,3,0,40,5,3,0,216,4,3,0,192,4,3,0,144,4,3,0,136,4,3,0,128,4,3,0,56,4,3,0,48,4,3,0,184,3,3,0,176,3,3,0,144,3,3,0,24,3,3,0,240,2,3,0,216,2,3,0,208,2,3,0,200,2,3,0,192,2,3,0,184,2,3,0,120,2,3,0,0,2,3,0,200,1,3,0,88,1,3,0,24,1,3,0,184,0,3,0,144,0,3,0,120,0,3,0,88,0,3,0,16,0,3,0,168,255,2,0,136,255,2,0,104,255,2,0,8,255,2,0,216,254,2,0,168,254,2,0,136,254,2,0,88,254,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,243,1,0,3,0,0,0,128,178,2,0,0,0,0,0,112,178,2,0,1,0,0,0,96,178,2,0,2,0,0,0,208,181,1,0,4,0,0,0,160,177,1,0,5,0,0,0,80,178,2,0,9,0,0,0,192,179,1,0,10,0,0,0,40,179,1,0,10,0,0,0,56,178,2,0,11,0,0,0,0,178,2,0,12,0,0,0,232,177,2,0,12,0,0,0,176,237,1,0,13,0,0,0,48,238,1,0,14,0,0,0,184,234,1,0,15,0,0,0,32,234,1,0,15,0,0,0,136,233,1,0,16,0,0,0,40,233,1,0,16,0,0,0,112,243,1,0,39,0,0,0,160,177,2,0,17,0,0,0,152,177,2,0,18,0,0,0,136,177,2,0,19,0,0,0,136,17,2,0,21,0,0,0,120,177,2,0,20,0,0,0,136,180,2,0,22,0,0,0,104,180,2,0,23,0,0,0,104,177,2,0,24,0,0,0,152,232,1,0,30,0,0,0,72,177,2,0,25,0,0,0,56,177,2,0,26,0,0,0,16,181,2,0,27,0,0,0,224,180,2,0,28,0,0,0,144,194,1,0,29,0,0,0,24,242,1,0,7,0,0,0,192,242,1,0,8,0,0,0,112,240,1,0,37,0,0,0,232,239,1,0,38,0,0,0,40,177,2,0,31,0,0,0,184,176,2,0,32,0,0,0,160,176,2,0,33,0,0,0,136,176,2,0,34,0,0,0,32,176,2,0,35,0,0,0,16,176,2,0,36,0,0,0,248,175,2,0,40,0,0,0,176,175,2,0,41,0,0,0,176,38,1,0,42,0,0,0,144,175,2,0,43,0,0,0,0,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,101,108,118,101,116,105,99,97,44,49,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,101,118,101,108,49,32,83,117,112,112,114,101,115,115,80,68,70,77,97,114,107,32,111,114,32,10,123,125,32,123,10,47,83,68,105,99,116,32,49,48,32,100,105,99,116,32,100,101,102,10,115,121,115,116,101,109,100,105,99,116,32,47,112,100,102,109,97,114,107,32,107,110,111,119,110,32,110,111,116,32,123,10,32,32,117,115,101,114,100,105,99,116,32,47,112,100,102,109,97,114,107,32,115,121,115,116,101,109,100,105,99,116,32,47,99,108,101,97,114,116,111,109,97,114,107,32,103,101,116,32,112,117,116,10,125,32,105,102,10,83,68,105,99,116,32,98,101,103,105,110,32,91,10,32,32,47,84,105,116,108,101,32,40,37,115,41,10,32,32,47,83,117,98,106,101,99,116,32,40,103,110,117,112,108,111,116,32,112,108,111,116,41,10,32,32,47,67,114,101,97,116,111,114,32,40,103,110,117,112,108,111,116,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,41,10,32,32,47,65,117,116,104,111,114,32,40,37,115,41,10,37,37,32,32,47,80,114,111,100,117,99,101,114,32,40,103,110,117,112,108,111,116,41,10,37,37,32,32,47,75,101,121,119,111,114,100,115,32,40,41,10,32,32,47,67,114,101,97,116,105,111,110,68,97,116,101,32,40,37,115,41,10,32,32,47,68,79,67,73,78,70,79,32,112,100,102,109,97,114,107,10,101,110,100,10,125,32,105,102,101,108,115,101,10,0,0,0,37,37,37,37,69,110,100,67,111,109,109,101,110,116,115,10,37,37,37,37,66,101,103,105,110,80,114,111,108,111,103,10,47,103,110,117,100,105,99,116,32,50,53,54,32,100,105,99,116,32,100,101,102,10,103,110,117,100,105,99,116,32,98,101,103,105,110,10,37,37,10,37,37,32,84,104,101,32,102,111,108,108,111,119,105,110,103,32,116,114,117,101,47,102,97,108,115,101,32,102,108,97,103,115,32,109,97,121,32,98,101,32,101,100,105,116,101,100,32,98,121,32,104,97,110,100,32,105,102,32,100,101,115,105,114,101,100,46,10,37,37,32,84,104,101,32,117,110,105,116,32,108,105,110,101,32,119,105,100,116,104,32,97,110,100,32,103,114,97,121,115,99,97,108,101,32,105,109,97,103,101,32,103,97,109,109,97,32,99,111,114,114,101,99,116,105,111,110,32,109,97,121,32,97,108,115,111,32,98,101,32,99,104,97,110,103,101,100,46,10,37,37,10,47,67,111,108,111,114,32,37,115,32,100,101,102,10,47,66,108,97,99,107,116,101,120,116,32,37,115,32,100,101,102,10,47,83,111,108,105,100,32,37,115,32,100,101,102,10,47,68,97,115,104,108,101,110,103,116,104,32,37,103,32,100,101,102,10,47,76,97,110,100,115,99,97,112,101,32,37,115,32,100,101,102,10,47,76,101,118,101,108,49,32,37,115,32,100,101,102,10,47,82,111,117,110,100,101,100,32,37,115,32,100,101,102,10,47,67,108,105,112,84,111,66,111,117,110,100,105,110,103,66,111,120,32,37,115,32,100,101,102,10,47,83,117,112,112,114,101,115,115,80,68,70,77,97,114,107,32,102,97,108,115,101,32,100,101,102,10,47,84,114,97,110,115,112,97,114,101,110,116,80,97,116,116,101,114,110,115,32,102,97,108,115,101,32,100,101,102,10,47,103,110,117,108,105,110,101,119,105,100,116,104,32,37,46,51,102,32,100,101,102,10,47,117,115,101,114,108,105,110,101,119,105,100,116,104,32,103,110,117,108,105,110,101,119,105,100,116,104,32,100,101,102,10,47,71,97,109,109,97,32,49,46,48,32,100,101,102,10,47,66,97,99,107,103,114,111,117,110,100,67,111,108,111,114,32,123,37,46,51,102,32,37,46,51,102,32,37,46,51,102,125,32,100,101,102,10,37,37,10,47,118,115,104,105,102,116,32,37,100,32,100,101,102,10,47,100,108,49,32,123,10,32,32,37,46,49,102,32,68,97,115,104,108,101,110,103,116,104,32,109,117,108,32,109,117,108,10,32,32,82,111,117,110,100,101,100,32,123,32,99,117,114,114,101,110,116,108,105,110,101,119,105,100,116,104,32,48,46,55,53,32,109,117,108,32,115,117,98,32,100,117,112,32,48,32,108,101,32,123,32,112,111,112,32,48,46,48,49,32,125,32,105,102,32,125,32,105,102,10,125,32,100,101,102,10,47,100,108,50,32,123,10,32,32,37,46,49,102,32,68,97,115,104,108,101,110,103,116,104,32,109,117,108,32,109,117,108,10,32,32,82,111,117,110,100,101,100,32,123,32,99,117,114,114,101,110,116,108,105,110,101,119,105,100,116,104,32,48,46,55,53,32,109,117,108,32,97,100,100,32,125,32,105,102,10,125,32,100,101,102,10,47,104,112,116,95,32,37,46,49,102,32,100,101,102,10,47,118,112,116,95,32,37,46,49,102,32,100,101,102,10,47,104,112,116,32,104,112,116,95,32,100,101,102,10,47,118,112,116,32,118,112,116,95,32,100,101,102,10,0,0,0,0,0,0,37,37,37,37,67,114,101,97,116,111,114,58,32,103,110,117,112,108,111,116,32,37,115,32,112,97,116,99,104,108,101,118,101,108,32,37,115,10,37,37,37,37,67,114,101,97,116,105,111,110,68,97,116,101,58,32,37,115,10,37,37,37,37,68,111,99,117,109,101,110,116,70,111,110,116,115,58,32,37,115,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,137,1,0,248,136,1,0,160,136,1,0,112,136,1,0,32,136,1,0,144,135,1,0,208,134,1,0,112,134,1,0,32,134,1,0,0,134,1,0,168,133,1,0,80,133,1,0,0,0,0,0,0,0,0,0,200,128,1,0,184,127,1,0,64,127,1,0,8,127,1,0,240,126,1,0,184,126,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,180,1,0,0,0,0,0,192,179,1,0,1,0,0,0,40,179,1,0,1,0,0,0,176,178,1,0,2,0,0,0,48,238,1,0,3,0,0,0,0,178,1,0,4,0,0,0,176,177,1,0,5,0,0,0,120,177,1,0,6,0,0,0,80,177,1,0,7,0,0,0,32,177,1,0,11,0,0,0,224,176,1,0,8,0,0,0,136,176,1,0,9,0,0,0,88,176,1,0,10,0,0,0,224,175,1,0,14,0,0,0,104,175,1,0,15,0,0,0,232,174,1,0,16,0,0,0,120,174,1,0,12,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,254,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,192,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,5,0,0,0,6,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,0,0,192,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,63,15,0,0,0,10,0,0,0,15,0,0,0,10,0,0,0,0,0,0,0,0,0,192,63,10,0,0,0,15,0,0,0,10,0,0,0,15,0,0,0,0,0,0,0,0,0,192,63,20,0,0,0,10,0,0,0,5,0,0,0,10,0,0,0,0,0,0,0,0,0,192,63,10,0,0,0,6,0,0,0,10,0,0,0,6,0,0,0,0,0,0,0,0,0,192,63,15,0,0,0,6,0,0,0,5,0,0,0,10,0,0,0,0,0,0,0,0,0,192,63,10,0,0,0,6,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,0,0,192,63,5,0,0,0,6,0,0,0,5,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,132,1,0,176,107,2,0,160,132,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,104,1,0,128,104,1,0,64,104,1,0,24,104,1,0,248,103,1,0,224,103,1,0,128,103,1,0,48,103,1,0,232,102,1,0,192,102,1,0,152,102,1,0,56,102,1,0,8,102,1,0,224,101,1,0,192,101,1,0,0,0,0,0,48,96,1,0,0,0,0,0,32,96,1,0,1,0,0,0,232,243,1,0,2,0,0,0,24,96,1,0,3,0,0,0,200,95,1,0,4,0,0,0,160,95,1,0,5,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,205,204,204,62,0,0,0,0,205,204,204,62,0,0,160,64,205,204,76,63,0,0,0,0,0,0,128,63,0,0,160,64,154,153,153,63,0,0,0,0,0,0,128,63,0,0,32,65,10,0,0,0,0,0,0,0,100,111,99,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,32,114,117,108,101,114,58,32,91,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,70,73,84,95,76,79,71,0,176,4,0,0,0,0,0,0,176,4,0,0,0,0,0,0,51,46,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,231,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,164,2,0,3,0,0,0,192,179,1,0,1,0,0,0,40,179,1,0,1,0,0,0,48,238,1,0,15,0,0,0,224,164,2,0,12,0,0,0,144,194,1,0,9,0,0,0,168,164,2,0,10,0,0,0,96,245,1,0,4,0,0,0,112,178,2,0,7,0,0,0,160,164,2,0,5,0,0,0,40,180,1,0,0,0,0,0,144,164,2,0,13,0,0,0,88,164,2,0,6,0,0,0,24,96,1,0,8,0,0,0,40,164,2,0,2,0,0,0,176,237,1,0,14,0,0,0,136,233,1,0,11,0,0,0,0,164,2,0,11,0,0,0,224,163,2,0,18,0,0,0,200,163,2,0,16,0,0,0,184,163,2,0,19,0,0,0,168,163,2,0,17,0,0,0,128,163,2,0,20,0,0,0,0,0,0,0,21,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,5,0,0,0,3,0,0,0,6,0,0,0,0,0,0,0,26,0,0,0,11,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,103,1,0,0,0,0,0,240,100,1,0,1,0,0,0,144,98,1,0,2,0,0,0,64,96,1,0,3,0,0,0,136,94,1,0,4,0,0,0,144,92,1,0,5,0,0,0,224,90,1,0,6,0,0,0,240,88,1,0,7,0,0,0,240,86,1,0,8,0,0,0,184,84,1,0,9,0,0,0,24,83,1,0,10,0,0,0,128,80,1,0,11,0,0,0,112,78,1,0,12,0,0,0,56,76,1,0,13,0,0,0,216,72,1,0,14,0,0,0,144,70,1,0,15,0,0,0,160,68,1,0,16,0,0,0,96,66,1,0,17,0,0,0,0,64,1,0,18,0,0,0,32,62,1,0,19,0,0,0,24,60,1,0,20,0,0,0,240,56,1,0,21,0,0,0,24,54,1,0,22,0,0,0,176,49,1,0,23,0,0,0,160,42,1,0,24,0,0,0,200,40,1,0,25,0,0,0,208,38,1,0,26,0,0,0,72,36,1,0,27,0,0,0,8,34,1,0,28,0,0,0,56,32,1,0,29,0,0,0,232,29,1,0,30,0,0,0,184,27,1,0,31,0,0,0,224,24,1,0,32,0,0,0,48,22,1,0,33,0,0,0,184,19,1,0,34,0,0,0,0,0,0,0,255,255,255,255,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,174,2,0,200,172,2,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,212,0,0,0,66,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,248,2,0,56,248,2,0,232,247,2,0,160,247,2,0,64,247,2,0,240,246,2,0,128,246,2,0,48,246,2,0,240,245,2,0,128,245,2,0,248,244,2,0,144,244,2,0,104,244,2,0,16,244,2,0,192,243,2,0,104,243,2,0,40,243,2,0,248,242,2,0,160,242,2,0,64,242,2,0,40,241,2,0,224,240,2,0,64,240,2,0,8,240,2,0,176,239,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,0,255,0,0,0,0,255,0,255,0,255,0,0,0,128,0,128,0,0,0,0,128,128,0,0,0,0,0,128,128,128,0,0,128,64,0,128,128,0,0,128,0,128,0,192,192,192,0,0,255,255,0,255,255,0,0,0,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,10,84,65,66,76,69,10,32,32,50,10,76,84,89,80,69,10,32,55,48,10,32,32,32,32,37,100,10,48,10,76,84,89,80,69,10,32,32,50,10,67,79,78,84,73,78,85,79,85,83,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,83,111,108,105,100,32,108,105,110,101,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,32,48,10,32,52,48,10,48,46,48,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,68,65,83,72,69,68,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,32,95,95,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,50,10,32,52,48,10,48,46,55,53,10,32,52,57,10,48,46,53,10,32,52,57,10,45,48,46,50,53,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,72,73,68,68,69,78,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,32,95,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,50,10,32,52,48,10,48,46,51,55,53,10,32,52,57,10,48,46,50,53,10,32,52,57,10,45,48,46,49,50,53,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,67,69,78,84,69,82,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,95,95,95,95,32,95,32,95,95,95,95,32,95,32,95,95,95,95,32,95,32,95,95,95,95,32,95,32,95,95,95,95,32,95,32,95,95,95,95,32,95,32,95,95,95,95,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,52,10,32,52,48,10,50,46,48,10,32,52,57,10,49,46,50,53,10,32,52,57,10,45,48,46,50,53,10,32,52,57,10,48,46,50,53,10,32,52,57,10,45,48,46,50,53,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,80,72,65,78,84,79,77,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,95,95,95,95,95,32,95,32,95,32,95,95,95,95,95,32,95,32,95,32,95,95,95,95,95,32,95,32,95,32,95,95,95,95,95,32,95,32,95,32,95,95,95,95,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,54,10,32,52,48,10,50,46,53,10,32,52,57,10,49,46,50,53,10,32,52,57,10,45,48,46,50,53,10,32,52,57,10,48,46,50,53,10,32,52,57,10,45,48,46,50,53,10,32,52,57,10,48,46,50,53,10,32,52,57,10,45,48,46,50,53,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,68,79,84,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,50,10,32,52,48,10,48,46,50,53,10,32,52,57,10,48,46,48,10,32,52,57,10,45,48,46,50,53,10,32,32,48,10,76,84,89,80,69,10,32,32,50,10,68,65,83,72,68,79,84,10,32,55,48,10,32,32,32,32,54,52,10,32,32,51,10,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,32,46,32,95,95,10,32,55,50,10,32,32,32,32,54,53,10,32,55,51,10,32,32,32,32,32,52,10,32,52,48,10,49,46,48,10,32,52,57,10,48,46,53,10,32,52,57,10,45,48,46,50,53,10,32,52,57,10,48,46,48,10,32,52,57,10,45,48,46,50,53,10,32,32,48,10,69,78,68,84,65,66,10,0,0,0,0,0,0,0,57,57,57,10,37,37,32,71,78,85,80,76,79,84,58,32,100,120,102,32,102,105,108,101,32,102,111,114,32,65,117,116,111,67,97,100,10,32,32,48,10,83,69,67,84,73,79,78,10,32,32,50,10,72,69,65,68,69,82,10,32,32,57,10,36,69,88,84,77,73,78,10,32,49,48,10,48,46,48,48,48,10,32,50,48,10,48,46,48,48,48,10,32,32,57,10,36,69,88,84,77,65,88,10,32,49,48,10,37,45,54,46,51,102,10,32,50,48,10,37,45,54,46,51,102,10,32,32,57,10,36,76,73,77,77,73,78,10,32,49,48,10,48,46,48,48,48,10,32,50,48,10,48,46,48,48,48,10,32,32,57,10,36,76,73,77,77,65,88,10,32,49,48,10,37,45,54,46,51,102,10,32,50,48,10,37,45,54,46,51,102,10,32,32,57,10,36,84,69,88,84,83,84,89,76,69,10,32,32,55,10,37,115,10,32,32,57,10,36,84,69,88,84,83,73,90,69,10,32,52,48,10,37,45,54,46,51,102,10,32,32,57,10,36,80,76,73,78,69,87,73,68,10,32,52,48,10,37,45,54,46,52,102,10,32,32,57,10,36,76,84,83,67,65,76,69,10,32,32,52,48,10,37,45,54,46,51,102,10,32,32,57,10,36,67,79,79,82,68,83,10,32,55,48,10,32,32,49,10,32,32,57,10,36,67,69,76,84,89,80,69,10,32,54,10,66,89,76,65,89,69,82,10,32,32,57,10,36,67,76,65,89,69,82,10,32,32,56,10,48,10,32,32,57,10,36,67,69,67,79,76,79,82,10,32,54,50,10,32,32,32,37,115,10,32,32,57,10,36,77,69,78,85,10,32,32,49,10,97,99,97,100,10,32,32,48,10,69,78,68,83,69,67,10,32,32,48,10,83,69,67,84,73,79,78,10,32,32,50,10,84,65,66,76,69,83,10,0,0,0,0,0,96,154,2,0,0,0,0,0,80,154,2,0,1,0,0,0,208,181,1,0,2,0,0,0,48,154,2,0,3,0,0,0,112,243,1,0,4,0,0,0,0,0,0,0,5,0,0,0,42,35,36,37,64,38,61,0,232,131,2,0,0,0,0,0,184,238,1,0,1,0,0,0,184,147,2,0,2,0,0,0,176,147,2,0,2,0,0,0,0,0,0,0,3,0,0,0,49,46,48,0,0,0,0,0,50,48,49,49,45,49,49,45,48,53,0,0,0,0,0,0,99,101,110,116,101,114,0,0,0,0,108,101,102,116,0,0,0,0,0,0,114,105,103,104,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,64,0,0,0,0,0,0,8,64,1,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,20,64,0,0,0,0,0,0,8,64,1,0,0,0,0,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,64,232,243,1,0,0,0,0,0,112,243,1,0,1,0,0,0,40,243,1,0,2,0,0,0,192,242,1,0,3,0,0,0,24,242,1,0,4,0,0,0,160,241,1,0,5,0,0,0,24,241,1,0,6,0,0,0,112,240,1,0,7,0,0,0,232,239,1,0,8,0,0,0,128,239,1,0,9,0,0,0,0,239,1,0,9,0,0,0,184,238,1,0,10,0,0,0,48,238,1,0,11,0,0,0,176,237,1,0,12,0,0,0,40,237,1,0,13,0,0,0,144,19,2,0,14,0,0,0,152,236,1,0,15,0,0,0,136,17,2,0,16,0,0,0,248,250,1,0,17,0,0,0,216,235,1,0,18,0,0,0,184,234,1,0,19,0,0,0,32,234,1,0,19,0,0,0,136,233,1,0,20,0,0,0,40,233,1,0,20,0,0,0,152,232,1,0,21,0,0,0,64,232,1,0,21,0,0,0,200,231,1,0,22,0,0,0,32,231,1,0,23,0,0,0,216,230,1,0,22,0,0,0,96,230,1,0,22,0,0,0,128,229,1,0,23,0,0,0,16,229,1,0,24,0,0,0,160,228,1,0,25,0,0,0,144,194,1,0,27,0,0,0,40,228,1,0,26,0,0,0,0,0,0,0,28,0,0,0,0,0,0,0,0,0,240,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,253,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
.concat([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,178,2,0,0,0,0,0,8,138,2,0,1,0,0,0,8,161,2,0,2,0,0,0,248,137,2,0,11,0,0,0,232,137,2,0,11,0,0,0,80,178,2,0,3,0,0,0,192,179,1,0,4,0,0,0,40,179,1,0,4,0,0,0,40,177,2,0,5,0,0,0,216,137,2,0,6,0,0,0,48,238,1,0,7,0,0,0,176,178,1,0,8,0,0,0,184,137,2,0,9,0,0,0,40,233,1,0,9,0,0,0,128,137,2,0,10,0,0,0,176,38,1,0,12,0,0,0,0,0,0,0,13,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,16,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,5,0,0,0,1,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,9,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,13,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,2,0,0,0,4,0,0,0,2,0,0,0,5,0,0,0,2,0,0,0,6,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,11,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,15,0,0,0,4,0,0,0,16,0,0,0,4,0,0,0,17,0,0,0,4,0,0,0,18,0,0,0,4,0,0,0,19,0,0,0,5,0,0,0,2,0,0,0,5,0,0,0,3,0,0,0,5,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,10,0,0,0,5,0,0,0,14,0,0,0,5,0,0,0,15,0,0,0,5,0,0,0,16,0,0,0,5,0,0,0,18,0,0,0,5,0,0,0,22,0,0,0,5,0,0,0,23,0,0,0,5,0,0,0,24,0,0,0,5,0,0,0,27,0,0,0,5,0,0,0,28,0,0,0,5,0,0,0,29,0,0,0,5,0,0,0,30,0,0,0,5,0,0,0,34,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,5,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,8,0,0,0,5,0,0,0,3,0,0,0,5,0,0,0,3,0,0,0,5,0,0,0,3,0,0,0,5,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,63,144,194,1,0,1,0,0,0,248,93,2,0,2,0,0,0,136,41,1,0,3,0,0,0,112,243,1,0,0,0,0,0,56,4,2,0,4,0,0,0,232,41,1,0,7,0,0,0,248,41,1,0,7,0,0,0,232,93,2,0,8,0,0,0,208,181,1,0,9,0,0,0,160,177,1,0,10,0,0,0,40,233,1,0,6,0,0,0,136,233,1,0,6,0,0,0,216,93,2,0,5,0,0,0,152,232,1,0,11,0,0,0,96,249,1,0,12,0,0,0,200,38,1,0,13,0,0,0,184,234,1,0,14,0,0,0,32,234,1,0,14,0,0,0,8,39,1,0,15,0,0,0,136,17,2,0,16,0,0,0,176,38,1,0,17,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,130,2,0,56,130,2,0,32,130,2,0,232,129,2,0,208,129,2,0,128,129,2,0,72,129,2,0,40,129,2,0,8,129,2,0,232,128,2,0,208,128,2,0,184,128,2,0,160,128,2,0,112,128,2,0,88,128,2,0,48,128,2,0,232,127,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  var _log=Math.log;
  var _fabs=Math.abs;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  Module["_strcpy"] = _strcpy;
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  var _exp=Math.exp;
  var _ceil=Math.ceil;
  function _log10(x) {
      return Math.log(x) / Math.LN10;
    }
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  Module["_strcat"] = _strcat;
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  var _floor=Math.floor;
  var _llvm_pow_f64=Math.pow;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      if (FS.streams[stream]) FS.streams[stream].error = false;
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) return 0;
      var bytesRead = _read(stream, ptr, bytesToRead);
      var streamObj = FS.streams[stream];
      if (bytesRead == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        if (bytesRead < bytesToRead) streamObj.eof = true;
        return Math.floor(bytesRead / size);
      }
    }
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  function _strcspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (setcurr) return str - pstr;
        str++;
      }
    }
  Module["_strncpy"] = _strncpy;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      if (bits == 64) {
        return ((asm["setTempRet0"](Math.min(Math.floor((ret)/(+(4294967296))), (+(4294967295)))>>>0),ret>>>0)|0);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _strstr(ptr1, ptr2) {
      var check = 0, start;
      do {
        if (!check) {
          start = ptr1;
          check = ptr2;
        }
        var curr1 = HEAP8[((ptr1++)|0)];
        var curr2 = HEAP8[((check++)|0)];
        if (curr2 == 0) return start;
        if (curr2 != curr1) {
          // rewind to one character after start, to find ez in eeez
          ptr1 = start + 1;
          check = 0;
        }
      } while (curr1);
      return 0;
    }
  Module["_memcmp"] = _memcmp;
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }function _fgets(s, n, stream) {
      // char *fgets(char *restrict s, int n, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgets.html
      if (!FS.streams[stream]) return 0;
      var streamObj = FS.streams[stream];
      if (streamObj.error || streamObj.eof) return 0;
      var byte_;
      for (var i = 0; i < n - 1 && byte_ != 10; i++) {
        byte_ = _fgetc(stream);
        if (byte_ == -1) {
          if (streamObj.error || (streamObj.eof && i == 0)) return 0;
          else if (streamObj.eof) break;
        }
        HEAP8[(((s)+(i))|0)]=byte_
      }
      HEAP8[(((s)+(i))|0)]=0
      return s;
    }
  function _usleep(useconds) {
      // int usleep(useconds_t useconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/usleep.html
      // We're single-threaded, so use a busy loop. Super-ugly.
      var msec = useconds / 1000;
      var start = Date.now();
      while (Date.now() - start < msec) {
        // Do nothing.
      }
      return 0;
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  function _pclose(stream) {
      // int pclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/pclose.html
      // We allow only one process, so no pipes.
      ___setErrNo(ERRNO_CODES.ECHILD);
      return -1;
    }
  function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function ___errno_location() {
      return ___errno_state;
    }function _perror(s) {
      // void perror(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/perror.html
      var stdout = HEAP32[((_stdout)>>2)];
      if (s) {
        _fputs(s, stdout);
        _fputc(58, stdout);
        _fputc(32, stdout);
      }
      var errnum = HEAP32[((___errno_location())>>2)];
      _puts(_strerror(errnum));
    }
  function _popen(command, mode) {
      // FILE *popen(const char *command, const char *mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/popen.html
      // We allow only one process, so no pipes.
      ___setErrNo(ERRNO_CODES.EMFILE);
      return 0;
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isCreate || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  var _putc=_fputc;
  function _getcwd(buf, size) {
      // char *getcwd(char *buf, size_t size);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/getcwd.html
      if (size == 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      } else if (size < FS.currentPath.length + 1) {
        ___setErrNo(ERRNO_CODES.ERANGE);
        return 0;
      } else {
        for (var i = 0; i < FS.currentPath.length; i++) {
          HEAP8[(((buf)+(i))|0)]=FS.currentPath.charCodeAt(i)
        }
        HEAP8[(((buf)+(i))|0)]=0
        return buf;
      }
    }
  var _environ=allocate(1, "i32*", ALLOC_STATIC);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _strncat(pdest, psrc, num) {
      var len = _strlen(pdest);
      var i = 0;
      while(1) {
        HEAP8[((pdest+len+i)|0)]=HEAP8[((psrc+i)|0)];
        if (HEAP8[(((pdest)+(len+i))|0)] == 0) break;
        i ++;
        if (i == num) {
          HEAP8[(((pdest)+(len+i))|0)]=0
          break;
        }
      }
      return pdest;
    }
  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }
  function _system(command) {
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  var _getc=_fgetc;
  function _chdir(path) {
      // int chdir(const char *path);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/chdir.html
      // NOTE: The path argument may be a string, to simplify fchdir().
      if (typeof path !== 'string') path = Pointer_stringify(path);
      path = FS.analyzePath(path);
      if (!path.exists) {
        ___setErrNo(path.error);
        return -1;
      } else if (!path.object.isFolder) {
        ___setErrNo(ERRNO_CODES.ENOTDIR);
        return -1;
      } else {
        FS.currentPath = path.path;
        return 0;
      }
    }
  function _tmpnam(s, dir, prefix) {
      // char *tmpnam(char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpnam.html
      // NOTE: The dir and prefix arguments are for internal use only.
      var folder = FS.findObject(dir || '/tmp');
      if (!folder || !folder.isFolder) {
        dir = '/tmp';
        folder = FS.findObject(dir);
        if (!folder || !folder.isFolder) return 0;
      }
      var name = prefix || 'file';
      do {
        name += String.fromCharCode(65 + Math.floor(Math.random() * 25));
      } while (name in folder.contents);
      var result = dir + '/' + name;
      if (!_tmpnam.buffer) _tmpnam.buffer = _malloc(256);
      if (!s) s = _tmpnam.buffer;
      for (var i = 0; i < result.length; i++) {
        HEAP8[(((s)+(i))|0)]=result.charCodeAt(i);
      }
      HEAP8[(((s)+(i))|0)]=0;
      return s;
    }function _tmpfile() {
      // FILE *tmpfile(void);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/tmpfile.html
      // TODO: Delete the created file on closing.
      if (_tmpfile.mode) {
        _tmpfile.mode = allocate(intArrayFromString('w+'), 'i8', ALLOC_NORMAL);
      }
      return _fopen(_tmpnam(0), _tmpfile.mode);
    }
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  var _sqrt=Math.sqrt;
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      // We use file descriptor numbers and FILE* streams interchangeably.
      return stream;
    }
  function _fdopen(fildes, mode) {
      // FILE *fdopen(int fildes, const char *mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fdopen.html
      if (FS.streams[fildes]) {
        var stream = FS.streams[fildes];
        mode = Pointer_stringify(mode);
        if ((mode.indexOf('w') != -1 && !stream.isWrite) ||
            (mode.indexOf('r') != -1 && !stream.isRead) ||
            (mode.indexOf('a') != -1 && !stream.isAppend) ||
            (mode.indexOf('+') != -1 && (!stream.isRead || !stream.isWrite))) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return 0;
        } else {
          stream.error = false;
          stream.eof = false;
          return fildes;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
    }
  var ___stat_struct_layout={__size__:68,st_dev:0,st_ino:4,st_mode:8,st_nlink:12,st_uid:16,st_gid:20,st_rdev:24,st_size:28,st_atime:32,st_spare1:36,st_mtime:40,st_spare2:44,st_ctime:48,st_spare3:52,st_blksize:56,st_blocks:60,st_spare4:64};function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      var obj = FS.findObject(Pointer_stringify(path), dontResolveLastLink);
      if (obj === null || !FS.forceLoadFile(obj)) return -1;
      var offsets = ___stat_struct_layout;
      // Constants.
      HEAP32[(((buf)+(offsets.st_nlink))>>2)]=1
      HEAP32[(((buf)+(offsets.st_uid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_gid))>>2)]=0
      HEAP32[(((buf)+(offsets.st_blksize))>>2)]=4096
      // Variables.
      HEAP32[(((buf)+(offsets.st_ino))>>2)]=obj.inodeNumber
      var time = Math.floor(obj.timestamp / 1000);
      if (offsets.st_atime === undefined) {
        offsets.st_atime = offsets.st_atim.tv_sec;
        offsets.st_mtime = offsets.st_mtim.tv_sec;
        offsets.st_ctime = offsets.st_ctim.tv_sec;
        var nanosec = (obj.timestamp % 1000) * 1000;
        HEAP32[(((buf)+(offsets.st_atim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_mtim.tv_nsec))>>2)]=nanosec
        HEAP32[(((buf)+(offsets.st_ctim.tv_nsec))>>2)]=nanosec
      }
      HEAP32[(((buf)+(offsets.st_atime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_mtime))>>2)]=time
      HEAP32[(((buf)+(offsets.st_ctime))>>2)]=time
      var mode = 0;
      var size = 0;
      var blocks = 0;
      var dev = 0;
      var rdev = 0;
      if (obj.isDevice) {
        //  Device numbers reuse inode numbers.
        dev = rdev = obj.inodeNumber;
        size = blocks = 0;
        mode = 0x2000;  // S_IFCHR.
      } else {
        dev = 1;
        rdev = 0;
        // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
        //       but this is not required by the standard.
        if (obj.isFolder) {
          size = 4096;
          blocks = 1;
          mode = 0x4000;  // S_IFDIR.
        } else {
          var data = obj.contents || obj.link;
          size = data.length;
          blocks = Math.ceil(data.length / 4096);
          mode = obj.link === undefined ? 0x8000 : 0xA000;  // S_IFREG, S_IFLNK.
        }
      }
      HEAP32[(((buf)+(offsets.st_dev))>>2)]=dev;
      HEAP32[(((buf)+(offsets.st_rdev))>>2)]=rdev;
      HEAP32[(((buf)+(offsets.st_size))>>2)]=size
      HEAP32[(((buf)+(offsets.st_blocks))>>2)]=blocks
      if (obj.read) mode |= 0x16D;  // S_IRUSR | S_IXUSR | S_IRGRP | S_IXGRP | S_IROTH | S_IXOTH.
      if (obj.write) mode |= 0x92;  // S_IWUSR | S_IWGRP | S_IWOTH.
      HEAP32[(((buf)+(offsets.st_mode))>>2)]=mode
      return 0;
    }
  function _feof(stream) {
      // int feof(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/feof.html
      return Number(FS.streams[stream] && FS.streams[stream].eof);
    }
  function _setlocale(category, locale) {
      if (!_setlocale.ret) _setlocale.ret = allocate([0], 'i8', ALLOC_NORMAL);
      return _setlocale.ret;
    }
  function ___fpclassifyf(x) {
      if (isNaN(x)) return 0;
      if (!isFinite(x)) return 1;
      if (x == 0) return 2;
      // FP_SUBNORMAL..?
      return 4;
    }var ___fpclassifyd=___fpclassifyf;
  var _cos=Math.cos;
  var _sin=Math.sin;
  Module["_tolower"] = _tolower; 
  Module["_strncasecmp"] = _strncasecmp; 
  Module["_strcasecmp"] = _strcasecmp;
  function _strrchr(ptr, chr) {
      var ptr2 = ptr + _strlen(ptr);
      do {
        if (HEAP8[(ptr2)] == chr) return ptr2;
        ptr2--;
      } while (ptr2 >= ptr);
      return 0;
    }
  function _strspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (!setcurr) return str - pstr;
        str++;
      }
    }
  function _strpbrk(ptr1, ptr2) {
      var curr;
      var searchSet = {};
      while (1) {
        var curr = HEAP8[((ptr2++)|0)];
        if (!curr) break;
        searchSet[curr] = 1;
      }
      while (1) {
        curr = HEAP8[(ptr1)];
        if (!curr) break;
        if (curr in searchSet) return ptr1;
        ptr1++;
      }
      return 0;
    }
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  var _atan2=Math.atan2;
  var ___errno=___errno_location;
  function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;
  function _signal(sig, func) {
      // TODO
      return 0;
    }
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var ___tm_struct_layout={__size__:44,tm_sec:0,tm_min:4,tm_hour:8,tm_mday:12,tm_mon:16,tm_year:20,tm_wday:24,tm_yday:28,tm_isdst:32,tm_gmtoff:36,tm_zone:40};
  var ___tm_current=allocate(4*26, "i8", ALLOC_STATIC);
  var ___tm_timezones={};
  var __tzname=allocate(8, "i32*", ALLOC_STATIC);
  var __daylight=allocate(1, "i32*", ALLOC_STATIC);
  var __timezone=allocate(1, "i32*", ALLOC_STATIC);function _tzset() {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (_tzset.called) return;
      _tzset.called = true;
      HEAP32[((__timezone)>>2)]=-(new Date()).getTimezoneOffset() * 60
      var winter = new Date(2000, 0, 1);
      var summer = new Date(2000, 6, 1);
      HEAP32[((__daylight)>>2)]=Number(winter.getTimezoneOffset() != summer.getTimezoneOffset())
      var winterName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | winter.toString().match(/\(([A-Z]+)\)/)[1];
      var summerName = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | summer.toString().match(/\(([A-Z]+)\)/)[1];
      var winterNamePtr = allocate(intArrayFromString(winterName), 'i8', ALLOC_NORMAL);
      var summerNamePtr = allocate(intArrayFromString(summerName), 'i8', ALLOC_NORMAL);
      HEAP32[((__tzname)>>2)]=winterNamePtr
      HEAP32[(((__tzname)+(4))>>2)]=summerNamePtr
    }function _localtime_r(time, tmPtr) {
      _tzset();
      var offsets = ___tm_struct_layout;
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)]=date.getSeconds()
      HEAP32[(((tmPtr)+(offsets.tm_min))>>2)]=date.getMinutes()
      HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)]=date.getHours()
      HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)]=date.getDate()
      HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)]=date.getMonth()
      HEAP32[(((tmPtr)+(offsets.tm_year))>>2)]=date.getFullYear()-1900
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=date.getDay()
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      HEAP32[(((tmPtr)+(offsets.tm_gmtoff))>>2)]=start.getTimezoneOffset() * 60
      var dst = Number(start.getTimezoneOffset() != date.getTimezoneOffset());
      HEAP32[(((tmPtr)+(offsets.tm_isdst))>>2)]=dst
      var timezone = 'GMT'; // XXX do not rely on browser timezone info, it is very unpredictable | date.toString().match(/\(([A-Z]+)\)/)[1];
      if (!(timezone in ___tm_timezones)) {
        ___tm_timezones[timezone] = allocate(intArrayFromString(timezone), 'i8', ALLOC_NORMAL);
      }
      HEAP32[(((tmPtr)+(offsets.tm_zone))>>2)]=___tm_timezones[timezone]
      return tmPtr;
    }function _localtime(time) {
      return _localtime_r(time, ___tm_current);
    }
  var ___tm_formatted=allocate(4*26, "i8", ALLOC_STATIC);
  function _mktime(tmPtr) {
      _tzset();
      var offsets = ___tm_struct_layout;
      var year = HEAP32[(((tmPtr)+(offsets.tm_year))>>2)];
      var timestamp = new Date(year >= 1900 ? year : year + 1900,
                               HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)],
                               HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)],
                               HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)],
                               HEAP32[(((tmPtr)+(offsets.tm_min))>>2)],
                               HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)],
                               0).getTime() / 1000;
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=new Date(timestamp).getDay()
      var yday = Math.round((timestamp - (new Date(year, 0, 1)).getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      return timestamp;
    }function _asctime_r(tmPtr, buf) {
      var date = new Date(_mktime(tmPtr)*1000);
      var formatted = date.toString();
      var datePart = formatted.replace(/\d{4}.*/, '').replace(/ 0/, '  ');
      var timePart = formatted.match(/\d{2}:\d{2}:\d{2}/)[0];
      formatted = datePart + timePart + ' ' + date.getFullYear() + '\n';
      formatted.split('').forEach(function(chr, index) {
        HEAP8[(((buf)+(index))|0)]=chr.charCodeAt(0)
      });
      HEAP8[(((buf)+(25))|0)]=0
      return buf;
    }function _asctime(tmPtr) {
      return _asctime_r(tmPtr, ___tm_formatted);
    }function _ctime(timer) {
      return _asctime(_localtime(timer));
    }
  var _llvm_va_start=undefined;
  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _rename(old, new_) {
      // int rename(const char *old, const char *new);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rename.html
      var oldObj = FS.analyzePath(Pointer_stringify(old));
      var newObj = FS.analyzePath(Pointer_stringify(new_));
      if (newObj.path == oldObj.path) {
        return 0;
      } else if (!oldObj.exists) {
        ___setErrNo(oldObj.error);
        return -1;
      } else if (oldObj.isRoot || oldObj.path == FS.currentPath) {
        ___setErrNo(ERRNO_CODES.EBUSY);
        return -1;
      } else if (newObj.parentPath &&
                 newObj.parentPath.indexOf(oldObj.path) == 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else if (newObj.exists && newObj.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else {
        delete oldObj.parentObject.contents[oldObj.name];
        newObj.parentObject.contents[newObj.name] = oldObj.object;
        return 0;
      }
    }
  function _strftime(s, maxsize, format, timeptr) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      // TODO: Implement.
      return 0;
    }
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var comparator = function(x, y) {
        return Runtime.dynCall('iii', cmp, [x, y]);
      }
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return comparator(base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  function _opendir(dirname) {
      // DIR *opendir(const char *dirname);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/opendir.html
      // NOTE: Calculating absolute path redundantly since we need to associate it
      //       with the opened stream.
      var path = FS.absolutePath(Pointer_stringify(dirname));
      if (path === null) {
        ___setErrNo(ERRNO_CODES.ENOENT);
        return 0;
      }
      var target = FS.findObject(path);
      if (target === null) return 0;
      if (!target.isFolder) {
        ___setErrNo(ERRNO_CODES.ENOTDIR);
        return 0;
      } else if (!target.read) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return 0;
      }
      var contents = [];
      for (var key in target.contents) contents.push(key);
      var id = FS.createFileHandle({
        path: path,
        object: target,
        // An index into contents. Special values: -2 is ".", -1 is "..".
        position: -2,
        isRead: true,
        isWrite: false,
        isAppend: false,
        error: false,
        eof: false,
        ungotten: [],
        // Folder-specific properties:
        // Remember the contents at the time of opening in an array, so we can
        // seek between them relying on a single order.
        contents: contents,
        // Each stream has its own area for readdir() returns.
        currentEntry: _malloc(___dirent_struct_layout.__size__)
      });
      return id;
    }
  function _readdir_r(dirp, entry, result) {
      // int readdir_r(DIR *dirp, struct dirent *entry, struct dirent **result);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      }
      var stream = FS.streams[dirp];
      var loc = stream.position;
      var entries = 0;
      for (var key in stream.contents) entries++;
      if (loc < -2 || loc >= entries) {
        HEAP32[((result)>>2)]=0
      } else {
        var name, inode, type;
        if (loc === -2) {
          name = '.';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else if (loc === -1) {
          name = '..';
          inode = 1;  // Really undefined.
          type = 4; //DT_DIR
        } else {
          var object;
          name = stream.contents[loc];
          object = stream.object.contents[name];
          inode = object.inodeNumber;
          type = object.isDevice ? 2 // DT_CHR, character device.
                : object.isFolder ? 4 // DT_DIR, directory.
                : object.link !== undefined ? 10 // DT_LNK, symbolic link.
                : 8; // DT_REG, regular file.
        }
        stream.position++;
        var offsets = ___dirent_struct_layout;
        HEAP32[(((entry)+(offsets.d_ino))>>2)]=inode
        HEAP32[(((entry)+(offsets.d_off))>>2)]=stream.position
        HEAP32[(((entry)+(offsets.d_reclen))>>2)]=name.length + 1
        for (var i = 0; i < name.length; i++) {
          HEAP8[(((entry + offsets.d_name)+(i))|0)]=name.charCodeAt(i)
        }
        HEAP8[(((entry + offsets.d_name)+(i))|0)]=0
        HEAP8[(((entry)+(offsets.d_type))|0)]=type
        HEAP32[((result)>>2)]=entry
      }
      return 0;
    }function _readdir(dirp) {
      // struct dirent *readdir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/readdir_r.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      } else {
        if (!_readdir.result) _readdir.result = _malloc(4);
        _readdir_r(dirp, FS.streams[dirp].currentEntry, _readdir.result);
        if (HEAP32[((_readdir.result)>>2)] === 0) {
          return 0;
        } else {
          return FS.streams[dirp].currentEntry;
        }
      }
    }
  function _closedir(dirp) {
      // int closedir(DIR *dirp);
      // http://pubs.opengroup.org/onlinepubs/007908799/xsh/closedir.html
      if (!FS.streams[dirp] || !FS.streams[dirp].object.isFolder) {
        return ___setErrNo(ERRNO_CODES.EBADF);
      } else {
        _free(FS.streams[dirp].currentEntry);
        FS.streams[dirp] = null;
        return 0;
      }
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      if (FS.streams[stream]) {
        c = unSign(c & 0xFF);
        FS.streams[stream].ungotten.push(c);
        return c;
      } else {
        return -1;
      }
    }
  function _fmod(x, y) {
      return x % y;
    }
  function _gmtime_r(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      var offsets = ___tm_struct_layout;
      HEAP32[(((tmPtr)+(offsets.tm_sec))>>2)]=date.getUTCSeconds()
      HEAP32[(((tmPtr)+(offsets.tm_min))>>2)]=date.getUTCMinutes()
      HEAP32[(((tmPtr)+(offsets.tm_hour))>>2)]=date.getUTCHours()
      HEAP32[(((tmPtr)+(offsets.tm_mday))>>2)]=date.getUTCDate()
      HEAP32[(((tmPtr)+(offsets.tm_mon))>>2)]=date.getUTCMonth()
      HEAP32[(((tmPtr)+(offsets.tm_year))>>2)]=date.getUTCFullYear()-1900
      HEAP32[(((tmPtr)+(offsets.tm_wday))>>2)]=date.getUTCDay()
      HEAP32[(((tmPtr)+(offsets.tm_gmtoff))>>2)]=0
      HEAP32[(((tmPtr)+(offsets.tm_isdst))>>2)]=0
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = Math.round((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      HEAP32[(((tmPtr)+(offsets.tm_yday))>>2)]=yday
      var timezone = "GMT";
      if (!(timezone in ___tm_timezones)) {
        ___tm_timezones[timezone] = allocate(intArrayFromString(timezone), 'i8', ALLOC_NORMAL);
      }
      HEAP32[(((tmPtr)+(offsets.tm_zone))>>2)]=___tm_timezones[timezone]
      return tmPtr;
    }function _gmtime(time) {
      return _gmtime_r(time, ___tm_current);
    }
  function _setvbuf(stream, buf, type, size) {
      // int setvbuf(FILE *restrict stream, char *restrict buf, int type, size_t size);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/setvbuf.html
      // TODO: Implement custom buffering.
      return 0;
    }function _setbuf(stream, buf) {
      // void setbuf(FILE *restrict stream, char *restrict buf);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/setbuf.html
      if (buf) _setvbuf(stream, buf, 0, 8192);  // _IOFBF, BUFSIZ.
      else _setvbuf(stream, buf, 2, 8192);  // _IONBF, BUFSIZ.
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }
  function _isatty(fildes) {
      // int isatty(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/isatty.html
      if (!FS.streams[fildes]) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      if (FS.streams[fildes].isTerminal) return 1;
      ___setErrNo(ERRNO_CODES.ENOTTY);
      return 0;
    }
  var ___utsname_struct_layout={__size__:160,sysname:0,nodename:32,release:64,version:96,machine:128};function _uname(name) {
      // int uname(struct utsname *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/uname.html
      function copyString(element, value) {
        var offset = ___utsname_struct_layout[element];
        for (var i = 0; i < value.length; i++) {
          HEAP8[(((name)+(offset + i))|0)]=value.charCodeAt(i)
        }
        HEAP8[(((name)+(offset + i))|0)]=0
      }
      if (name === 0) {
        return -1;
      } else {
        copyString('sysname', 'Emscripten');
        copyString('nodename', 'emscripten');
        copyString('release', '1.0');
        copyString('version', '#1');
        copyString('machine', 'x86-JS');
        return 0;
      }
    }
  function _nl_langinfo(item) {
      // char *nl_langinfo(nl_item item);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/nl_langinfo.html
      var result;
      switch (item) {
        case 0:
          result = 'ANSI_X3.4-1968';
          break;
        case 1:
          result = '%a %b %e %H:%M:%S %Y';
          break;
        case 2:
          result = '%m/%d/%y';
          break;
        case 3:
          result = '%H:%M:%S';
          break;
        case 4:
          result = '%I:%M:%S %p';
          break;
        case 5:
          result = 'AM';
          break;
        case 6:
          result = 'PM';
          break;
        case 7:
          result = 'Sunday';
          break;
        case 8:
          result = 'Monday';
          break;
        case 9:
          result = 'Tuesday';
          break;
        case 10:
          result = 'Wednesday';
          break;
        case 11:
          result = 'Thursday';
          break;
        case 12:
          result = 'Friday';
          break;
        case 13:
          result = 'Saturday';
          break;
        case 14:
          result = 'Sun';
          break;
        case 15:
          result = 'Mon';
          break;
        case 16:
          result = 'Tue';
          break;
        case 17:
          result = 'Wed';
          break;
        case 18:
          result = 'Thu';
          break;
        case 19:
          result = 'Fri';
          break;
        case 20:
          result = 'Sat';
          break;
        case 21:
          result = 'January';
          break;
        case 22:
          result = 'February';
          break;
        case 23:
          result = 'March';
          break;
        case 24:
          result = 'April';
          break;
        case 25:
          result = 'May';
          break;
        case 26:
          result = 'June';
          break;
        case 27:
          result = 'July';
          break;
        case 28:
          result = 'August';
          break;
        case 29:
          result = 'September';
          break;
        case 30:
          result = 'October';
          break;
        case 31:
          result = 'November';
          break;
        case 32:
          result = 'December';
          break;
        case 33:
          result = 'Jan';
          break;
        case 34:
          result = 'Feb';
          break;
        case 35:
          result = 'Mar';
          break;
        case 36:
          result = 'Apr';
          break;
        case 37:
          result = 'May';
          break;
        case 38:
          result = 'Jun';
          break;
        case 39:
          result = 'Jul';
          break;
        case 40:
          result = 'Aug';
          break;
        case 41:
          result = 'Sep';
          break;
        case 42:
          result = 'Oct';
          break;
        case 43:
          result = 'Nov';
          break;
        case 44:
          result = 'Dec';
          break;
        case 49:
          result = '';
          break;
        case 50:
          result = '.';
          break;
        case 51:
          result = '';
          break;
        case 52:
          result = '^[yY]';
          break;
        case 53:
          result = '^[nN]';
          break;
        case 56:
          result = '-';
          break;
        case 45:
        case 46:
        case 47:
        case 48:
        default:
          result = '';
          break;
      }
      var me = _nl_langinfo;
      if (!me.ret) me.ret = _malloc(32);
      for (var i = 0; i < result.length; i++) {
        HEAP8[(((me.ret)+(i))|0)]=result.charCodeAt(i)
      }
      HEAP8[(((me.ret)+(i))|0)]=0
      return me.ret;
    }
  function _iconv_open() {
  Module['printErr']('missing function: iconv_open'); abort(-1);
  }
  function _iconv() {
  Module['printErr']('missing function: iconv'); abort(-1);
  }
  function _iconv_close() {
  Module['printErr']('missing function: iconv_close'); abort(-1);
  }
  function _localeconv() {
      // %struct.timeval = type { char* decimal point, other stuff... }
      // var indexes = Runtime.calculateStructAlignment({ fields: ['i32', 'i32'] });
      var me = _localeconv;
      if (!me.ret) {
        me.ret = allocate([allocate(intArrayFromString('.'), 'i8', ALLOC_NORMAL)], 'i8*', ALLOC_NORMAL); // just decimal point, for now
      }
      return me.ret;
    }
  function _isprint(chr) {
      return 0x1F < chr && chr < 0x7F;
    }
  function _erfc(x) {
      var MATH_TOLERANCE = 1E-12;
      var ONE_SQRTPI = 0.564189583547756287;
      var a = 1;
      var b = x;
      var c = x;
      var d = x * x + 0.5;
      var n = 1.0;
      var q2 = b / d;
      var q1, t;
      if (Math.abs(x) < 2.2) {
        return 1.0 - _erf(x);
      }
      if (x < 0) {
        return 2.0 - _erfc(-x);
      }
      do {
        t = a * n + b * x;
        a = b;
        b = t;
        t = c * n + d * x;
        c = d;
        d = t;
        n += 0.5;
        q1 = q2;
        q2 = b / d;
      } while (Math.abs(q1 - q2) / q2 > MATH_TOLERANCE);
      return (ONE_SQRTPI * Math.exp(- x * x) * q2);
    }function _erf(x) {
      var MATH_TOLERANCE = 1E-12;
      var TWO_SQRTPI = 1.128379167095512574;
      var sum = x;
      var term = x;
      var xsqr = x*x;
      var j = 1;
      if (Math.abs(x) > 2.2) {
        return 1.0 - _erfc(x);
      }
      do {
        term *= xsqr / j;
        sum -= term / (2 * j + 1);
        ++j;
        term *= xsqr / j;
        sum += term / (2 * j + 1);
        ++j;
      } while (Math.abs(term / sum) > MATH_TOLERANCE);
      return (TWO_SQRTPI * sum);
    }
  function _lgamma() {
  Module['printErr']('missing function: lgamma'); abort(-1);
  }
  function ___signgam() {
  Module['printErr']('missing function: __signgam'); abort(-1);
  }
  function _modf(x, intpart) {
      HEAPF64[((intpart)>>3)]=Math.floor(x)
      return x - HEAPF64[((intpart)>>3)];
    }
  function _cosh(x) {
      var p = Math.pow(Math.E, x);
      return (p + (1 / p)) / 2;
    }
  function _sinh(x) {
      var p = Math.pow(Math.E, x);
      return (p - (1 / p)) / 2;
    }
  var _tan=Math.tan;
  var _asin=Math.asin;
  var _acos=Math.acos;
  var _atan=Math.atan;
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      _memcpy(newStr, ptr, len);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var _llvm_memset_p0i8_i64=_memset;
  var _llvm_memcpy_p0i8_p0i8_i64=_memcpy;
  function _llvm_trap() {
      throw 'trap! ' + new Error().stack;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
___buildEnvironment(ENV);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viffiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viffiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vf(index,a1) {
  try {
    Module["dynCall_vf"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iff(index,a1,a2) {
  try {
    return Module["dynCall_iff"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vifiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_vifiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fii(index,a1,a2) {
  try {
    return Module["dynCall_fii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=env._stdout|0;var o=env._stdin|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ab=env.abort;var ac=env.assert;var ad=env.asmPrintInt;var ae=env.asmPrintFloat;var af=env.copyTempDouble;var ag=env.copyTempFloat;var ah=env.min;var ai=env.invoke_viiiii;var aj=env.invoke_viffiii;var ak=env.invoke_vf;var al=env.invoke_i;var am=env.invoke_vi;var an=env.invoke_vii;var ao=env.invoke_ii;var ap=env.invoke_iff;var aq=env.invoke_iiii;var ar=env.invoke_viii;var as=env.invoke_v;var at=env.invoke_vifiii;var au=env.invoke_iiiii;var av=env.invoke_fii;var aw=env.invoke_iii;var ax=env._lseek;var ay=env.__scanString;var az=env._fclose;var aA=env._uname;var aB=env.__isFloat;var aC=env._fflush;var aD=env._strtol;var aE=env._fputc;var aF=env._iconv;var aG=env.___signgam;var aH=env._fwrite;var aI=env._send;var aJ=env._fputs;var aK=env._tmpnam;var aL=env._isspace;var aM=env._localtime;var aN=env._read;var aO=env._ceil;var aP=env._strstr;var aQ=env._fileno;var aR=env._perror;var aS=env._ctime;var aT=env._fsync;var aU=env._signal;var aV=env._opendir;var aW=env._fmod;var aX=env._strcmp;var aY=env._memchr;var aZ=env._strncmp;var a_=env._tmpfile;var a$=env._snprintf;var a0=env._fgetc;var a1=env._pclose;var a2=env._readdir;var a3=env._cosh;var a4=env._atexit;var a5=env._fgets;var a6=env._close;var a7=env._strchr;var a8=env._asin;var a9=env._llvm_lifetime_start;var ba=env.___setErrNo;var bb=env._ftell;var bc=env._exit;var bd=env._sprintf;var be=env._llvm_lifetime_end;var bf=env._asctime;var bg=env._strrchr;var bh=env._iconv_open;var bi=env._modf;var bj=env._strcspn;var bk=env._getcwd;var bl=env._gmtime;var bm=env._localtime_r;var bn=env._asctime_r;var bo=env._recv;var bp=env._cos;var bq=env._putchar;var br=env._isalnum;var bs=env._popen;var bt=env._erfc;var bu=env.__exit;var bv=env._strftime;var bw=env._llvm_va_end;var bx=env._tzset;var by=env._sinh;var bz=env._setlocale;var bA=env._isprint;var bB=env._toupper;var bC=env._printf;var bD=env._pread;var bE=env._fopen;var bF=env._open;var bG=env._usleep;var bH=env._log;var bI=env._puts;var bJ=env._mktime;var bK=env._fdopen;var bL=env._qsort;var bM=env._system;var bN=env._isalpha;var bO=env._strdup;var bP=env._log10;var bQ=env._closedir;var bR=env._isatty;var bS=env.__formatString;var bT=env._getenv;var bU=env._gettimeofday;var bV=env._atoi;var bW=env._vfprintf;var bX=env._chdir;var bY=env._llvm_pow_f64;var bZ=env._sbrk;var b_=env._localeconv;var b$=env.___errno_location;var b0=env._strerror;var b1=env._lgamma;var b2=env._erf;var b3=env._strspn;var b4=env.__parseInt;var b5=env._ungetc;var b6=env._llvm_trap;var b7=env._rename;var b8=env._vsnprintf;var b9=env._sscanf;var ca=env._sysconf;var cb=env._acos;var cc=env._fread;var cd=env._abort;var ce=env._fprintf;var cf=env.___fpclassifyf;var cg=env._tan;var ch=env.___buildEnvironment;var ci=env._feof;var cj=env._strncat;var ck=env._gmtime_r;var cl=env._fabs;var cm=env._floor;var cn=env.__reallyNegative;var co=env._fseek;var cp=env._sqrt;var cq=env._write;var cr=env._rewind;var cs=env._sin;var ct=env._stat;var cu=env._longjmp;var cv=env._atan;var cw=env._readdir_r;var cx=env._strpbrk;var cy=env._iconv_close;var cz=env._setbuf;var cA=env._nl_langinfo;var cB=env._pwrite;var cC=env._strerror_r;var cD=env._atan2;var cE=env._exp;var cF=env._time;var cG=env._setvbuf;
// EMSCRIPTEN_START_FUNCS
// EMSCRIPTEN_END_FUNCS
var cH=[rR,rR,p0,rR,nV,rR,p4,rR,oH,rR,pq,rR,pF,rR,pI,rR,ok,rR,pZ,rR,ni,rR,n1,rR,ph,rR,nC,rR,o_,rR,mW,rR,oG,rR,nz,rR,lC,rR,mp,rR,l5,rR,nS,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR,rR];var cI=[rS,rS,mP,rS,oq,rS,l2,rS,n2,rS,nf,rS,lG,rS,rS,rS];var cJ=[rT,rT,p1,rT,nU,rT,nj,rT,lB,rT,pH,rT,lz,rT,ol,rT,nh,rT,pJ,rT,nr,rT,mr,rT,p$,rT,l1,rT,l6,rT,nB,rT,nX,rT,mn,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT,rT];var cK=[rU,rU,hx,rU,rm,rU,dH,rU];var cL=[rV,rV,g4,rV,hc,rV,iO,rV,hf,rV,kt,rV,of,rV,oM,rV,ma,rV,mG,rV,e$,rV,oL,rV,oX,rV,kO,rV,hb,rV,kG,rV,kg,rV,k6,rV,fe,rV,nk,rV,l7,rV,kD,rV,kA,rV,kr,rV,kE,rV,kF,rV,g0,rV,gX,rV,kL,rV,km,rV,nG,rV,kd,rV,g5,rV,eY,rV,n5,rV,mb,rV,kW,rV,lO,rV,iM,rV,q3,rV,eE,rV,lE,rV,gW,rV,kR,rV,kw,rV,kT,rV,hi,rV,eH,rV,kH,rV,kQ,rV,gY,rV,gJ,rV,kP,rV,kB,rV,e4,rV,pe,rV,lA,rV,mT,rV,o0,rV,dK,rV,ku,rV,kh,rV,oD,rV,kX,rV,ki,rV,nQ,rV,g$,rV,gL,rV,gV,rV,eI,rV,pn,rV,p2,rV,ky,rV,kf,rV,gI,rV,k4,rV,g_,rV,oi,rV,g8,rV,e6,rV,ke,rV,pW,rV,pC,rV,gZ,rV,g6,rV,gM,rV,pK,rV,g3,rV,lZ,rV,kk,rV,m8,rV,gO,rV,kY,rV,kZ,rV,ot,rV,mj,rV,gR,rV,eZ,rV,ha,rV,eV,rV,gH,rV,kp,rV,g1,rV,hd,rV,kx,rV,gU,rV,k2,rV,n4,rV,eJ,rV,oo,rV,e_,rV,gF,rV,kj,rV,k0,rV,jH,rV,kC,rV,eF,rV,he,rV,gQ,rV,n_,rV,gD,rV,oJ,rV,g7,rV,mt,rV,k$,rV,k_,rV,k5,rV,kI,rV,gT,rV,kl,rV,gG,rV,gE,rV,kN,rV,mQ,rV,gN,rV,gK,rV,kK,rV,gP,rV,gS,rV,kS,rV,hh,rV,k7,rV,k1,rV,kJ,rV,hg,rV,g2,rV,ks,rV,rn,rV,ou,rV,eG,rV,nE,rV,kM,rV,kv,rV,g9,rV,gC,rV,kn,rV,k3,rV,ko,rV,nx,rV,kz,rV,n3,rV,lQ,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV,rV];var cM=[rW,rW,pV,rW,n$,rW,nw,rW,op,rW,mS,rW,nO,rW,pv,rW,m6,rW,o1,rW,mh,rW,mE,rW,m7,rW,mz,rW,lN,rW,pw,rW,oe,rW,nl,rW,oW,rW,pU,rW,od,rW,qm,rW,qv,rW,ro,rW,oV,rW,l8,rW,m_,rW,mi,rW,pd,rW,p3,rW,nP,rW,pL,rW,nv,rW,m$,rW,mA,rW,lY,rW,pc,rW,oz,rW,oy,rW,o8,rW,pm,rW,my,rW,lX,rW,nF,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW,rW];var cN=[rX,rX,e5,rX,mR,rX,nY,rX,h1,rX,rp,rX,l$,rX,il,rX,nJ,rX,oC,rX,h9,rX,lU,rX,m9,rX,p_,rX,h3,rX,om,rX,ic,rX,ii,rX,o$,rX,lt,rX,mk,rX,pz,rX,ia,rX,nd,rX,q2,rX,rq,rX,l4,rX,h7,rX,pG,rX,o7,rX,ml,rX,py,rX,hO,rX,id,rX,nq,rX,h4,rX,nT,rX,ib,rX,rr,rX,oN,rX,nD,rX,h8,rX,rs,rX,h5,rX,mo,rX,rt,rX,oa,rX,pO,rX,oB,rX,oO,rX,h2,rX,hW,rX,lu,rX,qj,rX,o4,rX,n9,rX,ij,rX,l0,rX,mC,rX,pP,rX,oj,rX,mD,rX,ih,rX,nK,rX,h6,rX,np,rX,ik,rX,h0,rX,pA,rX,ng,rX,h$,rX,na,rX,pN,rX,ms,rX,mO,rX,ie,rX,o6,rX,o5,rX,ig,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX,rX];var cO=[rY,rY,ls,rY];var cP=[rZ,rZ,rx,rZ,ry,rZ,rZ,rZ];var cQ=[r_,r_,qQ,r_,lK,r_,qc,r_,o3,r_,oZ,r_,oK,r_,mm,r_,pD,r_,pE,r_,mH,r_,mU,r_,qB,r_,pX,r_,pp,r_,oF,r_,mq,r_,lw,r_,m0,r_,oY,r_,og,r_,l3,r_,nc,r_,qs,r_,hv,r_,pg,r_,qg,r_,lP,r_,oE,r_,pY,r_,nA,r_,nb,r_,mV,r_,po,r_,ny,r_,nR,r_,nW,r_,l_,r_,oh,r_,qr,r_,pf,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_,r_];var cR=[r$,r$,mf,r$,n7,r$,dQ,r$,oQ,r$,lR,r$,nZ,r$,ed,r$,ea,r$,mB,r$,eh,r$,mX,r$,dW,r$,m4,r$,n8,r$,d8,r$,jx,r$,mL,r$,nI,r$,dG,r$,pT,r$,d2,r$,mw,r$,er,r$,ox,r$,pQ,r$,nn,r$,or,r$,mF,r$,mZ,r$,o9,r$,pl,r$,dU,r$,mc,r$,lD,r$,pS,r$,pi,r$,d0,r$,pa,r$,eq,r$,ps,r$,eg,r$,n0,r$,qI,r$,mv,r$,fc,r$,du,r$,ds,r$,nM,r$,lS,r$,me,r$,pj,r$,ob,r$,nN,r$,d$,r$,md,r$,ep,r$,pb,r$,on,r$,mY,r$,em,r$,oI,r$,oA,r$,lM,r$,pt,r$,qG,r$,mK,r$,ew,r$,ef,r$,ln,r$,oc,r$,dZ,r$,lT,r$,o2,r$,dP,r$,dY,r$,nm,r$,d5,r$,oR,r$,mI,r$,m2,r$,pu,r$,mN,r$,dv,r$,ns,r$,eb,r$,ei,r$,mJ,r$,dM,r$,pM,r$,jn,r$,nL,r$,oU,r$,mu,r$,lL,r$,m1,r$,no,r$,mx,r$,pR,r$,pr,r$,nu,r$,ne,r$,oS,r$,dV,r$,m5,r$,dX,r$,lH,r$,ej,r$,pk,r$,d4,r$,dD,r$,el,r$,oT,r$,ov,r$,ee,r$,ek,r$,ec,r$,d3,r$,lV,r$,l9,r$,nH,r$,mM,r$,dF,r$,d1,r$,px,r$,oP,r$,m3,r$,d6,r$,pB,r$,dR,r$,iJ,r$,dr,r$,d_,r$,gj,r$,d7,r$,n6,r$,ow,r$,mg,r$,nt,r$,os,r$,lW,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$,r$];var cS=[r0,r0,f5,r0,f6,r0,fI,r0,dB,r0,fG,r0,fH,r0,dh,r0];var cT=[r1,r1,rz,r1,rA,r1,r1,r1];var cU=[r2,r2,rB,r2,q8,r2,r2,r2];var cV=[r3,r3,lq,r3,k9,r3,gn,r3,ru,r3,f4,r3,go,r3,i1,r3,hl,r3,hz,r3,iU,r3,q$,r3,rv,r3,ra,r3,f3,r3,rw,r3,gk,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3,r3];return{_testSetjmp:rl,_saveSetjmp:rk,_strcat:rb,_free:q3,_main:iL,_memcmp:rf,_strncpy:re,_memmove:rg,_tolower:rh,_memset:rd,_malloc:q2,_memcpy:rc,_strlen:q9,_strcasecmp:rj,_realloc:q4,_strncasecmp:ri,_strcpy:ra,stackAlloc:cW,stackSave:cX,stackRestore:cY,setThrew:cZ,setTempRet0:c_,setTempRet1:c$,setTempRet2:c0,setTempRet3:c1,setTempRet4:c2,setTempRet5:c3,setTempRet6:c4,setTempRet7:c5,setTempRet8:c6,setTempRet9:c7,dynCall_viiiii:rC,dynCall_viffiii:rD,dynCall_vf:rE,dynCall_i:rF,dynCall_vi:rG,dynCall_vii:rH,dynCall_ii:rI,dynCall_iff:rJ,dynCall_iiii:rK,dynCall_viii:rL,dynCall_v:rM,dynCall_vifiii:rN,dynCall_iiiii:rO,dynCall_fii:rP,dynCall_iii:rQ}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "copyTempDouble": copyTempDouble, "copyTempFloat": copyTempFloat, "min": Math_min, "invoke_viiiii": invoke_viiiii, "invoke_viffiii": invoke_viffiii, "invoke_vf": invoke_vf, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_iff": invoke_iff, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_vifiii": invoke_vifiii, "invoke_iiiii": invoke_iiiii, "invoke_fii": invoke_fii, "invoke_iii": invoke_iii, "_lseek": _lseek, "__scanString": __scanString, "_fclose": _fclose, "_uname": _uname, "__isFloat": __isFloat, "_fflush": _fflush, "_strtol": _strtol, "_fputc": _fputc, "_iconv": _iconv, "___signgam": ___signgam, "_fwrite": _fwrite, "_send": _send, "_fputs": _fputs, "_tmpnam": _tmpnam, "_isspace": _isspace, "_localtime": _localtime, "_read": _read, "_ceil": _ceil, "_strstr": _strstr, "_fileno": _fileno, "_perror": _perror, "_ctime": _ctime, "_fsync": _fsync, "_signal": _signal, "_opendir": _opendir, "_fmod": _fmod, "_strcmp": _strcmp, "_memchr": _memchr, "_strncmp": _strncmp, "_tmpfile": _tmpfile, "_snprintf": _snprintf, "_fgetc": _fgetc, "_pclose": _pclose, "_readdir": _readdir, "_cosh": _cosh, "_atexit": _atexit, "_fgets": _fgets, "_close": _close, "_strchr": _strchr, "_asin": _asin, "_llvm_lifetime_start": _llvm_lifetime_start, "___setErrNo": ___setErrNo, "_ftell": _ftell, "_exit": _exit, "_sprintf": _sprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_asctime": _asctime, "_strrchr": _strrchr, "_iconv_open": _iconv_open, "_modf": _modf, "_strcspn": _strcspn, "_getcwd": _getcwd, "_gmtime": _gmtime, "_localtime_r": _localtime_r, "_asctime_r": _asctime_r, "_recv": _recv, "_cos": _cos, "_putchar": _putchar, "_isalnum": _isalnum, "_popen": _popen, "_erfc": _erfc, "__exit": __exit, "_strftime": _strftime, "_llvm_va_end": _llvm_va_end, "_tzset": _tzset, "_sinh": _sinh, "_setlocale": _setlocale, "_isprint": _isprint, "_toupper": _toupper, "_printf": _printf, "_pread": _pread, "_fopen": _fopen, "_open": _open, "_usleep": _usleep, "_log": _log, "_puts": _puts, "_mktime": _mktime, "_fdopen": _fdopen, "_qsort": _qsort, "_system": _system, "_isalpha": _isalpha, "_strdup": _strdup, "_log10": _log10, "_closedir": _closedir, "_isatty": _isatty, "__formatString": __formatString, "_getenv": _getenv, "_gettimeofday": _gettimeofday, "_atoi": _atoi, "_vfprintf": _vfprintf, "_chdir": _chdir, "_llvm_pow_f64": _llvm_pow_f64, "_sbrk": _sbrk, "_localeconv": _localeconv, "___errno_location": ___errno_location, "_strerror": _strerror, "_lgamma": _lgamma, "_erf": _erf, "_strspn": _strspn, "__parseInt": __parseInt, "_ungetc": _ungetc, "_llvm_trap": _llvm_trap, "_rename": _rename, "_vsnprintf": _vsnprintf, "_sscanf": _sscanf, "_sysconf": _sysconf, "_acos": _acos, "_fread": _fread, "_abort": _abort, "_fprintf": _fprintf, "___fpclassifyf": ___fpclassifyf, "_tan": _tan, "___buildEnvironment": ___buildEnvironment, "_feof": _feof, "_strncat": _strncat, "_gmtime_r": _gmtime_r, "_fabs": _fabs, "_floor": _floor, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "_sqrt": _sqrt, "_write": _write, "_rewind": _rewind, "_sin": _sin, "_stat": _stat, "_longjmp": _longjmp, "_atan": _atan, "_readdir_r": _readdir_r, "_strpbrk": _strpbrk, "_iconv_close": _iconv_close, "_setbuf": _setbuf, "_nl_langinfo": _nl_langinfo, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_atan2": _atan2, "_exp": _exp, "_time": _time, "_setvbuf": _setvbuf, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_stdout": _stdout, "_stdin": _stdin }, buffer);
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _strcat = Module["_strcat"] = asm["_strcat"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _strcasecmp = Module["_strcasecmp"] = asm["_strcasecmp"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _strncasecmp = Module["_strncasecmp"] = asm["_strncasecmp"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_viffiii = Module["dynCall_viffiii"] = asm["dynCall_viffiii"];
var dynCall_vf = Module["dynCall_vf"] = asm["dynCall_vf"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iff = Module["dynCall_iff"] = asm["dynCall_iff"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_vifiii = Module["dynCall_vifiii"] = asm["dynCall_vifiii"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_fii = Module["dynCall_fii"] = asm["dynCall_fii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = false;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
    shouldRunNow = true;
    self['Runtime'] = Runtime;
    self['FS'] = FS;
};
gnuplot_create();
// This is to avoid name mangling from closure compilers 
self['FS'] = FS;
self['FS']['root'] = FS.root;
self['FS']['deleteFile'] = FS.deleteFile;
self['FS']['findObject'] = FS.findObject;
self['FS']['createDataFile'] = FS.createDataFile;
self['FS']['getFileContents'] = function(name) {
    var file = FS.findObject(name);
    if (!file) return null;
    return file.contents;
};