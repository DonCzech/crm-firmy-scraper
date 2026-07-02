import SwiftUI

struct RegisterView: View {
    @StateObject private var viewModel: AuthViewModel
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) var dismiss

    init(authService: AuthService) {
        _viewModel = StateObject(wrappedValue: AuthViewModel(authService: authService))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "person.badge.plus")
                            .font(.system(size: 40))
                            .foregroundColor(.rixoOrange)
                        Text("Vytvořit účet")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.rixoTextPrimary)
                        Text("Registrace je zdarma a trvá méně než minutu.")
                            .font(.system(size: 14))
                            .foregroundColor(.rixoTextSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 16)

                    // Form fields
                    VStack(spacing: 14) {
                        HStack(spacing: 12) {
                            RixoTextField(
                                placeholder: "Jméno",
                                text: $viewModel.firstName,
                                icon: "person.fill",
                                errorMessage: viewModel.firstNameError,
                                isRequired: true
                            )
                            RixoTextField(
                                placeholder: "Příjmení",
                                text: $viewModel.lastName,
                                errorMessage: viewModel.lastNameError,
                                isRequired: true
                            )
                        }

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
                            placeholder: "Telefon (+420 ...)",
                            text: $viewModel.phone,
                            keyboardType: .phonePad,
                            icon: "phone.fill",
                            errorMessage: viewModel.phoneError,
                            isRequired: true
                        )

                        RixoTextField(
                            placeholder: "Heslo (min. 6 znaků)",
                            text: $viewModel.password,
                            isSecure: true,
                            icon: "lock.fill",
                            errorMessage: viewModel.passwordError,
                            isRequired: true
                        )

                        RixoTextField(
                            placeholder: "Potvrdit heslo",
                            text: $viewModel.confirmPassword,
                            isSecure: true,
                            icon: "lock.fill",
                            isRequired: true
                        )
                    }

                    // GDPR Checkbox
                    Button(action: { viewModel.gdprConsent.toggle() }) {
                        HStack(alignment: .top, spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(viewModel.gdprConsent ? Color.rixoOrange : Color.gray.opacity(0.4), lineWidth: 2)
                                    .frame(width: 22, height: 22)
                                if viewModel.gdprConsent {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(Color.rixoOrange)
                                        .frame(width: 22, height: 22)
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            }
                            .animation(.easeInOut(duration: 0.15), value: viewModel.gdprConsent)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Souhlasím s podmínkami zpracování osobních údajů a")
                                    .font(.system(size: 13))
                                    .foregroundColor(.rixoTextSecondary)
                                Text("Obchodními podmínkami RIXO")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.rixoOrange)
                            }
                        }
                    }
                    .buttonStyle(PlainButtonStyle())

                    // Error message
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

                    // Register button
                    RixoButton(
                        title: "Vytvořit účet",
                        action: { Task { await viewModel.register() } },
                        isLoading: authService.isLoading,
                        isDisabled: !viewModel.canRegister
                    )

                    // Login link
                    HStack(spacing: 4) {
                        Text("Již máte účet?")
                            .font(.system(size: 14))
                            .foregroundColor(.rixoTextSecondary)
                        Button(action: { dismiss() }) {
                            Text("Přihlásit se")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.rixoOrange)
                        }
                    }
                    .padding(.bottom, 32)
                }
                .padding(.horizontal, 24)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Registrace")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.rixoTextSecondary)
                    }
                }
            }
        }
    }
}

#Preview {
    RegisterView(authService: AuthService())
        .environmentObject(AuthService())
}
