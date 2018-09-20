#!/bin/bash
gsed ':a;N;$!ba;s/\n/ /g' $1 >> $2
printf "\n" >> $2
