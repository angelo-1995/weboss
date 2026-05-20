import 'package:flutter/material.dart';

/// A reusable error state component displayed when an operation fails.
///
/// Provides a centered layout with an error icon, title, message, and
/// retry button. Follows the 8dp grid system for spacing and uses
/// soft border radius (12-16dp) per Requirement 11.3.
class ErrorState extends StatelessWidget {
  /// Creates an error state widget.
  ///
  /// [title] is the primary error heading (e.g., "Error al cargar").
  /// [message] provides details about what went wrong.
  /// [onRetry] is the callback for the retry button.
  const ErrorState({
    super.key,
    required this.title,
    required this.message,
    required this.onRetry,
    this.icon = Icons.error_outline_rounded,
    this.retryLabel = 'Reintentar',
    this.iconSize = 64,
  });

  /// The error icon displayed at the top.
  final IconData icon;

  /// The primary error title.
  final String title;

  /// The error message providing details.
  final String message;

  /// Callback when the retry button is pressed.
  final VoidCallback onRetry;

  /// Label for the retry button.
  final String retryLabel;

  /// Size of the error icon. Defaults to 64dp.
  final double iconSize;

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
            // Error icon with subtle error container background.
            Container(
              padding: const EdgeInsets.all(24), // 3 × 8dp
              decoration: BoxDecoration(
                color: colorScheme.errorContainer.withOpacity(0.3),
                borderRadius: BorderRadius.circular(16), // Soft border radius
              ),
              child: Icon(
                icon,
                size: iconSize,
                color: colorScheme.error,
              ),
            ),

            const SizedBox(height: 24), // 3 × 8dp

            // Error title.
            Text(
              title,
              style: theme.textTheme.headlineMedium?.copyWith(
                color: colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8), // 1 × 8dp

            // Error message.
            Text(
              message,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24), // 3 × 8dp

            // Retry button.
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 20),
              label: Text(retryLabel),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12), // Soft border radius
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
