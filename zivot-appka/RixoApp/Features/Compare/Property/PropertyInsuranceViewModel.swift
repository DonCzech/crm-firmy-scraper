import Foundation
import SwiftUI

class PropertyInsuranceViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 9

    // Step 1
    @Published var insureDom: Bool = false
    @Published var insureBytovaJednotka: Bool = true
    @Published var insureVybaveni: Bool = true
    @Published var insureSamotnyObjekt: Bool = false

    // Step 2
    @Published var street: String = ""
    @Published var houseNumber: String = ""
    @Published var city: String = ""
    @Published var postalCode: String = ""

    // Step 3
    @Published var constructionMaterial: String = "Zděné"
    let constructionMaterials = ["Zděné", "Dřevěné", "Smíšené", "Jiné"]

    // Step 4
    @Published var roofType: String = "Šikmá"
    let roofTypes = ["Šikmá", "Plochá", "Jiná"]

    // Step 5
    @Published var hasBasement: Bool = false

    // Step 6
    @Published var houseSizeM2: String = ""

    // Step 7
    @Published var householdValue: Double = 500_000

    // Step 8
    @Published var ownership: String = "Vlastník"
    let ownershipOptions = ["Vlastník", "Nájemce"]

    // Step 9
    @Published var contactEmail: String = ""
    @Published var contactPhone: String = ""
    @Published var gdprConsent: Bool = false

    @Published var showResults: Bool = false

    var stepTitles: [String] { ["Co pojistit", "Adresa", "Materiál", "Střecha", "Sklep", "Plocha", "Hodnota", "Vlastnictví", "Kontakt"] }

    func nextStep() {
        if currentStep < totalSteps { withAnimation { currentStep += 1 } }
        else { showResults = true }
    }

    func previousStep() {
        if currentStep > 1 { withAnimation { currentStep -= 1 } }
    }

    var canProceed: Bool {
        switch currentStep {
        case 2: return !street.isEmpty && !houseNumber.isEmpty && !city.isEmpty && !postalCode.isEmpty
        case 6: return !houseSizeM2.isEmpty
        case 9: return AuthService.isValidEmail(contactEmail) && AuthService.isValidPhone(contactPhone) && gdprConsent
        default: return true
        }
    }
}
