import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var contractService: ContractService
    @EnvironmentObject var deadlineService: DeadlineService
    @StateObject private var viewModel: DashboardViewModel
    @State private var selectedContract: Contract? = nil
    @State private var showGreenCard: Bool = false
    @State private var showTravelCard: Bool = false
    @State private var selectedContractForDoc: Contract? = nil
    @State private var showDeadlineMonitor: Bool = false
    @State private var showAddContract: Bool = false

    init(contractService: ContractService, deadlineService: DeadlineService) {
        _viewModel = StateObject(wrappedValue: DashboardViewModel(contractService: contractService, deadlineService: deadlineService))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 16) {
                    // Greeting header
                    headerSection

                    // Summary cards
                    summaryCards

                    // Urgent deadlines
                    if !viewModel.urgentDeadlines.isEmpty {
                        deadlineAlertsSection
                    }

                    // Upcoming payments
                    if !viewModel.upcomingPayments.isEmpty {
                        upcomingPaymentsSection
                    }

                    // Contracts list
                    contractsSection
                }
                .padding(.bottom, 24)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Moje pojištění")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showDeadlineMonitor = true }) {
                        Image(systemName: "bell.badge.fill")
                            .foregroundColor(viewModel.urgentDeadlines.isEmpty ? .rixoTextSecondary : .rixoOrange)
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .navigationDestination(item: $selectedContract) { contract in
                ContractDetailView(contract: contract)
            }
            .sheet(isPresented: $showDeadlineMonitor) {
                DeadlineMonitorView()
            }
        }
    }

    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Dobrý den,")
                    .font(.system(size: 14))
                    .foregroundColor(.rixoTextSecondary)
                Text(authService.currentUser?.firstName ?? "Uživateli")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.rixoTextPrimary)
            }
            Spacer()
            ZStack {
                Circle()
                    .fill(Color.rixoOrange)
                    .frame(width: 44, height: 44)
                Text(authService.currentUser?.initials ?? "??")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
    }

    private var summaryCards: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                SummaryCard(
                    title: "Aktivní smlouvy",
                    value: "\(viewModel.activeContractsCount)",
                    subtitle: "pojistek",
                    icon: "doc.text.fill",
                    color: .rixoOrange
                )
                SummaryCard(
                    title: "Celková ochrana",
                    value: viewModel.totalCoverage.czk,
                    subtitle: "pojistné krytí",
                    icon: "shield.fill",
                    color: Color(hex: "#34C759")
                )
                SummaryCard(
                    title: "Měsíční platba",
                    value: viewModel.totalMonthlyPremium.czk,
                    subtitle: "za všechna poj.",
                    icon: "creditcard.fill",
                    color: Color(hex: "#007AFF")
                )
            }
            .padding(.horizontal, 20)
        }
    }

    private var deadlineAlertsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Důležité termíny", icon: "exclamationmark.triangle.fill", iconColor: .rixoWarning) {
                showDeadlineMonitor = true
            }
            VStack(spacing: 8) {
                ForEach(viewModel.urgentDeadlines) { deadline in
                    UrgentDeadlineAlert(deadline: deadline)
                }
            }
        }
        .padding(.horizontal, 20)
    }

    private var upcomingPaymentsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Blížící se platby", icon: "calendar.badge.clock", iconColor: .rixoOrange)
            VStack(spacing: 8) {
                ForEach(viewModel.upcomingPayments) { contract in
                    UpcomingPaymentCard(contract: contract)
                }
            }
        }
        .padding(.horizontal, 20)
    }

    private var contractsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionHeader(title: "Moje smlouvy", icon: "doc.text.fill", iconColor: .rixoOrange) {
                showAddContract = true
            }

            if contractService.isLoading {
                InlineLoadingView(message: "Načítám smlouvy...")
                    .padding(.horizontal, 20)
            } else if viewModel.contracts.isEmpty {
                EmptyContractsView {
                    showAddContract = true
                }
                .padding(.horizontal, 20)
            } else {
                VStack(spacing: 12) {
                    ForEach(viewModel.contracts) { contract in
                        ContractCardView(
                            contract: contract,
                            onTap: { selectedContract = contract },
                            onGreenCard: {
                                selectedContractForDoc = contract
                                showGreenCard = true
                            },
                            onTravelCard: {
                                selectedContractForDoc = contract
                                showTravelCard = true
                            }
                        )
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(color.opacity(0.12))
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 16))
                }
                Spacer()
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.rixoTextPrimary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(.rixoTextSecondary)
            }

            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.rixoTextSecondary)
        }
        .padding(16)
        .frame(width: 160)
        .background(Color.rixoCard)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.06), radius: 8, x: 0, y: 2)
    }
}

struct SectionHeader: View {
    let title: String
    var icon: String? = nil
    var iconColor: Color = .rixoOrange
    var action: (() -> Void)? = nil
    var actionLabel: String = "Vše"

    var body: some View {
        HStack(spacing: 8) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(iconColor)
            }
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.rixoTextPrimary)
            Spacer()
            if let action = action {
                Button(action: action) {
                    Text(actionLabel)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.rixoOrange)
                }
            }
        }
    }
}

struct UpcomingPaymentCard: View {
    let contract: Contract

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(contract.insurerColor)
                    .frame(width: 40, height: 40)
                Text(contract.insurerInitials)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(contract.type.displayName)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.rixoTextPrimary)
                Text("Splatnost: \(contract.endDate.czechFormatted)")
                    .font(.system(size: 12))
                    .foregroundColor(.rixoWarning)
            }

            Spacer()

            Text(contract.annualPremium.czk)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.rixoOrange)
        }
        .padding(14)
        .background(Color.rixoCard)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.rixoWarning.opacity(0.2), lineWidth: 1)
        )
    }
}

struct EmptyContractsView: View {
    let action: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "doc.badge.plus")
                .font(.system(size: 48))
                .foregroundColor(.rixoOrange.opacity(0.5))

            VStack(spacing: 8) {
                Text("Zatím nemáte žádné smlouvy")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                Text("Přidejte svou první pojistnou smlouvu nebo použijte naše srovnání k nalezení té nejlepší nabídky.")
                    .font(.system(size: 14))
                    .foregroundColor(.rixoTextSecondary)
                    .multilineTextAlignment(.center)
            }

            RixoButton(title: "Porovnat pojištění", action: action)
        }
        .padding(24)
        .background(Color.rixoCard)
        .cornerRadius(16)
    }
}

#Preview {
    let cs = ContractService()
    let ds = DeadlineService()
    return DashboardView(contractService: cs, deadlineService: ds)
        .environmentObject(AuthService())
        .environmentObject(cs)
        .environmentObject(ds)
}
