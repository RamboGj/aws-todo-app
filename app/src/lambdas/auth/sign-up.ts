import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

import { signUpBodySchema } from '../../validation/auth/sign-up.schema';
import { validate } from '../../validation/validator';

import { COGNITO_CLIENT_ID, cognito } from '../../clients/cognito.config';
import { logger } from '../../utils/logger.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(String(event.body));

    const { email, password } = validate(signUpBodySchema, body);

    const command = new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
    });

    const result = await cognito.send(command);

    logger.info('result cognito', { result });

    return {
      statusCode: 201,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
