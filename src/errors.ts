export class PGCustomError extends Error {
    readonly uri: string;
    readonly err: Error;
    constructor(uri: string, err: Error) {
        super(`${uri}: ${err.message}`)

        this.stack = err.stack;
        this.uri = uri;
        this.err = err;
    }

    toJSON() {
        return {
            uri: this.uri,
            message: this.message,
            stack: this.stack,
        }
    }
}

export class PGPoolError extends PGCustomError {
    static uri = "PGPoolError";
    constructor(err: Error) {
        super(PGPoolError.uri, err);
    }
}

export class PGClientError extends Error {
    static uri = 'PGClientError'
    constructor(err: Error) {
        super(PGClientError.uri, err);
    }
}

export class PGTransactionError extends Error {
    static uri = 'PGTransactionError'
    constructor(err: Error) {
        super(PGTransactionError.uri, err);
    }
}
