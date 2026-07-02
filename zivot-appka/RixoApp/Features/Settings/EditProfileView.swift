import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject var authService: AuthService
    @Environment(\.dismiss) var dismiss
    @State private var user: User = User.sample
    @State private var isSaving = false
    @State private var saveSuccess = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Avatar
                    VStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color.rixoOrange).frame(width: 80, height: 80)
                            Text(user.initials)
                                .font(.system(size: 28, weight: .bold)).foregroundColor(.white)
                        }
                        Button(action: {}) {
                            Text("Změnit foto")
                                .font(.system(size: 14, weight: .medium)).foregroundColor(.rixoOrange)
                        }
                    }
                    .padding(.top, 8)

                    // Fields
                    VStack(spacing: 14) {
                        sectionHeader("Základní údaje")
                        HStack(spacing: 12) {
                            RixoTextField(placeholder: "Jméno", text: $user.firstName, icon: "person.fill", isRequired: true)
                            RixoTextField(placeholder: "Příjmení", text: $user.lastName, isRequired: true)
                        }
                        RixoTextField(placeholder: "E-mail", text: $user.email, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
                        RixoTextField(placeholder: "Telefon", text: $user.phone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)

                        sectionHeader("Adresa")
                        HStack(spacing: 12) {
                            RixoTextField(placeholder: "Ulice", text: $user.address.street, icon: "mappin.circle.fill")
                            RixoTextField(placeholder: "Č.P.", text: $user.address.houseNumber, keyboardType: .numberPad)
                        }
                        HStack(spacing: 12) {
                            RixoTextField(placeholder: "Město", text: $user.address.city)
                            RixoTextField(placeholder: "PSČ", text: $user.address.postalCode, keyboardType: .numberPad)
                        }
                    }

                    if saveSuccess {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill").foregroundColor(.rixoSuccess)
                            Text("Změny uloženy").font(.system(size: 14)).foregroundColor(.rixoSuccess)
                        }
                    }

                    RixoButton(
                        title: "Uložit změny",
                        action: {
                            isSaving = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                                authService.updateUser(user)
                                isSaving = false
                                saveSuccess = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { saveSuccess = false }
                            }
                        },
                        isLoading: isSaving
                    )
                }
                .padding(.horizontal, 20).padding(.bottom, 32)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Osobní údaje")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Text("Zrušit").foregroundColor(.rixoTextSecondary) }
                }
            }
            .onAppear {
                if let u = authService.currentUser { user = u }
            }
        }
    }

    private func sectionHeader(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 13, weight: .semibold)).foregroundColor(.rixoTextSecondary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    EditProfileView().environmentObject(AuthService())
}
