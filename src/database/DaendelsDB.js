const fs = require("fs");
const path = require("path");
const ERROR = require("../messages/error");
const WARNING = require("../messages/warning");

const ACTIONS = {
    BUILD: "BUILD",
    DEMOLISH: "DEMOLISH",
    CREATE_COLLECTION: "CREATE_COLLECTION",
    DROP_COLLECTION: "DROP_COLLECTION",
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

        this.currentNamespace = "default";
        this.currentCollection = "default";

        this.transactionSnapshot = null;
        this.transactionLog = [];

        this.logFilePath = path.resolve(filepath);
        this.snapshotFilePath = path.resolve(snapshotFilePath);
        
        this._loadSnapshot();
        this._loadFromDisk();
        
        this._getCurrentCollection();
    }

    // private method for restore data from snapshot
    _loadSnapshot() {
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

        for (const [namespaceName, namespace] of Object.entries(snapshot)) {
            const namespaceMap = new Map();

            for (const [collectionName, collection] of Object.entries(namespace)) {
                namespaceMap.set(
                    collectionName,
                    new Map(Object.entries(collection))
                );
            }
            this.storage.set(namespaceName, namespaceMap);
        }
    }

    // private method for saving data into snapshot
    _saveSnapshot() {
        const snapshot = {};

        for (const [namespaceName, namespace] of this.storage.entries()) {
            snapshot[namespaceName] = {};

            for (const [collectionName, collection] of namespace.entries()) {
                snapshot[namespaceName][collectionName] = 
                    Object.fromEntries(collection);
            }
        }

        fs.writeFileSync(
            this.snapshotFilePath,
            JSON.stringify(snapshot, null, 2), 
            "utf-8"
        );
    }

    // for restore data from file
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
                const collection = this._getCollection(
                    entry.namespace,
                    entry.collection
                );
                
                if (entry.action === ACTIONS.BUILD) {
                    collection.set(entry.key, entry.value);
                } else if (entry.action === ACTIONS.DEMOLISH) {
                    collection.delete(entry.key);
                } else if (entry.action === ACTIONS.CREATE_COLLECTION) {
                    this._getNamespace(entry.namespace).set(entry.collection, new Map());
                } else if (entry.action === ACTIONS.DROP_COLLECTION) {
                    const namespace = this._getNamespace(entry.namespace);

                    namespace.delete(entry.collection);
                }
            } catch (err) {
                console.warn(
                    `${WARNING.CORRUPTED_LOG(line)}`
                );
            }
        }
    }

    // private method for write data to file
    _appendLog(action, namespace, collection, key, value) { 
        const entry = {
            action,
            namespace,
            collection,
            key,
            timestamp: new Date().toISOString(),
        };

        if (value !== undefined) {
            entry.value = value;
        }

        const logEntry = JSON.stringify(entry) + "\n";

        fs.appendFileSync(this.logFilePath, logEntry, "utf-8");
    }

    // append log for transaction
    _appendTransactionLog(action, namespace, collection, key, value) {
        const entry = {
            action,
            namespace,
            collection,
            key,
            timestamp: new Date().toISOString(),
        };

        if (value !== undefined) {
            entry.value = value;
        }

        this.transactionLog.push(entry);
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
            throw this._createError(ERROR.INVALID_KEY_TYPE);
        }

        if (!key.trim()) {
            throw this._createError(ERROR.EMPTY_KEY);
        }
    }

    // handle the value validation
    _validateValue(value) {
        const valueType = typeof value;

        if (!ALLOWED_VALUE_TYPES.includes(valueType)) {
            throw this._createError (ERROR.INVALID_VALUE_TYPE);    
        }
        if (valueType === "string" && !value.trim()){
            throw this._createError (ERROR.EMPTY_VALUE);    
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

        const collection = this._getCurrentCollection();

        if (!collection.has(key)) {
            throw this._createError (ERROR.KEY_NOT_FOUND(key));
        }
    }

    // private method for validate DEMOLISH 
    _validateDemolish(key) { 
        this._validateKey(key);

        const collection = this._getCurrentCollection();

        if (!collection.has(key)) {
            throw this._createError (ERROR.KEY_NOT_FOUND(key));
        }
    }
    
    // for get a collection
    _getCollection(
        namespace = this.currentNamespace,
        collection = this.currentCollection
    ) {
        const currentNamespace = this._getNamespace(namespace);
        
        if (!currentNamespace.has(collection)) {
            currentNamespace.set(collection, new Map());
        }

        return currentNamespace.get(collection);
    }

    // getting a namespace
    _getNamespace(name = "default") {
        if(!this.storage.has(name)) {
            this.storage.set(name, new Map());
        }
        return this.storage.get(name);
    }

    // for getting a current/newest collection
    _getCurrentCollection() {
        return this._getCollection(
            this.currentNamespace,
            this.currentCollection
        );
    }

    // for comparing input with data fol filtering
    _reconCompare(actual, operator, expected) {
        switch (operator) {
            case "=":
                return actual === expected;
            case "!=":
                return actual !== expected;
            case ">":
                return actual > expected;
            case "<":
                return actual < expected;
            case ">=":
                return actual >= expected;
            case "<=":
                return actual <= expected;
            default:
                throw this._createError(ERROR.INVALID_OPERATOR);
        }
    }

    // save a condition of the database before trnasaction begin
    _cloneStorage() {
        const clone = new Map();

        for (const [namespaceName, namespace] of this.storage) {
            const namespaceClone = new Map();

            for (const [collectionName, collection] of namespace) {
                namespaceClone.set(
                    collectionName,
                    new Map(collection)
                );
            }
            clone.set(namespaceName, namespaceClone);
        }
        return clone;;
    }

    // to save all changes made in transaction into log file permanently
    _flushTransactionLog() {
        for (const entry of this.transactionLog) {
            const logEntry = JSON.stringify(entry) + "\n";
            
            fs.appendFileSync(this.logFilePath, logEntry, "utf-8");
        }
    }

    // BUILD command (SET)
    build(key, value) {
        // validate input
        this._validateBuild(key, value);

        // save to RAM
        const collection = this._getCurrentCollection();
        collection.set(key, value);
        
        if (this.transactionSnapshot !== null) {
            this._appendTransactionLog(
                ACTIONS.BUILD,
                this.currentNamespace,
                this.currentCollection,
                key,
                value
            );
        } else {
            this._appendLog(
                ACTIONS.BUILD, 
                this.currentNamespace,
                this.currentCollection, 
                key, 
                value
            );
        }
        return true;
    }

    // INSPECT command (GET)
    inspect(key) {
        this._validateInspect(key);

        const collection = this._getCurrentCollection();
        return collection.get(key);
    }

    // DEMOLISH command (DELETE)
    demolish(key) {
        // validate input
        this._validateDemolish(key);

        if (this.transactionSnapshot !== null) {
            this._appendTransactionLog(
                ACTIONS.DEMOLISH,
                this.currentNamespace,
                this.currentCollection,
                key
            );
        } else {
            this._appendLog(
                ACTIONS.DEMOLISH, 
                this.currentNamespace,
                this.currentCollection, 
                key
            );
        }
        const collection = this._getCurrentCollection();
        collection.delete(key);
            
        return true;
    }

    // SURVEY command (LIST)
    survey() {
        const collection = this._getCurrentCollection();
        return Array.from(collection.entries());
    }

    // REPORT command (STATS)
    report() {
        // records
        const totalNamespaces = this.storage.size;
        let totalCollections = 0;

        for (const namespace of this.storage.values()) {
            totalCollections += namespace.size;
            
        }

        let totalRecords = 0;

        for (const namespace of this.storage.values()) {
            for (const collection of namespace.values()) {
                totalRecords += collection.size;
            }
        }

        const currentCollection = this._getCurrentCollection();
        
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
            version: "0.7",
            engine: "In-Memory + Snapshot + Append Log",
            currentNamespace: this.currentNamespace,
            currentCollection: this.currentCollection,
            currentCollectionRecords: currentCollection.size,
            namespaces: totalNamespaces,
            collections: totalCollections,
            totalRecords,
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

    // USE COLLECTION (to let users use collection they want)
    useCollection(name) {
        this._validateKey(name);

        this._getCollection(this.currentNamespace, name);

        this.currentCollection = name;

        return true;
    }

    // CREATE COLLECTION (make a new collection only if its not exist yet)
    createCollection(name) {
        this._validateKey(name);

        const namespace = this._getNamespace(this.currentNamespace);

        if (namespace.has(name)) {
            throw this._createError(ERROR.COLLECTION_EXISTS(name));
        }

        namespace.set(name, new Map());

        this._appendLog(
            ACTIONS.CREATE_COLLECTION,
            this.currentNamespace,
            name
        );

        return true;
    }

    // HAS COLLECTION (check if the collection already exist or not)
    hasCollection(name) {
        this._validateKey(name);

        const namespace = this._getNamespace(this.currentNamespace);

        return namespace.has(name);
    }

    // DROP COLLECTION (for deleting a collection)
    dropCollection(name) {
        this._validateKey(name);

        const namespace = this._getNamespace(this.currentNamespace);

        if (!namespace.has(name)) {
            throw this._createError(ERROR.COLLECTION_NOT_FOUND(name));
        }

        if (name === this.currentCollection) {
            this.currentCollection = "default";
            this._getCollection();
        }

        this._appendLog(
            ACTIONS.DROP_COLLECTION,
            this.currentNamespace,
            name
        );

        namespace.delete(name);

        return true;
    }

    // LIST COLLECTION (to show users all collection that's exist)
    listCollections() {
        const namespace = this._getNamespace(this.currentNamespace);
        return Array.from(namespace.keys());
    }

    //USE NAMESPACE (to let the user choose namespaces they want)
    useNamespace(name) {
        this._validateKey(name);

        this._getNamespace(name);

        this.currentNamespace = name;

        return true;
    }

    // LIST NAMESPACE (to show users all namespaces that's exist)
    listNamespaces() {
        return Array.from(this.storage.keys());
    }

    // RECON command (FILTER)
    recon(key, operator, expectedValue) {
        const collection = this._getCurrentCollection();

        return Array.from(collection.entries())
            .filter(([entryKey, entryValue]) => {
                if (entryKey !== key) {
                    return false;
                }

                return this._reconCompare(
                    entryValue, 
                    operator, 
                    expectedValue
                );
            }
        );
    }

    // FIND command (Prefix search)
    find(prefix) {
        this._validateKey(prefix);

        const results = [];

        for (const [namespaceName, namespace] of this.storage.entries()) {
            for (const [collectionName, collection] of namespace.entries()) {
                for (const [key, value] of collection.entries()) {
                    if (key.startsWith(prefix)) {
                        results.push({
                            namespace: namespaceName,
                            collection: collectionName,
                            key, 
                            value,
                        });
                    }
                }
            }
        }
        return results;
    }

    // BEGIN TRANSACTION (to start a transaction)
    beginTransaction() {
        if (this.transactionSnapshot !== null) {
            throw this._createError(ERROR.TRANSACTION_ACTIVE);
        }

        this.transactionSnapshot = {
            snapshot: this._cloneStorage(),
        };
        return true;
    }

    // COMMIT (save transaction changes into database)
    commit() {
        if (this.transactionSnapshot === null) {
            throw this._createError(ERROR.NO_TRANSACTION);
        }
        this._flushTransactionLog();

        this.transactionSnapshot = null;
        this.transactionLog = [];

        return true;
    }

    // ROLLBACK (rewind to last state of the database)
    rollback() {
        if (this.transactionSnapshot === null) {
            throw this._createError(ERROR.NO_TRANSACTION);
        }
        this.storage = this.transactionSnapshot.snapshot;

        this.transactionSnapshot = null;
        this.transactionLog = [];
        
        return true;
    }
}
module.exports = DaendelsDB;