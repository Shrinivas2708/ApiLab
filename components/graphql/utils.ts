export const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
        description
        fields {
          name
          description
          args {
            name
            type {
              name
              kind
              ofType { name kind }
            }
          }
          type {
            name
            kind
            ofType { name kind }
          }
        }
      }
      queryType { name }
      mutationType { name }
      subscriptionType { name }
    }
  }
`;