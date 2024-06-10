import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../clients/dynamo-db.config';
import { validate } from '../validation/validator';
import { postTodoSchema } from '../validation/post-todo.schema';
import { ulid } from 'ulid';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import config from '../config';
import { logger } from '../utils/logger.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();

    const body = JSON.parse(String(event.body));

    console.log('bodyu', body);

    const parsedBody = validate(postTodoSchema, body);

    const DYNAMO_DB_TABLE_KEY = `Todos#${ulid()}`;

    const todo = {
      PK: DYNAMO_DB_TABLE_KEY,
      SK: DYNAMO_DB_TABLE_KEY,
      ...parsedBody,
    };

    const command = new PutItemCommand({
      TableName: config.dynamo.todosTable,
      Item: marshall(todo),
    });

    const result = await dynamoDBClient.send(command);

    if (!result) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Sending put command to dynamo DB failed.',
        }),
      };
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        todo,
      }),
    };
  } catch (err) {
    logger.error('Error on create todos', {
      err,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error on post-todos',
      }),
    };
  }
};
