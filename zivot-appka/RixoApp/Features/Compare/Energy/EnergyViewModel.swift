import Foundation
import SwiftUI

class EnergyViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 7

    var isElectricity: Bool = true

    @Published var postalCode: String = ""
    @Published var currentProvider: String = "ČEZ"
    let providers = ["ČEZ", "E.ON", "PRE", "Innogy", "Centropol", "Jiný"]

    // Electric purposes
    @Published var purposeCooking: Bool = false
    @Published var purposeHeating: Bool = false
    @Published var purposeHotWater: Bool = false

    // Electricity tariff
    @Published var electricTariff: String = "D02d"
    let electricTariffs = ["D01d", "D02d", "D25d", "D26d", "D35d", "D45d", "D56d"]

    // Gas tariff
    @Published var gasTariff: String = "G11"
    let gasTariffs = ["G11", "G12", "G20", "G22", "G23", "G25", "G27", "G40", "G41", "G45"]

    // Circuit breaker (electricity)
    @Published var circuitBreaker: String = "16A"
    let circuitBreakers = ["3A", "10A", "16A", "20A", "25A", "32A"]

    // Annual consumption
    @Published var annualConsumption: Double = 3000 // kWh for elec, m3 for gas
    @Published var gasConsumptionM3: String = ""

    // Contact
    @Published var contactEmail: String = ""
    @Published var contactPhone: String = ""
    @Published var gdprConsent: Bool = false

    @Published var showResults: Bool = false

    var stepTitles: [String] { ["PSČ", "Dodavatel", "Účel", "Tarif", "Jistič", "Spotřeba", "Kontakt"] }

    func nextStep() {
        if currentStep < totalSteps { withAnimation { currentStep += 1 } }
        else { showResults = true }
    }

    func previousStep() {
        if currentStep > 1 { withAnimation { currentStep -= 1 } }
    }

    var canProceed: Bool {
        switch currentStep {
        case 1: return AuthService.isValidPSC(postalCode)
        case 7: return AuthService.isValidEmail(contactEmail) && AuthService.isValidPhone(contactPhone) && gdprConsent
        default: return true
        }
    }

    var consumptionPresets: [(label: String, value: Double)] {
        if isElectricity {
            return [("1 000 kWh", 1000), ("2 000 kWh", 2000), ("3 000 kWh", 3000), ("5 000 kWh", 5000), ("8 000 kWh", 8000), ("12 000 kWh", 12000)]
        } else {
            return [("500 m³", 500), ("1 000 m³", 1000), ("2 000 m³", 2000), ("5 000 m³", 5000), ("8 000 m³", 8000), ("12 000 m³", 12000)]
        }
    }
}
