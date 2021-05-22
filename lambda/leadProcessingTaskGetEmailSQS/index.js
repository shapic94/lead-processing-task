const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const db = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
	apiVersion: '2018-11-29',
	endpoint: '8wyzugxnaf.execute-api.us-east-2.amazonaws.com/production'
});

exports.handler = async function (event) {
	if (event.Records.length) {
		let item = event.Records[0];
		let isEmailAssigned = false;

		try {
			let email = await getEmail(item.messageAttributes.timestamp.stringValue, item.messageAttributes.date.stringValue);
			let user = await getUser();

			if (email && user) {
				isEmailAssigned = true;

				email.assigned = user.connectionId;
				await setEmail(email);
				await setUser(user);
				await sqsDelete(item);
				await sqsPut(email, user);
				await wsSend(email, user);
			}
		} catch (e) {
			console.log(e);
		}

		if (!isEmailAssigned || event.Records.length - 1 !== 0) {
			throw new Error("Return message to queue");
		}
	}

	return {statusCode: 200};
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

async function getEmail(timestamp, date) {
	let emails;
	try {
		emails = await db.query({
			TableName: 'emails',
			KeyConditionExpression: "#timestamp = :timestamp and #date = :date",
			ExpressionAttributeValues: {
				":timestamp": parseInt(timestamp),
				":date": parseInt(date),
			},
			ExpressionAttributeNames: {
				"#timestamp": "timestamp",
				"#date": "date"
			},
		}).promise();
	} catch (e) {
	}

	return emails && emails.Items.length ? emails.Items[0] : null;
}

async function setUser(user) {
	try {
		await db.put({
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
		users = await db.scan({
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
				timestamp: {
					DataType: 'Number',
					StringValue: '' + email.timestamp
				},
				date: {
					DataType: "Number",
					StringValue: '' + email.date
				},
				user: {
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

async function wsSend(email, user) {
	try {
		await apiGatewayManagementApi.postToConnection({
			ConnectionId: user.connectionId,
			Data: JSON.stringify({email: email}),
		}).promise();
	} catch (e) {
		throw e;
	}
}