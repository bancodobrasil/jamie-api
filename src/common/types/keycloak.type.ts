export interface KeycloakAccessToken {
  jti: string;
  exp: number;
  nbf: number;
  iat: number;
  iss: string;
  sub: string;
  typ: string;
  azp: string;
  acr: string;
  aud: string | string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  groups?: string[];
}
