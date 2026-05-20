# Implementation Plan: Biblia RVR1960 App

## Overview

This plan implements a premium, offline-first Android Bible reading app built with Flutter. The implementation follows Clean Architecture with feature-based modules, using Hive for local storage, Riverpod for state management, GoRouter for navigation, and freezed for immutable models. Tasks are ordered to build foundational layers first (core, data models, database initialization), then feature modules (bible reading, search, favorites, notes), and finally UI polish (theming, home screen, image sharing).

## Tasks

- [x] 1. Set up Flutter project structure and core dependencies
  - [x] 1.1 Create Flutter project with directory structure and dependencies
    - Initialize Flutter project with `flutter create` targeting Android
    - Add all dependencies to `pubspec.yaml`: hive, hive_flutter, flutter_riverpod, riverpod_annotation, go_router, go_router_builder, freezed, freezed_annotation, json_serializable, json_annotation, share_plus, path_provider, google_fonts, build_runner, riverpod_generator
    - Create directory structure: `lib/core/`, `lib/shared/`, `lib/features/` with sub-directories for bible, search, favorites, notes, home, settings, share — each containing `data/`, `domain/`, `presentation/`
    - Create `lib/core/constants/`, `lib/core/services/`, `lib/core/theme/`, `lib/core/router/`, `lib/core/utils/`
    - Create `lib/shared/widgets/`, `lib/shared/extensions/`
    - Create `test/unit/`, `test/property/`, `test/widget/`, `test/integration/`
    - _Requirements: 12.1, 12.6_

  - [x] 1.2 Define core domain entities with freezed
    - Create `lib/features/bible/domain/entities/book.dart` with `Book` freezed class and `Testament` enum
    - Create `lib/features/bible/domain/entities/chapter.dart` with `Chapter` freezed class
    - Create `lib/features/bible/domain/entities/verse.dart` with `Verse` freezed class
    - Create `lib/shared/entities/verse_reference.dart` with `VerseReference` freezed class
    - Create `lib/features/search/domain/entities/search_result.dart` with `SearchResult` freezed class
    - Create `lib/features/bible/domain/entities/reading_position.dart` with `ReadingPosition` freezed class
    - Create `lib/features/settings/domain/entities/theme_settings.dart` with `ThemeSettings` freezed class, `AppTypeface` enum
    - Create `lib/features/favorites/domain/entities/favorite.dart` with `Favorite` freezed class
    - Create `lib/features/notes/domain/entities/note.dart` with `Note` freezed class
    - Create `lib/core/error/app_error.dart` with `AppError` and `Result<T>` freezed sealed classes
    - Run `dart run build_runner build` to generate freezed code
    - _Requirements: 12.5_

  - [x] 1.3 Define Hive data models and type adapters
    - Create `lib/features/bible/data/models/book_model.dart` with `BookModel` HiveType(typeId: 0)
    - Create `lib/features/bible/data/models/chapter_model.dart` with `ChapterModel` HiveType(typeId: 1) containing `List<VerseModel>`
    - Create `lib/features/bible/data/models/verse_model.dart` with `VerseModel` HiveType(typeId: 2)
    - Create `lib/features/favorites/data/models/favorite_model.dart` with `FavoriteModel` HiveType(typeId: 3)
    - Create `lib/features/notes/data/models/note_model.dart` with `NoteModel` HiveType(typeId: 4)
    - Create `lib/features/search/data/models/search_index_entry.dart` with `SearchIndexEntry` HiveType(typeId: 5)
    - Run `dart run build_runner build` to generate Hive adapters
    - _Requirements: 12.4, 12.5_

  - [x] 1.4 Create core utility classes
    - Create `lib/core/utils/text_normalizer.dart` with accent removal (á→a, é→e, í→i, ó→o, ú→u, ñ→n), lowercase normalization, and idempotent behavior
    - Create `lib/core/utils/date_utils.dart` with deterministic verse-of-the-day seed algorithm using date as input
    - Create `lib/core/constants/bible_constants.dart` with book names, chapter counts for all 66 books, and canonical ordering
    - Create `lib/core/constants/app_constants.dart` with timeouts, limits (max search results 100, max note length 2000, min search length 3, max favorites 1000, max search query 100 chars)
    - Create `lib/shared/extensions/string_extensions.dart` with helper extensions
    - _Requirements: 3.8, 6.2, 12.6_

