import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { validate } from '../../validation/validator';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import config from '../../config';
import { getTodoSchema } from '../../validation/todo/get-todo.schema';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();
    const { id } = validate(getTodoSchema, event.pathParameters);
    const key = `Todos#${id}`;

    const command = new GetItemCommand({
      TableName: config.dynamo.todosTable,
      Key: {
        PK: { S: key },
        SK: { S: key },
      },
    });

    const result = await dynamoDBClient.send(command);
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'item not found.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(unmarshall(result.Item)),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
