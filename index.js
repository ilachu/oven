var fs = require('fs');
var forEach = require('async-foreach').forEach;

String.prototype.supplant = function (o) {
   	return this.replace(/#([^{}]*)#/g,
       	function (a, b) {
           	var r = o[b];
           	return typeof r === 'string' || typeof r === 'number' ? r : a;
       	}
   	);
};

function recursiveSupplant(layout,html,vars,callback){
	layout = layout.supplant(html);
	layout = layout.supplant(vars);
	if (layout.match(/#([^{}]*)#/)) {
		recursiveSupplant(layout,html,vars,callback);
	}
	else{
		callback(null,layout);
	}
}
function readHtml(layout,html,vars,callback){
	var htmlFilePaths = Object.keys(html);
	forEach(htmlFilePaths,function(item,index,array){
		fs.readFile(html[item],function(err,data){
			if(err){
				callback(err);
			}
			else{
				html[item] = data.toString();
				if (index == htmlFilePaths.length-1) {
					recursiveSupplant(layout,html,vars,callback);
				};
			}
		});
	});
};
function render(html,vars){
	fs.readFile(html.layout,function (err,data){
		if (err) {
			next(err);
		}
		else{
			delete html.layout;
			if (Object.keys(html).length == 0) {
				response.send(data.toString().supplant(vars));
			}
			else{
				readHtml(data.toString(),html,vars,function(err,view){
					if (err) {
						next(err);
					}
					else{
						response.send(view);
					}
				});
			}
		}
	});
};

module.exports = function (req,res,next){
	response = res;
	res.render = render;
	next();
}