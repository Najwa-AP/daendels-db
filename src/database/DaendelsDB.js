const fs = require("fs");
const path = require("path");
const ERROR = require("../messages/error");
const WARNING = require("../messages/warning");

const ACTIONS = {
    BUILD: "BUILD",
    DEMOLISH: "DEMOLISH",
};

class DaendelsDB {
    constructor(filepath = "daendels.log") {
        this.storage = new Map(); // store data in RAM
        this.logFilePath = path.resolve(filepath);
        this._loadFromDisk();
    }

    // private method for restore data from file
    _loadFromDisk() {
        if (!fs.existsSync(this.logFilePath)) {
            // if not exist, create one
            fs.writeFileSync(this.logFilePath, "", "utf-8");
            return;
        }

        // read all content of log file
        const fileContent = fs.readFileSync(this.logFilePath, "utf-8");
        const lines = fileContent.split(/\r?\n/);

        for (const line of lines) {
            if (!line.trim()) continue; // ignoring empty lines
            
            try {
                const entry = JSON.parse(line);
                if (entry.action === ACTIONS.BUILD) {
                    this.storage.set(entry.key, entry.value);
                } else if (entry.action === ACTIONS.DEMOLISH) {
                    this.storage.delete(entry.key);
                }
            } catch (err) {
                console.warn(
                    `${WARNING.CORRUPTED_LOG(line)}`
                );
            }
        }
    }

    // private method for write data to file
    _appendLog(action, key, value) { 
        const entry = {
            action,
            key,
            timestamp: new Date().toISOString(),
        };

        if (value !== undefined) {
            entry.value = value;
        }

        const logEntry = JSON.stringify(entry) + "\n";

        fs.appendFileSync(this.logFilePath, logEntry, "utf-8");
    }

    // method for handling error message
    _createError(message) {
        return new Error(
            `[Daendels] ${message}`
        );
    }

    // private method for validate BUILD 
    _validateBuild(key, value) { 
        if (!key || value === undefined) {
            throw this._createError (
                ERROR.EMPTY_KEY_VALUE
            );    
        }
    }

    // private method for validate INSPECT 
    _validateInspect(key) { 
        if (!key) {
            throw this._createError (
                ERROR.EMPTY_KEY
            );
        }

        if (!this.storage.has(key)) {
            throw this._createError (
                ERROR.KEY_NOT_FOUND(key)
            );
        }
    }

    // private method for validate DEMOLISH 
    _validateDemolish(key) { 
        if (!key) {
            throw this._createError (
                ERROR.EMPTY_KEY
            );
        }

        if (!this.storage.has(key)) {
            throw this._createError (
                ERROR.KEY_NOT_FOUND(key)
            );
        }
    }

    // BUILD command (SET)
    build(key, value) {
        // validate input
        this._validateBuild(key, value);

        // save to RAM
        this.storage.set(key, value);

        // write to disk (append-only)
        this._appendLog(ACTIONS.BUILD, key, value);

        return true;
    }

    // INSPECT command (GET)
    inspect(key) {
        // validate input
        this._validateInspect(key);

        return this.storage.get(key);
    }

    // DEMOLISH command (DELETE)
    demolish(key) {
        // validate input
        this._validateDemolish(key);

        // write to disk (append-only)
        this._appendLog(ACTIONS.DEMOLISH, key);

        this.storage.delete(key);
            
        return true;
    }

    // SURVEY command (LIST)
    survey(key) {
        return Array.from(this.storage.entries());
    }

    // STATS command (STATUS)
    stats() {
        // records
        const records = this.storage.size;
        // log file name
        const logFile = path.basename(this.logFilePath);
        // log file size
        const logSize = fs.statSync(this.logFilePath).size;
        // log entries
        const fileContent = fs.readFileSync(this.logFilePath, "utf-8");
        const lines = fileContent.split(/\r?\n/);

        let logEntries = 0;
        for (const line of lines) {
            if (!line.trim()) continue; // ignoring empty lines
            logEntries++;
        }

        return {
            database: "DaendelsDB",
            engine: "In-Memory + Append Log",
            records,
            logFile,
            logSize,
            logEntries,
            status: "Operational",
        };
    }
}
module.exports = DaendelsDB;