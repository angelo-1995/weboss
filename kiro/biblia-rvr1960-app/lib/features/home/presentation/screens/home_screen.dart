import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/bible_constants.dart';
import '../../../../core/router/routes.dart';
import '../../../bible/domain/entities/reading_position.dart';
import '../../../bible/presentation/providers/reading_position_provider.dart';
import '../../../settings/presentation/providers/theme_provider.dart';
import '../../../share/presentation/widgets/share_style_sheet.dart';
import '../../domain/entities/verse_of_day.dart';
import '../providers/home_providers.dart';

/// Home screen displaying verse of the day, continue reading card,
/// and quick access shortcuts.
///
/// Content loads within 500ms target (Requirement 9.5).
/// Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final verseOfDayAsync = ref.watch(verseOfDayProvider);
    final readingPosition = ref.watch(readingPositionProvider);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Verse of the Day Section ---
              _buildVerseOfDaySection(context, verseOfDayAsync),
              const SizedBox(height: 16.0),

              // --- Continue Reading / Welcome Section ---
              _buildContinueReadingSection(context, readingPosition),
              const SizedBox(height: 16.0),

              // --- Quick Access Shortcuts ---
              _buildShortcutsRow(context),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Verse of the Day
  // ---------------------------------------------------------------------------

  Widget _buildVerseOfDaySection(
    BuildContext context,
    AsyncValue<VerseOfDay?> verseOfDayAsync,
  ) {
    return verseOfDayAsync.when(
      data: (verseOfDay) {
        if (verseOfDay == null) {
          return _buildVotdPlaceholder(context);
        }
        return _buildVotdCard(context, verseOfDay);
      },
      loading: () => _buildVotdLoadingCard(context),
      error: (_, __) => _buildVotdPlaceholder(context),
    );
  }

  /// Verse of the day card with verse text, reference, and share button.
  /// Tap navigates to Reader at that verse location.
  Widget _buildVotdCard(BuildContext context, VerseOfDay verseOfDay) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      color: colorScheme.primaryContainer,
      child: InkWell(
        borderRadius: BorderRadius.circular(16.0),
        onTap: () {
          context.go(AppRoutes.readerPath(verseOfDay.bookId, verseOfDay.chapter));
        },
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Versículo del día',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  _VotdShareButton(verseOfDay: verseOfDay),
                ],
              ),
              const SizedBox(height: 12.0),

              // Verse text (truncated if > 500 chars)
              Text(
                '"${verseOfDay.displayText}"',
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onPrimaryContainer,
                  fontStyle: FontStyle.italic,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 12.0),

              // Reference
              Text(
                '— ${verseOfDay.reference}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onPrimaryContainer.withOpacity(0.8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Placeholder card when verse of the day is unavailable.
  /// Validates: Requirement 9.7
  Widget _buildVotdPlaceholder(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 1.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      color: colorScheme.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Versículo del día',
              style: theme.textTheme.labelLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12.0),
            Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 18.0,
                  color: colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: Text(
                    'No se pudo cargar el versículo del día',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Loading skeleton for verse of the day.
  Widget _buildVotdLoadingCard(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 1.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      color: colorScheme.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 140.0,
              height: 14.0,
              decoration: BoxDecoration(
                color: colorScheme.onSurface.withOpacity(0.08),
                borderRadius: BorderRadius.circular(4.0),
              ),
            ),
            const SizedBox(height: 16.0),
            Container(
              width: double.infinity,
              height: 14.0,
              decoration: BoxDecoration(
                color: colorScheme.onSurface.withOpacity(0.08),
                borderRadius: BorderRadius.circular(4.0),
              ),
            ),
            const SizedBox(height: 8.0),
            Container(
              width: 200.0,
              height: 14.0,
              decoration: BoxDecoration(
                color: colorScheme.onSurface.withOpacity(0.08),
                borderRadius: BorderRadius.circular(4.0),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Continue Reading / Welcome
  // ---------------------------------------------------------------------------

  /// Displays either a "continue reading" card or a welcome message.
  ///
  /// If reading position is Genesis 1 with scrollOffset 0 (default/no history),
  /// shows a welcome card. Otherwise shows the continue reading card.
  ///
  /// Validates: Requirements 9.2, 9.3, 9.6
  Widget _buildContinueReadingSection(
    BuildContext context,
    ReadingPosition position,
  ) {
    final hasReadingHistory = !(position.bookId == 1 &&
        position.chapter == 1 &&
        position.scrollOffset == 0.0);

    if (hasReadingHistory) {
      return _buildContinueReadingCard(context, position);
    } else {
      return _buildWelcomeCard(context);
    }
  }

  /// "Continuar leyendo" card showing last position.
  /// Tap navigates to Reader at last reading position.
  Widget _buildContinueReadingCard(
    BuildContext context,
    ReadingPosition position,
  ) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final bookName =
        BibleConstants.getBookName(position.bookId) ?? 'Desconocido';

    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16.0),
        onTap: () {
          context.go(AppRoutes.readerPath(position.bookId, position.chapter));
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              // Book icon
              Container(
                width: 48.0,
                height: 48.0,
                decoration: BoxDecoration(
                  color: colorScheme.secondaryContainer,
                  borderRadius: BorderRadius.circular(12.0),
                ),
                child: Icon(
                  Icons.menu_book_rounded,
                  color: colorScheme.onSecondaryContainer,
                  size: 24.0,
                ),
              ),
              const SizedBox(width: 16.0),

              // Text content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Continuar leyendo',
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      '$bookName ${position.chapter}',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colorScheme.onSurface,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              // Arrow indicator
              Icon(
                Icons.arrow_forward_ios_rounded,
                color: colorScheme.onSurfaceVariant,
                size: 16.0,
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Welcome card shown when no reading history exists.
  /// Tap navigates to Genesis 1:1.
  /// Validates: Requirement 9.6
  Widget _buildWelcomeCard(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.0),
      ),
      color: colorScheme.tertiaryContainer,
      child: InkWell(
        borderRadius: BorderRadius.circular(16.0),
        onTap: () {
          context.go(AppRoutes.readerPath(1, 1));
        },
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '¡Bienvenido!',
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: colorScheme.onTertiaryContainer,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Text(
                      'Comienza a leer la Biblia desde el principio',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onTertiaryContainer.withOpacity(0.8),
                      ),
                    ),
                    const SizedBox(height: 12.0),
                    Row(
                      children: [
                        Text(
                          'Comienza a leer',
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: colorScheme.onTertiaryContainer,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4.0),
                        Icon(
                          Icons.arrow_forward_rounded,
                          size: 18.0,
                          color: colorScheme.onTertiaryContainer,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12.0),
              Icon(
                Icons.auto_stories_rounded,
                size: 48.0,
                color: colorScheme.onTertiaryContainer.withOpacity(0.6),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Quick Access Shortcuts
  // ---------------------------------------------------------------------------

  /// Row of shortcut elements for Search, Favorites, and Notes.
  /// Validates: Requirement 9.4
  Widget _buildShortcutsRow(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4.0, bottom: 12.0),
          child: Text(
            'Acceso rápido',
            style: theme.textTheme.titleSmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        Row(
          children: [
            Expanded(
              child: _ShortcutCard(
                icon: Icons.search_rounded,
                label: 'Buscar',
                onTap: () {
                  context.go(AppRoutes.search);
                },
              ),
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: _ShortcutCard(
                icon: Icons.favorite_rounded,
                label: 'Favoritos',
                onTap: () {
                  context.push(AppRoutes.favorites);
                },
              ),
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: _ShortcutCard(
                icon: Icons.note_alt_rounded,
                label: 'Notas',
                onTap: () {
                  context.push(AppRoutes.notes);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// Private Widgets
// -----------------------------------------------------------------------------

/// A single shortcut card with icon and label.
class _ShortcutCard extends StatelessWidget {
  const _ShortcutCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 1.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12.0),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            vertical: 16.0,
            horizontal: 12.0,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: colorScheme.primary,
                size: 28.0,
              ),
              const SizedBox(height: 8.0),
              Text(
                label,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: colorScheme.onSurface,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Share button for the Verse of the Day card.
///
/// Opens the [ShareStyleSheet] with the verse text, reference, and
/// current app typeface for image generation.
///
/// Validates: Requirements 9.4, 12.8
class _VotdShareButton extends ConsumerWidget {
  final VerseOfDay verseOfDay;

  const _VotdShareButton({required this.verseOfDay});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return IconButton(
      icon: Icon(
        Icons.share_outlined,
        color: colorScheme.onPrimaryContainer,
        size: 20.0,
      ),
      onPressed: () {
        final themeSettings = ref.read(themeProvider);
        ShareStyleSheet.show(
          context,
          verseText: verseOfDay.fullText,
          reference: verseOfDay.reference,
          typeface: themeSettings.typeface,
        );
      },
      tooltip: 'Compartir',
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(
        minWidth: 36.0,
        minHeight: 36.0,
      ),
    );
  }
}
