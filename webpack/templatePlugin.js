var gaze = require('gaze'); // 监听文件变化
// 使用async模块后,代码看起来优雅很多.看起来像同步,
// 其实底层还是异步的.只是书写的方式变了而已.
var async = require('async');
var glob = require('glob'); // 用来匹配文件路径的
var path = require('path');
var fs = require('fs'); // 文件操作系统模块
var mkdirp = require('mkdirp'); // 文件夹创建操作
var yamlFrontMatter = require('yaml-front-matter'); // 使用一段 YAML 语法的头部文本来标记源文件
var _ = require('underscore'); // Underscore封装了常用的JavaScript对象操作方法，用于提高开发效率。
var config = require('./config'); // 引入设置

var makeTemp = function(text, templateId, options) {
	text = repalceInclude(text, options, templateId);
	return text;
};


_.templateSettings = {
	interpolate: /\{\{(.+?)\}\}/g,
	evaluate: /\[\[(.+?)\]\]/g
};

var repalceInclude = function(source, options, tId) {
	// console.log(source);
	var text = '';
	return source.replace(/<%\s*include\s*(.*?)\s*%>/g, function(match, templateId) {
		var templateId = path.resolve(process.cwd(), options.partial, templateId);

		if (tId === templateId) {
			console.log(templateId, '======================死循环include==========================');
			return '';
		}
		text = fs.readFileSync(templateId, 'utf8');
		text = makeTemp(text, templateId, options);

		return text ? text : '';
	});
};


var layout = function(layout, source) {
	return layout.replace(/\{\{\{\s*body\s*\}\}\}/g, source);
};

var repalceLayout = function(source, options) {

	var data = yamlFrontMatter.loadFront(source, 'page');

	if (!data.layout) {
		return data.page;
	}

	var templateId = path.resolve(process.cwd(), options.layout, data.layout);
	var text = '';
	text = fs.readFileSync(templateId, 'utf8');
	text = layout(text, data.page);
	return text ? text : '';
};


function writeFile(fileName) {
	var args = Array.prototype.slice.call(arguments);
	async.series([
		mkdirp.bind(null, path.dirname(fileName)),
		function(callback) {
			return fs.writeFile.apply(fs, args);
		}
	]);
}

function TemplatePlugin(options) {
	this.options = options;
	this.cleanMetaOutput();
}

function fThrow(x) {
	throw x;
}

function getAllFiles(options) {
	return glob.sync(options.pages + '/v/**', {
		nodir: true
	});
}

TemplatePlugin.prototype = {
	cleanMetaOutput: function() {
		this.metaOutput = {
			warnings: [],
			errors: []
		};
	},
	apply: function(compiler) {

		var _this = this;
		var options = _this.options;
		var allFiles = getAllFiles(options);
		compiler.plugin('run', function(compiler, compileCallback) {
			_this.compile(compileCallback, allFiles);
		});



		var watchStarted = false;
		compiler.plugin('watch-run', function(watching, compileCallback) {
			if (watchStarted) {
				compileCallback();
				return;
			}
			watchStarted = true;

			gaze([options.partial + '/**/*', options.layout + '/**/*'], function(err, gaze) {
				err && fThrow(err);
				gaze.on('all', function(event, filepath) {
					if ((event === 'added' || event === 'changed') && filepath.split('.').length === 2) {
						var files = getAllFiles(options);
						_this.compile(compileCallback, files);
					}
				});
			});

			gaze([options.pages + '/v/**'], function(err, gaze) {
				err && fThrow(err);
				gaze.on('all', function(event, filepath) {
					if ((event === 'added' || event === 'changed') && filepath.split('.').length === 2) {
						var files = [filepath];
						_this.compile(compileCallback, files);
					}
				});
			});

			_this.compile(compileCallback, allFiles);

		});

		compiler.plugin('emit', function(compilation, callback) {
			// compilation.errors = compilation.errors.concat(_this.metaOutput.errors);
			// compilation.warnings = compilation.warnings.concat(_this.metaOutput.warnings);
			callback();
		});
	},

	compile: function(compileCallback, files) {
		var _this = this;
		_this.compileTpl(files, compileCallback);
	},

	compileTpl: function(files, compileCallback) {
		var options = this.options;
		files = files || [];
		async.forEach(files, function(file, cb) {
			try {

				file = path.resolve(process.cwd(), file);
				var pageData = yamlFrontMatter.loadFront(file);

				if (!pageData.window) {
					pageData.window = {};
				}
				pageData.window.g_static_host = config.STATIC_URL.DEV + '/';
				pageData.devServer = config.STATIC_URL.DEV;
				var entry = pageData.entry && pageData.entry.replace(/\.js$/, '').replace('/scripts/', '/');

				var source = fs.readFileSync(file, 'utf8');
				source = repalceLayout(source, options);
				source = repalceInclude(source, options);
				var data = {
					'files': {
						'publicPath': config.STATIC_URL.DEV,
						'chunks': {
							'manifest': {
								'entry': config.STATIC_URL.DEV + '/dev/'+ options.project +'/scripts/manifest.js'
							},
							'vendor': {
								'entry': config.STATIC_URL.DEV + '/dev/'+ options.project +'/scripts/vendor' + '.js'
							},
							'scripts/index': {
								///dev/match/scripts/match/match.js
								'entry': config.STATIC_URL.DEV + '/dev/'+ options.project + '/scripts/' + entry + '.js'
							}
						},
						'css': [
							config.STATIC_URL.DEV + '/dev/'+ options.project +'/styles/vendor_' + options.project + '.css',
							config.STATIC_URL.DEV + '/dev/'+ options.project +'/styles/' + entry + '.css'
							]
					},
					'options': pageData
				};

				source = _.template(source)({
					htmlWebpackPlugin: data,
					require: function(str) {
						var r = /^images/;
						var flag = r.test(str);
						var file;
						if(flag){
							 file = config.STATIC_URL.DEV + '/src/' + str;
						}else{
							 file = config.STATIC_URL.DEV + '/src/projects/' + str;
						}
						return file
					}
				});
				var filepath = options.distPath(file);
				writeFile(filepath, source, function(err) {
					err && fThrow(err);
					console.log('生成模板===>' + filepath);
					cb(null);
				});


			} catch (err) {
				err && fThrow(err);
				console.log('生成模板错误====>' + file);
				cb(err);
			}
		}, function(err) {
			compileCallback(err);
		});
	}
};

module.exports = TemplatePlugin;
