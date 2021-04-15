FROM nginx

# Loading the application
COPY src /usr/share/nginx/html

# Loading the data
COPY data/alpen.geojson /usr/share/nginx/html/data/alpen.geojson
