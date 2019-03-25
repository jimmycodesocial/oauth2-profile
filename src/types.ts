import { OutgoingHttpHeaders } from 'http';

export type Maybe<T> = T | null;

export interface IOAuth2ProfileName {
  familyName?: string;
  givenName?: string;
  middleName?: string;
}

export interface IOAuth2ProfileValue {
  value: string;
}

export interface IOAuth2Profile {
  provider: string;
  id: string;
  displayName: string;
  name?: IOAuth2ProfileName;
  username?: string;
  gender?: string;
  emails?: IOAuth2ProfileValue[];
  photos?: IOAuth2ProfileValue[];
  _raw?: string;
  _json?: object;
}

export interface IOAuth2Options {
  clientId: string;
  clientSecret: string;
  profileURL?: string;
  authorizationURL?: string;
  tokenURL?: string;
  customHeaders?: OutgoingHttpHeaders;
  useAuthorizationHeaderForGET?: boolean;
}

export type OAuth2ProfileCallback = (
  profile: IOAuth2Profile,
  accessToken: string,
) => Promise<object>;
