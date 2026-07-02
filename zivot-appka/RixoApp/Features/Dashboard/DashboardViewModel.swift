import Foundation
import Combine

class DashboardViewModel: ObservableObject {
    @Published var contracts: [Contract] = []
    @Published var deadlines: [Deadline] = []
    @Published var upcomingPayments: [Contract] = []
    @Published var isLoading: Bool = false
    @Published var isRefreshing: Bool = false

    private let contractService: ContractService
    private let deadlineService: DeadlineService
    private var cancellables = Set<AnyCancellable>()

    init(contractService: ContractService, deadlineService: DeadlineService) {
        self.contractService = contractService
        self.deadlineService = deadlineService

        contractService.$contracts
            .assign(to: &$contracts)

        deadlineService.$deadlines
            .map { $0.sorted { $0.daysRemaining < $1.daysRemaining }.prefix(3).map { $0 } }
            .assign(to: &$deadlines)

        contractService.$contracts
            .map { contracts in
                contracts.filter { $0.status == .expiring }
                    .sorted { $0.daysUntilExpiry < $1.daysUntilExpiry }
            }
            .assign(to: &$upcomingPayments)
    }

    var activeContractsCount: Int {
        contracts.filter { $0.status == .active || $0.status == .expiring }.count
    }

    var totalCoverage: Double {
        contracts.reduce(0) { $0 + $1.coverageLimit }
    }

    var totalMonthlyPremium: Double {
        contracts.reduce(0) { $0 + $1.monthlyPremium }
    }

    var urgentDeadlines: [Deadline] {
        deadlines.filter { $0.daysRemaining <= 30 }
    }

    func refresh() async {
        await MainActor.run { isRefreshing = true }
        await contractService.refresh()
        await MainActor.run { isRefreshing = false }
    }

    func load() {
        contractService.loadContracts()
    }
}
