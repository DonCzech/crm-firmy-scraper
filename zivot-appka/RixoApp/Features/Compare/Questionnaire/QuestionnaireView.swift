import SwiftUI

struct QuestionnaireView: View {
    @Environment(\.dismiss) var dismiss
    @State private var currentQuestion = 0
    @State private var answers: [Bool] = Array(repeating: false, count: 5)
    @State private var showResults = false

    let questions: [(question: String, icon: String)] = [
        ("Máte auto?", "car.fill"),
        ("Vlastníte nemovitost?", "house.fill"),
        ("Cestujete pravidelně?", "airplane"),
        ("Máte rodinu nebo děti?", "person.2.fill"),
        ("Chcete chránit své příjmy?", "banknote.fill")
    ]

    var body: some View {
        NavigationStack {
            if showResults {
                questionnaireResults
            } else {
                questionnaireContent
            }
        }
    }

    private var questionnaireContent: some View {
        VStack(spacing: 0) {
            // Progress
            VStack(spacing: 8) {
                HStack {
                    Text("Otázka \(currentQuestion + 1) z \(questions.count)")
                        .font(.system(size: 13)).foregroundColor(.rixoTextSecondary)
                    Spacer()
                }
                ProgressView(value: Double(currentQuestion + 1), total: Double(questions.count))
                    .tint(.rixoOrange)
            }
            .padding(.horizontal, 24).padding(.top, 20).padding(.bottom, 16)

            Spacer()

            // Question
            VStack(spacing: 32) {
                ZStack {
                    Circle().fill(Color.rixoOrange.opacity(0.1))
                        .frame(width: 100, height: 100)
                    Image(systemName: questions[currentQuestion].icon)
                        .font(.system(size: 44)).foregroundColor(.rixoOrange)
                }
                .animation(.spring(response: 0.4), value: currentQuestion)

                Text(questions[currentQuestion].question)
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.rixoTextPrimary)
                    .multilineTextAlignment(.center)
                    .transition(.opacity.combined(with: .move(edge: .trailing)))
                    .animation(.easeInOut, value: currentQuestion)
            }
            .padding(.horizontal, 24)

            Spacer()

            // Answers
            VStack(spacing: 14) {
                Button(action: { answerQuestion(true) }) {
                    HStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 24)).foregroundColor(.white)
                        Text("ANO")
                            .font(.system(size: 20, weight: .bold)).foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity).frame(height: 60)
                    .background(Color.rixoSuccess).cornerRadius(16)
                }

                Button(action: { answerQuestion(false) }) {
                    HStack(spacing: 12) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24)).foregroundColor(.white)
                        Text("NE")
                            .font(.system(size: 20, weight: .bold)).foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity).frame(height: 60)
                    .background(Color.rixoDanger).cornerRadius(16)
                }
            }
            .padding(.horizontal, 24).padding(.bottom, 40)
        }
        .background(Color.rixoBackground.ignoresSafeArea())
        .navigationTitle("Doporučit produkt")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: { dismiss() }) { Image(systemName: "xmark").foregroundColor(.rixoTextSecondary) }
            }
        }
    }

    private var questionnaireResults: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(spacing: 12) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 48)).foregroundColor(.rixoOrange)
                    Text("Vaše doporučení")
                        .font(.system(size: 22, weight: .bold)).foregroundColor(.rixoTextPrimary)
                    Text("Na základě vašich odpovědí doporučujeme tyto produkty:")
                        .font(.system(size: 14)).foregroundColor(.rixoTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 20)

                VStack(spacing: 10) {
                    ForEach(recommendedProducts, id: \.type) { product in
                        RecommendedProductRow(
                            type: product.type,
                            reason: product.reason,
                            priority: product.priority
                        )
                    }
                }

                RixoButton(title: "Srovnat pojištění", action: { dismiss() })
                    .padding(.top, 8)

                Button(action: { dismiss() }) {
                    Text("Zavřít")
                        .font(.system(size: 15)).foregroundColor(.rixoTextSecondary)
                }
                .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
        }
        .background(Color.rixoBackground.ignoresSafeArea())
        .navigationTitle("Vaše doporučení")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Zavřít") { dismiss() }.foregroundColor(.rixoOrange)
            }
        }
    }

    private func answerQuestion(_ answer: Bool) {
        answers[currentQuestion] = answer
        withAnimation(.easeInOut(duration: 0.25)) {
            if currentQuestion < questions.count - 1 {
                currentQuestion += 1
            } else {
                showResults = true
            }
        }
    }

    struct ProductRecommendation {
        let type: InsuranceType
        let reason: String
        let priority: String
    }

    var recommendedProducts: [ProductRecommendation] {
        var products: [ProductRecommendation] = []

        // Q1: Máte auto?
        if answers[0] {
            products.append(ProductRecommendation(
                type: .povinneRuceni,
                reason: "Povinné ze zákona pro každé registrované vozidlo.",
                priority: "Povinné"
            ))
            products.append(ProductRecommendation(
                type: .havarijski,
                reason: "Chrání váš vůz při nehodě nebo krádeži.",
                priority: "Doporučené"
            ))
        }

        // Q2: Vlastníte nemovitost?
        if answers[1] {
            products.append(ProductRecommendation(
                type: .nemovitost,
                reason: "Ochrana vaší nemovitosti před živelnými škodami.",
                priority: "Doporučené"
            ))
            products.append(ProductRecommendation(
                type: .domacnost,
                reason: "Pojistěte vybavení domácnosti.",
                priority: "Doporučené"
            ))
        }

        // Q3: Cestujete?
        if answers[2] {
            products.append(ProductRecommendation(
                type: .cestovni,
                reason: "Nepostradatelné při cestách do zahraničí.",
                priority: "Doporučené"
            ))
        }

        // Q4: Rodina?
        if answers[3] {
            products.append(ProductRecommendation(
                type: .zivotni,
                reason: "Zabezpečte rodinu pro případ vašeho výpadku.",
                priority: "Doporučené"
            ))
        }

        // Q5: Příjmy?
        if answers[4] {
            products.append(ProductRecommendation(
                type: .urazove,
                reason: "Ochrana příjmů při pracovní neschopnosti.",
                priority: "Doporučené"
            ))
        }

        // Always recommend liability
        products.append(ProductRecommendation(
            type: .odpovednostObcan,
            reason: "Základní ochrana pro každého dospělého.",
            priority: "Zvažte"
        ))

        return products
    }
}

struct RecommendedProductRow: View {
    let type: InsuranceType
    let reason: String
    let priority: String

    var priorityColor: Color {
        switch priority {
        case "Povinné": return .rixoDanger
        case "Doporučené": return .rixoOrange
        default: return .rixoTextSecondary
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(type.color.opacity(0.12))
                    .frame(width: 48, height: 48)
                Image(systemName: type.iconName)
                    .font(.system(size: 20)).foregroundColor(type.color)
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(type.displayName)
                        .font(.system(size: 14, weight: .semibold)).foregroundColor(.rixoTextPrimary)
                    Spacer()
                    Text(priority)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 7).padding(.vertical, 3)
                        .background(priorityColor).cornerRadius(6)
                }
                Text(reason)
                    .font(.system(size: 12)).foregroundColor(.rixoTextSecondary)
                    .lineLimit(2)
            }
        }
        .padding(14)
        .background(Color.rixoCard).cornerRadius(14)
    }
}

#Preview { QuestionnaireView() }
