const ERROR = {
    EMPTY_KEY: 
        "Key must not be empty.",
    EMPTY_VALUE:
        "Value must not be empty.",
    INVALID_KEY_TYPE:
        "Key type must be string.",
    INVALID_VALUE_TYPE:
        "Unsupported value type.",
    KEY_NOT_FOUND: (key) => 
        `Key '${key}' not found along the post road.`,
    UNKNOWN_COMMAND:
        "Unknown command.",
    INVALID_ARGUMENT:
        "Invalid command arguments.",
    INVALID_OPERATOR:
        "Invalid operator arguments.",
    COLLECTION_EXISTS: (name) =>
        `Collection '${name}' already exists.`,
    COLLECTION_NOT_FOUND: (name) =>
    `Collection '${name}' not found.`,
};

module.exports = ERROR