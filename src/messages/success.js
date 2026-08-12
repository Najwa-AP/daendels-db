const SUCCESS = {
    BUILD: (key) =>
        `Post road established successfully for key '${key}'.`,
    DEMOLISH: (key) => 
        `Outpost '${key}' has been demolished.`,
    INSPECT:
        "Inspection completed.",
    SURVEY:
        "Survey completed.",
    RECON:
        "Reconnaissance completed.",
    FIND:
        "The data has been find.",
    SNAPSHOT:
        "Road network successfully archived.",
    COMPACT:
        "Logistics report successfully compacted.",
    REPORT:
        "Logistics report generated.",
    EXIT:
        "Shutting down database engine...",
    CREATE_COLLECTION: (name) =>
        `Collection '${name}' has been established.`,
    DROP_COLLECTION: (name) =>
        `Collection '${name}' has been demolished.`,
};

module.exports = SUCCESS