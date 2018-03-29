/*
* @Author: jacky.yang
* @Date:   2018-03-16 17:06:42
* @Last Modified by:   jacky.yang
* @Last Modified time: 2018-03-29 17:41:35
*/

'use strict'
const webpack = require('webpack');
const path = require('path');
const rimraf = require('rimraf'); // 删除文件
// extract-text-webpack-plugin
// 该插件的主要是为了抽离css样式,防止将样式打包在js中引起页面样式加载错乱的现象
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const TemplatePlugin = require('./webpack/templatePlugin'); // 模版生成工具
const config = require('./webpack/config');
const glob = require('glob'); // 允许你使用 *等符号,写一个glob规则,匹配对应规则的文件
const yamlFrontMatter = require('yaml-front-matter'); // 使用一段 YAML 语法的头部文本来标记源文件
const myConfig = require('./webpack/myConfig');
const loader = require('./webpack/loader'); // 各种loader设置文件

var projects = config.projects;

var webpackObj = [];

projects.forEach(function(project) {

	var OUTPUTPATH_DEV = config.OUTPUTPATH_DEV + '/'+ project;
	// config.OUTPUTPATH_DEV = resolve('dev')
	rimraf.sync(OUTPUTPATH_DEV);

	// //  html模板路径
	const pageFiles = glob.sync('src/projects/' + project + '/v/**/*', {
		nodir: true
	});
	// console.log('src/projects/clinic/v/clinic.jsp');
	// console.log('xbsebbbb:'+pageFiles);

	var entries = {};

	var plugins = [
		new webpack.optimize.CommonsChunkPlugin({
			names: ['vendor','manifest'],
			minChunks: Infinity
		}),
		new ExtractTextPlugin('styles/[name].css' + config.HASH_LENGTH('contenthash')),
		//  去重
		// new webpack.HashedModuleIdsPlugin(),
		//把一个全局变量插入到所有的代码中,支持jQuery plugin的使用;使用ProvidePlugin加载使用频率高的模块
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			'window.$': 'jquery'
		})
	];


	plugins.push(
		new TemplatePlugin({
			project: project,
			// host: CONFIG.BASE_URL.dev,
			pages: 'src/projects/' + project,
			layout: 'src/layouts',
			partial: 'src/partials',
			// addTemplateHelpers: CONFIG.addTemplateHelpers,
			//  输出路径   {path}目标文件路径
			distPath: function(filepath) {
				filepath = filepath.replace(/\\/g, '\/');
				var reg = /\/src\/projects\/(.*)\/v\/(.*)/ig;
				var regObj = reg.exec(filepath);
				var pName = regObj[1];
				var file = regObj[2]
				// myConfig.JSP_DEV_PATH = F:\\Trunk2\\apache-tomcat-8.0.46\\webapps
				file = myConfig.ECLIPSE ? path.resolve(myConfig.JSP_DEV_PATH, myConfig.FOLDERNAME+'/'+pName + '/v/' + file) : path.resolve(myConfig.JSP_DEV_PATH, '.metadata/.plugins/org.eclipse.wst.server.core/tmp1/wtpwebapps/' + myConfig.FOLDERNAME +'/'+ pName + '/v/' + file);
				// console.log('file11111'+file);
				// \Trunk2\apache-tomcat-8.0.46\webapps\choiceEX\clinic\v\clinic.jsp
				return file;
			}
		})
	)

	pageFiles.forEach(function(item) {
		var pageData = yamlFrontMatter.loadFront(item);
		var entry = pageData.entry && pageData.entry.replace(/\.js$/, '');
		var chunks = [];
		if (entry) {
			chunks = ['manifest', 'vendor'];
			if (entry !== 'common') {
				chunks.push(entry);
				entries[entry.replace(project+'/scripts/', '')] = [path.join(__dirname, 'src/projects', entry)];
				// entries[entry.replace('/scripts/', '/')] = [path.join(__dirname, 'src/projects', entry)];
				console.log('entries3333'+JSON.stringify(entries));
			}
		}
	});

	entries['vendor'] = config.vendor;
	// entries['vendor_match'] = config.vendor_match;
	console.log('entriesxxxxx'+JSON.stringify(entries));


	var loaderAry = loader();
	webpackObj.push({
		entry: entries,
		output: {
			path: OUTPUTPATH_DEV, // resolve('dev')
			filename: 'scripts/[name].js' + config.HASH_LENGTH('chunkhash'), // name = 'match'
			chunkFilename: 'scripts/[name].js' + config.HASH_LENGTH('chunkhash'),
			publicPath: config.STATIC_URL.DEV+ '/dev/' // config.STATIC_URL.DEV = http://dev.choice.com:9999
		},

		module: {
			rules:loaderAry
		},
		resolve: {
			alias: config.alias
		},
		plugins: plugins,
		devServer: {
			stats: 'minimal',
			port: config.PORT,
			host: '0.0.0.0',
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			disableHostCheck: true
		}
	});

})

module.exports = webpackObj;
