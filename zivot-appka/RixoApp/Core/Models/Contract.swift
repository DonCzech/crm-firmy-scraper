import Foundation
import SwiftUI

struct Contract: Identifiable, Codable, Equatable {
    var id: String
    var type: InsuranceType
    var insurerName: String
    var insurerColorHex: String
    var policyNumber: String
    var startDate: Date
    var endDate: Date
    var annualPremium: Double
    var monthlyPremium: Double
    var coverageLimit: Double
    var rixoIndex: Double
    var status: ContractStatus
    var hasGreenCard: Bool
    var hasTravelCard: Bool
    var vehicleSPZ: String?
    var vehicleMake: String?
    var vehicleModel: String?

    var insurerColor: Color {
        Color(hex: insurerColorHex)
    }

    var rixoIndexColor: Color {
        if rixoIndex >= 8.0 { return Color(hex: "#34C759") }
        else if rixoIndex >= 6.0 { return Color(hex: "#FF9500") }
        else { return Color(hex: "#FF3B30") }
    }

    var rixoIndexLabel: String {
        if rixoIndex >= 8.0 { return "Výborná" }
        else if rixoIndex >= 6.0 { return "Průměrná" }
        else { return "Podprůměrná" }
    }

    var daysUntilExpiry: Int {
        Calendar.current.dateComponents([.day], from: Date(), to: endDate).day ?? 0
    }

    var insurerInitials: String {
        let words = insurerName.split(separator: " ")
        if words.count >= 2 {
            return "\(words[0].prefix(1))\(words[1].prefix(1))".uppercased()
        }
        return String(insurerName.prefix(2)).uppercased()
    }
}

// Sample data
extension Contract {
    static let sampleContracts: [Contract] = [
        Contract(
            id: "contract-001",
            type: .povinneRuceni,
            insurerName: "Česká pojišťovna",
            insurerColorHex: "#E8542A",
            policyNumber: "POV-2024-112233",
            startDate: Calendar.current.date(byAdding: .year, value: -1, to: Date())!,
            endDate: Calendar.current.date(byAdding: .month, value: 3, to: Date())!,
            annualPremium: 4800,
            monthlyPremium: 400,
            coverageLimit: 35_000_000,
            rixoIndex: 7.2,
            status: .expiring,
            hasGreenCard: true,
            hasTravelCard: false,
            vehicleSPZ: "1AB2345",
            vehicleMake: "Škoda",
            vehicleModel: "Octavia"
        ),
        Contract(
            id: "contract-002",
            type: .zivotni,
            insurerName: "Kooperativa",
            insurerColorHex: "#007AFF",
            policyNumber: "ZIV-2023-556677",
            startDate: Calendar.current.date(byAdding: .year, value: -2, to: Date())!,
            endDate: Calendar.current.date(byAdding: .year, value: 8, to: Date())!,
            annualPremium: 18000,
            monthlyPremium: 1500,
            coverageLimit: 2_000_000,
            rixoIndex: 8.5,
            status: .active,
            hasGreenCard: false,
            hasTravelCard: true
        ),
        Contract(
            id: "contract-003",
            type: .domacnost,
            insurerName: "Allianz",
            insurerColorHex: "#003781",
            policyNumber: "DOM-2024-998877",
            startDate: Calendar.current.date(byAdding: .month, value: -6, to: Date())!,
            endDate: Calendar.current.date(byAdding: .month, value: 6, to: Date())!,
            annualPremium: 3600,
            monthlyPremium: 300,
            coverageLimit: 500_000,
            rixoIndex: 5.8,
            status: .active,
            hasGreenCard: false,
            hasTravelCard: false
        )
    ]
}
