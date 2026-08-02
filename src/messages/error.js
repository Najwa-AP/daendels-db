const ERROR = {
    EMPTY_KEY: 
        "Key must not be empty.",
    EMPTY_VALUE:
        "Value must not be empty.",
    INVALID_KEY_TYPE:
        "Unsupported key type.",
    INVALID_VALUE_TYPE:
        "Unsupported value type.",
    KEY_NOT_FOUND: (key) => 
        `Key '${key}' not found along the post road.`,
    UNKNOWN_COMMAND:
        "Unknown command.",
    INVALID_ARGUMENT:
        "Invalid command arguments."
};

module.exports = ERROR