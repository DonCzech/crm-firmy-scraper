import Foundation
import SwiftUI
import Combine

class AuthViewModel: ObservableObject {
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var phone: String = ""
    @Published var gdprConsent: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var showResetPassword: Bool = false
    @Published var resetEmailSent: Bool = false

    // Field validation errors
    @Published var emailError: String? = nil
    @Published var passwordError: String? = nil
    @Published var phoneError: String? = nil
    @Published var firstNameError: String? = nil
    @Published var lastNameError: String? = nil

    let authService: AuthService

    init(authService: AuthService) {
        self.authService = authService
    }

    var canLogin: Bool {
        !email.isEmpty && !password.isEmpty
    }

    var canRegister: Bool {
        !firstName.isEmpty && !lastName.isEmpty &&
        !email.isEmpty && !phone.isEmpty &&
        !password.isEmpty && !confirmPassword.isEmpty && gdprConsent
    }

    func login() async {
        guard validateLoginForm() else { return }
        await authService.login(email: email, password: password)
        await MainActor.run {
            self.errorMessage = authService.errorMessage
        }
    }

    func loginWithBiometrics() async {
        await authService.loginWithBiometrics()
        await MainActor.run {
            self.errorMessage = authService.errorMessage
        }
    }

    func register() async {
        guard validateRegisterForm() else { return }
        await authService.register(
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            password: password
        )
        await MainActor.run {
            self.errorMessage = authService.errorMessage
        }
    }

    func resetPassword() async {
        guard AuthService.isValidEmail(email) else {
            await MainActor.run { emailError = "Zadejte platný e-mail" }
            return
        }
        let success = await authService.resetPassword(email: email)
        await MainActor.run {
            self.resetEmailSent = success
        }
    }

    private func validateLoginForm() -> Bool {
        var valid = true
        emailError = nil
        passwordError = nil

        if !AuthService.isValidEmail(email) {
            emailError = "Zadejte platný e-mail"
            valid = false
        }
        if password.count < 6 {
            passwordError = "Heslo musí mít alespoň 6 znaků"
            valid = false
        }
        return valid
    }

    private func validateRegisterForm() -> Bool {
        var valid = true
        emailError = nil
        passwordError = nil
        phoneError = nil
        firstNameError = nil
        lastNameError = nil

        if firstName.trimmingCharacters(in: .whitespaces).isEmpty {
            firstNameError = "Vyplňte jméno"
            valid = false
        }
        if lastName.trimmingCharacters(in: .whitespaces).isEmpty {
            lastNameError = "Vyplňte příjmení"
            valid = false
        }
        if !AuthService.isValidEmail(email) {
            emailError = "Zadejte platný e-mail"
            valid = false
        }
        if !AuthService.isValidPhone(phone) {
            phoneError = "Zadejte platné telefonní číslo"
            valid = false
        }
        if password.count < 6 {
            passwordError = "Heslo musí mít alespoň 6 znaků"
            valid = false
        }
        if password != confirmPassword {
            passwordError = "Hesla se neshodují"
            valid = false
        }
        return valid
    }

    func clearErrors() {
        emailError = nil
        passwordError = nil
        phoneError = nil
        firstNameError = nil
        lastNameError = nil
        errorMessage = nil
    }
}
