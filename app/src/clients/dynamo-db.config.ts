import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export function getDynamoDBClient(region?: string, endpoint?: string) {
  return new DynamoDBClient({ region, endpoint });
}
