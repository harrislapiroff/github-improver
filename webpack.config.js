var webpack       = require('webpack');
var merge         = require('webpack-merge');
var autoprefixer  = require('autoprefixer');
var path = require('path');

var TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

var target = path.resolve(__dirname, 'addon')

function postcssOptions() {
	return {
		defaults: [autoprefixer],
		cleaner: [autoprefixer({ browsers: [
			'Chrome >= 35',
			'Firefox >= 31',
			'Edge >= 12',
			'Explorer >= 9',
			'iOS >= 8',
			'Safari >= 8',
			'Android 2.3',
			'Android >= 4',
			'Opera >= 12'
		]})]
	}
}

var sassLoaderOptions = {
	includePaths: [__dirname + '/node_modules']
}

var common = {
	entry: {
		content_script: path.resolve(__dirname, 'src/content_script.js')
	},

	output: {
		path: target,
		filename: "[name].js"
	},

	sassLoader: sassLoaderOptions,

	postcss: postcssOptions,

	resolve: {
		alias: { '~': path.resolve(__dirname, 'src') },
		extensions: ['', '.js', '.jsx', '.json', '.scss', '.sass'],
		modulesDirectories: ['node_modules']
	},

	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel',
				query: {
					presets: ['es2015', 'stage-0', 'stage-1', 'stage-2'],
					plugins: ['add-module-exports']
				},
				include: path.resolve(__dirname, 'src/')
			},
			{
				test: /\.json$/,
				loader: 'json',
			},

			{
				test: /\.s[ca]ss$/,
				loader: 'style!css?url=false!postcss!sass',
				include: path.resolve(__dirname, 'src/')
			},

			{
				test: /\.css$/,
				loader: 'style!css!postcss'
			}
		]
	},
};

if (TARGET === 'build') {
	module.exports = merge(common, {
		plugins: [
			new webpack.DefinePlugin({
				'process.env': { 'NODE_ENV': JSON.stringify('production') }
			})
		]
	});
}

if (TARGET === 'start') {
	module.exports = merge(common, {
		devtool: 'eval-source-map',
		devServer: {
			contentBase: target,
			progress: true,
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env': { 'debug': true }
			})
		]
	});
}
