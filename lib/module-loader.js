/**
 * Module Loader
 * ````````````````````````````````````````````````````````````````````````````
 * Reads a directory and parses each of its javascript files and returns an
 * object containing the modules. Recurses through subdirectories, and roots
 * all 'index.js' files.
 */


var fs = require('fs')
var vm = require('vm')
var path = require('path')
var extend = require('extend')

/**
 * @param  {String} dir            Direcotry relative to `process.cwd()`
 * @param  {Object} [context]      Will load modules with a specific context
 * @param  {Object} [extendGlobal] Extend the node global object when loading a module with context
 * @return {Object}
 */
function parseDir(dir, context, extendGlobal) {
	var returnObj = {}
	var files

	// Read the config directory
	try {
		files = fs.readdirSync(path.join(process.cwd(), dir));
	} catch (e) {
		throw new Error('Failed to read directory')
	}

	// Load the config modules
	files.forEach(function(file) {
		var filePath = path.join(process.cwd(), dir, file)
		var modules
		var tmpObj = {}

		// Process subdirectories if present
		if (fs.lstatSync(filePath).isDirectory()) {
			modules = rootObjectIndex(parseDir(path.join(dir, file)))
		} else {
			if (context) {
				modules = requireWithContext(filePath, context, extendGlobal)
			} else {
				modules = require(filePath);
			}
		}

        if (typeof modules == 'object' && !Array.isArray(modules)) {
    		for(var i in modules) {
    			tmpObj[i] = modules[i]
    		}

    		if (file != 'index.js') {
            	returnObj[path.basename(file, '.js')] = tmpObj
    		} else {
            	returnObj = tmpObj
    		}
        } else {
            returnObj[path.basename(file, '.js')] = modules
        }
	})

	return returnObj;
}

/**
 * Find the index property of an object and move it to the root.
 * Additional object properties should extend the root
 * 	
 * @param  {Object} obj The object
 * @return {Object}     Encapsulated rooted object
 */
function rootObjectIndex(obj) {
	// Ecapsulate the object
	var obj = extend(true, {}, obj)

	if (!obj.hasOwnProperty('index')) return obj

	var index = extend(true, {}, obj.index)
	delete obj.index

	return extend(true, {}, index, obj)
}

/**
 * Require a module and pass it a specific context
 * 
 * @param  {String}  filePath     The absolute file path
 * @param  {object}  context      Will load modules with a specific context
 * @param  {boolean} extendGlobal Extend the node global namespace
 * @return {Object}
 */
function requireWithContext(filePath, context, extendGlobal) {
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

module.exports = parseDir
