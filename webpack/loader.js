const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./config');

module.exports = function(env) {
	return [{
		test: /\.(jpe?g|png|gif|ico)$/i,
		use: [{
			loader: 'url-loader',
			options: {
				limit: 192,
				name: 'images/[name].[ext]' + config.HASH_LENGTH('hash', env),
				context: './src',
				publicPath:'../'
			}
		}]
	}, {
		test: /\.(scss|sass)$/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: [{
				loader: 'css-loader',
			}, {
				loader: 'postcss-loader',
				options: {
					plugins: function() {
						return [
							require('autoprefixer')({
								browsers: ['> 0%']
							})
						];
					}
				}
			}, {
				loader: 'resolve-url-loader'
			}, {
				loader: 'sass-loader',
				options: {
					sourceMap: true,
					includePaths: [
						config.resolve('src/sass')
					],
					//  注释
					// sourceComments: true,
					//  小数点后几位数
					precision: 1,
					//  输出格式 nested, expanded, compact, compressed
					outputStyle: 'compressed'
				}
			}]
		})
	}, {
		test: /\.(html|jsp)$/,
		use: [{
			loader: './webpack/ejs-loader',
			options: config.templateSetting
		}]
	}, {
		test: /\.(eot|svg|ttf|woff|woff2)/,
		use: [{
			loader: 'url-loader',
			options: {
				limit: 192,
				name: '[path][name].[ext]' + config.HASH_LENGTH('hash', env),
				context: './src'
			}
		}]
	}, {
		test: /\.js$/,
		exclude: [/node_modules/, config.alias.libs],
		use: [{
			loader: 'babel-loader',
			options: {
				presets: ['es2015']
			}
		}]
	}, {
		test: config.alias.jquery,
		// 将jquery绑定为window.jQuery 和 window.$
		use: [{
			loader: 'expose-loader',
			options: '$'
		}, {
			loader: 'expose-loader',
			options: 'jQuery'
		}]
	}]

}
