/*
* @Author: jacky.yang
* @Date:   2018-03-16 17:06:42
* @Last Modified by:   jacky.yang
* @Last Modified time: 2018-04-01 11:48:49
*/

'use strict'
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMD5Hash = require('webpack-md5-hash');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const rimraf = require('rimraf');
const config = require('./webpack/config');
const glob = require('glob');
const yamlFrontMatter = require('yaml-front-matter');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const _ = require('underscore');
const loader = require('./webpack/loader');

// html模板文件
const pageFile = glob.sync('src/projects/**/v/**/*',{
	nodir: true
});

var entries = {};

var plugins = [
	
	// 抽取公共的js
	new webpack.optimize.CommonsChunkPlugin({
		name: ['vendor','manifest'],
		minChunks: Infinity
	}),

	// 独立生成css文件
	new ExtractTextPlugin('styles/[name].css'+config.HASH_LENGTH('contenthash','pro')),

	// 把一个全局变量加到所有的代码中，方便支持jquery的其他插件使用;
	new webpack.ProvidePlugin({
		$: 'jquery',
		jQuery: 'jquery',
		'window.jQuery': 'jquery',
		'window.$': 'jquery'
	})
];