import Foundation
import SwiftUI

class LifeInsuranceViewModel: ObservableObject {
    @Published var currentStep: Int = 1
    let totalSteps: Int = 9

    // Step 1
    @Published var selectedType: InsuranceType = .zivotni
    let types: [InsuranceType] = [.zivotni, .urazove]

    // Step 2
    @Published var employment: String = "Zaměstnanec"
    let employmentOptions = ["Zaměstnanec", "OSVČ", "Nezaměstnaný", "Důchodce", "Student"]

    // Step 3
    @Published var industry: String = "IT a technologie"
    let industries = [
        "IT a technologie", "Stavebnictví", "Zdravotnictví", "Školství",
        "Finance", "Obchod", "Výroba", "Doprava", "Pohostinství",
        "Administrativa", "Zemědělství", "Jiné"
    ]

    // Step 4
    @Published var heightCM: String = ""
    @Published var weightKG: String = ""

    // Step 5
    @Published var healthAnswers: [Bool] = [false, false, false, false, false]
    let healthQuestions = [
        "Léčíte se s diabetem?",
        "Máte nebo jste měli rakovinu?",
        "Trpíte kardiovaskulárním onemocněním?",
        "Jste léčeni pro duševní nemoc?",
        "Máte chronické onemocnění pohybového aparátu?"
    ]

    // Step 6
    @Published var hasSickLeave: Bool = false
    @Published var sickLeaveBenefit: String = "500"

    // Step 7
    @Published var childrenCount: Int = 0

    // Step 8
    @Published var monthlyIncome: String = ""
    @Published var monthlyExpenses: String = ""

    // Step 9
    @Published var contactEmail: String = ""
    @Published var contactPhone: String = ""
    @Published var gdprConsent: Bool = false

    @Published var showResults: Bool = false

    var stepTitles: [String] {
        ["Typ", "Práce", "Obor", "Fyzické", "Zdraví", "NemPoj", "Děti", "Finance", "Kontakt"]
    }

    func nextStep() {
        if currentStep < totalSteps {
            withAnimation { currentStep += 1 }
        } else {
            showResults = true
        }
    }

    func previousStep() {
        if currentStep > 1 {
            withAnimation { currentStep -= 1 }
        }
    }

    var canProceed: Bool {
        switch currentStep {
        case 4:
            return !heightCM.isEmpty && !weightKG.isEmpty
        case 9:
            return AuthService.isValidEmail(contactEmail) &&
                   AuthService.isValidPhone(contactPhone) && gdprConsent
        default:
            return true
        }
    }
}
