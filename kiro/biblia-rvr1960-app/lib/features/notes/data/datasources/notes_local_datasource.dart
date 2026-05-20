import 'package:hive/hive.dart';

import '../models/note_model.dart';

/// Local data source for notes using Hive.
///
/// Uses a non-lazy [Box<NoteModel>] named 'notes_box'.
/// Composite key format: "{bookId}_{chapter}_{verse}".
class NotesLocalDatasource {
  final Box<NoteModel> _box;

  NotesLocalDatasource(this._box);

  /// Generates the composite key for a verse note.
  String _compositeKey(int bookId, int chapter, int verse) =>
      '${bookId}_${chapter}_$verse';

  /// Saves a new note. Overwrites if a note already exists for the verse.
  Future<NoteModel> saveNote({
    required int bookId,
    required int chapter,
    required int verse,
    required String text,
  }) async {
    final key = _compositeKey(bookId, chapter, verse);
    final now = DateTime.now().millisecondsSinceEpoch;

    final model = NoteModel.create(
      bookId: bookId,
      chapter: chapter,
      verse: verse,
      text: text,
      createdAtMillis: now,
      modifiedAtMillis: now,
    );

    await _box.put(key, model);
    return model;
  }

  /// Updates an existing note's text and modifiedAt timestamp.
  ///
  /// Returns the updated model, or null if the note doesn't exist.
  Future<NoteModel?> updateNote(String key, String text) async {
    final model = _box.get(key);
    if (model == null) return null;

    model.text = text;
    model.modifiedAtMillis = DateTime.now().millisecondsSinceEpoch;
    await model.save();
    return model;
  }

  /// Deletes a note by its composite key.
  Future<void> deleteNote(String key) async {
    await _box.delete(key);
  }

  /// Retrieves a note by verse coordinates, or null if not found.
  NoteModel? getNote(int bookId, int chapter, int verse) {
    final key = _compositeKey(bookId, chapter, verse);
    return _box.get(key);
  }

  /// Retrieves a note by its composite key, or null if not found.
  NoteModel? getNoteByKey(String key) {
    return _box.get(key);
  }

  /// Returns all stored notes.
  List<NoteModel> getAllNotes() {
    return _box.values.toList();
  }

  /// Watches the box for any changes and emits all current values.
  Stream<List<NoteModel>> watchNotes() {
    return _box.watch().map((_) => _box.values.toList());
  }
}
