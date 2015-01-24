var jsoutline = {
  squelch: false,
  showClassName: true,
  showObjectClass: false,
  nativeCodeEx: /\[native code\]/,
  tracing: [],
  traceMe: function(func, methodName, className) {
    var traceOn = function() {
      if (jsoutline.squelch) {
        return func.apply(this, arguments);
      } else {
	if (!jsoutline.showObjectClass && className == 'Object') {
	  className = '';
        }
        var label = ""
        if (jsoutline.showClassName && className) {
	  label = className + ".";
	}
        label += methodName;
        var startTime = new Date();
        console.groupCollapsed(label + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
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
 
  traceAll: function(root, recurse, skipList) {
    //console.warn("traceAll()")
    if ((root == window) || !((typeof root == 'object') || (typeof root == 'function'))) {return;}
    if (typeof skipList == 'undefined') {
	skipList = [];
    }
    var rootName;
    if (root && root.constructor && root.constructor.name) {
      rootName = root.constructor.name;
    }
    for (var key in root) {
      if (skipList.indexOf(key) > -1) { 
        console.warn("traceAll() skipping", key);
        continue;
      }
      if ((root.hasOwnProperty(key)) && (root[key] != root)) {
	var thisObj = root[key];
	if (typeof thisObj == 'function') {
	  if ((this != root) && !thisObj.traceOff && !this.nativeCodeEx.test(thisObj)) {
            root[key] = this.traceMe(root[key], key, rootName);
	    this.tracing.push({obj:root,methodName:key,rootName: rootName});
          }
        }
        recurse && this.traceAll(thisObj, true, skipList);
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
