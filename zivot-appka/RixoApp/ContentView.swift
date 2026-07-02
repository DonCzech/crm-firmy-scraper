import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authService: AuthService
    @EnvironmentObject var contractService: ContractService
    @EnvironmentObject var deadlineService: DeadlineService
    @EnvironmentObject var rewardsService: RewardsService

    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding: Bool = false
    @State private var selectedTab: Int = 0

    var body: some View {
        Group {
            if !hasSeenOnboarding {
                OnboardingView(showOnboarding: Binding(
                    get: { !hasSeenOnboarding },
                    set: { hasSeenOnboarding = !$0 }
                ))
            } else if !authService.isLoggedIn {
                LoginView(authService: authService)
            } else {
                mainTabView
            }
        }
    }

    private var mainTabView: some View {
        TabView(selection: $selectedTab) {
            DashboardView(contractService: contractService, deadlineService: deadlineService)
                .tabItem {
                    Label("Pojištění", systemImage: selectedTab == 0 ? "shield.fill" : "shield")
                }
                .tag(0)

            CompareMenuView()
                .tabItem {
                    Label("Srovnat", systemImage: selectedTab == 1 ? "chart.bar.fill" : "chart.bar")
                }
                .tag(1)

            RewardsView(rewardsService: rewardsService)
                .tabItem {
                    Label("Odměny", systemImage: selectedTab == 2 ? "gift.fill" : "gift")
                }
                .tag(2)

            SettingsView()
                .tabItem {
                    Label("Nastavení", systemImage: selectedTab == 3 ? "gearshape.fill" : "gearshape")
                }
                .tag(3)
        }
        .tint(.rixoOrange)
        .onAppear {
            let tabBarAppearance = UITabBarAppearance()
            tabBarAppearance.configureWithOpaqueBackground()
            tabBarAppearance.backgroundColor = UIColor.systemBackground
            UITabBar.appearance().standardAppearance = tabBarAppearance
            UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthService())
        .environmentObject(ContractService())
        .environmentObject(DeadlineService())
        .environmentObject(RewardsService())
}
