// var BentoBox = require('bento-box')
var extend = require('extend')

var extIface = {

	getRequestedConfig: function() {
		return null
	},

	getAccessors: function() {
		return {}
	},

	init: function() {},

	ready: function(bento, config) {}

}

function ExtensionFactory(blueprint /*, args */) {

	var definition = extend(true, {}, extIface, blueprint)
	var args = Array.prototype.slice.call(arguments)
	args.shift()

	definition.init.apply(definition, args)

	return definition.getAccessors.call(definition)

}

var extension = {

	foo: null,

	getRequestedConfig: function() {
		// BentoBox calls this method to determine which config
		// properties to pass to the extension
		return ['server']
	},

	getAccessors: function() {
		var self = this
		// BentoBox will call this method to determine what
		// properties/functions should be returned with the
		// instance
		return {
			getFoo: function() { return self.foo },
			setFoo: function(val) { self.foo = val }
		}
	},

	init: function(args) {
		// Do initialization
		// BentoBox will call this method first, when creating the instance
		console.log('calling init with', arguments)
	},

	ready: function(bento, config) {
		// BentoBox will call this method once instance has been fully
		// initialized
	}

}


var assert = require('assert')

var ext = ExtensionFactory(extension, 'arg1', 'arg2')

assert.equal(ext.getFoo(), null)

ext.setFoo('bar')
assert.equal(ext.getFoo(), 'bar') // Modifies the extension instance
assert.equal(extension.foo, null) // Does not modify the extension blueprint


// BentoBox.getInstance().on('ready', function(bento) { 

// 	var ext = bento.use(extension, 'foo', 'bar')

// 	ext.addRoute()

// })
