import SwiftUI

struct LoadingView: View {
    var message: String = "Načítám..."
    @State private var rotation: Double = 0
    @State private var dotCount: Int = 0
    let timer = Timer.publish(every: 0.4, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(Color.rixoOrange.opacity(0.2), lineWidth: 4)
                    .frame(width: 60, height: 60)

                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(Color.rixoOrange, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(rotation))
                    .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: rotation)
                    .onAppear { rotation = 360 }
            }

            Text(message + String(repeating: ".", count: dotCount))
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.rixoTextSecondary)
                .onReceive(timer) { _ in
                    dotCount = (dotCount + 1) % 4
                }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.rixoBackground)
    }
}

struct SearchLoadingView: View {
    @State private var animationPhase: Int = 0
    @State private var progress: Double = 0
    let timer = Timer.publish(every: 0.8, on: .main, in: .common).autoconnect()

    let messages = [
        "Prohledáváme 50+ pojišťoven...",
        "Porovnáváme nabídky...",
        "Optimalizujeme výsledky...",
        "Vyhledáváme nejlepší nabídky..."
    ]

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Animated logo
            ZStack {
                Circle()
                    .fill(Color.rixoOrange.opacity(0.1))
                    .frame(width: 100, height: 100)

                Image(systemName: "shield.fill")
                    .font(.system(size: 44))
                    .foregroundColor(.rixoOrange)
                    .scaleEffect(animationPhase % 2 == 0 ? 1.0 : 0.92)
                    .animation(.easeInOut(duration: 0.8), value: animationPhase)
            }

            VStack(spacing: 12) {
                Text(messages[animationPhase % messages.count])
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.rixoTextPrimary)
                    .multilineTextAlignment(.center)
                    .animation(.easeInOut, value: animationPhase)

                Text("Prosím čekejte")
                    .font(.system(size: 14))
                    .foregroundColor(.rixoTextSecondary)
            }

            // Progress bar
            VStack(spacing: 8) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.gray.opacity(0.15))
                            .frame(height: 6)
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.rixoOrange)
                            .frame(width: geo.size.width * progress, height: 6)
                            .animation(.easeInOut(duration: 0.8), value: progress)
                    }
                }
                .frame(height: 6)
                .padding(.horizontal, 40)

                Text("\(Int(progress * 100)) %")
                    .font(.system(size: 13))
                    .foregroundColor(.rixoTextSecondary)
            }

            // Insurer logos row
            HStack(spacing: 8) {
                ForEach(["ČP", "KOO", "ALZ", "ČSO", "GEN"], id: \.self) { initials in
                    ZStack {
                        Circle()
                            .fill(Color.gray.opacity(0.15))
                            .frame(width: 40, height: 40)
                        Text(initials)
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.rixoTextSecondary)
                    }
                }
            }

            Spacer()
        }
        .onReceive(timer) { _ in
            withAnimation {
                animationPhase += 1
                progress = min(progress + 0.25, 1.0)
            }
        }
    }
}

struct InlineLoadingView: View {
    var message: String = "Načítám..."

    var body: some View {
        HStack(spacing: 12) {
            ProgressView()
                .tint(.rixoOrange)
            Text(message)
                .font(.system(size: 14))
                .foregroundColor(.rixoTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.rixoCard)
        .cornerRadius(12)
    }
}

#Preview {
    LoadingView(message: "Načítám pojistky")
}
