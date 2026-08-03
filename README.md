# DaendelsDB

> A lightweight append-only key-value database engine written in pure Node.js.

DaendelsDB is a learning project that explores how a simple database engine works internally without relying on third-party libraries. The project focuses on clean architecture, append-only persistence, and modular software engineering principles.

The project is inspired by **Herman Willem Daendels** and the historic **Great Post Road (Jalan Raya Pos)**, where every database operation is treated as a logistical record written permanently into an append-only log.

---

## Features

### Core Engine

- In-Memory storage using JavaScript `Map`
- Append-Only Log persistence
- Automatic recovery from log file on startup
- Synchronous file persistence using Node.js built-in `fs`

### Database Commands

- BUILD (Insert / Update)
- INSPECT (Read)
- DEMOLISH (Delete)
- SURVEY (List all records)
- STATS (Database statistics)

### Interactive CLI

- Interactive command prompt
- HELP command
- EXIT command

### Current Architecture

```text
CLI
 │
 ▼
DaendelsDB Engine
 │
 ├── In-Memory Map
 ├── Validation Layer
 ├── Message Modules
 └── Append-Only Log
          │
          ▼
    daendels.log
```

---

## Project Structure

```text
daendels-db/

├── index.js
├── daendels.log
│
└── src
    ├── cli
    │   └── cli.js
    │
    ├── database
    │   └── DaendelsDB.js
    │
    └── messages
        ├── error.js
        ├── success.js
        └── warning.js
```

---

## Available Commands

| Command | Description |
|----------|-------------|
| BUILD `<key>` `<value>` | Create or update a record |
| INSPECT `<key>` | Retrieve a value |
| DEMOLISH `<key>` | Delete a record |
| SURVEY | Display all stored records |
| STATS | Show database statistics |
| HELP | Show available commands |
| EXIT | Close DaendelsDB |

---

## Storage Engine

DaendelsDB currently uses:

```
    RAM (Map)
        │
        ▼
BUILD / DEMOLISH
        │
        ▼
Append-Only Log
        │
        ▼
Recovery on Startup
```

This architecture is inspired by append-only storage engines used in databases such as Redis.

---

## Roadmap

### Version 0.1

- ✅ BUILD
- ✅ INSPECT
- ✅ Startup Recovery

### Version 0.2

- ✅ DEMOLISH
- ✅ SURVEY
- ✅ STATS

### Version 0.3

- ✅ Interactive CLI
- ✅ HELP
- ✅ EXIT

### Version 0.4

- ✅ Validation helpers
- ✅ ACTIONS constants
- ✅ Centralized message modules
- ✅ Error helper

### Version 0.5

- ✅ Key validation
- ✅ Value type validation
- ✅ Multiple value types

### Version 0.6

- ⏳ Snapshot
- ⏳ Compact Log

### Version 0.7

- ⏳ Collections
- ⏳ Namespaces

### Version 0.8

- ⏳ Query filtering
- ⏳ Prefix search
- ⏳ Secondary index

### Version 0.9

- ⏳ Transactions
- ⏳ Rollback

### Version 1.0

- ⏳ Configuration file
- ⏳ Unit tests
- ⏳ Benchmark
- ⏳ Documentation

---

## Design Goals

- Learn database internals
- Practice clean architecture
- Separate engine from presentation layer
- Avoid third-party dependencies
- Build everything using Node.js built-in modules

---

## Technologies

- JavaScript (Node.js)
- CommonJS Modules
- fs
- path
- readline

No external dependencies are used.

---

## Inspiration

This project is inspired by the logistics and infrastructure built during the administration of **Herman Willem Daendels**, particularly the concept of the **Great Post Road (Jalan Raya Pos)** as an analogy for an append-only persistence mechanism.

---

## License

MIT