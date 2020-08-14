import React, {useEffect, useState} from 'react';
import download from '../utils/downloader';
import styles from './Download.css';

const os = require('os');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const Download = () => {
  const [downloadDir, setDownloadDir] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  const setupDownloadFolder = () => {
    const downloadDirPath = path.join(os.homedir(), 'interaction-content-download');
    fs.stat(downloadDirPath, (err: any) => {
      if (err && err.code === 'ENOENT') {
        console.log(`Creating ${downloadDirPath}`);
        fs.mkdirSync(downloadDir);
      }
    });
    setDownloadDir(downloadDirPath);
  };

  const setupClientCredentials = () => {
    dotenv.config({path: path.join(os.homedir(), '.interaction-content-downloader.env')});
    console.dir(process.env);
    setClientId(process.env['CLIENT_ID']);
    setClientSecret(process.env['CLIENT_SECRET']);
  };

  const setInitialState = () => {
    setupDownloadFolder();
    setupClientCredentials();
  };
  useEffect(setInitialState, []);

  const handleSubmit = (event: React.FormEvent) => {
    download(downloadDir, clientId, clientSecret);
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
      <h3>Content will be downloaded to {downloadDir}</h3>
      <form onSubmit={handleSubmit}>
        <p>
          <input
            className={styles.input}
            type="text"
            name="clientId"
            defaultValue={clientId}
            onChange={handleClientIdChange}
          />
        </p>
        <p>
          <input
            className={styles.input}
            type="password"
            name="clientSecret"
            defaultValue={clientSecret}
            onChange={handleClientSecretChange}
          />
        </p>
        <button className={styles.submit} type="submit">
          Download
        </button>
      </form>
    </div>
  );
};

export default Download;
