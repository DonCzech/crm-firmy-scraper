import Foundation
import Combine

class RewardsService: ObservableObject {
    @Published var rewards: [Reward] = []
    @Published var isLoading: Bool = false

    init() {
        rewards = Reward.samples
    }

    var totalBalance: Double {
        rewards.filter { $0.isAvailable }.reduce(0) { $0 + $1.amount }
    }

    var pendingBalance: Double {
        rewards.filter { !$0.isAvailable }.reduce(0) { $0 + $1.amount }
    }

    var canWithdraw: Bool {
        totalBalance >= 200
    }

    func withdraw() async -> Bool {
        await MainActor.run { isLoading = true }
        try? await Task.sleep(nanoseconds: 1_500_000_000)
        await MainActor.run {
            self.rewards = self.rewards.map { reward in
                var r = reward
                if r.isAvailable { r.amount = 0 }
                return r
            }
            self.isLoading = false
        }
        return true
    }

    func refreshRewards() async {
        await MainActor.run { isLoading = true }
        try? await Task.sleep(nanoseconds: 500_000_000)
        await MainActor.run {
            self.rewards = Reward.samples
            self.isLoading = false
        }
    }

    func rewardRate(for type: InsuranceType) -> Double {
        switch type {
        case .zivotni, .urazove: return 5.0
        case .hypoteka: return 0.1
        case .cestovni: return 4.0
        default: return 3.0
        }
    }
}
