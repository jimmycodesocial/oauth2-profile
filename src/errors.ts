import { Maybe } from './types';

/**
 * Runtime error while requesting the profile.
 */
export class InternalOAuthError extends Error {
  /**
   * Constructor.
   * @param message Readable error message.
   * @param oauthError Real error object.
   */
  public constructor(public message: string, public oauthError: Maybe<Error>) {
    super(message);
    // Error.captureStackTrace(this);
  }
}
