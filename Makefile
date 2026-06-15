PRODUCT_NAME = CourseReader
SWIFT_FORMAT = xcrun swift-format

.PHONY: build build-strict test format format-check clean release run session check version bump-version

build:
	swift build

build-strict:
	swift build -Xswiftc -strict-concurrency=complete

test:
	swift test --verbose

format:
	@if command -v $(SWIFT_FORMAT) >/dev/null 2>&1; then \
		$(SWIFT_FORMAT) format --in-place --recursive Sources/ Tests/; \
		echo "Formatted Sources/ and Tests/"; \
	else \
		echo "$(SWIFT_FORMAT) not found"; \
		exit 1; \
	fi

format-check:
	@if command -v $(SWIFT_FORMAT) >/dev/null 2>&1; then \
		$(SWIFT_FORMAT) lint --recursive Sources/ Tests/; \
	else \
		echo "$(SWIFT_FORMAT) not found"; \
		exit 1; \
	fi

clean:
	swift package clean
	rm -rf .build

release:
	swift build -c release

version:
	@echo "Version: $$(plutil -extract CFBundleShortVersionString raw support/Info.plist 2>/dev/null || echo '0.0.0')"
	@echo "Build:   $$(plutil -extract CFBundleVersion raw support/Info.plist 2>/dev/null || echo '0')"

bump-version:
	@if [ -z "$(V)" ]; then echo "Usage: make bump-version V=1.2.3"; exit 1; fi
	plutil -replace CFBundleShortVersionString -string "$(V)" support/Info.plist
	@echo "Version bumped to $(V)"

run: build
	rm -rf "$(PRODUCT_NAME).app"
	./scripts/make-app-bundle.sh ".build/debug/$(PRODUCT_NAME)"
	open "$(PRODUCT_NAME).app"

check: format format-check build-strict test
