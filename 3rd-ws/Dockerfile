FROM amazonlinux:2023

WORKDIR /app

COPY stress .

RUN chmod +x stress

RUN yum install -y shadow-utils

CMD ["./stress"]
