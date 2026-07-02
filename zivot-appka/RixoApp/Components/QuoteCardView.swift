import SwiftUI

struct QuoteCardView: View {
    let quote: Quote
    @State private var isExpanded: Bool = false
    var onInterest: (() -> Void)? = nil
    @State private var showConfirmation: Bool = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(quote.insurerColor)
                        .frame(width: 48, height: 48)
                    Text(quote.insurerInitials)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 3) {
                    HStack {
                        Text(quote.insurerName)
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.rixoTextPrimary)
                        Spacer()
                        if quote.isRecommended {
                            Label("Doporučujeme", systemImage: "star.fill")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(Color(hex: "#FF9500"))
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(Color(hex: "#FF9500").opacity(0.12))
                                .cornerRadius(6)
                        } else if quote.isCheapest {
                            Label("Nejlevnější", systemImage: "tag.fill")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.rixoSuccess)
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(Color.rixoSuccess.opacity(0.12))
                                .cornerRadius(6)
                        }
                    }

                    HStack(alignment: .bottom, spacing: 4) {
                        Text(quote.monthlyPrice.czk)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.rixoOrange)
                        Text("/měs.")
                            .font(.system(size: 13))
                            .foregroundColor(.rixoTextSecondary)
                            .padding(.bottom, 2)
                        Spacer()
                        RixoIndexBadge(score: quote.rixoScore)
                    }

                    Text("Ročně: \(quote.annualPrice.czk)")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }
            }
            .padding(16)

            Divider().padding(.horizontal, 16)

            // Coverage points
            VStack(alignment: .leading, spacing: 8) {
                ForEach(quote.coveragePoints, id: \.self) { point in
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.rixoSuccess)
                            .font(.system(size: 14))
                        Text(point)
                            .font(.system(size: 13))
                            .foregroundColor(.rixoTextPrimary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            // Expandable details
            if isExpanded {
                Divider().padding(.horizontal, 16)

                VStack(spacing: 10) {
                    Text("Detaily krytí")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.rixoTextSecondary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    ForEach(quote.coverageDetails) { detail in
                        HStack {
                            Image(systemName: detail.included ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .foregroundColor(detail.included ? .rixoSuccess : .rixoTextSecondary.opacity(0.5))
                                .font(.system(size: 14))
                            Text(detail.title)
                                .font(.system(size: 13))
                                .foregroundColor(.rixoTextPrimary)
                            Spacer()
                            Text(detail.value)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(detail.included ? .rixoTextPrimary : .rixoTextSecondary)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }

            Divider().padding(.horizontal, 16)

            // Actions
            HStack(spacing: 12) {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isExpanded.toggle()
                    }
                }) {
                    HStack(spacing: 6) {
                        Text(isExpanded ? "Skrýt" : "Více info")
                            .font(.system(size: 14, weight: .medium))
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                            .font(.system(size: 11, weight: .semibold))
                    }
                    .foregroundColor(.rixoTextSecondary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 42)
                    .background(Color.gray.opacity(0.07))
                    .cornerRadius(10)
                }

                Button(action: {
                    showConfirmation = true
                    onInterest?()
                }) {
                    Text("Mám zájem")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 42)
                        .background(Color.rixoOrange)
                        .cornerRadius(10)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .rixoCard()
        .alert("Zájem zaznamenán", isPresented: $showConfirmation) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Specialista vás kontaktuje do 10 minut.")
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 12) {
            ForEach(Quote.sampleVehicleQuotes().prefix(2)) { quote in
                QuoteCardView(quote: quote)
            }
        }
        .padding()
    }
    .background(Color.rixoBackground)
}
