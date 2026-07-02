import SwiftUI

struct PetInsuranceView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 1
    let totalSteps = 5

    @State private var petType = "Pes"
    @State private var petAgeUnit = "roky" // or "měsíce"
    @State private var petAge = 3
    @State private var petBreed = ""
    @State private var hasMicrochip: Bool? = nil
    @State private var contactEmail = ""
    @State private var contactPhone = ""
    @State private var gdprConsent = false
    @State private var showResults = false

    let dogBreeds = [
        "Labrador retriever", "Německý ovčák", "Zlatý retriever", "Francouzský buldok",
        "Bulldog", "Pudl", "Bígl", "Rottweiler", "Jorkšírský teriér", "Husky",
        "Border kolie", "Štendrák", "Dalmatský", "Boxr", "Dobrman",
        "Shih-tzu", "Maltézský psík", "Čivava", "Dalmatin", "Jiné plemeno"
    ]

    let catBreeds = [
        "Domácí krátkosrstá", "Perská kočka", "Maine Coon", "Siamská kočka",
        "Britská krátkosrstá", "Ragdoll", "Bengálská kočka", "Abyssinská kočka",
        "Norská lesní kočka", "Ruská modrá", "Skotská přikrčená",
        "Devon Rex", "Sphynx", "Burmská kočka", "Norsk skogkatt",
        "Orientální krátkosrstá", "Turecká angora", "Selkirk Rex", "Chartreux", "Jiné plemeno"
    ]

    var breeds: [String] { petType == "Pes" ? dogBreeds : catBreeds }
    var stepTitles: [String] { ["Typ", "Věk", "Plemeno", "Čip", "Kontakt"] }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: 12) {
                    StepProgressView(currentStep: currentStep, totalSteps: totalSteps)
                    StepIndicatorRow(currentStep: currentStep, totalSteps: totalSteps, stepTitles: stepTitles)
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
                .background(Color.rixoCard)

                ScrollView {
                    VStack(spacing: 20) {
                        switch currentStep {
                        case 1: step1PetType
                        case 2: step2Age
                        case 3: step3Breed
                        case 4: step4Microchip
                        case 5: step5Contact
                        default: EmptyView()
                        }
                    }
                    .padding(.horizontal, 20).padding(.vertical, 20)
                }
                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Pojištění mazlíčků")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $showResults) {
            ResultsView(insuranceType: .mazlicek)
        }
    }

    private var step1PetType: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Druh zvířete", subtitle: "Jaké zvíře chcete pojistit?")
            HStack(spacing: 16) {
                ForEach(["Pes", "Kočka"], id: \.self) { type in
                    Button(action: { petType = type; petBreed = "" }) {
                        VStack(spacing: 12) {
                            Text(type == "Pes" ? "🐕" : "🐈")
                                .font(.system(size: 50))
                            Text(type)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(petType == type ? .white : .rixoTextPrimary)
                        }
                        .frame(maxWidth: .infinity).frame(height: 110)
                        .background(petType == type ? Color.rixoOrange : Color.rixoCard)
                        .cornerRadius(16)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(petType == type ? Color.rixoOrange : Color.clear, lineWidth: 2))
                    }
                }
            }
        }
    }

    private var step2Age: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Věk mazlíčka", subtitle: "Kolik je vašemu \(petType == "Pes" ? "psovi" : "kočce")?")

            HStack(spacing: 12) {
                ForEach(["měsíce", "roky"], id: \.self) { unit in
                    Button(action: { petAgeUnit = unit; petAge = 1 }) {
                        Text(unit.capitalized)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(petAgeUnit == unit ? .white : .rixoOrange)
                            .frame(maxWidth: .infinity).frame(height: 40)
                            .background(petAgeUnit == unit ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                            .cornerRadius(10)
                    }
                }
            }

            HStack(spacing: 24) {
                Button(action: { if petAge > 1 { petAge -= 1 } }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(petAge > 1 ? .rixoOrange : .gray.opacity(0.3))
                }
                VStack(spacing: 4) {
                    Text("\(petAge)")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.rixoOrange)
                    Text(petAgeUnit)
                        .font(.system(size: 14))
                        .foregroundColor(.rixoTextSecondary)
                }
                Button(action: {
                    let maxAge = petAgeUnit == "měsíce" ? 11 : 10
                    if petAge < maxAge { petAge += 1 }
                }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.rixoOrange)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(24).background(Color.rixoCard).cornerRadius(16)
        }
    }

    private var step3Breed: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Plemeno", subtitle: "Vyberte plemeno vašeho \(petType == "Pes" ? "psa" : "kočky").")
            VStack(spacing: 8) {
                ForEach(breeds, id: \.self) { breed in
                    SelectionRow(title: breed, isSelected: petBreed == breed) {
                        petBreed = breed
                    }
                }
            }
        }
    }

    private var step4Microchip: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Mikročip", subtitle: "Je váš mazlíček označen mikročipem? (podmínka pojištění)")
            VStack(spacing: 10) {
                SelectionRow(title: "Ano, má mikročip", isSelected: hasMicrochip == true) { hasMicrochip = true }
                SelectionRow(title: "Ne, nemá mikročip", isSelected: hasMicrochip == false) { hasMicrochip = false }
            }
            if hasMicrochip == false {
                InfoCard(text: "Mikročip je podmínkou pojištění u většiny pojišťoven. Zavedení mikročipu stojí přibližně 300–500 Kč u veterináře.", icon: "exclamationmark.triangle.fill", color: .rixoWarning)
            }
        }
    }

    private var step5Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Kontaktní údaje", subtitle: "Kam vám zaslat výsledky srovnání?")
            VStack(spacing: 12) {
                RixoTextField(placeholder: "E-mail", text: $contactEmail, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
                RixoTextField(placeholder: "Telefon (+420 ...)", text: $contactPhone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)
            }
            GDPRConsentRow(isOn: $gdprConsent)
        }
    }

    var canProceed: Bool {
        switch currentStep {
        case 3: return !petBreed.isEmpty
        case 4: return hasMicrochip == true
        case 5: return AuthService.isValidEmail(contactEmail) && AuthService.isValidPhone(contactPhone) && gdprConsent
        default: return true
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: 12) {
            if currentStep > 1 {
                Button(action: { withAnimation { currentStep -= 1 } }) {
                    Image(systemName: "chevron.left").font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(width: 52, height: 52)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
                }
            }
            Button(action: {
                if currentStep < totalSteps { withAnimation { currentStep += 1 } }
                else { showResults = true }
            }) {
                HStack(spacing: 8) {
                    Text(currentStep == totalSteps ? "Srovnat pojištění" : "Pokračovat")
                        .font(.system(size: 16, weight: .semibold))
                    Image(systemName: currentStep == totalSteps ? "magnifyingglass" : "chevron.right")
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity).frame(height: 52)
                .background(canProceed ? Color.rixoOrange : Color.gray.opacity(0.4))
                .cornerRadius(14)
            }
            .disabled(!canProceed)
        }
        .padding(.horizontal, 20).padding(.vertical, 16)
        .background(Color.rixoCard)
    }
}

#Preview { PetInsuranceView() }
