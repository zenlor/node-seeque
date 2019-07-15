lib/test/index.integration.js:
	node_modules/.bin/tsc

lib/test/index.test.js:
	node_modules/.bin/tsc

lib/index.js:
	node_modules/.bin/tsc

.PHONY: test
test: lib/test/index.test.js
	node_modules/.bin/tape $<

.PHONY: integration
integration: lib/test/index.integration.js
	node_modules/.bin/tape $<
