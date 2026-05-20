import '../../../../core/constants/bible_constants.dart';
import '../../../../core/error/app_error.dart';
import '../../../../core/utils/date_utils.dart';
import '../../../bible/domain/entities/chapter.dart';
import '../../../bible/domain/repositories/bible_repository.dart';
import '../../data/datasources/votd_datasource.dart';
import '../entities/verse_of_day.dart';

/// Use case that retrieves the verse of the day for a given date.
///
/// Uses [AppDateUtils.verseOfDayIndex] with a deterministic date-based seed
/// to select a verse from the pre-bundled pool of 366+ curated references.
/// Then loads the actual verse text from the [BibleRepository].
///
/// Guarantees:
/// - Same date always produces the same verse (deterministic)
/// - Different dates within a 365-day window produce different verses
/// - No internet connectivity required (all data is local)
class GetVerseOfDay {
  const GetVerseOfDay(this._bibleRepository);

  final BibleRepository _bibleRepository;

  /// Executes the use case, returning the verse of the day for [date].
  ///
  /// If [date] is not provided, defaults to the current device local date.
  ///
  /// Returns [Result.success] with a [VerseOfDay] containing the verse text,
  /// book name, chapter, verse number, and display/share formatting.
  ///
  /// Returns [Result.failure] if the verse cannot be loaded from the database.
  Future<Result<VerseOfDay>> call({DateTime? date}) async {
    final targetDate = date ?? DateTime.now();

    // Get deterministic index based on date
    final index = AppDateUtils.verseOfDayIndex(
      targetDate,
      poolSize: VotdDatasource.poolSize,
    );

    // Get the verse reference from the curated pool
    final verseRef = VotdDatasource.versePool[index];

    // Load the actual chapter from the Bible database
    final chapterResult = await _bibleRepository.getChapter(
      verseRef.bookId,
      verseRef.chapter,
    );

    return switch (chapterResult) {
      Success(data: final chapter) => _buildVerseOfDay(
          chapter: chapter,
          verseRef: verseRef,
        ),
      Failure(error: final error) => Result.failure(error),
    };
  }

  Result<VerseOfDay> _buildVerseOfDay({
    required Chapter chapter,
    required ({int bookId, int chapter, int verse}) verseRef,
  }) {
    // Find the specific verse in the chapter
    final matchingVerses = chapter.verses.where(
      (v) => v.number == verseRef.verse,
    );

    if (matchingVerses.isEmpty) {
      return Result.failure(
        AppError.notFound('Verse of the day not found in database'),
      );
    }

    final verse = matchingVerses.first;
    final bookName = BibleConstants.getBookName(verseRef.bookId);

    if (bookName == null) {
      return Result.failure(
        AppError.notFound('Book name not found for verse of the day'),
      );
    }

    return Result.success(
      VerseOfDay(
        verseText: verse.text,
        bookName: bookName,
        chapter: verseRef.chapter,
        verse: verseRef.verse,
        bookId: verseRef.bookId,
      ),
    );
  }
}
