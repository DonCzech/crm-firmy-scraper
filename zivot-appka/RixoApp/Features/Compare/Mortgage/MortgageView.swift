import SwiftUI

struct MortgageView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 1
    let totalSteps = 6

    @State private var mortgageType = "Nová hypotéka"
    let mortgageTypes = ["Nová hypotéka", "Refinancování"]

    @State private var propertyPrice: String = ""
    @State private var loanAmount: Double = 2_000_000
    @State private var propertyPriceValue: Double = 3_000_000

    @State private var repaymentYears = 20
    let repaymentOptions = [10, 15, 20, 25, 30]

    @State private var purpose = "Koupě nemovitosti"
    let purposes = ["Koupě nemovitosti", "Výstavba", "Rekonstrukce", "Neúčelový úvěr"]

    @State private var contactEmail = ""
    @State private var contactPhone = ""
    @State private var gdprConsent = false
    @State private var showResults = false

    var stepTitles: [String] { ["Typ", "Cena", "Výše", "Splatnost", "Účel", "Kontakt"] }

    var maxLoan: Double {
        max(propertyPriceValue * 0.9, 100_000)
    }

    var ltv: Double {
        guard propertyPriceValue > 0 else { return 0 }
        return (loanAmount / propertyPriceValue) * 100
    }

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
                        case 2: step2PropertyPrice
                        case 3: step3LoanAmount
                        case 4: step4Repayment
                        case 5: step5Purpose
                        case 6: step6Contact
                        default: EmptyView()
                        }
                    }
                    .padding(.horizontal, 20).padding(.vertical, 20)
                }
                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Hypotéka")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $showResults) {
            MortgageResultsView()
        }
    }

    private var step1Type: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ hypotéky", subtitle: "Žádáte o novou hypotéku nebo refinancujete stávající?")
            VStack(spacing: 10) {
                TypeOptionCard(
                    title: "Nová hypotéka",
                    subtitle: "Financování koupě nebo výstavby nemovitosti.",
                    icon: "house.fill",
                    isSelected: mortgageType == "Nová hypotéka",
                    color: Color.rixoOrange
                ) { mortgageType = "Nová hypotéka" }
                TypeOptionCard(
                    title: "Refinancování",
                    subtitle: "Přechod k jinému poskytovateli s lepšími podmínkami.",
                    icon: "arrow.triangle.2.circlepath",
                    isSelected: mortgageType == "Refinancování",
                    color: Color(hex: "#007AFF")
                ) { mortgageType = "Refinancování" }
            }
        }
    }

    private var step2PropertyPrice: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Cena nemovitosti", subtitle: "Odhadovaná nebo sjednaná kupní cena nemovitosti.")
            RixoTextField(placeholder: "Cena v Kč (např. 3 500 000)", text: $propertyPrice, keyboardType: .numberPad, icon: "house.circle.fill", isRequired: true)

            if let price = Double(propertyPrice.filter { $0.isNumber }) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Max. výše úvěru (90 %)")
                            .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                        Spacer()
                        Text((price * 0.9).czk)
                            .font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoOrange)
                    }
                    HStack {
                        Text("Min. vlastní zdroje (10 %)")
                            .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                        Spacer()
                        Text((price * 0.1).czk)
                            .font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoSuccess)
                    }
                }
                .padding(14).background(Color.rixoOrange.opacity(0.06)).cornerRadius(12)
                .onAppear { propertyPriceValue = price; loanAmount = price * 0.8 }
            }
        }
    }

    private var step3LoanAmount: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Výše hypotéky", subtitle: "Kolik chcete půjčit? Maximum je 90 % ceny nemovitosti.")
            VStack(spacing: 16) {
                VStack(spacing: 4) {
                    Text(loanAmount.czk)
                        .font(.system(size: 28, weight: .bold)).foregroundColor(.rixoOrange)
                    Text("LTV: \(String(format: "%.0f", ltv)) %")
                        .font(.system(size: 14)).foregroundColor(ltv > 80 ? .rixoWarning : .rixoSuccess)
                }
                Slider(value: $loanAmount, in: 300_000...maxLoan, step: 50_000).tint(.rixoOrange)
                HStack {
                    Text("300 000 Kč").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    Spacer()
                    Text(maxLoan.czk).font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                }
            }
            .padding(16).background(Color.rixoCard).cornerRadius(14)
        }
    }

    private var step4Repayment: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Doba splatnosti", subtitle: "Na kolik let chcete rozložit splácení?")
            HStack(spacing: 8) {
                ForEach(repaymentOptions, id: \.self) { years in
                    Button(action: { repaymentYears = years }) {
                        VStack(spacing: 4) {
                            Text("\(years)")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(repaymentYears == years ? .white : .rixoOrange)
                            Text("let")
                                .font(.system(size: 11))
                                .foregroundColor(repaymentYears == years ? .white.opacity(0.8) : .rixoTextSecondary)
                        }
                        .frame(maxWidth: .infinity).frame(height: 64)
                        .background(repaymentYears == years ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                        .cornerRadius(12)
                    }
                }
            }
        }
    }

    private var step5Purpose: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Účel hypotéky", subtitle: "K jakému účelu budou prostředky použity?")
            VStack(spacing: 8) {
                ForEach(purposes, id: \.self) { p in
                    SelectionRow(title: p, isSelected: purpose == p) { purpose = p }
                }
            }
        }
    }

    private var step6Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Kontaktní údaje", subtitle: "Kam vám zaslat výsledky srovnání bank?")
            VStack(spacing: 12) {
                RixoTextField(placeholder: "E-mail", text: $contactEmail, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
                RixoTextField(placeholder: "Telefon (+420 ...)", text: $contactPhone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)
            }
            GDPRConsentRow(isOn: $gdprConsent)
        }
    }

    var canProceed: Bool {
        switch currentStep {
        case 2: return !propertyPrice.isEmpty
        case 6: return AuthService.isValidEmail(contactEmail) && AuthService.isValidPhone(contactPhone) && gdprConsent
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
                    Text(currentStep == totalSteps ? "Srovnat banky" : "Pokračovat")
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

struct MortgageResultsView: View {
    @Environment(\.dismiss) var dismiss

    struct BankOffer: Identifiable {
        let id = UUID()
        let bank: String
        let colorHex: String
        let rate: Double
        let monthlyPayment: Double
        let fixation: String
        let isRecommended: Bool
    }

    let offers: [BankOffer] = [
        BankOffer(bank: "ČSOB", colorHex: "#004B87", rate: 4.89, monthlyPayment: 10_520, fixation: "3 roky", isRecommended: true),
        BankOffer(bank: "Česká spořitelna", colorHex: "#0066CC", rate: 4.99, monthlyPayment: 10_660, fixation: "5 let", isRecommended: false),
        BankOffer(bank: "Komerční banka", colorHex: "#D0021B", rate: 5.09, monthlyPayment: 10_800, fixation: "3 roky", isRecommended: false),
        BankOffer(bank: "UniCredit", colorHex: "#E62B2B", rate: 5.19, monthlyPayment: 10_950, fixation: "5 let", isRecommended: false),
        BankOffer(bank: "Hypoteční banka", colorHex: "#005B99", rate: 4.79, monthlyPayment: 10_380, fixation: "1 rok", isRecommended: true)
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    ForEach(offers) { offer in
                        VStack(spacing: 0) {
                            HStack(spacing: 14) {
                                ZStack {
                                    Circle().fill(Color(hex: offer.colorHex))
                                        .frame(width: 48, height: 48)
                                    Text(String(offer.bank.prefix(2)).uppercased())
                                        .font(.system(size: 14, weight: .bold)).foregroundColor(.white)
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(offer.bank).font(.system(size: 15, weight: .semibold))
                                        Spacer()
                                        if offer.isRecommended {
                                            Label("Doporučujeme", systemImage: "star.fill")
                                                .font(.system(size: 10, weight: .semibold))
                                                .foregroundColor(.rixoWarning)
                                                .padding(.horizontal, 7).padding(.vertical, 3)
                                                .background(Color.rixoWarning.opacity(0.12))
                                                .cornerRadius(6)
                                        }
                                    }
                                    HStack {
                                        Text("Úrok: \(String(format: "%.2f", offer.rate)) %")
                                            .font(.system(size: 13, weight: .semibold)).foregroundColor(.rixoOrange)
                                        Text("•").foregroundColor(.rixoTextSecondary)
                                        Text("Fixace: \(offer.fixation)")
                                            .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                                    }
                                    Text("Měsíční splátka: \(offer.monthlyPayment.czk)")
                                        .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                                }
                            }
                            .padding(16)
                            Divider().padding(.horizontal, 16)
                            Button(action: {}) {
                                Text("Mám zájem")
                                    .font(.system(size: 14, weight: .semibold)).foregroundColor(.white)
                                    .frame(maxWidth: .infinity).frame(height: 40)
                                    .background(Color.rixoOrange).cornerRadius(10)
                            }
                            .padding(.horizontal, 16).padding(.vertical, 12)
                        }
                        .rixoCard()
                    }
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Srovnání bank")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Zavřít") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
    }
}

#Preview { MortgageView() }
