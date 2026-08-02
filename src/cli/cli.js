const readline = require("readline");
const DaendelsDB = require("../database/DaendelsDB");
const SUCCESS = require("../messages/success");
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
    Version : 0.3
    Storage : In-Memory + Append Log

    Type HELP for available commands.
    =====================================
    `);

    rl.setPrompt("daendels> ");
    rl.prompt();
}

function executeCommand(command, args, rl) {
    try {
        switch (command) {
            case "BUILD":
                if (args.length < 3) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }
                db.build(args[1], args[2]);
                console.log(
                    `[Daendels] ${SUCCESS.BUILD(args[1])}`
                );
                return true;
            case "INSPECT":
                if (args.length < 3) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }
                console.log(db.inspect(args[1]));
                console.log(
                    `[Daendels] ${SUCCESS.INSPECT}`
                );
                return true;
            case "DEMOLISH":
                if (args.length < 3) {
                    console.log(
                        `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                    );
                    return true;
                }
                db.demolish(args[1]);
                console.log(
                    `[Daendels] ${SUCCESS.DEMOLISH(args[1])}`
                );
                return true;
            case "SURVEY":
                console.table(db.survey());
                console.log(
                    `[Daendels] ${SUCCESS.SURVEY}`
                );
                return true;
            case "STATS":
                console.table(db.stats());
                console.log(
                    `[Daendels] ${SUCCESS.STATS}`
                );
                return true;
            case "HELP":
                console.log(`
                    Available Commands

                    BUILD <key> <value>
                    INSPECT <key>
                    DEMOLISH <key>
                    SURVEY
                    STATS
                    HELP
                    EXIT
                `);
                return true;
            case "EXIT":
                console.log(
                    `[Daendels] ${SUCCESS.EXIT}`
                );
                rl.close();
                return false;
            default:
                console.log(
                    `[Daendels] ${ERROR.INVALID_ARGUMENT}`
                );
                return true;
        }
    } catch(err){
        console.error(err.message);
        return true;
    }
}
module.exports = startCLI;