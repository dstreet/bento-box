/**
 * Module Loader
 * ````````````````````````````````````````````````````````````````````````````
 * Reads a directory and parses each of its javascript files and returns an
 * object containing the modules. Recurses through subdirectories, and roots
 * all 'index.js' files.
 *
 * Usage:
 *
 * 		var ModuleLoader = require('module-loader')
 * 		ModuleLoader(ignore).load(dir)
 * 
 * Example:
 *
 * 		var loader = ModuleLoader().load(dir)
 * 		loader.on('data', function(name, data) {
 * 			// Do something
 * 		})
 * 		loader.on('error', function(e, filePath) {
 * 			// Handle error
 * 		})
 * 		loader.on('end', function(data) {
 * 			// Do something with entire directory data
 * 		})
 *
 * @param {RegExp} ignore File pattern to skip when loading files
 */

var fs           = require('fs')
var vm           = require('vm')
var path         = require('path')
var extend       = require('extend')
var EventEmitter = require('events').EventEmitter

module.exports = ModuleLoader = function(ignore) {

	var ignore = /^\./

	return {

		/**
		 * @param  {String}   dir            Directory relative to `process.cwd()`
		 * @param  {Object}   [context]      Will load modules with a specific context
		 * @param  {Object}   [extendGlobal] Extend the node global object when loading a module with context
		 * @param  {Function} [cb]           Callback when all modules have been loaded
		 * @return {EventEmitter}
		 */
		load: function(dir, context, extendGlobal, noEmit, cb) {
			var self = this
			var emitter = new EventEmitter()
			var modules = {}
			var qed = 0

			fs.readdir(dir, function(err, files) {

				if (err) {
					emitter.emit('error', err)
					return sendEnd()
				}

				files.forEach(function(file) {

					// Only proceed if file does not match ignore regex
					if (!ignore.test(file)) {
						var filePath = path.join(process.cwd(), dir, file)
						var moduleName = path.basename(file, '.js')

						// File is a directory. Recurse
						if (fs.lstatSync(filePath).isDirectory()) {

							// Add to the number of queued modules
							// This way we know when everything has finished
							qed++
							
							self.load(path.join(dir, file), context, extendGlobal, true, function(d) {
								modules[moduleName] = self.rootObjectIndex(d)
								qed--

								emitter.emit('data', moduleName, modules[moduleName])

								if (qed == 0) sendEnd()
							})

						}

						// File is not a directory. `require` the file
						else {

							try {
								if (context) {
									modules[moduleName] = self.requireWithContext(filePath, context, extendGlobal)
								} else {
									modules[moduleName] = require(filePath)
								}
								
								emitter.emit('data', moduleName, modules[moduleName])
							} catch(e) {
								emitter.emit('error', e, filePath)
							}
						}
					}
				})

				if (qed == 0) sendEnd()
			})

			var sendEnd = function() {
				if (typeof cb == 'function') {
					cb(modules)
				}

				emitter.emit('end', modules)
			}

			// Default error listener
			// This must be in place to ensure ModuleLoader does not blowup
			// if implementor does not handle the event
			emitter.on('error', function() {})

			return emitter
		},

		/**
		 * Find the index property of an object and move it to the root.
		 * Additional object properties should extend the root
		 * 	
		 * @param  {Object} obj The object
		 * @return {Object}     Encapsulated rooted object
		 */
		rootObjectIndex: function(obj) {
			// Ecapsulate the object
			var obj = extend(true, {}, obj)

			if (!obj.hasOwnProperty('index')) return obj

			var index = extend(true, {}, obj.index)
			delete obj.index

			return extend(true, {}, index, obj)
		},

		/**
		 * Require a module and pass it a specific context
		 * 
		 * @param  {String}  filePath     The absolute file path
		 * @param  {object}  context      Will load modules with a specific context
		 * @param  {boolean} extendGlobal Extend the node global namespace
		 * @return {Object}
		 */
		requireWithContext: function(filePath, context, extendGlobal) {
			var nodeGlobals = {
				process: process,
				// console: console,                 // TODO: extend fails on this property
				Buffer: Buffer,
				require: require,
				__filename: filePath,                // Reference the requested file
				__dirname: path.dirname(filePath),   // Reference the requested file
				module: module,
				exports: exports,
				setTimeout: setTimeout,
				clearTimeout: clearTimeout,
				setInterval: setInterval,
				clearInterval: clearInterval
			}

			var sandbox = extend(true, (extendGlobal ? global : null), nodeGlobals, context)
			var contents

			vm.createContext(sandbox)
			contents = fs.readFileSync(filePath)
			return vm.runInContext(contents, sandbox)
		}

	}

}