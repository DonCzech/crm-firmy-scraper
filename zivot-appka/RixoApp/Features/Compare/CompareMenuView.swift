import SwiftUI

struct CompareMenuView: View {
    @State private var selectedType: InsuranceType? = nil
    @State private var showQuestionnaire: Bool = false
    @State private var navigationPath = NavigationPath()

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        NavigationStack(path: $navigationPath) {
            ScrollView {
                VStack(spacing: 20) {
                    // Recommendation CTA
                    questionnaireCard

                    // Grid of categories
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Pojištění")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.rixoTextSecondary)
                            .padding(.horizontal, 20)

                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(insuranceTypes, id: \.self) { type in
                                InsuranceCategoryButton(type: type) {
                                    selectedType = type
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Energie & Finance")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.rixoTextSecondary)
                            .padding(.horizontal, 20)

                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(financeTypes, id: \.self) { type in
                                InsuranceCategoryButton(type: type) {
                                    selectedType = type
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.bottom, 24)
                .padding(.top, 8)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("Srovnat")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedType) { type in
                insuranceView(for: type)
            }
            .sheet(isPresented: $showQuestionnaire) {
                QuestionnaireView()
            }
        }
    }

    @ViewBuilder
    func insuranceView(for type: InsuranceType) -> some View {
        switch type {
        case .povinneRuceni, .havarijski, .povinneHavarijski:
            VehicleInsuranceView(initialType: type)
        case .zivotni, .urazove:
            LifeInsuranceView(initialType: type)
        case .cestovni:
            TravelInsuranceView()
        case .domacnost, .nemovitost:
            PropertyInsuranceView()
        case .odpovednostObcan, .odpovednostZamestnanec:
            LiabilityInsuranceView(initialType: type)
        case .mazlicek:
            PetInsuranceView()
        case .elektrina, .plyn:
            EnergyView(initialType: type)
        case .hypoteka:
            MortgageView()
        case .uver:
            MortgageView()
        default:
            VehicleInsuranceView(initialType: .povinneRuceni)
        }
    }

    private var insuranceTypes: [InsuranceType] {
        [.povinneRuceni, .havarijski, .povinneHavarijski,
         .zivotni, .urazove, .domacnost, .nemovitost,
         .cestovni, .odpovednostObcan, .odpovednostZamestnanec,
         .mazlicek, .elektrokolobezka]
    }

    private var financeTypes: [InsuranceType] {
        [.elektrina, .plyn, .hypoteka, .uver]
    }

    private var questionnaireCard: some View {
        Button(action: { showQuestionnaire = true }) {
            HStack(spacing: 16) {
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 56, height: 56)
                    Image(systemName: "questionmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.white)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text("Jaké pojištění potřebujete?")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    Text("Odpovězte na 5 otázek a my doporučíme ty správné produkty.")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.85))
                        .lineLimit(2)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(20)
            .background(
                LinearGradient(
                    colors: [Color.rixoOrange, Color(hex: "#C43E1A")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .cornerRadius(16)
            .padding(.horizontal, 20)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    CompareMenuView()
}
