import { IOAuth2Profile, OAuth2ProfileCallback, Maybe } from '../types';
import { OAuth2BaseProfileStrategy } from './base';

export interface IOAuth2RedditOptions {
  clientId: string;
  clientSecret: string;
}

/**
 * Extract user's reddit profile given an access token.
 */
export class RedditProfileStrategy extends OAuth2BaseProfileStrategy {
  constructor(options: IOAuth2RedditOptions, callback: Maybe<OAuth2ProfileCallback> = null) {
    const oauthOptions = {
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      authorizationURL: 'https://ssl.reddit.com/api/v1/authorize',
      tokenURL: 'https://ssl.reddit.com/api/v1/access_token',
      useAuthorizationHeaderForGET: true,
    };

    super(oauthOptions, callback);

    this.name = 'reddit';
  }

  /**
   * Construct the profile Url.
   */
  public resolveProfileURL(accessToken: string): string {
    return 'https://oauth.reddit.com/api/v1/me';
  }

  /**
   * Normalize the raw response into the profile schema.
   */
  public parse(body: string): IOAuth2Profile {
    const json = JSON.parse(body);

    return {
      provider: this.name,
      id: json.id,
      displayName: json.name || '',
      name: {
        familyName: json.name ? json.name.split(' ', 2)[1] || '' : '',
        givenName: json.name ? json.name.split(' ', 2)[0] || '' : '',
      },
      emails: [],
      photos: [],
      _raw: body,
      _json: json,
    };
  }
}
