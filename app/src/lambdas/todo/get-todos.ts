import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDynamoDBClient } from '../../clients/dynamo-db.config';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import config from '../../config';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const dynamoDBClient = getDynamoDBClient();

    const command = new ScanCommand({
      TableName: config.dynamo.todosTable,
      Limit: 10,
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
