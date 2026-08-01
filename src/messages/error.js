const ERROR = {
    EMPTY_KEY: 
        "Key must not be empty.",
    EMPTY_KEY_VALUE: 
        "Key and value must not be empty.",
    KEY_NOT_FOUND: (key) => 
        `Key '${key}' not found along the post road.`,
    UNKNOWN_COMMAND:
        "Unknown command.",
    INVALID_ARGUMENT:
        "Invalid command arguments."
};

module.exports = ERROR