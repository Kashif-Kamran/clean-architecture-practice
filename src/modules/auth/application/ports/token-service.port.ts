// =============================================================================
// LAYER: Application (port / interface)
// MAY IMPORT: nothing — pure interface + shared types
// MUST NOT IMPORT: @nestjs/jwt or any JWT library
//
// TokenPayload is defined here (application layer) because it describes the
// data the application cares about — who the token represents.
// Infrastructure decides HOW to encode/sign that data.
// =============================================================================

/** Shape of the data encoded inside every JWT. */
export interface TokenPayload {
  /** Subject — the user's UUID */
  sub: string;
  email: string;
}

export interface TokenServicePort {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
