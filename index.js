const AWS  = require('aws-sdk');
let config = {};

module.exports = {
  configure(events) {
    config = events;
  },
  emit(eventName, data) {
    const topicEnv = `TOPIC_${eventName.toUpperCase()}_ARN`;

    return new AWS.SNS({ apiVersion: '2010-03-31' })
      .publish({
        Message: JSON.stringify(data),
        TopicArn: process.env[topicEnv],
      }).promise();
  },
  process(event) {
    for (const record of event.Records) {
      if (record.EventSource !== 'aws:sns') {
        continue;
      }
      const eventName = record.Sns.TopicArn.split(':').pop();
      const data = JSON.parse(record.Sns.Message);
      const callback = config[eventName];
      callback(data);
    }
  }
};