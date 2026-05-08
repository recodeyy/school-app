import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/auth_model.dart';
import '../core/providers/service_providers.dart';

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _loadUserFromPrefs();
    return AuthState();
  }

  Future<void> _loadUserFromPrefs() async {
    final service = ref.read(authServiceProvider);
    final isLoggedIn = await service.isLoggedIn();
    if (isLoggedIn) {
      try {
        final profile = await service.getProfile();
        state = state.copyWith(user: profile);
      } catch (_) {
        await service.logout();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final service = ref.read(authServiceProvider);
      final response = await service.login(email, password);
      state = state.copyWith(user: response.user, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
      return false;
    }
  }

  Future<void> logout() async {
    await ref.read(authServiceProvider).logout();
    state = AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
