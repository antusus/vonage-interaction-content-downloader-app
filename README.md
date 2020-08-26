# Interaction Content Downloader application spike

### [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) was used to build this application.
It also uses:
 - [Electron](https://electron.atom.io/)
 - [React](https://facebook.github.io/react/)
 - [Redux](https://github.com/reactjs/redux)
 - [React Router](href="https://github.com/reactjs/react-router)
 - [Webpack](href="https://webpack.github.io/docs/)
 - [React Hot Loader for rapid application development (HMR)](href="https://github.com/gaearon/react-hot-loader)
 
For e2e tests it uses [TestCafé](https://devexpress.github.io/testcafe/)

Using [electron-log](https://www.npmjs.com/package/electron-log), logs can be found at:
- on Linux: `~/.config/Interaction\ Content\ Downloader/logs`
- on macOS: `~/Library/Logs/Interaction\ Content\ Downloader`
- on Windows: `%USERPROFILE%\AppData\Roaming\Interaction Content Downloader\logs\`

## Installing
In project directory execute:

`yarn`

## Starting development
Application uses `React Hot Loader` so your changes will be immediately visible in 
the running application. It will also start Dev Console. To run application execute:

`yarn dev`

## Testing
To run unit tests run:

`yarn test`

To run e2e tests execute:

`yarn e2e`

If you change application code I found it that rebuilding the application was necessary:

`yarn build-e2e`

## Packaging

To package for Windows execute:

`yarn package-win`

For now the build for 32b version of Windows is disabled. To run it you will need 32b system.

To package for OSX execute:

`yarn package-mac`

## TestCafé
For now e2e tests are running on the application itself. There is a way to run them in a headless mode,
dedicated display server or cloud testing services. Application is using [Axios](https://github.com/axios/axios) 
http client. I had some troubles with mocking it using TestCafé tools.
 
In test `DownloadPage.e2e` I'm using `RequestLogger` and `RequestMock`. 

#### RequestLogger
Allows intercepting specified HTTP requests and analyze them. 
You specify capture rules by using URL (or regexp), method and even use your custom function and check even headers.
I was able to use logger for intercepting Axios calls.

#### RequestMock
Allows mocking response of some HTTP service. However I was not able to make it work 
with Axios. Electron has dedicated API to execute HTTP request but is not as plesant 
to use as Axios.

 

