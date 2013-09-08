    sx.internal.parse = function (element, context) {
      var binding = element.getAttribute('data-splash');
      if (!binding) {
        return null;
      }

      var vm = context.vm;
      var keys = ['$data', '$root', '$parent'];
      var values = [vm, context.vmRoot, context.vmParent];

      for (var key in vm) {
        keys.push(key);
        values.push(vm[key]);
      }

      return new Function(keys, "return { " + binding + " };").apply(null, values);
    };
    