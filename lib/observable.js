/**
 * Observable
 * ````````````````````````````````````````````````````````````````````````````
 * Observable object that emits a pre-described action. Stores actions in a
 * queue to emit to late subscribers.
 */

var Observable = function(action) {
	this._responders = []
	this._q = []
}

Observable.prototype = {

	_arrayFromArgs: function(args) {
		var arr = []

		for (var i = 0; i < args.length; i++) {
			arr.push(args[i])
		}

		return arr
	},

	/**
	 * Method for registering a responder
	 *
	 * Examples:
	 *
	 * - Register a responder that listens to all incoming actions:
	 *
	 * 		observer._actionMethod(function() { })
	 *
	 * - Register a responder that applies a filtering function on
	 * 	 incoming actions:
	 *
	 * 		observer._actionMethod(function() {}, function(data) { return true; })
	 * 		
	 * @param  {Function}       cb
	 * @param  {Array|Function} filter
	 * @private
	 */
	_actionMethod: function(cb, filter) {
		var newRes

		this._responders.push({
			callback: cb,
			filter: filter
		})

		newRes = this._responders[this._responders.length-1]
		this._drainQueue(newRes)
		
		return newRes
	},

	/**
	 * Send all queued messages to a responder
	 * 
	 * @param  {Object}  responder
	 * @private
	 */
	_drainQueue: function(responder) {
		this._q.forEach(function(data) {

			data = Array.isArray(data) ? data : [data]

			if (this._dataMatchesFilter(data, responder.filter)) {
				responder.callback.apply({}, data)
			}
		}.bind(this))
	},

	/**
	 * Compares the data against a responder's filter
	 *
	 * Returns true if no filter
	 *
	 * If filter is a function, returns the return value
	 * of the function
	 *
	 * Otherwise, returns true if the data exactly matches
	 * the value of the filter 
	 * 
	 * @param  {*}  data
	 * @param  {*}  filter
	 * @return {Boolean}
	 * @private
	 */
	_dataMatchesFilter: function(data, filter) {
		if (!filter) return true

		if (typeof filter == 'function') {
			return filter(data)
		} else {
			return data === filter
		}
	},

	/**
	 * Compares the key and data against a responder's filter
	 *
	 * Returns true if no filter
	 *
	 * If filter is a function, returns the return value
	 * of the function
	 *
	 * Otherwise, returns true if the key exactly matches
	 * the value of the filter 
	 *
	 * @param  {*}  key
	 * @param  {*}  data
	 * @param  {*}  filter
	 * @return {Boolean}
	 * @private
	 */
	_dataWithKeyMatchesFilter: function(key, data, filter) {
		if (!filter) return true

		if (typeof filter == 'function') {
			return filter(key, data)
		} else {
			return key === filter
		}
	},

	/**
	 * Get the action method, bound the Observable instance
	 * 
	 * @return {Function}
	 * @public
	 */
	getActionMethod: function() {
		return this._actionMethod.bind(this)
	},

	/**
	 * Send the data to all matching responders
	 * 
	 * @param  {...*}  data
	 * @public
	 */
	emit: function(data) {
		var args = this._arrayFromArgs(arguments)
		var key = undefined
		var data
		var checkData

		// Properly handle keyed data
		if (args.length == 1) {
			data = args[0]
			checkData = data
		} else {
			data = args
			key = args[0]
			checkData = args[1]
		}

		this._responders.forEach(function(responder) {
			if (typeof key == 'undefined') {
				if (this._dataMatchesFilter(checkData, responder.filter)) {
					responder.callback.apply({}, args)
				}
			} else {
				if (this._dataWithKeyMatchesFilter(key, checkData, responder.filter)) {
					responder.callback.apply({}, args)
				}
			}
		}.bind(this))

		this._q.push(data)
	},

	/**
	 * Remove a responder from the list
	 *
	 * TODO: This should also accept a responder
	 *       as the first argument
	 * 
	 * @param  {Function}
	 * @param  {*}
	 * @private
	 */
	unsubscribe: function(cb, filter) {
		var tmp = []

		this._responders.forEach(function(responder) {
			if (responder.callback != cb || filter != responder.filter) {
				tmp.push(responder)
			}
		}.bind(this));

		this._responders = tmp
	}

	/**
	 * Additional methods not yet implemented:
	 *
	 * - pause(responder || cb, filter)   // Stop receiving messages
	 *                                       for a responder without
	 *                                       unsubscribing
	 *
	 * - resume(responder || cb, filter)  // Resume a paused responder
	 */

}

module.exports = Observable