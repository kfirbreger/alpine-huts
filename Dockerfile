FROM nginx

# Loading the application
COPY src /usr/share/nginx/html

# Loading the data
COPY data/at.json /usr/share/nginx/html/data/at.json
COPY data/ch.json /usr/share/nginx/html/data/ch.json
COPY data/fr.json /usr/share/nginx/html/data/fr.json
