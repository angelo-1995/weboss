import 'package:hive/hive.dart';

part 'verse_model.g.dart';

/// Hive model representing a single Bible verse.
///
/// Stored as part of [ChapterModel.verses] list.
@HiveType(typeId: 2)
class VerseModel extends HiveObject {
  /// The verse number within the chapter (1-based).
  @HiveField(0)
  late int number;

  /// The full text content of the verse.
  @HiveField(1)
  late String text;

  VerseModel();

  VerseModel.create({
    required this.number,
    required this.text,
  });
}
