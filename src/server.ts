import express from 'express';

export class AuthServer {
    private app: express.Application;
    constructor() {
        this.app = express();
    }
    public start(listenPort: number): void {
        this.app.listen(listenPort, () => {
            console.log(`Authorization server started on port ${listenPort}`);
        });
    }
}

export class ResourceServer {
    private app: express.Application;
    constructor() {
        this.app = express();
    }
    public start(listenPort: number): void {
        this.app.listen(listenPort, () => {
            console.log(`Resource server started on port ${listenPort}`);
        });
    }
}
