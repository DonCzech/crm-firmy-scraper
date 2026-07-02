import Foundation

struct Address: Codable, Equatable {
    var street: String
    var houseNumber: String
    var city: String
    var postalCode: String

    init(street: String = "", houseNumber: String = "", city: String = "", postalCode: String = "") {
        self.street = street
        self.houseNumber = houseNumber
        self.city = city
        self.postalCode = postalCode
    }

    var formatted: String {
        "\(street) \(houseNumber), \(postalCode) \(city)"
    }
}

struct User: Codable, Identifiable, Equatable {
    var id: String
    var firstName: String
    var lastName: String
    var email: String
    var phone: String
    var address: Address
    var biometricEnabled: Bool

    init(
        id: String = UUID().uuidString,
        firstName: String = "",
        lastName: String = "",
        email: String = "",
        phone: String = "",
        address: Address = Address(),
        biometricEnabled: Bool = false
    ) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.phone = phone
        self.address = address
        self.biometricEnabled = biometricEnabled
    }

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var initials: String {
        let f = firstName.prefix(1)
        let l = lastName.prefix(1)
        return "\(f)\(l)".uppercased()
    }
}

// Sample data
extension User {
    static let sample = User(
        id: "user-001",
        firstName: "Jan",
        lastName: "Novák",
        email: "jan.novak@email.cz",
        phone: "+420 777 123 456",
        address: Address(street: "Václavské náměstí", houseNumber: "1", city: "Praha", postalCode: "110 00"),
        biometricEnabled: true
    )
}
