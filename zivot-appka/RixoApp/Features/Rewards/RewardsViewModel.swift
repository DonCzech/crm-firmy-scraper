import Foundation
import Combine

class RewardsViewModel: ObservableObject {
    @Published var rewards: [Reward] = []
    @Published var isLoading: Bool = false
    @Published var showWithdrawConfirmation: Bool = false
    @Published var withdrawSuccess: Bool = false

    private let rewardsService: RewardsService
    private var cancellables = Set<AnyCancellable>()

    init(rewardsService: RewardsService) {
        self.rewardsService = rewardsService
        rewardsService.$rewards.assign(to: &$rewards)
        rewardsService.$isLoading.assign(to: &$isLoading)
    }

    var totalBalance: Double { rewardsService.totalBalance }
    var pendingBalance: Double { rewardsService.pendingBalance }
    var canWithdraw: Bool { rewardsService.canWithdraw }

    func withdraw() {
        Task {
            let success = await rewardsService.withdraw()
            await MainActor.run {
                self.withdrawSuccess = success
                self.showWithdrawConfirmation = false
            }
        }
    }

    func refresh() async {
        await rewardsService.refreshRewards()
    }
}
