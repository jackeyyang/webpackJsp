/*
* @Author: jacky.yang
* @Date:   2018-03-16 17:06:42
* @Last Modified by:   jacky.yang
* @Last Modified time: 2018-03-23 18:18:06
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

rimraf.sync(config.OUTPUTPATH_DEV); // 清空开发输出的文件夹

// 获取得模板文件夹下的所有模板文件
const pageFiles = glob.sync('src/projects/**/v/**/*',{
	nodir: true
});
console.log('pageFiles '+ pageFiles);

/**
 * [entries start]
 */
var entries = {}; // 入口对象
pageFiles.forEach(function(item){

	var pageData = yamlFrontMatter.loadFront(item);
	var entry = pageData.entry && pageData.entry.replace(/\.js$/, '');
	console.log('entry '+entry);
	var chunks = [];
	if(entry){ // 如果有entry
		chunks = ['manifest','vendor'];
		if(entry != 'common'){ // 如果是其他的entry
			chunks.push(entry);
			entries[entry.replace('/scripts/', '/')] = [path.join(__dirname, 'src/projects', entry)];
			console.log('entries '+ JSON.stringify(entries));
		}
	}

});
entries['vendor'] = config.vendor; // ['jquery', 'libs/bootstrap','scripts/common']模块打包到一个文件
/**
 * [entries end]
 */

var plugins = [];
plugins.push(
	// 将公共用到的打包进vendor
	new webpack.optimize.CommonsChunkPlugin({
		name: ['vendor','manifest'],
		minChunks: Infinity
	}),
	// 处理css
	new ExtractTextPlugin('styles/[name].css' + config.HASH_LENGTH('contenthash')),
	//把一个全局变量插入到所有的代码中,支持jQuery plugin的使用;
	//使用ProvidePlugin加载使用频率高的模块
	new webpack.ProvidePlugin({
		$: 'jquery',
		jQuery: 'jquery',
		'window.jQuery': 'jquery',
		'window.$': 'jquery'
	})
);

plugins.push(
	new TemplatePlugin({
		// host: CONFIG.BASE_URL.dev,
		pages: 'src/projects',
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
			// return config.resolve('dev', pName, 'v', file);

			// /Users/xiexie/sinotn/projects/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/sinotn-lawTeach-user-web/v
			//
			//  /sinotn-lawTeach-exam-web/src/main/webapp/v
			console.log(file,'aaa');
			file = myConfig.ECLIPSE ? path.resolve(myConfig.JSP_DEV_PATH, 'webpackJsp-' + pName + '-web/src/main/webapp/v/' + file) : path.resolve(myConfig.JSP_DEV_PATH, '.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/sinotn-lawTeach-' + pName + '-web/v/' + file);
			console.log(file,'bbb');
			return file;
			// return path.replace(/\/src\/swig\/(\w+)\//, '/' + ASSETS_FOLDER + '/projects/$1/v/')
		}
	})
)

console.log('xxxxxxxxxxxxx'+ myConfig.ECLIPSE + JSON.stringify(plugins));

// console.log('plugins111:'+JSON.stringify(plugins));

module.exports = function(argv) {
	argv = argv || {};

	return {
		entry: entries,
		output: {
			path: config.OUTPUTPATH_DEV,
			filename: 'scripts/[name].[chunkhash:8].js' + config.HASH_LENGTH('chunkhash'),
			chunkFilename: 'scripts/[name].js' + config.HASH_LENGTH('chunkhash'),
			publicPath: config.STATIC_URL.DEV + '/dev/'
		},
		module: {
			rules: loader()
		},
		resolve: {
			alias: config.alias
		},
		devServer: {
			stats: 'minimal',
			port: config.PORT,
			host: '0.0.0.0',
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		},
		plugins: plugins
	}
};