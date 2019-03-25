import { OAuth2BaseProfileStrategy } from './strategy/base';
import { IOAuth2Profile } from './types';

export type StrategyResponse = Promise<IOAuth2Profile | object | null>;

/**
 * Coordinate how to extract the user's profile from an existing provider.
 */
export class OAuth2Profile {
  private strategies: Map<string, OAuth2BaseProfileStrategy> = new Map();

  /**
   * Register a provider implementation.
   * @param strategy Strategy to extract the user's profile from a provider.
   */
  public use(strategy: OAuth2BaseProfileStrategy): OAuth2Profile {
    this.strategies.set(strategy.name, strategy);

    return this;
  }

  /**
   * Extract the user's profile from the provider indicated given an access token.
   * @param provider Provilder.
   * @param accessToken Access token.
   */
  public async process(provider: string, accessToken: string): StrategyResponse {
    if (this.strategies.has(provider)) {
      return (this.strategies.get(provider) as OAuth2BaseProfileStrategy).process(accessToken);
    }

    return null;
  }
}
