export declare class AppController {
    getRoot(): {
        status: string;
        name: string;
        version: string;
        swagger: string;
        timestamp: string;
    };
    getHealth(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
}
