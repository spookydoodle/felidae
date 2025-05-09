import express from 'express';

// Define a router for health
const router = express.Router();
const startTime = new Date();

// Health check
// 1. Display uptime info
// 2. Check if node.js app is running
router.get('/', async (_req, res) => {
    const uptime = process.uptime();
    const H = Math.floor(uptime / 3600);
    const min = Math.floor((uptime % 3600) / 60);
    const sec = uptime % 60;
    let healthcheck: {
        timestamp?: number;
        uptime?: number;
        uptimeFormatted?: string;
        node?: { status: 'OK' | 'Not OK'; message: string };
        startTime?: string;
        error?: undefined | unknown;
    } = {};

    try {
        healthcheck = {
            timestamp: startTime.valueOf(),
            uptime: uptime,
            uptimeFormatted: `${H} hrs ${min} min ${sec.toFixed(0)} s`,
            startTime: startTime.toUTCString(),
            node: {
                status: 'OK',
                message: 'Node.js server runing',
            },
            error: undefined,
        };

        res.status(200).send(healthcheck);
    } catch (err) {
        healthcheck.error = err;
        res.status(503).send();
    }
});

export default router;
