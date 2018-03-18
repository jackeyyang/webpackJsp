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
	untils: resolve('src/script/utils');
}