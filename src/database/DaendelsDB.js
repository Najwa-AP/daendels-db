const fs = require("fs");
const path = require("path");

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
                if (entry.action === "BUILD") {
                    this.storage.set(entry.key, entry.value);
                } else if (entry.action === "DEMOLISH") {
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

    // private method for validate input
    _validateBuild(key, value) { 
        if (!key || value === undefined) {
            throw new Error (
                "[Daendels] Error: Key and Value must not be empty!"
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
        this._appendLog("BUILD", key, value);

        return `[Daendels] Post road successfully built and persisted for key: '${key}'`;
    }

    // INSPECT command (GET)
    inspect(key) {
        if (!this.storage.has(key)) {
            return `[Daendels] Error: Key '${key}' not found along the post road!`;
        }
        return this.storage.get(key);
    }

    // DEMOLISH command (DELETE)
    demolish(key) {
        if (!key) {
            return "[Daendels] Error: Key must not be empty!";
        } else if (!this.storage.has(key)) {
            return `[Daendels] Error: Key '${key}' not found along the post road!`;
        }

        // write to disk (append-only)
        this._appendLog("DEMOLISH", key);

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