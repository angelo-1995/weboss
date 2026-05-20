import 'dart:async';

import 'package:flutter/material.dart';

/// A shimmer/pulse animation widget for loading placeholders.
///
/// Only shows after a 300ms delay to avoid flash for fast loads (Requirement 11.6).
/// Uses [AnimatedOpacity] for smooth appearance and a pulsing animation
/// to indicate content is loading.
///
/// Follows the 8dp grid system with configurable dimensions and border radius
/// (12-16dp range per Requirement 11.3).
class SkeletonLoader extends StatefulWidget {
  /// Creates a skeleton loader placeholder.
  ///
  /// [width] and [height] define the placeholder dimensions.
  /// [borderRadius] defaults to 12dp (soft border radius per design spec).
  /// [delayMs] is the delay before showing the skeleton (default 300ms).
  const SkeletonLoader({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = 12,
    this.delayMs = 300,
  });

  /// Width of the skeleton placeholder. If null, expands to fill available width.
  final double? width;

  /// Height of the skeleton placeholder.
  final double height;

  /// Border radius of the skeleton placeholder (12-16dp per design spec).
  final double borderRadius;

  /// Delay in milliseconds before showing the skeleton (avoids flash for fast loads).
  final int delayMs;

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;
  Timer? _delayTimer;
  bool _visible = false;

  @override
  void initState() {
    super.initState();

    // Pulse animation: 200-400ms range for smooth feel (Requirement 11.2).
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _pulseAnimation = Tween<double>(begin: 0.3, end: 0.7).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _pulseController.repeat(reverse: true);

    // Only show after delay threshold (Requirement 11.6: shown when load > 300ms).
    _delayTimer = Timer(Duration(milliseconds: widget.delayMs), () {
      if (mounted) {
        setState(() => _visible = true);
      }
    });
  }

  @override
  void dispose() {
    _delayTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    // Smooth appearance with AnimatedOpacity (200ms transition).
    return AnimatedOpacity(
      opacity: _visible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 200),
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, child) {
          return Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(widget.borderRadius),
              color: colorScheme.surfaceContainerHighest
                  .withOpacity(_pulseAnimation.value),
            ),
          );
        },
      ),
    );
  }
}

/// A convenience widget that displays a group of skeleton loaders
/// matching a typical content layout (e.g., list items).
///
/// Useful for showing loading placeholders that match expected content layout
/// (Requirement 11.6).
class SkeletonLoaderGroup extends StatelessWidget {
  /// Creates a group of skeleton loaders.
  ///
  /// [itemCount] is the number of skeleton items to display.
  /// [spacing] follows the 8dp grid system.
  const SkeletonLoaderGroup({
    super.key,
    this.itemCount = 3,
    this.spacing = 16,
    this.delayMs = 300,
  });

  /// Number of skeleton items to display.
  final int itemCount;

  /// Vertical spacing between items (8dp grid).
  final double spacing;

  /// Delay before showing skeletons.
  final int delayMs;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(itemCount, (index) {
        return Padding(
          padding: EdgeInsets.only(bottom: index < itemCount - 1 ? spacing : 0),
          child: _SkeletonListItem(delayMs: delayMs),
        );
      }),
    );
  }
}

class _SkeletonListItem extends StatelessWidget {
  const _SkeletonListItem({this.delayMs = 300});

  final int delayMs;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SkeletonLoader(
          width: 40,
          height: 40,
          borderRadius: 12,
          delayMs: delayMs,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SkeletonLoader(height: 14, delayMs: delayMs),
              const SizedBox(height: 8),
              SkeletonLoader(
                height: 12,
                width: 160,
                delayMs: delayMs,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
