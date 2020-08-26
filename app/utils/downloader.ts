import moment from 'moment';
import IcsClient from './client';

const download = async (downloadPath: string, clientId: string, clientSecret: string) => {
  const icsClient = new IcsClient(clientId, clientSecret, 'emea', downloadPath);

  const start = moment().utc().subtract(6, 'day').startOf('day').toISOString();
  const end = moment().utc().endOf('day').toISOString();

  const pageNumber = 1;
  const pageSize = 10;
  const searchPage = await icsClient.search(start, end, pageNumber, pageSize);
  await icsClient.downloadPage(searchPage.items);
};
export default download;
