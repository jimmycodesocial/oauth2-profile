import { OAuth2 } from 'oauth';
import { IOAuth2Profile, IOAuth2Options, OAuth2ProfileCallback, Maybe } from '../types';
import { InternalOAuthError } from '../errors';

/**
 * Base implementation for new strategies.
 */
export abstract class OAuth2BaseProfileStrategy {
  public name: string = '';
  protected profileURL: string = '';
  protected oauth: OAuth2;

  constructor(protected options: IOAuth2Options, private callback: Maybe<OAuth2ProfileCallback> = null) {
    this.oauth = new OAuth2(
      options.clientId,
      options.clientSecret,
      '',
      options.authorizationURL,
      options.tokenURL,
      options.customHeaders,
    );

    if (options.useAuthorizationHeaderForGET) {
      this.oauth.useAuthorizationHeaderforGET(options.useAuthorizationHeaderForGET);
    }
  }

  /**
   * Extract the user's profile and execute a callback passing the profile extracted.
   * This method will return the same value returned by the callback.
   * If no callback were specified, this method returns the profile extracted.
   * @param accessToken Access token.
   *
   * @example The following example demonstrates how to register an user after extract his profile.
   * ```typescript
   * const options = { clientId: '', clientSecret: '' };
   * const oauth = new OAuth2CustomProfileStrategy(options, async (profile: IOAuth2Profile, accessToken: string) => {
   *   if (profile) {
   *     const user = await models.UserModel.createAccountFromProfile(profile);
   *     // Side-effect tasks.
   *     await processUserTask(user);
   *     return user;
   *   }
   *   return profile;
   * });
   * ```
   */
  public async process(accessToken: string): Promise<IOAuth2Profile | object> {
    const profile: IOAuth2Profile = await this.userProfile(accessToken);

    if (this.callback) {
      return this.callback(profile, accessToken);
    }

    return profile;
  }

  /**
   * Extract the user's profile.
   * @param accessToken Access token.
   */
  public async userProfile(accessToken: string): Promise<IOAuth2Profile> {
    return new Promise((resolve: any, reject: any) => {
      const profileURL = this.resolveProfileURL(accessToken);

      this.oauth.get(profileURL, accessToken, (error: any, result: any): void => {
        if (error) {
          return reject(new InternalOAuthError('Failed to fetch user profile', error));
        }

        const profile = this.parse(result);

        if (!profile) {
          return reject(new InternalOAuthError('Failed to parse user profile', null));
        }

        return resolve(profile);
      });
    });
  }

  /**
   * Calculate the URL from where extract the user's profile.
   * @param accessToken Access token.
   */
  public abstract resolveProfileURL(accessToken: string): string;

  /**
   * This method is called passing the profile extracted to normalize the response.
   * @param body Raw response from user's profile.
   */
  public abstract parse(body: string): IOAuth2Profile;
}
