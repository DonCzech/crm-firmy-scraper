import SwiftUI

struct PropertyInsuranceView: View {
    @StateObject private var viewModel = PropertyInsuranceViewModel()
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
            .navigationTitle("Pojištění nemovitosti")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $viewModel.showResults) {
            ResultsView(insuranceType: .domacnost)
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch viewModel.currentStep {
        case 1: step1WhatToInsure
        case 2: step2Address
        case 3: step3Construction
        case 4: step4Roof
        case 5: step5Basement
        case 6: step6Size
        case 7: step7Value
        case 8: step8Ownership
        case 9: step9Contact
        default: EmptyView()
        }
    }

    private var step1WhatToInsure: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Co chcete pojistit?", subtitle: "Vyberte jeden nebo více typů pojistné ochrany.")
            VStack(spacing: 10) {
                CheckboxRow(title: "Dům / chata", subtitle: "Rodinný dům nebo rekreační objekt", icon: "house.fill", isOn: $viewModel.insureDom)
                CheckboxRow(title: "Bytová jednotka", subtitle: "Byt v bytovém domě", icon: "building.2.fill", isOn: $viewModel.insureBytovaJednotka)
                CheckboxRow(title: "Vybavení domácnosti", subtitle: "Nábytek, elektronika, osobní věci", icon: "sofa.fill", isOn: $viewModel.insureVybaveni)
                CheckboxRow(title: "Samotný objekt", subtitle: "Stavba bez vybavení", icon: "building.columns.fill", isOn: $viewModel.insureSamotnyObjekt)
            }
        }
    }

    private var step2Address: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Adresa nemovitosti", subtitle: "Kde se nachází pojišťovaná nemovitost?")
            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Ulice", text: $viewModel.street, icon: "mappin.circle.fill", isRequired: true)
                    RixoTextField(placeholder: "Č.P.", text: $viewModel.houseNumber, keyboardType: .numberPad, isRequired: true)
                }
                RixoTextField(placeholder: "Město", text: $viewModel.city, icon: "building.2", isRequired: true)
                RixoTextField(placeholder: "PSČ", text: $viewModel.postalCode, keyboardType: .numberPad, icon: "number", isRequired: true)
            }
        }
    }

    private var step3Construction: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Konstrukční materiál", subtitle: "Z čeho je hlavní konstrukce objektu?")
            VStack(spacing: 8) {
                ForEach(viewModel.constructionMaterials, id: \.self) { material in
                    SelectionRow(title: material, isSelected: viewModel.constructionMaterial == material) {
                        viewModel.constructionMaterial = material
                    }
                }
            }
        }
    }

    private var step4Roof: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ střechy", subtitle: "Jaký typ střechy má pojišťovaný objekt?")
            VStack(spacing: 8) {
                ForEach(viewModel.roofTypes, id: \.self) { type in
                    SelectionRow(title: type, isSelected: viewModel.roofType == type) {
                        viewModel.roofType = type
                    }
                }
            }
        }
    }

    private var step5Basement: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Suterén / sklep", subtitle: "Má objekt podsklepení nebo sklep?")
            VStack(spacing: 10) {
                SelectionRow(title: "Ano, objekt má sklep/suterén", isSelected: viewModel.hasBasement) {
                    viewModel.hasBasement = true
                }
                SelectionRow(title: "Ne, bez sklepa", isSelected: !viewModel.hasBasement) {
                    viewModel.hasBasement = false
                }
            }
        }
    }

    private var step6Size: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Plocha nemovitosti", subtitle: "Celková podlahová plocha v m².")
            RixoTextField(placeholder: "Plocha v m²", text: $viewModel.houseSizeM2, keyboardType: .numberPad, icon: "square.fill", isRequired: true)
        }
    }

    private var step7Value: some View {
        VStack(spacing: 24) {
            StepTitleView(title: "Odhadovaná hodnota domácnosti", subtitle: "Odhadněte celkovou hodnotu vybavení a věcí v domácnosti.")
            VStack(spacing: 16) {
                Text(viewModel.householdValue.czk)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.rixoOrange)
                Slider(value: $viewModel.householdValue, in: 100_000...5_000_000, step: 50_000)
                    .tint(.rixoOrange)
                HStack {
                    Text("100 000 Kč").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    Spacer()
                    Text("5 000 000 Kč").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                }
            }
            .padding(20).background(Color.rixoCard).cornerRadius(16)

            // Quick presets
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                ForEach([300_000, 500_000, 1_000_000, 2_000_000] as [Double], id: \.self) { value in
                    Button(action: { viewModel.householdValue = value }) {
                        Text(value.czk)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(viewModel.householdValue == value ? .white : .rixoOrange)
                            .frame(maxWidth: .infinity).frame(height: 40)
                            .background(viewModel.householdValue == value ? Color.rixoOrange : Color.rixoOrange.opacity(0.08))
                            .cornerRadius(10)
                    }
                }
            }
        }
    }

    private var step8Ownership: some View {
        VStack(spacing: 20) {
            StepTitleView(title: "Typ vlastnictví", subtitle: "Jste vlastníkem nebo nájemcem nemovitosti?")
            VStack(spacing: 8) {
                ForEach(viewModel.ownershipOptions, id: \.self) { option in
                    SelectionRow(title: option, isSelected: viewModel.ownership == option) {
                        viewModel.ownership = option
                    }
                }
            }
            InfoCard(text: "Nájemci potřebují pojistit pouze vybavení. Vlastníci mohou pojistit i stavbu.")
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
                    Image(systemName: "chevron.left").font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(width: 52, height: 52)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
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

struct CheckboxRow: View {
    let title: String
    let subtitle: String
    let icon: String
    @Binding var isOn: Bool

    var body: some View {
        Button(action: { isOn.toggle() }) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(isOn ? Color.rixoOrange.opacity(0.12) : Color.gray.opacity(0.08))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .foregroundColor(isOn ? .rixoOrange : .rixoTextSecondary)
                        .font(.system(size: 18))
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                    Text(subtitle).font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                }
                Spacer()
                Image(systemName: isOn ? "checkmark.square.fill" : "square")
                    .foregroundColor(isOn ? .rixoOrange : Color.gray.opacity(0.4))
                    .font(.system(size: 22))
                    .animation(.easeInOut(duration: 0.15), value: isOn)
            }
            .padding(14)
            .background(Color.rixoCard)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(isOn ? Color.rixoOrange : Color.clear, lineWidth: 2))
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview { PropertyInsuranceView() }
