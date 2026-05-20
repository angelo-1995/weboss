import '../../domain/entities/book.dart';
import '../../domain/entities/chapter.dart';

/// Abstract interface for the Bible local data source.
///
/// Provides low-level access to Bible data stored in Hive boxes.
/// Concrete implementations handle Hive box operations and model-to-entity
/// mapping.
abstract class BibleLocalDataSource {
  /// Initializes the data source (opens Hive boxes, loads bundled data if needed).
  Future<void> initialize();

  /// Returns `true` if the Bible data has been fully loaded and is ready.
  Future<bool> isInitialized();

  /// Returns all 66 books of the RVR1960 Bible.
  Future<List<Book>> getAllBooks();

  /// Returns a single book by its canonical ID (1-66).
  Future<Book> getBook(int bookId);

  /// Returns a chapter with all its verses loaded.
  Future<Chapter> getChapter(int bookId, int chapterNum);

  /// Returns the adjacent (previous, next) chapters for navigation.
  ///
  /// Returns a tuple of (previousChapter, nextChapter).
  /// Either value may be `null` if at the Bible boundaries.
  Future<(Chapter?, Chapter?)> getAdjacentChapters(int bookId, int chapterNum);

  /// Returns the total number of verses across all chapters.
  Future<int> getTotalVerseCount();
}
