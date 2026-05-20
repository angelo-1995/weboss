import 'package:flutter/material.dart';

/// A small horizontal action bar with contextual actions for a selected verse.
///
/// Displays three action buttons: Favorite, Note, and Share.
/// Appears with an animated entrance/exit below or above the selected verse.
///
/// The bar uses [AnimatedSize] and [AnimatedOpacity] for smooth transitions.
class VerseActionBar extends StatelessWidget {
  /// Whether the verse is currently marked as a favorite.
  /// When true, the favorite icon is displayed as filled.
  final bool isFavorited;

  /// Callback invoked when the favorite button is tapped.
  final VoidCallback? onFavorite;

  /// Callback invoked when the note button is tapped.
  final VoidCallback? onNote;

  /// Callback invoked when the share button is tapped.
  final VoidCallback? onShare;

  /// Whether the action bar is visible.
  /// Controls the animated entrance/exit.
  final bool isVisible;

  const VerseActionBar({
    super.key,
    required this.isFavorited,
    required this.isVisible,
    this.onFavorite,
    this.onNote,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return AnimatedSize(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeInOut,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: isVisible ? 1.0 : 0.0,
        child: isVisible
            ? Container(
                margin: const EdgeInsets.only(top: 4.0, bottom: 4.0),
                padding: const EdgeInsets.symmetric(
                  horizontal: 8.0,
                  vertical: 4.0,
                ),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12.0),
                  boxShadow: [
                    BoxShadow(
                      color: colorScheme.shadow.withOpacity(0.1),
                      blurRadius: 4.0,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ActionButton(
                      icon: isFavorited
                          ? Icons.favorite
                          : Icons.favorite_border,
                      color: isFavorited
                          ? colorScheme.error
                          : colorScheme.onSurfaceVariant,
                      tooltip: isFavorited
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos',
                      onTap: onFavorite,
                    ),
                    const SizedBox(width: 4.0),
                    _ActionButton(
                      icon: Icons.edit_note,
                      color: colorScheme.onSurfaceVariant,
                      tooltip: 'Agregar nota',
                      onTap: onNote,
                    ),
                    const SizedBox(width: 4.0),
                    _ActionButton(
                      icon: Icons.share_outlined,
                      color: colorScheme.onSurfaceVariant,
                      tooltip: 'Compartir',
                      onTap: onShare,
                    ),
                  ],
                ),
              )
            : const SizedBox.shrink(),
      ),
    );
  }
}

/// Internal action button widget used within [VerseActionBar].
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.tooltip,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8.0),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Icon(
              icon,
              size: 22.0,
              color: color,
              semanticLabel: tooltip,
            ),
          ),
        ),
      ),
    );
  }
}
