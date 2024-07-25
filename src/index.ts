import express from 'express';
import { config } from 'dotenv';
import logger from './logger';
import { getServerIp, getSha1Hash, zipDirectory } from './utils';
import { join } from 'path';
import { ensureDirSync, ensureFileSync, existsSync, renameSync, rmSync, writeFileSync } from 'fs-extra';
config();

const packZipPath = join(__dirname, '../pack.zip');
const tempPackZipPath = join(__dirname, '../pack-temp.zip');
const packSHA1Path = join(__dirname, '../pack-sha1');
const packDirPath = join(__dirname, '../pack');

let hash = '';

if (existsSync(packZipPath)) {
    hash = getSha1Hash(packZipPath);
}

if (existsSync(tempPackZipPath)) rmSync(tempPackZipPath);

zipDirectory(packDirPath, tempPackZipPath).then(() => {
    const tempHash = getSha1Hash(tempPackZipPath);
    if (tempHash !== hash) {
        hash = tempHash;
        if (existsSync(packZipPath)) rmSync(packZipPath);
        renameSync(tempPackZipPath, packZipPath);
        writeFileSync(packSHA1Path, hash);
    } else {
        rmSync(tempPackZipPath);
    }

    logger.log({
        level: 'info',
        message: `SHA1: ${hash}`,
        color: 'blueBright',
    });
});

logger.log({
    level: 'init',
    message: `Running in ${process.env.ENV}`,
    color: process.env.ENV === 'prod' ? 'cyanBright' : 'magentaBright',
});

const PORT = process.env.ENV === 'prod' ? process.env.PORT : parseInt(process.env.PORT) + 1000 || 5600;

ensureDirSync(packDirPath);
ensureFileSync(packSHA1Path);

const app = express();

app.get('/pack', (req, res) => {
    res.sendFile(join(__dirname, '../pack.zip'));
});

app.get('/sha1', (req, res) => {
    res.status(200).send(hash);
});

app.all('/*', (req, res) => {
    res.sendStatus(404);
});

app.listen(PORT, () => {
    const serverIp = getServerIp();

    logger.log({
        level: 'init',
        message: `Listening at http://${serverIp}:${PORT}`,
        color: 'greenBright',
    });
});