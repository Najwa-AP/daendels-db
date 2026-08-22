const readline = require("readline");
const DaendelsDB = require("../database/DaendelsDB");
const SUCCESS = require("../messages/success");
const WARNING = require("../messages/warning");
const ERROR = require("../messages/error");

const db = new DaendelsDB();

function startCLI() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.on("line", (input) => {
        const args = input.trim().split(" ");
        const command = args[0].toUpperCase();

        const keepRunning = executeCommand(command, args, rl);

        if (keepRunning) {
            rl.prompt();
        }
    });

    rl.on("close", () => {
        console.log("Goodbye");
        process.exit(0);
    });

    console.log(`
    =====================================
                DaendelsDB 
    =====================================
    Version : 0.9
    Storage : In-Memory + Snapshot + Append Log

    Type HELP for available commands.
    =====================================
    `);

    rl.setPrompt("daendels> ");
    rl.prompt();
}

function parseValue(value) {
    const input = Number(value);

    if (!Number.isNaN(input)) {
        return input;
    } 

    if (value === "true") {
        return true;
    } 
    
    if (value === "false") {
        return false;
    } 
    
    if (value === "null") {
        return null;
    } 

    return value;
}

function executeCommand(command, args, rl) {
    try {
        switch (command) {
            case "BUILD": {
                if (args.length < 3) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const key = args[1];
                const value = parseValue(args[2]);

                db.build(key, value);

                console.log(
                    `[Daendels] ${SUCCESS.BUILD(key)}`
                );
                return true;
            }
            case "INSPECT": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const key = args[1];

                console.log(db.inspect(key));

                console.log(
                    `[Daendels] ${SUCCESS.INSPECT}`
                );
                return true;
            }
            case "DEMOLISH": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const key = args[1];

                db.demolish(key);
                console.log(
                    `[Daendels] ${SUCCESS.DEMOLISH(key)}`
                );
                return true;
            }
            case "SURVEY": {
                console.table(db.survey());
                console.log(
                    `[Daendels] ${SUCCESS.SURVEY}`
                );
                return true;
            }
            case "RECON": {
                if (args.length < 4) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const key = args[1];
                const operator = args[2];
                const value = parseValue(args[3]);

                console.table(db.recon(key, operator, value));
                console.log(
                    `[Daendels] ${SUCCESS.RECON}`
                );
                return true;
            }
            case "FIND": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const results = db.find(args[1]);

                if (results.length > 0) {
                    console.table(results);
                    console.log(
                        `[Daendels] ${SUCCESS.FIND}`
                    );
                } else {
                    console.log(WARNING.NO_MATCHING_RECORDS(args[1]));
                }

                return true;
            }
            case "REPORT": {
                console.table(db.report());
                console.log(
                    `[Daendels] ${SUCCESS.REPORT}`
                );
                return true;
            }
            case "USE_NAMESPACE": {
                db.useNamespace(args[1]);
                console.log(
                    `[Daendels] Active namespace: '${args[1]}'.`
                );
                return true;
            }
            case "NAMESPACES": {
                console.table(db.listNamespaces());
                return true;
            }
            case "USE_COLLECTION": {
                db.useCollection(args[1]);
                console.log(
                    `[Daendels] Active collection: '${args[1]}'.`
                );
                return true;
            }
            case "COLLECTIONS": {
                console.table(db.listCollections());
                return true;
            }
            case "CREATE_COLLECTION": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const name = args[1];

                db.createCollection(name);
                console.log(
                    `[Daendels] ${SUCCESS.CREATE_COLLECTION(name)}`
                );
                return true;
            }
            case "HAS_COLLECTION": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const name = args[1];

                const exists = db.hasCollection(name);

                console.log(exists);

                return true;
            }
            case "DROP_COLLECTION": {
                if (args.length < 2) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }

                const name = args[1];

                db.dropCollection(name);
                console.log(
                    `[Daendels] ${SUCCESS.DROP_COLLECTION(name)}`
                );
                return true;
            }
            case "SNAPSHOT": {
                db.snapshot();

                console.log(
                    `[Daendels] ${SUCCESS.SNAPSHOT}`
                );

                return true;
            }
            case "COMPACT": {
                db.compact();

                console.log(
                    `[Daendels] ${SUCCESS.COMPACT}`
                );

                return true;
            }
            case "BEGIN": {
                db.beginTransaction();

                console.log(
                    `[Daendels] ${SUCCESS.TRANSACTION_BEGIN}`
                );
        
                return true;
            }
            case "COMMIT": {
                db.commitTransaction();

                console.log(
                    `[Daendels] ${SUCCESS.TRANSACTION_COMMIT}`
                );

                return true;
            }
            case "ROLLBACK": {
                db.rollback();

                console.log(
                    `[Daendels] ${SUCCESS.ROLLBACK}`
                );

                return true;
            }
            case "HELP": {
                console.log(`
                    Available Commands

                    BUILD <key> <value>
                    INSPECT <key>
                    DEMOLISH <key>
                    SURVEY
                    RECON <field> <operator> <value>
                    FIND <prefix>
                    REPORT

                    USE_NAMESPACE <name>
                    NAMESPACES

                    USE_COLLECTION <collection>
                    COLLECTIONS
                    CREATE_COLLECTION <name>
                    HAS_COLLECTION <name>
                    DROP_COLLECTION <name>

                    SNAPSHOT
                    COMPACT

                    BEGIN
                    COMMIT
                    ROLLBACK

                    HELP
                    EXIT
                `);
                return true;
            }
            case "EXIT": {
                console.log(
                    `[Daendels] ${SUCCESS.EXIT}`
                );
                rl.close();
                return false;
            }
            default: {
                console.log(
                    `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                );
                return true;
            }
        }
    } catch(err){
        console.error(err.message);
        return true;
    }
}
module.exports = startCLI;