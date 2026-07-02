import Foundation

extension Date {
    var czechFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd. MM. yyyy"
        formatter.locale = Locale(identifier: "cs_CZ")
        return formatter.string(from: self)
    }

    var czechShort: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d. M. yyyy"
        formatter.locale = Locale(identifier: "cs_CZ")
        return formatter.string(from: self)
    }

    var czechMonthYear: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "LLLL yyyy"
        formatter.locale = Locale(identifier: "cs_CZ")
        return formatter.string(from: self).capitalized
    }

    var czechDayMonth: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d. MMMM"
        formatter.locale = Locale(identifier: "cs_CZ")
        return formatter.string(from: self)
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var isTomorrow: Bool {
        Calendar.current.isDateInTomorrow(self)
    }

    var daysFromNow: Int {
        Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()),
                                         to: Calendar.current.startOfDay(for: self)).day ?? 0
    }
}

extension DateFormatter {
    static let czechDate: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "dd. MM. yyyy"
        f.locale = Locale(identifier: "cs_CZ")
        return f
    }()
}
