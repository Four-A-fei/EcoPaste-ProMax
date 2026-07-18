<div align="center">
  <img src="./public/logo.png" alt="EcoPasteProMax" width="96" height="96" />

  # EcoPasteProMax

  **A local-first clipboard manager for macOS and Windows.**

  English | [简体中文](./README.zh-CN.md)

  <br />

  <img alt="Tauri v2" src="https://img.shields.io/badge/Tauri-v2-24c8db?style=flat-square" />
  <img alt="Rust first" src="https://img.shields.io/badge/Rust-first-b7410e?style=flat-square" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square" />
  <img alt="macOS" src="https://img.shields.io/badge/macOS-supported-000000?style=flat-square&logo=apple&logoColor=white" />
  <img alt="Windows" src="https://img.shields.io/badge/Windows-supported-0078d4?style=flat-square&logo=windows&logoColor=white" />
</div>

## About

EcoPasteProMax is an open-source desktop clipboard manager based on the Rust-first EcoPaste refactor: durable behavior lives in Rust, while the React frontend focuses on rendering and interaction.

The rewrite is designed for a faster, lighter, and more maintainable app with local storage, SQLite search, native shortcuts, tray integration, backup support, and a focused cross-platform surface for macOS and Windows.

## Project Status

The current local build version is `1.0.1`.

Before trying this version, back up important data from any older EcoPaste installation. The refactor changes the runtime architecture, settings model, storage layout, and database schema, so legacy data compatibility is not guaranteed unless a migration path is explicitly provided.

## Platform Scope

The Rust-first refactor supports macOS and Windows only.

Linux support from the legacy EcoPaste app has been dropped in this refactor, and there are no current plans to support Linux again. Please use the legacy release line if you need Linux support.

## Feature Tour

### Clipboard Capture

EcoPasteProMax automatically captures clipboard content such as plain text, HTML, RTF, images, files, and folders, then keeps the history local so it can be found and reused later.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/01-clipboard-capture.svg" alt="Clipboard capture illustration" width="720" />
</p>

### Search and Filtering

History supports SQLite FTS5 full-text search across clipboard content and notes. Results can also be narrowed by source app, content type, custom group, favorite state, and date.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/02-search-filter.svg" alt="Search and filtering illustration" width="720" />
</p>

### Quick Reuse

Records can be pasted, copied, copied as plain text, opened as links, revealed in the file system, or dragged out to other apps, so reusable content stays close at hand.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/03-quick-reuse.svg" alt="Quick reuse illustration" width="720" />
</p>

### Content Management

Favorites, pinned items, notes, custom groups, and configurable quick actions help separate temporary history from frequently used or important material.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/04-content-management.svg" alt="Content management illustration" width="720" />
</p>

### Dedicated Preview

Text, image, and file records can be inspected in a dedicated preview window before reuse, reducing accidental selection and repeated file opening.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/05-preview.svg" alt="Dedicated preview illustration" width="720" />
</p>

### Privacy and Safety

EcoPasteProMax detects and skips high-confidence sensitive content such as private keys, service tokens, AWS keys, and JWTs, reducing the risk of writing secrets into history.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/06-privacy-security.svg" alt="Privacy and safety illustration" width="720" />
</p>

### Window and Shortcut Experience

The clipboard panel can be opened with a shortcut. The current panel places All, Favorites, and custom groups in a left sidebar, while keeping Tab and Shift+Tab keyboard filtering flows.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/07-window-shortcuts.svg" alt="Window and shortcut illustration" width="720" />
</p>

### Date Filtering

Date filtering shows a month view with markers on days that contain clipboard records. Selecting a day immediately filters the history for that date.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/08-date-filter.svg" alt="Date filtering illustration" width="720" />
</p>

### Backup and Migration

EcoPasteProMax can export and import `.ecopastebak` backup files, including encrypted backups, so important data can be kept across reinstalls, migrations, or recovery.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/09-backup-migration.svg" alt="Backup and migration illustration" width="720" />
</p>

### Settings and Localization

