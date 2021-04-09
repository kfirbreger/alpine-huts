#!/bin/sh
docker run -d --name alpine-huts-dev -v src:/usr/share/nginx/html -p 8000:80 nginx:latest