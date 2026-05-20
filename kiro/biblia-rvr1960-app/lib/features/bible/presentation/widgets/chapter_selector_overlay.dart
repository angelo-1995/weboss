import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/bible_constants.dart';
import '../providers/reading_position_provider.dart';
import 'chapter_grid.dart';

/// A quick overlay bottom sheet for jumping to a chapter within the current book.
///
/// Shows the chapter grid for the current book and allows direct navigation
/// to any chapter. Can be triggered from the Reader screen AppBar.
///
/// Validates: Requirements 2.10
class ChapterSelectorOverlay extends ConsumerWidget {
  const ChapterSelectorOverlay({super.key});

  /// Shows the chapter selector as a modal bottom sheet.
  ///
  /// Call this from the Reader screen AppBar action to allow quick
  /// chapter jumping within the current book.
  ///
  /// Example:
  /// ```dart
  /// IconButton(
  ///   icon: const Icon(Icons.grid_view),
  ///   onPressed: () => ChapterSelectorOverlay.show(context),
  /// )
  /// ```
  static Future<void> show(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => const ChapterSelectorOverlay(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPosition = ref.watch(readingPositionProvider);
    final bookName =
        BibleConstants.getBookName(currentPosition.bookId) ?? 'Libro';
    final chapterCount =
        BibleConstants.getChapterCount(currentPosition.bookId) ?? 1;

    return DraggableScrollableSheet(
      initialChildSize: _calculateInitialSize(chapterCount),
      minChildSize: 0.3,
      maxChildSize: 0.85,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Drag handle
            Padding(
              padding: const EdgeInsets.only(top: 12.0, bottom: 8.0),
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .colorScheme
                      .onSurfaceVariant
                      .withOpacity(0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header with book name
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      bookName,
                      style:
                          Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                    ),
                  ),
                  Text(
                    '$chapterCount capítulos',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),

            // Chapter grid
            Expanded(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.all(16.0),
                child: ChapterGrid(
                  bookId: currentPosition.bookId,
                  chapterCount: chapterCount,
                  currentChapter: currentPosition.chapter,
                  onChapterSelected: (chapter) {
                    _onChapterSelected(context, ref, chapter);
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  /// Calculates the initial bottom sheet size based on chapter count.
  ///
  /// Books with fewer chapters get a smaller sheet; books with many
  /// chapters (like Psalms with 150) get a larger initial size.
  double _calculateInitialSize(int chapterCount) {
    if (chapterCount <= 5) return 0.35;
    if (chapterCount <= 15) return 0.45;
    if (chapterCount <= 30) return 0.55;
    if (chapterCount <= 50) return 0.65;
    return 0.75;
  }

  void _onChapterSelected(BuildContext context, WidgetRef ref, int chapter) {
    final currentPosition = ref.read(readingPositionProvider);

    // Update reading position to the selected chapter.
    ref.read(readingPositionProvider.notifier).updatePosition(
          bookId: currentPosition.bookId,
          chapter: chapter,
        );

    // Close the bottom sheet.
    Navigator.of(context).pop();
  }
}
