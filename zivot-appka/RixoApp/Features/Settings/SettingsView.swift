import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authService: AuthService
    @StateObject private var viewModel = SettingsViewModel()
    @State private var showEditProfile = false
    @State private var showChangePassword = false
    @State private var showDeleteConfirmation = false
    @State private var showLogoutConfirmation = false

    var body: some View {
        NavigationStack {
            List {
                // User header
                Section {
                    userHeaderCell
                }

                // Account
                Section("ÚČET") {
                    SettingsRow(
                        icon: "person.fill",
                        title: "Osobní údaje",
                        color: .rixoOrange,
                        action: { showEditProfile = true }
                    )
                    securitySection
                    linkedAccountsSection
                }

                // Notifications
                Section("NOTIFIKACE") {
                    SettingsToggleRow(
                        icon: "calendar.badge.exclamationmark",
                        title: "Termíny (STK, nálepka)",
                        color: .rixoWarning,
                        isOn: $viewModel.notificationsDeadlines
                    )
                    SettingsToggleRow(
                        icon: "creditcard.fill",
                        title: "Platby",
                        color: Color(hex: "#007AFF"),
                        isOn: $viewModel.notificationsPayments
                    )
                    SettingsToggleRow(
                        icon: "bell.badge.fill",
                        title: "Novinky a nabídky",
                        color: .rixoSuccess,
                        isOn: $viewModel.notificationsNews
                    )
                }

                // App
                Section("APLIKACE") {
                    HStack {
                        Label("Jazyk", systemImage: "globe")
                            .foregroundColor(.rixoTextPrimary)
                        Spacer()
                        Picker("", selection: $viewModel.selectedLanguage) {
                            ForEach(viewModel.languages, id: \.self) { lang in
                                Text(lang).tag(lang)
                            }
                        }
                        .pickerStyle(.menu)
                        .tint(.rixoOrange)
                    }

                    HStack {
                        Label("O aplikaci", systemImage: "info.circle.fill")
                            .foregroundColor(.rixoTextPrimary)
                        Spacer()
                        Text(viewModel.appVersion)
                            .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                    }

                    SettingsRow(icon: "doc.text.fill", title: "Podmínky použití", color: .rixoTextSecondary, action: {})
                    SettingsRow(icon: "hand.raised.fill", title: "Zásady soukromí", color: .rixoTextSecondary, action: {})
                    SettingsRow(icon: "star.fill", title: "Hodnotit aplikaci", color: Color(hex: "#FFD60A"), action: { viewModel.rateApp() })

                    HStack {
                        Label("Kontakt", systemImage: "phone.fill")
                            .foregroundColor(.rixoTextPrimary)
                        Spacer()
                        Button(action: { viewModel.openContact() }) {
                            Text("Zavolat")
                                .font(.system(size: 13, weight: .medium)).foregroundColor(.rixoOrange)
                        }
                        Button(action: { viewModel.sendEmail() }) {
                            Text("E-mail")
                                .font(.system(size: 13, weight: .medium)).foregroundColor(.rixoOrange)
                        }
                    }
                }

                // Danger zone
                Section("ODHLÁŠENÍ") {
                    Button(action: { showLogoutConfirmation = true }) {
                        HStack {
                            Image(systemName: "arrow.right.circle.fill")
                                .foregroundColor(.rixoDanger)
                            Text("Odhlásit se")
                                .foregroundColor(.rixoDanger)
                        }
                    }

                    Button(action: { showDeleteConfirmation = true }) {
                        HStack {
                            Image(systemName: "trash.fill")
                                .foregroundColor(.rixoDanger.opacity(0.6))
                            Text("Smazat účet")
                                .foregroundColor(.rixoDanger.opacity(0.6))
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Nastavení")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showEditProfile) {
                EditProfileView()
            }
        }
        .confirmationDialog("Odhlásit se", isPresented: $showLogoutConfirmation, titleVisibility: .visible) {
            Button("Odhlásit se", role: .destructive) { authService.logout() }
            Button("Zrušit", role: .cancel) {}
        } message: {
            Text("Opravdu se chcete odhlásit?")
        }
        .confirmationDialog("Smazat účet", isPresented: $showDeleteConfirmation, titleVisibility: .visible) {
            Button("Smazat účet", role: .destructive) { authService.logout() }
            Button("Zrušit", role: .cancel) {}
        } message: {
            Text("Tato akce je nevratná. Veškerá vaše data budou trvale smazána.")
        }
    }

    private var userHeaderCell: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle().fill(Color.rixoOrange).frame(width: 56, height: 56)
                Text(authService.currentUser?.initials ?? "??")
                    .font(.system(size: 20, weight: .bold)).foregroundColor(.white)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(authService.currentUser?.fullName ?? "Uživatel")
                    .font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                Text(authService.currentUser?.email ?? "")
                    .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
            }
            Spacer()
            Button(action: { showEditProfile = true }) {
                Text("Upravit")
                    .font(.system(size: 13, weight: .medium)).foregroundColor(.rixoOrange)
            }
        }
        .padding(.vertical, 8)
    }

    private var securitySection: some View {
        Group {
            SettingsToggleRow(
                icon: "faceid",
                title: "Face ID / Touch ID",
                color: Color(hex: "#5856D6"),
                isOn: Binding(
                    get: { authService.currentUser?.biometricEnabled ?? false },
                    set: { enabled in
                        var user = authService.currentUser ?? User.sample
                        user.biometricEnabled = enabled
                        authService.updateUser(user)
                    }
                )
            )
            SettingsRow(icon: "lock.rotation", title: "Změnit heslo", color: Color(hex: "#FF9500"), action: {})
        }
    }

    private var linkedAccountsSection: some View {
        Group {
            SettingsToggleRow(
                icon: "globe",
                title: "Google",
                color: Color(hex: "#4285F4"),
                isOn: $viewModel.connectedGoogle
            )
            SettingsToggleRow(
                icon: "apple.logo",
                title: "Apple",
                color: Color.black,
                isOn: $viewModel.connectedApple
            )
            SettingsToggleRow(
                icon: "person.fill",
                title: "Facebook",
                color: Color(hex: "#1877F2"),
                isOn: $viewModel.connectedFacebook
            )
        }
    }
}

struct SettingsRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon).foregroundColor(color).frame(width: 20)
                Text(title).foregroundColor(.rixoTextPrimary)
                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12)).foregroundColor(.gray.opacity(0.5))
            }
        }
    }
}

struct SettingsToggleRow: View {
    let icon: String
    let title: String
    let color: Color
    @Binding var isOn: Bool

    var body: some View {
        HStack {
            Image(systemName: icon).foregroundColor(color).frame(width: 20)
            Text(title).foregroundColor(.rixoTextPrimary)
            Spacer()
            Toggle("", isOn: $isOn).tint(.rixoOrange)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthService())
}
