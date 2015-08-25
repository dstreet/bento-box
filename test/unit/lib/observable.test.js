var chai = require('chai')
var expect = chai.expect
var spies = require('chai-spies')
var Observable = require('../../../lib/observable')

chai.use(spies)

describe('Observable', function() {

	describe('constructor', function() {

		it('should create a new observable instance', function() {
			var obs = new Observable()

			expect(obs).to.be.instanceof(Observable)
		})

	})

	describe('_actionMethod()', function() {

		var obs
		var fn
		var res

		beforeEach(function() {
			obs = new Observable('add')
			chai.spy.on(obs, '_drainQueue')

			fn = function() {}
			res = obs._actionMethod(fn, true)
		})

		it('should append the list of responders', function() {
			expect(obs._responders).to.contain({
				callback: fn,
				filter: true
			})
		})

		it('should call _drainQueue()', function() {
			expect(obs._drainQueue).to.have.been.called()
		})

		it('should return the new responder', function() {
			expect(res).to.contain({
				callback: fn,
				filter: true
			})
		})

	})

	describe('_drainQueue()', function() {

		var obs

		beforeEach(function() {
			obs = new Observable('add')
		})

		it('should emit every action to the responder', function() {
			obs.emit('item1')
			obs.emit('item2')
			obs.emit('item3')

			var items = []
			var fn = chai.spy(function(item) { items.push(item) })

			obs._actionMethod(fn)
			expect(fn).to.have.been.called.exactly(3)
			expect(items).to.eql(['item1', 'item2', 'item3'])
		})

		it('should only emit the same data to responder callback and filter', function(done) {
			var data = { foo: 'bar' }
			obs.emit(data)

			obs._actionMethod(function(res) {
				expect(res).to.eql(data)
				done()
			}, function(res) {
				expect(res).to.eql(data)
				return true
			})
		})

	})

	describe('_dataMatchesFilter', function() {
		var obs

		beforeEach(function() {
			obs = new Observable('remove')
		})

		it('should pass the action data to the filter function', function() {
			var filter = chai.spy(function(data) {})
			obs._dataMatchesFilter('item1', filter)

			expect(filter).to.have.been.called.with('item1')
		})

		it('should return true if the filter function returns true', function() {
			var filter = chai.spy(function(data) { return true })
			expect(obs._dataMatchesFilter('item1', filter)).to.be.true
		})

		it('should return false if the filter function returns false', function() {
			var filter = chai.spy(function(data) { return false })
			expect(obs._dataMatchesFilter('item1', filter)).to.be.false
		})

		it('should return true if no filter is defined', function() {
			expect(obs._dataMatchesFilter('item1')).to.be.true
			expect(obs._dataMatchesFilter('item1', null)).to.be.true
			expect(obs._dataMatchesFilter('item1', undefined)).to.be.true
		})

		it('should return true if a value-based filter exactly matches the data', function() {
			expect(obs._dataMatchesFilter('item1', 'item1')).to.be.true
			expect(obs._dataMatchesFilter(42, 42)).to.be.true
			expect(obs._dataMatchesFilter(this, this)).to.be.true
		})

		it('should return false if a value-based filter does not exactly match the data', function() {
			expect(obs._dataMatchesFilter('item1', 'item2')).to.be.false
			expect(obs._dataMatchesFilter(['item1'], ['item1'])).to.be.false
			expect(obs._dataMatchesFilter({ item: 1 }, { item: 1 })).to.be.false
		})

		it('should pass the same data to the filter as is passed to the responder callback', function() {
			var filterData
			var cb = chai.spy()
			var filter = chai.spy(function(data) { filterData = data; return true })

			obs._actionMethod(cb, filter)
			obs.emit({foo: 'bar'})

			expect(cb).to.have.been.called.with(filterData)

			obs.emit('foo', 'bar')

			expect(cb).to.have.been.called.with(filterData)
		})
	})

	describe('_dataWithKeyMatchesFilter()', function() {
		var obs

		beforeEach(function() {
			obs = new Observable('remove')
		})

		it('should pass the action data to the filter function', function() {
			var filter = chai.spy(function(key, data) {})
			obs._dataWithKeyMatchesFilter('items', 'item1', filter)

			expect(filter).to.have.been.called.with('items')
			expect(filter).to.have.been.called.with('item1')
		})

		it('should return true if the filter function returns true', function() {
			var filter = chai.spy(function(data) { return true })
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', filter)).to.be.true
		})

		it('should return false if the filter function returns false', function() {
			var filter = chai.spy(function(data) { return false })
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', filter)).to.be.false
		})

		it('should return true if no filter is defined', function() {
			expect(obs._dataWithKeyMatchesFilter('items', 'item1')).to.be.true
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', null)).to.be.true
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', undefined)).to.be.true
		})

		it('should return true if a value-based filter exactly matches the key', function() {
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', 'items')).to.be.true
			expect(obs._dataWithKeyMatchesFilter(42, 42)).to.be.true
			expect(obs._dataWithKeyMatchesFilter(this, this)).to.be.true
		})

		it('should return false if a value-based filter does not exactly match the data', function() {
			expect(obs._dataWithKeyMatchesFilter('items', 'item1', 'tests')).to.be.false
		})
	})

	describe('emit()', function() {

		var obs

		beforeEach(function() {
			obs = new Observable('remove')
		})

		it('should push the data to the queue', function() {
			obs.emit('item1')
			expect(obs._q).to.have.length(1)

			obs.emit('item2')
			expect(obs._q).to.have.length(2)
		})

		it('should call the callback of every matching responder', function() {
			var fn1 = chai.spy(function(item) {})
			var fn2 = chai.spy(function(item) {})

			obs._actionMethod(fn1)
			obs._actionMethod(fn2)

			obs.emit('item1')
			expect(fn1).to.have.been.called.once()
			expect(fn1).to.have.been.called.with('item1')
			expect(fn2).to.have.been.called.once()
			expect(fn2).to.have.been.called.with('item1')
		})

		it('should not call the callback of a responder that does not match', function() {
			var fn = chai.spy(function(item) {})

			obs._actionMethod(fn, function() { return false })
			obs.emit('item1')

			expect(fn).to.not.have.been.called()
		})

	})

	describe('unsubscribe()', function() {

		var obs

		beforeEach(function() {
			obs = new Observable('remove')
		})

		it('should remove the responder from the list of responders', function() {
			var fn = chai.spy(function() {})

			obs._actionMethod(fn)
			obs.unsubscribe(fn)

			expect(obs._responders).to.have.length(0)

			obs.emit('item1')
			expect(fn).to.not.have.been.called()
		})

		it('should only remove a responder if both the callback and filter match', function() {
			var fn = chai.spy(function() {})

			obs._actionMethod(fn, 'item1')
			obs._actionMethod(fn, 'item2')
			obs.unsubscribe(fn, 'item1')

			expect(obs._responders).to.have.length(1)

			obs.emit('item1')
			obs.emit('item2')
			expect(fn).to.have.been.called.exactly(1)
		})

	})

})