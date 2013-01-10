###
Splash
###

class Splash

  constructor: ->

    @binders = {}

  bind: (vm, dom) ->

    self = this

    dom = $(dom || 'body')

    bindings = dom.find('[data-splash]').map ->
      target = $ this
      target: target
      bindings: self.parseBindings vm, target.attr 'data-splash'

    bindings.each ->
      self.binders[key].init(this.target, {options: value}) for key, value of this.bindings

  parseBindings: (vm, binding) ->
    # this still needs to be implemented, obviously
    keys = []
    values = []

    for key, value of vm
      keys.push key
      values.push value

    new Function(keys, 'return {' + binding + '};').apply(undefined, values)

window.sx = new Splash

###
Binders
###

sx.binders.text =
  init: (element, o) ->
    target = $ element
    o.options.subscribe (x) -> target.text x

sx.binders.value =
  init: (element, o) ->
    target = $ element
    o.options.subscribe (x) -> target.val x
    # target.on 'change', (x) -> o.source.onNext x

sx.binders.css =
  init: (element, o) ->
    target = $ element
    for css, source of o.options
      source.subscribe (x) ->
        target.toggleClass css, x




