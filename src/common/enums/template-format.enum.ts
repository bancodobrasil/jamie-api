import { registerEnumType } from '@nestjs/graphql';

export enum TemplateFormat {
  JSON = 'json',
  XML = 'xml',
  PLAIN = 'plain',
}

registerEnumType(TemplateFormat, { name: 'TemplateFormat' });
