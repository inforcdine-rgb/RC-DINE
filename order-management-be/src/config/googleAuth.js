import { OAuth2Client } from 'google-auth-library';
import env from './env.js';

const googleAuthClient = new OAuth2Client(env.google?.clientId);

export default googleAuthClient;
