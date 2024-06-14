import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validate } from '../../validation/validator';
import { confirmSignUpBodySchema } from '../../validation/auth/confirm-sign-up.schema';
import { ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { COGNITO_CLIENT_ID, cognito } from '../../clients/cognito.config';
import { logger } from '../../utils/logger.config';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(String(event.body));

    logger.info('DATA', { body });

    const { email, code } = validate(confirmSignUpBodySchema, body);

    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognito.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sign up confirmed' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
