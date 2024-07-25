import archiver from 'archiver';
import { createWriteStream, readFileSync } from 'fs-extra';
import { networkInterfaces } from 'os';
import crypto from 'node:crypto';

/**
 * Get current machnie local IP
 * @param networkName Network interface name
 * @returns Server IP
 */
export const getServerIp = (networkName = 'Tailscale'): string => {
    const nets = networkInterfaces();
    return nets[networkName].find(net => net.family === 'IPv4').address;
}

/**
 * Compress directory
 * @param sourceDir /some/folder/to/compress
 * @param outPath /path/to/created.zip
 */
export const zipDirectory = (sourceDir: string, outPath: string): Promise<void> => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = createWriteStream(outPath);

    return new Promise<void>((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

/**
 * Get SHA-1 hash
 * @param path File path
 * @returns SHA-1 hash in hex
 */
export const getSha1Hash = (path: string): string => {
    const fileBuffer = readFileSync(path);
    return crypto.createHash('sha1').update(fileBuffer).digest('hex');
}