#!/bin/bash

find . -name '*v8*gz' -exec gunzip {} \; && find . -name '*v8*' -type f | xargs -I{} -n 1 sh -c "$(dirname $0)/write.sh {} $(PWD)/mergedSchedules.list"
