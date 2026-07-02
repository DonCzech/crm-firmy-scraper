import Foundation
import SwiftUI
import Combine

class SettingsViewModel: ObservableObject {
    @Published var notificationsDeadlines: Bool = true
    @Published var notificationsPayments: Bool = true
    @Published var notificationsNews: Bool = false

    @Published var connectedGoogle: Bool = false
    @Published var connectedApple: Bool = false
    @Published var connectedFacebook: Bool = false

    @Published var selectedLanguage: String = "Čeština"
    let languages = ["Čeština", "Slovenština"]

    @Published var showDeleteConfirmation: Bool = false
    @Published var showLogoutConfirmation: Bool = false

    let appVersion = "1.0.0 (Build 42)"

    func toggleNotification(type: NotificationType) {
        switch type {
        case .deadlines: notificationsDeadlines.toggle()
        case .payments: notificationsPayments.toggle()
        case .news: notificationsNews.toggle()
        }
    }

    enum NotificationType {
        case deadlines, payments, news
    }

    func rateApp() {
        // Would open App Store review
    }

    func openContact() {
        if let url = URL(string: "tel:+420800RIXO00") {
            UIApplication.shared.open(url)
        }
    }

    func sendEmail() {
        if let url = URL(string: "mailto:info@rixo.cz") {
            UIApplication.shared.open(url)
        }
    }
}
