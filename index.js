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

    // BUILD command (SET)
    build(key, value) {
        if (!key || value === undefined) {
            return "[Daendels] Error: Key and Value must not be empty!";
        }

        // save to RAM
        this.storage.set(key, value);

        // log format 
        const logEntry = JSON.stringify({
            action: "BUILD",
            key,
            value,
            timestamp: new Date().toISOString(),
        }) + "\n";

        // write to disk (append-only)
        try {
            fs.appendFileSync(this.logFilePath, logEntry, "utf-8");
            return `[Daendels] Post road successfully built and persisted for key: '${key}'`;
        } catch (err) {
            throw err;
        }
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

        // log format 
        const logEntry = JSON.stringify({
            action: "DEMOLISH",
            key,
            timestamp: new Date().toISOString(),
        }) + "\n";

        // write to disk (append-only)
        try {
            fs.appendFileSync(this.logFilePath, logEntry, "utf-8");
            this.storage.delete(key);
            return `[Daendels] Post road successfully demolish the key!`;
        } catch (err) {
            throw err;
        }
    }

}

// test
const db = new DaendelsDB();
console.log(db.build("fortress", "Anyer"));
console.log(db.build("hq", "Batavia"));
console.log(db.demolish("fortress"));
console.log(db.demolish("abc"));
console.log(db.inspect("fortress"));