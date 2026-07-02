import Foundation
import SwiftUI

class TravelInsuranceViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 6

    // Step 1
    @Published var selectedDestination: String = ""

    struct Destination: Identifiable {
        let id = UUID()
        let name: String
        let flag: String
        let emoji: String
    }

    let destinations: [Destination] = [
        Destination(name: "Chorvatsko", flag: "🇭🇷", emoji: "🏖️"),
        Destination(name: "Slovensko", flag: "🇸🇰", emoji: "🏔️"),
        Destination(name: "Egypt", flag: "🇪🇬", emoji: "🏛️"),
        Destination(name: "Itálie", flag: "🇮🇹", emoji: "🍕"),
        Destination(name: "Turecko", flag: "🇹🇷", emoji: "🕌"),
        Destination(name: "Rakousko", flag: "🇦🇹", emoji: "⛷️"),
        Destination(name: "USA", flag: "🇺🇸", emoji: "🗽"),
        Destination(name: "Thajsko", flag: "🇹🇭", emoji: "🌴"),
        Destination(name: "Celý svět", flag: "🌍", emoji: "✈️")
    ]

    // Step 2
    @Published var departureDate: Date = Calendar.current.date(byAdding: .month, value: 1, to: Date())!
    @Published var returnDate: Date = Calendar.current.date(byAdding: .month, value: 1, to: Calendar.current.date(byAdding: .day, value: 14, to: Date())!)!

    // Step 3
    @Published var travelersCount: Int = 2

    // Step 4
    @Published var travelerAges: [String] = ["35", "32"]

    // Step 5
    @Published var hasStornoInsurance: Bool = false
    @Published var hasWinterSports: Bool = false
    @Published var hasRiskyActivities: Bool = false
    @Published var luggageLevel: Int = 0 // 0=none, 1=5k, 2=10k, 3=15k
    @Published var hasVehicleAssistance: Bool = false

    let luggageLevels = ["Bez zavazadel", "5 000 Kč", "10 000 Kč", "15 000 Kč"]

    // Step 6
    @Published var contactEmail: String = ""
    @Published var contactPhone: String = ""
    @Published var gdprConsent: Bool = false

    @Published var showResults: Bool = false

    var stepTitles: [String] { ["Destinace", "Datum", "Cestující", "Věk", "Připojištění", "Kontakt"] }

    var tripDuration: Int {
        Calendar.current.dateComponents([.day], from: departureDate, to: returnDate).day ?? 0
    }

    func nextStep() {
        if currentStep < totalSteps {
            withAnimation { currentStep += 1 }
        } else {
            showResults = true
        }
    }

    func previousStep() {
        if currentStep > 1 { withAnimation { currentStep -= 1 } }
    }

    func updateTravelerCount(_ count: Int) {
        travelersCount = count
        if count > travelerAges.count {
            travelerAges.append(contentsOf: Array(repeating: "", count: count - travelerAges.count))
        } else {
            travelerAges = Array(travelerAges.prefix(count))
        }
    }

    var canProceed: Bool {
        switch currentStep {
        case 1: return !selectedDestination.isEmpty
        case 6: return AuthService.isValidEmail(contactEmail) && AuthService.isValidPhone(contactPhone) && gdprConsent
        default: return true
        }
    }
}
