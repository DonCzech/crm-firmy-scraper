import Foundation
import SwiftUI
import LocalAuthentication

class AuthService: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: User?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    @AppStorage("isLoggedIn") private var storedLoginState: Bool = false
    @AppStorage("userId") private var storedUserId: String = ""

    init() {
        isLoggedIn = storedLoginState
        if isLoggedIn {
            currentUser = User.sample
        }
    }

    func login(email: String, password: String) async {
        await MainActor.run { isLoading = true; errorMessage = nil }

        // Simulate network call
        try? await Task.sleep(nanoseconds: 1_500_000_000)

        await MainActor.run {
            isLoading = false
            if email.contains("@") && password.count >= 6 {
                self.currentUser = User(
                    id: "user-001",
                    firstName: "Jan",
                    lastName: "Novák",
                    email: email,
                    phone: "+420 777 123 456",
                    address: Address(street: "Václavské náměstí", houseNumber: "1", city: "Praha", postalCode: "110 00"),
                    biometricEnabled: true
                )
                self.isLoggedIn = true
                self.storedLoginState = true
                self.storedUserId = "user-001"
            } else {
                self.errorMessage = "Nesprávný email nebo heslo."
            }
        }
    }

    func register(firstName: String, lastName: String, email: String, phone: String, password: String) async {
        await MainActor.run { isLoading = true; errorMessage = nil }

        try? await Task.sleep(nanoseconds: 1_500_000_000)

        await MainActor.run {
            isLoading = false
            self.currentUser = User(
                id: UUID().uuidString,
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                address: Address(),
                biometricEnabled: false
            )
            self.isLoggedIn = true
            self.storedLoginState = true
        }
    }

    func loginWithBiometrics() async {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            await MainActor.run { errorMessage = "Biometrika není dostupná." }
            return
        }

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Přihlaste se do aplikace Rixo"
            )
            if success {
                await MainActor.run {
                    self.currentUser = User.sample
                    self.isLoggedIn = true
                    self.storedLoginState = true
                }
            }
        } catch {
            await MainActor.run { self.errorMessage = "Biometrické přihlášení selhalo." }
        }
    }

    func logout() {
        isLoggedIn = false
        currentUser = nil
        storedLoginState = false
        storedUserId = ""
    }

    func updateUser(_ user: User) {
        currentUser = user
    }

    func resetPassword(email: String) async -> Bool {
        await MainActor.run { isLoading = true }
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        await MainActor.run { isLoading = false }
        return true
    }

    // Validation helpers
    static func isValidEmail(_ email: String) -> Bool {
        let regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: email)
    }

    static func isValidPhone(_ phone: String) -> Bool {
        let cleaned = phone.filter { $0.isNumber || $0 == "+" }
        return cleaned.count >= 9
    }

    static func isValidRC(_ rc: String) -> Bool {
        let cleaned = rc.filter { $0.isNumber }
        return cleaned.count == 9 || cleaned.count == 10
    }

    static func isValidSPZ(_ spz: String) -> Bool {
        let regex = "^[A-Z0-9]{5,8}$"
        let cleaned = spz.uppercased().filter { $0.isLetter || $0.isNumber }
        return NSPredicate(format: "SELF MATCHES %@", regex).evaluate(with: cleaned)
    }

    static func isValidPSC(_ psc: String) -> Bool {
        let cleaned = psc.filter { $0.isNumber }
        return cleaned.count == 5
    }
}
