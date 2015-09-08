/**
 * Collection
 * ````````````````````````````````````````````````````````````````````````````
 * Stores a collection of items and interfaces with and Observable to emit
 * actions to responders.
 */

var Hashids = require("hashids")
var Observable = require('./observable')

var hashids = new Hashids('bento-box', 8)

var Collection = function(name) {
	this.name = name
	this._actions = {}
	this._items = []
	this.createAction('add')
	this.createAction('remove')
	this.createAction('log')
}

Collection.prototype = {

	/**
	 * Find the index of an item with a matching key
	 * 
	 * @param  {String}  key
	 * @return {Boolean}
	 * @private
	 */
	_itemWithKey: function(key) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i].key == key) {
				return i
			}
		}

		return -1
	},

	/**
	 * Find the index of an item with a matching value
	 * 
	 * @param  {*}  val
	 * @return {Boolean}
	 * @private
	 */
	_itemWithValue: function(val) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i].value == val) {
				return i
			}
		}

		return -1
	},

	/**
	 * Register a new action type
	 * 
	 * @param  {String} actionName
	 * @public
	 */
	createAction: function(actionName) {
		if (this._actions.hasOwnProperty(actionName)) {
			throw new Error('Cannot create an action that already exists')
		}

		this._actions[actionName] = new Observable(actionName)
	},

	/**
	 * Get the actions methods from the Observers
	 * 
	 * @return {Object}
	 * @public
	 */
	getActions: function() {
		var actionMethods = {}
		
		for (var a in this._actions) {
			actionMethods[a] = this._actions[a].getActionMethod()
		}

		return actionMethods
	},

	/**
	 * Get methods to unsubscribe from actions
	 * 
	 * @return {Object}
	 * @public
	 */
	getUnsubscribeActions: function() {
		var unsubscribeMethods = {}
		
		for (var a in this._actions) {
			unsubscribeMethods[a] = this._actions[a].unsubscribe.bind(this._actions[a])
		}

		return unsubscribeMethods
	},

	/**
	 * Get a map of all collection items
	 *
	 * Any item with a `null` key will be provided a unique key hash
	 * 
	 * @return {Object}
	 * @public
	 */
	getMap: function() {
		var map = {}

		this._items.forEach(function(item, i) {
			if (!item.key) {
				map[hashids.encode(i)] = item.value
			} else {
				map[item.key] = item.value
			}
		})

		return map
	},

	/**
	 * Get an array of item values
	 * 
	 * @return {Array}
	 * @public
	 */
	getArray: function() {
		var arr = []

		this._items.forEach(function(item) {
			arr.push(item.value)
		})

		return arr
	},

	/**
	 * Add an item to the collection and emit the 'add' action
	 *
	 * Items are stored as key/value pairs.
	 * 
	 * If only one argument is passed, the key is assumed `null`
	 * and the only argument is used as the value.
	 *
	 * If two arguments are passed, the first argument is the
	 * key and the second is the value
	 * 
	 * @param {String|*} key
	 * @param {*}        [value]
	 * @public
	 */
	add: function(key, value) {
		var itemKey = null
		var itemValue = key

		if (arguments.length >= 2) {
			itemKey = key
			itemValue = value
		}

		this._items.push({
			key: itemKey,
			value: itemValue
		})

		if (itemKey) {
			this._actions.add.emit(itemKey, itemValue)
		} else {
			this._actions.add.emit(itemValue)
		}
	},

	/**
	 * Remove an item from the collection and emit the 'remove' action
	 *
	 * If the type of item is a string, method will first look for
	 * any matching keys, otherwise will search for a value that
	 * matches.
	 * 
	 * @param  {String|*} item 
	 * @public
	 */
	remove: function(item) {
		var matchedIndex = -1
		var matchedItem

		// Check for items with a key that matches item
		if (typeof item == 'string') {
			matchedIndex = this._itemWithKey(item)
		}

		// Check for items with a value that matches item
		if (matchedIndex == -1) {
			matchedIndex = this._itemWithValue(item)
		}

		if (matchedIndex != -1) {
			matchedItem = this._items[matchedIndex]

			this._items.splice(matchedIndex, 1)

			if (matchedItem.key) {
				this._actions.remove.emit(matchedItem.key, matchedItem.value)
			} else {
				this._actions.remove.emit(matchedItem.value)
			}
		}
	},

	/**
	 * Trigger a log action
	 *
	 * Log messages are passed direclty through to the listener.
	 * Messages are not stored. As such, late subscribers will
	 * not recieve log messages.
	 * 
	 * @param  {String} msg
	 * @param  {String} level
	 * @public
	 */
	log: function(msg, level) {
		var level = level || 'info'

		this._actions.log.emit(msg, level)
	}

	/**
	 * Additional methods not yet implemented:
	 *
	 * - addMany(items)    // Add more than one item at a time
	 * - removeMany(items) // Opposite of addMany
	 * - dump()            // Remove all items
	 */

}

module.exports = Collection