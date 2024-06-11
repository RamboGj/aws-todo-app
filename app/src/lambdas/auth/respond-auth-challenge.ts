import { RespondToAuthChallengeCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { COGNITO_CLIENT_ID, cognito } from '../../clients/cognito.config';
import { validate } from '../../validation/validator';
import { respondAuthChallengeBodySchema } from '../../validation/auth/respond-auth-challenge';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, tempPassword } = validate(respondAuthChallengeBodySchema, event.body);

    const authCommand = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: tempPassword,
      },
    });

    const result = await cognito.send(authCommand);

    const command = new RespondToAuthChallengeCommand({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: COGNITO_CLIENT_ID,
      ChallengeResponses: {
        USERNAME: '',
        NEW_PASSWORD: 'password',
      },
      Session: '',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'successfully initiated auth.', session: result.Session }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
