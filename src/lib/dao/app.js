var utils = require('../utils'),
enums = require('../enums')

module.exports = function(etcd, config){
	var self = {};

	function extractLastKeyFromPath(path) {
		var n = path.lastIndexOf("/");
		var key = path.substr(n+1)
		return key;
	}

	function jsonToEtcd(json, whole) {
		function processJson(json, parentKey) {
			if(parentKey == null) parentKey = "";
			for (var key in json) {
				var record = {};
				record.key = parentKey + "/" + key;
				record.val = undefined;
				if (typeof json[key] == 'object' && Object.getOwnPropertyNames(json[key]).length) {
					if (whole) output.push(record);
					processJson(json[key], record.key);
				} else {
					record.val = json[key].toString();
					output.push(record);
				}
			}
		}

		var output = [];

		if (json != null && typeof json == 'object') {
			processJson(json);
			return output;
		} else {
			return null
		}
	}

	function etcdToJson(level) {
		function processEtcd(level, output) {
			if (Object.prototype.toString.call(level) == '[object Array]') {
				for (var i = 0; i < level.length; i++) {
					processEtcd(level[i], output);
				}
			} else if (level != null && typeof level == 'object') {
				var key = extractLastKeyFromPath(level.key);
				if (key === "") key = "root";
				if ('dir' in level) {
					output[key] = {};
					processEtcd(level.kvs, output[key]);
				} else {
					output[key] = level['value'];
				}
			}
		}

		var output = {};

		if (level != null && typeof level == 'object') {
			processEtcd(level, output);
			return output;
		} else {
			return null;
		}
	}
	
	function insert(appJson, callback) {
		var etcdTree = jsonToEtcd(appJson);
		if (etcdTree === null) {
			callback(null);
		} else {
			console.log("***Length: " + etcdTree.length);
			console.log(etcdTree);
			var error = null;
			for (var i = 0; i < etcdTree.length; i++) {
				etcd.set(etcdTree[i]['key'], etcdTree[i]['val'], function(err, val) {
					if (err != null && error === null) error = err;
				});
			}
			callback(error);
		}
	}

	self.create = function(p_app, p_cbk){
		insert(p_app, function(err, items){
			if(p_cbk) p_cbk(err);
		});
	};

	self.getAll = function(p_cbk){
		etcd.get("", { recursive: true }, function(err, item) {
			if(item !== null) {
				var rootDir = etcdToJson(item);
				if (rootDir !== null) {
					apps = rootDir.root;
					p_cbk(apps);
				} else {
					p_cbk(null);
				}
			} else {
				p_cbk(null);
			}
		});
	};

	self.getFromId = function(p_appId, p_cbk){
		etcd.get("/" + p_appId, { recursive: true }, function(err, item) {
			if(item !== null) {
				var app = etcdToJson(item);
				if (app !== null) {
					console.log(JSON.stringify(app));
					console.log(app);
					p_cbk(app);
				} else {
					p_cbk(null);
				}
			} else {
				p_cbk(null);
			}
		});
	};

	self.update = function(p_app, p_cbk){
		this.create(p_app,  function(err){
			if(p_cbk) p_cbk(err);
		});
	};

	self.remove = function(p_appId, p_cbk){
		etcd.del("/"+p_appId, function(err, item){
			if(err) {
				p_cbk(err);
			}
			else {
				p_cbk(null);
			}
		});
	};

	self.availableServers = function (p_appId, p_cbk){
		self.getFromId(p_appId, function(app){
			if(app === null){
				p_cbk(null);
				return;
			}

			self.balanceServers(app, p_cbk);
		});
	};

	function onlineClouds(p_app){
		var clouds = [];

		for(var serverIdx in p_app.servers){
			var server = p_app.servers[serverIdx];
			for(var serverStateIdx in server.status.stateEvents){
				if(server.status.stateEvents[serverStateIdx] == enums.app.stateEnum.READY){
					if(clouds.indexOf(server.cloud) == -1) clouds.push(server.cloud);
				}

				break;
			}
		}
		return clouds;
	}

	function onlineCloudsLoad(p_app){
		var clouds = onlineClouds(p_app);
		var loads = [];

		var servers, load;
		var c,C= clouds.length;
		for(c=0;c<C;c++){
			servers = onlineServersLoad(p_app, clouds[c]);
			load = 0;
			var s,S=servers.length;
			for(s=0;s<S;s++){
				load += servers[s];
			}
			load=load/S;
			loads.push(load);
		}
		return loads;
	}

	function onlineCloudsCost(p_app){
		var clouds = onlineClouds(p_app);
		var costs = [];

		var servers, cost;
		var c,C= clouds.length;
		for(c=0;c<C;c++){
			servers = onlineServersCost(p_app, clouds[c]);
			cost = 0;
			var s,S=servers.length;
			for(s=0;s<S;s++){
				cost += servers[s];
			}
			cost = cost / S;
			costs.push(cost);
		}
		return costs;
	}


	function onlineServers(p_app, p_cloud){
		var servers = [];

		for(var serverIdx in p_app.servers){
			var server = p_app.servers[serverIdx];
			if(p_cloud && server.cloud != p_cloud) continue; // not in current cloud
			for(var serverStateIdx in server.status.stateEvents){
				if(server.status.stateEvents[serverStateIdx] == enums.app.stateEnum.READY){
					servers.push(server.server);
				}

				break;
			}
		}

		return servers;
	}

	function onlineServersLoad(p_app, p_cloud){
		var servers = [];

		for(var serverIdx in p_app.servers){
			var server = p_app.servers[serverIdx];
			if(p_cloud && server.cloud != p_cloud) continue; // not in current cloud
			for(var serverStateIdx in server.status.stateEvents){
				if(server.status.stateEvents[serverStateIdx] == enums.app.stateEnum.READY){
					servers.push(parseFloat(server.status.cpuLoad) + parseFloat(server.status.memLoad));
				}

				break;
			}
		}
		return servers;
	}

	function onlineServersCost(p_app, p_cloud){
		var servers = [];

		for(var serverIdx in p_app.servers){
			var server = p_app.servers[serverIdx];
			if(p_cloud && server.cloud != p_cloud) continue; // not in current cloud
			for(var serverStateIdx in server.status.stateEvents){
				if(server.status.stateEvents[serverStateIdx] == enums.app.stateEnum.READY){
					servers.push(parseInt(server.cost));
				}

				break;
			}
		}
		return servers;
	}

	function localStrategy(p_app){
		//current strategy
		var currentStrategy = enums.app.localStrategyEnum.INDIFFERENT;
		for(var localStrategyIdx in p_app.localStrategyEvents){
			currentStrategy = p_app.localStrategyEvents[localStrategyIdx];
			break;
		}
		return currentStrategy;
	}

	function cloudStrategy(p_app){
		//current strategy
		var currentStrategy = enums.app.cloudStrategyEnum.INDIFFERENT;
		for(var cloudStrategyIdx in p_app.cloudStrategyEvents){
			currentStrategy = p_app.cloudStrategyEvents[cloudStrategyIdx];
			break;
		}
		return currentStrategy;
	}

	var cloudCurrentRoundRobin = {};
	var localCurrentRoundRobin = {};
	self.balanceServers = function(p_app, p_cbk){
		var appId = p_app.appId;
		var servers = [];
		var clouds = onlineClouds(p_app);
		var currentLocalStrategy = parseInt(localStrategy(p_app));
		var currentCloudStrategy = parseInt(cloudStrategy(p_app));

		var cutPoint,pre,post,loads, costs;

		var c,C, currentCloud;
		// -------------
		// CLOUD BALANCE
		// -------------

		switch(currentCloudStrategy){
			case enums.app.cloudStrategyEnum.INDIFFERENT:
				cutPoint = Math.floor(Math.random()*clouds.length);
				//cortamos la baraja :)
				pre = clouds.slice(0,cutPoint);
				post = clouds.slice(cutPoint);
				clouds = post.concat(pre);
				break;

			case enums.app.cloudStrategyEnum.ROUND_ROBIN:
				if(cloudCurrentRoundRobin[appId] === undefined) {
					cloudCurrentRoundRobin[appId] = 0;
				}

				if(cloudCurrentRoundRobin[appId] >= clouds.length) {
					cloudCurrentRoundRobin[appId] = 0;
				}

				//cortamos la baraja :)
				pre = clouds.slice(0,cloudCurrentRoundRobin[appId]);
				post = clouds.slice(cloudCurrentRoundRobin[appId]);
				clouds = post.concat(pre);
				cloudCurrentRoundRobin[appId]++;
				break;

			case enums.app.cloudStrategyEnum.CHEAPEST:
				costs = onlineCloudsCost(p_app);
				loads = onlineCloudsLoad(p_app);

				var cloudCosts = [];
				C = clouds.length;
				for(c=0;c<C;c++){
					cloudCosts.push({k:clouds[c],c:costs[c],l:loads[c]});
				}
				cloudCosts.sort(function(a,b){
					// if(a.l > 160 && b.l > 160) return a.c - b.c;
					if(a.l > 160 && b.l < 160) return 1;
					if(a.l < 160 && b.l > 160) return -1;
					return a.c - b.c;
				});
				clouds=[];
				for(c=0;c<C;c++){
					clouds.push(cloudCosts[c].k);
				}

				break;

			case enums.app.cloudStrategyEnum.CLOUD_LOAD:
				loads = onlineCloudsLoad(p_app);

				var cloudLoads = [];
				C = clouds.length;
				for(c=0;c<C;c++){
					cloudLoads.push({k:clouds[c],v:loads[c]});
				}
				cloudLoads.sort(function(a,b){
					return a.v - b.v;
				});
				clouds=[];
				for(c=0;c<C;c++){
					clouds.push(cloudLoads[c].k);
				}

				break;

			default:
				break;
		}

		servers = onlineServers(p_app, clouds[0]);

		// --------------
		// SERVER BALANCE
		// --------------

		switch(currentLocalStrategy){

			//LOCAL INDIFFERENT
			case enums.app.localStrategyEnum.INDIFFERENT:
				cutPoint = Math.floor(Math.random()*servers.length);
				//cortamos la baraja :)
				pre = servers.slice(0,cutPoint);
				post = servers.slice(cutPoint);
				servers = post.concat(pre);
				break;

			//LOCAL ROUND ROBIN
			case enums.app.localStrategyEnum.ROUND_ROBIN:
				if(localCurrentRoundRobin[appId] === undefined){
					localCurrentRoundRobin[appId] = {};
				}
				if(localCurrentRoundRobin[appId][clouds[0]] === undefined){
					localCurrentRoundRobin[appId][clouds[0]] = 0;
				}

				if(localCurrentRoundRobin[appId][clouds[0]] >= servers.length){
					localCurrentRoundRobin[appId][clouds[0]] = 0;
				}

				//cortamos la baraja :)
				pre = servers.slice(0,localCurrentRoundRobin[appId][clouds[0]]);
				post = servers.slice(localCurrentRoundRobin[appId][clouds[0]]);
				servers = post.concat(pre);
				localCurrentRoundRobin[appId][clouds[0]]++;
				break;

			//LOCAL SERVER LOAD
			case enums.app.localStrategyEnum.SERVER_LOAD:
				loads = onlineServersLoad(p_app, clouds[0]);

				var serverLoads = [];
				var s,S = servers.length;
				for(s=0;s<S;s++){
					serverLoads.push({k:servers[s],v:loads[s]});
				}

				serverLoads.sort(function(a,b){
					return a.v - b.v;
				});

				servers = [];
				for(s=0;s<S;s++){
					servers.push(serverLoads[s].k);
				}

				break;

			case enums.app.localStrategyEnum.CHEAPEST:
				costs = onlineServersCost(p_app, clouds[0]);

				var serverCosts = [];
				var s,S = servers.length;
				for(s=0;s<S;s++){
					serverCosts.push({k:servers[s],v:costs[s]});
				}

				serverCosts.sort(function(a,b){
					return a.v - b.v;
				});

				servers = [];
				for(s=0;s<S;s++){
					servers.push(serverCosts[s].k);
				}

				break;

			default:
				break;
		}

		//adding servers of other clouds
		C = clouds.length;
		var cloudServers = [];
		for(c = 1; c<C;c++){
			cloudServers = onlineServers(p_app,clouds[c]);
			servers = servers.concat(cloudServers);
		}

		p_cbk(servers);
	};

	return self;
};
