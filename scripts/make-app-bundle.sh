#!/bin/bash
set -euo pipefail

PRODUCT_NAME="CourseReader"
BINARY_PATH="${1:-.build/debug/$PRODUCT_NAME}"
APP_DIR="$PRODUCT_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

rm -rf "$APP_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

cp "$BINARY_PATH" "$MACOS_DIR/$PRODUCT_NAME"
cp support/Info.plist "$CONTENTS_DIR/"

# Generate a simple icon
ICON_DIR="$(mktemp -d)"
ICON_SET="$ICON_DIR/AppIcon.iconset"
mkdir -p "$ICON_SET"

# Generate a 512x512 PNG using Swift for a simple icon
cat > /tmp/genicon.swift << 'SWIFT_EOF'
import Cocoa
let size = CGSize(width: 512, height: 512)
let image = NSImage(size: size)
image.lockFocus()
let rect = NSRect(origin: .zero, size: size)
NSColor.controlAccentColor.setFill()
rect.fill()
let text = "CR" as NSString
let attrs: [NSAttributedString.Key: Any] = [
    .font: NSFont.boldSystemFont(ofSize: 180),
    .foregroundColor: NSColor.white
]
let textRect = NSRect(x: 0, y: 140, width: 512, height: 200)
text.draw(in: textRect, withAttributes: attrs)
image.unlockFocus()
let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)!
let rep = NSBitmapImageRep(cgImage: cgImage)
let png = rep.representation(using: .png, properties: [:])!
png.write(to: URL(fileURLWithPath: "\(CommandLine.arguments[1])/AppIcon.iconset/icon_512x512.png"))
SWIFT_EOF
swift /tmp/genicon.swift "$ICON_DIR" 2>/dev/null || true

if [ -f "$ICON_SET/icon_512x512.png" ]; then
    iconutil -c icns "$ICON_SET" -o "$RESOURCES_DIR/$PRODUCT_NAME.icns" 2>/dev/null || true
fi

rm -rf "$ICON_DIR" /tmp/genicon.swift

echo "Created $APP_DIR"
