import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

extension Color {
    static let rixoOrange = Color(hex: "#E8542A")
    static let rixoNavy = Color(hex: "#1A1A2E")
    static let rixoBackground = Color(hex: "#F5F5F7")
    static let rixoCard = Color.white
    static let rixoSuccess = Color(hex: "#34C759")
    static let rixoWarning = Color(hex: "#FF9500")
    static let rixoDanger = Color(hex: "#FF3B30")
    static let rixoTextPrimary = Color(hex: "#1A1A2E")
    static let rixoTextSecondary = Color(hex: "#6C6C80")
}
