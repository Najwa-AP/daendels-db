const { TRANSACTION_ACTIVE } = require("./error");

const SUCCESS = {
    BUILD: (key) =>
        `Post road established successfully for key '${key}'.`,
    INSPECT:
        "Inspection completed.",    
    DEMOLISH: (key) => 
        `Outpost '${key}' has been demolished.`,
    SURVEY:
        "Survey completed.",
    RECON:
        "Reconnaissance completed.",
    FIND:
        "The data has been find.",
    REPORT:
        "Logistics report generated.",
    SNAPSHOT:
        "Road network successfully archived.",
    COMPACT:
        "Logistics report successfully compacted.",
    TRANSACTION_BEGIN:
        "A new campaign has been initiated.",
    TRANSACTION_COMMIT:
        "The campaign has been secured and made permanent.",
    ROLLBACK:
        "The campaign has been withdrawn and previous positions restored.",
    EXIT:
        "Shutting down database engine...",
    CREATE_COLLECTION: (name) =>
        `Collection '${name}' has been established.`,
    DROP_COLLECTION: (name) =>
        `Collection '${name}' has been demolished.`,
};

module.exports = SUCCESS