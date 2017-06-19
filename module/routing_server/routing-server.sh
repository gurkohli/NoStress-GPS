#!/bin/sh
java -jar *.jar jetty.resourcebase=webapp config=config-example.properties datareader.file=british-columbia-latest.osm.pbf
