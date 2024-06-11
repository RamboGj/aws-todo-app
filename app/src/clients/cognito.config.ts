import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import config from '../config';

export const cognito = new CognitoIdentityProviderClient({ region: config.aws.region });

export const COGNITO_CLIENT_ID = '5a972b7265e866gjojukh8i13c';
