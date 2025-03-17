export class DustParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "DustParameterError"
    }
}