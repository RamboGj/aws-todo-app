import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validate } from '../../validation/validator';
import { deleteTodoSchema } from '../../validation/todo/delete-todo.schema';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import config from '../../config';
import { logger } from '../../utils/logger.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Delete todo event', { event });
    const { id } = validate(deleteTodoSchema, event.pathParameters);

    const client = getDynamoDBClient();

    const key = `Todos#${id}`;

    const command = new DeleteItemCommand({
      TableName: config.dynamo.todosTable,
      Key: {
        PK: { S: key },
        SK: { S: key },
      },
    });

    await client.send(command);

    return {
      statusCode: 204,
      body: JSON.stringify({}),
    };
  } catch (err) {
    logger.error('Error on delete todo', {
      err,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error on delete-todo',
      }),
    };
  }
};
