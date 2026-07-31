const readline = require("readline");
const DaendelsDB = require("../database/DaendelsDB");

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
    switch (command) {
        case "BUILD":
            console.log(db.build(args[1], args[2]));
            return true;
        case "INSPECT":
            console.log(db.inspect(args[1]));
            return true;
        case "DEMOLISH":
            console.log(db.demolish(args[1]));
            return true;
        case "SURVEY":
            console.table(db.survey());
            return true;
        case "STATS":
            console.table(db.stats());
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
            console.log("Shutting down DaendelsDB...");
            rl.close();
            return false;
        default:
            console.log("[Daendels] Unknown command");
            return true;
    }
}
module.exports = startCLI;