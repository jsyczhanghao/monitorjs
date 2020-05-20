declare let configs: {
    namespace: string;
    timeoutCheck: number;
    reportUrl: string;
    percent: number;
    fs: {
        enable: boolean;
        root: string;
        startParam: string;
        maxSpace: number;
    };
};
export default configs;
export declare const setConfigs: (cfgs: object) => void;
