#!/bin/sh
docker run --rm --name alpine-huts-dev -v ~/develop/conopa/alpine-huts/src:/usr/share/nginx/html -v ~/develop/conopa/alpine-huts/data:/usr/share/nginx/html/data -p 8000:80 nginx:latest
