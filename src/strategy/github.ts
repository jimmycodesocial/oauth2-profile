import { IOAuth2Profile, OAuth2ProfileCallback, Maybe } from '../types';
import { OAuth2BaseProfileStrategy } from './base';

export interface IOAuth2GithubOptions {
  clientId: string;
  clientSecret: string;
}

/**
 * Extract user's github profile given an access token.
 */
export class GithubProfileStrategy extends OAuth2BaseProfileStrategy {
  constructor(options: IOAuth2GithubOptions, callback: Maybe<OAuth2ProfileCallback> = null) {
    const oauthOptions = {
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      authorizationURL: 'https://github.com/login/oauth/authorize',
      tokenURL: 'https://github.com/login/oauth/access_token',
    };

    super(oauthOptions, callback);

    this.name = 'github';
  }

  /**
   * Construct the profile Url.
   */
  public resolveProfileURL(accessToken: string): string {
    return 'https://api.github.com/user';
  }

  /**
   * Normalize the raw response into the profile schema.
   */
  public parse(body: string): IOAuth2Profile {
    const json = JSON.parse(body);

    return {
      provider: this.name,
      id: json.id,
      username: json.login,
      displayName: json.name || '',
      name: {
        familyName: json.name ? json.name.split(' ', 2)[1] || '' : '',
        givenName: json.name ? json.name.split(' ', 2)[0] || '' : '',
      },
      emails: [{value: json.email || ''}],
      photos: [],
      _raw: body,
      _json: json,
    };
  }
}
