import * as uri from 'url';
import * as crypto from 'crypto';
import { IOAuth2Profile, OAuth2ProfileCallback, Maybe } from '../types';
import { OAuth2BaseProfileStrategy } from './base';

export interface IOAuth2FacebookOptions {
  clientId: string;
  clientSecret: string;
  graphVersion?: string;
  enableProof?: boolean;
  fields?: string[];
}

/**
 * Extract user's facebook profile given an access token.
 */
export class FacebookProfileStrategy extends OAuth2BaseProfileStrategy {
  private graphVersion: string;
  private fields: string[];
  private enableProof: boolean;

  constructor(options: IOAuth2FacebookOptions, callback: Maybe<OAuth2ProfileCallback> = null) {
    const graphVersion = options.graphVersion || 'v2.6';

    const oauthOptions = {
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      authorizationURL: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
      tokenURL: `https://graph.facebook.com/${graphVersion}/oauth/{accessToken}`,
    };

    super(oauthOptions, callback);

    this.name = 'facebook';
    this.graphVersion = graphVersion;
    this.fields = options.fields || ['id', 'displayName', 'name', 'emails'];
    this.enableProof = typeof options.enableProof === 'boolean' ? options.enableProof : true;
  }

  /**
   * Construct the profile Url.
   */
  public resolveProfileURL(accessToken: string): string {
    const candidateProfileURL = `https://graph.facebook.com/${this.graphVersion}/me`;
    const parsedProfileURL = uri.parse(candidateProfileURL);

    // For further details, refer to https://developers.facebook.com/docs/reference/api/securing-graph-api/
    if (this.enableProof) {
      const proof = crypto.createHmac('sha256', this.options.clientSecret).update(accessToken).digest('hex');
      const params = parsedProfileURL.search ? parsedProfileURL.search + '&' : '';

      parsedProfileURL.search = `${params}appsecret_proof=${encodeURIComponent(proof) }`;
    }

    // Parse profile fields.
    if (this.fields) {
      const fieldsParams = this.convertProfileFields(this.fields);
      parsedProfileURL.search = `${parsedProfileURL.search ? parsedProfileURL.search + '&' : ''}fields=${fieldsParams}`;
    }

    return uri.format(parsedProfileURL);
  }

  /**
   * Normalize the raw response into the profile schema.
   */
  public parse(body: string): IOAuth2Profile {
    const json = JSON.parse(body);

    // Get image URL based on profileImage options
    const imageUrl = `https://graph.facebook.com/${this.graphVersion}/${json.id}/picture?type=large`;

    return {
      provider: this.name,
      id: json.id,
      displayName: json.name || '',
      name: {
        familyName: json.last_name || '',
        givenName: json.first_name || '',
        middleName: json.middle_name || '',
      },
      gender: json.gender || '',
      emails: [{
        value: json.email || '',
      }],
      photos: [{
        value: imageUrl,
      }],
      _raw: body,
      _json: json,
    };
  }

  /**
   * Normalize profile fields to use in an URL request.
   */
  private convertProfileFields(fields: string[]): string {
    const map = {
      id: 'id',
      displayName: 'name',
      name: ['last_name', 'first_name', 'middle_name'],
      gender: 'gender',
      profileUrl: 'link',
      emails: 'email',
      photos: 'picture',
    };

    return fields.reduce((acc, field) => acc.concat(map[field] || field), []).join(',');
  }
}