- [x] 2. Implement Bible data layer and initialization
  - [x] 2.1 Create Bible repository interface and local data source
    - Create `lib/features/bible/domain/repositories/bible_repository.dart` with abstract `BibleRepository` interface (getAllBooks, getBook, getChapter, getAdjacentChapters, getTotalVerseCount)
    - Create `lib/features/bible/data/datasources/bible_local_datasource.dart` with abstract `BibleLocalDataSource` interface (initialize, isInitialized, getAllBooks, getBook, getChapter, getAdjacentChapters, getTotalVerseCount)
    - Create `lib/features/bible/data/repositories/bible_repository_impl.dart` implementing `BibleRepository` using `BibleLocalDataSource`
    - _Requirements: 12.7, 1.1_

  - [x] 2.2 Implement Bible local data source with Hive
    - Implement `BibleLocalDataSource` concrete class using Hive boxes (books_box non-lazy, chapters_box lazy)
    - Implement `getChapter` to load only the requested chapter by composite key `"{bookId}_{chapterNum}"`
    - Implement `getAdjacentChapters` to pre-fetch N-1 and N+1 chapters
    - Implement `getAllBooks` returning all 66 books from books_box
    - Implement `isInitialized` checking books_box has exactly 66 entries
    - _Requirements: 1.1, 1.2, 10.4_

  - [x] 2.3 Implement database initialization service
    - Create `lib/features/bible/data/datasources/bible_init_service.dart`
    - Implement loading `rvr1960.json` from bundled assets
    - Parse JSON in a separate Isolate to avoid blocking the UI thread
    - Batch write 66 books to books_box, 1,189 chapters to chapters_box
    - Verify counts after initialization: exactly 66 books, 1,189 chapters, 31,102 verses
    - Handle initialization failures (insufficient storage, corrupted assets) with appropriate `AppError`
    - _Requirements: 1.5, 1.6, 1.7_

  - [x] 2.4 Create bundled Bible JSON asset
    - Create `lib/assets/bible/rvr1960.json` with the complete RVR1960 Bible data in the specified JSON format (66 books, 1189 chapters, 31102 verses)
    - Register asset path in `pubspec.yaml` under `flutter: assets:`
    - _Requirements: 1.1, 1.4_

  - [x]* 2.5 Write property test for chapter data isolation (Property 1)
    - **Property 1: Chapter data isolation and completeness**
    - Test that loading any chapter returns verses in sequential order (1, 2, ..., N) with no verses from other chapters
    - **Validates: Requirements 1.2, 2.3**

  - [x]* 2.6 Write property test for book chapter count correctness (Property 2)
    - **Property 2: Book chapter count correctness**
    - Test that each book's chapter list length equals the known chapter count
    - **Validates: Requirements 2.2**

