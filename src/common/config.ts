interface ConfigType {
    baseUrl: {
        index: string,
        health: string,
        news: string,
    },
}

const config: ConfigType = {
    baseUrl: {
        index: '/',
        health: '/health',
        news: '/news',
    },
};

export { config };
