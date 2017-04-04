#!/bin/sh
echo on
echo "Getting mapbox binary from Gur's Dropbox"
wget https://www.dropbox.com/s/f360pm3wyibowlr/mbgl-node.node
echo "Renaming"
mv mbgl-node.node mapbox-gl-native.node
echo "Copying to where it needs to be"
cp mapbox-gl-native.node ./node_modules/tileserver-gl/node_modules/@mapbox/mapbox-gl-native/lib/
echo "Manually copy if copying failed"
