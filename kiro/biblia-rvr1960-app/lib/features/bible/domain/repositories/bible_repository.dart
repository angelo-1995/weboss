import '../../../../core/error/app_error.dart';
import '../entities/book.dart';
import '../entities/chapter.dart';

/// Abstract repository interface for Bible data access.
///
/// Defined in the domain layer — implementations live in the data layer.
/// All methods return [Result<T>] to handle success/failure uniformly.
abstract class BibleRepository {
  /// Returns all 66 books of the RVR1960 Bible.
  Future<Result<List<Book>>> getAllBooks();

  /// Returns a single book by its canonical ID (1-66).
  Future<Result<Book>> getBook(int bookId);

  /// Returns a chapter with all its verses.
  Future<Result<Chapter>> getChapter(int bookId, int chapterNum);

  /// Returns the adjacent (previous, next) chapters for navigation.
  ///
  /// Returns a tuple of (previousChapter, nextChapter).
  /// Either value may be `null` if at the Bible boundaries
  /// (Genesis 1 has no previous, Revelation 22 has no next).
  Future<Result<(Chapter?, Chapter?)>> getAdjacentChapters(
    int bookId,
    int chapterNum,
  );

  /// Returns the total verse count across all books and chapters.
  Future<Result<int>> getTotalVerseCount();
}
