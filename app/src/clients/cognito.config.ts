import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import config from '../config';

export const cognito = new CognitoIdentityProviderClient({ region: config.aws.region });

export const COGNITO_CLIENT_ID = 'vm1v8fen2ct1joke0rdh4h9k2';
