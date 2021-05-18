const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async function (event) {
	if (event.Records.length) {
		let item = event.Records[0];

		try {
			let email = await getEmail(item.messageAttributes.Timestamp.stringValue, item.messageAttributes.Date.stringValue);
			let user = await getUser();

			if (email && user) {
				await setEmail(email, user);
				await setUser(user);
				await sqsDelete(item);
				await sqsPut(email, user);
			} else {
				throw new Error("Return message to queue");
			}
		} catch (e) {
			throw new Error("Return message to queue");
		}
	}

	return {
		statusCode: 200,
	};
};

async function setEmail(email, user) {
	try {
		await docClient.put({
			TableName: 'emails',
			Item: {...email, assigned: user.connectionId}
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
			Item: {...user, status: 'busy'},
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function getUser() {
	let users;
	try {
		users = await docClient.scan({
			TableName: 'users',
			FilterExpression: "#status = :status",
			ExpressionAttributeValues: {
				":status": "online"
			},
			ExpressionAttributeNames: {
				"#status": "status"
			},
		}).promise();
	} catch (e) {
	}

	return users && users.Items.length ? users.Items[0] : null;
}

async function sqsPut(email, user) {
	try {
		await sqs.sendMessage({
			DelaySeconds: 120,
			MessageAttributes: {
				Timestamp: {
					DataType: 'Number',
					StringValue: '' + email.Timestamp
				},
				Date: {
					DataType: "Number",
					StringValue: '' + email.Date
				},
				User: {
					DataType: "String",
					StringValue: user.connectionId
				}
			},
			MessageBody: "Expire email",
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/357063784055/leadProcessingTaskExpireEmailSQS'
		}).promise();
	} catch (e) {
		throw e;
	}
}

async function sqsDelete(item) {
	try {
		await sqs.deleteMessage({
			QueueUrl: 'https://sqs.us-east-2.amazonaws.com/357063784055/leadProcessingTaskGetEmailSQS.fifo',
			ReceiptHandle: item.receiptHandle
		}).promise();
	} catch (e) {
		throw e;
	}
}
