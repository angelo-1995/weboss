import 'package:flutter/material.dart';

/// A reusable empty state component displayed when a list or content area
/// has no data to show.
///
/// Provides a centered layout with an icon, title, subtitle, and optional
/// action button. Follows the 8dp grid system for spacing and uses
/// soft border radius (12-16dp) per Requirement 11.3.
class EmptyState extends StatelessWidget {
  /// Creates an empty state widget.
  ///
  /// [icon] is the main visual indicator (e.g., Icons.bookmark_border).
  /// [title] is the primary message (e.g., "No hay favoritos").
  /// [subtitle] provides additional context or instructions.
  /// [actionLabel] and [onAction] define an optional CTA button.
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.iconSize = 64,
    this.iconColor,
  });

  /// The icon displayed at the top of the empty state.
  final IconData icon;

  /// The primary title text.
  final String title;

  /// Optional subtitle providing additional context or instructions.
  final String? subtitle;

  /// Optional label for the action button.
  final String? actionLabel;

  /// Optional callback when the action button is pressed.
  final VoidCallback? onAction;

  /// Size of the icon. Defaults to 64dp.
  final double iconSize;

  /// Custom icon color. Defaults to theme's onSurfaceVariant.
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Center(
      child: Padding(
        // 8dp grid: 32dp horizontal padding (4 × 8dp).
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with subtle container background.
            Container(
              padding: const EdgeInsets.all(24), // 3 × 8dp
              decoration: BoxDecoration(
                color: colorScheme.primaryContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(16), // Soft border radius
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: iconColor ?? colorScheme.onSurfaceVariant,
              ),
            ),

            const SizedBox(height: 24), // 3 × 8dp

            // Title text.
            Text(
              title,
              style: theme.textTheme.headlineMedium?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),

            // Subtitle text (if provided).
            if (subtitle != null) ...[
              const SizedBox(height: 8), // 1 × 8dp
              Text(
                subtitle!,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ],

            // Action button (if provided).
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24), // 3 × 8dp
              FilledButton.tonal(
                onPressed: onAction,
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12), // Soft border radius
                  ),
                ),
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
