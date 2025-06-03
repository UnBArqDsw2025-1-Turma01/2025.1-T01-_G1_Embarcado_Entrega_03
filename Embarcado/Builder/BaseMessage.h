#ifndef BASEMESSAGE_H
#define BASEMESSAGE_H

#include <string>
#include <memory>
#include <Arduino.h> 

// Classe Base para todas as mensagens (Produto Abstrato)
class BaseMessage {
public:
    unsigned long timestamp;
    std::string messageType;

    BaseMessage(std::string type) : timestamp(millis()), messageType(std::move(type)) {}
    virtual ~BaseMessage() = default;

    virtual std::string getFormattedMessage() const {
        std::string formattedMsg = "\n╔══════════════════════════════════════════════════════════╗\n";
        formattedMsg += "\r║ Tipo      : " + messageType + "\r\n";

        char timeBuffer[64];
        snprintf(timeBuffer, sizeof(timeBuffer), "%lu ms", timestamp);
        formattedMsg += "║ Timestamp : " + std::string(timeBuffer) + "\r\n";

        formattedMsg += "║ Payload   :\r\n" + getPayloadDetails(); // getPayloadDetails deve retornar linhas já iniciando com "║  "
        formattedMsg += "\r\n╚══════════════════════════════════════════════════════════╝\n";
        return formattedMsg;
    }

protected:
    virtual std::string getPayloadDetails() const = 0;
};

#endif // BASEMESSAGE_H