- [x] 3. Implement Bible reading and navigation
  - [x] 3.1 Create Bible use cases
    - Create `lib/features/bible/domain/usecases/get_books.dart` — returns all 66 books organized by OT/NT
    - Create `lib/features/bible/domain/usecases/get_chapter.dart` — loads a chapter by bookId and chapterNum
    - Create `lib/features/bible/domain/usecases/get_adjacent_chapter.dart` — resolves next/previous chapter including cross-book transitions and boundary detection (Genesis 1 / Revelation 22)
    - _Requirements: 2.1, 2.3, 2.5, 2.6, 2.7_

  - [x] 3.2 Implement reading position persistence
    - Create `lib/features/bible/data/datasources/reading_position_datasource.dart` using preferences_box in Hive
    - Implement save/load of `ReadingPosition` (bookId, chapter, scrollOffset)
    - Create `lib/features/bible/presentation/providers/reading_position_provider.dart` as a Riverpod NotifierProvider
    - Auto-save position on chapter change and app background
    - Restore position on app launch; default to Genesis 1 if none exists
    - _Requirements: 2.8, 2.9_

  - [x] 3.3 Create Bible Riverpod providers
    - Create `lib/features/bible/presentation/providers/bible_providers.dart`
    - Implement `bibleProvider` (FutureProvider) for loading all books
    - Implement `chapterProvider` (FutureProvider.family) parameterized by (bookId, chapterNum)
    - Implement adjacent chapter pre-fetching logic in provider
    - _Requirements: 12.2, 10.4_

  - [x] 3.4 Build Reader screen with swipe navigation
    - Create `lib/features/bible/presentation/screens/reader_screen.dart`
    - Implement virtualized list rendering for verses (max 3 screens in render tree)
    - Implement left/right swipe with `PageView` for chapter transitions with smooth animation
    - Handle boundary conditions: no transition at Genesis 1 (right swipe) or Revelation last chapter (left swipe) with visual indicator
    - Render chapter text within 100ms target
    - Maintain 60fps scrolling
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 10.1, 10.5_

  - [x] 3.5 Build Book selector and chapter grid screens
    - Create `lib/features/bible/presentation/screens/book_selector_screen.dart` with OT/NT tabs showing all 66 books
    - Create `lib/features/bible/presentation/widgets/chapter_grid.dart` displaying chapters as a tappable grid
    - Implement quick chapter selector overlay for direct jump within current book
    - _Requirements: 2.1, 2.2, 2.10_

  - [x] 3.6 Implement verse tap interaction and contextual actions
    - Create `lib/features/bible/presentation/widgets/verse_tile.dart`
    - Implement verse tap to highlight and show contextual action bar (favorite, note, share)
    - Dismiss highlight on tap outside or action selection
    - Display favorite indicator (filled icon) and note indicator on verses
    - _Requirements: 2.11, 4.5, 5.4_

  - [x]* 3.7 Write property test for adjacent chapter navigation (Property 3)
    - **Property 3: Adjacent chapter navigation resolution**
    - Test that next/previous chapter resolution is correct for all non-boundary positions
    - **Validates: Requirements 2.5, 2.6**

  - [x]* 3.8 Write property test for reading position persistence (Property 4)
    - **Property 4: Reading position persistence round-trip**
    - Test that saving and loading a reading position returns identical values
    - **Validates: Requirements 2.8**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement search feature
  - [x] 5.1 Build inverted index during initialization
    - Extend `bible_init_service.dart` to build the search index in an Isolate after Bible data is written
    - Normalize all verse text (lowercase, strip accents)
    - Tokenize on whitespace/punctuation, index tokens ≥ 3 characters
    - Generate suffix tokens for partial matching (prefixes of length ≥ 4 for words ≥ 4 chars)
    - Store in `search_index_box`: key = normalized token, value = `SearchIndexEntry` (lists of bookIds, chapters, verses)
    - _Requirements: 3.3, 3.9_

  - [x] 5.2 Create search repository and use case
    - Create `lib/features/search/domain/repositories/search_repository.dart` with abstract interface (search, buildIndex, isIndexReady)
    - Create `lib/features/search/data/repositories/search_repository_impl.dart` implementing search logic
    - Implement query validation (≥ 3 chars, ≤ 100 chars)
    - Implement accent-insensitive search via normalization
    - Implement multi-word search via posting list intersection
    - Sort results by canonical book order, limit to 100 results, report total match count
    - Create `lib/features/search/domain/usecases/search_verses.dart`
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.8, 3.9, 3.11_

  - [x] 5.3 Build search screen and UI
    - Create `lib/features/search/presentation/providers/search_providers.dart` with debounced FutureProvider.family (150ms debounce)
    - Create `lib/features/search/presentation/screens/search_screen.dart`
    - Display results grouped by book in canonical order with verse reference and ±40 chars context
    - Highlight matching terms in results
    - Show minimum query length message for < 3 chars
    - Show empty state for zero results with spelling suggestions
    - Navigate to Reader on result tap
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.7, 3.10_

  - [x]* 5.4 Write property tests for search (Properties 5, 6, 7, 8, 9)
    - **Property 5: Search returns matching verses** — Validates: Requirements 3.1
    - **Property 6: Search rejects short queries** — Validates: Requirements 3.2
    - **Property 7: Search results ordering and limits** — Validates: Requirements 3.5, 3.6
    - **Property 8: Accent normalization equivalence** — Validates: Requirements 3.8
    - **Property 9: Partial word matching** — Validates: Requirements 3.9

