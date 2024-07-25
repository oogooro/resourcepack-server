declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            ENV: 'prod' | 'dev';
        }
    }
}

export { };