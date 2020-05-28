FROM golang:1.14.3
WORKDIR /
COPY main.go main.go

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:3.9.6 
RUN apk --no-cache add ca-certificates
COPY --from=0 /app .
CMD ["./app"]  