/// Sealed class hierarchy representing application errors.
sealed class AppError {
  const AppError(this.message);

  /// Human-readable error message.
  final String message;

  factory AppError.storage(String message) = StorageError;
  factory AppError.validation(String message) = ValidationError;
  factory AppError.initialization(String message) = InitializationError;
  factory AppError.notFound(String message) = NotFoundError;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AppError &&
          runtimeType == other.runtimeType &&
          message == other.message;

  @override
  int get hashCode => Object.hash(runtimeType, message);

  @override
  String toString() => '$runtimeType(message: $message)';
}

/// Error related to local storage operations.
class StorageError extends AppError {
  const StorageError(super.message);
}

/// Error related to input validation.
class ValidationError extends AppError {
  const ValidationError(super.message);
}

/// Error related to app or database initialization.
class InitializationError extends AppError {
  const InitializationError(super.message);
}

/// Error when a requested resource is not found.
class NotFoundError extends AppError {
  const NotFoundError(super.message);
}

/// Sealed class representing the result of an operation that can succeed or fail.
sealed class Result<T> {
  const Result();

  factory Result.success(T data) = Success<T>;
  factory Result.failure(AppError error) = Failure<T>;

  /// Pattern-matches on the result, calling [success] or [failure] accordingly.
  R when<R>({
    required R Function(T data) success,
    required R Function(AppError error) failure,
  });
}

/// A successful result containing [data].
class Success<T> extends Result<T> {
  const Success(this.data);

  final T data;

  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(AppError error) failure,
  }) =>
      success(data);

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Success<T> && data == other.data;

  @override
  int get hashCode => data.hashCode;

  @override
  String toString() => 'Success($data)';
}

/// A failed result containing an [AppError].
class Failure<T> extends Result<T> {
  const Failure(this.error);

  final AppError error;

  @override
  R when<R>({
    required R Function(T data) success,
    required R Function(AppError error) failure,
  }) =>
      failure(error);

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is Failure<T> && error == other.error;

  @override
  int get hashCode => error.hashCode;

  @override
  String toString() => 'Failure($error)';
}
