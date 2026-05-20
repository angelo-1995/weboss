import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../settings/domain/entities/theme_settings.dart';
import '../../data/services/image_generator_impl.dart';
import '../../domain/services/image_generator_service.dart';

/// Provider for the [ImageGeneratorService] implementation.
///
/// Overridable in tests to inject a mock or fake implementation.
final imageGeneratorServiceProvider = Provider<ImageGeneratorService>((ref) {
  return ImageGeneratorImpl();
});

/// Represents the current state of the share image generation flow.
sealed class ShareState {
  const ShareState();
}

/// Initial idle state — no generation in progress.
class ShareIdle extends ShareState {
  const ShareIdle();
}

/// Image generation is in progress.
class ShareLoading extends ShareState {
  const ShareLoading();
}

/// Image generation succeeded with PNG bytes ready to share.
class ShareSuccess extends ShareState {
  final Uint8List imageBytes;
  const ShareSuccess(this.imageBytes);
}

/// Image generation failed with an error message.
class ShareError extends ShareState {
  final String message;
  const ShareError(this.message);
}

/// Parameters needed to generate a share image.
class ShareImageParams {
  final String verseText;
  final String reference;
  final ImageStyle style;
  final AppTypeface typeface;

  const ShareImageParams({
    required this.verseText,
    required this.reference,
    required this.style,
    required this.typeface,
  });
}

/// StateNotifier that manages the share image generation flow.
///
/// Handles generating the image, transitioning through loading/success/error
/// states, and resetting state when the flow is dismissed.
class ShareNotifier extends StateNotifier<ShareState> {
  final ImageGeneratorService _imageGenerator;

  ShareNotifier(this._imageGenerator) : super(const ShareIdle());

  /// Generates a verse image with the given parameters.
  ///
  /// Transitions state: Idle → Loading → Success/Error.
  Future<Uint8List?> generateImage(ShareImageParams params) async {
    state = const ShareLoading();

    final result = await _imageGenerator.generateImage(
      verseText: params.verseText,
      reference: params.reference,
      style: params.style,
      typeface: params.typeface,
    );

    return result.when(
      success: (bytes) {
        state = ShareSuccess(bytes);
        return bytes;
      },
      failure: (error) {
        final message = switch (error) {
          final e => e.toString(),
        };
        state = ShareError(message);
        return null;
      },
    );
  }

  /// Resets the state back to idle.
  void reset() {
    state = const ShareIdle();
  }
}

/// Provider for the [ShareNotifier] that manages share flow state.
final shareNotifierProvider =
    StateNotifierProvider<ShareNotifier, ShareState>((ref) {
  final imageGenerator = ref.watch(imageGeneratorServiceProvider);
  return ShareNotifier(imageGenerator);
});
