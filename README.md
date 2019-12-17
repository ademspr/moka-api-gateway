# Generating an SSL Cert

openssl req -new -sha256 -newkey rsa:2048 -nodes -keyout gateway-server.key -out gateway-server.csr
