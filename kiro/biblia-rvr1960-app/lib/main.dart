import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'app.dart';
import 'features/bible/data/datasources/bible_local_datasource_impl.dart';
import 'features/bible/data/datasources/reading_position_datasource.dart';
import 'features/bible/data/models/book_model.dart';
import 'features/bible/data/models/chapter_model.dart';
import 'features/bible/data/models/verse_model.dart';
import 'features/bible/data/repositories/bible_repository_impl.dart';
import 'features/bible/presentation/providers/bible_providers.dart';
import 'features/bible/presentation/providers/reading_position_provider.dart';
import 'features/favorites/data/datasources/favorites_local_datasource.dart';
import 'features/favorites/data/models/favorite_model.dart';
import 'features/favorites/data/repositories/favorites_repository_impl.dart';
import 'features/favorites/presentation/providers/favorites_providers.dart';
import 'features/notes/data/datasources/notes_local_datasource.dart';
import 'features/notes/data/models/note_model.dart';
import 'features/notes/data/repositories/notes_repository_impl.dart';
import 'features/notes/presentation/providers/notes_providers.dart';
import 'features/search/data/models/search_index_entry.dart';
import 'features/search/data/repositories/search_repository_impl.dart';
import 'features/search/presentation/providers/search_providers.dart';
import 'features/settings/data/datasources/settings_local_datasource.dart';
import 'features/settings/data/repositories/settings_repository_impl.dart';
import 'features/settings/presentation/providers/theme_provider.dart';

/// Application entry point.
///
/// Initializes Hive, registers all type adapters, opens required boxes,
/// and creates the ProviderScope with concrete repository overrides.
///
/// Validates: Requirements 1.5, 1.6, 10.3
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for Flutter (uses app documents directory).
  await Hive.initFlutter();

  // Register all Hive type adapters.
  _registerAdapters();

  // Open all Hive boxes.
  final boxes = await _openBoxes();

  // Build provider overrides with concrete implementations.
  final overrides = _buildOverrides(boxes);

  runApp(
    ProviderScope(
      overrides: overrides,
      child: const BibliaApp(),
    ),
  );
}

/// Registers all Hive type adapters in the correct order.
///
/// Adapter type IDs:
/// - BookModel: 0
/// - ChapterModel: 1
/// - VerseModel: 2
/// - FavoriteModel: 3
/// - NoteModel: 4
/// - SearchIndexEntry: 5
void _registerAdapters() {
  Hive.registerAdapter(BookModelAdapter());
  Hive.registerAdapter(ChapterModelAdapter());
  Hive.registerAdapter(VerseModelAdapter());
  Hive.registerAdapter(FavoriteModelAdapter());
  Hive.registerAdapter(NoteModelAdapter());
  Hive.registerAdapter(SearchIndexEntryAdapter());
}

/// Container for all opened Hive boxes.
class _HiveBoxes {
  final Box<BookModel> booksBox;
  final LazyBox<ChapterModel> chaptersBox;
  final Box<FavoriteModel> favoritesBox;
  final Box<NoteModel> notesBox;
  final Box<dynamic> preferencesBox;
  final LazyBox<SearchIndexEntry> searchIndexBox;

  const _HiveBoxes({
    required this.booksBox,
    required this.chaptersBox,
    required this.favoritesBox,
    required this.notesBox,
    required this.preferencesBox,
    required this.searchIndexBox,
  });
}

/// Opens all required Hive boxes.
///
/// Non-lazy boxes (always in memory):
/// - books_box: 66 entries, needed for navigation
/// - favorites_box: user data, needed for indicator display
/// - notes_box: user data, needed for indicator display
/// - preferences_box: tiny, always needed
///
/// Lazy boxes (loaded on demand):
/// - chapters_box: 1,189 entries, loaded per chapter
/// - search_index_box: large index, loaded on search
Future<_HiveBoxes> _openBoxes() async {
  final results = await Future.wait([
    Hive.openBox<BookModel>('books_box'),
    Hive.openLazyBox<ChapterModel>('chapters_box'),
    Hive.openBox<FavoriteModel>('favorites_box'),
    Hive.openBox<NoteModel>('notes_box'),
    Hive.openBox<dynamic>('preferences_box'),
    Hive.openLazyBox<SearchIndexEntry>('search_index_box'),
  ]);

  return _HiveBoxes(
    booksBox: results[0] as Box<BookModel>,
    chaptersBox: results[1] as LazyBox<ChapterModel>,
    favoritesBox: results[2] as Box<FavoriteModel>,
    notesBox: results[3] as Box<NoteModel>,
    preferencesBox: results[4] as Box<dynamic>,
    searchIndexBox: results[5] as LazyBox<SearchIndexEntry>,
  );
}

/// Builds the list of provider overrides with concrete implementations.
List<Override> _buildOverrides(_HiveBoxes boxes) {
  // Create datasources
  final bibleLocalDataSource = BibleLocalDataSourceImpl(
    booksBox: boxes.booksBox,
    chaptersBox: boxes.chaptersBox,
  );

  final readingPositionDataSource = ReadingPositionDataSourceImpl(
    preferencesBox: boxes.preferencesBox,
  );

  final favoritesLocalDatasource = FavoritesLocalDatasource(boxes.favoritesBox);
  final notesLocalDatasource = NotesLocalDatasource(boxes.notesBox);

  final settingsLocalDataSource = SettingsLocalDataSourceImpl(
    preferencesBox: boxes.preferencesBox,
  );

  // Create repositories
  final bibleRepository = BibleRepositoryImpl(bibleLocalDataSource);
  final favoritesRepository = FavoritesRepositoryImpl(favoritesLocalDatasource);
  final notesRepository = NotesRepositoryImpl(notesLocalDatasource);
  final searchRepository = SearchRepositoryImpl(boxes.searchIndexBox);
  final settingsRepository = SettingsRepositoryImpl(
    dataSource: settingsLocalDataSource,
  );

  return [
    bibleRepositoryProvider.overrideWithValue(bibleRepository),
    readingPositionDataSourceProvider.overrideWithValue(readingPositionDataSource),
    favoritesRepositoryProvider.overrideWithValue(favoritesRepository),
    notesRepositoryProvider.overrideWithValue(notesRepository),
    searchRepositoryProvider.overrideWithValue(searchRepository),
    settingsRepositoryProvider.overrideWithValue(settingsRepository),
    // Expose boxes for initialization service usage
    booksBoxProvider.overrideWithValue(boxes.booksBox),
    chaptersBoxProvider.overrideWithValue(boxes.chaptersBox),
    searchIndexBoxProvider.overrideWithValue(boxes.searchIndexBox),
  ];
}

/// Provider for the books Hive box (used by initialization service).
final booksBoxProvider = Provider<Box<BookModel>>((ref) {
  throw UnimplementedError(
    'booksBoxProvider must be overridden in ProviderScope.',
  );
});

/// Provider for the chapters lazy Hive box (used by initialization service).
final chaptersBoxProvider = Provider<LazyBox<ChapterModel>>((ref) {
  throw UnimplementedError(
    'chaptersBoxProvider must be overridden in ProviderScope.',
  );
});

/// Provider for the search index lazy Hive box (used by initialization service).
final searchIndexBoxProvider = Provider<LazyBox<SearchIndexEntry>>((ref) {
  throw UnimplementedError(
    'searchIndexBoxProvider must be overridden in ProviderScope.',
  );
});
