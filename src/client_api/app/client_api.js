var commons = require('../../lib/commons'),
	async	= commons.async,
	hero	= commons.hero,
	app		= hero.app,
	express	= commons.express,
	hydra	= commons.hydra
	utils	= commons.utils;

module.exports = hero.worker (
	function(self){
		var dbHydra = self.db('config', self.config.db);

		// Configuration
		app.configure(function() {
			app.use(express.bodyParser());
			app.use(utils.addHeaders(self.config.client_api.allowedOrigins));
			app.use(app.router);
			app.use(express.errorHandler({
				dumpExceptions : true,
				showStack : true
			}));
		});

		self.ready = function(p_cbk){
			dbHydra.setup(
				function(err, client){
					hydra.init(client, self.config, p_cbk);
				}
			);
		};

	}
);

module.exports.hydra = hydra;
