import SwiftUI

struct RixoButton: View {
    let title: String
    let action: () -> Void
    var style: ButtonStyle = .primary
    var isLoading: Bool = false
    var isDisabled: Bool = false
    var icon: String? = nil

    enum ButtonStyle {
        case primary, secondary, outline, danger, ghost
    }

    var body: some View {
        Button(action: {
            if !isLoading && !isDisabled { action() }
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(style == .outline ? .rixoOrange : .white)
                        .scaleEffect(0.8)
                }
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                }
                Text(title)
                    .font(.system(size: 16, weight: .semibold))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .foregroundColor(foregroundColor)
            .background(backgroundColor)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(borderColor, lineWidth: style == .outline ? 2 : 0)
            )
            .opacity(isDisabled ? 0.5 : 1.0)
        }
        .disabled(isLoading || isDisabled)
    }

    private var foregroundColor: Color {
        switch style {
        case .primary: return .white
        case .secondary: return .rixoNavy
        case .outline: return .rixoOrange
        case .danger: return .white
        case .ghost: return .rixoOrange
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .primary: return .rixoOrange
        case .secondary: return Color(hex: "#F0F0F0")
        case .outline: return .clear
        case .danger: return .rixoDanger
        case .ghost: return .clear
        }
    }

    private var borderColor: Color {
        switch style {
        case .outline: return .rixoOrange
        default: return .clear
        }
    }
}

struct RixoSmallButton: View {
    let title: String
    let action: () -> Void
    var style: RixoButton.ButtonStyle = .primary

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(style == .outline ? .rixoOrange : .white)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(style == .outline ? Color.clear : Color.rixoOrange)
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(style == .outline ? Color.rixoOrange : Color.clear, lineWidth: 1.5)
                )
        }
    }
}

#Preview {
    VStack(spacing: 16) {
        RixoButton(title: "Porovnat pojištění", action: {})
        RixoButton(title: "Registrovat se", action: {}, style: .secondary)
        RixoButton(title: "Přihlásit se", action: {}, style: .outline)
        RixoButton(title: "Smazat účet", action: {}, style: .danger)
        RixoButton(title: "Načítám...", action: {}, isLoading: true)
        RixoButton(title: "Nedostupné", action: {}, isDisabled: true)
    }
    .padding()
}
