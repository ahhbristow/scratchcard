FROM node:8.15.0-onbuild

ARG CERT_PASSPHRASE
ENV PASSPHRASE=$CERT_PASSPHRASE

EXPOSE 4072
ENV MONGOLAB_URI mongodb://mongo/sessions

# Generate a self-signed certificate for testing over HTTPS
# Generate RSA key
RUN openssl genrsa -des3 -passout env:PASSPHRASE -out server.key.org 2048

# Generate the CSR
RUN openssl req -new -batch -subj "/C=UK/ST=/O=/localityName=/commonName=/organizationalUnitName=/emailAddress=/" -key server.key.org -out server.csr -passin env:PASSPHRASE

RUN openssl rsa -in server.key.org -out server.key -passin env:PASSPHRASE

# Generate the Cert
RUN openssl x509 -req -days 1 -in server.csr -signkey server.key -out server.crt

# Move the key and certificate to /certs
RUN mkdir certs
RUN mv server.key server.crt certs

# Remove the CSR
RUN rm server.csr

RUN npm install --unsafe-perm
