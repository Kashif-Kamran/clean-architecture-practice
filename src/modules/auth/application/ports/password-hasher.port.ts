// =============================================================================
// LAYER: Application (port / interface)
// MAY IMPORT: nothing — pure interface
// MUST NOT IMPORT: bcrypt or any crypto library
//
// WHY THIS PORT EXISTS:
//   bcrypt is slow by design (it's a key-derivation function).
//   If use cases imported bcrypt directly, unit-testing them would be painfully
//   slow. With this port, tests inject a fast fake (e.g., SHA256 or identity).
//   The production adapter (BcryptPasswordHasher) lives in infrastructure.
// =============================================================================

export interface PasswordHasherPort {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
