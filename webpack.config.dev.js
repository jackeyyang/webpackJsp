/*
* @Author: jacky.yang
* @Date:   2018-03-16 17:06:42
* @Last Modified by:   jacky.yang
* @Last Modified time: 2018-03-16 17:14:28
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
const glob = require('glob');
const yamlFrontMatter = require('yaml-front-matter');
const myConfig = require('./webpack/myConfig');
const loader = require('./webpack/loader');

rimraf.sync(config.OUTPUTPATH_DEV);

module.exports = function(argv) {
	argv = argv || {};

	return {
		entry: './src/scripts/utils/common.js',
		output: {
			path: config.OUTPUTPATH_DEV,
			filename: 'scripts/[name].js',			
		},
		module: {
			rules: loader()
		},
		devServer: {
			stats: 'minimal',
			port: config.PORT,
			host: '0.0.0.0',
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		}
	}
};