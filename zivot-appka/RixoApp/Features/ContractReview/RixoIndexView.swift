import SwiftUI

struct RixoIndexView: View {
    let score: Double
    var contractName: String = ""
    @Environment(\.dismiss) var dismiss

    @State private var animatedScore: Double = 0

    struct CategoryScore: Identifiable {
        let id = UUID()
        let name: String
        let score: Double
        let icon: String
    }

    var categories: [CategoryScore] {
        [
            CategoryScore(name: "Výše krytí", score: min(score + 0.5, 10), icon: "shield.fill"),
            CategoryScore(name: "Cena / kvalita", score: max(score - 0.5, 0), icon: "tag.fill"),
            CategoryScore(name: "Rozsah služeb", score: min(score + 0.3, 10), icon: "list.bullet.clipboard.fill"),
            CategoryScore(name: "Podmínky smlouvy", score: max(score - 0.3, 0), icon: "doc.text.fill"),
            CategoryScore(name: "Dostupnost asistence", score: min(score + 0.7, 10), icon: "phone.fill")
        ]
    }

    var scoreLabel: String {
        if score >= 8.0 { return "Výborná smlouva" }
        else if score >= 6.0 { return "Průměrná smlouva" }
        else { return "Podprůměrná smlouva" }
    }

    var scoreDescription: String {
        if score >= 8.0 {
            return "Vaše pojistná smlouva je nastavena výborně. Máte dobré krytí za skvělou cenu."
        } else if score >= 6.0 {
            return "Vaše pojistná smlouva je průměrná. Existují lepší možnosti, které by mohly lépe odpovídat vašim potřebám."
        } else {
            return "Vaše pojistná smlouva je podprůměrná. Doporučujeme zvážit změnu pojišťovny pro lepší ochranu za nižší cenu."
        }
    }

    var recommendations: [String] {
        if score >= 8.0 {
            return [
                "Smlouva je v pořádku",
                "Zkontrolujte platnost smlouvy",
                "Přidejte připojištění pro větší ochranu"
            ]
        } else if score >= 6.0 {
            return [
                "Zvažte navýšení pojistné částky",
                "Porovnejte nabídky konkurence",
                "Přidejte asistenční balíček"
            ]
        } else {
            return [
                "Doporučujeme okamžité srovnání",
                "Přeplatek může dosahovat 30–50 % ročně",
                "Naši specialisté vám pomohou s výběrem"
            ]
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Gauge
                    VStack(spacing: 12) {
                        if !contractName.isEmpty {
                            Text(contractName)
                                .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                        }

                        RixoIndexGauge(score: animatedScore, size: 220)
                            .onAppear {
                                withAnimation(.easeOut(duration: 1.5)) {
                                    animatedScore = score
                                }
                            }

                        Text(scoreLabel)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(scoreColor)

                        Text(scoreDescription)
                            .font(.system(size: 14))
                            .foregroundColor(.rixoTextSecondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(3)
                    }
                    .padding(.horizontal, 24)

                    // Category breakdown
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Hodnocení po kategoriích")
                            .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoTextPrimary)

                        ForEach(categories) { cat in
                            CategoryScoreRow(category: cat)
                        }
                    }
                    .padding(16).rixoCard()
                    .padding(.horizontal, 20)

                    // Recommendations
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Doporučení")
                            .font(.system(size: 15, weight: .semibold)).foregroundColor(.rixoTextPrimary)

                        ForEach(recommendations, id: \.self) { rec in
                            HStack(spacing: 10) {
                                Image(systemName: score >= 8.0 ? "checkmark.circle.fill" : "arrow.right.circle.fill")
                                    .foregroundColor(scoreColor).font(.system(size: 16))
                                Text(rec)
                                    .font(.system(size: 13)).foregroundColor(.rixoTextPrimary)
                            }
                        }
                    }
                    .padding(16).rixoCard()
                    .padding(.horizontal, 20)

                    // CTA
                    if score < 8.0 {
                        VStack(spacing: 12) {
                            Text("Chcete lepší smlouvu?")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Naši specialisté vám najdou lepší nabídku za stejnou nebo nižší cenu.")
                                .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                                .multilineTextAlignment(.center)
                            Button(action: { dismiss() }) {
                                Text("Srovnat pojištění")
                                    .font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                                    .frame(maxWidth: .infinity).frame(height: 50)
                                    .background(Color.rixoOrange).cornerRadius(14)
                            }
                        }
                        .padding(16).rixoCard()
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.vertical, 20)
            }
            .background(Color.rixoBackground.ignoresSafeArea())
            .navigationTitle("RIXO Index")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Hotovo") { dismiss() }.foregroundColor(.rixoOrange)
                }
            }
        }
    }

    private var scoreColor: Color {
        if score >= 8.0 { return .rixoSuccess }
        else if score >= 6.0 { return .rixoWarning }
        else { return .rixoDanger }
    }
}

struct CategoryScoreRow: View {
    let category: RixoIndexView.CategoryScore

    var scoreColor: Color {
        if category.score >= 8.0 { return .rixoSuccess }
        else if category.score >= 6.0 { return .rixoWarning }
        else { return .rixoDanger }
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: category.icon)
                .foregroundColor(scoreColor).font(.system(size: 16)).frame(width: 20)

            Text(category.name)
                .font(.system(size: 13)).foregroundColor(.rixoTextPrimary)

            Spacer()

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4).fill(Color.gray.opacity(0.15)).frame(height: 6)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(scoreColor)
                        .frame(width: geo.size.width * (category.score / 10.0), height: 6)
                }
            }
            .frame(width: 80, height: 6)

            Text(String(format: "%.1f", category.score))
                .font(.system(size: 12, weight: .semibold)).foregroundColor(scoreColor)
                .frame(width: 28)
        }
    }
}

#Preview {
    RixoIndexView(score: 7.2, contractName: "Povinné ručení")
}
