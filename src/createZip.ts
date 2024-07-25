import { ensureDirSync, ensureFileSync, existsSync, renameSync, rmSync, writeFileSync } from 'fs-extra';
import { join } from 'path';
import { getSha1Hash, zipDirectory } from './utils';
import logger from './logger';

const packZipPath = join(__dirname, '../pack.zip');
const tempPackZipPath = join(__dirname, '../pack-temp.zip');
const packSHA1Path = join(__dirname, '../pack-sha1');
const packDirPath = join(__dirname, '../pack');

ensureDirSync(packDirPath);
ensureFileSync(packSHA1Path);

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

        logger.log({
            level: 'info',
            message: 'Created new pack',
            color: 'greenBright',
        });
    } else {
        logger.log({
            level: 'info',
            message: 'Pack up to date',
            color: 'gray',
        });

        rmSync(tempPackZipPath);
    }

    logger.log({
        level: 'info',
        message: `SHA1: ${hash}`,
        color: 'blueBright',
    });
});