import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validate } from '../../validation/validator';
import { deleteTodoSchema } from '../../validation/todo/delete-todo.schema';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import config from '../../config';
import { logger } from '../../utils/logger.config';
import { accessTokenSchema } from '../../validation/todo/access-token.schema';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognito } from '../../clients/cognito.config';
import { marshall } from '@aws-sdk/util-dynamodb';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Delete todo event', { event });

    const client = getDynamoDBClient();

    const { id } = validate(deleteTodoSchema, event.pathParameters);
    const { accesstoken } = validate(accessTokenSchema, event.headers);

    const cognitoCommand = new GetUserCommand({
      AccessToken: accesstoken,
    });

    const user = await cognito.send(cognitoCommand);

    if (!user.UserAttributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'User not found.',
        }),
      };
    }

    const userId = user.UserAttributes.find((attribute) => {
      return attribute.Name === 'sub';
    });

    const SK = `User#${userId?.Value}`;

    const command = new DeleteItemCommand({
      TableName: config.dynamo.todosTable,
      Key: marshall({
        PK: id,
        SK,
      }),
    });

    await client.send(command);

    return {
      statusCode: 204,
      body: JSON.stringify({ message: 'Item deleted.' }),
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
