import SwiftUI

struct ResultsView: View {
    let insuranceType: InsuranceType
    @StateObject private var viewModel = ResultsViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var showSortSheet = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    SearchLoadingView()
                } else {
                    resultsList
                }
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Výsledky srovnání")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark").foregroundColor(.rixoTextSecondary)
                    }
                }
                if !viewModel.isLoading {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button(action: { showSortSheet = true }) {
                            Label("Seřadit", systemImage: "arrow.up.arrow.down")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.rixoOrange)
                        }
                    }
                }
            }
        }
        .onAppear { viewModel.load(for: insuranceType) }
        .confirmationDialog("Seřadit nabídky", isPresented: $showSortSheet, titleVisibility: .visible) {
            ForEach(ResultsViewModel.SortOption.allCases, id: \.self) { option in
                Button(option.rawValue) { viewModel.sortOption = option }
            }
        }
    }

    private var resultsList: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Summary bar
                summaryBar

                // Recommended
                if !viewModel.recommendedQuotes.isEmpty {
                    resultsSection(title: "Doporučené", icon: "star.fill", color: .rixoWarning, quotes: viewModel.recommendedQuotes)
                }

                // Cheapest
                if !viewModel.cheapestQuotes.isEmpty {
                    resultsSection(title: "Nejlevnější", icon: "tag.fill", color: .rixoSuccess, quotes: viewModel.cheapestQuotes)
                }

                // Others
                if !viewModel.otherQuotes.isEmpty {
                    resultsSection(title: "Ostatní nabídky", icon: "list.bullet", color: .rixoTextSecondary, quotes: viewModel.otherQuotes)
                }

                infoFooter
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
    }

    private var summaryBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text("Nalezeno \(viewModel.quotes.count) nabídek")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                Text("pro \(insuranceType.displayName)")
                    .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
            }
            Spacer()
            HStack(spacing: 4) {
                Image(systemName: "arrow.up.arrow.down")
                    .font(.system(size: 12))
                Text(viewModel.sortOption.rawValue)
                    .font(.system(size: 13, weight: .medium))
            }
            .foregroundColor(.rixoOrange)
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(Color.rixoOrange.opacity(0.08)).cornerRadius(10)
            .onTapGesture { showSortSheet = true }
        }
        .padding(14)
        .background(Color.rixoCard).cornerRadius(12)
    }

    private func resultsSection(title: String, icon: String, color: Color, quotes: [Quote]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: icon).foregroundColor(color).font(.system(size: 14, weight: .semibold))
                Text(title).font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                Text("(\(quotes.count))").font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
            }
            ForEach(quotes) { quote in
                QuoteCardView(quote: quote)
            }
        }
    }

    private var infoFooter: some View {
        VStack(spacing: 8) {
            Image(systemName: "info.circle")
                .font(.system(size: 20)).foregroundColor(.rixoTextSecondary)
            Text("Ceny jsou orientační a mohou se lišit dle individuálního rizikového profilu. Finální cena bude sdělena pojistným specialistou.")
                .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(16)
        .background(Color.rixoCard).cornerRadius(12)
        .padding(.bottom, 16)
    }
}

struct QuoteDetailView: View {
    let quote: Quote
    @Environment(\.dismiss) var dismiss
    @State private var showConfirmation = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Header
                    HStack(spacing: 16) {
                        ZStack {
                            Circle().fill(quote.insurerColor).frame(width: 64, height: 64)
                            Text(quote.insurerInitials)
                                .font(.system(size: 20, weight: .bold)).foregroundColor(.white)
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text(quote.insurerName)
                                .font(.system(size: 18, weight: .bold)).foregroundColor(.rixoTextPrimary)
                            HStack {
                                Text(quote.monthlyPrice.czk + " / měs.")
                                    .font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoOrange)
                                RixoIndexBadge(score: quote.rixoScore)
                            }
                            Text("Ročně: \(quote.annualPrice.czk)")
                                .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                        }
                        Spacer()
                    }
                    .padding(16).rixoCard()

                    // Coverage details
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Detaily krytí")
                            .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                        Divider()
                        ForEach(quote.coverageDetails) { detail in
                            HStack {
                                Image(systemName: detail.included ? "checkmark.circle.fill" : "xmark.circle.fill")
                                    .foregroundColor(detail.included ? .rixoSuccess : .gray)
                                    .font(.system(size: 16))
                                Text(detail.title).font(.system(size: 14)).foregroundColor(.rixoTextPrimary)
                                Spacer()
                                Text(detail.value)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(detail.included ? .rixoTextPrimary : .gray)
                            }
                        }
                    }
                    .padding(16).rixoCard()

                    RixoButton(title: "Mám zájem – Kontaktovat mě", action: { showConfirmation = true })
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Detail nabídky")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Zavřít") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
        .alert("Zájem zaznamenán!", isPresented: $showConfirmation) {
            Button("OK") { dismiss() }
        } message: {
            Text("Specialista \(quote.insurerName) vás kontaktuje do 10 minut.")
        }
    }
}

#Preview {
    ResultsView(insuranceType: .povinneRuceni)
}
