import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/verse.dart';
import 'verse_action_bar.dart';

/// A ConsumerWidget that displays a single Bible verse (number + text).
///
/// Features:
/// - On tap: highlights the verse with a colored background and shows a
///   contextual action bar with Favorite, Note, and Share buttons.
/// - Dismisses highlight on tap outside or action selection.
/// - Displays a filled heart icon if the verse is favorited.
/// - Displays a small note indicator dot if the verse has a note.
/// - Uses [AnimatedContainer] for smooth highlight transitions.
///
/// Usage:
/// ```dart
/// VerseTile(
///   verse: verse,
///   isSelected: selectedVerseNumber == verse.number,
///   isFavorited: true,
///   hasNote: false,
///   onTap: () => selectVerse(verse.number),
///   onTapOutside: () => clearSelection(),
///   onFavorite: () => toggleFavorite(verse),
///   onNote: () => openNoteEditor(verse),
///   onShare: () => shareVerse(verse),
/// )
/// ```
class VerseTile extends ConsumerWidget {
  /// The verse data to display.
  final Verse verse;

  /// Whether this verse is currently selected (highlighted).
  final bool isSelected;

  /// Whether this verse is marked as a favorite.
  /// When true, a filled heart icon indicator is shown.
  final bool isFavorited;

  /// Whether this verse has an associated note.
  /// When true, a small note indicator dot is shown.
  final bool hasNote;

  /// Callback invoked when the verse is tapped.
  /// Typically used to select/highlight this verse.
  final VoidCallback? onTap;

  /// Callback invoked when the user taps outside the verse
  /// or when an action is selected, to dismiss the highlight.
  final VoidCallback? onTapOutside;

  /// Callback invoked when the favorite action is triggered.
  final VoidCallback? onFavorite;

  /// Callback invoked when the note action is triggered.
  final VoidCallback? onNote;

  /// Callback invoked when the share action is triggered.
  final VoidCallback? onShare;

  const VerseTile({
    super.key,
    required this.verse,
    this.isSelected = false,
    this.isFavorited = false,
    this.hasNote = false,
    this.onTap,
    this.onTapOutside,
    this.onFavorite,
    this.onNote,
    this.onShare,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return GestureDetector(
      onTap: isSelected ? onTapOutside : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(
          horizontal: 16.0,
          vertical: 8.0,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? colorScheme.primaryContainer.withOpacity(0.3)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Verse content row
            _VerseContent(
              verse: verse,
              isFavorited: isFavorited,
              hasNote: hasNote,
              textTheme: textTheme,
              colorScheme: colorScheme,
            ),

            // Contextual action bar (animated entrance/exit)
            VerseActionBar(
              isVisible: isSelected,
              isFavorited: isFavorited,
              onFavorite: () {
                onFavorite?.call();
                onTapOutside?.call();
              },
              onNote: () {
                onNote?.call();
                onTapOutside?.call();
              },
              onShare: () {
                onShare?.call();
                onTapOutside?.call();
              },
            ),
          ],
        ),
      ),
    );
  }
}

/// Internal widget that renders the verse number, text, and indicators.
class _VerseContent extends StatelessWidget {
  final Verse verse;
  final bool isFavorited;
  final bool hasNote;
  final TextTheme textTheme;
  final ColorScheme colorScheme;

  const _VerseContent({
    required this.verse,
    required this.isFavorited,
    required this.hasNote,
    required this.textTheme,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Verse number
        _VerseNumber(
          number: verse.number,
          textTheme: textTheme,
          colorScheme: colorScheme,
        ),
        const SizedBox(width: 6.0),

        // Verse text with indicators
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text.rich(
                TextSpan(
                  text: verse.text,
                  style: textTheme.bodyLarge?.copyWith(
                    color: colorScheme.onSurface,
                    height: 1.6,
                  ),
                ),
              ),
              // Indicators row
              if (isFavorited || hasNote)
                Padding(
                  padding: const EdgeInsets.only(top: 4.0),
                  child: _VerseIndicators(
                    isFavorited: isFavorited,
                    hasNote: hasNote,
                    colorScheme: colorScheme,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Displays the verse number as a superscript-style label.
class _VerseNumber extends StatelessWidget {
  final int number;
  final TextTheme textTheme;
  final ColorScheme colorScheme;

  const _VerseNumber({
    required this.number,
    required this.textTheme,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 2.0),
      child: Text(
        '$number',
        style: textTheme.bodySmall?.copyWith(
          color: colorScheme.primary,
          fontWeight: FontWeight.w700,
          fontSize: 11.0,
        ),
      ),
    );
  }
}

/// Displays small indicator icons for favorite and note status.
class _VerseIndicators extends StatelessWidget {
  final bool isFavorited;
  final bool hasNote;
  final ColorScheme colorScheme;

  const _VerseIndicators({
    required this.isFavorited,
    required this.hasNote,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isFavorited)
          Padding(
            padding: const EdgeInsets.only(right: 6.0),
            child: Icon(
              Icons.favorite,
              size: 14.0,
              color: colorScheme.error,
              semanticLabel: 'Versículo favorito',
            ),
          ),
        if (hasNote)
          Container(
            width: 8.0,
            height: 8.0,
            decoration: BoxDecoration(
              color: colorScheme.tertiary,
              shape: BoxShape.circle,
            ),
            child: const Tooltip(
              message: 'Tiene nota',
              child: SizedBox.shrink(),
            ),
          ),
      ],
    );
  }
}
