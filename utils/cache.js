// utils/cache.js

const fs = require('fs/promises');
const path = require('path');

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_DIR = path.join('/tmp', 'commit-badge-cache');

const ensureCacheDir = async () => {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create cache directory:', error);
    }
};

const cache = {
    get: async (key) => {
        try {
            const filePath = path.join(CACHE_DIR, `${key}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            const entry = JSON.parse(data);
            if (Date.now() - entry.timestamp > CACHE_TTL) return null;
            return entry.value;
        } catch (error) {
            return null;
        }
    },
    set: async (key, value) => {
        try {
            const filePath = path.join(CACHE_DIR, `${key}.json`);
            const entry = { timestamp: Date.now(), value };
            await fs.writeFile(filePath, JSON.stringify(entry), 'utf8');
        } catch (error) {
            console.error(`Failed to set cache for key ${key}:`, error);
        }
    }
};

module.exports = { ensureCacheDir, cache };