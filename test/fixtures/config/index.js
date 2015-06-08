module.exports = {

	server: {
		port: 3001
	},

	controller: {
		
	},

	model: {

	},

	view: {
		engine: 'ejs',
		path: 'app/views'
	},

	router: {
		routes: {
			'get /':    'HomeController.index',
			'get /foo': 'HomeConroller.foo'
		}
	}

}
