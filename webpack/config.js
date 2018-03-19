'use strict';

const path = require('path'); // 路径处理模块
const PORT = 9999; // 设置端口常量
const cwd = process.cwd(); // 当前执行node命令时候的文件夹地址
var resolve =  function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(cwd);
	return path.resolve.apply(null,args);
};

var alias = {
	libs: resolve('libs'),
	jquery: resolve('libs/jquery'),
	utils: resolve('src/script/utils'),
	fonts: resolve('src/fonts'),
	home: resolve('src/projects/home'),
	images: resolve('src/projects/images'),
	images_sprites: resolve('src/images/spritesImage'),
	sass: resolve('src/sass'),
	sass_sprites: resolve('src/sass/sprites'),
	scripts: resolve('src/scripts'),
	tpl: resolve('src/tpl'),
	data: resolve('data')
}

exports.projects = ['clinic','match'];

exports.templateSetting = {
	layout: 'src/layouts',
	partial: 'src/partials',
	pages: 'src/projects',
	interpolate: /\{\{(.+?)\}\}/g,
	evaluate: /\[\[(.+?)\]\]/g
}

exports.vendor = ['jquery', 'libs/bootstrap', 'scripts/common'];
exports.vendor_match = ['jquery', 'libs/bootstrap'];
exports.STATIC_URL = {
	DEV: 'http://d.sinotn.com:' + PORT,
	PRO: '/static'
};

// 文件hash的长度
exports.HASH_LENGTH = (hash, env) => env=='pro' ? '?[' + hash + ':9]' : '';
exports.resolve = resolve;
exports.OUTPUTPATH_PRO = resolve('../sinotn-lawTeach-static-pro/static/lawTeach');
exports.OUTPUTPATH_DEV = resolve('dev');
exports.alias = alias;
exports.CWD = cwd;
exports.PORT = PORT;