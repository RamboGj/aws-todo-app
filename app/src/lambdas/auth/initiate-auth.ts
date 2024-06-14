import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { COGNITO_CLIENT_ID, cognito } from '../../clients/cognito.config';
import { validate } from '../../validation/validator';
import { initiateAuthSchema } from '../../validation/auth/initiate-auth.schema';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, tempPassword } = validate(initiateAuthSchema, JSON.parse(String(event.body)));

    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: tempPassword,
      },
    });

    const result = await cognito.send(authCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'successfully signed in' }),
      headers: {
        'access-token': String(result?.AuthenticationResult?.AccessToken),
        'id-token': String(result?.AuthenticationResult?.IdToken),
        'token-expires-in': String(result?.AuthenticationResult?.ExpiresIn),
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
