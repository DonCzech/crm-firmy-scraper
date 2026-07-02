import SwiftUI

struct EnergyView: View {
    @StateObject private var viewModel = EnergyViewModel()
    @Environment(\.dismiss) var dismiss
    let initialType: InsuranceType

    init(initialType: InsuranceType) {
        self.initialType = initialType
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                VStack(spacing: 12) {
                    StepProgressView(currentStep: viewModel.currentStep, totalSteps: viewModel.totalSteps)
                    StepIndicatorRow(currentStep: viewModel.currentStep, totalSteps: viewModel.totalSteps, stepTitles: viewModel.stepTitles)
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
                .background(Color.rixoCard)

                ScrollView {
                    VStack(spacing: 20) { stepContent }
                    .padding(.horizontal, 20).padding(.vertical, 20)
                }
                navigationButtons
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle(viewModel.isElectricity ? "Srovnání elektřiny" : "Srovnání plynu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .onAppear { viewModel.isElectricity = (initialType == .elektrina) }
        .sheet(isPresented: $viewModel.showResults) {
            ResultsView(insuranceType: initialType)
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1PSC
        case 2: step2Provider
        case 3: step3Purpose
        case 4: step4Tariff
        case 5: step5CircuitBreaker
        case 6: step6Consumption
        case 7: step7Contact
        default: EmptyView()
        }
    }

    private var step1PSC: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "PSČ odběrného místa", subtitle: "Zadejte poštovní směrovací číslo vašeho odběrného místa.")
            RixoTextField(placeholder: "PSČ (5 číslic)", text: $viewModel.postalCode, keyboardType: .numberPad, icon: "mappin.circle.fill", isRequired: true)
            InfoCard(text: "PSČ potřebujeme pro určení distribučního území a dostupných tarifů.")
        }
    }

    private var step2Provider: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Aktuální dodavatel", subtitle: "Kdo vám aktuálně dodává \(viewModel.isElectricity ? "elektřinu" : "plyn")?")
            VStack(spacing: 8) {
                ForEach(viewModel.providers, id: \.self) { provider in
                    SelectionRow(title: provider, isSelected: viewModel.currentProvider == provider) {
                        viewModel.currentProvider = provider
                    }
                }
            }
        }
    }

    private var step3Purpose: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Účel spotřeby", subtitle: "K čemu \(viewModel.isElectricity ? "elektřinu" : "plyn") využíváte?")
            VStack(spacing: 10) {
                ToggleRow(title: "Vaření", icon: "flame.fill", isOn: $viewModel.purposeCooking)
                ToggleRow(title: "Vytápění", icon: "thermometer.sun.fill", isOn: $viewModel.purposeHeating)
                ToggleRow(title: "Ohřev vody", icon: "drop.fill", isOn: $viewModel.purposeHotWater)
            }
        }
    }

    private var step4Tariff: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: viewModel.isElectricity ? "Tarifní sazba (elektřina)" : "Tarifní sazba (plyn)",
                subtitle: "Naleznete ji na vyúčtování nebo ve smlouvě s dodavatelem."
            )
            VStack(spacing: 8) {
                ForEach(viewModel.isElectricity ? viewModel.electricTariffs : viewModel.gasTariffs, id: \.self) { tariff in
                    SelectionRow(
                        title: tariff,
                        isSelected: viewModel.isElectricity ? viewModel.electricTariff == tariff : viewModel.gasTariff == tariff
                    ) {
                        if viewModel.isElectricity { viewModel.electricTariff = tariff }
                        else { viewModel.gasTariff = tariff }
                    }
                }
            }
        }
    }

    private var step5CircuitBreaker: some View {
        VStack(spacing: 20) {
            if viewModel.isElectricity {
                StepTitleView(title: "Jistič", subtitle: "Jakou hodnotu má váš hlavní jistič? Naleznete v rozvaděči.")
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(viewModel.circuitBreakers, id: \.self) { amp in
                        Button(action: { viewModel.circuitBreaker = amp }) {
                            VStack(spacing: 4) {
                                Text(amp)
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(viewModel.circuitBreaker == amp ? .white : .rixoOrange)
                            }
                            .frame(maxWidth: .infinity).frame(height: 56)
                            .background(viewModel.circuitBreaker == amp ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                            .cornerRadius(12)
                        }
                    }
                }
            } else {
                StepTitleView(title: "Roční spotřeba plynu", subtitle: "Uveďte přibližnou roční spotřebu plynu v m³.")
                RixoTextField(placeholder: "m³ / rok", text: $viewModel.gasConsumptionM3, keyboardType: .numberPad, icon: "flame.fill")
                InfoCard(text: "Průměrná domácnost spotřebuje 1 000–3 000 m³ plynu ročně.")
            }
        }
    }

    private var step6Consumption: some View {
        VStack(spacing: 20) {
            StepTitleView(
                title: viewModel.isElectricity ? "Roční spotřeba elektřiny" : "Roční spotřeba plynu",
                subtitle: "Přibližná roční spotřeba – naleznete na vyúčtování."
            )
            if viewModel.isElectricity {
                VStack(spacing: 16) {
                    Text("\(Int(viewModel.annualConsumption).formatted) kWh / rok")
                        .font(.system(size: 24, weight: .bold)).foregroundColor(.rixoOrange)
                    Slider(value: $viewModel.annualConsumption, in: 500...20000, step: 500).tint(.rixoOrange)
                    HStack {
                        Text("500 kWh").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                        Spacer()
                        Text("20 000 kWh").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    }
                }
                .padding(16).background(Color.rixoCard).cornerRadius(14)
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach(viewModel.consumptionPresets, id: \.label) { preset in
                    Button(action: { viewModel.annualConsumption = preset.value }) {
                        Text(preset.label)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(viewModel.annualConsumption == preset.value ? .white : .rixoOrange)
                            .frame(maxWidth: .infinity).frame(height: 36)
                            .background(viewModel.annualConsumption == preset.value ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                            .cornerRadius(8)
                    }
                }
            }
        }
    }

    private var step7Contact: some View {
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
                    Image(systemName: "chevron.left").font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(width: 52, height: 52)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
                }
            }
            Button(action: viewModel.nextStep) {
                HStack(spacing: 8) {
                    Text(viewModel.currentStep == viewModel.totalSteps ? "Srovnat nabídky" : "Pokračovat")
                        .font(.system(size: 16, weight: .semibold))
                    Image(systemName: viewModel.currentStep == viewModel.totalSteps ? "magnifyingglass" : "chevron.right")
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity).frame(height: 52)
                .background(viewModel.canProceed ? Color.rixoOrange : Color.gray.opacity(0.4))
                .cornerRadius(14)
            }
            .disabled(!viewModel.canProceed)
        }
        .padding(.horizontal, 20).padding(.vertical, 16)
        .background(Color.rixoCard)
    }
}

#Preview { EnergyView(initialType: .elektrina) }
