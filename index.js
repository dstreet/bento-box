/**
 * Bento Box
 * ````````````````````````````````````````````````````````````````````````````
 * The modular, extensible, and stack-agnostic application framework
 * for Node.js
 *
 * @version 0.0.1
 * @author David Street
 * @license MIT
 */

var fs = require('fs')
var extend = require('extend')
var moduleLoader = require('./lib/module-loader')
var Collection = require('./lib/collection')

var BentoBox = function(config) {
	this._configPath = 'config'
	this._config = this._loadConfig(config)
	this._collections = {}
}

BentoBox.prototype = {

	/**
	 * Load the app configuration from directory
	 *
	 * When the config parameter is a string, it is assumed that it is
	 * the path to a config directory, and will use moduleLoader to
	 * load the config object.
	 *
	 * When the config is an object, data will extend any config object
	 * loaded from the default config directory.
	 *
	 * @param   {String|Object} config
	 * @returns {Object}
	 * @private
	 */
	_loadConfig: function(config) {
		var path = typeof config == 'string' ? config : this._configPath
		var retConfig = {}

		if (fs.existsSync(path)) {
			retConfig = moduleLoader(path)

			if (typeof config == 'object') {
				retConfig = extend(true, {}, retConfig, config)
			}
		} else {
			retConfig = config || {}
		}

		return retConfig
	},

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
	load: function(dir, collectionName, as) {
		return this.loadWithCollectionMap.apply(this, arguments)
	},

	loadWithCollectionMap: function(dir, collectionName, as) {
		var collection = this._collections[collectionName]
		var as = as || collectionName
		var context = {
			bento: this
		}

		if (as) {
			context[as] = collection.getMap()
		}

		return moduleLoader(dir, context, true)
	},

	loadWithCollectionArray: function(dir, collectionName, as) {
		var collection = this._collections[collectionName]
		var as = as || collectionName
		var context = {
			bento: this
		}

		if (as) {
			context[as] = collection.getArray()
		}

		return moduleLoader(dir, context, true)
	},

	/**
	 * Get a config object
	 * 
	 * @param  {String}  name
	 * @return {Object}
	 * @public
	 */
	getConfig: function(name) {
		return this._config[name]
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
	 * @param {String}   collection
	 * @param {...*}   args
	 * @public
	 */
	add: function(collection) {
		var args = Array.prototype.slice.call(arguments)

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
		var args = Array.prototype.slice.call(arguments)

		if (!this._collections.hasOwnProperty(collection)) {
			this.create(collection)
		}

		args.shift()

		this._collections[collection].remove.apply(this._collections[collection], args)
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
	}

}

module.exports = BentoBox