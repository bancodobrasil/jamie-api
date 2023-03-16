import { ConfigService } from '@nestjs/config';
import { KeycloakConnectOptions } from 'nest-keycloak-connect';

export const keycloakConfig = (
  configService: ConfigService,
): KeycloakConnectOptions => ({
  authServerUrl:
    configService.get('KEYCLOAK_AUTH_SERVER_URL') ||
    'https://keycloak.jamie.g6tech.com.br',
  realm: configService.get('KEYCLOAK_REALM') || 'jamie',
  clientId: configService.get('KEYCLOAK_CLIENT_ID') || 'jamie-api',
  secret: configService.get('KEYCLOAK_SECRET'),
  // policyEnforcement: PolicyEnforcementMode.PERMISSIVE, // optional
  // tokenValidation: TokenValidation.ONLINE, // optional
});
