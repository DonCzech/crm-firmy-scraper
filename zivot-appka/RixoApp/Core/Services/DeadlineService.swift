import Foundation
import Combine

class DeadlineService: ObservableObject {
    @Published var deadlines: [Deadline] = []
    @Published var isLoading: Bool = false

    init() {
        deadlines = Deadline.samples
    }

    var urgentDeadlines: [Deadline] {
        deadlines.filter { $0.isUrgent }.sorted { $0.daysRemaining < $1.daysRemaining }
    }

    var upcomingDeadlines: [Deadline] {
        deadlines.sorted { $0.daysRemaining < $1.daysRemaining }
    }

    func addDeadline(_ deadline: Deadline) {
        deadlines.append(deadline)
    }

    func removeDeadline(id: String) {
        deadlines.removeAll { $0.id == id }
    }

    func toggleNotification(id: String) {
        if let index = deadlines.firstIndex(where: { $0.id == id }) {
            deadlines[index].notificationsEnabled.toggle()
        }
    }

    func updateDeadline(_ deadline: Deadline) {
        if let index = deadlines.firstIndex(where: { $0.id == deadline.id }) {
            deadlines[index] = deadline
        }
    }

    func addDeadline(name: String, type: DeadlineType, date: Date) {
        let deadline = Deadline(
            id: UUID().uuidString,
            name: name,
            type: type,
            date: date,
            notificationsEnabled: true
        )
        deadlines.append(deadline)
    }
}
