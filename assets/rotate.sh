#!/bin/bash
echo $@
for im in $@
    do
        
        convert $im -rotate 90 $im
    done

