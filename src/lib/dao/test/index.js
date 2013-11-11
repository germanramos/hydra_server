var Dao = require('../app.js')
dao = new Dao();

// Insert new app
var newApp = {
	hydra_5: {
		localStrategyEvents : {
			'12374897239': 1,
			'22374897239': 2
		},
		cloudStrategyEvents : {
			'32374897239': 3,
			'42374897239': 4
		},
		servers : {
			'server1': {
				server: 'http://server1/app',
				cloud : 'nubeA',
			 	cost : 1,
				status: {
					cpuLoad: 0,
					memLoad: 10,
					timeStamp: 12374897239,
					stateEvents: {
						'12374897239': 1,
						'22374897239': 2,

					}
				}
			},
			'server2': {
				server: 'http://server2/app',
				cloud : 'nubeB',
			 	cost : 2,
				status: {
					cpuLoad: 20,
					memLoad: 0,
					timeStamp: 22374897239,
					stateEvents: {
						'32374897239': 3,
						'42374897239': 4,

					}
				}
			}
		}
	}
};

console.log("******* CREATE TEST *********");
dao.create(newApp, function(doc, err) {
	console.log("Entra");
});

// console.log("******* GET FROM ID TEST *********");
// dao.getFromId('hydra_3', function() {
// 	console.log("*** End ***");
// });

// console.log("******* GET ALL TEST *********");
// dao.getAll(function() {
// 	console.log("*** End ***");
// });