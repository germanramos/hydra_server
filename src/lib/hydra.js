var commons = require('./commons'),
	utils = require('./utils'),
	enums = require('./enums');

var hydra = module.exports;
hydra.enums = enums;

var config = {};

hydra.init = function(p_dbClient, p_config, p_cbk){
	config = utils.merge(config, p_config);

	hydra.app = require('./dao/app')(p_dbClient, config);

	p_cbk();
};
