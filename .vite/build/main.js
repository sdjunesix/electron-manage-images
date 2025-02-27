"use strict";
const require$$3$1 = require("electron");
const path$4 = require("node:path");
const require$$3 = require("fs");
const require$$0$1 = require("path");
const require$$1$1 = require("child_process");
const require$$0 = require("tty");
const require$$1 = require("util");
const require$$4 = require("net");
const require$$0$2 = require("crypto");
const require$$9 = require("events");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var src = { exports: {} };
var browser = { exports: {} };
var debug$1 = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isNaN(val) === false) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match2 = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match2) {
      return;
    }
    var n = parseFloat(match2[1]);
    var type = (match2[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    if (ms2 >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (ms2 >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (ms2 >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (ms2 >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    return plural(ms2, d, "day") || plural(ms2, h, "hour") || plural(ms2, m, "minute") || plural(ms2, s, "second") || ms2 + " ms";
  }
  function plural(ms2, n, name) {
    if (ms2 < n) {
      return;
    }
    if (ms2 < n * 1.5) {
      return Math.floor(ms2 / n) + " " + name;
    }
    return Math.ceil(ms2 / n) + " " + name + "s";
  }
  return ms;
}
var hasRequiredDebug;
function requireDebug() {
  if (hasRequiredDebug) return debug$1.exports;
  hasRequiredDebug = 1;
  (function(module, exports) {
    exports = module.exports = createDebug.debug = createDebug["default"] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = requireMs();
    exports.names = [];
    exports.skips = [];
    exports.formatters = {};
    var prevTime;
    function selectColor(namespace) {
      var hash = 0, i;
      for (i in namespace) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    function createDebug(namespace) {
      function debug2() {
        if (!debug2.enabled) return;
        var self2 = debug2;
        var curr = +/* @__PURE__ */ new Date();
        var ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        args[0] = exports.coerce(args[0]);
        if ("string" !== typeof args[0]) {
          args.unshift("%O");
        }
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match2, format) {
          if (match2 === "%%") return match2;
          index++;
          var formatter = exports.formatters[format];
          if ("function" === typeof formatter) {
            var val = args[index];
            match2 = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match2;
        });
        exports.formatArgs.call(self2, args);
        var logFn = debug2.log || exports.log || console.log.bind(console);
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.enabled = exports.enabled(namespace);
      debug2.useColors = exports.useColors();
      debug2.color = selectColor(namespace);
      if ("function" === typeof exports.init) {
        exports.init(debug2);
      }
      return debug2;
    }
    function enable(namespaces) {
      exports.save(namespaces);
      exports.names = [];
      exports.skips = [];
      var split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      var len = split.length;
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue;
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
        } else {
          exports.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      exports.enable("");
    }
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
  })(debug$1, debug$1.exports);
  return debug$1.exports;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports) {
    exports = module.exports = requireDebug();
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage();
    exports.colors = [
      "lightseagreen",
      "forestgreen",
      "goldenrod",
      "dodgerblue",
      "darkorchid",
      "crimson"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && window.process.type === "renderer") {
        return true;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return "[UnexpectedJSONParseError]: " + err.message;
      }
    };
    function formatArgs(args) {
      var useColors2 = this.useColors;
      args[0] = (useColors2 ? "%c" : "") + this.namespace + (useColors2 ? " %c" : " ") + args[0] + (useColors2 ? "%c " : " ") + "+" + exports.humanize(this.diff);
      if (!useColors2) return;
      var c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match2) {
        if ("%%" === match2) return;
        index++;
        if ("%c" === match2) {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    function log() {
      return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments);
    }
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem("debug");
        } else {
          exports.storage.debug = namespaces;
        }
      } catch (e) {
      }
    }
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch (e) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    exports.enable(load());
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {
      }
    }
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports) {
    var tty = require$$0;
    var util2 = require$$1;
    exports = module.exports = requireDebug();
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.colors = [6, 2, 3, 4, 5, 1];
    exports.inspectOpts = Object.keys(process.env).filter(function(key) {
      return /^debug_/i.test(key);
    }).reduce(function(obj, key) {
      var prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, function(_2, k) {
        return k.toUpperCase();
      });
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === "null") val = null;
      else val = Number(val);
      obj[prop] = val;
      return obj;
    }, {});
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    if (1 !== fd && 2 !== fd) {
      util2.deprecate(function() {
      }, "except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)")();
    }
    var stream = 1 === fd ? process.stdout : 2 === fd ? process.stderr : createWritableStdioStream(fd);
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(fd);
    }
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map(function(str) {
        return str.trim();
      }).join(" ");
    };
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
    function formatArgs(args) {
      var name = this.namespace;
      var useColors2 = this.useColors;
      if (useColors2) {
        var c = this.color;
        var prefix = "  \x1B[3" + c + ";1m" + name + " \x1B[0m";
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push("\x1B[3" + c + "m+" + exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = (/* @__PURE__ */ new Date()).toUTCString() + " " + name + " " + args[0];
      }
    }
    function log() {
      return stream.write(util2.format.apply(util2, arguments) + "\n");
    }
    function save(namespaces) {
      if (null == namespaces) {
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function createWritableStdioStream(fd2) {
      var stream2;
      var tty_wrap = process.binding("tty_wrap");
      switch (tty_wrap.guessHandleType(fd2)) {
        case "TTY":
          stream2 = new tty.WriteStream(fd2);
          stream2._type = "tty";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        case "FILE":
          var fs2 = require$$3;
          stream2 = new fs2.SyncWriteStream(fd2, { autoClose: false });
          stream2._type = "fs";
          break;
        case "PIPE":
        case "TCP":
          var net = require$$4;
          stream2 = new net.Socket({
            fd: fd2,
            readable: false,
            writable: true
          });
          stream2.readable = false;
          stream2.read = null;
          stream2._type = "pipe";
          if (stream2._handle && stream2._handle.unref) {
            stream2._handle.unref();
          }
          break;
        default:
          throw new Error("Implement me. Unknown stream file type!");
      }
      stream2.fd = fd2;
      stream2._isStdio = true;
      return stream2;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    exports.enable(load());
  })(node, node.exports);
  return node.exports;
}
if (typeof process !== "undefined" && process.type === "renderer") {
  src.exports = requireBrowser();
} else {
  src.exports = requireNode();
}
var srcExports = src.exports;
var path$3 = require$$0$1;
var spawn = require$$1$1.spawn;
var debug = srcExports("electron-squirrel-startup");
var app = require$$3$1.app;
var run = function(args, done) {
  var updateExe = path$3.resolve(path$3.dirname(process.execPath), "..", "Update.exe");
  debug("Spawning `%s` with args `%s`", updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on("close", done);
};
var check = function() {
  if (process.platform === "win32") {
    var cmd = process.argv[1];
    debug("processing squirrel command `%s`", cmd);
    var target = path$3.basename(process.execPath);
    if (cmd === "--squirrel-install" || cmd === "--squirrel-updated") {
      run(["--createShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-uninstall") {
      run(["--removeShortcut=" + target], app.quit);
      return true;
    }
    if (cmd === "--squirrel-obsolete") {
      app.quit();
      return true;
    }
  }
  return false;
};
var electronSquirrelStartup = check();
const started = /* @__PURE__ */ getDefaultExportFromCjs(electronSquirrelStartup);
var customUtils$5 = {};
var crypto = require$$0$2;
function uid(len) {
  return crypto.randomBytes(Math.ceil(Math.max(8, len * 2))).toString("base64").replace(/[+\/]/g, "").slice(0, len);
}
customUtils$5.uid = uid;
var model$4 = {};
var underscore = { exports: {} };
(function(module, exports) {
  (function() {
    var root = this;
    var previousUnderscore = root._;
    var breaker = {};
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
    var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
    var _2 = function(obj) {
      if (obj instanceof _2) return obj;
      if (!(this instanceof _2)) return new _2(obj);
      this._wrapped = obj;
    };
    {
      if (module.exports) {
        exports = module.exports = _2;
      }
      exports._ = _2;
    }
    _2.VERSION = "1.4.4";
    var each = _2.each = _2.forEach = function(obj, iterator, context) {
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
      } else {
        for (var key in obj) {
          if (_2.has(obj, key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker) return;
          }
        }
      }
    };
    _2.map = _2.collect = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };
    var reduceError = "Reduce of empty array with no initial value";
    _2.reduce = _2.foldl = _2.inject = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduce && obj.reduce === nativeReduce) {
        if (context) iterator = _2.bind(iterator, context);
        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
      }
      each(obj, function(value, index, list) {
        if (!initial) {
          memo = value;
          initial = true;
        } else {
          memo = iterator.call(context, memo, value, index, list);
        }
      });
      if (!initial) throw new TypeError(reduceError);
      return memo;
    };
    _2.reduceRight = _2.foldr = function(obj, iterator, memo, context) {
      var initial = arguments.length > 2;
      if (obj == null) obj = [];
      if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
        if (context) iterator = _2.bind(iterator, context);
        return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
      }
      var length = obj.length;
      if (length !== +length) {
        var keys = _2.keys(obj);
        length = keys.length;
      }
      each(obj, function(value, index, list) {
        index = keys ? keys[--length] : --length;
        if (!initial) {
          memo = obj[index];
          initial = true;
        } else {
          memo = iterator.call(context, memo, obj[index], index, list);
        }
      });
      if (!initial) throw new TypeError(reduceError);
      return memo;
    };
    _2.find = _2.detect = function(obj, iterator, context) {
      var result2;
      any(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
          result2 = value;
          return true;
        }
      });
      return result2;
    };
    _2.filter = _2.select = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
      each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) results[results.length] = value;
      });
      return results;
    };
    _2.reject = function(obj, iterator, context) {
      return _2.filter(obj, function(value, index, list) {
        return !iterator.call(context, value, index, list);
      }, context);
    };
    _2.every = _2.all = function(obj, iterator, context) {
      iterator || (iterator = _2.identity);
      var result2 = true;
      if (obj == null) return result2;
      if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
      each(obj, function(value, index, list) {
        if (!(result2 = result2 && iterator.call(context, value, index, list))) return breaker;
      });
      return !!result2;
    };
    var any = _2.some = _2.any = function(obj, iterator, context) {
      iterator || (iterator = _2.identity);
      var result2 = false;
      if (obj == null) return result2;
      if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
      each(obj, function(value, index, list) {
        if (result2 || (result2 = iterator.call(context, value, index, list))) return breaker;
      });
      return !!result2;
    };
    _2.contains = _2.include = function(obj, target) {
      if (obj == null) return false;
      if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
      return any(obj, function(value) {
        return value === target;
      });
    };
    _2.invoke = function(obj, method) {
      var args = slice.call(arguments, 2);
      var isFunc = _2.isFunction(method);
      return _2.map(obj, function(value) {
        return (isFunc ? method : value[method]).apply(value, args);
      });
    };
    _2.pluck = function(obj, key) {
      return _2.map(obj, function(value) {
        return value[key];
      });
    };
    _2.where = function(obj, attrs, first) {
      if (_2.isEmpty(attrs)) return first ? null : [];
      return _2[first ? "find" : "filter"](obj, function(value) {
        for (var key in attrs) {
          if (attrs[key] !== value[key]) return false;
        }
        return true;
      });
    };
    _2.findWhere = function(obj, attrs) {
      return _2.where(obj, attrs, true);
    };
    _2.max = function(obj, iterator, context) {
      if (!iterator && _2.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
        return Math.max.apply(Math, obj);
      }
      if (!iterator && _2.isEmpty(obj)) return -Infinity;
      var result2 = { computed: -Infinity, value: -Infinity };
      each(obj, function(value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed >= result2.computed && (result2 = { value, computed });
      });
      return result2.value;
    };
    _2.min = function(obj, iterator, context) {
      if (!iterator && _2.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
        return Math.min.apply(Math, obj);
      }
      if (!iterator && _2.isEmpty(obj)) return Infinity;
      var result2 = { computed: Infinity, value: Infinity };
      each(obj, function(value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed < result2.computed && (result2 = { value, computed });
      });
      return result2.value;
    };
    _2.shuffle = function(obj) {
      var rand;
      var index = 0;
      var shuffled = [];
      each(obj, function(value) {
        rand = _2.random(index++);
        shuffled[index - 1] = shuffled[rand];
        shuffled[rand] = value;
      });
      return shuffled;
    };
    var lookupIterator = function(value) {
      return _2.isFunction(value) ? value : function(obj) {
        return obj[value];
      };
    };
    _2.sortBy = function(obj, value, context) {
      var iterator = lookupIterator(value);
      return _2.pluck(_2.map(obj, function(value2, index, list) {
        return {
          value: value2,
          index,
          criteria: iterator.call(context, value2, index, list)
        };
      }).sort(function(left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
          if (a > b || a === void 0) return 1;
          if (a < b || b === void 0) return -1;
        }
        return left.index < right.index ? -1 : 1;
      }), "value");
    };
    var group = function(obj, value, context, behavior) {
      var result2 = {};
      var iterator = lookupIterator(value || _2.identity);
      each(obj, function(value2, index) {
        var key = iterator.call(context, value2, index, obj);
        behavior(result2, key, value2);
      });
      return result2;
    };
    _2.groupBy = function(obj, value, context) {
      return group(obj, value, context, function(result2, key, value2) {
        (_2.has(result2, key) ? result2[key] : result2[key] = []).push(value2);
      });
    };
    _2.countBy = function(obj, value, context) {
      return group(obj, value, context, function(result2, key) {
        if (!_2.has(result2, key)) result2[key] = 0;
        result2[key]++;
      });
    };
    _2.sortedIndex = function(array, obj, iterator, context) {
      iterator = iterator == null ? _2.identity : lookupIterator(iterator);
      var value = iterator.call(context, obj);
      var low = 0, high = array.length;
      while (low < high) {
        var mid = low + high >>> 1;
        iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
      }
      return low;
    };
    _2.toArray = function(obj) {
      if (!obj) return [];
      if (_2.isArray(obj)) return slice.call(obj);
      if (obj.length === +obj.length) return _2.map(obj, _2.identity);
      return _2.values(obj);
    };
    _2.size = function(obj) {
      if (obj == null) return 0;
      return obj.length === +obj.length ? obj.length : _2.keys(obj).length;
    };
    _2.first = _2.head = _2.take = function(array, n, guard) {
      if (array == null) return void 0;
      return n != null && !guard ? slice.call(array, 0, n) : array[0];
    };
    _2.initial = function(array, n, guard) {
      return slice.call(array, 0, array.length - (n == null || guard ? 1 : n));
    };
    _2.last = function(array, n, guard) {
      if (array == null) return void 0;
      if (n != null && !guard) {
        return slice.call(array, Math.max(array.length - n, 0));
      } else {
        return array[array.length - 1];
      }
    };
    _2.rest = _2.tail = _2.drop = function(array, n, guard) {
      return slice.call(array, n == null || guard ? 1 : n);
    };
    _2.compact = function(array) {
      return _2.filter(array, _2.identity);
    };
    var flatten = function(input, shallow, output) {
      each(input, function(value) {
        if (_2.isArray(value)) {
          shallow ? push.apply(output, value) : flatten(value, shallow, output);
        } else {
          output.push(value);
        }
      });
      return output;
    };
    _2.flatten = function(array, shallow) {
      return flatten(array, shallow, []);
    };
    _2.without = function(array) {
      return _2.difference(array, slice.call(arguments, 1));
    };
    _2.uniq = _2.unique = function(array, isSorted, iterator, context) {
      if (_2.isFunction(isSorted)) {
        context = iterator;
        iterator = isSorted;
        isSorted = false;
      }
      var initial = iterator ? _2.map(array, iterator, context) : array;
      var results = [];
      var seen = [];
      each(initial, function(value, index) {
        if (isSorted ? !index || seen[seen.length - 1] !== value : !_2.contains(seen, value)) {
          seen.push(value);
          results.push(array[index]);
        }
      });
      return results;
    };
    _2.union = function() {
      return _2.uniq(concat.apply(ArrayProto, arguments));
    };
    _2.intersection = function(array) {
      var rest = slice.call(arguments, 1);
      return _2.filter(_2.uniq(array), function(item) {
        return _2.every(rest, function(other) {
          return _2.indexOf(other, item) >= 0;
        });
      });
    };
    _2.difference = function(array) {
      var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
      return _2.filter(array, function(value) {
        return !_2.contains(rest, value);
      });
    };
    _2.zip = function() {
      var args = slice.call(arguments);
      var length = _2.max(_2.pluck(args, "length"));
      var results = new Array(length);
      for (var i = 0; i < length; i++) {
        results[i] = _2.pluck(args, "" + i);
      }
      return results;
    };
    _2.object = function(list, values) {
      if (list == null) return {};
      var result2 = {};
      for (var i = 0, l = list.length; i < l; i++) {
        if (values) {
          result2[list[i]] = values[i];
        } else {
          result2[list[i][0]] = list[i][1];
        }
      }
      return result2;
    };
    _2.indexOf = function(array, item, isSorted) {
      if (array == null) return -1;
      var i = 0, l = array.length;
      if (isSorted) {
        if (typeof isSorted == "number") {
          i = isSorted < 0 ? Math.max(0, l + isSorted) : isSorted;
        } else {
          i = _2.sortedIndex(array, item);
          return array[i] === item ? i : -1;
        }
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
      for (; i < l; i++) if (array[i] === item) return i;
      return -1;
    };
    _2.lastIndexOf = function(array, item, from) {
      if (array == null) return -1;
      var hasIndex = from != null;
      if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
        return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
      }
      var i = hasIndex ? from : array.length;
      while (i--) if (array[i] === item) return i;
      return -1;
    };
    _2.range = function(start, stop, step) {
      if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
      }
      step = arguments[2] || 1;
      var len = Math.max(Math.ceil((stop - start) / step), 0);
      var idx = 0;
      var range = new Array(len);
      while (idx < len) {
        range[idx++] = start;
        start += step;
      }
      return range;
    };
    _2.bind = function(func, context) {
      if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
      var args = slice.call(arguments, 2);
      return function() {
        return func.apply(context, args.concat(slice.call(arguments)));
      };
    };
    _2.partial = function(func) {
      var args = slice.call(arguments, 1);
      return function() {
        return func.apply(this, args.concat(slice.call(arguments)));
      };
    };
    _2.bindAll = function(obj) {
      var funcs = slice.call(arguments, 1);
      if (funcs.length === 0) funcs = _2.functions(obj);
      each(funcs, function(f) {
        obj[f] = _2.bind(obj[f], obj);
      });
      return obj;
    };
    _2.memoize = function(func, hasher) {
      var memo = {};
      hasher || (hasher = _2.identity);
      return function() {
        var key = hasher.apply(this, arguments);
        return _2.has(memo, key) ? memo[key] : memo[key] = func.apply(this, arguments);
      };
    };
    _2.delay = function(func, wait) {
      var args = slice.call(arguments, 2);
      return setTimeout(function() {
        return func.apply(null, args);
      }, wait);
    };
    _2.defer = function(func) {
      return _2.delay.apply(_2, [func, 1].concat(slice.call(arguments, 1)));
    };
    _2.throttle = function(func, wait) {
      var context, args, timeout, result2;
      var previous = 0;
      var later = function() {
        previous = /* @__PURE__ */ new Date();
        timeout = null;
        result2 = func.apply(context, args);
      };
      return function() {
        var now = /* @__PURE__ */ new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result2 = func.apply(context, args);
        } else if (!timeout) {
          timeout = setTimeout(later, remaining);
        }
        return result2;
      };
    };
    _2.debounce = function(func, wait, immediate) {
      var timeout, result2;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) result2 = func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) result2 = func.apply(context, args);
        return result2;
      };
    };
    _2.once = function(func) {
      var ran = false, memo;
      return function() {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
      };
    };
    _2.wrap = function(func, wrapper) {
      return function() {
        var args = [func];
        push.apply(args, arguments);
        return wrapper.apply(this, args);
      };
    };
    _2.compose = function() {
      var funcs = arguments;
      return function() {
        var args = arguments;
        for (var i = funcs.length - 1; i >= 0; i--) {
          args = [funcs[i].apply(this, args)];
        }
        return args[0];
      };
    };
    _2.after = function(times, func) {
      if (times <= 0) return func();
      return function() {
        if (--times < 1) {
          return func.apply(this, arguments);
        }
      };
    };
    _2.keys = nativeKeys || function(obj) {
      if (obj !== Object(obj)) throw new TypeError("Invalid object");
      var keys = [];
      for (var key in obj) if (_2.has(obj, key)) keys[keys.length] = key;
      return keys;
    };
    _2.values = function(obj) {
      var values = [];
      for (var key in obj) if (_2.has(obj, key)) values.push(obj[key]);
      return values;
    };
    _2.pairs = function(obj) {
      var pairs = [];
      for (var key in obj) if (_2.has(obj, key)) pairs.push([key, obj[key]]);
      return pairs;
    };
    _2.invert = function(obj) {
      var result2 = {};
      for (var key in obj) if (_2.has(obj, key)) result2[obj[key]] = key;
      return result2;
    };
    _2.functions = _2.methods = function(obj) {
      var names = [];
      for (var key in obj) {
        if (_2.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
    };
    _2.extend = function(obj) {
      each(slice.call(arguments, 1), function(source) {
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop];
          }
        }
      });
      return obj;
    };
    _2.pick = function(obj) {
      var copy = {};
      var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
      each(keys, function(key) {
        if (key in obj) copy[key] = obj[key];
      });
      return copy;
    };
    _2.omit = function(obj) {
      var copy = {};
      var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
      for (var key in obj) {
        if (!_2.contains(keys, key)) copy[key] = obj[key];
      }
      return copy;
    };
    _2.defaults = function(obj) {
      each(slice.call(arguments, 1), function(source) {
        if (source) {
          for (var prop in source) {
            if (obj[prop] == null) obj[prop] = source[prop];
          }
        }
      });
      return obj;
    };
    _2.clone = function(obj) {
      if (!_2.isObject(obj)) return obj;
      return _2.isArray(obj) ? obj.slice() : _2.extend({}, obj);
    };
    _2.tap = function(obj, interceptor) {
      interceptor(obj);
      return obj;
    };
    var eq = function(a, b, aStack, bStack) {
      if (a === b) return a !== 0 || 1 / a == 1 / b;
      if (a == null || b == null) return a === b;
      if (a instanceof _2) a = a._wrapped;
      if (b instanceof _2) b = b._wrapped;
      var className = toString.call(a);
      if (className != toString.call(b)) return false;
      switch (className) {
        case "[object String]":
          return a == String(b);
        case "[object Number]":
          return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;
        case "[object Date]":
        case "[object Boolean]":
          return +a == +b;
        case "[object RegExp]":
          return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
      }
      if (typeof a != "object" || typeof b != "object") return false;
      var length = aStack.length;
      while (length--) {
        if (aStack[length] == a) return bStack[length] == b;
      }
      aStack.push(a);
      bStack.push(b);
      var size = 0, result2 = true;
      if (className == "[object Array]") {
        size = a.length;
        result2 = size == b.length;
        if (result2) {
          while (size--) {
            if (!(result2 = eq(a[size], b[size], aStack, bStack))) break;
          }
        }
      } else {
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(_2.isFunction(aCtor) && aCtor instanceof aCtor && _2.isFunction(bCtor) && bCtor instanceof bCtor)) {
          return false;
        }
        for (var key in a) {
          if (_2.has(a, key)) {
            size++;
            if (!(result2 = _2.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
          }
        }
        if (result2) {
          for (key in b) {
            if (_2.has(b, key) && !size--) break;
          }
          result2 = !size;
        }
      }
      aStack.pop();
      bStack.pop();
      return result2;
    };
    _2.isEqual = function(a, b) {
      return eq(a, b, [], []);
    };
    _2.isEmpty = function(obj) {
      if (obj == null) return true;
      if (_2.isArray(obj) || _2.isString(obj)) return obj.length === 0;
      for (var key in obj) if (_2.has(obj, key)) return false;
      return true;
    };
    _2.isElement = function(obj) {
      return !!(obj && obj.nodeType === 1);
    };
    _2.isArray = nativeIsArray || function(obj) {
      return toString.call(obj) == "[object Array]";
    };
    _2.isObject = function(obj) {
      return obj === Object(obj);
    };
    each(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function(name) {
      _2["is" + name] = function(obj) {
        return toString.call(obj) == "[object " + name + "]";
      };
    });
    if (!_2.isArguments(arguments)) {
      _2.isArguments = function(obj) {
        return !!(obj && _2.has(obj, "callee"));
      };
    }
    if (typeof /./ !== "function") {
      _2.isFunction = function(obj) {
        return typeof obj === "function";
      };
    }
    _2.isFinite = function(obj) {
      return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _2.isNaN = function(obj) {
      return _2.isNumber(obj) && obj != +obj;
    };
    _2.isBoolean = function(obj) {
      return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
    };
    _2.isNull = function(obj) {
      return obj === null;
    };
    _2.isUndefined = function(obj) {
      return obj === void 0;
    };
    _2.has = function(obj, key) {
      return hasOwnProperty.call(obj, key);
    };
    _2.noConflict = function() {
      root._ = previousUnderscore;
      return this;
    };
    _2.identity = function(value) {
      return value;
    };
    _2.times = function(n, iterator, context) {
      var accum = Array(n);
      for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
      return accum;
    };
    _2.random = function(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      return min + Math.floor(Math.random() * (max - min + 1));
    };
    var entityMap = {
      escape: {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;"
      }
    };
    entityMap.unescape = _2.invert(entityMap.escape);
    var entityRegexes = {
      escape: new RegExp("[" + _2.keys(entityMap.escape).join("") + "]", "g"),
      unescape: new RegExp("(" + _2.keys(entityMap.unescape).join("|") + ")", "g")
    };
    _2.each(["escape", "unescape"], function(method) {
      _2[method] = function(string) {
        if (string == null) return "";
        return ("" + string).replace(entityRegexes[method], function(match2) {
          return entityMap[method][match2];
        });
      };
    });
    _2.result = function(object, property) {
      if (object == null) return null;
      var value = object[property];
      return _2.isFunction(value) ? value.call(object) : value;
    };
    _2.mixin = function(obj) {
      each(_2.functions(obj), function(name) {
        var func = _2[name] = obj[name];
        _2.prototype[name] = function() {
          var args = [this._wrapped];
          push.apply(args, arguments);
          return result.call(this, func.apply(_2, args));
        };
      });
    };
    var idCounter = 0;
    _2.uniqueId = function(prefix) {
      var id = ++idCounter + "";
      return prefix ? prefix + id : id;
    };
    _2.templateSettings = {
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /<%=([\s\S]+?)%>/g,
      escape: /<%-([\s\S]+?)%>/g
    };
    var noMatch = /(.)^/;
    var escapes = {
      "'": "'",
      "\\": "\\",
      "\r": "r",
      "\n": "n",
      "	": "t",
      "\u2028": "u2028",
      "\u2029": "u2029"
    };
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    _2.template = function(text, data, settings) {
      var render;
      settings = _2.defaults({}, settings, _2.templateSettings);
      var matcher = new RegExp([
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
      ].join("|") + "|$", "g");
      var index = 0;
      var source = "__p+='";
      text.replace(matcher, function(match2, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset).replace(escaper, function(match3) {
          return "\\" + escapes[match3];
        });
        if (escape) {
          source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
        }
        if (interpolate) {
          source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }
        if (evaluate) {
          source += "';\n" + evaluate + "\n__p+='";
        }
        index = offset + match2.length;
        return match2;
      });
      source += "';\n";
      if (!settings.variable) source = "with(obj||{}){\n" + source + "}\n";
      source = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
      try {
        render = new Function(settings.variable || "obj", "_", source);
      } catch (e) {
        e.source = source;
        throw e;
      }
      if (data) return render(data, _2);
      var template = function(data2) {
        return render.call(this, data2, _2);
      };
      template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
      return template;
    };
    _2.chain = function(obj) {
      return _2(obj).chain();
    };
    var result = function(obj) {
      return this._chain ? _2(obj).chain() : obj;
    };
    _2.mixin(_2);
    each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(name) {
      var method = ArrayProto[name];
      _2.prototype[name] = function() {
        var obj = this._wrapped;
        method.apply(obj, arguments);
        if ((name == "shift" || name == "splice") && obj.length === 0) delete obj[0];
        return result.call(this, obj);
      };
    });
    each(["concat", "join", "slice"], function(name) {
      var method = ArrayProto[name];
      _2.prototype[name] = function() {
        return result.call(this, method.apply(this._wrapped, arguments));
      };
    });
    _2.extend(_2.prototype, {
      // Start chaining a wrapped Underscore object.
      chain: function() {
        this._chain = true;
        return this;
      },
      // Extracts the result from a wrapped and chained object.
      value: function() {
        return this._wrapped;
      }
    });
  }).call(commonjsGlobal);
})(underscore, underscore.exports);
var underscoreExports = underscore.exports;
var util$3 = require$$1, _$3 = underscoreExports, modifierFunctions = {}, lastStepModifierFunctions = {}, comparisonFunctions = {}, logicalOperators = {}, arrayComparisonFunctions = {};
function checkKey(k, v) {
  if (typeof k === "number") {
    k = k.toString();
  }
  if (k[0] === "$" && !(k === "$$date" && typeof v === "number") && !(k === "$$deleted" && v === true) && !(k === "$$indexCreated") && !(k === "$$indexRemoved")) {
    throw new Error("Field names cannot begin with the $ character");
  }
  if (k.indexOf(".") !== -1) {
    throw new Error("Field names cannot contain a .");
  }
}
function checkObject(obj) {
  if (util$3.isArray(obj)) {
    obj.forEach(function(o) {
      checkObject(o);
    });
  }
  if (typeof obj === "object" && obj !== null) {
    Object.keys(obj).forEach(function(k) {
      checkKey(k, obj[k]);
      checkObject(obj[k]);
    });
  }
}
function serialize(obj) {
  var res;
  res = JSON.stringify(obj, function(k, v) {
    checkKey(k, v);
    if (v === void 0) {
      return void 0;
    }
    if (v === null) {
      return null;
    }
    if (typeof this[k].getTime === "function") {
      return { $$date: this[k].getTime() };
    }
    return v;
  });
  return res;
}
function deserialize(rawData) {
  return JSON.parse(rawData, function(k, v) {
    if (k === "$$date") {
      return new Date(v);
    }
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null) {
      return v;
    }
    if (v && v.$$date) {
      return v.$$date;
    }
    return v;
  });
}
function deepCopy(obj, strictKeys) {
  var res;
  if (typeof obj === "boolean" || typeof obj === "number" || typeof obj === "string" || obj === null || util$3.isDate(obj)) {
    return obj;
  }
  if (util$3.isArray(obj)) {
    res = [];
    obj.forEach(function(o) {
      res.push(deepCopy(o, strictKeys));
    });
    return res;
  }
  if (typeof obj === "object") {
    res = {};
    Object.keys(obj).forEach(function(k) {
      if (!strictKeys || k[0] !== "$" && k.indexOf(".") === -1) {
        res[k] = deepCopy(obj[k], strictKeys);
      }
    });
    return res;
  }
  return void 0;
}
function isPrimitiveType(obj) {
  return typeof obj === "boolean" || typeof obj === "number" || typeof obj === "string" || obj === null || util$3.isDate(obj) || util$3.isArray(obj);
}
function compareNSB(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
function compareArrays(a, b) {
  var i, comp;
  for (i = 0; i < Math.min(a.length, b.length); i += 1) {
    comp = compareThings(a[i], b[i]);
    if (comp !== 0) {
      return comp;
    }
  }
  return compareNSB(a.length, b.length);
}
function compareThings(a, b, _compareStrings) {
  var aKeys, bKeys, comp, i, compareStrings = _compareStrings || compareNSB;
  if (a === void 0) {
    return b === void 0 ? 0 : -1;
  }
  if (b === void 0) {
    return a === void 0 ? 0 : 1;
  }
  if (a === null) {
    return b === null ? 0 : -1;
  }
  if (b === null) {
    return a === null ? 0 : 1;
  }
  if (typeof a === "number") {
    return typeof b === "number" ? compareNSB(a, b) : -1;
  }
  if (typeof b === "number") {
    return typeof a === "number" ? compareNSB(a, b) : 1;
  }
  if (typeof a === "string") {
    return typeof b === "string" ? compareStrings(a, b) : -1;
  }
  if (typeof b === "string") {
    return typeof a === "string" ? compareStrings(a, b) : 1;
  }
  if (typeof a === "boolean") {
    return typeof b === "boolean" ? compareNSB(a, b) : -1;
  }
  if (typeof b === "boolean") {
    return typeof a === "boolean" ? compareNSB(a, b) : 1;
  }
  if (util$3.isDate(a)) {
    return util$3.isDate(b) ? compareNSB(a.getTime(), b.getTime()) : -1;
  }
  if (util$3.isDate(b)) {
    return util$3.isDate(a) ? compareNSB(a.getTime(), b.getTime()) : 1;
  }
  if (util$3.isArray(a)) {
    return util$3.isArray(b) ? compareArrays(a, b) : -1;
  }
  if (util$3.isArray(b)) {
    return util$3.isArray(a) ? compareArrays(a, b) : 1;
  }
  aKeys = Object.keys(a).sort();
  bKeys = Object.keys(b).sort();
  for (i = 0; i < Math.min(aKeys.length, bKeys.length); i += 1) {
    comp = compareThings(a[aKeys[i]], b[bKeys[i]]);
    if (comp !== 0) {
      return comp;
    }
  }
  return compareNSB(aKeys.length, bKeys.length);
}
lastStepModifierFunctions.$set = function(obj, field, value) {
  obj[field] = value;
};
lastStepModifierFunctions.$unset = function(obj, field, value) {
  delete obj[field];
};
lastStepModifierFunctions.$push = function(obj, field, value) {
  if (!obj.hasOwnProperty(field)) {
    obj[field] = [];
  }
  if (!util$3.isArray(obj[field])) {
    throw new Error("Can't $push an element on non-array values");
  }
  if (value !== null && typeof value === "object" && value.$slice && value.$each === void 0) {
    value.$each = [];
  }
  if (value !== null && typeof value === "object" && value.$each) {
    if (Object.keys(value).length >= 3 || Object.keys(value).length === 2 && value.$slice === void 0) {
      throw new Error("Can only use $slice in cunjunction with $each when $push to array");
    }
    if (!util$3.isArray(value.$each)) {
      throw new Error("$each requires an array value");
    }
    value.$each.forEach(function(v) {
      obj[field].push(v);
    });
    if (value.$slice === void 0 || typeof value.$slice !== "number") {
      return;
    }
    if (value.$slice === 0) {
      obj[field] = [];
    } else {
      var start, end, n = obj[field].length;
      if (value.$slice < 0) {
        start = Math.max(0, n + value.$slice);
        end = n;
      } else if (value.$slice > 0) {
        start = 0;
        end = Math.min(n, value.$slice);
      }
      obj[field] = obj[field].slice(start, end);
    }
  } else {
    obj[field].push(value);
  }
};
lastStepModifierFunctions.$addToSet = function(obj, field, value) {
  var addToSet = true;
  if (!obj.hasOwnProperty(field)) {
    obj[field] = [];
  }
  if (!util$3.isArray(obj[field])) {
    throw new Error("Can't $addToSet an element on non-array values");
  }
  if (value !== null && typeof value === "object" && value.$each) {
    if (Object.keys(value).length > 1) {
      throw new Error("Can't use another field in conjunction with $each");
    }
    if (!util$3.isArray(value.$each)) {
      throw new Error("$each requires an array value");
    }
    value.$each.forEach(function(v) {
      lastStepModifierFunctions.$addToSet(obj, field, v);
    });
  } else {
    obj[field].forEach(function(v) {
      if (compareThings(v, value) === 0) {
        addToSet = false;
      }
    });
    if (addToSet) {
      obj[field].push(value);
    }
  }
};
lastStepModifierFunctions.$pop = function(obj, field, value) {
  if (!util$3.isArray(obj[field])) {
    throw new Error("Can't $pop an element from non-array values");
  }
  if (typeof value !== "number") {
    throw new Error(value + " isn't an integer, can't use it with $pop");
  }
  if (value === 0) {
    return;
  }
  if (value > 0) {
    obj[field] = obj[field].slice(0, obj[field].length - 1);
  } else {
    obj[field] = obj[field].slice(1);
  }
};
lastStepModifierFunctions.$pull = function(obj, field, value) {
  var arr, i;
  if (!util$3.isArray(obj[field])) {
    throw new Error("Can't $pull an element from non-array values");
  }
  arr = obj[field];
  for (i = arr.length - 1; i >= 0; i -= 1) {
    if (match(arr[i], value)) {
      arr.splice(i, 1);
    }
  }
};
lastStepModifierFunctions.$inc = function(obj, field, value) {
  if (typeof value !== "number") {
    throw new Error(value + " must be a number");
  }
  if (typeof obj[field] !== "number") {
    if (!_$3.has(obj, field)) {
      obj[field] = value;
    } else {
      throw new Error("Don't use the $inc modifier on non-number fields");
    }
  } else {
    obj[field] += value;
  }
};
lastStepModifierFunctions.$max = function(obj, field, value) {
  if (typeof obj[field] === "undefined") {
    obj[field] = value;
  } else if (value > obj[field]) {
    obj[field] = value;
  }
};
lastStepModifierFunctions.$min = function(obj, field, value) {
  if (typeof obj[field] === "undefined") {
    obj[field] = value;
  } else if (value < obj[field]) {
    obj[field] = value;
  }
};
function createModifierFunction(modifier) {
  return function(obj, field, value) {
    var fieldParts = typeof field === "string" ? field.split(".") : field;
    if (fieldParts.length === 1) {
      lastStepModifierFunctions[modifier](obj, field, value);
    } else {
      if (obj[fieldParts[0]] === void 0) {
        if (modifier === "$unset") {
          return;
        }
        obj[fieldParts[0]] = {};
      }
      modifierFunctions[modifier](obj[fieldParts[0]], fieldParts.slice(1), value);
    }
  };
}
Object.keys(lastStepModifierFunctions).forEach(function(modifier) {
  modifierFunctions[modifier] = createModifierFunction(modifier);
});
function modify(obj, updateQuery) {
  var keys = Object.keys(updateQuery), firstChars = _$3.map(keys, function(item) {
    return item[0];
  }), dollarFirstChars = _$3.filter(firstChars, function(c) {
    return c === "$";
  }), newDoc, modifiers;
  if (keys.indexOf("_id") !== -1 && updateQuery._id !== obj._id) {
    throw new Error("You cannot change a document's _id");
  }
  if (dollarFirstChars.length !== 0 && dollarFirstChars.length !== firstChars.length) {
    throw new Error("You cannot mix modifiers and normal fields");
  }
  if (dollarFirstChars.length === 0) {
    newDoc = deepCopy(updateQuery);
    newDoc._id = obj._id;
  } else {
    modifiers = _$3.uniq(keys);
    newDoc = deepCopy(obj);
    modifiers.forEach(function(m) {
      var keys2;
      if (!modifierFunctions[m]) {
        throw new Error("Unknown modifier " + m);
      }
      if (typeof updateQuery[m] !== "object") {
        throw new Error("Modifier " + m + "'s argument must be an object");
      }
      keys2 = Object.keys(updateQuery[m]);
      keys2.forEach(function(k) {
        modifierFunctions[m](newDoc, k, updateQuery[m][k]);
      });
    });
  }
  checkObject(newDoc);
  if (obj._id !== newDoc._id) {
    throw new Error("You can't change a document's _id");
  }
  return newDoc;
}
function getDotValue(obj, field) {
  var fieldParts = typeof field === "string" ? field.split(".") : field, i, objs;
  if (!obj) {
    return void 0;
  }
  if (fieldParts.length === 0) {
    return obj;
  }
  if (fieldParts.length === 1) {
    return obj[fieldParts[0]];
  }
  if (util$3.isArray(obj[fieldParts[0]])) {
    i = parseInt(fieldParts[1], 10);
    if (typeof i === "number" && !isNaN(i)) {
      return getDotValue(obj[fieldParts[0]][i], fieldParts.slice(2));
    }
    objs = new Array();
    for (i = 0; i < obj[fieldParts[0]].length; i += 1) {
      objs.push(getDotValue(obj[fieldParts[0]][i], fieldParts.slice(1)));
    }
    return objs;
  } else {
    return getDotValue(obj[fieldParts[0]], fieldParts.slice(1));
  }
}
function areThingsEqual(a, b) {
  var aKeys, bKeys, i;
  if (a === null || typeof a === "string" || typeof a === "boolean" || typeof a === "number" || b === null || typeof b === "string" || typeof b === "boolean" || typeof b === "number") {
    return a === b;
  }
  if (util$3.isDate(a) || util$3.isDate(b)) {
    return util$3.isDate(a) && util$3.isDate(b) && a.getTime() === b.getTime();
  }
  if (!(util$3.isArray(a) && util$3.isArray(b)) && (util$3.isArray(a) || util$3.isArray(b)) || a === void 0 || b === void 0) {
    return false;
  }
  try {
    aKeys = Object.keys(a);
    bKeys = Object.keys(b);
  } catch (e) {
    return false;
  }
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (i = 0; i < aKeys.length; i += 1) {
    if (bKeys.indexOf(aKeys[i]) === -1) {
      return false;
    }
    if (!areThingsEqual(a[aKeys[i]], b[aKeys[i]])) {
      return false;
    }
  }
  return true;
}
function areComparable(a, b) {
  if (typeof a !== "string" && typeof a !== "number" && !util$3.isDate(a) && typeof b !== "string" && typeof b !== "number" && !util$3.isDate(b)) {
    return false;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  return true;
}
comparisonFunctions.$lt = function(a, b) {
  return areComparable(a, b) && a < b;
};
comparisonFunctions.$lte = function(a, b) {
  return areComparable(a, b) && a <= b;
};
comparisonFunctions.$gt = function(a, b) {
  return areComparable(a, b) && a > b;
};
comparisonFunctions.$gte = function(a, b) {
  return areComparable(a, b) && a >= b;
};
comparisonFunctions.$ne = function(a, b) {
  if (a === void 0) {
    return true;
  }
  return !areThingsEqual(a, b);
};
comparisonFunctions.$in = function(a, b) {
  var i;
  if (!util$3.isArray(b)) {
    throw new Error("$in operator called with a non-array");
  }
  for (i = 0; i < b.length; i += 1) {
    if (areThingsEqual(a, b[i])) {
      return true;
    }
  }
  return false;
};
comparisonFunctions.$nin = function(a, b) {
  if (!util$3.isArray(b)) {
    throw new Error("$nin operator called with a non-array");
  }
  return !comparisonFunctions.$in(a, b);
};
comparisonFunctions.$regex = function(a, b) {
  if (!util$3.isRegExp(b)) {
    throw new Error("$regex operator called with non regular expression");
  }
  if (typeof a !== "string") {
    return false;
  } else {
    return b.test(a);
  }
};
comparisonFunctions.$exists = function(value, exists) {
  if (exists || exists === "") {
    exists = true;
  } else {
    exists = false;
  }
  if (value === void 0) {
    return !exists;
  } else {
    return exists;
  }
};
comparisonFunctions.$size = function(obj, value) {
  if (!util$3.isArray(obj)) {
    return false;
  }
  if (value % 1 !== 0) {
    throw new Error("$size operator called without an integer");
  }
  return obj.length == value;
};
comparisonFunctions.$elemMatch = function(obj, value) {
  if (!util$3.isArray(obj)) {
    return false;
  }
  var i = obj.length;
  var result = false;
  while (i--) {
    if (match(obj[i], value)) {
      result = true;
      break;
    }
  }
  return result;
};
arrayComparisonFunctions.$size = true;
arrayComparisonFunctions.$elemMatch = true;
logicalOperators.$or = function(obj, query) {
  var i;
  if (!util$3.isArray(query)) {
    throw new Error("$or operator used without an array");
  }
  for (i = 0; i < query.length; i += 1) {
    if (match(obj, query[i])) {
      return true;
    }
  }
  return false;
};
logicalOperators.$and = function(obj, query) {
  var i;
  if (!util$3.isArray(query)) {
    throw new Error("$and operator used without an array");
  }
  for (i = 0; i < query.length; i += 1) {
    if (!match(obj, query[i])) {
      return false;
    }
  }
  return true;
};
logicalOperators.$not = function(obj, query) {
  return !match(obj, query);
};
logicalOperators.$where = function(obj, fn) {
  var result;
  if (!_$3.isFunction(fn)) {
    throw new Error("$where operator used without a function");
  }
  result = fn.call(obj);
  if (!_$3.isBoolean(result)) {
    throw new Error("$where function must return boolean");
  }
  return result;
};
function match(obj, query) {
  var queryKeys, queryKey, queryValue, i;
  if (isPrimitiveType(obj) || isPrimitiveType(query)) {
    return matchQueryPart({ needAKey: obj }, "needAKey", query);
  }
  queryKeys = Object.keys(query);
  for (i = 0; i < queryKeys.length; i += 1) {
    queryKey = queryKeys[i];
    queryValue = query[queryKey];
    if (queryKey[0] === "$") {
      if (!logicalOperators[queryKey]) {
        throw new Error("Unknown logical operator " + queryKey);
      }
      if (!logicalOperators[queryKey](obj, queryValue)) {
        return false;
      }
    } else {
      if (!matchQueryPart(obj, queryKey, queryValue)) {
        return false;
      }
    }
  }
  return true;
}
function matchQueryPart(obj, queryKey, queryValue, treatObjAsValue) {
  var objValue = getDotValue(obj, queryKey), i, keys, firstChars, dollarFirstChars;
  if (util$3.isArray(objValue) && !treatObjAsValue) {
    if (util$3.isArray(queryValue)) {
      return matchQueryPart(obj, queryKey, queryValue, true);
    }
    if (queryValue !== null && typeof queryValue === "object" && !util$3.isRegExp(queryValue)) {
      keys = Object.keys(queryValue);
      for (i = 0; i < keys.length; i += 1) {
        if (arrayComparisonFunctions[keys[i]]) {
          return matchQueryPart(obj, queryKey, queryValue, true);
        }
      }
    }
    for (i = 0; i < objValue.length; i += 1) {
      if (matchQueryPart({ k: objValue[i] }, "k", queryValue)) {
        return true;
      }
    }
    return false;
  }
  if (queryValue !== null && typeof queryValue === "object" && !util$3.isRegExp(queryValue) && !util$3.isArray(queryValue)) {
    keys = Object.keys(queryValue);
    firstChars = _$3.map(keys, function(item) {
      return item[0];
    });
    dollarFirstChars = _$3.filter(firstChars, function(c) {
      return c === "$";
    });
    if (dollarFirstChars.length !== 0 && dollarFirstChars.length !== firstChars.length) {
      throw new Error("You cannot mix operators and normal fields");
    }
    if (dollarFirstChars.length > 0) {
      for (i = 0; i < keys.length; i += 1) {
        if (!comparisonFunctions[keys[i]]) {
          throw new Error("Unknown comparison function " + keys[i]);
        }
        if (!comparisonFunctions[keys[i]](objValue, queryValue[keys[i]])) {
          return false;
        }
      }
      return true;
    }
  }
  if (util$3.isRegExp(queryValue)) {
    return comparisonFunctions.$regex(objValue, queryValue);
  }
  if (!areThingsEqual(objValue, queryValue)) {
    return false;
  }
  return true;
}
model$4.serialize = serialize;
model$4.deserialize = deserialize;
model$4.deepCopy = deepCopy;
model$4.checkObject = checkObject;
model$4.isPrimitiveType = isPrimitiveType;
model$4.modify = modify;
model$4.getDotValue = getDotValue;
model$4.match = match;
model$4.areThingsEqual = areThingsEqual;
model$4.compareThings = compareThings;
var async$4 = { exports: {} };
(function(module) {
  (function() {
    var async2 = {};
    var root, previous_async;
    root = this;
    if (root != null) {
      previous_async = root.async;
    }
    async2.noConflict = function() {
      root.async = previous_async;
      return async2;
    };
    function only_once(fn) {
      var called = false;
      return function() {
        if (called) throw new Error("Callback was already called.");
        called = true;
        fn.apply(root, arguments);
      };
    }
    var _each = function(arr, iterator) {
      if (arr.forEach) {
        return arr.forEach(iterator);
      }
      for (var i = 0; i < arr.length; i += 1) {
        iterator(arr[i], i, arr);
      }
    };
    var _map = function(arr, iterator) {
      if (arr.map) {
        return arr.map(iterator);
      }
      var results = [];
      _each(arr, function(x, i, a) {
        results.push(iterator(x, i, a));
      });
      return results;
    };
    var _reduce = function(arr, iterator, memo) {
      if (arr.reduce) {
        return arr.reduce(iterator, memo);
      }
      _each(arr, function(x, i, a) {
        memo = iterator(memo, x, i, a);
      });
      return memo;
    };
    var _keys = function(obj) {
      if (Object.keys) {
        return Object.keys(obj);
      }
      var keys = [];
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          keys.push(k);
        }
      }
      return keys;
    };
    if (typeof process === "undefined" || !process.nextTick) {
      if (typeof setImmediate === "function") {
        async2.nextTick = function(fn) {
          setImmediate(fn);
        };
        async2.setImmediate = async2.nextTick;
      } else {
        async2.nextTick = function(fn) {
          setTimeout(fn, 0);
        };
        async2.setImmediate = async2.nextTick;
      }
    } else {
      async2.nextTick = process.nextTick;
      if (typeof setImmediate !== "undefined") {
        async2.setImmediate = function(fn) {
          setImmediate(fn);
        };
      } else {
        async2.setImmediate = async2.nextTick;
      }
    }
    async2.each = function(arr, iterator, callback) {
      callback = callback || function() {
      };
      if (!arr.length) {
        return callback();
      }
      var completed = 0;
      _each(arr, function(x) {
        iterator(x, only_once(function(err) {
          if (err) {
            callback(err);
            callback = function() {
            };
          } else {
            completed += 1;
            if (completed >= arr.length) {
              callback(null);
            }
          }
        }));
      });
    };
    async2.forEach = async2.each;
    async2.eachSeries = function(arr, iterator, callback) {
      callback = callback || function() {
      };
      if (!arr.length) {
        return callback();
      }
      var completed = 0;
      var iterate = function() {
        iterator(arr[completed], function(err) {
          if (err) {
            callback(err);
            callback = function() {
            };
          } else {
            completed += 1;
            if (completed >= arr.length) {
              callback(null);
            } else {
              iterate();
            }
          }
        });
      };
      iterate();
    };
    async2.forEachSeries = async2.eachSeries;
    async2.eachLimit = function(arr, limit, iterator, callback) {
      var fn = _eachLimit(limit);
      fn.apply(null, [arr, iterator, callback]);
    };
    async2.forEachLimit = async2.eachLimit;
    var _eachLimit = function(limit) {
      return function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length || limit <= 0) {
          return callback();
        }
        var completed = 0;
        var started2 = 0;
        var running = 0;
        (function replenish() {
          if (completed >= arr.length) {
            return callback();
          }
          while (running < limit && started2 < arr.length) {
            started2 += 1;
            running += 1;
            iterator(arr[started2 - 1], function(err) {
              if (err) {
                callback(err);
                callback = function() {
                };
              } else {
                completed += 1;
                running -= 1;
                if (completed >= arr.length) {
                  callback();
                } else {
                  replenish();
                }
              }
            });
          }
        })();
      };
    };
    var doParallel = function(fn) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [async2.each].concat(args));
      };
    };
    var doParallelLimit = function(limit, fn) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [_eachLimit(limit)].concat(args));
      };
    };
    var doSeries = function(fn) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [async2.eachSeries].concat(args));
      };
    };
    var _asyncMap = function(eachfn, arr, iterator, callback) {
      var results = [];
      arr = _map(arr, function(x, i) {
        return { index: i, value: x };
      });
      eachfn(arr, function(x, callback2) {
        iterator(x.value, function(err, v) {
          results[x.index] = v;
          callback2(err);
        });
      }, function(err) {
        callback(err, results);
      });
    };
    async2.map = doParallel(_asyncMap);
    async2.mapSeries = doSeries(_asyncMap);
    async2.mapLimit = function(arr, limit, iterator, callback) {
      return _mapLimit(limit)(arr, iterator, callback);
    };
    var _mapLimit = function(limit) {
      return doParallelLimit(limit, _asyncMap);
    };
    async2.reduce = function(arr, memo, iterator, callback) {
      async2.eachSeries(arr, function(x, callback2) {
        iterator(memo, x, function(err, v) {
          memo = v;
          callback2(err);
        });
      }, function(err) {
        callback(err, memo);
      });
    };
    async2.inject = async2.reduce;
    async2.foldl = async2.reduce;
    async2.reduceRight = function(arr, memo, iterator, callback) {
      var reversed = _map(arr, function(x) {
        return x;
      }).reverse();
      async2.reduce(reversed, memo, iterator, callback);
    };
    async2.foldr = async2.reduceRight;
    var _filter = function(eachfn, arr, iterator, callback) {
      var results = [];
      arr = _map(arr, function(x, i) {
        return { index: i, value: x };
      });
      eachfn(arr, function(x, callback2) {
        iterator(x.value, function(v) {
          if (v) {
            results.push(x);
          }
          callback2();
        });
      }, function(err) {
        callback(_map(results.sort(function(a, b) {
          return a.index - b.index;
        }), function(x) {
          return x.value;
        }));
      });
    };
    async2.filter = doParallel(_filter);
    async2.filterSeries = doSeries(_filter);
    async2.select = async2.filter;
    async2.selectSeries = async2.filterSeries;
    var _reject = function(eachfn, arr, iterator, callback) {
      var results = [];
      arr = _map(arr, function(x, i) {
        return { index: i, value: x };
      });
      eachfn(arr, function(x, callback2) {
        iterator(x.value, function(v) {
          if (!v) {
            results.push(x);
          }
          callback2();
        });
      }, function(err) {
        callback(_map(results.sort(function(a, b) {
          return a.index - b.index;
        }), function(x) {
          return x.value;
        }));
      });
    };
    async2.reject = doParallel(_reject);
    async2.rejectSeries = doSeries(_reject);
    var _detect = function(eachfn, arr, iterator, main_callback) {
      eachfn(arr, function(x, callback) {
        iterator(x, function(result) {
          if (result) {
            main_callback(x);
            main_callback = function() {
            };
          } else {
            callback();
          }
        });
      }, function(err) {
        main_callback();
      });
    };
    async2.detect = doParallel(_detect);
    async2.detectSeries = doSeries(_detect);
    async2.some = function(arr, iterator, main_callback) {
      async2.each(arr, function(x, callback) {
        iterator(x, function(v) {
          if (v) {
            main_callback(true);
            main_callback = function() {
            };
          }
          callback();
        });
      }, function(err) {
        main_callback(false);
      });
    };
    async2.any = async2.some;
    async2.every = function(arr, iterator, main_callback) {
      async2.each(arr, function(x, callback) {
        iterator(x, function(v) {
          if (!v) {
            main_callback(false);
            main_callback = function() {
            };
          }
          callback();
        });
      }, function(err) {
        main_callback(true);
      });
    };
    async2.all = async2.every;
    async2.sortBy = function(arr, iterator, callback) {
      async2.map(arr, function(x, callback2) {
        iterator(x, function(err, criteria) {
          if (err) {
            callback2(err);
          } else {
            callback2(null, { value: x, criteria });
          }
        });
      }, function(err, results) {
        if (err) {
          return callback(err);
        } else {
          var fn = function(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
          };
          callback(null, _map(results.sort(fn), function(x) {
            return x.value;
          }));
        }
      });
    };
    async2.auto = function(tasks, callback) {
      callback = callback || function() {
      };
      var keys = _keys(tasks);
      if (!keys.length) {
        return callback(null);
      }
      var results = {};
      var listeners = [];
      var addListener = function(fn) {
        listeners.unshift(fn);
      };
      var removeListener = function(fn) {
        for (var i = 0; i < listeners.length; i += 1) {
          if (listeners[i] === fn) {
            listeners.splice(i, 1);
            return;
          }
        }
      };
      var taskComplete = function() {
        _each(listeners.slice(0), function(fn) {
          fn();
        });
      };
      addListener(function() {
        if (_keys(results).length === keys.length) {
          callback(null, results);
          callback = function() {
          };
        }
      });
      _each(keys, function(k) {
        var task = tasks[k] instanceof Function ? [tasks[k]] : tasks[k];
        var taskCallback = function(err) {
          var args = Array.prototype.slice.call(arguments, 1);
          if (args.length <= 1) {
            args = args[0];
          }
          if (err) {
            var safeResults = {};
            _each(_keys(results), function(rkey) {
              safeResults[rkey] = results[rkey];
            });
            safeResults[k] = args;
            callback(err, safeResults);
            callback = function() {
            };
          } else {
            results[k] = args;
            async2.setImmediate(taskComplete);
          }
        };
        var requires = task.slice(0, Math.abs(task.length - 1)) || [];
        var ready = function() {
          return _reduce(requires, function(a, x) {
            return a && results.hasOwnProperty(x);
          }, true) && !results.hasOwnProperty(k);
        };
        if (ready()) {
          task[task.length - 1](taskCallback, results);
        } else {
          var listener = function() {
            if (ready()) {
              removeListener(listener);
              task[task.length - 1](taskCallback, results);
            }
          };
          addListener(listener);
        }
      });
    };
    async2.waterfall = function(tasks, callback) {
      callback = callback || function() {
      };
      if (tasks.constructor !== Array) {
        var err = new Error("First argument to waterfall must be an array of functions");
        return callback(err);
      }
      if (!tasks.length) {
        return callback();
      }
      var wrapIterator = function(iterator) {
        return function(err2) {
          if (err2) {
            callback.apply(null, arguments);
            callback = function() {
            };
          } else {
            var args = Array.prototype.slice.call(arguments, 1);
            var next = iterator.next();
            if (next) {
              args.push(wrapIterator(next));
            } else {
              args.push(callback);
            }
            async2.setImmediate(function() {
              iterator.apply(null, args);
            });
          }
        };
      };
      wrapIterator(async2.iterator(tasks))();
    };
    var _parallel = function(eachfn, tasks, callback) {
      callback = callback || function() {
      };
      if (tasks.constructor === Array) {
        eachfn.map(tasks, function(fn, callback2) {
          if (fn) {
            fn(function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              callback2.call(null, err, args);
            });
          }
        }, callback);
      } else {
        var results = {};
        eachfn.each(_keys(tasks), function(k, callback2) {
          tasks[k](function(err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
              args = args[0];
            }
            results[k] = args;
            callback2(err);
          });
        }, function(err) {
          callback(err, results);
        });
      }
    };
    async2.parallel = function(tasks, callback) {
      _parallel({ map: async2.map, each: async2.each }, tasks, callback);
    };
    async2.parallelLimit = function(tasks, limit, callback) {
      _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };
    async2.series = function(tasks, callback) {
      callback = callback || function() {
      };
      if (tasks.constructor === Array) {
        async2.mapSeries(tasks, function(fn, callback2) {
          if (fn) {
            fn(function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              callback2.call(null, err, args);
            });
          }
        }, callback);
      } else {
        var results = {};
        async2.eachSeries(_keys(tasks), function(k, callback2) {
          tasks[k](function(err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
              args = args[0];
            }
            results[k] = args;
            callback2(err);
          });
        }, function(err) {
          callback(err, results);
        });
      }
    };
    async2.iterator = function(tasks) {
      var makeCallback = function(index) {
        var fn = function() {
          if (tasks.length) {
            tasks[index].apply(null, arguments);
          }
          return fn.next();
        };
        fn.next = function() {
          return index < tasks.length - 1 ? makeCallback(index + 1) : null;
        };
        return fn;
      };
      return makeCallback(0);
    };
    async2.apply = function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
        return fn.apply(
          null,
          args.concat(Array.prototype.slice.call(arguments))
        );
      };
    };
    var _concat = function(eachfn, arr, fn, callback) {
      var r = [];
      eachfn(arr, function(x, cb) {
        fn(x, function(err, y) {
          r = r.concat(y || []);
          cb(err);
        });
      }, function(err) {
        callback(err, r);
      });
    };
    async2.concat = doParallel(_concat);
    async2.concatSeries = doSeries(_concat);
    async2.whilst = function(test, iterator, callback) {
      if (test()) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          async2.whilst(test, iterator, callback);
        });
      } else {
        callback();
      }
    };
    async2.doWhilst = function(iterator, test, callback) {
      iterator(function(err) {
        if (err) {
          return callback(err);
        }
        if (test()) {
          async2.doWhilst(iterator, test, callback);
        } else {
          callback();
        }
      });
    };
    async2.until = function(test, iterator, callback) {
      if (!test()) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          async2.until(test, iterator, callback);
        });
      } else {
        callback();
      }
    };
    async2.doUntil = function(iterator, test, callback) {
      iterator(function(err) {
        if (err) {
          return callback(err);
        }
        if (!test()) {
          async2.doUntil(iterator, test, callback);
        } else {
          callback();
        }
      });
    };
    async2.queue = function(worker, concurrency) {
      if (concurrency === void 0) {
        concurrency = 1;
      }
      function _insert(q2, data, pos, callback) {
        if (data.constructor !== Array) {
          data = [data];
        }
        _each(data, function(task) {
          var item = {
            data: task,
            callback: typeof callback === "function" ? callback : null
          };
          if (pos) {
            q2.tasks.unshift(item);
          } else {
            q2.tasks.push(item);
          }
          if (q2.saturated && q2.tasks.length === concurrency) {
            q2.saturated();
          }
          async2.setImmediate(q2.process);
        });
      }
      var workers = 0;
      var q = {
        tasks: [],
        concurrency,
        saturated: null,
        empty: null,
        drain: null,
        push: function(data, callback) {
          _insert(q, data, false, callback);
        },
        unshift: function(data, callback) {
          _insert(q, data, true, callback);
        },
        process: function() {
          if (workers < q.concurrency && q.tasks.length) {
            var task = q.tasks.shift();
            if (q.empty && q.tasks.length === 0) {
              q.empty();
            }
            workers += 1;
            var next = function() {
              workers -= 1;
              if (task.callback) {
                task.callback.apply(task, arguments);
              }
              if (q.drain && q.tasks.length + workers === 0) {
                q.drain();
              }
              q.process();
            };
            var cb = only_once(next);
            worker(task.data, cb);
          }
        },
        length: function() {
          return q.tasks.length;
        },
        running: function() {
          return workers;
        }
      };
      return q;
    };
    async2.cargo = function(worker, payload) {
      var working = false, tasks = [];
      var cargo = {
        tasks,
        payload,
        saturated: null,
        empty: null,
        drain: null,
        push: function(data, callback) {
          if (data.constructor !== Array) {
            data = [data];
          }
          _each(data, function(task) {
            tasks.push({
              data: task,
              callback: typeof callback === "function" ? callback : null
            });
            if (cargo.saturated && tasks.length === payload) {
              cargo.saturated();
            }
          });
          async2.setImmediate(cargo.process);
        },
        process: function process2() {
          if (working) return;
          if (tasks.length === 0) {
            if (cargo.drain) cargo.drain();
            return;
          }
          var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0);
          var ds = _map(ts, function(task) {
            return task.data;
          });
          if (cargo.empty) cargo.empty();
          working = true;
          worker(ds, function() {
            working = false;
            var args = arguments;
            _each(ts, function(data) {
              if (data.callback) {
                data.callback.apply(null, args);
              }
            });
            process2();
          });
        },
        length: function() {
          return tasks.length;
        },
        running: function() {
          return working;
        }
      };
      return cargo;
    };
    var _console_fn = function(name) {
      return function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        fn.apply(null, args.concat([function(err) {
          var args2 = Array.prototype.slice.call(arguments, 1);
          if (typeof console !== "undefined") {
            if (err) {
              if (console.error) {
                console.error(err);
              }
            } else if (console[name]) {
              _each(args2, function(x) {
                console[name](x);
              });
            }
          }
        }]));
      };
    };
    async2.log = _console_fn("log");
    async2.dir = _console_fn("dir");
    async2.memoize = function(fn, hasher) {
      var memo = {};
      var queues = {};
      hasher = hasher || function(x) {
        return x;
      };
      var memoized = function() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (key in memo) {
          callback.apply(null, memo[key]);
        } else if (key in queues) {
          queues[key].push(callback);
        } else {
          queues[key] = [callback];
          fn.apply(null, args.concat([function() {
            memo[key] = arguments;
            var q = queues[key];
            delete queues[key];
            for (var i = 0, l = q.length; i < l; i++) {
              q[i].apply(null, arguments);
            }
          }]));
        }
      };
      memoized.memo = memo;
      memoized.unmemoized = fn;
      return memoized;
    };
    async2.unmemoize = function(fn) {
      return function() {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };
    async2.times = function(count, iterator, callback) {
      var counter = [];
      for (var i = 0; i < count; i++) {
        counter.push(i);
      }
      return async2.map(counter, iterator, callback);
    };
    async2.timesSeries = function(count, iterator, callback) {
      var counter = [];
      for (var i = 0; i < count; i++) {
        counter.push(i);
      }
      return async2.mapSeries(counter, iterator, callback);
    };
    async2.compose = function() {
      var fns = Array.prototype.reverse.call(arguments);
      return function() {
        var that = this;
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        async2.reduce(
          fns,
          args,
          function(newargs, fn, cb) {
            fn.apply(that, newargs.concat([function() {
              var err = arguments[0];
              var nextargs = Array.prototype.slice.call(arguments, 1);
              cb(err, nextargs);
            }]));
          },
          function(err, results) {
            callback.apply(that, [err].concat(results));
          }
        );
      };
    };
    var _applyEach = function(eachfn, fns) {
      var go = function() {
        var that = this;
        var args2 = Array.prototype.slice.call(arguments);
        var callback = args2.pop();
        return eachfn(
          fns,
          function(fn, cb) {
            fn.apply(that, args2.concat([cb]));
          },
          callback
        );
      };
      if (arguments.length > 2) {
        var args = Array.prototype.slice.call(arguments, 2);
        return go.apply(this, args);
      } else {
        return go;
      }
    };
    async2.applyEach = doParallel(_applyEach);
    async2.applyEachSeries = doSeries(_applyEach);
    async2.forever = function(fn, callback) {
      function next(err) {
        if (err) {
          if (callback) {
            return callback(err);
          }
          throw err;
        }
        fn(next);
      }
      next();
    };
    if (module.exports) {
      module.exports = async2;
    } else {
      root.async = async2;
    }
  })();
})(async$4);
var asyncExports = async$4.exports;
var async$3 = asyncExports;
function Executor$1() {
  this.buffer = [];
  this.ready = false;
  this.queue = async$3.queue(function(task, cb) {
    var newArguments = [];
    for (var i = 0; i < task.arguments.length; i += 1) {
      newArguments.push(task.arguments[i]);
    }
    var lastArg = task.arguments[task.arguments.length - 1];
    if (typeof lastArg === "function") {
      newArguments[newArguments.length - 1] = function() {
        if (typeof setImmediate === "function") {
          setImmediate(cb);
        } else {
          process.nextTick(cb);
        }
        lastArg.apply(null, arguments);
      };
    } else if (!lastArg && task.arguments.length !== 0) {
      newArguments[newArguments.length - 1] = function() {
        cb();
      };
    } else {
      newArguments.push(function() {
        cb();
      });
    }
    task.fn.apply(task.this, newArguments);
  }, 1);
}
Executor$1.prototype.push = function(task, forceQueuing) {
  if (this.ready || forceQueuing) {
    this.queue.push(task);
  } else {
    this.buffer.push(task);
  }
};
Executor$1.prototype.processBuffer = function() {
  var i;
  this.ready = true;
  for (i = 0; i < this.buffer.length; i += 1) {
    this.queue.push(this.buffer[i]);
  }
  this.buffer = [];
};
var executor = Executor$1;
var binarySearchTree = {};
var customUtils$4 = {};
function getRandomArray(n) {
  var res, next;
  if (n === 0) {
    return [];
  }
  if (n === 1) {
    return [0];
  }
  res = getRandomArray(n - 1);
  next = Math.floor(Math.random() * n);
  res.splice(next, 0, n - 1);
  return res;
}
customUtils$4.getRandomArray = getRandomArray;
function defaultCompareKeysFunction(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  var err = new Error("Couldn't compare elements");
  err.a = a;
  err.b = b;
  throw err;
}
customUtils$4.defaultCompareKeysFunction = defaultCompareKeysFunction;
function defaultCheckValueEquality(a, b) {
  return a === b;
}
customUtils$4.defaultCheckValueEquality = defaultCheckValueEquality;
var customUtils$3 = customUtils$4;
function BinarySearchTree$2(options) {
  options = options || {};
  this.left = null;
  this.right = null;
  this.parent = options.parent !== void 0 ? options.parent : null;
  if (options.hasOwnProperty("key")) {
    this.key = options.key;
  }
  this.data = options.hasOwnProperty("value") ? [options.value] : [];
  this.unique = options.unique || false;
  this.compareKeys = options.compareKeys || customUtils$3.defaultCompareKeysFunction;
  this.checkValueEquality = options.checkValueEquality || customUtils$3.defaultCheckValueEquality;
}
BinarySearchTree$2.prototype.getMaxKeyDescendant = function() {
  if (this.right) {
    return this.right.getMaxKeyDescendant();
  } else {
    return this;
  }
};
BinarySearchTree$2.prototype.getMaxKey = function() {
  return this.getMaxKeyDescendant().key;
};
BinarySearchTree$2.prototype.getMinKeyDescendant = function() {
  if (this.left) {
    return this.left.getMinKeyDescendant();
  } else {
    return this;
  }
};
BinarySearchTree$2.prototype.getMinKey = function() {
  return this.getMinKeyDescendant().key;
};
BinarySearchTree$2.prototype.checkAllNodesFullfillCondition = function(test) {
  if (!this.hasOwnProperty("key")) {
    return;
  }
  test(this.key, this.data);
  if (this.left) {
    this.left.checkAllNodesFullfillCondition(test);
  }
  if (this.right) {
    this.right.checkAllNodesFullfillCondition(test);
  }
};
BinarySearchTree$2.prototype.checkNodeOrdering = function() {
  var self2 = this;
  if (!this.hasOwnProperty("key")) {
    return;
  }
  if (this.left) {
    this.left.checkAllNodesFullfillCondition(function(k) {
      if (self2.compareKeys(k, self2.key) >= 0) {
        throw new Error("Tree with root " + self2.key + " is not a binary search tree");
      }
    });
    this.left.checkNodeOrdering();
  }
  if (this.right) {
    this.right.checkAllNodesFullfillCondition(function(k) {
      if (self2.compareKeys(k, self2.key) <= 0) {
        throw new Error("Tree with root " + self2.key + " is not a binary search tree");
      }
    });
    this.right.checkNodeOrdering();
  }
};
BinarySearchTree$2.prototype.checkInternalPointers = function() {
  if (this.left) {
    if (this.left.parent !== this) {
      throw new Error("Parent pointer broken for key " + this.key);
    }
    this.left.checkInternalPointers();
  }
  if (this.right) {
    if (this.right.parent !== this) {
      throw new Error("Parent pointer broken for key " + this.key);
    }
    this.right.checkInternalPointers();
  }
};
BinarySearchTree$2.prototype.checkIsBST = function() {
  this.checkNodeOrdering();
  this.checkInternalPointers();
  if (this.parent) {
    throw new Error("The root shouldn't have a parent");
  }
};
BinarySearchTree$2.prototype.getNumberOfKeys = function() {
  var res;
  if (!this.hasOwnProperty("key")) {
    return 0;
  }
  res = 1;
  if (this.left) {
    res += this.left.getNumberOfKeys();
  }
  if (this.right) {
    res += this.right.getNumberOfKeys();
  }
  return res;
};
BinarySearchTree$2.prototype.createSimilar = function(options) {
  options = options || {};
  options.unique = this.unique;
  options.compareKeys = this.compareKeys;
  options.checkValueEquality = this.checkValueEquality;
  return new this.constructor(options);
};
BinarySearchTree$2.prototype.createLeftChild = function(options) {
  var leftChild = this.createSimilar(options);
  leftChild.parent = this;
  this.left = leftChild;
  return leftChild;
};
BinarySearchTree$2.prototype.createRightChild = function(options) {
  var rightChild = this.createSimilar(options);
  rightChild.parent = this;
  this.right = rightChild;
  return rightChild;
};
BinarySearchTree$2.prototype.insert = function(key, value) {
  if (!this.hasOwnProperty("key")) {
    this.key = key;
    this.data.push(value);
    return;
  }
  if (this.compareKeys(this.key, key) === 0) {
    if (this.unique) {
      var err = new Error("Can't insert key " + key + ", it violates the unique constraint");
      err.key = key;
      err.errorType = "uniqueViolated";
      throw err;
    } else {
      this.data.push(value);
    }
    return;
  }
  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      this.left.insert(key, value);
    } else {
      this.createLeftChild({ key, value });
    }
  } else {
    if (this.right) {
      this.right.insert(key, value);
    } else {
      this.createRightChild({ key, value });
    }
  }
};
BinarySearchTree$2.prototype.search = function(key) {
  if (!this.hasOwnProperty("key")) {
    return [];
  }
  if (this.compareKeys(this.key, key) === 0) {
    return this.data;
  }
  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      return this.left.search(key);
    } else {
      return [];
    }
  } else {
    if (this.right) {
      return this.right.search(key);
    } else {
      return [];
    }
  }
};
BinarySearchTree$2.prototype.getLowerBoundMatcher = function(query) {
  var self2 = this;
  if (!query.hasOwnProperty("$gt") && !query.hasOwnProperty("$gte")) {
    return function() {
      return true;
    };
  }
  if (query.hasOwnProperty("$gt") && query.hasOwnProperty("$gte")) {
    if (self2.compareKeys(query.$gte, query.$gt) === 0) {
      return function(key) {
        return self2.compareKeys(key, query.$gt) > 0;
      };
    }
    if (self2.compareKeys(query.$gte, query.$gt) > 0) {
      return function(key) {
        return self2.compareKeys(key, query.$gte) >= 0;
      };
    } else {
      return function(key) {
        return self2.compareKeys(key, query.$gt) > 0;
      };
    }
  }
  if (query.hasOwnProperty("$gt")) {
    return function(key) {
      return self2.compareKeys(key, query.$gt) > 0;
    };
  } else {
    return function(key) {
      return self2.compareKeys(key, query.$gte) >= 0;
    };
  }
};
BinarySearchTree$2.prototype.getUpperBoundMatcher = function(query) {
  var self2 = this;
  if (!query.hasOwnProperty("$lt") && !query.hasOwnProperty("$lte")) {
    return function() {
      return true;
    };
  }
  if (query.hasOwnProperty("$lt") && query.hasOwnProperty("$lte")) {
    if (self2.compareKeys(query.$lte, query.$lt) === 0) {
      return function(key) {
        return self2.compareKeys(key, query.$lt) < 0;
      };
    }
    if (self2.compareKeys(query.$lte, query.$lt) < 0) {
      return function(key) {
        return self2.compareKeys(key, query.$lte) <= 0;
      };
    } else {
      return function(key) {
        return self2.compareKeys(key, query.$lt) < 0;
      };
    }
  }
  if (query.hasOwnProperty("$lt")) {
    return function(key) {
      return self2.compareKeys(key, query.$lt) < 0;
    };
  } else {
    return function(key) {
      return self2.compareKeys(key, query.$lte) <= 0;
    };
  }
};
function append(array, toAppend) {
  var i;
  for (i = 0; i < toAppend.length; i += 1) {
    array.push(toAppend[i]);
  }
}
BinarySearchTree$2.prototype.betweenBounds = function(query, lbm, ubm) {
  var res = [];
  if (!this.hasOwnProperty("key")) {
    return [];
  }
  lbm = lbm || this.getLowerBoundMatcher(query);
  ubm = ubm || this.getUpperBoundMatcher(query);
  if (lbm(this.key) && this.left) {
    append(res, this.left.betweenBounds(query, lbm, ubm));
  }
  if (lbm(this.key) && ubm(this.key)) {
    append(res, this.data);
  }
  if (ubm(this.key) && this.right) {
    append(res, this.right.betweenBounds(query, lbm, ubm));
  }
  return res;
};
BinarySearchTree$2.prototype.deleteIfLeaf = function() {
  if (this.left || this.right) {
    return false;
  }
  if (!this.parent) {
    delete this.key;
    this.data = [];
    return true;
  }
  if (this.parent.left === this) {
    this.parent.left = null;
  } else {
    this.parent.right = null;
  }
  return true;
};
BinarySearchTree$2.prototype.deleteIfOnlyOneChild = function() {
  var child;
  if (this.left && !this.right) {
    child = this.left;
  }
  if (!this.left && this.right) {
    child = this.right;
  }
  if (!child) {
    return false;
  }
  if (!this.parent) {
    this.key = child.key;
    this.data = child.data;
    this.left = null;
    if (child.left) {
      this.left = child.left;
      child.left.parent = this;
    }
    this.right = null;
    if (child.right) {
      this.right = child.right;
      child.right.parent = this;
    }
    return true;
  }
  if (this.parent.left === this) {
    this.parent.left = child;
    child.parent = this.parent;
  } else {
    this.parent.right = child;
    child.parent = this.parent;
  }
  return true;
};
BinarySearchTree$2.prototype.delete = function(key, value) {
  var newData = [], replaceWith, self2 = this;
  if (!this.hasOwnProperty("key")) {
    return;
  }
  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      this.left.delete(key, value);
    }
    return;
  }
  if (this.compareKeys(key, this.key) > 0) {
    if (this.right) {
      this.right.delete(key, value);
    }
    return;
  }
  if (!this.compareKeys(key, this.key) === 0) {
    return;
  }
  if (this.data.length > 1 && value !== void 0) {
    this.data.forEach(function(d) {
      if (!self2.checkValueEquality(d, value)) {
        newData.push(d);
      }
    });
    self2.data = newData;
    return;
  }
  if (this.deleteIfLeaf()) {
    return;
  }
  if (this.deleteIfOnlyOneChild()) {
    return;
  }
  if (Math.random() >= 0.5) {
    replaceWith = this.left.getMaxKeyDescendant();
    this.key = replaceWith.key;
    this.data = replaceWith.data;
    if (this === replaceWith.parent) {
      this.left = replaceWith.left;
      if (replaceWith.left) {
        replaceWith.left.parent = replaceWith.parent;
      }
    } else {
      replaceWith.parent.right = replaceWith.left;
      if (replaceWith.left) {
        replaceWith.left.parent = replaceWith.parent;
      }
    }
  } else {
    replaceWith = this.right.getMinKeyDescendant();
    this.key = replaceWith.key;
    this.data = replaceWith.data;
    if (this === replaceWith.parent) {
      this.right = replaceWith.right;
      if (replaceWith.right) {
        replaceWith.right.parent = replaceWith.parent;
      }
    } else {
      replaceWith.parent.left = replaceWith.right;
      if (replaceWith.right) {
        replaceWith.right.parent = replaceWith.parent;
      }
    }
  }
};
BinarySearchTree$2.prototype.executeOnEveryNode = function(fn) {
  if (this.left) {
    this.left.executeOnEveryNode(fn);
  }
  fn(this);
  if (this.right) {
    this.right.executeOnEveryNode(fn);
  }
};
BinarySearchTree$2.prototype.prettyPrint = function(printData, spacing) {
  spacing = spacing || "";
  console.log(spacing + "* " + this.key);
  if (printData) {
    console.log(spacing + "* " + this.data);
  }
  if (!this.left && !this.right) {
    return;
  }
  if (this.left) {
    this.left.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
  if (this.right) {
    this.right.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
};
var bst = BinarySearchTree$2;
var BinarySearchTree$1 = bst, customUtils$2 = customUtils$4, util$2 = require$$1;
function AVLTree(options) {
  this.tree = new _AVLTree(options);
}
function _AVLTree(options) {
  options = options || {};
  this.left = null;
  this.right = null;
  this.parent = options.parent !== void 0 ? options.parent : null;
  if (options.hasOwnProperty("key")) {
    this.key = options.key;
  }
  this.data = options.hasOwnProperty("value") ? [options.value] : [];
  this.unique = options.unique || false;
  this.compareKeys = options.compareKeys || customUtils$2.defaultCompareKeysFunction;
  this.checkValueEquality = options.checkValueEquality || customUtils$2.defaultCheckValueEquality;
}
util$2.inherits(_AVLTree, BinarySearchTree$1);
AVLTree._AVLTree = _AVLTree;
_AVLTree.prototype.checkHeightCorrect = function() {
  var leftH, rightH;
  if (!this.hasOwnProperty("key")) {
    return;
  }
  if (this.left && this.left.height === void 0) {
    throw new Error("Undefined height for node " + this.left.key);
  }
  if (this.right && this.right.height === void 0) {
    throw new Error("Undefined height for node " + this.right.key);
  }
  if (this.height === void 0) {
    throw new Error("Undefined height for node " + this.key);
  }
  leftH = this.left ? this.left.height : 0;
  rightH = this.right ? this.right.height : 0;
  if (this.height !== 1 + Math.max(leftH, rightH)) {
    throw new Error("Height constraint failed for node " + this.key);
  }
  if (this.left) {
    this.left.checkHeightCorrect();
  }
  if (this.right) {
    this.right.checkHeightCorrect();
  }
};
_AVLTree.prototype.balanceFactor = function() {
  var leftH = this.left ? this.left.height : 0, rightH = this.right ? this.right.height : 0;
  return leftH - rightH;
};
_AVLTree.prototype.checkBalanceFactors = function() {
  if (Math.abs(this.balanceFactor()) > 1) {
    throw new Error("Tree is unbalanced at node " + this.key);
  }
  if (this.left) {
    this.left.checkBalanceFactors();
  }
  if (this.right) {
    this.right.checkBalanceFactors();
  }
};
_AVLTree.prototype.checkIsAVLT = function() {
  _AVLTree.super_.prototype.checkIsBST.call(this);
  this.checkHeightCorrect();
  this.checkBalanceFactors();
};
AVLTree.prototype.checkIsAVLT = function() {
  this.tree.checkIsAVLT();
};
_AVLTree.prototype.rightRotation = function() {
  var q = this, p = this.left, b, ah, bh, ch;
  if (!p) {
    return this;
  }
  b = p.right;
  if (q.parent) {
    p.parent = q.parent;
    if (q.parent.left === q) {
      q.parent.left = p;
    } else {
      q.parent.right = p;
    }
  } else {
    p.parent = null;
  }
  p.right = q;
  q.parent = p;
  q.left = b;
  if (b) {
    b.parent = q;
  }
  ah = p.left ? p.left.height : 0;
  bh = b ? b.height : 0;
  ch = q.right ? q.right.height : 0;
  q.height = Math.max(bh, ch) + 1;
  p.height = Math.max(ah, q.height) + 1;
  return p;
};
_AVLTree.prototype.leftRotation = function() {
  var p = this, q = this.right, b, ah, bh, ch;
  if (!q) {
    return this;
  }
  b = q.left;
  if (p.parent) {
    q.parent = p.parent;
    if (p.parent.left === p) {
      p.parent.left = q;
    } else {
      p.parent.right = q;
    }
  } else {
    q.parent = null;
  }
  q.left = p;
  p.parent = q;
  p.right = b;
  if (b) {
    b.parent = p;
  }
  ah = p.left ? p.left.height : 0;
  bh = b ? b.height : 0;
  ch = q.right ? q.right.height : 0;
  p.height = Math.max(ah, bh) + 1;
  q.height = Math.max(ch, p.height) + 1;
  return q;
};
_AVLTree.prototype.rightTooSmall = function() {
  if (this.balanceFactor() <= 1) {
    return this;
  }
  if (this.left.balanceFactor() < 0) {
    this.left.leftRotation();
  }
  return this.rightRotation();
};
_AVLTree.prototype.leftTooSmall = function() {
  if (this.balanceFactor() >= -1) {
    return this;
  }
  if (this.right.balanceFactor() > 0) {
    this.right.rightRotation();
  }
  return this.leftRotation();
};
_AVLTree.prototype.rebalanceAlongPath = function(path2) {
  var newRoot = this, rotated, i;
  if (!this.hasOwnProperty("key")) {
    delete this.height;
    return this;
  }
  for (i = path2.length - 1; i >= 0; i -= 1) {
    path2[i].height = 1 + Math.max(path2[i].left ? path2[i].left.height : 0, path2[i].right ? path2[i].right.height : 0);
    if (path2[i].balanceFactor() > 1) {
      rotated = path2[i].rightTooSmall();
      if (i === 0) {
        newRoot = rotated;
      }
    }
    if (path2[i].balanceFactor() < -1) {
      rotated = path2[i].leftTooSmall();
      if (i === 0) {
        newRoot = rotated;
      }
    }
  }
  return newRoot;
};
_AVLTree.prototype.insert = function(key, value) {
  var insertPath = [], currentNode = this;
  if (!this.hasOwnProperty("key")) {
    this.key = key;
    this.data.push(value);
    this.height = 1;
    return this;
  }
  while (true) {
    if (currentNode.compareKeys(currentNode.key, key) === 0) {
      if (currentNode.unique) {
        var err = new Error("Can't insert key " + key + ", it violates the unique constraint");
        err.key = key;
        err.errorType = "uniqueViolated";
        throw err;
      } else {
        currentNode.data.push(value);
      }
      return this;
    }
    insertPath.push(currentNode);
    if (currentNode.compareKeys(key, currentNode.key) < 0) {
      if (!currentNode.left) {
        insertPath.push(currentNode.createLeftChild({ key, value }));
        break;
      } else {
        currentNode = currentNode.left;
      }
    } else {
      if (!currentNode.right) {
        insertPath.push(currentNode.createRightChild({ key, value }));
        break;
      } else {
        currentNode = currentNode.right;
      }
    }
  }
  return this.rebalanceAlongPath(insertPath);
};
AVLTree.prototype.insert = function(key, value) {
  var newTree = this.tree.insert(key, value);
  if (newTree) {
    this.tree = newTree;
  }
};
_AVLTree.prototype.delete = function(key, value) {
  var newData = [], replaceWith, currentNode = this, deletePath = [];
  if (!this.hasOwnProperty("key")) {
    return this;
  }
  while (true) {
    if (currentNode.compareKeys(key, currentNode.key) === 0) {
      break;
    }
    deletePath.push(currentNode);
    if (currentNode.compareKeys(key, currentNode.key) < 0) {
      if (currentNode.left) {
        currentNode = currentNode.left;
      } else {
        return this;
      }
    } else {
      if (currentNode.right) {
        currentNode = currentNode.right;
      } else {
        return this;
      }
    }
  }
  if (currentNode.data.length > 1 && value) {
    currentNode.data.forEach(function(d) {
      if (!currentNode.checkValueEquality(d, value)) {
        newData.push(d);
      }
    });
    currentNode.data = newData;
    return this;
  }
  if (!currentNode.left && !currentNode.right) {
    if (currentNode === this) {
      delete currentNode.key;
      currentNode.data = [];
      delete currentNode.height;
      return this;
    } else {
      if (currentNode.parent.left === currentNode) {
        currentNode.parent.left = null;
      } else {
        currentNode.parent.right = null;
      }
      return this.rebalanceAlongPath(deletePath);
    }
  }
  if (!currentNode.left || !currentNode.right) {
    replaceWith = currentNode.left ? currentNode.left : currentNode.right;
    if (currentNode === this) {
      replaceWith.parent = null;
      return replaceWith;
    } else {
      if (currentNode.parent.left === currentNode) {
        currentNode.parent.left = replaceWith;
        replaceWith.parent = currentNode.parent;
      } else {
        currentNode.parent.right = replaceWith;
        replaceWith.parent = currentNode.parent;
      }
      return this.rebalanceAlongPath(deletePath);
    }
  }
  deletePath.push(currentNode);
  replaceWith = currentNode.left;
  if (!replaceWith.right) {
    currentNode.key = replaceWith.key;
    currentNode.data = replaceWith.data;
    currentNode.left = replaceWith.left;
    if (replaceWith.left) {
      replaceWith.left.parent = currentNode;
    }
    return this.rebalanceAlongPath(deletePath);
  }
  while (true) {
    if (replaceWith.right) {
      deletePath.push(replaceWith);
      replaceWith = replaceWith.right;
    } else {
      break;
    }
  }
  currentNode.key = replaceWith.key;
  currentNode.data = replaceWith.data;
  replaceWith.parent.right = replaceWith.left;
  if (replaceWith.left) {
    replaceWith.left.parent = replaceWith.parent;
  }
  return this.rebalanceAlongPath(deletePath);
};
AVLTree.prototype.delete = function(key, value) {
  var newTree = this.tree.delete(key, value);
  if (newTree) {
    this.tree = newTree;
  }
};
["getNumberOfKeys", "search", "betweenBounds", "prettyPrint", "executeOnEveryNode"].forEach(function(fn) {
  AVLTree.prototype[fn] = function() {
    return this.tree[fn].apply(this.tree, arguments);
  };
});
var avltree = AVLTree;
binarySearchTree.BinarySearchTree = bst;
binarySearchTree.AVLTree = avltree;
var BinarySearchTree = binarySearchTree.AVLTree, model$3 = model$4, _$2 = underscoreExports, util$1 = require$$1;
function checkValueEquality(a, b) {
  return a === b;
}
function projectForUnique(elt) {
  if (elt === null) {
    return "$null";
  }
  if (typeof elt === "string") {
    return "$string" + elt;
  }
  if (typeof elt === "boolean") {
    return "$boolean" + elt;
  }
  if (typeof elt === "number") {
    return "$number" + elt;
  }
  if (util$1.isArray(elt)) {
    return "$date" + elt.getTime();
  }
  return elt;
}
function Index$2(options) {
  this.fieldName = options.fieldName;
  this.unique = options.unique || false;
  this.sparse = options.sparse || false;
  this.treeOptions = { unique: this.unique, compareKeys: model$3.compareThings, checkValueEquality };
  this.reset();
}
Index$2.prototype.reset = function(newData) {
  this.tree = new BinarySearchTree(this.treeOptions);
  if (newData) {
    this.insert(newData);
  }
};
Index$2.prototype.insert = function(doc) {
  var key, keys, i, failingI, error;
  if (util$1.isArray(doc)) {
    this.insertMultipleDocs(doc);
    return;
  }
  key = model$3.getDotValue(doc, this.fieldName);
  if (key === void 0 && this.sparse) {
    return;
  }
  if (!util$1.isArray(key)) {
    this.tree.insert(key, doc);
  } else {
    keys = _$2.uniq(key, projectForUnique);
    for (i = 0; i < keys.length; i += 1) {
      try {
        this.tree.insert(keys[i], doc);
      } catch (e) {
        error = e;
        failingI = i;
        break;
      }
    }
    if (error) {
      for (i = 0; i < failingI; i += 1) {
        this.tree.delete(keys[i], doc);
      }
      throw error;
    }
  }
};
Index$2.prototype.insertMultipleDocs = function(docs) {
  var i, error, failingI;
  for (i = 0; i < docs.length; i += 1) {
    try {
      this.insert(docs[i]);
    } catch (e) {
      error = e;
      failingI = i;
      break;
    }
  }
  if (error) {
    for (i = 0; i < failingI; i += 1) {
      this.remove(docs[i]);
    }
    throw error;
  }
};
Index$2.prototype.remove = function(doc) {
  var key, self2 = this;
  if (util$1.isArray(doc)) {
    doc.forEach(function(d) {
      self2.remove(d);
    });
    return;
  }
  key = model$3.getDotValue(doc, this.fieldName);
  if (key === void 0 && this.sparse) {
    return;
  }
  if (!util$1.isArray(key)) {
    this.tree.delete(key, doc);
  } else {
    _$2.uniq(key, projectForUnique).forEach(function(_key) {
      self2.tree.delete(_key, doc);
    });
  }
};
Index$2.prototype.update = function(oldDoc, newDoc) {
  if (util$1.isArray(oldDoc)) {
    this.updateMultipleDocs(oldDoc);
    return;
  }
  this.remove(oldDoc);
  try {
    this.insert(newDoc);
  } catch (e) {
    this.insert(oldDoc);
    throw e;
  }
};
Index$2.prototype.updateMultipleDocs = function(pairs) {
  var i, failingI, error;
  for (i = 0; i < pairs.length; i += 1) {
    this.remove(pairs[i].oldDoc);
  }
  for (i = 0; i < pairs.length; i += 1) {
    try {
      this.insert(pairs[i].newDoc);
    } catch (e) {
      error = e;
      failingI = i;
      break;
    }
  }
  if (error) {
    for (i = 0; i < failingI; i += 1) {
      this.remove(pairs[i].newDoc);
    }
    for (i = 0; i < pairs.length; i += 1) {
      this.insert(pairs[i].oldDoc);
    }
    throw error;
  }
};
Index$2.prototype.revertUpdate = function(oldDoc, newDoc) {
  var revert = [];
  if (!util$1.isArray(oldDoc)) {
    this.update(newDoc, oldDoc);
  } else {
    oldDoc.forEach(function(pair) {
      revert.push({ oldDoc: pair.newDoc, newDoc: pair.oldDoc });
    });
    this.update(revert);
  }
};
Index$2.prototype.getMatching = function(value) {
  var self2 = this;
  if (!util$1.isArray(value)) {
    return self2.tree.search(value);
  } else {
    var _res = {}, res = [];
    value.forEach(function(v) {
      self2.getMatching(v).forEach(function(doc) {
        _res[doc._id] = doc;
      });
    });
    Object.keys(_res).forEach(function(_id) {
      res.push(_res[_id]);
    });
    return res;
  }
};
Index$2.prototype.getBetweenBounds = function(query) {
  return this.tree.betweenBounds(query);
};
Index$2.prototype.getAll = function() {
  var res = [];
  this.tree.executeOnEveryNode(function(node2) {
    var i;
    for (i = 0; i < node2.data.length; i += 1) {
      res.push(node2.data[i]);
    }
  });
  return res;
};
var indexes = Index$2;
var path$2 = require$$0$1;
var fs$1 = require$$3;
var _0777 = parseInt("0777", 8);
var mkdirp$1 = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP(p, opts, f, made) {
  if (typeof opts === "function") {
    f = opts;
    opts = {};
  } else if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  var mode = opts.mode;
  var xfs = opts.fs || fs$1;
  if (mode === void 0) {
    mode = _0777;
  }
  if (!made) made = null;
  var cb = f || /* istanbul ignore next */
  function() {
  };
  p = path$2.resolve(p);
  xfs.mkdir(p, mode, function(er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
      case "ENOENT":
        if (path$2.dirname(p) === p) return cb(er);
        mkdirP(path$2.dirname(p), opts, function(er2, made2) {
          if (er2) cb(er2, made2);
          else mkdirP(p, opts, cb, made2);
        });
        break;
      default:
        xfs.stat(p, function(er2, stat) {
          if (er2 || !stat.isDirectory()) cb(er, made);
          else cb(null, made);
        });
        break;
    }
  });
}
mkdirP.sync = function sync(p, opts, made) {
  if (!opts || typeof opts !== "object") {
    opts = { mode: opts };
  }
  var mode = opts.mode;
  var xfs = opts.fs || fs$1;
  if (mode === void 0) {
    mode = _0777;
  }
  if (!made) made = null;
  p = path$2.resolve(p);
  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    switch (err0.code) {
      case "ENOENT":
        made = sync(path$2.dirname(p), opts, made);
        sync(p, opts, made);
        break;
      default:
        var stat;
        try {
          stat = xfs.statSync(p);
        } catch (err1) {
          throw err0;
        }
        if (!stat.isDirectory()) throw err0;
        break;
    }
  }
  return made;
};
var fs = require$$3, mkdirp = mkdirp$1, async$2 = asyncExports, path$1 = require$$0$1, storage$1 = {};
storage$1.exists = fs.exists;
storage$1.rename = fs.rename;
storage$1.writeFile = fs.writeFile;
storage$1.unlink = fs.unlink;
storage$1.appendFile = fs.appendFile;
storage$1.readFile = fs.readFile;
storage$1.mkdirp = mkdirp;
storage$1.ensureFileDoesntExist = function(file, callback) {
  storage$1.exists(file, function(exists) {
    if (!exists) {
      return callback(null);
    }
    storage$1.unlink(file, function(err) {
      return callback(err);
    });
  });
};
storage$1.flushToStorage = function(options, callback) {
  var filename, flags;
  if (typeof options === "string") {
    filename = options;
    flags = "r+";
  } else {
    filename = options.filename;
    flags = options.isDir ? "r" : "r+";
  }
  if (flags === "r" && (process.platform === "win32" || process.platform === "win64")) {
    return callback(null);
  }
  fs.open(filename, flags, function(err, fd) {
    if (err) {
      return callback(err);
    }
    fs.fsync(fd, function(errFS) {
      fs.close(fd, function(errC) {
        if (errFS || errC) {
          var e = new Error("Failed to flush to storage");
          e.errorOnFsync = errFS;
          e.errorOnClose = errC;
          return callback(e);
        } else {
          return callback(null);
        }
      });
    });
  });
};
storage$1.crashSafeWriteFile = function(filename, data, cb) {
  var callback = cb || function() {
  }, tempFilename = filename + "~";
  async$2.waterfall([
    async$2.apply(storage$1.flushToStorage, { filename: path$1.dirname(filename), isDir: true }),
    function(cb2) {
      storage$1.exists(filename, function(exists) {
        if (exists) {
          storage$1.flushToStorage(filename, function(err) {
            return cb2(err);
          });
        } else {
          return cb2();
        }
      });
    },
    function(cb2) {
      storage$1.writeFile(tempFilename, data, function(err) {
        return cb2(err);
      });
    },
    async$2.apply(storage$1.flushToStorage, tempFilename),
    function(cb2) {
      storage$1.rename(tempFilename, filename, function(err) {
        return cb2(err);
      });
    },
    async$2.apply(storage$1.flushToStorage, { filename: path$1.dirname(filename), isDir: true })
  ], function(err) {
    return callback(err);
  });
};
storage$1.ensureDatafileIntegrity = function(filename, callback) {
  var tempFilename = filename + "~";
  storage$1.exists(filename, function(filenameExists) {
    if (filenameExists) {
      return callback(null);
    }
    storage$1.exists(tempFilename, function(oldFilenameExists) {
      if (!oldFilenameExists) {
        return storage$1.writeFile(filename, "", "utf8", function(err) {
          callback(err);
        });
      }
      storage$1.rename(tempFilename, filename, function(err) {
        return callback(err);
      });
    });
  });
};
var storage_1 = storage$1;
var storage = storage_1, path = require$$0$1, model$2 = model$4, async$1 = asyncExports, customUtils$1 = customUtils$5, Index$1 = indexes;
function Persistence$1(options) {
  var i, j, randomString;
  this.db = options.db;
  this.inMemoryOnly = this.db.inMemoryOnly;
  this.filename = this.db.filename;
  this.corruptAlertThreshold = options.corruptAlertThreshold !== void 0 ? options.corruptAlertThreshold : 0.1;
  if (!this.inMemoryOnly && this.filename && this.filename.charAt(this.filename.length - 1) === "~") {
    throw new Error("The datafile name can't end with a ~, which is reserved for crash safe backup files");
  }
  if (options.afterSerialization && !options.beforeDeserialization) {
    throw new Error("Serialization hook defined but deserialization hook undefined, cautiously refusing to start NeDB to prevent dataloss");
  }
  if (!options.afterSerialization && options.beforeDeserialization) {
    throw new Error("Serialization hook undefined but deserialization hook defined, cautiously refusing to start NeDB to prevent dataloss");
  }
  this.afterSerialization = options.afterSerialization || function(s) {
    return s;
  };
  this.beforeDeserialization = options.beforeDeserialization || function(s) {
    return s;
  };
  for (i = 1; i < 30; i += 1) {
    for (j = 0; j < 10; j += 1) {
      randomString = customUtils$1.uid(i);
      if (this.beforeDeserialization(this.afterSerialization(randomString)) !== randomString) {
        throw new Error("beforeDeserialization is not the reverse of afterSerialization, cautiously refusing to start NeDB to prevent dataloss");
      }
    }
  }
  if (this.filename && options.nodeWebkitAppName) {
    console.log("==================================================================");
    console.log("WARNING: The nodeWebkitAppName option is deprecated");
    console.log("To get the path to the directory where Node Webkit stores the data");
    console.log("for your app, use the internal nw.gui module like this");
    console.log("require('nw.gui').App.dataPath");
    console.log("See https://github.com/rogerwang/node-webkit/issues/500");
    console.log("==================================================================");
    this.filename = Persistence$1.getNWAppFilename(options.nodeWebkitAppName, this.filename);
  }
}
Persistence$1.ensureDirectoryExists = function(dir, cb) {
  var callback = cb || function() {
  };
  storage.mkdirp(dir, function(err) {
    return callback(err);
  });
};
Persistence$1.getNWAppFilename = function(appName, relativeFilename) {
  var home;
  switch (process.platform) {
    case "win32":
    case "win64":
      home = process.env.LOCALAPPDATA || process.env.APPDATA;
      if (!home) {
        throw new Error("Couldn't find the base application data folder");
      }
      home = path.join(home, appName);
      break;
    case "darwin":
      home = process.env.HOME;
      if (!home) {
        throw new Error("Couldn't find the base application data directory");
      }
      home = path.join(home, "Library", "Application Support", appName);
      break;
    case "linux":
      home = process.env.HOME;
      if (!home) {
        throw new Error("Couldn't find the base application data directory");
      }
      home = path.join(home, ".config", appName);
      break;
    default:
      throw new Error("Can't use the Node Webkit relative path for platform " + process.platform);
  }
  return path.join(home, "nedb-data", relativeFilename);
};
Persistence$1.prototype.persistCachedDatabase = function(cb) {
  var callback = cb || function() {
  }, toPersist = "", self2 = this;
  if (this.inMemoryOnly) {
    return callback(null);
  }
  this.db.getAllData().forEach(function(doc) {
    toPersist += self2.afterSerialization(model$2.serialize(doc)) + "\n";
  });
  Object.keys(this.db.indexes).forEach(function(fieldName) {
    if (fieldName != "_id") {
      toPersist += self2.afterSerialization(model$2.serialize({ $$indexCreated: { fieldName, unique: self2.db.indexes[fieldName].unique, sparse: self2.db.indexes[fieldName].sparse } })) + "\n";
    }
  });
  storage.crashSafeWriteFile(this.filename, toPersist, function(err) {
    if (err) {
      return callback(err);
    }
    self2.db.emit("compaction.done");
    return callback(null);
  });
};
Persistence$1.prototype.compactDatafile = function() {
  this.db.executor.push({ this: this, fn: this.persistCachedDatabase, arguments: [] });
};
Persistence$1.prototype.setAutocompactionInterval = function(interval) {
  var self2 = this, minInterval = 5e3, realInterval = Math.max(interval || 0, minInterval);
  this.stopAutocompaction();
  this.autocompactionIntervalId = setInterval(function() {
    self2.compactDatafile();
  }, realInterval);
};
Persistence$1.prototype.stopAutocompaction = function() {
  if (this.autocompactionIntervalId) {
    clearInterval(this.autocompactionIntervalId);
  }
};
Persistence$1.prototype.persistNewState = function(newDocs, cb) {
  var self2 = this, toPersist = "", callback = cb || function() {
  };
  if (self2.inMemoryOnly) {
    return callback(null);
  }
  newDocs.forEach(function(doc) {
    toPersist += self2.afterSerialization(model$2.serialize(doc)) + "\n";
  });
  if (toPersist.length === 0) {
    return callback(null);
  }
  storage.appendFile(self2.filename, toPersist, "utf8", function(err) {
    return callback(err);
  });
};
Persistence$1.prototype.treatRawData = function(rawData) {
  var data = rawData.split("\n"), dataById = {}, tdata = [], i, indexes2 = {}, corruptItems = -1;
  for (i = 0; i < data.length; i += 1) {
    var doc;
    try {
      doc = model$2.deserialize(this.beforeDeserialization(data[i]));
      if (doc._id) {
        if (doc.$$deleted === true) {
          delete dataById[doc._id];
        } else {
          dataById[doc._id] = doc;
        }
      } else if (doc.$$indexCreated && doc.$$indexCreated.fieldName != void 0) {
        indexes2[doc.$$indexCreated.fieldName] = doc.$$indexCreated;
      } else if (typeof doc.$$indexRemoved === "string") {
        delete indexes2[doc.$$indexRemoved];
      }
    } catch (e) {
      corruptItems += 1;
    }
  }
  if (data.length > 0 && corruptItems / data.length > this.corruptAlertThreshold) {
    throw new Error("More than " + Math.floor(100 * this.corruptAlertThreshold) + "% of the data file is corrupt, the wrong beforeDeserialization hook may be used. Cautiously refusing to start NeDB to prevent dataloss");
  }
  Object.keys(dataById).forEach(function(k) {
    tdata.push(dataById[k]);
  });
  return { data: tdata, indexes: indexes2 };
};
Persistence$1.prototype.loadDatabase = function(cb) {
  var callback = cb || function() {
  }, self2 = this;
  self2.db.resetIndexes();
  if (self2.inMemoryOnly) {
    return callback(null);
  }
  async$1.waterfall([
    function(cb2) {
      Persistence$1.ensureDirectoryExists(path.dirname(self2.filename), function(err) {
        storage.ensureDatafileIntegrity(self2.filename, function(err2) {
          storage.readFile(self2.filename, "utf8", function(err3, rawData) {
            if (err3) {
              return cb2(err3);
            }
            try {
              var treatedData = self2.treatRawData(rawData);
            } catch (e) {
              return cb2(e);
            }
            Object.keys(treatedData.indexes).forEach(function(key) {
              self2.db.indexes[key] = new Index$1(treatedData.indexes[key]);
            });
            try {
              self2.db.resetIndexes(treatedData.data);
            } catch (e) {
              self2.db.resetIndexes();
              return cb2(e);
            }
            self2.db.persistence.persistCachedDatabase(cb2);
          });
        });
      });
    }
  ], function(err) {
    if (err) {
      return callback(err);
    }
    self2.db.executor.processBuffer();
    return callback(null);
  });
};
var persistence = Persistence$1;
var model$1 = model$4, _$1 = underscoreExports;
function Cursor$1(db2, query, execFn) {
  this.db = db2;
  this.query = query || {};
  if (execFn) {
    this.execFn = execFn;
  }
}
Cursor$1.prototype.limit = function(limit) {
  this._limit = limit;
  return this;
};
Cursor$1.prototype.skip = function(skip) {
  this._skip = skip;
  return this;
};
Cursor$1.prototype.sort = function(sortQuery) {
  this._sort = sortQuery;
  return this;
};
Cursor$1.prototype.projection = function(projection) {
  this._projection = projection;
  return this;
};
Cursor$1.prototype.project = function(candidates) {
  var res = [], self2 = this, keepId, action, keys;
  if (this._projection === void 0 || Object.keys(this._projection).length === 0) {
    return candidates;
  }
  keepId = this._projection._id === 0 ? false : true;
  this._projection = _$1.omit(this._projection, "_id");
  keys = Object.keys(this._projection);
  keys.forEach(function(k) {
    if (action !== void 0 && self2._projection[k] !== action) {
      throw new Error("Can't both keep and omit fields except for _id");
    }
    action = self2._projection[k];
  });
  candidates.forEach(function(candidate) {
    var toPush;
    if (action === 1) {
      toPush = { $set: {} };
      keys.forEach(function(k) {
        toPush.$set[k] = model$1.getDotValue(candidate, k);
        if (toPush.$set[k] === void 0) {
          delete toPush.$set[k];
        }
      });
      toPush = model$1.modify({}, toPush);
    } else {
      toPush = { $unset: {} };
      keys.forEach(function(k) {
        toPush.$unset[k] = true;
      });
      toPush = model$1.modify(candidate, toPush);
    }
    if (keepId) {
      toPush._id = candidate._id;
    } else {
      delete toPush._id;
    }
    res.push(toPush);
  });
  return res;
};
Cursor$1.prototype._exec = function(_callback) {
  var res = [], added = 0, skipped = 0, self2 = this, error = null, i, keys, key;
  function callback(error2, res2) {
    if (self2.execFn) {
      return self2.execFn(error2, res2, _callback);
    } else {
      return _callback(error2, res2);
    }
  }
  this.db.getCandidates(this.query, function(err, candidates) {
    if (err) {
      return callback(err);
    }
    try {
      for (i = 0; i < candidates.length; i += 1) {
        if (model$1.match(candidates[i], self2.query)) {
          if (!self2._sort) {
            if (self2._skip && self2._skip > skipped) {
              skipped += 1;
            } else {
              res.push(candidates[i]);
              added += 1;
              if (self2._limit && self2._limit <= added) {
                break;
              }
            }
          } else {
            res.push(candidates[i]);
          }
        }
      }
    } catch (err2) {
      return callback(err2);
    }
    if (self2._sort) {
      keys = Object.keys(self2._sort);
      var criteria = [];
      for (i = 0; i < keys.length; i++) {
        key = keys[i];
        criteria.push({ key, direction: self2._sort[key] });
      }
      res.sort(function(a, b) {
        var criterion, compare, i2;
        for (i2 = 0; i2 < criteria.length; i2++) {
          criterion = criteria[i2];
          compare = criterion.direction * model$1.compareThings(model$1.getDotValue(a, criterion.key), model$1.getDotValue(b, criterion.key), self2.db.compareStrings);
          if (compare !== 0) {
            return compare;
          }
        }
        return 0;
      });
      var limit = self2._limit || res.length, skip = self2._skip || 0;
      res = res.slice(skip, skip + limit);
    }
    try {
      res = self2.project(res);
    } catch (e) {
      error = e;
      res = void 0;
    }
    return callback(error, res);
  });
};
Cursor$1.prototype.exec = function() {
  this.db.executor.push({ this: this, fn: this._exec, arguments });
};
var cursor = Cursor$1;
var customUtils = customUtils$5, model = model$4, async = asyncExports, Executor = executor, Index = indexes, util = require$$1, _ = underscoreExports, Persistence = persistence, Cursor = cursor;
function Datastore$2(options) {
  var filename;
  if (typeof options === "string") {
    filename = options;
    this.inMemoryOnly = false;
  } else {
    options = options || {};
    filename = options.filename;
    this.inMemoryOnly = options.inMemoryOnly || false;
    this.autoload = options.autoload || false;
    this.timestampData = options.timestampData || false;
  }
  if (!filename || typeof filename !== "string" || filename.length === 0) {
    this.filename = null;
    this.inMemoryOnly = true;
  } else {
    this.filename = filename;
  }
  this.compareStrings = options.compareStrings;
  this.persistence = new Persistence({
    db: this,
    nodeWebkitAppName: options.nodeWebkitAppName,
    afterSerialization: options.afterSerialization,
    beforeDeserialization: options.beforeDeserialization,
    corruptAlertThreshold: options.corruptAlertThreshold
  });
  this.executor = new Executor();
  if (this.inMemoryOnly) {
    this.executor.ready = true;
  }
  this.indexes = {};
  this.indexes._id = new Index({ fieldName: "_id", unique: true });
  this.ttlIndexes = {};
  if (this.autoload) {
    this.loadDatabase(options.onload || function(err) {
      if (err) {
        throw err;
      }
    });
  }
}
util.inherits(Datastore$2, require$$9.EventEmitter);
Datastore$2.prototype.loadDatabase = function() {
  this.executor.push({ this: this.persistence, fn: this.persistence.loadDatabase, arguments }, true);
};
Datastore$2.prototype.getAllData = function() {
  return this.indexes._id.getAll();
};
Datastore$2.prototype.resetIndexes = function(newData) {
  var self2 = this;
  Object.keys(this.indexes).forEach(function(i) {
    self2.indexes[i].reset(newData);
  });
};
Datastore$2.prototype.ensureIndex = function(options, cb) {
  var err, callback = cb || function() {
  };
  options = options || {};
  if (!options.fieldName) {
    err = new Error("Cannot create an index without a fieldName");
    err.missingFieldName = true;
    return callback(err);
  }
  if (this.indexes[options.fieldName]) {
    return callback(null);
  }
  this.indexes[options.fieldName] = new Index(options);
  if (options.expireAfterSeconds !== void 0) {
    this.ttlIndexes[options.fieldName] = options.expireAfterSeconds;
  }
  try {
    this.indexes[options.fieldName].insert(this.getAllData());
  } catch (e) {
    delete this.indexes[options.fieldName];
    return callback(e);
  }
  this.persistence.persistNewState([{ $$indexCreated: options }], function(err2) {
    if (err2) {
      return callback(err2);
    }
    return callback(null);
  });
};
Datastore$2.prototype.removeIndex = function(fieldName, cb) {
  var callback = cb || function() {
  };
  delete this.indexes[fieldName];
  this.persistence.persistNewState([{ $$indexRemoved: fieldName }], function(err) {
    if (err) {
      return callback(err);
    }
    return callback(null);
  });
};
Datastore$2.prototype.addToIndexes = function(doc) {
  var i, failingIndex, error, keys = Object.keys(this.indexes);
  for (i = 0; i < keys.length; i += 1) {
    try {
      this.indexes[keys[i]].insert(doc);
    } catch (e) {
      failingIndex = i;
      error = e;
      break;
    }
  }
  if (error) {
    for (i = 0; i < failingIndex; i += 1) {
      this.indexes[keys[i]].remove(doc);
    }
    throw error;
  }
};
Datastore$2.prototype.removeFromIndexes = function(doc) {
  var self2 = this;
  Object.keys(this.indexes).forEach(function(i) {
    self2.indexes[i].remove(doc);
  });
};
Datastore$2.prototype.updateIndexes = function(oldDoc, newDoc) {
  var i, failingIndex, error, keys = Object.keys(this.indexes);
  for (i = 0; i < keys.length; i += 1) {
    try {
      this.indexes[keys[i]].update(oldDoc, newDoc);
    } catch (e) {
      failingIndex = i;
      error = e;
      break;
    }
  }
  if (error) {
    for (i = 0; i < failingIndex; i += 1) {
      this.indexes[keys[i]].revertUpdate(oldDoc, newDoc);
    }
    throw error;
  }
};
Datastore$2.prototype.getCandidates = function(query, dontExpireStaleDocs, callback) {
  var indexNames = Object.keys(this.indexes), self2 = this, usableQueryKeys;
  if (typeof dontExpireStaleDocs === "function") {
    callback = dontExpireStaleDocs;
    dontExpireStaleDocs = false;
  }
  async.waterfall([
    // STEP 1: get candidates list by checking indexes from most to least frequent usecase
    function(cb) {
      usableQueryKeys = [];
      Object.keys(query).forEach(function(k) {
        if (typeof query[k] === "string" || typeof query[k] === "number" || typeof query[k] === "boolean" || util.isDate(query[k]) || query[k] === null) {
          usableQueryKeys.push(k);
        }
      });
      usableQueryKeys = _.intersection(usableQueryKeys, indexNames);
      if (usableQueryKeys.length > 0) {
        return cb(null, self2.indexes[usableQueryKeys[0]].getMatching(query[usableQueryKeys[0]]));
      }
      usableQueryKeys = [];
      Object.keys(query).forEach(function(k) {
        if (query[k] && query[k].hasOwnProperty("$in")) {
          usableQueryKeys.push(k);
        }
      });
      usableQueryKeys = _.intersection(usableQueryKeys, indexNames);
      if (usableQueryKeys.length > 0) {
        return cb(null, self2.indexes[usableQueryKeys[0]].getMatching(query[usableQueryKeys[0]].$in));
      }
      usableQueryKeys = [];
      Object.keys(query).forEach(function(k) {
        if (query[k] && (query[k].hasOwnProperty("$lt") || query[k].hasOwnProperty("$lte") || query[k].hasOwnProperty("$gt") || query[k].hasOwnProperty("$gte"))) {
          usableQueryKeys.push(k);
        }
      });
      usableQueryKeys = _.intersection(usableQueryKeys, indexNames);
      if (usableQueryKeys.length > 0) {
        return cb(null, self2.indexes[usableQueryKeys[0]].getBetweenBounds(query[usableQueryKeys[0]]));
      }
      return cb(null, self2.getAllData());
    },
    function(docs) {
      if (dontExpireStaleDocs) {
        return callback(null, docs);
      }
      var expiredDocsIds = [], validDocs = [], ttlIndexesFieldNames = Object.keys(self2.ttlIndexes);
      docs.forEach(function(doc) {
        var valid = true;
        ttlIndexesFieldNames.forEach(function(i) {
          if (doc[i] !== void 0 && util.isDate(doc[i]) && Date.now() > doc[i].getTime() + self2.ttlIndexes[i] * 1e3) {
            valid = false;
          }
        });
        if (valid) {
          validDocs.push(doc);
        } else {
          expiredDocsIds.push(doc._id);
        }
      });
      async.eachSeries(expiredDocsIds, function(_id, cb) {
        self2._remove({ _id }, {}, function(err) {
          if (err) {
            return callback(err);
          }
          return cb();
        });
      }, function(err) {
        return callback(null, validDocs);
      });
    }
  ]);
};
Datastore$2.prototype._insert = function(newDoc, cb) {
  var callback = cb || function() {
  }, preparedDoc;
  try {
    preparedDoc = this.prepareDocumentForInsertion(newDoc);
    this._insertInCache(preparedDoc);
  } catch (e) {
    return callback(e);
  }
  this.persistence.persistNewState(util.isArray(preparedDoc) ? preparedDoc : [preparedDoc], function(err) {
    if (err) {
      return callback(err);
    }
    return callback(null, model.deepCopy(preparedDoc));
  });
};
Datastore$2.prototype.createNewId = function() {
  var tentativeId = customUtils.uid(16);
  if (this.indexes._id.getMatching(tentativeId).length > 0) {
    tentativeId = this.createNewId();
  }
  return tentativeId;
};
Datastore$2.prototype.prepareDocumentForInsertion = function(newDoc) {
  var preparedDoc, self2 = this;
  if (util.isArray(newDoc)) {
    preparedDoc = [];
    newDoc.forEach(function(doc) {
      preparedDoc.push(self2.prepareDocumentForInsertion(doc));
    });
  } else {
    preparedDoc = model.deepCopy(newDoc);
    if (preparedDoc._id === void 0) {
      preparedDoc._id = this.createNewId();
    }
    var now = /* @__PURE__ */ new Date();
    if (this.timestampData && preparedDoc.createdAt === void 0) {
      preparedDoc.createdAt = now;
    }
    if (this.timestampData && preparedDoc.updatedAt === void 0) {
      preparedDoc.updatedAt = now;
    }
    model.checkObject(preparedDoc);
  }
  return preparedDoc;
};
Datastore$2.prototype._insertInCache = function(preparedDoc) {
  if (util.isArray(preparedDoc)) {
    this._insertMultipleDocsInCache(preparedDoc);
  } else {
    this.addToIndexes(preparedDoc);
  }
};
Datastore$2.prototype._insertMultipleDocsInCache = function(preparedDocs) {
  var i, failingI, error;
  for (i = 0; i < preparedDocs.length; i += 1) {
    try {
      this.addToIndexes(preparedDocs[i]);
    } catch (e) {
      error = e;
      failingI = i;
      break;
    }
  }
  if (error) {
    for (i = 0; i < failingI; i += 1) {
      this.removeFromIndexes(preparedDocs[i]);
    }
    throw error;
  }
};
Datastore$2.prototype.insert = function() {
  this.executor.push({ this: this, fn: this._insert, arguments });
};
Datastore$2.prototype.count = function(query, callback) {
  var cursor2 = new Cursor(this, query, function(err, docs, callback2) {
    if (err) {
      return callback2(err);
    }
    return callback2(null, docs.length);
  });
  if (typeof callback === "function") {
    cursor2.exec(callback);
  } else {
    return cursor2;
  }
};
Datastore$2.prototype.find = function(query, projection, callback) {
  switch (arguments.length) {
    case 1:
      projection = {};
      break;
    case 2:
      if (typeof projection === "function") {
        callback = projection;
        projection = {};
      }
      break;
  }
  var cursor2 = new Cursor(this, query, function(err, docs, callback2) {
    var res = [], i;
    if (err) {
      return callback2(err);
    }
    for (i = 0; i < docs.length; i += 1) {
      res.push(model.deepCopy(docs[i]));
    }
    return callback2(null, res);
  });
  cursor2.projection(projection);
  if (typeof callback === "function") {
    cursor2.exec(callback);
  } else {
    return cursor2;
  }
};
Datastore$2.prototype.findOne = function(query, projection, callback) {
  switch (arguments.length) {
    case 1:
      projection = {};
      break;
    case 2:
      if (typeof projection === "function") {
        callback = projection;
        projection = {};
      }
      break;
  }
  var cursor2 = new Cursor(this, query, function(err, docs, callback2) {
    if (err) {
      return callback2(err);
    }
    if (docs.length === 1) {
      return callback2(null, model.deepCopy(docs[0]));
    } else {
      return callback2(null, null);
    }
  });
  cursor2.projection(projection).limit(1);
  if (typeof callback === "function") {
    cursor2.exec(callback);
  } else {
    return cursor2;
  }
};
Datastore$2.prototype._update = function(query, updateQuery, options, cb) {
  var callback, self2 = this, numReplaced = 0, multi, upsert, i;
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  callback = cb || function() {
  };
  multi = options.multi !== void 0 ? options.multi : false;
  upsert = options.upsert !== void 0 ? options.upsert : false;
  async.waterfall([
    function(cb2) {
      if (!upsert) {
        return cb2();
      }
      var cursor2 = new Cursor(self2, query);
      cursor2.limit(1)._exec(function(err, docs) {
        if (err) {
          return callback(err);
        }
        if (docs.length === 1) {
          return cb2();
        } else {
          var toBeInserted;
          try {
            model.checkObject(updateQuery);
            toBeInserted = updateQuery;
          } catch (e) {
            try {
              toBeInserted = model.modify(model.deepCopy(query, true), updateQuery);
            } catch (err2) {
              return callback(err2);
            }
          }
          return self2._insert(toBeInserted, function(err2, newDoc) {
            if (err2) {
              return callback(err2);
            }
            return callback(null, 1, newDoc, true);
          });
        }
      });
    },
    function() {
      var modifiedDoc, modifications = [], createdAt;
      self2.getCandidates(query, function(err, candidates) {
        if (err) {
          return callback(err);
        }
        try {
          for (i = 0; i < candidates.length; i += 1) {
            if (model.match(candidates[i], query) && (multi || numReplaced === 0)) {
              numReplaced += 1;
              if (self2.timestampData) {
                createdAt = candidates[i].createdAt;
              }
              modifiedDoc = model.modify(candidates[i], updateQuery);
              if (self2.timestampData) {
                modifiedDoc.createdAt = createdAt;
                modifiedDoc.updatedAt = /* @__PURE__ */ new Date();
              }
              modifications.push({ oldDoc: candidates[i], newDoc: modifiedDoc });
            }
          }
        } catch (err2) {
          return callback(err2);
        }
        try {
          self2.updateIndexes(modifications);
        } catch (err2) {
          return callback(err2);
        }
        var updatedDocs = _.pluck(modifications, "newDoc");
        self2.persistence.persistNewState(updatedDocs, function(err2) {
          if (err2) {
            return callback(err2);
          }
          if (!options.returnUpdatedDocs) {
            return callback(null, numReplaced);
          } else {
            var updatedDocsDC = [];
            updatedDocs.forEach(function(doc) {
              updatedDocsDC.push(model.deepCopy(doc));
            });
            if (!multi) {
              updatedDocsDC = updatedDocsDC[0];
            }
            return callback(null, numReplaced, updatedDocsDC);
          }
        });
      });
    }
  ]);
};
Datastore$2.prototype.update = function() {
  this.executor.push({ this: this, fn: this._update, arguments });
};
Datastore$2.prototype._remove = function(query, options, cb) {
  var callback, self2 = this, numRemoved = 0, removedDocs = [], multi;
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  callback = cb || function() {
  };
  multi = options.multi !== void 0 ? options.multi : false;
  this.getCandidates(query, true, function(err, candidates) {
    if (err) {
      return callback(err);
    }
    try {
      candidates.forEach(function(d) {
        if (model.match(d, query) && (multi || numRemoved === 0)) {
          numRemoved += 1;
          removedDocs.push({ $$deleted: true, _id: d._id });
          self2.removeFromIndexes(d);
        }
      });
    } catch (err2) {
      return callback(err2);
    }
    self2.persistence.persistNewState(removedDocs, function(err2) {
      if (err2) {
        return callback(err2);
      }
      return callback(null, numRemoved);
    });
  });
};
Datastore$2.prototype.remove = function() {
  this.executor.push({ this: this, fn: this._remove, arguments });
};
var datastore = Datastore$2;
var Datastore = datastore;
var nedb = Datastore;
const Datastore$1 = /* @__PURE__ */ getDefaultExportFromCjs(nedb);
const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database(`${process.cwd()}/src/sqlite3.db`, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  }
});
function getById(obj, targetId) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = getById(item, targetId);
      if (result) return result;
    }
  } else if (typeof obj === "object" && obj !== null) {
    if (obj.id === targetId) return obj;
    return getById(obj.children, targetId);
  }
  return null;
}
function getImages(node2) {
  let images = [];
  if (node2.type === "image") {
    images.push(node2);
  }
  if (node2.children && Array.isArray(node2.children)) {
    for (const child of node2.children) {
      images = images.concat(getImages(child));
    }
  }
  return images;
}
function getFolders(node2) {
  if (node2.type !== "folder" && node2.type !== "root") {
    return null;
  }
  return {
    ...node2,
    children: node2.children ? node2.children.map(getFolders).filter(Boolean) : []
  };
}
new Datastore$1({
  filename: `${process.cwd()}/src/nedb/db.json`,
  // Stores data in 'data.db'
  autoload: true
  // Automatically loads the database on startup
});
if (started) {
  require$$3$1.app.quit();
}
let mainWindow;
const createWindow = () => {
  mainWindow = new require$$3$1.BrowserWindow({
    width: 1200,
    height: 735,
    webPreferences: {
      preload: path$4.join(__dirname, "preload.js")
    }
  });
  require$$3$1.ipcMain.handle("select-folder", async () => {
    const result = await require$$3$1.dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"]
    });
    return result.filePaths[0] || null;
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  require$$3$1.ipcMain.handle("select-files", async () => {
    const result = await require$$3$1.dialog.showOpenDialog(mainWindow, {
      properties: ["openFile", "multiSelections"]
    });
    return result.filePaths;
  });
  require$$3$1.ipcMain.handle("move-files", async (_2, files, rootFolder) => {
    if (!rootFolder) {
      throw new Error("No root folder selected.");
    }
    const movedFiles = [];
    for (const file of files) {
      const fileName = path$4.basename(file);
      const destination = path$4.join(rootFolder, fileName);
      try {
        require$$3.renameSync(file, destination);
        movedFiles.push(destination);
      } catch (error) {
        console.error(`Error moving file ${file}:`, error);
        return { success: false, error: error.message };
      }
    }
    return { success: true, movedFiles };
  });
  require$$3$1.ipcMain.handle("create-image", async (_2, image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO images (id, name, dateAdded, savedFolder, version) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [image.id, image.name, image.dateAdded, image.savedFolder, image.version], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("update-image", async (_2, image) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE images SET name = ?, dateAdded = ?, savedFolder = ?, version = ? WHERE id = ?`;
      db.run(query, [image.name, image.dateAdded, image.savedFolder, image.version, image.id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("delete-image", async (_2, id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM images WHERE id = ?`;
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("list-images", async () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM images`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log("TABLES", rows);
          resolve(rows);
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("insert-node", async (_2, treeId, parentId, value) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tree_nodes (tree_id, parent_id, value) VALUES (?, ?, ?)`,
        [treeId, parentId, value],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
  });
  require$$3$1.ipcMain.handle("update-node", async (_2, nodeId, newValue) => {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tree_nodes SET value = ? WHERE id = ?`,
        [newValue, nodeId],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  });
  require$$3$1.ipcMain.handle("delete-node", async (_2, nodeId) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM tree_nodes WHERE id = ?`, [nodeId], function(err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  });
  require$$3$1.ipcMain.handle("select-node", async (_2, treeId) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM tree_nodes WHERE tree_id = ?`, [treeId], (err, rows) => {
        if (err) return reject(err);
        const nodeMap = /* @__PURE__ */ new Map();
        let root = null;
        rows.forEach(({ id, parent_id, value }) => {
          nodeMap.set(id, { id, parent_id, value, children: [] });
        });
        rows.forEach(({ id, parent_id }) => {
          var _a;
          const node2 = nodeMap.get(id);
          if (parent_id === null) {
            root = node2;
          } else {
            (_a = nodeMap.get(parent_id)) == null ? void 0 : _a.children.push(node2);
          }
        });
        resolve(root);
      });
    });
  });
  require$$3$1.ipcMain.handle("update-caption", async (event, imageId, newCaption) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { caption: newCaption });
    await updateImageVersion(imageId, newVersion);
  });
  require$$3$1.ipcMain.handle("update-quality", async (event, imageId, newQuality) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { quality: newQuality });
    await updateImageVersion(imageId, newVersion);
  });
  require$$3$1.ipcMain.handle("update-version", async (event, imageId, newVersion) => {
    await createNewVersion(imageId, newVersion, {});
    await updateImageVersion(imageId, newVersion);
  });
  require$$3$1.ipcMain.handle("update-folder", async (event, imageId, newFolder) => {
    const version = await getCurrentVersion(imageId);
    const newVersion = version + 1;
    await createNewVersion(imageId, newVersion, { folder: newFolder });
    await updateImageVersion(imageId, newVersion);
  });
  require$$3$1.ipcMain.handle("get-image-details-with-versions", async (event, imageId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT images.*, image_versions.version_id, image_versions.version, image_versions.quality, image_versions.dateAdded, image_versions.caption, image_versions.folder
        FROM images
        LEFT JOIN image_versions ON images.id = image_versions.image_id
        WHERE images.id = ?
        ORDER BY image_versions.version ASC
      `, [imageId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
  async function getCurrentVersion(imageId) {
    return new Promise((resolve, reject) => {
      db.get("SELECT version FROM images WHERE id = ?", [imageId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.version);
        }
      });
    });
  }
  async function createNewVersion(imageId, version, fields) {
    return new Promise((resolve, reject) => {
      const { caption = null, quality = null, folder = null } = fields;
      db.run(
        `INSERT INTO image_versions (image_id, version, quality, dateAdded, caption, folder) VALUES (?, ?, ?, ?, ?, ?)`,
        [imageId, version, quality, (/* @__PURE__ */ new Date()).toISOString(), caption, folder],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
  async function updateImageVersion(imageId, version) {
    return new Promise((resolve, reject) => {
      db.run("UPDATE images SET version = ? WHERE id = ?", [version, imageId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  require$$3$1.ipcMain.handle("update-tree", async (_2, obj, targetId, action, payload) => {
    return new Promise((resolve, reject) => {
    });
  });
  require$$3$1.ipcMain.handle("get-images", async () => {
    return new Promise((resolve, reject) => {
      db.findOne({ id: "root" }, (err, root) => {
        if (err || !root) reject(new Error("Root not found"));
        else {
          const images = getImages(root);
          resolve(images);
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("get-image-by-id", async (_2, imageId) => {
    return new Promise((resolve, reject) => {
      db.findOne({ id: "root" }, (err, root) => {
        if (err || !root) reject(new Error("Root not found"));
        else {
          const images = getById(root, imageId);
          resolve(images);
        }
      });
    });
  });
  require$$3$1.ipcMain.handle("get-folders", async () => {
    return new Promise((resolve, reject) => {
      db.findOne({ id: "root" }, (err, root) => {
        if (err || !root) reject(new Error("Root not found"));
        else {
          const images = getFolders(root);
          resolve(images);
        }
      });
    });
  });
  mainWindow.webContents.openDevTools();
};
require$$3$1.app.on("ready", createWindow);
require$$3$1.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    require$$3$1.app.quit();
  }
});
require$$3$1.app.on("activate", () => {
  if (require$$3$1.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
