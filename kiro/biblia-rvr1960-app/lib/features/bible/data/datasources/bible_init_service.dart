import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:hive/hive.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../../search/data/datasources/search_index_builder.dart';
import '../../../search/data/models/search_index_entry.dart';
import '../models/book_model.dart';
import '../models/chapter_model.dart';
import '../models/verse_model.dart';

/// Result of parsing the Bible JSON in an isolate.
///
/// Contains the pre-built [BookModel] and [ChapterModel] lists ready
/// for batch writing to Hive boxes.
class _ParsedBibleData {
  final List<BookModel> books;
  final Map<String, ChapterModel> chapters;
  final int totalVerses;

  _ParsedBibleData({
    required this.books,
    required this.chapters,
    required this.totalVerses,
  });
}

/// Service responsible for initializing the Bible database from bundled assets.
///
/// Loads `rvr1960.json` from Flutter assets, parses it in a separate Isolate
/// to avoid blocking the UI thread, and batch writes all books and chapters
/// to their respective Hive boxes.
///
/// After writing, it verifies the expected counts:
/// - 66 books
/// - 1,189 chapters
/// - 31,102 total verses
class BibleInitService {
  /// The asset path for the bundled Bible JSON.
  static const String _assetPath = 'lib/assets/bible/rvr1960.json';

  /// Initializes the Bible database by loading and parsing the bundled JSON
  /// asset, then writing all data to Hive boxes.
  ///
  /// Returns [Result.success] with `true` on successful initialization,
  /// or [Result.failure] with an appropriate [AppError] on failure.
  ///
  /// The [booksBox] should be a non-lazy box for books (key: bookId int).
  /// The [chaptersBox] should be a lazy box for chapters (key: "{bookId}_{chapterNum}").
  /// The [searchIndexBox] should be a lazy box for the search index (key: normalized token).
  Future<Result<bool>> initialize({
    required Box<BookModel> booksBox,
    required LazyBox<ChapterModel> chaptersBox,
    LazyBox<SearchIndexEntry>? searchIndexBox,
  }) async {
    try {
      // Step 1: Load the raw JSON string from bundled assets.
      final String rawJson = await _loadAsset();

      // Step 2: Parse JSON in a separate Isolate to avoid blocking UI.
      final _ParsedBibleData parsedData = await compute(
        _parseJsonInIsolate,
        rawJson,
      );

      // Step 3: Validate parsed data before writing.
      final validationError = _validateParsedData(parsedData);
      if (validationError != null) {
        return Result.failure(validationError);
      }

      // Step 4: Batch write books to books_box.
      await _writeBooksToBox(booksBox, parsedData.books);

      // Step 5: Batch write chapters to chapters_box.
      await _writeChaptersToBox(chaptersBox, parsedData.chapters);

      // Step 6: Verify counts after writing.
      final verificationError = await _verifyCounts(booksBox, chaptersBox);
      if (verificationError != null) {
        return Result.failure(verificationError);
      }

      // Step 7: Build and write search index in an Isolate.
      if (searchIndexBox != null) {
        await _buildAndWriteSearchIndex(searchIndexBox, parsedData.chapters);
      }

      return Result.success(true);
    } on AppError catch (e) {
      return Result.failure(e);
    } catch (e) {
      return Result.failure(
        AppError.initialization('Database initialization failed: $e'),
      );
    }
  }

  /// Loads the Bible JSON asset from the Flutter asset bundle.
  Future<String> _loadAsset() async {
    try {
      return await rootBundle.loadString(_assetPath);
    } catch (e) {
      throw AppError.initialization(
        'Failed to load Bible asset: file may be corrupted or missing',
      );
    }
  }

  /// Top-level function for parsing JSON in a separate Isolate.
  ///
  /// Must be a top-level or static function to work with [compute].
  static _ParsedBibleData _parseJsonInIsolate(String rawJson) {
    try {
      final List<dynamic> booksJson = jsonDecode(rawJson) as List<dynamic>;

      final List<BookModel> books = [];
      final Map<String, ChapterModel> chapters = {};
      int totalVerses = 0;

      for (final bookJson in booksJson) {
        final Map<String, dynamic> bookMap = bookJson as Map<String, dynamic>;

        final int bookId = bookMap['id'] as int;
        final String name = bookMap['name'] as String;
        final String abbreviation = bookMap['abbreviation'] as String;
        final String testamentStr = bookMap['testament'] as String;
        final int chapterCount = bookMap['chapterCount'] as int;

        // Convert testament string to int (0 = OT, 1 = NT).
        final int testament = testamentStr == 'OT' ? 0 : 1;

        final book = BookModel.create(
          id: bookId,
          name: name,
          abbreviation: abbreviation,
          testament: testament,
          chapterCount: chapterCount,
        );
        books.add(book);

        // Parse chapters for this book.
        final List<dynamic> chaptersJson =
            bookMap['chapters'] as List<dynamic>;

        for (final chapterJson in chaptersJson) {
          final Map<String, dynamic> chapterMap =
              chapterJson as Map<String, dynamic>;
          final int chapterNum = chapterMap['number'] as int;

          // Parse verses for this chapter.
          final List<dynamic> versesJson =
              chapterMap['verses'] as List<dynamic>;
          final List<VerseModel> verses = [];

          for (final verseJson in versesJson) {
            final Map<String, dynamic> verseMap =
                verseJson as Map<String, dynamic>;
            final verse = VerseModel.create(
              number: verseMap['number'] as int,
              text: verseMap['text'] as String,
            );
            verses.add(verse);
          }

          totalVerses += verses.length;

          final chapter = ChapterModel.create(
            bookId: bookId,
            number: chapterNum,
            verses: verses,
          );

          // Use composite key: "{bookId}_{chapterNum}"
          final String compositeKey = '${bookId}_$chapterNum';
          chapters[compositeKey] = chapter;
        }
      }

      return _ParsedBibleData(
        books: books,
        chapters: chapters,
        totalVerses: totalVerses,
      );
    } catch (e) {
      throw FormatException(
        'Failed to parse Bible JSON: data may be corrupted. Error: $e',
      );
    }
  }

