import Foundation

extension Double {
    var czk: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "CZK"
        formatter.currencySymbol = "Kč"
        formatter.positiveFormat = "#,##0 ¤"
        formatter.groupingSeparator = "\u{00A0}" // non-breaking space
        formatter.groupingSize = 3
        formatter.maximumFractionDigits = 0
        formatter.minimumFractionDigits = 0
        return formatter.string(from: NSNumber(value: self)) ?? "\(Int(self)) Kč"
    }

    var czkDecimal: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "CZK"
        formatter.currencySymbol = "Kč"
        formatter.positiveFormat = "#,##0.00 ¤"
        formatter.groupingSeparator = "\u{00A0}"
        formatter.decimalSeparator = ","
        formatter.groupingSize = 3
        formatter.maximumFractionDigits = 2
        formatter.minimumFractionDigits = 2
        return formatter.string(from: NSNumber(value: self)) ?? String(format: "%.2f Kč", self)
    }

    var formatted: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = "\u{00A0}"
        formatter.groupingSize = 3
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: self)) ?? "\(Int(self))"
    }
}

extension Int {
    var czk: String {
        Double(self).czk
    }

    var formatted: String {
        Double(self).formatted
    }
}
