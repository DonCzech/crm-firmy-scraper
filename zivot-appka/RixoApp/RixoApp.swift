import SwiftUI

@main
struct RixoApp: App {
    @StateObject private var authService = AuthService()
    @StateObject private var contractService = ContractService()
    @StateObject private var deadlineService = DeadlineService()
    @StateObject private var rewardsService = RewardsService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authService)
                .environmentObject(contractService)
                .environmentObject(deadlineService)
                .environmentObject(rewardsService)
        }
    }
}
