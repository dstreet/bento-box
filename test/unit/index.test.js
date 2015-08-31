var chai = require('chai')
var expect = chai.expect
var spies = require('chai-spies')
var EventEmitter = require('events').EventEmitter
var BentoBoxFactory = require('../../index')
var BentoBox = BentoBoxFactory.BentoBox
var Collection = require('../../lib/collection')

chai.use(spies)

var configPath = 'test/fixtures/config'

describe('BentoBoxFactory', function() {

	describe('getInstance()', function() {

		it('should return an EventEmitter', function() {
			expect(BentoBoxFactory.getInstance()).to.be.instanceOf(EventEmitter)
		})

		it('should trigger the `ready` event when the config has been loaded', function(done) {
			BentoBoxFactory.configPath = configPath
			var emitter = BentoBoxFactory.getInstance()

			emitter.on('ready', function() {
				done()
			})
		})

		it('should call the callback when the config has been loaded', function(done) {
			BentoBoxFactory.configPath = configPath
			BentoBoxFactory.getInstance(null, function() {
				done()
			})
		})

		it('should pass a new BentoBox instance to the \'ready\' event listener', function(done) {
			BentoBoxFactory.configPath = configPath
			var emitter = BentoBoxFactory.getInstance()

			emitter.on('ready', function(instance) {
				expect(instance).to.be.instanceOf(BentoBox)
				done()
			})
		})

		it('should cpass a new BentoBox instance to the callback', function(done) {
			BentoBoxFactory.configPath = configPath
			BentoBoxFactory.getInstance(null, function(instance) {
				expect(instance).to.be.instanceOf(BentoBox)
				done()
			})
		})

		it('should pass a new BentoBox instance with proper config', function(done) {
			BentoBoxFactory.configPath = configPath
			var emitter = BentoBoxFactory.getInstance({
					server: {
						port: 8000,
						host: 'foo.com'
					}
				})

			emitter.on('ready', function(instance) {
				var config = instance.getConfig()

				expect(config).to.haveOwnProperty('server')
				expect(config).to.haveOwnProperty('controller')
				expect(config).to.haveOwnProperty('model')
				expect(config).to.haveOwnProperty('view')
				expect(config).to.haveOwnProperty('router')
				expect(config.server.port).to.equal(8000)
				expect(config.server.host).to.equal('foo.com')
				expect(config.server.timeout).to.equal(200)
				done()
			})
		})

	})

})

describe('BentoBox', function() {

	describe('getConfig()', function() {

		var bento

		before(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should return the config of a specified property', function() {

			expect(bento.getConfig('server')).to.be.an('object')
		})

		it('should return undefined for a config property that does not exist', function() {
			expect(bento.getConfig('foo')).to.be.undefined
		})

	})

	describe('load()', function() {

		var bento

		before(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should attach the collection as a map to the loaded resources', function(done) {
			bento.add('models', 'item1', 'foobar')

			var loader = bento.load('test/fixtures/withContext', 'models', 'test')

			loader.on('end', function(d) {
				expect(d.context).to.eql({ item1: 'foobar' })
				done()
			})
		})

	})

	describe('loadWithCollectionArray()', function() {

		var bento

		before(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should attach the collection as an array to the loaded resources', function(done) {
			bento.add('models', 'item1', 'foobar')

			var loader = bento.loadWithCollectionArray('test/fixtures/withContext', 'models', 'test')

			loader.on('end', function(d) {
				expect(d.context).to.eql(['foobar'])
				done()
			})
		})

	})

	describe('create()', function() {

		var bento

		beforeEach(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should add the collection to the list', function() {
			bento.create('items')

			expect(bento._collections).to.haveOwnProperty('items')
			expect(bento._collections.items).to.be.instanceof(Collection)
		})

		it('should throw and error if the collection already exists', function() {
			bento.create('items')

			var fn = function() { bento.create('items') }

			expect(fn).to.throw()
		})

		it('should return the new collection instance', function() {
			expect(bento.create('items')).to.be.instanceof(Collection)
		})

	})

	describe('add()', function() {

		var bento

		beforeEach(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should call the `add` method of the collection', function() {
			var coll = bento.create('items')
			chai.spy.on(coll, 'add')
			bento.add('items', 'item1')

			expect(coll.add).to.have.been.called
		})

		it('should create the collection if it does not exist', function() {
			bento.add('items', 'item1')

			expect(bento._collections).to.haveOwnProperty('items')
		})

	})

	describe('on()', function() {

		var bento

		beforeEach(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should return an object containing each action method of the collection', function() {
			var coll = bento.create('items')

			expect(bento.on('items')).to.respondTo('add')
			expect(bento.on('items')).to.respondTo('remove')
		})

		it('should create the collection if it does not exist', function() {
			bento.on('tests')
			expect(bento._collections).to.haveOwnProperty('tests')
		})

	})

	describe('off()', function() {

		var bento

		beforeEach(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should return an object containing each unsubscribe action method of the collection', function() {
			var coll = bento.create('items')

			expect(bento.off('items')).to.respondTo('add')
			expect(bento.off('items')).to.respondTo('remove')
		})

		it('should throw an error if the collection does not exist', function() {
			var fn = function() { bento.off('tests') }

			expect(fn).to.throw(Error)
		})

	})

	describe('use()', function() {

		var bento

		beforeEach(function(done) {
			BentoBoxFactory.configPath = configPath
			factory = BentoBoxFactory.getInstance()

			factory.on('ready', function(instance) {
				bento = instance
				done()
			})
		})

		it('should return an object of the extension\'s publicly accessible api', function() {
			var ext = {
				getAccessors: function() {
					return {
						getTest: function() {},
						foo: 'bar'
					}
				}
			}

			var extApi = bento.use(ext)
			expect(extApi).to.haveOwnProperty('getTest')
			expect(extApi).to.haveOwnProperty('foo')
			expect(extApi.getTest).to.be.instanceOf(Function)
			expect(extApi.foo).to.equal('bar')
		})

		it('should call the extension\'s init method with arguments passed to use()', function() {
			var spy = chai.spy()
			var ext = {
				init: spy
			}

			var extApi = bento.use(ext, 'foo')
			expect(spy).to.have.been.called()
			expect(spy).to.have.been.called.with('foo')
		})

		it('should call the extension\'s getRequestedConfig method', function() {
			var spy = chai.spy()
			var ext = {
				getRequestedConfig: spy
			}

			var extApi = bento.use(ext)
			expect(spy).to.have.been.called()
		})

		it('should call the extension\'s getAccessors method', function() {
			var spy = chai.spy()
			var ext = {
				getAccessors: spy
			}

			var extApi = bento.use(ext)
			expect(spy).to.have.been.called()
		})

		it('should call the extension\'s ready method with bento instance and requested config', function() {
			var spy = chai.spy()
			var ext = {
				getRequestedConfig: function() {
					return 'server'
				},
				ready: spy
			}

			var extApi = bento.use(ext)
			expect(spy).to.have.been.called()
			expect(spy).to.have.been.called.with(bento)
			expect(spy).to.have.been.called.with({ port: 3001, timeout: 200 })
		})

	})

})