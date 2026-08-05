# DaendelsDB

> A lightweight append-only key-value database engine built from scratch using pure Node.js.

DaendelsDB is a learning project that explores how a simple database engine works internally without relying on third-party libraries. The project focuses on clean architecture, append-only persistence, and modular software engineering principles.

The project is inspired by **Herman Willem Daendels** and the historic **Great Post Road (Jalan Raya Pos)**, where every database operation is treated as a logistical record written permanently into an append-only log.

## Why DaendelsDB?

DaendelsDB was built as a software engineering learning project to understand how database engines work internally. Instead of relying on existing databases, every storage mechanism—including append-only logging, snapshot persistence, startup recovery, and command processing—is implemented from scratch using only Node.js built-in modules.

The project emphasizes clean architecture, modular design, and database internals rather than production-ready performance.

---

## Features

### Core Engine

- In-Memory storage using JavaScript `Map`
- Append-only log persistence
- Snapshot persistence
- Compact log support
- Automatic recovery from snapshot and append log
- Primitive value parser
- Input validation layer
- Modular message system

### Interactive CLI

- Interactive command prompt
- HELP command
- EXIT command

## Storage Files

DaendelsDB persists data using two storage files.

| File | Purpose |
|------|---------|
| daendels.log | Append-only operation log |
| snapshot.json | Snapshot of the latest database state |

### Current Architecture

```text
CLI
 │
 ▼
Command Parser
 │
 ▼
Validation Layer
 │
 ▼
DaendelsDB Engine
 │
 ├── In-Memory Map
 │
 ├── Snapshot Manager
 │      │
 │      ▼
 │  snapshot.json
 │
 └── Append Log Manager
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
├── snapshot.json
├── package.json
├── README.md
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
| REPORT | Show database statistics |
| SNAPSHOT | Save current database state |
| HELP | Show available commands |
| EXIT | Close DaendelsDB |
| COMPACT | Save snapshot and clear append log |

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

- ✅ CLI parser
- ✅ Snapshot
- ✅ Compact Log

### Version 0.7

- ✅ Collection Abstraction
- ✅ Snapshot serialization
- ⏳ Append log with collection
- ⏳ CLI collection commands
- ⏳ Namespaces

### Version 0.8

- ⏳ Query filtering
- ⏳ Prefix search
- ⏳ Collections API

### Version 0.9

- ⏳ Transactions
- ⏳ Rollback

### Version 1.0

- ⏳ Secondary index
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
- Understand append-only storage engines
- Explore database persistence and recovery

---

## Built-in Modules

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
