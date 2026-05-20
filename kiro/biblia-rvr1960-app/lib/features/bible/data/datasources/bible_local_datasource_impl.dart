import 'package:hive/hive.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../domain/entities/book.dart';
import '../../domain/entities/chapter.dart';
import '../../domain/entities/verse.dart';
import '../models/book_model.dart';
import '../models/chapter_model.dart';
import 'bible_local_datasource.dart';

/// Concrete implementation of [BibleLocalDataSource] using Hive boxes.
///
/// Uses two boxes:
/// - `books_box`: Non-lazy [Box<BookModel>] for all 66 books (always in memory).
/// - `chapters_box`: Lazy [LazyBox<ChapterModel>] for on-demand chapter loading.
///
/// Chapter keys follow the composite pattern `"{bookId}_{chapterNum}"`.
class BibleLocalDataSourceImpl implements BibleLocalDataSource {
  static const String booksBoxName = 'books_box';
  static const String chaptersBoxName = 'chapters_box';

  final Box<BookModel> _booksBox;
  final LazyBox<ChapterModel> _chaptersBox;

  BibleLocalDataSourceImpl({
    required Box<BookModel> booksBox,
    required LazyBox<ChapterModel> chaptersBox,
  })  : _booksBox = booksBox,
        _chaptersBox = chaptersBox;

  /// Generates the composite key for chapter lookups.
  String _chapterKey(int bookId, int chapterNum) => '${bookId}_$chapterNum';

  @override
  Future<void> initialize() async {
    // Boxes are opened externally and injected via constructor.
    // This method exists for any additional initialization logic
    // (e.g., verifying data integrity after opening boxes).
  }

  @override
  Future<bool> isInitialized() async {
    // The database is considered initialized when books_box has exactly 66 entries.
    return _booksBox.length == BibleConstants.totalBooks;
  }

  @override
  Future<List<Book>> getAllBooks() async {
    final bookModels = _booksBox.values.toList();

    // Sort by book ID to ensure canonical order.
    bookModels.sort((a, b) => a.id.compareTo(b.id));

    return bookModels.map(_bookModelToEntity).toList();
  }

  @override
  Future<Book> getBook(int bookId) async {
    final model = _booksBox.get(bookId);
    if (model == null) {
      throw Exception('Book with id $bookId not found in books_box');
    }
    return _bookModelToEntity(model);
  }

  @override
  Future<Chapter> getChapter(int bookId, int chapterNum) async {
    final key = _chapterKey(bookId, chapterNum);
    final model = await _chaptersBox.get(key);
    if (model == null) {
      throw Exception(
        'Chapter $chapterNum of book $bookId not found in chapters_box (key: $key)',
      );
    }
    return _chapterModelToEntity(model);
  }

  @override
  Future<(Chapter?, Chapter?)> getAdjacentChapters(
    int bookId,
    int chapterNum,
  ) async {
    final previous = await _getPreviousChapter(bookId, chapterNum);
    final next = await _getNextChapter(bookId, chapterNum);
    return (previous, next);
  }

  @override
  Future<int> getTotalVerseCount() async {
    int total = 0;
    final keys = _chaptersBox.keys;
    for (final key in keys) {
      final chapter = await _chaptersBox.get(key);
      if (chapter != null) {
        total += chapter.verses.length;
      }
    }
    return total;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /// Resolves the previous chapter in canonical order.
  ///
  /// If [chapterNum] > 1, returns the previous chapter in the same book.
  /// If [chapterNum] == 1, returns the last chapter of the previous book.
  /// Returns `null` if at the very beginning of the Bible (Genesis 1).
  Future<Chapter?> _getPreviousChapter(int bookId, int chapterNum) async {
    if (chapterNum > 1) {
      // Previous chapter in the same book.
      final key = _chapterKey(bookId, chapterNum - 1);
      final model = await _chaptersBox.get(key);
      return model != null ? _chapterModelToEntity(model) : null;
    }

    // At chapter 1 — go to the last chapter of the previous book.
    final prevBookId = bookId - 1;
    if (prevBookId < 1) {
      // Genesis 1 — no previous chapter.
      return null;
    }

    final prevBookChapterCount = BibleConstants.getChapterCount(prevBookId);
    if (prevBookChapterCount == null) return null;

    final key = _chapterKey(prevBookId, prevBookChapterCount);
    final model = await _chaptersBox.get(key);
    return model != null ? _chapterModelToEntity(model) : null;
  }

  /// Resolves the next chapter in canonical order.
  ///
  /// If [chapterNum] < total chapters in book, returns the next chapter.
  /// If [chapterNum] == last chapter, returns chapter 1 of the next book.
  /// Returns `null` if at the very end of the Bible (Revelation 22).
  Future<Chapter?> _getNextChapter(int bookId, int chapterNum) async {
    final currentBookChapterCount = BibleConstants.getChapterCount(bookId);
    if (currentBookChapterCount == null) return null;

    if (chapterNum < currentBookChapterCount) {
      // Next chapter in the same book.
      final key = _chapterKey(bookId, chapterNum + 1);
      final model = await _chaptersBox.get(key);
      return model != null ? _chapterModelToEntity(model) : null;
    }

    // At the last chapter — go to chapter 1 of the next book.
    final nextBookId = bookId + 1;
    if (nextBookId > BibleConstants.totalBooks) {
      // Revelation 22 — no next chapter.
      return null;
    }

    final key = _chapterKey(nextBookId, 1);
    final model = await _chaptersBox.get(key);
    return model != null ? _chapterModelToEntity(model) : null;
  }

  // ---------------------------------------------------------------------------
  // Model-to-Entity mapping
  // ---------------------------------------------------------------------------

  /// Converts a [BookModel] (Hive) to a [Book] domain entity.
  Book _bookModelToEntity(BookModel model) {
    return Book(
      id: model.id,
      name: model.name,
      abbreviation: model.abbreviation,
      testament: model.testament == 0
          ? Testament.oldTestament
          : Testament.newTestament,
      chapterCount: model.chapterCount,
    );
  }

  /// Converts a [ChapterModel] (Hive) to a [Chapter] domain entity.
  Chapter _chapterModelToEntity(ChapterModel model) {
    return Chapter(
      bookId: model.bookId,
      number: model.number,
      verses: model.verses
          .map(
            (v) => Verse(
              bookId: model.bookId,
              chapter: model.number,
              number: v.number,
              text: v.text,
            ),
          )
          .toList(),
    );
  }
}
