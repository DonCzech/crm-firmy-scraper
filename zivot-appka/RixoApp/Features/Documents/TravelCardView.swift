import SwiftUI

struct TravelCardView: View {
    let contract: Contract
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    travelCard.padding(.horizontal, 20)

                    VStack(spacing: 12) {
                        Button(action: {}) {
                            Label("Sdílet", systemImage: "square.and.arrow.up")
                                .font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.rixoOrange).cornerRadius(14)
                        }
                        Button(action: {}) {
                            Label("Uložit do Fotek", systemImage: "photo.on.rectangle.angled")
                                .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoOrange)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
                        }
                        Button(action: {}) {
                            Label("Přidat do Apple Wallet", systemImage: "wallet.pass.fill")
                                .font(.system(size: 15, weight: .semibold)).foregroundColor(.black)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.black.opacity(0.08)).cornerRadius(14)
                        }
                    }
                    .padding(.horizontal, 20)

                    InfoCard(
                        text: "V případě nouze volejte číslo na přední straně kartičky. Kartičku vždy noste s sebou při cestách do zahraničí.",
                        icon: "info.circle.fill",
                        color: Color(hex: "#007AFF")
                    )
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Kartička pojištěnce")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Hotovo") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
    }

    private var travelCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#0D47A1"), Color(hex: "#1565C0"), Color(hex: "#0A2E6E")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)

            // Card content
            VStack(spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("KARTIČKA POJIŠTĚNCE")
                            .font(.system(size: 11, weight: .bold)).foregroundColor(.white.opacity(0.85)).tracking(1)
                        Text("Zdravotní pojištění v zahraničí")
                            .font(.system(size: 9)).foregroundColor(.white.opacity(0.65))
                    }
                    Spacer()
                    Image(systemName: "cross.circle.fill")
                        .font(.system(size: 28)).foregroundColor(.white.opacity(0.8))
                }
                .padding(.horizontal, 20).padding(.top, 20)

                Spacer()

                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Pojišťovna").font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                            Text(contract.insurerName)
                                .font(.system(size: 14, weight: .bold)).foregroundColor(.white)
                        }
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Telefonní asistence").font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                            Text("+420 800 123 456")
                                .font(.system(size: 13, weight: .semibold)).foregroundColor(.yellow)
                        }
                    }
                    Spacer()
                    ZStack {
                        RoundedRectangle(cornerRadius: 6).fill(Color.white).frame(width: 60, height: 60)
                        Image(systemName: "qrcode").font(.system(size: 40)).foregroundColor(.black)
                    }
                }
                .padding(.horizontal, 20)

                Spacer()

                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Číslo smlouvy").font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                        Text(contract.policyNumber)
                            .font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundColor(.white)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Platnost do").font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                        Text(contract.endDate.czechFormatted)
                            .font(.system(size: 11, weight: .semibold)).foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 20).padding(.bottom, 16)
            }
        }
        .shadow(color: Color.black.opacity(0.15), radius: 12, x: 0, y: 4)
    }
}

struct DocumentsView: View {
    @EnvironmentObject var contractService: ContractService
    @State private var selectedContract: Contract? = nil
    @State private var showGreenCard = false
    @State private var showTravelCard = false

    var contractsWithDocs: [Contract] {
        contractService.contracts.filter { $0.hasGreenCard || $0.hasTravelCard }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if contractsWithDocs.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: "doc.text.fill")
                                .font(.system(size: 48)).foregroundColor(.rixoTextSecondary.opacity(0.3))
                            Text("Žádné doklady k zobrazení")
                                .font(.system(size: 16, weight: .medium)).foregroundColor(.rixoTextSecondary)
                            Text("Doklady se zobrazí po sjednání pojistné smlouvy přes RIXO.")
                                .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(40)
                    }

                    ForEach(contractsWithDocs) { contract in
                        VStack(spacing: 10) {
                            HStack {
                                ZStack {
                                    Circle().fill(contract.insurerColor).frame(width: 36, height: 36)
                                    Text(contract.insurerInitials)
                                        .font(.system(size: 11, weight: .bold)).foregroundColor(.white)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(contract.type.displayName)
                                        .font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                                    Text(contract.insurerName)
                                        .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                                }
                                Spacer()
                            }
                            .padding(.horizontal, 14).padding(.top, 14)

                            if contract.hasGreenCard {
                                Button(action: { selectedContract = contract; showGreenCard = true }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: "creditcard.fill").foregroundColor(.rixoSuccess)
                                        Text("Zelená karta").font(.system(size: 14, weight: .medium)).foregroundColor(.rixoTextPrimary)
                                        Spacer()
                                        Image(systemName: "chevron.right").foregroundColor(.rixoTextSecondary).font(.system(size: 12))
                                    }
                                    .padding(.horizontal, 14).padding(.vertical, 12)
                                    .background(Color.rixoSuccess.opacity(0.06)).cornerRadius(10)
                                    .padding(.horizontal, 14)
                                }
                            }

                            if contract.hasTravelCard {
                                Button(action: { selectedContract = contract; showTravelCard = true }) {
                                    HStack(spacing: 10) {
                                        Image(systemName: "person.text.rectangle.fill").foregroundColor(Color(hex: "#007AFF"))
                                        Text("Kartička pojištěnce").font(.system(size: 14, weight: .medium)).foregroundColor(.rixoTextPrimary)
                                        Spacer()
                                        Image(systemName: "chevron.right").foregroundColor(.rixoTextSecondary).font(.system(size: 12))
                                    }
                                    .padding(.horizontal, 14).padding(.vertical, 12)
                                    .background(Color(hex: "#007AFF").opacity(0.06)).cornerRadius(10)
                                    .padding(.horizontal, 14)
                                }
                            }

                            Spacer().frame(height: 6)
                        }
                        .rixoCard()
                    }
                }
                .padding(.horizontal, 20).padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Doklady")
            .navigationBarTitleDisplayMode(.large)
        }
        .sheet(isPresented: $showGreenCard) {
            if let contract = selectedContract {
                GreenCardView(contract: contract)
            }
        }
        .sheet(isPresented: $showTravelCard) {
            if let contract = selectedContract {
                TravelCardView(contract: contract)
            }
        }
    }
}

#Preview {
    TravelCardView(contract: Contract.sampleContracts[1])
}
