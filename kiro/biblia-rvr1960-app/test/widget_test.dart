import 'package:flutter_test/flutter_test.dart';
import 'package:biblia_rvr1960/app.dart';

void main() {
  testWidgets('App renders correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const BibliaApp());
    expect(find.text('Biblia RVR1960'), findsOneWidget);
  });
}
