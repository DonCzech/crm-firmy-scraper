import Foundation
import SwiftUI

enum InsuranceType: String, Codable, CaseIterable {
    case povinneRuceni = "povinne_ruceni"
    case havarijski = "havarijski"
    case povinneHavarijski = "povinne_havarijski"
    case zivotni = "zivotni"
    case urazove = "urazove"
    case domacnost = "domacnost"
    case nemovitost = "nemovitost"
    case cestovni = "cestovni"
    case odpovednostObcan = "odpovednost_obcan"
    case odpovednostZamestnanec = "odpovednost_zamestnanec"
    case mazlicek = "mazlicek"
    case elektrokolobezka = "elektrokolobezka"
    case elektrina = "elektrina"
    case plyn = "plyn"
    case hypoteka = "hypoteka"
    case uver = "uver"

    var displayName: String {
        switch self {
        case .povinneRuceni: return "Povinné ručení"
        case .havarijski: return "Havarijní pojištění"
        case .povinneHavarijski: return "Povinné + havarijní"
        case .zivotni: return "Životní pojištění"
        case .urazove: return "Úrazové pojištění"
        case .domacnost: return "Pojištění domácnosti"
        case .nemovitost: return "Pojištění nemovitosti"
        case .cestovni: return "Cestovní pojištění"
        case .odpovednostObcan: return "Odpovědnost občana"
        case .odpovednostZamestnanec: return "Odpovědnost zaměstnance"
        case .mazlicek: return "Pojištění mazlíčků"
        case .elektrokolobezka: return "Pojištění e-koloběžky"
        case .elektrina: return "Energie – Elektřina"
        case .plyn: return "Energie – Plyn"
        case .hypoteka: return "Hypotéka"
        case .uver: return "Spotřebitelský úvěr"
        }
    }

    var shortName: String {
        switch self {
        case .povinneRuceni: return "Povinné ručení"
        case .havarijski: return "Havarijní"
        case .povinneHavarijski: return "POV + HAV"
        case .zivotni: return "Životní"
        case .urazove: return "Úrazové"
        case .domacnost: return "Domácnost"
        case .nemovitost: return "Nemovitost"
        case .cestovni: return "Cestovní"
        case .odpovednostObcan: return "Odpovědnost"
        case .odpovednostZamestnanec: return "Odpovědnost"
        case .mazlicek: return "Mazlíčci"
        case .elektrokolobezka: return "E-koloběžka"
        case .elektrina: return "Elektřina"
        case .plyn: return "Plyn"
        case .hypoteka: return "Hypotéka"
        case .uver: return "Úvěr"
        }
    }

    var iconName: String {
        switch self {
        case .povinneRuceni: return "car.fill"
        case .havarijski: return "car.2.fill"
        case .povinneHavarijski: return "car.fill"
        case .zivotni: return "heart.fill"
        case .urazove: return "bandage.fill"
        case .domacnost: return "house.fill"
        case .nemovitost: return "building.2.fill"
        case .cestovni: return "airplane"
        case .odpovednostObcan: return "person.fill"
        case .odpovednostZamestnanec: return "briefcase.fill"
        case .mazlicek: return "pawprint.fill"
        case .elektrokolobezka: return "figure.roll"
        case .elektrina: return "bolt.fill"
        case .plyn: return "flame.fill"
        case .hypoteka: return "house.circle.fill"
        case .uver: return "creditcard.fill"
        }
    }

    var color: Color {
        switch self {
        case .povinneRuceni, .havarijski, .povinneHavarijski: return Color(hex: "#E8542A")
        case .zivotni, .urazove: return Color(hex: "#FF2D55")
        case .domacnost, .nemovitost: return Color(hex: "#5856D6")
        case .cestovni: return Color(hex: "#007AFF")
        case .odpovednostObcan, .odpovednostZamestnanec: return Color(hex: "#FF9500")
        case .mazlicek: return Color(hex: "#34C759")
        case .elektrokolobezka: return Color(hex: "#30B0C7")
        case .elektrina: return Color(hex: "#FFD60A")
        case .plyn: return Color(hex: "#FF9F0A")
        case .hypoteka: return Color(hex: "#636366")
        case .uver: return Color(hex: "#AC8E68")
        }
    }
}

enum ContractStatus: String, Codable {
    case active = "active"
    case expiring = "expiring"
    case expired = "expired"

    var displayName: String {
        switch self {
        case .active: return "Aktivní"
        case .expiring: return "Vyprší brzy"
        case .expired: return "Vypršelo"
        }
    }

    var color: Color {
        switch self {
        case .active: return Color(hex: "#34C759")
        case .expiring: return Color(hex: "#FF9500")
        case .expired: return Color(hex: "#FF3B30")
        }
    }
}

enum DeadlineType: String, Codable {
    case stk = "stk"
    case vignette = "vignette"
    case payment = "payment"
    case other = "other"

    var displayName: String {
        switch self {
        case .stk: return "STK"
        case .vignette: return "Dálniční nálepka"
        case .payment: return "Platba pojistného"
        case .other: return "Jiný termín"
        }
    }

    var iconName: String {
        switch self {
        case .stk: return "wrench.and.screwdriver.fill"
        case .vignette: return "road.lanes"
        case .payment: return "creditcard.fill"
        case .other: return "calendar"
        }
    }
}
