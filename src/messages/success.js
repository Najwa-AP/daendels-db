const SUCCESS = {
    BUILD: (key) =>
        `Post road established successfully for key '${key}'.`,
    DEMOLISH: (key) => 
        `Outpost '${key}' has been demolished.`,
    INSPECT:
        "Inspection completed.",
    SURVEY:
        "Survey completed.",
    SNAPSHOT:
        "Road network successfully archived.",
    STATS:
        "Logistics report generated.",
    EXIT:
        "Shutting down database engine..."
};

module.exports = SUCCESS