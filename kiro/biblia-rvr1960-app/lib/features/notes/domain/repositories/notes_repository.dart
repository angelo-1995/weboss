import '../entities/note.dart';
import '../../../../core/error/app_error.dart';

/// Abstract interface for notes persistence operations.
///
/// Domain layer contract — implementations live in the data layer.
abstract class NotesRepository {
  /// Creates a new note for the specified verse.
  ///
  /// Returns the created [Note] on success, or a validation/storage error.
  Future<Result<Note>> saveNote(int bookId, int chapter, int verse, String text);

  /// Updates the text of an existing note identified by composite key.
  ///
  /// The [id] is the composite key "{bookId}_{chapter}_{verse}".
  /// Returns the updated [Note] on success, or a validation/storage error.
  Future<Result<Note>> updateNote(String id, String text);

  /// Deletes a note by its composite key.
  ///
  /// The [id] is the composite key "{bookId}_{chapter}_{verse}".
  Future<Result<void>> deleteNote(String id);

  /// Retrieves the note for a specific verse, or null if none exists.
  Future<Note?> getNote(int bookId, int chapter, int verse);

  /// Returns all notes sorted by modifiedAt descending (most recent first).
  Future<Result<List<Note>>> getAllNotes();

  /// Reactive stream that emits the full notes list whenever changes occur.
  Stream<List<Note>> watchNotes();
}
