import 'package:hive/hive.dart';

part 'note_model.g.dart';

/// Hive model representing a user note attached to a verse.
///
/// Stored in `notes_box` with composite key "{bookId}_{chapter}_{verse}".
@HiveType(typeId: 4)
class NoteModel extends HiveObject {
  /// The book ID of the verse this note is attached to (1-66).
  @HiveField(0)
  late int bookId;

  /// The chapter number of the verse this note is attached to.
  @HiveField(1)
  late int chapter;

  /// The verse number this note is attached to.
  @HiveField(2)
  late int verse;

  /// The note text content (1-2000 characters).
  @HiveField(3)
  late String text;

  /// Timestamp when the note was created (milliseconds since epoch).
  @HiveField(4)
  late int createdAtMillis;

  /// Timestamp when the note was last modified (milliseconds since epoch).
  @HiveField(5)
  late int modifiedAtMillis;

  NoteModel();

  NoteModel.create({
    required this.bookId,
    required this.chapter,
    required this.verse,
    required this.text,
    required this.createdAtMillis,
    required this.modifiedAtMillis,
  });
}
