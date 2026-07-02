import SwiftUI

struct ContractCardView: View {
    let contract: Contract
    var onTap: (() -> Void)? = nil
    var onGreenCard: (() -> Void)? = nil
    var onTravelCard: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 0) {
            Button(action: { onTap?() }) {
                HStack(spacing: 14) {
                    // Insurer logo circle
                    ZStack {
                        Circle()
                            .fill(contract.insurerColor)
                            .frame(width: 48, height: 48)
                        Text(contract.insurerInitials)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(contract.type.displayName)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.rixoTextPrimary)
                            Spacer()
                            RixoIndexBadge(score: contract.rixoIndex)
                        }

                        Text(contract.insurerName)
                            .font(.system(size: 13))
                            .foregroundColor(.rixoTextSecondary)

                        HStack(spacing: 12) {
                            Label(contract.monthlyPremium.czk + "/měs.", systemImage: "creditcard")
                                .font(.system(size: 12))
                                .foregroundColor(.rixoTextSecondary)

                            Label("Do: " + contract.endDate.czechFormatted, systemImage: "calendar")
                                .font(.system(size: 12))
                                .foregroundColor(contract.status == .expiring ? .rixoWarning : .rixoTextSecondary)
                        }
                    }
                }
                .padding(16)
            }
            .buttonStyle(PlainButtonStyle())

            if contract.hasGreenCard || contract.hasTravelCard {
                Divider().padding(.horizontal, 16)
                HStack(spacing: 12) {
                    if contract.hasGreenCard {
                        Button(action: { onGreenCard?() }) {
                            Label("Zelená karta", systemImage: "creditcard.fill")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.rixoSuccess)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 7)
                                .background(Color.rixoSuccess.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    if contract.hasTravelCard {
                        Button(action: { onTravelCard?() }) {
                            Label("Kartička pojišt.", systemImage: "person.text.rectangle.fill")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(Color(hex: "#007AFF"))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 7)
                                .background(Color(hex: "#007AFF").opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
        .rixoCard()
    }
}

struct RixoIndexBadge: View {
    let score: Double
    var showLabel: Bool = true

    var body: some View {
        HStack(spacing: 4) {
            Text(String(format: "%.1f", score))
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.white)
            if showLabel {
                Text("RIXO")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.white.opacity(0.85))
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(indexColor)
        .cornerRadius(8)
    }

    private var indexColor: Color {
        if score >= 8.0 { return .rixoSuccess }
        else if score >= 6.0 { return .rixoWarning }
        else { return .rixoDanger }
    }
}

struct ContractStatusBadge: View {
    let status: ContractStatus

    var body: some View {
        Text(status.displayName)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(status.color)
            .cornerRadius(6)
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 12) {
            ForEach(Contract.sampleContracts) { contract in
                ContractCardView(contract: contract)
            }
        }
        .padding()
    }
    .background(Color.rixoBackground)
}
