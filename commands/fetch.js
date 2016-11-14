const request = require('request');
const util  = require('../util');
const _ = require('underscore');

module.exports = function (param) {
	const appId = process.env.APP_ID;
	const channel = param.channel;
	const endpoint = param.commandConfig.endpoint.replace('{appId}', appId);
	const args = param.args;
	const messages = param.commandConfig.messages;

	let info = [];
	let arg = args.join(' ');

	arg = arg.toLowerCase();

	if (arg === 'help') {
		info.push(messages.help);
		util.postMessage(channel, info);
	}

	else {
		request(endpoint, function (err, response, body) {
			if (!err && response.statusCode === 200) {
				let questions = [];
				body = JSON.parse(body);

				body.records.forEach(function(item) {
					item.fields.questions = item.fields.question.split(',').map(function(q) {
						return q.trim().toLowerCase();
					});

					questions.push(item.fields.questions);

					if (item.fields.questions.includes(arg)) {
						info.push(item.fields.answer);
					}
					else if (arg === 'commands') {
						item.fields.questions.forEach(function(question) {
							info.push('\n*fetch* ' + question);
						});
					}
				});

				questions = _.flatten(questions);

				if (!questions.includes(arg) && arg != 'commands') {
					info.push(messages.mismatch);
				}
			}
			else {
				info = [messages.error];
			}
			util.postMessage(channel, info);
		});
	}
};
