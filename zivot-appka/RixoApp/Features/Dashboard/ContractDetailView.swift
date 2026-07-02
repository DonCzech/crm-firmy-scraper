import SwiftUI

struct ContractDetailView: View {
    let contract: Contract
    @State private var showGreenCard: Bool = false
    @State private var showTravelCard: Bool = false
    @State private var showRixoIndex: Bool = false
    @State private var showCancellation: Bool = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Hero card
                heroCard

                // RIXO Index
                rixoIndexCard

                // Contract details
                detailsCard

                // Coverage info
                coverageCard

                // Actions
                actionsSection
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(Color.rixoBackground.ignoresSafeArea())
        .navigationTitle(contract.type.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showGreenCard) {
            GreenCardView(contract: contract)
        }
        .sheet(isPresented: $showTravelCard) {
            TravelCardView(contract: contract)
        }
        .sheet(isPresented: $showRixoIndex) {
            RixoIndexView(score: contract.rixoIndex, contractName: contract.type.displayName)
        }
        .sheet(isPresented: $showCancellation) {
            ContractCancellationView(preselectedType: contract.type)
        }
    }

    private var heroCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(contract.insurerColor)
                    .frame(width: 64, height: 64)
                Text(contract.insurerInitials)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(contract.insurerName)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.rixoTextPrimary)
                Text(contract.policyNumber)
                    .font(.system(size: 13))
                    .foregroundColor(.rixoTextSecondary)
                ContractStatusBadge(status: contract.status)
            }

            Spacer()
        }
        .padding(20)
        .rixoCard()
    }

    private var rixoIndexCard: some View {
        Button(action: { showRixoIndex = true }) {
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("RIXO Index")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.rixoTextSecondary)
                    Text(contract.rixoIndexLabel)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(contract.rixoIndexColor)
                    Text("Klikněte pro analýzu smlouvy →")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }

                Spacer()

                ZStack {
                    Circle()
                        .fill(contract.rixoIndexColor.opacity(0.12))
                        .frame(width: 64, height: 64)
                    VStack(spacing: 0) {
                        Text(String(format: "%.1f", contract.rixoIndex))
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(contract.rixoIndexColor)
                        Text("/10")
                            .font(.system(size: 10))
                            .foregroundColor(.rixoTextSecondary)
                    }
                }
            }
            .padding(16)
            .rixoCard()
        }
        .buttonStyle(PlainButtonStyle())
    }

    private var detailsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Detaily smlouvy")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.rixoTextPrimary)

            Divider()

            DetailRow(label: "Typ pojištění", value: contract.type.displayName)
            DetailRow(label: "Číslo smlouvy", value: contract.policyNumber)
            DetailRow(label: "Platnost od", value: contract.startDate.czechFormatted)
            DetailRow(label: "Platnost do", value: contract.endDate.czechFormatted)
            DetailRow(label: "Roční pojistné", value: contract.annualPremium.czk)
            DetailRow(label: "Měsíční platba", value: contract.monthlyPremium.czk)

            if let spz = contract.vehicleSPZ {
                DetailRow(label: "SPZ vozidla", value: spz)
            }
            if let make = contract.vehicleMake, let model = contract.vehicleModel {
                DetailRow(label: "Vozidlo", value: "\(make) \(model)")
            }
        }
        .padding(16)
        .rixoCard()
    }

    private var coverageCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Pojistné krytí")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.rixoTextPrimary)

            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Celkový limit")
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                    Text(contract.coverageLimit.czk)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.rixoOrange)
                }
                Spacer()
                Image(systemName: "shield.checkered")
                    .font(.system(size: 32))
                    .foregroundColor(.rixoOrange.opacity(0.4))
            }
        }
        .padding(16)
        .rixoCard()
    }

    private var actionsSection: some View {
        VStack(spacing: 12) {
            if contract.hasGreenCard {
                ActionButton(
                    title: "Zelená karta",
                    subtitle: "Zobrazit digitální doklad",
                    icon: "creditcard.fill",
                    color: .rixoSuccess
                ) { showGreenCard = true }
            }

            if contract.hasTravelCard {
                ActionButton(
                    title: "Kartička pojištěnce",
                    subtitle: "Zobrazit digitální kartičku",
                    icon: "person.text.rectangle.fill",
                    color: Color(hex: "#007AFF")
                ) { showTravelCard = true }
            }

            ActionButton(
                title: "Kontrola smlouvy",
                subtitle: "Analyzovat pomocí RIXO Index",
                icon: "magnifyingglass",
                color: .rixoOrange
            ) { showRixoIndex = true }

            ActionButton(
                title: "Vypovědět smlouvu",
                subtitle: "Generovat výpověď pojistné smlouvy",
                icon: "xmark.circle.fill",
                color: .rixoDanger
            ) { showCancellation = true }
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.rixoTextSecondary)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.rixoTextPrimary)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct ActionButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(color.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 18))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.rixoTextPrimary)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(.rixoTextSecondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.rixoTextSecondary)
            }
            .padding(14)
            .rixoCard()
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    NavigationStack {
        ContractDetailView(contract: Contract.sampleContracts[0])
    }
}
