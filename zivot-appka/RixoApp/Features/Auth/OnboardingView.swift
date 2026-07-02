import SwiftUI

struct OnboardingView: View {
    @State private var currentPage: Int = 0
    @Binding var showOnboarding: Bool

    let slides: [(icon: String, title: String, subtitle: String, color: Color)] = [
        (
            "shield.fill",
            "Srovnejte pojištění",
            "Porovnejte nabídky od 50+ pojišťoven na jednom místě. Ušetřete čas i peníze.",
            Color.rixoOrange
        ),
        (
            "banknote.fill",
            "Ušetřete peníze",
            "Průměrná úspora zákazníků RIXO je 4 200 Kč ročně. Přidejte se k nim ještě dnes.",
            Color(hex: "#34C759")
        ),
        (
            "doc.text.fill",
            "Mějte vše přehledně",
            "Všechny vaše smlouvy, doklady a termíny na jednom místě. Vždy po ruce.",
            Color(hex: "#007AFF")
        )
    ]

    var body: some View {
        ZStack {
            Color.rixoBackground.ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip button
                HStack {
                    Spacer()
                    Button(action: { showOnboarding = false }) {
                        Text("Přeskočit")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.rixoTextSecondary)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                    }
                }
                .padding(.top, 16)

                // Logo
                VStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(Color.rixoOrange)
                            .frame(width: 64, height: 64)
                        Image(systemName: "shield.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.white)
                    }
                    Text("RIXO")
                        .font(.system(size: 22, weight: .black))
                        .foregroundColor(.rixoOrange)
                        .tracking(2)
                }
                .padding(.top, 20)

                Spacer()

                // Page content
                TabView(selection: $currentPage) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        OnboardingSlide(
                            icon: slides[index].icon,
                            title: slides[index].title,
                            subtitle: slides[index].subtitle,
                            color: slides[index].color
                        )
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .frame(height: 420)
                .animation(.easeInOut, value: currentPage)

                Spacer()

                // Page indicator
                HStack(spacing: 8) {
                    ForEach(0..<slides.count, id: \.self) { index in
                        Capsule()
                            .fill(currentPage == index ? Color.rixoOrange : Color.gray.opacity(0.3))
                            .frame(width: currentPage == index ? 24 : 8, height: 8)
                            .animation(.easeInOut(duration: 0.3), value: currentPage)
                    }
                }
                .padding(.bottom, 32)

                // Action button
                VStack(spacing: 12) {
                    Button(action: {
                        if currentPage < slides.count - 1 {
                            withAnimation { currentPage += 1 }
                        } else {
                            showOnboarding = false
                        }
                    }) {
                        Text(currentPage < slides.count - 1 ? "Pokračovat" : "Začít zdarma")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(Color.rixoOrange)
                            .cornerRadius(16)
                    }

                    if currentPage == slides.count - 1 {
                        Button(action: { showOnboarding = false }) {
                            Text("Již mám účet – Přihlásit se")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.rixoOrange)
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
    }
}

struct OnboardingSlide: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color

    @State private var appeared: Bool = false

    var body: some View {
        VStack(spacing: 32) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.1))
                    .frame(width: 160, height: 160)

                Circle()
                    .fill(color.opacity(0.15))
                    .frame(width: 120, height: 120)

                Image(systemName: icon)
                    .font(.system(size: 60))
                    .foregroundColor(color)
                    .scaleEffect(appeared ? 1.0 : 0.5)
                    .opacity(appeared ? 1.0 : 0)
            }
            .animation(.spring(response: 0.6, dampingFraction: 0.7), value: appeared)

            VStack(spacing: 12) {
                Text(title)
                    .font(.system(size: 26, weight: .bold))
                    .foregroundColor(.rixoTextPrimary)
                    .multilineTextAlignment(.center)

                Text(subtitle)
                    .font(.system(size: 16))
                    .foregroundColor(.rixoTextSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 16)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 20)
            .animation(.easeOut(duration: 0.4).delay(0.15), value: appeared)
        }
        .padding(.horizontal, 24)
        .onAppear { appeared = true }
        .onDisappear { appeared = false }
    }
}

#Preview {
    OnboardingView(showOnboarding: .constant(true))
}
