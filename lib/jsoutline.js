var jsoutline = {
  squelch: false,
  nativeCodeEx: /\[native code\]/,
  tracing: [],
  traceMe: function(func, methodName) {
    var traceOn = function() {
      if (jsoutline.squelch) {
        return func.apply(this, arguments);
      } else {
        var startTime = new Date();
        console.groupCollapsed(methodName + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
        var result = func.apply(this, arguments);
        console.log(result, "(" + (new Date() - startTime) + " ms)");
        console.groupEnd()
        return result;
      }
    }
    traceOn.traceOff = func;
    for (var prop in func) {
      traceOn[prop] = func[prop];
    }
    console.info("tracing", methodName);
    return traceOn;
  },
 
  traceAll: function(root, recurse, skiplist) {
    //console.warn("traceAll()")
    if ((root == window) || !((typeof root == 'object') || (typeof root == 'function'))) {return;}
    if (typeof skiplist == 'undefined') {
	skiplist = [];
    }
    for (var key in root) {
      if (skiplist.indexOf(key) > -1) { 
        console.warn("traceAll() skipping", key);
        continue;
      }
      if ((root.hasOwnProperty(key)) && (root[key] != root)) {
	var thisObj = root[key];
	if (typeof thisObj == 'function') {
	  if ((this != root) && !thisObj.traceOff && !this.nativeCodeEx.test(thisObj)) {
            root[key] = this.traceMe(root[key], key);
	    this.tracing.push({obj:root,methodName:key});
          }
        }
        recurse && this.traceAll(thisObj, true, skiplist);
      }
    }
  },

  untraceAll: function() {
    for (var i=0; i<this.tracing.length; ++i) {
      var thisTracing = this.tracing[i];
      thisTracing.obj[thisTracing.methodName] =
          thisTracing.obj[thisTracing.methodName].traceOff;
    }
    console.info("tracing disabled");
    this.tracing = [];
  }
}
