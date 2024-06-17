import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import config from '../../config';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { validate } from '../../validation/validator';
import { accessTokenSchema } from '../../validation/todo/access-token.schema';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognito } from '../../clients/cognito.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();

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

    const command = new ScanCommand({
      TableName: config.dynamo.todosTable,
      Limit: 10,
      FilterExpression: 'SK = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: SK },
      },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Items) throw new Error('No items found');

    const todos = result.Items?.map((item) => {
      return unmarshall(item);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(todos),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