  /// Validates the parsed data matches expected Bible structure.
  AppError? _validateParsedData(_ParsedBibleData data) {
    if (data.books.length != BibleConstants.totalBooks) {
      return AppError.initialization(
        'Invalid Bible data: expected ${BibleConstants.totalBooks} books, '
        'got ${data.books.length}',
      );
    }

    if (data.chapters.length != BibleConstants.totalChapters) {
      return AppError.initialization(
        'Invalid Bible data: expected ${BibleConstants.totalChapters} chapters, '
        'got ${data.chapters.length}',
      );
    }

    if (data.totalVerses != BibleConstants.totalVerses) {
      return AppError.initialization(
        'Invalid Bible data: expected ${BibleConstants.totalVerses} verses, '
        'got ${data.totalVerses}',
      );
    }

    return null;
  }

  /// Batch writes all books to the books_box.
  Future<void> _writeBooksToBox(
    Box<BookModel> booksBox,
    List<BookModel> books,
  ) async {
    try {
      // Clear existing data before writing.
      await booksBox.clear();

      // Write books with their ID as the key.
      final Map<dynamic, BookModel> entries = {
        for (final book in books) book.id: book,
      };
      await booksBox.putAll(entries);
    } catch (e) {
      throw AppError.storage(
        'Failed to write books to storage: insufficient storage or I/O error',
      );
    }
  }

  /// Batch writes all chapters to the chapters_box (lazy box).
  Future<void> _writeChaptersToBox(
    LazyBox<ChapterModel> chaptersBox,
    Map<String, ChapterModel> chapters,
  ) async {
    try {
      // Clear existing data before writing.
      await chaptersBox.clear();

      // Write chapters with composite key "{bookId}_{chapterNum}".
      await chaptersBox.putAll(chapters);
    } catch (e) {
      throw AppError.storage(
        'Failed to write chapters to storage: insufficient storage or I/O error',
      );
    }
  }

  /// Verifies that the written data matches expected counts.
  Future<AppError?> _verifyCounts(
    Box<BookModel> booksBox,
    LazyBox<ChapterModel> chaptersBox,
  ) async {
    final int bookCount = booksBox.length;
    final int chapterCount = chaptersBox.length;

    if (bookCount != BibleConstants.totalBooks) {
      return AppError.initialization(
        'Verification failed: expected ${BibleConstants.totalBooks} books '
        'in storage, found $bookCount',
      );
    }

    if (chapterCount != BibleConstants.totalChapters) {
      return AppError.initialization(
        'Verification failed: expected ${BibleConstants.totalChapters} chapters '
        'in storage, found $chapterCount',
      );
    }

    // Verify total verse count by iterating through all chapters.
    int totalVerses = 0;
    for (final key in chaptersBox.keys) {
      final chapter = await chaptersBox.get(key);
      if (chapter != null) {
        totalVerses += chapter.verses.length;
      }
    }

    if (totalVerses != BibleConstants.totalVerses) {
      return AppError.initialization(
        'Verification failed: expected ${BibleConstants.totalVerses} verses '
        'in storage, found $totalVerses',
      );
    }

    return null;
  }

  /// Builds the search inverted index in an Isolate and writes it to the
  /// search_index_box.
  ///
  /// This runs the index building in a separate Isolate via `compute()` to
  /// avoid blocking the UI thread, then batch writes the resulting index
  /// entries to the Hive lazy box.
  Future<void> _buildAndWriteSearchIndex(
    LazyBox<SearchIndexEntry> searchIndexBox,
    Map<String, ChapterModel> chapters,
  ) async {
    try {
      // Build the inverted index in a separate Isolate.
      final Map<String, SearchIndexEntry> indexEntries = await compute(
        SearchIndexBuilder.buildIndex,
        chapters,
      );

      // Clear existing index data before writing.
      await searchIndexBox.clear();

      // Batch write all index entries to the search_index_box.
      await searchIndexBox.putAll(indexEntries);
    } catch (e) {
      throw AppError.initialization(
        'Failed to build search index: $e',
      );
    }
  }
}
