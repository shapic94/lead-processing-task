const uuid = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async function (event) {
	if (event.Records.length) {
		let item = event.Records[0];

		try {
			let email = await getEmail(item.messageAttributes.Timestamp.stringValue, item.messageAttributes.Date.stringValue);
			let user = await getUser(item.messageAttributes.User.stringValue);

			if (email && email.Status === 'Pending') {
				await setEmail(email);
				await sqsPut(email);
			}

			if (user) {
				await setUser(user);
			}

			await sqsDelete(item);
		} catch (e) {

		}
	}

	return {
		statusCode: 200,
	};
};

async function setEmail(email) {
	try {
		await docClient.put({
			TableName: 'emails',
			Item: {...email, assigned: ''}
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function getEmail(Timestamp, Date) {
	let emails;
	try {
		emails = await docClient.query({
			TableName: 'emails',
			KeyConditionExpression: "#timestamp = :timestamp and #date = :date",
			ExpressionAttributeValues: {
				":timestamp": parseInt(Timestamp),
				":date": parseInt(Date),
			},
			ExpressionAttributeNames: {
				"#timestamp": "Timestamp",
				"#date": "Date"
			},
		}).promise();
	} catch (e) {
	}

	return emails && emails.Items.length ? emails.Items[0] : null;
}

async function setUser(user) {
	try {
		await docClient.put({
			TableName: 'users',
			Item: {...user, status: 'offline'},
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function getUser(connectionId) {
	let users;
	try {
		users = await docClient.query({
			TableName: 'users',
			KeyConditionExpression: "#connectionId = :connectionId",
			ExpressionAttributeValues: {
				":connectionId": connectionId,
			},
			ExpressionAttributeNames: {
				"#connectionId": "connectionId"
			},
		}).promise();
	} catch (e) {
	}

	return users && users.Items.length ? users.Items[0] : null;
}

async function sqsPut(row) {
	try {
		await sqs.sendMessage({
			MessageAttributes: {
				Timestamp: {
					DataType: 'Number',
					StringValue: '' + row.Timestamp
				},
				Date: {
					DataType: "Number",
					StringValue: '' + row.Date
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