- [x] 6. Implement favorites feature
  - [x] 6.1 Create favorites repository and use case
    - Create `lib/features/favorites/domain/repositories/favorites_repository.dart` with abstract interface (toggleFavorite, isFavorite, getAllFavorites, removeFavorite, watchFavorites)
    - Create `lib/features/favorites/data/datasources/favorites_local_datasource.dart` using favorites_box (non-lazy)
    - Create `lib/features/favorites/data/repositories/favorites_repository_impl.dart`
    - Implement toggle behavior (mark if not favorite, remove if already favorite)
    - Implement getAllFavorites sorted by addedAt descending, max 1000
    - Handle storage errors gracefully preserving previous state
    - Create `lib/features/favorites/domain/usecases/toggle_favorite.dart`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.9_

  - [x] 6.2 Build favorites screen and providers
    - Create `lib/features/favorites/presentation/providers/favorites_providers.dart` with StreamProvider for reactive updates
    - Create `lib/features/favorites/presentation/screens/favorites_screen.dart`
    - Display favorites list sorted by date added (most recent first)
    - Navigate to Reader on favorite tap
    - Show empty state with instructions on how to add favorites
    - _Requirements: 4.4, 4.5, 4.6, 4.8_

  - [x]* 6.3 Write property tests for favorites (Properties 10, 11)
    - **Property 10: Favorites toggle round-trip** — Validates: Requirements 4.1, 4.2, 4.3, 4.7
    - **Property 11: Favorites sorted by date** — Validates: Requirements 4.4

- [x] 7. Implement notes feature
  - [x] 7.1 Create notes repository and use case
    - Create `lib/features/notes/domain/repositories/notes_repository.dart` with abstract interface (saveNote, updateNote, deleteNote, getNote, getAllNotes, watchNotes)
    - Create `lib/features/notes/data/datasources/notes_local_datasource.dart` using notes_box (non-lazy)
    - Create `lib/features/notes/data/repositories/notes_repository_impl.dart`
    - Implement note text validation (1-2000 characters)
    - Implement getAllNotes sorted by modifiedAt descending
    - Implement delete with confirmation flow support
    - Create `lib/features/notes/domain/usecases/manage_notes.dart`
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.7, 5.8, 5.9, 5.10_

  - [x] 7.2 Build notes screen and editor
    - Create `lib/features/notes/presentation/providers/notes_providers.dart` with StreamProvider
    - Create `lib/features/notes/presentation/screens/notes_screen.dart` — list view sorted by last modified
    - Create note editor dialog/bottom sheet with character count and validation
    - Navigate to Reader on note tap
    - Implement delete confirmation dialog
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.10_

  - [x]* 7.3 Write property tests for notes (Properties 12, 13, 14)
    - **Property 12: Notes CRUD round-trip** — Validates: Requirements 5.1, 5.2, 5.3, 5.9
    - **Property 13: Notes sorted by modification date** — Validates: Requirements 5.5
    - **Property 14: Note text length validation** — Validates: Requirements 5.7, 5.8

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement verse of the day and home screen
  - [x] 9.1 Implement verse of the day logic
    - Create `lib/features/home/data/datasources/votd_datasource.dart` with a pre-bundled pool of at least 365 curated verse references
    - Create `lib/features/home/domain/usecases/get_verse_of_day.dart` using deterministic date-based seed algorithm from `date_utils.dart`
    - Ensure different verse each day within 365-day cycle, no repeats
    - Implement display truncation: if text > 500 chars, truncate with ellipsis for display; share uses full text
    - Include verse text, book name, chapter, verse number in display model
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.7_

  - [x] 9.2 Build home screen
    - Create `lib/features/home/presentation/providers/home_providers.dart`
    - Create `lib/features/home/presentation/screens/home_screen.dart`
    - Display verse of the day at top (tap navigates to Reader)
    - Display "continue reading" card with last book/chapter/verse (tap navigates to Reader)
    - Display shortcut elements for Search, Favorites, Notes
    - Show welcome message with Genesis 1:1 prompt if no reading history
    - Show placeholder if verse of the day unavailable
    - Load all content within 500ms target
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 9.3 Implement verse of the day share action
    - Add share button on verse of the day card
    - Invoke device share sheet with verse text, reference (book chapter:verse), and "RVR1960" attribution
    - _Requirements: 6.6_

  - [x]* 9.4 Write property tests for verse of the day (Properties 15, 16, 17)
    - **Property 15: Verse of the day determinism and uniqueness** — Validates: Requirements 6.2
    - **Property 16: Verse of the day content completeness** — Validates: Requirements 6.5, 6.6
    - **Property 17: Verse of the day display truncation** — Validates: Requirements 6.7

