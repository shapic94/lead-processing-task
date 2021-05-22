const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
	apiVersion: '2018-11-29',
	endpoint: '8wyzugxnaf.execute-api.us-east-2.amazonaws.com/production'
});

exports.handler = async function (event) {
	if (event.Records.length) {
		let item = event.Records[0];

		try {
			await wsSend(item.messageAttributes.user.stringValue, 'away');

			await sqsDelete(item);
		} catch (e) {
		}
	}

	return {
		statusCode: 200,
	};
};

async function sqsDelete(item) {
	try {
		await sqs.deleteMessage({
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/357063784055/leadProcessingTaskExpireEmailSQS',
			ReceiptHandle: item.receiptHandle
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function wsSend(connectionId, status) {
	try {
		await apiGatewayManagementApi.postToConnection({
			ConnectionId: connectionId,
			Data: JSON.stringify({status: status}),
		}).promise();
	} catch (e) {
		throw e;
	}
}