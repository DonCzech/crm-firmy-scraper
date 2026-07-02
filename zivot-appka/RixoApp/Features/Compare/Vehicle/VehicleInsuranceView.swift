import SwiftUI

struct VehicleInsuranceView: View {
    @StateObject private var viewModel = VehicleInsuranceViewModel()
    @Environment(\.dismiss) var dismiss
    let initialType: InsuranceType

    init(initialType: InsuranceType) {
        self.initialType = initialType
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Progress
                VStack(spacing: 12) {
                    StepProgressView(currentStep: viewModel.currentStep, totalSteps: viewModel.totalSteps)
                    StepIndicatorRow(
                        currentStep: viewModel.currentStep,
                        totalSteps: viewModel.totalSteps,
                        stepTitles: viewModel.stepTitles
                    )
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

                // Navigation buttons
                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Porovnat vozidlové poj.")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.rixoTextSecondary)
                    }
                }
            }
        }
        .sheet(isPresented: $viewModel.showResults) {
            ResultsView(insuranceType: viewModel.selectedType)
        }
        .onAppear {
            viewModel.selectedType = initialType
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1TypeSelector
        case 2: step2SPZ
        case 3: step3VehicleInfo
        case 4: step4Usage
        case 5: step5Mileage
        case 6: step6Security
        case 7: step7DriverInfo
        case 8: step8NoClaimsBonus
        case 9: step9Contact
        default: EmptyView()
        }
    }

    // STEP 1: Type selector
    private var step1TypeSelector: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Typ pojištění vozidla",
                subtitle: "Vyberte, jaký typ pojištění chcete srovnat."
            )

            VStack(spacing: 10) {
                ForEach([InsuranceType.povinneRuceni, .havarijski, .povinneHavarijski], id: \.self) { type in
                    TypeOptionCard(
                        title: type.displayName,
                        subtitle: typeSubtitle(for: type),
                        icon: type.iconName,
                        isSelected: viewModel.selectedType == type,
                        color: type.color
                    ) {
                        viewModel.selectedType = type
                    }
                }
            }
        }
    }

    // STEP 2: SPZ / VIN
    private var step2SPZ: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Identifikace vozidla",
                subtitle: "Zadejte SPZ nebo VIN číslo vašeho vozidla."
            )

            // Tab selector
            HStack(spacing: 0) {
                ForEach(["SPZ", "VIN"], id: \.self) { option in
                    Button(action: { viewModel.useSPZ = (option == "SPZ") }) {
                        Text(option)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(((option == "SPZ") == viewModel.useSPZ) ? .white : .rixoTextSecondary)
                            .frame(maxWidth: .infinity)
                            .frame(height: 40)
                            .background(((option == "SPZ") == viewModel.useSPZ) ? Color.rixoOrange : Color.clear)
                            .cornerRadius(10)
                    }
                }
            }
            .padding(4)
            .background(Color.gray.opacity(0.12))
            .cornerRadius(12)

            if viewModel.useSPZ {
                VStack(alignment: .leading, spacing: 8) {
                    RixoTextField(
                        placeholder: "Státní poznávací značka (1AB2345)",
                        text: $viewModel.spz,
                        autocapitalization: .characters,
                        errorMessage: viewModel.spzError
                    )
                    Text("Formát: 1–2 písmena + 1–3 čísla + 1–2 písmena")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }
            } else {
                RixoTextField(
                    placeholder: "VIN číslo (17 znaků)",
                    text: $viewModel.vin,
                    autocapitalization: .characters
                )
            }

            InfoCard(text: "Po zadání SPZ automaticky doplníme informace o vozidle z evidence vozidel.")
        }
    }

    // STEP 3: Vehicle info
    private var step3VehicleInfo: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Informace o vozidle",
                subtitle: "Zkontrolujte nebo upravte údaje o vozidle."
            )

            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Značka", text: $viewModel.vehicleMake, icon: "car.fill")
                    RixoTextField(placeholder: "Model", text: $viewModel.vehicleModel)
                }
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Rok výroby", text: $viewModel.vehicleYear, keyboardType: .numberPad, icon: "calendar")
                    RixoTextField(placeholder: "Zdvihový obj. (ccm)", text: $viewModel.engineCC, keyboardType: .numberPad)
                }
            }

            Button(action: { viewModel.simulateVehicleLookup() }) {
                Label("Načíst z evidence", systemImage: "arrow.clockwise")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.rixoOrange)
            }
        }
    }

    // STEP 4: Usage
    private var step4Usage: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Způsob použití vozidla",
                subtitle: "Jak nejčastěji používáte své vozidlo?"
            )

            VStack(spacing: 10) {
                ForEach(viewModel.usageOptions, id: \.self) { option in
                    SelectionRow(
                        title: option,
                        isSelected: viewModel.vehicleUsage == option
                    ) {
                        viewModel.vehicleUsage = option
                    }
                }
            }
        }
    }

    // STEP 5: Mileage
    private var step5Mileage: some View {
        VStack(spacing: 24) {
            StepTitleView(
                title: "Roční nájezd kilometrů",
                subtitle: "Přibližný roční počet ujetých kilometrů."
            )

            VStack(spacing: 16) {
                Text("\(Int(viewModel.annualMileage).formatted) km / rok")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.rixoOrange)

                Slider(
                    value: $viewModel.annualMileage,
                    in: 5000...50000,
                    step: 1000
                )
                .tint(.rixoOrange)

                HStack {
                    Text("5 000 km")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                    Spacer()
                    Text("50 000 km")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }
            }
            .padding(20)
            .background(Color.rixoCard)
            .cornerRadius(16)

            // Quick presets
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach([10000, 15000, 20000, 25000, 30000, 40000], id: \.self) { km in
                    Button(action: { viewModel.annualMileage = Double(km) }) {
                        Text("\(km/1000)k km")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(viewModel.annualMileage == Double(km) ? .white : .rixoOrange)
                            .frame(maxWidth: .infinity)
                            .frame(height: 36)
                            .background(viewModel.annualMileage == Double(km) ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                            .cornerRadius(8)
                    }
                }
            }
        }
    }

    // STEP 6: Security
    private var step6Security: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Zabezpečení vozidla",
                subtitle: "Označte bezpečnostní prvky vašeho vozidla."
            )

            VStack(spacing: 10) {
                ToggleRow(title: "Alarm", icon: "bell.fill", isOn: $viewModel.hasAlarm)
                ToggleRow(title: "Imobilizér", icon: "lock.fill", isOn: $viewModel.hasImmobilizer)
                ToggleRow(title: "GPS tracker", icon: "location.fill", isOn: $viewModel.hasGPSTracker)
                ToggleRow(title: "Mechanické zabezpečení", icon: "key.fill", isOn: $viewModel.hasMechanicalLock)
            }

            InfoCard(text: "Lepší zabezpečení vozidla může snížit vaše pojistné.")
        }
    }

    // STEP 7: Driver info
    private var step7DriverInfo: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Informace o řidiči",
                subtitle: "Údaje o hlavním řidiči vozidla."
            )

            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Jméno", text: $viewModel.driverFirstName, icon: "person.fill", isRequired: true)
                    RixoTextField(placeholder: "Příjmení", text: $viewModel.driverLastName, isRequired: true)
                }
                RixoTextField(
                    placeholder: "Rodné číslo (bez lomítka)",
                    text: $viewModel.driverRC,
                    keyboardType: .numberPad,
                    icon: "number",
                    isRequired: true
                )
                RixoTextField(
                    placeholder: "PSČ trvalého bydliště",
                    text: $viewModel.driverPSC,
                    keyboardType: .numberPad,
                    icon: "mappin.circle.fill",
                    isRequired: true
                )
            }
        }
    }

    // STEP 8: No claims bonus
    private var step8NoClaimsBonus: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Bezeškodní průběh (BŠP)",
                subtitle: "Počet let bez pojistné události. Čím více, tím větší sleva!"
            )

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(0...7, id: \.self) { years in
                    Button(action: { viewModel.noClaimsYears = years }) {
                        VStack(spacing: 4) {
                            Text("\(years)")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(viewModel.noClaimsYears == years ? .white : .rixoOrange)
                            Text("let")
                                .font(.system(size: 11))
                                .foregroundColor(viewModel.noClaimsYears == years ? .white.opacity(0.8) : .rixoTextSecondary)
                        }
                        .frame(height: 64)
                        .frame(maxWidth: .infinity)
                        .background(viewModel.noClaimsYears == years ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                        .cornerRadius(12)
                    }
                }
            }

            if viewModel.noClaimsYears >= 5 {
                HStack(spacing: 8) {
                    Image(systemName: "star.fill")
                        .foregroundColor(Color(hex: "#FFD60A"))
                    Text("Výborný BŠP! Máte nárok na slevu až 50 %.")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.rixoTextPrimary)
                }
                .padding(14)
                .background(Color(hex: "#FFD60A").opacity(0.1))
                .cornerRadius(10)
            }
        }
    }

    // STEP 9: Contact
    private var step9Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: "Kontaktní údaje",
                subtitle: "Kam vám zaslat výsledky srovnání?"
            )

            VStack(spacing: 12) {
                RixoTextField(
                    placeholder: "E-mail",
                    text: $viewModel.contactEmail,
                    keyboardType: .emailAddress,
                    icon: "envelope.fill",
                    isRequired: true,
                    autocapitalization: .never
                )
                RixoTextField(
                    placeholder: "Telefon (+420 ...)",
                    text: $viewModel.contactPhone,
                    keyboardType: .phonePad,
                    icon: "phone.fill",
                    isRequired: true
                )
            }

            GDPRConsentRow(isOn: $viewModel.gdprConsent)

            InfoCard(text: "Vaše údaje zpracujeme pouze za účelem srovnání pojištění. Výsledky zobrazíme ihned.")
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
                        .font(.system(size: 14, weight: .semibold))
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

    private func typeSubtitle(for type: InsuranceType) -> String {
        switch type {
        case .povinneRuceni: return "Povinné ze zákona. Chrání ostatní."
        case .havarijski: return "Chrání vaše vozidlo při nehodě."
        case .povinneHavarijski: return "Kombinace POV + HAV – komplexní ochrana."
        default: return ""
        }
    }
}

