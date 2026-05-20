import '../../../../core/error/app_error.dart';
import '../../domain/entities/book.dart';
import '../../domain/entities/chapter.dart';
import '../../domain/repositories/bible_repository.dart';
import '../datasources/bible_local_datasource.dart';

/// Concrete implementation of [BibleRepository].
///
/// Delegates all operations to [BibleLocalDataSource] and wraps results
/// in [Result] types to provide uniform error handling.
class BibleRepositoryImpl implements BibleRepository {
  final BibleLocalDataSource _localDataSource;

  BibleRepositoryImpl(this._localDataSource);

  @override
  Future<Result<List<Book>>> getAllBooks() async {
    try {
      final books = await _localDataSource.getAllBooks();
      return Result.success(books);
    } catch (e) {
      return Result.failure(AppError.storage('Failed to load books: $e'));
    }
  }

  @override
  Future<Result<Book>> getBook(int bookId) async {
    try {
      final book = await _localDataSource.getBook(bookId);
      return Result.success(book);
    } catch (e) {
      return Result.failure(
        AppError.notFound('Book with id $bookId not found: $e'),
      );
    }
  }

  @override
  Future<Result<Chapter>> getChapter(int bookId, int chapterNum) async {
    try {
      final chapter = await _localDataSource.getChapter(bookId, chapterNum);
      return Result.success(chapter);
    } catch (e) {
      return Result.failure(
        AppError.notFound(
          'Chapter $chapterNum of book $bookId not found: $e',
        ),
      );
    }
  }

  @override
  Future<Result<(Chapter?, Chapter?)>> getAdjacentChapters(
    int bookId,
    int chapterNum,
  ) async {
    try {
      final adjacent =
          await _localDataSource.getAdjacentChapters(bookId, chapterNum);
      return Result.success(adjacent);
    } catch (e) {
      return Result.failure(
        AppError.storage(
          'Failed to load adjacent chapters for book $bookId, chapter $chapterNum: $e',
        ),
      );
    }
  }

  @override
  Future<Result<int>> getTotalVerseCount() async {
    try {
      final count = await _localDataSource.getTotalVerseCount();
      return Result.success(count);
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to get total verse count: $e'),
      );
    }
  }
}
