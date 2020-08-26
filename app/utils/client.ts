import { AxiosInstance } from 'axios';

const axios = require('axios');
const qs = require('qs');
const fs = require('fs').promises;
const log = require('electron-log');

class IcsClient {
  private clientId: string;

  private clientSecret: string;

  private downloadFolder: string;

  private icsClient: AxiosInstance;

  private oidcClient: AxiosInstance;

  /**
   * @param clientId API client ID
   * @param clientSecret API secret
   * @param region one of: 'emea', 'apac', 'nam'
   * @param downloadFolder folder where files will be downloaded to
   */
  constructor(
    clientId: string,
    clientSecret: string,
    region: string,
    downloadFolder: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.downloadFolder = downloadFolder;
    this.icsClient = axios.create({
      baseURL: `https://${region}.api.newvoicemedia.com/interaction-content`,
    });
    this.oidcClient = axios.create({
      baseURL: `https://${region}.newvoicemedia.com/Auth`,
    });
  }

  /**
   * Search for interactions
   * @param start ISO8601 date to search interactions from
   * @param end ISO8601 date to search interactions to
   * @param page Page number starting from 1
   * @param pageSize How many items will one page contain. Maximum allowed value by API is 1000
   * @returns {PromiseLike<T | void>} Response contains an JSON object:
   * {
   *  "items" :[],
   *  "meta": {
   *    "page": 1,
   *    "count": 25,
   *    "pageCount": 14,
   *    "totalCount": 359
   *  }
   * }
   * "items" are used by IcsClient#downloadPage method.
   * "meta" describes paging:
   *  - "page": which page search is on
   *  - "count": how many elements are on a page
   *  - "pageCount": how many pages are there
   *  - "totalCount": how many interactions were found in a given time period
   */
  search(start: string, end: string, page = 1, pageSize = 1000) {
    return this.authenticate()
      .then((token) =>
        this.icsClient.get('/interactions', {
          params: {
            start,
            end,
            page,
            limit: pageSize,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.newvoicemedia.v2+json',
            'x-nvm-application': 'ics-downloader-app',
          },
        })
      )
      .then(
        (r) => r.data,
        (e) => {
          log.error(`Search failed Status[${e.response.status}] Response: `, e.response.data);
          throw e;
        }
      );
  }

  /**
   * Download specific content of an interaction.
   * Content will be downloaded to folder specified by IcsClient#_downloadFolder.
   * @param interactionId GUID of an interaction
   * @param contentKey Unique name of content within interaction
   * @returns {PromiseLike<T | void>}
   */
  downloadContent(interactionId: string, contentKey: string) {
    const contentUrl = `/interactions/${interactionId}/content/${contentKey}`;
    return this.authenticate()
      .then((token) =>
        this.icsClient.request({
          responseType: 'arraybuffer',
          url: `${contentUrl}`,
          method: 'get',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.newvoicemedia.v2+json',
            'x-nvm-application': 'ics-downloader-app',
          },
        })
      )
      .then(
        (r) => this.saveToDisk(r, interactionId, contentKey),
        (e) => {
          log.error(
            `Content ${contentKey} couldn't be downloaded for ${interactionId} - ${contentUrl}`,
            e.response.status
          );
          throw e;
        }
      )
      .then(() =>
        log.info(`Content ${contentKey} was downloaded for ${interactionId}`)
      );
  }

  /**
   * Downloads all from a list of items. Items are downloaded to folder  IcsClient#_downloadFolder
   * @param items is a list of interactions and should be coming from IcsClient#search method.
   * @private {PromiseLike<T | void>}
   */
  async downloadPage(items: any) {
    for (const i of items) {
      await this.downloadAllContent(i.guid, i.content).catch(log.error);
    }
  }

  private authenticate() {
    return this.oidcClient
      .post(
        '/connect/token',
        qs.stringify({
          grant_type: 'client_credentials',
          scope: 'interaction-content:read',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
        }
      )
      .then(
        (r) => {
          return r.data.access_token;
        },
        (e) => {
          log.error('Authentication failed', e.response.data);
          throw e;
        }
      );
  }

  private async downloadAllContent(interactionId: string, contentList: any) {
    log.info(`All content for interaction ${interactionId} will be downloaded`);
    return Promise.all(
      contentList.map(async (c: any) =>
        await this.downloadContent(interactionId, c.contentKey)
      )
    ).then(() =>
      log.info(`All content for interaction ${interactionId} downloaded`)
    );
  }

  private saveToDisk(response: any, interactionId: string, contentKey: string) {
    return fs.writeFile(
      `${
        this.downloadFolder
      }/${interactionId}_${contentKey}${this.determineExtension(
        response.headers
      )}`,
      response.data
    );
  }

  private determineExtension(headers: any) {
    const contentType = headers['content-type'];
    if (!contentType) {
      return '';
    }
    if (contentType.includes('wav')) {
      return '.wav';
    }
    if (contentType.includes('json')) {
      return '.json';
    }
    if (contentType.includes('webm')) {
      return '.webm';
    }
    return '';
  }
}

export default IcsClient;

export interface DownloadContentMessage {
  clientId: string;
  clientSecret: string;
  region: string;
  downloadPath: string;
}