// Helper views
struct StepTitleView: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.rixoTextPrimary)
            Text(subtitle)
                .font(.system(size: 14))
                .foregroundColor(.rixoTextSecondary)
                .lineSpacing(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct TypeOptionCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(isSelected ? color : color.opacity(0.12))
                        .frame(width: 48, height: 48)
                    Image(systemName: icon)
                        .font(.system(size: 20))
                        .foregroundColor(isSelected ? .white : color)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.rixoTextPrimary)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? color : Color.gray.opacity(0.4))
                    .font(.system(size: 22))
            }
            .padding(16)
            .background(Color.rixoCard)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? color : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SelectionRow: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Text(title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.rixoTextPrimary)
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .rixoOrange : Color.gray.opacity(0.4))
                    .font(.system(size: 22))
            }
            .padding(16)
            .background(Color.rixoCard)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.rixoOrange : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ToggleRow: View {
    let title: String
    let icon: String
    @Binding var isOn: Bool

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .foregroundColor(.rixoOrange)
                .font(.system(size: 18))
                .frame(width: 28)
            Text(title)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.rixoTextPrimary)
            Spacer()
            Toggle("", isOn: $isOn)
                .tint(.rixoOrange)
        }
        .padding(16)
        .background(Color.rixoCard)
        .cornerRadius(12)
    }
}

struct InfoCard: View {
    let text: String
    var icon: String = "info.circle.fill"
    var color: Color = .rixoOrange

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 16))
            Text(text)
                .font(.system(size: 13))
                .foregroundColor(.rixoTextSecondary)
                .lineSpacing(2)
        }
        .padding(14)
        .background(color.opacity(0.06))
        .cornerRadius(10)
    }
}

struct GDPRConsentRow: View {
    @Binding var isOn: Bool

    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(alignment: .top, spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 6)
                        .stroke(isOn ? Color.rixoOrange : Color.gray.opacity(0.4), lineWidth: 2)
                        .frame(width: 22, height: 22)
                    if isOn {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color.rixoOrange)
                            .frame(width: 22, height: 22)
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .animation(.easeInOut(duration: 0.15), value: isOn)

                Text("Souhlasím se zpracováním osobních údajů za účelem srovnání pojištění.")
                    .font(.system(size: 13))
                    .foregroundColor(.rixoTextSecondary)
                    .multilineTextAlignment(.leading)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    VehicleInsuranceView(initialType: .povinneRuceni)
}
