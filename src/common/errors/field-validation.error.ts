import { ValidationError } from 'class-validator';
import { GraphQLError } from 'graphql';

class FieldValidationError extends GraphQLError {
  constructor(fields: Record<string, any>) {
    super('Field Validation Error', {
      extensions: { code: 'BAD_USER_INPUT', fields },
    });
    this.name = 'FieldValidationError';
  }

  static fromValidationErrors(errors: ValidationError[]): FieldValidationError {
    const composeErrors = (errors, hasParent = false, parentPath = '') =>
      errors.reduce((acc, error) => {
        const { property, constraints, children } = error;
        if (!hasParent) {
          if (children?.length) {
            return { ...acc, ...composeErrors(children, true, property) };
          }
          return {
            ...acc,
            [property]: {
              errors: Object.values(constraints),
              constraints: Object.keys(constraints),
            },
          };
        } else {
          if (constraints) {
            return {
              ...acc,
              [parentPath]: {
                ...acc[parentPath],
                [property]: {
                  errors: Object.values(constraints),
                  constraints: Object.keys(constraints),
                },
              },
            };
          }
          if (children?.length) {
            return {
              ...acc,
              [parentPath]: {
                ...acc[parentPath],
                ...composeErrors(children, true, property),
              },
            };
          }
        }
        return { ...acc, [property]: Object.values(constraints) };
      }, {});

    return new FieldValidationError(composeErrors(errors));
  }
}

export default FieldValidationError;
