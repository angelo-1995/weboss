import '../../../../core/error/app_error.dart';
import '../entities/book.dart';
import '../repositories/bible_repository.dart';

/// Result containing books organized by testament.
class BooksGroupedByTestament {
  final List<Book> oldTestament;
  final List<Book> newTestament;

  const BooksGroupedByTestament({
    required this.oldTestament,
    required this.newTestament,
  });

  /// All 66 books in canonical order.
  List<Book> get all => [...oldTestament, ...newTestament];
}

/// Use case that retrieves all 66 books of the RVR1960 Bible
/// organized by Old Testament (39) and New Testament (27).
///
/// Validates: Requirements 2.1
class GetBooksUseCase {
  final BibleRepository _repository;

  const GetBooksUseCase(this._repository);

  /// Fetches all books and groups them by testament.
  ///
  /// Returns [Result.success] with books organized by OT/NT,
  /// or [Result.failure] with an [AppError] if the operation fails.
  Future<Result<BooksGroupedByTestament>> call() async {
    try {
      final result = await _repository.getAllBooks();

      return switch (result) {
        Success(:final data) => Result.success(
            BooksGroupedByTestament(
              oldTestament: data
                  .where((book) => book.testament == Testament.oldTestament)
                  .toList(),
              newTestament: data
                  .where((book) => book.testament == Testament.newTestament)
                  .toList(),
            ),
          ),
        Failure(:final error) => Result.failure(error),
      };
    } catch (e) {
      return Result.failure(
        AppError.storage('Failed to retrieve books: ${e.toString()}'),
      );
    }
  }
}
