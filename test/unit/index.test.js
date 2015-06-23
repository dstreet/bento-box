var chai = require('chai')
var expect = chai.expect
var spies = require('chai-spies')
var Bento = require('../../index')
var Collection = require('../../lib/collection')

chai.use(spies)

var configPath = 'test/fixtures/config'

describe('BentoBox', function() {

	var bento

	beforeEach(function() {
		bento = new Bento(configPath)
	})

	describe('_loadConfig()', function() {

		it('should return a config object', function() {
			expect(bento._loadConfig()).to.be.instanceof(Object)
		})

		it('should extend the loaded config with data from the config parameter if object', function() {
			var config = bento._loadConfig({
				model: 'testing'
			})

			expect(config.model).to.eql('testing')
		})

		it('should return an empty object if no config path or parameter has been supplied', function() {
			bento._configPath = null
			expect(bento._loadConfig()).to.be.empty
		})

		it('should return parameter data if config path does not exist', function() {
			expect(bento._loadConfig('null')).to.eql('null')
		})

	})

	describe('getConfig()', function() {

		it('should return the config of a specified property', function() {
			expect(bento.getConfig('server')).to.be.an('object')
		})

		it('should return undefined for a config property that does not exist', function() {
			expect(bento.getConfig('foo')).to.be.undefined
		})

	})

	describe('load()', function() {

		it('should attach the collection as a map to the loaded resources', function() {
			bento.add('models', 'item1', 'foobar')

			expect(bento.load('test/fixtures/withContext', 'models', 'test').context).to.eql({ item1: 'foobar' })
		})

	})

	describe('loadWithCollectionArray()', function() {

		it('should attach the collection as an array to the loaded resources', function() {
			bento.add('models', 'item1', 'foobar')

			expect(bento.loadWithCollectionArray('test/fixtures/withContext', 'models', 'test').context).to.eql(['foobar'])
		})

	})

	describe('create()', function() {

		it('should add the collection to the list', function() {
			bento.create('items')

			expect(bento._collections).to.haveOwnProperty('items')
			expect(bento._collections.items).to.be.instanceof(Collection)
		})

		it('should throw and error if the collection already exists', function() {
			bento.create('items')

			var fn = function() { bento.create('items') }

			expect(fn).to.throw(Error)
		})

		it('should return the new collection instance', function() {
			expect(bento.create('items')).to.be.instanceof(Collection)
		})

	})

	describe('add()', function() {

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

})