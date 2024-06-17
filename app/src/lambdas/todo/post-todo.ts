import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { validate } from '../../validation/validator';
import { postTodoBodySchema } from '../../validation/todo/post-todo.schema';
import { ulid } from 'ulid';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import config from '../../config';
import { logger } from '../../utils/logger.config';

import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognito } from '../../clients/cognito.config';
import { accessTokenSchema } from '../../validation/todo/access-token.schema';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();

    const body = validate(postTodoBodySchema, JSON.parse(String(event.body)));
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

    const DYNAMO_DB_PK = `Todos#${ulid()}`;
    const DYNAMO_DB_SK = `User#${userId?.Value}`;

    const todo = {
      PK: DYNAMO_DB_PK,
      SK: DYNAMO_DB_SK,
      ...body,
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
  } catch (error) {
    logger.error('Error on create todos', {
      error,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
