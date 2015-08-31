/**
 * Abstract Bento Box Extension
 * ````````````````````````````````````````````````````````````````````````````
 * This object represents the methods essential for a functioning extension
 * for the Bento Box framework. All extensions implictly inherit from this
 * abstract object.
 */

module.exports = {
	
	/**
	 * Called by Bento Box to get the extension's requested configuration
	 * 
	 * @return {Array|String}
	 */
	getRequestedConfig: function() {
		return null
	},

	/**
	 * Called by Bento Box to load the public API for the extension.
	 * This is the object returned by `use()`
	 * 
	 * @return {*}
	 */
	getAccessors: function() {
		return {}
	},

	/**
	 * The first method called by Bento Box. This should be used
	 * to apply any initialization of the extension. All `use()`
	 * arguments are passed directly to this method
	 * 
	 * @param  {...*} args
	 */
	init: function(args) {

	},

	/**
	 * Last method called by Bento Box. This should be used
	 * to start emitting or listening to collections.
	 * 
	 * @param  {BentoBox} bento  The BentoBox instance
	 * @param  {Object}   config The requested config
	 */
	ready: function(bento, config) {
		
	}

}