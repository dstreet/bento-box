var expect = require('chai').expect
var moduleLoader = require('../../../lib/module-loader')

var modulesPath = 'test/fixtures/modules'
var withContextPath = 'test/fixtures/withContext'

describe('module-loader', function() {

	it('should return an object', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules).to.be.instanceOf(Object)
	})

	it('should return an object with all top-level modules', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules).to.haveOwnProperty('module1')
		expect(modules).to.haveOwnProperty('module2')
		expect(modules).to.haveOwnProperty('function1')
	})

	it('should recurse through the directory', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules.dir1).to.be.instanceOf(Object)
		expect(modules.dir1).to.haveOwnProperty('module3')
	})

	it('should root the index.js of any subdirectory and allow any other files to extend the root', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules.dir2).to.be.instanceOf(Object)
		expect(modules.dir2.name).to.equal('root')
		expect(modules.dir2.module4.name).to.equal('module4')
	})

	it('should provide an object for modules that export an object', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules.module1).to.be.instanceOf(Object)
	})

	it('should provide a function for modules that export a function', function() {
		var modules = moduleLoader(modulesPath)

		expect(modules.function1).to.be.instanceOf(Function)
	})

	it('should throw an error if the directory cannot be read', function() {
		var fn = function(path) { return moduleLoader(path) }
		expect(fn).to.throw(Error)
	})

	it('should attach an object context to the module scope', function() {
		var withContext = moduleLoader(withContextPath, { test: 'testing' })

		expect(withContext.context).to.equal('testing')
	})

})