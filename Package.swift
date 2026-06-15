// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "CourseReader",
    defaultLocalization: "en",
    platforms: [
        .macOS(.v15)
    ],
    targets: [
        .executableTarget(
            name: "CourseReader",
            path: "Sources/CourseReader",
            resources: [.process("Resources")]
        ),
        .testTarget(
            name: "CourseReaderTests",
            dependencies: ["CourseReader"],
            path: "Tests/CourseReaderTests"
        ),
    ]
)
