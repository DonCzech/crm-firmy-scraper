import Foundation
import SwiftUI

struct Deadline: Identifiable, Codable {
    var id: String
    var name: String
    var type: DeadlineType
    var date: Date
    var notificationsEnabled: Bool
    var linkedContractId: String?

    var daysRemaining: Int {
        let days = Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0
        return max(days, 0)
    }

    var urgencyColor: Color {
        if daysRemaining <= 10 { return Color(hex: "#FF3B30") }
        else if daysRemaining <= 30 { return Color(hex: "#FF9500") }
        else { return Color(hex: "#34C759") }
    }

    var urgencyLabel: String {
        if daysRemaining == 0 { return "Dnes!" }
        else if daysRemaining == 1 { return "Zítra!" }
        else { return "Za \(daysRemaining) dní" }
    }

    var isUrgent: Bool {
        daysRemaining <= 10
    }
}

extension Deadline {
    static let samples: [Deadline] = [
        Deadline(
            id: "dl-001",
            name: "STK – Škoda Octavia 1AB2345",
            type: .stk,
            date: Calendar.current.date(byAdding: .day, value: 23, to: Date())!,
            notificationsEnabled: true,
            linkedContractId: "contract-001"
        ),
        Deadline(
            id: "dl-002",
            name: "Dálniční nálepka 2026",
            type: .vignette,
            date: Calendar.current.date(from: DateComponents(year: Calendar.current.component(.year, from: Date()) + 1, month: 1, day: 31))!,
            notificationsEnabled: true,
            linkedContractId: nil
        ),
        Deadline(
            id: "dl-003",
            name: "Platba pojistného – Povinné ručení",
            type: .payment,
            date: Calendar.current.date(byAdding: .month, value: 3, to: Date())!,
            notificationsEnabled: true,
            linkedContractId: "contract-001"
        )
    ]
}
