import 'jest-cdk-snapshot';
import { App, Stack, aws_cognito } from 'aws-cdk-lib';

import { SpaAuthorization, StaticSiteAuthorization } from '../authorizations';
import { SpaDistribution, StaticSiteDistribution } from '../distributions';

test('default spa setup', (): void => {
  const app = new App();

  const stack = new Stack(app, 'Dummy', {
    env: {
      region: 'xxx',
    },
  });

  const userPool = new aws_cognito.UserPool(stack, 'UserPool', {
    selfSignUpEnabled: false,
    userPoolName: 'cloudfront-authorization-userpool',
  });

  // UserPool must have a domain!
  userPool.addDomain('Domain', {
    cognitoDomain: {
      domainPrefix: 'cloudcomponents',
    },
  });

  const authorization = new SpaAuthorization(stack, 'SpaAuthorization', {
    userPool,
  });

  new SpaDistribution(stack, 'SpaDistribution', {
    authorization,
  });

  expect(stack).toMatchCdkSnapshot({
    ignoreAssets: true,
    propertyMatchers: {
      Resources: {
        SpaAuthorizationAuthFlowcheckauthProviderAD2E39F4: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        SpaAuthorizationAuthFlowparseauthProviderFAD7CF01: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        SpaAuthorizationAuthFlowrefreshauthProvider2F233848: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        SpaAuthorizationAuthFlowsignoutProvider0444513A: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
      },
    },
  });
});

test('default static-site setup', (): void => {
  const app = new App();

  const stack = new Stack(app, 'Dummy', {
    env: {
      region: 'xxx',
    },
  });

  const userPool = new aws_cognito.UserPool(stack, 'UserPool', {
    selfSignUpEnabled: false,
    userPoolName: 'cloudfront-authorization-userpool',
  });

  // UserPool must have a domain!
  userPool.addDomain('Domain', {
    cognitoDomain: {
      domainPrefix: 'cloudcomponents',
    },
  });

  const authorization = new StaticSiteAuthorization(stack, 'StaticSiteAuthorization', {
    userPool,
  });

  new StaticSiteDistribution(stack, 'StaticSiteDistribution', {
    authorization,
  });

  expect(stack).toMatchCdkSnapshot({
    ignoreAssets: true,
    propertyMatchers: {
      Resources: {
        StaticSiteAuthorizationAuthFlowcheckauthProviderA6235A8D: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        StaticSiteAuthorizationAuthFlowparseauthProvider72D5CD13: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        StaticSiteAuthorizationAuthFlowrefreshauthProvider4DB598E9: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
        StaticSiteAuthorizationAuthFlowsignoutProvider710213B2: {
          Properties: {
            Create: expect.any(String),
            Update: expect.any(String),
          },
        },
      },
    },
  });
});
