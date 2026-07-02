import SwiftUI

struct RewardsView: View {
    @EnvironmentObject var rewardsService: RewardsService
    @StateObject private var viewModel: RewardsViewModel
    @State private var showWithdrawSheet = false
    @State private var showWithdrawSuccess = false

    init(rewardsService: RewardsService) {
        _viewModel = StateObject(wrappedValue: RewardsViewModel(rewardsService: rewardsService))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    balanceCard
                    howItWorksCard
                    rewardsListSection
                    ratesTableSection
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Odměny")
            .navigationBarTitleDisplayMode(.large)
            .refreshable { await viewModel.refresh() }
        }
        .sheet(isPresented: $showWithdrawSheet) {
            WithdrawSheet(
                amount: viewModel.totalBalance,
                onWithdraw: {
                    viewModel.withdraw()
                    showWithdrawSheet = false
                    showWithdrawSuccess = true
                }
            )
        }
        .alert("Výběr odměny", isPresented: $showWithdrawSuccess) {
            Button("OK") {}
        } message: {
            Text("Vaše odměna bude odeslána na váš bankovní účet do 3 pracovních dní.")
        }
    }

    private var balanceCard: some View {
        VStack(spacing: 0) {
            // Gradient background
            LinearGradient(
                colors: [Color.rixoOrange, Color(hex: "#C43E1A")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 200)
            .overlay(
                VStack(spacing: 16) {
                    VStack(spacing: 6) {
                        Text("Dostupný zůstatek")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.85))
                        Text(viewModel.totalBalance.czk)
                            .font(.system(size: 44, weight: .bold))
                            .foregroundColor(.white)
                    }

                    HStack(spacing: 20) {
                        VStack(spacing: 2) {
                            Text("Čekající")
                                .font(.system(size: 11)).foregroundColor(.white.opacity(0.7))
                            Text(viewModel.pendingBalance.czk)
                                .font(.system(size: 14, weight: .semibold)).foregroundColor(.white)
                        }
                        Rectangle().fill(Color.white.opacity(0.3)).frame(width: 1, height: 30)
                        VStack(spacing: 2) {
                            Text("Celkem odměn")
                                .font(.system(size: 11)).foregroundColor(.white.opacity(0.7))
                            Text("\(viewModel.rewards.count) smluv")
                                .font(.system(size: 14, weight: .semibold)).foregroundColor(.white)
                        }
                    }
                }
            )

            // Withdraw button
            Button(action: {
                if viewModel.canWithdraw { showWithdrawSheet = true }
            }) {
                HStack(spacing: 10) {
                    Image(systemName: "arrow.down.circle.fill")
                        .font(.system(size: 18))
                    Text(viewModel.canWithdraw ? "Vybrat odměnu" : "Min. 200 Kč pro výběr")
                        .font(.system(size: 15, weight: .semibold))
                }
                .foregroundColor(viewModel.canWithdraw ? .rixoOrange : .rixoTextSecondary)
                .frame(maxWidth: .infinity).frame(height: 52)
                .background(Color.white)
            }
        }
        .cornerRadius(20)
        .shadow(color: Color.rixoOrange.opacity(0.3), radius: 12, x: 0, y: 4)
    }

    private var howItWorksCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Image(systemName: "gift.fill").foregroundColor(.rixoOrange)
                Text("Jak fungují odměny?")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoTextPrimary)
            }

            VStack(alignment: .leading, spacing: 10) {
                HowItWorksStep(number: 1, text: "Sjednáte pojišťovnu přes RIXO")
                HowItWorksStep(number: 2, text: "Po 3 měsících platby pojistného obdržíte odměnu")
                HowItWorksStep(number: 3, text: "Odměnu vyberete na váš bankovní účet (min. 200 Kč)")
            }
        }
        .padding(16).rixoCard()
    }

    private var rewardsListSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Vaše odměny")
                .font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoTextPrimary)

            if viewModel.rewards.isEmpty {
                Text("Nemáte zatím žádné odměny. Sjednejte pojišťovnu přes RIXO!")
                    .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                    .padding(16).frame(maxWidth: .infinity)
                    .background(Color.rixoCard).cornerRadius(12)
            } else {
                ForEach(viewModel.rewards) { reward in
                    RewardCardView(reward: reward)
                }
            }
        }
    }

    private var ratesTableSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Sazby odměn")
                .font(.system(size: 16, weight: .semibold)).foregroundColor(.rixoTextPrimary)

            VStack(spacing: 0) {
                ForEach(RewardRate.rates.indices, id: \.self) { index in
                    HStack {
                        Text(RewardRate.rates[index].insuranceType)
                            .font(.system(size: 13)).foregroundColor(.rixoTextPrimary)
                        Spacer()
                        Text("\(String(format: "%.1f", RewardRate.rates[index].percentage)) %")
                            .font(.system(size: 13, weight: .semibold)).foregroundColor(.rixoOrange)
                        Text(RewardRate.rates[index].description)
                            .font(.system(size: 11)).foregroundColor(.rixoTextSecondary)
                    }
                    .padding(.vertical, 10).padding(.horizontal, 16)
                    if index < RewardRate.rates.count - 1 {
                        Divider().padding(.horizontal, 16)
                    }
                }
            }
            .background(Color.rixoCard).cornerRadius(14)
        }
    }
}

