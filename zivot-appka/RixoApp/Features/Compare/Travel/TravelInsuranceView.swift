import SwiftUI

struct TravelInsuranceView: View {
    @StateObject private var viewModel = TravelInsuranceViewModel()
    @Environment(\.dismiss) var dismiss

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
            .navigationTitle("Cestovní pojištění")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $viewModel.showResults) {
            ResultsView(insuranceType: .cestovni)
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1Destination
        case 2: step2Dates
        case 3: step3Travelers
        case 4: step4Ages
        case 5: step5Addons
        case 6: step6Contact
        default: EmptyView()
        }
    }

    private var step1Destination: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Destinace", subtitle: "Kam cestujete?")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(viewModel.destinations) { dest in
                    Button(action: { viewModel.selectedDestination = dest.name }) {
                        VStack(spacing: 6) {
                            Text(dest.flag)
                                .font(.system(size: 28))
                            Text(dest.name)
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.rixoTextPrimary)
                                .multilineTextAlignment(.center)
                                .lineLimit(2)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(viewModel.selectedDestination == dest.name ? Color.rixoOrange.opacity(0.1) : Color.rixoCard)
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(viewModel.selectedDestination == dest.name ? Color.rixoOrange : Color.clear, lineWidth: 2)
                        )
                    }
                }
            }
        }
    }

    private var step2Dates: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Datum cesty", subtitle: "Vyberte termín vaší cesty.")
            VStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Odjezd", systemImage: "airplane.departure")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    DatePicker("", selection: $viewModel.departureDate, in: Date()..., displayedComponents: .date)
                        .datePickerStyle(.graphical)
                        .tint(.rixoOrange)
                        .environment(\.locale, Locale(identifier: "cs_CZ"))
                }
                .padding(16)
                .background(Color.rixoCard)
                .cornerRadius(14)

                VStack(alignment: .leading, spacing: 8) {
                    Label("Návrat", systemImage: "airplane.arrival")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.rixoTextSecondary)
                    DatePicker("", selection: $viewModel.returnDate, in: viewModel.departureDate..., displayedComponents: .date)
                        .datePickerStyle(.compact)
                        .tint(.rixoOrange)
                        .environment(\.locale, Locale(identifier: "cs_CZ"))
                }
                .padding(16)
                .background(Color.rixoCard)
                .cornerRadius(14)
            }
            if viewModel.tripDuration > 0 {
                HStack {
                    Image(systemName: "clock.fill").foregroundColor(.rixoOrange)
                    Text("Délka cesty: \(viewModel.tripDuration) dní")
                        .font(.system(size: 14, weight: .medium))
                }
                .padding(12)
                .background(Color.rixoOrange.opacity(0.08))
                .cornerRadius(10)
            }
        }
    }

    private var step3Travelers: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Počet cestujících", subtitle: "Kolik osob bude pojištěno?")
            HStack(spacing: 24) {
                Button(action: { if viewModel.travelersCount > 1 { viewModel.updateTravelerCount(viewModel.travelersCount - 1) } }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(viewModel.travelersCount > 1 ? .rixoOrange : .gray.opacity(0.3))
                }
                VStack(spacing: 4) {
                    Text("\(viewModel.travelersCount)")
                        .font(.system(size: 52, weight: .bold))
                        .foregroundColor(.rixoOrange)
                    Text(viewModel.travelersCount == 1 ? "cestující" : viewModel.travelersCount < 5 ? "cestující" : "cestujících")
                        .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                }
                Button(action: { if viewModel.travelersCount < 9 { viewModel.updateTravelerCount(viewModel.travelersCount + 1) } }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 44))
                        .foregroundColor(viewModel.travelersCount < 9 ? .rixoOrange : .gray.opacity(0.3))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(24)
            .background(Color.rixoCard)
            .cornerRadius(16)
        }
    }

    private var step4Ages: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Věk cestujících", subtitle: "Zadejte věk každého cestujícího.")
            VStack(spacing: 10) {
                ForEach(0..<viewModel.travelersCount, id: \.self) { index in
                    HStack(spacing: 12) {
                        ZStack {
                            Circle().fill(Color.rixoOrange)
                                .frame(width: 32, height: 32)
                            Text("\(index + 1)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                        }
                        RixoTextField(
                            placeholder: "Věk (roky)",
                            text: Binding(
                                get: { index < viewModel.travelerAges.count ? viewModel.travelerAges[index] : "" },
                                set: { if index < viewModel.travelerAges.count { viewModel.travelerAges[index] = $0 } }
                            ),
                            keyboardType: .numberPad
                        )
                    }
                }
            }
        }
    }

    private var step5Addons: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Připojištění", subtitle: "Přidejte doplňkové krytí podle vašich potřeb.")
            VStack(spacing: 10) {
                ToggleRow(title: "Storno pojištění", icon: "xmark.circle.fill", isOn: $viewModel.hasStornoInsurance)
                ToggleRow(title: "Zimní sporty", icon: "snowflake", isOn: $viewModel.hasWinterSports)
                ToggleRow(title: "Rizikové sporty", icon: "figure.climbing", isOn: $viewModel.hasRiskyActivities)
                ToggleRow(title: "Asistence vozidla v zahraničí", icon: "car.fill", isOn: $viewModel.hasVehicleAssistance)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Pojištění zavazadel")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                HStack(spacing: 8) {
                    ForEach(0..<viewModel.luggageLevels.count, id: \.self) { i in
                        Button(action: { viewModel.luggageLevel = i }) {
                            Text(viewModel.luggageLevels[i])
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(viewModel.luggageLevel == i ? .white : .rixoOrange)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 8)
                                .background(viewModel.luggageLevel == i ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                                .cornerRadius(8)
                        }
                    }
                }
            }
            .padding(16)
            .background(Color.rixoCard)
            .cornerRadius(12)
        }
    }

    private var step6Contact: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Kontaktní údaje", subtitle: "Kam vám zaslat výsledky?")
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

#Preview { TravelInsuranceView() }
