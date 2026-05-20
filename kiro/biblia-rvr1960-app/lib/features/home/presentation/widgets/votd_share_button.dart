import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

import '../../domain/entities/verse_of_day.dart';

/// A share button widget for the Verse of the Day card.
///
/// Invokes the device share sheet with the verse text, reference
/// (book chapter:verse), and "RVR1960" attribution via [VerseOfDay.shareText].
///
/// Displays a [SnackBar] if sharing fails.
class VotdShareButton extends StatelessWidget {
  const VotdShareButton({
    super.key,
    required this.verseOfDay,
  });

  /// The verse of the day to share.
  final VerseOfDay verseOfDay;

  Future<void> _handleShare(BuildContext context) async {
    try {
      final result = await Share.share(
        verseOfDay.shareText,
        subject: 'Versículo del día — ${verseOfDay.reference}',
      );

      // If the share was dismissed or unavailable, we don't show an error.
      // Only show error on actual failures caught below.
      if (result.status == ShareResultStatus.unavailable) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('No se pudo compartir el versículo. Intenta de nuevo.'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      }
    } catch (_) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo compartir el versículo. Intenta de nuevo.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.share_outlined),
      tooltip: 'Compartir versículo',
      onPressed: () => _handleShare(context),
    );
  }
}
