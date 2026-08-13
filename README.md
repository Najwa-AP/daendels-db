# DaendelsDB

> A lightweight append-only key-value database engine built from scratch using pure Node.js.

DaendelsDB is a learning project that explores how a simple database engine works internally without relying on third-party libraries. The project focuses on clean architecture, append-only persistence, and modular software engineering principles.

The project is inspired by **Herman Willem Daendels** and the historic **Great Post Road (Jalan Raya Pos)**, where every database operation is treated as a logistical record written permanently into an append-only log.

## Why DaendelsDB?

DaendelsDB was built as a software engineering learning project to understand how database engines work internally. 

Instead of relying on existing databases, every storage mechanism—including append-only logging, snapshot persistence, startup recovery, and command processing—is implemented from scratch using only Node.js built-in modules.

The project emphasizes clean architecture, modular design, and database internals rather than production-ready performance.

---

## Features

### Core Engine

- In-Memory storage using JavaScript `Map`
- Collection-based storage abstraction
- Namespace-based storage organization
- Append-only log persistence
- Collection- and namespace-aware append logs
- Snapshot persistence
- Snapshot-based startup recovery
- Append-log recovery
- Log compaction
- Primitive value parser
- Input validation layer
- Query filtering
- Modular message system

### Persistence

DaendelsDB uses a hybrid persistence strategy:

```
In-Memory Map
     │
     ├── Snapshot
     │      ↓
     │  snapshot.json
     │
     └── Append-Only Log
            ↓
        daendels.log
```

Snapshots provide a serialized representation of the current database state, while the append-only log records subsequent database operations.

---

## Storage Files

| File | Purpose |
|------|---------|
| daendels.log | Append-only operation log for durability |
| snapshot.json | Serialized collections used for fast startup recovery |

---

## Architecture

```
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
 ├── Namespace Manager 
 │    │
 │    └── Collection Manager
 │         │
 │         └── In-Memory Map
 |
 ├── Query Engine
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

## Data Hierarchy

DaendelsDB organizes data using namespaces and collections:

```
Namespace
   │
   └── Collection
          │
          └── Key
                │
                └── Value

For example:

military
 └── forts
      ├── anyer → west
      └── batavia → headquarters

economy
 └── taxes
      ├── vat → 11
      └── income → 5000
```

This provides logical separation between groups of collections and their records.

---

## Project Structure

```
daendels-db/

├── index.js
├── daendels.log
├── snapshot.json
├── package.json
├── README.md
│
└── src
    ├── cli
    │   └── cli.js   # Interactive command line interface
    │
    ├── database
    │   └── DaendelsDB.js   # Core database engine
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
| RECON `<key>` `<operator>` `<value>` | Filter records using a comparison |
| REPORT | Show database statistics |
| USE <collection> | Switch active collection |
| COLLECTIONS | List all collections |
| SNAPSHOT | Save current database state |
| COMPACT | Save snapshot and clear append log |
| HELP | Show available commands |
| EXIT | Close DaendelsDB |

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
- ✅ Append log with collection
- ✅ CLI collection commands
- ✅ Namespaces

### Version 0.8

- ✅ Query filtering
- ✅ Prefix search
- ✅ Collections API

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
- Separate the database engine from the presentation layer
- Avoid third-party dependencies
- Build core functionality using Node.js built-in modules
- Understand append-only storage engines
- Explore persistence and recovery mechanisms
- Understand collections and namespaces
- Learn basic query processing
- Maintain a modular and readable codebase

---

## Technologies

- JavaScript
- Node.js
- CommonJS Modules
- fs
- path
- readline

No third-party dependencies are used.

---

## License

MIT
