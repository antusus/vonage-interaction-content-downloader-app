/* eslint jest/expect-expect: off, jest/no-test-callback: off */
import {ClientFunction, RequestLogger, RequestMock, Selector} from 'testcafe';

const getPageTitle = ClientFunction(() => document.title);
const assertNoConsoleErrors = async (t) => {
  const {error} = await t.getBrowserConsoleMessages();
  await t.expect(error).eql([]);
};

const oidcMock = RequestMock()
  .onRequestTo((req: RequestOptions) => {
    const check = req.method.toLowerCase() === 'post' && req.url.endsWith('newvoicemedia.com/Auth/connect/token');
    if (check) {
      console.log(`Mock ${req.method} ${req.url}`);
    }
    return check;
  })
  .respond(
    {
      access_token: 'someToken',
      expires_in: 7200,
      token_type: 'Bearer',
    },
    200
  );
const logger = RequestLogger(/\/Auth\/connect\/token/, {
  logResponseHeaders: true,
  logResponseBody: true,
  stringifyResponseBody: true,
});

fixture`Download Page`
  .page('../../app/app.html')
  .afterEach(assertNoConsoleErrors)
  .requestHooks([oidcMock, logger]);

test('should open window and contain expected page title', async (t) => {
  await t.expect(getPageTitle()).eql('Content Downloader');
});

test(
  'should not have any error logs in console of main window',
  assertNoConsoleErrors
);

test('should contain inputs and a button', async (t) => {
  await t.expect(Selector('input#clientId').exists).ok();
  await t.expect(Selector('label[for="clientId"]').exists).ok();
  await t.expect(Selector('input#clientSecret').exists).ok();
  await t.expect(Selector('label[for="clientSecret"]').exists).ok();
  await t.expect(Selector('button#download ').exists).ok();
});

test('should fetch OIDC token on Download', async (t) => {
  await t.click('button#download ');

  await t.expect(logger.requests.length).eql(1);
});