struct RewardCardView: View {
    let reward: Reward

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(reward.isAvailable ? Color.rixoSuccess.opacity(0.12) : Color.rixoOrange.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: reward.isAvailable ? "checkmark.circle.fill" : "clock.fill")
                        .foregroundColor(reward.isAvailable ? .rixoSuccess : .rixoOrange)
                        .font(.system(size: 20))
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(reward.contractName)
                        .font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                        .lineLimit(1)
                    Text(reward.insurerName)
                        .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(reward.amount.czk)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(reward.isAvailable ? .rixoSuccess : .rixoOrange)
                    Text("\(String(format: "%.1f", reward.percentage)) % odměna")
                        .font(.system(size: 11)).foregroundColor(.rixoTextSecondary)
                }
            }

            VStack(spacing: 6) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray.opacity(0.15)).frame(height: 6)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(reward.isAvailable ? Color.rixoSuccess : Color.rixoOrange)
                            .frame(width: geo.size.width * reward.progressValue, height: 6)
                    }
                }
                .frame(height: 6)

                HStack {
                    Text(reward.statusText)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(reward.isAvailable ? .rixoSuccess : .rixoOrange)
                    Spacer()
                    if !reward.isAvailable {
                        Text("Dostupné: \(reward.availableDate.czechFormatted)")
                            .font(.system(size: 11)).foregroundColor(.rixoTextSecondary)
                    }
                }
            }
        }
        .padding(14).rixoCard()
    }
}

struct HowItWorksStep: View {
    let number: Int
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(Color.rixoOrange).frame(width: 24, height: 24)
                Text("\(number)").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
            }
            Text(text).font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
        }
    }
}

struct WithdrawSheet: View {
    let amount: Double
    let onWithdraw: () -> Void
    @Environment(\.dismiss) var dismiss

    @State private var iban: String = ""
    @State private var bankName: String = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                VStack(spacing: 8) {
                    Image(systemName: "arrow.down.circle.fill")
                        .font(.system(size: 44)).foregroundColor(.rixoOrange)
                    Text("Výběr odměny")
                        .font(.system(size: 22, weight: .bold)).foregroundColor(.rixoTextPrimary)
                    Text("Odměna bude odeslána na váš bankovní účet.")
                        .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                        .multilineTextAlignment(.center)
                }

                HStack {
                    Text("Částka k výběru")
                        .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                    Spacer()
                    Text(amount.czk)
                        .font(.system(size: 20, weight: .bold)).foregroundColor(.rixoOrange)
                }
                .padding(14).background(Color.rixoOrange.opacity(0.06)).cornerRadius(12)

                RixoTextField(placeholder: "IBAN (CZ...)", text: $iban, icon: "building.columns.fill", autocapitalization: .characters)
                RixoTextField(placeholder: "Název banky", text: $bankName, icon: "building.2.fill")

                Spacer()

                RixoButton(title: "Potvrdit výběr \(amount.czk)", action: onWithdraw, isDisabled: iban.isEmpty)

                Button(action: { dismiss() }) {
                    Text("Zrušit")
                        .font(.system(size: 15)).foregroundColor(.rixoTextSecondary)
                }
            }
            .padding(.horizontal, 24).padding(.top, 24).padding(.bottom, 16)
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Výběr odměny")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Zavřít") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
    }
}

struct RewardDetailView: View {
    let reward: Reward
    var body: some View {
        Text(reward.contractName)
    }
}

#Preview {
    let rs = RewardsService()
    return RewardsView(rewardsService: rs)
        .environmentObject(rs)
}
