import SwiftUI

struct GreenCardView: View {
    let contract: Contract
    @Environment(\.dismiss) var dismiss
    @State private var showShareSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // The green card
                    greenCard
                        .padding(.horizontal, 20)

                    // Actions
                    VStack(spacing: 12) {
                        Button(action: { showShareSheet = true }) {
                            Label("Sdílet", systemImage: "square.and.arrow.up")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.rixoOrange).cornerRadius(14)
                        }

                        Button(action: {}) {
                            Label("Uložit do Fotek", systemImage: "photo.on.rectangle.angled")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.rixoOrange)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.rixoOrange.opacity(0.08)).cornerRadius(14)
                        }

                        Button(action: {}) {
                            Label("Přidat do Apple Wallet", systemImage: "wallet.pass.fill")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity).frame(height: 52)
                                .background(Color.black.opacity(0.08)).cornerRadius(14)
                        }
                    }
                    .padding(.horizontal, 20)

                    // Info
                    InfoCard(
                        text: "Zelená karta slouží jako doklad povinného ručení v zahraničí. Vždy ji mějte s sebou při jízdě.",
                        icon: "info.circle.fill",
                        color: .rixoSuccess
                    )
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Zelená karta")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Hotovo") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
    }

    private var greenCard: some View {
        ZStack {
            // Card background
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#2E7D32"), Color(hex: "#43A047"), Color(hex: "#1B5E20")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(height: 220)

            // Card content
            VStack(spacing: 0) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("ZELENÁ KARTA")
                            .font(.system(size: 13, weight: .bold, design: .monospaced))
                            .foregroundColor(.white.opacity(0.85))
                            .tracking(2)
                        Text("Doklad o povinném ručení")
                            .font(.system(size: 9))
                            .foregroundColor(.white.opacity(0.65))
                    }
                    Spacer()
                    Text("CZ")
                        .font(.system(size: 22, weight: .black))
                        .foregroundColor(.white)
                        .padding(8)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(6)
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)

                Spacer()

                // SPZ & Vehicle
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(contract.vehicleSPZ ?? "—")
                            .font(.system(size: 24, weight: .bold, design: .monospaced))
                            .foregroundColor(.white)
                        Text("\(contract.vehicleMake ?? "—") \(contract.vehicleModel ?? "—")")
                            .font(.system(size: 13))
                            .foregroundColor(.white.opacity(0.85))
                    }
                    Spacer()
                    // QR code placeholder
                    ZStack {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(Color.white)
                            .frame(width: 60, height: 60)
                        Image(systemName: "qrcode")
                            .font(.system(size: 40))
                            .foregroundColor(.black)
                    }
                }
                .padding(.horizontal, 20)

                Spacer()

                // Footer
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Platnost")
                            .font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                        Text("\(contract.startDate.czechFormatted) – \(contract.endDate.czechFormatted)")
                            .font(.system(size: 11, weight: .semibold)).foregroundColor(.white)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Číslo smlouvy")
                            .font(.system(size: 9)).foregroundColor(.white.opacity(0.6))
                        Text(contract.policyNumber)
                            .font(.system(size: 11, weight: .semibold, design: .monospaced)).foregroundColor(.white)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
        }
        .shadow(color: Color.black.opacity(0.15), radius: 12, x: 0, y: 4)
    }
}

#Preview {
    GreenCardView(contract: Contract.sampleContracts[0])
}
