import SwiftUI

struct StepProgressView: View {
    let currentStep: Int
    let totalSteps: Int
    var title: String = ""

    var progress: Double {
        Double(currentStep) / Double(totalSteps)
    }

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text("Krok \(currentStep) z \(totalSteps)")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.rixoTextSecondary)
                Spacer()
                if !title.isEmpty {
                    Text(title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.rixoOrange)
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.15))
                        .frame(height: 6)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.rixoOrange)
                        .frame(width: geo.size.width * progress, height: 6)
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: 6)
        }
    }
}

struct StepIndicatorRow: View {
    let currentStep: Int
    let totalSteps: Int
    let stepTitles: [String]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 0) {
                ForEach(1...totalSteps, id: \.self) { step in
                    HStack(spacing: 0) {
                        VStack(spacing: 4) {
                            ZStack {
                                Circle()
                                    .fill(step <= currentStep ? Color.rixoOrange : Color.gray.opacity(0.2))
                                    .frame(width: 28, height: 28)

                                if step < currentStep {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(.white)
                                } else {
                                    Text("\(step)")
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(step == currentStep ? .white : .gray)
                                }
                            }

                            if step <= stepTitles.count {
                                Text(stepTitles[step - 1])
                                    .font(.system(size: 9))
                                    .foregroundColor(step <= currentStep ? .rixoOrange : .gray)
                                    .lineLimit(1)
                            }
                        }

                        if step < totalSteps {
                            Rectangle()
                                .fill(step < currentStep ? Color.rixoOrange : Color.gray.opacity(0.2))
                                .frame(width: 24, height: 2)
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        StepProgressView(currentStep: 3, totalSteps: 8, title: "SPZ vozidla")
        StepIndicatorRow(
            currentStep: 3,
            totalSteps: 6,
            stepTitles: ["Typ", "SPZ", "Vozidlo", "Řidič", "BŠP", "Kontakt"]
        )
    }
    .padding()
    .background(Color.rixoBackground)
}
