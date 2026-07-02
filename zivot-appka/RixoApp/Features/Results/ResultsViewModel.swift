import Foundation
import Combine

class ResultsViewModel: ObservableObject {
    @Published var quotes: [Quote] = []
    @Published var isLoading: Bool = true
    @Published var sortOption: SortOption = .recommended
    @Published var filterMaxPrice: Double = 5000

    enum SortOption: String, CaseIterable {
        case recommended = "Doporučené"
        case priceAsc = "Nejlevnější"
        case priceDesc = "Nejdražší"
        case score = "RIXO skóre"
    }

    var recommendedQuotes: [Quote] {
        sortedQuotes.filter { $0.isRecommended }
    }

    var cheapestQuotes: [Quote] {
        sortedQuotes.filter { $0.isCheapest && !$0.isRecommended }
    }

    var otherQuotes: [Quote] {
        sortedQuotes.filter { !$0.isRecommended && !$0.isCheapest }
    }

    var sortedQuotes: [Quote] {
        let filtered = quotes.filter { $0.monthlyPrice <= filterMaxPrice }
        switch sortOption {
        case .recommended:
            return filtered.sorted { $0.isRecommended && !$1.isRecommended }
        case .priceAsc:
            return filtered.sorted { $0.monthlyPrice < $1.monthlyPrice }
        case .priceDesc:
            return filtered.sorted { $0.monthlyPrice > $1.monthlyPrice }
        case .score:
            return filtered.sorted { $0.rixoScore > $1.rixoScore }
        }
    }

    func load(for type: InsuranceType) {
        isLoading = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            switch type {
            case .povinneRuceni, .havarijski, .povinneHavarijski:
                self.quotes = Quote.sampleVehicleQuotes()
            case .zivotni, .urazove:
                self.quotes = Quote.sampleLifeQuotes()
            default:
                self.quotes = self.generateQuotes(for: type)
            }
            self.filterMaxPrice = (self.quotes.map { $0.monthlyPrice }.max() ?? 5000) + 500
            self.isLoading = false
        }
    }

    private func generateQuotes(for type: InsuranceType) -> [Quote] {
        let basePrice: Double
        switch type {
        case .domacnost: basePrice = 280
        case .nemovitost: basePrice = 450
        case .cestovni: basePrice = 180
        case .mazlicek: basePrice = 250
        default: basePrice = 350
        }

        let insurers = [
            ("Česká pojišťovna", "#E8542A"),
            ("Kooperativa", "#007AFF"),
            ("Allianz", "#003781"),
            ("ČSOB Pojišťovna", "#004B87"),
            ("Generali", "#CC0000")
        ]

        return insurers.enumerated().map { index, insurer in
            let price = basePrice * Double.random(in: 0.8...1.4)
            return Quote(
                id: "auto-\(index)",
                insurerName: insurer.0,
                insurerColorHex: insurer.1,
                monthlyPrice: price.rounded(),
                annualPrice: (price * 12).rounded(),
                rixoScore: Double.random(in: 6.5...9.5).rounded(toPlaces: 1),
                isRecommended: index == 0 || index == 2,
                isCheapest: index == 1,
                coveragePoints: ["Základní krytí", "Asistenční služba", "Online správa"],
                coverageDetails: [CoverageDetail(title: "Základní krytí", value: "Ano")]
            )
        }
    }
}
