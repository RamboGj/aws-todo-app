import { RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { COGNITO_CLIENT_ID, cognito } from '../../clients/cognito.config';
import { validate } from '../../validation/validator';
import {
  respondToAuthChallengeBodySchema,
  respondToAuthChallengeHeadersSchema,
} from '../../validation/auth/respond-auth-challenge.schema';

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { email, newPassword } = validate(respondToAuthChallengeBodySchema, event.body);
    const { session } = validate(respondToAuthChallengeHeadersSchema, event.headers);

    const command = new RespondToAuthChallengeCommand({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: COGNITO_CLIENT_ID,
      ChallengeResponses: {
        USERNAME: email,
        NEW_PASSWORD: newPassword,
      },
      Session: session,
    });

    const result = await cognito.send(command);

    if (!result.AuthenticationResult) throw new Error('Error on respond challenge.');

    return {
      statusCode: 200,
      headers: {
        'access-token': String(result.AuthenticationResult?.AccessToken),
        'refresh-token': String(result.AuthenticationResult?.RefreshToken),
        'id-token': String(result.AuthenticationResult?.IdToken),
      },
      body: JSON.stringify({
        message: 'challenge successfully responded.',
        accessToken: result.AuthenticationResult?.AccessToken,
        refreshToken: result.AuthenticationResult?.RefreshToken,
        idToken: result.AuthenticationResult?.IdToken,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: (error as Error).message }),
    };
  }
};
