#!/usr/bin/env bash

IMAGE=kg.biom/radar-women
VERSION=dev

docker build \
-t ${IMAGE}:${VERSION} \
-f ./env/dev/docker/Dockerfile . \
