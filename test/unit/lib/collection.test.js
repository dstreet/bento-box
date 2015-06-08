var chai = require('chai')
var expect = chai.expect
var spies = require('chai-spies')
var Collection = require('../../../lib/collection')
var Hashids = require("hashids")

chai.use(spies)

describe('Collection', function() {

	describe('constructor', function() {

		var coll

		before(function() {
			coll = new Collection('items')
		})

		it('should set the collection name', function() {
			expect(coll.name).to.equal('items')
		})

		it('should create an "add" action', function() {
			expect(coll._actions).to.haveOwnProperty('add')
		})

		it('should create a "remove" action', function() {
			expect(coll._actions).to.haveOwnProperty('remove')
		})

	})

	describe('createAction()', function() {

		var coll

		before(function() {
			coll = new Collection('items')
		})
		
		it('should throw an error if attempting to add an action that already exists', function() {
			var fn = function() { coll.createAction('add') }
			expect(fn).to.throw(Error)
		})

		it('should add the action to the list of actions', function() {
			coll.createAction('test')
			expect(coll._actions).to.haveOwnProperty('test')
		})

	})

	describe('getActions()', function() {
		
		var coll

		before(function() {
			coll = new Collection('items')
		})

		it('should return all registered actions', function() {
			coll.createAction('test')
			expect(coll.getActions()).to.haveOwnProperty('add')
			expect(coll.getActions()).to.haveOwnProperty('remove')
			expect(coll.getActions()).to.haveOwnProperty('test')
		})

		it('returned actions should be functions', function() {
			expect(coll.getActions().add).to.be.a('function')
			expect(coll.getActions().remove).to.be.a('function')
		})

	})

	describe('getUnsubscribeActions()', function() {

		var coll

		before(function() {
			coll = new Collection('items')
		})

		it('should return all registered actions', function() {
			coll.createAction('test')
			expect(coll.getUnsubscribeActions()).to.haveOwnProperty('add')
			expect(coll.getUnsubscribeActions()).to.haveOwnProperty('remove')
			expect(coll.getUnsubscribeActions()).to.haveOwnProperty('test')
		})

		it('returned actions should be functions', function() {
			expect(coll.getUnsubscribeActions().add).to.be.a('function')
			expect(coll.getUnsubscribeActions().remove).to.be.a('function')
		})

	})

	describe('getMap()', function() {

		var coll

		beforeEach(function() {
			coll = new Collection('items')
		})

		it('should return an object', function() {
			coll._items.push(
				{ key: 'item1', value: 'foobar' }
			)

			expect(coll.getMap()).to.be.an('object')
			expect(coll.getMap()).to.haveOwnProperty('item1')
			expect(coll.getMap().item1).to.eql('foobar')
		})

		it('should replace any `null` keys with a unique hash', function() {
			var hashids = new Hashids('bento-box', 8)

			coll._items.push(
				{ key: null, value: 'foobar' }
			)

			expect(coll.getMap()).to.be.an('object')
			expect(coll.getMap()).to.haveOwnProperty(hashids.encode(0))
		})

	})

	describe('getArray()', function() {

		var coll

		beforeEach(function() {
			coll = new Collection('items')
		})

		it('should return an array containing the value of every item', function() {
			coll._items.push(
				{ key: 'item1', value: 'foobar' },
				{ key: null, value: 'item2' }
			)

			expect(coll.getArray()).to.eql(['foobar', 'item2'])
		})

	})

	describe('add()', function() {

		var coll

		beforeEach(function() {
			coll = new Collection('items')
		})

		it('should add the item to the list', function() {
			coll.add('item1')
			coll.add('item2')

			expect(coll._items).to.have.length(2)
			expect(coll._items).to.eql([
				{ key: null, value: 'item1' },
				{ key: null, value: 'item2' }
			])
		})

		it('should add a keyed item to the list', function() {
			coll.add('test', 'foobar')
			expect(coll._items).to.eql([
				{ key: 'test', value: 'foobar' }
			])
		})

		it('should call the `emit` method of the "add" action\'s observer', function() {
			chai.spy.on(coll._actions.add, 'emit')

			coll.add('item1')

			expect(coll._actions.add.emit).to.have.been.called.once
		})
		
	})

	describe('remove', function() {
		
		var coll

		before(function() {
			coll = new Collection('items')
			coll.add('item1')
			coll.add('item2')
		})

		it('should remove the item from the list', function() {
			coll.remove('item1')
			expect(coll._items).to.have.length(1)
			expect(coll._items).to.eql([{ key: null, value: 'item2' }])
		})

		it('should remove an item from the list if the keys match', function() {
			coll.add('test', 'foobar')
			coll.remove('test')
			expect(coll._items).to.eql([{ key: null, value: 'item2' }])
		})

		it('should call the `emit` method of the "remove" action\'s observer', function() {
			chai.spy.on(coll._actions.remove, 'emit')

			coll.remove('item2')

			expect(coll._actions.remove.emit).to.have.been.called.once
		})

		it('shold not call the `emit` method if the item is not found', function() {
			chai.spy.on(coll._actions.remove, 'emit')

			coll.remove('item1')

			expect(coll._actions.remove.emit).to.not.have.been.called
		})

	})

})