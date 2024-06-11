import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { validate } from '../../validation/validator';
import { ulid } from 'ulid';
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import config from '../../config';
import { logger } from '../../utils/logger.config';
import { putTodoBodySchema, putTodoPathSchema } from '../../validation/todo/put-todo.schema';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = validate(putTodoPathSchema, event.pathParameters);

    const dynamoDBClient = getDynamoDBClient();

    const body = validate(putTodoBodySchema, JSON.parse(String(event.body)));

    const DYNAMO_DB_TABLE_KEY = `Todos#${ulid()}`;

    const getCommand = new GetItemCommand({
      TableName: config.dynamo.todosTable,
      Key: marshall({
        PK: id,
        SK: id,
      }),
    });

    const todo = await dynamoDBClient.send(getCommand);

    if (!todo.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'item not found.',
        }),
      };
    }

    const currentTodo = unmarshall(todo.Item);

    const updatedTodo = {
      ...currentTodo,
      ...body,
    };

    const updateCommand = new PutItemCommand({
      TableName: config.dynamo.todosTable,
      Item: marshall(updatedTodo),
    });

    const result = await dynamoDBClient.send(updateCommand);

    if (!result) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Sending put command to dynamo DB failed.',
        }),
      };
    }

    return {
      statusCode: 203,
      body: JSON.stringify({
        updatedTodo,
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
