import SwiftUI
import LocalAuthentication

struct LoginView: View {
    @EnvironmentObject var authService: AuthService
    @StateObject private var viewModel: AuthViewModel
    @State private var showRegister: Bool = false
    @State private var showResetPassword: Bool = false

    init(authService: AuthService) {
        _viewModel = StateObject(wrappedValue: AuthViewModel(authService: authService))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color.rixoOrange)
                                .frame(width: 72, height: 72)
                            Image(systemName: "shield.fill")
                                .font(.system(size: 34))
                                .foregroundColor(.white)
                        }

                        VStack(spacing: 6) {
                            Text("RIXO")
                                .font(.system(size: 28, weight: .black))
                                .foregroundColor(.rixoOrange)
                                .tracking(2)
                            Text("Vaše pojišťovací platforma")
                                .font(.system(size: 14))
                                .foregroundColor(.rixoTextSecondary)
                        }
                    }
                    .padding(.top, 48)
                    .padding(.bottom, 40)

                    // Form
                    VStack(spacing: 16) {
                        RixoTextField(
                            placeholder: "E-mail",
                            text: $viewModel.email,
                            keyboardType: .emailAddress,
                            icon: "envelope.fill",
                            errorMessage: viewModel.emailError,
                            isRequired: true,
                            autocapitalization: .never
                        )

                        RixoTextField(
                            placeholder: "Heslo",
                            text: $viewModel.password,
                            isSecure: true,
                            icon: "lock.fill",
                            errorMessage: viewModel.passwordError,
                            isRequired: true
                        )

                        HStack {
                            Spacer()
                            Button(action: { showResetPassword = true }) {
                                Text("Zapomněli jste heslo?")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.rixoOrange)
                            }
                        }

                        if let error = viewModel.errorMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundColor(.rixoDanger)
                                Text(error)
                                    .font(.system(size: 13))
                                    .foregroundColor(.rixoDanger)
                            }
                            .padding(12)
                            .background(Color.rixoDanger.opacity(0.08))
                            .cornerRadius(10)
                        }

                        RixoButton(
                            title: "Přihlásit se",
                            action: { Task { await viewModel.login() } },
                            isLoading: authService.isLoading
                        )

                        // Biometric
                        if canUseBiometrics {
                            Button(action: { Task { await viewModel.loginWithBiometrics() } }) {
                                HStack(spacing: 10) {
                                    Image(systemName: biometricIcon)
                                        .font(.system(size: 20))
                                    Text("Přihlásit se pomocí \(biometricLabel)")
                                        .font(.system(size: 15, weight: .medium))
                                }
                                .foregroundColor(.rixoOrange)
                                .frame(maxWidth: .infinity)
                                .frame(height: 52)
                                .background(Color.rixoOrange.opacity(0.08))
                                .cornerRadius(14)
                            }
                        }
                    }
                    .padding(.horizontal, 24)

                    // Divider
                    HStack(spacing: 12) {
                        Rectangle().fill(Color.gray.opacity(0.2)).frame(height: 1)
                        Text("nebo")
                            .font(.system(size: 13))
                            .foregroundColor(.rixoTextSecondary)
                        Rectangle().fill(Color.gray.opacity(0.2)).frame(height: 1)
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 24)

                    // Social login
                    VStack(spacing: 12) {
                        SocialLoginButton(icon: "globe", title: "Pokračovat s Google", color: Color(hex: "#4285F4"), action: {})
                        SocialLoginButton(icon: "apple.logo", title: "Pokračovat s Apple", color: Color.black, action: {})
                        SocialLoginButton(icon: "person.fill", title: "Pokračovat s Facebook", color: Color(hex: "#1877F2"), action: {})
                    }
                    .padding(.horizontal, 24)

                    // Register link
                    HStack(spacing: 4) {
                        Text("Nemáte účet?")
                            .font(.system(size: 15))
                            .foregroundColor(.rixoTextSecondary)
                        Button(action: { showRegister = true }) {
                            Text("Registrovat se")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.rixoOrange)
                        }
                    }
                    .padding(.top, 32)
                    .padding(.bottom, 48)
                }
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showRegister) {
            RegisterView(authService: authService)
        }
        .sheet(isPresented: $showResetPassword) {
            ResetPasswordView()
        }
    }

    private var canUseBiometrics: Bool {
        let context = LAContext()
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    }

    private var biometricIcon: String {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType == .faceID ? "faceid" : "touchid"
    }

    private var biometricLabel: String {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType == .faceID ? "Face ID" : "Touch ID"
    }
}

struct SocialLoginButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(color)
                    .frame(width: 24)
                Text(title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.rixoTextPrimary)
                Spacer()
            }
            .padding(.horizontal, 16)
            .frame(height: 52)
            .background(Color.rixoCard)
            .cornerRadius(14)
            .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 2)
        }
    }
}

struct ResetPasswordView: View {
    @StateObject private var localAuthService = AuthService()
    @Environment(\.dismiss) var dismiss
    @State private var email: String = ""
    @State private var emailSent: Bool = false
    @State private var emailError: String? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Image(systemName: "key.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.rixoOrange)
                    Text("Obnovení hesla")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.rixoTextPrimary)
                    Text("Zadejte svůj e-mail a pošleme vám odkaz pro obnovení hesla.")
                        .font(.system(size: 15))
                        .foregroundColor(.rixoTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 16)

                if emailSent {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.rixoSuccess)
                        Text("E-mail odeslán!")
                            .font(.system(size: 18, weight: .semibold))
                        Text("Zkontrolujte vaši e-mailovou schránku.")
                            .foregroundColor(.rixoTextSecondary)
                    }
                } else {
                    RixoTextField(
                        placeholder: "E-mail",
                        text: $email,
                        keyboardType: .emailAddress,
                        icon: "envelope.fill",
                        errorMessage: emailError,
                        autocapitalization: .never
                    )

                    RixoButton(
                        title: "Odeslat odkaz",
                        action: {
                            guard AuthService.isValidEmail(email) else {
                                emailError = "Zadejte platný e-mail"
                                return
                            }
                            Task {
                                let result = await localAuthService.resetPassword(email: email)
                                await MainActor.run { emailSent = result }
                            }
                        },
                        isLoading: localAuthService.isLoading
                    )
                }

                Spacer()
            }
            .padding(.horizontal, 24)
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Zapomenuté heslo")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Zavřít") { dismiss() }
                        .foregroundColor(.rixoOrange)
                }
            }
        }
    }
}

#Preview {
    LoginView(authService: AuthService())
        .environmentObject(AuthService())
}
