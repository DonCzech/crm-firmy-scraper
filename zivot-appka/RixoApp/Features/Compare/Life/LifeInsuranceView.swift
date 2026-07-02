import SwiftUI

struct LifeInsuranceView: View {
    @StateObject private var viewModel = LifeInsuranceViewModel()
    @Environment(\.dismiss) var dismiss
    let initialType: InsuranceType

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: 12) {
                    StepProgressView(currentStep: viewModel.currentStep, totalSteps: viewModel.totalSteps)
                    StepIndicatorRow(currentStep: viewModel.currentStep, totalSteps: viewModel.totalSteps, stepTitles: viewModel.stepTitles)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(Color.rixoCard)

                ScrollView {
                    VStack(spacing: 20) {
                        stepContent
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 20)
                }

                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Životní/úrazové poj.")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark").foregroundColor(.rixoTextSecondary)
                    }
                }
            }
        }
        .sheet(isPresented: $viewModel.showResults) {
            ResultsView(insuranceType: viewModel.selectedType)
        }
        .onAppear { viewModel.selectedType = initialType }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1Type
        case 2: step2Employment
        case 3: step3Industry
        case 4: step4Physical
        case 5: step5Health
        case 6: step6SickLeave
        case 7: step7Children
        case 8: step8Income
        case 9: step9Contact
        default: EmptyView()
        }
    }

    private var step1Type: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ pojištění", subtitle: "Vyberte typ životního nebo úrazového pojištění.")
            VStack(spacing: 10) {
                TypeOptionCard(
                    title: "Životní pojištění",
                    subtitle: "Ochrana rodiny v případě smrti nebo invalidity.",
                    icon: "heart.fill",
                    isSelected: viewModel.selectedType == .zivotni,
                    color: Color(hex: "#FF2D55")
                ) { viewModel.selectedType = .zivotni }

                TypeOptionCard(
                    title: "Úrazové pojištění",
                    subtitle: "Odškodnění za úrazy a dobu léčení.",
                    icon: "bandage.fill",
                    isSelected: viewModel.selectedType == .urazove,
                    color: Color(hex: "#FF9500")
                ) { viewModel.selectedType = .urazove }

                TypeOptionCard(
                    title: "Kombinované pojištění",
                    subtitle: "Životní + úrazové – nejkomplexnější ochrana.",
                    icon: "shield.fill",
                    isSelected: viewModel.selectedType == .zivotni && viewModel.selectedType == .urazove,
                    color: Color.rixoOrange
                ) { viewModel.selectedType = .zivotni }
            }
        }
    }

    private var step2Employment: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Pracovní zařazení", subtitle: "Vaše aktuální pracovní status.")
            VStack(spacing: 8) {
                ForEach(viewModel.employmentOptions, id: \.self) { option in
                    SelectionRow(title: option, isSelected: viewModel.employment == option) {
                        viewModel.employment = option
                    }
                }
            }
        }
    }

    private var step3Industry: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Pracovní obor", subtitle: "Vyberte obor, ve kterém pracujete.")
            VStack(spacing: 8) {
                ForEach(viewModel.industries, id: \.self) { industry in
                    SelectionRow(title: industry, isSelected: viewModel.industry == industry) {
                        viewModel.industry = industry
                    }
                }
            }
        }
    }

    private var step4Physical: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Fyzické parametry", subtitle: "Potřebujeme vaše výška a váhu pro výpočet pojistného.")
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Výška")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    RixoTextField(placeholder: "cm", text: $viewModel.heightCM, keyboardType: .numberPad)
                }
                VStack(alignment: .leading, spacing: 6) {
                    Text("Váha")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    RixoTextField(placeholder: "kg", text: $viewModel.weightKG, keyboardType: .numberPad)
                }
            }

            if let h = Double(viewModel.heightCM), let w = Double(viewModel.weightKG), h > 0 {
                let bmi = w / ((h/100) * (h/100))
                BMICard(bmi: bmi)
            }
        }
    }

    private var step5Health: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Zdravotní stav", subtitle: "Odpovězte na otázky o vašem zdravotním stavu.")
            VStack(spacing: 10) {
                ForEach(0..<viewModel.healthQuestions.count, id: \.self) { index in
                    HStack {
                        Text(viewModel.healthQuestions[index])
                            .font(.system(size: 14))
                            .foregroundColor(.rixoTextPrimary)
                        Spacer()
                        HStack(spacing: 8) {
                            Button(action: { viewModel.healthAnswers[index] = true }) {
                                Text("ANO")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(viewModel.healthAnswers[index] ? .white : Color(hex: "#FF3B30"))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(viewModel.healthAnswers[index] ? Color(hex: "#FF3B30") : Color(hex: "#FF3B30").opacity(0.1))
                                    .cornerRadius(8)
                            }
                            Button(action: { viewModel.healthAnswers[index] = false }) {
                                Text("NE")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(!viewModel.healthAnswers[index] ? .white : .rixoSuccess)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(!viewModel.healthAnswers[index] ? Color.rixoSuccess : Color.rixoSuccess.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.rixoCard)
                    .cornerRadius(12)
                }
            }
        }
    }

    private var step6SickLeave: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Pojištění pracovní neschopnosti", subtitle: "Chcete být pojištění pro případ dlouhodobé nemoci?")

            ToggleRow(title: "Chci pojištění pracovní neschopnosti", icon: "cross.fill", isOn: $viewModel.hasSickLeave)

            if viewModel.hasSickLeave {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Denní dávka při nemoci")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    RixoTextField(placeholder: "Kč/den (např. 500)", text: $viewModel.sickLeaveBenefit, keyboardType: .numberPad)
                }
                InfoCard(text: "Při 30denní nemoci s dávkou 500 Kč/den obdržíte 15 000 Kč.")
            }
        }
    }

    private var step7Children: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Děti", subtitle: "Kolik máte závislých dětí?")

            HStack(spacing: 24) {
                Button(action: { if viewModel.childrenCount > 0 { viewModel.childrenCount -= 1 } }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(viewModel.childrenCount > 0 ? .rixoOrange : .gray.opacity(0.3))
                }
                .disabled(viewModel.childrenCount == 0)

                VStack(spacing: 4) {
                    Text("\(viewModel.childrenCount)")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.rixoOrange)
                    Text(viewModel.childrenCount == 1 ? "dítě" : viewModel.childrenCount < 5 ? "děti" : "dětí")
                        .font(.system(size: 14))
                        .foregroundColor(.rixoTextSecondary)
                }

                Button(action: { if viewModel.childrenCount < 5 { viewModel.childrenCount += 1 } }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(viewModel.childrenCount < 5 ? .rixoOrange : .gray.opacity(0.3))
                }
                .disabled(viewModel.childrenCount == 5)
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(Color.rixoCard)
            .cornerRadius(16)
        }
    }

    private var step8Income: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Příjmy a výdaje", subtitle: "Pro přesný výpočet potřebné pojistné částky.")
            VStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Měsíční čistý příjem")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    RixoTextField(placeholder: "Kč / měsíc", text: $viewModel.monthlyIncome, keyboardType: .numberPad, icon: "banknote")
                }
                VStack(alignment: .leading, spacing: 6) {
                    Text("Měsíční výdaje (nájem, splátky...)")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    RixoTextField(placeholder: "Kč / měsíc", text: $viewModel.monthlyExpenses, keyboardType: .numberPad, icon: "cart")
                }
            }
            InfoCard(text: "Na základě vašich příjmů a výdajů vám doporučíme odpovídající výši pojistné částky.")
        }
    }

    private var step9Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Kontaktní údaje", subtitle: "Kam vám zaslat výsledky srovnání?")
            VStack(spacing: 12) {
                RixoTextField(placeholder: "E-mail", text: $viewModel.contactEmail, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
                RixoTextField(placeholder: "Telefon (+420 ...)", text: $viewModel.contactPhone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)
            }
            GDPRConsentRow(isOn: $viewModel.gdprConsent)
        }
    }

    private var navigationButtons: some View {
        HStack(spacing: 12) {
            if viewModel.currentStep > 1 {
                Button(action: viewModel.previousStep) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(width: 52, height: 52)
                        .background(Color.rixoOrange.opacity(0.08))
                        .cornerRadius(14)
                }
            }
            Button(action: viewModel.nextStep) {
                HStack(spacing: 8) {
                    Text(viewModel.currentStep == viewModel.totalSteps ? "Srovnat pojištění" : "Pokračovat")
                        .font(.system(size: 16, weight: .semibold))
                    Image(systemName: viewModel.currentStep == viewModel.totalSteps ? "magnifyingglass" : "chevron.right")
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(viewModel.canProceed ? Color.rixoOrange : Color.gray.opacity(0.4))
                .cornerRadius(14)
            }
            .disabled(!viewModel.canProceed)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(Color.rixoCard)
    }
}

struct BMICard: View {
    let bmi: Double

    var category: (label: String, color: Color) {
        switch bmi {
        case ..<18.5: return ("Podváha", .rixoWarning)
        case 18.5..<25: return ("Normální váha", .rixoSuccess)
        case 25..<30: return ("Nadváha", .rixoWarning)
        default: return ("Obezita", .rixoDanger)
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("BMI Index")
                    .font(.system(size: 12))
                    .foregroundColor(.rixoTextSecondary)
                Text(String(format: "%.1f", bmi))
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(category.color)
            }
            Spacer()
            Text(category.label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(category.color)
                .cornerRadius(8)
        }
        .padding(14)
        .background(category.color.opacity(0.08))
        .cornerRadius(12)
    }
}

#Preview {
    LifeInsuranceView(initialType: .zivotni)
}
