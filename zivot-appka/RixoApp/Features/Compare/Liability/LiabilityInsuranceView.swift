import SwiftUI

struct LiabilityInsuranceView: View {
    @Environment(\.dismiss) var dismiss
    let initialType: InsuranceType

    @State private var currentStep = 1
    let totalSteps = 4

    @State private var selectedType: InsuranceType
    @State private var damageHealth = true
    @State private var damageProperty = true
    @State private var animalLiability = false
    @State private var stateRegress = false
    @State private var rentalDamage = false
    @State private var electronicsDamage = false
    @State private var coverageLimit = 1
    let coverageLimits = [1, 3, 5]
    @State private var contactEmail = ""
    @State private var contactPhone = ""
    @State private var gdprConsent = false
    @State private var showResults = false

    init(initialType: InsuranceType) {
        self.initialType = initialType
        _selectedType = State(initialValue: initialType)
    }

    var stepTitles: [String] { ["Typ", "Krytí", "Limit", "Kontakt"] }

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
                        case 1: step1Type
                        case 2: step2Coverage
                        case 3: step3Limit
                        case 4: step4Contact
                        default: EmptyView()
                        }
                    }
                    .padding(.horizontal, 20).padding(.vertical, 20)
                }
                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Pojištění odpovědnosti")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $showResults) {
            ResultsView(insuranceType: selectedType)
        }
    }

    private var step1Type: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ pojištění odpovědnosti", subtitle: "Pro koho pojištění sjednáváte?")
            VStack(spacing: 10) {
                TypeOptionCard(
                    title: "Občan v běžném životě",
                    subtitle: "Škody způsobené v každodenním životě.",
                    icon: "person.fill",
                    isSelected: selectedType == .odpovednostObcan,
                    color: Color(hex: "#FF9500")
                ) { selectedType = .odpovednostObcan }
                TypeOptionCard(
                    title: "Zaměstnanec v práci",
                    subtitle: "Škody způsobené při výkonu zaměstnání.",
                    icon: "briefcase.fill",
                    isSelected: selectedType == .odpovednostZamestnanec,
                    color: Color(hex: "#5856D6")
                ) { selectedType = .odpovednostZamestnanec }
            }
        }
    }

    private var step2Coverage: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Rozsah krytí", subtitle: "Vyberte typy škod, které chcete mít pojištěné.")
            VStack(spacing: 10) {
                ToggleRow(title: "Škody na zdraví", icon: "cross.fill", isOn: $damageHealth)
                ToggleRow(title: "Škody na majetku", icon: "house.fill", isOn: $damageProperty)
                ToggleRow(title: "Odpovědnost za zvíře", icon: "pawprint.fill", isOn: $animalLiability)
                ToggleRow(title: "Regres státu (nemoc, úraz)", icon: "building.fill", isOn: $stateRegress)
                ToggleRow(title: "Škody při pronájmu", icon: "key.fill", isOn: $rentalDamage)
                ToggleRow(title: "Poškození elektroniky", icon: "laptopcomputer", isOn: $electronicsDamage)
            }
        }
    }

    private var step3Limit: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Výše pojistného limitu", subtitle: "Do jaké výše chcete být krytí?")
            HStack(spacing: 12) {
                ForEach(coverageLimits, id: \.self) { limit in
                    Button(action: { coverageLimit = limit }) {
                        VStack(spacing: 6) {
                            Text("\(limit) mil.")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(coverageLimit == limit ? .white : .rixoOrange)
                            Text("Kč")
                                .font(.system(size: 13))
                                .foregroundColor(coverageLimit == limit ? .white.opacity(0.8) : .rixoTextSecondary)
                        }
                        .frame(maxWidth: .infinity).frame(height: 80)
                        .background(coverageLimit == limit ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                        .cornerRadius(14)
                    }
                }
            }
            InfoCard(text: "Doporučujeme minimálně 3 mil. Kč – léčebné náklady při vážném úrazu mohou přesáhnout 1 mil. Kč.")
        }
    }

    private var step4Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Kontaktní údaje", subtitle: "Kam vám zaslat výsledky srovnání?")
            VStack(spacing: 12) {
                RixoTextField(placeholder: "E-mail", text: $contactEmail, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
                RixoTextField(placeholder: "Telefon (+420 ...)", text: $contactPhone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)
            }
            GDPRConsentRow(isOn: $gdprConsent)
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
                .background(Color.rixoOrange).cornerRadius(14)
            }
        }
        .padding(.horizontal, 20).padding(.vertical, 16)
        .background(Color.rixoCard)
    }
}

#Preview { LiabilityInsuranceView(initialType: .odpovednostObcan) }
