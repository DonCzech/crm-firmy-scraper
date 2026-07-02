import Foundation

class ComparisonService: ObservableObject {
    @Published var quotes: [Quote] = []
    @Published var isLoading: Bool = false
    @Published var searchCompleted: Bool = false

    func fetchQuotes(for type: InsuranceType, parameters: [String: Any] = [:]) async {
        await MainActor.run {
            self.isLoading = true
            self.quotes = []
            self.searchCompleted = false
        }

        // Simulate 3 second search animation
        try? await Task.sleep(nanoseconds: 3_000_000_000)

        let mockQuotes: [Quote]
        switch type {
        case .povinneRuceni, .havarijski, .povinneHavarijski:
            mockQuotes = Quote.sampleVehicleQuotes()
        case .zivotni, .urazove:
            mockQuotes = Quote.sampleLifeQuotes()
        default:
            mockQuotes = generateGenericQuotes(for: type)
        }

        await MainActor.run {
            self.quotes = mockQuotes
            self.isLoading = false
            self.searchCompleted = true
        }
    }

    private func generateGenericQuotes(for type: InsuranceType) -> [Quote] {
        let insurers = [
            ("Česká pojišťovna", "#E8542A"),
            ("Kooperativa", "#007AFF"),
            ("Allianz", "#003781"),
            ("ČSOB Pojišťovna", "#004B87"),
            ("Generali", "#CC0000"),
            ("Uniqa", "#006D3B"),
            ("AXA", "#00008F"),
            ("Pojišťovna VZP", "#E2001A")
        ]

        var quotes: [Quote] = []
        let basePrice = baseMonthlyPrice(for: type)

        for (index, insurer) in insurers.prefix(5).enumerated() {
            let variation = Double.random(in: 0.8...1.3)
            let monthly = (basePrice * variation).rounded()
            let isRecommended = index == 0 || index == 2
            let isCheapest = index == 1

            quotes.append(Quote(
                id: "q-\(type.rawValue)-\(index)",
                insurerName: insurer.0,
                insurerColorHex: insurer.1,
                monthlyPrice: monthly,
                annualPrice: monthly * 12,
                rixoScore: Double.random(in: 6.5...9.5).rounded(toPlaces: 1),
                isRecommended: isRecommended,
                isCheapest: isCheapest,
                coveragePoints: coveragePoints(for: type),
                coverageDetails: coverageDetails(for: type)
            ))
        }
        return quotes.sorted { $0.rixoScore > $1.rixoScore }
    }

    private func baseMonthlyPrice(for type: InsuranceType) -> Double {
        switch type {
        case .povinneRuceni: return 350
        case .havarijski: return 800
        case .povinneHavarijski: return 1100
        case .zivotni: return 1200
        case .urazove: return 350
        case .domacnost: return 290
        case .nemovitost: return 450
        case .cestovni: return 180
        case .odpovednostObcan: return 120
        case .odpovednostZamestnanec: return 150
        case .mazlicek: return 250
        case .elektrokolobezka: return 89
        case .elektrina: return 2800
        case .plyn: return 1500
        case .hypoteka: return 15000
        case .uver: return 5000
        }
    }

    private func coveragePoints(for type: InsuranceType) -> [String] {
        switch type {
        case .domacnost:
            return ["Škody živelní a technické", "Krádež a vloupání", "Pojištění elektroniky"]
        case .nemovitost:
            return ["Škody na stavbě", "Odpovědnost vlastníka", "Živelní pojištění"]
        case .cestovni:
            return ["Léčebné výlohy 5 mil. EUR", "Ztráta zavazadel", "Pojištění odpovědnosti"]
        case .mazlicek:
            return ["Veterinární náklady", "Operace a hospitalizace", "Odpovědnost za škody"]
        default:
            return ["Komplexní krytí", "Asistenční služba 24/7", "Online správa pojistky"]
        }
    }

    private func coverageDetails(for type: InsuranceType) -> [CoverageDetail] {
        switch type {
        case .domacnost:
            return [
                CoverageDetail(title: "Vybavení domácnosti", value: "500 000 Kč"),
                CoverageDetail(title: "Elektronika", value: "100 000 Kč"),
                CoverageDetail(title: "Krádež", value: "Ano"),
                CoverageDetail(title: "Vandalizmus", value: "Ano"),
                CoverageDetail(title: "Pojištění jízdního kola", value: "30 000 Kč")
            ]
        case .cestovni:
            return [
                CoverageDetail(title: "Léčebné výlohy", value: "5 000 000 Kč"),
                CoverageDetail(title: "Repatriace", value: "Ano"),
                CoverageDetail(title: "Zavazadla", value: "15 000 Kč"),
                CoverageDetail(title: "Zpoždění letu", value: "Ano"),
                CoverageDetail(title: "Odpovědnost", value: "2 000 000 Kč")
            ]
        default:
            return [
                CoverageDetail(title: "Základní krytí", value: "Ano"),
                CoverageDetail(title: "Asistenční služba", value: "24/7"),
                CoverageDetail(title: "Online správa", value: "Ano")
            ]
        }
    }

    func reset() {
        quotes = []
        isLoading = false
        searchCompleted = false
    }
}

extension Double {
    func rounded(toPlaces places: Int) -> Double {
        let divisor = pow(10.0, Double(places))
        return (self * divisor).rounded() / divisor
    }
}
