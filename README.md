# Lead processing task

### AWS Credentials

```
Email: sapic94+lpt@gmail.com
Password: T}7px4?t5.Dvpdxk
```

### Backend part
All Lambda functions has been stored inside `lambda` folder in project. 
Because of not having enough time to finish everything, I will explain the idea behind.
There are a lot of space for improvement here, optimizing and working on performance side and thinking more about AWS costs.

#### Services used

1. API Gateway (REST API, WebSocket API)
2. DynamoDB
3. Lambda
4. SQS

#### API Gateway (REST API, WebSocket API)

With both REST and WebSocket API's

- REST API (`leadProcessingTask`) - used for uploading excel file with email list
    - `POST /lpt` endpoint - trigger Lambda function `leadProcessingTaskEmail`
- WebSocket API (`leadProcessingTaskWS`) - used for communication with frontend about user status, and
  receiving `Pending` emails
    - `connect` - trigger Lambda function `leadProcessingTaskConnect`
    - `disconnect` - trigger Lambda function `leadProcessingTaskConnect`

#### DynamoDB

With two tables `users` and `emails`.

- `users`
    - connectionId - unique partition key
    - status - `offline`, `away`, `busy` `online`

- `emails`
    - excel file values
    - `status` - `Pending`, `Positive Reply`, `Neutral Reply`, `Not a lead`
    - `assigned` - user connectionId

#### Lambda

There are four Lambda functions, two already mentioned above.

1. `leadProcessingTaskEmail`
    - Load buffer and get data from it (email list)
    - Sort data by timestamp
    - Push emails in dynamoDB `emails` table
    - Push emails in SQS `leadProcessingTaskGetEmailSQS.fifo` queue. For this FIFO is used to so oldest can have
      priority
2. `leadProcessingTaskConnect`
    - Create/update dynamoDB with user and his status, depend if it is `connect` or `disconnect`
3. `leadProcessingTaskGetEmailSQS`
    - Triggered by SQS queue `leadProcessingTaskGetEmailSQS.fifo`
    - Getting always first from list, and checking if there are available users to pick up email (`online`)
    - If there are no users, email is going back to queue
    - If there are users, getting one user and assign email to him
        - User status will be `busy` inside dynamoDB
        - Email will have assigned user inside dynamoDB
        - Delete email from queue
        - Push email to another queue `leadProcessingTaskExpireEmailSQS` with delay of 120seconds

4. `leadProcessingTaskExpireEmailSQS`
    - Triggered by SQS queue `leadProcessingTaskExpireEmailSQS`
    - Processing every email in it
        - If email status is still `Pending`
            - Remove user assigned from `tables`
            - Set user status to `offline`
            - Contact user through websocket if he is still available

### Frontend part
Unfortunately there is nothing interested on frontend side