- [x] 10. Implement theme engine and settings
  - [x] 10.1 Create Material 3 theme configuration
    - Create `lib/core/theme/color_schemes.dart` with light and dark ColorScheme tokens (primary, secondary, tertiary, surface, error, on-surface)
    - Create `lib/core/theme/typography.dart` with 4+ distinct text styles (headlineLarge, headlineMedium, bodyLarge, bodySmall, labelMedium) using base font size
    - Create `lib/core/theme/app_theme.dart` building ThemeData from color schemes and typography
    - _Requirements: 7.1, 11.1, 11.5_

  - [x] 10.2 Implement theme and typography settings persistence
    - Create `lib/features/settings/data/datasources/settings_local_datasource.dart` using preferences_box
    - Create `lib/features/settings/domain/repositories/settings_repository.dart` abstract interface
    - Create `lib/features/settings/data/repositories/settings_repository_impl.dart`
    - Implement save/load for theme mode (light/dark/system), font size (14-28sp, increments of 2), typeface (serif/sansSerif/lora)
    - Default to system theme on first launch if available, otherwise light theme with 16sp sans-serif
    - _Requirements: 7.3, 7.4, 7.5, 7.7, 7.8, 7.9_

  - [x] 10.3 Build settings screen with theme controls
    - Create `lib/features/settings/presentation/providers/theme_provider.dart` as NotifierProvider
    - Create `lib/features/settings/presentation/screens/settings_screen.dart`
    - Implement theme toggle (light/dark/system) with immediate application (<100ms)
    - Implement font size slider (14-28sp, step 2)
    - Implement typeface selector (Merriweather serif, Inter sans-serif, Lora)
    - Apply font changes to Reader immediately without navigation (<200ms)
    - _Requirements: 7.2, 7.4, 7.5, 7.6_

  - [x]* 10.4 Write property tests for theme settings (Properties 18, 19)
    - **Property 18: Theme and typography settings persistence round-trip** — Validates: Requirements 7.3, 7.7
    - **Property 19: Font size validation** — Validates: Requirements 7.4

- [x] 11. Implement share verse as image
  - [x] 11.1 Create image generator service
    - Create `lib/features/share/domain/services/image_generator_service.dart` abstract interface
    - Create `lib/features/share/data/services/image_generator_impl.dart`
    - Implement offscreen rendering using `RepaintBoundary` and `dart:ui` at 1080x1080 pixels PNG
    - Implement 3 background styles: minimalist (solid surface color), gradient (primary/tertiary linear gradient), textured (paper texture overlay)
    - Apply current app typeface to verse text
    - Add "RVR1960" watermark at bottom-right corner, 30% opacity
    - Implement proportional font size reduction for verse text > 300 characters
    - Handle generation failures gracefully (return AppError, no share sheet)
    - Target render time < 2 seconds
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7, 8.8, 8.9_

  - [x] 11.2 Build share flow with style selection
    - Create `lib/features/share/presentation/providers/share_providers.dart`
    - Create share bottom sheet UI with 3 style options (minimalist, gradient, textured)
    - Generate image on style selection
    - Save to temp directory via path_provider
    - Invoke Android system share sheet via share_plus
    - Show error snackbar if generation fails
    - _Requirements: 8.1, 8.3, 8.5, 8.9_

  - [x]* 11.3 Write property tests for image generation (Properties 20, 21)
    - **Property 20: Image generation produces valid output** — Validates: Requirements 8.1, 8.2
    - **Property 21: Long verse text image fitting** — Validates: Requirements 8.8

