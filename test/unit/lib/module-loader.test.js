var chai = require('chai')
var expect = require('chai').expect
var spies = require('chai-spies')
var ModuleLoader = require('../../../lib/module-loader')
var EventEmitter = require('events').EventEmitter

chai.use(spies)

var modulesPath = 'test/fixtures/modules'
var withContextPath = 'test/fixtures/withContext'

describe('module-loader', function() {

	it('should return the api', function() {
		expect(ModuleLoader()).to.be.instanceOf(Object)
	})

	describe('load()', function() {

		it('should return an EventEmitter', function() {
			expect(ModuleLoader().load(modulesPath)).to.be.instanceOf(EventEmitter)
		})

		it('should trigger the `data` event when a new module has been loaded', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var spy = chai.spy()

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				done()
			}, 500)
		})

		it('should trigger the `end` event when all modules have been loaded', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var spy = chai.spy()

			loader.on('end', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				done()
			}, 500)
		})

		it('should trigger the `error` event when a file cannot be parsed', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var spy = chai.spy()

			loader.on('error', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				done()
			}, 500)
		})

		it('should trigger the `error` event when directory does not exist', function(done) {
			var loader = ModuleLoader().load('foo')
			var spy = chai.spy()

			loader.on('error', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				done()
			}, 500)
		})

	})

	describe('on(\'data\')', function() {

		it('should be called with all top-level objects', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var spy = chai.spy()

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				expect(spy).to.have.been.called.with('module1')
				expect(spy).to.have.been.called.with('module2')
				expect(spy).to.have.been.called.with('function1')
				expect(spy).to.have.been.called.with('dir1')
				expect(spy).to.have.been.called.with('dir2')
				done()
			}, 500)
		})

		it('should provide an object for modules that export an object', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var loadedData = {}
			var spy = chai.spy(function(name, data) {
				loadedData[name] = data
			})

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				expect(spy).to.have.been.called.with('module1')
				expect(loadedData['module1']).to.be.instanceOf(Object)
				done()
			}, 500)
		})

		it('should provide a function for modules that export an function', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var loadedData = {}
			var spy = chai.spy(function(name, data) {
				loadedData[name] = data
			})

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				expect(spy).to.have.been.called.with('function1')
				expect(loadedData['function1']).to.be.instanceOf(Object)
				done()
			}, 500)
		})

		it('should recurse through the directory', function(done) {
			var loader = ModuleLoader().load(modulesPath)
			var loadedData = {}
			var spy = chai.spy(function(name, data) {
				loadedData[name] = data
			})

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called()
				expect(spy).to.have.been.called.with('dir1')
				expect(loadedData['dir1']).to.be.instanceOf(Object)
				expect(loadedData['dir1']).to.haveOwnProperty('module3')
				done()
			}, 500)
		})

	})

	describe('on(\'end\')', function() {

		it('should be called exactly once', function() {
			var loader = ModuleLoader().load(modulesPath)
			var spy = chai.spy()

			loader.on('end', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called.exactly(1)
				done()
			}, 500)
		})

		it('should provide an object representing the directory tree', function() {
			var loader = ModuleLoader().load(modulesPath)
			var loadedData = {}
			var spy = chai.spy(function(data) {
				loadedData = data
			})

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called.exactly(1)
				expect(loadedData).to.be.instanceOf(Object)
				expect(loadedData).to.haveOwnProperty('module1')
				expect(loadedData).to.haveOwnProperty('module2')
				expect(loadedData).to.haveOwnProperty('function1')
				expect(loadedData).to.haveOwnProperty('dir1')
				expect(loadedData['dir1']).to.haveOwnProperty('module3')
				expect(loadedData).to.haveOwnProperty('dir2')
				expect(loadedData['dir2']).to.haveOwnProperty('module4')
				done()
			}, 500)
		})

		it('should root the index.js of any subdirectory and allow any other files to extend the root', function() {
			var loader = ModuleLoader().load(modulesPath)
			var loadedData = {}
			var spy = chai.spy(function(data) {
				loadedData = data
			})

			loader.on('data', spy)

			setTimeout(function() {
				expect(spy).to.have.been.called.exactly(1)
				expect(loadedData).to.be.instanceOf(Object)
				expect(loadedData).to.haveOwnProperty('module1')
				expect(loadedData).to.haveOwnProperty('module2')
				expect(loadedData).to.haveOwnProperty('function1')
				expect(loadedData).to.haveOwnProperty('dir1')
				expect(loadedData['dir1']).to.haveOwnProperty('module3')
				expect(loadedData).to.haveOwnProperty('dir2')
				expect(loadedData['dir2']).to.haveOwnProperty('module4')

				expect(spy).to.have.been.called.exactly(1)
				expect(loadedData).to.be.instanceOf(Object)
				expect(loadedData['dir2'].name).to.equal('root')
				expect(loadedData['dir2'].module4.name).to.equal('module4')
				done()
			}, 500)
		})

	})

})