import React, { useEffect, useState } from 'react';
import styles from './Download.css';
import { DownloadContentMessage } from '../utils/client';

const { ipcRenderer } = require('electron');
const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

const Download = () => {
  const [downloadDir, setDownloadDir] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  const setupDownloadFolderPath = () => {
    const downloadDirPath = path.join(
      os.homedir(),
      'interaction-content-download'
    );
    setDownloadDir(downloadDirPath);
  };

  const setupClientCredentials = () => {
    dotenv.config({
      path: path.join(os.homedir(), '.interaction-content-downloader.env'),
    });
    setClientId(process.env.CLIENT_ID);
    setClientSecret(process.env.CLIENT_SECRET);
  };

  const setInitialState = () => {
    setupClientCredentials();
    setupDownloadFolderPath();
  };
  useEffect(setInitialState, []);

  const handleSubmit = (event: React.FormEvent) => {
    const props: DownloadContentMessage = {
      clientId,
      clientSecret,
      downloadPath: downloadDir,
    };
    // download must happen in the main process.
    ipcRenderer.invoke('download-content', props);
    event.preventDefault();
  };

  const handleClientIdChange = (event: React.ChangeEvent) => {
    setClientId(event.target.value);
  };

  const handleClientSecretChange = (event: React.ChangeEvent) => {
    setClientSecret(event.target.value);
  };

  return (
    <div className={styles.container}>
      <h2>Download Content</h2>
      <h3>
        Content will be downloaded to {downloadDir}
      </h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="clientId">Client Id</label>
        <p>
          <input
            className={styles.input}
            type="text"
            id="clientId"
            name="clientId"
            defaultValue={clientId}
            onChange={handleClientIdChange}
          />
        </p>
        <label htmlFor="clientSecret">Client Secret</label>
        <p>
          <input
            className={styles.input}
            type="password"
            id="clientSecret"
            name="clientSecret"
            defaultValue={clientSecret}
            onChange={handleClientSecretChange}
          />
        </p>
        <button className={styles.submit} type="submit" id="download">
          Download
        </button>
      </form>
    </div>
  );
};

export default Download;