Capture order, size limits, retention, display density, list sorting, window behavior, theme, language, and system entry points can be tuned to match each user's workflow.

<p align="center">
  <img src="./assets/ecopastepromax-feature-illustrations/10-settings-localization.svg" alt="Settings and localization illustration" width="720" />
</p>

## Recent 1.0.1 Updates

- The clipboard panel now places All, Favorites, and custom groups in a left sidebar under the app icon, with Tab cycling through those groups.
- Content type filters are right-aligned with the More button area, and Shift+Tab cycles through no filter, text, image, and files.
- The panel opens on All by default, and the top search field is wider and better balanced between the app icon and pinned-window control.
- The previous group/filter strip is now a single-date filter with month navigation and marked days when clipboard content exists.
- Favorite items now show a bottom-right status mark in the All view, stacking with the pinned mark when both states apply.
- About now shows the Heizi special edition support row without the QR code, and the row height matches the other settings rows.

## Architecture

EcoPasteProMax uses a Rust-first Tauri architecture:

- `src-tauri/src/clipboard/` owns clipboard capture, content detection, writeback, source apps, resource storage, and loop suppression.
- `src-tauri/src/db/` owns SQLite repositories, models, migrations, and FTS search.
- `src-tauri/src/settings/`, `window/`, `shortcut/`, `tray/`, `menu/`, `autostart/`, and `backup/` own native behavior and persistent app state.
- `src/` contains the React UI, Ant Design components, UnoCSS styling, Valtio UI/settings mirrors, i18n resources, and typed Tauri command wrappers.

The frontend calls Rust through Tauri commands and receives refresh signals through namespaced events such as `clipboard://updated`, `settings://updated`, and `window://visibility`.

## Tech Stack

| Area | Stack |
| --- | --- |
| Desktop shell | Tauri v2 |
| Frontend | React 19, Ant Design 6, UnoCSS `presetWind4` |
| State | Valtio for UI state and settings mirrors |
| Backend | Rust, sqlx, SQLite |
| Build | Vite, pnpm |
| Quality | Biome, TypeScript, rustfmt, clippy, cargo test |

## Getting Started

### Prerequisites

- macOS or Windows.
- Node.js 20 or newer.
- pnpm 10 or newer.
- Rust toolchain from `rust-toolchain.toml` (`1.96.0`, with `rustfmt` and `clippy`).
- Native dependencies required by Tauri v2. See the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your operating system.

### Install

```bash
pnpm install
```

### Run in Development

```bash
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## Quality Checks

Frontend:

```bash
pnpm lint
pnpm tsc
```

Rust:

```bash
cd src-tauri
cargo fmt
cargo clippy -- -D warnings
cargo test
```

Format frontend files:

```bash
pnpm format
```

## Repository Layout

```text
src-tauri/
  src/
    commands/    # Tauri command entry points
    clipboard/   # clipboard read/write, capture, detection, storage
    db/          # SQLite repositories, models, migrations
    settings/    # settings model and persistence
    window/      # window state, positioning, lifecycle
    shortcut/    # global shortcuts
    tray/        # tray menu
    menu/        # item context menus
    backup/      # backup import/export
    i18n/        # Rust-side user-visible text
  migrations/
src/
  commands/      # typed Tauri invoke wrappers
  components/    # shared React components
  constants/     # mirrored cross-layer constants
  hooks/         # shared hooks
  locales/       # zh-CN and en-US translations
  pages/         # Clipboard, Preference, Preview, ContextMenu
  stores/        # Valtio UI state and settings mirrors
  types/         # TypeScript contract mirrors
```

## Contributing

Read [AGENTS.md](./AGENTS.md) before changing code. It is the source of truth for this refactor's architecture, platform scope, coding conventions, and quality expectations.

For user-visible feature changes in the next release, update [RELEASE-NEXT.md](./RELEASE-NEXT.md). Keep documentation aligned with the current version status and supported platforms.

## License

EcoPasteProMax is licensed under the [Apache License 2.0](./LICENSE).