- [x] 12. Implement navigation and app shell
  - [x] 12.1 Configure GoRouter with TypedGoRoute definitions
    - Create `lib/core/router/routes.dart` with all TypedGoRoute definitions (HomeRoute, BibleRoute, ReaderRoute, SearchRoute, FavoritesRoute, NotesRoute, SettingsRoute)
    - Create `lib/core/router/app_router.dart` with GoRouter configuration and StatefulShellRoute for bottom navigation
    - Implement bottom navigation bar with 4 destinations: Home, Bible, Search, Settings
    - Run code generation for go_router_builder
    - _Requirements: 12.3, 11.4_

  - [x] 12.2 Create app entry point and initialization flow
    - Create `lib/main.dart` with Hive initialization, adapter registration, and ProviderScope
    - Create `lib/app.dart` with MaterialApp.router using GoRouter and theme from ThemeProvider
    - Implement initialization screen showing progress during first-time database setup
    - Show full-screen error with retry if initialization fails
    - Block navigation to reader until database is ready
    - _Requirements: 1.5, 1.6, 10.3_

- [x] 13. Implement UI polish and shared widgets
  - [x] 13.1 Create shared UI components
    - Create `lib/shared/widgets/skeleton_loader.dart` for async content loading placeholders (shown when load > 300ms)
    - Create `lib/shared/widgets/empty_state.dart` reusable empty state component
    - Create `lib/shared/widgets/error_state.dart` reusable error state component
    - Implement consistent spacing (8dp grid), border radius (12-16dp), elevation shadows (1-4dp)
    - Implement smooth animations (200-400ms) for screen transitions that don't block input
    - _Requirements: 11.2, 11.3, 11.6_

  - [x] 13.2 Wire all features together and verify navigation flows
    - Connect all feature modules in `app.module` / main providers
    - Verify bottom navigation switches between Home, Bible, Search, Settings
    - Verify deep navigation: book selector → chapter grid → reader → verse actions
    - Verify favorites and notes accessible from both shortcuts and verse actions
    - Ensure no orphaned or hanging code — all components integrated
    - _Requirements: 9.4, 11.4, 12.8, 12.9_

  - [x]* 13.3 Write property tests for continue reading and pre-fetch (Properties 22, 23)
    - **Property 22: Continue reading card correctness** — Validates: Requirements 9.2
    - **Property 23: Pre-fetch strategy correctness** — Validates: Requirements 10.4

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app uses Dart/Flutter as specified in the design — all code examples use Dart
- The bundled `rvr1960.json` asset is critical and must contain the complete Bible text (task 2.4)
- Database initialization runs in an Isolate to avoid blocking the UI thread
- All Hive boxes follow the lazy/non-lazy strategy defined in the design

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["2.1", "2.4"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.5", "2.6", "3.1", "3.2"] },
    { "id": 5, "tasks": ["3.3", "3.4", "3.5", "3.6"] },
    { "id": 6, "tasks": ["3.7", "3.8", "5.1"] },
    { "id": 7, "tasks": ["5.2", "6.1", "7.1"] },
    { "id": 8, "tasks": ["5.3", "5.4", "6.2", "6.3", "7.2", "7.3"] },
    { "id": 9, "tasks": ["9.1", "10.1", "10.2"] },
    { "id": 10, "tasks": ["9.2", "9.3", "9.4", "10.3", "10.4"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["11.2", "11.3", "12.1"] },
    { "id": 13, "tasks": ["12.2", "13.1"] },
    { "id": 14, "tasks": ["13.2", "13.3"] }
  ]
}
```
