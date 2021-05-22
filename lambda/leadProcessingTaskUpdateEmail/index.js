const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async function (event) {
	let email = JSON.parse(event.body);

	try {
		await setEmail(email);
		await sqsPut(email)
	} catch (e) {
	}

	return {
		statusCode: 200,
		headers: {
			"Access-Control-Allow-Headers" : "Content-Type",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT"
		},
		body: JSON.stringify(email)
	};
};

async function setEmail(email) {
	try {
		await db.put({
			TableName: 'emails',
			Item: email
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function sqsPut(email) {
	try {
		await sqs.sendMessage({
			MessageAttributes: {
				timestamp: {
					DataType: 'Number',
					StringValue: '' + email.timestamp
				},
				date: {
					DataType: "Number",
					StringValue: '' + email.date
				},
			},
			MessageBody: "Get email",
			MessageDeduplicationId: uuid(),
			MessageGroupId: "GET_EMAIL",
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/357063784055/leadProcessingTaskGetEmailSQS.fifo'
		}).promise();
	} catch (e) {
		throw e;
	}
}
