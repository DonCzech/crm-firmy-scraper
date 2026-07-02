import Foundation
import SwiftUI
import PhotosUI

class ContractReviewViewModel: ObservableObject {
    @Published var selectedTab: ReviewTab = .upload
    @Published var isProcessing: Bool = false
    @Published var processingProgress: Double = 0
    @Published var processingMessage: String = ""
    @Published var reviewCompleted: Bool = false
    @Published var rixoScore: Double = 0
    @Published var selectedImage: UIImage? = nil
    @Published var photoPickerItem: PhotosPickerItem? = nil

    // POA form
    @Published var poaFirstName: String = ""
    @Published var poaLastName: String = ""
    @Published var poaBirthDate: Date = Calendar.current.date(byAdding: .year, value: -30, to: Date())!
    @Published var poaAddress: String = ""
    @Published var poaPhone: String = ""
    @Published var poaEmail: String = ""

    enum ReviewTab: CaseIterable {
        case upload
        case poa

        var label: String {
            switch self {
            case .upload: return "Nahrát dokument"
            case .poa: return "Plná moc"
            }
        }
    }

    func processDocument() async {
        await MainActor.run {
            isProcessing = true
            processingProgress = 0
            processingMessage = "Analyzuji dokument..."
        }

        let messages = [
            "Analyzuji dokument...",
            "Zpracovávám smluvní podmínky...",
            "Porovnávám s databází...",
            "Vyhodnocuji RIXO Index...",
            "Dokončuji analýzu..."
        ]

        for (index, message) in messages.enumerated() {
            try? await Task.sleep(nanoseconds: 600_000_000)
            await MainActor.run {
                processingMessage = message
                processingProgress = Double(index + 1) / Double(messages.count)
            }
        }

        await MainActor.run {
            rixoScore = Double.random(in: 5.0...9.5).rounded(toPlaces: 1)
            isProcessing = false
            reviewCompleted = true
        }
    }

    func submitPOA() async {
        await MainActor.run { isProcessing = true }
        try? await Task.sleep(nanoseconds: 2_000_000_000)
        await MainActor.run {
            rixoScore = Double.random(in: 5.0...9.5).rounded(toPlaces: 1)
            isProcessing = false
            reviewCompleted = true
        }
    }
}
