import Foundation
import SwiftUI

struct CoverageDetail: Identifiable, Codable {
    var id: String
    var title: String
    var value: String
    var included: Bool

    init(id: String = UUID().uuidString, title: String, value: String, included: Bool = true) {
        self.id = id
        self.title = title
        self.value = value
        self.included = included
    }
}

struct Quote: Identifiable, Codable {
    var id: String
    var insurerName: String
    var insurerColorHex: String
    var monthlyPrice: Double
    var annualPrice: Double
    var rixoScore: Double
    var isRecommended: Bool
    var isCheapest: Bool
    var coveragePoints: [String]
    var coverageDetails: [CoverageDetail]

    var insurerColor: Color {
        Color(hex: insurerColorHex)
    }

    var insurerInitials: String {
        let words = insurerName.split(separator: " ")
        if words.count >= 2 {
            return "\(words[0].prefix(1))\(words[1].prefix(1))".uppercased()
        }
        return String(insurerName.prefix(2)).uppercased()
    }

    var rixoScoreColor: Color {
        if rixoScore >= 8.0 { return Color(hex: "#34C759") }
        else if rixoScore >= 6.0 { return Color(hex: "#FF9500") }
        else { return Color(hex: "#FF3B30") }
    }
}

// Sample quotes
extension Quote {
    static func sampleVehicleQuotes() -> [Quote] {
        [
            Quote(
                id: "q-001",
                insurerName: "Česká pojišťovna",
                insurerColorHex: "#E8542A",
                monthlyPrice: 289,
                annualPrice: 3468,
                rixoScore: 8.9,
                isRecommended: true,
                isCheapest: false,
                coveragePoints: [
                    "Limit plnění 35 mil. Kč",
                    "Asistenční služba 24/7",
                    "Náhradní vozidlo při nehodě"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Škody na zdraví", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Škody na majetku", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Asistenční služba", value: "Celá Evropa"),
                    CoverageDetail(title: "Náhradní vozidlo", value: "Ano, 7 dní"),
                    CoverageDetail(title: "Úrazové pojištění řidiče", value: "Není zahrnuto", included: false)
                ]
            ),
            Quote(
                id: "q-002",
                insurerName: "Kooperativa",
                insurerColorHex: "#007AFF",
                monthlyPrice: 265,
                annualPrice: 3180,
                rixoScore: 7.5,
                isRecommended: false,
                isCheapest: true,
                coveragePoints: [
                    "Limit plnění 35 mil. Kč",
                    "Základní asistenční služba",
                    "Online správa smlouvy"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Škody na zdraví", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Škody na majetku", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Asistenční služba", value: "ČR + 500 km"),
                    CoverageDetail(title: "Náhradní vozidlo", value: "Není zahrnuto", included: false),
                    CoverageDetail(title: "Úrazové pojištění řidiče", value: "Není zahrnuto", included: false)
                ]
            ),
            Quote(
                id: "q-003",
                insurerName: "Allianz",
                insurerColorHex: "#003781",
                monthlyPrice: 312,
                annualPrice: 3744,
                rixoScore: 9.1,
                isRecommended: true,
                isCheapest: false,
                coveragePoints: [
                    "Limit plnění 50 mil. Kč",
                    "Asistenční služba celá Evropa",
                    "Úrazové pojištění řidiče"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Škody na zdraví", value: "50 000 000 Kč"),
                    CoverageDetail(title: "Škody na majetku", value: "50 000 000 Kč"),
                    CoverageDetail(title: "Asistenční služba", value: "Celá Evropa 24/7"),
                    CoverageDetail(title: "Náhradní vozidlo", value: "Ano, 14 dní"),
                    CoverageDetail(title: "Úrazové pojištění řidiče", value: "500 000 Kč")
                ]
            ),
            Quote(
                id: "q-004",
                insurerName: "ČSOB Pojišťovna",
                insurerColorHex: "#004B87",
                monthlyPrice: 278,
                annualPrice: 3336,
                rixoScore: 7.8,
                isRecommended: false,
                isCheapest: false,
                coveragePoints: [
                    "Limit plnění 35 mil. Kč",
                    "Asistenční služba v ČR",
                    "Sleva za bezškoní průběh"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Škody na zdraví", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Škody na majetku", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Asistenční služba", value: "ČR"),
                    CoverageDetail(title: "Náhradní vozidlo", value: "Není zahrnuto", included: false),
                    CoverageDetail(title: "Sleva BŠP", value: "Až 50 %")
                ]
            ),
            Quote(
                id: "q-005",
                insurerName: "Generali",
                insurerColorHex: "#CC0000",
                monthlyPrice: 298,
                annualPrice: 3576,
                rixoScore: 8.2,
                isRecommended: false,
                isCheapest: false,
                coveragePoints: [
                    "Limit plnění 35 mil. Kč",
                    "Právní asistence",
                    "Asistenční služba Evropa"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Škody na zdraví", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Škody na majetku", value: "35 000 000 Kč"),
                    CoverageDetail(title: "Asistenční služba", value: "Celá Evropa"),
                    CoverageDetail(title: "Právní asistence", value: "Ano"),
                    CoverageDetail(title: "Náhradní vozidlo", value: "Ano, 5 dní")
                ]
            )
        ]
    }

    static func sampleLifeQuotes() -> [Quote] {
        [
            Quote(
                id: "lq-001",
                insurerName: "NN Životní pojišťovna",
                insurerColorHex: "#FF6600",
                monthlyPrice: 1250,
                annualPrice: 15000,
                rixoScore: 8.7,
                isRecommended: true,
                isCheapest: false,
                coveragePoints: [
                    "Pojistná částka 2 000 000 Kč",
                    "Plnění při invaliditě",
                    "Progresivní odškodnění úrazu"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Smrt", value: "2 000 000 Kč"),
                    CoverageDetail(title: "Invalidita III. stupně", value: "2 000 000 Kč"),
                    CoverageDetail(title: "Pracovní neschopnost", value: "500 Kč/den"),
                    CoverageDetail(title: "Hospitalizace", value: "400 Kč/den"),
                    CoverageDetail(title: "Kritické nemoci", value: "500 000 Kč")
                ]
            ),
            Quote(
                id: "lq-002",
                insurerName: "MetLife",
                insurerColorHex: "#0099CC",
                monthlyPrice: 980,
                annualPrice: 11760,
                rixoScore: 7.4,
                isRecommended: false,
                isCheapest: true,
                coveragePoints: [
                    "Pojistná částka 1 500 000 Kč",
                    "Plnění při invaliditě",
                    "Bez vstupní zdravotní prohlídky"
                ],
                coverageDetails: [
                    CoverageDetail(title: "Smrt", value: "1 500 000 Kč"),
                    CoverageDetail(title: "Invalidita III. stupně", value: "1 500 000 Kč"),
                    CoverageDetail(title: "Pracovní neschopnost", value: "Není zahrnuto", included: false),
                    CoverageDetail(title: "Hospitalizace", value: "300 Kč/den"),
                    CoverageDetail(title: "Kritické nemoci", value: "Není zahrnuto", included: false)
                ]
            )
        ]
    }
}
