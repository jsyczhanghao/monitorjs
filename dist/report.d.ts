import types from './types';
export declare const report: (type: types, data: object) => boolean;
export declare const ifTimeoutReport: (time: number, type: types, data: object) => void;
