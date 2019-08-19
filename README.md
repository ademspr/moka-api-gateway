# Moka Gateway


Uma applicação simples em Node.JS para mockar um API Gateway a fins de desenvolvimento.



# Generating an SSL Cert

openssl req -new -sha256 -newkey rsa:2048 -nodes -keyout gateway-server.key -out gateway-server.csr