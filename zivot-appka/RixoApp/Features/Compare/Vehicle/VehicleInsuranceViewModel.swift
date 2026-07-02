import Foundation
import SwiftUI

class VehicleInsuranceViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 9

    // Step 1
    @Published var selectedType: InsuranceType = .povinneRuceni

    // Step 2
    @Published var spz: String = ""
    @Published var vin: String = ""
    @Published var useSPZ: Bool = true
    @Published var spzError: String? = nil

    // Step 3
    @Published var vehicleMake: String = "Škoda"
    @Published var vehicleModel: String = "Octavia"
    @Published var vehicleYear: String = "2019"
    @Published var engineCC: String = "1598"

    // Step 4
    @Published var vehicleUsage: String = "Běžné použití"
    let usageOptions = ["Běžné použití", "Taxi", "Autoškola", "Autopůjčovna"]

    // Step 5
    @Published var annualMileage: Double = 15000

    // Step 6
    @Published var hasAlarm: Bool = false
    @Published var hasImmobilizer: Bool = false
    @Published var hasGPSTracker: Bool = false
    @Published var hasMechanicalLock: Bool = false

    // Step 7
    @Published var driverFirstName: String = ""
    @Published var driverLastName: String = ""
    @Published var driverRC: String = ""
    @Published var driverPSC: String = ""

    // Step 8
    @Published var noClaimsYears: Int = 0

    // Step 9
    @Published var contactEmail: String = ""
    @Published var contactPhone: String = ""
    @Published var gdprConsent: Bool = false

    @Published var showResults: Bool = false

    var stepTitles: [String] {
        ["Typ", "SPZ", "Vozidlo", "Použití", "Km/rok", "Zabezp.", "Řidič", "BŠP", "Kontakt"]
    }

    func nextStep() {
        if validateCurrentStep() {
            if currentStep < totalSteps {
                withAnimation { currentStep += 1 }
            } else {
                showResults = true
            }
        }
    }

    func previousStep() {
        if currentStep > 1 {
            withAnimation { currentStep -= 1 }
        }
    }

    private func validateCurrentStep() -> Bool {
        switch currentStep {
        case 2:
            if useSPZ {
                if !AuthService.isValidSPZ(spz) {
                    spzError = "Zadejte platnou SPZ (např. 1AB2345)"
                    return false
                }
            }
            spzError = nil
            return true
        case 9:
            return AuthService.isValidEmail(contactEmail) &&
                   AuthService.isValidPhone(contactPhone) && gdprConsent
        default:
            return true
        }
    }

    var canProceed: Bool {
        switch currentStep {
        case 2:
            return useSPZ ? !spz.isEmpty : !vin.isEmpty
        case 7:
            return !driverFirstName.isEmpty && !driverLastName.isEmpty &&
                   !driverRC.isEmpty && !driverPSC.isEmpty
        case 9:
            return AuthService.isValidEmail(contactEmail) &&
                   AuthService.isValidPhone(contactPhone) && gdprConsent
        default:
            return true
        }
    }

    func simulateVehicleLookup() {
        // Simulate API lookup based on SPZ
        let makes = ["Škoda", "Volkswagen", "BMW", "Ford", "Toyota", "Hyundai", "Kia"]
        let models = ["Octavia", "Fabia", "Golf", "Focus", "Corolla", "Tucson", "Sportage"]
        let years = ["2018", "2019", "2020", "2021", "2022"]

        vehicleMake = makes.randomElement() ?? "Škoda"
        vehicleModel = models.randomElement() ?? "Octavia"
        vehicleYear = years.randomElement() ?? "2020"
        engineCC = "1598"
    }
}
