import SwiftUI

struct ContractCancellationView: View {
    @StateObject private var viewModel = ContractCancellationViewModel()
    @Environment(\.dismiss) var dismiss
    var preselectedType: InsuranceType?

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
                    VStack(spacing: 20) {
                        if viewModel.generationSuccess {
                            successView
                        } else {
                            stepContent
                        }
                    }
                    .padding(.horizontal, 20).padding(.vertical, 20)
                }

                if !viewModel.generationSuccess {
                    navigationButtons
                }
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Výpověď smlouvy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .onAppear {
            if let type = preselectedType { viewModel.selectedInsuranceType = type }
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1InsuranceType
        case 2: step2Reason
        case 3: step3PersonalData
        case 4: step4Signature
        case 5: step5Preview
        default: EmptyView()
        }
    }

    private var step1InsuranceType: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ pojistné smlouvy", subtitle: "Vyberte druh pojištění, které chcete vypovědět.")
            VStack(spacing: 8) {
                ForEach([InsuranceType.povinneRuceni, .havarijski, .zivotni, .domacnost, .nemovitost, .cestovni], id: \.self) { type in
                    TypeOptionCard(
                        title: type.displayName,
                        subtitle: "",
                        icon: type.iconName,
                        isSelected: viewModel.selectedInsuranceType == type,
                        color: type.color
                    ) { viewModel.selectedInsuranceType = type }
                }
            }
        }
    }

    private var step2Reason: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Důvod výpovědi", subtitle: "Vyberte důvod ukončení pojistné smlouvy.")
            VStack(spacing: 8) {
                ForEach(viewModel.reasons, id: \.self) { reason in
                    SelectionRow(title: reason, isSelected: viewModel.selectedReason == reason) {
                        viewModel.selectedReason = reason
                    }
                }
            }
        }
    }

    private var step3PersonalData: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Osobní údaje", subtitle: "Vyplňte údaje pro výpověď pojistné smlouvy.")
            VStack(spacing: 12) {
                RixoTextField(placeholder: "Číslo pojistné smlouvy", text: $viewModel.contractNumber, icon: "number", isRequired: true)
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Jméno", text: $viewModel.firstName, icon: "person.fill", isRequired: true)
                    RixoTextField(placeholder: "Příjmení", text: $viewModel.lastName, isRequired: true)
                }
                DatePicker("Datum narození", selection: $viewModel.birthDate, displayedComponents: .date)
                    .datePickerStyle(.compact)
                    .padding(14).background(Color.rixoCard).cornerRadius(12)
                    .environment(\.locale, Locale(identifier: "cs_CZ"))
                RixoTextField(placeholder: "Adresa trvalého bydliště", text: $viewModel.address, icon: "mappin.circle.fill", isRequired: true)
            }
        }
    }

    private var step4Signature: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Váš podpis", subtitle: "Podepište výpověď pojistné smlouvy prstem.")
            SignaturePadView(paths: $viewModel.signaturePaths)
            InfoCard(text: "Váš digitální podpis bude součástí vygenerovaného PDF dokumentu.")
        }
    }

    private var step5Preview: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Náhled výpovědi", subtitle: "Zkontrolujte před stažením.")

            // PDF preview mockup
            VStack(spacing: 0) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("VÝPOVĚĎ POJISTNÉ SMLOUVY")
                            .font(.system(size: 14, weight: .bold))
                        Text("dle § 22 zákona č. 89/2012 Sb.")
                            .font(.system(size: 10)).foregroundColor(.rixoTextSecondary)
                    }
                    Spacer()
                    Image(systemName: "doc.text.fill")
                        .font(.system(size: 28)).foregroundColor(.rixoOrange)
                }
                .padding(16)

                Divider()

                VStack(alignment: .leading, spacing: 8) {
                    PreviewRow(label: "Pojistník:", value: "\(viewModel.firstName) \(viewModel.lastName)")
                    PreviewRow(label: "Číslo smlouvy:", value: viewModel.contractNumber)
                    PreviewRow(label: "Typ pojištění:", value: viewModel.selectedInsuranceType.displayName)
                    PreviewRow(label: "Důvod výpovědi:", value: viewModel.selectedReason)
                    PreviewRow(label: "Datum výpovědi:", value: Date().czechFormatted)
                    PreviewRow(label: "Účinnost od:", value: viewModel.cancellationDateText)
                }
                .padding(16)

                Divider()

                HStack {
                    Text("Podpis pojistníka:")
                        .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    Spacer()
                    if !viewModel.signaturePaths.isEmpty {
                        ZStack {
                            Rectangle().fill(Color.clear).frame(width: 120, height: 40)
                            ForEach(0..<viewModel.signaturePaths.count, id: \.self) { i in
                                viewModel.signaturePaths[i]
                                    .stroke(Color.rixoNavy, style: StrokeStyle(lineWidth: 1.5, lineCap: .round))
                            }
                        }
                        .clipped()
                    }
                }
                .padding(16)
            }
            .background(Color.white).cornerRadius(12)
            .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)

            Button(action: { viewModel.nextStep() }) {
                Label("Stáhnout PDF", systemImage: "arrow.down.doc.fill")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                    .frame(maxWidth: .infinity).frame(height: 52)
                    .background(Color.rixoOrange).cornerRadius(14)
            }
        }
    }

    private var successView: some View {
        VStack(spacing: 24) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64)).foregroundColor(.rixoSuccess)

            VStack(spacing: 8) {
                Text("Výpověď vygenerována!")
                    .font(.system(size: 22, weight: .bold)).foregroundColor(.rixoTextPrimary)
                Text("Vaše výpověď pojistné smlouvy byla úspěšně vygenerována a připravena ke stažení.")
                    .font(.system(size: 14)).foregroundColor(.rixoTextSecondary).multilineTextAlignment(.center)
            }

            Button(action: {}) {
                Label("Stáhnout PDF", systemImage: "arrow.down.doc.fill")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                    .frame(maxWidth: .infinity).frame(height: 52)
                    .background(Color.rixoOrange).cornerRadius(14)
            }

            Button(action: {}) {
                Label("Odeslat e-mailem", systemImage: "envelope.fill")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoOrange)
                    .frame(maxWidth: .infinity).frame(height: 52)
                    .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
            }

            Button(action: { dismiss() }) {
                Text("Hotovo")
                    .font(.system(size: 15)).foregroundColor(.rixoTextSecondary)
            }
        }
        .padding(.top, 32)
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
            if viewModel.currentStep < viewModel.totalSteps {
                Button(action: viewModel.nextStep) {
                    HStack(spacing: 8) {
                        Text("Pokračovat").font(.system(size: 16, weight: .semibold))
                        Image(systemName: "chevron.right")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity).frame(height: 52)
                    .background(viewModel.canProceed ? Color.rixoOrange : Color.gray.opacity(0.4))
                    .cornerRadius(14)
                }
                .disabled(!viewModel.canProceed)
            }
        }
        .padding(.horizontal, 20).padding(.vertical, 16)
        .background(Color.rixoCard)
    }
}

struct PreviewRow: View {
    let label: String
    let value: String
    var body: some View {
        HStack(alignment: .top) {
            Text(label).font(.system(size: 12)).foregroundColor(.rixoTextSecondary).frame(width: 130, alignment: .leading)
            Text(value).font(.system(size: 12, weight: .medium)).foregroundColor(.rixoTextPrimary)
            Spacer()
        }
    }
}

#Preview { ContractCancellationView() }
