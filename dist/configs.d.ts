declare const _default: {
    get: () => {
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
    set: (cfgs: object) => void;
};
export default _default;
