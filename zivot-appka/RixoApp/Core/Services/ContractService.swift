import Foundation
import Combine

class ContractService: ObservableObject {
    @Published var contracts: [Contract] = []
    @Published var isLoading: Bool = false

    init() {
        loadContracts()
    }

    func loadContracts() {
        isLoading = true
        // Simulate network delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.contracts = Contract.sampleContracts
            self.isLoading = false
        }
    }

    func refresh() async {
        await MainActor.run { isLoading = true }
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        await MainActor.run {
            self.contracts = Contract.sampleContracts
            self.isLoading = false
        }
    }

    func addContract(_ contract: Contract) {
        contracts.append(contract)
    }

    func deleteContract(id: String) {
        contracts.removeAll { $0.id == id }
    }

    func updateContract(_ contract: Contract) {
        if let index = contracts.firstIndex(where: { $0.id == contract.id }) {
            contracts[index] = contract
        }
    }

    func contract(by id: String) -> Contract? {
        contracts.first { $0.id == id }
    }

    var activeContracts: [Contract] {
        contracts.filter { $0.status == .active || $0.status == .expiring }
    }

    var totalAnnualPremium: Double {
        contracts.reduce(0) { $0 + $1.annualPremium }
    }

    var totalCoverage: Double {
        contracts.reduce(0) { $0 + $1.coverageLimit }
    }

    var averageRixoIndex: Double {
        guard !contracts.isEmpty else { return 0 }
        return contracts.reduce(0) { $0 + $1.rixoIndex } / Double(contracts.count)
    }

    var expiringContracts: [Contract] {
        contracts.filter { $0.status == .expiring }
    }

    var contractsWithGreenCard: [Contract] {
        contracts.filter { $0.hasGreenCard }
    }

    var contractsWithTravelCard: [Contract] {
        contracts.filter { $0.hasTravelCard }
    }
}
