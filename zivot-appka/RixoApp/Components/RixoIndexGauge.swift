import SwiftUI

struct RixoIndexGauge: View {
    let score: Double
    var size: CGFloat = 200

    private var normalizedScore: Double {
        score / 10.0
    }

    private var gaugeColor: Color {
        if score >= 8.0 { return .rixoSuccess }
        else if score >= 6.0 { return .rixoWarning }
        else { return .rixoDanger }
    }

    private var scoreLabel: String {
        if score >= 8.0 { return "Výborná smlouva" }
        else if score >= 6.0 { return "Průměrná smlouva" }
        else { return "Podprůměrná smlouva" }
    }

    var body: some View {
        VStack(spacing: 12) {
            ZStack {
                // Background arc
                Circle()
                    .trim(from: 0.0, to: 0.75)
                    .stroke(Color.gray.opacity(0.15), style: StrokeStyle(lineWidth: size * 0.1, lineCap: .round))
                    .rotationEffect(.degrees(135))
                    .frame(width: size, height: size)

                // Colored arc
                Circle()
                    .trim(from: 0.0, to: min(0.75 * normalizedScore, 0.75))
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [.rixoDanger, .rixoWarning, .rixoSuccess]),
                            center: .center,
                            startAngle: .degrees(135),
                            endAngle: .degrees(405)
                        ),
                        style: StrokeStyle(lineWidth: size * 0.1, lineCap: .round)
                    )
                    .rotationEffect(.degrees(135))
                    .frame(width: size, height: size)
                    .animation(.easeOut(duration: 1.2), value: score)

                // Center content
                VStack(spacing: 4) {
                    Text(String(format: "%.1f", score))
                        .font(.system(size: size * 0.22, weight: .bold))
                        .foregroundColor(.rixoTextPrimary)
                    Text("/ 10")
                        .font(.system(size: size * 0.1))
                        .foregroundColor(.rixoTextSecondary)
                }
                .offset(y: size * 0.05)

                // Needle indicator
                NeedleView(score: normalizedScore, radius: size * 0.35)
                    .frame(width: size, height: size)
                    .animation(.easeOut(duration: 1.2), value: score)
            }

            // Labels
            HStack {
                Text("0")
                    .font(.system(size: 11))
                    .foregroundColor(.rixoTextSecondary)
                Spacer()
                Text(scoreLabel)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(gaugeColor)
                Spacer()
                Text("10")
                    .font(.system(size: 11))
                    .foregroundColor(.rixoTextSecondary)
            }
            .frame(width: size)
        }
    }
}

struct NeedleView: View {
    let score: Double
    let radius: CGFloat

    private var angle: Double {
        -135 + (score * 270)
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.rixoTextPrimary)
                .frame(width: 10, height: 10)

            Rectangle()
                .fill(Color.rixoTextPrimary)
                .frame(width: 2, height: radius)
                .offset(y: -radius / 2)
                .rotationEffect(.degrees(angle))
        }
        .animation(.easeOut(duration: 1.2), value: score)
    }
}

#Preview {
    VStack(spacing: 40) {
        RixoIndexGauge(score: 8.5)
        RixoIndexGauge(score: 6.2, size: 160)
        RixoIndexGauge(score: 4.1, size: 140)
    }
    .padding()
    .background(Color.rixoBackground)
}
