#!/bin/bash
# COPIED FROM: https://raw.githubusercontent.com/jessfraz/dotfiles/master/test.sh

set -e
set -o pipefail

ERRORS=()

# find all executables and run `shellcheck`
for f in $(find . -type f -not -path '*.git*' -not -path '*topsecret*' | sort -u); do
	if file "$f" | grep --quiet shell; then
		{
			shellcheck -x "$f" && echo "[OK]: successfully linted $f"
		} || {
			# add to errors
			ERRORS+=("$f")
		}
	fi
done

if [ ${#ERRORS[@]} -eq 0 ]; then
	echo "No errors, hooray"
else
	echo "These files failed shellcheck: ${ERRORS[*]}"
	exit 1
fi
