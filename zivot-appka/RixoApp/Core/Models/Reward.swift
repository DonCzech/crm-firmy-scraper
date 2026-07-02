import Foundation

struct Reward: Identifiable, Codable {
    var id: String
    var contractId: String
    var contractName: String
    var insurerName: String
    var amount: Double
    var percentage: Double
    var availableDate: Date
    var isAvailable: Bool
    var waitingDays: Int

    var progressValue: Double {
        if isAvailable { return 1.0 }
        let totalDays = 90.0
        let elapsed = totalDays - Double(waitingDays)
        return min(max(elapsed / totalDays, 0), 1)
    }

    var statusText: String {
        if isAvailable {
            return "Připraveno k výběru"
        } else {
            return "Čekáme – \(waitingDays) dní"
        }
    }
}

// Sample data
extension Reward {
    static let samples: [Reward] = [
        Reward(
            id: "rew-001",
            contractId: "contract-001",
            contractName: "Povinné ručení Škoda Octavia",
            insurerName: "Česká pojišťovna",
            amount: 144,
            percentage: 3.0,
            availableDate: Calendar.current.date(byAdding: .day, value: 45, to: Date())!,
            isAvailable: false,
            waitingDays: 45
        ),
        Reward(
            id: "rew-002",
            contractId: "contract-002",
            contractName: "Životní pojištění",
            insurerName: "Kooperativa",
            amount: 750,
            percentage: 5.0,
            availableDate: Calendar.current.date(byAdding: .day, value: -5, to: Date())!,
            isAvailable: true,
            waitingDays: 0
        ),
        Reward(
            id: "rew-003",
            contractId: "contract-003",
            contractName: "Pojištění domácnosti",
            insurerName: "Allianz",
            amount: 108,
            percentage: 3.0,
            availableDate: Calendar.current.date(byAdding: .day, value: 20, to: Date())!,
            isAvailable: false,
            waitingDays: 20
        )
    ]

    static var totalAvailable: Double {
        samples.filter { $0.isAvailable }.reduce(0) { $0 + $1.amount }
    }

    static var totalPending: Double {
        samples.filter { !$0.isAvailable }.reduce(0) { $0 + $1.amount }
    }
}

struct RewardRate: Identifiable {
    var id = UUID()
    var insuranceType: String
    var percentage: Double
    var description: String
}

extension RewardRate {
    static let rates: [RewardRate] = [
        RewardRate(insuranceType: "Povinné ručení", percentage: 3.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Havarijní pojištění", percentage: 3.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Životní pojištění", percentage: 5.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Úrazové pojištění", percentage: 5.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Pojištění domácnosti", percentage: 3.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Pojištění nemovitosti", percentage: 3.0, description: "z ročního pojistného"),
        RewardRate(insuranceType: "Cestovní pojištění", percentage: 4.0, description: "z ceny pojištění"),
        RewardRate(insuranceType: "Hypotéka", percentage: 0.1, description: "z výše úvěru")
    ]
}
