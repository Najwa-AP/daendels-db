class DaendelsDB {
    constructor() {
        this.storage = new Map(); // store data in RAM
    }

    // BUILD command (save data)
    build(key, value) {
        if (!key | !value) {
            return "[Daendels] Error: Key and Value must not be empty!";
        }
        this.storage.set(key, value);
        return `[Daendels] Post road successfully built for key: '${key}'`;
    }

    // INSPECT command (retrieve data)
    inspect(key) {
        if (!this.storage.has(key)) {
            return `[Daendels] Error: Key '${key}' not found along the post road!`;
        }
        return this.storage.get(key);
    }
}

// test
const db = new DaendelsDB();
console.log(db.build("fortress", "Anyer"));
console.log(db.inspect("fortress"));
console.log(db.inspect("office"));