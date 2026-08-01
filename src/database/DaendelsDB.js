const fs = require("fs");
const path = require("path");

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
                console.error(`[Daendels] Corrupted log entry ignored: ${line}`);
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
                "Key and Value must not be empty!"
            );    
        }
    }

    // private method for validate INSPECT 
    _validateInspect(key) { 
        if (!key) {
            throw this._createError (
                `Key must not be empty`
            );
        }

        if (!this.storage.has(key)) {
            throw this._createError (
                `Key '${key}' not found along the post road!`
            );
        }
    }

    // private method for validate DEMOLISH 
    _validateDemolish(key) { 
        if (!key) {
            throw this._createError (
                `Key must not be empty`
            );
        }

        if (!this.storage.has(key)) {
            throw this._createError (
                `Key '${key}' not found along the post road!`
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

        return `[Daendels] Post road successfully built and persisted for key: '${key}'`;
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
            return `[Daendels] Post road successfully demolish the key!`;
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