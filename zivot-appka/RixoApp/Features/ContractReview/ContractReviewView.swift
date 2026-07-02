import SwiftUI
import PhotosUI

struct ContractReviewView: View {
    @StateObject private var viewModel = ContractReviewViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var showRixoIndex = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Tab selector
                    HStack(spacing: 0) {
                        ForEach(ContractReviewViewModel.ReviewTab.allCases, id: \.self) { tab in
                            Button(action: { viewModel.selectedTab = tab }) {
                                Text(tab.label)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(viewModel.selectedTab == tab ? .white : .rixoTextSecondary)
                                    .frame(maxWidth: .infinity).frame(height: 40)
                                    .background(viewModel.selectedTab == tab ? Color.rixoOrange : Color.clear)
                                    .cornerRadius(10)
                            }
                        }
                    }
                    .padding(4)
                    .background(Color.gray.opacity(0.1)).cornerRadius(12)

                    if viewModel.isProcessing {
                        processingView
                    } else if viewModel.reviewCompleted {
                        completedView
                    } else {
                        switch viewModel.selectedTab {
                        case .upload: uploadView
                        case .poa: poaView
                        }
                    }
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Kontrola smlouvy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
                }
            }
        }
        .sheet(isPresented: $showRixoIndex) {
            RixoIndexView(score: viewModel.rixoScore, contractName: "Kontrolovaná smlouva")
        }
    }

    private var uploadView: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Text("Nahrát pojistnou smlouvu")
                    .font(.system(size: 20, weight: .bold)).foregroundColor(.rixoTextPrimary)
                Text("Nahrajte fotografii nebo PDF soubor vaší pojistné smlouvy. Naše AI ji analyzuje a vypočítá RIXO Index.")
                    .font(.system(size: 14)).foregroundColor(.rixoTextSecondary).multilineTextAlignment(.center)
            }

            // Upload area
            if let image = viewModel.selectedImage {
                ZStack(alignment: .topTrailing) {
                    Image(uiImage: image)
                        .resizable().aspectRatio(contentMode: .fit)
                        .cornerRadius(12)
                    Button(action: { viewModel.selectedImage = nil }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24)).foregroundColor(.rixoDanger)
                            .background(Color.white.clipShape(Circle()))
                            .padding(8)
                    }
                }
            } else {
                uploadPlaceholder
            }

            // Action buttons
            HStack(spacing: 12) {
                PhotosPicker(selection: $viewModel.photoPickerItem, matching: .images) {
                    Label("Galerie", systemImage: "photo.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(maxWidth: .infinity).frame(height: 50)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(12)
                }

                Button(action: {}) {
                    Label("Kamera", systemImage: "camera.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(maxWidth: .infinity).frame(height: 50)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(12)
                }

                Button(action: {}) {
                    Label("Soubor", systemImage: "doc.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                        .frame(maxWidth: .infinity).frame(height: 50)
                        .background(Color.rixoOrange.opacity(0.08)).cornerRadius(12)
                }
            }

            RixoButton(
                title: "Analyzovat smlouvu",
                action: { Task { await viewModel.processDocument() } },
                isDisabled: viewModel.selectedImage == nil
            )

            InfoCard(text: "Vaše dokumenty jsou šifrovány a zpracovány bezpečně. Nikdy nesdílíme vaše data třetím stranám.")
        }
        .onChange(of: viewModel.photoPickerItem) { newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await MainActor.run { viewModel.selectedImage = image }
                }
            }
        }
    }

    private var uploadPlaceholder: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.badge.plus")
                .font(.system(size: 48)).foregroundColor(.rixoOrange.opacity(0.5))
            Text("Klikněte pro výběr dokumentu")
                .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
        }
        .frame(maxWidth: .infinity).frame(height: 180)
        .background(Color.rixoOrange.opacity(0.04))
        .cornerRadius(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.rixoOrange.opacity(0.2), lineWidth: 1.5, style: StrokeStyle(dash: [6, 4])))
    }

    private var poaView: some View {
        VStack(spacing: 20) {
            VStack(spacing: 8) {
                Text("Plná moc")
                    .font(.system(size: 20, weight: .bold)).foregroundColor(.rixoTextPrimary)
                Text("Udělte nám plnou moc a my zkontrolujeme vaše smlouvy přímo u pojišťovny.")
                    .font(.system(size: 14)).foregroundColor(.rixoTextSecondary).multilineTextAlignment(.center)
            }

            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    RixoTextField(placeholder: "Jméno", text: $viewModel.poaFirstName, icon: "person.fill", isRequired: true)
                    RixoTextField(placeholder: "Příjmení", text: $viewModel.poaLastName, isRequired: true)
                }
                DatePicker("Datum narození", selection: $viewModel.poaBirthDate, displayedComponents: .date)
                    .datePickerStyle(.compact)
                    .padding(14)
                    .background(Color.rixoCard).cornerRadius(12)
                    .environment(\.locale, Locale(identifier: "cs_CZ"))

                RixoTextField(placeholder: "Adresa trvalého bydliště", text: $viewModel.poaAddress, icon: "mappin.circle.fill", isRequired: true)
                RixoTextField(placeholder: "Telefon", text: $viewModel.poaPhone, keyboardType: .phonePad, icon: "phone.fill", isRequired: true)
                RixoTextField(placeholder: "E-mail", text: $viewModel.poaEmail, keyboardType: .emailAddress, icon: "envelope.fill", isRequired: true, autocapitalization: .never)
            }

            RixoButton(
                title: "Odeslat plnou moc",
                action: { Task { await viewModel.submitPOA() } },
                isDisabled: viewModel.poaFirstName.isEmpty || viewModel.poaLastName.isEmpty
            )

            InfoCard(text: "Plná moc je omezena pouze na nahlédnutí do smluvní dokumentace. RIXO nemůže v vaším jménem měnit ani rušit smlouvy.")
        }
    }

    private var processingView: some View {
        VStack(spacing: 24) {
            Image(systemName: "doc.badge.gearshape.fill")
                .font(.system(size: 52)).foregroundColor(.rixoOrange)

            Text(viewModel.processingMessage)
                .font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                .multilineTextAlignment(.center)

            ProgressView(value: viewModel.processingProgress)
                .tint(.rixoOrange)
                .animation(.easeInOut, value: viewModel.processingProgress)

            Text("\(Int(viewModel.processingProgress * 100)) %")
                .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
        }
        .padding(32).rixoCard()
    }

    private var completedView: some View {
        VStack(spacing: 20) {
            VStack(spacing: 12) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 52)).foregroundColor(.rixoSuccess)
                Text("Analýza dokončena!")
                    .font(.system(size: 20, weight: .bold)).foregroundColor(.rixoTextPrimary)
                Text("Vaše smlouva byla úspěšně analyzována.")
                    .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
            }

            // Score preview
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("RIXO Index").font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    Text(scoreLabel)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(scoreColor)
                }
                Spacer()
                ZStack {
                    Circle().fill(scoreColor.opacity(0.12)).frame(width: 64, height: 64)
                    VStack(spacing: 0) {
                        Text(String(format: "%.1f", viewModel.rixoScore))
                            .font(.system(size: 22, weight: .bold)).foregroundColor(scoreColor)
                        Text("/10").font(.system(size: 10)).foregroundColor(.rixoTextSecondary)
                    }
                }
            }
            .padding(16).rixoCard()

            RixoButton(title: "Zobrazit detailní analýzu", action: { showRixoIndex = true })

            Button(action: {
                viewModel.reviewCompleted = false
                viewModel.selectedImage = nil
            }) {
                Text("Analyzovat další smlouvu")
                    .font(.system(size: 15)).foregroundColor(.rixoOrange)
            }
        }
    }

    private var scoreLabel: String {
        if viewModel.rixoScore >= 8.0 { return "Výborná smlouva" }
        else if viewModel.rixoScore >= 6.0 { return "Průměrná smlouva" }
        else { return "Podprůměrná smlouva" }
    }

    private var scoreColor: Color {
        if viewModel.rixoScore >= 8.0 { return .rixoSuccess }
        else if viewModel.rixoScore >= 6.0 { return .rixoWarning }
        else { return .rixoDanger }
    }
}

#Preview { ContractReviewView() }
