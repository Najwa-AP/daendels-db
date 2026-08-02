const ERROR = {
    EMPTY_KEY: 
        "Key must not be empty.",
    EMPTY_VALUE:
        "Value must not be empty.",
    INVALID_KEY_TYPE:
        "Key must be a string.",
    INVALID_VALUE_TYPE:
        "Value must be a string.",
    KEY_NOT_FOUND: (key) => 
        `Key '${key}' not found along the post road.`,
    UNKNOWN_COMMAND:
        "Unknown command.",
    INVALID_ARGUMENT:
        "Invalid command arguments."
};

module.exports = ERROR