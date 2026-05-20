# Biblia RVR1960

Premium offline-first Android Bible reading app for the Reina Valera 1960.

## Features

- Complete RVR1960 Bible offline
- Ultra-fast local search with inverted index
- Favorites and notes management
- Verse of the day
- Theme customization (light/dark, fonts, sizes)
- Share verses as styled images

## Architecture

Clean Architecture with feature-based modules:

- **lib/core/** — Constants, services, theme, router, utilities
- **lib/shared/** — Shared widgets and extensions
- **lib/features/** — Feature modules (bible, search, favorites, notes, home, settings, share)

Each feature follows the data/domain/presentation layer pattern.

## Tech Stack

- Flutter 3.22+ / Dart 3.4+
- Hive (local storage)
- Riverpod (state management)
- GoRouter (navigation)
- freezed (immutable models)
- share_plus (sharing)
- google_fonts (typography)

## Getting Started

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

## Testing

```bash
flutter test                    # All tests
flutter test test/unit/         # Unit tests
flutter test test/property/     # Property-based tests
flutter test test/widget/       # Widget tests
flutter test test/integration/  # Integration tests
```
