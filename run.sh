#!/bin/sh
docker run -d --name alpine-huts-dev -v src:/usr/share/nginx/html -v data:/usr/share/nginx/html/data -p 8000:80 nginx:latest