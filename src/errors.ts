export class DustParameterError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "DustParameterError";
    }
}
