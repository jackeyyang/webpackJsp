/*
* @Author: jacky.yang
* @Date:   2018-03-16 17:06:42
* @Last Modified by:   jacky.yang
* @Last Modified time: 2018-03-21 17:57:40
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
const pageFiles = glob.sync('src/projects/**/v/**/*');
console.log('pageFiles'+ pageFiles);

module.exports = function(argv) {
	argv = argv || {};

	return {
		entry: './src/scripts/utils/common.js',
		output: {
			path: path.join(myConfig.JSP_DEV_PATH),
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