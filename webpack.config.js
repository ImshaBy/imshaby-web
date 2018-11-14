const NODE_ENV = process.env.NODE_ENV || 'development',
	confType = NODE_ENV === 'production' ? 'prod' : 'dev';

//module.exports = require(`./config/webpack.${confType}.js`);

module.exports = require(`./config/webpack.${confType}.js`);