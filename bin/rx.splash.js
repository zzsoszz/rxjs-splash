// Generated by CoffeeScript 1.4.0
(function() {
  var noDispose, noop, sx,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  sx = window.sx = {
    utils: {},
    internal: {},
    binders: {}
  };

  noop = function() {};

  noDispose = {
    dispose: noop
  };

  sx.utils.bind = function(obsOrValue, callback) {
    if (obsOrValue.subscribe) {
      return obsOrValue.subscribe(callback);
    }
    callback(obsOrValue);
    return noDispose;
  };

  sx.utils.wrap = function(valueOrBehavior) {
    if (typeof valueOrBehavior.subscribe === 'function') {
      return valueOrBehavior;
    }
    return new Rx.BehaviorSubject(valueOrBehavior);
  };

  sx.utils.parseBindingOptions = function(param, options) {
    var key, value;
    if (options == null) {
      options = {};
    }
    if (typeof param === 'function' || param.onNext || param.subscribe) {
      options.source = param;
      return options;
    }
    for (key in param) {
      value = param[key];
      options[key] = value;
    }
    return options;
  };

  sx.utils.toJS = function(obj) {
    return JSON.stringify(obj, function(s, field) {
      if (field instanceof sx.ObservableArray) {
        return field.values;
      }
      if (field instanceof Rx.Observable) {
        return field.value;
      }
      if (field instanceof Rx.Observer) {
        return void 0;
      }
      return field;
    });
  };

  sx.utils.unwrap = function(valueOrBehavior) {
    if (valueOrBehavior.value && valueOrBehavior.subscribe) {
      return valueOrBehavior.value;
    }
    return valueOrBehavior;
  };

  sx.bind = function(vm, target) {
    target = $(target || window.document.body);
    return sx.internal.bind(target, {
      vm: vm,
      vmRoot: vm,
      vmParent: void 0
    });
  };

  sx.computed = function(options) {
    var key, keys, source, value, values, _ref;
    keys = [];
    values = [];
    _ref = options.params;
    for (key in _ref) {
      value = _ref[key];
      keys.push(key);
      values.push(sx.utils.wrap(value));
    }
    source = sx.utils.combineLatest(values).select(function(values) {
      var i, params, _i, _len;
      params = {};
      for (i = _i = 0, _len = keys.length; _i < _len; i = ++_i) {
        key = keys[i];
        params[key] = values[i];
      }
      return params;
    });
    return Rx.Observable.create(function(o) {
      return source.select(options.read).subscribe(o);
    });
  };

  sx.internal.bind = function(target, context) {
    var binder, bindings, disposable, options;
    bindings = sx.internal.parseBindings(target, context);
    disposable = new Rx.CompositeDisposable;
    for (binder in bindings) {
      options = bindings[binder];
      disposable.add(sx.binders[binder](target, context, options));
    }
    target.children().each(function() {
      return disposable.add(sx.internal.bind($(this), context));
    });
    return disposable;
  };

  sx.ObservableArray = (function(_super) {

    __extends(ObservableArray, _super);

    function ObservableArray(items) {
      var item, _i, _len;
      if (items == null) {
        items = [];
      }
      ObservableArray.__super__.constructor.apply(this, arguments);
      this.values = [];
      this.lifetimes = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        this.push(item);
      }
    }

    ObservableArray.prototype.push = function(value) {
      var lifetime;
      this.values.push(value);
      this.lifetimes.push(lifetime = new Rx.BehaviorSubject(value));
      this.onNext(lifetime);
      return value;
    };

    ObservableArray.prototype.remove = function(value) {
      var index;
      index = this.values.indexOf(value);
      if (index === -1) {
        console.log(index);
      }
      return this.splice(index, 1);
    };

    ObservableArray.prototype.splice = function() {
      var lifetime, removed, _i, _len, _results;
      Array.prototype.splice.apply(this.values, arguments);
      removed = Array.prototype.splice.apply(this.lifetimes, arguments);
      _results = [];
      for (_i = 0, _len = removed.length; _i < _len; _i++) {
        lifetime = removed[_i];
        _results.push(lifetime.onCompleted());
      }
      return _results;
    };

    ObservableArray.prototype.subscribe = function(observerOrOnNext) {
      var lifetime, subscription, _i, _len, _ref;
      subscription = ObservableArray.__super__.subscribe.apply(this, arguments);
      this.purge();
      observerOrOnNext = arguments.length > 1 || typeof observerOrOnNext === 'function' ? observerOrOnNext : observerOrOnNext.onNext;
      _ref = this.lifetimes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lifetime = _ref[_i];
        observerOrOnNext(lifetime);
      }
      return subscription;
    };

    ObservableArray.prototype.purge = function() {
      var lifetime, _i, _len, _ref, _results;
      _ref = this.lifetimes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lifetime = _ref[_i];
        if (lifetime.isCompleted) {
          _results.push(this.remove(lifetime));
        }
      }
      return _results;
    };

    ObservableArray.prototype.dispose = function() {
      var lifetime, _i, _len, _ref, _results;
      _ref = this.lifetimes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lifetime = _ref[_i];
        _results.push(lifetime.onCompleted());
      }
      return _results;
    };

    return ObservableArray;

  })(Rx.Subject);

  sx.internal.parseBindings = function(target, context) {
    var binding, key, keys, value, values, _ref;
    binding = target.attr('data-splash');
    if (!binding) {
      return null;
    }
    keys = ['$data', '$root', '$parent'];
    values = [context.vm, context.vmRoot, context.vmParent];
    _ref = context.vm;
    for (key in _ref) {
      value = _ref[key];
      keys.push(key);
      values.push(value);
    }
    return new Function(keys, "return { " + binding + " };").apply(null, values);
  };

  sx.binders.checked = function(target, context, obsOrValue) {
    var get, observer, set;
    if (obsOrValue.onNext) {
      observer = obsOrValue;
      get = target.onAsObservable('change').select(function() {
        return target.prop('checked');
      }).subscribe(function(x) {
        observer.onNext(x);
      });
    }
    set = sx.utils.bind(obsOrValue, function(x) {
      target.prop('checked', x);
    });
    return new Rx.CompositeDisposable(get, set);
  };

  sx.binders.attr = function(target, context, options) {
    var disposable, key, obsOrValue, _fn, _i, _len;
    disposable = new Rx.CompositeDisposable;
    _fn = function() {
      var attr;
      attr = key;
      return disposable.add(sx.utils.bind(obsOrValue, function(x) {
        target.attr(attr, x);
      }));
    };
    for (obsOrValue = _i = 0, _len = options.length; _i < _len; obsOrValue = ++_i) {
      key = options[obsOrValue];
      _fn();
    }
    return disposable;
  };

  sx.binders.click = function(target, context, options) {
    return sx.binders.event(target, context, options, 'click', true);
  };

  sx.binders.css = function(target, context, options) {
    var disposable, key, obsOrValue, _fn;
    disposable = new Rx.CompositeDisposable;
    _fn = function() {
      var css;
      css = key;
      return disposable.add(sx.utils.bind(obsOrValue, function(x) {
        target.toggleClass(css, x);
      }));
    };
    for (key in options) {
      obsOrValue = options[key];
      _fn();
    }
    return disposable;
  };

  sx.binders.event = function(target, context, options, type) {
    var obs;
    if (type == null) {
      type = options.type;
    }
    obs = $(target).onAsObservable(type);
    if (typeof options === 'function') {
      return obs.subscribe(function(e) {
        options({
          target: target,
          context: context,
          e: e
        });
      });
    }
    return obs.subscribe(function(e) {
      options.onNext({
        target: target,
        context: context,
        e: e
      });
    });
  };

  sx.binders.foreach = function(target, context, obsArray) {
    var disposable, template;
    template = target.html().trim();
    target.empty();
    disposable = new Rx.CompositeDisposable({
      dispose: function() {
        return target.empty().append(template);
      }
    });
    setTimeout(function() {
      disposable.add(obsArray.subscribe(function(lifetime) {
        var binding, child, dispose, disposer, sub;
        child = $(template).appendTo(target);
        disposable.add(binding = sx.internal.bind(child, {
          vm: lifetime.value,
          vmRoot: context.vmRoot,
          vmParent: context.vm
        }));
        dispose = function() {
          child.remove();
          disposable.remove(binding);
          disposable.remove(sub);
          disposable.remove(disposer);
        };
        disposable.add(disposer = {
          dispose: dispose
        });
        disposable.add(sub = lifetime.subscribe(noop, dispose, dispose));
      }));
    });
    return disposable;
  };

  sx.binders.html = function(target, context, obsOrValue) {
    return sx.utils.bind(obsOrValue, function(x) {
      target.html(x);
    });
  };

  sx.binders.text = function(target, context, obsOrValue) {
    return sx.utils.bind(obsOrValue, function(x) {
      target.text(x);
    });
  };

  sx.binders.value = function(target, context, options) {
    var blur, focus, get, getObs, observer, set;
    options = sx.utils.parseBindingOptions(options);
    if (options.on && options.on.indexOf('after') === 0) {
      options.on = options.on.slice(5);
      options.delay = true;
    }
    if (typeof options.source.onNext === 'function') {
      observer = options.source;
      getObs = target.onAsObservable(options.on || 'change');
      if (options.delay) {
        getObs = getObs.delay(0);
      }
      get = getObs.select(function() {
        return target.val();
      }).subscribe(function(x) {
        observer.onNext(x);
      });
    }
    if (options.source instanceof Rx.Observable) {
      focus = target.onAsObservable('focus');
      blur = target.onAsObservable('blur');
      options.source = options.source.takeUntil(focus).concat(blur.take(1)).repeat();
    }
    set = sx.utils.bind(options.source, function(x) {
      target.val(x);
    });
    return new Rx.CompositeDisposable(get, set);
  };

  sx.binders.visible = function(target, context, options) {
    return sx.utils.bind(obsOrValue, function(x) {
      target.css(x ? '' : 'none');
    });
  };

}).call(this);
