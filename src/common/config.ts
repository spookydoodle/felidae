interface ConfigType {
    baseUrl: {
        index: string,
        health: string,
    },
}

const config: ConfigType = {
    baseUrl: {
        index: '/',
        health: '/health'
    },
};

export { config };
