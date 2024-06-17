import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { validate } from '../../validation/validator';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import config from '../../config';
import { getTodoSchema } from '../../validation/todo/get-todo.schema';
import { accessTokenSchema } from '../../validation/todo/access-token.schema';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognito } from '../../clients/cognito.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();

    const { id } = validate(getTodoSchema, event.pathParameters);
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

    const command = new GetItemCommand({
      TableName: config.dynamo.todosTable,
      Key: marshall({
        PK: id,
        SK,
      }),
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
