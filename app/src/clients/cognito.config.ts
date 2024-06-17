import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import config from '../config';

export const cognito = new CognitoIdentityProviderClient({ region: config.aws.region });

export const COGNITO_CLIENT_ID = '7dq35adji4mo67tpntn3u80ivl';
