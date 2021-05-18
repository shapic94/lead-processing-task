const uuid = require('uuid');
const parser = require('lambda-multipart-parser');
const xlsx = require('node-xlsx')
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const docClient = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async function (event) {
	const result = await parser.parse(event)
	const sheet = await xlsx.parse(result.files[0].content);
	let rows = sheet[0].data;
	let headers = rows.shift();
	let i, d, data = [];
	for (let row of rows) {
		if (row.length) {
			i = 0;
			d = {};
			for (let value of row) {
				d[headers[i]] = value

				i++;
			}
			data.push(d);
		}
	}

	data = data.sort((x, y) => x.Timestamp - y.Timestamp);

	for (let d of data) {
		try {
			let currentTimestamp = new Date().getTime();
			let emailTimestamp = new Date(d.Date).getTime();
			await setEmail({...d, Timestamp: currentTimestamp, Date: emailTimestamp});
			await sqsPut({...d, Timestamp: currentTimestamp, Date: emailTimestamp});
		} catch (e) {
			// No error handling for test project and try next one
		}
	}

	return {
		statusCode: 200,
	};
};

async function setEmail(row) {
	try {
		await docClient.put({
			TableName: 'emails',
			Item: row,
		}).promise();
	} catch (e) {
		throw e;
	}
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
