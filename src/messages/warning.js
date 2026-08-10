const WARNING = {

    CORRUPTED_LOG: (line) =>
        `[Daendels] Corrupted log entry ignored: ${line}`,
    NO_MATCHING_RECORDS: (prefix) =>
        `[Daendels] No records found with prefix ${prefix}.`,

};

module.exports = WARNING;