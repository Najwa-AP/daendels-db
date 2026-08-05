const fs = require("fs");
const path = require("path");
const ERROR = require("../messages/error");
const WARNING = require("../messages/warning");

const ACTIONS = {
    BUILD: "BUILD",
    DEMOLISH: "DEMOLISH",
};

const ALLOWED_VALUE_TYPES = [
    "string",
    "number",
    "boolean",
    "object",
];

class DaendelsDB {
    constructor(
        filepath = "daendels.log",
        snapshotFilePath = "snapshot.json"
    ) {
        this.storage = new Map();
        this.storage.set(
            "default",
            new Map()
        );

        this.logFilePath = path.resolve(filepath);
        this.snapshotFilePath = path.resolve(snapshotFilePath);
        
        this._loadSnapshot();
        this._loadFromDisk();
    }

    // private method for restore data from snapshot
    _loadSnapshot() {
        // check if the snapshot file is exist
        if (!fs.existsSync(this.snapshotFilePath)) {
            return;
        }

        const fileContent = fs.readFileSync(
            this.snapshotFilePath,
            "utf-8"
        );

        if (!fileContent.trim()) {
            return;
        }

        // turn JSON into Object
        const snapshot = JSON.parse(fileContent);

        // turn Object into Map
        this.storage = new Map();

        for (const [name, collection] of Object.entries(snapshot)) {
            this.storage.set(
                name,
                new Map(Object.entries(collection))
            );
        }
    }

    // private method for saving data into snapshot
    _saveSnapshot() {
        const snapshot = {};

        for (const [name, collection] of this.storage.entries()) {
            snapshot[name] = Object.fromEntries(collection);
        }

        fs.writeFileSync(
            this.snapshotFilePath,
            JSON.stringify(snapshot, null, 2), 
            "utf-8"
        );
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

        const collection = this._getCollection();

        for (const line of lines) {
            if (!line.trim()) continue; // ignoring empty lines
            
            try {
                const entry = JSON.parse(line);
                if (entry.action === ACTIONS.BUILD) {
                    collection.set(entry.key, entry.value);
                } else if (entry.action === ACTIONS.DEMOLISH) {
                    collection.delete(entry.key);
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

    // clearing the content inside daendels.log file
    _clearLog() {
        fs.writeFileSync(this.logFilePath, "", "utf-8");
    }

    // handle the key validation
    _validateKey(key) {
        if (typeof key !== "string") {
            throw this._createError(
                ERROR.INVALID_KEY_TYPE
            );
        }

        if (!key.trim()) {
            throw this._createError(
                ERROR.EMPTY_KEY
            );
        }
    }

    // handle the value validation
    _validateValue(value) {
        const valueType = typeof value;

        if (!ALLOWED_VALUE_TYPES.includes(valueType)) {
            throw this._createError (
                ERROR.INVALID_VALUE_TYPE
            );    
        }
        if (valueType === "string" && !value.trim()){
            throw this._createError (
                ERROR.EMPTY_VALUE
            );    
        }
    }

    // private method for validate BUILD 
    _validateBuild(key, value) { 
        this._validateKey(key);

        this._validateValue(value);
    }

    // private method for validate INSPECT 
    _validateInspect(key) { 
        this._validateKey(key);

        const collection = this._getCollection();

        if (!collection.has(key)) {
            throw this._createError (
                ERROR.KEY_NOT_FOUND(key)
            );
        }
    }

    // private method for validate DEMOLISH 
    _validateDemolish(key) { 
        this._validateKey(key);

        const collection = this._getCollection();

        if (!collection.has(key)) {
            throw this._createError (
                ERROR.KEY_NOT_FOUND(key)
            );
        }
    }
    
    // for get a collection
    _getCollection(name = "default") {
        if (!this.storage.has(name)) {
            this.storage.set(name, new Map());
        }

        return this.storage.get(name);
    }

    // BUILD command (SET)
    build(key, value) {
        // validate input
        this._validateBuild(key, value);

        // save to RAM
        const collection = this._getCollection();
        collection.set(key, value);

        // write to disk (append-only)
        this._appendLog(ACTIONS.BUILD, key, value);

        return true;
    }

    // INSPECT command (GET)
    inspect(key) {
        this._validateInspect(key);

        const collection = this._getCollection();
        return collection.get(key);
    }

    // DEMOLISH command (DELETE)
    demolish(key) {
        // validate input
        this._validateDemolish(key);

        // write to disk (append-only)
        this._appendLog(ACTIONS.DEMOLISH, key);

        const collection = this._getCollection();
        collection.delete(key);
            
        return true;
    }

    // SURVEY command (LIST)
    survey(key) {
        const collection = this._getCollection();
        return Array.from(collection.entries());
    }

    // REPORT command (STATS)
    report() {
        // records
        const collection = this._getCollection();
        const records = collection.size;
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

    // SNAPSHOT command (SNAPSHOT)
    snapshot() {
        this._saveSnapshot();

        return true;
    }

    // COMPACT command (COMPACT LOG)
    compact() {
        this._saveSnapshot();

        this._clearLog();

        return true;
    }
}
module.exports = DaendelsDB;