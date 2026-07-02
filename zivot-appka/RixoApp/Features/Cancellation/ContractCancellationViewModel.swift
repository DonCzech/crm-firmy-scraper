import Foundation
import SwiftUI

class ContractCancellationViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 5

    @Published var selectedInsuranceType: InsuranceType = .povinneRuceni
    @Published var selectedReason: String = ""

    let reasons = [
        "Uplynutí pojistného roku",
        "Změna vlastníka vozidla",
        "Zdražení pojistného",
        "Totální škoda na vozidle",
        "Jiný důvod",
        "Neshoda na výši plnění"
    ]

    @Published var contractNumber: String = ""
    @Published var firstName: String = ""
    @Published var lastName: String = ""
    @Published var birthDate: Date = Calendar.current.date(byAdding: .year, value: -35, to: Date())!
    @Published var address: String = ""

    @Published var signaturePaths: [Path] = []
    @Published var showPreview: Bool = false
    @Published var generationSuccess: Bool = false

    var stepTitles: [String] { ["Typ pojistky", "Důvod", "Údaje", "Podpis", "Náhled"] }

    func nextStep() {
        if currentStep < totalSteps { withAnimation { currentStep += 1 } }
        else { generateDocument() }
    }

    func previousStep() {
        if currentStep > 1 { withAnimation { currentStep -= 1 } }
    }

    var canProceed: Bool {
        switch currentStep {
        case 2: return !selectedReason.isEmpty
        case 3: return !contractNumber.isEmpty && !firstName.isEmpty && !lastName.isEmpty && !address.isEmpty
        case 4: return !signaturePaths.isEmpty
        default: return true
        }
    }

    private func generateDocument() {
        generationSuccess = true
    }

    var cancellationDateText: String {
        Calendar.current.date(byAdding: .day, value: 30, to: Date())?.czechFormatted ?? "—"
    }
}
