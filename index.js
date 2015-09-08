/**
 * Bento Box
 * ````````````````````````````````````````````````````````````````````````````
 * The modular, extensible, and stack-agnostic application framework
 * for Node.js
 */

var fs             = require('fs')
var extend         = require('extend')
var EventEmitter   = require('events').EventEmitter
var ModuleLoader   = require('./lib/module-loader')
var Collection     = require('./lib/collection')
var extension      = require('./lib/extension')

var BentoBox = function(config) {
	this._collections = {}
	this._config = config
}

module.exports = BentoBoxFactory = {

	configPath: 'config',

	getInstance: function(config, cb) {
		var emitter = new EventEmitter()
		var path = typeof config == 'string' ? config : this.configPath
		var loader

		if (fs.existsSync(path)) {
			loader = ModuleLoader().load(path)

			loader.on('error', function(e) {
				emitter.emit('error', new Error('Failed to parse config directory'), arrayFromArguments(arguments))
			})

			loader.on('end', function(d) {
				sendEnd(extend(true, {}, d, config))
			})
		} else {
			sendEnd(config || {})
		}

		function sendEnd(configData) {
			var instance = new BentoBox(configData)

			if (typeof cb == 'function') {
				cb(instance)
			}

			emitter.emit('ready', instance)
		}

		return emitter
	},

	BentoBox: BentoBox

}

BentoBox.prototype = {

	/**
	 * Load modules from a directory.
	 * Optionally, attach a collection to each requested resource
	 *
	 * Examples:
	 *
	 * To load modules with access to the models collection
	 *
	 * 		bento.load('path/to/modules', 'models')
	 *
	 * Set the collection property name
	 *
	 * 		bento.load('path/to/modules', 'models', 'superAwesomeModels')
	 * 		
	 * @param  {String}  dir
	 * @param  {String}  collectionName
	 * @param  {String}  [as=`collectionName`]
	 * @return {Object}
	 * @public
	 */
	load: function(dir, collectionName, as, ignore) {
		return this.loadWithCollectionMap.apply(this, arguments)
	},

	loadWithCollectionMap: function(dir, collectionName, as, ignore) {
		var collection = this._collections[collectionName]
		var as = as || collectionName
		var context = {
			bento: this
		}

		if (as) {
			context[as] = collection.getMap()
		}

		return ModuleLoader(ignore).load(dir, context, true)
	},

	loadWithCollectionArray: function(dir, collectionName, as, ignore) {
		var collection = this._collections[collectionName]
		var as = as || collectionName
		var context = {
			bento: this
		}

		if (as) {
			context[as] = collection.getArray()
		}

		return ModuleLoader(ignore).load(dir, context, true)
	},

	/**
	 * Get a config object
	 *
	 * If no name is passed, will return entire
	 * config contents
	 * 
	 * @param  {[String]}  name
	 * @return {Object}
	 * @public
	 */
	getConfig: function(name) {
		if (name) {
			return this._config[name]
		} else {
			return this._config
		}
	},

	/**
	 * Create a new collection
	 * 
	 * @param  {String}  name
	 * @public
	 */
	create: function(name) {
		if (this._collections.hasOwnProperty(name)) {
			throw new Error('Attempting to create a collection that already exists')
		}

		return this._collections[name] = new Collection(name)
	},

	/**
	 * Add a new item to the collection
	 *
	 * If the collection does not exist, it will be created
	 * 
	 * @param {String} collection
	 * @param {...*}   args
	 * @public
	 */
	add: function(collection) {
		var args = arrayFromArguments(arguments)

		if (!this._collections.hasOwnProperty(collection)) {
			this.create(collection)
		}

		args.shift()

		this._collections[collection].add.apply(this._collections[collection], args)
	},

	/**
	 * Remove an item from the collections
	 *
	 * If the collection does not exist, it will be created
	 *
	 * @param {String} collection
	 * @param {...*}   args
	 * @public
	 */
	remove: function(collection) {
		var args = arrayFromArguments(arguments)

		if (!this._collections.hasOwnProperty(collection)) {
			this.create(collection)
		}

		args.shift()

		this._collections[collection].remove.apply(this._collections[collection], args)
	},

	/**
	 * Log a message relating to a collection
	 *
	 * If the collection does not exist, it will be created
	 *
	 * @param {String} collection
	 * @param {String} message
	 * @param {String} level
	 * @public
	 */
	log: function(collection, message, level) {
		var args = arrayFromArguments(arguments)

		if (!this._collections.hasOwnProperty(collection)) {
			this.create(collection)
		}

		args.shift()

		this._collections[collection].log.apply(this._collections[collection], args)
	},

	/**
	 * Get the action methods for the collection
	 *
	 * If the collection does not exist, it will be created
	 * 
	 * @param  {String}  collection
	 * @return {Object}
	 * @public
	 */
	on: function(collection) {
		if (!this._collections.hasOwnProperty(collection)) {
			this.create(collection)
		}

		return this._collections[collection].getActions()
	},

	/**
	 * Get the action unsubscribe methods for the collection
	 * 
	 * @param  {String}
	 * @return {Object}
	 * @public
	 */
	off: function(collection) {
		if (!this._collections.hasOwnProperty(collection)) {
			throw new Error('Cannot unsubscribe from a collection that does not exist')
		}

		return this._collections[collection].getUnsubscribeActions()
	},

	/**
	 * Load an extension
	 * 
	 * @param  {Object}  extTemplate
	 * @param  {[...*]}  initArgs
	 * @return {Object}
	 */
	use: function(extTemplate /*, initArgs */) {
		var definition = extend(true, {}, extension, extTemplate)
		var initArgs = arrayFromArguments(arguments)
		var loadedConfig = {}
		var configProps

		// Call the extension's init method with initArgs
		initArgs.shift()
		definition.init.apply(definition, initArgs)

		// Load the config requested by the extension
		configProps = definition.getRequestedConfig.call(definition) || []

		if (typeof configProps == 'string' && this._config.hasOwnProperty(configProps)) {
			loadedConfig = this._config[configProps]
		} else if (Array.isArray(configProps)) {
			configProps.forEach(function(prop) {
				if (this._config.hasOwnProperty(prop)) {
					loadedConfig[prop] = this._config[prop]
				}
			})
		}

		// Call the extension's ready method with the bento box instance and config
		definition.ready.call(definition, this, loadedConfig)

		// Return the extension's public api
		return definition.getAccessors.call(definition)
	}

}

function arrayFromArguments(args) {
	var arr = []

	for (var i = 0; i < args.length; i++) {
		arr.push(args[i])
	}

	return arr
}