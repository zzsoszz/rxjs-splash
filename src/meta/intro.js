(function (window, undefined) {

    var freeExports = typeof exports == 'object' && exports,
        freeModule = typeof module == 'object' && module && module.exports == freeExports && module,
        freeGlobal = typeof global == 'object' && global;
    if (freeGlobal.global === freeGlobal) {
        window = freeGlobal;
    }

     /** 
     * @name sx
     * @type Object
     */
    var sx = {
        util: { },
        internal: { },
        binders: { },
    };
    