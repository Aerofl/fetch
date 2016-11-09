var request = require('request'),
    _ = require('underscore'),
    util  = require('../util');

module.exports = function (param) {
  var appId = process.env.APP_ID,
      channel = param.channel,
      endpoint = param.commandConfig.endpoint.replace('{appId}', appId);
      args = param.args;

  request(endpoint, function (err, response, body) {
    var info;

    if (!err && response.statusCode === 200) {
      body = JSON.parse(body);

      body.records.forEach(function(item) {
        item.fields.questions = item.fields.question.split(',');
        item.fields.questions = item.fields.questions.map(function(q) {
          return q.trim();
        });
      });

      body.records.forEach(function(item) {
        var match;
        item.fields.questions.forEach(function(q) {
          //args = args.join(' ');
          console.log('args');
          console.log(args);
          console.log('q'); //if (q == args) match = q;
          console.log(q); //if (q == args) match = q;

          if (q == args) return q;
        });
      });

    }
    else {
      info = 'Nothin\' to see here!';
    }

    util.postMessage(channel, info);
  });
};
