const request = require('request');
const util  = require('../util');

module.exports = function (param) {
	const appId = process.env.APP_ID;
	const channel = param.channel;
	const endpoint = param.commandConfig.endpoint.replace('{appId}', appId);
	const args = param.args;
	const messages = {
		api_error: 'Whoops! Something went wrong',
		help: '*fetch* lets you ask questions about Experiences and provides detailed answers. To see a list of commands, try *fetch commands*',
		mismatch: '¯\\_(ツ)_/¯ Try *fetch commands*'
	};

	let info = [];
	let mismatch = false;
	let arg = args.join(' ');

	arg = arg.toLowerCase();

	if (arg === 'help') {
		info.push(messages.help);
		util.postMessage(channel, info);
	}

	else {
		request(endpoint, function (err, response, body) {
			if (!err && response.statusCode === 200) {
				body = JSON.parse(body);

				body.records.forEach(function(item) {
					item.fields.questions = item.fields.question.split(',').map(function(q) {
						return q.trim().toLowerCase();
					});
				});

				body.records.forEach(function(item) {
					if (item.fields.questions.includes(arg)) {
						info.push(item.fields.answer);
					}
					else if (arg === 'commands') {
						item.fields.questions.forEach(function(question) {
							info.push('\n*fetch* ' + question);
						});
					}
					else if (!item.fields.questions.includes(arg)) {
						mismatch = true
					}
				});

				if (mismatch === true) {
					info.push(messages.mismatch);
				}
			}
			else {
				info = [messages.api_error];
			}
			util.postMessage(channel, info);
		});
	}
};
